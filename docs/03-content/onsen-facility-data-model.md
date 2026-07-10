# 온천시설 데이터 모델

숙소와 분리한 당일입욕 온천, 공중탕, 가족탕 전문시설, 모래탕, 스파 복합시설용 데이터 모델입니다. 시설을 `onsen_accommodations`에 넣지 않습니다.

## 테이블 역할

| 테이블 | 책임 |
| --- | --- |
| `onsen_facilities` | 시설 정체성, 위치, 시설 유형, 이용 모델, 공식 운영 프로필, 공개 상태 |
| `onsen_facility_official_filter_facts` | 공식 원문으로 확인한 시설 필터 사실과 적용 범위 |
| `onsen_facility_water_facts` | 공식 원문으로 확인한 욕조·상품 범위별 온천수 방식과 조건 |
| `onsen_facility_review_evidence` | 수집 회차별 플랫폼 노출 풀과 직접 판독 분모·제외·중복 제거 이력 |
| `onsen_facility_review_signals` | 직접 판독 본문을 집계한 이용 경험 신호 |

`onsen_verdicts.target_type = 'facility'`는 시설 판정문에 사용할 수 있습니다. 판정문은 위 네 테이블의 사실과 집계를 읽어 만들며, 이 테이블들을 대체하지 않습니다.

시설 판정의 공개 등급, 근거 임계값, 범위 분리 게이트는 [온천시설 판정 데이터 파이프라인](./onsen-facility-verdict-pipeline.md)을 따릅니다.

## 분리 원칙

- 공식 방식 사실은 `onsen_facility_water_facts`에만 저장합니다. 이용 경험에서 나온 원천감 표현으로 `water_system`을 확정하지 않습니다.
- 사우나, 가족탕, 노천탕, 입욕 가능 시간, 접근성 같은 공식 필터 사실은 `onsen_facility_official_filter_facts`에 한 항목씩 저장합니다. 니프티온천의 태그는 후보 발굴과 분류 어휘로만 사용하고, 단독으로 `ready` 필터 사실을 만들지 않습니다.
- 플랫폼에 보이는 후기 수는 `visible_review_pools`에만 둡니다. 직접 본문을 읽은 수와 더하거나 대체하지 않습니다.
- 직접 판독 수는 원시값, 중복 제거값, 시설 관련값, 당일입욕 전용값, 숙박 공용탕 보조값을 나눕니다. 마지막 두 값이 `null`이면 미집계이고, `0`이면 해당 표본이 확인되지 않았다는 뜻입니다.
- 숙박 후기에서 공용 욕장을 구체적으로 말한 경우는 `lodging_bath_only_direct_reviews`에만 넣습니다. 당일입욕 전용 표본과 합산해 시설 방문 경험으로 표현하지 않습니다.
- 검색 스니펫, Google/Naver 토픽 칩, AI 요약, OTA 요약은 어느 직접 판독 카운트에도 넣지 않습니다.
- 후기 원문 전체는 DB에 저장하지 않습니다. 짧은 키워드·요약·출처 URL만 집계 근거로 둡니다.

## 온천수 방식

`water_system`은 `kakenagashi_pure`, `kakenagashi`, `junkan` 또는 `null`만 사용합니다.

- `kakenagashi_pure`: 공식 원문과 욕조 범위가 보존되고, 물을 섞지 않으며 데우지 않는 조건이 확인된 경우에만 사용합니다.
- `kakenagashi`: 공식 원문에 `源泉かけ流し` 또는 `かけ流し`가 확인된 경우에만 사용합니다.
- `junkan`: 공식 원문에 `循環ろ過` 또는 `循環式`이 확인된 경우에만 사용합니다.
- `null`: 방식 근거가 없거나, 시설 안의 욕조별 운용이 갈려 시설 단위 배지를 줄 수 없는 경우입니다.

가수·가온·소독은 순위가 아니라 각각 `present`, `not_present`, `unknown`으로 저장합니다. `순수직수`는 `kasui = not_present`와 `kaon = not_present`가 확인되지 않으면 저장할 수 없습니다.

방식 배지, 감촉 필터, 색 필터는 각각 별도 상태를 가집니다. 색은 공식 텍스트 또는 공식 사진 근거가 있을 때만 필터로 노출합니다. 감촉은 공식 수질 후보만으로 노출하지 않고 직접 후기 카운트를 함께 확인합니다.

## 시설 영역과 신호

시설 영역은 탕·상품의 물리적 단위입니다. `public_bath`, `open_air_public_bath`, `family_bath`, `private_bath`, `sand_bath`, `steam_bath`, `footbath`, `drinking_spring`, `inhalation`, `sauna`, `stone_sauna`, `rest_area`, `food_area`, `food_steam`, `overnight_rest`, `route_or_pass`, `area_cluster`, `facility_wide`, `unclear`만 사용합니다.

혼욕 여부, 여성 전용 시간, 문신·연령 제한, 당일입욕 가능 여부는 시설 영역이 아니라 `eligibility_or_use_scope` 신호 또는 공식 운영 프로필에 저장합니다. 접근성·운영 변동도 `facility_wide` 영역의 신호입니다.

리뷰 신호에는 `source_flow_claim`을 사용하지 않습니다. 공식 방식은 물 사실에, 후기의 염소 냄새·온천감 약함·감촉·색·온도 체감은 각각의 이용 경험 신호에 저장합니다.

## 공개 게이트

모든 신규 시설은 `draft`로 시작합니다. `active` 전환 전에는 아래를 모두 확인합니다.

1. 시설 유형과 이용 모델이 숙소 모델과 분리돼 있습니다.
2. 공식 운영 프로필과 출처가 기록돼 있습니다.
3. 직접 판독 분모와 플랫폼 노출 풀이 분리돼 있습니다.
4. 욕조별 방식이 갈리는 경우 시설 전체 방식 배지를 막았습니다.
5. 사용자 노출 신호의 `mention_count`가 직접 판독 분모를 넘지 않습니다.
