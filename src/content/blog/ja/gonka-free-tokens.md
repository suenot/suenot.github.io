---
title: "Gonka が $10 を無料配布、カード不要：AI スタートアップ向けに数十億の Kimi K2.6 トークン"
description: "GonkaGate はカードも暗号資産チャージもなしで $10 の無料残高を配布。100 万トークンあたり約 $0.000334 という価格なら、数十億の Kimi K2.6 トークンに相当する——トークンを浪費する AI スタートアップにとっての燃料だ。内容：TPS テストと、opencode・Hermes Agent のステップバイステップ設定。"
pubDate: 2026-06-23
heroImage: "/images/blog/gonka-hero.png"
tags: ["gonka", "llm", "tokens", "kimi", "opencode", "hermes-agent"]
draft: false
---

# Gonka が $10 を無料配布、カード不要：AI スタートアップ向けに数十億の Kimi K2.6 トークン

トークンをバケツ単位で燃やしているすべての人へ、手早く要点を。[Gonka](https://gonka.ai) は分散型の計算ネットワークで、[GonkaGate](https://gonkagate.com/en) はその上に構築された、ドル建て課金の OpenAI 互換ゲートウェイだ。しかも**サインアップした瞬間に $10 の無料残高を渡してくれる——カードも暗号資産チャージも不要**。リクエストを送り始めるのに、ウォレットも GNK トークンも、前払いの 1 セントすら要らない。

## なぜこれが重要なのか

ポイントは $10 そのものではなく、その中に**どれだけのトークン**が収まるかだ。

GonkaGate での `moonshotai/kimi-k2.6` の価格は **100 万トークンあたり約 $0.000334**（ネットワークコスト約 $0.000304 + ゲートウェイ手数料約 $0.000030）。これは一般的なクラウド料金より桁違いに安い。この価格なら、$10 は**数十億トークン**だ。実際、その $10 だけでも Kimi K2.6 のコンテキストトークンを約 **26 億トークン**カバーできる。

これはもはや「ちょっと遊んでみる」レベルではない——本物の燃料だ。無料の $10 で次のことができる：

- 一括処理を回す（数千件のドキュメントの分類・ラベル付け・要約）；
- コンテキストを大量に消費するバックグラウンドエージェントを動かし続ける；
- **AI スタートアップのプロトタイプを作る**。ここではトークンの経済性が、たいていスタートラインでアイデアそのものを潰してしまう。

希望すれば **USDT** でアカウントにチャージできる——だが最初は必要ない。$10 は最初からそこにある。

## 速度

ゲートウェイ経由で `moonshotai/kimi-k2.6` をベンチマークしてみた：エンドツーエンドの生成速度は**およそ 60 tok/s**。この価格で動く分散型ネットワークとしては、十分に実用的な数字だ。

## キーを取得する

1. **[gonkagate.com/en/pricing](https://gonkagate.com/en/pricing)** でサインアップ——$10 が自動的に残高に入る。
2. API キーを作成する。`gp-...` で始まり、**一度しか表示されない**——すぐに保存すること。
3. API base：`https://api.gonkagate.com/v1`、認証は `Authorization: Bearer gp-...`。ゲートウェイは OpenAI 互換だ：base URL・キー・モデル id を差し替えれば、どんな OpenAI SDK もそのまま動く。

手早いスモークテスト（キーが有効か確認する）：

```bash
curl https://api.gonkagate.com/v1/chat/completions \
  -H "Authorization: Bearer $GONKAGATE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "moonshotai/kimi-k2.6",
    "messages": [{"role": "user", "content": "Reply with exactly: GonkaGate ok"}]
  }'
```

## opencode 向けの設定

[opencode](https://opencode.ai) はターミナル上の AI エージェントだ。カスタムプロバイダーとして GonkaGate に接続する。

### 方法 A——公式インストーラー（最も簡単）

```bash
npx @gonkagate/opencode-setup
```

非対話モード（スクリプト/CI 向け）：

```bash
GONKAGATE_API_KEY=gp-... npx @gonkagate/opencode-setup --scope project --yes
```

### 方法 B——手動

1. opencode を起動し、`/connect` を実行、`Other` を選んで次を入力：
   - Provider id：`gonkagate`
   - API key：あなたの `gp-...`
2. プロバイダーを `~/.config/opencode/opencode.json` に追加する：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "gonkagate": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "GonkaGate",
      "options": {
        "baseURL": "https://api.gonkagate.com/v1"
      },
      "models": {
        "moonshotai/kimi-k2.6": {
          "name": "Kimi K2.6 (GonkaGate)"
        }
      }
    }
  },
  "model": "gonkagate/moonshotai/kimi-k2.6",
  "small_model": "gonkagate/moonshotai/kimi-k2.6"
}
```

3. 確認：

```bash
opencode debug config --pure
```

その後 opencode 内で `/models` を実行——リストに `GonkaGate` プロバイダーと `Kimi K2.6` モデルが表示されるはずだ。現在のモデル一覧はいつでも `GET /v1/models` から取得できる。

## Hermes Agent 向けの設定

Nous Research の [Hermes Agent](https://github.com/nousresearch/hermes-agent) は、あらゆるモデルプロバイダーと連携し、セッションをまたいでコンテキストを記憶するターミナルエージェントだ。これも 1 ステップで GonkaGate に接続できる。

**要件：** `PATH` に Hermes Agent `v2026.5.16` / `v0.14.0`+、Node.js ≥ `22.14.0`、`gp-...` キー、対話型ターミナル（TTY）、Linux/macOS/WSL2。

### 方法 A——公式インストーラー

```bash
npx @gonkagate/hermes-agent-setup
```

別のプロファイルで：

```bash
npx @gonkagate/hermes-agent-setup --profile work
```

### 方法 B——手動

インストーラーは 2 つのファイルを編集する。同じ内容を手で書くこともできる。

`~/.hermes/config.yaml`：

```yaml
model:
  provider: custom
  base_url: https://api.gonkagate.com/v1
  default: moonshotai/kimi-k2.6
```

`~/.hermes/.env`：

```
OPENAI_API_KEY=gp-...
```

実行して確認：

```bash
hermes
# then prompt: Reply with exactly: Hermes Agent connected to GonkaGate
```

## 落とし穴

- **ツールスキーマ内の RE2 正規表現。** Gonka 上の Kimi バックエンドは Go の RE2 を使う——先読み（lookahead）を理解しない。MCP ツールの JSON スキーマに `(?!` や `(?=` を含む `pattern` があると、リクエストは失敗する：`400 ... schema pattern is not a valid regular expression`。対処法は、そうした pattern をツールのスキーマから取り除くことだ。
- **他のモデル。** `moonshotai/kimi-k2.6` のほかにも、Qwen3 235B、MiniMax M2.7 などがある——最新の一覧は `GET /v1/models` にある。id は大文字小文字を区別するので、そのままコピーすること。
