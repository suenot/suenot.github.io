---
title: "AI Coding Workflows: From Vibe Coding to Engineering Discipline"
description: "How executable skills, project memory, focused tasks, fresh sessions, and independent review make AI-assisted coding predictable."
pubDate: 2026-08-01
tags: ["AI coding", "vibe coding", "context engineering", "software architecture", "ADR", "TDD", "AI agents"]
draft: false
---

# AI Coding Workflows: From Vibe Coding to Engineering Discipline

🎬 **Watch on YouTube:** [AI Coding Workflows: From Vibe Coding to Engineering Discipline](https://www.youtube.com/watch?v=1J3Nqztz3DI)

*Research source: [the original Russian video](https://www.youtube.com/watch?v=Vi2nU1qxueg)*

Generative AI makes code cheap to produce. That is useful until the speed of generation becomes the speed of technical debt. A few vague prompts can turn a project into a monolith where changing one variable breaks three unrelated modules.

The workflow discussed in the source video takes the opposite approach: add structure before asking a model to implement anything.

## Skills are executable project tools

An AI skill is more useful when it is an executable project capability rather than a paragraph copied into a chat. A CLI can install instructions, scripts, and conventions directly into a repository. The coding agent then sees those rules as part of its working environment.

There are two useful categories. User-invoked skills handle explicit workflows such as analysis or specification. Model-invoked skills handle routine checks such as inspecting a directory or running a type check. This removes repetitive prompting while keeping the behavior close to the codebase.

## Ask questions before writing code

The first high-leverage skill is deliberately adversarial: interview the idea. Instead of guessing missing requirements, the agent asks a series of precise questions about boundaries, failure modes, data, and integrations. Only after the blind spots are visible should implementation begin.

This is not bureaucracy. It is a guard against the model's default tendency to be agreeable and fill in missing details with plausible assumptions.

## Project memory needs a compact language

Long conversations are a poor substitute for durable project memory. A `context.md` file can hold the current architecture, constraints, and shared glossary. ADRs (architecture decision records) capture both the decision and why alternatives were rejected.

A domain glossary also reduces ambiguity. A compact term such as "materialization cascade" can replace a paragraph-long description once the team and the model share the same vocabulary. The source video presents these ideas as a way to reduce repeated context and preserve intent across sessions; exact token savings depend on the project and model.

## Compile the conversation into a specification

When the interview is complete, compile the dialogue into one strict specification. Then split that specification into small, traceable microtasks. Each task should fit comfortably inside the model's effective focus zone.

After a task is done, close the session. The next task starts with a clean short-term context while receiving the durable `context.md`, ADRs, and specification. This separation gives the model a fresh workspace without erasing the project's long-term memory.

## Independent review beats self-approval

The agent that wrote the code should not be the only agent judging it. A separate reviewer receives the original task and the resulting code, not the implementation agent's narrative. It checks two axes: does the code satisfy the specification, and does it meet architectural standards such as avoiding duplication and code smells?

Tests make the boundary even stronger. With TDD, failing tests define the contract before implementation. The model must produce behavior that passes an executable check instead of persuading a human with a plausible explanation.

The broader lesson is simple: AI multiplies both engineering discipline and engineering neglect. Skills, project memory, focused tasks, fresh sessions, independent review, and tests turn raw generation speed into a maintainable workflow.

---

Building with AI agents? Compare notes on [X](https://x.com/suenot), [Discord](https://discord.com/invite/2PtuMAg), or [Telegram](https://t.me/suenot_dev).
