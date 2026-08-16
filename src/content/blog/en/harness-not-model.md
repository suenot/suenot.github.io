---
title: "The harness matters as much as the model"
description: "An agent's model is only one part of its behavior. Prompts, tools, context, recovery, evaluation, and memory form the harness around it. What current research says, and how to measure its effect on quality and token use."
pubDate: 2026-07-10
heroImage: "/images/blog/harness-hero.png"
tags: ["harness", "claude-code", "tokens", "llm", "agents", "optimization"]
draft: false
---

# The harness matters as much as the model

The same language model can behave very differently when the surrounding system changes. A task description, available tools, context selection, retry policy, evaluator, and memory all affect the trajectory an agent takes. Together, these parts form its harness.

That does not make the model irrelevant. It means model quality is only one variable in an agentic system. Before upgrading a model or drawing conclusions from a token bill, it is worth examining the runtime around it.

## What belongs in a harness

A harness frames the task, exposes tools, chooses relevant context, validates actions, records results, and decides what to do after an error. Claude Code, Codex, Cursor, and a custom agent loop all make different choices in these areas.

Those choices can change both quality and cost. A clear action schema may prevent a failed call. Relevant file excerpts can reduce unnecessary reading. A bounded retry policy can stop a loop. None of these controls guarantees success, but each can be evaluated against a specific failure mode.

## Token use follows the trajectory

Tokens accumulate over the entire trajectory, not just the final successful answer. Repeated tool calls, broad file reads, malformed actions, and unbounded retries can increase both input context and generated output. Better context selection or recovery may reduce that waste, but the gain depends on the task, model, tools, and policy.

Measure the full system: task success, latency, input and output tokens, retry rate, tool errors, and the cost of evaluation. A lower token count is not useful if it comes from skipping necessary work or accepting worse answers.

## What Life-Harness reports

[Life-Harness](https://arxiv.org/abs/2605.22166) studies frozen LLM agents in seven deterministic environments drawn from tau-bench, tau²-bench, and AgentBench. It adds an environment contract, procedural skill, action realization, and trajectory regulation around the model. The model weights and environments remain fixed; the harness is evolved from training trajectories rather than through weight updates.

The authors report improvements in 116 of 126 model-environment settings across 18 tested backbones, with an average relative improvement of 88.5%. They also report transfer from a harness evolved on Qwen3-4B-Instruct trajectories to 17 other tested models. These are success-rate results in the paper's environments. They are not a direct measurement of general token savings or production reliability.

The four components suggest useful design questions. Does the environment contract prevent a predictable invalid action? Does a stored procedure reduce a repeated recovery step? Does action realization make tool calls easier to validate? Does trajectory regulation stop a demonstrable loop? Answer those questions with tests rather than assuming the layer works.

## What Meta-Harness reports

[Meta-Harness](https://arxiv.org/pdf/2603.28052) searches over harness code in an outer optimization loop, using source code, evaluations, and traces from prior candidates. Its reported results cover online text classification, RAG mathematics, and agentic coding. In its online text-classification setting, the paper reports up to four times fewer context tokens than a particular context-management baseline, alongside a 7.7-point improvement.

That figure is scoped to the paper's benchmark and baseline. It should not be read as a general fourfold reduction for code tasks or every agent. The broader lesson is more durable: the harness can be an object of systematic experimentation, not a fixed wrapper around a model.

## Improve the system deliberately

Start with one failure you can observe. Reduce unnecessary tool output. Provide evidence with the task rather than asking the model to rediscover it. Isolate risky exploration, cap retries, and add checks where a deterministic tool can answer a question. Then compare the old and new policy on representative work.

This is harness engineering. It complements model selection, retrieval, tools, and evaluation rather than replacing them. The useful goal is not a slogan about models. It is a system that can show why it succeeded, where it failed, and what the change cost.

---

Companion reading: [How to Save Tokens in LLM](/blog/saving-tokens-llm).
