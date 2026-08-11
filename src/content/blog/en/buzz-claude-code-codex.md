---
title: "Buzz: Put Claude Code and Codex in the Same Room"
description: "Your Claude Code is in one terminal, your Codex is in another, and you are the copy-paste layer between them. Buzz is Block's open-source workspace where agents join channels as members with their own keys — here is how the ACP harness wires them up, what it actually buys you, and what is not finished yet."
pubDate: 2026-08-11
heroImage: "/images/blog/buzz-claude-code-codex-hero.png"
tags: ["buzz", "claude-code", "codex", "agent-client-protocol", "multi-agent", "nostr", "open-source"]
draft: false
---

# Buzz: Put Claude Code and Codex in the Same Room

**Watch the visual explainer:** [Claude Code + Codex in One Channel: Buzz Explained](https://youtu.be/NLopx9QY1Bo)

Your Claude Code runs in one terminal. Your Codex runs in another. When one of them needs to know what the other just concluded, you select the text, switch windows, and paste. You are the integration layer, and you are the slowest part of it.

[Buzz](https://github.com/block/buzz) deletes that job. It's a self-hostable workspace from Block — Apache-2.0, with more than 26,000 GitHub stars at the time of writing — where humans and agents sit in the same channels. Not a bot that posts into your chat: a member, with its own identity, its own channel memberships, and its own audit trail.

## The wiring, since that's what you came for

The piece that connects your existing agents is `buzz-acp`, a harness in the repo:

```
Buzz Relay ──WS──→ buzz-acp ──stdio──→ Your Agent
                                          │
                                       Buzz CLI
                                    (send_message, etc.)
```

The harness listens for @mentions on the relay, prompts your agent over the [Agent Client Protocol](https://agentclientprotocol.com/) on stdin/stdout, and the agent replies through `buzz-cli` — a JSON-in, JSON-out tool built to be called by an LLM rather than typed by a human.

Anything that speaks ACP over stdio plugs in. The docs show two adapter paths plus Goose's native ACP entrypoint:

```bash
# Codex
npm install -g @agentclientprotocol/codex-acp
export OPENAI_API_KEY="sk-..."

# Claude Code (wraps the Claude Agent SDK)
npm install -g @agentclientprotocol/claude-agent-acp
export ANTHROPIC_API_KEY="sk-ant-..."
export BUZZ_ACP_AGENT_COMMAND="claude-agent-acp"

# Goose — native, no adapter
export GOOSE_MODE=auto

buzz-acp   # spawns the agent, connects to the relay, discovers channels, listens
```

One note from the Buzz docs worth having in advance: if the documented `codex-acp` setup logs `426 Upgrade Required` during its ChatGPT WebSocket attempt, Buzz describes that error as expected and non-fatal and recommends `OPENAI_API_KEY` as the fallback.

The protocol is the whole point. You aren't buying into a vendor's agent; you're pointing a generic harness at the agent runtime you choose. Buzz itself adds no separate platform subscription, but that is not the same as zero total cost: you still pay for your model or API access and for the infrastructure that hosts your relay. The documented Codex path requires `OPENAI_API_KEY`; the Claude adapter uses `ANTHROPIC_API_KEY`.

## Identity instead of permission flags

Here's the design decision that makes the rest work, and it's the part worth stealing whether or not you install anything.

Every agent gets its own Nostr keypair. That keypair *is* its identity — the event and signature model comes from [NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md). Running three agents means minting three keypairs.

The membership layers are separate, and the distinction matters. `buzz-admin add-member` registers the public key as a **relay member**. After a membership change, the relay publishes a relay-signed [NIP-43 membership-list snapshot](https://github.com/block/buzz/blob/main/NOSTR.md#relay-membership-nip-43) as event kind `13534`. That event is the relay roster; it is not the agent's keypair and it is not a private-channel membership event. Channel membership is managed separately, and private channels require explicit membership.

The harness then discovers only channels the authenticated agent is allowed to join. Buzz's own `buzz-acp` documentation calls out a current gap here: the relay does not yet expose a REST or event API for channel-member management. Creating a channel through the CLI works because the creator becomes a member automatically.

So scoping an agent isn't a matter of toggling capability flags in a config file. You add it to the channels it should see, exactly as you'd onboard a person, and everything it does is signed under a key you can trace. An agent that shouldn't touch the payments channel simply isn't in the payments channel.

That's a meaningfully different model from the permission-array approach most agent harnesses use, and it's the same instinct behind treating agents as first-class participants that I've written about in [Graph Engineering for Multi-Agent AI](https://www.suenot.com/blog/multi-agent-graph-engineering/) and [Agent Harness Architecture](https://www.suenot.com/blog/agent-harness-architecture/): the boundaries that hold up are the ones the substrate enforces, not the ones a prompt asks for politely.

## One log, not seven tabs

Underneath, Buzz is a Nostr relay. Every message, reaction, patch, CI result, workflow step and review approval is a signed event in a single log — same shape, same identity model, same audit trail, whether a person or a process wrote it. Git activity rides in as NIP-34 events: patches, repo announcements, status.

That sameness is what produces the three things you'd actually use it for.

**Ask the project a question and get receipts.** It's 2am and you type "have we seen this error before?" An agent in the channel searches months of history and posts the threads, the root causes and the fixes — links, not vibes. The question and the answer stay in the channel, so the next person at 2am finds both.

**A branch becomes a room.** Open a feature branch, get a channel. Patches land as events, CI posts results, an agent runs a first-pass review, teammates react to the parts they care about, and the merge decision lands in the same room as the evidence. The channel becomes the record of *why* the code exists — the context that normally evaporates between a PR description and a Slack thread nobody can find.

**A release that writes itself.** A YAML workflow fires on a tag, an agent reads the merged PRs from the project channels, drafts the release notes and posts them for review. Workflows can already trigger on messages, reactions, schedules or webhooks. A human reaction is a natural control surface, but Buzz's status table still lists formal workflow approval gates as "being wired up", so do not treat that final gate as production-ready yet.

And the reason two agents in one channel is more than a gimmick: they can critique each other's work in place. Claude Code proposes, Codex reviews, both see the same thread, and no human relays messages between tabs. If you already run two coding agents daily, that alone is the pitch.

## Getting started

Two paths. The fast one is the packaged desktop app (Tauri + React) from the [latest release](https://github.com/block/buzz/releases/latest) — macOS, Linux and Windows builds. It connects to `ws://localhost:3000` by default; point it elsewhere with `BUZZ_RELAY_URL`. The Windows build isn't code-signed yet, so expect a SmartScreen warning.

The self-host path needs Docker and Hermit (or Rust 1.88+, Node 24+, pnpm 10+, `just`):

```bash
git clone https://github.com/block/buzz.git && cd buzz
. ./bin/activate-hermit
just setup
just build

# run these in separate terminals
just relay   # relay
just dev     # desktop app
```

Relay on `ws://localhost:3000`, desktop app pops up. For a team relay without managing servers, there's a one-click Railway deploy; for a VPS, the production Compose bundle in `deploy/compose/` (Postgres, Redis, MinIO, optional Caddy/TLS). The root `docker-compose.yml` is development-only — don't ship it.

For agents: set `BUZZ_PRIVATE_KEY` and let them call `buzz-cli`.

## What's actually finished

Being straight about the state matters more than hype, so, from the project's own status table:

**Works today:** relay, channels, threads, DMs, canvases, media, search, audit log; the desktop app; `buzz-cli` plus the ACP harness for Goose, Codex and Claude Code; YAML workflows with message, reaction, schedule and webhook triggers; NIP-34 git events and a git hosting backend.

**Still being wired up:** mobile clients (iOS and Android, Flutter), workflow approval gates — the infrastructure exists, the glue doesn't — and huddle lifecycle events.

**Opinions without code yet:** web-of-trust reputation across relays, push notifications.

Two more caveats worth knowing before you commit a team to it. Private channels need explicit membership, and the relay doesn't yet expose a REST or event API for managing channel members — the documented workaround is creating channels via `create_channel` in the CLI, since the creator is automatically a member. And the key rule is not a formality: the secret key isn't stored anywhere and can't be recovered. Lose it and you lose the identity.

The project shipped in the last few months and reads like it. That's the trade for being early enough to shape it.

## Even if you never install it

Three ideas here transfer to whatever you're building:

1. **Give agents identities, not permission arrays.** Membership is easier to reason about, easier to audit, and it degrades sensibly — a key that shouldn't be in a room simply isn't.
2. **Put the conversation and the artifact in the same log.** The reason context evaporates isn't that people don't write things down; it's that the writing lives in a different system from the code, the CI run and the approval.
3. **Let a human reaction be a control surface.** A 👍 as an approval gate costs nothing to learn and is trivially auditable when it's a signed event like everything else.

---

*Sources: the [block/buzz README](https://github.com/block/buzz), [`buzz-acp` documentation](https://github.com/block/buzz/blob/main/crates/buzz-acp/README.md), [Buzz Nostr notes](https://github.com/block/buzz/blob/main/NOSTR.md), [NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md), and [NIP-34](https://github.com/nostr-protocol/nips/blob/master/34.md). Product status and star count were checked on August 11, 2026.*
