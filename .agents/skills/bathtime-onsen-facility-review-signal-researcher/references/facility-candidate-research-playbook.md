# Facility Candidate Research Playbook

Use this reference for regional or nationwide Bathtime research where the target is a list of non-accommodation onsen facilities rather than one deep review report.

## Scope

Include:

- Day-use onsen facilities, municipal public baths, historic public baths.
- Family/private bath centers and reservable private-bath facilities.
- Sand bath, steam bath, footbath, drinking spring, inhalation, and onsen experience facilities.
- Wellness/spa complexes when onsen bathing is a meaningful user decision.
- Route/pass or area-cluster rows only as discovery leads; split them before deep comparison when needed.

For nationwide expansion, split candidates into two tracks before tiering:

- `traditional_onsen_facility`: historic public baths, sotoyu, municipal public baths, symbolic open-air baths, sand/steam baths, family/private bath centers, and onsen-area route/pass leads.
- `spa_complex_super_sento`: urban spa complexes, super sento, wellness/sauna facilities, onsen theme parks, and spa facilities with optional lodging or overnight rest.

If a spa complex offers lodging, capsule stays, or overnight rest, keep it in the facility dataset when the primary user decision is bathing/spa/sauna use. Record `lodging_available`, but do not move it into the accommodation dataset unless room booking is the primary product.

Exclude or hold:

- Lodging-only ryokan/hotels unless the facility has a clear non-guest day-use product.
- Sightseeing-only assets with no bathing/footbath/drinking/steam use.
- Duplicates, permanently closed facilities, and ambiguous map rows that cannot be tied to an official or municipal/tourism source.

## Discovery Sources

Use a broad source mix. Do not rely on one ranking page.

- Official municipal and tourism association pages.
- Nifty Onsen, Jalan day-use pages, Rakuten Travel day-use entries when present.
- Google Maps and Yahoo Map for visible demand and duplicate/closure checks.
- Tripadvisor, 4travel, Japanese blogs, local media, and facility-specific pages.
- Naver Blog/Cafe/search and Korean travel communities for Korean demand signals.

Use Aside Browser for Google Maps, Naver, dynamic review tabs, paginated pages, and any source where static fetch exposes only fragments. If Aside Browser was not used for such a source, record `미확인`, not `후기 없음` or `차단`.

## Candidate Collection Workflow

1. Build a seed list by region and facility type.
2. Normalize names using the Japanese official name first, then Korean/English aliases and old names.
3. Attach at least one authority URL: official site, municipal page, tourism association page, or reliable operator page.
4. Assign `facility_type`, `facility_model`, archetype, and cleanup status before tiering.
5. Record review surfaces separately from review evidence: visible review pool, rating, directly readable status, and Korean demand signal.
6. Tier by Bathtime value, not only rating:
   - Tier 1: high travel demand or famous facility, distinctive bath/experience, strong review pool, Korean usefulness.
   - Tier 2: credible regional value, moderate review pool, useful product but less urgent.
   - Tier 3: niche, low review pool, uncertain accessibility, or weak Korean demand.
   - hold: needs split, closure/duplicate check, lodging-only ambiguity, or non-bathing uncertainty.
7. Mark split/exclude issues immediately. A town-wide bath route, footbath street, or family-bath district should not be treated as one comparable bath facility unless the user explicitly wants area-level data.

## Facility-Type Search Patterns

Search in Japanese first, then Korean and English variants.

- Public bath/day use: `日帰り温泉`, `共同浴場`, `外湯`, `立ち寄り湯`, `公衆浴場`.
- Family/private bath: `家族風呂`, `貸切風呂`, `貸切湯`, `個室風呂`.
- Sand/steam: `砂むし`, `砂湯`, `砂風呂`, `むし湯`, `蒸し湯`.
- Footbath/stopover: `足湯`, `飲泉`, `温泉吸入`.
- Korean demand: `지역명 온천`, `시설명 후기`, `가족탕`, `모래찜질`, `당일온천`, `대중탕`.

## Minimum Output Fields

For candidate mode, produce or update a table/CSV with:

`candidate_slug`, `candidate_track`, `korean_name`, `japanese_name`, `aliases`, `facility_type`, `facility_model`, `archetype`, `lodging_available`, `prefecture`, `municipality`, `onsen_area`, `official_url`, `map_or_review_url`, `visible_review_pool`, `korean_demand_signal`, `product_strength`, `likely_tier`, `tier_reason`, `cleanup_status`, `verification_status`, `source_urls`, `notes`.

Do not add deep-review signal fields unless reviews were directly read and tagged.

## QA Before Finalizing

Check:

- No duplicate Japanese official names unless they are intentionally separate branches/products.
- Every Tier 1 row has an official/municipal/tourism URL and at least one map/review/OTA URL.
- Every row has `candidate_track` filled as `traditional_onsen_facility` or `spa_complex_super_sento`.
- Every route/pass, area cluster, and footbath-only row has the right cleanup status.
- Lodging-only rows are excluded or marked hold unless day-use use is confirmed.
- Spa complexes with optional lodging are marked `lodging_available=true` or `unclear` instead of being silently moved to accommodations.
- Visible review count is not described as directly read evidence.
- Korean demand is based on observable Korean search/blog/cafe traces, not assumption.
- Volatile facts such as hours, prices, reservation rules, and closures are marked as needing fresh confirmation before user-facing guidance.
