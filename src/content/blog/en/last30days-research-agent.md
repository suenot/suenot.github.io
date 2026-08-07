---
title: "Last30Days: How an Engagement-Ranked Research Agent Actually Works"
description: "A 39k-star agent skill that researches Reddit, X, YouTube, Hacker News and Polymarket from your own machine, using your own browser cookies. What the ranking really does, why its deduplication is deliberately boring, and which failure modes are still open — verified against the source code, not the hype."
pubDate: 2026-08-07
heroImage: "/images/blog/last30days-research-agent-hero.png"
tags: ["agent-skills", "claude-code", "research-agents", "web-scraping", "ranking", "last30days"]
draft: false
---

# Last30Days: How an Engagement-Ranked Research Agent Actually Works

🎬 **Watch on YouTube:** [Your AI Doesn't Know What Happened Last Month. One Command Fixes It](https://www.youtube.com/watch?v=4HpQh1heIkw)

Ask a base model what happened last month and it answers from weights that froze before last month existed. Ask a search engine and it returns SEO articles written to rank, not to inform. The discussion that actually matters — the thread where three people who shipped the thing argue about why it broke — lives inside walled gardens that neither of them can see.

[Last30Days](https://github.com/mvanhorn/last30days-skill) is an agent skill built around that gap. It hit roughly 39,000 GitHub stars and the top of the trending list by doing something structurally simple: run the searches from *your* machine, with *your* logged-in browser session, then rank what comes back by what people actually engaged with.

I went through the source video's architectural claims and checked each one against the repository. Several of them turned out to be wrong — in interesting ways. What follows is the version that survives contact with the code.

## The distribution story is half the product

Two install paths, and the difference matters more than it looks:

```bash
# Claude Code, via the plugin marketplace — auto-updates
/plugin marketplace add mvanhorn/last30days-skill

# Everywhere else — Codex, Cursor, Copilot, Gemini CLI, 50+ harnesses
npx skills add mvanhorn/last30days-skill -g
```

The `-g` flag installs globally instead of per-project. That single flag is the difference between a tool you re-initialize in every microservice repo and a capability that's simply present wherever you open a terminal. For a research skill — something you reach for *between* projects, not inside one — global is the only sane default.

This is the same shift I wrote about in [Claude Code Skills and Wayfinder](https://www.suenot.com/blog/claude-code-skills-wayfinder/): skills stopped being repo-local config and became installable, versioned, cross-harness packages. Last30Days is what that ecosystem looks like when a single skill gets 175 merged community PRs in a release cycle.

## Bring your own credentials

There is no central API pool and no server-side scraping fleet. Reddit, Hacker News, Polymarket, GitHub, arXiv and Techmeme work with zero configuration. X, YouTube, Bluesky, TikTok, Instagram and LinkedIn need credentials — and the credentials are *yours*: browser cookies read locally, API keys from a `.env` file or the macOS keychain via `scripts/setup-keychain.sh`.

The trade is explicit. You get past bot-checks because you aren't a datacenter IP pretending to be a person — you're a person's own authenticated session, on their own machine. Your research queries never leave the laptop. In exchange, the project inherits the maintenance burden of every browser-and-OS combination that stores cookies differently, and you inherit whatever your platform's terms say about automated access from your account.

That's a real cost, not a footnote. But it's the same architectural bet as the local-first patterns in [Agent Harness Architecture](https://www.suenot.com/blog/agent-harness-architecture/): push capability to the edge, keep state on the user's machine, and let the harness — not a central service — hold the credentials.

## The ranking is where the actual engineering is

The README's one-line summary — "scores content by engagement metrics: upvotes, views, trading volume" — undersells it. Look at the Polymarket integration in `skills/last30days/scripts/lib/polymarket.py` and you find a specific, tuned formula:

```python
market_quality = (
    0.50 * vol_score +          # log-scaled monthly volume, ~$9M saturates
    0.25 * liq_score +          # log-scaled liquidity, ~$1.2M saturates
    0.15 * movement_score +     # biggest price change; 20% move saturates
    0.10 * competitive_score    # markets near 50/50 score higher
)
relevance = min(1.0, text_score * (0.75 + 0.25 * market_quality))
```

Three things worth stealing from those five lines.

**Semantic relevance multiplies; market quality only modulates.** The final score is `text_score` scaled by a factor between 0.75 and 1.0. A wildly liquid market that doesn't match your topic cannot climb the rankings — quality refines relevant matches instead of rescuing irrelevant ones. That single structural choice is what keeps a $50M election market out of your query about a Python library.

**Everything saturates logarithmically.** `min(1.0, log1p(volume) / 16)` means a $9M market and a $90M market score nearly the same. Without the log, one whale market would flatten every other signal. Recency of price *movement* is weighted too — a daily change counts 3×, weekly 2×, monthly 1× — because a market that just moved is a market where something happened.

**Near-50/50 markets get a bonus.** A market sitting at 97% isn't news; it's a settled question with a spread. The interesting signal is genuine disagreement.

Here the source video I worked from claimed the developers "abandoned dollar volume entirely and switched to pure probabilities, because volume is distorted by whales." That's a nice story and it's false. Volume is the single heaviest term at 0.50. The whale problem is handled by the log compression, not by dropping the signal.

## Deduplication is deliberately boring, and that's the lesson

The second claim I checked was that v3 introduced "vector embeddings for cross-platform semantic clustering," collapsing a Reddit thread, an X argument and a YouTube comment section into one entity.

The actual implementation, in `lib/dedupe.py`, opens with the docstring `"""Within-source near-duplicate detection."""` and runs on Jaccard similarity:

```python
def hybrid_similarity(text_a: str, text_b: str) -> float:
    return max(
        jaccard_similarity(get_ngrams(text_a), get_ngrams(text_b)),  # char 3-grams
        token_jaccard(text_a, text_b),                                # stopword-filtered tokens
    )
```

Character 3-grams OR filtered token sets, whichever agrees more, at a 0.7 threshold. No embeddings, no vector store, no model call. Chinese segmentation is handled by a dedicated `cjk` module rather than by hoping a multilingual embedding model works it out.

And then there's the best comment in the file — a bug report preserved as a docstring:

> Jobs are deduped by exact URL only: distinct postings on the same careers board share heavy boilerplate (company intro, "TL;DR", benefits) that trips fuzzy text similarity and collapses unrelated roles (a 26-role board fell to 7).

Twenty-six jobs became seven because every posting shared the same company blurb. The fix wasn't a better similarity metric — it was noticing that job postings already carry a unique identity, and using it. That's the whole discipline in one paragraph: fuzzy matching is a fallback for when you have no identifier, not an upgrade over having one.

Every LLM call you *don't* make is latency and money you keep — the same argument as [saving tokens in Claude Code](https://www.suenot.com/blog/saving-tokens-llm/), applied one layer down. Cheap deterministic filters run first; the model only sees what survives.

## The open failure modes

The source video presented two bugs as elegantly solved. Both are still open on GitHub, and both are more instructive unsolved.

**Issue #887 — entity-miss demotion is inert on topics without a distinctive entity.** The pipeline demotes results that don't mention the thing you asked about. But on an abstract query — "AI code review," "comparison" — the parser finds no hard proper noun, strips the intent words, and clamps onto whatever broad token remains. Query "AI code review," lose "review," keep "AI," and now every piece of content in the universe that says "AI" scores as relevant. The reported symptom: astronomy videos and course spam outranking actual technical threads.

The proposed fix requires a *discriminating* token — statistically rare — before relevance is granted. Which is a genuine precision-versus-recall trade, not a free win: tighten it and you also stop surfacing the unexpected cross-domain result that made the tool interesting. For a tool whose metric is "developer time saved before standup," a false positive costs more than a missed insight. Reasonable call. Still a trade.

**Issue #818 — npx-installed v3.14 regresses to repository-relative script paths.** Scripts resolved their own assets relative to `process.cwd()`. Fine when you run from the project root; broken the moment `-g` means you're running from `~/work/some-enterprise-app` while the package lives in a global node modules tree. The tool goes looking for its HTML report templates inside your app.

Note what makes this bug *structural* rather than sloppy: global installation is the feature, and global installation is what breaks the assumption. Ship the convenience, inherit the path problem.

**Issue #463 — closed, and the most transferable of the three.** The SessionStart hook `check-config.sh` exited 1 when no prior run existed, because there was no history file to read. In a normal shell that's a yellow "file not found" warning nobody reads. Inside an agent harness, exit code 1 is a fatal task error — the agent panics, retries, hallucinates a recovery, or loops.

Agents are far more sensitive to return codes than humans are. "No previous state" is not a failure; it's a first run. If you write hooks for agent environments, that distinction is the difference between a clean start and a self-repair spiral. It's the harness-level thinking I keep coming back to in [The Harness, Not the Model](https://www.suenot.com/blog/harness-not-model/).

## Cost control as a first-class feature

An agent that autonomously fires hundreds of requests can burn a budget quietly. Two mechanisms:

- `EXCLUDE_SOURCES=tiktok,instagram` hard-blocks platforms at the core, before any call is planned.
- Paid sources — Perplexity, Brave Search, ScrapeCreators — are opt-in. Without an explicit include flag, the engine spends nothing.

Plus `--preflight`, which prints what would be read and written without executing anything. The obvious use is a sanity check. The better one is CI: validate that your configuration, env vars and routing are correct without touching real browser cookies or sending a single outbound request. Separating "plan the execution graph" from "execute it" is what lets a scraping pipeline have integration tests at all.

The other cost lever shipped in v3.16.0 (PR #827): YouTube comments now come free through `yt-dlp` instead of requiring a paid scraping API. The fallback pattern is the interesting part — try the free local extractor first, fall back to the paid API when YouTube changes its DOM on a Friday night, and return to free automatically once the open-source parser is fixed upstream. Free path first, paid path as insurance, no manual switch.

## What to take from it

Whether or not you install the skill, four patterns transfer directly to anything agentic you're building:

1. **Let relevance multiply and quality modulate.** Popularity should never outrank topicality.
2. **Compress unbounded signals logarithmically.** One whale should not flatten a thousand honest votes.
3. **Use identifiers when you have them.** Fuzzy similarity is what you do when you don't.
4. **Never exit non-zero for "nothing here yet."** In agent environments, an error code is a panic trigger.

And one meta-lesson, which is why this article exists in the form it does. The video I built it from is itself an AI synthesis, and it stated with total confidence that two open issues were closed, that volume-based ranking had been abandoned, and that a Jaccard deduper was a vector embedding pipeline. Every one of those claims was checkable in about ninety seconds against the GitHub API and the source files. Confidence is free; verification is cheap. Run the check.

---

*Source: this article was written from a technical breakdown published on the [Yersham](https://www.youtube.com/watch?v=9kaal1WHH0Q) channel, with all architectural claims re-verified against the [last30days-skill](https://github.com/mvanhorn/last30days-skill) repository at v3.18.4.*
