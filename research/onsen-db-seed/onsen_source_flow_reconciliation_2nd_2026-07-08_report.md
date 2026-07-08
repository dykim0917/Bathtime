# 원천 방식 리컨실리에이션 리포트

작성일: 2026-07-08

## 요약

- DB 반영 모드: 적용 완료
- 자동 확정 업데이트: 11곳
- 수동 검토 후보: 10건
- 원칙: 원천가케나가시/직수는 공식 표면 또는 이전 검증 seed가 있는 경우만 배지로 복원합니다.

## 자동 확정 업데이트

| slug | 숙소명 | 이전 | 변경 | 근거 |
|---|---|---|---|---|
| yufuin-wazanho | 유후인 료안 와잔호 | hot_spring_confirmed / spring_confirmed | free_flowing_source / spring_confirmed, direct_source | 대욕장과 객실탕 모두 源泉100%掛け流し (research/onsen-review-signals/yufuin-wazanho/platform_mapping_2026-07-08.json) |
| beppu-yunosato-hayama | 유노사토 하야마 | hot_spring_confirmed / spring_confirmed | free_flowing_source / spring_confirmed, direct_source | 天然温泉かけ流し / 源泉かけ流し (research/onsen-review-signals/beppu-yunosato-hayama/review_signal_summary_2026-07-07.md) |
| ibusuki-ginsyo | 이부스키 긴쇼 | hot_spring_confirmed / spring_confirmed, water_texture | free_flowing_source / spring_confirmed, direct_source, water_texture | 대욕장 내탕/노천 + 객실 노천 源泉かけ流し (research/onsen-review-signals/ibusuki-ginsyo/platform_mapping_2026-07-04.json) |
| yufuin-warabino | 산소 와라비노 | hot_spring_confirmed / spring_confirmed, water_texture | free_flowing_source / spring_confirmed, direct_source, water_texture | 전 객실 원천가케나가시 온천 포함 (research/onsen-review-signals/yufuin-tier2-deep-research/yufuin-warabino/review_signal_summary_curated_2026-07-02.json) |
| yufuin-konjakuan | 벳소 콘자쿠안 | hot_spring_confirmed / spring_confirmed | free_flowing_source / spring_confirmed, direct_source | 天然温泉100% / 温泉掛け流し / 모든 목욕탕 가족탕 (research/onsen-review-signals/yufuin-konjakuan/platform_mapping_2026-07-08.json) |
| unzen-fukudaya | 운젠 후쿠다야 | hot_spring_confirmed / spring_confirmed, water_texture | free_flowing_source / spring_confirmed, direct_source, water_texture | 源泉かけ流し / 白濁温泉 (research/onsen-review-signals/unzen-fukudaya/platform_mapping_2026-07-04.json) |
| hakone-gen-gora | 겐 하코네 고라 | hot_spring_confirmed / spring_confirmed, water_texture | free_flowing_source / spring_confirmed, direct_source, water_texture | 전 18실 원천가케나가시 객실 노천탕 (research/onsen-review-signals/hakone-gen-gora/review_signal_summary_2026-07-04.md) |
| yufuin-sakuratei | 오야도 사쿠라테이 | hot_spring_confirmed / spring_confirmed, water_texture | free_flowing_source / spring_confirmed, direct_source, water_texture | 전 10동 별채 원천가케나가시 노천탕 (research/onsen-review-signals/yufuin-sakuratei/review_signal_summary_2026-07-08.md) |
| yufuin-baien | 유후인 바이엔 가든 리조트 | hot_spring_confirmed / spring_confirmed | free_flowing_source / spring_confirmed, direct_source | 공식 온천 페이지 원천가케나가시 (research/onsen-review-signals/yufuin-baien/review_signal_summary_curated_2026-07-01.json) |
| hakone-yuyado-zen | 하코네 유야도 젠 | hot_spring_confirmed / spring_confirmed, water_texture | free_flowing_source / spring_confirmed, direct_source, water_texture | all rooms 掛け流し / 天然掛け流しにごり湯 (research/onsen-review-signals/hakone-yuyado-zen/platform_mapping_2026-07-04.json) |
| beppu-yutorelo | 유토리로 벳푸 | hot_spring_confirmed / spring_confirmed | free_flowing_source / spring_confirmed, direct_source | 自家源泉かけ流し / 自家源泉 (research/onsen-review-signals/beppu-yutorelo/platform_mapping_2026-07-08.json) |

## 수동 검토 후보

| slug | status | reason |
|---|---|---|
| hakone-fontainebleau | hold_review_heavy | 가케나가시 리뷰 신호는 많지만 이번 스캔에서 공식 표면 문장이 충분히 분리되지 않아 보류합니다. |
| beppu-kannawa-bettei | hold_review_heavy | Jalan 직접 리뷰에 원천가케나가시가 반복되지만 공식 표면 근거를 더 분리해야 합니다. |
| yufuin-kounokura | hold_review_heavy | 리뷰/플랜명 신호는 강하지만 공식 시설 표면 검산 후 승격하는 편이 안전합니다. |
| ureshino-shiibasanso | hold_room_type_specific | 源泉100%かけ流し 표기가 객실 타입/플랜명 중심으로 보여 객실 타입 caveat를 더 정리해야 합니다. |
| beppu-bettei-haruki | hold_review_or_plan_signal | 리뷰와 일부 표면 신호는 있으나 공식 전 범위 근거가 부족합니다. |
| misasa-izanro-iwasaki | hold_partial_scope | 일부 욕장/객실 단위 원천가케나가시 표면은 있으나 숙소 전체 배지로 승격할 범위 검산이 필요합니다. |
| shirahama-sanrakuso | hold_partial_room_type | 원천가케나가시 객실 표면은 있으나 일부 객실/욕장 범위 분리가 필요합니다. |
| shirahama-kaishu | hold_partial_room_type | 일부 객실/이탈 객실은 원천가케나가시이나 다른 객실은 끓인 물 표기가 있어 자동 승격하지 않습니다. |
| misasa-mansuirou | hold_partial_or_mixed_operation | 자가원천 100%와 가온/가수 표면이 함께 있어 직수 배지보다 수동 판정이 먼저 필요합니다. |
| tamatsukuri-konya | exclude_conflict | Yukoyuko와 Japan Onsen Association 표면이 충돌하여 직수 후보에서 제외합니다. |

## 적용 메모

- `100% 천연온천`은 변별력이 약한 마케팅 표기가 될 수 있어 이번 복원 대상에서 제외했습니다.
- `원천 100% 직수` 배지는 숙소 전체 모든 욕조가 직수라는 뜻이 아니라, 확인된 온천수 운용 축에 대한 강한 근거가 있다는 뜻으로 사용합니다.
- 객실 타입별로 끓인 물/온천/직수가 섞인 숙소는 operation_notes에 조건을 남기고, 다음 QA에서 bath_area 단위 판정을 분리해야 합니다.
