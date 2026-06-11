---
name: bathtime-item-note-seed-builder
description: Convert Bathtime Item Note research outputs into database-ready seed artifacts. Use when the user provides or references item_archive_record.json, item_content_draft.md, item_sns_summary.md, item_research_sources.md, item_missing_fields.md, item_verification_checklist.md, or item_angle_brief.md and wants canonical seed JSON, app ArchiveContent seed files, Prisma seed code, SQL/Postgres/Supabase seed files, or CMS import JSON for Bathtime item note content.
metadata:
  short-description: 배스타임 아이템 노트 시드 빌더
---

# Bathtime Item Note Seed Builder

## Purpose

Turn `bathtime-item-note-researcher` outputs into insertion-ready seed artifacts without inventing facts, hiding uncertainty, or turning item notes into product reviews.

The pipeline is:

1. Angle brief and research output files
2. Canonical item seed JSON
3. Requested delivery format: app ArchiveContent seed, Prisma seed, SQL/Postgres seed, Supabase seed, CMS import JSON, or DB row/upsert artifact

## Input Files

Accept a folder or individual files. Prefer reading all available files:

- `item_angle_brief.md` as the source of editorial angle and non-goals
- `item_angle_record.json` as the source of angle metadata
- `item_archive_record.json` as the source of structured facts
- `item_content_draft.md` as the source of body copy
- `item_sns_summary.md` as optional distribution copy
- `item_research_sources.md` as source/provenance data
- `item_missing_fields.md` as unresolved data
- `item_verification_checklist.md` as operator QA requirements

If `item_archive_record.json` is missing, stop and ask for it unless the user explicitly wants a best-effort draft from markdown only.

If `item_angle_brief.md` is missing, preserve the researcher's angle assumptions and mark the angle source as `researcher_assumption`.

## Core Workflow

### 1. Inspect the target repository

Before choosing a seed format, check the repo for:

- `src/archive/types.ts`
- `src/archive/seed.ts`
- `src/components/web/ContentBodyRenderer.tsx`
- `src/components/web/ArchiveVisual.tsx`
- `db/migrations/`
- `scripts/*seed*`
- `scripts/*archive*`
- `outputs/`
- existing item or archive content examples

Do not assume the spot seed schema is identical to item note schema. Reuse compatible fields, but create item-specific structured info when needed.

### 2. Build canonical item seed JSON first

Create `item-seed.canonical.json` before generating TS, SQL, CMS, or DB artifacts.

Preserve:

- angle type
- reader question
- ritual job
- non-goals
- product/category boundary
- verified facts
- source claims
- review patterns
- missing fields
- publish blockers
- image rights status

Keep unknown fields as `null`, `"unknown"`, or a specific reader-facing uncertainty note rather than guessing.

### 3. Validate the canonical seed

Confirm:

- deterministic item ID
- slug
- title
- content type
- category/tags
- body blocks
- item structured info
- source records
- verification notes
- image plan placeholders
- CTA targets
- publish status

Dates should use ISO `YYYY-MM-DD` when day precision is available.

For Korean output on Windows/PowerShell, verify generated files with UTF-8 reads. Avoid embedding Korean literals in shell-piped scripts unless using UTF-8-safe execution or Unicode escapes.

### 4. Convert to requested output format

If no output format is specified, produce:

- `item-seed.canonical.json`
- `item-seed.archive-content.ts`
- `item-seed.mapping.md`

For Bathtime web/app archive content, prefer an `ArchiveContent`-compatible object unless the DB schema says otherwise.

### 5. Report mapping decisions

Include a concise mapping summary:

```text
source field -> canonical field -> target field
```

List:

- skipped fields and why
- unresolved fields that block publication
- fields carried into QA notes
- item-specific fields that do not fit the current ArchiveContent type
- renderer/code changes needed for item structuredInfo if any

Re-open generated JSON/TS/SQL/CMS files and check for replacement characters or mojibake before reporting success.

## Item Seed Naming

Use these filenames:

- `item-seed.canonical.json`
- `item-seed.archive-content.ts`
- `item-seed.mapping.md`
- `item-seed.cms-import.json`
- `item-seed.prisma.ts`
- `item-seed.postgres.sql`
- `item-seed.supabase.json`

For multiple items, produce an array in canonical JSON and deterministic IDs for each item.

## Output Location

Use the repo convention:

```text
outputs/item-archive/{item-slug}/
outputs/item-archive/{item-slug}/seed/
```

If a folder already exists, read it first and update it instead of starting over. Do not discard existing angle, research, source, or verification artifacts.

## Canonical Seed Shape

Use this general shape for `item-seed.canonical.json`.

```json
{
  "id": "",
  "slug": "",
  "content_type": "item_note",
  "status": "draft",
  "isPublished": false,
  "title": "",
  "subtitle": "",
  "summary": "",
  "category": "bath_items",
  "tags": [],
  "angle": {
    "angle_type": "",
    "reader_question": "",
    "bathtime_thesis": "",
    "ritual_job": "",
    "non_goals": []
  },
  "item": {
    "item_name_ko": "",
    "item_name_en": "",
    "item_category": "",
    "item_subcategory": "",
    "item_scope": "category",
    "product_examples": []
  },
  "structuredInfo": {
    "useSituation": "",
    "ritualFit": "",
    "bathtubNeeded": "",
    "waterNeeded": "",
    "outletNeeded": "",
    "storageDifficulty": "",
    "cleaningDifficulty": "",
    "dailyUseLikelihood": "",
    "priceRange": "",
    "bestFor": [],
    "notFor": [],
    "togetherWith": []
  },
  "body": [],
  "heroImage": {
    "uri": "category-item",
    "sourceType": "fallback",
    "alt": "",
    "caption": "",
    "rightsStatus": "fallback_until_owned_or_licensed_image"
  },
  "inlineImageSlots": [],
  "ctas": [],
  "sources": [],
  "quality": {
    "missing_fields": [],
    "publish_blockers": [],
    "verification_checklist": [],
    "confidence_overall": "unknown",
    "last_researched_at": "",
    "last_updated_at": ""
  },
  "seo": {
    "title": "",
    "description": "",
    "keywords": []
  }
}
```

## Mapping Rules

### Angle mapping

Map:

- `bathtime_thesis` -> subtitle, reader verdict, and first quote/callout
- `reader_question` -> SEO/question framing and opening paragraph
- `ritual_job` -> `structuredInfo.ritualFit` and body section `어떤 의식을 돕나요`
- `non_goals` -> quality guardrails and web package QA

### Practical burden mapping

Map:

- `storage_difficulty` -> reader-facing `structuredInfo.storageDifficulty`
- `cleaning_difficulty` -> reader-facing `structuredInfo.cleaningDifficulty`
- `drying_difficulty` -> body check section or structuredInfo note
- `prep_hassle` -> `사기 전에 먼저 볼 것`
- `aftercare_hassle` -> `아쉬운 점` or `정리 과정`
- `daily_use_likelihood` -> reader verdict or structuredInfo

### Price mapping

`structuredInfo.priceRange` must be short and scan-friendly.

Good:

```text
1만~3만 원대
3만~10만 원대
가격대 넓음 · 옵션별 차이 큼
요금 변동 가능 · 검색일 기준 확인
```

Bad:

```text
공식 페이지와 여러 쇼핑몰 기준으로 옵션 A는 39,900원, 옵션 B는 89,000원이고 배송비는 ...
```

Move detailed price notes to body copy or publish blockers.

### Product example mapping

If product examples are included:

- mark them as examples, not recommendations
- include source and date
- do not imply ranking
- do not include affiliate links unless disclosure is available
- include product image URLs when useful and available, with explicit rights status
- do not download, rehost, crop, edit, or imply ownership of external product images unless rights are verified
- keep unresolved public-publish image rights in publish blockers

### Image mapping

Use safe fallback images unless owned, official, or licensed images are available.

For product candidate cards, official/public product-page image URLs may be referenced in private drafts when they are clearly tied to the candidate product and `imageRightsStatus` says Bathtime does not own the asset. This is different from downloading or rehosting a product photo.

Suggested fallback tokens:

- `category-item`
- `category-home-bath`
- `category-footbath`
- `category-shower`
- `category-bath-care`
- `image-slot:{item-slug}-ritual-context`
- `image-slot:{item-slug}-decision-card`

Do not use review photos, marketplace screenshots, or brand images without rights.

## Guardrails

- Do not add factual claims beyond the research artifacts.
- Do not turn review patterns into verified facts.
- Do not mark content as published unless the user asks and verification is complete.
- Do not discard `item_missing_fields.md`; carry it into `quality.missing_fields`.
- Do not discard the angle brief; carry the angle into `angle` and mapping notes.
- Do not silently choose a destructive SQL operation. Prefer upserts or draft inserts.
- Do not write directly to production DBs. Generate files for review unless the user explicitly asks for execution.
- Do not make purchase CTAs primary unless the user explicitly requested commerce and disclosure is handled.
- Do not write `추천템`, `필수템`, `TOP`, `베스트`, `인생템` in canonical user-facing fields.

## ArchiveContent Guidance

When generating `item-seed.archive-content.ts`, use the current renderer-supported body block types only.

If the repo supports only:

```ts
{ type: 'paragraph'; text: string }
{ type: 'heading'; text: string }
{ type: 'image'; uri: string; caption?: string }
{ type: 'quote'; text: string }
{ type: 'list'; items: string[] }
{ type: 'divider' }
```

then convert item-specific structures into those blocks.

Suggested item body order:

1. `한 줄 판단`
2. `어떤 의식을 돕나요`
3. `사기 전에 먼저 볼 것`
4. `좋게 볼 수 있는 점`
5. `아쉬운 점`
6. `이런 사람에게 맞아요`
7. `이런 사람에게는 애매해요`
8. `같이 쓰면 좋은 의식`
9. `저장해둘 이유`

## Validation Checklist

Before delivering seed artifacts, check:

- [ ] Item content type is `item_note` or the repo-equivalent.
- [ ] The content is not framed as a product ranking.
- [ ] The title and subtitle are Korean and reader-facing.
- [ ] The reader question and Bathtime thesis are preserved.
- [ ] Structured info uses reader-facing Korean labels.
- [ ] `priceRange` is short.
- [ ] Product examples are not presented as ranked recommendations.
- [ ] All unknowns remain visible and specific.
- [ ] Image rights status is explicit.
- [ ] CTA connects to save, ritual, timer, related content, or user submission.
- [ ] `isPublished` remains false by default.
- [ ] Generated files are UTF-8 clean.

## Final Response

Report:

- item slug/id
- files created or updated
- mapping summary
- unresolved fields
- publish blockers
- whether implementation or DB upsert is ready

Keep the report operational, not a second article draft.
