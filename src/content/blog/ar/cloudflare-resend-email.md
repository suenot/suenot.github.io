---
title: "بريد إلكتروني على نطاقك الخاص بدون خادم بريد: استقبل عبر Cloudflare، أرسل عبر Resend، ودع وكيل ذكاء اصطناعي يكتب الرسائل"
description: "كيف تجمّع صندوق بريد you@yourdomain.com يعمل فعلياً في مساء واحد بدون أي خادم بريد على الإطلاق: استقبل البريد عبر خدمة Cloudflare Email Routing المجانية المعاد توجيهها إلى Gmail، أرسل عبر واجهة Resend المبنية على Amazon SES، وكمكافأة — Claude Code الذي يراسلك عبر الـ API. في الداخل: لماذا لا يتعارض الاستقبال مع الإرسال، استدعاءات حقيقية لواجهتي Cloudflare وResend، والمطبات التي واجهتها."
pubDate: 2026-06-23
tags: ["cloudflare", "resend", "email", "dns", "claude-code", "automation"]
draft: false
---

# بريد إلكتروني على نطاقك الخاص بدون خادم بريد: استقبل عبر Cloudflare، أرسل عبر Resend، ودع وكيل ذكاء اصطناعي يكتب الرسائل

تشغيل خادم بريد خاص بك كان منذ زمن طويل مهمة لمحبي تعذيب أنفسهم. Postfix مع Dovecot، وSPF، وDKIM، وDMARC، والمعركة اللانهائية من أجل سمعة عنوان الـ IP، والـ greylisting، والهبوط في مجلد الرسائل المزعجة في Gmail لمجرد أن خادمك الافتراضي يقع في نطاق عناوين "سيئ". عشرات الساعات للحصول على ما يقدمه المزودون الكبار جاهزاً منذ البداية.

الخبر السار: للسيناريو النموذجي — "أريد `you@mydomain`، مع وصول البريد إلى Gmail الخاص بي والقدرة على الإرسال من نطاقي الخاص" — لست بحاجة إلى خادم بريد على الإطلاق. يمكن لصق الاستقبال والإرسال معاً من خدمتين، تؤدي كل منهما نصفها من العمل أفضل مما ستفعله أنت يدوياً على الإطلاق — وبشكل شبه مجاني. وبما أن الإرسال يتلخص في طلب HTTP واحد، فحتى وكيل ذكاء اصطناعي في الطرفية يمكنه مراسلتك.

## الفكرة الأساسية: الاستقبال والإرسال سجلان مختلفان

الفكرة التي توفر عليك الكثير من المتاعب: **الاستقبال والإرسال يعيشان في سجلات DNS مختلفة ولا يتداخلان مع بعضهما.**

- **الاستقبال** تحدده **سجلات MX** للنطاق الجذر. إنها تخبر العالم: "بريد `@mydomain` يذهب إلى هنا."
- **الإرسال** يحدده **توقيع DKIM** وما هو مكتوب في مغلف الرسالة (MAIL FROM) — وهذا يمكن نقله إلى نطاق فرعي منفصل.

ولهذا يعمل هذا المزيج بلا تعارض:

| | ما يتولى الأمر | أين يعيش في DNS |
|---|---|---|
| **الاستقبال** (Cloudflare) | MX ← `route1/2/3.mx.cloudflare.net` | النطاق الجذر |
| **الإرسال** (Resend) | DKIM `resend._domainkey`، وMX+SPF على النطاق الفرعي `send` | نطاق فرعي، لا يمس MX الجذر |

الاستقبال يستحوذ على MX الجذر، والإرسال يجلس على النطاق الفرعي `send.mydomain` ولا يلمس الجذر أبداً. يمكنك تفعيل كليهما في آنٍ واحد — وهذا بالضبط ما سنفعله.

## الاستقبال: Cloudflare Email Routing

خدمة [Cloudflare Email Routing](https://developers.cloudflare.com/email-routing/) مجانية: تحصل على عناوين مثل `you@mydomain` وتحدد قواعد لإعادة توجيهها إلى أي صندوق بريد موجود (Gmail مثلاً). لا تخزين، لا IMAP — مجرد إعادة توجيه على مستوى MX. الشرط الوحيد: أن يُدار النطاق على Cloudflare (عبر خوادم أسمائه NS).

ما عليك فعله:

1. **فعّل Email Routing.** لوحة التحكم ← النطاق ← **Email Routing ← Enable**. تضيف Cloudflare سجلي MX وSPF الخاصين بها و"تقفلهما" تحت سيطرتها.
2. **تحقق من عنوان الوجهة.** تدخل `you@gmail.com`، فترسل Cloudflare رابط تأكيد إلى هناك — تنقر عليه. بدون هذا لن يُفعّل إعادة التوجيه.
3. **أنشئ قاعدة.** إما قاعدة محددة (`you@mydomain` ← `you@gmail.com`) أو قاعدة catch-all (كل ما يصل إلى النطاق ← Gmail الخاص بك).

عناوين الوجهة مشتركة عبر الحساب بأكمله: تحقق من `you@gmail.com` مرة واحدة، ويصبح متاحاً لجميع نطاقاتك.

### ما يمكن أتمتته عبر الـ API، وما لا يمكن

ها هو أول مطب صادق. القواعد والعناوين قابلة للأتمتة تماماً عبر الـ API:

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

قاعدة catch-all (أعد توجيه كل ما يصل دون استثناء):

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

لكن **تفعيل Email Routing نفسه لا يمكن القيام به برمز API.** نقطتا النهاية `/email/routing` (الإعدادات) و`/email/routing/enable` تعيدان `Authentication error` حتى مع رمز يملك أوسع مجموعة صلاحيات ممكنة — Email Routing Rules، وEmail Routing Addresses، وDNS، وZone، كلها على Edit. ذلك المفتاح الأول محمي بدور لا يمكن منحه لرمز API عادي: تقلبه في لوحة التحكم يدوياً. كل شيء آخر — القواعد، العناوين، تنظيف DNS — يُؤتمت بلا مشاكل.

لبقية الأتمتة يحتاج الرمز إلى: **Zone:Read**، و**DNS:Edit**، و**Email Routing Rules:Edit** (zone)، و**Email Routing Addresses:Edit** (account).

### إذا كان النطاق يملك بريداً مسبقاً

المطب الثاني: إذا كان الجذر يملك سجلات MX مسبقاً (إعادة توجيه من المُسجِّل مثلاً)، فستخبرك Cloudflare بصدق عند التفعيل: *"Existing non-Cloudflare MX records conflict with Email Routing."* سجلات MX القديمة يجب أن تذهب. الرمز يملك DNS:Edit — احذفها بطلب ونظّف سجل SPF الجذر الأجنبي في الوقت نفسه، حتى لا تنتهي بنسخ مكررة (يجب أن يكون هناك سجل SPF صالح واحد بالضبط على الجذر):

```bash
# get the record id: GET .../dns_records?type=MX&name=yourdomain.com
curl -sS -X DELETE \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID"
```

بعد ذلك تمر عملية الإعداد، وتثبّت Cloudflare سجلات MX الخاصة بها، ويدبّ إعادة التوجيه في الحياة.

## الإرسال: Resend فوق Amazon SES

الاستقبال — تمّ. الآن لنرسل **من** نطاقك حتى لا يهبط البريد في مجلد الرسائل المزعجة. [Resend](https://resend.com) هو واجهة API لإرسال البريد مبنية فوق Amazon SES، بتجربة مطور إنسانية بدلاً من SES الخام. أولاً تتحقق من النطاق، ثم يصبح الأمر طلباً واحداً لكل رسالة.

عندما تضيف نطاقاً، يسلّمك Resend ثلاث مجموعات من السجلات، و**أين** تذهب أمر مهم:

- **DKIM** — سجل TXT عند `resend._domainkey.mydomain` يحمل المفتاح العام (`p=MIGf...`). التوقيع يأتي من النطاق **الجذر** (`d=mydomain`).
- **MAIL FROM** — سجلا MX وSPF على النطاق **الفرعي** `send.mydomain` (`feedback-smtp.<region>.amazonses.com` و`v=spf1 include:amazonses.com ~all`). هذا هو مغلف الرسالة.
- **DMARC** — سجل TXT عند `_dmarc.mydomain` (`v=DMARC1; p=none;`)، في وضع المراقبة كبداية.

لاحظ: لا يوجد أي من هذه السجلات **يستحوذ على MX الجذر**. ولهذا يتعايش إرسال Resend واستقبال Cloudflare على نطاق واحد. والأفضل من ذلك، أن DMARC يمر بفضل **محاذاة DKIM**: التوقيع على الجذر (`d=mydomain` يطابق النطاق في `From`)، فتبقى الرسالة صالحة حتى لو كان SPF الجذر يشير إلى Cloudflare بدلاً من amazonses. القاعدة الأساسية: عند إعداد الاستقبال، **لا تمس** `send.*`، أو `resend._domainkey`، أو `_dmarc`.

الإرسال نفسه هو طلب POST واحد:

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

يجب أن يكون `from` على نطاق تم التحقق منه — أما الجزء المحلي (`you`، أو `noreply`، أو `billing`، أو أياً كان) فهو من اختيارك. لدى Resend خطة مجانية أكثر من كافية للبريد الشخصي والمعاملاتي (الحدود الحالية على [resend.com/pricing](https://resend.com/pricing)).

## المكافأة: وكيل الذكاء الاصطناعي يرسل الرسائل

وها هو ما كان كل هذا من أجله. بما أن الإرسال مجرد طلب HTTP برمز Bearer، فإن **أي شخص يملك المفتاح يمكنه الإرسال** — بما في ذلك وكيل البرمجة لديك.

السيناريو الذي يوفر الوقت فعلاً: تطلق مهمة طويلة في [Claude Code](https://claude.com/claude-code) — ترحيل، أو تشغيل اختبارات، أو بناء — تذهب لتحضر قهوة، وعندما تنتهي **يراسلك الوكيل بالنتيجة بنفسه**. لا تحديق في طرفية بانتظار.

يكفي أن تخبر الوكيل بلغة بسيطة: *"عندما تنتهي، راسلني على you@gmail.com عبر واجهة Resend"* — فيشغّل نفس أمر `curl` أعلاه بالضبط، ويملأ موضوعاً ونصاً ذا معنى:

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

يمكنك المضي أبعد وربط الإرسال بـ **Stop hook** في Claude Code — فيصلك إشعار "انتهت الجلسة" بالبريد تلقائياً، دون أي ذكر له في الموجّه. تحصل على قناة إشعار بسيطة وموثوقة من الوكيل إليك — لا روبوتات Telegram، ولا webhooks، مجرد بريد عادي.

## المطبات (المجمَّعة بالطريقة الصعبة)

- **تفعيل Email Routing لا يكون إلا عبر لوحة التحكم.** رمز API لا يستطيع فعله، حتى مع مجموعة صلاحيات البريد الكاملة. نقرة يدوية واحدة لكل نطاق.
- **سجلات MX المتعارضة يجب إزالتها** قبل التفعيل، وإلا لن تمر عملية الإعداد.
- **MX جذر واحد — مستقبِل واحد.** لا يمكنك إعطاء الاستقبال لكل من Cloudflare وResend Inbound في آنٍ واحد: كلاهما يريد MX الجذر. وبالمناسبة، Resend Inbound ليس "إعادة توجيه إلى صندوق بريد" على الإطلاق — إنه تسليم إلى webhook، للمعالجة البرمجية، لا للقراءة في Gmail.
- **الوجهة تُؤكَّد بالنقر** على رابط في رسالة. لا مفر من ذلك — إنها حماية من إعادة التوجيه إلى صندوق بريد شخص آخر.
- **الاستقبال لا يكسر إرسال Resend** — طالما أنك لا تمس `send.*`، و`resend._domainkey`، و`_dmarc`. تفعيل الاستقبال يضيف فقط MX وSPF على الجذر.

## الخلاصة

في مساء واحد، بدون خادم بريد وبشكل شبه مجاني:

- `you@mydomain` يستقبل البريد ويعيد توجيهه إلى Gmail (Cloudflare Email Routing)؛
- يمكنك الإرسال من `you@mydomain` بقابلية تسليم سليمة (Resend فوق SES)؛
- الاستقبال والإرسال لا يتعارضان، لأنهما يجلسان على سجلات DNS مختلفة؛
- ويمكن لوكيل الذكاء الاصطناعي لديك أن يكتب إلى صندوق بريدك بنفسه عند انتهائه من مهمة.

انتهى الزمن الذي كان فيه "البريد على نطاقك الخاص" يعني أسابيع من المصارعة مع Postfix. الآن هو خدمتان، وحفنة من سجلات DNS، وطلبا curl.

---

*ملاحظة أخيرة: كان هذا الطرف الأبسط من الطيف — البريد الوارد يهبط ببساطة في Gmail. إذا أردت العكس — كود يتولى البريد الوارد، يقرأه، ويحلله، ويكتب الردود بنفسه — فألقِ نظرة على [cloudflare/agentic-inbox](https://github.com/cloudflare/agentic-inbox): عميل بريد ذاتي الاستضافة مع وكيل ذكاء اصطناعي، يعمل بالكامل على Cloudflare Workers. الاستقبال هناك أيضاً عبر Email Routing (catch-all إلى Worker)، والتخزين هو Durable Objects وR2، والوكيل يعمل على Workers AI ويصوغ الردود. الأساس نفسه المستخدم في هذا المقال، فقط بدلاً من إعادة التوجيه إلى صندوق بريد تحصل على صندوق وارد كامل يقوده وكيل.*
