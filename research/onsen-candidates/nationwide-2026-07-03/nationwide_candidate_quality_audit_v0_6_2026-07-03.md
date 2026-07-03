# Nationwide Onsen Candidate Quality Audit v0.6

Date: 2026-07-03

## Current Master State

| master | rows | Tier 1 | Tier 2 | Tier 3 | duplicate_slug_count | bad_core_cells |
|---|---:|---:|---:|---:|---:|---:|
| accommodation v0.6 | 423 | 284 | 127 | 12 | 0 | 0 |
| facility v0.6 | 228 | 143 | 78 | 7 | 0 | 0 |
| total | 651 | 427 | 205 | 19 | 0 | 0 |

This is now a usable **national candidate seed list**. It is not yet a verified publication database.

## What The Dataset Can Support Now

- 전국 단위 후보군을 숙소와 온천시설로 분리해서 볼 수 있다.
- Tier 1 심층 리뷰 리서치 우선순위를 잡을 수 있다.
- 지역별 공백을 확인하고 다음 후보 확장 배치를 설계할 수 있다.
- 숙소형 데이터와 시설형 데이터를 섞지 않고, 객실탕/대욕장/외탕/공동탕/족욕/모래탕/가족탕을 다른 모델로 다룰 수 있다.

## What It Cannot Support Yet

- 사용자에게 공식 정보처럼 노출할 수 없다.
- 숙소별 공식 URL, Google Maps URL, OTA URL, 플랫폼별 리뷰 수가 행 단위로 확정되어 있지 않다.
- `source_basis`는 후보 발굴 근거이지 최종 출처 인용이 아니다.
- `initial_bath_signals`와 `initial_onsen_facility_signals`는 후보 단계의 신호이며, 후기 기반 확정 태그가 아니다.
- 일부 시설은 숙박시설의 당일입욕 상품일 수 있어, 독립 온천시설인지 재분류가 필요하다.

## Verification Status Snapshot

Accommodation v0.6:

| status | rows |
|---|---:|
| needs_official_crosscheck | 237 |
| needs_bath_detail_crosscheck | 89 |
| needs_source_crosscheck | 82 |
| needs_identity_crosscheck | 10 |
| needs_review_pool_crosscheck | 2 |
| needs_area_crosscheck | 2 |
| new_property_monitor | 1 |

Facility v0.6:

| status | rows |
|---|---:|
| needs_official_crosscheck | 95 |
| needs_source_crosscheck | 77 |
| needs_review_pool_crosscheck | 36 |
| needs_official_detail_crosscheck | 9 |
| official_checked | 4 |
| sample_done_needs_deep_tagging | 3 |
| needs_area_crosscheck | 2 |
| needs_identity_crosscheck | 1 |
| needs_current_operation_crosscheck | 1 |

## Tier 1 Verification Queues

Generated queue files:

- `tier1_accommodation_verification_queue_v0_1_2026-07-03.csv`
- `tier1_facility_verification_queue_v0_1_2026-07-03.csv`

Queue summary:

| queue | rows | batches | P0 | P1 | P2 |
|---|---:|---:|---:|---:|---:|
| Tier 1 accommodation | 284 | 6 batches of up to 50 | 1 | 217 | 66 |
| Tier 1 facility | 143 | 3 batches of up to 50 | 1 | 109 | 33 |

Priority meanings:

- `P0`: identity or area ambiguity must be resolved before further research.
- `P1`: official facts, bath/product details, map listing, and review-pool counts must be checked before deep review research.
- `P2`: lower-risk source/map/review-pool verification.

## Required Checks Before Deep Review Research

For accommodations:

1. Official site URL.
2. Google Maps URL and visible review count.
3. Rakuten / Jalan / Ikkyu / Agoda or Booking URL where relevant.
4. Platform-visible review counts by source.
5. Official bath facts: room bath, room open-air bath, public bath, private/family bath, source-flow claims.
6. Rename / alias / duplicate listing check.

For facilities:

1. Official or municipal/tourism URL.
2. Google Maps URL and visible review count.
3. Nifty Onsen / Jalan / 4travel / Tripadvisor URL where relevant.
4. Product structure: public bath, open-air bath, family/private bath, sand bath, steam bath, footbath, food/steam, bath-pass route.
5. Current operation volatility: holidays, reception close, seasonal closures, guest-only restrictions.
6. Whether the row is an independent facility or an accommodation day-use product.

## Recommended Next Batch

Start with Tier 1 queue batch `T1-01` rather than adding more candidates.

Suggested first verification workload:

| workstream | file | batch | rows | reason |
|---|---|---|---:|---|
| accommodation | `tier1_accommodation_verification_queue_v0_1_2026-07-03.csv` | T1-01 | 50 | Covers high-demand regions and many official-crosscheck rows. |
| facility | `tier1_facility_verification_queue_v0_1_2026-07-03.csv` | T1-01 | 50 | Includes public baths and facility rows with stronger user-facing decision value. |

After T1-01 verification, create `verified_candidate_master_v0_1` with official URLs and review-pool counts. Deep review-signal collection should begin only after that verified master exists.
