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
pistonTop:"block/piston_top.png",pistonSide:"block/piston_side.png",pistonBottom:"block/piston_bottom.png",
observerFront:"block/observer_front.png",observerBack:"block/observer_back.png",
observerSide:"block/observer_side.png",observerTop:"block/observer_top.png",
water:"block/water_still.png",dust:"block/redstone_dust_dot.png",
sugar:"block/sugar_cane.png",bamboo:"block/bamboo_stalk.png",
hopperTop:"block/hopper_top.png",hopperSide:"block/hopper_outside.png",
 chestAtlas:"entity/chest/normal.png"
};
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
 // Pistons face the crop (positive Z); platform/front, side and bottom/back are distinct game textures.
 if(type==="piston")return face==="front"?"pistonTop":face==="back"?"pistonBottom":"pistonSide";
 if(type==="observer")return face==="front"?"observerFront":face==="top"?"observerTop":"observerSide";
 if(type==="sugar")return"sugar";
 if(type==="bamboo")return"bamboo";
 if(type==="dust")return"dust";
 return null;
}
function geometry(items){
 // Fit the complete 3D footprint into the usable canvas, including all blocks and growing plants.
 // Fixed "baseline" positioning clipped the lower blocks when 3–6 units were previewed.
 const cw=canvas.width,ch=canvas.height;
 const world=items?.length?items:makeModel();
 let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
 const project=(x,y,z)=>({x:(x-z)*48,y:(x+z)*25-y*47});
 for(const b of world){
  if(b.step>state.step&&state.view!=="complete"&&!state.showFuture)continue;
  for(const x of [b.x,b.x+1])for(const z of [b.z,b.z+1])for(const y of [b.y,b.y+1]){
   const p=project(x,y,z);
   minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);
   minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);
  }
 }
 if(!Number.isFinite(minX)){minX=-160;maxX=320;minY=-220;maxY=150;}
 const left=45,right=cw-45,top=97,bottom=ch-82;
 const scale=Math.min(1.5,(right-left)/(maxX-minX||1),(bottom-top)/(maxY-minY||1));
 const shiftX=(left+right)/2-((minX+maxX)/2)*scale;
 const shiftY=(top+bottom)/2-((minY+maxY)/2)*scale;
 const sx=48*scale,sz=25*scale,sy=47*scale;
 function p(x,y,z){return{x:shiftX+(x-z)*sx,y:shiftY+(x+z)*sz-y*sy};}
 return{p,sx,sz,sy,scale,limits:{minX:shiftX+minX*scale,maxX:shiftX+maxX*scale,minY:shiftY+minY*scale,maxY:shiftY+maxY*scale}};
}
function tintColor(type){
 return{sand:"#d2b67e",dirt:"#815b39",stone:"#777d80",piston:"#82755a",
 observer:"#626569",water:"#2a92dc",sugar:"#52ae3c",bamboo:"#409a41",
 dust:"#bf2131",hopper:"#696e71",chest:"#a77d4b"}[type]||"#888";
}
function polygon(coords,texture,alpha=1,shade=0,textureRotation=0,sourceRect=null){
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
  if(textureRotation){
   ctx.translate(w/2,h/2);ctx.rotate(textureRotation*Math.PI/180);
   if(sourceRect)ctx.drawImage(img,sourceRect[0],sourceRect[1],sourceRect[2],sourceRect[3],-w/2,-h/2,w,h);
   else ctx.drawImage(img,0,0,w,h,-w/2,-h/2,w,h);
  }else if(sourceRect)ctx.drawImage(img,sourceRect[0],sourceRect[1],sourceRect[2],sourceRect[3],0,0,w,h);
  else ctx.drawImage(img,0,0,w,h,0,0,w,h);
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
function block(blk,P,scale=1){
 const {x,z,y,type,step}=blk;
 const future=step>state.step&&state.view!=="complete";
 if(future&&!state.showFuture)return;
 const opacity=future?.14:1;
 if(type==="sugar"||type==="bamboo"){
  const low=P(x+.5,y,z+.5),h=P(x+.5,y+1,z+.5);
  const w=18*scale,v=9*scale,tilt=5*scale;
  const A=[{x:low.x-w,y:h.y},{x:low.x+w,y:h.y},{x:low.x+w,y:low.y},{x:low.x-w,y:low.y}];
  const B=[{x:low.x-v,y:h.y},{x:low.x+v,y:h.y-tilt},{x:low.x+v,y:low.y-tilt},{x:low.x-v,y:low.y}];
  polygon(A,tex(type,"front"),opacity);polygon(B,tex(type,"front"),opacity*.92);
  if(state.view!=="complete"&&!future&&step===state.step){ctx.save();ctx.strokeStyle="#04eb41";ctx.lineWidth=2.5;ctx.strokeRect(low.x-w-3,h.y-3,w*2+6,low.y-h.y+6);ctx.restore();}
  return;
 }
 if(type==="dust"){
  const corners=[P(x+.12,y,z+.12),P(x+.88,y,z+.12),P(x+.88,y,z+.88),P(x+.12,y,z+.88)];
  polygon(corners,"dust",opacity);
  if(state.view!=="complete"&&!future&&step===state.step)outline(corners);
  return;
 }
 if(type==="chest"){
  // Vanilla single chest is a 14x14 chest entity with a 10px body and 5px lid.
  // It does NOT use a normal full-block texture or a flat inventory icon.
  // All UV rectangles below refer to Mojang's 64x64 entity/chest/normal.png.
  const l=x+1/16,r=x+15/16,near=z+1/16,far=z+15/16;
  const baseBottom=y+1/16,bodyTop=y+11/16,lidTop=y+1;
  const sideZ=(y1,y0)=>[P(l,y1,far),P(r,y1,far),P(r,y0,far),P(l,y0,far)];
  const sideX=(y1,y0)=>[P(r,y1,near),P(r,y1,far),P(r,y0,far),P(r,y0,near)];
  const top=[P(l,lidTop,near),P(r,lidTop,near),P(r,lidTop,far),P(l,lidTop,far)];
  polygon(sideZ(bodyTop,baseBottom),"chestAtlas",opacity,0.04,0,[14,33,14,10]);
  polygon(sideX(bodyTop,baseBottom),"chestAtlas",opacity,0.17,0,[28,33,14,10]);
  polygon(sideZ(lidTop,bodyTop),"chestAtlas",opacity,0.03,0,[14,14,14,5]);
  polygon(sideX(lidTop,bodyTop),"chestAtlas",opacity,0.16,0,[28,14,14,5]);
  polygon(top,"chestAtlas",opacity,0,0,[14,0,14,14]);
  // Chest latch projects slightly forward, like the actual chest block model.
  const lockZ=far+1/120,lockX=x+.5,small=1/16;
  const lockFace=[P(lockX-small,lidTop-1/16,lockZ),P(lockX+small,lidTop-1/16,lockZ),
   P(lockX+small,lidTop-5/16,lockZ),P(lockX-small,lidTop-5/16,lockZ)];
  ctx.save();ctx.globalAlpha=opacity;ctx.beginPath();
  lockFace.forEach((c,i)=>i?ctx.lineTo(c.x,c.y):ctx.moveTo(c.x,c.y));
  ctx.closePath();ctx.fillStyle="#c8c7ba";ctx.fill();ctx.strokeStyle="#3e453d";ctx.lineWidth=1.1;ctx.stroke();ctx.restore();
  if(state.view!=="complete"&&!future&&step===state.step)outline(top);
  return;
 }
 const A=P(x,y+1,z),B=P(x+1,y+1,z),C=P(x+1,y+1,z+1),D=P(x,y+1,z+1);
 const A0=P(x,y,z),B0=P(x+1,y,z),C0=P(x+1,y,z+1),D0=P(x,y,z+1);
 const sideZ=[D,C,C0,D0],sideX=[B,C,C0,B0],top=[A,B,C,D];
 polygon(sideZ,tex(type,"front"),opacity,0.02);
 // Minecraft's piston model rotates the east/west side texture by 90 degrees.
 polygon(sideX,tex(type,"side"),opacity,0.20,type==="piston"?90:0);
 polygon(top,tex(type,"top"),opacity,0.0);
 if(type==="water"){ctx.save();ctx.globalAlpha=opacity*.28;ctx.fillStyle="#29adff";ctx.beginPath();top.forEach((v,i)=>i?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));ctx.closePath();ctx.fill();ctx.restore();}
 if(state.view!=="complete"&&!future&&step===state.step)outline(top);
}
function outline(c){
 ctx.save();ctx.strokeStyle="#00ef56";ctx.lineWidth=3;ctx.shadowColor="#39ff6a";ctx.shadowBlur=11;
 ctx.beginPath();c.forEach((v,i)=>i?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));ctx.closePath();ctx.stroke();ctx.restore();
}
function drawGrid(){
 const items=makeModel(),camera=geometry(items);
 // Back-to-front painter ordering, then build up each column.
 items.sort((a,b)=>(a.x+a.z)-(b.x+b.z)||a.y-b.y||a.z-b.z);
 for(const item of items)block(item,camera.p,camera.scale);
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
 if(state.view!=="complete"&&!future&&item.step===state.step){ctx.strokeStyle="#10ef55";ctx.lineWidth=4;ctx.strokeRect(origin.x-2,origin.y-2,s+4,s+4);}
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
 ctx.font="13px system-ui,sans-serif";ctx.fillStyle="#accabd";ctx.fillText(state.view==="complete"?"ブロックの向きと完成形（ピストンは作物の方向に押します）":state.view==="iso"?"実ブロックのテクスチャによる工程別立体図":state.view==="top"?"真上から見た配置図":"横から見た断面図",27,62);
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
 const differentBuild=state.farm!==farm||state.edition!==edition;
 const changedStep=state.step!==nextStep;
 state.farm=farm;state.edition=edition;state.step=nextStep;
 // Every selected machine/edition starts in "Completed" camera mode.
 if(differentBuild)setView("complete");
 else if(changedStep&&state.view==="complete"&&nextStep>0)setView("iso");
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
// Default to the completed preview and the first construction step, even after a prior visit.
window.MLG_RENDER_FARM_BLOCKS(initialFarm,initialEdition,0);
})();