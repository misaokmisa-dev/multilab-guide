const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const files=[
 'minecraft/strategy/items/items-data.js',
 'minecraft/strategy/items/recipes-data.js',
 'minecraft/strategy/items/texture-index.js',
 'minecraft/strategy/items/items-2026-data.js',
 'minecraft/strategy/items/recipes-2026-data.js',
 'minecraft/strategy/items/texture-index-2026.js',
 'minecraft/strategy/items/encyclopedia.js'
];
function render(slug){
 const html=read('minecraft/strategy/items/view.html');
 const dom=new JSDOM(html,{url:'https://mlabg.com/minecraft/strategy/items/view?item='+encodeURIComponent(slug),runScripts:'outside-only'});
 try{
  for(const file of files)dom.window.eval(read(file));
  return dom;
 }catch(e){dom.window.close();throw e}
}
for(const [slug,expectedJapanese] of [['stone','石'],['diamond_sword','ダイヤモンドの剣'],['golden_dandelion','金のタンポポ']]){
 const dom=render(slug);const d=dom.window.document;
 const title=d.querySelector('#ency-detail h1');
 assert.ok(title,'Missing item detail header for '+slug);
 assert.equal(title.textContent.trim(),expectedJapanese);
 assert.ok(d.querySelector('#ency-detail').textContent.includes('minecraft:'+slug),'Missing correct item ID: '+slug);
 if(slug==='diamond_sword') assert.ok(d.querySelector('.ency-craft-grid'),'Expected actual 3x3 recipe for '+slug);
 dom.window.close();
}
const bad=render('not_a_real_item_name');
assert.match(bad.window.document.querySelector('#ency-detail').textContent,/見つかりません/);
bad.window.close();
console.log('Unified Minecraft item browser DOM: stone, diamond sword, 2026 added item, unknown item passed.');
