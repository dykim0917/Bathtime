# 有馬グランドホテル / Arima Grand Hotel 딥리서치 리뷰 신호 요약

## 1. 수집 브리핑

- 이번 숙소: 1곳, `arima-grand-hotel` / 有馬グランドホテル / 아리마 그랜드 호텔
- 플랫폼상 전체 리뷰풀: 최소 6,537건 노출 확인
  - Google Hotels/Maps 3,226건
  - Jalan 현재 88건 + 과거 1,866건 표면
  - Rakuten Travel 154건
  - JTB 151건
  - Trip.com 199건은 Google 공급자 카드 기준
  - Tripadvisor 449건은 Google 공급자 카드 기준
  - Hotels.com/Naver 표면 404건은 검색 결과 스니펫
- 직접 읽은 리뷰 수: 402건
- 온천 관련 직접 리뷰 수: 189건
- 직접 본문 확인 플랫폼 수: 5개
  - Rakuten Travel 154건
  - Jalan 88건
  - JTB 151건
  - Google Hotels/Maps native 8건
  - Naver Blog 1건
- Google / Naver 확인 여부: Google Hotels/Maps는 Aside Browser로 리뷰 탭을 직접 확인. Naver Search는 검색 결과와 본문을 분리했고, Naver Blog 1건만 직접 리뷰로 계산.
- 접근 실패/제한: Ikkyu 정적 403, Yahoo Travel 정적 403, Tripadvisor 정적 403, Expedia 인간 인증. Trip.com·Hotels.com·Naver Cafe는 이번 라운드에서 `snippet_only`.
- 데이터 등급: A. 300건 이상 직접 확인했고, 직접 본문 플랫폼 5개에서 최신·저평점·온천 키워드·한국어 리뷰 층화가 확인된다.

## 2. 공식 사실

공식 사실은 후기 신호와 분리한다. 有馬グランドホテル은 아리마 온천 고지대의 대형 온천호텔이며, 공식/OTA 시설 표면에서 9층 展望大浴苑 `雲海`, 지하 대욕장 `ゆらり`, `アクアテラス`, 貸切風呂/プライベートスパ, 일부 露天風呂付き客室이 확인된다. 객실 노천탕은 金泉露天風呂付き와 銀泉露天風呂付き 객실 타입으로 나타나며 전 객실 시설이 아니다.

JTB 욕장 페이지는 온천을 `放流・循環併用式、加温している`로 표기하고, 赤茶色/湯の華/塩味・鉄味/湧出口泉温37.1℃ 표면을 제공한다. 공식 사이트 본문에서는 가수·가온·순환·소독 세부가 충분히 고정되지 않으므로, Bathtime 공식 사실 필드에는 JTB 표면과 공식 사이트를 분리 출처로 기록해야 한다.

## 3. 리뷰 신호 요약 표

| accommodation_name | bath_area | bath_area_confidence | signal_type | signal_direction | mention_count | source_count | platform_count | contradiction_level | review_signal_status |
|---|---|---:|---|---|---:|---:|---:|---|---|
| 有馬グランドホテル | public_bath | specific | public_bath_hot_spring | positive | 46 | 46 | 5 | low | strong_signal |
| 有馬グランドホテル | open_air_public_bath | specific | public_bath_hot_spring | positive | 16 | 16 | 4 | low | moderate_signal |
| 有馬グランドホテル | facility_wide | facility_wide | water_texture | positive | 54 | 54 | 5 | low | strong_signal |
| 有馬グランドホテル | room_open_air_bath | specific | room_bath_hot_spring | mixed | 29 | 29 | 3 | medium | moderate_signal |
| 有馬グランドホテル | private_bath | specific | private_bath_experience | positive | 12 | 12 | 2 | low | moderate_signal |
| 有馬グランドホテル | family_bath | probable | private_bath_experience | neutral | 2 | 2 | 1 | medium | weak_signal |
| 有馬グランドホテル | facility_wide | facility_wide | crowding | mixed | 27 | 27 | 4 | medium | moderate_signal |
| 有馬グランドホテル | facility_wide | facility_wide | booking_confusion | mixed | 88 | 88 | 5 | medium | strong_signal |

## 4. 근거 예시

| # | paraphrase | original_keyword | source_url | language | review_date |
|---:|---|---|---|---|---|
| 1 | 최신 Rakuten 표본에서 대욕장 경치와 숙박 만족이 함께 언급된다. | `大浴場`, `景色` | https://travel.rakuten.co.jp/HOTEL/25128/review.html | ja | 2026-07-04 |
| 2 | 金泉/銀泉을 모두 이용했다는 Rakuten 본문이 반복된다. | `金泉`, `銀泉`, `温泉` | https://travel.rakuten.co.jp/HOTEL/25128/review.html | ja | 2026-06-21 |
| 3 | 객실 노천탕 타입은 金泉露天付き 객실에서 구체적으로 드러난다. | `金泉`, `露天風呂` | https://travel.rakuten.co.jp/HOTEL/25128/review.html | ja | 2026-05-23 |
| 4 | 저평점 Rakuten 표본에도 대욕장 자체보다는 대형 호텔 적합성/운영 기대차가 나타난다. | `大浴場`, `静か`, `送迎` | https://travel.rakuten.co.jp/HOTEL/25128/review.html | ja | 2025-12-19 |
| 5 | Jalan 저평점 표본에서는 객실/냄새/기대차가 노천 객실 타입과 결합된다. | `匂い`, `露天風呂付き` | https://www.jalan.net/yad313952/kuchikomi/ | ja | 2026-03-01 |
| 6 | JTB 표본에서는 목욕탕·호텔 자체가 좋았다는 짧은 평가가 반복된다. | `風呂が良かった` | https://www.jtb.co.jp/kokunai-hotel/htl/6435003/review/ | ja | 2026-03-22 |
| 7 | Google 한국어 리뷰에서 꼭대기층 대욕장 전망, 넓은 탕, 낮은 붐빔이 함께 확인된다. | `대욕장`, `경치`, `붐비지` | https://www.google.com/travel/search?q=%E6%9C%89%E9%A6%AC%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%89%E3%83%9B%E3%83%86%E3%83%AB | ko | 2025 |
| 8 | Google 한국어 당일온천 리뷰는 숙박과 다른 이용 맥락으로 분리해야 한다. | `당일 온천`, `탕`, `사우나` | https://www.google.com/travel/search?q=%E6%9C%89%E9%A6%AC%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%89%E3%83%9B%E3%83%86%E3%83%AB | ko | 2025 |
| 9 | Naver Blog 직접 본문은 9층 雲海와 지하 ゆらり를 분리해 설명한다. | `雲海`, `ゆらり`, `금탕`, `은탕` | https://m.blog.naver.com/omrchoi/224226813921 | ko | 2026-03-23 |
| 10 | Naver Search/Cafe에서는 당일온천과 9층/지하 대욕장 이용 조건 질문이 반복되지만 본문 미열람이므로 스니펫이다. | `당일치기`, `9층`, `대욕장` | https://search.naver.com/search.naver?query=%EC%95%84%EB%A6%AC%EB%A7%88%20%EA%B7%B8%EB%9E%9C%EB%93%9C%20%ED%98%B8%ED%85%94%20%EB%8C%80%EC%9A%95%EC%9E%A5%20%ED%9B%84%EA%B8%B0 | ko | snippet_only |

## 5. Bathtime 해석

직접 확인 표본 402건 중 온천 관련 본문이 189건이며, 대형 호텔형 대욕장 만족과 金泉/銀泉 구분이 강하게 반복된다. 이 숙소는 객실탕 중심 숙소라기보다 9층 전망대욕장 `雲海`와 지하 `ゆらり`를 분리해 해석해야 데이터가 맞다.

객실 노천탕 신호도 존재하지만 객실 타입/플랜 의존성이 크고, 후기 본문에서는 대욕장·전망·금천/은천 경험이 더 넓게 반복된다. 한국어 수요에서는 숙박 후기와 당일온천 후기가 섞이므로, Bathtime에서는 `lodging_stay`와 `day_use` 맥락을 분리하고 Google/카페/검색 스니펫을 직접 리뷰 수로 올리지 않는 편이 안전하다.

## 6. Gaps

- Ikkyu: 정적 접근 403. 브라우저 동적 확인 필요.
- Yahoo Travel: 정적 접근 403. 브라우저 동적 확인 필요.
- Tripadvisor: 정적 접근 403. Google 공급자 카드 449건은 visible pool로만 기록.
- Expedia: 인간 인증으로 본문 접근 실패.
- Trip.com: Google/Naver 표면에서 199~201건 신호가 보이나 본문 직접 확인 없음.
- Jalan: 현재 88건은 직접 확인, 과거 1,866건 표면은 archive 경로 404로 이번 직접 리뷰 수에 포함하지 않음.
