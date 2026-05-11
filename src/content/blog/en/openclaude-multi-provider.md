---
title: "OpenClaude: one config instead of ten commands"
description: "How OpenClaude replaces per-provider wrapper commands (Clother, shell aliases) with a single ~/.openclaude/settings.json config — all models, all providers, one CLI."
pubDate: 2026-05-11
heroImage: "/images/blog/openclaude-hero.png"
tags: ["claude-code", "openclaude", "llm", "providers", "tooling"]
draft: false
---

# OpenClaude: one config instead of ten commands

If you've read the [Clother article](/blog/clother-claude-wrappers), you know the pain: every time you want Claude Code to talk to a different provider — GLM, Kimi, MiniMax, DeepSeek — you need a separate wrapper command. `clother-zai`, `clother-kimi`, `clother-minimax`, `clother-deepseek`… Each one sets env vars, each one is a separate symlink, and every new provider means another entry in your PATH.

The real problem isn't remembering the commands — it's **rate limits**. You're in the middle of a session, the model hits its usage cap, and now you have to stop the process, launch a different `clother-*` command, and somehow resume the same task with a different model. That's manual, error-prone, and wastes context.

[OpenClaude](https://github.com/Gitlawb/openclaude) solves this differently. Instead of per-provider commands, you define **all your models in one JSON config** — and the CLI handles the routing.

A bit of backstory: OpenClaude exists because Anthropic accidentally published Claude Code's source code. That unintended leak became a genuine gift to the open-source community — the community forked it, stripped the Anthropic lock-in, added multi-provider support, and now it has 26k+ stars. Sometimes the best open-source projects start with a happy accident.

## The problem with per-command wrappers

With Clother and similar wrapper tools, the mental model is:

```
clother-zai        → Z.AI GLM-5
clother-kimi       → Kimi (kimi-k2.5)
clother-minimax    → MiniMax-M2.7
clother-deepseek   → DeepSeek
clother-alibaba    → Alibaba Coding Plan
clother-ollama     → Local Ollama
clother-or stepfun → OpenRouter alias
```

That's seven different commands for seven providers. Add OpenRouter aliases, custom providers, local models — and you're managing a zoo.

The real friction:
- **Rate limits kill your flow.** You're mid-session on GLM, the quota runs out, and now you have to stop, switch to `clother-kimi`, and resume — losing context or manually re-feeding it
- **Each provider needs its own command** — you can't mix models in one session
- **Adding a provider means installing** a new symlink and configuring keys separately
- **Agent routing is manual** — you decide which terminal tab runs which wrapper

## A fair note: OpenClaude as a dev agent

I want to be honest: **as a coding agent for daily development, I still prefer Anthropic's official Claude Code CLI**. The native client is more polished, more stable, and has tighter integration with Claude's capabilities. OpenClaude is a community fork and it shows in some rough edges during actual coding sessions.

But the **config approach** is what makes OpenClaude interesting. The `~/.openclaude/settings.json` with `agentModels` and `agentRouting` is a genuinely better way to manage multiple providers than per-command wrappers. Even if you use OpenClaude only to experiment with this config pattern, it's worth knowing about — and maybe Anthropic will adopt something similar natively one day.

## OpenClaude: everything in `~/.openclaude/settings.json`

OpenClaude is an open-source coding-agent CLI (26k+ stars, TypeScript, MIT) that supports multiple providers natively. The key feature is **agent routing** — you define all your models and their API endpoints in a single config file, and the CLI automatically picks the right one depending on the task.

### Porting a real Clother config

Here's what a real migration looks like. My Clother config:

```json
{
  "version": 1,
  "provider_overrides": {
    "kimi": { "model": "kimi-k2.6" },
    "zai": { "model": "glm-5.1" }
  },
  "openrouter_aliases": {
    "kimi25": "moonshotai/kimi-k2.5:nitro",
    "minimax27": "minimax/minimax-m2.7:nitro",
    "qwen36": "qwen/qwen3.6-plus",
    "stepfun": "stepfun/step-3.5-flash:nitro"
  },
  "openrouter_aliases": {
    "deepseek-v4": "deepseek/deepseek-v4-flash:nitro"
  },
  "custom_providers": {
    "sambanova": {
      "base_url": "https://api.sambanova.ai",
      "api_key_env": "SAMBA_API_KEY",
      "default_model": "MiniMax-M2.5"
    }
  }
}
```

The same setup as `~/.openclaude/settings.json`:

```json
{
  "agentModels": {
    "glm-5.1": {
      "base_url": "https://api.z.ai/api/anthropic",
      "api_key": "your-zai-key"
    },
    "kimi-k2.6": {
      "base_url": "https://api.kimi.com/coding/",
      "api_key": "your-kimi-key"
    },
    "deepseek-v4-flash": {
      "base_url": "https://openrouter.ai/api/v1",
      "api_key": "your-openrouter-key"
    },
    "MiniMax-M2.5-sambanova": {
      "base_url": "https://api.sambanova.ai",
      "api_key": "your-sambanova-key"
    }
  },
  "agentRouting": {
    "Plan": "glm-5.1",
    "code-review": "glm-5.1",
    "general-purpose": "kimi-k2.6",
    "frontend-dev": "kimi-k2.6",
    "Explore": "deepseek-v4-flash",
    "default": "kimi-k2.6"
  }
}
```

**Four providers. One file. Zero commands to remember.** No more `clother-zai`, `clother-kimi`, `clother-or deepseek-v4` — just one `openclaude` command.

The `agentRouting` section is the real power: different tasks automatically go to different models. The smart GLM-5.1 handles planning and code review, Kimi takes routine coding tasks, and DeepSeek V4 Flash via OpenRouter handles exploration. You set this up once and forget about it.

## What OpenClaude supports

OpenClaude works with any OpenAI-compatible API out of the box, plus has native support for:

| Provider | Type |
|----------|------|
| OpenAI (GPT-4o, o3, etc.) | Cloud API |
| Gemini | Cloud API |
| GitHub Models | Cloud API |
| DeepSeek | Cloud API |
| Any OpenAI-compatible (GLM, Kimi, MiniMax, etc.) | Cloud API |
| Ollama | Local |
| Codex / Codex OAuth | Cloud API |
| Atomic Chat | Cloud API |

The `/provider` slash command inside the CLI gives you a guided setup — no manual JSON editing if you don't want it.

## Getting started

Install:

```bash
npm install -g @gitlawb/openclaude
```

Launch:

```bash
openclaude
```

Inside the CLI, run `/provider` for interactive provider setup, or edit `~/.openclaude/settings.json` directly.

### Quick setup with env vars

For a fast start without touching config files:

```bash
# OpenAI
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=sk-your-key
export OPENAI_MODEL=gpt-4o
openclaude

# Local Ollama
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_BASE_URL=http://localhost:11434/v1
export OPENAI_MODEL=qwen2.5-coder:7b
openclaude
```

### Ollama shortcut

If you have Ollama installed:

```bash
ollama launch openclaude --model qwen2.5-coder:7b
```

This automatically routes all API traffic through your local instance — no env vars needed.

### `/provider` vs `/model` — don't confuse them

This is a non-obvious gotcha you'll hit on first launch.

**`/provider`** — switches between providers (Kimi, GLM, DeepSeek, MiniMax). Each profile is a separate `baseUrl` + `apiKey` + `model`. All 4 profiles are visible here:

```
Edit provider
 1. Kimi (active)                 OpenAI-compatible API · kimi-k2.6
 2. GLM-5.1 (Z.AI)               OpenAI-compatible API · glm-5.1
 3. DeepSeek V4 Flash (OpenRouter) OpenAI-compatible API · deepseek-v4-flash:nitro
 4. MiniMax (SambaNova)           OpenAI-compatible API · MiniMax-M2.5
```

**`/model`** — switches the model **within the current provider**. It only shows models from the active profile + hardcoded GPT/Sonnet/Opus options. Your custom models from other profiles are **not visible** here.

**In practice**: to switch from Kimi to GLM, use `/provider`, not `/model`. This is counterintuitive, but that's how the current architecture works (v0.10.0). We [filed an issue](https://github.com/Gitlawb/openclaude/issues/1119) proposing to show all configured models in a single `/model` list.

**Where things live:**
- **Provider profiles** → `~/.openclaude.json` → `providerProfiles[]`
- **Subagent routing** → `~/.openclaude/settings.json` → `agentModels` + `agentRouting`
- **Startup profile** → `~/.openclaude/.openclaude-profile.json`

## Clother vs OpenClaude: when to use which

Both tools solve the multi-provider problem for Claude Code, but from different angles:

| | Clother | OpenClaude |
|---|---------|-----------|
| **Approach** | Per-command wrappers around official Claude Code | Standalone CLI with built-in provider support |
| **Config** | `~/.config/clother/config.json` + symlinks | `~/.openclaude/settings.json` — one file |
| **Adding a provider** | New symlink + key config | One JSON block |
| **Agent routing** | Manual (different terminal tabs) | Automatic via `agentRouting` |
| **Needs Claude Code** | Yes — it wraps the official binary | No — standalone replacement |
| **Provider-specific commands** | Yes (`clother-zai`, `clother-kimi`, …) | No — one `openclaude` command |
| **VS Code extension** | Via Claude Code's wrapper setting | Bundled extension |
| **Parallel providers** | Separate terminal tabs | Built-in routing in one session |

**Use Clother when** you want to keep the official Claude Code binary and just switch providers cleanly.

**Use OpenClaude when** you want one unified CLI that handles all providers natively, with automatic routing between models.

## Why this matters for cost optimisation

If you've read [How to Save Tokens in LLM](/blog/saving-tokens-llm), you know the strategy: use cheap models (Chinese APIs, local Ollama) for routine work, reserve expensive models for complex tasks.

With per-command wrappers, implementing this means juggling terminal tabs — and when one model hits its rate limit, you have to manually stop, switch to another `clother-*` command, and try to resume:
- Tab 1: `clother-zai --yolo` for bulk refactors → hits limit → manually restart with `clother-kimi`
- Tab 2: `clother-native` for design discussions
- Tab 3: `clother-ollama` for sensitive local work

With OpenClaude's agent routing, the same strategy is **one config block**. The CLI automatically sends planning to the smart GLM-5.1, routine coding to Kimi, and quick exploration to MiniMax (which pushes 200–400 TPS). No tab-juggling, no command-memorizing, no manual failovers.

### The tiered model strategy

The practical pattern that works well with Chinese model subscriptions:

| Tier | Model | TPS (subscription) | Use case | Why |
|------|-------|---------------------|----------|-----|
| **Smart** | GLM-5.1 | 10–20 | Planning, code review, architecture | Strong reasoning, good at complex tasks |
| **Workhorse** | Kimi (kimi-k2.5) | 20–60 | Routine coding, refactoring, tests | Reliable, good balance of speed and quality |
| **Fast** | MiniMax-M2.7 | 200–400 | Exploration, simple edits, lookups | Blazing inference speed, cheapest per token |

With Clother, this tiering means three separate commands and manual switching when limits hit. With OpenClaude, it's three entries in `agentRouting` — the CLI picks the right tier for each task automatically.

## What else is included

Beyond multi-provider support, OpenClaude brings:

- **Full tool suite** — bash, file read/write/edit, grep, glob, agents, tasks, MCP, slash commands
- **Streaming** — real-time token output and tool progress
- **Web search** — DuckDuckGo fallback for non-Anthropic models, Firecrawl integration for JS-heavy pages
- **gRPC server mode** — run OpenClaude headlessly for CI/CD or custom frontends
- **VS Code extension** — launch integration and theme support
- **Works on Android** — yes, really ([install guide](https://github.com/Gitlawb/openclaude/blob/main/ANDROID_INSTALL.md))

## Wrap-up

The evolution is clear:

1. **Shell aliases** — fragile, drift out of sync
2. **Clother** — clean per-command wrappers, zero config leakage
3. **OpenClaude** — all models in one config, automatic routing

Personally, I still use Anthropic's official CLI as my primary dev agent — it's simply better for actual coding work. But the config-based model routing in OpenClaude is a pattern worth knowing. If you manage multiple providers and are tired of juggling `clother-*` commands (especially when rate limits hit mid-session), this is the cleaner approach.

---

*Pair this with [Clother](/blog/clother-claude-wrappers) for the wrapper approach, and [How to Save Tokens in LLM](/blog/saving-tokens-llm) for the full cost-optimisation strategy.*
