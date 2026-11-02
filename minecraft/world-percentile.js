/* Compare a saved World Score with the last 90 days of anonymous score submissions.
 * This is NOT a distinct-player/world leaderboard. The API may return sampled data. */
(()=>{
  'use strict';
  const endpoint='/api/world-score-percentile?score=';
  const fmt=n=>Math.round(n).toLocaleString('ja-JP');
  const topLabel=p=>p<1?'1％未満':fmt(Math.round(p))+'％';
  const validScore=n=>Number.isSafeInteger(n)&&n>=0&&n<=100000;
  let resultRequestId=0;

  async function lookup(score){
    if(!validScore(score))throw Error('invalid score');
    const response=await fetch(endpoint+score,{
      method:'GET',credentials:'same-origin',headers:{accept:'application/json'},cache:'no-store'
    });
    const data=await response.json();
    if(!response.ok||!data||!['ready','insufficient'].includes(data.status))
      throw Error('percentile data unavailable');
    return data;
  }

  function updateResult(value,note,state){
    const card=document.getElementById('wd-percentile');
    if(!card)return;
    card.dataset.state=state;
    const main=document.getElementById('wd-percentile-value');
    const caption=document.getElementById('wd-percentile-note');
    if(main)main.textContent=value;
    if(caption)caption.textContent=note;
  }
  async function showResult(score){
    const id=++resultRequestId;
    updateResult('他のワールドと比較中…','直近90日の匿名採点データと照合しています','loading');
    try{
      const data=await lookup(score);
      if(id!==resultRequestId)return;
      if(data.status==='ready'&&Number.isFinite(data.topPercent)){
        updateResult('あなたは上位約'+topLabel(data.topPercent)+'です',
          '直近90日・採点結果 約'+fmt(data.submissions)+'件と比較（重複投稿を含む場合があります）','ready');
      }else{
        updateResult('点数比較データを集計中',
          '比較可能な採点結果が10件以上集まると表示します（現在 約'+fmt(data.submissions)+'件）','insufficient');
      }
    }catch(_){
      if(id===resultRequestId)updateResult('現在、比較結果を取得できません',
        '採点点数は有効です。しばらくしてから再度採点すると比較できます','unavailable');
    }
  }
  async function showHome(){
    const node=document.querySelector('[data-mlg-percentile-home]');
    if(!node)return;
    const saved=window.mlgWorldScoreHistory?.read();
    if(!saved||!validScore(saved.score)){node.textContent='';return}
    node.textContent='比較結果を確認中…';
    try{
      const data=await lookup(saved.score);
      if(!window.mlgWorldScoreHistory||window.mlgWorldScoreHistory.read()?.score!==saved.score)return;
      if(data.status==='ready'&&Number.isFinite(data.topPercent)){
        node.textContent='直近90日 上位約'+topLabel(data.topPercent);
      }else{
        node.textContent='比較データ集計中';
      }
    }catch(_){node.textContent=''}
  }
  window.mlgWorldPercentile={showResult,showHome};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',showHome,{once:true});
  else showHome();
})();
