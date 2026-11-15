const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const code=fs.readFileSync(path.join(__dirname,'../worker/affiliate-analytics.js'),'utf8');
assert.ok(code.includes('export default {'),'Worker export missing');
const context=vm.createContext({
  Request,Response,Headers,URL,URLSearchParams,TextEncoder,
  crypto:require('node:crypto').webcrypto,console
});
vm.runInContext(code.replace('export default {','globalThis.__worker = {'),context,{timeout:3000});
const handler=context.__worker;
assert.equal(typeof handler.fetch,'function');
const env={ASSETS:{fetch:async()=>{throw Error('Redirect should never access excluded template files')}}};
async function test(pathname,expectedStatus,expectedLocation=null){
  const r=await handler.fetch(new Request('https://mlabg.com'+pathname),env,{});
  assert.equal(r.status,expectedStatus,pathname+' HTTP status');
  if(expectedLocation)assert.equal(r.headers.get('location'),expectedLocation,pathname+' destination');
}
(async()=>{
  await test('/minecraft/strategy/items/detail/stone',301,
    'https://mlabg.com/minecraft/strategy/items/view?item=stone');
  await test('/minecraft/strategy/items/detail/stone.html',301,
    'https://mlabg.com/minecraft/strategy/items/view?item=stone');
  await test('/minecraft/strategy/items/detail/diamond_sword',301,
    'https://mlabg.com/minecraft/strategy/items/view?item=diamond_sword');
  await test('/minecraft/strategy/items/detail/new.html?item=diamond_sword',301,
    'https://mlabg.com/minecraft/strategy/items/view?item=diamond_sword');
  await test('/minecraft/strategy/items/detail/not_real_at_all',404);
  await test('/minecraft/strategy/items/detail/..%2F..%2Fadmin',404);
  await test('/api/world-score-submit',405);
  const viewer=fs.readFileSync(path.join(__dirname,'../minecraft/strategy/items/view.html'),'utf8');
  assert.match(viewer,/id="ency-detail"/);
  assert.match(viewer,/data-mode="detail" data-item=""/);
  for(const n of ['items-data.js','items-2026-data.js','recipes-data.js','recipes-2026-data.js','encyclopedia.js'])
    assert.ok(viewer.includes('/minecraft/strategy/items/'+n),n+' needs to load');
  assert.match(viewer,/name="robots" content="noindex,follow"/);
  console.log('AdSense item consolidation: old links, unknown IDs, API and viewer checks passed.');
})().catch(err=>{console.error(err);process.exitCode=1});
