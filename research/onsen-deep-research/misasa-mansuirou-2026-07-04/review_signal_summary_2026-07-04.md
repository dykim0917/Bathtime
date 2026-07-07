# 三朝薬師の湯 万翆楼 온천 리뷰 신호 요약

## 1. 수집 브리핑

- 조사 숙소: 1곳 (`misasa-mansuirou`)
- 플랫폼상 전체 리뷰풀: 원시 표면 합산 4,554건 이상. Google 공급자 카드, Ikkyu/Yahoo 공유 가능성, Agoda/Trip.com 중복 가능성 때문에 독립 리뷰풀로 해석하지 않는다.
- 직접 읽은 리뷰 수: 579건
- 온천 관련 직접 리뷰 수: 319건
- 직접 본문 플랫폼 수: 6개(Rakuten Travel, Jalan, Google Maps native, Trip.com Moments, Ikkyu, Tripadvisor)
- Google 확인: Aside Browser로 Google Maps/Hotel 패널과 리뷰 탭 확인. visible 642건, Google-native 직접 8건, 온천 관련 7건. Trip.com 공급자 카드는 Google-native 수에 포함하지 않았다.
- Naver 확인: 정확 숙소명 검색에서 카페/Trip.com/Agoda/가격비교 표면이 확인됐지만, 직접 원문 본문은 확보하지 못했다. Naver Cafe는 `blocked`, 검색 결과는 `snippet_only`로 분리했다.
- data_quality_grade: `A`. 300건 이상 직접 확인, 3개 이상 직접 본문 플랫폼, 최신/저평점/온천 키워드/한국어 리뷰 층화를 충족한다.

## 2. 공식 사실

공식/시설 주장은 자가원천 3본으로 구성된 원천100% 온천이다. 공식 온천 페이지에는 `源泉100%`, `加温・加水あり`, 내탕과 노천탕, 아침·저녁 남녀 교체 운영이 함께 표기된다.

객실 축은 일부 객실에 한정된다. 공식 객실/공지 표면에서는 2023년 이후 스위트 객실에 온천 노천탕 또는 반노천탕을 둔 신호가 확인되며, 2023년 12월 절경 스위트 노천탕이 三朝温泉 원천100% 노천탕으로 리뉴얼됐다는 표면도 있다. 전 객실 객실탕 숙소로 보면 안 되고, `room_bath`, `room_open_air_bath`, `public_bath`, `open_air_public_bath`, `private_bath`를 분리해야 한다.

## 3. 리뷰 신호 요약 표

| bath_area | signal_type | direction | mention_count | platform_count | status | 해석 |
|---|---:|---:|---:|---:|---|---|
| room_bath | room_bath_hot_spring | positive | 115 | 5 | strong_signal | 객실 내탕/객실풍로 신호가 강하다. 단, 객실 타입별 옵션이다. |
| room_open_air_bath | room_bath_hot_spring | positive | 72 | 5 | strong_signal | `露天風呂付`, `半露天`, `部屋の露天風呂`가 반복된다. |
| public_bath | public_bath_hot_spring | positive | 73 | 6 | strong_signal | 대욕장과 수질 만족이 반복되지만 일부 기대 미달도 있다. |
| open_air_public_bath | public_bath_hot_spring | mixed | 38 | 5 | moderate_signal | 공용 노천탕 신호는 반복되나 작음/개방감 부족 불만도 있다. |
| facility_wide | water_texture | positive | 260 | 6 | strong_signal | `三朝温泉`, `ラジウム`, `ラドン`, `泉質`, 온천물/수질 좋음이 강하게 반복된다. |
| private_bath | private_bath_experience | mixed | 17 | 4 | moderate_signal | 대절탕/가족탕 신호가 있으며, 요금·노천 없음 불만도 확인된다. |
| facility_wide | chlorine_smell | negative | 1 | 1 | weak_signal | `塩素`는 탐색 신호 수준이다. |
| facility_wide | crowding | mixed | 16 | 3 | moderate_signal | 번잡한 대중탕/한산한 이용이 모두 있어 시간대·시즌 영향으로 본다. |

## 4. 근거 예시

| source | language | review_date | paraphrase | original_keyword |
|---|---|---:|---|---|
| Rakuten Travel | ja | 2026-05-25 | 삼조온천, 음천, 차분한 분위기, 예약 신호가 함께 나타났다. | `三朝温泉`, `飲泉`, `落ち着`, `予約` |
| Rakuten Travel | ja | 2026-02-25 | 대욕장, 노천탕, 내탕, 오래된 시설과 강 전망이 함께 언급됐다. | `大浴場`, `露天風呂`, `内湯`, `古い`, `川` |
| Rakuten Travel | ja | 2025-12-03 | 객실 노천탕과 원천가케나가시, 온도 신호가 함께 나타났다. | `源泉かけ流し`, `露天風呂付`, `温度` |
| Rakuten Travel | ja | 2025-01-26 | 대욕장, 노천탕, 조용한 분위기, 송영/안내가 한 리뷰에 묶였다. | `大浴場`, `露天風呂`, `静か`, `送迎`, `案内` |
| Jalan | ja | mixed | 정적 표본에서 객실탕과 대욕장, 라듐/온천수 신호가 함께 반복됐다. | `温泉`, `大浴場`, `露天風呂`, `ラジウム` |
| Google Maps native | ko | 2026 approx | 대욕탕과 야외 온탕을 직접 비교하고, 시설/위치 장단점을 함께 남겼다. | `대욕탕`, `야외 온탕` |
| Google Maps native | ko | 2025 approx | 온천물 수질과 송영, 식사 만족이 함께 나타났다. | `온천물`, `수질`, `송영` |
| Google Maps native | ko | 2025 approx | 가족탕 요금과 노천 없음, 대욕장 기대 미달을 구체적으로 언급했다. | `가족탕`, `실내탕`, `노천탕은 없음` |
| Trip.com Moments | ko | 2025-04-01 | 대욕장 위치 찾기와 남녀탕 교체를 직접 언급했다. | `온천 길`, `대욕장`, `남자/여자가 바뀌기` |
| Tripadvisor | ja | 2023-02 | 대욕장은 순환이라는 인식과 식사/접객 만족이 함께 나타났다. | `大浴場は循環`, `温泉`, `接客` |

## 5. Bathtime 해석

직접 확인 표본 579건 중 온천 관련 본문은 319건이며, 이 숙소는 대욕장형 라듐 숙소이면서 동시에 객실탕 옵션 신호가 강한 하이브리드형으로 보인다. `room_bath`와 `room_open_air_bath`가 반복되지만 전 객실 신호는 아니므로, Bathtime에서는 객실 타입별 온천 여부를 명확히 분리해야 한다.

대욕장과 공용 노천탕은 수질·라듐 기대 신호가 강하지만, Google/Tripadvisor 계열에서는 “노천탕이 작다”, “개방감 부족”, “대욕장 기대 미달”, “순환 인식” 같은 반대 신호도 확인된다. 운영상으로는 청소/냄새/곰팡이, 온도, 송영·안내, 객실 변경 신호를 온천 품질과 분리해 표시하는 편이 데이터에 맞다.

## 6. Gaps

- Rakuten은 visible 686건 중 420건을 직접 확인했다. 이미 A급이지만 나머지 표본은 추가 가능하다.
- Jalan은 visible 1,016건 중 119건을 직접 확인했다. 저평점/과거 archive 확장 여지가 있다.
- Google은 visible 642건이나 Google-native 직접 본문은 8건만 안정적으로 카운트했다. 공급자 카드 리뷰는 제외했다.
- Naver Cafe는 정확 숙소명 결과가 있었으나 로그인/피드 표면으로 본문 접근이 막혔다.
- Agoda는 visible 994건이지만 개별 날짜/작성자 단위 본문을 안정적으로 분리하지 못해 `partial`로 처리했다.
- Yahoo Travel은 Ikkyu와 같은 71건 계열로 보여 직접 수에 중복 합산하지 않았다.

현재 등급은 A로 운영 가능하다. 다음 보강은 Naver Cafe 원문 접근, Agoda 개별 본문 안정 추출, Jalan 저평점/과거 리뷰 확장이다.
