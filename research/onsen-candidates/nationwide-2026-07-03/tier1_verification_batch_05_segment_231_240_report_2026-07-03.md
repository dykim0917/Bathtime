# Tier 1 Verification Batch 05 Segment 231-240 Report

## Scope

- Date: 2026-07-03
- Target file: `tier1_verification_batch_05_target_v0_1_2026-07-03.csv`
- Segment file: `tier1_verification_batch_05_segment_231_240_v0_1_2026-07-03.csv`
- Queue range: accommodation 231-240
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
| queue coverage | 231-240, no gaps |

## Key Findings

- All 10 rows remain valid Tier 1 deep-review candidates. The segment is not one homogeneous group: Awara contains large public-bath resort hotels and smaller source-flow ryokan, Aizu Higashiyama is heritage/view-bath oriented, and Ikaho requires exact water-name separation.
- `グランディア芳泉` needs careful bath-area splitting. A visible Rakuten review says a Sakura-tei suite semi-open-air room bath is not onsen, while the large public bath is satisfying. Do not classify the whole property as `room_bath_hot_spring`.
- `まつや千千` is a strong large-public-bath candidate. Its center of gravity is the spacious source public bath/open-air bath, not necessarily room-bath differentiation.
- `美松` and `つるや` both remain strong Awara candidates, but their comparison axis differs. `美松` has room open-air/private-room and inclusive stay signals; `つるや` is more source-flow, traditional, quiet ryokan oriented.
- `向瀧` is a high-value cultural ryokan candidate, but its bath signal is entangled with registered cultural-property architecture, room meals, snow/candle events, and official identity cautions about similarly named inns.
- `庄助の宿 瀧の湯` has a very large review surface and a clear product hook: waterfall-view open-air bath, private baths, footbath, and large lodging flow. Deep review should check crowding and private-bath reservation/flow signals.
- Ikaho rows must not be flattened into one generic Ikaho onsen category. `諧暢楼` room baths use `白銀の湯`; sister property access exposes both `黄金の湯` and `白銀の湯`. `古久家` is a stronger `黄金の湯` source-flow candidate. `かのうや` leans `白銀の湯`, and `お宿玉樹` exposes both waters.

## Cleanup / Follow-Up Queue

| slug | issue | next action |
|---|---|---|
| `awara-grandia-housen` | Some room semi-open-air baths may not be onsen. | Split non-onsen room bath, public bath, open-air, lounge, buffet, and family flow. |
| `awara-matsuya-sensen` | Large public bath dominates the proposition. | Prioritize source public bath, open-air, cleanliness, elderly usability, and large-inn crowding. |
| `awara-mimatsu` | Room open-air and inclusive stay signals mix with older-building notes. | Track room open-air, self-source, oldness/cleanliness, kids, and inclusive service separately. |
| `awara-tsuruya` | Traditional source-flow identity rather than flashy room-bath identity. | Track source-flow, soft water, footbath, onsen egg, quietness, and old ryokan cleanliness. |
| `higashiyama-mukaitaki` | Cultural-property experience can overshadow bath signal. | Separate source-flow bath, family/private bath, room meal, heritage architecture, snow/candle event. |
| `higashiyama-shosuke` | Very large review pool and many bath products. | Split waterfall-view open-air, private bath, footbath, day-use/room-only flow, crowding. |
| `ikaho-kaichoro` | Room bath is white-silver water, not golden water. | Tag `白銀の湯` room bath separately from sister property `黄金の湯` public-bath access. |
| `ikaho-kanouya` | Cable-car access and white-silver water are defining traits. | Track access novelty/friction, white-silver water, family bath, paid private open-air, sauna/jacuzzi. |
| `ikaho-kokuya` | Strong golden-water source-flow proposition. | Prioritize `黄金の湯`, source-flow, room open-air, view public bath, stone-step access. |
| `ikaho-oyado-tamaki` | Uses both golden and white-silver water; privacy issue appears. | Split two-water experience, room open-air privacy, parking visibility, shuttle, shower fixture issue. |

## Data Quality Note

This segment is high-value for Bathtime because it shows why official bath-area normalization matters. The same area label, especially `伊香保温泉`, can hide different actual waters and product structures. The next deep-review pass should force explicit tags for `黄金の湯`, `白銀の湯`, source-flow public bath, room open-air, private/family bath, and non-onsen room bath before counting review sentiment.
