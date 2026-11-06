#!/usr/bin/env python3
"""Reversible site-wide AdSense quality review: keep useful content visible,
while pausing external Ninja AdMax on curated user-facing HTML pages.

This does NOT modify long-tail item detail pages: those are delivered with
noindex and without AdSense by the Cloudflare Worker until rewritten.
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IGNORE = ROOT / "minecraft/strategy/items/detail"
ADS = re.compile(
    r'<script\b[^>]*?\bsrc\s*=\s*["\']https://adm\.shinobi\.jp/s/([a-f0-9]{32})["\'][^>]*>\s*</script>',
    re.I,
)
HEAD = re.compile(r"(<head\b[^>]*>)", re.I)
CSS = '<link rel="stylesheet" href="/ad-review.css?v=20261106quality01">'
GATE = '<script src="/ad-review-gate.js" data-admax-id="{adid}"></script>'


def apply_to_html(page: Path) -> tuple[bool, int]:
    original = page.read_text(encoding="utf-8")
    updated, replacements = ADS.subn(lambda m: GATE.format(adid=m[1]), original)
    if CSS not in updated:
        updated, count = HEAD.subn(lambda m: m[1] + CSS, updated, count=1)
        if count != 1:
            raise RuntimeError(f"No head in {page.relative_to(ROOT)}")
    if updated == original:
        return False, replacements
    page.write_text(updated, encoding="utf-8")
    return True, replacements


def main() -> None:
    changed = paused = visited = 0
    for page in ROOT.rglob("*.html"):
        if IGNORE in page.parents or "admin" in page.parts:
            continue
        visited += 1
        has_changed, replacements = apply_to_html(page)
        changed += int(has_changed)
        paused += replacements
    print(f"Review guard: {visited} HTML pages checked; {changed} updated; "
          f"{paused} third-party ad tags replaced with reversible gate.")


if __name__ == "__main__":
    main()
