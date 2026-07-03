# Tier 1 Verification Batch 06 Segment 251-260 Report

## Scope

- Date: 2026-07-03
- Target file: `tier1_verification_batch_06_target_v0_1_2026-07-03.csv`
- Segment file: `tier1_verification_batch_06_segment_251_260_v0_1_2026-07-03.csv`
- Queue range: accommodation 251-260
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
| queue coverage | 251-260, no gaps |

## Key Findings

- All 10 rows remain valid deep-review candidates. The segment is strong for bath-product diversity: private-bath ryokan, sea-view public baths, high-end room-bath inns, large bath-village hotels, luxury resort spas, and day-use-like footbath resort facilities.
- `湯めぐりの宿 吉春` is a high-value bath-variety candidate. It has 5 private open-air baths, 10 room-open-air baths, public baths, stone sauna, and footbath, so review counting must split private bath, room bath, and facility-wide bath variety.
- The Kaike cluster requires exact source and operation labels. `華水亭` is sea-view public bath plus room-open-air/self-source positioning. `やど紫苑亭` is a premium 10-room property with room baths and a paid/limited private source-flow bath. `皆生游月` has all-room ocean-view onsen open-air baths but official FAQ says public/sky baths are circulation and room terrace baths are fill-and-use, not source-flow.
- `皆生温泉 海色・湯の宿 松月` has a likely slug cleanup issue: the row slug is `kaike-yurari`, but the verified Japanese name and official site are `皆生松月`. Keep the candidate, but fix identity before final publication.
- `戸田家` is a large bath-village style property. The important signal is not room bath but many free/paid private baths, public baths, family travel, and large-hotel flow.
- Shirahama rows are all valuable but very different: `ホテル川久` is luxury spa/resort, `HOTEL SEAMORE` is sea-view source-flow public bath plus footbath/day-use-like resort, and `柳屋` is family-oriented source-flow ryokan with room-type differences.
- `柳屋` needs room-type source separation. Official and ryokan-association surfaces indicate both hot-spring open-air rooms and heated-water semi-open-air rooms exist, so room-bath claims must not be generalized across all rooms.
- `ホテル瑞鳳` should be split from `迎賓館 櫻離宮`. The main building is a very large public-bath/buffet hotel, while Sakurarikyu adds room open-air and quieter luxury signals.

## Cleanup / Follow-Up Queue

| slug | issue | next action |
|---|---|---|
| `kaike-yurari` | Slug does not match verified property `皆生松月`. | Rename or merge under `kaike-shogetsu` after checking original source. |
| `kaike-yugetsu` | Room bath is onsen but not source-flow; public/sky baths are circulation. | Split `room_open_air_onsen_tameyu`, `public_bath_circulation`, and sea-view signals. |
| `kaike-shiontei` | Paid/limited private bath can be confused with included room bath. | Separate room bath from extra paid private source-flow bath. |
| `shirahama-yanagiya` | Hot-spring room open-air and heated-water semi-open-air room types coexist. | Tag by exact room type before review-signal counting. |
| `shirahama-key-terrace` | Accommodation and day-use resort flows overlap. | Separate public bath, footbath, sauna, day-use, residence access, and ocean-view lounge. |
| `akiu-hotel-zuiho` | Main hotel and Sakurarikyu have different bath propositions. | Split main public baths, Sakurarikyu room open-air, crowding, and buffet flow. |
| `toba-todaya` | Many free/paid private baths and public baths in one review pool. | Split free private bath, paid private bath, bath village, public bath, family crowding. |

## Data Quality Note

This segment reinforces a core Bathtime rule: `露天風呂付き客室` is not enough as a data field. The useful distinction is whether the room bath is hot spring, source-flow, fill-and-use, circulation, or heated water, and whether the strongest user value is actually a public view bath, private bath, footbath, or resort flow. Batch 06 should keep this granularity through the remaining ranks.
