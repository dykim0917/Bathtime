---
name: bathtime-spot-guide-archive-content-implementer
description: Implement Bathtime spot guide web content packages into ArchiveContent seed files and private draft DB rows. Use after spot-guide web content is produced and humanized, when the user wants the guide applied as a draft preview, schema mapping checked, body blocks implemented, DB artifacts generated, or preview verified.
metadata:
  short-description: 바스타임 스팟 가이드 ArchiveContent 구현·DB 반영
---

# Bathtime Spot Guide ArchiveContent Implementer

Convert a reviewed spot guide web package into the actual ArchiveContent object and optional private draft DB row.

## Inputs

Prefer:

```text
seed/spot-guide-seed.canonical.json
seed/spot-guide-seed.web-content.humanized.md
seed/spot-guide-seed.web-content.md
seed/spot-guide-seed.archive-content.ts
seed/spot-guide-seed.mapping.md
```

Use the humanized package as primary input when available.

## Repo Checks

Before editing a new repo or after schema changes, check:

- `src/archive/types.ts`
- archive content mapper
- body renderer
- archive upsert scripts
- existing spot/item seed patterns

## Implementation Rules

- Keep `status: 'draft'`.
- Keep `isPublished: false`.
- Use `바스타임` in visible copy.
- Preserve source transparency near the top.
- Preserve publish blockers.
- Do not introduce direct-visit claims.
- Do not turn candidate sections into rankings.

Preferred content type:

```ts
content_type: 'spot_guide'
```

If unsupported, use the closest supported value and record the mismatch in mapping notes and quality blockers.

## Body Blocks

Use renderer-supported blocks only. Typical supported blocks:

```ts
{ type: 'paragraph'; text: string }
{ type: 'heading'; text: string }
{ type: 'image'; uri: string; caption?: string }
{ type: 'quote'; text: string }
{ type: 'list'; items: string[] }
{ type: 'divider' }
```

For principle or criteria content, checklist-card image blocks are useful but not mandatory when no asset exists. If image generation is requested, use generated non-branded images and record rights status.

## DB Artifact And Apply

Generate artifacts before applying.

If repo tooling accepts guide seed files, use it.

If only spot seed tooling exists, adapt the guide ArchiveContent to the closest supported spot seed file name only when safe. Otherwise stop and report the tooling gap.

Apply to DB only when requested or when the orchestrator is in apply-draft mode and env is present.

Never print service keys or preview tokens.

## Preview Verification

Verify:

- draft status
- title renders
- body headings render
- source transparency appears near the top
- no fake direct-visit claim
- no ranking language
- CTA/tip invitation works as text
- generated or fallback images resolve when present

For candidate-frame content, also verify:

- candidate count
- every candidate has source status
- unresolved conditions remain visible

## Korean Register Consistency

Before DB apply, reader-facing Korean copy must keep one honorific/register level across headings, body paragraphs, lists, candidate cards, CTAs, and captions.

Default for spot guides is calm observer-style `한다체`, matching the broader Bathtime content voice.

Avoid headings such as `이런 사람에게 맞아요` and `이런 사람에게는 애매해요`; use `이런 사람에게 맞는다`, `이런 사람에게는 애매하다`, or shorter noun-phrase headings.

Do not convert spot guides to warm `해요체` during implementation unless the user explicitly asks for it.

Before DB apply, search final body copy for unintended casual endings such as `해요`, `돼요`, `예요`, `이에요`. Literal phone questions or button labels may remain as recorded exceptions.

Do not add `저장해둘 이유` as a fixed section. Spot guides should make their usefulness clear through criteria, source transparency, checklist value, and realistic next actions.

## Stop Conditions

Stop before DB apply when:

- schema mapping would misrepresent content
- content still reads like a recommendation ranking
- source boundaries disappeared during humanization
- direct-visit language appears without proof
- body renderer cannot support required blocks and no fallback is acceptable
