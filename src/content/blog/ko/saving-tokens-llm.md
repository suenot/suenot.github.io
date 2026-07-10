---
title: "LLM에서 토큰 절약하기: Claude Code 실전 가이드"
description: "Claude Code에서 토큰을 절약하는 실전 방법: subagent, skill, hook, 중국 모델, 지식 그래프와 RAG, 서버 사이드 절약(Tool Search, context editing, prompt caching, Batches API). 비용을 10배 줄이는 체크리스트."
pubDate: 2026-04-12
updatedDate: 2026-07-10
heroImage: "/images/blog/saving-tokens-hero.png"
tags: ["llm", "claude-code", "optimization", "tokens"]
draft: false
---

# LLM에서 토큰 절약하기: Claude Code 실전 가이드

$200짜리 구독 10개를 태우는 건 문제가 아닙니다. 문제는 그걸 의미 있게 쓰는 겁니다. 아래는 제가 Claude Code로 일상적으로 사용하는 토큰 절약 실전 방법들입니다.

## 1. 우리는 어떻게 돈을 내고 있나

Claude Code는 **input**과 **output** 토큰을 각각 과금합니다. Input은 컨텍스트에 들어가는 모든 것 — 시스템 프롬프트, 채팅 기록, 파일, 스크린샷. Output은 모델이 생성하는 내용입니다.

채팅의 모든 메시지는 누적된 컨텍스트 전체를 input에 추가합니다. 1M 컨텍스트 Opus를 사용 중이라면, 모든 메시지가 백만 토큰을 매번 새로 보내는 것처럼 과금됩니다. Output도 컨텍스트를 채우는 데 기여합니다 — 모든 응답마다 컨텍스트가 계속 커집니다.

**결론:** 대화가 짧을수록 저렴합니다. 컨텍스트가 작을수록 저렴합니다. 모델이 적게 "생각"할수록 저렴합니다.

## 2. Subagent는 필수

메인 프로세스(리드)는 직접 아무것도 하지 않아야 합니다. 리드의 임무는 조정하고 위임하는 것입니다. 모든 작업은 **작은 컨텍스트**를 가진 subagent가 수행합니다.

이유:

- 리드 프로세스의 컨텍스트는 100–200K 수준에서 유지되며 계속 커지지 않습니다
- Subagent가 작업을 마치면 컨텍스트가 해제됩니다
- 수십 개의 에이전트를 병렬로 실행할 수 있습니다

설정 방법:

```
메인 프로세스 (Opus, 200K 컨텍스트)
├── 에이전트 1 (Haiku, 짧은 컨텍스트) — 스크립트 처리
├── 에이전트 2 (Sonnet, 짧은 컨텍스트) — 테스트 작성
└── 에이전트 3 (Haiku, 짧은 컨텍스트) — 리팩토링
```

대량 작업(예: 8000개 스크립트 처리)의 경우 — 스크립트 하나당 subagent 하나, Haiku 모델. 하나의 채팅으로 모든 것을 돌리는 것보다 훨씬 저렴합니다.

## 3. 컨텍스트와 환각 — 비선형 관계

100K 컨텍스트의 Opus가 1M 컨텍스트의 Opus보다 정확하게 작동합니다. 1M 컨텍스트에서는 환각이 비선형적으로 증가합니다. 즉, 큰 컨텍스트는 **비싸고 품질도 떨어집니다**.

결론: 컨텍스트를 콤팩트하게 유지하세요. 500K짜리 채팅 하나보다 100K짜리 채팅 5개가 낫습니다.

## 4. Skill이 해결해 줍니다

Skill은 필요할 때만 로드되고 항상 컨텍스트에 상주하지 않는 사전 설정 프롬프트입니다. 많은 프레임워크가 작업을 위해 가장 먼저 skill을 준비/다운로드합니다.

MCP 서버(자신의 명령어를 항상 컨텍스트에 로드)와 달리, skill은 필요할 때만 활성화됩니다. Opus 4.5 이전에는 MCP에서 많은 토큰이 낭비되었습니다 — 지금은 문제가 해결되었지만, "MCP를 skill과 명령어로 교체"하는 접근은 여전히 절약에 유효합니다.

### Caveman

[Caveman](https://github.com/JuliusBrussee/caveman)은 Claude Code(및 다른 에이전트)용 오픈소스 스킬·플러그인으로, 기술적 정확성을 유지한 채 "caveman speak" 스타일로 매우 짧게 답하게 합니다 — §1의 "대화가 짧을수록 저렴"을 구체화한 사례입니다. 저장소 벤치마크에서는 평균 **output** 토큰 약 **65%** 절감을 보고합니다; `caveman-compress`는 메모리 파일 속 문장을 압축해 **input**을 줄입니다.

## 5. 중국 모델과 저렴한 구독

Alibaba Cloud, 중국 구독 — 가격/토큰 비율에서 크게 유리합니다. ~$30 구독이 Anthropic $200와 비슷한 양의 토큰을 제공합니다.

실전 팁:

- 모델 프로바이더를 전환할 수 있는 Claude 래퍼를 사용합니다
- 글로벌 env 변수는 수정하지 않고 — 래퍼 실행 시에만 필요한 변수를 전달합니다
- Gemini도 비슷하게 사용할 수 있는 저렴한 구독이 있습니다

아직 "여러 프로바이더의 모델을 Claude에 직접 통합"하는 완성된 솔루션은 없지만, 래퍼로 80%的需求를 충족할 수 있습니다. 그중 하나인 [Clother](https://github.com/jolehuit/clother/)는 글로벌 설정을 건드리지 않고 다양한 모델 프로바이더로 Claude Code를 실행할 수 있게 해줍니다.

## 6. 지식 그래프와 RAG: 토큰 10배 절약

### LightRAG

[LightRAG](https://github.com/HKUDS/LightRAG) — 지식 그래프와 LLM을 연결하는 접근법. 전체 컨텍스트를 로드하는 대신 구조화된 관련 정보 추출을 통해 토큰 사용량을 최대 10배까지 줄일 수 있습니다.

### a8e

[ivansglazunov](https://github.com/ivansglazunov)의 개발 — 저자가 은둔 모드로 작업하고 공개를 많이 하지 않아 아직 프로젝트를 제대로 볼 수는 없습니다. **사서-RAG**처럼 작동합니다: 들어오는 모든 데이터를 데이터베이스에 던집니다. 아이디어는 그래프와 LLM을 연결하여 더 정확하고 저렴하게 컨텍스트를 추출하는 것입니다. [이 영상](https://www.youtube.com/watch?v=5-nrGj8qKqQ)에서 설명하는 기술과 비슷한 접근입니다.

### cmdop-claude

[cmdop-claude](https://pypi.org/project/cmdop-claude/) — [markolofsen](https://github.com/markolofsen)의 접근법. 그래프로는 Merkle 트리를 사용합니다. 핵심 아이디어: 거의 무료인 중국 LLM을 백그라운드에서 돌려 `.claude` 폴더를 정리 — 메인 모델을 위한 컨텍스트를 준비하는 것입니다.

> 지식 그래프의 글로벌 설정 — [graphify](https://github.com/safishamsi/graphify)를 OpenRouter 백엔드와 함께 사용해 시맨틱 처리가 Claude 토큰을 소비하지 않게 하는 방법은 §11에서 rtk와 함께 다룹니다.

## 7. 에이전트 관리 프레임워크

### Superpowers

Claude Code용 인기 프레임워크로, 준비된 skill, 패턴, 파이프라인 세트를 제공합니다.

### AI Factory

[ai-factory](https://github.com/lee-to/ai-factory) — AI 에이전트 관리용 흥미로운 프레임워크. [aif-handoff](https://github.com/lee-to/aif-handoff)와 함께 사용하면 칸반 보드와 필터가 있는 프론트엔드를 사용할 수 있습니다.

핵심 아이디어: 사람이 초기 작업을 설정하고, AI가 이를 분해하지만 **준비된 계획의 사람 승인 없이는 작업이 시작되지 않습니다**. 이것이 토큰을 절약(재작업 감소)하고 통제권을 제공합니다.

## 8. 실전 팁

**High effort와 reasoning** 비활성화로 비용 절감이 가능합니다. 모든 작업이 모델의 "깊은 사고"를 필요로 하지는 않습니다.

**Skill 대신 MCP.** Opus 4.5 이전에는 MCP를 skill로 교체하는 것이 상당한 절약 효과가 있었습니다. 지금은 차이가 줄었지만, 대량 작업에서는 여전히 유효한 접근법입니다.

**Subagent 모델 관리.** Subagent가 어떤 모델을 사용할지 지정할 수 있습니다. 루틴 작업에는 Haiku, 복잡한 작업에는 Sonnet이나 Opus를 사용하세요.

**`--bare` 모드 — 깔끔한 시작.** `--bare` 플래그는 hook, LSP, 플러그인 동기화, 자동 메모리, 백그라운드 프리로딩 없이 Claude Code를 실행하며 — 가장 중요한 것은 **CLAUDE.md 자동 감지 없이** 실행합니다. 이 모든 것은 보통 시스템 프롬프트에 로드되어 첫 메시지 전부터 토큰을 소모합니다. bare 모드에서는 컨텍스트가 최소로 시작하며, 필요한 데이터는 `--system-prompt`, `--append-system-prompt`, `--add-dir` 또는 `--mcp-config`로 정밀하게 전달할 수 있습니다. 불필요한 사전 프롬프트가 순수한 낭비인 대량 subagent에 이상적입니다.

## 9. Hook — 자동 절약

Hook은 Claude Code 내부의 이벤트에 반응하여 실행되는 스크립트입니다. `.claude/settings.json`에서 설정하며, 토큰을 절약하는 루틴을 자동화할 수 있습니다.

### Hook 유형

- **PreToolUse** — 도구 호출 전에 실행. 입력 데이터를 필터링하거나 수정할 수 있습니다.
- **PostToolUse** — 도구 호출 후에 실행. 자동 포맷팅과 후처리에 유용합니다.
- **PreCompact** — 컨텍스트 압축 전에 실행. 중요한 정보를 보존할 수 있습니다.
- **Stop** — 에이전트가 작업을 마칠 때 실행. 완료 여부를 확인할 수 있습니다.
- **SessionStart** — 세션 시작 시 실행. 컨텍스트 프리로드에 유용합니다.

### 유용한 Hook 예시

**테스트 출력 필터링.** Anthropic의 공식 예시 — Bash용 `PreToolUse` hook으로 긴 테스트 출력을 잘라 실패한 테스트와 요약만 남깁니다. 500줄의 로그 대신 10줄만 컨텍스트에 들어가 — 직접적인 토큰 절약입니다.

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "command": "your_filter_script.sh"
    }]
  }
}
```

**저장 후 자동 포맷팅.** Write/Edit용 `PostToolUse` hook — 파일 저장 후 `prettier`나 `black` 실행. 모델이 코드 포맷팅에 토큰을 낭비할 필요 없이 — 로직을 작성하고 포맷팅은 hook이 처리합니다.

**파괴적 명령어 방지.** Bash용 `PreToolUse` hook으로 `rm -rf`, `DROP TABLE` 같은 명령어를 차단. 직접적인 토큰 절약은 아니지만, 비싼 실수와 재작업을 방지합니다.

**Compact 전 컨텍스트 보존.** `PreCompact` hook — 컨텍스트 압축 전에 핵심 결정과 상태를 파일에 저장하여 compact 후에도 잃지 않도록 합니다.

### Hook이 할 수 없는 것

N번째 메시지마다 자동 compact는 hook으로 설정할 수 없습니다 — 이건 Claude Code의 내장 기능입니다. 하지만 `PreCompact` hook을 사용해 압축 시 무엇을 보존할지 관리할 수 있습니다.

## 10. 스크린샷 — 숨겨진 토큰 소비자

Claude는 공식 문서상 해상도에 따라 이미지를 압축합니다. 실제로는 압축이 체감되지 않습니다. 4K 모니터에서 스크린샷 하나는 비쌉니다.

해결책: 전송 전에 스크린샷을 너비 ~400px로 줄이세요. 텍스트는 여전히 읽을 수 있고, 토큰 소모는 한 자릿수 줄어듭니다.

macOS용으로 제가 만든 [Open Screenshot](https://openscreenshot.suenot.com/)이 있습니다 — 해상도가 축소된 형식으로 바로 스크린샷을 찍어, 수동으로 리사이즈할 필요가 없습니다. 한번 써보세요!

## 11. 바로 쓸 수 있는 설정: rtk + graphify

글로벌로 항상 켜두는 두 가지 도구 — 각각 §1의 서로 다른 항목을 공략합니다. **rtk**는 명령어 input을 줄이고, **graphify**는 "저장소 전체를 읽어줘"를 컨텍스트에서 제거합니다. 두 도구 모두 별도의 API 키가 필요 없습니다(graphify는 시맨틱 처리를 Claude 토큰이 아닌 저렴한 OpenRouter로 처리합니다). Caveman(§4)과 함께 사용하면 완성된 스택이 됩니다: 명령어 input + 저장소 컨텍스트 + 모델 output.

**완성된 설정은 별도 저장소에 정리했습니다 — [`suenot/claude-code-token-savers`](https://github.com/suenot/claude-code-token-savers)** (스크립트, 패치, 훅, `setup.sh`).

### rtk — 명령어 출력 압축

[rtk](https://github.com/rtk-ai/rtk) (Rust Token Killer) — CLI 프록시: 100개 이상의 명령어(git, docker, pytest, cargo…) 출력을 컨텍스트에 전달되기 전에 필터링·중복제거·잘라내기하여 **60–90%** 줄입니다. 단일 바이너리, 의존성 없음, 오버헤드 <10ms, LLM 미사용.

```bash
brew install rtk
rtk init -g --auto-patch   # Claude Code용 글로벌 PreToolUse 훅 설치
# Claude Code 재시작 후 확인: git status
```

훅은 `git status` → `rtk git status`로 투명하게 재작성합니다. §9(훅으로 테스트 출력 필터링)와 같은 원리이지만, 한 번에 수백 개의 명령어에 적용됩니다.

### graphify — 저장소 전체 읽기 대신 지식 그래프

[graphify](https://github.com/safishamsi/graphify)는 코드와 문서를 지식 그래프(노드, 커뮤니티, god-node)로 변환하여, 파일을 컨텍스트에 쏟아붓는 대신 **조회**(`/graphify query "…"`)할 수 있게 합니다 — §6 아이디어의 실전 구현입니다. 핵심 트릭: **시맨틱 추출은 Claude 토큰이 아닌 OpenRouter(`deepseek/deepseek-v4-flash`)로 처리** — 중간 규모 프로젝트의 그래프 구축 비용은 OpenRouter에서 ~$0.10이며, 세션 토큰은 0입니다.

완성된 설정에 포함된 내용(위 저장소, `graphify/` 폴더, `./setup.sh`):

- OpenRouter 백엔드(`~/.graphify/providers.json`, 모델은 `GRAPHIFY_OPENROUTER_MODEL`로 변경);
- **SessionStart 훅 자동 watch**: 그래프가 있으면 변경 사항을 감지해 업데이트; 프로젝트가 초기화되지 않았으면 「`/graphify .` 실행」이라고만 표시(우연히 열린 루트/대형 폴더가 토큰을 잡아먹지 않도록);
- 깔끔한 **no-media** 토글(`touch ~/.graphify/no-media`) — ignore 파일 설정 없이 이미지/pdf/영상을 그래프에서 제외;
- 보안 수정: `.graphifyignore`가 더 이상 `.gitignore`를 「덮어쓰지」 않음(교체 대신 병합, [PR #1364](https://github.com/safishamsi/graphify/pull/1364) 업스트림 제출), 추가로 `.gitignore` 대상 파일이 그래프에 포함된 채 커밋되는 것을 막는 pre-commit-guard 포함.

> Caveman(§4)이 세 번째 레이어를 마무리합니다 — **모델 자체의 output**. rtk + graphify + caveman = 명령어 input, 저장소 컨텍스트, 모델 output 각각. 단, 텍스트 작업에서는 caveman을 끄는 게 낫습니다(«normal mode») — 간결한 스타일이 편집을 방해합니다.

### pxpipe — 요청을 이미지로 렌더링 (§10을 뒤집기)

[pxpipe](https://github.com/teamchong/pxpipe) — [teamchong](https://github.com/teamchong)의 프로젝트로, 예상치 못한 각도에서 input을 공략합니다. §10에서 스크린샷은 적이었습니다 — 이미지는 토큰을 잡아먹으니까요. pxpipe는 이를 뒤집습니다: 이미지의 토큰 비용은 그 안에 얼마나 많은 텍스트가 담겼는지가 아니라 **픽셀 크기**로 고정됩니다. 실제 Claude Code 트래픽에서 밀도 높은 콘텐츠(코드, JSON, 도구 출력)는 이미지 토큰당 약 3.1자를 담는 반면, 텍스트 토큰당은 약 1자에 불과합니다. 그래서 pxpipe는 모든 요청에서 부피가 크고 정적인 부분 — 시스템 프롬프트, 도구 문서, 오래된 기록 —을 요청이 머신을 떠나기 전에 **밀도 높은 PNG로 렌더링**합니다. 모델은 Anthropic의 computer use가 이미 의존하는 것과 동일한 비전 채널을 통해 이를 읽습니다. 주장하는 결과: **input 비용 약 59–70% 절감**, 그리고 지속적인 지표는 무료 `count_tokens` 반사실과 요청마다 비교해 측정한 토큰 절감량 그 자체입니다.

프록시이며 — 당연한 질문에 답하자면 — 통합은 **이미 네이티브**입니다: 플러그인도 훅도 없이, Claude Code에 내장된 `ANTHROPIC_BASE_URL`만 사용합니다.

```bash
npm install -g pxpipe-proxy   # or on demand: npx pxpipe-proxy
pxpipe                                            # proxy on 127.0.0.1:47821
ANTHROPIC_BASE_URL=http://127.0.0.1:47821 claude  # point Claude Code at it
```

`127.0.0.1:47821`의 대시보드는 절약된 토큰, 모든 텍스트→이미지 변환을 나란히, 실시간 kill switch를 보여주며, 각 이벤트를 `~/.pxpipe/events.jsonl`에 기록합니다. **요청**만 압축됩니다 — 응답은 정상적으로 스트리밍됩니다.

> ⚠️ **손실 압축이며, 놓친 부분은 조용히 넘어갑니다.** 이미지에서 읽어낸 정확한 바이트 수준 값(16진수 문자열, ID, 해시, 시크릿)은 오류를 내는 대신 **환각으로 지어낼** 수 있습니다. 그래서 최근 턴은 자동으로 텍스트로 유지되며, 바이트 단위 정확성이 필요한 작업은 allowlist에 없는 모델의 subagent(`CLAUDE_CODE_SUBAGENT_MODEL=claude-sonnet-4-6`)로 라우팅해 텍스트로 통과시켜야 합니다. 또한 리더에 크게 좌우됩니다: Fable 5 리더에서는 텍스트 needle에 대해 약 100/100을 기록하지만, Opus는 이미지화된 콘텐츠를 잘못 읽습니다 — 그래서 pxpipe는 Opus를 opt-in으로 유지합니다.

**스택과 충돌하는 지점.** pxpipe는 `ANTHROPIC_BASE_URL`을 차지합니다 — Clother를 비롯한 다른 래퍼가 사용하는 바로 그 슬롯입니다 — 따라서 체이닝 없이는 하나의 base URL에 두 개의 프록시를 걸 수 없습니다. 앞단에는 프록시 하나만 고르고, 훅 기반 도구(rtk, graphify, caveman)를 그 위에 쌓으세요. 여기서 가장 급진적인 input 압축기이며 — 요청 측 비용(시스템 프롬프트 + 도구 문서 + 긴 기록)이 실제로 발목을 잡을 때 시도해 볼 만합니다.

## 12. 서버 사이드 및 API 레벨 절약 (Claude Code가 이미 하는 것 — 그리고 하지 않는 것)

위의 모든 것은 *여러분이* 직접 붙이는 것들입니다. 하지만 절약의 한 층 전체는 **Anthropic 쪽 와이어 너머**에 존재합니다 — 그중 일부는 Claude Code에서 이미 켜져 있고, 일부는 원시 API/SDK 위에 직접 구축해야만 닿을 수 있습니다. 어느 쪽인지 아는 것이, 플랫폼이 이미 해결한 문제를 고치려고 도구를 설치하는 일 — 그리고 켜져 있지 않은 기능이 켜져 있다고 가정하는 일 — 을 막아줍니다.

### 고급 도구 사용: Tool Search, Programmatic Tool Calling — 기본으로 이미 켜짐

Anthropic의 [advanced tool use](https://www.anthropic.com/engineering/advanced-tool-use) 제품군(2025년 11월)은 이 목록에서 가장 큰 단일 이득이며, 좋은 소식은 **여러분이 설정할 것이 없다**는 점입니다:

- **Tool Search Tool** (`defer_loading`). 모든 요청마다 모든 도구의 전체 스키마를 시스템 프롬프트에 쏟아붓는 대신, 모델에는 도구 *이름*만 보여지고 실제로 필요한 도구에 한해서만 전체 정의를 가져옵니다. Anthropic 수치: 대형 도구 세트에서 **77K → 8.7K 토큰(약 85%)**. **Claude Code에서는 이미 기본으로 활성화**되어 있습니다 — 많은 MCP 서버와 플러그인이 연결되어 있어도 추가 도구는 호출되기 전까지 이름만으로 대기하며, 모델이 필요할 때 스키마를 가져옵니다. **켤 설정이 없습니다: 규모에 따라 작동**하며, 연결된 도구가 많을수록 더 많이 절약됩니다. 신경 써야 하는 유일한 경우는 **커스텀 하네스 / Agent SDK 앱**입니다 — 거기서는 직접 구현하거나(도구에 `defer_loading: true` 표시) 최소한 하네스가 지연 로딩을 하는지 확인해야 하며, 그러지 않으면 매 턴마다 모든 스키마 비용을 다시 내게 됩니다.
- **Programmatic Tool Calling.** 모델이 실행 컨테이너에서 코드를 작성해 도구를 호출하고 그 결과를 컨텍스트에 닿기 *전에* 필터링합니다 — 모든 원시 도구 결과가 창을 왕복하는 대신에 말이죠. 도구 사용이 많은 에이전트 실행에서 일반적으로 **20–40%**(정확도 향상은 덤). 이것은 아직 API 네이티브(베타)이며 Claude Code에서는 아직 자동이 아닙니다.

> **핵심:** 약 85%의 도구 스키마 절약은 Claude Code에서 이미 여러분의 것입니다 — 추가 설정 없이. 자체 하네스를 작성하는 경우에만 신경 쓰면 됩니다.

### Context editing (`clear_tool_uses`) — API 기능; Claude Code는 자체 버전을 제공

Anthropic의 [context editing](https://platform.claude.com/docs/en/build-with-claude/context-editing)(베타 헤더 `context-management-2025-06-27`, 전략 `clear_tool_uses_20250919`)은 컨텍스트가 임계치를 넘으면 가장 오래된 도구 결과를 자동으로 지우고 각각을 짧은 플레이스홀더로 교체합니다. Anthropic의 100턴 평가에서 이는, 그러지 않았다면 컨텍스트 고갈로 죽었을 실행에서 **84% 토큰 감소**였습니다.

하지만: **그 원시 노브는 Claude Code에 노출되지 않습니다**(이를 표면화하려는 공개 요청이 있습니다). Claude Code가 대신 제공하는 것은 **microcompact**입니다 — 큰 도구 출력을 자동으로 디스크에 오프로드하고 최근 결과의 뜨거운 꼬리와 경로 참조만 유지하며, `/compact` 및 autocompact와 함께 조용히 실행됩니다. 즉 오래된 도구 출력을 잘라내는 *동작*은 자동으로 커버되고, *특정 API 파라미터*는 Anthropic API/SDK 위에 직접 구축할 때만 닿을 수 있습니다. Claude Code에서 `clear_tool_uses` 설정을 찾지 마세요 — 이미 하우스 버전을 얻고 있습니다.

### 능동적 prompt caching — 캐시 읽기 90% 할인, 그리고 대부분 자동

[Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)은 GA이며 기본 토대입니다: 캐시 읽기 비용은 **0.10× input(−90%)**. 두 가지 TTL — 5분(기본)과 1시간(확장). **Claude Code는 이미 여러분을 위해 적극적으로 캐싱합니다**; 여러분이 통제하는 것은 캐시가 *적중하느냐*입니다:

- 컨텍스트 앞부분을 **바이트 단위로 안정적**으로 유지하세요 — 시스템 프롬프트, 도구 정의, `CLAUDE.md`는 턴 사이에 흔들려서는 안 되며, 그렇지 않으면 프리픽스 캐시가 빗나가 모델이 처음부터 다시 읽습니다.
- 세션 중간에 도구를 재정렬하거나 앞쪽 컨텍스트를 다시 쓰지 마세요(프리픽스를 재작성하면 캐시가 통째로 날아가는 바로 그 함정입니다).
- Opus 4.8이 여기서 도움을 줍니다: `role:"system"` 메시지가 사용자 턴 *뒤에* 나타날 수 있게 하여, 캐시된 프리픽스를 깨뜨리지 **않고** 지시를 덧붙일 수 있으며, 캐시 가능한 최소 프롬프트를 **1,024 토큰**으로 낮췄습니다.

### Message Batches API — 오프라인 대량 작업에 일괄 50% 할인

비대화형 대량 작업 — §2의 "8000개 스크립트, 각각 subagent 하나" 시나리오, 또는 대량 요약/분류/평가 —에는 [Message Batches API](https://platform.claude.com/docs/en/build-with-claude/batch-processing)가 이를 비동기로 실행하며(결과는 24시간 이내, 보통 훨씬 빠름) **input과 output 모두에 일괄 50% 할인**을 적용하고, **prompt caching과 중첩**됩니다(캐시 읽기에 추가로 90%).

**함정: Claude Code 자체에는 배치 모드가 없습니다.** 이것은 대화형 REPL입니다 — 모든 턴이 살아 있는 전액 요청이며, "8000개 작업을 반값에 큐잉"하는 버튼은 없습니다. 50% 할인은 한 층 아래 원시 API에 있으며, CLI를 떠나야만 닿을 수 있습니다:

- **Anthropic API / SDK** 직접 — `client.messages.batches.create(...)`(Python/TS). 여기서 대량 패스를 직접 스크립팅하거나, 대화형 CLI 대신 **Claude Agent SDK** 위에 구축합니다.
- **AWS Bedrock** — "Batch Inference".
- **Google Vertex AI** — "Batch Prediction".
- (다른 곳도 같은 패턴: **OpenAI**에도 −50%의 동등한 Batch API가 있습니다.)

그래서 경험칙: **대화형 코딩 → Claude Code(캐싱이 무거운 일을 처리); 오프라인 대량 작업 → API/SDK나 Bedrock/Vertex로 내려가 배치.** 대화형 CLI를 통해 대량 라벨링을 억지로 밀어붙이면 그 50%를 테이블에 남겨두게 됩니다.

### 저렴한 위생: `/context`, 군살 없는 CLAUDE.md, 유휴 MCP 서버 제거

- **`/context`**는 무엇이 창을 채우고 있는지 토큰 단위로 분해해 출력합니다 — 시스템 프롬프트, 시스템 도구, MCP 도구, 메모리 파일(`CLAUDE.md`), 커스텀 에이전트, 메시지. 실행해서 누가 먹보인지 확인하세요.
- **비대해진 `CLAUDE.md`는 매 메시지에 부과되는 세금입니다** — 10K 토큰짜리 메모리 파일은 매 턴마다 다시 전송됩니다. 군살 없이 유지하고, 작업별 지시는 **skill**(필요 시 로드)로 밀어넣으세요.
- **모든 유휴 MCP 서버는 매 요청마다 도구 정의를 과금합니다.** 사용하지 않는 것은 `/mcp`(또는 `cctoggle` 같은 토글)로 연결 해제하세요. Tool Search가 이를 완화하지만, 서버를 아예 쓰지 않는 것이 지연 로딩보다 여전히 저렴합니다.

### Structured Outputs — 재시도와 서론을 없애기

[Structured Outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)(베타)는 제약 디코딩을 사용해 스키마에 유효한 JSON을 보장합니다(`output_format`, 또는 도구에 `strict: true`). 절약은 간접적이지만 실질적입니다: 유효하지 않은 JSON 재시도 왕복이 없고(한 번의 파싱 실패가 이 기능의 약 2–3% 스키마 오버헤드보다 비쌉니다), 모델이 답변을 감쌀 장황한 서술형 추론을 걷어냅니다.

### 신경 쓸 필요 없는 두 가지

- **`token-efficient-tools-2025-02-19` 헤더는 과거의 것입니다.** 이것은 **Claude 3.7 Sonnet에서만** 도구 호출 출력 토큰을 줄였습니다; 모든 Claude 4+ 모델(Opus 4.7/4.8 포함)은 토큰 효율적 도구 사용을 **기본으로** 하므로, 이 헤더는 오늘날 무의미(no-op)합니다. 추가하지 마세요.
- **LLMLingua-2**(Microsoft의 프롬프트 압축기, 2–5×)는 실제로 훌륭하지만, 이는 input 압축이라는 동일한 작업에 끼워 넣는 *엔진*일 뿐입니다 — pxpipe(§11)를 비롯한 input 압축 도구가 이미 그 자리를 채우고 있으니, 그것들과 나란히 설치할 별도의 방법이 아닙니다.

## 절약 체크리스트

| 방법 | 절약 효과 |
|------|-----------|
| 짧은 컨텍스트의 subagent | 긴 세션에서 2–5배 |
| 루틴 작업에 중국 모델 | 가격 기준 5–10배 ($30 vs $200) |
| 상시 MCP 대신 skill | 1.5–2배 |
| 출력 필터링용 hook | 테스트/로그 작업에서 1.5–3배 |
| 콤팩트한 스크린샷 | 시각 작업에서 1.5–2배 |
| 전체 컨텍스트 대신 그래프/RAG | 최대 3–5배 |
| 단순 작업에 reasoning 비활성화 | 1.5–2배 |
| subagent에 `--bare` 모드 | 매 실행마다 1.5–2배 |
| 계획 승인이 있는 프레임워크 | 간접적 — 재작업 감소를 통해 |
| rtk — 명령어 출력 압축 (PreToolUse 훅) | git/docker/pytest/로그에서 1.5–3배 |
| graphify — 전체 컨텍스트 대신 그래프 (시맨틱은 OpenRouter 처리) | 대형 저장소 탐색에서 최대 10배; 구축 비용 ~$0.10, Claude 토큰 아님 |
| pxpipe — 요청(시스템 프롬프트/도구 문서/기록)을 밀도 높은 PNG로 렌더링 | 비전 채널로 input에서 ~59–70%; 바이트 단위 정확성에서는 손실, Opus는 opt-in |
| Tool Search / `defer_loading` (Claude Code 자동) | 도구 스키마 토큰 최대 ~85%; 설정 제로 — 규모에 따라 작동 |
| Context editing / microcompact (Claude Code 자동) | 긴 에이전트 실행에서 최대 84%; API 노브 `clear_tool_uses`는 원시 SDK로만 |
| 능동적 prompt caching (안정적 프리픽스, 1시간 TTL) | 캐시 읽기 0.10× (−90%); 대부분 자동, 프리픽스를 바이트 단위로 안정 유지 |
| Message Batches API (오프라인 대량, Claude Code 아님) | input+output 일괄 −50%; API/SDK, Bedrock, Vertex 경유 — 캐싱과 중첩 |
| `/context` + 군살 없는 CLAUDE.md + 유휴 MCP 서버 제거 | 메모리 파일과 유휴 도구 정의를 걷어내 메시지당 수천 토큰 |
| Structured Outputs (`strict` JSON) | 파싱 재시도 왕복과 장황한 서론 제거 |

---

*$200짜리 계정 10개든 얼마든 태울 수 있습니다. 하지만 그건 효율성의 척도가 아닙니다. 목표는 품질을 잃지 않고 비용을 최소한 10배 줄이는 것입니다.*
