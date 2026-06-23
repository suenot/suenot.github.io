---
title: "cctoggle: 명령어 하나로 모든 Claude Code 플러그인과 MCP 서버를 끄고——다시 켜기"
description: "모든 Claude Code 플러그인과 사용자 범위 MCP 서버를 한 번에 끄는 작은 유틸리티와 전역 /cctoggle 슬래시 명령어——그들의 도구 정의를 컨텍스트에서 걷어내고——비활성화한 것만 정확히 복원한다. 앱 재시작 불필요. 내용: 적용 방식, 선택적 비활성화, 백업, 그리고 한계."
pubDate: 2026-06-23
heroImage: "/images/blog/cctoggle-hero.png"
tags: ["cctoggle", "claude-code", "tokens", "mcp", "plugins"]
draft: false
---

# cctoggle: 명령어 하나로 모든 Claude Code 플러그인과 MCP 서버 끄기

Claude Code 세션이 텅 비어 있는 경우는 거의 없습니다. 플러그인이 로드되고, 사용자 범위 MCP 서버가 연결되며, 각각이 한 묶음의 도구 정의를 들고 오고, 그 모든 것이 첫 메시지를 보내기도 전에 컨텍스트로 들어옵니다. 때로는 그 반대를 원할 때가 있습니다——특정 작업을 위한 깔끔하고 가벼운 세션——그리고 명령어 하나로 복원하는 것이죠.

바로 그것을 위해 제가 [**cctoggle**](https://github.com/suenot/cctoggle)(공개, MIT)를 만들었습니다——모든 플러그인과 사용자 범위 MCP 서버를 한 번에 끈 다음, 비활성화한 것만 정확히 복원하는 작은 유틸리티이자 전역 슬래시 명령어입니다.

## 문제

세션이 더 많은 플러그인과 MCP 서버를 짊어질수록 컨텍스트는 더 부풀어 오릅니다. 그들의 도구 정의는 토큰 예산을 갉아먹고, 사용 가능한 도구 목록을 어지럽힙니다. 이것은 더 비쌀 뿐 아니라(입력이 늘어남) 품질에도 더 나쁩니다(쌓아 넣을수록 모델이 더 헤맵니다). 그리고 손으로 하려면 설정 파일 두 개를 편집한 다음, 무엇을 건드렸는지 정확히 고통스럽게 기억해야 다시 되돌려 놓을 수 있습니다.

cctoggle은 양쪽 끝을 모두 막습니다. 명령어 하나로 모든 것을 비활성화하고, 무엇을 비활성화했는지 정확히 기억하므로, 그것만 복원할 수 있습니다.

## 무엇을 하는가

네 개의 명령어로, Claude Code 안에서는 `/cctoggle`로, 터미널에서는 `cctoggle` CLI로, 양쪽 다 동작합니다:

```bash
/cctoggle status          # what's currently enabled/disabled
/cctoggle off             # disable all plugins + user-scope MCP
/cctoggle on              # restore exactly what cctoggle disabled
/cctoggle restore-backup  # roll back to a config backup
```

`off`는 두 가지 일을 합니다:

- **플러그인** —— `~/.claude/settings.json`의 `enabledPlugins` 플래그를 `false`로 바꿉니다.
- **MCP** —— 사용자 범위 MCP 서버 정의를 `~/.claude.json`에서 꺼내 로컬 상태 파일에 보관합니다.

`on`은 cctoggle 자신이 비활성화한 것만 엄격하게 복원합니다. 만약 당신이 앞서 이미 어떤 플러그인이나 서버를 손으로 꺼두었다면, `on`은 그것을 그대로 두고 다시 켜지 않습니다. 이것은 중요한 디테일입니다. 이 명령어는 "모든 것을 켜기"가 아니라 "내 마지막 `off`를 되돌리기"입니다.

### 선택적 비활성화

모든 것을 날려버릴 필요는 없습니다. `off`는 인자를 받습니다:

```bash
cctoggle off --keep superpowers,caveman   # disable all except these
cctoggle off graphify rtk                  # disable only the listed ones
```

## 변경이 어떻게 적용되는가 (이해할 가치가 있음)

여기가 만만치 않은 부분입니다——플러그인과 MCP는 적용 방식이 다릅니다.

**플러그인 변경은 현재 세션에 적용됩니다**——하지만 당신이 `/reload-plugins`를 입력한 후에만 그렇습니다. 앱 전체 재시작은 필요 없습니다.

**MCP 설정 변경은 다음 `claude` 세션에서 적용됩니다.** Claude Code에는 실시간 MCP 연결 해제가 없습니다——지원되지 않습니다. 그리고 덜 명백하게도, `/clear`와 `/compact`는 MCP 연결을 끊지 않습니다. 동일한 프로세스가 자식 MCP 서버를 계속 살려두므로, 컨텍스트를 비우는 것만으로는 충분하지 않습니다——새로운 `claude` 세션이 필요합니다.

그래서 실제 작업 루프는 이렇습니다:

```bash
/cctoggle off        # flag plugins and stash MCP
/reload-plugins      # plugins leave the current session
# for MCP — exit and start claude again
```

## 설치

필요한 것은 git뿐입니다. 저장소를 클론하고 설치 스크립트를 실행하세요:

```bash
git clone https://github.com/suenot/cctoggle.git ~/projects/claude && \
  ~/projects/claude/install.sh
```

`install.sh`는 슬래시 명령어를 `~/.claude/commands/`에 심볼릭 링크하고, `cctoggle` CLI를 당신의 `PATH`에 올려놓습니다. 그 후 `/cctoggle`은 모든 Claude Code 세션에서 사용할 수 있고, `cctoggle`은 터미널에서 바로 동작합니다.

## 왜 견고한가

`/cctoggle`은 플러그인이 아니라 **사용자 명령어**(`~/.claude/commands/`에 있습니다)입니다. 그래서 모든 플러그인이 비활성화된 후에도 계속 동작합니다. 만약 cctoggle 자체가 플러그인이었다면, `off` 명령어는 제 발등을 찍는 셈이 됩니다——대신, 무엇을 껐든 `on`은 언제나 손닿는 곳에 있습니다.

## 백업과 프라이버시

모든 변경 전에 cctoggle은 두 설정 파일(`~/.claude/settings.json`과 `~/.claude.json`)을 `backups/` 디렉터리에 백업합니다. 무언가 잘못되면 `restore-backup`이 저장된 사본으로 롤백합니다.

상태 파일과 백업은 gitignore되므로, 당신의 비공개 MCP 서버 정의(흔히 키와 토큰을 담고 있습니다)가 커밋으로 새어 나가는 일은 결코 없습니다.

## 한계

미리 알아둘 솔직한 한계가 하나 있습니다. `claude mcp get <name>`이 **"Dynamic config (from command line)"**로 보고하는 MCP 서버——즉 실행 시 명령줄 플래그로 주입되는 것(예: `claude_design`)——은 설정을 통해서는 전혀 토글할 수 없습니다. 이들은 `claude`가 실행되는 방식을 바꾸고 재시작해야만 비활성화할 수 있습니다.

cctoggle은 이런 서버들을 **감지하고 보고**하지만, 토글할 수는 없습니다——이것은 메커니즘 자체의 한계이지 유틸리티의 한계가 아닙니다.

---

요점: cctoggle은 모든 플러그인과 MCP를 짊어진 "무거운" 세션과 당면한 작업을 위한 "가벼운" 세션 사이를 빠르게 오가는 토글이며, 모든 것이 정확히 원래대로 돌아온다는 보장을 함께 제공합니다. 모든 단계 전에 백업을 하고, 비공개 MCP 정의는 git 밖에 머무르며, 명령어 자체는 사용자 공간에 있기 때문에 모든 플러그인의 비활성화에서도 살아남습니다. 저장소——[github.com/suenot/cctoggle](https://github.com/suenot/cctoggle).
