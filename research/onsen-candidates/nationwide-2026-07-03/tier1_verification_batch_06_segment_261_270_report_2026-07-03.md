# Tier 1 Verification Batch 06 Segment 261-270 Report

## Scope

- Date: 2026-07-03
- Target file: `tier1_verification_batch_06_target_v0_1_2026-07-03.csv`
- Segment file: `tier1_verification_batch_06_segment_261_270_v0_1_2026-07-03.csv`
- Queue range: accommodation 261-270
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
| queue coverage | 261-270, no gaps |

## Key Findings

- All 10 rows remain valid deep-review candidates, but most need product-level splitting before any review signal is counted.
- `篝火の湯 緑水亭` is the clearest caution row in this segment. Review surfaces indicate some room open-air baths may not be hot spring water, while the public/open-air bath is the actual hot-spring value. Do not tag it as `room_bath_hot_spring` without room-type confirmation.
- `ホテルふじ` is a large-public-bath candidate rather than a room-bath-first candidate. Its value is the large rock bath, garden bath, open-air baths, and paid private view baths.
- The Kawaguchiko rows split three ways: `富士レークホテル` has natural hot spring plus accessibility/room-view value, `THE KUKUNA` is view-resort oriented where Fuji/Lake view can overpower water-character signals, and `花水庭 おおや` has room-open-air and top-floor view bath but needs shower-pressure checks.
- Dogo rows have very different bath propositions. `道後舘` is room-open-air plus classic ryokan service; `ふなや` is heritage/public-bath/garden-ryokan; `ホテル古湧園 遥` is a modern hotel with strong location near Dogo Honkan and smoother water-texture signals.
- Kinugawa rows are operationally complex. `界 鬼怒川` has brand/luxury expectations and visible cleanliness negatives in bath-adjacent areas. `日光きぬ川ホテル三日月` is a large family resort where spa/pool maintenance, room type, and public bath satisfaction must be separated.

## Cleanup / Follow-Up Queue

| slug | issue | next action |
|---|---|---|
| `akiu-ryokusuitei` | Room open-air may not be onsen. | Split non-onsen room open-air from public `篝火の湯` and large bath satisfaction. |
| `isawa-hotel-fuji` | Large public bath dominates property value. | Tag large rock bath, garden bath, open-air, private view bath, buffet/crowding separately. |
| `kawaguchiko-fuji-lake` | Accessibility and view signals are mixed with bath signal. | Split public bath, room open-air, bath lift/accessibility, and Fuji/lake view. |
| `kawaguchiko-kukuna` | View may be stronger than water-character signal. | Separate Fuji/lake view, room open-air/jacuzzi, public bath, food/resort satisfaction. |
| `kawaguchiko-ooya` | Room open-air shower pressure issue appears. | Track room bath water pressure and top-floor view bath separately. |
| `dogo-dogokan` | Bath satisfaction and transport friction both appear. | Keep taxi/airport transfer friction separate from room-bath signal. |
| `dogo-funaya` | Heritage, garden, and room-meal signals can obscure bath signal. | Split public bath, open-air, sauna, footbath, onsen room, heritage/garden. |
| `dogo-kowakuen-haruka` | Modern hotel/location value may dominate. | Split large bath, lying bath, Dogo Honkan access, temperature, water texture, buffet criticism. |
| `kinugawa-kai` | Brand expectations and cleanliness negatives appear. | Expand low-rated sampling for drain mold, dust, food/drink value, and bath-area cleanliness. |
| `kinugawa-mikazuki` | Spa/pool maintenance and family-resort flow are central. | Split public bath, room open-air, garden spa, pool, maintenance notices, child crowding. |

## Data Quality Note

This segment is useful because it exposes the failure mode of a simple `객실 노천탕 있음` field. Several candidates have room open-air baths that are non-onsen, room-type-specific, or less important than public baths, views, accessibility, spa facilities, or location. For Bathtime, the next stage should require exact bath-area tagging before review sampling.
