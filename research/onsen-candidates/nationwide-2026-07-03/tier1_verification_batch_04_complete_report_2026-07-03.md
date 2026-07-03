# Tier 1 Verification Batch 04 Complete Report

## Scope

- Date: 2026-07-03
- Target file: `tier1_verification_batch_04_target_v0_1_2026-07-03.csv`
- Completed segment files:
  - `tier1_verification_batch_04_segment_151_160_v0_1_2026-07-03.csv`
  - `tier1_verification_batch_04_segment_161_170_v0_1_2026-07-03.csv`
  - `tier1_verification_batch_04_segment_171_180_v0_1_2026-07-03.csv`
  - `tier1_verification_batch_04_segment_181_190_v0_1_2026-07-03.csv`
  - `tier1_verification_batch_04_segment_191_200_v0_1_2026-07-03.csv`
- Mode: Tier 1 accommodation candidate verification, not deep review-signal tagging

## Completion QA

| check | result |
|---|---:|
| target rows | 50 |
| verified rows | 50 |
| accommodation rows | 50 |
| facility rows | 0 |
| missing official_url | 0 |
| missing primary_review_or_ota_url | 0 |
| missing source_urls | 0 |
| duplicate kind + queue_rank | 0 |
| accommodation rank coverage | 151-200, no gaps |

## Batch-Level Findings

- Batch 04 completes accommodation Tier 1 ranks 151-200. Combined with earlier complete batches, accommodation ranks 1-200 and facility ranks 1-143 now have verified official/review-surface rows.
- This batch is heavily room-bath-oriented, but the detail matters. Some properties are pure room-onsen models (`花鳥風月`, `清寂房`, `季さら別邸 刻`), some combine room baths with major public baths (`浜千鳥の湯 海舟`, `ホテル三楽荘`, `古窯`), and some are better treated as view-public-bath properties (`やまのは`, `磯はなび`).
- The batch found several caution rows:
  - `和倉温泉 虹と海`: currently closed after the 2024 Noto Peninsula earthquake; planned reopening in fiscal 2026 H2.
  - `銀山温泉 古勢起屋別館`: strong historic/atmosphere value but visible bath satisfaction is weaker and should not be overread.
  - `三朝温泉 斉木別館`: valid radium public-bath candidate, but room-bath onsen status requires room-type confirmation.
  - `Tabist 竹葉新葉亭`: useful but needs current official bath-detail recheck.
  - `松田屋ホテル`: room bath and public/garden baths need source split.
- Isawa emerges as a strong but complex cluster: `富士野屋`, `糸柳`, `糸柳こやど ゆわ`, `かげつ`, and `慶山` all warrant deep review, but each mixes public bath, room bath, source-flow/self-source, medicinal stone bath, garden, or event-heavy lodging signals differently.

## Recommended Next Step

Continue accommodation Tier 1 verification with ranks 201-250. Facilities Tier 1 are already fully covered through rank 143 in the current verification queue, so the next nationwide-list work should focus on remaining accommodation Tier 1 ranks 201-284 unless the user chooses to pause and start deep review sampling.

Deep-review priority candidates from Batch 04:

- `白骨温泉 泡の湯`: mixed milky lukewarm open-air bath.
- `渋温泉 古久屋`: 6-source/9-bath complexity.
- `霧島ホテル`: in-hotel onsen-facility-like bath complex.
- `ホテルまほろば`: 31-bath/multiple-source large bath matrix.
- `花鳥風月`: no-public-bath, all-room natural onsen semi-open-air model.
- `清寂房`: all-room source-flow moor onsen.
- `富士野屋`: guest-room shower and tub also onsen.
- `華やぎの章 慶山`: large review pool and self-source room-open-air claim.

For national candidate quality, verification should continue before deep review at scale because current operation status, room-bath water source, and product splits are still being corrected during verification.
