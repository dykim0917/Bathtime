# Tier 1 Verification Batch 01 Progress Report

Date: 2026-07-03

## Progress

Batch 01 verification now has 47 checked rows.

| source file | rows | accommodation | facility |
|---|---:|---:|---:|
| `tier1_verification_batch_01_sample_v0_1_2026-07-03.csv` | 19 | 9 | 10 |
| `tier1_verification_batch_01_extension_v0_1_2026-07-03.csv` | 28 | 15 | 13 |
| `tier1_verification_batch_01_progress_v0_1_2026-07-03.csv` | 47 | 24 | 23 |

Coverage so far:

- Accommodation queue ranks 1-24.
- Facility queue ranks 1-23.

## New Verification Findings

### Kinosaki Accommodation

Kinosaki rows need careful bath-area separation:

- `川口屋城崎リバーサイドホテル`: association page says `温泉あり`, `家族(貸切)風呂あり`, `客室露天あり`, but `露天風呂なし`. This means the attractive bath signal is not a normal shared open-air bath; it should be modeled as private/rental or room-bath depending on room/product.
- `西村屋本館`: official room page confirms open-air bath rooms; official/association surfaces confirm public baths with open-air components.
- `西村屋ホテル招月庭`: official/Jalan surfaces show public bath, open-air bath, sauna, private spa, and open-air bath rooms. This is a multi-area property.
- `緑風閣`: official/Jalan surfaces indicate open-air bath room availability, but one Kinosaki association page says `客室露天なし`. This needs room-type/date recheck before final publication.

### Gero Accommodation

Gero rows are valuable but need room-type precision:

- `みやこ`: official/Jalan/association surfaces strongly confirm open-air bath rooms.
- `水鳳園`: official and association pages both confirm open-air bath rooms, but room counts differ. Use the latest official room inventory before publication.
- `しょうげつ`: official identity and OTA review surfaces are strong, but exact room-bath categorization needs a second bath-detail pass.
- `月のあかり` and `湯之島館`: identity confirmed/probable, but bath detail remains under-verified in this pass.

### Kurokawa Accommodation / Day-Use Split

Kurokawa needs split modeling:

- The same ryokan may be both an accommodation candidate and a day-use bath candidate.
- `こうの湯`: day-use `森の湯` and accommodation room baths should be treated separately.
- `黒川荘`: day-use status has a maintenance/closure notice on the Kurokawa official day-use status page.
- `奥の湯`: official bath page lists several bath products, with some day-use and some guest-only/time-limited signals.

### Facility Rows

Important facility-specific findings:

- `こうの湯 日帰り入浴`: price differs by surface, so current price verification is required.
- `黒川荘 日帰り入浴`: hold until current maintenance/operation status is clear.
- `幸乃湯`: family bath signal should be treated as currently suspended based on the official site.
- `御座之湯` and `大滝乃湯`: official price-change notices make fresh pricing checks important.
- `Fuua`: product structure is broad: ocean-view standing open-air bath, ganbanyoku/loyly-style relaxation, lounge, cafe. It should be tagged as a large day-use facility, not merely a bath.

## Current Data Quality

The verification pass is already improving the seed quality:

- It catches likely closed or operation-risk rows.
- It reveals official-vs-association inconsistencies.
- It prevents `room open-air bath`, `shared private bath`, `public open-air bath`, and `day-use bath` from being collapsed into one signal.
- It adds operating volatility fields that matter to users: maintenance closure, family-bath suspension, price changes, and congestion pages.

## Remaining T1-01 Work

Still unchecked in T1-01:

- Accommodation ranks 25-50.
- Facility ranks 24-50.

Suggested next split:

1. Accommodation 25-35: Kurokawa continuation and Hakone high-value rows.
2. Facility 24-35: Ito/Izu, Ibusuki, Kurokawa, Hakone, Kusatsu, Atami.
3. Accommodation/facility 36-50: finish T1-01 and create a full batch report.

Do not start deep review sampling until the full T1-01 URL/review-pool pass is complete.
