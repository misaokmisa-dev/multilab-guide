/* Remove slots when an ad network produces no DOM creative.
   Cross-origin iframe contents cannot be inspected and must not be falsely marked empty. */
(function(){
 "use strict";
 function init(){
   document.querySelectorAll(".as-slot,.as-rail").forEach(slot=>{
     const host=slot.querySelector(".as-ad-content");if(!host)return;
     let filled=false;
     const hasCreative=()=>[...host.querySelectorAll("iframe,img,object,embed,video,canvas,ins")].some(el=>{
       if(el.tagName==="IFRAME")return true; // Contents not readable cross-origin.
       return true;
     });
     const refresh=()=>{
       if(hasCreative()){
         filled=true;slot.classList.remove("as-empty");slot.classList.add("as-filled");
       }
     };
     const obs=new MutationObserver(refresh);obs.observe(host,{childList:true,subtree:true});
     refresh();
     window.setTimeout(()=>{
       refresh();
       if(!filled)slot.classList.add("as-empty");
       obs.disconnect();
     },6500);
   });
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
 else init();
})();
