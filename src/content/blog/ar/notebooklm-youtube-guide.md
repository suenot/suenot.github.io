---
title: "كيف تصنع فيديوهات يوتيوب باستخدام NotebookLM: دليل شامل"
description: "دليل خطوة بخطوة: استخدم NotebookLM لتوليد الصوت والشرائح، ثم اجمعها تلقائياً في فيديو يوتيوب جاهز مع ترجمة وفهرس زمني وبيانات وصفية — وانشره تلقائياً عبر جلسة متصفح. بدون برامج تحرير فيديو، بدون مفاتيح API، بدون رفع يدوي."
pubDate: 2026-05-09
heroImage: "/images/blog/notebooklm-youtube-hero.png"
tags: ["notebooklm", "youtube", "automation", "video", "ai", "open-source", "tooling"]
draft: false
---

# كيف تصنع فيديوهات يوتيوب باستخدام NotebookLM: دليل شامل

إذا كنت تريد نشر فيديوهات على يوتيوب لكنك تتردد بسبب برامج تحرير الفيديو وساعات العمل اليدوي — هذا المقال لك.

سأريك كيف تنتقل من الفكرة إلى فيديو منشور على يوتيوب في حوالي 30 دقيقة باستخدام **Google NotebookLM** وبعض السكربتات مفتوحة المصدر.

## ما علاقة NotebookLM بالفيديو؟

[NotebookLM](https://notebooklm.google.com/) أداة ذكاء اصطناعي من Google تحلل مستنداتك وتولد محتوى منها.

1. **توليد بودكاست صوتي** — حمّل مقالاً أو ملاحظات، وسينشئ NotebookLM سرداً صوتياً بصوت طبيعي
2. **توليد عرض شرائح** — من نفس المادة، يمكنه إنشاء شرائح PDF
3. **توليد فيديو جاهز** — في بعض الأوضاع يمكنه إنتاج فيديوهات كاملة

## كيف تبدو النتيجة

- 🎬 [Анализ Плато: Как отличить надежный оптимум от переобучения](https://www.youtube.com/watch?v=IoMk1tCYpC0) — مثال **video-maker**: عرض PDF + صوت (NotebookLM) تم تجميعهما في فيديو جاهز مع شرائح متزامنة
- 🎬 [Walk-Forward Optimization: The Only Honest Strategy Test](https://www.youtube.com/watch?v=y_cC6LWXFKM) — مثال **video-metadata**: NotebookLM أنتج الفيديو الجاهز، والسكربت حضّر البيانات الوصفية (العنوان، الوصف، الوسوم، الفهرس الزمني، الترجمة)

في كلتا الحالتين — بدون برامج تحرير فيديو وبدون عمل يدوي. كل شيء يُجمّع تلقائياً.

## الأدوات: أيها أنت؟

حسب ما أعطاك إياه NotebookLM، ستبدأ بإحدى أداتي البناء — ثم تتولى أداة ثالثة نشر النتيجة على يوتيوب نيابة عنك:

### السيناريو 1: لديك صوت + شرائح ← تحتاج لبناء فيديو

**الأداة:** [video-maker](https://github.com/suenot/video-maker)

### السيناريو 2: لديك فيديو جاهز ← تحتاج بيانات وصفية ليوتيوب

**الأداة:** [video-metadata](https://github.com/suenot/video-metadata)

## السيناريو 1: بناء فيديو من الصوت والشرائح

### الخطوة 1: توليد المحتوى في NotebookLM

1. افتح [NotebookLM](https://notebooklm.google.com/)
2. أنشئ دفتراً جديداً وحمّل موادك
3. اطلب توليد **بودكاست صوتي** و**عرض شرائح**
4. حمّل الصوت (`.m4a`) والشرائح (`.pdf`)

### الخطوة 2: تثبيت الأدوات

```bash
git clone https://github.com/suenot/video-maker.git
cd video-maker
python -m venv venv && source venv/bin/activate
pip install openai-whisper pillow pytesseract
brew install ffmpeg poppler tesseract
```

### الخطوة 3: التشغيل — أمر واحد

```bash
mkdir -p input/my-video
cp ~/Downloads/audio.m4a input/my-video/audio_en.m4a
cp ~/Downloads/slides.pdf input/my-video/slides_en.pdf
bash scripts/run_pipeline.sh en
```

خط الإنتاج يقوم تلقائياً بـ: تحويل PDF إلى صور، استخراج النص بـ OCR، تحويل الصوت إلى نص بـ Whisper، مزامنة الشرائح، تجميع فيديو MP4، إنشاء ترجمة SRT، بحث وسوم يوتيوب، توليد البيانات الوصفية، وإنشاء صورة مصغرة.

### آلية المزامنة

خوارزمية مطابقة أمامية جشعة: يقارن الطوابع الزمنية على مستوى الكلمة من Whisper مع نص OCR على كل شريحة، ويتقدم فقط عندما تحصل الشريحة التالية على درجة أعلى بوضوح.

## السيناريو 2: تحضير البيانات الوصفية لفيديو جاهز

```bash
git clone https://github.com/suenot/video-metadata.git
cd video-metadata
pip install openai-whisper

python scripts/prepare_metadata.py \
    --video input/my-video.mp4 \
    --slug my-article-slug \
    --output-dir output/my-article-slug \
    --whisper-model base
```

## السيناريو 3: النشر على يوتيوب — تلقائياً

في الأصل كان هذا الدليل ينتهي بخطوة يدوية: افتح YouTube Studio، ارفع الملف، الصق البيانات الوصفية يدوياً. لم يعد الأمر كذلك. المرحلة الأخيرة أصبحت الآن آلية أيضاً.

**الأداة:** [video-publisher](https://github.com/suenot/video-publisher)

تأخذ video-publisher الفيديو الجاهز وملف البيانات الوصفية JSON و**تنشرهما على يوتيوب نيابة عنك** — عبر قيادة YouTube Studio من خلال جلسة متصفح [Camoufox](https://camoufox.com) المضاد للكشف. **بدون Data API، بدون OAuth، بدون مفاتيح API.** تعيد استخدام ملف تعريف متصفح تسجّل الدخول إليه مرة واحدة، فلا شيء تحتاج لإعداده في Google Cloud.

### كيف تعمل

```bash
git clone https://github.com/suenot/video-publisher.git
cd video-publisher

# Use Python 3.11–3.13 (not 3.14 — Camoufox needs Playwright ≤ 1.51)
python3.11 -m venv venv && venv/bin/pip install -r requirements.txt
venv/bin/python -m camoufox fetch          # one-time: download the browser

# One-time: sign into the TARGET YouTube account (persists locally)
venv/bin/python login.py
```

ثم انشر حزمة `video-maker` بأمر واحد:

```bash
venv/bin/python publish.py \
    --video     ../video-maker/output/SLUG/SLUG.mp4 \
    --metadata  ../video-maker/output/SLUG/SLUG_metadata.json \
    --thumbnail ../video-maker/output/SLUG/SLUG_thumbnail.png \
    --channel-handle @your-channel \
    --visibility private
```

الأداة:

1. تفتح YouTube Studio في جلسة Camoufox مسجّلة الدخول — بدون مطالبات تسجيل دخول، بدون مفاتيح API
2. تختار القناة المستهدفة (عبر `--channel-handle` أو `--channel-id`)، فتعمل مع قنوات العلامات التجارية
3. تتحقق مسبقاً من طول الفيديو مقابل حد 15 دقيقة للقنوات غير الموثقة — وتتوقف **قبل** إهدار عملية رفع إذا كان سيُرفض بسبب "Processing abandoned"
4. ترفع الفيديو، وتضبط العنوان / الوصف / الوسوم من ملف البيانات الوصفية JSON، وترفق الصورة المصغرة
5. تتعامل بسلاسة مع بوابة "Verify it's you" (اجتزها مرة واحدة بـ `--keep-open`)
6. تتحقق من أن الرفع نُشر فعلاً، وتعيد رمز خروج واضحاً

افتراضياً تنشر كمسودة **خاصة** (`--visibility private`) حتى تراجعها قبل الإعلان — مرّر `--visibility unlisted` أو `public` عندما تكون جاهزاً. الأمان بحكم التصميم: لا شيء يُنشر علناً بالخطأ.

> **حافظ على خصوصية جلستك.** تسجّل الأداة الدخول إلى حسابك الحقيقي عبر ملف تعريف متصفح دائم. هذا الملف — الكوكيز، البصمة، لقطات `debug/` — يجب ألا يُرفع أو يُشارك أبداً. المستودع يأتي بملف `.gitignore` لهذا الغرض بالضبط؛ احترمه. أتمتة يوتيوب قد تحدّ من معدل الحساب أو تعلّقه، لذا استخدم حسابك الخاص، جلسة واحدة في كل مرة، على مسؤوليتك.

### مصنع المحتوى الكامل

اربط الأدوات الثلاث ويتحول مقال المدونة إلى فيديو يوتيوب منشور بدون أي تحرير يدوي وبدون أي رفع يدوي:

```
article + NotebookLM audio/slides
      │
      ▼
  video-maker      → builds the MP4 (synced slides + subtitles + thumbnail)
      │
      ▼
  video-metadata   → title, description, tags, chapter timestamps, SRT
      │
      ▼
  video-publisher  → uploads and publishes to YouTube (browser, no API keys)
      │
      ▼
   YouTube 🎬
```

## سير العمل الكامل: من الفكرة إلى يوتيوب في 30 دقيقة

| الخطوة | ما تفعله | الوقت |
|--------|----------|-------|
| 1 | رفع المواد إلى NotebookLM | دقيقتان |
| 2 | توليد الصوت والشرائح | 5 دقائق |
| 3 | تحميل الملفات ووضعها في `input/` | دقيقة |
| 4 | تشغيل `run_pipeline.sh` (video-maker + video-metadata) | 10-15 دقيقة (انتظار) |
| 5 | تشغيل `publish.py` (video-publisher) — يرفع وينشر نيابة عنك | دقيقتان |

**المجموع: حوالي 25 دقيقة**، معظمها مجرد انتظار للسكربتات — والإجراءات اليدوية الوحيدة هي بضع نقرات في NotebookLM. الرفع إلى YouTube Studio ولصق البيانات الوصفية وإرفاق الترجمة والصورة المصغرة كلها آلية الآن. كان هذا يتطلب سابقاً أكثر من ساعتين من العمل اليدوي.

## ما وراء الشرائح: أدوات فيديو مفتوحة المصدر أخرى

### video-use: تحرير الفيديو عبر Claude Code

[video-use](https://github.com/browser-use/video-use) — مهارة مفتوحة المصدر تتيح تحرير الفيديو مباشرة عبر Claude Code. ضع المقاطع الخام في مجلد واطلب من الوكيل تحريرها. يقوم تلقائياً بـ: قص كلمات الحشو، تصحيح الألوان، تلاشي صوتي 30 مللي ثانية، حرق الترجمة، توليد تراكبات متحركة، والتحقق الذاتي.

النموذج اللغوي لا «يشاهد» الفيديو بل **يقرأه** — من خلال نسخ ElevenLabs Scribe (طوابع زمنية على مستوى الكلمة + فصل المتحدثين). بدلاً من 30,000 إطار × 1,500 رمز = 45 مليون رمز ضوضاء — فقط 12 كيلوبايت نص وبعض صور PNG.

### OpenShorts: منصة كاملة للفيديوهات القصيرة

[OpenShorts](https://github.com/mutonby/openshorts) — منصة مستضافة ذاتياً (Docker) تجمع ثلاث أدوات: **Clip Generator** (قص الفيديوهات الطويلة إلى شورتات فيروسية 9:16)، **AI Shorts** (فيديوهات تسويقية بممثلين AI، من $0.65)، **YouTube Studio** (صور مصغرة وعناوين ووصف بالذكاء الاصطناعي). مجانية بالكامل، مفتوحة المصدر، بدون علامات مائية.

## القيود

- **جودة المزامنة تعتمد على نص الشرائح**
- **متحدث واحد فقط**
- **مُحسّن لـ macOS افتراضياً** (على Linux استخدم `libx264`)
- **جودة NotebookLM تعتمد على المادة المدخلة**

## جميع الأدوات

- 🔧 [video-maker](https://github.com/suenot/video-maker) — يبني فيديو من صوت + PDF
- 🔧 [video-metadata](https://github.com/suenot/video-metadata) — يولد بيانات يوتيوب الوصفية
- 🔧 [video-publisher](https://github.com/suenot/video-publisher) — ينشر على يوتيوب عبر جلسة متصفح (بدون مفاتيح API)
- 🎬 [video-use](https://github.com/browser-use/video-use) — تحرير الفيديو عبر Claude Code
- 🎬 [OpenShorts](https://github.com/mutonby/openshorts) — منصة كاملة للشورتات والفيديو بالذكاء الاصطناعي

> **ملاحظة مهمة:** `video-maker` و `video-metadata` و `video-publisher` ليست منتجات جاهزة للاستخدام مباشرة، بل **قوالب بداية**. يعملان مباشرة للسيناريو الأساسي، لكنهما مصممان لتخصيصهما بأي وكيل ذكاء اصطناعي (Claude Code، Codex، Cursor وغيرها). انسخهما وكيّفهما حسب علامتك التجارية وأسلوب محتواك.

---

*استخدم NotebookLM لإنشاء المحتوى، والسكربتات للتجميع التلقائي. إنه أسرع طريق من الفكرة إلى يوتيوب.*
