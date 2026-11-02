/* Minecraft World Score: store only last calculated total & grade locally.
 * No stats JSON, player names, world names, file paths or identifiers are stored.
 * localStorage is device/browser specific and may be unavailable or cleared. */
(()=>{
  "use strict";
  const KEY="mlg:minecraft:last-world-score:v1";
  const MAX=100000;
  const grades=new Set(["伝説級ワールド","大都市級ワールド","発展都市級ワールド","発展拠点級ワールド","開拓拠点級ワールド","開拓初期"]);
  const safeRecord=raw=>{
    if(!raw || raw.v!==1 || !Number.isInteger(raw.score) || raw.score<0 || raw.score>MAX)return null;
    return {score:raw.score,grade:grades.has(raw.grade)?raw.grade:"採点済み"};
  };
  function read(){
    try {return safeRecord(JSON.parse(localStorage.getItem(KEY)||"null"))}
    catch(_) {return null}
  }
  function refresh(){
    const record=read();
    for(const card of document.querySelectorAll("[data-mlg-personal-score]")){
      const score=card.querySelector("[data-mlg-score-number]");
      const grade=card.querySelector("[data-mlg-score-grade]");
      if(score)score.textContent=record?record.score.toLocaleString("ja-JP"):"--,---";
      if(grade)grade.textContent=record?record.grade:"未採点";
      card.dataset.scoreSaved=record?"true":"false";
    }
    return record;
  }
  function save(result){
    if(!result)return false;
    const score=Number(result.score);
    const grade=String(result.grade||"");
    if(!Number.isInteger(score)||score<0||score>MAX||!grades.has(grade))return false;
    try{
      localStorage.setItem(KEY,JSON.stringify({v:1,score,grade}));
      refresh();
      return true;
    }catch(_){return false}
  }
  window.mlgWorldScoreHistory={read,save,refresh};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",refresh,{once:true});
  else refresh();
  window.addEventListener("pageshow",refresh);
  window.addEventListener("storage",event=>{
    if(event.key===KEY||event.key===null)refresh();
  });
})();
