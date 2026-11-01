/* MULTI LAB GUIDE / Slime chunk finder 3: "Go here" first. 100% local calculation. */
(()=>{"use strict";
  const $=(id)=>document.getElementById(id);
  const params=new URLSearchParams(location.search);
  const MASK48=(1n<<48n)-1n, MULT=0x5deece66dn, ADD=0xbn;
  const MAX=30000000, cache=new Map(), CACHE_MAX=12000;
  const state={edition:params.get("edition")==="java"?"java":"bedrock",seed:null,
    origin:{x:0,z:0},view:{x:0,z:0},chosen:null,selectedPair:null,
    zoomIndex:2,zoom:25,moving:null,ignoreClick:false,rendered:false,searchSerial:0};
  // Zoom changes the pixel size AND field of view; + = closer, - = farther.
  const ZOOM_LEVELS=[{count:9,cell:94},{count:15,cell:67},{count:25,cell:43},{count:39,cell:27},{count:59,cell:18}];
  function chunkOf(v) { return Math.floor(v / 16); }
  function signed32(v) { return BigInt.asIntN(32, v); }
  function javaSlime(cx, cz, seed) {
    const x = BigInt(cx), z = BigInt(cz);
    const mixed = BigInt.asIntN(64,
      seed + signed32(x * x * 0x4c1906n) + signed32(x * 0x5ac0dbn)
      + signed32(z * z) * 0x4307a7n + signed32(z * 0x5f24fn)
    ) ^ 0x3ad8025fn;
    let state = BigInt.asUintN(48, mixed ^ MULT);
    for (;;) {
      state = (state * MULT + ADD) & MASK48;
      const bits = Number(state >> 17n);
      const value = bits % 10;
      if (bits - value + 9 <= 2147483647) return value === 0;
    }
  }
  // MT19937 first output; Bedrock seed is independent of the world's seed.
  function bedrockSlime(cx, cz) {
    const mt = new Uint32Array(624);
    mt[0] = (Math.imul(cx, 0x1f1f1f1f) ^ cz) >>> 0;
    for (let i = 1; i < 624; i++) {
      const prev = mt[i - 1];
      mt[i] = (Math.imul(1812433253, (prev ^ (prev >>> 30))) + i) >>> 0;
    }
    const join = (mt[0] & 0x80000000) | (mt[1] & 0x7fffffff);
    let y = (mt[397] ^ (join >>> 1) ^ ((join & 1) ? 0x9908b0df : 0)) >>> 0;
    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;
    return (y >>> 0) % 10 === 0;
  }

  function chunkBlock(c){return c*16;}
  function blockCenter(c){return c*16+8;}
  function bounds(cx,cz){return {x0:cx*16,x1:cx*16+15,z0:cz*16,z1:cz*16+15};}
  function fmt(n){return Number(n).toLocaleString("ja-JP");}
  function signed(n){return n>0?"+"+n:String(n);}
  function readInt(id){const s=$(id).value.trim();if(!/^-?\d+$/.test(s))return null;
    const v=Number(s);return Number.isSafeInteger(v)&&Math.abs(v)<=MAX?v:null;}
  function currentInput(){
    const x=readInt("sc-x"),z=readInt("sc-z");
    if(x===null||z===null)return {error:"X・Zには±30,000,000以内の整数を入力してください。"};
    if(state.edition==="java"){
      let seed;
      if(!/^-?\d+$/.test($("sc-seed").value.trim()))return {error:"Java版はワールドのシード値を入力してください。ゲーム内で /seed と入力して確認できます。"};
      try{seed=BigInt($("sc-seed").value.trim());}catch(_){return {error:"シード値が正しくありません。"};}
      if(seed<-(1n<<63n)||seed>(1n<<63n)-1n)return {error:"シード値は64ビット整数で入力してください。"};
      return {x,z,seed};
    }
    return {x,z,seed:null};
  }
  function slime(cx,cz){
    const k=state.edition+":"+(state.edition==="java"?state.seed+":":"")+cx+","+cz;
    if(cache.has(k))return cache.get(k);
    const yes=state.edition==="java"?javaSlime(cx,cz,state.seed):bedrockSlime(cx,cz);
    if(cache.size>CACHE_MAX)cache.clear();
    cache.set(k,yes);return yes;
  }
  function closest(cx,cz,x,z){
    const b=bounds(cx,cz);const bx=Math.min(b.x1,Math.max(b.x0,x));const bz=Math.min(b.z1,Math.max(b.z0,z));
    return Math.hypot(bx-x,bz-z);
  }
  function normDist(d){return Math.round(d);}
  function direction(toX,toZ){
    const dx=toX-state.origin.x,dz=toZ-state.origin.z;
    const a=dx===0?"X方向の移動なし":(dx>0?"東（X＋）":"西（X−）")+"に"+fmt(Math.abs(dx))+"ブロック";
    const b=dz===0?"Z方向の移動なし":(dz>0?"南（Z＋）":"北（Z−）")+"に"+fmt(Math.abs(dz))+"ブロック";
    return [a,b];
  }
  function make(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=String(txt);return e;}
  function put(id,value){$(id).textContent=String(value);}
  function info(cx,cz){
    const b=bounds(cx,cz),x=blockCenter(cx),z=blockCenter(cz);
    return {cx,cz,b,x,z,dist:Math.round(Math.hypot(x-state.origin.x,z-state.origin.z)),edge:closest(cx,cz,state.origin.x,state.origin.z)};
  }
  function candidates(limit=8){
    const ox=chunkOf(state.origin.x),oz=chunkOf(state.origin.z),items=[];
    for(let dz=-16;dz<=16;dz++)for(let dx=-16;dx<=16;dx++){
      const cx=ox+dx,cz=oz+dz;
      if(slime(cx,cz))items.push(info(cx,cz));
    }
    items.sort((a,b)=>a.dist-b.dist||a.edge-b.edge||a.cz-b.cz||a.cx-b.cx);
    return items.slice(0,limit);
  }
  function findPairs(limit=4){
    const ox=chunkOf(state.origin.x),oz=chunkOf(state.origin.z);
    const arr=[];
    const radius=21; // discover useful neighboring slime chunks around the player's base
    for(let z=oz-radius;z<=oz+radius;z++)for(let x=ox-radius;x<=ox+radius;x++){
      if(!slime(x,z))continue;
      for(const [dx,dz] of [[1,0],[0,1]]){
        if(!slime(x+dx,z+dz))continue;
        const xs=Math.min(x,x+dx)*16,zs=Math.min(z,z+dz)*16;
        const w=dx?32:16,h=dz?32:16;
        const middle={x:xs+w/2,z:zs+h/2};
        arr.push({a:{x,z},b:{x:x+dx,z:z+dz},middle,distance:Math.round(Math.hypot(middle.x-state.origin.x,middle.z-state.origin.z)),
          range:{x0:xs,x1:xs+w-1,z0:zs,z1:zs+h-1},orientation:dx?"東西に隣接（32×16）":"南北に隣接（16×32）"});
      }
    }
    arr.sort((a,b)=>a.distance-b.distance);return arr.slice(0,limit);
  }
  function displayError(error){
    $("sc-message").textContent=error;
    $("sc-message").hidden=false;
    $("sc-outcome").hidden=true;
    $("sc-map-ready").hidden=true;
    $("sc-pairs-section").hidden=true;
    put("sc-readout","必要な情報を入力すると、最寄りのスライムチャンクが表示されます。");
  }
  function updateEdition(){
    document.querySelectorAll("[data-edition]").forEach(btn=>btn.setAttribute("aria-pressed",String(btn.dataset.edition===state.edition)));
    $("sc-seed-wrap").hidden=state.edition!=="java";
    put("sc-edition-caption",state.edition==="bedrock"?"統合版はシード値不要。座標だけで探せます。":"Java版ではワールドのシード値が必要です。/seed で確認。");
  }
  function updateUserFields(){
    const p=currentInput();
    if(p.error){displayError(p.error);return false;}
    state.origin={x:p.x,z:p.z};state.seed=p.seed;
    state.view={x:chunkOf(p.x),z:chunkOf(p.z)};
    $("sc-message").hidden=true;
    $("sc-outcome").hidden=false;
    $("sc-map-ready").hidden=false;
    state.selectedPair=null;
    const near=candidates(8);
    if(near.length){
      state.chosen={x:near[0].cx,z:near[0].cz};
      fillResult();
      drawCandidates(near);
      drawMap(true);
      put("sc-readout","近いスライムチャンクを見つけました");
    }else displayError("近くで候補が見つかりません。別の位置を指定してください。");
    // Pairs are optional, computed only if user expands their section.
    if($("sc-pairs-expand").open)drawPairs();
    return true;
  }
  function fillResult(){
    if(!state.chosen)return;
    const target=info(state.chosen.x,state.chosen.z);
    const isValid=slime(state.chosen.x,state.chosen.z);
    $("sc-result-kind").textContent=isValid?"スライムが出る候補":"通常チャンク（スライム対象外）";
    $("sc-result-kind").classList.toggle("is-normal",!isValid);
    put("sc-result-x",fmt(target.x));put("sc-result-z",fmt(target.z));
    put("sc-result-distance",fmt(target.dist)+" ブロック");
    const d=direction(target.x,target.z);
    put("sc-walk-x",d[0]);put("sc-walk-z",d[1]);
    put("sc-range-x",fmt(target.b.x0)+" ～ "+fmt(target.b.x1));
    put("sc-range-z",fmt(target.b.z0)+" ～ "+fmt(target.b.z1));
    put("sc-nw","X "+fmt(target.b.x0)+"　Z "+fmt(target.b.z0));
    put("sc-ne","X "+fmt(target.b.x1)+"　Z "+fmt(target.b.z0));
    put("sc-sw","X "+fmt(target.b.x0)+"　Z "+fmt(target.b.z1));
    put("sc-se","X "+fmt(target.b.x1)+"　Z "+fmt(target.b.z1));
    put("sc-readout","行き先：X "+fmt(target.x)+"、Z "+fmt(target.z));
    $("sc-result-coords").setAttribute("aria-label","目標座標 X "+target.x+"、Z "+target.z);
    if(state.selectedPair){
      $("sc-pair-hint").hidden=false;
      const p=state.selectedPair;
      put("sc-pair-hint","2つの連続チャンク。X "+fmt(p.range.x0)+" ～ "+fmt(p.range.x1)+"、Z "+fmt(p.range.z0)+" ～ "+fmt(p.range.z1)+" をまとめて掘れます。");
    }else $("sc-pair-hint").hidden=true;
  }
  function choose(cx,cz,scroll){
    state.selectedPair=null;
    state.chosen={x:cx,z:cz};
    fillResult();drawMap(false);drawCandidates(candidates(8));
    if(scroll)$("sc-outcome").scrollIntoView({block:"start",behavior:"smooth"});
  }
  function selectPair(p){
    state.selectedPair=p;state.chosen={x:p.a.x,z:p.a.z};
    const b=p.range;
    put("sc-result-kind","隣接2チャンク（まとめて掘る）");
    $("sc-result-kind").classList.remove("is-normal");
    put("sc-result-x",fmt(p.middle.x));put("sc-result-z",fmt(p.middle.z));
    put("sc-result-distance",fmt(p.distance)+" ブロック");
    const d=direction(p.middle.x,p.middle.z);
    put("sc-walk-x",d[0]);put("sc-walk-z",d[1]);
    put("sc-range-x",fmt(b.x0)+" ～ "+fmt(b.x1));put("sc-range-z",fmt(b.z0)+" ～ "+fmt(b.z1));
    put("sc-nw","X "+fmt(b.x0)+"　Z "+fmt(b.z0));
    put("sc-ne","X "+fmt(b.x1)+"　Z "+fmt(b.z0));
    put("sc-sw","X "+fmt(b.x0)+"　Z "+fmt(b.z1));
    put("sc-se","X "+fmt(b.x1)+"　Z "+fmt(b.z1));
    $("sc-pair-hint").hidden=false;
    put("sc-pair-hint","2チャンク連続・"+p.orientation+"。指定した長方形全体が対象です。");
    put("sc-readout","隣接2チャンクの中央：X "+fmt(p.middle.x)+"、Z "+fmt(p.middle.z));
    state.view={x:p.a.x,z:p.a.z};drawMap(true);
    $("sc-outcome").scrollIntoView({block:"start",behavior:"smooth"});
  }
  function drawCandidates(list){
    const holder=$("sc-nearest");holder.replaceChildren();
    const frag=document.createDocumentFragment();
    for(let i=0;i<list.length;i++){
      const t=list[i];
      const btn=make("button","sc-near-item");
      btn.type="button";btn.dataset.x=t.cx;btn.dataset.z=t.cz;
      const selected=state.chosen&&state.chosen.x===t.cx&&state.chosen.z===t.cz&&!state.selectedPair;
      btn.setAttribute("aria-pressed",String(!!selected));
      btn.append(make("span","sc-near-rank",i===0?"最寄り":(i+1)+"番目"),
        make("strong","sc-near-coord","X "+fmt(t.x)+"　Z "+fmt(t.z)),
        make("span","sc-near-distance","中心まで約 "+fmt(t.dist)+" ブロック"));
      frag.append(btn);
    }
    holder.append(frag);
  }
  function drawPairs(){
    const pairs=findPairs(4),frag=document.createDocumentFragment();
    if(pairs.length===0)frag.append(make("p",null,"近くでは隣接2チャンクを見つけられませんでした。検索位置を変えて試してください。"));
    pairs.forEach((p,i)=>{
      const btn=make("button","sc-pair-item");
      btn.type="button";btn.dataset.index=i;
      btn.append(make("span","sc-near-rank","候補 "+(i+1)+" · "+p.orientation),
        make("strong",null,"中心 X "+fmt(p.middle.x)+" / Z "+fmt(p.middle.z)),
        make("span",null,"約 "+fmt(p.distance)+" ブロック / 2チャンク分"));
      frag.append(btn);
    });
    $("sc-pairs").replaceChildren(frag);
    $("sc-pairs-section").hidden=false;
    state.pairs=pairs;
  }
  const map=$("sc-map"),viewport=$("sc-map-scroll");
  function drawMap(recenter){
    if($("sc-map-ready").hidden)return;
    const priorLeft=viewport.scrollLeft,priorTop=viewport.scrollTop;
    const level=ZOOM_LEVELS[state.zoomIndex];state.zoom=level.count;
    const half=Math.floor(state.zoom/2),minX=state.view.x-half,minZ=state.view.z-half;
    const frag=document.createDocumentFragment();
    frag.append(make("span","sc-map-corner-label","Z ↓ / X →"));
    const axisEvery=level.cell>=40?1:level.cell>=25?3:5;
    for(let dx=0;dx<state.zoom;dx++){
      const xx=(minX+dx)*16;
      const l=make("span","sc-axis-label sc-axis-x",dx%axisEvery===0?"X "+signed(xx):"");
      l.title="この列のX座標： "+xx+" ～ "+(xx+15);frag.append(l);
    }
    for(let dz=0;dz<state.zoom;dz++){
      const zz=(minZ+dz)*16;
      const row=make("span","sc-axis-label sc-axis-z",dz%axisEvery===0?"Z "+signed(zz):"");row.title="Z "+zz+" ～ "+(zz+15);frag.append(row);
      for(let dx=0;dx<state.zoom;dx++){
        const cx=minX+dx,cz=minZ+dz;
        const yes=slime(cx,cz);
        const selected=!!state.chosen&&state.chosen.x===cx&&state.chosen.z===cz;
        const pair=state.selectedPair&&((state.selectedPair.a.x===cx&&state.selectedPair.a.z===cz)||(state.selectedPair.b.x===cx&&state.selectedPair.b.z===cz));
        const home=chunkOf(state.origin.x)===cx&&chunkOf(state.origin.z)===cz;
        const cell=make(yes?"button":"span","sc-cell"+(yes?" is-slime":"")+(selected||pair?" is-selected":"")+(home?" is-home":""));
        if(yes)cell.type="button";cell.dataset.x=cx;cell.dataset.z=cz;
        const b=bounds(cx,cz);
        if(yes)cell.setAttribute("aria-pressed",String(!!selected||!!pair));
        cell.setAttribute("aria-label",(yes?"スライム":"通常")+"、X "+b.x0+"〜"+b.x1+"、Z "+b.z0+"〜"+b.z1+(home?"、入力位置":""));
        cell.title=(yes?"スライム":"通常")+" / X "+b.x0+"〜"+b.x1+" / Z "+b.z0+"〜"+b.z1;
        if(home)cell.append(make("span","sc-home-dot"));
        frag.append(cell);
      }
    }
    map.style.setProperty("--sc-count",String(state.zoom));
    map.style.setProperty("--sc-cell",level.cell+"px");
    map.replaceChildren(frag);
    put("sc-zoom-level",state.zoom+"×"+state.zoom+" マス");
    put("sc-zoom-sub","1マス="+level.cell+"px");
    $("sc-zoom-plus").disabled=state.zoomIndex===0;
    $("sc-zoom-minus").disabled=state.zoomIndex===ZOOM_LEVELS.length-1;
    const viewLabel="表示範囲：X "+(minX*16)+" ～ "+((minX+state.zoom)*16-1)+" / Z "+(minZ*16)+" ～ "+((minZ+state.zoom)*16-1);
    put("sc-map-visible-range",viewLabel);
    if(recenter){
      // Native scroll keeps canvas-like navigation smooth and axes aligned.
      const pitch=level.cell+3, axis=86, targetCx=state.chosen?state.chosen.x:state.view.x, targetCz=state.chosen?state.chosen.z:state.view.z;
      const tx=axis+(targetCx-minX)*pitch+level.cell/2-viewport.clientWidth/2;
      const tz=39+(targetCz-minZ)*pitch+level.cell/2-viewport.clientHeight/2;
      viewport.scrollLeft=Math.max(0,tx);viewport.scrollTop=Math.max(0,tz);
    }else{viewport.scrollLeft=priorLeft;viewport.scrollTop=priorTop;}
  }
  function pan(dx,dz){
    state.view={x:state.view.x+dx,z:state.view.z+dz};
    drawMap(true);
  }
  function clipboard(value,success){
    if(!value){put("sc-status","コピーする内容がありません。");return;}
    const done=()=>put("sc-status",success);
    if(navigator.clipboard&&window.isSecureContext){
      navigator.clipboard.writeText(value).then(done,()=>put("sc-status","コピーできませんでした。画面の座標を長押ししてコピーしてください。"));
    }else{
      const a=make("textarea");a.value=value;a.style.position="fixed";a.style.left="-9999px";
      document.body.append(a);a.select();
      try{if(!document.execCommand("copy"))throw Error("unsupported");done();}
      catch(_){put("sc-status","コピーできませんでした。画面の座標を選択してください。");}
      a.remove();
    }
  }
  function resultText(){
    if(!state.chosen)return"";
    const b=state.selectedPair?state.selectedPair.range:bounds(state.chosen.x,state.chosen.z);
    const x=state.selectedPair?state.selectedPair.middle.x:blockCenter(state.chosen.x);
    const z=state.selectedPair?state.selectedPair.middle.z:blockCenter(state.chosen.z);
    return "スライムチャンク\n行き先 X "+x+", Z "+z+"\n掘る範囲 X "+b.x0+"～"+b.x1+", Z "+b.z0+"～"+b.z1+
      "\n北西 X "+b.x0+" Z "+b.z0+"\n北東 X "+b.x1+" Z "+b.z0+
      "\n南西 X "+b.x0+" Z "+b.z1+"\n南東 X "+b.x1+" Z "+b.z1;
  }
  function targetPoint(){
    if(!state.chosen)return null;
    return state.selectedPair?state.selectedPair.middle:{x:blockCenter(state.chosen.x),z:blockCenter(state.chosen.z)};
  }
  function safeCopy(id,kind){
    if(!state.chosen)return;
    const p=targetPoint();
    if(kind==="coords")clipboard("X "+p.x+" Z "+p.z,"目的地の座標をコピーしました。");
    if(kind==="all")clipboard(resultText(),"行き先と掘る範囲をコピーしました。");
    if(kind==="tp")clipboard("/tp "+p.x+" ~ "+p.z,"/tpコマンドをコピーしました。高さYは現在位置のままです。");
  }
  function share(){
    const v=currentInput();
    if(v.error)return;
    const u=new URL(location.href);u.search="";
    u.searchParams.set("edition",state.edition);
    if(state.edition==="java")u.searchParams.set("seed",String(v.seed));
    u.searchParams.set("x",String(v.x));u.searchParams.set("z",String(v.z));
    clipboard(String(u.href),"条件付きのリンクをコピーしました。Java版はシード値がURLに含まれます。");
  }
  document.querySelectorAll("[data-edition]").forEach(b=>b.addEventListener("click",()=>{
    if(state.edition===b.dataset.edition)return;
    state.edition=b.dataset.edition;state.selectedPair=null;cache.clear();
    updateEdition();updateUserFields();
  }));
  let inputTask;
  ["sc-seed","sc-x","sc-z"].forEach(id=>$(id).addEventListener("input",()=>{
    clearTimeout(inputTask);inputTask=setTimeout(updateUserFields,130);
  }));
  $("sc-submit").addEventListener("click",()=>{
    const ok=updateUserFields();
    if(ok){
      const result=$("sc-outcome");
      result.classList.remove("sc-search-pulse");
      // Force restart so repeated searches always show an obvious response.
      void result.offsetWidth;
      result.classList.add("sc-search-pulse");
      result.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
      put("sc-status","検索完了：最寄りのスライムチャンクの座標と掘る範囲を表示しました。");
      put("sc-search-feedback","検索完了。下の結果へ移動します。");
    }else{
      $("sc-message").scrollIntoView({behavior:"smooth",block:"nearest"});
      put("sc-search-feedback","入力内容を確認してください。");
    }
  });
  $("sc-sample").addEventListener("click",()=>{$("sc-seed").value="12345";updateUserFields();put("sc-status","サンプル「12345」を使用中。自分のワールドのシードに変更してください。");});
  $("sc-nearest").addEventListener("click",e=>{
    const b=e.target.closest("button[data-x]");if(!b)return;
    choose(Number(b.dataset.x),Number(b.dataset.z),true);
    $("sc-outcome").scrollIntoView({behavior:"smooth",block:"start"});
  });
  $("sc-pairs-expand").addEventListener("toggle",()=>{if($("sc-pairs-expand").open&&currentInput().error===undefined)drawPairs();});
  $("sc-pairs").addEventListener("click",e=>{
    const b=e.target.closest("button[data-index]");if(b&&state.pairs[+b.dataset.index])selectPair(state.pairs[+b.dataset.index]);
  });
  $("sc-map").addEventListener("click",e=>{
    const b=e.target.closest("button[data-x]");if(!b||!slime(Number(b.dataset.x),Number(b.dataset.z)))return;
    if(state.ignoreClick){state.ignoreClick=false;return;}
    choose(Number(b.dataset.x),Number(b.dataset.z),false);
  });
  document.querySelectorAll("[data-pan]").forEach(b=>b.addEventListener("click",()=>{
    const [dx,dz]=b.dataset.pan.split(",").map(Number);pan(dx*5,dz*5);
  }));
  const home=()=>{state.view={x:chunkOf(state.origin.x),z:chunkOf(state.origin.z)};drawMap(true);};
  $("sc-map-home").addEventListener("click",home);
  $("sc-map-home-duplicate").addEventListener("click",home);
  $("sc-show-result").addEventListener("click",()=>$("sc-outcome").scrollIntoView({behavior:"smooth",block:"start"}));
  function changeZoom(direction){
    const next=Math.max(0,Math.min(ZOOM_LEVELS.length-1,state.zoomIndex+direction));
    if(next===state.zoomIndex)return;
    state.zoomIndex=next;
    // Zoom around the selected destination so it cannot disappear at high magnification.
    if(state.chosen)state.view={x:state.chosen.x,z:state.chosen.z};
    drawMap(true);
  }
  $("sc-zoom-plus").addEventListener("click",()=>changeZoom(-1));
  $("sc-zoom-minus").addEventListener("click",()=>changeZoom(1));
  viewport.addEventListener("wheel",e=>{
    if(e.ctrlKey||e.metaKey){
      e.preventDefault();
      changeZoom(e.deltaY<0?-1:1);
    }
  },{passive:false});
  $("sc-expand").addEventListener("click",()=>{
    const on=$("sc-map-panel").classList.toggle("is-expanded");
    $("sc-expand").setAttribute("aria-pressed",String(on));
    $("sc-expand").textContent=on?"縮小して戻る":"地図を大きく見る";
    document.body.classList.toggle("sc-map-open",on);
    drawMap(true);
  });
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"&&$("sc-map-panel").classList.contains("is-expanded"))$("sc-expand").click();
  });
  // Natural 2-axis trackpad & touchscreen scrolling. Mouse drag adds grab-to-pan.
  let drag=null;
  viewport.addEventListener("pointerdown",e=>{
    if(e.pointerType!=="mouse"||e.button!==0)return;
    drag={x:e.clientX,y:e.clientY,left:viewport.scrollLeft,top:viewport.scrollTop,moved:false};
  });
  viewport.addEventListener("pointermove",e=>{
    if(!drag||e.pointerType!=="mouse")return;
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    if(Math.abs(dx)+Math.abs(dy)>6){
      drag.moved=true;state.ignoreClick=true;
      viewport.classList.add("is-grabbing");
      viewport.scrollLeft=drag.left-dx;viewport.scrollTop=drag.top-dy;
      e.preventDefault();
    }
  });
  function endDrag(){
    if(drag?.moved)setTimeout(()=>{state.ignoreClick=false;},120);
    drag=null;viewport.classList.remove("is-grabbing");
  }
  ["pointerup","pointercancel","pointerleave"].forEach(e=>viewport.addEventListener(e,endDrag));
  $("sc-copy-coords").addEventListener("click",()=>safeCopy("sc-copy-coords","coords"));
  $("sc-copy-all").addEventListener("click",()=>safeCopy("sc-copy-all","all"));
  $("sc-copy-tp").addEventListener("click",()=>safeCopy("sc-copy-tp","tp"));
  $("sc-share").addEventListener("click",share);

  // Returning visitors can *choose* to save their world locally. No automatic storage.
  const SAVE_KEY="mlg-slime-saved-worlds-v1";
  function savedWorlds(){
    try{
      const value=JSON.parse(localStorage.getItem(SAVE_KEY)||"[]");
      return Array.isArray(value)?value.filter(v=>v&&typeof v.name==="string"&&(v.edition==="java"||v.edition==="bedrock")).slice(0,8):[];
    }catch(_){return [];}
  }
  function persistSaved(list){
    try{localStorage.setItem(SAVE_KEY,JSON.stringify(list.slice(0,8)));return true;}
    catch(_){put("sc-save-message","このブラウザでは保存が利用できません。共有リンクをご利用ください。");return false;}
  }
  function renderSavedWorlds(){
    const list=savedWorlds(),frag=document.createDocumentFragment();
    if(!list.length){frag.append(make("p","sc-no-saved","保存したワールドはまだありません。"));}else{
      list.forEach((v,index)=>{
        const item=make("div","sc-saved-item");
        const label=make("span");
        label.append(make("strong",null,v.name),make("span",null,(v.edition==="java"?"Java版":"統合版")+" · X "+v.x+" / Z "+v.z));
        const open=make("button",null,"読み込む");open.type="button";open.dataset.action="load";open.dataset.index=String(index);
        const remove=make("button",null,"削除");remove.type="button";remove.dataset.action="remove";remove.dataset.index=String(index);
        item.append(label,open,remove);frag.append(item);
      });
    }
    $("sc-saved-list").replaceChildren(frag);
  }
  $("sc-save").addEventListener("click",()=>{
    const v=currentInput();
    if(v.error){put("sc-save-message","入力値を確認してください。"+v.error);return;}
    const name=$("sc-save-name").value.trim().slice(0,30)||"保存した拠点";
    const list=savedWorlds();
    const entry={name,edition:state.edition,x:v.x,z:v.z,seed:v.seed===null?null:String(v.seed)};
    const i=list.findIndex(q=>q.name===name&&q.edition===state.edition);
    if(i>=0)list.splice(i,1);
    list.unshift(entry);
    if(persistSaved(list)){
      renderSavedWorlds();
      put("sc-save-message","「"+name+"」をこの端末に保存しました。次回は「読み込む」で復元できます。");
    }
  });
  $("sc-saved-list").addEventListener("click",e=>{
    const b=e.target.closest("button[data-action]");if(!b)return;
    const list=savedWorlds(),i=Number(b.dataset.index);if(!Number.isInteger(i)||!list[i])return;
    if(b.dataset.action==="remove"){
      const label=list[i].name;list.splice(i,1);
      if(persistSaved(list)){renderSavedWorlds();put("sc-save-message","「"+label+"」を削除しました。");}
      return;
    }
    const v=list[i];
    state.edition=v.edition;
    $("sc-x").value=v.x;$("sc-z").value=v.z;$("sc-seed").value=v.seed||"";
    updateEdition();updateUserFields();
    put("sc-save-message","「"+v.name+"」を読み込みました。");
    $("sc-outcome").scrollIntoView({block:"start",behavior:"smooth"});
  });
  renderSavedWorlds();
  if(params.has("x"))$("sc-x").value=params.get("x");
  if(params.has("z"))$("sc-z").value=params.get("z");
  if(params.has("seed"))$("sc-seed").value=params.get("seed");
  updateEdition();updateUserFields();
})();
