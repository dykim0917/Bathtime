# 레시피 화면 와이어프레임 (현재 구현 기준)

기준: `app/result/recipe/[id].tsx`

## 1) 목적
- 선택한 루틴의 핵심 정보(수온/시간/입욕방법)를 한 화면에서 확인
- 준비물/안전 가이드 확인 후 타이머 시작
- 진입 소스(`history`)에 따라 재시작 확인 플로우 제공

## 2) 화면 구조 (상→하)
1. Hero 영역
- 상단 네비게이션: 뒤로가기 / 중앙 타이틀 / `준비` 칩
- 환경 적합 배지: `환경 적합: 욕조/부분입욕/족욕/샤워`
- Safety 배지(조건부): `safetyWarnings.length > 0`일 때 표시
- 모드 라벨: `케어 · 몸 상태에 맞춘 루틴` 또는 `트립 · 분위기 전환 루틴`

2. 추천 근거 카드
- 제목: `왜 이 루틴인가요`
- 추천 근거 불릿 2줄(엔진 출력)
- 안전 근거 불릿 1줄

3. 핵심 수치 카드 (3분할)
- 수온
- 시간
- 입욕 방법

4. 조명 카드
- 라벨: `💡 조명`
- 값: recommendation.lighting

5. 준비물 트랙 리스트
- 섹션 제목: `준비물`
- 보조 문구: `N가지 재료를 준비해주세요`
- 각 행: 원형 아이콘 / 재료명 / 1줄 설명 / 우측 인덱스(01, 02...)

6. 안전 블록
- 제목: `⚠️ 안전 가이드`
- 안전 문구 불릿 리스트

7. Disclosure
- `PersistentDisclosure` 고정 문구

8. 하단 고정 CTA
- 기본: `시작하기`
- `source=history`: `다시 시작하기`

## 3) 상태 규칙
- 데이터 로딩 중 또는 추천 없음:
  - 중앙 로딩 문구만 표시 (`copy.completion.loading`)
- 배경/CTA 포인트 컬러:
  - `recommendation.colorHex` 사용
- 진입 소스 분기:
  - `source=history`면 시작 전 Alert 확인 필수
  - 그 외 source는 즉시 타이머 이동

## 4) 플로우
1. 진입
- 경로: `/result/recipe/[id]` 또는 `/result/recipe/[id]?source=history`
- `getRecommendationById(id)`로 데이터 로드

2. CTA 탭
- 일반 진입: `/result/timer/[id]`로 즉시 replace
- `source=history` 진입:
  - Alert: `취소` / `진행`
  - `진행` 선택 시 `/result/timer/[id]` replace

3. 상단 뒤로가기
- `router.back()`

## 5) 텍스트 와이어프레임
```text
[Hero Gradient]
  [<]      [레시피 타이틀]      [준비]
  [환경 적합 배지] [안전 우선 배지(조건부)]
  케어/트립 모드 라벨

[추천 근거 카드]
  왜 이 루틴인가요
  • 추천 근거 1
  • 추천 근거 2
  • 안전 근거

[3분할 카드]
  수온 | 시간 | 입욕 방법

[조명 카드]
  💡 조명  [추천 조명 텍스트]

[준비물]
  N가지 재료를 준비해주세요
  (01) 재료명 - 설명
  (02) 재료명 - 설명
  ...

[안전 블록]
  ⚠️ 안전 가이드
  • 문구 1
  • 문구 2

[Disclosure]
  고정 안전 고지

[Bottom Fixed CTA]
  시작하기 / 다시 시작하기(source=history)
```
