# Tier 1 Verification Batch 06 Segment 271-280 Report

## Scope

- Date: 2026-07-03
- Target file: `tier1_verification_batch_06_target_v0_1_2026-07-03.csv`
- Segment file: `tier1_verification_batch_06_segment_271_280_v0_1_2026-07-03.csv`
- Queue range: accommodation 271-280
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
| queue coverage | 271-280, no gaps |

## Key Findings

- All 10 rows remain valid Tier 1 deep-review candidates. This segment is especially useful because it spans private-bath variety, large multi-building resort, high-end ryokan, old-source Ikaho water, pearl-bath novelty, city onsen access, and premium room-onsen lodging.
- `鬼怒川グランドホテル 夢の季` is a bath-variety candidate. Its user value is `九湯` and multiple private baths; public/private bath routing matters more than a simple room-bath flag.
- `ホテルサンバレー那須` is close to facility research logic. It has multiple lodging buildings, three source types, `湯遊天国`, hot-spring pool, day-use, and operational/seasonal bath availability. It should be product-split like a resort facility.
- `山翠楼SANSUIROU` and `茶寮宗園` are high-end ryokan candidates where bath satisfaction and mobility/accessibility risks coexist. Stairs, spread-out buildings, and elderly usability should be tagged alongside room/open-air bath quality.
- The Ikaho rows are strong but must be water-name specific. `千明仁泉亭` is a strong `黄金の湯` source-flow room/public bath candidate; `ホテル木暮` is a large-bath high-volume candidate with major `黄金の湯` source allocation and room-open-air options.
- `鳥羽国際ホテル 潮路亭` needs expectation management. The pearl bath/pearl-derived novelty is distinctive, but review surfaces include signals that bath variety and spring-feeling may feel limited.
- `湯田温泉 ユウベルホテル松政` is not a luxury room-bath candidate; it is valuable as an urban-access public bath hotel with source-flow open-air, large bath, sauna, and private bath.
- `鬼怒川金谷ホテル` and `那須別邸 回` are strong premium candidates with room hot-spring signals, but the next stage should track service/price expectations separately from bath quality.

## Cleanup / Follow-Up Queue

| slug | issue | next action |
|---|---|---|
| `kinugawa-yumenotoki` | Bath-variety property. | Split nine-bath route, large public bath, five private baths, and room-bath availability. |
| `nasu-sunvalley` | Multi-building resort/facility logic. | Split sources, buildings, `湯遊天国`, `アクア・ヴィーナス`, day-use, and operating schedules. |
| `yugawara-sansuirou` | Stairs and spread-out building structure. | Track mobility/accessibility separately from view-open-air satisfaction. |
| `ikaho-chigira` | Strong `黄金の湯` source-flow candidate. | Tag `黄金の湯100%`, annex room baths, public baths, and stone-step access. |
| `ikaho-kogure` | Large public bath and room bath both strong. | Split 1300-tsubo bath area, `黄金の湯`, room open-air, private/view bath, family checkout pressure. |
| `toba-toba-kokusai` | Pearl bath novelty may not equal strong spring feeling. | Track pearl bath, bath variety, weak spring feeling, child-meal expectations, and food satisfaction. |
| `akiu-saryo-soen` | Premium ryokan but accessibility concerns. | Split detached room open-air, room hinoki bath, public open-air, stairs, and carpet/cleanliness signals. |
| `yuda-kamefuku` | City-access public-bath hotel. | Track source-flow open-air, large bath, sauna, private bath, and Yuda city access. |
| `kinugawa-kanaya` | Room onsen and service signals both strong. | Split room hot spring, public baths, sauna, valley view, chocolate/free service, and dining. |
| `nasu-bettei-kai` | Strong room bath but price/access expectation risk. | Expand low-rated sampling for stairs, transit, no shuttle, food value, and service detail. |

## Data Quality Note

This segment widens the Bathtime model beyond water source. It confirms that user decision quality depends on product structure: whether the property is a bath-route hotel, a multi-building resort, a premium room-onsen ryokan, an urban onsen hotel, or a novelty-bath lodging. Deep review should not count these under one common `온천 좋음` bucket.
