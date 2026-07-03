# Tier 1 Verification Batch 03 Segment 141-150 Report

## Scope

- Date: 2026-07-03
- Segment file: `tier1_verification_batch_03_segment_141_150_v0_1_2026-07-03.csv`
- Queue range: accommodation 141-150, facility 141-143
- Mode: Tier 1 candidate verification, not deep review-signal tagging

## QA

| check | result |
|---|---:|
| total rows | 13 |
| accommodation rows | 10 |
| facility rows | 3 |
| missing official_url | 0 |
| missing primary_review_or_ota_url | 0 |
| missing source_urls | 0 |
| duplicate kind + queue_rank | 0 |

## Key Findings

### Accommodation

- `瑠璃光` and `ゆのくに天祥` are large Yamashiro candidates with many bath products. They should be handled as bath-variety properties rather than pure source-character properties. `瑠璃光` especially needs room-type separation because some room baths may differ in whether they are onsen.
- Nyuto Onsenkyo is one of the strongest deep-review clusters in the national list. `蟹場温泉`, `妙乃湯`, `鶴の湯温泉`, and `鶴の湯別館 山の宿` all expose distinctive bath identity, not just generic lodging value.
- `黒湯温泉` remains a high-value candidate but requires operation recheck. Official information shows seasonal operation and a 2026 notice about mixed open-air bath roof damage/recovery work.
- `休暇村 乳頭温泉郷` is useful as the accessible/stable Nyuto comparison point, with two springs and easier facilities than the more rustic inns.
- Nozawa entries are deep-review-ready for room-bath and source-character comparison. `野沢グランドホテル` should track hot-source and room-open-air size expectations; `河一屋旅館` should track two-source use, room baths, and yuno-hana/sulfur signals.

### Facility

- `飯坂温泉 波来湯` is a strong public-bath facility candidate: station-adjacent, rebuilt, source-flow hot bath plus adjusted warm bath, and clear local-bath expectations such as no included soap/shampoo.
- `別所温泉 石湯` and `別所温泉 大師湯` should be treated as outer-bath route/communal bath products. They are useful for Bathtime, but not comparable to full day-use spa facilities.
- `石湯` has stronger built-environment/history appeal; `大師湯` has stronger simple-local-bath and sulfur/egg-smell signals on the review surface.

## Cleanup / Follow-Up Queue

| slug | issue | next action |
|---|---|---|
| `nyuto-kuroyu` | Seasonal operation and 2026 mixed open-air roof-repair notice. | Recheck latest official operation before deep review or publication. |
| `yamashiro-rurikoh` | Bath products are broad; room-bath onsen status may differ by room type. | Split public bath, private bath, footbath, and room bath before tagging. |
| `nyuto-tsurunoyu` | Iconic but mixed-bath and day-use crowding can dominate. | Deep review should stratify lodging guests vs day-use visitors. |
| `bessho-ishiyu` | Communal bath/outer-bath route, not full spa. | Mark as public_bath_facility or route child row. |
| `bessho-otsukai-yu` | Very simple local bath with limited amenities. | Model as local public bath; do not oversell as tourist spa. |

## Data Quality Note

This segment completes Batch 03 verification. It confirms that several Tier 1 candidates are not just high-rating accommodations but bath-experience anchors: Nyuto mixed baths, Nozawa two-source lodging, Iizaka communal hot baths, and Bessho outer-bath route products. Later deep review should prioritize bath-area tagging and operation freshness over raw review volume.
