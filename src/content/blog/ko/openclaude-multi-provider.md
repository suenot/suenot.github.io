---
title: "OpenClaude: 10개 명령어 대신 하나의 설정 파일"
description: "OpenClaude가 각 제공자별 래퍼 명령어(Clother, 셸 별칭)를 하나의 ~/.openclaude.json 설정 파일로 대체하는 방법."
pubDate: 2026-05-11
heroImage: "/images/blog/openclaude-hero.png"
tags: ["claude-code", "openclaude", "llm", "providers", "tooling"]
draft: false
---

# OpenClaude: 10개 명령어 대신 하나의 설정 파일

[Clother 글](/blog/clother-claude-wrappers)을 읽었다면 이 문제를 알 것이다: Claude Code를 다른 제공자(GLM, Kimi, MiniMax, DeepSeek)에 연결할 때마다 별도의 래퍼 명령어가 필요하다. `clother-zai`, `clother-kimi`, `clother-minimax`… 각각 자체 환경 변수를 설정하고, 각각 별도의 심볼릭 링크다.

[OpenClaude](https://github.com/Gitlawb/openclaude)는 다른 접근을 취한다. 제공자별 개별 명령어 대신, **모든 모델을 하나의 JSON 설정 파일에 정의**하고 CLI가 자동으로 라우팅을 처리한다.

## 명령어당 래퍼 방식의 문제

```
clother-zai        → Z.AI GLM-5
clother-kimi       → Kimi (kimi-k2.5)
clother-minimax    → MiniMax-M2.7
clother-deepseek   → DeepSeek
clother-alibaba    → Alibaba Coding Plan
clother-ollama     → 로컬 Ollama
```

6개 제공자에 6개 명령어. OpenRouter 별칭과 커스텀 제공자를 추가하면 동물원 관리와 같다.

## OpenClaude: 모든 것이 `~/.openclaude.json`에

OpenClaude는 오픈소스 코딩 에이전트 CLI(26k+ 스타, TypeScript, MIT)로, 복수 제공자를 네이티브 지원한다. 핵심 기능은 **에이전트 라우팅**——하나의 설정 파일에 모든 모델과 API 엔드포인트를 정의하면 CLI가 작업에 따라 자동 선택.

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

**5개 제공자. 하나의 파일. 기억할 명령어는 제로.**

`agentRouting` 섹션이 핵심: 다른 작업이 자동으로 다른 모델로 전송된다. 탐색은 DeepSeek, 기획은 GPT-4o, 일반 코딩은 GLM-5, 코드 리뷰는 Kimi.

## 지원 제공자

| 제공자 | 유형 |
|--------|------|
| OpenAI (GPT-4o, o3 등) | 클라우드 API |
| Gemini | 클라우드 API |
| GitHub Models | 클라우드 API |
| DeepSeek | 클라우드 API |
| OpenAI 호환 (GLM, Kimi, MiniMax 등) | 클라우드 API |
| Ollama | 로컬 |
| Codex / Codex OAuth | 클라우드 API |

## 빠른 시작

```bash
npm install -g @gitlawb/openclaude
openclaude
```

CLI 내에서 `/provider`를 실행하여 대화형 설정을 하거나 `~/.openclaude.json`을 직접 편집.

환경 변수로 빠른 시작:

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=sk-your-key
export OPENAI_MODEL=gpt-4o
openclaude
```

Ollama 단축키:

```bash
ollama launch openclaude --model qwen2.5-coder:7b
```

## Clother vs OpenClaude

| | Clother | OpenClaude |
|---|---------|-----------|
| **접근 방식** | 공식 Claude Code 래퍼 | 독립형 CLI |
| **설정** | config.json + 심볼릭 링크 | 하나의 JSON 파일 |
| **제공자 추가** | 새 심볼릭 링크 + 키 설정 | 하나의 JSON 블록 |
| **에이전트 라우팅** | 수동 (별도 터미널 탭) | 자동 `agentRouting` |
| **Claude Code 필요** | 예 | 아니오 |
| **제공자 명령어** | `clother-zai`, `clother-kimi`… | 하나의 `openclaude` |

**Clother 사용 시:** 공식 Claude Code를 유지하면서 깔끔하게 제공자를 전환하고 싶을 때.

**OpenClaude 사용 시:** 모든 제공자를 네이티브로 처리하고 모델 간 자동 라우팅하는 통합 CLI를 원할 때.

## 비용 최적화와의 연관

[LLM에서 토큰 절약하기](/blog/saving-tokens-llm) 전략과 결합: Clother는 탭 전환이 필요하지만, OpenClaude의 agentRouting은 자동으로 탐색을 DeepSeek에, 기획을 GPT-4o에, 코딩을 GLM-5에 보낸다.

## 요약

1. **셸 별칭** → 깨지기 쉬움
2. **Clother** → 깔끔한 래퍼
3. **OpenClaude** → 모든 모델 하나의 설정, 자동 라우팅

---

*관련 글: [Clother](/blog/clother-claude-wrappers)와 [LLM에서 토큰 절약하기](/blog/saving-tokens-llm).*
