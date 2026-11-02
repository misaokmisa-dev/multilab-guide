#!/usr/bin/env python3
"""Keep Minecraft's global section tabs consistent across all static pages.

World scoring is a direct child of Minecraft Guide, not a Strategy subpage.
New link sits immediately to the left of the Server Diagnosis tab.
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MC = ROOT / "minecraft"
WORLD = MC / "world-development.html"
WORLD_LINK = "/minecraft/world-development.html"

NAV = re.compile(
    r'(<nav\b[^>]*class=["\'][^"\']*\bmlg-site-context-inner\b[^"\']*["\'][^>]*>)(.*?)(</nav\s*>)',
    re.I | re.S,
)
SERVER = re.compile(
    r'<a\b[^>]*href=["\']/minecraft/server\.html["\'][^>]*>.*?</a\s*>',
    re.I | re.S,
)
WORLD_LINK_RE = re.compile(
    r'<a\b[^>]*href=["\']/minecraft/world-development\.html["\'][^>]*>.*?</a\s*>',
    re.I | re.S,
)


def update_page(page: Path) -> tuple[bool, bool]:
    old = page.read_text(encoding="utf-8")
    located = False
    new_count = 0

    def rewrite(match: re.Match[str]) -> str:
        nonlocal located, new_count
        located = True
        content = match[2]
        content = WORLD_LINK_RE.sub("", content)
        # An unrelated page accidentally had these tabs replaced with
        # "MOD採点", "サーバー採点"; restore standard guide tab names.
        content = content.replace(">MOD採点</a>", ">MOD診断</a>")
        content = content.replace(">サーバー採点</a>", ">サーバー診断</a>")
        target = SERVER.search(content)
        if not target:
            raise RuntimeError(f"Cannot locate Server Diagnosis navigation: {page.relative_to(ROOT)}")
        current = ' aria-current="page"' if page == WORLD else ""
        link = (
            f'<a class="mlg-site-context-link" href="{WORLD_LINK}"{current}>'
            'ワールド採点</a>'
        )
        content = content[:target.start()] + link + content[target.start():]
        new_count += 1
        return match[1] + content + match[3]

    updated, subs = NAV.subn(rewrite, old)
    if subs > 1:
        raise RuntimeError(f"Unexpected duplicate nav: {page.relative_to(ROOT)}")
    if page == WORLD and not located:
        raise RuntimeError("World scoring page lacks the global section nav")
    if updated != old:
        page.write_text(updated, encoding="utf-8")
    return updated != old, located


def main() -> None:
    pages = sorted(MC.rglob("*.html"))
    if len(pages) < 1700:
        raise RuntimeError(f"Unexpected Minecraft page count: {len(pages)}")
    updated = nav_count = 0
    for page in pages:
        changed, has_nav = update_page(page)
        updated += changed
        nav_count += has_nav
    # Must remain stable for every future regeneration.
    for page in pages:
        before = page.read_text(encoding="utf-8")
        update_page(page)
        if page.read_text(encoding="utf-8") != before:
            raise RuntimeError(f"Non-idempotent nav: {page.relative_to(ROOT)}")

    world = WORLD.read_text(encoding="utf-8")
    if ('<a href="/minecraft/">マイクラガイド</a><span>›</span>'
            '<span>ワールド採点</span>') not in world:
        raise RuntimeError("World scoring breadcrumb is no longer directly under Minecraft")
    print(f"Minecraft nav checked: {len(pages)} pages, {nav_count} matching headers, "
          f"{updated} pages changed; World Score added before Server Diagnosis.")


if __name__ == "__main__":
    main()
