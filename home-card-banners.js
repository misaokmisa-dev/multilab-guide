/* Share the same official Roblox thumbnail mosaic as the Roblox guide hero.
   Only the existing static stats JSON is fetched; images are decorative. */
(()=>{"use strict";
 const holder=document.querySelector("#mlg-home-roblox-banner");
 if(!holder)return;
 holder.classList.add("is-empty");
 const valid=(url)=>{try{const u=new URL(url);return u.protocol==="https:"&&(u.hostname==="tr.rbxcdn.com"||u.hostname.endsWith(".rbxcdn.com"))}catch{return false}};
 fetch("/roblox/data/state.json",{cache:"force-cache"}).then(r=>{if(!r.ok)throw Error("stats unavailable");return r.json()}).then(data=>{
   const source=Object.entries(data.games||{}).filter(([id,g])=>g&&valid(g.icon)&&Number.isFinite(g.playing)).sort((a,b)=>b[1].playing-a[1].playing).slice(0,8);
   if(!source.length)return;
   const fragment=document.createDocumentFragment();
   for(const [,g] of source){const tile=document.createElement("span"),img=document.createElement("img");tile.className="mlg-game-image";img.src=g.icon;img.alt="";img.loading="lazy";img.decoding="async";img.referrerPolicy="no-referrer";tile.append(img);fragment.append(tile)}
   holder.replaceChildren(fragment);
   holder.classList.remove("is-empty");
 }).catch(()=>{ /* Keep a readable decorative fallback if the public feed is unavailable. */ });
})();
