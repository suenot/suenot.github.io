---
title: "Claude Code Skills: Wayfinder, Specifications, and the Skills-Driven Agent Workflow"
description: "The Skills 1.1 update introduced Wayfinder for navigation through uncertainty, Specifications for precise technical scoping, and a skills-driven development cycle. What Skills are, why terminology matters for LLMs, and how packaged instructions change agent reliability."
pubDate: 2026-07-25
tags: ["claude-code", "skills", "wayfinder", "agent-workflow", "llm-orchestration"]
draft: false
---

# Claude Code Skills: Wayfinder, Specifications, and the Skills-Driven Agent Workflow

🎬 **Watch on YouTube:** [Claude Code Skills & Wayfinder: Agent Tool Discovery Explained](https://www.youtube.com/watch?v=fzljXADV9cM)

Using AI agents without structure quickly hits the same wall: context overflow, lost architecture, and agents that drift off-prompt when sessions stretch too long. The **Skills 1.1 update** for Claude Code introduces a different approach — a structured development cycle where **Skills** are packaged instructions the model loads on demand, **Wayfinder** navigates through uncertainty by breaking large goals into ticketed dependencies, and **Specifications** replace PRDs as the semantic anchor for technical scoping.

This isn't just new tooling. It's a shift from ad-hoc prompting to a predictable, skills-driven software development lifecycle (SDLC) built around how LLMs actually understand and execute instructions.

## What Skills actually are

A **Skill** is a packaged instruction set the model loads when triggered — typically a `.md` file with structured prompts, examples, and rules that frame how the agent approaches a specific class of problem. Unlike a raw prompt you type ad-hoc, a Skill is:

- **Reusable** across sessions — defined once, invoked by name
- **Version-controlled** alongside your code in `~/.claude/skills/`
- **Composable** — Skills can call other Skills as subroutines
- **Scoped** — loaded only when needed, not polluting every session

The Skills pattern matters because LLMs are semantic engines. The exact words you use carry associative weight from training data. Ask an agent to create a "PRD" and it activates business-analysis patterns from decades of product documents. Ask for a "Specification" and it shifts toward technical architecture, APIs, and data structures. Same underlying intent, different trigger words — and the model goes down completely different paths.

That's why **Skills 1.1 renamed core commands**: `PRD` became `SPEC` (Specification), and the task generator became `Tickets`. Not cosmetic changes — semantic recalibrations. PRD, in the training corpus, is associated with business metrics, market analysis, and stakeholder communications. Specification is a broader, engineering-focused term that forces the model to concentrate on architecture, interfaces, and implementation constraints. Likewise, "Tickets" is platform-agnostic and process-neutral, whereas "Tasks" pulls toward GitHub/Linear idioms and specific workflows.

The lesson: **terminology precision reduces cognitive load on both you and the agent**. The right word saves you paragraphs of clarification.

## The interview architecture: strict constraints, no chaos

The old pattern of firing an agent and hoping for the best tends to produce three failure modes:

1. **Question spam** — the agent dumps ten architectural questions at once, and you're left untangling a wall of text
2. **Premature execution** — the agent decides it "understands" and starts writing code before you've confirmed alignment
3. **Recursive self-interview** — especially with tools like `fabric`, the agent starts debating itself in loops, generating hypotheses without external grounding

Skills 1.1 fixes all three with **architectural constraints** in the system prompt:

- **One question at a time** — enforced in the interview Skill, dramatically reducing cognitive overhead
- **Confirmation gate** — the agent cannot proceed to implementation until you explicitly confirm shared understanding
- **Fact/decision separation** — the agent collects facts autonomously (reading docs, analyzing code) but *never* makes architectural decisions without human input

That last point is critical. Facts are objective and discoverable; decisions are subjective and product-defining. The Skills architecture forces the agent to stay in its lane: it can research endlessly, but it waits at the confirmation gate for you to sign off on direction.

## Specifications and Tickets: the planning phase

Once you clear the confirmation gate, **Specifications** and **Tickets** form the planning layer:

- **Specification** (`/SPEC`) — a technical specification that captures architecture, APIs, data structures, and constraints. Broader than PRD, more engineering-focused.
- **Tickets** (`/Tickets`) — abstract implementation steps derived from the Spec, platform-agnostic and sized to fit within a single AI session

The key is that Tickets aren't GitHub Issues by default — they're *implementation steps* that you can export to your tracker if needed. Each Ticket is scoped to fit within the agent's "competence zone" — the context window and attention budget where it remains reliable. If a Ticket is too large, it gets broken down further.

This planning phase is where you avoid the most common failure mode: dumping a massive, ambiguous requirement on an agent and hoping it figures out the boundaries. Instead, you invest in upfront scoping — Spec → Tickets → confirmation gate — and only then do you move to execution.

## Implementation: TDD without the refactor bloat

The **Implement** Skill in 1.1 answers the eternal question: what's the actual workflow for writing code with an agent?

The answer is **TDD** — but with a twist. The agent creates tests one slice at a time, writes code to satisfy them, runs type checks, and moves on. What's *missing* from the basic cycle is refactoring. Here's why:

- Refactoring is architecturally complex and context-heavy
- Running TDD (red-green) *and* refactoring simultaneously blows out the context window
- The agent effectively runs parallel subagents — one verifying Spec alignment, another checking code standards

Instead of forcing refactor into the implementation loop, Skills 1.1 moves it to the **Code Review** phase, where a separate pass checks for code quality and architectural drift.

## Code Review: activating Martin Fowler through code smells

This is where the Skills approach gets clever. The Code Review phase invokes **Martin Fowler's "Refactoring"** — not as general advice, but through specific trigger terms from the book: *feature envy, primitive obsession, duplicate code, long chains of messages*.

These terms are "code words" that activate terabytes of Stack Overflow discussions, design patterns, and refactoring wisdom baked into the model's weights. You don't write paragraphs explaining why coupling is bad — you say "feature envy" and the agent retrieves the entire architectural concept and proper solutions.

This is **prompting through academic heritage** — leveraging the fact that classic programming texts are deeply embedded in training data, and specific terminology serves as a high-bandwidth trigger for complex knowledge. The Code Review Skill scans for these smells and flags them, preserving the limited context window for implementation rather than architectural debate.

## Wayfinder: navigating beyond the competence zone

Every agent has a "competence zone" — the scope where its context window and attention budget remain reliable. Beyond that zone, things get fuzzy. The agent loses context, hallucinates dependencies, and architecture drifts.

**Wayfinder** is Skills 1.1's answer to large-scale tasks that exceed the competence zone. Instead of trying to solve the whole thing, Wayfinder:

1. Creates a **map of sub-tickets** in your project tracker (GitHub Issues, Linear, etc.)
2. Establishes **dependency trees** — some tickets block others, no decisions on lower levels until the root is closed
3. **Classifies each ticket type** so the agent knows what context to load:
   - **Research** — autonomous background investigation, outputs a dry Markdown file
   - **Grill** (Interview) — iterative decision-making with human input
   - **Prototype** — quick artifact creation for visual evaluation ("how should this look/behave?")
   - **Routine** — configuration and setup work, no dialog needed
   - **Manual** — human-only work, explicitly marked as non-automatable

The critical innovation: **Wayfinder doesn't write code**. It maps the territory, one ticket at a time, until the path is clear. Only then do you invoke the Implementation Skill on individual tickets. This prevents the agent from wandering off into the fog when the goal is too large for one session.

Each sub-ticket is sized to fit within a single AI session. All context lives in your tracker, making the process transparent and collaborative for the entire team. Dependencies are explicit — no architectural decisions on lower levels until the root ticket is closed.

This is what shifts you from "prompt engineer" to "AI project manager" — you're not coaxing the model through a massive task; you're orchestrating a dependency graph where the agent handles one well-defined node at a time.

## Why Skills change the reliability equation

Ad-hoc prompting is fragile. You write a prompt, it works once, you tweak it, it breaks, and you're constantly rebuilding context. Skills invert that:

- **Predictability** — the Skill is a stable artifact. If it works, it keeps working.
- **Composability** — Skills call Skills. Wayfinder calls Research and Prototype. Implement calls Code Review.
- **Reusability** — defined once, invoked across projects and sessions.
- **Version control** — Skills live in git. You can roll back, fork, and share them.

The Skills 1.1 ecosystem (Wayfinder, Specifications, Tickets, Implement, Code Review) forms a complete pipeline: **Plan → Break Down → Execute → Verify**. Each phase is an independent session with clear boundaries. The agent doesn't drift because the Skill enforces the frame.

This matters most for **agentic workflows** at scale. The shift isn't from "write code" to "prompt better" — it's from "write code with AI" to "design systems together with AI." You're not a micro-manager shuffling cards while AI does the real work; you're the architect holding the vision while the agent executes the nodes you defined.

## The adoption reality

Skills 1.1 isn't theoretical. The underlying repo (skillsripple or similar) shows the adoption numbers: roughly 160,000 GitHub stars and 7 million downloads on the Skills platform as of the source video. Those figures signal that developers are mass-adopting structured agent workflows — not as curiosities, but as production tooling.

The pattern that's emerging: **route high-cost, general reasoning to proprietary models where their edge counts, and hand high-volume agentic automation to structured Skills pipelines**. It's the same lesson from [model routing](/en/blog/model-routing-explained) — the win is in orchestration, not in picking one winner.

## The new developer skill

If the agent can research docs, prototype interfaces, write tests, review code against Fowler's canon, and map massive tasks into dependency trees — what's left for you?

The shift is from *writing code* to *asking the right questions in uncertainty*. Standing at the confirmation gate, you're not the one typing the variable names — but you're the one deciding the architecture, the trade-offs, and the product direction. The agent executes; you orchestrate.

That's the Skills 1.1 thesis in a sentence: **chaos becomes pipeline when you give the model packaged instructions and strict boundaries**. Terminology precision matters. Confirmation gates prevent drift. Wayfinder maps the fog. And at the end, you're not writing code — you're directing the system that writes it.

---

Research source: [yersham explainer](https://youtu.be/sFLT7ZAMUio)

Building agent workflows or structuring Skills? Come compare notes: [X](https://x.com/suenot), [Discord](https://discord.com/invite/2PtuMAg), [Telegram](https://t.me/suenot_dev).
