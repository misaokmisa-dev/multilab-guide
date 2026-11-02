#!/usr/bin/env python3
"""Keep every Minecraft guide HTML search title prefixed with 【マイクラ】.

Updates actual static HTML <title> tags (not just client-side document.title),
so search crawlers see the label in the served source. Also keeps existing
Open Graph titles consistent without modifying headings, URLs, or page bodies.
Idempotent: rerunning it never duplicates the prefix.
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MINECRAFT = ROOT / "minecraft"
PREFIX = "【マイクラ】"
WORLD_TITLE = "【マイクラ】 ワールド発展度採点 【Minecraft】"

TITLE = re.compile(r"(<title\b[^>]*>)(.*?)(</title\s*>)", re.I | re.S)
OG_META = re.compile(
    r"<meta\b(?=[^>]*\bproperty\s*=\s*(['\"])og:title\1)[^>]*>",
    re.I | re.S,
)
CONTENT_ATTR = re.compile(r"(\bcontent\s*=\s*)(['\"])(.*?)\2", re.I | re.S)


def normalize(text: str, exact_world_title: bool = False) -> str:
    original = text.strip()
    if exact_world_title:
        return WORLD_TITLE
    return original if original.startswith(PREFIX) else PREFIX + " " + original


def update_page(page: Path) -> tuple[bool, bool]:
    old = page.read_text(encoding="utf-8")
    exact = page == MINECRAFT / "world-development.html"
    title_count = 0
    og_count = 0

    def replace_title(match: re.Match[str]) -> str:
        nonlocal title_count
        title_count += 1
        return match[1] + normalize(match[2], exact) + match[3]

    new = TITLE.sub(replace_title, old, count=1)
    if title_count != 1:
        raise RuntimeError(f"No valid <title> tag: {page.relative_to(ROOT)}")

    def replace_og(match: re.Match[str]) -> str:
        nonlocal og_count
        og_count += 1

        def replace_value(attr: re.Match[str]) -> str:
            return attr[1] + attr[2] + normalize(attr[3], exact) + attr[2]

        result, n = CONTENT_ATTR.subn(replace_value, match[0], count=1)
        if n != 1:
            raise RuntimeError(f"og:title has no content: {page.relative_to(ROOT)}")
        return result

    new = OG_META.sub(replace_og, new, count=1)
    if new != old:
        page.write_text(new, encoding="utf-8")
        return True, bool(og_count)
    return False, bool(og_count)


def main() -> None:
    pages = sorted(MINECRAFT.rglob("*.html"))
    if len(pages) < 1700:
        raise RuntimeError(f"Unexpectedly few Minecraft HTML pages: {len(pages)}")
    changed = og_pages = 0
    for page in pages:
        wrote, has_og = update_page(page)
        changed += wrote
        og_pages += has_og

    world = (MINECRAFT / "world-development.html").read_text(encoding="utf-8")
    if f"<title>{WORLD_TITLE}</title>" not in world:
        raise RuntimeError("Exact world development title is missing")
    # A second run must be a no-op: important for recurring content generation.
    for page in pages:
        before = page.read_text(encoding="utf-8")
        update_page(page)
        if page.read_text(encoding="utf-8") != before:
            raise RuntimeError(f"Non-idempotent title update: {page.relative_to(ROOT)}")
    print(
        f"Checked {len(pages)} Minecraft HTML pages, updated {changed}, "
        f"found {og_pages} Open Graph titles. All title prefixes standardized."
    )


if __name__ == "__main__":
    main()
