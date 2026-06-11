---
name: bathtime-spot-guide-researcher
description: Research public information, official policies, map/platform signals, review patterns, and verification gaps for Bathtime spot guide content. Use for sauna, spa, hotel sauna, private spa room, bathhouse, and bathtub-stay criteria or candidate-frame articles where the goal is to organize evidence and uncertainty rather than publish a single-place review.
metadata:
  short-description: 바스타임 스팟 가이드 리서치
---

# Bathtime Spot Guide Researcher

Research only what supports the approved guide angle.

Inputs should include:

```text
spot_guide_angle_brief.md
spot_guide_angle_record.json
spot_guide_research_plan.md
```

## Outputs

Create or update:

```text
spot_guide_research_sources.md
spot_guide_research_record.json
spot_guide_content_draft.md
spot_guide_verification_checklist.md
spot_guide_missing_fields.md
```

For candidate-frame work, also create:

```text
candidate_research/candidate-type-map.md
candidate_research/candidate-sources.json
candidate_research/candidate-verification-gaps.md
```

## Research Depth By Mode

### `principle`

Research can be light. Focus on:

- internal editorial principle
- recurring information problems
- source transparency rules
- future evidence categories

Do not overfit the manifesto to random search snippets.

### `criteria`

Collect practical examples of uncertainty:

- official access policy ambiguity
- guest-only/member-only restrictions
- reservation or time limits
- old platform information
- facility-photo uncertainty
- bath/tub/private-room condition uncertainty
- repeated review patterns about crowding, cleanliness, quietness, or rest area quality

### `candidate-frame`

Use web research heavily, but keep candidates as candidates.

For each candidate, record:

- name
- official URL when available
- map/reservation URL when useful
- source status
- external-use/access status
- price or price uncertainty
- reservation need
- facility types
- solo/couple/family fit signals
- review depth level
- last checked date
- missing verification items

Do not call candidates `recommended`, `best`, or `verified` unless direct evidence supports that exact claim.

## Source Rules

Prefer official sources first:

- official website
- hotel/facility page
- reservation page
- official Instagram or notice

Then use:

- Naver Map/Kakao Map/Google Maps
- booking or reservation platforms
- long-form blogs
- public community/social posts

When web fetch fails for an official URL, retry once with local HTTP fallback such as:

```bash
curl -L --max-time 20 -A 'Mozilla/5.0' '<url>'
```

Record the fallback result.

## Review Pattern Rules

Never treat a single review as fact.

Use language like:

- `후기에서 반복적으로 언급된다`
- `최근 후기 일부에서 보인다`
- `리뷰 기준으로는 확인이 더 필요하다`

Review depth labels:

- `deep`: 20+ signals from 4+ source baskets
- `medium`: 8-19 signals from 3+ source baskets
- `shallow`: fewer than 8 signals or fewer than 3 baskets
- `unavailable`: meaningful review sources could not be found or accessed

## Required Guardrails

Do not:

- write a final web page
- invent direct-visit experience
- rank candidates
- copy long review text
- use unlicensed images
- hide unresolved access, price, reservation, or policy questions
