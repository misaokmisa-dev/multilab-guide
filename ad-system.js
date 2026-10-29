/* ゲーム広告: AdSense自動広告 / 提携ゲームバナー / 任意のミュート動画 */
(() => {
"use strict";
const conf=window.MULTILAB_ADS||{}, main=document.querySelector("main");
if(!main) return;
const preview=new URLSearchParams(location.search).get("ads-preview")==="1";
const legal=/\/(?:about|privacy|sitemap)\.html$/.test(location.pathname);
const node=(tag,klass,text)=>{const x=document.createElement(tag);if(klass)x.className=klass;if(text!==undefined)x.textContent=text;return x;};
const safe=s=>{try{const u=new URL(s,location.href);return !!s&&(u.protocol==="https:"||(u.protocol==="http:"&&u.host===location.host));}catch{return false;}};
const client=typeof conf.adsenseClient==="string"&&/^ca-pub-\d{10,25}$/.test(conf.adsenseClient.trim())?conf.adsenseClient.trim():"";
const ads=Array.isArray(conf.gameCampaigns)?conf.gameCampaigns.filter(a=>a&&safe(a.url)&&safe(a.image)):[];
const demos=[{title:"美少女ゲーム広告",description:"広告の配置見本（報酬なし）",demo:true},{title:"アニメ系RPG広告",description:"契約済み広告が表示されます",demo:true},{title:"新作ゲーム広告",description:"サンプルです",demo:true}];
const campaigns=preview&&!ads.length?demos:ads;
const label=(host,val)=>host.appendChild(node("span","mlg-ad-label",val||"広告"));
if(client){
  const tag=node("script");
  tag.async=true;tag.crossOrigin="anonymous";
  tag.src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client="+encodeURIComponent(client);
  document.head.appendChild(tag);
}
function card(c){
 const x=node(c.demo?"div":"a","mlg-ad-card");
 if(!c.demo){x.href=c.url;x.target="_blank";x.rel="nofollow sponsored noopener noreferrer";}
 if(c.demo)x.appendChild(node("div","mlg-ad-preview","GAME ADS"));
 else{const img=node("img");img.src=c.image;img.alt=c.title||"ゲーム広告";img.loading="lazy";img.decoding="async";x.appendChild(img);}
 const copy=node("span","mlg-ad-copy");copy.appendChild(node("strong","",c.title||"ゲーム情報"));
 if(c.description)copy.appendChild(node("small","",c.description));x.appendChild(copy);return x;
}
function cardsBlock(items){
 const box=node("aside","mlg-ad-block");box.setAttribute("aria-label",preview?"広告プレビュー":"広告");
 label(box,preview?"広告レイアウトのサンプル（報酬なし）":"広告");
 const grid=node("div","mlg-ad-grid");items.forEach(c=>grid.appendChild(card(c)));box.appendChild(grid);return box;
}
function adsenseBlock(slot){
 if(!client||!slot||!/^\d{6,25}$/.test(String(slot)))return null;
 const box=node("aside","mlg-ad-block");box.setAttribute("aria-label","広告");label(box);
 const ins=node("ins","adsbygoogle");ins.style.display="block";ins.dataset.adClient=client;ins.dataset.adSlot=String(slot);ins.dataset.adFormat="auto";ins.dataset.fullWidthResponsive="true";box.appendChild(ins);
 queueMicrotask(()=>{try{(window.adsbygoogle=window.adsbygoogle||[]).push({});}catch(_){}});return box;
}
const sections=Array.from(main.children).filter(x=>x.tagName==="SECTION");
const first=sections[Math.min(1,sections.length-1)]||main.lastElementChild;
const mid=sections.length>=5?sections[Math.floor(sections.length*.67)]:null;
const after=(where,what)=>{if(where&&what)where.after(what);};
if(!legal){
 if(campaigns.length){after(first,cardsBlock(campaigns.slice(0,3)));if(mid&&campaigns.length>1)after(mid,cardsBlock(campaigns.slice(-2)));}
 else{after(first,adsenseBlock(conf.adsenseSlots?.inline));if(mid)after(mid,adsenseBlock(conf.adsenseSlots?.bottom));}
}
const video=conf.videoCampaign&&safe(conf.videoCampaign.video)&&safe(conf.videoCampaign.url)?conf.videoCampaign:null;
function rail(side,content){
 const aside=node("aside","mlg-ad-rail "+side);aside.setAttribute("aria-label",preview?"広告プレビュー":"広告");label(aside,preview?"広告プレビュー":"広告");
 const close=node("button","mlg-ad-close","×");close.type="button";close.title="広告を閉じる";close.setAttribute("aria-label","広告を閉じる");close.addEventListener("click",()=>aside.remove());
 aside.appendChild(close);aside.appendChild(content);document.body.appendChild(aside);
}
if(!legal&&!client&&(campaigns.length||video)){
 if(campaigns.length)rail("left",card(campaigns[0]));
 if(video){
  const box=node("div","mlg-video"),v=node("video");
  v.src=video.video;v.autoplay=true;v.loop=true;v.muted=true;v.defaultMuted=true;v.playsInline=true;v.preload="none";
  if(safe(video.poster))v.poster=video.poster;
  box.appendChild(v);
  const a=node("a","",video.title?video.title+"を見る":"ゲームを見る");a.href=video.url;a.target="_blank";a.rel="nofollow sponsored noopener noreferrer";box.appendChild(a);
  rail("right",box);
  if("IntersectionObserver" in window){const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.intersectionRatio>=.5&&!document.hidden)v.play().catch(()=>{});else v.pause();}),{threshold:[0,.5,1]});obs.observe(v);}
  document.addEventListener("visibilitychange",()=>{if(document.hidden)v.pause();});
 }else if(campaigns.length>1)rail("right",card(campaigns[1]));
}
})();

/* Load missing-creative slot cleanup after the publisher markup is parsed. */
(function(){const script=document.createElement("script");script.src="/ad-empty-collapse.js";script.defer=true;document.head.appendChild(script);})();


/* Responsive smartphone header ad: enlarge the 320px creative when there is
 * spare horizontal room, never exceed the phone viewport, and preserve ratio.
 * Desktop ads stay unscaled.
 */
(function () {
  "use strict";
  const phoneUA = /iPhone|iPod|Android.*Mobile/i.test(navigator.userAgent);
  const media = window.matchMedia("(max-width: 767px)");
  const slots = Array.from(document.querySelectorAll(".as-slot.as-top"));
  if (!slots.length) return;

  let pending = false;
  function update() {
    pending = false;
    const phone = phoneUA || media.matches;
    slots.forEach(slot => {
      const area = slot.querySelector(".as-ad-content");
      if (!area) return;
      for (const property of ["transform", "width", "min-width", "margin-bottom"]) {
        area.style.removeProperty(property);
      }
      if (!phone) return;
      const creative = area.querySelector("iframe, img, ins, object, embed, video, canvas");
      if (!creative) return; // Network has not delivered a creative.
      const width = Math.max(
        area.scrollWidth,
        creative.scrollWidth || 0,
        creative.offsetWidth || 0,
        Number(creative.getAttribute("width")) || 0
      );
      const available = Math.max(0, Math.min(slot.clientWidth, document.documentElement.clientWidth) - 12);
      if (width <= 0 || available < 250) return;
      const scale = Math.min(1.18, available / width);
      if (!isFinite(scale) || Math.abs(scale - 1) < 0.01) return;
      const height = Math.max(
        area.scrollHeight,
        creative.offsetHeight || 0,
        Number(creative.getAttribute("height")) || 0
      );
      area.style.width = width + "px";
      area.style.minWidth = width + "px";
      area.style.transform = "scale(" + scale + ")";
      if (height > 0) {
        area.style.marginBottom = (height * (scale - 1)) + "px";
      }
    });
  }
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(update);
  }
  const observer = new MutationObserver(schedule);
  slots.forEach(slot => observer.observe(slot, { childList: true, subtree: true }));
  window.addEventListener("resize", schedule, { passive: true });
  if (media.addEventListener) media.addEventListener("change", schedule);
  schedule();
})();


/* Ninja AdMax fallback for content pages without the publisher's existing slots.
 * Each creative is isolated in srcdoc so document.write cannot replace the host
 * document. Existing Ninja placements are reused without duplication.
 * A blank/unfilled creative never leaves a reserved advertising rectangle. */
(() => {
  "use strict";
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup, { once: true });
  } else setup();
  function setup() {
    const main = document.querySelector("main");
    if (!main || /\/(?:about|privacy|sitemap)\.html$/.test(location.pathname) ||
      /^\/admin\//.test(location.pathname) ||
      new URLSearchParams(location.search).has("ads-preview")) return;
    const mobile = matchMedia("(max-width: 767px)").matches;
    const topId = mobile ? "8339ab59e40bba89fe75bf3969b23ef7" : "878b3c1886fe42359fb3b2718a3f1cb2";
    const slot = (name, id, width, height) => {
      const outer = document.createElement("aside");
      outer.className = name+" mlg-auto-ninja";
      outer.setAttribute("aria-label", "広告");
      outer.dataset.mlgAutoAd = id;
      const area = document.createElement("div");
      area.className = name.includes("as-fixed-bottom") ? "as-fixed-bottom-content" : "as-ad-content";
      if (!name.includes("as-fixed-bottom")) {
        const lab = document.createElement("span");
        lab.className = "as-slot-label"; lab.textContent = "広告";
        outer.append(lab);
      }
      const frame = document.createElement("iframe");
      frame.title = "広告";
      frame.width = String(width); frame.height = String(height);
      frame.setAttribute("scrolling", "no");
      frame.setAttribute("sandbox", "allow-scripts allow-popups allow-popups-to-escape-sandbox");
      frame.referrerPolicy = "strict-origin-when-cross-origin";
      frame.loading = name.includes("as-rail") ? "eager" : "lazy";
      frame.className = "mlg-auto-ninja-frame";
      const signal = "mlg-ad-" + id + "-" + name.replace(/\s+/g,"-");
      const contents = '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}img,iframe,ins{max-width:100%}</style></head><body>' +
        '<script src="https://adm.shinobi.jp/s/' + id + '"></' + 'script>' +
        '<script>(function(){function test(){var has=!!document.body.querySelector("iframe,img,ins,object,embed,canvas,video,a");' +
        'parent.postMessage({mlgNinja: "' + signal + '",filled:has},"*");}' +
        'setTimeout(test,2200);setTimeout(test,6500);setTimeout(test,11000);})()</' + 'script>' +
        '</body></html>';
      frame.srcdoc = contents;
      area.append(frame);
      outer.append(area);
      let filled = false;
      function onMessage(event) {
        if (event.source !== frame.contentWindow || event.data?.mlgNinja !== signal) return;
        if (event.data.filled) {
          filled = true; outer.classList.add("mlg-ad-loaded");
          outer.hidden = false; outer.classList.remove("as-empty");
        } else if (!filled) { outer.hidden = true; outer.classList.add("as-empty"); }
      }
      window.addEventListener("message",onMessage);
      window.setTimeout(() => { if (!filled) { outer.hidden = true; outer.classList.add("as-empty"); } }, 8500);
      outer.addEventListener("DOMNodeRemoved", () => window.removeEventListener("message",onMessage), {once:true});
      return outer;
    };
    const button=(outer,klass)=>{
      const b=document.createElement("button");b.type="button";b.className=klass;
      b.textContent="×";b.setAttribute("aria-label","広告を閉じる");
      b.addEventListener("click",()=>outer.remove());outer.append(b);
    };
    if (!main.querySelector(".as-slot.as-top")) {
      const top=slot("as-slot as-top",topId,mobile?320:728,mobile?100:90);
      main.prepend(top);
    }
    if (!main.querySelector(".as-slot.as-inline-single,.as-mosaic,.mlg-ad-block")) {
      const inline=slot("as-slot as-inline-single","8f484decc94c10e43e237e6221290bc5",300,250);
      const target=main.querySelector("#ency-detail") ||
        main.querySelector("#ency-results")?.closest("section") ||
        main.querySelector(".ency-section") ||
        main.querySelector("section") ||
        main.querySelector("article") || main.firstElementChild;
      if (target) target.after(inline);
    }
    if (!document.querySelector(".as-rail-right,.mlg-ad-rail.right")) {
      const side=slot("as-rail as-rail-right","fb313b60f0f9f6d3af77a1b97ad84baf",160,600);
      button(side,"as-close");document.body.append(side);
    }
    if (!document.querySelector(".as-fixed-bottom")) {
      const bottom=slot("as-fixed-bottom","8bffb3e2dd71c5fbfe19ad6f84a16cad",mobile?320:728,mobile?100:90);
      button(bottom,"as-fixed-bottom-close");document.body.append(bottom);
    }
  }
})();
