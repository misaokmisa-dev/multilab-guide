#!/usr/bin/env python3
"""Keep crawlable Minecraft item-page English names/IDs in sync with registry.

Run AFTER update_item_seo_titles.py so newly generated 2026 item pages are
enriched as well. All 1,672 static pages gain the same clear terminology shown
by encyclopedia.js on interactive load. Idempotent and safe for repeat runs.
"""
from __future__ import annotations

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "minecraft/strategy/items"
DETAILS = BASE / "detail"
VERSION = "20261101english01"


def read_registry(file: str, var: str) -> dict:
    text = (BASE / file).read_text(encoding="utf-8")
    prefix = re.search(r"window\." + re.escape(var) + r"\s*=\s*", text)
    if not prefix:
        raise ValueError(f"Missing {var} in {file}")
    return json.loads(text[prefix.end():].strip().removesuffix(";"))


def update_page(path: Path, item: list, craftable: bool, version: str) -> bool:
    item_id, slug, jp, en, *_ = item
    original = path.read_text(encoding="utf-8")
    safe_english = html.escape(en)
    safe_id = html.escape("minecraft:" + slug)
    name_facts = (
        '<dl class="ency-name-facts">'
        '<div class="ency-name-fact"><dt>英語名（English）</dt>'
        '<dd class="ency-english-value">' + safe_english + '</dd></div>'
        '<div class="ency-name-fact ency-name-fact-id"><dt>アイテムID</dt>'
        '<dd class="ency-id-value">' + safe_id + '</dd></div></dl>'
    )
    # Accept both the original slug-only label and pages from previous runs.
    result, matches = re.subn(
        r'<p class="ency-en">[^<]*</p>|<dl class="ency-name-facts">.*?</dl>',
        lambda _: name_facts, original, count=1, flags=re.S,
    )
    if matches != 1:
        raise ValueError(f"Hero English-name field missing: {path}")
    method = "作り方と使い方" if craftable else "入手方法"
    desc = (
        f"【マイクラ】{jp}の英語名は「{en}」、"
        f"アイテムIDは「minecraft:{slug}」。{method}を紹介。"
        f"Minecraft Java {version}の情報を掲載。"
    )
    for attrib in ('name="description"', 'property="og:description"'):
        result, matches = re.subn(
            r'(<meta\s+' + re.escape(attrib) + r'\s+content=")[^"]*(")',
            lambda m: m.group(1) + html.escape(desc, quote=True) + m.group(2),
            result, count=1,
        )
        if matches != 1:
            raise ValueError(f"Description tag missing: {path} {attrib}")

    result = re.sub(
        r'(/minecraft/strategy/items/encyclopedia\.css\?v=)[A-Za-z0-9]+',
        lambda m: m.group(1) + VERSION, result,
    )
    result = re.sub(
        r'(/minecraft/strategy/items/encyclopedia\.js\?v=)[A-Za-z0-9]+',
        lambda m: m.group(1) + VERSION, result,
    )
    if result == original:
        return False
    path.write_text(result, encoding="utf-8")
    return True


def main() -> None:
    old_registry = read_registry("items-data.js", "MLG_ITEMS")
    new_registry = read_registry("items-2026-data.js", "MLG_ITEM_ADDITIONS")
    items = old_registry["items"] + new_registry["items"]
    recipes = read_registry("recipes-data.js", "MLG_RECIPES")
    recipes.update(read_registry("recipes-2026-data.js", "MLG_RECIPES_2026"))
    if len(items) != 1672 or len({v[1] for v in items}) != 1672:
        raise ValueError("Expected exactly 1,672 unique Minecraft items")

    count = 0
    for item in items:
        item_id, slug = item[:2]
        path = DETAILS / (slug + ".html")
        if not path.is_file():
            raise FileNotFoundError(f"Missing search-crawlable item page: {slug}")
        version = (item[6] if len(item) > 6 else old_registry["version"])
        if update_page(path, item, bool(recipes.get(str(item_id))), version):
            count += 1
    print(f"Validated {len(items)} item pages with correct English names and item IDs.")
    print(f"Updated {count} pre-rendered HTML pages and descriptions.")


if __name__ == "__main__":
    main()
