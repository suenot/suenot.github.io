---
title: "오픈 소스 Jev 대안 13개, 각각 어디에 쓸까"
description: "Laya, Kev, SemIf 등 타입이 있는 결정을 만드는 프로젝트와 Codex 서브에이전트 라우팅에 쓸 때의 한계."
pubDate: 2026-09-25
tags: ["jev", "open-source", "model-routing", "codex"]
draft: false
---

## TL;DR

- [Laya](https://github.com/NandhaKishorM/laya)
- [Kev](https://github.com/jaredpalmer/kev)
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

Jev는 상태와 질문을 받아 선택, 점수, 숫자처럼 짧고 형식이 정해진 답을 돌려줍니다. [내 Codex 서브에이전트 라우터](https://github.com/suenot/codex-jev-router)는 그 답을 이용해 다음 에이전트의 모델과 추론 수준을 고릅니다. 아래에는 로컬 서버, 학습 도구, 게임 화면을 처리하는 모델이 함께 있습니다. 이름이 비슷해도 용도는 꽤 다릅니다.

## Laya

[Laya](https://github.com/NandhaKishorM/laya)는 한 번의 추론으로 여러 질문에 답합니다. Python 라이브러리와 Jev 호환 로컬 HTTP 서버를 제공하며, 영어 및 다국어 체크포인트가 있습니다. 한국어로 작업 요약을 쓴다면 다국어 버전을 시험해 볼 만합니다. 배치 처리도 지원하지만 Codex에 쓰기 전에는 실제 작업으로 정확도와 점수 보정을 확인해야 합니다.

## Kev

[Kev](https://github.com/jaredpalmer/kev)는 크기가 다른 공개 모델들과 로컬 `/v1/systemone`을 제공합니다. README는 4B부터 시작하라고 권하며, 더 큰 모델은 메모리 요구량이 높습니다. 로컬 계산 자원이 있다면 원격 결정 엔진의 대안이 될 수 있습니다. 공개된 측정값이 Codex 서브에이전트 선택 성능을 보여 주는 것은 아닙니다.

## PlayJev

[PlayJev](https://github.com/OmniJev/PlayJev)는 브라우저 게임 화면과 가능한 행동 목록에서 다음 행동을 고릅니다. `/v1/systemone`으로 선택 확률을 반환하지만 입력 형식은 시각적 게임 작업에 맞춰져 있습니다. 파일 검색을 맡길 에이전트를 고르려면 다른 모델이나 재학습이 필요합니다. 이미지로도 이런 짧은 결정을 내릴 수 있다는 사례입니다.

## SemIf

[SemIf](https://github.com/TheoLeeCJ/SemIf-OpenJev)는 예전 이름이 OpenJev이며, 공개 언어 모델의 logits로 선택지에 점수를 매깁니다. PyTorch, MLX, llama.cpp를 사용할 수 있고 CLI는 JSONL을 받습니다. Codex와 연결하려면 어댑터가 필요합니다. 전용 결정 모델 없이 로컬 라우팅을 시험할 수 있지만 매 요청마다 모델을 새로 띄우면 지연 시간 이점이 사라질 수 있습니다.

## NanoJev

[NanoJev](https://github.com/TianyuCodings/NanoJev)는 작은 Qwen 기반 모델에 선택, 불리언, 점수용 헤드를 추가합니다. 저장소에는 가중치, 데이터, 학습 코드, 로컬 `/api/evaluate` 서버가 있습니다. 공개 모델은 주로 게임 작업으로 학습됐습니다. Codex 작업 설명에도 잘 적용되는지는 별도로 측정해야 합니다.

## jevlike

[jevlike](https://github.com/vinnylarouge/jevlike)는 연구용 도구에 가깝습니다. 작은 바이트 인코더를 학습시키거나 고정된 Hugging Face 인코더로 임의의 텍스트 선택지에 점수를 매길 수 있습니다. 학습과 예측은 CLI로 실행합니다. Codex에서 정확한 파일 찾기와 어려운 진단을 잘 구분한다는 검증은 없지만, 자신의 작업 데이터로 분류기를 만들고 시험할 수 있습니다.

## simple-jev

[simple-jev](https://github.com/featherless-ai/simple-jev)는 호환되는 공개 언어 모델의 logits에서 답을 얻어 JSON 생성을 생략합니다. Transformers와 PyTorch 서버가 `/v1/classifier`와 `/v1/systemone` 별칭을 제공합니다. 결과는 기반 모델과 선택지 표현에 좌우되며 점수가 보정된 성공 확률이라고 볼 수도 없습니다. 이미 로컬에서 쓰는 모델을 시험하기에는 편리합니다.

## AnyJev

[AnyJev](https://github.com/nokia-applied-research/AnyJev)는 기존 언어 모델에 적용할 세 단계를 제공합니다. 레이블 없이 위치 편향을 고치고, 온도를 보정하거나, 은닉 상태를 이용한 헤드를 학습할 수 있습니다. 뒤의 단계에는 자신의 예제가 필요하고 헤드에는 모델 내부 상태에 접근할 수 있어야 합니다. 일정한 종류의 에이전트 작업에 맞추기 좋지만, 가장 단순한 방식도 여러 번의 추론이 필요할 수 있어 속도를 재야 합니다.

## mini-jev

[mini-jev](https://github.com/r-ms/mini-jev)는 고정된 Qwen의 logits로 선택지에 점수를 매기는 방식과 문법 제약이 있는 JSON 생성을 비교합니다. 운영용 라우터보다는 학습 및 벤치마크 프로젝트에 가깝습니다. 점수는 순위를 보여 주지만 보정된 확률을 보장하지 않습니다. 짧은 답에서 얻는 이점과 단순한 불리언 질문에서 이점이 작아지는 경우를 살펴볼 수 있습니다.

## nico-martin의 open-jev

[nico-martin/open-jev](https://github.com/nico-martin/open-jev)는 Transformers.js와 WebGPU 또는 WASM으로 브라우저에서 결정을 실행합니다. TypeScript API는 `OpenJev.load().decide()`이며 Kev 계열을 포함한 여러 모델을 지원합니다. 웹 앱 안에서 로컬로 판단하기 좋습니다. Codex에는 Node 연결 코드가 필요하고 첫 실행 때는 가중치를 내려받습니다.

## minojev

[minojev](https://github.com/zeredy879/minojev)는 고정된 Qwen3-1.7B와 작은 학습형 결정 헤드를 결합합니다. 로컬 `/score`로 질문을 처리하고 가중치와 데이터를 공개하며 CPU에서도 실행할 수 있습니다. 저자들은 학습 분포 밖의 작업에서 성능이 떨어진 결과도 보여 줍니다. Codex에 쓰려면 실제 위임 작업으로 먼저 평가하는 편이 맞습니다.

## Zefan-Cai의 Open-Jev

[Zefan-Cai/Open-Jev](https://github.com/Zefan-Cai/Open-Jev)는 결정 헤드와 보정을 갖춘 2B, 9B, 27B 모델을 공개합니다. 로컬 `/v1/systemone` 서버, 데이터, 학습 도구도 있습니다. 이름이 비슷한 세 프로젝트 중 완성된 모델 제품군에 가장 가깝지만 실행 비용은 크기에 따라 다릅니다. 공개 벤치마크 결과가 서브에이전트 라우팅에도 맞는지 확인해야 합니다.

## daseinlabs의 open-jev

[daseinlabs/open-jev](https://github.com/daseinlabs/open-jev)는 Gemma 3 4B로 선택지를 평가하며 공통 접두부 재사용과 배치 처리를 활용합니다. 로컬 `/score`와 `/v1/systemone`, Mac용 MLX, 다른 플랫폼용 PyTorch, 작업별 헤드 학습을 제공합니다. Gemma 가중치를 받으려면 Hugging Face의 접근 조건에 동의해야 합니다. Mac에서 로컬 추론을 이미 쓴다면 전체 라우팅 시간을 재볼 만합니다.

## Codex에 쓸 때

익숙한 HTTP 형식의 로컬 서비스를 원하면 Laya, Kev, simple-jev 또는 서버형 Open-Jev부터 살펴보겠습니다. 자신의 작업으로 학습하려면 NanoJev, jevlike, AnyJev, minojev가 더 흥미롭습니다. SemIf와 mini-jev는 짧은 결정의 구현을 살펴보는 데 좋고, PlayJev는 시각적 게임을 다룹니다.

[Codex Jev Router](https://github.com/suenot/codex-jev-router)는 이들 중 여러 프로젝트를 어댑터로 지원합니다. API가 맞는다고 정확도와 절감액까지 같아지는 것은 아닙니다. 엔진을 바꾸기 전에 결정 시간과 비용, 잘못된 라우팅, 이후 에이전트 비용을 함께 측정해야 합니다. 내 작업 묶음에서 13개 모두를 비교한 공개 자료는 아직 없습니다.
