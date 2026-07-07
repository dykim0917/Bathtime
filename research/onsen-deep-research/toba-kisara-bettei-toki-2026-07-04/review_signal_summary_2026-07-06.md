# 季さら別邸 刻 리뷰 신호 보강 리서치 (2026-07-06)

## 1. 수집 브리핑

이번 보강 대상은 `季さら別邸 刻` 1곳이다. 기존 2026-07-04 직접 확인 256건에서 Tripadvisor, Tabelog, 4travel 여행기, 일본 개인 블로그/Ameblo, note 직접 본문을 추가하고, Google-native 표본을 현 세션 작성자 로그 기준 35건으로 재산정해 직접 확인 표본을 300건까지 올렸다.

| source | visible_review_count | rating | directly_read_reviews | onsen_related_reviews | access_status | notes |
|---|---:|---:|---:|---:|---|---|
| Rakuten Travel | 62 | 4.40 | 48 | 32 | direct_readable | 기존 직접 본문 유지 |
| Jalan | 19 | - | 19 | 11 | direct_readable | `yad389295` 유지 |
| Relux | 44 | 4.6 | 44 | 29 | direct_readable | 기존 직접 본문 유지 |
| Ikkyu | 125 combined | 4.56 | 100 | 74 | direct_readable_via_aside | Yahoo와 visible 합산 표면 |
| Yahoo Travel | 125 combined | 4.56 | 25 | 20 | direct_readable_via_aside | Yahoo-only 본문만 직접 수에 포함 |
| Google Maps / Google-native | 140 | 4.5 | 35 | 23 | partial_direct_readable_via_aside | 2026-07-06 장시간 스크롤 재확인. 기존 미로그 20건 라인을 현 세션 작성자 로그 35건으로 대체 |
| Tripadvisor | 5 | 4.4 | 4 | 3 | direct_readable | 5건 중 페이지가 4건 본문 노출 |
| Tabelog | 24 | 3.19 | 16 | 12 | partial_direct_readable | 료칸/민박 항목의 개별 숙박/식사 리뷰 본문. 음식 중심 본문은 온천 관련 수에서 제외 |
| 4travel travelogues | 2 | - | 2 | 2 | direct_readable | 숙박 여행기 2건 직접 본문. 작성자 단위로 계산 |
| Japanese blogs / Ameblo | 6 | - | 6 | 6 | direct_readable | ryokoshashin, Ameblo, yadolog, hibi-kanro 직접 본문. 같은 작성자 연재는 1건으로 계산 |
| note | 1 | - | 1 | 1 | direct_readable | CoCoTak 숙박기 본문 |
| Booking.com | 6 | 9.7 | 0 | 0 | partial_or_blocked | 점수/리뷰 수 표면만 확인, 개별 본문 미확보 |
| Agoda | 5 | 10.0 | 0 | 0 | blocked_or_js_summary_only | 점수/카운트 표면만 확인 |
| Trip.com | 19 | 9.7 | 0 | 0 | partial_summary_only | 요약/시설 표면, 개별 본문 미확보 |
| Naver Blog/Search | - | - | 0 | 0 | snippet_only_or_not_found_direct | 직접 한국어 숙박기 본문 미확보 |
| Rakuten Travel Korean | 0 | - | 0 | 0 | direct_readable_no_reviews | 한국어 리뷰 페이지는 열렸지만 `아직 이용 후기가 없습니다` 상태 |

- 플랫폼상 visible review pool은 최소 458건이다. Ikkyu/Yahoo의 125건 합산 표면은 visible pool에서 한 번만 보고, 개인 숙박기/여행기는 직접 열린 고유 작성자 9건만 더했다.
- 직접 읽은 리뷰 수는 300건이다.
- 온천 관련 직접 리뷰 수는 213건이다.
- 직접 본문 플랫폼 수는 11개다: Rakuten, Jalan, Relux, Ikkyu, Yahoo Travel, Google-native, Tripadvisor, Tabelog, 4travel travelogues, Japanese blogs/Ameblo, note.
- Google Maps/Hotels는 Aside Browser로 직접 확인했다. 별점 분포는 5성 106, 4성 17, 3성 5, 2성 7, 1성 5로 노출됐다.
- Google 리뷰 키워드 풀은 `일본의 온천` 22건, `목욕` 21건, `족욕` 10건, `피부` 10건으로 확인됐다. 장시간 스크롤 후 기존 Google 20건 라인을 현 세션 작성자 로그 35건으로 대체했다.
- 데이터 품질 등급은 A다. 300건 이상 직접 확인했고, 11개 직접 본문 플랫폼에서 최신/저평점/온천 키워드/다중 플랫폼 층화가 확인된다. 한국어 Naver 직접 숙박기 표본은 gap으로 남는다.

## 2. 공식 사실

공식/OTA 시설 표면에서 `全室、内風呂と露天風呂`, 객실별 일부 `足湯付き`, `社宮司温泉` 또는 `七栗の湯` 원천 주장이 확인된다. 이는 공식/시설 주장이다.

공용 대욕장, 공용 노천탕, 시간 예약식 가족탕/대절탕은 공식 표면에서 확인하지 못했다. 리뷰 해석에서도 `개인탕`류 표현은 공용 가족탕이 아니라 객실 내탕/객실 노천탕 문맥으로 분리해야 한다.

## 3. 리뷰 신호 요약

| bath_area | bath_area_confidence | signal_type | signal_direction | mention_count | source_count | platform_count | contradiction_level | review_signal_status |
|---|---|---|---|---:|---:|---:|---|---|
| room_open_air_bath | specific | room_bath_hot_spring | positive | 210 | 210 | 11 | low | strong_signal |
| room_bath | specific | room_bath_hot_spring | positive | 108 | 108 | 11 | low | strong_signal |
| facility_wide | facility_wide | water_texture | positive | 114 | 114 | 11 | low | strong_signal |
| room_open_air_bath | specific | private_bath_experience | positive | 189 | 189 | 11 | low | strong_signal |
| facility_wide | facility_wide | booking_confusion | mixed | 47 | 47 | 6 | medium | strong_signal |
| room_open_air_bath | specific | weak_onsen_feeling | negative | 2 | 2 | 2 | low | weak_signal |
| room_open_air_bath | specific | chlorine_smell | negative | 2 | 2 | 1 | low | weak_signal |
| room_open_air_bath | specific | private_bath_experience | positive | 20 | 20 | 5 | low | moderate_signal |

## 4. 근거 예시

| signal_type | source_type | source_url | language | short_paraphrase | original_keyword | review_date |
|---|---|---|---|---|---|---|
| room_bath_hot_spring | Tripadvisor direct | https://www.tripadvisor.jp/Hotel_Review-g298195-d17793793-Reviews-Kisara_Bettei_Toki-Toba_Mie_Prefecture_Tokai_Chubu.html | ja | 객실에 노천탕과 실내탕이 모두 있어 좋았다는 숙박기 | 客室に露天風呂と室内風呂 | 2019-09 |
| room_bath_hot_spring | Tripadvisor direct | https://www.tripadvisor.jp/Hotel_Review-g298195-d17793793-Reviews-Kisara_Bettei_Toki-Toba_Mie_Prefecture_Tokai_Chubu.html | ja | 객실 노천탕에서 전망과 체류감을 긍정 평가 | お部屋の露天風呂 | 2019-10 |
| room_bath_hot_spring | Tabelog direct | https://tabelog.com/mie/A2403/A240302/24017283/dtlrvwlst/B497508319/ | ja | 바다를 보며 객실 노천탕을 쓴 숙박기 | 部屋付きの露天風呂 | 2024-12 |
| water_texture | Tabelog direct | https://tabelog.com/mie/A2403/A240302/24017283/dtlrvwlst/B458895072/ | ja | 전 객실 노천탕과 미끈한 수질을 함께 언급 | トロトロのお湯 | 2022-12 |
| room_bath_hot_spring | 4travel direct | https://4travel.jp/travelogue/11647752 | ja | 객실 내탕과 노천탕이 모두 온천이라는 숙박기 | 内風呂も温泉, 露天風呂 | 2020-09 |
| water_texture | Japanese blog direct | https://ryokoshashin.com/japan/day1-2-4.html | ja | 대욕장 없이 객실 내탕/노천탕 중심이고 수질이 미끈하다는 체험 | 大浴場はなく, トロリ | 2026 surface |
| room_open_air_bath | Ameblo direct | https://ameblo.jp/hibi-kanro/entry-12883416505.html | ja | 객실 노천탕과 족탕을 여러 번 이용했다는 숙박기 | 露天風呂, 足湯, 泉質 | 2025 surface |
| room_bath_hot_spring | Google-native direct | Google Maps/Hotels Aside snapshot | ja/ko-ui | 장시간 스크롤 표본에서 객실 내탕·노천탕·족탕과 수질감이 반복 | 내탕, 노천탕, 족탕, トロトロ | 2026 snapshot |
| weak_onsen_feeling | Ikkyu direct | https://www.ikyu.com/00002691/review/ | ja | 원천 주장과 가케나가시 기대 사이의 차이 | かけ流しではありません | 2026 |
| booking_confusion | Yahoo direct | https://travel.yahoo.co.jp/00002691/review/ | ja | 운영/연락/분실물 대응 관련 저평점 신호 | 忘れ物, 連絡 | 2026 |

## 5. Bathtime 해석

직접 확인 300건 중 온천 관련 본문 213건에서 객실 노천탕과 객실 내탕 만족이 강하게 반복된다. `露天風呂`, `内風呂`, `足湯`, `トロトロ`, `すべすべ`가 11개 직접 본문 플랫폼에 걸쳐 반복되므로, 이 숙소는 공용 대욕장형이 아니라 객실 안에서 완결되는 온천 체류로 해석하는 편이 데이터에 맞다.

다만 한국어 직접 숙박기 층화는 비어 있다. Google visible pool 140건과 Trip.com/Booking/Agoda의 리뷰 수는 직접 본문 수가 아니며, Google 패널 안의 Tripadvisor 공급자 카드는 Google-native에서 제외했다.

## 6. Gaps

- Google Maps/Hotels는 Aside Browser로 재확인했고, 장시간 스크롤에서 현 세션 작성자 로그 35건을 확보했다. 이는 기존 Google 20건에 단순 추가한 것이 아니라 Google-native 플랫폼 라인을 35건으로 대체한 재산정이다.
- Google 패널 내 Tripadvisor 카드는 Google-native 리뷰가 아니므로 Tripadvisor 직접 본문 4건으로 따로 계산했다.
- Booking.com, Agoda, Trip.com은 점수/카운트/요약 표면은 확인됐으나 개별 본문이 안정적으로 열리지 않았다.
- Naver Blog/Cafe 직접 숙박기는 찾지 못했다. Rakuten Travel 한국어 리뷰 페이지도 열었으나 실제 후기가 없었다. 검색 결과 snippet, OTA 한국어 페이지, AI 요약은 직접 리뷰 수에서 제외했다.
- 다음 보강 우선순위는 A급 승급이 아니라 한국어 층화 보강이다. Naver Blog/Cafe 직접 숙박기, Booking/Agoda/Trip.com의 개별 본문 접근 재시도를 권한다.
