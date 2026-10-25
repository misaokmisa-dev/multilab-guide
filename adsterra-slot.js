/*
 * MULTI LAB GUIDE / Adsterra banner loader.
 * Must run as a blocking HTML parser script in BODY, not async/defer.
 * Each banner code is used once per page in a visible slot only.
 */
(function () {
  "use strict";
  var current = document.currentScript;
  if (!current || document.readyState !== "loading") return;
  var slot = current.getAttribute("data-slot");
  var width = window.innerWidth || document.documentElement.clientWidth || 0;
  var ranking = document.body.classList.contains("ranking-page");
  var units = {
    banner728: {key:"952e7f7e0a9baebf99dbec214764c5fd",width:728,height:90},
    banner320: {key:"987f4cf689b3091fd9f181d1099c500e",width:320,height:50},
    banner300: {key:"77aace03b06b9767c94a3cf31e62f4bb",width:300,height:250},
    banner468: {key:"3ebde0456afd6f9c7487a079faac22dd",width:468,height:60},
    banner160: {key:"540a8c265d4605827c83102d97ba77dd",width:160,height:600}
  };
  var selected;
  if(slot === "leaderboard") selected = (width < 760 ? units.banner320 : units.banner728);
  else if(slot === "inline") selected = units.banner300;
  else if(slot === "bottom" && width >= 760) selected = units.banner468;
  else if(slot === "rail" && width >= (ranking ? 1900 : 1600)) selected = units.banner160;
  if (!selected) return;
  var adConfig = "atOptions = { 'key' : '" + selected.key + "', 'format' : 'iframe', 'height' : " + selected.height + ", 'width' : " + selected.width + ", 'params' : {} };";
  document.write('<script>' + adConfig + '<\/script><script src="https://bauval.org/22/' + selected.key + '"><\/script>');
}());
