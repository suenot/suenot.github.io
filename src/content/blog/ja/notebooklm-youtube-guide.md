---
title: "NotebookLMでYouTube動画を作る方法：完全ガイド"
description: "ステップバイステップのチュートリアル：NotebookLMで音声とスライドを生成し、字幕、チャプタータイムスタンプ、メタデータ付きのYouTube動画に組み立て、ブラウザセッションを通じて自動で公開。動画編集ソフト不要、APIキー不要、手動アップロード不要。"
pubDate: 2026-05-09
heroImage: "/images/blog/notebooklm-youtube-hero.png"
tags: ["notebooklm", "youtube", "automation", "video", "ai", "open-source", "tooling"]
draft: false
---

# NotebookLMでYouTube動画を作る方法：完全ガイド

YouTubeに動画を投稿したいと思いながらも、動画編集ソフトや何時間もの手作業を考えて躊躇していたなら、この記事はあなたのためのものです。

**Google NotebookLM** といくつかのオープンソーススクリプトを使って、アイデアから公開動画まで約30分で到達する方法をお見せします。動画編集ソフトは一切使いません。

## NotebookLMと動画の関係

[NotebookLM](https://notebooklm.google.com/) はGoogleのAIツールで、ドキュメントを分析してコンテンツを生成できます。

1. **音声ポッドキャスト生成** — 記事やメモから自然な音声のオーディオナレーションを生成
2. **スライドプレゼンテーション生成** — 同じ素材からPDFスライドを作成
3. **完成動画生成** — 一部のモードでは完成動画も生成可能

## 完成イメージ

- 🎬 [Анализ Плато: Как отличить надежный оптимум от переобучения](https://www.youtube.com/watch?v=IoMk1tCYpC0) — **video-maker** の例：PDFプレゼンテーション + 音声（NotebookLM）をスライド同期された完成動画に組み立て
- 🎬 [Walk-Forward Optimization: The Only Honest Strategy Test](https://www.youtube.com/watch?v=y_cC6LWXFKM) — **video-metadata** の例：NotebookLMが完成動画を生成し、スクリプトがメタデータ（タイトル、説明、タグ、タイムスタンプ、字幕）を準備

どちらの場合も動画編集ソフトや手作業は不要。すべて自動で組み立てられています。

## ツール：あなたはどのタイプ？

NotebookLMが何を渡してくれたかによって、2つの構築ツールのどちらかから始めます——そして3つ目のツールが、その結果をあなたに代わってYouTubeへ公開します。

### シナリオ1：音声 + スライドがある → 動画を組み立てる

**ツール：** [video-maker](https://github.com/suenot/video-maker)

### シナリオ2：完成動画がある → YouTubeメタデータが必要

**ツール：** [video-metadata](https://github.com/suenot/video-metadata)

## シナリオ1：音声とスライドから動画を構築

### ステップ1：NotebookLMでコンテンツを生成

1. [NotebookLM](https://notebooklm.google.com/) を開く
2. 新しいノートブックを作成し、素材をアップロード
3. **オーディオポッドキャスト**と**スライドプレゼンテーション**の生成を依頼
4. 音声（`.m4a`）とスライド（`.pdf`）をダウンロード

### ステップ2：ツールをインストール

```bash
git clone https://github.com/suenot/video-maker.git
cd video-maker
python -m venv venv && source venv/bin/activate
pip install openai-whisper pillow pytesseract
brew install ffmpeg poppler tesseract
```

### ステップ3：実行——コマンド1つ

```bash
mkdir -p input/my-video
cp ~/Downloads/audio.m4a input/my-video/audio_en.m4a
cp ~/Downloads/slides.pdf input/my-video/slides_en.pdf
bash scripts/run_pipeline.sh en
```

パイプラインが自動的に：PDF→画像変換、OCRテキスト抽出、Whisper文字起こし、スライド同期、MP4動画組み立て、SRT字幕生成、メタデータ生成、サムネイル作成を行います。

### 同期の仕組み

貪欲前方マッチングアルゴリズム：Whisperの単語レベルタイムスタンプとOCRのスライドテキストを比較し、自動的にスライド切り替えタイミングを判断します。

## シナリオ2：完成動画のメタデータ準備

```bash
git clone https://github.com/suenot/video-metadata.git
cd video-metadata
pip install openai-whisper

python scripts/prepare_metadata.py \
    --video input/my-video.mp4 \
    --slug my-article-slug \
    --output-dir output/my-article-slug \
    --whisper-model base
```

## シナリオ3：YouTubeへ公開——自動で

以前このガイドは手動ステップで終わっていました：YouTube Studioを開き、ファイルをアップロードし、メタデータを手で貼り付ける。もうそうではありません。最終段階も自動化されました。

**ツール：** [video-publisher](https://github.com/suenot/video-publisher)

video-publisherは完成動画とメタデータJSONを受け取り、**あなたに代わってYouTubeへ公開します**——アンチディテクト型の [Camoufox](https://camoufox.com) ブラウザセッションでYouTube Studioを操作することで実現します。**Data APIも、OAuthも、APIキーも不要。** 一度ログインしたブラウザプロファイルを再利用するので、Google Cloudで設定するものは何もありません。

### 仕組み

```bash
git clone https://github.com/suenot/video-publisher.git
cd video-publisher

# Use Python 3.11–3.13 (not 3.14 — Camoufox needs Playwright ≤ 1.51)
python3.11 -m venv venv && venv/bin/pip install -r requirements.txt
venv/bin/python -m camoufox fetch          # one-time: download the browser

# One-time: sign into the TARGET YouTube account (persists locally)
venv/bin/python login.py
```

その後、`video-maker` のバンドルをコマンド1つで公開します：

```bash
venv/bin/python publish.py \
    --video     ../video-maker/output/SLUG/SLUG.mp4 \
    --metadata  ../video-maker/output/SLUG/SLUG_metadata.json \
    --thumbnail ../video-maker/output/SLUG/SLUG_thumbnail.png \
    --channel-handle @your-channel \
    --visibility private
```

このツールは：

1. ログイン済みのCamoufoxセッションでYouTube Studioを開く——ログインプロンプトもAPIキーも不要
2. 対象チャンネルを選択（`--channel-handle` または `--channel-id` で指定）するので、ブランドチャンネルでも動作
3. 15分の未認証チャンネル制限に対して動画の長さを事前チェックし、「処理が中断されました」として拒否される場合は、アップロードを無駄にする**前**に停止
4. 動画をアップロードし、メタデータJSONからタイトル / 説明 / タグを設定し、サムネイルを添付
5. 「本人確認」ゲートを適切に処理（`--keep-open` で一度クリア）
6. アップロードが実際に公開されたことを検証し、明確な終了コードを返す

デフォルトでは**非公開（private）**の下書きとして公開（`--visibility private`）するので、一般公開前に確認できます——準備ができたら `--visibility unlisted` または `public` を渡してください。設計による安全性：意図せず公開されることはありません。

> **セッションは非公開に保つこと。** このツールは永続的なブラウザプロファイルを通じてあなたの実アカウントにログインします。そのプロファイル——クッキー、フィンガープリント、`debug/` のスクリーンショット——は決してコミットや共有をしてはいけません。リポジトリはまさにこれらのための `.gitignore` を同梱しています。それを尊重してください。YouTubeの自動化はアカウントのレート制限や凍結を招くこともあるので、自分のアカウントを、一度に1セッションずつ、自己責任で使ってください。

### 完全なコンテンツファクトリー

3つのツールをつなげば、ブログ記事は手動編集ゼロ・手動アップロードゼロで公開済みのYouTube動画になります：

```
article + NotebookLM audio/slides
      │
      ▼
  video-maker      → builds the MP4 (synced slides + subtitles + thumbnail)
      │
      ▼
  video-metadata   → title, description, tags, chapter timestamps, SRT
      │
      ▼
  video-publisher  → uploads and publishes to YouTube (browser, no API keys)
      │
      ▼
   YouTube 🎬
```

## ワークフロー：アイデアからYouTubeまで30分

| ステップ | 作業内容 | 時間 |
|----------|----------|------|
| 1 | NotebookLMに素材をアップロード | 2分 |
| 2 | 音声とスライドを生成 | 5分 |
| 3 | ファイルをダウンロードして`input/`に配置 | 1分 |
| 4 | `run_pipeline.sh`を実行（video-maker + video-metadata） | 10〜15分（待機） |
| 5 | `publish.py`を実行（video-publisher）——あなたに代わってアップロード・公開 | 2分 |

**合計：約25分**。そのほとんどはスクリプトの待機時間で、手動の操作はNotebookLMでの数クリックだけです。YouTube Studioへのアップロード、メタデータの貼り付け、字幕とサムネイルの添付はすべて自動化されました。以前は2時間以上の手作業が必要でした。

## その他のオープンソース動画ツール

### video-use：Claude Codeで動画編集

[video-use](https://github.com/browser-use/video-use) — Claude Codeを通じて直接動画を編集できるオープンソーススキル。生の映像をフォルダに入れて指示するだけで、フィラーワードカット、カラーグレーディング、字幕焼き込み、アニメーションオーバーレイを自動実行。LLMは動画を「見る」のではなく**読む**——12KBのテキストと数枚のPNGだけで処理。

### OpenShorts：ショート動画のフルプラットフォーム

[OpenShorts](https://github.com/mutonby/openshorts) — Docker上のセルフホスト型プラットフォーム。**Clip Generator**（長時間動画→バイラルショート）、**AI Shorts**（AIアクターでマーケティング動画生成、$0.65〜）、**YouTube Studio**（AIサムネイル・タイトル・説明文生成）を統合。完全無料、オープンソース、透かしなし。

## 制限事項

- **同期品質はスライドテキストに依存**
- **シングルスピーカー前提**
- **デフォルトはmacOS**（Linuxでは`libx264`を使用）
- **NotebookLMの品質は入力素材に依存**

## すべてのツールはオープンソースです：

- 🔧 [video-maker](https://github.com/suenot/video-maker) — 音声 + PDFから動画を構築
- 🔧 [video-metadata](https://github.com/suenot/video-metadata) — YouTubeメタデータを生成
- 🔧 [video-publisher](https://github.com/suenot/video-publisher) — ブラウザセッションでYouTubeへ公開（APIキー不要）
- 🎬 [video-use](https://github.com/browser-use/video-use) — Claude Codeで動画編集
- 🎬 [OpenShorts](https://github.com/mutonby/openshorts) — ショートとAI動画のフルプラットフォーム

> **重要：** `video-maker`、`video-metadata`、`video-publisher` はそのまま使える完成品ではなく、**スターターテンプレート**です。基本シナリオではすぐに動きますが、任意のAIエージェント（Claude Code、Codex、Cursorなど）でカスタマイズすることを前提に設計されています。Forkして、自分のブランドとコンテンツスタイルに合わせてください。

---

*NotebookLMでコンテンツを作成し、スクリプトで自動組み立て。アイデアからYouTubeへの最速パスです。*
