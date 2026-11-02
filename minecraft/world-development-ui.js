/* World Development UI / on-device activity scoring, score card export */
(()=>{'use strict';
const $=id=>document.getElementById(id),format=n=>Math.round(n).toLocaleString('ja-JP');let file=null,shareText='',lastResult=null,activeWorldName='名前のないワールド';
const MAX_FILE=5*1024*1024;
const levels=[[90000,'伝説級ワールド'],[72000,'大都市級ワールド'],[50000,'発展都市級ワールド'],[30000,'発展拠点級ワールド'],[12000,'開拓拠点級ワールド'],[0,'開拓初期']];
const statNames=['建築規模','建材の多様さ','設備・装飾','採掘・制作','探索'];
const maxValues=[60000,15000,10000,8000,7000];
function total(o){return Object.values(o||{}).reduce((a,n)=>a+(typeof n==='number'&&Number.isFinite(n)&&n>0?Math.min(n,1e9):0),0)}
function growth(value,scale,max){return Math.round(max*-Math.expm1(-Math.max(0,value)/scale))}
// Stats record use events, not surviving buildings. Distinguish construction
// from time, tool use, mining and crafting; require many placed blocks for high ranks.
const terrainNames=new Set(['dirt','grass_block','coarse_dirt','rooted_dirt','sand','red_sand','gravel','netherrack','soul_sand','soul_soil','clay','mud','moss_block','snow','snow_block','ice','packed_ice','powder_snow','farmland']);
const utilityNames=new Set(['chest','trapped_chest','ender_chest','barrel','furnace','blast_furnace','smoker','crafting_table','enchanting_table','brewing_stand','anvil','chipped_anvil','damaged_anvil','grindstone','smithing_table','cartography_table','fletching_table','stonecutter','loom','lectern','composter','hopper','dropper','dispenser','observer','piston','sticky_piston','redstone','redstone_block','redstone_lamp','redstone_torch','repeater','comparator','target','note_block','jukebox','beacon','conduit','lightning_rod','crafter','scaffolding']);
const detailNames=new Set(['torch','soul_torch','lantern','soul_lantern','sea_lantern','glass','glass_pane','tinted_glass','glowstone','end_rod','flower_pot','decorated_pot','candle','chain','iron_bars','ladder','bookshelf','chiseled_bookshelf','painting','item_frame','glow_item_frame','armor_stand','campfire','soul_campfire','bell']);
const structureNames=new Set(['stone','cobblestone','mossy_cobblestone','smooth_stone','bricks','stone_bricks','mossy_stone_bricks','cracked_stone_bricks','chiseled_stone_bricks','deepslate','cobbled_deepslate','polished_deepslate','sandstone','red_sandstone','smooth_sandstone','smooth_red_sandstone','quartz_block','smooth_quartz','nether_bricks','red_nether_bricks','blackstone','polished_blackstone','basalt','smooth_basalt','polished_basalt','calcite','tuff','polished_tuff','tuff_bricks','obsidian','crying_obsidian','prismarine','prismarine_bricks','dark_prismarine','purpur_block','end_stone_bricks','mud_bricks','terracotta','granite','diorite','andesite','polished_granite','polished_diorite','polished_andesite','dripstone_block','magma_block','bamboo_block']);
function buildType(key){
 if(!key.startsWith('minecraft:'))return null;
 const id=key.slice(10);
 if(terrainNames.has(id))return {weight:.08,detail:false,terrain:true};
 if(utilityNames.has(id)||/(?:_chest|_hopper|_piston|_observer|_dispenser|_dropper|_repeater|_comparator|_redstone_lamp|_furnace|_crafter)$/.test(id))return {weight:1.7,detail:true,terrain:false};
 if(detailNames.has(id)||/(?:_stairs|_slab|_fence|_fence_gate|_wall|_door|_trapdoor|_glass|_glass_pane|_wool|_carpet|_banner|_sign|_hanging_sign|_bed|_torch|_lantern|_candle|_button|_pressure_plate|_leaves|_rail)$/.test(id))return {weight:1.25,detail:true,terrain:false};
 if(structureNames.has(id)||/(?:_planks|_log|_wood|_stem|_hyphae|_bricks|_tiles|_concrete|_terracotta|_sandstone|_quartz|_prismarine|_blackstone|_deepslate|_copper|_basalt|_tuff|_stone|_mud_bricks|_block)$/.test(id))return {weight:1,detail:false,terrain:false};
 return null;
}
function error(s){$('status').textContent=s}
$('wd-copy-path').addEventListener('click',async()=>{
const path=$('wd-saves-path').textContent,btn=$('wd-copy-path');
try{await navigator.clipboard.writeText(path);btn.textContent='コピー済み';setTimeout(()=>{btn.textContent='コピー'},2000)}
catch(e){window.prompt('このパスをコピーして Windows の「ファイル名を指定して実行」に貼り付けてください',path)}
});
let candidates=[];
function pickedFile(item){
  file=item.file;
  activeWorldName=(item.world&&item.world!=='stats'&&item.world!=='players'?item.world:'名前のないワールド').slice(0,40);
  const zone=$('stats-drop');
  zone.classList.add('is-selected');
  $('stats-filename').textContent=item.file.name+' を読み込みました';
  $('stats-meta').textContent=item.world && item.world!=='stats' && item.world!=='名前のないワールド' ? 'ワールド：'+item.world+' ／ 読み込み完了' : 'ファイルを読み込みました';
  $('folder-picked-note').textContent='✓ 統計データを読み込みました。';
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
      error('フォルダを読み取れませんでした。「ファイル一覧から選ぶ（.json）」をご利用ください。');
    });
});
$('pick-folder-basic').addEventListener('click',()=>{$('stats').click()});
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

const dropZone=$('stats-drop');
async function acceptStatsFile(incoming){
  if(!incoming)return;
  if(!/\.json$/i.test(incoming.name)){error('stats フォルダ内の .json ファイルを指定してください。');return}
  if(incoming.size>MAX_FILE){error('5MB以下のワールドファイルを選択してください。');return}
  $('player-select-box').hidden=true;
  pickedFile({file:incoming,world:'名前のないワールド'});
  await run();
}
dropZone.addEventListener('click',()=>{$('stats').click()});
dropZone.addEventListener('keydown',e=>{
  if(e.key==='Enter'||e.key===' '){e.preventDefault();$('stats').click()}
});
for(const type of ['dragenter','dragover']){
  dropZone.addEventListener(type,e=>{
    e.preventDefault();e.stopPropagation();if(e.dataTransfer)e.dataTransfer.dropEffect='copy';
    dropZone.classList.add('is-over');
  });
}
dropZone.addEventListener('dragleave',e=>{
  if(!dropZone.contains(e.relatedTarget))dropZone.classList.remove('is-over');
});
dropZone.addEventListener('drop',async e=>{
  e.preventDefault();e.stopPropagation();dropZone.classList.remove('is-over');
  const incoming=Array.from(e.dataTransfer?.files||[]).find(f=>/\.json$/i.test(f.name))||e.dataTransfer?.files?.[0];
  await acceptStatsFile(incoming);
});
// Dropping from Explorer anywhere on the diagnostic page (outside the region analyzer)
// imports a stats JSON instead of allowing the browser to navigate to the file.
document.addEventListener('dragover',e=>{
  if(e.dataTransfer && Array.from(e.dataTransfer.types||[]).includes('Files'))e.preventDefault();
});
document.addEventListener('drop',async e=>{
  const files=e.dataTransfer?.files;
  if(!files||!files.length)return;
  e.preventDefault();
  if(e.target.closest('#deep-analysis'))return;
  dropZone.classList.remove('is-over');
  const incoming=Array.from(files).find(f=>/\.json$/i.test(f.name))||files[0];
  await acceptStatsFile(incoming);
});

$('stats').addEventListener('change',async e=>{
  const selected=e.target.files[0];if(!selected)return;
  await acceptStatsFile(selected);
  e.target.value='';
});
$('player-file-list').addEventListener('change',async e=>{
  const selected=candidates[Number(e.target.value)];
  if(selected){pickedFile(selected);await run()}
});
function calculate(data){
 const stats=data.stats;
 if(!stats||typeof stats!=='object'||Array.isArray(stats))throw Error('Minecraftのワールドファイル（stats内の.json）を選んでください。');
 const used=stats['minecraft:used']||{},mined=stats['minecraft:mined']||{},crafted=stats['minecraft:crafted']||{},custom=stats['minecraft:custom']||{};
 let placed=0,weighted=0,decor=0,diversity=0;
 for(const [key,value] of Object.entries(used)){
   if(typeof value!=='number'||!Number.isFinite(value)||value<=0)continue;
   const block=buildType(key);if(!block)continue;
   const count=block.terrain?Math.min(value,1600):Math.min(value,100000000);
   weighted+=count*block.weight;
   placed+=count;
   if(!block.terrain&&value>=12)diversity++;
   if(block.detail)decor+=count;
 }
 const crafts=total(crafted),minedTotal=total(mined);
 const movement=['minecraft:walk_one_cm','minecraft:sprint_one_cm','minecraft:swim_one_cm','minecraft:fly_one_cm','minecraft:aviate_one_cm','minecraft:boat_one_cm','minecraft:minecart_one_cm'];
 const distance=movement.reduce((n,k)=>n+(typeof custom[k]==='number'&&custom[k]>0?Math.min(custom[k],1e11):0),0)/100000;
 const ticks=Number(custom['minecraft:play_time']??custom['minecraft:play_one_minute']??0);
 const hours=Math.max(0,Math.min(Number.isFinite(ticks)?ticks:0,1e10)/72000);
 const construction=growth(weighted,180000,60000);
 const variety=Math.round(growth(diversity,70,15000)*Math.min(1,weighted/90000));
 const details=Math.round(growth(decor,8000,10000)*Math.min(1,weighted/22000));
 const resources=growth(crafts,130000,5000)+growth(minedTotal,250000,3000);
 const exploration=growth(distance,8000,4000)+growth(hours,2500,3000);
 const points=[construction,variety,details,resources,exploration];
 const score=Math.min(100000,points.reduce((a,b)=>a+b,0)),grade=levels.find(a=>score>=a[0])[1];
 return {score,grade,points,placed,distance,hours,world:activeWorldName};
}
async function run(){error('');$('result').hidden=true;const current=file||$('stats').files[0];if(!current)return error('ワールドファイルをドロップするか、クリックして選択してください。');
if(current.size>MAX_FILE)return error('5MB以下のJSONファイルを選択してください。');
const button=$('calculate');button.disabled=true;button.querySelector('.wd-cta-label').textContent='診断中…';
try{const data=JSON.parse(await current.text());const r=calculate(data);lastResult=r;render(r)}
catch(e){error('読み込めませんでした。'+(e instanceof SyntaxError?'JSON形式を確認してください。':(e.message||'ファイルをご確認ください。')))}
finally{button.disabled=false;button.querySelector('.wd-cta-label').textContent='発展度を診断する'}}
function render(r){
$('result-name').textContent=r.world;$('score').textContent=format(r.score);$('grade').textContent=r.grade;
$('result-note').textContent='建築関連ブロック使用 約'+format(r.placed)+'回 · プレイ '+format(r.hours)+'時間（建築活動を重視した推定値）';
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
