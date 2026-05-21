---
name: bathtime-item-note-web-content-producer
description: Turn Bathtime Item Note seed artifacts into publish-ready web archive content. Use when the user references item-seed.canonical.json, item-seed.archive-content.ts, item-seed.mapping.md, image placement, item note body structure, SEO copy, publish blockers, or asks to prepare bath item content for the actual Bathtime website.
metadata:
  short-description: 배스타임 아이템 노트 웹 콘텐츠 제작
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

An Item Note page should help the reader decide whether a tool fits their bath ritual and daily life.

It should not primarily persuade them to buy.

Good:

```text
족욕기, 매일 꺼내 쓸 수 있을까?
```

Bad:

```text
2026년 추천 족욕기 TOP 5
```

Good:

```text
반신욕조는 입욕 로망보다 보관과 배수 조건이 먼저입니다.
```

Bad:

```text
홈스파 필수템 반신욕조 추천
```

## Required Output Modes

Before writing, decide which mode the user asked for:

1. **Content QA mode**: evaluate whether the item can become a Bathtime Item Note.
2. **Web content package mode**: create `item-seed.web-content.md` with page copy, structured info, image plan, SEO, CTA, blockers, and QA.
3. **Implementation mode**: update `item-seed.archive-content.ts`, image references, DB row/upsert artifacts, or related renderer code.

If the user says “웹 업로드용”, “아카이브 콘텐츠”, “아이템 노트”, “시드”, “Codex로 돌려줘”, or references seed files, default to **Web content package mode** unless the user explicitly asks for implementation.

## Core Workflow

### 1. Inspect target files and renderer

Read the referenced files first.

Check when implementation details matter:

- `src/archive/types.ts`
- `src/components/web/ArchiveVisual.tsx`
- `src/components/web/ContentBodyRenderer.tsx`
- `src/archive/seed.ts`
- existing item or archive content examples

### 2. Create a publish package before changing production seed files

Recommended filename:

```text
item-seed.web-content.md
```

The package must include:

- page content
- reader verdict
- body blocks
- structured info
- hero image plan
- inline image blocks
- SEO
- CTA / links
- publish blockers
- quality gate

Keep factual claims traceable to the canonical JSON, mapping report, or research sources.

### 3. Shape the content for the archive UI

Use:

- `ArchiveContent.title`: short Korean display title
- `subtitle`: one editorial angle, not a fact dump
- `summary`: compact item decision summary suitable for cards and SEO
- `body`: supported body blocks only
- `structuredInfo`: reader-facing practical decision fields

### 4. Plan images explicitly

Images are not decoration. They should help readers understand use, friction, comparison, or ritual context.

For immediate safe publishing, use fallback or generated conceptual images unless owned, official, or licensed images are available.

When generated images are requested, add image generation prompts and asset paths to the Hero Image Plan / Inline Image Blocks. Do not replace fallback URIs unless the generated asset is hosted or app-addressable.

Do not use:

- marketplace screenshots
- user review photos
- brand product images without permission
- exact product photos if rights are unclear
- AI images that mimic a specific brand/product without permission

Allowed image roles:

- ritual context image
- item category illustration
- setup / cleanup flow card
- comparison diagram
- storage burden illustration
- safety or caution card
- timer connection card

Always write meaningful Korean `alt` text.

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

If any of these sections is missing, the output is incomplete and must be fixed before delivery.

## Item Note Body Order

Use this order unless the seed or renderer requires otherwise:

1. `한 줄 판단`
2. `어떤 의식을 돕나요`
3. `사기 전에 먼저 볼 것`
4. `좋게 볼 수 있는 점`
5. `아쉬운 점`
6. `이런 사람에게 맞아요`
7. `이런 사람에게는 애매해요`
8. `같이 쓰면 좋은 의식`
9. `저장해둘 이유`

For a specific product, add a source-scoped line near the top:

```text
특정 제품의 실제 사용 후기가 아니라, 공개 정보와 후기를 바탕으로 구매 전 확인할 점을 정리한 아이템 노트입니다.
```

For a category note, lead with the decision frame:

```text
이 글은 특정 제품 추천보다, 이 아이템 유형이 내 욕실과 생활에 들어올 수 있는지 판단하기 위한 노트입니다.
```

## Reader Verdict Rules

The first body block must answer:

- What item/category is this?
- What ritual does it support?
- What is the biggest practical tradeoff?
- Who should keep reading?

Examples:

```md
### 한 줄 판단
족욕기는 발을 데우는 기계라기보다, 자기 전 10분 동안 앉아 있을 자리를 만들어주는 도구에 가깝습니다. 다만 매번 물을 받고 버리고 말리는 과정까지 감당할 수 있어야 오래 갑니다.
```

```md
### 한 줄 판단
반신욕조는 욕조 없는 집의 입욕 로망을 채워줄 수 있지만, 작은 욕실에서는 물 채우기보다 보관과 배수가 먼저입니다.
```

## Structured Info Rules

The structured panel is a reader-facing decision card, not a database dump.

### Required reader-facing fields

Use clear Korean labels such as:

- `사용 상황`
- `돕는 의식`
- `욕조 필요`
- `물 사용`
- `전원 필요`
- `보관 난이도`
- `청소 난이도`
- `매일 사용 가능성`
- `가격대`
- `추천 대상`
- `애매한 대상`
- `같이 쓰면 좋은 것`

### Forbidden values in user-facing structuredInfo

Do not display:

- raw enums such as `footbath_electric`, `item_category`, `storage_medium`
- bare `unknown`
- bare `미정`
- unexplained `확인 필요`
- English internal labels
- `필수템`
- `최고`
- `TOP`
- `베스트`

### Unknowns must be specific

Bad:

```text
가격대: 확인 필요
보관: 미정
```

Good:

```text
가격대: 제품별 차이가 큼. 발행 전 대표 가격대 재확인 필요.
보관: 접이식 여부와 말릴 공간에 따라 크게 달라짐.
```

### Price range must be scan-friendly

Aim for about 40 Korean characters or less.

Good:

```text
1만~3만 원대
3만~10만 원대
가격대 넓음 · 제품별 차이 큼
대표 가격대 재확인 필요
```

Bad:

```text
공식몰과 여러 쇼핑몰을 보면 39,900원부터 189,000원까지 있고 옵션별로 배송비와 추가 구성품이 다르며...
```

Move detailed price notes to body copy, source notes, or publish blockers.

## Image Implementation Contract

### Hero image is required

Every web content package must include a hero image plan with:

- `uri` or fallback token such as `category-item`, `category-home-bath`, `category-footbath`
- `sourceType`: `owned`, `official`, `licensed`, `generated`, or `fallback`
- Korean `alt`
- rights status
- fallback behavior
- optional `generationPromptPath` when imagegen should create the asset
- optional `generatedLocalPath` after imagegen runs
- final hosted/public URL or app-supported asset URI before replacing the fallback

If no verified product image is available, use a category fallback and explain what owned/official image should replace it later.

Generated hero images are allowed when they are conceptual, rights-safe, and not brand-specific.

Use `photorealistic-natural` for quiet editorial lifestyle hero images and `infographic-diagram` for comparison or setup cards.

Do not make generated images look like a specific brand, product listing, marketplace image, review photo, package, logo, label, or ad creative.

If imagegen creates a local file but it is not uploaded or addressable by the app, keep the fallback `heroImage.uri` and record the local file path as an implementation note or publish blocker.

### Inline image slots are required

Every Item Note package must include at least two planned inline image slots.

- Inline Image 1: appears after `한 줄 판단` or `어떤 의식을 돕나요`. It should clarify ritual context or the item’s role.
- Inline Image 2: appears after `사기 전에 먼저 볼 것` or before `이런 사람에게 맞아요`. It should clarify practical friction, comparison, storage, or setup/cleanup.

Each inline image slot must specify:

- exact body placement
- intended reader decision
- desired subject/composition
- acceptable source
- rights requirement
- fallback URI/token
- Korean `alt`
- generation prompt path and local generated path when available

### Body block image requirement

When implementing `item-seed.archive-content.ts`, the body must contain actual image blocks if `ContentBodyBlock` supports them. Do not leave images only in a planning note.

If renderer support is similar to this, follow it:

```ts
{
  type: 'image',
  uri: 'image-slot:footbath-bowl-vs-machine-decision-card',
  caption: '족욕기와 족욕볼을 비교하는 설명형 카드 이미지. 실제 제품 사진이 아니라 구매 전 판단 기준을 보여주는 비주얼입니다.'
}
```

If the renderer does not support inline image blocks, create a blocker/code note.

## Body Copy Hard Rules

The body should read like a Bathtime archive page, not a product review memo.

### Avoid these headings

Do not use as final body headings:

- `Quick Facts`
- `Pros and Cons`
- `Product Review`
- `Recommendation`
- `Best Products`
- `Spec Summary`
- `콘텐츠 초안`
- `아이템 리뷰`
- `추천 제품`

### Use Korean reader-facing headings

Prefer:

- `한 줄 판단`
- `어떤 의식을 돕나요`
- `사기 전에 먼저 볼 것`
- `좋게 볼 수 있는 점`
- `아쉬운 점`
- `이런 사람에게 맞아요`
- `이런 사람에게는 애매해요`
- `같이 쓰면 좋은 의식`
- `저장해둘 이유`

### Internal research words are not allowed in public copy

Do not use:

- `신호`
- `시그널`
- `signal`

Replace:

- `후기 신호` -> `후기에서 반복적으로 언급됩니다`
- `가격 신호` -> `공개 가격 기준` / `검색일 기준 가격대`
- `공식 스펙 신호` -> `공식 스펙 기준`
- `충돌 신호` -> `출처별 안내가 다릅니다`

### Keep paragraphs short

Most paragraphs should be 1-2 sentences. Use lists for checks, fit/not-fit, alternatives, and connected rituals.

## CTA and Action Rules

Each Item Note page should connect to at least one action.

Allowed CTA types:

- `이 아이템 노트 저장하기`
- `관련 의식 보기`
- `10분 족욕 타이머 시작하기`
- `7분 샤워 타이머 시작하기`
- `비슷한 아이템 노트 보기`
- `내 욕실 세팅 제보하기`
- `써본 아이템 제보하기`
- `제품 예시 보기` only when examples and disclosure are handled

Do not output generic CTA suggestions as a brainstorming list. Convert them into actual CTA/link notes or implementation fields.

Do not make a purchase link the only or primary CTA unless the user explicitly requested commerce and disclosure is ready.

## Source and Fact Discipline

### Facts must be scoped

Bad:

```text
족욕기는 관리가 쉽습니다.
```

Good:

```text
접이식 족욕볼은 전동 족욕기에 비해 구조가 단순해 세척 부담이 낮은 편으로 볼 수 있습니다. 다만 말릴 공간은 필요합니다.
```

Bad:

```text
이 샤워필터는 피부에 좋습니다.
```

Good:

```text
샤워필터는 제품별 필터 구조와 교체 주기가 다릅니다. 피부 변화는 개인차가 커서 배스타임에서는 구매 전 확인할 조건 중심으로만 정리합니다.
```

### Candidate / draft language

Use when essential details are unresolved:

- `발행 전 대표 가격대 재확인 필요`
- `공식 스펙과 판매 페이지 안내가 다름`
- `제품 이미지 권리 확인 전까지는 카테고리 대체 이미지 사용`
- `직접 사용 전에는 장기 사용감 단정 불가`

## Publish Decision

Keep:

```ts
isPublished: false
status: 'draft'
```

when:

- product specs are unclear
- price range is stale or unverified
- product image rights are unresolved
- safety claims need review
- specific product comparison could be misleading
- affiliate/ad disclosure is needed but absent
- the draft sounds like an ad

Do not stop draft creation merely because image rights or exact prices are unresolved. Use fallback images and explicit publish blockers.

## Web Content Package Template

```md
# Web Content Package: {item note title}

## Source Files
- Angle brief:
- Canonical JSON:
- App archive seed:
- Mapping report:

## Page Content
- Title:
- Subtitle:
- Summary:
- Tags:
- Content type:
- Publish status:

## Reader Verdict
- One-line verdict:
- Safest framing:
- Main tradeoff:

## Body Blocks
1. 한 줄 판단:
2. 어떤 의식을 돕나요:
3. 사기 전에 먼저 볼 것:
4. 좋게 볼 수 있는 점:
5. 아쉬운 점:
6. 이런 사람에게 맞아요:
7. 이런 사람에게는 애매해요:
8. 같이 쓰면 좋은 의식:
9. 저장해둘 이유:

## Structured Info
- 사용 상황:
- 돕는 의식:
- 욕조 필요:
- 물 사용:
- 전원 필요:
- 보관 난이도:
- 청소 난이도:
- 매일 사용 가능성:
- 가격대:
- 추천 대상:
- 애매한 대상:
- 같이 쓰면 좋은 것:

## Hero Image Plan
- URI/token:
- Source type:
- Rights status:
- Alt:
- Caption:
- Replacement plan:
- Generation prompt path:
- Generated local path:
- Hosted/app URI:

## Inline Image Blocks
| Placement | Reader decision | Desired image direction | Acceptable source | Rights/status | Fallback |
| --- | --- | --- | --- | --- | --- |
| After section 1 | Clarify the ritual role of the item. | Conceptual or owned image showing the item category in a quiet bathroom context. Avoid exact brand/product lookalikes unless owned/licensed. | Owned, licensed, generated concept, or fallback. | Confirm before publish. | `image-slot:{slug}-ritual-context` |
| After section 3 | Clarify setup, storage, cleanup, or comparison. | Diagram/card showing preparation-cleanup-storage flow or category comparison. | Generated diagram, owned illustration, or fallback. | Safe if not brand-specific. | `image-slot:{slug}-decision-card` |

## SEO
- SEO title:
- SEO description:
- Canonical URL:
- OG image:

## CTA / Links
- Primary CTA:
- Secondary CTA:
- Related rituals:
- Related item notes:
- Disclosure notes:

## Publish Blockers
- 

## Quality Gate
- [ ] Not a product ranking
- [ ] No purchase pressure
- [ ] No unsupported medical or wellness claims
- [ ] Unknowns are visible and specific
- [ ] Price is dated or marked as variable
- [ ] Product examples are examples, not rankings
- [ ] Image rights are acceptable or fallback used
- [ ] Connected ritual/timer exists
- [ ] Korean copy is natural and scannable
- [ ] ArchiveContent fields match renderer support
- [ ] Generated image local paths are not used as final `heroImage.uri` unless the app can render them
```

## Fail Conditions

If any of the following appears in the draft, stop and revise:

- English memo headings remain in user-facing copy.
- The page reads like `TOP 5`, ranking, shopping list, or affiliate article.
- `필수템`, `최고`, `완벽`, `무조건`, `인생템`, `구매각` appear in user-facing fields.
- Product specs or prices are stated without source/date boundaries.
- A specific product is praised as best without evidence and disclosure.
- Medical, treatment, sleep-improvement, recovery, pain-relief, or skin-improvement guarantees appear.
- `신호`, `시그널`, or `signal` appears in final user-facing copy.
- Raw enum/internal values appear in `structuredInfo`.
- Hero image plan is missing.
- Fewer than two inline image slots exist.
- `isPublished: true` is recommended while blockers remain.

## Codex Session Hygiene

For each new item note, state at the top of the task:

```md
새 아이템 노트로 처리한다. 이전 아이템의 정보, 이미지 계획, CTA, 구조화 정보 값을 재사용하지 않는다.
```

For batch processing:

- process one item note at a time
- do not reuse facts across item categories
- after every 3-5 item notes, start a fresh Codex chat if quality drifts
- run Fail Conditions before writing files

## Recommended Codex Task Prompt

```md
새 아이템 노트로 처리한다. 이전 아이템의 정보, 이미지 계획, CTA, 구조화 정보 값을 재사용하지 않는다.

Use `bathtime-item-note-web-content-producer` in strict mode.

Target item note: {item note title}
Seed directory: {path}

Tasks:
1. Read item angle brief, canonical JSON, archive-content TS, mapping report, renderer types, and current image resolver.
2. Decide whether this is a category note, specific product note, comparison note, setup note, or checklist note.
3. Create `item-seed.web-content.md` with Page Content, Reader Verdict, Body Blocks, Structured Info, Hero Image Plan, Inline Image Blocks, SEO, CTA/Links, Publish Blockers, and Quality Gate.
4. Do not write product ranking copy.
5. Do not use English headings in final page content.
6. Do not display raw enum/internal values in structuredInfo.
7. Keep draft unpublished if specs, price, image rights, safety claims, or disclosure are unresolved.
8. Run Fail Conditions and report pass/fail.
```

## Copy Quality Gate

Before creating or updating `item-seed.archive-content.ts`, check:

- Can the reader understand the item’s use case in the first 3 seconds?
- Does the first section say what ritual it supports and what tradeoff matters?
- Is the page about fit, friction, and ritual rather than purchase pressure?
- Are setup, cleanup, storage, and daily-use likelihood visible?
- Are price and product examples source-scoped?
- Are safety or sensitivity notes handled carefully?
- Does every `확인 필요` explain what exactly must be checked?
- Are paragraphs short enough to scan?
- Are `좋게 볼 수 있는 점`, `아쉬운 점`, `이런 사람에게 맞음`, and `이런 사람에게는 애매함` represented?
- Is the page honest about whether the item was used firsthand, researched, or inferred from public information?
