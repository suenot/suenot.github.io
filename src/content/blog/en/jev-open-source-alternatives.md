---
title: "Thirteen open-source Jev alternatives and what each one does"
description: "A practical guide to Laya, Kev, SemIf, and ten more typed-decision projects, including their limits for Codex subagent routing."
pubDate: 2026-09-25
tags: ["jev", "open-source", "model-routing", "codex"]
draft: false
---

## TL;DR

- [Laya](https://github.com/NandhaKishorM/laya)
- [Kev](https://github.com/jaredpalmer/kev)
- [PlayJev](https://github.com/OmniJev/PlayJev)
- [SemIf](https://github.com/TheoLeeCJ/SemIf-OpenJev)
- [NanoJev](https://github.com/TianyuCodings/NanoJev)
- [jevlike](https://github.com/vinnylarouge/jevlike)
- [simple-jev](https://github.com/featherless-ai/simple-jev)
- [AnyJev](https://github.com/nokia-applied-research/AnyJev)
- [mini-jev](https://github.com/r-ms/mini-jev)
- [open-jev (nico-martin)](https://github.com/nico-martin/open-jev)
- [minojev](https://github.com/zeredy879/minojev)
- [Open-Jev (Zefan-Cai)](https://github.com/Zefan-Cai/Open-Jev)
- [open-jev (daseinlabs)](https://github.com/daseinlabs/open-jev)

Jev takes a state and a set of questions, then returns short typed decisions: a choice, a score, or a number. In [my Codex subagent router](https://github.com/suenot/codex-jev-router), that decision helps choose the model and reasoning level for the next agent. The projects below include local servers, training tools, and even a model trained on game frames. Similar names hide quite different jobs.

## Laya

[Laya](https://github.com/NandhaKishorM/laya) makes several typed decisions in one pass. It has a Python library and a local server with a Jev-compatible HTTP interface. Its English and multilingual checkpoints make the latter relevant when a routing summary is written in another language. It also supports batching. I would still test accuracy and calibration on my own Codex tasks before relying on its choices.

## Kev

[Kev](https://github.com/jaredpalmer/kev) provides a family of open models at different sizes and a local `/v1/systemone` endpoint. Its README suggests starting with 4B; larger versions need substantially more memory. This is a direct candidate for replacing a remote decision engine when local compute is available. The published measurements describe the author's tests, not Codex subagent routing.

## PlayJev

[PlayJev](https://github.com/OmniJev/PlayJev) chooses actions in browser games from a frame and a list of legal moves. It returns choice probabilities through `/v1/systemone`, but the input is visual and game-specific. Choosing an agent for a text search would need a different model or new training. Its value here is showing how typed decisions can work on images.

## SemIf

[SemIf](https://github.com/TheoLeeCJ/SemIf-OpenJev), previously OpenJev, reproduces the decision format with open language models. It reads option scores from logits and can run with PyTorch, MLX, or llama.cpp. Its CLI accepts JSONL, so Codex needs an adapter. It is a way to test local routing without a dedicated decision checkpoint, although starting the model for every request may erase a latency gain.

## NanoJev

[NanoJev](https://github.com/TianyuCodings/NanoJev) uses a small Qwen backbone with heads for choices, booleans, and scores. The repository includes weights, data, training code, and a local `/api/evaluate` server. Its released model was trained mostly on game tasks. Whether those decisions transfer to Codex task descriptions remains an open measurement.

## jevlike

[jevlike](https://github.com/vinnylarouge/jevlike) is closer to a research kit. It can train a small byte encoder or score arbitrary text options with a frozen Hugging Face encoder. Training and prediction run from a CLI. There is no demonstrated result for distinguishing an exact file lookup from difficult diagnosis in Codex, but the project gives you a way to build and test that classifier with your own examples.

## simple-jev

[simple-jev](https://github.com/featherless-ai/simple-jev) turns the logits of a compatible open language model into a typed decision instead of generating JSON. Its Transformers and PyTorch server exposes `/v1/classifier` and a `/v1/systemone` alias. The answer depends on the underlying model and wording of the options; its scores are not automatically calibrated probabilities of success. It is convenient for trying a model you already run locally.

## AnyJev

[AnyJev](https://github.com/nokia-applied-research/AnyJev) offers three levels for adapting an existing language model: position-bias correction without labels, temperature calibration, and a fitted head on hidden states. Later levels need examples from your own work, and the head requires access to internal model states. This fits a router tuned to a known task mix. The simplest mode may require multiple model passes, so measure its latency.

## mini-jev

[mini-jev](https://github.com/r-ms/mini-jev) compares logit-based option scoring on a frozen Qwen model against grammar-constrained JSON generation. It is more of a teaching and benchmark project than a ready production router. Its scores rank options but do not guarantee calibrated probabilities. It helps expose when short decisions save work and when, for example with a simple boolean, that advantage disappears.

## open-jev by nico-martin

[nico-martin's open-jev](https://github.com/nico-martin/open-jev) runs typed decisions in the browser with Transformers.js and WebGPU or WASM. Its TypeScript API is `OpenJev.load().decide()`, and it supports several models, including Kev variants. This is useful for local decisions inside a web app. Codex needs a Node bridge, and the first run has to download model weights.

## minojev

[minojev](https://github.com/zeredy879/minojev) pairs a frozen Qwen3-1.7B model with a small trainable decision head. It serves typed questions through local `/score`, publishes weights and data, and can run on a CPU. Its authors also report a drop on an out-of-distribution task. I would evaluate it on actual Codex assignments before using its published metric to route agents.

## Open-Jev by Zefan-Cai

[Zefan-Cai's Open-Jev](https://github.com/Zefan-Cai/Open-Jev) publishes trained 2B, 9B, and 27B variants with a decision head and calibration. It has a local `/v1/systemone` server, data, and training tools. Of the three similarly named projects here, this one looks most like a ready model family; runtime cost varies substantially with size. Its benchmark results still need checking against subagent routing tasks.

## open-jev by daseinlabs

[daseinlabs' open-jev](https://github.com/daseinlabs/open-jev) scores options on Gemma 3 4B, reusing a shared prefix and batching work. It offers local `/score` and `/v1/systemone` endpoints, MLX on Mac, PyTorch on other platforms, and optional task-specific head training. Gemma weights require accepting access terms on Hugging Face. It is a practical Mac experiment if you already have local inference running.

## Choosing one for Codex

For a local endpoint with a familiar format, I would start with Laya, Kev, simple-jev, or one of the server-based Open-Jev projects. NanoJev, jevlike, AnyJev, and minojev are more interesting if I want to train for my own assignments. SemIf and mini-jev help examine the mechanics of a short decision. PlayJev targets visual games.

My [Codex Jev Router](https://github.com/suenot/codex-jev-router) supports several of these engines through adapters. Protocol compatibility alone does not establish equal accuracy or savings. Before swapping engines, I would measure the full decision time and cost, routing mistakes, and the cost of the agent that follows. I do not yet have a public comparison of all thirteen on my own task mix.
