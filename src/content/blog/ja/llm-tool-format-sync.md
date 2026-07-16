---
title: "KimiにClaude Codeを話させる：ツールフォーマット変換の実践ガイド"
description: "LLMプロバイダー間でツール呼び出しフォーマットを変換するあらゆるユーティリティ — LiteLLM、Bifrost、Portkey、claude-code-router、Vercel AI SDK、ファーストパーティの /anthropic エンドポイント — それぞれが実際に何をするのか、そしてどれもが解決できていない3つの障害クラス。加えて、私がたどり着いた結論：モデルごとにコンテキストを下方向に適応させるのをやめ、代わりにハーネスを統率するハーネスを作れ。"
pubDate: 2026-07-13
heroImage: "/images/blog/llm-tool-format-sync-hero.png"
tags: ["llm", "claude-code", "tool-calling", "harness", "proxy", "kimi", "orchestration"]
draft: false
---

# KimiにClaude Codeを話させる：ツールフォーマット変換の実践ガイド

Claude Codeのハーネス — サブエージェント、スキル、フック、何ヶ月もかけてチューニングした足場のすべて — を動かしたい。でも、フラッグシップの請求額が痛いので、Kimi K2.5やGLM、DeepSeekで駆動したい。そこにたどり着く方法は2つあり、どちらも同じ壁にぶつかります。

1. **Claude Codeのツールを別のモデルに食わせる。** そのツール定義は最初のリクエストに入り、すべてのツール呼び出しはClaude Codeが期待する形で返ってこなければなりません。つまり、誰かがワイヤーフォーマットを変換する必要があります。
2. **サードパーティのハーネスを使う**（OpenCode、Cline、Goose、Crush）。これらは既にあらゆるプロバイダーを話せます。ただしその場合、あなたが継承するのは *あなたの* ハーネスではなく *彼らの* ハーネスです。

この記事は、選択肢1を可能にするレイヤー — ツールフォーマット変換器 — について、そして全体像をマッピングした結果、正解はそのどちらでもないと私が考えるに至った理由についてです。

## 1. なぜ変換はフィールド名の付け替えではないのか

素朴なメンタルモデルはこうです：Anthropicは `input_schema` と呼び、OpenAIは `parameters` と呼ぶ、マッパーを書けば終わり。その部分は *確かに* 些細です。以下が実際の差分です。

**ツール定義：**

| | Anthropic Messages | OpenAI Chat Completions | OpenAI Responses |
| --- | --- | --- | --- |
| 形状 | フラット：`{name, description, input_schema}` | ネスト：`{type:"function", function:{name, description, parameters}}` | フラット：`{type:"function", name, parameters}` |
| Anthropic固有の追加要素 | `cache_control`、`input_examples`、`defer_loading` | — | — |

すでに罠に注目してください：OpenAI自身の **Responses APIはフラット** で、OpenAI Chat CompletionsよりもAnthropicに近いのです。「OpenAIはネストされた `function{}` を意味する」とハードコードする変換器は、OpenAIの半分について間違っています。

**ターン構造 — これが最大の問題です：**

- **Anthropic**：ツール呼び出しは **アシスタントメッセージ内の `tool_use` コンテンツブロック** であり、`text` および `thinking` ブロックと交互に配置されます。結果は **`role: "user"`** のメッセージ内の `tool_result` ブロックとして返ってきます。
- **OpenAI CC**：ツール呼び出しはアシスタントメッセージ **上の** `tool_calls[]` 配列です。結果は **`role: "tool"`** の別々のメッセージです。
- **OpenAI Responses**：どちらでもない — `call_id` で相関付けられる独立した `function_call` アイテムで、この `call_id` はアイテム自身の `id` とは *別のフィールド* です。

プロキシが処理しなければならない結果：Anthropicは同一のアシスタントターン内でテキスト *と* ツール呼び出しの両方を許可します（素朴な変換器はこれらを2つのメッセージに分割し、無効な履歴を生成します）。**すべての `tool_use` には対応する `tool_result` が必要で、さもなければAPIは400を返します** — 「孤立したツール呼び出し（orphaned tool calls）」は最も一般的なサニタイズ作業で、LiteLLMはそのためだけの[専用機能](https://docs.litellm.ai/docs/completion/message_sanitization)を提供しています。

**引数のエンコーディング：** Anthropicの `tool_use.input` は **パース済みのオブジェクト** です。OpenAIの `function.arguments` は **JSONエンコードされた文字列** です。引数ゼロの呼び出しは、消費側が `{}` を期待するところに `""` を出力し、`JSON.parse` が例外を投げます — Vercel AI SDKで現に発生しているバグです（[#10295](https://github.com/vercel/ai/issues/10295)）。

**`tool_choice`：** Anthropicの `any` はOpenAIの `required` に相当します。`disable_parallel_tool_use` はAnthropicでは `tool_choice` の *内側* にありますが、OpenAIではトップレベルの `parallel_tool_calls` です。`tool_choice` を変更すると、キャッシュされたメッセージブロックも無効化されます。

**JSON Schemaの移植性：** 主要なプロバイダーでトップレベルの `$ref` を受け付けるものはありません — インライン化が必須です。Geminiは `items: {}` を拒否します。OpenAIのstrictモードは `pattern`/`minimum`/`format` を受け付けますが、**強制はしません**。そしてResponsesでは、`strict` を *省略* してもとにかくstrictモードを試み、静かに劣化します — つまり、単にツール定義を転送するだけのプロキシは、あなたに知らせることなくセマンティクスを変えてしまっているのです。

以上はすべて機械的な問題です。厄介ですが、解決可能です。次のセクションはそうではありません。

## 2. 誰も解決していない3つのこと

私が調べたすべてのゲートウェイは、同じ3つの箇所で壊れます。

### 2.1 ストリーミングの再構築

非ストリーミングの変換は解決済みの問題です。**Claude Codeは常にストリーミングします。**

- **Anthropic SSE**：`content_block_start`（type `tool_use`、`id` + `name` を運ぶ）→ N回の `content_block_delta`（`{"type":"input_json_delta","partial_json":"…"}` を含む）→ `content_block_stop` → `message_delta`（`stop_reason:"tool_use"` を含む）。
- **OpenAI SSE**：**`index`** フィールドでキー付けされた `delta.tool_calls[]` フラグメント。`id`/`name` は一度だけ現れ、引数は文字列フラグメントとして届き、`finish_reason:"tool_calls"` で終わります。

一方を他方に変換するには、チャンクをまたいで保持される `index` ごとのステートマシンが必要で、そしてここですべてが崩壊します。LiteLLMは `content_block_start` + `content_block_stop` を、**その間に `input_json_delta` を1つも入れずに** 出力したことがあります — すべてのツール呼び出しが `input: {}` で届き、Claude Codeは必須パラメータの欠落を報告します（[#25561](https://github.com/BerriAI/litellm/issues/25561)、#25321、#25390）。Bifrostはテキスト+ツールが混在したターンで `stop_reason: "tool_use"` の代わりに `stop_reason: "end_turn"` を送り、クライアントはアシスタントが完了したと誤認します（[#3638](https://github.com/maximhq/bifrost/issues/3638)）。Portkeyはストリーミングのデルタから `assistant` ロールを落とします（[#1000](https://github.com/Portkey-AI/gateway/issues/1000)）。Roo Codeは、プロバイダーをまたいだストリーミングの不整合を取り繕うためだけに、チャンクをまたいで2つの静的なステートマップを保持していました。

### 2.2 推論状態は不透明かつ必須

これが、Claude Code＋外部モデルという構成が損失を伴う、最も深い構造的理由です。

Anthropicの[拡張思考ドキュメント](https://platform.claude.com/docs/en/build-with-claude/extended-thinking)は明確です：`tool_result` をポストするとき、直前のアシスタントメッセージ上の `thinking` ブロックは **完全かつ未改変のまま返送されなければなりません**。さもなければ `400: "thinking or redacted_thinking blocks in the latest assistant message cannot be modified"` が発生します。Anthropic自身のドキュメントで名指しされている根本原因は *「コンテンツブロックをタイプでフィルタリングするアプリケーションコード」* — まさにフォーマット変換器がやっていることです。

そして thinking ブロック上の `signature` は **推論の暗号化された表現** であり、サーバーはこれを復号して状態を再構築します。**それを運ぶOpenAIのワイヤーフィールドは存在しません。** Chat Completionsを経由するラウンドトリップはそれを破壊します。だからこそLiteLLM #15601、vercel/ai #11602、claude-code-router #1400/#1410 が、別々のコードベースに対する別々のオープンなバグとして存在するのです：これらは同じバグなのです。

どのプロバイダーも独自の版を持ち、どれも相互運用できません — Anthropicの `signature`、OpenAIの `reasoning.encrypted_content`（これはストリーミングでは **`output_item.added` には存在せず、`output_item.done` にのみ現れます** — 最初のイベントしか読まない変換器は静かにこれを落とします）、Geminiの `functionCall` パート上の `thought_signature`。知っておく価値のあることがもう一つ：**`tool_choice: any` と `tool_choice: tool` は拡張思考ではハードエラーになります** — 使えるのは `auto`/`none` だけ — これは強制ツールによる構造化出力を完全に壊します。

### 2.3 プロンプトキャッシングが蒸発する

`cache_control` はAnthropic固有です。OpenAIのキャッシングは暗黙的なので、マッピングする先がありません。**すべてのAnthropic→OpenAI変換は、あなたのプロンプトキャッシングを静かに捨てます** — [トークン節約ガイド](/blog/saving-tokens-llm)における最大のレバーです。トークン単価では節約しても、キャッシュミスでそれを払い戻すことになり、ログには何も表示されません。

DeepSeekは、これを明言している唯一のベンダーです：彼らの[Anthropic互換ドキュメント](https://api-docs.deepseek.com/guides/anthropic_api)は、`cache_control` を *サポート対象外* として、画像、ドキュメント、MCP統合のすぐ隣に列挙しています。その姿勢には敬意を表します。

## 3. 変換器たち

### LiteLLM — Python、約53k ★、プロキシ + ライブラリ

[LiteLLM](https://github.com/BerriAI/litellm) はデフォルトの答えであり、人々が常に混同する2つのAnthropicサーフェスを持っています。`POST /anthropic/*` は **パススルー** です — 変換なし、Anthropicに転送してコスト追跡を追加するだけ。`POST /v1/messages`（[`anthropic_messages`](https://docs.litellm.ai/docs/anthropic_unified/)）が **本物の変換** です：Anthropicフォーマットが入り、任意のプロバイダーが出ます。Claude Codeは[ファーストクラスで文書化](https://docs.litellm.ai/docs/tutorials/claude_non_anthropic_models)されています — `ANTHROPIC_BASE_URL` をそこに向け、`CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY=1` を設定します。

これは最も完成度が高く、最も実戦で鍛えられており、そして §2.1 のストリーミングバグの大半が報告された場所でもあります — それが劣っているからではなく、誰もが使っているからです。Pythonであり、重く、そのロギングはそれ自体が問題になるほど饒舌です。

### Bifrost — Go、約6.5k ★、Apache-2.0、ゲートウェイ

[Bifrost](https://github.com/maximhq/bifrost) は、Pythonプロセスの代わりに単一のバイナリが欲しいときに私が手を伸ばすものです。ドロップイン式のプレフィックス（`/openai`、`/anthropic`、`/genai`）を持ち、[Claude Codeはファーストクラスで文書化されたターゲット](https://docs.getbifrost.ai/cli-agents/claude-code)であり、`ANTHROPIC_DEFAULT_SONNET_MODEL` / `..._HAIKU_MODEL` のオーバーライドを備えています。変換ステップを正直に文書化しています — システムメッセージの抽出、ツールメッセージのグループ化、thinkingブロックの変換、最低1024の予算での `reasoning`→`thinking`。MCPゲートウェイでもあります。

その「LiteLLMより50倍高速、11µsのオーバーヘッド」という主張はベンダー公表であり、独立した再現はありません。それ相応に扱いましょう。

### Portkey AI Gateway — TypeScript、約12k ★、ゲートウェイ

[Portkey](https://github.com/Portkey-AI/gateway) は最もクリーンなコンセプトを持っています：**3つのユニバーサルな受け口フォーマット** — `/v1/chat/completions`、`/v1/responses`、`/v1/messages` — それぞれが *すべての* プロバイダーで動作します。構造上、双方向です。しかしファーストパーティのClaude Codeチュートリアルはなく、オープンなイシューはまさに §2 の障害クラスそのものです（並列呼び出しで tool_use↔tool_result のIDペアリングが壊れる、Anthropicで `tool_choice: none` が拒否される、ストリーミングデルタでロールが欠落する）。

### claude-code-router — TypeScript、約36k ★

ここで古びたメンタルモデルを訂正しておく価値があります：[CCR](https://github.com/musistudio/claude-code-router) はもはや、人々が記憶している小さな変換プロキシではありません。今や **v3.0.11 の モノレポで、Electronのコントロールパネルとローカルモデルゲートウェイを同梱** し、CodexやZCodeも駆動し、OpenRouter、DeepSeek、Moonshot/Kimi、Z.AI、MiniMax、SiliconFlowのプリセットを備えています。変換レイヤーは、別個のはるかに小さなライブラリ [musistudio/llms](https://github.com/musistudio/llms) として存続しており、4つのフックインターフェース（`transformRequestIn/Out`、`transformResponseIn/Out`）を持ちます。

そのイシュートラッカーを読むと、§2.2 のパターンが飛び出してきます：オープンなバグは、素のツール呼び出しではなく **推論 × ツール呼び出し** に集中しているのです。ストリーミング中の推論がツール引数のデルタを破壊する、Kimiの `reasoning_content` がツール呼び出し履歴をまたいで保持されない、Geminiの `thought_signature` の欠落、DeepSeekのthinking+toolsで400。素のツール呼び出しは動きます。thinkingとツール呼び出しの組み合わせこそ、血を流す箇所です。

### Vercel AI SDK — TypeScript、約25k ★、**ゲートウェイではなくライブラリ**

[AI SDK](https://ai-sdk.dev/docs/foundations/tools) は、プロバイダーごとのアダプターを介してプロセス内で正規化します。`tool({description, inputSchema, execute})`、Zodまたは生のJSON Schema。Bun/TSスタックには見事にフィットしますが、これは **ライブラリ** です — まず周囲にプロキシを構築しない限り、Claude Codeの前に置くことはできません。

SDK全体で最も雄弁なディテールは `experimental_refineToolInput` です。これはドキュメントによれば「異なるLLMプロバイダーがわずかに異なるツール入力を生成する」（`null` vs `""`）ために存在します。正規化が損失を伴うことの公式な認定として出荷された脱出ハッチです。

## 4. プロキシというカテゴリーは死につつある、そしてそれは朗報だ

ここで、私が予期していなかった発見があります。最もよく知られたコミュニティ製のAnthropic互換プロキシ4つのうち、**2つがこの半年でアーカイブされました**：[y-router](https://github.com/luohy15/y-router)（2026年1月にアーカイブ、READMEは今やOpenRouterの公式統合を指しています）と [anthropic-proxy](https://github.com/maxnowack/anthropic-proxy)（2026年4月にアーカイブ）。これらを殺したのは、**プロバイダー自身がそのエンドポイントを出荷した** ことです：

| プロバイダー | Anthropic互換のベースURL |
| --- | --- |
| Moonshot / Kimi | `https://api.moonshot.ai/anthropic` |
| Z.ai / Zhipu GLM | `https://api.z.ai/api/anthropic` |
| DeepSeek | `https://api.deepseek.com/anthropic` |
| MiniMax | `https://api.minimax.io/anthropic` |
| Qwen / DashScope | `https://dashscope-intl.aliyuncs.com/apps/anthropic` |
| OpenRouter | `https://openrouter.ai/api`（彼らの「Anthropicスキン」） |

これはまさに、[Clother](/blog/clother-claude-wrappers) と [OpenClaude](/blog/openclaude-multi-provider) が環境変数で切り替えているリストです。**つまり、よくあるケース — 「KimiにClaude Codeを駆動させたい」 — では、フォーマット変換器はまったく必要ありません。** ベンダーが、サーバー側で、無料であなたのために一つ動かしてくれています。`ANTHROPIC_BASE_URL` を設定して進むだけです。

2つの注意点。Kimiの `/anthropic` エンドポイントは **広く使われているがベンダー未文書化** です（ドキュメントを求める[オープンな要望](https://github.com/MoonshotAI/Kimi-K2/issues/129)があります）。そして **Cloudflare AI Gatewayはここでは間違ったツールです** — その `/anthropic` ルートはパススルーのみで、Anthropic *への* トラフィックをキャッシュ・観測しますが、そこから変換して離れることはしません。

本物の変換器に手を伸ばすのは、ベンダーのエンドポイントが与えてくれないものが必要なときです：**ルーティング**（Haiquクラスのサブエージェントには安価なモデル、リードにはフラッグシップ）、レートリミット時のプロバイダー横断のフェイルオーバー、フリート全体のコスト計上を一箇所に — [トークンガイド](/blog/saving-tokens-llm)の §2 が扱っている類のものです。

## 5. もう一つのルート：すでに正規化しているハーネス

Claude Codeのために変換したくないなら、そもそもClaudeのフォーマットを必要としなかったハーネスを使いましょう：

| ハーネス | 言語 | ★ | どう正規化するか |
| --- | --- | --- | --- |
| **OpenCode** | TS/Bun | 185k | Vercel AI SDK + [models.dev](https://models.dev) レジストリ |
| **Cline** | TS | 65k | 独自のプロバイダー別ハンドラー |
| **Goose** | Rust | 51k | 独自の `Provider` トレイト |
| **Crush** | Go | 27k | [fantasy](https://github.com/charmbracelet/fantasy) + catwalk レジストリ |
| **Aider** | Python | 47k | LiteLLM — ただし ⚠️ 2026年5月以降停滞 |
| **Roo Code** | TS | 24k | 🔴 **2026年5月にアーカイブ** |

この表が私に教えてくれたことが3つあります：

1. **XMLツール呼び出しの時代は終わった。** Cline v3.35 はシステムプロンプト内のXMLからネイティブなJSONツール呼び出しへ移行しました。RooはXMLを完全に削除し、今や `id` のないツール呼び出しをハードに拒否します。モデルにXMLを出力させるようプロンプトすることでフォーマット変換を回避しようと計画していたなら — その船は出航済みで、業界は意図的にそれを送り出したのです。
2. **Gooseの「toolshim」は、これがすべてシム化可能なレイヤーであることの実在証明だ。** ネイティブなツール呼び出しを持たないモデルに対して、GooseはプライマリモデルにゆるいJSONを出力させ、次に **2つ目の安価なインタープリターモデル**（Ollama上のデフォルトは `mistral-nemo`）を走らせて、それを有効なツール呼び出しへと矯正します。実験的でハングもしますが、概念的にはこのアイデアの最も純粋な表明です：ツールフォーマットは変換問題であり、変換は小さなモデルに委ねられる仕事なのです。
3. **Aiderはこの件のいかなる参照点でもない** — 意図的にツール呼び出しを一切避け、SEARCH/REPLACEのテキストブロックで編集します。その障害モードはスキーマのドリフトではなく「ブロックがマッチしなかった」です。別の宇宙です。

そして正規化レイヤーのリファレンス実装を言語別に言うと：**TS → Vercel AI SDK、Go → charmbracelet/fantasy、Python → LiteLLM、Rust → 自作せよ。**

## 6. 標準規格はあなたを救わない

**MCPはこれを解決しない。** これは私がぶつかった最もよくある誤解です。MCPは *ディスカバリーとトランスポート* のレイヤーです：`tools/list` がJSON Schemaを渡し、その後 **ハーネスは依然として各MCPツールをプロバイダーのネイティブなツール定義へ変換しなければならず**、モデルは依然としてプロバイダーネイティブなツール呼び出しを出力します。§1 のすべての移植性の落とし穴がそのまま適用されます。MCPは問題の上に乗っているだけで、問題そのものには触れていません。

MCP自身にも変動があります：次のスペック改訂は **2026-07-28** に到来し、ローンチ以来最大のものです — `initialize` ハンドシェイクが **完全に削除** され、`Mcp-Session-Id` が消え、HTTP+SSEトランスポートが非推奨になります。`2025-11-25` に対して書かれたものはすべて手直しが必要になります。

ユニバーサルなツール呼び出しスペックについて言えば：**勝っているものは何もない。** [UTCP](https://www.utcp.io) は実在し、活発で、ニッチです（スペックで約300★） — そしてMCP互換プラグインを同梱しており、それが誰が勝っているかを物語ります。`agents.json` は死んでいます（最後のプッシュは2025年8月）。IBMのACPはA2Aに吸収されました。A2A自体は健全ですが **直交** しています：不透明なエージェント間のagent↔agent相互運用であり、ツールスキーマの正規化ではありません。事実上の標準化は退屈な方法で起きています — すべてのベンダーが `/chat/completions` の形状を、そして今や `/v1/messages` の形状も複製することによって。

## 7. 私が実際にたどり着いた結論：Claudeの *下* ではなく *上* に構築せよ

私はしばらく、Claude Codeを **下から** 最適化しようとしていました — その作業の一部を横取りし、その下のモデルを差し替え、そのコンテキストを削り、そのツールを変換する。そしてそれは行き止まりだと考えています。動かせないからではなく、§2 が語っていることのためです：ストリーミングの再構築、不透明な推論状態、消え去るプロンプトキャッシング — これらは、**どの変換レイヤーも解決しておらず、緩和しただけの** 3つの障害クラスです。あなたは機能を作っているのではなく、3つの動くAPIに対する永続的なメンテナンスに申し込んでいるのです。ハーネスの下で最適化するのは研究プロジェクトです — 終わりのない実験、取扱説明書なし — そして、プロバイダーがマイナーバージョンを出荷するたびに壊れるものを生み出します。

より良い一手は逆方向です：**Claude Codeの上に座る自分自身のハーネスを作り、Claude Codeを複数あるブラックボックスエージェントの一つとして扱え。**

あなたが統率する単位は *モデル* であることをやめ、*ハーネスプロセス* になります：ここにClaude Code、そこにOpenCodeセッション、あそこにCodexの実行、それぞれが既に自分のプロバイダーのツール方言に堪能で、それぞれが自分のコンテキスト、自分のキャッシング、自分の推論状態を管理しています。あなたは、内部のワイヤープロトコルを通じてではなく、彼らが既に外の世界に公開しているインターフェース — CLI、`--format json`、再開できるセッションID — を通じて彼らと会話します。

それが買ってくれるもの：

- **フォーマット問題が消える。** ツール呼び出しレイヤーに一切触れないので、ツール呼び出しを一度も変換しません。Claude CodeはAnthropicをネイティブに話します。OpenCodeは好きなものを話します。それぞれが自分のキャッシュ、自分のthinkingブロック、自分のストリーミング — §2 がワイヤーをまたいで動かせないと言っている3つのもの — を保持します。**§2 のバグは境界を越えることに関するバグです。越えるな。**
- **モデルごとのコンテキスト再適応をやめられる。** コンテキストをKimiの癖に、次にGLMの、次にDeepSeekの癖に適応させるのはN倍の作業であり、それは腐ります。ハーネスの上では、コンテキストの適応は *各ハーネス自身の仕事* です — まさにそれが得意とすることです。
- **モデル選択が配管の決定ではなくルーティングの決定になる。** 機械的なタスクには安価なハーネス、難しいタスクにはフラッグシップのハーネス。それはプロキシではなくスケジューラーです。
- **これは[ハーネスの命題](/blog/harness-not-model)を一段上に適用したものだ。** もしモデルではなくハーネスが 6.7% を 68% に変えるものなら、レバレッジはハーネスの下でエンジンを差し替えることにはありません。どのハーネスが何を走らせるかを決め、同じ間違いに二度と払うことを拒むレイヤーにあるのです。

具体的には、私にとってこれは第一歩として [cmdop-claude](https://pypi.org/project/cmdop-claude/) をcmdopに折り込むことを意味します — そしてその後、ハーネス統率ロジック *全体* をそこへ移し、頼まれてもいない安価なモデルをハーネスの下にボルト留めし続けることをやめるのです。

## まとめ

もしKimiでClaude Codeを駆動したいだけなら：**ベンダーの `/anthropic` エンドポイントを使い、変換器を完全にスキップせよ。** その上でルーティング、フェイルオーバー、フリート全体のコスト計上が必要なら：**既にPythonなら LiteLLM、単一のGoバイナリが欲しいなら Bifrost。** ストリーミングのツール呼び出しバグを覚悟し、プロンプトキャッシングを失うことを覚悟し、thinking+toolsが鋭利な刃であることを覚悟せよ — そしてそれらが、あなたが選んだツールの性質ではなく、境界の性質であることを知っておけ。

そして戦略的な答えは、その境界を押すのをやめることです。すべてのモデルにClaude Codeの方言を下から話させることに人生を費やすな。**上からハーネスに話しかけるハーネスを書け** — そうすれば、彼らのどれがどの方言を話そうと、もう問題にならなくなります。
