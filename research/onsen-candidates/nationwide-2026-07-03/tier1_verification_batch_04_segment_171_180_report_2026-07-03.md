# Tier 1 Verification Batch 04 Segment 171-180 Report

## Scope

- Date: 2026-07-03
- Target file: `tier1_verification_batch_04_target_v0_1_2026-07-03.csv`
- Segment file: `tier1_verification_batch_04_segment_171_180_v0_1_2026-07-03.csv`
- Queue range: accommodation 171-180
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
| queue coverage | 171-180, no gaps |

## Key Findings

- This segment adds mixed-quality Tier 1 candidates. Several are strong active candidates, but the batch also surfaces important hold/recheck cases.
- `平成館 しおさい亭`, `定山渓第一寶亭留 翠山亭`, `望楼NOGUCHI登別`, and `季さら` are clear bath-experience candidates. Their later deep review should split room baths, public baths, and view/size/value expectations.
- `銀山温泉 古勢起屋別館` is a good example of why Bathtime should not rely on fame alone. Location and historic atmosphere are strong, but visible review surfaces show weaker bath satisfaction than the ryokan's overall appeal.
- `和倉温泉 虹と海` should be held until reopening. Official information indicates the property is closed after the 2024 Noto Peninsula earthquake and planned to reopen in the second half of fiscal 2026.
- `三朝温泉 斉木別館` is valid as a radium public-bath/large-hotel candidate, but room bath claims need careful separation because some surfaces suggest certain room open-air baths may not be onsen.
- `Tabist 竹葉新葉亭` remains useful but needs a current official/bath-detail recheck. The review surface supports high bath satisfaction, but official bath details are thinner than the other active candidates in this segment.

## Cleanup / Follow-Up Queue

| slug | issue | next action |
|---|---|---|
| `yunokawa-chikuba` | Official URL and detailed bath matrix need recheck. | Verify direct official bath page before deep review. |
| `yunokawa-heiseikan-shiosaitei` | Room open-air bath has size/value complaints. | Deep review should track tub size, sea view, and price expectation gap. |
| `ginzan-kosekiya` | Strong atmosphere but weaker bath score/signals. | Separate historic town/ryokan appeal from bath-quality satisfaction. |
| `wakura-niji-to-umi` | Currently closed; reopening planned fiscal 2026 H2. | Hold until reopening, then reverify as current product. |
| `misasa-saiki-bekkan` | Room bath onsen status may vary. | Confirm room-type bath water source before tagging room_open_air_bath_hot_spring. |
| `toba-kisara` | Private room-bath model, not public-bath model. | Deep review should focus on room indoor bath + room open-air bath, family/maternity/child fit. |

## Data Quality Note

This segment reinforces the national-list cleanup rule: a candidate can be famous, highly reviewed, or OTA-visible and still require holding, splitting, or caution. Later deep review should not collapse overall lodging satisfaction into bath satisfaction, especially for Ginzan atmosphere properties, post-earthquake Wakura properties, and room-bath-heavy private ryokan.
