# X無料予約の初期設定

X @sukura_kunn は Buffer に接続済みの想定です。

1. Bufferの https://publish.buffer.com/settings/api で個人APIキーを発行する。
2. GitHubの https://github.com/misaokmisa-dev/multilab-guide/settings/secrets/actions で「New repository secret」を押し、名前を `BUFFER_API_KEY` として値にAPIキーを保存する。公開ファイルやチャットにキーを貼らない。
3. https://github.com/misaokmisa-dev/multilab-guide/actions/workflows/schedule-x-buffer.yml から「Run workflow」を実行し、ログに `VERIFIED` と3件が出るか確認する。
4. 毎日13時(JST)に翌日分のX予約が実行される。現状は2026-10-26と2026-10-27の計6投稿分のみ原稿を用意。以降は social/buffer_x_posts.json を更新する。リポジトリでAPIキーが未設定の場合は失敗して公開されない。

画像は公開URLを参照します。リンク先が削除された場合は投稿が失敗します。
