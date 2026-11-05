/* Minecraft MOD ranking: 3 categories × 100 verified downloads,
 * 20 per page; browsable and shareable category/page URLs.
 * Counts sourced from a dated Modrinth snapshot, not user counts.
 */
(() => {
"use strict";
const snapshot = window.MLG_MOD_DATA;
const tabs = [...document.querySelectorAll("[data-mod-tab]")];
const categoryPaths = {
 all: "/minecraft/mod-ranking",
 play: "/minecraft/mod-ranking-adventure.html",
 utility: "/minecraft/mod-ranking-utility.html"
};
const currentPath = window.location.pathname;
const pageCategory = currentPath.endsWith("/mod-ranking-adventure.html") ? "play"
 : currentPath.endsWith("/mod-ranking-utility.html") ? "utility" : "all";
// Preserve older category= bookmarks by redirecting them to the matching standalone page.
const legacyUrl = new URL(window.location.href);
const legacyCategory = legacyUrl.searchParams.get("category");
if(legacyCategory && Object.prototype.hasOwnProperty.call(categoryPaths,legacyCategory)){
 legacyUrl.searchParams.delete("category");
 window.location.replace(categoryPaths[legacyCategory] + legacyUrl.search + legacyUrl.hash);
 return;
}
const list = document.getElementById("md-mod-list");
const search = document.getElementById("md-search");
const count = document.getElementById("md-mod-count");
const updated = document.getElementById("md-updated");
const pagers = [document.getElementById("md-pagination-top"),document.getElementById("md-pagination-bottom")].filter(Boolean);
const summary = document.getElementById("md-page-summary");
const searchClear = document.getElementById("md-search-clear");
const versionSelect=document.getElementById("md-version");
const loaderSelect=document.getElementById("md-loader");
const filterClear=document.getElementById("md-filter-clear");
const filterStatus=document.getElementById("md-filter-status");
const compatCache=new Map();
const compatReady=new Set();
const compatPending=new Map();
const compatErrors=new Map();
const allowedLoaders=new Set(["","fabric","forge","neoforge","quilt"]);
function getVersion(){return versionSelect&&versionSelect.value?versionSelect.value:"";}
function getLoader(){return loaderSelect&&loaderSelect.value?loaderSelect.value:"";}
function isNarrowed(){return !!(search.value.trim()||getLoader()||getVersion());}
function loadCompatibility(key){
 if(compatReady.has(key))return Promise.resolve();
 if(compatPending.has(key))return compatPending.get(key);
 compatErrors.delete(key);
 const unique=[...new Set((source[key]||[]).map(p=>p.slug).filter(Boolean))];
 const groups=[];
 for(let i=0;i<unique.length;i+=25)groups.push(unique.slice(i,i+25));
 const promise=Promise.all(groups.map(async ids=>{
  const url="https://api.modrinth.com/v2/projects?ids="+encodeURIComponent(JSON.stringify(ids));
  const response=await fetch(url,{headers:{"Accept":"application/json"}});
  if(!response.ok)throw Error("Modrinth: HTTP "+response.status);
  const projects=await response.json();
  if(!Array.isArray(projects))throw Error("Modrinth: invalid project list");
  return projects;
 })).then(groups=>{
  const metadata=new Map();
  groups.flat().forEach(p=>{
   if(p&&typeof p.slug==="string"&&Array.isArray(p.game_versions)){
    metadata.set(p.slug.toLowerCase(),new Set(p.game_versions));
   }
  });
  compatCache.set(key,metadata);
  compatReady.add(key);
  compatErrors.delete(key);
 }).catch(e=>{
  compatErrors.set(key,String(e&&e.message||e));
 }).finally(()=>{
  compatPending.delete(key);
  if(category===key)render();
 });
 compatPending.set(key,promise);
 return promise;
}

if (!snapshot || !list || !search) return;
const source = snapshot.lists;
const labels = {all:"総合",utility:"便利・軽量化MOD",play:"遊ぶ・冒険MOD"};
const descriptions = {
 all:"全種類を対象に、前提ライブラリを含めた総合ダウンロード順",
 utility:"軽量化・操作改善・整理など、日常的に役立つMODを中心に選定",
 play:"冒険・建築・ボス・農業・機械など、遊びを増やすMODを選定"
};
const pageSize=20;
const fmt=new Intl.NumberFormat("ja-JP");
const el=(tag,cls,value)=>{
 const node=document.createElement(tag);
 if(cls)node.className=cls;
 if(value!==undefined)node.textContent=value;
 return node;
};
const urlState=()=>{
 const params=new URLSearchParams(window.location.search);
 const category=pageCategory;
 const rawPage=Number(params.get("page"));
 const page=Number.isInteger(rawPage)?Math.max(1,Math.min(5,rawPage)):1;
 return {category,page,q:params.get("q")||"",
  loader:allowedLoaders.has(params.get("loader"))?params.get("loader")||"":"",
  version:params.get("version")||""};
};
const initial=urlState();
let category=initial.category,page=initial.page;
search.value=initial.q;
if(loaderSelect)loaderSelect.value=initial.loader;
if(versionSelect&&[...versionSelect.options].some(o=>o.value===initial.version))versionSelect.value=initial.version;

function filtered(){
 const q=search.value.toLocaleLowerCase("ja").trim(),loader=getLoader(),version=getVersion();
 const metadata=version?compatCache.get(category):null;
 return (source[category]||[]).map((item,rank)=>({item,rank:rank+1})).filter(({item})=>{
  if(q&&![item.title,item.description,item.slug].join(" ").toLocaleLowerCase("ja").includes(q))return false;
  if(loader&&!(item.loaders||[]).includes(loader))return false;
  if(version){
   const supported=metadata?.get(String(item.slug).toLowerCase());
   if(!supported||!supported.has(version))return false;
  }
  return true;
 });
}
function writeUrl(mode){
 if(!window.history||!window.location)return;
 const url=new URL(window.location.href);
 url.searchParams.delete("category");
 if(page>1)url.searchParams.set("page",String(page));else url.searchParams.delete("page");
 const q=search.value.trim();
 if(q)url.searchParams.set("q",q);else url.searchParams.delete("q");
 if(getLoader())url.searchParams.set("loader",getLoader());else url.searchParams.delete("loader");
 if(getVersion())url.searchParams.set("version",getVersion());else url.searchParams.delete("version");
 try{window.history[mode==="push"?"pushState":"replaceState"](null,"",url.pathname+url.search+url.hash)}catch(e){}
}
function button(text,cls,disabled,click,aria){
 const b=el("button",cls,text);
 b.type="button";b.disabled=disabled;
 if(aria)b.setAttribute("aria-label",aria);
 b.addEventListener("click",click);
 return b;
}
function renderPager(target,total,current){
 target.replaceChildren();
 const pages=Math.max(1,Math.ceil(total/pageSize));
 target.setAttribute("aria-label","ランキングのページ切替");
 const layout=el("div","md-page-controls");
 layout.append(button("← 前へ","md-page-prev",current<=1,()=>go(current-1),"前の20位を表示"));
 const numbers=el("div","md-page-numbers");
 for(let i=1;i<=pages;i++){
  const first=(i-1)*pageSize+1,last=Math.min(i*pageSize,total);
  const b=el("button","md-page-number"+(i===current?" is-active":""),String(i));
  b.type="button";
  b.setAttribute("aria-label",i+"ページ目（"+first+"〜"+last+"位）");
  if(i===current)b.setAttribute("aria-current","page");
  const small=el("span","md-page-range",first+"–"+last);
  b.append(small);
  b.addEventListener("click",()=>go(i));
  numbers.append(b);
 }
 layout.append(numbers);
 layout.append(button("次へ →","md-page-next",current>=pages,()=>go(current+1),"次の20位を表示"));
 target.append(layout);
}
function render(){
 const version=getVersion();
 const waiting=!!version&&!compatReady.has(category)&&!compatErrors.has(category);
 if(waiting&&!compatPending.has(category))loadCompatibility(category);
 const problem=!!version&&compatErrors.has(category);
 const entries=waiting||problem?[]:filtered();
 const total=entries.length,pages=Math.max(1,Math.ceil(total/pageSize));
 page=Math.max(1,Math.min(page,pages));
 tabs.forEach(tab=>{
  const yes=tab.dataset.modTab===category;
  if(yes)tab.setAttribute("aria-current","page");else tab.removeAttribute("aria-current");
 });
 const panel=document.getElementById("md-ranking-panel");
 if(panel)panel.setAttribute("aria-labelledby","md-tab-"+category);
 if(summary)summary.textContent=descriptions[category];
 const first=(page-1)*pageSize;
 const current=entries.slice(first,first+pageSize);
 count.textContent=waiting?"Modrinthから対応バージョンを取得中…":problem?"バージョン情報を取得できませんでした":
  isNarrowed()?labels[category]+"：条件に一致 "+total+"件｜"+(total?first+1:0)+"〜"+Math.min(first+pageSize,total)+"件を表示（元の順位のまま）":
  labels[category]+"：100位まで｜"+(first+1)+"〜"+Math.min(first+pageSize,total)+"位を表示";
 if(filterClear)filterClear.hidden=!isNarrowed();
 if(filterStatus)filterStatus.textContent=waiting?"Modrinthの公式データを確認しています。":
  problem?"対応バージョンの確認に失敗しました。通信状況を確認して「再試行」を押してください。":
  version?"Modrinthの各MODの公開対応バージョン一覧で絞り込み中。ローダーとの組み合わせは公式配布ページで最終確認してください。":
  getLoader()?"ローダーはランキング取得時点のModrinth情報で絞り込み中。バージョン別の対応は公式配布ページで確認してください。":
  "カテゴリ・Minecraftバージョン・ローダーを組み合わせて探せます。";
 if(updated)updated.textContent="Modrinthの累計DL数｜"+snapshot.asOf.replaceAll("-","/")+" 取得";
 if(searchClear)searchClear.hidden=!search.value.trim();
 pagers.forEach(p=>renderPager(p,total,page));
 list.replaceChildren();
 if(!current.length){
  const box=el("li","md-no-results",waiting?"対応バージョンを読み込み中です…":problem?"Modrinthに接続できません。条件を変えるか再試行してください。":"一致するMODがありません。条件を変えてお試しください。");
  if(problem){const retry=button("再試行","md-retry-button",false,()=>{compatErrors.delete(category);render();});box.append(retry);}
  list.append(box);return;
 }
 current.forEach(({item:p,rank})=>{
  const li=el("li","md-mod-item");
  li.dataset.rank=String(rank);
  li.id="mod-"+category+"-"+rank;
  const rankTag=el("span","md-mod-rank",String(rank));
  const icon=el("img","md-mod-icon");
  icon.loading="lazy";icon.decoding="async";icon.alt="";
  icon.width=53;icon.height=53;
  if(typeof p.icon==="string"&&p.icon.startsWith("https://"))icon.src=p.icon;
  else icon.style.visibility="hidden";
  const content=el("div","md-mod-body");
  content.append(el("h3","md-mod-title",p.title),el("p","md-mod-desc",p.description));
  const badges=el("div","md-mod-tags");
  (p.loaders||[]).slice(0,3).forEach(v=>badges.append(el("span","",v==="neoforge"?"NeoForge":v==="fabric"?"Fabric":v==="forge"?"Forge":"Quilt")));
  if(p.categories?.includes("library"))badges.append(el("span","","前提ライブラリ"));
  if(version)badges.append(el("span","md-mod-version-badge",version+" 対応候補"));
  content.append(badges);
  const row=el("div","md-mod-actions");
  const dl=el("span","md-mod-dl");
  dl.append(el("b","",fmt.format(p.downloads)),document.createTextNode(" DL"));
  const link=el("a","md-mod-link","公式MODページを見る ↗");
  link.href="https://modrinth.com/mod/"+encodeURIComponent(p.slug);
  link.target="_blank";link.rel="noopener noreferrer";
  row.append(dl,link);content.append(row);
  li.append(rankTag,icon,content);
  list.append(li);
 });
}
function go(value){
 const max=Math.max(1,Math.ceil(filtered().length/pageSize));
 const next=Math.max(1,Math.min(value,max));
 if(next===page)return;
 page=next;
 writeUrl("push");
 render();
 // 1–5 pages: scroll to the actual MOD list, not the page or promo section top.
 const topPager=document.getElementById("md-pagination-top");
 if(topPager){
  requestAnimationFrame(()=>{
   const reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
   topPager.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"});
  });
 }
}
search.addEventListener("input",()=>{page=1;writeUrl("replace");render()});
if(loaderSelect)loaderSelect.addEventListener("change",()=>{page=1;writeUrl("push");render()});
if(versionSelect)versionSelect.addEventListener("change",()=>{page=1;writeUrl("push");render()});
if(filterClear)filterClear.addEventListener("click",()=>{
 search.value="";
 if(loaderSelect)loaderSelect.value="";
 if(versionSelect)versionSelect.value="";
 page=1;writeUrl("push");render();
});
if(searchClear)searchClear.addEventListener("click",()=>{search.value="";page=1;writeUrl("replace");render();search.focus()});
window.addEventListener("popstate",()=>{
 const state=urlState();page=state.page;search.value=state.q;
 if(loaderSelect)loaderSelect.value=state.loader;
 if(versionSelect)versionSelect.value=[...versionSelect.options].some(o=>o.value===state.version)?state.version:"";
 render();
});
render();
})();