/* MULTI LAB GUIDE - Slime chunk finder (Java + Bedrock). No external APIs. */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const editionButtons = Array.from(document.querySelectorAll("[data-edition]"));
  const seedInput = $("slime-seed");
  const xInput = $("slime-x");
  const zInput = $("slime-z");
  const map = $("slime-map");
  const viewport = $("slime-map-viewport");
  const nearest = $("slime-nearest");
  const status = $("slime-status");
  const params = new URLSearchParams(location.search);
  const intPattern = /^-?\d+$/;
  const MASK48 = (1n << 48n) - 1n;
  const MULT = 0x5deece66dn;
  const ADD = 0xbn;
  const CACHE_LIMIT = 12000;
  const cache = new Map();
  let edition = params.get("edition") === "java" ? "java" : "bedrock";
  let center = { x: 0, z: 0 };
  let selected = null;
  let size = 31;
  let activeSeed = null;
  let dragStart = null;
  let cancelCellClick = false;
  let currentInputKey = '';

  function readBlock(input) {
    const s = input.value.trim();
    if (!intPattern.test(s)) return null;
    const v = Number(s);
    return Number.isSafeInteger(v) && Math.abs(v) <= 30000000 ? v : null;
  }
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
  function isSlime(cx, cz) {
    const key = edition + ":" + (edition === "java" ? activeSeed.toString() + ":" : "") + cx + "," + cz;
    if (cache.has(key)) return cache.get(key);
    const result = edition === "java" ? javaSlime(cx, cz, activeSeed) : bedrockSlime(cx, cz);
    if (cache.size >= CACHE_LIMIT) cache.clear();
    cache.set(key, result);
    return result;
  }
  function text(el, s) { el.textContent = String(s); }
  function updateEditionUI() {
    editionButtons.forEach((btn) => {
      const active = btn.dataset.edition === edition;
      btn.setAttribute("aria-pressed", String(active));
    });
    $("slime-seed-field").hidden = edition !== "java";
    text($("slime-edition-note"), edition === "java"
      ? "Java版はワールドのシード値が必要です。ゲーム内で /seed を入力して確認できます。"
      : "統合版（Bedrock）はワールドのシード値が不要です。どのワールドでも同じチャンク配置です。");
  }
  function validate(showError) {
    const x = readBlock(xInput), z = readBlock(zInput);
    if (x === null || z === null) {
      if (showError) text(status, "X・Zには -30,000,000〜30,000,000 の整数を入力してください。");
      return null;
    }
    let seed = null;
    if (edition === "java") {
      const s = seedInput.value.trim();
      if (!intPattern.test(s)) {
        if (showError) text(status, "Java版はシード値を入力してください（/seed の数値）。");
        return null;
      }
      try {
        seed = BigInt(s);
        if (seed < -(1n << 63n) || seed > (1n << 63n) - 1n) {
          if (showError) text(status, "シード値は符号付き64ビット整数で入力してください。");
          return null;
        }
      } catch (e) { if (showError) text(status, "有効なシード値を入力してください。"); return null; }
    }
    return { x, z, seed };
  }

  // A chunk is a 16x16 *area*: the chunk indices are NOT block coordinates.
  function corners(cx, cz) {
    const x0 = cx * 16, z0 = cz * 16;
    return { x0, x1: x0 + 15, z0, z1: z0 + 15,
      nw: { x: x0, z: z0 }, ne: { x: x0 + 15, z: z0 },
      sw: { x: x0, z: z0 + 15 }, se: { x: x0 + 15, z: z0 + 15 } };
  }
  function display(n) {
    return n.toLocaleString("ja-JP");
  }
  function tick(n) {
    return (n > 0 ? "+" : "") + String(n);
  }
  function formatChunk(cx, cz) {
    return "チャンク番号 X " + cx + " / Z " + cz;
  }
  function make(tag, cls, value) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (value !== undefined) el.textContent = value;
    return el;
  }
  function closest(cx, cz, x, z) {
    const c = corners(cx, cz);
    const nx = Math.max(c.x0, Math.min(c.x1, x));
    const nz = Math.max(c.z0, Math.min(c.z1, z));
    return { x: nx, z: nz, distance: Math.round(Math.hypot(x - nx, z - nz)) };
  }
  function setUnavailable(message) {
    map.replaceChildren(make("p", "slime-map-empty", message));
    nearest.replaceChildren();
    text($("slime-selection"), "座標を入力すると、チャンクの四隅が表示されます。");
    text($("slime-center-kind"), "未判定");
    $("slime-center-kind").classList.remove("is-positive");
    $("slime-copy").disabled = true;
    $("slime-copy-tp").disabled = true;
    $("slime-copy-corners").disabled = true;
    text($("slime-count"), "—");
    text($("slime-range"), "X方向: —");
    text($("slime-range-z"), "Z方向: —");
    text($("slime-corner-nw"), "X — / Z —");
    text($("slime-corner-ne"), "X — / Z —");
    text($("slime-corner-sw"), "X — / Z —");
    text($("slime-corner-se"), "X — / Z —");
    text($("slime-near-distance"), "");
    text($("slime-center-block"), "");
  }
  function renderSelection(v) {
    const yes = isSlime(selected.x, selected.z);
    const c = corners(selected.x, selected.z);
    text($("slime-center-kind"), yes ? "✓ スライムチャンク" : "通常チャンク（スライムチャンクではありません）");
    $("slime-center-kind").classList.toggle("is-positive", yes);
    text($("slime-selection"), formatChunk(selected.x, selected.z));
    text($("slime-range"), "X方向： " + display(c.x0) + " 〜 " + display(c.x1));
    text($("slime-range-z"), "Z方向： " + display(c.z0) + " 〜 " + display(c.z1));
    text($("slime-corner-nw"), "X " + display(c.nw.x) + " / Z " + display(c.nw.z));
    text($("slime-corner-ne"), "X " + display(c.ne.x) + " / Z " + display(c.ne.z));
    text($("slime-corner-sw"), "X " + display(c.sw.x) + " / Z " + display(c.sw.z));
    text($("slime-corner-se"), "X " + display(c.se.x) + " / Z " + display(c.se.z));
    text($("slime-center-block"), "チャンク中央の目安：X " + display(c.x0 + 8) + " / Z " + display(c.z0 + 8));
    const d = closest(selected.x, selected.z, v.x, v.z);
    text($("slime-near-distance"), "入力した場所から、このチャンクの最も近いブロックまで：約 " + display(d.distance) + " ブロック");
    for(const id of ["slime-copy","slime-copy-tp","slime-copy-corners"]) $(id).disabled = false;
  }
  function focusOn(cx, cz) {
    const half = Math.floor(size / 2);
    const minX = center.x - half, minZ = center.z - half;
    const x = cx - minX, z = cz - minZ;
    const cell = Number.parseFloat(getComputedStyle(map).getPropertyValue("--slime-cell-size")) || 54;
    const gap = Number.parseFloat(getComputedStyle(map).gap) || 3;
    const leftCol = 87 + gap;
    const headRow = 35 + gap;
    const left = leftCol + x * (cell + gap) + cell / 2 - viewport.clientWidth / 2;
    const top = headRow + z * (cell + gap) + cell / 2 - viewport.clientHeight / 2;
    viewport.scrollLeft = Math.max(0, left);
    viewport.scrollTop = Math.max(0, top);
  }
  function makeMapCell(cx, cz, v, currentX, currentZ) {
    const yes = isSlime(cx, cz);
    const c = corners(cx, cz);
    const btn = make("button", "slime-cell" + (yes ? " is-slime" : "") +
      (cx === currentX && cz === currentZ ? " is-home" : "") +
      (selected.x === cx && selected.z === cz ? " is-selected" : ""));
    btn.type = "button";
    btn.dataset.x = String(cx); btn.dataset.z = String(cz);
    btn.setAttribute("aria-label", (yes ? "スライムチャンク" : "通常チャンク") + "。" +
      formatChunk(cx, cz) + "。左上 X " + c.x0 + " Z " + c.z0 + "、右下 X " + c.x1 + " Z " + c.z1 +
      (cx === currentX && cz === currentZ ? "。入力座標を含むチャンク" : ""));
    btn.setAttribute("aria-pressed", String(selected.x === cx && selected.z === cz));
    btn.title = (yes ? "スライムチャンク" : "通常チャンク") + "\n" + formatChunk(cx, cz) +
      "\n左上 X " + c.x0 + " Z " + c.z0 + "\n右下 X " + c.x1 + " Z " + c.z1;
    if (cx === currentX && cz === currentZ) {
      const dot = make("span","slime-home-dot");
      dot.setAttribute("aria-hidden","true");
      btn.append(dot);
    }
    return btn;
  }
  function draw(options) {
    const mode = options || {};
    updateEditionUI();
    const v = validate(true);
    if (!v) {
      activeSeed = null;
      setUnavailable(edition === "java" ? "Java版のシード値を入力すると地図が表示されます。" : "X・Zの整数座標を入力してください。");
      return;
    }
    activeSeed = v.seed;
    const currentX = chunkOf(v.x), currentZ = chunkOf(v.z);
    if (!selected) selected = { x: currentX, z: currentZ };
    const oldLeft = viewport.scrollLeft, oldTop = viewport.scrollTop;
    const half = Math.floor(size / 2);
    const minX = center.x - half, minZ = center.z - half;
    const fragment = document.createDocumentFragment();
    const origin = make("div", "slime-axis-origin", "Z ↓ / X →");
    origin.title = "右へ行くとXが増加、下へ行くとZが増加";
    fragment.append(origin);
    for (let dx = 0; dx < size; dx++) {
      const cx = minX + dx, xStart = cx * 16;
      const label = make("div", "slime-axis-tick slime-axis-x", "X " + tick(xStart));
      label.title = "X方向：この列はブロック座標 " + xStart + " 〜 " + (xStart + 15);
      fragment.append(label);
    }
    let count = 0;
    for (let dz = 0; dz < size; dz++) {
      const cz = minZ + dz, zStart = cz * 16;
      const rowLabel = make("div","slime-axis-tick slime-axis-z", "Z " + tick(zStart));
      rowLabel.title = "Z方向：この行はブロック座標 " + zStart + " 〜 " + (zStart + 15);
      fragment.append(rowLabel);
      for (let dx = 0; dx < size; dx++) {
        const cx = minX + dx;
        if (isSlime(cx, cz)) count++;
        fragment.append(makeMapCell(cx, cz, v, currentX, currentZ));
      }
    }
    map.style.setProperty("--slime-columns", String(size));
    map.replaceChildren(fragment);
    text($("slime-count"), count + " / " + (size * size) + " チャンク");
    text($("slime-map-center"), "中心：チャンク X " + center.x + " / Z " + center.z);
    renderSelection(v);
    const key = edition + "/" + (edition === "java" ? activeSeed.toString() : "") + "/" + v.x + "/" + v.z;
    if (currentInputKey !== key) {
      currentInputKey = key;
      drawNearest(v.x,v.z,currentX,currentZ);
    }
    // Preserve the user's position on selection; focus when changing map location or scale.
    if (mode.focus) focusOn(mode.focus.x, mode.focus.z);
    else { viewport.scrollLeft = oldLeft; viewport.scrollTop = oldTop; }
    text(status, edition === "java" ? "Java版のシード値でチャンクを計算中。X→東 / Z↓南。" : "統合版の共通配置を表示中。X→東 / Z↓南。");
  }
  function choose(cx,cz,recenter) {
    selected = { x: cx, z: cz };
    if (recenter) {
      center = { x: cx, z: cz };
      draw({focus:selected});
    } else {
      // Redrawing the map keeps row/column labels in sync and preserves scroll.
      draw();
    }
  }
  function drawNearest(px,pz,cx,cz) {
    const found = [];
    // Search an entire square, not just the currently visible portion of the map.
    for(let radius=0;radius<=16;radius++) {
      for(let dz=-radius;dz<=radius;dz++) for(let dx=-radius;dx<=radius;dx++) {
        if (Math.max(Math.abs(dx),Math.abs(dz)) !== radius) continue;
        const x = cx+dx,z = cz+dz;
        if(isSlime(x,z)) {
          const d = closest(x,z,px,pz);
          found.push({x,z,nearX:d.x,nearZ:d.z,distance:d.distance});
        }
      }
      // Once 5+ candidates are found and no farther ring can beat them, stop.
      if (found.length >= 5 && radius >= 4) {
        const sorted = [...found].sort((a,b)=>a.distance-b.distance);
        if (sorted[4].distance < Math.max(0,(radius-1)*16-16)) break;
      }
    }
    found.sort((a,b)=>a.distance-b.distance || a.z-b.z || a.x-b.x);
    const fragment = document.createDocumentFragment();
    found.slice(0,5).forEach((it,i)=>{
      const btn=make("button","slime-nearest-item");
      btn.type="button";btn.dataset.x=String(it.x);btn.dataset.z=String(it.z);
      const label=make("span","slime-nearest-rank","候補 "+(i+1)+"　約"+display(it.distance)+"ブロック");
      const main=make("strong",null,"最寄り地点 X "+display(it.nearX)+" / Z "+display(it.nearZ));
      const desc=make("span",null,"チャンク全体の四隅を見る");
      btn.append(label,main,desc);
      fragment.append(btn);
    });
    nearest.replaceChildren(fragment);
  }
  function move(dx,dz) {
    center = {x:center.x+dx,z:center.z+dz};
    draw({focus:center});
  }
  function syncPosition() {
    const v = validate(true);
    if(!v) { draw(); return; }
    center={x:chunkOf(v.x),z:chunkOf(v.z)};
    selected={...center};
    draw({focus:center});
  }
  async function copyString(value,success) {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(value);
      else {
        const el=make("textarea",null,value);
        el.value=value;el.style.position="fixed";el.style.left="-9999px";
        document.body.append(el);el.select();
        if(!document.execCommand("copy")) throw new Error("copy failed");
        el.remove();
      }
      text(status,success);
    } catch(e) { text(status,"コピーできませんでした。結果の文字を選択してコピーしてください。"); }
  }
  function cornerCopyText(includeRanges) {
    const c=corners(selected.x,selected.z);
    return "チャンク番号 X "+selected.x+" / Z "+selected.z+
      "\n北西（左上）: X "+c.nw.x+", Z "+c.nw.z+
      "\n北東（右上）: X "+c.ne.x+", Z "+c.ne.z+
      "\n南西（左下）: X "+c.sw.x+", Z "+c.sw.z+
      "\n南東（右下）: X "+c.se.x+", Z "+c.se.z+
      (includeRanges ? "\nX範囲: "+c.x0+"～"+c.x1+
      "\nZ範囲: "+c.z0+"～"+c.z1 : "");
  }
  function handleInput() {
    const v=validate(false);
    if(v) {
      center={x:chunkOf(v.x),z:chunkOf(v.z)};
      selected={...center};
      draw({focus:center});
    } else draw();
  }
  editionButtons.forEach(btn=>btn.addEventListener("click",()=>{
    edition=btn.dataset.edition;
    cache.clear();currentInputKey="";selected=null;
    syncPosition();
  }));
  [seedInput,xInput,zInput].forEach(input=>input.addEventListener("input",handleInput));
  $("slime-reset").addEventListener("click",syncPosition);
  $("slime-example").addEventListener("click",()=>{
    seedInput.value="12345";handleInput();
    text(status,"サンプルシード値12345を表示中。自分のワールドの値に変更してください。");
  });
  document.querySelectorAll("[data-pan]").forEach(btn=>btn.addEventListener("click",()=>{
    const [dx,dz]=btn.dataset.pan.split(",").map(Number);
    move(dx*3,dz*3);
  }));
  $("slime-map-home").addEventListener("click",syncPosition);
  document.querySelectorAll("[data-size]").forEach(btn=>btn.addEventListener("click",()=>{
    size=Number(btn.dataset.size);
    document.querySelectorAll("[data-size]").forEach(b=>b.setAttribute("aria-pressed",String(b===btn)));
    draw({focus:selected});
  }));
  map.addEventListener("click",e=>{
    const node=e.target.closest(".slime-cell");
    if(!node) return;
    if(cancelCellClick){cancelCellClick=false;return;}
    choose(Number(node.dataset.x),Number(node.dataset.z),false);
  });
  nearest.addEventListener("click",e=>{
    const node=e.target.closest(".slime-nearest-item");
    if(node) {
      choose(Number(node.dataset.x),Number(node.dataset.z),true);
      $("slime-selected-result").scrollIntoView({behavior:"smooth",block:"start"});
    }
  });
  // Both axes scroll natively (touch / trackpad / wheel / scrollbars).
  // Desktop additionally supports click-and-drag without accidentally selecting cells.
  viewport.addEventListener("pointerdown",e=>{
    if(e.pointerType!=="mouse"||e.button!==0)return;
    dragStart={x:e.clientX,y:e.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};
  });
  viewport.addEventListener("pointermove",e=>{
    if(!dragStart||e.pointerType!=="mouse")return;
    const dx=e.clientX-dragStart.x,dy=e.clientY-dragStart.y;
    if(Math.abs(dx)+Math.abs(dy)>5) {
      cancelCellClick=true;
      viewport.classList.add("is-dragging");
      viewport.scrollLeft=dragStart.left-dx;
      viewport.scrollTop=dragStart.top-dy;
      e.preventDefault();
    }
  });
  const stopDrag=()=>{
    dragStart=null;
    viewport.classList.remove("is-dragging");
    if (cancelCellClick) window.setTimeout(()=>{cancelCellClick=false;},100);
  };
  viewport.addEventListener("pointerup",stopDrag);
  viewport.addEventListener("pointercancel",stopDrag);
  viewport.addEventListener("pointerleave",stopDrag);
  viewport.addEventListener("wheel",e=>{
    if(e.shiftKey&&e.deltaY&&!e.deltaX){
      e.preventDefault();
      viewport.scrollLeft+=e.deltaY;
    }
  },{passive:false});
  $("slime-copy").addEventListener("click",()=>{
    if(selected) copyString(cornerCopyText(true),"四隅のブロック座標とX・Z範囲をコピーしました。");
  });
  $("slime-copy-corners").addEventListener("click",()=>{
    if(selected) copyString(cornerCopyText(false),"四隅の座標をコピーしました。");
  });
  $("slime-copy-tp").addEventListener("click",()=>{
    if(!selected)return;
    const c=corners(selected.x,selected.z);
    copyString("/tp "+(c.x0+8)+" ~ "+(c.z0+8),
       "チャンク中央の /tp コマンドをコピー。Yは現位置の高さを維持します。");
  });
  $("slime-share").addEventListener("click",()=>{
    const v=validate(true);if(!v)return;
    const u=new URL(location.href);u.search="";
    u.searchParams.set("edition",edition);
    if(edition==="java") u.searchParams.set("seed",v.seed.toString());
    u.searchParams.set("x",String(v.x));u.searchParams.set("z",String(v.z));
    copyString(u.href,"共有URLをコピーしました。Java版のシード値もURLに含まれます。");
  });
  if(params.has("x"))xInput.value=params.get("x");
  if(params.has("z"))zInput.value=params.get("z");
  if(params.has("seed"))seedInput.value=params.get("seed");
  updateEditionUI();syncPosition();
})();
