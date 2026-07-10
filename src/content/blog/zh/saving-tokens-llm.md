---
title: "如何在 LLM 中节省 Token：Claude Code 实用指南"
description: "Claude Code 中节省 Token 的实用方法：子代理、技能、钩子、国产模型、知识图谱、RAG，以及服务端节省（Tool Search、上下文编辑、提示缓存、Batches API）。帮你将成本降低 10 倍的清单。"
pubDate: 2026-04-12
updatedDate: 2026-07-10
heroImage: "/images/blog/saving-tokens-hero.png"
tags: ["llm", "claude-code", "optimization", "tokens"]
draft: false
---

# 如何在 LLM 中节省 Token：Claude Code 实用指南

花掉 10 个 200 美元的订阅不是问题，问题在于花得有没有意义。下面是我每天使用 Claude Code 时实际用到的节省 Token 的方法。

## 1. 我们到底在为什么付费

Claude Code 对 **输入** 和 **输出** Token 分别计费。输入是指所有进入上下文的内容：系统提示、聊天历史、文件、截图。输出是指模型生成的内容。

聊天中的每条消息都会把累积的上下文加到输入中。如果你使用 1M 上下文的 Opus，每条消息的计费就像你重新发送了整个一百万 Token 一样。输出也会参与上下文膨胀——每个回答都在不断累积。

**结论：** 对话越短越便宜。上下文越小越便宜。模型"思考"越少越便宜。

## 2. 子代理——必备利器

主进程（Lead）不应该自己做任何事。它的任务是协调和委派。所有工作由拥有**小上下文**的子代理完成。

为什么这样做：

- Lead 进程的上下文保持在 100-200K 范围内，不会增长
- 子代理完成任务后，上下文自动清除
- 可以并行运行数十个代理

配置方式：

```
主进程 (Opus, 200K 上下文)
├── 代理 1 (Haiku, 短上下文) — 脚本处理
├── 代理 2 (Sonnet, 短上下文) — 编写测试
└── 代理 3 (Haiku, 短上下文) — 重构
```

对于批量任务（比如处理 8000 个脚本）——一个脚本、一个子代理、用 Haiku 模型。这比在一个聊天中跑所有内容便宜得多。

## 3. 上下文与幻觉——非线性关系

100K 上下文的 Opus 比 1M 上下文的 Opus 更准确。在 1M 上下文下，幻觉会非线性增长。也就是说，大上下文**既更贵，质量也更差**。

结论：保持上下文紧凑。5 个 100K 的聊天比 1 个 500K 的聊天好得多。

## 4. 技能（Skills）很好用

技能（Skills）是预配置的提示，按需加载，不会一直占用上下文。很多框架在开始工作之前，第一件事就是准备/下载技能。

与 MCP 服务器（会持续将自身指令加载到上下文中）不同，技能只在需要时才激活。在 Opus 4.5 之前，MCP 浪费了大量 Token——现在这个问题已解决，但"用技能和命令替代 MCP"的思路对于节省 Token 仍然有效。

### Caveman

[Caveman](https://github.com/JuliusBrussee/caveman) 是面向 Claude Code（及其他代理）的开源技能/插件：在保持技术准确的前提下，用「caveman speak」风格让模型极尽简短作答——对应 §1「对话越短越便宜」的具体做法。仓库中的基准测试平均可减少约 **65%** 的 **输出** Token；另有 `caveman-compress` 可压缩记忆文件中的散文以节省 **输入** Token。

## 5. 国产模型和低价订阅

阿里云、国内订阅——在性价比方面优势明显。约 30 美元的订阅可以获得与 Anthropic 200 美元订阅相当数量的 Token。

实际做法：

- 使用 Claude 的封装工具，可以切换模型提供商
- 不修改全局环境变量——只在启动封装工具时传入需要的变量
- Gemini 也有低价订阅，可以类似地使用

目前还没有"将所有提供商的模型直接嵌入 Claude"的现成方案，但封装工具已经能满足 80% 的需求。其中一个是 [Clother](https://github.com/jolehuit/clother/)——它允许使用不同的模型提供商运行 Claude Code，而不需要修改全局设置。

## 6. 知识图谱和 RAG：Token 消耗降低 10 倍

### LightRAG

[LightRAG](https://github.com/HKUDS/LightRAG) 是一种将知识图谱与 LLM 结合的方法。通过结构化地提取相关信息（而非加载全部上下文），可以将 Token 消耗减少高达 10 倍。

### a8e

由 [ivansglazunov](https://github.com/ivansglazunov) 开发——作者以隐士模式工作，公开发布的内容很少，所以目前很难看到项目的全貌。它的工作方式类似**图书管理员-RAG**：将所有传入的数据存入数据库。核心思想是将图谱与 LLM 结合，实现更精准、更廉价的上下文提取。该方法类似于[这个视频](https://www.youtube.com/watch?v=5-nrGj8qKqQ)中描述的技术。

### cmdop-claude

[cmdop-claude](https://pypi.org/project/cmdop-claude/) 是 [markolofsen](https://github.com/markolofsen) 的方案。图谱方面使用了 Merkle 树。核心思路：在后台运行几乎免费的国产 LLM 来整理 `.claude` 文件夹——为主模型准备好上下文。

> 关于知识图谱的全局配置方案——使用 OpenRouter 后端的 [graphify](https://github.com/safishamsi/graphify)，让语义处理不消耗 Claude 的 Token——详见 §11，与 rtk 一并介绍。

## 7. 代理管理框架

### Superpowers

一个流行的 Claude Code 框架，提供现成的技能、模式和工作流。

### AI Factory

[ai-factory](https://github.com/lee-to/ai-factory) 是一个有趣的 AI 代理管理框架。搭配 [aif-handoff](https://github.com/lee-to/aif-handoff) 可以提供带看板和过滤器的前端界面。

核心理念：人类设定初始任务，AI 进行分解，但**只有在人类批准计划后才开始执行**。这既节省了 Token（避免返工），又保证了控制权。

## 8. 实用小技巧

**高努力程度和推理模式可以关闭**以降低成本。不是每个任务都需要模型的"深度思考"。

**用技能替代 MCP。** 在 Opus 4.5 之前，用技能替代 MCP 能显著节省。现在差距缩小了，但对于批量任务这个方法仍然有效。

**管理子代理的模型选择。** 可以指定子代理使用哪个模型。常规任务用 Haiku，复杂任务用 Sonnet 或 Opus。

**`--bare` 模式——纯净启动。** `--bare` 标志启动 Claude Code 时不加载钩子、LSP、插件同步、自动记忆、后台预加载，最重要的是**不自动发现 CLAUDE.md**。这些内容通常会加载到系统提示中，在第一条消息之前就在消耗 Token。在 bare 模式下，上下文从最小状态开始，需要的数据可以通过 `--system-prompt`、`--append-system-prompt`、`--add-dir` 或 `--mcp-config` 精确传入。非常适合批量子代理场景，多余的预提示就是纯粹的浪费。

## 9. 钩子——自动化节省

钩子（Hooks）是在 Claude Code 内部事件触发时执行的脚本。在 `.claude/settings.json` 中配置，可以自动化那些节省 Token 的常规操作。

### 钩子类型

- **PreToolUse** —— 在工具调用前触发。可以过滤或修改输入数据。
- **PostToolUse** —— 在工具调用后触发。适用于自动格式化和后处理。
- **PreCompact** —— 在上下文压缩前触发。允许保存重要信息。
- **Stop** —— 代理结束工作时触发。可以检查任务完成度。
- **SessionStart** —— 会话启动时触发。适用于预加载上下文。

### 实用钩子示例

**过滤测试输出。** Anthropic 官方示例——在 `PreToolUse` 上为 Bash 设置钩子，截断长测试输出，只保留失败的测试和摘要。不是 500 行日志进入上下文，而是只有 10 行——直接节省 Token。

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "command": "your_filter_script.sh"
    }]
  }
}
```

**写入后自动格式化。** 在 `PostToolUse` 上为 Write/Edit 设置钩子——每次保存文件后运行 `prettier` 或 `black`。模型不需要花 Token 来格式化代码——它只写逻辑，格式化由钩子完成。

**防止破坏性命令。** 在 `PreToolUse` 上为 Bash 设置钩子，阻止 `rm -rf`、`DROP TABLE` 等类似命令。虽然不直接节省 Token，但避免了昂贵的错误和返工。

**压缩前保存上下文。** `PreCompact` 钩子——在上下文压缩前将关键决策和状态保存到文件，这样压缩后不会丢失重要信息。

### 钩子做不到的事

每 N 条消息自动压缩无法通过钩子配置——这是 Claude Code 的内置功能。但可以使用 `PreCompact` 钩子来控制压缩时保留哪些内容。

## 10. 截图——隐藏的 Token 杀手

根据文档，Claude 会按分辨率压缩图片。但实际上压缩效果不明显。在 4K 显示器上，一张截图的成本很高。

解决方案：在发送前将截图缩小到约 400px 宽度。文字仍然可读，而 Token 消耗少一个数量级。

macOS 上我用 [Open Screenshot](https://openscreenshot.suenot.com/) —— 这是我做的工具，直接以低分辨率格式截图，不需要手动调整大小。欢迎试用！

## 11. 开箱即用的配置：rtk + graphify

我全局启用的两个工具——各自针对 §1 中的不同消耗点：**rtk** 压缩命令输出，**graphify** 消除"把整个仓库读进上下文"的需求。两者都不需要单独的 API 密钥（graphify 的语义处理通过廉价的 OpenRouter 运行，而非消耗 Claude 的 Token）。加上 caveman（§4），形成完整的三层方案：命令输入 + 仓库上下文 + 模型输出。

**完整配置已整理到独立仓库——[`suenot/claude-code-token-savers`](https://github.com/suenot/claude-code-token-savers)**（脚本、补丁、钩子、`setup.sh`）。

### rtk——压缩命令输出

[rtk](https://github.com/rtk-ai/rtk)（Rust Token Killer）是一个 CLI 代理：在输出进入上下文之前，对 100+ 个命令（git、docker、pytest、cargo……）的输出进行过滤、去重和截断，**压缩率 60–90%**。单个二进制文件，无依赖，开销 <10 毫秒，不调用 LLM。

```bash
brew install rtk
rtk init -g --auto-patch   # 为 Claude Code 安装全局 PreToolUse 钩子
# 重启 Claude Code；验证：git status
```

该钩子透明地将 `git status` 重写为 `rtk git status`。这与 §9（用钩子过滤测试输出）的思路相同，但一次覆盖上百个命令。

### graphify——用知识图谱替代读取整个仓库

[graphify](https://github.com/safishamsi/graphify) 将代码和文档转化为知识图谱（节点、社区、god-node），让你通过**查询**（`/graphify query "…"`）获取信息，而不是将文件堆进上下文——这是 §6 核心思路的具体实现。关键之处：**语义提取通过 OpenRouter（`deepseek/deepseek-v4-flash`）运行，而非消耗 Claude 的 Token**——构建一个中等项目的图谱在 OpenRouter 上约花 ~$0.10，会话 Token 消耗为零。

现成配置（上述仓库，`graphify/` 目录，`./setup.sh`）包含：

- OpenRouter 后端配置（`~/.graphify/providers.json`，模型通过 `GRAPHIFY_OPENROUTER_MODEL` 修改）；
- **SessionStart 钩子自动 watch**：有图谱则监听变更并更新；项目未初始化则仅提示"运行 `/graphify .`"（避免意外打开根目录或超大目录时消耗 Token）；
- 简洁的 **no-media 开关**（`touch ~/.graphify/no-media`）——不将图片/PDF/视频纳入图谱，无需折腾 ignore 文件；
- 安全修复：`.graphifyignore` 不再"遮蔽"`.gitignore`（合并而非替换，[PR #1364](https://github.com/safishamsi/graphify/pull/1364) 已提交上游），另有 pre-commit 守卫，防止将含 `.gitignore` 文件内容的图谱提交到仓库。

> Caveman（§4）补上第三层——**模型自身的输出**。rtk + graphify + caveman = 命令输入、仓库上下文、模型输出，三层各司其职。注意：在处理纯文本内容时，caveman 最好关闭（"normal mode"）——过于简洁的风格会妨碍文字编辑。

### pxpipe——把请求渲染成图片（§10 反过来用）

[pxpipe](https://github.com/teamchong/pxpipe)（作者 [teamchong](https://github.com/teamchong)）从一个出人意料的角度攻击输入端。在 §10 里截图是敌人——一张图片会吃掉大量 Token。pxpipe 把这个逻辑反了过来：一张图片的 Token 成本由它的**像素尺寸**决定，而不是里面塞了多少文字。在真实的 Claude Code 流量中，密集内容（代码、JSON、工具输出）每个图像 Token 约能装下 ~3.1 个字符，而每个文本 Token 只能装下 ~1 个字符。于是它把每个请求中体量庞大、几乎不变的部分——系统提示、工具文档、较早的历史——在请求离开你的机器之前**渲染成密集的 PNG**。模型通过 Anthropic computer use 早已依赖的同一条视觉通道来读取它们。号称效果：**输入账单降低约 ~59–70%**，而真正经得起考验的指标就是 Token 削减量本身，按每个请求对照免费的 `count_tokens` 反事实来测量。

它是一个代理，而且——先回答那个显而易见的问题——集成方式**已经是原生的**：不需要插件，不需要钩子，只用 Claude Code 内置的 `ANTHROPIC_BASE_URL`。

```bash
npm install -g pxpipe-proxy   # or on demand: npx pxpipe-proxy
pxpipe                                            # proxy on 127.0.0.1:47821
ANTHROPIC_BASE_URL=http://127.0.0.1:47821 claude  # point Claude Code at it
```

`127.0.0.1:47821` 上的仪表盘会显示已节省的 Token、每一次 text→image 转换的并排对比、一个实时的 kill switch，并把每个事件记录到 `~/.pxpipe/events.jsonl`。只有**请求**会被压缩——响应照常流式返回。

> ⚠️ **它是有损的，而且失手时不出声。** 从图片里读出的精确字节级数值（十六进制字符串、ID、哈希、密钥）可能被**编造**出来，而不是报错。所以最近几轮对话会自动保留为文本，而对字节级精确度有要求的工作应该交给运行在非白名单模型上的子代理（`CLAUDE_CODE_SUBAGENT_MODEL=claude-sonnet-4-6`），它会以文本形式透传。它还高度依赖读取方：在 Fable 5 读取方上它在文本针测试中能拿到约 ~100/100，但 Opus 会误读图像化的内容——这也是 pxpipe 让 Opus 保持 opt-in 的原因。

**它和整套方案的冲突点。** pxpipe 会占用 `ANTHROPIC_BASE_URL`——也就是 Clother 和其他任何封装工具用的同一个位置——所以在不做链式串联的情况下，你无法在一个 base URL 上挂两个代理。在最前面挑一个代理，然后把基于钩子的工具（rtk、graphify、caveman）叠加在上面。它是这里最激进的输入压缩器——当真正拖垮你的是请求侧的账单（系统提示 + 工具文档 + 长历史）时，它最值得一试。

## 12. 服务端与 API 层面的节省（Claude Code 已经替你做了什么——又有什么没做）

上面所有内容都是*你*自己加装的。但还有一整层节省发生在 **Anthropic 那一侧**——其中一部分已经在 Claude Code 中替你打开，另一部分只有在你基于原始 API/SDK 构建时才能用上。分清哪个是哪个，能让你不至于去装一个工具来解决平台早已解决的问题——也不至于误以为某个功能已经开启，而其实并没有。

### 高级工具使用：Tool Search、Programmatic Tool Calling——默认已开启

Anthropic 的 [advanced tool use](https://www.anthropic.com/engineering/advanced-tool-use) 套件（2025 年 11 月）是这份清单里单项收益最大的，而好消息是**你无需配置**：

- **Tool Search Tool**（`defer_loading`）。不再在每个请求里把每个工具的完整 schema 都塞进系统提示，而是只给模型看工具的*名称*，只有真正需要的工具才拉取完整定义。Anthropic 给出的数字：在大型工具集上 **77K → 8.7K Token（约 85%）**。**在 Claude Code 里这已经默认生效**——连接了大量 MCP 服务器和插件时，多出来的工具只以名称形式存在，直到被调用，模型才按需拉取 schema。**没有开关可拨：它随规模自动生效**，你连接的工具越多，省得越多。唯一需要你操心的情况是**自定义 harness / Agent SDK 应用**——那里得你自己实现（把工具标记为 `defer_loading: true`），或至少确认你的 harness 做了延迟加载，否则你又回到了每一轮为每个 schema 付费的状态。
- **Programmatic Tool Calling。** 模型在执行容器里写代码来调用工具，并在结果进入上下文*之前*就把它们过滤掉——而不是让每个原始工具结果都在窗口里往返一趟。在工具密集的代理运行中通常能省 **20–40%**（还附带准确率提升）。这一项目前仍是 API 原生（beta），在 Claude Code 里还不是自动的。

> **要点：** 那约 85% 的工具 schema 节省在 Claude Code 里已经归你所有——无需额外设置。只有当你自己写 harness 时才需要操心它。

### 上下文编辑（`clear_tool_uses`）——一个 API 功能；Claude Code 给了你它自己的版本

Anthropic 的 [context editing](https://platform.claude.com/docs/en/build-with-claude/context-editing)（beta header `context-management-2025-06-27`，策略 `clear_tool_uses_20250919`）会在上下文越过阈值后自动清除最旧的工具结果，每个换成一段简短的占位符。在 Anthropic 的 100 轮评测中，这在本会因上下文耗尽而崩溃的运行上带来了 **84% 的 Token 削减**。

但是：**这个原始旋钮在 Claude Code 里并未暴露**（已有公开请求希望把它开放出来）。Claude Code 给你的替代品是 **microcompact**——它自动把大块的工具输出卸载到磁盘，只保留最近结果的热尾巴外加路径引用——与 `/compact` 和 autocompact 一起静默运行。所以那个*行为*（裁剪陈旧的工具输出）已经自动替你覆盖了；那个*具体的 API 参数*只有在你直接基于 Anthropic API/SDK 构建时才能用上。别在 Claude Code 里找 `clear_tool_uses` 设置了——你已经拿到了内置版本。

### 主动式提示缓存——缓存读取便宜 90%，且大体上自动

[Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) 已 GA 且是基础能力：一次缓存读取只需 **0.10× 输入（−90%）**。两种 TTL——5 分钟（默认）和 1 小时（扩展）。**Claude Code 已经在积极地替你缓存**；你能控制的是缓存*是否命中*：

- 让上下文的前部保持**字节级稳定**——系统提示、工具定义和 `CLAUDE.md` 不应在两轮之间变动，否则前缀缓存就会失效，模型只能从头重读。
- 不要在会话中途重排工具或重写靠前的上下文（这正是那个「烧缓存」的陷阱：一旦前缀变了，累积的缓存就付诸东流）。
- Opus 4.8 在这方面有帮助：它允许 `role:"system"` 消息出现在用户轮*之后*，于是你可以**在不破坏已缓存前缀的前提下**追加指令，并且它把可缓存提示的下限降到了 **1,024 Token**。

### Message Batches API——离线批量任务直接打 5 折

对于非交互式的批量工作——§2 里"8000 个脚本、每个一个子代理"的场景，或批量摘要 / 分类 / 评测——[Message Batches API](https://platform.claude.com/docs/en/build-with-claude/batch-processing) 会异步运行它们（24 小时内出结果，通常快得多），**输入和输出都直接打 5 折**，而且它**能与提示缓存叠加**（缓存读取再省 90%）。

**问题在于：Claude Code 本身没有批处理模式。** 它是一个交互式 REPL——每一轮都是实时的全价请求，没有"以半价排队 8000 个任务"的按钮。这 50% 的折扣在下一层，也就是原始 API 上，你只有离开 CLI 才能拿到：

- 直接用 **Anthropic API / SDK**——`client.messages.batches.create(...)`（Python/TS）。你可以在这里自己写批量脚本，或基于 **Claude Agent SDK** 而非交互式 CLI 来构建。
- **AWS Bedrock**——"Batch Inference"。
- **Google Vertex AI**——"Batch Prediction"。
- （其他家也是同样的套路：**OpenAI** 有等价的 Batch API，同样 −50%。）

所以经验法则：**交互式编码 → Claude Code（缓存挑大梁）；离线批量 → 降到 API/SDK 或 Bedrock/Vertex 去批处理。** 硬把批量标注塞进交互式 CLI，就是把那 50% 白白扔掉。

### 便宜的卫生习惯：`/context`、精简的 CLAUDE.md、以及关掉闲置的 MCP 服务器

- **`/context`** 会逐项打印出是什么在填满你的窗口——系统提示、系统工具、MCP 工具、记忆文件（`CLAUDE.md`）、自定义代理、消息。跑一下就知道谁是大户。
- **臃肿的 `CLAUDE.md` 是对每条消息的征税**——一个 10K Token 的记忆文件会随每一轮重新发送。保持精简，把任务相关的指令推到**技能**里（按需加载）。
- **每个闲置的 MCP 服务器都会在每个请求里为它的工具定义计费。** 通过 `/mcp`（或像 `cctoggle` 这样的开关）断开你没在用的。Tool Search 缓解了这一点，但压根不用某个服务器，仍然比延迟加载它更便宜。

### Structured Outputs——干掉重试和前言

[Structured Outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)（beta）用受约束解码来保证 schema 合法的 JSON（`output_format`，或在工具上设 `strict: true`）。节省是间接但真实的：不再有无效 JSON 的重试往返（一次解析失败的代价就超过该功能约 2–3% 的 schema 开销），并且它去掉了模型本会包裹在答案外面的那一大段絮叨式推理。

### 两件不必费心的事

- **`token-efficient-tools-2025-02-19` header 已成历史。** 它只在 **Claude 3.7 Sonnet** 上削减工具调用的输出 Token；每个 Claude 4+ 模型（包括 Opus 4.7/4.8）都**默认**做 token-efficient 的工具使用，所以这个 header 今天是个空操作。别加它。
- **LLMLingua-2**（微软的提示压缩器，2–5×）确实存在且好用，但它只是个*引擎*，用来填补输入压缩这类活儿——也就是 §11 的 **pxpipe** 那种输入压缩工具已经在做的事——而不是一个要跟它并列另装的独立方法。

## 节省 Token 清单

| 方法 | 节省幅度 |
|------|----------|
| 使用短上下文的子代理 | 长会话节省 2-5 倍 |
| 常规任务使用国产模型 | 按价格节省 5-10 倍（$30 vs $200） |
| 用技能替代常驻 MCP | 1.5-2 倍 |
| 用钩子过滤输出 | 测试/日志任务节省 1.5-3 倍 |
| 压缩截图尺寸 | 视觉任务节省 1.5-2 倍 |
| 用图谱/RAG 替代完整上下文 | 最高 3-5 倍 |
| 简单任务关闭推理模式 | 1.5-2 倍 |
| 子代理使用 `--bare` 模式 | 每次启动节省 1.5-2 倍 |
| 使用带计划审批的框架 | 间接节省，通过减少返工 |
| rtk——压缩命令输出（PreToolUse 钩子） | git/docker/pytest/日志节省 1.5–3 倍 |
| graphify——用图谱替代完整上下文（语义处理走 OpenRouter） | 大型仓库导航最高节省 10 倍；构建约 $0.10，不消耗 Claude Token |
| pxpipe——把请求（系统提示/工具文档/历史）渲染成密集 PNG | 通过视觉通道在输入端节省 ~59–70%；对字节级精确数值有损，Opus 需 opt-in |
| Tool Search / `defer_loading`（Claude Code 中自动） | 工具 schema Token 最高省约 85%；零配置——随规模自动生效 |
| 上下文编辑 / microcompact（Claude Code 中自动） | 长代理运行最高节省 84%；API 旋钮 `clear_tool_uses` 仅通过原始 SDK 可用 |
| 主动式提示缓存（稳定前缀，1 小时 TTL） | 缓存读取 0.10×（−90%）；大体自动，保持前缀字节级稳定 |
| Message Batches API（离线批量，非 Claude Code） | 输入+输出直接 −50%；经 API/SDK、Bedrock、Vertex——可与缓存叠加 |
| `/context` + 精简 CLAUDE.md + 关掉闲置 MCP 服务器 | 靠裁剪记忆文件和闲置工具定义，每条消息省下数千 Token |
| Structured Outputs（`strict` JSON） | 消除解析重试往返和絮叨前言 |

---

*你可以无限烧钱——10 个 200 美元的账号也不是上限。但这并不代表高效。目标是在不损失质量的前提下，将成本至少降低 10 倍。*
