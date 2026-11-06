/* MULTI LAB GUIDE / temporary AdSense content-quality review
 * Replaces previously inline Ninja AdMax script tags so these embeds are
 * not requested, rendered or executed during the review. To restore later,
 * change PAUSED to false and review the policy-compliance of the placements.
 */
(function(){
  "use strict";
  var PAUSED = true;
  if(PAUSED)return;
  var script=document.currentScript;
  var id=script&&script.getAttribute("data-admax-id");
  if(!id || !/^[a-f0-9]{32}$/i.test(id))return;
  document.write('<script src="https://adm.shinobi.jp/s/'+id+'"></'+'script>');
})();
