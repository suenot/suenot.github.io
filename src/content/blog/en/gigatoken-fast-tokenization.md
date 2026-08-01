---
title: "Gigatoken: How Tokenization Went from Megabytes to Gigabytes per Second"
description: "Tokenization is the hidden bottleneck every LLM pays on on every prompt. Gigatoken runs 100-1000x faster than tiktoken by moving from regex to SIMD and GPU-style parallelism on CPU — same output, radically faster. What changed, why it matters for training and inference, and the engineering lesson that boring plumbing still hides 100x speedups."
pubDate: 2026-07-25
heroImage: "/images/blog/gigatoken-fast-tokenization-hero.png"
tags: ["tokenization", "gigatoken", "llm", "inference", "training", "infrastructure", "rust", "simd"]
draft: false
---

# Gigatoken: How Tokenization Went from Megabytes to Gigabytes per Second

🎬 **Watch on YouTube:** [Gigatoken: How Tokenization Went from Megabytes to Gigabytes](https://www.youtube.com/watch?v=NXCsPMTp85c)

*Research source: [Cloud-Codes explainer](https://youtu.be/vFtJeZ7ifTA)*

Before an LLM can generate a single token, your text has to be chopped into pieces first. This runs on every prompt, every training job, every fine-tuning pass — and it's been slower than it should for years. This week, one developer shipped a tokenizer that runs 100-1000x faster than OpenAI's tiktoken and Hugging Face's tokenizers. Same output, identical token IDs, just three orders of magnitude faster.

## The invisible tax

Tokenization is the plumbing most people rarely think about. You type a sentence, the model does its thing, tokens stream out. But before any of that happens, raw text gets converted to token IDs — and that step has been a real, measurable bottleneck.

The field standard tools are already fast: OpenAI's tiktoken (multithreaded Rust) and Hugging Face's tokenizers library (also Rust). They're not lazy baselines. They're the trusted defaults across hundreds of thousands of repositories. So when Marcel Roed, a Stanford CS PhD teaching the legendary CS336 (Language Modeling from Scratch) course, posted a tokenizer running 100x faster, the number that caught attention wasn't the benchmark — it was the workload.

Take 11.9 GB of real web text (an actual training corpus, not a toy string) and tokenize it with GPT-2's tokenizer. On an AMD EPYC server, Gigatoken finished the entire file in under half a second: **24.5 GB per second**. That's roughly 50,000 novels per second on a single machine. Hugging Face managed 25 MB/s. Tiktoken came in around 36 MB/s. Same input, same tokens coming out — completely different axis of the chart.

Run the division and it stops sounding real: roughly 900x faster than Hugging Face, 680x faster than tiktoken. Three full orders of magnitude sitting in the middle of the stack everyone uses.

## What it actually changes

Why care how fast a tokenizer runs? Two reasons, and they matter even if you never train a model.

**Training and fine-tuning.** When you build from scratch (exactly what Roed's Stanford course has students do), you push hundreds of billions of tokens through the tokenizer before a single gradient step can even start. At the old rates, that pre-pass could run for days. At 24 GB/s, the tax basically disappears — cheaper data prep means faster experiments and quicker retries. That matters most when you're training on a budget instead of a warehouse of GPUs.

**Inference latency and cost.** Every time a live model answers you, it tokenizes your prompt before thinking. Multiply that by millions of requests per day, and even inference-time tokenizing turns into a recurring cost worth cutting. The video puts a number on it: over three million requests in a single day, all needing the same first step. Slow tokenization isn't just a training tax — it's per-request overhead.

Then there's the absurd stat: at server speed, you could tokenize all of Common Crawl (roughly the readable internet, about 130 trillion tokens) in under six and a half hours. The entire public web, chewed through in a single afternoon.

## How: SIMD and cache, not new algorithms

Here's the surprising part: there's no exotic new algorithm. Gigatoken uses the same byte-pair encoding scheme everyone else has used since GPT-2. Same merge rules, same vocabulary, same token IDs. Diff the output against Hugging Face, and it's byte-for-byte identical.

The speedup comes from where almost all the runtime actually goes: the pre-split step.

Byte-pair encoding itself is almost too simple. You start with raw characters, find the pair that shows up most often, glue it into one new token, and repeat a few thousand times. That's how a model learns that the letters t-h-e should collapse into a single token for "the."

But before any of that merging happens, raw text has to be pre-split into rough pieces — words, spaces, punctuation, numbers. And that pre-split step, not the clever merging that gets all the attention, is where almost all of the runtime actually goes.

Almost every tokenizer runs that split with a regular expression engine because the original GPT-2 code did. Regex is flexible and easy to get right, so it rarely gets rewritten. It's also slow because it walks through the text one character at a time.

Gigatoken threw the regex out and split text by hand using SIMD — the wide CPU instructions (AVX-512 on Intel/AMD, NEON on Apple/ARM) that process a whole batch of bytes in one shot. Where the regex reads one character per step, this reads 32 or 64 bytes in a single instruction.

Then it refuses to do the same work twice. The first time it sees a given word, it tokenizes it and files the answer away. Every time after that, it just looks the answer up. Real text is the same few thousand words on endless repeat, so that cache starts paying off almost immediately.

That sounds obvious, but it's the genuinely hard part. Language has a long tail — there's always some new rare word arriving. So the cache keeps growing and can spill right out of your CPU's small fast memory. Designing that cache hierarchy so it stays fast is most of the real engineering.

The rest is a stack of small unglamorous wins: cut the branch mispredictions, stop the threads from chattering at each other, barely ever cross back into slow Python. No single one is dramatic on its own. Stacked on top of each other, they multiply into 100x.

And the benchmark isn't even rigged in its favor. Gigatoken reads the whole 11 GB file and finds all the split points itself, while the other two libraries get handed pre-split chunks to start from. It's doing strictly more work and still winning by three orders of magnitude.

## The correctness guarantee

The part that keeps coming back is correctness. Roed ran it against Hugging Face across all 20,400 documents in that corpus — every single token matched. You're not trading accuracy for speed here. It's the exact same output, just produced far faster.

There are honest caveats: older sentencepiece tokenizers (used by Gemma and some Mistral models) only get 10-20x faster, not 1000x. WordPiece isn't supported yet. Windows works best through WSL for now. He flags all of it plainly in the README.

There's also a refreshingly transparent note about AI in the commit history: most of the code was written by hand, with AI brought in near the end to widen compatibility and squeeze out the final 4x of performance.

## Using it and what it supports

Actually using Gigatoken is almost anti-climactic: wrap your existing tokenizer in a single function call, and from that point on it behaves exactly the same. Same methods, same results — just far faster underneath. One line makes it act like a Hugging Face tokenizer, one line for tiktoken, or a native Gigatoken API that reads files straight off disk and skips Python entirely to hit those full-GB/s numbers.

It already understands nearly every common tokenizer you'd reach for: Llama, Qwen, DeepSeek, GLM, Phi, Nemotron, GPT-OSS, Kimi — dozens of model families work from a single install across Python 3.10 through 3.14 on both x86 and ARM chips. You're unlikely to hit one it doesn't handle.

## The engineering lesson

The boring plumbing, the part most of us never bother to profile, is often exactly where the biggest speedups are still hiding. Tokenization is the step every training job waits on first, and the tools it laps are already fast, multithreaded Rust. The winning move wasn't a new algorithm or secret hardware — it was profiling the bottleneck everyone ignored, throwing out the comfortable regex default for hand-rolled SIMD, and designing a cache hierarchy that stays fast as language's long tail arrives.

That's the pattern worth carrying elsewhere: the invisible first step of the whole pipeline just stopped being the slow one. Go find yours.

---

If you're building infrastructure or training on a budget, I write about this stuff regularly: [KV-cache and paged attention](/blog/kv-cache-paged-attention) for memory bottlenecks, [model routing](/blog/model-routing-explained) for cutting inference spend without losing quality, and [saving tokens](/blog/saving-tokens-llm) for compression strategies that actually work.

Building with LLMs? Come compare notes: [X](https://x.com/suenot), [Discord](https://discord.com/invite/2PtuMAg), [Telegram](https://t.me/suenot_dev).
