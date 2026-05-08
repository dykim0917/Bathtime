# ë°°ì°íì v3.10.2 Wireframe Spec

WireframeSpecVersion: `v3.10.2`

기준 문서:
- PRD: `/Users/exem/DK/BathSommelier/docs/PRD_CURRENT.md` (v3.10.2)
- Policy: `/Users/exem/DK/BathSommelier/docs/POLICY_APPENDIX.md` (v1.1)
- Analytics: `/Users/exem/DK/BathSommelier/docs/ANALYTICS_APPENDIX.md` (v1.1)
- Config: `/Users/exem/DK/BathSommelier/docs/CONFIG_APPENDIX.md` (v1.1)

## 1) IA & Layer Rules

핵심 규칙:
- Home은 엔진 선택 UI가 아니다.
- Home은 EngineSelector 결과를 표시하는 decision simplification layer다.
- 사용자는 Care/Trip를 강제 선택하지 않는다.
- ProductHub는 supporting commerce layer이며 primary entry point가 아니다.
- Safety가 모든 추천/개인화/커머스보다 우선한다.

구조:
```txt
User
↓
Home (Orchestration Layer)
↓
EngineSelector (internal policy layer)
↓
CareEngine | TripEngine
↓
ProductHub (supporting commerce)
```

## 2) ScreenSpec Contract v3.10.2

```txt
ScreenSpec {
  id
  goal
  primary_user_job
  entry
  exit
  states
  components
  fallback_strategy
  priority_resolution_path
  analytics_events_required
  story_links
}
```

## 3) State Model

공통 상태 키:
- `default`
- `data_sparse`
- `high_risk_safe_only`
- `late_night_sleep_priority`
- `engine_conflict_resolved`
- `empty_history`
- `offline_or_asset_fail`
- `reset_without_cold`
- `routine_only_no_commerce`
- `why_hidden_ab_variant`
- `onboarding_1tap_variant`

## 4) Event/Experiment Annotation Rules

모든 화면의 Decision Notes에는 아래를 포함한다.
- EngineSelector path
- Fallback key
- Required events

모든 핵심 이벤트 공통 속성 체크:
- `user_id`
- `session_id`
- `app_version`
- `locale`
- `time_context`
- `environment`
- `partial_bath_subtype`
- `active_state`
- `mode_type`
- `suggestion_id`
- `suggestion_rank`
- `fallback_strategy_applied`
- `experiment_id`
- `variant`
- `ts`

A/B 실험 표기:
- `W01-A`: onboarding 1tap variant
- `W01-B`: onboarding 2-3 questions variant
- `W07-A`: why shown
- `W07-B`: why hidden

## 5) Wireframe Screen Set (W01~W18)

### W01 Home default
- goal: 오늘의 primary 1개 + secondary 최대 2개 제시
- states: `default`
- components:
  - Today Signal
  - Primary Suggestion
  - Secondary Suggestions (<=2)
  - Quick Actions
  - Insight Strip
- fallback_strategy: `none`
- priority_resolution_path: `Safety > Active > Time > Preference > Trip overlay`
- analytics_events_required:
  - `recommendation_card_impression`
  - `recommendation_card_click`
- story_links: `E4-S1`, `E4-S2`, `E4-S3`

### W02 Home fallback - data sparse
- goal: 데이터 부족 시 안전한 스타터 루틴으로 즉시 시작
- states: `data_sparse`
- components:
  - Default Starter Ritual card
  - 보조 입력 유도 문구
- fallback_strategy: `DEFAULT_STARTER_RITUAL`
- analytics_events_required:
  - `recommendation_card_impression`
  - `routine_start`
- story_links: `E2-S3`, `E3-S3`, `E4-S1`

### W03 Home fallback - high risk safe only
- goal: 고위험군에서 Safe Routine Only 강제
- states: `high_risk_safe_only`
- components:
  - Safety priority banner
  - safe routine cards
  - legal disclaimer sticky
- fallback_strategy: `SAFE_ROUTINE_ONLY`
- analytics_events_required:
  - `recommendation_card_impression`
  - `routine_start`
- story_links: `E2-S3`, `E3-S2`, `E3-S3`, `E10-S1`

### W04 Home fallback - late night sleep priority
- goal: 심야 컨텍스트에서 sleep 우선 제안
- states: `late_night_sleep_priority`
- components:
  - time-aware badge
  - sleep primary + trip secondary ambience
- fallback_strategy: `none`
- analytics_events_required:
  - `recommendation_card_impression`
  - `recommendation_card_click`
- story_links: `E2-S2`, `E4-S2`

### W05 Home fallback - reset contraindication
- goal: reset 요청이지만 금기군인 경우 냉수 경로 완전 차단
- states: `reset_without_cold`
- components:
  - non-cold activation routine card
  - cold CTA hidden state
- fallback_strategy: `RESET_WITHOUT_COLD`
- analytics_events_required:
  - `recommendation_card_impression`
  - `routine_start`
- story_links: `E2-S3`, `E3-S2`, `E10-S1`

### W06 Home fallback - no product candidates
- goal: 커머스 후보 부족 시 루틴 실행 경로 유지
- states: `routine_only_no_commerce`
- components:
  - routine-only module
  - hidden product block placeholder
- fallback_strategy: `ROUTINE_ONLY_NO_COMMERCE`
- analytics_events_required:
  - `recommendation_card_click`
  - `routine_start`
- story_links: `E2-S3`, `E7-S1`

### W07 Care suggestion detail (Why/Goal/Alternative)
- goal: 납득 가능한 설명 후 실행 전환
- states: `default`, `why_hidden_ab_variant`
- components:
  - `state_label`
  - `why_summary`
  - `routine_params`
  - `expected_goal`
  - `alternative_routine`
  - Start CTA
- fallback_strategy: `none`
- analytics_events_required:
  - `why_explainer_exposed`
  - `routine_started_after_why`
- story_links: `E5-S1`, `E5-S2`

### W08 Trip suggestion detail (Narrative/Atmosphere)
- goal: narrative 중심 몰입 진입
- states: `default`
- components:
  - narrative headline
  - atmosphere chips(sound/light/water)
  - trip CTA
- fallback_strategy: `none`
- analytics_events_required:
  - `trip_narrative_engaged`
  - `recommendation_card_click`
- story_links: `E8-S2`, `E8-S3`

### W09 Product matching result (A/B/C slots)
- goal: 환경 필터 + 안전 필터 + 슬롯 규칙 충족 추천
- states: `default`
- components:
  - environment compatibility legend
  - slot A/B/C cards
  - Care/Trip 분기 라벨
- fallback_strategy: `none`
- analytics_events_required:
  - `product_detail_view`
  - `sommelier_pick_click`
- story_links: `E7-S1`, `E7-S2`, `E7-S3`

### W10 ProductHub (supporting layer)
- goal: 루틴 중심 탐색 허브
- states: `default`
- components:
  - mode/theme/starter/seasonal collections
  - supporting layer fixed copy
- fallback_strategy: `none`
- analytics_events_required:
  - `recommendation_card_click`
- story_links: `E8-S3`

### W11 Product detail (Care mechanism variant)
- goal: 기전 기반 설명 + 구매 전 확신
- states: `default`
- components:
  - mechanism highlight box
  - environment fit badge
  - affiliate CTA
- fallback_strategy: `none`
- analytics_events_required:
  - `product_detail_view`
  - `affiliate_link_click`
- story_links: `E7-S3`

### W12 Product detail (Trip bundle variant)
- goal: 감성 번들 맥락 기반 선택
- states: `default`
- components:
  - narrative prop context
  - theme bundle CTA
- fallback_strategy: `none`
- analytics_events_required:
  - `product_detail_view`
  - `affiliate_link_click`
- story_links: `E8-S3`

### W13 Routine prep
- goal: 실행 전 준비 단계 완료
- states: `default`
- components:
  - prep checklist
  - next CTA
- fallback_strategy: `none`
- analytics_events_required:
  - `routine_start`
- story_links: `E6-S1`

### W14 Routine run (timer)
- goal: 실행 중 이탈 최소화
- states: `default`
- components:
  - timer core
  - shower shallow vs bath deep branch
  - stop button (always)
- fallback_strategy: `none`
- analytics_events_required:
  - `routine_start`
- story_links: `E6-S1`, `E10-S1`

### W15 Routine finish + stop-safe pattern
- goal: 안전 종료 및 다음 단계 전환
- states: `default`
- components:
  - finish summary
  - safety stop pattern
- fallback_strategy: `none`
- analytics_events_required:
  - `routine_complete`
- story_links: `E6-S1`, `E6-S2`

### W16 Completion + memory contract
- goal: 완료 기록 + memory 저장
- states: `default`
- components:
  - completion snapshot
  - theme_preference_weight feedback
  - narrative_recall_card
- fallback_strategy: `none`
- analytics_events_required:
  - `routine_complete`
  - `personalization_message_exposed`
- story_links: `E6-S2`, `E9-S1`

### W17 History + insight expanded
- goal: 회고 및 재진입 경로 제공
- states: `default`, `empty_history`
- components:
  - timeline
  - insight details
- fallback_strategy: `none`
- analytics_events_required:
  - `revisit_within_7d`
- story_links: `E6-S2`, `E9-S2`

### W18 Persistent legal/safety disclosure overlay set
- goal: 모든 핵심 화면 공통 legal/safety 고정 노출
- states: `default`, `offline_or_asset_fail`
- components:
  - legal disclaimer
  - safety warning
  - offline fallback copy
- fallback_strategy: `none`
- analytics_events_required:
  - `recommendation_card_impression`
- story_links: `E0-S2`, `E10-S2`

## 6) Interaction Flow Mapping

1. User -> W01
2. W01 -> W07 or W08
3. W07/W08 -> W09 or W10
4. W09/W10 -> W11/W12 -> W13
5. W13 -> W14 -> W15 -> W16
6. W16 -> W01 or W17
7. W18은 전체 퍼널에서 persistent overlay로 동작

## 7) Figma Composition Spec

페이지:
- `v3.10.2 Wireframes`

섹션:
- `A. Home & Fallback` (W01~W06)
- `B. Suggestion Surfaces` (W07~W08)
- `C. Commerce Surfaces` (W09~W12)
- `D. Routine Flow` (W13~W16)
- `E. Completion/History/Legal` (W17~W18)

프레임 규격:
- Device: iPhone 390x844
- Grid: 8pt
- Naming:
  - `WFv3102/Home/W01` ... `WFv3102/Legal/W18`

주석 레이어:
- 각 프레임 오른쪽 `Decision Notes`
- 고정 항목:
  - EngineSelector path
  - fallback key
  - required events

실험 프레임 복제:
- `W01-A` onboarding 1tap
- `W01-B` onboarding 2-3 questions
- `W07-A` why shown
- `W07-B` why hidden

## 9) QA Checklist

구조:
- 18개 프레임이 IA 흐름과 일치
- Home이 엔진 선택 UI로 보이지 않음

fallback:
- 4개 fallback 독립 프레임 반영
- `ROUTINE_ONLY_NO_COMMERCE`에서 커머스 숨김 처리

분석:
- 핵심 화면에 required events + required properties 주석 존재
- A/B 실험 프레임 구분 존재

경계:
- TripCommerceBundle과 Care scoring 분리 표현
- ProductHub supporting layer 원칙 유지

안전/법적:
- legal disclaimer persistent 설계
- reset 금기군에서 cold CTA 비노출
