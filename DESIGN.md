# Design System — Bath Time

## Product Context
- **What this is:** 컨디션과 목욕 환경에 맞춰 더 잘 쉬는 목욕·샤워 루틴을 추천하고, 타이머와 회고까지 이어주는 모바일 웰니스 앱.
- **Who it's for:** 웰니스에 시간과 돈을 쓰려는 20-40대 일반 소비자 중, 입문자에 가까운 실용형 사용자.
- **Space/industry:** 홈 스파, 데일리 셀프케어, 컨디션 기반 루틴, 부티크 배스 어메니티와 맞닿아 있는 프리미엄 웰니스.
- **Project type:** 모바일 앱 중심의 컨디션별 루틴 가이드.

## Aesthetic Direction
- **Direction:** Calm Ritual Intelligence
- **Decoration level:** Intentional
- **Mood:** 전문적으로 설계됐지만 어렵지 않고, 조용히 따라가면 더 잘 쉬게 되는 느낌. 향과 물성의 여백은 유지하되, 사용자는 언제나 오늘 상태에 맞는 다음 행동을 분명히 알아야 한다.
- **Reference cues:** 데일리 리추얼 코치, 홈 스파, 프리미엄 어메니티, 안전한 웰니스 가이드, 차분한 기록 앱.

## Typography
- **Display/Hero:** `Georgia` 계열 serif fallback
  브랜드 헤드라인, 루틴 타이틀, 주요 섹션 제목에만 사용한다.
- **Body/UI:** System sans / `sans-serif`
  설명, 버튼, 폼, 보조 카피는 모두 산세리프로 고정한다.
- **Data/Tables:** monospace fallback
  타이머, 수치, 진행 시간, 기록 데이터는 고정폭 계열을 쓴다.
- **Code:** `SpaceMono`
- **Scale:** Hero 34/40, section 20/26, card 18/24, body 14-15/20-23, caption 12/17-18

## Color
- **Approach:** Restrained
- **Primary background:** `#101920`
- **Top gradient:** `#1A252E`
- **Bottom gradient:** `#0A1117`
- **Surface:** `rgba(23, 33, 42, 0.88)`
- **Surface soft:** `rgba(19, 28, 36, 0.76)`
- **Primary text:** `#F5F0E8`
- **Secondary text:** `#D7CCBC`
- **Muted text:** `#9E9488`
- **Accent / brass:** `#B08D57`
- **Accent soft:** `rgba(176, 141, 87, 0.14)`
- **Stone border:** `rgba(245, 240, 232, 0.12)`
- **Strong border:** `rgba(176, 141, 87, 0.38)`
- **Semantic:** warning `#CAA071`, danger `#C28676`
- **Dark mode strategy:** 이 앱은 dark-steam baseline 하나로 운영한다. 별도 라이트 모드를 억지로 확장하지 않는다.

## Spacing
- **Base unit:** 4px
- **Density:** Comfortable
- **Scale:** 4, 8, 12, 16, 20, 24, 32, 40
- **Rule:** 버튼과 카드 내부 패딩은 기존보다 약간 넓게 가져간다.

## Layout
- **Approach:** Hybrid
- **App shell:** 정돈된 단일 컬럼과 안정적인 루틴 카드 스택.
- **Editorial moments:** 홈 히어로, 트립 카드, 배스타임 완료 화면에서만 에디토리얼 톤을 허용한다.
- **Border radius:** card 24, large card 30, button 18, pill full.
- **Grid:** 모바일 우선. 좌우 패딩 20-24를 기본으로 유지한다.

## Motion
- **Approach:** Minimal-functional
- **Use:** 페이드, 부드러운 등장, 진행 상태 피드백.
- **Avoid:** 과한 bounce, 쓸모없는 장식 전환, 의미 없는 패럴랙스.
- **Rule:** 물, 증기, 타이머처럼 제품의 본질과 닿는 곳에서만 감각적 모션을 사용한다.

## Voice In UI
- **Tone:** 전문성 있는 안내, 부담 없는 실행, 잘 쉬었다는 감각.
- **Do:** "오늘 상태에 맞춘 배스타임", "온도와 시간을 맞춰드려요", "무리 없이 따라갈 수 있어요", "잘 쉬었습니다"
- **Don't:** 몽환적 추상 카피, 과도한 힐링 문구, 럭셔리 과시, 루틴 완료 압박.

## Component Rules
- 카드 배경은 유리보다 스톤에 가깝게. 투명도는 있어도 반짝임은 줄인다.
- brass accent는 CTA, 선택 상태, 중요한 라벨에만 쓴다.
- serif는 브랜드와 제목에만. 본문과 조작 요소는 항상 sans.
- 수치 정보와 타이머는 monospace 또는 tabular nums 우선.
- 섹션 제목은 화면 전체를 소리치지 말고, 조용하게 고급스러워야 한다.
- 감성 사진은 배경과 맥락을 돕는 역할이다. 온도, 시간, 환경, 추천 이유의 정보 위계를 가리면 안 된다.
- 루틴 기록은 성취 압박이 아니라 쉼의 흐름으로 보여준다.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-07 | Quiet Luxury Spa 방향 채택 | 기존 Silent Moon 계열 무드를 유지하면서도 명상 앱 복제처럼 보이지 않게 하기 위해 |
| 2026-04-07 | Deep steam navy + brass + warm ivory 팔레트로 정리 | 파스텔 계열과 딥 네이비 계열이 섞여 있던 문제를 하나의 브랜드 언어로 묶기 위해 |
| 2026-04-07 | Display serif + clean sans 이중 구조 적용 | 프리미엄 감성과 실용적 코치 톤을 동시에 유지하기 위해 |
| 2026-04-22 | Calm Ritual Intelligence로 브랜드 무게중심 이동 | 감성 목욕 콘텐츠가 아니라 전문적으로 설계된 루틴으로 더 잘 쉬게 돕는 앱이라는 차별점을 강화하기 위해 |
