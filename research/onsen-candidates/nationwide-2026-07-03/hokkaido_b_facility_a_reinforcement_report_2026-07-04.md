# 홋카이도 B 시설 A 보강 리포트

## 결론

이번 보강 대상은 기존 B 또는 B 후보로 남아 있던 홋카이도 온천시설 2곳이다.

| slug | 시설명 | 이전 등급 | 보강 후 등급 | 보강 후 직접 리뷰 | 보강 후 온천 관련 직접 리뷰 | 직접 본문 플랫폼 | service_data_status |
|---|---|---:|---:|---:|---:|---:|---|
| hakodate-yachigashira | 谷地頭温泉 | B | A | 532 | 505 | 4 | ready_for_service |
| jozankei-yunohana | 湯の花 定山渓殿 | B | A | 332 | 300 | 7 | ready_for_service |

두 시설 모두 A 기준인 직접 확인 300건 이상, 직접 본문 3개 이상 플랫폼 조건을 충족한다. 단, 플랫폼상 전체 리뷰 수는 리뷰풀로만 기록했고 직접 읽은 리뷰 수에 섞지 않았다.

## 보강 방식

### 谷地頭温泉

- 이전 상태: 직접 확인 495건, 온천 관련 472건, 직접 본문 플랫폼 2개, B.
- 병목: 표본량이 아니라 직접 본문 플랫폼 수 부족.
- 추가 확인:
  - Google Maps: Aside Browser로 Google native 리뷰 탭 본문 확인.
  - Sauna Ikitai: サ活 본문 34건을 직접 확인 가능한 표본으로 추가.
- 보강 후 계산:
  - 직접 확인 리뷰: 495 + 37 = 532
  - 온천 관련 직접 리뷰: 472 + 33 = 505
  - 직접 본문 플랫폼: Jalan, Yahoo Maps, Google Maps, Sauna Ikitai

Google Maps에는 리뷰 3,035건과 평점 4.3이 노출되지만, 이는 visible review pool이다. 직접 리뷰 수에는 Aside Browser에서 열린 Google native 리뷰 본문만 포함했다.

### 湯の花 定山渓殿

- 이전 상태: 직접 확인 192건, 온천 관련 181건, 직접 본문 플랫폼 7개, B.
- 병목: 플랫폼 수가 아니라 직접 본문 표본량 부족.
- 추가 확인:
  - Google Maps: Aside Browser로 리뷰 탭을 스크롤해 독립 작성자 기준 150건 직접 확인.
  - 키워드 검산상 온천/시설 이용 관련 본문 129건.
- 보강 후 계산:
  - 기존 Google 표본 10건을 새 Google 표본 150건으로 대체.
  - 직접 확인 리뷰: 192 - 10 + 150 = 332
  - 온천 관련 직접 리뷰: 181 - 10 + 129 = 300
  - 직접 본문 플랫폼: Nifty Onsen, Yahoo Maps, Sauna Ikitai, Tabelog, Naver Blog, NAVITIME KR, Google Maps

Google Maps에는 리뷰 1,428건과 평점 4.0이 노출되지만, 이는 visible review pool이다. 검색 스니펫, AI 요약, 입장권 카드, Google 공급자 카드는 직접 리뷰 수에서 제외했다.

## A 승급 판단

| 기준 | 谷地頭温泉 | 湯の花 定山渓殿 |
|---|---:|---:|
| 직접 확인 300건 이상 | 충족 | 충족 |
| 직접 본문 3개 플랫폼 이상 | 충족 | 충족 |
| 최신 리뷰 포함 | 충족 | 충족 |
| 낮은 평점/운영 신호 일부 포함 | 충족 | 충족 |
| 온천/사우나/휴게/운영 신호 분리 | 충족 | 충족 |

谷地頭温泉은 갈색 염화물천, 노천탕, 강한 로컬 공중탕 성격, 저렴한 가격, 목욕용품 지참 필요, 온도/열감 신호가 강하게 반복된다. 湯の花 定山渓殿은 노천탕, 사우나/수풍呂, 셔틀/버스 접근, 수건/대여, 식당/휴게, 시설 노후와 가격 인식이 함께 반복되어 관광형 대형 당일온천으로 해석하는 편이 데이터에 맞다.

## 남은 주의점

- Sauna Ikitai는 사우나와 수풍呂 중심 신호로 분리해야 하며, 온천수 만족 신호와 합치지 않는다.
- Yahoo Maps, Nifty Onsen, Google Maps 사이에는 작성자 중복 가능성이 있으므로 source_count 산정 시 보수적으로 유지한다.
- NAVITIME KR의 湯の花 일부 후기는 TripAdvisor mirror 가능성이 있어 독립 플랫폼 수에는 포함하되, source_count를 부풀리지 않는다.
- Google Maps 주제 칩과 리뷰 요약은 직접 리뷰가 아니다.

## 다음 에이전트 액션

1. `hokkaido_ready_facility_platform_mapping_2026-07-04.json`에는 이 보강 파일의 final 값을 반영했다.
2. `湯の花 定山渓殿`은 Google Maps 보강 표본이 커졌으므로 `ready_for_service`로 갱신했다.
3. `谷地頭温泉`은 플랫폼 수 부족 이슈가 해소됐으므로 `ready_for_service`로 갱신했다.
4. 두 시설 모두 서비스 문구 작성 전, 원문 장문 인용 없이 짧은 original_keyword만 남기는 형태로 근거 예시를 재정리한다.
