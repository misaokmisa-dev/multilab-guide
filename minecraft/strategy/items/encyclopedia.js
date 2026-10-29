/* MULTI LAB GUIDE complete Minecraft Java 1.21.11 item encyclopedia.
   Exact game item names; fuzzy search, linked recipes, textured 3x3 craft grids. */
(()=>{
"use strict";
const B="/minecraft/strategy/items/";
const ASSET="https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21.11/assets/minecraft/textures/";
const DATA=window.MLG_ITEMS, RECIPES=window.MLG_RECIPES||{}, TEX=window.MLG_TEXTURE_INDEX||{item:[],block:[]};
if(!DATA){document.querySelector("#ency-root")?.replaceChildren(document.createTextNode("図鑑データを読み込めませんでした。ページを再読み込みしてください。"));return;}
const items=DATA.items.map(a=>({id:a[0],name:a[1],jp:a[2],en:a[3],cat:a[4],stack:a[5]}));
const byId=new Map(items.map(i=>[i.id,i])),bySlug=new Map(items.map(i=>[i.name,i]));
const textureItem=new Set(TEX.item||[]),textureBlock=new Set(TEX.block||[]);
const groups=DATA.categories.map(a=>({id:a[0],title:a[1],intro:a[2]})), groupMap=new Map(groups.map(g=>[g.id,g]));
const altNames={
 "diamond":["ダイヤ","ダイヤ石","宝石"],
 "netherite_ingot":["ネザライト","ネザライド","ネザライトインゴット","古代の残骸"],
 "crafting_table":["作業台","クラフト台","クラフティングテーブル","作る台"],
 "torch":["たいまつ","トーチ","明かり","光源"],
 "redstone":["レッドストーン","レッドダスト","赤い粉","回路"],
 "ender_pearl":["エンダーパール","エンパ","瞬間移動","テレポート"],
 "ender_eye":["エンダーアイ","エンダーの目","要塞を探す"],
 "elytra":["エリトラ","翼","空を飛ぶ","滑空"],
 "shield":["シールド","盾","防御"],
 "mace":["メイス","ハンマー","落下攻撃"],
 "bow":["弓","遠距離","弓矢"],
 "crossbow":["クロスボウ","ボウガン","遠距離"],
 "piston":["ピストン","押す","装置"],
 "chest":["チェスト","箱","収納","倉庫"],
 "ender_chest":["エンダーチェスト","共有チェスト","持ち運べる倉庫"],
 "shulker_box":["シュルカー","箱","収納","倉庫"],
 "obsidian":["黒曜石","ネザーポータル","ポータル"],
 "blaze_rod":["ブレイズロッド","ブレイズ","ネザー","棒"],
 "totem_of_undying":["不死のトーテム","トーテム","復活","蘇生"],
 "oak_planks":["オーク板材","木材","板材","建築"],
 "furnace":["かまど","精錬","焼く","溶かす"],
 "enchanting_table":["エンチャント","エンチャントテーブル","付与"],
 "water_bucket":["水バケツ","水をくむ","水入りバケツ"],
 "lava_bucket":["溶岩バケツ","マグマバケツ","溶岩入りバケツ"]
};
const aliasCategory={
 building:"建築 ブロック 石材 木材 家 素材 階段 ハーフブロック",
 nature:"自然 草 植物 木 花 畑 生物 採取 森",
 materials:"素材 材料 鉱石 金属 ダイヤ インゴット クラフト",
 weapons:"武器 戦闘 攻撃 斬る 弓 遠距離 近接",
 tools:"道具 ツール 採掘 掘る 斧 ピッケル",
 armor:"防具 装備 頭 胴 靴 ヘルメット 盾",
 redstone:"レッドストーン 回路 自動化 電気 スイッチ 装置",
 food:"食べ物 食料 お腹 空腹 回復 農業",
 travel:"移動 乗り物 船 トロッコ 道 路線",
 decoration:"装飾 飾り 家 内装 染色 カラー 旗",
 magic:"魔法 ポーション エンチャント エンダー 効果",
 mobs:"モブ MOB 敵 動物 召喚 スポーンエッグ",
 other:"その他 特殊 アイテム 雑貨"
};
function norm(v){return String(v||"").normalize("NFKC").toLowerCase().replace(/[\u3041-\u3096]/g,c=>String.fromCharCode(c.charCodeAt(0)+96)).replace(/[\s　\-_'・。()（）/／！？、.,]/g,"");}
function extraTags(i){
 const en=i.name.replace(/_/g," "),english=i.en||"";
 const jp=i.jp;
 return [jp,en,english,i.name,...(altNames[i.name]||[]),groupMap.get(i.cat)?.title||"",aliasCategory[i.cat]||"",jp.replace(/の/g,"")].map(norm);
}
const searchable=new Map(items.map(i=>[i.id,extraTags(i)]));
function fuzzy(a,b){
 if(!a||!b)return false;
 if(a.includes(b))return true;
 // typo support only for reasonably specific fragments.
 if(b.length<3||b.length>17)return false;
 const len=b.length;
 for(const token of a.split(/[\s　]/).filter(Boolean)){
   if(Math.abs(token.length-len)>2)continue;
   const distance=edit(token,b);
   if(distance<= (len>=6?2:1))return true;
 }
 return false;
}
function edit(a,b){
 let prev=Array.from({length:b.length+1},(_,i)=>i);
 for(let i=1;i<=a.length;i++){
  const cur=[i];
  for(let j=1;j<=b.length;j++)cur[j]=Math.min(cur[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
  prev=cur;
 }
 return prev[b.length];
}
function score(i,query){
 if(!query)return 1;
 const terms=String(query).trim().split(/[\s　]+/).map(norm).filter(Boolean);
 if(!terms.length)return 1;
 const tags=searchable.get(i.id)||[];
 const values=tags.filter(Boolean);
 let total=0;
 for(const t of terms){
  if(norm(i.jp)===t||norm(i.name)===t)total+=100;
  else if(norm(i.jp).startsWith(t))total+=65;
  else if(norm(i.jp).includes(t))total+=48;
  else if(values.some(v=>v.startsWith(t)))total+=32;
  else if(values.some(v=>v.includes(t)))total+=19;
  else if(values.some(v=>fuzzy(v,t)))total+=6;
  else return 0;
 }
 return total;
}
function itemUrl(i){return B+"detail/"+encodeURIComponent(i.name)+".html";}
function chooseImage(name){
 const ns=[name];
 // Some game items share the genuine texture of their base block (stairs/slabs, waxed variants).
 const replace=[
   name.replace(/^waxed_/,""),
   name.replace(/^stripped_/,""),
   name.replace(/_(slab|stairs|wall|fence|fence_gate)$/,""),
   name.replace(/_(slab|stairs|wall|fence|fence_gate)$/,"_planks"),
   name.replace(/_wood$/,"_log").replace(/_hyphae$/,"_stem"),
   name.replace(/^suspicious_/,""),
   name.replace(/_brick_(slab|stairs|wall)$/,"_bricks"),
   name.replace(/^(brick|nether_brick|mud_brick|stone_brick)_(slab|stairs|wall)$/,"$1s"),
   name.replace(/_copper_(slab|stairs)$/,"_copper"),
   name.replace(/_concrete_powder$/,"_concrete")
 ];
 for(const a of replace)if(a!==name&&!ns.includes(a))ns.push(a);
 const fallback={
   chest:"oak_planks",trapped_chest:"oak_planks",ender_chest:"obsidian",
   snow_block:"snow",decorated_pot:"decorated_pot_side",
   purpur_stairs:"purpur_block",smooth_quartz:"quartz_block_bottom",
   smooth_sandstone:"sandstone_bottom",smooth_red_sandstone:"red_sandstone_bottom",
   moss_carpet:"moss_block",white_candle:"white_candle",
   petrified_oak_slab:"oak_planks",oak_fence:"oak_planks"
 };
 if(fallback[name])ns.push(fallback[name]);
 // Some blocks only offer side/top texture, never a direct filename.
 for(const v of [...ns])for(const suf of ["_side","_front","_top","_bottom","_end","_all","_still"])ns.push(v+suf);
 // Some textures share plurals, and a few resource names are irregular.
 for(const v of [...ns]){
   if(v.includes("brick")&&!v.includes("bricks"))ns.push(v.replace("brick","bricks"));
   if(v.includes("tuff_bricks"))ns.push(v.replace("tuff_bricks","tuff_bricks"));
 }
 // Some game items use another texture name.
 const map={grass_block:"grass_block_side",podzol:"podzol_side",mycelium:"mycelium_side",tnt:"tnt_side",crafting_table:"crafting_table_front",furnace:"furnace_front",blast_furnace:"blast_furnace_front",smoker:"smoker_front",piston:"piston_side",oak_log:"oak_log",diamond_ore:"diamond_ore",chest:"chest_front",ender_chest:"ender_chest_front"};
 if(map[name])ns.push(map[name]);
 ns.push(name+"_side",name+"_front",name+"_top");
 for(const n of ns)if(textureItem.has(n))return ASSET+"item/"+encodeURIComponent(n)+".png";
 for(const n of ns)if(textureBlock.has(n))return ASSET+"block/"+encodeURIComponent(n)+".png";
 return null; // never show broken-image icons for assets not supplied as standalone textures.
}
function icon(i,size=54){
 const w=document.createElement("span");w.className="ency-icon";w.style.setProperty("--icon-size",size+"px");
 const url=chooseImage(i.name);const label=document.createElement("span");label.className="ency-icon-alt";label.textContent="?";
 if(url){const img=document.createElement("img");img.src=url;img.alt="";img.loading="lazy";img.decoding="async";img.width=size;img.height=size;
 img.addEventListener("load",()=>w.classList.add("has-image"));img.addEventListener("error",()=>img.remove());w.append(img);}
 w.append(label);return w;
}
function itemAnchor(i,cls="ency-item-link"){
 const a=document.createElement("a");a.href=itemUrl(i);a.className=cls;a.append(icon(i));
 const t=document.createElement("span");const b=document.createElement("strong");b.textContent=i.jp;const small=document.createElement("small");small.textContent=i.name;
 t.append(b,small);a.append(t);return a;
}
const categoryRepresentative={
 building:"oak_planks",nature:"oak_sapling",materials:"diamond",
 weapons:"diamond_sword",tools:"diamond_pickaxe",armor:"diamond_chestplate",
 redstone:"redstone",food:"apple",travel:"minecart",
 decoration:"painting",magic:"ender_pearl",mobs:"zombie_spawn_egg",other:"barrier"
};
function renderCategories(el,active){
 if(!el)return;
 for(const c of groups){
  const a=document.createElement("a");a.className="ency-category"+(c.id===active?" is-current":"");
  a.href=B+"category/"+c.id+".html";
  a.setAttribute("aria-label",c.title+"のアイテム一覧を見る");
  const sample=bySlug.get(categoryRepresentative[c.id]);
  if(sample){
   const picture=icon(sample,52);
   picture.setAttribute("aria-hidden","true");
   a.append(picture);
  }
  const copy=document.createElement("span");copy.className="ency-category-copy";
  const b=document.createElement("b");b.textContent=c.title;
  const sm=document.createElement("small");sm.textContent=items.filter(i=>i.cat===c.id).length+"種類の一覧を見る ›";
  copy.append(b,sm);a.append(copy);el.append(a);
 }
}
function initListings(){
 const input=document.querySelector("#ency-search"),result=document.querySelector("#ency-results");
 const count=document.querySelector("#ency-count"),more=document.querySelector("#ency-more");
 const category=document.body.dataset.category||"";
 const categoryArea=document.querySelector("#ency-categories")?.closest(".ency-section");
 const resultsHeading=result?.closest(".ency-section")?.querySelector("h2");
 const originalResultsHeading=resultsHeading?.textContent||"アイテム一覧";
 renderCategories(document.querySelector("#ency-categories"),category);
 if(!result||!input)return;
 const q=new URLSearchParams(location.search).get("q")||"";input.value=q;
 let found=[],limit=60;
 function draw(){
  let query=input.value.trim(),base=category&&!query?items.filter(i=>i.cat===category):items;
  // During a search, only matching item results remain beneath the search field.
  if(categoryArea)categoryArea.hidden=Boolean(query);
  if(resultsHeading)resultsHeading.textContent=query?"検索結果":originalResultsHeading;
  found=base.map(i=>({i,s:score(i,query)})).filter(a=>a.s>0);
  found.sort((a,b)=>(b.s-a.s)||(a.i.jp.localeCompare(b.i.jp,"ja")));
  if(category&&query)found.sort((a,b)=>(a.i.cat===category? -1:1)-(b.i.cat===category?-1:1)||(b.s-a.s)||(a.i.jp.localeCompare(b.i.jp,"ja")));
  if(count)count.textContent=(query?"「"+query+"」の検索結果：":"掲載アイテム：")+found.length.toLocaleString("ja-JP")+"件";
  result.replaceChildren();
  if(!found.length){const p=document.createElement("p");p.className="ency-empty";p.textContent="該当するアイテムは見つかりませんでした。名前の一部・別名・用途など、別の言葉でも検索してみてください。";result.append(p);}
  found.slice(0,limit).forEach(x=>result.append(itemAnchor(x.i)));
  if(more){more.hidden=found.length<=limit;more.textContent="もっと表示（残り"+(found.length-limit).toLocaleString("ja-JP")+"件）";}
 }
 let timer;
 input.addEventListener("input",()=>{clearTimeout(timer);timer=setTimeout(()=>{limit=60;draw();},90);});
 document.querySelector("#ency-clear")?.addEventListener("click",()=>{input.value="";limit=60;draw();input.focus();});
 more?.addEventListener("click",()=>{limit+=60;draw();});
 draw();
}
function step(textContent){const li=document.createElement("li");li.textContent=textContent;return li;}
function crossLink(i){const a=document.createElement("a");a.href=itemUrl(i);a.textContent=i.jp;return a;}
function renderRecipe(container,r){
 const box=document.createElement("article");box.className="ency-recipe";
 const ingredients=r.s?r.s.flat().filter(x=>x!==null):r.i;
 const head=document.createElement("h3");head.textContent=r.s?"作業台の配置例":"材料の組み合わせ（配置順は自由）";box.append(head);
 const grid=document.createElement("div");grid.className="ency-craft-grid";grid.setAttribute("aria-label","3×3クラフトマスの材料配置");
 const cells=Array.from({length:9},()=>null);
 if(r.s){for(let y=0;y<Math.min(3,r.s.length);y++)for(let x=0;x<Math.min(3,r.s[y].length);x++)cells[y*3+x]=r.s[y][x];}
 else{ingredients.slice(0,9).forEach((v,i)=>cells[i]=v);}
 cells.forEach(id=>{
  const cell=document.createElement("span");cell.className="ency-craft-cell";
  if(id!==null&&byId.has(id)){const item=byId.get(id);const a=document.createElement("a");a.href=itemUrl(item);a.className="ency-craft-link";a.setAttribute("aria-label",item.jp+"の詳細を見る");a.append(icon(item,41));cell.append(a);}
  grid.append(cell);
 });
 const row=document.createElement("div");row.className="ency-craft-row";row.append(grid);
 const arrow=document.createElement("span");arrow.className="ency-craft-arrow";arrow.textContent="→";row.append(arrow);
 const result=document.createElement("div");result.className="ency-craft-output";const curr=bySlug.get(document.body.dataset.item);
 if(curr){result.append(icon(curr,54));const sp=document.createElement("small");sp.textContent="×"+(r.c||1);result.append(sp);}row.append(result);box.append(row);
 const ul=document.createElement("ul");ul.className="ency-ingredient-links";
 const counts=new Map();
 for(const id of ingredients){const i=byId.get(id);if(i)counts.set(i,(counts.get(i)||0)+1);}
 for(const [i,n] of counts){const li=document.createElement("li");li.append(crossLink(i),document.createTextNode(" × "+n));ul.append(li);}
 box.append(ul);container.append(box);
}
const specificHow={
 diamond:["地下のダイヤモンド鉱石や深層ダイヤモンド鉱石を探します。","鉄以上のツルハシで採掘します。シルクタッチ付きでは鉱石のまま採れるため注意してください。"],
 iron_ingot:["鉄鉱石・深層鉄鉱石などを採掘して鉄の原石を集めます。","かまどや溶鉱炉で鉄の原石を製錬します。"],
 gold_ingot:["金鉱石・深層金鉱石から金の原石を集めます。","かまど・溶鉱炉で製錬します。"],
 netherite_scrap:["ネザーで古代の残骸を探します。","古代の残骸をかまど・溶鉱炉で製錬します。"],
 ancient_debris:["ネザーの地中に埋まっている古代の残骸を探索します。","ダイヤモンド以上のツルハシで採掘して入手します。"],
 obsidian:["水と溶岩源が接触して黒曜石が生成される場所を探します。","ダイヤモンド以上のツルハシで採掘します。"],
 blaze_rod:["ネザー要塞でブレイズを探します。","ブレイズを倒したときのドロップから入手します。"],
 ender_pearl:["エンダーマンを探します。","エンダーマンのドロップなどから入手します。村人との取引なども選択肢です。"],
 elytra:["エンドの外周島を探索してエンドシティを探します。","エンドシップ内の額縁からエリトラを入手します。"],
 totem_of_undying:["襲撃イベントや森の洋館などでエヴォーカーに遭遇します。","エヴォーカーを倒すとドロップします。"],
 cobblestone:["石をツルハシで採掘すると、一般に丸石を入手できます。","シルクタッチ付きでは石のまま入手するため注意してください。"],
 oak_log:["オークの木を探します。","幹の原木ブロックを壊して入手します。"],
 redstone:["地下にあるレッドストーン鉱石を探します。","適切なツルハシで採掘してレッドストーンダストを入手します。"],
 emerald:["山岳などにあるエメラルド鉱石から採掘するか、村人との取引で入手します。","村人取引は種類・職業・取引内容によって異なります。"],
 enchanted_book:["エンチャントテーブルで本にエンチャントを付けます。","村人との取引や、生成されたチェストなどでも入手できます。"],
 slime_ball:["スライムが出現する場所を探します。","スライムを倒したときにドロップするスライムボールを回収します。"],
 gunpowder:["クリーパーやガストなど、火薬をドロップするMobを探します。","倒したときのドロップを回収します。"],
 leather:["ウシなど、革をドロップする動物を探します。","ドロップを回収するほか、取引・チェストなどでも入手できます。"]
};
const typeSuggestions={
 mobs:"スポーンエッグなどはサバイバルでは通常入手できない場合があります。クリエイティブインベントリ・コマンドや対象Mobの入手仕様を確認してください。",
 nature:"自然生成される地域・バイオームを探し、対応する採取方法で入手します。アイテムごとに必要な道具やドロップ条件が異なります。",
 materials:"鉱石の採掘、Mobのドロップ、村人との取引、精錬など素材ごとの取得方法を確認してください。",
 decoration:"染色やクラフトのほか、村や生成物、取引などで手に入る種類もあります。",
 food:"栽培・採集・釣り・Mobのドロップ・調理などで入手します。食べ物ごとに手順が違います。",
 tools:"素材を集めて作業台で作成するものが多く、一部はチェストや取引などからも入手できます。",
 armor:"素材を用いたクラフト・鍛冶台・Mobのドロップ・取引など、装備ごとの方法で入手します。",
 magic:"探索・ドロップ・取引・醸造台・鍛冶台など、専用の入手手段が必要な場合があります。",
 travel:"クラフト・村人取引・生成物での発見など、乗り物やレールの種類に応じて入手します。",
 redstone:"クラフトで作れる装置が多く、一部は自然生成物などからも手に入ります。",
 weapons:"素材を使うクラフト、Mobのドロップ、戦利品などが主な入手手段です。武器ごとの違いを確認してください。",
 building:"ブロックの採掘・加工、または作業台・石切台・製錬などによって入手します。",
 other:"種類によって入手方法が異なります。ゲーム内のレシピブックや下記の詳細情報も確認してください。"
};
function initDetail(){
 const slug=document.body.dataset.item;
 const item=bySlug.get(slug);const root=document.querySelector("#ency-detail");
 if(!item||!root){if(root)root.textContent="アイテムが見つかりませんでした。";return;}
 const q=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;};
 root.replaceChildren();
 const hero=q("section","ency-detail-hero");hero.append(icon(item,105));
 const part=q("div");const tag=q("span","ency-kicker",groupMap.get(item.cat)?.title+" / Java "+DATA.version);
 const name=q("h1","",item.jp);const en=q("p","ency-en",item.name);
 part.append(tag,name,en);hero.append(part);root.append(hero);
 const summary=q("section","ency-panel");summary.append(q("h2","","概要"));
 summary.append(q("p","",item.jp+"（英語名："+item.en+"）は、Minecraftの「"+groupMap.get(item.cat)?.title+"」に分類されるアイテム・ブロックです。1スロットに持てる上限は"+item.stack+"個です。"));
 root.append(summary);
 const recipes=RECIPES[String(item.id)]||[];
 // Items without a crafting-table recipe have no crafting section.
 if(recipes.length){
  const craft=q("section","ency-panel");craft.append(q("h2","","作り方・クラフトレシピ（3×3）"));
  const intro=q("p","","主な作業台レシピをゲーム内アイテムの画像で表示しています。材料の名前をクリックすると、そのアイテムの詳細ページへ移動できます。");
  craft.append(intro);
  recipes.slice(0,3).forEach(r=>renderRecipe(craft,r));
  if(recipes.length>3)craft.append(q("p","ency-muted","ほかの材料の組み合わせもあります。代表的な3種類を掲載しています。"));
  const steps=q("ol","ency-steps");
  const first=recipes[0],ingredients=first.s?first.s.flat().filter(i=>i!==null):first.i;
  const unique=[...new Set(ingredients)].map(i=>byId.get(i)).filter(Boolean);
  const s1=q("li");s1.append(document.createTextNode("必要な材料："));unique.forEach((a,idx)=>{if(idx)s1.append(document.createTextNode("、"));s1.append(crossLink(a));});s1.append(document.createTextNode("を集めます。"));steps.append(s1);
  steps.append(step(first.s&& (first.s.length>2||first.s.some(row=>row.length>2))?"作業台を置いて、3×3のクラフト画面を開きます。":"インベントリのクラフト欄、または作業台のクラフト画面を開きます。"));
  steps.append(step(first.s?"上の3×3配置図の位置に材料を並べます。空白のマスには何も入れません。":"上に示した材料をクラフト欄に入れます。配置の順番は問いません。"));
  steps.append(step("完成した「"+item.jp+"」×"+(first.c||1)+"を取り出します。"));craft.append(steps);
  root.append(craft);
 }
 // Only items without a crafting recipe need an acquisition section.
 if(!recipes.length){
  const obtain=q("section","ency-panel");obtain.append(q("h2","","入手方法・手順"));
  let steps=specificHow[item.name];
  if(!steps){steps=[typeSuggestions[item.cat]||typeSuggestions.other,"参照先やゲーム内レシピブックを確認して、利用中のエディション・バージョンでの条件を調べてください。"];}
  const ol=q("ol","ency-steps");steps.forEach(s=>ol.append(step(s)));obtain.append(ol);
  const ref=q("p","ency-muted");ref.append(document.createTextNode("参考："));
  const a=q("a");a.href="https://minecraft.wiki/w/"+encodeURIComponent(item.name);a.target="_blank";a.rel="noopener noreferrer";a.textContent="Minecraft Wiki（"+item.jp+"）";ref.append(a);obtain.append(ref);root.append(obtain);
 }

 const use=q("section","ency-panel");use.append(q("h2","","使い道・関連アイテム"));
 const useSet=new Set();
 for(const [output,rs] of Object.entries(RECIPES)){
  if(Number(output)===item.id)continue;
  if(rs.some(r=>(r.s?r.s.flat():r.i||[]).includes(item.id)))useSet.add(Number(output));
 }
 const used=[...useSet].map(id=>byId.get(id)).filter(Boolean);
 if(used.length){
  use.append(q("p","","このアイテムを材料に使う主なクラフト例です。各アイテムをクリックすると作り方を確認できます。"));
  const grid=q("div","ency-uses");used.slice(0,24).forEach(j=>grid.append(itemAnchor(j)));use.append(grid);
  if(used.length>24)use.append(q("p","ency-muted","このほかにも"+(used.length-24)+"種類のクラフトレシピで材料として使われます。"));
 }else{
  use.append(q("p","","参照レシピに、このアイテムを材料に使う作業台クラフトは登録されていません。装備・設置・食料・移動・効果付与など、用途はアイテムごとに異なります。"));
 }
 const related=items.filter(x=>x.cat===item.cat&&x.id!==item.id).sort((a,b)=>{
  const pa=a.name.split("_")[0]===item.name.split("_")[0]?1:0,pb=b.name.split("_")[0]===item.name.split("_")[0]?1:0;return pb-pa||a.id-b.id;
 }).slice(0,8);
 if(related.length){use.append(q("h3","","同じカテゴリのアイテム"));const list=q("div","ency-uses");related.forEach(i=>list.append(itemAnchor(i)));use.append(list);}
 root.append(use);
 document.querySelectorAll("[data-category-name]").forEach(el=>{el.textContent=groupMap.get(item.cat)?.title||"";if(el.tagName==="A")el.href=B+"category/"+item.cat+".html";});
 document.querySelector("#ency-hero-name")?.replaceChildren(document.createTextNode(item.jp));
}
if(document.body.dataset.mode==="detail")initDetail();else initListings();
})();
