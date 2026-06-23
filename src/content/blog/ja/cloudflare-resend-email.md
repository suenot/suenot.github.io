---
title: "メールサーバーなしで独自ドメインのメールを：Cloudflareで受信、Resendで送信、そしてAIエージェントにメールを書かせる"
description: "メールサーバーをまったく使わずに、動作する you@yourdomain.com のメールボックスを一晩で組み立てる方法：無料のCloudflare Email Routingで受信してGmailに転送し、Amazon SESの上に構築されたResend APIで送信する。おまけに、API経由であなたにメールを送るClaude Codeも。なぜ受信と送信が衝突しないのか、実際のCloudflareとResendのAPI呼び出し、そして私がはまった落とし穴まで解説。"
pubDate: 2026-06-23
heroImage: "/images/blog/cloudflare-resend-hero.png"
tags: ["cloudflare", "resend", "email", "dns", "claude-code", "automation"]
draft: false
---

# メールサーバーなしで独自ドメインのメールを：Cloudflareで受信、Resendで送信、そしてAIエージェントにメールを書かせる

自前のメールサーバーを運用するのは、昔からマゾヒストの仕事だった。PostfixにDovecot、SPF、DKIM、DMARC、IPレピュテーションをめぐる終わりなき戦い、グレイリスティング、そしてVPSが「評判の悪い」アドレス帯にあるというだけでGmailのスパムフォルダに落ちること。大手プロバイダーが標準で提供してくれるものを得るために、何十時間も費やすことになる。

朗報がある。よくあるシナリオ——「`you@mydomain` が欲しい、メールはGmailに届いて、自分のドメインから送信できればいい」——のためなら、メールサーバーはまったく必要ない。受信と送信は、それぞれの半分の仕事をあなたが手作業でやるよりうまくこなす2つのサービスを貼り合わせるだけで実現でき、しかもほぼ無料だ。そして送信は1回のHTTPリクエストに帰着するので、ターミナルのAIエージェントですらあなたにメールを送れる。

## 鍵となる発想：受信と送信は別々のレコード

たくさんの苦労から救ってくれる気づきはこれだ。**受信と送信は別々のDNSレコードに存在し、互いに干渉しない。**

- **受信** はルートドメインの **MXレコード** で決まる。これが世界に向けて「`@mydomain` 宛のメールはここへ」と伝える。
- **送信** は **DKIM署名** とメッセージのエンベロープ（MAIL FROM）に書かれている内容で決まり、これは別のサブドメインに切り出せる。

だからこの組み合わせは衝突せずに機能する：

| | 担当するもの | DNS上の置き場所 |
|---|---|---|
| **受信**（Cloudflare） | MX → `route1/2/3.mx.cloudflare.net` | ルートドメイン |
| **送信**（Resend） | DKIM `resend._domainkey`、`send` サブドメインのMX+SPF | サブドメイン、ルートのMXには触れない |

受信がルートのMXを取り、送信は `send.mydomain` サブドメインに収まってルートには一切手を出さない。両方を同時に有効化できる——まさにこれからそうする。

## 受信：Cloudflare Email Routing

[Cloudflare Email Routing](https://developers.cloudflare.com/email-routing/) は無料のサービスだ。`you@mydomain` のようなアドレスを取得し、それらを既存の任意のメールボックス（たとえばGmail）へ転送するルールを定義する。ストレージもIMACもなく、MXレベルでの純粋な転送だ。唯一の要件：ドメインがCloudflare上で（そのNSで）配信されていること。

やることはこうだ：

1. **Email Routingを有効化する。** ダッシュボード → ドメイン → **Email Routing → Enable**。Cloudflareが自身のMXとSPFを追加し、それらを自分の管理下で「ロック」する。
2. **転送先アドレスを検証する。** `you@gmail.com` を入力すると、Cloudflareがそこへ確認リンクをメールするので、それをクリックする。これをしないと転送は有効にならない。
3. **ルールを作成する。** 特定のもの（`you@mydomain` → `you@gmail.com`）か、キャッチオール（ドメインに届くすべて → あなたのGmail）のどちらか。

転送先アドレスはアカウント全体で共有される。`you@gmail.com` を一度検証すれば、すべてのドメインで使えるようになる。

### APIで自動化できること、できないこと

ここで最初の正直な落とし穴だ。ルールとアドレスはAPIで完璧に自動化できる：

```bash
# Rule: you@yourdomain.com -> you@gmail.com
curl -sS -X POST \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/email/routing/rules" \
  --data '{
    "name": "forward you@ -> gmail",
    "enabled": true,
    "matchers": [{ "type": "literal", "field": "to", "value": "you@yourdomain.com" }],
    "actions":  [{ "type": "forward", "value": ["you@gmail.com"] }]
  }'
```

キャッチオール（届くものを文字どおりすべて転送する）：

```bash
curl -sS -X PUT \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/email/routing/rules/catch_all" \
  --data '{
    "enabled": true,
    "matchers": [{ "type": "all" }],
    "actions":  [{ "type": "forward", "value": ["you@gmail.com"] }]
  }'
```

しかし **Email Routing自体を有効化するのは、APIトークンではできない。** `/email/routing`（設定）と `/email/routing/enable` のエンドポイントは、考えうる最も広い権限セット——Email Routing Rules、Email Routing Addresses、DNS、ZoneをすべてEditに——を持つトークンでさえ `Authentication error` を返す。あの最初のスイッチは、通常のAPIトークンには付与できないロールでガードされている。これはダッシュボードで手作業で切り替える。それ以外のすべて——ルール、アドレス、DNSのクリーンアップ——はきれいに自動化できる。

残りの自動化のために、トークンには次が必要だ：**Zone:Read**、**DNS:Edit**、**Email Routing Rules:Edit**（zone）、**Email Routing Addresses:Edit**（account）。

### ドメインにすでにメールがあった場合

2つ目の落とし穴：ルートにすでにMXレコードがある場合（たとえばレジストラの転送）、Cloudflareは有効化時に正直にこう告げる：*「Existing non-Cloudflare MX records conflict with Email Routing.」* 古いMXは消す必要がある。トークンにはDNS:Editがあるので、リクエストで削除し、ついでに他所製のルートSPFも掃除して重複を残さないようにしよう（ルートには正しいSPFレコードがちょうど1つだけあるべきだ）：

```bash
# get the record id: GET .../dns_records?type=MX&name=yourdomain.com
curl -sS -X DELETE \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID"
```

その後、オンボーディングが通り、Cloudflareが自身のMXをインストールし、転送が動き出す。

## 送信：Amazon SESの上のResend

受信は完了。次は、メールがスパムに落ちないよう、自分のドメイン **から** 送信する。[Resend](https://resend.com) はAmazon SESの上に構築されたメール送信APIで、生のSESの代わりに人間向けのDXを備えている。まずドメインを検証し、その後はメッセージごとに1リクエストだ。

ドメインを追加すると、Resendは3組のレコードを渡してくる。そして **どこに** 置くかが重要だ：

- **DKIM** — 公開鍵（`p=MIGf...`）を持つ `resend._domainkey.mydomain` のTXTレコード。署名は **ルート** ドメイン（`d=mydomain`）から来る。
- **MAIL FROM** — **サブドメイン** `send.mydomain` のMXとSPF（`feedback-smtp.<region>.amazonses.com` と `v=spf1 include:amazonses.com ~all`）。これがメッセージのエンベロープだ。
- **DMARC** — `_dmarc.mydomain` のTXTレコード（`v=DMARC1; p=none;`）、まずはモニタリングモードで。

注目してほしい：これらのレコードはどれも **ルートのMXを取らない**。だからResendの送信とCloudflareの受信は1つのドメイン上で共存できる。さらに良いことに、DMARCは **DKIMアラインメント** のおかげでパスする：署名はルートにあり（`d=mydomain` が `From` のドメインと一致する）、ルートのSPFがamazonsesではなくCloudflareを指していても、メッセージは有効なままだ。鍵となるルール：受信を設定するとき、`send.*`、`resend._domainkey`、`_dmarc` には **触れない** こと。

送信そのものは1回のPOSTだ：

```bash
curl -sS https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  --data '{
    "from": "You <you@yourdomain.com>",
    "to": ["you@gmail.com"],
    "subject": "Hi from your own domain",
    "text": "Sent through Resend, delivered through Cloudflare."
  }'
```

`from` は検証済みのドメインでなければならない——ローカル部（`you`、`noreply`、`billing`、何でも）はあなたの自由だ。Resendには無料枠があり、個人用とトランザクションメールには十分すぎるほどだ（現在の上限は [resend.com/pricing](https://resend.com/pricing) にある）。

## おまけ：AIエージェントがメールを送る

そしてこれが、すべての目的だった。送信はBearerトークン付きの単なるHTTPリクエストなので、**鍵を持つ者なら誰でも送信できる**——あなたのコーディングエージェントを含めて。

本当に時間を節約してくれるシナリオ：[Claude Code](https://claude.com/claude-code) で長いタスク——マイグレーション、テスト実行、ビルド——を走らせ、コーヒーを取りに行き、終わったらエージェントが **結果を自分であなたにメールしてくれる**。ターミナルを見つめて待つ必要はない。

エージェントに普通の言葉でこう伝えるだけでいい：*「終わったら、Resend API経由で you@gmail.com にメールして」*——するとエージェントは上とまったく同じ `curl` を実行し、意味のある件名と本文を埋めてくれる：

```bash
curl -sS https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  --data '{
    "from": "Claude Code <bot@yourdomain.com>",
    "to": ["you@gmail.com"],
    "subject": "Build is ready: 142 tests green",
    "text": "Migration applied, the run took 8 minutes, nothing failed. Log in the artifacts."
  }'
```

さらに進めて、Claude Codeの **Stopフック** に送信を組み込むこともできる——そうすれば「セッション終了」の通知が、プロンプトに一言も書かなくても自動でメールで届く。エージェントからあなたへの、シンプルで信頼できる通知チャネルが手に入る——Telegramボットもwebhookも要らず、ただのメールだけで。

## 落とし穴（苦労して集めたもの）

- **Email Routingの有効化はダッシュボード限定。** APIトークンでは、メール権限をフルに持っていてもできない。ドメインごとに手動で1クリック。
- **衝突するMXは削除しなければならない**——有効化の前に。さもないとオンボーディングが通らない。
- **ルートのMXは1つ——受信者も1つ。** 受信をCloudflareとResend Inboundの両方に同時に渡すことはできない：どちらもルートのMXを欲しがる。ちなみにResend Inboundはそもそも「メールボックスへ転送」ではない——webhookへの配信で、プログラム的処理のためのものであり、Gmailで読むためのものではない。
- **転送先はメール内のリンクをクリックして確認する。** これを回避する方法はない——他人のメールボックスへ転送することへの保護だ。
- **受信はResendの送信を壊さない**——`send.*`、`resend._domainkey`、`_dmarc` に触れない限り。受信の有効化が追加するのはルートのMXとSPFだけだ。

## まとめ

たった一晩で、メールサーバーなしで、ほぼ無料で：

- `you@mydomain` がメールを受信し、Gmailに転送する（Cloudflare Email Routing）；
- 適切な配信性を保って `you@mydomain` から送信できる（SESの上のResend）；
- 受信と送信は衝突しない、別々のDNSレコードに収まっているから；
- そしてあなたのAIエージェントは、仕事を終えたとき自分であなたの受信箱に書き込める。

「独自ドメインのメール」がPostfixとの何週間もの格闘を意味した時代は終わった。今やそれは、2つのサービスと、ひと握りのDNSレコードと、いくつかのcurlリクエストだ。

---

*追伸：これはスペクトラムの最もシンプルな端だった——受信メールは単にGmailに落ちるだけ。もし逆を望むなら——受信メールを処理し、読み、解析し、自分で返信を書くコードが欲しいなら——[cloudflare/agentic-inbox](https://github.com/cloudflare/agentic-inbox) を見てみるといい：AIエージェントを備えたセルフホスト型のメールクライアントで、すべてCloudflare Workers上で動く。そこでも受信はEmail Routing経由（Workerへのキャッチオール）、ストレージはDurable ObjectsとR2、エージェントはWorkers AI上で動いて返信を下書きする。この記事と同じ土台で、ただメールボックスへ転送する代わりに、エージェントが駆動する完全な受信箱が手に入るだけだ。*
