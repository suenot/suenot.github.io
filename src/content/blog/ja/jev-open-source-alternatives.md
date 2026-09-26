---
title: "オープンソースの Jev 代替プロジェクト16選"
description: "Laya、Kev、GLiNER2.5-Decide などの仕組みと、Codex サブエージェントのモデル選択に使う際の注意点。"
pubDate: 2026-09-25
updatedDate: 2026-09-26
tags: ["jev", "open-source", "model-routing", "codex"]
draft: false
---

## TL;DR

- [Laya](https://github.com/NandhaKishorM/laya)
- [Kev](https://github.com/jaredpalmer/kev)
- [GLiNER2.5-Decide](https://huggingface.co/fastino/GLiNER2.5-Decide)
- [JevK5](https://huggingface.co/alibiserikbay/JevK5)
- [GLiFormer large-v1](https://huggingface.co/knowledgator/gliformer-large-v1)
- [PlayJev](https://github.com/OmniJev/PlayJev)
- [SemIf](https://github.com/TheoLeeCJ/SemIf-OpenJev)
- [NanoJev](https://github.com/TianyuCodings/NanoJev)
- [jevlike](https://github.com/vinnylarouge/jevlike)
- [simple-jev](https://github.com/featherless-ai/simple-jev)
- [AnyJev](https://github.com/nokia-applied-research/AnyJev)
- [mini-jev](https://github.com/r-ms/mini-jev)
- [open-jev (nico-martin)](https://github.com/nico-martin/open-jev)
- [minojev](https://github.com/zeredy879/minojev)
- [Open-Jev (Zefan-Cai)](https://github.com/Zefan-Cai/Open-Jev)
- [open-jev (daseinlabs)](https://github.com/daseinlabs/open-jev)

Jev は状態と質問群を受け取り、選択肢、スコア、数値といった短い型付きの判断を返します。[私の Codex サブエージェント用ルーター](https://github.com/suenot/codex-jev-router)では、次に起動するエージェントのモデルと推論レベルを選ぶために使います。以下にはローカルサーバー、学習用ツール、ゲーム画面を扱うモデルが混在しています。名前が似ていても、用途はかなり異なります。

## Laya

[Laya](https://github.com/NandhaKishorM/laya) は一度の推論で複数の型付き質問に答えます。Python ライブラリと Jev 互換のローカル HTTP サーバーがあり、英語用と多言語用のチェックポイントを提供します。日本語でタスク概要を書くなら後者を試す価値があります。バッチ処理にも対応しますが、Codex に使う前には手元のタスクで精度と確率の校正を確認したいところです。

## Kev

[Kev](https://github.com/jaredpalmer/kev) は複数サイズのオープンモデルとローカルの `/v1/systemone` を提供します。README は 4B からの開始を勧めており、大きな版ほどメモリを要します。ローカル計算資源があれば、リモートの判断エンジンの代替候補になります。公開された測定値は作者のテストに関するもので、Codex のルーティング品質を示すものではありません。

## GLiNER2.5-Decide

[GLiNER2.5-Decide](https://huggingface.co/fastino/GLiNER2.5-Decide) は推論時に指定したラベルでテキストを分類します。英語版は340Mパラメータで、[1B版](https://huggingface.co/fastino/GLiNER2.5-Decide-1B) と [287Mの多言語版](https://huggingface.co/fastino/GLiNER2.5-multi-Decide) もあります。GLiNER2 の `AutoExtractor.classify_text()` はテキストを生成せず、1回で複数の分類を返せます。Jev System One とは API が異なるため、Codex にはアダプターが必要です。

## JevK5

[JevK5](https://huggingface.co/alibiserikbay/JevK5) は Kev とは別の Qwen3.5-4B ベースのプロジェクトです。SemIf の方式で logits から選択肢の確率を読み取り、[ローカルサーバー](https://github.com/allebee/jevk5) は `/v1/systemone` を提供します。Codex の依頼での速度と精度は別途測る必要があります。

## GLiFormer large-v1

[GLiFormer large-v1](https://huggingface.co/knowledgator/gliformer-large-v1) は DeBERTa ベースの575.6Mパラメータのモデルです。指定したラベルによる分類に加え、エンティティ、関係、構造化データの抽出にも対応します。テキストの振り分けには分類機能を使えますが、Jev との接続にはアダプターが必要です。

## PlayJev

[PlayJev](https://github.com/OmniJev/PlayJev) はブラウザーゲームの画面と許可された行動から次の一手を選びます。`/v1/systemone` で選択確率を返しますが、入力は画像を含むゲーム専用の形式です。コード検索を任せるエージェントの選択には、別のモデルか再学習が必要です。画像に基づく型付き判断の例として面白いプロジェクトです。

## SemIf

[SemIf](https://github.com/TheoLeeCJ/SemIf-OpenJev) は旧 OpenJev で、オープンな言語モデルの logits から選択肢のスコアを読み取ります。PyTorch、MLX、llama.cpp で動き、CLI は JSONL を受け付けます。Codex との接続にはアダプターが必要です。専用チェックポイントなしでローカルの判断を試せますが、毎回モデルをロードすると時間面の利点が消えることがあります。

## NanoJev

[NanoJev](https://github.com/TianyuCodings/NanoJev) は小さな Qwen を基盤に、選択、真偽値、スコア用のヘッドを載せています。重み、データ、学習コードとローカルの `/api/evaluate` サーバーが公開されています。公開モデルの学習対象は主にゲームです。Codex のタスク概要にも通用するかは別途測る必要があります。

## jevlike

[jevlike](https://github.com/vinnylarouge/jevlike) は研究用の部品に近く、小さなバイトエンコーダーを学習するか、固定した Hugging Face エンコーダーで任意のテキスト候補を採点します。CLI で学習と推論ができます。Codex の正確なファイル検索と難しい診断を区別できるという検証結果はありません。自分の委任タスクを集めて、その分類器を作る用途に向いています。

## simple-jev

[simple-jev](https://github.com/featherless-ai/simple-jev) は対応するオープン言語モデルの logits を使い、JSON を生成せず型付きの結果を得ます。Transformers と PyTorch のサーバーは `/v1/classifier` と `/v1/systemone` の別名を提供します。結果は基盤モデルと選択肢の書き方に左右され、スコアを校正済みの成功確率とは見なせません。手元で動かしているモデルを試すには便利です。

## AnyJev

[AnyJev](https://github.com/nokia-applied-research/AnyJev) は既存の言語モデル向けに、ラベル不要の位置バイアス補正、温度校正、隠れ状態を使う学習済みヘッドという三段階を用意しています。後者には自分のタスク例が必要で、ヘッドにはモデル内部の状態へのアクセスも要ります。決まった種類の委任タスクに合わせる用途に合います。最も簡単なモードでも複数回の推論が必要な場合があり、遅延は実測すべきです。

## mini-jev

[mini-jev](https://github.com/r-ms/mini-jev) は固定した Qwen の logits による候補採点と、文法制約付き JSON 生成を比較します。実運用向けのルーターというより、学習とベンチマークのための実装です。スコアで順位は付けられますが、確率の校正は保証されません。短い判断で何が節約でき、単純な真偽値では利点が小さくなる理由を調べられます。

## nico-martin の open-jev

[nico-martin/open-jev](https://github.com/nico-martin/open-jev) は Transformers.js と WebGPU または WASM を使い、ブラウザーで型付きの判断を実行します。TypeScript API は `OpenJev.load().decide()` で、Kev の派生版を含む複数モデルに対応します。Web アプリ内でローカルに判断したい場合に便利です。Codex には Node の橋渡しが必要で、初回は重みのダウンロードも発生します。

## minojev

[minojev](https://github.com/zeredy879/minojev) は固定した Qwen3-1.7B と小さな学習可能な判断ヘッドを組み合わせます。ローカルの `/score` で型付き質問を受け付け、重みとデータを公開し、CPU でも動きます。作者は学習分布の外にあるタスクで性能が落ちる例も示しています。Codex に使うなら、実際の委任タスクで評価してから判断したいモデルです。

## Zefan-Cai の Open-Jev

[Zefan-Cai/Open-Jev](https://github.com/Zefan-Cai/Open-Jev) は判断ヘッドと校正を備えた 2B、9B、27B の学習済みモデルを公開しています。ローカルの `/v1/systemone` サーバー、データ、学習ツールもあります。同じような名前の三つの中では完成したモデル群に近いものの、実行コストはサイズ次第です。公開ベンチマークの結果は、サブエージェントの振り分けにも当てはまるか確認が必要です。

## daseinlabs の open-jev

[daseinlabs/open-jev](https://github.com/daseinlabs/open-jev) は Gemma 3 4B で選択肢を採点し、共通プレフィックスの再利用とバッチ処理で重複を減らします。ローカルの `/score` と `/v1/systemone`、Mac 向け MLX、他の環境向け PyTorch、タスク別のヘッド学習を用意しています。Gemma の重みには Hugging Face で利用条件への同意が必要です。Mac でローカル推論を使っているなら、ルート全体の時間を測る候補になります。

## fast-decisions での比較

Fastino は [モデルカード](https://huggingface.co/fastino/GLiNER2.5-Decide) で [fast-decisions](https://huggingface.co/datasets/fastino/fast-decisions) の完全一致率を公開しています。英語の17分野で各300件の保留例を使い、全モデルに同じテキストと候補ラベルを渡しています。以下は公開元の結果であり、独立した検証ではありません。

| モデル | 平均 |
|---|---:|
| [GLiNER2.5-Decide (340M)](https://huggingface.co/fastino/GLiNER2.5-Decide) | 60.2% |
| [GLiNER2.5-Decide-1B](https://huggingface.co/fastino/GLiNER2.5-Decide-1B) | 59.6% |
| [JevK5](https://huggingface.co/alibiserikbay/JevK5) | 57.6% |
| [GLiNER2.5-multi-Decide (287M)](https://huggingface.co/fastino/GLiNER2.5-multi-Decide) | 56.7% |
| [SemIf](https://github.com/TheoLeeCJ/SemIf-OpenJev) (Qwen3.5-4B) | 56.4% |
| [GLiFormer large-v1](https://huggingface.co/knowledgator/gliformer-large-v1) | 49.0% |
| [Laya Router](https://github.com/NandhaKishorM/laya) | 46.6% |

公開データは各分野100件の開発用例で、表の数値は別の保留セットに基づきます。自分の Codex の依頼や日本語での振り分け精度は判断できません。

## Codex で選ぶなら

慣れた HTTP 形式のローカルサービスが欲しい場合は、Laya、Kev、JevK5、simple-jev、サーバー版の Open-Jev から試します。自分の委任タスクで学習するなら NanoJev、jevlike、AnyJev、minojev が候補です。SemIf と mini-jev は短い判断の仕組みを調べるのに役立ちます。PlayJev は視覚的なゲームを対象とします。GLiNER2.5-Decide と GLiFormer は、別のアダプターを用意して分類器として検証できます。

[Codex Jev Router](https://github.com/suenot/codex-jev-router) は、これらの一部をアダプター経由で利用できます。API が互換でも精度や費用の削減率が等しいわけではありません。切り替える前に、判断そのものの時間と費用、誤った振り分け、後続エージェントの費用を合わせて測ります。私自身のタスク群で16件すべてを比較した公開データは、まだありません。
