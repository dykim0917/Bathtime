# Admin Content Management Plan

> **Summary**: 제품, 케어 루틴, 무드 루틴, 음악 메타데이터를 앱 업데이트 없이 운영자가 관리할 수 있도록 외부 DB, API, 관리자 페이지, 앱 런타임 동기화 구조를 도입한다.
>
> **Project**: 바스타임
> **Author**: Codex
> **Date**: 2026-04-29
> **Status**: Draft

---

## 1. Problem

현재 제품, 케어 루틴, 무드 루틴, 음악 매핑은 대부분 앱 코드에 묶여 있다.

- 제품은 이미 `EXPO_PUBLIC_CATALOG_API_URL` 기반 원격 카탈로그 훅이 있지만, 원본 관리는 여전히 seed/code 중심이다.
- 케어 루틴은 `src/data/intents.ts`의 정적 `CARE_INTENT_CARDS`, `CARE_SUBPROTOCOL_OPTIONS`에 묶여 있다.
- 무드 루틴은 `src/data/themes.ts`, `src/data/generatedTripCatalog.ts`, `TRIP_INTENT_CARDS`, `TRIP_SUBPROTOCOL_OPTIONS`에 나뉘어 있다.
- 음악은 `src/data/music.ts`와 bundled audio asset에 묶여 있어 새 트랙 추가가 앱 배포와 연결된다.

운영자가 새 제품, 새 루틴, 새 무드, 새 음악을 넣을 때마다 앱 업데이트가 필요하면 콘텐츠 실험 속도가 죽는다. 바스타임은 루틴/제품 큐레이션이 제품의 본체라서, 이 부분은 CMS처럼 다룰 필요가 있다.

---

## 2. Goals

- 앱 업데이트 없이 active 콘텐츠를 추가, 수정, 중지할 수 있다.
- 앱은 네트워크 실패 시 현재 bundled fallback으로 계속 동작한다.
- 제품 카탈로그는 기존 `catalog.v1` 계약을 확장해서 재사용한다.
- 루틴과 음악은 안전 필터, 환경 제약, 추천 엔진 invariants를 깨지 않는 검증 단계를 갖는다.
- 관리자 페이지는 처음부터 과한 CMS가 아니라 운영에 필요한 CRUD, 미리보기, 발행 상태만 갖는다.

---

## 3. Non-Goals

- 일반 사용자 계정/커뮤니티 기능
- 실시간 가격 크롤링 자동화
- 제휴 정산 대시보드
- 사용자 개인 기록을 외부 DB로 옮기는 작업
- 오디오 제작 파이프라인 자동화
- 완전한 headless CMS 제품 만들기

---

## 4. Recommended Architecture

```txt
Admin Web
  |
  | writes draft / publishes
  v
External DB (PostgreSQL)
  |
  | server-side API reads active snapshot
  v
/api/content-snapshot
  |
  | schema_version checked by app
  v
Expo App Runtime Store
  |
  | fallback if failed
  v
Bundled Static Seed
```

기본 권장안은 PostgreSQL 계열 DB다. 이미 `db/migrations/2026-04-07_real_product_catalog.postgres.sql`가 있고, 제품 데이터가 JSONB와 GIN index를 쓰는 구조로 잡혀 있다. 이 방향을 제품뿐 아니라 루틴/트랙까지 확장하는 것이 제일 덜 이상하다.

Supabase는 후보로 좋다. Postgres, Auth, Storage, Row Level Security를 한 번에 제공하고, 공식 문서상 exposed schema에서는 RLS를 켜는 것을 전제로 한다. Expo Router API Routes도 EAS Hosting의 `server` output에서 API routes/server functions를 지원하므로, 앱과 같은 repo에 가벼운 API를 둘 여지도 있다.

---

## 5. Data Model

### 5.1 Product

기존 구조를 유지한다.

- `canonical_product`
- `product_market_listing`
- `product_match_rule`
- `product_presentation`

변경점:

- 현재 `PRESENTATION_METADATA`는 DB/API로 이동한다.
- `src/contracts/catalogApi.ts`의 `presentations`를 실제 runtime mapping에 반영한다.
- `getBeginnerFriendlyProductCatalog()`는 remote catalog 기준으로도 동일하게 동작해야 한다.

### 5.2 Care Routine

```txt
care_intent
  id
  intent_id
  mapped_mode
  title
  subtitle_by_environment
  allowed_environments
  default_subprotocol_id
  card_position
  status

care_subprotocol
  id
  intent_id
  label
  hint
  is_default
  partial_overrides
  status
```

검증 규칙:

- active `care_intent`는 default subprotocol을 반드시 가져야 한다.
- `allowed_environments`는 현재 `CanonicalBathEnvironment` 값만 허용한다.
- 숙취, 임신, 고혈압/심장질환처럼 안전 제약이 있는 루틴은 safety registry 확인 없이는 publish 불가다.

### 5.3 Trip / Mood Routine

```txt
trip_theme
  id
  cover_style_id
  title
  subtitle
  base_temp
  color_hex
  rec_scent
  music_id
  ambience_id
  default_bath_type
  recommended_environment
  duration_minutes
  lighting
  status

trip_intent
  id
  intent_id
  mapped_mode
  title
  subtitle_by_environment
  allowed_environments
  default_subprotocol_id
  card_position
  status

trip_subprotocol
  id
  intent_id
  label
  hint
  is_default
  partial_overrides
  status
```

검증 규칙:

- active `trip_theme.music_id`는 active music track을 참조해야 한다.
- active `trip_theme.ambience_id`는 active ambience track을 참조해야 한다.
- `base_temp`, `duration_minutes`는 앱 안전 ceiling 적용 후에도 사용자에게 이상한 값이 되지 않아야 한다.

### 5.4 Music / Ambience

```txt
audio_track
  id
  type
  title
  remote_url
  duration_seconds
  persona_codes
  license_note
  status
```

중요한 결정: 새 오디오는 bundled `require()`로 추가하지 않는다. Metro bundler는 `require()` 경로가 정적이어야 하므로, 운영자가 추가하는 트랙은 원격 URL 기반으로 재생해야 한다. 기존 bundled audio는 fallback 또는 기본 seed로 남긴다.

---

## 6. API Contracts

### 6.1 Existing

- `GET /api/catalog`
- `schema_version: catalog.v1`

### 6.2 New

초기에는 한 번에 내려주는 snapshot API를 권장한다.

```txt
GET /api/content-snapshot
```

```json
{
  "schema_version": "content.v1",
  "snapshot_date": "2026-04-29",
  "catalog": {},
  "care": {
    "intents": [],
    "subprotocols": {}
  },
  "trip": {
    "themes": [],
    "intents": [],
    "subprotocols": {}
  },
  "audio": {
    "tracks": []
  }
}
```

초기에는 full snapshot이 맞다. 콘텐츠 개수가 작고, 앱의 실패 복구가 단순해진다. delta sync, cache invalidation, pagination은 지금 풀 문제가 아니다.

---

## 7. Admin Page Scope

### 7.1 MVP

- 로그인
- 콘텐츠 목록
- 생성/수정/중지
- draft / active / paused / retired 상태
- publish 전 validation
- 앱에서 보이는 카드 미리보기
- 마지막 수정자, 마지막 검수일

### 7.2 Product Admin

- canonical product 편집
- listing 추가/수정
- match rule 편집
- presentation 편집
- direct purchase URL 검증 상태 표시

### 7.3 Routine Admin

- care intent card 편집
- care subprotocol 편집
- trip theme 편집
- trip intent/subprotocol 편집
- 환경별 subtitle 입력
- default subprotocol 누락 감지

### 7.4 Audio Admin

- track metadata 편집
- remote URL 입력
- duration/persona/status 편집
- care/trip 연결 상태 표시

---

## 8. Implementation Plan

### Phase 1: Contract First

검증:

- `src/contracts/contentApi.ts` 추가
- 제품, 케어, 트립, 오디오 response type 정의
- normalizer가 static seed와 remote payload를 같은 runtime type으로 변환
- Jest로 invalid payload, missing default, missing linked track 테스트

수정 예상 파일:

- `src/contracts/contentApi.ts`
- `src/data/catalogRuntime.ts`
- `src/data/intentsRuntime.ts`
- `src/data/themesRuntime.ts`
- `src/data/musicRuntime.ts`
- `src/data/__tests__/*Runtime.test.ts`

### Phase 2: DB Schema

검증:

- product 기존 migration은 유지/확장
- care/trip/audio migration 추가
- active 콘텐츠 invariant를 DB constraint 또는 API validation으로 막음
- seed export script가 현재 TS seed를 SQL upsert로 변환

수정 예상 파일:

- `db/migrations/*content_management*.postgres.sql`
- `scripts/export_content_seed_postgres.mjs`
- `output/content-seed.v1.postgres.upserts.sql`

### Phase 3: Read API

검증:

- local mock API부터 구현
- `GET /api/content-snapshot` 응답이 app normalizer 테스트를 통과
- 네트워크 실패 시 앱은 bundled seed 유지

수정 예상 파일:

- `scripts/mock_content_api.mjs`
- `package.json`
- `src/data/contentRuntime.ts`
- `app/(tabs)/index.tsx`
- `app/(tabs)/care.tsx`
- `app/(tabs)/trip.tsx`
- `app/result/recipe/[id].tsx`

### Phase 4: Admin MVP

검증:

- 별도 web admin 앱 또는 `/admin` route 결정
- 로그인된 운영자만 접근
- CRUD는 draft부터 시작
- publish 버튼은 validation 통과 시에만 활성화

권장 구현:

- 앱과 분리된 작은 web admin이 낫다.
- 모바일 앱 번들과 관리자 코드를 섞으면 build/test 표면이 불필요하게 커진다.
- 같은 repo 안에 `admin/` workspace를 두고 DB/API contract만 공유한다.

### Phase 5: App Integration

검증:

- 제품 탭 remote catalog와 새 content snapshot 충돌 제거
- 케어/트립 탭이 remote intent/theme을 표시
- 레시피/타이머가 remote audio URL을 재생
- offline/fallback 테스트 통과

### Phase 6: Release Gate

검증:

- `npm run typecheck`
- `npm test`
- content validation test
- mock API integration test
- web smoke test
- 관리자 publish flow smoke test

---

## 9. Migration Strategy

1. 현재 TS seed를 DB seed로 export한다.
2. 앱은 static seed를 fallback으로 계속 보유한다.
3. `EXPO_PUBLIC_CONTENT_API_URL`이 있을 때만 remote snapshot을 시도한다.
4. remote snapshot이 유효하면 runtime store를 교체한다.
5. remote snapshot이 실패하면 fallback seed로 유지하고 사용자에게 에러를 노출하지 않는다.
6. 운영자가 충분히 검증한 뒤 static seed 업데이트 빈도를 줄인다.

---

## 10. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| 관리자 입력이 추천 엔진 invariant를 깨뜨림 | 레시피/타이머에서 런타임 에러 | publish validation, normalizer test, fallback |
| 원격 오디오 URL이 느리거나 만료됨 | 타이머 화면에서 음악 재생 실패 | track status, URL health check, bundled fallback |
| 제품 API와 content snapshot이 중복됨 | 앱 데이터 원본 혼란 | Phase 1에서 `catalog.v1`을 `content.v1.catalog`로 감싸는 전략 결정 |
| 관리자 인증이 약함 | 운영 데이터 변조 | server-side admin API, RLS, role check |
| 처음부터 CMS를 크게 만듦 | 출시 지연 | MVP는 CRUD + validation + publish만 |

---

## 11. Open Decisions

### D1. Admin Hosting

권장: 별도 `admin/` web app.

이유: Expo 모바일 앱과 관리자 UI의 사용자, 보안, 배포 리듬이 다르다. 같은 bundle에 넣으면 앱 사용자가 절대 보지 않을 코드를 모바일 릴리즈 표면에 올리게 된다.

### D2. Backend Provider

권장: PostgreSQL-compatible backend, 우선 Supabase 검토.

이유: 현재 제품 migration이 Postgres에 맞춰져 있고, 관리자 인증/스토리지/RLS까지 한 번에 해결할 수 있다.

### D3. Snapshot API Shape

권장: `GET /api/content-snapshot` 단일 endpoint.

이유: 초기 콘텐츠 규모에서는 single snapshot이 가장 단순하고 실패 복구가 쉽다.

### D4. Audio Delivery

권장: 새 운영 트랙은 remote URL, 기존 bundled audio는 fallback.

이유: Metro의 static `require()` 제약 때문에 앱 업데이트 없이 새 오디오 파일을 추가하려면 remote delivery가 필요하다.

---

## 12. Acceptance Criteria

- 운영자가 관리자 페이지에서 제품을 추가하고 앱 업데이트 없이 Product 탭에 노출할 수 있다.
- 운영자가 케어 루틴과 subprotocol을 추가하고 앱 업데이트 없이 Care 탭에 노출할 수 있다.
- 운영자가 trip theme과 음악을 연결하고 앱 업데이트 없이 Trip 탭에 노출할 수 있다.
- 잘못된 콘텐츠는 publish 전 validation에서 막힌다.
- API 실패 시 기존 앱 seed로 모든 주요 화면이 계속 동작한다.
- 테스트가 remote success, remote failure, invalid payload, missing linked record를 커버한다.

---

## 13. Recommended First Build Slice

첫 구현은 제품부터가 아니라 `content.v1` contract부터 시작한다.

이유:

- 제품은 이미 반쯤 remote-ready라서 쉬워 보이지만, 케어/트립/오디오까지 같이 보지 않으면 나중에 endpoint가 갈라진다.
- contract를 먼저 잡으면 관리자, DB, 앱이 같은 모양을 보고 움직인다.
- 가장 작은 useful slice는 mock `content.v1` API와 앱 runtime normalizer다.

첫 PR 목표:

- `content.v1` 타입
- static seed -> content snapshot adapter
- mock content API
- 앱 fallback 유지
- runtime normalizer tests

---

## 14. /autoplan Review Notes

### 14.1 CEO Review

전략적으로 맞는 문제다. 바스타임의 핵심 차별점은 루틴/무드/제품 큐레이션인데, 이 원본이 앱 릴리즈에 묶이면 운영 실험 속도가 너무 느려진다.

가장 큰 범위 위험은 "관리자 페이지"라는 말이 실제로는 DB, 인증, API, validation, 앱 runtime, 오디오 delivery까지 포함한다는 점이다. 그래서 첫 PR은 관리자 UI가 아니라 `content.v1` 계약과 runtime normalizer여야 한다. 이 결정이 전체 작업의 복잡도를 가장 많이 낮춘다.

### 14.2 Design Review

관리자 MVP는 화려한 대시보드가 아니다. 운영자가 반복해서 쓰는 내부 도구이므로 조밀한 목록, 빠른 필터, 상태 배지, 저장/발행 흐름, publish validation error가 핵심이다.

앱 쪽 사용자 경험은 remote loading을 드러내지 않는 편이 맞다. 루틴/제품 화면에서 콘텐츠가 늦게 오더라도 사용자는 기존 seed를 즉시 보고, 다음 refresh에서 새 snapshot을 받는 구조가 더 안정적이다.

### 14.3 Engineering Review

가장 중요한 기술 결정은 snapshot API다. 콘텐츠 규모가 작을 때부터 delta sync를 만들면 복잡도만 늘어난다. `content.v1` full snapshot, schema version check, fallback seed, validation tests가 더 낫다.

오디오는 별도 주의가 필요하다. 현재 `src/data/music.ts`는 Metro static `require()`를 쓴다. 이 방식으로는 운영자가 새 파일을 추가해도 앱 업데이트 없이 재생할 수 없다. remote URL 기반 track을 추가하고 bundled track은 fallback으로 남기는 게 맞다.

### 14.4 DX Review

개발자 경험의 병목은 seed 변환이다. 현재 TS seed, SQL seed, mock API, runtime type이 흩어질 수 있다. `static seed -> content snapshot -> DB upsert` 경로를 스크립트로 고정해야 이후 콘텐츠 추가가 안전해진다.

테스트는 "화면이 보인다"보다 "잘못된 운영 데이터가 publish되지 않는다"에 집중해야 한다. missing default subprotocol, missing linked music, invalid environment, invalid product presentation을 먼저 막아야 한다.

### 14.5 Decision Audit Trail

| # | Phase | Decision | Classification | Principle | Rationale | Rejected |
|---|---|---|---|---|---|---|
| 1 | CEO | 관리자 UI보다 `content.v1` 계약을 먼저 구현 | Mechanical | Explicit over clever | 앱, DB, admin이 같은 데이터 모양을 공유해야 재작업이 줄어든다 | Admin-first |
| 2 | Eng | 초기 API는 full snapshot | Mechanical | Simplicity first | 콘텐츠 규모가 작고 fallback이 쉬워진다 | Delta sync, pagination |
| 3 | Eng | 새 운영 오디오는 remote URL 기반 | Mechanical | Completeness | 앱 업데이트 없이 음악 추가가 가능해야 한다 | Static `require()` only |
| 4 | Eng | 기존 static seed는 fallback으로 유지 | Mechanical | Boil lakes | 네트워크 실패가 사용자 루틴 시작을 막으면 안 된다 | Remote-only runtime |
| 5 | Design | Admin은 별도 `admin/` web app 권장 | Taste | Pragmatic | 모바일 앱 bundle과 관리자 보안/배포 리듬을 분리한다 | Expo app 내부 `/admin` |

### 14.6 Cross-Phase Themes

- 계약 우선: CEO, Eng, DX 모두 `content.v1`을 첫 산출물로 보는 게 맞다.
- fallback 필수: 앱 사용자는 운영 시스템 장애를 보면 안 된다.
- validation 필수: 이 기능의 진짜 위험은 DB가 아니라 잘못된 루틴 데이터가 안전/추천 엔진을 깨는 것이다.
