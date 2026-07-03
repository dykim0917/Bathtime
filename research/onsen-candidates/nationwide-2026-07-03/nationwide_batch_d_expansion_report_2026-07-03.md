# Nationwide Onsen Candidate Expansion Batch D

Date: 2026-07-03

## Scope

Batch D expands under-covered high-value onsen areas before deep review-signal research.

Primary accommodation areas:

- 黒川温泉 / Kurokawa
- 指宿温泉 / Ibusuki
- 雲仙温泉 / Unzen
- 乳頭温泉郷 / Nyuto
- 伊豆長岡温泉 / Izu Nagaoka
- あわら温泉 / Awara
- 城崎温泉 / Kinosaki
- 霧島温泉郷 / Kirishima

Primary facility areas:

- 黒川温泉 bath-pass and day-use bath route
- 指宿 sand bath and day-use facilities
- 雲仙 and 小浜 public baths / footbaths
- 乳頭温泉郷 day-use baths and guest-only bath-pass model
- あわら public bath / footbath
- 城崎 seven public baths
- 霧島 day-use / family bath / footbath facilities

## Added Files

- `nationwide_accommodation_batch_d_v0_5_2026-07-03.csv`
- `nationwide_kyushu_tohoku_facility_seed_v0_5_2026-07-03.csv`
- `nationwide_accommodation_master_v0_5_2026-07-03.csv`
- `nationwide_facility_master_v0_5_2026-07-03.csv`

## Collection Result

| file | rows_added_or_merged | note |
|---|---:|---|
| `nationwide_accommodation_batch_d_v0_5_2026-07-03.csv` | 84 | Added under-covered regional ryokan / onsen hotel candidates. |
| `nationwide_kyushu_tohoku_facility_seed_v0_5_2026-07-03.csv` | 48 | Added non-accommodation facility candidates. Three semantic duplicates from Ibusuki were removed before final validation, then five facility candidates were added to exceed the 500-candidate threshold. |
| `nationwide_accommodation_master_v0_5_2026-07-03.csv` | 332 | Unique accommodation candidates after merge. |
| `nationwide_facility_master_v0_5_2026-07-03.csv` | 170 | Unique facility candidates after merge. |
| total v0.5 master | 502 | Accommodation + facility unique candidates. |

## Validation

Validation command checked:

- duplicate `slug`
- empty core fields
- placeholder values: `TBD`, `TODO`, `N/A`
- rough tier and area distribution

Result:

| master | unique_rows | duplicate_slug_count | bad_core_cells |
|---|---:|---:|---:|
| accommodation v0.5 | 332 | 0 | 0 |
| facility v0.5 | 170 | 0 | 0 |

## Tier Distribution

| master | Tier 1 | Tier 2 | Tier 3 |
|---|---:|---:|---:|
| accommodation v0.5 | 214 | 106 | 12 |
| facility v0.5 | 96 | 67 | 7 |

## Data Quality Notes

This is still a **candidate-stage dataset**, not a final verified Bathtime listing.

- `verification_status` values intentionally remain conservative.
- Official bath facts and review signals are not fully confirmed for every row.
- Some rows are sourced from OTA/ranking/tourism pages and require official-site crosscheck before user-facing publication.
- Facility rows are intentionally separated from accommodation rows because the product logic differs: public bath, bath-pass, sand bath, footbath, family bath, and day-use flow.

## Next Recommended Work

1. Add one more nationwide batch to move from 502 to roughly 650-750 candidates.
2. Fill weaker regions: Kyushu beyond Beppu/Yufuin/Kurokawa/Ibusuki/Unzen/Kirishima, Chugoku, Shikoku, Hokuriku, and Tohoku.
3. Start Tier 1 review-signal deep research only after candidate identity cleanup.
4. For facility candidates, run the new facility-specific model rather than accommodation bath-area tagging.
