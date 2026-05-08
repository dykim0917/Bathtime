# P0 Web Implementation Plan — 바스타임

## 1. 목적

이 문서는 바스타임 피벗 이후 P0 웹 구현 계획을 코드베이스 기준으로 정리한다.

최신 웹 시안 기반 컴포넌트 구조와 레이아웃 결정은 [`archive-component-system.design.md`](./02-design/features/archive-component-system.design.md)를 우선 참조한다. 이 문서의 초기 폭/컴포넌트 제안과 최신 시안이 충돌할 경우, P0 구현은 최신 컴포넌트 시스템 문서를 따른다.

구현 리뷰 이후 P0를 실제 운영 검증 가능한 상태로 닫기 위한 후속 실행 계획은 [`p0-operational-readiness.plan.md`](./01-plan/features/p0-operational-readiness.plan.md)를 따른다.

이번 P0는 기존 앱 화면을 단순히 리디자인하는 작업이 아니다. 바스타임의 중심을 **집 안팎의 바스타임을 발견하고, 저장하고, 바로 따라 해볼 수 있는 웹 아카이브 플랫폼**으로 옮기고, 기존 앱에서 구현해둔 케어, 무드, 제품, 타이머 기능을 새 플랫폼 안의 콘텐츠와 실행 도구로 흡수하는 작업이다.

P0에서는 새 프로젝트를 만들지 않는다. 현재 Expo Router 프로젝트 안에서 웹 우선 IA와 반응형 레이아웃을 추가한다.

---

## 2. 핵심 전제

- P0는 웹부터 구현한다.
- 기존 `app/(tabs)` 앱 구조는 당장 삭제하지 않는다.
- 기존 `care`, `trip`, `product`, `timer` 기능은 버리지 않고 후속 통합 자산으로 둔다.
- P0는 커머스, 예약, 커뮤니티가 아니다.
- P0는 다음 흐름을 검증한다.

```txt
콘텐츠를 발견한다
→ 조건으로 탐색한다
→ 상세에서 구조화 정보를 확인한다
→ 저장한다
→ 관련 루틴을 실행해본다
→ 좋은 장소/세팅/아이템을 제보한다
```

---

## 3. P0 IA

웹과 앱은 최상위 IA를 공유한다.

```txt
Home
Explore
Routines
Submit
Saved
```

| Menu | P0 역할 |
|---|---|
| Home | 추천 콘텐츠, 최신 콘텐츠, 오늘의 바스타임 진입 |
| Explore | 카테고리, 태그, 검색 기반 아카이브 탐색 |
| Routines | 콘텐츠를 실제 행동으로 연결하는 루틴 실행 |
| Submit | 장소, 세팅, 아이템, 주제 제보 |
| Saved | 저장한 콘텐츠 보관 |

---

## 4. 반응형 레이아웃 기준

P0 웹은 모바일 앱 화면을 가운데 고정한 웹이 아니다.

```txt
Mobile: Header + Main Content + Bottom Tab
Tablet/Desktop: Left Sidebar + Main Content
Wide Desktop: Left Sidebar + Main Content
```

P0에서는 Right Assist Panel을 구현하지 않는다. 단, 추후 확장을 막지 않도록 메인 레이아웃 폭과 사이드바 구조는 문서 기준에 맞춰 설계한다.

### Breakpoint

```txt
Mobile: ~767px
Tablet / Small Desktop: 768px ~ 1199px
Wide Desktop: 1200px 이상
```

### 권장 치수

```txt
Left Sidebar: 220px ~ 240px
Main Content: max-width 720px ~ 760px
Right Panel: P0 제외
```

---

## 5. 권장 라우트 구조

기존 앱 탭을 바로 갈아엎지 않고, 웹 플랫폼 라우트를 별도로 둔다.

```txt
app/
├─ index.tsx
├─ (web)/
│  ├─ _layout.tsx
│  ├─ index.tsx              # Home
│  ├─ explore.tsx
│  ├─ routines.tsx
│  ├─ submit.tsx
│  ├─ saved.tsx
│  └─ content/
│     └─ [id].tsx
└─ (tabs)/
   ├─ index.tsx              # 기존 앱 홈, 당장 보존
   ├─ care.tsx               # 기존 기능, 후속 흡수
   ├─ trip.tsx               # 기존 기능, 후속 흡수
   ├─ product.tsx            # 기존 기능, 후속 흡수
   └─ my.tsx
```

### 라우팅 원칙

- 웹 진입점은 새 `(web)` 구조를 우선한다.
- 기존 앱 탭은 P0 웹 구현 중 깨뜨리지 않는다.
- 콘텐츠 상세는 `content/[id]`로 독립 라우트를 둔다.
- 루틴 실행은 P0에서는 웹 전용 간단 실행 화면으로 시작하되, 기존 `result/timer/[id]` 재사용 여부는 구현 시 검토한다.

---

## 6. 권장 파일 구조

```txt
src/
├─ archive/
│  ├─ types.ts
│  ├─ seed.ts
│  ├─ selectors.ts
│  └─ labels.ts
├─ components/
│  └─ web/
│     ├─ WebShell.tsx
│     ├─ WebSidebar.tsx
│     ├─ WebBottomTab.tsx
│     ├─ ArchiveContentCard.tsx
│     ├─ ArchiveStructuredInfo.tsx
│     ├─ RoutinePresetCard.tsx
│     └─ SubmitForm.tsx
└─ storage/
   ├─ savedContent.ts
   └─ submissions.ts
```

이 구조는 P0 구현을 작게 유지하면서도 이후 DB/API/Admin 연동으로 확장할 수 있게 한다.

---

## 7. 핵심 데이터 모델

P0부터 콘텐츠를 단순 글이 아니라 구조화된 객체로 다룬다.

```ts
export type ContentCategory =
  | 'HOME_BATH'
  | 'BATH_PLACES'
  | 'BATH_ITEMS'
  | 'TIPS_CULTURE';

export type ContentType =
  | 'TRIED'
  | 'RESEARCHED'
  | 'ORGANIZED'
  | 'VISITED'
  | 'SUBMITTED'
  | 'UPDATED';

export type Content = {
  id: string;
  title: string;
  subtitle?: string;
  category: ContentCategory;
  contentType: ContentType;
  tags: string[];
  heroImage?: ImageAsset;
  body: ContentBodyBlock[];
  structuredInfo: StructuredInfo;
  relatedRoutineIds?: string[];
  relatedItemIds?: string[];
  relatedPlaceIds?: string[];
  seo?: ContentSeoMetadata;
  createdAt: string;
  updatedAt: string;
};
```

### Content Body Block

P0 본문은 복잡한 에디터보다 안정적인 블록 구조를 우선한다.

```ts
export type ContentBodyBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'image'; uri: string; caption?: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'divider' };
```

P0 구현 최소 지원 범위:

```txt
paragraph
heading
image
list
```

`quote`와 `divider`는 타입에는 포함하되, 렌더러 구현은 간단하게 처리하거나 후순위로 둔다.

### Structured Info

구조화 정보는 바스타임 아카이브의 핵심 차별점이다. 자유 텍스트 하나로 뭉개지 않도록 카테고리별 타입을 분리한다.

```ts
export type StructuredInfo =
  | HomeBathStructuredInfo
  | PlaceStructuredInfo
  | ItemStructuredInfo
  | TipsStructuredInfo;

export type HomeBathStructuredInfo = {
  durationMinutes?: number;
  bathRequired?: boolean;
  requiredItems?: string[];
  difficulty?: 'low' | 'medium' | 'high';
  recommendedSituations?: string[];
  environment?: 'shower' | 'footbath' | 'bath' | 'home_spa';
};

export type PlaceStructuredInfo = {
  publicAccess?: 'available' | 'restricted' | 'members_only' | 'unknown';
  priceRange?: string;
  reservationRequired?: boolean | 'unknown';
  region?: string;
  suitableForSolo?: boolean;
  suitableForCouple?: boolean;
  privateLevel?: 'public' | 'semi_private' | 'private' | 'unknown';
  facilityTypes?: string[];
  lastCheckedAt?: string;
};

export type ItemStructuredInfo = {
  itemType?: string;
  useCases?: string[];
  bathRequired?: boolean;
  storageDifficulty?: 'low' | 'medium' | 'high' | 'unknown';
  maintenanceDifficulty?: 'low' | 'medium' | 'high' | 'unknown';
  priceRange?: string;
  recommendedFor?: string[];
  notRecommendedFor?: string[];
};

export type TipsStructuredInfo = {
  topic?: string;
  relatedCategories?: ContentCategory[];
  difficulty?: 'low' | 'medium' | 'high';
};
```

### SEO Metadata

웹 아카이브는 외부 공유와 검색 유입이 중요하므로 P0부터 콘텐츠별 SEO/공유 메타데이터를 둔다.

```ts
export type ContentSeoMetadata = {
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
};
```

### Image Asset

대표 이미지는 콘텐츠의 첫인상과 공유 미리보기에 영향을 준다.

```ts
export type ImageAsset = {
  uri: string;
  alt: string;
  credit?: string;
  sourceType?: 'owned' | 'official' | 'licensed' | 'generated' | 'none';
};
```

### P0 객체

| Object | P0 범위 |
|---|---|
| Content | 핵심 아카이브 단위 |
| Place | 장소형 콘텐츠의 구조화 정보 |
| Item | 아이템형 콘텐츠의 구조화 정보 |
| RoutinePreset | 바로 실행 가능한 루틴 |

---

## 8. P0 Seed 콘텐츠 기준

P0에서는 DB 연동보다 seed 데이터로 시작한다.

권장 최소 수량:

```txt
Home Bath: 3개
Bath Places: 3개
Bath Items: 3개
Tips / Culture: 2개
RoutinePreset: 4개
```

### Routine Preset

```txt
샤워 7분
족욕 10분
입욕 15분
자유 루틴/타이머
```

루틴은 타이머 그 자체가 아니라, 타이머를 포함하는 실행 가능한 프리셋이다.

```ts
export type RoutinePreset = {
  id: string;
  title: string;
  durationMinutes: number;
  environment: 'shower' | 'footbath' | 'bath' | 'free';
  situationTags: string[];
  description?: string;
  steps: string[];
  relatedContentIds?: string[];
  isPublished: boolean;
};
```

P0에서 `steps`는 짧고 실행 가능한 문장으로 유지한다.

예:

```txt
1. 물을 준비합니다.
2. 10분 동안 발을 담급니다.
3. 수건으로 감싸고 천천히 마무리합니다.
```

### P0 태그 예시

```txt
욕조 없음
수면 전
운동 후
혼자 쉬기
외부인 이용 가능
프라이빗
서울
비 오는 날
짧은 루틴
```

---

## 9. 화면별 구현 계획

## 9-1. WebShell

### 구현

- 모바일에서는 하단 탭 표시
- 768px 이상에서는 좌측 사이드바 표시
- 동일한 메뉴 순서 유지
- Main Content는 읽기 좋은 폭으로 제한

### 검증

- 모바일 폭에서 하단 탭이 보인다.
- 데스크톱 폭에서 좌측 사이드바가 보인다.
- 데스크톱에서 중앙 콘텐츠가 과하게 넓어지지 않는다.

---

## 9-2. Home

### 포함

- Featured 콘텐츠
- 오늘의 바스타임
- 최신 콘텐츠
- 카테고리별 섹션
- 바로 해볼 수 있는 루틴 CTA

### 제외

- 개인화 추천
- 위치 기반 추천
- 무한 피드

### 성공 기준

- 사용자가 첫 화면에서 바스타임이 콘텐츠 아카이브라는 것을 이해한다.
- 콘텐츠 상세와 루틴으로 진입할 수 있다.

---

## 9-3. Explore

### 포함

- 검색
- 카테고리 칩
- 태그 칩
- 콘텐츠 리스트
- 콘텐츠 상세 진입

### P0 카테고리

```txt
Home Bath
Bath Places
Bath Items
Tips / Culture
```

### 제외

- 지도 탐색
- 거리순 정렬
- 실시간 예약 가능 여부
- 사용자 리뷰 기반 정렬

### 성공 기준

- 카테고리와 태그로 콘텐츠 리스트가 바뀐다.
- 제품은 독립 탭이 아니라 `Bath Items` 콘텐츠로 발견된다.

---

## 9-4. Content Detail

P0에서 가장 중요한 화면이다.

### 포함

- 제목/부제
- 카테고리/타입
- 태그
- 구조화 정보
- 본문
- 저장 버튼
- 관련 루틴 CTA
- 관련 장소/아이템 표시
- 제보 CTA

### 성공 기준

- 콘텐츠가 블로그 글이 아니라 구조화된 아카이브 기록처럼 보인다.
- 상세에서 저장, 루틴 실행, 제보로 이어진다.

---

## 9-5. Routines

### 포함

- 루틴 프리셋 목록
- 샤워 7분
- 족욕 10분
- 입욕 15분
- 자유 루틴/타이머
- 실행 화면
- 완료 상태

### 기존 기능 흡수

- 기존 `care` 추천은 후속으로 상황별 루틴 추천에 흡수한다.
- 기존 `trip` 무드 기능은 루틴의 배경/콘텐츠 연결로 흡수한다.
- 기존 `result/timer/[id]`는 재사용 가능하지만, P0 웹에서는 단순 실행 흐름을 우선한다.

### 제외

- 직접 루틴 제작
- 루틴 편집
- 루틴 공유
- 통계
- 웨어러블/건강 데이터 연동

---

## 9-6. Saved

### 포함

- 저장한 콘텐츠 목록
- 콘텐츠 상세 재진입
- 로그인 없는 local storage 저장

### 제외

- 저장한 장소/아이템/루틴 분리
- 폴더
- 컬렉션
- 로그인 필수화

### 성공 기준

- 콘텐츠 상세에서 저장한 항목이 Saved에서 보인다.
- 새로고침 후에도 local storage 기준으로 유지된다.

---

## 9-7. Submit

### 포함

- 제보 유형 선택
- 링크 또는 사진 URL 입력
- 한 줄 코멘트
- 제출 완료 상태
- local storage 또는 mock 저장

### 제보 유형

```txt
사우나 / 스파
욕조 있는 숙소
홈스파 세팅
아이템
다뤄줬으면 하는 주제
```

### 제외

- 공개 게시판
- 댓글
- 유저 프로필
- 평점/리뷰
- 제보글 즉시 공개

---

## 10. 기존 기능 흡수 계획

| 기존 기능 | P0 이후 위치 | 처리 방식 |
|---|---|---|
| `care.tsx` | Routines / Home Bath | 상황별 루틴, 관련 콘텐츠로 흡수 |
| `trip.tsx` | Routines / Tips Culture | 무드 콘텐츠, 루틴 배경으로 흡수 |
| `product.tsx` | Explore / Bath Items | 제품 탭 제거 후 아이템 콘텐츠로 흡수 |
| `result/timer/[id]` | Routines | 실행 화면 재사용 후보 |
| `ProductCard` | Bath Items | 커머스 카드가 아니라 아이템 맥락 카드로 조정 |

P0 구현 중 기존 기능을 삭제하지 않는다. 새 웹 플랫폼의 흐름이 안정화된 뒤, 앱 탭 개편 단계에서 흡수한다.

---

## 11. P0 관리자 개편 계획

P0 웹 아카이브를 제대로 운영하려면 관리자도 이번 범위에 포함한다.

이미 `apps/admin`에 Next 기반 관리자 앱이 있으므로 새 관리자 프로젝트를 만들지 않는다. 기존 관리자 구조를 유지하되, 현재의 `Products / Care / Trip / Audio` 중심 메뉴를 새 아카이브 IA에 맞춰 재편한다.

### 11-1. 관리자 IA

P0 관리자 메뉴는 다음으로 정리한다.

```txt
Dashboard
Archive Content
Submissions
Routine Presets
Publish
```

| Menu | P0 역할 |
|---|---|
| Dashboard | 콘텐츠/제보/루틴 상태 요약 |
| Archive Content | 콘텐츠 등록, 수정, 공개 상태 관리 |
| Submissions | 사용자 제보 확인과 상태 변경 |
| Routine Presets | 기본 루틴 프리셋 관리 |
| Publish | 발행 전 검증과 스냅샷 확인 |

기존 `Products`, `Care Routines`, `Mood Routines`, `Audio` 메뉴는 P0 관리자에서는 직접 노출 우선순위를 낮춘다. 관련 데이터는 새 `Archive Content`와 `Routine Presets`에 흡수한다.

### 11-2. 관리자 라우트 구조

```txt
apps/admin/app/
├─ page.tsx                    # Dashboard
├─ content/
│  ├─ page.tsx                 # 콘텐츠 목록
│  ├─ new/page.tsx             # 콘텐츠 등록
│  └─ [id]/page.tsx            # 콘텐츠 수정
├─ submissions/
│  ├─ page.tsx                 # 제보 목록
│  └─ [id]/page.tsx            # 제보 상세/상태 변경
├─ routines/
│  ├─ page.tsx                 # 루틴 프리셋 목록
│  └─ [id]/page.tsx            # 루틴 프리셋 수정
└─ publish/
   └─ page.tsx
```

기존 `products`, `care`, `trip`, `audio` 라우트는 바로 삭제하지 않는다. 새 관리자 구조가 안정화된 뒤 숨김 처리 또는 레거시 운영 메뉴로 분리한다.

---

## 12. 관리자 데이터 모델

관리자와 사용자 웹은 같은 아카이브 모델을 바라봐야 한다.

### 12-1. Archive Content

필수 필드:

```txt
제목
부제
카테고리
콘텐츠 타입
태그
대표 이미지
본문
구조화 정보
관련 루틴
공개/비공개
작성일
수정일
```

카테고리:

```txt
Home Bath
Bath Places
Bath Items
Tips / Culture
```

콘텐츠 타입:

```txt
해봤다
찾아봤다
정리했다
다녀왔다
제보받았다
업데이트했다
```

### 12-2. Structured Info

구조화 정보는 P0 관리자에서 가장 중요한 입력 영역이다.

콘텐츠 카테고리에 따라 입력 폼을 다르게 보여준다. 모든 구조화 정보 입력은 자유 텍스트 하나로 뭉개지지 않아야 한다.

#### Bath Places

```txt
외부인 이용 가능 여부
가격대
예약 필요 여부
지역
혼자 이용 적합도
커플 이용 적합도
프라이빗 여부
시설 종류
업데이트 일자
```

#### Home Bath

```txt
소요 시간
욕조 필요 여부
필요한 아이템
난이도
추천 상황
연결 루틴
```

#### Bath Items

```txt
아이템 유형
사용 상황
욕조 필요 여부
보관/관리 난이도
가격대
추천 대상
비추천 대상
```

#### Tips / Culture

P0에서는 최소 구조로 시작한다.

```txt
주제
관련 카테고리
난이도
```

---

## 13. 관리자 화면별 계획

## 13-1. Archive Content 목록

목록에서 최소한 다음 정보를 보여준다.

```txt
제목
카테고리
콘텐츠 타입
공개 상태
수정일
태그
```

필터:

```txt
카테고리
공개/비공개
콘텐츠 타입
```

P0에서는 고급 검색, 작성자별 필터, SEO 점수, 협업 상태를 넣지 않는다.

### 성공 기준

- 운영자가 현재 어떤 콘텐츠가 공개되어 있는지 빠르게 볼 수 있다.
- 카테고리와 콘텐츠 타입 기준으로 목록을 좁힐 수 있다.

---

## 13-2. Archive Content 등록/수정

등록/수정 화면은 세 영역으로 나눈다.

```txt
기본 정보
본문
구조화 정보
```

### 기본 정보

```txt
제목
부제
카테고리
콘텐츠 타입
태그
대표 이미지
공개/비공개
관련 루틴
```

### 본문

P0에서는 복잡한 에디터를 넣지 않는다.

권장 시작점:

```txt
블록형 입력 또는 단순 Markdown textarea
```

단, 데이터 모델은 이후 블록형 렌더링으로 갈 수 있게 `ContentBodyBlock[]`를 기준으로 둔다.

### 구조화 정보

카테고리를 선택하면 해당 카테고리에 맞는 구조화 정보 입력 필드를 노출한다.

예:

```txt
Bath Places 선택
→ 외부인 이용 가능 여부, 가격대, 예약 필요 여부, 지역 등 노출

Home Bath 선택
→ 소요 시간, 욕조 필요 여부, 필요한 아이템, 난이도 등 노출
```

### 성공 기준

- 운영자가 같은 포맷으로 콘텐츠를 반복 등록할 수 있다.
- 구조화 정보가 누락된 콘텐츠를 발행하기 어렵게 만든다.

---

## 13-3. Submissions

P0에서는 제보가 바로 공개되지 않는다.

관리자에서 볼 수 있어야 하는 정보:

```txt
제보 유형
사진/링크
한 줄 코멘트
닉네임
공개 가능 여부
상태
제보일
```

상태값:

```txt
new
reviewing
accepted
rejected
```

P0에서는 제보를 콘텐츠로 바로 전환하는 버튼은 필수로 넣지 않는다. 목록 확인과 상태 변경이 먼저다.

### 성공 기준

- 운영자가 새 제보를 확인할 수 있다.
- 제보 상태를 바꿀 수 있다.
- 공개 가능 여부를 확인할 수 있다.

---

## 13-4. Routine Presets

P0 루틴은 최소 프리셋만 관리한다.

```txt
샤워 7분
족욕 10분
입욕 15분
자유 루틴/타이머
```

관리 필드:

```txt
루틴명
소요 시간
환경
간단 설명
단계
공개 여부
```

### 성공 기준

- 콘텐츠 상세에서 연결할 수 있는 루틴 프리셋을 관리할 수 있다.
- 루틴 프리셋의 공개 여부를 바꿀 수 있다.

---

## 14. 관리자에서 하지 않을 것

P0 관리자에서는 다음을 제외한다.

```txt
회원 관리
권한 관리 고도화
댓글 관리
리뷰 관리
상품 DB 관리
예약 관리
결제 관리
브랜드 입점 관리
통계 대시보드 고도화
에디터 협업 기능
이미지 에디터
SEO 고급 설정
```

관리자 P0의 목표는 큰 CMS를 만드는 것이 아니라, 바스타임 아카이브의 반복 가능한 콘텐츠 구조를 운영자가 입력하고 관리할 수 있게 하는 것이다.

---

## 15. 관리자 구현 단계 체크리스트

### Phase A1. 관리자 IA 재편

- [ ] `AdminShell` 메뉴를 새 IA로 정리
- [ ] `Archive Content` 라우트 추가
- [ ] `Submissions` 라우트 추가
- [ ] `Routine Presets` 라우트 추가
- [ ] 기존 `products/care/trip/audio` 메뉴 노출 전략 결정

### Phase A2. 콘텐츠 관리

- [ ] 콘텐츠 목록 화면 구현
- [ ] 카테고리 필터 구현
- [ ] 공개 상태 필터 구현
- [ ] 콘텐츠 타입 필터 구현
- [ ] 콘텐츠 등록 화면 구현
- [ ] 콘텐츠 수정 화면 구현
- [ ] 카테고리별 구조화 정보 폼 구현

### Phase A3. 제보 관리

- [ ] 제보 목록 화면 구현
- [ ] 제보 상세 화면 구현
- [ ] 상태 변경 구현
- [ ] 공개 가능 여부 표시

### Phase A4. 루틴 프리셋 관리

- [ ] 루틴 프리셋 목록 구현
- [ ] 루틴 프리셋 수정 구현
- [ ] 공개 여부 변경 구현
- [ ] 콘텐츠 등록/수정에서 관련 루틴 선택 연결

### Phase A5. 검증

- [ ] `npm --prefix apps/admin run build`
- [ ] 관리자 목록/등록/수정 흐름 확인
- [ ] 구조화 정보 필드가 카테고리별로 바뀌는지 확인
- [ ] 제보 상태 변경 확인
- [ ] 루틴 공개 여부 변경 확인

---

## 16. SEO / Share Metadata

P0 웹은 외부 채널에서 유입될 수 있어야 한다. 따라서 콘텐츠 상세 페이지는 최소 메타데이터를 렌더링한다.

### 콘텐츠별 필드

```txt
seoTitle
seoDescription
ogImage
canonicalUrl
```

### 상세 페이지 메타

`content/[id]` 상세 페이지에서 다음을 설정한다.

```txt
title
description
Open Graph title
Open Graph description
Open Graph image
Twitter/Kakao 공유 이미지
canonical URL
```

### P0 원칙

- `seoTitle`이 없으면 `title`을 사용한다.
- `seoDescription`이 없으면 `subtitle` 또는 본문 첫 paragraph를 사용한다.
- `ogImage`가 없으면 `heroImage`를 사용한다.
- 둘 다 없으면 카테고리별 기본 이미지를 사용한다.

---

## 17. Storage Strategy

P0 Saved는 로그인 없이 시작하지만, 웹과 앱의 저장 방식이 다르므로 공통 인터페이스를 먼저 둔다.

```ts
export interface SavedContentStorage {
  getSavedIds(): Promise<string[]>;
  save(id: string): Promise<void>;
  remove(id: string): Promise<void>;
  isSaved(id: string): Promise<boolean>;
}
```

### 구현 전략

| Platform | P0 저장 방식 | 이후 확장 |
|---|---|---|
| Web | `localStorage` | 로그인 기반 서버 저장 |
| Native App | `AsyncStorage` | 로그인 기반 서버 저장 |
| Server | P0 제외 | 계정 저장/동기화 |

### P0 원칙

- 사용자 웹은 `localStorage` adapter를 사용한다.
- 기존 앱 또는 네이티브 경로는 `AsyncStorage` adapter를 사용한다.
- UI는 adapter 인터페이스만 사용하고 저장 구현에 직접 의존하지 않는다.

---

## 18. Submission Handling

P0 제보는 바로 공개하지 않는다. 제보는 운영자가 확인하고 필요하면 콘텐츠로 재가공한다.

### Submission 타입

```ts
export type SubmissionStatus =
  | 'new'
  | 'reviewing'
  | 'accepted'
  | 'rejected';

export type Submission = {
  id: string;
  type: 'sauna_spa' | 'bathtub_stay' | 'home_spa' | 'item' | 'topic';
  linkOrImage?: string;
  comment: string;
  nickname?: string;
  canPublish?: boolean;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
};
```

### 저장 선택지

| Option | 용도 | P0 판단 |
|---|---|---|
| Local mock | 내부 개발/QA | 개발 초기에 사용 |
| Google Form / Typeform / Notion Form | 빠른 외부 테스트 | 공개 베타 전 최소 후보 |
| Supabase DB | 서비스형 P0 | 관리자 상태 변경까지 하려면 권장 |

### P0 권장

관리자까지 함께 개편하므로, 내부 테스트는 mock으로 시작하되 공개 테스트 전에는 Supabase 같은 DB 저장을 우선 검토한다. 최소한 `status` 필드는 처음부터 둔다.

---

## 19. Analytics Event Spec

P0 검증을 위해 최소 이벤트 이름을 먼저 고정한다.

### 이벤트 목록

```txt
archive_home_viewed
content_card_clicked
content_detail_viewed
content_saved
content_unsaved
explore_filter_used
routine_cta_clicked
routine_started
routine_completed
submit_started
submit_completed
external_link_clicked
```

### 공통 속성

```txt
contentId
category
contentType
tags
source
routineId
submissionType
platform
```

### P0 원칙

- 모든 이벤트를 바로 외부 분석 도구에 붙일 필요는 없다.
- 기존 `src/analytics/events.ts` 패턴과 충돌하지 않게 확장한다.
- 최소한 이벤트 이름과 payload 타입은 구현 전에 정의한다.

---

## 20. Image / Asset Policy

콘텐츠 아카이브는 이미지가 중요하지만, 장소/숙소/사우나 이미지는 저작권 이슈가 크다.

### 필드

```txt
heroImage
body image
ogImage
```

### 이미지 소스 원칙

우선순위:

```txt
직접 촬영 이미지
공식 제공 이미지
라이선스 확인 이미지
생성 이미지
이미지 없는 구조화 카드
```

### Fallback

- 이미지가 없으면 카테고리별 기본 비주얼을 사용한다.
- Bath Places는 이미지가 없어도 구조화 카드로 신뢰를 줄 수 있어야 한다.
- Bath Items는 제품 사진보다 사용 상황과 관리 정보가 먼저 보이게 한다.

### P0에서 하지 않을 것

- 무단 외부 이미지 저장
- 이미지 에디터
- 사용자 업로드 이미지 편집
- 저작권 출처가 불명확한 숙소/스팟 이미지 사용

---

## 21. Routing Decision

웹 P0 착수 전 루트 라우팅을 확정한다.

### 권장 결정

```txt
/              → 웹 플랫폼 Home
/explore       → 웹 Explore
/routines      → 웹 Routines
/submit        → 웹 Submit
/saved         → 웹 Saved
/content/[id]  → 웹 Content Detail
```

기존 네이티브 앱은 `app/(tabs)`를 유지한다.

### 구현 시 주의

Expo Router에서 `app/index.tsx`와 `app/(web)/index.tsx`가 동시에 있을 경우 루트 진입점이 혼동될 수 있다.

따라서 구현 전 다음 중 하나를 선택한다.

1. `app/index.tsx`를 웹 플랫폼 Home으로 전환하고 기존 앱 홈은 `(tabs)/index.tsx`에 유지한다.
2. `app/index.tsx`에서 플랫폼/네이티브 조건에 따라 라우팅한다.

P0 권장은 1번이다. 웹을 본진으로 두는 방향과 맞고, 기존 앱 탭은 그대로 보존할 수 있다.

---

## 22. 착수 전 확정해야 할 것

개발 착수 전 아래 5개는 반드시 확정한다.

```txt
ContentBodyBlock 타입
StructuredInfo 세부 타입
루트 라우팅 방식
Saved 저장 방식
Analytics 이벤트 목록
```

이 다섯 가지가 확정되면 P0 웹과 관리자 구현을 병렬로 진행할 수 있다.

---

## 23. 구현 단계 체크리스트

### Phase 1. 웹 레이아웃 기반

- [ ] `(web)` 라우트 그룹 추가
- [ ] `WebShell` 추가
- [ ] `WebSidebar` 추가
- [ ] `WebBottomTab` 추가
- [ ] 모바일/데스크톱 반응형 전환 확인

### Phase 2. 아카이브 모델

- [ ] `src/archive/types.ts` 추가
- [ ] `src/archive/labels.ts` 추가
- [ ] `src/archive/seed.ts` 추가
- [ ] `src/archive/selectors.ts` 추가
- [ ] `ContentBodyBlock` 타입 정의
- [ ] `StructuredInfo` 세부 타입 정의
- [ ] `ContentSeoMetadata` 타입 정의
- [ ] `ImageAsset` 타입 정의
- [ ] `RoutinePreset` 타입 정의
- [ ] P0 seed 콘텐츠 작성

### Phase 3. 콘텐츠 탐색

- [ ] Home 구현
- [ ] Explore 구현
- [ ] Content Card 구현
- [ ] Content Detail 구현
- [ ] 카테고리/태그/검색 동작 확인
- [ ] 콘텐츠 상세 SEO/OG 메타 설정

### Phase 4. 저장과 제보

- [ ] `SavedContentStorage` 인터페이스 구현
- [ ] Web `localStorage` adapter 구현
- [ ] Native `AsyncStorage` adapter 구현 후보 정리
- [ ] 저장 토글 구현
- [ ] Submit 폼 구현
- [ ] Submission status 모델 구현
- [ ] 제보 완료 상태 구현

### Phase 5. 루틴 실행

- [ ] Routine Preset 모델 구현
- [ ] Routines 목록 구현
- [ ] 루틴 실행 화면 구현
- [ ] 콘텐츠 상세에서 관련 루틴 CTA 연결
- [ ] 완료 상태 구현

### Phase 6. 검증

- [ ] `npm run typecheck`
- [ ] 웹 모바일 폭 확인
- [ ] 웹 데스크톱 폭 확인
- [ ] Home → Detail → Save → Saved 흐름 확인
- [ ] Explore → Detail 흐름 확인
- [ ] Detail → Routine 흐름 확인
- [ ] Submit 완료 흐름 확인
- [ ] 주요 Analytics 이벤트 발생 확인

---

## 24. P0에서 하지 않을 것

- 새 프로젝트 생성
- 기존 앱 탭 즉시 삭제
- 기존 케어/무드/제품 기능 삭제
- 예약
- 결제
- 지도
- 커뮤니티
- 댓글
- 팔로우
- 공개 리뷰
- 제품 구매 중심 UX
- 고도화 개인화
- Right Assist Panel
- 직접 루틴 제작
- DB/Admin 전체 재설계

---

## 25. 완료 기준

P0 웹 구현은 다음 조건을 만족하면 완료로 본다.

- 웹에서 `Home / Explore / Routines / Submit / Saved` IA가 동작한다.
- 모바일 웹에서는 하단 탭이 보인다.
- 데스크톱 웹에서는 좌측 사이드바가 보인다.
- 콘텐츠가 카테고리, 태그, 구조화 정보로 표현된다.
- 콘텐츠 상세에서 저장과 루틴 CTA가 가능하다.
- Saved에서 저장한 콘텐츠를 다시 열 수 있다.
- Submit에서 제보 흐름이 완료된다.
- 기존 앱 기능은 깨지지 않고 보존된다.
- 관리자에서 콘텐츠를 등록/수정할 수 있다.
- 관리자에서 카테고리별 구조화 정보를 입력할 수 있다.
- 관리자에서 제보 목록 확인과 상태 변경을 할 수 있다.
- 관리자에서 루틴 프리셋을 관리할 수 있다.
- 콘텐츠 상세 페이지에서 SEO/OG 메타데이터가 설정된다.
- Saved 저장이 공통 storage interface를 통해 동작한다.
- P0 핵심 이벤트 이름과 payload가 정의된다.
