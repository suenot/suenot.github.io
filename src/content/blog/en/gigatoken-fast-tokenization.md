---
title: "Gigatoken: Fast Tokenization Without Changing the Tokens"
description: "A source-based look at Gigatoken's claimed tokenizer speedup, its SIMD and cache design, the benchmark conditions, and its current limits."
pubDate: 2026-07-25
heroImage: "/images/blog/gigatoken-fast-tokenization-hero.png"
tags: ["tokenization", "gigatoken", "llm", "inference", "training", "infrastructure", "rust", "simd"]
draft: false
---

# Gigatoken: Fast Tokenization Without Changing the Tokens

Watch on YouTube: [Gigatoken: How Tokenization Went from Megabytes to Gigabytes](https://www.youtube.com/watch?v=NXCsPMTp85c)

*Research source: [Cloud-Codes explainer](https://youtu.be/vFtJeZ7ifTA)*

Tokenization happens before a language model can work with a prompt. The linked explainer reports that Gigatoken, a tokenizer by Marcel Roed, runs 100 to 1,000 times faster than OpenAI's tiktoken and Hugging Face tokenizers in some cases while returning the same token IDs. These are source claims, not independently reproduced benchmarks in this article.

## The benchmark in the source

Roed is described as a Stanford CS PhD who teaches CS336, "Language Modeling from Scratch." The explainer compares tokenization of 11.9 GB of web text with a GPT-2 tokenizer on an AMD EPYC server:

- Gigatoken finished in under half a second at 24.5 GB/s.
- Hugging Face tokenizers reached 25 MB/s.
- tiktoken reached about 36 MB/s.

That works out to roughly 900 times the Hugging Face result and 680 times the tiktoken result. The explainer also calls this about 50,000 novels per second. That analogy is an estimate from the source, not a benchmark unit.

Tokenization is easy to overlook because it happens before inference or training begins. It still affects every prompt, training corpus, and fine-tuning pass. The claimed throughput would matter most when large amounts of text must be prepared repeatedly.

## What stays the same

Gigatoken does not introduce a new tokenization scheme. The source says it uses the same byte-pair encoding merge rules, vocabulary, and token IDs as GPT-2-compatible tokenizers. It reports an exact comparison against Hugging Face across all 20,400 documents in the corpus, with every token matching.

The benchmark condition is important. Gigatoken reads the full file and finds its own pre-split points, while the other libraries receive pre-split chunks. The source presents Gigatoken as doing more of the pipeline in the measured run, not less.

## Where the speed comes from

The explainer locates most of the gain before the BPE merge loop. Raw text first has to be divided into rough pieces such as words, spaces, punctuation, and numbers. Many tokenizers use a regular-expression engine for that work because the original GPT-2 code did. Regex is flexible, but it processes the input incrementally.

Gigatoken replaces that pre-split step with SIMD code. The source names AVX-512 on Intel and AMD processors and NEON on Apple and ARM chips. These instructions classify batches of bytes at once instead of examining a single character at a time.

It also caches tokenizations for repeated words. The first occurrence is tokenized; later occurrences use the cached result. This helps on ordinary text, where common words recur often. The difficult part is keeping that cache fast as rare words expand it beyond the CPU's smallest caches.

The source attributes the remaining gains to fewer branch mispredictions, less coordination between threads, and fewer transitions back to Python. No single change explains the claimed result by itself.

## Why the result could matter

For training and fine-tuning, large datasets can require hundreds of billions of tokens to pass through the tokenizer before training starts. The source argues that a faster pre-pass can shorten data preparation and make experiments easier to repeat. For live inference, prompts must be tokenized before the model responds, so the same cost appears on every request.

The explainer gives two scale illustrations: more than three million requests in a day and roughly 130 trillion tokens for Common Crawl. It estimates that the latter could be tokenized in under six and a half hours at the reported server speed. Both are extrapolations from the source, not measurements reproduced here.

## Limits and compatibility

The claimed speedup is not uniform. SentencePiece tokenizers used by Gemma and some Mistral models reportedly improve by 10 to 20 times rather than 1,000. WordPiece is not supported yet. The README recommends Windows users run it through WSL.

The source lists support for Llama, Qwen, DeepSeek, GLM, Phi, Nemotron, GPT-OSS, Kimi, and other model families. It also claims compatibility with Python 3.10 through 3.14 on x86 and ARM. Existing tokenizer interfaces can be wrapped with a function call, while Gigatoken's native API can read files directly and avoid Python for its highest reported throughput.

The commit history adds one more detail: according to the author, most of the code was written by hand, with AI used later for compatibility work and the final fourfold performance improvement.

The useful engineering lesson is modest. Before replacing an algorithm, measure the unglamorous work around it. In this case, the source points to pre-splitting, CPU vector instructions, and cache behavior as the places where the time went.

---

Related reading: [KV-cache and paged attention](/blog/kv-cache-paged-attention), [model routing](/blog/model-routing-explained), and [saving tokens](/blog/saving-tokens-llm).

More: [X](https://x.com/suenot), [Discord](https://discord.com/invite/2PtuMAg), and [Telegram](https://t.me/suenot_dev).
