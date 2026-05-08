# 바스타임 반응형 레이아웃 개발 문서

## 1. 문서 목적

이 문서는 바스타임 웹/앱 공통 IA를 기반으로, 모바일과 PC에서 동일한 정보 구조를 유지하면서도 화면 크기에 따라 다른 내비게이션 패턴을 적용하기 위한 반응형 레이아웃 개발 기준을 정의한다.

바스타임은 모바일 앱처럼 보이는 웹이 아니라, **모바일에서는 앱처럼, PC에서는 Threads/X처럼 좌측 내비게이션을 활용하는 반응형 아카이브 서비스**를 지향한다.

핵심 원칙은 다음과 같다.

> Mobile-first, not mobile-only.

모바일 우선으로 설계하되, PC 화면에서는 단순히 모바일 화면을 가운데 고정하지 않고, 좌측 사이드바와 보조 영역을 활용해 아카이브 탐색성을 강화한다.

---

## 2. 기본 IA

최상위 IA는 웹/앱 공통으로 유지한다.

```txt
Home
Explore
Routines
Submit
Saved
```

### 각 메뉴의 역할

| 메뉴 | 역할 |
|---|---|
| Home | 추천 콘텐츠, 최신 콘텐츠, 오늘의 바스타임 진입 |
| Explore | 카테고리/태그/검색 기반 아카이브 탐색 |
| Routines | 따라 해볼 수 있는 루틴과 타이머 실행 |
| Submit | 사우나, 스파, 홈스파 세팅, 아이템 제보 |
| Saved | 저장한 콘텐츠, 장소, 아이템, 루틴 보관 |

---

## 3. 반응형 레이아웃 원칙

### 핵심 원칙

PC와 모바일에서 정보 구조는 동일하게 유지한다.

다만 내비게이션과 보조 정보 영역의 위치만 화면 크기에 따라 바뀐다.

```txt
Mobile
Header + Main Content + Bottom Tab

Tablet/Desktop
Left Sidebar + Main Content

Wide Desktop
Left Sidebar + Main Content + Right Assist Panel
```

### 잘못된 방향

- PC에서도 390px 모바일 화면만 중앙에 고정하는 방식
- 모바일 레이아웃을 단순 확대하는 방식
- 화면 크기와 상관없이 같은 레이아웃을 강제하는 방식

### 올바른 방향

- 모바일에서는 앱처럼 하단 탭 사용
- PC에서는 하단 탭을 좌측 사이드바로 전환
- 중앙 콘텐츠는 읽기 좋은 폭으로 제한
- 넓은 화면에서는 우측 보조 영역을 선택적으로 사용

---

## 4. Breakpoint 기준

### 권장 Breakpoint

```txt
Mobile: ~767px
Tablet / Small Desktop: 768px ~ 1199px
Wide Desktop: 1200px 이상
```

### 레이아웃 변화

| 화면 크기 | Navigation | Main Layout | Right Panel |
|---|---|---|---|
| ~767px | Bottom Tab | 1 Column | 없음 |
| 768px~1199px | Left Sidebar | 1 Column | 없음 |
| 1200px~ | Left Sidebar | Center Column | 선택적 표시 |

---

## 5. 전체 레이아웃 구조

### Mobile Layout

```txt
┌─────────────────────┐
│ Header              │
├─────────────────────┤
│ Main Content        │
│                     │
│                     │
├─────────────────────┤
│ Bottom Tab          │
└─────────────────────┘
```

### Tablet / Small Desktop Layout

```txt
┌────────────┬────────────────────────┐
│ Left Nav   │ Main Content           │
│            │                        │
│            │                        │
└────────────┴────────────────────────┘
```

### Wide Desktop Layout

```txt
┌────────────┬────────────────────────┬──────────────────┐
│ Left Nav   │ Main Content           │ Right Panel      │
│            │                        │                  │
│            │                        │                  │
└────────────┴────────────────────────┴──────────────────┘
```

---

## 6. Layout Dimensions

### 권장 치수

```txt
Left Sidebar: 220px ~ 240px
Main Content: max-width 720px ~ 760px
Right Panel: 280px ~ 320px
Total Max Width: 1200px ~ 1280px
```

### CSS 기준 예시

```css
.layout {
  width: 100%;
  min-height: 100vh;
}

.main-content {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .layout {
    display: grid;
    grid-template-columns: 240px minmax(0, 720px);
    justify-content: center;
  }
}

@media (min-width: 1200px) {
  .layout {
    grid-template-columns: 240px minmax(0, 720px) 300px;
    gap: 32px;
  }
}
```

실제 구현 시 디자인 시스템과 프레임워크에 맞춰 조정한다.

---

## 7. Navigation Spec

### Mobile Bottom Tab

모바일에서는 하단 고정 탭을 사용한다.

```txt
Home / Explore / Routines / Submit / Saved
```

#### 요구사항

- 화면 하단 고정
- 현재 탭 활성 상태 표시
- 아이콘 + 짧은 라벨 조합
- 콘텐츠 스크롤 시에도 접근 가능
- Safe area 대응 필요

### Desktop Left Sidebar

태블릿 이상에서는 Bottom Tab을 숨기고 좌측 사이드바를 사용한다.

```txt
Logo / Service Name
Home
Explore
Routines
Submit
Saved
```

#### 요구사항

- 좌측 고정 또는 sticky
- 현재 메뉴 활성 상태 표시
- 모바일 하단 탭과 동일한 메뉴 순서 유지
- 아이콘 + 텍스트 조합
- 최소 768px 이상에서 표시

---

## 8. Right Assist Panel

Wide Desktop에서만 선택적으로 표시한다.

### 역할

우측 패널은 핵심 콘텐츠를 방해하지 않으면서 탐색과 행동을 보조한다.

### 들어갈 수 있는 요소

- 인기 태그
- 최근 업데이트
- 관련 콘텐츠
- 제보하기 CTA
- 저장한 콘텐츠 미리보기
- 바로 실행 가능한 루틴
- 앱 다운로드/저장 유도 CTA

### 화면별 예시

| 화면 | Right Panel 내용 |
|---|---|
| Home | 인기 태그, 최근 업데이트, 제보 CTA |
| Explore | 필터, 인기 태그, 최근 업데이트 |
| Content Detail | 관련 콘텐츠, 관련 루틴, 저장 CTA |
| Routines | 추천 루틴, 최근 실행 루틴 |
| Submit | 제보 가이드, 예시 콘텐츠 |
| Saved | 최근 저장, 추천 콘텐츠 |

### P0 기준

P0에서는 Right Panel을 필수 구현하지 않는다.

우선 다음 구조로 시작할 수 있다.

```txt
Mobile: Header + Main + Bottom Tab
Desktop: Left Sidebar + Main
```

Right Panel은 P1에서 추가 가능하다.

---

## 9. 화면별 반응형 설계

## 9.1 Home

### Mobile

```txt
Header
Category Chips
Featured Card
Content Feed
Bottom Tab
```

### Desktop

```txt
Left Sidebar
Main Content
  - Header
  - Featured Card
  - Latest Content
  - Category Sections
Right Panel optional
  - 인기 태그
  - 최근 업데이트
  - 제보 CTA
```

### 구현 원칙

- 피드는 모바일 1열 기준으로 설계
- PC에서도 중앙 콘텐츠는 1열 유지 가능
- 콘텐츠 카드는 모바일/PC 모두 동일 컴포넌트 사용 가능

---

## 9.2 Explore

### Mobile

```txt
Header
Search Bar
Category Chips
Filter Button
Content List
Bottom Tab
```

필터는 바텀시트 또는 모달로 제공한다.

### Desktop

```txt
Left Sidebar
Main Content
  - Search Bar
  - Category Tabs
  - Content/Place/Item List
Right Panel optional
  - Filter
  - Popular Tags
```

### 구현 원칙

- Explore는 아카이브 탐색의 핵심 화면
- PC에서는 필터를 우측 패널 또는 상단 영역에 노출 가능
- 모바일에서는 필터를 접어서 제공

---

## 9.3 Content Detail

### Mobile

```txt
Header
Hero Image
Title
Meta Info
Structured Info Box
Body
CTA Buttons
Related Content
Bottom Tab
```

### Desktop

```txt
Left Sidebar
Main Content
  - Hero Image
  - Title
  - Structured Info Box
  - Body
  - CTA
Right Panel optional
  - Related Content
  - Related Routine
  - Save CTA
```

### 구현 원칙

- 본문 max-width는 720px 내외로 유지
- 구조화 정보 박스는 상단에 배치
- CTA는 콘텐츠 중간/하단에 반복 배치 가능

---

## 9.4 Routines

### Mobile

```txt
Header
Routine Preset List
Routine Detail
Timer CTA
Bottom Tab
```

### Desktop

```txt
Left Sidebar
Main Content
  - Routine List
  - Selected Routine Detail
  - Timer Start
Right Panel optional
  - 관련 콘텐츠
  - 최근 실행 루틴
```

### 구현 원칙

- Routines는 기존 Timer 기능을 확장한 영역
- Timer는 Routine 내부의 실행 도구로 둔다
- 메뉴명은 Timer가 아니라 Routines로 사용한다

---

## 9.5 Submit

### Mobile

```txt
Header
Submit Type Select
Photo/Link Input
One-line Comment
Submit Button
Bottom Tab
```

### Desktop

```txt
Left Sidebar
Main Content
  - Submit Guide
  - Submit Type
  - Simple Form
Right Panel optional
  - 제보 예시
  - 제보 후 반영 방식
```

### 구현 원칙

- 제보는 아주 가볍게
- P0에서는 로그인 없이 제출 가능하게 검토
- 사진 1장 또는 링크 1개 + 한 줄 코멘트 수준

---

## 9.6 Saved

### Mobile

```txt
Header
Saved Tabs
Saved List
Bottom Tab
```

### Desktop

```txt
Left Sidebar
Main Content
  - Saved Content
  - Saved Places
  - Saved Items
  - Saved Routines
Right Panel optional
  - 최근 본 콘텐츠
  - 추천 콘텐츠
```

### 구현 원칙

- P0에서는 로컬 저장 또는 익명 저장으로 시작 가능
- 로그인 기반 저장은 P1 이후 검토
- Saved는 앱 다운로드/재방문의 핵심 이유가 될 수 있음

---

## 10. 공통 컴포넌트 목록

### Layout Components

```txt
AppShell
MobileHeader
BottomTabNav
DesktopSidebar
RightAssistPanel
MainContentContainer
```

### Navigation Components

```txt
NavItem
CategoryTabs
TagChips
FilterButton
SearchBar
```

### Content Components

```txt
ContentCard
FeaturedCard
StructuredInfoBox
ContentMeta
RelatedContentList
CTAButtonGroup
```

### Routine Components

```txt
RoutineCard
RoutineDetail
TimerDisplay
TimerControls
```

### Submit Components

```txt
SubmitTypeSelector
SubmitForm
ImageOrLinkInput
OneLineCommentInput
SubmitComplete
```

### Saved Components

```txt
SavedTabs
SavedList
SavedItemCard
```

---

## 11. 개발 구현 원칙

### 11.1 IA는 동일하게 유지한다

모바일과 PC에서 메뉴 구조는 동일하다.

```txt
Home / Explore / Routines / Submit / Saved
```

### 11.2 Navigation만 바뀐다

모바일:

```txt
Bottom Tab
```

PC:

```txt
Left Sidebar
```

### 11.3 콘텐츠 폭은 제한한다

PC에서 본문이 너무 넓어지지 않도록 중앙 콘텐츠 영역은 max-width를 둔다.

### 11.4 Right Panel은 점진적으로 도입한다

P0에서는 없어도 된다.
P1부터 관련 콘텐츠, 인기 태그, 제보 CTA 등을 넣는다.

### 11.5 콘텐츠와 기능을 연결한다

모든 콘텐츠 상세에는 최소 하나의 기능 CTA가 있어야 한다.

- 저장하기
- 루틴 따라 하기
- 제보하기
- 관련 콘텐츠 보기

---

## 12. P0 구현 범위

### 반드시 구현

- Mobile Header
- Mobile Bottom Tab
- Desktop Sidebar
- Main Content Container
- Home 화면
- Explore 기본 화면
- Content Detail
- Routines 기본 화면
- Submit 기본 폼
- Saved 기본 화면

### P0에서 제외 가능

- Right Assist Panel
- 복잡한 PC 3열 필터 UI
- 로그인 기반 저장
- 고급 검색
- 지도 기반 탐색
- 커뮤니티 피드
- 댓글

---

## 13. 개발자 전달용 요약

> 바스타임 웹은 모바일 앱처럼 390px 화면을 PC에 그대로 고정하는 방식이 아닙니다. 모바일에서는 앱처럼 하단 탭을 사용하고, PC에서는 Threads/X처럼 같은 IA를 좌측 사이드바로 전환합니다. 중앙 콘텐츠 영역은 읽기 좋은 폭으로 제한하고, 넓은 화면에서는 우측 보조 영역을 선택적으로 추가합니다. 정보 구조는 Home / Explore / Routines / Submit / Saved로 동일하게 유지합니다.

