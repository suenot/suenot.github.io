---
title: "Clother: separate Claude Code launchers for separate providers"
description: "How Clother keeps provider settings scoped to a Claude Code launch, how to inspect a profile before use, and where wrappers stop helping."
pubDate: 2026-04-19
heroImage: "/images/blog/clother-claude-hero.png"
tags: ["claude-code", "clother", "llm", "providers", "tooling"]
draft: false
---

# Clother: separate Claude Code launchers for separate providers

Using several model providers with Claude Code can turn a shell configuration into a mess. A base URL and a token that were meant for one experiment stay in the environment, then a later session quietly uses the wrong endpoint.

[Clother](https://github.com/jolehuit/clother) is a launcher for that problem. It starts the real `claude` process with a selected provider's environment variables. The settings apply to that process rather than becoming a permanent change to the shell or `~/.claude`.

That scope is the useful part. It lets you test a provider in one terminal while another terminal keeps its existing setup. It does not make provider APIs identical or make an untrusted endpoint safe.

## Start with a named profile

Clother uses `clother-<provider>` launchers for built-in profiles and a generic custom-provider launcher for profiles you add. Its current README is the authority for supported names, installation, and configuration format. Provider menus and model defaults move often enough that copying an old list into a shell alias is a bad habit.

The safe routine is short:

```bash
clother info <provider>
clother test
clother-<provider>
```

Read the resolved endpoint and model before launching. Run a small task first. If the provider does not understand tool calls, system prompts, streaming, or a reasoning format that the client expects, the wrapper cannot repair that protocol mismatch.

## Keep secrets outside the profile

Use environment variables or a secret manager for API keys. A configuration field such as `api_key_env` should name a variable, not contain the key itself. Review file permissions for any local secrets file that the tool creates.

The same principle applies to custom endpoints. A localhost URL may route to a local model, a gateway, or a tunnel to a remote service. Check the full path before deciding that a session is private.

## Be deliberate with permissions and resumes

Clother can pass regular Claude Code flags through to the launched client. In particular, permission-skipping modes are convenient for disposable batch work and risky in a main repository. Use them only after choosing a restricted workspace and a review point.

Resuming a conversation across providers deserves the same care. A transcript can contain provider-specific tool or reasoning data. Confirm the current Clother documentation and inspect the session before assuming that a resume will behave like a native continuation.

## When a wrapper is enough

Clother is a good fit when you want to keep the official Claude Code workflow and make the provider choice explicit per terminal. It is less useful when a team needs centralized quotas, audit logs, routing rules, or a common credential policy. Those needs belong in a gateway or operational layer, not in a launcher script.

For everyday use, keep profiles few, name them plainly, inspect each one after a change, and retain the default Claude Code command for the workflow you trust. See the [token-saving guide](/blog/saving-tokens-llm) for the related cost and context discussion.
