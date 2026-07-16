---
title: "Kimi에게 Claude Code를 가르치기: 툴 포맷 변환 실전 가이드"
description: "LLM 제공자 간 툴 호출 포맷을 변환하는 모든 유틸리티 — LiteLLM, Bifrost, Portkey, claude-code-router, Vercel AI SDK, 퍼스트파티 /anthropic 엔드포인트 — 각각이 실제로 무엇을 하는지, 그리고 이들 중 누구도 해결하지 못한 세 가지 실패 유형. 여기에 내가 도달한 결론까지: 각 모델에 맞춰 컨텍스트를 아래로 적응시키는 것을 멈추고, 하네스를 오케스트레이션하는 하네스를 만들어라."
pubDate: 2026-07-13
heroImage: "/images/blog/llm-tool-format-sync-hero.png"
tags: ["llm", "claude-code", "tool-calling", "harness", "proxy", "kimi", "orchestration"]
draft: false
---

# Kimi에게 Claude Code를 가르치기: 툴 포맷 변환 실전 가이드

당신은 Claude Code의 하네스 — 서브에이전트, 스킬, 훅, 몇 달을 들여 튜닝한 그 모든 스캐폴딩 — 를 그대로 돌리되, 그것을 Kimi K2.5나 GLM, DeepSeek로 구동하고 싶어 합니다. 플래그십 청구서가 아프니까요. 거기에 도달하는 방법은 두 가지인데, 둘 다 같은 벽에 부딪힙니다.

1. **다른 모델에게 Claude Code의 툴을 먹인다.** 그 툴 정의가 첫 요청에 들어가고, 모든 툴 호출은 Claude Code가 기대하는 형태로 되돌아와야 합니다. 즉 누군가는 와이어 포맷을 변환해야 합니다.
2. **써드파티 하네스를 쓴다** (OpenCode, Cline, Goose, Crush). 이들은 이미 모든 제공자의 언어를 구사합니다. 하지만 그러면 당신의 하네스가 아니라 *그들의* 하네스를 물려받게 됩니다.

이 글은 옵션 1을 가능하게 하는 계층 — 툴 포맷 변환기 — 에 관한 것이고, 그리고 전체 지형을 그려본 끝에 왜 내가 정답은 둘 다 아니라고 생각하는지에 관한 것입니다.

## 1. 변환은 필드 이름 바꾸기가 아니다

순진한 멘탈 모델은 이렇습니다: Anthropic은 `input_schema`라 부르고 OpenAI는 `parameters`라 부르니, 매퍼 하나 짜면 끝. 그 부분은 *정말로* 사소합니다. 실제 차이는 다음과 같습니다.

**툴 정의:**

| | Anthropic Messages | OpenAI Chat Completions | OpenAI Responses |
| --- | --- | --- | --- |
| 형태 | 평면: `{name, description, input_schema}` | 중첩: `{type:"function", function:{name, description, parameters}}` | 평면: `{type:"function", name, parameters}` |
| Anthropic 전용 추가 필드 | `cache_control`, `input_examples`, `defer_loading` | — | — |

이미 함정이 보입니다: OpenAI 자신의 **Responses API는 평면**이라서, OpenAI Chat Completions보다 Anthropic에 더 가깝습니다. "OpenAI는 곧 중첩된 `function{}`"이라고 하드코딩한 변환기는 OpenAI의 절반에 대해 틀립니다.

**턴 구조 — 이게 진짜 큰 놈입니다:**

- **Anthropic**: 툴 호출은 **assistant 메시지 안의** `tool_use` **콘텐츠 블록**이며, `text`와 `thinking` 블록 사이에 섞여 들어갑니다. 결과는 **`role: "user"`**인 메시지 안에 `tool_result` 블록으로 되돌아옵니다.
- **OpenAI CC**: 툴 호출은 assistant 메시지 **위에** 붙는 `tool_calls[]` 배열입니다. 결과는 **`role: "tool"`**인 별도 메시지입니다.
- **OpenAI Responses**: 둘 다 아닙니다 — 독립적인 `function_call` 항목이 `call_id`로 상관관계를 맺는데, 이 `call_id`는 항목 자체의 `id`와는 *다른 필드*입니다.

프록시가 처리해야 하는 결과들: Anthropic은 같은 assistant 턴에서 텍스트 *와* 툴 호출을 함께 허용합니다(순진한 변환기는 이를 두 메시지로 쪼개 유효하지 않은 히스토리를 만듭니다). **모든 `tool_use`는 대응하는 `tool_result`가 있어야 하며, 아니면 API가 400을 냅니다** — "고아 툴 호출(orphaned tool calls)"은 가장 흔한 정제 작업이고, LiteLLM은 이것만을 위한 [전용 기능](https://docs.litellm.ai/docs/completion/message_sanitization)까지 내놓았습니다.

**인자 인코딩:** Anthropic의 `tool_use.input`은 **파싱된 객체**입니다. OpenAI의 `function.arguments`는 **JSON 문자열로 인코딩된 값**입니다. 인자 없는 호출은 소비자가 `{}`를 기대하는 자리에 `""`를 내보내고, `JSON.parse`가 예외를 던집니다 — Vercel AI SDK의 실제 버그입니다 ([#10295](https://github.com/vercel/ai/issues/10295)).

**`tool_choice`:** Anthropic의 `any`는 OpenAI의 `required`입니다. `disable_parallel_tool_use`는 Anthropic에서는 `tool_choice` *안에* 들어가지만, OpenAI에서는 *최상위* `parallel_tool_calls`입니다. `tool_choice`를 바꾸면 캐시된 메시지 블록도 무효화됩니다.

**JSON Schema 이식성:** 주요 제공자 중 최상위 `$ref`를 받아주는 곳은 없습니다 — 인라인해야 합니다. Gemini는 `items: {}`를 거부합니다. OpenAI의 strict 모드는 `pattern`/`minimum`/`format`을 받아들이지만 **강제하지는 않습니다**. 그리고 Responses에서는 `strict`를 *생략*해도 어쨌든 strict 모드를 시도하고 조용히 성능을 떨어뜨립니다 — 그래서 단순히 툴 정의를 전달만 하는 프록시는 당신에게 알리지 않은 채 의미론을 바꿔버린 셈이 됩니다.

위의 모든 것은 기계적입니다. 성가시지만 해결 가능합니다. 다음 절은 그렇지 않습니다.

## 2. 아무도 해결하지 못한 세 가지

내가 살펴본 모든 게이트웨이는 똑같은 세 곳에서 무너집니다.

### 2.1 스트리밍 재조립

비스트리밍 변환은 해결된 문제입니다. **Claude Code는 항상 스트리밍합니다.**

- **Anthropic SSE**: `content_block_start` (타입 `tool_use`, `id` + `name`을 실어 나름) → N회의 `content_block_delta` with `{"type":"input_json_delta","partial_json":"…"}` → `content_block_stop` → `stop_reason:"tool_use"`인 `message_delta`.
- **OpenAI SSE**: **`index`** 필드로 키가 매겨진 `delta.tool_calls[]` 조각들. `id`/`name`은 한 번만 나타나고, 인자는 문자열 조각으로 도착하며, `finish_reason:"tool_calls"`로 끝납니다.

하나를 다른 하나로 변환하려면 청크에 걸쳐 유지되는 `index`별 상태 기계가 필요하고, 바로 여기서 모든 것이 무너집니다. LiteLLM은 `content_block_start` + `content_block_stop`을 내보내면서 **그 사이에 `input_json_delta`가 하나도 없이** 보낸 적이 있습니다 — 모든 툴 호출이 `input: {}`으로 도착하고 Claude Code는 필수 파라미터 누락을 보고합니다 ([#25561](https://github.com/BerriAI/litellm/issues/25561), #25321, #25390). Bifrost는 텍스트+툴이 섞인 턴에서 `stop_reason: "tool_use"` 대신 `"end_turn"`을 보내서, 클라이언트가 assistant가 끝났다고 착각합니다 ([#3638](https://github.com/maximhq/bifrost/issues/3638)). Portkey는 스트리밍 델타에서 `assistant` 역할을 누락합니다 ([#1000](https://github.com/Portkey-AI/gateway/issues/1000)). Roo Code는 순전히 제공자 간 스트리밍 불일치를 땜질하려고 청크에 걸쳐 두 개의 정적 상태 맵을 유지했습니다.

### 2.2 추론 상태는 불투명하면서 필수적이다

이것이 Claude-Code에 외부 모델을 붙인 구성이 손실을 겪는 가장 깊은 구조적 이유입니다.

Anthropic의 [확장 사고(extended thinking) 문서](https://platform.claude.com/docs/en/build-with-claude/extended-thinking)는 명시적입니다: `tool_result`를 보낼 때, 마지막 assistant 메시지의 `thinking` 블록은 **완전하고 수정되지 않은 채 그대로 되돌려 보내야 합니다**. 아니면 `400: "thinking or redacted_thinking blocks in the latest assistant message cannot be modified"`를 받습니다. Anthropic 자체 문서가 지목하는 근본 원인은 *"콘텐츠 블록을 타입별로 필터링하는 애플리케이션 코드"* — 바로 포맷 변환기가 하는 일입니다.

그리고 thinking 블록의 `signature`는 **추론의 암호화된 표현**으로, 서버가 이를 복호화해 상태를 재구성합니다. **이를 실어 나를 OpenAI 와이어 필드는 존재하지 않습니다.** Chat Completions를 왕복하면 그것은 파괴됩니다. LiteLLM #15601, vercel/ai #11602, claude-code-router #1400/#1410이 서로 다른 코드베이스에 대한 별개의 오픈 버그로 모두 존재하는 이유가 이것입니다: 사실 같은 버그입니다.

모든 제공자가 자기만의 버전을 갖고 있고 어느 것도 상호운용되지 않습니다 — Anthropic의 `signature`, OpenAI의 `reasoning.encrypted_content` (스트리밍에서는 **`output_item.added`에는 없고 `output_item.done`에만 나타납니다** — 첫 이벤트만 읽는 변환기는 조용히 그것을 떨어뜨립니다), Gemini의 `functionCall` 파트에 붙는 `thought_signature`. 알아둘 만한 것 하나 더: **`tool_choice: any`와 `tool_choice: tool`은 확장 사고에서 하드 에러입니다** — `auto`/`none`만 허용됩니다 — 이는 강제 툴 기반 구조화 출력을 완전히 망가뜨립니다.

### 2.3 프롬프트 캐싱이 증발한다

`cache_control`은 Anthropic 전용입니다. OpenAI의 캐싱은 암묵적이라, 매핑할 대상 자체가 없습니다. **모든 Anthropic→OpenAI 변환은 당신의 프롬프트 캐싱을 조용히 폐기합니다** — [토큰 절약 가이드](/blog/saving-tokens-llm)에서 가장 큰 레버였던 그것을요. 토큰당 단가에서 아끼지만 캐시 미스로 되갚게 되고, 로그의 어디에도 그 사실을 알려주는 것은 없습니다.

DeepSeek은 이를 대놓고 말하는 유일한 벤더입니다: 그들의 [Anthropic 호환 문서](https://api-docs.deepseek.com/guides/anthropic_api)는 `cache_control`을 이미지, 문서, MCP 통합 바로 옆에 *지원 안 함*으로 나열합니다. 그 점은 존중합니다.

## 3. 변환기들

### LiteLLM — Python, ~53k ★, 프록시 + 라이브러리

[LiteLLM](https://github.com/BerriAI/litellm)은 기본 정답이고, 사람들이 끊임없이 혼동하는 두 개의 Anthropic 표면을 갖고 있습니다. `POST /anthropic/*`는 **패스스루** — 변환이 없고, 그냥 Anthropic으로 전달하며 비용 추적을 더할 뿐입니다. `POST /v1/messages` ([`anthropic_messages`](https://docs.litellm.ai/docs/anthropic_unified/))가 **진짜 변환**입니다: Anthropic 포맷 입력, 아무 제공자 출력. Claude Code는 [일급으로 문서화](https://docs.litellm.ai/docs/tutorials/claude_non_anthropic_models)되어 있습니다 — `ANTHROPIC_BASE_URL`을 여기로 향하게 하고 `CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY=1`을 설정하세요.

가장 완전하고 가장 실전 검증이 된 도구이며, §2.1의 스트리밍 버그 대부분이 여기에 제기되었습니다 — 더 나빠서가 아니라, 다들 이걸 돌리기 때문입니다. Python이고, 무겁고, 로깅이 그 자체로 문제가 될 만큼 수다스럽습니다.

### Bifrost — Go, ~6.5k ★, Apache-2.0, 게이트웨이

[Bifrost](https://github.com/maximhq/bifrost)는 Python 프로세스 대신 단일 바이너리를 원한다면 손이 갈 도구입니다. 드롭인 접두사(`/openai`, `/anthropic`, `/genai`)를 제공하고, [Claude Code가 일급으로 문서화된 대상](https://docs.getbifrost.ai/cli-agents/claude-code)이며 `ANTHROPIC_DEFAULT_SONNET_MODEL` / `..._HAIKU_MODEL` 오버라이드를 지원합니다. 자신의 변환 단계를 정직하게 문서화합니다 — 시스템 메시지 추출, 툴 메시지 그룹화, thinking 블록 변환, 최소 1024 예산으로 `reasoning`→`thinking`. MCP 게이트웨이이기도 합니다.

"LiteLLM보다 50배 빠르고, 11µs 오버헤드"라는 주장은 벤더가 발표한 것으로 독립 재현이 없습니다. 그에 맞게 취급하세요.

### Portkey AI Gateway — TypeScript, ~12k ★, 게이트웨이

[Portkey](https://github.com/Portkey-AI/gateway)는 가장 깔끔한 개념을 갖고 있습니다: **세 개의 보편적 인그레스 포맷** — `/v1/chat/completions`, `/v1/responses`, `/v1/messages` — 각각이 *모든* 제공자와 동작합니다. 설계상 양방향입니다. 하지만 퍼스트파티 Claude Code 튜토리얼이 없고, 오픈 이슈들은 정확히 §2의 실패 유형들입니다 (병렬 호출에서 tool_use↔tool_result ID 짝짓기 깨짐, Anthropic에 대해 `tool_choice: none` 거부, 스트리밍 델타에서 역할 누락).

### claude-code-router — TypeScript, ~36k ★

여기서 낡은 멘탈 모델을 바로잡을 필요가 있습니다: [CCR](https://github.com/musistudio/claude-code-router)은 사람들이 기억하는 작은 트랜스포머 프록시가 더 이상 아닙니다. 이제는 **Electron 컨트롤 패널과 로컬 모델 게이트웨이를 함께 내놓는 v3.0.11의 모노레포**이고, Codex와 ZCode도 구동하며, OpenRouter, DeepSeek, Moonshot/Kimi, Z.AI, MiniMax, SiliconFlow용 프리셋을 갖고 있습니다. 트랜스포머 계층은 별도의 훨씬 작은 라이브러리 [musistudio/llms](https://github.com/musistudio/llms)로 계속 존재하며, 네 개의 훅 인터페이스(`transformRequestIn/Out`, `transformResponseIn/Out`)를 갖습니다.

이슈 트래커를 읽으면 §2.2의 패턴이 튀어나옵니다: 오픈 버그들은 평범한 툴 호출이 아니라 **추론 × 툴 호출**에 몰려 있습니다. 스트리밍 추론이 툴 인자 델타를 오염시키는 것, Kimi의 `reasoning_content`가 툴 호출 히스토리에 걸쳐 보존되지 않는 것, Gemini의 누락된 `thought_signature`, DeepSeek의 thinking+tools 400. 평범한 툴 호출은 작동합니다. 사고 더하기 툴 호출이 피가 나는 지점입니다.

### Vercel AI SDK — TypeScript, ~25k ★, **게이트웨이가 아니라 라이브러리**

[AI SDK](https://ai-sdk.dev/docs/foundations/tools)는 제공자별 어댑터를 통해 인프로세스로 정규화합니다. `tool({description, inputSchema, execute})`, Zod 또는 원시 JSON Schema. Bun/TS 스택에 아름답게 들어맞지만, 이건 **라이브러리**입니다 — 먼저 그 주위에 프록시를 짓지 않고서는 Claude Code 앞에 놓을 수 없습니다.

SDK 전체에서 가장 시사하는 바가 큰 디테일은 `experimental_refineToolInput`인데, 문서에 따르면 "서로 다른 LLM 제공자가 약간씩 다른 툴 입력을 생성하기" 때문에 존재합니다 (`null` vs `""`). 정규화가 손실적이라는 공식적 자백으로서 출시된 탈출구입니다.

## 4. 프록시 카테고리는 죽어가고 있고, 그것은 좋은 소식이다

여기 내가 예상하지 못했던 발견이 있습니다. 가장 잘 알려진 네 개의 커뮤니티 Anthropic 호환 프록시 중 **두 개가 지난 6개월 사이 아카이브**되었습니다: [y-router](https://github.com/luohy15/y-router) (2026년 1월 아카이브, README는 이제 OpenRouter의 공식 통합을 가리킴)와 [anthropic-proxy](https://github.com/maxnowack/anthropic-proxy) (2026년 4월 아카이브). 이들을 죽인 것은 **제공자들이 그 엔드포인트를 스스로 내놓았다**는 사실입니다:

| 제공자 | Anthropic 호환 base URL |
| --- | --- |
| Moonshot / Kimi | `https://api.moonshot.ai/anthropic` |
| Z.ai / Zhipu GLM | `https://api.z.ai/api/anthropic` |
| DeepSeek | `https://api.deepseek.com/anthropic` |
| MiniMax | `https://api.minimax.io/anthropic` |
| Qwen / DashScope | `https://dashscope-intl.aliyuncs.com/apps/anthropic` |
| OpenRouter | `https://openrouter.ai/api` (그들의 "Anthropic 스킨") |

이것은 [Clother](/blog/clother-claude-wrappers)와 [OpenClaude](/blog/openclaude-multi-provider)가 이미 환경 변수 하나로 전환하는 바로 그 목록입니다. **그러니 흔한 경우 — "Kimi로 Claude Code를 구동하고 싶다" — 에는 포맷 변환기가 전혀 필요 없습니다.** 벤더가 당신을 위해 서버 쪽에서 무료로 하나 돌려줍니다. `ANTHROPIC_BASE_URL`을 설정하고 가면 됩니다.

두 가지 주의점. Kimi의 `/anthropic` 엔드포인트는 **널리 쓰이지만 벤더가 문서화하지 않았습니다** (문서화를 요청하는 [오픈 이슈](https://github.com/MoonshotAI/Kimi-K2/issues/129)가 있습니다). 그리고 **Cloudflare AI Gateway는 여기 맞는 도구가 아닙니다** — 그 `/anthropic` 라우트는 패스스루 전용입니다. Anthropic으로 *가는* 트래픽을 캐시하고 관찰할 뿐, 그것을 변환해 나가게 하지는 않습니다.

진짜 변환기에 손을 뻗는 것은 벤더 엔드포인트가 주지 않는 무언가가 필요할 때입니다: **라우팅**(Haiku급 서브에이전트에는 저렴한 모델, 리드에는 플래그십), 레이트 리밋 시 제공자 간 페일오버, 함대 전체의 비용 회계를 위한 한 곳 — [토큰 가이드](/blog/saving-tokens-llm) §2가 다루는 것들 말입니다.

## 5. 다른 경로: 이미 정규화하는 하네스들

Claude Code를 위해 변환하고 싶지 않다면, Claude의 포맷이 애초에 필요 없었던 하네스를 쓰세요:

| 하네스 | 언어 | ★ | 정규화 방식 |
| --- | --- | --- | --- |
| **OpenCode** | TS/Bun | 185k | Vercel AI SDK + [models.dev](https://models.dev) 레지스트리 |
| **Cline** | TS | 65k | 자체 제공자별 핸들러 |
| **Goose** | Rust | 51k | 자체 `Provider` 트레이트 |
| **Crush** | Go | 27k | [fantasy](https://github.com/charmbracelet/fantasy) + catwalk 레지스트리 |
| **Aider** | Python | 47k | LiteLLM — 단 ⚠️ 2026년 5월 이후 정체 |
| **Roo Code** | TS | 24k | 🔴 **2026년 5월 아카이브** |

이 표가 내게 가르쳐 준 세 가지:

1. **XML 툴 호출 시대는 끝났다.** Cline v3.35는 시스템 프롬프트 안의 XML에서 네이티브 JSON 툴 호출로 이주했습니다. Roo는 XML을 완전히 제거하고 이제 `id`가 없는 툴 호출을 하드 리젝트합니다. 모델에게 XML을 내보내게 프롬프트해서 포맷 변환을 우회할 계획이었다면 — 그 배는 이미 떠났고, 업계가 의도적으로 떠나보냈습니다.
2. **Goose의 "toolshim"은 이 모든 것이 심(shim)으로 처리 가능한 계층이라는 존재 증명이다.** 네이티브 툴 호출이 없는 모델을 위해, Goose는 주 모델이 느슨한 JSON을 내보내게 한 뒤, **두 번째의 저렴한 해석기 모델**(기본값은 Ollama의 `mistral-nemo`)을 돌려 그것을 유효한 툴 호출로 강제합니다. 실험적이고 멈추기도 하지만, 개념적으로는 이 아이디어의 가장 순수한 진술입니다: 툴 포맷은 변환 문제이고, 변환은 작은 모델에게 넘길 수 있는 일이라는 것.
3. **Aider는 이 어느 것에 대해서도 참고 사례가 아니다** — 툴 호출을 의도적으로 완전히 피하고 SEARCH/REPLACE 텍스트 블록으로 편집합니다. 그 실패 모드는 스키마 표류가 아니라 "블록 매칭 실패"입니다. 다른 우주입니다.

그리고 언어별 정규화 계층의 레퍼런스 구현: **TS → Vercel AI SDK, Go → charmbracelet/fantasy, Python → LiteLLM, Rust → 직접 구현.**

## 6. 표준이 당신을 구해주지 않는다

**MCP는 이것을 해결하지 않는다.** 이것이 내가 부딪힌 가장 흔한 오해입니다. MCP는 *발견과 전송* 계층입니다: `tools/list`가 JSON Schema를 건네주고, 그다음 **하네스는 여전히 각 MCP 툴을 제공자의 네이티브 툴 정의로 변환해야 하며**, 모델은 여전히 제공자 네이티브 툴 호출을 내보냅니다. §1의 모든 이식성 함정이 그대로 적용됩니다. MCP는 문제 위에 올라탈 뿐, 그것을 건드리지 않습니다.

MCP에도 자체적인 격변이 있습니다: 다음 스펙 개정판이 **2026-07-28**에 나오는데 출시 이래 가장 큰 변화입니다 — `initialize` 핸드셰이크가 **완전히 제거**되고, `Mcp-Session-Id`가 사라지며, HTTP+SSE 전송이 폐기됩니다. `2025-11-25`에 맞춰 작성된 것은 무엇이든 재작업이 필요할 것입니다.

보편적 툴 호출 스펙에 관해서는: **아무도 이기고 있지 않습니다.** [UTCP](https://www.utcp.io)는 실재하고 활발하며 틈새(스펙 ~300★)입니다 — 그리고 MCP 호환 플러그인을 함께 내놓는데, 이는 누가 이기고 있는지를 말해줍니다. `agents.json`은 죽었습니다(마지막 푸시 2025년 8월). IBM의 ACP는 A2A에 흡수되었습니다. A2A 자체는 건강하지만 **직교적**입니다: 불투명한 에이전트끼리의 에이전트↔에이전트 상호운용이지, 툴 스키마 정규화가 아닙니다. 사실상의 표준화는 지루한 방식으로 일어나고 있습니다 — 모든 벤더가 `/chat/completions` 형태를 복제하고, 이제는 `/v1/messages` 형태까지 복제하는 것.

## 7. 내가 실제로 도달한 결론: Claude *아래*가 아니라 *위*에 지어라

나는 한동안 Claude Code를 **아래에서** 최적화하려 했습니다 — 그 작업의 일부를 가로채고, 그 밑의 모델을 바꾸고, 그 컨텍스트를 깎고, 그 툴을 변환하고. 그리고 나는 그것이 막다른 길이라 생각합니다. 작동하게 만들 수 없어서가 아니라, §2가 말하는 것 때문입니다: 스트리밍 재조립, 불투명한 추론 상태, 사라진 프롬프트 캐싱 — 이 세 실패 유형은 **어떤 변환 계층도 해결하지 못했고 완화만 했을** 뿐입니다. 당신은 기능을 만드는 게 아니라, 세 개의 움직이는 API에 맞선 영구적 유지보수에 가입하는 것입니다. 하네스 아래를 최적화하는 것은 연구 프로젝트입니다 — 끝없는 실험, 설명서 없음 — 그리고 제공자가 마이너 버전을 낼 때마다 부서지는 물건을 만들어냅니다.

더 나은 수는 반대 방향입니다: **Claude Code 위에 앉는 당신만의 하네스를 짓고, Claude Code를 여러 블랙박스 에이전트 중 하나로 취급하라.**

당신이 오케스트레이션하는 단위는 더 이상 *모델*이 아니라 *하네스 프로세스*가 됩니다: 여기 Claude Code, 저기 OpenCode 세션, 저쪽 Codex 실행 — 각각 이미 자기 제공자의 툴 방언에 유창하고, 각각 자기 컨텍스트, 자기 캐싱, 자기 추론 상태를 관리합니다. 당신은 그들이 이미 바깥 세계에 노출하는 인터페이스 — CLI, `--format json`, 재개할 수 있는 세션 ID — 를 통해 그들과 대화하지, 그들의 내부 와이어 프로토콜을 통하지 않습니다.

그것이 당신에게 사주는 것:

- **포맷 문제가 사라진다.** 당신은 툴 호출을 절대 변환하지 않습니다. 툴 호출 계층을 절대 건드리지 않으니까요. Claude Code는 Anthropic을 네이티브로 구사합니다. OpenCode는 원하는 무엇이든 구사합니다. 각각이 자기 캐시, 자기 thinking 블록, 자기 스트리밍 — §2가 와이어로 옮길 수 없다고 말하는 그 세 가지 — 를 자기 것으로 유지합니다. **§2의 버그들은 경계를 넘는 것에 관한 버그입니다. 넘지 마세요.**
- **모델마다 컨텍스트를 다시 적응시키는 일을 멈춘다.** 당신의 컨텍스트를 Kimi의 별난 점에, 그다음 GLM에, 그다음 DeepSeek에 적응시키는 것은 N배의 작업이고 썩어갑니다. 하네스 위에서는 컨텍스트 적응이 *각 하네스 자신의 일* — 그들이 이미 잘하는 그것 — 이 됩니다.
- **모델 선택이 배관 결정이 아니라 라우팅 결정이 된다.** 기계적 작업엔 저렴한 하네스, 어려운 작업엔 플래그십 하네스. 그것은 프록시가 아니라 스케줄러입니다.
- **그것은 [하네스 테제](/blog/harness-not-model)를 한 단계 위에 적용한 것이다.** 6.7%를 68%로 바꾸는 것이 모델이 아니라 하네스라면, 레버리지는 하네스 아래에서 엔진을 바꾸는 데 있지 않습니다. 어느 하네스가 무엇을 돌릴지 결정하고, 같은 실수에 두 번 값을 치르길 거부하는 계층에 있습니다.

구체적으로, 내게 이것은 첫 단계로 [cmdop-claude](https://pypi.org/project/cmdop-claude/)를 cmdop에 접어 넣는 것을 의미합니다 — 그다음 *전체* 하네스 오케스트레이션 로직을 그곳으로 옮기는 것, 애초에 저렴한 모델을 요청한 적 없는 하네스 아래에 그것들을 계속 볼트로 조여 붙이는 대신에요.

## 요점

원하는 게 오직 Kimi로 Claude Code를 구동하는 것이라면: **벤더의 `/anthropic` 엔드포인트를 쓰고 변환기는 통째로 건너뛰어라.** 그 위에 라우팅, 페일오버, 함대 전체 비용 회계가 필요하다면: **이미 Python이라면 LiteLLM, Go 바이너리 하나를 원하면 Bifrost.** 스트리밍 툴 호출 버그를 각오하고, 프롬프트 캐싱을 잃을 것을 각오하고, 사고 더하기 툴이 날카로운 모서리가 될 것을 각오하세요 — 그리고 그것들이 당신이 고른 도구의 속성이 아니라 경계의 속성임을 알아두세요.

그리고 전략적 답은 그 경계를 미는 것을 멈추는 것입니다. 모든 모델에게 아래에서 Claude Code의 방언을 가르치는 데 인생을 쓰지 마세요. **위에서 하네스에게 말하는 하네스를 지으세요** — 그러면 그들 중 누가 어떤 방언을 쓰든 결코 상관없어집니다.
