# Tier 1 Verification Batch 05 Segment 241-250 Report

## Scope

- Date: 2026-07-03
- Target file: `tier1_verification_batch_05_target_v0_1_2026-07-03.csv`
- Segment file: `tier1_verification_batch_05_segment_241_250_v0_1_2026-07-03.csv`
- Queue range: accommodation 241-250
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
| queue coverage | 241-250, no gaps |

## Key Findings

- All 10 rows remain valid deep-review candidates, but this segment has the widest product spread in Batch 05: full room-source-flow luxury inns, heritage public-bath ryokan, book-hotel/no-public-bath lodging, view-public-bath hotels, and a facility-like acidic communal bath.
- `別邸 仙寿庵`, `松本十帖`, and `かたくらシルクホテル` are clean all-room source-flow/open-air candidates. They should be compared on room bath privacy, temperature, view, and service design rather than public-bath scale.
- `旅館花屋` has a data cleanup issue. The target slug is `bessho-nanjo-ryokan`, but the Japanese name and official source indicate `旅館花屋`. This likely needs slug correction or row split if `南條旅館` was intended.
- `松本十帖` is all-room source-flow open-air, but it does not have a conventional large public bath. The small `小柳之湯` and room baths must be tagged separately.
- `扉温泉 明神館` remains a high-value luxury candidate, but review surfaces expose bath-operation negatives: lukewarm open-air, low water pressure, insects/leaves, and washing-area dissatisfaction. It needs negative-signal expansion.
- `酸ヶ湯温泉旅館` should be treated as both accommodation and facility-like onsen data. The main user decision is not a room bath but the `ヒバ千人風呂`, strong acidic milky water, mixed-bath rules, women-only time, bathing clothes, and `玉の湯` fallback.
- `南部屋・海扇閣` is a view-bath candidate where the Mutsu Bay panorama may be stronger than the water-texture signal. `石のや 伊豆長岡` and `三養荘` are both garden/room-onsen candidates, but `石のや` has stronger explicit all-room hot-spring and first-floor open-air signals.

## Cleanup / Follow-Up Queue

| slug | issue | next action |
|---|---|---|
| `bessho-nanjo-ryokan` | Slug does not match Japanese name `旅館花屋`. | Recheck original candidate source; rename slug to `bessho-hanaya` if confirmed. |
| `matsumoto-jujo` | Two-hotel structure and no conventional public bath. | Split `松本本箱`, `小柳`, room open-air, and `小柳之湯`. |
| `tobira-myojinkan` | Negative bath-operation signals appear in readable reviews. | Expand low-rated sampling for water pressure, lukewarm bath, insects/leaves, and washing area. |
| `sukayu-onsen` | Accommodation and public-facility logic overlap. | Duplicate/bridge into facility dataset or tag as accommodation-facility hybrid before deep review. |
| `asamushi-kaisenkaku` | Strong view signal may hide weak spring-feeling signal. | Split view satisfaction from water texture/source-flow feeling. |
| `katakura-silk` | Source-flow room baths can be very hot. | Track hot water temperature and cooling/adjustment friction. |
| `izu-nagaoka-sanyo-so` | Garden/architecture/service signals may outweigh bath signal. | Split all-room indoor onsen, public bath distance, garden, service variance, dog-room signals. |

## Data Quality Note

This segment confirms that Tier 1 verification cannot rely on a single `onsen ryokan` label. The strongest Bathtime value comes from separating exact product models: all-room source-flow open-air, heritage public-bath ryokan, no-large-public-bath room-bath hotel, view-public-bath hotel, and acidic mixed communal bath. `酸ヶ湯温泉旅館` in particular should inform both accommodation and facility research models.
