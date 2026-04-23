# GNB 재설계 (3탭 → 5탭) Planning Document

> **Summary**: 기존 Home/History/Settings 3탭 GNB를 Home/Care/Trip/Product/My 5탭 구조로 확장하여 앱의 핵심 엔진(CareEngine, TripEngine, ProductHub)을 독립 탭으로 노출하고 사용자 진입 경로를 다각화한다.
>
> **Project**: ë°°ì°íì
> **Version**: v3.11.0 → v3.12.0 (예정)
> **Author**: Product Manager
> **Date**: 2026-02-27
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

현재 배쓰타임은 Home → Care/Trip 선택 → 루틴 실행이라는 단일 퍼널로만 동작한다. CareEngine, TripEngine, ProductHub 등 핵심 엔진들이 GNB에 직접 노출되지 않아 탐색 가능성(Discoverability)이 낮다. 5탭 GNB로 전환함으로써:

- 각 엔진에 대한 직접 진입점을 사용자에게 제공한다
- 기존 History + Settings를 My 탭으로 통합해 화면 수를 줄인다
- Product 탭 독립으로 ProductHub 커머스 KPI(커머스 전환율) 검증 기반을 마련한다
- Trip 탭 독립으로 Trip 세션 완료율/재방문율 A/B 실험 설계가 가능해진다

### 1.2 Background

PRD v3.11.0 기준 구현 현황:
- 홈 탭: Care IntentCard 8종 중 4종 구현 + Trip 테마 카드 + 최근 루틴
- 기록 탭: 2열 그리드 + 필터 pill + 인사이트 배너 (Phase 4 완료)
- 설정 탭: 프로필 확인/수정 (리디자인 미적용)
- ProductMatchingModal 컴포넌트 존재 (화면 미완)
- ProductHub 화면 미구현

PRD Section 4 IA에서 Care/Trip/ProductHub를 독립 레이어로 선언했으나, 현재 GNB에는 반영되어 있지 않다. 탭 추가로 IA와 GNB를 정렬한다.

### 1.3 Related Documents

- PRD: `docs/PRD_CURRENT.md` (v3.11.0) — Section 4(IA), 25(Trip Engine), 27(ProductHub)
- 와이어프레임: `docs/WIREFRAME_V3_11_0.md` — W01~W10 현재 화면 명세
- 이전 와이어프레임(목표 스펙): `docs/WIREFRAME_V3_10_2.md`
- 디자인 시스템: `/CLAUDE.md`

---

## 2. Scope

### 2.1 In Scope

- [ ] `app/(tabs)/_layout.tsx` 수정: 3탭 → 5탭 (Home/Care/Trip/Product/My)
- [ ] `app/(tabs)/care.tsx` 신규 생성: CareEngine 전용 탭
- [ ] `app/(tabs)/trip.tsx` 신규 생성: TripEngine 전용 탭
- [ ] `app/(tabs)/product.tsx` 신규 생성: ProductHub 탭
- [ ] `app/(tabs)/my.tsx` 신규 생성: History + Settings 통합 탭
- [ ] 기존 `app/(tabs)/history.tsx` → My 탭 내 서브섹션으로 편입
- [ ] 기존 `app/(tabs)/settings.tsx` → My 탭 내 서브섹션으로 편입
- [ ] Home 탭(`app/(tabs)/index.tsx`) 슬림화: Care/Trip 카드 목록 제거, 오케스트레이션 요약만 유지
- [ ] Care 탭 미구현 IntentCard 4종(cold_relief, menstrual_relief, stress_relief, mood_lift) 추가
- [ ] Product 탭 기본 ProductHub 화면 구현 (컬렉션 목록 수준)
- [ ] My 탭 내 기록/설정 탭 전환 UI 구현

### 2.2 Out of Scope

- Trip 테마 콘텐츠 신규 추가 (기존 테마 데이터 그대로 사용)
- Product 탭 실제 제품 데이터 연동 (Mock 데이터 허용)
- ProductHub 상세 페이지 완전 구현 (ProductMatchingModal 활용)
- 주간 리포트 / 리텐션 루프 구현 (PRD §10, 별도 백로그)
- Sommelier AI 채팅 (PRD §20, 별도 백로그)
- 새 아이콘 라이브러리 설치 (FontAwesome 범위 내 아이콘 사용)
- 다크모드 지원

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | 요구사항 | 우선순위 | MoSCoW | 상태 |
|----|---------|----------|--------|------|
| FR-01 | 5탭 GNB(Home/Care/Trip/Product/My) 노출 | P0 | Must | Pending |
| FR-02 | Home 탭: 오늘의 Primary 추천 1개 + Quick Action 버튼 (Care/Trip 진입) | P0 | Must | Pending |
| FR-03 | Care 탭: Care IntentCard 8종 전체 표시 + 환경 선택 pill | P0 | Must | Pending |
| FR-04 | Care 탭 → SubProtocol 선택 → 레시피 상세(`/result/recipe/[id]`) 기존 플로우 유지 | P0 | Must | Pending |
| FR-05 | Trip 탭: 트립 테마 카드 그리드 표시 + 테마 선택 → 레시피 상세 진입 | P0 | Must | Pending |
| FR-06 | Product 탭: ProductHub 컬렉션 목록 (Mode-based, Theme-based, Starter Pack) | P1 | Should | Pending |
| FR-07 | Product 탭 → 제품 상세 → ProductMatchingModal 연동 | P1 | Should | Pending |
| FR-08 | My 탭: 기록(History) 섹션 + 설정(Settings) 섹션 탭 전환 UI | P0 | Must | Pending |
| FR-09 | My 탭 > 기록: 기존 history.tsx 2열 그리드 + 필터 pill + 인사이트 배너 유지 | P0 | Must | Pending |
| FR-10 | My 탭 > 설정: 기존 settings.tsx 프로필 편집 + 앱 정보 유지 | P0 | Must | Pending |
| FR-11 | Care 탭 미구현 4종(cold_relief, menstrual_relief, stress_relief, mood_lift) IntentCard 추가 | P1 | Should | Pending |
| FR-12 | CLAUDE.md 탭 3개 고정 제약("Do not create new tab routes") 해제 승인 | P0 | Must | Pending |
| FR-13 | 기존 `/result/*` 플로우(recipe/timer/completion) 어느 탭에서 진입해도 동일하게 동작 | P0 | Must | Pending |
| FR-14 | Product 탭 > 위시리스트(찜 목록) UI | P2 | Could | Pending |
| FR-15 | My 탭 > 주간 인사이트 배너 (월간 요약, 자주 선택 테마) | P2 | Could | Pending |

### 3.2 Non-Functional Requirements

| 카테고리 | 기준 | 측정 방법 |
|---------|------|---------|
| 성능 | 탭 전환 시 렌더 시간 < 300ms | Expo DevTools Profiler |
| 타입 안전성 | TypeScript 컴파일 에러 0 (`npx tsc --noEmit`) | CI 검증 |
| 테스트 회귀 | 기존 49개 알고리즘 단위 테스트 전부 통과 | `npx jest` |
| 디자인 일관성 | 신규 탭 화면이 Silent Moon 디자인 시스템 토큰 100% 준수 | 코드 리뷰 |
| 안전성 | PersistentDisclosure 신규 화면에서도 노출 유지 | 수동 QA |

---

## 4. 현재 vs 변경 후 GNB 구조 비교

### 현재 구조 (v3.11.0)

| 탭 | 경로 | 아이콘 | 주요 콘텐츠 |
|----|------|--------|------------|
| 홈 | `/(tabs)/index` | tint (물방울) | Care 8종 카드 + Trip 테마 카드 + 최근 루틴 |
| 기록 | `/(tabs)/history` | calendar | 2열 기록 그리드 + 필터 pill + 인사이트 |
| 설정 | `/(tabs)/settings` | cog | 프로필 편집 + 앱 정보 |

### 변경 후 구조 (v3.12.0 목표)

| 탭 | 경로 | 아이콘(FontAwesome) | 주요 콘텐츠 | 유형 |
|----|------|---------------------|------------|------|
| Home | `/(tabs)/index` | home | 오늘 Primary 추천 + Quick Actions | 기존 슬림화 |
| Care | `/(tabs)/care` | heartbeat | IntentCard 8종 전체 + 환경 선택 | 신규 |
| Trip | `/(tabs)/trip` | map-o | 트립 테마 카드 그리드 | 신규 |
| Product | `/(tabs)/product` | shopping-bag | ProductHub 컬렉션 목록 | 신규 |
| My | `/(tabs)/my` | user | 기록 + 설정 (내부 탭 전환) | 기존 통합 |

---

## 5. 탭별 페이지 목록

### 5.1 Home 탭 (`app/(tabs)/index.tsx`)

**변경 방향**: 슬림화 — 카드 목록 제거, 오케스트레이션 요약 레이어로 전환

| 섹션 | 내용 | 변경 |
|------|------|------|
| Today Signal | 시간대별 인사 + 상태 한 줄 요약 | 유지 |
| Primary Suggestion | EngineSelector 출력 기반 추천 1개 | 강화 |
| Quick Actions | "케어 루틴 시작" / "트립 루틴 탐색" 버튼 → Care/Trip 탭 이동 | 신규 |
| Recent Routines | 최근 2개 수평 스크롤 → My 탭 기록으로 더보기 | 축소 |
| 환경 pill | 욕조/샤워/족욕 선택 | 유지 |

### 5.2 Care 탭 (`app/(tabs)/care.tsx`) — 신규

**변경 방향**: 기존 Home 탭의 Care 섹션 분리 + 미구현 4종 완성

| 섹션 | 내용 | 유형 |
|------|------|------|
| 헤더 | "어떤 케어가 필요하세요?" + 날짜 | 신규 |
| 환경 선택 pill | 욕조 / 샤워 / 족욕(부분입욕) | 이동 (Home → Care) |
| IntentCard 그리드 | Care 8종 카드 (2열, position 1~8 순) | 이동 + 4종 추가 |
| SubProtocolPickerModal | 세부 프로토콜 선택 (기존 컴포넌트 재사용) | 유지 |
| PreBathGateModal | 레시피 진입 전 공통 프리플라이트 게이트 | 현재 구현 기준으로 대체 |

**Care 탭 → 루틴 실행 플로우** (기존과 동일):
```
Care 탭 → SubProtocolPickerModal → /result/recipe/[id] → /result/timer/[id] → /result/completion/[id]
```

**신규 구현 필요 IntentCard 4종**:
| intent_id | 카드 제목 | mapped_mode | 구현 우선순위 |
|-----------|----------|-------------|--------------|
| cold_relief | 감기 기운이 느껴질 때 | recovery | P1 |
| menstrual_relief | 생리통을 달래고 싶어요 | recovery | P1 |
| stress_relief | 긴장과 스트레스를 풀고 싶어요 | reset | P1 |
| mood_lift | 기분이 가라앉았어요 | sleep | P1 |

### 5.3 Trip 탭 (`app/(tabs)/trip.tsx`) — 신규

**변경 방향**: 기존 Home 탭의 Trip 섹션 분리 + TripEngine 독립 탭 강화

| 섹션 | 내용 | 유형 |
|------|------|------|
| 헤더 | "어디로 떠나볼까요?" + narrative 한 줄 | 신규 |
| 환경 선택 pill | 욕조(Trip Deep) / 샤워(Trip Lite) | 이동 (Home → Trip) |
| 테마 카드 그리드 | 기존 Trip 테마 (교토의 숲, 빗속 캠핑 등) 2열 | 이동 (Home → Trip) |
| Narrative Recall Card | 최근 Trip 기억 카드 (TripMemoryContract 기반) | 신규 |
| Trip Lite/Deep 배지 | 환경에 따라 테마 카드에 Lite/Deep 뱃지 자동 표시 | 신규 |

**Trip 탭 → 루틴 실행 플로우**:
```
Trip 탭 → 테마 카드 탭 → /result/recipe/[id] → /result/timer/[id] → /result/completion/[id]
```

### 5.4 Product 탭 (`app/(tabs)/product.tsx`) — 신규

**변경 방향**: ProductHub를 탐색 가능한 독립 탭으로 노출 (PRD §27 구현 시작점)

| 섹션 | 내용 | 구현 단계 |
|------|------|---------|
| 헤더 | "오늘의 루틴에 맞는 제품" | P1 |
| Mode-based Collection | Sleep / Reset / Recovery 모드별 추천 컬렉션 | P1 |
| Theme-based Collection | Trip 테마 연계 제품 컬렉션 | P2 |
| Starter Pack | 입문자용 패키지 추천 | P2 |
| Seasonal Pack | 계절/시기 기반 패키지 | P2 |
| 제품 카드 | 제품명 + Sommelier Pick 배지 + 슬롯 역할 (기전/감성/가성비) | P1 |
| 제품 상세 진입 | ProductMatchingModal 재활용 또는 신규 상세 화면 | P1 |
| 위시리스트 | 찜 목록 저장 (AsyncStorage) | P2 |

**주의**: PRD §27.3 원칙 — "ProductHub를 전면 홈 대체 진입점으로 승격하지 않음" 유지. Product 탭은 supporting commerce layer로 포지셔닝.

### 5.5 My 탭 (`app/(tabs)/my.tsx`) — 신규 (기존 통합)

**변경 방향**: History + Settings를 단일 탭으로 통합, 내부 pill 탭 전환

| 서브탭 | 콘텐츠 | 기존 파일 |
|--------|--------|---------|
| 기록 | 2열 그리드 + 필터 pill(전체/케어/트립) + 인사이트 배너 | `app/(tabs)/history.tsx` 내용 이식 |
| 설정 | 프로필 편집(환경/건강상태) + 앱 정보 + 프로필 재설정 | `app/(tabs)/settings.tsx` 내용 이식 |

**My 탭 레이아웃 구조**:
```
My 탭
├── 상단 pill 전환: [기록] [설정]
├── 기록 섹션 (기존 history.tsx 동등)
│   ├── 인사이트 배너
│   ├── 필터 pill (전체/케어/트립)
│   └── 2열 FlatList 그리드
└── 설정 섹션 (기존 settings.tsx 동등)
    ├── 프로필 카드 (환경/건강상태)
    ├── 프로필 재설정
    └── 앱 정보
```

---

## 6. 신규 스크린 목록 (파일 경로 포함)

| 파일 경로 | 화면명 | 유형 | 우선순위 |
|-----------|--------|------|---------|
| `app/(tabs)/care.tsx` | Care 탭 메인 | 신규 생성 | P0 |
| `app/(tabs)/trip.tsx` | Trip 탭 메인 | 신규 생성 | P0 |
| `app/(tabs)/product.tsx` | Product 탭 메인 (ProductHub) | 신규 생성 | P1 |
| `app/(tabs)/my.tsx` | My 탭 (History + Settings 통합) | 신규 생성 | P0 |

---

## 7. 기존 스크린 이동/재배치 목록

| 기존 파일 | 변경 방향 | 상세 |
|----------|-----------|------|
| `app/(tabs)/index.tsx` | 수정 (슬림화) | Care/Trip 카드 그리드 제거, Primary 추천 + Quick Actions 위주로 재작성 |
| `app/(tabs)/history.tsx` | 통합 후 삭제 또는 My 탭 내부로 이식 | My 탭(`my.tsx`)의 기록 섹션으로 코드 이식. 원본 파일은 `_(deprecated)history.tsx`로 보관 후 삭제 |
| `app/(tabs)/settings.tsx` | 통합 후 삭제 또는 My 탭 내부로 이식 | My 탭(`my.tsx`)의 설정 섹션으로 코드 이식. 원본 파일은 `_(deprecated)settings.tsx`로 보관 후 삭제 |
| `app/(tabs)/_layout.tsx` | 수정 | 탭 3개 → 5개로 확장 (Screen 추가, 아이콘/라벨 업데이트) |
| `src/components/CategoryCard.tsx` | 재사용 | Care 탭에서 동일하게 사용 |
| `src/components/SubProtocolPickerModal.tsx` | 재사용 | Care 탭에서 호출 |
| `src/components/PreBathGateModal.tsx` | 레시피 화면 공통 사용 | 모든 루틴 시작 전 호출 |
| `src/components/ProductMatchingModal.tsx` | Product 탭에서 활용 | 현재 홈 플로우 연결 없음 → Product 탭에서 진입점 연결 |

---

## 8. 구현 우선순위 (P0/P1/P2)

### P0 — 즉시 구현 (GNB 전환 최소 기능)

| 작업 | 파일 | 예상 공수 |
|------|------|---------|
| CLAUDE.md 탭 제약 문구 업데이트 | `CLAUDE.md` | 0.5h |
| `_layout.tsx` 5탭 전환 | `app/(tabs)/_layout.tsx` | 1h |
| Care 탭 신규 (기존 Home Care 섹션 이식) | `app/(tabs)/care.tsx` | 3h |
| Trip 탭 신규 (기존 Home Trip 섹션 이식) | `app/(tabs)/trip.tsx` | 2h |
| My 탭 신규 (History + Settings 통합) | `app/(tabs)/my.tsx` | 3h |
| Home 탭 슬림화 | `app/(tabs)/index.tsx` | 2h |
| 기존 history.tsx / settings.tsx 정리 | 두 파일 | 0.5h |
| TypeScript 컴파일 + 회귀 테스트 | — | 0.5h |
| **P0 소계** | | **12.5h** |

### P1 — 다음 릴리즈 (콘텐츠 보완)

| 작업 | 파일 | 예상 공수 |
|------|------|---------|
| Care 미구현 4종 IntentCard 알고리즘 연결 | `src/engine/recommend.ts` 등 | 4h |
| Care 미구현 4종 UI 카드 추가 | `src/data/` 및 Care 탭 | 2h |
| Product 탭 기본 컬렉션 UI | `app/(tabs)/product.tsx` | 4h |
| ProductMatchingModal → Product 탭 진입점 연결 | `app/(tabs)/product.tsx` | 2h |
| Trip Narrative Recall Card 컴포넌트 | `src/components/` | 3h |
| **P1 소계** | | **15h** |

### P2 — 백로그 (향후 고려)

| 작업 | 파일 | 비고 |
|------|------|------|
| Product 탭 위시리스트 | `src/storage/wishlist.ts` + Product 탭 | AsyncStorage |
| My 탭 주간 인사이트 배너 | `my.tsx` | PRD §10 리텐션 루프 일부 |
| Trip Theme-based / Seasonal Pack | Product 탭 | 콘텐츠 의존 |
| Product 탭 실 데이터 연동 | `src/data/products.ts` | 커머스 KPI 검증 전제 |

---

## 9. Success Criteria

### 9.1 Definition of Done

- [ ] 5탭 GNB 정상 렌더링 (Home/Care/Trip/Product/My)
- [ ] Home → Care/Trip/Product/My 탭 이동 정상 동작
- [ ] Care 탭 → 루틴 실행 플로우 (`/result/recipe → timer → completion`) 회귀 통과
- [ ] Trip 탭 → 루틴 실행 플로우 회귀 통과
- [ ] My 탭 기록 섹션 ↔ 설정 섹션 전환 정상 동작
- [ ] `npx tsc --noEmit` 에러 0
- [ ] `npx jest` 49개 테스트 전부 통과
- [ ] PersistentDisclosure 신규 화면에서 정상 노출
- [ ] 레시피 PreBathGateModal 정상 노출 및 체크 완료 후 timer 진입

### 9.2 Quality Criteria

- [ ] 탭 아이콘 @expo/vector-icons FontAwesome 범위 내 사용
- [ ] 신규 화면 모든 색상/타이포그래피 디자인 토큰(`src/data/colors.ts`) 사용
- [ ] 하드코딩 색상/폰트 크기 0
- [ ] TypeScript any 타입 사용 0
- [ ] 새 스타일링 라이브러리 미설치

---

## 10. Risks & Mitigation

| 리스크 | 영향도 | 발생 가능성 | 대응 방안 |
|--------|--------|------------|---------|
| CLAUDE.md "탭 3개 고정" 규칙 위반 | High | High | 플랜 문서로 변경 승인 후 CLAUDE.md 해당 라인 업데이트 |
| Home 탭 슬림화 시 기존 UX 회귀 | High | Medium | Care/Trip 탭에 기존 기능 100% 이식 후 Home 수정. A/B 불가 시 점진적 이전(Feature Flag 없이 릴리즈 단계적 적용) |
| Expo Router 탭 5개 시 `app/(tabs)/`에 존재하지 않는 파일 라우팅 오류 | Medium | Low | Tabs.Screen name이 실제 파일명과 1:1 일치하는지 빌드 전 확인 |
| history.tsx / settings.tsx 삭제 시 외부 링크 깨짐 | Medium | Low | `app/(tabs)/history.tsx`에 `router.replace('/(tabs)/my')` redirect 추가 후 삭제 |
| Care 미구현 4종 알고리즘 데이터 부재 | Medium | High | P0에서는 UI placeholder(disabled 카드)로 표시, P1에서 알고리즘 연결 |
| Product 탭 실 데이터 없음 | Medium | High | Mock 데이터(`src/data/mockProducts.ts`) 사용, PRD §19.1 KPI 이벤트 스키마만 붙임 |
| 5탭으로 탭바 아이콘 크기/레이블 공간 부족 | Low | Medium | 레이블 축약(Care/Trip/Shop/My), 아이콘 size:22로 축소 |

---

## 11. 아키텍처 고려사항

### 11.1 라우팅 구조 변경 (Expo Router)

```
app/(tabs)/
  _layout.tsx        ← 수정: 5개 Tabs.Screen 추가
  index.tsx          ← 수정: 슬림화
  care.tsx           ← 신규
  trip.tsx           ← 신규
  product.tsx        ← 신규
  my.tsx             ← 신규
  history.tsx        ← 이식 후 redirect 처리 또는 삭제
  settings.tsx       ← 이식 후 redirect 처리 또는 삭제
```

### 11.2 컴포넌트 공유 원칙

- `CategoryCard`, `SubProtocolPickerModal` — Care 탭에서 재사용, 안전 게이트는 레시피 화면 공통 소유
- `ProductMatchingModal` — Product 탭 진입점에서 연결
- `PersistentDisclosure` — Care/Trip/Product 탭 신규 화면 하단에도 배치
- My 탭은 단일 파일 내에서 `useState`로 서브탭(기록/설정) 전환. 별도 중첩 라우팅 불필요.

### 11.3 데이터 플로우 영향 없음

- 루틴 실행 플로우(`/result/recipe/[id]` → `timer` → `completion`)는 탭 변경과 무관하게 동일
- AsyncStorage 스토리지 구조 변경 없음
- `src/engine/` 알고리즘 파일 변경 없음 (P0 범위)

### 11.4 프로젝트 레벨

현재 프로젝트: **Dynamic** 수준
- `src/engine/`, `src/components/`, `src/storage/`, `src/hooks/` 기능 기반 모듈 구조
- 5탭 전환은 `app/(tabs)/` 라우팅 레이어만 변경하며 엔진/스토리지 레이어 불변

---

## 12. 예상 작업량 요약

| 단계 | 예상 공수 | 비고 |
|------|---------|------|
| P0 (GNB 전환 + 기존 기능 이식) | 12.5h | 단독 개발 기준 |
| P1 (Care 4종 완성 + Product 기본) | 15h | 알고리즘 연결 포함 |
| P2 (위시리스트/인사이트/Trip Pack) | 별도 산정 | 백로그 |
| **전체 P0+P1** | **27.5h** | |

---

## 13. 다음 단계

1. [ ] 이 Plan 문서를 CTO(팀 리드)에게 리뷰 요청
2. [ ] CLAUDE.md 탭 제약 문구 업데이트 승인
3. [ ] Design 문서 작성 (`docs/02-design/features/gnb-redesign.design.md`) — 와이어프레임 5탭 기준 업데이트
4. [ ] P0 구현 시작 (`app/(tabs)/_layout.tsx` → `care.tsx` → `trip.tsx` → `my.tsx` → Home 슬림화 순)
5. [ ] 구현 완료 후 Gap Analysis (`/pdca analyze gnb-redesign`)

---

## Version History

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|---------|--------|
| 0.1 | 2026-02-27 | 초안 작성 — 현황 분석 + 5탭 구조 기획 | Product Manager |
