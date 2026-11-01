/* MULTI LAB GUIDE Item Command Search + Craft Planner. Java data from the existing encyclopedia. */
(()=>{
"use strict";
const data=window.MLG_ITEMS, add=window.MLG_ITEM_ADDITIONS, rec=Object.assign({},window.MLG_RECIPES||{},window.MLG_RECIPES_2026||{});
const root="/minecraft/strategy/items/", $=id=>document.getElementById(id);
const tool=document.body.dataset.mlgTool||"";
function record(action){try{if(typeof window.gtag==="function")window.gtag("event","mlg_minecraft_tool_use",{tool_name:tool,tool_action:action,page_path:location.pathname});}catch(_){}}

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
const textureOld=window.MLG_TEXTURE_INDEX||{item:[],block:[]},textureNew=window.MLG_TEXTURE_INDEX_2026||{item:[],block:[]};
const texOldItem=new Set(textureOld.item||[]),texOldBlock=new Set(textureOld.block||[]),texNewItem=new Set(textureNew.item||[]),texNewBlock=new Set(textureNew.block||[]);
function itemTexture(i){
 const slug=i.slug,base="https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/";
 const candidates=[slug,slug.replace(/^waxed_/,""),slug.replace(/^stripped_/,""),slug.replace(/_(stairs|slab|wall|button|pressure_plate|fence|fence_gate)$/,""),
 slug.replace(/_(stairs|slab|wall|button|pressure_plate|fence|fence_gate)$/,"_planks"),slug.replace(/_wood$/,"_log"),slug.replace(/_concrete_powder$/,"_concrete"),
 slug.replace(/_brick_(slab|stairs|wall)$/,"_bricks")];
 const alias={crafting_table:"crafting_table_front",chest:"chest_front",trapped_chest:"trapped_chest_front",ender_chest:"ender_chest_front",furnace:"furnace_front",hopper:"hopper",grass_block:"grass_block_side",tnt:"tnt_side",piston:"piston_side",sticky_piston:"piston_top_sticky",oak_log:"oak_log",clock:"clock_00",compass:"compass_00",recovery_compass:"recovery_compass_00",crossbow:"crossbow_standby",enchanted_golden_apple:"golden_apple",magma_block:"magma",purpur_stairs:"purpur_block",smooth_stone_slab:"smooth_stone",tipped_arrow:"tipped_arrow_base",stripped_oak_log:"stripped_oak_log"};
 const more={
 suspicious_sand:"sand",suspicious_gravel:"gravel",moss_carpet:"moss_block",petrified_oak_slab:"oak_planks",purpur_slab:"purpur_block",
 smooth_quartz:"quartz_block_bottom",smooth_sandstone:"sandstone_bottom",smooth_red_sandstone:"red_sandstone_bottom",
 decorated_pot:"brick",chest:"oak_planks",ender_chest:"obsidian",trapped_chest:"oak_planks",
 snow_block:"snow",light_weighted_pressure_plate:"iron_block",heavy_weighted_pressure_plate:"gold_block",
 dried_ghast:"dried_ghast_hydration_0_north",dried_kelp_block:"dried_kelp_side",test_block:"test_block_start",
 skeleton_skull:"bone",wither_skeleton_skull:"wither_rose",player_head:"oak_planks",zombie_head:"rotten_flesh",creeper_head:"gunpowder",dragon_head:"dragon_egg",piglin_head:"gold_ingot",
 shield:"oak_planks",debug_stick:"stick",copper_chest:"copper_block",waxed_copper_chest:"copper_block",copper_golem_statue:"copper_block",waxed_copper_golem_statue:"copper_block",
 poplar_leaves:"red_poplar_leaves",shelf_mushroom:"shelf_mushroom_stage0",brittle_ice:"ice",
 crimson_hyphae:"crimson_stem",warped_hyphae:"warped_stem",stripped_crimson_hyphae:"stripped_crimson_stem",stripped_warped_hyphae:"stripped_warped_stem"
 };
 if(alias[slug])candidates.push(alias[slug]);
 if(more[slug])candidates.push(more[slug]);
 if(/_carpet$/.test(slug))candidates.push(slug.replace(/_carpet$/,"_wool"));
 if(/^infested_/.test(slug))candidates.push(slug.replace(/^infested_/,""));
 if(/_spear$/.test(slug))candidates.push(slug+"_in_hand");
 const derived=[...candidates];for(const name of derived){
  const cut=name.replace(/^waxed_/,"").replace(/^infested_/,"").replace(/_(stairs|slab|wall|button|pressure_plate)$/,"");
  candidates.push(cut,cut.replace(/^smooth_/,""),cut.replace(/_brick$/,"_bricks"),cut.replace(/_tile$/,"_tiles"),cut.replace(/_wood$/,"_log"),cut.replace(/_hyphae$/,"_stem"));
 }
 for(const n of [...candidates])candidates.push(n+"_side",n+"_front",n+"_top",n+"_end",n+"_bottom",n+"_all");
 if(/_bed$|_banner$/.test(slug))candidates.push("white_wool");
 if(/_spawn_egg$/.test(slug))candidates.push("zombie_spawn_egg");
 if(/_copper_(chest|golem_statue)$/.test(slug))candidates.push(slug.replace(/^waxed_/,"").replace(/_(chest|golem_statue)$/,""));
 const recent=i.id>1504;
 for(const [entries,ver,group] of [
 ...(recent?[[texNewItem,"26.4-snapshot-6","item"],[texNewBlock,"26.4-snapshot-6","block"]]:[]),
 [texOldItem,"1.21.11","item"],[texOldBlock,"1.21.11","block"],
 ...(!recent?[[texNewItem,"26.4-snapshot-6","item"],[texNewBlock,"26.4-snapshot-6","block"]]:[])
 ]){const found=candidates.find(n=>entries.has(n));if(found)return base+ver+"/assets/minecraft/textures/"+group+"/"+encodeURIComponent(found)+".png";}
 return "";
}
function picture(i,px){const a=el("span","ml-i-icon");const url=itemTexture(i);
 if(url){const img=el("img");img.src=url;img.alt="";img.width=px;img.height=px;img.loading="lazy";img.decoding="async";img.onerror=()=>{img.remove();a.textContent="◆";a.title="代表画像なし";};a.append(img);}
 else{a.textContent="◆";a.title="代表画像なし";}
 return a;}
function copy(text,button){if(navigator.clipboard?.writeText){navigator.clipboard.writeText(text).then(()=>{button.textContent="コピー済み ✓";}).catch(()=>{fallbackCopy(text,button);});}else fallbackCopy(text,button);}
function fallbackCopy(text,button){const ta=el("textarea");ta.value=text;ta.style.position="fixed";ta.style.left="-9999px";document.body.append(ta);ta.select();try{document.execCommand("copy");button.textContent="コピー済み ✓";}catch(_){button.textContent="選択してコピー";}ta.remove();}
function buttonCopy(text,label){const b=el("button","ml-i-button ml-i-copy",label||"コピー");b.type="button";b.addEventListener("click",()=>{record("copy_clicked");copy(text,b);});return b;}
function count(n){return Number(n).toLocaleString("ja-JP");}
const input=$("ml-item-search"),matches=$("ml-item-results"),current=$("ml-current"),quantity=$("ml-amount");
let chosen=null, selectedRecipe=0;
const basket=[];
const MAX_ENTRIES=24;
function select(i,scroll){
 if(tool==="planner"){
  const q=Math.min(10000,Math.max(1,Math.floor(Number(quantity?.value)||1)));
  const found=basket.find(x=>x.slug===i.slug);
  if(found)found.qty=Math.min(10000,found.qty+q);
  else if(basket.length<MAX_ENTRIES)basket.push({slug:i.slug,qty:q,variant:0});
  else{alert("一度に登録できるアイテムは"+MAX_ENTRIES+"種類です。");return;}
  // Keep the typed keyword and the picture-backed results visible after adding.
  // Users can add several related items without retyping the search term.
  if(quantity)quantity.value="1";
  renderBasket();
  list();
  if(scroll!==false)record("item_added");
  return;
 }
 chosen=i;selectedRecipe=0;if(input)input.value=i.jp;if(matches)matches.hidden=true;render();
 if(scroll!==false){record("item_selected");if(current)current.scrollIntoView({behavior:"smooth",block:"nearest"});}
}
function list(){if(!input||!matches)return;matches.replaceChildren();if(!norm(input.value)){matches.hidden=true;return;}const found=lookup(input.value);if(!found.length){matches.append(el("p","ml-i-muted","一致するアイテムがありません。日本語・英語名・IDで検索できます。"));}else{for(const i of found){const b=el("button","ml-i-option");b.type="button";b.append(picture(i,36));const span=el("span");span.append(el("strong","",i.jp),el("small","",i.en+" · minecraft:"+i.slug));b.append(span);b.addEventListener("click",()=>select(i));matches.append(b);}}matches.hidden=false;}
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
function recipeDescription(r,product){const needs=new Map();for(const id of recipeIds(r)){const actual=(["chest","piston","crafting_table","shield"].includes(product?.slug)&&idMap.get(id)?.slug.endsWith("_planks"))?slugMap.get("oak_planks").id:id;needs.set(actual,(needs.get(actual)||0)+1);}return [...needs].map(([id,n])=>(idMap.get(id)?.jp||"不明")+"×"+n).join("、")+" → "+(r.c||1)+"個";}
function expandPlan(item,amount,rootVariant,carry){const raw=new Map(),steps=new Map(),left=new Map(carry||[]),alerts=new Set(),cycles=new Set();
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
   const actual=(["chest","piston","crafting_table","shield"].includes(i.slug)&&idMap.get(id)?.slug.endsWith("_planks"))?slugMap.get("oak_planks").id:id;
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
 if(rs.length>1){const row=el("label","ml-i-variant");row.append(el("strong","", "材料の組み合わせを選ぶ"));const sel=el("select");rs.forEach((r,idx)=>{const op=el("option","",String(idx+1)+". "+recipeDescription(r,i));op.value=String(idx);sel.append(op);});sel.value=String(Math.min(selectedRecipe,rs.length-1));sel.addEventListener("change",()=>{selectedRecipe=Number(sel.value)||0;render();});row.append(sel);panel.append(row);}
 const qty=Math.min(10000,Math.max(1,Math.floor(Number(quantity?.value)||1))),p=expandPlan(i,qty,selectedRecipe);
 const summary=el("p","ml-i-summary",i.jp+" ×"+count(qty)+" を作るための材料（作業台レシピを再帰計算）");panel.append(summary);
 const cards=el("div","ml-i-materials");
 for(const [id,number] of p.raw){const obj=idMap.get(id);if(!obj)continue;const card=el("div","ml-i-material");card.append(picture(obj,40));const meta=el("div");meta.append(linked(obj),el("strong","ml-i-count",count(number)+" 個"));const stacks=Math.floor(number/obj.stack),rem=number%obj.stack;meta.append(el("small","",obj.stack>1?(stacks?count(stacks)+" スタック ":"")+(rem?"＋"+rem+"個":""):"重ねられないアイテム"));card.append(meta);cards.append(card);}
 panel.append(cards);
 if(p.steps.length){panel.append(el("h3","", "クラフト工程"));const ol=el("ol","ml-i-steps");
 for(const st of p.steps){const li=el("li");li.append(el("strong","",st.i.jp+" ×"+count(st.qty)+"（"+count(st.batches)+"回クラフト）"));const small=el("p","",recipeDescription(st.r,st.i));li.append(small,linked(st.i,"作り方を見る"));ol.append(li);}panel.append(ol);}
 if(p.left.length){panel.append(el("p","ml-i-muted","クラフトの端数余り："+p.left.map(([id,n])=>(idMap.get(id)?.jp||id)+" ×"+n).join("、")));}
 for(const w of p.warnings)panel.append(el("p","ml-i-warning",w));
 panel.append(el("p","ml-i-muted","※ 作業台の代表レシピを基に計算。鉄インゴットや板材などは基本素材として集計します。チェストはオークの板材8個を使用する例です（ほかの木材も可）。精錬・石切台・鍛冶・取引などは自動展開しません。クラフトの端数は考慮しますが、持ち物の在庫は未反映です。"));
 const textItems=p.raw.map(([id,n])=>(idMap.get(id)?.jp||id)+"："+n+"個").join("\n");
 panel.append(buttonCopy(i.jp+" ×"+qty+"\n【必要な素材】\n"+textItems,"素材リストをコピー"));
 return panel;
}

function expandBasket(entries){
 const totals=new Map(),steps=[],warnings=new Set();
 let leftover=new Map();
 for(const row of entries){
  const item=slugMap.get(row.slug);if(!item)continue;
  const qty=Math.min(10000,Math.max(1,Math.floor(Number(row.qty)||1)));
  const result=expandPlan(item,qty,row.variant||0,leftover);
  leftover=new Map(result.left);
  for(const [id,n] of result.raw)totals.set(id,(totals.get(id)||0)+n);
  for(const st of result.steps)steps.push(st);
  for(const w of result.warnings)warnings.add(w);
 }
 return {raw:[...totals].filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]),steps,left:[...leftover].filter(x=>x[1]>0),warnings:[...warnings]};
}
function renderBasket(){
 const area=$("ml-plan-list");if(!area||!current)return;
 area.replaceChildren();current.replaceChildren();
 const heading=el("h2","", "追加したアイテム（"+basket.length+"/"+MAX_ENTRIES+"種類）");area.append(heading);
 if(!basket.length){
  try{const u=new URL(location.href);u.searchParams.delete("plan");u.searchParams.delete("item");u.searchParams.delete("qty");history.replaceState(null,"",u);}catch(_){}
  area.append(el("p","ml-i-muted","作りたいアイテムを検索して選択すると、ここに追加されます。選択を残したまま次のアイテムを検索できます。"));
  current.append(el("h2","","必要素材の合計"),el("p","ml-i-muted","アイテムを1つ以上追加すると、必要な材料をまとめて計算します。"));
  return;
 }
 const rows=el("div","ml-i-basket-rows");area.append(rows);
 for(const row of basket){
  const item=slugMap.get(row.slug);if(!item)continue;
  const card=el("div","ml-i-basket-row");card.append(picture(item,47));
  const title=el("div","ml-i-basket-meta");title.append(linked(item),el("small","",item.en));
  card.append(title);
  const label=el("label","ml-i-basket-qty");label.append(el("span","","作る数"));
  const n=el("input");n.type="number";n.min="1";n.max="10000";n.step="1";n.inputMode="numeric";n.value=String(row.qty);n.setAttribute("aria-label",item.jp+"を作る数");
  n.addEventListener("change",()=>{row.qty=Math.min(10000,Math.max(1,Math.floor(Number(n.value)||1)));renderBasket();record("quantity_updated");});
  label.append(n);card.append(label);
  const del=el("button","ml-i-remove","削除");del.type="button";del.setAttribute("aria-label",item.jp+"をリストから削除");
  del.addEventListener("click",()=>{basket.splice(basket.indexOf(row),1);renderBasket();record("item_removed");});
  card.append(del);
  const variants=optionsFor(item);
  if(variants.length>1){const rowVariant=el("label","ml-i-basket-variant");rowVariant.append(el("small","","作り方を選ぶ"));
   const sel=el("select");variants.forEach((r,index)=>{const opt=el("option","",String(index+1)+". "+recipeDescription(r,item));opt.value=String(index);sel.append(opt);});
   sel.value=String(row.variant||0);sel.addEventListener("change",()=>{row.variant=Number(sel.value)||0;renderBasket();record("recipe_variant");});rowVariant.append(sel);card.append(rowVariant);
  }
  rows.append(card);
 }
 const controls=el("div","ml-i-basket-actions");
 const next=el("button","ml-i-button ml-i-add-again","＋ 別のアイテムも追加");next.type="button";next.addEventListener("click",()=>{input?.focus();input?.scrollIntoView({behavior:"smooth",block:"center"});});
 const clear=el("button","ml-i-clear-all","すべて削除");clear.type="button";clear.addEventListener("click",()=>{basket.length=0;renderBasket();record("basket_cleared");});
 controls.append(next,clear);area.append(controls);
 const p=expandBasket(basket);
 current.append(el("h2","","必要素材の合計"),el("p","ml-i-summary",basket.length+"種類の完成品を作るために集める素材を合算しました。"));
 const cardGrid=el("div","ml-i-materials");
 for(const [id,num] of p.raw){
  const obj=idMap.get(id);if(!obj)continue;
  const card=el("div","ml-i-material");card.append(picture(obj,40));
  const meta=el("div");meta.append(linked(obj),el("strong","ml-i-count",count(num)+" 個"));
  const stacks=Math.floor(num/obj.stack),rem=num%obj.stack;
  meta.append(el("small","",obj.stack>1?(stacks?count(stacks)+" スタック":"")+(rem?" ＋"+rem+"個":""):"スタック不可"));
  card.append(meta);cardGrid.append(card);
 }
 current.append(cardGrid);
 if(p.steps.length){
  const sec=el("section","ml-i-result-section");sec.append(el("h3","","まとめたクラフト工程"));
  const grouped=new Map();
  for(const step of p.steps){
   const record=grouped.get(step.i.id)||{i:step.i,batches:0,qty:0,r:step.r};
   record.batches+=step.batches;record.qty+=step.qty;grouped.set(step.i.id,record);
  }
  const ol=el("ol","ml-i-steps");
  for(const st of [...grouped.values()].reverse()){
   const li=el("li");li.append(el("strong","",st.i.jp+" ×"+count(st.qty)+"（"+count(st.batches)+"回）"));
   li.append(el("p","",recipeDescription(st.r,st.i)),linked(st.i,"作り方を見る"));ol.append(li);
  }sec.append(ol);current.append(sec);
 }
 if(p.left.length)current.append(el("p","ml-i-muted","クラフト後の余り："+p.left.map(([id,n])=>(idMap.get(id)?.jp||id)+" ×"+count(n)).join("、")));
 for(const w of p.warnings)current.append(el("p","ml-i-warning",w));
 current.append(el("p","ml-i-muted","※ Java版の登録済み作業台レシピを使用。鉄インゴットや板材などは基本素材として計算します。チェストやピストンなど木材を選べるレシピはオークの板材を代表例にしています。精錬・鍛冶・石切・取引は自動計算対象外です。端数の余りはリスト内で共通利用します。"));
 const summary=basket.map(row=>slugMap.get(row.slug)?.jp+" ×"+row.qty).join("\n");
 const listText=p.raw.map(([id,n])=>(idMap.get(id)?.jp||id)+"："+count(n)+"個").join("\n");
 current.append(buttonCopy("【作りたいもの】\n"+summary+"\n\n【必要素材の合計】\n"+listText,"合計素材リストをコピー"));
 try{
  const url=new URL(location.href);
  url.searchParams.delete("item");url.searchParams.delete("qty");
  url.searchParams.set("plan",basket.map(x=>x.slug+":"+x.qty+(x.variant?":"+x.variant:"")).join(","));
  history.replaceState(null,"",url);
 }catch(_){}
}
function render(){if(!current||!chosen)return;current.replaceChildren();current.append(selectedHeader(chosen));
 current.append(el("p","ml-i-muted",chosen.release==="26.4-snapshot-6"?"未実装の開発版追加アイテム。正式版とは異なる場合があります。":"Java "+chosen.release+"以降の収録情報。"));
 if(tool==="command")current.append(commandView(chosen));else current.append(plannerView(chosen));
 const next=el("div","ml-i-next");next.append(linked(chosen,"図鑑で作り方・入手方法を見る →"));next.append(document.createTextNode("　|　"));const other=el("a","",tool==="command"?"材料を逆算する →":"アイテムID・コマンドを見る →");other.href="/minecraft/tools/"+(tool==="command"?"material-planner":"item-command-search")+".html?item="+encodeURIComponent(chosen.slug);next.append(other);current.append(next);
 const u=new URL(location.href);u.searchParams.set("item",chosen.slug);if(tool==="planner")u.searchParams.set("qty",quantity?.value||"1");history.replaceState(null,"",u);
}
if(input){input.addEventListener("input",()=>list());input.addEventListener("focus",()=>{if(tool==="planner"||!chosen||input.value!==chosen.jp)list();});}
if(quantity){quantity.addEventListener("input",()=>{if(tool==="command"&&chosen)render();});quantity.addEventListener("blur",()=>{quantity.value=String(Math.min(tool==="command"?2304:10000,Math.max(1,Math.floor(Number(quantity.value)||1))));if(tool==="command"&&chosen)render();});}
$("ml-preview")?.addEventListener("change",()=>{list();if(chosen&&!valid(chosen)){chosen=null;current?.replaceChildren();}});
$("ml-samples")?.addEventListener("click",e=>{const v=e.target.closest("[data-sample]");if(v){const i=slugMap.get(v.dataset.sample);if(i)select(i);}});
const qs=new URLSearchParams(location.search),q=qs.get("item");
if(quantity&&qs.has("qty"))quantity.value=String(Math.min(10000,Math.max(1,Math.floor(Number(qs.get("qty"))||1))));
if(tool==="planner"){
 const plan=qs.get("plan");
 if(plan){for(const segment of plan.split(",").slice(0,MAX_ENTRIES)){const [slug,qty,variant]=segment.split(":");if(slugMap.has(slug)&&!basket.some(x=>x.slug===slug)){basket.push({slug,qty:Math.min(10000,Math.max(1,Math.floor(Number(qty)||1))),variant:Math.max(0,Math.floor(Number(variant)||0))});}}}
 else if(slugMap.has(q))basket.push({slug:q,qty:Math.min(10000,Math.max(1,Math.floor(Number(qs.get("qty"))||1))),variant:0});
 if(quantity)quantity.value="1";
 renderBasket();
}else{
 const initial=slugMap.get(q)||slugMap.get("diamond");
 if(initial)select(initial,false);
}
window.MLG_ITEM_TOOL_TEST={expandPlan,expandBasket,lookup,items,optionsFor,basket,itemTexture};
})();