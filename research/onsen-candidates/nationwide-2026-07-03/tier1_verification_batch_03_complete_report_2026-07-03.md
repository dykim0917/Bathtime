# Tier 1 Verification Batch 03 Complete Report

## Scope

- Date: 2026-07-03
- Target file: `tier1_verification_batch_03_target_v0_1_2026-07-03.csv`
- Completed segment files:
  - `tier1_verification_batch_03_segment_101_110_v0_1_2026-07-03.csv`
  - `tier1_verification_batch_03_segment_111_120_v0_1_2026-07-03.csv`
  - `tier1_verification_batch_03_segment_121_130_v0_1_2026-07-03.csv`
  - `tier1_verification_batch_03_segment_131_140_v0_1_2026-07-03.csv`
  - `tier1_verification_batch_03_segment_141_150_v0_1_2026-07-03.csv`
- Mode: Tier 1 candidate verification, not deep review-signal tagging

## Completion QA

| check | result |
|---|---:|
| target rows | 93 |
| verified rows | 93 |
| accommodation rows | 50 |
| facility rows | 43 |
| missing official_url | 0 |
| missing primary_review_or_ota_url | 0 |
| missing source_urls | 0 |
| duplicate kind + queue_rank | 0 |
| accommodation rank coverage | 101-150, no gaps |
| facility rank coverage | 101-143, no gaps |

## Batch-Level Findings

- Batch 03 materially improves the national Tier 1 candidate pool by adding verified official and review-surface links for 93 candidates.
- Several candidates are ready for deep review pool counting, especially Zao sulfur lodgings, Tsukioka emerald sulfur lodgings, Nyuto Onsenkyo symbolic bath lodgings, Nozawa source-character lodgings, and strong public-bath facilities such as `酸ヶ湯`, `鹿の湯`, `伊香保露天風呂`, `波来湯`, and `日光山温泉寺`.
- The batch also identified rows that must not be treated as ordinary active candidates:
  - `和倉温泉 加賀屋`: hold until planned reopening at the end of fiscal 2027.
  - `湯田温泉 亀乃湯`: old public bath closed; reidentify to successor/current facilities if needed.
  - `鬼怒川公園岩風呂`: officially closed on 2024-03-31.
  - `戸田家 日帰り温泉`: day-use suspended as of official notice in the prior segment.
  - `黒湯温泉`: active candidate but needs latest operation check due seasonal/roof-repair issue.
- Facility rows increasingly require product-model labels. Some are full day-use complexes, some are public communal baths, some are route/pass or outer-bath products, and some are wellness-spa candidates. Treating them as one facility type would weaken Bathtime's data quality.

## Recommended Next Step

Batch 03 is complete. The next candidate-verification step should either:

1. Move to the next Tier 1 verification batch after facility rank 143 and accommodation rank 150, or
2. Pause verification and start deep review-signal sampling on the strongest verified clusters:
   - Nyuto Onsenkyo: `鶴の湯`, `妙乃湯`, `蟹場`, `黒湯`, `休暇村`
   - Tsukioka: `白玉の湯 華鳳`, `月岡温泉 摩周`
   - Facility model samples: `酸ヶ湯`, `鹿の湯`, `伊香保露天風呂`, `波来湯`

For the national candidate objective, continuing verification is still recommended before deep review at scale because operation status, duplicate identity, and route/pass rows continue to surface during verification.
