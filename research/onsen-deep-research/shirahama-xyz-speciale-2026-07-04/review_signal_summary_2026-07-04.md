# XYZ Speciale 온천 리뷰 신호 요약

## 1. 수집 브리핑

- 조사 숙소: 1곳 (`shirahama-xyz-speciale`)
- 플랫폼상 전체 리뷰풀: 원시 플랫폼 표면 합산 약 650건. 단, Ikkyu/Yahoo 176건은 공유 리뷰풀로 보여 중복 주의가 필요하다.
- 직접 읽은 리뷰 수: 191건
- 온천 관련 직접 리뷰 수: 135건
- 직접 본문 플랫폼 수: 5개 표면(Rakuten Travel, Jalan, Ikkyu, Yahoo Travel, Google Maps native)
- Google 확인: Aside Browser로 Google Maps 패널과 리뷰 탭 확인. visible 60건, 직접 Google-native 10건, 온천 관련 5건.
- Naver 확인: 정확 숙소명 기준 한국어 블로그/카페 직접 본문 없음. 검색/OTA 스니펫은 `snippet_only`로 분리하고 직접 리뷰 수에서 제외.
- 접근 실패/제한: Agoda/Booking/Expedia는 리뷰 수·하이라이트·숙소 설명은 보였지만 날짜·작성자 단위 본문을 확보하지 못해 직접 수에 제외. Google은 스크롤 후 10건 이후 추가 로딩 실패. Ikkyu는 p1-p5 138건 뒤 p6-p9가 0건 렌더링.
- data_quality_grade: `B`. 150-299건 직접 확인과 다중 플랫폼 조건은 충족하지만 300건 미만이다.

## 2. 공식 사실

공식/시설 주장은 전실 분리형 객실에 원천가케나가시 노천탕이 붙은 숙소라는 점이다. Rakuten 온천 페이지 표면에서는 객실 노천탕의 지붕과 전면 벽이 전동 개폐되어 비·시선·날씨에 맞춰 조절 가능하다는 시설 정보도 확인된다.

이번 조사에서 대욕장, 공용 노천탕, 예약제 대절탕, 가족탕은 핵심 시설축으로 확인되지 않았다. 이 숙소는 `public_bath`형 숙소가 아니라 `room_open_air_bath`와 `room_bath` 중심으로 해석해야 한다.

## 3. 리뷰 신호 요약 표

| bath_area | signal_type | direction | mention_count | platform_count | status | 해석 |
|---|---:|---:|---:|---:|---|---|
| room_open_air_bath | room_bath_hot_spring | positive | 90 | 5 | moderate_signal | 객실 노천탕, 해전망, 별하늘, 프라이빗 이용이 반복된다. |
| room_bath | room_bath_hot_spring | positive | 32 | 4 | moderate_signal | 내탕/ミラバス/蛇口から温泉 신호가 노천탕보다 작지만 반복된다. |
| facility_wide | water_texture | positive | 45 | 5 | moderate_signal | `トロトロ`, `すべすべ`, `化粧水` 계열 수질·피부감 표현이 반복된다. |
| public_bath | public_bath_hot_spring | neutral | 3 | 2 | weak_signal | 대욕장 만족 신호가 아니라 객실탕 중심 구조를 확인하는 보조 신호다. |
| room_open_air_bath | booking_confusion | mixed | 28 | 4 | moderate_signal | 전동 개폐, 레이저, 롤스로이스, 객실식 신호가 온천 신호와 섞인다. |

## 4. 근거 예시

| source | language | review_date | paraphrase | original_keyword |
|---|---|---:|---|---|
| Rakuten Travel | ja | 2026-05-25 | 객실 노천탕의 개폐·시선 조절과 온천 이용을 함께 언급했다. | `客室露天風呂`, `開閉`, `目隠し` |
| Rakuten Travel | ja | 2026-03-19 | 객실 노천탕, 바다 전망, 별하늘, 송영/연출 경험이 한 리뷰 안에서 함께 나타났다. | `露天風呂`, `海`, `星空`, `ロールスロイス` |
| Rakuten Travel | ja | 2025-08-22 | 온천 물감과 전망 만족이 같이 언급됐다. | `湯質`, `トロトロ`, `絶景` |
| Rakuten Travel | ja | 2025-10-23 | 온천과 객실 노천탕은 언급했지만 벌레/청소/송영 불만도 같이 나타났다. | `温泉`, `露天風呂`, `カメムシ`, `掃除` |
| Ikkyu | ja | 2026-06-19 | 미라블/미라바스와 전천후 객실 노천탕을 온천 경험으로 평가했다. | `ミラブル`, `ミラバス`, `全天候型露天風呂` |
| Ikkyu | ja | 2026-06-17 | 노천과 내탕 모두 온천으로 언급하고, 수질을 피부감 중심으로 표현했다. | `露天`, `内風呂`, `蛇口から温泉`, `とろみ` |
| Yahoo Travel | ja | 2026-06-28 | 객실 노천탕의 벽과 지붕이 움직이는 구조를 구체적으로 언급했다. | `露天風呂の壁と屋根が可動式` |
| Yahoo Travel | ja | 2026-04-15 | 객실 노천탕과 내탕 온천, 미라바스가 함께 언급됐다. | `客室露天風呂`, `内湯も温泉`, `ミラバス` |
| Google Maps native | ja | unknown | 객실 노천탕과 온천 만족을 짧게 남긴 Google-native 리뷰가 확인됐다. | `部屋の露天`, `温泉最高` |
| Google Maps native | ja | unknown | 노천탕 온천과 별하늘 조망이 함께 언급됐다. | `露天の温泉`, `星空` |

## 5. Bathtime 해석

직접 확인 표본 191건 중 온천 관련 본문은 135건이며, 신호는 대욕장보다 객실 노천탕과 객실 내탕에 집중된다. 특히 `客室露天風呂`, `内湯`, `ミラバス`, `トロトロ`, `すべすべ`가 반복되어, 이 숙소는 “대욕장 품질”이 아니라 “객실 안에서 완결되는 원천가케나가시·해전망 온천 경험”으로 분류하는 편이 데이터에 맞다.

다만 레이저 연출, 롤스로이스 송영, 고가 기대치, 전동 지붕/벽 조작 신호가 온천 만족과 자주 붙어 나온다. Bathtime에서는 온천 수질·객실탕 구조와 숙박 연출/가격 기대치를 분리해 보여줘야 과대해석을 줄일 수 있다.

## 6. Gaps

- 300건 미달 종료 사유: 접근 가능한 직접 본문을 넓게 확인했으나 총 191건에서 멈췄다.
- Ikkyu: visible 176건 중 p1-p5 138건만 직접 본문화. p6-p9는 Aside에서 0건 렌더링.
- Yahoo Travel: Ikkyu와 공유 리뷰풀 가능성이 높아 독립 source_count 확대에 주의.
- Google Maps: visible 60건이나 리뷰 탭에서 10건 이후 추가 본문 로딩 실패.
- Jalan: visible 77건이나 static p1-p4가 동일한 17건 고유 본문을 반복했다.
- Agoda/Booking/Expedia: visible count와 하이라이트/숙소 설명은 확인했지만 개별 리뷰 본문은 미확보.
- Naver: 정확 숙소명 한국어 직접 본문 없음. 검색 결과와 OTA 스니펫은 직접 리뷰 수에서 제외.

다음에 A급으로 올리려면 최소 109건 이상의 추가 직접 본문이 필요하다. 우선 Ikkyu/Yahoo 남은 38건 렌더링, Jalan 모바일/아카이브, Trip.com/Hotels.com/Expedia 개별 리뷰 본문 접근을 재확인해야 한다.
