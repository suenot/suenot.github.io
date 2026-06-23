---
title: "graphify في Claude Code: رسم بياني للمعرفة بدلاً من قراءة المستودع بأكمله، والدلالات على OpenRouter الرخيص"
description: "إعداد graphify الجاهز للاستخدام الخاص بي لـ Claude Code: رسم بياني للمعرفة بدلاً من قراءة المستودع كاملاً، واستخراج دلالي على OpenRouter الرخيص (deepseek) بدلاً من توكنات Claude، ومراقبة تلقائية عبر الخطافات، وحماية من تسرب الأسرار إلى الرسم البياني. كل ذلك مُجمَّع في مستودع claude-code-token-savers."
pubDate: 2026-06-23
heroImage: "/images/blog/graphify-hero.png"
tags: ["graphify", "claude-code", "tokens", "knowledge-graph", "openrouter"]
draft: false
---

# graphify في Claude Code: رسم بياني للمعرفة بدلاً من قراءة المستودع بأكمله

في [دليل توفير التوكنات](https://www.suenot.com/blog/saving-tokens-llm/) ذكرتُ graphify بإيجاز كجزء من المنظومة العامة. وهنا يحصل على غوص عميق خاص به في كيفية إعدادي للأتمتة: ما الذي أُبقيه مُفعَّلاً عالمياً بالضبط ولماذا لا يحرق توكنات Claude.

المشكلة بسيطة. لفهم كود شخص آخر (أو كودك أنت من قبل ستة أشهر)، يقرأ الوكيل الملفات على دفعات، وكل ملف يحطّ في السياق. هذا مُكلِف على المدخلات، وفوق ذلك يجرّ معه تعفّن السياق (context rot): كلما كدّست أكثر، فكّر النموذج أسوأ. [graphify](https://github.com/safishamsi/graphify) يكسر هذا الاقتران: مرة واحدة، يبني رسماً بيانياً للمعرفة من المستودع (عُقَد، علاقات، مجتمعات، عُقَد god) تقوم أنت **بالاستعلام** عنه، بدلاً من إغراق النافذة بالملفات.

كل شيء مُجمَّع في مستودع واحد — **[suenot/claude-code-token-savers](https://github.com/suenot/claude-code-token-savers)** (مجلد `graphify/`، و`setup.sh` غير متأثر بالتكرار، والرُقع، والخطافات).

## الحيلة الرئيسية: الدلالات على توكنات شخص آخر

بناء الرسم البياني هو كومة من استدعاءات LLM لاستخراج الكيانات والعلاقات. إذا شغّلتها عبر Claude، تحوّل التوفير إلى إنفاق. لذا يُحوَّل الاستخراج الدلالي إلى **OpenRouter الرخيص**، وليس إلى ميزانية Claude.

`~/.graphify/providers.json`:

```json
{
  "openrouter": {
    "base_url": "https://openrouter.ai/api/v1",
    "default_model": "deepseek/deepseek-v4-flash",
    "env_key": "OPENROUTER_API_KEY",
    "model_env_key": "GRAPHIFY_OPENROUTER_MODEL",
    "pricing": { "input": 0.09, "output": 0.18 },
    "temperature": 0,
    "max_tokens": 16384,
    "vision": false
  }
}
```

`deepseek/deepseek-v4-flash` — بسعر ‎$0.09 / $0.18‎ لكل مليون توكن، وسياق مليون. بناء الرسم البياني لمشروع متوسط يكلّف **‎~$0.10‎ على OpenRouter وصفر توكنات من جلسة Claude**. يُبدَّل النموذج بمتغير واحد: `export GRAPHIFY_OPENROUTER_MODEL=qwen/qwen3.7-plus`.

تفصيل مهم: `graphify install` يكتب فوق `~/.claude/skills/graphify/SKILL.md`. ذلك الملف يثبّت ترتيب أولوية خلفية الاستخراج بشكل صريح، وإن لم تستعِده، فسيتراجع graphify إلى وكلاء Claude الفرعيين ويحرق توكناتك. الأولوية الصحيحة:

1. **OpenRouter** (إن وُجد `OPENROUTER_API_KEY`) — قِطَع النص تذهب إلى هنا.
2. **Gemini** (إن وُجد `GEMINI_API_KEY` / `GOOGLE_API_KEY`).
3. **وكلاء Claude الفرعيون** — فقط كملاذ أخير.

## التثبيت

تحتاج إلى [`uv`](https://docs.astral.sh/uv/) و`OPENROUTER_API_KEY` في بيئتك.

```bash
cd graphify
./setup.sh          # installs graphify, the OpenRouter backend, patches, hooks, no-media
```

`setup.sh` غير متأثر بالتكرار (مع تراجع). تحت الغطاء، إذا كنت تفضّل القيام بذلك يدوياً:

```bash
uv tool install --with watchdog "graphifyy[openai]"   # openai-extra = OpenRouter; watchdog = graphify watch
mkdir -p ~/.graphify
cp providers.json ~/.graphify/providers.json
cp build-and-watch.sh stop-watch.sh precommit-graph-guard.sh ~/.graphify/ && chmod +x ~/.graphify/*.sh
PY="$(sed -n '1s/^#!//p' "$(command -v graphify)")"
"$PY" patch-global-ignore.py     # global ignore layer
"$PY" patch-merge-ignore.py      # merge .gitignore + .graphifyignore (instead of shadowing)
"$PY" patch-no-media.py          # no-media toggle
touch ~/.graphify/no-media       # media off by default
graphify install --platform claude
```

## المراقبة التلقائية: الرسم البياني يحدّث نفسه

قلب الأتمتة هو خطاف `SessionStart` المسمى `build-and-watch.sh`. عند كل بدء جلسة، يفحص المشروع ويختار مساراً:

- **الرسم البياني موجود** ← يبدأ `graphify watch` (رخيص، AST فقط، بلا LLM) + يُثبّت حارس pre-commit ← الحالة "watching".
- **الرسم البياني غير مُهيَّأ** ← يطبع "run `/graphify .`" ولا يفعل شيئاً. هذا صمام أمان: جذر أو مجلد ضخم فُتح عرضاً لن يدخل بصمت إلى الفهرسة ويحرق التوكنات.
- علامة `~/.graphify/autobuild` ← يبني إضافياً وتلقائياً المشاريع الصغيرة والحديثة عبر OpenRouter (الحد الأقصى: 500 ملف / مليونا كلمة؛ أي شيء أكبر يُتخطّى مع طلب البناء يدوياً).

حراس الأمان: يتخطّى `$HOME`، وجذر نظام الملفات، ومجلدات النظام/`tmp`، وأسلاف `$HOME`، وأي مشروع به `.graphify-skip`. مفتاح الإيقاف العالمي هو `~/.graphify/disable-autowatch`. مراقب واحد بالضبط لكل مشروع (قفل `mkdir` ذرّي + فحص PID). عند `SessionEnd` يُنهى بواسطة `stop-watch.sh`. `watch` يحدّث طبقة الكود/AST فقط؛ المستندات تتطلب `/graphify . --update`.

خريطة الخطافات في `~/.claude/settings.json` (ادمج، لا تكتب فوق الموجودة):

```
SessionStart  -> ~/.graphify/build-and-watch.sh    # status + watch
SessionEnd    -> ~/.graphify/stop-watch.sh          # stop watcher
```

## ما الذي لن يدخل إلى الرسم البياني (ولماذا يهمّ ذلك)

قد ينتهي الرسم البياني داخل commit، ما يعني أنه لا يمكنك السماح بدخول الأسرار إليه. ثلاث آليات مستقلة:

1. **الأسرار و`.env`** — تُجرَّد دائماً بواسطة `_is_sensitive` المدمج في graphify، بلا حاجة لأي إعداد.
2. **الوسائط** — مفتاح تبديل نظيف بلا العبث بملفات ignore: `patch-no-media.py` يجعل `detect()` يتخطّى الصور/pdf/الفيديو/office عند وجود `~/.graphify/no-media` (أو `GRAPHIFY_NO_MEDIA=1`). احذف العلامة وتعود الوسائط إلى اللعبة.
3. **حجب `.gitignore` — مُصلَح.** في الأصل، كان `.graphifyignore` الخاص بمجلد **يحجب تماماً** ملف `.gitignore` الخاص به: نمط موجود فقط في `.gitignore` (سرّ مثلاً) كان لا يزال يُفهرَس. `patch-merge-ignore.py` يدمج بدلاً من الاستبدال — وهذا هو [PR #1364](https://github.com/safishamsi/graphify/pull/1364) في الأصل.

وفوق ذلك — **حارس pre-commit** (`precommit-graph-guard.sh`)، المُثبَّت في مستودعات git المُعالَجة بـ graphify، والذي **يحجب الالتزام** بـ `graphify-out/graph.json` إذا تسلّل ملف محجوب بـ `.gitignore` إلى الرسم البياني. دفاع متعدد الطبقات ضد تسرّب الأسرار إلى رسم بياني مُلتزَم به. يمكن تجاوزه بـ `git commit --no-verify`.

## كيفية استخدامه

ابنِ مرة واحدة، ثم استعلِم:

```bash
/graphify .                         # build the graph for the current folder
/graphify https://github.com/o/r    # clone the repo and build
/graphify url1 url2 ...              # several repos → one cross-repo graph
/graphify . --mode deep             # more thorough, more INFERRED relations
/graphify . --update                # incremental, only new/changed

/graphify query "where is the token validated and what does that trigger"
/graphify query "..." --dfs         # trace a specific path, not broad context
/graphify query "..." --budget 1500 # cap the answer at N tokens
```

المُخرَج هو HTML تفاعلي، وGraphRAG-JSON، وملف `GRAPH_REPORT.md` قابل للقراءة البشرية؛ وهناك أيضاً `--mcp` (خادم stdio للوكلاء) و`--wiki`. ومن ثَمّ، بدلاً من "اقرأ وحدة auth بأكملها"، يضرب الوكيل الرسم البياني ويحصل على الشريحة التي يحتاجها بالضبط.

## بعد ترقية graphify

`uv tool upgrade graphifyy` و`graphify install` يمسحان site-packages (تضيع جميع رُقَع `detect.py` الثلاث) ويكتبان فوق `SKILL.md`. الإصلاح هو تشغيل `./setup.sh` مرة أخرى (يستعيد الرُقَع والملفات وعلامة no-media) وإعادة إضافة كتلة أولوية الخلفية في `SKILL.md`. ما يبقى ناجياً من الترقية: `~/.graphify/*`، والخطافات في `~/.claude/settings.json`، و`.git/hooks/pre-commit` لكل مستودع.

---

الخلاصة: يزيل graphify أثقل طبقة من سياقك — "اقرأ المستودع بأكمله" — ويفعل ذلك على توكنات شخص آخر رخيصة كالفلوس، محدّثاً نفسه في الخلفية ودون أن يجرّ الأسرار إلى الرسم البياني. الدمج مع rtk (مدخلات الأوامر) وcaveman (مخرجات النموذج) مشمول في [دليل توفير التوكنات](https://www.suenot.com/blog/saving-tokens-llm/).
