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
  const CACHE_LIMIT = 1800;
  const cache = new Map();
  let edition = params.get("edition") === "java" ? "java" : "bedrock";
  let center = { x: 0, z: 0 };
  let selected = null;
  let size = 11;
  let activeSeed = null;
  let dragStart = null;

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
  function setUnavailable(message) {
    map.replaceChildren();
    const msg = document.createElement("p");
    msg.className = "slime-map-empty";
    msg.textContent = message;
    map.append(msg);
    nearest.replaceChildren();
    text($("slime-selection"), "版と座標を入力すると、ここに選んだチャンクが表示されます。");
    $("slime-copy").disabled = true;
    $("slime-copy-tp").disabled = true;
    text($("slime-center-kind"), "未判定");
    text($("slime-count"), "—");
  }
  function formatChunk(cx, cz) {
    return "チャンク (" + cx + ", " + cz + ")";
  }
  function chunkRange(cx, cz) {
    return "X " + (cx * 16) + "〜" + (cx * 16 + 15) + " / Z " + (cz * 16) + "〜" + (cz * 16 + 15);
  }
  function closestToPosition(cx, cz, x, z) {
    const nx = Math.max(cx * 16, Math.min(cx * 16 + 15, x));
    const nz = Math.max(cz * 16, Math.min(cz * 16 + 15, z));
    return { x: nx, z: nz, distance: Math.round(Math.hypot(x - nx, z - nz)) };
  }
  function choose(cx, cz, recenter) {
    selected = { x: cx, z: cz };
    if (recenter) center = { x: cx, z: cz };
    draw();
  }
  function draw() {
    updateEditionUI();
    const v = validate(true);
    if (!v) { activeSeed = null; setUnavailable(edition === "java" ? "Java版のシード値を入力すると地図が表示されます。" : "X・Zの整数座標を入力してください。"); return; }
    activeSeed = v.seed;
    const currentX = chunkOf(v.x), currentZ = chunkOf(v.z);
    if (!selected) selected = { x: currentX, z: currentZ };
    const half = Math.floor(size / 2);
    const fragment = document.createDocumentFragment();
    const minX = center.x - half, minZ = center.z - half;
    let count = 0;
    for (let z = minZ; z < minZ + size; z++) {
      for (let x = minX; x < minX + size; x++) {
        const slime = isSlime(x, z);
        if (slime) count++;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "slime-cell" + (slime ? " is-slime" : "") +
          (x === currentX && z === currentZ ? " is-home" : "") +
          (selected.x === x && selected.z === z ? " is-selected" : "");
        button.dataset.x = String(x);
        button.dataset.z = String(z);
        button.setAttribute("aria-label", formatChunk(x, z) + "、" + (slime ? "スライムチャンク" : "通常チャンク") + (x === currentX && z === currentZ ? "、入力座標を含む" : ""));
        button.setAttribute("aria-pressed", String(selected.x === x && selected.z === z));
        button.title = formatChunk(x, z) + " / " + (slime ? "スライム" : "通常");
        if (x === currentX && z === currentZ) {
          const dot = document.createElement("span");
          dot.className = "slime-home-dot";
          dot.setAttribute("aria-hidden", "true");
          button.append(dot);
        }
        fragment.append(button);
      }
    }
    map.style.setProperty("--slime-columns", String(size));
    map.replaceChildren(fragment);
    text($("slime-count"), String(count) + " / " + String(size * size) + "チャンク");
    const selectedSlime = isSlime(selected.x, selected.z);
    text($("slime-center-kind"), selectedSlime ? "スライムチャンク" : "通常チャンク");
    $("slime-center-kind").classList.toggle("is-positive", selectedSlime);
    const nearestBlock = closestToPosition(selected.x, selected.z, v.x, v.z);
    text($("slime-selection"), formatChunk(selected.x, selected.z));
    text($("slime-range"), chunkRange(selected.x, selected.z));
    text($("slime-near-distance"), "現在の入力座標から最も近いブロックまで 約 " + nearestBlock.distance.toLocaleString("ja-JP") + " ブロック");
    $("slime-copy").disabled = false;
    $("slime-copy-tp").disabled = false;
    text($("slime-map-center"), "表示中心: " + formatChunk(center.x, center.z));
    drawNearest(v.x, v.z, currentX, currentZ);
    text(status, edition === "java" ? "Java版のシード値で計算しています。" : "統合版の共通配置を計算しています。");
  }
  function drawNearest(px, pz, cx, cz) {
    const found = [];
    // Search within a generous radius; ranking uses distance to each chunk's nearest block.
    for (let radius = 0; radius <= 12; radius++) {
      for (let dz = -radius; dz <= radius; dz++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dz)) !== radius) continue;
          const x = cx + dx, z = cz + dz;
          if (isSlime(x, z)) {
            const loc = closestToPosition(x, z, px, pz);
            found.push({ x, z, distance: loc.distance, blockX: loc.x, blockZ: loc.z });
          }
        }
      }
      // Any future ring is at least (radius * 16 + 1) blocks away from the starting block.
      // At radius 12, nearest candidates are securely included for normal seeds.
    }
    found.sort((a, b) => a.distance - b.distance || a.z - b.z || a.x - b.x);
    const fragment = document.createDocumentFragment();
    for (const item of found.slice(0, 5)) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slime-nearest-item";
      btn.dataset.x = String(item.x);
      btn.dataset.z = String(item.z);
      const a = document.createElement("strong");
      a.textContent = "X " + item.blockX + " / Z " + item.blockZ;
      const b = document.createElement("span");
      b.textContent = "約" + item.distance.toLocaleString("ja-JP") + "ブロック · " + formatChunk(item.x, item.z);
      btn.append(a, b);
      fragment.append(btn);
    }
    nearest.replaceChildren(fragment);
  }
  function move(dx, dz) {
    center.x += dx; center.z += dz; draw();
  }
  function syncPosition() {
    const v = validate(true);
    if (!v) return draw();
    center = { x: chunkOf(v.x), z: chunkOf(v.z) };
    selected = { ...center };
    draw();
  }
  async function copyString(value, success) {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(value);
      else {
        const input = document.createElement("textarea");
        input.value = value;
        input.style.position = "fixed";
        input.style.left = "-9999px";
        document.body.append(input); input.select();
        if (!document.execCommand("copy")) throw new Error("copy unavailable");
        input.remove();
      }
      text(status, success);
    } catch (_) { text(status, "コピーに失敗しました。座標の文字列を選択してコピーしてください。"); }
  }
  function handleInput() {
    const v = validate(false);
    if (v) {
      center = { x: chunkOf(v.x), z: chunkOf(v.z) };
      selected = { ...center };
    }
    draw();
  }
  editionButtons.forEach((btn) => btn.addEventListener("click", () => {
    edition = btn.dataset.edition;
    cache.clear();
    selected = null;
    syncPosition();
  }));
  [seedInput, xInput, zInput].forEach((input) => input.addEventListener("input", handleInput));
  $("slime-reset").addEventListener("click", syncPosition);
  $("slime-example").addEventListener("click", () => {
    seedInput.value = "12345";
    handleInput();
    text(status, "サンプルのシード値「12345」を表示中。自分のワールドの値に変更してください。");
  });
  document.querySelectorAll("[data-pan]").forEach((btn) => btn.addEventListener("click", () => {
    const [dx, dz] = btn.dataset.pan.split(",").map(Number);
    move(dx * 3, dz * 3);
  }));
  document.querySelectorAll("[data-size]").forEach((btn) => btn.addEventListener("click", () => {
    size = Number(btn.dataset.size);
    document.querySelectorAll("[data-size]").forEach(b => b.setAttribute("aria-pressed", String(b === btn)));
    draw();
  }));
  map.addEventListener("click", (e) => {
    const node = e.target.closest(".slime-cell");
    if (!node || map.dataset.wasDragged === "true") return;
    choose(Number(node.dataset.x), Number(node.dataset.z), false);
  });
  nearest.addEventListener("click", (e) => {
    const node = e.target.closest(".slime-nearest-item");
    if (node) choose(Number(node.dataset.x), Number(node.dataset.z), true);
  });
  viewport.addEventListener("pointerdown", e => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragStart = { x: e.clientX, y: e.clientY, pointer: e.pointerId };
    map.dataset.wasDragged = "false";
  });
  viewport.addEventListener("pointerup", e => {
    if (!dragStart || e.pointerId !== dragStart.pointer) return;
    const dx = e.clientX - dragStart.x, dy = e.clientY - dragStart.y;
    dragStart = null;
    if (Math.abs(dx) + Math.abs(dy) < 35) return;
    map.dataset.wasDragged = "true";
    move(-Math.round(dx / 40), -Math.round(dy / 40));
    // Prevent a drag gesture from selecting a different map cell.
    window.setTimeout(() => { map.dataset.wasDragged = "false"; }, 50);
  });
  $("slime-copy").addEventListener("click", () => {
    if (selected) copyString("X " + selected.x * 16 + "〜" + (selected.x * 16 + 15) + " / Z " + selected.z * 16 + "〜" + (selected.z * 16 + 15), "選択したチャンクの範囲をコピーしました。");
  });
  $("slime-copy-tp").addEventListener("click", () => {
    if (selected) copyString("/tp " + (selected.x * 16 + 8) + " 39 " + (selected.z * 16 + 8), "チャンク中央の /tp コマンドをコピーしました（高さY=39は目安）。");
  });
  $("slime-share").addEventListener("click", () => {
    const v = validate(true);
    if (!v) return;
    const u = new URL(location.href);
    u.search = "";
    u.searchParams.set("edition", edition);
    if (edition === "java") u.searchParams.set("seed", v.seed.toString());
    u.searchParams.set("x", String(v.x));
    u.searchParams.set("z", String(v.z));
    copyString(u.href, "共有URLをコピーしました。Java版ではシード値もURLに含まれます。");
  });
  if (params.has("x")) xInput.value = params.get("x");
  if (params.has("z")) zInput.value = params.get("z");
  if (params.has("seed")) seedInput.value = params.get("seed");
  updateEditionUI();
  syncPosition();
})();
