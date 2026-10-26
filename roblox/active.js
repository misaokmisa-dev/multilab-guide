"use strict";
(()=>{
const $=s=>document.querySelector(s);
const escape=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const f=n=>Number.isFinite(Number(n))?Math.round(Number(n)).toLocaleString("ja-JP"):"–";
const imageOkay=src=>{try{let u=new URL(src);return u.protocol==="https:"&&(u.hostname==="tr.rbxcdn.com"||u.hostname.endsWith(".rbxcdn.com"))}catch{return false}};
const pop=$("#rb-popular-view"),act=$("#rb-active-view"),popularBtn=$("#rb-show-popular"),activeBtn=$("#rb-show-active");
function switchTo(mode){
 const active=mode==="active";pop.hidden=active;act.hidden=!active;
 // Show one (not two) ad slots after the shared "game choice" guide for the selected ranking.
 const popularGuideAd=$("#rb-popular-guide-ad"),activeGuideAd=$("#rb-active-guide-ad");
 if(popularGuideAd)popularGuideAd.hidden=active;
 if(activeGuideAd)activeGuideAd.hidden=!active;
 popularBtn.classList.toggle("is-active",!active);activeBtn.classList.toggle("is-active",active);
 popularBtn.setAttribute("aria-pressed",String(!active));activeBtn.setAttribute("aria-pressed",String(active));
 $("#ranking").scrollIntoView({behavior:"smooth",block:"start"});
}
popularBtn.addEventListener("click",()=>switchTo("popular"));
activeBtn.addEventListener("click",()=>switchTo("active"));
const status=$("#rb-active-updated");
let saved=null;
function row(g,rank){
 const icon=imageOkay(g.icon)?'<img loading="lazy" referrerpolicy="no-referrer" src="'+escape(g.icon)+'" alt="">':"🎮";
 const rate=Number.isFinite(g.rating)?"👍 "+Math.round(g.rating)+"%":"公式ランキング掲載";
 return '<article class="rb-active-row"><div class="rb-active-number">'+String(rank).padStart(2,"0")+'</div><div class="rb-active-icon">'+icon+'</div><div><h3 class="rb-active-title">'+escape(g.name||g.officialName)+'</h3><span class="rb-active-sub">'+rate+'</span></div><div class="rb-active-stats"><strong>'+f(g.playing)+'人</strong><small>同時プレイヤー数</small></div><a class="rb-active-visit" target="_blank" rel="nofollow noopener noreferrer" href="https://www.roblox.com/games/'+encodeURIComponent(g.placeId)+'">プレイ ↗</a></article>';
}
const dateStr=s=>{
 const d=new Date(s);
 return Number.isNaN(d.valueOf())?"取得時刻不明":d.toLocaleString("ja-JP",{timeZone:"Asia/Tokyo",month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit"})+" JST";
};
function render(data,live){
 const games=Array.isArray(data?.games)?data.games:[];
 const sorted=games.filter(g=>/^\d+$/.test(String(g.placeId))&&Number.isFinite(g.playing)).sort((a,b)=>b.playing-a.playing).slice(0,30);
 if(sorted.length<30)throw Error("Rankings have fewer than 30 games");
 const byId=new Map((saved?.games||[]).map(g=>[String(g.placeId),g]));
 const merged=sorted.map(g=>{
   const old=byId.get(String(g.placeId))||{};
   return {...old,...g,
     // Keep trusted Japanese titles for known games; never override the latest counts.
     name:old.name||g.name||g.officialName,
     icon:imageOkay(g.icon)?g.icon:(imageOkay(old.icon)?old.icon:null)};
 });
 for(let i=0;i<3;i++)$("#rb-active-"+(i+1)).innerHTML=merged.slice(i*10,i*10+10).map((g,j)=>row(g,i*10+j+1)).join("");
 status.textContent=(live?"最新取得: ":"保存データ: ")+dateStr(data.updatedAt)+(live?"":"（最新情報を確認中…）");
}
async function load(){
 // Display the verified saved ranking immediately, then replace it with official live counts.
 const savedPromise=fetch("/roblox/data/global-active.json",{cache:"no-cache"}).then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()})
    .then(data=>{saved=data;render(data,false);return data}).catch(()=>null);
 const livePromise=fetch("/api/roblox-live",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()})
   .then(data=>{if(data.error)throw Error(data.error);return data}).catch(()=>null);
 const pair=await Promise.all([savedPromise,livePromise]);
 if(pair[1]){
   try{render(pair[1],true);return}catch(_){}
 }
 if(pair[0]){status.textContent="保存データ: "+dateStr(pair[0].updatedAt)+"（公式API取得不可）";return}
 status.textContent="同接データを取得できませんでした";
 $("#rb-active-1").innerHTML='<div class="rb-empty"><b>公式データを読み込めませんでした</b><p>Roblox公式チャートをご確認ください。</p><a href="https://www.roblox.com/ja/charts/top-playing-now" target="_blank" rel="nofollow noopener noreferrer">公式チャートを見る ↗</a></div>';
}
load();
})();