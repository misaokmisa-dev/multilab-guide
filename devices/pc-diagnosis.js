/* MULTI LAB GUIDE: eight-question PC buying guide, 2026-10.
 * Advisory comparison (not measured FPS or official per-title certification).
 */
(() => {
  "use strict";
  const form = document.getElementById("pc-quiz");
  if (!form) return;
  const title = document.getElementById("pc-question");
  const help = document.getElementById("pc-help");
  const options = document.getElementById("pc-options");
  const number = document.getElementById("pc-step-number");
  const progress = document.getElementById("pc-progress-fill");
  const progressBar = document.getElementById("pc-progress-bar");
  const error = document.getElementById("pc-error");
  const back = document.getElementById("pc-back");
  const next = document.getElementById("pc-next");
  const results = document.getElementById("pc-results");
  const summary = document.getElementById("pc-summary");
  const cards = document.getElementById("pc-result-grid");
  const redo = document.getElementById("pc-redo");
  const amazonTag = "multilabguide-22";
  let step = 0;
  const answers = Array(8).fill(null);

  const gamesByGenre = {
    fps: [
      ["valorant","VALORANT / CS2",0],
      ["fortnite","Fortnite / Apex Legends",1],
      ["tarkov","Escape from Tarkov / ARC Raiders",2],
      ["otherfps","いろいろな対戦FPSを遊ぶ",1]
    ],
    aaa: [
      ["wilds","モンスターハンターワイルズ",3],
      ["cyberpunk","Cyberpunk 2077 / 黒神話：悟空",3],
      ["elden","ELDEN RING / バイオハザード",2],
      ["otheraaa","これから出る大型ゲームも遊ぶ",3]
    ],
    rpg: [
      ["genshin","原神 / 崩壊：スターレイル",1],
      ["ff14","FINAL FANTASY XIV",2],
      ["hogwarts","ホグワーツ・レガシー / Starfield",3],
      ["otherrpg","色々なRPG・MMORPG",2]
    ],
    sandbox: [
      ["minecraft","Minecraft（バニラ中心）",0],
      ["shadermc","Minecraft（影MOD・大型MOD）",3],
      ["ark","ARK: Survival Ascended / パルワールド",3],
      ["othersandbox","サバイバル・建築ゲーム全般",2]
    ],
    casual: [
      ["indie","インディー・2D・軽めのゲーム",0],
      ["sims","シミュレーション / The Sims",1],
      ["st6","ストリートファイター6",1],
      ["othercasual","複数ジャンルを幅広く",1]
    ],
    sim: [
      ["racing","Forza Horizon / レーシング",2],
      ["flight","Microsoft Flight Simulator",3],
      ["city","Cities: Skylines II / 重いシミュレーション",3],
      ["othersim","レース・乗り物・シミュレーション全般",2]
    ]
  };
  const questions = [
    {key:"genre", title:"主にどんなジャンルのゲームで遊びたい？", help:"一番よく遊ぶジャンルを1つ選んでください。", choices:[
      ["fps","FPS・対戦・バトルロイヤル"],
      ["aaa","最新の大型アクション・高画質ゲーム"],
      ["rpg","RPG・MMORPG・オープンワールド"],
      ["sandbox","Minecraft・サバイバル・建築"],
      ["casual","インディー・軽め・格闘ゲーム"],
      ["sim","レース・フライト・シミュレーション"]
    ]},
    {key:"game",title:"特に遊びたいゲームは？",help:"ジャンル内で最も近いものを選択。動作の重さを考慮します。",choices:()=>gamesByGenre[answers[0]]||gamesByGenre.fps},
    {key:"resolution",title:"どの画面のきれいさで遊びたい？",help:"使っているモニターに合わせてください。わからなければフルHDで十分です。",choices:[
      ["fhd","フルHD（1920×1080）"],
      ["wqhd","WQHD（2560×1440）"],
      ["4k","4K（3840×2160）"],
      ["unsure","未定・よくわからない"]
    ]},
    {key:"fps",title:"なめらかさはどのくらい重視する？",help:"高fpsには対応モニターも必要です。ゲーム側の上限がある場合もあります。",choices:[
      ["60","60fps前後で十分"],
      ["120","120〜165fpsを目指したい"],
      ["240","240fps以上を優先したい"],
      ["quality","fpsより映像のきれいさを優先"]
    ]},
    {key:"use",title:"ゲーム以外に何をする？",help:"作業の並行利用が増えるほどCPU・メモリも重要です。",choices:[
      ["game","ゲーム・動画視聴・ネット中心"],
      ["stream","ゲーム実況・ライブ配信もしたい"],
      ["video","動画編集・イラスト制作をする"],
      ["heavy","3D制作・重い編集・AI処理をする"]
    ]},
    {key:"mods",title:"MODや同時起動アプリはどのくらい？",help:"影MOD・大規模MOD・ブラウザー同時起動はメモリを多く使います。",choices:[
      ["none","ほぼ使わない"],
      ["some","Discordやブラウザーを同時起動"],
      ["many","MODを多く使う・ゲーム中に多数起動"],
      ["extreme","大規模MOD・影MOD・高解像度素材"]
    ]},
    {key:"budget",title:"PC本体の予算は？",help:"モニター・キーボード等を除く、税込み本体予算の目安です。",choices:[
      ["under12","12万円未満"],
      ["12-18","12万〜18万円"],
      ["18-25","18万〜25万円"],
      ["25-35","25万〜35万円"],
      ["35plus","35万円以上"],
      ["unknown","まだ決めていない"]
    ]},
    {key:"future",title:"これから何年くらい使いたい？",help:"長く使いたい場合はGPUとメモリに余裕のある構成を推奨します。",choices:[
      ["now","まずは今のゲームができればOK"],
      ["3years","3年程度は快適に使いたい"],
      ["5years","4〜5年、なるべく長く使いたい"],
      ["upgrade","後からパーツを交換して育てたい"]
    ]}
  ];

  const tiers = [
    { gpu:"GeForce RTX 4060 クラス", short:"RTX 4060",vram:"8GB級",cpu:"Ryzen 5 7500F / Core i5級",ram:16,ssd:"500GB〜1TB NVMe SSD",range:"約13万〜19万円台を想定",games:["VALORANT","Minecraft（バニラ）","原神","ストリートファイター6"],links:[["MXZ R5 7500F RTX4060","B0D1GLY4QL"]]},
    { gpu:"GeForce RTX 5060 クラス",short:"RTX 5060",vram:"8GB級",cpu:"Ryzen 5 / Core Ultra 5級",ram:16,ssd:"1TB NVMe SSD",range:"約15万〜22万円台を想定",games:["Apex Legends","Fortnite","原神","FINAL FANTASY XIV"],links:[["VIPRTECH Striker 4.0","B0FM4M66T8"]]},
    { gpu:"GeForce RTX 5060 Ti 16GB クラス",short:"RTX 5060 Ti 16GB",vram:"16GB版を優先",cpu:"Ryzen 5〜7 / Core Ultra 5〜7級",ram:32,ssd:"1TB NVMe SSD",range:"約20万〜30万円台を想定",games:["モンスターハンターワイルズ","ホグワーツ・レガシー","Apex Legends","Minecraft（影MOD）"],links:[["Thermaltake LCGS View u2660T","B0F97GH66Q"],["Thermaltake LCGS View 8760TS","B0FD54CDC6"]]},
    { gpu:"GeForce RTX 5070 クラス",short:"RTX 5070",vram:"12GB級",cpu:"Ryzen 7 / Core Ultra 7級",ram:32,ssd:"1〜2TB NVMe SSD",range:"約25万〜40万円台を想定",games:["Cyberpunk 2077","モンスターハンターワイルズ","ARC Raiders","FINAL FANTASY XIV"],links:[["Cooler Master NR2 Pro","B0H3Q8GJHX"],["Thermaltake LCGS View u2770S","B0GXWVB1QY"]]},
    { gpu:"GeForce RTX 5070 Ti クラス",short:"RTX 5070 Ti",vram:"16GB級",cpu:"Ryzen 7 / Core Ultra 7級",ram:32,ssd:"2TB NVMe SSD推奨",range:"約32万〜47万円台を想定",games:["Cyberpunk 2077","Microsoft Flight Simulator","黒神話：悟空","ARK: Survival Ascended"],links:[]},
    { gpu:"GeForce RTX 5080 クラス",short:"RTX 5080",vram:"16GB級",cpu:"Ryzen 7 X3D系 / Core Ultra 7級",ram:32,ssd:"2TB NVMe SSD推奨",range:"約42万円以上を想定",games:["Cyberpunk 2077","Microsoft Flight Simulator","黒神話：悟空","ARK: Survival Ascended"],links:[["Cooler Master TD5 Pro","B0H34QD7G8"]]}
  ];
  const genreLabels = {fps:"対戦FPS",aaa:"大型アクション",rpg:"RPG",sandbox:"Minecraft・サバイバル",casual:"カジュアルゲーム",sim:"シミュレーション"};
  const budgetLimits = {"under12":0,"12-18":1,"18-25":2,"25-35":3,"35plus":5,"unknown":5};
  const budgetText = {"under12":"12万円未満","12-18":"12万〜18万円","18-25":"18万〜25万円","25-35":"25万〜35万円","35plus":"35万円以上","unknown":"未定"};
  const gameSuggestions = {
    fps:["VALORANT","Fortnite","Apex Legends","Counter-Strike 2","ARC Raiders"],
    aaa:["ELDEN RING","モンスターハンターワイルズ","Cyberpunk 2077","黒神話：悟空","バイオハザード RE:4"],
    rpg:["原神","FINAL FANTASY XIV","ホグワーツ・レガシー","Starfield","崩壊：スターレイル"],
    sandbox:["Minecraft","パルワールド","ARK: Survival Ascended","Terraria","Valheim"],
    casual:["Minecraft","原神","ストリートファイター6","Stardew Valley","Hades"],
    sim:["Forza Horizon","Microsoft Flight Simulator","Cities: Skylines II","Euro Truck Simulator 2"]
  };
  function el(tag, cls, value) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (value !== undefined) node.textContent = value;
    return node;
  }
  function selected() {
    return form.querySelector('input[name="pc-choice"]:checked');
  }
  function render() {
    const q = questions[step];
    title.textContent = q.title;
    help.textContent = q.help;
    number.textContent = "質問 " + (step+1) + " / 8";
    progress.style.width = ((step+1)/8*100) + "%";
    progressBar.setAttribute("aria-valuenow", String(Math.round((step+1)/8*100)));
    error.textContent = "";
    options.replaceChildren();
    const choices = typeof q.choices === "function" ? q.choices() : q.choices;
    choices.forEach(([value,label]) => {
      const option = el("label","pc-quiz-choice");
      const input = el("input");
      input.type="radio";input.name="pc-choice";input.value=value;input.required=true;
      if(answers[step] === value) input.checked = true;
      const content = el("span","pc-choice-inner",label);
      option.append(input,content);
      options.append(option);
    });
    next.textContent = step===7?"診断結果を見る →":"次の質問へ →";
    back.disabled = step===0;
    next.disabled = !selected();
  }
  function getRequirement(a) {
    const genre = a[0],game=a[1];
    let level={fps:0,aaa:2,rpg:1,sandbox:0,casual:0,sim:2}[genre]||0;
    const gameInfo=(gamesByGenre[genre]||[]).find(v=>v[0]===game);
    if(gameInfo)level=Math.max(level,gameInfo[2]);
    if(a[2]==="wqhd") level=Math.max(level,Math.min(level+1,4));
    if(a[2]==="4k") level=Math.max(level+2,4);
    if(a[3]==="120") level+=(genre==="fps"?1:0);
    if(a[3]==="240") level+=(genre==="fps"?2:1);
    if(a[3]==="quality") level=Math.max(level,genre==="aaa"?3:level);
    if(a[4]==="stream") level=Math.max(level,2);
    if(a[4]==="heavy") level=Math.max(level,3);
    if(a[5]==="many") level=Math.max(level,2);
    if(a[5]==="extreme") level=Math.max(level,3);
    if(a[7]==="5years")level++;
    return Math.min(5,level);
  }
  function createSpecs(tierIndex,a) {
    const t=tiers[tierIndex];
    let ram=t.ram;
    if(["stream","video","heavy"].includes(a[4])||["many","extreme"].includes(a[5]))ram=Math.max(ram,32);
    if(a[4]==="heavy"&&tierIndex>=4)ram=64;
    const ssd=(a[5]==="extreme"||a[4]==="video"||a[4]==="heavy")?"2TB NVMe SSD推奨":t.ssd;
    return {ram,ssd};
  }
  function reasons(tierIndex,a,kind) {
    const t=tiers[tierIndex];
    const notes=[genreLabels[a[0]]+"向けのグラフィック性能を中心に調整しています。"];
    if(a[2]==="4k")notes.push("4KではGPU負荷が大きく、画質調整やアップスケーリングの利用も想定してください。");
    else if(a[2]==="wqhd")notes.push("WQHDでの画質とフレームレートの両立を意識した構成です。");
    if(a[3]==="240")notes.push("240fps級はゲーム設定とCPU性能、モニターの対応も重要です。");
    if(["stream","video","heavy"].includes(a[4]))notes.push("配信や制作作業と並行するため、メモリ32GB以上を推奨します。");
    if(["many","extreme"].includes(a[5]))notes.push("MODや同時起動アプリに備えてメモリとSSD容量に余裕を持たせます。");
    if(kind==="budget")notes.push("費用を抑えるため、重いゲームでは画質・fpsを下げる想定です。");
    if(kind==="premium")notes.push("新作タイトルや今後の用途拡大への余裕を重視しています。");
    return notes.join("");
  }
  function gameExamples(a,tierIndex) {
    const genre=a[0],base=gameSuggestions[genre]||[];
    // Omit very heavy games on low-tier cards, rather than implying that
    // they are suited to the user's preferred high-quality settings.
    const minimumClass = {
      "VALORANT":0,"Fortnite":0,"Apex Legends":1,
      "Counter-Strike 2":0,"ARC Raiders":2,
      "ELDEN RING":1,"モンスターハンターワイルズ":2,
      "Cyberpunk 2077":3,"黒神話：悟空":3,
      "バイオハザード RE:4":1,
      "原神":0,"FINAL FANTASY XIV":1,
      "ホグワーツ・レガシー":2,"Starfield":3,
      "崩壊：スターレイル":0,"Minecraft":0,
      "パルワールド":2,"ARK: Survival Ascended":3,
      "Terraria":0,"Valheim":1,"ストリートファイター6":0,
      "Stardew Valley":0,"Hades":0,
      "Forza Horizon":2,"Microsoft Flight Simulator":3,
      "Cities: Skylines II":3,"Euro Truck Simulator 2":0
    };
    const relevant=base.filter(g=>(minimumClass[g]??2)<=tierIndex);
    const list=Array.from(new Set([...relevant,...tiers[tierIndex].games]));
    return list.slice(0,5);
  }
  function amazonSearch(gpu,ram) {
    const q="ゲーミングPC " + gpu + " メモリ" + ram + "GB デスクトップ";
    return "https://www.amazon.co.jp/s?k="+encodeURIComponent(q)+"&tag="+amazonTag;
  }
  function productFor(tier,ram) {
    // Offer a verified existing ranking ASIN only if the model's stated GPU
    // matches the recommendation and RAM is not understated.
    const matches=tier.links.filter(([name]) => {
      // Existing ranking's RTX 5060 Ti pages do not specify GPU VRAM;
      // a 16GB-class result must search for the exact variant instead.
      if(tier.short==="RTX 5060 Ti 16GB")return false;
      if(ram<=16)return true;
      return /Thermaltake|Cooler Master/.test(name);
    });
    if(matches.length){
      const [name,asin] = matches[0];
      return {name,url:"https://www.amazon.co.jp/dp/"+asin+"?tag="+amazonTag,direct:true};
    }
    return {name:"Amazonでこの構成を検索",url:amazonSearch(tier.short,ram),direct:false};
  }
  function showResults(){
    const a=answers.slice();
    const need=getRequirement(a);
    const cap=budgetLimits[a[6]];
    const constrained=cap<need;
    // Three distinct GPU classes in every result, including strict budgets.
    // When need exceeds budget, show the realistic upgrade path explicitly.
    let indices;
    if(constrained){
      indices = cap===0 ? [0,1,Math.max(2,need)]
        : [Math.max(0,cap-1),cap,Math.max(cap+1,need)];
    }else if(need===0){
      indices=[0,1,2];
    }else if(need===5){
      indices=[3,4,5];
    }else{
      indices=[need-1,need,need+1];
    }
    const labels=["予算を抑えるなら","おすすめのバランス","性能に余裕を持つなら"];
    const kinds=["budget","recommended","premium"];
    summary.replaceChildren();
    summary.append(el("strong","",genreLabels[a[0]]+" × "+budgetText[a[6]]+" の診断結果"));
    summary.append(el("p","pc-summary-muted","8問の回答から、グラフィックボード・CPU・メモリ・SSDの3構成を比較しました。"));
    if(constrained)summary.append(el("p","pc-diag-warning","希望条件に対して予算が低めです。予算内候補では解像度・画質・fpsなどの調整が必要な場合があります。右側の上位案は予算を超える可能性があります。"));
    if(a[6]==="under12")summary.append(el("p","pc-diag-warning","12万円未満では新品の独立GPU搭載デスクトップが予算を超える場合があります。中古品や予算の引き上げも比較してください。"));
    cards.replaceChildren();
    indices.forEach((idx,n)=>{
      const t=tiers[idx],spec=createSpecs(idx,a),product=productFor(t,spec.ram);
      const card=el("article","pc-result"+(n===1?" is-recommended":""));
      card.append(el("div","pc-result-kicker",labels[n]));
      const heading=el("h3","",t.gpu);
      heading.append(el("span","",t.range));
      card.append(heading);
      const dl=el("dl","pc-result-spec");
      [["GPU",t.gpu],["VRAM",t.vram],["CPU",t.cpu],["メモリ",spec.ram+"GB"],["ストレージ",spec.ssd]].forEach(([name,value])=>{
        dl.append(el("dt","",name),el("dd","",value));
      });
      card.append(dl);
      card.append(el("p","pc-result-reason",reasons(idx,a,kinds[n])));
      card.append(el("strong","", "このクラスで検討したいゲーム例"));
      const badges=el("div","pc-example-games");
      gameExamples(a,idx).forEach(game=>badges.append(el("span","",game)));
      card.append(badges);
      const action=el("a","pc-action",product.direct?"Amazonで掲載PCを見る →":"Amazonでこのスペックを探す →");
      action.href=product.url;
      action.target="_blank";action.rel="nofollow sponsored noopener noreferrer";
      card.append(action);
      card.append(el("p","pc-shopnote",product.direct?
        "掲載商品例："+product.name+"。リンク先でGPU・メモリ・CPUの構成を確認してください。":
        "完全一致する掲載商品がないため、構成で検索します。商品や在庫は検索結果で確認してください。"));
      cards.append(card);
    });
    form.closest(".pc-quiz-card").hidden=true;
    results.hidden=false;
    results.scrollIntoView({behavior:"smooth",block:"start"});
  }

  options.addEventListener("change",()=>{error.textContent="";next.disabled=!selected();});
  back.addEventListener("click",()=>{if(step===0)return;step--;render();});
  form.addEventListener("submit",ev=>{
    ev.preventDefault();
    const choice=selected();
    if(!choice){error.textContent="回答を1つ選んでください。";return;}
    answers[step]=choice.value;
    if(step===0){answers[1]=null;}
    if(step<7){step++;render();}else showResults();
  });
  redo.addEventListener("click",()=>{
    step=0;answers.fill(null);results.hidden=true;
    form.closest(".pc-quiz-card").hidden=false;render();
    document.getElementById("diagnosis").scrollIntoView({behavior:"smooth",block:"start"});
  });
  render();
})();
