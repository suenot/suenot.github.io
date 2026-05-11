---
title: "OpenClaude: ملف إعدادات واحد بدلاً من عشر أوامر"
description: "كيف يستبدل OpenClaude أوامر التغليف المنفصلة لكل مزود (Clother، أسماء مستعارة للشل) بملف إعدادات واحد ~/.openclaude.json."
pubDate: 2026-05-11
heroImage: "/images/blog/openclaude-hero.png"
tags: ["claude-code", "openclaude", "llm", "providers", "tooling"]
draft: false
---

# OpenClaude: ملف إعدادات واحد بدلاً من عشر أوامر

إذا قرأت [مقال Clother](/blog/clother-claude-wrappers)، فأنت تعرف المشكلة: في كل مرة تريد توصيل Claude Code بمزود مختلف — GLM أو Kimi أو MiniMax أو DeepSeek — تحتاج أمر تغليف منفصل. `clother-zai`، `clother-kimi`، `clother-minimax`… كل واحد يضبط متغيرات بيئته الخاصة، وكل واحد رابط رمزي منفصل.

المشكلة الحقيقية ليست فقط تذكر الأوامر. إنها تتبع حدود الاستخدام: عندما تصل إلى حد النموذج في منتصف الجلسة، يجب عليك إيقاف العملية يدوياً، والتبديل إلى أمر `clother-*` آخر، واستئناف نفس الجلسة بنموذج مختلف.

[OpenClaude](https://github.com/Gitlawb/openclaude) يحل هذا بشكل مختلف. بدلاً من أوامر منفصلة لكل مزود، تُعرّف **جميع النماذج في ملف JSON واحد** — وواجهة الأوامر تتعامل مع التوجيه تلقائياً.

## مشكلة أمر واحد لكل مغلف

```
clother-zai        → Z.AI GLM-5
clother-kimi       → Kimi (kimi-k2.5)
clother-minimax    → MiniMax-M2.7
clother-deepseek   → DeepSeek
clother-alibaba    → Alibaba Coding Plan
clother-ollama     → Ollama محلي
```

ست أوامر لستة مزودين. أضف أسماء OpenRouter المستعارة ومزودين مخصصين — وأنت تدير حديقة حيوان.

## OpenClaude: كل شيء في `~/.openclaude.json`

OpenClaude هو واجهة أوامر مفتوحة المصدر لوكلاء البرمجة (26k+ نجمة، TypeScript، MIT)، يدعم مزودين متعددين أصلياً. الميزة الأساسية هي **توجيه الوكلاء** — تُعرّف جميع النماذج ونقاط API في ملف إعدادات واحد، وواجهة الأوامر تختار تلقائياً حسب المهمة.

```json
{
  "agentModels": {
    "deepseek-v4-flash": {
      "base_url": "https://api.deepseek.com/v1",
      "api_key": "sk-your-key"
    },
    "gpt-4o": {
      "base_url": "https://api.openai.com/v1",
      "api_key": "sk-your-key"
    },
    "glm-5": {
      "base_url": "https://open.bigmodel.cn/api/paas/v4",
      "api_key": "your-zhipu-key"
    },
    "kimi-k2.5": {
      "base_url": "https://api.moonshot.cn/v1",
      "api_key": "your-moonshot-key"
    },
    "minimax-m2.7": {
      "base_url": "https://api.minimax.chat/v1",
      "api_key": "your-minimax-key"
    }
  },
  "agentRouting": {
    "Explore": "deepseek-v4-flash",
    "Plan": "gpt-4o",
    "general-purpose": "glm-5",
    "frontend-dev": "deepseek-v4-flash",
    "code-review": "kimi-k2.5",
    "default": "gpt-4o"
  }
}
```

**خمسة مزودين. ملف واحد. صفر أوامر للحفظ.**

قسم `agentRouting` هو القوة الحقيقية: مهام مختلفة تُرسل تلقائياً لنماذج مختلفة.

## المزودون المدعومون

| المزود | النوع |
|--------|-------|
| OpenAI (GPT-4o, o3 إلخ) | API سحابي |
| Gemini | API سحابي |
| GitHub Models | API سحابي |
| DeepSeek | API سحابي |
| أي متوافق مع OpenAI (GLM, Kimi, MiniMax إلخ) | API سحابي |
| Ollama | محلي |
| Codex / Codex OAuth | API سحابي |

## البداية السريعة

```bash
npm install -g @gitlawb/openclaude
openclaude
```

داخل واجهة الأوامر شغّل `/provider` للإعداد التفاعلي، أو حرّر `~/.openclaude.json` مباشرة.

## Clother مقابل OpenClaude

| | Clother | OpenClaude |
|---|---------|-----------|
| **المنهج** | تغليف Claude Code الرسمي | واجهة أوامر مستقلة |
| **الإعدادات** | config.json + روابط رمزية | ملف JSON واحد |
| **إضافة مزود** | رابط رمزي جديد + مفتاح | كتلة JSON واحدة |
| **توجيه الوكلاء** | يدوي (علامات تبويب مختلفة) | تلقائي `agentRouting` |
| **يحتاج Claude Code** | نعم | لا |
| **أوامر المزود** | `clother-zai`, `clother-kimi`… | أمر واحد `openclaude` |

## الملخص

1. **أسماء الشل المستعارة** → هشة
2. **Clother** → مغلفات نظيفة، لكن تبديل يدوي عند نفاد الحدود
3. **OpenClaude** → جميع النماذج في إعدادات واحدة، توجيه تلقائي

---

*اقرأ أيضاً: [Clother](/blog/clother-claude-wrappers) و[كيف توفر التوكنات في LLM](/blog/saving-tokens-llm).*
