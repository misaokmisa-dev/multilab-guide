"use strict";
(()=>{
const $=s=>document.querySelector(s),btn=$("#rb-gacha-open"),modal=$("#rb-gacha-modal");
const storageKey="mlg-roblox-gacha-tokyo-v1";
const jstDay=()=>new Intl.DateTimeFormat("sv-SE",{timeZone:"Asia/Tokyo",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const goodImg=url=>{try{const u=new URL(url);return u.protocol==="https:"&&(u.hostname==="tr.rbxcdn.com"||u.hostname.endsWith(".rbxcdn.com"))}catch{return false}};
const getLast=()=>{try{const v=JSON.parse(localStorage.getItem(storageKey)||"null");return v?.day===jstDay()&&v.id?v:null}catch{return null}};
const save=v=>{try{localStorage.setItem(storageKey,JSON.stringify(v));return true}catch{return false}};
let choices=[],stats={},busy=false,timer=null,audio=null;
function random(n){if(!n)return 0;try{const arr=new Uint32Array(1);crypto.getRandomValues(arr);return Math.floor(arr[0]/4294967296*n)}catch{return Math.floor(Math.random()*n)}}
function tone(f,d=.065,vol=.065){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;if(!audio)audio=new C();if(audio.state==="suspended")audio.resume();const now=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type="sine";o.frequency.setValueAtTime(f,now);g.gain.setValueAtTime(vol,now);g.gain.exponentialRampToValueAtTime(.001,now+d);o.connect(g);g.connect(audio.destination);o.start(now);o.stop(now+d+.01)}catch{}}
function refresh(){btn.textContent=getLast()?"🎁 今日の結果を見る":"🎁 ガチャを引く"}
function open(){modal.hidden=false;modal.setAttribute("aria-hidden","false");document.body.classList.add("rb-modal-open");$(".rb-gacha-close").focus()}
function close(){if(busy)return;modal.hidden=true;modal.setAttribute("aria-hidden","true");document.body.classList.remove("rb-modal-open");btn.focus()}
modal.querySelectorAll("[data-gacha-close]").forEach(el=>el.addEventListener("click",close));
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!modal.hidden){e.preventDefault();close()}});
function reveal(g,revisit){
 busy=false;clearInterval(timer);$("#rb-gacha-machine").classList.remove("spinning");
 $("#rb-gacha-machine").hidden=true;
 $("#rb-gacha-status").textContent=revisit?"本日のガチャ結果":"🎉 あなたの今日のゲームが決定！";
 const stat=stats[g.placeId]||{},img=goodImg(stat.icon)?'<img src="'+esc(stat.icon)+'" alt="" referrerpolicy="no-referrer">':"🎮";
 $("#rb-gacha-result").innerHTML='<div class="rb-gacha-reward">YOUR DAILY DISCOVERY</div><div class="rb-gacha-result-line"><div class="rb-gacha-result-image">'+img+'</div><div><h3>'+esc(g.name)+'</h3><p>'+esc(g.reason||g.short||"")+'</p></div></div><a class="rb-gacha-visit" target="_blank" rel="nofollow noopener noreferrer" href="https://www.roblox.com/games/'+encodeURIComponent(g.placeId)+'">このゲームをプレイする ↗</a>';
 $("#rb-gacha-result").hidden=false;
 if(!revisit){[784,988,1175].forEach((n,i)=>setTimeout(()=>tone(n,.28,.075),i*110))}
 refresh();
}
function play(){
 if(busy||!choices.length)return;
 const prev=getLast();
 if(prev){const old=choices.find(g=>g.placeId===String(prev.id));if(old){open();reveal(old,true);return}}
 let eligible=choices.filter(g=>Number(stats[g.placeId]?.playing)>=800&&goodImg(stats[g.placeId]?.icon));
 if(!eligible.length)eligible=choices;
 const pick=eligible[random(eligible.length)];
 save({day:jstDay(),id:pick.placeId});
 open();busy=true;
 $("#rb-gacha-result").hidden=true;$("#rb-gacha-machine").hidden=false;$("#rb-gacha-machine").classList.add("spinning");
 $("#rb-gacha-status").textContent="ガチャ抽選中……";tone(370,.11,.08);
 let count=0;
 timer=setInterval(()=>{
    let item=eligible[random(eligible.length)];
    $("#rb-gacha-spin-title").textContent=String(item.name).slice(0,19);
    if(count++%2===0)tone(440+((count%12)*42),.065,.029);
    if(count>=24){clearInterval(timer);setTimeout(()=>reveal(pick,false),220)}
 },105);
}
btn.addEventListener("click",play);
Promise.all([
 fetch("/roblox/data/catalog.json",{cache:"no-cache"}).then(r=>r.ok?r.json():null),
 fetch("/roblox/data/state.json",{cache:"no-cache"}).then(r=>r.ok?r.json():null)
]).then(([cat,state])=>{
 choices=(cat?.games||[]).filter(g=>/^\d+$/.test(String(g.placeId))&&g.name);
 stats=state?.games||{};
 const icons=choices.filter(g=>goodImg(stats[g.placeId]?.icon)).sort((a,b)=>(Number(stats[b.placeId]?.playing)||0)-(Number(stats[a.placeId]?.playing)||0)).slice(0,8);
 const hero=$("#rb-hero-bg");
 if(hero)for(const g of icons){const fig=document.createElement("figure"),img=document.createElement("img");img.src=stats[g.placeId].icon;img.alt="";img.loading="eager";img.referrerPolicy="no-referrer";fig.appendChild(img);hero.appendChild(fig)}
 refresh();
}).catch(()=>{btn.textContent="ガチャの準備ができませんでした";btn.disabled=true});
refresh();
})();