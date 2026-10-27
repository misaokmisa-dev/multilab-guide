/*
  MULTI LAB GUIDE: first-party, cookie-free affiliate-event collection.
  Secret MLG_ADMIN_TOKEN is required for private reporting.
  No visitor identifiers, IP addresses or query strings are stored.
*/
const DATASET = 'events.analyticsEngine.mlg_site_events';
const json = (data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
const safe = (s,max=120)=>typeof s==='string'?s.replace(/[^\p{L}\p{N} _./():+-]/gu,'').slice(0,max):'';
async function auth(request,env) {
  const secret=env.MLG_ADMIN_TOKEN;
  const value=(request.headers.get('authorization')||'').replace(/^Bearer /i,'');
  if(!secret||!value)return false;
  const digest=async text=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)));
  const a=await digest(secret),b=await digest(value);
  return a.length===b.length&&a.every((v,i)=>v===b[i]);
}
export default {
 async fetch(request,env,ctx) {
  const url=new URL(request.url);
  // Same-origin, cache-first translations for public page text. No user data is sent.
  if(url.pathname==='/api/site-translate') {
   if(request.method!=='POST')return json({error:'Method not allowed'},405);
   if(request.headers.get('origin')!==url.origin)return json({error:'Forbidden'},403);
   if(Number(request.headers.get('content-length')||0)>7000)return json({error:'Request too large'},413);
   let body;
   try{body=await request.json()}catch{return json({error:'Invalid JSON'},400)}
   const lang=body?.lang;
   const texts=body?.texts;
   if(!['en','ko','zh'].includes(lang)||!Array.isArray(texts)||texts.length<1||texts.length>12
    ||texts.some(t=>typeof t!=='string'||t.length>240||t.length===0)
    ||new TextEncoder().encode(JSON.stringify(body)).length>7000)
    return json({error:'Invalid translation request'},400);
   if(!env.AI)return json({error:'Translation model not available'},503);
   const cache=caches.default;
   const target=lang==='zh'?'zh':lang;
   async function translate(text) {
    // Stable cache keys deduplicate text across pages, countries, and visitors.
    const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));
    const key=Array.from(new Uint8Array(digest)).map(n=>n.toString(16).padStart(2,'0')).join('');
    const cacheRequest=new Request(url.origin+'/__mlg_translations/v1/'+target+'/'+key);
    const cached=await cache.match(cacheRequest);
    if(cached) {
     try{const v=await cached.json();if(typeof v.translation==='string')return v.translation;}catch(_){}
    }
    try{
     const response=await env.AI.run('@cf/meta/m2m100-1.2b',{
      text,source_lang:'ja',target_lang:target
     });
     const translated=typeof response?.translated_text==='string'?response.translated_text.trim():'';
     if(!translated)return null;
     const value=new Response(JSON.stringify({translation:translated}),{
      headers:{'content-type':'application/json','cache-control':'public, max-age=2592000'}
     });
     ctx.waitUntil(cache.put(cacheRequest,value));
     return translated;
    }catch(_){return null}
   }
   const results=new Array(texts.length).fill(null);
   // Small bounded groups prevent a burst of inference requests.
   for(let i=0;i<texts.length;i+=3){
     const translated=await Promise.all(texts.slice(i,i+3).map(translate));
     translated.forEach((value,n)=>results[i+n]=value);
   }
   return json({lang,results});
  }
  if(url.pathname==='/api/roblox-icon') {
   if(request.method!=='GET')return json({error:'Method not allowed'},405);
   const uid=url.searchParams.get('universeId')||'';
   if(!/^[0-9]{6,20}$/.test(uid))return json({error:'Invalid game ID'},400);
   try {
    const params=new URLSearchParams({universeIds:uid,returnPolicy:'PlaceHolder',size:'256x256',format:'Png',isCircular:'false'});
    const res=await fetch('https://thumbnails.roblox.com/v1/games/icons?'+params,{headers:{accept:'application/json'},signal:AbortSignal.timeout(7000)});
    if(!res.ok)throw Error('Roblox thumbnails unavailable');
    const data=await res.json();
    const item=(data.data||[]).find(x=>String(x.targetId)===uid&&x.state==='Completed');
    const icon=item?.imageUrl;
    if(typeof icon!=='string')throw Error('No icon');
    const dest=new URL(icon);
    if(dest.protocol!=='https:'||!(dest.hostname==='tr.rbxcdn.com'||dest.hostname.endsWith('.rbxcdn.com')))throw Error('Invalid thumbnail host');
    // Redirect to the up-to-date official image. Avoid content-type errors when
    // fetching Roblox's binary CDN from a Cloudflare Worker.
    return new Response(null,{status:302,headers:{location:dest.href,'cache-control':'public, max-age=1800','x-content-type-options':'nosniff'}});
   }catch(_){return json({error:'Roblox icon temporarily unavailable'},502)}
  }
  if(url.pathname==='/api/roblox-live') {
   if(request.method!=='GET')return json({error:'Method not allowed'},405);
   // Each page load requests a fresh snapshot of the all-country, all-device
   // Roblox Top Playing Now ranking. No simulated counts, no page-level cache.
   try {
    const params=new URLSearchParams({sessionId:'mlg-live-site',sortId:'top-playing-now',device:'computer',country:'all'});
    const originUrl='https://apis.roblox.com/explore-api/v1/get-sort-content?'+params.toString();
    const upstream=await fetch(originUrl,{headers:{'accept':'application/json'},signal:AbortSignal.timeout(8500),cache:'no-store'});
    if(!upstream.ok)throw Error('Official Roblox chart returned '+upstream.status);
    const data=await upstream.json();
    if(data?.sortId!=='top-playing-now'||!Array.isArray(data.games))throw Error('Invalid official Roblox response');
    const uniq=new Map();
    for(const entry of data.games) {
      if(entry?.isSponsored||!entry?.rootPlaceId||!Number.isInteger(entry?.playerCount)||entry.playerCount<0)continue;
      const id=String(entry.rootPlaceId);
      if(!/^\d{6,20}$/.test(id))continue;
      const up=entry.totalUpVotes,down=entry.totalDownVotes;
      uniq.set(id,{
       placeId:id,universeId:String(entry.universeId||''),name:String(entry.name||'ROBLOXゲーム').slice(0,160),
       officialName:String(entry.name||'').slice(0,160),playing:entry.playerCount,
       rating:Number.isInteger(up)&&Number.isInteger(down)&&up+down>0?Math.round(up/(up+down)*1000)/10:null
      });
    }
    const games=[...uniq.values()].sort((a,b)=>b.playing-a.playing).slice(0,30);
    if(games.length!==30)throw Error('Only '+games.length+' Roblox games available');
    // The discover chart identifies which 30 games are popular, but its
    // playerCount is often a cached chart snapshot. Fetch the actual "playing"
    // value for each selected universe from Roblox's game-details endpoint.
    // A unique query key bypasses intermediary URL caches on every visit.
    const universeIds=games.map(g=>g.universeId).filter(id=>/^[0-9]{6,20}$/.test(id));
    const liveNonce=Date.now().toString(36)+'-'+crypto.randomUUID().slice(0,8);
    const countsPromise=(async()=>{
     try{
      const detailsParams=new URLSearchParams({universeIds:universeIds.join(','),_fresh:liveNonce});
      const response=await fetch('https://games.roblox.com/v1/games?'+detailsParams,{
       headers:{'accept':'application/json','cache-control':'no-cache'},
       signal:AbortSignal.timeout(8500),cache:'no-store'
      });
      if(!response.ok)throw Error('Experience details returned '+response.status);
      const result=await response.json();
      if(!Array.isArray(result.data))throw Error('Invalid experience details');
      const byUniverse=new Map(result.data.filter(g=>g&&Number.isSafeInteger(g.playing)&&g.playing>=0)
       .map(g=>[String(g.id),g.playing]));
      let updatedCount=0;
      for(const game of games){
       const c=byUniverse.get(game.universeId);
       if(c!==undefined){game.playing=c;updatedCount++}
      }
      return updatedCount;
     }catch(_){return 0}
    })();
    // Icons are independent of player counts. Neither path can make up counts.
    const iconsPromise=(async()=>{
     try{
      if(!universeIds.length)return;
      const thumbParams=new URLSearchParams({universeIds:universeIds.join(','),returnPolicy:'PlaceHolder',size:'256x256',format:'Png',isCircular:'false'});
      const response=await fetch('https://thumbnails.roblox.com/v1/games/icons?'+thumbParams,{
       headers:{accept:'application/json'},signal:AbortSignal.timeout(4500)
      });
      if(!response.ok)return;
      const data=await response.json();
      const byUniverse=new Map();
      for(const item of data.data||[]){
       if(item?.state!=='Completed'||typeof item.imageUrl!=='string')continue;
       let parsed;
       try{parsed=new URL(item.imageUrl)}catch{continue}
       if(parsed.protocol==='https:'&&(parsed.hostname==='tr.rbxcdn.com'||parsed.hostname.endsWith('.rbxcdn.com')))
        byUniverse.set(String(item.targetId),parsed.href);
      }
      for(const game of games)if(byUniverse.has(game.universeId))game.icon=byUniverse.get(game.universeId);
     }catch(_){}
    })();
    const [updatedCount]=await Promise.all([countsPromise,iconsPromise]);
    // Order after replacing chart estimates with the freshest available official counts.
    games.sort((a,b)=>b.playing-a.playing);
    const countSource=updatedCount===games.length?'experience-details':updatedCount>0?'mixed':'chart';
    const fetchedAt=new Date().toISOString();
    return json({
     source:'Roblox Top Playing Now — all countries and devices',
     countSource,detailCount:updatedCount,totalCount:games.length,
     updatedAt:fetchedAt,requestedAt:fetchedAt,games
    });
   }catch(e){
    return json({error:'Robloxの最新データを取得できませんでした'},503);
   }
  }
  if(url.pathname==='/api/affiliate-event') {
   if(request.method!=='POST')return json({error:'Method not allowed'},405);
   if(!env.MLG_EVENTS)return json({error:'Tracking is not configured'},503);
   const origin=request.headers.get('origin');
   if(origin&&origin!==url.origin)return json({error:'Forbidden'},403);
   const len=Number(request.headers.get('content-length')||0);
   if(len>1200)return json({error:'Payload too large'},413);
   let data;try{data=await request.json()}catch{return json({error:'Invalid JSON'},400)}
   if(!['pageview','impression','click'].includes(data?.event))return json({error:'Invalid event'},400);
   const platform=['amazon','a8','adsterra','ninja','other','site'].includes(data.platform)?data.platform:'other';
   const path=safe(data.path,180);
   if(!path.startsWith('/')||path.startsWith('/admin/'))return json({error:'Invalid path'},400);
   const item=safe(data.item,140),date=new Date().toISOString().slice(0,10);
   env.MLG_EVENTS.writeDataPoint({blobs:[data.event,platform,path,item,date],doubles:[1],indexes:[platform]});
   return json({ok:true});
  }
  if(url.pathname==='/api/affiliate-summary'){
   if(request.method!=='GET')return json({error:'Method not allowed'},405);
   if(!env.MLG_ADMIN_TOKEN)return json({error:'管理用トークンが未設定です'},503);
   if(!await auth(request,env))return json({error:'認証が必要です'},401);
   if(!env.MLG_SQL)return json({error:'Analytics SQL binding is unavailable'},503);
   const days=[7,30,90].includes(Number(url.searchParams.get('days')))?Number(url.searchParams.get('days')):30;
   try{
    const result=await env.MLG_SQL.query({query:`SELECT blob1 AS event,blob2 AS platform,blob3 AS page,blob4 AS item,blob5 AS day,SUM(_sample_interval) AS hits FROM ${DATASET} WHERE timestamp >= NOW() - INTERVAL '${days}' DAY GROUP BY blob1,blob2,blob3,blob4,blob5 ORDER BY hits DESC LIMIT 5000`});
    return json({source:'Cloudflare Workers Analytics Engine',days,rows:result.data||[],sampled:true,updatedAt:new Date().toISOString()});
   }catch(err){return json({error:'計測データを読み込めませんでした',detail:String(err.message||err).slice(0,180)},503)}
  }
  return env.ASSETS.fetch(request);
 }
};
