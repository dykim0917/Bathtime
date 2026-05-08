# Care Intent Cards 4종 추가 Planning Document

> **Summary**: Care 탭의 disabled placeholder로 표시되는 4종 카드(감기, 생리통, 스트레스, 기분전환)를 실제 동작하는 IntentCard로 구현하여 Care 탭 콘텐츠 커버리지를 4/8에서 8/8(100%)로 완성한다.
>
> **Project**: ë°°ì°íì
> **Version**: v3.12.1 (예정)
> **Author**: Plan Plus (Brainstorming-Enhanced)
> **Date**: 2026-03-03
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

Care 탭에는 현재 4종 IntentCard(muscle_relief, sleep_ready, hangover_relief, edema_relief)만 동작하고, 나머지 4종(cold_relief, menstrual_relief, stress_relief, mood_lift)은 `allowed_environments: []`로 항상 disabled 상태인 placeholder로 표시된다.

이 4종을 실제 동작하는 IntentCard로 승격시켜:
- Care 탭의 콘텐츠 커버리지를 50% → 100%로 완성
- 기존 CareEngine 재사용으로 추가 알고리즘 개발 없이 빠른 출시
- 사용자 케어 니즈(감기·생리통·스트레스·기분저하)에 대한 직접 응답 제공

### 1.2 Background

- GNB 재설계(v3.12.0) 완료: Care 탭이 독립 진입점으로 노출됨
- CareEngine(`generateCareRecommendation`)은 DailyTag 배열을 입력으로 받아 루틴을 생성
- 기존 DailyTag 타입(PhysicalTag + MentalTag)에 `cold`, `menstrual_pain`, `stress`, `depression`이 이미 정의됨 → types.ts 수정 불필요
- 현재 care.tsx의 `mapIntentToTags`는 4종 intent_id에 대해 fallback 처리만 함

---

## 2. User Intent Discovery (Brainstorming Phase 1)

### 2.1 Core Problem
**Care 탭 콘텐츠 커버리지 확대** — 8개 슬롯 중 4개가 비어 있어 사용자가 필요로 하는 케어 루틴(감기, 생리통, 스트레스, 기분전환)을 찾지 못함

### 2.2 Target Users
- 기존 Care 탭 사용자 (End User)
- 케어 목적 입욕/샤워 루틴을 찾는 헬스-컨셔스 사용자

### 2.3 Success Criteria
- Care 탭에서 8종 IntentCard 모두 활성화되어 선택 가능
- 각 카드 탭 시 SubProtocolPicker → 루틴 생성 → 결과 화면 정상 동작
- TypeScript 컴파일 에러 0개 유지

---

## 3. Alternatives Explored (Brainstorming Phase 2)

### Approach A: CareEngine 확장 (DailyTag 매핑) — **선택**
기존 `generateCareRecommendation(profile, dailyTags, environment)` 그대로 재사용.
4종 intent_id에 대해 적절한 DailyTag를 매핑하여 데이터 레이어만 추가.

- **장점**: 알고리즘 변경 없음, 안전성 보장, 빠른 구현 (추정 2-3h)
- **단점**: 각 intent별 최적화된 루틴 생성 로직 없음 (CareEngine이 내부적으로 태그 기반 선택)
- **적합한 경우**: P1 빠른 출시, 기존 로직 검증 완료된 상태

### Approach B: 전용 intent 핸들러 추가
`src/engine/care/` 디렉토리에 intent별 전용 로직 추가.

- **장점**: 더 정밀한 루틴 생성 가능
- **단점**: 개발 범위 대폭 증가, 테스트 케이스 추가 필요, P1 범위 초과
- **결정**: P2 이후로 연기

### Approach C: Mock 루틴 데이터 정적 주입
IntentCard마다 하드코딩된 BathRecommendation 반환.

- **장점**: 구현 가장 빠름
- **단점**: 안전성 체크 우회, 프로필 기반 개인화 없음, 기술 부채
- **결정**: 기각

---

## 4. YAGNI Review (Brainstorming Phase 3)

### P1에 포함
| 항목 | 이유 |
|------|------|
| IntentCard 데이터 4종 (intents.ts) | 핵심 기능, 없으면 카드 표시 불가 |
| SubProtocol 옵션 정의 4종 (intents.ts) | 모달 동작 필수 |
| colors.ts 토큰 4종 (색상 + 이모지) | 카드 시각화 필수 |
| care.tsx placeholder 제거 + mapIntentToTags 확장 | 화면 연결 필수 |

### P1에서 제외 (Out of Scope)
| 항목 | 이유 |
|------|------|
| Figma 신규 카드 디자인 작업 | P2에서 별도 진행 |
| 새 DailyTag 추가 | 기존 타입으로 충분 (cold, menstrual_pain, stress, depression 이미 존재) |
| recommend.ts 수정 | CareEngine 재사용으로 불필요 |
| CategoryCard 컴포넌트 수정 | 기존 컴포넌트로 충분 |
| 단위 테스트 추가 | 기존 CareEngine 테스트로 커버됨 |

---

## 5. Architecture Design (Brainstorming Phase 4)

### 5.1 변경 파일 목록

| 파일 | 변경 종류 | 내용 |
|------|-----------|------|
| `src/data/intents.ts` | 수정 | CARE_INTENT_CARDS에 4종 추가, CARE_SUBPROTOCOL_OPTIONS에 4종 추가 |
| `src/data/colors.ts` | 수정 | CATEGORY_CARD_COLORS, CATEGORY_CARD_EMOJI에 4종 추가 |
| `app/(tabs)/care.tsx` | 수정 | CARE_PLACEHOLDER_CARDS 제거, ALL_CARE_CARDS 단순화, mapIntentToTags 확장 |

### 5.2 변경 없는 파일

| 파일 | 이유 |
|------|------|
| `src/engine/types.ts` | DailyTag에 필요한 모든 태그 이미 정의됨 |
| `src/engine/recommend.ts` | `generateCareRecommendation` 그대로 재사용 |
| `src/components/CategoryCard.tsx` | 기존 컴포넌트로 충분 |

### 5.3 DailyTag 매핑

```
cold_relief      → ['cold']           (PhysicalTag, 기존)
menstrual_relief → ['menstrual_pain'] (PhysicalTag, 기존)
stress_relief    → ['stress']         (MentalTag, 기존)
mood_lift        → ['depression']     (MentalTag, 기존)
```

### 5.4 데이터 흐름

```
사용자 탭 → care.tsx: handleOpenSubProtocol(intent)
  → SubProtocolPickerModal
    → handleSelectSubProtocol(option)
      → mapIntentToTags(intent.intent_id)  ← 4종 매핑 추가
      → generateCareRecommendation(profile, tags, env)
      → applySubProtocolOverrides(rec, option, env, intent_id)
      → saveRecommendation(rec)
      → router.push('/result/recipe/[id]?source=care')
```

### 5.5 환경 설정

신규 4종 카드의 `allowed_environments` 기본값:
- `cold_relief`: `['bathtub', 'partial_bath']` — 전신·부분 입욕 권장, 샤워 제한
- `menstrual_relief`: `['bathtub', 'partial_bath']` — 따뜻한 입욕 권장
- `stress_relief`: `['bathtub', 'shower', 'partial_bath']` — 모든 환경 허용
- `mood_lift`: `['bathtub', 'shower', 'partial_bath']` — 모든 환경 허용

---

## 6. Implementation Plan

### 6.1 P0 구현 순서

**Step 1: colors.ts 토큰 추가**
```typescript
// CATEGORY_CARD_COLORS
cold_relief:       '#B8D9E8',  // cool mint-blue — 감기, 해열
menstrual_relief:  '#F0C5CC',  // warm rose — 생리통, 온기
stress_relief:     '#C5D9B8',  // calm sage green — 스트레스, 이완
mood_lift:         '#F5E5A3',  // warm yellow — 기분, 활력

// CATEGORY_CARD_EMOJI
cold_relief:       '🤧'
menstrual_relief:  '🌸'
stress_relief:     '🍃'
mood_lift:         '☀️'
```

**Step 2: intents.ts IntentCard 4종 추가**
- CARE_INTENT_CARDS 배열에 card_position 5~8로 추가
- copy_subtitle_by_environment: 각 환경별 부제목 정의

**Step 3: intents.ts SubProtocol 옵션 추가**
- CARE_SUBPROTOCOL_OPTIONS에 4개 intent_id 키 추가
- 각 2-3개 옵션 (온도 조절, 허브/솔트 추가 등)

**Step 4: care.tsx 업데이트**
- CARE_PLACEHOLDER_CARDS 상수 제거
- `ALL_CARE_CARDS = CARE_INTENT_CARDS` (단순화)
- `mapIntentToTags` switch case에 4종 추가

### 6.2 카드 데이터 정의

| intent_id | copy_title | mapped_mode | allowed_environments |
|-----------|-----------|-------------|---------------------|
| cold_relief | 감기 기운이 느껴질 때 | recovery | bathtub, partial_bath |
| menstrual_relief | 생리통이 있을 때 | recovery | bathtub, partial_bath |
| stress_relief | 스트레스를 풀고 싶을 때 | reset | bathtub, shower, partial_bath |
| mood_lift | 기분 전환이 필요할 때 | sleep | bathtub, shower, partial_bath |

---

## 7. Acceptance Criteria

| 기준 | 검증 방법 |
|------|-----------|
| Care 탭 8종 카드 모두 표시 | 시각적 확인 |
| 4종 카드 탭 → SubProtocol 모달 표시 | 수동 테스트 |
| 서브프로토콜 선택 → 루틴 생성 → 결과 화면 이동 | E2E 플로우 확인 |
| 환경 전환(욕조/부분/샤워) 시 disabled 상태 정확 | 환경별 확인 |
| TypeScript 컴파일 에러 0개 | `npx tsc --noEmit` |
| 기존 4종 카드 동작 유지 | 회귀 확인 |

---

## 8. Out of Scope (미래 고려사항)

- **P2**: Figma 디자인 기반 신규 카드 시각 스타일 적용
- **P2**: intent별 전용 CareEngine 로직 최적화
- **P2**: cold_relief/menstrual_relief의 온도 안전 경고 강화

---

## Version History

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| v0.1 | 2026-03-03 | Plan Plus 브레인스토밍 기반 초안 작성 |
