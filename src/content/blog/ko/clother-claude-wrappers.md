---
title: "Clother: 전역 설정 수정 없이 Claude Code 멀티 프로바이더 래퍼"
description: "clother-* 명령으로 Claude Code를 Z.AI, Kimi, MiniMax, OpenRouter 등 프로바이더 간에 전환하는 방법."
pubDate: 2026-04-19
heroImage: "/images/blog/clother-claude-hero.png"
tags: ["claude-code", "clother", "llm", "providers", "tooling"]
draft: false
---

# Clother: 전역 설정 수정 없이 Claude Code 멀티 프로바이더 래퍼

Claude Code는 훌륭하지만 Anthropic 이외의 엔드포인트로 실행하려면 경험이 무너집니다. [Clother](https://github.com/jolehuit/clother)가 이 문제를 해결합니다. 프로바이더마다 `clother-*` 런처 명령을 제공하며, **Claude Code 설치는 완전히 그대로** 유지됩니다.

## 일상 사용

```bash
clother-native                       # Anthropic 구독
clother-zai                          # Z.AI GLM-5
clother-kimi                         # Kimi (kimi-k2.5)
clother-minimax                      # MiniMax-M2.7
clother-deepseek                     # DeepSeek
clother-ollama --model qwen3-coder   # 로컬 Ollama
clother-or stepfun                   # OpenRouter 별칭
clother-custom sambanova --yolo      # 커스텀 프로바이더
```

## 설계 원리

- **제로 상태 누출.** 프로세스 종료 시 환경 변수도 사라짐
- **여러 프로바이더 병렬 사용** 가능
- **`claude --resume` 계속 작동** — 원래 프로바이더로 라우팅

## 설치

```bash
brew tap jolehuit/tap && brew install clother
```

## 커스터마이징 (`~/.config/clother/config.json`)

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

## 마무리

Clother는 Claude Code를 유일한 안정적 인터페이스로 유지하면서 프로바이더를 런타임 결정으로 다룰 수 있게 합니다. 비용 최적화 중이라면 [LLM에서 토큰 절약하기](/blog/saving-tokens-llm)도 함께 읽어보세요.
