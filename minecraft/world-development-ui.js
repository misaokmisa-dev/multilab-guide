/* World Development UI / on-device activity scoring, score card export */
(()=>{'use strict';
const $=id=>document.getElementById(id),format=n=>Math.round(n).toLocaleString('ja-JP');let file=null,shareText='',lastResult=null;
const MAX_FILE=5*1024*1024;
const levels=[[85000,'伝説級ワールド'],[68000,'大都市級ワールド'],[48000,'発展都市級ワールド'],[28000,'開拓拠点級ワールド'],[0,'開拓スタート']];
const statNames=['建築活動','クラフト','採掘','探索','プレイ'];
const maxValues=[35000,20000,20000,15000,10000];
function total(o){return Object.values(o||{}).reduce((a,n)=>a+(typeof n==='number'&&Number.isFinite(n)&&n>0?n:0),0)}
function normalize(n,target,max){return Math.round(Math.min(max,Math.log1p(Math.max(0,n))/Math.log1p(target)*max))}
function error(s){$('status').textContent=s}
$('wd-copy-path').addEventListener('click',async()=>{
const path=$('wd-saves-path').textContent,btn=$('wd-copy-path');
try{await navigator.clipboard.writeText(path);btn.textContent='コピー済み';setTimeout(()=>{btn.textContent='コピー'},2000)}
catch(e){window.prompt('このパスをコピーして Windows の「ファイル名を指定して実行」に貼り付けてください',path)}
});
let candidates=[];
function pickedFile(item){
  file=item.file;
  const zone=$('pick-world-folder');
  zone.classList.add('is-selected');
  $('stats-filename').textContent=item.world && item.world!=='stats' ? item.world+' を読み込みました' : '統計データを読み込みました';
  $('stats-meta').textContent='統計ファイル：'+item.file.name+' ／ 読み込み完了';
  $('folder-picked-note').textContent='✓ 統計データが見つかりました';
  if(item.world && item.world!=='stats' && item.world!=='players' && !$('world').value.trim())$('world').value=item.world;
  error('');
}
async function selectCandidates(found){
  candidates=found.filter(x=>x.file && x.file.name.toLowerCase().endsWith('.json') && x.file.size<=MAX_FILE);
  candidates.sort((a,b)=>b.file.lastModified-a.file.lastModified);
  if(!candidates.length){
    $('folder-picked-note').textContent='';
    error('統計データが見つかりませんでした。遊んでいるワールドのフォルダを選んでください。');
    $('file-help').open=true;return;
  }
  const box=$('player-select-box'),select=$('player-file-list');
  box.hidden=candidates.length<=1;
  select.replaceChildren();
  candidates.forEach((item,i)=>{
    const opt=document.createElement('option');
    opt.value=String(i);opt.textContent=(item.world||'ワールド')+' / '+item.file.name.slice(0,8)+'…';
    select.append(opt);
  });
  pickedFile(candidates[0]);
  await run();
}
async function tryDirectory(parent,name){
  try{return await parent.getDirectoryHandle(name)}catch(e){if(e.name==='NotFoundError'||e.name==='TypeMismatchError')return null;throw e}
}
async function readStatsFromDirectory(statsDir,world,items){
  if(!statsDir)return;
  let n=0;
  for await(const item of statsDir.values()){
    if(item.kind!=='file'||!item.name.toLowerCase().endsWith('.json'))continue;
    if(++n>250)break;
    try{const selected=await item.getFile();items.push({file:selected,world:world||'ワールド'})}catch(e){}
  }
}
async function scanWorldHandle(root){
  const found=[];
  const candidatesToVisit=[root];
  if(root.name==='.minecraft'){
    const saves=await tryDirectory(root,'saves');
    if(saves)candidatesToVisit.push(saves);
  }
  if(root.name==='saves'||root.name==='.minecraft'){
    const saves=candidatesToVisit[candidatesToVisit.length-1];
    let count=0;
    for await (const item of saves.values()){
      if(item.kind==='directory'&&++count<=100)candidatesToVisit.push(item);
    }
  }
  for(const dir of candidatesToVisit){
    if(dir.name==='stats')await readStatsFromDirectory(dir,'ワールド',found);
    const legacy=await tryDirectory(dir,'stats');
    await readStatsFromDirectory(legacy,dir.name,found);
    const players=await tryDirectory(dir,'players');
    if(players)await readStatsFromDirectory(await tryDirectory(players,'stats'),dir.name,found);
  }
  return found;
}
$('pick-world-folder').addEventListener('click',()=>{
  error('');
  if(typeof window.showDirectoryPicker!=='function'){$('world-folder-fallback').click();return}
  // The picker can remember this site's most recently selected directory;
  // web pages cannot force the dialog to an arbitrary local filesystem path.
  window.showDirectoryPicker({id:'mlg-world-folder',mode:'read'})
    .then(async handle=>{
      $('folder-picked-note').textContent='フォルダ内を確認しています…';
      const items=await scanWorldHandle(handle);
      await selectCandidates(items);
    }).catch(e=>{
      if(e.name==='AbortError'){$('folder-picked-note').textContent='';return}
      error('フォルダを読み取れませんでした。「フォルダ選択が開かない場合」をお試しください。');
    });
});
$('pick-folder-basic').addEventListener('click',()=>{$('world-folder-fallback').click()});
$('world-folder-fallback').addEventListener('change',async e=>{
  const files=Array.from(e.target.files||[]);
  const found=files.filter(x=>/(?:^|\/)(?:players\/stats|stats)\/[^/]+\.json$/i.test(x.webkitRelativePath||'')).map(x=>{
    const parts=x.webkitRelativePath.split('/');
    const statsIndex=parts.lastIndexOf('stats');
    const guess=parts[statsIndex-1]==='players'?parts[statsIndex-2]:parts[statsIndex-1];
    return {file:x,world:guess||'ワールド'};
  });
  await selectCandidates(found);
  e.target.value='';
});
$('pick-json-file').addEventListener('click',()=>{$('stats').click()});
$('stats').addEventListener('change',async e=>{
  const selected=e.target.files[0];if(!selected)return;
  $('player-select-box').hidden=true;
  pickedFile({file:selected,world:$('world').value.trim()});
  await run();
});
$('player-file-list').addEventListener('change',async e=>{
  const selected=candidates[Number(e.target.value)];
  if(selected){pickedFile(selected);await run()}
});
function calculate(data){const stats=data.stats;if(!stats||typeof stats!=='object'||Array.isArray(stats))throw Error('Minecraftの統計ファイルを選んでください。');
const used=stats['minecraft:used']||{},mined=stats['minecraft:mined']||{},crafted=stats['minecraft:crafted']||{},custom=stats['minecraft:custom']||{};
const notBlocks=/(?:pickaxe|axe|shovel|hoe|sword|bow|crossbow|trident|shield|bucket|fishing_rod|shears|flint_and_steel|food|apple|bread|beef|porkchop|chicken|carrot|potato|stew|potion|ender_pearl|spawn_egg|bone_meal|map|compass|clock|firework|elytra|boat|minecart)/;
const placed=Object.entries(used).reduce((n,[k,v])=>n+(!notBlocks.test(k)&&typeof v==='number'&&Number.isFinite(v)&&v>0?v:0),0);
const crafts=total(crafted),minedTotal=total(mined);
const distance=['minecraft:walk_one_cm','minecraft:sprint_one_cm','minecraft:swim_one_cm','minecraft:fly_one_cm','minecraft:aviate_one_cm','minecraft:boat_one_cm','minecraft:minecart_one_cm'].reduce((n,k)=>n+(typeof custom[k]==='number'&&custom[k]>0?custom[k]:0),0)/100000;
const ticks=Number(custom['minecraft:play_time']??custom['minecraft:play_one_minute']??0);
const hours=Math.max(0,ticks/72000);
const points=[normalize(placed,250000,35000),normalize(crafts,150000,20000),normalize(minedTotal,200000,20000),normalize(distance,4000,15000),normalize(hours,1200,10000)];
const score=points.reduce((a,b)=>a+b,0),grade=levels.find(a=>score>=a[0])[1];
return {score,grade,points,placed,distance,hours,world:($('world').value.trim()||'名前のないワールド').slice(0,40),seed:$('seed').value.trim()}}
async function run(){error('');$('result').hidden=true;const current=file||$('stats').files[0];if(!current)return error('統計ファイル（.json）を選択してください。');
if(current.size>MAX_FILE)return error('5MB以下のJSONファイルを選択してください。');
const button=$('calculate');button.disabled=true;button.querySelector('.wd-cta-label').textContent='診断中…';
try{const data=JSON.parse(await current.text());const r=calculate(data);lastResult=r;render(r)}
catch(e){error('読み込めませんでした。'+(e instanceof SyntaxError?'JSON形式を確認してください。':(e.message||'ファイルをご確認ください。')))}
finally{button.disabled=false;button.querySelector('.wd-cta-label').textContent='発展度を診断する'}}
function render(r){
$('result-name').textContent=r.world;$('score').textContent=format(r.score);$('grade').textContent=r.grade;
$('result-note').textContent='ブロック使用 約'+format(r.placed)+'回 · 移動 '+format(r.distance)+'km · プレイ '+format(r.hours)+'時間';
$('meter-fill').style.width=(r.score/100000*100)+'%';
const container=$('metrics');container.replaceChildren();
r.points.forEach((n,i)=>{const c=document.createElement('div');c.className='wd-stat';const b=document.createElement('b');b.textContent=format(n);const t=document.createElement('span');t.textContent=statNames[i];const bar=document.createElement('div');bar.className='wd-stat-track';const fill=document.createElement('div');fill.style.width=(n/maxValues[i]*100)+'%';bar.append(fill);c.append(b,t,bar);container.append(c)});
shareText='🌍 マイクラ ワールド発展度\n「'+r.world+'」\n🏆 '+format(r.score)+' / 100,000 pt\n称号：'+r.grade+'\n\nあなたのワールドは何点？\n#マイクラ #ワールド発展度\nhttps://mlabg.com/minecraft/world-development.html';
$('result').hidden=false;$('result').scrollIntoView({behavior:'smooth',block:'start'});
}
$('calculate').addEventListener('click',run);
$('share').addEventListener('click',()=>{if(shareText){const url='https://twitter.com/intent/tweet?text='+encodeURIComponent(shareText);window.open(url,'_blank','noopener,noreferrer')}});
$('copy').addEventListener('click',async()=>{if(!shareText)return;try{await navigator.clipboard.writeText(shareText);$('copy').textContent='コピーしました';setTimeout(()=>$('copy').textContent='テキストをコピー',2200)}catch(e){$('copy').textContent='コピーに失敗しました'}});
function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
$('save-card').addEventListener('click',()=>{if(!lastResult)return;const r=lastResult;const c=document.createElement('canvas');c.width=1200;c.height=630;const g=c.getContext('2d');if(!g)return;
const bg=g.createLinearGradient(0,0,1200,630);bg.addColorStop(0,'#06170f');bg.addColorStop(.6,'#174a2b');bg.addColorStop(1,'#0a3224');g.fillStyle=bg;g.fillRect(0,0,1200,630);
for(let x=0;x<1200;x+=34){for(let y=0;y<630;y+=34){if((x/34+y/34)%5===0){g.fillStyle='#81ed8e0b';g.fillRect(x,y,30,30)}}}
g.strokeStyle='#63df8577';g.lineWidth=3;roundRect(g,32,32,1136,566,22);g.stroke();
g.fillStyle='#9affab';g.font='900 24px system-ui,sans-serif';g.textAlign='left';g.fillText('MULTI LAB GUIDE   /   WORLD SCORE',80,103);
g.fillStyle='#fff';g.font='900 58px system-ui,sans-serif';g.fillText('ワールド発展度',80,193);
g.font='700 29px system-ui,sans-serif';g.fillStyle='#d8f4de';const worldName=r.world.length>23?r.world.slice(0,23)+'…':r.world;g.fillText(worldName,83,251);
g.textAlign='left';g.fillStyle='#9dff97';g.font='900 112px ui-monospace,monospace';g.fillText(format(r.score),70,395);
g.fillStyle='#e8fce7';g.font='900 22px system-ui,sans-serif';g.fillText('/ 100,000 POINTS',90,436);
g.fillStyle='#cdff9a';roundRect(g,80,465,360,66,13);g.fill();g.fillStyle='#144328';g.font='900 27px system-ui,sans-serif';g.fillText(r.grade,102,508);
g.fillStyle='#bbdbcb';g.font='700 19px system-ui,sans-serif';g.fillText('mlabg.com/minecraft/world-development.html',80,570);
g.textAlign='right';g.fillStyle='#ffffff23';g.font='900 400px system-ui,sans-serif';g.fillText('✦',1140,425);
c.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='minecraft-world-score.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)},'image/png')});
})();
