---
title: "Gonka تمنح 10 دولارات مجانًا بدون بطاقة: مليارات من رموز Kimi K2.6 للشركات الناشئة في الذكاء الاصطناعي"
description: "تمنح GonkaGate رصيدًا مجانيًا بقيمة 10 دولارات بدون بطاقة وبدون شحن بالعملات المشفرة. بسعر يقارب 0.000334 دولار لكل مليون رمز، هذا يكفي لمليارات من رموز Kimi K2.6 — وقود للشركات الناشئة في الذكاء الاصطناعي التي تلتهم الرموز. في الداخل: اختبارات TPS وإعداد خطوة بخطوة لـ opencode و Hermes Agent."
pubDate: 2026-06-23
heroImage: "/images/blog/gonka-hero.png"
tags: ["gonka", "llm", "tokens", "kimi", "opencode", "hermes-agent"]
draft: false
---

# Gonka تمنح 10 دولارات مجانًا بدون بطاقة: مليارات من رموز Kimi K2.6 للشركات الناشئة في الذكاء الاصطناعي

ملخص سريع لكل من يحرق الرموز بالجملة: [Gonka](https://gonka.ai) شبكة حوسبة لامركزية، و[GonkaGate](https://gonkagate.com/en) بوابة متوافقة مع OpenAI مبنية فوقها مع فوترة بالدولار. وهي **تمنحك رصيدًا مجانيًا بقيمة 10 دولارات فور التسجيل — بدون بطاقة وبدون شحن بالعملات المشفرة**. لست بحاجة إلى محفظة، ولا إلى رموز GNK، ولا حتى إلى سنت واحد مقدمًا لتبدأ في إرسال الطلبات.

## لماذا هذا مهم

الأمر لا يتعلق بالعشرة دولارات نفسها، بل بـ**كم عدد الرموز** التي تتسع لها.

سعر `moonshotai/kimi-k2.6` على GonkaGate يبلغ نحو **0.000334 دولار لكل مليون رمز** (نحو 0.000304 دولار تكلفة الشبكة + نحو 0.000030 دولار رسوم البوابة). هذا أرخص بمراتب من أسعار السحابة المعتادة. بهذا السعر، تساوي العشرة دولارات **مليارات الرموز**. عمليًا، حتى هذه العشرة دولارات تغطي نحو **2.6 مليار رمز سياق** من Kimi K2.6.

لم يعد هذا "مجرد لهو" — بل وقود حقيقي. بالعشرة دولارات المجانية يمكنك:

- تشغيل معالجة بالجملة (تصنيف، ووسم، وتلخيص آلاف المستندات)؛
- إبقاء وكلاء يعملون في الخلفية يلتهمون السياق بالجملة؛
- **بناء نموذج أولي لشركة ناشئة في الذكاء الاصطناعي**، حيث عادةً ما يقتل اقتصاد الرموز الفكرة عند خط الانطلاق.

يمكنك شحن الحساب بـ **USDT** إن أردت — لكنك لست بحاجة إلى ذلك للبدء؛ فالعشرة دولارات موجودة منذ اللحظة الأولى.

## السرعة

أجريت قياسًا مرجعيًا لـ `moonshotai/kimi-k2.6` عبر البوابة: سرعة توليد من الطرف إلى الطرف تبلغ **نحو 60 رمزًا في الثانية**. بالنسبة لشبكة لامركزية بهذا السعر، فهذه أرقام عملية أكثر من كافية.

## احصل على مفتاح

1. سجّل عبر **[gonkagate.com/en/pricing](https://gonkagate.com/en/pricing)** — تصل العشرة دولارات إلى رصيدك تلقائيًا.
2. أنشئ مفتاح API. يبدأ بـ `gp-...` و**يُعرض مرة واحدة فقط** — احفظه على الفور.
3. عنوان API الأساسي: `https://api.gonkagate.com/v1`، والمصادقة `Authorization: Bearer gp-...`. البوابة متوافقة مع OpenAI: بدّل العنوان الأساسي والمفتاح ومعرّف النموذج، وسيعمل أي OpenAI SDK كما هو.

اختبار سريع للتحقق (للتأكد من أن المفتاح فعّال):

```bash
curl https://api.gonkagate.com/v1/chat/completions \
  -H "Authorization: Bearer $GONKAGATE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "moonshotai/kimi-k2.6",
    "messages": [{"role": "user", "content": "Reply with exactly: GonkaGate ok"}]
  }'
```

## الإعداد لـ opencode

[opencode](https://opencode.ai) هو وكيل ذكاء اصطناعي يعمل في الطرفية. يتصل بـ GonkaGate كمزوّد مخصص.

### الخيار أ — المُثبّت الرسمي (الأسهل)

```bash
npx @gonkagate/opencode-setup
```

بدون تفاعل (للنصوص البرمجية / CI):

```bash
GONKAGATE_API_KEY=gp-... npx @gonkagate/opencode-setup --scope project --yes
```

### الخيار ب — يدويًا

1. شغّل opencode، ثم نفّذ `/connect`، واختر `Other`، وأدخل:
   - معرّف المزوّد: `gonkagate`
   - مفتاح API: مفتاحك `gp-...`
2. أضف المزوّد إلى `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "gonkagate": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "GonkaGate",
      "options": {
        "baseURL": "https://api.gonkagate.com/v1"
      },
      "models": {
        "moonshotai/kimi-k2.6": {
          "name": "Kimi K2.6 (GonkaGate)"
        }
      }
    }
  },
  "model": "gonkagate/moonshotai/kimi-k2.6",
  "small_model": "gonkagate/moonshotai/kimi-k2.6"
}
```

3. تحقق:

```bash
opencode debug config --pure
```

ثم نفّذ `/models` داخل opencode — يُفترض أن يظهر المزوّد `GonkaGate` والنموذج `Kimi K2.6` في القائمة. يمكنك دائمًا سحب قائمة النماذج الحالية من `GET /v1/models`.

## الإعداد لـ Hermes Agent

[Hermes Agent](https://github.com/nousresearch/hermes-agent) من Nous Research وكيل يعمل في الطرفية مع أي مزوّد نماذج ويتذكر السياق عبر الجلسات. يتصل هو أيضًا بـ GonkaGate في خطوة واحدة.

**المتطلبات:** Hermes Agent بإصدار `v2026.5.16` / `v0.14.0`+ في `PATH`، و Node.js ≥ `22.14.0`، ومفتاح `gp-...`، وطرفية تفاعلية (TTY)، و Linux/macOS/WSL2.

### الخيار أ — المُثبّت الرسمي

```bash
npx @gonkagate/hermes-agent-setup
```

ضمن ملف تعريف منفصل:

```bash
npx @gonkagate/hermes-agent-setup --profile work
```

### الخيار ب — يدويًا

يحرّر المُثبّت ملفين؛ يمكنك كتابة الشيء نفسه يدويًا.

`~/.hermes/config.yaml`:

```yaml
model:
  provider: custom
  base_url: https://api.gonkagate.com/v1
  default: moonshotai/kimi-k2.6
```

`~/.hermes/.env`:

```
OPENAI_API_KEY=gp-...
```

شغّل وتحقق:

```bash
hermes
# then prompt: Reply with exactly: Hermes Agent connected to GonkaGate
```

## المزالق

- **تعبيرات RE2 النمطية في مخططات الأدوات.** يستخدم الواجهة الخلفية لـ Kimi على Gonka محرك Go RE2 — وهو لا يفهم النظر للأمام (lookahead). إذا احتوى مخطط JSON لأداة MCP على `pattern` يتضمن `(?!` أو `(?=`، يفشل الطلب: `400 ... schema pattern is not a valid regular expression`. الحل هو إزالة هذه الأنماط من مخطط الأداة.
- **نماذج أخرى.** إلى جانب `moonshotai/kimi-k2.6`، هناك Qwen3 235B و MiniMax M2.7 وغيرها — القائمة الحالية على `GET /v1/models`. المعرّفات حساسة لحالة الأحرف، لذا انسخها تمامًا كما هي.
