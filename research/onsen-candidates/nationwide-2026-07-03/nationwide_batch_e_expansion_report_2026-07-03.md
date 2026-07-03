# Nationwide Onsen Candidate Expansion Batch E

Date: 2026-07-03

## Purpose

Batch E expands the nationwide candidate dataset from the first 500-candidate threshold toward a more serviceable national seed list.

The previous v0.5 master was strong in Yufuin/Beppu-adjacent work, Hakone, Kusatsu, Atami, Izu, Arima, Gero, Noboribetsu, Jozankei, Kurokawa, Ibusuki, Unzen, Nyuto, Kinosaki, Awara, and Kirishima. It was still thin in Nagano, Niigata, Hokuriku, Sanin/Sanyo, Saga, and several Tohoku areas.

Batch E focuses on those thinner areas.

## Added Files

- `nationwide_accommodation_batch_e_v0_6_2026-07-03.csv`
- `nationwide_facility_batch_e_v0_6_2026-07-03.csv`
- `nationwide_accommodation_master_v0_6_2026-07-03.csv`
- `nationwide_facility_master_v0_6_2026-07-03.csv`

## Added Candidate Areas

Accommodation-heavy additions:

- 野沢温泉 / Nozawa
- 湯田中・渋温泉 / Yudanaka-Shibu
- 別所温泉 / Bessho
- 白骨温泉 / Shirahone
- 越後湯沢温泉 / Echigo Yuzawa
- 月岡温泉 / Tsukioka
- 瀬波温泉 / Senami
- 山代温泉 / Yamashiro
- 山中温泉 / Yamanaka
- 和倉温泉 / Wakura
- 片山津温泉 / Katayamazu
- 宇奈月温泉 / Unazuki
- 三朝温泉 / Misasa
- 皆生温泉 / Kaike
- 玉造温泉 / Tamatsukuri
- 湯原温泉 / Yubara
- 湯田温泉 / Yuda
- 嬉野温泉 / Ureshino
- 武雄温泉 / Takeo
- 銀山温泉 / Ginzan
- 蔵王温泉 / Zao
- かみのやま温泉 / Kaminoyama
- 酸ヶ湯・浅虫・花巻・つなぎ・会津東山・飯坂

Facility-heavy additions:

- Nozawa external public bath route
- Shibu nine-bath route
- Bessho public bath route
- Shirahone public open-air bath
- Echigo Yuzawa day-use baths
- Tsukioka public bath / footbath
- Hokuriku `総湯` culture: Yamashiro, Yamanaka, Wakura, Katayamazu, Unazuki
- Misasa radium public baths / river bath / heat-bath experience
- Kaike, Tamatsukuri, Yubara, Yuda, Ureshino, Takeo public bath and footbath facilities
- Ginzan, Zao, Kaminoyama, Sukayu, Asamushi, Hanamaki, Iizaka facility candidates

## Collection Result

| file | rows |
|---|---:|
| `nationwide_accommodation_batch_e_v0_6_2026-07-03.csv` | 91 |
| `nationwide_facility_batch_e_v0_6_2026-07-03.csv` | 58 |
| `nationwide_accommodation_master_v0_6_2026-07-03.csv` | 423 |
| `nationwide_facility_master_v0_6_2026-07-03.csv` | 228 |
| total v0.6 master | 651 |

## Validation

Validation checked:

- duplicate `slug`
- empty core fields
- placeholder values: `TBD`, `TODO`, `N/A`
- tier distribution
- rough prefecture / area distribution

Result:

| master | unique_rows | duplicate_slug_count | bad_core_cells |
|---|---:|---:|---:|
| accommodation v0.6 | 423 | 0 | 0 |
| facility v0.6 | 228 | 0 | 0 |

## Tier Distribution

| master | Tier 1 | Tier 2 | Tier 3 |
|---|---:|---:|---:|
| accommodation v0.6 | 284 | 127 | 12 |
| facility v0.6 | 143 | 78 | 7 |

## Interpretation

The dataset is now large enough to function as a national candidate seed for Bathtime prioritization. It is not yet a verified publication dataset.

Useful strengths:

- 숙소와 시설이 분리되어 있어, 객실탕 중심 숙박 데이터와 당일온천/공동탕/족욕/외탕순례 데이터가 섞이지 않는다.
- Tier 1 후보가 숙소 284개, 시설 143개로 충분히 넓어져, 이후 심층 리뷰 수집 우선순위를 잡을 수 있다.
- 한국인 수요가 강한 유후인/벳푸/하코네/쿠사츠/아리마뿐 아니라, 일본 온천문화 신호가 강한 공동탕·외탕 지역도 들어갔다.

Remaining limitations:

- Official URLs and Google Maps / OTA URLs are not yet filled row-by-row.
- `source_basis` is candidate-stage provenance, not final source citation.
- `verification_status` remains conservative by design.
- Deep review signal fields are intentionally not assigned at this stage.

## Next Gate

Before deep review collection, run an identity cleanup pass:

1. Add official URL / Google Maps URL / primary OTA URL for Tier 1 rows.
2. Merge semantic duplicates and old-name/new-name variants.
3. Split rows that are actually accommodation day-use products rather than independent facilities.
4. Lock Tier 1 review research queue.
