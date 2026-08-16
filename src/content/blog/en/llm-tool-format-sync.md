---
title: "Tool-format translation between LLM providers"
description: "Tool calling looks similar across providers, but message shapes, streaming, reasoning state, and caching differ. A practical guide to what a translation proxy must preserve and when a higher-level integration is a better fit."
pubDate: 2026-07-13
heroImage: "/images/blog/llm-tool-format-sync-hero.png"
tags: ["llm", "claude-code", "tool-calling", "harness", "proxy", "kimi", "orchestration"]
draft: false
---

# Tool-format translation between LLM providers

Running one coding harness with another provider's model sounds like a small adapter problem. It often is not. The visible tool schema is only one part of a conversation protocol that also includes message order, call IDs, streamed arguments, caching hints, and sometimes provider-specific reasoning state.

You can either translate the harness's internal protocol, or use a harness that already supports the provider you need. Both are valid choices. The right one depends on how much behavior you need to preserve.

## Where the protocols differ

Anthropic Messages uses `tool_use` and `tool_result` blocks in message content. OpenAI Chat Completions places calls in a `tool_calls` array and returns tool results as messages with the `tool` role. The OpenAI Responses API has another shape: `function_call` items are correlated through `call_id`.

Arguments differ too. Anthropic carries a parsed object in `tool_use.input`; OpenAI function arguments are commonly JSON strings. A proxy needs to handle empty arguments, malformed JSON, and the identity of every individual call. It also needs to translate tool-choice semantics and JSON Schema features only when the target API supports an equivalent behavior.

These differences are manageable in a non-streaming request. The difficult cases emerge across a complete agent loop.

## Streaming needs a state machine

In streaming mode, a tool call arrives in pieces. A gateway must collect the ID, name, argument fragments, and completion signal for each call before producing the target provider's event sequence. Mixed text and tool calls, parallel calls, retries, and interrupted streams make this more than a field rename.

Issue trackers for LiteLLM, Bifrost, Portkey, and other gateways contain examples of version-specific failures in this area. Treat those reports as test cases, not as proof that any gateway always fails. If a proxy is part of a coding workflow, test streamed tool calls with required arguments, multiple calls, text plus calls, and malformed histories before relying on it.

## Reasoning state and cache behavior

Some providers attach opaque fields to reasoning or thinking blocks. Their preservation rules vary by model and API version. A one-to-one conversion from an Anthropic conversation to an OpenAI Chat Completions history may not preserve all of that state, even if ordinary tool calls translate correctly.

Caching has a similar constraint. Anthropic exposes explicit cache controls, while other APIs may use implicit caching or different controls. A translator should report what it can preserve and what it drops. Do not assume that a lower token price survives a change in cache-hit behavior.

## Choosing an integration boundary

LiteLLM, Bifrost, Portkey, claude-code-router, and similar projects are useful when you need protocol translation, routing, failover, or centralized accounting. Their capabilities change quickly, so check each project's current documentation and test the exact provider, model, and feature combination you plan to use.

Provider compatibility endpoints can reduce translation work for a particular provider, but they are still provider-specific contracts. Verify the current documentation, supported features, and operational terms before pointing a coding harness at one.

Another option is to orchestrate harness processes at a higher boundary. Claude Code, OpenCode, Codex, and other tools can each manage their own provider protocol. A parent system can pass tasks through supported CLI or API interfaces, collect structured results, and route work without rewriting internal tool calls. This reduces direct protocol translation, but it does not remove the need for permissions, state management, evaluation, and recovery.

## MCP is related, not a solution

MCP helps clients discover and transport tools. A harness still converts an MCP tool into the native tool definition expected by its model provider, and the model still emits provider-native calls. MCP therefore does not remove the schema and streaming differences described above.

The practical rule is simple. Translate only the boundary you can test end to end. If preserving another harness's internal behavior is essential, use its native provider path where possible. If model choice and routing are the main requirement, a higher-level orchestration layer may be easier to operate than a permanent wire-protocol bridge.

Useful references: [Anthropic extended thinking](https://platform.claude.com/docs/en/build-with-claude/extended-thinking), [LiteLLM message sanitization](https://docs.litellm.ai/docs/completion/message_sanitization), [Vercel AI SDK tools](https://ai-sdk.dev/docs/foundations/tools), and [MCP](https://modelcontextprotocol.io).

---

Come talk model infrastructure with me: [X](https://x.com/suenot), [Discord](https://discord.com/invite/2PtuMAg), [Telegram](https://t.me/suenot_dev).
