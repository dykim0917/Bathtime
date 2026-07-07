# review_signal_summary_2026-07-04: 南紀白浜 和みの湯 花鳥風月

## 1. 수집 브리핑

- 이번 숙소: 1곳 `shirahama-kachofugetsu`
- 플랫폼상 visible review pool: 최소 1,124건
  - Rakuten 415 / Jalan 367 / Yahoo Travel 45 / Google Maps 297
  - Booking.com은 표면 URL만 확인했고, Naver는 정확 숙소 직접 본문을 찾지 못해 최소 합계에서 제외
- 직접 읽은 리뷰 수: 520건
  - 정적 직접 본문 490건: Rakuten 360, Jalan 130
  - Aside 직접 본문 30건: Yahoo Travel 30
- 온천 관련 직접 리뷰 수: 268건
- 직접 본문 플랫폼 수: 3개
- Google / Naver 확인 여부:
  - Google Maps/Hotels는 Aside Browser로 확인. rating 4.7, visible 297, 공급자 카드 Rakuten Travel/skyticket 확인. Google-native는 패널 업데이트 1건만 부분 확인했다.
  - Naver Search는 Aside Browser로 확인했으나 정확 숙소의 한국어 직접 본문은 발견하지 못했고 `snippet_only/not_found_exact`로 처리했다.
- data_quality_grade: B
  - 직접 300건과 3개 플랫폼 기준은 충족했지만, 한국어 직접 본문 층화와 Google-native 리뷰 탭 표본이 부족해 A가 아니라 B로 둔다.

## 2. 공식 사실

- 공식명: 南紀白浜 和みの湯 花鳥風月
- 한국어/영어 표기: 난키 시라하마 나고미노유 카초후게츠 / Kachofugetsu
- 주소/온천지명: 和歌山県西牟婁郡白浜町3729-32, 白浜温泉
- 공식 사이트: https://shirahama-kachofugetsu.com/
- OTA 표기: Rakuten `南紀白浜 和みの湯 花鳥風月`, Jalan `南紀白浜 和みの湯 花鳥風月`, Yahoo Travel `南紀白浜 和みの湯 花鳥風月`

공식/OTA 시설 설명 기준으로 이 숙소는 전 24실, 전 객실에 천연온천 반노천탕을 둔 구조다. 반대로 공용 대욕장은 두지 않는다고 안내되므로, Bathtime에서는 `public_bath` 만족 신호가 아니라 `public_bath_absence`와 `room_open_air_bath` 중심 숙소로 분리해야 한다. 별도 예약제 대절탕/가족탕은 이번 공식 확인 범위에서 시설로 확정하지 않았다.

## 3. 리뷰 신호 요약

| bath_area | signal_type | direction | mention_count | platform_count | status | 해석 |
|---|---|---:|---:|---:|---|---|
| room_open_air_bath | room_bath_hot_spring | positive | 407 | 3 | strong_signal | 객실 반노천/노천탕 만족이 직접 표본에서 강하게 반복된다. |
| room_bath | room_bath_hot_spring | positive | 333 | 3 | strong_signal | 객실 내 욕조·도기탕·방 안 온천 이용 만족이 핵심 축이다. |
| facility_wide | water_texture | positive | 222 | 3 | strong_signal | `温泉`, `泉質`, `ツルツル`, `すべすべ` 계열 수질 표현이 반복된다. |
| public_bath | booking_confusion | neutral | 14 | 2 | moderate_signal | 대욕장이 있다는 신호가 아니라, 대욕장이 없는 숙소라는 기대 조정 신호다. |
| room_open_air_bath | booking_confusion | mixed | 71 | 2 | moderate_signal | 바다/전망 만족과 함께 눈가림·시선·주차장 방향 기대치가 일부 섞인다. |
| room_bath | weak_onsen_feeling | negative | 5 | 1 | weak_signal | 온천감 약함 계열은 소수라 탐색 신호에 가깝다. |
| private_bath | private_bath_experience | neutral | 2 | 2 | insufficient | 별도 대절탕 경험이 아니라 “있으면 좋겠다” 계열 희망 신호로 보아야 한다. |

## 4. 근거 예시

1. Rakuten / ja / 2026-04-05 / `半露天風呂`, `露天風呂`: 객실 반노천탕 만족이 직접 본문에서 확인됨. https://travel.rakuten.co.jp/HOTEL/183409/review.html
2. Rakuten / ja / 2025-02-04 / `大浴場はない`, `温泉`: 대욕장 부재와 객실 온천 중심 해석이 함께 나타남. https://travel.rakuten.co.jp/HOTEL/183409/review.html
3. Rakuten / ja / 2026-01-13 / `温泉`: 낮은 평점 표본에서도 온천 언급이 분리 확인됨. https://travel.rakuten.co.jp/HOTEL/183409/review.html
4. Rakuten / ja / 2026-04-25 / `露天風呂`, `駐車場`: 객실탕 만족과 전망/주차장 방향 기대치가 같이 보임. https://travel.rakuten.co.jp/HOTEL/183409/review.html
5. Rakuten / ja / 2026-01-20 / `温泉`, `清潔`, `送迎`: 객실 온천과 운영/송영 신호가 함께 확인됨. https://travel.rakuten.co.jp/HOTEL/183409/review.html
6. Jalan / ja / 2025-11-23 / `部屋風呂`, `温泉`, `大浴場`: 객실탕 만족과 대욕장 부재 문맥을 분리해야 하는 표본. https://www.jalan.net/yad351872/kuchikomi/
7. Yahoo Travel / ja / 2026-03-30 / `陶器製の浴槽`, `温泉`: 도기 욕조·객실 온천 만족 신호. https://travel.yahoo.co.jp/00913643/review/
8. Yahoo Travel / ja / 2026-03-02 / `貸切露天風呂が欲しい`: 별도 대절 노천탕이 있다는 뜻이 아니라 희망/기대 신호. https://travel.yahoo.co.jp/00913643/review/
9. Yahoo Travel / ja / 2025-11-29 / `大浴場のないお宿`, `部屋風呂`: 대욕장 없음이 숙소 포지셔닝으로 직접 언급됨. https://travel.yahoo.co.jp/00913643/review/
10. Google Maps / ja / 2026 panel update / `温泉も楽しめました`, `送風口ホコリ`: Google은 visible 297과 별도로 패널 업데이트 1건만 직접 확인. https://www.google.com/maps/search/?api=1&query=%E5%8D%97%E7%B4%80%E7%99%BD%E6%B5%9C%20%E5%92%8C%E3%81%BF%E3%81%AE%E6%B9%AF%20%E8%8A%B1%E9%B3%A5%E9%A2%A8%E6%9C%88

## 5. Bathtime 해석

직접 확인 520건 중 온천 관련 268건에서, 카초후게츠는 대욕장 순회형 숙소가 아니라 객실 반노천탕을 중심으로 읽어야 하는 숙소다. 특히 `대욕장 없음`은 약점이라기보다 상품 설계에 가까우며, 리뷰에서도 객실탕을 반복 이용하는 만족 신호가 강하게 나타난다. 다만 한국어 직접 본문과 Google-native 리뷰 탭 표본이 아직 약하므로, 데이터 등급은 A가 아니라 B로 둔다.

## 6. Gaps

- Google-native 리뷰 탭 본문은 이번 라운드에서 1건 패널 업데이트만 확인했고, 본격 태깅하지 못했다.
- Naver Search는 정확 숙소 한국어 직접 본문이 확인되지 않아 직접 리뷰 수 0건으로 처리했다.
- Booking.com은 URL을 확인했지만 300건/3플랫폼 기준 충족 후 직접 본문 표본에 포함하지 않았다.
- Rakuten/Jalan의 정적 태그에서 `大浴場` 단어가 일부 잡히지만, 공식 사실과 Yahoo 직접 본문상 공용 대욕장이 없는 숙소이므로 public bath 만족 신호로 해석하지 않는다.
- A로 올리려면 Google-native 리뷰 탭 20건 이상, Naver Blog/Cafe 또는 한국어 OTA 직접 본문 10건 이상을 추가 확인하는 것이 우선이다.
