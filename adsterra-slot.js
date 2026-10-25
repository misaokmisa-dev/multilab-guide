/*
 * MULTI LAB GUIDE / Non-blocking monetized ad loader.
 * Existing Adsterra + Ninja AdMax publisher codes execute only inside
 * isolated, lazy-loaded frames. Page parsing never waits on ad servers.
 * If a network has no fill, its slot remains collapsed, not a white rectangle.
 */
(function () {
  "use strict";
  var script = document.currentScript;
  if (!script) return;
  var slot = script.getAttribute("data-slot") || "";
  var host = script.closest(".as-slot,.as-rail");
  if (!host) return;
  var area = host.querySelector(".as-ad-content");
  if (!area) return;
  var width = window.innerWidth || document.documentElement.clientWidth || 0;
  var isRail = slot === "rail" || slot === "rail-left";
  if (isRail && width < 1600 || slot === "bottom" && width < 760) {
    host.classList.add("as-ad-unavailable"); return;
  }
  var sizes = {
    banner728: {key:"952e7f7e0a9baebf99dbec214764c5fd",w:728,h:90},
    banner320: {key:"987f4cf689b3091fd9f181d1099c500e",w:320,h:50},
    banner300: {key:"77aace03b06b9767c94a3cf31e62f4bb",w:300,h:250},
    banner468: {key:"3ebde0456afd6f9c7487a079faac22dd",w:468,h:60}
  };
  var unit = slot === "leaderboard" ? (width < 760 ? sizes.banner320 : sizes.banner728) :
    slot === "inline" ? sizes.banner300 : slot === "bottom" ? sizes.banner468 : null;
  if (!unit && !isRail) return;

  host.classList.add("as-ad-loading");
  host.classList.remove("as-filled");
  var token = "ad" + Math.random().toString(36).slice(2);
  var remote = isRail ? "https://adm.shinobi.jp/s/606eff35a5c797d67862f6a388753942" :
    "https://bauval.org/22/" + unit.key;
  var h = isRail ? 600 : unit.h;
  var w = isRail ? 160 : unit.w;
  var mounted = false, settled = false, frame;

  function finish(success) {
    if (settled) return;
    settled = true;
    host.classList.remove("as-ad-loading","as-empty","as-filled");
    host.classList.add(success ? "as-ad-loaded" : "as-ad-unavailable");
    if (!success && frame) frame.remove();
  }
  // The child frame signals only when a real ad creative/iframe is inserted.
  // Checking event.source and the nonce prevents unrelated frames from revealing blanks.
  function onMessage(ev) {
    if (!frame || ev.source !== frame.contentWindow) return;
    if (!ev.data || ev.data.mlgAdReady !== token) return;
    window.removeEventListener("message",onMessage);
    finish(true);
  }
  window.addEventListener("message",onMessage);

  var setup = unit ? "var atOptions = " + JSON.stringify({
    key:unit.key,format:"iframe",height:unit.h,width:unit.w,params:{}
  }) + ";" : "";
  var watcher = "(function(){var ok=false;function send(){if(ok)return;" +
    "var nodes=document.querySelectorAll('body iframe,body img,body object,body embed,body ins,body canvas,body a[href],body video');" +
    "if(!nodes.length)return;ok=true;parent.postMessage({mlgAdReady:" + JSON.stringify(token) + "},'*');}" +
    "new MutationObserver(send).observe(document.documentElement,{childList:true,subtree:true});" +
    "addEventListener('load',send);setTimeout(send,900);setTimeout(send,3000);})();";
  function mount() {
    if(mounted || host.classList.contains("as-ad-unavailable"))return;
    mounted=true;
    frame=document.createElement("iframe");
    frame.title=isRail?"忍者AdMax広告":"Adsterra広告";
    frame.setAttribute("sandbox","allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox");
    frame.setAttribute("referrerpolicy","strict-origin-when-cross-origin");
    frame.setAttribute("scrolling","no");
    frame.width=String(w);
    frame.height=String(h);
    frame.style.cssText="display:block;width:"+w+"px;height:"+h+"px;max-width:100%;border:0;margin:auto;overflow:hidden";
    var html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style></head><body>' +
      '<script>'+watcher+'</'+'script>'+(setup?'<script>'+setup+'</'+'script>':'') +
      '<script src="'+remote+'"></'+'script>'+'</body></html>';
    frame.srcdoc=html;
    area.appendChild(frame);
    setTimeout(function(){if(!settled){window.removeEventListener("message",onMessage);finish(false);}},12000);
  }
  // Ads are delayed until the page is interactive and each slot is near the viewport.
  function begin() {
    var lazy = !host.classList.contains("as-top");
    if(lazy && "IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function(entries){
        if(entries.some(function(e){return e.isIntersecting;})){observer.disconnect();mount();}
      },{rootMargin:"450px"});
      observer.observe(host);
      // Lazy hidden slots cannot intersect. Observe a temporary 1px sentinel instead.
      var marker=document.createElement("span");
      marker.className="as-ad-marker";marker.setAttribute("aria-hidden","true");
      host.parentNode.insertBefore(marker,host);
      observer.unobserve(host);
      observer.observe(marker);
      var oldMount=mount;
      mount=function(){observer.disconnect();marker.remove();oldMount();};
    } else mount();
  }
  var delay = isRail ? 1200 : slot==="leaderboard" ? 300 : 600;
  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",function(){setTimeout(begin,delay);},{once:true});
  } else setTimeout(begin,delay);
}());
