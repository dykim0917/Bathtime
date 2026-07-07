# Hokkaido Ready Accommodation QA Audit

작성일: 2026-07-04

## 결론

- 전체 ready 숙소 수: 16개
- A/B/C/D 분포: A 16개, B 0개, C 0개, D 0개
- 서비스 데이터로 바로 쓸 수 있는 숙소: 7개
- 보강이 필요한 숙소: 0개
- 메타데이터 정리가 필요한 숙소: 9개

정량 기준으로는 16개 ready 숙소 전부 직접 확인 300건 이상, 직접 본문 플랫폼 3개 이상을 충족해 A로 재판정된다. 다만 QA 기준은 “서비스에 바로 넣을 수 있는가”이므로 Google 요약 필드 불일치, Naver 상태 미기록, 운영성 signal_type 확장, 보고서 구조 깨짐이 남은 숙소는 `needs_metadata_cleanup`으로 분리했다.

## 정량 QA

| 항목 | 결과 |
|---|---:|
| ready 숙소 수 | 16 |
| A등급 | 16 |
| B등급 | 0 |
| C등급 | 0 |
| D등급 | 0 |
| 직접 확인 리뷰 총합 | 5,170 |
| 온천 관련 직접 리뷰 총합 | 3,412 |
| 직접 확인 300건 미만 숙소 | 0 |
| 직접 본문 플랫폼 3개 미만 숙소 | 0 |

## 숙소별 품질 매트릭스

| slug | name_ja | direct_reviews | onsen_related | platforms | grade | service_data_status | issue |
|---|---|---:|---:|---:|---|---|---|
| tokachigawa-seijakubou | 全室源泉かけ流し露天風呂付きの宿 清寂房《十勝川モール温泉》 | 380 | 300 | 8 | A | ready_for_service | Google partner/provider card 분리 필요; mirror 리뷰 중복 가능성; snippet_only 직접 수 제외 확인; OTA/AI 요약 직접 수 제외 확인 |
| toyako-lake-suite-konosisu | ザ・レイクスイート湖の栖 | 308 | 255 | 7 | A | ready_for_service | Ikkyu/Yahoo 또는 OTA overlap 가능성; snippet_only 직접 수 제외 확인 |
| noboribetsu-bourou-noguchi | 望楼NOGUCHI登別 | 368 | 247 | 11 | A | needs_metadata_cleanup | google summary field conflicts with pool row; operational signal_type extensions: cleanliness_maintenance; Ikkyu/Yaho... |
| jozankei-suizantei | 定山渓第一寶亭留 翠山亭 | 313 | 199 | 9 | A | ready_for_service | Google partner/provider card 분리 필요; Ikkyu/Yahoo 또는 OTA overlap 가능성; snippet_only 직접 수 제외 확인 |
| yunokawa-nagisatei | 湯の川プリンスホテル渚亭 | 333 | 251 | 7 | A | ready_for_service | Google partner/provider card 분리 필요; Google/숙소 정체성 혼재 주의; snippet_only 직접 수 제외 확인 |
| noboribetsu-daiichi-takimotokan | 第一滝本館 | 300 | 189 | 8 | A | ready_for_service | Google partner/provider card 분리 필요; Google/숙소 정체성 혼재 주의; snippet_only 직접 수 제외 확인 |
| noboribetsu-mahoroba | ホテルまほろば | 330 | 216 | 8 | A | needs_metadata_cleanup | naver status not recorded |
| noboribetsu-grand | 祝いの宿 登別グランドホテル | 324 | 200 | 8 | A | needs_metadata_cleanup | naver status not recorded; Google partner/provider card 분리 필요 |
| noboribetsu-manseikaku | 登別万世閣 | 351 | 228 | 7 | A | ready_for_service | Google/숙소 정체성 혼재 주의; snippet_only 직접 수 제외 확인 |
| noboribetsu-takinoya | 登別温泉郷 滝乃家 | 312 | 184 | 4 | A | needs_metadata_cleanup | google summary field conflicts with pool row; naver status not recorded; operational signal_type extensions: insects;... |
| noboribetsu-hanayura | 旅亭 花ゆら | 306 | 211 | 8 | A | needs_metadata_cleanup | google summary field conflicts with pool row; naver status not recorded; operational signal_type extensions: insects,... |
| jozankei-chalet-ivy | シャレーアイビー定山渓 | 312 | 103 | 12 | A | needs_metadata_cleanup | google summary field conflicts with pool row; operational signal_type extensions: privacy_or_glass_bath; Google partn... |
| jozankei-grand-blissen | グランドブリッセンホテル定山渓 | 305 | 216 | 3 | A | needs_metadata_cleanup | google status incomplete; naver status not recorded |
| yunokawa-heiseikan-hanatsuki | 平成館 しおさい亭 別館 花月 | 300 | 246 | 6 | A | needs_metadata_cleanup | naver status not recorded; operational signal_type extensions: aged_facility,temperature_control; Ikkyu/Yahoo 또는 OTA ... |
| yunokawa-heiseikan-shiosaitei | 平成館 しおさい亭 | 318 | 199 | 6 | A | ready_for_service | Google/숙소 정체성 혼재 주의; snippet_only 직접 수 제외 확인; OTA/AI 요약 직접 수 제외 확인 |
| yunokawa-hanabishi | 函館・湯の川温泉 花びしホテル | 310 | 168 | 3 | A | needs_metadata_cleanup | google status incomplete; naver status not recorded |

## 주요 QA 이슈

- 중복 리뷰 가능성: Ikkyu/Yahoo Travel 공유 원천, Booking/Agoda/Hotels.com/Google 노출 mirror, Google provider card가 여러 숙소에서 notes에 남아 있다. 직접 리뷰 수에는 섞지 않은 것으로 보이나, 서비스용 source_count 산출 때 중복 경고를 유지해야 한다.
- Google/Google Hotels 혼재: Google-native 리뷰와 Google Hotels/OTA 공급자 카드가 같은 패널에 노출된 경우가 있다. `noboribetsu-bourou-noguchi`, `noboribetsu-takinoya`, `noboribetsu-hanayura`, `jozankei-chalet-ivy`는 pool row에는 Google 직접 본문이 있으나 `google_maps` 요약 필드가 `not_checked` 또는 `not_converted`로 남아 정리가 필요하다.
- Naver snippet/direct body 구분: Naver는 대체로 snippet_only 또는 not_recorded다. `yunokawa-nagisatei`, `noboribetsu-daiichi-takimotokan`, `noboribetsu-manseikaku`처럼 직접 본문을 읽은 경우만 direct로 인정되어 있다.
- 공식 사실과 리뷰 신호 혼재: summary markdown의 공식 사실 섹션 뒤에 리뷰 신호 표 행이 섞인 구조 깨짐 흔적이 있어, 서비스용 리포트로 쓰기 전 섹션 분리가 필요하다.
- 객실탕/가족탕/대절탕 혼동: review_signal_rows의 bath_area 값은 허용 범위 안에 있으며, 객실탕과 가족탕/대절탕을 합친 치명 오류는 검출되지 않았다.
- 숙소/시설 모델 혼동: 이번 QA 입력은 accommodation ready 16개만 사용했고 facility 후보 15개는 제외했다.
- 운영성 signal_type 확장: `temperature_control`, `aged_facility`, `insects`, `cleanliness_maintenance` 등 운영 메모 성격의 signal_type이 일부 CSV에 들어 있다. 서비스 스키마에서는 본 신호와 운영 메모를 분리하는 정리가 필요하다.

## 보강 필요 숙소

정량 보강이 필요한 숙소는 없다. 16개 모두 직접 확인 300건 이상, 직접 본문 플랫폼 3개 이상이다.

## 메타데이터 정리 필요 숙소

| slug | reason | next_action |
|---|---|---|
| noboribetsu-bourou-noguchi | google summary field conflicts with pool row; operational signal_type extensions: cleanliness_maintenance; Ikkyu/Yahoo 또는 OTA overlap 가능성; snippet_only 직접 수 제외 확인; OTA/AI 요약 직접 수 제외 확인 | Google/Naver/중복·운영신호 메타데이터 정리 후 반영 |
| noboribetsu-mahoroba | naver status not recorded | Google/Naver/중복·운영신호 메타데이터 정리 후 반영 |
| noboribetsu-grand | naver status not recorded; Google partner/provider card 분리 필요 | Google/Naver/중복·운영신호 메타데이터 정리 후 반영 |
| noboribetsu-takinoya | google summary field conflicts with pool row; naver status not recorded; operational signal_type extensions: insects; Google partner/provider card 분리 필요 | Google/Naver/중복·운영신호 메타데이터 정리 후 반영 |
| noboribetsu-hanayura | google summary field conflicts with pool row; naver status not recorded; operational signal_type extensions: insects,temperature_control; Google partner/provider card 분리 필요; mirror 리뷰 중복 가능성 | Google/Naver/중복·운영신호 메타데이터 정리 후 반영 |
| jozankei-chalet-ivy | google summary field conflicts with pool row; operational signal_type extensions: privacy_or_glass_bath; Google partner/provider card 분리 필요; Ikkyu/Yahoo 또는 OTA overlap 가능성; snippet_only 직접 수 제외 확인 | Google/Naver/중복·운영신호 메타데이터 정리 후 반영 |
| jozankei-grand-blissen | google status incomplete; naver status not recorded | Google/Naver/중복·운영신호 메타데이터 정리 후 반영 |
| yunokawa-heiseikan-hanatsuki | naver status not recorded; operational signal_type extensions: aged_facility,temperature_control; Ikkyu/Yahoo 또는 OTA overlap 가능성; Google/숙소 정체성 혼재 주의; OTA/AI 요약 직접 수 제외 확인 | Google/Naver/중복·운영신호 메타데이터 정리 후 반영 |
| yunokawa-hanabishi | google status incomplete; naver status not recorded | Google/Naver/중복·운영신호 메타데이터 정리 후 반영 |

## 서비스 반영 가능 숙소

| slug | reason |
|---|---|
| tokachigawa-seijakubou | A: 직접 380건, 온천 관련 300건, 직접 본문 플랫폼 8개; 300건 이상/3개 이상 충족; 핵심 source 상태와 중복 제외 메모가 서비스 행 수준에서 충분히 명시됨 |
| toyako-lake-suite-konosisu | A: 직접 308건, 온천 관련 255건, 직접 본문 플랫폼 7개; 300건 이상/3개 이상 충족; 핵심 source 상태와 중복 제외 메모가 서비스 행 수준에서 충분히 명시됨 |
| jozankei-suizantei | A: 직접 313건, 온천 관련 199건, 직접 본문 플랫폼 9개; 300건 이상/3개 이상 충족; 핵심 source 상태와 중복 제외 메모가 서비스 행 수준에서 충분히 명시됨 |
| yunokawa-nagisatei | A: 직접 333건, 온천 관련 251건, 직접 본문 플랫폼 7개; 300건 이상/3개 이상 충족; 핵심 source 상태와 중복 제외 메모가 서비스 행 수준에서 충분히 명시됨 |
| noboribetsu-daiichi-takimotokan | A: 직접 300건, 온천 관련 189건, 직접 본문 플랫폼 8개; 300건 이상/3개 이상 충족; 핵심 source 상태와 중복 제외 메모가 서비스 행 수준에서 충분히 명시됨 |
| noboribetsu-manseikaku | A: 직접 351건, 온천 관련 228건, 직접 본문 플랫폼 7개; 300건 이상/3개 이상 충족; 핵심 source 상태와 중복 제외 메모가 서비스 행 수준에서 충분히 명시됨 |
| yunokawa-heiseikan-shiosaitei | A: 직접 318건, 온천 관련 199건, 직접 본문 플랫폼 6개; 300건 이상/3개 이상 충족; 핵심 source 상태와 중복 제외 메모가 서비스 행 수준에서 충분히 명시됨 |

## 산출물

- 정규화 matrix: `hokkaido_ready_accommodation_quality_matrix_2026-07-04.csv`
- cleanup notes: `hokkaido_ready_accommodation_cleanup_notes_2026-07-04.csv`
- QA 판단 기준: raw/platform_mapping/aside_reinforcement를 우선 검산하고, visible_review_count·snippet·OTA 요약·AI 요약·Google provider card는 직접 리뷰 수에서 제외한 상태를 확인했다.
