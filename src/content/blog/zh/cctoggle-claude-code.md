---
title: "cctoggle：一条命令关闭每个 Claude Code 插件和 MCP 服务器——再一键恢复"
description: "一个小工具和全局 /cctoggle 斜杠命令，一次性关闭所有 Claude Code 插件和用户级 MCP 服务器——把它们的工具定义从上下文中清除——并精确恢复它所禁用的内容。无需重启应用。内含：应用机制、选择性禁用、备份以及局限性。"
pubDate: 2026-06-23
heroImage: "/images/blog/cctoggle-hero.png"
tags: ["cctoggle", "claude-code", "tokens", "mcp", "plugins"]
draft: false
---

# cctoggle：一条命令关闭每个 Claude Code 插件和 MCP 服务器

Claude Code 会话很少是空白的。插件被加载，用户级 MCP 服务器被连接，每一个都带来一捆工具定义，所有这些在你发出第一条消息之前就已经进入上下文。有时你想要的恰恰相反：为某个特定任务准备一个干净、精简的会话——然后用一条命令恢复。

这正是我打造 [**cctoggle**](https://github.com/suenot/cctoggle)（公开，MIT）的原因——一个小工具和一个全局斜杠命令，一次性关闭所有插件和用户级 MCP 服务器，然后精确恢复它所禁用的内容。

## 问题所在

会话携带的插件和 MCP 服务器越多，上下文就越臃肿：它们的工具定义吞噬 token 预算，并把可用工具列表搞得杂乱。这既更贵（输入增长），也更不利于质量（堆进去的越多，模型越难驾驭）。而手动操作意味着要编辑两个配置文件，然后痛苦地记住你究竟改动了什么，才能把它放回去。

cctoggle 把两头都封住了：它用一条命令禁用一切，并精确记住它禁用了什么，从而只恢复那些内容。

## 它做什么

四条命令，既能在 Claude Code 内作为 `/cctoggle` 使用，也能在终端中作为 `cctoggle` CLI 使用：

```bash
/cctoggle status          # what's currently enabled/disabled
/cctoggle off             # disable all plugins + user-scope MCP
/cctoggle on              # restore exactly what cctoggle disabled
/cctoggle restore-backup  # roll back to a config backup
```

`off` 做两件事：

- **插件** —— 把 `~/.claude/settings.json` 中的 `enabledPlugins` 标志翻为 `false`。
- **MCP** —— 把用户级 MCP 服务器定义从 `~/.claude.json` 中取出，存放到一个本地状态文件中。

`on` 严格恢复 cctoggle 自己禁用的内容。如果你之前已经手动关掉了某个插件或服务器，`on` 会保持它原样，不会重新启用它。这是一个重要的细节：这条命令不是"启用一切"，而是"撤销我上一次的 `off`"。

### 选择性禁用

你不必把一切都炸掉。`off` 接受参数：

```bash
cctoggle off --keep superpowers,caveman   # disable all except these
cctoggle off graphify rtk                  # disable only the listed ones
```

## 改动如何生效（值得理解）

这是非平凡的部分——插件和 MCP 有不同的生效机制。

**插件改动作用于当前会话**——但只有在你输入 `/reload-plugins` 之后。无需完整重启应用。

**MCP 配置改动在你下一次 `claude` 会话时生效。** Claude Code 中没有实时的 MCP 断开——它不被支持。而且，不那么明显的是：`/clear` 和 `/compact` 都不会断开 MCP 连接。同一个进程让子 MCP 服务器持续存活，所以清空上下文是不够的——你需要一个全新的 `claude` 会话。

所以工作循环是：

```bash
/cctoggle off        # flag plugins and stash MCP
/reload-plugins      # plugins leave the current session
# for MCP — exit and start claude again
```

## 安装

你只需要 git。克隆仓库并运行安装脚本：

```bash
git clone https://github.com/suenot/cctoggle.git ~/projects/claude && \
  ~/projects/claude/install.sh
```

`install.sh` 把斜杠命令符号链接到 `~/.claude/commands/`，并把 `cctoggle` CLI 放到你的 `PATH` 上。之后 `/cctoggle` 在每个 Claude Code 会话中都可用，而 `cctoggle` 可以直接从终端运行。

## 为什么它很稳健

`/cctoggle` 是一个**用户命令**（它位于 `~/.claude/commands/`），而不是插件。所以即使在所有插件被禁用之后，它仍然能正常工作。如果 cctoggle 本身是一个插件，`off` 命令就会搬起石头砸自己的脚——而现在，无论你关掉了什么，`on` 总是触手可及。

## 备份与隐私

在每次改动之前，cctoggle 都会把两个配置文件（`~/.claude/settings.json` 和 `~/.claude.json`）备份到 `backups/` 目录。如果出了什么问题，`restore-backup` 会回滚到一份已保存的副本。

状态文件和备份都被 gitignore 了，所以你的私有 MCP 服务器定义（往往包含密钥和 token）永远不会泄露进一次提交。

## 局限性

有一个诚实的局限性要先说清楚。`claude mcp get <name>` 报告为 **"Dynamic config (from command line)"** 的 MCP 服务器——即在启动时通过命令行标志注入的（例如 `claude_design`）——根本无法通过配置来切换。它们只能通过改变 `claude` 的启动方式并重启它来禁用。

cctoggle 会**检测并报告**这些服务器，但它无法切换它们——这是机制本身的局限，而不是工具的局限。

---

总结：cctoggle 是一个在"重型"会话（带所有插件和 MCP）与针对手头任务的"精简"会话之间的快速切换开关，并保证一切都能原样回来。每一步之前都有备份，私有 MCP 定义留在 git 之外，而命令本身在所有插件被禁用后依然存活，因为它位于用户空间。仓库——[github.com/suenot/cctoggle](https://github.com/suenot/cctoggle)。
