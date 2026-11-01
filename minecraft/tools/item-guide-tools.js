/* MULTI LAB GUIDE Item Command Search + Craft Planner. Java data from the existing encyclopedia. */
(()=>{
"use strict";
const data=window.MLG_ITEMS, add=window.MLG_ITEM_ADDITIONS, rec=Object.assign({},window.MLG_RECIPES||{},window.MLG_RECIPES_2026||{});
const root="/minecraft/strategy/items/", $=id=>document.getElementById(id);
const tool=document.body.dataset.mlgTool||"";
if(!data||!Array.isArray(data.items)){const r=$("ml-tool-content");if(r)r.textContent="アイテムデータを読み込めませんでした。再読み込みしてください。";return;}
const items=[...data.items,...(add?.items||[])].map(a=>({id:a[0],slug:a[1],jp:a[2],en:a[3],cat:a[4],stack:a[5]||64,release:a[6]||"1.21.11"}));
const idMap=new Map(items.map(x=>[x.id,x])),slugMap=new Map(items.map(x=>[x.slug,x]));
const presets=["hopper","chest","torch","piston","observer","rail","dispenser","furnace","diamond_pickaxe","netherite_ingot","ender_chest","beacon"];
const aliases={hopper:"ホッパー アイテム仕分け",chest:"チェスト 箱",torch:"たいまつ 松明",crafting_table:"作業台",iron_ingot:"鉄 インゴット",diamond:"ダイヤ",oak_planks:"木材 板材",observer:"オブザーバー 観察者",piston:"ピストン 自動装置",redstone:"レッドストーン レッドダスト",dispenser:"ディスペンサー",rail:"レール"};
function norm(x){return String(x||"").normalize("NFKC").toLowerCase().replace(/[\u3041-\u3096]/g,ch=>String.fromCharCode(ch.charCodeAt(0)+96)).replace(/[\s　\-_'・。()（）/／！？、.,:]/g,"");}
function key(i){return norm([i.jp,i.en,i.slug,"minecraft:"+i.slug,aliases[i.slug]||""].join(" "));}
const tags=new Map(items.map(i=>[i.id,key(i)]));
function valid(i){return $("ml-preview")?.checked||i.release!=="26.4-snapshot-6";}
function lookup(word){const q=norm(word);if(!q)return presets.map(x=>slugMap.get(x)).filter(x=>x&&valid(x));return items.filter(i=>valid(i)&&tags.get(i.id).includes(q)).sort((a,b)=>rank(b,q)-rank(a,q)||a.jp.localeCompare(b.jp,"ja")).slice(0,35);}
function rank(i,q){const a=norm(i.jp),b=norm(i.slug),c=norm(i.en);return a===q||b===q?100:c===q?90:a.startsWith(q)?75:b.startsWith(q)?65:c.startsWith(q)?55:20;}
function el(tag,klass,txt){const e=document.createElement(tag);if(klass)e.className=klass;if(txt!==undefined)e.textContent=txt;return e;}
function linked(i,txt){const a=el("a","ml-i-link",txt||i.jp);a.href=root+"detail/"+encodeURIComponent(i.slug)+".html";return a;}
function picture(i,px){const a=el("span","ml-i-icon");const img=el("img");const asset="https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21.11/assets/minecraft/textures/";const base=i.slug.replace(/_(stairs|slab|wall)$/,"");
img.src=asset+"item/"+encodeURIComponent(i.slug)+".png";img.alt="";img.width=px;img.height=px;img.loading="lazy";img.decoding="async";img.onerror=()=>{if(!img.dataset.fallback){img.dataset.fallback="1";img.src=asset+"block/"+encodeURIComponent(base)+".png";}else{img.remove();a.textContent="◆";}};a.append(img);return a;}
function copy(text,button){if(navigator.clipboard?.writeText){navigator.clipboard.writeText(text).then(()=>{button.textContent="コピー済み ✓";}).catch(()=>{fallbackCopy(text,button);});}else fallbackCopy(text,button);}
function fallbackCopy(text,button){const ta=el("textarea");ta.value=text;ta.style.position="fixed";ta.style.left="-9999px";document.body.append(ta);ta.select();try{document.execCommand("copy");button.textContent="コピー済み ✓";}catch(_){button.textContent="選択してコピー";}ta.remove();}
function buttonCopy(text,label){const b=el("button","ml-i-button ml-i-copy",label||"コピー");b.type="button";b.addEventListener("click",()=>copy(text,b));return b;}
function count(n){return Number(n).toLocaleString("ja-JP");}
const input=$("ml-item-search"),matches=$("ml-item-results"),current=$("ml-current"),quantity=$("ml-amount");
let chosen=null, selectedRecipe=0;
function select(i,scroll){chosen=i;selectedRecipe=0;if(input)input.value=i.jp;if(matches)matches.hidden=true;render();if(scroll!==false&&current)current.scrollIntoView({behavior:"smooth",block:"nearest"});}
function list(){if(!input||!matches)return;matches.replaceChildren();const found=lookup(input.value);if(!found.length){matches.append(el("p","ml-i-muted","一致するアイテムがありません。日本語・英語名・IDで検索できます。"));}else{for(const i of found){const b=el("button","ml-i-option");b.type="button";b.append(picture(i,36));const span=el("span");span.append(el("strong","",i.jp),el("small","",i.en+" · minecraft:"+i.slug));b.append(span);b.addEventListener("click",()=>select(i));matches.append(b);}}matches.hidden=false;}
function selectedHeader(i){const h=el("div","ml-i-selected");h.append(picture(i,72));const right=el("div");right.append(el("h2","",i.jp),el("p","ml-i-english",i.en));const id=el("div","ml-i-idline");id.append(el("code","", "minecraft:"+i.slug),buttonCopy("minecraft:"+i.slug,"IDをコピー"));right.append(id);h.append(right);return h;}
function commandView(i){
 const code="/give @s minecraft:"+i.slug+" "+Math.min(2304,Math.max(1,Math.floor(Number(quantity?.value)||1)));
 const section=el("section","ml-i-result-section");section.append(el("h3","", "Java版 /give コマンド"));
 const row=el("div","ml-i-codebar");row.append(el("code","",code),buttonCopy(code,"コマンドをコピー"));section.append(row);
 if(i.release==="26.4-snapshot-6")section.append(el("p","ml-i-warning","開発版の追加アイテムです。対象スナップショット以外では使用できません。"));
 section.append(el("p","ml-i-muted","権限のあるワールドで使用できます。統合版では名称・コマンド仕様が異なるアイテムがあるため、この一覧のIDをそのまま保証しません。"));
 const bed=el("p","ml-i-muted");bed.append("統合版の構文について：");const link=el("a","", "Microsoft公式 /give コマンド資料");link.href="https://learn.microsoft.com/ja-jp/minecraft/creator/reference/content/commandsreference/examples/commands/give?view=minecraft-bedrock-stable";link.rel="noopener noreferrer";link.target="_blank";bed.append(link);section.append(bed);
 return section;
}
function recipeIds(r){return (r.s?r.s.flat():r.i||[]).filter(x=>x!==null&&x!==undefined).map(Number);}
function optionsFor(i){return (rec[String(i.id)]||[]).filter(r=>(r.s||r.i)&&recipeIds(r).length&&Number.isInteger(r.c||1)&&(r.c||1)>0);}
function recipeDescription(r){const needs=new Map();for(const id of recipeIds(r))needs.set(id,(needs.get(id)||0)+1);return [...needs].map(([id,n])=>(idMap.get(id)?.jp||"不明")+"×"+n).join("、")+" → "+(r.c||1)+"個";}
function expandPlan(item,amount,rootVariant){const raw=new Map(),steps=new Map(),left=new Map(),alerts=new Set(),cycles=new Set();
 function addTo(m,id,n){m.set(id,(m.get(id)||0)+n);}
 function requireItem(i,needed,path,depth){
  if(!i||!Number.isFinite(needed)||depth>22){if(i)addTo(raw,i.id,needed);alerts.add("複雑な依存・不明なデータは素材として数えています。");return;}
  if(path.has(i.id)){addTo(raw,i.id,needed);cycles.add(i.jp);return;}
  const stock=Math.min(left.get(i.id)||0,needed);if(stock){left.set(i.id,(left.get(i.id)||0)-stock);needed-=stock;}
  if(!needed)return;
  // Stop at readily collected base materials. Otherwise ingot ↔ nugget recipes
  // and planks ↔ logs can create misleading loops or unexpected raw materials.
  const baseMaterials=/(_planks|_ingot|_nugget)$/.test(i.slug)||["redstone","coal","charcoal","diamond","emerald","lapis_lazuli","quartz","flint","stick","string","leather","paper","slime_ball","iron_block","gold_block"].includes(i.slug);
  if(depth>0&&baseMaterials){addTo(raw,i.id,needed);return;}
  const rs=optionsFor(i),r=i.id===item.id?rs[rootVariant]||rs[0]:rs[0];
  if(!r){addTo(raw,i.id,needed);return;}
  const batch=Math.ceil(needed/(r.c||1));const remain=batch*(r.c||1)-needed;if(remain)addTo(left,i.id,remain);
  let record=steps.get(i.id);if(!record){record={i,qty:0,batches:0,r};steps.set(i.id,record);}record.qty+=batch*(r.c||1);record.batches+=batch;
  const next=new Set(path);next.add(i.id);
  const amounts=new Map();for(const id of recipeIds(r)){
   // A chest permits interchangeable planks. Oak is the documented sample.
   const actual=(i.slug==="chest"&&idMap.get(id)?.slug.endsWith("_planks"))?slugMap.get("oak_planks").id:id;
   amounts.set(actual,(amounts.get(actual)||0)+batch);
  }
  for(const [id,n] of amounts)requireItem(idMap.get(id),n,next,depth+1);
 }
 requireItem(item,amount,new Set(),0);
 return {raw:[...raw].sort((a,b)=>b[1]-a[1]),steps:[...steps.values()].reverse(),left:[...left].filter(x=>x[1]>0),warnings:[...alerts,...[...cycles].map(x=>"循環レシピを検出："+x)]};}
function plannerView(i){
 const panel=el("section","ml-i-result-section");panel.append(el("h3","", "材料の逆算・必要数"));
 const rs=optionsFor(i);
 if(!rs.length){panel.append(el("p","ml-i-warning","このアイテムの作業台レシピは登録されていません。採掘・精錬・交易などの入手手段は、図鑑の詳細ページで確認してください。"));panel.append(linked(i,"入手方法を見る →"));return panel;}
 if(rs.length>1){const row=el("label","ml-i-variant");row.append(el("strong","", "材料の組み合わせを選ぶ"));const sel=el("select");rs.forEach((r,idx)=>{const op=el("option","",String(idx+1)+". "+recipeDescription(r));op.value=String(idx);sel.append(op);});sel.value=String(Math.min(selectedRecipe,rs.length-1));sel.addEventListener("change",()=>{selectedRecipe=Number(sel.value)||0;render();});row.append(sel);panel.append(row);}
 const qty=Math.min(10000,Math.max(1,Math.floor(Number(quantity?.value)||1))),p=expandPlan(i,qty,selectedRecipe);
 const summary=el("p","ml-i-summary",i.jp+" ×"+count(qty)+" を作るための材料（作業台レシピを再帰計算）");panel.append(summary);
 const cards=el("div","ml-i-materials");
 for(const [id,number] of p.raw){const obj=idMap.get(id);if(!obj)continue;const card=el("div","ml-i-material");card.append(picture(obj,40));const meta=el("div");meta.append(linked(obj),el("strong","ml-i-count",count(number)+" 個"));const stacks=Math.floor(number/obj.stack),rem=number%obj.stack;meta.append(el("small","",obj.stack>1?(stacks?count(stacks)+" スタック ":"")+(rem?"＋"+rem+"個":""):"重ねられないアイテム"));card.append(meta);cards.append(card);}
 panel.append(cards);
 if(p.steps.length){panel.append(el("h3","", "クラフト工程"));const ol=el("ol","ml-i-steps");
 for(const st of p.steps){const li=el("li");li.append(el("strong","",st.i.jp+" ×"+count(st.qty)+"（"+count(st.batches)+"回クラフト）"));const small=el("p","",recipeDescription(st.r));li.append(small,linked(st.i,"作り方を見る"));ol.append(li);}panel.append(ol);}
 if(p.left.length){panel.append(el("p","ml-i-muted","クラフトの端数余り："+p.left.map(([id,n])=>(idMap.get(id)?.jp||id)+" ×"+n).join("、")));}
 for(const w of p.warnings)panel.append(el("p","ml-i-warning",w));
 panel.append(el("p","ml-i-muted","※ 作業台の代表レシピを基に計算。鉄インゴットや板材などは基本素材として集計します。チェストはオークの板材8個を使用する例です（ほかの木材も可）。精錬・石切台・鍛冶・取引などは自動展開しません。クラフトの端数は考慮しますが、持ち物の在庫は未反映です。"));
 const textItems=p.raw.map(([id,n])=>(idMap.get(id)?.jp||id)+"："+n+"個").join("\n");
 panel.append(buttonCopy(i.jp+" ×"+qty+"\n【必要な素材】\n"+textItems,"素材リストをコピー"));
 return panel;
}
function render(){if(!current||!chosen)return;current.replaceChildren();current.append(selectedHeader(chosen));
 current.append(el("p","ml-i-muted",chosen.release==="26.4-snapshot-6"?"未実装の開発版追加アイテム。正式版とは異なる場合があります。":"Java "+chosen.release+"以降の収録情報。"));
 if(tool==="command")current.append(commandView(chosen));else current.append(plannerView(chosen));
 const next=el("div","ml-i-next");next.append(linked(chosen,"図鑑で作り方・入手方法を見る →"));next.append(document.createTextNode("　|　"));const other=el("a","",tool==="command"?"材料を逆算する →":"アイテムID・コマンドを見る →");other.href="/minecraft/tools/"+(tool==="command"?"material-planner":"item-command-search")+".html?item="+encodeURIComponent(chosen.slug);next.append(other);current.append(next);
 const u=new URL(location.href);u.searchParams.set("item",chosen.slug);if(tool==="planner")u.searchParams.set("qty",quantity?.value||"1");history.replaceState(null,"",u);
}
if(input){input.addEventListener("input",()=>list());input.addEventListener("focus",()=>{if(!chosen||input.value!==chosen.jp)list();});}
if(quantity){quantity.addEventListener("input",()=>{if(chosen)render();});quantity.addEventListener("blur",()=>{quantity.value=String(Math.min(tool==="command"?2304:10000,Math.max(1,Math.floor(Number(quantity.value)||1))));if(chosen)render();});}
$("ml-preview")?.addEventListener("change",()=>{list();if(chosen&&!valid(chosen)){chosen=null;current?.replaceChildren();}});
$("ml-samples")?.addEventListener("click",e=>{const v=e.target.closest("[data-sample]");if(v){const i=slugMap.get(v.dataset.sample);if(i)select(i);}});
const qs=new URLSearchParams(location.search),q=qs.get("item");
if(quantity&&qs.has("qty"))quantity.value=String(Math.min(10000,Math.max(1,Math.floor(Number(qs.get("qty"))||1))));
const initial=slugMap.get(q)||slugMap.get(tool==="planner"?"hopper":"diamond");
if(initial)select(initial,false);
window.MLG_ITEM_TOOL_TEST={expandPlan,lookup,items,optionsFor};
})();