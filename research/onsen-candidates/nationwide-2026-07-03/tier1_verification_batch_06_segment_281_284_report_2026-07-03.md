# Tier 1 Verification Batch 06 Segment 281-284 Report

## Scope

- Date: 2026-07-03
- Target file: `tier1_verification_batch_06_target_v0_1_2026-07-03.csv`
- Segment file: `tier1_verification_batch_06_segment_281_284_v0_1_2026-07-03.csv`
- Queue range: accommodation 281-284
- Mode: Tier 1 candidate verification, not deep review-signal tagging

## QA

| check | result |
|---|---:|
| total rows | 4 |
| accommodation rows | 4 |
| missing official_url | 0 |
| missing primary_review_or_ota_url | 0 |
| missing source_urls | 0 |
| duplicate kind + queue_rank | 0 |
| queue coverage | 281-284, no gaps |

## Key Findings

- All 4 rows remain valid Tier 1 deep-review candidates. None should be treated as a simple room-bath luxury ryokan row.
- `大丸温泉旅館` is the strongest bath-experience row in this final segment. The river-like source-flow open-air bath should be modeled almost like a facility product inside an accommodation profile.
- `清風荘` is a large Awara hot-spring hotel where the bath signal is tied to a large garden open-air bath, multiple baths, footbath, day-use, and theater-style buffet. Food and child/family signals will likely dominate many reviews.
- `摺上亭大鳥` is a clean public-bath/access candidate: large bath, open-air, sauna, water bath, partitioned wash stations, and Fukushima/Iizaka access.
- `旅館中松屋` is a Bessho view-bath candidate. It should be tagged for 7th-floor view bath, town public-bath use, day-use availability, and family/hospitality signals.

## Cleanup / Follow-Up Queue

| slug | issue | next action |
|---|---|---|
| `nasu-omaru` | Accommodation and facility-like river open-air overlap. | Add accommodation-facility bridge note; split river bath, private bath, room hinoki bath, handrail/safety. |
| `awara-seifuso` | Large hotel with food/footbath/day-use signals. | Split garden open-air, multiple baths, footbath, day-use, buffet, and family use. |
| `iizaka-yoshikawaya` | Public-bath/access candidate rather than room-bath candidate. | Tag public bath, open-air, sauna, water bath, wash-station comfort, and Fukushima access. |
| `bessho-nakamatsuya` | Town public-bath use appears beside inn bath. | Split inn 7th-floor view bath, day-use, town public bath, and room view/no-view issue. |

## Data Quality Note

This final segment confirms that the last Tier 1 accommodation rows still add useful model variation. The candidate directory should keep them, but deep review should not force them into a room-bath framework. Bath-area taxonomy is especially important for `大丸温泉旅館` and `中松屋`.
