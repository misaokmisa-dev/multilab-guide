"use strict";
(()=>{
const $=s=>document.querySelector(s);
const escape=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const f=n=>Number.isFinite(Number(n))?Math.round(Number(n)).toLocaleString("ja-JP"):"–";
const imageOkay=src=>{try{let u=new URL(src);return u.protocol==="https:"&&(u.hostname==="tr.rbxcdn.com"||u.hostname.endsWith(".rbxcdn.com"))}catch{return false}};
const pop=$("#rb-popular-view"),act=$("#rb-active-view"),popularBtn=$("#rb-show-popular"),activeBtn=$("#rb-show-active");
function switchTo(mode){
 const active=mode==="active";pop.hidden=active;act.hidden=!active;
 popularBtn.classList.toggle("is-active",!active);activeBtn.classList.toggle("is-active",active);
 popularBtn.setAttribute("aria-pressed",String(!active));activeBtn.setAttribute("aria-pressed",String(active));
 $("#ranking").scrollIntoView({behavior:"smooth",block:"start"});
}
popularBtn.addEventListener("click",()=>switchTo("popular"));
activeBtn.addEventListener("click",()=>switchTo("active"));
function row(g,rank){
 const icon=imageOkay(g.icon)?'<img loading="lazy" referrerpolicy="no-referrer" src="'+escape(g.icon)+'" alt="">':"🎮";
 const rate=Number.isFinite(g.rating)?"👍 "+Math.round(g.rating)+"%":"公式ランキング掲載";
 return '<article class="rb-active-row"><div class="rb-active-number">'+String(rank).padStart(2,"0")+'</div><div class="rb-active-icon">'+icon+'</div><div><h3 class="rb-active-title">'+escape(g.name||g.officialName)+'</h3><span class="rb-active-sub">'+rate+'</span></div><div class="rb-active-stats"><strong>'+f(g.playing)+'人</strong><small>同時プレイヤー数</small></div><a class="rb-active-visit" target="_blank" rel="nofollow noopener noreferrer" href="https://www.roblox.com/games/'+encodeURIComponent(g.placeId)+'">プレイ ↗</a></article>';
}
fetch("/roblox/data/global-active.json",{cache:"no-cache"}).then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()}).then(data=>{
 if(!Array.isArray(data.games)||data.games.length<30)throw Error("incomplete chart");
 const sorted=data.games.filter(g=>/^\d+$/.test(String(g.placeId))&&Number.isFinite(g.playing)).sort((a,b)=>b.playing-a.playing).slice(0,30);
 if(sorted.length!==30)throw Error("chart has fewer than 30 valid entries");
 for(let i=0;i<3;i++)$("#rb-active-"+(i+1)).innerHTML=sorted.slice(i*10,i*10+10).map((g,j)=>row(g,i*10+j+1)).join("");
 const date=new Date(data.updatedAt),valid=!Number.isNaN(date.valueOf()),hours=(Date.now()-date.getTime())/3600000;
 $("#rb-active-updated").textContent=valid?"取得: "+date.toLocaleString("ja-JP",{timeZone:"Asia/Tokyo",month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"})+" JST"+(hours>6?"（前回成功時点）":""):"取得時刻不明";
}).catch(err=>{
 $("#rb-active-1").innerHTML='<div class="rb-empty"><b>公式データを読み込めませんでした</b><p>現在の順位はRoblox公式チャートをご確認ください。</p><a href="https://www.roblox.com/ja/charts/top-playing-now" target="_blank" rel="nofollow noopener noreferrer">公式チャートを見る ↗</a></div>';
 $("#rb-active-updated").textContent="公開ランキング取得エラー";
});
})();