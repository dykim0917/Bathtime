---
name: bathtime-onsen-review-signal-researcher
description: Research Japanese ryokan/hotel hot spring review signals for Bathtime. Use when asked to investigate an accommodation's room baths, room open-air baths, public baths, private baths, source-flow feeling, water texture, chlorine smell, weak onsen feeling, crowding, or booking confusion from public reviews. Produces Korean, data-quality-aware summaries that separate official facts from review-based signals.
---

# Bathtime Onsen Review Signal Researcher

## Purpose

Produce Bathtime-ready review signal research for one Japanese ryokan or hotel. Treat this as data curation, not review scraping: the goal is a reliable, comparable signal dataset about the bath experience.

Always write the final report in Korean unless the user asks otherwise.

## Core Rules

- Separate **official facts** from **review signals**. Do not treat reviews as official confirmation.
- Separate **platform review counts** from **directly read/tagged review counts**.
- Never imply full coverage unless every accessible review was actually read.
- Preserve short original keywords only. Do not copy long review text.
- Prefer slow, stratified sampling over large shallow collection.
- Search aliases first: Korean name, Japanese current name, old names, English names, OTA slugs, hotel IDs.
- Use cautious confidence language based on sample quality, but avoid unnecessary hedging when signals repeat strongly.
- For Tier 1/deep research, use **Aside Browser** to verify dynamic or localized review surfaces before finalizing access gaps.
- Treat **room baths** and **family/private rental baths** as different bath areas. Do not merge guest-room baths with shared reservable baths.

## Research Workflow

1. **Normalize identity**
   - Build an alias table: Korean, Japanese, English, old names, OTA names, hotel IDs, official URL.
   - Note suspected renames or address mismatches.

2. **Collect official facts**
   - Check official site and major OTA facility/room pages.
   - Record only official bath facts: room bath, room open-air bath, public bath, private/family bath, source-flow claims, spring quality, operating notes.

3. **Map review pools**
   - Check Google Maps/Google hotel panel, Rakuten, Jalan, Ikkyu, Yahoo Travel, Agoda, Booking.com, Trip.com, Expedia, Hotels.com, Tripadvisor, Klook, Naver Blog/Cafe, Korean web, Japanese blogs.
   - For each platform record: visible review count, rating, accessibility, whether individual review text was readable.
   - For Google Maps, Naver, Jalan, Agoda/Booking/Trip.com, and other JS-heavy pages, use Aside Browser before calling a source blocked or insufficient.
   - For Jalan, check both the latest review page and the `archive` / "投稿から1年以上経過したクチコミ" path when present.
   - For Google Maps/Google hotel panels, open the actual review tab and record visible rating distribution when available.
   - For Naver, record both Korean demand signals and directly readable review text/snippets from Blog/Cafe/search results separately.

4. **Sample reviews with strata**
   - Target 300+ directly read reviews when feasible.
   - Minimum for a usable Bathtime listing: 100 directly read reviews, unless the platform pool is small.
   - Include latest reviews, low-rated reviews, onsen-keyword reviews, Korean reviews, room-type-specific reviews, and multiple platforms.
   - When only 50-99 reviews are accessible, label as initial/moderate sampling.
   - When under 50 reviews are accessible, label as exploratory only.
   - For deep research, first aim for platform diversity, then volume: include Google, Korean web/Naver, and at least one Japanese OTA whenever possible.
   - Separate room/plan-name facility evidence from body-text experience evidence. A room name like `露天・内湯` confirms the booked bath type, but does not by itself count as a guest's experiential praise or complaint.

5. **Tag review signals**
   - Read `references/tagging-guide.md` before tagging or summarizing signals.
   - Track mention_count, source_count, platform_count, contradiction_level, and review_signal_status.
   - Count independent authors, not repeated snippets from the same review.
   - When Korean user-intent phrases repeat, capture them as interpretation notes: `개인노천탕`, `객실탕`, `개별탕`, `대욕탕 없음`, `송영서비스`, `한국인 직원`, `아이/부모 동반`.

6. **Write the report**
   - Use `references/report-template.md`.
   - Include a collection briefing before interpretation.
   - State the data-quality grade and what would be needed to upgrade confidence.

7. **Write and gate the Korean card summary**
   - Read `docs/03-content/onsen-card-summary-guide.md`.
   - Produce `editorialCardSummary` with separate `official_basis` and `review_basis`.
   - Lead with a place-specific official fact such as view, bath scale, detached-room structure, or bath location. Do not lead with verdict labels.
   - Use `후기` in public copy. Do not expose the internal term `이용 경험`.
   - Convert unfamiliar Japanese units such as `畳` to Korean-readable metric units while preserving the original and conversion basis in evidence.
   - Use a definitive editorial conclusion after QA. Do not repeat `확인됩니다` in the card sentence.
   - Before active publication, run the card-summary dry-run, apply, and targeted verdict quality gate documented in the guide. Missing or weak evidence stays draft.

## Recommended Source Tactics

- Use browser/Aside for dynamic pages, Google hotel panels, logged-in or localized pages, screenshots, visible review counts, and UI-only review bodies.
- In Aside Browser, prefer `aside repl` + `snapshot()` for deterministic evidence. Use `aside exec` only when delegating broader browsing is more useful than exact capture.
- Always inspect current Aside CLI usage first when needed: `aside --help`, `aside repl --help`.
- Aside Browser is especially important for:
  - Google Maps review tabs, review summaries, rating distribution, and Korean-localized hotel panels.
  - Naver Blog/Cafe/search results, including Korean demand-signal snippets.
  - Jalan latest/archived reviews and pagination.
  - Agoda, Booking.com, Trip.com, Expedia, Hotels.com, Relux, Ikkyu, Yahoo Travel pages that render reviews dynamically.
- Use direct fetch/parsing when public page JSON exposes review body, room type, plan name, score, and date.
- Treat Google/OTA/Naver search snippets as directional evidence only unless the full review body is opened. Label snippet evidence clearly.
- Prioritize low-rating filters or negative keywords for hidden risks: `塩素`, `カルキ`, `温泉感`, `ぬるい`, `熱い`, `混雑`, `予約`, `部屋違い`, `대욕장`, `염소`, `미지근`, `예약`, `객실 변경`.

## Aside Browser Workflow

Use this workflow for every Tier 1 accommodation and whenever static collection reports blocked/insufficient access.

1. Open Google Maps with the Japanese name plus location, then snapshot the place panel.
   - Record rating, visible review count, rating distribution, review tab accessibility, and any Google/Tripadvisor/OTA blended review snippets.
   - Open the review tab. Capture latest visible reviews and expand "more" only when needed for signal-relevant text.
2. Open Naver search with Korean aliases and `후기`, `객실 노천탕`, `개별 노천탕`, `송영`.
   - Record Blog/Cafe result count qualitatively, visible review snippets, Korean demand signals, and login/access restrictions.
3. Open Jalan review page.
   - Check latest reviews and the archive link for reviews older than one year.
   - If archive pagination appears, treat the platform as extractable, even if static fetch originally saw only the latest page.
4. Open global OTA pages surfaced in Google/Naver results.
   - Prioritize pages with visible review body, language variety, room name, and date.
5. Save an addendum when Aside changes access status.
   - Include `source`, `url`, `new_access`, `visible_review_count`, `rating`, `sample_read_count_from_snapshot`, `signals`, and `status_change`.

Do not call a source "blocked" until Aside has been tried or there is a clear login/paywall/geo restriction in the browser snapshot.

## Confidence Language

- **A grade**: 300+ directly read reviews, 3+ platforms, stratified sampling, repeated signal. Say "강하게 반복된다".
- **B grade**: 100-299 directly read reviews, 2+ platforms. Say "뚜렷하게 확인된다".
- **C grade**: 50-99 directly read reviews. Say "초기 신호가 확인된다" or "반복 신호가 보인다".
- **D grade**: under 50 reviews or one-platform-only. Say "탐색 신호" or "판단 보류".
- **Conflicting**: positive and negative signals both repeat. Say "평가가 갈린다" and explain by bath area, room type, season, or platform if visible.

## Output Principles

- Write like a statistics-aware travel data editor: confident about what the sample supports, explicit about what it does not.
- Include exact sample sizes: "플랫폼상 673건, 직접 확인 120건, 온천 관련 64건".
- Do not inflate platform counts into evidence counts.
- Do not inflate search snippets into direct review counts. Keep `snippet_count` or `search_result_signal` separate when useful.
- Report when Aside revised an earlier static-fetch assumption.
- If the user asks for a quick pass, still label it as quick sampling and avoid A/B-grade language.

## References

- `references/tagging-guide.md`: signal taxonomy, count rules, confidence/status rules.
- `references/report-template.md`: Korean report structure and table templates.
