/* 契約済みの広告を設定してください。未設定時は実際の広告を表示しません。 */
window.MULTILAB_ADS = {
  adsterraEnabled: true, // ユーザー提供のAdsterra広告を設置
  popunderEnabled: false, // ブラウザ別タブ広告は安全性・ASP規約を確認してから
  smartlinkEnabled: false, // 自動転送禁止
  adsenseClient: "", // AdSense の ca-pub-...。承認後に設定
  adsenseSlots: { inline: "", bottom: "" }, // 手動広告枠（任意）
  gameCampaigns: [
    // { title:"ゲーム名", description:"アニメ系RPG", image:"https://広告主の画像", url:"https://成果計測リンク" }
  ],
  videoCampaign: null
  // 例 { title:"ゲーム名", video:"https://許諾済み動画.mp4", poster:"https://許諾済み画像.jpg", url:"https://成果計測リンク" }
};
