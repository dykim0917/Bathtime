# Product 정보 명확화 Planning Document

> **Summary**: 현재 Product 경험은 에디토리얼 무드는 있으나 실제 구매 판단에 필요한 정보가 부족하다. ProductCard, ProductDetailModal, catalog 데이터 계약을 정리해 "왜 이 제품인지", "얼마인지", "언제 확인한 정보인지", "어떤 루틴에 맞는지"를 명확하게 보여주는 방향으로 재설계한다.
>
> **Project**: ë°°ì°íì
> **Version**: v3.12.4 (proposed)
> **Author**: Codex
> **Date**: 2026-04-08
> **Status**: Draft

---

## 1. Problem Statement

현재 Product 화면은 시각적으로는 정돈돼 있지만, 사용자가 실제로 구매를 고려할 때 필요한 핵심 정보가 빠져 있다.

현재 상태:

- [`src/components/ProductCard.tsx`](/Users/exem/DK/BathSommelier/src/components/ProductCard.tsx) 는 제품명, 브랜드, 짧은 설명, 태그만 보여준다.
- [`src/components/ProductDetailModal.tsx`](/Users/exem/DK/BathSommelier/src/components/ProductDetailModal.tsx) 는 실제 가격 대신 `low/mid/high` price tier 만 보여준다.
- [`src/data/catalog.ts`](/Users/exem/DK/BathSommelier/src/data/catalog.ts) 에는 `listing.priceSnapshotKrw`, `listing.verifiedAt`, `listing.titleSnapshot` 가 runtime object에 들어오지만 UI는 거의 쓰지 않는다.
- [`app/(tabs)/product.tsx`](/Users/exem/DK/BathSommelier/app/(tabs)/product.tsx) 는 "에디터 픽" 리스트로 보이지만, 선택 기준과 비교 기준이 불명확하다.

결과적으로 사용자는 아래 질문에 답을 얻지 못한다.

1. 이 제품이 왜 지금 내 루틴에 맞는가?
2. 실제로 얼마인가?
3. 이 가격/링크 정보는 최신인가?
4. 비슷한 제품 중 어떤 역할을 하는가?
5. 바로 사야 하는가, 아니면 루틴만 먼저 시작하면 되는가?

---

## 2. Product Principle

배쓰타임의 Product 경험은 "쇼핑몰"이 아니라 "루틴 보조 레이어"여야 한다.

원칙:

- Product는 루틴을 돕는 설명 가능한 선택지여야 한다.
- 제품 카드는 감성 카드가 아니라 의사결정 카드여야 한다.
- 가격/링크/검수 시점이 없으면 구매 CTA 신뢰도가 떨어진다.
- 실제 판매 정보는 snapshot 으로 다루고, 불확실하면 불확실하다고 말해야 한다.
- 제품이 부족한 경우에도 루틴 실행은 막지 않는다.

한 줄 정의:

**"Product는 지금 루틴에 붙일 수 있는 가장 설명 가능한 보조 선택지를 보여주는 레이어다."**

---

## 3. What Users Need

### 3.1 Primary user jobs

1. "오늘 이 루틴에 뭘 같이 쓰면 좋지?"
2. "샤워 환경에서도 쓸 수 있는 제품인가?"
3. "이 제품은 대충 좋은 건지, 지금 내 목적에 맞는 건지?"
4. "가격이 어느 정도인지 보고 바로 판단하고 싶다."

### 3.2 User questions the UI must answer

#### Product tab card

- 무엇인가
- 누구에게 맞는가
- 어떤 상황에서 쓰는가
- 대략 얼마인가

#### Product detail modal

- 왜 추천했는가
- 실제 상품명/판매처/가격은 무엇인가
- 마지막으로 언제 확인했는가
- 어떤 루틴/환경과 맞는가
- 안전상 주의점이 있는가

---

## 4. Current Gaps

| 영역 | 현재 상태 | 문제 |
|---|---|---|
| 카드 정보 밀도 | 감성 카피 위주 | 구매 판단 불가 |
| 가격 표현 | `priceTier`만 노출 | 실제 가격 체감 불가 |
| 판매 출처 | 링크는 있으나 화면에 미노출 | 외부 이동 신뢰 부족 |
| 검수 시점 | `verifiedAt` 존재, 미노출 | 오래된 링크인지 모름 |
| 추천 근거 | `editorial` 기반 문구만 있음 | 루틴 적합 이유가 약함 |
| 비교 정보 | category만 있음 | slot 역할, 사용 환경, 메커니즘 구분 약함 |
| fallback 정책 | 코드/PRD에는 존재 | 사용자에게는 거의 보이지 않음 |

---

## 5. Scope

### 5.1 In Scope

- ProductCard 정보 구조 재정의
- ProductDetailModal 필수 노출 항목 재정의
- `CatalogProduct` UI projection 필드 정의
- Product tab IA 정리
- 가격 snapshot / 판매처 / 검수 시점 표기 원칙 정의
- 정보 부족 시 fallback copy 원칙 정의

### 5.2 Out of Scope

- 실시간 가격 동기화
- 장바구니/결제/제휴 정산
- 비교표, 리뷰 수집, 사용자 리뷰
- 검색/정렬 고도화
- 위시리스트

---

## 6. Recommended Information Architecture

### 6.1 Product tab

```
Product
├── Hero
│   ├── 오늘의 제품
│   └── 루틴 보조 레이어 설명
├── Filter
│   ├── 환경
│   ├── 카테고리
│   └── 루틴 목적
└── Product cards
    ├── 왜 맞는지
    ├── 실제 가격 snapshot
    ├── 판매처
    ├── 환경 적합성
    └── 상세 열기
```

### 6.2 Card structure

각 카드에 아래 6개가 반드시 보여야 한다.

1. 제품명
2. 한 줄 역할 설명
3. 루틴 적합 이유 한 줄
4. 가격 snapshot
5. 판매처
6. 환경 적합성

권장 레이아웃:

```txt
┌──────────────────────────────────────┐
│ SLEEP EDIT            쿠팡 · 7,400원 │
│ 라벤더 에센셜 오일                  │
│ 밤 루틴 첫 후보로 무난한 기본 오일   │
│ 수면 준비 루틴 · 욕조 사용 적합      │
│ [욕조] [아로마] [검수 4/7]       ›  │
└──────────────────────────────────────┘
```

### 6.3 Detail modal structure

상세 모달에는 아래 정보가 필요하다.

1. canonical name + market title snapshot
2. 브랜드
3. 실제 가격 snapshot
4. 판매처
5. 마지막 검수일
6. 왜 이 루틴에 맞는지
7. 어떤 환경에서 쓸 수 있는지
8. 메커니즘 설명
9. 주의 조건
10. 구매 링크 열기

---

## 7. Data Contract Changes

현재 `CatalogProduct` 는 데이터를 거의 다 가지고 있다. 문제는 UI projection 이 약한 것이다.

### 7.1 Add required UI fields

`CatalogProduct` 또는 selector 레이어에서 아래 파생 필드를 만들 것을 권장한다.

```ts
interface CatalogProductUi {
  displayPrice: string | null;          // "7,400원"
  marketLabel: string | null;           // "쿠팡"
  verifiedLabel: string | null;         // "4/7 확인"
  routineFitSummary: string;            // "수면 준비 루틴에 무난한 기본 오일"
  environmentSummary: string;           // "욕조 사용 적합"
  mechanismSummary: string;             // "아로마 확산 중심"
  cautionSummary?: string;              // "민감 피부는 희석 사용 권장"
  sourceTitle?: string;                 // 실제 판매 페이지 제목
}
```

### 7.2 Price display rules

- `listing.priceSnapshotKrw` 가 있으면 반드시 노출
- 없으면 `priceTier` 를 그대로 보여주지 말고 "가격 확인 필요"로 노출
- `priceTier` 는 보조 정보로만 사용
- 실제 가격과 검수일은 항상 같이 보인다

### 7.3 Verification rules

- `verifiedAt` 가 있으면 "M/D 확인" 형식으로 노출
- 30일 초과 snapshot 은 "정보 갱신 필요" 상태로 표시
- `availability !== active` 면 기본 CTA 를 약화하거나 숨긴다

---

## 8. Three Approaches

### Approach A: UI copy patch only

- 카드/모달 문구만 보강
- 장점: 가장 빠름
- 단점: 가격/판매처/검수 정보 문제를 해결하지 못함
- verdict: 불충분

### Approach B: UI projection layer + card/modal redesign

- catalog runtime 데이터에서 UI 전용 필드를 만들고, 카드/모달 정보 구조를 재설계
- 장점: 지금 구조를 크게 뒤엎지 않고 핵심 문제 해결
- 단점: selector/formatter 레이어 추가 필요
- verdict: 추천

### Approach C: Full commerce redesign

- Product 탭을 collection, compare, save, ranking까지 포함한 커머스 허브로 확장
- 장점: 장기적으로 강함
- 단점: 현재 제품 단계에 비해 과함
- verdict: 지금은 과투자

**RECOMMENDATION:** Approach B. 지금 문제는 데이터 부재가 아니라 "UI가 중요한 사실을 말해주지 않는 것"이라서, projection layer 와 정보 구조 재정의가 가장 정확하다.

---

## 9. Required UX Rules

### 9.1 Card

- 카드 한 장만 보고도 구매 클릭 여부를 결정할 수 있어야 한다.
- decorative tag 보다 price/source/fit 정보를 우선한다.
- `editorial.footerHint` 는 보조 카피로 내린다.

### 9.2 Detail modal

- "구매 링크 열기" 전에 신뢰 정보가 먼저 보여야 한다.
- 실제 판매명과 앱 내부 canonical 명이 다르면 둘 다 보여준다.
- 루틴 적합성 근거를 2줄 이내로 고정한다.

### 9.3 Empty / fallback

- 링크가 없으면 "구매 링크 없음" 대신 "루틴만 먼저 시작할 수 있어요"를 기본 메시지로 쓴다.
- 상품 정보가 불충분하면 Product를 숨기지 말고 "정보 보강 중" 배지와 함께 루틴 우선 CTA를 준다.

---

## 10. Implementation Plan

### Phase 1. Data projection

- `src/data/catalog.ts` 또는 별도 selector 에 UI 파생 필드 추가
- `market`, `price`, `verifiedAt`, `availability` formatter 작성

### Phase 2. Card redesign

- ProductCard 에 실제 가격, 판매처, 환경 적합성 추가
- 기존 tag row 우선순위 축소

### Phase 3. Detail redesign

- ProductDetailModal 에 market snapshot 정보, 검수일, 적합성 이유 추가
- `priceTier` 직접 노출 제거

### Phase 4. Product tab hierarchy cleanup

- "에디터 픽"만으로는 부족하므로 "오늘의 루틴에 맞는 제품" 구조로 메시지 수정
- 카테고리 필터 외에 환경/목적 필터 도입 여부 판단

---

## 11. Acceptance Criteria

| 기준 | 검증 방법 |
|---|---|
| 카드에서 실제 가격 또는 가격 부재 상태가 명시된다 | Product 탭 QA |
| 카드에서 판매처가 보인다 | Product 탭 QA |
| 카드에서 루틴 적합 이유가 보인다 | 카피 리뷰 |
| 상세 모달에서 검수일이 보인다 | Modal QA |
| 상세 모달에서 `priceTier` 단독 노출이 제거된다 | 코드 리뷰 |
| 정보 부족 시 루틴 우선 fallback 이 유지된다 | UX QA |

---

## 12. NOT in Scope

- 실시간 가격 갱신, 가격 비교, 할인률 계산
- 사용자 리뷰, 평점, 리뷰 수
- 장바구니와 결제
- 추천 알고리즘 고도화 자체

---

## 13. Next Decision

다음 구현 전 결정해야 할 것은 하나다.

**Product를 "탐색 탭"으로 둘지, "현재 루틴 보조 탭"으로 더 강하게 좁힐지.**

현재 코드와 PRD 기준 추천은 후자다. 그래야 카드 정보 우선순위도 명확해진다.
