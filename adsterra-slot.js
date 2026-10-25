/* Temporary safe mode: external ad scripts disabled to restore reliable page loading.
   Ads remain in HTML and can be reactivated after diagnosing third-party loading. */
(function(){ "use strict"; var e=document.currentScript; if(e){var p=e.closest(".as-slot,.as-rail"); if(p)p.style.display="none";} })();
