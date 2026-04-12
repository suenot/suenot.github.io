---
title: "How to Save Tokens in LLM: A Practical Guide for Claude Code"
description: "Practical approaches to saving tokens in Claude Code: subagents, skills, hooks, Chinese models, knowledge graphs, and RAG. A checklist to cut costs by 10x."
pubDate: 2026-04-12
tags: ["llm", "claude-code", "optimization", "tokens"]
draft: false
---

# How to Save Tokens in LLM: A Practical Guide for Claude Code

Burning through 10 subscriptions at $200 each is not the problem. The problem is doing it meaningfully. Below are practical approaches to saving tokens that I use in my daily work with Claude Code.

## 1. How We Actually Pay

Claude Code charges for **input** and **output** tokens. Input is everything that goes into context: system prompts, chat history, files, screenshots. Output is what the model generates.

Each message in a chat adds the entire accumulated context to the input. If you're using Opus with a 1M context, every message is billed as if you're sending the entire million tokens again. Output also contributes to context bloat — it grows with every response.

**Bottom line:** shorter conversations are cheaper. Smaller context is cheaper. Less model "thinking" is cheaper.

## 2. Subagents Are a Must-Have

The main process (lead) shouldn't do anything itself. Its job is to coordinate and delegate. All the work is done by subagents with **small contexts**.

Why:

- The lead process context stays within 100–200K and doesn't grow
- Subagent finishes — context gets cleared
- You can run dozens of agents in parallel

How to set it up:

```
Main process (Opus, 200K context)
├── Agent 1 (Haiku, short context) — script processing
├── Agent 2 (Sonnet, short context) — writing tests
└── Agent 3 (Haiku, short context) — refactoring
```

For bulk tasks (e.g., processing 8000 scripts) — one script, one subagent, Haiku model. This is radically cheaper than running everything through a single chat.

## 3. Context and Hallucinations — a Non-Linear Relationship

Opus with a 100K context works more accurately than Opus with a 1M context. At 1M context, hallucinations increase non-linearly. So a large context is **both more expensive and worse** in quality.

Conclusion: keep contexts compact. Better to have 5 chats at 100K each than 1 chat at 500K.

## 4. Skills Do the Trick

Skills are pre-configured prompts that load on demand and don't sit in context permanently. Many frameworks prepare/download skills as the first step in their workflow.

Unlike MCP servers (which constantly load their instructions into context), skills activate only when needed. Before Opus 4.5, a lot of tokens were wasted on MCP — this has been fixed now, but the approach of "replacing MCP with skills and commands" is still relevant for saving tokens.

## 5. Chinese Models and Cheap Subscriptions

Alibaba Cloud, Chinese subscriptions — in terms of price-per-token ratio, they win handily. A subscription for ~$30 gives you a token amount comparable to Anthropic's $200 plan.

In practice:

- Wrappers around Claude are used that let you switch model providers
- Global env variables are not modified — the required ones are passed only when launching the wrapper
- Gemini also has cheap subscriptions that can be used similarly

There's no ready-made solution yet to "bake all models from different providers directly into Claude," but wrappers cover 80% of needs. One such tool is [Clother](https://github.com/jolehuit/clother/) — it lets you run Claude Code with different model providers without touching global settings.

## 6. Knowledge Graphs and RAG: Cutting Tokens by 10x

### LightRAG

[LightRAG](https://github.com/HKUDS/LightRAG) — an approach that combines knowledge graphs and LLMs. It can reduce token consumption by up to 10x by structuring the retrieval of relevant information instead of loading the entire context.

### a8e

A project by [ivansglazunov](https://github.com/ivansglazunov) — the author works in hermit mode and doesn't publish much, so it's hard to see the project in action. It works as a **librarian-RAG**: throws all incoming data into a database. The idea is to connect graphs and LLMs for more accurate and cheaper context retrieval. The approach is similar to the technologies described in [this video](https://www.youtube.com/watch?v=5-nrGj8qKqQ).

### cmdop-claude

[cmdop-claude](https://pypi.org/project/cmdop-claude/) — an approach by [markolofsen](https://github.com/markolofsen). It uses Merkle trees from graph structures. The main idea: run nearly free Chinese LLMs in the background to organize the `.claude` folder — preparing context for the main model.

## 7. Agent Management Frameworks

### Superpowers

A popular framework for Claude Code with a set of ready-made skills, patterns, and pipelines.

### AI Factory

[ai-factory](https://github.com/lee-to/ai-factory) — an interesting framework for managing AI agents. Combined with [aif-handoff](https://github.com/lee-to/aif-handoff) it provides a frontend with kanban boards and filters.

Key idea: a human sets the initial tasks, AI decomposes them, but **work doesn't start without human approval of the finished plan**. This saves tokens (no rework) and gives you control.

## 8. Practical Tips

**High effort and reasoning** can be disabled to reduce costs. Not every task requires the model to "think deeply."

**Skills over MCP.** Before Opus 4.5, replacing MCP with skills gave noticeable savings. The difference is smaller now, but for bulk tasks the approach still works.

**Subagent model management.** You can specify which model a subagent should use. For routine tasks — Haiku, for complex ones — Sonnet or Opus.

**`--bare` mode — clean launch.** The `--bare` flag starts Claude Code without hooks, LSP, plugin sync, auto-memory, background preloading, and — most importantly — **without auto-discovery of CLAUDE.md**. All of this normally gets loaded into the system prompt and burns tokens before the first message. In bare mode, the context starts minimal, and the necessary data can be passed precisely via `--system-prompt`, `--append-system-prompt`, `--add-dir`, or `--mcp-config`. Ideal for bulk subagents where extra preprompting is pure waste.

## 9. Hooks — Automatic Savings

Hooks are scripts that trigger on events inside Claude Code. They're configured in `.claude/settings.json` and let you automate routines that save tokens.

### Types of Hooks

- **PreToolUse** — triggers before a tool call. Can filter or modify input data.
- **PostToolUse** — triggers after. Useful for auto-formatting and post-processing.
- **PreCompact** — triggers before context compression. Lets you preserve important information.
- **Stop** — triggers when the agent finishes work. Can check task completion.
- **SessionStart** — triggers at session start. Useful for preloading context.

### Examples of Useful Hooks

**Test output filtering.** The official Anthropic example — a `PreToolUse` hook for Bash that trims long test output, keeping only failed tests and the summary. Instead of 500 lines of logs, only 10 lines make it into context — direct token savings.

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

**Auto-formatting after write.** A `PostToolUse` hook for Write/Edit — running `prettier` or `black` after every file save. The model doesn't need to spend tokens on code formatting — it writes logic, and the hook handles formatting.

**Protection against destructive commands.** A `PreToolUse` hook for Bash that blocks `rm -rf`, `DROP TABLE`, and similar commands. Doesn't save tokens directly, but protects against costly mistakes and rework.

**Saving context before compact.** A `PreCompact` hook — before context compression, you can save key decisions and state to a file so they aren't lost after compaction.

### What Hooks Cannot Do

Auto-compact every Nth message can't be configured through hooks — it's a built-in Claude Code feature. But you can use the `PreCompact` hook to control what gets preserved during compression.

## 10. Screenshots — the Hidden Token Eater

Claude supposedly compresses images by resolution according to documentation. In practice — no noticeable compression. On a 4K monitor, a single screenshot is expensive.

Solution: downsize screenshots to ~400px wide before sending. Text remains readable, but token consumption drops by an order of magnitude.

For macOS I built [Open Screenshot](https://openscreenshot.suenot.com/) — a utility that takes screenshots in a resolution-compressed format right away. No manual resizing needed. Give it a try!

## Savings Checklist

| Approach | Savings |
|----------|---------|
| Subagents with short contexts | 2–5x on long sessions |
| Chinese models for routine tasks | 5–10x by price ($30 vs $200) |
| Skills over persistent MCP | 1.5–2x |
| Hooks for output filtering | 1.5–3x on tasks with tests/logs |
| Compact screenshots | 1.5–2x on visual tasks |
| Graphs/RAG over full context | up to 3–5x |
| Disabling reasoning for simple tasks | 1.5–2x |
| `--bare` mode for subagents | 1.5–2x per launch |
| Frameworks with plan approval | Indirect, via fewer reworks |

---

*You can burn through as many as you want — even 10 accounts at $200 is not the limit. But that's not a measure of efficiency. The goal is to cut costs by at least 10x without sacrificing quality.*
