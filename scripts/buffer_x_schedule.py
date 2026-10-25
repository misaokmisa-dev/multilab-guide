#!/usr/bin/env python3
"""Schedule three X image posts for tomorrow using Buffer's official GraphQL API."""
import json
import os
import sys
import urllib.request
import urllib.error
from pathlib import Path
from datetime import datetime, date, time, timedelta, timezone
from zoneinfo import ZoneInfo

JST = ZoneInfo("Asia/Tokyo")
API = "https://api.buffer.com"
BASE = Path(__file__).resolve().parents[1]
TARGET_HANDLE = "sukura_kunn"
KEY = os.getenv("BUFFER_API_KEY", "").strip()

def gql(query):
    req = urllib.request.Request(
        API, data=json.dumps({"query": query}, ensure_ascii=False).encode("utf-8"),
        headers={"Authorization": "Bearer " + KEY, "Content-Type": "application/json"},
        method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            payload = json.load(response)
    except (urllib.error.HTTPError, urllib.error.URLError) as error:
        raise RuntimeError("Buffer API connection/authentication failed") from error
    if payload.get("errors"):
        raise RuntimeError("Buffer API error: " + json.dumps(payload["errors"], ensure_ascii=False))
    return payload.get("data", {})

def q(value):
    return json.dumps(value, ensure_ascii=False)

def get_channel():
    account = gql("query { account { organizations { id } } }").get("account") or {}
    matched = []
    for org in account.get("organizations") or []:
        channels = gql("query { channels(input: {organizationId: %s}) { id name service isQueuePaused } }" % q(org["id"])).get("channels") or []
        for item in channels:
            if (item.get("service") or "").lower() in ("twitter", "x") and (item.get("name") or "").lstrip("@").lower() == TARGET_HANDLE:
                matched.append((org["id"], item))
    if len(matched) != 1:
        raise RuntimeError("Bufferに @sukura_kunn のX連携が一意に見つかりません。接続先を確認してください。")
    org_id, channel = matched[0]
    if channel.get("isQueuePaused"):
        raise RuntimeError("BufferのX投稿キューが一時停止されています。")
    return org_id, channel["id"]

def scheduled_posts(org_id, channel_id):
    query = """query {
      posts(first: 100, input: {
        organizationId: %s
        filter: {status: [scheduled], channelIds: [%s]}
        sort: [{field: dueAt, direction: asc}]
      }) {
        edges { node {id text dueAt status} }
        pageInfo {hasNextPage}
      }
    }""" % (q(org_id), q(channel_id))
    result = gql(query).get("posts") or {}
    if (result.get("pageInfo") or {}).get("hasNextPage"):
        raise RuntimeError("100件以上の予約があるため重複を安全に確認できません。")
    return [e["node"] for e in (result.get("edges") or []) if e.get("node")]

def create_post(channel_id, text, utc_time, image_url):
    query = """mutation {
      createPost(input: {
        text: %s
        channelId: %s
        schedulingType: automatic
        mode: customScheduled
        dueAt: %s
        assets: [{image: {url: %s}}]
      }) {
        ... on PostActionSuccess {post {id text status dueAt}}
        ... on MutationError {message}
      }
    }""" % (q(text), q(channel_id), q(utc_time), q(image_url))
    data = gql(query).get("createPost") or {}
    if not data.get("post"):
        raise RuntimeError("投稿作成失敗: " + str(data.get("message") or data))
    return data["post"]

def main():
    if not KEY:
        raise RuntimeError("BUFFER_API_KEY が未設定です。GitHub ActionsのSecretを登録してください。")
    target = date.fromisoformat(os.environ["TARGET_DATE"]) if os.getenv("TARGET_DATE") else datetime.now(JST).date() + timedelta(days=1)
    plans = json.loads((BASE / "social" / "buffer_x_posts.json").read_text(encoding="utf-8"))
    entries = plans.get(target.isoformat())
    if not entries or len(entries) != 3:
        raise RuntimeError(target.isoformat() + " 用の画像付き投稿3件がありません。原稿を追加してください。")
    org_id, channel_id = get_channel()
    existing = scheduled_posts(org_id, channel_id)
    for entry in entries:
        hour, minute = map(int, entry["time"].split(":"))
        due_local = datetime.combine(target, time(hour, minute), JST)
        if due_local <= datetime.now(JST):
            raise RuntimeError("予約時刻が過去です: " + str(due_local))
        due_utc = due_local.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
        text = entry["text"].strip() + "\n" + "https://multilab-guide.mlguide.workers.dev/" + entry["page"].lstrip("/")
        if not entry.get("cat_image"):
            raise RuntimeError("猫画像の指定がありません。投稿は中止しました。")
        if len(text) > 270:
            raise RuntimeError("X投稿本文が長すぎます。短くしてください。")
        if any((p.get("dueAt") or "")[:16] == due_utc[:16] for p in existing):
            print("ALREADY SCHEDULED", target, entry["time"])
            continue
        if os.getenv("DRY_RUN") == "true":
            print("DRY RUN", due_utc, text, entry["cat_image"])
            continue
        post = create_post(channel_id, text, due_utc, entry["cat_image"])
        print("CREATED", target, entry["time"], post["id"])
        existing.append({"dueAt": due_utc, "text": text})
    if os.getenv("DRY_RUN") != "true":
        updated = scheduled_posts(org_id, channel_id)
        planned = {x["time"] for x in entries}
        confirmed = {
            datetime.fromisoformat(p["dueAt"].replace("Z", "+00:00")).astimezone(JST).strftime("%H:%M")
            for p in updated if p.get("dueAt") and datetime.fromisoformat(p["dueAt"].replace("Z", "+00:00")).astimezone(JST).date() == target
        }
        if not planned.issubset(confirmed):
            raise RuntimeError("Bufferの予約キューで3件すべてを確認できません: " + repr(sorted(confirmed)))
        print("VERIFIED", target, "3 X posts queued")

if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print("ERROR:", error, file=sys.stderr)
        sys.exit(1)
