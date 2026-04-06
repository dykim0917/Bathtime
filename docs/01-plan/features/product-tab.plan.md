# Product 탭 구현 Planning Document

> **Summary**: 현재 placeholder 상태인 Product 탭을 에디토리얼 큐레이션 화면으로 구현한다. 카테고리 pill 필터 + ProductCard 컴포넌트 + 정적 데이터(src/data/products.ts) 3개 파일만으로 P0을 완성한다.
>
> **Project**: Bath Sommelier
> **Version**: v3.12.2 (예정)
> **Author**: Plan Plus (Brainstorming-Enhanced)
> **Date**: 2026-03-03
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

Product 탭은 GNB 재설계(v3.12.0)에서 독립 진입점으로 추가됐으나 현재 "제품 큐레이션을 준비 중이에요" placeholder만 표시된다. 에디토리얼 큐레이션 방식의 제품 카드 리스트를 구현하여:

- 입욕 루틴에 어울리는 제품(에센셜 오일, 입욕소금, 허브)을 탐색할 수 있는 화면 제공
- 카테고리 pill 필터로 원하는 제품 유형을 빠르게 찾을 수 있는 UX
- 정적 데이터 기반으로 백엔드 없이 즉시 출시 가능

### 1.2 Background

- PRD v3.12.0 기준 Product 탭은 탭 진입점만 구현된 stub 상태
- ProductMatchingModal 컴포넌트가 존재하나 이 화면과는 별개 (Care/Trip 루틴 연동용)
- 단계적 구현: P0 정적 큐레이션 → P2 루틴 연동 → P3 태그 필터 풀 구현

---

## 2. User Intent Discovery (Brainstorming Phase 1)

### 2.1 Core Problem
**에디토리얼 큐레이션** — 입욕 루틴에 어울리는 제품을 에디터가 선정해 카드 형식으로 탐색할 수 있는 공간

### 2.2 Content Focus
**제품 카드 리스트** — 카테고리별로 정리된 제품 카드 목록

### 2.3 Data Source
**정적 하드코딩** — `src/data/products.ts`에 배열 관리, 백엔드 불필요

### 2.4 Success Criteria
- Product 탭 진입 시 placeholder 대신 제품 카드 목록 표시
- 카테고리 pill 필터 동작 (전체/에센셜 오일/입욕소금/허브)
- TypeScript 컴파일 에러 0개

---

## 3. Alternatives Explored (Brainstorming Phase 2)

### Approach A: 카테고리 탭 + 카드 리스트 — **선택**
상단 카테고리 pill + 하단 제품 카드 세로 스크롤.
- **장점**: 구현 단순, UX 명확, 정적 데이터와 호환, 빠른 출시
- **단점**: 제품 수 적을 때 카테고리 pill 과잉일 수 있음
- **결론**: P0 적합, 확장 용이

### Approach B: 루틴 연동 추천 리스트
Care/Trip 루틴 결과 기반 컨텍스트 추천.
- **결론**: P2로 연기 (루틴 이력 없으면 빈 화면 문제)

### Approach C: 태그 기반 풀 필터
다중 태그 필터 UI.
- **결론**: P3으로 연기 (UI 복잡도 대비 P0 가치 낮음)

---

## 4. YAGNI Review (Brainstorming Phase 3)

### P0에 포함
| 항목 | 이유 |
|------|------|
| `src/data/products.ts` — ProductItem 타입 + 10~15개 데이터 | 핵심 데이터 없으면 화면 불가 |
| `src/components/ProductCard.tsx` — 재사용 카드 컴포넌트 | 카드 렌더링 필수 |
| `app/(tabs)/product.tsx` — 카테고리 pill + 리스트 | 화면 구현 필수 |

### P0에서 제외 (Out of Scope)
| 항목 | 이유 |
|------|------|
| 외부 구매 링크 (Linking.openURL) | P2: 스폰서/제휴 연결 별도 기획 필요 |
| 제품 상세 모달 | P2 |
| 즐겨찾기/위시리스트 | P2: AsyncStorage 연동 필요 |
| 검색 기능 | P3 |
| 루틴 연동 추천 | P2 |
| 정렬 기능 | P2 |

---

## 5. Architecture Design (Brainstorming Phase 4)

### 5.1 변경 파일 목록

| 파일 | 종류 | 내용 |
|------|------|------|
| `src/data/products.ts` | 신규 | ProductCategory 타입, ProductItem 인터페이스, 정적 데이터 10~15개 |
| `src/components/ProductCard.tsx` | 신규 | 제품명/브랜드/설명/태그 카드 (named export) |
| `app/(tabs)/product.tsx` | 수정 | placeholder → 카테고리 pill + ScrollView + ProductCard |

### 5.2 데이터 구조

```typescript
// src/data/products.ts
export type ProductCategory = 'all' | 'essential_oil' | 'bath_salt' | 'herb';

export interface ProductItem {
  id: string;
  name: string;           // 제품명 (한국어)
  brand: string;          // 브랜드명
  description: string;    // 한줄 설명
  category: Exclude<ProductCategory, 'all'>;
  tags: string[];         // ['수면', '이완', '근육'] 등
  emoji: string;          // 카드 아이콘
  bgColor: string;        // 카드 배경색 (design token 사용)
}
```

### 5.3 화면 구성

```
Product 탭
├── Header: "오늘의 제품"
├── Category Pills
│   [전체] [에센셜 오일] [입욕소금] [허브]
└── ScrollView
    ├── ProductCard (라벤더 에센셜 오일)
    ├── ProductCard (히말라야 핑크 솔트)
    └── ProductCard (캐모마일 허브)
```

### 5.4 카드 레이아웃

```
┌─────────────────────────────────┐
│ 🌿  라벤더 에센셜 오일  브랜드명 │
│     수면·이완에 도움을 줘요      │
│  #수면  #이완  #스트레스        │
└─────────────────────────────────┘
```

### 5.5 카테고리 데이터

| category | label | 제품 수 (예상) |
|----------|-------|---------------|
| essential_oil | 에센셜 오일 | 4~5개 |
| bath_salt | 입욕소금 | 4~5개 |
| herb | 허브 | 3~4개 |

### 5.6 디자인 토큰 준수

- 배경: `APP_BG_BASE`
- 카드: `CARD_SURFACE`, `CARD_BORDER`, `CARD_SHADOW`
- 텍스트: `TEXT_PRIMARY`, `TEXT_SECONDARY`, `TEXT_MUTED`
- 액센트: `ACCENT`
- 폰트: `TYPE_SCALE.title`, `TYPE_SCALE.body`, `TYPE_SCALE.caption`
- pill 필터: `PILL_BG`, `PILL_ACTIVE_BG`, `PILL_BORDER`

---

## 6. Implementation Plan

### 6.1 구현 순서

**Step 1**: `src/data/products.ts` 생성
- ProductCategory, ProductItem 타입 정의
- 10~15개 제품 데이터 작성 (3 카테고리 균등 배분)

**Step 2**: `src/components/ProductCard.tsx` 생성
- named export, TypeScript props interface
- StyleSheet.create() 패턴 준수
- 하단에 tag pill 렌더링

**Step 3**: `app/(tabs)/product.tsx` 수정
- placeholder 코드 전면 교체
- useState로 activeCategory 관리
- products.ts에서 필터링 로직

### 6.2 제품 데이터 예시

| 카테고리 | 이름 | 태그 |
|----------|------|------|
| essential_oil | 라벤더 에센셜 오일 | 수면, 이완, 스트레스 |
| essential_oil | 유칼립투스 에센셜 오일 | 호흡, 감기, 집중 |
| essential_oil | 페퍼민트 에센셜 오일 | 두통, 피로, 집중 |
| essential_oil | 로즈마리 에센셜 오일 | 순환, 근육, 활력 |
| bath_salt | 히말라야 핑크 솔트 | 혈액순환, 근육, 미네랄 |
| bath_salt | 데드씨 솔트 | 피부, 해독, 이완 |
| bath_salt | 엡솜 솔트 | 근육통, 부기, 회복 |
| bath_salt | 유칼립투스 배스 솔트 | 감기, 호흡, 청량 |
| herb | 캐모마일 | 수면, 이완, 소화 |
| herb | 라벤더 드라이 허브 | 수면, 스트레스, 진정 |
| herb | 로즈 페탈 | 피부, 기분, 여성 |

---

## 7. Acceptance Criteria

| 기준 | 검증 방법 |
|------|-----------|
| Product 탭 진입 시 제품 카드 목록 표시 | 시각적 확인 |
| 카테고리 pill 탭 시 해당 카테고리만 표시 | 각 카테고리 탭 테스트 |
| "전체" 선택 시 전체 제품 표시 | 전체 pill 탭 테스트 |
| TypeScript 컴파일 에러 0개 | `npx tsc --noEmit` |
| 디자인 토큰 사용 (하드코딩 없음) | 코드 리뷰 |

---

## 8. Out of Scope (미래 고려사항)

- **P2**: 외부 구매 링크 (Linking.openURL) — 제휴/스폰서 모델 기획 후
- **P2**: 제품 상세 모달 — 재료 상세, 사용법 등
- **P2**: 루틴 연동 추천 — Care/Trip 실행 후 결과 화면에서 연결
- **P2**: 즐겨찾기/위시리스트 — AsyncStorage 연동
- **P3**: 태그 기반 풀 필터, 검색 기능

---

## Version History

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| v0.1 | 2026-03-03 | Plan Plus 브레인스토밍 기반 초안 작성 |
