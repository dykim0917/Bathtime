# 원천 방식 리컨실리에이션 리포트

작성일: 2026-07-08

## 요약

- DB 반영 모드: 적용 완료
- 자동 확정 업데이트: 4곳
- 수동 검토 후보: 8건
- 원칙: 원천가케나가시/직수는 공식 표면 또는 이전 검증 seed가 있는 경우만 배지로 복원합니다.

## 자동 확정 업데이트

| slug | 숙소명 | 이전 | 변경 | 근거 |
|---|---|---|---|---|
| hakone-byakudan | 하코네 고라 백단 | hot_spring_confirmed / spring_confirmed, water_texture | free_flowing_source / spring_confirmed, direct_source, water_texture | water_source_type=free_flowing_source / water_kakenagashi (research/onsen-review-signals/hakone-byakudan/platform_mapping_2026-07-04.json) |
| tokachigawa-seijakubou | 도카치가와 온천 세이자쿠보 | hot_spring_confirmed / spring_confirmed, water_texture | free_flowing_source / spring_confirmed, direct_source, water_texture | 全室源泉かけ流し露天風呂付きの宿 (research/onsen-db-seed/hokkaido_reconciliation_seed_2026-07-08.json) |
| yunohira-gyounso | 유노히라 교운소 | hot_spring_confirmed / spring_confirmed, water_texture | free_flowing_source / spring_confirmed, direct_source, water_texture | 源泉掛け流し大人限定宿 (research/onsen-db-seed/kyushu_qa_seed_3rd_2026-07-08.json) |
| shirahama-yanagiya | 시라하마 야나기야 | hot_spring_confirmed / spring_confirmed, water_texture | free_flowing_source / spring_confirmed, direct_source, water_texture | 百割源泉 / 源泉百% 掛け流し (research/onsen-deep-research/shirahama-yanagiya-2026-07-04/review_signal_summary_2026-07-04.md) |

## 수동 검토 후보

| slug | status | reason |
|---|---|---|
| misasa-izanro-iwasaki | hold_partial_scope | 일부 욕장/객실 단위 원천가케나가시 표면은 있으나 숙소 전체 배지로 승격할 범위 검산이 필요합니다. |
| misasa-mansuirou | hold_partial_or_mixed_operation | 자가원천 100%와 가온/가수 표면이 함께 있어 직수 배지보다 수동 판정이 먼저 필요합니다. |
| shirahama-kaishu | hold_partial_room_type | 일부 객실/이탈 객실은 원천가케나가시이나 다른 객실은 끓인 물 표기가 있어 자동 승격하지 않습니다. |
| shirahama-key-terrace | hold_partial_public_bath | 특정 공용탕 원천가케나가시 표면으로 보여 숙소 전체 직수 배지 전 범위 검산이 필요합니다. |
| shirahama-sanrakuso | hold_partial_room_type | 원천가케나가시 객실 표면은 있으나 일부 객실/욕장 범위 분리가 필요합니다. |
| kaike-yugetsu | exclude_conflict | 로컬 조사에서 가케나가시가 아니라는 표면이 확인되어 직수 후보에서 제외합니다. |
| toba-kisara-bettei-toki | exclude_conflict | 로컬 조사에서 가케나가시가 아니라는 표면이 확인되어 직수 후보에서 제외합니다. |
| yufuin_previous_copy_candidates | hold_previous_copy_only | 과거 문구에 직수 표현이 있던 유후인 숙소군은 원문 공식/후기 근거를 다시 묶기 전까지 자동 복원하지 않습니다. |

## 적용 메모

- `100% 천연온천`은 변별력이 약한 마케팅 표기가 될 수 있어 이번 복원 대상에서 제외했습니다.
- `원천 100% 직수` 배지는 숙소 전체 모든 욕조가 직수라는 뜻이 아니라, 확인된 온천수 운용 축에 대한 강한 근거가 있다는 뜻으로 사용합니다.
- 객실 타입별로 끓인 물/온천/직수가 섞인 숙소는 operation_notes에 조건을 남기고, 다음 QA에서 bath_area 단위 판정을 분리해야 합니다.
