# PRD — ë°°ì°íì v3.11.0 (Current State Baseline + Patch Roadmap)

버전: v3.11.0 (Current State Baseline + Patch Roadmap)
기준일: 2026-02-27
문서 목적: v3.10.2(목표형 스펙)에서 v3.11.0(현재 구현 기준선)으로 업데이트. Phase 1~4 UI 리디자인 완료 상태를 공식 기준선으로 확정하고, 이후 패치 계획을 동일 문서 내에서 관리한다. 기존 섹션 1~29의 목표형 스펙 내용은 그대로 유지한다.
알고리즘 세부 분기 초안(RFC): `/Users/exem/DK/BathSommelier/docs/ALGO_CARE_BRANCHING_RFC.md` (UI 미반영, 충돌 검토 전용)

---

## 0. 구현 현황 스냅샷 — v3.11.0 기준

> 이 섹션은 현재 **실제 구현 완료 상태**를 추적한다. 섹션 1~29의 목표 스펙과 대조용으로 사용한다.

| 영역 | 상태 | 비고 |
|------|------|------|
| 핵심 추천 알고리즘 (Care/Trip/Safety) | ✅ 완료 | 49개 단위 테스트 통과 |
| 온보딩 플로우 | ✅ 완료 | 생활형 셀프케어 가이드, Phase 1 |
| 홈 탭 오케스트레이션 | 🟡 부분 완료 | Care 8종 중 4종 구현(근육통·부종·숙취·불면), 신규 4종(감기·생리통·스트레스·우울) 미구현 |
| 레시피 상세 화면 | ✅ 완료 | 히어로 그래디언트 + 트랙 리스트, Phase 3-1 |
| 타이머 화면 | ✅ 완료 | 원형 재생 버튼 + 프로그레스 바, Phase 3-2 |
| 히스토리 탭 | ✅ 완료 | 2열 그리드 + 필터 pill + 인사이트 배너, Phase 4 |
| 완료 화면 | 🟡 구현됨 | 리디자인 미적용, 피드백/메모리 카드 동작 중 |
| 설정 탭 | 🟡 구현됨 | 리디자인 미적용, 프로필 재설정 가능 |
| 오디오 시스템 | 🟡 구조 완성 | 기본 로컬 오디오 번들 연결, 실제 소스 교체 가능 |
| 커머스/ProductHub | 🟡 부분 구현 | ProductMatchingModal 컴포넌트 존재, 실 데이터 미연결 |
| 리텐션 루프 (주간 리포트) | ❌ 미구현 | 섹션 10 참조 |
| Analytics 이벤트 전송 | 🟡 스키마 정의됨 | 실제 전송 미구현, 구조만 준비 |
| Skia 수면 애니메이션 | 🟡 컴포넌트 존재 | WaterAnimation.tsx 구현됨, 화면 연결 미완 |

---

## 0-B. UI 디자인 시스템 현황

> Phase 1~4에서 확립된 디자인 언어. v3.11.0부터 공식 기준.

- **디자인 레퍼런스**: Everyday Bath Guide
- **디자인 시스템 규칙**: `/CLAUDE.md` (컴포넌트 컨벤션, 토큰 사용 규칙)
- **색상/타이포그래피 토큰**: `src/data/colors.ts` (28개 토큰)
- **공유 StyleSheet 네임스페이스**: `src/theme/ui.ts` (`ui.*`)

**핵심 패턴:**
| 패턴 | 구현 방식 |
|------|----------|
| 히어로 영역 | `LinearGradient` (colorHex + `borderBottomLeftRadius: 30, borderBottomRightRadius: 30`) |
| 카드 표면 | `CARD_SURFACE` + `CARD_BORDER` (glass-morphism) |
| 대형 CTA 버튼 | `borderRadius: 38, height: 63` (풀폭 pill) |
| 소형 pill 버튼 | `borderRadius: 999` |
| 애니메이션 | `react-native-reanimated v4` |
| 그라데이션 배경 | `expo-linear-gradient` |
| 아이콘 | `@expo/vector-icons` (FontAwesome) |
| 햅틱 | `useHaptic` hook (`src/hooks/useHaptic.ts`) |

**Figma 화면 → 코드 매핑:**
| Figma Node | 화면명 | 구현 파일 |
|---|---|---|
| 4452-6371 | Welcome Landing | `app/onboarding/welcome.tsx` |
| 4452-6190 | Welcome Greeting | `app/onboarding/greeting.tsx` |
| 4452-6318 | Sign Up (스타일 참고) | `app/onboarding/index.tsx`, `health.tsx` |
| 4452-4318 | Topic Selection | `app/(tabs)/index.tsx` (CategoryCard 그리드) |
| 4452-2712 | Home Screen | `app/(tabs)/index.tsx` (전체 레이아웃) |
| 4452-4172 | Course Detail | `app/result/recipe/[id].tsx` |
| 4452-6688 | Player | `app/result/timer/[id].tsx` |
| 4452-3902 | Meditate/Browse | `app/(tabs)/history.tsx` |

---

## 1. 제품 핵심가치
바스타임의 핵심은 다음 한 문장으로 정의한다.

**"오늘 상태와 환경에 맞춰 무리 없이 따라할 목욕·샤워 루틴을 안내한다."**

모든 입력, 추천, 실행, 피드백, 리텐션, 커머스 기능은 이 원칙을 기준으로 설계한다.

## 2. 제품 목표
- 시장성 검증을 기능 확장보다 우선한다 (PMF 신호: 시작률/완료율/7일 재방문).
- 사용자 상태를 짧은 입력으로 파악하고 맞춤 루틴을 제시한다.
- 추천 결과에 "왜 이 추천인지"를 설명해 납득도를 높인다.
- 추천을 단순 제안이 아닌 단계형 실행 루틴으로 연결한다.
- 개인화 엔진으로 사용할수록 정확도가 올라가도록 설계한다.
- 안전성과 신뢰성을 문구/정보 구조로 일관되게 보장한다.
- 커머스 전환 구조를 KPI 기반으로 검증한다.

## 3. 대상 사용자
- 스트레스/긴장/피로 완화를 원하는 사용자
- 수면 준비 루틴이 필요한 사용자
- 감정 환기/기분 전환/리셋을 원하는 사용자
- 욕조 없이 샤워/족욕 중심으로 생활형 셀프케어 루틴을 쓰는 사용자

## 4. Information Architecture (v3.10)
Home = Unified Orchestration Layer  
CareEngine = Physiological Engine  
TripEngine = Immersion Engine  
ProductHub = Curated Bath Shop

핵심 원칙:
- Home은 Care/Trip의 분기점이 아니다.
- Home은 두 엔진의 결과를 통합해 사용자에게 단순화된 의사결정안을 제시한다.
- Home does not decide engines. Home displays the result of EngineSelector.
- Engines are implementation layers, Home is the user-facing decision layer.
- Home is a decision simplification layer, not a category navigation layer.
- 운영 목적: Home은 카테고리 탐색보다 실행 단순화를 우선해 PMF 신호(시작/완료/재방문)를 개선한다.

구조 다이어그램:
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

사용자 흐름:
1. 온보딩(경량): 2~3문항으로 시작
2. Home 오케스트레이션:
   - Today Signal
   - Primary Suggestion (1)
   - Secondary Suggestions (<=2)
   - Quick Actions
   - Insight Strip
3. 추천 결과:
   - Why 설명 + 루틴 파라미터 + 대안 루틴
   - 즉시 시작 버튼
4. 루틴 실행:
   - 준비 → 입욕/샤워 → 마무리 (단계형)
5. 완료:
   - 전/후 기분 체크
   - 개인화 학습 피드백
6. 리텐션:
   - 주간 리포트(효과적 조합 TOP3)
7. 설정:
   - 근거 및 참고 + 법적 고지

## 5. Care 모드 상태 분류 체계

### 5.1 1차 분류 (Physiological Axis)
1. 자율신경 균형 축
- 긴장 과다 (교감신경 우위)
- 무기력/저각성 (부교감 우위)
- 수면 준비 필요

2. 순환/체온 축
- 냉감/수족냉증 경향
- 부종/순환 정체
- 근육 피로

3. 피부/외부 자극 축
- 민감성 피부
- 건조/보습 필요
- 피로 피부

### 5.2 2차 분류 (Emotional Axis)
- 스트레스 해소
- 감정 환기
- 기분 전환
- 몰입/리셋

## 5-A. Care IntentCard Catalog (공식 8종 기준선)

> 이 섹션이 Care IntentCard의 단일 소스(source of truth)다.
> 알고리즘 세부 분기 초안: `docs/ALGO_CARE_BRANCHING_RFC.md`

### 5-A.1 전체 목록

| # | intent_id | 카드 제목 | 구분 | mapped_mode | SubProtocol A | SubProtocol B | 구현 상태 |
|---|---|---|---|---|---|---|---|
| 1 | muscle_relief | 근육통 완화 | 신체 | recovery | 하체가 뻐근해요 | 어깨/목이 뻐근해요 | ✅ 구현 |
| 2 | edema_relief | 부종 완화 | 신체 | recovery | 하체 붓기가 심해요 | 전신이 붓는 느낌이에요 | ✅ 구현 |
| 3 | hangover_relief | 숙취 해소 | 신체 | reset | 두통이 있고 민감해요 | 몸이 무겁고 처져요 | ✅ 구현 |
| 4 | cold_relief | 감기 기운이 느껴질 때 | 신체 | recovery | 몸살 느낌이에요 | 코가 막히고 답답해요 | ❌ 미구현 |
| 5 | menstrual_relief | 생리통을 달래고 싶어요 | 신체 | recovery | 하복부가 당기고 아파요 | 허리까지 뻐근해요 | ❌ 미구현 |
| 6 | sleep_ready | 수면 준비 | 정신 | sleep | 생각이 많아요 | 예민해서 잠이 안 와요 | ✅ 구현 |
| 7 | stress_relief | 긴장과 스트레스를 풀고 싶어요 | 정신 | reset | 몸에 긴장이 쌓였어요 | 머릿속이 너무 복잡해요 | ❌ 미구현 |
| 8 | mood_lift | 기분이 가라앉았어요 | 정신 | sleep | 무기력하고 에너지가 없어요 | 감정이 무겁게 가라앉았어요 | ❌ 미구현 |

### 5-A.2 환경 호환성 (allowed_environments)

| intent_id | 욕조(bathtub) | 샤워(shower) | 부분입욕(partial_bath) | 비고 |
|---|---|---|---|---|
| muscle_relief | ✅ | ✅ | ✅ | |
| edema_relief | ✅ | ✅ | ✅ | partial_bath 우선 권장 |
| hangover_relief | ✅ | ✅ | ⚠️ 비권장 | 부분입욕 권장 안함 |
| cold_relief | ✅ | ✅ | ✅ | partial_bath(반신욕) 우선 권장 |
| menstrual_relief | ✅ | ✅ | ✅ | partial_bath(반신욕) 우선 권장 |
| sleep_ready | ✅ | ✅ | ✅ | |
| stress_relief | ✅ | ✅ | ✅ | |
| mood_lift | ✅ | ✅ | ✅ | |

### 5-A.3 카드 배치 순서 (card_position)

홈 탭 2열 그리드 기준. 신체→정신 순, 안전도 고려 우선 배치.

| card_position | intent_id |
|---|---|
| 1 | muscle_relief |
| 2 | sleep_ready |
| 3 | hangover_relief |
| 4 | edema_relief |
| 5 | cold_relief |
| 6 | menstrual_relief |
| 7 | stress_relief |
| 8 | mood_lift |

---

## 6. Care Intake Schema

### STEP 1. 오늘 상태 선택
- 긴장되어 있다
- 몸이 무겁다
- 잠이 안 온다
- 기분이 가라앉았다
- 단순히 리셋하고 싶다

### STEP 1 보조 입력 (초기 2~3문항)
- 오늘의 스트레스 지수
- 최근 수면 시간
- 체온감
- 운동 여부
- 생리 주기(해당 시)

### STEP 2. 안전 조건 확인
- 기존 건강 상태/주의 조건 확인
- 안전 필터 자동 적용
- 신규 리스크군 체크:
  - 당뇨(말초 감각 저하 가능성)
  - 기립성 저혈압
  - 낙상 위험군

### STEP 2-1. 부분 입욕 세부 권장 규칙
- 족욕 우선 권장:
  - 초고령자
  - 심부전 환자
  - 매우 허약한 상태
  - 기립성 저혈압
  - 낙상 위험군
- 저위 입욕(Low-leg) 우선 권장:
  - 경계성 고혈압
  - 냉증
  - 하체 부종
  - 근육 피로
  - 장시간 좌식 근무자

### PRD 데이터 계약 확장 (Interface / Type)
- `BathEnvironment`:
  - 상위 입력: `bathtub | shower | partial_bath`
  - 하위 입력(`partial_bath_subtype`): `low_leg | footbath`
  - 마이그레이션 원칙: 기존 `footbath` 직접값은 `partial_bath + footbath`로 정규화
- `SafetyProfile`:
  - `diabetes_flag`
  - `orthostatic_hypotension_flag`
  - `fall_risk_flag`
  - `cold_shower_contraindication_flag` (고혈압 미조절/뇌혈관 질환 병력/부정맥)

## 7. Recommendation Explanation Contract
추천 결과 카드에는 아래 항목이 필수다.

- `state_label`: 예) 긴장형 피로
- `why_summary`: 2~3줄 근거 설명
- `routine_params`: 온도/시간/향 프로파일
- `expected_goal`: 정량 수치 제외, 목표형 문구
- `alternative_routine`: 대안 1개

### 루틴 가이드 문구 템플릿
- "오늘 당신은 긴장형 피로 상태입니다."
- "긴장을 낮추기 위해 따뜻한 온도와 짧은 이완 루틴을 추천합니다."
- "오늘 컨디션과 안전 기준에 맞춘 온도/시간 중심 루틴이 적합합니다."

## 8. Routine Execution Contract
- 단계 고정: `준비 → 입욕/샤워 → 마무리`
- 단계 전환: "다음" 단일 액션 우선
- 결과 화면에서 즉시 루틴 시작 진입 가능해야 함

## 9. 온보딩 전략
- 첫 진입은 경량 온보딩(2~3문항)만 수행
- 추가 프로파일은 루틴 완료 후 점진 수집
- 사용자에게 "정확도 향상" 맥락으로 안내
- 건강 상태 입력 정책(`HealthInputPolicy`):
  - `health_input_required = false`
  - `health_input_mode = optional_with_safety_reason`
  - `fallback_when_missing = safe_default_routine`
- 온보딩 실험(필수):
  - 상태 1탭 vs 2~3문항
  - 비교 지표: 온보딩 완료율, 추천 클릭률, 루틴 시작률

## 10. 리텐션 루프
- 루틴 완료 후 전/후 기분 체크
- "당신에게 맞는 조합을 학습 중" 피드백 제공
- 주간 리포트 제공:
  - 수면/스트레스 완화에 잘 맞은 조합 TOP3
  - 개인별 선호 향/온도/시간 경향

## 11. Commerce Recommendation Contract

### 11.1 추천 구조
- 상태 판별 → 루틴 조건 도출 → 제품 3개 제시
- 제품 추천 원칙: 인기/디자인 우선이 아니라 프로토콜 적합도 우선
- Environment Compatibility Rule (추천 전 선필터 필수):
  - bathtub/partial: `powder | salt | milk | oil`
  - shower: `steamer | bodywash | mist | tablet (if applicable)`
- 기전 우선순위 정책:
  - Sleep: `bicarbonate` 우선
  - Recovery: `magnesium` 우선, `bicarbonate`는 슬롯 C 전략 노출로 보장
- 모드별 상세 프로토콜은 Section 23을 참조해 커머스 추천 근거에 반영
- 제품 매칭/스코어링/슬롯 규칙은 Section 24를 단일 소스로 참조
- Trip 커머스는 Section 25의 `TripCommerceBundle` 규칙을 우선 적용
- 경계 원칙: `TripCommerceBundle`은 Section 24 기전 스코어 공식을 사용하지 않음
- Care/Trip 공통 규칙: 환경 호환 필터를 먼저 통과한 후보만 다음 단계(안전/스코어링)로 전달
- Home/EngineSelector는 표시/선정 레이어이며, Section 24/25 엔진 출력 결과를 사용자에게 단순화해 노출
- ProductHub는 supporting commerce layer이며 product primary entry point로 사용하지 않는다.

### 11.2 제품 수 및 구성 규칙
- 최대 3개
- 가격대 다양화: 저가/중가/고가 각 1개
- `루틴 Pick` 배지 1개만 허용
- 슬롯 역할 고정:
  - 1) 기전 기반 대표 제품
  - 2) 향 기반 감성 제품
  - 3) 가성비 대안

### 11.3 CTA 및 상세 정보
- CTA 문구: **"이 루틴으로 시작하기"**
- 제휴 링크 노출보다 설득 정보 우선
- 상세 정보 필수 항목:
  - 향 프로파일
  - 사용감
  - 어울리는 사람 유형
  - 이런 날에 추천
  - 루틴 적합성 근거(상태/온도/시간/향 매핑 기반)
- Mechanism Highlight Box 노출 규칙:
  - 제품 카드: 1줄 요약(기전/적합 루틴)
  - 제품 상세: 확장 설명(안전/금기 포함)
- Trip CTA 규칙:
  - Care: "이 루틴으로 시작하기"
  - Trip: 테마형 CTA (예: "교토의 숲을 준비하기")

## 12. Safety & Evidence Structure

### 12.1 레시피 화면 하단 고정 안전 가이드
⚠ 안전 가이드
- 38~40°C 권장 (개인 차 있음)
- 10~15분 권장
- 수면 루틴은 38~41°C 범위에서만 제안
- 수면 루틴은 취침 1~2시간 전 권장
- 수면 루틴은 15분 초과 시 경고
- 어지러움/심박 이상 시 즉시 중단
- 음주 직후 사용 금지
- 임신 초기 사용 전 전문가 상담 권장
- 냉수 샤워 금기:
  - 조절되지 않는 고혈압
  - 뇌혈관 질환 병력
  - 부정맥
  - 기립성 저혈압
- 고위험군 정책: 즉시 중단 + 대체 루틴(반신/저위/족욕) 자동 제안
- 기전 강조 안내 원칙: Safety Block 하단 기전 설명 시에도 의료 효능 단정 문구 금지

### 12.2 근거 기반 배지
레시피 카드 하단에 문구형 배지 노출
- 기본 문구: `Physiological relaxation–based recommendation`
- 대체 문구: `Based on thermal & aromatherapeutic studies`
- 논문 수치 직접 인용 금지

### 12.3 설정 > 근거 및 참고 메뉴
필수 메뉴 항목:
- 입욕 온도 가이드라인
- 자율신경 설명
- 아로마 안전 주의
- 광독성 오일 안내
- 임신 주의 오일 리스트

## 13. Copy Safety Policy (강제)

### 13.1 금지 표현
- 치료합니다
- 면역력 증가합니다
- 노폐물 배출합니다
- 질환 개선합니다
- 호르몬 조절합니다
- 혈류 n배 증가
- 치료 효과 보장

### 13.2 권장 표현
- ~에 도움을 줄 수 있습니다
- ~을 지원합니다
- ~을 유도하는 환경을 만듭니다
- ~에 적합한 루틴입니다
- ~을 완화하는 데 초점을 둡니다
- 기전 안내 템플릿: "이 제품은 [기전] 기반으로 [루틴 목적]을 돕는 데 적합합니다."

### 13.3 문구 변환 예시
- 기존: "지방에 쌓인 노폐물 제거"
- 변경: "순환을 촉진하는 환경을 조성하여 상쾌함을 돕습니다"

- 기존: "면역력 강화"
- 변경: "따뜻한 환경은 신체 이완과 회복에 도움을 줄 수 있습니다"

- 기존: "수면 개선"
- 변경: "수면 준비 상태를 만드는 데 도움을 줄 수 있습니다"

### 13.4 Trip Copy Firewall
- Trip 금지 어휘:
  - 혈류
  - 자율신경
  - 치료/개선 수치 단정
- Trip 허용 어휘:
  - 공간
  - 분위기
  - 몰입
  - 전환
  - 여정
  - 잔광
  - 파동
  - 숨결
  - 온기
  - 차분함
  - 리듬
- 주의 어휘:
  - "회복"은 Trip 문맥에서 Care 오해를 유발할 수 있으므로 narrative 맥락으로 제한 사용

### 13.5 포지셔닝 용어 정책 (내부/외부 분리)
- 외부 커뮤니케이션 권장:
  - `Bath & Shower Ritual OS`
  - `Bathroom Wellness Routine`
- 내부 R&D 문맥 전용:
  - `Digital Balneotherapy Platform`
- 사용자 노출 문맥에서 "치유/회복"은 의료적 기대를 유발하지 않도록 맥락 통제

## 14. 기존 기능 범위 유지 항목
- Trip 테마 선택 구조
- 환경 토글 및 마지막 선택 저장
- 타이머 몰입 화면(욕조/샤워 분기)
- 완료 피드백 저장
- 히스토리 조회 및 기본 호환 로직

## 15. 비기능 요구사항
- 의료적 진단/치료 주장으로 해석될 표현 금지
- 모바일 우선 UX (결정 피로/과잉 입력 최소화)
- 기능 안전성 및 회귀 안정성 유지
- 웹 배포 가능 구조 유지 (Vercel + 정적 export)

## 16. 배포/운영
- Web 배포 타깃: Vercel
- 출력 디렉터리: `dist`
- Node 권장 버전: 20 (`.nvmrc`)
- 빌드 명령: `npm run export:web`

## 17. 문서 품질 검증 체크리스트

### 구조 검증
- Care 입력이 STEP 1/STEP 2로 명확히 정의되었는가
- 생리학/정서 분류 축 누락이 없는가

### UX 검증
- Why/목표/대안 루틴 필수 항목이 포함되었는가
- 단계형 실행/점진 온보딩/리텐션 루프가 반영되었는가

### 커머스 검증
- 제품 3개 제한, 가격대 다양화, 단일 Pick 규칙이 명시되었는가
- CTA/상세 정보 구조가 문서화되었는가

### 안전/표현 검증
- 금지 표현이 본문에 남아있지 않은가
- 정량 효과 약속 문구가 제거되었는가
- 안전 가이드/근거 메뉴 항목이 포함되었는가

## 18. Personalization Engine Spec

### 18.1 Engine 3-Layer Architecture

1) Input Layer (단기 신호)
- 1차 상태 선택
- 스트레스 지수
- 수면 시간
- 체온감
- 운동 여부
- 생리 주기
- 환경 선택(욕조/샤워/부분 입욕)
- 부분 입욕 세부 선택(저위 입욕/족욕)

2) Behavior Layer (행동 데이터)
- 추천 클릭 여부
- 루틴 시작 여부
- 루틴 완료율
- 중도 이탈 시점
- 전/후 기분 변화 점수
- 재방문 간격
- 테마별 사용 빈도
- 환경별 완료율

3) Preference Layer (누적 학습 값)

`UserPreference` 스키마:
- `preferred_temp_range`
- `preferred_duration_range`
- `top_scent_family`
- `completion_rate_by_environment`
- `stress_response_score`
- `sleep_response_score`
- `sensitivity_flag`

### 18.2 개인화 적용 흐름
1. 상태 입력 기반 기본 추천 생성
2. 개인 누적 데이터 가중치 적용
3. 안전 필터 최종 적용

### 18.3 Personalization Ramp 정책 (고정)
- 1~5회: 기본 알고리즘 100%
- 6~9회: 개인 가중치 20%
- 10회+: 개인 가중치 40%

## 19. Commerce KPI & Validation Plan

### 19.1 필수 이벤트 로깅
- `recommendation_card_click`
- `product_detail_view`
- `affiliate_link_click`
- `sommelier_pick_click`
- `revisit_within_7d`
- `bicarbonate_product_click` (권장)
- `bicarbonate_click_rate` (지표 이벤트 집계용)
- `bicarbonate_conversion_rate` (지표 이벤트 집계용)
- `sleep_mode_bicarbonate_click_share` (지표 이벤트 집계용)
- `mode_protocol_applied` (권장)
- `mode_protocol_overridden_by_safety` (권장)
- `contrast_protocol_started` (권장)
- `cold_phase_completed_30s` (권장)
- `trip_theme_selected` (권장)
- `trip_immersion_started` (권장)
- `trip_variant_used_lite_or_deep` (권장)
- `trip_narrative_engaged` (권장)
- `trip_bundle_click` (권장)
- `onboarding_variant_exposed` (권장)
- `onboarding_completed` (권장)
- `why_explainer_exposed` (권장)
- `routine_started_after_why` (권장)
- `personalization_message_exposed` (권장)
- `return_after_personalization_message` (권장)
- `health_input_prompt_seen` (권장)
- `health_input_submitted_optional` (권장)

필수 공통 프로퍼티 스키마(단일 소스):
- `user_id`, `session_id`, `app_version`, `locale`
- `time_context`, `environment`, `partial_bath_subtype`
- `active_state`, `mode_type`
- `suggestion_id`, `suggestion_rank`
- `fallback_strategy_applied`
- `experiment_id`, `variant`
- 상세 필드 정의/타입은 `/Users/exem/DK/BathSommelier/docs/ANALYTICS_APPENDIX.md`를 따른다.

### 19.2 단계형 KPI

MVP 기준:
- 추천 카드 클릭률 ≥ 15%
- 제품 상세 진입률 ≥ 7%
- 제휴 링크 클릭률 ≥ 3%
- 제휴 클릭 후 7일 내 재방문률 ≥ 25%

Scale 기준:
- 추천 카드 클릭률 ≥ 18%
- 상세→제휴 이동률 ≥ 5%
- 루틴 Pick 클릭 점유율 ≥ 40%
- 중탄산 우선 노출군 클릭 점유율 개선
- Sleep 모드 bicarbonate 클릭 점유율 ≥ 45% (목표)
- `trip_session_completion_rate` 개선
- `trip_avg_session_duration` 개선
- `trip_return_after_trip_session` 개선

### 19.3 실험 설계 (A/B)
실험 A:
- A안: 제품 3개 + 루틴 Pick 강조
- B안: 제품 1개 + 깊은 설명

실험 B:
- A안 CTA: "이 루틴으로 시작하기"
- B안 CTA: "추천 제품 보기"

성공 판단:
- 클릭률, 상세 진입률, 제휴 이동률, 7일 내 재방문률 개선
- 루틴 Pick 클릭 점유율 및 중탄산 우선 노출군 클릭 점유율 개선
- 모드별(Sleep/Reset/Recovery) 클릭/완료/7일 재방문률 개선
- 모드별 퍼널(추천 노출→카드 클릭→상세 진입→제휴 이동→7일 재방문) 개선
- Care/Trip 세션 분리 리포팅으로 Trip 퍼널 개선 확인

### 19.4 시장성 가정-지표 매핑 (필수 대시보드)
- 사용 빈도 가정:
  - 지표: `environment_session_count`, `7d_retention_by_environment`
  - 세그먼트: `shower | bathtub | partial`
- 입력 마찰 가정:
  - 지표: `onboarding_completion_rate`, `recommendation_click_rate`, `routine_start_rate`
  - 실험: `one_tap_state` vs `2to3_questions`
- Why 효과 가정:
  - 지표: `routine_start_rate`, `routine_completion_rate`
  - 실험: `why_exposed` vs `why_hidden`
- 개인화 체감 가정:
  - 지표: `return_after_personalization_message`
- 커머스 가정:
  - 지표: `CTR`, `detail_entry`, `affiliate_transition`, `pick_share`
  - 실험: `3_products_plus_pick` vs `1_product_deep_explain`
- 건강 입력 이탈 가정:
  - 지표: 온보딩 완료율, 건강 입력 제출률(선택), 이탈률

## 20. Routine Guide Engine

### 20.1 알고리즘 구조
1. 상태 → 생리학 매핑
2. 생리학 → 루틴 파라미터 매핑
3. 개인 가중치 적용
4. 안전 필터 최우선 적용 (`safety_precedence = absolute`)
5. 고위험군 냉수 차단 (`cold_shower_disabled_when_high_risk = true`)
6. 모드별 프로토콜은 Section 23을 단일 소스로 참조
7. 엔진 분리 원칙:
   - CareEngine: 생리학/안전 프로토콜 담당
   - TripEngine: narrative/visual/audio 연출 담당
8. 충돌 해결 원칙:
   - `if user_has_active_state: apply_care_protocol(); apply_trip_immersion_overlay();`
9. Reset 리스크 게이트(`ResetRiskGate`):
   - `default_reset_mode = non_cold_activation`
   - `cold_exposure_enabled = advanced_opt_in_only`
   - `consent_required = true`
   - `hard_block_conditions = existing contraindications`

### 20.2 상태 매핑 예시
- 긴장 과다 → 교감신경 우위
- 목표: 부교감 활성
- 전략: 38~39°C + 10~15분 + 플로럴/우디
- 수면 준비 필요 → 수면 준비 상태 유도
- 수면 전략: 38~41°C + 10~15분 + 취침 1~2시간 전 루틴 (상세: 23.1)
- 리셋 필요 → 각성 전환/멘탈 리셋 전략 (상세: 23.2)
- 회복 필요 → 혈류/근육 회복 지원 전략 (상세: 23.3)

### 20.3 개인 가중치 보정 예시
- 39°C 완료율이 높고 40°C 이탈률이 높다면 38~39°C로 자동 보정
- 우디 계열 완료율이 높다면 향 가중치를 우디 중심으로 보정

### 20.4 안전 필터 우선순위 (최상위)
- 고혈압: 최대 온도 38°C
- 임신: 주의 오일 제외
- 당뇨: 최대 온도 40°C 상한 + 온도 감각 저하 리스크 경고
- 숙취 태그: 페르소나는 `P1_SAFETY`로 강제, 저온/족욕 안전 경로 우선
- 기립성 저혈압: 급격한 온도 변화 및 기립 전환 경고
- 낙상 위험군: 족욕 우선, 이동/기립 단계 경고 강화
- 냉수 샤워 금기군(조절되지 않는 고혈압/뇌혈관 질환 병력/부정맥/기립성 저혈압): 냉수 루틴 차단
- 기타 안전 필터는 추천/개인화보다 우선

### 20.5 설명 문구 계약 (AI 체감 요소)
예시:
- "최근 3회 루틴 중 39°C에서 완료율이 가장 높았습니다. 오늘도 비슷한 온도로 제안드립니다."

### 20.6 Lighting & Bath Depth Rules
- Sleep Mode:
  - 조명: Warm Amber 또는 Soft Red
  - Blue tone 금지
- Morning Mode:
  - 조명: Cyan 또는 Cool White 허용
- Bath depth profile:
  - `full | half | low_leg | footbath`
- Product priority rule:
  - `bicarbonate_priority_for_sleep_or_recovery`
- 모드 타입 계약(`ModeType`):
  - `sleep | reset | recovery`
  - CareEngine에서 독립적으로 계산
- EngineSelector (internal policy layer) 계약:
  - `active_state`
  - `time_context`
  - `environment_context`
  - `priority_resolution`
- 모드 프로토콜 계약(`ModeProtocol`):
  - `temp_range`
  - `duration_range`
  - `timing_window`
  - `lighting_profile`
  - `scent_profile`
  - `audio_profile`
  - `contraindications`
  - `hard_limits`
  - `fallback_strategy`

## 21. Legal Disclaimer Layer

### 21.1 고정 문구 (확정)
**"바스타임은 의료 진단 또는 치료 서비스를 제공하지 않습니다. 개인 건강 상태에 따라 전문의 상담을 권장합니다."**

### 21.2 노출 위치
- 설정 화면 고정 영역
- 레시피 화면 하단 고정 블록
- 상황성 경고 영역: 냉수 샤워 금기군 감지 시 별도 경고 배너 병기

### 21.3 노출 정책
- 항상 노출(조건부 숨김 없음)
- 문구 축약/완곡 표현 금지 (법적 완충 목적 유지)
- Mechanism Highlight 문구도 동일 정책 적용(의료 단정/치료 암시 금지)
- 외부 메시지는 웰니스 루틴 톤으로 유지하고 내부 R&D 용어와 분리 운영

## 22. 문서 추가 검증 체크리스트

### Personalization 검증
- Input/Behavior/Preference 3계층 분리 정의 여부
- `UserPreference` 필드 누락 여부
- 1~5/6~9/10+ 램프업 수치 고정 여부

### Commerce 검증
- MVP/Scale 단계형 KPI 반영 여부
- 퍼널(추천→상세→제휴→재방문) 정의 여부
- A/B 실험 가설/비교군/성공지표 포함 여부

### Routine Guide Engine 검증
- 상태→생리학→파라미터→개인보정 논리 연결 여부
- 안전 필터 최우선 원칙 명시 여부
- 카피 정책 위반 문구 존재 여부
- Sleep 조명 Blue 금지 및 Morning 쿨톤 허용 규칙 누락 여부

### Legal 검증
- 법적 고지 문안 정확성
- 설정+레시피 이중 배치 명시 여부
- 냉수 샤워 금기군 경고 문구 병기 여부

### IA/안전 확장 검증
- 환경 IA가 상위 3개 + 부분 입욕 하위 2개 구조로 명시되었는가
- 기본 안전가이드(38~40)와 수면 예외(38~41, 취침 1~2시간 전)가 충돌 없이 공존하는가
- 신규 리스크군(당뇨/기립성 저혈압/낙상) 필터가 누락되지 않았는가
- Recovery/Sleep 중탄산 우선 노출 규칙과 KPI/이벤트 연결이 명시되었는가

### 3모드 알고리즘 검증
- Sleep 프로토콜(38~41°C, 10~15분, 취침 1~2시간 전)과 하드리밋(41°C/15분 경고)이 분리 명시되었는가
- Reset 프로토콜(냉온 교대/단일 냉수)과 초보자 30초 기준이 명시되었는가
- Reset 절대 금기군 차단 규칙이 명시되었는가
- Recovery 기본(40~42°C)과 고위험군 오버라이드(<=40°C, half/low-leg)가 함께 명시되었는가
- 안전 필터 절대우선 원칙이 3모드 전체에 적용되는가

### 제품 매칭 검증
- ProductProfile 필드가 타입/설명과 함께 완전 정의되었는가
- `environment_fit` 필드가 누락/오기 없이 정의되었는가
- `primary_mode_fit`의 `hygiene`가 확장 예약값으로 명시되었는가
- 3슬롯(기전/감성/가성비) 구성 규칙이 강제 조건으로 명시되었는가
- 스코어 상수(0.4/0.3/0.2/0.1)가 정확한가
- bicarbonate KPI/이벤트가 누락 없이 명시되었는가
- Mechanism Highlight 문구가 의료 단정 금지 정책을 준수하는가
- 환경 필터가 스코어링 전에 선적용되는가
- shower 선택 시 salt/oil 등 비호환 후보가 제외되는가

### Trip 엔진 검증
- Trip이 Care 서브모드가 아닌 독립 엔진으로 명시되었는가
- Default vs Override 정책이 함께 명시되었는가
- `active_state` 시 Care 프로토콜 우선 + Trip 연출 오버레이 정책이 명시되었는가
- Trip 커머스가 Section 24 스코어링과 분리되었는가
- Trip 금지/허용 어휘 가드가 누락 없이 명시되었는가
- Memory Contract(`completion_snapshot`, `theme_preference_weight`, `narrative_recall_card`)가 정의되었는가

### Home 오케스트레이션 검증
- Home이 엔진 결정자가 아니라 결과 표시/단순화 레이어로 명시되었는가
- EngineSelector 4필드(`active_state`, `time_context`, `environment_context`, `priority_resolution`)가 정의되었는가
- `fallback_strategy` 및 3개 이상 fallback 시나리오가 명시되었는가
- 사용자에게 Care/Trip 강제 선택 금지 문구가 포함되었는가
- ProductHub가 supporting commerce layer로 명시되었는가
- Home does not decide engines 문구가 Section 4/26에서 동일하게 재사용되는가
- Home is a decision simplification layer 문구가 IA 핵심 원칙으로 고정되는가

### 시장성 검증 설계
- 6개 시장성 가정이 `가설-실험-판단규칙` 형태로 명시되었는가
- 가정별 KPI/이벤트가 1:1로 연결되었는가
- ResetRiskGate(비냉수 기본/냉수 opt-in/추가 동의)가 명시되었는가
- HealthInputPolicy(선택 입력 + 안전 목적 설명)가 명시되었는가
- 외부/내부 포지셔닝 용어 분리 정책이 명시되었는가

## 23. Mode-Specific Algorithm Definition

### 23.1 Sleep Mode — 체온 하강 유도 알고리즘
목표 생리 상태:
- 심부 체온 하강 유도
- 부교감신경 활성
- 멜라토닌 분비 보호

자율신경 목표:
- 교감신경 활성 하향
- 부교감신경 활성 상향
- 심박수 안정
- 말초 혈관 확장

프로토콜:
- 온도: `38~41°C` (상한 41°C 고정)
- 시간: `10~15분`
- 타이밍: 취침 `1~2시간 전`

하드리밋:
- `41°C 초과 금지`
- `15분 초과 시 경고`

감각 요소:
- 향: 라벤더, 샌달우드, 베르가못 (플로럴/우디 축)
- 조명: 앰버/레드 (블루톤 금지)
- 음악: BPM 60~80, 앰비언트/저자극 클래식

금기 및 대체:
- 임신 초기: 고온 금지
- 심혈관 질환: 전신욕 회피, 반신/저위 입욕 우선
- 음주 직후: 루틴 금지

의사코드:
```txt
if ModeType == "sleep":
  temp = 38..41
  duration = 10..15
  lighting = amber_or_red
  scent = floral_or_woody
  enforce_warning_if_over(41C or 15min)
  apply_safety_filter_first()
```
- 제품 매칭 규칙: Section 24 정책 적용

### 23.2 Reset Mode — 각성 스위칭 알고리즘
목표 생리 상태:
- 각성 전환
- 멘탈 리셋
- 교감신경 순간 활성

PMF 1단계 기본값:
- `non_cold_activation` 루틴을 기본으로 제공
- 냉수/교대 샤워는 고급 옵션 + 추가 동의 후 노출

프로토콜:
- 옵션 A(냉온 교대 샤워):
  - Warm `40°C` `3~5분`
  - Cold `<=20°C` `30~60초` (초보자 `30초` 고정)
- 옵션 B(단일 냉수):
  - Cold `30~60초`

감각 요소:
- 향: 페퍼민트, 레몬, 유칼립투스
- 조명: 시안/쿨 화이트 (블루 허용)
- 음악: BPM `100+`, 리듬 중심

절대 금기:
- 조절되지 않는 고혈압
- 부정맥
- 뇌혈관 질환
- 기립성 저혈압

안전게이트:
- 고위험군은 냉수 단계 비활성화
- 대체 루틴: 온수 단일 루틴 또는 반신/저위 입욕
- 사용자 추가 동의 없이는 냉수 단계 비노출

의사코드:
```txt
if ModeType == "reset":
  if high_risk:
    disable_cold_shower()
    fallback_to_safe_warm_protocol()
  else:
    apply_contrast_or_cold_protocol()
  apply_safety_filter_first()
```
- 제품 매칭 규칙: Section 24 정책 적용

### 23.3 Recovery Mode — 혈류/회복 중심 알고리즘
목표 생리 상태:
- 말초 혈류 증가 환경 조성
- 근육 이완
- 회복 지원

기본 프로토콜(건강 성인):
- 온도: `40~42°C`
- 시간: `10~15분`
- 형태: 반신욕 우선

안전 오버라이드:
- 고위험군(심혈관/고혈압/저혈압/낙상 위험)은
  - 형태: `half_or_low_leg`
  - 온도: `<=40°C`

감각 요소:
- 향: 로즈마리, 마조람, 블랙페퍼
- 조명: 뉴트럴 그린, 소프트 화이트
- 제품 우선: 엡섬솔트(Mg), 중성 중탄산

의사코드:
```txt
if ModeType == "recovery":
  if cardiovascular_or_high_risk:
    mode = half_or_low_leg
    temp = <=40
  else:
    mode = half_bath
    temp = 40..42
  duration = 10..15
  prioritize_bicarbonate_or_epsom()
  apply_safety_filter_first()
```
- 제품 매칭 규칙: Section 24 정책 적용

### 23.4 모드 비교 요약
| 모드 | 목표 자율신경/생리 | 온도 | 시간 | 조명 | 향 | 핵심 금기 |
|---|---|---|---|---|---|---|
| Sleep | 부교감 활성/체온 하강 유도 | 38~41°C | 10~15분 | 앰버/레드 | 라벤더/샌달우드/베르가못 | 임신 초기 고온, 음주 직후 |
| Reset | 각성 전환/멘탈 리셋 | 냉온 교대 또는 냉수 | 30~60초(냉수 단계) | 시안/쿨 화이트 | 페퍼민트/레몬/유칼립투스 | 고혈압 미조절/부정맥/뇌혈관/기립성 저혈압 |
| Recovery | 회복/근육 이완 지원 | 40~42°C(고위험군 <=40°C) | 10~15분 | 뉴트럴 그린/소프트 화이트 | 로즈마리/마조람/블랙페퍼 | 고위험군 전신 고온 노출 제한 |

### 23.5 공통 후처리 규칙
- 모든 모드는 `apply_safety_filter_first()`를 공통 후처리로 적용
- 안전 필터 발동 시:
  - 온도/시간/환경 강제 하향
  - 금기 조건 루틴은 차단
  - 사용자에게 대체 루틴 제안

## 24. Product Matching & Bicarbonate Strategy

### 24.1 ProductProfile 데이터 계약
```txt
ProductProfile {
  category: powder | tablet | salt | oil | milk | steamer | bodywash | mist
  core_mechanism: bicarbonate | magnesium | aromatic | moisturizing | detox
  primary_mode_fit: sleep | recovery | reset | hygiene
  environment_fit: bathtub | shower | both
  temp_optimal_range
  duration_optimal_range
  contraindications
  risk_level
  price_tier
}
```

보조 계약:
```txt
ProductRecommendationPolicy {
  mode_to_mechanism_mapping
  scoring_formula
  slot_composition_rule
  copy_safety_rule
}
```

정책:
- `hygiene`는 확장 예약값이며, 현재 추천 계산의 활성 모드는 `sleep | reset | recovery`로 제한
- `partial_bath`는 기본적으로 `bathtub` 호환군으로 처리

### 24.2-1 Environment Compatibility Rule
- 추천 전 환경 필터를 1차 게이트로 적용
- 환경별 허용 카테고리:
  - bathtub/partial: `powder | salt | milk | oil`
  - shower: `steamer | bodywash | mist | tablet (if applicable)`

### 24.2 모드별 성분 매핑
- Sleep:
  - 우선: `bicarbonate`
  - 보조: `magnesium`
  - 회피: 자극향(예: peppermint) 과다 제품
- Recovery:
  - 우선: `magnesium`
  - 보조: `bicarbonate`
  - 허용: warming aroma(예: rosemary)
- Reset:
  - 우선: 발포형(`tablet`) + 자극향
  - 회피: sleep-optimized bicarbonate 타입

### 24.3 스코어링 공식 및 tie-break
파이프라인 순서(고정):
1. `env_candidates = filter_by_environment(products, selected_environment)`
2. `safe_candidates = apply_safety_filter_first(env_candidates)`
3. `scored = score_products(safe_candidates, mode, user_preference, fixed_weights)`

고정 공식(MVP):
```txt
score =
  (mode_fit_weight * 0.4)
+ (core_mechanism_match * 0.3)
+ (user_preference_weight * 0.2)
+ (price_tier_diversity * 0.1)
```

Tie-break 규칙:
1. 안전 리스크 낮은 제품 우선
2. 모드 핵심 기전 일치 제품 우선
3. 동일 시 가격대 다양성 유지 우선

### 24.4 3제품 슬롯 구성 알고리즘
- 슬롯 A: 기전 기반 대표 제품
- Recovery 슬롯 A 고정 정책: `magnesium` 우선
- 슬롯 B: 향 기반 감성 제품
- 슬롯 C: 가성비 대안(Recovery에서는 `bicarbonate` 전략 노출 우선)
- 정규 규칙(충돌 금지):
  - Sleep: Slot A=`bicarbonate`, Slot B=`aromatic`, Slot C=`magnesium 또는 bicarbonate 대안`
  - Recovery: Slot A=`magnesium`, Slot B=`warming aroma`, Slot C=`bicarbonate/value`
  - Reset: Slot A=`tablet + stimulating`, Slot B=`sensory`, Slot C=`non-cold activation 대안`
- 공통 제약:
  - 저가/중가/고가 분산 유지
  - 중복 기전 과다 노출 방지
  - 금기/고위험 제품 제외

### 24.5 예시 의사코드
```txt
env_candidates = filter_by_environment(products, selected_environment)
candidates = filter_by_contraindications(env_candidates, user_safety_profile)
safe_candidates = apply_safety_filter_first(candidates)
scored = score_products(safe_candidates, mode, user_preference, fixed_weights)
slots = compose_three_slots(scored, [mechanism, sensory, value])
return diversify_price_tiers(slots)
```

구현 기준 부록:
- EngineSelector/우선순위 정책: `/Users/exem/DK/BathSommelier/docs/POLICY_APPENDIX.md`
- 이벤트 필수 프로퍼티 스키마: `/Users/exem/DK/BathSommelier/docs/ANALYTICS_APPENDIX.md`
- Default/Safe 루틴 파라미터: `/Users/exem/DK/BathSommelier/docs/CONFIG_APPENDIX.md`

## 25. Trip Immersion Engine

### 25.1 엔진 선언
- Trip은 Care의 서브모드가 아니라 독립 엔진(`TripEngine`)이다.
- 역할 분리:
  - CareEngine: 생리학/안전 프로토콜
  - TripEngine: 분위기/공간/감성/몰입 연출
- 동시 맥락 충돌 시 우선순위:
  - `if user_has_active_state: Care protocol 우선 적용`
  - `Trip은 rendering overlay로만 적용`

### 25.2 ThemeProfile 데이터 계약
```txt
ThemeProfile {
  narrative_description
  ambient_sound_layer
  lighting_profile
  scent_profile
  temperature_mood
  water_behavior_style
  visual_motion_style
}
```

### 25.3 TripImmersionStrategy 데이터 계약
```txt
TripImmersionStrategy {
  immersion_depth: shallow | deep
  audio_strategy
  visual_strategy
  interaction_density
  time_expectation
}
```

### 25.4 TripEnvironmentPolicy (Default + Override)
기본 정책(Default):
- `shower -> shallow`
- `bathtub/partial -> deep`

오버라이드 정책:
- `override_allowed = true`
- 예외 입력 허용:
  - 입욕 5분의 짧은 루틴
  - 샤워에서 깊은 ASMR 몰입
  - 부분 입욕 3분 리듬 루틴

### 25.5 Trip Lite / Trip Deep
- Trip Lite(기본: 샤워):
  - 3~7분
  - Warm-up → Peak → Reset
  - 모션 최소화, 리듬 전환 중심
- Trip Deep(기본: 입욕/부분 입욕):
  - 10~20분
  - 서사 기반 진행
  - 감각 레이어 확장(사운드/빛/파동)

### 25.6 Narrative Contract
- 추천 화면에서 1~2문장 서사 문구를 필수 제공
- 예시: "오늘 당신은 교토 숲의 늦은 오후에 있습니다."
- Care Why 설명과 분리하여 Trip 전용 몰입 문맥으로 운영

### 25.7 Visual/Audio Rules
- Shower Trip:
  - 물소리 충돌 방지 필터 적용
  - 과도한 풀스크린 애니메이션 금지
  - 미묘한 색 변화 중심
- Bathtub/Partial Trip:
  - 3중 오디오 레이어 허용
  - 파동/증기/그라디언트 연출 확장
  - 서사 길이 확장 허용

### 25.8 TripCommerceBundle (Care와 분리)
```txt
TripCommerceBundle {
  theme_match_weight
  environment_fit_weight
  prop_bundle_composition
  trip_cta_copy
}
```

규칙:
- `TripCommerceBundle`은 Section 24의 기전 스코어링 공식을 사용하지 않는다.
- 샤워 Trip 추천군:
  - 바디워시
  - 샤워 스티머
  - 향 미스트
- 입욕 Trip 추천군:
  - 솔트
  - 오일
  - 밀크 타입

### 25.9 Trip Memory Contract
```txt
TripMemoryContract {
  completion_snapshot
  theme_preference_weight
  narrative_recall_card
}
```

목표:
- Trip 완료 순간의 정서/테마 문맥을 저장
- 테마 선호 가중치를 누적
- 이후 홈/기록 화면에서 narrative recall 카드로 재노출

## 26. Home Orchestration Layer

### 26.1 Home Orchestration Contract
```txt
HomeOrchestrationContract {
  today_signal
  primary_suggestion
  secondary_suggestions
  quick_actions
  insight_strip
  fallback_strategy
}
```
규칙:
- `fallback_strategy`는 required contract field다.

### 26.2 EngineSelector (internal)
```txt
EngineSelector {
  active_state
  time_context
  environment_context
  priority_resolution
}
```

원칙:
- Home does not decide engines. Home displays the result of EngineSelector.
- EngineSelector는 내부 정책 레이어이며 UI에서 직접 노출하지 않는다.

### 26.3 자동 선택 및 fallback 정책
MUST cover 시나리오:
- 데이터 부족: `Default Starter Ritual`
- 고위험군 감지: `Safe Routine Only`
- 심야 시간: `Sleep 우선`
- 엔진 충돌: `priority_resolution`에 따라 단일 primary 결과만 노출
- reset + 금기군: `RESET_WITHOUT_COLD` (냉수 단계/CTA 완전 비노출)
- 제품 후보 부족: `ROUTINE_ONLY_NO_COMMERCE` (루틴 실행 유지, 커머스 영역 숨김)

Fallback 루틴 상세 파라미터는 `/Users/exem/DK/BathSommelier/docs/CONFIG_APPENDIX.md`를 단일 소스로 MUST 참조한다.

### 26.4 UX 노출 가이드
- The user should never be forced to choose between Care or Trip.
- These are system constructs, not user-facing categories.

## 27. Product Hub (Curated Bath Shop)

### 27.1 역할 정의
- ProductHub는 카테고리 중심 쇼핑 화면이 아니라 큐레이션 허브다.
- **ProductHub is a supporting commerce layer, not the primary entry point of the product.**

### 27.2 진열 원칙
- 카테고리 중심 진열 금지
- 루틴 중심 진열
- 컬렉션:
  - Mode-based Collection
  - Theme-based Collection
  - Starter Pack
  - Seasonal Pack

### 27.3 연결 정책
- ProductHub는 Care/Trip 엔진과 독립적으로 탐색 가능
- 추천 진입점은 Home 오케스트레이션 결과와 연동
- 운영 가드라인(MUST): ProductHub를 전면 홈 대체 진입점으로 승격하지 않음

## 28. Market Hypotheses & Validation Sequence

### 28.1 공통 가설 계약 (`MarketHypothesis`)
```txt
MarketHypothesis {
  id
  hypothesis_statement
  success_metric
  guardrail_metric
  experiment_design
  decision_rule
  owner
  review_cycle
}
```

보조 이벤트 계약 (`ValidationEventSpec`)
```txt
ValidationEventSpec {
  event_name
  required_properties
  segment_keys
  attribution_window
}
```

### 28.2 가설 6개 (우선 검증)
1. 사용 빈도 가정:
- 가설: 샤워/부분입욕 포함 시 주 3회 사용 가능
- 검증: `shower | bathtub | partial` 환경별 세션 수 + 7일 리텐션

2. 입력 마찰 가정:
- 가설: 2~3문항은 일상 사용 마찰이 될 수 있음
- 검증: 상태 1탭 vs 2~3문항 A/B, 추천 클릭/시작률 비교

3. Why 효과 가정:
- 가설: Why 설명 노출이 실행률/완료율을 높임
- 검증: Why 노출군 vs 미노출군

4. 개인화 체감 가정:
- 가설: 5~10회 내 “점점 나를 안다” 체감 형성
- 검증: 개인 보정 메시지 노출 전후 재방문

5. 3슬롯 커머스 가정:
- 가설: 3개+Pick 구조가 CTR/전환을 만든다
- 검증: 3개+Pick vs 1개+깊은 설명

6. 건강 입력 이탈 가정:
- 가설: 건강 상태 필수 입력은 온보딩 이탈을 증가시킴
- 검증: 필수 vs 선택+안전 목적 설명 비교

### 28.3 의사결정 규칙
- 각 가설은 성공/유지/전환 기준을 사전에 고정
- 2개 연속 review_cycle에서 실패 시 해당 기능 확장 중단 또는 축소
- PMF 미확정 시 ProductHub 확장보다 Home/실행률 개선 작업을 우선

## 29. MVP Execution Order (Market-first)
Jira 실행 백로그(에픽/스토리/AC)는 `/Users/exem/DK/BathSommelier/docs/JIRA_EXECUTION_BACKLOG_v3.10.2.md`를 단일 소스로 참조한다.

### 29.1 실행 우선순위
1. Home Orchestration: Primary 1 + Secondary 0~2
2. Explanation Contract: Why/목표/대안 루틴
3. Safety/Legal 상시 노출 + 카피 정책 정합
4. Mood 전/후 2탭 + 이벤트 로깅
5. 커머스 3슬롯 + 근거 + CTA 실험
6. ProductHub 확장은 후순위

### 29.2 리스크 게이트
Reset 리스크 게이트 (`ResetRiskGate`)
```txt
ResetRiskGate {
  default_reset_mode = non_cold_activation
  cold_exposure_enabled = advanced_opt_in_only
  consent_required = true
  hard_block_conditions = existing_contraindications
}
```

건강 입력 정책 (`HealthInputPolicy`)
```txt
HealthInputPolicy {
  health_input_required = false
  health_input_mode = optional_with_safety_reason
  fallback_when_missing = safe_default_routine
}
```

개발 전 게이트(필수):
- PRD 본문 + 아래 부록 3종을 함께 Lock한 뒤 개발 착수
  - `/Users/exem/DK/BathSommelier/docs/POLICY_APPENDIX.md`
  - `/Users/exem/DK/BathSommelier/docs/ANALYTICS_APPENDIX.md`
  - `/Users/exem/DK/BathSommelier/docs/CONFIG_APPENDIX.md`

### 29.3 포지셔닝/카피 운영 규칙
- 외부 포지셔닝 권장:
  - `Bath & Shower Ritual OS`
  - `Bathroom Wellness Routine`
- 내부 용어:
  - `Digital Balneotherapy Platform`은 내부 문맥에 한정
- Reset 냉수 노출은 PMF 1단계에서 기본값으로 사용하지 않는다

---

## 30. CHANGELOG

> 구현 변경 이력. 코드 커밋과 1:1 대응하는 것을 원칙으로 한다.

### v3.11.0 — 2026-02-27 (Current State Baseline)

**[UI] Phase 1 — 온보딩 플로우 생활형 셀프케어 리디자인**
- `app/onboarding/welcome.tsx`: 하드코딩 색상 → 토큰 교체, 한국어화
- `app/onboarding/greeting.tsx` (신규): 그래디언트 배경 환영 인사 화면 추가
- `app/onboarding/index.tsx`: 환경 선택 화면 레이아웃 재작성
- `app/onboarding/health.tsx`: 건강 상태 선택 화면 레이아웃 재작성

**[UI] Phase 2 — 홈 탭 리디자인**
- `app/(tabs)/index.tsx`: CategoryCard 2열 그리드, FeaturedRoutineCard 배너 추가
- `src/components/CategoryCard.tsx` (신규): 컬러풀 인텐트 카드
- `src/data/colors.ts`: `CATEGORY_CARD_COLORS`, `CATEGORY_CARD_EMOJI` 추가

**[UI] Phase 3-1 — 레시피 상세 화면 리디자인**
- `app/result/recipe/[id].tsx`: 히어로 LinearGradient 섹션, 재료 트랙 리스트 스타일로 전면 재작성

**[UI] Phase 3-2 — 타이머 화면 리디자인**
- `app/result/timer/[id].tsx`: 원형 재생/일시정지 버튼(76×76), 수평 프로그레스 바, X/끝내기 버튼 추가. 기존 비즈니스 로직 전량 보존.

**[UI] Phase 4 — 히스토리 탭 리디자인**
- `app/(tabs)/history.tsx`: 2열 FlatList 그리드, 필터 pill(전체/케어/트립), 이번 달 요약 인사이트 배너

**[Fix] 오디오 안전 패치**
- `src/hooks/useDualAudioPlayer.ts`: `play()`, `pause()`, `stop()`, `seekTo()`, 볼륨/루프 설정 전 항목 try-catch 보호.
  - 원인: `AUDIO_ASSETS`가 placeholder(빈 객체)여서 `useAudioPlayer(null)` 상태에서 `seekTo(0)` 호출 시 iOS 네이티브 예외 발생 → 타이머 끝내기 시 렌더 에러
  - 효과: 오디오 파일 없는 상태에서도 전 화면 정상 동작

**[Build] iOS 개발 빌드**
- `app.json`: `slug: "getbathtime"`, `scheme: "getbathtime"`, `bundleIdentifier/package: "com.getbathtime.app"` 적용
- iPhone 17 Pro 시뮬레이터 빌드/실행 성공 (`npx expo run:ios`)

### v3.10.2 — 2026-02-13
- PRD 최초 확정 (목표형 스펙)
- Home Orchestration 레이어, Care/Trip 엔진, ProductHub 구조 정밀화
- W01~W18 와이어프레임 명세 (`docs/WIREFRAME_V3_10_2.md`)
- Analytics/Config/Policy 부록 v1.1 추가
- Care 분기 알고리즘 RFC 초안 (`docs/ALGO_CARE_BRANCHING_RFC.md`)

---

## 31. 향후 패치 계획

> v3.11.0 이후 예정 패치를 추적한다.
> 우선순위: **P0** 즉시 수정 필요 / **P1** 다음 릴리즈 포함 / **P2** 백로그

<!-- 패치 내용은 사용자가 기술 후 채울 것 -->

### Patch — [날짜 미정]

#### P0 — 즉시 수정
- (패치 내용 기술 예정)

#### P1 — 다음 릴리즈
- (패치 내용 기술 예정)

#### P2 — 백로그
- (패치 내용 기술 예정)
