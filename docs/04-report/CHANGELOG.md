# ë°°ì°íì Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.12.1] - 2026-03-03

### Added
- **GNB Redesign**: 3탭 구조(Home/History/Settings) → 5탭 구조(Home/Care/Trip/Product/My) 완전 전환
  - 5개 탭 아이콘 추가 (home, heartbeat, map-o, shopping-bag, user)
  - Care 탭: 8종 IntentCard + 3가지 환경 선택(욕조/부분입욕/샤워)
  - Trip 탭: 테마 기반 추천 + 2가지 환경(욕조/샤워)
  - Product 탭: 에디토리얼 큐레이션 (11개 Mock 제품 + 3개 카테고리)
  - My 탭: 기록 + 설정 통합 (서브탭 pill 전환)

- **Care Intent Cards (4종)**: 기존 4종 + 신규 4종
  - `cold_relief` (감기 기운이 느껴질 때) - 색상: #B8D9E8, 이모지: 🤧
  - `menstrual_relief` (생리통이 있을 때) - 색상: #F0C5CC, 이모지: 🌸
  - `stress_relief` (스트레스를 풀고 싶을 때) - 색상: #C5D9B8, 이모지: 🍃
  - `mood_lift` (기분 전환이 필요할 때) - 색상: #F5E5A3, 이모지: ☀️
  - 각 카드별 SubProtocol 옵션 추가 (2~3개 선택지)
  - DailyTag 매핑: cold, menstrual_pain, stress, depression

- **Product Tab Editorial Curation**:
  - `ProductCard.tsx` 컴포넌트 신규 생성 (named export)
  - `src/data/products.ts`: ProductItem 타입 정의 + 11개 Mock 제품 데이터
  - 카테고리 기반 필터 UI (3~4개 카테고리)
  - 토큰 기반 색상 사용 (하드코딩 색상 0)

### Changed
- **CLAUDE.md**: 탭 제약 문구 업데이트
  - Before: "Do not create new tab routes -- the three tabs (home, history, settings) are final"
  - After: "Tab structure (v3.12.0): 5 tabs -- Home, Care, Trip, Product, My"

- **Navigation Flow**: 루틴 완료 후 출발지 탭으로 복귀
  - Care 탭: `/result/recipe/[id]?source=care` → 완료 후 `/(tabs)/care` 복귀
  - Trip 탭: `/result/recipe/[id]?source=trip` → 완료 후 `/(tabs)/trip` 복귀
  - Home 탭: `/result/recipe/[id]` (source 없음) → 완료 후 `/(tabs)` 복귀

### Deprecated
- `app/(tabs)/history.tsx`: 리다이렉트 처리 (향후 삭제 예정)
- `app/(tabs)/settings.tsx`: 리다이렉트 처리 (향후 삭제 예정)
  - 기능 이동: `/(tabs)/my` 탭의 서브섹션으로 통합

### Fixed
- 없음 (모든 기존 기능 정상 동작)

### Quality Metrics
- TypeScript strict mode: 0 에러
- Unit tests: 49/49 PASS (기존)
- Design match rate (GNB): 97%
- Design match rate (Care Cards): 100%
- Code token compliance: 93%

### Documentation
- `/docs/02-design/features/gnb-redesign.design.md` (완성)
- `/docs/03-analysis/gnb-redesign.analysis.md` (97% match)
- `/docs/03-analysis/care-intent-cards.analysis.md` (100% match)
- `/docs/04-report/session-2026-03-03.report.md` (세션 완료 보고서)

---

## [3.12.0] - 2026-02-27

### Added
- GNB redesign 설계 문서 완성
- Care Intent Cards 4종 설계 문서
- PDCA 분석 프로세스 시작

### Changed
- `docs/PRD_CURRENT.md`: v3.12.0 구현 로드맵 추가

---

## [3.11.0] - 2026-02-20

### Status
- 핵심 알고리즘 완성 (CareEngine, TripEngine)
- UI 리디자인 Phase 1~4 완료 (95%)
- 49개 엔진 단위 테스트 모두 통과
- 디자인 시스템 완성 (28개 토큰)

### Features
- Home 탭: 8종 IntentCard (4종 구현 + 4종 disabled placeholder)
- 타이머 화면: 3단계 단계별 진행
- 히스토리 탭: 필터 + 인사이트 배너
- 안전 필터: 고위험군 자동 하향 조정

---

## [3.10.0] - 2026-01-15

### Added
- Phase 3 레시피 상세 + 타이머 리디자인
- Silent Moon 스타일 적용
- Skia 수애니메이션 구현

---

## [3.9.0] - 2026-01-01

### Added
- Phase 2 홈 탭 리디자인 (Figma 기반)
- CategoryCard 컴포넌트
- 2열 그리드 레이아웃

---

## [3.8.0] - 2025-12-15

### Added
- Phase 1 온보딩 플로우 리디자인
- Silent Moon Figma 스타일 참고
- 토큰 기반 색상 시스템

---

## [3.0.0] - 2025-11-01

### Initial Release
- CareEngine: 3모드 추천(Sleep/Reset/Recovery)
- TripEngine: 몰입 기반 추천
- HomeOrchestration: 통합 표시 레이어
- 안전 필터: 금기 조건 자동 검증
- 제품 매칭: 3슬롯 시스템

---

## Legend

### Versions
- **v3.12.1** (Current): GNB 5탭 + Care Cards + Product Tab
- **v3.12.0**: Planning release
- **v3.11.0**: Current stable
- **v3.0.0**: MVP release

### Status Icons
- ✅ Implemented & Verified
- 🔄 In Progress
- ⏳ Planned
- ❌ Not Started
- ⚠️ Partial / Warning

### Priority Levels
- **P0**: Critical path (MVP)
- **P1**: High priority (v3.13)
- **P2**: Medium priority (v4.0)
- **P3**: Low priority (backlog)
