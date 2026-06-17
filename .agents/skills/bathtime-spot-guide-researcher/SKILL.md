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

For candidate archive content, maximize recall before selection.
Do not cap the research to a small representative set just because the article can be written with fewer examples.
An archive should first build the widest candidate universe the agent can reasonably find, then sort candidates by evidence strength.

Run candidate discovery in three passes.

Wide discovery sweep:

- Search official/local web first, but do not stop there.
- Search SNS and community channels for place names that may not be well indexed on normal web search.
- Use keyword variants, including old facility names, colloquial names, region + facility type, and nearby landmark phrases.
- For Korean bath-place topics, include Instagram, YouTube, Naver Blog, Naver Cafe/community snippets, local news, regional tourism pages, map search, and reservation/travel platforms when accessible.
- Treat SNS/community as discovery sources, not verification sources.
- Record discovered-but-not-yet-verified names separately in `candidate_research/candidate-verification-gaps.md`.
- Do not decide the candidate count until after the wide discovery sweep.
- Do not discard a weak candidate only because it is not ready for the main card list. Keep it in a lower-confidence bucket.

Query expansion sweep:

- Search by exact concept keywords: `해수찜`, `해수탕`, `해수온천`, `해수사우나`, `해수찜질방`, `해수방`.
- Search by facility-composition keywords: `해수탕 찜질방`, `해수사우나 찜질방`, `해수온천 사우나`, `프라이빗 해수찜`.
- Search by region + concept, especially coastal regions and islands.
- Search by social phrasing: `새로 생긴`, `오픈`, `대형 찜질방`, `오션뷰 스파`, `공항 근처 찜질방`, `해수 스파`.
- Search for historical/old names that may survive in local memory.

Deduplication and bucket sweep:

- Merge renamed, rebranded, or nearby-name duplicates only after checking address or operator.
- Separate the universe into:
  - `main_candidate`: identity/location supported by official, local-government, map/place, or reservation evidence
  - `needs_more_info`: discovered through social/community/old web or thin listings, but still plausible
  - `probably_out_of_scope`: spa/onsen/sauna content where seawater or bath/rest fit is not supported
  - `closed_or_historical`: meaningful archive signal, but current operation is unlikely or unconfirmed

Verification ladder:

1. Official facility site, official notice, local government/tourism page, or public institution page.
2. Map/place detail page with address, phone, operating status, and recent activity.
3. Reservation/travel platform with current listing signals.
4. Repeated review/SNS/community signals.
5. Phone confirmation or direct visit, only when actually performed and documented.

Promote a discovered place into a main candidate only when at least one strong source from steps 1-3 supports its current identity and location.
If a place is visible mainly on SNS/community but lacks official/map support, keep it as `정보가 더 필요한 후보`.

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

Source role labels:

- `discovery`: useful for finding a candidate name or new facility
- `identity`: confirms name, address, phone, or official operator
- `condition`: helps check operating hours, pricing, access, reservation, facility composition, or recent changes
- `experience_signal`: repeated user impressions only; never enough by itself for a verified claim

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
