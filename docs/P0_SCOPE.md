# P0 Scope — 바스타임

## 1. 문서 목적

이 문서는 바스타임 P0 개발 범위를 정의하기 위한 기준 문서이다.

바스타임은 기존의 샤워·목욕 타이머 앱에서 벗어나, 집 안팎의 바스타임을 발견하고, 저장하고, 바로 따라 해볼 수 있는 아카이브 서비스로 전환한다.

P0의 목적은 완성형 플랫폼을 만드는 것이 아니다.  
P0의 목적은 바스타임이 **콘텐츠 아카이브로서 소비되고, 저장되고, 간단한 루틴 실행과 제보로 이어지는지** 검증하는 것이다.

---

## 2. P0 Goal

> P0의 목표는 좋은 바스타임 콘텐츠를 사용자가 발견하고, 저장하고, 간단한 루틴으로 따라 해보고, 좋은 장소·세팅·아이템을 제보하는 최소 흐름을 검증하는 것이다.

P0는 다음을 검증한다.

1. 사용자가 바스타임 콘텐츠를 읽는가
2. 사용자가 콘텐츠를 저장하고 싶어 하는가
3. 콘텐츠가 루틴 실행으로 이어지는가
4. 사용자가 좋은 장소, 세팅, 아이템을 가볍게 제보하는가
5. Home / Explore / Routines / Submit / Saved 구조가 서비스 방향에 맞게 작동하는가

---

## 3. P0 Product Principle

P0는 예약·구매·커뮤니티 플랫폼이 아니다.

P0는 다음에 집중한다.

```txt
콘텐츠를 본다
저장한다
관련 루틴을 실행한다
좋은 장소/세팅/아이템을 제보한다
```

P0에서 중요한 것은 기능의 양이 아니라, 바스타임만의 구조를 만드는 것이다.

바스타임의 해자는 예쁜 UI가 아니라 **구조화된 바스타임 정보**이다.  
따라서 P0부터 콘텐츠, 장소, 아이템, 루틴을 단순 텍스트가 아니라 객체로 분리해 설계한다.

---

## 4. P0 IA

P0의 최종 메뉴 구조는 다음 다섯 개를 기준으로 한다.

```txt
BATH TIME

├─ Home
├─ Explore
├─ Routines
├─ Submit
└─ Saved
```

### 메뉴 역할 요약

| Menu | Role |
|---|---|
| Home | 오늘 볼 만한 콘텐츠와 최신 아카이브를 발견하는 첫 화면 |
| Explore | 카테고리, 태그, 리스트 기반으로 콘텐츠를 탐색하는 영역 |
| Routines | 샤워, 족욕, 입욕, 자유 루틴을 실행하는 영역 |
| Submit | 좋은 장소, 세팅, 아이템, 주제를 제보하는 영역 |
| Saved | 저장한 콘텐츠를 다시 꺼내보는 보관함 |

---

## 5. Included Scope

P0에 포함하는 기능은 다음으로 제한한다.

### Home

- 콘텐츠 피드
- 추천 콘텐츠
- 최신 콘텐츠

### Explore

- 카테고리
- 태그
- 콘텐츠 리스트

### Routines

- 샤워 7분
- 족욕 10분
- 입욕 15분
- 자유 루틴/타이머

### Submit

- 제보 유형 선택
- 사진 또는 링크 첨부
- 한 줄 코멘트 입력

### Saved

- 저장한 콘텐츠

---

## 6. Excluded Scope

P0에서 제외하는 기능은 다음과 같다.

```txt
회원가입 필수화
댓글
게시판
팔로우
제품 구매 링크
자체 예약
지도 연동
결제
브랜드 제휴 관리
직접 루틴 제작
리추얼 로그 오버레이
```

### 제외 원칙

P0에서는 플랫폼처럼 보이는 기능을 만들지 않는다.

- 커뮤니티를 만들지 않는다.
- 예약 서비스를 만들지 않는다.
- 커머스를 만들지 않는다.
- 지도 기반 장소 탐색을 만들지 않는다.
- 사용자가 직접 루틴을 제작하는 기능을 만들지 않는다.
- 사진 오버레이 기반 리추얼 로그 기능을 만들지 않는다.

이 기능들은 모두 가능성은 있지만, P0의 검증 목표와 직접적으로 연결되지 않는다.

---

## 7. Menu-by-menu Scope

## 7-1. Home

### P0 포함

```txt
Home
├─ 추천 콘텐츠
├─ 최신 콘텐츠
├─ 콘텐츠 피드
└─ 콘텐츠 상세 진입
```

### Home의 역할

Home은 첫 진입점이다.

사용자는 Home에서 오늘 볼 만한 바스타임 콘텐츠를 발견하고, 최신 아카이브를 확인한다.

P0에서는 Home을 복잡한 개인화 화면으로 만들지 않는다.  
우선 운영자가 정한 추천 콘텐츠와 최신 콘텐츠를 안정적으로 보여주는 것에 집중한다.

### P0 제외

- 개인화 추천
- 사용자별 맞춤 피드
- 위치 기반 추천
- 로그인 기반 추천
- 무한한 섹션 확장

---

## 7-2. Explore

### P0 포함

```txt
Explore
├─ 카테고리
├─ 태그
├─ 콘텐츠 리스트
└─ 콘텐츠 상세 진입
```

### Explore의 역할

Explore는 바스타임의 핵심 탐색 영역이다.

사용자는 카테고리와 태그를 통해 자신에게 맞는 콘텐츠를 찾는다.

P0에서는 고도화된 필터보다 기본 탐색 구조를 먼저 검증한다.

### P0 카테고리

```txt
Home Bath
Bath Places
Bath Items
Tips / Culture
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

### P0 제외

- 고도화 필터
- 지도 탐색
- 거리순 정렬
- 가격 비교
- 예약 가능 여부 실시간 확인
- 사용자 리뷰 기반 정렬

---

## 7-3. Routines

### P0 포함

```txt
Routines
├─ 샤워 7분
├─ 족욕 10분
├─ 입욕 15분
├─ 자유 루틴/타이머
├─ 실행 화면
└─ 완료 화면
```

### Routines의 역할

Routines는 기존 Timer 기능을 포함하지만, 단순 시간 측정 도구가 아니다.

바스타임에서 Routines는 콘텐츠를 실제 행동으로 연결하는 실행 영역이다.

P0에서는 정해진 프리셋 중심으로만 제공한다.

### P0 루틴 프리셋

| Routine | Duration | Purpose |
|---|---:|---|
| 샤워 7분 | 7분 | 빠르게 몸과 기분을 전환하는 짧은 샤워 |
| 족욕 10분 | 10분 | 욕조 없는 집에서도 가능한 짧은 홈스파 |
| 입욕 15분 | 15분 | 욕조가 있을 때 적용 가능한 기본 입욕 루틴 |
| 자유 루틴/타이머 | 사용자 설정 | 상황에 맞게 직접 시간을 정하는 기본 타이머 |

### P0 제외

- 직접 루틴 제작
- 루틴 편집
- 루틴 공유
- 루틴 히스토리 고도화
- 루틴 통계
- 건강 데이터 연동
- 웨어러블 연동

---

## 7-4. Submit

### P0 포함

```txt
Submit
├─ 제보 유형 선택
├─ 사진/링크 첨부
├─ 한 줄 코멘트
└─ 제출 완료
```

### Submit의 역할

Submit은 커뮤니티가 아니라 아카이브를 함께 채우기 위한 제보 기능이다.

P0에서는 사용자가 완성된 후기를 작성하게 하지 않는다.  
사용자는 단서를 남기고, 운영자가 이를 확인해 바스타임식 콘텐츠로 재가공한다.

### P0 제보 유형

```txt
사우나 / 스파
욕조 있는 숙소
홈스파 세팅
아이템
다뤄줬으면 하는 주제
```

### P0 입력 필드

```txt
제보 유형
사진 또는 링크
한 줄 코멘트
```

### P0 제외

- 공개 게시판
- 댓글
- 유저 프로필
- 팔로우
- 제보글 즉시 공개
- 평점/리뷰 시스템

---

## 7-5. Saved

### P0 포함

```txt
Saved
└─ 저장한 콘텐츠
```

### Saved의 역할

Saved는 사용자가 나중에 다시 보고 싶은 콘텐츠를 보관하는 영역이다.

P0에서는 장소, 아이템, 루틴을 별도 보관함으로 세분화하지 않는다.  
우선 콘텐츠 저장만 제공하고, 이후 Place / Item / Routine 저장으로 확장한다.

### P0 제외

- 저장한 장소 분리
- 저장한 아이템 분리
- 저장한 루틴 분리
- 폴더 기능
- 컬렉션 기능
- 로그인 필수 저장

---

## 8. Core User Flows

P0에서 반드시 검증해야 하는 핵심 흐름은 다음이다.

### Flow 1. 콘텐츠 발견 → 상세 보기

```txt
Home 진입
→ 추천 콘텐츠 또는 최신 콘텐츠 선택
→ 콘텐츠 상세 보기
```

### Flow 2. 탐색 → 콘텐츠 상세 보기

```txt
Explore 진입
→ 카테고리 또는 태그 선택
→ 콘텐츠 리스트 확인
→ 콘텐츠 상세 보기
```

### Flow 3. 콘텐츠 → 루틴 실행

```txt
콘텐츠 상세 보기
→ 관련 루틴 CTA 선택
→ Routines 실행 화면 진입
→ 루틴 완료
```

### Flow 4. 콘텐츠 저장

```txt
콘텐츠 상세 보기
→ 저장하기
→ Saved에서 다시 확인
```

### Flow 5. 제보하기

```txt
Submit 진입
→ 제보 유형 선택
→ 사진/링크 + 한 줄 코멘트 입력
→ 제출 완료
```

---

# 9. Content Data Structure

이 단계가 P0에서 가장 중요하다.

바스타임의 해자는 예쁜 UI가 아니라 구조화된 정보이다.

따라서 P0부터 콘텐츠를 단순 마크다운 글이 아니라, 카테고리, 타입, 태그, 구조화 정보, 연결 객체를 가진 데이터로 설계한다.

---

## 9-1. Content Object

Content는 바스타임 아카이브의 중심 객체이다.

모든 핵심 정보는 Content 단위로 쌓이고, Content는 Place / Item / Routine 객체와 연결된다.

```ts
export type Content = {
  id: string;
  title: string;
  subtitle?: string;
  category: ContentCategory;
  contentType: ContentType;
  tags: string[];
  heroImage?: ImageAsset;
  body: ContentBody;
  structuredInfo: StructuredInfo;
  relatedRoutine?: RoutineRef[];
  relatedItems?: ItemRef[];
  relatedPlaces?: PlaceRef[];
  createdAt: string;
  updatedAt: string;
};
```

### Content 필드 정의

| Field | Type | Required | Description |
|---|---|---:|---|
| id | string | O | 콘텐츠 고유 ID |
| title | string | O | 콘텐츠 제목 |
| subtitle | string | X | 콘텐츠 보조 설명 |
| category | ContentCategory | O | Home Bath / Bath Places / Bath Items / Tips & Culture |
| contentType | ContentType | O | 해봤다 / 찾아봤다 / 정리했다 / 다녀왔다 / 제보받았다 / 업데이트했다 |
| tags | string[] | O | 탐색과 연결을 위한 태그 |
| heroImage | ImageAsset | X | 대표 이미지 |
| body | ContentBody | O | 본문 콘텐츠 |
| structuredInfo | StructuredInfo | O | 카테고리별 구조화 정보 |
| relatedRoutine | RoutineRef[] | X | 연결된 루틴 |
| relatedItems | ItemRef[] | X | 연결된 아이템 |
| relatedPlaces | PlaceRef[] | X | 연결된 장소 |
| createdAt | string | O | 생성일 |
| updatedAt | string | O | 업데이트일 |

---

## 9-2. Content Category

```ts
export type ContentCategory =
  | 'HOME_BATH'
  | 'BATH_PLACES'
  | 'BATH_ITEMS'
  | 'TIPS_CULTURE';
```

### Category Display Name

| Value | Display |
|---|---|
| HOME_BATH | Home Bath |
| BATH_PLACES | Bath Places |
| BATH_ITEMS | Bath Items |
| TIPS_CULTURE | Tips / Culture |

---

## 9-3. Content Type

```ts
export type ContentType =
  | 'TRIED'
  | 'RESEARCHED'
  | 'ORGANIZED'
  | 'VISITED'
  | 'SUBMITTED'
  | 'UPDATED';
```

### Content Type Display Name

| Value | Display | Meaning |
|---|---|---|
| TRIED | 해봤다 | 직접 해본 홈 리추얼, 세팅, 사용 경험 |
| RESEARCHED | 찾아봤다 | 공개 정보와 후기를 리서치한 콘텐츠 |
| ORGANIZED | 정리했다 | 비교, 체크리스트, 기준 정리 콘텐츠 |
| VISITED | 다녀왔다 | 장소 방문 후기 또는 경험 기록 |
| SUBMITTED | 제보받았다 | 사용자 제보를 바탕으로 정리한 콘텐츠 |
| UPDATED | 업데이트했다 | 기존 정보를 최신화한 콘텐츠 |

---

## 9-4. Content Body

P0에서는 본문을 복잡한 에디터 구조로 만들지 않아도 된다.

다만 향후 웹/앱 공통 렌더링을 위해 블록형 구조를 권장한다.

```ts
export type ContentBody = Array<
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'image'; image: ImageAsset; caption?: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; items: string[] }
>;
```

P0에서 구현 부담이 크다면, 우선 `bodyMarkdown: string`으로 시작할 수 있다.  
단, 장기적으로는 블록형 구조가 더 적합하다.

---

## 9-5. Structured Info

structuredInfo는 바스타임의 핵심이다.

카테고리별로 다른 구조화 정보를 가진다.

```ts
export type StructuredInfo =
  | HomeBathStructuredInfo
  | BathPlaceStructuredInfo
  | BathItemStructuredInfo
  | TipsCultureStructuredInfo;
```

### Home Bath Structured Info

```ts
export type HomeBathStructuredInfo = {
  durationMinutes?: number;
  bathRequired?: boolean;
  requiredItems?: string[];
  difficulty?: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendedSituations?: string[];
  environment?: 'SHOWER' | 'FOOT_BATH' | 'BATHTUB' | 'HOME_SPA';
};
```

### Bath Places Structured Info

```ts
export type BathPlaceStructuredInfo = {
  region?: string;
  publicAccess?: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE' | 'UNKNOWN';
  priceRange?: 'LOW' | 'MID' | 'HIGH' | 'PREMIUM' | 'UNKNOWN';
  reservationRequired?: 'REQUIRED' | 'OPTIONAL' | 'NOT_REQUIRED' | 'UNKNOWN';
  suitableForSolo?: boolean;
  suitableForCouple?: boolean;
  privateLevel?: 'PUBLIC' | 'SEMI_PRIVATE' | 'PRIVATE' | 'UNKNOWN';
  facilityTypes?: string[];
  lastCheckedAt?: string;
};
```

### Bath Items Structured Info

```ts
export type BathItemStructuredInfo = {
  useCase?: string[];
  bathRequired?: boolean;
  storageDifficulty?: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  cleaningDifficulty?: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  priceRange?: 'LOW' | 'MID' | 'HIGH' | 'PREMIUM' | 'UNKNOWN';
  recommendedFor?: string[];
  notRecommendedFor?: string[];
};
```

### Tips / Culture Structured Info

```ts
export type TipsCultureStructuredInfo = {
  topic?: string;
  difficulty?: 'LOW' | 'MEDIUM' | 'HIGH';
  relatedCategories?: ContentCategory[];
};
```

---

# 10. Object Data Structure

P0에서는 모든 객체를 완전한 DB 제품처럼 만들 필요는 없다.

하지만 Place / Item / Routine은 처음부터 Content와 분리 가능한 객체로 설계해야 한다.

이유는 다음과 같다.

1. 나중에 장소 리스트, 아이템 리스트, 루틴 보관함으로 확장할 수 있다.
2. 같은 장소나 아이템이 여러 콘텐츠에 반복 등장할 수 있다.
3. 저장, 추천, 필터, 제휴, 예약, 구매 전환으로 확장할 수 있다.
4. 바스타임의 핵심 차별점인 구조화된 아카이브가 가능해진다.

---

## 10-1. Place Object

Place는 장소형 정보 객체이다.

사우나, 스파, 찜질방, 온천, 프라이빗 스파룸, 욕조 있는 숙소 등이 해당된다.

```ts
export type Place = {
  id: string;
  name: string;
  type: PlaceType;
  region?: string;
  publicAccess?: PublicAccess;
  priceRange?: PriceRange;
  reservationRequired?: ReservationRequired;
  privateLevel?: PrivateLevel;
  suitableForSolo?: boolean;
  suitableForCouple?: boolean;
  facilityTypes?: string[];
  lastCheckedAt?: string;
  relatedContent?: ContentRef[];
};
```

### Place Type

```ts
export type PlaceType =
  | 'SAUNA'
  | 'SPA'
  | 'JJIMJILBANG'
  | 'ONSEN'
  | 'ACCOMMODATION'
  | 'PRIVATE_SPA_ROOM';
```

### Place 필드 정의

| Field | Type | Required | Description |
|---|---|---:|---|
| id | string | O | 장소 고유 ID |
| name | string | O | 장소명 |
| type | PlaceType | O | 장소 유형 |
| region | string | X | 지역 |
| publicAccess | PublicAccess | X | 외부인 이용 가능 여부 |
| priceRange | PriceRange | X | 가격대 |
| reservationRequired | ReservationRequired | X | 예약 필요 여부 |
| privateLevel | PrivateLevel | X | 프라이빗 정도 |
| suitableForSolo | boolean | X | 혼자 이용 적합 여부 |
| suitableForCouple | boolean | X | 커플/동행 이용 적합 여부 |
| facilityTypes | string[] | X | 시설 종류 |
| lastCheckedAt | string | X | 마지막 확인일 |
| relatedContent | ContentRef[] | X | 연결 콘텐츠 |

### Place 원칙

- 예쁜 장소보다 실제 이용 가능 여부가 중요하다.
- 외부인 이용 가능 여부, 가격, 예약 필요 여부는 핵심 필드로 다룬다.
- 운영 정보는 바뀔 수 있으므로 `lastCheckedAt`을 표시한다.
- P0에서는 지도 연동 없이 텍스트 기반 지역 정보만 제공한다.

---

## 10-2. Item Object

Item은 바스타임을 돕는 아이템 객체이다.

입욕제, 바디워시, 바디오일, 족욕기, 반신욕조, 욕실 트레이, 수건, 조명, 향 관련 제품 등이 해당된다.

```ts
export type Item = {
  id: string;
  name?: string;
  itemType: ItemType;
  category: ItemCategory;
  useCase?: string[];
  bathRequired?: boolean;
  storageDifficulty?: Difficulty;
  cleaningDifficulty?: Difficulty;
  priceRange?: PriceRange;
  recommendedFor?: string[];
  notRecommendedFor?: string[];
  relatedContent?: ContentRef[];
};
```

### Item Type

```ts
export type ItemType =
  | 'BATH_BOMB'
  | 'BODY_WASH'
  | 'BODY_OIL'
  | 'FOOT_BATH_DEVICE'
  | 'HALF_BATH_TUB'
  | 'BATH_TRAY'
  | 'TOWEL'
  | 'LIGHTING'
  | 'SCENT_ITEM';
```

### Item Category

```ts
export type ItemCategory =
  | 'BATH_PRODUCT'
  | 'BODY_CARE'
  | 'DEVICE'
  | 'BATHROOM_GOODS'
  | 'SCENT';
```

### Item 필드 정의

| Field | Type | Required | Description |
|---|---|---:|---|
| id | string | O | 아이템 고유 ID |
| name | string | X | 특정 제품명. P0에서는 없을 수 있음 |
| itemType | ItemType | O | 아이템 유형 |
| category | ItemCategory | O | 아이템 카테고리 |
| useCase | string[] | X | 사용 상황 |
| bathRequired | boolean | X | 욕조 필요 여부 |
| storageDifficulty | Difficulty | X | 보관 난이도 |
| cleaningDifficulty | Difficulty | X | 청소/관리 난이도 |
| priceRange | PriceRange | X | 가격대 |
| recommendedFor | string[] | X | 추천 대상 |
| notRecommendedFor | string[] | X | 비추천 대상 |
| relatedContent | ContentRef[] | X | 연결 콘텐츠 |

### Item 원칙

- P0에서는 제품 구매 링크를 제공하지 않는다.
- 아이템은 쇼핑몰 상품이 아니라 의식을 돕는 도구로 다룬다.
- 특정 상품보다 사용 맥락과 선택 기준을 우선한다.
- 추천 대상과 비추천 대상을 함께 제시한다.

---

## 10-3. Routine Object

Routine은 사용자가 바로 실행할 수 있는 루틴 객체이다.

기존 Timer Preset을 확장한 개념이며, 단순 시간 측정보다 “따라 해볼 수 있는 의식”에 가깝다.

```ts
export type Routine = {
  id: string;
  title: string;
  duration: number;
  environment: RoutineEnvironment;
  situation?: string[];
  steps?: RoutineStep[];
  timerPreset: TimerPreset;
  relatedContent?: ContentRef[];
};
```

### Routine Environment

```ts
export type RoutineEnvironment =
  | 'SHOWER'
  | 'FOOT_BATH'
  | 'BATHTUB'
  | 'FREE';
```

### Routine Step

```ts
export type RoutineStep = {
  order: number;
  title: string;
  durationMinutes?: number;
  description?: string;
};
```

### Timer Preset

```ts
export type TimerPreset = {
  durationMinutes: number;
  soundEnabled?: boolean;
  musicTheme?: string;
};
```

### Routine 필드 정의

| Field | Type | Required | Description |
|---|---|---:|---|
| id | string | O | 루틴 고유 ID |
| title | string | O | 루틴 제목 |
| duration | number | O | 전체 소요 시간, 분 단위 |
| environment | RoutineEnvironment | O | 샤워 / 족욕 / 입욕 / 자유 |
| situation | string[] | X | 추천 상황 |
| steps | RoutineStep[] | X | 루틴 단계 |
| timerPreset | TimerPreset | O | 타이머 설정 |
| relatedContent | ContentRef[] | X | 연결 콘텐츠 |

### P0 기본 Routine

```txt
샤워 7분
족욕 10분
입욕 15분
자유 루틴/타이머
```

### Routine 원칙

- 메뉴명은 Timer가 아니라 Routines를 사용한다.
- 내부 구현에서는 TimerScreen, TimerPreset 같은 이름을 사용할 수 있다.
- P0에서는 사용자가 직접 루틴을 제작하지 않는다.
- Routine은 Content의 CTA에서 연결될 수 있어야 한다.
- 완료 후 저장하기, 비슷한 콘텐츠 보기, 제보하기로 이어질 수 있어야 한다.

---

## 10-4. Shared Types

공통으로 사용하는 타입은 다음과 같다.

```ts
export type PublicAccess =
  | 'AVAILABLE'
  | 'LIMITED'
  | 'UNAVAILABLE'
  | 'UNKNOWN';

export type PriceRange =
  | 'LOW'
  | 'MID'
  | 'HIGH'
  | 'PREMIUM'
  | 'UNKNOWN';

export type ReservationRequired =
  | 'REQUIRED'
  | 'OPTIONAL'
  | 'NOT_REQUIRED'
  | 'UNKNOWN';

export type PrivateLevel =
  | 'PUBLIC'
  | 'SEMI_PRIVATE'
  | 'PRIVATE'
  | 'UNKNOWN';

export type Difficulty =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'UNKNOWN';

export type ImageAsset = {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type ContentRef = {
  id: string;
  title: string;
};

export type PlaceRef = {
  id: string;
  name: string;
};

export type ItemRef = {
  id: string;
  name?: string;
  itemType: ItemType;
};

export type RoutineRef = {
  id: string;
  title: string;
  duration: number;
};
```

---

## 11. Data Structure Principle

### 11-1. Content First

P0의 중심은 Content이다.

Home과 Explore는 Content를 보여주고, Saved는 Content를 저장하며, Routines는 Content에서 실행으로 이어진다.

```txt
Content → Routine 실행
Content → Saved 저장
Content → Submit 유도
Content → Place / Item 연결
```

---

### 11-2. Place / Item / Routine은 처음부터 분리한다

P0에서는 Place, Item, Routine을 화면상 크게 드러내지 않아도 된다.

하지만 데이터 구조상으로는 처음부터 분리한다.

이렇게 해야 P1 이후 다음 확장이 가능하다.

```txt
Place 상세 페이지
Item 상세 페이지
Routine 상세 페이지
저장한 장소
저장한 아이템
저장한 루틴
장소 기반 필터
아이템 기반 큐레이션
루틴 기반 리텐션
```

---

### 11-3. Unknown을 허용한다

P0에서는 모든 정보를 완벽히 채울 수 없다.

따라서 장소나 아이템의 일부 정보는 `UNKNOWN`을 허용한다.

중요한 것은 완벽한 데이터가 아니라, 같은 기준으로 계속 업데이트할 수 있는 구조이다.

---

### 11-4. 업데이트 일자를 남긴다

바스타임은 아카이브 서비스이기 때문에 정보의 최신성이 중요하다.

특히 장소 정보는 운영 시간, 가격, 외부인 이용 가능 여부가 바뀔 수 있다.

따라서 Place와 Content에는 업데이트 기준일을 표시한다.

```txt
Content.updatedAt
Place.lastCheckedAt
```

---

## 12. Measurement

P0에서 측정해야 할 지표는 기능별로 단순하게 잡는다.

### Content Metrics

- 콘텐츠 조회수
- 콘텐츠 상세 진입률
- 콘텐츠 스크롤 완료율
- 저장 클릭률
- 관련 콘텐츠 클릭률

### Explore Metrics

- 카테고리 클릭률
- 태그 클릭률
- 콘텐츠 리스트 → 상세 진입률

### Routine Metrics

- 콘텐츠 → 루틴 시작률
- 루틴 시작 수
- 루틴 완료율
- 완료 후 저장 클릭률

### Submit Metrics

- Submit 진입률
- 제보 유형 선택률
- 제보 완료 수
- 사진/링크 첨부 비율

### Saved Metrics

- 저장 클릭 수
- Saved 재진입 수
- 저장 콘텐츠 상세 재진입률

---

## 13. P1 Candidates

P0 이후 반응을 보고 검토할 수 있는 기능은 다음이다.

```txt
회원 기반 저장
저장한 장소 / 아이템 / 루틴 분리
직접 루틴 제작
루틴 히스토리
최근 본 콘텐츠
고도화 필터
장소 상세 페이지
아이템 상세 페이지
지도 연동
제품 링크
제휴 쿠폰
예약/문의 링크 추적
커뮤니티 후기
댓글
사용자 프로필
```

P1 후보는 P0에서 다음 신호가 확인될 때만 검토한다.

- 콘텐츠 저장률이 높다.
- 루틴 시작률이 의미 있게 나온다.
- 제보가 실제로 들어온다.
- 특정 카테고리나 장소 콘텐츠의 조회와 저장이 반복된다.
- 제품이나 장소에 대한 추가 문의가 발생한다.

---

## 14. Final P0 Summary

P0는 작게 만들어야 한다.

하지만 작게 만든다는 것은 단순하게 만든다는 뜻이지, 구조 없이 만든다는 뜻이 아니다.

바스타임 P0의 핵심은 다음이다.

```txt
Home에서 발견한다.
Explore에서 찾는다.
Content를 읽는다.
Saved에 저장한다.
Routines로 따라 해본다.
Submit으로 아카이브를 함께 채운다.
```

P0에서 만들지 않을 것은 명확하다.

```txt
회원가입 필수화 없음
커뮤니티 없음
예약 없음
결제 없음
지도 없음
구매 링크 없음
직접 루틴 제작 없음
리추얼 로그 오버레이 없음
```

최종적으로 P0는 다음을 검증한다.

> 바스타임이 좋은 바스타임을 발견하고, 저장하고, 바로 따라 해볼 수 있는 아카이브로 작동하는가.

