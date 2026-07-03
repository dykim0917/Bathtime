# Tier 1 Verification Batch 05 Segment 221-230 Report

## Scope

- Date: 2026-07-03
- Target file: `tier1_verification_batch_05_target_v0_1_2026-07-03.csv`
- Segment file: `tier1_verification_batch_05_segment_221_230_v0_1_2026-07-03.csv`
- Queue range: accommodation 221-230
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
| queue coverage | 221-230, no gaps |

## Key Findings

- All 10 rows remain valid Tier 1 deep-review candidates. This segment is room-bath-heavy: `星のあかり`, `阿しか里`, `三輪 湯河原`, `奥湯河原 結唯`, and `べにや` all expose strong room hot-spring/open-air propositions.
- `若竹の庄 別邸笹音` is useful but needs negative-signal expansion. Review surfaces show good room half-open-air and river sound signals, while a readable Rakuten surface flags chlorine smell in an open-air/public bath area and black mold concern in a room bath.
- `星のあかり` is a clear all-room hot-spring open-air candidate, with an additional cloudy/source-flow public bath proposition. The risk is seasonal nature-friction: insects/ants in rooms should be checked before a confident comfort claim.
- `THE KEY HIGHLAND NASU` should be treated as a resort-flow property, not just a room-bath ryokan. Its onsen value sits across room open-air suites, `森のスパ`, public baths, sauna, qua garden, and all-inclusive stay design.
- `那須温泉 山楽` is one of the cleanest source-flow candidates in this segment. Official surfaces explicitly expose self-source, no heating/circulation/filtration, large open-air bath, and source 100% room garden bath.
- The Yugawara cluster is high value but operationally varied: `阿しか里` needs stair/accessibility checks, `三輪 湯河原` is a modern all-room open-air design stay, `結唯` needs detached-room stairs/temperature/privacy checks, and `海石榴` mixes room open-air privacy with old luxury ryokan/room-meal expectations.
- `べにや` is a strong Awara luxury candidate: all 17 rooms with source-flow baths, 100% natural onsen, soft but sometimes hotter water, and post-2021 rebuilt property quality all appear in public surfaces.

## Cleanup / Follow-Up Queue

| slug | issue | next action |
|---|---|---|
| `kinugawa-wakatake-sasane` | Chlorine smell and black mold concern appear in readable reviews. | Expand negative sampling across Rakuten, Yahoo, Ikkyu, Agoda before assigning confidence. |
| `nasu-hoshino-akari` | Strong all-room bath signal, but nature/insect friction appears. | Split room bath, cloudy public bath, night-view deck, and insect/cleanliness signals. |
| `nasu-key-highland` | Resort facilities may dominate hot-spring evaluation. | Split room open-air, Mori no Spa, sauna, qua garden, pool, all-inclusive dining. |
| `nasu-sanraku` | Strong source-flow claim across public and room baths. | Prioritize source-flow, water texture, public open-air atmosphere, and room garden bath. |
| `katayamazu-morimoto` | Lake view and food signals can obscure bath signal. | Split lake/Hakusan view, public open-air, private bath, and room hot-spring rock bath. |
| `yugawara-ashikari` | Stair/accessibility issues appear beside strong room-bath satisfaction. | Track room type, stairs, elderly/baby usability, and soft-water texture. |
| `yugawara-okuyugawara-yui` | Detached-room structure affects bath usability. | Track stairs, lukewarm water, privacy/eye-screen, river sound, and sauna separately. |
| `yugawara-tsubaki` | Old luxury ryokan and room-meal expectations are intertwined with bath satisfaction. | Separate dedicated room open-air, large public bath, room meal privacy, and cleanliness/oldness. |
| `awara-beniya` | Strong but premium/quiet stay signal. | Track all-room source-flow bath, hotter water, soft texture, rebuilt building quality, and room meal. |

## Data Quality Note

The 221-230 segment is one of the more valuable candidate blocks for Bathtime because it contains multiple properties where official surfaces already expose room hot-spring/open-air claims. The deep-review risk is not lack of candidates, but overconfidence: several negative signals are bath-area-specific and should not be generalized across the whole property. Chlorine smell, black mold, insects, stairs, lukewarm water, privacy, and resort-flow confusion must be tagged separately from the positive room-bath proposition.
