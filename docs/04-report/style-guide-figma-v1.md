# BathSommelier 스타일 가이드 v1 (Figma Export 기반)

기준 이미지:
- `docs/04-report/figma-exports/인트로.png`
- `docs/04-report/figma-exports/온보딩.png`, `온보딩2.png`, `온보딩완료.png`
- `docs/04-report/figma-exports/홈.png`, `케어.png`, `트립.png`, `제품.png`
- `docs/04-report/figma-exports/레시피.png`, `타이머.png`, `완료.png`
- `docs/04-report/figma-exports/상세 모달.png`, `안전경고모달.png`
- `docs/04-report/figma-exports/프로필.png`, `설정.png`

## 1) 브랜드 비주얼 방향
- 베이스: 딥 네이비 그라디언트 배경
- 포인트: 웜 골드(CTA/선택/강조/진행상태)
- 표면: 반투명 블루-그레이 카드(글래스 느낌)
- 톤: 차분한 웰니스/프리미엄 무드, 고대비보다 저자극 대비

## 2) 컬러 시스템 (초안)
- `bg/base`: `#081636`~`#0B1B44` 계열
- `bg/surface`: `#132544`~`#1A2D4F` 계열
- `accent/gold`: `#C9A45B` (주요 버튼, 선택 상태, progress)
- `text/primary`: `#EEF3FF` 계열
- `text/secondary`: `#9AA9C4` 계열
- `border/soft`: `rgba(170, 190, 225, 0.18)` 계열
- `state/danger`: 안전 경고 텍스트는 앰버/레드 혼합 대신 앰버 중심 유지

## 3) 타이포 시스템 (초안)
- 앱 바 타이틀: 20~24, SemiBold/Bold
- 섹션 타이틀: 16~18, SemiBold
- 카드 타이틀: 15~17, Medium/SemiBold
- 본문: 13~15, Regular
- 캡션/메타: 11~12, Medium
- 원칙: 영어 라벨(예: `SAFETY GUIDELINES`)은 tracking 증가, 한글 본문은 tracking 최소

## 4) 공통 컴포넌트 규칙
- 버튼
  - Primary: 골드 배경 + 다크 텍스트 + 높이 52~56 + radius 14~18
  - Secondary: 네이비 표면 + 소프트 보더
- 카드
  - 배경: 반투명 네이비
  - 보더: 1px soft border
  - radius: 14~18
- 칩/필터
  - 기본: surface + muted text
  - 선택: gold fill 또는 gold border + high contrast text
- 하단 탭바
  - 아이콘/라벨 muted
  - active는 gold
- 모달
  - dim 배경 + 중앙 카드
  - 상단 타이틀, 본문 리스트, 하단 2버튼(취소/확인) 고정

## 5) 레이아웃/간격 규칙
- 좌우 기본 패딩: 20~24
- 주요 섹션 간격: 16~24
- 카드 내부 패딩: 12~16
- 목록 카드 간 간격: 10~14
- CTA와 하단 안전문구는 최소 12 이상 분리

## 6) 현재 시안에서 보인 흔들림(정리)
- 브랜드 표기/철자 불일치 (`BATH SOMMELIER` vs 깨진 표기)
- 문구 언어 혼용 (`START`, `MIO`, 한글 카피 혼재)
- 일부 화면의 라벨 규칙 불일치 (`홈`/`Home`, `제품`/`Shop`)
- 안전/경고 영역의 색상 톤이 화면마다 다름

## 7) 우선 수정 원칙 (실행 순서)
1. 브랜드/카피 통일
- 앱명, 탭명, 버튼 라벨, 경고 문구를 단일 사전으로 통일

2. 토큰 고정
- 배경/표면/골드/텍스트/보더 토큰을 코드 상수로 확정

3. 핵심 컴포넌트 통일
- `PrimaryButton`, `GlassCard`, `FilterChip`, `BottomTabItem`, `ModalShell` 규격 통일

4. 화면별 적용
- 온보딩 → 홈/케어/트립 → 레시피/타이머/완료 → 제품/프로필/설정 순서로 적용

## 8) 다음 작업 제안
- v1 토큰을 `src/data/colors.ts`에 매핑표로 정의
- 카피 사전(`src/content/copy.ts`)에 브랜드/탭/버튼 라벨 통합
- 화면 1개(예: 온보딩 Step 1)를 기준 레퍼런스로 먼저 정식 리디자인
