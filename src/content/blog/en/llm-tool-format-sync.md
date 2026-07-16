---
title: "Teaching Kimi to Speak Claude Code: A Field Guide to Tool-Format Translation"
description: "Every utility that translates tool-calling formats between LLM providers — LiteLLM, Bifrost, Portkey, claude-code-router, Vercel AI SDK, first-party /anthropic endpoints — what each one actually does, and the three failure classes none of them have solved. Plus the conclusion I arrived at: stop adapting context downward to each model, and build a harness that orchestrates harnesses instead."
pubDate: 2026-07-13
heroImage: "/images/blog/llm-tool-format-sync-hero.png"
tags: ["llm", "claude-code", "tool-calling", "harness", "proxy", "kimi", "orchestration"]
draft: false
---

# Teaching Kimi to Speak Claude Code: A Field Guide to Tool-Format Translation

You want to run Claude Code's harness — the subagents, the skills, the hooks, the whole scaffolding you spent months tuning — but drive it with Kimi K2.5, or GLM, or DeepSeek, because the flagship bill hurts. Two ways to get there, and both run into the same wall:

1. **Feed Claude Code's tools to the other model.** Its tool definitions go into the first request, and every tool call has to come back in the shape Claude Code expects. That means somebody has to translate the wire format.
2. **Use a third-party harness** (OpenCode, Cline, Goose, Crush) that already speaks every provider. Then you inherit *their* harness, not yours.

This article is about the layer that makes option 1 possible — the tool-format translators — and about why, after mapping the whole landscape, I think the right answer is neither.

## 1. Why translation is not a field rename

The naive mental model is: Anthropic calls it `input_schema`, OpenAI calls it `parameters`, write a mapper, done. That part *is* trivial. Here's the actual delta.

**Tool definitions:**

| | Anthropic Messages | OpenAI Chat Completions | OpenAI Responses |
| --- | --- | --- | --- |
| Shape | flat: `{name, description, input_schema}` | nested: `{type:"function", function:{name, description, parameters}}` | flat: `{type:"function", name, parameters}` |
| Anthropic-only extras | `cache_control`, `input_examples`, `defer_loading` | — | — |

Note the trap already: OpenAI's own **Responses API is flat**, closer to Anthropic than to OpenAI Chat Completions. A translator that hardcodes "OpenAI means nested `function{}`" is wrong on half of OpenAI.

**Turn structure — this is the big one:**

- **Anthropic**: tool calls are `tool_use` **content blocks inside the assistant message**, interleaved with `text` and `thinking` blocks. Results come back as `tool_result` blocks in a message with **`role: "user"`**.
- **OpenAI CC**: tool calls are a `tool_calls[]` array **on** the assistant message. Results are separate messages with **`role: "tool"`**.
- **OpenAI Responses**: neither — standalone `function_call` items correlated by `call_id`, which is a *different field* from the item's own `id`.

Consequences a proxy has to handle: Anthropic allows text *and* a tool call in the same assistant turn (naive converters split them into two messages and produce invalid history); **every `tool_use` must have a matching `tool_result` or the API 400s** — "orphaned tool calls" is the single most common sanitization job, and LiteLLM ships [a dedicated feature](https://docs.litellm.ai/docs/completion/message_sanitization) just for it.

**Arguments encoding:** Anthropic's `tool_use.input` is a **parsed object**. OpenAI's `function.arguments` is a **JSON-encoded string**. Zero-argument calls emit `""` where the consumer expects `{}`, and `JSON.parse` throws — a live bug in the Vercel AI SDK ([#10295](https://github.com/vercel/ai/issues/10295)).

**`tool_choice`:** Anthropic's `any` is OpenAI's `required`; `disable_parallel_tool_use` lives *inside* `tool_choice` for Anthropic but is a *top-level* `parallel_tool_calls` for OpenAI. Changing `tool_choice` also invalidates your cached message blocks.

**JSON Schema portability:** no major provider accepts a top-level `$ref` — you must inline. Gemini rejects `items: {}`. OpenAI's strict mode accepts `pattern`/`minimum`/`format` but **doesn't enforce them**. And in Responses, *omitting* `strict` attempts strict mode anyway and silently degrades — so a proxy that merely forwards tool definitions has changed the semantics without telling you.

All of the above is mechanical. Annoying, but solvable. The next section is not.

## 2. The three things nobody has solved

Every gateway I looked at breaks in the same three places.

### 2.1 Streaming reassembly

Non-streaming translation is a solved problem. **Claude Code always streams.**

- **Anthropic SSE**: `content_block_start` (type `tool_use`, carrying `id` + `name`) → N× `content_block_delta` with `{"type":"input_json_delta","partial_json":"…"}` → `content_block_stop` → `message_delta` with `stop_reason:"tool_use"`.
- **OpenAI SSE**: `delta.tool_calls[]` fragments keyed by an **`index`** field; `id`/`name` appear once, arguments arrive as string fragments; ends with `finish_reason:"tool_calls"`.

Turning one into the other requires per-`index` state machines held across chunks, and this is where everything falls over. LiteLLM has emitted `content_block_start` + `content_block_stop` with **zero `input_json_delta` in between** — every tool call arrives with `input: {}` and Claude Code reports missing required params ([#25561](https://github.com/BerriAI/litellm/issues/25561), #25321, #25390). Bifrost sends `stop_reason: "end_turn"` instead of `"tool_use"` on mixed text+tool turns, so the client thinks the assistant is done ([#3638](https://github.com/maximhq/bifrost/issues/3638)). Portkey drops the `assistant` role from streaming deltas ([#1000](https://github.com/Portkey-AI/gateway/issues/1000)). Roo Code kept two static state maps across chunks purely to paper over cross-provider streaming inconsistency.

### 2.2 Reasoning state is opaque and mandatory

This is the deepest structural reason a Claude-Code-plus-foreign-model setup is lossy.

Anthropic's [extended thinking docs](https://platform.claude.com/docs/en/build-with-claude/extended-thinking) are explicit: when you post a `tool_result`, the `thinking` blocks on the last assistant message **must be echoed back complete and unmodified**, or you get `400: "thinking or redacted_thinking blocks in the latest assistant message cannot be modified"`. The named root cause in Anthropic's own docs is *"application code that filters content blocks by type"* — which is precisely what a format translator is.

And the `signature` on a thinking block is an **encrypted representation of the reasoning**, which the server decrypts to reconstruct state. **There is no OpenAI wire field to carry it.** A round-trip through Chat Completions destroys it. That's why LiteLLM #15601, vercel/ai #11602, and claude-code-router #1400/#1410 all exist as separate open bugs against separate codebases: they are the same bug.

Every provider has its own version and none of them interoperate — Anthropic's `signature`, OpenAI's `reasoning.encrypted_content` (which, in streaming, is **absent from `output_item.added` and only appears on `output_item.done`** — converters that read only the first event silently drop it), Gemini's `thought_signature` on `functionCall` parts. Also worth knowing: **`tool_choice: any` and `tool_choice: tool` are hard errors with extended thinking** — only `auto`/`none` — which breaks forced-tool structured output entirely.

### 2.3 Prompt caching evaporates

`cache_control` is Anthropic-only. OpenAI's caching is implicit, so there is nothing to map it to. **Every Anthropic→OpenAI translation silently discards your prompt caching** — the single biggest lever in the [token-saving guide](/blog/saving-tokens-llm). You save on the per-token price and pay it back in cache misses, and nothing in the logs tells you.

DeepSeek is the only vendor that says this out loud: their [Anthropic compat docs](https://api-docs.deepseek.com/guides/anthropic_api) list `cache_control` under *not supported*, right next to images, documents, and MCP integrations. Respect for that.

## 3. The translators

### LiteLLM — Python, ~53k ★, proxy + library

[LiteLLM](https://github.com/BerriAI/litellm) is the default answer, and it has two Anthropic surfaces people constantly confuse. `POST /anthropic/*` is **pass-through** — no translation, it just forwards to Anthropic and adds cost tracking. `POST /v1/messages` ([`anthropic_messages`](https://docs.litellm.ai/docs/anthropic_unified/)) is the **real translation**: Anthropic format in, any provider out. Claude Code is [documented first-class](https://docs.litellm.ai/docs/tutorials/claude_non_anthropic_models) — point `ANTHROPIC_BASE_URL` at it and set `CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY=1`.

It's the most complete and the most battle-tested, and it is also where most of the streaming bugs in §2.1 were filed — not because it's worse, but because it's what everyone runs. It's Python, it's heavy, and its logging is chatty enough to be its own problem.

### Bifrost — Go, ~6.5k ★, Apache-2.0, gateway

[Bifrost](https://github.com/maximhq/bifrost) is the one I'd reach for if I wanted a single binary instead of a Python process. Drop-in prefixes (`/openai`, `/anthropic`, `/genai`), and [Claude Code is a first-class documented target](https://docs.getbifrost.ai/cli-agents/claude-code) with `ANTHROPIC_DEFAULT_SONNET_MODEL` / `..._HAIKU_MODEL` overrides. It documents its conversion steps honestly — system-message extraction, tool-message grouping, thinking-block transformation, `reasoning`→`thinking` with a 1024 minimum budget. It's also an MCP gateway.

Its "50× faster than LiteLLM, 11µs overhead" claim is vendor-published with no independent replication. Treat accordingly.

### Portkey AI Gateway — TypeScript, ~12k ★, gateway

[Portkey](https://github.com/Portkey-AI/gateway) has the cleanest concept: **three universal ingress formats** — `/v1/chat/completions`, `/v1/responses`, and `/v1/messages` — each of which works with *all* providers. Bidirectional by construction. But there's no first-party Claude Code tutorial, and the open issues are exactly the §2 failure classes (tool_use↔tool_result ID pairing broken on parallel calls, `tool_choice: none` rejected for Anthropic, missing roles in streaming deltas).

### claude-code-router — TypeScript, ~36k ★

Worth correcting a stale mental model here: [CCR](https://github.com/musistudio/claude-code-router) is no longer the small transformer proxy people remember. It's now a **monorepo at v3.0.11 shipping an Electron control panel plus a local model gateway**, and it drives Codex and ZCode too, with presets for OpenRouter, DeepSeek, Moonshot/Kimi, Z.AI, MiniMax, SiliconFlow. The transformer layer lives on as a separate, much smaller library, [musistudio/llms](https://github.com/musistudio/llms), with a four-hook interface (`transformRequestIn/Out`, `transformResponseIn/Out`).

Read its issue tracker and the pattern from §2.2 jumps out: the open bugs cluster on **reasoning × tool calls**, not on plain tool calls. Streaming reasoning corrupting tool-argument deltas, Kimi's `reasoning_content` not preserved across tool-call history, Gemini's missing `thought_signature`, DeepSeek thinking+tools 400s. Plain tool calling works. Thinking plus tool calling is where it bleeds.

### Vercel AI SDK — TypeScript, ~25k ★, **library, not a gateway**

[The AI SDK](https://ai-sdk.dev/docs/foundations/tools) normalizes in-process via per-provider adapters. `tool({description, inputSchema, execute})`, Zod or raw JSON Schema. It fits a Bun/TS stack beautifully, but it is a **library** — you can't put it in front of Claude Code without building a proxy around it first.

The most telling detail in the whole SDK is `experimental_refineToolInput`, which exists — per the docs — because "different LLM providers generate slightly different tool inputs" (`null` vs `""`). An escape hatch shipped as an official admission that the normalization is lossy.

## 4. The proxy category is dying, and that's good news

Here's the finding I didn't expect. Of the four best-known community Anthropic-compat proxies, **two archived in the last six months**: [y-router](https://github.com/luohy15/y-router) (archived January 2026, README now points at OpenRouter's official integration) and [anthropic-proxy](https://github.com/maxnowack/anthropic-proxy) (archived April 2026). What killed them is that **the providers shipped the endpoint themselves**:

| Provider | Anthropic-compatible base URL |
| --- | --- |
| Moonshot / Kimi | `https://api.moonshot.ai/anthropic` |
| Z.ai / Zhipu GLM | `https://api.z.ai/api/anthropic` |
| DeepSeek | `https://api.deepseek.com/anthropic` |
| MiniMax | `https://api.minimax.io/anthropic` |
| Qwen / DashScope | `https://dashscope-intl.aliyuncs.com/apps/anthropic` |
| OpenRouter | `https://openrouter.ai/api` (their "Anthropic skin") |

Which is exactly the list [Clother](/blog/clother-claude-wrappers) and [OpenClaude](/blog/openclaude-multi-provider) already switch between with an env var. **So for the common case — "I want Kimi to drive Claude Code" — you do not need a format translator at all.** The vendor runs one for you, server-side, for free. Set `ANTHROPIC_BASE_URL` and go.

Two caveats. Kimi's `/anthropic` endpoint is **widely used but vendor-undocumented** (there's [an open ask](https://github.com/MoonshotAI/Kimi-K2/issues/129) for docs). And **Cloudflare AI Gateway is the wrong tool here** — its `/anthropic` route is pass-through only; it caches and observes traffic *to* Anthropic, it does not translate away from it.

You reach for a real translator when you need something the vendor endpoint won't give you: **routing** (cheap model for Haiku-class subagents, flagship for the lead), failover across providers on rate-limit, one place for cost accounting across a fleet — the things §2 of the [token guide](/blog/saving-tokens-llm) is about.

## 5. The other route: harnesses that already normalize

If you don't want to translate for Claude Code, use a harness that never needed Claude's format:

| Harness | Lang | ★ | How it normalizes |
| --- | --- | --- | --- |
| **OpenCode** | TS/Bun | 185k | Vercel AI SDK + [models.dev](https://models.dev) registry |
| **Cline** | TS | 65k | own per-provider handlers |
| **Goose** | Rust | 51k | own `Provider` trait |
| **Crush** | Go | 27k | [fantasy](https://github.com/charmbracelet/fantasy) + catwalk registry |
| **Aider** | Python | 47k | LiteLLM — but ⚠️ stalled since May 2026 |
| **Roo Code** | TS | 24k | 🔴 **archived May 2026** |

Three things this table taught me:

1. **The XML-tool-calling era is over.** Cline v3.35 migrated from XML-in-the-system-prompt to native JSON tool calls; Roo removed XML entirely and now hard-rejects tool calls with no `id`. If you were planning to sidestep format translation by prompting the model to emit XML — that ship sailed, and the industry sailed it away on purpose.
2. **Goose's "toolshim" is the existence proof that this is all a shimmable layer.** For models with no native tool calling, Goose has the primary model emit loose JSON, then runs a **second, cheap interpreter model** (default `mistral-nemo` on Ollama) to coerce it into a valid tool call. It's experimental and it hangs, but conceptually it's the purest statement of the idea: tool format is a translation problem, and translation is a job you can hand to a small model.
3. **Aider is not a reference for any of this** — it deliberately avoids tool calling altogether and edits via SEARCH/REPLACE text blocks. Its failure mode is "block failed to match," not schema drift. Different universe.

And the reference implementation of the normalization layer, by language: **TS → Vercel AI SDK, Go → charmbracelet/fantasy, Python → LiteLLM, Rust → roll your own.**

## 6. Standards will not save you

**MCP does not solve this.** This is the most common misconception I hit. MCP is a *discovery and transport* layer: `tools/list` hands you JSON Schema, and then **the harness still has to convert each MCP tool into the provider's native tool definition**, and the model still emits provider-native tool calls. Every portability gotcha in §1 applies unchanged. MCP rides on top of the problem; it doesn't touch it.

MCP also has its own churn: the next spec revision lands **2026-07-28** and is the biggest since launch — the `initialize` handshake is **removed entirely**, `Mcp-Session-Id` is gone, HTTP+SSE transport is deprecated. Anything written against `2025-11-25` will need rework.

As for a universal tool-calling spec: **nothing is winning.** [UTCP](https://www.utcp.io) is real, active, and niche (~300★ on the spec) — and it ships an MCP compatibility plugin, which tells you who's winning. `agents.json` is dead (last push August 2025). IBM's ACP was absorbed into A2A. A2A itself is healthy but **orthogonal**: it's agent↔agent interop over opaque agents, not tool-schema normalization. De-facto standardization is happening the boring way — every vendor cloning the `/chat/completions` shape, and now the `/v1/messages` shape too.

## 7. The conclusion I actually reached: build *above* Claude, not *under* it

I spent a while trying to optimize Claude Code **from underneath** — intercept part of its work, swap the model beneath it, shave its context, translate its tools. And I think that's a dead end. Not because it can't be made to work, but because of what §2 says: streaming reassembly, opaque reasoning state, and vanished prompt caching are three failure classes that **no translation layer has solved, only mitigated**. You're not building a feature, you're signing up for permanent maintenance against three moving APIs. Optimizing under the harness is a research project — endless experiments, no instruction manual — and it produces a thing that breaks every time a provider ships a minor version.

The better move is the opposite direction: **build your own harness that sits above Claude Code, and treat Claude Code as one black-box agent among several.**

The unit you orchestrate stops being a *model* and becomes a *harness process*: Claude Code here, an OpenCode session there, a Codex run over there, each already fluent in its own provider's tool dialect, each managing its own context, its own caching, its own reasoning state. You talk to them through the interface they already expose to the outside world — a CLI, `--format json`, a session ID you can resume — not through their internal wire protocol.

What that buys you:

- **The format problem disappears.** You never translate a tool call, because you never touch the tool-call layer. Claude Code speaks Anthropic natively. OpenCode speaks whatever it wants. Each keeps its own cache, its own thinking blocks, its own streaming — the three things §2 says you cannot move across the wire. **The bugs in §2 are bugs about crossing a boundary. Don't cross it.**
- **You stop re-adapting context per model.** Adapting your context to Kimi's quirks, then to GLM's, then to DeepSeek's, is N× the work and it rots. Above the harness, context adaptation is *each harness's own job* — the thing it's already good at.
- **Model choice becomes a routing decision, not a plumbing decision.** Cheap harness for the mechanical task, flagship harness for the hard one. That's a scheduler, not a proxy.
- **It's the [harness thesis](/blog/harness-not-model) applied one level up.** If the harness — not the model — is what turns 6.7% into 68%, then the leverage isn't in swapping engines under a harness. It's in the layer that decides which harness runs what, and refuses to pay for the same mistake twice.

Concretely, for me this means folding [cmdop-claude](https://pypi.org/project/cmdop-claude/) into cmdop as a first step — and then moving the *whole* harness-orchestration logic there, rather than continuing to bolt cheap models underneath a harness that never asked for them.

## Takeaway

If all you want is Kimi driving Claude Code: **use the vendor's `/anthropic` endpoint and skip the translators entirely.** If you need routing, failover, or fleet-wide cost accounting on top: **LiteLLM if you're already on Python, Bifrost if you want one Go binary.** Expect streaming tool-call bugs, expect to lose prompt caching, expect thinking-plus-tools to be the sharp edge — and know that those are properties of the boundary, not of the tool you picked.

And the strategic answer is to stop pushing on that boundary. Don't spend your life teaching every model to speak Claude Code's dialect from below. **Write the harness that speaks to harnesses from above** — then it never matters what dialect any of them speak.
