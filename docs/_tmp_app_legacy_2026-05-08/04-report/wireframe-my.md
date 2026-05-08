# My 탭 와이어프레임 (현재 구현 기준)

기준: `app/(tabs)/my.tsx`

## 1) 목적
- 개인 기록 조회 및 회고
- 주간 루틴 페이스 확인(홈과 동일 streak 개념)
- 프로필/환경/건강조건 설정 관리

## 2) 최상위 구조
1. 서브탭 행
- `기록` / `설정`
- 기본 진입: `기록`

2. 탭 콘텐츠 영역
- `기록`: HistorySection
- `설정`: SettingsSection

---

## 3) 기록 탭 (HistorySection)

### 화면 구조 (상→하)
1. 헤더
- 타이틀: `기록`
- 서브카피: 완료 루틴 개수 안내

2. 이번주 루틴 카드 (Home과 동일)
- `오늘 Bath 완료 ✔` 또는 `오늘 Bath 미완료 -`
- `Mon~Sun` 요일 체크(`✔ / -`)
- `X / 7 baths this week`
- `N day streak · M weeks active`

3. 월간 요약 배너
- 이번 달 완료 횟수
- 평균 진행 시간
- 자주 사용한 환경
- 자주 찾은 테마(있을 때)

4. 필터 칩
- `전체` / `케어` / `트립`

5. 기록 카드 그리드 (2열)
- 카드: 이모지, 모드 pill(케어/트립), 제목, 수온/입욕타입, 날짜
- 카드 탭 시 레시피 상세 이동

6. 빈 상태
- 전체 기록 0건: Empty 일러스트/카피
- 필터 결과 0건: 필터 전용 빈 상태 카피

### 데이터/상태
- `loadHistory()`
- `loadTripMemoryHistory()`
- `loadThemePreferenceWeights()`
- streak 계산: `buildHomeStreakSummary(memoryHistory.completedAt)`
- 인사이트 계산: `buildHistoryInsights(history, memoryHistory)`

### 인터랙션
- 서브탭 전환
- 필터 전환
- 카드 탭 → `/result/recipe/[id]`

---

## 4) 설정 탭 (SettingsSection)

### 화면 구조 (상→하)
1. 내 정보 섹션
- 현재 목욕 환경 표시
- 환경 태그 선택(즉시 저장)
- 건강 상태 태그 선택(다중 선택, `none` 처리 규칙 포함)

2. 설정 섹션
- `프로필 다시 설정하기` 액션 카드
- 탭 시 자체 확인 모달

3. 앱 정보 섹션
- 버전
- 앱 이름
- 디스클로저

4. 모달
- 제목/본문/취소/초기화 버튼
- 초기화 중 disabled 상태

### 상태 규칙
- `loading || !profile`이면 로딩 메시지
- profile 없음 감지 시 온보딩 라우팅
- 건강상태 토글 시 `none`과 상호배타 규칙 적용

### 인터랙션
- 환경 변경: `update({ bathEnvironment })`
- 건강조건 변경: `update({ healthConditions })`
- 프로필 초기화: `clear()` 후 `/onboarding` 이동

---

## 5) 텍스트 와이어프레임
```text
[SubTab]
  [기록] [설정]

(기록 탭)
  기록
  총 N개의 루틴을 완료했어요

  [이번주 루틴 카드]
    오늘 Bath 완료/미완료
    Mon Tue Wed Thu Fri Sat Sun
     ✔   ✔   -   -   -   -   -
    X / 7 baths this week
    N day streak · M weeks active

  [월간 요약 배너]
  [필터 칩: 전체/케어/트립]
  [2열 기록 카드 그리드]

(설정 탭)
  내 정보
    환경 정보 + 선택 태그
    건강 상태 선택 태그

  설정
    프로필 다시 설정하기

  앱 정보
    버전 / 앱 이름 / 안내

  [초기화 확인 모달]
```
