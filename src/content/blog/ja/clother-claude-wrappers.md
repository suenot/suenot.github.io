---
title: "Clother：グローバル設定を変更せずにClaude Codeのマルチプロバイダーラッパー"
description: "jolehuit/clotherを使って、clother-*コマンドでClaude CodeをZ.AI、Kimi、MiniMax、OpenRouter、Alibaba、Ollama、LM Studioなどのプロバイダー間で切り替える方法。~/.claudeやグローバル環境変数の書き換え不要。"
pubDate: 2026-04-19
heroImage: "/images/blog/clother-claude-hero.png"
tags: ["claude-code", "clother", "llm", "providers", "tooling"]
draft: false
---

# Clother：グローバル設定を変更せずにClaude Codeのマルチプロバイダーラッパー

Claude Codeは素晴らしい——しかしAnthropic以外のエンドポイントで実行しようとした途端、体験が崩壊します。`ANTHROPIC_BASE_URL`、`ANTHROPIC_AUTH_TOKEN`を修正し、プロバイダーごとにシェルスクリプトを管理し、`~/.claude`とシェル設定ファイルを壊れかけたエイリアスの墓場に変えていくことになります。

[Clother](https://github.com/jolehuit/clother)はまさにこの問題を解決します。小さなGoバイナリで、プロバイダーごとに`clother-*`ランチャーコマンドを提供します。一度インストールすれば、Claude（サブスクリプション）、Z.AI GLM-5、Kimi、MiniMax、DeepSeek、Alibaba Coding Plan、OpenRouter、Ollama、LM Studio、llama.cpp、カスタムエンドポイントの切り替えは、文字通りコマンド名を変えるだけです。

重要なのは、**Claude Codeのインストールは完全に手つかず**のまま。`~/.claude/settings.json`の編集不要、永続的な環境変数汚染なし、明日の朝うっかり間違ったプロバイダーに作業セッションを送ってしまうリスクもありません。

## 1. Clotherが解決する問題

非Anthropicバックエンドを使う場合、通常以下が必要です：

1. **ベースURL**（`ANTHROPIC_BASE_URL`）——プロバイダーごとに異なる
2. **認証トークン**（`ANTHROPIC_AUTH_TOKEN`）——プロバイダーごとに異なるシークレット
3. **モデル名**——異なる命名規則（`glm-5`、`kimi-k2.5`、`MiniMax-M2.5`…）

Clotherはプロセスの**ライフタイム中のみ**正しい環境変数を設定し、その後実際の`claude`バイナリを`exec`します。

## 2. Clotherの本質

内部的には1つのGoバイナリと`clother-<provider>`という名前のシンボリックリンクの集合です。バイナリは自身の呼び出し名（`argv[0]`）を検査し、対応するプロファイルを検索し、正しい環境変数をエクスポートしてから`exec`します。

```bash
export ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"
export ANTHROPIC_AUTH_TOKEN="$ZAI_API_KEY"
exec /path/to/the/real/claude "$@"
```

設計上の利点：

- **ゼロ状態リーク。** Claudeプロセスが終了すると、環境変数も消えます。
- **複数プロバイダーの並行利用。** 4つのターミナルタブを開いて同時に異なるプロバイダーを使用可能。
- **`claude --resume`が動作し続ける。** Clotherが元のプロバイダープロファイルにルーティングします。

## 3. インストール

```bash
curl -fsSL https://claude.ai/install.sh | bash    # Claude Code本体
brew tap jolehuit/tap
brew install clother
```

## 4. 日常使用

```bash
clother-native                       # Anthropic、Claude Pro/Max/Teamサブスクリプション
clother-zai                          # Z.AI GLM-5
clother-kimi                         # Kimi (kimi-k2.5)
clother-minimax                      # MiniMax-M2.7
clother-deepseek                     # DeepSeek
clother-alibaba                      # Alibaba Coding Plan
clother-ollama --model qwen3-coder   # ローカルOllama
clother-or stepfun                   # OpenRouterエイリアス
clother-custom sambanova --yolo      # カスタムプロバイダー
```

## 5. `~/.config/clother/config.json`でカスタマイズ

```json
{
  "version": 1,
  "provider_overrides": {
    "zai": { "model": "glm-5.1" }
  },
  "openrouter_aliases": {
    "kimi25":    "moonshotai/kimi-k2.5:nitro",
    "minimax27": "minimax/minimax-m2.7:nitro"
  },
  "custom_providers": {
    "sambanova": {
      "name": "sambanova",
      "base_url": "https://api.sambanova.ai",
      "api_key_env": "SAMBA_API_KEY",
      "default_model": "MiniMax-M2.5",
      "api_type": "openai"
    }
  }
}
```

## 6. 内蔵プロバイダーメニュー

| ティア | 例 |
|--------|-------|
| クラウド | `clother-native`、`clother-zai`、`clother-kimi`、`clother-minimax`、`clother-deepseek` |
| 中国エンドポイント | `clother-zai-cn`、`clother-minimax-cn`、`clother-ve` |
| ローカル | `clother-ollama`、`clother-lmstudio`、`clother-llamacpp` |
| OpenRouter | `clother-or <エイリアス>`（100+モデル） |
| カスタム | `clother-custom <エイリアス>` |

## 7. まとめ

Clotherは小さなことを上手くやるツールです。Claude Codeを唯一の安定したインターフェースとして維持し、基盤となるプロバイダーをランタイムの決定として扱えるようにします。グローバル設定のドリフトなし、プロバイダーごとのフォークなし、実験時の危険な影響範囲なし。

コスト最適化を既に行っている場合は、この記事を[LLMでトークンを節約する方法](/blog/saving-tokens-llm)と合わせてお読みください。
