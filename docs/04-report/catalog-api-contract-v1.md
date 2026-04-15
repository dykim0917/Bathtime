# Catalog API Contract v1

버전: `catalog.v1`  
기준일: `2026-04-07`

이 문서는 BathSommelier 프론트가 ProductHub / 추천 제품 모달 / 루틴 상세에서 공통으로 사용할 `/api/catalog` 응답 계약을 정의한다.

목표:

- 프론트가 더 이상 하드코딩 카탈로그를 원본으로 삼지 않게 한다.
- 서버는 `canonical product`, `market listing`, `match rule`, `presentation`을 분리해서 내려준다.
- 프론트는 이를 runtime `CatalogProduct`로 조립한다.

---

## 1. Endpoint

### `GET /api/catalog`

기본 응답은 전체 active catalog snapshot이다.

선택적 query 예시:

- `?status=active`
- `?environment=shower`
- `?market=coupang`

초기 v1에서는 query 최적화보다 full snapshot 응답을 우선한다.

---

## 2. Response Shape

```json
{
  "schema_version": "catalog.v1",
  "snapshot_date": "2026-04-07",
  "canonical_products": [],
  "market_listings": [],
  "match_rules": [],
  "presentations": []
}
```

### 2.1 `canonical_products`

서비스 내부 기준 상품이다.

```json
{
  "id": "p_lavender_eo",
  "ingredient_key": "lavender_oil",
  "name_ko": "라벤더 에센셜 오일",
  "brand": "리비네이처",
  "category": "essential_oil",
  "mechanism": "aromatic",
  "price_tier": "mid",
  "environments": ["bathtub"],
  "summary": "수면 준비와 이완 루틴에 무난하게 붙는 대표 아로마 오일",
  "editorial_eyebrow": "SLEEP EDIT",
  "editorial_footer_hint": "밤 루틴 첫 후보로 두기 좋은 기본 오일",
  "status": "active",
  "last_verified_at": "2026-04-07"
}
```

### 2.2 `market_listings`

마켓별 실제 판매 링크 snapshot이다.

```json
{
  "id": "listing_coupang_p_lavender_eo_01",
  "canonical_product_id": "p_lavender_eo",
  "market": "coupang",
  "source_url": "https://www.coupang.com/vp/products/6217087830",
  "title_snapshot": "리비네이처 아로마 에센셜 오일 라벤더, 10ml, 1개",
  "seller_snapshot": "리비네이처",
  "price_snapshot_krw": 7400,
  "availability": "active",
  "verified_at": "2026-04-07",
  "source_confidence": 0.9,
  "notes": null
}
```

### 2.3 `match_rules`

추천 엔진과 canonical product 연결 정보다.

```json
{
  "id": "rule_p_lavender_eo",
  "canonical_product_id": "p_lavender_eo",
  "ingredient_keys": ["lavender_oil"],
  "allowed_environments": ["bathtub"],
  "mode_bias": ["care", "sleep"],
  "priority_weight": 80,
  "is_sommelier_pick_candidate": false,
  "status": "active"
}
```

### 2.4 `presentations`

UI 전용 메타데이터다. 이 값은 서버나 CMS에서 관리할 수 있지만, v1에서는 API 응답에 포함해 프론트 단순화를 우선한다.

```json
{
  "canonical_product_id": "p_lavender_eo",
  "tags": ["수면", "이완", "스트레스"],
  "emoji": "🌿",
  "bg_color": "#E8E1F9",
  "safety_flags": []
}
```

---

## 3. Why Four Arrays

이 구조를 나눈 이유는 다음과 같다.

- `canonical_products`: 제품 정체성
- `market_listings`: 구매 링크와 가격 snapshot
- `match_rules`: 추천 알고리즘 연결
- `presentations`: 프론트 시각화

한 객체에 전부 섞으면 판매 링크 갱신, 추천 규칙 조정, UI 리브랜딩이 서로 불필요하게 결합된다.

---

## 4. Frontend Mapping Rule

프론트는 아래 규칙으로 runtime `CatalogProduct`를 조립한다.

1. `canonical_product.id` 기준으로 base record 생성
2. 같은 id의 `match_rule`을 붙여 `ingredient_keys`, `allowed_environments` 확보
3. 같은 id의 `presentation`을 붙여 `tags`, `emoji`, `bg_color`, `safety_flags` 확보
4. 같은 id의 `market_listing` 중 `availability > source_confidence` 우선순위로 primary listing 선택
5. Product tab / Product modal / Product detail 모두 같은 runtime object 사용

---

## 5. Required Invariants

- `canonical_products.id`는 전역 고유해야 한다.
- `market_listings.canonical_product_id`는 반드시 canonical product를 참조해야 한다.
- `match_rules.canonical_product_id`는 반드시 canonical product를 참조해야 한다.
- `presentations.canonical_product_id`는 반드시 canonical product를 참조해야 한다.
- `ingredient_keys`는 현재 recommendation ingredient id 체계와 일치해야 한다.
- `schema_version`이 바뀌면 프론트 normalizer도 함께 갱신해야 한다.

---

## 6. Fallback Rules

- listing이 없으면 `purchaseUrl`은 비운다.
- listing이 여러 개면 `availability(active > low_stock > unknown > out_of_stock)` 우선으로 고른다.
- 같은 availability라면 `source_confidence`가 높은 listing을 고른다.
- `presentation`이 없으면 프론트는 fallback 렌더링 대신 에러를 기록하고 해당 product를 제외한다.
- `match_rule`이 없으면 Product tab 전용 상품으로만 보여주고 추천 슬롯에는 넣지 않는다.

---

## 7. Type Source

코드 기준 타입은 여기 있다.

- [`/Users/exem/DK/BathSommelier/src/contracts/catalogApi.ts`](/Users/exem/DK/BathSommelier/src/contracts/catalogApi.ts)

이 파일에는:

- API payload 타입
- snake_case → camelCase runtime bundle normalizer

가 포함돼 있다.

---

## 8. Next Step

이 계약 다음 단계는 둘 중 하나다.

1. 서버에서 `/api/catalog` mock endpoint를 실제로 만들기
2. 프론트 `catalog.ts`가 local seed 대신 API payload normalizer를 쓰도록 바꾸기

현재 권장 순서는 `1 -> 2`다.

### 8.1 Local Mock Endpoint

현재 레포에는 로컬 검증용 mock endpoint가 추가돼 있다.

- 실행: `npm run catalog:api:mock`
- 기본 주소: `http://127.0.0.1:4010/api/catalog`
- 헬스체크: `http://127.0.0.1:4010/health`

지원 query:

- `?status=active`
- `?environment=shower`
- `?market=coupang`

예시:

- `http://127.0.0.1:4010/api/catalog?status=active`
- `http://127.0.0.1:4010/api/catalog?environment=shower`
