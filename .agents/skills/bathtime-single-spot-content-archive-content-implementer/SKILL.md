---
name: bathtime-single-spot-content-archive-content-implementer
description: Implement Bathtime single spot content web packages into ArchiveContent seed files and DB draft rows. Use when the user wants spot-seed.web-content.md or spot-seed.canonical.json turned into spot-seed.archive-content.ts, wants archive content upserted to Supabase/PostgREST, asks why draft content is showing internal memo text, or asks to verify Bathtime archive preview pages for bad headings, raw enum labels, image slots, structuredInfo readability, and draft/publish status.
metadata:
  short-description: 바스타임 단일 장소 ArchiveContent 구현·DB 반영
---

# Bathtime Single Spot Content ArchiveContent Implementer

This skill is the final implementation step between `bathtime-single-spot-content-web-content-producer` and the live Bathtime archive database.

Use it to convert a reviewed single spot content web package into the actual `ArchiveContent` object that the app and DB use.

## Position In The Pipeline

1. `bathtime-single-spot-content-researcher`: researches the place and writes research artifacts.
2. `bathtime-single-spot-content-seed-builder`: converts research artifacts into canonical seed files.
3. `bathtime-single-spot-content-web-content-producer`: writes the editorial web content package and image plan.
4. `humanize-korean`: removes AI-like Korean patterns without changing facts.
5. Final Observer Essay Tone Pass: aligns reader-facing body copy to Bathtime's calm `한다체`.
6. `bathtime-single-spot-content-archive-content-implementer`: updates `spot-seed.archive-content.ts`, generates DB upsert artifacts, optionally applies the upsert, and verifies preview output.

Do not reuse facts, image plans, or assumptions from previous single spot content. Treat each seed directory as a fresh place.

## Inputs

Prefer a seed directory containing:

- `spot-seed.canonical.json`
- `spot-seed.web-content.md`
- `spot-seed.archive-content.ts`
- `spot-seed.mapping.md`

If `spot-seed.web-content.md` is missing, either ask the user to run `bathtime-single-spot-content-web-content-producer` first or make a clearly scoped implementation draft from the canonical JSON only.

## Required Repo Context

Before editing a new repo or after renderer changes, check:

- `src/archive/types.ts` for `ArchiveContent`, `ContentBodyBlock`, and `PlaceStructuredInfo`
- `src/components/web/ContentBodyRenderer.tsx` for supported body blocks
- `src/components/web/ArchiveVisual.tsx` for image fallback behavior
- `scripts/upsert_archive_content_from_spot_seed.mjs` for upsert and guard behavior

For this repo, `ContentBodyBlock` supports:

```ts
{ type: 'paragraph'; text: string }
{ type: 'heading'; text: string }
{ type: 'image'; uri: string; caption?: string }
{ type: 'quote'; text: string }
{ type: 'list'; items: string[] }
{ type: 'divider' }
```

## Core Workflow

1. Read the target seed files.
   - Start with `spot-seed.web-content.md` and `spot-seed.canonical.json`.
   - Compare them against the current `spot-seed.archive-content.ts`.
   - Identify drift: memo headings, placeholder copy, raw enums, missing image slots, stale publish status, or facts that the web package intentionally corrected.

2. Decide if implementation is allowed.
   - Proceed when the user asked to update, DB upsert, preview, continue batch processing, or otherwise clearly wants implementation.
   - Keep `isPublished: false` unless the user explicitly asks to publish and all blockers are resolved.
   - If access, price scope, facility identity, operating hours, or image rights are unresolved, keep draft status.

3. Update `spot-seed.archive-content.ts`.
   - Use `apply_patch` for manual edits.
   - Preserve the repo's `ArchiveContent` shape.
   - Use Korean reader-facing body headings in this order:
     1. `한 줄 판단`
     2. `어떤 곳인가`
     3. `이런 날에 맞는다`
     4. `좋게 볼 수 있는 점`
     5. `아쉬운 점`
     6. `가기 전에 확인할 것`
     7. `저장해둘 이유` or `문의 전 메모`
   - `한 줄 판단` must render as exactly one short sentence in one paragraph, ideally 35-55 Korean characters. Move any extra explanation into the next section.
   - Keep reader-facing Korean in calm `한다체` across headings, body paragraphs, lists, CTAs, and captions.
   - Do not convert single spot content to warm `해요체` during implementation unless the user explicitly asks for it.
   - Before DB apply, search final body copy for unintended casual endings such as `해요`, `돼요`, `예요`, `이에요`. Literal phone questions, actual button labels, or quoted user-copyable lines may remain as recorded exceptions.
   - Insert at least two inline image blocks when supported:
     - first after the verdict or first practical paragraph;
     - second after `이런 날에 맞는다` or before `가기 전에 확인할 것`.
   - Use `image-slot:{spot-slug}-atmosphere` and `image-slot:{spot-slug}-context` unless the existing web package specifies better slot IDs.
   - Keep image captions as sourcing briefs for staff: desired subject, acceptable source, rights requirement, and forbidden sources.

4. Make `structuredInfo` reader-facing.
   - Do not expose raw values such as `hotel_public_bath`, `hotel_sauna`, `fitness_club`, `indoor_pool`, `spa`, `unknown` as facility labels.
   - Convert facility types into Korean labels such as `호텔 대욕장`, `호텔 사우나`, `내탕`, `냉탕`, `고온 사우나`, `피트니스 클럽`, `실내 수영장`, `스파 연계 시설`.
   - Keep unknowns specific:
     - `비투숙객 단독 이용 가능 여부는 공식 정보 기준 미확인`
     - `단독 이용 요금은 전화 확인 필요`
     - `숙박/회원 조건 확인 필요`
   - If the TypeScript enum field must remain an enum, use the closest valid enum value, but put the reader-facing explanation in adjacent text fields.
   - Do not use internal research words such as `신호`, `시그널`, or `signal` in subtitle, summary, body, SEO, or structuredInfo. Convert them to reader-facing source language:
     - official facts: `공식 페이지에서 확인된다`, `공식 안내에 따르면`, `공식 요금표 기준`
     - reviews: `후기에서 언급된다`, `최근 후기에서는 ... 이야기가 나온다`
     - uncertainty: `방문 전 확인이 필요하다`, `...로 보는 편이 안전하다`
   - Keep `structuredInfo.priceRange` short and scan-friendly:
     - aim for about 40 Korean characters or less;
     - include only representative price or 1-2 key ranges;
     - move full pricing tables, source explanations, parking, overtime fees, package details, and long caveats into body copy or checklists.
     - examples: `1인 44,000원`, `17,000~30,000원`, `사우나 13,000원 / 찜질 17,000~19,000원`, `요금 미공개 · 전화 확인`.

5. Generate reviewable DB artifacts.
   - Run:
     `npm run archive:spot:upsert -- <seed-dir>`
   - This must succeed before applying.
   - It writes:
     - `spot-seed.archive-content.db-row.json`
     - `spot-seed.archive-content.upsert.sql`

6. Apply to DB only when requested.
   - Run:
     `npm run archive:spot:upsert -- <seed-dir> --apply`
   - This uses local env values. Never print service keys.
   - If `fetch failed` occurs after local generation passes, retry once before stopping.

7. Verify preview API.
   - Use the archive id from the generated output.
   - Check the admin preview API when a preview token is configured:
     `https://admin.getbathtime.com/api/archive-preview/{id}?token={token}`
   - Verify:
     - `isPublished` remains false for drafts.
     - headings match the standard Korean order.
     - `badHeadings` is empty.
     - at least two `image-slot:*` image blocks exist.
     - `structuredInfo.facilityTypes` is reader-facing Korean.
     - subtitle, summary, and seo description do not contain seed placeholders.

## Fail Conditions

Stop and revise before DB apply if any final `ArchiveContent` field contains:

- English memo headings: `Short Situation Summary`, `Quick Facts`, `What This Place Seems Good For`, `What To Check Before Visiting`, `Good Points`, `Weak Points`, `Fit For`, `Not Fit For`, `Source And Update Note`, `CTA Suggestions`
- Korean internal headings: `콘텐츠 초안`, `추천 상황`, `비추천 상황`, `방문 전 체크`, `아카이브 메모`
- markdown quick-facts table text inside `body`
- placeholder copy such as `리서치 기반 시드 초안`, `seed draft`, `콘텐츠 초안`
- raw enum/internal labels in user-facing fields
- internal research words such as `신호`, `시그널`, or `signal` in user-facing body, subtitle, summary, SEO, or structuredInfo
- overly long `structuredInfo.priceRange` that reads like a paragraph instead of a short price summary
- missing hero image
- fewer than two inline image slots for researched place pages when image blocks are supported
- `isPublished: true` while publish blockers remain

## Verification Commands

Generate only:

```bash
npm run archive:spot:upsert -- outputs/spot-archive/{slug}/seed
```

Apply:

```bash
npm run archive:spot:upsert -- outputs/spot-archive/{slug}/seed --apply
```

Preview API check pattern:

```bash
curl -s 'https://admin.getbathtime.com/api/archive-preview/{id}?token={token}' \
  | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const j=JSON.parse(d);const body=j.content?.body||[];const headings=body.filter(b=>b.type==='heading').map(b=>b.text);const imageBlocks=body.filter(b=>b.type==='image').map(b=>b.uri);console.log(JSON.stringify({id:j.content?.id,isPublished:j.content?.isPublished,headings,imageBlocks,structuredInfo:j.content?.structuredInfo},null,2));})"
```

## Final Response

Report only the operational result:

- target slug/id
- whether `spot-seed.archive-content.ts` was updated
- whether DB artifacts were generated
- whether DB apply succeeded
- preview verification result
- public preview URL when available
- remaining blockers, if any

Mention that `outputs/` may be gitignored when relevant, so generated seed changes may not appear in `git status`.
