#!/usr/bin/env python3
"""Build a larger Japanese-labeled Roblox discovery catalog from public game listings.

Use factual titles/Roblox identifiers for discovery, never republish third-party
editorial descriptions. Cross-check current game statistics with Roblox API in
update_roblox.py. Failed pages are skipped, not replaced with invented games.
"""
from concurrent.futures import ThreadPoolExecutor, as_completed
from html import unescape
import json
from pathlib import Path
import re
import urllib.error
import urllib.request

ROOT=Path(__file__).resolve().parent.parent
PATH=ROOT/"roblox/data/catalog.json"
BASE="https://www.roburo.jp/genres/"
GROUPS={
  "roleplay":"ロールプレイ",
  "horror":"ホラー・サバイバル",
  "rpg":"RPG・冒険",
  "adventure":"RPG・冒険",
  "action":"対戦・アクション",
  "obby":"アスレ・パズル",
  "puzzle":"アスレ・パズル",
  "sports":"スポーツ",
  "simulator":"育成・生活",
  "short-play":None,
  "solo":None,
  "with-friends":None,
}
DEFAULTS={
 "ロールプレイ":("🏘️","sky",25,"街や役になりきって遊ぶロールプレイ"),
 "ホラー・サバイバル":("👻","dark",30,"恐怖や緊張感を楽しむサバイバル"),
 "RPG・冒険":("⚔️","blue",35,"探索と成長が楽しめる冒険ゲーム"),
 "対戦・アクション":("🎯","red",15,"ライバルと腕を競うアクション"),
 "アスレ・パズル":("🧩","violet",15,"ひらめきや操作でクリアを目指す"),
 "スポーツ":("🏆","orange",15,"スポーツやチーム戦を楽しむ"),
 "育成・生活":("🌱","forest",30,"自分のペースで育成や収集を楽しむ"),
}
def get(item):
  slug, page=item
  url=BASE+slug+"/" + ("?page="+str(page) if page>1 else "")
  try:
    req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 (compatible; MULTI-LAB-GUIDE/1.0; +https://mlabg.com/roblox/)"})
    with urllib.request.urlopen(req,timeout=14) as resp:
      data=resp.read().decode("utf-8")
  except (urllib.error.URLError,TimeoutError,UnicodeError) as exc:
    print("WARN fetch",url,str(exc),flush=True);return slug,page,[]
  items=[]
  # Each listing card links to a real root place ID. Names come from h3 headings.
  for m in re.finditer(r'<a\s+class="game-card-link"\s+href="/games/(\d+)/[^"]*"[^>]*>(.*?)</a>',data,re.S):
    place, markup=m.groups()
    h=re.search(r'<h3\b[^>]*>(.*?)</h3>',markup,re.S)
    if not h:continue
    title=unescape(re.sub(r'<[^>]*>',"",h.group(1))).strip()
    if not title or len(title)>120:continue
    uid=re.search(r'/data/game_images/(\d+)/',markup)
    items.append({"placeId":place,"name":title,"universeId":uid.group(1) if uid else None})
  print("source",slug,page,len(items),flush=True)
  return slug,page,items

def main():
  original=json.loads(PATH.read_text(encoding="utf-8"))
  old={str(g["placeId"]):g for g in original.get("games",[])}
  found={}
  tasks=[(slug,page) for slug in GROUPS for page in range(1,5)]
  # Moderate parallelism; no high-frequency repeated scraping.
  with ThreadPoolExecutor(max_workers=5) as ex:
    for future in as_completed([ex.submit(get,t) for t in tasks]):
      slug,page,items=future.result()
      for pos,item in enumerate(items):
        id=item["placeId"]
        entry=found.setdefault(id,{"placeId":id,"genres":set(),"short":False,"solo":False,"friends":False,"ranks":[]})
        if GROUPS[slug]:entry["genres"].add(GROUPS[slug])
        if slug=="short-play":entry["short"]=True
        if slug=="solo":entry["solo"]=True
        if slug=="with-friends":entry["friends"]=True
        entry["ranks"].append(page*30+pos)
        if not entry.get("name") or (GROUPS[slug] and (page<entry.get("namePage",9))):
          entry["name"]=item["name"];entry["namePage"]=page
        if item.get("universeId"):entry["universeId"]=item["universeId"]
  out=[]
  # Retain verified hand-curated entries and existing editorial descriptions.
  for id,source in found.items():
    prior=old.get(id)
    genre=(prior or {}).get("genre") or (sorted(source["genres"])[0] if source["genres"] else None)
    if not genre:continue
    if genre not in DEFAULTS:continue
    emoji,tone,minutes,desc=DEFAULTS[genre]
    name=source.get("name") or (prior or {}).get("name","")
    if not name:continue
    # Existing translations take precedence unless refreshed localized h3 is readable.
    if prior and prior.get("name") and any('\u3040'<=ch<='\u9fff' for ch in prior["name"]):
      name=prior["name"]
    if prior:
      entry=dict(prior)
      entry["name"]=name
    else:
      entry={"placeId":id,"name":name,"genre":genre,"icon":emoji,"tone":tone,"with":"both",
        "minutes":minutes,"difficulty":"ふつう","short":desc,
        "reason":desc+"。", "tags":[genre,"ROBLOX","人気ゲーム"]}
    entries=set(source["genres"])
    entries.add(genre)
    entry["genres"]=sorted(entries)
    entry["playModes"]=sorted((["solo"] if source["solo"] else [])+(["friends"] if source["friends"] else []))
    if source["solo"] and not source["friends"]:entry["with"]="solo"
    elif source["friends"] and not source["solo"]:entry["with"]="friends"
    elif source["solo"] and source["friends"]:entry["with"]="both"
    if source["short"]:entry["minutes"]=min(int(entry.get("minutes",15)),15)
    # No made-up current rank assigned to new items: live Roblox playing stats provide fallback ordering.
    if source.get("universeId"):entry["universeId"]=source["universeId"]
    entry["discoveryRank"]=min(source["ranks"])
    out.append(entry)
  # Keep curated games if the discovery source temporarily misses them.
  for id,entry in old.items():
    if id not in found:out.append(entry)
  out.sort(key=lambda x:(x.get("week",999),x.get("discoveryRank",999)))
  # Verify real ID, uniqueness, and fields.
  seen=set()
  clean=[]
  for g in out:
    id=str(g["placeId"])
    if id in seen or not re.fullmatch(r'\d{6,20}',id):continue
    seen.add(id);clean.append(g)
  if len(clean)<80:
    print("Only",len(clean),"usable games; aborting unsafe replacement.")
    raise SystemExit(2)
  original["games"]=clean
  original["date"]="2026-10-26"
  original["basis"]="既存の編集部選定作品と、外部の公開ゲーム一覧にあるタイトル・公式ゲームIDから候補を拡張。プレイヤー数と評価はRoblox公開APIで検証・更新します。週間・月間の実測順位は観測データが十分に集まってから掲載します。"
  original["discoverySource"]="https://www.roburo.jp/genres/"
  PATH.write_text(json.dumps(original,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
  print("CATALOG_READY",len(clean),"byGenre",{g:sum(1 for x in clean if g in x.get("genres",[x["genre"]])) for g in DEFAULTS},flush=True)
if __name__=="__main__":main()
