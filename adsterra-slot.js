/*
 * MULTI LAB GUIDE Ninja AdMax loader.
 * Previous Adsterra network removed: no popunder, social-bar, bauval or iframe calls.
 * The single user-provided Ninja AdMax unit is loaded ONCE at the primary top slot.
 * Other former Adsterra slots are intentionally closed instead of duplicating a unit.
 */
(function () {
  "use strict";
  var current=document.currentScript;
  if(!current || document.readyState!=="loading") return;
  var slot=current.getAttribute("data-slot");
  if(slot!=="leaderboard") {
    var container=current.closest("aside.as-slot");
    if(container)container.style.display="none";
    return;
  }
  if(document.querySelector("script[data-mlg-ninja-primary]"))return;
  document.write('<script data-mlg-ninja-primary="1" src="https://adm.shinobi.jp/s/878b3c1886fe42359fb3b2718a3f1cb2"><\/script>');
})();
