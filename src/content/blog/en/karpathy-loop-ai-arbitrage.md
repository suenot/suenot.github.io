---
title: "The Karpathy Loop: A Framework for Agent Work and Value"
description: "A cautious framework for evaluating where an agent can perform bounded work, how to add acceptance gates, and where costs and risk still remain."
pubDate: 2026-07-19
heroImage: "/images/blog/karpathy-loop-ai-arbitrage-hero.png"
tags: ["ai-arbitrage", "karpathy", "agentic-engineering", "software-3", "self-improving-ai", "ai-economics"]
draft: false
---

# The Karpathy Loop: A Framework for Agent Work and Value

Watch on YouTube: [The Karpathy Loop & AI Arbitrage: Capturing Agentic Value](https://www.youtube.com/watch?v=PcwBgzTxSq8)

This article uses two author-defined ideas. "AI arbitrage" means a possible gap between the cost of an agent performing a bounded task and the price the market still assigns to human work. The "Karpathy Loop" is the label used here for a read, evaluate, and commit cycle. Neither is a guarantee of profit or a standard technical term.

## Software 3.0 and agent work

Andrej Karpathy has used the progression Software 1.0, Software 2.0, and Software 3.0 to describe hand-written code, learned neural-network weights, and programming models in natural language. Here, Software 3.0 is used more narrowly to describe directing agents that can perform parts of a workflow.

That changes the unit of work. Instead of only writing functions, a team can design the loop around an agent: what it reads, what evidence it evaluates, which actions it can take, and what must happen before a change is accepted.

## Where a cost gap might exist

An agent can reduce the cost of some repetitive, well-specified work. The gap matters only after accounting for setup, supervision, infrastructure, failures, compliance, and opportunity cost. A productivity tool that assists a person is different from a workflow that completes a bounded task without human intervention.

The useful question is not whether an agent is generally autonomous. It is whether it performs a particular task reliably enough, under stated constraints, for the remaining cost to be lower than the value of the result.

## Read, evaluate, commit

The loop has three stages. It reads the current task and environment, evaluates the available evidence against a goal, then commits an action. For this to behave like a ratchet, the commit step needs acceptance checks, version control or rollback, and monitoring. Otherwise an agent can preserve a bad decision as easily as a good one.

Each cycle should leave behind evidence that the next cycle can inspect: test results, a changed artifact, a review decision, or a recorded failure. The loop is only self-improving when feedback is reliable and the system uses it to revise behavior.

## A trading example needs limits

A hypothetical Polymarket agent shows the shape of the loop. It could read market prices and public information, evaluate an estimate, and submit a position. That is not investment advice. Estimates can be wrong, trades can lose money, feedback can overfit, and platform rules, local law, access controls, and settlement timing constrain any automation.

The example is useful only as a reminder that an execution loop must separate a model's estimate from a verified outcome and have a risk limit before it can act.

## Managing the capability gap

The capability gap is another author-defined term: the distance between what an agent has shown it can do reliably and the task it is asked to perform. A large gap increases the chance of incorrect actions. Keeping a person in the approval path can reduce some risk, but it does not remove the need for tests, budgets, and monitoring.

Expand autonomy gradually. Start with tasks that have observable results and safe rollback. Add broader authority only after the system has evidence that its acceptance gates work.

## What may become defensible

Models are widely available, but a product can still gain an advantage from its data, execution controls, domain knowledge, and integrations. None of those is a permanent moat by itself. They are the parts of the system a team can measure, improve, and own.

The framework is not a recipe for capturing a spread. It is a way to ask better questions about cost, evidence, risk, and where an agent should stop.

---

More: [X](https://x.com/suenot), [Discord](https://discord.com/invite/2PtuMAg), and [Telegram](https://t.me/suenot_dev).
