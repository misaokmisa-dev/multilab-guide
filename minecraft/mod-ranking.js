/* Minecraft MOD ranking: 3 categories × 100 verified downloads,
 * 20 per page; browsable and shareable category/page URLs.
 * Counts sourced from a dated Modrinth snapshot, not user counts.
 */
(() => {
"use strict";
const snapshot = window.MLG_MOD_DATA;
const tabs = [...document.querySelectorAll("[data-mod-tab]")];
const list = document.getElementById("md-mod-list");
const search = document.getElementById("md-search");
const count = document.getElementById("md-mod-count");
const updated = document.getElementById("md-updated");
const pagers = [document.getElementById("md-pagination-top"),document.getElementById("md-pagination-bottom")].filter(Boolean);
const summary = document.getElementById("md-page-summary");
const searchClear = document.getElementById("md-search-clear");
const anchor = document.getElementById("ranking");
if (!snapshot || !list || !search) return;
const source = snapshot.lists;
const labels = {all:"総合",utility:"便利・軽量化",play:"遊ぶ・冒険"};
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
 const requested=params.get("category");
 const category=Object.prototype.hasOwnProperty.call(source,requested)?requested:"all";
 const rawPage=Number(params.get("page"));
 const page=Number.isInteger(rawPage)?Math.max(1,Math.min(5,rawPage)):1;
 return {category,page,q:params.get("q")||""};
};
const initial=urlState();
let category=initial.category,page=initial.page;
search.value=initial.q;

function filtered(){
 const q=search.value.toLocaleLowerCase("ja").trim();
 const entries=source[category]||[];
 return entries.map((item,rank)=>({item,rank:rank+1})).filter(({item})=>!q||
  [item.title,item.description,item.slug].join(" ").toLocaleLowerCase("ja").includes(q));
}
function writeUrl(mode){
 if(!window.history||!window.location)return;
 const url=new URL(window.location.href);
 url.searchParams.set("category",category);
 if(page>1)url.searchParams.set("page",String(page));else url.searchParams.delete("page");
 const q=search.value.trim();
 if(q)url.searchParams.set("q",q);else url.searchParams.delete("q");
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
 layout.append(button("← 前へ","md-page-prev",current<=1,()=>go(current-1,true),"前の20位を表示"));
 const numbers=el("div","md-page-numbers");
 for(let i=1;i<=pages;i++){
  const first=(i-1)*pageSize+1,last=Math.min(i*pageSize,total);
  const b=el("button","md-page-number"+(i===current?" is-active":""),String(i));
  b.type="button";
  b.setAttribute("aria-label",i+"ページ目（"+first+"〜"+last+"位）");
  if(i===current)b.setAttribute("aria-current","page");
  const small=el("span","md-page-range",first+"–"+last);
  b.append(small);
  b.addEventListener("click",()=>go(i,true));
  numbers.append(b);
 }
 layout.append(numbers);
 layout.append(button("次へ →","md-page-next",current>=pages,()=>go(current+1,true),"次の20位を表示"));
 target.append(layout);
}
function render(){
 const entries=filtered();
 const total=entries.length,pages=Math.max(1,Math.ceil(total/pageSize));
 page=Math.max(1,Math.min(page,pages));
 tabs.forEach(tab=>{
  const yes=tab.dataset.modTab===category;
  tab.setAttribute("aria-selected",String(yes));
  tab.tabIndex=yes?0:-1;
 });
 const panel=document.getElementById("md-ranking-panel");
 if(panel)panel.setAttribute("aria-labelledby","md-tab-"+category);
 if(summary)summary.textContent=descriptions[category];
 const first=(page-1)*pageSize;
 const current=entries.slice(first,first+pageSize);
 count.textContent=search.value.trim()
  ? labels[category]+"：検索結果 "+total+"件｜"+(total?first+1:0)+"〜"+Math.min(first+pageSize,total)+"件を表示"
  : labels[category]+"：100位まで｜"+(first+1)+"〜"+Math.min(first+pageSize,total)+"位を表示";
 if(updated)updated.textContent="Modrinthの累計DL数｜"+snapshot.asOf.replaceAll("-","/")+" 取得";
 if(searchClear)searchClear.hidden=!search.value.trim();
 pagers.forEach(p=>renderPager(p,total,page));
 list.replaceChildren();
 if(!current.length){list.append(el("li","md-no-results","該当するMODはありません。検索語を変えてください。"));return;}
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
function go(value,scroll){
 const max=Math.max(1,Math.ceil(filtered().length/pageSize));
 const next=Math.max(1,Math.min(value,max));
 if(next===page)return;
 page=next;
 writeUrl("push");
 render();
 if(scroll&&anchor)anchor.scrollIntoView({behavior:"smooth",block:"start"});
}
function switchTab(next,focus){
 if(!Object.prototype.hasOwnProperty.call(source,next))return;
 category=next;page=1;
 writeUrl("push");render();
 if(focus){const tab=tabs.find(t=>t.dataset.modTab===next);if(tab)tab.focus();}
}
tabs.forEach((t,i)=>{
 t.addEventListener("click",()=>switchTab(t.dataset.modTab,false));
 t.addEventListener("keydown",ev=>{
  if(ev.key!=="ArrowLeft"&&ev.key!=="ArrowRight")return;
  ev.preventDefault();
  switchTab(tabs[(i+(ev.key==="ArrowRight"?1:tabs.length-1))%tabs.length].dataset.modTab,true);
 });
});
search.addEventListener("input",()=>{page=1;writeUrl("replace");render()});
if(searchClear)searchClear.addEventListener("click",()=>{search.value="";page=1;writeUrl("replace");render();search.focus()});
window.addEventListener("popstate",()=>{
 const state=urlState();category=state.category;page=state.page;search.value=state.q;render();
});
render();
})();