# 바스타임 웹 와이어프레임 설명서

## 1. 문서 목적

이 문서는 바스타임 웹 서비스의 주요 화면 구조를 설명하기 위한 와이어프레임 문서입니다.

바스타임 웹은 단순 블로그나 모바일 앱 화면을 그대로 옮긴 웹이 아닙니다. 웹은 **집 안팎의 바스타임을 발견하고, 저장하고, 바로 따라 해볼 수 있는 아카이브**의 입구 역할을 합니다.

따라서 웹 와이어프레임은 다음 방향을 따릅니다.

- 모바일에서는 앱처럼 간결하게 탐색
- PC에서는 Threads/X처럼 좌측 사이드바를 활용
- 중앙 콘텐츠는 읽기 좋은 폭으로 제한
- 아카이브 서비스답게 구조화 정보와 탐색성을 강조
- 콘텐츠는 Routines, Saved, Submit 기능으로 자연스럽게 연결

---

## 2. 기본 IA

웹과 앱은 동일한 최상위 IA를 공유합니다.

```txt
Home
Explore
Routines
Submit
Saved
```

### 메뉴 역할

| 메뉴 | 역할 |
|---|---|
| Home | 추천 콘텐츠, 최신 콘텐츠, 오늘의 바스타임 진입 |
| Explore | 카테고리·태그·검색 기반 아카이브 탐색 |
| Routines | 콘텐츠를 따라 해볼 수 있는 루틴과 타이머 실행 |
| Submit | 사우나, 스파, 홈스파 세팅, 아이템 제보 |
| Saved | 저장한 콘텐츠, 장소, 아이템, 루틴 보관 |

---

## 3. 전체 레이아웃 방향

### 모바일

모바일은 앱처럼 사용하기 쉬운 하단 탭 구조를 사용합니다.

```txt
[Header]
[Main Content]
[Bottom Tab]
```

### PC

PC에서는 Threads/X처럼 좌측 사이드바를 사용합니다.

```txt
[Left Sidebar] [Main Content] [Right Assist Panel optional]
```

### 원칙

- 모바일과 PC에서 IA는 동일하게 유지합니다.
- 모바일 하단 탭은 PC에서 좌측 사이드바로 전환됩니다.
- 중앙 콘텐츠 영역은 너무 넓어지지 않도록 제한합니다.
- PC의 남는 공간은 인기 태그, 최근 업데이트, 관련 콘텐츠 등 보조 정보로 활용할 수 있습니다.

---

# 4. PC 버전 와이어프레임

## 4.1 PC 전체 구조

PC는 기본적으로 2단 또는 3단 구조를 사용합니다.

### P0 구조

```txt
┌──────────────┬──────────────────────────────┐
│ Left Sidebar │ Main Content                 │
│              │                              │
│              │                              │
└──────────────┴──────────────────────────────┘
```

### P1 이후 확장 구조

```txt
┌──────────────┬──────────────────────────────┬────────────────────┐
│ Left Sidebar │ Main Content                 │ Right Assist Panel │
│              │                              │                    │
│              │                              │                    │
└──────────────┴──────────────────────────────┴────────────────────┘
```

### 권장 폭

```txt
Left Sidebar: 220~240px
Main Content: max-width 720~760px
Right Assist Panel: 280~320px
Total Max Width: 1200~1280px
```

---

## 4.2 PC Left Sidebar

PC에서는 모바일 하단 탭을 좌측 세로 메뉴로 전환합니다.

### 구성

```txt
Logo / Service Name
Home
Explore
Routines
Submit
Saved
```

### 역할

- 서비스의 주요 영역 이동
- 현재 위치 표시
- 앱과 동일한 IA 유지
- 아카이브 탐색의 기준점 제공

### 디자인 원칙

- 아이콘 + 텍스트 조합
- 현재 메뉴는 Navy/Brass 포인트로 강조
- 스크롤 시에도 고정 또는 sticky 처리 가능
- 과도하게 앱 런처처럼 보이지 않도록 차분하게 구성

---

## 4.3 PC Right Assist Panel

P0에서는 필수 구현하지 않아도 됩니다.

P1 이후 PC 화면의 남는 공간을 활용해 보조 정보를 제공합니다.

### 들어갈 수 있는 요소

- 인기 태그
- 최근 업데이트
- 관련 콘텐츠
- 관련 루틴
- 제보하기 CTA
- 저장한 콘텐츠 미리보기
- 앱 다운로드 또는 저장 유도 CTA

### 화면별 예시

| 화면 | Right Panel 내용 |
|---|---|
| Home | 인기 태그, 최근 업데이트, 제보 CTA |
| Explore | 필터, 인기 태그, 최근 업데이트 |
| Content Detail | 관련 콘텐츠, 관련 루틴, 저장 CTA |
| Routines | 추천 루틴, 최근 실행 루틴 |
| Submit | 제보 예시, 제보 가이드 |
| Saved | 최근 저장, 추천 콘텐츠 |

---

# 5. 모바일 버전 와이어프레임

## 5.1 모바일 전체 구조

모바일은 앱처럼 간단한 구조를 사용합니다.

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

## 5.2 모바일 Bottom Tab

```txt
Home / Explore / Routines / Submit / Saved
```

### 원칙

- 화면 하단 고정
- Safe area 대응
- 현재 탭 강조
- 아이콘 + 짧은 라벨 조합
- 콘텐츠 스크롤 중에도 접근 가능

## 5.3 모바일 Header

화면에 따라 단순하게 구성합니다.

### 기본 구성

- 좌측: 로고 또는 뒤로가기
- 중앙: 페이지명
- 우측: 검색, 저장, 옵션 중 필요한 항목

---

# 6. 화면별 와이어프레임

## 6.1 Home

Home은 사용자가 처음 들어왔을 때 바스타임이 어떤 서비스인지 이해하고, 콘텐츠를 가볍게 탐색하는 화면입니다.

### PC Home

```txt
[Left Sidebar]

[Main Content]
- Header / Page Title
- Featured Content Card
- 오늘의 바스타임
- 최신 콘텐츠
- 카테고리별 섹션
  - Home Bath
  - Bath Places
  - Bath Items
- 바로 해볼 수 있는 루틴

[Right Panel optional]
- 인기 태그
- 최근 업데이트
- 제보 CTA
```

### Mobile Home

```txt
[Header]
[Category Chips]
[Featured Card]
[오늘의 바스타임]
[최신 콘텐츠 카드 리스트]
[바로 해볼 수 있는 루틴]
[Bottom Tab]
```

### 구성 요소

- Featured 콘텐츠
- 최신 콘텐츠 카드
- 카테고리 칩
- 루틴 CTA
- 저장 버튼
- 콘텐츠 상세 진입

### Home의 역할

- 브랜드 첫인상 전달
- 최신 콘텐츠 소비 유도
- Explore 진입 전 가벼운 탐색 제공
- Routines 기능으로 연결

---

## 6.2 Explore

Explore는 바스타임의 아카이브 탐색 화면입니다.

### PC Explore

```txt
[Left Sidebar]

[Main Content]
- Search Bar
- Category Tabs
- Tag Chips
- Content / Place / Item List
- Result Cards

[Right Panel optional]
- 필터
- 인기 태그
- 최근 업데이트
```

### Mobile Explore

```txt
[Header]
[Search Bar]
[Category Chips]
[Filter Button]
[Result List]
[Bottom Tab]
```

### 주요 카테고리

```txt
Home Bath
Bath Places
Bath Items
Tips / Culture
```

### 필터 후보

- 지역
- 가격대
- 외부인 이용 가능
- 예약 필요 여부
- 혼자 가기 좋음
- 프라이빗 여부
- 욕조 필요 여부
- 추천 상황

### Explore의 역할

- 사용자가 목적에 맞는 콘텐츠/장소/아이템을 찾는 영역
- 바스타임이 단순 블로그가 아니라 아카이브임을 보여주는 핵심 화면
- 구조화 데이터의 가치가 가장 잘 드러나는 화면

---

## 6.3 Content Detail

Content Detail은 바스타임의 핵심 화면입니다. 단순 글 상세가 아니라, 구조화 정보와 실행 CTA가 함께 있어야 합니다.

### PC Content Detail

```txt
[Left Sidebar]

[Main Content]
- Hero Image
- Title
- Meta Info
- Structured Info Box
- Body
- Good / Bad Points
- Recommended For
- CTA Buttons
- Related Content

[Right Panel optional]
- 관련 콘텐츠
- 관련 루틴
- 저장 CTA
- 제보 CTA
```

### Mobile Content Detail

```txt
[Header]
[Hero Image]
[Title]
[Meta Info]
[Structured Info Box]
[Body]
[CTA Buttons]
[Related Content]
[Bottom Tab]
```

### 콘텐츠 상세 공통 요소

- 제목
- 부제 또는 요약
- 대표 이미지
- 카테고리/태그
- 업데이트 일자
- 구조화 정보 박스
- 본문
- 좋았던 점
- 아쉬운 점
- 이런 사람에게 맞음
- 이런 사람에게 애매함
- 저장하기
- 루틴 따라 하기
- 제보하기
- 관련 콘텐츠

### 구조화 정보 예시: 스팟 콘텐츠

```txt
외부인 이용 가능 여부
가격대
예약 필요 여부
위치/접근성
혼자 이용 적합도
커플/동행 이용 적합도
프라이빗 여부
시설 종류
업데이트 일자
```

### 구조화 정보 예시: 홈 리추얼 콘텐츠

```txt
소요 시간
욕조 필요 여부
필요한 아이템
난이도
추천 상황
바로 실행 가능한 루틴
```

### Content Detail의 역할

- 사용자가 정보를 판단하는 화면
- 네이버/인스타와의 차별점을 보여주는 화면
- 저장, 루틴 실행, 제보로 이어지는 전환 화면

---

## 6.4 Routines

Routines는 기존 Timer 기능을 확장한 영역입니다.

타이머라는 도구를 전면에 내세우기보다, 사용자가 따라 해볼 수 있는 의식 단위로 보여줍니다.

### PC Routines

```txt
[Left Sidebar]

[Main Content]
- Routine Category
- Routine List
- Selected Routine Detail
- Timer Start CTA

[Right Panel optional]
- 관련 콘텐츠
- 최근 실행 루틴
- 저장한 루틴
```

### Mobile Routines

```txt
[Header]
[Routine Category Chips]
[Routine Cards]
[Routine Detail]
[Timer CTA]
[Bottom Tab]
```

### 루틴 예시

- 샤워 7분
- 족욕 10분
- 입욕 15분
- 수면 전 루틴
- 퇴근 후 루틴
- 운동 후 루틴
- 비 오는 날 루틴

### Routine Detail 구성

- 루틴명
- 소요 시간
- 추천 상황
- 필요한 아이템
- 짧은 설명
- 단계
- 타이머 시작 버튼
- 관련 콘텐츠

### Routines의 역할

- 콘텐츠를 실제 행동으로 연결
- 기존 타이머 기능을 브랜드 방향에 맞게 재해석
- 향후 직접 만든 루틴, 저장한 루틴, 유저 루틴으로 확장 가능

---

## 6.5 Submit

Submit은 초기 커뮤니티의 씨앗입니다. 게시판 대신 간단한 제보로 시작합니다.

### PC Submit

```txt
[Left Sidebar]

[Main Content]
- Submit Guide
- Submit Type Select
- Photo / Link Input
- One-line Comment
- Optional Nickname
- Public Permission
- Submit Button

[Right Panel optional]
- 제보 예시
- 제보 후 반영 방식
```

### Mobile Submit

```txt
[Header]
[Submit Guide]
[Type Select]
[Photo / Link Input]
[One-line Comment]
[Submit Button]
[Bottom Tab]
```

### 제보 유형

- 사우나 / 스파
- 욕조 있는 숙소
- 홈스파 세팅
- 아이템
- 다뤄줬으면 하는 주제

### 제보 필드

- 사진 1장 또는 링크 1개
- 한 줄 코멘트
- 닉네임 선택 입력
- 공개 가능 여부

### Submit의 역할

- 빈 커뮤니티 없이 유저 참여를 시작
- 운영자가 편집 가능한 원천 데이터 수집
- 아카이브를 함께 채우는 느낌 제공

---

## 6.6 Saved

Saved는 사용자가 다시 돌아올 이유를 만드는 보관함입니다.

### PC Saved

```txt
[Left Sidebar]

[Main Content]
- Saved Tabs
  - 콘텐츠
  - 장소
  - 아이템
  - 루틴
- Saved List
- Empty State

[Right Panel optional]
- 최근 본 콘텐츠
- 추천 콘텐츠
```

### Mobile Saved

```txt
[Header]
[Saved Tabs]
[Saved List]
[Bottom Tab]
```

### 저장 유형

- 저장한 콘텐츠
- 저장한 장소
- 저장한 아이템
- 저장한 루틴

### P0 저장 방식

- 로그인 없이 로컬 저장 또는 익명 저장 가능
- P1에서 로그인 기반 내 보관함으로 확장

### Saved의 역할

- 앱/웹 재방문 이유 제공
- 앱 다운로드 이유 제공
- 개인화 추천의 기반 데이터 축적

---

# 7. PC / 모바일 차이 요약

## 공통점

- IA는 동일하게 유지
- 콘텐츠 카드와 상세 구조 동일
- 저장, 루틴, 제보 CTA 동일
- 구조화 정보 포맷 동일

## 모바일 특징

- 하단 탭 중심
- 단일 컬럼
- 필터는 바텀시트/모달
- 빠른 스크롤과 간단한 액션 중심

## PC 특징

- 좌측 사이드바 중심
- 중앙 콘텐츠 max-width 제한
- 우측 보조 영역 선택적 활용
- 탐색/비교/구조화 정보 소비에 유리

---

# 8. P0 화면 목록

P0에서 우선 구현할 화면은 다음입니다.

```txt
Home
Explore
Content Detail
Routines
Routine Detail
Routine Timer
Submit
Submit Complete
Saved
```

P0에서 제외할 수 있는 화면:

```txt
Login / Signup
User Profile
Comment
Community Feed
Product Purchase
Reservation Checkout
Map View
Advanced Search
```

---

# 9. 개발자 전달용 요약

> 바스타임 웹은 모바일 앱 화면을 PC에 그대로 고정하는 방식이 아닙니다. 모바일에서는 Header + Main Content + Bottom Tab 구조를 사용하고, PC에서는 Threads/X처럼 Left Sidebar + Main Content 구조로 전환합니다. IA는 Home / Explore / Routines / Submit / Saved로 동일하게 유지합니다. 중앙 콘텐츠는 읽기 좋은 폭으로 제한하고, 넓은 화면에서는 Right Assist Panel을 선택적으로 추가합니다. 콘텐츠 상세는 구조화 정보와 CTA가 핵심이며, Routines는 기존 Timer를 포함하는 실행형 루틴 영역으로 설계합니다.

