# 玉造温泉 湯之助の宿 長楽園 온천 리뷰 신호 요약

## 1. 수집 브리핑

- 조사 숙소: 1곳 (`tamatsukuri-chorakuen`)
- 플랫폼상 전체 리뷰풀: 원시 표면 합산 5,136건 이상. Jalan 3,611건, Google Maps 1,018건, Rakuten 127건, Yahoo/Ikkyu 66건, Trip.com 90건, Tripadvisor 224건 일부 표면을 포함한다. 중복 가능성이 있어 독립 리뷰풀로 해석하지 않는다.
- 직접 읽은 리뷰 수: 304건
- 온천 관련 직접 리뷰 수: 238건
- 직접 본문 플랫폼 수: 6개(Rakuten Travel, Jalan, Yahoo Travel, Google Maps native, Trip.com, Naver Blog)
- Google 확인: Aside Browser로 Google Maps/Hotel 패널과 리뷰 탭 확인. visible 1,018건, 4.2점, 분포 5성 503 / 4성 347 / 3성 96 / 2성 28 / 1성 44. Google-native 직접 6건, 온천 관련 5건. Trip.com/Tripadvisor 공급자 카드는 Google-native 수에 포함하지 않았다.
- Naver 확인: Aside Browser로 검색과 블로그 원문 확인. 블로그 본문 1건은 직접 표본, 검색 결과와 Trip.com 카드 표면은 `snippet_only`로 분리했다.
- data_quality_grade: `A`. 300건 이상 직접 확인, 3개 이상 직접 본문 플랫폼, 최신/저평점/온천 키워드/한국어 리뷰 층화를 충족한다.

## 2. 공식 사실

공식 현재 URL은 `https://www.choraku.co.jp/`이며, 후보 파일의 `chorakuen.jp` 표기는 현재 운영 표면과 다르다. 공식 한국어 페이지는 1868년 창업, 玉造温泉 중심의 료칸, 일본에서 가장 넓은 혼욕 노천탕과 1만 평 정원을 핵심으로 소개한다.

공식 사실상 `龍宮の湯`은 1909년에 완성된 혼욕 대노천탕이며, 신선한 원천이 계속 공급된다고 설명된다. 이 밖에 여성용 노천탕 `花泉`, 남성용 노천탕 `恵泉`, 노천탕 설치 특별 객실, 욕실이 있는 객실의 온천수 공급, 유료 전세 온천탕이 공식 표면에서 확인된다. 따라서 `open_air_public_bath`, `public_bath`, `room_bath`, `room_open_air_bath`, `private_bath`를 반드시 분리해야 한다.

Jalan/Rakuten/Trip.com 표면은 120坪 대노천탕, 일부 객실 노천탕, 객실 내 욕실/온천 공급, 송영과 입욕 관련 운영 정보를 함께 노출한다. 공식 시설 주장은 리뷰 만족 신호가 아니므로, 아래 리뷰 표본과 별도로 해석한다.

## 3. 리뷰 신호 요약 표

| bath_area | signal_type | direction | mention_count | platform_count | status | 해석 |
|---|---:|---:|---:|---:|---|---|
| open_air_public_bath | public_bath_hot_spring | mixed | 182 | 6 | strong_signal | 120坪 혼욕 대노천탕/庭園露天/龍宮の湯가 이 숙소의 핵심 신호다. 규모 만족이 강하지만 기대 미달·계절/온도·혼욕복 불편도 함께 반복된다. |
| public_bath | public_bath_hot_spring | positive | 22 | 4 | moderate_signal | 남녀별 실내탕/작은 노천탕과 대욕장 신호가 보조 축으로 확인된다. |
| room_bath | room_bath_hot_spring | positive | 78 | 5 | strong_signal | 객실 내탕/실내 암풍로/온천 공급 객실 신호가 반복된다. 전 객실 동일 체험으로 보면 안 된다. |
| room_open_air_bath | room_bath_hot_spring | mixed | 59 | 4 | strong_signal | 離れ·知心庵·相生 등 객실 노천탕 신호가 강하지만 일부 고급 객실 옵션이다. |
| private_bath | private_bath_experience | neutral | 2 | 1 | weak_signal | 공식 한국어 페이지에서 유료 전세 온천탕 표면이 확인되지만 리뷰 직접 신호는 약하다. |
| facility_wide | water_texture | positive | 158 | 6 | strong_signal | 玉造温泉, 源泉, かけ流し, すべすべ, 피부에 좋은 온천수 표현이 반복된다. |
| facility_wide | weak_onsen_feeling | negative | 3 | 2 | weak_signal | 혼욕 대욕장 기대 미달, 恩恵을 거의 못 느꼈다는 반대 신호가 소수 있다. |
| facility_wide | chlorine_smell | negative | 0 | 0 | insufficient | 직접 표본에서는 塩素/カルキ 반복 신호가 잡히지 않았다. |
| open_air_public_bath | crowding | mixed | 30 | 5 | strong_signal | 貸切状態/한산함과 남자·노인 중심, 세척 공간 부족, 혼잡 가능성이 함께 나타난다. |
| facility_wide | booking_confusion | mixed | 72 | 6 | strong_signal | 湯浴み着, 송영, 예약, 안내, 비용/입욕세, 객실·식사 안내 혼동은 운영 메모로 분리해야 한다. |

## 4. 근거 예시

| source | language | review_date | paraphrase | original_keyword |
|---|---|---:|---|---|
| Rakuten Travel | ja | mixed | 대노천탕, 혼욕, 정원, 玉造温泉 신호가 반복됐다. | `大露天風呂`, `混浴`, `庭園` |
| Jalan | ja | mixed | 露天風呂와 混浴, 湯浴み着, 객실탕 신호가 함께 나타났다. | `露天風呂`, `湯浴み着`, `部屋風呂` |
| Yahoo Travel | ja | 2026-06-15 | 대노천탕을 부부가 함께 이용한 만족과 오래된 설비 메모가 같이 나왔다. | `大露天風呂`, `泉質`, `古い` |
| Yahoo Travel | ja | 2026-05-28 | 離れ 객실의 실내 암풍로와 가족 숙박 맥락이 확인됐다. | `室内岩風呂付客室`, `和春亭` |
| Yahoo Travel | ja | 2024-11-06 | 湯浴み着을 입는 혼욕 대노천탕, 고온 탕수, 동선 불편이 함께 언급됐다. | `湯浴み着`, `混浴大露天風呂`, `高温湯滝` |
| Google Maps native | ko | 2026 approx | 목욕복 착용 혼욕탕을 느긋하게 즐기기 좋다고 평가했다. | `혼욕탕`, `목욕복 착용` |
| Google Maps native | ko | 2024 approx | 큰 노천 혼욕탕, 실내탕, 작은 노천탕, 피부수 신호를 구분했다. | `노천 혼욕탕`, `실내탕`, `피부에 좋은 온천수` |
| Trip.com | ko | 2025-10-03 | 넓은 노천 혼탕과 정원 산책 만족이 함께 나타났다. | `노천 혼탕`, `정원 산책` |
| Trip.com | ko | 2025-12-05 | 온천은 훌륭하지만 개인탕/혼욕탕과 서비스 경직 신호가 함께 나타났다. | `개인탕`, `혼욕탕`, `서비스` |
| Naver Blog | ko | 2025-07-22 | 120평 혼탕온천, 남녀 다른 착의 방식, 실내탕/노천탕 구성을 직접 설명했다. | `120평`, `혼탕온천`, `실내탕` |

## 5. Bathtime 해석

직접 확인 표본 304건 중 온천 관련 본문은 238건이며, 이 숙소는 대욕장형이라기보다 `龍宮の湯` 중심의 대형 혼욕 노천탕 숙소로 해석하는 편이 데이터에 맞다. 120坪, 혼욕, 湯浴み着/목욕복, 정원 노천, 가족·부부 동반 이용이 강하게 반복되며, 이 축은 일반 공용 노천탕과 별도 설명이 필요하다.

객실탕과 객실 노천탕도 강하게 반복되지만 일부 객실 옵션이다. 반대로 혼욕복 착용감, 세척 공간/샤워, 노후감, 온도, 송영·입욕 비용 안내 같은 운영 신호가 함께 잡히므로, 온천수 만족과 운영 메모를 분리해 보여주는 것이 Bathtime 데이터에 맞다.

## 6. Gaps

- Rakuten은 visible 127건을 전량 직접 확인했다.
- Jalan은 visible 3,611건 중 95건만 정적으로 직접 확인했다. A급은 충족하지만 archive/과거 저평점 확장 여지가 크다.
- Yahoo Travel은 visible 66건 표면에서 p1-p3 직접 본문을 확인했다. Ikkyu와 합산 점수/건수 표면이 같아 Ikkyu는 중복 가능성 때문에 직접 수에 넣지 않았다.
- Google은 visible 1,018건이나 Google-native 직접 본문은 6건만 안정적으로 카운트했다. 공급자 카드 리뷰는 제외했다.
- Trip.com은 visible 90건 중 직접 페이지 노출 9건만 직접 수에 포함했다. AI 요약은 제외했다.
- Naver Search는 `snippet_only`, Naver Blog 1건만 `direct_readable`이다.
- Tripadvisor는 Google 공급자 카드와 검색 표면만 확인됐고, 직접 페이지 안정 표본은 확보하지 못했다.

현재 등급은 A로 운영 가능하다. 다음 보강은 Jalan 3,611건의 archive/저평점 확장, Trip.com 전체 90건 추가, Tripadvisor 직접 페이지 접근이다.
