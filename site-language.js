/* MULTI LAB GUIDE | Site-wide language selector and progressive translations.
 * Original Japanese DOM stays authoritative. No navigation or page reload is needed.
 */
(() => {
 'use strict';
 if (window.__mlgLanguageLoaded) return;
 window.__mlgLanguageLoaded = true;
 const LANGS = { ja:'日本語', en:'English', ko:'한국어', zh:'简体中文' };
 const CODES = { ja:'JA', en:'EN', ko:'KO', zh:'中文' };
 const STORAGE_KEY = 'mlg-language-v1';
 const CACHE_PREFIX = 'mlg-translation-v1-';
 const UI = [
  ['ホーム','Home','홈','首页'], ['記事一覧','Articles','기사 목록','文章列表'],
  ['デバイス','Devices','기기','设备'], ['マイクラTOP','Minecraft Home','마인크래프트 홈','我的世界首页'],
  ['人気MOD','Popular Mods','인기 MOD','热门 MOD'], ['MOD診断','Mod Finder','MOD 추천','MOD 推荐'],
  ['サーバー診断','Server Finder','서버 추천','服务器推荐'], ['MODガイド','Mod Guide','MOD 가이드','MOD 指南'],
  ['解説記事','Articles','가이드 기사','攻略文章'], ['ROBLOXトップ','Roblox Home','로블록스 홈','Roblox 首页'],
  ['同接TOP30','Live Top 30','동접 TOP30','在线人数 TOP30'],
  ['ホラーゲーム','Horror Games','공포 게임','恐怖游戏'],
  ['育成・収集ゲーム','Collection Games','육성·수집 게임','养成·收集游戏'],
  ['ゲーミングPC','Gaming PCs','게이밍 PC','游戏台式电脑'],
  ['ゲーミングノートPC','Gaming Laptops','게이밍 노트북','游戏笔记本电脑'],
  ['ノートPC','Laptops','노트북','笔记本电脑'], ['モニター','Monitors','모니터','显示器'],
  ['マウス','Mice','마우스','鼠标'], ['キーボード','Keyboards','키보드','键盘'],
  ['ヘッドセット','Headsets','헤드셋','耳机'], ['周辺機器','Accessories','주변기기','外设'],
  ['PC診断','PC Finder','PC 추천','电脑推荐'], ['購入ガイド','Buying Guide','구매 가이드','购买指南'],
  ['同接ランキング','Live Player Ranking','실시간 접속자 순위','实时在线人数排行'],
  ['ROBLOXランキング','Roblox Rankings','로블록스 순위','Roblox 排行榜'],
  ['ROBLOX総合ランキング','Roblox Rankings','로블록스 종합 순위','Roblox 综合排行'],
  ['ROBLOX総合ガイドを見る →','Explore Roblox Guide →','로블록스 가이드 보기 →','查看 Roblox 指南 →'],
  ['この記事を読む ↓','Read this article ↓','이 글 읽기 ↓','阅读本文 ↓'],
  ['総合トップ','Home','전체 홈','首页'], ['戻る','Back','뒤로','返回'],
  ['詳細を見る','View Details','자세히 보기','查看详情'],
  ['プレイ','Play','플레이','开始游戏'], ['もっと見る','Show More','더 보기','查看更多'],
  ['ランキング','Ranking','순위','排行榜'], ['人気ランキング','Popular Rankings','인기 순위','热门排行'],
  ['更新','Refresh','새로고침','刷新'], ['更新中','Updating','업데이트 중','更新中'],
  ['読み込み中…','Loading…','불러오는 중…','加载中…'],
  ['読み込み中...','Loading...','불러오는 중...','加载中...'],
  ['データ取得中','Fetching data','데이터 불러오는 중','正在获取数据'],
  ['検索','Search','검색','搜索'], ['検索する','Search','검색하기','搜索'],
  ['絞り込み','Filter','필터','筛选'], ['すべて','All','전체','全部'],
  ['公式サイト','Official Site','공식 사이트','官方网站'],
  ['詳細','Details','상세','详情'], ['価格','Price','가격','价格'],
  ['無料','Free','무료','免费'], ['有料','Paid','유료','付费'],
  ['おすすめ','Recommended','추천','推荐'], ['カテゴリを選ぶ','Choose a Category','카테고리 선택','选择分类'],
  ['記事一覧を見る','Browse Articles','기사 보기','浏览文章'],
  ['プライバシーポリシー','Privacy Policy','개인정보 처리방침','隐私政策'],
  ['運営方針・広告について','About & Advertising','운영 정책 및 광고','关于我们及广告'],
  ['広告','Ad','광고','广告'], ['スポンサー','Sponsored','스폰서','赞助'],
  ['目次','Contents','목차','目录'], ['次へ','Next','다음','下一步'],
  ['前へ','Previous','이전','上一步'], ['選択する','Select','선택','选择'],
  ['結果を見る','See Results','결과 보기','查看结果'],
  ['あなたにおすすめ','Recommended for You','나를 위한 추천','为你推荐'],
  ['診断をはじめる','Start Quiz','진단 시작','开始测评'],
  ['診断する','Start Quiz','진단하기','开始测评'],
  ['人気のゲーム','Popular Games','인기 게임','热门游戏'],
  ['総合','Overall','종합','综合'], ['週間','Weekly','주간','每周'],
  ['月間','Monthly','월간','每月'], ['急上昇','Trending','급상승','飙升'],
  ['今すぐ遊ぶ','Play Now','지금 플레이','立即游玩'],
  ['最終更新','Last Updated','마지막 업데이트','最后更新'],
  ['ゲームを探す','Find Games','게임 찾기','查找游戏'],
  ['リンクを開く','Open Link','링크 열기','打开链接'],
  ['日本語','Japanese','일본어','日语'], ['英語','English','영어','英语'],
  ['韓国語','Korean','한국어','韩语'], ['中国語','Chinese','중국어','中文'],
  ['言語','Language','언어','语言']
 ];
 const indexes = {ja:0,en:1,ko:2,zh:3};
 const dict = {};
 Object.keys(indexes).forEach(lang => {
   dict[lang] = new Map(UI.map(row=>[row[0], row[indexes[lang]]]));
 });
 const valid = value => Object.hasOwn(LANGS,value) ? value : 'ja';
 let lang='ja';
 try { lang=valid(localStorage.getItem(STORAGE_KEY)); } catch (_) {}
 document.documentElement.lang=lang==='zh'?'zh-CN':lang;
 const records = new WeakMap();
 let observer, scheduled=false, generation=0, translating=false, root, trigger, list, status;
 let stored=new Map();
 let cacheSaveTimer=null;
 function readCache(l) {
   try {
     const raw=JSON.parse(localStorage.getItem(CACHE_PREFIX+l)||'[]');
     return new Map(Array.isArray(raw)?raw.filter(pair=>Array.isArray(pair)&&pair.length===2):[]);
   } catch (_) { return new Map(); }
 }
 function saveCache(l,map) {
   try {
     const arr=Array.from(map.entries()).slice(-800);
     localStorage.setItem(CACHE_PREFIX+l,JSON.stringify(arr));
   } catch (_) {}
 }
 stored=readCache(lang);
 const canTranslate = text => /[\u3040-\u30ff\u3400-\u9fff]/.test(text) && !/^[\d\s,.%+\-*/:¥$€]+$/.test(text);
 const isSkipped = node => {
   let p=node.nodeType===1?node:node.parentElement;
   return !p || !!p.closest('[data-i18n-ignore],script,style,noscript,code,pre,kbd,samp,svg,math,textarea,[contenteditable="true"],.mlg-site-brand-name');
 };
 function entryFor(node,kind,value) {
   let rec=records.get(node);
   if(!rec){rec=Object.create(null);records.set(node,rec);}
   let state=rec[kind];
   if(!state){ state={source:value,last:value};rec[kind]=state; }
   else if(value!==state.last && value!==state.source) {
      state.source=value;state.last=value;
   }
   return state;
 }
 const pieces = text => {
   if(text.length<=230)return [text];
   const res=[];
   let current='';
   for(const part of text.split(/(?<=[。！？!?])/u)) {
     if(current.length+part.length>230&&current){res.push(current);current='';}
     if(part.length>230){
       if(current){res.push(current);current='';}
       for(let i=0;i<part.length;i+=225)res.push(part.slice(i,i+225));
     } else current+=part;
   }
   if(current)res.push(current);
   return res;
 };
 function translateString(str,needed) {
   if(lang==='ja'||!canTranslate(str))return str;
   const m=str.match(/^(\s*)([\s\S]*?)(\s*)$/);
   const lead=m?m[1]:'', text=m?m[2]:str, tail=m?m[3]:'';
   if(!text)return str;
   const exact=dict[lang].get(text);
   if(exact)return lead+exact+tail;
   const chunks=pieces(text);
   const translated=chunks.map(chunk=>{
     if(!canTranslate(chunk))return chunk;
     const direct=dict[lang].get(chunk)||stored.get(chunk);
     if(direct)return direct;
     if(needed)needed.add(chunk);
     return chunk;
   });
   return lead+translated.join('')+tail;
 }
 function processNode(node,needed) {
   if(node.nodeType===3) {
     if(isSkipped(node))return;
     const val=node.nodeValue||'';
     const rec=entryFor(node,'text',val);
     const next=translateString(rec.source,needed);
     if(node.nodeValue!==next)node.nodeValue=next;
     rec.last=next;
   } else if(node.nodeType===1&&!isSkipped(node)) {
     for(const a of ['placeholder','title','aria-label','alt','value']) {
       if(!node.hasAttribute(a))continue;
       if(a==='value'&&node.tagName!=='INPUT')continue;
       const val=node.getAttribute(a);
       const rec=entryFor(node,a,val);
       const next=translateString(rec.source,needed);
       if(val!==next)node.setAttribute(a,next);
       rec.last=next;
     }
   }
 }
 function scan() {
   if(!document.body)return new Set();
   const needed=new Set();
   observer?.disconnect();
   try {
     const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
     let node,count=0;
     while((node=walker.nextNode())&&count++<14000)processNode(node,needed);
   } finally { observe(); }
   return needed;
 }
 function observe() {
   if(!observer||!document.body)return;
   observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','aria-label','alt']});
 }
 function schedule() {
   if(scheduled)return;
   scheduled=true;
   setTimeout(()=>{scheduled=false; refresh();},100);
 }
 function updateButton() {
   if(!trigger)return;
   trigger.querySelector('.mlg-lang-value').textContent=window.matchMedia('(max-width:760px)').matches?CODES[lang]:LANGS[lang];
   trigger.setAttribute('aria-label','Language / 言語: '+LANGS[lang]);
   list.querySelectorAll('button[data-lang]').forEach(btn=>{
     const active=btn.dataset.lang===lang;
     btn.classList.toggle('is-current',active);
     btn.setAttribute('aria-selected',active?'true':'false');
   });
 }
 function markBusy(busy) {
   if(!status)return;
   status.textContent=busy ? {en:'Translating…',ko:'번역 중…',zh:'翻译中…'}[lang]||'' : '';
 }
 function openMenu(open) {
   if(!root)return;
   root.classList.toggle('is-open',open);
   trigger.setAttribute('aria-expanded',String(open));
   list.hidden=!open;
 }
 function setLang(next) {
   next=valid(next);
   if(next===lang){openMenu(false);return;}
   lang=next;generation++;translating=false;
   document.documentElement.lang=lang==='zh'?'zh-CN':lang;
   try{localStorage.setItem(STORAGE_KEY,lang);}catch(_){}
   stored=readCache(lang);
   openMenu(false);
   updateButton();
   markBusy(false);
   refresh();
   document.dispatchEvent(new CustomEvent('mlg:languagechange',{detail:{lang}}));
 }
 function createControl() {
   const nav=document.querySelector('.mlg-site-header .mlg-site-primary');
   if(!nav||document.querySelector('.mlg-site-lang'))return;
   root=document.createElement('div');root.className='mlg-site-lang';root.dataset.i18nIgnore='';
   root.innerHTML='<button type="button" class="mlg-lang-trigger" aria-haspopup="listbox" aria-expanded="false" aria-label="Language / 言語"><span class="mlg-lang-icon" aria-hidden="true">◎</span><span class="mlg-lang-value"></span><span class="mlg-lang-caret" aria-hidden="true">⌄</span></button><div class="mlg-lang-menu" role="listbox" aria-label="Language" hidden></div><span class="mlg-lang-status" role="status" aria-live="polite"></span>';
   list=root.querySelector('.mlg-lang-menu');trigger=root.querySelector('.mlg-lang-trigger');status=root.querySelector('.mlg-lang-status');
   Object.entries(LANGS).forEach(([id,title])=>{
      const b=document.createElement('button');
      b.type='button';b.dataset.lang=id;b.setAttribute('role','option');b.textContent=title;
      b.addEventListener('click',()=>setLang(id));
      list.appendChild(b);
   });
   nav.insertAdjacentElement('afterend',root);
   trigger.addEventListener('click',()=>openMenu(!root.classList.contains('is-open')));
   document.addEventListener('click',e=>{if(root&&!root.contains(e.target))openMenu(false);});
   document.addEventListener('keydown',e=>{
     if(e.key==='Escape')openMenu(false);
   });
   window.addEventListener('resize',updateButton,{passive:true});
   updateButton();
 }
 async function requestTranslations(texts,selected,token) {
   try {
      const controller=new AbortController();
      const timeout=setTimeout(()=>controller.abort(),18000);
      let res;
      try {
       res=await fetch('/api/site-translate',{
        method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify({lang:selected,texts}),signal:controller.signal,
        credentials:'same-origin'
       });
      } finally {clearTimeout(timeout);}
      if(!res.ok)return;
      const data=await res.json();
      if(!data||!Array.isArray(data.results))return;
      const cache=selected===lang?stored:readCache(selected);
      let changes=0;
      data.results.forEach((t,i)=>{
        if(typeof t==='string'&&t.trim()&&t!==texts[i]){
          cache.delete(texts[i]);cache.set(texts[i],t);changes++;
        }
      });
      if(changes)saveCache(selected,cache);
      if(token===generation&&changes)schedule();
   } catch (_) {}
 }
 async function fillPending(missing,selected,token) {
   if(!missing.size||selected==='ja')return;
   translating=true;markBusy(true);
   const chunks=[];
   const all=Array.from(missing).slice(0,600);
   for(let i=0;i<all.length;i+=12)chunks.push(all.slice(i,i+12));
   let index=0;
   const runners=Array.from({length:Math.min(3,chunks.length)},async()=>{
      while(index<chunks.length&&token===generation){
        const batch=chunks[index++];
        await requestTranslations(batch,selected,token);
      }
   });
   await Promise.all(runners);
   if(token===generation){translating=false;markBusy(false);}
 }
 let filling=false;
 async function refresh() {
   if(!document.body)return;
   const missing=scan();
   if(lang==='ja'||!missing.size){markBusy(false);return;}
   if(filling)return;
   filling=true;
   const selected=lang,token=generation;
   try{await fillPending(missing,selected,token);}
   finally{
     filling=false;
     if(token!==generation)schedule();
   }
 }
 function init() {
   if(!document.querySelector('.mlg-site-header'))return;
   const style=document.createElement('link');
   style.rel='stylesheet';style.href='/site-language.css?v=20261027a';document.head.appendChild(style);
   createControl();
   observer=new MutationObserver(schedule);
   refresh();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();