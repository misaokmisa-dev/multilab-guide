/* MULTI LAB GUIDE — device discovery + comparison, 2026-11-02.
   Enhances already published ranking data; no live prices or test results are inferred. */
(() => {
  'use strict';
  const page = location.pathname.split('/').filter(Boolean).pop() || 'index.html';
  const isHub = location.pathname.endsWith('/devices/') || page === 'index.html';
  const meta = {
    'gaming-pc.html': {name:'ゲーミングPC',fields:['CPU','GPU','メモリ']},
    'gaming-laptop.html': {name:'ゲーミングノートPC',fields:['CPU','GPU','メモリ','画面Hz']},
    'monitors.html': {name:'ゲーミングモニター',fields:['サイズ','解像度','Hz','タイプ']},
    'mice.html': {name:'ゲーミングマウス',fields:['重量','接続','特長']},
    'keyboards.html': {name:'ゲーミングキーボード',fields:['配列','サイズ','スイッチ','機能','タイプ']},
    'audio.html': {name:'ヘッドセット・イヤホン',fields:['接続','特長','マイク']}
  };
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const funnel = (name,href,label,cls='') => '<a class="'+esc(cls)+'" href="'+esc(href)+'" data-mlg-funnel="'+esc(name)+'">'+esc(label)+'</a>';

  function diagnosisBanner(forHub){
    const element = document.createElement('section');
    element.className = forHub ? 'mlg-diagnosis-callout' : 'mlg-rank-pick';
    element.setAttribute('aria-label','ゲーミングPCスペック無料診断');
    if(forHub){
      element.innerHTML = '<div><span class="mlg-guide-kicker">✦ 無料・登録不要 ✦ PC SPEC DIAGNOSIS</span><h2>あなたに必要なPCスペック、8問でわかる！</h2><p>遊びたいゲーム・予算・配信・MODなどを選択するだけ。おすすめのGPU・CPU・メモリを3構成で比較できます。</p><div class="mlg-diagnosis-badges"><span>8問で診断</span><span>完全無料</span><span>おすすめ構成を3案表示</span></div></div><div class="mlg-diag-actions">'+funnel('device-top-to-pc-diagnosis','pc-diagnosis.html#diagnosis','無料でPC診断を始める →','mlg-diag-primary')+funnel('device-top-to-pc-ranking','gaming-pc.html','診断せずにPCランキングを見る','mlg-diag-secondary')+'</div>';
    }else{
      element.innerHTML = '<span class="mlg-guide-kicker">✦ PCの選び方に迷ったら</span><h2>どのスペックを買えばいい？ 8問で無料診断</h2><p>ゲーム・予算・MOD・配信から、必要なGPU・CPU・メモリを選びます。</p>'+funnel('device-ranking-to-pc-diagnosis','pc-diagnosis.html#diagnosis','自分に合うPCスペックを診断する →','mlg-diag-primary');
    }
    return element;
  }

  const purposes = [
    {title:'ゲーミングPCを買いたい',hint:'性能・価格・スペック',heading:'まずはPC本体を比較',desc:'家でゲームを楽しむならデスクトップPC。必要な性能がわからない場合は無料の8問診断から選べます。',links:[['ゲーミングPC TOP10','gaming-pc.html','purpose-to-pc'],['8問のPCスペック診断','pc-diagnosis.html#diagnosis','purpose-to-diagnosis']]},
    {title:'持ち運べるPCが欲しい',hint:'学校・外出先・省スペース',heading:'ゲーミングノートPCを比較',desc:'持ち運びや設置スペースも考えながら、GPU・CPU・画面のリフレッシュレートを見比べましょう。',links:[['ノートPC TOP10','gaming-laptop.html','purpose-to-laptop'],['スペックを無料診断','pc-diagnosis.html#diagnosis','purpose-laptop-to-diagnosis']]},
    {title:'FPSをもっと快適に',hint:'対戦ゲーム・高Hz・軽量',heading:'モニターとマウスを見直す',desc:'滑らかな映像にはリフレッシュレート、素早い操作にはマウスの重量・接続方式を比較。PC側のfpsも合わせて確認。',links:[['モニター比較表','monitors.html#mlg-compare','purpose-fps-to-monitors'],['マウス比較表','mice.html#mlg-compare','purpose-fps-to-mice']]},
    {title:'映像をきれいに見たい',hint:'解像度・大画面・Hz',heading:'画質と画面サイズで選ぶ',desc:'FHD・WQHDなどの解像度、画面サイズ、Hzを比べて、遊ぶゲームやPCに合うモニターを探せます。',links:[['モニター TOP10','monitors.html','purpose-visual-to-monitors'],['PCスペックを確認','pc-diagnosis.html#diagnosis','purpose-visual-to-diagnosis']]},
    {title:'操作性を改善したい',hint:'キーボード・マウス',heading:'入力デバイスを比較',desc:'マウスの重さ・接続、キーボードのサイズ・スイッチ・機能を比較して、自分の操作スタイルに合うものを検討。',links:[['マウス TOP10','mice.html','purpose-input-to-mice'],['キーボード TOP10','keyboards.html','purpose-input-to-keyboards']]},
    {title:'音・ボイスチャットを改善',hint:'ヘッドセット・イヤホン',heading:'音声デバイスを選ぶ',desc:'接続方式やマイクの有無、遅延の特徴を比べて、ゲーム・通話の使い方に合う製品を探せます。',links:[['音声デバイス TOP10','audio.html','purpose-audio-to-headsets'],['周辺機器も見る','extras.html','purpose-audio-to-extras']]},
    {title:'机まわりを整えたい',hint:'マイク・スタンド・周辺機器',heading:'周辺機器とPC環境を整える',desc:'配信や作業環境の改善に必要な周辺機器を、設置スペースや接続方法から整理しましょう。',links:[['周辺機器ガイド','extras.html','purpose-desk-to-extras'],['キーボード比較','keyboards.html','purpose-desk-to-keyboards']]}
  ];
  function makePurpose(){
    const s = document.createElement('section');
    s.className='dv-wrap mlg-purpose';
    s.id='purpose';
    s.setAttribute('aria-labelledby','mlg-purpose-title');
    s.innerHTML='<span class="mlg-guide-kicker">目的から探す / CHOOSE YOUR GOAL</span><h2 id="mlg-purpose-title">何を改善したい？ 目的からデバイスを選ぶ</h2><p>まだ商品が決まっていなくても大丈夫。気になる使い方を押すと、比較すべきカテゴリがすぐにわかります。</p><div class="mlg-purpose-options" role="group" aria-label="デバイスを探す目的">'+purposes.map((p,i)=>'<button type="button" class="mlg-purpose-button" data-index="'+i+'" aria-pressed="'+(i===0?'true':'false')+'"><strong>'+esc(p.title)+'</strong><small>'+esc(p.hint)+'</small></button>').join('')+'</div><div class="mlg-purpose-result" id="mlg-purpose-result" aria-live="polite"></div>';
    const result=s.querySelector('#mlg-purpose-result');
    const buttons=[...s.querySelectorAll('button[data-index]')];
    function show(i){
      const p=purposes[i];if(!p)return;
      buttons.forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));
      result.innerHTML='<div><h3>'+esc(p.heading)+'</h3><p>'+esc(p.desc)+'</p></div><div class="mlg-purpose-links">'+p.links.map(a=>funnel(a[2],a[1],a[0]+' →')).join('')+'</div>';
    }
    buttons.forEach(b=>b.addEventListener('click',()=>show(Number(b.dataset.index))));
    show(0);
    return s;
  }
  function hub(){
    const hero=document.querySelector('main .dv-hero');
    const categories=document.querySelector('#categories');
    if(!hero||!categories||document.querySelector('.mlg-purpose'))return;
    const old=document.querySelector('section[aria-label="ゲーミングPCスペック診断"]');
    if(old)old.remove(); // Retains old markup as no-JS fallback.
    hero.after(diagnosisBanner(true));
    categories.before(makePurpose());
  }
  function specs(card){
    const values={};
    card.querySelectorAll('.rank-feature-row').forEach(row=>{
      const k=row.querySelector('dt')?.textContent.trim();
      const v=row.querySelector('dd')?.textContent.trim();
      if(k&&v)values[k]=v;
    });
    return values;
  }
  function suited(file,sp){
    const field=n=>sp[n]||'';
    const gpu=field('GPU').toUpperCase(),mem=parseInt(field('メモリ'),10)||0;
    if(file==='gaming-pc.html'){
      if(/RTX\s*(5090|5080|5070|4090|4080|4070)/.test(gpu)&&mem>=32)return '高性能GPUと32GB以上のメモリを候補にし、ゲーム以外の作業や配信も考えている人。';
      if(/RTX\s*(5090|5080|5070|4090|4080|4070)/.test(gpu))return 'GPU性能を重視し、遊ぶゲームの推奨環境と予算を照らし合わせたい人。';
      if(/RTX\s*(3050|3060|4050)/.test(gpu))return '画質設定や予算のバランスを考えながら、初めてのゲーミングPCを選びたい人。';
      if(mem>=32)return 'メモリ容量も重視し、複数のアプリを使う予定がある人。';
      return 'CPU・GPU・メモリの構成を比べ、用途に合うデスクトップPCを選びたい人。';
    }
    if(file==='gaming-laptop.html'){
      if(mem>=32)return 'ゲームと複数アプリの併用を想定し、メモリ容量にも余裕を求める人。';
      const hz=parseInt(field('画面Hz'),10)||0;
      if(hz>=165)return '持ち運びやすさに加えて、高リフレッシュレートの画面を重視する人。';
      if(gpu)return '専用GPU搭載のノートPCを、CPUや画面仕様も合わせて比較したい人。';
      return '設置スペースと性能のバランスを考えてノートPCを選びたい人。';
    }
    if(file==='monitors.html'){
      const type=field('タイプ'),hz=parseInt(field('Hz'),10)||0,res=field('解像度').toUpperCase();
      if(/モバイル/.test(type))return 'サブ画面や持ち運べるディスプレイを探している人。';
      if(hz>=240)return '対戦ゲームなどで高リフレッシュレートを優先したい人。';
      if(/QHD|WQHD|4K|UHD/.test(res))return 'フルHDより広い作業領域や高解像度を重視したい人。';
      if(hz>=120)return '標準的な60Hzより滑らかな表示を求め、画面サイズと価格も比べたい人。';
      return '解像度・サイズ・接続端子のバランスを重視する人。';
    }
    if(file==='mice.html'){
      const w=parseFloat(field('重量'))||0,conn=field('接続'),feature=field('特長');
      if(w>0&&w<=65)return '軽量さを優先し、手の動かしやすさを重視する人。';
      if(/エルゴ|人間工学/.test(feature))return '手になじむ形状を優先し、握りやすさを比較したい人。';
      if(/ワイヤレス|無線/.test(conn))return 'ケーブルを気にせず、デスクまわりをすっきり使いたい人。';
      return '重量・形状・接続方式を見比べてマウスを選びたい人。';
    }
    if(file==='keyboards.html'){
      const f=Object.values(sp).join(' ');
      if(/ラピッドトリガー/.test(f))return 'ラピッドトリガー対応を優先して検討したい人。';
      if(/テンキーレス|75%|60%|65%/.test(f))return 'テンキーなしの配置で、マウス操作のスペースを確保したい人。';
      if(/左手用/.test(f))return 'ゲーム操作向けの左手用入力デバイスを探している人。';
      if(/日本語/.test(f))return '日本語配列の使いやすさを重視したい人。';
      return 'キー配列やスイッチの特徴を比べて選びたい人。';
    }
    if(file==='audio.html'){
      const f=Object.values(sp).join(' ');
      if(/低遅延/.test(f))return 'ゲーム中の音の遅れを抑える接続方式を重視したい人。';
      if(/完全ワイヤレス|ワイヤレス|無線/.test(f))return 'ケーブルを減らしてゲームや通話を楽しみたい人。';
      if(/マイク.*あり/.test(f)||field('マイク')==='あり')return 'ボイスチャット用にマイク付きモデルを比較したい人。';
      if(/有線/.test(f))return '充電を気にせず使える有線タイプを探している人。';
      return '装着感・接続・マイクなどを比べて音響機器を選びたい人。';
    }
    return '掲載されている仕様を確認して、自分の使い方と比較したい人。';
  }
  function compare(file,cards){
    const config=meta[file],section=document.createElement('section');
    section.className='mlg-compare';
    section.id='mlg-compare';
    section.setAttribute('aria-labelledby','mlg-compare-title');
    const rows=cards.map((card,i)=>{
      const name=card.querySelector('.rank-product-title')?.textContent.trim()||'商品 '+(i+1);
      const sp=specs(card);
      const rawPrice=card.querySelector('.rank-price-number')?.textContent.trim()||'掲載なし';
      const price=card.querySelector('[data-price-kind="comparison"]') ? rawPrice+'（国内別モデル）' : rawPrice;
      const cells=config.fields.map(field=>'<td>'+esc(sp[field]||'—')+'</td>').join('');
      return '<tr'+(i>=5?' hidden':'')+'><th scope="row" class="mlg-compare-item"><small>'+esc(i+1)+'位</small>'+esc(name)+'</th>'+cells+'<td class="mlg-compare-price">'+esc(price)+'</td><td><a class="mlg-compare-detail" href="#mlg-product-'+(i+1)+'" data-mlg-funnel="compare-to-product-'+(i+1)+'">詳細を見る ↓</a></td></tr>';
    }).join('');
    section.innerHTML='<div class="mlg-compare-head"><div><span class="mlg-guide-kicker">SPEC COMPARISON / '+esc(config.name)+'</span><h2 id="mlg-compare-title">人気TOP10をスペックでまとめて比較</h2></div><a href="#ranking">商品の詳細・画像は下のランキングへ ↓</a></div><div class="mlg-compare-scroll" role="region" aria-label="'+esc(config.name)+'の商品比較表" tabindex="0"><table class="mlg-compare-table"><caption>'+esc(config.name)+'のランキング掲載10商品比較</caption><thead><tr><th scope="col">順位・商品</th>'+config.fields.map(f=>'<th scope="col">'+esc(f)+'</th>').join('')+'<th scope="col">掲載価格・国内参考例</th><th scope="col">詳細</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+(cards.length>5?'<button type="button" class="mlg-compare-more" aria-expanded="false">残り'+(cards.length-5)+'商品も比較する ↓</button>':'')+'<p class="mlg-compare-note">価格はサイト掲載の参考価格です。ゲーミングPC欄の「国内別モデル」はランキング掲載商品ではなく、CPU・GPUなどの近い別商品を使った価格の参考例です。Amazonの現在価格・在庫ではありません。購入前にリンク先の商品名・仕様を必ずご確認ください。</p>';
    const btn=section.querySelector('.mlg-compare-more');
    if(btn)btn.addEventListener('click',()=>{
      const expanded=btn.getAttribute('aria-expanded')==='true';
      section.querySelectorAll('tbody tr:nth-child(n+6)').forEach(row=>row.hidden=expanded);
      btn.setAttribute('aria-expanded',String(!expanded));
      btn.textContent=expanded?'残り'+(cards.length-5)+'商品も比較する ↓':'上位5商品の表示に戻す ↑';
    });
    return section;
  }
  function rank(){
    const heading=document.querySelector('.ranking-content #ranking');
    const cards=[...document.querySelectorAll('.rank-list > article.rank-item')];
    if(!heading||cards.length===0||!meta[page]||document.querySelector('#mlg-compare'))return;
    cards.forEach((card,i)=>{
      if(!card.id)card.id='mlg-product-'+(i+1);
      if(card.querySelector('.mlg-suited'))return;
      const p=document.createElement('div');
      p.className='mlg-suited';
      const reason=suited(page,specs(card));
      p.innerHTML='<strong>こんな人におすすめ</strong><p>'+esc(reason)+'</p>';
      const detail=card.querySelector('.rank-details');
      const features=detail?.querySelector('.rank-feature-list');
      if(features)features.after(p);else if(detail)detail.append(p);
    });
    if(page==='gaming-pc.html'||page==='gaming-laptop.html')heading.before(diagnosisBanner(false));
    heading.before(compare(page,cards));
  }
  const run=()=>{
    if(isHub)hub();else rank();
    // Anchors generated after DOM parsing need an explicit initial scroll.
    if(/^#mlg-(?:compare|product-\d+)$/.test(location.hash)){
      requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView({block:'start'}));
    }
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
