---
title: "Last30Days: How an Engagement-Ranked Research Agent Actually Works"
description: "A source-checked look at how Last30Days researches Reddit, X, YouTube, Hacker News, and Polymarket from a local machine, ranks results, removes duplicates, and handles failures."
pubDate: 2026-08-07
heroImage: "/images/blog/last30days-research-agent-hero.png"
tags: ["agent-skills", "claude-code", "research-agents", "web-scraping", "ranking", "last30days"]
draft: false
---

# Last30Days: How an Engagement-Ranked Research Agent Actually Works

Ask a base model what happened last month and it answers from weights trained before that month existed. A search engine often returns articles written to rank. Meanwhile, the useful discussion may be sitting inside a closed platform, in a thread where three people who shipped the thing are arguing about why it broke.

[Last30Days](https://github.com/mvanhorn/last30days-skill) searches those platforms from your machine, combining source-specific tools with credentials stored locally, and ranks the results by engagement. The agent skill reached roughly 39,000 GitHub stars and the top of the trending list with that straightforward setup.

I checked the project's README, code, and open issues to see how it works. Most of the heavy lifting comes from ordinary formulas and filters, while the open issues expose the less obvious engineering tradeoffs.

## Why global installation matters

The project has two installation paths:

```bash
# Claude Code, via the plugin marketplace — auto-updates
/plugin marketplace add mvanhorn/last30days-skill

# Everywhere else — Codex, Cursor, Copilot, Gemini CLI, 50+ harnesses
npx skills add mvanhorn/last30days-skill -g
```

The `-g` flag installs the skill globally instead of adding it to one project. Without it, every microservice repository needs its own setup. With it, the skill is available from any terminal. That fits a research tool used between projects better than a project-local installation.

I wrote about the same change in [Claude Code Skills and Wayfinder](https://www.suenot.com/blog/claude-code-skills-wayfinder/). Skills have moved beyond repository configuration into installable, versioned packages that work across harnesses. Between the v3.3 announcement in May and v3.11.1 in July 2026, Last30Days merged 175 pull requests across 15 releases. Of those, 122 came from 52 community contributors.

## The searches use your credentials

There is no central API pool or server-side scraping fleet. Reddit, Hacker News, Polymarket, and GitHub work immediately. First-run setup installs keyless command-line tools for YouTube, arXiv, and Techmeme. X can use local browser cookies, Bluesky uses an app password, and TikTok, Instagram, and LinkedIn use a configured ScrapeCreators key. API keys can come from a `.env` file or the macOS keychain through `scripts/setup-keychain.sh`.

For sources that use a browser session, requests come from the person's authenticated machine instead of a datacenter scraper. The local process still sends searches to external platforms and APIs; it simply does not route them through a central Last30Days service. The project must support browser and operating-system combinations that store cookies differently. The person running the skill also remains responsible for each platform's terms on automated account access.

This follows the local-first pattern I discussed in [Agent Harness Architecture](https://www.suenot.com/blog/agent-harness-architecture/): the capability and state stay on the user's machine, and the harness holds the credentials instead of a central service.

## How Polymarket ranking works

The README says the skill "scores content by engagement metrics: upvotes, views, trading volume." The Polymarket integration in `skills/last30days/scripts/lib/polymarket.py` is more specific:

```python
market_quality = (
    0.50 * vol_score +          # log-scaled monthly volume, ~$9M saturates
    0.25 * liq_score +          # log-scaled liquidity, ~$1.2M saturates
    0.15 * movement_score +     # biggest price change; 20% move saturates
    0.10 * competitive_score    # markets near 50/50 score higher
)
relevance = min(1.0, text_score * (0.75 + 0.25 * market_quality))
```

The final relevance score starts with `text_score` and scales it by a factor between 0.75 and 1.0. Market quality can refine a relevant match, but it cannot create text relevance. A $50M election market gains no automatic place in results for a Python library just because it has high volume.

Volume and liquidity use logarithmic saturation. With `min(1.0, log1p(volume) / 16)`, both a $9M market and a $90M market reach the volume ceiling. Otherwise one market dominated by whales could flatten every other signal. Recent price movement also gets more weight: daily change counts 3x, weekly change 2x, and monthly change 1x.

Markets close to 50/50 receive a bonus because they still contain genuine disagreement. A market at 97% is already close to settled.

## Deduplication uses Jaccard, not embeddings

The implementation in `lib/dedupe.py` opens with the docstring `"""Within-source near-duplicate detection."""` and uses Jaccard similarity:

```python
def hybrid_similarity(text_a: str, text_b: str) -> float:
    return max(
        jaccard_similarity(get_ngrams(text_a), get_ngrams(text_b)),  # char 3-grams
        token_jaccard(text_a, text_b),                                # stopword-filtered tokens
    )
```

It compares character 3-grams and filtered token sets, keeps the higher score, and applies a 0.7 threshold. The module uses neither embeddings nor a vector store and makes no model calls. A dedicated `cjk` module handles Chinese segmentation.

The file also preserves a bug report as a docstring:

> Jobs are deduped by exact URL only: distinct postings on the same careers board share heavy boilerplate (company intro, "TL;DR", benefits) that trips fuzzy text similarity and collapses unrelated roles (a 26-role board fell to 7).

Twenty-six jobs became seven because every posting shared the same company text. The fix used the exact URL already attached to each job instead of trying to improve fuzzy similarity. Fuzzy matching still helps when no identifier exists, but it is a poor substitute for one that is already available.

This also avoids model calls during deduplication. Cheap deterministic filters run first, and the model sees only the surviving results. The cost argument is the same one I made in [saving tokens in Claude Code](https://www.suenot.com/blog/saving-tokens-llm/), applied one layer earlier in the pipeline.

## What still breaks

The relevance and global-installation bugs below remain open on GitHub. A third issue, about a warning during the first run, is closed.

### Issue #887: a broad token passes entity grounding

The reported query was `AI code review bottleneck: can reviewers still judge AI-produced work`. The parser removed `review` because it treats that word as an intent modifier. The remaining entity still began with `AI`, so `_entity_grounded` accepted candidates whose only overlap was that leading token. In the reproduced run, a course promotion, a Chinese web drama, and an astronomy video scored alongside the relevant technical clusters.

The proposed fix keeps an intent modifier when it is the only content-bearing noun and requires a discriminating token for grounding. That should reduce false positives, though a stricter test can also reduce recall. The issue remains open.

### Issue #818: global installation exposes a path bug

In v3.14 installed through npx, several instructions in `SKILL.md` invoked `skills/last30days/scripts/last30days.py` relative to the current workspace. The HTML reference also used the old `${SKILL_ROOT}` convention instead of `${SKILL_DIR}`. Those paths work from a repository checkout but fail when the skill is installed globally and invoked from an unrelated directory such as `~/work/some-enterprise-app`.

The engine is present under the global skill directory, but the instructions still assume a repository checkout inside the current workspace.

### Issue #463: a nonzero hook exit caused a warning

This issue is closed. The SessionStart hook `check-config.sh` returned exit code 1 when there was no history file from a previous run. Claude Code showed a non-blocking hook-failure warning, but the session itself was unaffected.

No previous state means that this is the first run, not that the hook failed. Returning zero removes a confusing warning from an otherwise valid setup. This is the same harness-level concern I discussed in [The Harness, Not the Model](https://www.suenot.com/blog/harness-not-model/).

## How the skill limits spending

An agent making hundreds of requests can consume a budget without much visibility. Source selection is the first control:

- `EXCLUDE_SOURCES=tiktok,instagram` hard-blocks platforms at the core, before any call is planned.
- Perplexity is explicitly opt-in. TikTok, Instagram, and LinkedIn require both a ScrapeCreators key and source selection. Configured web-search backends can be selected automatically, so their quotas and pricing still need attention.

The `--preflight` option reports the configuration source, browser-cookie plan, planned writes, optional commands, available sources, and endpoint overrides. It does not read browser cookies, write setup or report files, or run research. That makes it a safe way to inspect permissions and routing before a real request.

Version 3.16.0 added another cost control in PR #827. YouTube comments now use the free local `yt-dlp` extractor first. A genuine extractor failure can trigger the ScrapeCreators fallback, but only when its token is configured. A clean result with zero comments does not spend a paid request.

---

*Source: all architectural details were verified against the [last30days-skill](https://github.com/mvanhorn/last30days-skill) repository at v3.18.4.*
