# Product Curation Rules

> Summary: 케어탭과 트립탭의 현재 루틴 구조를 기준으로, 제품 카탈로그와 추천 슬롯에 올릴 상품 선정 기준을 정의한다.
>
> Project: Bath Sommelier
> Date: 2026-04-22
> Status: Draft

## 1. Assumptions

- 제품 큐레이션의 1차 목적은 의료적 효능 보장이 아니라, 사용자의 루틴 의도와 목욕 환경에 맞는 안전한 제품 후보를 좁히는 것이다.
- 현재 추천 엔진은 `ingredient id -> canonical product -> market listing` 흐름을 사용한다.
- 실제 판매 링크, 가격, 재고는 바뀔 수 있으므로 큐레이션 기준과 listing snapshot 검수 기준을 분리한다.
- Product 탭은 입문자용 완제품 중심으로 운영하고, 에센셜 오일은 루틴 상세/추천 맥락에서 제한적으로 노출한다.

## 2. Curation Priority

제품 선정은 아래 순서를 반드시 지킨다.

1. 안전성: 건강 상태 금기, 고온/음주/임신/민감성 피부 리스크를 먼저 제외한다.
2. 환경 적합성: 샤워 제품은 샤워에, 입욕 제품은 욕조/부분입욕에만 연결한다.
3. 루틴 의도 적합성: 케어는 증상/상태 해결감, 트립은 테마 몰입감을 우선한다.
4. 사용 난이도: Product 탭과 Sommelier Pick은 초보자가 계량/희석 없이 쓰기 쉬운 제품을 우선한다.
5. 구매 신뢰도: 실제 판매 페이지, 재고 상태, 상품명 일치도, source confidence를 확인한다.
6. 브랜드 톤: 과장 효능, 치료 표현, 지나친 럭셔리 과시는 앱 카피에 쓰지 않는다.

## 3. Hard Gates

아래 조건 중 하나라도 실패하면 추천 슬롯과 Product 탭에서 제외한다.

- `status !== active`인 canonical product
- 실제 판매 페이지가 열리지 않거나 listing availability가 `out_of_stock`인 상품
- canonical product의 `ingredientKey`가 현재 추천 엔진 ingredient id와 맞지 않는 상품
- `allowedEnvironments`가 현재 루틴 환경과 맞지 않는 상품
- 임신 중 금기 성분: `rosemary_oil`, `peppermint_oil`, `clary_sage_oil`
- 민감성 피부에서 자극 가능 성분으로 등록된 상품
- 의료 효능을 직접 보장하는 상품명/상세 카피를 앱 추천 이유로 그대로 옮겨야만 설명되는 상품

## 4. Scoring Guide

`priorityWeight`는 아래 기준으로 부여한다.

| Range | Meaning | Use |
|---|---|---|
| 90-100 | 루틴 핵심 기전과 환경이 매우 잘 맞고 초보자도 쓰기 쉬움 | Sommelier Pick 후보 |
| 80-89 | 루틴 의도와 성분 맥락이 명확함 | 추천 슬롯 후보 |
| 70-79 | 보조 옵션으로는 가능하나 핵심 후보는 아님 | B/C 슬롯 또는 Product 탭 |
| 50-69 | 설명 가능하지만 루틴 적합성이 약함 | Product 탭 전용 검토 |
| 0-49 | 현재 루틴 체계와 연결 약함 | 제외 또는 보류 |

Sommelier Pick 후보는 `priorityWeight >= 88`, `isSommelierPickCandidate = true`, 환경 적합, 금기 없음, 사용 난이도 낮음 조건을 모두 만족해야 한다.

## 5. Care Tab Rules

케어탭은 "상황별 루틴"을 기준으로 상품을 고른다. 향보다 기능적 맥락과 안전성이 먼저다.

| Care intent | Situation | Primary curation axis | Preferred product type | Avoid |
|---|---|---|---|---|
| `muscle_relief` | 운동 후 뻐근함 | 회복감, 근육 이완 루틴 맥락 | 엡솜 솔트, 탄산 입욕제, 샤워 스티머 | 고자극 쿨링 오일 단독 추천 |
| `sleep_ready` | 잠들기 어려움 | 저자극, 안정감, 밤 루틴 | 탄산 입욕제, 릴랙싱 바디워시, 순한 아로마 계열 | 각성감 강한 허브/시트러스 중심 제품 |
| `hangover_relief` | 음주 다음 날 | 미온수 부분입욕, 부담 최소화 | 제품 추천 최소화, 필요 시 순한 샤워/족욕 보조품 | 전신 입욕제, 고온 유도, 강한 향 |
| `edema_relief` | 붓기 | 순환감, 하체 부분입욕 맥락 | 탄산 입욕제, 저자극 시트러스 후보 | 민감성 피부에서 자극 가능한 제품 |
| `cold_relief` | 으슬으슬함 | 따뜻함, 호흡감, 자극 낮춤 | 탄산 입욕제, 유칼립투스 계열 후보, 샤워 스티머 | 차가운 쿨링감을 강조하는 제품 |
| `menstrual_relief` | 생리통 | 온열감, 안정감, 저자극 | 순한 입욕제, 릴랙싱 바디워시, 캐모마일 계열 후보 | 임신 금기 성분, 강한 순환/각성 카피 |
| `stress_relief` | 스트레스 | 빠른 전환, 호흡, 긴장 완화 | 샤워 스티머, 릴랙싱 바디워시, 탄산 입욕제 | 치료/진정 보장형 표현 |
| `mood_lift` | 기분 저하 | 가벼운 리셋, 밝은 향, 낮은 진입 장벽 | 샤워 스티머, 탄산 입욕제, 시트러스 후보 | 무거운 수면 전용 무드만 있는 제품 |

Care 슬롯 운영:

- A 슬롯: 루틴의 핵심 기전 대표. 회복 루틴은 `magnesium`, 수면/리셋 루틴은 `bicarbonate` 또는 저자극 완제품을 우선한다.
- B 슬롯: 향/감성 보조 옵션. 단, 오일류는 금기와 희석/사용법 리스크를 확인한다.
- C 슬롯: 가격 부담이 낮고 일상적으로 쓰기 쉬운 대안.
- 샤워 환경에서는 `shower_steamer`, `body_wash_relaxing`처럼 샤워 전용 또는 샤워 호환 제품만 추천한다.

## 6. Trip Tab Rules

트립탭은 "장소/무드 몰입"을 기준으로 상품을 고른다. 단, 감성 적합성은 안전성과 환경 적합성을 통과한 뒤에만 평가한다.

Trip 제품 선정 축:

- 장소성: 숲, 비, 눈, 바다, 도시, 서재처럼 테마의 공간 이미지와 맞는 향/제형
- 온도감: 따뜻한 테마는 온기/목재/앰버 계열, 차분한 테마는 순한 허브/화이트 우드 계열
- 소리/조명과의 결: rain, forest, ocean, fireplace ambience와 충돌하지 않는 향
- 환경 대체성: 샤워에서도 짧게 몰입 가능한 제품을 별도 확보

| Trip theme group | Current themes | Primary product direction |
|---|---|---|
| Forest / Garden | Kyoto Forest, Moss Temple Kyoto | 히노키/편백, 우디, 삼림욕 계열 |
| Rain / Camping | Rainy Camping, Lantern Rain Karuizawa | 샤워 스티머, 젖은 숲/허브 계열, 저자극 바디워시 |
| Snow / Cabin | Snow Cabin, White Silence Sapporo | 캐모마일, 시더우드, 포근한 입욕제 |
| Sauna / Reset | Nordic Sauna | 유칼립투스, 샤워 스티머, 짧은 리셋용 제품 |
| Ocean / Harbor | Ocean Dawn, Harbor Blue Busan | 가벼운 시트러스, 청량한 입욕제, 과하지 않은 해양 무드 |
| Tea / Library / Warm Interior | Tea House, Fireside Library | 캐모마일, 우디, 앰버 톤 바디워시 |
| City Night | Midnight Paris, Afterglow Seoul | 샤워 친화 제품, 짧은 리셋감, 과한 향보다 잔향 중심 |

Trip 슬롯 운영:

- A 슬롯: 테마의 대표 감각을 가장 명확히 만드는 제품.
- B 슬롯: 같은 루틴을 더 부드럽게 만드는 향/바디케어 옵션.
- C 슬롯: 해당 테마를 샤워 환경에서도 재현할 수 있는 대체 제품.
- 트립에서는 `modeBias`에 `trip`이 있으면 가산하되, 테마의 ingredient mapping과 환경 적합성이 더 높은 우선순위다.

## 7. Product Tab Rules

Product 탭은 추천 엔진의 전체 후보가 아니라 "지금 바로 보기 좋은 입문자 제품"만 보여준다.

노출 우선 카테고리:

- `bath_salt`
- `bath_item`
- `body_wash`

보류 또는 제한 노출:

- `essential_oil`: 희석/용량/금기 설명이 필요하므로 기본 Product 탭에서는 후순위
- 고가 제품: 테마 몰입도가 높더라도 입문자 기본 리스트에서는 과대표시하지 않음
- 전문 사용법이 필요한 제품: 상세 모달에 충분한 설명이 없으면 제외

## 8. Data Rule

새 상품은 아래 3개 레이어를 모두 채운 뒤 추천 후보로 승격한다.

- `canonical_product`: 안정적인 내부 상품 정체성
- `market_listing`: 실제 판매/제휴/공식 상품 링크와 snapshot
- `product_match_rule`: ingredient, environment, mode, priority 연결

검수 체크리스트:

- ingredient key가 현재 `INGREDIENTS`에 존재한다.
- listing title이 canonical product 의도와 일치한다.
- environment가 `bathtub` 또는 `shower`로 명확하다.
- contraindication flag가 필요한 경우 ingredient 또는 catalog에 반영되어 있다.
- purchase URL과 research source가 분리되어 있다.
- 앱 카피는 "완화에 도움", "루틴 맥락에 적합" 수준으로 쓰고 치료 보장 표현을 피한다.

Market policy:

- `coupang`, `naver_smartstore`, `kurly`, `oliveyoung`, `official_store`, `danawa`, `other`를 후보 마켓으로 허용한다.
- 컬리, 올리브영, 공식몰은 큐레이터/제휴 수익화 또는 브랜드 적합성이 있으면 적극 유지한다.
- `listing.sourceUrl`에는 직접 구매 또는 제휴 가능한 상품 URL을 우선 넣는다.
- 리뷰, 가격비교, 검색, 기사, 리서치 문서는 source note에 남기고 구매 CTA의 primary URL로 쓰지 않는다.
- 실제 URL이 placeholder거나 검색 결과뿐이면 `hold`로 두고 실제 상품 URL 확보 후 승격한다.

## 9. Decision Defaults

- 판단이 애매하면 Product 탭 노출보다 추천 슬롯 제외를 우선한다.
- Care와 Trip이 충돌하면 Care의 안전/상황 적합성을 우선한다.
- 샤워 사용자는 욕조 전용 제품으로 전환 유도하지 않고 샤워 전용 대안을 먼저 보여준다.
- 추천 이유는 성분 효과보다 "이 루틴에서 어떤 역할을 하는지"로 설명한다.
