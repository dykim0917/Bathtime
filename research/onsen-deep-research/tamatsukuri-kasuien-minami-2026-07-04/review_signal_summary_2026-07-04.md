# 玉造温泉 佳翠苑皆美 온천 리뷰 신호 요약

## 1. 수집 브리핑

- 조사 숙소: 1곳 (`tamatsukuri-kasuien-minami`)
- 플랫폼상 전체 리뷰풀: 원시 표면 합산 5,478건 이상. Rakuten 1,167건, Jalan 2,071건, Google Maps 1,977건, Ikkyu/Yahoo 합산 표면 265건, Trip.com/Naver 표면 일부를 포함한다. 중복 가능성이 있어 독립 리뷰풀로 해석하지 않는다.
- 직접 읽은 리뷰 수: 606건
- 온천 관련 직접 리뷰 수: 320건
- 직접 본문 플랫폼 수: 4개(Rakuten Travel, Jalan, Google Maps native, Ikkyu)
- Google 확인: Aside Browser로 Google Maps/Hotel 패널과 리뷰 탭 확인. visible 1,977건, 4.4점, 분포 5성 1,206 / 4성 568 / 3성 118 / 2성 33 / 1성 52. Google-native 직접 9건, 온천 관련 4건. Tripadvisor 공급자 카드는 Google-native 수에 포함하지 않았다.
- Naver 확인: Aside Browser로 전체/블로그 탭 확인. 직접 숙박 후기 본문은 확보하지 못했고, 지역 글·요약 글 표면은 `snippet_only`로 분리했다.
- data_quality_grade: `A`. 300건 이상 직접 확인, 3개 이상 직접 본문 플랫폼, 최신/저평점/온천 키워드/한국어 검색 표면 확인을 충족한다.

## 2. 공식 사실

공식 온천 페이지는 玉造温泉을 `神の湯`로 소개하며, 공용 욕장은 여탕 `浮舟`, 남탕 `浮殿`, 최상층 전망탕 `天遊の湯`로 나뉜다. 공식 표기상 `浮舟`과 `浮殿`은 내탕과 노천탕을 갖고, `天遊の湯`은 내탕과 전망 노천탕을 갖는다. 이용 시간은 `浮舟/浮殿` 15:00-24:30 및 5:00-9:30, `天遊の湯` 15:00-23:00 및 6:00-9:30로 확인된다.

泉質은 나트륨·칼슘-황산염·염화물천, 저張성 약알칼리성 고온천이며, 공식 온천 정보에는 원천 온도 52.1도, 무색·투명·무미·무취가 표기된다. Jalan은 玉造温泉 `加水・循環ろ過`와 노천탕 남녀 각 2, 내탕 남녀 각 2, 대욕장 2곳 조건을 표기하고, Ikkyu는 노천탕 `かけ流しなし`, 보충사항 `加水`, 온천·노천탕 딸린 객실·대욕장·岩盤浴·무료 송영을 시설 특징으로 표기한다.

객실탕은 전 객실 신호가 아니다. 공식 톱/OTA 표면에서 원천가케나가시 객실 욕탕과 2026년 7월 리뉴얼 오픈한 노천탕 딸린 객실 13실이 확인되므로, Bathtime에서는 `room_bath`, `room_open_air_bath`, `public_bath`, `open_air_public_bath`를 분리해야 한다.

## 3. 리뷰 신호 요약 표

| bath_area | signal_type | direction | mention_count | platform_count | status | 해석 |
|---|---:|---:|---:|---:|---|---|
| room_bath | room_bath_hot_spring | positive | 126 | 4 | strong_signal | 객실 내탕/객실 온천은 일부 객실 옵션으로 반복된다. |
| room_open_air_bath | room_bath_hot_spring | positive | 59 | 3 | strong_signal | 객실 노천탕은 2026년 리뉴얼 객실 및 고급 객실 표본에서 강하게 잡힌다. |
| public_bath | public_bath_hot_spring | positive | 56 | 4 | strong_signal | 대욕장, 1층/전망탕, 두 곳의 목욕장 이용 신호가 반복된다. |
| open_air_public_bath | public_bath_hot_spring | mixed | 32 | 3 | strong_signal | 전망 노천/옥상 노천의 장점과 전망·규모 기대 차이가 함께 보인다. |
| facility_wide | water_texture | positive | 262 | 4 | strong_signal | 玉造温泉, 美肌, すべすべ, 泉質, まろやか 표현이 반복된다. |
| facility_wide | weak_onsen_feeling | negative | 1 | 1 | weak_signal | 源泉掛け流しではない/循環 인식은 소수 부정 신호다. |
| facility_wide | chlorine_smell | negative | 2 | 1 | weak_signal | 塩素/カルキ는 정적 표본에서 2건만 확인된다. |
| facility_wide | crowding | mixed | 150 | 4 | strong_signal | 혼잡 확인/공실감/단체·조식 혼잡 신호가 섞인다. |
| facility_wide | booking_confusion | mixed | 160 | 4 | strong_signal | 예약, 송영, 주차, 안내, 객실·식사 옵션 신호는 운영 메모로 분리한다. |

## 4. 근거 예시

| source | language | review_date | paraphrase | original_keyword |
|---|---|---:|---|---|
| Rakuten Travel | ja | 2026 recent | 두 곳의 온천과 혼잡 상황 확인이 함께 언급됐다. | `温泉`, `混雑状況` |
| Rakuten Travel | ja | mixed | 玉造温泉, 美肌, 대욕장, 전망 노천 신호가 반복됐다. | `玉造温泉`, `美肌`, `大浴場`, `展望露天` |
| Jalan | ja | mixed | 객실 노천탕 리뉴얼 객실명과 대욕장/노천탕 시설 신호가 함께 나타났다. | `温泉露付スイート`, `露天風呂`, `大浴場` |
| Google Maps native | ja | 2026 approx | 1층 대욕장과 9층 전망 목욕탕을 비교하며 玉造温泉의 촉감을 언급했다. | `大浴場`, `9階展望風呂`, `すべすべ` |
| Google Maps native | ja | 2026 approx | 객실 온천과 온수 만족을 함께 언급했다. | `客室温泉`, `お湯` |
| Google Maps native | ja | 2026 approx | 조식 혼잡과 전망탕 기대 차이를 함께 남겼다. | `朝食会場の混雑`, `展望風呂` |
| Ikkyu | ja | 2026-05-22 | 객실 노천탕, 온도 조절, 청결감이 한 리뷰에 묶였다. | `部屋の源泉掛け流しの露天風呂`, `温度調節` |
| Ikkyu | ja | 2026-05-05 | 객실 풍로의 물감과 안정감을 긍정적으로 평가했다. | `部屋風呂`, `まろやかなお湯` |
| Ikkyu | ja | 2026-03-17 | 대욕장이 원천가케나가시가 아니라는 부정 인식이 확인됐다. | `源泉掛け流しではなく` |
| Ikkyu | ja | 2025-12-21 | 족욕과 대욕장 편의, 의자/타월 동선 불편을 함께 언급했다. | `足湯`, `大浴場`, `タオル` |

## 5. Bathtime 해석

직접 확인 표본 606건 중 온천 관련 본문은 320건이며, 이 숙소는 “대욕장 두 축 + 전망 노천 + 일부 객실 온천”으로 읽는 편이 데이터에 맞다. 玉造温泉의 `美肌`, `すべすべ`, `まろやか` 수질 신호가 강하게 반복되지만, 공식/OTA 표면에서는 가수·순환 여지가 명확하므로 “원천가케나가시 전면 숙소”로 해석하면 안 된다.

객실 노천탕은 만족 신호가 강하지만 일부 객실 옵션이며, 2026년 7월 리뉴얼 객실 13실이라는 시설 표면과 기존 객실탕 리뷰 신호를 분리해야 한다. 공용탕은 대욕장·전망탕 만족이 강한 반면, 혼잡·단체·전망 기대 차이·동선 편의 같은 운영 신호가 섞이므로 온천 품질 신호와 운영 메모를 분리 표시하는 편이 안전하다.

## 6. Gaps

- Rakuten은 visible 1,167건 중 440건을 직접 확인했다. 이미 A급이지만 저평점 필터 확장 여지가 있다.
- Jalan은 visible 2,071건 중 134건을 직접 확인했다. archive/과거 페이지 확장 여지가 있다.
- Google은 visible 1,977건이나 Google-native 직접 본문은 9건만 안정적으로 카운트했다. 공급자 카드 리뷰는 제외했다.
- Ikkyu는 브라우저에서 직접 접근됐고 23건을 직접 표본화했다. 정적 fetch는 403이어서 Aside 확인 결과를 기준으로 접근 상태를 갱신했다.
- Yahoo Travel은 정적 요청 403이며 Ikkyu/Yahoo 합산 표면과 중복 가능성이 있어 직접 수에 넣지 않았다.
- Naver Blog/Search는 `snippet_only`다. 직접 숙박 후기 본문은 0건으로 처리했다.
- Tripadvisor 정적 접근은 JS/ad-blocker 안내로 차단됐고, Google 패널 공급자 카드 일부만 확인됐다.

현재 등급은 A로 운영 가능하다. 다음 보강은 Google 저평점 필터 직접 표본, Naver 원문 블로그/카페 접근, Yahoo Travel과 Ikkyu 중복 제거 후 별도 본문 확대다.
