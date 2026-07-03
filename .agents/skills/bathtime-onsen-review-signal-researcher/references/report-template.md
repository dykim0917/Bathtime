# Report Template

Write in Korean. Keep official facts and review signals separate.

## 1. 이름/별칭 정규화

| 구분 | 값 |
|---|---|
| 한국어명 |  |
| 일본어명 |  |
| 영어명 |  |
| 구명/별칭 |  |
| 공식 사이트 |  |
| 주요 OTA/호텔 ID |  |

Mention any rename, address mismatch, or OTA slug mismatch.

## 2. Official Facts

- Summarize official bath facts only.
- Include official URLs.
- State whether the fact covers room baths, room open-air baths, public baths, private/family baths, spring source, source-flow, water quality, and operating limits.

## 3. 수집 브리핑

| source | visible_review_count | rating | directly_read_reviews | onsen_related_reviews | access_status | notes |
|---|---:|---:|---:|---:|---|---|

Required notes:

- Total visible review pool, without double-counting claims if platforms overlap.
- Total directly read reviews.
- Sampling strata used: latest, low-rated, onsen keyword, Korean, room type, platform spread.
- Data quality grade: A/B/C/D.
- Whether Aside Browser was used, and what it changed compared with static web/direct fetch.
- Keep `directly_read_reviews` separate from search snippets, Google AI summaries, OTA snippets, and Naver search-result snippets.

Suggested access status values:

| access_status | Meaning |
|---|---|
| `direct_fetch_full_read` | Static/direct fetch exposed full readable review bodies. |
| `direct_fetch_partial_read` | Static/direct fetch exposed only part of the review set. |
| `aside_review_tab_read` | Aside Browser opened dynamic review tab/body text. |
| `aside_archive_read` | Aside Browser opened archive or paginated older reviews. |
| `aside_search_snapshot_read` | Aside Browser read search-result snippets, not full review bodies. |
| `snippet_only` | Only search/OTA snippets were visible. |
| `login_required` | Login or membership blocked body access. |
| `blocked_or_unreadable` | Source remained blocked/unreadable after Aside or browser check. |

When Aside Browser changes a prior assumption, add a short note:

> 정적 fetch에서는 최신 11건만 보였으나, Aside Browser에서 archive 페이지와 페이지네이션이 확인됨.

## 4. Review Signal Summary

| bath_area | bath_area_confidence | signal_type | signal_direction | mention_count | source_count | platform_count | contradiction_level | review_signal_status |
|---|---|---|---|---:|---:|---:|---|---|

## 5. 부정/주의 신호

| issue | bath_area | evidence_level | summary | sample_count |
|---|---|---|---|---:|

Include temperature control, weak onsen feeling, chlorine smell, crowding, booking/room confusion, cleanliness, and access/operation confusion when found.
For room-bath lodgings, also include insects, bathroom coldness, steps, view obstruction, privacy, and water temperature control when found.

## 6. Evidence Examples

List up to 20 examples.

| signal_type | source_type | source_url | language | short_paraphrase | original_keyword | review_date |
|---|---|---|---|---|---|---|

Use short paraphrases. Preserve only short original keywords.
Mark search snippets clearly as `Naver search snippet`, `Google search snippet`, or `OTA snippet`; do not present them as full-review evidence.

## 7. Bathtime Interpretation

Write 2-4 concise Korean sentences.

Tone by grade:

- A: "강하게 반복됩니다"
- B: "뚜렷하게 확인됩니다"
- C: "초기 신호가 확인됩니다"
- D: "탐색 신호에 가깝습니다"

Example:

> 공식 정보와 후기 표본을 함께 보면, 이 숙소는 객실 노천탕 중심형으로 분류하는 것이 타당합니다. 직접 확인한 후기 180건 중 객실탕/노천탕 언급이 72건으로 반복되며, 특히 프라이빗 이용성과 바다 조망이 긍정 신호의 중심입니다. 다만 객실탕 온도 조절 불만이 일부 반복되어, Bathtime에는 장점과 주의점을 함께 표시하는 편이 좋습니다.

## 8. Gaps

- List blocked, login-required, inaccessible, or insufficient sources.
- State what further sampling would improve confidence.
- State whether 300+ target was reached; if not, explain why.
- State whether Google Maps, Naver, and Jalan archive were checked with Aside Browser.
- If not checked with Aside Browser, do not call those sources definitively blocked.
