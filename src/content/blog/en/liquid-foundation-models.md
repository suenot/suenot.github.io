---
title: "Liquid Foundation Models: Continuous-Time AI for the Edge"
description: "Ramin Hasani's Liquid AI offers a different path from transformer brute force — liquid neural networks inspired by a 302-neuron worm, continuous-time dynamics that scale linearly, and foundation models small enough to run on a car's chip. The architecture intuition, the math breakthrough that made it possible, and where LFMs fit in the post-transformer landscape."
pubDate: 2026-07-25
tags: ["liquid-ai", "liquid-foundation-models", "liquid-neural-networks", "continuous-time-rnn", "edge-computing", "llm"]
draft: false
---

# Liquid Foundation Models: Continuous-Time AI for the Edge

🎬 **Watch on YouTube:** [Liquid Foundation Models: Continuous-Time AI for the Edge](https://www.youtube.com/watch?v=RGJqjEezWGk)

The story of how a 2-millimeter nematode with 302 neurons launched a $4.5B company says something uncomfortable about the trajectory of AI. While the industry burns cities-worth of electricity to push transformer parameters ever higher, Liquid AI asked a different question: what if the problem isn't scale, but architecture?

The answer comes from an unlikely source — *Caenorhabditis elegans*, a worm whose entire connectome fits in a 1970s database. Its 302 neurons manage 95 muscles, navigate complex environments, and avoid danger. And it does it on analog signals, not matrix multiplications.

Ramin Hasani's work at MIT transformed that biological insight into Liquid Foundation Models — an architecture that trades the transformer's brute force for continuous-time dynamics, linear inference costs, and models small enough to run on a car's head unit. Here's the intuition behind LFMs, the math breakthrough that made them possible, and where they actually make sense.

## The transformer trap: quadratic cost in a linear world

Transformers conquered AI because they scaled. More data, more parameters, more GPUs — better results. The scaling laws held, and the industry poured everything into that equation. But there's a hidden tax: **quadratic inference cost**.

Every transformer forward pass re-reads the entire context to compute attention. Double the context length? Roughly quadruple the compute. That's fine when you're running in a datacenter, but it's a dealbreaker for edge devices. A self-driving car can't wait 500ms while its transformer re-processes a video frame. A robot arm can't afford to ship sensor data to the cloud.

The architecture itself is the problem. Attention is powerful — it's what makes GPT fluent at reasoning across long contexts — but it's fundamentally a batch operation. Compute everything, compare everything, attend to everything. That's elegant for "read the whole internet and answer questions." It's wrong for "process this sensor stream and decide now."

Liquid AI's insight was to step back from discrete matrix operations to something closer to how biology actually works: **continuous-time dynamics**.

## From nematode to closed-form differential equations

The *C. elegans* connectome is fully mapped — every neuron, every synapse. That's not true for any larger organism. What makes the worm remarkable isn't what it has, but what it doesn't need. It doesn't need billions of parameters. It needs neurons that are complex *inside* rather than numerous *outside*.

Traditional neural networks simplified the neuron to a scalar weight and a nonlinearity. That was the price of making AI run on GPUs — you need dense matrix operations. But biological neurons are continuous-time dynamical systems. Their state evolves smoothly, governed by differential equations, not discrete timesteps.

Hasani's group tried to build neural networks that way — **continuous-time recurrent neural networks (CT-RNNs)** where each node is a differential equation, not just a weight. They hit a wall: a 100-year-old problem.

The interaction between two such neurons, described by a differential equation known since 1907, had no closed-form solution. Without that, you had to approximate numerically — break time into discrete steps, accumulate rounding errors, and watch the system collapse as you scaled beyond toy models. That's why liquid architectures stayed academic curiosities.

In 2019, Hasani solved the equation in closed form. The story goes that he wrote the solution on a blackboard in an hour — after seven years of work. That closed-form solution is what makes Liquid Neural Networks (LNNs) differentiable, trainable, and scalable without the numerical instability that doomed earlier attempts.

The blackboard itself is now in the MIT Museum as a historical artifact. But the real artifact is the architecture it unlocked.

## Liquid Neural Networks: adaptive weights in continuous time

An LNN isn't a transformer. It's a continuous dynamical system where each neuron's state evolves according to a differential equation that *can* be computed efficiently, thanks to that closed-form solution.

Two properties matter:

**Adaptive weights during inference.** Traditional networks freeze their weights after training. An LNN's weights continue to adapt based on incoming data. The system reconfigures itself on the fly, in a mathematically controlled way, rather than just routing through static parameters.

**Linear inference cost.** Because the dynamics are local and continuous, processing a new token doesn't require re-computing attention over the entire history. The cost scales linearly with sequence length, not quadratically.

The "liquid" metaphor is literal: the network's state flows and changes shape in response to input, like water adapting to the container it's poured into. It's not rerunning the same computation over bigger inputs. It's evolving continuously.

The compactness is striking. Early LNN demos showed a 12-neuron network capable of parking a car — a task that would take thousands of parameters in a traditional architecture. That's not magic; it's what you get when you put complexity *inside* each neuron rather than *between* neurons.

## From LNNs to Liquid Foundation Models

Pure LNNs are powerful but specialized. Liquid Foundation Models (LFMs) are the hybrid version — a pragmatic architecture for real-world deployment.

An LFM combines two layers:

**Layer 1: A lightweight transformer.** Handles discrete tokens — text, code, the stuff transformers are good at. Keeps the universal learning capability for general tasks.

**Layer 2: Continuous-time dynamics.** Handles continuous data — voice, video, sensor streams. This is where the liquid architecture shines. The operators are hybrid, built to run on diverse hardware (CPU, NPU, GPU) rather than assuming a datacenter-class GPU.

The routing is automatic. The model decides which layer handles which input based on what it is. Text goes to the transformer; sensor streams go to the continuous-time layer. You get the universality of transformers without paying the transformer tax on everything.

This hybrid approach is what makes LFMs practical at scale. You're not betting the whole model on one modality. You're using the right tool for each part of the job.

## Where LFMs actually make sense: the edge, not the cloud

Liquid AI's business strategy is revealing: they're not trying to compete with GPT-4 or Claude on general-purpose reasoning. They're selling into places where transformers literally can't run.

The Mercedes case is illustrative. Their in-car voice and vision system runs a full LFM locally on the car's processor. The entire model is 600MB — the size of a short video file. That means:

- **Zero latency.** No round-trip to the cloud for voice commands or computer vision.
- **Privacy by default.** Video and audio never leave the vehicle.
- **Over-the-air updates.** The model can be updated without servicing.

For Shopify, the pitch is different: trillions of tokens processed daily at a fraction of cloud inference costs. Linear inference costs compound at scale.

These aren't coincidental use cases. They're the places where **edge computing is mandatory** and where **privacy or latency rules out the cloud**. That's the wedge LFMs are driving into:

- Automotive (voice, vision, sensor fusion)
- Robotics (low-latency control loops)
- Enterprise data pipelines (high-volume processing)
- Anywhere power, latency, or privacy make cloud APIs a non-starter

The goal is explicit: 50 million devices with embedded LFMs by 2029. Not users — devices. This is infrastructure, not a chatbot wrapper.

## Architecture intuition without overclaiming

It's tempting to frame LFMs as "transformers but efficient." That's not quite right, and it misses the actual tradeoff.

LFMs aren't drop-in replacements for frontier transformer models. A 1B-parameter LFM won't match GPT-4 on reasoning benchmarks, and that's not the point. The point is that many workloads don't *need* GPT-4 — they need *good enough* intelligence that runs locally, cheaply, and immediately.

The architecture intuition is:

- **Continuous-time dynamics** for streaming data, where local state and low latency matter more than cross-token attention.
- **Hybrid operators** that can run on diverse hardware, not just GPUs.
- **Linear inference cost** for sequences that grow long.
- **Small enough to embed** in products where the AI isn't the product — it's a component.

This is closer to how microcontrollers displaced mainframes for embedded control than how transformers displaced RNNs for language modeling. It's a deployment play, not a research benchmark play.

## The ARM strategy: embedded AI as defensive moat

Liquid AI is explicit about this: they're not building a consumer-facing service. They're building the ARM of AI — the embedded layer that lives inside other people's products.

That's why AMD and Samsung are investors. They understand hardware constraints. It's why the pitch to CEOs isn't about scaling laws — it's about CAPEX, OPEX, and four-year product cycles.

The strategic insight is Hasani's interpretation of Alexander Wissner-Gross's thermodynamic definition of intelligence: **intelligence is the maximization of future optionality.** An intelligent system acts to keep its future choices open.

For Liquid AI, that means not tying themselves to cloud datacenters where the optionality is trapped in someone else's infrastructure. It means being on the device, in the product, where the customer can't switch out the AI without switching the product.

This is the ARM playbook exactly. You don't sell to the end customer. You sell to the product builder, and your intelligence becomes part of their bill of materials. A 4-10 year contract beats a monthly API subscription for retention.

## Where LFMs fit vs the transformer frontier

The question isn't "will LFMs replace transformers?" It's "which workloads go to which architecture?"

We're seeing the same pattern as [model routing](/en/blog/model-routing-explained): the win is in orchestration, not in picking one winner. Route your high-compute, general-reasoning queries to frontier transformer models where their capabilities justify the cost. Hand your high-volume, edge, or privacy-sensitive workloads to LFMs where they perform at parity for a fraction of the infrastructure.

The real competition is between **cloud APIs** and **embedded intelligence**. Liquid AI is betting that enterprises will prefer to own the inference stack rather than rent it, especially when that stack can live inside their product rather than their AWS bill.

That's not obviously true — cloud convenience is a powerful moat. But LFMs give enterprises a real alternative for the first time: models that are small enough, efficient enough, and capable enough to make embedded AI a serious option.

## The uncomfortable question: what else are we missing?

The nematode lesson is unsettling. A 302-neuron worm does more with less than we thought possible. Its connectome has produced four Nobel Prizes. And from that tiny system came a $4.5B company and an architecture that runs on a car chip.

What else is hiding in small biological systems? The research focused on *C. elegans* because it was tractable — we had the full connectome. But what about fruit flies? Mice? Octopuses?

While the industry pours money into scaling parameters, LFMs suggest that the bigger wins might come from deeper understanding of *how* neurons compute, not just how many you can stack. The math breakthrough that made LNNs possible was theoretical, not computational — finding a closed-form solution to a century-old equation.

That's a different kind of scaling law. Not more GPUs, but better mathematics.

---

Research source: [yersham explainer](https://youtu.be/iMdqzoLGkSw)

Building embedded AI or interested in model architecture? Come talk: [X](https://x.com/suenot), [Discord](https://discord.com/2PtuMAg), [Telegram](https://t.me/suenot_dev).
