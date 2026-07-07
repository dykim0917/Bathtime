# 中の坊瑞苑 / Nakanobo Zuien 딥리서치 리뷰 신호 요약

## 1. 수집 브리핑

- 이번 숙소: 1곳, `arima-nakanobo` / 中の坊瑞苑 / 나카노보 즈이엔
- 플랫폼상 전체 리뷰풀: 최소 2,238건 노출 확인
  - Rakuten Travel 626건
  - Jalan 888건
  - Google Hotels/Maps 701건
  - Trip.com 23건은 Naver 검색 결과에서 노출된 `snippet_only` 리뷰풀
- 직접 읽은 리뷰 수: 433건
- 온천 관련 직접 리뷰 수: 305건
- 직접 본문 확인 플랫폼 수: 5개
  - Rakuten Travel 240건
  - Jalan 172건
  - Google Hotels/Maps native 18건
  - Naver Blog 2건
  - Korean web blog 1건
- Google / Naver 확인 여부: Google Hotels/Maps는 Aside Browser로 추천순·저평점 표본 확인. Naver Blog는 모바일 본문 2건 직접 확인, Naver Search 결과는 `snippet_only`로 분리.
- 접근 실패/제한: Ikkyu 정적 403, Yahoo Travel 정적 403, Relux는 identity mismatch, Trip.com은 이번 라운드에서 검색 스니펫만 확인.
- 데이터 등급: A. 300건 이상 직접 확인했고, 직접 본문 플랫폼 5개에서 최신·저평점·온천 키워드·한국어 층화가 확인된다.

## 2. 공식 사실

공식 사실은 후기 신호와 분리한다. 공식 사이트와 Rakuten 시설면 기준으로, 中の坊瑞苑은 숙박자 전용 아리마 온천 료칸이며 입욕만 이용은 하지 않는다. 객실 타입에는 `金泉露天付き`, `銀泉露天付き`, `金泉銀泉露天付き`가 확인되지만 전 객실은 아니다.

대욕장 `瑞泉`과 `爽泉`은 내탕, 사우나, 공용 노천탕을 갖춘 구조로 확인된다. 공식 설명상 대욕장은 金泉 중심이고, 별도 욕장으로 유료 예약제 `貸切家族風呂「寿泉」`과 무료 `貸切露天風呂`가 있다. 공식/OTA 표면에서 金泉·銀泉의 가온/가수 및 대절탕 이용 시간 표기가 일부 엇갈려, 이는 후기 신호가 아니라 공식 데이터 재검증 항목으로 둔다.

## 3. 리뷰 신호 요약 표

| accommodation_name | bath_area | bath_area_confidence | signal_type | signal_direction | mention_count | source_count | platform_count | contradiction_level | review_signal_status |
|---|---|---:|---|---|---:|---:|---:|---|---|
| 中の坊瑞苑 | facility_wide | facility_wide | water_texture | positive | 98 | 98 | 5 | low | strong_signal |
| 中の坊瑞苑 | room_open_air_bath | specific | room_bath_hot_spring | positive | 84 | 84 | 4 | low | strong_signal |
| 中の坊瑞苑 | public_bath | specific | public_bath_hot_spring | positive | 56 | 56 | 4 | low | strong_signal |
| 中の坊瑞苑 | open_air_public_bath | specific | public_bath_hot_spring | positive | 23 | 23 | 4 | low | moderate_signal |
| 中の坊瑞苑 | private_bath | specific | private_bath_experience | positive | 18 | 18 | 2 | low | moderate_signal |
| 中の坊瑞苑 | family_bath | specific | private_bath_experience | mixed | 5 | 5 | 1 | medium | weak_signal |
| 中の坊瑞苑 | facility_wide | facility_wide | crowding | positive | 53 | 53 | 4 | low | strong_signal |
| 中の坊瑞苑 | facility_wide | facility_wide | booking_confusion | mixed | 116 | 116 | 4 | medium | strong_signal |
| 中の坊瑞苑 | facility_wide | unclear | weak_onsen_feeling | negative | 2 | 2 | 1 | high | conflicting |

## 4. 근거 예시

| # | paraphrase | original_keyword | source_url | language | review_date |
|---:|---|---|---|---|---|
| 1 | 최신 Rakuten 표본에서 금천 객실 노천탕과 대욕장 노천을 함께 이용한 후기가 확인된다. | `金泉露天風呂`, `大浴場`, `露天風呂` | https://travel.rakuten.co.jp/HOTEL/25288/review.html | ja | 2026-03-31 |
| 2 | 객실 노천탕을 24시간 이용할 수 있었다는 직접 언급이 있다. | `部屋の露天風呂`, `24時間` | https://travel.rakuten.co.jp/HOTEL/25288/review.html | ja | 2026-06-19 |
| 3 | 무료 대절 노천탕은 은천 경험으로 언급된다. | `銀泉`, `貸切露天` | https://travel.rakuten.co.jp/HOTEL/25288/review.html | ja | 2026-03-30 |
| 4 | 가족탕은 대욕장과 함께 소수 언급되며, 예약/동선 신호와 결합된다. | `家族風呂`, `大浴場` | https://travel.rakuten.co.jp/HOTEL/25288/review.html | ja | 2025-01-17 |
| 5 | Google 한국어 리뷰에서 은탕 개별 이용과 금탕/은탕 만족이 함께 나온다. | `개별온천`, `금탕`, `은탕` | https://www.google.com/travel/search?q=%E4%B8%AD%E3%81%AE%E5%9D%8A%E7%91%9E%E8%8B%91%20%E6%9C%89%E9%A6%AC | ko | 2024 |
| 6 | Google 저평점 표본에 은탕/백탕의 온천감 의심 표현이 있으나 소수 반대 신호다. | `백탕`, `온천`, `수돗물` | https://www.google.com/travel/search?q=%E4%B8%AD%E3%81%AE%E5%9D%8A%E7%91%9E%E8%8B%91%20%E6%9C%89%E9%A6%AC | ko | 2026 |
| 7 | 한국어 Naver Blog 투숙 후기에서 방 안 개인 온천욕과 은탕 객실 선택이 구체적으로 설명된다. | `개인 온천욕`, `은탕`, `방` | https://m.blog.naver.com/kuriiiiii/223799907525 | ko | 2025-03-17 |
| 8 | 한국어 Naver Blog 투숙 후기에서 금천 노천 객실 예약과 대욕장 금탕 구분이 확인된다. | `金泉露天付き`, `대욕장`, `금탕` | https://m.blog.naver.com/bs60208/224129753367 | ko | 2025-12-31 |
| 9 | Korean web 체류 후기에서 프라이빗 가족탕/노천탕을 선택 이유 중 하나로 든다. | `프라이빗 가족탕`, `노천탕`, `금탕/은탕` | https://keiberry.net/arima-onsen/ | ko | 2021-02-25 |
| 10 | Jalan 현재/아카이브 표본은 온천 언급 비율이 높고, 대욕장·노천·객실 타입 신호를 보강한다. | `温泉`, `露天`, `大浴場` | https://www.jalan.net/yad342576/kuchikomi/ | ja | mixed |

## 5. Bathtime 해석

직접 확인 표본 433건 중 온천 관련 본문이 305건이며, 금泉/銀泉의 물성 구분과 객실 노천탕 경험이 강하게 반복된다. 이 숙소는 단순히 “대욕장이 좋은 아리마 료칸”이 아니라, 객실 타입에 따라 금천·은천·객실 노천 경험이 갈리는 숙소로 해석해야 한다.

대욕장과 공용 노천탕 만족도도 충분히 강하지만, 무료 대절 노천탕과 유료 가족탕은 별도 욕장으로 분리해야 한다. 특히 한국어 후기의 `개인 온천욕` 표현은 가족탕이 아니라 객실 내 온천/객실 노천탕을 가리키는 사례가 확인되므로 Bathtime 데이터에서는 `room_open_air_bath` 중심으로 태깅하는 편이 맞다.

## 6. Gaps

- Ikkyu: 정적 접근 403. 브라우저 동적 확인을 추가하면 고가 숙소 이용자 표본을 더 보강할 수 있다.
- Yahoo Travel: 정적 접근 403. 브라우저 동적 확인 필요.
- Trip.com: Naver 검색 결과에서 23건과 9.2점만 확인, 본문은 열람하지 않아 `snippet_only`.
- Naver Cafe: 검색 결과 스니펫만 확인, 본문 직접 열람 없음.
- Google: Aside Browser로 직접 확인했으나 무한 스크롤 전체 701건을 끝까지 읽은 것은 아니다. Google-native 직접 표본은 18건으로 기록한다.
