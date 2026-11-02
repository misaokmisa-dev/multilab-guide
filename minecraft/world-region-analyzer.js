/* World region analysis (Java Anvil). Local only; approximate man-made block indicators. */
(()=>{'use strict';
const $=id=>document.getElementById(id),out=$('region-output');
const patterns=/(?:_planks|_stairs|_slab|_fence|_door|_trapdoor|_wall|_glass|_bricks|_concrete|_terracotta|_carpet|_wool|_bed|_banner|_sign|_button|_pressure_plate|_lantern|_torch|_rail|_chest|_shulker_box|_table|_furnace|_smoker|_blast_furnace|_anvil|_hopper|_piston|_observer|_dispenser|_dropper|_repeater|_comparator|_redstone_lamp|_bookshelf|_scaffolding|_copper_bulb|_crafter|_decorated_pot|_flower_pot|_candle|_end_rod|_beacon|_brewing_stand|_enchanting_table|_stonecutter|_grindstone|_loom|_lectern|_campfire|_chain|_iron_bars|_lightning_rod|_note_block|_jukebox|_target|_honey_block|_slime_block|_iron_block|_gold_block|_diamond_block|_netherite_block)/;
let report=null;
function nbt(buffer){const v=new DataView(buffer),len=v.byteLength;let p=0;const need=n=>{if(p+n>len)throw Error('NBT data truncated')},u8=()=>{need(1);return v.getUint8(p++)},i16=()=>{need(2);const n=v.getInt16(p);p+=2;return n},i32=()=>{need(4);const n=v.getInt32(p);p+=4;return n},str=()=>{const n=v.getUint16(p);p+=2;need(n);const s=new TextDecoder().decode(new Uint8Array(buffer,p,n));p+=n;return s};
function value(t,depth){if(depth>40)throw Error('NBT depth too large');switch(t){case 1:return u8();case 2:return i16();case 3:return i32();case 4:need(8);p+=8;return null;case 5:need(4);p+=4;return null;case 6:need(8);p+=8;return null;case 7:{const n=i32();if(n<0||n>30000000)throw Error('NBT invalid length');need(n);p+=n;return null}
case 8:return str();case 9:{const ty=u8(),n=i32();if(n<0||n>100000)throw Error('NBT invalid list');const a=[];for(let j=0;j<n;j++)a.push(value(ty,depth+1));return a}
case 10:{const o={};while(true){const ty=u8();if(!ty)return o;const name=str();o[name]=value(ty,depth+1)}}
case 11:{const n=i32();if(n<0||n>10000000)throw Error('NBT invalid array');need(n*4);p+=n*4;return null}
case 12:{const n=i32();if(n<0||n>1000000)throw Error('NBT invalid long array');need(n*8);const a=new BigUint64Array(n);for(let j=0;j<n;j++){a[j]=v.getBigUint64(p);p+=8}return a}
default:throw Error('NBT unsupported tag '+t)}}
if(u8()!==10)throw Error('Invalid NBT root');str();return value(10,0)}
function blocks(root){const sections=root.sections||root.Sections||root.Level?.Sections||[];const found={};let samples=0;
for(const sec of sections){const state=sec.block_states||sec.BlockStates&&{palette:sec.Palette,data:sec.BlockStates};if(!state)continue;
const palette=state.palette||state.Palette||[],data=state.data||state.Data||[];if(!Array.isArray(palette)||!palette.length)continue;
const names=palette.map(e=>typeof e==='string'?e:e.Name||e.name||'');
const counts=new Array(names.length).fill(0);
if(names.length===1){counts[0]=4096}
else if(data.length){const bits=Math.max(4,Math.ceil(Math.log2(names.length))),perLong=Math.floor(64/bits),mask=(1n<<BigInt(bits))-1n;
for(let i=0;i<4096;i++){const li=Math.floor(i/perLong);if(li>=data.length)break;const index=Number((data[li]>>BigInt((i%perLong)*bits))&mask);if(index<counts.length)counts[index]++}}
else continue;
for(let i=0;i<names.length;i++){const name=names[i].replace(/^minecraft:/,'');if(patterns.test(name)){found[name]=(found[name]||0)+counts[i];samples+=counts[i]}}}
return {found,samples}}
async function analyze(file){const ab=await file.arrayBuffer(),v=new DataView(ab),local={chunks:0,blocks:0,types:{}};if(ab.byteLength<8192)throw Error('Region file is incomplete');let errors=0;
for(let i=0;i<1024;i++){const off=(v.getUint32(i*4)>>>8)*4096;if(!off||off+5>ab.byteLength)continue;const size=v.getUint32(off),compression=v.getUint8(off+4);if(size<=1||off+4+size>ab.byteLength)continue;
try{if(compression!==2&&compression!==3)continue;const chunk=ab.slice(off+5,off+4+size);let decoded=chunk;if(compression===2){if(typeof DecompressionStream==='undefined')throw Error('Browser does not support decompression');const response=new Response(new Blob([chunk]).stream().pipeThrough(new DecompressionStream('deflate')));decoded=await response.arrayBuffer()}
const data=blocks(nbt(decoded));local.chunks++;local.blocks+=data.samples;for(const [name,num] of Object.entries(data.found))local.types[name]=(local.types[name]||0)+num;
}catch(e){errors++;}}
return {...local,errors}}
$('analyze-region').addEventListener('click',async()=>{const files=[...$('regions').files];if(!files.length){out.textContent='regionフォルダ内の .mca ファイルを選択してください。';return}
if(files.length>10){out.textContent='一度に解析できるファイルは10個までです。';return}
if(files.some(f=>f.size>32*1024*1024)){out.textContent='1ファイル32MBまでに対応しています。';return}
$('analyze-region').disabled=true;let chunks=0,total=0,errors=0;const types={};try{for(let i=0;i<files.length;i++){out.textContent='解析中 '+(i+1)+' / '+files.length+' ファイル';const r=await analyze(files[i]);chunks+=r.chunks;total+=r.blocks;errors+=r.errors;for(const [k,n] of Object.entries(r.types))types[k]=(types[k]||0)+n;}
const top=Object.entries(types).sort((a,b)=>b[1]-a[1]).slice(0,8);report={chunks,total,types,files:files.length};
out.replaceChildren();const h=document.createElement('strong');h.textContent='建築関連ブロックの検出推定：'+total.toLocaleString('ja-JP')+' 個';const p=document.createElement('p');p.textContent='解析チャンク：'+chunks+' ／ ファイル：'+files.length+' ／ 読み取れなかったチャンク：'+errors;const d=document.createElement('p');d.textContent='主な種類：'+top.map(([name,n])=>name.replace('minecraft:','')+' '+n.toLocaleString('ja-JP')).join('、');out.append(h,p,d);window.worldRegionSummary=report;
}catch(e){out.textContent='解析エラー：'+e.message}finally{$('analyze-region').disabled=false}});
window.getWorldRegionReport=()=>report;
})();