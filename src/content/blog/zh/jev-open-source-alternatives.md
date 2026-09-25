---
title: "13 个开源 Jev 替代项目，各自适合做什么"
description: "梳理 Laya、Kev、SemIf 等 13 个类型化决策项目，以及它们用于 Codex 子代理模型选择时的限制。"
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

Jev 接收状态和一组问题，返回选择、分数或数值等简短的类型化结果。我的 [Codex 子代理路由器](https://github.com/suenot/codex-jev-router)用这类结果决定下一个代理的模型及推理档位。下面的项目有本地服务、训练工具，也有专门处理游戏画面的模型。名字相近，解决的问题却不同。

## Laya

[Laya](https://github.com/NandhaKishorM/laya) 可以在一次推理中回答多个类型化问题，提供 Python 库和兼容 Jev 的本地 HTTP 服务。项目提供英语和多语言权重；用中文等语言描述路由任务时，后者值得尝试。它也支持批量处理。真正用于 Codex 前，还需在自己的任务上检验准确率和校准情况。

## Kev

[Kev](https://github.com/jaredpalmer/kev) 提供不同规模的开放模型和本地 `/v1/systemone` 接口。README 建议从 4B 开始，更大的版本需要更多内存。如果已有本地计算资源，它是远程决策服务的直接替代候选。作者公布的测试结果并不能直接说明它选 Codex 子代理模型的效果。

## PlayJev

[PlayJev](https://github.com/OmniJev/PlayJev) 根据浏览器游戏画面和合法动作列表选择下一步，并通过 `/v1/systemone` 返回选择概率。它处理的是视觉游戏输入；要判断哪个代理适合搜索代码，仍需其他模型或重新训练。这个项目展示了类型化决策也能基于图像。

## SemIf

[SemIf](https://github.com/TheoLeeCJ/SemIf-OpenJev) 原名 OpenJev，用开放语言模型的 logits 给候选项打分。它可通过 PyTorch、MLX 或 llama.cpp 运行，CLI 接受 JSONL；接入 Codex 需要适配器。它适合测试本地路由，不过每次请求都重新加载模型可能抵消延迟收益。

## NanoJev

[NanoJev](https://github.com/TianyuCodings/NanoJev) 在较小的 Qwen 底座上加入选择、布尔判断和评分头。仓库公开了权重、数据、训练代码及 `/api/evaluate` 本地服务。发布的模型主要用游戏任务训练；能否迁移到 Codex 任务描述，需要单独测试。

## jevlike

[jevlike](https://github.com/vinnylarouge/jevlike) 更像研究工具包：可以训练小型字节编码器，也可以用冻结的 Hugging Face 编码器为任意文本选项打分。训练和预测通过 CLI 完成。项目没有证明它能区分 Codex 中的精确文件查找和复杂诊断，但可以用自己的任务数据来训练并验证这种分类。

## simple-jev

[simple-jev](https://github.com/featherless-ai/simple-jev) 从兼容的开放语言模型 logits 中获取类型化结果，无须生成 JSON。基于 Transformers 和 PyTorch 的服务提供 `/v1/classifier` 及 `/v1/systemone` 别名。效果取决于底层模型和选项措辞，得分也不会自动成为校准过的成功概率。适合先拿已有的本地模型试验。

## AnyJev

[AnyJev](https://github.com/nokia-applied-research/AnyJev) 提供三个适配层级：无需标签的位置偏差校正、温度校准，以及基于隐藏状态拟合的决策头。后两者需要自己的样本，决策头还要求能访问模型内部状态。若要针对固定类型的子代理任务优化路由，这些工具很有用。最简单的模式也可能多次运行模型，延迟应实测。

## mini-jev

[mini-jev](https://github.com/r-ms/mini-jev) 用冻结的 Qwen 比较基于 logits 的选项评分与受语法约束的 JSON 生成。它更适合学习和基准测试，而不是直接部署为生产路由器。分数可以排序，不能保证概率经过校准。通过它能看清简短决策在哪些情况下省计算，哪些情况下，比如简单布尔问题，收益很小。

## nico-martin 的 open-jev

[nico-martin/open-jev](https://github.com/nico-martin/open-jev) 使用 Transformers.js 配合 WebGPU 或 WASM 在浏览器里运行类型化决策。TypeScript API 为 `OpenJev.load().decide()`，支持包括 Kev 在内的多个模型。网页应用可以直接在本地做决策；Codex 则需要 Node 桥接，首次运行也要下载权重。

## minojev

[minojev](https://github.com/zeredy879/minojev) 将冻结的 Qwen3-1.7B 与小型可训练决策头组合，通过本地 `/score` 接收类型化问题，公开权重和数据，也可在 CPU 上运行。作者报告了模型在分布外任务上的性能下降。因此，路由 Codex 之前应先用真实委派任务评估，而不能直接套用已发表的指标。

## Zefan-Cai 的 Open-Jev

[Zefan-Cai/Open-Jev](https://github.com/Zefan-Cai/Open-Jev) 发布了带决策头和校准的 2B、9B、27B 版本，提供本地 `/v1/systemone` 服务、数据及训练工具。在这三个名字相似的项目中，它最接近现成的模型系列，但运行成本随规模明显变化。其基准成绩仍需在子代理路由任务上复核。

## daseinlabs 的 open-jev

[daseinlabs/open-jev](https://github.com/daseinlabs/open-jev) 基于 Gemma 3 4B 给选项打分，通过共享前缀和批处理减少重复计算。它提供 `/score`、`/v1/systemone`，Mac 上可用 MLX，其他平台可用 PyTorch，还能针对任务训练决策头。获取 Gemma 权重需要在 Hugging Face 接受访问条款。已有 Mac 本地推理环境时，可以拿它实测完整路由耗时。

## 用于 Codex 时怎么选

若想要熟悉的本地 HTTP 接口，我会先看 Laya、Kev、simple-jev 和提供服务的 Open-Jev。若打算用自己的任务样本训练，则重点看 NanoJev、jevlike、AnyJev 和 minojev。SemIf 与 mini-jev 适合研究短决策的实现方式；PlayJev 面向视觉游戏。

我的 [Codex Jev Router](https://github.com/suenot/codex-jev-router) 通过适配器支持其中多个项目。接口兼容并不等于准确率或节省金额相同。替换引擎前，我会把决策耗时、错误路由以及后续代理成本一起算进去。目前还没有覆盖这 13 个项目、基于我自己任务分布的公开对比。
