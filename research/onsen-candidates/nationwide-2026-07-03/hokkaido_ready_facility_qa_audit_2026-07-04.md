# Hokkaido Ready Facility QA Audit

작성일: 2026-07-04

## 결론

홋카이도 온천시설 자료는 후보 정규화 단계와 일부 ready 시설 딥리서치가 진행된 상태다. 다만 숙소 16개처럼 MVP 투입 가능 상태로 모두 완료된 것은 아니다.

현재 `hokkaido_facility_candidate_shortlist_2026-07-04.csv` 기준 홋카이도 시설 후보는 15개이며, 이 중 ready 시설은 4개다. ready 4개 중 A등급은 `豊平峡温泉` 1개뿐이고, `谷地頭温泉`은 표본량은 충분하지만 플랫폼 수가 부족해 B, `登別温泉 さぎり湯`은 C, `湯の花 定山渓殿`은 D다.

따라서 시설 쪽은 “홋카이도 시설 MVP 완료”가 아니라 “시설 후보 정규화 완료 + ready 4개 중 1개 서비스 투입 가능, 3개 보강 필요”로 보는 편이 안전하다.

## 후보 QA

| 항목 | 결과 |
|---|---:|
| 전체 facility 후보 | 15 |
| Tier 1 | 9 |
| Tier 2 | 6 |
| ready | 4 |
| operation_recheck | 9 |
| footbath_only | 2 |
| hold | 0 |

## 딥리서치 QA

| 항목 | 결과 |
|---|---:|
| 딥리서치 mapping 시설 수 | 4 |
| 직접 확인 리뷰 총합 | 1,090 |
| 온천시설 관련 직접 리뷰 총합 | 1,039 |
| A등급 | 1 |
| B등급 | 1 |
| C등급 | 1 |
| D등급 | 1 |
| 직접 확인 300건 미만 시설 | 2 |
| 직접 본문 플랫폼 3개 미만 시설 | 2 |

## 시설별 품질 매트릭스

| slug | name_ja | direct_reviews | onsen_related | direct_platforms | grade | QA status |
|---|---|---:|---:|---:|---|---|
| noboribetsu-sagiriyu | 登別温泉 さぎり湯 | 87 | 87 | 3 | C | needs_reinforcement |
| jozankei-hoheikyo | 豊平峡温泉 | 479 | 455 | 3 | A | ready_for_service |
| jozankei-yunohana | 湯の花 定山渓殿 | 29 | 25 | 2 | D | needs_reinforcement |
| hakodate-yachigashira | 谷地頭温泉 | 495 | 472 | 2 | B | needs_platform_reinforcement |

## 주요 QA 이슈

1. **ready 시설 4개만 딥리서치됨**
   - 후보 shortlist는 15개지만, platform mapping과 signal rows는 ready 4개만 대상으로 한다.
   - operation_recheck 9개와 footbath_only 2개는 아직 딥리서치 대상이 아니다.

2. **A등급은 1개뿐**
   - `豊平峡温泉`만 300건 이상, 3개 플랫폼 이상 조건을 충족한다.
   - `谷地頭温泉`은 495건을 읽었지만 직접 본문 플랫폼이 2개라 A가 아니다.
   - `さぎり湯`과 `湯の花 定山渓殿`은 표본량 자체가 부족하다.

3. **Google Maps / Naver 직접 본문 미확인**
   - 4개 ready 시설 모두 Google Maps가 `not_checked_with_browser` 또는 직접 본문 미확인 상태로 남아 있다.
   - Naver Blog/Cafe 직접 본문도 이번 ready 시설 mapping에는 거의 반영되지 않았다.
   - 시설형 데이터는 현장 이용 흐름, 혼잡, 수건/비누/샤워, 결제, 현금, 접수마감 같은 운영 신호가 중요하므로 Google/Naver 보강 가치가 크다.

4. **스키마 표준화 필요**
   - `bath_area`에 `indoor_public_bath`가 쓰였지만, facility tagging guide의 표준값은 `public_bath`다.
   - `signal_type`에 `aged_facility`, `price_value`, `cleanliness`, `sauna_quality`, `source_flow_feeling`, `crowding`, `cold_bath_quality`, `operation_confusion` 등이 쓰였지만, 표준 signal_type은 각각 `cleanliness_amenities`, `price_payment_value`, `bath_variety`, `source_flow_claim`, `crowding_or_wait`, `reservation_or_queue_confusion`, `operation_volatility` 등으로 정규화해야 한다.

5. **증거 예시가 너무 길다**
   - summary의 근거 예시는 리뷰 본문을 길게 담는 경향이 있다.
   - 최종 서비스/리포트용으로는 short paraphrase와 짧은 original_keyword만 남겨야 한다.

## 보강 우선순위

| priority | slug | reason | next_action |
|---:|---|---|---|
| 1 | hakodate-yachigashira | 495건 직접 확인으로 표본량은 충분하지만 플랫폼 2개라 B | Google Maps, Naver, Sauna Ikitai/4travel 중 1개 이상 직접 본문 보강 |
| 2 | noboribetsu-sagiriyu | 3개 플랫폼은 있으나 직접 확인 87건으로 C | Google Maps, Sauna Ikitai, Tripadvisor/4travel, Naver 보강으로 150-300건 목표 |
| 3 | jozankei-yunohana | 직접 확인 29건, 2개 플랫폼으로 D | Google Maps/Yahoo/Nifty/Jalan/Naver 전면 보강 필요 |
| 4 | operation_recheck 9개 | 호텔 부속 day-use라 운영 조건이 핵심 | 공식 운영 최신성 확인 후 facility deep 대상 여부 재판정 |

## 서비스 반영 판단

| slug | service_data_status | reason |
|---|---|---|
| jozankei-hoheikyo | ready_for_service | A등급, 479건 직접 확인, 3개 플랫폼, 시설 모델 명확 |
| hakodate-yachigashira | needs_platform_reinforcement | 직접 확인 495건이나 플랫폼 수 2개 |
| noboribetsu-sagiriyu | needs_reinforcement | 직접 확인 87건으로 C |
| jozankei-yunohana | needs_reinforcement | 직접 확인 29건으로 D |

## QA 판단

홋카이도 시설 후보 정규화는 잘 진행됐다. 특히 호텔 부속 day-use와 독립 온천시설, footbath-only를 분리한 점은 데이터 품질상 긍정적이다.

하지만 ready 시설 딥리서치는 아직 숙소 쪽 A급 완료 상태와 같은 수준이 아니다. MVP에 바로 넣을 수 있는 시설은 현재 `豊平峡温泉` 1개로 보고, `谷地頭温泉`, `さぎり湯`, `湯の花 定山渓殿`은 추가 보강 후 재판정하는 것이 안전하다.
