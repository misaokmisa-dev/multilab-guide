// Offline regression checks for the first-party crash log analyzer.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const src = fs.readFileSync(path.resolve(__dirname,'../minecraft/tools/crash-log-analyzer.js'),'utf8');
function el(id=''){
  return {id,children:[],handlers:{},value:'',hidden:true,textContent:'',classList:{add(){},remove(){}},
    addEventListener(name,cb){this.handlers[name]=cb;},
    append(...nodes){this.children.push(...nodes);},
    replaceChildren(...nodes){this.children=[...nodes];},
    scrollIntoView(){}
  };
}
function testLog(content,title) {
  const ids=['cl-file','cl-paste','cl-status','cl-results','cl-findings','cl-result-note','cl-drop','cl-check','cl-clear','cl-copy'];
  const map=Object.fromEntries(ids.map(x=>[x,el(x)]));
  const document={getElementById(id){return map[id]||el(id)},createElement(tag){return el(tag)}};
  vm.runInNewContext(src,{document,navigator:{clipboard:{writeText:async()=>{}}}}, {timeout:1500});
  map['cl-paste'].value=content;
  map['cl-check'].handlers.click();
  assert.equal(map['cl-results'].hidden,false,title+' did not display results');
  const titles=map['cl-findings'].children.map(node=>node.children.map(x=>x.textContent).join('|')).join('\n');
  return {titles,status:map['cl-result-note'].textContent};
}
assert.match(testLog('java.lang.OutOfMemoryError: Java heap space','memory').titles,/メモリ不足/);
assert.match(testLog('Incompatible mods found! Mod one requires version 2','incompatible').titles,/互換性/);
assert.match(testLog('Caused by: org.spongepowered.asm.mixin.transformer.throwables.MixinApplyError: Mixin apply failed','mixin').titles,/Mixin/);
assert.match(testLog('java.lang.UnsupportedClassVersionError: class file version 65','java').titles,/Java実行環境/);
assert.match(testLog('Exception: unknown new error message','unknown').status,/一致しませんでした/);
const privateResult=testLog('C:\\Users\\PersonalName\\.minecraft java.lang.OutOfMemoryError: Java heap space','privacy');
assert.doesNotMatch(privateResult.titles,/PersonalName/,'Private path leaked into generated result');
console.log('Crash-log analyzer: 6 offline checks passed.');
