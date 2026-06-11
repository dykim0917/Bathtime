---
name: bathtime-spot-guide-seed-builder
description: Convert Bathtime spot guide angle and research artifacts into canonical seed files for criteria, manifesto, or candidate-frame archive content. Use after bathtime-spot-guide-ideator and bathtime-spot-guide-researcher to preserve mode, audience lens, source boundaries, candidate uncertainty, publish blockers, and ArchiveContent mapping decisions.
metadata:
  short-description: 바스타임 스팟 가이드 시드 빌더
---

# Bathtime Spot Guide Seed Builder

Convert spot guide research into database-ready seed artifacts without inventing facts or hiding uncertainty.

## Inputs

Prefer a folder containing:

```text
spot_guide_angle_brief.md
spot_guide_angle_record.json
spot_guide_research_plan.md
spot_guide_research_sources.md
spot_guide_research_record.json
spot_guide_content_draft.md
spot_guide_verification_checklist.md
spot_guide_missing_fields.md
```

Candidate-frame work may also include:

```text
candidate_research/
```

## Outputs

Create or update:

```text
seed/spot-guide-seed.canonical.json
seed/spot-guide-seed.archive-content.ts
seed/spot-guide-seed.mapping.md
```

If repo tooling cannot ingest `spot-guide-seed.archive-content.ts`, map to the closest supported spot seed format and explain the compromise in `spot-guide-seed.mapping.md`.

## Canonical Shape

The canonical JSON must preserve:

- id
- slug
- title
- content_type proposal
- status draft
- mode
- audience_lens
- reader_question
- bathtime_thesis
- non_goals
- source_transparency
- body outline
- structured guide info
- candidates, when applicable
- sources
- missing fields
- publish blockers
- verification checklist
- last researched date

For candidate-frame content, every candidate must remain a candidate. Include:

- `candidate_status`
- `access_status`
- `price_status`
- `reservation_status`
- `review_depth`
- `last_checked_at`
- `verification_gaps`

## Mapping Rules

Prefer:

```ts
content_type: 'spot_guide'
category: 'bath_spots'
status: 'draft'
isPublished: false
```

If the current app types do not support `spot_guide`, use the closest supported content type and record:

- source field
- canonical field
- target ArchiveContent field
- information lost or compressed
- follow-up schema recommendation

## Validation

Before reporting success:

- re-open generated JSON/TS files
- confirm Korean text is not mojibake
- confirm no direct-visit claim is introduced
- confirm title and visible copy use `바스타임`
- confirm no `추천 TOP`, `최고`, `무조건`, or fake recommendation language appears
- confirm unresolved facts are carried into quality fields
