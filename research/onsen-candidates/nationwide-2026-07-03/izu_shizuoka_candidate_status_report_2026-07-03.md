# Izu / Shizuoka Candidate Verification / Normalization Report

Date: 2026-07-03

## Scope

- 담당 지역: 이즈·시즈오카 중 `prefecture == 静岡県`.
- 입력 마스터: `nationwide_accommodation_master_v0_6_2026-07-03.csv`, `nationwide_facility_master_v0_6_2026-07-03.csv`.
- 이번 단계는 딥리뷰 신호 수집이 아니라 후보 검증/정규화 단계다.
- 숙소와 온천시설은 별도 CSV 및 `kind` 필드로 분리했다.
- 다른 지역 후보는 확장하지 않았다.

## Collection Briefing

- 이번에 본 후보: 총 61건. 숙소 46건, 온천시설 15건.
- Tier 1 우선 처리: 숙소 30건, 온천시설 6건, 총 36건.
- Tier 2/3 현 후보: 숙소 16건, 온천시설 9건. 이번 패스에서는 `hold` 중심으로 둔다.
- 플랫폼상 전체 리뷰풀: 이번 산출물에서는 합산하지 않았다. 기존 Tier 1 검증 배치의 `visible_review_pool_observation`에 보이는 표면 수치만 후보별로 보존했다.
- 직접 확인 리뷰 수: 0건. 리뷰 본문 태깅 단계가 아니므로 플랫폼 리뷰 수와 직접 읽은 리뷰 수를 섞지 않았다.
- 온천 관련 직접 리뷰 수: 0건.
- 접근 실패 플랫폼: 이번 패스에서는 신규 브라우저/동적 페이지 검증을 하지 않았으므로 blocked 판정을 새로 만들지 않았다.

## Status Counts

| kind | status | count |
|---|---:|---:|
| accommodation | ready | 29 |
| accommodation | hold | 16 |
| accommodation | merge | 1 |
| accommodation | split_needed | 20 |
| accommodation | route_or_pass | 0 |
| accommodation | footbath_only | 0 |
| accommodation | operation_recheck | 2 |
| facility | ready | 4 |
| facility | hold | 11 |
| facility | merge | 0 |
| facility | split_needed | 1 |
| facility | route_or_pass | 0 |
| facility | footbath_only | 1 |
| facility | operation_recheck | 5 |

## Status Rules Used

- `ready`: 공식/OTA/리뷰 표면 검증이 있어 다음 단계의 리뷰풀 계수화 또는 딥리서치로 넘길 수 있는 후보.
- `hold`: Tier 1 외 후보이거나, 공식 상세/운영자 공식/욕장 구조 확인이 부족해 추가 표면 검증이 필요한 후보.
- `merge`: 리브랜딩, 명칭 통합, slug-name mismatch, 중복 후보 정리가 필요한 후보.
- `split_needed`: 숙소와 당일입욕시설, 객실탕과 대절탕, 객실타입별 욕장 차이, 자매관/복합시설 분리가 필요한 후보.
- `route_or_pass`: 단일 입욕시설이 아니라 회유권/패스/동선 모델로 보내야 하는 후보. 이번 静岡県 패스에서는 신규 부여 없음.
- `footbath_only`: 입욕시설이 아니라 족욕 중심으로 보이는 후보.
- `operation_recheck`: 영업시간, 휴관일, 가격, 성별운영, 제한영업, 접근성 등 최신 운영 재확인이 필요한 후보.

## Next Deep Research Priority

| order | kind | prefecture | slug | name_ja | status | reason |
|---:|---|---|---|---|---|---|
| 1 | accommodation | 静岡県 | atami-new-tomiyoshi | 味と湯の宿 ニューとみよし | ready;split_needed | Jalan shows 3,500 reviews; Rakuten review surface exists |
| 2 | accommodation | 静岡県 | atami-new-akao | ホテルニューアカオ | ready | Rakuten review surface shows 2.1k marker; Jalan has recent 2026 reviews |
| 3 | accommodation | 静岡県 | ito-juraku | 伊東ホテルジュラク | ready;split_needed | Rakuten review surface shows 972 marker; Yahoo/Jalan surfaces exist |
| 4 | accommodation | 静岡県 | ito-anda-resort | ホテル＆スパ アンダリゾート伊豆高原 | ready;split_needed | Rakuten/Jalan review surfaces exist |
| 5 | accommodation | 静岡県 | atami-fufu | ふふ 熱海 | ready | Ikkyu/Yahoo/Rakuten/Relux review surfaces exist;露天のみ注意 signal visible |
| 6 | accommodation | 静岡県 | atami-karaku | 熱海・伊豆山 佳ら久 | ready | Ikkyu review/story surface exists; count not locked |
| 7 | accommodation | 静岡県 | atami-sekaie | ATAMI せかいえ | ready | Yahoo/Ikkyu review surfaces exist; recent review visible |
| 8 | accommodation | 静岡県 | ito-gensen-tsuki | 伊東温泉 源泉と離れのお宿 月 | ready | Ikkyu/Yahoo/Rakuten review surfaces exist; count not locked |
| 9 | accommodation | 静岡県 | ito-fugetsumuhen | 御宿 風月無辺 | ready;split_needed | Ikkyu/Jalan/Rakuten review surfaces exist; count not locked |
| 10 | accommodation | 静岡県 | izu-nagaoka-yoshiharu | 湯めぐりの宿 吉春 | ready;split_needed | Rakuten/Yahoo surfaces mention room terrace open-air, public bath and private open-air repeated use, soft water, many baths and high bath score |
| 11 | accommodation | 静岡県 | izu-nagaoka-ishinoya | 石のや 伊豆長岡 | ready;split_needed | Ikkyu/Rakuten surfaces mention room open-air as main purpose, large room bath, repeated bathing, clean public bath and torotoro/smooth water texture |
| 12 | accommodation | 静岡県 | izu-nagaoka-sanyo-so | 三養荘 | ready;split_needed | Ikkyu/Rakuten/Expedia surfaces mention room onsen, no-smell clear slightly thick water, beauty-serum-like texture, large garden; some service/room temperature frictions appear |

## Facility Handling Notes

- `atami-fuua`는 숙소 `atami-korakuen`과 같은 리조트권 표면에 있지만, 당일온천시설 후보로 별도 유지한다.
- `ito-tokaikan`은 역사건축/문화시설 성격과 제한 입욕 운영을 함께 보이므로 운영일 재확인이 먼저다.
- `ito-kawana-irukahama`는 족탕 후보로 보이며, 숙소/온천시설 딥리뷰 큐에 바로 넣지 않는다.

## Gaps / Next Agent Actions

1. `ready` 후보부터 Google Maps, Jalan, Rakuten, Ikkyu, Yahoo Travel, Agoda 등 플랫폼별 visible review count를 별도 필드로 잠근다.
2. `split_needed` 후보는 객실 내탕, 객실 노천탕, 공용 대욕장, 공용 노천탕, 대절/가족탕, 숙소 외 당일온천시설을 분리해 다음 딥리서치 축을 만든다.
3. `merge` 후보 `izu-yumotokan`은 `ito-yumenoya`와 동일 일본어명/공식 후보로 보이므로 마스터 정체성 수정 또는 재동정이 필요하다.
4. `hold` 후보는 공식 URL과 운영자 표면 확인을 먼저 수행한 뒤 Tier 1 승격 여부를 판단한다.
5. 다음 딥리뷰 단계에서만 직접 리뷰 수와 온천 관련 직접 리뷰 수를 기록한다.

## Output Files

- `izu_shizuoka_accommodation_candidate_status_2026-07-03.csv`
- `izu_shizuoka_facility_candidate_status_2026-07-03.csv`
- `izu_shizuoka_candidate_status_manifest_2026-07-03.csv`
- `izu_shizuoka_candidate_status_report_2026-07-03.md`
