---
title: "cctoggle: すべての Claude Code プラグインと MCP サーバーを 1 つのコマンドでオフに——そして元に戻す"
description: "すべての Claude Code プラグインとユーザースコープの MCP サーバーを一度にオフにする小さなユーティリティとグローバルな /cctoggle スラッシュコマンド——それらのツール定義をコンテキストから取り除き——無効化したものを正確に復元する。アプリの再起動は不要。中身：適用のしくみ、選択的な無効化、バックアップ、そして制限。"
pubDate: 2026-06-23
heroImage: "/images/blog/cctoggle-hero.png"
tags: ["cctoggle", "claude-code", "tokens", "mcp", "plugins"]
draft: false
---

# cctoggle: すべての Claude Code プラグインと MCP サーバーを 1 つのコマンドでオフに

Claude Code のセッションがまっさらであることはめったにありません。プラグインが読み込まれ、ユーザースコープの MCP サーバーが接続され、それぞれが一束のツール定義を持ち込み、そのすべてが最初のメッセージを送る前にコンテキストへ流れ込みます。ときには逆が欲しいこともあります——特定のタスクのためのクリーンで身軽なセッション——そして 1 つのコマンドで復元すること。

それこそが私が [**cctoggle**](https://github.com/suenot/cctoggle)（公開、MIT）を作った理由です——すべてのプラグインとユーザースコープの MCP サーバーを一度にオフにし、無効化したものを正確に復元する、小さなユーティリティとグローバルなスラッシュコマンドです。

## 問題

セッションが抱えるプラグインと MCP サーバーが多いほど、コンテキストは膨れ上がります。それらのツール定義はトークン予算を食い、利用可能なツールの一覧を散らかします。これはコストが高くなる（入力が増える）と同時に、品質も悪くなります（積み込めば積み込むほど、モデルはうまく扱えなくなります）。そして手作業でやるとなると、2 つの設定ファイルを編集し、その後で何をいじったのかを苦労して正確に覚えておき、元に戻さなければなりません。

cctoggle は両端を塞ぎます。1 つのコマンドですべてを無効化し、何を無効化したかを正確に覚えているので、それだけを復元できます。

## 何をするのか

4 つのコマンドで、Claude Code 内では `/cctoggle` として、ターミナルでは `cctoggle` CLI として、どちらでも動作します：

```bash
/cctoggle status          # what's currently enabled/disabled
/cctoggle off             # disable all plugins + user-scope MCP
/cctoggle on              # restore exactly what cctoggle disabled
/cctoggle restore-backup  # roll back to a config backup
```

`off` は 2 つのことをします：

- **プラグイン** —— `~/.claude/settings.json` の `enabledPlugins` フラグを `false` に切り替えます。
- **MCP** —— ユーザースコープの MCP サーバー定義を `~/.claude.json` から取り出し、ローカルの状態ファイルに退避します。

`on` は cctoggle 自身が無効化したものだけを厳密に復元します。もしあなたが以前すでに何らかのプラグインやサーバーを手動でオフにしていたなら、`on` はそれをそのままにし、再び有効化することはありません。これは重要な点です。このコマンドは「すべてを有効化する」ではなく、「直前の `off` を取り消す」なのです。

### 選択的な無効化

すべてを吹き飛ばす必要はありません。`off` は引数を取ります：

```bash
cctoggle off --keep superpowers,caveman   # disable all except these
cctoggle off graphify rtk                  # disable only the listed ones
```

## 変更がどう適用されるか（理解する価値あり）

ここが一筋縄ではいかない部分です——プラグインと MCP では適用のしくみが異なります。

**プラグインの変更は現在のセッションに適用されます**——ただし `/reload-plugins` と入力した後だけです。アプリの完全な再起動は不要です。

**MCP 設定の変更は次の `claude` セッションで適用されます。** Claude Code には MCP のライブ切断はありません——サポートされていないのです。そして、あまり明白ではありませんが、`/clear` と `/compact` は MCP 接続を切りません。同じプロセスが子の MCP サーバーを生かし続けるので、コンテキストをクリアするだけでは不十分です——新しい `claude` セッションが必要です。

なので実際のループはこうなります：

```bash
/cctoggle off        # flag plugins and stash MCP
/reload-plugins      # plugins leave the current session
# for MCP — exit and start claude again
```

## インストール

必要なのは git だけです。リポジトリをクローンしてインストーラーを実行します：

```bash
git clone https://github.com/suenot/cctoggle.git ~/projects/claude && \
  ~/projects/claude/install.sh
```

`install.sh` はスラッシュコマンドを `~/.claude/commands/` にシンボリックリンクし、`cctoggle` CLI をあなたの `PATH` に置きます。その後は `/cctoggle` がすべての Claude Code セッションで使え、`cctoggle` はターミナルからそのまま動きます。

## なぜ堅牢なのか

`/cctoggle` は**ユーザーコマンド**（`~/.claude/commands/` にあります）であって、プラグインではありません。だからすべてのプラグインが無効化された後でも動き続けます。もし cctoggle 自体がプラグインだったら、`off` コマンドは自分の足を撃つことになります——そうではなく、何をオフにしようとも `on` は常に手元にあります。

## バックアップとプライバシー

すべての変更の前に、cctoggle は両方の設定ファイル（`~/.claude/settings.json` と `~/.claude.json`）を `backups/` ディレクトリにバックアップします。何かうまくいかなければ、`restore-backup` が保存されたコピーへロールバックします。

状態ファイルとバックアップは gitignore されているので、あなたのプライベートな MCP サーバー定義（しばしばキーやトークンを含みます）がコミットに漏れ出すことは決してありません。

## 制限

最初に知っておくべき正直な制限が 1 つあります。`claude mcp get <name>` が **"Dynamic config (from command line)"** と報告する MCP サーバー——つまり起動時にコマンドラインフラグで注入されるもの（例えば `claude_design`）——は、設定からはまったく切り替えられません。それらは `claude` の起動方法を変えて再起動することでしか無効化できません。

cctoggle はこれらのサーバーを**検出して報告**しますが、切り替えることはできません——これは仕組みそのものの制限であって、ユーティリティの制限ではありません。

---

要するに：cctoggle は、すべてのプラグインと MCP を抱えた「重い」セッションと、目の前のタスクのための「身軽な」セッションとの間を素早く切り替えるトグルであり、すべてが元どおりに戻るという保証付きです。すべてのステップの前にバックアップを取り、プライベートな MCP 定義は git の外に留まり、コマンド自体はユーザー空間にあるためすべてのプラグインの無効化を生き延びます。リポジトリ——[github.com/suenot/cctoggle](https://github.com/suenot/cctoggle)。
