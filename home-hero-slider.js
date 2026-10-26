"use strict";
/* Accessible featured guides with fast crossfade and tactile touch-scrub preview.
   The page stays navigable with JS off (first slide visible). */
(()=>{
 const root=document.querySelector("#mlg-home-rotator");if(!root)return;
 const viewport=root.querySelector(".mlg-home-slide-viewport");
 const slides=[...root.querySelectorAll(".mlg-home-slide")];
 const steps=[...root.querySelectorAll(".mlg-home-slide-step")];
 const prev=root.querySelector("#mlg-home-prev"),next=root.querySelector("#mlg-home-next");
 const count=root.querySelector("#mlg-home-slide-current");
 if(slides.length<2||steps.length!==slides.length||!viewport)return;
 const duration=4300;
 const reduced=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??false;
 root.style.setProperty("--mlg-cycle",duration+"ms");
 let index=0,clock=null,hover=false,focused=false,gesture=null,settling=false,cleanup=null,suppressClickUntil=0;
 const total=slides.length;
 const norm=n=>(n%total+total)%total;
 function clearTimer(){if(clock!==null){clearInterval(clock);clock=null}}
 function isPaused(){return hover||focused||gesture!==null||settling||document.hidden||reduced}
 function updateProgress(){
  const paused=isPaused();
  root.classList.toggle("is-playing",!paused);
  root.classList.toggle("is-paused",paused);
 }
 function restart(){
  clearTimer();
  updateProgress();
  if(isPaused())return;
  clock=setInterval(()=>activate(index+1),duration);
 }
 function switchLabels(nextIndex){
  steps.forEach((b,i)=>{const active=i===nextIndex;b.classList.toggle("is-active",active);b.setAttribute("aria-pressed",String(active))});
  if(count)count.textContent=String(nextIndex+1).padStart(2,"0");
 }
 function setActive(nextIndex){
  index=norm(nextIndex);
  slides.forEach((slide,i)=>{
   const active=i===index;
   slide.classList.toggle("is-active",active);
   if(active){slide.removeAttribute("aria-hidden");slide.inert=false}
   else{slide.setAttribute("aria-hidden","true");slide.inert=true}
  });
  switchLabels(index);
 }
 function resetProgress(){
  // Restart the subtle line timeline after manual navigation.
  const activeStep=steps[index];
  if(activeStep){
   activeStep.classList.remove("is-active");void activeStep.offsetWidth;
   activeStep.classList.add("is-active");
  }
 }
 function activate(nextIndex){
  if(settling)return;
  if(cleanup){clearTimeout(cleanup);cleanup=null}
  slides.forEach(s=>{s.classList.remove("is-swipe-target","is-swipe-out");s.style.opacity=""});
  setActive(nextIndex);
  resetProgress();
  restart();
 }
 function manual(nextIndex){activate(nextIndex)}
 prev?.addEventListener("click",()=>manual(index-1));
 next?.addEventListener("click",()=>manual(index+1));
 steps.forEach((b,i)=>b.addEventListener("click",()=>manual(i)));
 function discardSwipe(){
  slides.forEach(slide=>{slide.classList.remove("is-swipe-target","is-swipe-out");slide.style.opacity=""});
 }
 function settle(commit,target,outgoing){
  settling=true;
  if(commit){
   setActive(target);
   outgoing.classList.add("is-swipe-out");
   slides[index].classList.add("is-swipe-target");
   suppressClickUntil=Date.now()+550;
   requestAnimationFrame(()=>{
    slides[index].style.opacity="1";
    outgoing.style.opacity="0";
   });
  }else{
   requestAnimationFrame(()=>{outgoing.style.opacity="1";slides[target].style.opacity="0"});
  }
  cleanup=setTimeout(()=>{
   discardSwipe();settling=false;cleanup=null;resetProgress();restart();
  },reduced?40:360);
 }
 viewport.addEventListener("pointerdown",e=>{
  if(settling||gesture||(e.pointerType!=="touch"&&e.pointerType!=="pen"))return;
  gesture={id:e.pointerId,x:e.clientX,y:e.clientY,started:performance.now(),direction:0,target:-1,moving:false,dx:0};
  clearTimer();updateProgress();
 });
 viewport.addEventListener("pointermove",e=>{
  const g=gesture;if(!g||e.pointerId!==g.id)return;
  const dx=e.clientX-g.x,dy=e.clientY-g.y;
  if(!g.moving){
   if(Math.abs(dy)>11&&Math.abs(dy)>Math.abs(dx)*1.15){gesture=null;restart();return}
   if(Math.abs(dx)<9||Math.abs(dx)<Math.abs(dy)*1.2)return;
   g.moving=true;
  }
  g.dx=dx;
  const direction=dx<0?1:-1;
  const target=norm(index+direction);
  if(g.target!==target){
   slides.forEach(s=>{s.classList.remove("is-swipe-target");if(s!==slides[index])s.style.opacity=""});
   g.target=target;g.direction=direction;
   slides[target].classList.add("is-swipe-target");
  }
  const fraction=Math.min(.96,Math.abs(dx)/Math.max(1,viewport.clientWidth)*1.22);
  slides[index].style.opacity=String(1-.91*fraction);
  slides[target].style.opacity=String(fraction);
 });
 function finish(e,cancelled=false){
  const g=gesture;if(!g||e.pointerId!==g.id)return;
  gesture=null;
  if(!g.moving||g.target<0){discardSwipe();restart();return}
  const distance=Math.abs(g.dx);
  const speed=distance/Math.max(1,performance.now()-g.started);
  const shouldCommit=!cancelled&&(distance>Math.min(60,viewport.clientWidth*.19)||speed>.55&&distance>23);
  const target=g.target;
  settle(shouldCommit,target,slides[index]);
 }
 viewport.addEventListener("pointerup",e=>finish(e));
 viewport.addEventListener("pointercancel",e=>finish(e,true));
 // Avoid inadvertently following a CTA if a swipe started on the link.
 viewport.addEventListener("click",e=>{
  if(Date.now()<suppressClickUntil){e.preventDefault();e.stopPropagation()}
 },true);
 root.addEventListener("mouseenter",()=>{hover=true;clearTimer();updateProgress()});
 root.addEventListener("mouseleave",()=>{hover=false;restart()});
 root.addEventListener("focusin",()=>{focused=true;clearTimer();updateProgress()});
 root.addEventListener("focusout",e=>{if(e.relatedTarget&&root.contains(e.relatedTarget))return;focused=false;restart()});
 document.addEventListener("visibilitychange",restart);
 root.addEventListener("keydown",e=>{
  if(e.key==="ArrowRight"){e.preventDefault();manual(index+1)}
  if(e.key==="ArrowLeft"){e.preventDefault();manual(index-1)}
 });
 window.addEventListener("pagehide",clearTimer);
 switchLabels(0);
 restart();
})();
