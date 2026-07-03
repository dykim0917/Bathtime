# 온천시설형 리뷰 신호 모델 초안

작성일: 2026-07-03

## 목적

숙박형 료칸/호텔 모델과 별도로, 당일치기 온천시설·공중온천·가족탕 전문시설을 비교하기 위한 리뷰 신호 모델이다. 숙소 모델이 `객실탕`, `객실 노천탕`, `대욕장` 중심이라면, 시설형 모델은 `입장 방식`, `대기`, `결제`, `샤워/어메니티`, `체험 상품`, `가족탕 회전`, `관광객 기대치와 실제 이용 방식의 차이`가 핵심 변수가 된다.

## 기본 엔티티

| field | 설명 |
|---|---|
| facility_name | 시설명 |
| japanese_name | 일본어 공식명 |
| korean_name | 한국어 통용명 |
| aliases | 영어명, 구명, OTA/지도 표기 |
| facility_type | 시설 유형 |
| location | 도도부현, 시정촌, 온천지명 |
| official_url | 공식 사이트 또는 지자체 공식 페이지 |
| source_urls | Google Maps, Jalan, Tripadvisor, 4travel, Naver 등 |
| researched_at | 수집일 |

## facility_type

| value | 사용 기준 |
|---|---|
| `large_day_use_complex` | 대욕장, 노천탕, 가족탕, 모래탕, 찜질/식음/휴게 기능이 결합된 대형 당일치기 온천 |
| `historic_public_bath` | 역사 건축물, 시영/공중탕, 로컬 목욕문화가 핵심인 온천 |
| `sand_bath_facility` | 모래찜질/모래탕이 핵심 상품인 시설 |
| `steam_bath_facility` | 증기탕/무시유가 핵심 상품인 시설 |
| `family_private_bath_facility` | 시간제 가족탕/대절탕이 핵심 상품인 시설 |
| `public_bath_facility` | 남녀별 일반 공중탕 중심 시설 |
| `footbath` | 족탕 중심 시설 |
| `wellness_spa` | 온천보다 스파, 사우나, 휴게, 식음 복합 경험이 중심인 시설 |
| `unclear` | 유형 판단 보류 |

## facility_area

숙소형 `bath_area`보다 더 넓은 시설 구역 개념을 쓴다.

| value | 설명 |
|---|---|
| `public_bath` | 남녀별 일반탕, 대욕장, 내탕 |
| `open_air_public_bath` | 남녀별 노천탕 |
| `family_bath` | 시간제로 빌리는 가족탕 |
| `private_bath` | 가족탕인지 불명확한 대절탕/프라이빗탕 |
| `sand_bath` | 모래탕, 모래찜질 |
| `steam_bath` | 무시유, 증기탕 |
| `footbath` | 족탕 |
| `drinking_spring` | 음천 |
| `inhalation` | 온천 흡입 |
| `rest_area` | 휴게실, 카페, 대기 공간 |
| `food_steam` | 지옥찜, 온천달걀 등 식음 체험 |
| `facility_wide` | 시설 전체에 걸친 신호 |
| `unclear` | 구역 불명 |

## signal_type

| value | 설명 |
|---|---|
| `source_flow_claim` | 공식 또는 리뷰에서 원천가케나가시, 원천 100%, 순환/소독 관련 언급 |
| `water_texture` | 물의 촉감, 온천감, 유황/염분/미끌거림/따가움 등 |
| `distinctive_spring_character` | 탁도, 냄새, 색, 산성도, 열감 등 개성 |
| `bath_variety` | 탕 종류, 동선, 체험 다양성 |
| `sand_or_steam_experience` | 모래탕/증기탕 체험 만족도와 주의점 |
| `family_private_bath_experience` | 가족탕/대절탕의 프라이버시, 청결, 가격, 대기 |
| `crowding_or_wait` | 혼잡, 줄, 대기시간, 만실, 접수 마감 |
| `reservation_or_queue_confusion` | 예약 불가/전화예약/현장접수/차례표/마감 혼동 |
| `cleanliness_amenities` | 청결, 샤워기, 비누, 샴푸, 수건, 드라이어, 탈의실 |
| `price_payment_value` | 입장료, 추가요금, 현금 결제, 가성비 |
| `accessibility` | 주차, 역 접근, 버스, 계단, 짐, 유아/노약자 동선 |
| `tourist_expectation_gap` | 한국식 스파 기대와 일본식 공중탕 현실의 차이 |
| `local_user_culture` | 로컬 이용자 문화, 목욕 매너, 관광객과 지역 이용자 간 긴장 |

## confidence/status 규칙

숙소형 모델의 카운팅 원칙을 유지하되, 시설형은 `platform visible count`와 `directly read/tagged count`를 더 강하게 분리한다.

| grade | 기준 |
|---|---|
| A | 직접 판독 300건 이상, 3개 이상 플랫폼, 최신/저평점/키워드/한국어 표본 포함 |
| B | 직접 판독 100-299건, 2개 이상 플랫폼 |
| C | 직접 판독 50-99건 |
| D | 직접 판독 50건 미만 또는 스니펫 중심 |

| status | 기준 |
|---|---|
| `strong_signal` | 3개 이상 플랫폼 또는 30명 이상 독립 작성자에서 반복 |
| `moderate_signal` | 2개 이상 플랫폼 또는 10-29명 작성자에서 반복 |
| `weak_signal` | 2-9명 작성자 또는 한 플랫폼 중심 |
| `conflicting` | 긍정/부정이 모두 의미 있게 반복 |
| `insufficient` | 판단 보류 |

## 숙소형 모델과 다른 점

- 객실탕 여부보다 `상품 단위`가 중요하다. 같은 시설 안에서도 일반입욕, 모래탕, 가족탕, 식음 체험의 요금과 대기가 분리된다.
- `샤워기 없음`, `비누 별도`, `수건 유료`, `현금 결제` 같은 운영 정보가 만족도에 직접 영향을 준다.
- 낮은 평점이 온천 품질 문제가 아니라 기대치 불일치에서 나오는 경우가 많다.
- 가족탕 전문시설은 숙소의 객실탕과 혼동하면 안 된다. 한국어 사용자는 둘 다 “프라이빗 온천”으로 부를 수 있으므로 구역 판정이 필요하다.
- 역사형 공중탕은 편의성이 낮아도 데이터 가치가 높다. Bathtime에는 “쾌적한 추천”이 아니라 “어떤 경험인지 정확히 예고하는 정보”가 필요하다.
