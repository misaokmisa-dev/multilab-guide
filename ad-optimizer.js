/* MULTI LAB GUIDE: 各ページの実広告枠を無理に増殖させず配置を最適化 */
(() => {
  "use strict";
  function init() {
    const main=document.querySelector("main");
    if(!main || !window.MULTILAB_ADS?.adsterraEnabled) return;
    const ads=[...main.querySelectorAll(".as-slot")];
    const isRanking=document.body.classList.contains("ranking-page");
    const isHub=document.body.classList.contains("device-hub") ||
      document.body.classList.contains("ml-body") && (/\/minecraft\/?$/.test(location.pathname) || /\/minecraft\/mods\/?$/.test(location.pathname)) ||
      /^(\/|\/index\.html)$/.test(location.pathname);
    const top=ads.find(x=>x.classList.contains("as-top"));
    const inline=ads.find(x=>x.classList.contains("as-inline"));
    const bottom=ads.find(x=>x.classList.contains("as-bottom"));

    // TOPは728×90と300×250の二種類の正式タグを大きな余白なしに横並び。
    // 728を2カラム分、300を1カラム分にする3カラムのレスポンシブグリッド。
    if(isHub && top && inline && top.parentElement===main) {
      const row=document.createElement("div");
      row.className="as-top-mosaic";
      row.setAttribute("aria-label","広告掲載エリア");
      main.insertBefore(row,top);
      row.append(top,inline);
    }
    if(isRanking) {
      const products=[...main.querySelectorAll("article.rank-item")];
      if(products.length>=3 && inline)products[2].after(inline);
      if(products.length>=6 && bottom)products[5].after(bottom);
      // 9位の後は別の広告ユニットや許諾済みクリエイティブが登録された場合のみ掲載。
      const extra=(window.MULTILAB_ADS.gameCampaigns||[]).find(c=>c?.url&&c?.image);
      if(products.length>=9 && extra) {
        const safe=url=>{try{return new URL(url).protocol==="https:"}catch{return false}};
        if(safe(extra.url)&&safe(extra.image)){
          const aside=document.createElement("aside");aside.className="as-game-inline";
          const label=document.createElement("small");label.textContent="広告";aside.appendChild(label);
          const link=document.createElement("a");link.href=extra.url;link.target="_blank";link.rel="nofollow sponsored noopener noreferrer";
          const img=document.createElement("img");img.src=extra.image;img.alt=extra.title||"ゲーム広告";img.loading="lazy";link.appendChild(img);
          aside.appendChild(link);products[8].after(aside);
        }
      }
    } else if(!isHub && inline) {
      // 商品以外の長めのガイドは導入の直後ではなく本文内に挟む。
      const sections=[...main.querySelectorAll(":scope > section")].filter(x=>!x.classList.contains("as-slot"));
      if(sections.length>=3) sections[1].after(inline);
    }


    // Network ad frames self-manage their visibility. Do not hide active lazy slots.
  
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
