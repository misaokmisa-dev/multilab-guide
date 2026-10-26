"use strict";
(()=>{
 function rescue(img){
  if(!(img instanceof HTMLImageElement)||!img.classList.contains("rb-seo-game-icon"))return;
  const source=img.dataset.fallbackSrc||"";
  if(!img.dataset.fallbackTried&&source.startsWith("https://tr.rbxcdn.com/")){
   img.dataset.fallbackTried="1";img.src=source;return;
  }
  const placeholder=document.createElement("span");
  placeholder.className=img.classList.contains("rb-seo-curation-thumb")?"rb-seo-noicon rb-seo-curation-thumb":"rb-seo-noicon";
  placeholder.textContent="🎮";
  placeholder.setAttribute("aria-hidden","true");
  img.replaceWith(placeholder);
 }
 document.addEventListener("error",e=>{
  if(e.target?.matches?.("img.rb-seo-game-icon"))rescue(e.target);
 },true);
 document.querySelectorAll("img.rb-seo-game-icon").forEach(img=>{
  if(img.complete&&img.naturalWidth===0)rescue(img);
 });
})();
