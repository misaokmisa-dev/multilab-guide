"use strict";
/* Homepage featured guide carousel. First slide is displayed without JavaScript. */
(()=>{
const root=document.querySelector("#mlg-home-rotator");if(!root)return;
const slides=[...root.querySelectorAll(".mlg-home-slide")];
const dots=[...root.querySelectorAll(".mlg-home-slide-dot")];
const prev=root.querySelector("#mlg-home-prev"),next=root.querySelector("#mlg-home-next");
let current=0,timer=null,paused=false;
const motion=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??false;
const interval=6500;
function activate(index){
 const target=(index+slides.length)%slides.length;if(target===current)return;
 slides.forEach((slide,i)=>{
  const active=i===target;
  slide.classList.toggle("is-active",active);
  if(active){slide.removeAttribute("aria-hidden");slide.inert=false}
  else{slide.setAttribute("aria-hidden","true");slide.inert=true}
 });
 dots.forEach((dot,i)=>{dot.classList.toggle("is-active",i===target);dot.setAttribute("aria-pressed",String(i===target))});
 current=target;
}
function stop(){if(timer){clearInterval(timer);timer=null}}
function schedule(){stop();if(paused||motion||document.hidden)return;timer=setInterval(()=>activate(current+1),interval)}
function manual(index){activate(index);schedule()}
prev.addEventListener("click",()=>manual(current-1));
next.addEventListener("click",()=>manual(current+1));
dots.forEach((button,i)=>button.addEventListener("click",()=>manual(i)));
root.addEventListener("mouseenter",()=>{paused=true;stop()});
root.addEventListener("mouseleave",()=>{paused=false;schedule()});
root.addEventListener("focusin",()=>{paused=true;stop()});
root.addEventListener("focusout",e=>{if(e.relatedTarget&&root.contains(e.relatedTarget))return;paused=false;schedule()});
document.addEventListener("visibilitychange",schedule);
root.addEventListener("keydown",e=>{if(e.key==="ArrowRight"){e.preventDefault();manual(current+1)}else if(e.key==="ArrowLeft"){e.preventDefault();manual(current-1)}});
schedule();
})();
