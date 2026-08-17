---
title: "Email on your own domain without operating a mail server"
description: "A practical split between receiving email with Cloudflare Email Routing and sending it through Resend. How the DNS records fit together, what to verify, and how to let an agent send notifications safely."
pubDate: 2026-06-23
heroImage: "/images/blog/cloudflare-resend-hero.png"
tags: ["cloudflare", "resend", "email", "dns", "claude-code", "automation"]
draft: false
---

# Email on your own domain without operating a mail server

You do not need to run SMTP and IMAP servers to use an address on your own domain. One common arrangement sends incoming mail to an existing mailbox through Cloudflare Email Routing, while Resend sends mail from the domain through its API.

The services have different jobs. Verify their current requirements in the official documentation before changing a live domain.

## Receiving and sending use different DNS records

Incoming email follows MX records. Cloudflare Email Routing can receive mail for a domain and forward it to a verified destination address. It is forwarding, not hosted mailbox storage or IMAP access.

Outgoing email needs domain verification and authentication records. Resend supplies the records for its sending configuration, commonly including DKIM and a MAIL FROM subdomain. A DMARC policy belongs at the domain level. The exact record names and values come from the Resend dashboard for the domain you are verifying.

This separation can allow Cloudflare to handle incoming mail while Resend handles sending. It does not remove the need to inspect existing MX, SPF, DKIM, and DMARC records. A mistaken DNS change can interrupt mail flow or authentication.

## Configure receiving carefully

Enable Email Routing for the domain in Cloudflare, verify the destination mailbox, and create a rule for a specific address or a catch-all. If the domain already has MX records for another receiving service, decide which service should receive mail before enabling routing. There can only be one intended delivery path for the root-domain MX configuration.

Cloudflare documents API endpoints for managing routing rules and destination addresses. Some onboarding actions may require the dashboard or an account role. Check the current [Email Routing documentation](https://developers.cloudflare.com/email-routing/) and API permissions rather than assuming a token can perform every setup step.

## Configure sending separately

Add the domain in [Resend](https://resend.com), publish the verification records it gives you, and wait for verification. Then a message can be submitted through the email API:

```bash
curl -sS https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  --data '{
    "from": "Notifications <bot@yourdomain.com>",
    "to": ["you@example.com"],
    "subject": "Task completed",
    "text": "The task finished. Check the run log for details."
  }'
```

Use an address on a verified domain and follow the provider's current pricing, sending limits, and acceptable-use rules. Authentication records improve deliverability, but no configuration can promise inbox placement at every recipient.

## Agent notifications need a narrow permission

An agent can send the same API request when a task finishes, but an email key is a sending credential. Give it only the permissions and scope it needs, avoid placing the key in tracked files or prompts, and make the recipient and sender fixed where possible. A hook or wrapper can send a predictable completion notice after a successful command.

Review the sent message and delivery result rather than treating an API success response as proof of inbox delivery. For inbound programmatic processing, use a service designed to deliver incoming messages to a webhook or worker instead of a forwarding mailbox.

The useful outcome is modest: a domain address, forwarding to a mailbox you already use, and an API for notifications. The setup stays manageable because receiving, sending, and automation each have a separate configuration boundary.

---

For an agent-oriented incoming-mail design, see [Cloudflare's agentic-inbox](https://github.com/cloudflare/agentic-inbox).
