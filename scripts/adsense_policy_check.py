#!/usr/bin/env python3
"""Static AdSense policy regression checks for MULTI LAB GUIDE.

A passing result is NOT an AdSense approval or a substitute for checking the
Policy Center. It catches regressions in known site-specific risk controls.
"""
from pathlib import Path
from urllib.parse import urlparse
from xml.etree import ElementTree as ET
import re
import sys
import json

ROOT = Path(__file__).resolve().parents[1]
errors = []

def check(ok: bool, description: str):
    if not ok:
        errors.append(description)

ads_txt = (ROOT / "ads.txt").read_text(encoding="utf-8")
index = (ROOT / "index.html").read_text(encoding="utf-8")
review_css = (ROOT / "ad-review.css").read_text(encoding="utf-8")
ad_config = (ROOT / "ad-config.js").read_text(encoding="utf-8")
gate = (ROOT / "ad-review-gate.js").read_text(encoding="utf-8")
worker = (ROOT / "worker/affiliate-analytics.js").read_text(encoding="utf-8")
wrangler = json.loads((ROOT / "wrangler.jsonc").read_text(encoding="utf-8"))

check("google.com, pub-4384918189756650, DIRECT" in ads_txt,
      "AdSense publisher ID is missing from ads.txt")
check("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4384918189756650" in index,
      "AdSense verification snippet is missing from the actual home page")
check("reviewMode: true" in ad_config and "var PAUSED = true" in gate,
      "Third-party ad review gates have been disabled")
check("AdSense review" in (ROOT / "interstitial-loader.js").read_text(encoding="utf-8"),
      "Interstitial script lost its review safeguard")
check(".as-slot" in review_css and "display:none!important" in review_css,
      "Review stylesheet no longer hides intrusive third-party ad containers")
check("X-Robots-Tag" in worker and "isAutoItemDetail" in worker and "isBriefRareMobDetail" in worker,
      "Reference-page noindex and ad exclusion are missing from the Worker")
check("/minecraft/strategy/items/detail/*" in wrangler["assets"]["run_worker_first"],
      "Reference detail route is missing from the Worker")
for entry in [ROOT / "minecraft/strategy/items/index.html", *(ROOT / "minecraft/strategy/items/category").glob("*.html")]:
    check("pagead2.googlesyndication.com" not in entry.read_text(encoding="utf-8"),
          f"Catalog page contains an AdSense request: {entry.relative_to(ROOT)}")

for name in ("about.html", "privacy.html", "sitemap.html"):
    content = (ROOT / name).read_text(encoding="utf-8")
    check("pagead2.googlesyndication.com" not in content,
          f"Pure navigation/legal page {name} contains an AdSense request")
check("Google AdSenseと広告Cookie" in (ROOT / "privacy.html").read_text(encoding="utf-8"),
      "Privacy policy needs a Google ad-cookie disclosure")

for name in ("gaming-pc", "gaming-laptop", "monitors", "mice", "keyboards", "audio"):
    content = (ROOT / "devices" / (name + ".html")).read_text(encoding="utf-8")
    check('data-price-kind="comparison"' not in content,
          f"{name} incorrectly displays other-model reference prices as product prices")
    check("購入前の確認手順" in content,
          f"{name} is missing its independent buying guide")

sitemap = ET.parse(ROOT / "sitemap.xml").getroot()
ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
locs = [item.text for item in sitemap.findall(".//sm:loc", ns)]
for url in locs:
    parsed = urlparse(url)
    check(parsed.scheme == "https" and parsed.netloc == "mlabg.com",
          f"Sitemap contains an external or non-HTTPS URL: {url}")
    path = parsed.path.lstrip("/")
    if not path or path.endswith("/"):
        path += "index.html"
    candidates = [ROOT / path, ROOT / (path + ".html"), ROOT / path / "index.html"]
    check(any(p.is_file() for p in candidates), f"Sitemap URL has no corresponding page: {url}")
    check("/items/detail/" not in url and not re.search(r"/rare-mobs/[^/]+\.html$", url),
          f"Thin reference detail is in the indexable sitemap: {url}")

check(len(locs) >= 40, "Sitemap unexpectedly lost most editorial pages")
if errors:
    print(f"AdSense policy regression audit: {len(errors)} issue(s):")
    for error in errors:
        print(" -", error)
    sys.exit(1)
print(f"AdSense policy regression audit passed: {len(locs)} sitemap URLs checked.")
