---
title: "كيف تصنع فيديوهات يوتيوب باستخدام NotebookLM: دليل شامل"
description: "دليل خطوة بخطوة: استخدم NotebookLM لتوليد الصوت والشرائح، ثم اجمعها تلقائياً في فيديو يوتيوب جاهز مع ترجمة وفهرس زمني وبيانات وصفية — بدون برامج تحرير فيديو."
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
- 🎬 [Walk-Forward Optimization: The Only Honest Strategy Test](https://www.youtube.com/watch?v=y_cC6LWXFKM) — مثال **video-youtube-prepare**: NotebookLM أنتج الفيديو الجاهز، والسكربت حضّر البيانات الوصفية (العنوان، الوصف، الوسوم، الفهرس الزمني، الترجمة)

في كلتا الحالتين — بدون برامج تحرير فيديو وبدون عمل يدوي. كل شيء يُجمّع تلقائياً.

## سيناريوان: أيهما أنت؟

### السيناريو 1: لديك صوت + شرائح ← تحتاج لبناء فيديو

**الأداة:** [video-maker](https://github.com/suenot/video-maker)

### السيناريو 2: لديك فيديو جاهز ← تحتاج بيانات وصفية ليوتيوب

**الأداة:** [video-youtube-prepare](https://github.com/suenot/video-youtube-prepare)

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
git clone https://github.com/suenot/video-youtube-prepare.git
cd video-youtube-prepare
pip install openai-whisper

python scripts/prepare_metadata.py \
    --video input/my-video.mp4 \
    --slug my-article-slug \
    --output-dir output/my-article-slug \
    --whisper-model base
```

## سير العمل الكامل: من الفكرة إلى يوتيوب في 30 دقيقة

| الخطوة | ما تفعله | الوقت |
|--------|----------|-------|
| 1 | رفع المواد إلى NotebookLM | دقيقتان |
| 2 | توليد الصوت والشرائح | 5 دقائق |
| 3 | تحميل الملفات ووضعها في `input/` | دقيقة |
| 4 | تشغيل `run_pipeline.sh` | 10-15 دقيقة |
| 5 | رفع الفيديو في YouTube Studio | دقيقتان |
| 6 | نسخ البيانات الوصفية | دقيقتان |
| 7 | رفع الترجمة والصورة المصغرة | دقيقة |

**المجموع: حوالي 30 دقيقة**. سابقاً كان يتطلب أكثر من ساعتين من العمل اليدوي.

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
- 🔧 [video-youtube-prepare](https://github.com/suenot/video-youtube-prepare) — يولد بيانات يوتيوب الوصفية
- 🎬 [video-use](https://github.com/browser-use/video-use) — تحرير الفيديو عبر Claude Code
- 🎬 [OpenShorts](https://github.com/mutonby/openshorts) — منصة كاملة للشورتات والفيديو بالذكاء الاصطناعي

> **ملاحظة مهمة:** `video-maker` و `video-youtube-prepare` ليسا منتجين جاهزين للاستخدام مباشرة، بل **قوالب بداية**. يعملان مباشرة للسيناريو الأساسي، لكنهما مصممان لتخصيصهما بأي وكيل ذكاء اصطناعي (Claude Code، Codex، Cursor وغيرها). انسخهما وكيّفهما حسب علامتك التجارية وأسلوب محتواك.

---

*استخدم NotebookLM لإنشاء المحتوى، والسكربتات للتجميع التلقائي. إنه أسرع طريق من الفكرة إلى يوتيوب.*
