#!/usr/bin/env python3
"""Record Roblox public game stats without inventing historical numbers.

Observations are samples (not unique visitors). Roblox endpoints can change and
throttle requests. A failed fetch preserves the last published snapshot.
"""
import json
import os
import sys
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen
ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / "roblox/data/catalog.json"
STATE = ROOT / "roblox/data/state.json"
AGENT = "MULTI-LAB-GUIDE-RobloxStats/1.0 (+https://mlabg.com/roblox/)"
def fetch(url):
    request = Request(url, headers={"User-Agent": AGENT, "Accept": "application/json"})
    with urlopen(request, timeout=14) as r:
        return json.loads(r.read().decode("utf-8"))
def chunks(xs, size=25):
    for start in range(0, len(xs), size):
        yield xs[start:start+size]
def utc(s):
    return datetime.fromisoformat(s.replace("Z", "+00:00"))
def fresh_sorted(data):
    return sorted(data, key=lambda r: r.get("ts", ""))
def calculate(observations, place_ids, now):
    ranks = {}
    for key, days, min_span, min_samples in (("week",7,6,12),("month",30,27,55)):
        scored = []
        for place in place_ids:
            series=[(utc(o["ts"]),o["players"][place]) for o in observations if place in o.get("players",{}) and utc(o["ts"])>=now-timedelta(days=days)]
            if len(series)<min_samples or (series[-1][0]-series[0][0]).total_seconds()<min_span*86400:continue
            mean = round(sum(x[1] for x in series)/len(series))
            scored.append({"id":place,"value":mean,"samples":len(series)})
        ready=len(scored)>=max(8,len(place_ids)//2)
        ranks[key]={"ready":ready,"ranks":sorted(scored,key=lambda v:v["value"],reverse=True) if ready else []}
    latest=observations[-1] if observations else {}
    rising=[]
    for place in place_ids:
        if place not in latest.get("players",{}):continue
        nowplayers=latest["players"][place]
        if nowplayers<500:continue
        eligible=[o for o in observations[:-1] if place in o.get("players",{}) and 20 <= (now-utc(o["ts"])).total_seconds()/3600 <= 28]
        if not eligible:continue
        old=min(eligible,key=lambda o:abs((now-utc(o["ts"])).total_seconds()/3600-24))["players"][place]
        change=round((nowplayers-old)/max(500,old)*100,1)
        rising.append({"id":place,"value":change,"players":nowplayers,"previous":old})
    ready=len(rising)>=max(8,len(place_ids)//2)
    ranks["rising"]={"ready":ready,"ranks":sorted(rising,key=lambda v:v["value"],reverse=True) if ready else []}
    return ranks
def main():
    c=json.loads(CATALOG.read_text(encoding="utf-8"))
    state=json.loads(STATE.read_text(encoding="utf-8"))
    games=c["games"]
    ids=[str(g["placeId"]) for g in games]
    universe=state.get("universeIds",{})
    # Universe IDs are recorded alongside root place IDs by the discovery index.
    # Avoid requesting one endpoint per game when processing hundreds of games.
    for game in games:
        uid=game.get("universeId")
        if uid and str(uid).isdigit(): universe[str(game["placeId"])]=str(uid)
    for place in ids:
        if place in universe:continue
        try:
            v=fetch("https://apis.roblox.com/universes/v1/places/"+place+"/universe")
            if v.get("universeId"):universe[place]=str(v["universeId"])
        except Exception as e:
            print("Could not resolve",place,str(e),file=sys.stderr)
        time.sleep(.12)
    inv={v:k for k,v in universe.items() if k in ids}
    if not inv:
        print("Roblox API not available; keeping existing rankings.")
        return
    details={}
    for group in chunks(list(inv)):
        try:
            response=fetch("https://games.roblox.com/v1/games?"+urlencode({"universeIds":",".join(group)}))
            for game in response.get("data",[]):
                if str(game.get("id")) in inv:details[inv[str(game["id"])]]=game
        except Exception as e:print("Game details failed",str(e),file=sys.stderr)
        time.sleep(.2)
    if not details:
        print("No fresh game details: retaining previous state.")
        return
    images={}
    for group in chunks(list(inv)):
        try:
            url="https://thumbnails.roblox.com/v1/games/icons?"+urlencode({"universeIds":",".join(group),"size":"512x512","format":"Png","isCircular":"false"})
            for item in fetch(url).get("data",[]):
                if str(item.get("targetId")) in inv and item.get("state")=="Completed" and item.get("imageUrl"):images[inv[str(item["targetId"])]]=item["imageUrl"]
        except Exception as e:print("Thumbnail fetch failed",str(e),file=sys.stderr)
    votes={}
    for group in chunks(list(inv)):
        try:
            url="https://games.roblox.com/v1/games/votes?"+urlencode({"universeIds":",".join(group)})
            for v in fetch(url).get("data",[]):
                if str(v.get("id")) in inv:votes[inv[str(v["id"])]]=v
        except Exception as e:print("Votes fetch failed",str(e),file=sys.stderr)
    now=datetime.now(timezone.utc)
    stamp=now.isoformat(timespec="seconds").replace("+00:00","Z")
    summary=state.get("games",{})
    players={}
    for place,g in details.items():
        try:
            active=int(g["playing"])
            if active<0:continue
            prev=dict(summary.get(place,{}) or {})
            prev.update({"playing":active,"visits":int(g.get("visits") or 0),"favorites":int(g.get("favoritedCount") or 0),"sampledAt":stamp})
            if place in images:prev["icon"]=images[place]
            v=votes.get(place,{})
            up=v.get("upVotes",0);down=v.get("downVotes",0)
            if isinstance(up,int) and isinstance(down,int) and up+down>0:prev["rating"]=round(up/(up+down)*100,1)
            summary[place]=prev;players[place]=active
        except Exception as e:print("Invalid stats for",place,str(e),file=sys.stderr)
    if not players:
        print("No valid observations.")
        return
    observations=fresh_sorted(state.get("observations",[]))
    observations=[o for o in observations if utc(o["ts"])>=now-timedelta(days=32)]
    observations.append({"ts":stamp,"players":players})
    state.update({"updatedAt":stamp,"games":summary,"observations":observations,"universeIds":universe,"rankings":calculate(observations,ids,now)})
    STATE.write_text(json.dumps(state,ensure_ascii=False,indent=2,sort_keys=True)+"\n",encoding="utf-8")
    print("Recorded",len(players),"of",len(ids),"games at",stamp,"history:",len(observations))
if __name__=="__main__":main()
