---
name: bathtime-item-note-web-content-producer
description: Turn Bathtime Item Note seed artifacts into publish-ready web archive content. Use when the user references item-seed.canonical.json, item-seed.archive-content.ts, item-seed.mapping.md, image placement, item note body structure, SEO copy, publish blockers, or asks to prepare bath item content for the actual Bathtime website.
metadata:
  short-description: 배스타임 아이템 노트 웹 콘텐츠 제작
---
# Bathtime Item Note Web Content Producer

Strict v1: this version enforces Item Note page shape, non-review framing, image placement, structuredInfo readability, source discipline, and Codex session hygiene.

## Purpose

Turn item seed artifacts into a web-ready content package for Bathtime Item Note archive pages without inventing facts, erasing uncertainty, or turning the piece into a shopping article.

This skill starts after `bathtime-item-note-seed-builder` has produced files such as:

- `item-seed.canonical.json`
- `item-seed.archive-content.ts`
- `item-seed.mapping.md`

## Core Principle

An Item Note page should help the reader decide whether a tool fits their bath ritual and daily life. It should not primarily persuade them to buy.

Good:

```text
족욕기, 매일 꺼내 쓸 수 있을까?
```

Bad:

```text
2026년 추천 족욕기 TOP 5
```

## Required Output Modes

Before writing, decide which mode the user asked for:

1. **Content QA mode**: evaluate whether the item can become a Bathtime Item Note.
2. **Web content package mode**: create `item-seed.web-content.md` with page copy, structured info, image plan, SEO, CTA, blockers, and QA.
3. **Implementation mode**: update `item-seed.archive-content.ts`, image references, DB row/upsert artifacts, or related renderer code.

If the user says “웹 업로드용”, “아카이브 콘텐츠”, “아이템 노트”, “시드”, “Codex로 돌려줘”, or references seed files, default to **Web content package mode** unless the user explicitly asks for implementation.

## Reference Loading

Load only the reference needed for the current step:

- Read [content-rules.md](references/content-rules.md) before writing public body copy, structured info, image plans, CTAs, publish decisions, or implementation details.
- Read [web-content-package-template.md](references/web-content-package-template.md) before generating `item-seed.web-content.md` or validating the final package.

## Core Workflow

1. Inspect the target seed files and renderer when implementation details matter.
2. Create `item-seed.web-content.md` before changing production seed files.
3. Shape content into archive UI fields: title, subtitle, summary, body blocks, structuredInfo, image plan, SEO, CTA, blockers, and quality gate.
4. Plan images explicitly. Images should clarify use, friction, comparison, storage, setup, cleanup, or ritual context.
5. When generated images are requested, add image generation prompts and asset paths to the Hero Image Plan / Inline Image Blocks. Do not replace fallback URIs unless the generated asset is hosted or app-addressable.
6. If implementing, update `item-seed.archive-content.ts`, then generate DB row/upsert artifacts with `npm run archive:item:upsert -- <seed-dir>`.
7. Keep draft content unpublished unless the user explicitly asks to publish and the publish blockers are resolved.

## Hard Output Contract

A valid `item-seed.web-content.md` must include these sections in this order:

1. `Page Content`
2. `Reader Verdict`
3. `Body Blocks`
4. `Structured Info`
5. `Hero Image Plan`
6. `Inline Image Blocks`
7. `SEO`
8. `CTA / Links`
9. `Publish Blockers`
10. `Quality Gate`

If any section is missing, the output is incomplete and must be fixed before delivery.

## Item Note Body Order

Use this order unless the seed or renderer requires otherwise:

1. `한 줄 판단`
2. `어떤 의식을 돕나요`
3. `사기 전에 먼저 볼 것`
4. `좋게 볼 수 있는 점`
5. `아쉬운 점`
6. `이런 사람에게 맞아요`
7. `이런 사람에게는 애매해요`
8. `같이 쓰면 좋은 의식`
9. `저장해둘 이유`

For a specific product, add source-scoped language near the top. For a category note, lead with the decision frame instead of a product recommendation.

## Reader Verdict Rules

The first body block must answer:

- What item/category is this?
- What ritual does it support?
- What is the biggest practical tradeoff?
- Who should keep reading?

## Implementation Notes

When implementing `item-seed.archive-content.ts`:

- Keep `isPublished: false` and `status: 'draft'` while facts, price, rights, disclosure, or safety review are unresolved.
- Do not expose raw internal enums or research labels in public content.
- Include body image blocks if the renderer supports them; otherwise leave a blocker/code note.
- Run `npm run archive:item:upsert -- <seed-dir>` after implementation when DB artifacts are needed.

## Quality Gate

Before finishing, verify:

- The page reads like Bathtime, not a shopping article.
- The structured info is reader-facing Korean, not raw database values.
- Image roles, alt text, rights status, and fallback behavior are explicit.
- Generated image prompt path, local asset path, and final hosted/app URI are separated when imagegen is used.
- Price copy is short and scan-friendly.
- Public copy does not use `신호`, `시그널`, or `signal`.
- Publish blockers are explicit and draft status is preserved when needed.
