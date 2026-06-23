---
title: "Claude Code での graphify：リポジトリ全体を読む代わりにナレッジグラフ、セマンティクスは安価な OpenRouter で"
description: "Claude Code 向けにすぐ使える私の graphify セットアップ：リポジトリ全体の読み込みの代わりにナレッジグラフ、Claude のトークンではなく安価な OpenRouter（deepseek）でのセマンティック抽出、フックによる自動ウォッチ、グラフへのシークレット流出の防止。すべて claude-code-token-savers リポジトリにまとめてあります。"
pubDate: 2026-06-23
heroImage: "/images/blog/graphify-hero.png"
tags: ["graphify", "claude-code", "tokens", "knowledge-graph", "openrouter"]
draft: false
---

# Claude Code での graphify：リポジトリ全体を読む代わりにナレッジグラフ

[トークン節約ガイド](https://www.suenot.com/blog/saving-tokens-llm/)では、全体のスタックの一部として graphify を軽く触れました。この記事では、私がどうやって自動化を組み上げたかを単独で深掘りします。具体的に何をグローバルで有効にしているか、そしてなぜそれが Claude のトークンを焼かないのかを説明します。

問題はシンプルです。他人のコード（あるいは半年前の自分のコード）を理解するために、エージェントはファイルをまとめて読み込み、すべてのファイルがコンテキストに入ります。これは入力面で高くつき、おまけにコンテキスト腐敗（context rot）も引き起こします。詰め込むほど、モデルの思考は悪くなるのです。[graphify](https://github.com/safishamsi/graphify) はこの結びつきを断ち切ります。一度だけ、リポジトリからナレッジグラフ（ノード、リレーション、コミュニティ、god ノード）を構築し、それを**クエリ**するのです。ファイルをウィンドウに投げ込む代わりに。

すべては単一のリポジトリにまとめられています——**[suenot/claude-code-token-savers](https://github.com/suenot/claude-code-token-savers)**（`graphify/` フォルダ、冪等な `setup.sh`、パッチ、フック）。

## 核心のトリック：他人のトークンでセマンティクスを

グラフの構築は、エンティティとリレーションの抽出のための大量の LLM 呼び出しです。それらを Claude 経由で走らせると、節約は支出に変わってしまいます。だからセマンティック抽出は **安価な OpenRouter** にオフロードされ、Claude の予算には乗りません。

`~/.graphify/providers.json`：

```json
{
  "openrouter": {
    "base_url": "https://openrouter.ai/api/v1",
    "default_model": "deepseek/deepseek-v4-flash",
    "env_key": "OPENROUTER_API_KEY",
    "model_env_key": "GRAPHIFY_OPENROUTER_MODEL",
    "pricing": { "input": 0.09, "output": 0.18 },
    "temperature": 0,
    "max_tokens": 16384,
    "vision": false
  }
}
```

`deepseek/deepseek-v4-flash`——100 万トークンあたり $0.09 / $0.18、コンテキスト 100 万。中規模プロジェクトのグラフ構築にかかるのは **OpenRouter で ~$0.10、そして Claude のセッショントークンはゼロ** です。モデルの切り替えは変数ひとつ：`export GRAPHIFY_OPENROUTER_MODEL=qwen/qwen3.7-plus`。

重要な詳細：`graphify install` は `~/.claude/skills/graphify/SKILL.md` を上書きします。このファイルは抽出バックエンドの優先順位をハードコードしており、復元しないと graphify は Claude のサブエージェントにフォールバックしてあなたのトークンを焼きます。正しい優先順位は：

1. **OpenRouter**（`OPENROUTER_API_KEY` がある場合）——テキストチャンクはここへ。
2. **Gemini**（`GEMINI_API_KEY` / `GOOGLE_API_KEY` がある場合）。
3. **Claude のサブエージェント**——最後のフォールバックとしてのみ。

## インストール

[`uv`](https://docs.astral.sh/uv/) と、環境内の `OPENROUTER_API_KEY` が必要です。

```bash
cd graphify
./setup.sh          # installs graphify, the OpenRouter backend, patches, hooks, no-media
```

`setup.sh` は冪等です（ロールバック付き）。手作業でやりたい場合、内部で実行されているのは：

```bash
uv tool install --with watchdog "graphifyy[openai]"   # openai-extra = OpenRouter; watchdog = graphify watch
mkdir -p ~/.graphify
cp providers.json ~/.graphify/providers.json
cp build-and-watch.sh stop-watch.sh precommit-graph-guard.sh ~/.graphify/ && chmod +x ~/.graphify/*.sh
PY="$(sed -n '1s/^#!//p' "$(command -v graphify)")"
"$PY" patch-global-ignore.py     # global ignore layer
"$PY" patch-merge-ignore.py      # merge .gitignore + .graphifyignore (instead of shadowing)
"$PY" patch-no-media.py          # no-media toggle
touch ~/.graphify/no-media       # media off by default
graphify install --platform claude
```

## 自動ウォッチ：グラフは自分自身を更新する

自動化の心臓部は `SessionStart` フックの `build-and-watch.sh` です。セッション開始のたびにプロジェクトを検査し、分岐を選びます：

- **グラフが存在** → `graphify watch`（安価、AST のみ、LLM なし）を起動 + pre-commit ガードをインストール → ステータスは "watching"。
- **グラフ未初期化** → "run `/graphify .`" を表示して、何もしません。これは安全装置です。うっかり開いてしまったルートや巨大なフォルダが、こっそりインデックス化されてトークンを焼くことはありません。
- `~/.graphify/autobuild` マーカー → さらに、OpenRouter 経由で小さくて新しいプロジェクトを自動構築します（上限：500 ファイル / 200 万語。それより大きいものはスキップされ、手動での構築を求められます）。

安全ガード：`$HOME`、FS のルート、システム/`tmp` フォルダ、`$HOME` の祖先ディレクトリ、そして `.graphify-skip` を持つ任意のプロジェクトをスキップします。グローバルのキルスイッチは `~/.graphify/disable-autowatch` です。プロジェクトごとにウォッチャーはちょうど 1 つ（アトミックな `mkdir` ロック + PID チェック）。`SessionEnd` では `stop-watch.sh` によって停止されます。`watch` はコード/AST レイヤーのみを更新します。ドキュメントには `/graphify . --update` が必要です。

`~/.claude/settings.json` のフックマップ（マージすること、既存のものを上書きしない）：

```
SessionStart  -> ~/.graphify/build-and-watch.sh    # status + watch
SessionEnd    -> ~/.graphify/stop-watch.sh          # stop watcher
```

## グラフに入らないもの（そしてそれがなぜ重要か）

グラフはコミットに含まれ得ます。つまり、そこにシークレットを入れてはいけません。3 つの独立したメカニズム：

1. **シークレットと `.env`**——graphify 組み込みの `_is_sensitive` によって常に除去されます。設定不要。
2. **メディア**——ignore ファイルをいじらない、きれいなトグル：`patch-no-media.py` は、`~/.graphify/no-media` が存在するとき（または `GRAPHIFY_NO_MEDIA=1`）、`detect()` に画像/pdf/動画/office をスキップさせます。マーカーを削除すれば、メディアは再び対象に戻ります。
3. **`.gitignore` のシャドーイング——修正済み。** アップストリームでは、フォルダの `.graphifyignore` が自身の `.gitignore` を**完全にシャドーイング**していました：`.gitignore` にだけ存在するパターン（たとえばシークレット）でも、なおインデックス化されてしまっていたのです。`patch-merge-ignore.py` は置換ではなくマージします——これがアップストリームの [PR #1364](https://github.com/safishamsi/graphify/pull/1364) です。

それに加えて——**pre-commit ガード**（`precommit-graph-guard.sh`）。graphify 化された git リポジトリにインストールされ、`.gitignore` されたファイルがグラフに入り込んでいた場合、`graphify-out/graph.json` のコミットを**ブロック**します。コミット済みのグラフへのシークレット流出に対する多層防御です。`git commit --no-verify` でバイパスできます。

## 使い方

一度構築し、あとはクエリ：

```bash
/graphify .                         # build the graph for the current folder
/graphify https://github.com/o/r    # clone the repo and build
/graphify url1 url2 ...              # several repos → one cross-repo graph
/graphify . --mode deep             # more thorough, more INFERRED relations
/graphify . --update                # incremental, only new/changed

/graphify query "where is the token validated and what does that trigger"
/graphify query "..." --dfs         # trace a specific path, not broad context
/graphify query "..." --budget 1500 # cap the answer at N tokens
```

出力はインタラクティブな HTML、GraphRAG-JSON、そして人間が読める `GRAPH_REPORT.md` です。さらに `--mcp`（エージェント向けの stdio サーバー）と `--wiki` もあります。それ以降は「auth モジュール全体を読む」代わりに、エージェントはグラフにアクセスして、必要なスライスだけを正確に手に入れます。

## graphify をアップグレードした後

`uv tool upgrade graphifyy` と `graphify install` は site-packages を消去し（3 つの `detect.py` パッチがすべて失われます）、`SKILL.md` を上書きします。直し方は、`./setup.sh` を再び実行し（パッチ、ファイル、no-media マーカーを復元）、`SKILL.md` のバックエンド優先順位ブロックを付け直すことです。アップグレードを生き延びるもの：`~/.graphify/*`、`~/.claude/settings.json` のフック、リポジトリごとの `.git/hooks/pre-commit`。

---

結論：graphify はあなたのコンテキストから最も重いレイヤー——「リポジトリ全体を読む」——を取り除きます。しかもそれを、他人の数セントしかしないトークンで行い、バックグラウンドで自分自身を更新し、シークレットをグラフに引きずり込みません。rtk（コマンド入力）と caveman（モデル出力）との組み合わせは、[トークン節約ガイド](https://www.suenot.com/blog/saving-tokens-llm/)で扱っています。
