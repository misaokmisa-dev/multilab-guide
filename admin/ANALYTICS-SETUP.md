# MULTI LAB GUIDE 広告・アフィリエイト管理画面

## 管理画面
https://multilab-guide.mlguide.workers.dev/admin/affiliate-report.html

このHTML/JSは公開配信されますが、実績データはブラウザ内で読み込み、サイトのサーバーには送信しません。Cloudflareの集計APIは専用トークンで保護します。管理トークンをGitHubに書かないでください。

## 現在可能なこと
- Amazonアソシエイト、A8.net、Adsterra、忍者AdMax、およびその他の媒体を一画面で集計
- 正式な日別CSV/TSVの読み込み（媒体選択→ファイル取り込み）
- 表示・クリック・CTR・発生報酬・確定報酬を期間別に表示
- レポートを手入力して追記
- セッションの終了時にはデータが消えるので、必要なら集計CSVとして書き出し
- 正式な報酬レポートがない項目は「—」表示（収益を推測しない）

## Cloudflareの計測を有効にするための設定
GitHubへのソース追加は済んでいますが、Cloudflareの現在のデプロイは静的ファイルのみを配信しており /api/affiliate-summary は404です。次の設定を Cloudflare 側で適用する必要があります。

1. Cloudflare Workersのプロジェクト `multilab-guide` を開く。
2. Git連携のビルド・デプロイコマンドを確認し、`npx wrangler@latest deploy --config wrangler.jsonc` で `worker/affiliate-analytics.js` をエントリポイントとしてデプロイする。Cloudflare側の設定が異なる場合は、既存の正常なサイト配信を保ちながら変更する。
3. Workerの「Settings → Variables and Secrets」で `MLG_ADMIN_TOKEN` という Secret を登録（英数字ランダム32文字以上。値はGitHub・サイトに掲載しない）。
4. `wrangler.jsonc` には `MLG_EVENTS` の Analytics Engine と `MLG_SQL` の Analytics SQL の binding を用意済み。デプロイで有効化される。Analytics SQL は Wrangler 4.145.0 以降が必要。
5. `/api/affiliate-event` の GET は405、`/api/affiliate-summary` の認証なしGETは401になることを確認する（404ならWorkerが反映されていない）。
6. 管理画面で `MLG_ADMIN_TOKEN` を入力し、「アクセス・クリックを更新」を押す。

Cloudflare Analytics Engine はサイトのページ表示、アフィリエイトリンクの画面内表示、クリックをCookieなしで記録します。ASP広告iframe内のクリックは記録できません。サーバ側に個人名・IP・クエリ文字列・Cookieなどを集めない設計です。

## 集計ソースの注意
- AmazonやA8.net: 実際の報酬は各管理画面の発生・確定データをCSVで取得する（サイト内クリックだけで成約・報酬は分からない）。
- Adsterraや忍者AdMax: iframe等で配信される広告のインプレッション・クリック・報酬は各社管理画面の数値を利用する。
- サイト内CTR: `サイト側クリック ÷ アフィリエイトリンクが画面に表示された回数 × 100`
- ASPレポート上のCTR: `広告会社のクリック ÷ 広告会社の表示回数 × 100`。計測方式が異なるため同じ数字にならない場合がある。
- 他のASPを含め、ログインできる公式API連携が用意されるまでは、自動収益同期を行わない。

## CSVのシンプルな書式
```csv
date,provider,impressions,clicks,gross_yen,confirmed_yen
2026-10-26,amazon,200,9,450,400
2026-10-26,a8,140,12,600,300
```

この数値は形式を説明する架空の例で、実績ではありません。実際の収益は必ず公式レポートから取り込んでください。
