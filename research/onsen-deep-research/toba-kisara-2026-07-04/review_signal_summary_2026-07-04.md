# 季さら 리뷰 신호 딥리서치 (2026-07-04)

## 1. 이름/별칭 정규화

| 구분 | 값 |
|---|---|
| 일본어 공식명 | 伊勢志摩・鳥羽 懐古ロマンの宿 季さら |
| 한국어 통용명 | 키사라 / 도바 키사라 료칸 |
| 영어/OTA 표기 | Kisara / Kaiko Roman no Yado Kisara / Nostalgic Romance Renewal Inn |
| 관련·혼동 주의명 | 季さらOneness, 季さら別邸 刻～TOKI～는 인접·계열 숙소로 별도 처리 |
| 공식 사이트 | https://www.toba-kisara.com/kisara/ |
| 주소/온천지 | 三重県鳥羽市安楽島町1075-11 / 社宮司温泉 |

## 2. Official Facts

공식 사이트는 `季さら`를 전 객실 노천탕이 붙은 독립형 객실 숙소로 설명한다. 홈페이지 표면에서는 `全室温泉露天風呂付き`, `離れ客室13棟`, `社宮司温泉`, `七栗` 원천 주장이 확인된다.

Rakuten 시설 표면은 `全室温泉露天風呂付きの離れ10棟`, `社宮司温泉`, `アルカリ性泉質`, `ほぼ無色透明・無臭`을 표기한다. 객실 수가 공식 13동과 Rakuten 10실로 다르게 보이므로, Bathtime 표시에서는 최신 공식 객실 범위와 OTA 판매 객실 범위를 분리 검증해야 한다.

공용 대욕장, 공용 노천탕, 시간 예약식 가족탕/대절탕은 공식 표면에서 명확히 확인하지 못했다. 이 숙소의 핵심 분류는 객실 노천탕과 객실 내탕이며, 리뷰의 `プライベート` 신호도 대부분 객실 안 욕장 맥락으로 해석해야 한다.

## 3. 수집 브리핑

| source | visible_review_count | rating | directly_read_reviews | onsen_related_reviews | access_status | notes |
|---|---:|---:|---:|---:|---|---|
| Rakuten Travel | 233 | 4.54 | 193 | 90 | direct_readable | SPA 상태 JSON 본문 직접 추출. 플랫폼 표면 233과 추출 가능 193 분리 |
| Jalan | 567 | 4.3 | 567 | 294 | direct_readable | 최신 8건 + archive 559건 직접 추출, 욕장 평점 4.8 |
| Google Hotels / Google-native | 207 | 4.3 | 20 | 9 | aside_review_tab_read | 유용도순 10건, 낮은 점수순 10건 직접 확인 |
| Ikkyu | 78 | 4.6 | 0 | 0 | blocked_static / snippet_only | Google 표면에서 리뷰풀만 확인, 정적 fetch 403 |
| Yahoo Travel | 79 | 4.6 | 0 | 0 | blocked_static / snippet_only | Google 표면에서 리뷰풀만 확인, 정적 fetch 403 |
| Trip.com | 40 | - | 0 | 0 | partial_static_signal | `Kaiko Roman No Yado Kisara`와 `Kisara Oneness` 혼동 주의 |
| Booking.com | - | - | 0 | 0 | partial_or_bot_challenge | 본문 직접 수 미포함 |
| Naver Search/Blog | - | - | 0 | 0 | snippet_only / not_found_direct | 한국어 검색은 직접 숙박기 미확보, 다른 료칸 결과 혼입 |

- 중복 가능성을 제거하지 않은 플랫폼상 visible review pool은 최소 1,204건이다. 이 수치는 직접 리뷰 수가 아니다.
- 직접 확인 리뷰 수는 780건이다. 그중 온천 관련 직접 본문은 393건으로 집계했다.
- 직접 본문 플랫폼 수는 3개다: Rakuten Travel, Jalan, Google-native.
- Google Hotels와 Naver Search는 Aside Browser로 확인했다.
- 데이터 품질 등급: A. 직접 본문 300건 이상, 직접 본문 플랫폼 3개, 최신/저평점/온천 키워드 층화가 완료됐다. 단, 한국어 직접 숙박기는 Naver 확인에도 발견되지 않아 gap으로 남긴다.

## 4. Review Signal Summary

| bath_area | bath_area_confidence | signal_type | signal_direction | mention_count | source_count | platform_count | contradiction_level | review_signal_status |
|---|---|---|---|---:|---:|---:|---|---|
| room_open_air_bath | specific | room_bath_hot_spring | positive | 421 | 421 | 3 | low | strong_signal |
| room_bath | specific | room_bath_hot_spring | positive | 155 | 155 | 3 | low | strong_signal |
| room_open_air_bath | specific | private_bath_experience | positive | 421 | 421 | 3 | low | strong_signal |
| facility_wide | facility_wide | water_texture | positive | 48 | 48 | 2 | low | strong_signal |
| facility_wide | facility_wide | booking_confusion | mixed | 159 | 159 | 2 | medium | strong_signal |
| room_open_air_bath | specific | chlorine_smell | negative | 2 | 2 | 1 | low | weak_signal |
| room_open_air_bath | specific | weak_onsen_feeling | negative | 1 | 1 | 1 | low | weak_signal |
| public_bath | unclear | public_bath_hot_spring | neutral | 13 | 13 | 2 | medium | insufficient |
| private_bath | unclear | private_bath_experience | neutral | 3 | 3 | 1 | medium | insufficient |

## 5. 부정/주의 신호

| issue | bath_area | evidence_level | summary | sample_count |
|---|---|---|---|---:|
| 벌레 | room_open_air_bath | direct_review | 야외 객실탕 특성상 `虫`, `蚊` 계열 언급이 반복된다. Google 저평점에서도 노천탕 벌레 문제가 확인된다 | 25 |
| 온도 조절 | room_open_air_bath / room_bath | direct_review | `温度`, `ぬるい`, `熱い`, `湯加減` 계열이 반복된다 | 45 |
| 노후·청결 | facility_wide / room_bath | direct_review | `掃除`, `古い`, `匂い`, `カビ` 계열이 저평점과 일부 OTA 본문에서 확인된다 | 45 |
| 예약·송영·설명 | facility_wide | direct_review | `予約`, `送迎`, `説明`, `チェックイン` 계열은 욕장 자체보다 운영/안내 이슈로 반복된다 | 159 |
| 객실 수/범위 혼동 | facility_wide | official_conflict | 공식 13동과 Rakuten 10실 표기가 다르며, Oneness/TOKI와 혼동 가능성이 있다 | - |
| 대욕장/대절탕 오분류 | public_bath/private_bath | direct_review_unclear | 본문상 `大浴場`, `貸切` 소수 언급이 있으나 공식 공용탕 구조와 맞물려 확인되지 않아 Bathtime 욕장으로 확정하지 않는다 | 13 / 3 |

## 6. Evidence Examples

| signal_type | source_type | source_url | language | short_paraphrase | original_keyword | review_date |
|---|---|---|---|---|---|---|
| room_bath_hot_spring | Rakuten direct | https://travel.rakuten.co.jp/HOTEL/108775/review.html | ja | 애니버서리 플랜·객실 노천탕을 핵심 선택 이유로 언급 | 客室露天風呂 | 2026 |
| room_bath_hot_spring | Jalan direct | https://www.jalan.net/yad359266/kuchikomi/ | ja | 객실에 붙은 노천탕에 들어가며 휴식했다는 경험 신호 | 部屋付きの露天風呂 | 2025-06-15 |
| room_bath_hot_spring | Google-native direct | Google Hotels review tab | ja/ko-ui | 방에 노천탕이 있어 언제든 들어갈 수 있다는 긍정 신호 | 방에 노천탕 | 2025 |
| room_bath_hot_spring | Google-native direct | Google Hotels review tab | ja/ko-ui | 객실 내탕의 프로젝션을 아이가 좋아했다는 가족 이용 신호 | 내 목욕탕, 프로젝터 | 2026 |
| private_bath_experience | Jalan direct | https://www.jalan.net/yad359266/kuchikomi/archive/ | ja | 다른 손님 시선 없이 객실 욕장을 쓰는 프라이빗 체류가 반복됨 | プライベート, 露天風呂 | 2024-2025 |
| water_texture | Rakuten/Jalan direct | OTA review pages | ja | 물감·피부감 표현이 소수지만 반복됨 | 泉質, すべすべ | 2024-2026 |
| insects | Google-native direct | Google Hotels review tab | ja/ko-ui | 저평점에서 노천탕에 벌레가 떠 있어 이용이 어려웠다는 불만 | 노천탕, 벌레 | 2020 stay / recent edit |
| cleanliness_aging | Google-native direct | Google Hotels review tab | ja/ko-ui | 방 온천 기대와 달리 침구·객실 청결 문제를 제기 | 방에 온천, 머리카락 | 2024 |
| booking_confusion | Rakuten/Jalan direct | OTA review pages | ja | 예약·송영·체크인 설명 관련 운영 신호가 욕장 경험 주변에서 반복 | 予約, 送迎, 説明 | 2024-2026 |
| official_fact | Official/Rakuten | https://www.toba-kisara.com/kisara/ | ja | 공식/OTA는 객실 노천탕과 社宮司温泉 원천 주장을 표기 | 全室温泉露天風呂, 社宮司温泉 | official |

## 7. Bathtime Interpretation

직접 확인 표본 780건 중 객실 노천탕 관련 신호가 421건 반복되며, 이 숙소는 대욕장보다 객실 안 온천 경험을 중심으로 해석하는 편이 데이터에 맞다. 특히 `개인탕`이나 `프라이빗 온천`에 해당하는 리뷰 맥락은 시간 예약식 가족탕이 아니라 객실 노천탕/객실 내탕인 경우가 대부분이다.

다만 객실 노천탕형 숙소답게 벌레, 온도, 청결·노후, 설명/송영 같은 운영 신호도 함께 반복된다. Bathtime에서는 `전 객실 객실 노천탕`을 강하게 표시하되, 대욕장·대절탕은 공식 확인 전까지 욕장 단위로 확정하지 않는 것이 안전하다.

## 8. Gaps

- Naver Search/Blog는 Aside로 확인했지만 직접 한국어 숙박기 본문을 확보하지 못했다. 검색 preview와 AI 브리핑은 직접 리뷰 수에서 제외했다.
- Ikkyu/Yahoo는 Google 표면에서 visible pool과 평점만 확인했고, 정적 접근은 403이었다.
- Trip.com은 정적 HTML에서 리뷰풀 신호가 보였으나, `Kisara Oneness`와 혼동될 수 있어 직접 본문 수에는 넣지 않았다.
- Google Hotels rating distribution은 별점 행은 노출됐지만 숫자별 분포 카운트는 스냅샷에서 읽히지 않았다.
- 공식 객실 수가 공식 13동, Rakuten 10실로 다르게 보여 객실 재고/리브랜딩 범위 재확인이 필요하다.
