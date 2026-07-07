---
name: bathtime-onsen-facility-review-signal-researcher
description: Research Japanese non-accommodation onsen facilities for Bathtime, including nationwide or regional candidate lists, day-use onsen complexes, municipal public baths, family/private bath facilities, sand baths, steam baths, footbaths, and spa-like onsen facilities. Use when asked to discover/tier onsen facility candidates or collect official facts and public review signals about facility bath experience, source-flow claims, water texture, bath variety, family/private bath use, sand/steam bath experience, crowding, queue/reservation confusion, amenities, payment, access, or tourist expectation gaps.
---

# Bathtime Onsen Facility Review Signal Researcher

## Purpose

Produce Bathtime-ready research for Japanese onsen facilities that are not primarily accommodations. Treat this as data curation, not review scraping: the goal is a reliable, comparable signal dataset about how people actually use the facility, where friction often comes from product flow rather than room inventory.

Always write the final report in Korean unless the user asks otherwise.

Use this skill for both:

- **Candidate research**: identify and tier non-accommodation onsen facilities before deep review collection.
- **Deep review signal research**: read/tag public reviews and produce Bathtime-ready facility signals.
- **Facility model design**: compare facility types, refine signal fields, and decide whether a public onsen, family-bath center, sand bath, steam bath, footbath, or wellness complex deserves a different data model from accommodation onsen.

Do not merge this with the accommodation research model. Facilities are judged by visit flow and product structure, not by room-bath inventory.

## Core Rules

- Separate **official facts** from **review signals**.
- Separate **platform visible review counts** from **directly read/tagged review counts**.
- Never imply full coverage unless every accessible review was actually read.
- Preserve short original keywords only. Do not copy long review text.
- Do not use the accommodation bath model blindly. Facility research must model products and operating flow: base admission, family/private baths, sand baths, steam baths, footbaths, food/steam experiences, rest areas, and add-on fees.
- Treat a shared reservable `family_bath` or `private_bath` as different from an accommodation `room_bath`.
- Prefer slow, stratified sampling over large shallow collection.
- For deep research, target 300+ directly read reviews when feasible.
- Use confident Korean when the sample supports it, but state sample limits plainly.
- Make the product unit explicit. A facility row can represent a bathhouse, paid add-on, route/pass, footbath stop, sand/steam product, or area cluster; do not silently treat all of them as the same kind of onsen facility.
- Flag candidate rows that should be split before deep review, such as a route pass covering multiple baths, a town-wide family-bath area, or a footbath listed as if it were a full bathing facility.

## Facility Archetypes

Start by classifying the facility into one of these operating archetypes. This prevents accommodation-style assumptions from leaking into the data.

1. **Public bathing facility**
   - Examples: municipal public baths, historic communal baths, day-use public bath facilities.
   - Core questions: water character, amenities, crowding, local-user culture, tourist expectation gap.
2. **Experience-led facility**
   - Examples: sand baths, steam baths, footbath streets, jigoku-mushi or food-steam facilities.
   - Core questions: process clarity, queue/reception close, novelty, discomfort, hygiene, add-on fees.
3. **Private-use facility**
   - Examples: family bath centers, reservable private baths, paid private rooms.
   - Core questions: reservation/queue rules, privacy, room selection, cleanliness, refill/source-flow feeling, time limit, price value.

Mixed facilities are allowed, but tag one primary archetype and keep each product area separate.

## Facility Model Lens

Before collecting reviews, decide what kind of decision Bathtime is helping the user make.

| model | Use when | Primary decision signal |
|---|---|---|
| `bathe` | The user enters a gender-separated public bath or open-air bath. | Water character, bath quality, amenities, crowding, tourist friction. |
| `reserve_private` | The user chooses a paid family/private bath or private room. | Privacy, reservation/queue rules, room condition, time limit, refill/source-flow feeling. |
| `experience` | Sand bath, steam bath, inhalation, food steaming, or other process-led activity is core. | Process clarity, waiting, heat/discomfort, hygiene, novelty, price value. |
| `stopover` | Footbath, drinking spring, small free public facility, station/park stop. | Ease of use, crowding, cleanliness, location value, expectation fit. |
| `route_or_pass` | The row is a town-wide bath route, hand-pass, common ticket, or cluster. | Coverage, eligibility, participating facilities, tourist usability. |

If the model is `route_or_pass`, do not create water-texture or bath-quality signals for the whole row unless reviews clearly discuss the route as an experience. Split individual baths when user-facing recommendations require bath-level detail.

## Minimum Data Contract

For facility research, produce data that can be compared without accommodation assumptions.

Required candidate fields:

- identity: Korean name, Japanese official name, English/alias names, old names, duplicate map/listing notes.
- location: prefecture, city/town/village, onsen area, address.
- classification: `facility_type`, `facility_model`, primary archetype, cleanup status.
- official facts: official URL, bath/product areas, source-flow claim, spring quality, prices, reservation rules, hours, reception close, amenities, payment, parking/access, volatile notices.
- review surface: platform-visible review counts, directly read review counts, source access status, Korean demand signal, data quality grade.
- decision value: product strength, likely tier, tier reason, split/exclude reason.

Required deep-review fields:

- facility_area, facility_area_confidence, signal_type, signal_direction.
- mention_count, source_count, platform_count, contradiction_level, review_signal_status.
- evidence_examples with source type, URL, language, short paraphrase, original keyword, review date when visible.

Never fill unknown facts from inference. Use `unclear`, `not_found`, or `needs_crosscheck`.

## Research Workflow

1. **Normalize identity**
   - Record Korean, Japanese, English, old names, map/OTA aliases, official URL, address, and operator type.
   - Note whether the source is an official site, municipal page, tourism association page, or booking/OTA page.

2. **Choose research mode**
   - `candidate_mode`: collect identity, official/product facts, visible review pool, Korean demand signal, tier rationale, and gaps. Do not tag review signals deeply unless the user asks.
   - `deep_review_mode`: collect official facts, map review pools, read/tag reviews, and produce the full report.
   - For regional or nationwide facility candidate work, read `references/facility-candidate-research-playbook.md` before collecting.
   - If unclear, default to `deep_review_mode` for one named facility and `candidate_mode` for regional/nationwide lists.

3. **Classify facility type**
   - Read `references/facility-tagging-guide.md`.
   - Assign one primary `facility_type`, plus secondary types if needed.
   - Keep product areas separate: public bath, open-air bath, family/private bath, sand bath, steam bath, footbath, drinking spring, inhalation, rest/food areas.

4. **Collect official facts**
   - Check official site, municipal/tourism pages, and facility pages.
   - Record only official facts: bath types, source-flow claims, spring quality, hours, holidays, prices, reservation rules, reception close, parking, amenities, payment, tattoo rules, age restrictions, and operating notices.
   - Do not treat reviews as official confirmation.

5. **Map review pools**
   - Check Google Maps, Jalan, Rakuten Travel if listed as day-use, Tripadvisor, 4travel, Yahoo Map/Travel, Nifty Onsen, Naver Blog/Cafe/search, Korean blogs, and global platforms when relevant.
   - For each source record: visible review count, rating, access status, whether individual review bodies were readable, and whether the source is snippet-only.
   - Use Aside Browser for Google Maps, Naver, dynamic review tabs, paginated reviews, and sources that static fetch cannot read. If Aside Browser was not used for those sources, say "미확인" rather than "차단" or "후기 없음".

6. **Sample reviews with strata**
   - Include latest reviews, low-rated reviews, facility-keyword reviews, Korean reviews, and platform spread.
   - For facility research, explicitly sample negative operational keywords: `混雑`, `並ぶ`, `予約`, `受付終了`, `現金`, `高い`, `洗い場なし`, `シャワーなし`, `石鹸`, `タオル`, `駐車場`, `熱い`, `ぬるい`, `塩素`, `カルキ`, `温泉感`, `염소`, `현금`, `샤워`, `수건`, `대기`, `예약`, `가족탕`, `모래탕`.
   - Keep search snippets and Google/Naver topic chips separate from full review evidence.
   - Stop early only when the marginal signal has stabilized. A 300+ directly read sample is preferred, but a smaller sample is acceptable when review bodies are sparse, duplicates dominate, or the user asked only for candidate mode.
   - If the first 100-150 reviews show negative operational signals, expand platform coverage before concluding. Prioritize Google Maps, Nifty, Jalan/4travel, Yahoo Map, Tripadvisor, Naver Blog/Cafe, and facility-specific review pages.

7. **Tag signals**
   - Read `references/facility-tagging-guide.md` before tagging.
   - Track mention_count, source_count, platform_count, contradiction_level, and review_signal_status.
   - Count independent authors, not repeated snippets or duplicated mirrors.

8. **Write the report**
   - Use `references/facility-report-template.md`.
   - Include a collection briefing before interpretation.
   - State data quality grade and what would upgrade confidence.
   - Explain how the facility differs from accommodation-style onsen data.

## Confidence Language

- **A grade**: 300+ directly read reviews, 3+ platforms, stratified sampling. Say "강하게 반복된다".
- **B grade**: 100-299 directly read reviews, 2+ platforms. Say "뚜렷하게 확인된다".
- **C grade**: 50-99 directly read reviews. Say "초기 신호가 확인된다".
- **D grade**: under 50 reviews or snippet-heavy. Say "탐색 신호" or "모델 검증용 표본".
- **Conflicting**: positive and negative signals both repeat. Say "평가가 갈린다" and explain by facility area, time, price, or visitor expectation.

Do not let platform-visible review count control the tone. A facility with 3,000 visible Google reviews but only 40 directly read reviews is not A grade.

## Output Principles

- Write like a statistics-aware Korean travel data editor.
- Include exact collection scale: "플랫폼상 6,112건, 직접 확인 120건, 온천시설 관련 84건".
- Do not inflate platform review counts into evidence counts.
- Do not inflate search snippets into direct review counts.
- For operating details that change often, mark the fact as needing fresh confirmation before user-facing booking guidance.
- Mention blocked, login-required, inaccessible, or insufficient sources.
- For candidate lists, write conservative but useful tier reasoning. For deep reports, write stronger interpretation only after the counted sample supports it.
- Explicitly state whether the row should remain in the facility dataset, be split into multiple bath/product rows, be moved to route/pass, or be excluded as non-bathing tourism.

## References

- `references/facility-candidate-research-playbook.md`: regional/nationwide facility candidate discovery, tiering, split/exclude rules, and QA.
- `references/facility-tagging-guide.md`: facility taxonomy, signal types, count rules, confidence/status rules.
- `references/facility-report-template.md`: Korean report structure and table templates.
