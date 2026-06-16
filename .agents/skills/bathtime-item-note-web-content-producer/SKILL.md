---
name: bathtime-item-note-web-content-producer
description: Turn Bathtime Item Note seed artifacts into publish-ready web archive content. Use when the user references item-seed.canonical.json, item-seed.archive-content.ts, item-seed.mapping.md, image placement, item note body structure, SEO copy, publish blockers, or asks to prepare bath item content for the actual Bathtime website.
metadata:
  short-description: 바스타임 아이템 노트 웹 콘텐츠 제작
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
6. Run the UX polish check: image captions, list readability, structured overview fit, and CTA realism.
7. If implementing, update `item-seed.archive-content.ts`, then generate DB row/upsert artifacts with `npm run archive:item:upsert -- <seed-dir>`.
8. Keep draft content unpublished unless the user explicitly asks to publish and the publish blockers are resolved.

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

Use this order as a starting shape, then remove or rename sections that feel forced for the article:

1. `한 줄 판단`
2. `어떤 의식을 돕는가`
3. `사기 전에 먼저 볼 것`
4. `좋게 볼 수 있는 점`
5. `아쉬운 점`
6. `이런 사람에게 맞는다`
7. `이런 사람에게는 애매하다`
8. `같이 쓰면 좋은 의식` (only when a concrete follow-up ritual exists)

Do not add `저장해둘 이유` as a fixed section. The article should make its own usefulness clear through the body. If a save action is genuinely useful, express it as a natural CTA only when the route/action exists.

For a specific product, add source-scoped language near the top. For a category note, lead with the decision frame instead of a product recommendation.

### One-Line Verdict Rule

When using `한 줄 판단`, the content under that heading must be exactly one short paragraph with one sentence.

- Aim for 35-55 Korean characters.
- Do not use multiple paragraphs, bullets, or a long explanatory sentence.
- If more context is needed, move it to the next section.
- The line should answer the reader's immediate question, not summarize the whole article.

## Reader Verdict Rules

The first body block must answer:

- What item/category is this?
- What ritual does it support?
- What is the biggest practical tradeoff?
- Who should keep reading?

## Korean Register Consistency

Reader-facing Korean copy must keep one honorific/register level across section headings, body paragraphs, lists, product cards, CTAs, and captions.

Default for Bathtime Item Notes is calm observer-style `한다체`, matching the broader Bathtime content voice.

Do:

- Rewrite casual `해요체` or stiff `합니다체` endings into the chosen Bathtime `한다체` unless the user explicitly asks for another register.
- Keep labels short, but make their surrounding sentence match the article register.

Avoid mixing:

- Heading: `이런 사람에게 맞아요`
- Body: `구매 전 최신 정보를 확인해야 합니다.`

Good:

- Heading: `이런 사람에게 맞는다`
- Body: `구매 전 판매처의 최신 정보를 다시 확인한다.`

Avoid headings such as `이런 사람에게 맞아요` and `이런 사람에게는 애매해요`; use `이런 사람에게 맞는다`, `이런 사람에게는 애매하다`, or shorter noun-phrase headings.

Do not convert item notes to warm `해요체` during UX polish or humanization unless the user explicitly asks for it. Pick one register and record it in the Quality Gate.

## UX Polish Rules

### Image captions

Reader-facing captions should explain what the image does for the page.

Good:

```text
제품을 고를 때 놓치기 쉬운 기준을 시각적으로 정리한 이미지.
샤워 후 정리 동선을 한눈에 떠올리게 하는 이미지.
욕실 크기와 보관 공간을 함께 봐야 한다는 점을 보여주는 장면.
```

Avoid:

```text
비브랜드 생성 이미지입니다.
생성형 AI로 만든 이미지입니다.
제작된 이미지입니다.
실제 제품 사진이 아닙니다.
```

If the visual could be mistaken for a real product or direct-use photo, add transparency only when needed and phrase it naturally:

```text
특정 제품을 가리키는 이미지는 아닙니다.
```

### Lists and checklists

Do not let long criteria lists become plain item dumps. Prefer labeled lines:

```text
소재: 물에 자주 닿는 물건이라 건조와 관리 난이도를 함께 봅니다.
보관: 매일 꺼내 쓰려면 말릴 자리와 문 간섭을 먼저 확인합니다.
가격: 본체 가격보다 교체품이나 소모품 비용을 함께 봅니다.
```

When icon chips, mini tags, comparison cards, or richer checklist UI would materially improve readability but the renderer does not support it, record a `UX follow-up` in `Publish Blockers` or canonical `quality`.

### Product examples

If the draft includes real product examples, keep the product-research guardrails in the public package:

- source or purchase URL
- price checked date or explicit unavailable note
- information-status wording such as `공개 정보 기준` or `브랜드 제공 정보 기준`
- affiliate/sponsor status and image-rights status in research/canonical notes

For affiliate-link wording:

- If Bathtime only receives commission through a purchase link, use reader-facing labels based on `제휴`, not standalone `광고`.
- Preferred page label: `제휴 포함`.
- Preferred dialog/notice title: `제휴 링크 안내`.
- Preferred body note: `이 글의 제품 링크는 제휴 링크다. 링크를 통해 구매가 발생하면 바스타임에 수수료가 지급된다.`
- Do not use `광고 포함`, `광고 상품`, or `광고 콘텐츠` unless there is a separate paid ad placement, sponsorship, or brand-paid campaign.

Do not turn product examples into rankings, recommendations, vague shopping bullets, or purchase-pressure cards.

For product candidate cards, official/public product image URLs may be used in private drafts when all of the following are true:

- the image URL comes from an official brand/product page or a clearly identified product page
- the actual product is the primary subject, not an event banner or decorative detail image
- the image is referenced by URL and not downloaded, rehosted, edited, or stripped of context
- `imageRightsStatus` explicitly says Bathtime does not own the image, such as `external_official_product_image_url_not_owned`
- unresolved public-publish rights remain in `Publish Blockers` or canonical `quality`

If those conditions are not met, use a category fallback and record the missing image as a UX/publish follow-up.

### Structured overview

For concrete product/category item notes, use normal item structured info. For criteria, comparison, terminology, or insight-style item notes, check whether the default `한눈에 보기` helps.

If it does not, record:

```text
UX follow-up:
이 글은 특정 제품 소개가 아닌 기준 콘텐츠이므로 기본 한눈에 보기 박스가 적합하지 않을 수 있음.
권장 요약:
- 카테고리: 아이템 선택 기준
- 대상: 구매 전 확인 기준을 찾는 사람
- 핵심 키워드: 관리 난이도, 보관, 소모품, 안전
- 읽고 나면: 제품명보다 먼저 볼 조건을 알 수 있음
```

Do not invent unsupported schema fields. Use existing `overviewRows` only if the renderer/schema already accepts them.

Remove or replace rows that are technically true but not useful for the item, such as `전원 필요 없음` for a non-electric item or `욕조 필요 없음` for a bathroom accessory where that fact does not affect selection.

### CTA

Every item note needs a next action, but unavailable features must not look clickable.

Allowed directions:

- `이 기준으로 제품 후보 더 보기`
- `써본 제품 제보하기`
- `비슷한 아이템 노트 보기`
- `관련 의식 보기`

If the route or action exists, implement it as a CTA block/action. If it does not exist, keep it as text or record it in `Publish Blockers`.

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
- Reader-facing image captions explain content value, not production method.
- Long checklists or criteria lists use labels or other scannable structure where possible.
- Real product examples preserve source URL, price checked date or unavailable note, and information-status wording.
- Structured overview / `한눈에 보기` suitability is checked and recorded when weak.
- CTA exists as text or a real supported action; unavailable routes are not presented as buttons.
- Generated image prompt path, local asset path, and final hosted/app URI are separated when imagegen is used.
- Price copy is short and scan-friendly.
- Public copy does not use `신호`, `시그널`, or `signal`.
- Section headings, body copy, lists, product cards, CTAs, and captions use one Korean register level; no mixed `~해요` headings with `~합니다` body.
- Publish blockers are explicit and draft status is preserved when needed.
