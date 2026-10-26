/* Populate both the Roblox guide category card and rotating homepage hero
   with the same verified Roblox experience thumbnails. */
(()=>{"use strict";
 const holders=["#mlg-home-roblox-banner","#mlg-home-roblox-hero-images"].map(s=>document.querySelector(s)).filter(Boolean);
 if(!holders.length)return;
 holders.forEach(holder=>holder.classList.add("is-empty"));
 const valid=url=>{try{const u=new URL(url);return u.protocol==="https:"&&(u.hostname==="tr.rbxcdn.com"||u.hostname.endsWith(".rbxcdn.com"))}catch{return false}};
 fetch("/roblox/data/state.json",{cache:"force-cache"}).then(r=>{if(!r.ok)throw Error("Roblox thumbnails unavailable");return r.json()}).then(data=>{
   const selected=Object.entries(data.games||{}).filter(([,g])=>g&&valid(g.icon)&&Number.isFinite(g.playing)).sort((a,b)=>b[1].playing-a[1].playing).slice(0,8);
   if(!selected.length)return;
   for(const holder of holders){
     const frag=document.createDocumentFragment();
     for(const [,g] of selected){
       const tile=document.createElement("span"),img=document.createElement("img");
       tile.className="mlg-game-image";img.src=g.icon;img.alt="";img.loading=holder.id==="mlg-home-roblox-hero-images"?"eager":"lazy";img.decoding="async";img.referrerPolicy="no-referrer";tile.append(img);frag.append(tile);
     }
     holder.replaceChildren(frag);holder.classList.remove("is-empty");
   }
 }).catch(()=>{/* Decorative fallback remains when the statistics API is offline. */});
})();
