# Trip Content Pack Generator — 에이전트 설계서

버전: v0.1 (설계 초안)  
기준 PRD: ë°°ì°íì PRD v3.11.0 §25 (Trip Immersion Engine)  
작성 목적: Claude Code 구현 참조용 계획서

---

## 1. 작업 컨텍스트

### 1.1 배경 및 목적

ë°°ì°íì TripEngine의 콘텐츠 자산(서사·사운드·비주얼·CTA)을 테마별로 생성하고 Content Bible에 누적한다.  
콘텐츠는 Lite(3~7분)·Deep(10~20분) 두 깊이로 분리 생성되며, Trip Copy Firewall을 통과한 것만 확정된다.  
배치 실행 방식으로 여러 테마를 한 번에 처리하고, 테마 간 사운드 레이어 중복 등 일관성 문제를 탐지한다.

### 1.2 범위

| 포함 | 제외 |
|------|------|
| Lite/Deep 콘텐츠 패키지 생성 (서사·사운드·비주얼·CTA) | 실제 오디오 파일 생성 |
| Trip Copy Firewall 검증 (금지/허용 어휘) | 이미지/영상 에셋 생성 |
| 테마 간 사운드 레이어 일관성 검증 | 앱 코드 연동 |
| Content Bible append 누적 | 사용자 개인화 로직 |
| 배치 처리 (복수 테마 동시 실행) | |

### 1.3 입력 정의

| 입력 | 형식 | 역할 |
|------|------|------|
| 테마 리스트 | `input/theme_list.json` | 생성 대상 테마 목록 + 카테고리(Nature/Urban/Cozy 등) |
| ThemeProfile 템플릿 | `input/theme_profile_template.json` | 각 테마가 채워야 할 필드 구조 |
| Trip Copy Firewall 룰 | `input/copy_firewall_rules.json` | 금지 어휘 목록 + 허용 어휘 목록 (PRD §13.4 기준) |
| 기존 Content Bible | `output/trip_content_bible.md` | 일관성 검증 및 append 대상 (없으면 신규 생성) |

### 1.4 출력 정의

| 파일 | 내용 |
|------|------|
| `/output/trip_content_pack_<theme>.json` | 테마별 콘텐츠 패키지 (Lite + Deep) |
| `/output/trip_content_bible.md` | 전체 테마 누적 Content Bible (append) |
| `/output/consistency_report.json` | 테마 간 일관성 검증 결과 |
| `/output/rejected_contents.json` | Firewall 탈락 콘텐츠 + 탈락 사유 |
| `/output/run_log.json` | 배치 실행 로그 (테마별 상태) |

### 1.5 제약조건

| 제약 | 내용 |
|------|------|
| 금지 어휘 | 의학/효능/자율신경 단어 금지 (PRD §13.4 Trip Copy Firewall) |
| 허용 어휘 | 공간·분위기·몰입·전환·여정·잔광·파동·숨결·온기·차분함·리듬 |
| 시간 범위 | Lite: 3~7분, Deep: 10~20분 — 범위 이탈 시 오류 |
| 사운드 레이어 수 | 최소 2개, 최대 3개 — 위반 시 재생성 |
| 서사 문장 수 | Deep: 1~2문장 고정 (PRD §25.6) |
| 사운드 레이어 중복 | 동일 레이어 조합이 3개 이상 테마에서 반복되면 일관성 경고 |
| Firewall 통과 | 탈락 콘텐츠는 수정 제안 포함, 재생성 1회 시도 |

### 1.6 용어 정의

| 용어 | 정의 |
|------|------|
| ThemeProfile | PRD §25.2에 정의된 테마 데이터 계약 (서사·사운드·조명·향·온도무드·물동작·비주얼) |
| TripImmersionStrategy | PRD §25.3 — 몰입 깊이(Lite/Deep), 오디오·비주얼 전략, 인터랙션 밀도 |
| Lite | 샤워 기본 Trip — 3~7분, 리듬 전환 중심, 모션 최소화 |
| Deep | 입욕/부분 입욕 기본 Trip — 10~20분, 서사 기반 진행, 감각 레이어 확장 |
| 사운드 레이어 | 배경음 구성 단위 (자연음·ASMR·앰비언트 등 2~3개 조합) |
| Content Bible | 모든 테마의 확정 콘텐츠를 누적하는 마스터 문서 |
| Copy Firewall | PRD §13.4 — Trip 전용 금지/허용 어휘 규칙 |
| 일관성 검증 | 신규 테마와 기존 테마 간 사운드 중복·서사 톤 충돌 탐지 |

---

## 2. 워크플로우 정의

### 2.1 전체 흐름도

```
[입력: theme_list.json + theme_profile_template.json
        + copy_firewall_rules.json + 기존 bible.md]
              │
              ▼
  STEP 1: 배치 초기화 (메인 에이전트)
  - 테마 리스트 파싱, 실행 큐 구성
  - 기존 Content Bible 로드 (일관성 기준선)
  - 테마별 실행 상태 초기화 → run_log.json 생성
              │
              ▼
  ┌──────────────────────────────────────┐
  │  테마별 반복 (theme_list의 각 테마)  │
  │                                      │
  │  STEP 2: 콘텐츠 생성 [trip-creative] │
  │  - Lite 패키지 생성                  │
  │  - Deep 패키지 생성                  │
  │  - ThemeProfile 전 필드 채우기       │
  │               │                      │
  │               ▼                      │
  │  STEP 3: 사운드 레이어 설계          │
  │          [sound-designer]            │
  │  - 레이어 2~3개 구성                 │
  │  - 기존 테마와 중복 예비 체크        │
  │               │                      │
  │               ▼                      │
  │  STEP 4: Copy Firewall 검증          │
  │          [copy-firewall]             │
  │  - 금지 어휘 패턴 매칭 (스크립트)   │
  │  - 경계 표현 LLM 판단               │
  │  - 탈락 시 재생성 1회               │
  │               │                      │
  │               ▼                      │
  │  STEP 5: 스키마 검증 (메인 에이전트) │
  │  - 시간 범위, 레이어 수 확인         │
  │  - 필수 필드 완비 확인               │
  │  - 통과 시 pack_<theme>.json 저장    │
  │                                      │
  └──────────────────────────────────────┘
              │
              ▼
  STEP 6: 일관성 검증 (메인 에이전트)
  - 전체 배치 완료 후 사운드 레이어 중복 탐지
  - 서사 톤 충돌 탐지
  - consistency_report.json 저장
              │
              ▼
  STEP 7: Content Bible append (메인 에이전트)
  - 통과 테마만 bible.md에 추가
  - 일관성 경고 테마는 주석 표시 후 추가
              │
              ▼
[출력: trip_content_pack_<theme>.json (테마별)
        + trip_content_bible.md (누적)
        + consistency_report.json
        + rejected_contents.json + run_log.json]
```

### 2.2 단계별 상세 정의

---

#### STEP 1. 배치 초기화

**담당**: 메인 에이전트  
**입력**: `input/theme_list.json`, `output/trip_content_bible.md` (존재 시)  
**출력**: `output/run_log.json` (초기화), 메모리 내 기준선 데이터

**처리 내용**:
- 테마 리스트 파싱 (이름·카테고리·환경 기본값)
- 기존 Content Bible에서 확정 테마 목록 및 사운드 레이어 현황 추출 → 일관성 기준선
- 이미 생성된 테마(`pack_<theme>.json` 존재 시) 스킵 목록 구성
- 실행 큐 순서 결정 (카테고리별 묶음 처리 권장)

**성공 기준**: 테마 리스트 파싱 오류 0건, 실행 큐 구성 완료  
**검증 방법**: 스키마 검증  
**실패 처리**: 파싱 오류 시 에스컬레이션 (theme_list.json 수정 요청) — 진행 불가

---

#### STEP 2. 콘텐츠 생성

**담당**: `trip-creative` 서브에이전트  
**입력**: 테마 1개 정보 (이름·카테고리·환경) + `input/theme_profile_template.json`  
**출력**: `output/draft_<theme>.json` (미검증 초안)

**처리 내용 (LLM 판단)**:

| 생성 항목 | Lite | Deep |
|-----------|------|------|
| narrative_description | 1문장, 리듬 전환 중심 | 1~2문장, 서사 기반 몰입 |
| lighting_profile | 미묘한 색 변화 중심 | 그라디언트·증기 연출 확장 |
| scent_profile | 테마 연상 향 1~2개 | 테마 연상 향 2~3개 |
| temperature_mood | 간결한 온도 무드 서술 | 세밀한 온도 변화 서술 |
| water_behavior_style | 단순 리듬 묘사 | 파동·흐름 서술 확장 |
| visual_motion_style | 최소화 | 풀 레이어 연출 |
| trip_cta_copy | 테마형 CTA 1개 (PRD §11.3) | 테마형 CTA 1개 |
| time_expectation | 3~7분 명시 | 10~20분 명시 |
| interaction_density | 낮음 | 높음 |

**성공 기준**: ThemeProfile 전 필드 채워짐, Lite/Deep 모두 생성  
**검증 방법**: LLM 자기 검증 (서사 톤이 Copy Firewall 허용 어휘 중심인지 1차 자기 확인)  
**실패 처리**: 자동 재생성 1회 → 실패 시 스킵 + 로그

---

#### STEP 3. 사운드 레이어 설계

**담당**: `sound-designer` 서브에이전트  
**입력**: `output/draft_<theme>.json` + 기존 테마 사운드 레이어 현황 (기준선)  
**출력**: `output/draft_<theme>.json` 에 `ambient_sound_layer` 필드 추가

**처리 내용**:

| 항목 | 담당 | 내용 |
|------|------|------|
| 레이어 2~3개 선정 | LLM | 테마 연상 사운드 조합 (자연음·ASMR·앰비언트 등) |
| 레이어별 볼륨 비율 | LLM | 주(primary)·보조(secondary) 비율 제안 |
| 샤워 환경 물소리 충돌 방지 | LLM | Lite에서 물소리 과잉 레이어 제거 (PRD §25.7) |
| 기존 테마 사전 유사도 체크 | LLM | 기존 레이어 현황과 의미적으로 유사한 레이어 과잉 사용 여부 예비 판단 |

**사운드 레이어 예시 구조**:
```
ambient_sound_layer: [
  { layer: "forest_rain", role: "primary", volume_ratio: 0.6 },
  { layer: "distant_thunder", role: "secondary", volume_ratio: 0.3 },
  { layer: "wind_through_trees", role: "accent", volume_ratio: 0.1 }
]
```

**성공 기준**: 레이어 수 2~3개, 볼륨 비율 합계 1.0  
**검증 방법**: 스키마 검증 + 규칙 기반 (수량·비율)  
**실패 처리**:
- 레이어 수 위반: 자동 재생성 1회
- 재시도 후도 위반: 에스컬레이션

---

#### STEP 4. Copy Firewall 검증

**담당**: `copy-firewall` 서브에이전트  
**입력**: `output/draft_<theme>.json` + `input/copy_firewall_rules.json`  
**출력**: 통과 시 `output/draft_<theme>.json` 확정 / 탈락 시 `output/rejected_contents.json` 추가

**처리 방식**:

| 단계 | 담당 | 내용 |
|------|------|------|
| 1차 패턴 매칭 | 스크립트 | 금지 어휘 정규식 전수 검사 |
| 2차 경계 판단 | LLM | 패턴 미매칭이지만 의미상 금지 어휘 해당 여부 |
| 수정 제안 | LLM | 금지 표현 → PRD §13.3 허용 표현으로 변환 제안 |
| 재생성 트리거 | 메인 에이전트 | 탈락 시 trip-creative에 수정 제안 전달 후 재생성 1회 요청 |

**금지 어휘 (PRD §13.4)**:
```
혈류, 자율신경, 치료/개선 수치 단정, 면역, 호르몬,
노폐물, 효능 보장, 의학적 단정 표현
```

**탈락 기준**: 금지 어휘 1개 이상 (1차 또는 2차) → 재생성 1회 시도  
**2차 탈락 시**: `rejected_contents.json` 최종 이동 + 수정 제안 병기  
**성공 기준**: 통과 콘텐츠 금지 어휘 0건  
**검증 방법**: 스크립트 (1차) + LLM (2차)  
**실패 처리**: 재생성 1회 → 2차 탈락 시 rejected 처리 + 스킵

---

#### STEP 5. 스키마 검증

**담당**: 메인 에이전트 + 스크립트  
**입력**: Firewall 통과한 `output/draft_<theme>.json`  
**출력**: `output/trip_content_pack_<theme>.json` (확정)

**검증 항목**:

| 항목 | 기준 | 담당 |
|------|------|------|
| time_expectation 범위 | Lite: 3~7분, Deep: 10~20분 | 스크립트 |
| ambient_sound_layer 수 | 2~3개 | 스크립트 |
| narrative_description 문장 수 | Deep: 1~2문장 | LLM |
| ThemeProfile 필수 필드 완비 | 템플릿 기준 | 스크립트 |
| trip_cta_copy 존재 | Lite/Deep 각 1개 | 스크립트 |

**성공 기준**: 전 검증 항목 통과  
**검증 방법**: 규칙 기반 + LLM 자기 검증 (서사 문장 수)  
**실패 처리**: 항목별 자동 수정 후 재검증 1회 → 재실패 시 에스컬레이션

---

#### STEP 6. 일관성 검증

**담당**: 메인 에이전트  
**입력**: 배치 내 전체 `trip_content_pack_<theme>.json` + 기존 Bible 기준선  
**출력**: `output/consistency_report.json`

**검증 항목**:

| 항목 | 기준 | 심각도 |
|------|------|--------|
| 사운드 레이어 의미적 중복 | LLM이 유사 레이어로 판단한 조합이 3개 이상 테마에서 사용 | WARNING |
| 단일 레이어 과잉 점유 | LLM이 유사 레이어로 묶은 그룹이 전체 테마 50% 이상 | WARNING |
| 서사 톤 충돌 | 같은 카테고리 내 상반된 무드 표현 | INFO |
| CTA 문구 중복 | 동일 CTA 문구 복수 테마 사용 | ERROR |

**consistency_report.json 항목 구조**:
```json
{
  "issue_id": "cs_001",
  "severity": "WARNING|ERROR|INFO",
  "category": "sound|narrative|cta",
  "affected_themes": ["kyoto_forest", "rainy_camp"],
  "description": "forest_rain 레이어가 4개 테마에서 primary로 사용됩니다.",
  "suggestion": "rainy_camp의 primary 레이어를 rain_on_tent로 교체를 권장합니다."
}
```

**성공 기준**: ERROR 0건 (WARNING·INFO는 리포트에 기록 후 진행)  
**검증 방법**: 스크립트 (CTA 문자열 중복) + LLM (사운드 레이어 의미적 유사도 판단 + 톤 충돌 판단)  
**실패 처리**:
- ERROR(CTA 중복): 해당 테마 재생성 1회
- WARNING: 리포트 기록 후 진행, Bible append 시 주석 표시

---

#### STEP 7. Content Bible Append

**담당**: 메인 에이전트  
**입력**: 배치 내 전체 확정 `trip_content_pack_<theme>.json` + `output/trip_content_bible.md`  
**출력**: `output/trip_content_bible.md` (업데이트)

**처리 내용**:
- 기존 Bible 파일 존재 시: 테마 섹션 append
- 기존 파일 없을 시: 신규 생성 후 전체 작성
- 일관성 WARNING 테마: 섹션 상단에 `<!-- consistency-warning: ... -->` 주석 삽입
- 배치 내 동일 테마 중복 append 방지 (테마 ID 기준 dedup)

**Bible 섹션 구조**:
```markdown
## [테마명] — [카테고리]
> 생성일: YYYY-MM-DD | 환경: bathtub/shower/both

### Lite (3~7분)
- 서사: ...
- 사운드: layer1 (60%) + layer2 (30%) + layer3 (10%)
- 조명: ...
- CTA: "..."

### Deep (10~20분)
- 서사: ...
- 사운드: ...
- 조명: ...
- CTA: "..."
```

**성공 기준**: 배치 내 통과 테마 전부 Bible에 반영, 중복 섹션 0건  
**검증 방법**: 규칙 기반 (테마 수 = 통과 테마 수)  
**실패 처리**: append 실패 시 자동 재시도 1회 → 실패 시 에스컬레이션

---

### 2.3 분기 조건 요약

| 조건 | 처리 |
|------|------|
| `pack_<theme>.json` 이미 존재 | 해당 테마 스킵 + 로그 기록 |
| Firewall 1차 탈락 | 수정 제안 전달 후 재생성 1회 |
| Firewall 2차 탈락 | rejected 처리 + 스킵 |
| 사운드 레이어 수 위반 | 자동 재생성 1회 → 실패 시 에스컬레이션 |
| 일관성 ERROR (CTA 중복) | 해당 테마 재생성 1회 |
| 일관성 WARNING | 리포트 기록 후 진행, Bible에 주석 표시 |
| Content Bible 파일 없음 | 신규 생성 |
| 배치 내 전체 테마 탈락 | run_log에 기록 + 에스컬레이션 |

---

## 3. 구현 스펙

### 3.1 폴더 구조

```
/trip-content-generator
 ├── CLAUDE.md                              # 메인 에이전트 지침 (오케스트레이터)
 │
 ├── /.claude
 │   ├── /agents
 │   │   ├── /trip-creative
 │   │   │   └── AGENT.md                  # 콘텐츠 생성 서브에이전트
 │   │   ├── /sound-designer
 │   │   │   └── AGENT.md                  # 사운드 레이어 설계 서브에이전트
 │   │   └── /copy-firewall
 │   │       └── AGENT.md                  # Firewall 검증 서브에이전트
 │   │
 │   └── /skills
 │       ├── /firewall-checker
 │       │   ├── SKILL.md
 │       │   └── /scripts
 │       │       └── check_firewall.py      # 금지 어휘 정규식 전수 검사
 │       │
 │       ├── /schema-validator
 │       │   ├── SKILL.md
 │       │   └── /scripts
 │       │       └── validate_pack.py       # ThemeProfile 스키마 + 시간/레이어 수 검증
 │       │
 │       ├── /consistency-checker
 │       │   ├── SKILL.md
 │       │   └── /scripts
 │       │       └── check_consistency.py   # 사운드 레이어 중복 집계, CTA 중복 탐지
 │       │
 │       └── /bible-writer
 │           ├── SKILL.md
 │           └── /scripts
 │               └── append_bible.py        # Bible MD append + dedup 처리
 │
 ├── /input
 │   ├── theme_list.json                    # 생성 대상 테마 목록 + 카테고리
 │   ├── theme_profile_template.json        # ThemeProfile 필드 구조 (PRD §25.2 기준)
 │   └── copy_firewall_rules.json          # 금지/허용 어휘 룰 (PRD §13.4 기준)
 │
 ├── /output
 │   ├── draft_<theme>.json                 # 중간 산출물 (미검증 초안)
 │   ├── trip_content_pack_<theme>.json     # 확정 테마별 패키지
 │   ├── trip_content_bible.md             # 누적 Content Bible
 │   ├── consistency_report.json           # 일관성 검증 결과
 │   ├── rejected_contents.json            # Firewall 탈락 목록
 │   └── run_log.json                      # 배치 실행 로그
 │
 └── /docs
     ├── trip_copy_guide.md                # PRD §13.4 금지/허용 어휘 레퍼런스
     └── theme_profile_contract.md         # PRD §25.2·25.3 ThemeProfile 계약 레퍼런스
```

### 3.2 CLAUDE.md 핵심 섹션 목록

| 섹션 | 내용 |
|------|------|
| 역할 및 목적 | 배치 오케스트레이터, 코드 생성 아닌 콘텐츠 생성 특성 명시 |
| 배치 실행 규칙 | 테마 큐 순서, 이미 존재하는 테마 스킵 조건 |
| 테마별 반복 흐름 | STEP 2~5 순서 및 서브에이전트 호출 시점 |
| Firewall 재생성 정책 | 탈락 → 수정 제안 전달 → 재생성 1회 → 2차 탈락 시 rejected |
| 일관성 검증 정책 | ERROR/WARNING 기준, Bible append 시 주석 처리 조건 |
| 데이터 전달 규칙 | draft_ 파일 경로 기반 전달, pack_ 확정 후 draft_ 삭제 여부 |
| 실패 처리 정책 | 단계별 재시도 횟수, 에스컬레이션 조건 |

### 3.3 에이전트 구조

**구조 선택 근거**: 서브에이전트 분리

- 콘텐츠 창작(도메인: 서사·비주얼·CTA 문체), 사운드 설계(도메인: 오디오 레이어 구성), 카피 검증(도메인: 법률·마케팅 카피 정책) 세 영역의 도메인 지식이 명확히 분리됨
- 배치 처리 시 각 서브에이전트를 테마별로 반복 호출하므로 컨텍스트 격리가 품질 유지에 유리

```
메인 에이전트 (CLAUDE.md) — 배치 오케스트레이터
    │
    ├──→ trip-creative      (STEP 2: 콘텐츠 생성, 재생성 시 재호출)
    ├──→ sound-designer     (STEP 3: 사운드 레이어 설계)
    └──→ copy-firewall      (STEP 4: Firewall 검증)

    STEP 1, 5, 6, 7은 메인 에이전트 직접 처리
```

### 3.4 서브에이전트 정의

#### trip-creative

| 항목 | 내용 |
|------|------|
| 역할 | Lite/Deep 콘텐츠 패키지 초안 생성 (서사·조명·향·비주얼·CTA) |
| 트리거 조건 | STEP 1 큐 구성 후 테마별 반복 진입 시 / Firewall 탈락 후 재생성 시 |
| 입력 | 테마 정보 (이름·카테고리·환경) + `theme_profile_template.json` + (재생성 시) 수정 제안 |
| 출력 | `output/draft_<theme>.json` |
| 참조 스킬 | 없음 (순수 LLM 생성) |
| 참조 문서 | `docs/trip_copy_guide.md` (허용 어휘 중심 생성 가이드) |

#### sound-designer

| 항목 | 내용 |
|------|------|
| 역할 | 테마별 사운드 레이어 2~3개 구성, 볼륨 비율 설계 |
| 트리거 조건 | `draft_<theme>.json` 생성 완료 후 |
| 입력 | `output/draft_<theme>.json` + 기존 테마 사운드 레이어 현황 (인라인) |
| 출력 | `output/draft_<theme>.json` (ambient_sound_layer 필드 추가) |
| 참조 스킬 | `consistency-checker` (CTA 중복 스크립트) — 사운드 유사도는 LLM 직접 판단 |
| 참조 문서 | `docs/theme_profile_contract.md` (PRD §25.7 샤워 환경 제약) |

#### copy-firewall

| 항목 | 내용 |
|------|------|
| 역할 | 금지 어휘 1차 패턴 매칭 + 2차 경계 LLM 판단 + 수정 제안 |
| 트리거 조건 | STEP 3 사운드 설계 완료 후 |
| 입력 | `output/draft_<theme>.json` + `input/copy_firewall_rules.json` |
| 출력 | 통과: 확정 신호 반환 / 탈락: `output/rejected_contents.json`에 추가 + 수정 제안 반환 |
| 참조 스킬 | `firewall-checker` (1차 스크립트 검사) |

### 3.5 스킬 목록

| 스킬명 | 역할 | 트리거 조건 |
|--------|------|-------------|
| `firewall-checker` | 금지 어휘 정규식 전수 검사 | copy-firewall 진입 즉시 |
| `schema-validator` | ThemeProfile 필드 완비·시간 범위·레이어 수 검증 | STEP 5 진입 시 |
| `consistency-checker` | CTA 문자열 중복 탐지 (스크립트) + 사운드 레이어 의미적 유사도 판단 리스트 구성 | STEP 3 사전 체크 + STEP 6 전체 배치 검증 |
| `bible-writer` | Bible MD append, 테마 dedup, WARNING 주석 삽입 | STEP 7 진입 시 |

### 3.6 데이터 전달 방식

**파일 기반 전달** (모든 단계)

```
draft_<theme>.json  →  (Firewall 통과 후)  →  trip_content_pack_<theme>.json
```

- `draft_<theme>.json`: 테마별 미검증 중간 산출물 — STEP 5 통과 후 `pack_` 파일 확정, draft 파일은 유지(디버깅용)
- 사운드 레이어 기준선: STEP 1에서 Bible에서 추출해 메모리 보유, sound-designer에 인라인 전달 (소량)
- STEP 6 일관성 검증: 배치 내 전체 `pack_*.json` 경로 목록을 consistency-checker 스크립트에 전달

### 3.7 주요 산출물 파일 형식

#### trip_content_pack_\<theme\>.json

```json
{
  "theme_id": "kyoto_forest",
  "theme_name": "교토의 숲",
  "category": "Nature",
  "environment": "bathtub",
  "generated_at": "2026-02-27T00:00:00Z",
  "lite": {
    "time_expectation": "3~7분",
    "immersion_depth": "shallow",
    "narrative_description": "오늘 당신은 교토 숲의 늦은 오후에 있습니다.",
    "ambient_sound_layer": [
      { "layer": "forest_wind", "role": "primary", "volume_ratio": 0.6 },
      { "layer": "distant_stream", "role": "secondary", "volume_ratio": 0.4 }
    ],
    "lighting_profile": "warm_amber_fade",
    "scent_profile": ["hinoki", "green_moss"],
    "temperature_mood": "온기가 스미는 나무 향",
    "water_behavior_style": "gentle_ripple",
    "visual_motion_style": "minimal_leaf_drift",
    "trip_cta_copy": "교토의 숲으로 들어가기",
    "interaction_density": "low"
  },
  "deep": {
    "time_expectation": "10~20분",
    "immersion_depth": "deep",
    "narrative_description": "교토의 늦은 오후, 숲은 서서히 저녁을 받아들이고 있습니다. 바람이 지나간 자리에 잔광이 남습니다.",
    "ambient_sound_layer": [
      { "layer": "forest_wind", "role": "primary", "volume_ratio": 0.5 },
      { "layer": "bamboo_creek", "role": "secondary", "volume_ratio": 0.3 },
      { "layer": "evening_birds", "role": "accent", "volume_ratio": 0.2 }
    ],
    "lighting_profile": "amber_to_deep_red_gradient",
    "scent_profile": ["hinoki", "green_moss", "earth"],
    "temperature_mood": "저녁 공기처럼 부드럽게 식어가는 온기",
    "water_behavior_style": "slow_undulating_waves",
    "visual_motion_style": "layered_steam_and_light",
    "trip_cta_copy": "교토의 숲을 준비하기",
    "interaction_density": "high"
  },
  "firewall_passed": true,
  "consistency_warnings": []
}
```

#### consistency_report.json

```json
{
  "batch_id": "batch_20260227_001",
  "generated_at": "2026-02-27T00:00:00Z",
  "summary": { "ERROR": 0, "WARNING": 2, "INFO": 1 },
  "issues": [
    {
      "issue_id": "cs_001",
      "severity": "WARNING",
      "category": "sound",
      "affected_themes": ["kyoto_forest", "rainy_camp", "pine_mountain"],
      "description": "forest_wind 레이어가 3개 테마에서 primary로 사용됩니다.",
      "suggestion": "rainy_camp의 primary를 rain_on_tent로 교체를 권장합니다."
    }
  ]
}
```

---

## 4. 오픈 이슈 (구현 전 확인 필요)

| 번호 | 이슈 | 영향 범위 |
|------|------|-----------|
| 1 | LLM 유사도 판단 기준 명세 필요 — 사운드 레이어 유사도 판단 시 사용할 프롬프트 기준(예: 청각적 분위기·환경 유형·자연/도시 축) 을 AGENT.md 또는 /docs에 사전 정의해야 판단 일관성 확보 가능 | STEP 3, STEP 6 |
| 2 | 배치 크기 상한 미정 — 테마 수가 많을 경우 컨텍스트 누적 문제 발생 가능 → 20개 초과 시 분할 배치 처리 여부 | STEP 1 |
| 3 | draft_<theme>.json STEP 5 통과 후 삭제 여부 — 유지(디버깅) vs 삭제(정리) | STEP 5, 폴더 관리 |

---

*설계서 v0.2 — 사운드 레이어 명칭 자유 기술 + LLM 유사도 판단 방식 확정 반영 (2026-02-27)*
