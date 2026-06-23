---
title: "在 Claude Code 中使用 graphify：用知识图谱替代通读整个仓库，在廉价的 OpenRouter 上做语义提取"
description: "我为 Claude Code 准备好的 graphify 配置：用知识图谱替代通读整个仓库，在廉价的 OpenRouter（deepseek）上做语义提取，而不是消耗 Claude 的 token，通过钩子自动监听，防止密钥泄漏进图谱。全部打包在 claude-code-token-savers 仓库里。"
pubDate: 2026-06-23
heroImage: "/images/blog/graphify-hero.png"
tags: ["graphify", "claude-code", "tokens", "knowledge-graph", "openrouter"]
draft: false
---

# 在 Claude Code 中使用 graphify：用知识图谱替代通读整个仓库

在[节省 token 的指南](https://www.suenot.com/blog/saving-tokens-llm/)里，我把 graphify 当作整套技术栈的一部分简单提了一句。这篇文章则专门深入讲讲我是如何把自动化搭起来的：我具体在全局开启了哪些功能，以及为什么它不会烧掉 Claude 的 token。

问题很简单。为了读懂别人的代码（或者你自己半年前写的代码），智能体会成批地读文件，每个文件都进入上下文。这在输入上很昂贵，而且还会带来上下文腐化：堆得越多，模型想得越糟。[graphify](https://github.com/safishamsi/graphify) 打破了这种耦合：它只需一次，就能从仓库构建出一张知识图谱（节点、关系、社区、god 节点），你去**查询**它，而不是把文件一股脑塞进窗口。

所有内容都打包在一个仓库里——**[suenot/claude-code-token-savers](https://github.com/suenot/claude-code-token-savers)**（`graphify/` 文件夹、一个幂等的 `setup.sh`、补丁、钩子）。

## 核心技巧：用别人的 token 做语义提取

构建图谱是一大堆用于实体与关系提取的 LLM 调用。如果你通过 Claude 来跑它们，省下来的钱就变成了花出去的钱。所以语义提取被转嫁到了**廉价的 OpenRouter** 上，而不是 Claude 的预算里。

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

`deepseek/deepseek-v4-flash`——每 100 万 token 收费 $0.09 / $0.18，100 万上下文。为一个中等规模的项目构建图谱大约花费 **OpenRouter 上 ~$0.10，以及零 Claude 会话 token**。换模型只需一个变量：`export GRAPHIFY_OPENROUTER_MODEL=qwen/qwen3.7-plus`。

一个重要的细节：`graphify install` 会覆盖 `~/.claude/skills/graphify/SKILL.md`。那个文件硬编码了提取后端的优先级，如果你不把它恢复回来，graphify 就会回退到 Claude 子智能体并烧掉你的 token。正确的优先级是：

1. **OpenRouter**（如果存在 `OPENROUTER_API_KEY`）——文本块发往这里。
2. **Gemini**（如果存在 `GEMINI_API_KEY` / `GOOGLE_API_KEY`）。
3. **Claude 子智能体**——仅作为最后的回退。

## 安装

你需要 [`uv`](https://docs.astral.sh/uv/) 以及环境中的 `OPENROUTER_API_KEY`。

```bash
cd graphify
./setup.sh          # installs graphify, the OpenRouter backend, patches, hooks, no-media
```

`setup.sh` 是幂等的（带回滚）。如果你更想手动来，底层执行的是：

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

## 自动监听：图谱会自我更新

自动化的核心是 `SessionStart` 钩子 `build-and-watch.sh`。每次会话启动时，它都会检查项目并选择一条分支：

- **图谱已存在** → 启动 `graphify watch`（廉价，仅 AST，不调用 LLM）+ 安装 pre-commit 守卫 → 状态为 "watching"。
- **图谱未初始化** → 打印 "run `/graphify .`" 并什么都不做。这是一道防线：不小心打开的根目录或巨大的文件夹不会悄无声息地进入索引并烧掉 token。
- `~/.graphify/autobuild` 标记 → 额外地，通过 OpenRouter 自动构建小型、新鲜的项目（上限：500 个文件 / 200 万词；超过的会被跳过，并请求你手动构建）。

安全守卫：它会跳过 `$HOME`、文件系统根目录、系统/`tmp` 文件夹、`$HOME` 的上级目录，以及任何带有 `.graphify-skip` 的项目。全局总开关是 `~/.graphify/disable-autowatch`。每个项目恰好一个监听器（原子的 `mkdir` 锁 + PID 检查）。在 `SessionEnd` 时，它会被 `stop-watch.sh` 杀掉。`watch` 只更新代码/AST 层；文档需要 `/graphify . --update`。

`~/.claude/settings.json` 里的钩子映射（合并，不要覆盖已有的）：

```
SessionStart  -> ~/.graphify/build-and-watch.sh    # status + watch
SessionEnd    -> ~/.graphify/stop-watch.sh          # stop watcher
```

## 什么不会进入图谱（以及为什么这很重要）

图谱可能会被提交进 commit，这意味着你不能让密钥进入它。三套相互独立的机制：

1. **密钥与 `.env`**——总会被 graphify 内置的 `_is_sensitive` 剥离，无需配置。
2. **媒体文件**——一个干净的开关，无需折腾 ignore 文件：当 `~/.graphify/no-media` 存在时（或 `GRAPHIFY_NO_MEDIA=1`），`patch-no-media.py` 会让 `detect()` 跳过图片/pdf/视频/office 文件。删掉这个标记，媒体文件又会重新参与进来。
3. **`.gitignore` 被覆盖——已修复。** 在上游，一个文件夹的 `.graphifyignore` 会**完全覆盖**它自己的 `.gitignore`：只存在于 `.gitignore` 中的某个模式（比如一个密钥）仍然会被索引。`patch-merge-ignore.py` 改为合并而非替换——这就是上游的 [PR #1364](https://github.com/safishamsi/graphify/pull/1364)。

除此之外——还有 **pre-commit 守卫**（`precommit-graph-guard.sh`），它被安装进已 graphify 的 git 仓库，如果某个被 `.gitignore` 忽略的文件进了图谱，它就会**阻止** `graphify-out/graph.json` 的提交。这是针对密钥泄漏进已提交图谱的纵深防御。用 `git commit --no-verify` 可以绕过。

## 如何使用

构建一次，然后查询：

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

输出是交互式 HTML、GraphRAG-JSON，以及一份人类可读的 `GRAPH_REPORT.md`；还有 `--mcp`（给智能体用的 stdio 服务器）和 `--wiki`。从此以后，智能体不再"读完整个 auth 模块"，而是去命中图谱，精确拿到它所需要的那一片切片。

## 升级 graphify 之后

`uv tool upgrade graphifyy` 和 `graphify install` 会清空 site-packages（三个 `detect.py` 补丁全部丢失）并覆盖 `SKILL.md`。修复办法是再跑一次 `./setup.sh`（恢复补丁、文件、no-media 标记），并在 `SKILL.md` 中重新加上后端优先级那一段。能在升级中幸存下来的：`~/.graphify/*`、`~/.claude/settings.json` 里的钩子、每个仓库的 `.git/hooks/pre-commit`。

---

归根结底：graphify 把上下文中最沉重的那一层——"通读整个仓库"——移除了，而且是用别人那便宜到几分钱的 token 来做的，它在后台自我更新，并且不会把密钥拖进图谱。它与 rtk（命令输入）和 caveman（模型输出）的组合，在[节省 token 的指南](https://www.suenot.com/blog/saving-tokens-llm/)里有详细介绍。
