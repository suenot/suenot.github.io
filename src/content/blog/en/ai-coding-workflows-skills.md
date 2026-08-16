---
title: "AI Coding Workflows: From Vibe Coding to Engineering Discipline"
description: "How executable skills, project memory, focused tasks, fresh sessions, and independent review make AI-assisted coding predictable."
pubDate: 2026-08-01
tags: ["AI coding", "vibe coding", "context engineering", "software architecture", "ADR", "TDD", "AI agents"]
draft: false
---

# AI Coding Workflows: From Vibe Coding to Engineering Discipline

Video: [AI Coding Workflows: From Vibe Coding to Engineering Discipline](https://www.youtube.com/watch?v=1J3Nqztz3DI)

Matt Pocock's skills repository is built around a familiar problem: coding agents produce code quickly, but weak feedback loops can leave the project harder to change. The team then spends the time it saved untangling technical debt.

The Russian source video walks through Matt Pocock's engineering skills. Their process lives in files and commands the agent can follow, so the same reminders do not have to be repeated in every prompt.

## What a skill installs

The `skills.sh` installer can copy a skill's instructions, scripts, and supporting files into the repository. For Matt Pocock's collection, the command is `npx skills@latest add mattpocock/skills`. The files then travel with the project and can be changed by the team.

The collection separates skills by who starts them. User-invoked skills run only when someone calls them directly, for example `/grill-me`. Model-invoked skills hold reusable engineering practices and can be selected automatically when the task fits. That distinction keeps explicit workflows under human control without requiring a separate prompt for every reusable process.

## Questions come before implementation

`/grill-with-docs` asks about the change before anyone writes code. It pushes on requirements, terminology, edge cases, and unresolved decisions. Implementation begins after the requirements are clear and the consequential decisions are recorded in the project docs.

That reduces the risk of the agent filling an unresolved question with the first plausible assumption. The code may look coherent while solving a problem the team never chose.

## Keep project memory outside the chat

A long conversation is poor project documentation. `CONTEXT.md` gives the team and the agent a shared glossary. ADRs record architecture decisions and the reasons behind them. Rejected alternatives are added when they are worth remembering.

The repository uses "materialization cascade" as an example. Once that term has a precise meaning in `CONTEXT.md`, it can replace a paragraph about lessons receiving a place in the file system. There is no universal token-saving figure here. The practical gain is that later sessions do not need the full explanation again.

## Turn the discussion into work another session can pick up

After the questions are answered, `/to-spec` turns the conversation into one specification. `/to-tickets` then breaks that document into small vertical slices and records the dependencies between them. The workflow handles one ticket per fresh context.

That makes a clean handoff possible. A new session can start from one ticket and explicitly read `CONTEXT.md`, the relevant ADRs, and the specification. It does not need the implementation history of the previous ticket to understand the next one.

## Review without the implementation story

The `code-review` skill sends the diff to two reviewers in parallel. One checks it against the specification, while the other checks the project's standards. They work in separate agent contexts and do not receive the implementation agent's explanation.

Tests provide an executable boundary as well. The `tdd` skill uses a red and green loop: write a failing test, then add only enough code to make it pass. A passing test does not prove that the whole specification is correct, but it gives the reviewer a check that can be run again.

---

*Sources: [Russian source video](https://www.youtube.com/watch?v=Vi2nU1qxueg) and [mattpocock/skills at bfdaef8](https://github.com/mattpocock/skills/tree/bfdaef8e989a5c81160e74bc5043bd434da49cac).*

Elsewhere: [X](https://x.com/suenot), [Discord](https://discord.com/invite/2PtuMAg), and [Telegram](https://t.me/suenot_dev).
