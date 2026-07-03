# Tier 1 Verification Batch 04 Segment 161-170 Report

## Scope

- Date: 2026-07-03
- Target file: `tier1_verification_batch_04_target_v0_1_2026-07-03.csv`
- Segment file: `tier1_verification_batch_04_segment_161_170_v0_1_2026-07-03.csv`
- Queue range: accommodation 161-170
- Mode: Tier 1 candidate verification, not deep review-signal tagging

## QA

| check | result |
|---|---:|
| total rows | 10 |
| accommodation rows | 10 |
| missing official_url | 0 |
| missing primary_review_or_ota_url | 0 |
| missing source_urls | 0 |
| duplicate kind + queue_rank | 0 |
| queue coverage | 161-170, no gaps |

## Key Findings

- All 10 rows remain valid deep-review candidates. This segment adds dense Kirishima coverage plus two Hokkaido properties with strong room-bath or large-bath signals.
- Kirishima should not be treated as one simple accommodation cluster. `霧島ホテル` is a landmark large-bath/multi-source property; `ラビスタ霧島ヒルズ` and `ふたり静` are room-open-air centered; `旅行人山荘` is private open-air and view-bath centered; `妙見石原荘` and `雅叙苑` are high-end source-flow/room-bath candidates; `天空の森` is a luxury nature-villa product with bath value but very different price expectations.
- `霧島ホテル` is especially useful for Bathtime because it behaves almost like an in-hotel onsen facility: huge garden bath, many sources, and strong review visibility around bath satisfaction.
- `ホテルまほろば` similarly needs facility-like handling inside the accommodation model. The value is not only lodging but 31 bath products, multiple spring qualities, and large family-hotel operation.
- `グランドブリッセンホテル定山渓` is a cleaner room-onsen-view candidate, but later verification should confirm exact room-type coverage because not every third-party surface states all rooms identically.

## Cleanup / Follow-Up Queue

| slug | issue | next action |
|---|---|---|
| `kirishima-gajoen` | Small high-end review pool; strong non-bath food/nature signals. | Deep review should separate in-room onsen bath from rustic luxury/food experience. |
| `kirishima-hotel` | Large in-hotel bath complex. | Tag bath variety, source variety, crowding, mixed-area rules, and source-flow feeling separately. |
| `kirishima-ryokojin-sanso` | Private open-air reservation rules matter. | Capture free lodging-guest slot, day-use/private-bath rules, and booking friction. |
| `kirishima-tenku-no-mori` | Very high price and villa product can distort satisfaction language. | Track price-value contradiction separately from open-air bath experience. |
| `jozankei-grand-blissen` | Room onsen coverage needs exact room-type confirmation. | Verify whether all rooms or most rooms have onsen view bath before user-facing use. |
| `noboribetsu-mahoroba` | Accommodation with facility-scale baths. | Treat 31 baths and multiple spring qualities as internal facility matrix. |

## Data Quality Note

This segment verifies candidate identity, official bath facts, and visible review surfaces. It does not yet count directly read review volume. For later review-signal research, Kirishima and Noboribetsu should be sampled with bath-type strata because public baths, room baths, private baths, and non-bath luxury/service signals are heavily mixed in the same platform pools.
