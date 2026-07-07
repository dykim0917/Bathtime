# 有馬温泉 御幸荘 花結び / Miyukiso Hanamusubi 리뷰 신호 요약

## 1. 수집 브리핑

- 이번 조사 숙소: 1곳, `有馬温泉 御幸荘 花結び` / Miyukiso Hanamusubi / 아리마 핫 스프링 료칸 하나무스비.
- 플랫폼상 전체 리뷰풀: 최소 4,246건 매핑. Rakuten 2,125건, Jalan 114건, JTB 57건, Google 1,044건, Booking.com 470건, Trip.com 209건, Tripadvisor 127건, JAPANiCAN 100건 기준이다. Rakuten Korean 717건은 Rakuten 본체와 중복 가능성이 있어 최소 합계에서 제외했다. 이 숫자는 플랫폼 노출 수이며 직접 읽은 수와 합산하지 않는다.
- 직접 읽은 리뷰 수: 548건.
- 온천 관련 직접 리뷰 수: 306건.
- 직접 본문 플랫폼 수: 5개. Rakuten Travel, Jalan, JTB, Google Reviews, Naver Blog.
- Google 확인: Aside Browser로 Google 검색 패널을 확인했다. 평점 4.1, Google 리뷰 1,044개 노출. Google-native 리뷰 6건을 직접 확인했고, 그중 온천 관련 본문은 4건이다. Google 화면 안의 Trip.com/Tripadvisor 공급자 카드는 Google-native 리뷰에서 제외했다.
- Naver 확인: Aside Browser로 Naver Search와 Blog 원문을 확인했다. 검색 결과 설명은 `snippet_only`로 분리했고, Naver Blog 원문 3건만 직접 리뷰로 계산했다. 그중 온천 관련 본문은 2건이다.
- 접근 실패/제한: Google rating_distribution은 확보하지 못했다. Booking.com, Trip.com, JAPANiCAN, Rakuten Travel Korean은 Naver 검색 결과 또는 Google 공급자 카드 수준으로 확인되어 직접 리뷰 수에서 제외했다. Ikkyu/Yahoo Travel은 URL과 공식/OTA 설명 표면은 확인했으나 A등급 달성 후 직접 본문 표본에는 포함하지 않았다.

## 2. 공식 사실

공식 사이트 기준으로 이 숙소의 온천 경험은 세 축으로 나뉜다. 첫째, 6층에 5개 타입의 `金泉付き露天風呂客室`이 있고, 해당 객실 노천은 24시간 金泉 이용 가능하다고 안내된다. 둘째, 7층에 展望大浴場 `花がすみ`와 `花ごよみ`가 있으며, 金泉/銀泉 계열의 공용 욕장으로 설명된다. 셋째, `展望金泉貸切露天風呂 花ごころ`는 사전 예약이 필요한 유료 45분 대절탕이다.

중요한 분리점은 객실 내탕이다. 공식 FAQ는 일반 객실의 실내 욕실은 온천이 아니며, 온천은 노천탕 객실에 한정된다고 설명한다. 따라서 후기의 `部屋風呂`, `객실 욕실`, `개인탕` 표현은 객실 노천탕인지, 일반 객실 내탕인지, 유료 대절/가족탕인지 문맥별로 분리해야 한다. JTB는 온천을 순환여과식·가온으로 표기하고, 湧出口泉温 98.6℃와 含鉄泉을 제시한다. Rakuten은 天然温泉, 含食塩石膏泉, 大浴場/露天風呂/家族風呂를 표기한다.

## 3. 리뷰 신호 요약 표

| bath_area | bath_area_confidence | signal_type | signal_direction | mention_count | source_count | platform_count | contradiction_level | review_signal_status |
|---|---|---|---|---:|---:|---:|---|---|
| room_open_air_bath | specific | room_bath_hot_spring | positive | 124 | 120+ | 3 | low | strong_signal |
| room_bath | probable | room_bath_hot_spring | mixed | 164 | 160+ | 3 | medium | moderate_signal |
| private_bath | specific | private_bath_experience | mixed | 33 | 33 | 5 | low | moderate_signal |
| family_bath | probable | private_bath_experience | mixed | 6 | 6 | 3 | medium | weak_signal |
| public_bath | specific | public_bath_hot_spring | mixed | 56 | 55+ | 5 | low | moderate_signal |
| open_air_public_bath | specific | public_bath_hot_spring | positive | 26 | 26 | 4 | low | moderate_signal |
| facility_wide | facility_wide | water_texture | mixed | 147 | 145+ | 3 | medium | strong_signal |
| facility_wide | facility_wide | booking_confusion | mixed | 164 | 160+ | 5 | low | strong_signal |
| facility_wide | facility_wide | weak_onsen_feeling | negative | 4 | 4 | 1 | medium | weak_signal |
| facility_wide | facility_wide | chlorine_smell | negative | 3 | 3 | 1 | medium | weak_signal |

주의: `room_bath` 164건은 자동 태그상 `部屋風呂` 및 객실명 문맥을 넓게 잡은 탐색 신호다. 공식 FAQ상 일반 객실 내탕은 온천이 아니므로, Bathtime의 핵심 객실탕 신호는 `room_open_air_bath` 5실 金泉 노천 객실로 해석해야 한다.

## 4. 근거 예시

| # | paraphrase | original_keyword | source_url | language | review_date |
|---:|---|---|---|---|---|
| 1 | Rakuten 최신 객실 타입 리뷰에서 金泉露天風呂付きジュニアスイート가 반복된다. | `金泉`, `露天風呂付き`, `ひのき風呂` | https://travel.rakuten.co.jp/HOTEL/9576/review.html | ja | 2026-06-10 |
| 2 | Rakuten 가족 여행 리뷰에서 유료 대절탕/가족탕 이용 신호가 객실 경험과 함께 나온다. | `露天`, `貸切`, `貸切風呂` | https://travel.rakuten.co.jp/HOTEL/9576/review.html | ja | 2026-06-26 |
| 3 | Rakuten 저평점에 가까운 표본에서 대욕장 규모와 입지 기대 차이가 함께 언급된다. | `大浴場`, `温泉街`, `送迎` | https://travel.rakuten.co.jp/HOTEL/9576/review.html | ja | 2026-03-15 |
| 4 | Rakuten 표본에서 銀泉 대욕장에 대해 약한 온천감/소독 냄새 신호가 소수 확인된다. | `銀泉`, `大浴場`, `カルキ` | https://travel.rakuten.co.jp/HOTEL/9576/review.html | ja | 2024-09-09 |
| 5 | Google-native 한국어 리뷰에서 프라이빗 온천을 친구들과 이용했다는 만족 신호가 확인된다. | `프라이빗 온천` | https://www.google.com/search?q=%E6%9C%89%E9%A6%AC%E6%B8%A9%E6%B3%89%20%E5%BE%A1%E5%B9%B8%E8%8D%98%20%E8%8A%B1%E7%B5%90%E3%81%B3 | ko | 2025 |
| 6 | Google-native 한국어 리뷰에서 야외 온천과 청결을 함께 긍정한다. | `온천도 깔끔`, `야외온천` | https://www.google.com/search?q=%E6%9C%89%E9%A6%AC%E6%B8%A9%E6%B3%89%20%E5%BE%A1%E5%B9%B8%E8%8D%98%20%E8%8A%B1%E7%B5%90%E3%81%B3 | ko | 2025 |
| 7 | Naver Blog 원문은 개인탕을 객실탕이 아니라 예약제 가족탕으로 설명한다. | `개인탕(가족탕)`, `금탕`, `40분` | https://blog.naver.com/daymany/223735979971 | ko | 2025-01-23 |
| 8 | Naver Blog 원문은 7층 대욕장, 금탕 노천, 은탕을 분리하고 유료 개인욕탕은 이용하지 않았다고 적는다. | `대욕탕`, `금탕(노천탕)`, `은탕`, `개인욕탕` | https://blog.naver.com/belief_me/223554688484 | ko | 2024-08-20 |
| 9 | Naver Blog 원문 중 일부는 식사·객실 컨디션 중심이라 온천 직접 신호로 세지 않았다. | `숙박비`, `머리카락`, `벌레` | https://blog.naver.com/mhj2357/223303357058 | ko | 2023-12-27 |

## 5. Bathtime 해석

직접 확인 표본 548건 중 온천 관련 본문은 306건이며, 金泉 객실 노천과 대욕장/대절탕 신호가 모두 반복된다. 다만 이 숙소는 “전 객실 온천탕 숙소”가 아니라, 공식상 5개 객실만 金泉 노천탕을 갖고 일반 객실 내탕은 온천이 아니므로 객실 타입 오해를 강하게 관리해야 한다.

후기 신호는 객실 金泉 노천탕의 만족, 7층 공용 금탕/은탕 대욕장, 유료 대절/가족탕 예약 경험으로 나뉜다. 한국어 리뷰의 `개인탕`은 객실 안의 개별탕으로 바로 번역하면 안 되고, 이번 표본에서는 주로 `private_bath/family_bath` 문맥으로 확인된다.

## 6. Gaps

- Google rating_distribution은 Aside Browser 화면에서 직접 확보하지 못했다.
- Booking.com, Trip.com, Agoda는 직접 본문 표본을 열지 못했고, Naver 검색 결과 또는 Google 공급자 카드 수준으로만 남겼다.
- Google Travel 안의 Trip.com/Tripadvisor 공급자 카드는 Google-native 리뷰로 세지 않았다.
- Ikkyu/Yahoo Travel은 직접 본문 표본을 추가하지 않았다. 다음 보강 시 두 플랫폼의 리뷰 본문 접근성을 확인하면 대절탕/가족탕 신호를 더 정밀하게 분리할 수 있다.
- 공식 pH, 문신 정책, 소독/가수 상세 표기는 이번 확인 범위에서 구조화하지 못했다.
