# 홋카이도 온천시설 후보 검증 리포트 v2 (2026-07-04)

## 결론
- 범위: 기존 홋카이도 facility 후보 15개. 신규 후보 확장은 하지 않았다.
- 이번 v2는 관광지 우선 원칙과 `service_priority` 분리를 반영한 후보검증이다.
- 직접 리뷰 딥리서치 단계가 아니므로 `direct_reviews_checked`와 `onsen_related_direct_reviews_checked`는 전부 0으로 유지했다.
- 기존 ready 4개는 모두 `ready_high_priority`로 재분류했다. 특히 `湯の花 定山渓殿`은 표본 부족과 별개로 한국어/관광 수요가 있어 보강 우선순위가 높다.

## 정량 요약
| 항목 | 결과 |
|---|---:|
| 전체 후보 | 15 |
| ready_high_priority | 4 |
| ready | 0 |
| operation_recheck | 9 |
| footbath_only | 2 |
| hold | 0 |
| service_priority=high | 8 |
| service_priority=medium | 7 |
| service_priority=low | 0 |
| service_priority=hold | 0 |
| Tier 1 | 9 |
| Tier 2 | 6 |
| Tier 3 | 0 |

## 한국어 수요 표면
| signal | count |
|---|---:|
| moderate | 8 |
| strong | 3 |
| weak | 4 |

## 후보별 매트릭스
| slug | name_ja | tier | status | priority | korean_demand | facility_type | next_action |
|---|---|---|---|---|---|---|---|
| noboribetsu-sagiriyu | 登別温泉 さぎり湯 | Tier 1 | ready_high_priority | high | moderate | public_bath_facility | 시설 딥리서치 우선. Google Maps/Naver/한국어 블로그 보강으로 로컬 공중탕 기준 A 가능성 확인 |
| noboribetsu-daiichi-dayuse | 第一滝本館 日帰り入浴 | Tier 1 | operation_recheck | high | strong | mixed_use_hotel_day_spa | 공식 day-use 시간/요금/할인/입장 제한 fresh check 후 mixed_use_hotel_day_spa로 딥리서치 |
| noboribetsu-grand-dayuse | 登別グランドホテル 日帰り温泉 | Tier 1 | operation_recheck | high | moderate | mixed_use_hotel_day_spa | 공식 NEWS와 day-use 외부 이용 조건 확인 후 사우나/대욕장 축 분리 |
| noboribetsu-sekisuitei-dayuse | 登別石水亭 日帰り入浴 | Tier 2 | operation_recheck | medium | weak | mixed_use_hotel_day_spa | 성수기/청소/만실시 이용 제한 확인. 관광 day-use 수요 약하면 후순위 |
| noboribetsu-manseikaku-dayuse | 登別万世閣 日帰り入浴 | Tier 2 | operation_recheck | high | moderate | mixed_use_hotel_day_spa | 만차/입장 제한/문신 정책 확인 후 源泉水風呂·ロウリュ 사우나 축 딥리서치 |
| noboribetsu-suzuki-karurusu | カルルス温泉 鈴木旅館 | Tier 2 | operation_recheck | medium | weak | mixed_use_hotel_day_spa | 외부 day-use 운영 조건과 리뷰풀 확인. 숙박 중심이면 facility 우선순위 낮춤 |
| jozankei-hoheikyo | 豊平峡温泉 | Tier 1 | ready_high_priority | high | strong | open_air_public_bath | 이미 A급 표본 확보. Google/Naver 보강 시 한국어 접근·혼잡·송영 신호 강화 |
| jozankei-yunohana | 湯の花 定山渓殿 | Tier 1 | ready_high_priority | high | strong | large_day_use_complex | needs_reinforcement_high_priority. Naver Blog/Google/Yahoo/Sauna Ikitai 본문 보강 |
| jozankei-morino-uta-dayuse | 定山渓鶴雅リゾートスパ森の謌 日帰り | Tier 1 | operation_recheck | high | moderate | mixed_use_hotel_day_spa | 식사·에스테 세트/예약/휴무 조건 확인 후 experience형 day-use로 분리 |
| jozankei-shogetsu-dayuse | 章月グランドホテル 日帰り | Tier 2 | operation_recheck | medium | weak | mixed_use_hotel_day_spa | 전일 예약/식사세트/토·축전일 제외 조건 확인. 단독 입욕시설처럼 비교 금지 |
| jozankei-hanakaede-dayuse | 鹿の湯・花もみじ 日帰り候補 | Tier 2 | operation_recheck | medium | moderate | mixed_use_hotel_day_spa | day-use 일정 공지형 운영 여부 fresh check. 鹿の湯/花もみじ product 분리 필요 |
| yunokawa-yumeguri-butai | 湯の川温泉足湯「湯巡り舞台」 | Tier 1 | footbath_only | medium | moderate | footbath | stopover 모델 경량 QA. 전신 입욕시설 비교에서 제외 |
| yunokawa-tropical-footbath | 函館市熱帯植物園足湯 | Tier 1 | footbath_only | medium | moderate | footbath | 식물원 입장/원숭이 온천 관람과 묶인 stopover/experience 모델로 분리 |
| hakodate-yachigashira | 谷地頭温泉 | Tier 1 | ready_high_priority | high | moderate | public_bath_facility | 시설 딥리서치 플랫폼 보강. Google Maps/Sauna Ikitai 추가 시 A 승급 가능 |
| hakodate-hiromesou | ホテル函館ひろめ荘 | Tier 2 | operation_recheck | medium | weak | mixed_use_hotel_day_spa | 2종 원천 day-use 조건 확인. 하코다테 관광동선과 거리 있어 후순위 |

## ready_high_priority 후보
| slug | reason |
|---|---|
| noboribetsu-sagiriyu | 노보리베쓰 공중탕, 유황천/로컬탕 신호 후보 / 시설 딥리서치 우선. Google Maps/Naver/한국어 블로그 보강으로 로컬 공중탕 기준 A 가능성 확인 |
| jozankei-hoheikyo | 대자연 대노천탕, 조망/접근성/혼잡 신호 후보 / 이미 A급 표본 확보. Google/Naver 보강 시 한국어 접근·혼잡·송영 신호 강화 |
| jozankei-yunohana | 대중형 당일온천, 10:00-21:00/접수 20:30 노출, 셔틀 후보 / needs_reinforcement_high_priority. Naver Blog/Google/Yahoo/Sauna Ikitai 본문 보강 |
| hakodate-yachigashira | 하코다테 시내 공중온천, 로컬탕/갈색온천 신호 후보 / 시설 딥리서치 플랫폼 보강. Google Maps/Sauna Ikitai 추가 시 A 승급 가능 |

## operation_recheck 후보
| slug | service_priority | reason | next_action |
|---|---|---|---|
| noboribetsu-daiichi-dayuse | high | mixed_use_hotel_day_spa. 1500坪 대욕장/5泉質/35浴槽은 강한 후보이나 호텔 부속 day-use라 요금, 시간, local discount, evening discount 종료 등 운영 최신 확인 필요. original_facility_type=large_day_use_complex. | 공식 day-use 시간/요금/할인/입장 제한 fresh check 후 mixed_use_hotel_day_spa로 딥리서치 |
| noboribetsu-grand-dayuse | high | mixed_use_hotel_day_spa. 鬼サウナ와 대욕장 value가 강하지만 공식 NEWS 확인이 필요한 operation_recheck 후보. original_facility_type=large_day_use_complex. | 공식 NEWS와 day-use 외부 이용 조건 확인 후 사우나/대욕장 축 분리 |
| noboribetsu-sekisuitei-dayuse | medium | mixed_use_hotel_day_spa. 공식 day-use 시간/요금 표면 확인. 목욕 청소/성수기/만실시 변경 가능성이 명시되어 딥리서치 전 운영 최신 확인 필요. original_facility_type=large_day_use_complex. | 성수기/청소/만실시 이용 제한 확인. 관광 day-use 수요 약하면 후순위 |
| noboribetsu-manseikaku-dayuse | high | mixed_use_hotel_day_spa. 源泉水風呂/ロウリュサウナ가 시설형 신호로 가치 있으나 입장 제한/만차시 거절/문신 정책 등 운영 조건 확인 필요. original_facility_type=large_day_use_complex. | 만차/입장 제한/문신 정책 확인 후 源泉水風呂·ロウリュ 사우나 축 딥리서치 |
| noboribetsu-suzuki-karurusu | medium | mixed_use_hotel_day_spa. 숙박 료칸이지만 日帰り温泉 가능성이 확인되어 hold에서 operation_recheck로 조정. lodging-only 혼동을 막고 day-use product로만 후속 검토. original_facility_type=hotel_dayuse_bath. | 외부 day-use 운영 조건과 리뷰풀 확인. 숙박 중심이면 facility 우선순위 낮춤 |
| jozankei-morino-uta-dayuse | high | mixed_use_hotel_day_spa / experience. 단독 입욕이 아니라 식사·에스테 세트 조건이 핵심이라 가격·정기휴무·예약 가능성 확인 후 deep review. original_facility_type=wellness_spa. | 식사·에스테 세트/예약/휴무 조건 확인 후 experience형 day-use로 분리 |
| jozankei-shogetsu-dayuse | medium | mixed_use_hotel_day_spa. 전일 오전까지 예약제/식사세트/토·축전일 제외가 핵심. 단독 온천시설처럼 비교하면 안 됨. original_facility_type=hotel_dayuse_bath. | 전일 예약/식사세트/토·축전일 제외 조건 확인. 단독 입욕시설처럼 비교 금지 |
| jozankei-hanakaede-dayuse | medium | mixed_use_hotel_day_spa. 鹿の湯/花もみじ 계열 day-use는 일정 공지형이라 상시 시설로 처리하지 말고 operation_recheck 유지. original_facility_type=hotel_dayuse_bath. | day-use 일정 공지형 운영 여부 fresh check. 鹿の湯/花もみじ product 분리 필요 |
| hakodate-hiromesou | medium | mixed_use_hotel_day_spa. 2종 원천/日帰り入浴 가능. 숙박시설 부속이므로 day-use product로만 분리하고 운영시간·요금 최신 확인 필요. original_facility_type=hotel_dayuse_bath. | 2종 원천 day-use 조건 확인. 하코다테 관광동선과 거리 있어 후순위 |

## footbath_only 후보
| slug | service_priority | next_action |
|---|---|---|
| yunokawa-yumeguri-butai | medium | stopover 모델 경량 QA. 전신 입욕시설 비교에서 제외 |
| yunokawa-tropical-footbath | medium | 식물원 입장/원숭이 온천 관람과 묶인 stopover/experience 모델로 분리 |

## service_priority=high 후보
| slug | candidate_status | why high |
|---|---|---|
| noboribetsu-sagiriyu | ready_high_priority | 유명 온천지/관광형 수요/비교 축/리뷰 표면 중 복수 조건 충족 |
| noboribetsu-daiichi-dayuse | operation_recheck | 유명 온천지/관광형 수요/비교 축/리뷰 표면 중 복수 조건 충족 |
| noboribetsu-grand-dayuse | operation_recheck | 유명 온천지/관광형 수요/비교 축/리뷰 표면 중 복수 조건 충족 |
| noboribetsu-manseikaku-dayuse | operation_recheck | 유명 온천지/관광형 수요/비교 축/리뷰 표면 중 복수 조건 충족 |
| jozankei-hoheikyo | ready_high_priority | 유명 온천지/관광형 수요/비교 축/리뷰 표면 중 복수 조건 충족 |
| jozankei-yunohana | ready_high_priority | 유명 온천지/관광형 수요/비교 축/리뷰 표면 중 복수 조건 충족 |
| jozankei-morino-uta-dayuse | operation_recheck | 유명 온천지/관광형 수요/비교 축/리뷰 표면 중 복수 조건 충족 |
| hakodate-yachigashira | ready_high_priority | 유명 온천지/관광형 수요/비교 축/리뷰 표면 중 복수 조건 충족 |

## 숙소와 섞일 위험이 있는 후보
| slug | status | action |
|---|---|---|
| noboribetsu-daiichi-dayuse | operation_recheck | 숙박 리뷰와 day-use 리뷰를 분리하고 공식 외부 이용 조건 확인 |
| noboribetsu-grand-dayuse | operation_recheck | 숙박 리뷰와 day-use 리뷰를 분리하고 공식 외부 이용 조건 확인 |
| noboribetsu-sekisuitei-dayuse | operation_recheck | 숙박 리뷰와 day-use 리뷰를 분리하고 공식 외부 이용 조건 확인 |
| noboribetsu-manseikaku-dayuse | operation_recheck | 숙박 리뷰와 day-use 리뷰를 분리하고 공식 외부 이용 조건 확인 |
| noboribetsu-suzuki-karurusu | operation_recheck | 숙박 리뷰와 day-use 리뷰를 분리하고 공식 외부 이용 조건 확인 |
| jozankei-morino-uta-dayuse | operation_recheck | 숙박 리뷰와 day-use 리뷰를 분리하고 공식 외부 이용 조건 확인 |
| jozankei-shogetsu-dayuse | operation_recheck | 숙박 리뷰와 day-use 리뷰를 분리하고 공식 외부 이용 조건 확인 |
| jozankei-hanakaede-dayuse | operation_recheck | 숙박 리뷰와 day-use 리뷰를 분리하고 공식 외부 이용 조건 확인 |
| hakodate-hiromesou | operation_recheck | 숙박 리뷰와 day-use 리뷰를 분리하고 공식 외부 이용 조건 확인 |

## 다음 딥리서치 제안
1. 즉시 딥리서치: `jozankei-hoheikyo`, `hakodate-yachigashira`, `noboribetsu-sagiriyu`, `jozankei-yunohana`. 단, 유노하나는 `needs_reinforcement_high_priority` 관점으로 Google/Naver/Yahoo/Sauna Ikitai 보강을 먼저 둔다.
2. 운영 확인 후 딥리서치: `noboribetsu-daiichi-dayuse`, `noboribetsu-grand-dayuse`, `noboribetsu-manseikaku-dayuse`, `jozankei-morino-uta-dayuse`. 이들은 호텔 부속이지만 관광형 가치가 높아 `service_priority=high`로 보존한다.
3. 후순위 운영 확인: 石水亭, 鈴木旅館, 章月, 鹿の湯・花もみじ, ひろめ荘. 공식 day-use 조건과 리뷰풀 확인 전에는 숙소 리뷰와 섞지 않는다.
4. 족탕 2개는 stopover/experience 모델로 별도 경량 QA를 진행하고 전신 입욕시설 비교에는 넣지 않는다.

## 주의
- `candidate_status=operation_recheck`는 탈락이 아니다. 운영 조건 확인이 필요한 상태다.
- `service_priority=high`는 딥리서치 가치가 높다는 뜻이지, 직접 리뷰 품질 등급이 높다는 뜻이 아니다.
- 한국어 수요는 검색/관광 표면 신호이며 직접 리뷰 수에 포함하지 않았다.
