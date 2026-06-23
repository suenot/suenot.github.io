---
title: "cctoggle: turn every Claude Code plugin and MCP server off with one command — and back on"
description: "A small utility and global /cctoggle slash command that switches off all Claude Code plugins and user-scope MCP servers at once — clearing their tool definitions out of context — and restores exactly what it disabled. No app restart. Inside: apply semantics, selective disable, backups, and limitations."
pubDate: 2026-06-23
heroImage: "/images/blog/cctoggle-hero.png"
tags: ["cctoggle", "claude-code", "tokens", "mcp", "plugins"]
draft: false
---

# cctoggle: turn every Claude Code plugin and MCP server off with one command

A Claude Code session is rarely bare. Plugins are loaded, user-scope MCP servers are connected, each one ships a bundle of tool definitions, and all of it lands in context before your first message. Sometimes you want the opposite: a clean, lean session for a specific task — and then a one-command restore.

That's what I built [**cctoggle**](https://github.com/suenot/cctoggle) for (public, MIT) — a small utility and a global slash command that flips all plugins and user-scope MCP servers off at once, then restores exactly what it disabled.

## The problem

The more plugins and MCP servers a session carries, the more bloated the context: their tool definitions eat into the token budget and clutter the list of available tools. That's both more expensive (input grows) and worse for quality (the more is piled in, the worse the model navigates it). And doing it by hand means editing two config files, then painfully remembering exactly what you touched so you can put it back.

cctoggle closes both ends: it disables everything with one command and remembers precisely what it disabled, so it can restore only that.

## What it does

Four commands, working both as `/cctoggle` inside Claude Code and as a `cctoggle` CLI in your terminal:

```bash
/cctoggle status          # what's currently enabled/disabled
/cctoggle off             # disable all plugins + user-scope MCP
/cctoggle on              # restore exactly what cctoggle disabled
/cctoggle restore-backup  # roll back to a config backup
```

`off` does two things:

- **Plugins** — flips the `enabledPlugins` flags in `~/.claude/settings.json` to `false`.
- **MCP** — pulls user-scope MCP server definitions out of `~/.claude.json` and stashes them in a local state file.

`on` restores strictly what cctoggle itself disabled. If you'd already turned some plugin or server off by hand earlier, `on` leaves it alone and won't re-enable it. That's an important detail: the command isn't "enable everything," it's "undo my last `off`."

### Selective disable

You don't have to nuke everything. `off` takes arguments:

```bash
cctoggle off --keep superpowers,caveman   # disable all except these
cctoggle off graphify rtk                  # disable only the listed ones
```

## How changes apply (worth understanding)

This is the non-trivial part — plugins and MCP have different apply semantics.

**Plugin changes apply to the CURRENT session** — but only after you type `/reload-plugins`. No full app restart needed.

**MCP config changes apply on your NEXT `claude` session.** There is no live MCP disconnect in Claude Code — it isn't supported. And, less obviously: `/clear` and `/compact` do NOT drop MCP connections. The same process keeps the child MCP servers alive, so clearing context isn't enough — you need a fresh `claude` session.

So the working loop is:

```bash
/cctoggle off        # flag plugins and stash MCP
/reload-plugins      # plugins leave the current session
# for MCP — exit and start claude again
```

## Install

You only need git. Clone the repo and run the installer:

```bash
git clone https://github.com/suenot/cctoggle.git ~/projects/claude && \
  ~/projects/claude/install.sh
```

`install.sh` symlinks the slash command into `~/.claude/commands/` and puts the `cctoggle` CLI on your `PATH`. After that `/cctoggle` is available in every Claude Code session, and `cctoggle` works straight from the terminal.

## Why it's robust

`/cctoggle` is a **user command** (it lives in `~/.claude/commands/`), not a plugin. So it keeps working even after all plugins are disabled. If cctoggle were itself a plugin, the `off` command would shoot itself in the foot — instead, `on` is always at hand no matter what you turned off.

## Backups and privacy

Before every change cctoggle backs up both config files (`~/.claude/settings.json` and `~/.claude.json`) into a `backups/` directory. If something goes wrong, `restore-backup` rolls back to a saved copy.

The state file and backups are gitignored, so your private MCP server definitions (which often hold keys and tokens) never leak into a commit.

## Limitations

One honest limitation to know up front. MCP servers that `claude mcp get <name>` reports as **"Dynamic config (from command line)"** — i.e. injected at launch via command-line flags (e.g. `claude_design`) — cannot be toggled through config at all. They can only be disabled by changing how `claude` is launched and restarting it.

cctoggle **detects and reports** these servers, but it can't toggle them — that's a limitation of the mechanism itself, not of the utility.

---

Bottom line: cctoggle is a fast toggle between a "heavy" session with all plugins and MCP and a "lean" session for the task at hand, with a guarantee that everything comes back exactly as it was. Backups before every step, private MCP definitions stay out of git, and the command itself survives disabling every plugin because it lives in user space. Repo — [github.com/suenot/cctoggle](https://github.com/suenot/cctoggle).
