---
title: "Using graphify with Claude Code"
description: "A practical graphify setup for Claude Code: build a searchable map of a repository, keep extraction separate from the main session, update the graph carefully, and check it before committing."
pubDate: 2026-06-23
heroImage: "/images/blog/graphify-hero.png"
tags: ["graphify", "claude-code", "tokens", "knowledge-graph", "openrouter"]
draft: false
---

# Using graphify with Claude Code

[graphify](https://github.com/safishamsi/graphify) turns a repository into a graph of files, entities, and relations. Instead of asking an agent to read a large module end to end, you can query the graph for a smaller piece of evidence. That is useful when you are entering an unfamiliar codebase or returning to one after a long break.

My setup lives in [suenot/claude-code-token-savers](https://github.com/suenot/claude-code-token-savers), in the `graphify/` directory. It is deliberately split in two: semantic extraction uses a separate provider, while Claude Code queries the finished graph during the main session. The provider, model IDs, prices, and limits change, so check them before treating this as a cost-saving recipe.

## Set up the extraction provider

`graphify` needs a provider configuration for relation extraction. This example sends compatible requests through OpenRouter. Keep the key in an environment variable, not in the file.

```json
{
  "openrouter": {
    "base_url": "https://openrouter.ai/api/v1",
    "default_model": "YOUR_CURRENT_MODEL_ID",
    "env_key": "OPENROUTER_API_KEY",
    "model_env_key": "GRAPHIFY_OPENROUTER_MODEL",
    "temperature": 0,
    "max_tokens": 16384,
    "vision": false
  }
}
```

Put the configuration at `~/.graphify/providers.json` and select a model from the provider's current catalog. Confirm the extraction order after running `graphify install`: installations and upgrades can replace `~/.claude/skills/graphify/SKILL.md`. In this setup, OpenRouter is preferred when its key exists, Gemini is the next option, and Claude subagents are the fallback.

## Install the local pieces

You need [`uv`](https://docs.astral.sh/uv/) and an `OPENROUTER_API_KEY` if you use the example provider. The repository setup script installs graphify, copies the helper scripts, and applies its local patches:

```bash
cd graphify
./setup.sh
```

The manual path is useful when you want to inspect each step. It installs `graphifyy` with its OpenAI extra, writes the provider configuration, copies the helpers into `~/.graphify/`, and runs `graphify install --platform claude`. Read the current script before running it because package names, installation behavior, and patches can change.

## Update without indexing by surprise

The setup can register a `SessionStart` hook that runs `build-and-watch.sh`. If a graph already exists, the hook starts `graphify watch`; if it does not, it asks you to run `/graphify .` yourself. That distinction matters. Opening a large directory should not silently start an expensive indexing job.

`~/.claude/settings.json` needs merged hook entries rather than a replacement of the whole file:

```
SessionStart  -> ~/.graphify/build-and-watch.sh
SessionEnd    -> ~/.graphify/stop-watch.sh
```

The helper scripts in this setup also skip broad or risky paths, respect `.graphify-skip`, and provide `~/.graphify/disable-autowatch` as an off switch. A lock and PID check aim to keep one watcher per project. `watch` focuses on the code and AST layer; refresh documentation with `/graphify . --update` when needed.

## Treat graph output as data that may be committed

Graph output can contain more than code structure. Review it before adding `graphify-out/` to a commit.

The local setup has several safeguards:

- graphify's sensitive-data detection handles common secret files;
- the optional `no-media` marker keeps media out of detection;
- `patch-merge-ignore.py` changes the local ignore behavior so `.gitignore` and `.graphifyignore` are combined rather than one hiding the other;
- `precommit-graph-guard.sh` checks whether ignored files reached `graphify-out/graph.json` and can stop the commit.

These checks reduce risk; they do not replace a review of generated output. Treat `git commit --no-verify` as a deliberate override, not a routine workaround.

## Query the graph

Build it once, then ask focused questions:

```bash
/graphify .
/graphify . --update
/graphify query "where is the token validated and what does that trigger"
/graphify query "..." --dfs
/graphify query "..." --budget 1500
```

graphify can also produce HTML, GraphRAG JSON, `GRAPH_REPORT.md`, an MCP server, and a wiki view. The useful habit is simple: query the graph for a narrow trail first, then open the source files that trail identifies. A graph is an aid to investigation, not a substitute for reading the code that you change.

After a graphify upgrade, run `./setup.sh` again and inspect the provider priority and local patches. The configuration under `~/.graphify/`, Claude hooks, and repository hooks may survive, but installed package files can be replaced.

For the surrounding workflow, see the [token-saving guide](https://www.suenot.com/blog/saving-tokens-llm/).
