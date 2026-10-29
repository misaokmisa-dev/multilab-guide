/* MULTI LAB GUIDE – PRETRANSLATED site language switcher.
 * Translations are generated at build time and loaded as static JS.
 * Switching languages performs zero translation requests and requires no reload.
 */
(() => {
 'use strict';
 if(window.__mlgLanguageLoaded)return;
 window.__mlgLanguageLoaded=true;
 const LANGS={ja:'日本語',en:'English',ko:'한국어',zh:'简体中文'};
 const CODES={ja:'JA',en:'EN',ko:'KO',zh:'中文'};
 const STORE='mlg-language-v1';
 const valid=l=>Object.hasOwn(LANGS,l)?l:'ja';
 let lang='ja';
 try{lang=valid(localStorage.getItem(STORE));}catch(_){}
 document.documentElement.lang=lang==='zh'?'zh-CN':lang;
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
 const idx={ja:0,en:1,ko:2,zh:3};
 const standard={};
 for(const l of Object.keys(idx))standard[l]=new Map(UI.map(row=>[row[0],row[idx[l]]]));
 const pretranslated={en:new Map(),ko:new Map(),zh:new Map()};
 let root,trigger,menu,observer,scheduled=false;
 const records=new WeakMap();
 let originalTitle=document.title,lastTitle=originalTitle;
 function hydrateCatalog(){
   const d=window.MLG_I18N_CATALOG||{};
   const encyclopedia=location.pathname.startsWith('/minecraft/strategy/items/')?(window.MLG_ENCYCLOPEDIA_I18N||{}):{};
   for(const l of ['en','ko','zh']) {
     const items=d[l]&&typeof d[l]==='object'?d[l]:{};
     pretranslated[l]=new Map([...Object.entries(items),...Object.entries(encyclopedia[l]||{})]);
   }
   repaint();
 }
 function preloadCatalog(){
   if(window.MLG_I18N_CATALOG){hydrateCatalog();return;}
   const s=document.createElement('script');
   // Short-lived cache key: published article changes refresh the catalog without a hard reload.
   s.async=true;s.src='/i18n/catalog.js?v='+Math.floor(Date.now()/300000);
   s.onload=hydrateCatalog;
   s.onerror=()=>{console.warn('Pretranslated language catalog was not available.');};
   document.head.appendChild(s);
 }
 function preloadEncyclopediaCatalog(){
   if(!location.pathname.startsWith('/minecraft/strategy/items/'))return;
   if(window.MLG_ENCYCLOPEDIA_I18N){hydrateCatalog();return;}
   const s=document.createElement('script');s.async=true;
   s.src='/i18n/encyclopedia-locale.js?v=20261029locale02';
   s.onload=hydrateCatalog;
   s.onerror=()=>console.warn('Item language dictionary was not available.');
   document.head.appendChild(s);
 }
 const japanese=s=>/[\u3040-\u30ff\u3400-\u9fff]/.test(s);
 function skipped(node){
   const el=node.nodeType===1?node:node.parentElement;
   return !el||!!el.closest('[data-i18n-ignore],script,style,noscript,svg,math,textarea,code,pre,kbd,samp,[contenteditable="true"],.mlg-site-brand-name');
 }
 function sourceOf(node,field,current) {
   let r=records.get(node);
   if(!r){r={};records.set(node,r);}
   if(!r[field])r[field]={origin:current,last:current};
   else if(current!==r[field].last&&current!==r[field].origin)r[field]={origin:current,last:current};
   return r[field];
 }
 function segment(s){
   if(s.length<=230)return [s];
   const a=[];let b='';
   for(let p of s.split(/(?<=[。！？!?])/u)){
     if(b&&b.length+p.length>230){a.push(b);b='';}
     while(p.length>230){a.push(p.slice(0,225));p=p.slice(225);}
     b+=p;
   }
   if(b)a.push(b);
   return a;
 }
 function translateEncyclopediaDynamic(source){
  if(!location.pathname.startsWith('/minecraft/strategy/items/')||lang==='ja')return '';
  const dict=pretranslated[lang];const word=s=>dict.get(s)||s;
  let m;
  if((m=source.match(/^([^（）]+)（英語名：(.+?)）は、Minecraftの「(.+?)」に分類されるアイテム・ブロックです。追加バージョン：(.+?)。1スロットに持てる上限は(\d+)個です。$/))){
   const item=word(m[1]),category=word(m[3]),release=m[4],max=m[5];
   if(lang==='en')return item+' ('+m[2]+') is a Minecraft '+category+' item/block. Added in '+release+'. Stack size: '+max+'.';
   if(lang==='ko')return item+' ('+m[2]+')은(는) 마인크래프트의 '+category+' 아이템/블록입니다. 추가 버전: '+release+'. 최대 중첩: '+max+'개.';
   return item+'（'+m[2]+'）属于 Minecraft 的'+category+'。加入版本：'+release+'。最大堆叠：'+max+'。';
  }
  if((m=source.match(/^掲載アイテム：([\d,]+)件$/)))return lang==='en'?'Listed items: '+m[1]:lang==='ko'?'등록 아이템: '+m[1]+'개':'已收录物品：'+m[1]+' 件';
  if((m=source.match(/^「(.+)」の検索結果：([\d,]+)件$/)))return lang==='en'?m[1]+': '+m[2]+' results':lang==='ko'?'「'+m[1]+'」 검색 결과: '+m[2]+'개':'“'+m[1]+'”搜索结果：'+m[2]+' 条';
  if((m=source.match(/^もっと表示（残り([\d,]+)件）$/)))return lang==='en'?'Show more ('+m[1]+' left)':lang==='ko'?'더 보기 (남은 '+m[1]+'개)':'显示更多（剩余 '+m[1]+' 件）';
  if((m=source.match(/^([\d,]+)種類の一覧を見る ›$/)))return lang==='en'?'Browse '+m[1]+' items ›':lang==='ko'?m[1]+'종 보기 ›':'查看 '+m[1]+' 种物品 ›';

  if((m=source.match(/^(.+?)の入手方法・作り方・使い道(?: \| MULTI LAB GUIDE)?$/)))return lang==='en'?word(m[1])+' — Obtaining, crafting and uses':lang==='ko'?word(m[1])+' — 획득 방법·제작법·사용처':word(m[1])+'——获取、合成与用途';
  if((m=source.match(/^(.+?)の作り方・入手方法 \| Minecraft (.+?) \| MULTI LAB GUIDE$/)))return lang==='en'?word(m[1])+' — Crafting & obtaining | Minecraft '+m[2]+' | MULTI LAB GUIDE':lang==='ko'?word(m[1])+' 제작·획득 방법 | Minecraft '+m[2]+' | MULTI LAB GUIDE':word(m[1])+' 合成与获取 | Minecraft '+m[2]+' | MULTI LAB GUIDE';
  if((m=source.match(/^(.+?)のアイテム一覧(?:｜マイクラ全アイテム図鑑)?$/)))return lang==='en'?word(m[1])+' — Item list':lang==='ko'?word(m[1])+' — 아이템 목록':word(m[1])+'——物品列表';
  if((m=source.match(/^(.+?) \/ Java (.+?)$/)))return word(m[1])+' / Java '+m[2];
  if((m=source.match(/^完成した「(.+?)」×(\d+)を取り出します。$/)))return lang==='en'?'Collect '+m[2]+' × '+word(m[1])+'.':lang==='ko'?word(m[1])+' '+m[2]+'개를 회수합니다.':'取出 '+m[2]+' 个'+word(m[1])+'。';
  if((m=source.match(/^このほかにも([\d,]+)種類のクラフトレシピで材料として使われます。$/)))return lang==='en'?'Used in '+m[1]+' additional recipes.':lang==='ko'?'다른 제작법 '+m[1]+'개에도 사용됩니다.':'还用于其他 '+m[1]+' 种合成配方。';
  if((m=source.match(/^Minecraft Wiki（(.+?)）$/)))return 'Minecraft Wiki ('+word(m[1])+')';
  return '';
 }
 function translate(source){
   if(lang==='ja'||!japanese(source))return source;
   const match=source.match(/^(\s*)([\s\S]*?)(\s*)$/);
   if(!match)return source;
   const text=match[2];if(!text)return source;
   const map=pretranslated[lang];
   const exact=standard[lang].get(text)||map.get(text);
   if(exact)return match[1]+exact+match[3];
   const dynamic=translateEncyclopediaDynamic(text);
   if(dynamic)return match[1]+dynamic+match[3];
   const pieces=segment(text);
   let changed=false;
   const result=pieces.map(s=>{
     const found=standard[lang].get(s)||map.get(s);
     if(found){changed=true;return found;}
     return s;
   }).join('');
   return changed?match[1]+result+match[3]:source;
 }
 function updateNode(node){
   if(skipped(node))return;
   if(node.nodeType===3){
      const current=node.nodeValue||'';
      const record=sourceOf(node,'text',current);
      const result=translate(record.origin);
      if(current!==result)node.nodeValue=result;
      record.last=result;
   }else if(node.nodeType===1){
      for(const field of ['title','placeholder','aria-label','alt','value']){
        if(!node.hasAttribute(field))continue;
        if(field==='value'&&node.tagName!=='INPUT')continue;
        const current=node.getAttribute(field);
        const record=sourceOf(node,field,current);
        const result=translate(record.origin);
        if(current!==result)node.setAttribute(field,result);
        record.last=result;
      }
   }
 }
 function scan(){
   if(!document.body)return;
   observer?.disconnect();
   try{
      const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
      let node,n=0;
      while((node=walker.nextNode())&&n++<25000)updateNode(node);
      if(document.title!==lastTitle && document.title!==originalTitle)originalTitle=document.title;
      const title=translate(originalTitle);
      if(document.title!==title)document.title=title;
      lastTitle=title;
   }finally{if(observer)observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['title','placeholder','aria-label','alt']});}
 }
 function repaint(){if(!document.body)return;scan();}
 function schedule(){
   if(scheduled)return;
   scheduled=true;
   requestAnimationFrame(()=>{scheduled=false;repaint();});
 }
 function updateUI(){
    if(!root)return;
    trigger.querySelector('.mlg-lang-value').textContent=window.matchMedia('(max-width:760px)').matches?CODES[lang]:LANGS[lang];
    trigger.setAttribute('aria-label','Language / 言語: '+LANGS[lang]);
    menu.querySelectorAll('button[data-lang]').forEach(button=>{
       const selected=button.dataset.lang===lang;
       button.classList.toggle('is-current',selected);
       button.setAttribute('aria-selected',String(selected));
    });
 }
 function open(open){
    root.classList.toggle('is-open',open);
    trigger.setAttribute('aria-expanded',String(open));
    menu.hidden=!open;
 }
 function select(next){
   const newLang=valid(next);
   open(false);
   if(newLang===lang)return;
   lang=newLang;
   document.documentElement.lang=lang==='zh'?'zh-CN':lang;
   try{localStorage.setItem(STORE,lang);}catch(_){}
   updateUI();repaint();
   document.dispatchEvent(new CustomEvent('mlg:languagechange',{detail:{lang}}));
 }
 function mount(){
   const nav=document.querySelector('.mlg-site-header .mlg-site-primary');
   if(!nav||document.querySelector('.mlg-site-lang'))return;
   const style=document.createElement('link');
   style.rel='stylesheet';style.href='/site-language.css?v=20261027a';document.head.appendChild(style);
   root=document.createElement('div');
   root.className='mlg-site-lang';root.dataset.i18nIgnore='';
   root.innerHTML='<button type="button" class="mlg-lang-trigger" aria-haspopup="listbox" aria-expanded="false" aria-label="Language / 言語"><span class="mlg-lang-icon" aria-hidden="true">◎</span><span class="mlg-lang-value"></span><span class="mlg-lang-caret" aria-hidden="true">⌄</span></button><div class="mlg-lang-menu" role="listbox" aria-label="Language" hidden></div>';
   trigger=root.querySelector('.mlg-lang-trigger');
   menu=root.querySelector('.mlg-lang-menu');
   for(const [code,label] of Object.entries(LANGS)){
     const btn=document.createElement('button');
     btn.type='button';btn.dataset.lang=code;
     btn.setAttribute('role','option');btn.textContent=label;
     btn.addEventListener('click',()=>select(code));
     menu.appendChild(btn);
   }
   nav.insertAdjacentElement('afterend',root);
   trigger.addEventListener('click',()=>open(!root.classList.contains('is-open')));
   document.addEventListener('click',e=>{if(!root.contains(e.target))open(false)});
   document.addEventListener('keydown',e=>{if(e.key==='Escape')open(false)});
   window.addEventListener('resize',updateUI,{passive:true});
   updateUI();
   observer=new MutationObserver(changes=>{
     if(changes.every(change=>{
       const el=change.target.nodeType===1?change.target:change.target.parentElement;
       return el?.closest?.('.mlg-site-lang');
     }))return;
     schedule();
   });
   repaint();
   preloadCatalog();
   preloadEncyclopediaCatalog();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
 else mount();
})();