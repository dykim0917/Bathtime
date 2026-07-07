# 三朝温泉 依山楼岩崎 온천 리뷰 신호 요약

## 1. 수집 브리핑

- 조사 숙소: 1곳 (`misasa-izanro-iwasaki`)
- 플랫폼상 전체 리뷰풀: 원시 표면 합산 3,807건 이상. Google의 공급자 카드, Ikkyu/Yahoo 공유 가능성, Expedia/Hotels 계열 중복 가능성 때문에 독립 리뷰풀로 해석하지 않는다.
- 직접 읽은 리뷰 수: 372건
- 온천 관련 직접 리뷰 수: 253건
- 직접 본문 플랫폼 수: 7개(Rakuten Travel, Jalan, Google Maps native, Naver Blog, Trip.com, Tripadvisor, Ikkyu)
- Google 확인: Aside Browser로 Google Maps/Hotel 패널과 리뷰 탭 확인. visible 1,332건, Google-native 직접 5건, 온천 관련 4건. Trip.com/Tripadvisor 공급자 카드는 Google-native 수에 포함하지 않았다.
- Naver 확인: Naver Blog 직접 본문 1건 확인. Naver Cafe는 로그인/피드 표면으로 본문 접근 실패. 검색 결과 스니펫은 `snippet_only`로 분리했다.
- data_quality_grade: `A`. 300건 이상 직접 확인, 3개 이상 직접 본문 플랫폼, 최신/저평점/온천 키워드/한국어 리뷰 층화를 충족한다.

## 2. 공식 사실

공식/시설 주장은 일본유산으로도 설명되는 三朝温泉의 라듐 온천을 `山の湯` 회유식 대정원풍로에서 즐기는 구조다. `左の湯`와 `右の湯`는 오전 5시에 남녀 교체되며, 숙박객 입욕 시간은 체크인부터 24:00, 다음날 05:00-10:00로 표기된다.

공식 온천 표면에는 대욕장, 정원 노천탕, 라지움 증기/미스트, 음천, 일부 원천가케나가시 객실 노천탕이 함께 나타난다. 전 객실 객실탕 숙소가 아니므로 `public_bath`, `open_air_public_bath`, 일부 `room_open_air_bath`, `private_bath`를 분리해 다뤄야 한다.

## 3. 리뷰 신호 요약 표

| bath_area | signal_type | direction | mention_count | platform_count | status | 해석 |
|---|---:|---:|---:|---:|---|---|
| public_bath | public_bath_hot_spring | positive | 92 | 7 | strong_signal | `大浴場`, `庭園風呂`, `回遊式`, `山の湯` 신호가 강하게 반복된다. |
| open_air_public_bath | public_bath_hot_spring | positive | 37 | 6 | strong_signal | 정원 노천탕과 풍경, 여러 탕을 도는 경험이 반복된다. |
| facility_wide | water_texture | positive | 210 | 7 | strong_signal | `三朝温泉`, `ラジウム`, `ラドン`, `泉質`, `湯治` 기대가 강하게 반복된다. |
| facility_wide | water_texture | positive | 55 | 5 | strong_signal | `飲泉`, `ラジウム蒸気風呂`, `ミスト`, `吸入`이 별도 건강/탕치 신호로 반복된다. |
| room_open_air_bath | room_bath_hot_spring | positive | 58 | 5 | strong_signal | 일부 반노천/객실 노천 객실 신호가 뚜렷하나, 전 객실 신호는 아니다. |
| private_bath | private_bath_experience | positive | 6 | 3 | weak_signal | 貸切湯/대절탕 신호는 보조축이다. 객실탕과 합치지 않는다. |
| facility_wide | chlorine_smell | negative | 3 | 1 | weak_signal | `塩素`, `匂い` 신호는 소수다. 주류 부정 신호는 아니다. |
| facility_wide | crowding | mixed | 8 | 3 | weak_signal | 혼잡/한산 신호가 모두 있어 시간대·시즌 영향으로 보는 편이 맞다. |

## 4. 근거 예시

| source | language | review_date | paraphrase | original_keyword |
|---|---|---:|---|---|
| Rakuten Travel | ja | 2026-06-20 | 회유식 대정원풍로와 객실 반노천을 모두 이용했다는 최신 리뷰. | `回遊式大庭園風呂`, `半露天風呂` |
| Rakuten Travel | ja | 2026-06-29 | 라듐, 음천, 대욕장 신호가 함께 나타났다. | `ラジウム`, `飲泉`, `大浴場` |
| Rakuten Travel | ja | 2026-04-14 | 삼조온천, 증기, 대욕장, 노천탕이 한 리뷰 안에서 연결됐다. | `三朝温泉`, `蒸気`, `大浴場`, `露天風呂` |
| Rakuten Travel | ja | 2026-03-16 | 라돈 미스트와 노천탕을 긍정적으로 언급하면서 냄새/염소 신호도 남겼다. | `ラドン`, `ミスト`, `塩素`, `匂い` |
| Jalan | ja | mixed | 여러 탕, 정원, 라듐/미스트 계열 온천 경험이 반복됐다. | `種類`, `庭`, `ラジウム`, `ミスト` |
| Google Maps native | ko | unknown | 한국어 Google 리뷰에서 객실 개인탕과 공용욕탕을 분리해 언급했다. | `프라이빗 개인탕`, `공용욕탕` |
| Naver Blog | ko | 2026-03-03 | 남녀탕 교체, 물 좋음, 조용한 자연 환경, 깨끗한 탈의실을 직접 서술했다. | `남탕과 여탕이 매일 바뀌기`, `물도 좋고` |
| Trip.com | ko | 2026-01-13 | 한국어 OTA 리뷰에서 온천여행과 노천탕 만족을 언급했다. | `온천여행`, `노천탕` |
| Tripadvisor | ja | 2024-03 | 라듐 증기풍로, 음천, 좌우 탕, 대절탕까지 구체적으로 언급했다. | `ラジウム蒸気風呂`, `飲泉`, `右の湯`, `左の湯`, `貸切湯` |
| Ikkyu | ja | 2025-11-24 | 오른쪽/왼쪽 탕 이용, 라듐 온욕, 이동 중 추위가 함께 나타났다. | `右の湯`, `左の湯`, `ラジウム温浴`, `寒かった` |

## 5. Bathtime 해석

직접 확인 표본 372건 중 온천 관련 본문은 253건이며, 이 숙소의 중심 신호는 객실탕이 아니라 `山の湯` 회유식 대욕장과 공용 노천탕이다. `大浴場`, `回遊式`, `庭園風呂`, `右の湯/左の湯`가 강하게 반복되고, 여기에 `ラジウム`, `ラドン`, `飲泉`, `蒸気`가 건강/탕치 기대 신호로 붙는다.

다만 일부 객실 노천탕과 대절탕 신호도 존재하므로, “대욕장형 라듐 온천 숙소” 안에서 객실 노천탕 보유 객실을 별도 옵션으로 보여주는 편이 데이터에 맞다. 부정 신호는 온천 자체보다 노후감, 청소, 겨울 동선의 추위, 타월/송영/안내 같은 운영 관리 쪽에 더 많이 모인다.

## 6. Gaps

- Jalan은 visible 1,938건 중 144건만 직접 표본화했다. A급 기준은 넘었지만 과거 archive와 저평점 추가 표본은 더 확장 가능하다.
- Google은 visible 1,332건이지만 Google-native 직접 본문은 첫 화면 5건만 카운트했다. 공급자 카드 리뷰는 별도 플랫폼에서만 세야 한다.
- Naver Cafe는 정확 결과가 있었으나 로그인/피드 표면으로 본문 접근이 막혔다.
- Expedia/Hotels의 한국어 리뷰 문구는 확인됐지만 안정적인 개별 본문 추출로 합산하지 않았다.
- Yahoo Travel은 Ikkyu와 같은 70건 계열로 보여 직접 수에 중복 합산하지 않았다.

다음 보강은 Jalan 저평점/과거 리뷰, Expedia/Hotels 한국어 개별 본문, Google-native 추가 스크롤 표본이다. 현재 등급은 A로 운영 가능하다.
