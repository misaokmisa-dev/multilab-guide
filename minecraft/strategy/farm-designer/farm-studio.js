/* MULTI LAB GUIDE — Farm Studio (edition-aware construction workspace). */
(()=>{
"use strict";
const data=window.MLG_FARM_DATA;
const $=id=>document.getElementById(id);
if(!data?.farms?.length){const root=$("fs-status");if(root)root.textContent="装置データが読み込めませんでした。ページを更新してください。";return;}
const farms=data.farms;
const farmMap=new Map(farms.map(f=>[f.id,f]));
const itemNames=new Map([...(window.MLG_ITEMS?.items||[]),...(window.MLG_ITEM_ADDITIONS?.items||[])].map(x=>[x[1],x[2]]));
const itemName=slug=>itemNames.get(slug)||slug.replaceAll("_"," ");
const colors={準備:"note",環境:"note",条件:"note",組立:"warn",検証:"ok",土台:"note",収穫:"warn",検知:"note",配線:"warn",回収:"ok"};
const params=new URLSearchParams(location.search);
const initialId=farmMap.has(params.get("farm"))?params.get("farm"):"iron";
const rawEdition=params.get("edition");
let edition=rawEdition==="bedrock"?"bedrock":"java", selectedId=initialId;
let priority=["beginner","simple","efficient"].includes(params.get("goal"))?params.get("goal"):"beginner";
let amount=Math.max(1,Math.min(16,Math.floor(Number(params.get("units"))||1)));
const lastSymptoms=new Map();
const buildStageByKey=new Map();
const buildDrawerOpenByKey=new Map();
let buildDrawerTimer=null,buildDrawerToken=0;
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
function checkData(){const v=safeStorage.get(storageKey());return {steps:v.steps||{},materials:v.materials||{},diagnostics:v.diagnostics||{}};}
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
  iron:{beginner:"最初に版ごとの村人・ベッド条件を成立させ、ゴーレムが実際に生成されるかを確認してから回収部を作りましょう。",simple:"床と水路の材料を減らしても、村人の睡眠・就業条件とゴーレムの生成空間は省略できません。",efficient:"生成場所の分散・既存ゴーレムの滞留・村の中心ずれを優先して調べ、再生成が継続するか観察しましょう。"},
  mob:{beginner:"まずは小さな暗室で距離と湧き条件を確認し、回収経路を動かしてから湧き床を増やしましょう。",simple:"湧き床を増やす前に既存の空間で湧き・誘導・回収が成立するか確認すると無駄な建材を抑えられます。",efficient:"待機位置・湧き上限の競合・処理詰まりを順に検証してください。統合版はシミュレーション距離の設定が特に重要です。"},
  slime:{beginner:"最初に版に合ったスライムチャンクを特定し、Y=40未満に試験用の湧き床を作ってから掘削を広げましょう。",simple:"広範囲を掘る前に、候補チャンクと待機位置が正しいかを小規模な湧き試験で確認しましょう。",efficient:"大型スライム用の空間、ほかのMobによる湧き上限の競合、回収経路の詰まりを優先して点検しましょう。"},
  sugar:{beginner:"まず1株で水・植え付け・成長検知・ピストン作動を確認し、その後で横に増設しましょう。",simple:"1株の試作で配線が成立したら隣の株と信号を共有できるか確認してください。材料表は株ごとの概算です。",efficient:"株数を増やす前に、成長検知後の回収率とアイテムの飛び散りを確認しましょう。"},
  bamboo:{beginner:"まず1株で必要な明るさ・成長空間・ピストンの高さを確認してから増設しましょう。",simple:"竹の栽培には隣接する水源は不要です。回収水路を設ける場合だけ水を追加しましょう。",efficient:"収穫物の取りこぼし・回収ホッパーの負荷・成長空間の不足を優先して点検しましょう。"}
 };
 $("fs-priority-tip").textContent=tips[selectedId][priority];
 const l=$("fs-units-control");
 l.hidden=!f.modules;
 if(f.modules){$("fs-unit-value").value=String(amount);$("fs-unit-label").textContent=f.modules.label+"（1〜"+f.modules.max+"株）";}
 const tools=$("fs-special-link");tools.replaceChildren();
 const guideSlugs={iron:"iron-golem",mob:"mob-tower",slime:"slime-farm",sugar:"sugar-cane",bamboo:"bamboo"};
 const guideLink=link("/minecraft/strategy/farm-designer/"+guideSlugs[selectedId]+".html","この装置の詳しい解説を見る →","fs-link-button fs-secondary");
 tools.append(guideLink);
 if(selectedId==="slime"){tools.append(link("/minecraft/strategy/slime-chunks/","スライムチャンクの座標を探す →","fs-link-button"));}
 else if(selectedId==="iron"){tools.append(link("/minecraft/strategy/items/","鉄・ベッド・作業ブロックを図鑑で調べる →","fs-link-button"));}
 else tools.append(link("/minecraft/tools/material-planner.html","材料まとめて逆算ツールへ →","fs-link-button"));
}
function materialItems(f){return (f.modules?.materialPerUnit||[]).map(([slug,qty])=>({slug,qty:qty*amount}));}
function materialPlanURL(f){
 const entries=materialItems(f);if(!entries.length)return null;
 return "/minecraft/tools/material-planner.html?plan="+encodeURIComponent(entries.map(x=>x.slug+":"+x.qty).join(","));
}
/* Use Minecraft's actual inventory/item artwork; never substitute unrelated block faces. */
function materialIcon(slug,name){
 const base="https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21.11/assets/minecraft/textures/";
 const itemTextures=new Set(["sugar_cane","redstone","bamboo"]);
 const faceFallback={sand:"sand",dirt:"dirt",cobblestone:"cobblestone",piston:"piston_top",observer:"observer_front"};
 const wikiName=slug.split("_").map(w=>w?w[0].toUpperCase()+w.slice(1):"").join("_");
 const url=itemTextures.has(slug)?base+"item/"+encodeURIComponent(slug)+".png":
  "https://minecraft.wiki/images/Invicon_"+encodeURIComponent(wikiName)+".png";
 const icon=element("span","fs-material-icon");
 const img=element("img","fs-material-image");
 img.src=url;img.alt=name;img.width=42;img.height=42;
 img.loading="lazy";img.decoding="async";
 const fallback=faceFallback[slug];
 img.onerror=()=>{
  if(fallback&&img.getAttribute("data-fallback")!=="1"){
   img.setAttribute("data-fallback","1");
   img.src=base+"block/"+fallback+".png";
  }else{img.hidden=true;icon.title=name+"の画像を読み込めませんでした";}
 };
 icon.append(img);return icon;
}
function renderMaterials(f){
 const host=$("fs-materials"), btn=$("fs-plan-button"), copy=$("fs-copy-materials");
 host.replaceChildren();const items=materialItems(f);
 if(!items.length){
 host.append(element("p","fs-muted","この装置は版・方式によって材料数が大きく変わるため、誤った固定個数を表示しません。選択した版の条件と詳しい解説を確認してから、実際に使用する設計の必要数を材料まとめて逆算ツールへ入力してください。"));
 btn.href="/minecraft/tools/material-planner.html";btn.textContent="材料まとめて逆算ツールを開く →";
 copy.hidden=true;$("fs-material-note").textContent="村の条件や湧き条件は確定情報ですが、完全な施工用材料表はこのページにはまだありません。";return;
 }
 const count=element("p","fs-material-head",amount+"株の基本ユニット用・材料の目安");
 host.append(count);
 for(const x of items){
  const row=element("div","fs-material");
  const i=element("a","fs-material-name");
  i.href="/minecraft/tools/material-planner.html?item="+encodeURIComponent(x.slug);
  const name=itemName(x.slug);
  i.append(materialIcon(x.slug,name),element("span","fs-material-item-label",name));
  row.append(i);
  p("strong","fs-material-qty",x.qty+"個",row);host.append(row);
 }
 btn.href=materialPlanURL(f);btn.textContent="この材料に必要な素材をまとめて逆算する→";
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
function renderLayerGuide(f,animateDrawer=false){
 const wrapper=$("fs-layer-guide"),drawer=$("fs-layer-detail"),inner=$("fs-layer-detail-content");
 if(!wrapper||!drawer||!inner)return;
 if(buildDrawerTimer!==null){clearTimeout(buildDrawerTimer);buildDrawerTimer=null;}
 const renderToken=++buildDrawerToken;
 const crop=f.id==="sugar"?"サトウキビ":f.id==="bamboo"?"竹":null;
 wrapper.hidden=!crop;
 if(!crop){drawer.classList.remove("is-open");if(window.MLG_RENDER_FARM_BLOCKS)window.MLG_RENDER_FARM_BLOCKS(f.id,edition,0);return;}
 const sugar=f.id==="sugar",name=crop;
 const steps=[
  {
   title:"土台"+(sugar?"・水源":"を配置"),tag:"準備",
   instructions:sugar?
    "砂または土などを1ブロック置き、必ず真横に水源を設けます。図では苗の右隣を水源にします。水が横に漏れないよう囲い、増設するときは水路を共有できます。":
    "土など竹を植えられるブロックを1つ置きます。竹には隣接する水が不要です。上方向に伸びる空間を確保してください。",
   check:"土台"+(sugar?"と水源":"と成長空間")+"を確認した"
  },
  {
   title:"根元を植える",tag:"植え付け",
   instructions:name+"を土台に1本植えます。1段目の根元は収穫時も壊しません。2段目・3段目は成長する場所なので、そこへ別のブロックを置かないでください。",
   check:"根元を植え、上の空間を確保した"
  },
  {
   title:"ピストンと支持ブロック",tag:"収穫",
   instructions:"根元の1段上（2段目）に、作物に向けて普通のピストンを置きます。同じ高さの、ピストンの背面に接する位置に不透明な普通の固体ブロックを1個置きます。そこがレッドストーンの支持ブロックです。配置用の仮足場は完成後に撤去します。",
   check:"2段目のピストンの向きと背面ブロックを確認した"
  },
  {
   title:"オブザーバーと配線",tag:"検知・配線",
   instructions:"ピストンの真上（3段目の高さ）にオブザーバーを置き、顔（検知面）を作物側に向けます。背面の赤い出力が後ろの支持ブロック上のレッドストーンダストにつながるようにします。ダストはピストンの真上に置かず、背面ブロックの上に置きます。",
   check:"観察面・背面出力・ダストのつながりを確認した"
  },
  {
   title:"回収・試運転",tag:"完成確認",
   instructions:"前面に落下物を受ける水路を作り、終点をホッパーとチェストへつなぎます。回収を強化するなら土台の下にレール＋ホッパー付きトロッコを設ける方式も選べます。収穫物が散らないようガラスなどで囲い、成長したときピストンが動いて根元が残ることを確認します。",
   check:"ピストン動作・根元・回収先を実際に確認した"
  }
 ];
 const id=f.id+":"+edition,storeKey="mlg-farm-build:v1:"+id;
 const saved=safeStorage.get(storeKey);
 const current=Math.max(0,Math.min(steps.length-1,buildStageByKey.has(id)?buildStageByKey.get(id):(Number(saved.step)||0)));
 buildStageByKey.set(id,current);
 if(!buildDrawerOpenByKey.has(id))buildDrawerOpenByKey.set(id,true);
 const open=buildDrawerOpenByKey.get(id);
 const nav=$("fs-layer-steps");nav.replaceChildren();
 for(let i=0;i<steps.length;i++){
  const tab=element("button","fs-build-step-tab"+(i===current?" is-active":""));
  tab.type="button";
  tab.setAttribute("aria-pressed",String(i===current));
  tab.setAttribute("aria-expanded",String(i===current&&open));
  tab.setAttribute("aria-controls","fs-layer-detail");
  tab.textContent=(i+1)+". "+steps[i].title;
  on(tab,"click",()=>{
   const isSame=i===current;
   buildDrawerOpenByKey.set(id,isSame?!buildDrawerOpenByKey.get(id):true);
   if(!isSame){
    buildStageByKey.set(id,i);
    const next=safeStorage.get(storeKey);next.step=i;safeStorage.set(storeKey,next);
   }
   renderLayerGuide(f,true);
   notify("construction","diagram_step");
  });
  nav.append(tab);
 }
 const editionNote=sugar?
  (edition==="java"?"Java版：サトウキビは骨粉で育たないため、自然成長を待って動作確認してください。":"統合版：骨粉でサトウキビの成長を促して試運転できます。"):
  "竹：成長する先端には明るさレベル9以上が必要です。";
 const populate=()=>{
  inner.replaceChildren();
  p("h4","",(current+1)+" / "+steps.length+"　"+steps[current].title,inner);
  p("p","",steps[current].instructions,inner);
  p("p","fs-caption",editionNote,inner);
  drawer.setAttribute("aria-label","工程 "+(current+1)+"："+steps[current].title);
 };
 if(animateDrawer&&drawer.classList.contains("is-open")){
  // Retraction first, then the new step opens at precisely the same anchor.
  drawer.classList.remove("is-open");
  if(open){
   buildDrawerTimer=setTimeout(()=>{
    buildDrawerTimer=null;
    if(buildDrawerToken!==renderToken)return;
    populate();
    requestAnimationFrame(()=>{
     if(buildDrawerToken===renderToken)drawer.classList.add("is-open");
    });
   },170);
  }
 }else{
  populate();
  if(animateDrawer&&open){
   drawer.classList.remove("is-open");
   requestAnimationFrame(()=>{
    if(buildDrawerToken===renderToken)drawer.classList.add("is-open");
   });
  }else drawer.classList.toggle("is-open",open);
 }
 if(window.MLG_RENDER_FARM_BLOCKS)window.MLG_RENDER_FARM_BLOCKS(f.id,edition,current);
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
 const picker=$("fs-symptom"), key=selectedId+":"+edition;
 const prior=lastSymptoms.get(key);
 picker.replaceChildren();
 for(const c of f.checks){const option=element("option","",c.issue);option.value=c.issue;picker.append(option);}
 const selected=f.checks.find(c=>c.issue===prior)||f.checks[0];
 picker.value=selected.issue;
 renderDiagnostic(selected);
}
function renderDiagnostic(c){
 const host=$("fs-diagnosis"), counter=$("fs-diagnosis-progress");
 host.replaceChildren();
 const lines=c[edition]||c.both||[];
 const symptomKey=selectedId+":"+edition;
 lastSymptoms.set(symptomKey,c.issue);
 const storageId=c.issue;
 const state=checkData();
 const checked=state.diagnostics[storageId]||{};
 const update=()=>{
  const done=lines.reduce((n,_,i)=>n+(checked[i]?1:0),0);
  counter.textContent=done+" / "+lines.length+" 項目を確認済み";
 };
 lines.forEach((line,i)=>{
  const li=element("li","fs-diagnosis-row");
  const label=element("label","fs-diagnosis-check");
  const input=element("input","fs-diagnosis-checkbox");input.type="checkbox";
  input.checked=!!checked[i];input.setAttribute("aria-label","確認済み："+line);
  const text=element("span","",line);
  label.append(input,text);li.append(label);host.append(li);
  on(input,"change",()=>{
   checked[i]=input.checked;
   const next=checkData();next.diagnostics[storageId]=checked;saveChecked(next);
   update();notify("diagnosis","cause_checked");
  });
 });
 update();
}

function renderRefs(f){const host=$("fs-references");host.replaceChildren();
 for(const [label,href] of f.refs){const l=element("li");const a=link(href,label);if(/^https?:/.test(href)){a.target="_blank";a.rel="noopener noreferrer";}l.append(a);host.append(l);}
}
function render(){
 const f=project();
 renderFarmCards();renderHeadline(f);renderMaterials(f);renderDiagram(f);renderLayerGuide(f);renderSteps(f);renderTrouble(f);renderRefs(f);encodeRoute();
}
on($("fs-edition"),"change",e=>{edition=e.target.value==="bedrock"?"bedrock":"java";render();notify("change","edition_changed");});
on($("fs-priority"),"change",e=>{priority=e.target.value;render();notify("change","goal_changed");});
on($("fs-unit-value"),"change",e=>{const max=project().modules?.max||16;amount=Math.max(1,Math.min(max,Math.floor(Number(e.target.value)||1)));safeStorage.set("mlg-farm-units:"+selectedId,{units:amount});render();notify("change","modules_changed");});
on($("fs-symptom"),"change",e=>{const f=project();const c=f.checks.find(c=>c.issue===e.target.value)||f.checks[0];renderDiagnostic(c);notify("diagnosis","symptom_selected");});
on($("fs-reset-diagnosis"),"click",()=>{const c=project().checks.find(x=>x.issue===$("fs-symptom").value);if(!c)return;const state=checkData();delete state.diagnostics[c.issue];saveChecked(state);renderDiagnostic(c);notify("diagnosis","reset");});
on($("fs-reset"),"click",()=>{const state=checkData();state.steps={};saveChecked(state);renderSteps(project());notify("progress","reset");});
on($("fs-copy-materials"),"click",async()=>{
 const f=project(),rows=materialItems(f);const content=f.title+" / "+(edition==="java"?"Java版":"統合版")+"\n"+rows.map(x=>itemName(x.slug)+" ×"+x.qty).join("\n")+"\n※ "+f.modules.notes;
 try{await navigator.clipboard.writeText(content);$("fs-copy-materials").textContent="コピーしました ✓";notify("copy","materials");}catch(_){$("fs-copy-materials").textContent="コピーできませんでした";}
});
on($("fs-copy-share"),"click",async()=>{try{await navigator.clipboard.writeText(location.href);$("fs-copy-share").textContent="URLをコピーしました ✓";notify("copy","share");}catch(_){$("fs-copy-share").textContent="コピーできませんでした";}});
render();
window.MLG_FARM_STUDIO_TEST={farmMap,materialItems,materialPlanURL,project,render,checkData};
})();