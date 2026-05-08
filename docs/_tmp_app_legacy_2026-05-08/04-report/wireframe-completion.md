# 종료(완료) 화면 와이어프레임 (현재 구현 기준)

기준: `app/result/completion/[id].tsx`

## 1) 목적
- 루틴 완료를 축하하고 완료 성과(월간 횟수)를 즉시 피드백
- 만족도(좋음/아쉬움) 입력 수집
- 히스토리/홈으로 자연스럽게 복귀

## 2) 화면 구조 (상→하)
1. 배경 레이어
- `GradientBackground` + 소프트 오버레이

2. 완료 헤더 영역
- 축하 이모지 `🎉`
- 스텝 배지: `완료`
- 시간대 기반 메시지(예: 아침/저녁 문구)

3. 월간 통계 카드
- `이번 달 N회 완료` 형태
- `N`은 추천 색상(`recommendation.colorHex`)으로 강조

4. 피드백 섹션
- 질문 타이틀(테마명 포함 가능)
- 버튼 2개: `👍 좋았어요` / `👎 아쉬워요`
- 선택 후 감사 문구 노출

5. 메모리 카드 (조건부)
- 표시 조건: `memoryNarrative` 존재 또는 `themeWeight !== null`
- 스냅샷 라인: 수온/시간/환경/완료 시각
- 선호도 가중치 라인(테마 있을 때)
- 회상 문구 라인(있을 때)

6. 하단 액션 버튼
- `기록 보기` (보조 버튼)
- `홈으로` (주 버튼)

## 3) 상태 규칙
- 데이터 로딩 중 또는 추천 없음:
  - 중앙 로딩 문구 표시 (`copy.completion.loading`)
- 진입 시 처리:
  - `saveCompletionMemory` 저장
  - `patchSessionRecord`로 완료 시간/실제 진행시간 반영
  - 월간 완료 횟수(`getMonthlyCount`) 로드
- 피드백:
  - 첫 선택만 허용(`feedback`이 있으면 버튼 비활성)
  - `updateRecommendationFeedback` + `patchSessionRecord(user_feeling_after)` 저장
  - 테마가 있으면 `applyFeedbackToThemePreference` 반영

## 4) 인터랙션 플로우
1. 진입
- 경로: `/result/completion/[id]`
- 추천/세션 데이터 로드 후 완료 메모리 저장 및 화면 구성

2. 피드백 선택
- `좋았어요` 또는 `아쉬워요` 1회 선택
- 저장 성공 후 감사 문구 표시

3. 버튼 이동
- `기록 보기`: `clearSession()` 후 `/(tabs)/history` replace
- `홈으로`: `clearSession()` 후 `/(tabs)` replace

## 5) 텍스트 와이어프레임
```text
[Pastel Gradient Background]

        🎉
      [완료]
   시간대 맞춤 완료 메시지

[월간 통계 카드]
  이번 달 [N]회 완료

[피드백]
  이번 루틴은 어땠나요?
  [👍 좋았어요]   [👎 아쉬워요]
  (선택 후) 감사합니다

[메모리 카드 - 조건부]
  스냅샷: 39°C · 15분 · 욕조 · 21:40 완료
  가중치: 테마명 +2
  회상: 다음엔 조명을 조금 더 낮춰보세요

[버튼]
  [기록 보기]
  [홈으로]
```
