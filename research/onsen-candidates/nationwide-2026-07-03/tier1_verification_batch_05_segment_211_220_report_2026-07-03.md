# Tier 1 Verification Batch 05 Segment 211-220 Report

## Scope

- Date: 2026-07-03
- Target file: `tier1_verification_batch_05_target_v0_1_2026-07-03.csv`
- Segment file: `tier1_verification_batch_05_segment_211_220_v0_1_2026-07-03.csv`
- Queue range: accommodation 211-220
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
| queue coverage | 211-220, no gaps |

## Key Findings

- All 10 rows remain valid Tier 1 deep-review candidates. The segment has no identity duplicates, but it contains several properties that must be split by bath area before review counting.
- The Dogo cluster is especially strong for Bathtime because `琴の庭`, `道後御湯`, `別邸 朧月夜`, and `八千代` all expose room-open-air or all-room hot-spring bath propositions on official/OTA surfaces.
- `琴の庭` and `八千代` are clean room-bath candidates because source-flow or guest-room onsen claims are visible in official/OTA surfaces. `道後御湯` adds a separate top-floor view bath/lounge experience, and `朧月夜` needs privacy/garden/insect checks in addition to room open-air satisfaction.
- `大沢温泉 山水閣` is not a simple room-bath property. Its value is the bath-route structure across Sansuikaku, self-catering/toji areas, private family baths, women-only time for mixed open-air bath, and riverside scenery. It needs bath-area splitting before deep review.
- `赤倉観光ホテル` is a strong source-flow and view-bath candidate. Official and OTA surfaces repeatedly expose source-flow natural hot spring, highland view, public open-air bath, sauna, and room open-air options.
- `鬼怒川温泉 あさや` should be treated mainly as a large public-bath/view-bath hotel. Its strongest signal is the rooftop `空中庭園露天風呂`, not a room-bath proposition.
- `きぬ川不動瀧` remains useful but lower-volume and more polarity-prone than the others. Room open-air size, service tone, and food-led satisfaction should be checked carefully.

## Cleanup / Follow-Up Queue

| slug | issue | next action |
|---|---|---|
| `hanamaki-osawa-onsen` | Multiple baths and toji/public-like areas in one property. | Split Sansuikaku-only baths, self-catering/toji baths, mixed open-air, private family baths, and day-use area. |
| `hanamaki-yusen-shidate` | Room open-air and public bath temperature signals can diverge. | Track room bath lukewarm complaints separately from public bath satisfaction. |
| `tsunagi-shikitei` | Family/child-friendly signals appear beside hot-spring signals. | Separate source-flow room open-air, public bath, child bath amenities, and access. |
| `dogo-kotononiwa` | Room layout and explanation-flow complaints appear in review surfaces. | Keep room-bath quality separate from lodging-operation friction. |
| `dogo-miyu` | Public bath may feel small because all rooms have onsen open-air baths. | Compare room onsen vs top-floor view bath/lounging expectations. |
| `dogo-oborozukiyo` | Garden/privacy/insect concerns appear despite high room-bath satisfaction. | Add privacy and seasonal outdoor-bath comfort checks. |
| `myoko-akakura-kanko` | View and weather strongly shape bath satisfaction. | Tag view, sulfur scent, hot-source feeling, and weather/cloud-sea dependency separately. |
| `kinugawa-asaya` | Large hotel/buffet/crowding signals can dominate reviews. | Prioritize rooftop open-air, large baths, private bath, and crowding/flow signals. |
| `kinugawa-fudotaki` | Smaller review surface and service-polarity signals. | Expand low-rated/negative sampling before assigning confidence. |

## Data Quality Note

The 211-220 segment is a strong candidate set for product-level deep review. The main data risk is over-flattening: Dogo room-bath ryokan, Osawa bath-route/toji lodging, Akakura highland source-flow resort, and Asaya large-hotel public bath should not be compared under one generic "onsen hotel" label. For Bathtime, this segment is valuable precisely because the bath decision differs by property: private room onsen, public view bath, source-flow texture, mixed-bath rules, and large-hotel flow all appear in the same ten rows.
