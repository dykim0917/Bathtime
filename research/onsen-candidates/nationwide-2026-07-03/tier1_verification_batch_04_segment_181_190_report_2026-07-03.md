# Tier 1 Verification Batch 04 Segment 181-190 Report

## Scope

- Date: 2026-07-03
- Target file: `tier1_verification_batch_04_target_v0_1_2026-07-03.csv`
- Segment file: `tier1_verification_batch_04_segment_181_190_v0_1_2026-07-03.csv`
- Queue range: accommodation 181-190
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
| queue coverage | 181-190, no gaps |

## Key Findings

- All 10 candidates remain valid for deep review. This segment is especially strong for room-bath and view-bath modeling.
- `清寂房`, `花鳥風月`, `XYZスペチアーレ`, and `季さら別邸 刻` are room-bath-centered properties. They should not be evaluated with the same lens as large public-bath hotels.
- `花鳥風月` is a clear special case: official information says there is intentionally no large public bath, and each room has a natural onsen semi-open-air bath. This is a pure private-room-onsen model.
- `浜千鳥の湯 海舟` and `ホテル三楽荘` are broader Shirahama bath products. They combine room baths with public baths, open-air baths, private baths, mixed bathing, or multiple sources.
- `だいこんの花` is not only a room-bath candidate. Its shared/private bath system is strong enough that some review surfaces suggest a room open-air bath may not be necessary.
- `磯はなび` is more of a Toyama Bay view-public-bath candidate than a room-bath candidate. View/weather expectation should be tracked.

## Cleanup / Follow-Up Queue

| slug | issue | next action |
|---|---|---|
| `toba-kisara-bettei-toki` | Room indoor bath, open-air bath, and footbath all appear. | Split room bath products before deep review. |
| `toyako-lake-suite-konosisu` | Room bath temperature adjustment issue appears. | Track room-bath hotness/adjustment and sky public bath separately. |
| `shirahama-kachofugetsu` | No public bath by design. | Model as room_bath/room_open_air_bath-only property. |
| `shirahama-kaishu` | Mixed bath, private bath, public bath, and room bath coexist. | Build bath-area matrix before sampling reviews. |
| `shirahama-xyz-speciale` | Room-bath-only luxury product with strong non-bath staging. | Separate bath quality from price, show, car, and novelty signals. |
| `zao-daikon-no-hana` | Private/shared baths may outweigh room baths. | Deep review should compare room bath, large bath, and 4 private open-air baths. |
| `amaharashi-iso-hanabi` | Satisfaction depends heavily on Toyama Bay/Tateyama view. | Track weather/view dependency and public-bath view value. |

## Data Quality Note

This segment confirms why Bathtime's bath-area schema is valuable. A simple "room open-air bath available" flag would flatten very different products: no-public-bath private-room inns, source-flow room baths, facility-like multi-bath resorts, and view-driven public-bath hotels. Deep review should begin only after these bath-area differences are locked.
