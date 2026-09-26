---
title: "ستة عشر بديلا مفتوح المصدر لـ Jev وما الذي يقدمه كل منها"
description: "دليل إلى Laya وKev وGLiNER2.5-Decide وثلاثة عشر مشروعا آخر للقرارات محددة البنية، مع حدود استخدامها لتوجيه وكلاء Codex الفرعيين."
pubDate: 2026-09-25
updatedDate: 2026-09-26
tags: ["jev", "open-source", "model-routing", "codex"]
draft: false
---

## TL;DR

- [Laya](https://github.com/NandhaKishorM/laya)
- [Kev](https://github.com/jaredpalmer/kev)
- [GLiNER2.5-Decide](https://huggingface.co/fastino/GLiNER2.5-Decide)
- [JevK5](https://huggingface.co/alibiserikbay/JevK5)
- [GLiFormer large-v1](https://huggingface.co/knowledgator/gliformer-large-v1)
- [PlayJev](https://github.com/OmniJev/PlayJev)
- [SemIf](https://github.com/TheoLeeCJ/SemIf-OpenJev)
- [NanoJev](https://github.com/TianyuCodings/NanoJev)
- [jevlike](https://github.com/vinnylarouge/jevlike)
- [simple-jev](https://github.com/featherless-ai/simple-jev)
- [AnyJev](https://github.com/nokia-applied-research/AnyJev)
- [mini-jev](https://github.com/r-ms/mini-jev)
- [open-jev (nico-martin)](https://github.com/nico-martin/open-jev)
- [minojev](https://github.com/zeredy879/minojev)
- [Open-Jev (Zefan-Cai)](https://github.com/Zefan-Cai/Open-Jev)
- [open-jev (daseinlabs)](https://github.com/daseinlabs/open-jev)

يتلقى Jev حالة ومجموعة أسئلة، ثم يعيد قرارات قصيرة ذات بنية محددة، مثل اختيار أو درجة أو رقم. أستخدم هذا النوع من القرارات في [موجّه وكلاء Codex الفرعيين](https://github.com/suenot/codex-jev-router) لاختيار النموذج ومستوى الاستدلال للوكيل التالي. تشمل المشاريع أدناه خوادم محلية وأدوات تدريب ونموذجا يتعامل مع صور الألعاب. تشابه الأسماء لا يعني تشابه الاستخدام.

## Laya

يجيب [Laya](https://github.com/NandhaKishorM/laya) عن عدة أسئلة محددة البنية في مرور واحد. يوفر مكتبة Python وخادما محليا بواجهة HTTP متوافقة مع Jev، مع أوزان للإنجليزية وأخرى متعددة اللغات. تصلح الثانية للتجربة عندما يكون وصف المهمة بالعربية، ويدعم المشروع معالجة الدفعات. قبل اعتماده مع Codex، سأقيس الدقة ومعايرة الدرجات على مهامي الفعلية.

## Kev

يقدم [Kev](https://github.com/jaredpalmer/kev) عائلة نماذج مفتوحة بأحجام مختلفة ونقطة وصول محلية `/v1/systemone`. ينصح ملف README بالبدء بحجم 4B، فيما تحتاج الإصدارات الأكبر إلى ذاكرة أكثر بكثير. يصلح بديلا مباشرا لمحرك قرار بعيد إذا توفرت موارد التشغيل محليا. قياسات مؤلفه لا تثبت أداءه في توجيه وكلاء Codex.

## GLiNER2.5-Decide

[GLiNER2.5-Decide](https://huggingface.co/fastino/GLiNER2.5-Decide) يصنف النص وفق تسميات تحدد عند الاستدعاء. يضم النموذج الإنجليزي 340 مليون معلمة، وتوجد [نسخة بمليار معلمة](https://huggingface.co/fastino/GLiNER2.5-Decide-1B) و[نسخة متعددة اللغات تضم 287 مليون معلمة](https://huggingface.co/fastino/GLiNER2.5-multi-Decide). تعيد `AutoExtractor.classify_text()` في GLiNER2 عدة تصنيفات من دون توليد نص. تختلف واجهتها عن Jev System One، لذا يحتاج Codex إلى موائم.

## JevK5

[JevK5](https://huggingface.co/alibiserikbay/JevK5) مشروع مستقل عن Kev ومبني على Qwen3.5-4B. يستخرج احتمالات الخيارات من logits بطريقة SemIf، ويقدم [خادمه المحلي](https://github.com/allebee/jevk5) واجهة `/v1/systemone`. ينبغي قياس سرعته ودقته على مهام Codex الفعلية بصورة منفصلة.

## GLiFormer large-v1

[GLiFormer large-v1](https://huggingface.co/knowledgator/gliformer-large-v1) نموذج مبني على DeBERTa ويضم 575.6 مليون معلمة. يصنف النص وفق تسميات محددة، ويدعم أيضا استخراج الكيانات والعلاقات والبيانات المنظمة. يمكن استعمال التصنيف لتوجيه المهام النصية، لكن ربط واجهة Python مع Jev يتطلب موائما.

## PlayJev

يختار [PlayJev](https://github.com/OmniJev/PlayJev) الحركة التالية في لعبة متصفح من صورة وقائمة حركات مسموحة. يعيد احتمالات الاختيار عبر `/v1/systemone`، لكن مدخله بصري ومخصص للألعاب. اختيار وكيل للبحث في الملفات يحتاج نموذجا مختلفا أو تدريبا جديدا. يوضح المشروع أن القرارات القصيرة يمكن أن تستند إلى الصور أيضا.

## SemIf

يعيد [SemIf](https://github.com/TheoLeeCJ/SemIf-OpenJev)، واسمه السابق OpenJev، إنتاج صيغة القرارات بواسطة نماذج لغوية مفتوحة. يستخرج درجات الخيارات من logits ويعمل عبر PyTorch أو MLX أو llama.cpp. تستقبل أداة سطر الأوامر JSONL، لذا يحتاج Codex إلى موائم. يمكن تجربته من دون نموذج متخصص للقرار، لكن تحميل النموذج مع كل طلب قد يلغي مكسب السرعة.

## NanoJev

يستخدم [NanoJev](https://github.com/TianyuCodings/NanoJev) أساسا صغيرا من Qwen مع رؤوس للاختيار والإجابة المنطقية والدرجة. تتضمن المستودع الأوزان والبيانات وشيفرة التدريب وخادما محليا على `/api/evaluate`. دُرّب النموذج المنشور أساسا على مهام ألعاب. ينبغي قياس مدى انتقال هذا الأداء إلى أوصاف مهام Codex على حدة.

## jevlike

يشبه [jevlike](https://github.com/vinnylarouge/jevlike) عدة تجارب بحثية: يمكن تدريب مشفّر صغير على مستوى البايتات، أو استخدام مشفّر Hugging Face ثابت لتقييم خيارات نصية حرة. التدريب والتنبؤ متاحان من سطر الأوامر. لم يثبت المشروع أنه يميز مهام البحث الدقيق في ملفات Codex من التشخيص الصعب، لكنه يتيح بناء هذا المصنف واختباره ببياناتك.

## simple-jev

يستخرج [simple-jev](https://github.com/featherless-ai/simple-jev) قرارا محدد البنية من logits لنموذج لغوي مفتوح متوافق، بدلا من توليد JSON. يوفر خادمه المبني على Transformers وPyTorch المسارين `/v1/classifier` و`/v1/systemone`. تعتمد النتيجة على النموذج وصياغة الخيارات، والدرجات ليست تلقائيا احتمالات نجاح معايرة. يناسب تجربة نموذج يعمل لديك محليا بالفعل.

## AnyJev

يقدم [AnyJev](https://github.com/nokia-applied-research/AnyJev) ثلاث درجات لتكييف نموذج لغوي موجود: تصحيح انحياز موضع الخيار بلا بيانات موسومة، ومعايرة الحرارة، ورأس قرار مبني على الحالات الخفية. تتطلب الدرجات المتقدمة أمثلة من مهامك، ويتطلب الرأس الوصول إلى الحالات الداخلية للنموذج. يفيد ذلك عند ضبط موجّه لمجموعة مهام معروفة. حتى الوضع الأبسط قد يحتاج عدة مرات تشغيل، لذا يجب قياس زمنه.

## mini-jev

يقارن [mini-jev](https://github.com/r-ms/mini-jev) تقييم الخيارات عبر logits لنموذج Qwen ثابت بتوليد JSON مقيد بقواعد. هو مشروع تعليمي ومرجع قياس أكثر منه موجّها جاهزا للإنتاج. ترتب درجاته الخيارات لكنها لا تضمن احتمالات معايرة. يساعد على فهم متى توفر الإجابة القصيرة عملا، ومتى يصغر هذا المكسب، كما في سؤال منطقي بسيط.

## open-jev من nico-martin

يشغّل [nico-martin/open-jev](https://github.com/nico-martin/open-jev) القرارات محددة البنية في المتصفح بواسطة Transformers.js وWebGPU أو WASM. واجهة TypeScript هي `OpenJev.load().decide()`، ويدعم عدة نماذج منها إصدارات Kev. يناسب اتخاذ القرار محليا داخل تطبيق ويب. يحتاج Codex إلى جسر Node، ويتطلب التشغيل الأول تنزيل الأوزان.

## minojev

يجمع [minojev](https://github.com/zeredy879/minojev) بين Qwen3-1.7B ثابت ورأس قرار صغير قابل للتدريب. يعالج الأسئلة عبر `/score` محلي، وينشر الأوزان والبيانات، ويمكن تشغيله على CPU. يعرض مؤلفوه أيضا تراجعا في الأداء خارج توزيع التدريب. سأختبره على مهام Codex الحقيقية قبل الاعتماد على نتيجته المنشورة لتوجيه الوكلاء.

## Open-Jev من Zefan-Cai

ينشر [Zefan-Cai/Open-Jev](https://github.com/Zefan-Cai/Open-Jev) نماذج مدربة بأحجام 2B و9B و27B مع رأس قرار ومعايرة. يضم خادما محليا على `/v1/systemone` وبيانات وأدوات تدريب. من بين المشاريع الثلاثة متشابهة الاسم، هو الأقرب إلى عائلة نماذج جاهزة، لكن كلفة تشغيله تتغير كثيرا حسب الحجم. يجب اختبار نتائج معاييره المنشورة على مهام توجيه الوكلاء.

## open-jev من daseinlabs

يقيّم [daseinlabs/open-jev](https://github.com/daseinlabs/open-jev) الخيارات باستخدام Gemma 3 4B، مع إعادة استخدام المقدمة المشتركة والمعالجة على دفعات. يوفر `/score` و`/v1/systemone` محليا، وMLX على Mac وPyTorch على المنصات الأخرى، مع إمكان تدريب رأس خاص بالمهمة. يتطلب الحصول على أوزان Gemma قبول شروط الوصول في Hugging Face. يستحق تجربة زمن المسار الكامل إذا كنت تشغّل النماذج محليا على Mac.

## مقارنة fast-decisions

تنشر Fastino في [بطاقة النموذج](https://huggingface.co/fastino/GLiNER2.5-Decide) دقة التطابق التام على [fast-decisions](https://huggingface.co/datasets/fastino/fast-decisions): سبعة عشر مجالا باللغة الإنجليزية، مع 300 مثال محجوز في كل مجال. استعملت النماذج النصوص والتسميات المرشحة نفسها. هذه نتائج الجهة الناشرة وليست تقييما مستقلا مني.

| النموذج | المتوسط |
|---|---:|
| [GLiNER2.5-Decide (340M)](https://huggingface.co/fastino/GLiNER2.5-Decide) | 60.2% |
| [GLiNER2.5-Decide-1B](https://huggingface.co/fastino/GLiNER2.5-Decide-1B) | 59.6% |
| [JevK5](https://huggingface.co/alibiserikbay/JevK5) | 57.6% |
| [GLiNER2.5-multi-Decide (287M)](https://huggingface.co/fastino/GLiNER2.5-multi-Decide) | 56.7% |
| [SemIf](https://github.com/TheoLeeCJ/SemIf-OpenJev) (Qwen3.5-4B) | 56.4% |
| [GLiFormer large-v1](https://huggingface.co/knowledgator/gliformer-large-v1) | 49.0% |
| [Laya Router](https://github.com/NandhaKishorM/laya) | 46.6% |

تضم الملفات العامة 100 مثال للتطوير في كل مجال، بينما تستند درجات الجدول إلى مجموعة محجوزة منفصلة. لا تثبت دقة التصنيف الإنجليزي جودة توجيه مهام Codex الخاصة بي أو النصوص العربية.

## أيها أختار مع Codex؟

إذا أردت واجهة HTTP محلية مألوفة، فسأبدأ بـ Laya أو Kev أو JevK5 أو simple-jev أو أحد خوادم Open-Jev. عند التدريب على مهامي، سأفحص NanoJev وjevlike وAnyJev وminojev. يساعد SemIf وmini-jev على دراسة طريقة إنتاج القرار القصير، بينما يركز PlayJev على الألعاب البصرية. ويمكن اختبار GLiNER2.5-Decide وGLiFormer كمصنفين بعد إضافة موائم.

يدعم [Codex Jev Router](https://github.com/suenot/codex-jev-router) عددا من هذه المحركات عبر موائمات. توافق الواجهة لا يعني تساوي الدقة أو التوفير. قبل تغيير المحرك، سأقيس زمن القرار وكلفته، وأخطاء التوجيه، وكلفة الوكيل الذي يعمل بعده. لا توجد حتى الآن مقارنة منشورة للمشاريع الستة عشر على مجموعة مهامي الخاصة.
