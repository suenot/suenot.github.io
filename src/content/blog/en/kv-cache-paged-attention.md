---
title: "KV-Cache and PagedAttention: How vLLM Gets 4x More Throughput From the Same GPU"
description: "LLM serving runs out of GPU memory long before it runs out of compute. PagedAttention borrows a 1970s operating-system idea — virtual memory paging — to kill the KV-cache fragmentation that wastes up to 80% of your VRAM, and continuous batching keeps the cores busy."
pubDate: 2026-07-19
tags: ["kv-cache", "paged-attention", "vllm", "llm-inference", "gpu", "infrastructure"]
draft: false
---

# KV-Cache and PagedAttention: How vLLM Gets 4x More Throughput From the Same GPU

🎬 **Watch on YouTube:** [KV-Cache and PagedAttention: How vLLM Gets 4x More Throughput From the Same GPU](https://www.youtube.com/watch?v=m0JnK3b-Am4)

If you've ever tried to serve an LLM in production, you've probably hit a wall that felt wrong: the GPU's compute cores sit half-idle, yet you're out of memory and can't add more concurrent requests. The bottleneck isn't compute. It's memory — specifically, how the **KV-cache** is managed. This is the problem vLLM's PagedAttention was built to solve, and the fix is one of the most elegant borrowings in systems engineering.

## The core bottleneck: the KV-cache

During generation, a transformer caches the key and value tensors for every token it has already processed, so it doesn't recompute them on each step. That's the KV-cache, and it's expensive. A 70B-parameter model generating 2,048 tokens can require **~140GB of memory per request** strictly for the KV-cache. On an NVIDIA A100 with 40GB, the cache alone can eat well over half the card.

The killer property: **the KV-cache scales linearly per user**. Every concurrent request needs its own cache. So as concurrency climbs, VRAM — not compute — becomes the ceiling almost instantly.

## The traditional failure: fragmentation

Early serving engines made things worse by pre-allocating a single contiguous block of GPU memory sized for the *maximum possible* sequence length. Two kinds of waste followed:

- **Internal fragmentation.** A request that might grow to 2,048 tokens gets 2,048 slots reserved immediately, even though it currently uses three. The other 2,040 slots sit reserved and empty.
- **External fragmentation.** Freed regions of different sizes leave gaps that no new request fits into cleanly.

The result is brutal. In traditional LLM serving, **only 20–40% of the KV-cache memory actually holds token states**. The rest — up to 80% of your VRAM — is wasted on empty reservations. And when 80% of memory is wasted, your maximum batch size is artificially crippled, which is exactly the throughput you were paying the GPU for.

## The breakthrough: OS virtual memory for LLMs

The vLLM team's insight was that this is not a new problem at all. KV-cache fragmentation is *identical* to the memory fragmentation operating systems solved in the 1970s with **virtual memory paging**. So they applied the same idea directly to the attention mechanism.

Instead of one contiguous chunk per request, memory is divided into small fixed-size **blocks** (for example, 16 tokens each). A sequence's logically contiguous tokens can then map to physically scattered blocks, exactly like virtual pages mapping to physical RAM frames through a page table. In PagedAttention, a **block table** plays the role of the page table: logical KV blocks on one side, physical GPU blocks on the other, with the mapping handled transparently.

The payoff is two-fold:

- **Near-zero waste.** Memory is allocated on demand, block by block, so a request only holds what it's actually using.
- **No external fragmentation.** Because any free block can serve any sequence regardless of physical location, there are no unusable gaps.

## Sharing memory between sequences

Paging unlocks a second trick borrowed from operating systems: **copy-on-write**. When you sample multiple outputs from the same prompt — parallel sampling, beam search — every output shares the identical prefix. PagedAttention lets those sequences physically share the same memory blocks for the common prompt, and only diverge into separate blocks once their generations differ. In complex decoding scenarios this reduces memory consumption dynamically by up to **55%**.

## The synergy: continuous batching

Paging solves *how much* fits in memory. But there's a second source of idle GPUs: scheduling. Traditional **static batching** groups requests and waits for the longest sequence in the batch to finish before starting anything new. Short requests in that batch complete early and then their share of the GPU sits idle, burning time.

vLLM pairs PagedAttention with **continuous (in-flight) batching**: iteration-level scheduling that swaps finished requests out and new ones in immediately, without waiting for the whole batch. As soon as a slot frees, a queued request takes it. The two techniques compound — PagedAttention packs more requests into memory, and continuous batching ensures the compute cores process them without a microsecond of downtime.

## The result

Put the pieces together and you get vLLM's headline: up to **4x throughput** on existing hardware, with near-zero memory waste, compared to earlier serving stacks like FasterTransformer. Nothing about the model changed. No new GPUs. Just smarter memory management borrowed from an idea that's been around for fifty years.

The executive summary from the video is worth keeping:

- **The bottleneck** is KV-cache unpredictability destroying memory efficiency.
- **The solution** is PagedAttention eliminating fragmentation.
- **The synergy** is continuous batching saturating the compute cores.
- **The outcome** is massive throughput gains on hardware you already own.

If you're routing or serving models at scale, this is why cache-aware infrastructure matters so much — a point that connects directly to the [KV-cache pitfalls in model routing](/blog/model-routing-explained), where spreading requests across pods destroys exactly this prefix locality.

---

Serving LLMs and want to trade infrastructure war stories? Find me here: [X](https://x.com/suenot), [Discord](https://discord.com/invite/2PtuMAg), [Telegram](https://t.me/suenot_dev).
