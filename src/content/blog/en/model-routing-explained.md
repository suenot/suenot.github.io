---
title: "LLM model routing: choosing a model for each request"
description: "Model routing selects among models according to task, quality, budget, latency, availability, and data-residency requirements. A practical guide to routing policies, evaluation, cache locality, and their tradeoffs."
pubDate: 2026-07-19
heroImage: "/images/blog/model-routing-explained-hero.png"
tags: ["llm", "model-routing", "ai-cost-optimization", "inference", "kv-cache", "infrastructure"]
draft: false
---

# LLM model routing: choosing a model for each request

Watch the source walkthrough on [YouTube](https://www.youtube.com/watch?v=vCV6OABWNoA).

Sending every request to one large model is simple, but it is rarely the only sensible policy. Different requests have different requirements for quality, latency, privacy, tool access, availability, and cost. Model routing makes that choice explicit.

The aim is not to find a universally cheap model. It is to choose a model and execution path that meet a defined service level for a particular request. A local open-weight deployment, for example, has its own capacity and operational costs even when it has no per-token API bill.

## Common routing policies

A cascade tries a lower-cost model first and escalates when a task-specific check says the answer needs more work. This can save work on simpler requests, but an escalation adds latency and the initial result must be evaluated carefully.

A pre-inference classifier estimates which route is appropriate before a model call. It can be trained from human labels, offline evaluations, synthetic labels, or preference data. Its usefulness depends on calibration against representative traffic, not on a generic difficulty score.

Semantic routing uses embeddings or other retrieval signals to select a route based on similar prior tasks. It needs an explicit feedback and retraining loop to improve. Embedding, storage, freshness, and authorization all remain part of its cost and correctness model.

These policies can be combined in a multi-stage routing system. The right arrangement depends on the application rather than on a fixed traffic split.

## Build the policy around requirements

Start with the requirements that actually differ between requests. A tenant may require a particular data region. An endpoint may have a tight latency budget. A high-impact action may need a stronger model, a deterministic tool check, or human review. A lower-risk extraction task may be well served by a smaller route.

Then evaluate the policy on held-out traffic that resembles production. Track task quality, escalation rate, total cost, time to first token, time per output token, cache hit rate, errors, and safety outcomes. A lower invoice is not a success if it comes from silently accepting worse answers.

## Confidence is evidence, not proof

Model probabilities and self-reported confidence are not generally calibrated measures of factual correctness. A wrong answer can still sound certain. Use task-specific offline calibration, structured validation, deterministic tools where available, and sampled human review for cases that matter.

LLM judges can be useful as one signal in an evaluation pipeline, especially for open-ended output. They also have biases and failure modes. Pin the judge version and prompt, test it against human judgments, and keep a sample of human review instead of treating it as an automatic guarantee.

## Cache locality is a routing concern

For self-hosted serving, prefix caching helps only when requests share token prefixes. A cache-aware scheduler can keep those requests near replicas that already hold the relevant cache blocks, while balancing locality against queue load. Unique prompts may receive little benefit.

The llm-d project reports a 57 times P90 time-to-first-token improvement and roughly twice the throughput in a benchmark with high prefix reuse, eight pods, and 16 H100 GPUs. Those figures compare its cache-aware scheduling with cache-blind scheduling in that setup. They are not a general result for all routing systems. See the [llm-d cache-aware scheduling guide](https://github.com/llm-d/llm-d/blob/main/guides/precise-prefix-cache-aware/README.md).

## What the research results say

[RouteLLM](https://arxiv.org/abs/2406.18665) reports up to 85% lower cost while retaining 95% of GPT-4 performance on MT-Bench for particular model-pair and routing settings. That is a benchmark result, not a promise that every product can reduce spend by the same amount.

For evaluating generated output, the MT-Bench and Chatbot Arena paper reports GPT-4 agreement with human preferences in a particular non-tie setup. It also documents position, verbosity, and self-enhancement biases in LLM judging. Read the [paper](https://arxiv.org/abs/2306.05685) before treating a judge score as ground truth.

Model routing is practical infrastructure, not a moat by default. Its value comes from a policy that is measured, revised, and matched to the risks of the product.

---

Come talk models and infrastructure with me: [X](https://x.com/suenot), [Discord](https://discord.com/invite/2PtuMAg), [Telegram](https://t.me/suenot_dev).
