# XYZ Speciale 온천 리뷰 신호 요약

## 1. 수집 브리핑

- 조사 숙소: 1곳 (`shirahama-xyz-speciale`)
- 플랫폼상 전체 리뷰풀: 원시 표면 기준 약 770건. 단, Ikkyu/Yahoo 176건은 공유 리뷰풀 표면이고, Hotels.com 263건은 `XYZ Private spa and Seaside Resort`라 이번 숙소 직접 수에서 제외했다.
- 직접 읽은 리뷰 수: 251건
- 온천 관련 직접 리뷰 수: 174건
- 직접 본문 플랫폼 수: 8개 표면(Rakuten Travel, Jalan, Ikkyu, Yahoo Travel, Google Maps native, Trip.com, Expedia, Japanese blogs/Tabier)
- Google 확인: 기존 Aside Browser 확인에서 Google Maps visible 60건, Google-native 직접 10건, 온천 관련 5건. 2026-07-06 Aside exec 재시도는 빈 출력이라 새 증거로 산입하지 않았다.
- Naver 확인: 한국어 직접 숙박 본문 0건. 검색/OTA 스니펫은 `snippet_only`로 분리하고 직접 리뷰 수에서 제외했다.
- 보강 플랫폼: Yahoo Travel p1-p2, Trip.com review page, Expedia property page, 일본어 블로그/Tabier 직접 숙박기 5건.
- 접근 실패/제한: Google은 10건 이후 추가 로딩 실패가 유지된다. Ikkyu는 Aside에서 p6를 직접 열었지만 `公開中のクチコミはありません`로 확인됐다. Jalan은 중복 페이지. Agoda/Booking/JTB/Naver/Tripadvisor는 직접 본문 산입 불가 또는 미확보.
- data_quality_grade: `B`. 직접 251건과 다중 플랫폼 조건은 충족하지만 300건 미만이다.

## 2. 공식 사실

공식/시설 주장은 전실 분리형 객실에 원천가케나가시 노천탕이 붙은 숙소라는 점이다. Rakuten/OTA 표면에서는 객실 노천탕의 지붕과 전면 벽이 전동 개폐되어 날씨와 시선에 맞춰 조절 가능하다는 시설 정보도 확인된다.

이번 조사에서 대욕장, 공용 노천탕, 예약제 대절탕, 가족탕은 핵심 시설축으로 확인되지 않았다. 이 숙소는 `public_bath`형 숙소가 아니라 `room_open_air_bath`와 `room_bath` 중심으로 해석해야 한다.

## 3. 리뷰 신호 요약 표

| bath_area | signal_type | direction | mention_count | platform_count | status | 해석 |
|---|---:|---:|---:|---:|---|---|
| room_open_air_bath | room_bath_hot_spring | positive | 121 | 8 | moderate_signal | 객실 노천탕, 해전망, 별하늘, 프라이빗 이용이 뚜렷하게 확인된다. |
| room_bath | room_bath_hot_spring | positive | 40 | 6 | moderate_signal | 내탕/ミラバス/蛇口から温泉 신호가 노천탕보다 작지만 반복된다. |
| facility_wide | water_texture | positive | 62 | 8 | moderate_signal | `トロトロ`, `ヌルトロ`, `すべすべ`, `椿温泉`, `かけ流し` 계열 수질·피부감 표현이 반복된다. |
| public_bath | public_bath_hot_spring | neutral | 3 | 2 | weak_signal | 대욕장 만족 신호가 아니라 객실탕 중심 구조를 확인하는 보조 신호다. |
| room_open_air_bath | booking_confusion | mixed | 34 | 6 | moderate_signal | 전동 개폐, 레이저, 송영/예약, 객실식 신호가 온천 신호와 섞인다. |

## 4. 근거 예시

| source | language | review_date | paraphrase | original_keyword | source_url |
|---|---|---:|---|---|---|
| Rakuten Travel | ja | 2026-05-25 | 객실 노천탕의 개폐·시선 조절과 온천 이용을 함께 언급했다. | `客室露天風呂`, `開閉`, `目隠し` | https://travel.rakuten.co.jp/HOTEL/182811/review.html |
| Ikkyu | ja | 2026-06-19 | 미라블/미라바스와 전천후 객실 노천탕을 온천 경험으로 평가했다. | `ミラブル`, `ミラバス`, `全天候型露天風呂` | https://www.ikyu.com/00002920/review/ |
| Yahoo Travel | ja | 2026-06-28 | 객실 노천탕의 벽과 지붕이 움직이는 구조가 구체적으로 나타났다. | `露天風呂の壁と屋根が可動式` | https://travel.yahoo.co.jp/00002920/review/ |
| Yahoo Travel | ja | 2025-03-29 | 바다와 파도 소리를 배경으로 객실 온천을 쓰는 경험이 반복됐다. | `海を見ながらの温泉`, `波の音` | https://travel.yahoo.co.jp/00002920/review/p2/ |
| Yahoo Travel | ja | 2025-01-14 | 전동 개폐식 노천탕과 밤 시간대 수질·별하늘 조합이 드러났다. | `電動開閉式`, `トロトロ温泉`, `月と星空` | https://travel.yahoo.co.jp/00002920/review/p2/ |
| Yahoo Travel | ja | 2024-08-11 | 낮은 평점에서도 온천·객실탕 점수는 높고, 객실 온도·수압·송영 문제가 분리되어 나타났다. | `部屋の中のお風呂`, `水圧`, `送迎` | https://travel.yahoo.co.jp/00002920/review/p2/ |
| Trip.com | en/translated | 2024-01-08 | 식사와 함께 온천·별하늘 만족이 짧게 확인됐다. | `hot springs`, `stars` | https://in.trip.com/hotels/shirahama-hotel-detail-79030461/xyz-speciale/review.html |
| Expedia | en | 2024-06-07 | 객실 안에서 온천·식사·밤하늘을 함께 기억하는 신호가 있다. | `Onsen`, `star view`, `within the room` | https://www.expedia.co.jp/en/Tanabe-Hotels-XYZ-Speciale.h67621525.Hotel-Information |
| Expedia | ja | 2022-09-01 | 내탕과 객실 노천탕이 모두 온천으로 언급되고 pH/椿温泉 표현이 붙었다. | `内風呂`, `絶景露天風呂`, `かけ流し`, `椿温泉` | https://www.expedia.co.jp/en/Tanabe-Hotels-XYZ-Speciale.h67621525.Hotel-Information |
| Japanese blog | ja | 2025-09-04 | 객실 노천탕, 내탕 원천, 전동 셔터, 별하늘을 직접 숙박기로 언급했다. | `内風呂`, `源泉が出てくる`, `トロトロの源泉かけ流し` | https://plaza.rakuten.co.jp/ne510asobou46/diary/202509010000-amp/ |
| Google Maps native | ja | unknown | 객실 노천탕과 온천 만족을 짧게 남긴 Google-native 리뷰가 확인됐다. | `部屋の露天`, `温泉最高` | Google Maps panel via Aside Browser |

## 5. Bathtime 해석

직접 확인 표본 251건 중 온천 관련 본문은 174건이며, 신호는 대욕장보다 객실 노천탕과 객실 내탕에 집중된다. `客室露天風呂`, `内湯`, `ミラバス`, `トロトロ`, `ヌルトロ`, `椿温泉`이 여러 플랫폼에서 반복되어, 이 숙소는 “대욕장 품질”이 아니라 “객실 안에서 완결되는 원천가케나가시·해전망 온천 경험”으로 분류하는 편이 데이터에 맞다.

다만 레이저 연출, 롤스로이스/송영, 고가 기대치, 전동 지붕·벽 조작 신호가 온천 만족과 자주 붙어 나온다. Bathtime에서는 온천 수질·객실탕 구조와 숙박 연출/가격 기대치를 분리해 보여줘야 과대해석을 줄일 수 있다.

## 6. Gaps

- 300건 미달 종료 사유: 보강 후 직접 251건으로, A급까지 49건이 부족하다.
- Ikkyu: visible 176건 중 p1-p5 138건 직접 본문화. Aside Browser로 p6를 열었지만 `公開中のクチコミはありません`가 표시되고 p1-p5 네비게이션만 남아 추가 0건이다.
- Yahoo Travel: 2026-07-06 p1-p2로 37건까지 보강했지만, Ikkyu와 리뷰풀 공유 가능성이 있어 source_count 과대해석에 주의한다.
- Google Maps: visible 60건이나 리뷰 탭에서 10건 이후 추가 본문 로딩 실패. 2026-07-06 Aside exec 재시도는 빈 출력.
- Jalan: visible 77건이나 static p1-p4가 동일한 17건 고유 본문을 반복했다.
- Trip.com: visible 18건 중 8건만 직접 본문화.
- Expedia: visible 35건 중 16건만 직접 본문화. 평점만 있고 본문이 없는 항목은 제외했다.
- Hotels.com: 263건 표면은 `XYZ Private spa and Seaside Resort`라 숙소 정체성 불일치로 제외했다.
- Agoda/Booking/JTB/Tripadvisor/Naver: 직접 본문 수 0건. Naver 검색 결과와 OTA 스니펫은 직접 리뷰 수에서 제외.

다음에 A급으로 올리려면 최소 49건 이상의 추가 직접 본문이 필요하다. 우선 Google Maps native 미확보 50건, Agoda 리뷰 패널 본문, Expedia/Trip.com 잔여 본문, Naver Blog/Cafe 직접 숙박 글을 재확인해야 한다.
