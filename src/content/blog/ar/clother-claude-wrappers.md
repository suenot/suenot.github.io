---
title: "Clother: أغلفة نظيفة لـ Claude Code بدون تعديل الإعدادات العامة"
description: "كيفية استخدام clother لتبديل Claude Code بين Z.AI و Kimi و MiniMax و OpenRouter و Ollama وغيرها عبر أوامر clother-* — بدون تعديل ~/.claude أو المتغيرات البيئية العامة."
pubDate: 2026-04-19
heroImage: "/images/blog/clother-claude-hero.png"
tags: ["claude-code", "clother", "llm", "providers", "tooling"]
draft: false
---

# Clother: أغلفة نظيفة لـ Claude Code بدون تعديل الإعدادات العامة

Claude Code ممتاز — لكن عندما تريد تشغيله مع نقطة نهاية غير Anthropic، تنهار التجربة. [Clother](https://github.com/jolehuit/clother) يحل هذه المشكلة. يوفر أوامر `clother-*` لكل مزود، و**تثبيت Claude Code يبقى كما هو تماماً**.

## الاستخدام اليومي

```bash
clother-native                       # Anthropic، اشتراك Claude
clother-zai                          # Z.AI GLM-5
clother-kimi                         # Kimi (kimi-k2.5)
clother-minimax                      # MiniMax-M2.7
clother-deepseek                     # DeepSeek
clother-ollama --model qwen3-coder   # Ollama محلي
clother-or stepfun                   # اختصار OpenRouter
clother-custom sambanova --yolo      # مزود مخصص
```

## مبادئ التصميم

- **صفر تسرب حالة.** عند انتهاء العملية، تختفي المتغيرات البيئية
- **عدة مزودين بالتوازي** — افتح عدة تبويبات بمزودين مختلفين
- **`claude --resume` يستمر في العمل** — يعيد التوجيه للمزود الأصلي

## التثبيت

```bash
brew tap jolehuit/tap && brew install clother
```

## التخصيص (`~/.config/clother/config.json`)

```json
{
  "version": 1,
  "provider_overrides": { "zai": { "model": "glm-5.1" } },
  "openrouter_aliases": {
    "kimi25": "moonshotai/kimi-k2.5:nitro",
    "minimax27": "minimax/minimax-m2.7:nitro"
  },
  "custom_providers": {
    "sambanova": {
      "name": "sambanova",
      "base_url": "https://api.sambanova.ai",
      "api_key_env": "SAMBA_API_KEY",
      "default_model": "MiniMax-M2.5",
      "api_type": "openai"
    }
  }
}
```

## الخلاصة

Clother أداة تفعل شيئاً صغيراً بشكل جيد: تحافظ على Claude Code كواجهة مستقرة وحيدة وتعامل المزود الأساسي كقرار وقت التشغيل. بدون انحراف الإعدادات العامة، بدون تفرعات لكل مزود.

إذا كنت تعمل على تحسين التكاليف، اقرأ هذا المقال مع [كيفية توفير الرموز في LLM](/blog/saving-tokens-llm).
