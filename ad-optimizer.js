/* MULTI LAB GUIDE: ads stay in their original HTML positions.
   Moving an iframe after ad delivery can blank out a paid creative. */
(() => {
  "use strict";
  function init() {
    document.querySelectorAll(".as-slot,.as-rail").forEach(slot=>{
      const area=slot.querySelector(".as-ad-content");
      if(!area)return;
      const hasCreative=()=>!!area.querySelector("iframe,img,ins,object,embed,video,canvas,a[href],svg") ||
        [...area.children].some(el=>el.tagName!=="SCRIPT" && el.tagName!=="STYLE" &&
          (el.textContent.trim().length>10 || el.children.length>0));
      const update=()=>{
        if(hasCreative()){slot.classList.remove("as-empty");slot.classList.add("as-filled");}
        else {slot.classList.add("as-empty");slot.classList.remove("as-filled");}
      };
      // Do not hide a slot while its external publisher script is still working.
      setTimeout(update,5000);
      const watcher=new MutationObserver(()=>{if(slot.classList.contains("as-empty"))update();});
      watcher.observe(area,{childList:true,subtree:true});
    });
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
