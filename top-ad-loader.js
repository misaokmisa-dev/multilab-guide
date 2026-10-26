/* Choose the appropriate Ninja AdMax top banner before it loads.
 * Keep synchronous parsing for ad scripts that call document.write.
 * The mobile creative is enlarged by ad-system.js when space permits.
 */
(function () {
  "use strict";
  var mobile = /iPhone|iPod|Android.*Mobile/i.test(navigator.userAgent) ||
    window.matchMedia("(max-width: 767px)").matches;
  var adId = mobile
    ? "8339ab59e40bba89fe75bf3969b23ef7"
    : "878b3c1886fe42359fb3b2718a3f1cb2";
  document.write('<script src="https://adm.shinobi.jp/s/' + adId + '"></' + 'script>');
})();
