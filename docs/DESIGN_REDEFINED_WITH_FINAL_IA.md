# Design System — 바스타임

## Product Context

- **What this is:** 집 안팎의 바스타임을 발견하고, 저장하고, 바로 따라 해볼 수 있게 돕는 바스타임 아카이브 서비스.
- **One-line definition:** 좋은 바스타임을 발견하고, 저장하고, 바로 따라 해볼 수 있는 아카이브.
- **Core value:** 씻는 시간을 의식으로.
- **English line:** Turning the bath into ritual.
- **Who it's for:** 퇴근 후 혼자만의 시간이 필요한 서울의 30대. 집에서는 샤워나 족욕 정도가 현실적이지만, 좋은 사우나·스파·욕조 있는 숙소·홈스파 세팅·바디케어 아이템에도 관심이 있는 사용자.
- **Space/industry:** 바스 리추얼 아카이브, 홈스파 콘텐츠, 사우나/스파/숙소 탐색, 바스타임 실행 도구, 웰니스 큐레이션.
- **Project type:** 웹/앱 공통 콘텐츠 아카이브 + 저장/타이머/제보 실행 도구.
- **Primary platform stance:** P0에서는 웹이 유입과 콘텐츠 탐색의 중심이고, 앱은 저장·타이머·제보·개인화 실행 도구로 연결된다.

---

## Strategic Shift

기존 디자인은 `Private Bath Log`를 기준으로 사용자의 욕실 사진을 근사하게 꾸미고 공유하는 사진 오버레이/로그 앱에 맞춰져 있었다.

이번 피벗 이후 바스타임은 사진 결과물 중심 서비스가 아니다. 이제 핵심은 다음이다.

> 흩어진 바스타임 정보를 같은 기준으로 정리하고, 사용자가 필요할 때 다시 찾아보고 따라 해볼 수 있게 만드는 것.

따라서 디자인도 감성 사진 앱보다 **가볍게 읽히는 아카이브**, **신뢰 가능한 정보 카드**, **저장하고 실행하기 쉬운 콘텐츠 플랫폼**에 맞춰 재정의한다.

---

## IA / Navigation Strategy

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

### Full IA Map

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
│  │  │  ├─ 샤워
│  │  │  ├─ 족욕
│  │  │  ├─ 입욕
│  │  │  ├─ 홈스파 세팅
│  │  │  └─ 수면 전 / 운동 후 / 비 오는 날 등 상황별
│  │  ├─ Bath Places
│  │  │  ├─ 사우나
│  │  │  ├─ 스파
│  │  │  ├─ 찜질방
│  │  │  ├─ 온천
│  │  │  ├─ 프라이빗 스파룸
│  │  │  └─ 욕조 있는 숙소
│  │  ├─ Bath Items
│  │  │  ├─ 입욕제
│  │  │  ├─ 바디워시 / 바디오일
│  │  │  ├─ 족욕기
│  │  │  ├─ 반신욕조
│  │  │  ├─ 욕실 트레이 / 조명 / 수건
│  │  │  └─ 향 관련 아이템
│  │  └─ Tips / Culture
│  │     ├─ 비교 글
│  │     ├─ 정리 글
│  │     ├─ 가이드
│  │     └─ 문화/인사이트
│  ├─ 태그 탐색
│  │  ├─ 욕조 없음
│  │  ├─ 수면 전
│  │  ├─ 운동 후
│  │  ├─ 혼자 쉬기
│  │  ├─ 외부인 이용 가능
│  │  ├─ 프라이빗
│  │  ├─ 서울
│  │  └─ 기타 태그
│  ├─ 필터
│  │  ├─ 지역
│  │  ├─ 가격대
│  │  ├─ 외부인 이용 가능
│  │  ├─ 프라이빗 여부
│  │  ├─ 혼자 가기 좋음
│  │  ├─ 욕조 필요 여부
│  │  └─ 추천 상황
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
│  │  ├─ 특정 콘텐츠에서 진입
│  │  └─ 관련 콘텐츠 정보 표시
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

### Home

Home은 바스타임의 첫 진입점이다.

사용자는 Home에서 오늘의 추천 콘텐츠, 최신 아카이브, 바로 따라 해볼 수 있는 의식을 가볍게 발견한다.

Home은 검색보다 큐레이션에 가깝고, 브랜드의 첫인상과 콘텐츠 소비를 담당한다.

```txt
Home
├─ Hero / Featured
├─ 오늘의 추천
├─ 최신 콘텐츠
├─ 카테고리 섹션
│  ├─ Home Bath
│  ├─ Bath Places
│  ├─ Bath Items
│  └─ Tips / Culture
├─ 바로 해볼 수 있는 의식
└─ 콘텐츠 상세
```

#### Home Role

- 첫 진입점
- 브랜드 무드 전달
- 최신/추천 콘텐츠 소비 유도
- Explore로 넘어가기 전 가벼운 탐색
- 바로 실행 가능한 리추얼 노출

#### Home Design Rule

- 브랜드 설명보다 “오늘 볼 만한 기록”이 먼저 보여야 한다.
- 콘텐츠가 너무 매거진처럼 멀어 보이면 안 된다.
- 사용자가 바로 저장하거나 따라 해볼 수 있어야 한다.
- Hero 영역은 하나의 강한 추천 콘텐츠 또는 짧은 의식 CTA로 시작한다.
- Home Bath, Bath Places, Bath Items가 섞여도 카드 구조와 라벨 체계로 구분한다.

---

### Explore

Explore는 바스타임의 핵심 탐색 영역이다.

사용자는 Explore에서 카테고리, 태그, 검색, 필터를 통해 자신에게 맞는 바스타임 콘텐츠를 찾는다.

바스타임이 단순 감성 콘텐츠와 다른 이유는 Explore에서 드러난다. 장소, 아이템, 홈 리추얼이 구조화된 정보로 정리되어야 한다.

```txt
Explore
├─ 검색
├─ 카테고리
│  ├─ Home Bath
│  ├─ Bath Places
│  ├─ Bath Items
│  └─ Tips / Culture
├─ 태그
├─ 필터
│  ├─ 지역
│  ├─ 가격대
│  ├─ 외부인 이용 가능
│  ├─ 프라이빗 여부
│  ├─ 혼자 가기 좋음
│  ├─ 욕조 필요 여부
│  └─ 추천 상황
├─ 리스트/카드 결과
└─ 상세
```

#### Explore Role

- 서비스의 핵심 탐색 영역
- 아카이브다운 구조화 경험 제공
- 검색, 비교, 발견 지원
- Home Bath / Bath Places / Bath Items / Tips & Culture를 연결
- 콘텐츠, 장소, 아이템의 재방문 동기 생성

#### Explore Design Rule

- Explore는 예쁜 피드보다 “찾을 수 있는 구조”가 중요하다.
- 카테고리, 태그, 필터는 겹치더라도 사용자의 탐색 목적에 맞게 분리한다.
- 장소형 콘텐츠는 외부인 이용 가능 여부, 가격대, 예약 필요 여부가 빠르게 보여야 한다.
- 홈 리추얼 콘텐츠는 소요 시간, 욕조 필요 여부, 추천 상황이 빠르게 보여야 한다.
- 아이템 콘텐츠는 제품명보다 사용 상황과 관리 난이도가 먼저 보여야 한다.

---

### Routines

Routines는 기존 Timer 기능을 포함하지만, 단순 시간 측정 도구가 아니다.

바스타임에서 Routines는 콘텐츠를 실제 행동으로 연결하는 실행 영역이다.

사용자는 콘텐츠를 읽다가 “나도 해보고 싶다”고 느끼는 순간 Routines로 진입한다. 따라서 Routines는 앱다움을 만드는 중요한 기능이지만, 서비스의 중심은 콘텐츠 아카이브에 있다.

```txt
Routines
├─ 루틴 홈
├─ 프리셋 루틴
│  ├─ 샤워 7분
│  ├─ 족욕 10분
│  ├─ 입욕 15분
│  └─ 자유 루틴
├─ 콘텐츠 연결 루틴
│  ├─ 특정 콘텐츠에서 진입
│  └─ 관련 콘텐츠 정보 표시
├─ 실행 화면
└─ 완료 화면
   ├─ 저장하기
   ├─ 비슷한 콘텐츠 보기
   └─ 제보하기
```

#### Routines Role

- 기존 타이머 기능의 확장 버전
- 콘텐츠를 실제 행동으로 연결
- 앱을 설치하고 다시 열 이유 제공
- 향후 직접 만든 루틴, 저장한 루틴으로 확장 가능
- 단순 타이머 앱처럼 보이지 않도록 “루틴 실행 영역”으로 표현

#### Naming Rule

메뉴명은 `Timer`가 아니라 `Routines`를 사용한다.

`Timer`는 기능 중심 표현이라 서비스가 단순 타이머 앱처럼 보일 수 있다. `Routines`는 샤워, 족욕, 입욕, 홈스파, 직접 만든 루틴까지 확장할 수 있는 표현이다.

다만 내부 기능명이나 컴포넌트명에서는 필요에 따라 `timer`를 사용할 수 있다.

```txt
Menu label: Routines
Feature concept: Routine execution
Internal component: TimerScreen, TimerPreset, TimerComplete
```

#### Routines Design Rule

- Routines 화면은 콘텐츠 상세보다 더 단순하고 집중되어야 한다.
- 큰 시간, 명확한 상태, 쉬운 중단/재개, 완료 피드백을 우선한다.
- 사운드, 배경 이미지, 감성 연출은 선택 요소다.
- 완료 화면은 성취 압박보다 “오늘의 바스타임을 저장하거나 비슷한 콘텐츠를 볼 수 있는 전환점”으로 설계한다.

---

### Submit

Submit은 바스타임 아카이브를 함께 채우기 위한 제보 영역이다.

처음부터 완성된 후기나 커뮤니티 게시글을 요구하지 않는다. 사용자는 사진 1장, 링크 1개, 한 줄 코멘트 정도만 남기고, 운영자가 이를 확인해 바스타임식 콘텐츠로 재가공한다.

```txt
Submit
├─ 제보 홈
├─ 제보 유형 선택
│  ├─ 사우나 / 스파
│  ├─ 욕조 있는 숙소
│  ├─ 홈스파 세팅
│  ├─ 아이템
│  └─ 다뤄줬으면 하는 주제
├─ 제보 작성
│  ├─ 사진/링크 첨부
│  ├─ 한 줄 코멘트
│  ├─ 닉네임
│  └─ 공개 동의 여부
├─ 제보 가이드
└─ 제출 완료
```

#### Submit Role

- 커뮤니티 씨앗
- 사용자 참여 시작점
- 운영자 중심 큐레이션 데이터 수집
- 좋은 장소, 세팅, 아이템, 주제 제보 수집
- 향후 유저 후기/커뮤니티 확장의 기반

#### Submit Design Rule

- 제보는 부담이 없어야 한다.
- 긴 글쓰기보다 사진, 링크, 한 줄 코멘트를 우선한다.
- “당장 공개된다”는 부담을 줄이고, 운영자가 확인 후 아카이브에 반영한다는 흐름을 명확히 한다.
- 제보 완료 후에는 감사를 표현하되 과장하지 않는다.

---

### Saved

Saved는 사용자가 저장한 바스타임 콘텐츠를 다시 꺼내보는 보관함이다.

Saved는 앱/로그인의 이유가 되는 영역이며, 바스타임의 리텐션에서 중요한 역할을 한다.

```txt
Saved
├─ 저장한 콘텐츠
├─ 저장한 장소
├─ 저장한 아이템
├─ 최근 본 콘텐츠
└─ 상세 진입
```

#### Saved Role

- 앱 재방문의 핵심
- 나중에 따라 해볼 콘텐츠 보관
- 장소, 아이템, 홈 리추얼을 구분해 저장
- 향후 내 루틴 보관함으로 확장
- “내 바스타임 보관함” 역할

#### Saved Design Rule

- Saved는 단순 북마크 목록이 아니라 “내 바스타임 보관함”처럼 느껴져야 한다.
- 저장한 콘텐츠, 장소, 아이템은 구분하되 처음부터 복잡한 폴더 구조를 강요하지 않는다.
- 최근 본 콘텐츠는 P0에서는 선택 기능이다.
- 향후 저장한 루틴, 직접 만든 루틴, 방문 기록으로 확장할 수 있어야 한다.

---

## Core Object IA

바스타임은 메뉴 중심 서비스이면서 동시에 객체 중심 아카이브 서비스이다.

핵심 객체는 다음 네 가지이다.

```txt
1. Content
2. Place
3. Item
4. Routine Preset
```

### Content

모든 핵심 정보는 콘텐츠 단위로 쌓인다.

Content는 장소, 아이템, 루틴을 연결하는 중심 객체이다.

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

#### Content Rule

- 콘텐츠는 읽고 끝나는 글이 아니다.
- 콘텐츠는 저장, 루틴 실행, 제보, 관련 콘텐츠 탐색으로 이어져야 한다.
- 모든 콘텐츠는 최소 하나 이상의 행동 CTA를 가진다.
- 콘텐츠는 감성보다 구조화된 정보와 실행 가능성을 우선한다.

### Place

Place는 장소형 정보를 구조화한 객체이다.

사우나, 스파, 찜질방, 온천, 욕조 있는 숙소, 프라이빗 스파룸 등이 해당된다.

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

#### Place Rule

- 예쁜 장소보다 실제 이용 가능 여부가 중요하다.
- 외부인 이용 가능 여부, 가격, 예약 필요 여부는 핵심 정보로 다룬다.
- 장소 정보는 최신성이 중요하므로 업데이트 일자를 표시한다.
- 장소는 단독 객체이면서 관련 콘텐츠와 연결되어야 한다.

### Item

Item은 바스타임을 돕는 아이템 정보를 구조화한 객체이다.

입욕제, 바디워시, 족욕기, 반신욕조, 수건, 조명, 향 관련 제품 등이 해당된다.

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

#### Item Rule

- 아이템은 쇼핑몰 상품처럼 다루지 않는다.
- 제품보다 사용 상황과 맥락을 먼저 설명한다.
- 추천 대상과 비추천 대상을 함께 제시한다.
- 콘텐츠 속 세팅과 자연스럽게 연결한다.

### Routine Preset

Routine Preset은 사용자가 바로 실행할 수 있는 루틴 단위이다.

기존 Timer Preset을 확장한 개념이며, 단순 시간 측정보다 “따라 해볼 수 있는 의식”에 가깝다.

```txt
Routine Preset
├─ 샤워 7분
├─ 족욕 10분
├─ 입욕 15분
├─ 자유 루틴
└─ 연결 콘텐츠
```

#### Routine Preset Rule

- 루틴은 콘텐츠의 실행 CTA와 연결된다.
- 루틴 화면에서는 관련 콘텐츠 출처를 표시할 수 있다.
- 완료 후 저장, 비슷한 콘텐츠 보기, 제보하기로 이어진다.
- 향후 사용자가 직접 만든 루틴과 저장한 루틴으로 확장할 수 있다.

---

## Web / App IA Difference

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

웹에서는 Explore와 콘텐츠 상세의 비중이 높다. 검색, 필터, 리스트, 상세 정보, 공유, SEO 유입을 고려한다.

#### Web Role

- 검색 유입
- 콘텐츠 상세 소비
- 카테고리/태그 탐색
- 장소/아이템 정보 비교
- 외부 공유
- 앱 다운로드 또는 저장/실행 전환

### App

앱은 저장과 실행의 도구이다.

앱에서는 Routines와 Saved의 비중이 높다. 콘텐츠를 저장하고, 나중에 다시 꺼내보고, 바로 루틴을 실행하는 경험을 강화한다.

#### App Role

- 저장한 콘텐츠 다시 보기
- 루틴 실행
- 최근 본 콘텐츠 확인
- 제보하기
- 향후 개인화/리마인더/내 루틴 확장

---

## P0 Minimum IA

P0에서는 전체 IA를 모두 구현하되, 각 메뉴의 범위는 최소화한다.

처음부터 커뮤니티, 예약, 결제, 제품 DB, 고도화된 개인화 기능을 넣지 않는다.

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

### P0 Rule

- Home은 비어 보이지 않도록 콘텐츠 노출을 우선한다.
- Explore는 카테고리/태그/검색까지만 제공한다.
- Routines는 샤워 7분, 족욕 10분, 입욕 15분, 자유 루틴만 제공한다.
- Submit은 사진/링크/한 줄 코멘트 중심으로 가볍게 만든다.
- Saved는 우선 콘텐츠 저장만 제공하고, 장소/아이템 분리는 이후 확장한다.

---

## IA Decision

| Decision | Direction |
|---|---|
| 최종 탭 구조 | Home / Explore / Routines / Submit / Saved |
| Timer 명칭 | 메뉴에서는 Timer 대신 Routines 사용 |
| 콘텐츠 중심축 | Content를 중심으로 Place, Item, Routine Preset 연결 |
| 웹 역할 | 발견과 탐색 |
| 앱 역할 | 저장과 실행 |
| P0 방향 | 콘텐츠 아카이브 + 루틴 실행 + 저장 + 제보 |
| 제외할 것 | 공개 커뮤니티, 댓글, 자체 예약, 결제, 제품 DB, 고도화 개인화 |

---

## Aesthetic Direction

- **Direction:** Warm Ritual Archive
- **Decoration level:** Clean, restrained, editorial
- **Mood:** 밝고 정돈되어 있으며, 생활감이 있으면서도 조용한 쉼의 분위기를 가진다. 사용자는 화면을 볼 때 “광고성 감성 콘텐츠”가 아니라 “다시 찾아볼 만한 기록”이라고 느껴야 한다.
- **Reference cues:** 밝은 욕실 타일, 따뜻한 수건, 낮은 베이지 톤, 차분한 웹 아카이브, 카드형 콘텐츠 피드, 여행/숙소 큐레이션 서비스, Notion식 정돈감, 라이프스타일 매거진의 여백.
- **Avoid:** 과한 다크 스팀 무드, 황금빛 스파 과장, 의료 앱 같은 차가운 UI, 쇼핑몰 같은 상품 진열, SNS 피드처럼 휘발적인 이미지 중심 구성.

### Visual keywords

- 밝은 욕실
- 마른 수건
- 미지근한 물
- 세라믹
- 따뜻한 종이
- 정돈된 기록
- 조용한 아침
- 집 안팎의 쉼
- 오래 찾아볼 수 있는 아카이브

---

## Logo System

- **Primary mark:** `assets/images/bathtime.svg`
- **Concept:** 물방울, 물의 흐름, 씻고 쉬는 시간을 하나의 부드러운 심볼로 묶는다.
- **Usage:** 앱/웹 헤더, 스플래시, 앱 아이콘, 콘텐츠 상세 상단, 저장 완료 화면, 공유 이미지 하단 브랜드 서명에 사용한다.
- **Rule:** 콘텐츠 플랫폼에서는 로고가 과하게 앞서면 안 된다. 브랜드보다 콘텐츠 신뢰가 먼저 보이도록 작은 크기와 충분한 여백으로 사용한다.
- **Light theme rule:** 로고는 딥 네이비 또는 웜 그레이 위주로 사용한다. Brass는 로고 기본색이 아니라 강조 상황에만 제한적으로 사용한다.

---

## Typography

### Font principle

- 시스템 산세리프를 기본으로 사용한다.
- 브랜드를 고급스럽게 보이게 하기 위해 serif를 억지로 섞지 않는다.
- 콘텐츠 아카이브의 핵심은 장시간 읽기와 정보 비교이므로, 가독성과 구조감이 우선이다.

### Recommended stack

```css
font-family: -apple-system, BlinkMacSystemFont, "Pretendard", "Inter", "Noto Sans KR", "Segoe UI", sans-serif;
```

### Type roles

- **Hero / Page title:** 30-34 / 38-42, weight 700
- **Section title:** 22-24 / 30-32, weight 700
- **Content title:** 19-21 / 27-30, weight 700
- **Card title:** 16-18 / 24-26, weight 650-700
- **Body:** 15-16 / 24-27, weight 400-500
- **Meta / Caption:** 12-13 / 18-20, weight 400-500
- **Label / Chip:** 12-13 / 16-18, weight 600
- **Data value:** 14-15 / 20, tabular nums recommended

### Typography rules

- 제목은 감성 문장보다 정보 구조를 먼저 전달한다.
- 긴 본문은 15px 이하로 내리지 않는다.
- 콘텐츠 상세 본문은 줄간격을 넉넉하게 잡아 블로그형 아카이브처럼 편하게 읽히게 한다.
- 가격, 소요 시간, 업데이트 일자, 예약 여부 같은 정보는 숫자 정렬이 흔들리지 않도록 tabular nums를 사용한다.

---

## Color System

## Color approach

기존 컬러는 다크 스팀 무드에 강하게 맞춰져 있었다. 그러나 새 바스타임은 웹/앱 기반 콘텐츠 아카이브이므로, 사용자가 글을 오래 읽고 정보를 비교하고 저장해야 한다.

따라서 기본 테마는 **Light Warm Archive**로 전환한다.

- 배경은 밝고 따뜻해야 한다.
- 정보 카드의 구분은 섬세해야 한다.
- 브랜드의 깊이는 Deep Navy로 유지한다.
- Brass는 CTA와 핵심 강조에만 제한적으로 쓴다.
- 물의 감각은 깨끗한 Aqua가 아니라, 과하지 않은 Mist Blue/Steam Blue로 표현한다.

---

## Primary Palette — Light Warm Archive

| Token | Hex | Usage |
|---|---:|---|
| `color.bg.default` | `#F8F5EF` | 앱/웹 기본 배경. 따뜻한 종이와 밝은 욕실 타일 사이의 톤 |
| `color.bg.subtle` | `#F1ECE3` | 섹션 구분, 연한 배경 블록 |
| `color.bg.surface` | `#FFFCF7` | 카드, 콘텐츠 본문, 폼 표면 |
| `color.bg.elevated` | `#FFFFFF` | 모달, 플로팅 CTA, 상단 고정 영역 |
| `color.text.primary` | `#18282C` | 기본 텍스트. 기존 Deep Steam Navy를 라이트 테마 텍스트로 재해석 |
| `color.text.secondary` | `#4F6266` | 보조 설명, 카드 요약 |
| `color.text.muted` | `#879397` | 메타 정보, 업데이트 일자, 비활성 텍스트 |
| `color.brand.navy` | `#102629` | 브랜드 핵심색, 헤더 텍스트, 강한 CTA 텍스트/배경 |
| `color.brand.brass` | `#B88A4A` | 핵심 CTA, 저장 상태, 추천 배지, 중요한 포인트 |
| `color.brand.brassSoft` | `#F2E5D0` | 강조 카드 배경, 선택된 필터 배경 |
| `color.water.mist` | `#DCEDEA` | 물/증기 느낌의 부드러운 배경 |
| `color.water.blue` | `#8FB8B2` | 보조 아이콘, 정보 배지, 차분한 선택 상태 |
| `color.line.default` | `#E4DDD2` | 기본 구분선 |
| `color.line.strong` | `#CDBFAE` | 강조 구분선, 선택 카드 border |

---

## Semantic Palette

| Token | Hex | Usage |
|---|---:|---|
| `color.success` | `#5F8F78` | 이용 가능, 저장 완료, 타이머 완료 |
| `color.successSoft` | `#E4F0E9` | 성공 상태 배경 |
| `color.warning` | `#B88A4A` | 확인 필요, 예약 필요, 주의성 정보 |
| `color.warningSoft` | `#F4E8D4` | 경고성 안내 배경 |
| `color.danger` | `#B46A5A` | 이용 불가, 오류, 위험 안내 |
| `color.dangerSoft` | `#F5E2DE` | 위험 안내 배경 |
| `color.info` | `#5E8790` | 정보성 안내, 업데이트 |
| `color.infoSoft` | `#E3EEF0` | 정보성 안내 배경 |

---

## Color Usage Rules

### 1. 기본은 밝게, 깊이는 텍스트와 포인트에서 만든다

- 화면 전체를 네이비로 덮지 않는다.
- 네이비는 텍스트, 헤더, 핵심 CTA, 로고에 사용한다.
- 브랜드 무드는 어두운 배경이 아니라 정돈된 대비와 따뜻한 여백으로 만든다.

### 2. Brass는 금색 장식이 아니다

Brass는 다음에만 사용한다.

- Primary CTA
- 저장 완료/선택 상태
- 추천/확인된 정보 배지
- 콘텐츠 상세의 핵심 인사이트 표시

다음에는 사용하지 않는다.

- 큰 배경 면적
- 모든 아이콘
- 카드 전체 테두리
- 장식용 그라디언트

### 3. 콘텐츠 카테고리는 색보다 구조로 구분한다

카테고리별로 강한 색을 여러 개 쓰지 않는다. 대신 아이콘, 라벨, 섹션명, 태그 구조로 구분한다.

- Home Bath: Warm Sand / Mist
- Bath Places: Deep Navy / Mist Blue
- Bath Items: Brass Soft / Linen
- Guide / Checklist: Gray Blue / Off-white

### 4. 이미지 위 텍스트는 기본 전략이 아니다

기존 사진 오버레이 앱에서는 이미지 위 문구가 핵심이었지만, 새 구조에서는 이미지가 콘텐츠의 보조 자료다.

- 이미지 위 텍스트는 공유 카드나 히어로에서만 제한적으로 사용한다.
- 기본 콘텐츠 카드는 이미지 아래에 제목, 요약, 구조화 정보를 둔다.
- 사진의 분위기보다 정보 신뢰와 저장 가치가 우선이다.

---

## Gradient

라이트 테마에서는 그라디언트를 주 배경으로 쓰지 않는다.

허용되는 경우:

```css
--gradient-warm-hero: linear-gradient(180deg, #FFFCF7 0%, #F4EEE5 100%);
--gradient-mist-card: linear-gradient(180deg, #FFFFFF 0%, #F4F8F7 100%);
--gradient-navy-cta: linear-gradient(135deg, #102629 0%, #274449 100%);
```

사용처:

- 랜딩 히어로
- 온보딩 상단
- 저장 완료/타이머 완료 화면
- 특별 기획 콘텐츠 배너

피해야 할 것:

- 앱 전체 배경 그라디언트
- 카드마다 다른 그라디언트
- 황금빛 스파 조명 느낌의 과한 radial gradient

---

## Spacing

- **Base unit:** 4px
- **Density:** Comfortable, content-first
- **Scale:** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64

### Rules

- 모바일 기본 좌우 패딩은 20px.
- 웹 콘텐츠 본문 최대 너비는 680-760px.
- 웹 리스트/아카이브 영역 최대 너비는 1080-1200px.
- 카드 내부 패딩은 16-20px을 기본으로 한다.
- 정보가 많은 구조화 카드의 row 간격은 10-12px 이상 확보한다.
- CTA 주변은 최소 16px 이상의 숨 쉴 공간을 둔다.

---

## Layout System

### Approach

- **Mobile-first archive layout**
- 웹에서는 앱처럼 너무 좁게 가두지 않는다.
- 다만 콘텐츠 본문은 너무 넓어지지 않도록 제한한다.
- 웹과 앱 모두 같은 콘텐츠 구조를 공유하되, 웹은 탐색과 공유, 앱은 저장과 실행에 최적화한다.

---

## App/Web Shell

### Mobile app

- Bottom tab 기반.
- 최종 P0 탭은 `Home / Explore / Routines / Submit / Saved`를 기본으로 한다.
- 콘텐츠 피드에서 저장, 태그 탐색, 루틴 CTA 진입이 빠르게 가능해야 한다.
- Routines는 중앙 탭에 두어 실행 도구의 존재감을 유지한다.
- Saved는 마지막 탭에 두어 개인 보관함과 재방문 동선을 담당한다.

Recommended P0 tabs:

```txt
Home
Explore
Routines
Submit
Saved
```

### Web

- 상단 헤더 + 콘텐츠 아카이브 구조.
- 데스크톱에서는 좌측 필터/카테고리 또는 상단 칩 필터를 활용한다.
- 콘텐츠 상세는 블로그처럼 읽히되, 구조화 정보 카드와 CTA가 명확히 보여야 한다.
- 웹에서는 카테고리 탐색과 검색 유입이 중요하므로, 필요 시 `Home Bath / Bath Places / Bath Items`를 상단 카테고리로 노출할 수 있다.

Recommended web nav:

```txt
Home
Explore
Routines
Submit
Saved
```

Expanded content nav:

```txt
Home
Home Bath
Bath Places
Bath Items
Routines
Submit
```

---

## Grid

### Mobile

- 1 column feed.
- Horizontal category chips.
- 카드 이미지는 16:10 또는 4:3을 기본으로 한다.
- 장소/숙소 콘텐츠는 4:3 이미지가 적합하다.
- 홈 리추얼 콘텐츠는 텍스트 중심 카드도 허용한다.

### Desktop / Web

- Home feed: 2-3 column card grid.
- Featured article: 12-column 기준 7:5 또는 8:4 split.
- Content detail: 본문 680-760px + 우측 sticky summary/CTA 280-320px 가능.
- Archive list: 필터 240px + grid area.

---

## Border Radius

| Element | Radius |
|---|---:|
| Small chip | 999px |
| Button | 14px |
| Input | 12px |
| Card | 18px |
| Featured card | 24px |
| Modal / Sheet | 24px |
| Image | 16px |

Rule:

- 라이트 테마에서는 radius를 조금 더 부드럽게 가져가도 된다.
- 단, 모든 것이 동글동글한 귀여운 앱처럼 보이면 안 된다. 카드와 버튼은 부드럽되 정보 구조는 단단해야 한다.

---

## Elevation / Border

라이트 테마에서는 그림자를 과하게 쓰면 쇼핑몰처럼 보인다.

### Default card

```css
background: #FFFCF7;
border: 1px solid #E4DDD2;
box-shadow: 0 1px 2px rgba(16, 38, 41, 0.04);
```

### Elevated card

```css
background: #FFFFFF;
border: 1px solid #E4DDD2;
box-shadow: 0 12px 32px rgba(16, 38, 41, 0.08);
```

### Selected card

```css
background: #FFFFFF;
border: 1px solid #B88A4A;
box-shadow: 0 8px 24px rgba(184, 138, 74, 0.12);
```

---

## Core Components

## 1. Content Card

콘텐츠 피드의 핵심 단위다.

### Anatomy

```txt
Image or soft visual
Category label
Title
Short summary
Structured meta row
Save action
```

### Required meta examples

Home Ritual:

```txt
10분 · 욕조 없음 · 수면 전
```

Bath Place:

```txt
서울 성수 · 외부인 가능 · 예약 확인 필요
```

Bath Item:

```txt
족욕 · 보관 쉬움 · 입문용
```

### Rules

- 제목은 2줄까지 허용한다.
- 요약은 2줄까지 제한한다.
- 저장 버튼은 작지만 명확해야 한다.
- 카드 전체가 콘텐츠 상세로 이동하되, 저장 버튼은 별도 액션으로 동작한다.
- 이미지가 없는 콘텐츠도 어색하지 않게 텍스트형 카드 variant를 둔다.

---

## 2. Structured Info Panel

바스타임의 차별점은 예쁜 글이 아니라 구조화된 정보다. 따라서 상세 화면의 정보 패널은 매우 중요하다.

### Spot info fields

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

### Home ritual fields

```txt
소요 시간
욕조 필요 여부
필요 아이템
난이도
추천 상황
바로 실행 가능한 타이머
```

### Item fields

```txt
사용 상황
욕조 필요 여부
보관/청소 난이도
매일 사용 가능성
가격대
추천 대상
비추천 대상
함께 쓰기 좋은 세팅
```

### Visual rules

- 2열 그리드는 웹에서만 사용한다.
- 모바일에서는 label/value row로 쌓는다.
- 중요 상태는 색보다 텍스트와 아이콘으로 명확히 표시한다.
- `확인 필요` 상태는 warning 색을 사용하되 불안감을 과하게 주지 않는다.

---

## 3. Category Chip / Tag Chip

### Category chips

- Home Bath
- Bath Places
- Bath Items
- Guide

### Context tags

- 욕조없음
- 수면전
- 비오는날
- 운동후
- 원룸욕실
- 혼자쉬기
- 서울사우나
- 호텔스파
- 외부인이용가능
- 프라이빗스파

### Rules

- 태그 칩은 필터와 맥락 탐색의 도구다.
- 감성 장식처럼 많이 뿌리지 않는다.
- 콘텐츠 카드에서는 최대 3개만 노출한다.
- 상세 화면에서는 관련 태그를 본문 하단에 모은다.

---

## 4. CTA Button

### Hierarchy

#### Primary

- 배경: `color.brand.navy` 또는 `color.brand.brass`
- 텍스트: white 또는 navy contrast
- 사용: 타이머 시작, 저장, 제보 제출, 예약/문의 이동

#### Secondary

- 배경: `color.bg.surface`
- border: `color.line.default`
- 텍스트: `color.text.primary`
- 사용: 비슷한 콘텐츠 보기, 공유하기, 뒤로 가기

#### Tertiary

- 배경 없음
- 텍스트: `color.brand.navy`
- 사용: 보조 링크, 더 보기

### CTA copy examples

- 오늘의 의식 보기
- 이 의식 따라 해보기
- 10분 족욕 타이머 시작하기
- 이 장소 저장하기
- 내 바스타임으로 저장하기
- 비슷한 의식 더 보기
- 다녀온 곳 제보하기

---

## 5. Save Button

저장 기능은 새 피벗에서 매우 중요하다. 앱이어야 하는 이유를 만드는 핵심 컴포넌트다.

### States

```txt
Default: 저장
Saved: 저장됨
Loading: 저장 중
Unavailable: 로그인 후 저장 가능 또는 임시 저장됨
```

### Rules

- 저장은 콘텐츠 카드와 상세 화면 모두에서 접근 가능해야 한다.
- P0에서 로그인이 없다면 “이 기기에 저장됨” 같은 표현을 사용할 수 있다.
- 저장 완료 후 과한 축하보다 조용한 피드백을 준다.

Copy:

```txt
저장해두었어요.
나중에 다시 볼 수 있어요.
```

---

## 6. Timer CTA / Timer Surface

타이머는 더 이상 제품의 중심이 아니다. 콘텐츠를 실제 행동으로 이어주는 보조 실행 도구다.

### Entry examples

```txt
이 세팅을 따라 해보고 싶다면 10분 타이머를 시작해보세요.
```

```txt
자기 전 샤워 리추얼에 맞춰 7분 타이머를 준비했어요.
```

### Timer screen rules

- 큰 시간 표시.
- 조작은 시작/일시정지/종료 중심.
- 연결된 콘텐츠 제목을 작게 표시한다.
- 사운드는 선택 기능으로 둔다.
- 완료 후 저장, 비슷한 콘텐츠 보기, 제보 CTA로 이어진다.

Completion copy:

```txt
오늘의 바스타임이 끝났어요.
괜찮았다면 이 세팅을 저장해두세요.
```

---

## 7. Submit Form

제보는 커뮤니티 게시글 작성이 아니라 아카이브를 함께 채우는 가벼운 참여다.

### P0 fields

```txt
제보 유형
사진 1장 또는 링크 1개
한 줄 코멘트
닉네임 선택 입력
공개 가능 여부
```

### Rules

- 긴 글을 요구하지 않는다.
- 사용자가 완성된 리뷰를 쓰게 하지 않는다.
- 운영자가 확인하고 바스타임식 콘텐츠로 정리한다는 느낌을 준다.

Copy:

```txt
이런 곳 아세요? 한 줄로 알려주세요.
바스타임이 확인해보고 아카이브에 정리해볼게요.
```

---

## Image System

### Role

이미지는 분위기를 만드는 재료이지만, 서비스의 핵심 결과물은 아니다.

### Rules

- 콘텐츠 카드 이미지는 실제성, 청결감, 밝은 분위기를 우선한다.
- 너무 어두운 욕실, 과한 스팀, 고급 호텔 광고 같은 이미지는 피한다.
- 사우나/스파/숙소 콘텐츠는 실제 이용 가능성을 확인할 수 있는 사진이 좋다.
- 홈 리추얼 콘텐츠는 손, 수건, 조명, 물, 욕실 일부처럼 따라 해볼 수 있는 장면이 좋다.
- 아이템 콘텐츠는 제품 단독보다 사용 맥락이 보이는 이미지가 좋다.

### Image ratio

| Usage | Ratio |
|---|---:|
| Content card | 16:10 or 4:3 |
| Featured article | 16:9 |
| Detail hero | 16:9 / 3:2 |
| Share image | 1:1, 4:5, 9:16 |
| Small thumbnail | 1:1 |

---

## Iconography

### Style

- 1.75px 또는 2px stroke line icon.
- rounded cap, rounded join.
- 장식보다 정보 전달 중심.

### Core icons

- Home Bath: shower / foot bath / towel
- Bath Places: map pin / sauna / building / bath
- Bath Items: bottle / candle / basket
- Save: bookmark
- Timer: clock
- Submit: plus / message / spark
- Update: refresh / calendar

### Rules

- 아이콘은 텍스트를 대체하지 않는다.
- 중요한 상태는 아이콘 + 텍스트로 함께 표시한다.
- Brass 아이콘은 핵심 강조에만 사용한다.

---

## Motion

### Approach

Minimal-functional.

### Use

- 카드 진입 fade/slide.
- 저장 완료 micro feedback.
- 필터 선택 전환.
- 타이머 시작/완료.
- 제보 제출 완료.

### Avoid

- 과한 물결 애니메이션.
- 의미 없는 스팀 효과.
- bounce-heavy 인터랙션.
- 앱 전체를 느리게 만드는 감성 모션.

### Timing

```txt
Micro feedback: 120-180ms
Card transition: 180-240ms
Sheet / modal: 240-320ms
Timer complete: 320-480ms
```

---

## Voice in UI

### Tone

- 차분함
- 솔직함
- 정돈됨
- 따뜻함
- 직접 찾아보고 정리하는 사람의 태도
- 감각적이지만 과장하지 않음
- 전문적인 척하지 않음

### Principle

바스타임은 사용자를 가르치지 않는다. 의학적 효능을 단정하지 않는다. “완벽한 루틴”보다 “오늘 해볼 만한 작은 의식”을 제안한다.

### Do

- 오늘은 10분만, 씻는 시간을 조금 더 천천히 가져가봅니다.
- 욕조 없는 집에서도 쉬는 느낌이 날까 싶어서 정리해봤습니다.
- 외부인도 이용 가능한지 확인해봤어요.
- 다녀온 곳이 있다면 이름만 남겨주세요. 바스타임이 확인해볼게요.
- 이 세팅은 수면 전보다 주말 낮에 더 잘 어울릴 수 있어요.

### Don't

- 수면 개선에 효과적인 프리미엄 입욕 루틴을 제안합니다.
- 완벽한 홈스파 루틴을 시작하세요.
- 최고의 호텔 스파 감성을 완성하세요.
- 당신의 피로를 치료해드립니다.
- 지금 구매하지 않으면 놓칩니다.

### Label rule

- `준비물`은 너무 과제처럼 들릴 수 있다.
- 홈 리추얼에서는 `세팅`, `함께 준비할 것`, `오늘의 구성`을 우선 사용한다.
- 장소 콘텐츠에서는 `이용 정보`, `확인한 것`, `알아둘 점`을 사용한다.
- 아이템 콘텐츠에서는 `사용 맥락`, `함께 쓰기 좋은 것`을 사용한다.

---

## Content Template Rules

### Home Ritual Detail

```txt
Title
Situation summary
Hero image / illustration
Quick info panel
Why this helps as a ritual
How to set it up
Good points
Things to consider
Timer CTA
Related items / similar rituals
Updated date
```

### Bath Place Detail

```txt
Title
Location / category
Hero image
Quick info panel
Short summary
Good points
Things to consider
Who it fits
Who it may not fit
Reservation / official link / inquiry CTA
Save CTA
Report update / submit CTA
Updated date
```

### Bath Item Detail

```txt
Title
Item category
Use case summary
Quick info panel
What it is good for
When it feels unnecessary
Things to check before buying
Related rituals
Save / interested CTA
Updated date
```

---

## Component Rules

- 콘텐츠 카드는 피드에서 저장하고 싶어야 한다.
- 상세 화면은 읽고 끝나는 글이 아니라 저장/타이머/제보/예약 문의 중 하나의 행동으로 이어져야 한다.
- 카드는 사진보다 제목, 요약, 구조화 정보가 먼저 읽혀야 한다.
- 스팟 콘텐츠에서는 `외부인 이용 가능 여부`, `예약 필요 여부`, `가격대`, `업데이트 일자`가 우선 노출되어야 한다.
- 홈 리추얼 콘텐츠에서는 `소요 시간`, `욕조 필요 여부`, `필요 아이템`, `타이머 CTA`가 우선 노출되어야 한다.
- 아이템 콘텐츠는 쇼핑몰처럼 보이면 안 된다. 가격보다 사용 맥락과 추천/비추천 대상을 먼저 보여준다.
- 제보 기능은 빈 커뮤니티처럼 보이지 않아야 한다. “같이 아카이브를 채운다”는 표현으로 설계한다.
- Product 탭은 P0 메인 탭에서 제외한다. 아이템은 콘텐츠 안의 맥락으로 연결한다.
- Mood/Trip은 독립 탭보다 태그와 시리즈로 흡수한다.
- 타이머는 홈 화면의 주인공이 아니라 콘텐츠 하단과 저장된 콘텐츠에서 실행되는 도구다.
- 의료적 효능, 치료, 건강 개선을 단정하는 UI 카피는 사용하지 않는다.
- 예약/구매/제휴 CTA는 콘텐츠 신뢰를 해치지 않도록 명확히 분리하고, 광고성 노출은 표시 원칙을 둔다.

---

## Accessibility

- 기본 본문 대비는 WCAG AA 이상을 목표로 한다.
- Brass 텍스트는 작은 크기에서 단독 사용하지 않는다.
- 44px 이상의 터치 영역을 확보한다.
- 태그 칩과 필터는 선택 상태가 색만으로 구분되지 않게 한다.
- 이미지 위 텍스트를 사용할 경우 반드시 딤/블러/단색 패널로 대비를 확보한다.
- 가격, 예약, 이용 가능 여부 같은 핵심 정보는 아이콘만으로 전달하지 않는다.

---

## Dark Mode Strategy

새 바스타임의 기본은 라이트 테마다.

다크 모드는 브랜드의 기본값이 아니라 보조 모드로 둔다.

### Reason

- 콘텐츠 아카이브는 장시간 읽기와 정보 비교가 중요하다.
- 웹 유입 사용자는 밝은 배경에서 정보 신뢰를 더 빠르게 판단한다.
- 기존 다크 스팀 무드는 감성은 강하지만, 서비스가 스팟/아이템/가이드 아카이브로 확장될 때 폐쇄적이고 무겁게 보일 수 있다.

### Dark mode allowed use

- 타이머 집중 모드
- 수면 전 리추얼 모드
- 야간 읽기 모드
- 특별한 에디토리얼 배너

### Dark mode palette, optional

| Token | Hex |
|---|---:|
| `dark.bg.default` | `#102629` |
| `dark.bg.surface` | `#183236` |
| `dark.text.primary` | `#F8F5EF` |
| `dark.text.secondary` | `#D7E1DC` |
| `dark.text.muted` | `#9FB5AF` |
| `dark.accent.brass` | `#D0A464` |
| `dark.line.default` | `rgba(230, 246, 239, 0.14)` |

---

## Page-Level Design Rules

## Home

- 오늘의 추천 콘텐츠, 최신 아카이브, 바로 따라 해볼 수 있는 의식을 보여준다.
- 홈스파/장소/아이템 콘텐츠가 섞여도 구조가 무너지지 않게 한다.
- 바로 실행 가능한 Routines CTA는 작지만 분명하게 둔다.
- 상단은 브랜드 소개보다 “오늘 볼 만한 기록”이 먼저다.

## Explore

- 카테고리, 태그, 검색 기반 탐색이 핵심이다.
- `Home Bath / Bath Places / Bath Items`를 가장 중요한 1차 분류로 사용한다.
- 필터는 너무 복잡하지 않게 시작한다.
- P0에서는 카테고리, 상황 태그, 지역, 욕조 필요 여부 정도만 우선한다.

## Routines

- 기존 타이머를 포함한 실행형 루틴 영역이다.
- 기본 루틴은 `샤워 7분 / 족욕 10분 / 입욕 15분 / 자유 타이머`로 시작한다.
- 독립 타이머도 가능하지만, 콘텐츠에서 들어온 루틴 실행이 더 중요하다.
- 루틴 완료 후 콘텐츠 상세, 저장, 비슷한 의식, 제보로 다시 연결되어야 한다.

## Submit

- 좋은 장소, 세팅, 아이템, 다뤄줬으면 하는 주제를 제보하는 영역이다.
- 폼은 짧아야 한다.
- “리뷰를 써주세요”가 아니라 “단서를 남겨주세요”에 가깝게 설계한다.
- 제보는 커뮤니티 게시글이 아니라 운영자가 확인해 아카이브로 정리할 원재료처럼 다룬다.

## Saved

- 저장한 콘텐츠, 저장한 장소, 저장한 아이템, 추후 내 루틴 보관함을 포함한다.
- 저장한 콘텐츠는 `전체`, `장소`, `집에서 하는 의식`, `아이템`, `루틴`으로 나눠 볼 수 있어야 한다.
- 저장한 이유를 떠올릴 수 있도록 핵심 요약 정보가 유지되어야 한다.
- Saved는 단순 북마크가 아니라 재방문과 실행을 만드는 개인 보관함이다.

## Content Detail

- 첫 화면 안에 제목, 요약, 핵심 구조화 정보, 저장 버튼이 보여야 한다.
- 본문 중간에 CTA를 너무 자주 넣지 않는다.
- 하단에는 저장, 루틴 실행, 비슷한 콘텐츠, 제보 CTA를 자연스럽게 배치한다.

---

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-07 | 최종 IA를 Home / Explore / Routines / Submit / Saved로 정리 | 바스타임을 콘텐츠 아카이브, 실행 루틴, 저장, 제보 구조로 명확히 나누기 위해 |
| 2026-05-07 | Timer 메뉴명을 Routines로 변경 | 단순 타이머 앱처럼 보이는 인상을 줄이고, 샤워·족욕·입욕·직접 만든 루틴까지 확장 가능한 실행 영역으로 정의하기 위해 |
| 2026-05-07 | 핵심 객체를 Content / Place / Item / Routine Preset으로 정리 | 메뉴 중심 IA뿐 아니라 아카이브 플랫폼으로서 데이터 구조와 확장 방향을 명확히 하기 위해 |
| 2026-04-07 | 초기 스파형 무드 채택 | 앱의 감각적 방향을 빠르게 검증하기 위해 |
| 2026-04-07 | 딥 스팀 배경 + 따뜻한 텍스트 팔레트 적용 | 목욕·샤워 앱의 조용한 분위기를 만들기 위해 |
| 2026-04-24 | Everyday Bath Guide로 브랜드 무게중심 이동 | 한국 시장에서 입욕 중심보다 생활형 셀프케어와 쉬운 실행감을 우선하기 위해 |
| 2026-05-04 | Private Bath Log로 MVP 무게중심 이동 | 사용자 욕실/홈스파 장면을 사진 기반 리추얼 로그로 저장/공유하는 피벗을 반영하기 위해 |
| 2026-05-07 | Warm Ritual Archive로 디자인 시스템 재정의 | 새 피벗 방향에 따라 사진 로그 앱이 아니라 집 안팎의 바스타임 콘텐츠를 발견·저장·실행하는 아카이브 플랫폼으로 전환하기 위해 |
| 2026-05-07 | 기본 테마를 Light Warm Archive로 전환 | 콘텐츠 탐색, 장시간 읽기, 구조화 정보 비교, 웹 유입에 더 적합한 라이트 테마를 기본값으로 삼기 위해 |
| 2026-05-07 | Brass를 포인트 컬러로 제한 | 고급 스파/황금 조명 느낌의 과장을 줄이고, 신뢰감 있는 아카이브 톤을 유지하기 위해 |
| 2026-05-07 | Product/Mood/Trip 독립 탭 약화 | 제품과 무드 콘텐츠를 별도 탭이 아니라 콘텐츠 태그와 관련 아이템 맥락으로 흡수하기 위해 |
| 2026-05-07 | 타이머를 보조 실행 도구로 재정의 | 타이머를 제품 중심에서 내리고, 콘텐츠를 따라 해보는 행동 CTA로 연결하기 위해 |
| 2026-05-07 | IA를 Home / Explore / Routines / Submit / Saved로 확정 | 콘텐츠 발견, 목적 탐색, 실행 루틴, 제보, 개인 보관함의 행동 흐름을 명확히 분리하기 위해 |
---

## Final Design Principle

바스타임의 디자인은 사용자를 감성적으로 압도하지 않는다.

좋아 보이는 이미지를 보여주는 것보다, 사용자가 실제로 판단하고 저장하고 따라 해볼 수 있게 정보를 정리한다.

> 밝고 따뜻하게 읽히고, 조용하게 믿기며, 필요할 때 다시 찾아오고 싶은 바스타임 아카이브.

