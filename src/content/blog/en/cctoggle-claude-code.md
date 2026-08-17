---
title: "CCToggle: switch Claude Code plugins and MCP servers on or off"
description: "CCToggle is a small command-line utility for temporarily disabling Claude Code plugins and user-scope MCP servers, then restoring the state it changed. Its commands, configuration scope, and operational limits."
pubDate: 2026-06-23
heroImage: "/images/blog/cctoggle-hero.png"
tags: ["cctoggle", "claude-code", "tokens", "mcp", "plugins"]
draft: false
---

# CCToggle: switch Claude Code plugins and MCP servers on or off

[CCToggle](https://github.com/suenot/cctoggle) is a small utility for changing a Claude Code setup temporarily. It can disable configured plugins and user-scope MCP servers, record what it changed, and restore that recorded state later.

This is useful when you want to test a smaller tool set, isolate a configuration issue, or start a task without optional integrations. Whether fewer tools improve a given workflow is something to measure, not a property of the command itself.

## Commands

The utility provides a slash command and a terminal CLI:

```bash
/cctoggle status
/cctoggle off
/cctoggle on
/cctoggle restore-backup
```

`status` reports the current state. `off` changes the configured plugin and user-scope MCP state. `on` restores the items that CCToggle recorded as disabled. `restore-backup` restores a saved configuration copy.

Selective operation is also available:

```bash
cctoggle off --keep superpowers,caveman
cctoggle off graphify rtk
```

The first form keeps named integrations enabled; the second targets the named integrations. Review the reported plan before applying it, especially in a shared configuration.

## What the utility changes

For plugins, CCToggle updates enabled-plugin settings. For user-scope MCP servers, it changes the definitions stored in Claude Code's user configuration and keeps its own local record of the change. The restore operation is deliberately narrower than "enable everything": it is intended to undo the state that CCToggle itself changed.

That distinction matters when a plugin or server was already disabled for another reason. A state-management tool should avoid silently changing a choice it did not make.

## Applying the change

Plugin and MCP changes do not necessarily take effect at the same time. Reload plugins when Claude Code supports that operation for the current session. For MCP configuration, start a fresh Claude Code session when the existing process has already connected the server. Clearing or compacting a conversation is not a substitute for restarting the process that owns an MCP connection.

Servers supplied dynamically at launch, rather than through user configuration, are outside this mechanism. Change the launch command and start a new process to alter those servers.

## Installation and recovery

The repository documents installation through its `install.sh` script:

```bash
git clone https://github.com/suenot/cctoggle.git ~/projects/claude
~/projects/claude/install.sh
```

Before relying on it in a working setup, inspect the installer and make a backup of your configuration. CCToggle also keeps configuration backups for its own recovery command. Treat those backups as sensitive if MCP definitions contain credentials, and do not commit them to a repository.

The utility is a user command rather than a plugin, so its restore path remains available after plugins are disabled. Read the [CCToggle repository](https://github.com/suenot/cctoggle) for current commands and configuration details.
