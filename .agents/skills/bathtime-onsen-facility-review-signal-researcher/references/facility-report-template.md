# Facility Report Template

Write in Korean. Keep official facts and review signals separate.

## Candidate Mode Output

Use this shorter structure when the task is regional/nationwide facility listing rather than one-facility deep review.

| candidate_slug | korean_name | japanese_name | facility_type | facility_model | archetype | prefecture | onsen_area | official_url | map_or_review_url | visible_review_pool | korean_demand_signal | product_strength | likely_tier | tier_reason | cleanup_status | verification_status |
|---|---|---|---|---|---|---|---|---|---|---:|---|---|---|---|---|---|

Candidate mode rules:

- Do not fill uncertain official facts by inference.
- Use `verification_status`: `official_checked`, `ota_or_map_checked`, `search_only`, `needs_crosscheck`.
- Use `likely_tier`: `Tier 1`, `Tier 2`, `Tier 3`, or `hold`.
- Use `facility_model`: `bathe`, `reserve_private`, `experience`, `stopover`, or `route_or_pass`.
- Use `cleanup_status`: `keep_facility`, `split_needed`, `route_or_pass`, `area_cluster`, `footbath_only`, or `exclude_or_hold`.
- `product_strength` should name the user-facing reason: `sand_bath`, `historic_public_bath`, `family_private_bath`, `open_air_view`, `large_day_use_complex`, `footbath_route`, `steam_bath`, `local_culture`.
- `visible_review_pool` is platform-visible volume, not directly read review count.
- If deep review has not been done, do not assign `review_signal_status`.

## 1. 이름/별칭 정규화

| 구분 | 값 |
|---|---|
| 한국어명 |  |
| 일본어명 |  |
| 영어명 |  |
| 구명/별칭 |  |
| 시설 유형 |  |
| 시설 모델 | bathe/reserve_private/experience/stopover/route_or_pass |
| 운영 주체 | 공식/시영/민영/관광협회/불명 |
| 주소/온천지명 |  |
| 공식 사이트 |  |
| 주요 지도/리뷰 URL |  |

Mention rename, address mismatch, duplicate map listings, or operator ambiguity.

## 2. Official Facts

- Summarize official facility facts only.
- Include official URLs.
- Cover bath/product areas: public bath, open-air bath, family/private bath, sand bath, steam bath, footbath, drinking spring, inhalation, rest/food areas.
- Cover operating details: hours, closing days, reception close, prices, add-on fees, reservation rules, parking, amenities, payment, tattoo/age restrictions, current notices.
- Mark volatile facts as needing latest confirmation before user-facing booking guidance.

## 3. 수집 브리핑

| source | visible_review_count | rating | directly_read_reviews | facility_related_reviews | access_status | notes |
|---|---:|---:|---:|---:|---|---|

Required notes:

- Total visible review pool, without implying full reading.
- Total directly read reviews.
- Sampling strata used: latest, low-rated, facility keyword, Korean, product area, platform spread.
- Data quality grade: A/B/C/D.
- Whether Aside Browser was used, and what it changed compared with static web/direct fetch.
- Keep `directly_read_reviews` separate from snippets, topic chips, search results, and AI summaries.
- Whether negative-signal expansion was triggered. If triggered, state which extra platforms were checked.

Suggested access status values:

| access_status | Meaning |
|---|---|
| `direct_fetch_full_read` | Static/direct fetch exposed full readable review bodies. |
| `direct_fetch_partial_read` | Static/direct fetch exposed only part of the review set. |
| `aside_review_tab_read` | Aside Browser opened dynamic review tab/body text. |
| `aside_search_snapshot_read` | Aside Browser read search-result snippets, not full review bodies. |
| `snippet_only` | Only snippets were visible. |
| `login_required` | Login or membership blocked body access. |
| `blocked_or_unreadable` | Source remained blocked/unreadable after browser check. |

## 4. Official Facility Matrix

| facility_area | facility_model | official_status | price_or_fee | reservation_rule | operation_note | cleanup_status | source_url |
|---|---|---|---|---|---|---|---|

Use `official_status`: `confirmed`, `not_found`, `unclear`, `seasonal_or_limited`.

## 5. Review Signal Summary

| facility_area | facility_area_confidence | signal_type | signal_direction | mention_count | source_count | platform_count | contradiction_level | review_signal_status |
|---|---|---|---|---:|---:|---:|---|---|

## 6. 부정/주의 신호

| issue | facility_area | evidence_level | summary | sample_count |
|---|---|---|---|---:|

Always consider: crowding, queue/reception close, reservation confusion, shower/washing area absence, towel/soap/shampoo, cash-only/payment, add-on fees, parking/access, temperature, chlorine/weak onsen feeling, tourist expectation gap, local-user culture.

## 7. Evidence Examples

List up to 20 examples.

| signal_type | source_type | source_url | language | short_paraphrase | original_keyword | review_date |
|---|---|---|---|---|---|---|

Use short paraphrases. Preserve only short original keywords.

Mark snippets clearly as `Naver search snippet`, `Google Maps snippet`, `Google topic chip`, or `OTA snippet`; do not present them as full-review evidence.

## 8. Bathtime Interpretation

Write 2-4 concise Korean sentences.

Tone by grade:

- A: "강하게 반복됩니다"
- B: "뚜렷하게 확인됩니다"
- C: "초기 신호가 확인됩니다"
- D: "탐색 신호에 가깝습니다" or "모델 검증용 표본입니다"

Recommended structure:

1. State what kind of facility it is.
2. State the strongest usable user-decision signal.
3. State the main caution or expectation gap.
4. State what confidence upgrade is needed, if any.

Also state whether this facility should be compared as a full bathing facility, private/family bath product, experience facility, footbath/stopover, or route/pass.

## 9. Gaps

- List blocked, login-required, inaccessible, or insufficient sources.
- State what further sampling would improve confidence.
- State whether 300+ target was reached; if not, explain why.
- State whether Google Maps, Naver, Japanese review platforms, and dynamic pages were checked with Aside Browser.
- If not checked with Aside Browser, do not call those sources definitively blocked.
