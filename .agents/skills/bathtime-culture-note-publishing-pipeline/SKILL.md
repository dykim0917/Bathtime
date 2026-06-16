---
name: bathtime-culture-note-publishing-pipeline
description: >-
  Create Bathtime reading/culture ArchiveContent from a culture topic through
  private draft DB apply and preview verification. Use when the user wants
  lightweight Korean editorial content for the `읽을거리/문화` category, including
  bath culture stories, Bathtime essays and everyday observations, standards for
  a good Bathtime, seasonal or situational bathing notes, and Bathtime language
  dictionary or terminology explainers. This skill classifies the culture axis,
  defines the reader question and Bathtime thesis, performs web research for
  factual topics, creates TIPS_CULTURE seed artifacts, runs humanize-korean,
  generates or plans images when needed, implements ArchiveContent, applies only
  as a private draft, and verifies preview. It must not publish publicly.
metadata:
  short-description: 바스타임 읽을거리/문화 콘텐츠 제작 파이프라인
---

# Bathtime Culture Note Publishing Pipeline

This pipeline creates Bathtime `읽을거리/문화` content. The default outcome is a private draft ArchiveContent page applied to the DB and verified by preview when repo tooling and env values support it.

Never publish publicly by default. The pipeline stops at:

```ts
category: 'TIPS_CULTURE'
isPublished: false
status: 'draft'
```

## Core Position

Culture notes are not product recommendations, place recommendations, medical advice, or academic lectures.

They are short, concrete Bathtime points of view about bathing, showering, sauna, rest, language, season, and everyday rituals. The article should be easy to read, but not dreamy or vague. Close the distance from culture or information back to today's life.

Reader-facing Korean copy must use `바스타임`.

## Culture Axes

Classify every topic into one primary axis before writing.

1. `bath-culture-story`: 목욕 문화 이야기
2. `everyday-essay`: 바스타임 에세이 / 생활 관찰글
3. `good-bathtime-standard`: 좋은 바스타임의 기준
4. `season-situation`: 계절과 상황의 바스타임
5. `language-dictionary`: 바스타임 언어 사전 / 용어 정리

If a `good-bathtime-standard` topic becomes a place checklist, candidate list, or verification criteria for outside spaces, stop and switch to `bathtime-spot-guide-publishing-pipeline`.

## Content Modes

Choose one mode after the axis.

### `perspective`

Use for Bathtime's editorial stance.

Examples:

- `목욕탕은 왜 쉬는 곳보다 씻는 곳처럼 느껴질까?`
- `좋은 바스타임은 꼭 길어야 할까?`

Primary job: define a practical point of view without turning it into a checklist.

### `observation`

Use for everyday essays.

Examples:

- `씻고 나서야 오늘이 끝난 것 같은 날`
- `목욕탕에서 휴대폰을 쓰기 어려운 이유와 그게 주는 장점`

Primary job: capture a small, recognizable moment and connect it to a usable Bathtime thought.

### `explainer`

Use for terms, culture, or category differences.

Examples:

- `사우나, 스파, 찜질방은 쉬는 방식이 어떻게 다를까?`
- `입욕과 샤워는 왜 기분이 다르게 남을까?`

Primary job: explain enough to orient the reader, then return to lived use.

### `seasonal-note`

Use for weather, season, body-feel, schedule, or context.

Examples:

- `비 오는 날에는 왜 씻는 시간이 조금 달라질까?`
- `더운 날의 바스타임은 무엇을 덜어내는 시간에 가깝다`

Primary job: make the situation concrete without making health claims.

## Required Opening Gate

Before writing, create a brief angle note in the working output directory:

```text
outputs/culture-archive/{culture-slug}/culture_angle_brief.md
outputs/culture-archive/{culture-slug}/culture_angle_record.json
outputs/culture-archive/{culture-slug}/culture_content_risk_note.md
```

The angle note must include:

- primary axis and mode
- reader question
- Bathtime thesis
- why this belongs in `읽을거리/문화`
- what the article must not become
- whether web research is required
- prohibited phrases or claims

Pass only when the topic can be useful without product or place recommendations.

## Research Rules

Use web research for any factual, cultural, historical, terminology, seasonal, public-health-adjacent, or current topic. Use official, primary, or reputable sources where possible, and record source dates.

Research may be light for personal observation pieces, but still verify any factual claim that could be wrong or time-sensitive.

Create or update:

```text
outputs/culture-archive/{culture-slug}/culture_research_sources.md
outputs/culture-archive/{culture-slug}/culture_research_record.json
outputs/culture-archive/{culture-slug}/culture_content_draft.md
outputs/culture-archive/{culture-slug}/culture_verification_checklist.md
outputs/culture-archive/{culture-slug}/culture_missing_fields.md
```

Do not over-research until the article reads like a lecture. Facts should support the viewpoint, not replace it.

## Public Copy Rules

Use:

- `바스타임`
- `관점`
- `기준`
- `오늘의 씻는 시간`
- `쉬는 방식`
- `생활 감각`
- `확인한 내용`
- `마지막 확인 날짜`

Avoid:

- `바스타임`
- `추천 TOP`
- `최고`
- `무조건`
- `실패 없는`
- `인생`
- `완벽한`
- `치료`, `개선`, `효능`, `회복된다`, `좋아진다` as unsupported medical or health claims

Do not claim medical effects from bathing, showering, sauna, heat, cold exposure, scent, minerals, or sleep. Phrase cautiously when discussing body feel: `느껴질 수 있다`, `도움이 된다고 말하기보다`, `생활 리듬을 정리하는 감각에 가깝다`.

## Korean Register Consistency

Reader-facing Korean copy must keep one honorific/register level across section headings, body paragraphs, lists, CTAs, and captions.

Default for Bathtime culture/reading notes is calm observer-style `한다체`, matching the broader Bathtime content voice.

Do not convert culture notes to warm `해요체` during UX polish or humanization unless the user explicitly asks for it.

Avoid headings such as `이런 사람에게 맞아요`; use `이런 사람에게 맞는다`, `이런 사람에게는 애매하다`, or shorter noun-phrase headings when needed. Record the chosen register in the Quality Gate.

## Seed And Web Package

Create seed artifacts:

```text
outputs/culture-archive/{culture-slug}/seed/culture-seed.canonical.json
outputs/culture-archive/{culture-slug}/seed/culture-seed.archive-content.ts
outputs/culture-archive/{culture-slug}/seed/culture-seed.mapping.md
outputs/culture-archive/{culture-slug}/seed/culture-seed.web-content.md
```

Preserve:

- axis and mode
- reader question
- Bathtime thesis
- source boundaries and last checked dates
- no product recommendation stance
- no place recommendation stance
- no medical claim stance
- publish blockers

The web package must include:

1. `Page Content`
2. `Reader Takeaway`
3. `Body Blocks`
4. `Structured Info`
5. `Hero Image Plan`
6. `Inline Image Blocks`
7. `SEO`
8. `CTA / Links`
9. `Publish Blockers`
10. `Quality Gate`

## Series Metadata

When a culture note belongs to an editorial sequence, use `structuredInfo.series` instead of a body `ctaGroup` for the series list.

Required shape:

```ts
series: {
  id: 'stable-series-id',
  title: 'reader-facing series title',
  order: 1,
  description: 'optional one-sentence series description'
}
```

Use the same `id`, `title`, and `description` across every article in the series. Increment `order` according to the intended reading sequence. Keep body CTAs for real actions only, such as app handoff, submit, save, or a single explicit related link.

Body structure should usually be:

1. a concrete everyday opening
2. the small tension or question
3. the cultural or factual context, only as much as needed
4. Bathtime's point of view
5. `그래서 오늘의 바스타임에서는...` or an equivalent present-tense closing

Do not add `저장해둘 이유` as a fixed section. Culture notes should make their usefulness clear through the essay, explanation, or closing thought itself. If a save action is genuinely useful and supported, express it as a natural CTA only when the route/action exists.

## Observer Essay Tone Gate

Move this gate after `humanize-korean`. Treat it as the final Bathtime voice and register pass, not as a first-draft writing rule.

First read and follow the Korean tone guide:

```text
docs/03-content/bathtime-observer-essay-tone-guide.md
```

Use it most strongly for:

- `everyday-essay`
- `perspective`
- reflective openings and closings in `seasonal-note`

Use it lightly for:

- `explainer`
- terminology or culture notes with important factual context

Apply the tone to:

- body paragraphs
- concrete openings
- transitions from information back to everyday life
- reflective closing paragraphs

Do not apply the tone to:

- title, subtitle, summary, SEO metadata
- structured info
- source notes, last checked dates, factual disclaimers, publish blockers, or CTA labels

Tone rules:

- Prefer short Korean sentences with one action, observation, or thought per sentence.
- Keep the chosen register consistent across the article. Default to `한다체`.
- Use concrete sensory details such as temperature, sound, towel, steam, water, breath, or bathroom light when they fit naturally.
- Avoid lecture-like wording such as `~로 알려져 있습니다`, `~의 의의는`, `핵심은`, and unsupported certainty.
- End with a small aftertaste rather than a lesson or grand conclusion.

Experience honesty rules:

- Never imply a firsthand visit, interview, product use, or cultural authority unless the source artifacts prove it.
- For research-based culture notes, make the observing subject an editorial review flow: reading a term, comparing public explanations, noticing a daily scene, or returning the idea to today's bath/shower context.
- Keep source boundaries, dates, and uncertainty visible outside the essay layer.
- Do not add new facts, health claims, examples, or direct-experience claims during tone polishing.

Stop before DB apply if the tone pass hides uncertainty, adds unsupported health effects, or makes a sourced explanation sound like personal experience.

## Images

Use `imagegen` when the user asks for generated images or when the article needs original hero or inline visual assets and no licensed assets exist.

Prefer calm, concrete visual prompts:

- bathroom threshold, folded towel, steam on glass, rainy window, bathhouse locker key, simple sauna bench, water surface, robe hook

Avoid:

- medical diagrams
- luxury spa advertising style
- sensual body imagery
- brand logos
- real place interiors unless rights are clear
- unlicensed web images

When images are not generated yet, use explicit image slots such as:

```text
image-slot:{culture-slug}-hero
image-slot:{culture-slug}-pause
```

Captions should describe desired subject, rights requirement, and forbidden sources.

## Humanize Korean

Run `humanize-korean` before the final Observer Essay Tone Pass and before ArchiveContent implementation or DB apply.

Input:

```text
outputs/culture-archive/{culture-slug}/seed/culture-seed.web-content.md
```

Create:

```text
outputs/culture-archive/{culture-slug}/seed/culture-seed.web-content.humanized.md
outputs/culture-archive/{culture-slug}/seed/culture-seed.web-content.humanize-summary.md
```

## Final Observer Essay Tone Pass

After `humanize-korean`, re-run the Observer Essay Tone Gate on the humanized reader-facing body.

Purpose:

- remove accidental `해요체`, `합니다체`, lecture voice, or generic essay polish introduced during drafting or humanization
- align culture notes to Bathtime's calm `한다체`
- preserve source boundaries, dates, factual uncertainty, and health/safety limits
- keep the ending as a small observation rather than a lesson

Before ArchiveContent implementation or DB apply, search the final body for unintended casual endings:

```bash
rg "해요|돼요|좋아요|예요|이에요|거예요|했어요|봤어요" <output-files>
```

Allow exceptions only for literal quoted user copy, actual button labels, or intentionally conversational quoted lines. Record any exception in the quality gate.

Humanize only reader-facing Korean copy. Preserve facts, dates, uncertainty, source boundaries, image URIs, slugs, IDs, field names, and publish blockers.

Stop before DB apply if humanize changes facts, removes uncertainty, adds health claims, changes `바스타임`, or makes the piece more sentimental than the original.

## ArchiveContent Implementation

Use repo-native ArchiveContent types and upsert tooling where available.

Preferred mapping:

```ts
content_type: 'culture_note'
category: 'TIPS_CULTURE'
status: 'draft'
isPublished: false
```

If `culture_note` is not supported, use the closest supported content type and record the mapping in:

```text
outputs/culture-archive/{culture-slug}/seed/culture-seed.mapping.md
```

If existing upsert scripts only accept `spot-seed` or `item-seed` prefixes, adapt minimally by creating the closest supported archive-content artifact, or stop and report the schema/tooling gap before DB apply.

## Private Draft Apply And Preview

Apply only as a private draft when DB env is available.

Verify:

- `category` is `TIPS_CULTURE`
- `status` is `draft`
- `isPublished` is false
- title, subtitle, summary, and body render as reader-facing Korean
- `바스타임` spelling is correct
- no product or place recommendation language slipped in
- no unsupported medical claim appears
- source transparency or last checked date appears when facts are used
- hero image or image slot renders

Never publish publicly by default.

## Web UX Gate

Before DB apply, verify the content as web content, not only as writing.

- Image captions must explain the feeling, question, or idea the image supports. Do not expose production method in reader-facing captions: avoid `비브랜드 생성 이미지`, `생성형 AI`, `제작된 이미지`, and `실제 사진이 아닙니다`. If transparency is needed, use a natural sentence such as `특정 장소나 제품을 가리키는 이미지는 아닙니다`.
- Lists should be short and label-first when they explain terms, situations, or criteria. Avoid long plain bullet dumps.
- For culture, essay, insight, or terminology content, check whether the default structured info box is meaningful. Prefer `structuredInfo.overviewRows` when supported; otherwise record `UX follow-up` in quality, mapping, or publish blockers.
- CTA must name a real next action for culture content, such as `다음 바스타임 이야기 읽기`, `나만의 바스타임 습관 제보하기`, or `관련 용어/가이드 이어서 보기`. Do not render missing routes as buttons. If a link is not confirmed, keep it as future CTA text and record the missing route in publish blockers.
- The web package must include a culture UX check covering: image-caption message fit, no production-method captions, list readability, overview-box suitability, CTA route status, brand spelling `바스타임`, no product/place recommendation drift, and no unsupported health claims.
- The Quality Gate must confirm Korean register consistency across headings, body copy, lists, CTAs, and captions.
- If current schema or renderer cannot express the ideal culture summary or CTA, record it under `UX follow-up` instead of inventing unsupported fields.

## Final Report

Report concisely:

- culture slug and archive id
- axis and mode
- files created or updated
- whether web research ran
- whether humanize ran
- whether DB draft apply ran
- preview verification result
- remaining publish blockers
- next recommended culture note
