# Kyushu Candidate Verification / Normalization Report

Date: 2026-07-03

## Scope

- 담당 지역: 규슈 중 `熊本県`, `鹿児島県`, `長崎県`, `佐賀県`, `大分県`.
- 입력 마스터: `nationwide_accommodation_master_v0_6_2026-07-03.csv`, `nationwide_facility_master_v0_6_2026-07-03.csv`.
- 이번 단계는 딥리뷰 신호 수집이 아니라 후보 검증/정규화 단계다.
- 숙소와 온천시설은 별도 파일 및 `kind`로 분리했다.
- 다른 지역 후보는 확장하지 않았다.

## Collection Briefing

- 이번에 본 후보: 총 94건. 숙소 56건, 온천시설 38건.
- Tier 1 우선 처리: 숙소 37건, 온천시설 26건, 총 63건.
- Tier 2/3 대상 현 후보: 숙소 19건, 온천시설 12건. 이번 패스에서는 `hold`로 둔다.
- 플랫폼상 전체 리뷰풀: 이번 산출물에서는 합산하지 않았다. 기존 Tier 1 검증 배치의 `visible_review_pool_observation`에 보이는 표면 수치만 보존했다.
- 직접 확인 리뷰 수: 0건. 리뷰 본문 태깅 단계가 아니므로 플랫폼 리뷰 수와 직접 읽은 리뷰 수를 섞지 않았다.
- 온천 관련 직접 리뷰 수: 0건.
- 접근 실패 플랫폼: 이번 패스에서는 신규 브라우저/동적 페이지 검증을 하지 않았으므로 blocked 판정을 새로 만들지 않았다.

## Status Counts

| kind | status | count |
|---|---:|---:|
| accommodation | ready | 37 |
| accommodation | hold | 19 |
| accommodation | merge | 1 |
| accommodation | split_needed | 1 |
| accommodation | route_or_pass | 0 |
| accommodation | footbath_only | 0 |
| accommodation | operation_recheck | 3 |
| facility | ready | 17 |
| facility | hold | 17 |
| facility | merge | 1 |
| facility | split_needed | 1 |
| facility | route_or_pass | 2 |
| facility | footbath_only | 1 |
| facility | operation_recheck | 5 |

## Status Rules Used

- `ready`: 공식/OTA/리뷰 표면 검증이 있어 다음 단계의 리뷰풀 계수화 또는 딥리서치로 넘길 수 있는 후보.
- `hold`: 공식 상세, 운영자 공식, 또는 Tier 1 외 검증이 부족해 추가 표면 검증이 필요한 후보.
- `merge`: 리브랜딩/명칭 통합/slug-name mismatch가 확인된 후보.
- `split_needed`: 지역 클러스터, 객실 타입 혼동, 숙박 상품과 당일입욕/가족탕 분리 필요가 확인된 후보.
- `route_or_pass`: 단일 시설이 아니라 탕순례 패스나 운영현황 허브인 후보.
- `footbath_only`: 입욕시설이 아니라 족욕 중심인 후보.
- `operation_recheck`: 가격, 휴관, 접수시간, 운영자 공식 확인 같은 최신 운영 재확인이 필요한 후보.

## Next Deep Research Priority

| order | kind | prefecture | slug | name_ja | status | reason |
|---:|---|---|---|---|---|---|
| 1 | accommodation | 佐賀県 | takeo-koyokaku | 武雄温泉 懐石宿 扇屋 | ready | Jalan shows 576 reviews and bath 4.7; Rakuten review page shows 247 marker in search surface |
| 2 | accommodation | 佐賀県 | ureshino-oyado-nonoka | 嬉野温泉 大正屋 | ready;merge | Rakuten shows 1,216 reviews; Jalan review surface has recent 2026 reviews |
| 3 | accommodation | 佐賀県 | ureshino-shiibasanso | 嬉野温泉 椎葉山荘 | ready | Jalan shows 872 reviews and bath high-rating surface; Rakuten surface exists |
| 4 | accommodation | 熊本県 | kurokawa-noshiyu | 黒川温泉 お宿 のし湯 | ready | Rakuten review surface shows 408 marker; Jalan/Booking surfaces exist |
| 5 | accommodation | 鹿児島県 | ibusuki-hakusuikan | 指宿白水館 | ready | Agoda shows 1,050 reviews; Jalan/Rakuten/JTB surfaces exist |
| 6 | accommodation | 鹿児島県 | ibusuki-yurian | 温泉水プール＆夫婦露天風呂の離れ宿 悠離庵 | ready | Jalan shows 530 reviews; Rakuten/Ikkyu surfaces exist |
| 7 | accommodation | 鹿児島県 | kirishima-lavista | ラビスタ霧島ヒルズ | ready | Rakuten review surface mentions all-room open-air, rock bed/lying bath, pet-room and resort stay; third-party pages c... |
| 8 | accommodation | 熊本県 | kurokawa-yamamizuki | 黒川温泉 山みず木 | ready | Jalan shows 568 and bath 5.0 surface; Ikkyu shows 60; Yahoo/JTB surfaces exist |
| 9 | accommodation | 佐賀県 | ureshino-wataya-besso | 嬉野温泉 和多屋別荘 | ready | Jalan/Rakuten/Travelko/お湯たび surfaces exist; day-use official note visible via official hot spring page |
| 10 | accommodation | 熊本県 | kurokawa-okunoyu | 黒川温泉 旅館奥の湯 | ready;operation_recheck | review count not locked |
| 11 | accommodation | 熊本県 | kurokawa-sanga | 黒川温泉 旅館山河 | ready | Ikkyu/Jalan/Rakuten review surfaces exist |
| 12 | accommodation | 熊本県 | kurokawa-senomoto-kogen-hotel | 瀬の本高原ホテル | ready | review count not locked |

## Gaps / Next Agent Actions

1. Tier 1의 `ready` 후보부터 Google Maps, Jalan/Rakuten/Ikkyu/Agoda 등 플랫폼별 visible review count를 별도 필드로 잠근다.
2. `hold` 후보는 공식 사이트/운영자 URL을 먼저 열어 정체성, 욕장 구조, 숙박/시설 분리를 재확인한다.
3. `split_needed` 후보는 객실탕, 객실 노천탕, 대욕장, 대절/가족탕, 당일입욕 상품을 행 또는 하위 product로 분리한다.
4. `route_or_pass`와 `footbath_only`는 숙소/온천시설 딥리뷰 큐에 그대로 넣지 말고 route/pass 또는 stopover 모델로 보낸다.
5. 다음 딥리뷰 단계에서만 직접 리뷰 수와 온천 관련 직접 리뷰 수를 기록한다.

## Output Files

- `kyushu_accommodation_candidate_status_2026-07-03.csv`
- `kyushu_facility_candidate_status_2026-07-03.csv`
- `kyushu_candidate_status_manifest_2026-07-03.csv`
- `kyushu_candidate_status_report_2026-07-03.md`
