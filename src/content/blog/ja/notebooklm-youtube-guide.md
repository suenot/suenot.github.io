---
title: "NotebookLMでYouTube動画を作る方法：完全ガイド"
description: "ステップバイステップのチュートリアル：NotebookLMで音声とスライドを生成し、字幕、チャプタータイムスタンプ、メタデータ付きのYouTube動画に自動組み立て。動画編集ソフト不要。"
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
- 🎬 [Walk-Forward Optimization: The Only Honest Strategy Test](https://www.youtube.com/watch?v=y_cC6LWXFKM) — **video-youtube-prepare** の例：NotebookLMが完成動画を生成し、スクリプトがメタデータ（タイトル、説明、タグ、タイムスタンプ、字幕）を準備

どちらの場合も動画編集ソフトや手作業は不要。すべて自動で組み立てられています。

## 2つのシナリオ

### シナリオ1：音声 + スライドがある → 動画を組み立てる

**ツール：** [video-maker](https://github.com/suenot/video-maker)

### シナリオ2：完成動画がある → YouTubeメタデータが必要

**ツール：** [video-youtube-prepare](https://github.com/suenot/video-youtube-prepare)

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
git clone https://github.com/suenot/video-youtube-prepare.git
cd video-youtube-prepare
pip install openai-whisper

python scripts/prepare_metadata.py \
    --video input/my-video.mp4 \
    --slug my-article-slug \
    --output-dir output/my-article-slug \
    --whisper-model base
```

## ワークフロー：アイデアからYouTubeまで30分

| ステップ | 作業内容 | 時間 |
|----------|----------|------|
| 1 | NotebookLMに素材をアップロード | 2分 |
| 2 | 音声とスライドを生成 | 5分 |
| 3 | ファイルをダウンロードして`input/`に配置 | 1分 |
| 4 | `run_pipeline.sh`を実行 | 10〜15分 |
| 5 | YouTube Studioで動画をアップロード | 2分 |
| 6 | メタデータをコピー | 2分 |
| 7 | 字幕とサムネイルをアップロード | 1分 |

**合計：約30分**。以前は2時間以上の手作業が必要でした。

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
- 🔧 [video-youtube-prepare](https://github.com/suenot/video-youtube-prepare) — YouTubeメタデータを生成
- 🎬 [video-use](https://github.com/browser-use/video-use) — Claude Codeで動画編集
- 🎬 [OpenShorts](https://github.com/mutonby/openshorts) — ショートとAI動画のフルプラットフォーム

> **重要：** `video-maker` と `video-youtube-prepare` はそのまま使える完成品ではなく、**スターターテンプレート**です。基本シナリオではすぐに動きますが、任意のAIエージェント（Claude Code、Codex、Cursorなど）でカスタマイズすることを前提に設計されています。Forkして、自分のブランドとコンテンツスタイルに合わせてください。

---

*NotebookLMでコンテンツを作成し、スクリプトで自動組み立て。アイデアからYouTubeへの最速パスです。*
