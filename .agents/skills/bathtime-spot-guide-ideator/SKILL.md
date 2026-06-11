---
name: bathtime-spot-guide-ideator
description: Define the editorial angle, mode, audience lens, and risk boundary for Bathtime spot guide content before research. Use for outside-Bathtime manifesto posts, sauna/spa criteria articles, bathtub-stay checklists, private spa room decision guides, and cautious candidate-list frames that must not become rankings or fake firsthand reviews.
metadata:
  short-description: 바스타임 스팟 가이드 각도·타겟 설계
---

# Bathtime Spot Guide Ideator

Create the editorial angle before research.

This skill exists because spot guide content can easily drift into generic SEO, ranking posts, or disguised reviews. Start by defining what the article is allowed to do.

## Output Location

Use:

```text
outputs/spot-guide-archive/{guide-slug}/
```

Create or update:

```text
spot_guide_angle_brief.md
spot_guide_angle_record.json
spot_guide_research_plan.md
spot_guide_content_risk_note.md
```

If the idea is unsuitable, create:

```text
hold_or_reject_note.md
```

and stop before research.

## Mode

Pick exactly one:

- `principle`: brand/editorial stance, such as `밖에서 찾는 바스타임`
- `criteria`: practical checklist or standard
- `candidate-frame`: candidate-list frame without verified recommendation
- `visited-review-gate`: decide whether firsthand-review language is allowed

## Audience Lens

Pick one primary lens:

- `solo-quiet`: 혼자 조용히 쉬고 싶은 사람
- `couple-bathtub-stay`: 욕조 있는 숙소를 신중히 고르는 커플/동행
- `sauna-beginner`: 사우나와 스파를 처음 찾아보는 사람
- `family-practical`: 아이 또는 가족 단위로 조건을 확인해야 하는 사람
- `local-regular`: 동네 목욕탕이나 오래된 사우나를 다시 살펴보는 사람

Default for early content: `solo-quiet`.

## Required Brief Answers

The angle brief must answer:

- working title
- mode
- audience lens
- reader's real question
- Bathtime thesis
- what decision the content helps with
- why this is not a place review
- what sources are allowed
- what must remain uncertain unless checked
- future content links or follow-up guides

## Pass Gate

Pass only when:

- the title is sharper than a generic travel/search article
- one audience lens is primary
- the content is useful without place photos
- source transparency is explicit
- non-goals include no ranking, no fake firsthand claims, no hidden ads, no unlicensed images
- the research plan names official information, map/platform information, review-pattern checks, and last-checked dates when relevant

If the idea still sounds like `서울 사우나 추천 TOP 10`, revise or hold it.
