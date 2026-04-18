---
title: "Clother: clean wrappers around Claude Code without touching your global settings"
description: "How to use jolehuit/clother to switch Claude Code between Z.AI, Kimi, MiniMax, OpenRouter, Alibaba, Ollama, LM Studio and custom providers via clother-* commands — without rewriting ~/.claude or global env vars."
pubDate: 2026-04-19
tags: ["claude-code", "clother", "llm", "providers", "tooling"]
draft: false
---

# Clother: clean wrappers around Claude Code without touching your global settings

Claude Code is excellent — but the moment you want to run it against something other than Anthropic's own endpoint, the experience falls apart. You start patching `ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_TOKEN`, juggling shell scripts per provider, and slowly turning your `~/.claude` and your shell rc into a graveyard of half-working aliases.

[Clother](https://github.com/jolehuit/clother) by [@jolehuit](https://github.com/jolehuit) solves exactly this problem. It's a tiny Go binary that gives you a family of `clother-*` launcher commands, one per provider. You install it once, and from then on switching between Claude (subscription), Z.AI GLM-5, Kimi, MiniMax, DeepSeek, Alibaba Coding Plan, OpenRouter, Ollama, LM Studio, llama.cpp or your own custom endpoint is literally a different command name.

Crucially, **your Claude Code installation stays completely untouched**. No edits to `~/.claude/settings.json`, no permanent env-var pollution, no risk of accidentally sending your work session to the wrong provider tomorrow morning.

If you've already read [How to Save Tokens in LLM](/blog/saving-tokens-llm), Clother is exactly the kind of practical "wrapper" that makes those provider-switching ideas usable day to day — this post is the deep dive.

## 1. The problem Clother fixes

When you want to use Claude Code with a non-Anthropic backend, you typically need:

1. A **base URL** (`ANTHROPIC_BASE_URL`) — different per provider, often per region
2. An **auth token** (`ANTHROPIC_AUTH_TOKEN`) — a different secret per provider
3. A **model name** — different naming schemes (`glm-5`, `kimi-k2.5`, `MiniMax-M2.5`, …)
4. Sometimes specific **flags** Claude Code expects to behave correctly with that backend

Most people end up with one of three bad solutions:

- **Edit shell rc files.** Now every shell session is locked to one provider until you remember to unset everything.
- **Maintain a folder of `.sh` launchers.** They drift out of sync, paths break, and you forget which one points where.
- **Edit `~/.claude/settings.json` per provider.** This is the worst option — your editor extension, your other terminals and your background sessions all silently start using the wrong endpoint.

Clother takes the third path off the table entirely: it never edits your Claude config. Instead it sets the right env vars **only for the lifetime of one process** and then `exec`s the real `claude` binary.

## 2. What Clother actually is

Under the hood Clother is one Go binary plus a bunch of symlinks named `clother-<provider>`. The binary inspects its own invocation name (`argv[0]`), looks up the corresponding profile, loads secrets from `~/.local/share/clother/secrets.env` (chmod 600), exports the right env vars, and then `exec`s the real `claude` binary that lives outside the Clother bin directory.

The whole thing for `clother-zai` is morally equivalent to:

```bash
export ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"
export ANTHROPIC_AUTH_TOKEN="$ZAI_API_KEY"
exec /path/to/the/real/claude "$@"
```

Three consequences fall out of this design:

- **Zero state leakage.** Once the Claude process exits, the env vars are gone with it.
- **Multiple providers in parallel.** Open four terminal tabs, run `clother-native`, `clother-kimi`, `clother-zai` and `clother-or stepfun` simultaneously. They don't see each other.
- **`claude --resume` keeps working** across providers, because Clother also installs a `claude` shim that knows how to dispatch resumes back to the right provider profile.

## 3. Installation

On macOS the cleanest path is Homebrew:

```bash
curl -fsSL https://claude.ai/install.sh | bash    # Claude Code itself
brew tap jolehuit/tap
brew install clother
```

On Linux (or macOS without Homebrew):

```bash
curl -fsSL https://claude.ai/install.sh | bash
curl -fsSL https://raw.githubusercontent.com/jolehuit/clother/main/scripts/install.sh | bash
```

The installer drops `clother` plus all the `clother-*` symlinks into the same bin directory as your existing `claude` binary (or `~/bin` / `~/.local/bin` as a fallback). Run `clother status` if you want to see exactly where things landed and whether that directory is on your `PATH`.

Updating is one command:

```bash
clother update
```

## 4. Daily driving it

The everyday loop is just: pick a launcher.

```bash
clother-native                       # Anthropic, your Claude Pro/Max/Team subscription
clother-zai                          # Z.AI GLM-5
clother-kimi                         # Kimi (kimi-k2.5)
clother-minimax                      # MiniMax-M2.7
clother-deepseek                     # DeepSeek
clother-alibaba                      # Alibaba Coding Plan (qwen3.5-plus by default)
clother-ollama --model qwen3-coder   # Local Ollama
clother-or stepfun                   # OpenRouter alias
clother-custom sambanova --yolo      # Custom provider
```

A few flags worth memorizing:

- `--yolo` — Clother shorthand for `--dangerously-skip-permissions`. Very useful for batch subagents, dangerous everywhere else.
- `--model <name>` — passed straight through to Claude. Lets you override the default model for one launch (`clother-zai --model glm-4.7`).
- `clother config <provider>` — set / change the API key and default model for a profile.
- `clother info <provider>` — see exactly which base URL, model and token env var will be used. Use this every time you're confused about why a launcher isn't doing what you expect.
- `clother test` — connectivity check before you waste an hour debugging "is it me or the provider?".

For OpenRouter the practical convention is `clother-or <alias>`. You define the alias once (mapping it to the real OpenRouter model id), then launch it by passing that alias to the OpenRouter entrypoint.

## 5. Customising via `~/.config/clother/config.json`

This is where Clother actually shines for power users. Most of the interesting behaviour lives in a single JSON file. Here's a real-world example:

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
    "omni-local": {
      "name": "omni-local",
      "display_name": "omni-local",
      "base_url": "http://localhost:20128",
      "api_key_env": "OMNIROUTE_API_KEY",
      "default_model": "ollama/qwen3-coder",
      "api_type": "openai"
    },
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

Three independent mechanisms are visible here, each worth understanding:

**`provider_overrides`** — patches a built-in profile. The Z.AI launcher ships with `glm-5` as default; this config bumps it to `glm-5.1`, so `clother-zai` uses GLM-5.1 every time without anyone having to remember the `--model` flag.

**`openrouter_aliases`** — short, ergonomic names for the verbose OpenRouter model ids. After this config, you can call them as `clother-or kimi25`, `clother-or minimax27`, `clother-or qwen36`, `clother-or stepfun`. The `:nitro` suffix routes traffic through OpenRouter's faster providers; `:exacto` is another good variant when tool calling is flaky.

**`custom_providers`** — register entirely new providers. The example above defines two:

- `omni-local` — a *local* OmniRoute gateway at `localhost:20128`, defaulting to an Ollama-backed `qwen3-coder`. This is the killer pattern: Claude Code talks to one stable local endpoint, while OmniRoute decides whether the actual backend is Ollama, llama.cpp, vLLM, OpenRouter, Gemini, or anything else you've connected behind it.
- `sambanova` — another OpenAI-compatible cloud, this time pointing the launcher at MiniMax-M2.5 by default. I picked it in this config because for this model it can deliver around `400 TPS`, which makes it attractive for high-throughput coding sessions and batch agent work.

These custom entries do **not** create separate `clother-<name>` launchers. You run them through the generic custom-provider entrypoint instead, for example `clother-custom sambanova --yolo` or `clother-custom omni-local --yolo`. That still gives you the same practical benefit: Claude Code talks to the provider you named for that one launch, while every other terminal continues using whatever it was using before.

### Bonus: OmniRoute as a universal Anthropic-compatible API for anything

That `localhost:20128` URL in the `omni-local` example above is not a coincidence — it's the default port of [OmniRoute](https://github.com/diegosouzapw/OmniRoute), an open-source AI gateway. This combo (Clother → OmniRoute → anything) is genuinely powerful and worth its own subsection.

OmniRoute is a single TypeScript service that exposes one process speaking **multiple API dialects at the same time**:

| Path | Format |
|------|--------|
| `POST /v1/messages` | **Anthropic** |
| `POST /v1/chat/completions` | OpenAI |
| `POST /v1/responses` | OpenAI Responses |
| `POST /v1beta/models/{...}` | Gemini |
| `POST /v1/api/chat` | Ollama |
| `POST /v1/embeddings`, `/v1/images/generations`, `/v1/audio/transcriptions` | OpenAI |

The interesting one for our story is `/v1/messages` — that's the native Anthropic Messages API. Which means **OmniRoute itself looks like an Anthropic-compatible provider**. Behind that single endpoint it can fan out to 67+ upstream providers (OpenAI, Gemini, Mistral, DeepSeek, Together, Fireworks, OpenRouter, Ollama, vLLM, llama.cpp, anything OAuth-compatible…), with smart routing, fallbacks, retries, caching, rate limits and per-key budgets baked in.

Putting Clother and OmniRoute together gives you a clean two-layer architecture:

```
Claude Code  →  Clother (env-var switch)  →  OmniRoute (protocol translation)  →  any LLM
```

Spin up OmniRoute locally:

```bash
npm install -g omniroute && omniroute
# or
docker run -d -p 20128:20128 -v omniroute-data:/app/data \
  diegosouzapw/omniroute:latest
```

Then teach Clother about it as a custom provider:

```json
{
  "custom_providers": {
    "omni-local": {
      "name": "omni-local",
      "display_name": "OmniRoute (local)",
      "base_url": "http://localhost:20128",
      "api_key_env": "OMNIROUTE_API_KEY",
      "default_model": "cc/claude-opus-4-6",
      "api_type": "openai"
    }
  }
}
```

Now `clother-custom omni-local --yolo` launches Claude Code, points it at your local OmniRoute, and OmniRoute decides which actual upstream provider serves the request based on the model name (`cc/claude-opus-4-6`, `openai/gpt-...`, `gemini/...`, `ollama/...`, etc.) and any routing combos you've configured in its dashboard.

That combo layer is especially important. In OmniRoute you can create a **combo** with a custom model name, and behind that name put several real upstream models with availability-aware routing and failover rules. For Claude Code this still looks like just one normal model id. In other words, Claude Code might think it's calling something like `my-fast-coding-stack`, while OmniRoute is actually deciding in real time whether that request should go to Claude, GLM, Gemini, OpenRouter, or a local model depending on which one is currently available.

Why this matters in practice:

- **Anything-to-Anthropic adapter.** Providers that don't ship an Anthropic-compatible endpoint (raw OpenAI, Gemini, Ollama, vLLM, sglang, your own model gateway) suddenly become usable from Claude Code with zero code on your side.
- **One place for keys, budgets and observability.** Clother handles env vars per-launch; OmniRoute handles upstream credentials, per-key budgets, request logs and latency telemetry per provider. They don't overlap.
- **Failover and combos for free.** OmniRoute's combos let you define one custom model name for Claude Code, and behind it say "try Claude Opus first, fall back to GLM-5.1, then to local Qwen." Clother gets one stable URL and Claude Code sees one stable model id; only OmniRoute knows the real routing tree.
- **Local-first option.** Both pieces run on your machine. The actual LLM can be local too (Ollama / llama.cpp / vLLM behind OmniRoute), so you get Claude Code's UX with a fully offline backend.

This is the most general pattern in the whole post. If you're going to set up Clother for one thing, set it up for `clother-custom omni-local --yolo` — and after that any future provider is just "add it in OmniRoute's dashboard" instead of "edit your shell config".

## 6. Ready-made provider menu

For reference, the launchers that ship out of the box (paraphrased from the upstream README):

| Tier | Examples |
|------|----------|
| Cloud | `clother-native`, `clother-zai`, `clother-kimi`, `clother-moonshot`, `clother-minimax`, `clother-deepseek`, `clother-mimo`, `clother-alibaba`, `clother-alibaba-us` |
| China endpoints | `clother-zai-cn`, `clother-minimax-cn`, `clother-ve` (Volcengine), `clother-alibaba-cn` |
| Local | `clother-ollama`, `clother-lmstudio`, `clother-llamacpp` |
| OpenRouter | `clother-or <your-alias>` (100+ models, you pick which to expose) |
| Custom | `clother-custom <your-alias>` for anything you define under `custom_providers` |

The Alibaba Coding Plan family is interesting in its own right because a single API key gives you access to a rotating menu of models — `qwen3.5-plus`, `kimi-k2.5`, `glm-5`, `MiniMax-M2.5`, `qwen3-coder-next`, `qwen3-coder-plus`, `qwen3-max-2026-01-23`, `glm-4.7` — switchable with `--model`.

## 7. Resume and VS Code

Two integration details that matter in real workflows:

**Resume.** Claude Code prints a `claude --resume <id>` command at the end of each session. Clother installs a `claude` shim that intercepts those resumes and routes them back to the original provider, so a session started with `clother-kimi` resumes against Kimi, not against your Anthropic subscription. When you intentionally resume a non-Claude session into native Claude, Clother sanitises the incompatible thinking blocks for that one launch and restores the file afterwards.

**VS Code.** The official Claude Code extension (2.6+) has a `Claude Process Wrapper` setting. Point it at the absolute path of the launcher you want, e.g. `/Users/you/bin/clother-zai`, reload, and the extension now uses that provider. Multiple workspaces with different wrapper paths gives you per-project provider isolation.

## 8. When Clother is the right tool — and when it isn't

Use Clother when:

- You want to **try** non-Anthropic backends without committing your global setup to them.
- You run **bulk subagent jobs** on cheap providers (`clother-zai --yolo`, Alibaba Coding Plan, local Ollama for refactors) while keeping your interactive sessions on Anthropic.
- You need **per-terminal provider isolation**, e.g. one window pinned to local llama.cpp for sensitive code, another on a frontier model for design discussions.
- You want a **clean uninstall path**. `clother uninstall` removes everything, your Claude Code stays exactly as it was.

Don't reach for Clother when:

- You only ever use Anthropic's endpoint. There's nothing to gain.
- You need provider features Claude Code itself doesn't support (e.g. provider-specific structured outputs). Clother only translates env-vars; it can't add capabilities the Anthropic-compatible API doesn't expose.
- You expect identical behaviour across providers. You won't get it. Tool calling, system prompt handling and reasoning blocks differ — that's a property of the models, not of Clother.

## 9. Practical tips

A few things worth knowing before they bite you:

- Run `clother info <provider>` after any config change. Resolved model + base URL is the single source of truth.
- Keep API keys in your shell init or a secret manager that exports env vars. The custom-provider `api_key_env` field is a pointer, not the value.
- For local backends, start the server **before** the launcher — `clother-llamacpp` won't wait for `llama-server` to come up.
- `--yolo` is fine for batch jobs in throwaway workspaces. It is not fine for your main repo.
- If a previously working launcher suddenly stops responding to flags like `--yolo`, you've probably installed a new Claude Code version since the last `clother install`. Re-run `clother install` to refresh the symlinks.

## 10. Wrap-up

Clother is one of those tools that does a small thing well: it lets you keep Claude Code as your one stable interface and treat the underlying provider as a runtime decision. No global config drift, no per-provider forks of your setup, no scary blast radius if you're experimenting.

If you're already optimising for cost (Chinese subscriptions, OpenRouter aliases, local models for the boring work), pair this post with [How to Save Tokens in LLM](/blog/saving-tokens-llm) — Clother is the connective tissue that makes those optimisations practical day-to-day.
