# 온천 숙소 지역별 DB Seed 프로세스

마지막 업데이트: 2026년 7월 8일

이 문서는 한 지역의 숙소 딥리서치 결과를 Bathtime DB에 올릴 때 적용하는 공통 운영 절차입니다. 규슈 배치에서 검증한 `1차 -> 2차 -> 3차-A -> 3차-B` 회수 프로세스를 다른 지역에도 반복 적용하기 위한 기준입니다.

핵심 원칙은 단순합니다. 많이 올리는 것보다, `full verdict`로 올린 데이터가 나중에 흔들리지 않는 것이 먼저입니다.

## 1. 입력 전제

지역별 DB seed 작업은 후보 수집이 아니라 딥리서치 QA 이후 작업입니다. 시작 전에 아래 파일 또는 동등한 산출물이 있어야 합니다.

- `{region}_deep_research_qa_matrix_{date}.csv`
- 숙소별 `direct_review_sample_index_*.csv`
- 가능하면 숙소별 `collection_stats_*.json`
- 이름 정규화 QA 파일
- 문구 QA 파일
- 용어 가이드와 판정문 작성 규칙

`visible_review_count`, 플랫폼 요약, 검색 스니펫, AI 요약만으로는 DB 판정에 들어가지 않습니다. `full verdict`의 원천은 row-level 직접 표본이어야 합니다.

## 2. 공통 품질 게이트

`full verdict` 후보는 아래 기준을 모두 통과해야 합니다.

- 직접 읽은 이용 경험 300건 이상
- 온천 관련 이용 경험 200건 이상
- 직접 본문 플랫폼 3개 이상
- 사용자 노출 판정 항목 3개 이상
- 각 판정 항목은 10건 이상, 해당 분모의 2% 이상
- 각 판정 항목은 2개 이상 플랫폼에서 확인
- `positive`, `mixed`, `negative`, `neutral` 방향 카운트가 모두 숫자로 존재
- `mentions = positive + mixed + negative`
- `negative = negative`만 집계
- `neutral`은 만족/불만 언급 수에서 제외

이 기준을 통과하지 못하면 `lite` 또는 보류로 둡니다. 300건을 읽었다는 사실만으로 `full`이 되지 않습니다.

## 3. 지역별 배치 흐름

### 3.1 0단계: QA 매트릭스 잠금

지역 담당 에이전트는 먼저 모든 숙소를 QA 상태로 분류합니다.

권장 상태:

| status | 의미 | 다음 작업 |
| --- | --- | --- |
| `full_verdict_candidate` | full 기준이 대체로 맞고 방향/플랫폼/카운트가 정리됨 | 1차 seed |
| `ready_for_db_lite` | DB 노출은 가능하지만 full item 기준 미달 | 1차 lite |
| `needs_platform_reconciliation` | 직접 수는 있으나 플랫폼 수, supplier card, snippet 혼입 위험 있음 | 2차 회수 |
| `needs_count_reconciliation` | 직접 수 또는 온천 관련 수가 파일 간 불일치 | 2차 또는 재검산 |
| `needs_direction_backfill` | 표본은 있으나 방향값이 없거나 불완전 | 3차-A/B |
| `needs_scope_reconciliation` | 숙박 리뷰와 당일입욕/시설 리뷰가 섞일 수 있음 | scope 분리 전 보류 |
| `not_started_or_candidate_only` | 후보 단계 또는 visible count만 있음 | 재조사 |

QA 매트릭스에는 최소한 `slug`, `name_ko`, `name_ja`, `area_bucket`, `direct_read_recounted`, `onsen_related_recounted`, `direct_platform_recounted`, `source_scope_status`, `direction_count_status`, `qa_status`, `issue_summary`, `next_action`, `source_files_checked`를 남깁니다.

### 3.2 1차: 바로 적재 가능한 후보

대상:

- `qa_status = full_verdict_candidate`
- `qa_status = ready_for_db_lite`

작업:

1. QA 매트릭스에서 1차 후보를 선택합니다.
2. row-level sample index를 재집계합니다.
3. full 후보는 item 3개 이상이 살아남는지 확인합니다.
4. 미달 full 후보는 lite로 낮추거나 제외 사유를 남깁니다.
5. JSON, SQL, report를 생성합니다.
6. 금지어, 한글명, 지역명, platform count, direction count를 검산합니다.
7. DB 적용 후 품질 체크와 typecheck를 실행합니다.

규슈 예시:

- 1차 후보 21곳
- full 15곳
- lite 6곳

### 3.3 2차: 플랫폼/카운트 조정 회수

대상:

- `needs_platform_reconciliation` 또는 `needs_count_reconciliation`
- 이미 방향 카운트가 정상인 후보
- full 표본 기준을 충족하는 후보
- 1차 seed에 포함되지 않은 후보

2차에서는 방향값을 추론하지 않습니다. 목적은 supplier card, snippet, platform alias, count mismatch 때문에 보류된 후보 중 이미 방향 데이터가 안정적인 것을 회수하는 것입니다.

제외:

- 방향값이 없거나 불완전한 후보
- 숙박/시설 scope가 섞인 후보
- row-level sample index가 없는 후보
- 플랫폼 visible count만 있고 직접 표본이 없는 후보

규슈 예시:

- 2차 회수 12곳
- full 12곳
- lite 0곳

### 3.4 3차-A: 명시 방향 태그 회수

대상:

- `needs_direction_backfill`
- 원천 CSV에 `signal_direction`, `signal_direction_tags`, `direction` 같은 명시 방향 컬럼이 있음
- 방향 컬럼이 전체 row의 80% 이상 채워져 있음
- full 표본 기준을 충족함

3차-A는 추론이 아니라 컬럼 정규화입니다. `positive;mixed`, `mixed;positive`처럼 여러 방향이 섞인 값은 보수적으로 `mixed`로 정규화합니다. 원천 row는 덮어쓰지 않고 seed 생성 단계에서만 표준화합니다.

규슈 예시:

- 3차-A 회수 9곳
- full 9곳

### 3.5 3차-B: 방향 Backfill 회수

대상:

- `needs_direction_backfill`
- 명시 방향 컬럼은 없지만, 방향을 복원할 수 있는 보조 근거가 있음
- 본문 또는 본문 발췌가 있어 감성/문맥 판정 가능
- 또는 `issue_tags`, `caution_tags`가 있어 태그별 방향 사전으로 mixed/negative를 캘리브레이션 가능

3차-B는 DB 직행이 아닙니다. 반드시 별도 backfilled sample index를 생성합니다.

절차:

1. 방향 backfill 규칙 파일을 만듭니다.
2. 원천 CSV를 덮어쓰지 않습니다.
3. `{region}-direction-backfill/{slug}/direct_review_sample_index_direction_backfilled_{date}.csv`를 생성합니다.
4. 각 row에 `signal_direction`, `direction_backfill_rule`, `direction_backfill_confidence`, `direction_backfill_candidate_type`을 추가합니다.
5. audit row CSV를 별도로 생성합니다.
6. backfilled CSV만 사용해 seed를 생성합니다.
7. canonical signal과 bath area 조합을 검산합니다.
8. 통과분만 DB에 적용합니다.

방향 규칙:

| 유형 | 기본 방향 |
| --- | --- |
| 명확한 온천/욕장 만족 본문 | `positive` |
| 장점과 주의점이 같은 row에 함께 있음 | `mixed` |
| 예약/운영/온도/혼잡 조건부 태그 | `mixed` |
| 약한 온천감, 염소 냄새, 명백한 불만 | `negative` |
| 숙박 맥락 또는 온천과 무관한 행 | `neutral` |

주의:

- `signal_tags`만 있고 본문/issue/caution이 없는 후보는 positive로 단정하지 않습니다.
- `booking_confusion`, `temperature_control`, `crowding`은 기본적으로 `mixed`입니다.
- positive-default-only 후보는 DB 직행하지 않습니다.

규슈 예시:

- 3차-B backfill 대상 14곳
- full 14곳
- positive-default-only 13곳은 보류

## 4. Seed 생성 검산

모든 배치에서 아래 검산을 통과해야 합니다.

- `display_name_ko`에 한글이 있음
- 지역 표기가 한국어로 정리됨
- `summary`, `primary_bath`, `operation_notes`, verdict 문구에 금지어 없음
- 금지어: `후기`, `리뷰`, `신호`, `보는 편`, `확인 필요`, `조건 확인`, 단독 `확인 중`
- `full`의 `experiences_read >= 300`
- `full`의 `onsen_related >= 200`
- `full`의 직접 본문 플랫폼 3개 이상
- `full`의 items 3개 이상
- 모든 item의 `platform_count >= 2`
- 모든 item의 `direction_counts`가 숫자
- 모든 item의 `mentions <= denominator`
- unknown signal 없음
- unknown bath area 없음
- 욕장/신호 조합이 호환됨

욕장/신호 조합 예:

| signal | 허용 bath area |
| --- | --- |
| `room_bath_hot_spring` | `room_bath`, `room_open_air_bath` |
| `public_bath_hot_spring` | `public_bath`, `open_air_public_bath`, `facility_wide` |
| `private_bath_experience` | `private_bath`, `family_bath`, `facility_wide` |
| `facility_wide_onsen_experience` | `facility_wide`, `unclear` |

## 5. DB 적용 후 확인

DB 적용 후 아래를 반드시 실행합니다.

```bash
npm run onsen:verdict:check
npm --prefix apps/web run typecheck
```

그리고 적용한 slug를 DB에서 다시 조회합니다.

- 숙소 row 수
- verdict row 수
- missing accommodation
- missing verdict
- bad verdict
- 지역 active 숙소 수
- 전체 published verdict 수
- full/lite 분포

공개 페이지 확인은 캐시 영향을 고려합니다. 검색 결과에 먼저 잡히고 상세 direct path가 늦게 열릴 수 있습니다. 이 경우 `?fresh=1` 또는 `from` query를 붙인 상세 URL과 60초 이후 direct path를 함께 확인합니다.

## 6. 보류 후보 처리

남은 후보는 아래처럼 나눕니다.

| 보류 유형 | 의미 | 다음 작업 |
| --- | --- | --- |
| row-level sample 없음 | 요약/stats 또는 후보 단계만 있음 | 딥리서치 재수집 |
| positive-default-only | 표본은 있으나 방향을 positive로 단정할 근거 부족 | 원문 spot check 또는 sample index 재작성 |
| platform reconciliation 남음 | supplier card/snippet/platform alias 위험 | 플랫폼 단위 재검산 |
| count reconciliation 남음 | 파일 간 직접 수/온천 수 불일치 | `collection_stats`와 sample index 재검산 |
| scope reconciliation 남음 | 숙박/당일입욕/시설 리뷰 혼입 가능 | scope 분리 후 재집계 |

보류 후보를 억지로 lite로 올리지 않습니다. lite는 정보가 적지만 사용자에게 보여도 되는 상태이고, 보류는 아직 사용자 노출 데이터가 아닌 상태입니다.

## 7. 지역 에이전트 작업 프롬프트 골격

다른 지역 에이전트에게는 아래 지시를 붙입니다.

```text
이번 작업은 {region} 숙소 딥리서치 QA 결과를 Bathtime DB seed로 전환하는 작업입니다.

규슈에서 검증한 1차 -> 2차 -> 3차-A -> 3차-B 프로세스를 그대로 적용하세요.

1. QA 매트릭스를 읽고 후보를 `full_verdict_candidate`, `ready_for_db_lite`, `needs_platform_reconciliation`, `needs_count_reconciliation`, `needs_direction_backfill`, `needs_scope_reconciliation`, `not_started_or_candidate_only`로 재확인합니다.
2. 1차는 바로 적재 가능한 full/lite만 seed로 만듭니다.
3. 2차는 방향값이 이미 정상인 platform/count reconciliation 후보만 회수합니다.
4. 3차-A는 명시 방향 컬럼이 80% 이상 채워진 direction backfill 후보만 회수합니다.
5. 3차-B는 본문 또는 issue/caution 태그로 방향을 복원할 수 있는 후보만 별도 backfilled CSV를 만든 뒤 회수합니다.
6. positive-default-only 후보는 DB 직행하지 말고 보류합니다.
7. 원천 CSV는 덮어쓰지 않습니다.
8. seed JSON, SQL, report, audit report를 생성합니다.
9. full 기준과 문구 금지어 검산을 통과한 것만 DB 적용 대상으로 봅니다.
10. DB 적용 후 `npm run onsen:verdict:check`와 `npm --prefix apps/web run typecheck`를 실행합니다.

완료 보고에는 적재 수, full/lite 분포, 남은 보류 후보 수와 보류 유형을 반드시 포함하세요.
```

## 8. 산출물 명명 규칙

권장 파일명:

- `research/onsen-db-seed/{region}_qa_seed_{date}.json`
- `research/onsen-db-seed/{region}_qa_seed_{date}.upsert.sql`
- `research/onsen-db-seed/{region}_qa_seed_report_{date}.md`
- `research/onsen-db-seed/{region}_qa_seed_2nd_{date}.json`
- `research/onsen-db-seed/{region}_qa_seed_3rd_{date}.json`
- `research/onsen-db-seed/{region}_qa_seed_3rd_b_{date}.json`
- `research/onsen-db-seed/{region}_direction_backfill_rules_{date}.md`
- `research/onsen-db-seed/{region}_direction_backfill_result_{date}.md`
- `research/onsen-db-seed/{region}-direction-backfill/{slug}/direct_review_sample_index_direction_backfilled_{date}.csv`

지역별 사정으로 파일명이 달라져도, report에는 입력 파일, 출력 파일, seed 대상 수, 제외 수, 제외 사유를 반드시 남깁니다.
