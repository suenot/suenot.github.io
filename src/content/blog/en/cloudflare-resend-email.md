---
title: "Email on your own domain without a mail server: receive via Cloudflare, send via Resend, and let an AI agent write the emails"
description: "How to assemble a working you@yourdomain.com mailbox in one evening with no mail server at all: receive mail through free Cloudflare Email Routing forwarded to Gmail, send through the Resend API on top of Amazon SES, and as a bonus — Claude Code that emails you over the API. Inside: why receiving and sending don't conflict, real Cloudflare and Resend API calls, and the gotchas I hit."
pubDate: 2026-06-23
heroImage: "/images/blog/cloudflare-resend-hero.png"
tags: ["cloudflare", "resend", "email", "dns", "claude-code", "automation"]
draft: false
---

# Email on your own domain without a mail server: receive via Cloudflare, send via Resend, and let an AI agent write the emails

Running your own mail server has long been a job for masochists. Postfix with Dovecot, SPF, DKIM, DMARC, the endless fight for IP reputation, greylisting, landing in Gmail's spam folder simply because your VPS lives in a "bad" address range. Dozens of hours to get what the big providers give you out of the box.

The good news: for the typical scenario — "I want `you@mydomain`, with mail dropping into my Gmail and the ability to send from my own domain" — you don't need a mail server at all. Receiving and sending can be glued together from two services that each do their half of the job better than you ever will by hand — and nearly for free. And since sending boils down to a single HTTP request, even a terminal AI agent can email you.

## The key idea: receiving and sending are different records

The insight that saves you a lot of grief: **receiving and sending live on different DNS records and don't interfere with each other.**

- **Receiving** is determined by the **MX records** of the root domain. They tell the world: "mail for `@mydomain` goes here."
- **Sending** is determined by the **DKIM signature** and by what's written in the message's envelope (MAIL FROM) — and that can be moved off to a separate subdomain.

That's why the combo works without conflict:

| | What handles it | Where it lives in DNS |
|---|---|---|
| **Receiving** (Cloudflare) | MX → `route1/2/3.mx.cloudflare.net` | root domain |
| **Sending** (Resend) | DKIM `resend._domainkey`, MX+SPF on the `send` subdomain | subdomain, leaves the root MX alone |

Receiving claims the root MX, sending sits on the `send.mydomain` subdomain and never touches the root. You can enable both at once — which is exactly what we'll do.

## Receiving: Cloudflare Email Routing

[Cloudflare Email Routing](https://developers.cloudflare.com/email-routing/) is a free service: you get addresses like `you@mydomain` and define rules to forward them to any existing mailbox (Gmail, say). No storage, no IMAP — pure forwarding at the MX level. The one requirement: the domain has to be served on Cloudflare (its NS).

What you do:

1. **Enable Email Routing.** Dashboard → domain → **Email Routing → Enable**. Cloudflare adds its own MX and SPF and "locks" them under its control.
2. **Verify the destination address.** You enter `you@gmail.com`, Cloudflare mails a confirmation link there — you click it. Without this, forwarding won't activate.
3. **Create a rule.** Either a specific one (`you@mydomain` → `you@gmail.com`) or a catch-all (everything arriving at the domain → your Gmail).

Destination addresses are shared across the whole account: verify `you@gmail.com` once, and it's available for all your domains.

### What you can automate via the API, and what you can't

Here's the first honest gotcha. Rules and addresses are perfectly automatable via the API:

```bash
# Rule: you@yourdomain.com -> you@gmail.com
curl -sS -X POST \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/email/routing/rules" \
  --data '{
    "name": "forward you@ -> gmail",
    "enabled": true,
    "matchers": [{ "type": "literal", "field": "to", "value": "you@yourdomain.com" }],
    "actions":  [{ "type": "forward", "value": ["you@gmail.com"] }]
  }'
```

Catch-all (forward absolutely everything that comes in):

```bash
curl -sS -X PUT \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/email/routing/rules/catch_all" \
  --data '{
    "enabled": true,
    "matchers": [{ "type": "all" }],
    "actions":  [{ "type": "forward", "value": ["you@gmail.com"] }]
  }'
```

But **enabling Email Routing itself cannot be done with an API token.** The `/email/routing` (settings) and `/email/routing/enable` endpoints return `Authentication error` even on a token with the broadest possible permission set — Email Routing Rules, Email Routing Addresses, DNS, Zone, all in Edit. That first switch is gated by a role that an ordinary API token can't be granted: you flip it in the dashboard by hand. Everything else — rules, addresses, DNS cleanup — automates fine.

For the rest of the automation the token needs: **Zone:Read**, **DNS:Edit**, **Email Routing Rules:Edit** (zone), **Email Routing Addresses:Edit** (account).

### If the domain already had email

The second gotcha: if the root already has MX records (a registrar's forwarding, for instance), Cloudflare will honestly tell you on enable: *"Existing non-Cloudflare MX records conflict with Email Routing."* The old MX have to go. The token has DNS:Edit — delete them with a request and clean up the foreign root SPF while you're at it, so you don't end up with duplicates (there should be exactly one valid SPF record on the root):

```bash
# get the record id: GET .../dns_records?type=MX&name=yourdomain.com
curl -sS -X DELETE \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID"
```

After that the onboarding goes through, Cloudflare installs its MX, and forwarding comes alive.

## Sending: Resend on top of Amazon SES

Receiving — done. Now to send **from** your domain so the mail doesn't land in spam. [Resend](https://resend.com) is an email-sending API built on top of Amazon SES, with a human DX instead of raw SES. First you verify the domain, then it's one request per message.

When you add a domain, Resend hands you three sets of records, and **where** they go matters:

- **DKIM** — a TXT record at `resend._domainkey.mydomain` with the public key (`p=MIGf...`). The signature comes from the **root** domain (`d=mydomain`).
- **MAIL FROM** — MX and SPF on the **subdomain** `send.mydomain` (`feedback-smtp.<region>.amazonses.com` and `v=spf1 include:amazonses.com ~all`). This is the message envelope.
- **DMARC** — a TXT record at `_dmarc.mydomain` (`v=DMARC1; p=none;`), in monitoring mode to start.

Notice: none of these records **claim the root MX**. That's why Resend sending and Cloudflare receiving coexist on a single domain. Better still, DMARC passes thanks to **DKIM alignment**: the signature is on the root (`d=mydomain` matches the domain in `From`), so the message stays valid even though the root SPF points at Cloudflare rather than amazonses. The key rule: when setting up receiving, **don't touch** `send.*`, `resend._domainkey`, or `_dmarc`.

Sending itself is a single POST:

```bash
curl -sS https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  --data '{
    "from": "You <you@yourdomain.com>",
    "to": ["you@gmail.com"],
    "subject": "Hi from your own domain",
    "text": "Sent through Resend, delivered through Cloudflare."
  }'
```

`from` must be on a verified domain — the local part (`you`, `noreply`, `billing`, whatever) is yours to pick. Resend has a free tier that's more than enough for personal and transactional mail (current limits are on [resend.com/pricing](https://resend.com/pricing)).

## Bonus: the AI agent sends the emails

And here's what this was all for. Since sending is just an HTTP request with a Bearer token, **anyone with the key can send** — including your coding agent.

The scenario that genuinely saves time: you kick off a long task in [Claude Code](https://claude.com/claude-code) — a migration, a test run, a build — go grab a coffee, and when it's done the agent **emails you the result itself**. No staring at a terminal waiting.

It's enough to tell the agent in plain language: *"when you're done, email me at you@gmail.com via the Resend API"* — and it runs the exact same `curl` as above, filling in a meaningful subject and body:

```bash
curl -sS https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  --data '{
    "from": "Claude Code <bot@yourdomain.com>",
    "to": ["you@gmail.com"],
    "subject": "Build is ready: 142 tests green",
    "text": "Migration applied, the run took 8 minutes, nothing failed. Log in the artifacts."
  }'
```

You can go further and wire the send into a **Stop hook** in Claude Code — then a "session finished" notification arrives by email automatically, with no mention of it in the prompt. You get a simple, reliable notification channel from the agent to you — no Telegram bots, no webhooks, just plain mail.

## Gotchas (collected the hard way)

- **Enabling Email Routing is dashboard-only.** An API token can't do it, even with the full email permission set. One manual click per domain.
- **Conflicting MX must be removed** before enabling, or onboarding won't pass.
- **One root MX — one receiver.** You can't give receiving to both Cloudflare and Resend Inbound at once: both want the root MX. Resend Inbound, by the way, isn't "forward to a mailbox" at all — it's delivery to a webhook, for programmatic processing, not for reading in Gmail.
- **The destination is confirmed by clicking** a link in an email. There's no way around it — it's protection against forwarding to someone else's mailbox.
- **Receiving doesn't break Resend sending** — as long as you don't touch `send.*`, `resend._domainkey`, and `_dmarc`. Enabling receiving only adds root MX and SPF.

## Bottom line

In a single evening, with no mail server and nearly for free:

- `you@mydomain` receives mail and forwards it to Gmail (Cloudflare Email Routing);
- you can send from `you@mydomain` with proper deliverability (Resend on top of SES);
- receiving and sending don't conflict, because they sit on different DNS records;
- and your AI agent can write to your inbox itself when it's finished a job.

The era when "email on your own domain" meant weeks of wrestling with Postfix is over. Now it's two services, a handful of DNS records, and a couple of curl requests.

---

*P.S. This was the simplest end of the spectrum — incoming mail just drops into Gmail. If you want the opposite — code that handles the incoming mail, reads it, parses it, and writes replies itself — take a look at [cloudflare/agentic-inbox](https://github.com/cloudflare/agentic-inbox): a self-hosted email client with an AI agent, running entirely on Cloudflare Workers. Receiving there is also via Email Routing (catch-all into a Worker), storage is Durable Objects and R2, and the agent runs on Workers AI and drafts replies. The same foundation as this article, only instead of forwarding to a mailbox you get a full inbox driven by an agent.*
