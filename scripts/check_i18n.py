#!/usr/bin/env python3
"""Release gate for pretranslated MULTI LAB GUIDE.
Offline: no visitor translation endpoints, no external API calls.
"""
from __future__ import annotations
import json
import re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
CAT=ROOT/"i18n"/"catalog.js"
PREFIX="window.MLG_I18N_CATALOG="
text=CAT.read_text(encoding="utf-8").strip()
assert text.startswith(PREFIX) and text.endswith(";"), "Static catalog malformed"
catalog=json.loads(text[len(PREFIX):-1])
report=json.loads((ROOT/"i18n"/"build-report.json").read_text(encoding="utf-8"))
overrides=json.loads((ROOT/"i18n"/"overrides.json").read_text(encoding="utf-8"))
source_count=report["source_segments"]
assert source_count >= 1000, "Unexpectedly few Japanese entries extracted"
for lang in ("en","ko","zh"):
    values=catalog.get(lang)
    assert isinstance(values,dict),f"Missing language: {lang}"
    count=report["translated"].get(lang,0)
    assert count >= source_count * .98, f"{lang}: translation coverage is too low ({count}/{source_count})"
    assert len(values) >= count, f"{lang}: dictionary shorter than report"
    for source,translated in overrides[lang].items():
        assert values.get(source)==translated,f"{lang}: reviewed phrase regressed: {source}"
    print(f"{lang}: {count}/{source_count} original phrases + reviewed terms")
public_pages=[p for p in ROOT.rglob("*.html") if "admin" not in p.parts]
assert len(public_pages)>=25, "Unexpectedly few public pages"
# A noindex meta-refresh redirect has no navigable content and immediately
# sends the visitor to the translated destination. It needs no selector.
def requires_language_switch(path: Path) -> bool:
    page = path.read_text(encoding="utf-8")
    is_redirect = bool(re.search(r'<meta\\s+http-equiv=["\\\']refresh["\\\']', page, re.I)) and bool(
        re.search(r'<meta\\s+name=["\\\']robots["\\\']\\s+content=["\\\'][^"\\\']*noindex', page, re.I)
    )
    return not is_redirect

pages_to_check=[p for p in public_pages if requires_language_switch(p)]
missing=[str(p.relative_to(ROOT)) for p in pages_to_check if "/site-language.js?" not in p.read_text(encoding="utf-8")]
assert not missing, "No language switch on public page(s): "+",".join(missing)
js=(ROOT/"site-language.js").read_text(encoding="utf-8")
assert "/api/site-translate" not in js, "Runtime translation must never be reintroduced"
assert "MLG_I18N_CATALOG" in js and "localStorage" in js, "Static switcher missing"
assert all(x in js for x in ("ja:","en:","ko:","zh:")), "Missing supported languages"
print(f"PASS: {len(pages_to_check)} public content pages include language selector ({len(public_pages)-len(pages_to_check)} redirect(s) excluded); all locales have pretranslated bundles")
