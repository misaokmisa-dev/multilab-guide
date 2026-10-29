
/* Original, browser-only Minecraft calculators. No external API or stored user data. */
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const number = x => Number(String(x).replace(/,/g,"").trim());
  const fmt = x => Number.isFinite(x) ? new Intl.NumberFormat("ja-JP",{maximumFractionDigits:3}).format(x) : "—";
  const whole = x => Number.isFinite(x) ? new Intl.NumberFormat("ja-JP",{maximumFractionDigits:0}).format(x) : "—";
  const text = (id, value) => { const el=$(id); if(el)el.textContent=value; };
  const announce = (msg) => text("tool-status",msg);
  const copy = async value => {
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw Error("clipboard unavailable");
      await navigator.clipboard.writeText(value);
      announce("コピーしました");
    } catch (_) {
      const el=document.createElement("textarea");
      el.value=value;
      el.style.position="fixed";el.style.opacity="0";
      document.body.appendChild(el);el.select();
      try { document.execCommand("copy") ? announce("コピーしました") : announce("コピーできませんでした。結果を選択してコピーしてください。"); }
      catch (_) { announce("コピーできませんでした。結果を選択してコピーしてください。"); }
      el.remove();
    }
  };
  const action = document.body.dataset.calculator;
  if (action === "nether") {
    let direction="overworld";
    let last="";
    const inputs=[$("coord-x"),$("coord-y"),$("coord-z")];
    const convert=()=>{
      const xs=inputs[0].value.trim(),ys=inputs[1].value.trim(),zs=inputs[2].value.trim();
      const x=number(xs),z=number(zs);
      const y=ys===""?null:number(ys);
      const valid=xs!==""&&zs!==""&&Number.isFinite(x)&&Number.isFinite(z)&&Math.abs(x)<=29999984&&Math.abs(z)<=29999984;
      if(!valid||(y!==null&&(!Number.isFinite(y)||Math.abs(y)>30000000))){
        last="";
        text("result-coords","X — / Y — / Z —");
        text("result-desc","X・Zに有効な座標を入力してください。");
        text("result-dimension","変換後の座標");
        return;
      }
      // For Overworld to Nether, Minecraft floors both horizontal coordinates;
      // this matters for negative coordinates (e.g. -1 -> -1 rather than 0).
      const tx=direction==="overworld"?Math.floor(x/8):Math.floor(x*8);
      const tz=direction==="overworld"?Math.floor(z/8):Math.floor(z*8);
      const ty=y===null?"未入力":whole(Math.floor(y));
      const target=direction==="overworld"?"ネザー":"オーバーワールド";
      text("result-dimension",target+"の座標（目安）");
      text("result-coords","X "+whole(tx)+" / Y "+ty+" / Z "+whole(tz));
      text("result-desc",direction==="overworld"
        ?"X・Zを8で割って切り捨て。Yは8分の1にしません。"
        :"X・Zを8倍して切り捨て。Yは8倍にしません。");
      last=tx+" "+(y===null?"":Math.floor(y)+" ")+tz;
      announce("");
    };
    document.querySelectorAll("[data-direction]").forEach(btn=>{
      btn.addEventListener("click",()=>{
        direction=btn.dataset.direction;
        document.querySelectorAll("[data-direction]").forEach(b=>b.setAttribute("aria-pressed",String(b===btn)));
        convert();
      });
    });
    inputs.forEach(el=>el.addEventListener("input",convert));
    $("copy-coords")?.addEventListener("click",()=>last?copy(last):announce("有効な座標を入力してください。"));
    $("swap-coords")?.addEventListener("click",()=>{
      if(!last){announce("先に座標を入力してください。");return;}
      const x=number(inputs[0].value),z=number(inputs[2].value);
      const tx=direction==="overworld"?Math.floor(x/8):Math.floor(x*8);
      const tz=direction==="overworld"?Math.floor(z/8):Math.floor(z*8);
      inputs[0].value=String(tx);inputs[2].value=String(tz);
      direction=direction==="overworld"?"nether":"overworld";
      document.querySelectorAll("[data-direction]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.direction===direction)));
      convert();
      announce("向きを入れ替えました。整数丸めにより元の座標と一致しない場合があります。");
    });
    convert();
  }
  if (action === "stack") {
    let capacity=64;
    const max=1e12;
    const positiveInteger=(value)=>{
      const raw=String(value).trim().replace(/,/g,"");
      if(!/^\d+$/.test(raw))return null;
      const n=Number(raw);
      return Number.isSafeInteger(n)&&n>=0&&n<=max?n:null;
    };
    const capButtons=[...document.querySelectorAll("[data-capacity]")];
    const update=()=>{
      const total=positiveInteger($("item-count").value);
      const reverseStacks=positiveInteger($("reverse-stacks").value);
      const reverseItems=positiveInteger($("reverse-items").value);
      if(total===null) {
        ["out-stacks","out-items","out-slots","out-chests","out-double","out-shulkers","out-inventories"].forEach(id=>text(id,"—"));
        text("stack-result-note","0以上の整数で入力してください（最大1兆個）。");
      } else {
        const stacks=Math.floor(total/capacity);
        const items=total%capacity;
        const slots=Math.ceil(total/capacity);
        text("out-stacks",whole(stacks));
        text("out-items",whole(items));
        text("out-slots",whole(slots));
        text("out-chests",whole(Math.ceil(slots/27)));
        text("out-double",whole(Math.ceil(slots/54)));
        text("out-shulkers",whole(Math.ceil(slots/27)));
        text("out-inventories",whole(Math.ceil(slots/36)));
        text("stack-result-note","1スタック"+capacity+"個の場合。チェスト・シュルカーボックスは各27枠、ラージチェストは54枠。");
      }
      if(reverseStacks!==null&&reverseItems!==null&&reverseItems<capacity&&reverseStacks*capacity+reverseItems<=max){
        text("reverse-total",whole(reverseStacks*capacity+reverseItems)+" 個");
      } else {
        text("reverse-total","—（余りは"+capacity+"個未満にしてください）");
      }
    };
    capButtons.forEach(btn=>btn.addEventListener("click",()=>{
      capacity=Number(btn.dataset.capacity);
      capButtons.forEach(b=>b.setAttribute("aria-pressed",String(b===btn)));
      text("stack-capacity-note","現在の1スタック上限："+capacity+"個");
      update();
    }));
    ["item-count","reverse-stacks","reverse-items"].forEach(id=>$(id)?.addEventListener("input",update));
    $("copy-stacks")?.addEventListener("click",()=>{
      const total=positiveInteger($("item-count").value);
      if(total===null){announce("有効な個数を入力してください。");return;}
      copy(whole(total)+"個 → "+whole(Math.floor(total/capacity))+"スタックと"+whole(total%capacity)+"個（上限"+capacity+"個）");
    });
    update();
  }
})();
