/* World Development UI / on-device activity scoring, score card export */
(()=>{'use strict';
const $=id=>document.getElementById(id),format=n=>Math.round(n).toLocaleString('ja-JP');let file=null,shareText='',lastResult=null,activeWorldName='名前のないワールド';
const MAX_FILE=5*1024*1024;
const levels=[[90000,'伝説級ワールド'],[72000,'大都市級ワールド'],[50000,'発展都市級ワールド'],[30000,'発展拠点級ワールド'],[12000,'開拓拠点級ワールド'],[0,'開拓初期']];
const statNames=['建築規模','建材の多様さ','設備・装飾','採掘・制作','探索'];
const maxValues=[60000,15000,10000,8000,7000];
const rarityTiers=[
 {min:90000,key:'red',label:'MYTHIC / 神話級',c:'#ff566a',light:'#ffd6dc',dark:'#430b18'},
 {min:72000,key:'gold',label:'LEGEND / 伝説級',c:'#ffd35b',light:'#fff2bc',dark:'#503410'},
 {min:50000,key:'purple',label:'EPIC / 最高級',c:'#b977ff',light:'#efdbff',dark:'#2d124a'},
 {min:12000,key:'blue',label:'RARE / 希少級',c:'#4dbdff',light:'#c0f0ff',dark:'#103e66'},
 {min:0,key:'green',label:'COMMON / 開拓級',c:'#51e786',light:'#d1ffdc',dark:'#0e4529'}
];
function rarityForScore(score){return rarityTiers.find(t=>score>=t.min)||rarityTiers[rarityTiers.length-1]}
let scoreAnimation=null;
function revealScore(score){
 const node=$('score');
 if(scoreAnimation)cancelAnimationFrame(scoreAnimation);
 if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){node.textContent=format(score);return}
 const duration=1050,begin=performance.now();
 function frame(now){const p=Math.min(1,(now-begin)/duration);node.textContent=format(Math.round(score*(1-Math.pow(1-p,3))));
 if(p<1)scoreAnimation=requestAnimationFrame(frame);else{node.textContent=format(score);scoreAnimation=null}}
 scoreAnimation=requestAnimationFrame(frame);
}
function total(o){return Object.values(o||{}).reduce((a,n)=>a+(typeof n==='number'&&Number.isFinite(n)&&n>0?Math.min(n,1e9):0),0)}
// Stricter, non-inflating scoring: 400 h play should never max out decor.
function extreme(value,scale,max){
 const n=Math.max(0,Number(value)||0);
 return Math.min(max-1,Math.floor(max*n/(n+scale)));
}
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
  window.mlgWorldSetLevelDat?.(item.levelFile||null);
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
    const startIndex=found.length;
    if(dir.name==='stats')await readStatsFromDirectory(dir,'ワールド',found);
    const legacy=await tryDirectory(dir,'stats');
    await readStatsFromDirectory(legacy,dir.name,found);
    const players=await tryDirectory(dir,'players');
    if(players)await readStatsFromDirectory(await tryDirectory(players,'stats'),dir.name,found);
    if(found.length>startIndex){
      try{
        const lv=await (await dir.getFileHandle('level.dat')).getFile();
        for(let i=startIndex;i<found.length;i++)found[i].levelFile=lv;
      }catch(e){}
    }
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
// Windows/Edge/Chrome may otherwise reopen the last directory chosen for an
// unrelated file picker (such as the removed region .mca analyzer).
// A dedicated picker id starts in Documents the first time, then remembers
// the actual stats folder on subsequent uses. Browser permissions prevent
// websites from forcing %appdata%\\.minecraft\\saves on local machines.
let statsPickerDirectory=null;
async function openStatsJsonPicker(){
 error('');
 if(typeof window.showOpenFilePicker!=='function'){
  // Older browsers cannot override the OS file dialog's last-open directory.
  $('stats').value='';$('stats').click();return;
 }
 try{
  const handles=await window.showOpenFilePicker({
   id:'mlg-minecraft-stats-json-2026',
   startIn:statsPickerDirectory||'documents',
   types:[{description:'Minecraftワールド統計 (.json)',accept:{'application/json':['.json']}}],
   excludeAcceptAllOption:true,
   multiple:false
  });
  if(!handles.length)return;
  const incoming=await handles[0].getFile();
  await acceptStatsFile(incoming);
 }catch(e){
  if(e?.name==='AbortError')return;
  // Some Chromium builds do not support the startIn hint; still provide the
  // normal JSON-only picker rather than a folder-only region selector.
  if(e?.name==='TypeError'||e?.name==='NotSupportedError'){
   $('stats').value='';$('stats').click();return;
  }
  error('JSONファイルの選択に失敗しました。もう一度お試しください。');
 }
}
$('pick-folder-basic').addEventListener('click',openStatsJsonPicker);
$('world-folder-fallback').addEventListener('change',async e=>{
  const files=Array.from(e.target.files||[]);
  const found=files.filter(x=>/(?:^|\/)(?:players\/stats|stats)\/[^/]+\.json$/i.test(x.webkitRelativePath||'')).map(x=>{
    const parts=x.webkitRelativePath.split('/');
    const statsIndex=parts.lastIndexOf('stats');
    const worldIndex=parts[statsIndex-1]==='players'?statsIndex-2:statsIndex-1;
    const guess=parts[worldIndex],dirPath=parts.slice(0,worldIndex+1).join('/');
    const levelFile=files.find(f=>f.webkitRelativePath===dirPath+'/level.dat')||null;
    return {file:x,world:guess||'ワールド',levelFile};
  });
  await selectCandidates(found);
  e.target.value='';
});
$('pick-json-file').addEventListener('click',openStatsJsonPicker);

const dropZone=$('stats-drop');
async function acceptStatsFile(incoming){
  if(!incoming)return;
  if(!/\.json$/i.test(incoming.name)){error('stats フォルダ内の .json ファイルを指定してください。');return}
  if(incoming.size>MAX_FILE){error('5MB以下のワールドファイルを選択してください。');return}
  $('player-select-box').hidden=true;
  pickedFile({file:incoming,world:'名前のないワールド'});
  await run();
}
dropZone.addEventListener('click',openStatsJsonPicker);
dropZone.addEventListener('keydown',e=>{
  if(e.key==='Enter'||e.key===' '){e.preventDefault();openStatsJsonPicker()}
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
function resolveWorldLabel(){
 const entered=$('wd-world-display-name')?.value?.trim().replace(/[\x00-\x1f\x7f]/g,'').slice(0,40)||'';
 return entered||activeWorldName;
}
function buildShareText(r){
 return '🌍 マイクラ ワールド発展度\n「'+r.world+'」\n🏆 '+format(r.score)+' / 100,000 pt\n称号：'+r.grade+'\n\nあなたのワールドは何点？\n#マイクラ #ワールド発展度\nhttps://mlabg.com/minecraft/world-development.html';
}
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
 const crafts=total(Object.fromEntries(Object.entries(crafted).filter(([key])=>!['minecraft:air','minecraft:cave_air','minecraft:void_air'].includes(key)))),minedTotal=total(mined);
 const movement=['minecraft:walk_one_cm','minecraft:walked_one_cm','minecraft:sprint_one_cm','minecraft:swim_one_cm','minecraft:walk_under_water_one_cm','minecraft:walk_on_water_one_cm','minecraft:climb_one_cm','minecraft:crouch_one_cm','minecraft:fly_one_cm','minecraft:aviate_one_cm','minecraft:boat_one_cm','minecraft:minecart_one_cm','minecraft:horse_one_cm','minecraft:pig_one_cm','minecraft:strider_one_cm','minecraft:happy_ghast_one_cm','minecraft:nautilus_one_cm'];
 const distance=movement.reduce((n,k)=>n+(typeof custom[k]==='number'&&custom[k]>0?Math.min(custom[k],1e11):0),0)/100000;
 const ticks=Number(custom['minecraft:play_time']??custom['minecraft:play_one_minute']??0);
 const hours=Math.max(0,Math.min(Number.isFinite(ticks)?ticks:0,1e10)/72000);
 const construction=extreme(weighted,700000,60000);
 const variety=Math.floor(extreme(diversity,180,15000)*Math.min(1,weighted/250000));
 const details=Math.floor(extreme(decor,220000,10000)*Math.min(1,weighted/300000));
 const resources=extreme(crafts,550000,5000)+extreme(minedTotal,2500000,3000);
 const exploration=extreme(distance,5000,4000)+extreme(hours,3200,3000);
 const points=[construction,variety,details,resources,exploration];
 const score=Math.min(100000,points.reduce((a,b)=>a+b,0)),grade=levels.find(a=>score>=a[0])[1];
 return {score,grade,points,placed,distance,hours,world:resolveWorldLabel()};
}
async function run(){error('');$('result').hidden=true;const current=file||$('stats').files[0];if(!current)return error('ワールドファイルをドロップするか、クリックして選択してください。');
if(current.size>MAX_FILE)return error('5MB以下のJSONファイルを選択してください。');
const button=$('calculate');button.disabled=true;button.querySelector('.wd-cta-label').textContent='診断中…';
try{const data=JSON.parse(await current.text());const r=calculate(data);lastResult=r;render(r);window.mlgWorldStatsShow?.(data,r);void submitAnonymizedScore(r,current)}
catch(e){error('読み込めませんでした。'+(e instanceof SyntaxError?'JSON形式を確認してください。':(e.message||'ファイルをご確認ください。')))}
finally{button.disabled=false;button.querySelector('.wd-cta-label').textContent='発展度を診断する'}}
function render(r){
const tier=rarityForScore(r.score),panel=$('result'),scoreCard=$('score-card');
for(const t of rarityTiers){panel.classList.remove('wd-rarity-'+t.key);scoreCard.classList.remove('wd-rarity-'+t.key)}
panel.classList.add('wd-rarity-'+tier.key);scoreCard.classList.add('wd-rarity-'+tier.key);
$('wd-rarity-eyebrow').textContent='✦ '+tier.label+' ✦';
$('result-name').textContent=r.world;revealScore(r.score);
$('grade').textContent=r.grade;$('grade').setAttribute('aria-label',tier.label+' '+r.grade);
$('result-note').textContent='建築関連ブロック使用 約'+format(r.placed)+'回 · プレイ '+format(r.hours)+'時間（建築活動を重視した推定値）';
$('meter-fill').style.width=(r.score/100000*100)+'%';
const container=$('metrics');container.replaceChildren();
r.points.forEach((n,i)=>{
  const full=maxValues[i],pct=full?Math.round(n/full*100):0,c=document.createElement('div');
  const partTier=pct>=80?'red':pct>=60?'gold':pct>=40?'purple':pct>=20?'blue':'green';
  c.className='wd-stat wd-stat-tier-'+partTier;
  c.setAttribute('aria-label',statNames[i]+': '+format(n)+' pt / '+format(full)+' pt 満点（達成率 '+pct+'%）');
  const header=document.createElement('div');header.className='wd-stat-header';
  const title=document.createElement('span');title.className='wd-stat-label';title.textContent=statNames[i];
  const percent=document.createElement('span');percent.className='wd-stat-pct';percent.textContent=pct+'%';
  header.append(title,percent);
  const amount=document.createElement('div');amount.className='wd-stat-amount';
  const earned=document.createElement('b');earned.textContent=format(n)+' pt';
  const total=document.createElement('span');total.textContent='/ '+format(full)+' pt 満点';
  amount.append(earned,total);
  const bar=document.createElement('div');bar.className='wd-stat-track';bar.setAttribute('aria-hidden','true');
  const fill=document.createElement('div');fill.style.width=Math.min(100,n/full*100)+'%';bar.append(fill);
  c.append(header,amount,bar);container.append(c);
});
shareText=buildShareText(r);
$('result').hidden=false;$('result').scrollIntoView({behavior:'smooth',block:'start'});
}
$('wd-world-display-name').addEventListener('input',()=>{
 if(!lastResult)return;
 lastResult.world=resolveWorldLabel();
 $('result-name').textContent=lastResult.world;
 shareText=buildShareText(lastResult);
});
$('calculate').addEventListener('click',run);
$('share').addEventListener('click',()=>{if(shareText){const url='https://twitter.com/intent/tweet?text='+encodeURIComponent(shareText);window.open(url,'_blank','noopener,noreferrer')}});
$('copy').addEventListener('click',async()=>{if(!shareText)return;try{await navigator.clipboard.writeText(shareText);$('copy').textContent='コピーしました';setTimeout(()=>$('copy').textContent='テキストをコピー',2200)}catch(e){$('copy').textContent='コピーに失敗しました'}});
function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
$('save-card').addEventListener('click',()=>{if(!lastResult)return;const r=lastResult;const c=document.createElement('canvas');c.width=1200;c.height=630;const g=c.getContext('2d');if(!g)return;
const tier=rarityForScore(r.score);const bg=g.createLinearGradient(0,0,1200,630);bg.addColorStop(0,tier.dark);bg.addColorStop(.6,'#101724');bg.addColorStop(1,tier.dark);g.fillStyle=bg;g.fillRect(0,0,1200,630);
for(let x=0;x<1200;x+=34){for(let y=0;y<630;y+=34){if((x/34+y/34)%5===0){g.fillStyle='#81ed8e0b';g.fillRect(x,y,30,30)}}}
g.strokeStyle=tier.c;g.lineWidth=3;roundRect(g,32,32,1136,566,22);g.stroke();
g.fillStyle=tier.light;g.font='900 24px system-ui,sans-serif';g.textAlign='left';g.fillText('MULTI LAB GUIDE   /   WORLD SCORE',80,103);
g.fillStyle='#fff';g.font='900 58px system-ui,sans-serif';g.fillText('ワールド発展度',80,193);
g.font='700 29px system-ui,sans-serif';g.fillStyle='#d8f4de';const worldName=r.world.length>23?r.world.slice(0,23)+'…':r.world;g.fillText(worldName,83,251);
g.textAlign='left';g.fillStyle=tier.c;g.font='900 105px ui-monospace,monospace';g.fillText(format(r.score)+' pt',70,395);
g.fillStyle='#e8fce7';g.font='900 22px system-ui,sans-serif';g.fillText('/ 100,000 pt',90,436);
g.fillStyle=tier.c;roundRect(g,80,465,360,66,13);g.fill();g.fillStyle=tier.dark;g.font='900 27px system-ui,sans-serif';g.fillText(r.grade,102,508);
g.fillStyle='#bbdbcb';g.font='700 19px system-ui,sans-serif';g.fillText('mlabg.com/minecraft/world-development.html',80,570);
g.textAlign='right';g.fillStyle='#ffffff23';g.font='900 400px system-ui,sans-serif';g.fillText('✦',1140,425);
c.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='minecraft-world-score.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)},'image/png')});
// Submit only score summaries. File paths, raw JSON and world names are never sent.
const submittedInPage=new Set();
async function submitAnonymizedScore(r,statsFile){
 const signature=[statsFile.name,statsFile.size,statsFile.lastModified,r.score].join(':');
 if(submittedInPage.has(signature))return;
 submittedInPage.add(signature);
 const payload={version:'wd-score-v3',score:r.score,grade:r.grade,
  points:r.points.map(Math.round),placed:Math.round(r.placed),
  hours:Math.round(r.hours*100)/100,distance:Math.round(r.distance*100)/100};
 try{
  const res=await fetch('/api/world-score-submit',{method:'POST',
   headers:{'content-type':'application/json'},credentials:'same-origin',
   cache:'no-store',body:JSON.stringify(payload)});
  if(!res.ok)submittedInPage.delete(signature);
 }catch(_){submittedInPage.delete(signature)}
}
})();