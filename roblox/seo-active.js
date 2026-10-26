"use strict";
(()=>{const box=document.querySelector("#rb-seo-active-list"),status=document.querySelector("#rb-seo-active-status");if(!box||!status)return;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
fetch("/api/roblox-live",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("API error");return r.json()}).then(data=>{
 if(data.error||!Array.isArray(data.games))throw Error("Missing current ranking");
 const gs=data.games.filter(g=>/^[0-9]+$/.test(String(g.placeId))&&Number.isFinite(g.playing)).sort((a,b)=>b.playing-a.playing).slice(0,30);
 if(gs.length<30)throw Error("Incomplete ranking");
 box.innerHTML=gs.map((g,i)=>'<li class="rb-seo-rank-item"><span class="rb-seo-rank-num">'+String(i+1).padStart(2,"0")+'</span>'+(g.icon&&String(g.icon).startsWith("https://tr.rbxcdn.com/")?'<img loading="lazy" src="'+esc(g.icon)+'" alt="">':'<span class="rb-seo-noicon">🎮</span>')+'<div><h3>'+esc(g.name||g.officialName)+'</h3><p>取得時の同時プレイヤー数：<b>'+g.playing.toLocaleString("ja-JP")+'人</b></p></div><a href="https://www.roblox.com/games/'+encodeURIComponent(g.placeId)+'" class="rb-active-visit" rel="nofollow noopener noreferrer" target="_blank">プレイ ↗</a></li>').join("");
 const d=new Date(data.updatedAt);status.textContent="取得日時："+(Number.isNaN(d.valueOf())?"最新データ":d.toLocaleString("ja-JP",{timeZone:"Asia/Tokyo"}))+"（日本時間）。人数と順位は随時変動します。";
}).catch(()=>{status.textContent+="（現在、新しいデータを取得できないため保存データを表示しています）"});
})();
