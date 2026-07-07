# 白浜温泉 ホテル三楽荘 / Hotel Sanrakuso 리뷰 신호 요약

## 1. 수집 브리핑

- 이번 조사 숙소: 1곳, `白浜温泉 ホテル三楽荘` / Hotel Sanrakuso / 호텔 산라쿠소.
- 플랫폼상 전체 리뷰풀: 최소 7,827건 매핑. Rakuten API 2,109건, Jalan 3,533건, Google 938건, Trip.com 358건, Tripadvisor 187건, Booking.com 345건, Traveloka 357건 기준이다. Rakuten Korean 769건은 Rakuten 본체와 중복 가능성이 있어 최소 합계에서 제외했다. 이 숫자는 플랫폼 노출 수이며 직접 읽은 수와 합산하지 않는다.
- 직접 읽은 리뷰 수: 535건.
- 온천 관련 직접 리뷰 수: 326건.
- 직접 본문 플랫폼 수: 3개. Rakuten Travel, Jalan, JTB.
- Google 확인: Aside Browser로 Google Search/Maps를 확인했다. 평점 4.2, Google 리뷰 938개 노출, rating_distribution은 5성 401 / 4성 366 / 3성 120 / 2성 24 / 1성 27이다. 개별 Google-native 리뷰 본문은 확보하지 못했고, Trip.com/Tripadvisor 공급자 카드는 Google-native 리뷰로 세지 않았다.
- Naver 확인: Aside Browser로 Naver Search를 확인했다. Trip.com, Booking.com, Agoda, Rakuten Travel Korean, Tripadvisor, Traveloka 표면은 확인했지만 검색 결과 설명은 `snippet_only`로 분리했고 직접 리뷰 수에는 넣지 않았다.
- 접근 실패/제한: Google-native 개별 리뷰 본문은 이번 snapshot에서 직접 확보하지 못했다. Google Maps 안의 Trip.com/Tripadvisor 공급자 카드 2건은 짧게 확인했지만 직접 총량과 직접 플랫폼 수에서 제외했다. Naver Blog 원문은 검색 1면에서 확인되지 않았다. Yahoo Travel/Ikkyu는 이번 A등급 달성 후 직접 본문 표본에는 포함하지 않았다.

## 2. 공식 사실

공식 사이트 기준으로 이 숙소는 전 객실 오션뷰이며, 9F `ましらの`과 8F `浜水晶`에 총 22실의 `源泉かけ流し露天風呂付客室`을 둔다. 이 객실 노천탕은 산쪽 원천인 `藤の湯`를 사용하는 객실 노천탕으로 정리해야 한다.

공용 온천은 대욕장 `夕月`과 `宵待`가 중심이며, `藤の湯`와 `衝幹の湯` 두 원천을 즐기는 구조다. 공식 안내는 대욕장에 `露天風呂はございません`이라고 명시하므로, 후기의 `露天風呂` 반복은 대부분 객실 노천탕 문맥으로 분리해야 한다. 6F `波の綾`의 `ミラバス付客室`은 바다 조망 객실 내 욕조 신호로 보되, 온천 객실탕으로 단정하지 않는다. 공식은 2종 원천 100%かけ流し를 강조하지만, 대욕장 안내에는 위생관리상 塩素系薬剤 사용 표기도 함께 있다.

## 3. 리뷰 신호 요약 표

| bath_area | bath_area_confidence | signal_type | signal_direction | mention_count | source_count | platform_count | contradiction_level | review_signal_status |
|---|---|---|---|---:|---:|---:|---|---|
| room_open_air_bath | specific | room_bath_hot_spring | positive | 266 | 260+ | 4 | low | strong_signal |
| room_bath | probable | room_bath_hot_spring | mixed | 269 | 260+ | 5 | medium | moderate_signal |
| public_bath | specific | public_bath_hot_spring | mixed | 121 | 120+ | 5 | low | strong_signal |
| open_air_public_bath | unclear | public_bath_hot_spring | neutral | 67 | 60+ | 2 | high | insufficient |
| facility_wide | facility_wide | water_texture | positive | 128 | 125+ | 3 | low | strong_signal |
| facility_wide | facility_wide | crowding | mixed | 134 | 130+ | 3 | medium | moderate_signal |
| facility_wide | facility_wide | weak_onsen_feeling | negative | 3 | 3 | 2 | medium | weak_signal |
| private_bath | unclear | private_bath_experience | neutral | 4 | 4 | 1 | high | insufficient |

주의: `open_air_public_bath`는 공식 사실과 충돌한다. 공용 대욕장에는 공식상 노천탕이 없으므로, 이 태그는 본문 안에서 객실 노천탕과 대욕장 표현이 함께 등장한 자동 태그 혼입으로 보고 Bathtime 표시에는 사용하지 않는 편이 안전하다.

## 4. 근거 예시

| # | paraphrase | original_keyword | source_url | language | review_date |
|---:|---|---|---|---|---|
| 1 | Rakuten 최신 리뷰에서 온천 노천 객실과 대욕장이 함께 언급되며, 객실 노천 쪽 만족이 중심이다. | `温泉露天風呂付`, `大浴場` | https://travel.rakuten.co.jp/HOTEL/8226/review.html | ja | 2026-06-28 |
| 2 | Rakuten 표본에서 露天風呂付き客室과 白良浜 조망이 반복된다. | `客室露天風呂`, `景色` | https://travel.rakuten.co.jp/HOTEL/8226/review.html | ja | 2026-05-31 |
| 3 | Rakuten 저평점 쪽 표본에서도 객실 노천탕은 언급되지만 시설·블라인드 등 운영 기대 차이가 같이 나타난다. | `露天風呂付客室`, `古い` | https://travel.rakuten.co.jp/HOTEL/8226/review.html | ja | 2026-05-16 |
| 4 | Jalan 최신 리뷰는 객실 노천탕의 원천가케나가시와 대욕장을 동시에 언급한다. | `源泉掛け流し`, `大浴場` | https://www.jalan.net/yad316623/kuchikomi/ | ja | 2026-06-27 |
| 5 | Jalan 리뷰에서 6F 미라버스 객실은 온천보다 객실 욕조/조망 경험으로 나타난다. | `ミラバス`, `白良浜` | https://www.jalan.net/yad316623/kuchikomi/ | ja | 2026-06-27 |
| 6 | JTB 표본에서도 객실 노천탕과 白良浜 전망이 함께 언급된다. | `客室露天風呂`, `白良浜` | https://www.jtb.co.jp/kokunai-hotel/htl/6506008/review/ | ja | 2020-01-07 |

## 5. Bathtime 해석

직접 확인 표본 535건 중 온천 관련 본문은 326건이며, 객실 노천탕과 白良浜 조망의 결합이 강하게 반복된다. 이 숙소는 “대욕장 노천이 좋은 숙소”가 아니라, 22실의 원천가케나가시 객실 노천탕과 공용 2원천 내탕 대욕장을 분리해 보여줘야 데이터에 맞다.

미라버스 객실은 조망형 객실 욕조 경험으로는 반복되지만, 온천 객실탕으로 섞으면 안 된다. Bathtime에서는 `room_open_air_bath`를 핵심 신호로, `public_bath`는 두 원천·대욕장 경험으로, `room_bath`는 미라버스/일반 객실 욕조가 섞인 보조 신호로 표시하는 편이 적절하다.

## 6. Gaps

- Google-native 개별 리뷰 본문은 확보하지 못했다. Google Maps에서 rating, visible count, rating distribution, 공급자 카드 본문은 확인했다.
- Naver Blog 원문은 검색 1면에서 직접 확인되지 않았다. Naver 검색 결과는 `snippet_only`로 분리했다.
- Yahoo Travel/Ikkyu는 직접 본문 표본을 추가하지 않았다.
- JTB visible_review_count는 정적 페이지에서 안정적으로 구조화하지 못했다.
- 공식 원천 온도와 pH는 이번 확인 범위에서 구조화하지 못했다.
