---
name: bathtime-item-note-publishing-pipeline
description: Run the full Bathtime Item Note content publishing pipeline through private draft DB apply. Use when the user wants to take a bath-related item, item category, comparison, or item idea from editorial angle to draft preview in one cycle: angle brief, research artifacts, optional real product candidates, canonical seed, web content package, ArchiveContent implementation, DB upsert artifacts, optional Supabase/PostgREST draft apply, and preview verification. This skill orchestrates bathtime-item-note-ideator, bathtime-item-note-researcher, optional bathtime-item-product-researcher, bathtime-item-note-seed-builder, bathtime-item-note-web-content-producer, and bathtime-item-note-archive-content-implementer. It never publishes publicly by default.
metadata:
  short-description: 배스타임 아이템 노트 아이디어부터 비공개 draft 반영까지 전체 파이프라인
---

# Bathtime Item Note Publishing Pipeline

This is the one-cycle orchestrator for Bathtime Item Note content.

Default outcome: a private draft archive page applied to the DB and verified by preview API when the repo and DB env support it.

Never publish publicly by default. The pipeline stops at:

```ts
isPublished: false
status: 'draft'
```

## Why This Pipeline Has One Extra Step

Spot content starts with a place. The content boundary is usually clear.

Item Note content starts with an item, product category, or vague purchase question. If research starts immediately, the output easily becomes a generic review, ranking, or shopping guide.

Therefore this pipeline begins with an idea/angle step:

```text
item idea -> Bathtime angle -> angle review -> research -> optional product candidates -> seed -> web package -> visual asset generation -> implementation -> draft preview
```

The first skill must define:

- what ritual the item supports
- what real-life friction matters
- what the reader is deciding
- what the content should not do

## Pipeline Order

Run these steps in order. Load each named skill when the step starts.

### 1. `bathtime-item-note-ideator`

Create the editorial angle before research.

Create or update:

- `item_angle_brief.md`
- `item_angle_record.json`
- `research_plan.md`
- `content_risk_note.md`

The angle brief must answer:

- Is this a category note, specific product note, comparison note, setup note, or checklist note?
- What is the reader's real question?
- What ritual does this item support?
- What hidden friction should research verify?
- What should the content not do?

If the idea is unsuitable, create:

- `hold_or_reject_note.md`

and stop before research.

### 2. Angle Review Gate

Before starting research, review the outputs from `bathtime-item-note-ideator`.

This is a required checkpoint even in apply-draft mode. The goal is to catch weak or shopping-like ideas before they create low-quality research and seed artifacts.

Pass only when:

- the reader question is sharper than a generic review or buying guide
- the ritual job is explicit
- the hidden friction is concrete enough to research
- the angle can connect to a Bathtime ritual, timer, care archive, or home setup
- the content can be useful without product images
- non-goals include no ranking, no medical claims, no purchase pressure, and no unlicensed images
- the research plan names official/spec, practical-use, price, safety, and image-right checks

If the angle is close but weak, revise:

- `item_angle_brief.md`
- `item_angle_record.json`
- `research_plan.md`
- `content_risk_note.md`

If the angle still fails, create or update:

- `hold_or_reject_note.md`

and stop before research.

### 3. `bathtime-item-note-researcher`

Research the item/category through the angle brief.

When official specs, manuals, prices, safety notes, or product pages exist but browser/web fetch fails, retry with local HTTP fallback such as:

```bash
curl -L --max-time 20 -A 'Mozilla/5.0' '<official-or-retailer-url>'
```

Create or update:

- `item_archive_record.json`
- `item_research_sources.md`
- `item_content_draft.md`
- `item_sns_summary.md`
- `item_verification_checklist.md`
- `item_missing_fields.md`

Do not start ranking products.

### Optional. `bathtime-item-product-researcher`

Run this step when the user asks to add actual products, purchase links, product candidates, or a bottom-of-article product section.

Create or update:

- `product_research/product-type-map.md`
- `product_research/product-candidates.json`
- `product_research/product-candidates.md`
- `product_research/purchase-link-checklist.md`

This step must not create rankings or recommendations. Use reader-facing titles such as:

- `실제로 찾아볼 만한 선택지`
- `비교해볼 만한 제품 예시`

Every product candidate must include:

- purchase/source URL
- price checked date or unavailable note
- information status: direct use, public information summary, review-pattern reference, brand-provided information, or affiliate/sponsored
- affiliate/sponsor status
- image rights status

Do not use `추천 TOP`, `베스트`, `최고`, `가성비 최고`, `무조건`, `인생템`, `필수템`, or unsupported `인기 제품`.

### 4. `bathtime-item-note-seed-builder`

Convert research outputs into seed artifacts.

Create or update:

- `item-seed.canonical.json`
- `item-seed.archive-content.ts` initial app seed
- `item-seed.mapping.md`

Preserve:

- angle type
- ritual job
- reader question
- non-goals
- practical burden
- source uncertainty
- image rights status
- product candidate notes when the optional product researcher ran
- publish blockers

### 5. `bathtime-item-note-web-content-producer`

Create the web-facing editorial package.

Create or update:

- `item-seed.web-content.md`

The package must include:

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

The final page must read as an Item Note, not a product review.

### 6. Optional generated visual assets with `imagegen`

Use this step when the user asks to create hero images, inline images, visual assets, or a more complete preview.

Create or update:

- `assets/hero-generation-prompt.md`
- generated hero image under `outputs/item-archive/{item-slug}/assets/`
- optional generated inline diagrams/cards under `outputs/item-archive/{item-slug}/assets/`
- image generation notes in `item-seed.web-content.md`

Use `imagegen` with `photorealistic-natural` for calm editorial lifestyle hero images and `infographic-diagram` for comparison/setup cards.

Hero prompt rules:

- show the item category or ritual context, not a specific branded product
- avoid logos, labels, packaging, UI text, watermarks, and brand lookalikes
- avoid marketplace/review-photo composition
- keep the mood quiet, natural, and Bathtime-like
- include composition guidance for archive hero cropping
- include Korean alt text and a rights note

If `OPENAI_API_KEY` is missing, do not block the content pipeline. Write the prompt file and keep the fallback image in `heroImage.uri`.

If an image is generated but not uploaded to a public URL or app asset path, do not set it as the final `heroImage.uri` for DB/app rendering. Keep the fallback URI and add a publish blocker or implementation note with the local generated path.

### 7. `bathtime-item-note-archive-content-implementer`

Convert the web package into the real app/DB source.

Update:

- `item-seed.archive-content.ts`

Generate when scripts support it:

- `item-seed.archive-content.db-row.json`
- `item-seed.archive-content.upsert.sql`

Apply draft to DB only when requested and env is available.

Preferred command if available:

```bash
npm run archive:item:upsert -- <seed-dir> --apply
```

If the repo uses a generic archive upsert command, use that.

If only a spot-compatible command exists, verify it is generic enough before using it.

Verify preview API when possible.

## Required User Input

Accept any of these:

- item category
- product name
- product URL
- official product URL
- retailer URL
- comparison idea
- existing item angle brief
- existing research folder
- existing seed directory
- batch list of item ideas
- user-submitted item tip

Examples:

- "족욕기와 족욕볼을 아이템 노트로 만들어줘"
- "반신욕조가 필요한 사람과 아닌 사람 파이프라인 돌려줘"
- "이 샤워필터 링크를 배스타임 콘텐츠로 만들 수 있을까?"
- "욕실 조명은 꼭 사야 할까?를 아이템 노트로 제작해줘"
- "입욕제는 언제 쓰면 만족감이 높을까? 콘텐츠화해줘"

If the item cannot be identified, ask one concise question. Otherwise make a conservative assumption and record it in `item_angle_brief.md`.

## Output Location

Use the repo convention:

```text
outputs/item-archive/{item-slug}/
outputs/item-archive/{item-slug}/seed/
```

If a folder already exists, read it first and update it instead of starting over. Do not discard existing angle, research, or seed artifacts.

## Default Mode

Default mode: create draft artifacts and apply private draft only when the repo has an item/generic upsert command and DB env is available.

If no applicable DB command exists, stop after generating implementation-ready files and report the missing command.

The final DB row must remain:

```ts
isPublished: false
status: 'draft'
```

Publishing requires a separate explicit request after preview review.

## Stop Conditions

Stop before research when:

- the item does not connect to bath, shower, body care, rest, or home ritual
- the item category is unsafe or restricted
- the idea can only be executed as an ad or shopping list
- the user asks for a banned or regulated product category
- the angle cannot be made useful without medical claims
- the Angle Review Gate fails after one focused revision pass

Stop before DB apply and report the blocker when:

- product identity is ambiguous and could mislead readers
- official specs are conflicting and decision-critical
- safety risk appears and cannot be framed responsibly
- product image rights are unresolved and no safe fallback exists
- affiliate/ad disclosure is required but unavailable
- `item-seed.archive-content.ts` fails implementer fail conditions
- the upsert generation command fails
- required DB env is missing for `--apply`
- preview token or endpoint is unavailable after DB apply and no alternate verification path exists

Do not stop before DB apply merely because generated images are not hosted. Keep the hero fallback and carry the generated local asset path as a draft/publish note.

Do not stop merely because exact price, product image rights, or product examples are unresolved. Those are normal draft blockers. Surface them in the draft and keep the content private.

Do not mark an official fact as unresolved until the direct official URL has been attempted through both the browser/fetch path and a local HTTP fallback such as `curl`. Record the fallback result in `item_research_sources.md`.

## Draft Content Rules

Final `item-seed.archive-content.ts` must:

- use Korean reader-facing body headings
- avoid English research memo headings
- avoid markdown quick-facts tables in `body`
- avoid raw enum labels in visible text and structuredInfo
- avoid internal research words such as `신호`, `시그널`, or `signal` in public-facing body, subtitle, summary, SEO, CTA, and structuredInfo
- keep `structuredInfo.priceRange` as a short scan label, not a pricing paragraph
- include a hero image fallback
- use a generated hero image only when the file is available through a public URL or app-supported asset path
- include at least two inline image slots when image body blocks are supported
- make price/spec/safety/image-right uncertainty visible when decision-blocking
- preserve publish blockers rather than hiding uncertainty
- never claim firsthand experience unless source files prove it
- never present product examples as ranked recommendations unless explicitly asked and clearly disclosed

When converting research into public copy, translate internal research language:

- `후기 신호` -> `후기에서 반복적으로 언급된다`
- `가격 신호` -> `공개 가격 기준` or `검색일 기준 가격대`
- `공식 스펙 신호` -> `공식 스펙 기준`
- `출처별 신호가 다르다` -> `출처별 안내가 다르다`

## Price Range Rule

Use `structuredInfo.priceRange` for representative ranges only.

Good:

```text
1만~3만 원대
3만~10만 원대
가격대 넓음 · 제품별 차이 큼
대표 가격대 재확인 필요
```

Bad:

```text
공식몰과 여러 쇼핑몰 기준 옵션 A는 39,900원, 옵션 B는 89,000원이며 배송비와 사은품 구성이...
```

Move details to body, `사기 전에 먼저 볼 것`, source notes, or publish blockers.

## Image Rules

Images are required but product photos are not.

Use:

- category fallback
- owned photos
- licensed stock
- generated conceptual diagrams
- setup/cleanup cards
- comparison diagrams

Do not use:

- user review photos
- map screenshots
- marketplace screenshots
- brand product photos without permission
- AI images that look like a specific brand/product without rights

Every image plan must specify:

- placement
- reader decision supported
- desired subject/composition
- acceptable source
- rights requirement
- fallback URI/token
- Korean alt text
- generation prompt path when using `imagegen`
- generated local asset path when available
- hosted/public URI or app asset URI before replacing the fallback

Generated hero images should usually be produced as:

```bash
python "$IMAGE_GEN" generate \
  --prompt "$(cat outputs/item-archive/{item-slug}/assets/hero-generation-prompt.md)" \
  --size 1536x1024 \
  --quality high \
  --out outputs/item-archive/{item-slug}/assets/hero.png
```

Use `--dry-run` first when checking prompt shape or when `OPENAI_API_KEY` is not available.

## Verification Commands

Generate DB artifacts, preferred if available:

```bash
npm run archive:item:upsert -- <seed-dir>
```

Apply private draft, preferred if available:

```bash
npm run archive:item:upsert -- <seed-dir> --apply
```

If the repo uses a generic command, use that.

If only a spot-compatible command exists, inspect it before use and report the compatibility decision.

Preview verification pattern:

```bash
curl -s 'https://admin.getbathtime.com/api/archive-preview/{id}?token={token}' \
  | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const j=JSON.parse(d);const body=j.content?.body||[];const headings=body.filter(b=>b.type==='heading').map(b=>b.text);const imageBlocks=body.filter(b=>b.type==='image').map(b=>b.uri);const text=JSON.stringify(j.content||{});const badWords=['TOP','베스트','최고','필수템','인생템','구매각','신호','시그널','signal'];console.log(JSON.stringify({id:j.content?.id,isPublished:j.content?.isPublished,headings,imageBlocks,badWords:badWords.filter(w=>text.includes(w)),structuredInfo:j.content?.structuredInfo},null,2));})"
```

If `--apply` returns `fetch failed` after generate-only succeeds, retry once.

## Batch Processing

For multiple item notes:

- process one item note at a time
- do not reuse facts or image plans across item categories
- verify each preview before moving on when DB apply is used
- after every 3-5 item notes, start a fresh chat if quality starts drifting

## Final Report

For each item note, report:

- item slug and archive id
- angle type
- files created or updated
- generated image prompt path, generated asset path, and whether it was actually wired into `heroImage.uri`
- DB artifact generation result
- DB apply result if attempted
- preview verification result if available
- preview URL with token when available
- remaining publish blockers
- whether anything stopped before draft apply
- which upsert command was used or missing

Keep the report concise. The goal is operational clarity, not a second article draft.

## Recommended Pipeline Prompt

```md
새 아이템 노트로 처리한다. 이전 아이템의 정보, 이미지 계획, CTA, 구조화 정보 값을 재사용하지 않는다.

Use `bathtime-item-note-publishing-pipeline`.

Target item idea: {item/category/product/question}
Output directory: outputs/item-archive/{slug}/

Tasks:
1. Run `bathtime-item-note-ideator` and create `item_angle_brief.md`, `item_angle_record.json`, `research_plan.md`, `content_risk_note.md`.
2. Run the Angle Review Gate. Revise the angle once if needed; stop before research if it still fails.
3. Run `bathtime-item-note-researcher` and create item research artifacts.
4. Run `bathtime-item-note-seed-builder` and create item seed artifacts.
5. Run `bathtime-item-note-web-content-producer` and create `item-seed.web-content.md`.
6. If requested, run `imagegen` for a rights-safe generated hero image and/or inline diagrams. Keep fallback image URI unless the generated asset is hosted or app-addressable.
7. Run `bathtime-item-note-archive-content-implementer` and update `item-seed.archive-content.ts`.
8. Generate DB upsert artifacts if an item/generic archive upsert command exists.
9. Apply draft only if requested and env is configured.
10. Keep `isPublished: false` / `status: draft`.
11. Run fail conditions and report blockers.
```
