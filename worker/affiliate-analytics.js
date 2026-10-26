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
 async fetch(request,env) {
  const url=new URL(request.url);
  // Preserve paths and queries when permanently moving the old Workers URL.
  if(url.hostname==='multilab-guide.mlguide.workers.dev') {
    url.protocol='https:';
    url.hostname='mlabg.com';
    return Response.redirect(url.toString(),301);
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
