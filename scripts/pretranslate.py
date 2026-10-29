#!/usr/bin/env python3
"""Pretranslate ALL existing public pages at build time (never in visitor browser)."""
from __future__ import annotations
import json
import os
import re
import time
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "i18n" / "catalog.js"
REPORT = ROOT / "i18n" / "build-report.json"
LOCALES = ("en","ko","zh")
CJK = re.compile(r"[\u3040-\u30ff\u3400-\u9fff]")
SKIP = {"script","style","noscript","svg","math","pre","code","template","textarea"}
VOID = {"area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"}
ATTRS = {"placeholder","title","aria-label","alt"}
MAX_LEN = 230

class Extractor(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skips=[]
        self.texts=set()
    def handle_starttag(self,tag,attrs):
        ignored=tag in SKIP or (bool(self.skips) and self.skips[-1][1])
        if not ignored:
            for key,value in attrs:
                if key in ATTRS and value is not None:self.add(value)
        if tag not in VOID:self.skips.append((tag,ignored))
    def handle_startendtag(self,tag,attrs):
        ignored=tag in SKIP or (bool(self.skips) and self.skips[-1][1])
        if not ignored:
            for key,value in attrs:
                if key in ATTRS and value is not None:self.add(value)
    def handle_endtag(self,tag):
        for i in range(len(self.skips)-1,-1,-1):
            if self.skips[i][0]==tag:
                del self.skips[i:]
                break
    def handle_data(self,data):
        if not self.skips or not self.skips[-1][1]:self.add(data)
    def add(self,text):
        text=text.strip()
        if 2<=len(text)<=2000 and CJK.search(text) and "$"+"{" not in text:self.texts.add(text)

def split_text(s):
    if len(s)<=MAX_LEN:return [s]
    out=[];buf=""
    for part in re.split(r"(?<=[。！？!?])",s):
        if buf and len(buf)+len(part)>MAX_LEN:out.append(buf);buf=""
        while len(part)>MAX_LEN:out.append(part[:225]);part=part[225:]
        buf+=part
    if buf:out.append(buf)
    return out

def extract_site_strings():
    strings=set()
    pages=0
    for path in sorted(ROOT.rglob("*.html")):
        if "admin" in path.parts or "i18n" in path.parts:continue
        # Item details share a server template. Their unique names come from
        # encyclopedia-locale.js, and descriptions/titles use live patterns.
        # Avoid re-translating thousands of copies of the same structure.
        if path.parent == ROOT/"minecraft/strategy/items/detail" and path.name!="new.html":continue
        reader=Extractor()
        reader.feed(path.read_text(encoding="utf-8"))
        strings.update(reader.texts)
        pages+=1
    literal=re.compile(r"""(?:'([^'\\\r\n]{2,230})'|"([^"\\\r\n]{2,230})")""")
    for path in sorted(ROOT.rglob("*.js")):
        if {"i18n","admin","worker"}.intersection(path.parts) or path.name in ("site-language.js","site-language-data.js"):continue
        # Data files contain item names, not translatable UI sentences.
        # Minecraft's 1,672 names are already in encyclopedia-locale.js.
        if path.parent == ROOT/"minecraft/strategy/items" and path.name in (
            "items-data.js","items-2026-data.js","recipes-data.js",
            "recipes-2026-data.js","texture-index.js","texture-index-2026.js"
        ):continue
        for found in literal.finditer(path.read_text(encoding="utf-8")):
            raw=(found.group(1) or found.group(2) or "").strip()
            if CJK.search(raw) and "$"+"{" not in raw and not any(c in raw for c in "<>{}"):
                strings.add(raw)
    results=set()
    for phrase in strings:
        for part in split_text(phrase):
            p=part.strip()
            if len(p)>1 and CJK.search(p):results.add(p)
    print("Extracted",len(results),"distinct phrases from",pages,"HTML files",flush=True)
    return sorted(results,key=lambda x:(len(x),x))

def load_existing():
    if not OUT.exists():return {k:{} for k in LOCALES}
    raw=OUT.read_text(encoding="utf-8")
    prefix="window.MLG_I18N_CATALOG="
    if not raw.startswith(prefix):return {k:{} for k in LOCALES}
    try:
        obj=json.loads(raw[len(prefix):].strip().rstrip(";"))
        return {k:obj.get(k,{}) for k in LOCALES}
    except Exception:return {k:{} for k in LOCALES}

def setup_models():
    import argostranslate.package as packages
    import argostranslate.translate as translate
    packages.update_package_index()
    available=packages.get_available_packages()
    def install(fr,to):
        model=next((a for a in available if a.from_code==fr and a.to_code==to),None)
        if model is None:return False
        print("Downloading translation pack",fr,"->",to,flush=True)
        packages.install_from_path(model.download())
        return True
    if not install("ja","en"):raise RuntimeError("Missing ja->en language model")
    for lang in ("ko","zh"):
        if not install("ja",lang):
            if not install("en",lang):raise RuntimeError("Missing en->"+lang+" language model")
    return translate

def write_result(store,strings):
    OUT.parent.mkdir(parents=True,exist_ok=True)
    ordered={lang:{s:store[lang][s] for s in strings if s in store[lang]} for lang in LOCALES}
    # Reviewed site/game terminology always takes precedence over machine translation.
    overrides_file=ROOT/"i18n"/"overrides.json"
    if overrides_file.exists():
        fixes=json.loads(overrides_file.read_text(encoding="utf-8"))
        for language in LOCALES:
            ordered[language].update({str(k):str(v) for k,v in fixes.get(language,{}).items()})
    OUT.write_text("window.MLG_I18N_CATALOG="+json.dumps(ordered,ensure_ascii=False,separators=(",",":"))+";\n",encoding="utf-8")
    counts={lang:len(ordered[lang]) for lang in LOCALES}
    REPORT.write_text(json.dumps({"source_segments":len(strings),"translated":counts,"generator":"offline Argos Translate"},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("Translations",counts,flush=True)

def main():
    phrases=extract_site_strings()
    store=load_existing()
    if not all(all(s in store[l] for s in phrases) for l in LOCALES):
        translate=setup_models()
        for lang in LOCALES:
            todo=[s for s in phrases if s not in store[lang]]
            print("Translating",lang,len(todo),"phrases",flush=True)
            start=time.monotonic()
            for i,source in enumerate(todo,1):
                try:
                    output=translate.translate(source,"ja",lang).strip()
                    if output and output!=source and len(output)<3000:store[lang][source]=output
                except Exception as exc:print("Translation failure",lang,repr(source[:30]),str(exc)[:100],flush=True)
                if i%100==0:print(lang,i,"/",len(todo),"elapsed",int(time.monotonic()-start),"seconds",flush=True)
            write_result(store,phrases)
    write_result(store,phrases)

if __name__=="__main__":
    os.chdir(ROOT)
    main()
