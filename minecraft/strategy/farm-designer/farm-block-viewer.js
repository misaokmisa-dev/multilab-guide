/* Minecraft original-block-texture construction visualizer (not a gameplay screenshot). */
(()=>{
"use strict";
const canvas=document.getElementById("fs-block-canvas");
if(!canvas||!canvas.getContext)return;
const ctx=canvas.getContext("2d");
if(!ctx)return;
const base="https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21.11/assets/minecraft/textures/";
const path={
sand:"block/sand.png",dirt:"block/dirt.png",stone:"block/cobblestone.png",
pistonTop:"block/piston_top.png",pistonSide:"block/piston_side.png",
observerFront:"block/observer_front.png",observerBack:"block/observer_back.png",
observerSide:"block/observer_side.png",observerTop:"block/observer_top.png",
water:"block/water_still.png",dust:"block/redstone_dust_dot.png",
sugar:"block/sugar_cane.png",bamboo:"block/bamboo_stalk.png",
hopperTop:"block/hopper_top.png",hopperSide:"block/hopper_outside.png"
};
path.chestIcon="https://minecraft.wiki/images/Invicon_Chest.png?1cab7";
const sprites=new Map();
const state={farm:"sugar",edition:"java",step:0,view:"complete",units:3,showFuture:true};
const $$=id=>document.getElementById(id);
let renderQueued=false;
function queue(){if(renderQueued)return;renderQueued=true;requestAnimationFrame(()=>{renderQueued=false;render();});}
function load(name){
 if(sprites.has(name))return sprites.get(name);
 const img=new Image();
 const entry={img,loaded:false,failed:false};
 sprites.set(name,entry);
 img.onload=()=>{entry.loaded=true;queue();};
 img.onerror=()=>{entry.failed=true;queue();};
 img.decoding="async";img.src=path[name].startsWith("https:")?path[name]:base+path[name];
 return entry;
}
Object.keys(path).forEach(load);
function layer(x,z,y,type,step,more={}){return{x,z,y,type,step,...more};}
function makeModel(){
 const n=state.units,plants=state.farm==="sugar",arr=[];
 for(let x=0;x<n;x++){
  arr.push(layer(x,0,0,plants?"sand":"dirt",0));
  if(plants)arr.push(layer(x,1,0,"water",0,{flow:x>0}));
  arr.push(layer(x,0,1,plants?"sugar":"bamboo",1));
  arr.push(layer(x,-1,2,"piston",2));
  arr.push(layer(x,-2,2,"stone",2));
  arr.push(layer(x,-1,3,"observer",3));
  arr.push(layer(x,-2,3,"dust",3));
  // Grown segments are an illustration of natural growth, never placed blocks.
  arr.push(layer(x,0,2,plants?"sugar":"bamboo",4,{grown:true}));
  arr.push(layer(x,0,3,plants?"sugar":"bamboo",4,{grown:true}));
  if(!plants)arr.push(layer(x,1,0,"water",4,{flow:x>0,optional:true}));
 }
 // A schematic collection outlet. Hoppers/chests are separate, not counted in the base BOM.
 arr.push(layer(n,1,0,"hopper",4,{optional:true}));
 arr.push(layer(n+1,1,0,"chest",4,{optional:true}));
 return arr;
}
function tex(type,face){
 const simple={sand:"sand",dirt:"dirt",stone:"stone",water:"water",hopper:face==="top"?"hopperTop":"hopperSide"};
 if(simple[type])return simple[type];
 if(type==="piston")return face==="front"?"pistonTop":"pistonSide";
 if(type==="observer")return face==="front"?"observerFront":face==="top"?"observerTop":"observerSide";
 if(type==="sugar")return"sugar";
 if(type==="bamboo")return"bamboo";
 if(type==="dust")return"dust";
 return null;
}
function geometry(){
 const cw=canvas.width,ch=canvas.height;
 const scale=state.units>=6?1.02:state.units>=4?1.18:1.38;
 const sx=48*scale,sz=25*scale,sy=47*scale;
 const center=state.units>=6?cw*0.41:cw*.44;
 const baseline=ch*.74;
 function p(x,y,z){return{x:center+(x-z)*sx,y:baseline+(x+z)*sz-y*sy};}
 return{p,sx,sz,sy};
}
function tintColor(type){
 return{sand:"#d2b67e",dirt:"#815b39",stone:"#777d80",piston:"#82755a",
 observer:"#626569",water:"#2a92dc",sugar:"#52ae3c",bamboo:"#409a41",
 dust:"#bf2131",hopper:"#696e71",chest:"#a77d4b"}[type]||"#888";
}
function polygon(coords,texture,alpha=1,shade=0){
 ctx.save();ctx.globalAlpha=alpha;
 ctx.beginPath();ctx.moveTo(coords[0].x,coords[0].y);
 for(let k=1;k<coords.length;k++)ctx.lineTo(coords[k].x,coords[k].y);
 ctx.closePath();ctx.clip();
 const asset=texture?load(texture):null;
 const img=asset?.loaded?asset.img:null;
 if(img&&img.naturalWidth){
  const w=img.naturalWidth;
  // Textures with animation frames use their first frame.
  const h=Math.min(img.naturalHeight,w);
  const a=coords[0],b=coords[1],d=coords[coords.length-1];
  ctx.transform((b.x-a.x)/w,(b.y-a.y)/w,(d.x-a.x)/h,(d.y-a.y)/h,a.x,a.y);
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(img,0,0,w,h,0,0,w,h);
 }else{
  ctx.fillStyle="#c7cdca";ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle="#5a5c60";ctx.font="bold 11px sans-serif";
  const c=coords.reduce((a,v)=>({x:a.x+v.x/coords.length,y:a.y+v.y/coords.length}),{x:0,y:0});
  ctx.fillText("未取得",c.x-16,c.y+3);
 }
 if(shade){ctx.fillStyle="rgba(0,0,0,"+shade+")";ctx.fillRect(0,0,canvas.width,canvas.height);}
 ctx.restore();
 ctx.save();ctx.globalAlpha=alpha*.45;ctx.strokeStyle="#152f20";ctx.lineWidth=.8;
 ctx.beginPath();coords.forEach((c,i)=>i?ctx.lineTo(c.x,c.y):ctx.moveTo(c.x,c.y));ctx.closePath();ctx.stroke();ctx.restore();
}
function block(blk,P){
 const {x,z,y,type,step}=blk;
 const future=step>state.step&&state.view!=="complete";
 if(future&&!state.showFuture)return;
 const opacity=future?.14:1;
 if(type==="sugar"||type==="bamboo"){
  const low=P(x+.5,y,z+.5),h=P(x+.5,y+1,z+.5);
  const A=[{x:low.x-18,y:h.y},{x:low.x+18,y:h.y},{x:low.x+18,y:low.y},{x:low.x-18,y:low.y}];
  const B=[{x:low.x-9,y:h.y},{x:low.x+9,y:h.y-5},{x:low.x+9,y:low.y-5},{x:low.x-9,y:low.y}];
  polygon(A,tex(type,"front"),opacity);polygon(B,tex(type,"front"),opacity*.92);
  if(!future&&step===state.step){ctx.save();ctx.strokeStyle="#04eb41";ctx.lineWidth=2.5;ctx.strokeRect(low.x-21,h.y-3,42,low.y-h.y+6);ctx.restore();}
  return;
 }
 if(type==="dust"){
  const corners=[P(x+.12,y,z+.12),P(x+.88,y,z+.12),P(x+.88,y,z+.88),P(x+.12,y,z+.88)];
  polygon(corners,"dust",opacity);
  if(!future&&step===state.step)outline(corners);
  return;
 }
 if(type==="chest"){
  const front=P(x+.5,y+.5,z+.5),rect=38;
  const img=load("chestIcon");
  ctx.save();ctx.globalAlpha=opacity;
  if(img?.loaded)ctx.drawImage(img.img,front.x-rect/2,front.y-rect*1.15,rect,rect);
  else{ctx.fillStyle="#976237";ctx.fillRect(front.x-18,front.y-24,36,30);ctx.fillStyle="#f2d17b";ctx.fillRect(front.x-4,front.y-13,8,6);}
  ctx.restore();return;
 }
 const A=P(x,y+1,z),B=P(x+1,y+1,z),C=P(x+1,y+1,z+1),D=P(x,y+1,z+1);
 const A0=P(x,y,z),B0=P(x+1,y,z),C0=P(x+1,y,z+1),D0=P(x,y,z+1);
 const sideZ=[D,C,C0,D0],sideX=[B,C,C0,B0],top=[A,B,C,D];
 polygon(sideZ,tex(type,"front"),opacity,0.02);
 polygon(sideX,tex(type,"side"),opacity,0.20);
 polygon(top,tex(type,"top"),opacity,0.0);
 if(type==="water"){ctx.save();ctx.globalAlpha=opacity*.28;ctx.fillStyle="#29adff";ctx.beginPath();top.forEach((v,i)=>i?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));ctx.closePath();ctx.fill();ctx.restore();}
 if(!future&&step===state.step)outline(top);
}
function outline(c){
 ctx.save();ctx.strokeStyle="#00ef56";ctx.lineWidth=3;ctx.shadowColor="#39ff6a";ctx.shadowBlur=11;
 ctx.beginPath();c.forEach((v,i)=>i?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));ctx.closePath();ctx.stroke();ctx.restore();
}
function drawGrid(){
 const {p}=geometry(),items=makeModel();
 // Back-to-front painter ordering, then build up each column.
 items.sort((a,b)=>(a.x+a.z)-(b.x+b.z)||a.y-b.y||a.z-b.z);
 for(const item of items)block(item,p);
}
function faceTile(item,origin,dimension){
 const entry=load(tex(item.type,"front")||"stone"),future=item.step>state.step&&state.view!=="complete";
 if(future&&!state.showFuture)return;
 ctx.save();ctx.globalAlpha=future?.2:1;
 const s=dimension;
 if(entry.loaded){ctx.imageSmoothingEnabled=false;ctx.drawImage(entry.img,0,0,entry.img.naturalWidth,Math.min(entry.img.naturalWidth,entry.img.naturalHeight),origin.x,origin.y,s,s);}
 else{ctx.fillStyle=tintColor(item.type);ctx.fillRect(origin.x,origin.y,s,s);}
 if(item.type==="sugar"||item.type==="bamboo"){
  ctx.globalAlpha=future?.2:1;ctx.strokeStyle="#187c1f";ctx.strokeRect(origin.x+4,origin.y+4,s-8,s-8);
 }
 if(!future&&item.step===state.step){ctx.strokeStyle="#10ef55";ctx.lineWidth=4;ctx.strokeRect(origin.x-2,origin.y-2,s+4,s+4);}
 ctx.restore();
}
function drawFlat(view){
 const items=makeModel().filter(item=>item.type!=="chest"),size=64;
 if(view==="top"){
  const buckets=new Map();
  for(const b of items.filter(b=>b.step<=state.step)){const k=b.x+":"+b.z;const previous=buckets.get(k);if(!previous||b.y>previous.y)buckets.set(k,b);}
  const a=[...buckets.values()],cols=state.units+2,baseX=(canvas.width-(cols*size))/2,baseY=145;
  for(const b of a)faceTile(b,{x:baseX+b.x*size,y:baseY+(b.z+2)*size},size-4);
  caption("上面図：今の工程までに置くブロックを表示。下の層は側面図で確認。");
  return;
 }
 const representative=items.filter(b=>b.x===0).sort((a,b)=>a.z-b.z||a.y-b.y);
 const baseX=canvas.width*.25,baseY=canvas.height*.85;
 for(const b of representative){
  faceTile(b,{x:baseX+(b.z+2)*size,y:baseY-(b.y+1)*size},size-4);
 }
 caption("側面図：左が回収側、右が配線側。1株の断面を表示。");
}
function caption(t){
 ctx.save();ctx.textAlign="center";ctx.font="600 14px system-ui,sans-serif";ctx.fillStyle="#d6efe0";ctx.fillText(t,canvas.width/2,canvas.height-23);ctx.restore();
}
function render(){
 const {width:w,height:h}=canvas;
 ctx.clearRect(0,0,w,h);
 const grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,"#243e42");grad.addColorStop(.6,"#132b29");grad.addColorStop(1,"#091917");
 ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
 ctx.fillStyle="#def5e5";ctx.font="bold 20px system-ui,sans-serif";ctx.fillText((state.farm==="sugar"?"サトウキビ":"竹")+" 自動収穫機　"+(state.step+1)+"/5 工程",26,37);
 ctx.font="13px system-ui,sans-serif";ctx.fillStyle="#accabd";ctx.fillText(state.view==="complete"?"実ブロックテクスチャによる完成イメージ":state.view==="iso"?"実ブロックのテクスチャによる工程別立体図":state.view==="top"?"真上から見た配置図":"横から見た断面図",27,62);
 if(state.view==="iso"||state.view==="complete"){drawGrid();caption(state.view==="complete"?"完成イメージ：Minecraft実ブロックのテクスチャで再現 ｜ 回収経路は配置例":"緑の輪郭＝今回の工程 ｜ 半透明＝まだ置かない部分 ｜ 作物の上部＝成長例");}
 else drawFlat(state.view);
 const missing=[...sprites.entries()].filter(([k,v])=>path[k]&&v.failed).map(([k])=>k);
 const status=$$("fs-block-status");
 if(status){
  status.textContent=missing.length?"画像が取得できないブロックがあります（"+missing.join("、")+"）。画像の読み込み環境を確認してください。":"Minecraftの実際のブロックテクスチャを使用。ゲーム内のスクリーンショットではなく、位置関係を示す立体図です。";
 }
}
function setView(view){
 if(!["complete","iso","top","side"].includes(view))return;
 state.view=view;
 document.querySelectorAll("[data-fs-camera]").forEach(b=>{
  b.classList.toggle("is-active",b.dataset.fsCamera===view);
  b.setAttribute("aria-pressed",String(b.dataset.fsCamera===view));
 });
 queue();
}
document.querySelectorAll("[data-fs-camera]").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.fsCamera)));
const toggle=$$("fs-block-future");
if(toggle)toggle.addEventListener("change",()=>{state.showFuture=!!toggle.checked;queue();});
const preview=$$("fs-block-preview");
if(preview)preview.addEventListener("change",()=>{state.units=Math.max(1,Math.min(6,Math.floor(Number(preview.value)||3)));queue();});
window.MLG_RENDER_FARM_BLOCKS=function(farm,edition,step){
 if(farm!=="sugar"&&farm!=="bamboo"){const section=$$("fs-block-viewer");if(section)section.hidden=true;return;}
 const section=$$("fs-block-viewer");if(section)section.hidden=false;
 const nextStep=Math.max(0,Math.min(4,step));
 const changed=state.farm!==farm||state.edition!==edition||state.step!==nextStep;
 state.farm=farm;state.edition=edition;state.step=nextStep;
 if(changed&&state.view==="complete"&&state.step>0)setView("iso");
 queue();
};
const texmap={
 sand:"sand",dirt:"dirt",piston:"pistonTop",observer:"observerFront",redstone:"dust",hopper:"hopperTop",
 water:"water",sugar:"sugar",bamboo:"bamboo"
};
document.querySelectorAll("[data-fs-block-icon]").forEach(img=>{
 const key=texmap[img.dataset.fsBlockIcon];if(key)img.src=base+path[key];
 img.onerror=()=>{img.hidden=true;};
});
const initialParams=new URLSearchParams(location.search);
const initialFarm=initialParams.get("farm")||"iron";
const initialEdition=initialParams.get("edition")==="bedrock"?"bedrock":"java";
let initialStep=0;
try{
 const saved=JSON.parse(localStorage.getItem("mlg-farm-build:v1:"+initialFarm+":"+initialEdition)||"{}");
 initialStep=Math.max(0,Math.min(4,Math.floor(Number(saved.step)||0)));
}catch(_){}
window.MLG_RENDER_FARM_BLOCKS(initialFarm,initialEdition,initialStep);
})();