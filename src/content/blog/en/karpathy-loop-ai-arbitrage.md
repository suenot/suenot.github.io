---
title: "The Karpathy Loop & AI Arbitrage: Capturing Agentic Value"
description: "AI arbitrage is the spread between what an agent can now do autonomously and what the market still pays humans to do. The Karpathy Loop is how you capture it: Software 3.0, a self-improving read-evaluate-commit ratchet, the capability gap, and a blueprint for value capture."
pubDate: 2026-07-19
tags: ["ai-arbitrage", "karpathy", "agentic-engineering", "software-3", "self-improving-ai", "ai-economics"]
draft: false
---

# The Karpathy Loop & AI Arbitrage: Capturing Agentic Value

🎬 **Watch on YouTube:** [The Karpathy Loop & AI Arbitrage: Capturing Agentic Value](https://www.youtube.com/watch?v=PcwBgzTxSq8)

There's a spread sitting in plain sight right now, and most people are walking past it. On one side: what an AI agent can already do autonomously, today. On the other: what the market still pays humans to do. The gap between those two is real money, and I call closing it **AI arbitrage**. The engine that captures it is what I call the **Karpathy Loop**.

## The shift to agentic engineering (Software 3.0)

Start with the frame. Andrej Karpathy described the progression as Software 1.0 → 2.0 → 3.0. Software 1.0 is code you write by hand — explicit instructions. Software 2.0 is neural network weights, learned from data instead of written. **Software 3.0** is the new layer: you program the system in natural language, orchestrating agents that carry out the work.

That's a different discipline. In agentic engineering you're not writing every line — you're directing a system that writes and executes on its own. Your unit of work stops being the function and becomes the *agent loop*. Once you internalize that, the arbitrage becomes obvious: if a system can now execute what used to require a paid human, there's a spread between the old price and the new cost.

## Defining AI arbitrage: the spread

Every arbitrage is the same shape — a price difference you can capture. Here the "price" on one side is what the market pays for a task, set by human labor. The "cost" on the other side is what it takes to have an agent do that same task autonomously. Where the agent is genuinely capable and the market hasn't repriced yet, you pocket the spread.

The key word is *autonomously*. This isn't "AI helps a human go faster" — that's a productivity gain, and the market prices it quickly. Arbitrage lives specifically where the agent closes the loop end to end with no human in the critical path, because that's where the cost collapses while the market price hasn't caught up. The spread exists because repricing lags capability. Your job is to find tasks that crossed the autonomy line before everyone noticed.

## The self-improving ratchet: read, evaluate, commit

What makes the Karpathy Loop more than a one-off trade is that it's **self-improving**. It's a ratchet — it only turns forward. Three steps.

**Read.** The system takes in the current state — the task, the environment, the results of its last action. It perceives where things stand.

**Evaluate.** It judges that state against the goal. Did the last action move things forward? What's the highest-value next move? This is where reasoning lives.

**Commit.** It acts, locking in a change, then loops back to read the new state.

The reason it's a ratchet and not just a loop: each cycle only keeps progress that survives evaluation. Good moves get committed and become the new baseline; bad ones get caught and don't. Every turn either advances the system or holds it in place — it doesn't slide backward. Run that loop continuously and the system compounds its own improvement, tightening the arbitrage the more it runs.

## The loop in action: a PolyMarket bot

Make it concrete. Picture an agent trading on PolyMarket, a prediction market. It **reads** the current markets, prices, and news. It **evaluates** where the market price diverges from its own estimate of the true probability — the market's own arbitrage spread. It **commits** by placing a position. Then it reads the outcome, evaluates how its estimate held up, and adjusts.

Notice the beauty of it: the loop is capturing a market arbitrage (mispriced probabilities) using an operational arbitrage (an agent doing autonomously what used to need a paid analyst). The read-evaluate-commit ratchet runs continuously, with no human in the critical path — and each cycle sharpens the model behind the next trade. That's the Karpathy Loop doing exactly what it's for.

## Managing the capability gap

Now the discipline part, because this is where people lose money. The **capability gap** is the distance between what your agent *can* reliably do and what you're *asking* it to do. Push the agent past its real capability and the autonomy you were counting on breaks — the loop commits bad actions, and instead of capturing a spread you're bleeding one.

Managing the gap means being honest about where the autonomy line actually is for your task, and only deploying the loop fully autonomously on the side of that line where the agent is genuinely reliable. Everywhere else, you keep a human in the loop until capability catches up. The arbitrageurs who blow up are the ones who assume more autonomy than the agent has earned. Respect the gap and it becomes a moving frontier you expand deliberately, not a cliff you drive off.

## The blueprint for capture

So here's the blueprint. **Find the spread** — a task the market still pays humans for that an agent can now do autonomously. **Build the loop** — a read-evaluate-commit ratchet that closes end to end without a human in the critical path. **Manage the gap** — deploy full autonomy only where the agent is genuinely reliable, and keep a human hand where it isn't. **Own the boundaries** — the durable moat isn't the model (everyone rents the same ones); it's owning the systemic boundaries where your loop meets the real world: the data feeds, the execution rails, the domain integration nobody else has wired up.

That last point is the whole thing. Models are a commodity. The arbitrage — and the moat that protects it — is in the loop you build around a commodity model and the boundaries only you control. Build the ratchet, manage the gap, own the edges, and you capture the spread that everyone else keeps walking past.

---

If this was useful, come talk AI economics and agents with me: [X](https://x.com/suenot), [Discord](https://discord.com/invite/2PtuMAg), [Telegram](https://t.me/suenot_dev).
