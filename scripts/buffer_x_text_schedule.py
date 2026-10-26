#!/usr/bin/env python3
"""Publish only verified TEXT posts via Buffer X. Free tier: max 10 queued at once.

Source of truth is the publicly committed schedule in social/buffer_x_text_posts.json.
Repo Actions secret BUFFER_API_KEY is used exclusively in GitHub Actions.
"""
import json, os, sys
from datetime import datetime, date, time, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

sys.path.insert(0,str(Path(__file__).resolve().parent))
import buffer_x_schedule as b

JST=ZoneInfo("Asia/Tokyo")
DATA=Path(__file__).resolve().parent.parent/"social/buffer_x_text_posts.json"
CAPACITY=int(os.getenv("MAX_BUFFER_QUEUE","10"))
def when(day, label):
    hour,minute=map(int,label.split(":"))
    if hour<11 and hour!=0:raise ValueError("time outside 11-25: "+label)
    if hour>25:raise ValueError("time beyond 25: "+label)
    d=date.fromisoformat(day)+timedelta(days=hour//24)
    return datetime.combine(d,time(hour%24,minute),JST)
def create_text(channel,body,utc_time):
    query=('mutation { createPost(input: {text: %s, channelId: %s, '
           'schedulingType: automatic, mode: customScheduled, dueAt: %s}) '
           '{ ... on PostActionSuccess {post {id status dueAt text}} '
           '... on MutationError {message} } }') % (b.q(body),b.q(channel),b.q(utc_time))
    response=b.gql(query).get("createPost") or {}
    post=response.get("post")
    if not post:raise RuntimeError("BUFFER_CREATE_ERROR: "+str(response.get("message") or response))
    return post
def main():
    if not b.KEY:raise RuntimeError("BUFFER_API_KEY missing: no posts were created")
    org,channel=b.get_channel()
    planned=json.loads(DATA.read_text(encoding="utf-8"))
    existing=b.scheduled_posts(org,channel)
    print("BUFFER_X_CONNECTED TRUE; QUEUE_START",len(existing))
    if not 1<=CAPACITY<=10:raise RuntimeError("Safe free-plan capacity must be 1..10")
    occupied={p["dueAt"][:16]:p for p in existing if p.get("dueAt")}
    confirmed_ids=[]
    available=max(0,CAPACITY-len(existing))
    now=datetime.now(JST)
    for day,entries in sorted(planned.items()):
        if len(entries)!=4:raise RuntimeError("Four text posts required for "+day)
        for entry in entries:
            due=when(day,entry["time"])
            if due<=now:continue
            utc=due.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
            if utc[:16] in occupied:
                print("ALREADY_QUEUED",day,entry["time"],occupied[utc[:16]].get("id"));continue
            text=entry["text"].strip()
            if not text or len(text)>270:raise RuntimeError("Invalid X text for "+day+" "+entry["time"])
            if available<=0:
                print("QUEUE_AT_LIMIT",CAPACITY,"remaining dates deferred until tomorrow");break
            post=create_text(channel,text,utc)
            confirmed_ids.append(post["id"])
            occupied[utc[:16]]={"id":post["id"],"dueAt":utc}
            available-=1
            print("BUFFER_CREATED",day,entry["time"],post["id"])
        if available<=0:break
    latest=b.scheduled_posts(org,channel)
    have={p["id"] for p in latest}
    if not all(i in have for i in confirmed_ids):raise RuntimeError("BUFFER_QUEUE_VERIFY_FAILED missing "+str(set(confirmed_ids)-have))
    if len(latest)>CAPACITY:raise RuntimeError("Unexpected queue beyond free capacity")
    print("BUFFER_VERIFIED_QUEUED",len(latest),"NEW",len(confirmed_ids))
    if latest:
        for p in latest:
            print("BUFFER_SLOT",p["dueAt"],p["id"])
if __name__=="__main__":
    try:main()
    except Exception as ex:
        print("BUFFER_SCHEDULER_ERROR",repr(ex),file=sys.stderr)
        sys.exit(1)
