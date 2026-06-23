---
title: "Gonka 免费送 $10，无需信用卡：为 AI 初创公司准备的数十亿 Kimi K2.6 Token"
description: "GonkaGate 免费发放 $10 余额，无需信用卡，也无需加密货币充值。以约每 100 万 Token $0.000334 的价格计算，这足够换来数十亿个 Kimi K2.6 Token——正是疯狂烧 Token 的 AI 初创公司的燃料。内含：TPS 测试，以及 opencode 与 Hermes Agent 的分步配置。"
pubDate: 2026-06-23
heroImage: "/images/blog/gonka-hero.png"
tags: ["gonka", "llm", "tokens", "kimi", "opencode", "hermes-agent"]
draft: false
---

# Gonka 免费送 $10，无需信用卡：为 AI 初创公司准备的数十亿 Kimi K2.6 Token

给所有大把烧 Token 的人快速介绍一下：[Gonka](https://gonka.ai) 是一个去中心化算力网络，而 [GonkaGate](https://gonkagate.com/en) 是构建在它之上、按美元计费的 OpenAI 兼容网关。而且它**在注册时就直接送你 $10 免费余额——无需信用卡，也无需加密货币充值**。你不需要钱包、不需要 GNK token，也不需要预先掏一分钱就能开始发送请求。

## 为什么这很重要

重点不在于这 $10 本身，而在于这 $10 能装下**多少 Token**。

GonkaGate 上 `moonshotai/kimi-k2.6` 的价格约为**每 100 万 Token $0.000334**（约 $0.000304 网络成本 + 约 $0.000030 网关费用）。这比典型云端价格便宜了好几个数量级。按这个价格，$10 就是**数十亿个 Token**。实际上，就这 $10 也能覆盖大约 **26 亿个上下文 Token** 的 Kimi K2.6。

这已经不再是"随便玩玩"了——这是真正的燃料。有了这免费的 $10，你可以：

- 跑批量处理（分类、打标签、对成千上万份文档做摘要）；
- 让那些大批量吞噬上下文的后台 agent 持续运行；
- **搭建 AI 初创公司的原型**，而在这种场景里，Token 经济账往往在起跑线上就扼杀了创意。

如果你愿意，可以用 **USDT** 给账户充值——但起步时根本不需要；$10 一开始就在那里。

## 速度

我通过该网关对 `moonshotai/kimi-k2.6` 做了基准测试：端到端生成速度**约为 60 tok/s**。对于一个以这种价格运行的去中心化网络而言，这些数字相当可用。

## 获取密钥

1. 在 **[gonkagate.com/en/pricing](https://gonkagate.com/en/pricing)** 注册——$10 会自动到账。
2. 创建一个 API 密钥。它以 `gp-...` 开头，并且**只显示一次**——请立刻保存。
3. API base：`https://api.gonkagate.com/v1`，授权方式 `Authorization: Bearer gp-...`。该网关是 OpenAI 兼容的：替换 base URL、密钥和模型 id，任何 OpenAI SDK 都能原样运行。

快速冒烟测试（确认密钥可用）：

```bash
curl https://api.gonkagate.com/v1/chat/completions \
  -H "Authorization: Bearer $GONKAGATE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "moonshotai/kimi-k2.6",
    "messages": [{"role": "user", "content": "Reply with exactly: GonkaGate ok"}]
  }'
```

## opencode 的配置

[opencode](https://opencode.ai) 是一个终端 AI agent。它以自定义提供商的方式接入 GonkaGate。

### 方案 A——官方安装器（最简单）

```bash
npx @gonkagate/opencode-setup
```

非交互式（用于脚本/CI）：

```bash
GONKAGATE_API_KEY=gp-... npx @gonkagate/opencode-setup --scope project --yes
```

### 方案 B——手动配置

1. 启动 opencode，运行 `/connect`，选择 `Other`，然后填入：
   - Provider id：`gonkagate`
   - API key：你的 `gp-...`
2. 把该提供商加入 `~/.config/opencode/opencode.json`：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "gonkagate": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "GonkaGate",
      "options": {
        "baseURL": "https://api.gonkagate.com/v1"
      },
      "models": {
        "moonshotai/kimi-k2.6": {
          "name": "Kimi K2.6 (GonkaGate)"
        }
      }
    }
  },
  "model": "gonkagate/moonshotai/kimi-k2.6",
  "small_model": "gonkagate/moonshotai/kimi-k2.6"
}
```

3. 检查：

```bash
opencode debug config --pure
```

然后在 opencode 中运行 `/models`——列表里应该会出现 `GonkaGate` 提供商和 `Kimi K2.6` 模型。你随时可以从 `GET /v1/models` 拉取当前的模型列表。

## Hermes Agent 的配置

来自 Nous Research 的 [Hermes Agent](https://github.com/nousresearch/hermes-agent) 是一个终端 agent，可与任意模型提供商配合工作，并能在多个会话间记住上下文。它同样可以一步接入 GonkaGate。

**前置要求：** `PATH` 中有 Hermes Agent `v2026.5.16` / `v0.14.0`+，Node.js ≥ `22.14.0`，一个 `gp-...` 密钥，一个交互式终端（TTY），Linux/macOS/WSL2。

### 方案 A——官方安装器

```bash
npx @gonkagate/hermes-agent-setup
```

在独立的 profile 下：

```bash
npx @gonkagate/hermes-agent-setup --profile work
```

### 方案 B——手动配置

安装器会编辑两个文件；你也可以手动写出同样的内容。

`~/.hermes/config.yaml`：

```yaml
model:
  provider: custom
  base_url: https://api.gonkagate.com/v1
  default: moonshotai/kimi-k2.6
```

`~/.hermes/.env`：

```
OPENAI_API_KEY=gp-...
```

运行并检查：

```bash
hermes
# then prompt: Reply with exactly: Hermes Agent connected to GonkaGate
```

## 注意事项

- **工具 schema 中的 RE2 正则。** Gonka 上的 Kimi 后端使用 Go RE2——它不理解前瞻（lookahead）。如果某个 MCP 工具的 JSON schema 里有带 `(?!` 或 `(?=` 的 `pattern`，请求就会失败：`400 ... schema pattern is not a valid regular expression`。解决办法是从工具 schema 中移除这类 pattern。
- **其他模型。** 除了 `moonshotai/kimi-k2.6`，还有 Qwen3 235B、MiniMax M2.7 等等——当前列表见 `GET /v1/models`。id 区分大小写，所以请原样复制。
