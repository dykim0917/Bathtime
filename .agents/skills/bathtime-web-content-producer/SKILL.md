---
name: bathtime-web-content-producer
description: Use this skill when turning Bathtime spot seed artifacts into publish-ready web archive content. Trigger when the user references spot-seed.canonical.json, spot-seed.archive-content.ts, spot-seed.mapping.md, image placement, hero images, body content structure, SEO copy, publish blockers, or asks to prepare bath/spa/sauna place content for the actual Bathtime website.
metadata:
  short-description: 배스타임 웹 아카이브 콘텐츠 제작
---

# Bathtime Web Content Producer

## Purpose

Turn seed artifacts into a web-ready content package for Bathtime archive pages without inventing facts or erasing uncertainty.

This skill starts after `bathtime-spot-seed-builder` has produced files such as:

- `spot-seed.canonical.json`
- `spot-seed.archive-content.ts`
- `spot-seed.mapping.md`

## Core Workflow

1. Inspect the target files and current app renderer.
   - Read the referenced seed files first.
   - Check `src/archive/types.ts`, `src/components/web/ArchiveVisual.tsx`, `src/components/web/ContentBodyRenderer.tsx`, and `src/archive/seed.ts` when implementation details matter.
   - Confirm whether the request is for a content plan, file edits, or publish QA.

2. Create a publish package before changing production seed files.
   - Recommended filename: `spot-seed.web-content.md` beside the seed files.
   - Include: page title, subtitle, summary, final body block order, hero image plan, inline image placement brief, SEO fields, CTA/link notes, publish blockers, and final checklist.
   - Keep factual claims traceable to the canonical JSON or mapping report.

3. Shape the content for the current archive UI.
   - `ArchiveContent.title`: short Korean display title.
   - `subtitle`: one editorial angle, not a fact dump.
   - `summary`: compact place description suitable for cards and SEO.
   - `body`: use headings, paragraphs, quotes, lists, dividers, and image blocks only as supported by `ContentBodyBlock`.
   - `structuredInfo`: keep unknowns visible when access, price, reservation, or policy are not verified.

4. Plan images explicitly.
   - For immediate safe publishing, use existing `category-*` fallback image URIs unless a verified image URL or owned asset exists.
   - If using a remote image URL, confirm rights and set `heroImage.sourceType` to `official`, `licensed`, or `owned` only when true.
   - If proposing local assets, specify destination paths under `assets/images/` and note any code changes needed to resolve them.
   - Do not use user-review photos, map screenshots, or third-party images without a clear rights basis.
   - Always write meaningful Korean `alt` text.
   - Add planned inline image slots even when the actual image is not ready, so another team member can source or shoot the right image later.
   - For each inline slot, specify where it appears in the body, what decision it helps the reader make, the desired image mood/composition, acceptable sources, rights requirements, and fallback behavior.
   - Avoid vague prompts such as "nice spa photo"; describe observable subjects, angle, framing, and what must not appear.
   - Do not add decorative images that do not support a reader decision. Every image slot should clarify place atmosphere, facility type, access, price/policy, or usage context.

5. Decide publish status conservatively.
   - Keep `isPublished: false` if any publish blockers remain.
   - Only recommend `isPublished: true` when access, price or price uncertainty, operating hours, image rights, and source confidence are acceptable for publication.
   - Never hide uncertainty just to make copy sound cleaner.

6. If asked to implement, make surgical edits.
   - Update only the relevant seed/content files and required asset resolver code.
   - Preserve existing style and TypeScript shapes.
   - Re-open edited files and check UTF-8 Korean text, imports, object syntax, and `ArchiveContent` compatibility.

7. If asked to update the DB, use the repo's archive upsert path.
   - Confirm the archive DB migrations exist: `db/migrations/2026-05-18_archive_content.postgres.sql` and `db/migrations/2026-05-18_archive_content_rls.postgres.sql`.
   - Generate reviewable artifacts first:
     `npm run archive:spot:upsert -- <seed-dir>`
   - This writes `spot-seed.archive-content.db-row.json` and `spot-seed.archive-content.upsert.sql` beside the seed files.
   - Apply directly only when the user clearly wants DB mutation and `CONTENT_DB_REST_URL` plus `CONTENT_DB_SERVICE_ROLE_KEY` are configured:
     `npm run archive:spot:upsert -- <seed-dir> --apply`
   - Keep `isPublished: false` / `status: draft` when publish blockers remain.

## Web Content Package Template

```md
# Web Content Package: {spot title}

## Source Files
- Canonical JSON:
- App archive seed:
- Mapping report:

## Page Content
- Title:
- Subtitle:
- Summary:
- Tags:
- Content type:
- Publish status:

## Body Structure
1. Hero/editorial lead:
2. What this place is:
3. Good for:
4. Check before visiting:
5. Access/price note:
6. Closing note:

## Inline Image Placement Brief
| Placement | Purpose | Desired image direction | Acceptable source | Rights/status | Fallback |
| --- | --- | --- | --- | --- | --- |
| After section 1 | Establish the actual bath/place atmosphere before practical details. | Horizontal image of the bath entrance, lobby sign, official bath area photo, or quiet hotel-bath mood. Avoid crowded people, faces, or unreadable screenshots. | Owned photo, official press/website image with permission, licensed stock, or generated fallback. | Confirm before publishing. | Omit slot or show `category-place` fallback until ready. |
| After section 3 | Help readers judge whether the visit context fits them. | Context image such as hotel exterior, nearby street approach, amenity detail, changing-room neutral detail, or sauna material texture. No user-review photos without permission. | Owned photo, official image with permission, licensed stock, or generated fallback. | Confirm before publishing. | Keep text-only body if no safe image exists. |

## Image Plan
| Slot | URI/path | Source type | Alt | Notes |
| --- | --- | --- | --- | --- |
| Hero | `category-place` | `generated` |  | Safe fallback until owned/official image is ready. |
| Inline 1 |  |  |  | Must match the first row of Inline Image Placement Brief. |
| Inline 2 |  |  |  | Optional; use only if it helps the reader decide. |

## SEO
- SEO title:
- SEO description:
- Canonical URL:
- OG image:

## Publish Blockers
- 

## Final Checklist
- [ ] No unsupported factual claims
- [ ] Unknown access/price/policy details remain visible
- [ ] Image rights are acceptable
- [ ] Korean copy is natural and not over-claiming wellness benefits
- [ ] `ArchiveContent` fields match `src/archive/types.ts`
```

## Copy Rules

- Prefer practical, place-specific editorial copy over glossy travel copy.
- Write for someone deciding whether this bath place fits their day.
- Use clear uncertainty language: "확인 필요", "공식 정보만으로는 확인되지 않음", "투숙객 중심으로 보는 것이 안전".
- Avoid medical or guaranteed-effect claims such as 치료, 완화, 효능, 회복 보장, 불면 해결, 통증 개선.
- Avoid pretending a researched place was personally visited unless `contentType` is `VISITED` or source files prove it.

## Output Expectations

When the user asks for "실제 웹 업로드용 콘텐츠", provide or create:

- `spot-seed.web-content.md`: editorial and image placement plan
- Optional updated `spot-seed.archive-content.ts`: only if the user wants implementation
- Optional `spot-seed.archive-content.db-row.json` and `spot-seed.archive-content.upsert.sql`: when DB update is requested
- Optional asset/code notes: exact image path or resolver change required
- A concise verification summary with remaining blockers
