# Tier 1 Verification Batch 04 Segment 151-160 Report

## Scope

- Date: 2026-07-03
- Target file: `tier1_verification_batch_04_target_v0_1_2026-07-03.csv`
- Segment file: `tier1_verification_batch_04_segment_151_160_v0_1_2026-07-03.csv`
- Queue range: accommodation 151-160
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
| queue coverage | 151-160, no gaps |

## Key Findings

- This segment is unusually strong for bath-led accommodation research. All 10 rows have official bath facts and multiple review/OTA surfaces suitable for later deep review pool counting.
- `旅館さかや` is a clean Nozawa self-source candidate. The official and OTA surfaces support a distinction between in-house self-source value and Nozawa's public outer-bath culture.
- Shirahone entries split into different user expectations. `泡の湯` is dominated by the huge mixed, milky, lukewarm open-air bath; `湯元齋藤旅館` is a broader luxury-yumoto property with multiple bath areas and private open-air bath products.
- Shibu/Yudanaka entries need careful bath-area modeling. `金具屋` and `古久屋` have strong in-house bath variety and source claims, while `さかえや`, `あぶらや燈千`, and `ホテル椿野` lean more toward room open-air, view bath, private bath, sauna, service, and outer-bath access.
- Misasa entries are useful for radium-focused comparison. `依山楼岩崎` should be treated as a large bath-circuit/radium inhalation/drinking-spring candidate; `万翆楼` is a higher-end room-bath/radium candidate with a smaller but useful review pool.

## Cleanup / Follow-Up Queue

| slug | issue | next action |
|---|---|---|
| `shirahonet-onsen-awano-yu` | Mixed-bath and lukewarm-bath expectations dominate. | Deep review should stratify mixed-bath comfort, women-only/yuami use, winter coldness, and long-bath satisfaction. |
| `shibu-kanaguya` | Historic-building value can obscure bath signals. | Separate architecture/stairs/old-room friction from in-house bath and outer-bath signals. |
| `shibu-kokuya` | Multiple sources and bath areas create tagging complexity. | Split 6-source/9-bath claims, room baths, private-like use, and Shibu outer-bath access. |
| `yudanaka-aburaya-tousen` | Experience-heavy modern ryokan. | Separate room open-air, public open-air, private open-air, sauna, rooftop/non-bath experience. |
| `misasa-izanro-iwasaki` | Radium claims include bath, drinking spring, and inhalation. | Tag public bath, drinking_spring, inhalation, and radium-health framing separately. |

## Data Quality Note

This segment does not yet count directly read review volume. It verifies that the 151-160 candidates have enough official and review-surface support to justify deep review. Later sampling should prioritize bath-area separation because many rows combine room baths, public baths, outer baths, private baths, drinking spring, inhalation, and non-bath service signals in the same review pool.
