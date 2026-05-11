---
title: "OpenClaude：一个配置替代十个命令"
description: "OpenClaude 如何用一个 ~/.openclaude.json 配置文件替代每个提供商的独立包装命令。"
pubDate: 2026-05-11
heroImage: "/images/blog/openclaude-hero.png"
tags: ["claude-code", "openclaude", "llm", "providers", "tooling"]
draft: false
---

# OpenClaude：一个配置替代十个命令

如果你读过 [Clother 那篇文章](/blog/clother-claude-wrappers)，你就知道痛点：每次想让 Claude Code 连接不同提供商——GLM、Kimi、MiniMax、DeepSeek——需要单独的包装命令。`clother-zai`、`clother-kimi`、`clother-minimax`……每个设置自己的环境变量，每个是单独的符号链接。

[OpenClaude](https://github.com/Gitlawb/openclaude) 换了思路。**所有模型定义在一个 JSON 配置文件里**——CLI 自己处理路由。

## 每个命令一个包装器的问题

```
clother-zai        → Z.AI GLM-5
clother-kimi       → Kimi (kimi-k2.5)
clother-minimax    → MiniMax-M2.7
clother-deepseek   → DeepSeek
clother-alibaba    → 阿里云编程计划
clother-ollama     → 本地 Ollama
```

六个命令。再加 OpenRouter 别名、自定义提供商——你在管理一个动物园。

## OpenClaude：一切尽在 `~/.openclaude.json`

OpenClaude 是开源编程代理 CLI（26k+ 星标，TypeScript，MIT），核心功能是**代理路由**——在一个配置文件中定义所有模型，CLI 根据任务自动选择。

```json
{
  "agentModels": {
    "deepseek-v4-flash": {
      "base_url": "https://api.deepseek.com/v1",
      "api_key": "sk-your-key"
    },
    "gpt-4o": {
      "base_url": "https://api.openai.com/v1",
      "api_key": "sk-your-key"
    },
    "glm-5": {
      "base_url": "https://open.bigmodel.cn/api/paas/v4",
      "api_key": "your-zhipu-key"
    },
    "kimi-k2.5": {
      "base_url": "https://api.moonshot.cn/v1",
      "api_key": "your-moonshot-key"
    },
    "minimax-m2.7": {
      "base_url": "https://api.minimax.chat/v1",
      "api_key": "your-minimax-key"
    }
  },
  "agentRouting": {
    "Explore": "deepseek-v4-flash",
    "Plan": "gpt-4o",
    "general-purpose": "glm-5",
    "frontend-dev": "deepseek-v4-flash",
    "code-review": "kimi-k2.5",
    "default": "gpt-4o"
  }
}
```

**五个提供商。一个文件。零个需要记忆的命令。**

`agentRouting` 是核心：不同任务自动发送到不同模型。探索走 DeepSeek，规划走 GPT-4o，编码走 GLM-5，代码审查走 Kimi。

## 支持的提供商

| 提供商 | 类型 |
|--------|------|
| OpenAI (GPT-4o, o3 等) | 云端 API |
| Gemini | 云端 API |
| GitHub Models | 云端 API |
| DeepSeek | 云端 API |
| 任何 OpenAI 兼容 (GLM, Kimi, MiniMax 等) | 云端 API |
| Ollama | 本地 |
| Codex / Codex OAuth | 云端 API |

## 快速开始

```bash
npm install -g @gitlawb/openclaude
openclaude
```

CLI 内运行 `/provider` 进行交互式设置，或直接编辑 `~/.openclaude.json`。

快速环境变量启动：

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=sk-your-key
export OPENAI_MODEL=gpt-4o
openclaude
```

Ollama 快捷方式：

```bash
ollama launch openclaude --model qwen2.5-coder:7b
```

## Clother vs OpenClaude

| | Clother | OpenClaude |
|---|---------|-----------|
| **方式** | 包装官方 Claude Code | 独立 CLI |
| **配置** | config.json + 符号链接 | 一个 JSON 文件 |
| **添加提供商** | 新符号链接 + 密钥 | 一个 JSON 块 |
| **代理路由** | 手动（不同终端标签） | 自动 `agentRouting` |
| **需要 Claude Code** | 是 | 否 |
| **提供商命令** | `clother-zai`, `clother-kimi`… | 一个 `openclaude` |

**用 Clother** 保留官方 Claude Code，干净切换提供商。

**用 OpenClaude** 一个 CLI 处理所有提供商，自动路由。

## 成本优化

结合[如何节省 Token](/blog/saving-tokens-llm)的策略：Clother 需要切换标签；OpenClaude 的 agentRouting 自动把探索发到 DeepSeek，规划到 GPT-4o，编码到 GLM-5。

## 总结

1. **Shell 别名** → 脆弱
2. **Clother** → 干净包装器
3. **OpenClaude** → 所有模型一个配置，自动路由

---

*延伸阅读：[Clother](/blog/clother-claude-wrappers) 和 [如何节省 Token](/blog/saving-tokens-llm)。*
