---
title: "How I choose models for Codex subagents"
description: "A router selects Luna or Sol before a Codex subagent starts. Here is how it works, what the Django runs cost, and where the benchmark falls short."
pubDate: 2026-09-25
heroImage: "/images/blog/codex-subagent-model-routing-hero.png"
tags: ["codex", "model-routing", "jev", "benchmarks", "ai-cost-optimization"]
draft: false
---

# How I choose models for Codex subagents

I often hand a subagent a small job: find a method definition, collect a few values from files, or check a claim against source code. Sol high handles those jobs, but using it for every small request is expensive at API rates. I added a short model decision before each subagent starts.

[Codex Jev Router](https://github.com/suenot/codex-jev-router) takes a brief task summary and selects a Codex model and reasoning level. The subagent then works with the usual Codex tools. The router does not switch models mid-task or select tools for the agent.

## Before the subagent starts

The parent agent is instructed to send the decision engine a short summary without source code, logs, or secrets. Jev is the default. A local engine such as Laya, or another supported adapter, can take its place. The engine returns a typed answer; router rules check confidence and select a profile.

Luna low can handle exact lookup. Luna medium is available for bounded work across a few files. A short task that still needs Sol judgment can go to Sol low. Uncertain decisions fall back to Sol high. Sol ultra is reserved for exceptional difficulty or a verified Sol failure. The chosen `model` and `reasoning_effort` are passed explicitly to `spawn_agent`.

This currently depends on the parent agent following Codex instructions before a spawn. I do not describe it as an enforced interception of every spawn: a Codex CLI check found that `PreToolUse` did not run for this call.

## Cost on the tasks I checked

For the [separate benchmark repository](https://github.com/suenot/codex-jev-router-benchmarks), I used a pinned Django checkout. Three source-reading tasks each ran three times with clean Sol high and three times with the router-selected profile. All nine pairs produced answers that matched the pinned source. I also ran one bounded SWE-bench Verified Django fix three times per arm and checked it with the official local regression test.

| Tasks | Clean Sol high | Router profile plus Jev | Difference | Check |
| --- | ---: | ---: | ---: | --- |
| Django source reading, 9 pairs | $0.214806 | $0.062317 | 71.0% lower | 9/9 correct in each arm |
| Bounded Django fix, 3 pairs | $0.555916 | $0.009668 | 98.3% lower | Official test passed 3/3 in each arm |

These figures apply [Standard API prices](https://developers.openai.com/api/docs/pricing) for short context to measured input, cached input, and output tokens for each model. The routed total includes the separately estimated Jev decisions. It is not a measured Codex subscription bill. The [report](https://github.com/suenot/codex-jev-router-benchmarks/blob/main/BENCHMARK.md#estimated-api-cost-savings) has the traces, raw counts, and formula.

The fix needs a qualification. Its first Luna medium run used an experimental profile based on Jev's preference before the router threshold changed. After that change, three repeated live decisions selected Luna medium. I ran the official local regression test, not a full SWE-bench Docker evaluation.

## What remains unknown

I chose tasks where a cheaper profile seemed plausible. These results do not estimate the average bill across arbitrary subagent work. The report also includes same-model controls where usage varied between runs. In an earlier pytest fix, both arms failed the test and the routed arm cost more. That case belongs beside the successful ones.

The next useful check is a task mix fixed in advance, with the cost of retries and failures included alongside answer quality. For now, the router gives me a configurable way to hand narrow work to Luna. The [setup instructions](https://github.com/suenot/codex-jev-router#instructions-for-codex) and [benchmark materials](https://github.com/suenot/codex-jev-router-benchmarks) are public if you want to test the choice on your own tasks.
