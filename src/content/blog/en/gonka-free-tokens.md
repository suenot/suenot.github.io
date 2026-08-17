---
title: "Using GonkaGate as an OpenAI-compatible model provider"
description: "A practical guide to connecting an OpenAI-compatible GonkaGate endpoint to command-line agents. How to create and protect an API key, test the endpoint, configure a custom provider, and verify models and costs before a workload."
pubDate: 2026-06-23
heroImage: "/images/blog/gonka-hero.png"
tags: ["gonka", "llm", "tokens", "kimi", "opencode", "hermes-agent"]
draft: false
---

# Using GonkaGate as an OpenAI-compatible model provider

[GonkaGate](https://gonkagate.com/en) exposes an OpenAI-compatible API for models available through the Gonka network. That makes it possible to use the endpoint with tools that can speak the OpenAI API shape, including command-line agents with custom-provider support.

Pricing, sign-up credits, model availability, and rate limits change. Check the current [GonkaGate pricing page](https://gonkagate.com/en/pricing), account balance, and model list before planning a workload around them.

## Create a key and test the endpoint

Create an API key in the provider dashboard and store it in an environment variable or secret manager. Do not place it in a repository, shell history, or a prompt.

The endpoint uses a bearer token and an OpenAI-style chat-completions request:

```bash
curl https://api.gonkagate.com/v1/chat/completions \
  -H "Authorization: Bearer $GONKAGATE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "YOUR_CURRENT_MODEL_ID",
    "messages": [{"role": "user", "content": "Reply with exactly: GonkaGate ok"}]
  }'
```

Replace `YOUR_CURRENT_MODEL_ID` with a model ID currently returned by `GET /v1/models`. Do not rely on a model name from an old configuration, and record the model and timestamp when benchmarking latency, throughput, or quality.

## Configure a command-line agent

OpenCode can use an OpenAI-compatible custom provider. The exact configuration format may change with OpenCode releases, but the important values are the provider name, base URL, API key, and model ID. A representative configuration looks like this:

```json
{
  "provider": {
    "gonkagate": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "GonkaGate",
      "options": { "baseURL": "https://api.gonkagate.com/v1" }
    }
  }
}
```

Use the provider's setup instructions when available, then inspect the resulting configuration and run the agent's own configuration diagnostic. Test a small task before assigning a long-running coding or batch workload.

Other agents that accept a custom OpenAI-compatible base URL can use the same endpoint pattern. Keep credentials outside configuration files when their tooling supports environment variables or a secret store.

## Tool schemas and operational checks

An API-compatible endpoint does not make every tool schema portable. A model backend may support a narrower JSON Schema or regular-expression dialect than the client that created the schema. If a tool request fails validation, reduce the schema to the supported subset and test it independently before blaming the agent.

Track request errors, retries, token use, latency, and output quality on representative work. Low advertised prices do not by themselves determine total cost, particularly when failures, long contexts, or repeated calls are involved.

The useful workflow is straightforward: confirm the current model list and terms, keep the key out of source control, make a small API request, then validate the agent configuration on a real task. Treat provider selection as an operational choice that needs monitoring, not as a one-time price comparison.
