"use strict";
(()=>{const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const state={tab:"week",genre:"all",party:"all",time:"all",query:"",limit:20, catalog:[],feed:null,bookmarks:new Set(),randomPick:null};
const COLORS=["sky","pink","blue","violet","forest","red","yellow","dark","orange"];
const safeString=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=n=>Number.isFinite(Number(n))?new Intl.NumberFormat("ja-JP",{notation:"compact",maximumFractionDigits:1}).format(Number(n)):"–";
const roUrl=id=>"https://www.roblox.com/games/"+encodeURIComponent(id);
const last=()=>state.feed?.games||{};
const hist=()=>state.feed?.rankings||{};
function metric(g){return last()[g.placeId]||{}}
function validImg(url){try{return /^https:$/i.test(new URL(url).protocol)&&(/\.rbxcdn\.com$/.test(new URL(url).hostname)||new URL(url).hostname==="tr.rbxcdn.com")}catch{return false}}
function modes(){let h=hist();let measured={week:!!h.week?.ready,month:!!h.month?.ready,rising:!!h.rising?.ready};return measured}
function ordering(g){
 const mode=state.tab, observed=hist()[mode], ranks=observed?.ranks||[];
 const playing=Number(metric(g).playing)||0;
 if(observed?.ready){
   const pos=ranks.findIndex(x=>String(x.id)===g.placeId);
   return pos>=0?pos:100000-playing/1000000;
 }
 if(Number.isFinite(Number(g[mode])))return Number(g[mode]);
 // Newly discovered games are sorted by verified current players, not imaginary week/month ranks.
 return 1000-Math.log10(1+playing)*10+(Number(g.discoveryRank)||999)/100000;
}
// A game can suit both a 15-minute visit and a longer session.
// The visible duration filter is an editorial play-style guide, not a fixed game time limit.
function durationFit(g, mode){
 if(mode==="all")return true;
 if(mode==="short"&&Number(g.minutes)<=15)return true;
 if(mode==="long"&&Number(g.minutes)>=25)return true;
 // Versatile well-established games may support both quick and long sessions.
 return Number.isFinite(Number(g.discoveryRank))&&Number(g.discoveryRank)<=100;
}
function applyFilters(g){
 const q=state.query.trim().toLocaleLowerCase();
 const genres=[g.genre,...(Array.isArray(g.genres)?g.genres:[])];
 return(state.genre==="all"||genres.includes(state.genre))
    &&(state.party==="all"||(state.party==="friends"?g.with!=="solo":g.with!=="friends"))
    && durationFit(g,state.time)
    &&(!q||[g.name,g.genre,g.short,g.reason,g.originalName||"",...(g.tags||[])].join(" ").toLocaleLowerCase().includes(q));
}
function render(){
 const measured=modes();
 const chosen=state.catalog.filter(applyFilters).sort((a,b)=>ordering(a)-ordering(b));
 $("#rb-count").textContent=Math.min(20,chosen.length)+"件表示 / "+chosen.length+"候補";
 const first=chosen.slice(0,10),second=chosen.slice(10,20);
 $("#rb-empty").hidden=chosen.length!==0;
 $("#rb-more-btn").hidden=true;
 $("#rb-popular-mid-ads").hidden=chosen.length<=10;
 $("#rb-popular-after20").hidden=chosen.length===0;
 $("#rb-grid").innerHTML=first.map((g,i)=>card(g,i+1,measured)).join("");
 $("#rb-grid-more").innerHTML=second.map((g,i)=>card(g,i+11,measured)).join("");
 $$(".rb-cover img").forEach(img=>img.addEventListener("error",()=>{img.remove()}, {once:true}));
 $$(".rb-save").forEach(b=>b.addEventListener("click",()=>{const id=b.dataset.save;if(state.bookmarks.has(id))state.bookmarks.delete(id);else state.bookmarks.add(id);try{localStorage.setItem("mlg-roblox-bookmarks",JSON.stringify([...state.bookmarks]))}catch{}render()}));
}
function card(g,rank,measured){const m=metric(g), url=validImg(m.icon)?m.icon:"", fav=state.bookmarks.has(g.placeId), observed=hist()[state.tab], stat=observed?.ready?(observed.ranks||[]).find(x=>String(x.id)===g.placeId):null;
 let extra=stat?(state.tab==="rising"?"↗ "+(stat.value>=0?"+":"")+Math.round(stat.value)+"%":"平均 "+fmt(stat.value)+"人"):"";
 return `<article class="rb-game"><div class="rb-cover tone-${safeString(COLORS.includes(g.tone)?g.tone:"blue")}"><span class="rb-emoji" aria-hidden="true">${safeString(g.icon)}</span>${url?`<img src="${safeString(url)}" alt="${safeString(g.name)} の公式ゲームアイコン" loading="lazy" referrerpolicy="no-referrer">`:""}<span class="rb-number ${rank<=3?"top3":""}">#${String(rank).padStart(2,"0")}</span></div>
 <div class="rb-card-body"><div class="rb-card-top"><span class="rb-tag">${safeString(g.genre)}</span><button type="button" class="rb-save ${fav?"saved":""}" data-save="${safeString(g.placeId)}" aria-label="${fav?"お気に入りから削除":"お気に入りに追加"}" title="お気に入り">${fav?"♥":"♡"}</button></div>
 <h3>${safeString(g.name)}</h3><p class="rb-desc">${safeString(g.short)}</p>
 <div class="rb-stats"><span>⏱ ${g.minutes}分〜</span><span>${safeString(g.difficulty)}</span>${Number.isFinite(m.playing)?`<span>👥 ${fmt(m.playing)}人</span>`:""}${Number.isFinite(m.rating)?`<span>👍 ${Math.round(m.rating)}%</span>`:""}${extra?`<span class="rb-hot">${safeString(extra)}</span>`:""}</div>
 <div class="rb-card-bottom"><small>${safeString(g.tags.slice(0,2).join(" / "))}</small><a class="rb-play" href="${roUrl(g.placeId)}" target="_blank" rel="nofollow noopener noreferrer">ゲームを開く ↗</a></div></div></article>`}
function initControls(){
 try{const arr=JSON.parse(localStorage.getItem("mlg-roblox-bookmarks")||"[]");if(Array.isArray(arr))state.bookmarks=new Set(arr.map(String))}catch{}
 $("#rb-genre").innerHTML='<option value="all">すべてのジャンル</option>'+[...new Set(state.catalog.map(x=>x.genre))].sort().map(v=>`<option value="${safeString(v)}">${safeString(v)}</option>`).join("");
 $$(".rb-tab").forEach(b=>b.addEventListener("click",()=>{state.tab=b.dataset.tab;state.limit=20;$$(".rb-tab").forEach(x=>{x.classList.toggle("is-active",x===b);x.setAttribute("aria-selected",String(x===b))});render()}));
 $("#rb-search").addEventListener("input",e=>{state.query=e.target.value;state.limit=20;render()});
 [["#rb-genre","genre"],["#rb-party","party"],["#rb-time","time"]].forEach(([s,k])=>$(s).addEventListener("change",e=>{state[k]=e.target.value;state.limit=20;render()}));
 $("#rb-reset").addEventListener("click",reset);
 $("#rb-empty-reset").addEventListener("click",reset);
 $("#rb-more-btn").addEventListener("click",()=>{state.limit+=10;render()});
 $$(".rb-suggestion").forEach(b=>b.addEventListener("click",()=>{if($("#rb-popular-view")?.hidden)$("#rb-show-popular")?.click();reset();let pick=b.dataset.pick;if(pick==="friends"){state.party="friends";$("#rb-party").value="friends"}else{state.time=pick;$("#rb-time").value=pick}render();$("#ranking").scrollIntoView({behavior:"smooth",block:"start"})}));

}
function reset(){state.query="";state.genre="all";state.party="all";state.time="all";state.limit=20;$("#rb-search").value="";$("#rb-genre").value="all";$("#rb-party").value="all";$("#rb-time").value="all";render()}
Promise.all([
 fetch("/roblox/data/catalog.json",{cache:"no-cache"}).then(r=>{if(!r.ok)throw new Error("catalog "+r.status);return r.json()}),
 fetch("/roblox/data/state.json",{cache:"no-cache"}).then(r=>r.ok?r.json():null).catch(()=>null)
]).then(([catalog,feed])=>{state.catalog=(catalog.games||[]).filter(x=>/^\d+$/.test(String(x.placeId))&&x.name);state.feed=feed;initControls();const updated=feed?.updatedAt?new Date(feed.updatedAt):null;$("#freshness").textContent=updated&&!Number.isNaN(updated.valueOf())?"公開統計: "+updated.toLocaleDateString("ja-JP",{timeZone:"Asia/Tokyo"})+" 更新":"編集部選定: "+catalog.date+" 更新";render()}).catch(()=>{$("#freshness").textContent="データを読み込めませんでした";$("#rb-grid").innerHTML='<p class="rb-loading">ランキングを取得できませんでした。ページを再読み込みしてください。</p>'});
})();
