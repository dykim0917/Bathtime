# Suno Music Generation Agent — 에이전트 설계서

버전: v0.1 (설계 초안)  
연계 시스템: ë°°ì°íì Care/Trip 콘텐츠 파이프라인  
작성 목적: Claude Code 구현 참조용 계획서

---

## 1. 작업 컨텍스트

### 1.1 배경 및 목적

배쓰타임의 Care 8개 조건 및 Trip 테마별로 Suno에서 음악을 생성하고 다운로드한다.  
Care는 각 조건당 20곡 이상을 확보해 랜덤 재생 풀을 구성하고,  
Trip은 각 테마의 분위기에 맞는 곡을 생성한다.  
Suno 공식 API가 없으므로 Playwright 브라우저 자동화로 조작하며,  
세션 쿠키 방식으로 로그인 상태를 유지한다.

### 1.2 범위

| 포함 | 제외 |
|------|------|
| Suno 브라우저 자동화 (생성·대기·다운로드) | Suno 계정 신규 가입 |
| Care 8개 조건별 프롬프트 생성 | 음악 편집·후처리 |
| Trip 테마별 프롬프트 생성 | 앱 내 오디오 플레이어 연동 |
| 생성 곡 로컬 다운로드 | 저작권 관련 법적 검토 |
| 배치 실행 (회당 20곡) | |
| 생성 현황 추적 및 재시도 관리 | |
| 곡 메타데이터 카탈로그 저장 | |

### 1.3 전체 생성 목표

| 카테고리 | 대상 | 목표 수량 | 총 필요 실행 수 |
|----------|------|-----------|----------------|
| Care | 8개 조건 × 20곡 | 160곡 이상 | 8회+ |
| Trip | 테마 수 × 3~5곡 | 테마 수에 따라 변동 | 테마 수 / 4 회+ |
| **회당 처리** | — | 20곡 | — |

> Suno 크레딧 소모를 고려해 회당 20곡으로 제한. 목표 수량 달성까지 반복 실행.

### 1.4 Care 8개 조건 목록 (PRD §ALGO_CARE_BRANCHING_RFC 기준)

| ID | 조건명 | 음악 방향 |
|----|--------|-----------|
| `muscle_pain` | 근육통 | 이완·온기·저자극 |
| `swelling` | 부종 | 순환 촉진·리드미컬 |
| `cold_like` | 감기 기운 | 안정·보호·따뜻함 |
| `menstrual_pain` | 생리통 | 안정·하복부 이완 |
| `hangover` | 숙취 | 저자극·미니멀·회복 |
| `insomnia` | 불면 | 수면 유도·BPM 60이하·앰비언트 |
| `stress` | 스트레스 | 이완·부교감 활성·플로럴/우디 톤 |
| `depression` | 우울 | 감정 환기·서사적·온기 |

### 1.5 입력 정의

| 입력 | 형식 | 역할 |
|------|------|------|
| Care 프롬프트 스펙 | `input/care_music_specs.json` | 조건별 Suno 프롬프트 파라미터 |
| Trip 프롬프트 스펙 | `input/trip_music_specs.json` | 테마별 Suno 프롬프트 파라미터 (trip_content_pack_*.json 에서 자동 변환) |
| 세션 쿠키 | `input/suno_session.json` | 브라우저 자동화 인증 |
| 생성 현황 | `output/music_catalog.json` | 이미 생성된 곡 추적 (재실행 시 중복 방지) |
| 실행 파라미터 | CLI `--mode care|trip|all --batch 20` | 실행 대상·회당 수량 |

### 1.6 출력 정의

| 파일 | 내용 |
|------|------|
| `/output/audio/<condition_or_theme>/<song_id>.mp3` | 다운로드된 음악 파일 |
| `/output/music_catalog.json` | 전체 생성 곡 메타데이터 누적 카탈로그 |
| `/output/batch_report.json` | 회별 실행 결과 (성공·실패·재시도) |
| `/output/run_log.json` | 단계별 실행 로그 |

### 1.7 제약조건

| 제약 | 내용 |
|------|------|
| 회당 생성 수 | 최대 20곡 (크레딧 관리) |
| 봇 탐지 대응 | 생성 요청 간 무작위 딜레이 10~20초 |
| 다운로드 대기 | Suno 생성 완료까지 최대 3분 대기 폴링 |
| 세션 만료 | 쿠키 만료 감지 시 실행 중단 + 에스컬레이션 |
| 실패 재시도 | 곡당 최대 2회 재시도, 이후 스킵 |
| 파일 중복 | `music_catalog.json` 기준 이미 생성된 조건+곡 스킵 |
| Care 음악 원칙 | PRD §23 모드별 BPM·향·분위기 파라미터 준수 |

### 1.8 용어 정의

| 용어 | 정의 |
|------|------|
| 세션 쿠키 | 브라우저에서 수동 로그인 후 추출한 Suno 인증 쿠키 파일 |
| 프롬프트 스펙 | Suno에 입력할 스타일 태그·가사 제외 순수 분위기 프롬프트 |
| 생성 풀 | 특정 조건/테마에 배정된 전체 곡 목록 |
| 폴링 | Suno 생성 완료 여부를 주기적으로 확인하는 방식 |
| 배치 | 1회 실행에서 처리하는 곡 묶음 (최대 20곡) |

---

## 2. 워크플로우 정의

### 2.1 전체 흐름도

```
[입력: care_music_specs.json or trip_music_specs.json
        + suno_session.json + music_catalog.json]
              │
              ▼
  STEP 1: 배치 큐 구성 (메인 에이전트)
  - 실행 모드 확인 (care / trip / all)
  - 목표 미달 조건/테마 파악 (catalog 기준)
  - 회당 20곡 배치 큐 구성 (조건별 균등 배분)
  - 세션 쿠키 유효성 사전 확인
              │
              ▼
  STEP 2: Suno 프롬프트 생성 [prompt-architect]
  - 조건/테마별 Suno 프롬프트 생성
  - 스타일 태그 + 분위기 서술 조합
  - 이전 생성 곡과 다양성 확보 (중복 톤 방지)
              │
              ▼
  STEP 3: 브라우저 자동화 실행 [suno-operator]
  ┌─────────────────────────────────────┐
  │  곡별 반복 (배치 큐의 각 프롬프트)  │
  │                                     │
  │  3-1. Suno 접속 + 쿠키 적용         │
  │  3-2. 프롬프트 입력 + 생성 요청     │
  │  3-3. 생성 완료 폴링 (최대 3분)     │
  │  3-4. 완료 시 다운로드              │
  │  3-5. song_id + 메타데이터 기록     │
  │                                     │
  │  실패 시: 재시도 2회 → 스킵         │
  └─────────────────────────────────────┘
              │
              ▼
  STEP 4: 카탈로그 업데이트 (메인 에이전트)
  - 성공 곡 music_catalog.json append
  - 배치 결과 batch_report.json 저장
  - 목표 달성 여부 확인
              │
              ▼
  [목표 미달 시 → 다음 실행 안내]
  [목표 달성 시 → 완료 리포트]
```

### 2.2 단계별 상세 정의

---

#### STEP 1. 배치 큐 구성

**담당**: 메인 에이전트  
**입력**: CLI 파라미터 + `output/music_catalog.json` + `input/care_music_specs.json`  
**출력**: 메모리 내 배치 큐 (최대 20개 항목)

**처리 내용**:

| 항목 | 담당 | 내용 |
|------|------|------|
| 조건별 현재 생성 수 파악 | 스크립트 | catalog.json 집계 |
| 목표 미달 조건 목록 추출 | 스크립트 | 20곡 미만 조건 필터 |
| 배치 20곡 균등 배분 | LLM | 미달 조건에 균등 배분, 가장 부족한 조건 우선 |
| 세션 쿠키 파일 존재 확인 | 스크립트 | `suno_session.json` 존재 + 만료일 체크 |

**Care 배치 배분 예시** (20곡, 8개 조건 모두 미달 시):
```
muscle_pain: 3곡, swelling: 2곡, cold_like: 3곡,
menstrual_pain: 2곡, hangover: 2곡, insomnia: 3곡,
stress: 3곡, depression: 2곡  → 합계 20곡
```

**성공 기준**: 배치 큐 1~20개 항목 구성, 세션 파일 존재  
**검증 방법**: 규칙 기반  
**실패 처리**:
- 세션 파일 없음: 진행 불가 + 에스컬레이션 (쿠키 재추출 안내)
- 모든 조건 목표 달성: "생성 완료" 메시지 후 종료

---

#### STEP 2. Suno 프롬프트 생성

**담당**: `prompt-architect` 서브에이전트  
**입력**: 배치 큐 (조건·테마 목록) + `input/care_music_specs.json`  
**출력**: `output/batch_prompts.json`

**프롬프트 구성 원칙**:

| 요소 | Care | Trip |
|------|------|------|
| 장르/스타일 태그 | 조건별 PRD §23 파라미터 기반 | ThemeProfile 분위기 기반 |
| BPM 범위 | 조건별 고정 (예: insomnia = 50~65) | 테마별 자유 |
| 악기 구성 | 조건별 (insomnia: 피아노+현악, stress: 앰비언트+자연음) | 테마 연상 악기 |
| 분위기 서술 | 한국어 금지 — 영어 태그 사용 | 영어 태그 사용 |
| 다양성 확보 | 같은 조건 내 이전 곡과 스타일 태그 30% 이상 차별화 | 같은 테마 내 변주 |

**조건별 음악 파라미터 기준 (PRD §23 기반)**:

| 조건 | BPM | 핵심 태그 | 제외 태그 |
|------|-----|-----------|-----------|
| insomnia | 50~65 | ambient, sleep, piano, soft strings | energetic, upbeat |
| stress | 60~75 | ambient, nature sounds, relaxing, floral | aggressive, fast |
| muscle_pain | 65~80 | warm, healing, gentle, acoustic | intense, jarring |
| depression | 60~75 | uplifting, warm, narrative, hopeful | melancholic, dark |
| hangover | 55~70 | minimal, soft, calm, lo-fi | loud, complex |
| menstrual_pain | 60~75 | gentle, warm, soothing, womb healing | tense, dissonant |
| swelling | 70~85 | rhythmic, circulation, light, flowing | heavy, static |
| cold_like | 60~75 | warm, protective, cozy, shelter | cold, exposed |

**성공 기준**: 배치 큐 수 = 생성된 프롬프트 수, 동일 조건 내 중복 태그 30% 이하  
**검증 방법**: 규칙 기반 (수량) + LLM 자기 검증 (다양성 확인)  
**실패 처리**: 자동 재생성 1회 → 실패 시 기본 템플릿 적용

---

#### STEP 3. 브라우저 자동화 실행

**담당**: `suno-operator` 서브에이전트  
**입력**: `output/batch_prompts.json` + `input/suno_session.json`  
**출력**: 다운로드 파일 (`output/audio/...`) + `output/batch_raw_results.json`

**3-1. 세션 초기화**:
- Playwright 브라우저 실행 (headless 또는 headed 선택 가능)
- `suno_session.json` 쿠키 적용
- suno.ai 접속 후 로그인 상태 확인
- 로그인 실패 시: 즉시 중단 + 에스컬레이션

**3-2. 프롬프트 입력 + 생성 요청**:
- "Create" 버튼 클릭
- Style 필드에 프롬프트 입력 (가사 없는 인스트루멘탈 선택)
- 생성 버튼 클릭
- 요청 간 무작위 딜레이: 10~20초

**3-3. 생성 완료 폴링**:
```
간격: 15초
최대 대기: 3분 (12회 폴링)
완료 감지: 재생 버튼 활성화 또는 파형 이미지 표시
타임아웃 시: 실패 처리
```

**3-4. 다운로드**:
- Suno 워크스페이스 내 완료된 곡의 다운로드 버튼 클릭 (직접 제공)
- 브라우저 다운로드 다이얼로그 처리 → 저장 경로: `output/audio/<condition_id>/<song_id>.mp3`
- 파일 이동: 브라우저 기본 다운로드 폴더 → `output/audio/` 지정 경로로 이동
- 파일 크기 확인 (0바이트 = 실패)

**3-5. 메타데이터 추출**:
```json
{
  "song_id": "suno_xxxxx",
  "condition_id": "insomnia",
  "prompt_used": "ambient sleep piano 60bpm...",
  "duration_sec": 180,
  "file_path": "output/audio/insomnia/suno_xxxxx.mp3",
  "generated_at": "2026-02-27T00:00:00Z",
  "status": "success"
}
```

**봇 탐지 대응**:
- User-Agent: 실제 브라우저 UA 사용
- 마우스 이동 패턴 자연화 (Playwright mouse.move)
- 차단 감지 시 (CAPTCHA 등): 30초 대기 후 재시도 1회 → 실패 시 에스컬레이션

**성공 기준**: 다운로드 파일 존재 + 파일 크기 > 0  
**검증 방법**: 규칙 기반 (파일 존재·크기)  
**실패 처리**:
- 생성 실패: 재시도 2회 → 스킵 + 로그
- 세션 만료 감지: 즉시 중단 + 에스컬레이션
- 연속 5곡 실패: 배치 중단 + 에스컬레이션

---

#### STEP 4. 카탈로그 업데이트

**담당**: 메인 에이전트  
**입력**: `output/batch_raw_results.json`  
**출력**: `output/music_catalog.json` (업데이트), `output/batch_report.json`

**처리 내용**:
- 성공 곡 메타데이터 `music_catalog.json`에 append
- 조건별 현재 달성 수 재집계
- 배치 성공률 계산 (성공/전체)
- 다음 실행 필요 여부 및 잔여 목표 수량 안내

**`music_catalog.json` 구조**:
```json
{
  "last_updated": "2026-02-27T00:00:00Z",
  "summary": {
    "care": {
      "muscle_pain": { "count": 12, "target": 20, "remaining": 8 },
      "insomnia": { "count": 20, "target": 20, "remaining": 0 },
      "..."
    },
    "trip": {
      "kyoto_forest": { "count": 4, "target": 5, "remaining": 1 }
    }
  },
  "songs": [
    {
      "song_id": "suno_xxxxx",
      "category": "care",
      "condition_id": "insomnia",
      "prompt_used": "...",
      "duration_sec": 180,
      "file_path": "output/audio/insomnia/suno_xxxxx.mp3",
      "generated_at": "2026-02-27T00:00:00Z"
    }
  ]
}
```

**성공 기준**: 성공 곡 전부 카탈로그에 반영, 집계 수치 정확  
**검증 방법**: 규칙 기반 (batch 성공 수 = catalog 신규 추가 수)  
**실패 처리**: append 실패 시 자동 재시도 1회 → 실패 시 에스컬레이션

---

### 2.3 분기 조건 요약

| 조건 | 처리 |
|------|------|
| 세션 쿠키 파일 없음 | 즉시 중단 + 쿠키 재추출 방법 안내 |
| 세션 만료 감지 (로그인 페이지 리다이렉트) | 배치 중단 + 에스컬레이션 |
| 모든 조건 목표 달성 | 생성 완료 메시지 + 종료 |
| 곡 생성 타임아웃 (3분 초과) | 재시도 2회 → 스킵 |
| 연속 5곡 실패 | 배치 전체 중단 + 에스컬레이션 |
| CAPTCHA 감지 | 30초 대기 후 재시도 1회 → 실패 시 중단 |
| 다운로드 파일 0바이트 | 실패 처리 + 재시도 |
| 동일 song_id 중복 | 카탈로그 dedup 후 스킵 |

---

## 3. 구현 스펙

### 3.1 폴더 구조

```
/suno-music-agent
 ├── CLAUDE.md                              # 메인 에이전트 지침 (오케스트레이터)
 │
 ├── /.claude
 │   ├── /agents
 │   │   ├── /prompt-architect
 │   │   │   └── AGENT.md                  # 프롬프트 생성 서브에이전트
 │   │   └── /suno-operator
 │   │       └── AGENT.md                  # 브라우저 자동화 서브에이전트
 │   │
 │   └── /skills
 │       ├── /browser-controller
 │       │   ├── SKILL.md
 │       │   └── /scripts
 │       │       ├── suno_browser.py        # Playwright 브라우저 초기화 + 쿠키 적용
 │       │       ├── suno_create.py         # 생성 요청 자동화
 │       │       ├── suno_poll.py           # 생성 완료 폴링
 │       │       └── suno_download.py      # 워크스페이스 다운로드 버튼 클릭 + 파일 이동
 │       │
 │       ├── /session-manager
 │       │   ├── SKILL.md
 │       │   └── /scripts
 │       │       └── check_session.py      # 쿠키 유효성 확인 + 만료 감지
 │       │
 │       ├── /catalog-manager
 │       │   ├── SKILL.md
 │       │   └── /scripts
 │       │       ├── read_catalog.py        # 현재 달성 수 집계
 │       │       └── append_catalog.py     # 신규 곡 append + dedup
 │       │
 │       └── /batch-planner
 │           ├── SKILL.md
 │           └── /scripts
 │               └── plan_batch.py          # 목표 미달 조건 파악 + 20곡 배분
 │
 ├── /input
 │   ├── care_music_specs.json             # 조건별 프롬프트 파라미터 (BPM·태그·제외 태그)
 │   ├── trip_music_specs.json             # 테마별 프롬프트 파라미터 (trip_content_pack 기반)
 │   └── suno_session.json                 # 브라우저 세션 쿠키 (수동 추출)
 │
 ├── /output
 │   ├── /audio
 │   │   ├── /care
 │   │   │   ├── /muscle_pain              # 조건별 폴더
 │   │   │   ├── /insomnia
 │   │   │   └── /...
 │   │   └── /trip
 │   │       ├── /kyoto_forest             # 테마별 폴더
 │   │       └── /...
 │   ├── batch_prompts.json                # STEP 2: 이번 배치 프롬프트
 │   ├── batch_raw_results.json            # STEP 3: 브라우저 자동화 원시 결과
 │   ├── music_catalog.json                # 전체 누적 카탈로그
 │   ├── batch_report.json                 # 회별 실행 결과
 │   └── run_log.json                      # 실행 로그
 │
 └── /docs
     ├── session_cookie_guide.md           # 세션 쿠키 추출 방법 (Chrome DevTools 기준)
     ├── care_music_parameter_ref.md       # PRD §23 기반 조건별 음악 파라미터 레퍼런스
     └── suno_ui_selectors.md              # Suno UI 셀렉터 목록 (UI 변경 시 업데이트)
```

### 3.2 CLAUDE.md 핵심 섹션 목록

| 섹션 | 내용 |
|------|------|
| 역할 및 목적 | 배치 오케스트레이터, 크레딧 관리 원칙 |
| 실행 모드 | `--mode care|trip|all`, `--batch N` 파라미터 처리 |
| 목표 수량 관리 | Care 조건별 20곡, Trip 테마별 목표 수량 |
| 세션 정책 | 쿠키 만료 시 즉시 중단 원칙 |
| 봇 탐지 대응 | 딜레이·재시도 정책 |
| 실패 처리 정책 | 곡별 재시도 2회, 연속 5곡 실패 시 배치 중단 |
| 카탈로그 관리 | append 방식, dedup 원칙 |

### 3.3 에이전트 구조

**구조 선택 근거**: 서브에이전트 분리

- 프롬프트 생성(도메인: 음악 스타일·PRD 파라미터·다양성 확보)과 브라우저 조작(도메인: Playwright·UI 셀렉터·폴링)이 명확히 분리됨
- `suno-operator`는 브라우저 상태를 관리하며 오래 실행되므로 독립 컨텍스트가 효율적

```
메인 에이전트 (CLAUDE.md) — 배치 오케스트레이터
    │
    ├──→ prompt-architect    (STEP 2: 프롬프트 생성)
    └──→ suno-operator       (STEP 3: 브라우저 자동화·다운로드)

    STEP 1, 4는 메인 에이전트 직접 처리
```

### 3.4 서브에이전트 정의

#### prompt-architect

| 항목 | 내용 |
|------|------|
| 역할 | 조건/테마별 Suno 프롬프트 생성 + 다양성 확보 |
| 트리거 조건 | STEP 1 배치 큐 구성 완료 후 |
| 입력 | 배치 큐 + `input/care_music_specs.json` 또는 `trip_music_specs.json` + 기존 생성 곡 프롬프트 목록 (인라인) |
| 출력 | `output/batch_prompts.json` |
| 참조 스킬 | 없음 (순수 LLM 생성) |
| 참조 문서 | `docs/care_music_parameter_ref.md` |
| LLM 판단 영역 | 스타일 태그 조합, 다양성 확보, Trip 테마 분위기 변환 |
| Trip 변환 규칙 | `ambient_sound_layer` → 장르/자연음 태그, `scent_profile` → 분위기 태그, `temperature_mood` → 톤 서술로 변환 |

#### suno-operator

| 항목 | 내용 |
|------|------|
| 역할 | Playwright 브라우저 자동화로 Suno 접속·생성·폴링·다운로드 |
| 트리거 조건 | `output/batch_prompts.json` 생성 완료 후 |
| 입력 | `output/batch_prompts.json` + `input/suno_session.json` |
| 출력 | 다운로드 파일 (`output/audio/...`) + `output/batch_raw_results.json` |
| 참조 스킬 | `browser-controller`, `session-manager` |
| 참조 문서 | `docs/suno_ui_selectors.md` |
| LLM 판단 영역 | UI 변경 감지 시 셀렉터 재추론 |

### 3.5 스킬 목록

| 스킬명 | 역할 | 트리거 조건 |
|--------|------|-------------|
| `browser-controller` | Playwright 초기화·쿠키 적용·생성 요청·폴링·다운로드 | suno-operator 진입 시 |
| `session-manager` | 세션 쿠키 파일 존재 확인·만료 감지·로그인 상태 체크 | STEP 1 + STEP 3 세션 오류 감지 시 |
| `catalog-manager` | 현재 달성 수 집계·신규 곡 append·dedup | STEP 1 큐 구성 + STEP 4 카탈로그 업데이트 |
| `batch-planner` | 목표 미달 조건 파악·20곡 균등 배분 | STEP 1 진입 시 |

### 3.6 데이터 전달 방식

**파일 기반** (배치 프롬프트, 원시 결과, 카탈로그)

```
batch_prompts.json      →  suno-operator (STEP 3 입력)
batch_raw_results.json  →  메인 에이전트 (STEP 4 입력)
music_catalog.json      →  메인 에이전트 (STEP 1 기준선, STEP 4 업데이트)
```

**인라인 전달** (소량)

- 배치 큐 → prompt-architect (20개 이하)
- 기존 생성 곡 프롬프트 목록 → prompt-architect (다양성 확보용, 최근 30개)

### 3.7 세션 쿠키 추출 방법 (운영 가이드)

```
1. Chrome에서 suno.ai 수동 로그인
2. DevTools → Application → Cookies → https://suno.ai
3. 필요 쿠키 복사: __session, __client_uat 등
4. input/suno_session.json 형식으로 저장:
   [{"name": "__session", "value": "...", "domain": "suno.ai", ...}]
5. 유효 기간 확인 (보통 7~30일)
```

---

## 4. 오픈 이슈 (구현 전 확인 필요)

| 번호 | 이슈 | 영향 범위 |
|------|------|-----------|
| 1 | Suno UI 셀렉터 불안정 — Suno는 UI를 자주 변경하므로 `suno_ui_selectors.md`를 별도 관리하고, LLM이 셀렉터 변경을 감지 시 재추론 로직 필요 | STEP 3 전체 |
| 2 | 인스트루멘탈 전용 생성 옵션 위치 확인 — Suno UI에서 가사 없는 순수 음악 생성 경로가 버전마다 다름 | STEP 3-2 |
| 3 | ~~다운로드 방식 확인~~ — ✅ **확정**: Suno 워크스페이스 다운로드 버튼 사용. 브라우저 다운로드 다이얼로그 → 지정 경로 이동 방식으로 구현 | STEP 3-4 |
| 4 | ~~Trip 프롬프트 자동 변환 범위~~ — ✅ **확정**: `ambient_sound_layer`(레이어 이름 → 스타일 태그) + `scent_profile`(향 → 분위기 태그) + `temperature_mood`(온도 무드 → 톤) 세 필드 조합으로 프롬프트 생성 | STEP 2 |

---

*설계서 v0.2 — 오픈 이슈 #3 (다운로드 방식) + #4 (Trip 프롬프트 변환) 확정 반영 (2026-02-27). 잔여 이슈: #1 (Suno UI 셀렉터), #2 (인스트루멘탈 옵션 위치)*
