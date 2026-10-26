#!/usr/bin/env python3
"""Collect true global active ranking from Roblox's public Top Playing Now chart.

This endpoint supplies ranked Roblox-wide experiences (not the site's curated
candidate list). A failed fetch preserves the last successful published file.
"""
import json
from pathlib import Path
from datetime import datetime,timezone
from urllib.request import Request,urlopen
from urllib.parse import urlencode
ROOT=Path(__file__).resolve().parent.parent
PATH=ROOT/"roblox/data/global-active.json"
CATALOG=ROOT/"roblox/data/catalog.json"
STATE=ROOT/"roblox/data/state.json"
PARAMS=urlencode({"sessionId":"multilab-guide-public-charts","sortId":"top-playing-now","device":"computer","country":"all"})
API="https://apis.roblox.com/explore-api/v1/get-sort-content?"+PARAMS
def get(url):
    request=Request(url,headers={"User-Agent":"Mozilla/5.0 MULTI-LAB-GUIDE/1.0 (https://mlabg.com/roblox/)","Accept":"application/json"})
    with urlopen(request,timeout=23) as r:return json.load(r)
def main():
    source=get(API)
    if source.get("sortId")!="top-playing-now":raise RuntimeError("Unexpected Roblox chart")
    entries=source.get("games",[])
    if len(entries)<30:raise RuntimeError("Insufficient global chart entries")
    byid={}
    for e in entries:
        if e.get("isSponsored") or not e.get("rootPlaceId") or not e.get("universeId"):continue
        count=e.get("playerCount")
        if not isinstance(count,int) or count<0:continue
        byid[str(e["rootPlaceId"])]=e
    ordered=sorted(byid.values(),key=lambda e:e["playerCount"],reverse=True)[:30]
    if len(ordered)!=30:raise RuntimeError("Only "+str(len(ordered))+" usable entries")
    catalog={str(g["placeId"]):g for g in get_local(CATALOG).get("games",[])}
    state=get_local(STATE).get("games",{})
    ids=[str(e["universeId"]) for e in ordered]
    thumbs={}
    try:
        query=urlencode({"universeIds":",".join(ids),"size":"512x512","format":"Png","isCircular":"false"})
        for thumb in get("https://thumbnails.roblox.com/v1/games/icons?"+query).get("data",[]):
            if thumb.get("state")=="Completed" and str(thumb.get("imageUrl","")).startswith("https://tr.rbxcdn.com/"):
                thumbs[str(thumb.get("targetId"))]=thumb["imageUrl"]
    except Exception as ex: print("Icon API unavailable, keeping known images",repr(ex))
    result=[]
    for e in ordered:
        place=str(e["rootPlaceId"]);universe=str(e["universeId"])
        up=e.get("totalUpVotes");down=e.get("totalDownVotes")
        rating=round(up/(up+down)*100,1) if isinstance(up,int) and isinstance(down,int) and up+down>0 else None
        icon=thumbs.get(universe) or state.get(place,{}).get("icon")
        if not icon or not icon.startswith("https://tr.rbxcdn.com/"):icon=None
        result.append({"placeId":place,"universeId":universe,"name":catalog.get(place,{}).get("name") or e["name"],
             "officialName":e["name"],"playing":e["playerCount"],"rating":rating,"icon":icon})
    payload={"source":"Roblox public Explore API / top-playing-now, all countries and devices",
        "sourceUrl":"https://www.roblox.com/ja/charts/top-playing-now",
        "updatedAt":datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00","Z"),
        "totalSourceEntries":len(entries),"games":result}
    PATH.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("Global Roblox chart refreshed:",len(result),"first:",result[0]["name"],result[0]["playing"])
def get_local(path):
    try:return json.loads(path.read_text(encoding="utf-8"))
    except (OSError,ValueError):return {}
if __name__=="__main__":main()
