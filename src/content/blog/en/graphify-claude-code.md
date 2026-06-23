---
title: "graphify in Claude Code: a knowledge graph instead of reading the whole repo, semantics on cheap OpenRouter"
description: "My ready-to-use graphify setup for Claude Code: a knowledge graph instead of full-repo reads, semantic extraction on cheap OpenRouter (deepseek) instead of Claude tokens, auto-watch via hooks, protection against leaking secrets into the graph. All packaged in the claude-code-token-savers repository."
pubDate: 2026-06-23
heroImage: "/images/blog/graphify-hero.png"
tags: ["graphify", "claude-code", "tokens", "knowledge-graph", "openrouter"]
draft: false
---

# graphify in Claude Code: a knowledge graph instead of reading the whole repo

In the [token-saving guide](https://www.suenot.com/blog/saving-tokens-llm/) I mentioned graphify briefly as part of the overall stack. Here it gets its own deep dive into how I've set up the automation: exactly what I keep enabled globally and why it doesn't burn Claude tokens.

The problem is simple. To understand someone else's code (or your own from six months ago), the agent reads files in batches, and every file lands in the context. That's expensive on input and on top of that it drags in context rot: the more you pile in, the worse the model thinks. [graphify](https://github.com/safishamsi/graphify) breaks that coupling: once, it builds a knowledge graph from the repo (nodes, relations, communities, god-nodes) that you **query**, instead of dumping files into the window.

Everything is packaged in a single repository — **[suenot/claude-code-token-savers](https://github.com/suenot/claude-code-token-savers)** (the `graphify/` folder, an idempotent `setup.sh`, patches, hooks).

## The main trick: semantics on someone else's tokens

Building the graph is a pile of LLM calls for entity and relation extraction. If you run them through Claude, the savings turn into spending. So semantic extraction is offloaded to **cheap OpenRouter**, not the Claude budget.

`~/.graphify/providers.json`:

```json
{
  "openrouter": {
    "base_url": "https://openrouter.ai/api/v1",
    "default_model": "deepseek/deepseek-v4-flash",
    "env_key": "OPENROUTER_API_KEY",
    "model_env_key": "GRAPHIFY_OPENROUTER_MODEL",
    "pricing": { "input": 0.09, "output": 0.18 },
    "temperature": 0,
    "max_tokens": 16384,
    "vision": false
  }
}
```

`deepseek/deepseek-v4-flash` — $0.09 / $0.18 per 1M tokens, 1M context. Building the graph for a medium project costs **~$0.10 on OpenRouter and zero Claude session tokens**. The model is swapped with a single variable: `export GRAPHIFY_OPENROUTER_MODEL=qwen/qwen3.7-plus`.

An important detail: `graphify install` overwrites `~/.claude/skills/graphify/SKILL.md`. That file hard-codes the extraction backend priority, and if you don't restore it, graphify falls back to Claude subagents and burns your tokens. The correct priority:

1. **OpenRouter** (if `OPENROUTER_API_KEY` is present) — text chunks go here.
2. **Gemini** (if `GEMINI_API_KEY` / `GOOGLE_API_KEY` is present).
3. **Claude subagents** — only as the last fallback.

## Installation

You need [`uv`](https://docs.astral.sh/uv/) and `OPENROUTER_API_KEY` in your environment.

```bash
cd graphify
./setup.sh          # installs graphify, the OpenRouter backend, patches, hooks, no-media
```

`setup.sh` is idempotent (with rollback). Under the hood, if you prefer to do it by hand:

```bash
uv tool install --with watchdog "graphifyy[openai]"   # openai-extra = OpenRouter; watchdog = graphify watch
mkdir -p ~/.graphify
cp providers.json ~/.graphify/providers.json
cp build-and-watch.sh stop-watch.sh precommit-graph-guard.sh ~/.graphify/ && chmod +x ~/.graphify/*.sh
PY="$(sed -n '1s/^#!//p' "$(command -v graphify)")"
"$PY" patch-global-ignore.py     # global ignore layer
"$PY" patch-merge-ignore.py      # merge .gitignore + .graphifyignore (instead of shadowing)
"$PY" patch-no-media.py          # no-media toggle
touch ~/.graphify/no-media       # media off by default
graphify install --platform claude
```

## Auto-watch: the graph updates itself

The heart of the automation is the `SessionStart` hook `build-and-watch.sh`. On every session start it inspects the project and picks a branch:

- **graph exists** → starts `graphify watch` (cheap, AST-only, no LLM) + installs the pre-commit guard → status "watching".
- **graph not initialized** → prints "run `/graphify .`" and does nothing. This is a safeguard: an accidentally opened root or huge folder won't silently go into indexing and burn tokens.
- the `~/.graphify/autobuild` marker → additionally auto-builds small, fresh projects via OpenRouter (cap: 500 files / 2M words; anything larger is skipped with a request to build by hand).

Safety guards: it skips `$HOME`, the FS root, system/`tmp` folders, ancestors of `$HOME`, and any project with `.graphify-skip`. The global kill switch is `~/.graphify/disable-autowatch`. Exactly one watcher per project (atomic `mkdir` lock + PID check). On `SessionEnd` it's killed by `stop-watch.sh`. `watch` updates only the code/AST layer; docs require `/graphify . --update`.

The hook map in `~/.claude/settings.json` (merge, don't overwrite existing ones):

```
SessionStart  -> ~/.graphify/build-and-watch.sh    # status + watch
SessionEnd    -> ~/.graphify/stop-watch.sh          # stop watcher
```

## What won't make it into the graph (and why that matters)

The graph can end up in a commit, which means you can't let secrets into it. Three independent mechanisms:

1. **Secrets and `.env`** — always stripped by the built-in `_is_sensitive` in graphify, no config needed.
2. **Media** — a clean toggle without fiddling with ignore files: `patch-no-media.py` makes `detect()` skip images/pdf/video/office when `~/.graphify/no-media` exists (or `GRAPHIFY_NO_MEDIA=1`). Delete the marker and media is back in play.
3. **`.gitignore` shadowing — fixed.** Upstream, a folder's `.graphifyignore` **completely shadowed** its own `.gitignore`: a pattern present only in `.gitignore` (a secret, say) still got indexed. `patch-merge-ignore.py` merges instead of replacing — this is [PR #1364](https://github.com/safishamsi/graphify/pull/1364) upstream.

On top of that — the **pre-commit guard** (`precommit-graph-guard.sh`), installed into graphified git repos, that **blocks the commit** of `graphify-out/graph.json` if a `.gitignore`-d file made it into the graph. Defense-in-depth against secrets leaking into a committed graph. Bypass with `git commit --no-verify`.

## How to use it

Build once, then query:

```bash
/graphify .                         # build the graph for the current folder
/graphify https://github.com/o/r    # clone the repo and build
/graphify url1 url2 ...              # several repos → one cross-repo graph
/graphify . --mode deep             # more thorough, more INFERRED relations
/graphify . --update                # incremental, only new/changed

/graphify query "where is the token validated and what does that trigger"
/graphify query "..." --dfs         # trace a specific path, not broad context
/graphify query "..." --budget 1500 # cap the answer at N tokens
```

The output is interactive HTML, GraphRAG-JSON, and a human-readable `GRAPH_REPORT.md`; there's also `--mcp` (a stdio server for agents) and `--wiki`. From then on, instead of "read the entire auth module," the agent hits the graph and gets exactly the slice it needs.

## After upgrading graphify

`uv tool upgrade graphifyy` and `graphify install` wipe site-packages (all 3 `detect.py` patches are lost) and overwrite `SKILL.md`. The fix is to run `./setup.sh` again (restores the patches, files, no-media marker) and re-add the backend priority block in `SKILL.md`. What survives the upgrade: `~/.graphify/*`, the hooks in `~/.claude/settings.json`, the per-repo `.git/hooks/pre-commit`.

---

Bottom line: graphify removes the heaviest layer from your context — "read the whole repository" — and does it on someone else's penny-cheap tokens, updating itself in the background and not dragging secrets into the graph. The combo with rtk (command input) and caveman (model output) is covered in the [token-saving guide](https://www.suenot.com/blog/saving-tokens-llm/).
