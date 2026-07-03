# Tier 1 Verification Batch 05 Segment 201-210 Report

## Scope

- Date: 2026-07-03
- Target file: `tier1_verification_batch_05_target_v0_1_2026-07-03.csv`
- Segment file: `tier1_verification_batch_05_segment_201_210_v0_1_2026-07-03.csv`
- Queue range: accommodation 201-210
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
| queue coverage | 201-210, no gaps |

## Key Findings

- This segment is usable, but one duplicate must be merged before final candidate counting: `fujiyoshida-kaneyamaen` and `kawaguchiko-kaneyamaen` are the same `ホテル鐘山苑`. Keep the Fujiyoshida identity as the primary row because the official address is in Fujiyoshida.
- The Kawaguchiko/Fuji cluster is strong for Korean-facing Bathtime use because it contains several room-open-air and view-bath candidates: `ふふ 河口湖`, `湖南荘`, `夢殿`, and `ホテル鐘山苑`.
- `Sunnide Resort ＜ホテル＆湖畔別邸 千一景＞` needs special handling. Reviews indicate the room open-air bath is valuable for Fuji/Kawaguchiko views but may not be hot spring water, while the public bath is the onsen area. Do not tag it as `room_bath_hot_spring` until reconfirmed.
- The Isawa rows show product complexity. `ホテル甲子園` has room open-air, private/family bath, public bath, sauna/ganbanyoku-like facilities, and tablet reservation flow. `和穣苑` is a detached luxury-room candidate, but current room-count surfaces differ by source.
- `湯原温泉 八景` should be kept, but the inn baths and the public `砂湯` across the river must not be merged. Old review surfaces also require a cleanliness/service negative-signal check by date.
- `花巻温泉 佳松園` is a high-quality water-texture candidate. Official and OTA surfaces repeatedly expose self-source and `とろとろ`/slippery water language, making it useful for later `water_texture` signal tagging.

## Cleanup / Follow-Up Queue

| slug | issue | next action |
|---|---|---|
| `kawaguchiko-kaneyamaen` | Duplicate of `fujiyoshida-kaneyamaen`. | Merge into 203 and exclude from unique Tier 1 count. |
| `kawaguchiko-sunnide` | Room open-air bath appears view-oriented and not onsen, while public bath is onsen. | Split room open-air view value from public-bath hot-spring signal. |
| `isawa-wajoen` | Official and OTA room-count surfaces differ. | Recheck current room inventory before final property profile. |
| `isawa-koshien` | Multiple bath/product flows appear in one review pool. | Split room open-air, private/family bath, public bath, sauna/ganbanyoku, and reservation friction. |
| `yubara-aburaya` | Lodging baths and public Sunayu are easy to conflate. | Separate inn bath signals from nearby public sand/open-air bath signals. |
| `hanamaki-kashoen` | Strong water-texture language appears across surfaces. | Prioritize `water_texture`, `public_bath_hot_spring`, and room-open-air source checks in deep review. |

## Data Quality Note

The 201-210 segment has strong identity and official/review-surface coverage, but it should not yet be treated as review-signal data. The most valuable data-quality gain is product separation: room open-air bath, public bath, family/private bath, and nearby public facilities need separate bath-area rows before review counting. Once the duplicate Kaneyamaen row is merged, this segment contributes 9 unique accommodation candidates, with 8 likely ready for deep review and 1 requiring room-bath source reclassification.
