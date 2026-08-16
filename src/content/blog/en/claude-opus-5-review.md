---
title: "Claude Opus 5: The Performance and Cost Claims in One Review"
description: "A source-attributed review of the performance, cost, self-verification, and safety claims made about Opus 5 in a frontier-model comparison."
pubDate: 2026-07-25
heroImage: "/images/blog/claude-opus-5-review-hero.png"
tags: ["claude-opus-5", "anthropic", "agent-coding", "llm-benchmarks", "ai-costs", "frontier-models"]
draft: false
---

# Claude Opus 5: The Performance and Cost Claims in One Review

Watch on YouTube: [Claude Opus 5 Review: Anthropic's Frontier Reasoning Model](https://www.youtube.com/watch?v=SFkO8as1vDw)

The source video argues that Opus 5 combines higher benchmark performance with lower cost than several frontier rivals. That is an attractive claim, but the numbers and comparisons in this article come from that video and are not independently verified here.

## The benchmark comparisons in the video

The video reports that Agent Terminal Coding rose from 21% for Opus 4.8 to 43% for Opus 5. It gives an Arc AGI result of 30.5% for Opus 5, compared with 15% for the earlier model. Arc AGI uses abstract visual puzzles designed to limit memorization.

It also compares Opus 5 with Fable 5 and GPT 5.6 SL:

- 64.7% for Opus 5 and 63.9% for Fable 5 on multidisciplinary tasks.
- About 91% for both Opus 5 and GPT 5.6 SL on data-finding tasks.
- 26% for Opus 5 and 17.4% for Fable 5 on Automation Bench, which the video describes as multi-step business-process automation.

These figures are useful only with their task definitions. They do not establish a general ranking for every coding, reasoning, or automation job.

The same source gives several cost examples. One Apple-style 3D landing-page test reportedly cost $0.69 with Opus 5 and $0.94 with Fable 5. It claims 60 to 70% success on batch tasks for $9 to $22 with Opus 5, while reaching 70% with Fable 5 costs nearly $50. For Humanity's Last Exam, it gives a range of 56 to 65% on university-level problems at about $3 per problem. These remain examples and source claims, not pricing guidance.

## What the examples try to show

The video presents spatial and simulation work as evidence of broader coding ability: interactive 3D galleries with positional audio, a rocket-launch simulator with orbital mechanics, a fractal generator, and ecosystem simulations with predator-prey dynamics. It also describes a quadcopter simulator that attached a landing sound to wheel contact.

One example did not work cleanly. In a sneaker configurator test, the rendered result glitched. According to the video, the attempt still used a compositing pipeline with normal maps, reflection masks, and real-time shadow calculations rather than a static image with color filters. That is an observation about one attempt, not a promise that the model will build such a pipeline in every similar task.

## The explanation for the cost claim

The video explains the proposed cost advantage through internal agent cycles. In its account, Opus 5 generates hypotheses, writes code, runs it in isolated environments, catches bugs, and revises before returning a result through the API. This is not independently documented here as a model-specific mechanism.

The comparison is with a human-driven retry loop: prompt the model, find an error, send the error back, and pay to reload the conversation context. The source calls internal cycles an order of magnitude cheaper than that retry tax. Treat this as a design hypothesis rather than a measured rule for all workloads.

For agent workflows that write, test, and revise code, the distinction between internal and external iteration is worth measuring. The related [agent harness architecture](/en/blog/agent-harness-architecture/) article looks at the surrounding system that makes those loops possible.

## Safety figures need the same caution

The source assigns Opus 5 an "Alignment Score" of 2.36, compared with 2.85 for Opus 4.8, 2.81 for Mits 5, and 3.35 for Son 5. It describes this score as a measure of destructive behavior and links the Mits 5 figure to a 2025 server-vulnerability incident and federal intervention.

Those labels, scores, and the incident description are claims from the video. Without the underlying methodology, they are not enough to draw a firm conclusion about relative safety.

## The strategic argument

The video places Opus 5 in a broader argument about open and closed frontier models. It points to [Kimi K3](/en/blog/kimi-k3/) as an open-weight challenge to the idea that advanced capability exists only behind closed APIs. It argues that models at this level could replace parts of junior engineering and analyst work, then speculates that inexpensive public access to frontier models may not last as capabilities become more strategically valuable.

That is a forecast, not a fact. The practical takeaway is less dramatic: model choice alone rarely determines the outcome. Routing, inference infrastructure, verification, and the workflow around the model all affect cost and reliability. See [model routing](/en/blog/model-routing-explained/) and [KV cache and paged attention](/en/blog/kv-cache-paged-attention/) for two parts of that infrastructure.

---

Research source: [source video](https://youtu.be/UqWulCRWHjk)

More: [X](https://x.com/suenot), [Discord](https://discord.com/invite/2PtuMAg), and [Telegram](https://t.me/suenot_dev).
