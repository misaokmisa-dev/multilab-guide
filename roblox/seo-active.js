"use strict";
(()=>{
 const box=document.querySelector("#rb-seo-active-list"),status=document.querySelector("#rb-seo-active-status");
 if(!box||!status)return;
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 // Preserve known Japanese titles and last verified CDN URL by Roblox place ID.
 const snapshot=new Map([...box.querySelectorAll("li.rb-seo-rank-item")].map(li=>{
  const href=li.querySelector("a.rb-active-visit")?.getAttribute("href")||"";
  const id=href.split("/games/")[1]?.split("?")[0];
  const icon=li.querySelector("img.rb-seo-game-icon");
  return [id,{name:li.querySelector("h3")?.textContent||"",universeId:icon?.dataset.universeId||"",fallback:icon?.dataset.fallbackSrc||""}];
 }).filter(row=>row[0]));
 const makeImage=(universeId,fallback,index)=>{
  const validImage=typeof fallback==="string"&&fallback.startsWith("https://tr.rbxcdn.com/");
  const validId=new RegExp("^[0-9]{6,20}$").test(String(universeId||""));
  if(!validImage&&!validId)return '<span class="rb-seo-noicon">🎮</span>';
  const proxy=validId?'/api/roblox-icon?universeId='+encodeURIComponent(universeId):'';
  const source=validImage?fallback:proxy;
  const retry=validImage&&proxy?' data-fallback-src="'+esc(proxy)+'"':'';
  return '<img class="rb-seo-game-icon rb-seo-rank-thumb" src="'+esc(source)+'" data-universe-id="'+esc(universeId||"")+'"'+retry+' loading="'+(index<4?'eager':'lazy')+'" decoding="async" referrerpolicy="no-referrer" alt="">';
 };
 const formatTime=raw=>{
  const dt=new Date(raw);
  return Number.isNaN(dt.getTime())?"時刻不明":dt.toLocaleString("ja-JP",{timeZone:"Asia/Tokyo",year:"numeric",month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit"})+" JST";
 };
 fetch("/api/roblox-live?fresh="+encodeURIComponent(Date.now()+"-"+Math.random().toString(36).slice(2)),{cache:"no-store",headers:{"Cache-Control":"no-cache"}}).then(r=>{
  if(!r.ok)throw Error("Live ranking unavailable");
  return r.json();
 }).then(data=>{
  if(data.error||!Array.isArray(data.games))throw Error("Invalid current ranking");
  const games=data.games.filter(g=>new RegExp("^[0-9]+$").test(String(g.placeId))&&Number.isFinite(g.playing))
    .sort((a,b)=>b.playing-a.playing).slice(0,30);
  if(games.length!==30)throw Error("Not enough live games");
  box.innerHTML=games.map((g,index)=>{
   const id=String(g.placeId),old=snapshot.get(id)||{};
   const title=old.name||g.name||g.officialName||"ROBLOXゲーム";
   const picture=makeImage(g.universeId||old.universeId,g.icon||old.fallback,index);
   return '<li class="rb-seo-rank-item"><span class="rb-seo-rank-num">'+String(index+1).padStart(2,"0")+'</span>'+picture+'<div><h3>'+esc(title)+'</h3><p>現在の同時プレイヤー数：<b>'+Math.round(g.playing).toLocaleString("ja-JP")+'人</b></p></div><a class="rb-active-visit" href="https://www.roblox.com/games/'+encodeURIComponent(id)+'" rel="nofollow noopener noreferrer" target="_blank">プレイ ↗</a></li>';
  }).join("");
  const source=data.countSource==='experience-details'?"公式ゲーム詳細API":data.countSource==='mixed'?"ゲーム詳細 "+data.detailCount+"/"+data.totalCount+"件、ほかはチャート値":"公式チャート値（詳細API取得失敗）";
  status.textContent="同接取得："+formatTime(data.updatedAt)+" / "+source+"。Roblox側の更新周期により前回と同じ人数の場合があります。";
 }).catch(()=>{
  status.textContent="最新データを取得できなかったため、保存時点のランキングを表示しています。人数は現在の同接数ではありません。";
 }).finally(()=>{document.documentElement.classList.remove("rb-seo-await-live")});
})();
