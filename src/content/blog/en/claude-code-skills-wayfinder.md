---
title: "Skills, Wayfinder, and a Workflow for Claude Code Agents"
description: "A source-based look at a skills-driven workflow: on-demand instructions, technical specifications, ticketed planning, and review boundaries for Claude Code agents."
pubDate: 2026-07-25
heroImage: "/images/blog/claude-code-skills-wayfinder-hero.png"
tags: ["claude-code", "skills", "wayfinder", "agent-workflow", "llm-orchestration"]
draft: false
---

# Skills, Wayfinder, and a Workflow for Claude Code Agents

Watch on YouTube: [Claude Code Skills & Wayfinder: Agent Tool Discovery Explained](https://www.youtube.com/watch?v=fzljXADV9cM)

Long agent sessions tend to hit familiar problems: context grows, architectural decisions get lost, and the agent starts following an older interpretation of the task. The workflow described in the source video calls its components Skills, Wayfinder, and Specifications. It uses packaged instructions, ticketed dependencies, and explicit confirmation before implementation.

This is not a claim about every Claude Code setup. It is one way to organize a development process around how a language model receives instructions and context.

## What the workflow calls a Skill

In the source workflow, a Skill is a Markdown instruction set that the model loads when it is triggered. It can contain prompts, examples, and rules for a class of work. The video describes Skills as reusable across sessions, version-controlled beside the code in `~/.claude/skills/`, composable with other Skills, and loaded only when needed.

The naming is deliberate. The workflow assumes that terms such as "PRD" and "Specification" can steer a model toward different associations. A PRD may pull the conversation toward business analysis, metrics, and stakeholders. A specification may pull it toward architecture, APIs, data structures, and constraints. The underlying request can be similar, but the framing changes.

That is why the workflow renames `PRD` to `SPEC` and calls its task generator `Tickets`. In the video's interpretation, these are semantic choices rather than cosmetic labels. "Tickets" is meant to stay platform-neutral, while "Tasks" can evoke the conventions of systems such as GitHub or Linear.

## An interview with constraints

The source contrasts this with sending an agent a large prompt and hoping it finds the right path. It names three common outcomes: a batch of architectural questions, implementation before the user confirms the direction, or a self-interview loop that produces hypotheses without outside grounding.

Its proposed interview Skill has three boundaries:

1. It asks one question at a time.
2. It waits for explicit confirmation before implementation.
3. It separates facts from decisions: the agent can inspect documentation and code, while people make product and architectural choices.

The distinction is practical. Facts can be investigated. Decisions still require someone to choose among trade-offs.

## Specifications and tickets

After confirmation, the workflow uses a Specification and then Tickets. `/SPEC` records architecture, APIs, data structures, and constraints. `/Tickets` turns that document into platform-neutral implementation steps that can be exported to a tracker when needed.

The video recommends keeping each ticket within one AI session's workable context and attention budget. If a ticket grows beyond that, break it down again. This is an attempt to replace one large ambiguous request with smaller pieces whose boundaries are visible before coding begins.

## Implementation and review are separate

The Implement Skill described in the source follows TDD in small slices: write a test, write code that passes it, run type checks, and continue. It leaves refactoring for Code Review. The workflow's premise is that implementation and broader restructuring need different kinds of attention, and combining them can consume too much context.

The source also describes two independent review roles, one for alignment with the Specification and another for code standards. A later review pass looks for terms from Martin Fowler's *Refactoring*, including *feature envy*, *primitive obsession*, *duplicate code*, and *long chains of messages*.

The author of the video treats those terms as useful shorthand. A specific smell can give the model a more precise target than a generic warning about coupling or code quality.

## Wayfinder maps work before coding

Wayfinder is the planning component in this workflow. It is meant for work that exceeds the scope a single session can handle reliably. According to the video, it creates a map of sub-tickets in a project tracker, records dependencies, and assigns each ticket a type:

- Research: background investigation that produces a Markdown file.
- Grill: an interview for decisions that need human input.
- Prototype: a quick artifact for visual evaluation.
- Routine: configuration or setup that needs no dialog.
- Manual: work explicitly left to a person.

Wayfinder itself is not meant to write the implementation. It maps the work, then the implementation Skill handles individual tickets. The tracker holds the context between sessions and makes dependencies visible to the team.

## What this approach can buy you

Ad-hoc prompts need to be rebuilt as the project changes. The workflow instead treats its instructions as versioned artifacts that can be reused, composed, reviewed, and rolled back. Its stages are Plan, Break Down, Execute, and Verify. Each has a separate session and a defined boundary.

That structure will not make every task predictable. It can, however, make it easier to see where a process lost context or skipped a decision.

The video also cites adoption figures for the repository or platform it discusses: about 160,000 GitHub stars and 7 million downloads at the time of the video. Those numbers are source claims, not independently verified here. The broader recommendation is to use expensive general reasoning where it is justified, and use structured pipelines for repeated agent work. This is similar to the trade-off discussed in [model routing](/en/blog/model-routing-explained).

## The developer's role

When an agent can inspect documentation, prototype an interface, write tests, and review code, the developer's work shifts toward making choices under uncertainty. The person still decides the architecture, trade-offs, and product direction. The agent works within the boundaries that person set.

That is the useful part of the workflow: package instructions, make decisions explicit, and split work before the context becomes unmanageable.

---

Research source: [source video](https://youtu.be/sFLT7ZAMUio)

More: [X](https://x.com/suenot), [Discord](https://discord.com/invite/2PtuMAg), and [Telegram](https://t.me/suenot_dev).
