---
title: "메일 서버 없이 내 도메인으로 이메일 운영하기: Cloudflare로 수신, Resend로 발송, 그리고 AI 에이전트가 메일을 쓰게 하기"
description: "메일 서버 하나 없이 하루 저녁이면 동작하는 you@yourdomain.com 메일함을 조립하는 방법: 무료 Cloudflare Email Routing으로 메일을 받아 Gmail로 포워딩하고, Amazon SES 위에 올라간 Resend API로 발송하며, 보너스로 API를 통해 당신에게 메일을 보내는 Claude Code까지. 수신과 발송이 충돌하지 않는 이유, 실제 Cloudflare와 Resend API 호출, 그리고 내가 부딪힌 함정들을 담았다."
pubDate: 2026-06-23
tags: ["cloudflare", "resend", "email", "dns", "claude-code", "automation"]
draft: false
---

# 메일 서버 없이 내 도메인으로 이메일 운영하기: Cloudflare로 수신, Resend로 발송, 그리고 AI 에이전트가 메일을 쓰게 하기

자체 메일 서버를 운영하는 일은 오래전부터 마조히스트의 몫이었다. Dovecot을 곁들인 Postfix, SPF, DKIM, DMARC, IP 평판을 둘러싼 끝없는 싸움, 그레이리스팅, 단지 당신의 VPS가 "나쁜" 주소 대역에 있다는 이유만으로 Gmail 스팸함에 처박히는 일. 대형 제공자들이 기본으로 주는 것을 얻으려고 수십 시간을 쏟아야 한다.

좋은 소식: "`you@mydomain`을 원하고, 메일은 내 Gmail로 떨어지고, 내 도메인에서 발송도 하고 싶다"는 전형적인 시나리오에서는 메일 서버가 아예 필요 없다. 수신과 발송은 각자 맡은 절반을 당신이 손으로 하는 것보다 더 잘 처리하는 두 서비스로, 그것도 거의 무료로 붙여 맞출 수 있다. 그리고 발송은 결국 HTTP 요청 한 번으로 귀결되기 때문에, 터미널의 AI 에이전트조차 당신에게 메일을 보낼 수 있다.

## 핵심 아이디어: 수신과 발송은 서로 다른 레코드다

당신을 많은 고생에서 구해주는 통찰: **수신과 발송은 서로 다른 DNS 레코드에 살며 서로 간섭하지 않는다.**

- **수신**은 루트 도메인의 **MX 레코드**로 결정된다. 이 레코드가 세상에 알린다: "`@mydomain` 앞으로 온 메일은 여기로 가라."
- **발송**은 **DKIM 서명**과 메시지 봉투(MAIL FROM)에 적힌 내용으로 결정되며, 이것은 별도의 서브도메인으로 옮겨놓을 수 있다.

그래서 이 조합이 충돌 없이 동작한다:

| | 무엇이 담당하나 | DNS에서 어디에 사나 |
|---|---|---|
| **수신** (Cloudflare) | MX → `route1/2/3.mx.cloudflare.net` | 루트 도메인 |
| **발송** (Resend) | DKIM `resend._domainkey`, `send` 서브도메인의 MX+SPF | 서브도메인, 루트 MX는 건드리지 않음 |

수신은 루트 MX를 차지하고, 발송은 `send.mydomain` 서브도메인에 앉아 루트는 절대 건드리지 않는다. 둘을 동시에 켤 수 있고 — 바로 그것이 우리가 할 일이다.

## 수신: Cloudflare Email Routing

[Cloudflare Email Routing](https://developers.cloudflare.com/email-routing/)은 무료 서비스다: `you@mydomain` 같은 주소를 얻고, 그것을 기존 메일함(예컨대 Gmail) 어디로든 포워딩하는 규칙을 정의한다. 저장소도 없고 IMAP도 없다 — MX 레벨에서의 순수한 포워딩이다. 유일한 요건: 도메인이 Cloudflare(그 NS)에서 서비스되어야 한다.

해야 할 일:

1. **Email Routing을 켠다.** 대시보드 → 도메인 → **Email Routing → Enable**. Cloudflare가 자체 MX와 SPF를 추가하고 그것들을 자신의 통제 아래 "잠근다".
2. **수신 주소를 인증한다.** `you@gmail.com`을 입력하면 Cloudflare가 그쪽으로 확인 링크를 보내고 — 당신이 클릭한다. 이 과정 없이는 포워딩이 활성화되지 않는다.
3. **규칙을 만든다.** 특정 규칙(`you@mydomain` → `you@gmail.com`)이든, catch-all(도메인에 도착하는 모든 메일 → 당신의 Gmail)이든.

수신 주소는 계정 전체에 걸쳐 공유된다: `you@gmail.com`을 한 번 인증해두면 당신의 모든 도메인에서 사용할 수 있다.

### API로 자동화할 수 있는 것과 없는 것

여기 첫 번째 솔직한 함정이 있다. 규칙과 주소는 API로 완벽하게 자동화할 수 있다:

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

Catch-all(들어오는 모든 것을 무조건 포워딩):

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

하지만 **Email Routing 자체를 켜는 일은 API 토큰으로 할 수 없다.** `/email/routing`(설정)과 `/email/routing/enable` 엔드포인트는 가능한 가장 넓은 권한 세트 — Email Routing Rules, Email Routing Addresses, DNS, Zone 전부 Edit — 를 가진 토큰에서도 `Authentication error`를 반환한다. 그 첫 스위치는 평범한 API 토큰에는 부여될 수 없는 역할로 잠겨 있다: 대시보드에서 손으로 켜야 한다. 나머지 전부 — 규칙, 주소, DNS 정리 — 는 문제없이 자동화된다.

나머지 자동화를 위해 토큰에는 다음이 필요하다: **Zone:Read**, **DNS:Edit**, **Email Routing Rules:Edit**(zone), **Email Routing Addresses:Edit**(account).

### 도메인에 이미 이메일이 있었다면

두 번째 함정: 루트에 이미 MX 레코드(예컨대 등록기관의 포워딩)가 있으면, Cloudflare는 켤 때 솔직하게 알려준다: *"Existing non-Cloudflare MX records conflict with Email Routing."* 옛 MX는 없애야 한다. 토큰에는 DNS:Edit이 있으니 — 요청으로 그것들을 삭제하고, 김에 외부 루트 SPF도 정리해서 중복이 생기지 않게 하자(루트에는 유효한 SPF 레코드가 정확히 하나만 있어야 한다):

```bash
# get the record id: GET .../dns_records?type=MX&name=yourdomain.com
curl -sS -X DELETE \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID"
```

그 후에 온보딩이 통과되고, Cloudflare가 자신의 MX를 설치하며, 포워딩이 살아난다.

## 발송: Amazon SES 위에 올라간 Resend

수신은 끝났다. 이제 메일이 스팸함에 떨어지지 않도록 당신의 도메인**에서** 발송할 차례다. [Resend](https://resend.com)는 Amazon SES 위에 올라간 이메일 발송 API로, 날것의 SES 대신 사람을 위한 DX를 제공한다. 먼저 도메인을 인증하고, 그다음부터는 메시지당 요청 한 번이다.

도메인을 추가하면 Resend는 세 묶음의 레코드를 건네주는데, 그것들이 **어디로** 가는지가 중요하다:

- **DKIM** — 공개 키(`p=MIGf...`)가 담긴 `resend._domainkey.mydomain`의 TXT 레코드. 서명은 **루트** 도메인(`d=mydomain`)에서 나온다.
- **MAIL FROM** — **서브도메인** `send.mydomain`의 MX와 SPF(`feedback-smtp.<region>.amazonses.com`과 `v=spf1 include:amazonses.com ~all`). 이것이 메시지 봉투다.
- **DMARC** — `_dmarc.mydomain`의 TXT 레코드(`v=DMARC1; p=none;`), 시작은 모니터링 모드로.

주목하라: 이 레코드들 중 어느 것도 **루트 MX를 차지하지 않는다.** 그래서 Resend 발송과 Cloudflare 수신이 하나의 도메인에서 공존한다. 더 좋은 점은, **DKIM 정렬(alignment)** 덕분에 DMARC가 통과한다는 것이다: 서명이 루트에 있어(`d=mydomain`이 `From`의 도메인과 일치) 루트 SPF가 amazonses가 아니라 Cloudflare를 가리키더라도 메시지는 유효하게 유지된다. 핵심 규칙: 수신을 설정할 때 `send.*`, `resend._domainkey`, `_dmarc`는 **건드리지 마라.**

발송 자체는 단 한 번의 POST다:

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

`from`은 인증된 도메인에 있어야 한다 — 로컬 파트(`you`, `noreply`, `billing`, 무엇이든)는 당신이 고른다. Resend에는 개인용과 트랜잭션 메일에 차고 넘치는 무료 등급이 있다(현재 한도는 [resend.com/pricing](https://resend.com/pricing)에 있다).

## 보너스: AI 에이전트가 메일을 보낸다

그리고 바로 이것을 위한 일이었다. 발송은 Bearer 토큰이 붙은 HTTP 요청에 불과하므로, **키를 가진 누구나 보낼 수 있다** — 당신의 코딩 에이전트를 포함해서.

진짜로 시간을 아껴주는 시나리오: [Claude Code](https://claude.com/claude-code)에서 긴 작업 — 마이그레이션, 테스트 실행, 빌드 — 을 시작해놓고, 커피를 가지러 갔다가, 작업이 끝나면 에이전트가 **직접 그 결과를 당신에게 메일로 보낸다.** 터미널을 노려보며 기다릴 필요가 없다.

평범한 말로 에이전트에게 일러두는 것만으로 충분하다: *"끝나면 Resend API로 you@gmail.com에 메일 보내줘"* — 그러면 에이전트는 위와 똑같은 `curl`을 실행하면서 의미 있는 제목과 본문을 채워 넣는다:

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

더 나아가 발송을 Claude Code의 **Stop hook**에 엮을 수도 있다 — 그러면 프롬프트에 한마디도 언급하지 않아도 "세션 완료" 알림이 자동으로 메일로 도착한다. 에이전트에서 당신에게로 가는, 단순하고 믿을 수 있는 알림 채널을 얻는 것이다 — 텔레그램 봇도, 웹훅도 없이, 그냥 평범한 메일로.

## 함정들 (호되게 부딪히며 모은 것)

- **Email Routing 켜기는 대시보드 전용이다.** API 토큰으로는 전체 이메일 권한 세트로도 할 수 없다. 도메인당 수동 클릭 한 번.
- **충돌하는 MX는 제거해야 한다** — 켜기 전에, 그러지 않으면 온보딩이 통과되지 않는다.
- **루트 MX 하나 — 수신자 하나.** Cloudflare와 Resend Inbound 둘 다에 수신을 줄 수는 없다: 양쪽 모두 루트 MX를 원한다. 덧붙이자면, Resend Inbound는 애초에 "메일함으로 포워딩"이 전혀 아니다 — 웹훅으로의 전달이며, Gmail에서 읽기 위한 것이 아니라 프로그래밍적 처리를 위한 것이다.
- **수신 주소는 링크를 클릭해 확인한다** — 메일 안의 링크를. 우회할 방법은 없다 — 남의 메일함으로 포워딩하는 것을 막는 보호 장치다.
- **수신이 Resend 발송을 망치지 않는다** — `send.*`, `resend._domainkey`, `_dmarc`를 건드리지 않는 한. 수신을 켜는 것은 루트 MX와 SPF를 더할 뿐이다.

## 결론

하루 저녁에, 메일 서버 없이, 거의 무료로:

- `you@mydomain`이 메일을 받아 Gmail로 포워딩한다(Cloudflare Email Routing);
- 제대로 된 도달성을 갖추고 `you@mydomain`에서 발송할 수 있다(SES 위의 Resend);
- 수신과 발송은 서로 다른 DNS 레코드에 앉아 있으므로 충돌하지 않는다;
- 그리고 당신의 AI 에이전트는 일을 끝냈을 때 스스로 당신의 받은편지함에 메일을 쓸 수 있다.

"내 도메인의 이메일"이 Postfix와 몇 주씩 씨름하는 것을 의미하던 시대는 끝났다. 이제 그것은 두 개의 서비스, 한 줌의 DNS 레코드, 그리고 몇 개의 curl 요청이다.

---

*추신. 이것은 스펙트럼에서 가장 단순한 끝이었다 — 들어오는 메일이 그냥 Gmail로 떨어진다. 반대를 원한다면 — 들어오는 메일을 처리하고, 읽고, 파싱하고, 스스로 답장을 쓰는 코드 — [cloudflare/agentic-inbox](https://github.com/cloudflare/agentic-inbox)를 살펴보라: AI 에이전트가 딸린 셀프호스트 이메일 클라이언트로, 전부 Cloudflare Workers 위에서 돌아간다. 거기서도 수신은 Email Routing(Worker로의 catch-all)을 통하고, 저장소는 Durable Objects와 R2이며, 에이전트는 Workers AI에서 돌아가며 답장 초안을 작성한다. 이 글과 같은 토대이되, 메일함으로 포워딩하는 대신 에이전트가 구동하는 완전한 받은편지함을 얻는다.*
