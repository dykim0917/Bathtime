# Tier 1 Verification Batch 04 Segment 191-200 Report

## Scope

- Date: 2026-07-03
- Target file: `tier1_verification_batch_04_target_v0_1_2026-07-03.csv`
- Segment file: `tier1_verification_batch_04_segment_191_200_v0_1_2026-07-03.csv`
- Queue range: accommodation 191-200
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
| queue coverage | 191-200, no gaps |

## Key Findings

- All 10 candidates remain usable for deep review, but they represent different bath models: view-public-bath hotels, room-bath luxury ryokan, self-source large ryokan, and medicinal-stone/spa-like products.
- `宇奈月温泉 やまのは` and `宇奈月温泉 延楽` are both Kurobe Gorge view-bath candidates. `やまのは` leans large public-bath/buffet hotel, while `延楽` leans premium ryokan with room open-air options.
- `松田屋ホテル` needs bath-area splitting. Garden open-air/public baths are valid, but older surfaces suggest room-bath water source can differ by building.
- `日本の宿 古窯` and `名月荘` are strong Kaminoyama candidates. `古窯` has high-volume public/room-bath review surfaces; `名月荘` is a quieter luxury property with room bath, family bath, private open-air, and seasonal temperature nuance.
- The Isawa cluster is high-value for Bathtime because official sources repeatedly expose self-source or room-bath details. `富士野屋` is especially distinctive because even guest-room tubs/showers are presented as 100% natural onsen.

## Cleanup / Follow-Up Queue

| slug | issue | next action |
|---|---|---|
| `yuda-matsudaya` | Room-bath water source may differ by building. | Split public bath, garden open-air, family/private bath, and room bath before deep review. |
| `kaminoyama-meigetsuso` | Winter room bath temperature note appears. | Track room-bath temperature and seasonal comfort separately. |
| `isawa-fujinoya` | Guest-room shower/tub also onsen, but pressure can be weak. | Tag room_bath_hot_spring and water-pressure/amenity friction separately. |
| `isawa-itoyanagi` | Medicinal stone bath may dominate review signals. | Separate onsen bath, private bath, and ganbanyoku/yakuseki experience. |
| `isawa-kagetsu` | Main ryokan and pet-luxury annex differ. | Keep `別邸 The ONE` as separate product if deep reviewed. |
| `isawa-keizan` | Large review pool and event-heavy lodging. | Split public bath, room open-air, source-flow claim, and taiko/food/service signals. |

## Data Quality Note

This final Batch 04 segment is clean on identity and official/review-surface coverage. The main risk is not missing URLs but over-flattening bath products. Isawa especially needs product-level bath-area tagging before review-signal counting because self-source public baths, room baths, medicinal stone baths, and event/food-heavy lodging signals appear in the same review pools.
