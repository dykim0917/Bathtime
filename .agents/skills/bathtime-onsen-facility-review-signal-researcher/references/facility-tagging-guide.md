# Facility Tagging Guide

Use this guide when researching non-accommodation onsen facilities for Bathtime.

## Facility Type

| value | Use when |
|---|---|
| `large_day_use_complex` | Large day-use onsen with multiple baths and add-ons such as family baths, sand baths, steam baths, restaurants, rest areas, or footbaths. |
| `historic_public_bath` | Historic, municipal, or symbolic public bath where local bathing culture and building/history are core. |
| `public_bath_facility` | General public bath or day-use onsen mainly organized around gender-separated baths. |
| `family_private_bath_facility` | Facility primarily known for time-slot family baths or private rental baths. |
| `sand_bath_facility` | Sand bath or hot-sand bathing is a core product. |
| `steam_bath_facility` | Steam bath, mushiyu, or geothermal steam experience is a core product. |
| `footbath` | Footbath-only or footbath-centered stop. |
| `wellness_spa` | Spa, sauna, relaxation, dining, or wellness complex where the onsen is one part of a broader facility. |
| `route_or_pass` | Town-wide bath route, common ticket, hand-pass, public-bath route, or multi-facility pass. |
| `area_cluster` | Area-level row for many related facilities, such as a family-bath district or footbath street, before individual facilities are split. |
| `non_bathing_tourism` | Related tourism asset that is not itself a bathing facility, such as food steaming, viewing spot, or cultural symbol. |
| `unclear` | Facility type cannot be inferred safely. |

Use one primary type and optional secondary notes. Example: Takegawara Onsen can be primary `historic_public_bath` with secondary `sand_bath_facility`.

## Facility Area

| value | Use when |
|---|---|
| `public_bath` | Gender-separated indoor bath, large bath, ordinary bath, or communal bath. |
| `open_air_public_bath` | Shared gender-separated open-air bath. |
| `family_bath` | Time-slot family bath explicitly referenced. Japanese: `家族風呂`. Korean: `가족탕`. |
| `private_bath` | Private-use or reservable bath when it is not clearly family-bath branded. Japanese: `貸切風呂`, `貸切湯`. |
| `sand_bath` | Sand bath, sand steaming, hot sand. Japanese: `砂湯`, `砂むし`, `砂風呂`. |
| `steam_bath` | Steam bath or geothermal steam room. Japanese: `むし湯`, `蒸し湯`. |
| `footbath` | Footbath. Japanese: `足湯`. |
| `drinking_spring` | Drinking spring. Japanese: `飲泉`. |
| `inhalation` | Onsen inhalation. Japanese: `温泉吸入`. |
| `rest_area` | Lounge, cafe, waiting area, resting room, massage/relaxation area. |
| `food_steam` | Jigoku-mushi, onsen egg, food steaming, restaurant tied to onsen use. |
| `route_or_pass` | Common-ticket, bath route, or pass experience that covers multiple facilities. |
| `area_cluster` | Area-level cluster before individual facilities are separated. |
| `facility_wide` | Signal applies to the whole facility. |
| `unclear` | Facility area cannot be inferred safely. |

## Facility Area Confidence

| value | Meaning |
|---|---|
| `specific` | Area is explicit in official text, review body, product name, or ticket type. |
| `probable` | Area is very likely from context but not directly named. |
| `facility_wide` | Signal applies to the whole facility. |
| `unclear` | Insufficient evidence. |

## Signal Types

| value | Meaning |
|---|---|
| `source_flow_claim` | Official or review mention of source-flow, 100% source, circulation, disinfection, chlorine, or source authenticity. |
| `water_texture` | Feel of the water: smooth, slippery, salty, acidic, sulfurous, ordinary, weak, thin, harsh. |
| `distinctive_spring_character` | Color, smell, turbidity, heat retention, sulfur smell, mineral character, very hot/cold spring character. |
| `bath_variety` | Variety and routing of baths or experiences. |
| `sand_or_steam_experience` | Satisfaction, discomfort, heat, wait, price, process, hygiene, or novelty of sand/steam baths. |
| `family_private_bath_experience` | Privacy, cleanliness, room selection, refill mechanism, price, time limit, and suitability for couples/families. |
| `crowding_or_wait` | Crowding, line, wait time, full rooms, reception close, busy time, group tourists. |
| `reservation_or_queue_confusion` | Reservation rules, same-day reception, phone/web booking, ticketing, order display, unclear closing rules. |
| `cleanliness_amenities` | Cleanliness, shower, washing area, shampoo, soap, towel, dryer, locker, changing room. |
| `price_payment_value` | Admission, add-on fees, cash-only, card/QR support, perceived value, expensive/cheap. |
| `accessibility` | Parking, station/bus access, stairs, luggage, wheelchair, child/elderly usability. |
| `tourist_expectation_gap` | Gap between tourist/Korean spa expectations and actual local Japanese bath style. |
| `local_user_culture` | Local-user norms, bath etiquette, tourist friction, atmosphere of municipal/community use. |
| `eligibility_or_use_scope` | Whether non-guests, day users, foreign visitors, children, groups, or pass holders can use the product. |
| `operation_volatility` | Temporary closure, renovation, disaster recovery, winter closure, price revision, or changing reception rules. |

## Candidate Dataset Fields

Use these fields when building regional or nationwide facility candidates.

| field | Meaning |
|---|---|
| `candidate_slug` | Stable lowercase identifier. |
| `candidate_track` | `traditional_onsen_facility` or `spa_complex_super_sento`. Use this before tiering so historic onsen facilities are not compared directly with urban spa complexes. |
| `korean_name` | Korean service-facing name. |
| `japanese_name` | Official Japanese name when verified. |
| `aliases` | English, Korean variants, old names, map/OTA variants. |
| `facility_type` | One primary type from the facility type table. |
| `facility_model` | `bathe`, `reserve_private`, `experience`, `stopover`, or `route_or_pass`. |
| `archetype` | Public bathing, experience-led, private-use, mixed, or route/pass. |
| `lodging_available` | `true`, `false`, or `unclear`. A spa complex with lodging remains a facility when bathing/spa use is the primary product. |
| `prefecture` | Japanese prefecture. |
| `municipality` | City/town/village. |
| `onsen_area` | Onsen area or district name. |
| `official_url` | Official, municipal, tourism association, or operator page. |
| `map_or_review_url` | Best public review surface URL. |
| `visible_review_pool` | Platform-visible review volume, not directly read count. |
| `korean_demand_signal` | Korean blog/cafe/search evidence: strong, moderate, weak, or not_found. |
| `product_strength` | Main reason it matters to Bathtime users, such as sand bath, family bath, historic bath, view bath, or sauna/spa. |
| `likely_tier` | Tier 1, Tier 2, Tier 3, or hold. |
| `tier_reason` | Short, evidence-based reason. |
| `cleanup_status` | `keep_facility`, `split_needed`, `route_or_pass`, `area_cluster`, `footbath_only`, or `exclude_or_hold`. |
| `verification_status` | `official_checked`, `ota_or_map_checked`, `search_only`, or `needs_crosscheck`. |

Do not assign deep-review signal fields in candidate mode unless directly read/tagged reviews exist.

## Direction

| value | Meaning |
|---|---|
| `positive` | Review frames the signal favorably. |
| `negative` | Review frames it as a problem. |
| `mixed` | Positive and negative aspects both appear. |
| `neutral` | Mention exists but sentiment is informational. |

## Counting Rules

- `mention_count`: count related mentions. One review can contain multiple signal types, but do not double-count the same signal repeated in one review.
- `source_count`: count independent reviewers/authors.
- `platform_count`: count platforms where the signal appears in directly read review text.
- Search snippets, Google topic chips, rating distributions, and AI summaries do not count as directly read reviews unless explicitly opened and read as full review bodies.
- Keep separate:
  - visible platform review count
  - directly read reviews
  - onsen-facility-related directly read reviews
  - tagged signal mentions
  - snippet-only signals
  - Aside Browser snapshot-only signals
- Official facts can support facility structure and product availability, but they do not count as review sentiment.
- For `route_or_pass` and `area_cluster`, count review signals only when reviews discuss the route/cluster experience itself. Do not average or infer individual bath quality across the cluster.

## Review Signal Status

| status | Suggested threshold |
|---|---|
| `strong_signal` | Repeats across 3+ platforms or 30+ independent authors, with low contradiction. |
| `moderate_signal` | Repeats across 2+ platforms or 10-29 authors. |
| `weak_signal` | Appears in 2-9 authors or one platform only. |
| `conflicting` | Positive and negative signals both repeat meaningfully. |
| `insufficient` | Too few direct mentions to infer. |

## Data Quality Grade

| grade | Conditions |
|---|---|
| `A` | 300+ directly read reviews, 3+ platforms, stratified, latest and low-rated coverage. |
| `B` | 100-299 directly read reviews, 2+ platforms, some stratification. |
| `C` | 50-99 directly read reviews, useful but limited. |
| `D` | Under 50 directly read reviews, one-platform-only, or snippet-heavy. |

## Facility-Specific Negative Checklist

Always search or filter for:

- crowding/wait: `混雑`, `混んで`, `並ぶ`, `待ち`, `満室`, `受付終了`, `대기`, `혼잡`, `마감`
- reservation: `予約`, `当日受付`, `電話予約`, `ネット予約`, `整理券`, `예약`, `현장접수`
- amenities: `洗い場なし`, `シャワーなし`, `石鹸`, `シャンプー`, `タオル`, `ドライヤー`, `락커`, `수건`, `비누`, `샤워`
- payment/value: `現金`, `カード`, `QR`, `高い`, `追加料金`, `입장료`, `현금`, `추가요금`, `가성비`
- water/onsen: `源泉`, `かけ流し`, `塩素`, `カルキ`, `温泉感`, `ぬるい`, `熱い`, `유황`, `염소`, `미지근`, `뜨거운`
- access: `駐車場`, `駅`, `バス`, `階段`, `荷物`, `주차`, `버스`, `계단`, `짐`
- tourist expectation: `観光客向け`, `地元`, `昔ながら`, `銭湯`, `한국 스타일 아님`, `샤워시설 없음`

## Candidate Cleanup Status

Use these cleanup tags before deep review:

| status | Use when |
|---|---|
| `keep_facility` | A concrete visitable onsen facility or product. |
| `split_needed` | One row covers multiple products or facilities that should be separated. |
| `route_or_pass` | Common ticket, bath route, or area pass rather than one bath facility. |
| `area_cluster` | Useful as an area lead, but not deep-review-ready as a single facility. |
| `footbath_only` | Keep as facility data, but do not compare with full bathing facilities. |
| `exclude_or_hold` | Not a bathing facility, duplicate, closed, or too unclear to present. |

## Accommodation vs Facility Distinction

- Do not map `family_bath` to accommodation `room_bath`.
- Do not treat a day-use `private_bath` as guest-room privacy.
- For facilities, a bath may be a paid add-on rather than included in base admission.
- A high rating can coexist with severe tourist friction; preserve both.
- Historic/community public baths can be valuable even when amenities are sparse.
- A route/pass can be valuable for discovery but usually needs child rows before user-facing bath comparison.
