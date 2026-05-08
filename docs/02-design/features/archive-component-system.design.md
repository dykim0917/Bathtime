# 바스타임 아카이브 컴포넌트 시스템 설계

## 1. 목적

이 문서는 최신 바스타임 웹 시안을 기준으로 P0 아카이브 UI를 컴포넌트화하기 위한 구현 설계 문서이다.

이번 시안의 핵심은 모든 화면을 같은 폭의 단일 컬럼으로 맞추는 것이 아니라, 화면 목적에 따라 폭과 정보 밀도를 다르게 가져가는 것이다.

- 탐색 화면은 넓은 그리드형 아카이브로 구성한다.
- 상세 화면은 큰 히어로 이미지와 본문/구조화 정보 2열 구조를 사용한다.
- 작성, 실행, 보관 화면은 좁고 안정적인 작업 폭을 유지한다.
- 좌측 내비게이션과 상단 검색은 공통 시스템으로 두되, 화면별로 노출 강도를 조절한다.

## 2. 최신 시안 기준

참고 이미지:

- `/Users/exem/Downloads/(상단 검색창 버전)바스타임_explorer.png`
- `/Users/exem/Downloads/컨텐츠 상세.png`

시안에서 확정할 방향:

- 좌측 사이드바는 웹의 기본 내비게이션이다.
- 상단 검색창은 Explore에서 핵심 기능이며, 다른 화면에서는 선택적으로 노출한다.
- Explore는 3열 카드 그리드를 사용한다.
- 첫 콘텐츠는 `featuredHorizontal` 카드로 강조한다.
- 상세는 상단 대형 이미지, 본문, 우측 구조화 정보 패널, 관련 의식 그리드로 구성한다.
- 사용자 노출 언어는 브랜드 언어를 사용한다. `루틴`은 사용자 copy에서 쓰지 않고 `의식`으로 통일한다.

## 3. 레이아웃 원칙

### 화면별 폭

| 화면 | 권장 variant | 권장 폭 | 원칙 |
|---|---|---:|---|
| Home | `grid` | 960~1120px | 추천/최신 콘텐츠를 카드로 탐색 |
| Explore | `grid` | 1040~1120px | 검색, 필터, 카드 그리드 중심 |
| Content Detail | `detail` | 1040~1120px | 본문 65%, 정보 패널 30% |
| Routines | `narrow` | 720~760px | 실행 도구이므로 집중 폭 유지 |
| Submit | `narrow` | 720~760px | 입력 폼 중심 |
| Saved | `grid` 또는 `narrow` | 저장 수량에 따라 결정 | 카드가 많으면 grid, 비어 있으면 narrow |

### 반응형

Desktop:

- 좌측 사이드바 고정
- Explore는 3열 카드 그리드
- Detail은 본문/구조화 정보 2열

Tablet:

- 좌측 사이드바 유지 또는 compact
- Explore는 2열
- Detail은 정보 패널이 본문 아래로 내려갈 수 있음

Mobile:

- 하단 탭 또는 compact header
- 모든 카드 1열
- Detail 순서: Hero → Title → ActionBar → StructuredInfoPanel → Body → RelatedContent

## 4. 컴포넌트 구조

최종 구조는 Shell이 모든 것을 알지 않도록 나눈다.

```tsx
<ArchiveShell topSlot={<GlobalSearchBar />}>
  <ArchivePageContainer variant="grid">
    <ArchivePageHeader
      title="아카이브 탐색"
      search={<GlobalSearchBar />}
    />
    <ArchiveFilterBar />
    <ArchiveContentGrid layout="explore">
      <ArchiveCard variant="featuredHorizontal" />
      <ArchiveCard variant="standard" />
    </ArchiveContentGrid>
  </ArchivePageContainer>
</ArchiveShell>
```

상세:

```tsx
<ArchiveShell topSlot={<GlobalSearchBar compact />}>
  <ArchivePageContainer variant="detail">
    <ContentHero />
    <ContentActionBar />
    <DetailTwoColumn>
      <ContentBody />
      <StructuredInfoPanel />
    </DetailTwoColumn>
    <RelatedContentGrid />
  </ArchivePageContainer>
</ArchiveShell>
```

## 5. 핵심 컴포넌트

### 5.1 ArchiveShell

역할:

- 웹 화면의 최상위 뼈대
- 좌측 사이드바 배치
- 선택적 top slot 배치
- 모바일/데스크톱 내비 전환

비역할:

- 페이지별 max width 결정
- 검색 상태 관리
- 카드 그리드 배치
- 상세 정보 타입 판단

권장 API:

```ts
type ArchiveShellProps = {
  children: React.ReactNode;
  topSlot?: React.ReactNode;
};
```

### 5.2 ArchiveSidebar

역할:

- 브랜드 로고
- 메뉴 목록
- active route 표시
- expanded/collapsed 상태
- 하단 정책 링크

권장 props:

```ts
type ArchiveSidebarProps = {
  expanded?: boolean;
  activeRoute: string;
  navItems: ArchiveNavItem[];
  footerLinks?: Array<{ label: string; href: string }>;
};
```

P0 주의:

- 개인정보처리방침, 이용약관 링크는 노출 가능하다.
- 설정 아이콘은 실제 기능이 없으면 노출하지 않는다.

### 5.3 ArchivePageContainer

역할:

- 페이지별 폭과 패딩 제어
- grid/detail/narrow 레이아웃 variant 제공

권장 props:

```ts
type ArchivePageContainerVariant = 'grid' | 'detail' | 'narrow';

type ArchivePageContainerProps = {
  variant: ArchivePageContainerVariant;
  children: React.ReactNode;
};
```

권장 폭:

```txt
grid: max-width 1040~1120
detail: max-width 1040~1120
narrow: max-width 720~760
```

### 5.4 ArchivePageHeader

역할:

- 페이지 타이틀
- 설명
- 검색 slot
- 보조 액션 slot
- 필요 시 breadcrumb

권장 props:

```ts
type ArchivePageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  search?: React.ReactNode;
  actions?: React.ReactNode;
};
```

노출 기준:

- Explore: 검색 필수
- Home: 검색 선택
- Detail: compact search 선택
- Submit/Routines/Saved: 검색 비노출 가능

### 5.5 GlobalSearchBar

역할:

- 콘텐츠, 장소, 재료, 태그 검색
- Explore의 핵심 진입 도구

권장 props:

```ts
type GlobalSearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  compact?: boolean;
};
```

기본 placeholder:

```txt
의식, 재료 또는 장소를 입력해주세요...
```

### 5.6 ArchiveFilterBar

외부에서는 하나의 필터 영역으로 쓰되, 내부는 카테고리와 조건 필터를 분리한다.

```tsx
<ArchiveFilterBar
  categories={categories}
  activeCategory={activeCategory}
  filters={filters}
  activeFilters={activeFilters}
/>
```

내부 구조:

```txt
ArchiveFilterBar
├─ CategoryTabs
└─ FilterChipRow
```

CategoryTabs:

- 더 큰 chip
- 선택 상태 강함
- 전체 / 홈케어 / 목욕 공간 / 욕실 아이템 / 읽을거리/문화

FilterChipRow:

- 더 작은 chip
- 보조 탐색 기준
- 예: 20분 이하, 엡솜 소금, Warm, 가이드 오디오

### 5.7 Badge

역할:

- 추천
- 업데이트
- 카테고리
- 콘텐츠 타입

권장 props:

```ts
type BadgeTone = 'teal' | 'soft' | 'outline' | 'muted';

type BadgeProps = {
  tone?: BadgeTone;
  children: React.ReactNode;
};
```

### 5.8 SaveButton

역할:

- 콘텐츠 저장/해제 액션
- 카드 우상단 및 상세 ActionBar에서 재사용

권장 props:

```ts
type SaveButtonProps = {
  saved: boolean;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'floating' | 'inline';
};
```

상태:

- default
- hover
- saved
- disabled

주의:

- SaveButton은 인증 상태를 알지 않는다.
- 이미지 위에서도 대비가 유지되도록 흰색 또는 반투명 흰색 원형 표면을 사용한다.

### 5.9 MetaRow / MetaItem

역할:

- 카드 하단과 상세 요약에서 반복되는 메타 정보 렌더링
- 시간, 환경, 욕조 필요 여부, 장소, 가격대 등을 통일된 간격과 아이콘으로 표시

권장 API:

```tsx
<MetaRow>
  <MetaItem icon="clock" label="10분" />
  <MetaItem icon="droplet" label="홈케어" />
  <MetaItem icon="bath" label="욕조 없음" />
</MetaRow>
```

P0에서는 아이콘 라이브러리 추가 없이 현재 사용 중인 아이콘 세트를 우선 사용한다.

### 5.10 ArchiveCard

P0 variant는 4개만 둔다.

```ts
type ArchiveCardVariant =
  | 'featuredHorizontal'
  | 'standard'
  | 'compact'
  | 'quote';
```

역할:

- 카드 내부 모양
- 이미지, 제목, 설명, 메타, 저장 버튼, 배지 렌더링

비역할:

- 몇 열에 놓일지 결정하지 않는다.
- 카드 width/span은 `ArchiveContentGrid`가 담당한다.

권장 props:

```ts
type ArchiveCardProps = {
  content: ArchiveContent;
  variant?: ArchiveCardVariant;
  saved?: boolean;
  onSavePress?: () => void;
  onPress?: () => void;
};
```

variant 기준:

- `featuredHorizontal`: Explore 상단 대표 카드. 데스크톱에서 이미지/본문 좌우 배치.
- `standard`: 일반 탐색 카드. 이미지 상단, 텍스트 하단.
- `compact`: 상세 하단 관련 콘텐츠.
- `quote`: 이미지 없이 문장/인사이트 중심 카드.

### 5.11 ArchiveContentGrid

역할:

- 카드 배치
- 데스크톱/태블릿/모바일 열 수
- featured 카드 span 처리

권장 props:

```ts
type ArchiveContentGridProps = {
  layout: 'explore' | 'related' | 'home';
  children: React.ReactNode;
};
```

P0 구현 기준:

- Expo Web/React Native 제약상 CSS Grid 대신 `flexWrap` 기반으로 시작한다.
- RN style에서 `calc()` 지원이 애매하면 viewport width 기반 계산 또는 고정 flex basis를 사용한다.

권장 배치:

```txt
Desktop Explore:
- featuredHorizontal: 64~66%
- side standard: 32~34%
- bottom standard: 3 columns

Tablet:
- featuredHorizontal: 100%
- standard: 2 columns

Mobile:
- all cards: 1 column
- featuredHorizontal도 image top / text bottom
```

### 5.12 ContentHero

역할:

- 상세 상단 대형 이미지
- 카테고리/타입 chip
- 이미지 기반 몰입감 제공

권장 높이:

```txt
Desktop: 360~420
Tablet: 300~360
Mobile: 220~280
```

원칙:

- 제목과 핵심 설명은 이미지 위가 아니라 이미지 아래에 둔다.
- 이미지 위에는 category/type chip 정도만 올린다.

### 5.13 ContentActionBar

역할:

- 상세 페이지 주요 액션 묶음
- 저장
- 의식 보기/시작
- 제보

권장 props:

```ts
type ContentActionBarProps = {
  saved: boolean;
  onSavePress: () => void;
  primaryAction?: {
    label: string;
    onPress: () => void;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
};
```

### 5.14 StructuredInfoPanel

역할:

- 상세 페이지의 핵심 차별점
- 장소, 아이템, 홈케어, 의식 정보를 같은 구조로 보여준다.

컴포넌트는 content 타입을 직접 판단하지 않고 row schema를 렌더링한다.

```ts
type StructuredInfoRow = {
  label: string;
  value: string;
  icon?: string;
  tone?: 'default' | 'positive' | 'warning' | 'muted';
};

type StructuredInfoPanelProps = {
  title: string;
  rows: StructuredInfoRow[];
  updatedAt?: string;
};
```

타입별 row 생성은 별도 mapper가 담당한다.

```ts
buildStructuredInfoRows(content): StructuredInfoRow[]
```

예시:

Place:

- 외부인 이용 가능 여부
- 가격대
- 예약 필요 여부
- 지역
- 적합도

Item:

- 사용 상황
- 욕조 필요 여부
- 보관 난이도
- 관리 난이도
- 가격대

Home Care / Ritual:

- 소요 시간
- 환경
- 상황
- 필요한 아이템

### 5.15 RelatedContentGrid

역할:

- 상세 하단에서 다음 콘텐츠 소비를 이어준다.
- 별도 카드 디자인을 만들지 않고 `ArchiveCard variant="compact"` 또는 `standard`를 재사용한다.

### 5.16 TopContentBanner

역할:

- 최신 업데이트나 운영자가 강조하고 싶은 기록을 짧게 알린다.
- Explore 상단 또는 Home 상단에서만 선택적으로 사용한다.

권장 props:

```ts
type TopContentBannerProps = {
  label?: string;
  title: string;
  href?: string;
  onPress?: () => void;
};
```

노출 원칙:

- P0에서는 공지/업데이트가 실제로 있을 때만 노출한다.
- 모든 화면에 고정하지 않는다.
- 상세, Submit, Routines에서는 기본 비노출한다.

## 6. 구현 우선순위

1. 디자인 토큰 정리
2. `ArchiveShell`, `ArchiveSidebar`
3. `ArchivePageContainer`
4. `SaveButton`, `Badge`, `MetaRow`
5. `ArchiveCard` variants
6. `ArchiveContentGrid`
7. Explore 화면 적용
8. `ContentHero`, `StructuredInfoPanel`, `ContentActionBar`
9. Content Detail 화면 적용
10. `TopContentBanner`와 상단 검색/top slot 정리
11. copy 최종 점검

## 7. P0 범위

P0에서 한다:

- 좌측 사이드바
- Explore grid layout
- 상세 hero + 2열 구조
- 저장 버튼 컴포넌트화
- 메타 정보 컴포넌트화
- 구조화 정보 패널 schema 기반 렌더링
- 필요 시 `TopContentBanner` 선택 노출
- 사용자 노출 copy 한국어/브랜드 언어 정리

P0에서 하지 않는다:

- 검색 자동완성 고도화
- 서버 기반 저장
- 로그인 기반 개인화
- 설정 화면
- 고급 필터 조합 UI
- 카드 variant 5개 이상 확장
- CSS Grid 전면 도입

## 8. Copy 원칙

사용자가 보는 언어:

- `의식`: 사용자가 직접 경험하는 행위
- `기록`: 아카이브에 쌓이는 콘텐츠
- `보관함`: 저장된 기록의 모음
- `탐색`: 아카이브를 조건으로 찾아보는 행위

금지:

- 사용자 노출 copy에서 `루틴` 사용
- 사용자 노출 copy에서 내부 영어 IA 사용

허용:

- 타입명, 변수명, 이벤트명, 내부 enum에서 `routine` 사용
- 관리자 전용 상태값에서 내부 코드 사용

## 9. 구현 시 주의점

- `ArchiveShell`이 검색, max width, 카드 배치, 상세 구조까지 모두 알게 만들지 않는다.
- `ArchiveCard` variant를 P0에서 과하게 늘리지 않는다.
- 상세 페이지 2열 구조는 모바일 순서를 반드시 같이 구현한다.
- Explore는 단순히 폭만 넓히지 말고, grid/span 규칙을 함께 적용한다.
- 검색창은 Explore에서 필수, 나머지 화면에서는 slot 기반 선택 노출로 둔다.
- 이미지 위 저장 버튼은 항상 대비를 보장한다.
