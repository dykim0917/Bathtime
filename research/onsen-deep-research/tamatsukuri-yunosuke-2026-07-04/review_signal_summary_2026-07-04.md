# 玉造グランドホテル長生閣 / Choseikaku 리뷰 신호 요약

## 1. 수집 브리핑

- 이번 조사 숙소: 1곳, `玉造グランドホテル長生閣` / Tamatsukuri Grand Hotel Choseikaku / 다마쓰쿠리 그랜드 호텔 초세이카쿠.
- 플랫폼상 전체 리뷰풀: 최소 5,238건 매핑. Rakuten 1,658건, Jalan 2,206건, Google 986건, Tripadvisor 178건, Trip.com 50건, Expedia/Hotels.com 160건 표면 기준이다. 이 숫자는 플랫폼 노출 수이며 직접 읽은 수와 합산하지 않는다.
- 직접 읽은 리뷰 수: 599건.
- 온천 관련 직접 리뷰 수: 336건.
- 직접 본문 플랫폼 수: 5개. Rakuten Travel, Jalan, JTB, Google Maps native, Google Maps 안의 Tripadvisor provider card.
- Google 확인: Aside Browser로 Google Maps 리뷰 탭을 확인했다. 평점 4.1, Google 리뷰 986개 노출, rating_distribution은 5성 404 / 4성 381 / 3성 153 / 2성 16 / 1성 32다. Google-native 본문 8건과 Tripadvisor 공급자 카드 2건을 분리했다.
- Naver 확인: Aside Browser로 `일본 시마네 다마쓰쿠리 초세이카쿠 후기 온천`을 확인했다. Trip.com, Expedia/Hotels.com, 네일동 카페 표면은 보였지만 직접 원문은 열지 않았으므로 `snippet_only`로 분리했다.

## 2. 공식 사실

공식 사이트와 Rakuten 온천 페이지 기준, 이 숙소의 대표 온천 시설은 `めのう風呂`가 있는 대욕장이다. Rakuten 온천 페이지는 출雲神話 콘셉트의 대욕장과 파워스톤 `めのう`를 깐 욕조를 소개하며, 욕장 종류로 `温泉`, `大浴場`, `露天風呂`를 제시한다.

泉質은 Rakuten 표면 기준 `単純温泉`, `低張性弱アルカリ性泉`, `カルシウム・ナトリウム硫酸塩泉`이다. 별도 OTA 표면에서는 pH 8.4와 자가원천 블렌드 언급이 보이나, 이번 보고서에서는 공식/OTA 시설 주장으로만 둔다.

객실 노천탕은 전 객실이 아니다. Rakuten/Jalan 리뷰의 객실명과 Google-native 한국어 본문에서 `最上階`, `露天風呂付`, `温泉付き最上階客室` 신호가 보이므로 일부 객실 노천탕 축은 분리하되, 일반 객실 욕실과 섞지 않는다.

## 3. 리뷰 신호 요약 표

| bath_area | bath_area_confidence | signal_type | signal_direction | mention_count | source_count | platform_count | contradiction_level | review_signal_status |
|---|---|---|---|---:|---:|---:|---|---|
| public_bath | specific | public_bath_hot_spring | positive | 312 | 300+ | 5 | low | strong_signal |
| open_air_public_bath | specific | public_bath_hot_spring | positive | 30 | 30+ | 4 | low | strong_signal |
| room_open_air_bath | specific | room_bath_hot_spring | positive | 51 | 50+ | 4 | medium | strong_signal |
| room_bath | probable | room_bath_hot_spring | mixed | 148 | 140+ | 3 | high | moderate_signal |
| family_bath | probable | private_bath_experience | neutral | 19 | 18+ | 3 | medium | moderate_signal |
| private_bath | unclear | private_bath_experience | neutral | 13 | 13 | 2 | medium | weak_signal |
| facility_wide | facility_wide | water_texture | positive | 247 | 240+ | 5 | low | strong_signal |
| facility_wide | facility_wide | crowding | mixed | 50 | 48+ | 4 | medium | moderate_signal |
| facility_wide | facility_wide | weak_onsen_feeling | negative | 5 | 5 | 2 | medium | weak_signal |
| facility_wide | facility_wide | chlorine_smell | negative | 1 | 1 | 1 | low | insufficient |

## 4. 부정/주의 신호

| issue | bath_area | evidence_level | summary | sample_count |
|---|---|---|---|---:|
| 객실탕/객실 노천탕 혼재 | room_bath | review_tagging | 일반 객실 욕실, 객실 노천탕, 최상층 온천 객실 신호가 자동 태그에서 섞인다. 객실 노천탕만 별도 표시해야 한다. | 148 |
| 노후/청소 | facility_wide | review | `古い`, `清掃`, `老朽` 계열이 반복되지만 대체로 리뉴얼·청결 긍정과 같이 나타난다. | 100 |
| 대욕장 크기/기대 | public_bath | review | 대욕장 넓음은 반복되나 일부는 사진 기대와 실제 차이를 말한다. | 98 |
| 온도 | public_bath | review | `ぬるい`, `熱い`, `温度` 신호는 소수다. | 19 |
| 혼잡 | facility_wide | review | 시간대에 따라 독점 상태/혼잡 회피가 모두 나타난다. | 50 |
| 가족탕/대절탕 공식 구조 미확인 | family_bath | review+gap | 가족탕 존재 신호는 있으나 공식 상세 구조는 이번 범위에서 충분히 구조화하지 못했다. | 19 |

## 5. 근거 예시

| # | paraphrase | original_keyword | source_url | language | review_date |
|---:|---|---|---|---|---|
| 1 | Rakuten 표본에서 메노우 대욕장과 온천 만족이 함께 반복된다. | `めのう風呂`, `大浴場` | https://travel.rakuten.co.jp/HOTEL/10743/review.html | ja | 2026-06-19 |
| 2 | Rakuten 표본에서 미인탕 체감과 피부 매끈함이 반복된다. | `美肌の湯`, `ツルツル` | https://travel.rakuten.co.jp/HOTEL/10743/review.html | ja | 2026-06-07 |
| 3 | Rakuten 표본에서 객실 노천탕/최상층 객실 신호가 보인다. | `温泉付き最上階客室`, `露天風呂` | https://travel.rakuten.co.jp/HOTEL/10743/review.html | ja | 2026-04-11 |
| 4 | Jalan 최신 표본에서 메노우탕과 큰 돌 노천탕이 함께 긍정적으로 언급된다. | `メノウのお風呂`, `大きな石の露天風呂` | https://www.jalan.net/yad306939/kuchikomi/ | ja | 2026-06-21 |
| 5 | Jalan 표본에서 객실 노천탕이 온천으로 계속 나온다는 신호가 확인된다. | `お部屋の露天風呂`, `温泉が出続け` | https://www.jalan.net/yad306939/kuchikomi/ | ja | 2026-06-06 |
| 6 | JTB 표본에서도 대욕장·노천탕·정원 분위기 신호가 반복된다. | `大浴場`, `露天風呂` | https://www.jtb.co.jp/kokunai-hotel/htl/7323006/review/ | ja | mixed |
| 7 | Google-native 한국어 리뷰에서 온탕과 노천탕을 직접 이용한 신호가 보인다. | `온탕`, `노천탕` | https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%89%E3%83%9B%E3%83%86%E3%83%AB%E9%95%B7%E7%94%9F%E9%96%A3 | ko | about 1 year ago |
| 8 | Google-native 한국어 리뷰에서 최상층 객실 노천탕과 원천 사용 체감이 강하게 긍정된다. | `최상층 노천탕 첨부`, `온천원천` | https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%89%E3%83%9B%E3%83%86%E3%83%AB%E9%95%B7%E7%94%9F%E9%96%A3 | ko | about 4 years ago |
| 9 | Tripadvisor 공급자 카드에서는 대욕장이 사진 기대와 실제가 다르다는 한국어 주의 신호가 있다. | `대욕장`, `사진과 실제` | https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E9%80%A0%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%89%E3%83%9B%E3%83%86%E3%83%AB%E9%95%B7%E7%94%9F%E9%96%A3 | ko | about 8 years ago |
| 10 | Naver 검색은 Trip.com/Expedia/카페 수요 신호를 보이지만 직접 본문은 아니다. | `네일동`, `Trip.com 50` | https://search.naver.com/search.naver?query=%EC%9D%BC%EB%B3%B8%20%EC%8B%9C%EB%A7%88%EB%84%A4%20%EB%8B%A4%EB%A7%88%EC%93%B0%EC%BF%A0%EB%A6%AC%20%EC%B4%88%EC%84%B8%EC%9D%B4%EC%B9%B4%EC%BF%A0%20%ED%9B%84%EA%B8%B0%20%EC%98%A8%EC%B2%9C | ko | snippet_only |

## 6. Bathtime 해석

직접 확인 표본 599건 중 온천 관련 본문은 336건이며, 이 숙소는 메노우 대욕장과 공용 노천탕, 미인탕 수질 신호가 강하게 반복된다. 객실 노천탕도 뚜렷하지만 전 객실형이 아니므로, Bathtime에서는 `public_bath`와 `open_air_public_bath`를 중심축으로 두고 `room_open_air_bath`를 일부 객실 옵션으로 분리하는 편이 데이터에 맞다.

한국어 Google-native 리뷰에서도 대욕장/노천탕과 최상층 객실 노천탕이 모두 확인된다. 다만 일반 `部屋風呂` 태그는 객실 욕실과 온천 객실이 섞이므로, 객실탕 만족 신호로 과대 해석하지 않는 편이 안전하다.

## 7. Gaps

- Google Maps 리뷰 탭은 Aside Browser로 열었고 Google-native 8건을 직접 확인했다. 더보기 확장과 키워드 검색까지는 하지 않았다.
- Naver는 검색 결과와 카페 표면만 확인되어 `snippet_only`다. 네일동 카페 원문은 로그인/접근 확인 전이라 직접 리뷰 수에 넣지 않았다.
- Yahoo Travel/Relux는 검색 표면상 직접 본문 가능성이 있으나 이번 A등급 달성 후 추가 표본으로 넣지 않았다.
- 공식 이용 시간, 문신 정책, 가수/가온/순환/소독 표기는 이번 확인 범위에서 구조화하지 못했다.
- 300건 목표는 충족했다. 다음에 더 보강한다면 Google-native 키워드 검색, Yahoo/Relux 직접 본문, Naver 카페 원문 접근을 우선한다.
