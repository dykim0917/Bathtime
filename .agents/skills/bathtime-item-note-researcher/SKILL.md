---
name: bathtime-item-note-researcher
description: Research bath-related item categories or products using an Item Angle Brief, then convert them into Bathtime structured item archive records, research notes, content drafts, source notes, and verification checklists. Use when the user wants to research, compare, verify, or write about bath items as ritual-support tools rather than generic product reviews.
metadata:
  short-description: 배스타임 아이템 노트 리서처
---
# Bathtime Item Note Researcher

## Purpose

Research bath-related item categories or products through the Bathtime lens, then produce structured item archive records, research notes, content drafts, source notes, and verification checklists.

Bathtime is not a shopping mall, affiliate ranking site, or generic product review blog. Treat products as tools that may help a bath ritual happen.

The main goal is to help users decide:

- What ritual does this item support?
- Is it realistic in my bathroom or daily life?
- What hidden preparation, cleaning, drying, storage, or safety burden does it create?
- Is a simpler alternative enough?
- What should I check before buying, using, or recommending it?
- Which Bathtime care archive, home ritual, or timer should it connect to?

## Required Previous Step

Prefer starting from `item_angle_brief.md` produced by `bathtime-item-note-ideator`.

If no angle brief exists, create a brief internal angle first and mark:

```text
angle_source: researcher_assumption
```

Do not default to a product ranking.

## Supported Item Types

Use this skill for bath, shower, body-care, rest, or home ritual support items such as footbath bowls, electric foot spas, half-bath tubs, bath trays, stools, mats, towels, bathrobes, lighting, candles, diffusers, bath salts, bath bombs, shower filters, shower heads, body brushes, scrub tools, and storage/drying accessories.

Use cautiously for fragrance, essential oil, skin-sensitive, heated electric, children-related, and heavy water-storage items.

Do not use this skill for medical devices, prescription or restricted medication, supplements, disease-treatment claims, regulated adult products, or unrelated lifestyle products.

## Input Types

Accept one or more of:

- `item_angle_brief.md`
- item category
- product name or product URL
- official brand URL
- retailer URL
- user-submitted item tip
- existing draft
- comparison topic
- update request

## Reference Loading

Load only the reference needed for the current step:

- Read [source-and-review-rules.md](references/source-and-review-rules.md) before browsing, source evaluation, review synthesis, or safety-sensitive claims.
- Read [item-archive-schema.md](references/item-archive-schema.md) before producing or validating structured JSON.
- Read [output-contract.md](references/output-contract.md) before writing final files or checking publish readiness.

## Core Workflow

1. Read the angle brief and rewrite it if it drifts into generic product ranking.
2. Build a source list from official, retailer, review, safety, and Bathtime internal context sources.
3. Extract hard facts separately from review patterns and editorial judgments.
4. Evaluate Bathtime fit: ritual job, setup burden, cleanup burden, storage burden, safety, and realistic use frequency.
5. Create the structured item archive record using the schema reference.
6. Create a content draft that is useful for `bathtime-item-note-web-content-producer`.
7. Create distribution summaries only after the archive record and draft are stable.
8. Create a human verification checklist for unresolved facts, prices, image rights, safety, and publish blockers.

## Required Output Files

Default output folder:

```text
outputs/item-note-archive/{item-slug}/research/
```

Required files:

- `item-research-notes.md`
- `item-archive-record.json`
- `item-content-draft.md`
- `item-source-notes.md`
- `item-verification-checklist.md`

## Public Copy Rules

Never present internal research labels to readers. In public copy, avoid `신호`, `시그널`, and `signal`; use natural Korean such as `후기에서 반복적으로 언급됩니다`, `일부 후기에서는 ...라고 말합니다`, or `공식 정보 기준으로는 확인되지 않습니다`.

Do not copy review paragraphs. Summarize patterns only.

## Quality Gate

Before finishing, verify:

- The angle is Bathtime-specific, not product-ranking copy.
- Facts, inferences, review patterns, and unknowns are separated.
- Required JSON fields are present or explicitly marked unknown.
- Safety-sensitive claims are cautious and sourced.
- Prices and availability are dated.
- Output files follow the required file contract.
