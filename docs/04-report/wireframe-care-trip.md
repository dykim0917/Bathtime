# Care/Trip 탭 와이어프레임 (현재 구현 기준)

## Care 탭
기준: `app/(tabs)/care.tsx`

### 1) 목적
- 사용자 상태/증상 기반 케어 루틴 선택
- 환경(욕조/부분입욕/샤워)별 적합 카드만 안내
- 서브프로토콜 선택 후 레시피로 빠르게 진입

### 2) 화면 구조 (상→하)
1. Header
- 타이틀: `케어 루틴`
- 서브카피: `증상과 컨디션에 맞춰 루틴을 골라보세요.`

2. Environment Chips
- `욕조` / `부분입욕` / `샤워`
- 선택 시 즉시 상태 반영 + `saveLastEnvironment`

3. 케어 루틴 섹션
- 타이틀: `케어 루틴`
- 카드: `CategoryCard` 1열 풀폭
- 카드 요소: 제목 / 환경 맞춤 서브텍스트 / fit label / safety badge

4. Disclosure
- `PersistentDisclosure` 고정 노출

5. Overlay
- `SubProtocolPickerModal`
- `PreBathGateModal` (레시피 화면 소유)

### 3) 상태 규칙
- 환경 미지원 카드: 비활성 + `현재 환경에선 제한적으로 추천돼요`
- 플레이스홀더 카드: 비활성 + `준비 중이에요`
- 고위험 fallback 시 safety badge 노출

### 4) 플로우
1. 카드 클릭
- 이벤트 기록(`trackIntentCardClick`)
- 서브프로토콜 모달 오픈

2. 서브프로토콜 선택
- `generateCareRecommendation` 생성
- `applySubProtocolOverrides` 적용
- `saveRecommendation` 저장
- `upsertSessionRecord` 저장

3. 레시피 진입
- 모든 추천은 즉시 레시피 이동
- 이동 경로: `/result/recipe/[id]?source=care`
- 레시피 화면에서 `PreBathGateModal`을 먼저 표시
- 위험 조건이 있으면 프리플라이트 항목이 추가됨

### 5) 텍스트 와이어프레임
```text
[Header]
  케어 루틴
  증상과 컨디션에 맞춰 루틴을 골라보세요.

[Environment Chips]
  [욕조] [부분입욕] [샤워]

[Section]
  케어 루틴

  [CategoryCard - full width]
    제목
    환경 맞춤 설명
    fit label / safety badge
    (비활성 시 안내문구)

  [CategoryCard - full width]
  ...

[Disclosure]
  안전 안내 문구

[Overlay]
  SubProtocolPickerModal
  (레시피 화면에서) PreBathGateModal
```

---

## Trip 탭
기준: `app/(tabs)/trip.tsx`

### 1) 목적
- 분위기/테마 중심 트립 루틴 선택
- 허용 환경(욕조/샤워) 안에서 몰입형 카드 탐색
- 서브프로토콜 반영 후 레시피 진입

### 2) 화면 구조 (상→하)
1. Header
- 타이틀: `트립 루틴`
- 서브카피: `어디로 떠나볼까요? 테마별 여행 같은 루틴이에요.`

2. Environment Chips
- `욕조 (Deep)` / `샤워 (Lite)`
- Trip 탭은 부분입욕 미지원

3. 테마 루틴 섹션
- 타이틀: `테마 루틴`
- 카드: `TripThemeCard` 2열 기본(폭 좁으면 1열)
- 카드 요소: 타이틀 / 서브텍스트 / fit label / safety badge

4. Disclosure
- `PersistentDisclosure` 고정 노출

5. Overlay
- `SubProtocolPickerModal`
- `PreBathGateModal` (레시피 화면 소유)

### 3) 상태 규칙
- 저장 환경이 trip 미지원이면 `bathtub` fallback
- 환경 미지원 카드 비활성 + `현재 환경에선 제한적으로 추천돼요`
- 고위험 fallback 시 safety badge 노출

### 4) 플로우
1. 카드 클릭
- 이벤트 기록 + 서브프로토콜 모달 오픈

2. 서브프로토콜 선택
- `generateTripRecommendation` 생성
- `applySubProtocolOverrides` 적용
- `saveRecommendation` + `upsertSessionRecord`

3. 레시피 진입
- 모든 추천은 즉시 레시피 이동
- 이동 경로: `/result/recipe/[id]?source=trip`
- 레시피 화면에서 `PreBathGateModal`을 먼저 표시
- 위험 조건이 있으면 프리플라이트 항목이 추가됨

### 5) 텍스트 와이어프레임
```text
[Header]
  트립 루틴
  어디로 떠나볼까요? 테마별 여행 같은 루틴이에요.

[Environment Chips]
  [욕조 (Deep)] [샤워 (Lite)]

[Section]
  테마 루틴

  [TripThemeCard] [TripThemeCard]
  [TripThemeCard] [TripThemeCard]
  (소형 화면: 1열)

[Disclosure]
  안전 안내 문구

[Overlay]
  SubProtocolPickerModal
  (레시피 화면에서) PreBathGateModal
```
