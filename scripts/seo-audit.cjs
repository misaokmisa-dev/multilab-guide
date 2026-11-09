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
const result={sitemapCount:urls.length,missing,wrongCanonical:wrong,missingCanonical:noCanonical,noindexInSitemap:noindex,brokenLinks:[...bad.values()].sort((a,b)=>b.refs-a.refs)};
console.log(JSON.stringify(result,null,2));
if(process.argv.includes('--strict')&&(missing.length||wrong.length||noCanonical.length||noindex.length||bad.size))process.exitCode=1;
