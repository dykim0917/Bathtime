# 타이머 화면 와이어프레임 (현재 구현 기준)

기준: `app/result/timer/[id].tsx`

## 1) 목적
- 루틴 진행 시간을 몰입형 화면에서 실시간 안내
- 일시정지/재개, 즉시 완료, 오디오 믹싱 제어 제공
- 진행 종료 시 완료 화면으로 자연스럽게 전환

## 2) 화면 구조 (상→하)
1. 배경 레이어
- 전체 배경 그라디언트
- 환경 분기 애니메이션:
  - 샤워 계열: `SteamAnimation`
  - 그 외: `WaterAnimation(progress)`

2. 상단 바
- 우측 `완료` Pill 버튼 (`timerFinish`)
- 탭 시 즉시 완료 처리

3. 중앙 타이머 영역
- 루틴명(Trip 테마명 또는 실행 단계 라벨)
- 대형 타이머 텍스트 `MM:SS`
- 일시정지 상태일 때 `일시정지` 라벨 표시

4. 하단 컨트롤 영역 (탭 토글)
- 원형 Play/Pause 버튼
- 진행 바(채움 + 썸)
- 경과시간 / 총시간 레이블
- `AudioMixer` (음악/앰비언스 볼륨)

5. Disclosure
- `PersistentDisclosure(lines=timerDisclosureLines)`

## 3) 상태 규칙
- 데이터 로딩 중 또는 추천 없음:
  - 중앙 로딩 문구 표시 (`copy.completion.loading`)
- 세션 시작:
  - `saveSession({ recommendationId, startedAt })` 1회 저장
  - 오디오 자동 재생 + 타이머 tick 시작
- 일시정지:
  - 타이머 정지, 오디오 pause, 남은 시간 고정
- 재개:
  - 누적 pause 시간 반영 후 tick 재시작, 오디오 play
- 완료:
  - 남은 시간이 0이 되거나 `완료` 버튼 탭 시 종료
  - `updateSessionCompletion(id, completedAt, actualDurationSeconds)`
  - `/result/completion/[id]`로 replace

## 4) 인터랙션 플로우
1. 진입
- 경로: `/result/timer/[id]`
- 추천 로드 후 `durationMinutes` 기준 총 시간 초기화

2. 자동 시작
- 진입 직후 세션 저장
- 오디오 재생 + 250ms 간격 타이머 업데이트

3. 전체 화면 탭
- 컨트롤 영역 표시/숨김 토글 (fade 애니메이션)

4. 일시정지/재개 버튼
- Pause: 아이콘 `pause` → `play`로 변경
- Resume: `play` → `pause`
- 햅틱 피드백 발생

5. 완료 분기
- 자동 완료(00:00 도달): 성공 햅틱 후 완료 화면 이동
- 수동 완료(`완료` 버튼): 즉시 완료 화면 이동

## 5) 텍스트 와이어프레임
```text
[Immersive Background]
  Gradient + Water/Steam Animation

[Top Bar]
                                [완료]

[Center]
  루틴명
  12:34
  (일시정지 시) 일시정지

[Controls - tap으로 show/hide]
  [  Play/Pause 원형 버튼  ]

  [진행 바----------------o]
   02:26                 15:00

  [AudioMixer]
   음악 볼륨 슬라이더
   앰비언스 볼륨 슬라이더

[Disclosure]
  고정 안전 고지
```
