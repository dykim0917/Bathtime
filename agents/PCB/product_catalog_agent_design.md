# Product Catalog Builder — 에이전트 설계서

버전: v0.1 (설계 초안)  
기준 스키마: `ë°°ì°íì ProductProfile` (PRD v3.11.0 §24.1)  
작성 목적: Claude Code 구현 참조용 계획서

---

## 1. 작업 컨텍스트

### 1.1 배경 및 목적

바스타임의 ProductHub/추천 레이어에 연결할 제품 카탈로그를 자동으로 구축한다.  
쿠팡·네이버에서 카테고리별 베스트셀러를 수집하고, ProductProfile 스키마로 정규화한 뒤 환경·모드·리스크 태그까지 부여해 바로 사용 가능한 카탈로그를 출력한다.

### 1.2 범위

| 포함 | 제외 |
|------|------|
| 쿠팡·네이버 브라우저 자동화 수집 | 해외 마켓(Amazon 등) |
| ProductProfile 스키마 정규화 | 실시간 가격 모니터링 |
| 환경/모드/안전 태그 부여 | 실제 제품 연동(DB 삽입) |
| 금지 카피 검출 및 필터링 | 제품 리뷰 감성 분석 |
| JSON + MD 산출물 생성 | |

### 1.3 입력 정의

| 입력 유형 | 형식 | 예시 |
|-----------|------|------|
| 검색 키워드 목록 | `input/keywords.json` | `{"category": "bath_salt", "keywords": ["배스솔트", "입욕제 솔트"]}` |
| 허용 카테고리 룰 | `input/category_rules.json` | PRD §24.1 `category` 필드 기준 |
| 실행 대상 플랫폼 | 실행 파라미터 | `--platform coupang,naver` |

**실행 규모**: 카테고리당 최대 50개 제품, 수동 실행(`claude` CLI)

### 1.4 출력 정의

| 파일 | 내용 |
|------|------|
| `/output/product_catalog_v{n}.json` | 정규화된 ProductProfile 목록 (배열) |
| `/output/product_catalog_v{n}.md` | 카테고리별 요약 + 추천 근거 + 주의사항 |
| `/output/rejected_products.json` | 필터링 탈락 제품 + 탈락 사유 |
| `/output/run_log.json` | 단계별 실행 로그 |

### 1.5 제약조건

- **의료 효능 단정 문구 금지**: PRD §13.1 금지 표현 목록 기준 (copy-firewall 적용)  
- **환경 적합성 필터 우선**: `environment_fit` 필터는 스코어링 이전에 1차 게이트로 적용  
- **품절·단종 대응**: 탈락 시 동일 카테고리 대체 후보 1개 이상 보존  
- **봇 탐지 우회**: Playwright stealth 모드 + 요청 간 무작위 딜레이(2~5초)  
- **안전 최우선**: `SAFE_ROUTINE_ONLY` 대상 제품은 카탈로그에 별도 플래그

### 1.6 용어 정의

| 용어 | 정의 |
|------|------|
| ProductProfile | PRD §24.1에 정의된 제품 정규화 스키마 |
| 환경 적합성 | `bathtub/partial` vs `shower` 사용 가능 여부 |
| 기전(Mechanism) | `bicarbonate`, `magnesium` 등 핵심 성분 작용 원리 |
| 금기 카피 | PRD §13.1 금지 표현에 해당하는 제품 설명 문구 |
| Slot A/B/C | 기전 기반 / 감성 / 가성비 3슬롯 구성 (PRD §24.4) |

---

## 2. 워크플로우 정의

### 2.1 전체 흐름도

```
[입력: keywords.json + category_rules.json]
         │
         ▼
  STEP 1: 키워드 전처리
  (메인 에이전트: 카테고리·플랫폼별 검색 쿼리 생성)
         │
         ▼
  STEP 2: 브라우저 수집 [product-curator]
  - 쿠팡/네이버 브라우저 자동화
  - 검색결과 → 제품 URL 목록 추출
  - 제품 상세 페이지 스크래핑
  - raw_products.json 저장
         │
         ▼
  STEP 3: ProductProfile 정규화 [product-curator]
  - raw 데이터 → ProductProfile 스키마 매핑
  - LLM 판단: category, core_mechanism, primary_mode_fit 분류
  - 스크립트: 필드 검증, 누락값 처리
         │
         ▼
  STEP 4: 안전·환경 필터 [safety-checker]
  - environment_fit 1차 게이트
  - 금기 조건·리스크 레벨 태그 부여
  - SAFE_ROUTINE_ONLY 대상 플래그
         │
         ▼
  STEP 5: 카피 검증 [copy-firewall]
  - 금지 표현 패턴 매칭 (스크립트)
  - 경계 표현 LLM 판단
  - 위반 제품 rejected_products.json 이동
         │
         ▼
  STEP 6: 카탈로그 완성 (메인 에이전트)
  - 슬롯 구성 검토 (A/B/C 균형)
  - 가격대 다양성 확인
  - product_catalog_v{n}.json + .md 생성
         │
         ▼
  [출력: JSON + MD + rejected + run_log]
```

### 2.2 단계별 상세 정의

---

#### STEP 1. 키워드 전처리

**담당**: 메인 에이전트 (LLM 판단)  
**입력**: `input/keywords.json`  
**출력**: `output/search_queries.json`

**처리 내용**:
- 카테고리별 검색 쿼리 조합 생성 (키워드 × 플랫폼 × 정렬기준)
- 플랫폼별 검색 URL 패턴 생성
- 카테고리 허용 여부 사전 필터 (category_rules.json 기준)

**성공 기준**: 카테고리별 최소 2개 이상 검색 쿼리 생성  
**검증 방법**: 스키마 검증 (필수 필드: `category`, `platform`, `query_url`)  
**실패 처리**: 자동 재시도 1회 → 실패 시 에스컬레이션 (쿼리 확인 요청)

---

#### STEP 2. 브라우저 수집

**담당**: `product-curator` 서브에이전트  
**입력**: `output/search_queries.json`  
**출력**: `output/raw_products.json`

**처리 내용**:

| 단계 | 담당 | 내용 |
|------|------|------|
| 브라우저 실행 | 스크립트 | Playwright stealth 모드 초기화 |
| 검색 결과 페이지 파싱 | 스크립트 | 제품명·URL·가격·이미지 추출 |
| 중복 제거 | 스크립트 | URL 기준 dedup |
| 제품 상세 스크래핑 | 스크립트 | 제품 설명·성분·용량·가격 추출 |
| 품절 감지 | 스크립트 | 품절 텍스트 패턴 감지 → 대체 후보 큐에 이동 |
| 수집 완료 판단 | LLM | 카테고리당 목표 수량 충족 여부 확인 |

**봇 탐지 대응 규칙**:
- 요청 간 무작위 딜레이: 2~5초
- User-Agent 로테이션 (playwright-stealth)
- 차단 감지 시: 30초 대기 후 재시도 (최대 3회)
- 3회 실패 시: 해당 URL 스킵 + 로그 기록

**성공 기준**: 카테고리당 30개 이상 raw 제품 수집 (목표 50개)  
**검증 방법**: 규칙 기반 (수집 수량 카운트, 필수 필드 존재 여부)  
**실패 처리**:
- 30개 미만: 검색 쿼리 보완 후 재수집 1회
- 재수집 후도 미달: 수집된 수량으로 진행 + 로그 기록

---

#### STEP 3. ProductProfile 정규화

**담당**: `product-curator` 서브에이전트  
**입력**: `output/raw_products.json`  
**출력**: `output/normalized_products.json`

**LLM 판단 영역**:

| 판단 항목 | 기준 | 예시 |
|-----------|------|------|
| `category` 분류 | PRD §24.1 카테고리 목록 | "히말라야 핑크 솔트" → `salt` |
| `core_mechanism` 추론 | 성분·설명 기반 | 탄산 성분 → `bicarbonate` |
| `primary_mode_fit` 매핑 | PRD §24.2 모드별 성분 매핑 | magnesium → `recovery` |
| `environment_fit` 판단 | 형태·사용법 기반 | 입욕제 분말 → `bathtub` |
| `price_tier` 분류 | 저가(~15,000원) / 중가(~40,000원) / 고가(40,000원+) | |

**스크립트 처리 영역**:
- ProductProfile JSON 스키마 기본 구조 생성
- 가격·용량 텍스트 파싱 및 정규화
- `temp_optimal_range`, `duration_optimal_range` 기본값 채우기 (Config Appendix 기준)
- 필수 필드 누락 여부 검증

**성공 기준**: ProductProfile 스키마 필수 필드 100% 채워짐 (null 허용 필드 제외)  
**검증 방법**: 스키마 검증 스크립트 실행  
**실패 처리**:
- 필드 누락: LLM 자기 검증으로 재추론 1회
- 2회 실패: `incomplete` 플래그 부여 후 다음 단계로 전달

---

#### STEP 4. 안전·환경 필터

**담당**: `safety-checker` 서브에이전트  
**입력**: `output/normalized_products.json`  
**출력**: `output/safety_tagged_products.json`

**처리 순서 (고정)**:

```
1. environment_fit 게이트 (스크립트)
   bathtub/partial 전용 제품이 shower로 분류된 경우 수정

2. contraindications 추출 (LLM)
   제품 설명에서 금기 조건 텍스트 식별

3. risk_level 태그 부여 (LLM)
   low / medium / high 분류 기준:
   - high: 임산부 금지, 고혈압 주의, 알러지 고위험 성분 포함
   - medium: 민감성 피부 주의, 장시간 노출 주의
   - low: 일반 제품

4. SAFE_ROUTINE_ONLY 플래그 (스크립트)
   risk_level = high → safe_only: true 자동 부여

5. cold_shower_compatible 플래그 (스크립트)
   Reset 모드 연동용
```

**성공 기준**: 모든 제품에 `risk_level`, `environment_fit`, `safe_only` 필드 완성  
**검증 방법**: 규칙 기반 (high risk 제품에 safe_only=true 일치 여부 검증)  
**실패 처리**: 스킵 없음 — 판단 불가 시 `risk_level: "high"` 보수적 기본값 적용

---

#### STEP 5. 카피 검증

**담당**: `copy-firewall` 서브에이전트  
**입력**: `output/safety_tagged_products.json`  
**출력**: `output/verified_products.json`, `output/rejected_products.json`

**처리 방식**:

| 단계 | 담당 | 내용 |
|------|------|------|
| 1차 패턴 매칭 | 스크립트 | PRD §13.1 금지 표현 정규식 매칭 |
| 2차 경계 판단 | LLM | 패턴 미매칭이지만 의미상 금지 표현 해당 여부 |
| 수정 제안 | LLM | 금지 → 허용 표현 변환 제안 (§13.3 기준) |

**금지 표현 키워드 (PRD §13.1)**:
```
치료, 면역력 증가, 노폐물 배출, 질환 개선, 호르몬 조절,
혈류 n배 증가, 치료 효과 보장
```

**탈락 기준**:
- 금지 표현 1개 이상 → `rejected_products.json` 이동
- 탈락 사유 및 해당 문구 기록
- 수정 제안 포함 (선택적 재검토 가능하도록)

**성공 기준**: 통과 제품의 금지 표현 0건  
**검증 방법**: LLM 자기 검증 (통과 제품 샘플 10% 재검토)  
**실패 처리**: 자동 재시도 없음 — 탈락 처리 + 사유 로그

---

#### STEP 6. 카탈로그 완성

**담당**: 메인 에이전트  
**입력**: `output/verified_products.json`  
**출력**: `output/product_catalog_v{n}.json`, `output/product_catalog_v{n}.md`

**LLM 판단 영역**:
- 카테고리별 슬롯 A/B/C 구성 적합성 검토 (PRD §24.4 기준)
- 가격대 다양성 부족 시 조정 권고
- MD 요약 문서 작성 (카테고리별 추천 근거 + 주의사항)

**스크립트 처리 영역**:
- 슬롯 구성 자동 배치 (스코어링 공식 PRD §24.3 적용)
- 버전 넘버링 (기존 파일 존재 시 n+1)
- run_log.json 최종 기록

**성공 기준**:
- 카테고리당 슬롯 A/B/C 각 1개 이상 구성
- 저가/중가/고가 최소 1개씩 포함
- MD 파일에 모든 카테고리 섹션 존재

**검증 방법**: 규칙 기반 + LLM 자기 검증  
**실패 처리**: 슬롯 미충족 시 available 제품으로 최선 구성 + 경고 메모 기록

---

### 2.3 분기 조건 요약

| 조건 | 분기 |
|------|------|
| 품절/단종 감지 | 대체 후보 큐에서 1개 선택 후 진행 |
| 봇 차단 3회 연속 | 해당 URL 스킵 + 로그 기록 |
| 카테고리 수집 30개 미만 | 재수집 1회 시도 |
| risk_level 판단 불가 | `high`로 보수적 처리 |
| 금지 카피 감지 | rejected로 이동, 수정 제안 병기 |
| 슬롯 구성 불완전 | available 제품으로 최선 구성 + 경고 |

---

## 3. 구현 스펙

### 3.1 폴더 구조

```
/project-root
 ├── CLAUDE.md                          # 메인 에이전트 지침 (오케스트레이터)
 │
 ├── /.claude
 │   ├── /agents
 │   │   ├── /product-curator
 │   │   │   └── AGENT.md               # 수집·정규화 서브에이전트 지침
 │   │   ├── /safety-checker
 │   │   │   └── AGENT.md               # 안전·환경 태그 서브에이전트 지침
 │   │   └── /copy-firewall
 │   │       └── AGENT.md               # 카피 검증 서브에이전트 지침
 │   │
 │   └── /skills
 │       ├── /browser-scraper
 │       │   ├── SKILL.md
 │       │   └── /scripts
 │       │       ├── scrape_coupang.py   # 쿠팡 스크래퍼
 │       │       ├── scrape_naver.py     # 네이버 스크래퍼
 │       │       └── browser_init.py    # Playwright stealth 초기화
 │       │
 │       ├── /schema-validator
 │       │   ├── SKILL.md
 │       │   └── /scripts
 │       │       └── validate_profile.py # ProductProfile 스키마 검증
 │       │
 │       ├── /copy-checker
 │       │   ├── SKILL.md
 │       │   └── /scripts
 │       │       └── check_copy.py       # 금지 표현 정규식 매칭
 │       │
 │       └── /catalog-builder
 │           ├── SKILL.md
 │           └── /scripts
 │               ├── slot_composer.py    # A/B/C 슬롯 스코어링 및 배치
 │               └── report_writer.py   # MD 보고서 생성
 │
 ├── /input
 │   ├── keywords.json                  # 검색 키워드 (사용자 제공)
 │   └── category_rules.json           # 허용 카테고리 룰 (PRD §24.1 기준)
 │
 ├── /output                            # 모든 산출물
 │   ├── search_queries.json           # STEP1 출력
 │   ├── raw_products.json             # STEP2 출력
 │   ├── normalized_products.json      # STEP3 출력
 │   ├── safety_tagged_products.json   # STEP4 출력
 │   ├── verified_products.json        # STEP5 출력
 │   ├── rejected_products.json        # STEP5 탈락 목록
 │   ├── product_catalog_v{n}.json     # 최종 카탈로그
 │   ├── product_catalog_v{n}.md       # 최종 요약 문서
 │   └── run_log.json                  # 실행 로그
 │
 └── /docs
     ├── ProductProfile_schema.md      # PRD §24.1 스키마 레퍼런스
     └── copy_banned_expressions.md    # PRD §13.1 금지 표현 목록
```

### 3.2 CLAUDE.md 핵심 섹션 목록

| 섹션 | 내용 |
|------|------|
| 역할 및 목적 | 오케스트레이터 역할 정의, 서브에이전트 호출 규칙 |
| 워크플로우 순서 | STEP 1~6 실행 순서 및 데이터 전달 경로 |
| 서브에이전트 호출 조건 | 어떤 시점에 어떤 에이전트를 호출하는가 |
| 데이터 전달 규칙 | 파일 기반 전달, 중간 산출물 저장 경로 |
| 실패 처리 정책 | 재시도 횟수, 에스컬레이션 조건 |
| 제약조건 참조 | PRD §13.1 (카피), §24.1~24.4 (스키마·슬롯) |

### 3.3 에이전트 구조

**구조 선택 근거**: 서브에이전트 분리

- 수집(도메인: 스크래핑·파싱), 안전(도메인: 의료·리스크), 카피(도메인: 법률·마케팅) 세 영역의 지식이 명확히 분리됨
- 각 서브에이전트 지침이 길어 모두 로드 시 컨텍스트 비효율
- 메인 에이전트가 오케스트레이터로 단방향 호출 (서브에이전트 간 직접 호출 금지)

```
메인 에이전트 (CLAUDE.md) — 오케스트레이터
    │
    ├──→ product-curator     (STEP 2~3: 수집·정규화)
    ├──→ safety-checker      (STEP 4: 안전·환경 태그)
    └──→ copy-firewall       (STEP 5: 카피 검증)
```

### 3.4 서브에이전트 정의

#### product-curator

| 항목 | 내용 |
|------|------|
| 역할 | 브라우저 수집 + ProductProfile 정규화 |
| 트리거 조건 | `search_queries.json` 생성 완료 후 |
| 입력 | `output/search_queries.json` |
| 출력 | `output/raw_products.json`, `output/normalized_products.json` |
| 참조 스킬 | `browser-scraper`, `schema-validator` |
| LLM 판단 영역 | category, core_mechanism, primary_mode_fit, environment_fit, price_tier 분류 |

#### safety-checker

| 항목 | 내용 |
|------|------|
| 역할 | 환경 적합성 필터 + 안전 태그 부여 |
| 트리거 조건 | `normalized_products.json` 생성 완료 후 |
| 입력 | `output/normalized_products.json` |
| 출력 | `output/safety_tagged_products.json` |
| 참조 스킬 | `schema-validator` |
| LLM 판단 영역 | contraindications 추출, risk_level 분류 |

#### copy-firewall

| 항목 | 내용 |
|------|------|
| 역할 | 금지 카피 검출 및 탈락 처리 |
| 트리거 조건 | `safety_tagged_products.json` 생성 완료 후 |
| 입력 | `output/safety_tagged_products.json` |
| 출력 | `output/verified_products.json`, `output/rejected_products.json` |
| 참조 스킬 | `copy-checker` |
| LLM 판단 영역 | 경계 표현 금지 여부 판단, 수정 표현 제안 |

### 3.5 스킬 목록

| 스킬명 | 역할 | 트리거 조건 |
|--------|------|-------------|
| `browser-scraper` | Playwright 기반 쿠팡·네이버 수집 | product-curator가 수집 단계 진입 시 |
| `schema-validator` | ProductProfile 필수 필드 검증 | 정규화 완료 후, 안전 태그 완료 후 |
| `copy-checker` | 금지 표현 정규식 1차 매칭 | copy-firewall 진입 즉시 |
| `catalog-builder` | 슬롯 스코어링 + MD 보고서 생성 | 메인 에이전트 STEP 6 진입 시 |

### 3.6 데이터 전달 방식

**파일 기반 전달** (모든 단계)

```
각 단계 완료 → /output/에 중간 산출물 저장 → 다음 에이전트에 파일 경로만 전달
```

- 인라인 전달 사용 안 함: 제품 50개 × 필드 수 고려 시 컨텍스트 초과 위험
- 중간 산출물 보존: 중간 단계 실패 시 해당 단계부터 재실행 가능

### 3.7 주요 산출물 파일 형식

#### product_catalog_v{n}.json (핵심 출력)

```json
{
  "version": 1,
  "generated_at": "2026-02-27T00:00:00Z",
  "categories": {
    "bath_salt": {
      "total": 12,
      "slots": {
        "A": { /* ProductProfile */ },
        "B": { /* ProductProfile */ },
        "C": { /* ProductProfile */ }
      },
      "additional": [ /* 나머지 제품 */ ]
    }
  }
}
```

#### ProductProfile 핵심 필드 (PRD §24.1)

```json
{
  "product_id": "string",
  "product_name": "string",
  "category": "powder|tablet|salt|oil|milk|steamer|bodywash|mist",
  "core_mechanism": "bicarbonate|magnesium|aromatic|moisturizing|detox",
  "primary_mode_fit": "sleep|recovery|reset|hygiene",
  "environment_fit": "bathtub|shower|both",
  "price_tier": "low|mid|high",
  "risk_level": "low|medium|high",
  "safe_only": false,
  "contraindications": [],
  "source_url": "string",
  "platform": "coupang|naver",
  "copy_verified": true,
  "slot_assigned": "A|B|C|none"
}
```

#### rejected_products.json

```json
{
  "rejected": [
    {
      "product_name": "string",
      "reason": "prohibited_copy|environment_mismatch|out_of_stock",
      "flagged_text": "금지 표현 원문",
      "suggested_replacement": "권장 대체 표현",
      "source_url": "string"
    }
  ]
}
```

---

## 4. 오픈 이슈 (구현 전 확인 필요)

| 번호 | 이슈 | 영향 범위 |
|------|------|-----------|
| 1 | 쿠팡 봇 탐지 수준에 따라 stealth 효과 불확실 — Playwright 대신 쿠팡 파트너스 API 대안 검토 필요 | STEP 2 전체 |
| 2 | `category_rules.json` 초기 작성 기준 미정 — PRD §24.1 카테고리 8개 기준으로 시작할지 확인 | STEP 1 |
| 3 | 네이버쇼핑 동적 렌더링 방식 확인 필요 (SSR vs CSR) — 파서 전략 결정에 영향 | STEP 2 |
| 4 | 스코어링 가중치(0.4/0.3/0.2/0.1) 적용 시 `user_preference_weight` 초기값 처리 — 카탈로그 빌드 시점에는 사용자 데이터 없음 | STEP 6 |

---

*설계서 v0.1 — 구현 착수 전 오픈 이슈 확인 후 확정*
