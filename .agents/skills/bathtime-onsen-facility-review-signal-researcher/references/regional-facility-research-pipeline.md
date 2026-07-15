# 지역별 온천시설 후보·딥리서치 파이프라인

## 목차

1. 목적과 완료 조건
2. 불변 규칙
3. Phase 0: 범위와 소유권 잠금
4. Phase 1: 후보 유니버스 수집
5. Phase 2: 정규화·분류·후보 QA
6. Phase 3: 대표 온천수 프로필과 P0 승격 심사
7. Phase 4: 리뷰풀 잠금
8. Phase 5: 딥리서치 배정과 실행
9. Phase 6: 원장 기반 QA와 재작업
10. Phase 7: P0 판정과 잔여 큐
11. 파일·상태 계약
12. 서브에이전트 프롬프트 계약
13. 완료 체크리스트

## 1. 목적과 완료 조건

이 파이프라인은 한 지역의 시설 후보를 넓게 찾은 뒤, Bathtime 사용자에게 먼저 필요한 시설만 P0로 좁히고, 플랫폼 리뷰풀을 잠근 다음, 시설별 딥리서치와 원장 QA를 거쳐 `P0_ready`, `P0_hold`, `boundary_first`, `exclude_or_hold`로 판정한다.

완료 조건은 다음과 같다.

- 조사 지역과 제외 지역, 다른 작업자의 소유 범위가 기록되어 있다.
- 후보마다 공식명·주소·운영 주체·시설 모델·트랙이 정규화되어 있다.
- P0 후보는 공식 또는 지방자치단체·관광협회 근거와 최소 하나의 리뷰 표면을 가진다.
- 온천수는 기본적으로 시설 대표 프로필이며, 방식 배지는 공식 원문·URL·확인시각·scope가 있을 때만 후보가 된다.
- Google/Nifty/Yahoo visible pool과 직접 읽은 리뷰 수가 분리되어 있다.
- 딥리서치 결과의 모든 직접 리뷰 수가 개별 원장으로 재현된다.
- 최종 QA CSV와 리포트가 P0 승격 또는 hold 이유를 설명한다.

## 2. 불변 규칙

### 2.1 조사 단위

- 시설 데이터의 기본 단위는 사용자가 실제로 방문·결제·이용하는 하나의 시설 또는 명시적 상품이다.
- 공중탕, 노천탕, 사우나, 암반욕, 바데풀, 식당, 휴게실은 기본적으로 하나의 시설 프로필 아래 area 태그로 둔다.
- `route_or_pass`, 여러 시설을 묶은 지역 클러스터, 족욕거리, 가족탕 지구는 딥리서치 전에 개별 시설 또는 사용자 결정 단위로 분리한다.
- 숙박 부속 당일입욕은 료칸 전체 리뷰풀이 아니라 당일입욕 scope를 별도로 고정한다.

### 2.2 온천수 단위

- 기본값은 `facility_representative_profile`이다. 탕 단위 전수 조사는 하지 않는다.
- 다음 경우에만 분리한다.
  - 공식 정보가 욕조별 가케나가시·순환·가수·가온·소독 운용 차이를 명시한다.
  - 숙박자 전용탕과 당일입욕 가능 탕이 다르다.
  - 운반온천·도입수·다른 원천이 섞여 시설 전체 배지가 오해를 만든다.
  - 가족탕·대절탕·모래탕처럼 별도 예약·요금·수원 범위가 사용자 결정에 영향을 준다.
- `天然温泉`, `100%天然温泉`, `100%源泉`은 온천수 사용 근거일 뿐 직수·순환 방식 배지가 아니다.
- 방식 배지 후보에는 `official_water_text_original`, `official_source_url`, `official_source_checked_at`, `water_scope`가 모두 필요하다.

### 2.3 리뷰 증거 단위

- `visible_review_pool`: 플랫폼이 표시한 전체 리뷰 수. 수요와 표본 가능성 지표다.
- `ledger_rows`: 개별 리뷰·부분 카드·맥락 본문을 포함해 원장에 저장한 행 수다.
- `full_body_direct_reviews`: 플랫폼 리뷰 본문을 완전히 읽고 `review_count_eligible=true`로 둔 행 수다.
- `partial_review_rows_excluded`: 말줄임·더보기 미확장·일부 문장만 보인 카드다. 등급 분모에서 제외한다.
- `korean_context_bodies_excluded`: Naver Blog 등 한국어 맥락 본문이다. 수요·기대 차이에만 쓰고 플랫폼 리뷰 수에 넣지 않는다.
- 검색 스니펫, 토픽 칩, AI 요약, 평점 분포는 직접 리뷰가 아니다.

### 2.4 공식 사실과 후기 신호

- 운영시간, 요금, 휴관일, 예약, 문신·연령 규칙, 온천수, 욕장 구성은 공식 사실 표에만 둔다.
- 혼잡, 청결, 물 감촉, 가격 체감, 관광객 기대 차이는 후기 신호다.
- 후기의 `源泉`, `塩素`, `かけ流し` 표현으로 방식 배지를 만들지 않는다.

## 3. Phase 0: 범위와 소유권 잠금

### 입력

- 지역명과 포함 도도부현·시정촌
- 제외 지역과 다른 작업자의 담당 범위
- 기존 후보풀, 딥리서치 완료 목록, 폐관·중복 목록
- 기준 날짜와 타임존

### 작업

1. `region_id`를 영문 소문자·밑줄로 정한다.
2. 포함·제외 지역을 명시한다. 같은 도도부현의 일부 지역만 제외할 수 있다.
3. 다른 작업자가 맡은 slug나 지역은 `ownership_excluded`로 두고 수정하지 않는다.
4. 기존 딥리서치 완료 slug, 재작업 대상, 신규 조사 대상을 분리한다.
5. 출력 루트를 `research/onsen-db-seed/` 아래로 고정한다.

### 게이트

- 소유권이 겹치는 지역은 후보를 추가·승격·삭제하지 않는다.
- 이바라키처럼 행정상 지역에 포함되지만 기존 풀과 소유권이 불명확한 곳은 임의 확장하지 않고 scope note에 남긴다.

## 4. Phase 1: 후보 유니버스 수집

### 소스 순서

1. 지자체·관광협회·공식 운영사 시설 목록
2. Nifty Onsen, Jalan 당일입욕, Rakuten day-use
3. Google Maps, Yahoo Map
4. 4travel, Tripadvisor, Asoview, Sauna Ikitai
5. Naver 검색·블로그·카페와 한국 여행 커뮤니티

한 순위 페이지만으로 후보를 만들지 않는다. 일본어 검색어를 먼저 쓰고 한국어 수요 검색을 별도로 한다.

### 두 트랙

- `traditional_onsen_facility`: 공동탕, 공공탕, 외탕, 상징적 노천탕, 모래·증기탕, 가족·대절탕, 지역문화형 시설
- `spa_complex_super_sento`: 도시형 스파, 슈퍼센토, 사우나·암반욕 복합시설, 온천 테마파크, 심야 휴게형 시설

두 트랙은 평가축이 다르므로 후보 단계에서 분리한다. 전통 시설은 지역 상징성·물성·문화·여행동선, 도시형 시설은 접근·체류상품·사우나·휴식·리뷰풀을 더 크게 본다.

### 후보 원장

`assets/regional-pipeline/candidate_queue_template.csv`를 사용한다. 이 단계의 `direct_reviews_read`는 항상 0이다.

## 5. Phase 2: 정규화·분류·후보 QA

### 정규화 순서

1. 일본어 공식명
2. 공식 주소
3. 운영 주체
4. 한국어 서비스명과 영문·구명·지도 별칭
5. 시설 유형, 모델, archetype, track
6. 폐관·이전·리뉴얼·중복 여부

동일 이름이라도 지점·주소·운영사가 다르면 별도 후보로 둔다. 지도명이 달라도 공식명·주소·운영사가 같으면 중복으로 합친다.

### cleanup 판정

- `keep_facility`: 독립 방문 가능한 구체 시설
- `split_needed`: 한 행에 여러 시설·상품이 섞임
- `route_or_pass`: 공통권·순환 이용권
- `area_cluster`: 지역 리드이지만 단일 시설 아님
- `footbath_only`: 족욕 전용
- `exclude_or_hold`: 폐관, 중복, 비목욕 관광, 공식 정체성 불명

### Tier 판정

- `Tier 1`: 여행 수요 또는 지역 대표성, 명확한 제품 강점, 공식 근거, 충분한 리뷰 표면, 한국 사용자 가치가 함께 있음
- `Tier 2`: 지역 보완 가치가 있으나 리뷰풀·한국 수요·차별성이 중간
- `Tier 3`: 작은 풀, 낮은 접근성, 틈새 상품, 운영 불확실성이 큼
- `hold`: 폐관·중복·scope 오염·공식 정체성 문제가 먼저 해결되어야 함

평점만으로 Tier를 정하지 않는다. `facility_value`와 `onsen_water_eligibility`를 분리해, 사우나 상품은 강하지만 천연온천 근거가 없는 시설이 온천수 P0에 섞이지 않게 한다.

### 후보 QA

- Tier 1마다 authority URL과 map/review URL이 있는지 확인한다.
- Nifty URL은 검색 결과의 시설명과 실제 페이지 제목·주소를 모두 대조한다.
- 운영 종료·리뉴얼 예정·임시휴관은 `operation_recheck`로 분리한다.
- 후보 단계에서 읽은 검색 스니펫은 리뷰 신호로 저장하지 않는다.

## 6. Phase 3: 대표 온천수 프로필과 P0 승격 심사

### 공식 spot-check 필드

- `water_profile_mode`
- `official_water_profile_status`
- `spring_quality_original`
- `official_water_text_original`
- `official_source_url`
- `official_source_checked_at`
- `water_scope`
- `water_method_badge_policy`
- `scope_status`
- `operation_status`

### 상태 예시

- `official_water_profile_locked`
- `official_water_profile_partial_locked`
- `needs_official_water_profile_lock`
- `dayuse_boundary_needed`
- `operation_recheck_before_profile_lock`
- `official_water_use_not_found`
- `closed_or_hold`

### 승격 판정

- `P0_candidate`: 공식 정체성, 목욕 상품, 대표 물 프로필 또는 명확한 물 사용 범위, 리뷰 표면, 사용자 가치가 모두 있음
- `P0_boundary_first`: 당일입욕·숙박, 다중 시설, 욕조별 운영 차이를 먼저 풀어야 함
- `P1_candidate`: 가치가 있으나 리뷰풀·한국 수요·공식 프로필 중 하나가 약함
- `P2/P3`: 지역 보완 또는 저우선 후보
- `exclude_from_onsen_water_p0`: 시설 가치는 있으나 천연온천 대표 프로필이 없거나 인공온천·탄산천·사우나 중심

P1/P2 재심에서는 직접 리뷰를 읽지 않는다. 리뷰풀과 공식 사실만 보강하고 `direct_reviews_read=0`을 유지한다.

## 7. Phase 4: 리뷰풀 잠금

### 최소 플랫폼

- Google Maps
- Nifty Onsen
- Yahoo! Map

Jalan, Asoview, Tripadvisor, 4travel, Sauna Ikitai는 추가 표면이다. 잠금 합계는 기본 세 플랫폼만 계산하고 추가 플랫폼은 별도 필드로 둔다.

### 플랫폼별 절차

1. 공식명·주소·운영 주체를 기준으로 검색한다.
2. 검색 결과 제목만 보지 말고 실제 listing을 연다.
3. `listing_title`, 주소, 평점, visible count, URL, 확인시각을 기록한다.
4. Nifty는 과거 ID 재사용·오매핑을 가정하고 공식명·주소를 다시 대조한다.
5. Google/Naver 동적 표면은 Aside Browser를 사용한다. 숫자가 보이지 않으면 추정하지 않는다.
6. 잠금 중 우연히 보인 리뷰 문구는 직접 읽은 리뷰 수에 넣지 않는다.

### scope 판정

- `locked`: 시설 listing과 사용자 결정 단위가 일치
- `not_locked_scope_mixed_lodging`: 료칸 숙박·객실·식사와 당일입욕이 섞임
- `identity_locked_pool_not_visible`: 정체성은 맞지만 리뷰 수를 읽지 못함
- `title_mismatch_not_locked`: Nifty 등 페이지가 다른 시설

당일입욕을 대표하지 않는 별도 수영장·족욕·부속 listing의 숫자를 대체 풀로 쓰지 않는다.

### 산출물

- `{region_id}_facility_review_pool_lock_{date}.csv`
- `{region_id}_facility_review_pool_lock_report_{date}.md`

CSV는 `assets/regional-pipeline/review_pool_lock_template.csv`를 사용한다.

## 8. Phase 5: 딥리서치 배정과 실행

### 배정 원칙

- 시설 1곳당 서브에이전트 1명과 전용 출력 디렉터리 1개를 배정한다.
- 모델은 사용자가 지정한 경우에만 override한다.
- 공유 마스터 파일은 서브에이전트가 수정하지 않는다.
- scope-sensitive 후보에는 당일입욕·숙박 제외 규칙을 프롬프트에 직접 넣는다.
- Google Maps와 Naver는 후보별 새 Aside 세션을 권장한다. 여러 시설을 한 세션에서 연속 처리하면 timeout과 상태 오염이 늘어난다.

### 표본 설계

- 목표: full-body 직접 리뷰 300건 이상
- 필수 strata: 최신, 1·2점 또는 저평점, 혼잡·대기, 예약·마감, 가격·결제, 청결·어메니티, 접근, 물 감촉, 시설 영역, 한국어
- 첫 100~150건에서 운영 부정 신호가 나오면 플랫폼을 넓힌다.
- Nifty 최신 긍정 한 페이지로 끝내지 않는다.
- 한국어 full review가 없으면 `weak/not_found in checked sources`로 쓰고 부재를 단정하지 않는다.

### 표준 원장

`assets/regional-pipeline/direct_review_ledger_template.csv`를 사용한다.

- `content_type=platform_review`와 `direct_body_status=full`일 때만 `review_count_eligible=true`가 가능하다.
- 짧은 리뷰라도 본문 전체가 보이면 full이다.
- `More`, `続きを読む`, 말줄임이 남으면 partial이다.
- `blog_context`, `activity_post`, `snippet`은 등급 분모에서 제외한다.
- 중복 키는 플랫폼 review ID를 우선하고, 없으면 플랫폼+작성자+날짜+정규화 본문 fingerprint를 사용한다.
- 긴 원문은 저장하지 않고 짧은 paraphrase와 짧은 원문 키워드만 보존한다.

### 시설별 필수 산출물

```text
deepresearch/{region_id}_{date}/{candidate_slug}/
  {candidate_slug}_facility_platform_mapping_{date}.json
  {candidate_slug}_direct_review_sample_index_{date}.csv
  {candidate_slug}_facility_review_signal_rows_{date}.csv
  {candidate_slug}_facility_review_signal_summary_{date}.md
```

네 파일 중 하나라도 없으면 QA 접수 전 상태는 `incomplete_artifact_set`이다.

## 9. Phase 6: 원장 기반 QA와 재작업

### QA 순서

1. 네 파일 존재와 JSON/CSV 파싱을 확인한다.
2. 보고서의 raw·deduped·facility-related·day-use 합계를 원장 행으로 재계산한다.
3. review ID 또는 dedupe key의 유일성을 확인한다.
4. full, partial, blog context, activity post, snippet을 분리한다.
5. 플랫폼별 full-body 수와 저평점·최신·시설영역 strata를 확인한다.
6. visible pool 합계가 직접 리뷰 합계에 섞이지 않았는지 확인한다.
7. signal mention 수가 적격 원장 행에서 재현되는지 표본 검산한다.
8. 방식 배지가 공식 원문·URL·시각·scope를 갖췄는지 확인한다.
9. scope와 operation readiness를 별도 판정한다.

### 재작업 규칙

- 집계가 원장보다 크면 실제 개별 행을 추가하거나 집계를 원장 수로 낮춘다. 새 리뷰를 지어내지 않는다.
- 집계형 10행으로 172건을 주장하는 결과는 10행만 검증 가능하다.
- partial 카드는 원장에는 남길 수 있지만 full-body 등급 분모에서 뺀다.
- Naver Blog·한국어 포스트는 맥락으로 남기되 platform-review 합계에서 뺀다.
- 숙박 부속 당일입욕은 `dayuse_only_direct_reviews`를 사용자 결정 분모로 쓴다.
- 운영시간·청소·셔틀 변동은 `needs_operation_recheck`이며 scope split 이유가 아니다.
- 동일 blocking 사유로 재작업이 반복되면 숫자를 낮춘 결과를 수용하고 보강 큐로 돌린다.

### 엄격 등급

| grade | full-body 적격 리뷰 |
|---|---:|
| A | 300+ 및 3개 이상 플랫폼, 최신·저평점 층화 |
| B | 100~299 및 2개 이상 플랫폼 |
| C | 50~99 |
| D | 50 미만, 단일 플랫폼, 또는 snippet-heavy |

플랫폼 수와 층화가 부족하면 수량 기준보다 한 단계 낮출 수 있다. 수량 기준보다 높일 수는 없다.

### P0 게이트

- A/B full-body 근거
- 정체성과 리뷰풀 잠금 완료
- 안정된 시설 scope 또는 명시적 day-use scope
- 대표 온천수 프로필 또는 사용자에게 오해 없는 `water_use_not_found` 처리
- 공식 운영 재확인만 남은 경우 `P0_ready_after_operation_recheck` 가능
- C/D는 `P0_hold_review_reinforcement`
- 숙박 혼합 day-use D는 `P0_hold_dayuse_scope_reinforcement`

## 10. Phase 7: P0 판정과 잔여 큐

최종 마스터는 `assets/regional-pipeline/deepresearch_qa_template.csv`를 사용한다.

필수 결과는 다음 세 묶음이다.

1. `P0_ready_after_operation_recheck`: 리뷰 증거는 충분하고 변동 운영만 최신 확인 필요
2. `P0_hold_review_reinforcement`: scope는 안정적이나 C/D
3. `P0_hold_dayuse_scope_reinforcement`: 숙박 혼합·당일입욕 분모 부족

추가로 다음 큐를 남긴다.

- 운영 재확인 큐
- 공식 수질·분석표 큐
- Nifty/Google/Yahoo identity 재매핑 큐
- 한국어 full-body 보강 큐
- P1/P2 재심 큐

원본 후보풀은 자동 덮어쓰지 않는다. 최종 QA를 확인한 뒤 별도 seed 또는 마스터 업데이트 단계에서 반영한다.

## 11. 파일·상태 계약

### 파일명

```text
{region_id}_facility_candidate_queue_{date}.csv
{region_id}_facility_candidate_report_{date}.md
{region_id}_facility_official_water_spotcheck_{date}.csv
{region_id}_facility_review_pool_lock_{date}.csv
{region_id}_facility_review_pool_lock_report_{date}.md
{region_id}_facility_deepresearch_assignment_manifest_{date}.csv
{region_id}_facility_deepresearch_runtime_manifest_{date}.csv
{region_id}_facility_deepresearch_qa_{date}.csv
{region_id}_facility_deepresearch_qa_report_{date}.md
```

### 런타임 상태

- `queued`
- `running`
- `completed_pending_qa`
- `qa_rework_requested`
- `qa_accepted`
- `qa_accepted_with_caveat`
- `incomplete_artifact_set`
- `blocked_external_access`

## 12. 서브에이전트 프롬프트 계약

배정 프롬프트에는 다음을 모두 넣는다.

```text
시설: {official_name} / {candidate_slug}
공식명·주소·공식 URL: {identity}
잠긴 리뷰풀: Google {g}, Nifty {n}, Yahoo {y}; visible pool이며 직접 리뷰 수가 아님
scope contract: {scope_contract}
물 프로필 원칙: 시설 대표 프로필, 공식적으로 갈릴 때만 분리
방식 배지: 공식 원문+URL+확인시각+scope 없으면 없음
목표: full-body 직접 리뷰 300+, 최신·저평점·운영 부정·시설영역·한국어 층화
동적 소스: Google/Naver는 새 Aside 세션, 실패 시 새 세션 1회 재시도
금지: snippet/chip/AI summary/blog context를 direct review에 포함, visible pool 합산, 원장 없는 집계
필수 산출물: mapping JSON, individual review ledger CSV, signal CSV, Korean summary MD
집계: raw, deduped, facility-related, day-use, lodging-only, partial, context, excluded, platform counts
```

## 13. 완료 체크리스트

- [ ] 조사 범위·제외 지역·소유권이 기록됨
- [ ] 후보 두 트랙과 cleanup 상태가 채워짐
- [ ] Tier 1/P0마다 authority URL과 review URL이 있음
- [ ] 폐관·리뉴얼·오매핑이 후보 QA에 반영됨
- [ ] 대표 온천수 프로필과 예외 scope가 기록됨
- [ ] `天然温泉`·`100%`를 방식 배지로 쓰지 않음
- [ ] Google/Nifty/Yahoo listing 제목·주소·확인시각을 잠금
- [ ] review-pool lock 단계의 `direct_reviews_read=0`
- [ ] 시설별 네 파일과 개별 원장이 존재함
- [ ] full/partial/context/snippet이 분리됨
- [ ] 숙박 혼합 후보는 day-use 분모로 판정됨
- [ ] 등급이 300/100/50 기준과 플랫폼 조건을 충족함
- [ ] C/D는 P0로 승격되지 않음
- [ ] 마스터 QA validator가 통과함
- [ ] 남은 operation·water·mapping·Korean 보강 큐가 기록됨
