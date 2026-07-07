# 홋카이도 온천시설 후보 검증 리포트 (2026-07-04)

## 지역 특성

- 범위: `prefecture=北海道`인 facility 후보 15개. 숙소 accommodation 후보와 딥리서치 완료 숙소는 이번 작업에서 제외했다.
- 이번 단계는 후보 검증/정규화이며, 직접 리뷰 본문 샘플링이나 신호 태깅 단계가 아니다. 따라서 `direct_reviews_checked`와 `onsen_related_direct_reviews_checked`는 모두 0으로 유지했다.
- 홋카이도 시설 후보는 登別, 定山渓, 湯の川/函館에 집중되어 있다. 대형 호텔 day-use, 독립 공중탕, 日帰り専用 대형 시설, 관광 footbath가 섞여 있어 숙소/시설 모델 혼동 방지가 중요하다.
- 호텔 부속 day-use는 운영 시간, 접수마감, 요금, 예약/식사세트, 휴업·만차·청소 조건이 변동되므로 `operation_recheck`로 별도 관리했다.

## 후보 수

| 항목 | 수 |
|---|---:|
| 전체 facility 후보 | 15 |
| Tier 1 | 9 |
| Tier 2 | 6 |
| Tier 3 | 0 |
| ready | 4 |
| operation_recheck | 9 |
| footbath_only | 2 |
| hold | 0 |

## Tier 기준

- Tier 1: 독립 공중탕/日帰り専用 시설이거나, 여행자 수요가 높고 수질·노천·사우나·관광 휴식 가치가 뚜렷하며 리뷰풀 표면이 확인된 후보.
- Tier 2: 지역 가치가 있으나 호텔 부속 day-use, 리뷰풀 미확인, 운영 변동성, 접근성/한국어 수요 불명확성이 있어 후속 검증 후 딥리서치 여부를 정할 후보.
- footbath_only: 전신 입욕시설이 아니라 stopover/관광 휴식 모델로 따로 보관. full bathing facility와 직접 비교하지 않는다.
- operation_recheck: 공식/관광협회 표면은 확인됐지만 요금·운영시간·예약·청소·휴업·혼잡시 입장 제한 등 변동 정보가 핵심인 후보.

## Tier 1 후보 목록

| slug | name_ja | area | facility_type | model | status | verification_status | 핵심 메모 |
|---|---|---|---|---|---|---|---|
| noboribetsu-sagiriyu | 登別温泉 さぎり湯 | noboribetsu | public_bath_facility | bathe | ready | official_and_review_surface_checked | keep_facility. 독립 공중탕 성격이 명확하고 강한泉質/저가격/로컬탕 가치가 있어 시설 딥리서치 ready. 공식 사실과 후기 신호 분리 필요. |
| noboribetsu-daiichi-dayuse | 第一滝本館 日帰り入浴 | noboribetsu | large_day_use_complex | bathe | operation_recheck | official_checked_operation_recheck | mixed_use_hotel_day_spa. 1500坪 대욕장/5泉質/35浴槽은 강한 후보이나 호텔 부속 day-use라 요금, 시간, local discount, evening discount 종료 등 운영 최신 확인 필요. |
| noboribetsu-grand-dayuse | 登別グランドホテル 日帰り温泉 | noboribetsu | large_day_use_complex | bathe | operation_recheck | official_checked_operation_recheck | mixed_use_hotel_day_spa. 鬼サウナ와 대욕장 value가 강하지만 공식 NEWS 확인이 필요한 operation_recheck 후보. |
| jozankei-hoheikyo | 豊平峡温泉 | jozankei | open_air_public_bath | bathe | ready | official_and_review_surface_checked | keep_facility. 독립 日帰り専用에 가까운 강후보. 露天風呂, 源泉, 인도카레, 결제/타월/송영/혼잡을 시설 딥리서치 축으로 분리. |
| jozankei-yunohana | 湯の花 定山渓殿 | jozankei | large_day_use_complex | bathe | ready | official_and_review_surface_checked | keep_facility. 日帰り専用 대형 온욕시설. 2026-07 가격개정 공지가 있어 요금은 fresh confirmation 필요. |
| jozankei-morino-uta-dayuse | 定山渓鶴雅リゾートスパ森の謌 日帰り | jozankei | wellness_spa | experience | operation_recheck | official_checked_operation_recheck | mixed_use_hotel_day_spa / experience. 단독 입욕이 아니라 식사·에스테 세트 조건이 핵심이라 가격·정기휴무·예약 가능성 확인 후 deep review. |
| yunokawa-yumeguri-butai | 湯の川温泉足湯「湯巡り舞台」 | yunokawa-hakodate | footbath | stopover | footbath_only | official_tourism_and_review_surface_checked | footbath_only. 무료 足湯 stopover로 유지하되 full bathing facility와 비교하지 않음. 타월 지참, 전차 접근, 관광 휴식 신호 중심. |
| yunokawa-tropical-footbath | 函館市熱帯植物園足湯 | yunokawa-hakodate | footbath | stopover | footbath_only | official_tourism_and_review_surface_checked | footbath_only / experience. 식물원 입장료·원숭이 온천 관람과 묶인 footbath 체험. 전신 입욕 데이터셋과 분리. |
| hakodate-yachigashira | 谷地頭温泉 | yunokawa-hakodate | public_bath_facility | bathe | ready | tourism_and_review_surface_checked | keep_facility. 赤褐色/塩化物泉/星形露天/로컬 공중탕 가치가 강함. 요금은 최신 관광 페이지 490엔과 과거 430/460엔 표면이 혼재해 fresh confirmation 필요. |

## Tier 2 후보 목록

| slug | name_ja | area | facility_type | model | status | verification_status | 핵심 메모 |
|---|---|---|---|---|---|---|---|
| noboribetsu-sekisuitei-dayuse | 登別石水亭 日帰り入浴 | noboribetsu | large_day_use_complex | bathe | operation_recheck | official_checked_operation_recheck | mixed_use_hotel_day_spa. 공식 day-use 시간/요금 표면 확인. 목욕 청소/성수기/만실시 변경 가능성이 명시되어 딥리서치 전 운영 최신 확인 필요. |
| noboribetsu-manseikaku-dayuse | 登別万世閣 日帰り入浴 | noboribetsu | large_day_use_complex | bathe | operation_recheck | official_checked_operation_recheck | mixed_use_hotel_day_spa. 源泉水風呂/ロウリュサウナ가 시설형 신호로 가치 있으나 입장 제한/만차시 거절/문신 정책 등 운영 조건 확인 필요. |
| noboribetsu-suzuki-karurusu | カルルス温泉 鈴木旅館 | noboribetsu | hotel_dayuse_bath | bathe | operation_recheck | official_and_jalan_checked_review_pool_pending | mixed_use_hotel_day_spa. 숙박 료칸이지만 日帰り温泉 가능성이 확인되어 hold에서 operation_recheck로 조정. lodging-only 혼동을 막고 day-use product로만 후속 검토. |
| jozankei-shogetsu-dayuse | 章月グランドホテル 日帰り | jozankei | hotel_dayuse_bath | bathe | operation_recheck | tourism_and_official_checked_operation_recheck | mixed_use_hotel_day_spa. 전일 오전까지 예약제/식사세트/토·축전일 제외가 핵심. 단독 온천시설처럼 비교하면 안 됨. |
| jozankei-hanakaede-dayuse | 鹿の湯・花もみじ 日帰り候補 | jozankei | hotel_dayuse_bath | bathe | operation_recheck | official_news_checked_operation_recheck | mixed_use_hotel_day_spa. 鹿の湯/花もみじ 계열 day-use는 일정 공지형이라 상시 시설로 처리하지 말고 operation_recheck 유지. |
| hakodate-hiromesou | ホテル函館ひろめ荘 | yunokawa-hakodate | hotel_dayuse_bath | bathe | operation_recheck | official_and_tourism_checked_review_pool_pending | mixed_use_hotel_day_spa. 2종 원천/日帰り入浴 가능. 숙박시설 부속이므로 day-use product로만 분리하고 운영시간·요금 최신 확인 필요. |

## Tier 3 후보 목록

| slug | name_ja | area | facility_type | model | status | verification_status | 핵심 메모 |
|---|---|---|---|---|---|---|---|

## 상태별 해석

### ready

| slug | reason |
|---|---|
| noboribetsu-sagiriyu | 공식/관광 또는 리뷰 표면이 확인됐고, 독립 시설 또는 공중탕 모델로 딥리서치 착수 가능. 직접 리뷰 수는 아직 0이므로 딥리서치 단계에서 300건 목표로 별도 수집. |
| jozankei-hoheikyo | 공식/관광 또는 리뷰 표면이 확인됐고, 독립 시설 또는 공중탕 모델로 딥리서치 착수 가능. 직접 리뷰 수는 아직 0이므로 딥리서치 단계에서 300건 목표로 별도 수집. |
| jozankei-yunohana | 공식/관광 또는 리뷰 표면이 확인됐고, 독립 시설 또는 공중탕 모델로 딥리서치 착수 가능. 직접 리뷰 수는 아직 0이므로 딥리서치 단계에서 300건 목표로 별도 수집. |
| hakodate-yachigashira | 공식/관광 또는 리뷰 표면이 확인됐고, 독립 시설 또는 공중탕 모델로 딥리서치 착수 가능. 직접 리뷰 수는 아직 0이므로 딥리서치 단계에서 300건 목표로 별도 수집. |

### operation_recheck

| slug | reason | next_action |
|---|---|---|
| noboribetsu-daiichi-dayuse | 호텔 부속 day-use 또는 운영 변동성이 큰 시설. 공식 표면은 확인됐지만 요금/시간/예약/휴업/입장 제한 fresh check 필요. | 공식 NEWS/관광협회 최신 정보 확인 후 딥리서치 여부 결정 |
| noboribetsu-grand-dayuse | 호텔 부속 day-use 또는 운영 변동성이 큰 시설. 공식 표면은 확인됐지만 요금/시간/예약/휴업/입장 제한 fresh check 필요. | 공식 NEWS/관광협회 최신 정보 확인 후 딥리서치 여부 결정 |
| noboribetsu-sekisuitei-dayuse | 호텔 부속 day-use 또는 운영 변동성이 큰 시설. 공식 표면은 확인됐지만 요금/시간/예약/휴업/입장 제한 fresh check 필요. | 공식 NEWS/관광협회 최신 정보 확인 후 딥리서치 여부 결정 |
| noboribetsu-manseikaku-dayuse | 호텔 부속 day-use 또는 운영 변동성이 큰 시설. 공식 표면은 확인됐지만 요금/시간/예약/휴업/입장 제한 fresh check 필요. | 공식 NEWS/관광협회 최신 정보 확인 후 딥리서치 여부 결정 |
| noboribetsu-suzuki-karurusu | 호텔 부속 day-use 또는 운영 변동성이 큰 시설. 공식 표면은 확인됐지만 요금/시간/예약/휴업/입장 제한 fresh check 필요. | 공식 NEWS/관광협회 최신 정보 확인 후 딥리서치 여부 결정 |
| jozankei-morino-uta-dayuse | 호텔 부속 day-use 또는 운영 변동성이 큰 시설. 공식 표면은 확인됐지만 요금/시간/예약/휴업/입장 제한 fresh check 필요. | 공식 NEWS/관광협회 최신 정보 확인 후 딥리서치 여부 결정 |
| jozankei-shogetsu-dayuse | 호텔 부속 day-use 또는 운영 변동성이 큰 시설. 공식 표면은 확인됐지만 요금/시간/예약/휴업/입장 제한 fresh check 필요. | 공식 NEWS/관광협회 최신 정보 확인 후 딥리서치 여부 결정 |
| jozankei-hanakaede-dayuse | 호텔 부속 day-use 또는 운영 변동성이 큰 시설. 공식 표면은 확인됐지만 요금/시간/예약/휴업/입장 제한 fresh check 필요. | 공식 NEWS/관광협회 최신 정보 확인 후 딥리서치 여부 결정 |
| hakodate-hiromesou | 호텔 부속 day-use 또는 운영 변동성이 큰 시설. 공식 표면은 확인됐지만 요금/시간/예약/휴업/입장 제한 fresh check 필요. | 공식 NEWS/관광협회 최신 정보 확인 후 딥리서치 여부 결정 |

### footbath_only

| slug | reason | next_action |
|---|---|---|
| yunokawa-yumeguri-butai | 전신 입욕시설이 아닌 足湯 stopover. 관광 휴식/동선 데이터로는 가치가 있으나 full onsen facility와 비교 금지. | stopover 모델로 별도 QA 또는 경량 리뷰 수집 |
| yunokawa-tropical-footbath | 전신 입욕시설이 아닌 足湯 stopover. 관광 휴식/동선 데이터로는 가치가 있으나 full onsen facility와 비교 금지. | stopover 모델로 별도 QA 또는 경량 리뷰 수집 |

## 제외/보류 기준

- 이번 검증에서 `hold`로 남긴 후보는 없다. 기존 `noboribetsu-suzuki-karurusu`는 공식 사이트와 Jalan day-use 표면이 확인되어 `operation_recheck`로 복구했다.
- 폐업/휴업, 숙소 전용, 입욕 불가, route/pass/area cluster, footbath-only 혼동이 확인되면 딥리서치 전에 `hold`, `route_or_pass`, `footbath_only`, `split_needed` 중 하나로 내려야 한다.
- 호텔 day-use 후보는 공식 day-use 표면이 있어도 숙박 리뷰와 직접 섞지 않는다. 딥리서치에서는 day-use 이용자 본문 또는 facility-wide 이용 신호만 별도로 세야 한다.

## 주요 확인 소스

- 第一滝本館 日帰り入浴: https://takimotokan.co.jp/ja/day_spa/
- 登別グランドホテル 温泉/日帰り: https://www.nobogura.co.jp/hotspring/
- 登別石水亭 温泉: https://www.sekisuitei.com/onsen/
- 登別万世閣 日帰り入浴: https://www.noboribetsu-manseikaku.jp/spa/daytrip/
- 鈴木旅館 公式: https://www.suzukiryokan.jp/
- 豊平峡温泉 公式: https://hoheikyo.co.jp/
- 湯の花 定山渓殿 公式: https://www.yunohana.org/jyouzankei/
- 森の謌 日帰りプラン: https://www.morino-uta.com/dayplans/
- 章月グランドホテル 日帰り湯: https://jozankei.jp/oneday/shougetsu-g/
- 鹿の湯 日帰り入浴営業案内: https://shikanoyu.co.jp/shikanoyu/news/621
- 谷地頭温泉 観光情報: https://hakodate-kankou.com/spot/10239/
- ホテル函館ひろめ荘 温泉: https://www.hotel-hiromeso.grats.jp/facilities.html

## 다음 조사 제안

1. 딥리서치 우선순위는 `noboribetsu-sagiriyu`, `jozankei-hoheikyo`, `jozankei-yunohana`, `hakodate-yachigashira` 순으로 둔다. 이 4개는 시설 단위가 비교적 명확하고 숙소 리뷰와 섞일 위험이 낮다.
2. 호텔 부속 day-use 9개는 최신 공식 NEWS/운영시간/요금/예약 조건을 먼저 재확인한 뒤, 숙박 리뷰와 day-use 리뷰를 분리해 샘플링한다.
3. `yunokawa-yumeguri-butai`, `yunokawa-tropical-footbath`는 stopover/footbath 모델로 별도 경량 데이터셋에 두고, 전신 입욕 시설 랭킹·비교에는 넣지 않는다.
4. 다음 딥리서치 단계에서는 Google Maps, Nifty Onsen, Sauna Ikitai, Yahoo Maps, Jalan/4travel, Naver Blog/Cafe를 플랫폼별로 분리하고 visible review count와 직접 읽은 리뷰 수를 따로 기록한다.
