/* Ninja AdMax: load only the interstitial unit for the visitor's device.
 * Run synchronously in the HTML parser (no async/defer) so network tags
 * using document.write continue to work.
 * Desktop keeps the existing interstitial, smartphones use the new unit.
 */
(function () {
  "use strict";
  var mobile = /iPhone|iPod|Android.*Mobile/i.test(navigator.userAgent) ||
    window.matchMedia("(max-width: 767px)").matches;
  // Informational pages did not have desktop interstitials; preserve that.
  if (!mobile && document.currentScript && document.currentScript.hasAttribute("data-mobile-only")) return;
  var id = mobile
    ? "a595e84745adccf7c8ce717de97c8e61"
    : "228ec958f7c303d14a8f6f77ca9990c8";
  document.write('<script src="https://adm.shinobi.jp/s/' + id + '"></' + 'script>');
})();
