---
title: "How to Save Tokens in LLM: A Practical Guide for Claude Code"
description: "Working approaches to saving tokens in Claude Code and Opus 4.7/4.8: subagents, skills, hooks, Chinese models, knowledge graphs, RAG, xhigh effort, session management, summarization on a cheap model, input compression (headroom, pxpipe, mcp-compressor), and server-side savings (Tool Search, context editing, prompt caching, Batches API). A checklist to cut costs by 10x."
pubDate: 2026-04-12
updatedDate: 2026-07-10
heroImage: "/images/blog/saving-tokens-hero.png"
tags: ["llm", "claude-code", "optimization", "tokens", "opus-4.7"]
draft: false
---

# How to Save Tokens in LLM: A Practical Guide for Claude Code

Burning through 10 subscriptions at $200 each is not the problem. The problem is doing it meaningfully. Below are the working approaches to saving tokens that I use in my daily work with Claude Code.

## 1. How We Actually Pay

Claude Code charges for **input** and **output** tokens. Input is everything that goes into context: the system prompt, chat history, files, screenshots. Output is what the model generates.

Each message in a chat adds the entire accumulated context to the input. Claude Code now offers a 1M context for Opus (see the [official session management guide](https://claude.com/blog/using-claude-code-session-management-and-1m-context)) — which means every message in a large session is billed as if you were resending the entire million tokens. Output also contributes to filling up the context — it grows with every response.

**Bottom line:** shorter conversations are cheaper. Smaller context is cheaper. Less model "thinking" is cheaper.

> ⚠️ **The Opus 4.7 migration surprise.** 4.7 has an [updated tokenizer](https://www.anthropic.com/news/claude-opus-4-7): the same text now maps to **×1.0–1.35** the tokens compared to 4.6. On top of that, in agentic sessions the model thinks more on later turns — output grows. If you moved to 4.7 and the bill "suddenly" went up, it's not a bug, it's the new pricing. Re-measure your budgets on real traffic.

## 2. Subagents Are a Must-Have

The main process (the lead) shouldn't do anything itself. Its job is to coordinate and delegate. All the work is done by subagents with **small contexts**.

Why:

- The lead process context stays within 100–200K and doesn't grow
- A subagent finishes — its context gets cleared
- You can run dozens of agents in parallel

How to set it up:

```
Main process (Opus, 200K context)
├── Agent 1 (Haiku, short context) — script processing
├── Agent 2 (Sonnet, short context) — writing tests
└── Agent 3 (Haiku, short context) — refactoring
```

For bulk tasks (e.g., processing 8000 scripts) — one script, one subagent, the Haiku model. This is radically cheaper than running everything through a single chat.

> 🆕 **Opus 4.7 spawns fewer subagents by default.** Anthropic says it plainly in their [best practices](https://claude.com/blog/best-practices-for-using-claude-opus-4-7-with-claude-code): the model has become more "frugal" and prefers to do the work itself. If you have a scenario where fanning out across files genuinely saves money, spell it out explicitly: "Spawn multiple subagents in the same turn when fanning out across items or reading multiple files. Do not spawn a subagent for work you can complete directly in a single response."

**Anthropic's mental test before launching a subagent:** "will I need the intermediate tool output again — or only the final output?" If only the output, it's a perfect candidate for a subagent: all the noise stays in the child context, and only the result comes back to the parent.

## 3. Context rot: context and hallucinations — a non-linear relationship

This phenomenon has an official term — **context rot**. Anthropic [defines it like this](https://claude.com/blog/using-claude-code-session-management-and-1m-context): model quality degrades as context grows, because attention gets spread across more tokens and old, irrelevant content starts interfering with the current task.

Opus with a 100K context works more accurately than Opus with a 1M context. In other words, a large context is **both more expensive and worse** in quality.

A particularly nasty thing is **autocompact at a bad moment**: automatic context compression kicks in when you've already crept up to the limit, and that's exactly the moment when, due to context rot, the model is at the low point of its intelligence. The summaries come out crooked, key details fall out.

Conclusion: keep contexts compact. Better 5 chats at 100K each than 1 chat at 500K. And don't wait for autocompact to fire.

## 4. Session management: rewind, compact, clear, /usage

With the release of the 1M context, Anthropic [laid out in detail](https://claude.com/blog/using-claude-code-session-management-and-1m-context) that **every turn in Claude Code is a branching point**. You don't have one path ("write another message"), but five:

| Situation | What to use | Why |
| --- | --- | --- |
| Same task, context still needed | **Continue** | Everything in the window still works, you don't pay for rebuilding |
| Claude went the wrong way | **`/rewind` (Esc Esc)** | Keeps useful file reads, discards the failed attempt |
| Session bloated with stale debug/exploration | **`/compact`** | Cheap; Claude decides what matters (you can give hints) |
| Starting a genuinely new task | **`/clear`** | Zero rot; you control what carries over |
| The next step will produce a lot of junk output but you only need the result | **Subagent** | The noise stays in the child context, only the result comes back to the parent |

**Practical rules:**

- **New task = new session.** This is Anthropic's basic rule of thumb.
- **`/rewind` beats "try it differently."** If Claude read 5 files and went down a dead-end path, don't write "doesn't work, try X." Roll back to the moment right after the file reads and reformulate: "don't use approach A, foo doesn't export that, go straight through B." Useful file reads are kept, the failure drops out of context.
- **`/compact` vs `/clear`.** `/compact` is an auto-summary, lossy, steerable with an instruction: `/compact focus on the auth refactor, drop the test debugging`. `/clear` is you writing the brief yourself ("refactoring the auth middleware, constraint X, files A and B, approach Y was rejected"). Slower — but the context is exactly what you decided to keep.
- **Run `/compact` proactively**, while the model hasn't yet hit the wall. You have 1M — there's plenty of time. Don't wait for autocompact at the low point of intelligence.
- **The `/usage` slash command** shows your actual spend — use it to calibrate your behavior.

### Who pays for `/compact`: the summarization is done by your expensive model

A non-obvious point: both `/compact` and autocompact are executed by **the same model selected in the session**. If you're coding on Opus, then "re-read and condense" a million tokens of Opus history will be at the full price of Opus. This is a purely technical summarization that you pay for at the flagship rate.

What people do about it (worst to best):

1. **Switching the model before compression is almost always a trap.** `/model` to Haiku/Sonnet → `/compact` → back to Opus. In theory the compression is cheaper. In practice, switching the model in a live session **resets the prompt cache**: the accumulated Opus cache burns, the new model has to re-read the entire history from scratch, and you'll be charged more for that read than you saved. Plus Sonnet/Haiku have a 200K window versus Opus's 500K–1M — on a large context the smaller model simply "goes blind" (`Context window exceeded`). The trick is only justified on small contexts, where the cache is tiny anyway.

2. **A proxy that intercepts the summarization request.** A local proxy on `ANTHROPIC_BASE_URL` (the same mechanism as the wrappers in §6): regular requests go to Opus, while the service request for compression — recognized by its system prompt or context size — is intercepted and routed to cheap Haiku or to nearly free Gemini Flash / GPT-4o-mini via OpenRouter. To Claude Code this is invisible. The main session's cache is **left untouched**: the summarization request reads the whole history anyway and barely benefits from the cache, so handing it to a cheap model is pure savings.

3. **An external agent + `/clear` (the cheapest).** In an adjacent terminal you run a separate CLI agent on a cheap model: it reads the history and the project's changed files and writes a short `context_summary.md`. In Claude Code — `/clear` (context to zero), then "let's continue based on @context_summary.md." Opus sees only a tiny digest. The manual "save it to .md" principle, taken to its logical conclusion.

   A convenient candidate for this agent role is [opencode](https://opencode.ai): a full-fledged terminal agent with a headless mode and the choice of any cheap model right at request time.

   ```bash
   # the cheap agent writes the digest without touching the Opus session's tokens
   opencode run -m openrouter/google/gemini-flash \
     "Read the git log and changed files, assemble context_summary.md: key decisions, current state, next steps"
   ```

   `--format json` gives machine-readable output, `opencode serve` + `opencode run --attach …` removes the cold start on frequent calls. This can be **hooked up** (§11): `PreCompact`/`Stop` triggers `opencode run` on Haiku/Gemini Flash — the dirty summarization is done by a penny-priced agent on the side, and Opus doesn't burn tokens re-reading its own history. An important caveat: a hook can't call `/clear` itself (the thing that actually zeroes the spend) — it will prepare the digest automatically, but you trigger the context reset yourself. Conceptually it's the same thing [cmdop-claude](https://pypi.org/project/cmdop-claude/) from §7 does in the background, only as a ready-made tool that you can also ask to run ordinary subtasks on a cheap model, offloading the main session.

> ⚠️ **The cache is the main pitfall of the whole scheme.** Any trick that switches the model in a live session burns the prompt cache and the session id: you accumulated 200K on Opus, switched to Sonnet — the entire Opus cache is gone, the new model re-reads everything from scratch at the subscription rate. That's why method (1) is usually pointless, and (2) and (3) win precisely because they **don't touch the main session** — the cheap model works on the side. If you need compression without nuking the cache right inside the session — see `CacheAligner` in headroom (§13).

## 5. Skills Do the Trick

Skills are pre-configured prompts that load on demand and don't sit in context permanently. Many frameworks prepare/download skills as the first step in their workflow.

Unlike MCP servers (which constantly load their instructions into context), skills activate only when needed. Before Opus 4.5, a lot of tokens were wasted on MCP — this has been fixed now, but the "replace MCP with skills and commands" approach is still relevant for saving tokens.

### Caveman

[Caveman](https://github.com/JuliusBrussee/caveman) is an open-source skill and plugin for Claude Code (and other agents): it asks the model to reply ultra-briefly in caveman-speak style while keeping technical accuracy — a concrete take on "shorter conversations are cheaper" from §1. The repo's benchmarks average about **65%** fewer **output** tokens; separately there's `caveman-compress` for compressing prose in memory files to save **input**.

### If you really do need MCP — compress its surface

MCP servers load the descriptions of all their tools into context at startup. If dropping MCP entirely isn't an option, there are proxies that cut this overhead:

- [mcp-compressor](https://github.com/atlassian-labs/mcp-compressor) by Atlassian Labs — a proxy that shows the agent a compressed "surface" of the tools and only hands over the full schema once a specific tool is actually selected. Compression levels from low to max, OAuth available. Hits bloated tool definitions directly.
- [Context7](https://github.com/upstash/context7) by Upstash — an MCP that, on request, pulls up-to-date, version-accurate library documentation straight into the prompt instead of you dumping whole docs into context (or the model hallucinating an outdated API). Documentation as an on-demand tool rather than a wall of text in context.

## 6. Chinese Models and Cheap Subscriptions

Alibaba Cloud, Chinese subscriptions — in terms of price-per-token, they win handily. A subscription for ~$30 gives you a token amount comparable to Anthropic's $200 plan.

In practice:

- Wrappers around Claude are used that let you switch model providers
- Global env variables are not modified — the required ones are passed only when launching the wrapper
- Gemini also has cheap subscriptions that can be used similarly

There's no ready-made solution yet to "bake all models from different providers directly into Claude," but wrappers cover 80% of needs. One such tool is [Clother](https://github.com/jolehuit/clother/) — it lets you run Claude Code with different model providers without touching global settings.

### Two different things: launchers vs routing proxies

It's worth drawing a line that trips people up, because it decides what can coexist:

- **A launcher (like Clother)** is *clothing*. It only sets environment variables — provider, model, `ANTHROPIC_BASE_URL` — at the moment Claude Code starts, without touching your global config. It runs **no server**, it does **not** sit in the request path, it does **not** intercept anything. It just *chooses* what Claude Code points at. So a launcher never "conflicts" with a proxy — it's the thing you'd use to launch Claude Code pointed *at* a proxy.
- **A routing proxy** is a real server that owns the `ANTHROPIC_BASE_URL` endpoint, receives every request, and translates the Anthropic Messages API into some other provider's dialect before forwarding. This is how you teach Claude Code to actually *speak to* non-Anthropic models.

Claude Code only talks the Anthropic Messages API. To run it on GPT/Codex/Gemini/Qwen you point `ANTHROPIC_BASE_URL` at a translating proxy. The one that specifically fronts **Codex/ChatGPT** is [link-assistant/router](https://github.com/link-assistant/router) — a Rust proxy that reads your `~/.codex/auth.json` OAuth and translates Anthropic → OpenAI Responses API (also Gemini via `~/.gemini`, Qwen via `~/.qwen`). You set `ANTHROPIC_BASE_URL=http://127.0.0.1:8080/api/latest/anthropic` and `ANTHROPIC_API_KEY=la_sk_…`, and Claude Code thinks it's talking to Anthropic while Codex answers.

> ⚠️ **Only one server can own `ANTHROPIC_BASE_URL` at a time.** The *proxies* — a routing proxy, pxpipe, a headroom proxy — genuinely compete for that single endpoint; run one, or **chain** them (each proxy's upstream points at the next). A **launcher like Clother does not count** — it isn't a server, so it never occupies the slot. Native **subagent model overrides** (`CLAUDE_CODE_SUBAGENT_MODEL`, or `model:` in an agent's frontmatter) are the zero-proxy way to keep the flagship on planning/review and push routine work to a cheap model.

## 7. Knowledge Graphs and RAG: Cutting Tokens by 10x

### LightRAG

[LightRAG](https://github.com/HKUDS/LightRAG) is an approach that combines knowledge graphs and LLMs. It can reduce token consumption by up to 10x by structuring the retrieval of relevant information instead of loading the entire context.

### væd.ai

[væd.ai](https://github.com/vaed-ai/vaed-ai) (formerly a8e) by [ivansglazunov](https://github.com/ivansglazunov) — a single associative field instead of tables and collections: every entity and relation lives in one reactive graph via the `æ()` operator, synced with any storage (IndexedDB, PostgreSQL, FS, blockchain). For token savings the point is the same as with LightRAG: connect the graph and the LLM and pull the relevant slice of context rather than dumping everything into the window. The project is already public: `npm i vaed-ai`, Unlicense (public domain). For a deeper take on the idea, see [this video](https://www.youtube.com/watch?v=5-nrGj8qKqQ).

### cmdop-claude

[cmdop-claude](https://pypi.org/project/cmdop-claude/) is an approach by [markolofsen](https://github.com/markolofsen). From graph structures it uses Merkle trees. The core idea: run nearly free Chinese LLMs in the background to keep the `.claude` folder in order — preparing context for the main model.

### CodeGraph — the hyped code-symbol graph (a.k.a. "cdegraph")

The tool everyone's pointing at right now is [CodeGraph](https://github.com/colbymchenry/codegraph) (~59K stars, very actively maintained). It builds a **tree-sitter symbol graph** of your codebase — symbols, call paths, dependencies — into a local `.codegraph/` index (SQLite + FTS5) that auto-syncs on file changes, and serves it to the agent as an **MCP server**. Instead of grepping and reading whole files, the model asks the graph for the exact symbols and call paths it needs. Reported: **~57% fewer tokens, ~71% fewer tool calls**, all 100% local.

```bash
curl -fsSL https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.sh | sh
codegraph init   # wires the MCP server into Claude Code / Cursor / Codex / opencode
```

**CodeGraph vs graphify — do they clash?** No, they overlap without breaking. CodeGraph is a *live, queryable symbol index* delivered as MCP, tree-sitter, code-only, deterministic. graphify (§13) is a *persistent semantic/knowledge graph* of the whole project (code **+** docs/PDF/images), semantics extracted on cheap OpenRouter, delivered as a skill + hooks. Neither touches `ANTHROPIC_BASE_URL`, so they don't fight over the proxy slot; CodeGraph just adds its tool definitions to context (Tool Search, §14, softens that). If you want one live "don't read the whole repo" index, CodeGraph is the strongest single add today.

### Serena, claude-context, Repomix — the rest of the retrieval family

- **[Serena](https://github.com/oraios/serena)** — an **LSP-based** semantic retrieval + editing MCP (symbol-level, language-server-accurate). `uvx --from git+https://github.com/oraios/serena serena start-mcp-server`. Overlaps CodeGraph — pick one primary code-retrieval MCP so you're not paying for two sets of tool definitions.
- **[claude-context](https://github.com/zilliztech/claude-context)** by Zilliz — hybrid semantic + BM25 code search over a Milvus/Zilliz **vector DB**, as MCP. `claude mcp add claude-context -- npx @zilliz/claude-context-mcp@latest`. The heaviest option (needs external infra) but the most RAG-grade search.
- **[Repomix](https://github.com/yamadashy/repomix)** — not resident and zero-conflict: a one-shot CLI that packs a repo into a single AI-friendly file, with `--compress` (tree-sitter squeeze) and `--token-budget`. `npx repomix`. Great for handing a whole small repo to a model in one controlled, budgeted dump.

> A ready-made global knowledge-graph setup — [graphify](https://github.com/safishamsi/graphify) with an OpenRouter backend so semantic indexing doesn't eat Claude tokens — I cover in §13, alongside rtk.

## 8. Agent Management Frameworks

### Superpowers

A popular framework for Claude Code with a set of ready-made skills, patterns, and pipelines.

### AI Factory

[ai-factory](https://github.com/lee-to/ai-factory) is an interesting framework for managing AI agents. Combined with [aif-handoff](https://github.com/lee-to/aif-handoff) it provides a frontend with kanban boards and filters.

Key idea: a human sets the initial tasks, AI decomposes them, but **work doesn't start without human approval of the finished plan**. This both saves tokens (no rework) and gives you control.

## 9. Effort levels in Opus 4.7: `xhigh` is the default, `max` is an anti-pattern

With Opus 4.7 [a new `xhigh` level appeared](https://www.anthropic.com/news/claude-opus-4-7) between `high` and `max`. And in Claude Code it's now **the default for all plans**. The old intuition "crank it to `max` and it'll be smarter" no longer holds.

Anthropic [recommends this](https://claude.com/blog/best-practices-for-using-claude-opus-4-7-with-claude-code):

| Level | When to use |
| --- | --- |
| `low` / `medium` | Cost-/latency-sensitive, narrow tasks. At the same level, 4.7 is already stronger than 4.6 — and **low-effort 4.7 ≈ medium-effort 4.6** in quality. Direct savings. |
| `high` | Parallel sessions or when you want to lower spend without a big quality drop. |
| `xhigh` (default) | Best for most coding and agentic tasks. Strong autonomy + intelligence, **without the runaway tokens that `max` produces** on long runs. |
| `max` | **Don't use it by default.** Diminishing returns, prone to overthinking. Anthropic says it plainly: "use it deliberately for tasks like testing the model's maximum ceiling in evals and for extremely intelligence-sensitive and non-cost-sensitive uses". |

**Key takeaway.** If you upgraded from 4.6 — don't carry over the old effort mechanically. Experiment: what you ran at `high` on 4.6 often works at `medium` on 4.7 for less money.

### Adaptive thinking: there's no more fixed budget

Extended Thinking with a fixed thinking budget isn't supported in 4.7. Instead there's **adaptive thinking**: the model decides at each step whether to "think," and how much.

It's controlled by the prompt:

- Want more reasoning: "Think carefully and step-by-step before responding; this problem is harder than it looks."
- Want savings: "Prioritize responding quickly rather than thinking deeply. When in doubt, respond directly." — you lose some accuracy on hard steps, but save tokens.

## 10. Practical Tips

**Describe the task fully on the first turn.** Anthropic [says it plainly](https://claude.com/blog/best-practices-for-using-claude-opus-4-7-with-claude-code): "treat Claude as a capable engineer you delegate to, not a pair-programmer you guide line by line." A good spec with intent, constraints, acceptance criteria, and file paths — in the first message. Clarifications smeared across 10 turns are not only more expensive (each turn adds reasoning overhead) but also **lower the quality of the result** on 4.7.

**Auto mode for trusted long tasks.** Claude Code Max gained an auto mode (Shift+Tab) — Claude makes decisions for you, interrupting less often. Fewer approval iterations = fewer tokens.

**Skills over MCP.** Before Opus 4.5, replacing MCP with skills gave noticeable savings. The difference is smaller now, but for bulk tasks the approach still works.

**Subagent model management.** You can specify which model a subagent should use. For routine tasks — Haiku, for complex ones — Sonnet or Opus.

**Response length is now calibrated automatically.** Opus 4.7 is shorter on simple requests and longer on open-ended analysis — less verbose by default. If you strictly need a certain length or style, specify it explicitly. Anthropic's tip: positive style examples work better than "don't do this."

**Fewer tools, more reasoning.** Opus 4.7 reaches for tools less often by default. If your scenario needs aggressive file search/reading, spell out when and why, otherwise the model will save turns by guessing.

**Task budgets (API).** The Claude Platform gained [task budgets in public beta](https://www.anthropic.com/news/claude-opus-4-7) — you can cap the token budget for an entire long run rather than praying the model doesn't run away on its own.

**`--bare` mode — clean launch.** The `--bare` flag starts Claude Code without hooks, LSP, plugin sync, auto-memory, background preloading, and — most importantly — **without auto-discovery of CLAUDE.md**. All of this normally gets loaded into the system prompt and burns tokens before the first message. In bare mode, the context starts minimal, and the necessary data can be passed precisely via `--system-prompt`, `--append-system-prompt`, `--add-dir`, or `--mcp-config`. Ideal for bulk subagents where extra preprompting is pure waste.

## 11. Hooks — Automatic Savings

Hooks are scripts that trigger on events inside Claude Code. They're configured in `.claude/settings.json` and let you automate routines that save tokens.

### Types of Hooks

- **PreToolUse** — triggers before a tool call. Can filter or modify input data.
- **PostToolUse** — triggers after. Useful for auto-formatting and post-processing.
- **PreCompact** — triggers before context compression. Lets you preserve important information.
- **Stop** — triggers when the agent finishes work. Can check task completion.
- **SessionStart** — triggers at session start. Useful for preloading context.

### Examples of Useful Hooks

**Test output filtering.** The official Anthropic example — a `PreToolUse` hook for Bash that trims long test output, keeping only the failed tests and the summary. Instead of 500 lines of log, only 10 lines make it into context — direct token savings.

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "command": "your_filter_script.sh"
    }]
  }
}
```

**Auto-formatting after write.** A `PostToolUse` hook for Write/Edit — running `prettier` or `black` after every file save. The model doesn't need to spend tokens on code formatting — it writes the logic, and the hook does the formatting.

**Protection against destructive commands.** A `PreToolUse` hook for Bash that blocks `rm -rf`, `DROP TABLE`, and similar commands. Doesn't save tokens directly, but protects against costly mistakes and rework.

**Saving context before compact.** A `PreCompact` hook — before context compression, you can save key decisions and state to a file so they aren't lost after compaction. A powerful trick is to hand the summarization itself to **an external agent on a cheap model** (e.g., `opencode run -m …`, see §4): the hook writes the digest with the hands of a penny-priced model, instead of forcing Opus to re-read its own history at the flagship rate.

### What Hooks Cannot Do

Auto-compact every Nth message can't be configured through hooks — it's a built-in Claude Code feature. But you can use the `PreCompact` hook to control what gets preserved during compression.

## 12. Screenshots — the Hidden Token Eater

According to the docs, Claude compresses images by resolution. In practice — no noticeable compression. On a 4K monitor, a single screenshot is expensive.

> ⚠️ **With Opus 4.7 the situation is even worse.** The model now accepts images up to **2576px on the long side (~3.75 MP)** — more than three times larger than previous models. Anthropic says it plainly in the [announcement footnote](https://www.anthropic.com/news/claude-opus-4-7): "higher-resolution images consume more tokens, users who don't require the extra detail can downsample images before sending them to the model". In other words, the routine vision upgrade simultaneously became a bill upgrade.

Solution: downsize screenshots to ~400px wide before sending. The text stays readable, and you spend an order of magnitude fewer tokens.

For macOS I built [Open Screenshot](https://openscreenshot.suenot.com/) — a utility that takes screenshots in a resolution-compressed format right away. No manual resizing needed. Give it a try!

## 13. Ready-to-Go Setup Out of the Box: rtk + graphify

Two tools I keep enabled globally — each attacking its own cost driver from §1: **rtk** cuts input from commands, **graphify** removes "read the entire repository" from context. Neither requires its own API key (graphify runs semantics through cheap OpenRouter, not through Claude tokens). Together with caveman (§5) you get a complete stack: command input + repository context + model output.

**I've packaged the full setup in a dedicated repository — [`suenot/claude-code-token-savers`](https://github.com/suenot/claude-code-token-savers)** (scripts, patches, hooks, `setup.sh`).

### rtk — command output compression

[rtk](https://github.com/rtk-ai/rtk) (Rust Token Killer) is a CLI proxy: it filters, deduplicates, and trims the output of 100+ commands (git, docker, pytest, cargo…) by **60–90%** before that output ever reaches context. Single binary, no dependencies, <10 ms overhead, no LLM.

```bash
brew install rtk
rtk init -g --auto-patch   # installs a global PreToolUse hook for Claude Code
# restart Claude Code; verify: git status
```

The hook transparently rewrites `git status` → `rtk git status`. It's the same technique as in §11 (filtering test output with a hook), but applied to a hundred commands at once.

### graphify — a knowledge graph instead of reading the whole repo

[graphify](https://github.com/safishamsi/graphify) turns code and docs into a knowledge graph (nodes, communities, god-nodes) that you **query** (`/graphify query "…"`) instead of dumping files into context — a practical embodiment of the idea from §7. The key trick: **semantic extraction runs through OpenRouter (`deepseek/deepseek-v4-flash`), not through Claude tokens** — building a graph for a mid-sized project costs ~$0.10 on OpenRouter and zero session tokens.

What's in the ready-made setup (the repo above, `graphify/` folder, `./setup.sh`):

- OpenRouter backend (`~/.graphify/providers.json`, the model is switchable via `GRAPHIFY_OPENROUTER_MODEL`);
- **SessionStart hook with auto-watch**: if a graph exists — it watches for changes and updates it; if the project isn't initialized — it just prints "run `/graphify .`" (so that an accidentally opened root/huge folder doesn't eat tokens);
- a clean **no-media toggle** (`touch ~/.graphify/no-media`) — keeps images/PDFs/videos out of the graph without fussing with ignore files;
- a security fix: `.graphifyignore` no longer "shadows" `.gitignore` (merge instead of replace, [PR #1364](https://github.com/safishamsi/graphify/pull/1364) upstreamed), plus a pre-commit guard that prevents committing a graph that captured a `.gitignore`-listed file.

> Caveman (§5) finishes off the third layer — **the model's own output**. rtk + graphify + caveman = command input, repository context, and model output, respectively. For writing-heavy tasks, caveman is best turned off ("normal mode") — its terse style gets in the way of editing.

### headroom — compressing the entire input (and where it clashes with the stack)

[headroom](https://github.com/headroomlabs-ai/headroom) by Headroom Labs goes further than rtk: it compresses not just command output but the entire input — tool output, logs, files, code, RAG chunks, history — by a claimed **60–95%**. Under the hood is a pipeline of specialized compressors: `SmartCrusher` (JSON/arrays), `CodeCompressor` (AST parsing for Python/JS/Go/Rust/Java/C++), `Kompress-base` (a trained model for prose), and a router that figures out the input type itself. Two important aces:

- **CacheAligner** — stabilizes prefixes so that Anthropic/OpenAI's native KV cache still hits. That is, headroom deliberately solves that very burning-cache problem from §4.
- **CCR (reversible compression)** — originals are cached locally, and if the model genuinely needs the full version, it calls the `headroom_retrieve` tool. Compression without irreversible data loss.

It installs and wraps Claude Code like this:

```bash
pip install "headroom-ai[all]"
headroom wrap claude        # there are --memory and --code-graph flags for Claude Code
```

There are several modes: library (`compress(messages)`), an HTTP proxy on `localhost:8787`, a CLI wrapper (`headroom wrap`), and an MCP server.

**Will it conflict with an already-installed stack (rtk + graphify + caveman + Clother)?** It depends on the mode:

| With what | Verdict |
| --- | --- |
| **Clother (a launcher, not a proxy)** | ✅ No conflict — this was a common misconception. Clother only *sets env vars* at launch; it runs no server and never occupies `ANTHROPIC_BASE_URL`. You'd use Clother to *launch* Claude Code pointed at headroom, not instead of it. The real single-owner rule is among **running proxies** — headroom-proxy, pxpipe, a routing proxy (§6): one owner, or chain them. |
| **rtk** | Duplication, not breakage. Both compress command output, but at different layers: rtk is a lightweight Rust hook (<10 ms, no LLM), headroom is heavier (AST/model) but broader. It's sensible to split them: rtk on commands, headroom on files/code/RAG. You can enable both on the same thing, but headroom will re-chew the already-trimmed rtk output — not harmful, but pointless. |
| **graphify** | ✅ No overlap. graphify cuts input from "read the entire repository," headroom cuts tool output and files. They complement each other. |
| **caveman** | ✅ No overlap. caveman compresses the model's **output**, headroom the **input**. Opposite sides of the barricade. |

I'm not running it in production yet, but as "heavy artillery" on top of rtk/graphify it's the number-one candidate, especially for `CacheAligner` (see §4 on the burning cache).

### pxpipe — rendering the request as images (§12 turned inside out)

[pxpipe](https://github.com/teamchong/pxpipe) by [teamchong](https://github.com/teamchong) attacks input from an unexpected angle. In §12 a screenshot is the enemy — an image eats tokens. pxpipe flips that: an image's token cost is fixed by its **pixel dimensions**, not by how much text is packed inside it. On real Claude Code traffic dense content (code, JSON, tool output) packs ~3.1 chars per image-token versus ~1 char per text-token. So it takes the bulky, static parts of every request — the system prompt, tool docs, older history — and **renders them into dense PNGs** before the request leaves your machine. The model reads them through the same vision channel Anthropic's computer use already relies on. Claimed result: a **~59–70% lower input bill**, and the durable metric is the token cut itself, measured per-request against a free `count_tokens` counterfactual.

It's a proxy, and — to answer the obvious question — the integration is **already native**: no plugin, no hook, just Claude Code's built-in `ANTHROPIC_BASE_URL`.

```bash
npm install -g pxpipe-proxy   # or on demand: npx pxpipe-proxy
pxpipe                                            # proxy on 127.0.0.1:47821
ANTHROPIC_BASE_URL=http://127.0.0.1:47821 claude  # point Claude Code at it
```

The dashboard at `127.0.0.1:47821` shows tokens saved, every text→image conversion side by side, a live kill switch, and logs each event to `~/.pxpipe/events.jsonl`. Only the **request** is compressed — responses stream normally.

> ⚠️ **It's lossy, and the misses are silent.** Exact byte-level values (hex strings, IDs, hashes, secrets) read out of an image can be **confabulated** rather than errored on. So recent turns stay as text automatically, and byte-exact work should be routed to a subagent on a non-allowlisted model (`CLAUDE_CODE_SUBAGENT_MODEL=claude-sonnet-4-6`), which passes through as text. It also depends heavily on the reader: on the Fable 5 reader it hits ~100/100 on text needles, but Opus misreads imaged content — which is why pxpipe keeps Opus opt-in.

**Where it clashes with the stack.** Same caveat as headroom-proxy: pxpipe claims `ANTHROPIC_BASE_URL`, so it can't coexist on the same base URL with a headroom proxy or a routing proxy (§6) without chaining — pick one proxy in front, and stack the hook-based tools (rtk, graphify, caveman) on top. (A launcher like Clother is fine — it isn't a server, so it just points Claude Code *at* pxpipe.) It's the most radical input-compressor of the bunch, and the one worth trying when the request-side bill (system prompt + tool docs + long history) is what's actually killing you.

## 14. Server-Side and API-Level Savings (What Claude Code Already Does — and What It Doesn't)

Everything above is stuff *you* bolt on. But a whole layer of savings lives on **Anthropic's side of the wire** — some of it already switched on for you in Claude Code, some of it only reachable if you build on the raw API/SDK. Knowing which is which stops you from installing a tool to fix a problem the platform already solved — and from assuming a feature is on when it isn't.

### Advanced tool use: Tool Search, Programmatic Tool Calling — already on by default

Anthropic's [advanced tool use](https://www.anthropic.com/engineering/advanced-tool-use) suite (Nov 2025) is the biggest single win on this list, and the good news is **you don't configure it**:

- **Tool Search Tool** (`defer_loading`). Instead of dumping every tool's full schema into the system prompt on every request, the model is shown just the tool *names* and pulls the full definition only for the tools it actually needs. Anthropic's number: **77K → 8.7K tokens (~85%)** on a large tool set. **In Claude Code this is already active by default** — with many MCP servers and plugins connected, the extra tools sit as names-only until called, and the model fetches a schema on demand. **No setting to flip: it kicks in by scale**, the more tools you have connected the more it saves. The only case where you have to think about it is a **custom harness / Agent SDK app** — there you implement it yourself (mark tools `defer_loading: true`) or at least verify your harness does the deferring, otherwise you're back to paying for every schema on every turn.
- **Programmatic Tool Calling.** The model writes code in an execution container that calls tools and filters their results *before* they hit context — instead of every raw tool result round-tripping through the window. Typical **20–40%** on tool-heavy agent runs (plus an accuracy bump). This one is still API-native (beta) and not automatic in Claude Code yet.

> **Takeaway:** the ~85% tool-schema saving is already yours in Claude Code — no extra setup. Only worry about it if you're writing your own harness.

### Context editing (`clear_tool_uses`) — an API feature; Claude Code gives you its own version

Anthropic's [context editing](https://platform.claude.com/docs/en/build-with-claude/context-editing) (beta header `context-management-2025-06-27`, strategy `clear_tool_uses_20250919`) auto-clears the oldest tool results once context crosses a threshold, swapping each for a short placeholder. In Anthropic's 100-turn eval that was an **84% token reduction** on a run that would otherwise die of context exhaustion.

But: **that raw knob is not exposed in Claude Code** (there's an open request to surface it). What Claude Code gives you instead is **microcompact** — it automatically offloads large tool outputs to disk and keeps only a hot tail of recent results plus path references — running silently alongside `/compact` and autocompact. So the *behavior* (pruning stale tool output) is covered for you automatically; the *specific API parameter* is only reachable if you build directly on the Anthropic API/SDK. Don't go looking for a `clear_tool_uses` setting in Claude Code — you already get the house version.

### Proactive prompt caching — 90% off the cached read, and mostly automatic

[Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) is GA and foundational: a cached read costs **0.10× input (−90%)**. Two TTLs — 5-minute (default) and 1-hour (extended). **Claude Code already caches aggressively for you**; what you control is whether the cache *hits*:

- Keep the front of the context **byte-stable** — the system prompt, tool definitions, and `CLAUDE.md` should not churn between turns, or the prefix cache misses and the model re-reads from scratch.
- Don't reorder tools or rewrite early context mid-session (this is exactly the §4 "burning cache" trap).
- Opus 4.8 helps here: it lets a `role:"system"` message appear *after* a user turn, so you can append instructions **without** busting the cached prefix, and it lowered the minimum cacheable prompt to **1,024 tokens**.

### Message Batches API — flat 50% off for offline bulk

For non-interactive bulk work — the "8000 scripts, one subagent each" scenario from §2, or bulk summarization / classification / evals — the [Message Batches API](https://platform.claude.com/docs/en/build-with-claude/batch-processing) runs them async (results within 24h, usually much sooner) at a **flat 50% discount on both input and output**, and it **stacks with prompt caching** (another 90% on cached reads).

**The catch: Claude Code itself has no batch mode.** It's an interactive REPL — every turn is a live, full-price request, there's no "queue 8000 jobs at half price" button. The 50% discount lives one layer down, on the raw API, and you reach it only by leaving the CLI:

- **Anthropic API / SDK** directly — `client.messages.batches.create(...)` (Python/TS). This is where you'd script the bulk pass yourself, or build it on the **Claude Agent SDK** rather than the interactive CLI.
- **AWS Bedrock** — "Batch Inference".
- **Google Vertex AI** — "Batch Prediction".
- (Same pattern elsewhere: **OpenAI** has an equivalent Batch API at −50%.)

So the rule of thumb: **interactive coding → Claude Code (caching does the heavy lifting); offline bulk → drop to the API/SDK or Bedrock/Vertex and batch it.** Trying to force bulk labeling through the interactive CLI leaves that 50% on the table.

### Cheap hygiene: `/context`, a lean CLAUDE.md, and dropping idle MCP servers

- **`/context`** prints a token-by-token breakdown of what's filling your window — system prompt, system tools, MCP tools, memory files (`CLAUDE.md`), custom agents, messages. Run it to see who the hog is.
- **A bloated `CLAUDE.md` is a tax on every message** — a 10K-token memory file is re-sent with every turn. Keep it lean; push task-specific instructions into **skills** (loaded on demand) instead.
- **Every idle MCP server bills its tool definitions on every request.** Disconnect the ones you're not using via `/mcp` (or a toggle like `cctoggle`). Tool Search softens this, but not using a server at all is still cheaper than deferring it.
- **If you run many MCP servers, put them behind a lazy-loading gateway.** [mcp-gateway](https://github.com/RaiAnsar/mcp-gateway) proxies N servers behind a handful of tools and loads each server's schema only on demand (a claimed ~95% cut to tool-definition tokens). It's complementary, not a duplicate of mcp-compressor: the gateway hides *schemas*, mcp-compressor shrinks *responses*. With CodeGraph + Context7 + others connected, it directly offsets the tool-def cost of adding them.

### Structured Outputs — kill the retries and the preamble

[Structured Outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) (beta) uses constrained decoding to guarantee schema-valid JSON (`output_format`, or `strict: true` on tools). The saving is indirect but real: no invalid-JSON retry round-trips (a single failed parse costs more than the feature's ~2–3% schema overhead), and it strips the verbose narrated reasoning the model would otherwise wrap around its answer.

### Two things NOT to bother with

- **The `token-efficient-tools-2025-02-19` header is history.** It cut tool-call output tokens on **Claude 3.7 Sonnet only**; every Claude 4+ model (including Opus 4.7/4.8) does token-efficient tool use **by default**, so the header is a no-op today. Don't add it.
- **LLMLingua-2** (Microsoft's prompt compressor, 2–5×) is real and good, but it's the *engine* that slots into the same job **headroom** (§13) already fills — not a separate method to install alongside it.

## Savings Checklist


| Approach                                          | Savings                                          |
| ----------------------------------------------- | ------------------------------------------------- |
| Subagents with short contexts               | 2–5x on long sessions                           |
| Chinese models for routine tasks                     | 5–10x by price ($30 vs $200)                       |
| Skills over persistent MCP                   | 1.5–2x                                            |
| Hooks for output filtering                      | 1.5–3x on tasks with tests/logs                |
| Compact screenshots (especially with 4.7)           | 2–3x on visual tasks                        |
| Graphs/RAG over full context              | up to 3–5x                                           |
| Lowering Opus 4.7 effort (low/medium instead of high) | 1.5–3x at comparable quality                  |
| Dropping `max` in favor of `xhigh` by default      | up to 2x on long agentic runs               |
| `/rewind` instead of "try it differently"               | 1.3–2x: discards junk, keeps file reads    |
| `/compact` proactively (before autocompact)          | preserves quality, fewer repeat passes     |
| Full spec on the first turn (Opus 4.7)             | 1.3–1.7x: fewer turns, less reasoning overhead |
| `--bare` mode for subagents                   | 1.5–2x per launch                            |
| Adaptive thinking prompt "respond quickly"       | 1.2–1.5x on simple tasks                     |
| Task budgets (API)                              | protection against runaway tokens on long runs          |
| Frameworks with plan approval                   | indirectly, via fewer reworks               |
| rtk — command output compression (PreToolUse hook)     | 1.5–3x on git/docker/pytest/logs                 |
| graphify — graph instead of full context (semantics on OpenRouter) | up to 10x on large-repo navigation; build ~$0.10, not Claude tokens |
| CodeGraph ("cdegraph") — live tree-sitter symbol graph via MCP | ~57% fewer tokens / ~71% fewer tool calls; 100% local, no proxy conflict |
| Repomix — one-shot repo pack with `--compress` / `--token-budget` | budgeted whole-repo dump; zero-conflict CLI, no resident hook/proxy |
| mcp-gateway — lazy-load schemas for many MCP servers | ~95% cut to tool-definition tokens; complements mcp-compressor |
| `/compact` summarization on a cheap model (proxy / external agent like opencode) | compression at Haiku price instead of Opus, without nuking the main session cache |
| headroom — compressing the entire input (tool output/files/code/RAG) | 60–95% on input; `CacheAligner` protects the KV cache, `CCR` is reversible |
| pxpipe — rendering the request (system prompt/tool docs/history) as dense PNGs | ~59–70% on input via the vision channel; lossy on byte-exact values, Opus opt-in |
| mcp-compressor — compressing the MCP surface (schema on demand) | cuts the tool-definition overhead from MCP servers |
| Tool Search / `defer_loading` (auto in Claude Code) | up to ~85% of tool-schema tokens; zero setup — kicks in by scale |
| Context editing / microcompact (auto in Claude Code) | up to 84% on long agent runs; API knob `clear_tool_uses` only via raw SDK |
| Proactive prompt caching (stable prefix, 1h TTL) | 0.10× on cached reads (−90%); mostly automatic, keep the prefix byte-stable |
| Message Batches API (offline bulk, not Claude Code) | flat −50% input+output; via API/SDK, Bedrock, Vertex — stacks with caching |
| `/context` + lean CLAUDE.md + drop idle MCP servers | thousands of tokens per message from trimming memory files and idle tool defs |
| Structured Outputs (`strict` JSON) | removes parse-retry round-trips and verbose preamble |


---

*You can burn through as many as you want — and 10 accounts at $200 is not the limit. But that's not a measure of efficiency. The goal is to cut costs by at least 10x without sacrificing quality.*
