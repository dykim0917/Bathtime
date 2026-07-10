# Design System — 바스타임

## 1. Product Context

- **What this is:** 집 안팎의 바스타임을 발견하고, 저장하고, 바로 따라 해볼 수 있게 돕는 바스타임 아카이브 서비스.
- **One-line definition:** 좋은 바스타임을 발견하고, 저장하고, 바로 따라 해볼 수 있는 아카이브.
- **Core value:** 씻는 시간을 의식으로.
- **English line:** Turning the bath into ritual.
- **Who it's for:** 퇴근 후 혼자만의 시간이 필요한 서울의 30대. 집에서는 샤워나 족욕 정도가 현실적이지만, 좋은 사우나·스파·욕조 있는 숙소·홈스파 세팅·바디케어 아이템에도 관심이 있는 사용자.
- **Space/industry:** 바스 리추얼 아카이브, 홈스파 콘텐츠, 사우나/스파/숙소 탐색, 바스타임 실행 도구, 웰니스 큐레이션.
- **Project type:** 웹/앱 공통 콘텐츠 아카이브 + 저장/루틴/제보 실행 도구.
- **Primary platform stance:** P0에서는 웹이 유입과 콘텐츠 탐색의 중심이고, 앱은 저장·루틴·제보·개인화 실행 도구로 연결된다.

---

## 2. Strategic Shift

기존 디자인은 사용자의 욕실 사진을 근사하게 꾸미고 공유하는 `Private Bath Log`에 가까웠다.

이번 피벗 이후 바스타임은 사진 결과물 중심 서비스가 아니다. 핵심은 다음이다.

> 흩어진 바스타임 정보를 같은 기준으로 정리하고, 사용자가 필요할 때 다시 찾아보고 따라 해볼 수 있게 만드는 것.

따라서 디자인은 감성 사진 앱보다 **가볍게 읽히는 아카이브**, **신뢰 가능한 정보 카드**, **저장하고 실행하기 쉬운 콘텐츠 플랫폼**에 맞춰 재정의한다.

---

## 3. Aesthetic Direction

### Direction

**Quiet Onsen Archive + Hinoki Water Accent**

바스타임은 고급 호텔 스파처럼 무겁게 보이면 안 되고, 건강관리 앱처럼 차갑게 보여서도 안 된다. 이번 웹 개편의 표정은 일본 로컬 온천/관광 사이트처럼 사진이 먼저 호흡하고, 글은 낮은 목소리로 장소성과 쓰임을 정리하는 편집형 아카이브다.

화면은 밝고, 정돈되어 있고, 오래 다시 찾아볼 수 있는 기록처럼 보여야 한다. 동시에 물, 온기, 숲, 조용한 회복의 감각이 아주 약하게 남아 있어야 한다.

### Mood

- 밝다
- 차분하다
- 신뢰할 수 있다
- 과장하지 않는다
- 저장하고 싶다
- 따라 해볼 수 있다
- 물과 온기가 느껴진다
- 정보가 잘 정리되어 있다
- 관광 안내서처럼 장소의 결이 있다
- 흰 여백보다 옅은 안개와 종이 질감에 가깝다

### Reference Cues

- 흰 캔버스 위의 사진 중심 카드
- 따뜻한 종이색의 아카이브
- 바스/스파 사진의 깨끗한 질감
- 과하지 않은 매거진형 리스트
- 장소/아이템/루틴 정보를 비교하기 쉬운 카드
- 저장과 실행으로 이어지는 명확한 CTA
- 첫 화면의 큰 자연/물 이미지와 짧은 문장
- 얇은 구분선, 낮은 채도, 세로로 긴 섹션 호흡
- 사진 옆에 붙는 작은 정보보다 넉넉한 캡션형 문단

### Design Principle

Airbnb식 디자인에서 참고할 것은 강한 포인트 컬러가 아니라 다음 구조이다.

- 흰 캔버스를 기본으로 둔다.
- 사진과 카드가 시각적 무게를 담당한다.
- 메인 컬러는 CTA, 저장 상태, 선택 상태처럼 중요한 순간에만 쓴다.
- 그림자와 장식은 최소화한다.
- 정보는 작은 카드 안에 조용하지만 명확하게 정리한다.

바스타임의 차이는 컬러와 톤이다. 쨍한 소비자 마켓 컬러 대신 **Hinoki Teal**과 **Mist Green**을 절제해서 사용한다.

### Frontend Token Contract

이 섹션은 `apps/web`의 전역 CSS와 공통 컴포넌트가 따라야 하는 최신 토큰 계약이다.

#### Color

- Canvas: `#fbfaf6`, CSS `--canvas`, 초록기 없는 따뜻한 백지 배경.
- Surface: `#fffdf8`, CSS `--surface`, 사진과 글을 받치는 백지.
- Surface Soft: `#f1efe8`, CSS `--surface-soft`, 필터/보조 블록 배경.
- Ink: `#1f2b28`, CSS `--ink`, 순검정 대신 쓰는 본문 전경.
- Body: `#43504b`, CSS `--body`, 긴 설명문.
- Muted: `#6f7a75`, CSS `--muted`, 메타 정보.
- Primary: `#2f7871`, CSS `--primary`, 물과 히노키 사이의 포인트.
- Primary Active: `#245f59`, CSS `--primary-active`, CTA와 활성 상태.
- Primary Pressed: `#174f4b`, CSS `--bt-color-primary-pressed`, CTA hover/press 상태.
- Primary Soft: `#d8ebe5`, CSS `--primary-soft`, 선택/호버 배경.
- On Primary: `#ffffff`, CSS `--bt-color-on-primary`, primary 위 텍스트.
- Reed: `#e7dcc1`, CSS `--reed`, 종이와 나무 사이의 보조 포인트.
- Water Spotlight Gold: `#c89431`, CSS `--bt-water-spotlight-text`, 직수·천연온천 리본의 월계수형 강조.
- Water Spotlight Soft: `rgba(231, 220, 193, 0.28)`, CSS `--bt-water-spotlight-bg`, 월계수형 강조 뒤의 낮은 채도 배경.
- Mist: `#f3f1e9`, CSS `--mist`, 섹션 톤.
- Hairline: `#ded8ca`, CSS `--hairline`, 기본 경계선.
- Hairline Soft: `#ebe6db`, CSS `--hairline-soft`, 약한 구분선.
- Border Strong: `#c3b9a5`, CSS `--border-strong`, 입력/중요 경계.

#### Semantic Status

Atlassian식 구조에서 가져오는 것은 컬러가 아니라 의미 체계다. 바스타임의 상태 색은 아래 의미 토큰으로만 표현한다.

- Confirmed: CSS `--bt-status-confirmed-*`, 공식 안내나 바스타임이 확인한 정보.
- Official: CSS `--bt-status-official-*`, 공식 출처 확인을 나타내는 작은 신뢰 마크. CTA나 선택 상태에는 쓰지 않는다.
- Water Spotlight: CSS `--bt-water-spotlight-*`, 직수·천연온천처럼 카드에서 먼저 읽혀야 하는 온천수 단서. 필터 칩이나 등급 표시에 쓰지 않는다.
- Needed: CSS `--bt-status-needed-*`, 객실 타입, 시즌, 플랜에 따라 다시 봐야 하는 정보.
- Reference: CSS `--bt-status-reference-*`, 판단을 보조하는 참고 정보.
- Attention: CSS `--bt-status-attention-*`, 예약·이용 전에 놓치면 문제가 생길 수 있는 정보.
- Success: CSS `--bt-status-success-*`, 저장, 제출, 완료 상태.
- Danger: CSS `--bt-status-danger-*`, 저장 실패, 폼 오류, 위험 상태.

사용자 노출 문구에서 `후기 신호`, `반복 신호`처럼 내부 근거 언어를 쓰지 않는다. 상태는 `확인됨`, `확인 필요`, `참고`, `주의`처럼 짧게 표시하고, 근거는 설명 문장에서 바스타임의 판단으로 정리한다.

#### Surface / Interaction / Form

- Surface Default: CSS `--bt-surface-default`, 기본 카드와 패널.
- Surface Subtle: CSS `--bt-surface-subtle`, 필터, 보조 정보, 빈 상태.
- Surface Raised: CSS `--bt-surface-raised`, hover 가능한 카드.
- Surface Overlay: CSS `--bt-surface-overlay`, 모달, 팝오버.
- Input Border: CSS `--bt-form-border`, 기본 입력 경계.
- Input Focus: CSS `--bt-form-focus-border`, `--bt-focus-ring`, 포커스 상태.
- Input Invalid: CSS `--bt-form-invalid-*`, 폼 오류.
- Disabled: CSS `--bt-disabled-*`, 클릭 불가 또는 준비 중 상태.

새 UI는 raw 상태색이나 임의 hover 값을 만들지 말고, 위 토큰을 먼저 추가하거나 재사용한다.

#### Typography

- Sans: `Pretendard, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`, CSS `--bt-font-sans`.
- Editorial: `"Noto Serif KR", "Nanum Myeongjo", "Apple SD Gothic Neo", serif`, CSS `--bt-font-editorial`.
- Data: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace`, CSS `--bt-font-data`.
- Hero: `clamp(42px, 6.6vw, 82px)`, weight `500`, line-height `1.15`, letter-spacing `0`.
- Page title: `clamp(30px, 4.6vw, 52px)`, weight `500`, line-height `1.18`, letter-spacing `0`.
- Section title: `clamp(24px, 3.1vw, 38px)`, weight `500`, line-height `1.2`, letter-spacing `0`.
- Card title: `clamp(18px, 2vw, 22px)`, weight `600`, line-height `1.35`, letter-spacing `0`.

#### Spacing, Radius, Depth

- Spacing remains on the 4px scale: `--bt-space-1` through `--bt-space-24`.
- Section rhythm uses `clamp(56px, 8vw, 104px)` vertical spacing on the home surface.
- Radius scale is restrained: `4px`, `6px`, `8px`, plus pill only for controls.
- Depth uses tonal borders and rare soft shadows: `--bt-shadow-soft` and `--bt-shadow-lifted`.

#### Motion

- Fast: CSS `--bt-motion-fast`, 100ms. Pressed, tiny icon feedback.
- Base: CSS `--bt-motion-base`, 150ms. Button, chip, card hover.
- Slow: CSS `--bt-motion-slow`, 220ms. Modal and larger surface transitions.
- Easing: CSS `--bt-ease-out`, `--bt-ease-inout`.
- Motion is limited to `transform`, `opacity`, and `filter`. Reduced motion must remove transform-based movement.

#### Component Rules

- Home hero is full-bleed media with overlaid editorial copy, no card around the hero text.
- Home sections use varied layouts: editorial intro grid, horizontal feature band, list/card grid, compact callout.
- Cards keep an 8px maximum radius and use real imagery where available.
- Onsen result cards use one image slot, one sentence-level water decision, one inline fact row, and one caution sentence. Do not nest multiple boxed panels inside the card body unless the content needs comparison.
- Buttons use the same pill treatment on the home hero and the same 8px treatment elsewhere.
- Motion is limited to transform, opacity, and filter with reduced-motion support.
- Status badges must use semantic status tokens. Do not create one-off badge colors in component CSS.
- Forms must use form tokens for border, focus, invalid, disabled, helper, and error states.
- Overlays must use the overlay surface, lifted shadow, and shared scrim token.
- Future UI work starts from this token contract. If a value is missing, add it here first and then use it in CSS.

#### Onsen Review / Passport

- Review modal max width: CSS `--bt-review-modal-max-width`, `720px`.
- Review step body min height: CSS `--bt-review-step-min-height`, `360px`, so question changes do not shift the modal shell.
- Review flow is three steps: 방문, 온천수, 이용 경험. Progress uses text and line fill together, never color alone.
- Structured answers use icon-backed selectable controls. Selected state uses Primary Soft, focus uses the shared form focus ring.
- Submission success stays inside the modal and immediately explains the personal benefit: the visit has been added to 온천여권 and contributes to the user's taste profile.
- Passport is an archive surface, not a gamified leaderboard. It shows visit count, distinct places, verified visits, taste signals, and recent records without points, ranks, streak pressure, or fake precision.
- First-party reviews and externally collected review evidence must never share a displayed denominator.

#### Onsen Accommodation / Facility Search

- Accommodation and non-accommodation facility records share result-card geometry but always show an explicit entity label.
- The primary type control offers 숙소 and 당일온천. With neither selected, both entity types are shown.
- Facility feature chips appear only when at least one active facility has a confirmed, ready official filter fact for that feature.
- Review-derived facility signals may appear in summaries and cautions, but never create hard filters or water-method badges.
- Facility water-method badges remain hidden until the official water fact has a `ready` render status and a verified bath scope.
- Accommodation cards keep the 객실 fact; facility cards replace it with 이용 so lodging-specific language does not leak into facility results.

---

## 4. IA / Navigation Strategy

### IA Principles

바스타임의 IA는 단순 메뉴 구조가 아니라, 서비스가 앞으로 어떤 방식으로 확장될지를 정하는 제품 구조이다.

바스타임은 기존의 샤워·목욕 타이머 앱에서 벗어나, 집 안팎의 바스타임을 발견하고, 저장하고, 바로 따라 해볼 수 있는 아카이브 서비스로 전환한다.

따라서 IA는 다음 세 가지 흐름을 중심으로 설계한다.

1. **발견한다**  
   좋은 바스타임 콘텐츠, 장소, 아이템, 방법을 발견한다.

2. **저장한다**  
   나중에 다시 보고 싶은 콘텐츠, 장소, 아이템을 보관한다.

3. **실행한다**  
   콘텐츠에서 제안하는 샤워, 족욕, 입욕, 짧은 리추얼을 바로 따라 해본다.

핵심 흐름은 다음과 같다.

```txt
발견한다 → 저장한다 → 따라 해본다 → 제보한다 → 아카이브가 다시 좋아진다
```

최종 내비게이션은 다음 다섯 개 메뉴를 기준으로 한다.

```txt
BATH TIME

├─ Home
├─ Explore
├─ Routines
├─ Submit
└─ Saved
```

### Final Navigation Summary

- **Home:** 지금 볼 만한 바스타임을 발견한다.
- **Explore:** 원하는 조건으로 더 깊게 찾아본다.
- **Routines:** 콘텐츠를 실제 행동으로 옮긴다.
- **Submit:** 좋은 장소, 세팅, 아이템의 단서를 남긴다.
- **Saved:** 나중에 다시 볼 바스타임을 보관한다.

---

## 5. Full IA Map

```txt
BATH TIME

├─ Home
│  ├─ 오늘의 추천
│  ├─ Featured 콘텐츠
│  ├─ 최신 콘텐츠
│  ├─ 카테고리별 콘텐츠 섹션
│  │  ├─ Home Bath
│  │  ├─ Bath Places
│  │  ├─ Bath Items
│  │  └─ Tips / Culture
│  ├─ 바로 해볼 수 있는 의식
│  │  ├─ 샤워
│  │  ├─ 족욕
│  │  ├─ 입욕
│  │  └─ 짧은 리추얼
│  └─ 콘텐츠 상세 진입

├─ Explore
│  ├─ 전체 탐색
│  ├─ 검색
│  ├─ 카테고리 탐색
│  │  ├─ Home Bath
│  │  ├─ Bath Places
│  │  ├─ Bath Items
│  │  └─ Tips / Culture
│  ├─ 태그 탐색
│  ├─ 필터
│  ├─ 검색 결과
│  ├─ 필터 결과
│  └─ 콘텐츠 상세 진입

├─ Routines
│  ├─ 루틴 홈
│  ├─ 프리셋 루틴
│  │  ├─ 샤워 7분
│  │  ├─ 족욕 10분
│  │  ├─ 입욕 15분
│  │  └─ 자유 루틴
│  ├─ 콘텐츠 연결 루틴
│  ├─ 실행 화면
│  └─ 완료 화면
│     ├─ 저장하기
│     ├─ 비슷한 콘텐츠 보기
│     └─ 제보하기

├─ Submit
│  ├─ 제보 홈
│  ├─ 제보 유형 선택
│  │  ├─ 사우나 / 스파
│  │  ├─ 욕조 있는 숙소
│  │  ├─ 홈스파 세팅
│  │  ├─ 아이템
│  │  └─ 다뤄줬으면 하는 주제
│  ├─ 제보 작성
│  │  ├─ 사진/링크 첨부
│  │  ├─ 한 줄 코멘트
│  │  ├─ 닉네임
│  │  └─ 공개 동의 여부
│  ├─ 제보 가이드
│  └─ 제출 완료

└─ Saved
   ├─ 저장한 콘텐츠
   ├─ 저장한 장소
   ├─ 저장한 아이템
   ├─ 최근 본 콘텐츠
   └─ 상세 진입
```

---

## 6. Core Object IA

바스타임은 메뉴 중심 서비스이면서 동시에 객체 중심 아카이브 서비스이다.

핵심 객체는 다음 네 가지이다.

```txt
1. Content
2. Place
3. Item
4. Routine Preset
```

### Content

모든 핵심 정보는 콘텐츠 단위로 쌓인다. Content는 장소, 아이템, 루틴을 연결하는 중심 객체이다.

```txt
Content
├─ 유형
│  ├─ 해봤다
│  ├─ 찾아봤다
│  ├─ 정리했다
│  ├─ 다녀왔다
│  ├─ 제보받았다
│  └─ 업데이트했다
├─ 카테고리
│  ├─ Home Bath
│  ├─ Bath Places
│  ├─ Bath Items
│  └─ Tips / Culture
├─ 태그
├─ 대표 이미지
├─ 구조화 정보
├─ 본문
├─ CTA
│  ├─ 저장
│  ├─ 루틴 시작
│  ├─ 관련 콘텐츠 보기
│  └─ 제보하기
└─ 관련 객체 연결
   ├─ Place
   ├─ Item
   └─ Routine Preset
```

### Place

```txt
Place
├─ 이름
├─ 유형
│  ├─ 사우나
│  ├─ 스파
│  ├─ 찜질방
│  ├─ 온천
│  ├─ 숙소
│  └─ 프라이빗 스파룸
├─ 지역
├─ 외부인 이용 가능 여부
├─ 가격대
├─ 예약 필요 여부
├─ 혼자 이용 적합도
├─ 커플 이용 적합도
├─ 프라이빗 여부
├─ 시설 종류
├─ 업데이트 일자
└─ 연결 콘텐츠
```

### Item

```txt
Item
├─ 이름
├─ 유형
│  ├─ 입욕제
│  ├─ 바디워시
│  ├─ 바디오일
│  ├─ 족욕기
│  ├─ 반신욕조
│  ├─ 욕실 트레이
│  ├─ 수건
│  ├─ 조명
│  └─ 향 관련 제품
├─ 사용 상황
├─ 욕조 필요 여부
├─ 보관/관리 난이도
├─ 가격대
├─ 추천 대상
├─ 비추천 대상
└─ 연결 콘텐츠
```

### Routine Preset

```txt
Routine Preset
├─ 샤워 7분
├─ 족욕 10분
├─ 입욕 15분
├─ 자유 루틴
└─ 연결 콘텐츠
```

---

## 7. Web / App IA Difference

웹과 앱은 동일한 IA를 공유하되, 강조점이 다르다.

```txt
공통 IA

Home
Explore
Routines
Submit
Saved
```

### Web

웹은 발견과 탐색의 입구이다.

- 검색 유입
- 콘텐츠 상세 소비
- 카테고리/태그 탐색
- 장소/아이템 정보 비교
- 외부 공유
- 앱 다운로드 또는 저장/실행 전환

### App

앱은 저장과 실행의 도구이다.

- 저장한 콘텐츠 다시 보기
- 루틴 실행
- 최근 본 콘텐츠 확인
- 제보하기
- 향후 개인화/리마인더/내 루틴 확장

---

## 8. P0 Minimum IA

P0에서는 전체 IA를 모두 구현하되, 각 메뉴의 범위는 최소화한다.

```txt
Home
├─ Featured
├─ 최신 콘텐츠
└─ 콘텐츠 상세

Explore
├─ 카테고리
├─ 태그
├─ 검색
└─ 콘텐츠 상세

Routines
├─ 프리셋 루틴
├─ 실행
└─ 완료

Submit
├─ 제보 유형
├─ 제보 작성
└─ 제출 완료

Saved
├─ 저장한 콘텐츠
└─ 상세
```

### P0에서 빼야 할 것

- 회원가입 필수화
- 댓글
- 게시판
- 팔로우
- 제품 구매 링크
- 자체 예약
- 지도 연동
- 결제
- 브랜드 제휴 관리
- 직접 루틴 제작
- 리추얼 로그 오버레이

---

## 9. Color System

### Color Strategy

바스타임은 라이트 테마를 기본으로 한다.

다크 테마는 목욕/스파 무드를 만들기 쉽지만, 현재 바스타임은 감성 앱보다 콘텐츠 아카이브에 가깝다. 따라서 다크 테마를 기본으로 잡으면 정보 탐색성, 신뢰감, 웹 확장성, SEO형 콘텐츠 소비에 불리하다.

바스타임의 라이트 테마는 다음 원칙을 따른다.

```txt
80~90%: Warm Paper / White / Deep Ink / Warm Border
5~10%: Deep Ritual Teal
1~3%: Soft Brass
```

색은 화면을 꾸미기 위한 장식이 아니라, 정보의 우선순위를 잡기 위한 신호로 사용한다.

### Core Palette

| Token | Hex | Role |
|---|---:|---|
| `colors.canvas` | `#FAF7F1` | 기본 페이지 배경. 따뜻한 종이색. |
| `colors.surface` | `#FFFFFF` | 카드, 입력창, 콘텐츠 본문 표면. |
| `colors.surface-soft` | `#F3EFE7` | 섹션 구분, 필터 영역, 비활성 표면. |
| `colors.surface-strong` | `#ECE6DA` | 선택 가능한 밝은 보조 표면. |
| `colors.ink` | `#252A2A` | 헤드라인과 주요 텍스트. 순수 검정 사용 금지. |
| `colors.body` | `#3F4745` | 본문 텍스트. |
| `colors.muted` | `#6B7471` | 보조 설명, 메타 정보. |
| `colors.muted-soft` | `#929C98` | 비활성 텍스트, 약한 라벨. |
| `colors.primary` | `#277C78` | Deep Ritual Teal. CTA, 선택 상태, 저장 상태. |
| `colors.primary-active` | `#1F6662` | Primary press/active 상태. |
| `colors.primary-soft` | `#DFF0ED` | 선택 태그 배경, 약한 CTA 표면. |
| `colors.primary-disabled` | `#B9D9D5` | 비활성 primary. |
| `colors.brass` | `#D6A85F` | 추천 뱃지, 업데이트 라벨, 소량 강조. |
| `colors.brass-soft` | `#F4E7C8` | brass 보조 배경. |
| `colors.hairline` | `#E4DED3` | 기본 1px 구분선. |
| `colors.hairline-soft` | `#EFE9DE` | 긴 본문 구분선. |
| `colors.border-strong` | `#CFC6B8` | 선택/포커스 전 보조 경계. |
| `colors.on-primary` | `#FFFFFF` | primary 위 텍스트. |
| `colors.error` | `#B94A3A` | 에러 텍스트. |
| `colors.warning` | `#A66F2A` | 주의/확인 필요. |
| `colors.success` | `#2F7D5C` | 저장 완료, 제보 완료 등. |
| `colors.scrim` | `rgba(37, 42, 42, 0.48)` | 모달 배경. |

### Color Usage Rules

#### Do

- 배경은 `Warm Paper`와 `White Surface`를 중심으로 유지한다.
- `Deep Ritual Teal`은 CTA, 저장 상태, 선택된 태그, 루틴 시작 버튼에만 사용한다.
- `Soft Brass`는 추천, 업데이트, 특별한 큐레이션 라벨에만 사용한다.
- 긴 본문과 정보 카드는 잉크와 회색 계열로 읽기 쉽게 만든다.
- 사진이 있는 카드에서는 사진이 시각적 무게를 담당하고, 색은 보조 역할만 한다.

#### Don't

- Teal을 큰 배경으로 넓게 깔지 않는다.
- Brass를 고급 스파처럼 과하게 쓰지 않는다.
- 민트 계열을 많이 써서 병원/위생 앱처럼 보이게 하지 않는다.
- 쨍한 핑크/레드 계열을 메인 브랜드 컬러로 사용하지 않는다.
- 다크 네이비를 메인 배경으로 회귀하지 않는다.

---

## 10. Typography

### Font Family

모든 UI와 본문은 시스템 산세리프를 사용한다.

```css
font-family: -apple-system, BlinkMacSystemFont, "Pretendard", "Inter", "Noto Sans KR", "Segoe UI", sans-serif;
```

- **Korean first:** Pretendard 또는 Noto Sans KR 기준.
- **English/number:** Inter 또는 system sans.
- **Data/table:** tabular numbers 사용 가능.
- 별도 serif 폰트는 사용하지 않는다.

### Type Scale

| Token | Size | Weight | Line Height | Use |
|---|---:|---:|---:|---|
| `typography.display-xl` | 30px | 700 | 1.28 | 랜딩/홈 히어로 헤드라인 |
| `typography.display-lg` | 26px | 700 | 1.32 | 주요 화면 타이틀 |
| `typography.display-md` | 22px | 650 | 1.36 | 상세 페이지 제목, 섹션 타이틀 |
| `typography.display-sm` | 20px | 600 | 1.38 | 카드 묶음 제목 |
| `typography.title-md` | 17px | 600 | 1.42 | 콘텐츠 카드 제목 |
| `typography.title-sm` | 15px | 600 | 1.42 | 리스트 타이틀, 폼 라벨 |
| `typography.body-lg` | 17px | 400 | 1.7 | 긴 본문 리드 문장 |
| `typography.body-md` | 15px | 400 | 1.65 | 기본 본문 |
| `typography.body-sm` | 14px | 400 | 1.55 | 카드 메타, 설명 |
| `typography.caption` | 12px | 500 | 1.4 | 태그, 보조 라벨 |
| `typography.badge` | 11px | 600 | 1.3 | 뱃지, 업데이트 라벨 |
| `typography.button-md` | 15px | 600 | 1.3 | 주요 버튼 |
| `typography.button-sm` | 14px | 600 | 1.3 | 작은 버튼, 칩 |

### Typography Principles

- 헤드라인은 과하게 크거나 무겁게 만들지 않는다.
- 정보 플랫폼이므로 본문 가독성을 우선한다.
- 콘텐츠 카드 제목은 너무 감성적으로 키우지 않고, 실제 정보가 읽히게 한다.
- 숫자, 시간, 가격, 업데이트 일자는 tabular number를 사용한다.
- 한 화면에 굵은 텍스트를 너무 많이 두지 않는다.

---

## 11. Layout

### Spacing System

- **Base unit:** 4px
- **Major spacing:** 8, 12, 16, 20, 24, 32, 40, 48, 64
- **Section spacing:** 모바일 32~48px, 데스크톱 48~64px
- **Card gap:** 12~16px
- **Card padding:** 16~20px
- **Detail body padding:** 모바일 20px, 데스크톱 24~32px

### Container

- **Mobile:** 100%, 기본 좌우 패딩 20px
- **Tablet:** 744px 이상에서 2열 카드 가능
- **Desktop:** 최대 1120~1280px 콘텐츠 컨테이너
- **Detail page:** 본문은 680~760px 정도로 읽기 좋은 폭을 유지한다.

### Grid Principle

- 홈은 큐레이션 중심이므로 카드 묶음이 자연스럽게 이어져야 한다.
- Explore는 탐색 중심이므로 필터/태그/리스트 간 위계가 명확해야 한다.
- 콘텐츠 상세는 매거진처럼 넓게 퍼지기보다, 구조화 정보와 CTA가 잘 보이는 레이아웃을 사용한다.
- 웹에서는 리스트와 상세 정보를 넓게 활용하고, 앱에서는 카드와 CTA를 더 명확히 한다.

---

## 12. Shape & Radius

바스타임의 shape language는 부드럽지만, 너무 말랑하거나 장난스럽지 않다.

| Token | Value | Use |
|---|---:|---|
| `rounded.xs` | 6px | 작은 태그, 내부 칩 |
| `rounded.sm` | 8px | 작은 버튼, 입력창 |
| `rounded.md` | 14px | 콘텐츠 카드, 이미지 |
| `rounded.lg` | 18px | 큰 카드, 상세 정보 박스 |
| `rounded.xl` | 24px | 홈 Featured 카드, 루틴 카드 |
| `rounded.full` | 999px | pill, 태그, 원형 아이콘 |

### Radius Rules

- 사진 카드는 14~18px로 부드럽게 자른다.
- 검색창과 필터 칩은 pill 형태를 사용할 수 있다.
- 카드 반경이 너무 커져서 유아적이거나 캐주얼 앱처럼 보이지 않게 한다.
- 버튼은 10~14px 수준으로 유지한다.

---

## 13. Elevation

바스타임은 그림자를 많이 쓰지 않는다.

### Shadow Tokens

```css
--shadow-card: 0 1px 2px rgba(37, 42, 42, 0.04), 0 4px 12px rgba(37, 42, 42, 0.06);
--shadow-float: 0 2px 6px rgba(37, 42, 42, 0.06), 0 8px 20px rgba(37, 42, 42, 0.10);
```

### Elevation Rules

- 기본 카드는 border 중심으로 구분한다.
- Hover 또는 floating CTA에서만 약한 shadow를 사용한다.
- 앱 화면에서는 그림자를 과하게 쓰지 않고 표면색과 border로 구분한다.
- 모달, 바텀시트, 검색 오버레이는 shadow보다 scrim과 surface 구분을 우선한다.

---

## 14. Components

### Buttons

#### `button-primary`

- Background: `colors.primary`
- Text: `colors.on-primary`
- Radius: 12px
- Height: 48px
- Padding: 0 20px
- Weight: 600
- Use: 루틴 시작, 저장하기, 제보 제출, 주요 CTA

#### `button-primary-active`

- Background: `colors.primary-active`
- Transform 없음
- Shadow 변화 없음

#### `button-primary-disabled`

- Background: `colors.primary-disabled`
- Text: white with 80% opacity

#### `button-secondary`

- Background: `colors.surface`
- Text: `colors.ink`
- Border: 1px `colors.hairline`
- Use: 취소, 더 보기, 보조 행동

#### `button-tertiary`

- Background 없음
- Text: `colors.primary` 또는 `colors.ink`
- Underline은 hover 또는 명확한 링크에서만 사용

### Search / Filter

#### `search-bar-pill`

- Background: `colors.surface`
- Border: 1px `colors.hairline`
- Radius: `rounded.full`
- Height: 48~56px
- Icon button: primary circular button 또는 ink icon

#### `filter-chip`

- Default: white surface + warm border
- Selected: `colors.primary-soft` background + `colors.primary` text/border
- Radius: full
- Height: 34~38px

### Content Cards

#### `content-card`

- Photo-first 카드.
- Image ratio: 4:3, 1:1, 또는 16:10 중 컨텍스트에 맞게 사용.
- Radius: 14~18px.
- 제목, 카테고리, 태그, 업데이트 일자, 짧은 설명을 포함한다.
- CTA는 카드 전체를 복잡하게 만들지 않고 상세 진입 중심으로 둔다.

#### `featured-card`

- Home 상단 추천 콘텐츠.
- 큰 이미지 + 짧은 제목 + 한 줄 설명 + CTA.
- 컬러 배경보다 사진과 여백으로 시각적 무게를 만든다.

#### `structured-info-card`

- 콘텐츠 상세에서 핵심 정보를 요약하는 카드.
- Place, Item, Routine에 따라 항목을 다르게 보여준다.
- 표처럼 딱딱하기보다 라벨/값 조합의 작은 정보 블록으로 구성한다.

### Save Button

#### `save-button`

- Default: outline icon 또는 text button.
- Saved: `colors.primary` 또는 `colors.primary-soft`를 사용.
- 하트보다 북마크/저장 아이콘이 더 적합하다.
- 저장은 감정적 좋아요가 아니라 다시 찾아보기 위한 아카이브 행동으로 정의한다.

### Routine Cards

#### `routine-preset-card`

- 샤워 7분, 족욕 10분, 입욕 15분, 자유 루틴을 표시한다.
- 시간 숫자는 명확하게 보이되, 피트니스 앱처럼 강하게 보이지 않게 한다.
- 연관 콘텐츠가 있을 경우 작은 출처 라벨을 표시할 수 있다.

### Submit Form

#### `submit-type-card`

- 제보 유형을 카드형으로 선택한다.
- 사진/링크/한 줄 코멘트만으로 시작할 수 있음을 명확히 보여준다.
- 부담감이 들지 않도록 “작성”보다 “알려주기” 톤을 사용한다.

### Bottom Tab

- Labels: Home, Explore, Routines, Submit, Saved
- Active color: `colors.primary`
- Inactive color: `colors.muted`
- Background: `colors.surface`
- Top border: `colors.hairline`
- 아이콘은 선형, 단순, 둥근 형태를 사용한다.

---

## 15. Content Detail Template

콘텐츠 상세는 바스타임의 신뢰를 만드는 핵심 화면이다.

```txt
Content Detail
├─ Category / Content Type
├─ Title
├─ Subtitle
├─ Hero Image
├─ Quick Summary
├─ Structured Info
├─ Body
├─ Good Points
├─ Watch-outs / 아쉬운 점
├─ Recommended For
├─ Not Recommended For
├─ Related Routine CTA
├─ Related Places / Items
├─ Save / Share / Submit CTA
└─ Updated At
```

### Detail Principles

- 제목은 감성적이어도 되지만, 본문은 실제 정보가 있어야 한다.
- 구조화 정보는 항상 본문 초반에 보여준다.
- CTA는 읽기 흐름을 방해하지 않고, 필요한 순간에 자연스럽게 배치한다.
- 업데이트 일자는 신뢰 신호로 반드시 표시한다.

---

## 16. Imagery

### Image Direction

- 밝은 욕실
- 물기와 증기
- 수건, 조명, 트레이, 향, 바디케어 아이템
- 사우나/스파/숙소의 실제 공간감
- 과한 연출보다 실제로 갈 수 있거나 따라 할 수 있는 장면

### Image Rules

- 사진은 화면의 시각적 무게를 담당한다.
- 이미지 위 텍스트 오버레이는 최소화한다.
- 밝은 사진에서도 텍스트 가독성을 확보한다.
- 스톡 이미지처럼 보이는 과한 웰니스 사진은 피한다.
- 장소 콘텐츠는 실제 공간 정보 전달이 우선이다.

---

## 17. Motion

### Motion Approach

Minimal-functional.

### Use

- 카드 등장 fade/slide
- 필터 선택 상태 변화
- 저장 완료 피드백
- 루틴 시작/완료 전환
- Submit 완료 피드백

### Avoid

- 과한 bounce
- 물결 애니메이션 남용
- 의미 없는 parallax
- 스파 앱처럼 느껴지는 장식 모션

---

## 18. Voice in UI

### Tone

- 차분함
- 솔직함
- 정돈됨
- 따뜻함
- 감각적이지만 과장하지 않음
- 전문적인 척하지 않음
- 직접 찾아보고 정리하는 사람의 태도

### Do

- “오늘은 10분만, 씻는 시간을 조금 더 천천히 가져가봅니다.”
- “욕조 없는 집에서도 쉬는 느낌이 날까 싶어서 정리해봤습니다.”
- “이 장소는 외부인 이용 가능 여부를 확인해볼 필요가 있어요.”
- “나중에 따라 해보고 싶다면 저장해두세요.”
- “다녀온 곳이 있다면 이름만 알려주세요. 바스타임이 확인해볼게요.”

### Don't

- “수면 개선에 효과적인 프리미엄 입욕 루틴”
- “완벽한 홈스파 루틴을 시작하세요.”
- “최고의 스파 경험을 선사합니다.”
- “건강을 개선하는 과학적 목욕법”
- “지금 구매하세요.”

### CTA Language

- 오늘의 의식 보기
- 이 의식 따라 해보기
- 루틴 시작하기
- 내 바스타임으로 저장하기
- 이 장소 저장하기
- 좋은 바스타임 제보하기
- 비슷한 콘텐츠 더 보기

---

## 19. Responsive Behavior

| Name | Width | Key Changes |
|---|---:|---|
| Mobile | `< 744px` | 하단 탭 중심. 콘텐츠 카드 1열. 검색은 pill 또는 전체 화면 오버레이. 상세 CTA는 하단 고정 가능. |
| Tablet | `744–1128px` | 카드 2열. Explore 필터는 상단 또는 좌측 보조 영역. |
| Desktop | `1128–1440px` | 콘텐츠 3~4열. 상세는 본문 + 우측 정보/CTA rail 가능. |
| Wide | `> 1440px` | 최대 컨테이너 고정. 여백으로 흡수. |

### Touch Targets

- 주요 CTA 최소 48px 높이.
- 칩/태그 최소 34px 높이.
- 저장 버튼은 최소 40px 터치 영역.
- 하단 탭은 56~64px 높이.

---

## 20. Accessibility

- 텍스트는 순수 검정 대신 `colors.ink`를 사용하되 충분한 대비를 확보한다.
- Primary CTA 위 텍스트는 항상 white를 사용한다.
- Teal 배경 위 작은 텍스트는 사용하지 않는다.
- 색만으로 상태를 구분하지 않고 아이콘/라벨을 함께 사용한다.
- 긴 콘텐츠 본문은 줄간격 1.6 이상을 유지한다.
- 이미지가 없어도 콘텐츠의 핵심 정보를 이해할 수 있어야 한다.

---

## 21. Implementation Tokens

```ts
export const colors = {
  canvas: '#FAF7F1',
  surface: '#FFFFFF',
  surfaceSoft: '#F3EFE7',
  surfaceStrong: '#ECE6DA',

  ink: '#252A2A',
  body: '#3F4745',
  muted: '#6B7471',
  mutedSoft: '#929C98',

  primary: '#277C78',
  primaryActive: '#1F6662',
  primarySoft: '#DFF0ED',
  primaryDisabled: '#B9D9D5',

  brass: '#D6A85F',
  brassSoft: '#F4E7C8',

  hairline: '#E4DED3',
  hairlineSoft: '#EFE9DE',
  borderStrong: '#CFC6B8',

  onPrimary: '#FFFFFF',
  error: '#B94A3A',
  warning: '#A66F2A',
  success: '#2F7D5C',
  scrim: 'rgba(37, 42, 42, 0.48)',
};

export const radius = {
  xs: 6,
  sm: 8,
  md: 14,
  lg: 18,
  xl: 24,
  full: 999,
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  section: 64,
};
```

---

## 22. Component Decision Rules

### Content Card

- 사진이 있으면 사진을 먼저 보여준다.
- 카드 안에 CTA를 많이 넣지 않는다.
- 카테고리/태그/업데이트 일자를 통해 아카이브성을 보여준다.

### Place Card

- 지역, 외부인 이용 가능 여부, 예약 필요 여부를 우선 표시한다.
- 가격대와 프라이빗 여부는 비교 가능한 정보로 정리한다.
- 감성 문구보다 실제 이용 조건을 앞세운다.

### Item Card

- 상품명보다 아이템 유형과 사용 상황을 먼저 보여준다.
- 구매 버튼을 P0에서 노출하지 않는다.
- 추천 대상과 비추천 대상이 함께 보여야 한다.

### Routine Card

- 시간과 상황을 명확히 보여준다.
- “운동”, “수면”, “회복” 같은 의료적/건강 효능 표현은 조심한다.
- 완료 후 저장/비슷한 콘텐츠/제보로 연결한다.

---

## 23. Decisions Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-04-07 | 초기 스파형 무드 채택 | 앱의 감각적 방향을 빠르게 검증하기 위해 |
| 2026-04-24 | Everyday Bath Guide로 브랜드 무게중심 이동 | 고급 취향 큐레이션보다 생활형 셀프케어와 쉬운 실행감을 우선하기 위해 |
| 2026-05-04 | Private Bath Log로 MVP 무게중심 이동 | 사진 기반 리추얼 로그 방향을 검토하기 위해 |
| 2026-05-07 | 바스타임 아카이브로 재피벗 | 사진 로그보다 구조화된 콘텐츠 아카이브 + 실행 도구가 장기 플랫폼 방향에 적합하다고 판단 |
| 2026-05-07 | 최종 IA를 Home / Explore / Routines / Submit / Saved로 정리 | 콘텐츠 아카이브, 실행 루틴, 저장, 제보 구조로 명확히 나누기 위해 |
| 2026-05-07 | Timer 메뉴명을 Routines로 변경 | 단순 타이머 앱처럼 보이는 인상을 줄이고, 샤워·족욕·입욕·직접 만든 루틴까지 확장 가능한 실행 영역으로 정의하기 위해 |
| 2026-05-07 | 핵심 객체를 Content / Place / Item / Routine Preset으로 정리 | 메뉴 중심 IA뿐 아니라 아카이브 플랫폼으로서 데이터 구조와 확장 방향을 명확히 하기 위해 |
| 2026-05-07 | 디자인 방향을 Warm Archive + Soft Water Accent로 재정의 | 라이트 테마 기반 아카이브 서비스에 맞게 신뢰감, 사진 중심성, 절제된 포인트 컬러를 확보하기 위해 |
| 2026-05-07 | Primary color를 Deep Ritual Teal로 지정 | 물, 청결함, 웰니스 감각은 유지하되 쨍한 소비자 마켓 컬러를 피하기 위해 |
| 2026-07-10 | 자체 온천 리뷰를 온천여권 기록으로 확장 | 리뷰 작성 직후 개인 기록과 취향 분석이라는 효용을 제공하고, 시설 데이터의 장기적인 자체 근거를 만들기 위해 |
| 2026-07-10 | 온천 검색에 숙소·당일온천 시설을 병렬 편입 | 데이터 모델과 근거 모수는 분리하면서 한 검색 표면에서 유형과 공식 시설 사실로 탐색할 수 있게 하기 위해 |

---

## 24. Final Summary

바스타임의 디자인은 예쁜 스파 앱을 만드는 것이 아니다.

바스타임의 디자인은 사용자가 좋은 바스타임을 발견하고, 저장하고, 바로 따라 해볼 수 있도록 돕는 **밝고 신뢰 가능한 아카이브 경험**을 만드는 것이다.

최종 디자인 기준은 다음이다.

```txt
Base: Warm Paper
Surface: White
Text: Deep Ink
Primary Accent: Deep Ritual Teal
Sub Accent: Soft Brass
Style: 조용한 아카이브 + 물의 청결함 + 약간의 온기
```

색은 적게 쓰고, 사진과 정보 구조가 화면의 중심이 되어야 한다.
