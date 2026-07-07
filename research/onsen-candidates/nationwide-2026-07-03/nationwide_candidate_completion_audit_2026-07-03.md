# Nationwide Onsen Candidate Completion Audit

작성일: 2026-07-03

## 결론

일본 전국 온천 후보군 조사는 `온천 숙소`와 `온천시설`을 분리한 후보 마스터 및 Tier 1 표면검증 큐까지 완료된 상태다. 이 산출물은 딥리뷰 리서치에 들어가기 전의 후보군/우선순위 데이터로 사용할 수 있다.

단, 이 데이터는 후기 본문을 300건 단위로 직접 읽어 태깅한 리뷰 신호 데이터가 아니다. 사용자 노출용 온천감, 염소 냄새, 혼잡, 객실탕 온천 여부 같은 최종 신호는 숙소별/시설별 딥리뷰 단계에서 별도로 확정해야 한다.

## 목표 대비 완료 증거

| 요구사항 | 현재 증거 | 판단 |
|---|---|---|
| 일본 전국으로 후보군 확대 | 숙소 423건, 시설 228건의 전국 마스터 생성 | 완료 |
| 온천 숙소와 온천시설 분리 | `nationwide_accommodation_master_v0_6_2026-07-03.csv`, `nationwide_facility_master_v0_6_2026-07-03.csv` 별도 관리 | 완료 |
| 이전 후보추리 방식 유지 | 일반 비즈니스호텔 제외, 료칸/온천호텔/리조트/당일온천/공중탕/가족탕/모래탕/족탕 등으로 분류 | 완료 |
| Tier 우선순위 부여 | 숙소 Tier 1 284건, Tier 2 127건, Tier 3 12건 / 시설 Tier 1 143건, Tier 2 78건, Tier 3 7건 | 완료 |
| 딥리뷰 전 검증 큐 생성 | 숙소 Tier 1 284건, 시설 Tier 1 143건 큐 생성 | 완료 |
| Tier 1 표면검증 완료 | complete batch 01-06에서 숙소 284건, 시설 143건 전부 검증 | 완료 |
| 공식/리뷰 표면 결손 확인 | Tier 1 complete 파일 기준 공식 URL 누락 0, 주요 리뷰/OTA URL 누락 0, source URL 누락 0 | 완료 |
| 중복/분리/보류 이슈 식별 | batch report별 duplicate, route/pass, footbath-only, operation hold, room-bath source caution 기록 | 완료 |

## 최종 파일

| 구분 | 파일 | 행 수 |
|---|---|---:|
| 숙소 후보 마스터 | `nationwide_accommodation_master_v0_6_2026-07-03.csv` | 423 |
| 온천시설 후보 마스터 | `nationwide_facility_master_v0_6_2026-07-03.csv` | 228 |
| 숙소 Tier 1 검증 큐 | `tier1_accommodation_verification_queue_v0_1_2026-07-03.csv` | 284 |
| 시설 Tier 1 검증 큐 | `tier1_facility_verification_queue_v0_1_2026-07-03.csv` | 143 |
| Tier 1 검증 완료본 | `tier1_verification_batch_01_complete_v0_1_2026-07-03.csv` - `tier1_verification_batch_06_complete_v0_1_2026-07-03.csv` | 427 |

## 마스터 규모

| dataset | total | Tier 1 | Tier 2 | Tier 3 | prefectures | onsen areas |
|---|---:|---:|---:|---:|---:|---:|
| accommodation | 423 | 284 | 127 | 12 | 30 | 63 |
| facility | 228 | 143 | 78 | 7 | 37 | 69 |
| total | 651 | 427 | 205 | 19 | - | - |

## Tier 1 검증 QA

| dataset | queue rows | completed rows | rank coverage | missing official URL | missing review/OTA URL | missing source URLs | duplicate kind+rank |
|---|---:|---:|---|---:|---:|---:|---:|
| accommodation | 284 | 284 | 1-284, no gaps | 0 | 0 | 0 | 0 |
| facility | 143 | 143 | 1-143, no gaps | 0 | 0 | 0 | 0 |

## 데이터 사용 가능 범위

현재 데이터는 다음 용도로 쓸 수 있다.

- 전국 단위 숙소/온천시설 후보군 관리
- 딥리뷰 우선순위 결정
- 숙소형 모델과 시설형 모델 분리
- 중복/운영중지/route-pass/족탕-only/숙박시설 day-use 혼재 후보 정리
- 리뷰 신호 수집 전 공식 URL과 주요 리뷰 표면 탐색

현재 데이터만으로는 다음을 확정하면 안 된다.

- 객실탕이 온천인지 여부의 최종 판정
- 원천가케나가시, 순환, 가수/가온, 염소 냄새 같은 최종 물성 신호
- 혼잡, 예약 혼동, 샤워/어메니티 부족 같은 후기 기반 강도 판정
- 사용자 노출용 추천/비추천 문구
- 가격, 영업시간, 접수마감 등 변동성 큰 운영 정보의 최신 확정

## 다음 단계

1. Tier 1 complete 파일을 바탕으로 `verified_candidate_master_v0_1`을 만들고, `ready`, `hold`, `merge`, `split_needed`, `route_or_pass`, `footbath_only`, `operation_recheck` 상태를 정규화한다.
2. 숙소 딥리뷰는 객실탕, 객실 노천탕, 대욕장, 노천 대욕장, 전세탕/가족탕을 분리해 시작한다.
3. 시설 딥리뷰는 대중탕, 가족탕/프라이빗탕, 모래탕, 증기탕, 족탕, route/pass를 분리해 시작한다.
4. 각 딥리뷰 대상은 플랫폼상 리뷰 수와 직접 확인 리뷰 수를 분리하고, 가능하면 300건 이상 직접 읽는 기준을 적용한다.
