# Tier 1 Verification Batch 03 Segment 121-130 Report

## Scope

- Date: 2026-07-03
- Segment file: `tier1_verification_batch_03_segment_121_130_v0_1_2026-07-03.csv`
- Queue range: accommodation 121-130, facility 121-130
- Mode: Tier 1 candidate verification, not deep review-signal tagging

## QA

| check | result |
|---|---:|
| total rows | 20 |
| accommodation rows | 10 |
| facility rows | 10 |
| missing official_url | 0 |
| missing primary_review_or_ota_url | 0 |
| missing source_urls | 0 |
| duplicate kind + queue_rank | 0 |

## Key Findings

### Accommodation

- Zao/Yamagata is a strong sulfur-source cluster in this segment. `蔵王国際ホテル` and `深山荘高見屋` both remain Tier 1 deep-review candidates because official and OTA surfaces repeatedly expose milky sulfur, source-flow/source-owned language, snow-view open-air value, and old-inn access friction such as stairs.
- Tamatsukuri entries need bath-area separation. `湯之助の宿 長楽園` is driven by the large mixed garden open-air bath and bathing-wear expectation, while `佳翠苑皆美` and `玉造グランドホテル長生閣` should be tagged around beauty-water framing, bath variety, and `めのう風呂`.
- Echigo Yuzawa/Senami entries are useful for room-bath and source-flow comparison. `四季Yuzawa QUATTRO` is clearly room open-air centered, `御湯宿 中屋` and `雪国の宿 高半` surface source-flow value, and `瀬波グランドホテル はぎのや` has a large visible review pool that should be useful for later signal sampling.
- `ryugon` should not be treated as an all-room-bath property. It needs room-type bath detail checking before deep review tagging.

### Facility

- `酸ヶ湯温泉 ヒバ千人風呂` is a high-priority facility candidate with a distinctive mixed, large cypress bath model. It needs separate handling for mixed bathing, women-only time, bathing robe expectations, sulfur/acidity, and tourist comfort.
- `皆生温泉 おーゆ・ランド`, `とれとれの湯`, `ホテル華乃湯 日帰り温泉`, and `ふじやま温泉` remain viable facility candidates because they expose clear day-use products and multiple review surfaces.
- `道の駅 ゆ～さ浅虫` requires current operation recheck because the official surface indicates a temporary closure/operation issue for the bath area.
- `戸田家 日帰り温泉` should be held as a facility candidate because official information indicates day-use bathing is currently suspended from 2025-07-01. It can be converted to accommodation-side review research if needed.
- `スパランドホテル内藤` should be kept as a wellness-spa row, not counted as a natural onsen claim without stronger official confirmation. The product is useful, but the ontology should not overstate true onsen value.

## Cleanup / Follow-Up Queue

| slug | issue | next action |
|---|---|---|
| `ryugon` | Bath availability differs by room type. | Check room-type bath matrix before deep review. |
| `asamushi-yu-sa-asamushi` | Official bath operation issue. | Recheck current reopening status before publication. |
| `akiu-zuiho-dayuse` | Hotel day-use rules can change. | Confirm latest day-use hours/rules before user-facing use. |
| `toba-toba-seaside-hotel-dayuse` | Hotel day-use rules can change. | Confirm latest day-use hours/rules before user-facing use. |
| `toba-todaya-dayuse` | Day-use bathing currently suspended. | Hold as facility row or convert to accommodation research. |
| `isawa-spaland` | Wellness spa rather than clearly natural onsen. | Keep but label as wellness_spa; avoid true-onsen implication. |

## Data Quality Note

This segment verifies identity, official/product surfaces, and review-pool surfaces only. It does not yet prove review-signal strength. Deep review work should later count directly read reviews separately from visible platform review volume, with extra attention to source-flow feeling, chlorine/weak onsen signals, mixed-bath confusion, day-use rule volatility, and facility-specific crowding or queue friction.
