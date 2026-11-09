#!/usr/bin/env node
const fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),SITE='https://mlabg.com';
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const present=p=>fs.existsSync(path.join(ROOT,p))&&fs.statSync(path.join(ROOT,p)).isFile();
function source(url){
 let u;try{u=new URL(url,SITE)}catch{return null}
 if(u.origin!==SITE)return null;
 const p=decodeURIComponent(u.pathname).replace(/^\//,'');
 const candidates=!p||p.endsWith('/')?[p+'index.html']:[p,p+'.html',p+'/index.html'];
 return {u,candidates,file:candidates.find(present)};
}
function attrs(tag){
 const o={};for(const m of tag.matchAll(/([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g))o[m[1].toLowerCase()]=m[2]??m[3];return o;
}
function canonical(s){
 for(const m of s.matchAll(/<link\b[^>]*>/gi)){const a=attrs(m[0]);if((a.rel||'').split(/\s+/).includes('canonical'))return a.href||'';}return null;
}
const urls=[...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1].replaceAll('&amp;','&'));
const missing=[],wrong=[],noCanonical=[],noindex=[],bad=new Map(),seen=new Set();
for(const url of urls){
 if(seen.has(url))missing.push({url,issue:'duplicate'});seen.add(url);
 const loc=source(url);if(!loc?.file){missing.push({url,issue:'missing HTML'});continue;}
 const html=read(loc.file),c=canonical(html);
 if(!c)noCanonical.push(loc.file);else if(c!==url)wrong.push({page:loc.file,declared:c,sitemap:url});
 if(/<meta\b[^>]*name\s*=\s*["']robots["'][^>]*content\s*=\s*["'][^"']*noindex/i.test(html))noindex.push(loc.file);
 for(const link of html.matchAll(/<a\b[^>]*>/gi)){
  const a=attrs(link[0]),href=a.href;
  if(!href||href[0]==='#'||/^(?:mailto:|tel:|javascript:|data:)/i.test(href))continue;
  let abs;try{abs=new URL(href,SITE+'/'+loc.file)}catch{continue}
  if(abs.origin!==SITE||abs.pathname.startsWith('/api/'))continue;
  if(!source(abs.href)?.file){
   const key=abs.pathname,prev=bad.get(key)||{url:key,refs:0,sources:[]};prev.refs++;
   if(prev.sources.length<4&&!prev.sources.includes(loc.file))prev.sources.push(loc.file);
   bad.set(key,prev);
  }
 }
}
let result={sitemapCount:urls.length,noncanonicalSitemapUrls:urls.filter(u=>u.endsWith('.html')),missing,wrongCanonical:wrong,missingCanonical:noCanonical,noindexInSitemap:noindex,brokenLinks:[...bad.values()].sort((a,b)=>b.refs-a.refs)};

if(process.argv.includes('--all')){
 function list(dir=''){
  let found=[];for(const entry of fs.readdirSync(path.join(ROOT,dir),{withFileTypes:true})){
   if(['.git','node_modules','.next','.wrangler'].includes(entry.name))continue;
   const next=path.posix.join(dir,entry.name);
   if(entry.isDirectory())found.push(...list(next));
   else if(next.endsWith('.html'))found.push(next);
  }return found;
 }
 const files=list(),allBad=new Map(),allCanon=[],canonAbsent=[];
 for(const p of files){
  const html=read(p),c=canonical(html);
  const preferred=SITE+'/'+(p==='index.html'?'':p.endsWith('/index.html')?p.slice(0,-10):p);
  if(c){
   if(c!==preferred&&c!==preferred.replace(/\.html$/,''))allCanon.push({file:p,canonical:c,preferred});
  }else canonAbsent.push(p);
  for(const link of html.matchAll(/<a\b[^>]*>/gi)){
   const href=attrs(link[0]).href;
   if(!href||href[0]==='#'||/^(?:mailto:|tel:|javascript:|data:)/i.test(href))continue;
   let abs;try{abs=new URL(href,SITE+'/'+p)}catch{continue}
   if(abs.origin!==SITE||abs.pathname.startsWith('/api/'))continue;
   if(!source(abs.href)?.file){
    const k=abs.pathname,v=allBad.get(k)||{url:k,refs:0,sources:[]};
    v.refs++;if(v.sources.length<5&&!v.sources.includes(p))v.sources.push(p);
    allBad.set(k,v);
   }
  }
 }
 result.allHtml={files:files.length,missingCanonicalCount:canonAbsent.length,missingCanonicalSamples:canonAbsent.slice(0,35),otherCanonicalCount:allCanon.length,otherCanonicalSamples:allCanon.slice(0,40),brokenTargetCount:allBad.size,brokenTargets:[...allBad.values()].sort((a,b)=>b.refs-a.refs).slice(0,100)};
}

console.log(JSON.stringify(result,null,2));
if(process.argv.includes('--strict')&&(result.noncanonicalSitemapUrls.length||missing.length||wrong.length||noCanonical.length||noindex.length||bad.size))process.exitCode=1;
