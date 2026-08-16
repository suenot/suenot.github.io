---
title: "Kimi K3: An Open-Weight MoE Model at Scale"
description: "Kimi K3 is Moonshot AI's 2.8-trillion-parameter open-weight Mixture-of-Experts model. A practical look at its architecture, the vendor's evaluations, API pricing, deployment limits, and the security responsibilities that come with open weights."
pubDate: 2026-07-19
heroImage: "/images/blog/kimi-k3-hero.png"
tags: ["kimi-k3", "moonshot-ai", "open-weights", "mixture-of-experts", "agentic-coding", "llm"]
draft: false
---

# Kimi K3: An open-weight MoE model at scale

Watch the source walkthrough on [YouTube](https://www.youtube.com/watch?v=N6oF9O0vGXE).

Kimi K3 is Moonshot AI's open-weight model, released under the Kimi K3 License. It has 2.8 trillion parameters in total, but its mixture-of-experts design activates 104 billion parameters for each token. That scale makes it an interesting release, but it does not turn every benchmark or demo into a general guarantee. The useful question is simpler: where does K3 fit, and what does it cost to run?

## The model in practical terms

K3 has 896 routed experts and two shared experts. For a token, the router selects 16 of the routed experts, which is why the active parameter count is far below the 2.8 trillion total. Moonshot also lists a 1,048,576-token context window, native vision support, Kimi Delta Attention, and Attention Residuals among the model's technical features.

Moonshot reports about 2.5 times the scaling efficiency of K2. That is the company's own aggregate claim, tied to the architecture, training approach, and data work, rather than to one component alone.

Those details explain why K3 is designed for large contexts and long-running tasks. They do not tell you whether it will suit a particular repository, product, or agent setup. That still needs a test on the workload you care about.

## What the walkthrough demonstrates

The video gives a useful sense of the kinds of tasks its author tried. It shows browser interfaces with interactive state, a browser game with rope physics and collision detection, a compiler exercise, GPU-kernel work, and a long architectural migration described as 122 steps.

Treat these as demonstrations, not a benchmark suite. A polished interface in a video does not prove that the same model will understand an unfamiliar design system, and a successful migration does not establish how it handles every codebase. The value of the examples is more concrete: they suggest test cases worth running yourself, especially when a task needs a large working context and repeated tool use.

## Reading the benchmark claims carefully

Moonshot's model card reports K3 scores of 42.0 on SWE-Marathon and 77.8 on ProgramBench under its own evaluation setup. In the same comparisons, the cited Fable and Sol results are 35.0 and 39.0 on SWE-Marathon, and 76.8 and 77.6 on ProgramBench.

Those are narrow results, not a universal ranking. The same model card shows K3 behind some competitors on other coding evaluations, and benchmark harnesses, settings, and fallback behavior can differ. If you are choosing a model for sustained engineering work, use the published numbers as a starting point, then run an evaluation that resembles your own tasks.

## API access and self-hosting

Moonshot publishes separate API prices for different token types: $0.30 per million cache-hit input tokens, $3 per million cache-miss input tokens, and $15 per million output tokens. Its technical post says coding traffic can exceed a 90% cache-hit rate on its Mooncake infrastructure. That is an operational claim from Moonshot, not a price promise for every application.

The weights can also be deployed independently, but the hardware bill remains serious. In MXFP4, 2.8 trillion parameters take roughly 1.4 TB for the raw weights alone, before runtime overhead. Open weights give a team more control over where inference runs. They do not make a model of this size a casual local install.

## Open weights move responsibility outward

The video discusses a security-audit scenario to make this point. Its claims about autonomous vulnerability discovery are a reported demonstration, not enough evidence for a broad claim about the model's safety behavior or the absence of safeguards.

The broader trade-off is real enough without the drama. A team that runs an open-weight model can keep a workload inside its own environment and shape the surrounding controls. It also owns more of the operational and security work: access policy, tool permissions, logging, review, sandboxing, and incident response. The model weights do not supply those controls by themselves.

## Where K3 may belong in a stack

K3 is one candidate for workloads that benefit from a very long context or need an open-weight deployment. A proprietary model may still be the better fit for other tasks, depending on quality, latency, integrations, and the cost of supervision. Model routing remains a practical option: assign work based on measured results rather than treating any release as the single winner. The same idea applies to [model routing](/blog/model-routing-explained).

For the underlying specifications and evaluation notes, read Moonshot's [model card](https://huggingface.co/moonshotai/Kimi-K3), [technical report](https://arxiv.org/abs/2607.24653), [technical post](https://www.kimi.com/ja-jp/blog/kimi-k3), and [pricing page](https://www.kimi.com/resources/kimi-k3-pricing).

---

Building with open models or agent swarms? Come compare notes: [X](https://x.com/suenot), [Discord](https://discord.com/invite/2PtuMAg), [Telegram](https://t.me/suenot_dev).
