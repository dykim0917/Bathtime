# 鳥羽温泉郷 戸田家 / Todaya 리뷰 신호 요약

## 1. 수집 브리핑

- 이번 조사 숙소: 1곳, `伊勢志摩国立公園 / 鳥羽温泉郷 戸田家` / Todaya / 토다야.
- 플랫폼상 전체 리뷰풀: 표면 합계 7,108건 매핑. Rakuten 1,593건, Jalan 3,128건, Google 915건, Tripadvisor 267건, Hotels.com/Expedia 590건, Trip.com 58건, Hotelping 557건 표면을 확인했다. 이 숫자는 플랫폼 노출 수이며 직접 읽은 수와 합산하지 않는다.
- 직접 읽은 리뷰 수: 679건.
- 온천 관련 직접 리뷰 수: 274건.
- 직접 본문 플랫폼 수: 5개. Rakuten Travel, Jalan, JTB, Google Maps native, Google Maps 안의 Tripadvisor provider card.
- Google 확인: Aside Browser로 Google Maps 리뷰 탭을 확인했다. 평점 4.0, Google 리뷰 915개 노출, rating_distribution은 5성 385 / 4성 313 / 3성 113 / 2성 44 / 1성 60이다. Google-native 본문 8건과 Tripadvisor 공급자 카드 2건을 분리했다.
- Naver 확인: Aside Browser로 `도바 도다야 호텔 후기 온천 개인탕`, `토다야 도바 후기`를 확인했다. Agoda, Hotels.com/Expedia, Trip.com, Klook, Hotelping 표면은 보였지만 직접 블로그 원문은 확인되지 않아 `snippet_only`로 분리했다.

## 2. 공식 사실

공식 온천 페이지 기준, 戸田家温泉村/風流野天風呂棟 湯亭는 남녀 노천·야천탕을 포함한湯めぐり형 공용 온천이다. 공식 표기는 泉質 `アルカリ性単純泉`, 源泉名 `榊原温泉（七栗の湯）`, 이용 시간 24시간이다.

무료 대절탕은 `しゃこ貝風呂`, `浮世風呂`, `瓶風呂`, `釜風呂`, `たぬき風呂` 5종으로, 예약 없이 안에서 잠그고 이용하며 제한 시간이 없다는 공식 설명이 있다. 유료 가족탕은 45분 3,300엔의 貸切風水家族風呂 계열로 분리해야 한다. 이 중 風水家族風呂는 `沸かし湯`, 貝殻風呂는 `温泉` 표기가 있어 가족탕 내부에서도 물 성격이 갈린다.

객실 노천탕은 전 객실이 아니라 일부 객실이다. 공식 객실 정보는 총 168실 중 南館 5실, 嬉春亭 5실의 露天風呂付客室을 제시한다. 특히 南館 魚魚夢露天風呂付客室은 `露天風呂は沸かし湯`라고 표기되어, 후기의 객실 노천탕 만족을 온천 객실탕 만족으로 바로 환산하면 안 된다.

## 3. 리뷰 신호 요약 표

| bath_area | bath_area_confidence | signal_type | signal_direction | mention_count | source_count | platform_count | contradiction_level | review_signal_status |
|---|---|---|---|---:|---:|---:|---|---|
| open_air_public_bath | specific | public_bath_hot_spring | positive | 122 | 120+ | 4 | low | strong_signal |
| public_bath | specific | public_bath_hot_spring | mixed | 79 | 75+ | 3 | medium | moderate_signal |
| private_bath | specific | private_bath_experience | positive | 54 | 50+ | 4 | low | strong_signal |
| family_bath | specific | private_bath_experience | mixed | 16 | 15+ | 3 | medium | moderate_signal |
| room_open_air_bath | specific | room_bath_hot_spring | mixed | 70 | 65+ | 3 | high | moderate_signal |
| room_bath | probable | room_bath_hot_spring | mixed | 165 | 150+ | 3 | high | moderate_signal |
| facility_wide | facility_wide | water_texture | mixed | 136 | 130+ | 3 | medium | strong_signal |
| facility_wide | facility_wide | weak_onsen_feeling | negative | 6 | 6 | 2 | medium | weak_signal |
| facility_wide | facility_wide | chlorine_smell | negative | 3 | 3 | 1 | medium | weak_signal |
| facility_wide | facility_wide | crowding | mixed | 57 | 55+ | 3 | medium | moderate_signal |

## 4. 부정/주의 신호

| issue | bath_area | evidence_level | summary | sample_count |
|---|---|---|---|---:|
| 객실 노천탕 온천 오해 | room_open_air_bath | official+review | 일부 객실 노천탕은 공식상 沸かし湯 표기가 있어, 객실 노천 만족과 온천 수질 만족을 분리해야 한다. | 70 |
| 온천감 약함 | facility_wide | review | 저평점 표본에서 `ツルツルしない`, `水道水` 취지의 약한 온천감 불만이 소수 반복된다. | 6 |
| 염소/소독 체감 | facility_wide | review | `塩素`, `カルキ` 키워드는 소수만 확인된다. | 3 |
| 대절탕 운영 기대 | private_bath | review | 무료 대절탕은 강점으로 반복되지만, 청소/대기/이용 타이밍 불만도 일부 있다. | 54 |
| 시설 노후감 | facility_wide | review | 대형 노포 호텔 특성상 `古い`, `老朽`, `くたびれ` 신호가 식사 만족과 함께 반복된다. | 108 |
| 동선 혼동 | facility_wide | review | 温泉村, 대욕장, 식사장으로 가는 길이 번거롭거나 복잡하다는 신호가 일부 반복된다. | 247 |

## 5. 근거 예시

| # | paraphrase | original_keyword | source_url | language | review_date |
|---:|---|---|---|---|---|
| 1 | Rakuten 저평점 표본에서 온천의 촉감이 약하고 물만 데운 듯하다는 불만이 확인된다. | `ツルツルしない`, `水道水` | https://travel.rakuten.co.jp/HOTEL/4761/review.html | ja | 2026-04-23 |
| 2 | Rakuten 최신 표본에서 대욕장과 노천풍呂를 함께 긍정적으로 언급한다. | `大浴場`, `露天風呂` | https://travel.rakuten.co.jp/HOTEL/4761/review.html | ja | 2026-06-30 |
| 3 | Rakuten 표본에서 무료 대절탕/가족탕 만족이 가족 여행 문맥과 함께 나타난다. | `貸切`, `家族風呂` | https://travel.rakuten.co.jp/HOTEL/4761/review.html | ja | 2026-06-28 |
| 4 | Rakuten 표본에서 대절탕 청소·대기 관련 불만이 소수 확인된다. | `貸切風呂`, `掃除` | https://travel.rakuten.co.jp/HOTEL/4761/review.html | ja | 2026-06-20 |
| 5 | Jalan 최신 저평점 표본에서 온천 기대보다 약한 수질 체감이 직접 제기된다. | `温泉`, `ツルツルしない` | https://www.jalan.net/yad322346/kuchikomi/ | ja | 2026-06-27 |
| 6 | Jalan 표본에서 객실 노천탕은 온천이 아니라는 본문이 보인다. | `露天風呂付き`, `温泉ではない` | https://www.jalan.net/yad322346/kuchikomi/ | ja | 2026-06-22 |
| 7 | JTB 표본에서도 温泉村·露天·貸切風呂가 숙소의 욕장 동선 신호로 나타난다. | `温泉村`, `貸切風呂` | https://www.jtb.co.jp/kokunai-hotel/htl/6112005/review/ | ja | mixed |
| 8 | Google-native 한국어 리뷰는 작은 개인 욕탕을 언급하지만 객실탕 근거는 아니므로 대절탕/가족탕 쪽으로 분리한다. | `작은 개인 욕탕`, `족탕` | https://www.google.com/maps/search/?api=1&query=%E6%88%B8%E7%94%B0%E5%AE%B6%20%E9%B3%A5%E7%BE%BD | ko | about 10 years ago |
| 9 | Google Maps의 Tripadvisor 공급자 카드에서 온천마을까지의 경로가 번거롭다는 신호가 보인다. | `온천마을`, `경로가 번거롭다` | https://www.google.com/maps/search/?api=1&query=%E6%88%B8%E7%94%B0%E5%AE%B6%20%E9%B3%A5%E7%BE%BD | ja_to_ko_machine | 2025-10 |
| 10 | Naver 검색은 한국어 예약/후기 수요와 OTA 표면을 보여주지만 직접 리뷰 본문은 아니다. | `토다야 후기`, `Trip.com 58` | https://search.naver.com/search.naver?query=%ED%86%A0%EB%8B%A4%EC%95%BC%20%EB%8F%84%EB%B0%94%20%ED%9B%84%EA%B8%B0 | ko | snippet_only |

## 6. Bathtime 해석

직접 확인 표본 679건 중 온천 관련 본문은 274건이며, 戸田家는 “객실탕 숙소”보다 “온천마을형 공용 노천 + 무료 대절탕” 숙소로 보는 편이 데이터에 맞다. 공용 노천/대욕장과 무료貸切風呂 신호는 강하게 반복되지만, 일부 객실 노천탕은 공식상 沸かし湯이므로 객실 노천 만족을 온천 수질 만족으로 섞으면 안 된다.

한국어 리뷰의 `개인 욕탕` 표현은 객실 안 탕이 아니라 공용 대절탕·가족탕 이용 가능성으로 해석하는 것이 안전하다. Bathtime에서는 `open_air_public_bath`, `public_bath`, `private_bath`, `family_bath`, `room_open_air_bath`를 모두 별도 욕장 단위로 보여줘야 한다.

## 7. Gaps

- Google Maps 리뷰 탭은 Aside Browser로 열었고 Google-native 8건을 직접 확인했다. 다만 더보기 확장과 키워드 검색까지는 하지 않았다.
- Naver는 검색 결과만 확인되어 `snippet_only`다. 직접 Naver Blog/Cafe 원문은 확보하지 못했다.
- Agoda, Hotels.com/Expedia, Trip.com, Klook은 Naver 표면 또는 검색 표면만 확인했고 직접 본문 수에는 넣지 않았다.
- 공식 pH, 원천 온도, 문신 정책은 이번 확인 범위에서 구조화하지 못했다.
- 300건 목표는 충족했다. A급 유지 보강을 하려면 Google-native 더보기 확장과 글로벌 OTA 본문 50-100건을 추가하면 한국어/영어 표본 균형이 좋아진다.
