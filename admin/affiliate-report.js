(() => {
'use strict';
const el=id=>document.getElementById(id),fmt=n=>Math.round(n).toLocaleString('ja-JP'),yen=n=>'¥'+Math.round(n).toLocaleString('ja-JP');
const platforms=[['amazon','Amazonアソシエイト'],['a8','A8.net'],['adsterra','Adsterra'],['ninja','忍者AdMax'],['other','その他提携']];
const state={events:null,imports:[]};
const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
el('manual').elements.date.value=today();
const duration=()=>+el('days').value;
const startDay=()=>{const date=new Date(today()+'T00:00:00+09:00');date.setUTCDate(date.getUTCDate()-duration()+1);return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(date)};
const inRange=d=>d&&d>=startDay()&&d<=today();
const none=n=>n===null||n===undefined?'—':fmt(n);
const money=n=>n===null||n===undefined?'—':yen(n);
const parseNum=t=>{if(t==null)return null;const raw=String(t).trim();if(!raw||raw==='—'||raw==='-')return null;const cleaned=raw.replace(/[,，\s￥¥円%]/g,'');const n=Number(cleaned);return Number.isFinite(n)?n:null;};
const normalizeDate=t=>{
 let s=String(t||'').trim().replace(/[年月.]/g,'/').replace(/日/g,'').replace(/-/g,'/');
 const m=s.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
 if(!m)return null;const d=[m[1],m[2].padStart(2,'0'),m[3].padStart(2,'0')].join('-');
 return !Number.isNaN(Date.parse(d))?d:null;
};
function csvRows(src){
 const delimiter=(src.split(/\r?\n/)[0]||'').split('\t').length>(src.split(/\r?\n/)[0]||'').split(',').length?'\t':',';
 let rows=[],row=[],field='',quoted=false;
 for(let i=0;i<src.length;i++){const ch=src[i];
  if(ch==='"'){if(quoted&&src[i+1]==='"'){field+='"';i++}else quoted=!quoted}
  else if(ch===delimiter&&!quoted){row.push(field);field=''}
  else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&src[i+1]==='\n')i++;row.push(field);if(row.some(c=>c.trim()))rows.push(row);row=[];field=''}
  else field+=ch;
 }
 row.push(field);if(row.some(c=>c.trim()))rows.push(row);
 return rows;
}
function indexFor(head,terms){
 return head.findIndex(s=>terms.some(term=>s.toLowerCase().includes(term.toLowerCase())));
}
function fromCsv(txt,platform){
 const rows=csvRows(txt.replace(/^\uFEFF/,''));
 let headerIndex=rows.findIndex(r=>r.some(v=>/日付|年月日|date|クリック|click|発生報酬|impres|表示回数|earnings|revenue/i.test(v)));
 if(headerIndex<0)throw Error('見出し行が見つかりません');
 const h=rows[headerIndex].map(v=>v.replace(/\s/g,'').toLowerCase());
 const col={
 date:indexFor(h,['日付','年月日','対象日','date','day']),
 impressions:indexFor(h,['インプレッション','表示回数','広告表示','impression','views']),
 clicks:indexFor(h,['クリック数','clicks','クリック']),
 gross:indexFor(h,['発生報酬額','発生成果額','発生金額','未確定報酬','推定収益','earned','gross','estimatedearnings','revenue','発生報酬','報酬額']),
 confirmed:indexFor(h,['確定報酬','確定金額','承認報酬','confirmed','approved','finalearnings'])
 };
 if(col.date<0)throw Error('日付列を認識できません。手入力フォームから登録してください');
 if([col.impressions,col.clicks,col.gross,col.confirmed].every(i=>i<0))throw Error('実績列を認識できません。手入力フォームから登録してください');
 const imported=[];
 for(const row of rows.slice(headerIndex+1)){
  const date=normalizeDate(row[col.date]);if(!date)continue;
  const pick=k=>col[k]<0?null:parseNum(row[col[k]]);
  const obj={date,provider:platform,impressions:pick('impressions'),clicks:pick('clicks'),gross:pick('gross'),confirmed:pick('confirmed')};
  if(Object.values(obj).slice(2).some(v=>v!==null))imported.push(obj);
 }
 return imported;
}
function addCell(row,value,numeric=false){const td=document.createElement('td');td.textContent=value;if(numeric)td.className='num';row.appendChild(td);}
function render(){
 const records=state.imports.filter(r=>inRange(r.date)),events=state.events?.filter(r=>inRange(r.day))||[];
 const has=(a,key)=>a.some(x=>x[key]!==null&&x[key]!==undefined);
 const sum=(a,k)=>a.reduce((n,x)=>n+(Number(x[k])||0),0);
 const gross=has(records,'gross')?sum(records,'gross'):null,confirmed=has(records,'confirmed')?sum(records,'confirmed'):null;
 el('kpi-gross').textContent=money(gross);el('kpi-confirmed').textContent=money(confirmed);
 const views=state.events?sum(events.filter(r=>r.event==='pageview'),'hits'):null;
 el('kpi-pageviews').textContent=none(views);
 const groups=[];
 for(const [key,title] of platforms){
  const local=events.filter(x=>x.platform===key),remote=records.filter(r=>r.provider===key);
  const clicks=state.events&&['amazon','a8','other'].includes(key)?sum(local.filter(x=>x.event==='click'),'hits'):(has(remote,'clicks')?sum(remote,'clicks'):null);
  const impressions=state.events&&['amazon','a8','other'].includes(key)?sum(local.filter(x=>x.event==='impression'),'hits'):(has(remote,'impressions')?sum(remote,'impressions'):null);
  const ctr=clicks!==null&&impressions!==null&&impressions>0?clicks/impressions*100:null;
  groups.push({key,title,clicks,impressions,ctr,gross:has(remote,'gross')?sum(remote,'gross'):null,confirmed:has(remote,'confirmed')?sum(remote,'confirmed'):null});
 }
 const eligible=groups.filter(g=>['amazon','a8','other'].includes(g.key));
 const imp=eligible.reduce((v,g)=>v+(g.impressions||0),0),click=eligible.reduce((v,g)=>v+(g.clicks||0),0);
 el('kpi-ctr').textContent=state.events&&imp>0?(100*click/imp).toFixed(2)+'%':'—';
 const tbody=el('provider-rows');tbody.replaceChildren();
 for(const g of groups){const tr=document.createElement('tr');addCell(tr,g.title);addCell(tr,none(g.impressions),true);addCell(tr,none(g.clicks),true);addCell(tr,g.ctr===null?'—':g.ctr.toFixed(2)+'%',true);addCell(tr,money(g.gross),true);addCell(tr,money(g.confirmed),true);tbody.appendChild(tr);}
 // Internal guide-to-comparison funnel: visible CTA views and clicks, by day.
 // These are not ad impressions, unique visitors, purchases, or ASP conversions.
 const funnelBody=el('funnel-rows');funnelBody.replaceChildren();
 const funnelMap=new Map();
 for(const e of events){
  if(e.platform!=='site'||!['impression','click'].includes(e.event)||
     typeof e.item!=='string'||!e.item.startsWith('funnel:'))continue;
  const name=e.item.slice(7),day=e.day||'',page=e.page||'';
  const key=[day,page,name].join('|');
  if(!funnelMap.has(key))funnelMap.set(key,{day,page,name,views:0,clicks:0});
  const item=funnelMap.get(key);
  item[e.event==='impression'?'views':'clicks']+=Number(e.hits)||0;
 }
 const funnelData=[...funnelMap.values()].sort((a,b)=>b.day.localeCompare(a.day)||b.clicks-a.clicks);
 for(const f of funnelData){
  const tr=document.createElement('tr');
  addCell(tr,f.day);addCell(tr,f.name);addCell(tr,f.page);
  addCell(tr,fmt(f.views),true);addCell(tr,fmt(f.clicks),true);
  addCell(tr,f.views>0?(100*f.clicks/f.views).toFixed(2)+'%':'—',true);
  funnelBody.appendChild(tr);
 }
 if(!funnelData.length){
  const tr=document.createElement('tr'),td=document.createElement('td');
  td.colSpan=6;
  td.textContent=state.events?'選択期間の導線計測データはありません。':'計測APIの認証後に日別の導線CTRを表示します。';
  tr.appendChild(td);funnelBody.appendChild(tr);
 }
 const linkRows=el('link-rows');linkRows.replaceChildren();
 const linkMap=new Map();
 for(const e of events.filter(x=>['impression','click'].includes(x.event))){
  const key=[e.platform,e.page,e.item].join('|');
  if(!linkMap.has(key))linkMap.set(key,{platform:e.platform,page:e.page,item:e.item,impressions:0,clicks:0});
  const s=linkMap.get(key);s[e.event==='click'?'clicks':'impressions']+=Number(e.hits)||0;
 }
 const links=[...linkMap.values()].sort((a,b)=>b.clicks-a.clicks||b.impressions-a.impressions).slice(0,200);
 for(const x of links){const tr=document.createElement('tr');
  addCell(tr,platforms.find(p=>p[0]===x.platform)?.[1]||x.platform);addCell(tr,x.page||'—');addCell(tr,x.item||'—');addCell(tr,fmt(x.impressions),true);addCell(tr,fmt(x.clicks),true);addCell(tr,x.impressions?(100*x.clicks/x.impressions).toFixed(2)+'%':'—',true);linkRows.appendChild(tr);
 }
 if(!links.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=6;td.textContent='クリック計測データはまだありません。';tr.appendChild(td);linkRows.appendChild(tr);}
 const tb=el('imports');tb.replaceChildren();
 for(const r of records.slice().reverse().slice(0,300)){const tr=document.createElement('tr');addCell(tr,r.date);addCell(tr,platforms.find(x=>x[0]===r.provider)?.[1]||r.provider);addCell(tr,none(r.impressions),true);addCell(tr,none(r.clicks),true);addCell(tr,money(r.gross),true);addCell(tr,money(r.confirmed),true);tb.appendChild(tr);}
 if(!records.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=6;td.textContent='公式レポートのデータはまだ取り込まれていません。';tr.appendChild(td);tb.appendChild(tr);}
 const chart=el('chart');chart.replaceChildren();
 const daily=new Map();
 for(const r of records)if(r.gross!==null)daily.set(r.date,(daily.get(r.date)||0)+r.gross);
 if(daily.size){
  const dates=[...daily].sort((a,b)=>a[0].localeCompare(b[0]));
  const max=Math.max(...dates.map(x=>x[1]),1);
  for(const [day,value] of dates){const b=document.createElement('div');b.className='bar';b.style.height=Math.max(3,145*value/max)+'px';b.title=day+' '+yen(value);b.setAttribute('aria-label',b.title);chart.appendChild(b);}
 }else{const p=document.createElement('p');p.className='muted';p.textContent='報酬の公式レポートを読み込むと推移を表示します。';chart.appendChild(p);}
}
el('load-server').addEventListener('click',async()=>{
 const token=el('token').value,status=el('server-status');if(!token){status.textContent='トークンを入力してください';return}
 status.textContent='読み込み中…';status.className='status';
 try{const r=await fetch('/api/affiliate-summary?days='+duration(),{headers:{Authorization:'Bearer '+token},cache:'no-store'});if(r.status===404)throw Error('Cloudflareの計測APIが未接続です');const d=await r.json();
  if(!r.ok)throw Error(d.error||'APIの接続に失敗しました');
  state.events=d.rows||[];status.textContent='計測データ受信済み';status.className='status good';render();
 }catch(e){status.textContent=e.message||'通信エラー';status.className='status bad'}
});
el('days').addEventListener('change',()=>{state.events=null;el('server-status').textContent='期間変更：再読込してください';el('server-status').className='status';render()});
el('file').addEventListener('change',async e=>{
 const platform=el('provider').value,files=[...e.target.files];let count=0,errors=[];
 for(const file of files){
  try{const bytes=await file.arrayBuffer();let str=new TextDecoder('utf-8').decode(bytes);
   if((str.match(/\uFFFD/g)||[]).length>3)str=new TextDecoder('shift_jis').decode(bytes);
   const imported=fromCsv(str,platform);state.imports.push(...imported);count+=imported.length;
  }catch(err){errors.push(file.name+': '+err.message)}
 }
 el('import-status').textContent=count+'行を読み込みました。'+(errors.length?' 読み込み失敗: '+errors.join(' / '):'');
 e.target.value='';render();
});
el('manual').addEventListener('submit',e=>{
 e.preventDefault();const v=Object.fromEntries(new FormData(e.currentTarget));
 const rec={date:v.date,provider:v.provider};
 for(const k of ['impressions','clicks','gross','confirmed'])rec[k]=v[k]===''?null:parseNum(v[k]);
 state.imports.push(rec);render();
});
el('clear-records').addEventListener('click',()=>{if(confirm('読み込んだ収益データを、この画面からすべて消去しますか？')){state.imports=[];render();}});
el('export').addEventListener('click',()=>{
 if(!state.imports.length){alert('書き出すレポートがありません');return}
 const header=['date','provider','impressions','clicks','gross_yen','confirmed_yen'];
 const data=state.imports.map(x=>[x.date,x.provider,x.impressions,x.clicks,x.gross,x.confirmed].map(y=>y??'').join(','));
 const blob=new Blob(['\uFEFF'+[header.join(','),...data].join('\r\n')],{type:'text/csv;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='multilab-affiliate-results-'+today()+'.csv';a.click();URL.revokeObjectURL(url);
});
fetch('/api/affiliate-summary',{cache:'no-store'}).then(r=>{const s=el('server-status');if(r.status===404){s.textContent='計測API未接続（Cloudflare設定が必要）';s.className='status bad'}else if(r.status===401){s.textContent='管理トークンの入力待ち';s.className='status'}else if(r.status===503){s.textContent='APIは有効・管理用設定は未完了';s.className='status bad'}}).catch(()=>{});
render();
})();
