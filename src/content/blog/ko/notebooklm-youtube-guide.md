---
title: "NotebookLM으로 YouTube 동영상 만들기: 완전 가이드"
description: "단계별 튜토리얼: NotebookLM으로 오디오와 슬라이드를 생성하고, 자막, 챕터 타임스탬프, 메타데이터가 포함된 YouTube 동영상으로 자동 조립. 영상 편집기 불필요."
pubDate: 2026-05-09
heroImage: "/images/blog/notebooklm-youtube-hero.png"
tags: ["notebooklm", "youtube", "automation", "video", "ai", "open-source", "tooling"]
draft: false
---

# NotebookLM으로 YouTube 동영상 만들기: 완전 가이드

YouTube에 동영상을 올리고 싶었지만 영상 편집기와 수 시간의 수작업이 두려워 망설였다면, 이 글은 당신을 위한 것입니다.

**Google NotebookLM**과 몇 가지 오픈소스 스크립트를 사용해 아이디어에서 게시된 동영상까지 약 30분 만에 도달하는 방법을 보여드리겠습니다.

## NotebookLM과 동영상의 관계

[NotebookLM](https://notebooklm.google.com/)은 Google의 AI 도구로, 문서를 분석하고 콘텐츠를 생성할 수 있습니다.

1. **오디오 팟캐스트 생성** — 기사나 메모에서 자연스러운 음성의 오디오 내레이션을 생성
2. **슬라이드 프레젠테이션 생성** — 동일한 자료로 PDF 슬라이드 생성
3. **완성 동영상 생성** — 일부 모드에서 완성된 동영상도 생성 가능

## 완성 결과물

- 🎬 [Анализ Плато: Как отличить надежный оптимум от переобучения](https://www.youtube.com/watch?v=IoMk1tCYpC0) — **video-maker** 예시: PDF 프레젠테이션 + 오디오(NotebookLM)를 슬라이드 동기화된 완성 동영상으로 조립
- 🎬 [Walk-Forward Optimization: The Only Honest Strategy Test](https://www.youtube.com/watch?v=y_cC6LWXFKM) — **video-youtube-prepare** 예시: NotebookLM이 완성 동영상을 생성하고, 스크립트가 메타데이터(제목, 설명, 태그, 타임스탬프, 자막)를 준비

두 경우 모두 영상 편집기나 수작업 없이 자동으로 조립됩니다.

## 두 가지 시나리오

### 시나리오 1: 오디오 + 슬라이드가 있다 → 동영상 조립 필요

**도구:** [video-maker](https://github.com/suenot/video-maker)

### 시나리오 2: 완성 동영상이 있다 → YouTube 메타데이터 필요

**도구:** [video-youtube-prepare](https://github.com/suenot/video-youtube-prepare)

## 시나리오 1: 오디오와 슬라이드로 동영상 만들기

### 1단계: NotebookLM에서 콘텐츠 생성

1. [NotebookLM](https://notebooklm.google.com/) 열기
2. 새 노트북 생성, 자료 업로드
3. **오디오 팟캐스트**와 **슬라이드 프레젠테이션** 생성 요청
4. 오디오(`.m4a`)와 슬라이드(`.pdf`) 다운로드

### 2단계: 도구 설치

```bash
git clone https://github.com/suenot/video-maker.git
cd video-maker
python -m venv venv && source venv/bin/activate
pip install openai-whisper pillow pytesseract
brew install ffmpeg poppler tesseract
```

### 3단계: 실행 — 명령어 하나

```bash
mkdir -p input/my-video
cp ~/Downloads/audio.m4a input/my-video/audio_en.m4a
cp ~/Downloads/slides.pdf input/my-video/slides_en.pdf
bash scripts/run_pipeline.sh en
```

파이프라인이 자동으로: PDF→이미지 변환, OCR 텍스트 추출, Whisper 음성 인식, 슬라이드 동기화, MP4 동영상 조립, SRT 자막 생성, YouTube 태그 조사, 메타데이터 생성, 썸네일 생성을 수행합니다.

### 동기화 원리

탐욕적 전방 매칭 알고리즘: Whisper의 단어 수준 타임스탬프와 OCR의 슬라이드 텍스트를 비교하여 자동으로 슬라이드 전환 시점을 판단합니다. 슬라이드는 절대 뒤로 돌아가지 않습니다.

## 시나리오 2: 완성 동영상의 메타데이터 준비

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

## 전체 워크플로우: 아이디어에서 YouTube까지 30분

| 단계 | 작업 | 시간 |
|------|------|------|
| 1 | NotebookLM에 자료 업로드 | 2분 |
| 2 | 오디오와 슬라이드 생성 | 5분 |
| 3 | 파일 다운로드 후 `input/`에 배치 | 1분 |
| 4 | `run_pipeline.sh` 실행 | 10-15분 |
| 5 | YouTube Studio에서 동영상 업로드 | 2분 |
| 6 | 메타데이터 복사 | 2분 |
| 7 | 자막과 썸네일 업로드 | 1분 |

**총 소요: 약 30분**. 이전에는 2시간 이상의 수작업이 필요했습니다.

## 슬라이드를 넘어서: 기타 오픈소스 동영상 도구

### video-use: Claude Code로 동영상 편집

[video-use](https://github.com/browser-use/video-use) — Claude Code를 통해 직접 동영상을 편집할 수 있는 오픈소스 스킬. 원본 영상을 폴더에 넣고 지시하면 자동으로: 필러 워드 제거, 컬러 그레이딩, 30ms 오디오 페이드, 자막 삽입, 애니메이션 오버레이 생성, 렌더링 셀프 체크까지 수행합니다.

LLM은 동영상을 「보지」 않고 **읽습니다** — ElevenLabs Scribe 전사(단어 수준 타임스탬프 + 화자 분리)와 온디맨드 비주얼 합성을 통해. 30,000 프레임 × 1,500 토큰 = 4,500만 토큰의 노이즈가 아닌 12KB 텍스트와 몇 장의 PNG로 처리합니다.

### OpenShorts: 숏폼 동영상 풀 플랫폼

[OpenShorts](https://github.com/mutonby/openshorts) — Docker 기반 셀프호스팅 플랫폼. **Clip Generator**(긴 동영상→바이럴 숏츠), **AI Shorts**(AI 배우로 마케팅 동영상 생성, $0.65~), **YouTube Studio**(AI 썸네일·타이틀·설명 생성)를 통합. 완전 무료, 오픈소스, 워터마크 없음.

## 제한사항

- **동기화 품질은 슬라이드 텍스트에 의존**
- **단일 화자 전제**
- **기본은 macOS** (Linux에서는 `libx264` 사용)
- **NotebookLM 품질은 입력 자료에 의존**

## 모든 도구

- 🔧 [video-maker](https://github.com/suenot/video-maker) — 오디오 + PDF로 동영상 조립
- 🔧 [video-youtube-prepare](https://github.com/suenot/video-youtube-prepare) — YouTube 메타데이터 생성
- 🎬 [video-use](https://github.com/browser-use/video-use) — Claude Code로 동영상 편집
- 🎬 [OpenShorts](https://github.com/mutonby/openshorts) — 숏츠와 AI 동영상 풀 플랫폼

> **중요:** `video-maker`와 `video-youtube-prepare`는 완성된 제품이 아니라 **스타터 템플릿**입니다. 기본 시나리오에서는 바로 작동하지만, 어떤 AI 에이전트(Claude Code, Codex, Cursor 등)로든 자신의 필요에 맞게 커스터마이즈할 수 있도록 설계되었습니다. Fork하고 자신의 브랜드와 콘텐츠 스타일에 맞게 적용하세요.

---

*NotebookLM으로 콘텐츠를 만들고, 스크립트로 자동 조립하세요. 아이디어에서 YouTube까지 가장 빠른 경로입니다.*
