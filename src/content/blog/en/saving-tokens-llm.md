---
title: "Reducing token use in Claude Code"
description: "A practical, measurement-first guide to lower context cost in Claude Code: smaller sessions, focused delegation, retrieval, compact tool output, caching, and API batching."
pubDate: 2026-04-12
updatedDate: 2026-07-10
heroImage: "/images/blog/saving-tokens-hero.png"
tags: ["llm", "claude-code", "optimization", "tokens", "opus-4.7"]
draft: false
---

# Reducing token use in Claude Code

Token savings usually come from sending less irrelevant material to a model. Start with a measurement, not a slogan: inspect usage for a real task, note which files and tool results entered the conversation, then change one part of the workflow and compare quality, latency, and cost.

## Keep sessions about one job

Context contains instructions, conversation history, files, tool output, and model responses. It grows as a session continues. More context can be useful, but it can also make a task slower, costlier, and harder for the model to follow when old investigation overwhelms the current decision.

Use a new session for a genuinely new task. Use `/rewind` when an approach is wrong but the earlier file reads still matter. Use `/compact` when a continuing task needs a smaller summary, and `/clear` when you can write a concise fresh brief. Check `/usage` rather than guessing which habit costs the most.

Compaction is lossy. Before clearing a long session, save decisions, changed files, unresolved questions, and the next step in a short project note. That note gives the next session evidence to work from instead of a vague retelling.

## Delegate to contain noisy work

A subagent is useful when the parent needs its conclusion but not every command, search result, and failed attempt. Give it a bounded question, a directory or files to inspect, and a requested output format. The parent should receive the answer and the evidence it needs to act on it.

Do not make every small action a subagent. Delegation has its own prompt, coordination, and review cost. Parallel work pays off for independent investigations; a short edit is often cheaper to do directly.

## Retrieve before reading everything

Large repositories reward targeted context. A symbol index, search tool, or knowledge graph can help find the files and call paths relevant to a question before the model opens source. [graphify](/blog/graphify-claude-code) is one approach for a persistent repository graph. A simple search and a short file list can be enough for a smaller codebase.

Generated retrieval output is evidence, not proof. Read the cited source before changing it, and treat graph indexes as data that need maintenance and review.

## Reduce tool output at the boundary

Command output is a common source of accidental context growth. Ask tools for the smallest useful view: a failing test name, a diff, a filtered log range, or a single file. Store long logs on disk and pass a path plus a short explanation instead of pasting them into the conversation.

[rtk](https://github.com/rtk-ai/rtk) is an example of a command-output filter. [Caveman](https://github.com/JuliusBrussee/caveman) can request shorter model replies. Each tool changes information before the model sees it, so test it on a representative task. Compression that hides the one relevant error is false economy.

## Keep provider changes separate from context work

Lower-priced models and local inference can be useful for bounded work, but price per token is not total cost. Include retries, supervision, latency, tool compatibility, and the cost of repairing errors. [Clother](/blog/clother-claude-wrappers) can scope provider settings to a single launch; it does not make different model APIs behave alike.

Likewise, a proxy, a launcher, and a retrieval tool solve different problems. Check which process owns the request path before combining them, and never assume that a localhost endpoint means every part of a workflow stays local.

## Use platform features in the right layer

Prompt caching, tool loading, context editing, and batch processing may be available in an API or SDK but not exposed as a Claude Code setting. Read the current official documentation before installing a workaround for a feature that may already be active, or depending on one that is not available in the client.

For offline, independent work, an API batch job can be a better fit than an interactive terminal session. For interactive coding, optimize the actual loop: focused task, minimal tool output, an explicit checkpoint, and a reviewable change.

The durable strategy is modest. Keep only useful context, make expensive work visible, and measure each intervention on your own tasks. That produces smaller bills without treating token count as a substitute for correctness.
