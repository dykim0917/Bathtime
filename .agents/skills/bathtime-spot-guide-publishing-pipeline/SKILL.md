---
name: bathtime-spot-guide-publishing-pipeline
description: >-
  Create Bathtime spot guide content that defines criteria, checklists,
  candidate-list frames, or editorial principles for finding good sauna, spa,
  hotel sauna, bathhouse, private spa room, and bathtub-stay spaces. Use when
  the user wants outside Bathtime content that is not a firsthand place review:
  manifesto posts, selection standards, verification criteria, target-audience
  guides, or cautious candidate-list planning before running the spot publishing
  pipeline. It can produce a private draft ArchiveContent page, but it must not
  claim direct visits unless proven. This skill orchestrates
  bathtime-spot-guide-ideator, bathtime-spot-guide-researcher,
  bathtime-spot-guide-seed-builder, bathtime-spot-guide-web-content-producer,
  humanize-korean, and bathtime-spot-guide-archive-content-implementer.
metadata:
  short-description: 바스타임 스팟 기준/후보/선언문 콘텐츠 제작 파이프라인
---

# Bathtime Spot Guide Publishing Pipeline

This pipeline creates spot guide content before committing to a single-place review.

Default outcome: a private draft archive page applied to the DB and verified by preview when the repo and DB env support it.

Never publish publicly by default. The pipeline stops at:

```ts
isPublished: false
status: 'draft'
```

Use it for content like:

- `밖에서 찾는 바스타임: 좋은 공간을 추천하기 전에`
- hotel sauna selection criteria
- bathtub-stay booking checklists
- private spa room decision guides
- why good sauna information is hard to verify
- candidate-list framing before researching individual spots

Do not use it when the user wants to research and draft one specific place end to end. Use `bathtime-single-spot-content-publishing-pipeline` for that.

## Temporary Homecare Coverage

When the user asks the spot guide team to help with `HOME_BATH` or homecare content, do not turn it into a place guide.

Act as a UX/content polish owner for existing homecare archive pages:

- apply the same UX polish gate to image captions, lists, structured overview, and CTA
- keep medical/health claims conservative and preserve existing safety notes
- do not add new medical facts without fresh source verification
- prefer existing routine timers and real app actions for CTA groups
- for short legacy homecare posts, improve bare lists into `short label: explanation` items
- use `structuredInfo.overviewRows` when the default `한눈에 보기` rows would be less helpful than a content-specific summary
- use `structuredInfo.series` for planned editorial sequences instead of manually listing series articles in a body `ctaGroup`
- keep `category: 'HOME_BATH'` and avoid moving homecare content into spot categories

## Core Position

Bathtime spot guide content is not:

```text
we personally visited this place and recommend it
```

It is:

```text
criteria and candidate frames for finding good outside Bathtime spaces
```

The content should be honest about source depth. Separate:

- direct visit
- official information
- reservation/map/platform information
- review pattern
- user tip
- unknown or needs recheck

Never write public copy as if Bathtime visited a place unless source files prove it.

## Content Modes

Choose one mode before writing.

### 1. `principle`

Use for brand/editorial principle posts.

Examples:

- `밖에서 찾는 바스타임: 좋은 공간을 추천하기 전에`
- `좋은 사우나를 찾는 일이 생각보다 어려운 이유`
- `바스타임이 사우나를 기록할 때 확인하려는 것들`

Primary job:

- define Bathtime's stance
- explain why recommendation comes after criteria
- establish source transparency
- invite user tips

### 2. `criteria`

Use for checklists and standards.

Examples:

- `호텔 사우나, 좋아 보여도 바로 가면 안 되는 이유`
- `욕조 있는 숙소 예약 전에 꼭 봐야 할 것들`
- `프라이빗 스파룸, 예약 전에 봐야 할 기준`

Primary job:

- help readers avoid bad-fit spaces
- create a reusable verification checklist
- show what to confirm before booking or visiting

### 3. `candidate-frame`

Use before creating a list of actual place candidates.

Examples:

- `외부인도 이용 가능한 호텔 사우나를 찾을 때 확인해볼 후보들`
- `혼자 쉬기 좋은 스파 공간을 찾는 기준과 후보`

Primary job:

- define what counts as a candidate
- explain verification limits
- avoid "TOP" or definitive recommendation language
- prepare for later spot-by-spot research

### 4. `visited-review-gate`

Use when deciding whether a draft can claim firsthand experience.

Only pass when source files include direct visit notes, usable images or image plan, date, access conditions, felt crowding/quietness, and return-intent notes.

If it does not pass, downgrade the content to `criteria` or `candidate-frame`.

## Audience Lens

Pick one primary audience lens. Do not write for everyone at once.

- `solo-quiet`: 혼자 조용히 쉬고 싶은 사람
- `couple-bathtub-stay`: 욕조 있는 숙소를 신중히 고르는 커플/동행
- `sauna-beginner`: 사우나와 스파를 처음 찾아보는 사람
- `family-practical`: 아이 또는 가족 단위로 조건을 확인해야 하는 사람
- `local-regular`: 동네 목욕탕이나 오래된 사우나를 다시 살펴보는 사람

Default recommendation for early Bathtime content: `solo-quiet`.

## Pipeline Order

Run these steps in order. Load each named skill when the step starts.

### 1. `bathtime-spot-guide-ideator`

Create the editorial angle before research.

Create or update:

```text
outputs/spot-guide-archive/{guide-slug}/spot_guide_angle_brief.md
outputs/spot-guide-archive/{guide-slug}/spot_guide_angle_record.json
outputs/spot-guide-archive/{guide-slug}/spot_guide_research_plan.md
outputs/spot-guide-archive/{guide-slug}/spot_guide_content_risk_note.md
```

Pass only when:

- title matches a clear mode
- one audience lens is primary
- the copy can be useful without place photos
- source transparency is explicit
- non-goals include no `추천 TOP`, no "best", no hidden firsthand claims, and no unlicensed images

If the idea is unsuitable, create `hold_or_reject_note.md` and stop before research.

### 2. Angle Review Gate

Before starting research, review the ideator outputs.

Revise the angle files if:

- the title reads like generic SEO
- the target reader is too broad
- the source transparency plan is vague
- the content would require firsthand claims to be useful
- the research plan cannot verify the practical conditions readers need

### 3. `bathtime-spot-guide-researcher`

Research only what supports the guide mode and audience lens.

For `principle`, research can be light and mostly editorial.

For `criteria`, collect public examples of common uncertainty:

- official access policy ambiguity
- guest-only or member-only facilities
- reservation/time restrictions
- old platform information
- facility-photo uncertainty
- review signals about crowding, cleanliness, quietness, or rest area

For `candidate-frame`, use web research heavily and optionally reference `bathtime-single-spot-content-researcher` for candidate discovery. Do not turn candidates into verified recommendations.

Create or update:

```text
spot_guide_research_sources.md
spot_guide_research_record.json
spot_guide_content_draft.md
spot_guide_verification_checklist.md
spot_guide_missing_fields.md
```

For candidate-frame content, also create:

```text
candidate_research/candidate-type-map.md
candidate_research/candidate-sources.json
candidate_research/candidate-verification-gaps.md
```

### 4. `bathtime-spot-guide-seed-builder`

Convert angle and research outputs into seed artifacts.

Create or update:

```text
seed/spot-guide-seed.canonical.json
seed/spot-guide-seed.archive-content.ts
seed/spot-guide-seed.mapping.md
```

Preserve:

- mode
- audience lens
- reader question
- Bathtime thesis
- source transparency
- candidate uncertainty when applicable
- publish blockers
- last checked dates
- no-ranking/no-fake-review stance

### 5. `bathtime-spot-guide-web-content-producer`

Create the web-facing editorial package.

Create:

```text
seed/spot-guide-seed.web-content.md
```

The package must include:

1. Page Content
2. Reader Verdict
3. Body Blocks
4. Structured Info
5. Hero Image Plan
6. Inline Image Blocks or Checklist Card Plan
7. SEO
8. CTA / Links
9. Publish Blockers
10. Quality Gate

Reader-facing copy should use `바스타임`, not `바스타임`.

### 5.5. UX Polish Gate

Before humanization and implementation, review the draft as a web page, not just as text.

Image captions:

- Do not expose production wording such as `비브랜드 생성 이미지`, `생성 이미지입니다`, `생성형 AI`, or `제작된 이미지` in reader-facing captions.
- Captions should explain what the image helps the reader understand.
- If an image could be mistaken for a real place or visit photo, add a natural transparency note such as `특정 장소를 가리키는 이미지는 아닙니다` only when needed.

Lists and checklists:

- Avoid long bare bullet lists when they contain criteria, source types, or verification points.
- Prefer `short label: explanation` phrasing.
- Example: `공식 안내: 이용 자격, 운영 시간, 휴관 여부를 먼저 확인합니다.`
- If icon chips, mini tags, custom checklist UI, or richer layout would improve the page but the renderer cannot support it yet, record it in `quality.publish_blockers`, `quality.ux_follow_up`, or the web package's `Publish Blockers`.

Structured overview:

- For place reviews, use the normal category structured info.
- For principle, criteria, culture, terminology, or other insight-style content, decide whether the default `한눈에 보기` rows help the reader.
- If the default place metadata would read like empty shell information, record an `UX follow-up` with a recommended custom summary such as category, audience, key terms, and what the reader learns.
- Do not invent unsupported fields in the public app unless the schema/renderer already accepts them.

CTA:

- Every guide should end with a next useful action: tip submission, next guide, candidate review, or app/download reminder.
- Do not render a button-like CTA unless the route/link exists.
- If a CTA route is missing, include the CTA as text only or record it as a publish blocker.
- Do not add `저장해둘 이유` as a fixed section. Spot guides should make their usefulness clear through criteria, source transparency, checklist value, and realistic next actions.

Register:

- Reader-facing Korean copy must keep one honorific/register level across headings, body copy, lists, candidate cards, CTAs, and captions.
- Default for all Bathtime public content, including spot guides, is calm observer-style `한다체`.
- Do not use warm `해요체` as the default just because a checklist, CTA, or section label feels friendly.
- Avoid headings such as `이런 사람에게 맞아요`; use register-neutral headings such as `이런 사람에게 맞는다`, `이런 사람에게는 애매하다`, or a shorter noun phrase.
- Literal phone questions, button labels, or user-copyable inquiry scripts may use natural question endings when that is the function of the block.

### 5.6. Observer Essay Tone Gate

Move this gate after `humanize-korean`. Treat it as the final Bathtime voice and register pass, not as a first-draft writing rule.

First read and follow the Korean tone guide:

```text
docs/03-content/bathtime-observer-essay-tone-guide.md
```

Apply the tone to:

- principle openings
- criteria setup paragraphs
- source-transparency explanations
- reflective closing paragraphs

Do not apply the tone to:

- title, subtitle, summary, SEO metadata
- `Structured Info`
- candidate tables/cards
- access conditions, price, operating hours, source labels, last checked dates, publish blockers, or CTA labels

Tone rules:

- Prefer short Korean sentences with one observation or thought per sentence.
- Default to `한다체` for spot-guide body copy and captions unless the user explicitly asks for another register.
- Use concrete checking actions such as opening official notices, comparing map/reservation pages, reading repeated review patterns, and deciding what still needs confirmation.
- Use sensory or spatial detail only when it is supported by source artifacts or clearly framed as a general reader situation.
- Avoid guidebook wording such as `~할 수 있습니다`, `~로 알려져 있습니다`, `좋은 곳입니다`, and unsupported certainty.

Experience honesty rules:

- Never write as if Bathtime visited a place unless direct visit source files prove it.
- For guide, principle, criteria, and candidate-frame content, make the observing subject an editorial verification flow, not a firsthand visit.
- Keep source transparency near the top and preserve labels such as direct visit, official information, map/reservation information, review pattern, user tip, and needs recheck.
- Do not add new facts, places, sensory claims, visit claims, or recommendation claims during tone polishing.

Stop before DB apply if the tone pass hides uncertainty, turns criteria into a recommendation, or makes public-source research sound like a visit.

### 6. `humanize-korean`

Run `humanize-korean` on reader-facing Korean copy before the final Observer Essay Tone Pass and before implementation.

Create:

```text
seed/spot-guide-seed.web-content.humanized.md
seed/spot-guide-seed.web-content.humanize-summary.md
```

Preserve:

- source boundaries
- dates
- uncertainty
- direct-visit disclaimers
- no-ranking stance
- title and brand spelling

Stop before DB apply if the humanized copy changes facts, removes uncertainty, or turns criteria into recommendation.

### 6.5. Final Observer Essay Tone Pass

After `humanize-korean`, re-run the Observer Essay Tone Gate on the humanized reader-facing body.

Purpose:

- remove any accidental `해요체`, `합니다체`, or guidebook voice introduced during drafting or humanization
- align all Bathtime content to calm `한다체`
- preserve checklist labels, phone questions, structured info, source lists, dates, and factual uncertainty
- keep the observing subject as editorial verification, not firsthand visit

Before ArchiveContent implementation or DB apply, search the final body for unintended casual endings:

```bash
rg "해요|돼요|좋아요|예요|이에요|거예요|했어요|봤어요" <output-files>
```

Allow exceptions only for literal phone questions, button labels, or intentionally quoted user-facing copy. Record any exception in the quality gate.

### 7. `bathtime-spot-guide-archive-content-implementer`

Convert the humanized web package into the real app/DB source.

Primary input:

```text
seed/spot-guide-seed.web-content.humanized.md
```

Reference inputs:

```text
seed/spot-guide-seed.web-content.md
seed/spot-guide-seed.canonical.json
seed/spot-guide-seed.archive-content.ts
seed/spot-guide-seed.mapping.md
```

Prefer:

```ts
content_type: 'spot_guide'
category: 'bath_spots'
status: 'draft'
isPublished: false
```

If `spot_guide` is not supported by the app schema, use the closest supported content type and record the mapping in:

```text
seed/spot-guide-seed.mapping.md
```

Generate DB artifacts with the repo-native archive upsert tooling when available. If the tooling only supports spot/item seed prefixes, either adapt the output to the closest supported spot seed format or stop and report the schema/tooling gap.

### 8. Private Draft Apply And Preview

Apply only as a private draft when DB env is available.

Never publish publicly by default.

Verify:

- status is `draft`
- `isPublished` is false
- page title and body render
- image captions explain reader value, not production method
- lists use labels or other scannable structure when possible
- insight-style `한눈에 보기` suitability is recorded
- CTA exists as text or a real link, without pretending unavailable routes exist
- no direct-visit claim appears unless proven
- source transparency appears near the top
- CTA invites tips or future candidate review when appropriate
- Korean register is consistent across headings, body copy, lists, candidate cards, CTAs, and captions

## Required Public-Copy Rules

Use:

- `기준`
- `후보`
- `확인할 것`
- `살펴볼 공간`
- `기록`
- `업데이트`
- `제보`
- `마지막 확인 날짜`

Avoid:

- `추천 TOP`
- `최고`
- `무조건`
- `실패 없는`
- `인생 사우나`
- `완벽한`
- `직접 다녀온` unless true

## First Manifesto Defaults

For the first principle content, use:

```text
title: 밖에서 찾는 바스타임: 좋은 공간을 추천하기 전에
mode: principle
audience_lens: solo-quiet
reader_question: 좋은 사우나나 스파, 욕조 있는 숙소를 찾을 때 바스타임은 무엇을 먼저 확인하나?
bathtime_thesis: 좋은 공간 추천보다 먼저, 실제 이용 가능성과 나에게 맞는 쉼의 조건을 기록해야 한다.
```

The body should cover:

- why finding good sauna/spa/bathtub spaces is hard
- what `outside Bathtime` means
- what Bathtime checks first
- why criteria come before recommendation
- what kinds of spaces Bathtime wants to find
- how users can submit tips
- closing line about recording good Bathtime inside and outside the home

## Final Report

Report concisely:

- guide slug and archive id
- mode and audience lens
- files created or updated
- whether DB draft apply ran
- preview verification result
- remaining publish blockers
- next recommended related guide
