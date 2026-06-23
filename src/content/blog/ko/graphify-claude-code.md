---
title: "Claude Code의 graphify: 저장소 전체를 읽는 대신 지식 그래프, 시맨틱은 저렴한 OpenRouter에서"
description: "Claude Code를 위한 바로 쓸 수 있는 나의 graphify 설정: 저장소 전체 읽기 대신 지식 그래프, Claude 토큰 대신 저렴한 OpenRouter(deepseek)에서의 시맨틱 추출, 훅을 통한 자동 감시, 그래프로의 비밀값 유출 방지. 모두 claude-code-token-savers 저장소에 패키징되어 있습니다."
pubDate: 2026-06-23
heroImage: "/images/blog/graphify-hero.png"
tags: ["graphify", "claude-code", "tokens", "knowledge-graph", "openrouter"]
draft: false
---

# Claude Code의 graphify: 저장소 전체를 읽는 대신 지식 그래프

[토큰 절약 가이드](https://www.suenot.com/blog/saving-tokens-llm/)에서는 graphify를 전체 스택의 일부로 간단히 언급했습니다. 이 글에서는 내가 자동화를 어떻게 구성했는지를 따로 깊이 파고듭니다. 정확히 무엇을 전역으로 켜두는지, 그리고 왜 그것이 Claude 토큰을 태우지 않는지를 다룹니다.

문제는 단순합니다. 다른 사람의 코드(또는 반 년 전 당신 자신의 코드)를 이해하려면, 에이전트는 파일을 묶음으로 읽어들이고 모든 파일이 컨텍스트에 들어갑니다. 이는 입력 측면에서 비싸고, 게다가 컨텍스트 부패(context rot)를 끌어들입니다. 많이 쌓을수록 모델은 더 못 생각하게 됩니다. [graphify](https://github.com/safishamsi/graphify)는 이 결합을 끊어냅니다. 단 한 번, 저장소로부터 지식 그래프(노드, 관계, 커뮤니티, god 노드)를 구축하고, 당신은 파일을 윈도우에 쏟아붓는 대신 그것을 **질의**합니다.

모든 것이 하나의 저장소에 패키징되어 있습니다 — **[suenot/claude-code-token-savers](https://github.com/suenot/claude-code-token-savers)**(`graphify/` 폴더, 멱등적인 `setup.sh`, 패치, 훅).

## 핵심 비법: 남의 토큰으로 시맨틱을

그래프 구축은 엔티티와 관계 추출을 위한 LLM 호출의 더미입니다. 그것들을 Claude로 돌리면, 절약은 지출로 바뀝니다. 그래서 시맨틱 추출은 Claude 예산이 아니라 **저렴한 OpenRouter**로 떠넘겨집니다.

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

`deepseek/deepseek-v4-flash` — 100만 토큰당 $0.09 / $0.18, 100만 컨텍스트. 중간 규모 프로젝트의 그래프를 구축하는 데 드는 비용은 **OpenRouter에서 ~$0.10, 그리고 Claude 세션 토큰은 0** 입니다. 모델은 변수 하나로 바꿉니다: `export GRAPHIFY_OPENROUTER_MODEL=qwen/qwen3.7-plus`.

중요한 세부 사항: `graphify install`은 `~/.claude/skills/graphify/SKILL.md`를 덮어씁니다. 그 파일은 추출 백엔드 우선순위를 하드코딩하고 있으며, 복원하지 않으면 graphify는 Claude 서브에이전트로 폴백하여 당신의 토큰을 태웁니다. 올바른 우선순위는:

1. **OpenRouter**(`OPENROUTER_API_KEY`가 있는 경우) — 텍스트 청크가 여기로 갑니다.
2. **Gemini**(`GEMINI_API_KEY` / `GOOGLE_API_KEY`가 있는 경우).
3. **Claude 서브에이전트** — 오직 마지막 폴백으로만.

## 설치

[`uv`](https://docs.astral.sh/uv/)와 환경에 `OPENROUTER_API_KEY`가 필요합니다.

```bash
cd graphify
./setup.sh          # installs graphify, the OpenRouter backend, patches, hooks, no-media
```

`setup.sh`는 멱등적입니다(롤백 포함). 직접 손으로 하고 싶다면, 내부에서 돌아가는 것은:

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

## 자동 감시: 그래프가 스스로 갱신된다

자동화의 심장은 `SessionStart` 훅인 `build-and-watch.sh`입니다. 세션이 시작될 때마다 프로젝트를 검사하고 분기를 고릅니다:

- **그래프 존재** → `graphify watch`(저렴, AST 전용, LLM 없음) 시작 + pre-commit 가드 설치 → 상태 "watching".
- **그래프 미초기화** → "run `/graphify .`"를 출력하고 아무것도 하지 않습니다. 이것은 안전장치입니다. 실수로 연 루트나 거대한 폴더가 조용히 인덱싱으로 들어가 토큰을 태우는 일이 없습니다.
- `~/.graphify/autobuild` 마커 → 추가로, OpenRouter를 통해 작고 신선한 프로젝트를 자동 구축합니다(상한: 500개 파일 / 200만 단어. 그보다 큰 것은 건너뛰고 손으로 구축하도록 요청합니다).

안전 가드: `$HOME`, FS 루트, 시스템/`tmp` 폴더, `$HOME`의 상위 디렉터리, 그리고 `.graphify-skip`이 있는 모든 프로젝트를 건너뜁니다. 전역 킬 스위치는 `~/.graphify/disable-autowatch`입니다. 프로젝트당 정확히 하나의 감시자(원자적 `mkdir` 락 + PID 체크). `SessionEnd`에서는 `stop-watch.sh`에 의해 종료됩니다. `watch`는 코드/AST 레이어만 갱신합니다. 문서에는 `/graphify . --update`가 필요합니다.

`~/.claude/settings.json`의 훅 맵(병합할 것, 기존 것을 덮어쓰지 말 것):

```
SessionStart  -> ~/.graphify/build-and-watch.sh    # status + watch
SessionEnd    -> ~/.graphify/stop-watch.sh          # stop watcher
```

## 무엇이 그래프에 들어가지 않는가(그리고 왜 그게 중요한가)

그래프는 커밋에 포함될 수 있고, 따라서 비밀값을 그 안에 들여서는 안 됩니다. 세 가지 독립적인 메커니즘:

1. **비밀값과 `.env`** — graphify에 내장된 `_is_sensitive`에 의해 항상 제거됩니다. 설정 불필요.
2. **미디어** — ignore 파일을 만지지 않는 깔끔한 토글: `patch-no-media.py`는 `~/.graphify/no-media`가 존재할 때(또는 `GRAPHIFY_NO_MEDIA=1`) `detect()`가 이미지/pdf/비디오/office를 건너뛰게 합니다. 마커를 지우면 미디어가 다시 대상이 됩니다.
3. **`.gitignore` 가림(shadowing) — 수정됨.** 업스트림에서는 폴더의 `.graphifyignore`가 자신의 `.gitignore`를 **완전히 가렸습니다**: `.gitignore`에만 존재하는 패턴(이를테면 비밀값)이 여전히 인덱싱되었던 것입니다. `patch-merge-ignore.py`는 교체가 아니라 병합합니다 — 이것이 업스트림의 [PR #1364](https://github.com/safishamsi/graphify/pull/1364)입니다.

그 위에 더해 — **pre-commit 가드**(`precommit-graph-guard.sh`). graphify화된 git 저장소에 설치되며, `.gitignore`된 파일이 그래프에 들어갔다면 `graphify-out/graph.json`의 커밋을 **차단**합니다. 커밋된 그래프로의 비밀값 유출에 대한 심층 방어입니다. `git commit --no-verify`로 우회할 수 있습니다.

## 사용 방법

한 번 구축하고, 그다음 질의:

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

출력은 인터랙티브 HTML, GraphRAG-JSON, 그리고 사람이 읽을 수 있는 `GRAPH_REPORT.md`입니다. 또한 `--mcp`(에이전트용 stdio 서버)와 `--wiki`도 있습니다. 그때부터는 "auth 모듈 전체를 읽어라" 대신, 에이전트가 그래프를 두드려 자신에게 필요한 바로 그 조각만 정확히 얻습니다.

## graphify 업그레이드 후

`uv tool upgrade graphifyy`와 `graphify install`은 site-packages를 지우고(3개의 `detect.py` 패치가 모두 사라집니다) `SKILL.md`를 덮어씁니다. 해결책은 `./setup.sh`를 다시 실행하고(패치, 파일, no-media 마커 복원), `SKILL.md`에 백엔드 우선순위 블록을 다시 추가하는 것입니다. 업그레이드에서 살아남는 것: `~/.graphify/*`, `~/.claude/settings.json`의 훅, 저장소별 `.git/hooks/pre-commit`.

---

요점: graphify는 당신의 컨텍스트에서 가장 무거운 레이어 — "저장소 전체를 읽기" — 를 제거하며, 그것을 남의 몇 센트짜리 토큰으로 해내고, 백그라운드에서 스스로 갱신하며, 비밀값을 그래프로 끌고 들어가지 않습니다. rtk(명령 입력) 및 caveman(모델 출력)과의 조합은 [토큰 절약 가이드](https://www.suenot.com/blog/saving-tokens-llm/)에서 다룹니다.
