# Content Pipeline Session Setup

콘텐츠 제작 전용 Codex 세션에서 Bathtime single spot content/item note pipeline을 끝까지 실행하기 위한 운영 메모입니다.

이 문서는 개발 세션과 콘텐츠 운영 세션을 분리하기 위한 체크리스트입니다. 실제 토큰이나 service role key는 커밋하지 않습니다.

## Goal

다른 세션에서도 다음 작업을 막힘 없이 처리할 수 있어야 합니다.

- `$bathtime-single-spot-content-publishing-pipeline` with `Mode: apply-draft`
- `$bathtime-item-note-publishing-pipeline` with `Mode: apply-draft`
- `spot-seed.archive-content.ts` 또는 `item-seed.archive-content.ts` 생성/수정
- DB upsert artifact 생성
- Supabase/PostgREST에 private draft로 apply
- 공개 웹 preview URL 확인

## Required Local Secrets

repo root의 `.env.local` 또는 세션 shell 환경에 아래 값을 둡니다.

```txt
EXPO_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
CONTENT_DB_REST_URL=https://<project>.supabase.co/rest/v1
CONTENT_DB_SERVICE_ROLE_KEY=<service-role-key>
ADMIN_PREVIEW_TOKEN=<admin-preview-token>
ARCHIVE_PREVIEW_API_BASE=https://admin.getbathtime.com
NEXT_PUBLIC_KAKAO_MAP_JS_KEY=<kakao-map-default-js-key>
```

`CONTENT_DB_REST_URL`은 현재 upsert script 내부에서는 Supabase URL로 대체할 수 있지만, pipeline skill과 다른 세션의 preflight는 이 값을 명시적으로 요구할 수 있습니다. 콘텐츠 운영 세션에서는 항상 넣어둡니다.

`ADMIN_PREVIEW_TOKEN`은 DB apply 자체에는 필요 없지만, 비공개 draft preview 검증에는 필요합니다. 공개 웹 preview URL은 보통 아래 형태입니다.

```txt
https://www.getbathtime.com/content/<content-id>?previewToken=<ADMIN_PREVIEW_TOKEN>
```

Admin preview/API는 같은 값을 `token` query로 검사합니다.

주의:

- `CONTENT_DB_SERVICE_ROLE_KEY`는 DB draft apply에 필요합니다.
- `ADMIN_PREVIEW_TOKEN`은 draft preview 검증에 필요합니다.
- `NEXT_PUBLIC_KAKAO_MAP_JS_KEY`는 후보아카이브형 스팟가이드의 카카오맵 분포 블록에 필요합니다.
- service role key는 절대 `EXPO_PUBLIC_` 또는 `NEXT_PUBLIC_` 접두사로 만들지 않습니다.
- 카카오맵 JS 키는 브라우저에서 쓰는 공개 키이므로 `NEXT_PUBLIC_` 접두사를 사용하되, 카카오 개발자 콘솔에서 JavaScript SDK 도메인 등록과 지도/로컬 서비스 활성화를 확인합니다.
- `.env.local`, `.env`는 git에 커밋하지 않습니다.
- anon key만으로는 `--apply`가 실패합니다.

## Quick Environment Check

새 세션에서 pipeline을 돌리기 전에 아래 명령으로 shell env와 `.env.local`을 합쳐 확인합니다.

```sh
node - <<'NODE'
const fs = require('fs');
const env = { ...process.env };
for (const file of ['.env.local', '.env']) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const index = trimmed.indexOf('=');
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
    if (env[key] === undefined) env[key] = value;
  }
}
for (const key of [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'CONTENT_DB_REST_URL',
  'CONTENT_DB_SERVICE_ROLE_KEY',
  'ADMIN_PREVIEW_TOKEN',
  'ARCHIVE_PREVIEW_API_BASE',
  'NEXT_PUBLIC_KAKAO_MAP_JS_KEY',
]) {
  console.log(key, env[key] ? 'set' : 'missing');
}
NODE
```

`.env.local`을 shell에 직접 export하지 않아도 archive upsert script는 repo root의 `.env.local`과 `.env`를 읽습니다.

## Upsert Commands

Single spot content seed:

```sh
npm run archive:spot:upsert -- outputs/spot-archive/<slug>/seed
npm run archive:spot:upsert -- outputs/spot-archive/<slug>/seed --apply
```

Item note seed:

```sh
npm run archive:item:upsert -- outputs/item-archive/<slug>/seed
npm run archive:item:upsert -- outputs/item-archive/<slug>/seed --apply
```

The command writes DB artifacts beside the seed files:

```txt
<prefix>.archive-content.db-row.json
<prefix>.archive-content.upsert.sql
```

where `<prefix>` is `spot-seed` or `item-seed`.

## Pipeline Handoff Prompt

콘텐츠 전용 세션을 새로 열 때는 아래처럼 시작합니다.

```txt
이 세션은 Bathtime 콘텐츠 파이프라인 전용입니다.
docs/04-report/content-pipeline-session-setup.md를 먼저 읽고,
.env.local 권한이 준비되어 있는지 확인한 뒤 apply-draft까지 진행해주세요.

$bathtime-item-note-publishing-pipeline
Target: <item idea or title>
Mode: apply-draft
```

Single spot content:

```txt
$bathtime-single-spot-content-publishing-pipeline
Target: <spot name/address>
Mode: apply-draft
```

## Expected Apply Behavior

`--apply`는 `archive_content`에 `id` 기준 upsert를 수행합니다.

기본 상태는 public publish가 아니라 draft여야 합니다. pipeline skill은 공개 발행을 기본 동작으로 삼지 않습니다.

성공 후 확인할 것:

- upsert script가 HTTP error 없이 종료됐는가
- generated `*.db-row.json`의 `status`가 draft 계열인가
- preview URL에서 본문이 내부 메모가 아니라 실제 웹 노출용 본문인가
- image placeholder는 의도된 슬롯/코칭 문구인가

## Common Failure Cases

`Missing CONTENT_DB_SERVICE_ROLE_KEY or Supabase URL env`

- `.env.local`에 `CONTENT_DB_SERVICE_ROLE_KEY`가 없습니다.
- 또는 `CONTENT_DB_REST_URL`이 없거나 Supabase URL 계열이 없습니다.
- 콘텐츠 운영 세션에서는 fallback에 의존하지 말고 `CONTENT_DB_REST_URL`을 명시합니다.

`preview token unavailable` 또는 draft preview verification blocked

- `.env.local`에 `ADMIN_PREVIEW_TOKEN`이 없습니다.
- public preview URL에는 `?previewToken=<ADMIN_PREVIEW_TOKEN>`을 씁니다.
- admin preview/API 직접 호출에는 `?token=<ADMIN_PREVIEW_TOKEN>`을 씁니다.
- DB apply만 완료하고 preview 검증을 생략하는 것은 가능하지만, `apply-draft` 완료로 보기는 어렵습니다.

`PostgREST archive_content upsert failed with status 401/403`

- service role key가 아니라 anon key를 넣었을 가능성이 큽니다.
- Supabase project URL과 key가 서로 다른 프로젝트의 값일 수 있습니다.

`Expected exactly one ArchiveContent export`

- `spot-seed.archive-content.ts` 또는 `item-seed.archive-content.ts`에 export가 없거나 여러 개입니다.
- archive content implementer skill로 파일 구조를 먼저 정리합니다.

Preview page shows raw planning text

- `archive-content.ts`가 웹 본문용으로 정리되지 않았습니다.
- DB 문제가 아니라 content implementation 문제입니다.
- `bathtime-single-spot-content-archive-content-implementer` 또는 `bathtime-item-note-archive-content-implementer`로 body blocks를 다시 검수합니다.

## Session Boundary

개발 세션에서는 보통 아래만 처리합니다.

- pipeline skill 개선
- upsert script 개선
- admin/public web/app UI 수정
- schema/migration 작업

콘텐츠 세션에서는 보통 아래를 처리합니다.

- research
- seed generation
- web content writing
- humanize-korean review
- archive-content implementation
- private draft DB apply
- preview verification
