/* Minecraft MOD download rankings — source: Modrinth official API.
 * Snapshot shown immediately, refreshed when API is reachable. Downloads
 * are cumulative Modrinth downloads, not unique players.
 */
(() => {
"use strict";
const snapshot=window.MLG_MOD_DATA;
const tabs=[...document.querySelectorAll("[data-mod-tab]")];
const list=document.getElementById("md-mod-list");
const search=document.getElementById("md-search");
const counter=document.getElementById("md-mod-count");
const updated=document.getElementById("md-updated");
if(!snapshot||!list)return;
const categoryNames={all:"総合ランキング",utility:"便利・軽量化ランキング",play:"遊び・冒険ランキング"};
const utilityExceptions=new Set(["jei","jade","moreculling"]);
const gameplaySlugs=new Set(window.MLG_PLAY_MOD_SLUGS||[]);
const allDescriptions=new Map();
Object.values(snapshot.lists).flat().forEach(p=>{if(!allDescriptions.has(p.slug))allDescriptions.set(p.slug,p.description)});
let data={...snapshot.lists},active="all";
const fmt=new Intl.NumberFormat("ja-JP");
const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;};
function labelCount(n){return fmt.format(n)+" DL";}
function itemsFor(kind){
 const value=(search.value||"").toLocaleLowerCase("ja").trim();
 return (data[kind]||[]).filter(p=>!value||[p.title,p.description,p.slug].join(" ").toLocaleLowerCase("ja").includes(value));
}
function render(){
 const items=itemsFor(active);
 list.replaceChildren();
 counter.textContent=categoryNames[active]+" — "+items.length+"件 / 20件";
 if(!items.length){list.append(el("li","md-no-results","該当するMODがありません。検索語を変えてください。"));return;}
 items.forEach(p=>{
  const rank=(data[active]||[]).findIndex(x=>x.slug===p.slug)+1;
  const item=el("li","md-mod-item");
  item.dataset.rank=String(rank);
  const rankNode=el("span","md-mod-rank",String(rank));
  const icon=el("img","md-mod-icon");
  icon.loading="lazy";icon.decoding="async";icon.width=53;icon.height=53;
  icon.alt="";if(p.icon&&/^https:\/\//.test(p.icon))icon.src=p.icon;
  else {icon.style.visibility="hidden";}
  const body=el("div","md-mod-body");
  body.append(el("h3","md-mod-title",p.title),el("p","md-mod-desc",p.description));
  const tags=el("div","md-mod-tags");
  (p.loaders||[]).slice(0,3).forEach(v=>tags.append(el("span","",v==="neoforge"?"NeoForge":v==="fabric"?"Fabric":v==="forge"?"Forge":"Quilt")));
  if(p.categories?.includes("library"))tags.append(el("span","","前提ライブラリ"));
  body.append(tags);
  const row=el("div","md-mod-actions");
  const count=el("span","md-mod-dl");
  count.append(el("b","",fmt.format(p.downloads)),document.createTextNode(" DL"));
  const link=el("a","md-mod-link","公式MODページを見る ↗");
  link.href="https://modrinth.com/mod/"+encodeURIComponent(p.slug);
  link.target="_blank";link.rel="noopener noreferrer";
  row.append(count,link);body.append(row);
  item.append(rankNode,icon,body);list.append(item);
 });
}
function activate(kind,focus){
 if(!data[kind])return;
 active=kind;
 tabs.forEach(tab=>{
  const chosen=tab.dataset.modTab===kind;
  tab.setAttribute("aria-selected",chosen?"true":"false");tab.tabIndex=chosen?0:-1;
  if(chosen&&focus)tab.focus();
 });
 render();
}
tabs.forEach((t,i)=>{
 t.addEventListener("click",()=>activate(t.dataset.modTab,false));
 t.addEventListener("keydown",ev=>{
  if(ev.key!=="ArrowRight"&&ev.key!=="ArrowLeft")return;
  ev.preventDefault();activate(tabs[(i+(ev.key==="ArrowRight"?1:tabs.length-1))%tabs.length].dataset.modTab,true);
 });
});
search.addEventListener("input",render);
render();
function toRecord(h){
 return {
  slug:h.slug,title:h.title,
  description:allDescriptions.get(h.slug)||h.description,
  downloads:h.downloads,
  categories:h.categories||[],
  loaders:(h.categories||[]).filter(c=>["fabric","forge","neoforge","quilt"].includes(c)),
  icon:h.icon_url||""
 };
}
function filter(kind,hits){
 if(kind==="utility")return hits.filter(h=>!(h.categories||[]).includes("library")||utilityExceptions.has(h.slug)).slice(0,20);
 if(kind==="play")return hits.filter(h=>gameplaySlugs.has(h.slug)).slice(0,20);
 return hits.slice(0,20);
}
const filters={
 all:[["project_type:mod"]],
 utility:[["project_type:mod"],["categories:utility","categories:optimization","categories:management","categories:storage"]],
 play:[["project_type:mod"],["categories:adventure","categories:game-mechanics","categories:worldgen","categories:magic","categories:mobs","categories:technology","categories:food","categories:transportation"]]
};
async function update(){
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),9500);
 try{
  const pairs=await Promise.all(Object.entries(filters).map(async ([kind,facets])=>{
   const params=new URLSearchParams({index:"downloads",limit:"100",facets:JSON.stringify(facets)});
   const response=await fetch("https://api.modrinth.com/v2/search?"+params,{signal:controller.signal});
   if(!response.ok)throw new Error("API "+response.status);
   const json=await response.json();
   if(!Array.isArray(json.hits))throw new Error("No project data");
   const chosen=filter(kind,json.hits);
   if(chosen.length!==20)throw new Error("Fewer than 20 items for "+kind);
   return [kind,chosen.map(toRecord)];
  }));
  data=Object.fromEntries(pairs);
  updated.textContent="最新の累計DL数を取得しました";
  render();
 }catch(err){updated.textContent="掲載数値：2026年10月26日取得のスナップショット";}finally{clearTimeout(timeout);}
}
update();
})();
