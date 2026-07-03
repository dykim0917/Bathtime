# Tier 1 Verification Batch 06 Complete Report

## Scope

- Date: 2026-07-03
- Target file: `tier1_verification_batch_06_target_v0_1_2026-07-03.csv`
- Complete file: `tier1_verification_batch_06_complete_v0_1_2026-07-03.csv`
- Queue range: accommodation 251-284
- Mode: Tier 1 candidate verification, not deep review-signal tagging

## QA

| check | result |
|---|---:|
| total rows | 34 |
| accommodation rows | 34 |
| missing official_url | 0 |
| missing primary_review_or_ota_url | 0 |
| missing source_urls | 0 |
| duplicate kind + queue_rank | 0 |
| queue coverage | 251-284, no gaps |

## Verification Result Distribution

| verification_result | rows |
|---|---:|
| official_and_high_volume_ota_bath_surface_confirmed | 26 |
| official_and_multi_ota_bath_surface_confirmed | 4 |
| official_and_high_volume_multi_ota_bath_surface_confirmed | 3 |
| official_and_multi_review_surface_confirmed | 1 |

## Key Findings

- Batch 06 completes the remaining 34 accommodation Tier 1 candidates. The segment covers Izu Nagaoka, Kaike, Toba, Shirahama, Akiu, Isawa, Kawaguchiko, Dogo, Kinugawa, Nasu, Yugawara, Ikaho, Yuda, Iizaka, Awara, and Bessho.
- Several rows require identity cleanup before publication: `kaike-yurari` should likely be `kaike-shogetsu` for `皆生温泉 海色・湯の宿 松月`.
- Several rows require room-bath source caution: `皆生游月` room terrace baths are onsen but fill-and-use, not source-flow; public/sky baths are circulation. `篝火の湯 緑水亭` room open-air may not be onsen. `柳屋` has both hot-spring open-air rooms and heated-water semi-open-air rooms.
- Large resort/facility-style candidates are concentrated in this batch: `戸田家`, `HOTEL SEAMORE`, `ホテル瑞鳳`, `日光きぬ川ホテル三日月`, `ホテルサンバレー那須`, and `清風荘`.
- Strong room-onsen candidates remain valuable: `やど紫苑亭`, `柳屋`, `那須別邸 回`, `鬼怒川金谷ホテル`, `千明仁泉亭`, `ホテル木暮`, and `湯めぐりの宿 吉春`.
- Accommodation/facility hybrid candidates should bridge into the facility model: `大丸温泉旅館` for river-like open-air bath, `酸ヶ湯温泉旅館` from Batch 05, and large resort/spa rows such as `ホテルサンバレー那須` and `HOTEL SEAMORE`.

## Cleanup / Follow-Up Queue

| slug | issue | next action |
|---|---|---|
| `kaike-yurari` | Verified property is `皆生松月`. | Rename to `kaike-shogetsu` or merge after checking original source. |
| `kaike-yugetsu` | Public/sky baths are circulation; room baths are fill-and-use. | Split circulation, fill-and-use, sea-view and source-flow status. |
| `akiu-ryokusuitei` | Room open-air may be non-onsen. | Split non-onsen room bath and public `篝火の湯`. |
| `shirahama-yanagiya` | Hot-spring and heated-water room baths coexist. | Tag by exact room type. |
| `nasu-sunvalley` | Multi-building resort/facility structure. | Split buildings, source types, `湯遊天国`, pool, day-use, and operating schedules. |
| `nasu-omaru` | Facility-like river open-air bath inside lodging. | Add bridge row or cross-reference for facility deep review. |
| `nasu-bettei-kai` | Strong room bath but access/price/service risk. | Expand low-rated sampling for stairs, transport, food value, and service details. |
| `toba-toba-kokusai` | Pearl bath novelty vs weak spring-feeling risk. | Track novelty, water texture, bath variety, and child-meal expectation separately. |

## Data Quality Note

Batch 06 confirms the need for product-level bath modeling before deep review. The final Tier 1 accommodation set is not just a list of good ryokan: it includes large resorts, source-flow room-bath inns, urban public-bath hotels, historic ryokan, view-bath hotels, and accommodation-facility hybrids. Review-signal research should therefore start from bath-area classification, not from property-level ratings.

## Nationwide Verification Status After Batch 06

- Accommodation Tier 1 queue: ranks 1-284 verified in complete batch files.
- Facility Tier 1 queue: ranks 1-143 verified in complete batch files.
- Remaining Tier 1 verification queue: none in the current accommodation/facility Tier 1 queues.
