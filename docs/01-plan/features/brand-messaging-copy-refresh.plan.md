# Brand Messaging Copy Refresh Planning Document

> **Summary**: 새 브랜드 메시징인 "그냥 씻고 끝내던 시간을, 오늘 몸에 맞는 루틴으로 바꿔주는 앱"을 앱 전체 문구에 반영한다.
>
> **Project**: 바스타임
> **Source Docs**: `BRAND_MESSAGING.md`, `DESIGN.md`
> **Date**: 2026-04-30
> **Status**: Draft

---

## 1. Purpose

바스타임의 제품 언어를 기존 "욕조에서 잘 쉬게 해주는 앱"에서 "그냥 씻고 끝내던 시간을, 오늘 몸에 맞는 루틴으로 바꿔주는 앱"으로 전환한다.

이번 작업의 목표는 문장을 예쁘게 바꾸는 것이 아니라, 사용자가 앱을 켜야 하는 이유를 더 넓고 자주 발생하는 순간으로 옮기는 것이다.

- 기존 중심: 욕조, 휴식, 입욕 경험
- 새 중심: 매일 씻는 시간, 오늘 몸 상태, 샤워부터 가능한 루틴
- 사용자 장면: "오늘 좀 피곤하고 찌뿌둥한데, 그때 봤던 것처럼 그렇게 씻어볼까?"

## 2. CEO Review Verdict

**Recommended mode: SELECTIVE EXPANSION**

이 작업은 앱 기능을 크게 늘리는 일이 아니다. 하지만 카피가 제품 포지셔닝을 바꾸는 핵심 레이어이므로, 단순 문자열 교체로 처리하면 실패한다.

권장 방향은 다음과 같다.

1. 앱의 핵심 UX 문구를 먼저 새 포지셔닝으로 정렬한다.
2. 추천 엔진, 루틴 로직, 제품 알고리즘은 건드리지 않는다.
3. 제품/성분/트립 콘텐츠 설명은 2차 작업으로 분리한다.

## 3. Messaging Principles

### 해야 할 말

- 그냥 씻던 시간을 조금 다르게 바꿔보자고 제안한다.
- 샤워만으로도 충분히 시작할 수 있다고 말한다.
- 온도, 시간, 순서만 가볍게 확인하면 된다고 말한다.
- 무리하지 않아도 된다고 말한다.
- 오늘 몸 상태에 맞춘 작은 루틴이라고 말한다.
- 완료를 성취보다 차분한 기록으로 보여준다.

### 하지 말아야 할 말

- 사용자가 씻는 법을 모른다는 식으로 말하지 않는다.
- 목욕이나 입욕만 강조하지 않는다.
- 과도하게 힐링, 치유, 치료처럼 말하지 않는다.
- 자기관리 압박처럼 말하지 않는다.
- 너무 전문가처럼 훈계하지 않는다.
- 몽환적 추상 카피에 기대지 않는다.

## 4. Scope

### P1: 핵심 앱 문구 리라이트

P1은 사용자가 앱을 처음 이해하고 루틴을 시작하고 완료하는 흐름에 집중한다.

| Area | Files | Goal |
| --- | --- | --- |
| Brand source | `BRAND_MESSAGING.md`, `DESIGN.md` | 새 메시징 원칙과 디자인 문서의 언어를 맞춘다. |
| Central copy | `src/content/copy.ts` | 반복 사용되는 UI 문구를 새 톤으로 정렬한다. |
| Brand constants | `src/content/brand.ts` | 스토어명, 태그라인, 포지셔닝을 새 방향으로 맞춘다. |
| Onboarding | `app/onboarding/welcome.tsx`, `app/onboarding/index.tsx`, `app/onboarding/health.tsx`, `app/onboarding/greeting.tsx` | 첫 사용자가 "샤워만으로도 충분한 앱"이라고 이해하게 한다. |
| Home | `app/(tabs)/index.tsx` | 첫 화면에서 "그냥 씻기 아쉬운 날"의 사용 장면을 만든다. |
| Routine detail | `app/result/recipe/[id].tsx` | 온도, 시간, 순서만 확인한 뒤 자연스럽게 시작하는 구조를 강화한다. |
| Timer | `app/result/timer/[id].tsx` | 씻는 동안 화면을 오래 읽지 않아도 되는 안내로 정리한다. |
| Completion | `app/result/completion/[id].tsx` | 성취보다 오늘의 방식과 기록을 차분히 남기는 톤으로 바꾼다. |

### P2: 콘텐츠 데이터 리라이트

P2는 P1이 안정된 뒤 진행한다.

| Area | Files | Reason |
| --- | --- | --- |
| Care intent cards | `src/data/intents.ts` | 카드 제목과 환경별 부제목을 새 메시징에 맞춘다. |
| Trip catalog | `src/data/generatedTripCatalog.ts` | 무드 중심 표현이 과도하게 입욕/감성으로 기울지 않게 정리한다. |
| Product matching | `src/engine/productMatching.ts`, `src/data/catalogResearchSeed.ts` | 쇼핑 유도보다 루틴 보조로 읽히게 한다. |
| Ingredients | `src/data/ingredients.ts` | 치료, 완화, 효과 단정 표현을 낮춘다. |
| Safety copy | `src/engine/safetyChecklist.ts`, `src/engine/preBathChecklist.ts` | 안전 문구는 단호하되 불안감을 키우지 않게 정리한다. |

## 5. Out of Scope

이번 작업에서 하지 않는다.

- 추천 엔진 로직 변경
- 루틴 생성 알고리즘 변경
- 화면 레이아웃 리디자인
- 새 UI 컴포넌트 추가
- 관리자 앱 카피 전면 수정
- 제품 추천 랭킹 변경
- 의료/효능 근거 문서 작성

## 6. Implementation Plan

### Step 0: Source docs sync

**Goal**: 구현자가 어떤 문장을 기준으로 삼아야 하는지 명확히 한다.

Actions:

1. `BRAND_MESSAGING.md`가 존재하는지 확인한다.
2. `DESIGN.md`의 Product Context, Brand Messaging Principle, Voice In UI가 `BRAND_MESSAGING.md`와 충돌하지 않는지 확인한다.
3. 기존 `docs/01-plan/features/copy-style-guide.plan.md`와 새 메시징의 차이를 확인한다.

Verification:

- `BRAND_MESSAGING.md`에 대표 메시지, 서브 메시지, 해야 할 말, 하지 말아야 할 말이 있다.
- `DESIGN.md`가 "욕조 중심 앱"으로 읽히지 않는다.

### Step 1: Copy inventory

**Goal**: 사용자 노출 문구를 빠짐없이 찾는다.

Commands:

```bash
rg -n "[가-힣]" app src --glob "!**/*.test.*" --glob "!**/__tests__/**"
rg -n "치유|치료|완화|효과|힐링|테라피|입욕|욕조|성취|관리" app src
```

Inventory buckets:

- 온보딩
- 홈
- Care/Trip 카드
- 루틴 상세
- 타이머
- 완료
- 기록
- 제품
- 안전 안내
- 법적 고지

Verification:

- 각 문구가 P1, P2, Out of Scope 중 하나로 분류된다.
- 의료/효능 단정 표현 후보가 별도로 표시된다.

### Step 2: Central copy rewrite

**Goal**: `src/content/copy.ts`를 새 톤의 기준점으로 만든다.

Rewrite targets:

| Current direction | New direction |
| --- | --- |
| 오늘의 바스타임 | 그냥 씻기 아쉬운 날에 |
| 오늘 상태 | 오늘 몸 상태 |
| 잘 쉬었습니다 | 오늘 몸에 맞게 마무리했어요 |
| 루틴에 더할 제품 | 루틴에 필요하면 볼 제품 |
| BEST 추천 | 먼저 보기 좋아요 |

Rules:

- "최적화"처럼 전문가가 판단하는 느낌은 줄인다.
- "완화", "치유", "치료"는 가능한 한 "정리", "덜어내기", "가볍게", "무리 없이"로 낮춘다.
- "회복"은 효능 단정이 아니라 상황명이나 루틴 카테고리로만 제한적으로 쓴다. 예: "운동 후 회복 루틴"은 가능하지만 "근육 회복 효과"는 피한다.
- 버튼은 행동 중심으로 짧게 쓴다.
- "간단히 시작"은 카드 CTA에서 유지한다. 카드에서 누르면 레시피 상세나 3초 요약을 거치므로 "바로 시작"은 즉시 타이머가 시작되는 것처럼 오해될 수 있다.
- CTA는 위치별로 구분한다: 카드 CTA는 "간단히 시작", 3초 요약 CTA는 "시작하기", 타이머 인트로는 "화면을 누르면 시작해요".

Verification:

- `src/content/copy.ts`에서 "치유", "치료", "테라피", "프리미엄", "큐레이션"이 나오지 않는다.
- "샤워만으로도 충분" 메시지가 온보딩 또는 홈에서 최소 1회 명확히 보인다.

### Step 3: First-run flow rewrite

**Goal**: 첫 사용자가 앱의 새 포지셔닝을 바로 이해하게 한다.

Files:

- `app/onboarding/welcome.tsx`
- `app/onboarding/index.tsx`
- `app/onboarding/health.tsx`
- `app/onboarding/greeting.tsx`

Recommended copy direction:

| Surface | Proposed copy |
| --- | --- |
| Welcome title | 그냥 씻기 아쉬운 날에 |
| Welcome body | 피곤한 날, 잠 안 오는 밤, 운동 후 뻐근한 몸까지. 오늘 몸에 맞는 샤워 루틴을 가볍게 따라가요. |
| Welcome bullet 1 | 샤워만으로도 가능 |
| Welcome bullet 2 | 온도와 시간만 확인 |
| Welcome bullet 3 | 타이머로 가볍게 진행 |
| Environment title | 지금 가능한 방식만 알려주세요 |
| Environment subtitle | 샤워, 족욕, 욕조 중 가능한 방식에 맞춰 온도와 시간만 정리해요. |
| Health title | 무리하지 않도록 먼저 확인할게요 |
| Greeting title | 이제 오늘 몸에 맞게 씻어볼게요 |

Verification:

- 온보딩 전체에서 사용자가 "씻는 법을 모른다"는 전제가 느껴지지 않는다.
- 샤워가 욕조의 대체재가 아니라 가장 낮은 진입장벽으로 보인다.

### Step 4: Home and recommendation entry rewrite

**Goal**: 홈 화면이 "오늘 어떻게 씻지?"라는 질문보다 "그냥 씻기 아쉬운 날"의 장면을 만든다.

Files:

- `app/(tabs)/index.tsx`
- `src/content/copy.ts`
- `src/data/intents.ts` only if needed for visible card titles in P1

Recommended copy direction:

| Surface | Proposed copy |
| --- | --- |
| Header title | 그냥 씻기 아쉬운 날에 |
| Header subtitle | 피곤한 날, 잠 안 오는 밤, 운동 후 뻐근한 몸까지. 오늘 몸에 맞는 루틴을 골라보세요. |
| Environment section | 가능한 방식 |
| Suggestion section | 오늘 몸에 맞는 루틴 |
| Card CTA | 간단히 시작 |
| History CTA | 기록 보기 |

Verification:

- 홈 첫 화면에서 욕조 앱처럼 읽히지 않는다.
- "몸 상태 + 가능한 방식 + 루틴" 구조가 명확하다.

### Step 5: Routine detail rewrite

**Goal**: 사용자가 필요한 것만 보고 부담 없이 시작하게 한다.

Files:

- `app/result/recipe/[id].tsx`
- `src/content/copy.ts`

Recommended copy direction:

| Surface | Proposed copy |
| --- | --- |
| Summary eyebrow | 3초 요약 |
| Summary title | 필요한 것만 보고 시작해요 |
| Prep title | 온도, 시간, 순서만 확인해요 |
| Detail collapsed | 추천 이유와 준비물은 필요할 때만 볼 수 있어요. |
| Product bridge | 새로 사야 하는 건 아니에요. 필요하면 보기 좋은 제품만 골랐어요. |
| Summary CTA | 시작하기 |

Verification:

- 루틴 상세에서 긴 설명이 시작을 막지 않는다.
- "전문가가 설계한 루틴"처럼 들리지 않는다.

### Step 6: Timer rewrite

**Goal**: 씻는 중에는 사용자가 화면을 읽지 않아도 되게 한다.

Files:

- `app/result/timer/[id].tsx`
- `src/content/copy.ts`

Recommended copy direction:

| Surface | Proposed copy |
| --- | --- |
| Intro lead | 씻는 동안은 타이머만 따라오세요 |
| Intro hint | 화면을 누르면 시작해요 |
| Pause | 잠시 멈춤 |
| Finish | 여기서 마치기 |

Verification:

- 타이머 화면은 문구가 짧고 행동이 분명하다.
- 사용자가 씻는 동안 읽어야 할 정보가 늘어나지 않는다.

### Step 7: Completion rewrite

**Goal**: 완료 화면을 성취가 아니라 차분한 기록으로 만든다.

Files:

- `app/result/completion/[id].tsx`
- `src/content/copy.ts`

Recommended copy direction:

| Surface | Proposed copy |
| --- | --- |
| Summary title | 오늘 몸에 맞게 마무리했어요 |
| Memory title | 오늘의 온도, 시간, 방식 |
| Feedback question | 오늘 루틴은 몸에 어땠나요? |
| Share copy | 오늘 바스타임: {environment}에서 {duration} 루틴을 따라갔어요. |

Verification:

- 완료 화면이 "해냈다"보다 "남겼다"로 읽힌다.
- 루틴을 못 끝내거나 짧게 한 사용자도 부담을 느끼지 않는다.

### Step 8: P2 content rewrite

**Goal**: 데이터 콘텐츠의 의료/입욕 중심 표현을 새 브랜드 톤으로 낮춘다.

P2 rewrite targets:

- `src/data/intents.ts`: 카드 제목, 환경별 subtitle
- `src/data/generatedTripCatalog.ts`: 무드 루틴 표현
- `src/engine/productMatching.ts`: 제품 추천 문구
- `src/data/catalogResearchSeed.ts`: 제품 설명
- `src/data/ingredients.ts`: 성분 설명

High-risk terms:

- 효과적인
- 완화
- 통증 완화
- 치료
- 심신 안정
- 혈액순환 촉진
- 호르몬 밸런스 조절

Safer replacements:

- 쓰기 좋아요
- 부담을 낮춰요
- 가볍게 정리해요
- 편안하게 느껴질 수 있어요
- 향이나 온기를 더해요

Verification:

- 의료 효능처럼 읽히는 표현이 제품/성분 설명에서 제거되거나 완화된다.
- 제품은 "사야 하는 것"이 아니라 "필요하면 볼 것"으로 읽힌다.

## 7. Acceptance Criteria

| Criteria | Verification |
| --- | --- |
| 새 대표 메시지가 앱 첫 진입에서 보인다. | 온보딩 또는 홈 스크린샷 확인 |
| 샤워가 낮은 진입장벽으로 명확히 보인다. | 온보딩, 홈, 루틴 상세 문구 확인 |
| 욕조 전용 앱처럼 읽히지 않는다. | `rg -n "욕조|입욕" app src` 결과를 화면별로 검토 |
| 의료/치료/효능 단정 표현이 줄어든다. | `rg -n "치유|치료|완화|효과|테라피" app src` |
| 자기관리 압박이 없다. | "관리해야", "성공", "달성" 계열 표현 검토 |
| 핵심 화면에서 텍스트가 넘치지 않는다. | 온보딩, 홈, 루틴 상세, 타이머, 완료 스크린샷 |
| 기능 동작이 바뀌지 않는다. | 기존 테스트와 핵심 수동 플로우 확인 |

## 8. QA Plan

### Automated checks

```bash
npm test -- --runInBand
npx tsc --noEmit
```

실제 프로젝트 스크립트가 다르면 `package.json`의 기존 검증 명령을 따른다.

### Manual flows

1. 신규 사용자 온보딩
2. 홈에서 환경을 샤워로 선택
3. 컨디션 루틴 간단히 시작
4. 루틴 상세에서 요약만 보고 시작
5. 타이머 intro, running, paused 상태 확인
6. 완료 화면 기록 확인
7. 기록 탭에서 완료 기록 확인

### Visual QA states

- 온보딩 welcome
- 온보딩 environment selected
- 온보딩 health
- 온보딩 greeting
- 홈 empty
- 홈 with history
- 루틴 상세
- pre-bath gate
- 타이머 intro
- 타이머 running
- 타이머 paused
- 완료 default
- 완료 summary

## 9. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| 문구가 너무 추상적이어서 기능이 흐려짐 | 사용자가 앱이 뭘 하는지 모름 | 대표 메시지 아래에 "샤워·목욕 루틴" 기능 설명을 항상 붙인다. |
| 카피가 너무 넓어져서 브랜드 개성이 사라짐 | 평범한 웰니스 앱처럼 보임 | "그냥 씻기 아쉬운 날에"를 핵심 장면으로 유지한다. |
| 의료/효능 표현이 남음 | 법적/신뢰 리스크 | P2에서 성분/제품 설명을 별도 검수한다. |
| 현재 admin/content 변경과 충돌 | PR 리뷰가 어려워짐 | 카피 리라이트는 별도 브랜치 또는 별도 커밋으로 진행한다. |
| 하드코딩 문구가 남음 | 톤 일관성이 깨짐 | P1에서 핵심 하드코딩 문구를 `copy.ts`로 가능한 만큼 모은다. |

## 10. Recommended Branching

현재 브랜치에 admin/content 변경이 많이 열려 있다. 카피 리라이트는 가능하면 별도 브랜치로 진행한다.

Recommended branch:

```bash
git switch -c codex/brand-messaging-copy-refresh
```

단, 현재 변경을 보존해야 하므로 브랜치 전환 전 `git status`를 확인하고, 사용자 변경을 절대 되돌리지 않는다.

## 11. Suggested Implementation Order

1. `BRAND_MESSAGING.md`와 `DESIGN.md` 정렬
2. `src/content/brand.ts` 업데이트
3. `src/content/copy.ts` 업데이트
4. 온보딩 화면 하드코딩 문구 정리
5. 홈 화면 하드코딩 문구 정리
6. 루틴 상세/타이머/완료 문구 정리
7. P1 QA
8. P2 콘텐츠 데이터 리라이트
9. P2 QA

## 12. Definition of Done

- 앱 첫 화면 또는 온보딩에서 새 대표 메시지가 명확히 보인다.
- 사용자가 "샤워만으로도 시작할 수 있다"고 이해한다.
- 루틴 상세은 온도, 시간, 순서를 먼저 보여준다.
- 타이머는 씻는 동안 따라가기만 하면 되는 화면으로 읽힌다.
- 완료 화면은 성취보다 기록으로 읽힌다.
- 금지 표현 후보가 검토되었다.
- 핵심 플로우가 기존처럼 동작한다.

## 13. NOT in Scope

- 추천 알고리즘 고도화
- 루틴 안전 정책 변경
- 제품 구매 UX 변경
- 트립 카드 이미지 재생성
- 관리자 앱 IA 변경
- 새 화면 추가

## 14. Dream State Delta

```
CURRENT STATE
  오늘 상태와 환경에 맞춰 목욕·샤워 루틴을 안내하는 앱.
  아직 일부 화면은 욕조, 휴식, 케어 중심으로 읽힌다.

THIS PLAN
  앱의 핵심 문구를 "그냥 씻기 아쉬운 날"과 "오늘 몸에 맞는 루틴"으로 정렬한다.
  샤워를 가장 낮은 진입장벽으로 보여준다.

12-MONTH IDEAL
  사용자가 피곤하거나 몸이 무거운 날 자연스럽게 바스타임을 떠올린다.
  "오늘은 그냥 씻지 말고 바스타임처럼 해볼까?"가 제품의 반복 사용 장면이 된다.
```

## 15. Open Decisions

1. P1에서 `src/data/intents.ts` 카드 제목까지 포함할지, 아니면 `copy.ts`와 화면 하드코딩 문구만 먼저 바꿀지 결정해야 한다.
2. `DESIGN.md`를 이번 PR에 함께 갱신할지, 이미 별도 문서로 관리할지 결정해야 한다.
3. 성분/제품 설명의 의료 표현 정리는 P1에 포함하지 않는 것을 권장하지만, 출시 전에는 반드시 P2로 처리해야 한다.
