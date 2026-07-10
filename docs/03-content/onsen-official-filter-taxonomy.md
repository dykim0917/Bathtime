# 온천 공식 필터 분류

## 목적

니프티온천의 검색 구조를 참고해 온천 숙소와 당일입욕 시설을 같은 온천 언어로 탐색하게 합니다. 다만 니프티온천의 태그와 검색 결과는 **후보 발굴·분류 어휘·리뷰 표면**으로 사용하며, 바스타임의 사용자 필터 사실로 바로 적재하지 않습니다.

니프티온천은 전국의 온천·당일입욕·슈퍼센토·온천 숙소를 한 검색 표면에서 다루고, 온천수·이용 목적·설비·운영·접근성을 폭넓게 나눕니다. 시설 정보 오류 수정 경로도 별도로 제공하므로, 개별 필터 사실은 운영사·지자체·관광협회·공식 성분 분석서에서 다시 확인합니다.

- 참고: [니프티온천 검색 조건](https://onsen.nifty.com/search/), [니프티온천의 시설 탐색 안내](https://support.onsen.nifty.com/hc/ja/articles/360058856994-%E6%B8%A9%E6%B5%B4%E6%96%BD%E8%A8%AD%E3%81%AE%E6%8E%A2%E3%81%97%E6%96%B9%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6), [시설 정보 정정 안내](https://support.onsen.nifty.com/hc/ja/articles/1500000384402-%E6%8E%B2%E8%BC%89%E3%81%95%E3%82%8C%E3%81%A6%E3%81%84%E3%82%8B%E6%96%BD%E8%A8%AD%E6%83%85%E5%A0%B1%E3%81%AB%E9%96%93%E9%81%95%E3%81%84%E3%82%92%E7%99%BA%E8%A6%8B%E3%81%97%E3%81%9F)

## 저장 모델

숙소는 `onsen_accommodation_official_filter_facts`, 시설은 `onsen_facility_official_filter_facts`에 저장합니다. 두 테이블은 같은 분류표를 사용하지만, 각 대상 테이블에 직접 외래키를 걸어 모델을 섞지 않습니다.

각 행은 하나의 필터 사실만 가집니다.

- `filter_code`: 아래 허용된 필터 코드
- `scope_key`: 사실이 적용되는 욕조·공간·상품 범위. 범위를 못 가르면 `facility_wide`를 쓰지 않고 `hold`로 둡니다.
- `availability`: `confirmed`, `conditional`, `not_available`
- `filter_value`: 가격, 거리, 이용 조건처럼 코드만으로 부족한 구조화 값
- `official_original_text`, `official_source_url`, `source_kind`, `official_source_checked_at`: 공식 근거 4종 세트
- `filter_status`: `ready`, `hold`, `expired`, `deprecated`

사용자 필터에는 `availability = confirmed` 및 `filter_status = ready`만 사용합니다. 공식 페이지가 없거나 니프티온천 태그만 있는 경우는 행을 만들지 않거나 `hold`로 저장합니다.

## 사용자 필터

| 그룹 | 사용 코드 | 공식 확인 기준 |
| --- | --- | --- |
| 방문 방식 | `day_use`, `lodging`, `morning_bath`, `late_night`, `adult_day_use_price` | 공식 이용 안내·요금표·운영 시간 |
| 목욕 구성 | `open_air_bath`, `private_bath`, `family_bath`, `mixed_bathing`, `jet_bath`, `sleeping_bath` | 공식 욕장·상품 소개와 적용 범위 |
| 사우나·체험 | `sauna`, `loyly`, `water_bath`, `stone_sauna`, `private_sauna`, `sand_bath`, `steam_bath`, `enzyme_bath`, `health_retreat` | 공식 설비·체험 페이지 |
| 온천 성분 | `spring_bicarbonate`, `spring_chloride`, `spring_sulfur`, `spring_sulfate`, `spring_iron`, `spring_acidic`, `spring_carbon_dioxide`, `spring_radon`, `spring_radioactive`, `spring_simple`, `spring_alkaline_simple` | 공식 온천 분석서 또는 운영사·지자체가 인용한 성분표 |
| 이용 편의 | `station_walk_10m`, `parking`, `shuttle`, `tattoo_allowed`, `barrier_free`, `wheelchair_accessible`, `english_support`, `meal_service`, `rest_area`, `wifi` | 공식 접근·FAQ·이용 규칙 |
| 경관 | `ocean_view`, `snow_view`, `autumn_foliage_view` | 공식 욕조 소개나 공식 사진에서 욕조 범위가 분명한 경우 |

## 제외 또는 보류

- `source_flow` 계열은 이 테이블에 넣지 않습니다. 욕조 범위와 가수·가온·소독을 함께 확인해야 하므로 `onsen_*_water_facts`만 사용합니다.
- `천연온천`, `100% 천연온천`, `자연 그대로`는 변별력이 낮아 핵심 필터로 만들지 않습니다.
- `미인탕`, `커플`, `여성 여행`, `가성비`, `인기`, `평점`, `추천`, `절경` 같은 마케팅·후기·플랫폼 분류는 공식 하드 필터가 아닙니다.
- 질병·치료·효능 필터는 의료적 오해 여지가 있어 사용자 탐색 필터에서 제외합니다. 성분 자체는 공식 분석서로만 저장합니다.
- `가격`은 '저렴함' 태그가 아니라 `adult_day_use_price`의 공식 금액과 확인일로만 저장합니다. UI에서는 확인일이 지난 값에 의존하지 않습니다.

## 신선도

| 사실 | 기본 재확인 주기 |
| --- | --- |
| 운영 시간·휴무·요금·송영·입장 규정·문신 규정 | 30일 |
| 사우나·식사·휴게·주차 등 설비 | 90일 |
| 욕조 구성·가족탕·모래탕·경관 범위 | 180일 |
| 성분 분류·온천수 방식 | 공식 문서 변경 시 재확인. 온천수 방식은 별도 용어 가이드를 우선 |

## 수집 순서

1. 니프티온천에서 후보와 분류 어휘를 찾습니다.
2. 운영사·지자체·관광협회·공식 분석서에서 같은 항목의 원문과 URL을 확보합니다.
3. 적용 욕조·상품 범위를 정합니다.
4. 공식 원문, 확인일, 값, `ready` 상태를 함께 적재합니다.
5. 니프티온천의 리뷰 수와 직접 읽은 리뷰 수는 기존 후기 증거 테이블에서만 관리합니다.

## 공개 전 점검

1. 니프티온천 태그만으로 `ready` 사실을 만들지 않았습니다.
2. 숙소와 시설 사실이 서로 다른 대상 테이블에 적재됐습니다.
3. `private_bath`가 객실 부속인지 공용 예약탕인지 `scope_key`와 `filter_value`에 구분돼 있습니다.
4. 수질 성분과 온천수 방식이 혼동되지 않았습니다.
5. 운영성 정보의 확인일이 신선도 기준을 넘지 않았습니다.
