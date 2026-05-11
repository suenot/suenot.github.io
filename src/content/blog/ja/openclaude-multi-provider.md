---
title: "OpenClaude：10個のコマンドの代わりに1つの設定ファイル"
description: "OpenClaudeが各プロバイダーごとのラッパーコマンド（Clother、シェルエイリアス）を1つの~/.openclaude.json設定ファイルに置き換える方法。"
pubDate: 2026-05-11
heroImage: "/images/blog/openclaude-hero.png"
tags: ["claude-code", "openclaude", "llm", "providers", "tooling"]
draft: false
---

# OpenClaude：10個のコマンドの代わりに1つの設定ファイル

[Clotherの記事](/blog/clother-claude-wrappers)を読んだ方なら分かるだろう。Claude Codeを別のプロバイダー（GLM、Kimi、MiniMax、DeepSeek）に接続するたびに、個別のラッパーコマンドが必要になる。`clother-zai`、`clother-kimi`、`clother-minimax`……それぞれが独自の環境変数を設定し、それぞれが個別のシンボリックリンク。

[OpenClaude](https://github.com/Gitlawb/openclaude)は違うアプローチを取る。プロバイダーごとの個別コマンドの代わりに、**すべてのモデルを1つのJSON設定ファイルに定義**し、CLIが自動的にルーティングを処理する。

## コマンドごとのラッパーの問題

```
clother-zai        → Z.AI GLM-5
clother-kimi       → Kimi (kimi-k2.5)
clother-minimax    → MiniMax-M2.7
clother-deepseek   → DeepSeek
clother-alibaba    → Alibaba Coding Plan
clother-ollama     → ローカルOllama
```

6つのプロバイダーに6つのコマンド。OpenRouterエイリアスやカスタムプロバイダーを追加すれば、動物園の管理と同じだ。

## OpenClaude：すべてが `~/.openclaude.json` に

OpenClaudeはオープンソースのコーディングエージェントCLI（26k+スター、TypeScript、MIT）で、複数プロバイダーをネイティブサポート。核心機能は**エージェントルーティング**——1つの設定ファイルにすべてのモデルとAPIエンドポイントを定義し、CLIがタスクに応じて自動選択。

```json
{
  "agentModels": {
    "deepseek-v4-flash": {
      "base_url": "https://api.deepseek.com/v1",
      "api_key": "sk-your-key"
    },
    "gpt-4o": {
      "base_url": "https://api.openai.com/v1",
      "api_key": "sk-your-key"
    },
    "glm-5": {
      "base_url": "https://open.bigmodel.cn/api/paas/v4",
      "api_key": "your-zhipu-key"
    },
    "kimi-k2.5": {
      "base_url": "https://api.moonshot.cn/v1",
      "api_key": "your-moonshot-key"
    },
    "minimax-m2.7": {
      "base_url": "https://api.minimax.chat/v1",
      "api_key": "your-minimax-key"
    }
  },
  "agentRouting": {
    "Explore": "deepseek-v4-flash",
    "Plan": "gpt-4o",
    "general-purpose": "glm-5",
    "frontend-dev": "deepseek-v4-flash",
    "code-review": "kimi-k2.5",
    "default": "gpt-4o"
  }
}
```

**5つのプロバイダー。1つのファイル。覚えるコマンドはゼロ。**

`agentRouting`セクションが真の力：異なるタスクが自動的に異なるモデルに送られる。探索はDeepSeek、計画はGPT-4o、一般コーディングはGLM-5、コードレビューはKimi。

## サポートプロバイダー

| プロバイダー | タイプ |
|-------------|--------|
| OpenAI (GPT-4o, o3等) | クラウドAPI |
| Gemini | クラウドAPI |
| GitHub Models | クラウドAPI |
| DeepSeek | クラウドAPI |
| OpenAI互換 (GLM, Kimi, MiniMax等) | クラウドAPI |
| Ollama | ローカル |
| Codex / Codex OAuth | クラウドAPI |

## クイックスタート

```bash
npm install -g @gitlawb/openclaude
openclaude
```

CLI内で`/provider`を実行してインタラクティブ設定するか、`~/.openclaude.json`を直接編集。

環境変数でのクイックスタート：

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=sk-your-key
export OPENAI_MODEL=gpt-4o
openclaude
```

Ollamaショートカット：

```bash
ollama launch openclaude --model qwen2.5-coder:7b
```

## Clother vs OpenClaude

| | Clother | OpenClaude |
|---|---------|-----------|
| **アプローチ** | 公式Claude Codeのラッパー | スタンドアロンCLI |
| **設定** | config.json + シンボリックリンク | 1つのJSONファイル |
| **プロバイダー追加** | 新シンボリックリンク + キー設定 | 1つのJSONブロック |
| **エージェントルーティング** | 手動（別々のターミナルタブ） | 自動 `agentRouting` |
| **Claude Code必要** | はい | いいえ |
| **プロバイダーコマンド** | `clother-zai`, `clother-kimi`… | 1つの `openclaude` |

**Clotherを使う場合：** 公式Claude Codeを維持し、プロバイダーをクリーンに切り替えたい時。

**OpenClaudeを使う場合：** すべてのプロバイダーをネイティブに処理し、モデル間を自動ルーティングする統一CLIが欲しい時。

## コスト最適化との関連

[LLMでトークンを節約する方法](/blog/saving-tokens-llm)の戦略と組み合わせる：Clotherはタブの切り替えが必要だが、OpenClaudeのagentRoutingは自動的に探索をDeepSeekに、計画をGPT-4oに、コーディングをGLM-5に送る。

## まとめ

1. **シェルエイリアス** → 脆い
2. **Clother** → クリーンなラッパー
3. **OpenClaude** → すべてのモデルを1つの設定で、自動ルーティング

---

*関連記事：[Clother](/blog/clother-claude-wrappers)と[LLMでトークンを節約する方法](/blog/saving-tokens-llm)。*
