# ë°°ì°íì v3.11.0 Wireframe Spec

WireframeSpecVersion: `v3.11.0`
기준일: 2026-02-27
작성 기준: **현재 구현 완료 상태** (목표 스펙이 아닌 실제 코드 기준)

기준 문서:
- PRD: `docs/PRD_CURRENT.md` (v3.11.0)
- 디자인 레퍼런스: Silent Moon Figma `4452-*`
- 디자인 시스템: `/CLAUDE.md`
- 이전 와이어프레임(목표 스펙): `docs/WIREFRAME_V3_10_2.md`

---

## 1. IA & 화면 구조

```
앱 진입
  └─ app/index.tsx → (온보딩 완료 여부에 따라)
       ├─ [미완료] → /onboarding/welcome
       └─ [완료]   → /(tabs)

온보딩 플로우 (1회성)
  /onboarding/welcome
    └─ /onboarding/index        (환경 선택)
         └─ /onboarding/health  (건강 상태)
              └─ /onboarding/greeting (완료 축하)
                   └─ /(tabs)  [replace]

메인 탭 (3탭 고정)
  /(tabs)/index     → 홈
  /(tabs)/history   → 기록
  /(tabs)/settings  → 설정

루틴 실행 플로우
  /(tabs)/index
    └─ /result/recipe/[id]   (레시피 상세)
         └─ /result/timer/[id]  (타이머 실행)
              └─ /result/completion/[id]  (완료)
                   └─ /(tabs) or /(tabs)/history  [replace]
```

---

## 2. 공통 디자인 패턴

```
──────────────────────────────────────
타입 스케일
──────────────────────────────────────
HEADING_LG   30sp  fontWeight:700/800  - 온보딩 타이틀
HEADING_MD   22sp  fontWeight:700/800  - 섹션 타이틀
TITLE        18sp  fontWeight:600/700  - 카드 타이틀
BODY         14sp  fontWeight:400      - 본문
CAPTION      12sp  fontWeight:400      - 보조 텍스트

──────────────────────────────────────
컴포넌트 패턴
──────────────────────────────────────
대형 CTA 버튼    → borderRadius:38, height:63, full-width
소형 pill 버튼   → borderRadius:999
Glass 카드       → CARD_SURFACE + borderWidth:1 + CARD_BORDER + shadow
히어로 영역      → LinearGradient(colorHex→colorHex+'BB'), borderBottomRadius:30
원형 버튼        → 정사각형 + borderRadius = 절반
```

---

## 3. 화면 명세 (W01~W10)

> 각 화면은 실제 구현 기준으로 기술한다.
> 레이아웃은 ASCII로 표현하며, 핵심 state와 navigation을 함께 기록한다.

---

### W01 Welcome — `app/onboarding/welcome.tsx`

**goal**: 브랜드 첫 인상, 시작하기 진입

```
┌────────────────────────────────────┐
│ [파도 배경 이미지: absolute]        │
│                                    │
│   Bath 🛁 Sommelier    (로고 행)   │
│                                    │
│   [일러스트 영역: 절대 배치]         │
│   (욕조 + 버블 + 스팀 SVG)         │
│                                    │
│   ────────────────────────────     │
│   맞춤형 목욕 루틴              │
│   당신의 오늘을 위한             │
│   ë°°ì°íì                   │
│   ────────────────────────────     │
│                                    │
│  ┌──────────────────────────────┐  │
│  │          시작하기            │  │  ← BTN_PRIMARY, h:63, r:38
│  └──────────────────────────────┘  │
│                                    │
│    이미 사용 중이신가요? [건너뛰기] │
│                                    │
│ [홈 인디케이터 라인]               │
└────────────────────────────────────┘
```

**state**: 없음 (정적)
**entry**: 앱 첫 실행 (onboardingComplete = false)
**exit**:
- `시작하기` → `/onboarding/index`
- `건너뛰기` → (미구현)

**구현 특이사항**:
- Figma 픽셀 기반 `sx()`, `sy()` 스케일 함수 사용 (DW:414, DH:896 캔버스)
- 일러스트는 50개+ 절대 위치 SVG 요소

---

### W02 환경 선택 — `app/onboarding/index.tsx`

**goal**: 사용자의 목욕 환경 선택 (1/2단계)

```
┌────────────────────────────────────┐
│ SafeAreaView (APP_BG_BASE)         │
│                                    │
│  ←  (backButton 44×44)            │
│                                    │
│  나의 목욕 환경을                   │
│  선택해주세요.         (HEADING_LG) │
│  목욕 방법에 따라 루틴이 달라져요.  │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ 🛁  욕조 입욕          ✓     │ │  ← selected: ACCENT 테두리 + 배경
│ │      몸 전체를 담그는 욕조    │ │
│ └────────────────────────────────┘ │
│ ┌────────────────────────────────┐ │
│ │ 🚿  샤워              　     │ │
│ │      샤워기를 이용한 목욕     │ │
│ └────────────────────────────────┘ │
│ ┌────────────────────────────────┐ │
│ │ 🦶  족욕/반신욕       　     │ │
│ │      발이나 하체만 담그는     │ │
│ └────────────────────────────────┘ │
│                                    │
│              01 / 02               │
│                                    │
│  ┌──────────────────────────────┐  │
│  │            다음              │  │  ← disabled until selected
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

**state**:
```
selected: BathEnvironment | null
```

**entry**: `/onboarding/welcome` 시작하기
**exit**: `다음` → `/onboarding/health?environment=<id>`

**카드 스타일**: paddingVertical:20, paddingHorizontal:20, borderRadius:18, borderWidth:1.5

---

### W03 건강 상태 선택 — `app/onboarding/health.tsx`

**goal**: 안전 필터용 건강 조건 수집 (2/2단계)

```
┌────────────────────────────────────┐
│ SafeAreaView (APP_BG_BASE)         │
│                                    │
│  ←  (backButton)                  │
│                                    │
│  건강 상태를 선택해주세요.           │
│                      (HEADING_LG)  │
│  해당하는 항목을 모두 선택해주세요. │
│                                    │
│  ┌──────────┐ ┌──────────┐        │
│  │ 고혈압·심장│ │  임산부  │        │
│  └──────────┘ └──────────┘        │
│  ┌──────────┐ ┌──────────┐        │
│  │  당뇨    │ │ 민감성피부│        │
│  └──────────┘ └──────────┘        │
│  ┌──────────────────────┐         │
│  │    해당 없음         │         │  ← 선택 시 다른 모두 해제
│  └──────────────────────┘         │
│                                    │
│              02 / 02               │
│                                    │
│  ┌──────────────────────────────┐  │
│  │            완료              │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

**state**:
```
selectedConditions: Set<HealthCondition>
// 복수 선택 가능. 'none' 선택 시 독점 (다른 항목 자동 해제)
```

**entry**: `/onboarding/index` 다음
**exit**: `완료` → 프로필 저장 → `/onboarding/greeting`

**컴포넌트**: `TagChip` (accentColor = 조건별 색상)

---

### W04 완료 축하 — `app/onboarding/greeting.tsx`

**goal**: 온보딩 완료 축하, 메인 앱 진입 동기부여

```
┌────────────────────────────────────┐
│  LinearGradient (ACCENT→#6A85BF)  │
│                                    │
│  ○ ○ ○  (동심원 장식: absolute)   │
│  ☁ ☁ ☁  (클라우드: absolute)    │
│                                    │
│                                    │
│   환영합니다!          (HEADING_LG │
│   당신만의 목욕 루틴을              │  ← #FFECCC, 순차 FadeIn+Y
│   시작해볼게요.                    │
│                                    │
│   맞춤 레시피와 함께               │  ← rgba(white, 0.85)
│   특별한 시간을 만들어드릴게요.    │
│                                    │
│            🛁 (80sp)              │
│                                    │
│                                    │
│  ┌──────────────────────────────┐  │
│  │          시작하기            │  │  ← rgba(white, 0.95)
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

**애니메이션**: 순차 FadeIn + translateY (300ms 딜레이, title 600ms → subtitle 500ms → cta 500ms)
**entry**: `/onboarding/health` 완료
**exit**: `시작하기` → `/(tabs)` (router.replace)

---

### W05 홈 탭 — `app/(tabs)/index.tsx`

**goal**: 오늘의 맞춤 루틴 의도 선택

```
┌────────────────────────────────────┐
│ View (APP_BG_BASE)                 │
│                                    │
│  지금은 잠들기 준비 시간이네요.      │  ← 시간대별 동적 문구
│  오늘 컨디션에 맞춰 루틴을 시작해보세요.
│                                    │
│  [🛁 욕조] [🚿 샤워] [🦶 족욕]    │  ← 환경 pill 선택기
│                                    │
│  ── 케어 루틴 ───────────────────  │
│  ┌───────────────┐ ┌─────────────┐│
│  │ 🌿            │ │ 💤         ││
│  │ 근육통 완화   │ │ 수면 준비  ││
│  └───────────────┘ └─────────────┘│  ← CategoryCard 2열 그리드 (8종)
│  ┌───────────────┐ ┌─────────────┐│
│  │ 🍋            │ │ 🌊         ││
│  │ 숙취 해소     │ │ 부종 완화  ││
│  └───────────────┘ └─────────────┘│
│  ┌───────────────┐ ┌─────────────┐│
│  │ 🤧            │ │ 🌸         ││
│  │ 감기 기운     │ │ 생리통 완화││  ← ❌ 미구현 (4~8번)
│  └───────────────┘ └─────────────┘│
│  ┌───────────────┐ ┌─────────────┐│
│  │ 😤            │ │ 💙         ││
│  │ 스트레스 해소 │ │ 기분 전환  ││
│  └───────────────┘ └─────────────┘│
│                                    │
│  ── 트립 루틴 ───────────────────  │
│  ┌───────────────┐ ┌─────────────┐│
│  │ 🌲            │ │ ⛺         ││
│  │ 교토의 숲     │ │ 빗속 캠핑  ││
│  └───────────────┘ └─────────────┘│
│  (트립 + 6개 더)                  │
│                                    │
│  ── 최근 루틴 ────────────────────│
│  [카드] [카드] →  (수평 스크롤)   │
│                                    │
│  ── 안전 안내 (PersistentDisclosure)
└────────────────────────────────────┘
```

**state**:
```
environment: BathEnvironment          → 환경 칩 선택 상태
recentRoutines: BathRecommendation[]  → 최근 기록
isPreBathGateVisible: boolean         → 레시피 공통 프리플라이트 게이트
subModalVisible: boolean              → SubProtocolPicker 모달
selectedIntent: IntentCard | null     → 선택된 의도
```

**Care 카드 목록 (8종 / PRD Section 5-A 기준)**:
- ✅ muscle_relief (근육통 완화) — position 1
- ✅ sleep_ready (수면 준비) — position 2
- ✅ hangover_relief (숙취 해소) — position 3
- ✅ edema_relief (부종 완화) — position 4
- ❌ cold_relief (감기 기운) — position 5 / 미구현
- ❌ menstrual_relief (생리통 완화) — position 6 / 미구현
- ❌ stress_relief (스트레스 해소) — position 7 / 미구현
- ❌ mood_lift (기분 전환) — position 8 / 미구현

**환경 호환성**: 환경에 따라 일부 카드 `disabled` 처리
**정렬**: 시간대(심야)에 따라 케어/트립 순서 조정

**exit**:
- 의도 카드 → SubProtocolPickerModal → `/result/recipe/[id]`
- 최근 루틴 카드 → `/result/recipe/[id]`
- 더보기 → `/(tabs)/history`

---

### W06 기록 탭 — `app/(tabs)/history.tsx`

**goal**: 완료 기록 열람, 과거 루틴 재진입

```
┌────────────────────────────────────┐
│ View (APP_BG_BASE)                 │
│                                    │
│  기록            (HEADING_MD)      │
│  총 12개의 루틴을 완료했어요.       │
│                                    │
│ ┌──────────────────────────────┐  │
│ │ 🛁  이번 달 요약             │  │  ← insightBanner (ACCENT_LIGHT)
│ │  3회 완료 · 평균 15분        │  │
│ │  자주 선택: 교토의 숲        │  │
│ └──────────────────────────────┘  │
│                                    │
│  [전체] [케어] [트립]              │  ← 필터 pill (수평 스크롤)
│                                    │
│  ── 루틴 기록 ─────────────────── │
│  ┌──────────────┐ ┌──────────────┐│
│  │ ████████████ │ │ ████████████ ││  ← 컬러 헤더 (100h)
│  │ 🌿   [케어] │ │ 💤   [케어] ││
│  │──────────────│ │──────────────││
│  │ 근육 이완    │ │ 수면 준비   ││
│  │ 38°C · 욕조  │ │ 39°C · 샤워 ││
│  │ 2/27 🗨      │ │ 2/26        ││
│  └──────────────┘ └──────────────┘│
│  ┌──────────────┐ ┌──────────────┐│
│  │ ...          │ │ ...          ││
│  └──────────────┘ └──────────────┘│
│                                    │
│  (빈 상태 시: "아직 기록이 없어요") │
└────────────────────────────────────┘
```

**state**:
```
history: BathRecommendation[]
memoryHistory: TripMemoryRecord[]
themeWeights: Record<string, number>
filterMode: 'all' | 'care' | 'trip'   → 필터 pill 상태
```

**카드 너비**: `(screenWidth - 32 - 10) / 2`
**exit**: 카드 클릭 → `/result/recipe/[id]?source=history`

---

### W07 설정 탭 — `app/(tabs)/settings.tsx`

**goal**: 프로필 확인/수정, 앱 정보

```
┌────────────────────────────────────┐
│ LinearGradient 배경 (APP_BG_BASE)  │
│ ScrollView                         │
│                                    │
│  ── 프로필 ──────────────────────  │
│  ┌─────────────────────────────┐  │
│  │  목욕 환경    [🛁 욕조]     │  │  ← 클릭 가능 (즉시 저장)
│  └─────────────────────────────┘  │
│  ┌─────────────────────────────┐  │
│  │  건강 상태                  │  │
│  │  [고혈압·심장] [민감성피부] │  │  ← 토글 가능 (즉시 저장)
│  │  도움말 텍스트...           │  │
│  └─────────────────────────────┘  │
│                                    │
│  ── 설정 ────────────────────────  │
│  ┌─────────────────────────────┐  │
│  │  프로필 다시 설정하기     → │  │  ← Alert → /onboarding
│  └─────────────────────────────┘  │
│                                    │
│  ── 앱 정보 ─────────────────────  │
│  ┌─────────────────────────────┐  │
│  │  Version         3.2.0      │  │
│  │  App Name  ë°°ì°íì   │  │
│  └─────────────────────────────┘  │
│                                    │
│  ── 안전 안내 (PersistentDisclosure, coldWarning)
└────────────────────────────────────┘
```

**state**: `useUserProfile()` hook (profile, loading, update)
**exit**: 초기화 확인 → `/onboarding` (router.replace)

---

### W08 레시피 상세 — `app/result/recipe/[id].tsx`

**goal**: 루틴 세부사항 확인, 실행 진입

```
┌────────────────────────────────────┐
│                                    │
│ ┌──────────────────────────────┐  │
│ │  LinearGradient (colorHex)   │  │  ← HERO (height:280)
│ │                              │  │    borderBottomRadius:30
│ │  ←(40×40)       [준비단계]  │  │
│ │                              │  │
│ │           🌿 (52sp)          │  │
│ │      근육 이완 루틴          │  │  ← HEADING_MD, 800w, white
│ │         케어 모드            │  │  ← CAPTION, white
│ └──────────────────────────────┘  │
│                                    │
│ ScrollView                         │
│  ┌──────────────────────────────┐  │
│  │  38°C  │  15분  │  욕조     │  │  ← statsCard (3개 stat, 구분선)
│  └──────────────────────────────┘  │
│                                    │
│  💡 조명: 따뜻한 간접 조명         │
│                                    │
│  준비물                            │
│  재료가 많을수록 효과가 좋아요.     │
│  ┌──────────────────────────────┐  │
│  │ ①  🧴  (44×44 circle)       │  │  ← trackRow
│  │    엡솜 솔트                │  │
│  │    근육 이완, 마그네슘 흡수  │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ ②  🌿  (44×44 circle)       │  │
│  │    라벤더 오일              │  │
│  │    향기 테라피, 이완 효과   │  │
│  └──────────────────────────────┘  │
│  (추가 재료...)                    │
│                                    │
│  ⚠️ 안전한 입욕                   │
│  • 38~40°C를 권장해요.            │
│  • 어지러움 시 즉시 중단하세요.    │
│                                    │
│  [PersistentDisclosure]            │
│                                    │
└────────────────────────────────────┘
│  ┌──────────────────────────────┐  │
│  │         시작하기             │  │  ← bottom CTA (fixed), h:63
│  └──────────────────────────────┘  │
```

**state**: `recommendation: BathRecommendation | null`

**entry options**:
- 홈 → SubProtocol 선택 후 → recipe (일반 시작)
- 기록 탭 → recipe (`source=history`, 재시작 버튼)

**exit**:
- `←` → `router.back()`
- `시작하기` / `다시 시작하기` → `/result/timer/[id]`

**애니메이션**: FadeInDown 순차 (statsCard: delay:200, trackRows: 80ms 간격)

---

### W09 타이머 실행 — `app/result/timer/[id].tsx`

**goal**: 루틴 실행 중 타이머 + 오디오 컨트롤, 이탈 최소화

```
┌────────────────────────────────────┐
│  LinearGradient (APP_BG_TOP→BOTTOM)│
│  WaterAnimation / SteamAnimation   │  ← 배경 애니메이션
│                                    │
│  [×](40×40)     [끝내기](pill)    │  ← topBar, colorHex pill
│                                    │
│                                    │
│         근육 이완 루틴             │  ← 18sp, 700w
│                                    │
│            14:30                   │  ← 72sp, fontWeight:200
│                                    │
│         (일시 중지 중)             │  ← isPaused 시 표시
│                                    │
│                                    │
│  ┌──────────────────────────────┐  │
│  │           (●)                │  │  ← playButton (76×76)
│  │       ▶ / ‖               │  │    TEXT_PRIMARY 배경
│  └──────────────────────────────┘  │
│                                    │
│  ──────────────────── (진행 바)    │
│  ████████░░░░░░░░░░░░ ●           │  ← height:4 + thumb:14×14
│  00:30                    15:00    │  ← 경과 / 전체
│                                    │
│  ┌──────────────────────────────┐  │
│  │  🎵  ─────●──────           │  │  ← AudioMixer
│  │  🌊  ──────────●─           │  │
│  └──────────────────────────────┘  │
│                                    │
│  [PersistentDisclosure]            │
└────────────────────────────────────┘
```

**state**:
```
remainingSeconds: number
totalSeconds: number
isPaused: boolean
showControls: boolean         → tap-to-toggle (Pressable 전체화면)
controlsOpacity: SharedValue  → reanimated (fade in/out)
```

**timer 로직**:
- 250ms 틱 간격 (setInterval)
- `targetEndAtMs` 기반 계산 (드리프트 방지)
- 일시정지 시 `pausedAtMs` + `accumulatedPausedMs` 누적

**exit**:
- `×` → Alert "루틴을 종료할까요?" → 확인 → `/(tabs)` (clearSession)
- `끝내기` / 타이머 종료 → `updateSessionCompletion` → `/result/completion/[id]`

**오디오**: `useDualAudioPlayer` (musicPlayer + ambiencePlayer, 각각 try-catch 보호)

---

### W10 완료 화면 — `app/result/completion/[id].tsx`

**goal**: 루틴 완료 기록, 피드백 수집, 개인화 학습

```
┌────────────────────────────────────┐
│  GradientBackground (PASTEL_BG)    │
│  softOverlay (PASTEL_BG_BOTTOM)    │
│                                    │
│              🎉 (72sp)            │  ← BounceIn (800ms)
│                                    │
│           [마무리] (pill badge)    │  ← FadeIn delay:400
│                                    │
│     꿀잠 주무세요 💤              │  ← 20sp, 700w, 시간대별 메시지
│                                    │
│  ┌──────────────────────────────┐  │
│  │  📊  이번 달 3번째 루틴을    │  │  ← statsCard, FadeIn delay:600
│  │      완료했어요              │  │    count = colorHex 강조
│  └──────────────────────────────┘  │
│                                    │
│  오늘 루틴은 어떠셨나요?          │  ← feedbackSection, FadeIn delay:800
│                                    │
│  ┌──────────┐    ┌──────────┐     │
│  │  👍      │    │  👎      │     │  ← feedbackButton (선택 시 색상 변화)
│  │ 좋아요   │    │ 별로예요 │     │
│  └──────────┘    └──────────┘     │
│                                    │
│  ┌──────────────────────────────┐  │  ← memoryCard (기록 있을 때만)
│  │  이번 기록 요약              │  │    FadeIn delay:900
│  │  진행 기록: 38°C · 15분...  │  │
│  │  선호도: 근육 이완 +0.1     │  │
│  │  오늘의 한 줄 기억: ...     │  │
│  └──────────────────────────────┘  │
│                                    │
│  [PersistentDisclosure]            │
│                                    │
│  ┌──────────────────────────────┐  │
│  │          기록 보기           │  │  ← secondary (CARD_GLASS)
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │          홈으로 가기         │  │  ← primary (ACCENT)
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

**state**:
```
recommendation: BathRecommendation | null
monthlyCount: number
feedback: 'good' | 'bad' | null
memoryNarrative: string | null
themeWeight: number | null
snapshotLine: string | null
```

**side effects (useEffect)**:
1. `getRecommendationById` → `saveCompletionMemory` (narrative, themeWeight, snapshot 저장)
2. `getMonthlyCount` (월간 카운트)

**애니메이션**: 순차 FadeIn (400 → 600 → 800 → 900 → 1000ms), BounceIn (🎉)

**exit**:
- `기록 보기` → `/(tabs)/history`
- `홈으로 가기` → `/(tabs)`
- 양쪽 모두 `clearSession()` 호출 후 이동

---

## 4. 공통 오버레이 컴포넌트

### OV01 PersistentDisclosure — `src/components/PersistentDisclosure.tsx`

**배치**: 레시피 상세, 타이머, 완료, 설정 화면 하단에 고정 노출

```
┌──────────────────────────────────────┐
│  안내                            [▼] │  ← 접기/펼치기
│  배쓰타임은 의료 진단이나            │
│  치료를 하지 않습니다.              │
│  건강 상태가 걱정되면 전문가와       │
│  먼저 상담하세요.                   │
│  (고혈압·부정맥 시 냉수 주의)       │  ← showColdWarning 시 추가
└──────────────────────────────────────┘
```

### OV02 SubProtocolPickerModal — `src/components/SubProtocolPickerModal.tsx`

**배치**: 홈 탭에서 족욕/반신욕 세부 선택 시 표시

```
┌─── bottom sheet ─────────────────────┐
│  partial_bath 세부 선택              │
│  ○ 족욕 (footbath)                  │
│  ○ 반신욕 (low_leg)                 │
│                                      │
│  [취소]                   [확인]    │
└──────────────────────────────────────┘
```

### OV03 PreBathGateModal — `src/components/PreBathGateModal.tsx`

**배치**: 레시피 화면 진입 직후 모든 루틴에 공통 표시, 고위험 조건이면 추가 항목 부착

### OV04 SuggestionDetailModal — `src/components/SuggestionDetailModal.tsx`

**배치**: (홈 탭에서 추천 카드의 "이유" 상세 보기 시)

---

## 5. 내비게이션 플로우 전체

```
[앱 시작]
    │
    ├─ 온보딩 미완료
    │   welcome → index(환경) → health(건강) → greeting(축하) ──┐
    │                                                           │
    └─ 온보딩 완료                                              │
        └─────────────────────────────────────────────────────→ /(tabs)
                                                                │
                    ┌───────────────┬───────────────┐          │
                    ▼               ▼               ▼          │
                  홈(index)     기록(history)  설정(settings)  │
                    │               │                          │
                    │  (카드 탭)    │  (카드 탭)              │
                    ▼               ▼                          │
                recipe/[id]     recipe/[id]                   │
                    │               │                          │
                    │ 시작하기      │ 다시 시작하기            │
                    ▼               ▼                          │
                timer/[id] ──────────────────────────         │
                    │                                          │
                    │ 끝내기/완료                             │
                    ▼                                          │
               completion/[id]                                │
                    │                                          │
                    ├─ 홈으로 ──────────────────────────────→ │
                    └─ 기록보기 ─────────────→ history        │
```

---

## 6. 데이터 플로우

```
[온보딩]
  UserProfile { bathEnvironment, healthConditions, onboardingComplete }
      → storage/profile.ts (AsyncStorage)

[홈 탭]
  homeOrchestration(profile, tags, environment)
      → HomeOrchestrationContract
      → CategoryCard 렌더링

[레시피 상세]
  getRecommendationById(id)
      → BathRecommendation
      → 화면 렌더링

[타이머]
  saveSession({ recommendationId, startedAt })
  updateSessionCompletion({ completedAt, actualDurationSeconds })
      → storage/session.ts

[완료]
  saveCompletionMemory(recommendation, feedback, overrides)
      → TripMemoryRecord { narrativeRecallCard, themePreferenceWeight, completionSnapshot }
      → storage/memory.ts
  updateRecommendationFeedback(id, feedback)
      → storage/history.ts
```

---

## 7. 상태 모델 (화면별 주요 로딩/에러 상태)

| 화면 | 로딩 상태 | 빈 상태 | 에러 처리 |
|------|----------|---------|-----------|
| 홈 | useEffect (프로필 로드) | 기본 추천 제공 | 레시피 진입 후 PreBathGateModal |
| 기록 | useEffect (history 로드) | 빈 상태 일러스트 + 텍스트 | 없음 |
| 설정 | useUserProfile loading | — | — |
| 레시피 | `if (!recommendation) return <loading>` | — | router.back() |
| 타이머 | `if (!recommendation) return <loading>` | — | — |
| 완료 | `if (!recommendation) return <loading>` | — | — |

---

## 8. 미구현 화면 (목표 스펙 존재, 현재 없음)

> v3.10.2 와이어프레임 대비 아직 구현되지 않은 화면들.

| v3.10.2 ID | 화면 | 상태 | 참고 |
|---|---|---|---|
| W06 | Home - no product candidates | ❌ | `ROUTINE_ONLY_NO_COMMERCE` fallback |
| W09 | Product matching (A/B/C slots) | 🟡 | `ProductMatchingModal` 컴포넌트 존재, 화면 미완 |
| W10 | ProductHub (shopping layer) | ❌ | 미구현 |
| W11 | Product detail (Care) | ❌ | 미구현 |
| W12 | Product detail (Trip bundle) | ❌ | 미구현 |
| — | 주간 리포트 / 리텐션 루프 | ❌ | PRD §10 참조 |
| — | Sommelier AI 채팅 | ❌ | PRD §20 참조 |

---

## 9. 디자인 시스템 참조

```
토큰 파일: src/data/colors.ts
  → APP_BG_BASE, APP_BG_TOP, APP_BG_BOTTOM
  → CARD_SURFACE, CARD_BORDER, CARD_SHADOW
  → TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED
  → ACCENT, BTN_PRIMARY, BTN_DISABLED
  → PERSONA_COLORS, PERSONA_GRADIENTS
  → CATEGORY_CARD_COLORS, CATEGORY_CARD_EMOJI
  → TYPE_HEADING_LG(30), TYPE_HEADING_MD(22), TYPE_TITLE(18), TYPE_BODY(14), TYPE_CAPTION(12)

공유 StyleSheet: src/theme/ui.ts
  → ui.screenShell, ui.glassCard, ui.sectionTitle
  → ui.titleHero, ui.bodyText, ui.pillButton

아이콘: @expo/vector-icons (FontAwesome)
애니메이션: react-native-reanimated v4
그라데이션: expo-linear-gradient
햅틱: useHaptic hook (src/hooks/useHaptic.ts)
```

---

## 10. QA 체크리스트

### 플로우
- [ ] 온보딩 완료 후 재실행 시 홈으로 직행
- [ ] `source=history`인 레시피에서 replay 문맥이 PreBathGateModal에 반영
- [ ] 타이머 완료/끝내기 후 completion 화면으로 정상 이동
- [ ] completion에서 홈/기록 이동 시 clearSession 호출

### 안전
- [ ] 모든 루틴에서 PreBathGateModal 표시, 고위험 조건이면 추가 항목 부착
- [ ] PersistentDisclosure 모든 핵심 화면 하단 노출
- [ ] 냉수 금기 조건에서 coldWarning 텍스트 노출 (설정 탭)

### 오디오
- [ ] 오디오 파일 없는 상태(placeholder)에서 타이머 정상 동작
- [ ] 끝내기 후 렌더 에러 없음 (try-catch 보호)

### 반응형
- [ ] screenWidth < 380 시 CategoryCard 1열 표시
- [ ] SafeAreaView 노치/홈바 침범 없음

### 상태 유지
- [ ] 타이머 실행 중 앱 백그라운드 → 재진입 시 시간 계산 정확
- [ ] 필터 pill 선택 후 기록 목록 정상 필터링
