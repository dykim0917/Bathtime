---
name: bathtime-spot-guide-web-content-producer
description: Turn Bathtime spot guide seed artifacts into a web-facing editorial package with Korean body blocks, source transparency, checklist or candidate sections, image/card plans, SEO, CTA, publish blockers, and quality gates. Use for outside-Bathtime manifesto, criteria, checklist, and candidate-frame content before ArchiveContent implementation.
metadata:
  short-description: 바스타임 스팟 가이드 웹 콘텐츠 제작
---

# Bathtime Spot Guide Web Content Producer

Create a web-facing package from spot guide seed artifacts.

## Inputs

Read:

```text
seed/spot-guide-seed.canonical.json
seed/spot-guide-seed.archive-content.ts
seed/spot-guide-seed.mapping.md
```

Use research files only to verify provenance or resolve ambiguity.

## Output

Create:

```text
seed/spot-guide-seed.web-content.md
```

## Required Package Sections

Use this order:

1. `Page Content`
2. `Reader Verdict`
3. `Body Blocks`
4. `Structured Info`
5. `Hero Image Plan`
6. `Inline Image Blocks or Checklist Card Plan`
7. `SEO`
8. `CTA / Links`
9. `Publish Blockers`
10. `Quality Gate`

## Body Shape

For `principle`, recommended headings:

- `좋은 곳을 추천하기 전에`
- `밖에서 찾는 바스타임이란`
- `바스타임이 먼저 확인하려는 것들`
- `추천보다 먼저, 기준을 쌓겠습니다`
- `우리가 찾고 싶은 공간`
- `좋은 곳을 알고 있다면 알려주세요`
- `집 안팎의 좋은 바스타임을 기록합니다`

For `criteria`, recommended headings:

- `한 줄 판단`
- `먼저 확인할 것`
- `사진만으로 알기 어려운 것`
- `이런 사람에게 맞는다`
- `이런 사람에게는 애매하다`
- `예약 전 체크리스트`
- `마지막으로 확인할 것`

For `candidate-frame`, recommended headings:

- `한 줄 판단`
- `후보를 보는 기준`
- `확인해볼 만한 후보`
- `아직 확인이 필요한 것`
- `이런 사람에게 맞는다`
- `가기 전 체크리스트`
- `제보와 업데이트`

For actual place candidate archives, use a card-and-map layout:

- Put a `전국 후보 분포` or equivalent map block before the candidate cards.
- Use candidate information cards instead of repeating each place as a normal heading plus bullet list.
- Each card should carry `후보명`, `지역`, `후보 유형`, `확인된 정보`, `확인할 것`, `혼자 쉬기 관점`, `마지막 확인 날짜`, `주요 출처`, `카카오맵 장소 링크`, and `네이버지도 장소 링크`.
- Do not fill missing place photos with per-candidate generated images.
- If the title already establishes `후보 아카이브`, avoid repeating defensive copy such as `추천이 아니다`, `방문하지 않았다`, or `전화 확인하지 않았다` in the opening.
- Put uncertainty in each card's structured fields rather than as a long opening disclaimer.
- Treat search-map links as draft-only and list verified place detail links as a publish blocker when they are not ready.

Do not add `저장해둘 이유` as a fixed section. Spot guides should make their usefulness clear through criteria, source transparency, checklist value, and realistic next actions. If a save action is genuinely useful and supported, express it as a natural CTA only when the route/action exists.

### One-Line Verdict Rule

When using `한 줄 판단`, the content under that heading must be exactly one short paragraph with one sentence.

- Aim for 35-55 Korean characters.
- Do not use multiple paragraphs, bullets, or a long explanatory sentence.
- If more context is needed, move it to the next section.
- The line should answer the reader's immediate question, not summarize the whole article.

## Source Transparency

Near the top, make clear whether the content is based on:

- 직접 방문
- 공식 안내
- 예약/지도 정보
- 후기 패턴
- 사용자 제보
- 확인 필요 항목

Do not make the text feel like a completed visit review unless direct-visit evidence exists.

## Image And Card Plan

For manifesto or criteria content, photos are optional. Prefer:

- generated non-branded hero image
- checklist card image
- simple information card
- fallback category image

For candidate-frame content:

- avoid scraping or reusing facility images unless rights are clear
- plan candidate cards using text first
- use official image URLs only when rights/source policy is explicitly acceptable
- prefer `spotMap` and `spotCandidates` blocks when the ArchiveContent renderer supports them
- use real icons for candidate types instead of Korean text badges when implementing cards

## Language Rules

Use `바스타임`.

Avoid:

- `추천 TOP`
- `최고`
- `무조건`
- `실패 없는`
- `인생 사우나`
- `완벽한`
- `직접 다녀온` unless true

Use:

- `기준`
- `후보`
- `확인할 것`
- `살펴볼 공간`
- `기록`
- `업데이트`
- `제보`
- `마지막 확인 날짜`

## Korean Register Consistency

Reader-facing Korean copy must keep one honorific/register level across section headings, body paragraphs, lists, candidate cards, CTAs, and captions.

Default for spot guides is calm observer-style `한다체`, matching the broader Bathtime content voice.

Avoid headings such as `이런 사람에게 맞아요` and `이런 사람에게는 애매해요`; use `이런 사람에게 맞는다`, `이런 사람에게는 애매하다`, or shorter noun-phrase headings.

Do not convert spot guides to warm `해요체` during UX polish or humanization unless the user explicitly asks for it.

Quality Gate must check for unintended casual endings such as `해요`, `돼요`, `예요`, `이에요`, and record any exception such as literal phone questions.

## Quality Gate

Before implementation, confirm:

- one mode is visible
- one audience lens guides the copy
- source uncertainty is not hidden
- candidate lists are not rankings
- no place is presented as verified unless it is
- publish blockers are explicit
- SEO title is clickable without becoming clickbait
- Korean register is consistent across headings, body copy, lists, candidate cards, CTAs, and captions
