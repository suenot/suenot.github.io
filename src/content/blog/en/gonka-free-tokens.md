---
title: "Gonka Gives $10 Free, No Card: Billions of Kimi K2.6 Tokens for AI Startups"
description: "GonkaGate hands out $10 of free balance with no card and no crypto top-ups. At ~$0.000334 per 1M tokens, that's enough for billions of Kimi K2.6 tokens — fuel for AI startups that burn through tokens. Inside: TPS tests and step-by-step setup for opencode and Hermes Agent."
pubDate: 2026-06-23
heroImage: "/images/blog/gonka-hero.png"
tags: ["gonka", "llm", "tokens", "kimi", "opencode", "hermes-agent"]
draft: false
---

# Gonka Gives $10 Free, No Card: Billions of Kimi K2.6 Tokens for AI Startups

A quick rundown for anyone burning tokens by the bucket: [Gonka](https://gonka.ai) is a decentralized compute network, and [GonkaGate](https://gonkagate.com/en) is an OpenAI-compatible gateway on top of it with billing in dollars. And it **hands you $10 of free balance right at signup — no card and no crypto top-ups**. You don't need a wallet, GNK tokens, or a single cent upfront to start sending requests.

## Why this matters

It's not about the $10 itself, but about **how many tokens** fit into it.

The price for `moonshotai/kimi-k2.6` on GonkaGate is around **$0.000334 per 1M tokens** (~$0.000304 network cost + ~$0.000030 gateway fee). That's orders of magnitude cheaper than typical cloud rates. At that price, $10 is **billions of tokens**. In practice, even that $10 covers roughly **2.6 billion context tokens** of Kimi K2.6.

That's no longer "just playing around" — it's real fuel. With the free $10 you can:

- run bulk processing (classification, labeling, summarizing thousands of documents);
- keep background agents running that chew through context in bulk;
- **build an AI startup prototype**, where token economics usually kills the idea at the starting line.

You can top up the account in **USDT** if you want — but you don't need to for the start; the $10 is there right away.

## Speed

I benchmarked `moonshotai/kimi-k2.6` through the gateway: end-to-end generation speed of **about 60 tok/s**. For a decentralized network at this price, those are more than workable numbers.

## Get a key

1. Sign up at **[gonkagate.com/en/pricing](https://gonkagate.com/en/pricing)** — the $10 lands in your balance automatically.
2. Create an API key. It starts with `gp-...` and is **shown only once** — save it right away.
3. API base: `https://api.gonkagate.com/v1`, authorization `Authorization: Bearer gp-...`. The gateway is OpenAI-compatible: swap the base URL, key, and model id, and any OpenAI SDK works as is.

Quick smoke test (to confirm the key is live):

```bash
curl https://api.gonkagate.com/v1/chat/completions \
  -H "Authorization: Bearer $GONKAGATE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "moonshotai/kimi-k2.6",
    "messages": [{"role": "user", "content": "Reply with exactly: GonkaGate ok"}]
  }'
```

## Setup for opencode

[opencode](https://opencode.ai) is a terminal AI agent. It connects to GonkaGate as a custom provider.

### Option A — official installer (easiest)

```bash
npx @gonkagate/opencode-setup
```

Non-interactive (for scripts/CI):

```bash
GONKAGATE_API_KEY=gp-... npx @gonkagate/opencode-setup --scope project --yes
```

### Option B — by hand

1. Start opencode, run `/connect`, choose `Other`, and enter:
   - Provider id: `gonkagate`
   - API key: your `gp-...`
2. Add the provider to `~/.config/opencode/opencode.json`:

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

3. Check:

```bash
opencode debug config --pure
```

Then run `/models` in opencode — the `GonkaGate` provider and the `Kimi K2.6` model should show up in the list. You can always pull the current model list from `GET /v1/models`.

## Setup for Hermes Agent

[Hermes Agent](https://github.com/nousresearch/hermes-agent) from Nous Research is a terminal agent that works with any model provider and remembers context across sessions. It also hooks up to GonkaGate in one step.

**Requirements:** Hermes Agent `v2026.5.16` / `v0.14.0`+ in `PATH`, Node.js ≥ `22.14.0`, a `gp-...` key, an interactive terminal (TTY), Linux/macOS/WSL2.

### Option A — official installer

```bash
npx @gonkagate/hermes-agent-setup
```

Under a separate profile:

```bash
npx @gonkagate/hermes-agent-setup --profile work
```

### Option B — by hand

The installer edits two files; you can write the same thing manually.

`~/.hermes/config.yaml`:

```yaml
model:
  provider: custom
  base_url: https://api.gonkagate.com/v1
  default: moonshotai/kimi-k2.6
```

`~/.hermes/.env`:

```
OPENAI_API_KEY=gp-...
```

Run and check:

```bash
hermes
# then prompt: Reply with exactly: Hermes Agent connected to GonkaGate
```

## Pitfalls

- **RE2 regexes in tool schemas.** The Kimi backend on Gonka uses Go RE2 — it doesn't understand lookahead. If an MCP tool's JSON schema has a `pattern` with `(?!` or `(?=`, the request fails: `400 ... schema pattern is not a valid regular expression`. The fix is to remove such patterns from the tool's schema.
- **Other models.** Besides `moonshotai/kimi-k2.6`, there's Qwen3 235B, MiniMax M2.7, and more — the current list is at `GET /v1/models`. Ids are case-sensitive, so copy them exactly.
