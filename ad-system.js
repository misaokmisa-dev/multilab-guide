/* ゲーム広告: AdSense自動広告 / 提携ゲームバナー / 任意のミュート動画 */
(() => {
"use strict";
const conf=window.MULTILAB_ADS||{}, main=document.querySelector("main");
if(conf.adsterraEnabled) {
  // Social Bar: one script per page. Native Banner: one container and one script.
  if(!["about.html","privacy.html","sitemap.html"].some(p => location.pathname.endsWith("/"+p))) {
    if(!document.querySelector('[data-mlg-native]')) {
      const aside=document.createElement("aside");
      aside.className="as-slot as-native";
      aside.setAttribute("data-mlg-native","1");
      aside.setAttribute("aria-label","広告");
      const lbl=document.createElement("span");lbl.className="as-slot-label";lbl.textContent="広告";aside.appendChild(lbl);
      const wrap=document.createElement("div");wrap.className="as-ad-content";
      const target=document.createElement("div");target.id="container-573f32537a9358baa2f58056e10eb15f";wrap.appendChild(target);aside.appendChild(wrap);
      main.appendChild(aside);
      const script=document.createElement("script");script.async=true;script.setAttribute("data-cfasync","false");script.src="https://bauval.org/21/573f32537a9358baa2f58056e10eb15f";wrap.insertBefore(script,target);
    }
    if(!document.querySelector('script[data-mlg-social]')) {
      const social=document.createElement("script");social.dataset.mlgSocial="1";social.setAttribute("data-cfasync","false");social.src="https://bauval.org/14/d1c2cf14e4ee52bc288ba370d44bfd6a";document.body.appendChild(social);
    }
  }
  return;
} // Adsterra実広告を優先し、以前のダミー広告は表示しない
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
