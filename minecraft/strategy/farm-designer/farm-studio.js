/* MULTI LAB GUIDE — Farm Studio (edition-aware construction workspace). */
(()=>{
"use strict";
const data=window.MLG_FARM_DATA;
const $=id=>document.getElementById(id);
if(!data?.farms?.length){const root=$("fs-status");if(root)root.textContent="装置データが読み込めませんでした。ページを更新してください。";return;}
const farms=data.farms;
const farmMap=new Map(farms.map(f=>[f.id,f]));
const colors={準備:"note",環境:"note",条件:"note",組立:"warn",検証:"ok",土台:"note",収穫:"warn",検知:"note",配線:"warn",回収:"ok"};
const params=new URLSearchParams(location.search);
const initialId=farmMap.has(params.get("farm"))?params.get("farm"):"iron";
const rawEdition=params.get("edition");
let edition=rawEdition==="bedrock"?"bedrock":"java", selectedId=initialId;
let priority=["beginner","simple","efficient"].includes(params.get("goal"))?params.get("goal"):"beginner";
let amount=Math.max(1,Math.min(16,Math.floor(Number(params.get("units"))||1)));
const stateVersion="v1";
const safeStorage={
 get(k){try{return JSON.parse(localStorage.getItem(k))||{}}catch(_){return{}}},
 set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(_){/* local mode unavailable */}}
};
function storageKey(){return"mlg-farm-progress:"+stateVersion+":"+selectedId+":"+edition;}
function project(){return farmMap.get(selectedId);}
function on(el,event,fn){if(el)el.addEventListener(event,fn);}
function element(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n;}
function p(tag,cls,text,parent){const e=element(tag,cls,text);parent.append(e);return e;}
function link(href,label,cls){const e=element("a",cls||"",label);e.href=href;return e;}
function checkData(){const v=safeStorage.get(storageKey());return {steps:v.steps||{},materials:v.materials||{}};}
function saveChecked(checks){safeStorage.set(storageKey(),checks);}
function notify(event,action){try{if(typeof window.gtag==="function")window.gtag("event","mlg_farm_studio",{action,project:selectedId,edition,page_path:location.pathname});}catch(_){}}
function encodeRoute(){try{const url=new URL(location.href);url.searchParams.set("farm",selectedId);url.searchParams.set("edition",edition);url.searchParams.set("goal",priority);const f=project();if(f.modules)url.searchParams.set("units",String(amount));else url.searchParams.delete("units");history.replaceState(null,"",url);}catch(_){}}
function setState(id,ed){if(!farmMap.has(id))return;selectedId=id;if(ed)edition=ed;
 const f=project();if(f.modules){const remembered=safeStorage.get("mlg-farm-units:"+id);amount=Math.max(1,Math.min(f.modules.max,Math.floor(remembered.units||amount||f.modules.default)));}render();notify("change","farm_selected");}
function renderFarmCards(){const host=$("fs-farm-list");if(!host)return;host.replaceChildren();for(const f of farms){
 const card=element("button","fs-card"+(selectedId===f.id?" is-active":""));
 card.type="button";card.setAttribute("aria-pressed",String(selectedId===f.id));
 const badge=p("span","fs-card-type",f.difficulty,card);
 p("strong","fs-card-title",f.title,card);p("small","fs-card-sub",f.tag,card);
 const foot=p("span","fs-card-cta",selectedId===f.id?"選択中 ✓":"この装置を見る →",card);
 on(card,"click",()=>setState(f.id));host.append(card);
}}
function renderHeadline(f){
 $("fs-project-title").textContent=f.title;
 $("fs-project-desc").textContent=f.blurb;
 $("fs-project-level").textContent=f.difficulty+" ／ "+(f.level==="concept"?"基本機構の概念図":"機構条件チェック（配置未検証）");
 $("fs-edition").value=edition;$("fs-priority").value=priority;
 const warning=f.modes[edition].avoid;
 $("fs-version-summary").textContent=f.modes[edition].summary;
 $("fs-version-warning").textContent=warning;
 const req=$("fs-requirements");req.replaceChildren();
 for(const requirement of f.modes[edition].requirements)p("li","",requirement,req);
 const tips={
 beginner:"はじめて作る場合は、まず条件と最小ユニットの動作確認から。大量増設は最後に行うのがおすすめです。",
 simple:"材料を節約する場合も、村の成立条件・信号系・回収部の省略は避けてください。",
 efficient:"効率優先の場合は湧き条件・待機位置・回収詰まり・処理速度を先に検証してください。"
 };
 $("fs-priority-tip").textContent=tips[priority];
 const l=$("fs-units-control");
 l.hidden=!f.modules;
 if(f.modules){$("fs-unit-value").value=String(amount);$("fs-unit-label").textContent=f.modules.label+"（1〜"+f.modules.max+"株）";}
 const tools=$("fs-special-link");tools.replaceChildren();
 if(selectedId==="slime"){tools.append(link("/minecraft/strategy/slime-chunks/","スライムチャンクの座標を探す →","fs-link-button"));}
 else if(selectedId==="iron"){tools.append(link("/minecraft/strategy/items/","鉄・ベッド・作業ブロックを図鑑で調べる →","fs-link-button"));}
 else tools.append(link("/minecraft/tools/material-planner.html","材料まとめて逆算ツールへ →","fs-link-button"));
}
function renderEssentials(f){const list=$("fs-essentials");list.replaceChildren();
 for(const x of f.essentials){
 const card=element("div","fs-essential");p("strong","",x.label,card);p("span","",x[edition]||x.both||"",card);list.append(card);}
}
function materialItems(f){return (f.modules?.materialPerUnit||[]).map(([slug,qty])=>({slug,qty:qty*amount}));}
function materialPlanURL(f){
 const entries=materialItems(f);if(!entries.length)return null;
 return "/minecraft/tools/material-planner.html?plan="+encodeURIComponent(entries.map(x=>x.slug+":"+x.qty).join(","));
}
function renderMaterials(f){
 const host=$("fs-materials"), btn=$("fs-plan-button"), copy=$("fs-copy-materials");
 host.replaceChildren();const items=materialItems(f);
 if(!items.length){
 host.append(element("p","fs-muted","この装置は版・方式によって材料数が大きく変わるため、誤った固定個数を表示しません。下の「構成の必要条件」を確認してから、実際に使用する設計の必要数を材料まとめて逆算ツールへ入力してください。"));
 btn.href="/minecraft/tools/material-planner.html";btn.textContent="材料まとめて逆算ツールを開く →";
 copy.hidden=true;$("fs-material-note").textContent="村の条件や湧き条件は確定情報ですが、完全な施工用材料表はこのページにはまだありません。";return;
 }
 const count=element("p","fs-material-head",amount+"株の基本ユニット用・材料の目安");
 host.append(count);
 for(const x of items){
  const row=element("div","fs-material");
  const i=element("a","fs-material-name",x.slug.replaceAll("_"," "));
  i.href="/minecraft/tools/material-planner.html?item="+encodeURIComponent(x.slug);row.append(i);
  p("strong","",x.qty+"個",row);host.append(row);
 }
 btn.href=materialPlanURL(f);btn.textContent="この材料をまとめて逆算する →";
 copy.hidden=false;
 $("fs-material-note").textContent=f.modules.notes+" 必要な水・回収設備・レール等は方式により追加してください。";
}
function renderDiagram(f){
 const host=$("fs-diagram");host.replaceChildren();
 const parts=f.id==="sugar"?[
 ["水と植える土台","water"],["根元を残す","base"],["2段目をピストンで押す","piston"],["3段目の成長を観測","observer"],["回路 → 回収","collect"]
 ]:f.id==="bamboo"?[
 ["水不要・栽培土台","base"],["根元を残す","plant"],["上側をピストンで収穫","piston"],["オブザーバーで検知","observer"],["回路 → 回収","collect"]
 ]:f.id==="iron"?[
 ["村人と条件","base"],["有効な生成場所","spawn"],["ゴーレムの移送","flow"],["処理と回収","collect"]
 ]:f.id==="slime"?[
 ["スライムチャンク判定","base"],["Y=40未満の空間","spawn"],["誘導ルート","flow"],["処理と回収","collect"]
 ]:[
 ["難易度・湧き距離","base"],["暗室・湧き床","spawn"],["Mobの誘導","flow"],["処理と回収","collect"]
 ];
 for(let ix=0;ix<parts.length;ix++){
  const part=element("div","fs-diagram-node fs-node-"+parts[ix][1]);
  p("small","",String(ix+1).padStart(2,"0"),part);p("strong","",parts[ix][0],part);host.append(part);
  if(ix<parts.length-1)p("span","fs-diagram-arrow","→",host);
 }
 $("fs-diagram-note").textContent=f.level==="validation"?
 "成立条件と構成の概念図です。正確なサイズ・高さ・ブロック配置を示す施工図ではありません。異なる版の設計を混ぜず、工程ごとに実際の動作を確認してください。":
 "1株を横に増やせる基本機構の概念図です。レッドストーンの向き・配線・回収設備の正確な位置を示す施工図ではありません。";
}
function progressLabel(f,checks){
 const done=f.stages.filter((_,i)=>!!checks.steps[i]).length,total=f.stages.length;
 const progress=Math.round(done/total*100);
 $("fs-progress-label").textContent=done+" / "+total+" 工程完了";
 $("fs-progress-bar").style.width=progress+"%";
 $("fs-progress").setAttribute("aria-valuenow",String(progress));
}
function renderSteps(f){
 const host=$("fs-steps");host.replaceChildren();const checks=checkData();
 f.stages.forEach((st,i)=>{
  const row=element("li","fs-step"+(checks.steps[i]?" is-complete":""));
  const label=element("label","fs-step-main");const check=element("input","fs-step-checkbox");
  check.type="checkbox";check.checked=!!checks.steps[i];check.setAttribute("aria-label",st.title+"を完了");
  const copy=element("div","fs-step-body");
  const heading=element("div","fs-step-heading");p("small","fs-step-number","STEP "+(i+1),heading);
  p("strong","",st.title,heading);p("span","fs-step-tag "+(colors[st.tag]||"note"),st.tag,heading);
  copy.append(heading);p("p","",st.body,copy);
  label.append(check,copy);row.append(label);host.append(row);
  on(check,"change",()=>{const state=checkData();state.steps[i]=check.checked;saveChecked(state);row.classList.toggle("is-complete",check.checked);progressLabel(f,state);notify("progress","step_checked");});
 });
 progressLabel(f,checks);
}
function renderTrouble(f){
 const picker=$("fs-symptom");picker.replaceChildren();for(const c of f.checks){const option=element("option","",c.issue);option.value=c.issue;picker.append(option);}
 renderDiagnostic(f.checks[0]);
}
function renderDiagnostic(c){
 const host=$("fs-diagnosis");host.replaceChildren();
 for(const line of c[edition]||c.both||[])p("li","",line,host);
}
function renderRefs(f){const host=$("fs-references");host.replaceChildren();
 for(const [label,href] of f.refs){const l=element("li");const a=link(href,label);if(/^https?:/.test(href)){a.target="_blank";a.rel="noopener noreferrer";}l.append(a);host.append(l);}
}
function render(){
 const f=project();
 renderFarmCards();renderHeadline(f);renderEssentials(f);renderMaterials(f);renderDiagram(f);renderSteps(f);renderTrouble(f);renderRefs(f);encodeRoute();
}
on($("fs-edition"),"change",e=>{edition=e.target.value==="bedrock"?"bedrock":"java";render();notify("change","edition_changed");});
on($("fs-priority"),"change",e=>{priority=e.target.value;render();notify("change","goal_changed");});
on($("fs-unit-value"),"change",e=>{const max=project().modules?.max||16;amount=Math.max(1,Math.min(max,Math.floor(Number(e.target.value)||1)));safeStorage.set("mlg-farm-units:"+selectedId,{units:amount});render();notify("change","modules_changed");});
on($("fs-symptom"),"change",e=>{const f=project();const c=f.checks.find(c=>c.issue===e.target.value)||f.checks[0];renderDiagnostic(c);notify("diagnosis","symptom_selected");});
on($("fs-reset"),"click",()=>{const state=checkData();state.steps={};saveChecked(state);renderSteps(project());notify("progress","reset");});
on($("fs-copy-materials"),"click",async()=>{
 const f=project(),rows=materialItems(f);const content=f.title+" / "+(edition==="java"?"Java版":"統合版")+"\n"+rows.map(x=>x.slug.replaceAll("_"," ")+" ×"+x.qty).join("\n")+"\n※ "+f.modules.notes;
 try{await navigator.clipboard.writeText(content);$("fs-copy-materials").textContent="コピーしました ✓";notify("copy","materials");}catch(_){$("fs-copy-materials").textContent="コピーできませんでした";}
});
on($("fs-copy-share"),"click",async()=>{try{await navigator.clipboard.writeText(location.href);$("fs-copy-share").textContent="URLをコピーしました ✓";notify("copy","share");}catch(_){$("fs-copy-share").textContent="コピーできませんでした";}});
render();
window.MLG_FARM_STUDIO_TEST={farmMap,materialItems,materialPlanURL,project,render,checkData};
})();