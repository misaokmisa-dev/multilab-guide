/* Collapse ad positions that have no renderable creative. Actual ad delivery
 * is controlled by Ninja AdMax / AdSense. Never display fake creatives. */
(()=>{
 "use strict";
 const selector=".as-slot,.as-rail,.as-fixed-bottom";
 function init(){
  for(const slot of document.querySelectorAll(selector)){
   // Fallback iframes report their own fill status from ad-system.js.
   if(slot.classList.contains("mlg-auto-ninja")||
      slot.hidden||slot.classList.contains("as-square-pending"))continue;
   const area=slot.querySelector(".as-ad-content,.as-fixed-bottom-content");
   if(!area)continue;
   const hasCreative=()=>{
    for(const el of area.querySelectorAll("iframe,img,object,embed,video,canvas,ins,a[href]")){
     if(el.tagName==="INS"&&el.getAttribute("data-ad-status")==="unfilled")continue;
     const rect=el.getBoundingClientRect();
     const style=getComputedStyle(el);
     if(rect.width>=90&&rect.height>=30&&style.display!=="none"&&
        style.visibility!=="hidden")return true;
    }
    return false;
   };
   let hasEverFilled=false;
   const check=()=>{
    if(hasCreative()){
     hasEverFilled=true;slot.classList.remove("as-empty");
    } else if(!hasEverFilled)slot.classList.add("as-empty");
   };
   const observer=new MutationObserver(()=>{if(hasCreative()){hasEverFilled=true;slot.classList.remove("as-empty")}});
   observer.observe(area,{childList:true,subtree:true,attributes:true,attributeFilter:["style","class","width","height","data-ad-status"]});
   // Permit ad network scripts time to fill; then remove genuinely empty
   // rectangles and detached close buttons. Late-filled ads can reappear.
   setTimeout(check,7000);
   setTimeout(check,15000);
  }
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
