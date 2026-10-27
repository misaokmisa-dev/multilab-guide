/* Cookie-free, first-party link engagement: no identity or query strings. */
(() => {
 'use strict';
 if(location.pathname.startsWith('/admin/'))return;
 const API='/api/affiliate-event';
 const monitored=new WeakSet(),seen=new WeakSet();
 const detect=a=>{
   let u;try{u=new URL(a.href,location.href)}catch{return null}
   if(!/^https?:$/.test(u.protocol))return null;
   const host=u.hostname.toLowerCase();
   if(host==='www.amazon.co.jp'||host==='amazon.co.jp'||host.endsWith('.amazon.co.jp'))return 'amazon';
   if(host==='px.a8.net'||host.endsWith('.a8.net'))return 'a8';
   if(a.rel?.includes('sponsored')&&u.origin!==location.origin)return 'other';
   return null;
 };
 const label=a=>{
   let t=(a.getAttribute('aria-label')||a.innerText||a.textContent||'affiliate-link').trim();
   return t.replace(/\s+/g,' ').slice(0,120);
 };
 const send=(event,platform,item)=>{
   try{
    const payload=JSON.stringify({event,platform,path:location.pathname,item});
    if(navigator.sendBeacon){navigator.sendBeacon(API,new Blob([payload],{type:'application/json'}));}
    else fetch(API,{method:'POST',headers:{'content-type':'application/json'},body:payload,keepalive:true}).catch(()=>{});
   }catch(_){}
 };
 send('pageview','site','page');
 const io='IntersectionObserver'in window?new IntersectionObserver(entries=>{
   for(const e of entries)if(e.isIntersecting&&!seen.has(e.target)){
     seen.add(e.target);
     send('impression',detect(e.target)||'other',label(e.target));
     io.unobserve(e.target);
   }
 },{threshold:0.5}):null;
 const add=()=>{
  document.querySelectorAll('a[href]').forEach(a=>{
   if(monitored.has(a))return;
   const platform=detect(a);
   if(!platform)return;
   monitored.add(a);
   if(io)io.observe(a);
   a.addEventListener('click',()=>send('click',platform,label(a)),{capture:true});
  });
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add,{once:true});else add();
 if('MutationObserver'in window){
   const ob=new MutationObserver(()=>{if(document.readyState==='loading')return;add()});
   ob.observe(document.documentElement,{subtree:true,childList:true});
 }
})();

/* Google Analytics 4 pageview measurement. */
(() => {
 'use strict';
 const id='G-XHNKY16YHE';
 if(location.pathname.startsWith('/admin/')||window.__mlgGa4Installed)return;
 window.__mlgGa4Installed=true;
 window.dataLayer=window.dataLayer||[];
 window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};
 window.gtag('js',new Date());
 window.gtag('config',id);
 const s=document.createElement('script');
 s.async=true;
 s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(id);
 document.head.appendChild(s);
})();

/* Load the shared language UI across every public page using this site-wide entrypoint. */
(() => {
 if (location.pathname.startsWith('/admin/')) return;
 const s=document.createElement('script');
 s.src='/site-language.js?v=20261027b';
 s.async=true;
 document.head.appendChild(s);
})();
