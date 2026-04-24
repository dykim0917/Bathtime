# UI Consistency Audit — 에이전트 설계서

버전: v0.1 (설계 초안)  
코드베이스 경로: `~/DK/BathSommelier`  
작성 목적: Claude Code 구현 참조용 계획서

---

## 1. 작업 컨텍스트

### 1.1 배경 및 목적

바스타임의 UI 자산(컬러 토큰·타이포·아이콘·카피 톤)이 코드베이스에 분산되어 있다.  
이 에이전트는 코드베이스를 읽어 GNB·페이지 톤·아이콘 스타일·타이포·카피의 일관성을 스냅샷 감사하고, 위반 항목과 수정 권고안을 문서로 생성한다. 코드를 직접 수정하지 않는다.

### 1.2 범위

| 포함 | 제외 |
|------|------|
| 컬러 토큰 사용 일관성 검사 | 코드 자동 수정 |
| 타이포 스케일 준수 검사 | Figma 노드 직접 비교 |
| GNB 아이콘 + 라벨 구조 검사 | 런타임 렌더링 검증 |
| Care/Trip 시각적 대비 유지 검사 | 스크린샷 비전 분석 |
| "쇼핑몰화" 방지 원칙 준수 검사 | 성능/접근성 감사 |
| 카피 톤 일관성 검사 (Care vs Trip 분리) | |
| 아이콘 스타일 일관성 검사 | |
| `icon_system_spec.md` 생성 | |

### 1.3 입력 정의

| 입력 | 형식 | 역할 |
|------|------|------|
| 코드베이스 | `~/DK/BathSommelier` | 감사 대상 소스 |
| UI 토큰 기준 | `src/data/colors.ts` | 컬러·타이포 정답 기준 |
| 디자인 스펙 문서 | `docs/WIREFRAME_V3_11_0.md` | 레이아웃·컴포넌트 기준 |
| PRD 브랜딩 원칙 | `docs/PRD_CURRENT.md` §13·§25·§27 | 카피 톤·쇼핑몰화 방지 원칙 |
| 스캔 대상 패턴 | `input/scan_targets.json` | 감사할 파일 경로 패턴 |

#### 스캔 대상 파일 (초기 목록)

```
src/data/colors.ts                     ← 토큰 정의 (정답 기준)
src/theme/ui.ts                        ← 공유 StyleSheet
app/(tabs)/index.tsx                   ← 홈 탭 (Care/Trip 배치)
app/(tabs)/history.tsx                 ← 기록 탭
app/(tabs)/settings.tsx                ← 설정 탭
app/onboarding/*.tsx                   ← 온보딩 화면들
app/result/recipe/[id].tsx             ← 레시피 상세
app/result/timer/[id].tsx              ← 타이머
app/result/completion/[id].tsx         ← 완료 화면
src/components/CategoryCard.tsx        ← 홈 인텐트 카드
src/components/SubProtocolPickerModal.tsx
src/components/PersistentDisclosure.tsx
docs/WIREFRAME_V3_11_0.md             ← 스펙 기준
docs/PRD_CURRENT.md                   ← 브랜딩 원칙
```

### 1.4 출력 정의

| 파일 | 내용 |
|------|------|
| `/output/ui_audit_report.md` | 감사 결과 전체 리포트 (위반 항목 + 수정 권고안) |
| `/output/icon_system_spec.md` | 현재 코드에서 추출한 아이콘 사용 현황 + 권고 스펙 |
| `/output/audit_findings.json` | 구조화된 위반 항목 목록 (심각도·파일·라인) |
| `/output/run_log.json` | 단계별 실행 로그 |

### 1.5 제약조건 (감사 기준)

| 원칙 | 기준 | 출처 |
|------|------|------|
| 쇼핑몰화 방지 | ProductHub CTA가 홈 primary entry로 노출되면 위반 | PRD §27.3 |
| Care/Trip 시각적 대비 | 두 모드가 동일한 컬러·톤으로 렌더링되면 위반 | PRD §25.1 |
| GNB 아이콘 + 라벨 유지 | GNB 3탭 아이콘·라벨 변경 또는 누락 시 위반 | Wireframe §1 |
| 토큰 직접 하드코딩 금지 | 컬러·폰트 값이 토큰 미사용 하드코딩이면 위반 | `colors.ts` 기준 |
| 타이포 스케일 준수 | Wireframe §2 타입 스케일 외 폰트 크기 사용 시 위반 | Wireframe §2 |
| 카피 톤 분리 | Trip 문맥에서 Care 의학 어휘 사용 시 위반 | PRD §13.4 |

### 1.6 위반 심각도 분류

| 레벨 | 기준 | 예시 |
|------|------|------|
| CRITICAL | 브랜딩 원칙·PRD 계약 위반 | 쇼핑몰화 위반, ProductHub 홈 승격 |
| ERROR | 토큰·스펙 불일치 (사용자 체감 영향) | 하드코딩 컬러, 타이포 이탈 |
| WARNING | 권고 미준수 (일관성 저하) | 아이콘 스타일 혼용, 톤 경계 모호 |
| INFO | 참고용 현황 (위반 아님) | 미사용 토큰, 중복 스타일 선언 |

### 1.7 용어 정의

| 용어 | 정의 |
|------|------|
| 토큰 | `src/data/colors.ts`에 정의된 컬러·타이포 상수 |
| 타이포 스케일 | Wireframe §2 기준 5단계 (HEADING_LG/MD, TITLE, BODY, CAPTION) |
| GNB | 하단 3탭 네비게이션 (홈·기록·설정) |
| 쇼핑몰화 | ProductHub가 홈 오케스트레이션을 대체하거나 primary entry가 되는 상태 |
| Care 톤 | 생리학·회복·안전 중심 문체 |
| Trip 톤 | 공간·분위기·몰입 중심 문체 — 의학 어휘 금지 |
| 하드코딩 | 토큰 미참조 직접 값 삽입 (예: `color: "#3A7BD5"`) |

---

## 2. 워크플로우 정의

### 2.1 전체 흐름도

```
[입력: 코드베이스 + colors.ts + WIREFRAME.md + PRD.md]
              │
              ▼
  STEP 1: 토큰·스펙 기준선 추출 (메인 에이전트)
  - colors.ts → 정답 토큰 목록
  - Wireframe §2 → 타이포 스케일 기준
  - PRD §13·§25·§27 → 브랜딩 원칙 추출
              │
              ▼
  STEP 2: 코드 정적 분석 [design-branding]
  - 토큰 사용 vs 하드코딩 감지
  - 타이포 스케일 준수 감지
  - GNB 구조 추출
  - 아이콘 사용 현황 추출
              │
              ▼
  STEP 3: 브랜딩 원칙 감사 [ux-critic]
  - Care/Trip 시각적 대비 검사
  - 쇼핑몰화 방지 원칙 준수 검사
  - 카피 톤 Care/Trip 분리 검사
  - GNB 아이콘+라벨 유지 검사
              │
              ▼
  STEP 4: 아이콘 시스템 분석 [design-branding]
  - 전체 아이콘 사용 현황 정규화
  - 스타일 일관성 판단 (라이브러리·크기·색상)
  - icon_system_spec.md 생성
              │
              ▼
  STEP 5: 감사 결과 통합 (메인 에이전트)
  - STEP 2~4 위반 항목 취합
  - 심각도 분류 및 중복 제거
  - audit_findings.json 저장
              │
              ▼
  STEP 6: 리포트 생성 [ux-critic]
  - ui_audit_report.md 작성
  - 위반 항목별 수정 권고안 서술
  - CRITICAL 항목 최상단 강조
              │
              ▼
[출력: ui_audit_report.md + icon_system_spec.md
        + audit_findings.json + run_log.json]
```

### 2.2 단계별 상세 정의

---

#### STEP 1. 토큰·스펙 기준선 추출

**담당**: 메인 에이전트  
**입력**: `src/data/colors.ts`, `docs/WIREFRAME_V3_11_0.md`, `docs/PRD_CURRENT.md`  
**출력**: 메모리 내 기준선 (토큰 목록·타이포 스케일·브랜딩 원칙)

**처리 내용**:

| 추출 항목 | 소스 | 담당 |
|-----------|------|------|
| 정의된 토큰 전체 목록 (이름·값) | `colors.ts` | 스크립트 |
| 타이포 스케일 5단계 (크기·굵기) | Wireframe §2 | LLM |
| 컴포넌트 패턴 정의 (버튼·카드·히어로) | Wireframe §2 | LLM |
| 쇼핑몰화 방지 기준 | PRD §27.3 | LLM |
| Care/Trip 대비 원칙 | PRD §25.1 | LLM |
| Trip 금지 어휘 목록 | PRD §13.4 | LLM |

**성공 기준**: 토큰 목록 파싱 오류 0건, 브랜딩 원칙 3개 이상 추출  
**검증 방법**: 스키마 검증 (토큰) + LLM 자기 검증 (원칙 추출 완비 여부)  
**실패 처리**: 파싱 오류 시 에스컬레이션 — 진행 불가

---

#### STEP 2. 코드 정적 분석

**담당**: `design-branding` 서브에이전트  
**입력**: `input/scan_targets.json` + 기준선 토큰 목록  
**출력**: `output/static_findings.json`

**처리 내용**:

| 감사 항목 | 담당 | 탐지 방법 |
|-----------|------|-----------|
| 하드코딩 컬러값 (`#xxxxxx`, `rgb()`) | 스크립트 | 정규식 전수 검사 |
| 하드코딩 폰트 크기 (토큰 미사용 `fontSize:`) | 스크립트 | 정규식 전수 검사 |
| 타이포 스케일 이탈 (스케일 외 크기 사용) | 스크립트 | 허용값 목록 비교 |
| 미정의 토큰 참조 (colors.ts 미존재 토큰) | 스크립트 | 토큰 목록 대조 |
| GNB 탭 수·라벨·아이콘 구조 | 스크립트 | 탭 컴포넌트 파싱 |
| 아이콘 사용 현황 (라이브러리·이름·크기) | 스크립트 | import·사용 패턴 추출 |
| `borderRadius` 비표준 값 사용 | 스크립트 | Wireframe 허용값 비교 |

**성공 기준**: 스캔 대상 파일 전부 처리, 파싱 에러 파일 목록 기록  
**검증 방법**: 규칙 기반 (스캔 파일 수 = 처리 파일 수)  
**실패 처리**:
- 파싱 불가 파일: 스킵 + 로그 기록
- 스캔 전체 실패: 에스컬레이션

---

#### STEP 3. 브랜딩 원칙 감사

**담당**: `ux-critic` 서브에이전트  
**입력**: 스캔 대상 파일 + 기준선 브랜딩 원칙  
**출력**: `output/branding_findings.json`

**감사 항목 및 판단 방식**:

| 감사 항목 | 담당 | 판단 기준 |
|-----------|------|-----------|
| 쇼핑몰화 방지 — ProductHub 위치 | LLM | ProductHub CTA가 홈 primary 영역에 있는지 |
| 쇼핑몰화 방지 — 커머스 우선 노출 | LLM | Home Orchestration 결과보다 상품 노출이 앞서는지 |
| Care/Trip 시각적 대비 | LLM | 두 모드가 동일 컬러 팔레트·톤으로 렌더링되는지 |
| Trip 카피 내 Care 의학 어휘 | 스크립트 + LLM | PRD §13.4 금지 어휘 1차 패턴 매칭 → 경계 표현 LLM 판단 |
| GNB 아이콘+라벨 3탭 유지 | 스크립트 | 탭 수·아이콘 존재·라벨 텍스트 확인 |
| 히어로 영역 그라디언트 패턴 | LLM | Wireframe §2 히어로 패턴 준수 여부 |

**성공 기준**: 브랜딩 원칙 6개 항목 전부 감사 완료  
**검증 방법**: LLM 자기 검증 (항목 누락 여부 재확인)  
**실패 처리**: 판단 불확실 항목은 WARNING으로 보수적 기록 + 에스컬레이션 표시

---

#### STEP 4. 아이콘 시스템 분석

**담당**: `design-branding` 서브에이전트  
**입력**: STEP 2에서 추출한 아이콘 사용 현황 (`output/static_findings.json`)  
**출력**: `output/icon_system_spec.md`

**처리 내용**:

| 분석 항목 | 담당 | 내용 |
|-----------|------|------|
| 사용 라이브러리 목록 | 스크립트 | import 경로 기준 집계 |
| 라이브러리 혼용 여부 | LLM | 복수 라이브러리 혼용 시 WARNING |
| 아이콘 크기 일관성 | 스크립트 | 사용 크기값 분포 집계 |
| GNB 아이콘 vs 인라인 아이콘 스타일 분리 | LLM | 용도별 스타일 일관성 판단 |
| 미사용 import 아이콘 | 스크립트 | import 후 미사용 탐지 |
| 권고 아이콘 시스템 스펙 | LLM | 현황 기반 표준화 권고안 작성 |

**`icon_system_spec.md` 구조**:
```markdown
# 아이콘 시스템 현황 및 권고 스펙

## 현황 요약
- 사용 라이브러리: @expo/vector-icons (FontAwesome)
- 사용 크기 분포: 16px(3), 20px(8), 24px(12), 44px(4)
- 혼용 이슈: (있으면 기술)

## GNB 아이콘 현황
| 탭 | 아이콘명 | 크기 | 라벨 |
...

## 인라인 아이콘 현황
...

## 권고 스펙
- 표준 크기 세트: ...
- 표준 라이브러리: ...
- 적용 원칙: ...
```

**성공 기준**: 아이콘 전수 목록 완성, GNB 아이콘 3개 전부 기재, 권고 스펙 섹션 포함  
**검증 방법**: 규칙 기반 (필수 섹션 존재) + LLM 자기 검증 (권고 품질)  
**실패 처리**: 섹션 누락 시 자동 재생성 1회

---

#### STEP 5. 감사 결과 통합

**담당**: 메인 에이전트  
**입력**: `output/static_findings.json`, `output/branding_findings.json`  
**출력**: `output/audit_findings.json`

**처리 내용**:
- STEP 2·3 위반 항목 병합
- 동일 파일·동일 위반의 중복 제거 (스크립트)
- 심각도 재분류 (STEP 1 기준선 기반, LLM 판단)
- 위반 수 집계 (심각도별)

**`audit_findings.json` 항목 구조**:
```json
{
  "run_id": "audit_20260227_001",
  "generated_at": "2026-02-27T00:00:00Z",
  "summary": {
    "CRITICAL": 1,
    "ERROR": 8,
    "WARNING": 5,
    "INFO": 3
  },
  "findings": [
    {
      "id": "f_001",
      "severity": "CRITICAL",
      "category": "branding",
      "rule": "쇼핑몰화 방지",
      "source_file": "app/(tabs)/index.tsx",
      "source_line": 87,
      "description": "ProductMatchingModal CTA가 홈 primary 영역에 직접 노출됩니다.",
      "current_value": "ProductMatchingModal 즉시 표시",
      "expected_value": "Home Orchestration 결과 이후 supporting layer로만 노출",
      "reference": "PRD §27.3",
      "recommendation": "ProductMatchingModal 호출을 secondary 액션으로 이동하고 primary는 CategoryCard 유지"
    }
  ]
}
```

**성공 기준**: STEP 2·3 전체 항목 반영, 중복 0건  
**검증 방법**: 규칙 기반 (입력 항목 수 ≥ 출력 항목 수)  
**실패 처리**: 병합 오류 시 자동 재시도 1회

---

#### STEP 6. 리포트 생성

**담당**: `ux-critic` 서브에이전트  
**입력**: `output/audit_findings.json`, `output/icon_system_spec.md`  
**출력**: `output/ui_audit_report.md`

**리포트 구조**:
```markdown
# UI Consistency Audit Report — [날짜]

## 요약
- CRITICAL: N건 / ERROR: N건 / WARNING: N건 / INFO: N건
- 핵심 위반 3줄 요약

## ⚠️ CRITICAL
### [파일명]
**위반**: [내용]  
**현재**: [현재값]  
**기대**: [기대값]  
**권고**: [수정 방법]

## 🔴 ERROR
...

## 🟡 WARNING
...

## ℹ️ INFO
...

## 아이콘 시스템
→ icon_system_spec.md 참조
```

**LLM 판단 영역**: 위반별 수정 권고안을 구체적·실행 가능한 문체로 서술  
**성공 기준**: CRITICAL·ERROR 항목 전부 수정 권고안 포함, 필수 섹션 존재  
**검증 방법**: 규칙 기반 (findings CRITICAL 수 = 리포트 CRITICAL 수) + LLM 자기 검증  
**실패 처리**: 수량 불일치 시 자동 재생성 1회 → 실패 시 에스컬레이션

---

### 2.3 분기 조건 요약

| 조건 | 처리 |
|------|------|
| 스캔 대상 파일 파싱 불가 | 스킵 + 로그 기록 |
| 브랜딩 원칙 판단 불확실 | WARNING 보수적 기록 + 에스컬레이션 표시 |
| STEP 2·3 중복 위반 항목 | 병합 후 단일 항목으로 처리 |
| 위반 항목 0건 | "이상 없음" 정상 완료 리포트 생성 |
| 기준선 추출 실패 | 진행 불가 + 에스컬레이션 |
| 아이콘 import 미발견 | INFO로 기록 후 진행 |

---

## 3. 구현 스펙

### 3.1 폴더 구조

```
/ui-consistency-audit
 ├── CLAUDE.md                              # 메인 에이전트 지침 (오케스트레이터)
 │
 ├── /.claude
 │   ├── /agents
 │   │   ├── /design-branding
 │   │   │   └── AGENT.md                  # 정적 분석 + 아이콘 시스템 서브에이전트
 │   │   └── /ux-critic
 │   │       └── AGENT.md                  # 브랜딩 원칙 감사 + 리포트 생성 서브에이전트
 │   │
 │   └── /skills
 │       ├── /token-scanner
 │       │   ├── SKILL.md
 │       │   └── /scripts
 │       │       ├── scan_hardcoded.py      # 하드코딩 컬러·폰트 정규식 전수 검사
 │       │       └── extract_tokens.py     # colors.ts 토큰 목록 파싱
 │       │
 │       ├── /component-parser
 │       │   ├── SKILL.md
 │       │   └── /scripts
 │       │       ├── parse_gnb.py           # GNB 탭 구조 추출
 │       │       └── extract_icons.py      # 아이콘 import·사용 현황 추출
 │       │
 │       ├── /copy-scanner
 │       │   ├── SKILL.md
 │       │   └── /scripts
 │       │       └── scan_trip_copy.py     # Trip 문맥 내 Care 어휘 1차 패턴 매칭
 │       │
 │       └── /report-assembler
 │           ├── SKILL.md
 │           └── /scripts
 │               └── merge_findings.py     # STEP 2·3 위반 항목 병합·중복 제거
 │
 ├── /input
 │   └── scan_targets.json                 # 스캔 대상 파일 경로 패턴
 │
 ├── /output
 │   ├── static_findings.json              # STEP 2: 정적 분석 결과
 │   ├── branding_findings.json            # STEP 3: 브랜딩 원칙 감사 결과
 │   ├── audit_findings.json               # STEP 5: 통합 위반 목록
 │   ├── ui_audit_report.md               # STEP 6: 최종 리포트
 │   ├── icon_system_spec.md              # STEP 4: 아이콘 시스템 현황 + 권고
 │   └── run_log.json                      # 실행 로그
 │
 └── /docs
     ├── branding_principles.md            # PRD §13·§25·§27 브랜딩 원칙 발췌
     └── token_reference.md               # colors.ts 토큰 레퍼런스 (자동 생성)
```

### 3.2 CLAUDE.md 핵심 섹션 목록

| 섹션 | 내용 |
|------|------|
| 역할 및 목적 | 스냅샷 감사 오케스트레이터, 코드 수정 금지 원칙 |
| 코드베이스 경로 | `~/DK/BathSommelier` 읽기 전용 접근 |
| 심각도 정책 | CRITICAL/ERROR/WARNING/INFO 분류 기준 |
| 쇼핑몰화 방지 최우선 원칙 | CRITICAL 항목 — 재확인 필수 |
| 워크플로우 순서 | STEP 1~6 및 서브에이전트 호출 시점 |
| 실패 처리 정책 | 단계별 재시도 횟수·에스컬레이션 조건 |
| 산출물 명세 | 파일별 역할·저장 경로 |

### 3.3 에이전트 구조

**구조 선택 근거**: 서브에이전트 분리

- 정적 코드 분석(도메인: 토큰·컴포넌트 파싱·아이콘 시스템)과 브랜딩 원칙 감사(도메인: UX 비평·카피 톤·PRD 원칙 해석)가 명확히 분리됨
- `design-branding`은 코드 파일을 직접 읽고, `ux-critic`은 분석 결과를 해석하고 서술 — 컨텍스트 격리로 품질 유지

```
메인 에이전트 (CLAUDE.md) — 오케스트레이터
    │
    ├──→ design-branding   (STEP 2: 정적 분석 + STEP 4: 아이콘 시스템)
    └──→ ux-critic         (STEP 3: 브랜딩 원칙 감사 + STEP 6: 리포트 생성)

    STEP 1, 5는 메인 에이전트 직접 처리
```

### 3.4 서브에이전트 정의

#### design-branding

| 항목 | 내용 |
|------|------|
| 역할 | (1) STEP 2: 토큰·타이포·GNB·아이콘 정적 분석 → (2) STEP 4: 아이콘 시스템 스펙 생성 |
| 트리거 조건 (STEP 2) | STEP 1 기준선 추출 완료 후 |
| 트리거 조건 (STEP 4) | `static_findings.json` 생성 완료 후 |
| 입력 (STEP 2) | `input/scan_targets.json` + 기준선 토큰 목록 (인라인) |
| 입력 (STEP 4) | `output/static_findings.json` (아이콘 현황 섹션) |
| 출력 (STEP 2) | `output/static_findings.json` |
| 출력 (STEP 4) | `output/icon_system_spec.md` |
| 참조 스킬 | `token-scanner`, `component-parser` |
| LLM 판단 영역 | 아이콘 스타일 혼용 판단, 권고 스펙 작성 |

#### ux-critic

| 항목 | 내용 |
|------|------|
| 역할 | (1) STEP 3: 브랜딩 원칙 감사 → (2) STEP 6: 최종 리포트 생성 |
| 트리거 조건 (STEP 3) | `static_findings.json` 생성 완료 후 |
| 트리거 조건 (STEP 6) | `audit_findings.json` 생성 완료 후 |
| 입력 (STEP 3) | 스캔 대상 파일 + 기준선 브랜딩 원칙 (인라인) |
| 입력 (STEP 6) | `output/audit_findings.json`, `output/icon_system_spec.md` |
| 출력 (STEP 3) | `output/branding_findings.json` |
| 출력 (STEP 6) | `output/ui_audit_report.md` |
| 참조 스킬 | `copy-scanner` (STEP 3), `report-assembler` (STEP 6) |
| LLM 판단 영역 | 쇼핑몰화 판단, Care/Trip 대비 판단, 수정 권고안 서술 |

### 3.5 스킬 목록

| 스킬명 | 역할 | 트리거 조건 |
|--------|------|-------------|
| `token-scanner` | 하드코딩 컬러·폰트 정규식 검사, `colors.ts` 토큰 파싱 | STEP 2 진입 시 |
| `component-parser` | GNB 탭 구조·아이콘 import·사용 현황 추출 | STEP 2 진입 시 |
| `copy-scanner` | Trip 문맥 내 Care 의학 어휘 1차 패턴 매칭 | STEP 3 진입 시 |
| `report-assembler` | STEP 2·3 위반 항목 병합·중복 제거·집계 | STEP 5 진입 시 |

### 3.6 데이터 전달 방식

**파일 기반 전달** (STEP 2 이후)

```
static_findings.json   ─→  STEP 4 (design-branding 재호출)
                       ─→  STEP 5 (메인 에이전트 병합)
branding_findings.json ─→  STEP 5 (메인 에이전트 병합)
audit_findings.json    ─→  STEP 6 (ux-critic 리포트 생성)
```

**인라인 전달** (소량)

- STEP 1 추출 기준선 (토큰 목록·브랜딩 원칙) → STEP 2·3 각 에이전트에 인라인 전달

### 3.7 주요 산출물 파일 형식

상세 구조는 §2.2 각 STEP의 예시 참조.  
핵심 파일별 역할 요약:

| 파일 | 생성 단계 | 용도 |
|------|-----------|------|
| `static_findings.json` | STEP 2 | 정적 분석 원시 결과 (내부 중간 산출물) |
| `branding_findings.json` | STEP 3 | 브랜딩 감사 원시 결과 (내부 중간 산출물) |
| `audit_findings.json` | STEP 5 | 최종 통합 위반 목록 (개발자 참조용) |
| `ui_audit_report.md` | STEP 6 | 사람이 읽는 최종 리포트 |
| `icon_system_spec.md` | STEP 4 | 아이콘 현황 + 권고 스펙 |

---

## 4. 오픈 이슈 (구현 전 확인 필요)

| 번호 | 이슈 | 영향 범위 |
|------|------|-----------|
| 1 | Care/Trip 시각적 대비 판단 기준 미정 — 어느 수준에서 "대비 부족"으로 볼지 정량 기준 없음. 구현 시 LLM 판단 프롬프트에 예시 케이스(OK/NG) 포함 권장 | STEP 3 |
| 2 | `scan_targets.json` 초기 파일 목록 확정 필요 — 코드베이스 탐색 후 누락 파일 보완 | STEP 2 전체 |
| 3 | Trip 카피 문맥 판단 범위 — Trip 섹션 외부(홈 탭 전체)의 카피도 스캔 대상에 포함할지 여부 | STEP 3, `copy-scanner` |

---

*설계서 v0.1 — 1회성 스냅샷 감사, 코드베이스 중심 분석 기준 확정 반영*
