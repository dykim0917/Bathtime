---
name: bathtime-item-note-archive-content-implementer
description: Implement Bathtime Item Note web content packages into ArchiveContent seed files and DB draft rows. Use when the user wants item-seed.web-content.md or item-seed.canonical.json turned into item-seed.archive-content.ts, wants item notes upserted to Supabase/PostgREST, or asks to verify Bathtime archive preview pages for product-review drift, bad headings, raw enum labels, image slots, structuredInfo readability, and draft/publish status.
metadata:
  short-description: 배스타임 아이템 노트 ArchiveContent 구현·DB 반영·미리보기 검증
---

# Bathtime Item Note Archive Content Implementer

This skill is the final implementation step between `bathtime-item-note-web-content-producer` and the live Bathtime archive database.

Use it to convert a reviewed Item Note web content package into the actual `ArchiveContent` object that the app and DB use.

## Position In The Pipeline

1. `bathtime-item-note-ideator`: creates the item angle brief.
2. `bathtime-item-note-researcher`: researches the item/category and writes research artifacts.
3. `bathtime-item-note-seed-builder`: converts research artifacts into canonical item seed files.
4. `bathtime-item-note-web-content-producer`: writes the editorial web content package and image plan.
5. `bathtime-item-note-archive-content-implementer`: updates `item-seed.archive-content.ts`, generates DB upsert artifacts, optionally applies the upsert, and verifies preview output.

Do not reuse facts, image plans, or assumptions from previous item notes. Treat each seed directory as a fresh item note.

## Inputs

Prefer a seed directory containing:

- `item_angle_brief.md`
- `item-seed.canonical.json`
- `item-seed.web-content.md`
- `item-seed.archive-content.ts`
- `item-seed.mapping.md`

If `item-seed.web-content.md` is missing, either ask the user to run `bathtime-item-note-web-content-producer` first or make a clearly scoped implementation draft from the canonical JSON only.

## Required Repo Context

Before editing a new repo or after renderer changes, check:

- `src/archive/types.ts` for `ArchiveContent`, `ContentBodyBlock`, and available structured info shapes
- `src/components/web/ContentBodyRenderer.tsx` for supported body blocks
- `src/components/web/ArchiveVisual.tsx` for image fallback behavior
- seed/upsert scripts such as `scripts/*archive*`, `scripts/*item*`, or `scripts/*spot*`

For this repo, if `ContentBodyBlock` supports only:

```ts
{ type: 'paragraph'; text: string }
{ type: 'heading'; text: string }
{ type: 'image'; uri: string; caption?: string }
{ type: 'quote'; text: string }
{ type: 'list'; items: string[] }
{ type: 'divider' }
```

then convert item-specific blocks into these supported types.

## Core Workflow

### 1. Read the target seed files

Start with:

- `item-seed.web-content.md`
- `item-seed.canonical.json`
- current `item-seed.archive-content.ts` if present
- `item-seed.mapping.md`
- `item_angle_brief.md`

Identify drift:

- product-review tone
- ranking language
- unsupported product claims
- missing tradeoff
- missing image slots
- raw enums
- stale publish status
- product image rights not represented
- missing CTA connection to ritual/save/submit

### 2. Decide if implementation is allowed

Proceed when the user asked to update, DB upsert, preview, continue batch processing, or otherwise clearly wants implementation.

Keep:

```ts
isPublished: false
status: 'draft'
```

unless the user explicitly asks to publish and all blockers are resolved.

If specs, price, image rights, safety claims, or disclosure are unresolved, keep draft status.

### 3. Update `item-seed.archive-content.ts`

Use surgical edits.

Preserve the repo's `ArchiveContent` shape.

Use Korean reader-facing body headings in this order:

1. `한 줄 판단`
2. `어떤 의식을 돕나요`
3. `사기 전에 먼저 볼 것`
4. `좋게 볼 수 있는 점`
5. `아쉬운 점`
6. `이런 사람에게 맞아요`
7. `이런 사람에게는 애매해요`
8. `같이 쓰면 좋은 의식`
9. `저장해둘 이유`

Insert at least two inline image blocks when supported:

- first after the verdict or ritual role section
- second after the purchase-check or practical-friction section

Use slot IDs such as:

- `image-slot:{item-slug}-ritual-context`
- `image-slot:{item-slug}-decision-card`

unless the web package specifies better slot IDs.

Keep image captions as sourcing briefs for staff:

- desired subject
- acceptable source
- rights requirement
- forbidden sources

For generated hero images:

- use generated assets only if the URI is a public URL or an app-supported asset URI
- do not put a local filesystem path into `heroImage.uri` for DB/app rendering
- keep `category-item` or another safe fallback when the generated file exists only under `outputs/`
- preserve the generated local path in `item-seed.web-content.md`, canonical quality notes, or publish blockers
- avoid generated images that resemble a specific brand/product, marketplace listing, package, logo, label, or review photo

### 4. Make `structuredInfo` reader-facing

Do not expose raw values such as:

- `footbath_electric`
- `portable_bathtub`
- `storage_medium`
- `cleaning_low`
- `unknown`
- `item_category`

Convert to Korean reader-facing labels such as:

- `족욕기 / 족욕볼`
- `욕조 없는 집의 족욕 루틴`
- `보관 난이도: 중간 · 말릴 공간 필요`
- `청소 난이도: 제품 구조에 따라 다름`
- `가격대: 제품별 차이 큼 · 발행 전 재확인 필요`

Unknowns must be specific:

- `대표 가격대는 발행 전 재확인 필요`
- `전원/방수 관련 공식 스펙 확인 필요`
- `제품별 청소 방식 차이가 커서 단정 불가`
- `직접 사용 전 장기 사용감 단정 불가`

Keep `structuredInfo.priceRange` short and scan-friendly.

### 5. Preserve non-review framing

The implemented content must not read like:

```text
추천 제품 TOP 5
장점/단점 리뷰
에디터 추천템
구매 링크 모음
```

It should read like:

```text
이 도구가 어떤 의식을 가능하게 하는지, 어떤 번거로움이 있는지, 어떤 사람에게 맞는지 정리한 아이템 노트
```

### 6. Generate reviewable DB artifacts

Check the repo's scripts first.

Preferred command if available:

```bash
npm run archive:item:upsert -- <seed-dir>
```

If the repo uses a generic archive upsert command, use that.

If only the existing spot command is available and it accepts generic ArchiveContent seed directories, use it only after confirming the script is not place-specific:

```bash
npm run archive:spot:upsert -- <seed-dir>
```

Expected outputs:

- `item-seed.archive-content.db-row.json`
- `item-seed.archive-content.upsert.sql`

If the existing upsert script writes `spot-seed.*` filenames only, do not rename silently. Report the mismatch and either adapt with a generated item-specific artifact or leave a code note.

### 7. Apply to DB only when requested

Apply only when the user clearly wants DB mutation and required env values are configured.

Preferred command if available:

```bash
npm run archive:item:upsert -- <seed-dir> --apply
```

If using a generic or spot-compatible command, state which command was used in the final report.

Never print service keys.

If `fetch failed` occurs after local generation passes, retry once before stopping.

### 8. Verify preview API

Use the archive id from the generated output.

Check the admin preview API when a preview token is configured.

Verify:

- `isPublished` remains false for drafts
- headings match the standard Korean order
- no product-review or English memo headings remain
- at least two `image-slot:*` image blocks exist when supported
- structuredInfo is reader-facing Korean
- subtitle, summary, and SEO description do not contain placeholders
- no purchase-pressure language appears

## Fail Conditions

Stop and revise before DB apply if any final `ArchiveContent` field contains:

- English memo headings: `Quick Facts`, `Pros and Cons`, `Product Review`, `Recommendation`, `Best Products`, `Spec Summary`
- Korean internal headings: `콘텐츠 초안`, `아이템 리뷰`, `추천 제품`, `제품 상세`, `스펙 요약`
- ranking or ad language: `TOP`, `베스트`, `최고`, `필수템`, `인생템`, `구매각`, `무조건`
- placeholder copy such as `리서치 기반 시드 초안`, `seed draft`, `콘텐츠 초안`
- raw enum/internal labels in user-facing fields
- internal research words such as `신호`, `시그널`, or `signal` in user-facing body, subtitle, summary, SEO, CTA, or structuredInfo
- unsupported medical, recovery, sleep-improvement, pain-relief, or skin-improvement claims
- product specs or price claims without source/date boundary
- product image usage that lacks rights status
- overly long `structuredInfo.priceRange` that reads like a paragraph
- missing hero image
- fewer than two inline image slots for item note pages when image blocks are supported
- no CTA connected to save, ritual, timer, related content, or submission
- `isPublished: true` while publish blockers remain

## Verification Commands

Generate only, preferred if available:

```bash
npm run archive:item:upsert -- outputs/item-archive/{slug}/seed
```

Apply, preferred if available:

```bash
npm run archive:item:upsert -- outputs/item-archive/{slug}/seed --apply
```

If the repo only has a generic archive command, use that and report it.

Preview API check pattern:

```bash
curl -s 'https://admin.getbathtime.com/api/archive-preview/{id}?token={token}' \
  | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const j=JSON.parse(d);const body=j.content?.body||[];const headings=body.filter(b=>b.type==='heading').map(b=>b.text);const imageBlocks=body.filter(b=>b.type==='image').map(b=>b.uri);const badWords=['TOP','베스트','최고','필수템','인생템','구매각','신호','시그널','signal'];const text=JSON.stringify(j.content||{});console.log(JSON.stringify({id:j.content?.id,isPublished:j.content?.isPublished,headings,imageBlocks,badWords:badWords.filter(w=>text.includes(w)),structuredInfo:j.content?.structuredInfo},null,2));})"
```

## Final Response

Report only the operational result:

- target slug/id
- whether `item-seed.archive-content.ts` was updated
- whether DB artifacts were generated
- whether DB apply succeeded
- preview verification result
- preview URL when available
- remaining blockers
- which upsert command was used

Mention that `outputs/` may be gitignored when relevant, so generated seed changes may not appear in `git status`.
