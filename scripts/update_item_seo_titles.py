#!/usr/bin/env python3
"""Synchronize Minecraft item-page search titles with actual crafting recipes.

The site has 1,504 pre-rendered HTML pages and 168 query-driven new items.
SEO-critical <title> and og:title must exist in the served HTML, not only JS.
Crafting-table recipe -> 【マイクラ】 ○○の作り方と使い方
No crafting-table recipe -> 【マイクラ】 ○○の入手方法
"""
from __future__ import annotations

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ITEMS = ROOT / "minecraft/strategy/items"
DETAILS = ITEMS / "detail"


def js_data(filename: str, variable: str):
    source = (ITEMS / filename).read_text(encoding="utf-8")
    match = re.search(r"window\." + re.escape(variable) + r"\s*=\s*", source)
    if not match:
        raise ValueError(f"Cannot locate {variable} in {filename}")
    return json.loads(source[match.end():].strip().removesuffix(";"))


def change_title(path: Path, title: str) -> bool:
    source = path.read_text(encoding="utf-8")
    safe_text = html.escape(title, quote=False)
    safe_attribute = html.escape(title, quote=True)
    updated, title_count = re.subn(
        r"<title>[^<]*</title>",
        lambda _: f"<title>{safe_text}</title>",
        source,
        count=1,
    )
    updated, og_count = re.subn(
        r'<meta\s+property="og:title"\s+content="[^"]*"',
        lambda _: f'<meta property="og:title" content="{safe_attribute}"',
        updated,
        count=1,
    )
    if title_count != 1 or og_count != 1:
        raise ValueError(f"Expected exactly one title and og:title: {path}")
    if updated == source:
        return False
    path.write_text(updated, encoding="utf-8")
    return True


def main() -> None:
    old = js_data("items-data.js", "MLG_ITEMS")["items"]
    new = js_data("items-2026-data.js", "MLG_ITEM_ADDITIONS")["items"]
    recipes = js_data("recipes-data.js", "MLG_RECIPES")
    recipes.update(js_data("recipes-2026-data.js", "MLG_RECIPES_2026"))
    if len(old) != 1504 or len(new) != 168:
        raise ValueError(f"Unexpected item registry size: {len(old)}+{len(new)}")
    if len({item[1] for item in old + new}) != 1672:
        raise ValueError("Item slugs are not unique")

    changed = created = obtained = 0
    missing = []
    for item_id, slug, japanese_name, *_ in old:
        has_craft = bool(recipes.get(str(item_id)))
        title = ("【マイクラ】 " + japanese_name
                 + ("の作り方と使い方" if has_craft else "の入手方法"))
        path = DETAILS / (slug + ".html")
        if not path.is_file():
            missing.append(str(path.relative_to(ROOT)))
            continue
        if change_title(path, title):
            changed += 1
        if has_craft:
            created += 1
        else:
            obtained += 1
    if missing:
        raise ValueError("Missing static detail pages: " + ", ".join(missing[:20]))

    # Query-driven 2026 item pages get their item-specific title in
    # encyclopedia.js; the fallback template also uses the new format.
    template_changed = change_title(
        DETAILS / "new.html", "【マイクラ】 追加アイテムの入手方法"
    )
    print(
        f"Validated {len(old)} existing item pages; {created} crafting titles, "
        f"{obtained} acquisition titles; {changed} updated. "
        f"Dynamic 2026 additions: {len(new)}; template changed: {template_changed}."
    )


if __name__ == "__main__":
    main()
