---
title: "Clother：不修改全局设置即可为 Claude Code 添加多供应商包装器"
description: "如何使用 jolehuit/clother 通过 clother-* 命令在 Z.AI、Kimi、MiniMax、OpenRouter、阿里巴巴、Ollama、LM Studio 和自定义供应商之间切换 Claude Code——无需修改 ~/.claude 或全局环境变量。"
pubDate: 2026-04-19
heroImage: "/images/blog/clother-claude-hero.png"
tags: ["claude-code", "clother", "llm", "providers", "tooling"]
draft: false
---

# Clother：不修改全局设置即可为 Claude Code 添加多供应商包装器

Claude Code 很出色——但当你想用 Anthropic 以外的端点运行时，体验就崩了。你开始修改 `ANTHROPIC_BASE_URL`、`ANTHROPIC_AUTH_TOKEN`，为每个供应商维护 shell 脚本，慢慢把 `~/.claude` 和 shell 配置文件变成半残废别名的坟场。

[Clother](https://github.com/jolehuit/clother) 正是解决这个问题的工具。它是一个小巧的 Go 二进制文件，给你一系列 `clother-*` 启动命令，每个供应商一个。安装一次，之后在 Claude（订阅）、Z.AI GLM-5、Kimi、MiniMax、DeepSeek、阿里巴巴编程计划、OpenRouter、Ollama、LM Studio、llama.cpp 或你自己的自定义端点之间切换，就是换个命令名而已。

关键是，**你的 Claude Code 安装完全不受影响**。不需要编辑 `~/.claude/settings.json`，没有永久的环境变量污染，不会有明天早上意外把工作会话发送到错误供应商的风险。

## 1. Clother 解决的问题

当你想用非 Anthropic 后端运行 Claude Code 时，通常需要：

1. **基础 URL**（`ANTHROPIC_BASE_URL`）——每个供应商不同
2. **认证令牌**（`ANTHROPIC_AUTH_TOKEN`）——每个供应商一个不同的密钥
3. **模型名称**——不同的命名方案（`glm-5`、`kimi-k2.5`、`MiniMax-M2.5`……）
4. 有时需要特定的**标志**让 Claude Code 正确配合该后端

大多数人最终选择三种糟糕方案之一：

- **编辑 shell rc 文件。** 现在每个 shell 会话都锁定在一个供应商上，直到你记得取消所有设置。
- **维护一个 `.sh` 启动器文件夹。** 它们逐渐不同步，路径损坏，你忘记哪个指向哪里。
- **每次切换供应商时编辑 `~/.claude/settings.json`。** 这是最糟糕的选项——你的编辑器扩展、其他终端和后台会话都会悄悄开始使用错误的端点。

Clother 完全避免了第三种方案：它从不编辑你的 Claude 配置。相反，它**仅在一个进程的生命周期内**设置正确的环境变量，然后 `exec` 真正的 `claude` 二进制文件。

## 2. Clother 的本质

底层实现是一个 Go 二进制文件加上一堆名为 `clother-<provider>` 的符号链接。二进制文件检查自己的调用名称（`argv[0]`），查找对应的配置文件，从 `~/.local/share/clother/secrets.env`（chmod 600）加载密钥，导出正确的环境变量，然后 `exec` 位于 Clother bin 目录之外的真正 `claude` 二进制文件。

`clother-zai` 的整个过程在道德上等同于：

```bash
export ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"
export ANTHROPIC_AUTH_TOKEN="$ZAI_API_KEY"
exec /path/to/the/real/claude "$@"
```

这种设计带来三个结果：

- **零状态泄漏。** 一旦 Claude 进程退出，环境变量随之消失。
- **多个供应商并行。** 打开四个终端标签，同时运行 `clother-native`、`clother-kimi`、`clother-zai` 和 `clother-or stepfun`。它们互不影响。
- **`claude --resume` 继续工作**，因为 Clother 还安装了一个 `claude` shim，知道如何将恢复请求分发回正确的供应商配置。

## 3. 安装

在 macOS 上最干净的方式是 Homebrew：

```bash
curl -fsSL https://claude.ai/install.sh | bash    # Claude Code 本身
brew tap jolehuit/tap
brew install clother
```

在 Linux（或没有 Homebrew 的 macOS）上：

```bash
curl -fsSL https://claude.ai/install.sh | bash
curl -fsSL https://raw.githubusercontent.com/jolehuit/clother/main/scripts/install.sh | bash
```

## 4. 日常使用

日常循环很简单：选择一个启动器。

```bash
clother-native                       # Anthropic，你的 Claude Pro/Max/Team 订阅
clother-zai                          # Z.AI GLM-5
clother-kimi                         # Kimi (kimi-k2.5)
clother-minimax                      # MiniMax-M2.7
clother-deepseek                     # DeepSeek
clother-alibaba                      # 阿里巴巴编程计划
clother-ollama --model qwen3-coder   # 本地 Ollama
clother-or stepfun                   # OpenRouter 别名
clother-custom sambanova --yolo      # 自定义供应商
```

一些值得记住的标志：

- `--yolo` — Clother 的 `--dangerously-skip-permissions` 简写。对批量子代理非常有用，其他地方很危险。
- `--model <name>` — 直接传递给 Claude。让你在单次启动时覆盖默认模型。
- `clother config <provider>` — 设置/更改供应商的 API 密钥和默认模型。
- `clother info <provider>` — 查看将使用哪个基础 URL、模型和令牌环境变量。

## 5. 通过 `~/.config/clother/config.json` 自定义

这是 Clother 对高级用户真正发光的地方。大部分有趣的行为都在一个 JSON 文件中：

```json
{
  "version": 1,
  "provider_overrides": {
    "zai": {
      "model": "glm-5.1"
    }
  },
  "openrouter_aliases": {
    "kimi25":    "moonshotai/kimi-k2.5:nitro",
    "minimax27": "minimax/minimax-m2.7:nitro",
    "qwen36":    "qwen/qwen3.6-plus",
    "stepfun":   "stepfun/step-3.5-flash:nitro"
  },
  "custom_providers": {
    "sambanova": {
      "name": "sambanova",
      "display_name": "sambanova",
      "base_url": "https://api.sambanova.ai",
      "api_key_env": "SAMBA_API_KEY",
      "default_model": "MiniMax-M2.5",
      "api_type": "openai"
    }
  }
}
```

三个独立机制：

**`provider_overrides`** — 修补内置配置。Z.AI 启动器默认使用 `glm-5`；此配置将其升级为 `glm-5.1`。

**`openrouter_aliases`** — 为冗长的 OpenRouter 模型 ID 提供简短、人性化的名称。配置后可以调用 `clother-or kimi25`、`clother-or minimax27` 等。

**`custom_providers`** — 注册全新的供应商。通过通用自定义供应商入口点运行：`clother-custom sambanova --yolo`。

## 6. 内置供应商菜单

| 层级 | 示例 |
|------|------|
| 云端 | `clother-native`、`clother-zai`、`clother-kimi`、`clother-minimax`、`clother-deepseek`、`clother-alibaba` |
| 中国端点 | `clother-zai-cn`、`clother-minimax-cn`、`clother-ve`（火山引擎） |
| 本地 | `clother-ollama`、`clother-lmstudio`、`clother-llamacpp` |
| OpenRouter | `clother-or <你的别名>`（100+ 模型） |
| 自定义 | `clother-custom <你的别名>` |

## 7. 恢复和 VS Code

**恢复。** Claude Code 在每个会话结束时打印 `claude --resume <id>` 命令。Clother 安装的 `claude` shim 会拦截这些恢复请求并将其路由回原始供应商。

**VS Code。** 官方 Claude Code 扩展（2.6+）有一个 `Claude Process Wrapper` 设置。将其指向你想要的启动器的绝对路径，重新加载，扩展就会使用该供应商。

## 8. 何时使用 Clother

使用 Clother 的场景：

- 你想**试用**非 Anthropic 后端而不影响全局设置
- 你在便宜的供应商上运行**批量子代理任务**，同时保持交互会话在 Anthropic 上
- 你需要**每个终端独立的供应商隔离**
- 你想要一个**干净的卸载路径**。`clother uninstall` 删除一切，你的 Claude Code 保持原样

不适合的场景：

- 你只使用 Anthropic 的端点——没有收益
- 你需要 Claude Code 本身不支持的供应商特性
- 你期望所有供应商行为完全一致——不会的

## 9. 总结

Clother 是一个把小事做好的工具：它让你保持 Claude Code 作为唯一稳定的界面，而把底层供应商当作运行时决策。没有全局配置漂移，没有每个供应商的设置分叉，实验时没有可怕的影响范围。

如果你已经在优化成本（中国订阅、OpenRouter 别名、本地模型处理无聊工作），可以将这篇文章与 [如何节省 LLM 令牌](/blog/saving-tokens-llm) 配合阅读——Clother 是让这些优化在日常工作中实用的连接纽带。
