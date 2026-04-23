# ë°°ì°íì v3.10.2 Jira Execution Backlog (Epic/Story/AC)

버전: v1.0  
기준 문서:
- `/Users/exem/DK/BathSommelier/docs/PRD_CURRENT.md` (v3.10.2)
- `/Users/exem/DK/BathSommelier/docs/POLICY_APPENDIX.md` (v1.1)
- `/Users/exem/DK/BathSommelier/docs/ANALYTICS_APPENDIX.md` (v1.1)
- `/Users/exem/DK/BathSommelier/docs/CONFIG_APPENDIX.md` (v1.1)

## Summary
PRD v3.10.2 + Appendix v1.1 기준 개발 착수용 백로그.  
원칙: `Contract-first -> Measurement-first -> Safety-first`

## Important Changes to Public APIs / Interfaces / Types
- 필수 계약 구현 범위 고정:
  - `HomeOrchestrationContract`
  - `EngineSelector`
  - `ModeProtocol` + `ResetRiskGate`
  - `ProductProfile` + `ProductRecommendationPolicy`
  - `Analytics common_properties` + `commerce_properties`
- 부록 단일 소스 정책:
  - 정책 룰: `/Users/exem/DK/BathSommelier/docs/POLICY_APPENDIX.md`
  - 이벤트 스키마: `/Users/exem/DK/BathSommelier/docs/ANALYTICS_APPENDIX.md`
  - 기본값/가드레일: `/Users/exem/DK/BathSommelier/docs/CONFIG_APPENDIX.md`

## Epic E0 - Contract & Compliance Foundation
Goal: 팀 구현 편차 제거 + 출시 불가 리스크(안전/법무) 선차단

### Story E0-S1 - PRD 계약 타입 선언
Acceptance Criteria:
- PRD 계약 필드와 코드 타입 1:1 매핑 (필드 누락 0)
- `HomeOrchestrationContract`, `EngineSelector`, `ProductProfile`, `ModeProtocol` 포함
- 런타임 검증 실패 시 조용한 fallback 없이 에러 로깅

### Story E0-S2 - Legal Disclaimer 상시 노출
Acceptance Criteria:
- 설정/레시피 화면에 동일 고정 문구 노출
- 문구 축약/변형 금지
- 스크린샷 QA 체크리스트 통과

### Story E0-S3 - Copy Safety Gate
Acceptance Criteria:
- 금지 카피(치료/개선 단정) 검출 규칙 정의
- 추천/제품/Trip 서사 카피 점검 플로우 적용
- 릴리즈 체크리스트에 "카피 위반 0건" 항목 추가

## Epic E1 - Onboarding & Intake
Goal: 최소 입력으로 상태/안전/환경 확보

### Story E1-S1 - 경량 온보딩(2~3문항)
Acceptance Criteria:
- 온보딩 완료 경로가 30초 내 완료 가능
- `onboarding_variant_exposed`, `onboarding_completed` 이벤트 기록
- `questions_count` 속성 포함

### Story E1-S2 - Today Signal + 안전 입력
Acceptance Criteria:
- `active_state` 5값 중 1개는 항상 저장
- 건강 입력은 optional + safety reason 설명 표시
- `health_input_prompt_seen`, `health_input_submitted_optional` 기록

### Story E1-S3 - 환경 정규화
Acceptance Criteria:
- `partial_bath_subtype` 저장(`low_leg|footbath`)
- legacy `footbath` 직접값 금지
- `environment` + `partial_bath_subtype`가 모든 추천 이벤트에 포함

## Epic E2 - EngineSelector Policy Implementation
Goal: 정책 단일 소스 기반의 일관된 추천 모드 선택

### Story E2-S1 - 상태->모드 기본 매핑 구현
Acceptance Criteria:
- `cant_sleep->sleep`, `want_reset->reset`, `heavy->recovery`, `tension->recovery`, `low_mood->recovery`
- 룰은 부록 v1.1과 완전 일치
- 단위테스트로 5케이스 통과

### Story E2-S2 - 시간 오버라이드 구현
Acceptance Criteria:
- `late_night & !want_reset -> sleep` 적용
- `morning & cant_sleep -> recovery` 적용
- `day/evening & tension -> recovery` 적용

### Story E2-S3 - Priority Resolution + fallback 전략
Acceptance Criteria:
- 우선순위 `Safety > Active state > Time override > Preference > Trip overlay` 적용
- fallback 4종(`DEFAULT_STARTER_RITUAL`, `SAFE_ROUTINE_ONLY`, `RESET_WITHOUT_COLD`, `ROUTINE_ONLY_NO_COMMERCE`) 구현
- `fallback_strategy_applied` 이벤트 속성 기록

## Epic E3 - CareEngine + Safety Gate
Goal: 3모드 프로토콜 생성과 안전 오버라이드 보장

### Story E3-S1 - ModeProtocol 계산
Acceptance Criteria:
- sleep/reset/recovery 프로토콜이 temp/duration/lighting/scent/audio 반환
- Reset 기본은 `non_cold_activation`
- `mode_protocol_applied` 기록

### Story E3-S2 - 안전 오버라이드
Acceptance Criteria:
- high risk에서 temp cap/환경 강제 하향
- reset 금기군에서 냉수 단계 완전 비노출
- `mode_protocol_overridden_by_safety` 기록

### Story E3-S3 - Default/Safe 루틴 적용
Acceptance Criteria:
- data sparse 시 `default_starter_ritual` 적용
- high risk 시 `safe_routine_only` 적용
- CONFIG Appendix 값과 런타임 값 일치

## Epic E4 - Home Orchestration Surface
Goal: 사용자에게 단일 의사결정 UX 제공

### Story E4-S1 - Home 계약 필드 전부 표시
Acceptance Criteria:
- `today_signal`, `primary`, `secondary<=2`, `quick_actions`, `insight_strip`, `fallback_strategy` 반영
- Home에서 Care/Trip 직접 선택 UI 없음
- Primary 1개만 노출 규칙 유지

### Story E4-S2 - Primary/Secondary 배치 정책
Acceptance Criteria:
- 기본은 `CARE_PRIMARY__TRIP_SECONDARY`
- `low_mood|want_reset`일 때 Trip secondary 우선 배치
- shower는 Trip Lite, bathtub/partial은 Trip Deep 허용

### Story E4-S3 - 추천 카드 퍼널 이벤트
Acceptance Criteria:
- `recommendation_card_impression`, `recommendation_card_click` 기록
- `suggestion_id`, `suggestion_rank`, `engine_source` 포함
- CTR 분모/분자 집계 가능

## Epic E5 - Explanation Contract & Detail
Goal: 추천 납득도 상승(Why/목표/대안)

### Story E5-S1 - Explanation Contract 렌더링
Acceptance Criteria:
- `state_label`, `why_summary`, `routine_params`, `expected_goal`, `alternative_routine` 모두 노출
- Why 문구는 카피 정책 준수
- 누락 필드 시 화면 에러 대신 안전 fallback 문구

### Story E5-S2 - Why->시작 전환 퍼널
Acceptance Criteria:
- `why_explainer_exposed`, `routine_started_after_why` 기록
- recommendation detail에서 루틴 시작 CTA 1탭 진입
- 시작 실패 시 사용자 에러 메시지 + 재시도 제공

## Epic E6 - Routine Execution (Prep->Run->Finish)
Goal: 실행 퍼널 완성 및 완료 데이터 확보

### Story E6-S1 - 3단계 루틴 실행
Acceptance Criteria:
- `prep -> immerse/shower -> finish` 단계 전환 동작
- 모든 모드에서 `Stop` 버튼 상시 노출
- safe_routine_only에서도 동일 UX 규칙 유지

### Story E6-S2 - 완료/메모리 저장
Acceptance Criteria:
- `routine_start`, `routine_complete` 기록
- completion snapshot 생성
- history 조회 시 completion 데이터 표시

## Epic E7 - Product Matching (Care Commerce)
Goal: 환경-안전-스코어-슬롯 파이프라인 고정

### Story E7-S1 - 환경 호환 필터
Acceptance Criteria:
- `filter_by_environment`가 1차 게이트
- shower에서 bath 전용 카테고리 제외
- partial_bath는 bathtub 호환군 처리

### Story E7-S2 - 스코어링 + 슬롯 구성
Acceptance Criteria:
- 가중치 `0.4/0.3/0.2/0.1` 고정
- Sleep 슬롯 `A=bicarbonate`, Recovery 슬롯 `A=magnesium`, Recovery 슬롯 `C=bicarbonate/value`
- 저/중/고 가격대 분산 유지

### Story E7-S3 - 제품 이벤트
Acceptance Criteria:
- `product_detail_view`, `affiliate_link_click`, `sommelier_pick_click` 기록
- `product_id`, `slot`, `price_tier`, `sommelier_pick` 필수
- 누락 속성 이벤트는 KPI 집계 제외

## Epic E8 - TripEngine MVP (Secondary-first)
Goal: Home 결정 피로를 늘리지 않는 몰입 보조 엔진

### Story E8-S1 - Trip Lite/Deep 분기
Acceptance Criteria:
- shower 기본 Lite, bathtub/partial Deep 허용
- override 정책 적용 가능
- `trip_theme_selected`, `trip_immersion_started` 기록

### Story E8-S2 - Narrative/Immersion
Acceptance Criteria:
- Trip detail에 narrative 1~2문장 고정
- Trip 카피에서 의료/생리 단정 용어 금지
- `trip_narrative_engaged` 기록

### Story E8-S3 - Trip 커머스 경계
Acceptance Criteria:
- TripCommerceBundle은 Section 24 스코어링 미사용
- Trip CTA는 테마형 카피 사용
- ProductHub는 supporting layer로만 노출

## Epic E9 - Analytics & Experimentation
Goal: 가설 6개 검증 가능한 데이터 체계 완성

### Story E9-S1 - 공통 이벤트 스키마 강제
Acceptance Criteria:
- `common_properties` 15개 필수 키 적용
- 누락 이벤트는 ingestion 단계에서 reject 또는 quarantine
- schema version 관리

### Story E9-S2 - KPI 대시보드
Acceptance Criteria:
- environment/mode/risk/onboarding variant/fallback 기준 분해
- recommendation->start->complete->revisit 퍼널 확인 가능
- commerce CTR/전환/Pick 점유율 확인 가능

### Story E9-S3 - 실험 프레임
Acceptance Criteria:
- 1탭 vs 2~3문항 온보딩 실험
- Why 노출 vs 미노출 실험
- 3슬롯+Pick vs 1개+깊은설명 실험

## Epic E10 - QA Safety Matrix & Release Gate
Goal: 사고 리스크 0에 가깝게 관리

### Story E10-S1 - 금기군 테스트 매트릭스 자동화
Acceptance Criteria:
- cold contraindication에서 냉수 CTA 노출 0%
- fall risk에서 safe routine 강제
- orthostatic/hypertension 오버라이드 규칙 통과
- 8 페르소나 시나리오 회귀 테스트(`scenario.test.ts`)가 기본 테스트에서 항상 통과

### Story E10-S2 - 릴리즈 게이트 운영
Acceptance Criteria:
- legal disclaimer 상시 노출 체크
- 카피 정책 위반 0건
- 핵심 이벤트(온보딩 완료/추천 노출/시작/완료/재방문) 수집 확인

## Cross-Epic Dependencies
- E0 완료 후 E1/E2 병행
- E2/E3 완료 후 E4/E5
- E5 완료 후 E6
- E3 완료 후 E7, E4 완료 후 E8
- E7/E8 완료 후 E9
- E10은 전 단계 전부를 릴리즈 게이트로 검증

## Test Cases & Scenarios
1. Contract integrity: PRD 계약 필드와 구현 타입 불일치 0건
2. Safety precedence: 개인화/커머스보다 safety override가 항상 우선
3. Engine consistency: 동일 입력에서 EngineSelector 결과 재현성 100%
4. Funnel continuity: Home->Detail->Start->Complete 경로 단절률 0%
5. Analytics completeness: 필수 이벤트의 필수 속성 누락률 0%
6. Commerce boundary: ProductHub가 primary entry로 노출되지 않음

## Assumptions & Defaults
1. PMF 1단계에서 Reset 기본은 `non_cold_activation` 유지
2. 건강 입력은 optional이며 미입력 시 safe fallback 적용
3. Home은 엔진 선택 UI를 제공하지 않음
4. PRD 본문과 부록 충돌 시 부록 값을 실행 단일 소스로 우선
5. 이번 백로그는 문서 기준이며 구현 중 변경 발생 시 PRD/부록 동시 갱신
