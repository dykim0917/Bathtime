# Real Product Catalog Research Plan

> **Summary**: BathSommelier의 mock 제품 카탈로그를 실제 판매 상품 기준 카탈로그로 전환하기 위한 DB 스키마, seed 구조, 조사 기준을 정의한다. 추천 엔진은 안정적인 canonical product를 바라보고, 마켓별 링크는 별도 listing snapshot으로 관리한다.
>
> **Project**: Bath Sommelier
> **Version**: v3.12.3 (예정)
> **Author**: Codex
> **Date**: 2026-04-07
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

현재 Product 탭과 추천 모달은 내부 mock 카탈로그를 기준으로 동작한다. 이를 실제 판매 상품 기준으로 전환하되, 마켓 링크가 바뀌더라도 추천 엔진과 UI 식별자가 흔들리지 않도록 다음 3개 레이어로 분리한다.

- `canonical_product`: 서비스 내부 기준의 정규 상품
- `product_market_listing`: 쿠팡/네이버/컬리/올리브영/공식몰 등 판매 링크 snapshot
- `product_match_rule`: 추천 엔진이 어떤 상품을 어느 상황에 연결할지 정의

### 1.2 Why This Structure

- 쿠팡/네이버 상품명과 가격은 수시로 바뀐다.
- 추천 엔진은 외부 URL이 아니라 안정적인 product id를 봐야 한다.
- 한 canonical product가 여러 마켓 listing을 가질 수 있어야 한다.
- 품절/단종이 생겨도 canonical product는 유지하고 listing만 교체할 수 있어야 한다.

---

## 2. Scope

### 2.1 In Scope

- 실제 판매 상품 seed를 저장할 DB 스키마 초안
- 조사 기준과 검수 규칙
- seed 구조와 입력 템플릿
- 2026-04-07 기준 쿠팡 샘플 4개

### 2.2 Out of Scope

- 자동 스크래핑 봇 구현
- 가격 실시간 동기화
- 제휴 정산 로직
- 네이버 SmartStore API/비공개 파트너 연동
- 구매 전환 analytics sink 구현

---

## 3. Recommended Schema

### 3.1 Table: `canonical_product`

서비스 내부의 기준 상품이다.

| column | type | note |
|---|---|---|
| `id` | text pk | 예: `bs_v1_003` |
| `ingredient_key` | text | 현재 엔진 ingredient id와 연결 |
| `name_ko` | text | 사용자 노출명 |
| `brand` | text | 브랜드 |
| `category` | text | `essential_oil`, `bath_salt`, `bath_item`, `body_wash` |
| `mechanism` | text | `aromatic`, `magnesium`, `bicarbonate`, `neutral` |
| `price_tier` | text | `low`, `mid`, `high` |
| `environments` | json/text[] | `bathtub`, `shower` |
| `contraindication_flags` | json/text[] | 내부 안전 필터용 |
| `summary` | text | 사용자용 짧은 설명 |
| `editorial_eyebrow` | text | 카드 상단 카피 |
| `editorial_footer_hint` | text | 카드 하단 힌트 |
| `status` | text | `active`, `paused`, `retired` |
| `last_verified_at` | datetime | 가장 최근 검수 시각 |
| `created_at` | datetime | 생성일 |
| `updated_at` | datetime | 수정일 |

### 3.2 Table: `product_market_listing`

마켓별 실제 판매 링크 snapshot이다.

| column | type | note |
|---|---|---|
| `id` | text pk | 예: `listing_danawa_bs_v1_003_01` |
| `canonical_product_id` | text fk | `canonical_product.id` |
| `market` | text | `coupang`, `naver_smartstore`, `kurly`, `oliveyoung`, `official_store`, `danawa`, `other` |
| `source_url` | text | 실제 상품 URL |
| `title_snapshot` | text | 확인 시점의 상품명 |
| `seller_snapshot` | text nullable | 확인 가능 시 판매자명 |
| `price_snapshot_krw` | integer nullable | 확인 시점 가격 |
| `currency` | text | 기본 `KRW` |
| `availability` | text | `active`, `low_stock`, `out_of_stock`, `unknown` |
| `verified_at` | datetime | 스냅샷 시각 |
| `source_confidence` | real | 0~1 |
| `notes` | text nullable | 예: 옵션형 상품, 대용량, 글로벌 셀러 |

### 3.3 Table: `product_match_rule`

추천 엔진과 canonical product를 연결한다.

| column | type | note |
|---|---|---|
| `id` | text pk | 예: `rule_bs_v1_020` |
| `canonical_product_id` | text fk | `canonical_product.id` |
| `ingredient_keys` | json/text[] | 현재 recommendation ingredient id |
| `allowed_environments` | json/text[] | `bathtub`, `shower` |
| `mode_bias` | json/text[] nullable | `care`, `trip`, `sleep`, `recovery`, `reset` |
| `priority_weight` | integer | 추천 정렬 기본값 |
| `is_sommelier_pick_candidate` | boolean | slot A 후보 여부 |
| `status` | text | `active`, `paused` |

---

## 4. Research Rules

### 4.1 Hard Gates

- 실제 판매 페이지가 열려야 한다.
- 상품명이 canonical product 의도와 크게 벗어나면 제외한다.
- 의료 효능을 직접 주장하는 문구는 앱 카피에 그대로 쓰지 않는다.
- 샤워 전용 상품은 `bathtub`에 넣지 않는다.
- 품절 상태면 canonical product는 유지하되 listing은 `out_of_stock`로 저장한다.

### 4.2 Soft Preferences

- 리뷰 수가 어느 정도 있는 상품 우선
- 용량/구성이 지나치게 특이한 상품은 보조 후보로만 유지
- 국내 구매 난이도가 낮은 링크 우선
- 브랜드 인지도가 있거나 재검색 가능한 상품 우선
- 큐레이터/제휴 링크 발급이 가능한 마켓 우선
- 브랜드 톤과 제품 품질이 맞는 경우 컬리, 올리브영, 공식몰도 적극 허용

### 4.3 Link Policy

`source_url`은 사용자가 구매 행동을 이어갈 수 있는 URL이어야 한다.

우선순위:

1. 큐레이터/제휴 링크 발급 가능한 상품 URL
2. 직접 구매 가능한 마켓 상품 URL
3. 공식 브랜드몰 상품 URL
4. 가격비교/검색 URL
5. 리뷰/기사/문서 출처 URL

운영 규칙:

- `kurly`, `oliveyoung`, `official_store`는 수익화 또는 브랜드 적합성이 있으면 primary listing 후보로 허용한다.
- `danawa`는 상품 확인과 가격 비교에는 유용하지만, 직접 구매 URL이 따로 있으면 primary listing에서 후순위다.
- `glowpick`, 블로그, 기사, 리서치 문서는 구매 링크가 아니라 검증 source로만 기록한다.
- placeholder URL이나 검색 URL만 있는 제품은 `hold` 상태로 두고, 실제 상품 URL을 확보한 뒤 `ready`로 승격한다.

### 4.4 Market Policy Note

- 2026-04-07 기준 이 세션에서는 SmartStore 일부 페이지가 robots 정책으로 직접 열리지 않았다.
- 따라서 초기 seed는 쿠팡 snapshot 중심으로 시작했지만, 이후 수익화 채널 검토 결과 컬리, 올리브영, 공식몰도 허용한다.

---

## 5. Curated Seed Candidates

아래는 2026-04-22 기준 앱 카탈로그로 변환된 큐레이션 seed 일부다. 가격과 재고는 snapshot 값이므로 이후 바뀔 수 있다.

| canonical_product_id | market | title snapshot | availability | source |
|---|---|---|---|---|
| `bs_v1_003` | danawa | 바스로망 밀크 프로테인 | `active` | [다나와](https://prod.danawa.com/info/?pcode=30478328) |
| `bs_v1_005` | naver_smartstore | BARTH 바스 중성 중탄산 입욕제 90정 | `unknown` | [몰패스스토어](https://shop.mallpass.co.kr/mall/view/goodsNo/20938948) |
| `bs_v1_014` | kurly | 아로마티카 멜로우니스 오일 인 바디워시 메그놀리아&샌달우드 | `active` | [컬리](https://www.kurly.com/goods/1000332767) |
| `bs_v1_021` | oliveyoung | 아로마티카 어웨이크닝 바디워시 페퍼민트&유칼립투스 300ml | `active` | [올리브영](https://m.oliveyoung.co.kr/m/G.do?goodsNo=A000000229545) |

추가로 후보성 링크로 볼 만한 항목:

- [도테라 유칼립투스 15ml - 쿠팡](https://www.coupang.com/vp/products/8698886109)
- [Amazon Basics 엡솜 솔트 무향 1.36kg - 쿠팡](https://www.coupang.com/vp/products/9060171126)
- [샤워 스티머 아로마테라피 8팩 - 쿠팡](https://www.coupang.com/vp/products/9031452848)

### 5.1 Expanded Seed Status

현재 seed 초안은 아래 수준까지 확장했다.

- canonical product: 13개
- market listing snapshot: 26개
- match rule: 13개

커버된 ingredient key:

- `lavender_oil`
- `marjoram_oil`
- `carbonated_bath`
- `grapefruit_oil`
- `epsom_salt`
- `peppermint_oil`
- `hinoki_oil`
- `rosemary_oil`
- `clary_sage_oil`
- `eucalyptus_oil`
- `chamomile_oil`
- `shower_steamer`
- `body_wash_relaxing`

이 중 listing confidence가 낮거나 과장 효능 문구가 섞인 항목은 앱 카피가 아니라 source snapshot 전용으로만 사용해야 한다.

---

## 6. Seed Workflow

### 6.1 First Pass

1. canonical product 15~20개를 먼저 확정
2. 각 canonical product마다 쿠팡 listing 1개 이상 연결
3. 샤워/욕조 호환과 ingredient mapping 검수

### 6.2 Second Pass

1. SmartStore 또는 다른 국내 채널 추가
2. listing 2개 이상 비교
3. 품절/단종 관리 규칙 추가

### 6.3 Release Gate

- `canonical_product.id`와 현재 앱의 `catalog.ts` id가 일치해야 한다.
- `ingredient_key`가 없는 canonical product는 추천 엔진에 연결하지 않는다.
- `listing`만 있고 `match_rule`이 없으면 Product 탭 전용 상품으로만 노출한다.

---

## 7. Recommended File Outputs

현재 코드베이스에서는 아래처럼 관리하는 것이 가장 단순하다.

- [`/Users/exem/DK/BathSommelier/src/data/catalog.ts`](/Users/exem/DK/BathSommelier/src/data/catalog.ts): 런타임 카탈로그
- [`/Users/exem/DK/BathSommelier/src/data/catalogResearchSeed.ts`](/Users/exem/DK/BathSommelier/src/data/catalogResearchSeed.ts): DB/seed 입력용 조사 데이터
- 향후 서버 도입 시:
  - `canonical_product`
  - `product_market_listing`
  - `product_match_rule`

### 7.1 Recommended DB Default

현재 레포에는 특정 서버 DB 선택이 고정돼 있지 않다. 그래서 기본 권장안은 PostgreSQL이다.

이유:

- `environments`, `ingredient_keys`, `mode_bias`를 `JSONB`로 자연스럽게 저장 가능
- `GIN index`로 환경/ingredient 조건 조회 확장에 유리
- 향후 analytics / listing / personalization 테이블 증가에도 무난함

준비된 파일:

- 범용 초안: [`/Users/exem/DK/BathSommelier/db/migrations/2026-04-07_real_product_catalog.sql`](/Users/exem/DK/BathSommelier/db/migrations/2026-04-07_real_product_catalog.sql)
- PostgreSQL 권장안: [`/Users/exem/DK/BathSommelier/db/migrations/2026-04-07_real_product_catalog.postgres.sql`](/Users/exem/DK/BathSommelier/db/migrations/2026-04-07_real_product_catalog.postgres.sql)
- PostgreSQL upsert export: `npm run catalog:seed:export:postgres`

---

## 8. Acceptance Criteria

| 기준 | 검증 방법 |
|---|---|
| canonical / listing / rule 3층 구조가 분리됨 | schema review |
| seed 샘플 4개 이상 준비 | seed file review |
| 현재 앱 product id와 seed id가 일치 | code review |
| unstable data가 snapshot으로 저장됨 | verified_at, price_snapshot 확인 |

---

## Version History

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| v0.1 | 2026-04-07 | 실판매 상품 리서치용 schema/seed 계획 초안 작성 |
