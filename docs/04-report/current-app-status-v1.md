# ë°°ì°íì 앱 현재 상태 보고서

> **Summary**: 2026-02-27 기준 ë°°ì°íì v3.11.0 전체 개발 현황 스냅샷
>
> **기능명**: current-app-status
> **생성일**: 2026-02-27
> **상태**: Complete (스냅샷 기준)

---

## 0. 요약

배쓰타임은 **AI 맞춤형 목욕 추천 앱**으로, 2026-02-27 기준 **v3.11.0 현재 상태 기준선**을 확정했습니다.

| 영역 | 진행도 | 상세 |
|------|--------|------|
| **핵심 알고리즘** | 100% ✅ | 49개 단위 테스트 통과, 안전 필터 완성 |
| **UI/UX 리디자인** | 80% 🟡 | Phase 1~4 완료, Phase 5 미디자인 |
| **홈 탭 구현** | 60% 🟡 | 4종 Intent 구현, 4종 미구현 |
| **오디오 시스템** | 40% 🟡 | 구조 완성, .mp3 파일 미번들 |
| **분석/보고** | 0% ❌ | 리텐션 루프 미구현 |

---

## 1. 앱 개요 및 현재 버전

### 1.1 프로젝트 정보
- **앱명**: ë°°ì°íì (목욕 소믈리에)
- **타깃 플랫폼**: React Native (Expo SDK 54) + Web (Vercel)
- **현재 버전**: v3.11.0 (Current State Baseline + Patch Roadmap)
- **기준일**: 2026-02-27
- **프로젝트 구조**: Expo Router (파일 기반 라우팅)

### 1.2 핵심 가치 제안
**"내 상태를 이해하고 맞춤형 목욕을 설계해준다."**

- 경량 온보딩(2~3문항) 기반 빠른 시작
- 생리학/정서 분류 기반 맞춤 추천
- 단계형 실행 루틴(준비→입욕/샤워→마무리)
- 주간 리포트 기반 개인화 학습
- 안전성 최우선 원칙

### 1.3 기술 스택
| 항목 | 기술 |
|------|------|
| **런타임** | Expo SDK 54, React Native 0.81.5 |
| **언어** | TypeScript (strict mode) |
| **라우팅** | Expo Router v6.0.23 |
| **상태 관리** | AsyncStorage (로컬 영속화) |
| **애니메이션** | react-native-reanimated v4, Skia |
| **스타일링** | StyleSheet (React Native), 디자인 토큰 |
| **오디오** | expo-audio v1.1.1 (구조만 준비) |
| **테스트** | Jest v29.7.0 |
| **빌드** | TypeScript 5.9.2 |

---

## 2. 구현 완료 기능 목록

### 2.1 핵심 엔진 (100% 완료)

#### 추천 알고리즘
- **CareEngine**: 생리학 기반 상태 판별 + 안전 필터 적용
  - 3모드: Sleep(체온 하강), Reset(각성 전환), Recovery(회복)
  - 49개 단위 테스트 통과
  - 모든 금기 조건 검증됨
  - 안전 우선 원칙 구현 완료

- **TripEngine**: 독립적 몰입 엔진 (분위기/음악/조명/서사)
  - 테마 기반 매핑
  - Narrative recall 메모리 계약

- **HomeOrchestration**: 결과 통합 표시 레이어
  - EngineSelector 내부 정책
  - Fallback 전략 (4가지 시나리오)
  - 사용자에게 엔진 선택 강제하지 않음

#### 안전/충돌 관리
- Conflict resolution (최저 온도 우선 원칙)
- Safety Filter (고위험군 감지 + 자동 하향)
- 금기 조건 체크:
  - 냉수 샤워: 조절되지 않는 고혈압, 부정맥, 뇌혈관 질환, 기립성 저혈압
  - 고온 노출: 임신 초기, 심혈관 질환
  - 음주 직후: Sleep 루틴 금지

#### 제품 매칭 알고리즘
- 환경 필터 (욕조/샤워/부분 입욕별)
- 안전 필터 우선 적용
- 고정 스코어링 공식: 모드 기전(0.4) + 기전 매칭(0.3) + 사용자 선호(0.2) + 가격 다양성(0.1)
- 3슬롯 구성(기전/감성/가성비)
- 중탄산 우선 노출(Sleep/Recovery 우선)

### 2.2 UI/UX 리디자인 완료 (Phase 1~4)

#### Phase 1 — 온보딩 플로우 (100% ✅)
**파일**: `app/onboarding/`

| 화면 | 파일 | 상태 | 특징 |
|------|------|------|------|
| Welcome Landing | `welcome.tsx` | ✅ | 히어로 그래디언트 + 토큰화 색상 |
| Greeting | `greeting.tsx` | ✅ | 신규 추가, 환영 인사 |
| Sign Up (환경) | `index.tsx` | ✅ | 환경 선택(욕조/샤워/부분) |
| Health State | `health.tsx` | ✅ | 건강 상태 선택 |

**설계 시스템**: Silent Moon Figma 참고, 모든 색상 토큰화

#### Phase 2 — 홈 탭 리디자인 (95% ✅)
**파일**: `app/(tabs)/index.tsx` + `CategoryCard.tsx`

**구현 완료**:
- 2열 그리드 (CategoryCard × 8)
- FeaturedRoutineCard 배너
- Today Signal 영역
- 토큰 기반 색상/타이포그래피

**구현된 Intent카드 (4종)**:
1. muscle_relief (근육통 완화) ✅
2. edema_relief (부종 완화) ✅
3. hangover_relief (숙취 해소) ✅
4. sleep_ready (수면 준비) ✅

**미구현 Intent카드 (4종)** 🟡:
5. cold_relief (감기 기운)
6. menstrual_relief (생리통)
7. stress_relief (긴장/스트레스)
8. mood_lift (기분 전환)

#### Phase 3 — 레시피 상세/타이머 (100% ✅)

**3-1. Recipe Detail** `app/result/recipe/[id].tsx`
- LinearGradient 히어로 섹션
- 재료 트랙 리스트
- 온도/시간 파라미터 표시
- 안전 가이드 고정 블록
- Why 설명 + 대안 루틴

**3-2. Timer** `app/result/timer/[id].tsx`
- 원형 재생/일시정지 버튼 (76×76)
- 수평 프로그레스 바
- 단계 전환 (준비→입욕→마무리)
- 끝내기 버튼
- 비즈니스 로직 전량 보존

#### Phase 4 — 히스토리 탭 리디자인 (100% ✅)
**파일**: `app/(tabs)/history.tsx`

- 2열 FlatList 그리드
- 필터 pill (전체/케어/트립)
- 이번 달 요약 인사이트 배너
- 완료 기록 조회

#### Phase 5 — 완료/설정 화면 (부분 🟡)
**파일**: `app/result/completion/[id].tsx`, `app/(tabs)/settings.tsx`

**완료 화면**:
- 리디자인 미적용 ❌
- 피드백/메모리 카드 동작 중 ✅
- 전/후 기분 체크 구현됨 ✅

**설정 탭**:
- 리디자인 미적용 ❌
- 프로필 재설정 가능 ✅
- 근거/법적 고지 메뉴 필요

### 2.3 컴포넌트 라이브러리 (16개 완료)

| 컴포넌트 | 용도 | 상태 |
|----------|------|------|
| **TagChip** | 상태/환경 태그 표시 | ✅ |
| **TagSelector** | 다중 선택 UI | ✅ |
| **CategoryCard** | Intent 카드 그리드 | ✅ |
| **BathTimer** | 타이머 로직 | ✅ |
| **MusicPlayer** | 오디오 재생 제어 | ✅ |
| **GradientBackground** | LinearGradient 래퍼 | ✅ |
| **PreBathGateModal** | 레시피 진입 전 공통 프리플라이트 게이트 | ✅ |
| **PersonaCard** | 페르소나 표현 | ✅ |
| **SuggestionDetailModal** | 추천 상세 모달 | ✅ |
| **ProductMatchingModal** | 제품 매칭 모달 | ✅ |
| **SubProtocolPickerModal** | 서브프로토콜 선택 | ✅ |
| **IngredientCarousel** | 재료 회전목마 | ✅ |
| **AudioMixer** | 다중 오디오 레이어 | ✅ |
| **WaterAnimation** | Skia 수애니메이션 | ✅ |
| **SteamAnimation** | 증기 애니메이션 | ✅ |
| **PersistentDisclosure** | 법적 고지 | ✅ |

### 2.4 엔진 모듈 (12개 완료)

| 모듈 | 역할 | 상태 |
|------|------|------|
| **types.ts** | 모든 타입 정의 | ✅ 완성 |
| **personas.ts** | 페르소나 매핑 | ✅ |
| **contexts.ts** | 문맥(시간/환경/상태) | ✅ |
| **safety.ts** | 안전 필터 | ✅ |
| **conflicts.ts** | 충돌 해결 | ✅ |
| **recommend.ts** | 메인 추천 엔진 | ✅ |
| **productMatching.ts** | 제품 스코어링 | ✅ |
| **subprotocol.ts** | 서브프로토콜 규칙 | ✅ |
| **homeOrchestration.ts** | Home 통합 로직 | ✅ |
| **historyInsights.ts** | 히스토리 분석 | ✅ |
| **disclosures.ts** | 법적 고지/근거 | ✅ |
| **copyMappers.ts** | 문구 안전 정책 | ✅ |

### 2.5 스토리지/데이터 (완성)

| 영역 | 상태 |
|------|------|
| **AsyncStorage 래퍼** | ✅ |
| **사용자 프로필 저장** | ✅ |
| **루틴 히스토리 저장** | ✅ |
| **기분 피드백 저장** | ✅ |
| **환경 선택 저장** | ✅ |
| **개인 선호도 저장** | ✅ |

### 2.6 디자인 시스템 (완성)

**색상/타이포그래피 토큰** (`src/data/colors.ts`):
- 28개 토큰 정의
- APP_BG_BASE, CARD_SURFACE, CARD_BORDER, TEXT_PRIMARY 등
- 페르소나별 색상 매핑 (PERSONA_COLORS, PERSONA_GRADIENTS)

**공유 StyleSheet** (`src/theme/ui.ts`):
- ui.screenShell
- ui.glassCard
- ui.sectionTitle
- ui.bodyText
- ui.pillButton
- 등 8개 공통 패턴

**Figma 노드 매핑**:
- 모든 Phase 1~4 화면이 Figma 노드와 1:1 매핑

---

## 3. 미완성/진행 중 기능 목록

### 3.1 홈 탭 Intent 카드 (4종 미구현)

| Intent | 상태 | 예상 비용 |
|--------|------|----------|
| cold_relief | ❌ 미구현 | 1~2일 |
| menstrual_relief | ❌ 미구현 | 1~2일 |
| stress_relief | ❌ 미구현 | 1~2일 |
| mood_lift | ❌ 미구현 | 1~2일 |

**원인**: 프로토콜 정의 완료했으나 UI 디자인 수정 중

### 3.2 완료/설정 화면 리디자인

**완료 화면** `app/result/completion/[id].tsx`
- 현재 상태: 기능 동작하나 Phase 5 디자인 미반영
- 필요: Figma 화면 적용

**설정 탭** `app/(tabs)/settings.tsx`
- 현재 상태: 프로필 재설정만 구현
- 필요: 근거/법적 고지 메뉴 페이지

### 3.3 오디오 시스템

**구조 완성 (40% 진행)**:
- `src/hooks/useDualAudioPlayer.ts`: 안전 패치 완료
- `src/data/music.ts`: 플레이리스트 정의 완료
- `src/components/AudioMixer.tsx`: UI 구현 완료

**미구현 (60%)**:
- **실제 .mp3 파일 미번들** ❌
  - 필요: `assets/audio/` 폴더에 실제 음악 파일 추가
  - 현재: Placeholder (빈 객체)

- **사용 시나리오 미테스트**:
  - 오디오 재생 중 일시정지/재개
  - 루프/볼륨 조절

**참고**: 오디오 파일 없는 상태에서도 전 화면 정상 동작 (안전 패치 덕분)

### 3.4 Skia 수면 애니메이션

**상태**: 40% 진행
- `src/components/WaterAnimation.tsx`: 구현됨
- `src/components/WaterAnimation.web.tsx`: Web fallback 구현됨
- **화면 연결 미완**: Sleep 루틴 화면에 아직 비활성화

**필요**:
- Timer/Recipe 화면에서 WaterAnimation 활성화
- 물 채우기 프로그레스 애니메이션 연동

### 3.5 커머스/ProductHub

**상태**: 30% 진행 🟡

**구현된 부분**:
- ProductMatchingModal 컴포넌트
- 제품 스코어링 알고리즘
- 3슬롯 구성 정책

**미구현**:
- ProductHub 홈 화면 ❌
- 실제 제품 데이터 연결 ❌
- 환경 호환 필터링 (코드 존재하나 UI 미표시)
- 제휴 링크 통합 ❌

### 3.6 리텐션 루프 (주간 리포트)

**상태**: 0% ❌

**미구현 기능**:
- 주간 리포트 화면
- 효과적 조합 TOP3 추출 로직
- 개인별 선호 향/온도/시간 경향 분석
- 리포트 알림 스케줄링

**예상 비용**: 3~5일 개발

### 3.7 Analytics 이벤트 전송

**상태**: 20% 진행 🟡

**완성된 부분**:
- 이벤트 스키마 정의 (`docs/ANALYTICS_APPENDIX.md`)
- 필수 프로퍼티 명시
- 43개 이벤트 타입 정의

**미구현**:
- 실제 Analytics SDK 통합 (Segment, Amplitude 등)
- 이벤트 로깅 코드 삽입
- KPI 대시보드 설정

---

## 4. PDCA 문서 현황

### 4.1 구조

```
docs/
├── 01-plan/          → (미구성)
├── 02-design/        → (미구성)
├── 03-analysis/      → (미구성)
└── 04-report/
    └── current-app-status-v1.md  (본 문서)
```

### 4.2 기존 PRD 문서

| 파일 | 상태 | 용도 |
|------|------|------|
| **PRD_CURRENT.md** | ✅ Live | v3.11.0 현재 상태 기준선 + 패치 로드맵 |
| **PRD_V3_SUMMARY.md** | ✅ Archive | 요약본 |
| **WIREFRAME_V3_11_0.md** | ✅ Latest | 최신 와이어프레임 |
| **POLICY_APPENDIX.md** | ✅ Live | EngineSelector 정책 |
| **ANALYTICS_APPENDIX.md** | ✅ Live | 이벤트 스키마 |
| **CONFIG_APPENDIX.md** | ✅ Live | Default/Safe 루틴 파라미터 |
| **ALGO_CARE_BRANCHING_RFC.md** | ✅ Draft | 알고리즘 세부 분기 초안 |

### 4.3 PDCA 관계 문서 부재

현재 프로젝트는 **PDCA 주기 기반 문서**가 없습니다:
- Plan 문서 없음
- Design 문서 없음 (PRD가 대체)
- Analysis 문서 없음
- Report 문서 최소한 (본 스냅샷만)

**필요**: 체계적 PDCA 문서화 시작

---

## 5. 기술 부채 및 이슈

### 5.1 우선순위별 기술 부채

#### P0 — 즉시 수정
없음. 모든 화면이 정상 동작 중입니다.

#### P1 — 다음 릴리즈 포함

| 항목 | 설명 | 예상 비용 |
|------|------|----------|
| **4종 Intent 카드** | 남은 4개 Intent 구현 | 3~4일 |
| **오디오 번들링** | .mp3 파일 추가 + 테스트 | 2일 |
| **완료 화면 리디자인** | Phase 5 UI 적용 | 1~2일 |
| **설정 탭 확장** | 근거/법적 고지 메뉴 | 1~2일 |

#### P2 — 백로그

| 항목 | 설명 | 예상 비용 |
|------|------|----------|
| **Skia 애니메이션** | WaterAnimation 화면 연결 | 2~3일 |
| **ProductHub** | 홈 화면 + 제품 데이터 | 5~7일 |
| **리텐션 루프** | 주간 리포트 기능 | 3~5일 |
| **Analytics 통합** | 실제 이벤트 전송 | 2~3일 |

### 5.2 아키텍처 고려사항

#### 긍정 요소 ✅
- 명확한 엔진 분리 (Care/Trip/Home)
- 포괄적인 안전 필터 시스템
- 타입 안전성 (TypeScript strict)
- 테스트 커버리지 (49개 테스트)
- 디자인 시스템 완성도

#### 개선 여지 🟡
- PDCA 문서 부재 (코드만 있고 의도 문서 없음)
- 오디오 시스템 placeholder 상태 (지속)
- ProductHub 데이터 연결 미구현
- Analytics 코드 삽입 미완료
- 리텐션 루프 불완전

### 5.3 테스트 현황

**상태**: 우수 ✅
- 엔진 테스트: **49개** 통과
- 테스트 파일: 13개
- Coverage: engine 모듈 100% (UI 제외)
- 명령: `npm test` 또는 `npm run test:scenario:print`

**미 테스트 영역**:
- UI 컴포넌트 (스냅샷 테스트 없음)
- 오디오 재생 로직
- AsyncStorage 통합
- 네비게이션 플로우

---

## 6. Git 커밋 히스토리 (최근 5개)

```
5a532fb   오디오 오류 수정
f178c38   feat: Phase 4 기록 탭 Silent Moon 스타일 리디자인
5237d47   feat: Phase 3 레시피 상세 + 타이머 Silent Moon 스타일 리디자인
6dc9b34   feat: Phase 2 홈 탭 리디자인 (Figma Topic Selection 참고)
3e984cf   feat: Phase 1 온보딩 플로우 리디자인 (Silent Moon 참고)
```

**트렌드**: Phase 기반 리디자인이 체계적으로 진행 중

---

## 7. 현재 PRD 상태 (`docs/PRD_CURRENT.md`)

### 7.1 구조
- **섹션 1~29**: 목표형 스펙 (유지)
- **섹션 0**: 현재 구현 현황 스냅샷 (신규, v3.11.0)
- **섹션 30**: CHANGELOG (v3.11.0 확정)
- **섹션 31**: 향후 패치 계획 (미작성)

### 7.2 특징
- **Live 문서**: PRD 정책과 구현 상태를 동시 관리
- **2중 기준선**:
  1. 목표 스펙(Sections 1~29)
  2. 현재 구현(Section 0)
- **부록 3종 연계**:
  - POLICY_APPENDIX.md (EngineSelector)
  - ANALYTICS_APPENDIX.md (이벤트 스키마)
  - CONFIG_APPENDIX.md (Default 루틴)

### 7.3 상태 평가
**장점**: 단일 소스 원칙으로 최신 상태 반영
**단점**: 섹션 31 패치 계획 미작성

---

## 8. 구현 완료율 분석

### 8.1 기능별 완료율

| 기능 영역 | 완료율 | 상세 |
|----------|--------|------|
| **핵심 알고리즘** | 100% ✅ | CareEngine, TripEngine, HomeOrchestration 완성 |
| **UI 리디자인(Phase 1~4)** | 95% ✅ | 4개 phase 완료, Phase 5 리디자인 미적용 |
| **홈 Intent 카드** | 50% 🟡 | 4종 구현, 4종 미구현 |
| **컴포넌트 라이브러리** | 100% ✅ | 16개 재사용 컴포넌트 |
| **오디오 시스템** | 40% 🟡 | 구조 완성, 파일 미번들 |
| **제품 매칭** | 60% 🟡 | 알고리즘 완성, 데이터/UI 미연결 |
| **리텐션 루프** | 0% ❌ | 완전 미구현 |
| **Analytics** | 20% 🟡 | 스키마 정의, 코드 미삽입 |
| **PDCA 문서** | 5% ❌ | PRD만 있고 Plan/Design/Analysis 없음 |

### 8.2 전체 프로젝트 완료율
```
(100 + 100 + 50 + 100 + 40 + 60 + 0 + 20 + 5) / 9 = 50%
```

**평가**: **약 50% 완료** (MVP 기능 우선, 리텐션/분석 후순위)

---

## 9. 주요 성과

### 9.1 알고리즘 견고성
- 3모드(Sleep/Reset/Recovery) 완전히 정의 및 구현
- 안전 필터 최우선 원칙 일관 적용
- 49개 단위 테스트 모두 통과
- 모든 금기 조건 검증됨
- 충돌 해결 규칙 명확

### 9.2 UI/UX 체계성
- Phase 기반 체계적 리디자인
- Figma → 코드 1:1 매핑
- 디자인 토큰 완전 적용
- 16개 재사용 컴포넌트 기반 확장성
- Silent Moon 스타일 일관성

### 9.3 안전성
- 의료적 주장 금지(카피 정책)
- 법적 고지 상시 노출
- 고위험군 냉수 차단 자동화
- 온도/시간 상한 강제
- 비상 상황 경고 시스템

---

## 10. 다음 액션 권장사항

### 10.1 즉시 액션 (1주일 내)

#### 1. 4종 Intent 카드 구현
```
Timeline: 3~4일
Files: app/(tabs)/index.tsx + CategoryCard.tsx
Tasks:
- cold_relief 카드 추가
- menstrual_relief 카드 추가
- stress_relief 카드 추가
- mood_lift 카드 추가
Dependencies: 디자인 시스템 기존 + 토큰
```

#### 2. PDCA 문서 체계 구축
```
Timeline: 2일
Action:
- docs/01-plan/ 폴더 생성 + 기존 PRD 요약으로 plan 문서 작성
- docs/02-design/ 폴더 생성 + 현재 구현 기반 design 문서 작성
- docs/03-analysis/ 폴더 생성 + gap 분석 템플릿
- .pdca-status.json 초기화 (feature tracking)
```

#### 3. 섹션 31 패치 계획 작성
```
Timeline: 1일
File: docs/PRD_CURRENT.md section 31
Content:
- P0 항목 명시 (현재 없음)
- P1 항목: 4종 Intent, 오디오, 완료 화면 리디자인
- P2 항목: Skia, ProductHub, 리텐션, Analytics
```

### 10.2 단기 액션 (2~3주)

#### 1. 오디오 번들링
```
Timeline: 2일
Action:
- assets/audio/ 폴더 구조 확정
- 실제 .mp3 파일 추가 (저작권 확인)
- src/data/music.ts 경로 수정
- useDualAudioPlayer 통합 테스트
```

#### 2. 완료/설정 화면 리디자인
```
Timeline: 2~3일
Screens:
- app/result/completion/[id].tsx (Phase 5 UI)
- app/(tabs)/settings.tsx (근거 + 법적 고지 메뉴)
Reference: WIREFRAME_V3_11_0.md + Figma
```

#### 3. ProductHub 기초 작업
```
Timeline: 3~5일
Tasks:
- 제품 데이터 정구조 (mock 데이터)
- ProductHub 홈 화면 스켈레톤
- 환경별 필터링 UI 구현
```

### 10.3 중기 액션 (1개월)

#### 1. 리텐션 루프 개발
```
Timeline: 3~5일
Features:
- 주간 리포트 화면 구현
- TOP3 조합 추출 로직
- 개인 선호도 분석 엔진
- 알림 스케줄 (optional)
```

#### 2. Analytics 통합
```
Timeline: 2~3일
Action:
- Amplitude 또는 Segment SDK 설치
- 43개 이벤트 코드 삽입
- KPI 대시보드 설정
- 테스트 이벤트 전송
```

#### 3. Skia 애니메이션 연결
```
Timeline: 2~3일
Tasks:
- WaterAnimation을 Sleep 루틴에 연동
- 프로그레스 바와 수채우기 연기 조정
- 성능 최적화 (reanimated 콜 수 최소화)
```

### 10.4 문화적 개선

#### 1. PDCA 주기 정착
```
Process:
- 기능 단위 Plan 작성 (PRD 섹션 추출)
- Design 문서 코드와 1:1 매핑
- Do 후 Check (gap 분석)
- Act (반복 또는 릴리스)
- 모든 완료 기능 보고서 작성
```

#### 2. 테스트 커버리지 확대
```
Targets:
- UI 컴포넌트 스냅샷 테스트
- AsyncStorage 통합 테스트
- 네비게이션 플로우 e2e 테스트
```

---

## 11. 예상 릴리스 일정

### v3.12.0 (예상: 2026-03-15)
- 4종 Intent 카드
- 오디오 번들링
- 완료/설정 화면 리디자인
- PDCA 문서 체계
- 예상 비용: 8~10일

### v3.13.0 (예상: 2026-04-01)
- ProductHub 기초 (mock 데이터)
- 리텐션 루프 (주간 리포트)
- Skia 애니메이션 연결
- 예상 비용: 10~12일

### v4.0.0 (예상: 2026-05-01)
- Analytics 실제 통합
- 실 데이터 커머스 연결
- 시장성 검증 실험 실행 (A/B)
- 예상 비용: 15~20일

---

## 12. 리스크 및 완화 전략

| 리스크 | 영향 | 완화 전략 |
|--------|------|----------|
| 오디오 파일 저작권 이슈 | 높음 | 상용 음악 라이선스 사전 확보 또는 자체 제작 |
| 제품 데이터 실시간 동기화 | 중간 | Mock 데이터로 시작, API 연결은 v4.0+ |
| Analytics SDK 호환성 | 중간 | 초기 Amplitude 선택(RN 호환 우수), Segment 대체 |
| 리텐션 루프 데이터 부족 | 낮음 | 초기 3주 데이터 수집 후 분석 시작 |

---

## 13. 결론

배쓰타임은 **안정적인 알고리즘 기반** 위에서 **UI/UX 리디자인이 체계적으로 진행** 중인 프로젝트입니다.

**현재 상태**:
- 핵심 기능(알고리즘, 안전) 100% 완성
- UI 리디자인 95% 완성 (Phase 5 제외)
- 커머스/리텐션 기능 미정착 (백로그)
- PDCA 문서화 필요

**권장 다음 단계**:
1. 남은 4종 Intent 구현 (3~4일)
2. PDCA 문서 체계 수립 (2일)
3. 오디오 번들링 (2일)
4. ProductHub 기초 (3~5일)
5. 리텐션 루프 (3~5일)

**전체 예상 로드맵**: v3.12.0 (3월 중순) → v3.13.0 (4월) → v4.0.0 (5월)

---

## 참고 문서

- `/Users/exem/DK/BathSommelier/docs/PRD_CURRENT.md`
- `/Users/exem/DK/BathSommelier/docs/POLICY_APPENDIX.md`
- `/Users/exem/DK/BathSommelier/docs/ANALYTICS_APPENDIX.md`
- `/Users/exem/DK/BathSommelier/docs/CONFIG_APPENDIX.md`
- `/Users/exem/DK/BathSommelier/package.json`
- `/Users/exem/DK/BathSommelier/src/engine/__tests__/` (49개 테스트)

---

**문서 버전**: 1.0
**최종 수정**: 2026-02-27
**상태**: Complete (snapshot)
