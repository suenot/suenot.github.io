---
title: "Codex 하위 에이전트에 쓸 모델을 고르는 방법"
description: "하위 에이전트를 시작하기 전에 Luna와 Sol 중 하나를 선택하는 라우터를 만들었다. Django 작업에서 측정한 비용과 벤치마크의 한계를 기록한다."
pubDate: 2026-09-25
heroImage: "/images/blog/codex-subagent-model-routing-hero.png"
tags: ["codex", "model-routing", "jev", "benchmarks", "ai-cost-optimization"]
draft: false
---

# Codex 하위 에이전트에 쓸 모델을 고르는 방법

하위 에이전트에게 메서드 정의를 찾거나, 파일 몇 개에서 값을 뽑거나, 소스 코드의 한 가지 주장을 확인해 달라고 자주 요청한다. Sol high는 이런 일을 잘하지만 작은 요청마다 사용하면 API 기준 비용이 커진다. 그래서 에이전트를 시작하기 전에 모델을 한 번 고르도록 했다.

[Codex Jev Router](https://github.com/suenot/codex-jev-router)는 짧은 작업 요약을 받아 Codex 모델과 추론 수준을 선택한다. 그다음 하위 에이전트는 평소처럼 Codex 도구를 사용한다. 라우터가 작업 도중 모델을 바꾸거나 에이전트 대신 도구를 고르지는 않는다.

## 시작 전에 하는 일

프로젝트 지침에 따르면 부모 에이전트는 소스 코드, 로그, 비밀 정보가 없는 짧은 요약을 결정 엔진에 보낸다. 기본 엔진은 Jev다. Laya 같은 로컬 엔진이나 지원되는 다른 어댑터로 바꿀 수도 있다. 엔진의 구조화된 응답을 받은 뒤 라우터 규칙이 신뢰도를 확인하고 프로필을 선택한다.

정확한 위치 찾기에는 Luna low를, 파일 몇 개를 다루는 범위가 뚜렷한 작업에는 Luna medium을 사용할 수 있다. 짧지만 Sol의 판단이 필요한 작업은 Sol low로 보낼 수 있다. 결정이 불확실하면 Sol high를 쓴다. Sol ultra는 예외적으로 어려운 작업이나 Sol이 실제로 실패한 경우를 위해 남겨 둔다. 선택한 `model`과 `reasoning_effort`는 `spawn_agent`에 명시적으로 전달한다.

현재는 부모 에이전트가 Codex 지침을 따르는 방식이다. 모든 실행을 강제로 가로채는 기능이라고 주장하지 않는다. Codex CLI 검사에서 해당 호출에 `PreToolUse` 훅이 실행되지 않았다.

## 실제로 확인한 작업의 비용

[별도 벤치마크 저장소](https://github.com/suenot/codex-jev-router-benchmarks)에는 고정된 Django 커밋을 사용했다. 소스 코드를 읽는 작업 세 가지를 각각 깨끗한 Sol high에서 세 번, 라우터가 선택한 프로필에서 세 번 실행했다. 아홉 쌍의 답변은 모두 고정된 소스의 사실과 일치했다. 범위가 제한된 SWE-bench Verified의 Django 수정 작업도 각 조건에서 세 번 실행하고 공식 로컬 회귀 테스트로 확인했다.

| 작업 | 단독 Sol high | 라우터 프로필과 Jev | 비용 차이 | 확인 결과 |
| --- | ---: | ---: | ---: | --- |
| Django 소스 읽기, 9쌍 | $0.214806 | $0.062317 | 71.0% 낮음 | 양쪽 모두 9/9 정답 |
| 범위가 제한된 Django 수정, 3쌍 | $0.555916 | $0.009668 | 98.3% 낮음 | 양쪽 모두 공식 테스트 3/3 통과 |

이 금액은 측정한 입력, 캐시된 입력, 출력 토큰에 [Standard API의 짧은 컨텍스트 요금](https://developers.openai.com/api/docs/pricing)을 적용한 추정치다. 라우터 쪽 총액에는 별도로 계산한 Jev 결정 비용도 포함했다. Codex 구독에서 실제로 청구된 금액은 아니다. [전체 보고서](https://github.com/suenot/codex-jev-router-benchmarks/blob/main/BENCHMARK.md#estimated-api-cost-savings)에 실행 기록, 원시 사용량, 계산식이 있다.

수정 작업에는 중요한 단서가 있다. 첫 Luna medium 실행은 라우터의 임계값을 바꾸기 전 Jev의 선호에 따라 설정한 실험 프로필이었다. 임계값을 바꾼 뒤에는 세 번의 실제 반복 결정이 Luna medium을 선택했다. 공식 로컬 회귀 테스트는 돌렸지만 SWE-bench의 전체 Docker 평가는 하지 않았다.

## 아직 모르는 것

저렴한 프로필이 가능해 보이는 작업을 일부러 골랐다. 따라서 임의의 하위 에이전트 작업에서 평균적으로 얼마를 아낄지는 알 수 없다. 보고서에는 같은 모델을 사용해도 실행마다 사용량이 달라지는 대조군이 있다. 이전 pytest 수정 작업에서는 양쪽 모두 테스트에 실패했고 라우터 쪽 비용이 더 높았다. 이 결과도 그대로 남겼다.

다음에는 작업 구성을 미리 정하고, 재시도와 실패 비용을 답변 품질과 함께 계산해야 한다. 지금 라우터는 범위가 뚜렷한 일을 Luna에 맡길 수 있게 해 준다. [설치 지침](https://github.com/suenot/codex-jev-router#instructions-for-codex)과 [벤치마크 자료](https://github.com/suenot/codex-jev-router-benchmarks)를 공개했으니 각자의 작업으로 확인할 수 있다.
