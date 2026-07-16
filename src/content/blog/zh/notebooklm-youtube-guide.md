---
title: "如何用 NotebookLM 制作 YouTube 视频：完整指南"
description: "分步教程：使用 NotebookLM 生成音频和幻灯片，然后组装成带字幕、章节时间戳和元数据的 YouTube 视频——并通过浏览器会话自动发布。无需视频编辑器，无需 API 密钥，无需手动上传。"
pubDate: 2026-05-09
heroImage: "/images/blog/notebooklm-youtube-hero.png"
tags: ["notebooklm", "youtube", "automation", "video", "ai", "open-source", "tooling"]
draft: false
---

# 如何用 NotebookLM 制作 YouTube 视频：完整指南

如果你一直想在 YouTube 上发布视频，却被视频编辑器、剪辑时间线和数小时的手工劳动吓退——这篇文章就是为你写的。

我将展示如何使用 **Google NotebookLM** 和几个开源脚本，在大约 30 分钟内完成从创意到发布的全过程。不需要 After Effects，不需要 Premiere，不需要 DaVinci Resolve。完全不需要视频编辑器。

## NotebookLM 和视频有什么关系

[NotebookLM](https://notebooklm.google.com/) 是 Google 推出的 AI 工具，能分析你的文档并生成内容。我们关心的核心功能：

1. **音频播客生成** — 上传文章、研究论文或笔记，NotebookLM 会创建自然语音的音频叙述
2. **幻灯片演示生成** — 基于相同材料，NotebookLM 可以创建 PDF 幻灯片
3. **成品视频生成** — 在某些模式下，NotebookLM 能直接生产完整视频

换句话说，NotebookLM 负责最难的部分——内容创作。剩下的就是把它组装成 YouTube 接受的格式并准备元数据。

## 最终效果展示

在深入流程之前，这里是用这个工作流制作的示例视频：

- 🎬 [Анализ Плато: Как отличить надежный оптимум от переобучения](https://www.youtube.com/watch?v=IoMk1tCYpC0) — **video-maker** 示例：PDF 演示文稿 + 音频（来自 NotebookLM）拼接成带同步幻灯片的成品视频
- 🎬 [Walk-Forward Optimization: The Only Honest Strategy Test](https://www.youtube.com/watch?v=y_cC6LWXFKM) — **video-metadata** 示例：NotebookLM 生成了成品视频，脚本为其准备了元数据（标题、描述、标签、时间戳、字幕）

两种情况都无需视频编辑器和手工操作。全部自动组装。

## 工具：你属于哪一种？

根据 NotebookLM 给你的内容，你会从两个构建工具之一开始——然后由第三个工具替你把成品发布到 YouTube：

### 场景 1：你有音频 + 幻灯片 → 需要拼接成视频

NotebookLM 分别生成了音频叙述和 PDF 演示文稿，你需要把它们合成视频。

**工具：** [video-maker](https://github.com/suenot/video-maker)

### 场景 2：你已经有成品视频 → 需要 YouTube 元数据

NotebookLM 也能生成成品视频。但对 YouTube 来说这还不够：你需要标题、描述、标签、章节时间戳、字幕。这些都可以自动生成。

**工具：** [video-metadata](https://github.com/suenot/video-metadata)

让我们逐一讲解。

## 场景 1：从音频和幻灯片构建视频

### 第 1 步：在 NotebookLM 中生成内容

1. 打开 [NotebookLM](https://notebooklm.google.com/)
2. 创建新笔记本，上传你的材料——文章、笔记、PDF、链接
3. 让 NotebookLM 生成**音频播客**
4. 让它生成**幻灯片演示**
5. 下载音频（`.m4a` 或 `.mp3`）和幻灯片（`.pdf`）

### 第 2 步：安装工具

```bash
# 克隆仓库
git clone https://github.com/suenot/video-maker.git
cd video-maker

# 创建 Python 虚拟环境
python -m venv venv && source venv/bin/activate

# 安装 Python 依赖
pip install openai-whisper pillow pytesseract

# 系统依赖（macOS）
brew install ffmpeg poppler tesseract
```

### 第 3 步：放置文件

```bash
mkdir -p input/my-video
cp ~/Downloads/audio.m4a input/my-video/audio_en.m4a
cp ~/Downloads/slides.pdf input/my-video/slides_en.pdf
```

### 第 4 步：运行——一条命令

```bash
bash scripts/run_pipeline.sh en
```

就这样。真的，一条命令。流水线自动完成：

1. ✅ 将 PDF 转换为图片——每张幻灯片变成 PNG
2. ✅ 通过 OCR 识别每张幻灯片上的文字
3. ✅ 通过 Whisper 转录音频——获取带词级时间戳的文本
4. ✅ 同步幻灯片与音频——将语音文本与幻灯片文本匹配
5. ✅ 通过 FFmpeg 组装 MP4 视频
6. ✅ 生成 SRT 字幕
7. ✅ 研究相关 YouTube 标签
8. ✅ 生成元数据：标题、描述、时间戳
9. ✅ 创建 1280×720 缩略图

### 同步魔法是怎么工作的？

这是最有趣的部分。脚本不需要手动标记"在第 42 秒显示第 3 张幻灯片"。它自己搞定。

算法是贪心前向匹配：

1. Whisper 提供语音的词级时间戳
2. OCR（Tesseract）提取每张幻灯片上的文字
3. 脚本遍历转录片段，使用词重叠和双词组匹配来评估每个片段与当前和后续幻灯片的相关性
4. 只有当下一张幻灯片得分明显更高且当前幻灯片已显示足够长时间时，才会切换

幻灯片永远不会往回切。简单但非常有效，特别适合演讲者按幻灯片顺序讲解的教育内容。

### 输出结果

```
output/
├── my-video.mp4           # 成品视频
├── my-video.srt           # 上传到 YouTube 的字幕
├── my-video_metadata.json # 元数据（机器格式）
├── my-video_metadata.txt  # 元数据（复制粘贴到 YouTube Studio）
└── my-video_thumbnail.png # 缩略图
```

## 场景 2：为成品视频准备元数据

如果 NotebookLM 已经生成了成品视频，你仍然需要 YouTube 元数据。

### 安装和运行

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

## 场景 3：自动发布到 YouTube

本指南原本以一个手动步骤结尾：打开 YouTube Studio，上传文件，手工粘贴元数据。现在不用了。最后这一步也自动化了。

**工具：** [video-publisher](https://github.com/suenot/video-publisher)

video-publisher 接收成品视频和元数据 JSON，**替你把它们发布到 YouTube**——它通过反检测的 [Camoufox](https://camoufox.com) 浏览器会话驱动 YouTube Studio。**不需要 Data API，不需要 OAuth，不需要 API 密钥。** 它复用你一次性登录的浏览器配置文件，因此在 Google Cloud 里无需任何配置。

### 它是如何工作的

```bash
git clone https://github.com/suenot/video-publisher.git
cd video-publisher

# Use Python 3.11–3.13 (not 3.14 — Camoufox needs Playwright ≤ 1.51)
python3.11 -m venv venv && venv/bin/pip install -r requirements.txt
venv/bin/python -m camoufox fetch          # one-time: download the browser

# One-time: sign into the TARGET YouTube account (persists locally)
venv/bin/python login.py
```

然后用一条命令发布一个 `video-maker` 打包结果：

```bash
venv/bin/python publish.py \
    --video     ../video-maker/output/SLUG/SLUG.mp4 \
    --metadata  ../video-maker/output/SLUG/SLUG_metadata.json \
    --thumbnail ../video-maker/output/SLUG/SLUG_thumbnail.png \
    --channel-handle @your-channel \
    --visibility private
```

这个工具：

1. 在已登录的 Camoufox 会话中打开 YouTube Studio——无需登录提示，无需 API 密钥
2. 选择目标频道（通过 `--channel-handle` 或 `--channel-id`），因此也适用于品牌频道
3. 在上传前先对照未认证频道的 15 分钟限制预检视频时长——如果会被判为「Processing abandoned」而拒绝，就**在**浪费一次上传**之前**停下
4. 上传视频，用元数据 JSON 设置标题 / 描述 / 标签，并附加缩略图
5. 优雅地处理「验证是你本人」的关卡（用 `--keep-open` 一次性通过）
6. 验证上传是否真正发布，并返回明确的退出码

默认情况下它以**私享**草稿发布（`--visibility private`），让你在公开前先检查——准备好后再传入 `--visibility unlisted` 或 `public`。设计上就是安全的：不会有任何东西意外上线。

> **保护好你的会话隐私。** 该工具通过持久化的浏览器配置文件登录你的真实账户。那个配置文件——cookies、指纹、`debug/` 截图——绝不能提交或分享。仓库为此专门附带了 `.gitignore`；请遵守它。自动化操作 YouTube 也可能导致账户被限流或封禁，所以请使用你自己的账户、一次只运行一个会话，风险自负。

### 完整的内容工厂

把这三个工具串联起来，一篇博客文章就能变成一个已发布的 YouTube 视频，零手工剪辑、零手工上传：

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

## 完整工作流：从创意到 YouTube 仅需 30 分钟

| 步骤 | 你做什么 | 时间 |
|------|----------|------|
| 1 | 将材料上传到 NotebookLM | 2 分钟 |
| 2 | 生成音频和幻灯片 | 5 分钟 |
| 3 | 下载文件并放入 `input/` | 1 分钟 |
| 4 | 运行 `run_pipeline.sh`（video-maker + video-metadata） | 10-15 分钟（等待）|
| 5 | 运行 `publish.py`（video-publisher）——替你上传并发布 | 2 分钟 |

**总计：约 25 分钟**，其中大部分只是等待脚本运行——唯一的手工操作是在 NotebookLM 里点几下鼠标。上传到 YouTube Studio、粘贴元数据、附加字幕和缩略图现在全部自动化了。以前同样的事情需要 2 小时以上的手工操作。

## 超越幻灯片：其他开源视频工具

我的工具解决一个具体问题：幻灯片 + 叙述 → YouTube。但视频自动化生态系统更广阔。这里有两个值得了解的项目：

### video-use：通过 Claude Code 剪辑视频

[video-use](https://github.com/browser-use/video-use) 是一个开源技能，让你通过 Claude Code（或任何有终端访问权的代理）直接剪辑视频。

把原始素材丢进文件夹，打开 Claude Code 说「把这些剪成产品发布视频」。代理会自动：

- 剪掉填充词（`umm`、`uh`、错误开头）和镜头间的空白
- 自动色彩校正
- 在每个剪辑点添加 30ms 音频淡入淡出
- 按你的风格烧录字幕
- 通过 HyperFrames、Remotion、Manim 或 PIL 生成动画叠加
- 在展示给你之前，在每个剪辑边界自我评估渲染输出

关键洞察：LLM 从不「观看」视频。它**阅读**视频——通过 ElevenLabs Scribe 转录（词级时间戳 + 说话人分离）和按需视觉合成。不是 30,000 帧 × 1,500 token = 4500 万 token 的噪音——只有 12KB 文本和几张 PNG。

### OpenShorts：完整的短视频平台

[OpenShorts](https://github.com/mutonby/openshorts) 是一个自托管平台（Docker），整合三个工具：

1. **Clip Generator** — 自动将长视频（播客、网络研讨会、直播）切割成 9:16 短视频。使用 Google Gemini 检测「病毒式传播时刻」，通过 MediaPipe + YOLOv8 进行人脸追踪，faster-whisper 自动字幕。

2. **AI Shorts** — 用 AI 演员生成营销视频。描述产品或粘贴 URL，平台生成脚本、AI 演员、配音、口型同步、B-roll 和最终组装。成本：每个视频低至 $0.65。

3. **YouTube Studio** — AI 缩略图生成、10 个病毒式标题建议、自动描述与章节时间戳、一键发布到 YouTube。

与付费替代品（Opus Clip、CapCut、Vizard、Klap、Descript）不同，OpenShorts 完全免费、开源、无水印、无上传限制。

## 局限性

- **同步质量取决于幻灯片文字。** 图片多文字少的幻灯片同步效果较差。
- **单一演讲者。** 流水线假设是一个人的连续叙述。
- **默认针对 macOS。** 硬件 HEVC 加速在 Apple Silicon 上工作。Linux 使用 `libx264`。
- **NotebookLM 有时会出乎意料。** 生成质量取决于输入材料的结构化程度。

## 想试试吗？

所有工具都是开源的：

- 🔧 [video-maker](https://github.com/suenot/video-maker) — 从音频 + PDF 构建视频
- 🔧 [video-metadata](https://github.com/suenot/video-metadata) — 生成 YouTube 元数据
- 🔧 [video-publisher](https://github.com/suenot/video-publisher) — 通过浏览器会话发布到 YouTube（无需 API 密钥）
- 🎬 [video-use](https://github.com/browser-use/video-use) — 通过 Claude Code 剪辑视频
- 🎬 [OpenShorts](https://github.com/mutonby/openshorts) — 完整的短视频和 AI 视频平台

> **重要说明：** `video-maker`、`video-metadata` 和 `video-publisher` 不是开箱即用的成品，而是**模板和起点**。它们在基本场景下可以直接使用，但设计目的是让你用任何 AI 代理（Claude Code、Codex、Cursor 等）根据自己的需求进行定制。Fork 它们，适配你的品牌和内容风格。

---

*用 NotebookLM 创作内容，用脚本自动组装。这是我发现的从创意到 YouTube 最快的路径。*
