---
title: "无需邮件服务器，在自有域名上收发邮件：用 Cloudflare 收信，用 Resend 发信，再让 AI 智能体替你写邮件"
description: "如何在一个晚上搭好一个能用的 you@yourdomain.com 邮箱，完全不需要邮件服务器：通过免费的 Cloudflare Email Routing 收信并转发到 Gmail，通过基于 Amazon SES 的 Resend API 发信，外加一个彩蛋——让 Claude Code 通过 API 给你发邮件。文中讲清楚：为什么收信和发信不冲突，真实的 Cloudflare 和 Resend API 调用，以及我踩过的那些坑。"
pubDate: 2026-06-23
heroImage: "/images/blog/cloudflare-resend-hero.png"
tags: ["cloudflare", "resend", "email", "dns", "claude-code", "automation"]
draft: false
---

# 无需邮件服务器，在自有域名上收发邮件：用 Cloudflare 收信，用 Resend 发信，再让 AI 智能体替你写邮件

自己搭邮件服务器，长期以来都是自虐者干的活。Postfix 配 Dovecot，再加上 SPF、DKIM、DMARC，没完没了地争夺 IP 信誉，灰名单机制，仅仅因为你的 VPS 落在一段"不干净"的地址区间里就被扔进 Gmail 的垃圾邮件夹。要换来那些大厂开箱即用的东西，得花上几十个小时。

好消息是：对于最常见的场景——"我想要 `you@mydomain`，邮件能落进我的 Gmail，并且能用自己的域名发信"——你根本不需要邮件服务器。收信和发信可以由两个服务拼接起来，它们各自把自己那半边的活儿做得比你手工折腾要好得多——而且几乎免费。又因为发信归根结底就是一个 HTTP 请求，所以连终端里的 AI 智能体都能给你发邮件。

## 关键思路：收信和发信是不同的记录

能帮你省去一大堆烦恼的认识是：**收信和发信落在不同的 DNS 记录上，彼此互不干扰。**

- **收信**由根域名的 **MX 记录**决定。它们告诉全世界："发给 `@mydomain` 的邮件到这里来。"
- **发信**由 **DKIM 签名**以及邮件信封里写的内容（MAIL FROM）决定——而这些都可以挪到一个单独的子域名上去。

这就是为什么这个组合能毫无冲突地工作：

| | 由谁处理 | 在 DNS 里落在哪 |
|---|---|---|
| **收信**（Cloudflare） | MX → `route1/2/3.mx.cloudflare.net` | 根域名 |
| **发信**（Resend） | DKIM `resend._domainkey`，`send` 子域名上的 MX+SPF | 子域名，不动根域的 MX |

收信占用根域的 MX，发信落在 `send.mydomain` 子域名上，从不碰根域。你可以把两者同时启用——这正是我们接下来要做的。

## 收信：Cloudflare Email Routing

[Cloudflare Email Routing](https://developers.cloudflare.com/email-routing/) 是一项免费服务：你能得到 `you@mydomain` 这样的地址，并定义规则把它们转发到任意一个已有的邮箱（比如 Gmail）。没有存储，没有 IMAP——纯粹是在 MX 层面做转发。唯一的要求：域名必须托管在 Cloudflare 上（用它的 NS）。

你要做的：

1. **启用 Email Routing。** 控制台 → 域名 → **Email Routing → Enable**。Cloudflare 会加上它自己的 MX 和 SPF，并把它们"锁定"在自己的管控之下。
2. **验证目标地址。** 你填入 `you@gmail.com`，Cloudflare 往那里发一封确认链接的邮件——你点一下。不做这一步，转发就不会生效。
3. **创建规则。** 可以是一条具体规则（`you@mydomain` → `you@gmail.com`），也可以是一条 catch-all（所有到达该域名的邮件 → 你的 Gmail）。

目标地址在整个账户里是共享的：把 `you@gmail.com` 验证一次，它就可用于你所有的域名。

### 哪些能通过 API 自动化，哪些不能

这是第一个老实交代的坑。规则和地址完全可以通过 API 自动化：

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

Catch-all（把进来的所有邮件统统转发）：

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

但是**启用 Email Routing 这件事本身，没法用 API 令牌完成。** `/email/routing`（settings）和 `/email/routing/enable` 这两个接口，即便用一个权限尽可能宽泛的令牌——Email Routing Rules、Email Routing Addresses、DNS、Zone 全部 Edit——也会返回 `Authentication error`。第一个开关被一个普通 API 令牌无法被授予的角色卡住了：你只能在控制台里手动拨动它。其余的一切——规则、地址、DNS 清理——都能顺利自动化。

剩下的自动化部分，令牌需要：**Zone:Read**、**DNS:Edit**、**Email Routing Rules:Edit**（zone）、**Email Routing Addresses:Edit**（account）。

### 如果这个域名之前已经有邮件配置

第二个坑：如果根域上已经有了 MX 记录（比如某个注册商的转发服务），Cloudflare 在启用时会老实地告诉你：*"Existing non-Cloudflare MX records conflict with Email Routing。"* 旧的 MX 必须清掉。令牌有 DNS:Edit——用一个请求把它们删掉，顺手把外来的根域 SPF 也清理干净，免得最后落下重复（根域上应当恰好有一条有效的 SPF 记录）：

```bash
# get the record id: GET .../dns_records?type=MX&name=yourdomain.com
curl -sS -X DELETE \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID"
```

做完这一步，onboarding 就能走通，Cloudflare 装上它自己的 MX，转发也就活了。

## 发信：基于 Amazon SES 的 Resend

收信——搞定。现在要从你的域名**发出**邮件，好让它不落进垃圾邮件夹。[Resend](https://resend.com) 是一个构建在 Amazon SES 之上的发信 API，给你的是人性化的 DX，而不是裸露的 SES。你先验证域名，之后每封邮件就是一个请求。

当你添加一个域名时，Resend 会给你三组记录，而它们**落在哪**很关键：

- **DKIM**——一条位于 `resend._domainkey.mydomain` 的 TXT 记录，带公钥（`p=MIGf...`）。签名来自**根**域名（`d=mydomain`）。
- **MAIL FROM**——**子域名** `send.mydomain` 上的 MX 和 SPF（`feedback-smtp.<region>.amazonses.com` 和 `v=spf1 include:amazonses.com ~all`）。这就是邮件信封。
- **DMARC**——一条位于 `_dmarc.mydomain` 的 TXT 记录（`v=DMARC1; p=none;`），起步阶段处于监控模式。

注意：这些记录里没有一条会**占用根域的 MX**。这正是 Resend 发信和 Cloudflare 收信能在同一个域名上共存的原因。更妙的是，DMARC 能凭借 **DKIM 对齐**（alignment）通过：签名落在根域（`d=mydomain` 与 `From` 里的域名一致），所以即便根域的 SPF 指向 Cloudflare 而非 amazonses，邮件依旧有效。关键规则是：在配置收信时，**不要碰** `send.*`、`resend._domainkey` 和 `_dmarc`。

发信本身就是一个 POST：

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

`from` 必须落在一个已验证的域名上——本地部分（`you`、`noreply`、`billing`，随你挑）由你来定。Resend 有免费额度，对个人邮件和事务性邮件来说绰绰有余（最新的限额见 [resend.com/pricing](https://resend.com/pricing)）。

## 彩蛋：让 AI 智能体来发邮件

而这一切，正是为了下面这件事。既然发信只是一个带 Bearer 令牌的 HTTP 请求，那么**任何持有密钥的人都能发**——包括你的编程智能体。

真正能省时间的场景是：你在 [Claude Code](https://claude.com/claude-code) 里启动一个长耗时任务——一次迁移、一轮测试、一次构建——然后去倒杯咖啡，等它跑完，智能体会**自己把结果用邮件发给你**。不用盯着终端干等。

只要用大白话告诉智能体：*"做完之后，通过 Resend API 给我的 you@gmail.com 发封邮件"*——它就会跑和上面一模一样的 `curl`，并填上有意义的主题和正文：

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

你还可以更进一步，把发信接进 Claude Code 的 **Stop hook**——这样一来，一条"会话已结束"的通知就会自动通过邮件送达，而提示词里完全不必提到它。你由此得到了一条从智能体到你的、简单又可靠的通知通道——不用 Telegram 机器人，不用 webhook，就是普通的邮件。

## 那些坑（都是硬碰硬踩出来的）

- **启用 Email Routing 只能在控制台里做。** API 令牌干不了，哪怕带上完整的邮件权限集。每个域名都得手动点一下。
- **冲突的 MX 必须先删掉**，否则 onboarding 过不去。
- **一条根域 MX——一个收信方。** 你没法把收信同时交给 Cloudflare 和 Resend Inbound：两者都想要根域的 MX。顺带一提，Resend Inbound 根本不是"转发到邮箱"那回事——它是把邮件投递到一个 webhook，用于程序化处理，而不是拿来在 Gmail 里读的。
- **目标地址要靠点击邮件里的链接来确认。** 绕不过去——这是为了防止把邮件转发到别人的邮箱里。
- **收信不会破坏 Resend 发信**——只要你不碰 `send.*`、`resend._domainkey` 和 `_dmarc`。启用收信只会加上根域的 MX 和 SPF。

## 结论

在一个晚上里，不用邮件服务器，而且几乎免费：

- `you@mydomain` 能收信并转发到 Gmail（Cloudflare Email Routing）；
- 你能从 `you@mydomain` 发信，且有像样的送达率（基于 SES 的 Resend）；
- 收信和发信互不冲突，因为它们落在不同的 DNS 记录上；
- 而你的 AI 智能体在干完活之后，能自己往你的收件箱里写信。

"在自有域名上收发邮件"曾意味着几周时间和 Postfix 死磕，那个时代结束了。现在它就是两个服务、几条 DNS 记录，外加几个 curl 请求。

---

*P.S. 这是整条光谱里最简单的一端——进来的邮件就是直接落进 Gmail。如果你想要的是反过来——让代码来处理进来的邮件，自己读它、解析它、写回复——那就看看 [cloudflare/agentic-inbox](https://github.com/cloudflare/agentic-inbox)：一个自托管的、带 AI 智能体的邮件客户端，完全跑在 Cloudflare Workers 上。它的收信同样走 Email Routing（catch-all 进一个 Worker），存储用的是 Durable Objects 和 R2，智能体跑在 Workers AI 上并起草回复。和本文一样的底子，只不过不是转发到邮箱，而是给你一个由智能体驱动的完整收件箱。*
