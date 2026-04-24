# Design System — 바스타임

## Product Context
- **What this is:** 오늘 상태와 환경에 맞춰 무리 없이 따라할 목욕·샤워 루틴을 안내하고, 타이머와 회고까지 이어주는 모바일 셀프케어 앱.
- **One-line definition:** 오늘 상태와 환경에 맞춰 무리 없이 따라할 목욕·샤워 루틴을 안내하는 앱.
- **Who it's for:** 입욕이나 샤워 루틴이 익숙하지 않지만, 오늘 바로 따라할 수 있는 쉬운 가이드를 원하는 20-40대 사용자.
- **Space/industry:** 데일리 셀프케어, 컨디션 기반 루틴, 안전한 목욕·샤워 가이드.
- **Project type:** 모바일 앱 중심의 컨디션별 루틴 가이드.

## Aesthetic Direction
- **Direction:** Everyday Bath Guide
- **Decoration level:** Intentional
- **Mood:** 편안하지만 들뜨지 않고, 전문적이지만 과시하지 않는다. 사용자는 화면을 볼 때 "오늘은 이렇게 하면 되겠구나"를 바로 알아야 한다.
- **Reference cues:** 생활형 셀프케어, 안전한 목욕 가이드, 차분한 기록 앱, 물과 증기의 깨끗한 감각.

## Logo System
- **Primary mark:** `assets/images/bathtime.svg`
- **Concept:** 물방울, 물의 흐름, 루틴의 순서를 하나의 심볼로 묶는다.
- **Usage:** 앱 헤더, 온보딩 완료, 앱 아이콘, 스플래시, 랜딩 첫 브랜드 신호에 사용한다.
- **Rule:** 작은 크기에서는 심볼만 사용하고, 설명 문구로 기능을 보완한다.

## Typography
- **Display/Hero:** System sans
  브랜드 헤드라인, 루틴 타이틀, 주요 섹션 제목도 산세리프로 유지한다.
- **Body/UI:** System sans / `sans-serif`
  설명, 버튼, 폼, 보조 카피는 모두 산세리프로 고정한다.
- **Data/Tables:** monospace fallback
  타이머, 수치, 진행 시간, 기록 데이터는 고정폭 계열을 쓴다.
- **Code:** `SpaceMono`
- **Scale:** Hero 34/40, section 20/26, card 18/24, body 14-15/20-23, caption 12/17-18

## Color
- **Approach:** Restrained
- **Primary background:** `#102629`
- **Top gradient:** `#193A3E`
- **Bottom gradient:** `#07191B`
- **Surface:** `rgba(22, 45, 48, 0.9)`
- **Surface soft:** `rgba(18, 39, 42, 0.76)`
- **Primary text:** `#F7F3EA`
- **Secondary text:** `#D7E1DC`
- **Muted text:** `#9FB5AF`
- **Accent / water:** `#94D2BF`
- **Accent soft:** `rgba(148, 210, 191, 0.16)`
- **Soft border:** `rgba(230, 246, 239, 0.14)`
- **Strong border:** `rgba(148, 210, 191, 0.42)`
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
- **Editorial moments:** 홈 히어로, 트립 카드, 바스타임 완료 화면에서만 에디토리얼 톤을 허용한다.
- **Border radius:** card 12, large card 16, button 14, pill full.
- **Grid:** 모바일 우선. 좌우 패딩 20-24를 기본으로 유지한다.

## Motion
- **Approach:** Minimal-functional
- **Use:** 페이드, 부드러운 등장, 진행 상태 피드백.
- **Avoid:** 과한 bounce, 쓸모없는 장식 전환, 의미 없는 패럴랙스.
- **Rule:** 물, 증기, 타이머처럼 제품의 본질과 닿는 곳에서만 감각적 모션을 사용한다.

## Voice In UI
- **Tone:** 생활형 셀프케어, 안전한 안내, 바로 실행할 수 있는 문장.
- **Do:** "오늘 상태에 맞는 루틴", "온도와 시간을 확인해요", "무리 없이 따라갈 수 있어요", "필요한 것만 준비해요"
- **Don't:** 몽환적 추상 카피, 과도한 힐링 문구, 고급 취향 과시, 전문가처럼 보이려는 표현, 루틴 완료 압박.

## Component Rules
- 카드 배경은 깨끗한 물안개 느낌으로 유지하되 과한 광택은 줄인다.
- water accent는 CTA, 선택 상태, 중요한 라벨에만 쓴다.
- 모든 텍스트는 산세리프를 기본으로 한다. 과거 제목용 serif 톤은 사용하지 않는다.
- 수치 정보와 타이머는 monospace 또는 tabular nums 우선.
- 섹션 제목은 화면 전체를 소리치지 말고, 조용하고 명확해야 한다.
- 사진은 배경과 맥락을 돕는 역할이다. 온도, 시간, 환경, 추천 이유의 정보 위계를 가리면 안 된다.
- 루틴 기록은 성취 압박이 아니라 쉼의 흐름으로 보여준다.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-07 | 초기 스파형 무드 채택 | 앱의 감각적 방향을 빠르게 검증하기 위해 |
| 2026-04-07 | 딥 스팀 배경 + 따뜻한 텍스트 팔레트 적용 | 목욕·샤워 앱의 조용한 분위기를 만들기 위해 |
| 2026-04-07 | 제목 강조형 타이포 구조 적용 | 초기 브랜드 인상을 빠르게 만들기 위해 |
| 2026-04-24 | Everyday Bath Guide로 브랜드 무게중심 이동 | 바스타임 이름에 맞춰 고급 취향 큐레이션보다 생활형 셀프케어와 쉬운 실행감을 우선하기 위해 |
