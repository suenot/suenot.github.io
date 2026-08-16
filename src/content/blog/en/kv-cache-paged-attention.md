---
title: "KV cache and PagedAttention: how vLLM uses GPU memory more efficiently"
description: "PagedAttention manages the KV cache in fixed-size blocks, reducing allocation waste and enabling larger batches. What that changes, where continuous batching helps, and what the original vLLM results actually show."
pubDate: 2026-07-19
heroImage: "/images/blog/kv-cache-paged-attention-hero.png"
tags: ["kv-cache", "paged-attention", "vllm", "llm-inference", "gpu", "infrastructure"]
draft: false
---

# KV cache and PagedAttention: how vLLM uses GPU memory more efficiently

Watch the source walkthrough on [YouTube](https://www.youtube.com/watch?v=m0JnK3b-Am4).

Serving a language model can hit a memory limit before the GPU reaches its peak compute rate. During token-by-token decoding, reading the growing KV cache is often a memory-bandwidth problem. That is not true of every stage or every workload: prefill can be compute-bound, and the balance changes with the model, context length, batch size, and hardware.

vLLM's PagedAttention addresses one important source of memory pressure: the way a serving system allocates the key and value cache for many requests.

## Why the KV cache matters

For each processed token, a transformer can retain key and value tensors so it does not recompute them during later decoding steps. The cache grows with the sequence, and every active request needs its own cache state.

Its actual size depends on the architecture, including the number of layers, KV heads, head dimension, and precision. There is no useful universal "gigabytes per request" number. The operational point is that enough simultaneous requests can exhaust accelerator memory even when the scheduler still has compute capacity available.

## The allocation problem

Older serving approaches often reserved a contiguous region large enough for a request's possible maximum length. If a short request received a long reservation, much of that allocation remained empty. When requests ended, differently sized gaps could also make later allocations awkward.

The original PagedAttention paper measured 20.4% to 38.2% useful occupancy in the KV-cache allocations of the systems it profiled. That result is specific to those systems and workloads. It is not a claim that every serving stack wastes most of its total VRAM.

## Paging the cache

PagedAttention applies an operating-system paging idea to KV-cache allocation. It splits the cache into fixed-size blocks, such as 16 tokens per block when that configuration is selected. A request's logical token sequence can map to noncontiguous physical blocks, and a block table records the mapping.

The runtime allocates blocks as a sequence grows. This avoids the need to reserve its full potential length at the start and greatly reduces external fragmentation. It does not eliminate overhead altogether: the final partially used block and metadata still take space. In the paper's experiments, waste stayed below 4%.

## Shared prompts and continuous batching

Requests that share a prompt can share complete KV-cache blocks for that prompt. When a sequence needs to write to a shared last block, PagedAttention uses copy-on-write. This is particularly useful for parallel sampling and beam search. The paper reports memory savings of up to 55% for complex decoding scenarios, not for all workloads.

vLLM also uses iteration-level scheduling, often called continuous or in-flight batching. Finished requests can leave the batch between decoding iterations, and queued requests can enter. This can reduce the idle time associated with a static batch that waits for its longest sequence. It is a separate scheduling technique, not something paging automatically provides.

## What the original result means

The 2023 PagedAttention paper reported two to four times higher throughput at similar latency than the FasterTransformer and Orca configurations it compared. That is a useful result, but it is not a standing promise for every current model or deployment. Kernels, quantization, prefix caching, scheduler policy, model architecture, and workload shape all affect the outcome.

The practical lesson is modest and useful: measure memory allocation and cache reuse before buying more GPUs. Block-based KV-cache management and careful scheduling can increase useful concurrency on the hardware you already have.

For the implementation details and original experimental results, see [Kwon et al., "Efficient Memory Management for LLM Serving with PagedAttention"](https://arxiv.org/abs/2309.06180). Cache-aware routing can also preserve prefix locality. Sending similar requests to unrelated replicas may reduce the hit rate of each replica's local prefix cache, as discussed in [KV-cache pitfalls in model routing](/blog/model-routing-explained).

---

Serving LLMs and want to trade infrastructure war stories? Find me here: [X](https://x.com/suenot), [Discord](https://discord.com/invite/2PtuMAg), [Telegram](https://t.me/suenot_dev).
