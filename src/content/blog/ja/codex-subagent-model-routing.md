---
title: "Codex のサブエージェントに使うモデルの選び方"
description: "サブエージェント起動前に Luna または Sol を選ぶルーターを作った。Django タスクの費用とベンチマークの限界を記録する。"
pubDate: 2026-09-25
heroImage: "/images/blog/codex-subagent-model-routing-hero.png"
tags: ["codex", "model-routing", "jev", "benchmarks", "ai-cost-optimization"]
draft: false
---

# Codex のサブエージェントに使うモデルの選び方

メソッド定義を探す、いくつかのファイルから設定値を拾う、ソースコードに関する主張を確かめる。こうした小さな仕事をサブエージェントに頼むことが多い。Sol high は十分にこなせるが、毎回使うと API 料金は高くなる。そこで、起動前にモデルを一度選ぶようにした。

[Codex Jev Router](https://github.com/suenot/codex-jev-router)は短いタスク概要を受け取り、Codex のモデルと推論レベルを選ぶ。その後、サブエージェントは通常の Codex ツールで作業する。作業途中でモデルを切り替えたり、エージェントに代わってツールを選んだりはしない。

## 起動前の流れ

プロジェクトの指示では、親エージェントがソースコード、ログ、秘密情報を含まない短い概要を判定エンジンに渡す。既定は Jev で、Laya のようなローカルエンジンや対応するアダプターにも切り替えられる。エンジンは型付きの回答を返し、ルーターの規則が確信度を確認してプロファイルを決める。

正確な位置を探す仕事には Luna low、少数のファイルを扱う範囲の明確な仕事には Luna medium を使える。短くても Sol の判断が必要なら Sol low を選べる。判断が不確かなら Sol high に戻す。Sol ultra は例外的に難しい仕事、または Sol の失敗を確認した後に使う。選ばれた `model` と `reasoning_effort` は `spawn_agent` に明示的に渡される。

現状は親エージェントが Codex の指示に従う仕組みだ。すべての起動を強制的に捕捉するわけではない。Codex CLI で確認したところ、この呼び出しでは `PreToolUse` フックが動かなかった。

## 確認したタスクの費用

[別のベンチマーク用リポジトリ](https://github.com/suenot/codex-jev-router-benchmarks)では、特定のコミットに固定した Django のソースを使った。ソースを読む三つのタスクを、それぞれ独立した Sol high とルーターが選んだプロファイルで三回ずつ実行した。九組の回答はすべて固定したソースと一致した。SWE-bench Verified の範囲を絞った Django 修正も各条件で三回実行し、公式のローカル回帰テストで確認した。

| タスク | 単独の Sol high | ルーターの選択と Jev | 費用差 | 確認結果 |
| --- | ---: | ---: | ---: | --- |
| Django ソースの調査、9 組 | $0.214806 | $0.062317 | 71.0% 低い | 両条件で 9/9 正解 |
| 範囲を絞った Django 修正、3 組 | $0.555916 | $0.009668 | 98.3% 低い | 両条件で公式テスト 3/3 合格 |

金額は、測定した入力、キャッシュ済み入力、出力トークンに[短いコンテキストの Standard API 料金](https://developers.openai.com/api/docs/pricing)を当てはめた推定値だ。ルーター側には別に見積もった Jev の判定費用も加えた。Codex のサブスクリプションで実際に請求された額ではない。[レポート](https://github.com/suenot/codex-jev-router-benchmarks/blob/main/BENCHMARK.md#estimated-api-cost-savings)に実行記録、元の使用量、計算式を載せている。

修正タスクには注意点がある。最初の Luna medium 実行は、ルーターの閾値を変更する前に Jev の選好から設定した実験用プロファイルだった。閾値の変更後は、繰り返した三回の実際の判定が Luna medium を選んだ。公式のローカル回帰テストは実施したが、SWE-bench の Docker 環境での完全な評価はしていない。

## まだ分からないこと

安価なプロファイルが使えそうなタスクを意図的に選んだ。この数字から、任意のサブエージェント作業の平均費用は推定できない。レポートには同じモデル同士でも使用量が変わる対照実験もある。以前の pytest 修正では両条件ともテストに失敗し、ルーター側の費用が高かった。この結果も残している。

次はタスクの構成を事前に決め、再試行や失敗の費用を回答の品質と一緒に測りたい。今のルーターは、範囲の明確な仕事を Luna に任せるための設定手段だ。[導入手順](https://github.com/suenot/codex-jev-router#instructions-for-codex)と[ベンチマーク資料](https://github.com/suenot/codex-jev-router-benchmarks)を公開しているので、自分のタスクでも確かめられる。
