/* Ten-question Minecraft MOD taste quiz. Java Edition; source projects are
 * verified Modrinth projects, not invented links or claimed user counts. */
(() => {
"use strict";
const root=window.MLG_MOD_DATA;
const form=document.getElementById("md-quiz-form");
if(!root||!form)return;
const qTitle=document.getElementById("md-question");
const qHelp=document.getElementById("md-help");
const options=document.getElementById("md-options");
const stepLabel=document.getElementById("md-step");
const pct=document.getElementById("md-pct");
const bar=document.getElementById("md-progress");
const next=document.getElementById("md-next");
const prev=document.getElementById("md-prev");
const err=document.getElementById("md-error");
const results=document.getElementById("md-results");
const summary=document.getElementById("md-summary");
const output=document.getElementById("md-cards");
const reset=document.getElementById("md-reset");
let step=0,answers=Array(10).fill(null);
const questions=[
 {name:"favorite",title:"マイクラで一番楽しみたいことは？",help:"直感で、一番ワクワクするものを選ぼう。",options:[["explore","まだ見ぬ場所を冒険したい"],["build","建築やものづくりを楽しみたい"],["combat","強い敵やボスに挑戦したい"],["farming","料理・牧場・のんびり生活"],["automation","機械や自動化で遊びたい"],["qol","今のマイクラをもっと便利にしたい"]]},
 {name:"focus",title:"新しい要素は何が増えると嬉しい？",help:"自分の好みに近いものを選んでください。",options:[["biomes","新しい地形・バイオーム"],["mobs","動物・生き物・仲間"],["structures","ダンジョン・建物・宝探し"],["gear","武器・装備・戦闘要素"],["decoration","家具・建築パーツ"],["tools","便利な道具やマップ"]]},
 {name:"style",title:"誰と遊ぶことが多い？",help:"ソロでもマルチでも楽しめるMODがあります。",options:[["solo","ひとりでじっくり"],["small","友達と2〜4人"],["server","大人数のサーバー"],["both","ソロもマルチも両方"]]},
 {name:"pace",title:"普段の遊び方に近いのは？",help:"1回のプレイ時間と進め方をイメージしてください。",options:[["short","短時間でサクッと遊ぶ"],["long","長期間かけて世界を育てる"],["creative","自由に作ったり試したり"],["challenge","目標を立てて攻略する"]]},
 {name:"difficulty",title:"どれくらい難しいMODが好き？",help:"導入後の遊びの複雑さのイメージです。",options:[["easy","簡単で直感的なもの"],["normal","ほどほどに新鮮な遊び"],["advanced","覚えることが多くてもOK"],["hard","歯ごたえのある高難度が好き"]]},
 {name:"scenery",title:"マイクラの見た目はどのくらい変えたい？",help:"景色や雰囲気の変化を選んでください。",options:[["vanilla","元の世界観を残したい"],["landscape","新しい景色を見たい"],["beautiful","影・光・映像を美しくしたい"],["different","まったく違う世界にしたい"]]},
 {name:"create",title:"建築やアイテムづくりは好き？",help:"建築やクラフトをどれくらい深く楽しみますか？",options:[["simple","簡単な家が建てられれば十分"],["decorate","家具・装飾でこだわりたい"],["factory","自動化工場や回路を作りたい"],["collect","アイテム収集・整理が好き"]]},
 {name:"battle",title:"敵との戦いや冒険はどのくらい必要？",help:"好みの難易度に合わせて選んでください。",options:[["peace","平和な暮らしが好き"],["little","たまに戦闘もしたい"],["lots","ダンジョン攻略が好き"],["boss","強力なボスや新武器が欲しい"]]},
 {name:"hardware",title:"遊ぶPCの性能はどのくらい？",help:"軽さも考えておすすめを調整します。",options:[["low","普通のノートPC・動作が重い"],["medium","一般的なゲーミングPC"],["high","高性能なゲーミングPC"],["unsure","よく分からない"]]},
 {name:"loader",title:"どのMOD環境を使う予定？",help:"MODの対応ローダーは配布ページのバージョンごとに異なります。",options:[["fabric","Fabric"],["forge","Forge"],["neoforge","NeoForge"],["unknown","まだ決めていない・分からない"]]}
];
const catalog={
"biomes-o-plenty":{tags:["explore","biomes","landscape","different","long"],group:"world",heavy:1,difficulty:1},
"terralith":{tags:["explore","biomes","landscape","vanilla","solo"],group:"world",heavy:1,difficulty:1},
"cobblemon":{tags:["mobs","collect","explore","long","small","server"],group:"creatures",heavy:2,difficulty:1},
"timeless-and-classics-zero":{tags:["combat","gear","boss","hard","small"],group:"combat",heavy:2,difficulty:2},
"supplementaries":{tags:["build","decoration","decorate","normal","vanilla"],group:"build",heavy:1,difficulty:0},
"create":{tags:["automation","factory","advanced","creative","long","build"],group:"tech",heavy:2,difficulty:2},
"waystones":{tags:["explore","tools","small","server","qol","short"],group:"travel",heavy:0,difficulty:0},
"quark":{tags:["build","vanilla","tools","decorate","normal","easy"],group:"build",heavy:1,difficulty:0},
"farmers-delight":{tags:["farming","decorate","peace","long","easy"],group:"life",heavy:1,difficulty:0},
"comforts":{tags:["farming","peace","explore","short","tools"],group:"life",heavy:0,difficulty:0},
"dungeons-and-taverns":{tags:["explore","structures","lots","challenge","landscape"],group:"dungeon",heavy:1,difficulty:1},
"l_enders-cataclysm":{tags:["combat","boss","hard","advanced","challenge"],group:"combat",heavy:2,difficulty:2},
"yungs-better-dungeons":{tags:["explore","structures","lots","challenge","vanilla"],group:"dungeon",heavy:1,difficulty:1},
"yungs-better-nether-fortresses":{tags:["explore","structures","lots","hard"],group:"dungeon",heavy:1,difficulty:1},
"yungs-better-ocean-monuments":{tags:["explore","structures","challenge","lots"],group:"dungeon",heavy:1,difficulty:1},
"yungs-better-mineshafts":{tags:["explore","structures","vanilla","lots"],group:"dungeon",heavy:1,difficulty:0},
"yungs-better-jungle-temples":{tags:["explore","structures","lots"],group:"dungeon",heavy:0,difficulty:0},
"yungs-better-end-island":{tags:["explore","landscape","structures","challenge"],group:"dungeon",heavy:1,difficulty:1},
"travelersbackpack":{tags:["explore","tools","collect","long","qol"],group:"travel",heavy:0,difficulty:0},
"sodium":{tags:["qol","easy","short","vanilla","tools"],group:"performance",heavy:0,difficulty:0},
"ferrite-core":{tags:["qol","easy","vanilla","tools"],group:"performance",heavy:0,difficulty:0},
"modmenu":{tags:["qol","tools","easy","vanilla"],group:"utility",heavy:0,difficulty:0},
"xaeros-minimap":{tags:["explore","tools","qol","structures","long"],group:"navigation",heavy:0,difficulty:0},
"xaeros-world-map":{tags:["explore","tools","landscape","qol"],group:"navigation",heavy:0,difficulty:0},
"veinminer":{tags:["qol","tools","collect","short","factory"],group:"utility",heavy:0,difficulty:0},
"appleskin":{tags:["farming","tools","qol","easy","vanilla"],group:"utility",heavy:0,difficulty:0},
"iris":{tags:["beautiful","landscape","build","decorations"],group:"visual",heavy:2,difficulty:0},
"simple-voice-chat":{tags:["small","server","qol","tools"],group:"multiplayer",heavy:0,difficulty:0},
"entityculling":{tags:["qol","easy","tools","low"],group:"performance",heavy:0,difficulty:0},
"lithium":{tags:["qol","easy","low","vanilla"],group:"performance",heavy:0,difficulty:0},
"jei":{tags:["tools","collect","factory","qol","automation","advanced"],group:"utility",heavy:0,difficulty:0},
"not-enough-animations":{tags:["beautiful","vanilla","easy"],group:"visual",heavy:0,difficulty:0},
"xaeros-minimap":{tags:["explore","tools","qol","structures","long"],group:"navigation",heavy:0,difficulty:0}
};
const allMods=new Map();
Object.values(root.lists).flat().forEach(m=>allMods.set(m.slug,m));
const picks=Object.keys(catalog).filter(slug=>allMods.has(slug)).map(slug=>({...allMods.get(slug),...catalog[slug]}));
const persona={
explore:"探索と新しい世界",build:"建築とクリエイティブ",combat:"戦闘と挑戦",farming:"のんびり生活",automation:"機械・自動化",qol:"便利さと快適さ"
};
const matchReason={
explore:"探索を楽しめる新しい発見があります",build:"建築や表現の幅を広げます",combat:"戦闘や攻略の遊びを増やします",farming:"暮らしや料理を充実させます",automation:"工場づくりや自動化に向いています",qol:"日々の操作を便利にしてくれます",
biomes:"新たな地形や景色が増えます",mobs:"生き物や仲間と遊べます",structures:"新しい建物やダンジョンを探せます",gear:"武器・装備で遊びが広がります",decoration:"飾りつけが充実します",tools:"便利な道具を導入できます",
solo:"ひとりでも遊びやすい構成です",small:"友達との少人数プレイにも合います",server:"マルチで使いやすい要素があります",long:"じっくり取り組める遊びです",short:"短時間でも効果を実感しやすいです",
factory:"複雑な機械づくりに挑戦できます",beautiful:"映像の雰囲気を変えられます",boss:"強敵に挑めます",peace:"平和に楽しめます"
};
function element(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function selected(){return form.querySelector('input[name="md-choice"]:checked');}
function render(){
 const q=questions[step];qTitle.textContent=q.title;qHelp.textContent=q.help;stepLabel.textContent="質問 "+(step+1)+" / 10";
 pct.textContent=((step+1)*10)+"%";bar.style.width=((step+1)*10)+"%";
 options.replaceChildren();err.textContent="";
 q.options.forEach(([value,label])=>{
  const wrapper=element("label","md-choice"),input=element("input");
  input.type="radio";input.name="md-choice";input.value=value;input.required=true;
  if(answers[step]===value)input.checked=true;
  wrapper.append(input,element("span","md-choice-inner",label));options.append(wrapper);
 });
 prev.disabled=step===0;next.disabled=!selected();next.textContent=step===9?"おすすめMODを見る →":"次の質問へ →";
}
function score(mod,a){
 const values=new Set(a);
 let score=0;
 const weights=[9,6,3,2,2,3,4,4];
 mod.tags.forEach(tag=>{for(let i=0;i<8;i++)if(a[i]===tag)score+=weights[i]});
 if(a[8]==="low")score+=mod.heavy===0?3:-(mod.heavy*5);
 else if(a[8]==="medium"&&mod.heavy===2)score-=2;
 if(a[4]==="easy"&&mod.difficulty===2)score-=5;
 if(a[4]==="advanced"&&mod.difficulty===2)score+=3;
 if(a[4]==="hard"&&mod.difficulty===2)score+=3;
 if(a[6]==="factory"&&mod.group==="tech")score+=6;
 if(a[7]==="boss"&&mod.group==="combat")score+=5;
 if(a[5]==="beautiful"&&mod.group==="visual")score+=7;
 if(a[0]==="qol"&&["utility","performance","navigation"].includes(mod.group))score+=4;
 return score;
}
function compatible(mod,loader){
 if(loader==="unknown")return true;
 return (mod.loaders||[]).includes(loader);
}
function choose(a){
 let pool=picks.filter(m=>compatible(m,a[9]));
 if(pool.length<8)pool=picks;
 const ranked=pool.map(m=>({...m,score:score(m,a)})).sort((x,y)=>y.score-x.score||y.downloads-x.downloads);
 // Choose different primary groups so three results aren't all dungeon reskins.
 const chosen=[],used=new Set();
 for(const m of ranked){if(used.has(m.group))continue;chosen.push(m);used.add(m.group);if(chosen.length===3)break;}
 if(chosen.length<3)for(const m of ranked){if(!chosen.some(p=>p.slug===m.slug)){chosen.push(m);if(chosen.length===3)break;}}
 return chosen;
}
function reason(mod,a){
 const parts=[];
 a.slice(0,8).forEach(val=>{if(mod.tags.includes(val)&&matchReason[val]&&!parts.includes(matchReason[val]))parts.push(matchReason[val]);});
 if(a[8]==="low"&&mod.heavy===0)parts.push("比較的軽めの構成を優先しました");
 if(parts.length===0)parts.push("あなたの希望に比較的近い特徴を持っています");
 return parts.slice(0,2).join("。")+"。";
}
function showResults(){
 const a=answers.slice(),selectedMods=choose(a);
 summary.replaceChildren();
 summary.append(element("strong","",persona[a[0]]+"派のあなたにおすすめ！"));
 summary.append(element("p","","10問の回答から相性を判定しました。金色が最もおすすめの1位です。3つはなるべく異なるタイプのMODにしています。"));
 if(a[9]==="unknown")summary.append(element("p","","MOD導入環境が未定の場合、リンク先でMinecraftのバージョンとFabric・Forge・NeoForgeなどの対応を確認してください。"));
 output.replaceChildren();
 selectedMods.forEach((mod,i)=>{
  const card=element("article","md-rec-card "+(i===0?"is-first":i===2?"is-third":"is-second"));
  const top=element("div","md-rec-top");
  top.append(element("span","md-rec-position",["🥇 1位","🥈 2位","🥉 3位"][i]),element("span","md-rec-tag",["いちばんおすすめ","次におすすめ","こちらも相性◎"][i]));
  card.append(top);
  const media=element("div","md-rec-top");
  const icon=element("img","md-rec-image");
  icon.alt="";icon.loading="lazy";if(mod.icon?.startsWith("https://"))icon.src=mod.icon;else icon.style.visibility="hidden";
  media.append(icon,element("h3","md-rec-title",mod.title));
  card.append(media);
  card.append(element("p","md-rec-desc",mod.description),element("strong","","おすすめする理由"),element("p","md-rec-reason",reason(mod,a)));
  const footer=element("div","md-rec-footer");
  footer.append(element("span","",new Intl.NumberFormat("ja-JP").format(mod.downloads)+" DL"),element("span","",(mod.loaders||[]).slice(0,2).join(" / ")||"対応環境は配布ページで確認"));
  card.append(footer);
  const link=element("a","md-mod-link","公式MODページを見る ↗");
  link.href="https://modrinth.com/mod/"+encodeURIComponent(mod.slug);link.target="_blank";link.rel="noopener noreferrer";
  card.append(link);output.append(card);
 });
 form.closest(".md-quiz-card").hidden=true;
 results.hidden=false;results.scrollIntoView({behavior:"smooth",block:"start"});
}
options.addEventListener("change",()=>{err.textContent="";next.disabled=!selected();});
prev.addEventListener("click",()=>{if(step===0)return;step--;render();});
form.addEventListener("submit",ev=>{ev.preventDefault();const input=selected();if(!input){err.textContent="回答を選んでください。";return;}answers[step]=input.value;if(step<9){step++;render();}else showResults();});
reset.addEventListener("click",()=>{answers=Array(10).fill(null);step=0;results.hidden=true;form.closest(".md-quiz-card").hidden=false;render();document.getElementById("md-quiz").scrollIntoView({behavior:"smooth",block:"start"});});
render();
})();
