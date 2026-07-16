---
title: "教 Kimi 说 Claude Code 的语言：工具格式转换实战指南"
description: "每一个在 LLM 供应商之间转换工具调用格式的工具——LiteLLM、Bifrost、Portkey、claude-code-router、Vercel AI SDK、官方原生 /anthropic 端点——它们各自实际做了什么，以及没有任何一个解决的三类失败。外加我最终得出的结论：不要再把上下文向下适配每个模型，而是构建一个编排 harness 的 harness。"
pubDate: 2026-07-13
heroImage: "/images/blog/llm-tool-format-sync-hero.png"
tags: ["llm", "claude-code", "tool-calling", "harness", "proxy", "kimi", "orchestration"]
draft: false
---

# 教 Kimi 说 Claude Code 的语言：工具格式转换实战指南

你想运行 Claude Code 的 harness——那些子代理、技能、钩子，你花了几个月调优的整套脚手架——但用 Kimi K2.5、GLM 或 DeepSeek 来驱动它，因为旗舰模型的账单太肉疼。有两条路可以做到这一点，而两条路都会撞上同一堵墙：

1. **把 Claude Code 的工具喂给另一个模型。** 它的工具定义进入第一次请求，而每一次工具调用都必须以 Claude Code 期望的形态返回。这意味着必须有人来转换线上格式。
2. **使用第三方 harness**（OpenCode、Cline、Goose、Crush），它们本身就会说所有供应商的语言。但这样你继承的是*它们的* harness，而不是你自己的。

本文讲的是让第 1 条路成为可能的那一层——工具格式转换器——以及为什么在梳理了整个版图之后，我认为正确答案两者都不是。

## 1. 为什么转换不只是字段改名

天真的心智模型是：Anthropic 把它叫 `input_schema`，OpenAI 叫 `parameters`，写个映射器，搞定。这部分*确实*微不足道。而下面才是真正的差异所在。

**工具定义：**

| | Anthropic Messages | OpenAI Chat Completions | OpenAI Responses |
| --- | --- | --- | --- |
| 形态 | 扁平：`{name, description, input_schema}` | 嵌套：`{type:"function", function:{name, description, parameters}}` | 扁平：`{type:"function", name, parameters}` |
| Anthropic 独有的额外字段 | `cache_control`、`input_examples`、`defer_loading` | — | — |

注意这里已经有个陷阱：OpenAI 自家的 **Responses API 是扁平的**，比起 OpenAI Chat Completions 反而更接近 Anthropic。一个硬编码"OpenAI 就意味着嵌套的 `function{}`"的转换器，在一半的 OpenAI 场景上是错的。

**回合结构——这才是大头：**

- **Anthropic**：工具调用是 `tool_use` **助手消息内部的内容块**，与 `text` 和 `thinking` 块交错排列。结果以 `tool_result` 块返回，位于一条 **`role: "user"`** 的消息中。
- **OpenAI CC**：工具调用是助手消息**上**的一个 `tool_calls[]` 数组。结果是独立的消息，带 **`role: "tool"`**。
- **OpenAI Responses**：两者都不是——独立的 `function_call` 项，通过 `call_id` 关联，而这个字段和项自身的 `id` 是*不同的字段*。

一个代理必须处理的后果：Anthropic 允许在同一个助手回合里*同时*出现文本*和*一个工具调用（天真的转换器会把它们拆成两条消息，从而产生非法的历史记录）；**每一个 `tool_use` 都必须有一个匹配的 `tool_result`，否则 API 返回 400**——"孤立的工具调用"是最常见的单项清洗工作，LiteLLM 专门为此推出了[一个功能](https://docs.litellm.ai/docs/completion/message_sanitization)。

**参数编码：** Anthropic 的 `tool_use.input` 是**已解析的对象**。OpenAI 的 `function.arguments` 是**JSON 编码的字符串**。零参数的调用会发出 `""`，而消费方期望的是 `{}`，于是 `JSON.parse` 抛错——这是 Vercel AI SDK 里的一个现存 bug（[#10295](https://github.com/vercel/ai/issues/10295)）。

**`tool_choice`：** Anthropic 的 `any` 就是 OpenAI 的 `required`；`disable_parallel_tool_use` 对 Anthropic 而言住在 `tool_choice` *内部*，而对 OpenAI 则是*顶层*的 `parallel_tool_calls`。改动 `tool_choice` 还会使你缓存的消息块失效。

**JSON Schema 可移植性：** 没有一家主流供应商接受顶层的 `$ref`——你必须内联展开。Gemini 拒绝 `items: {}`。OpenAI 的 strict 模式接受 `pattern`/`minimum`/`format`，但**并不强制执行它们**。而在 Responses 中，*省略* `strict` 反而会尝试进入 strict 模式并悄悄降级——所以一个只是转发工具定义的代理，已经在不告诉你的情况下改变了语义。

以上全部都是机械性的。烦人，但可解。下一节则不然。

## 2. 没有人解决的三件事

我看过的每一个网关都在同样的三个地方失灵。

### 2.1 流式重组

非流式转换是已解决的问题。**Claude Code 始终是流式的。**

- **Anthropic SSE**：`content_block_start`（类型 `tool_use`，携带 `id` + `name`）→ N 次 `content_block_delta`，内容为 `{"type":"input_json_delta","partial_json":"…"}` → `content_block_stop` → `message_delta`，带 `stop_reason:"tool_use"`。
- **OpenAI SSE**：`delta.tool_calls[]` 片段以一个 **`index`** 字段作键；`id`/`name` 只出现一次，参数以字符串片段陆续到达；以 `finish_reason:"tool_calls"` 结束。

把其中一个变成另一个，需要跨块维持的、按 `index` 分区的状态机，而这正是一切崩溃的地方。LiteLLM 曾发出 `content_block_start` + `content_block_stop`，而**中间没有任何 `input_json_delta`**——每一个工具调用都带着 `input: {}` 到达，于是 Claude Code 报告必填参数缺失（[#25561](https://github.com/BerriAI/litellm/issues/25561)、#25321、#25390）。Bifrost 在文本+工具混合的回合里发送 `stop_reason: "end_turn"` 而不是 `"tool_use"`，于是客户端以为助手已经说完了（[#3638](https://github.com/maximhq/bifrost/issues/3638)）。Portkey 在流式增量里丢掉了 `assistant` 角色（[#1000](https://github.com/Portkey-AI/gateway/issues/1000)）。Roo Code 跨块保留了两张静态状态映射表，纯粹是为了给跨供应商的流式不一致打补丁。

### 2.2 推理状态既不透明又不可或缺

这是 Claude-Code-加外来模型这套组合会有损耗的最深层结构性原因。

Anthropic 的[扩展思考文档](https://platform.claude.com/docs/en/build-with-claude/extended-thinking)说得很明确：当你回传一个 `tool_result` 时，上一条助手消息上的 `thinking` 块**必须完整、原封不动地回显**，否则你会得到 `400: "thinking or redacted_thinking blocks in the latest assistant message cannot be modified"`。Anthropic 自家文档里点名的根本原因是*"按类型过滤内容块的应用代码"*——而这正是格式转换器所做的事。

而 `thinking` 块上的 `signature` 是**推理过程的加密表示**，服务器会解密它以重建状态。**OpenAI 线上没有任何字段可以承载它。** 经过 Chat Completions 往返一圈就会把它销毁。这就是为什么 LiteLLM #15601、vercel/ai #11602 以及 claude-code-router #1400/#1410 会作为分立的开放 bug 存在于不同的代码库中：它们其实是同一个 bug。

每一家供应商都有自己的版本，而没有一个能互操作——Anthropic 的 `signature`、OpenAI 的 `reasoning.encrypted_content`（它在流式中**缺席于 `output_item.added`，只出现在 `output_item.done` 上**——只读取第一个事件的转换器会悄悄丢掉它）、Gemini 在 `functionCall` 部件上的 `thought_signature`。还值得知道的是：**在扩展思考下 `tool_choice: any` 和 `tool_choice: tool` 是硬错误**——只能用 `auto`/`none`——这彻底破坏了强制工具的结构化输出。

### 2.3 提示缓存蒸发

`cache_control` 是 Anthropic 独有的。OpenAI 的缓存是隐式的，所以根本没有东西可以映射过去。**每一次 Anthropic→OpenAI 转换都会悄悄丢弃你的提示缓存**——[省 token 指南](/blog/saving-tokens-llm)里最大的那根杠杆。你在每 token 单价上省了钱，又在缓存未命中上如数还回去，而日志里没有任何东西会告诉你。

DeepSeek 是唯一把这件事明说出来的厂商：他们的 [Anthropic 兼容文档](https://api-docs.deepseek.com/guides/anthropic_api)把 `cache_control` 列在*不支持*之下，就挨着图像、文档和 MCP 集成。为此点个赞。

## 3. 转换器们

### LiteLLM — Python，约 53k ★，代理 + 库

[LiteLLM](https://github.com/BerriAI/litellm) 是默认答案，而它有两个 Anthropic 界面是人们不断搞混的。`POST /anthropic/*` 是**透传**——不做转换，只是转发给 Anthropic 并加上成本追踪。`POST /v1/messages`（[`anthropic_messages`](https://docs.litellm.ai/docs/anthropic_unified/)）才是**真正的转换**：Anthropic 格式进，任意供应商出。Claude Code 是[一等文档级支持](https://docs.litellm.ai/docs/tutorials/claude_non_anthropic_models)——把 `ANTHROPIC_BASE_URL` 指向它，并设置 `CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY=1`。

它是最完整、也是久经沙场的那个，同时它也是 §2.1 里大多数流式 bug 被提交的地方——不是因为它更差，而是因为它是所有人都在跑的那个。它是 Python，很重，而且它的日志话痨到本身就成了个问题。

### Bifrost — Go，约 6.5k ★，Apache-2.0，网关

[Bifrost](https://github.com/maximhq/bifrost) 是如果我想要一个单一二进制文件而非 Python 进程时会去拿的那个。可直接替换的前缀（`/openai`、`/anthropic`、`/genai`），而且 [Claude Code 是一等文档级目标](https://docs.getbifrost.ai/cli-agents/claude-code)，带有 `ANTHROPIC_DEFAULT_SONNET_MODEL` / `..._HAIKU_MODEL` 覆盖项。它诚实地记录了自己的转换步骤——系统消息提取、工具消息分组、思考块变换、`reasoning`→`thinking` 且带 1024 的最小预算。它同时也是一个 MCP 网关。

它"比 LiteLLM 快 50 倍、11µs 开销"的说法是厂商自己发布的，没有独立复现。请酌情对待。

### Portkey AI Gateway — TypeScript，约 12k ★，网关

[Portkey](https://github.com/Portkey-AI/gateway) 有着最清爽的概念：**三种通用入口格式**——`/v1/chat/completions`、`/v1/responses` 和 `/v1/messages`——每一种都能与*所有*供应商配合工作。从设计上就是双向的。但没有官方的 Claude Code 教程，而它的开放 issue 恰好就是 §2 那几类失败（并行调用上 tool_use↔tool_result 的 ID 配对失效、Anthropic 的 `tool_choice: none` 被拒、流式增量里缺失角色）。

### claude-code-router — TypeScript，约 36k ★

这里值得纠正一个过时的心智模型：[CCR](https://github.com/musistudio/claude-code-router) 已经不再是人们记忆中那个小小的 transformer 代理了。它现在是一个 **v3.0.11 的 monorepo，附带一个 Electron 控制面板外加一个本地模型网关**，它还驱动 Codex 和 ZCode，并为 OpenRouter、DeepSeek、Moonshot/Kimi、Z.AI、MiniMax、SiliconFlow 提供预设。transformer 层作为一个独立的、小得多的库延续了下来，即 [musistudio/llms](https://github.com/musistudio/llms)，带有一个四钩子接口（`transformRequestIn/Out`、`transformResponseIn/Out`）。

读一读它的 issue 追踪器，§2.2 的模式跃然纸上：开放的 bug 都聚集在**推理 × 工具调用**上，而不是纯工具调用上。流式推理污染工具参数增量、Kimi 的 `reasoning_content` 没有在工具调用历史中被保留、Gemini 缺失的 `thought_signature`、DeepSeek 思考+工具的 400。纯工具调用是能用的。思考加工具调用才是它流血的地方。

### Vercel AI SDK — TypeScript，约 25k ★，**是库，不是网关**

[AI SDK](https://ai-sdk.dev/docs/foundations/tools) 通过每个供应商的适配器在进程内做归一化。`tool({description, inputSchema, execute})`，Zod 或原始 JSON Schema。它能极其漂亮地契合一个 Bun/TS 技术栈，但它是**一个库**——你没法把它直接摆在 Claude Code 前面，除非先围绕它构建一个代理。

整个 SDK 里最说明问题的细节是 `experimental_refineToolInput`，它之所以存在——按文档所说——是因为"不同的 LLM 供应商会生成略有不同的工具输入"（`null` 对 `""`）。一个作为官方承认归一化有损而随之推出的逃生舱。

## 4. 代理这个品类正在消亡，而这是好消息

这是我没料到的发现。在四个最知名的社区 Anthropic 兼容代理中，**有两个在过去六个月里归档了**：[y-router](https://github.com/luohy15/y-router)（2026 年 1 月归档，README 现在指向 OpenRouter 的官方集成）和 [anthropic-proxy](https://github.com/maxnowack/anthropic-proxy)（2026 年 4 月归档）。杀死它们的是**供应商自己把端点做出来了**：

| 供应商 | Anthropic 兼容的 base URL |
| --- | --- |
| Moonshot / Kimi | `https://api.moonshot.ai/anthropic` |
| Z.ai / Zhipu GLM | `https://api.z.ai/api/anthropic` |
| DeepSeek | `https://api.deepseek.com/anthropic` |
| MiniMax | `https://api.minimax.io/anthropic` |
| Qwen / DashScope | `https://dashscope-intl.aliyuncs.com/apps/anthropic` |
| OpenRouter | `https://openrouter.ai/api`（他们的"Anthropic 皮肤"） |

这恰好就是 [Clother](/blog/clother-claude-wrappers) 和 [OpenClaude](/blog/openclaude-multi-provider) 已经用一个环境变量在切换的那份清单。**所以对于常见场景——"我想让 Kimi 驱动 Claude Code"——你根本不需要任何格式转换器。** 厂商在服务端替你跑了一个，免费。设置 `ANTHROPIC_BASE_URL`，走你。

两点注意。Kimi 的 `/anthropic` 端点**被广泛使用，却没有厂商文档**（有[一个索要文档的开放请求](https://github.com/MoonshotAI/Kimi-K2/issues/129)）。以及 **Cloudflare AI Gateway 在这里是用错了工具**——它的 `/anthropic` 路由只是透传；它缓存并观测*发往* Anthropic 的流量，它并不把流量*从* Anthropic 转换出来。

只有当你需要厂商端点给不了的东西时，你才该去拿一个真正的转换器：**路由**（用便宜模型跑 Haiku 级的子代理，用旗舰跑主导代理）、在触发限流时跨供应商故障转移、为整个机群提供一处统一的成本核算——这些正是[省 token 指南](/blog/saving-tokens-llm)第 2 部分讲的东西。

## 5. 另一条路：本身就已归一化的 harness

如果你不想为 Claude Code 做转换，那就用一个从来不需要 Claude 格式的 harness：

| Harness | 语言 | ★ | 如何归一化 |
| --- | --- | --- | --- |
| **OpenCode** | TS/Bun | 185k | Vercel AI SDK + [models.dev](https://models.dev) 注册表 |
| **Cline** | TS | 65k | 自己的每供应商处理器 |
| **Goose** | Rust | 51k | 自己的 `Provider` trait |
| **Crush** | Go | 27k | [fantasy](https://github.com/charmbracelet/fantasy) + catwalk 注册表 |
| **Aider** | Python | 47k | LiteLLM——但 ⚠️ 自 2026 年 5 月起停滞 |
| **Roo Code** | TS | 24k | 🔴 **2026 年 5 月归档** |

这张表教会我三件事：

1. **XML 工具调用的时代结束了。** Cline v3.35 从系统提示里的 XML 迁移到了原生 JSON 工具调用；Roo 彻底移除了 XML，现在会硬性拒绝没有 `id` 的工具调用。如果你本打算通过提示模型输出 XML 来绕开格式转换——那班船已经开了，而且业界是有意把它开走的。
2. **Goose 的 "toolshim" 是这一切都是可垫片层的存在性证明。** 对于没有原生工具调用的模型，Goose 让主模型输出松散的 JSON，然后跑一个**第二个便宜的解释器模型**（默认是 Ollama 上的 `mistral-nemo`）把它强制转成一个合法的工具调用。它是实验性的，而且会挂起，但从概念上讲这是对这个想法最纯粹的表述：工具格式是一个转换问题，而转换是一份你可以交给一个小模型的活儿。
3. **Aider 在这方面不是任何参照** ——它刻意完全回避工具调用，改用 SEARCH/REPLACE 文本块来编辑。它的失败模式是"块匹配失败"，而不是 schema 漂移。是另一个宇宙。

而归一化层的参考实现，按语言分：**TS → Vercel AI SDK，Go → charmbracelet/fantasy，Python → LiteLLM，Rust → 自己造。**

## 6. 标准救不了你

**MCP 并不解决这个问题。** 这是我遇到的最常见的误解。MCP 是一个*发现与传输*层：`tools/list` 交给你 JSON Schema，然后**harness 仍然必须把每一个 MCP 工具转换成供应商的原生工具定义**，而模型仍然发出供应商原生的工具调用。§1 里每一个可移植性坑洞都原封不动地适用。MCP 骑在这个问题之上；它并不触及它。

MCP 自己也有一堆变动：下一版规范修订将于 **2026-07-28** 落地，是自发布以来最大的一次——`initialize` 握手被**整个移除**，`Mcp-Session-Id` 没了，HTTP+SSE 传输被弃用。任何针对 `2025-11-25` 写的东西都得返工。

至于一个通用的工具调用规范：**没有一个在胜出。** [UTCP](https://www.utcp.io) 是真实的、活跃的、也是小众的（规范约 300★）——而且它还带一个 MCP 兼容插件，这就告诉了你谁在胜出。`agents.json` 死了（最后一次推送是 2025 年 8 月）。IBM 的 ACP 被并入了 A2A。A2A 本身健康，但是**正交的**：它讲的是把代理当作不透明体的代理↔代理互操作，而不是工具 schema 的归一化。事实上的标准化正在以那种无聊的方式发生——每一家厂商都在克隆 `/chat/completions` 那个形态，现在还加上了 `/v1/messages` 那个形态。

## 7. 我真正得出的结论：构建在 Claude *之上*，而非*之下*

我花了一阵子试图**从底下**优化 Claude Code——截获它一部分工作、替换它下面的模型、削减它的上下文、转换它的工具。而我认为那是条死路。不是因为它做不成，而是因为 §2 所说的：流式重组、不透明的推理状态、消失的提示缓存，这三类失败**没有任何转换层解决过，只是缓解过**。你构建的不是一个功能，而是给自己签下了针对三套移动中的 API 的永久维护合同。在 harness 底下做优化是一个研究项目——没完没了的实验，没有说明书——而它产出的东西每逢供应商发布一个小版本就会坏一次。

更好的做法是相反的方向：**构建你自己的、坐在 Claude Code *之上*的 harness，把 Claude Code 当作若干黑盒代理中的一个。**

你编排的单元不再是一个*模型*，而变成一个*harness 进程*：这里一个 Claude Code，那里一个 OpenCode 会话，那边一个 Codex 运行，每一个都已经流利掌握自己供应商的工具方言，每一个都管理着自己的上下文、自己的缓存、自己的推理状态。你通过它们已经对外暴露的那个接口去跟它们对话——一个 CLI、`--format json`、一个你可以恢复的 session ID——而不是通过它们内部的线上协议。

这换来了什么：

- **格式问题消失了。** 你永远不转换一个工具调用，因为你永远不碰工具调用那一层。Claude Code 原生说 Anthropic。OpenCode 想说什么说什么。每一个都保有自己的缓存、自己的思考块、自己的流式——正是 §2 说你没法在线上搬动的那三样东西。**§2 里的 bug 都是关于跨越一条边界的 bug。别去跨它。**
- **你不再为每个模型重新适配上下文。** 把你的上下文适配到 Kimi 的怪癖，再适配到 GLM 的，再适配到 DeepSeek 的，是 N 倍的工作量而且会腐烂。在 harness 之上，上下文适配是*每个 harness 自己的活儿*——那正是它本来就擅长的事。
- **模型选择变成一个路由决策，而不是一个管道决策。** 机械任务用便宜的 harness，硬任务用旗舰 harness。那是一个调度器，不是一个代理。
- **这是[harness 论](/blog/harness-not-model)向上套一层的应用。** 如果把 6.7% 变成 68% 的是 harness——而不是模型——那么杠杆就不在于在一个 harness 底下换引擎。它在于那个决定哪个 harness 跑什么、并且拒绝为同一个错误付两次钱的那一层。

具体到我这里，这意味着作为第一步把 [cmdop-claude](https://pypi.org/project/cmdop-claude/) 折叠进 cmdop——然后把*整个* harness 编排逻辑挪到那里，而不是继续在一个从没要过便宜模型的 harness 底下硬拧上便宜模型。

## 要点

如果你想要的仅仅是 Kimi 驱动 Claude Code：**用厂商的 `/anthropic` 端点，彻底跳过转换器。** 如果你在此之上需要路由、故障转移或机群级成本核算：**已经在用 Python 就用 LiteLLM，想要一个 Go 二进制就用 Bifrost。** 预期会有流式工具调用的 bug，预期会丢掉提示缓存，预期思考加工具会是那个锋利的刃口——并且知道这些是边界的性质，而不是你所选工具的性质。

而战略性的答案是别再去推那条边界。别把你的一生花在从底下教每一个模型说 Claude Code 的方言上。**写那个从上面跟一众 harness 对话的 harness**——那样它们各自说什么方言就永远不再要紧了。
