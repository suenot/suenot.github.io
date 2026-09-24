---
title: "我如何为 Codex 子代理选择模型"
description: "在 Codex 子代理启动前，由路由器选择 Luna 或 Sol。本文记录工作方式、Django 任务的成本和基准测试的局限。"
pubDate: 2026-09-25
heroImage: "/images/blog/codex-subagent-model-routing-hero.png"
tags: ["codex", "model-routing", "jev", "benchmarks", "ai-cost-optimization"]
draft: false
---

# 我如何为 Codex 子代理选择模型

我经常让子代理处理很小的任务：查找方法定义、从几个文件中提取数值，或者核对源码中的一个说法。Sol high 可以完成这些工作，但按 API 价格计算，每次都用它并不划算。因此，我在启动子代理前增加了一次简短的模型选择。

[Codex Jev Router](https://github.com/suenot/codex-jev-router)读取简短的任务摘要，选择 Codex 模型及推理级别。随后，子代理仍使用常规 Codex 工具工作。路由器不会在任务中途换模型，也不会替子代理选择工具。

## 启动子代理之前

按项目说明，主代理应向决策引擎发送简短摘要，不包含源码、日志或密钥。默认引擎是 Jev，也可以换成本地的 Laya 或其他受支持的适配器。引擎返回结构化答案，路由规则检查置信度后选定配置。

精确查找可以交给 Luna low；涉及少数文件且范围明确的工作可以使用 Luna medium。需要 Sol 判断的短任务可以使用 Sol low。决策不够确定时回退到 Sol high。Sol ultra 留给异常复杂的任务，或 Sol 已经明确失败的情况。选定的 `model` 和 `reasoning_effort` 会显式传给 `spawn_agent`。

目前，这套流程依赖主代理遵循 Codex 指令。我不会声称它能强制拦截所有子代理调用：一次 Codex CLI 检查发现，`PreToolUse` 钩子并未在该调用上触发。

## 已检查任务的成本

在[独立的基准测试仓库](https://github.com/suenot/codex-jev-router-benchmarks)中，我使用了固定提交的 Django 源码。三个源码阅读任务各用干净的 Sol high 运行三次，再用路由器选择的配置运行三次。九组配对运行的答案都与固定源码相符。我还对一个范围明确的 SWE-bench Verified Django 修复进行了每组各三次的运行，并用官方本地回归测试检查结果。

| 任务 | 干净的 Sol high | 路由配置加 Jev | 差额 | 检查 |
| --- | ---: | ---: | ---: | --- |
| Django 源码阅读，9 组配对 | $0.214806 | $0.062317 | 低 71.0% | 两组各 9/9 正确 |
| 限定范围的 Django 修复，3 组配对 | $0.555916 | $0.009668 | 低 98.3% | 两组各 3/3 通过官方测试 |

这些数字按[标准 API 价格](https://developers.openai.com/api/docs/pricing)的短上下文费率，结合各模型实测的输入、缓存输入和输出 token 计算。路由后的总额也计入了单独估算的 Jev 决策成本。它们不是 Codex 订阅的实际账单。[完整报告](https://github.com/suenot/codex-jev-router-benchmarks/blob/main/BENCHMARK.md#estimated-api-cost-savings)提供跟踪记录、原始用量和公式。

修复任务还有一个限制：第一次 Luna medium 运行使用的是阈值调整前、根据 Jev 偏好设置的实验配置。阈值调整后，三次重复的实时决策都选择了 Luna medium。我们检查的是官方本地回归测试，没有完成 SWE-bench 的完整 Docker 评测。

## 尚未解决的问题

我特意选择了可能适合较低价配置的任务。这些结果不能推算任意子代理任务的平均账单。报告中还保留了使用同一模型的对照运行，用量本身也会波动。在较早的一次 pytest 修复中，两组都没通过测试，路由后的成本反而更高。这也是测试结果的一部分。

下一步需要预先确定一组真实任务，把重试和失败的成本与答案质量一起计算。目前，路由器给了我一个可配置的方法，把范围明确的工作交给 Luna。[安装说明](https://github.com/suenot/codex-jev-router#instructions-for-codex)和[基准测试资料](https://github.com/suenot/codex-jev-router-benchmarks)都是公开的，可以用自己的任务复查这些选择。
