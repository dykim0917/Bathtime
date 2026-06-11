---
name: bathtime-web-content-producer
description: Use this skill when turning Bathtime spot seed artifacts into publish-ready web archive content. Trigger when the user references spot-seed.canonical.json, spot-seed.archive-content.ts, spot-seed.mapping.md, image placement, hero images, body content structure, SEO copy, publish blockers, or asks to prepare bath/spa/sauna place content for the actual Bathtime website.
metadata:
  short-description: 배스타임 웹 아카이브 콘텐츠 제작
---

# Bathtime Web Content Producer

Strict v2 update: this version enforces web-page output shape, image placement, structuredInfo readability, spot-boundary decisions, and Codex session hygiene.

## Purpose

Turn seed artifacts into a web-ready content package for Bathtime archive pages without inventing facts or erasing uncertainty.

This skill starts after `bathtime-spot-seed-builder` has produced files such as:

- `spot-seed.canonical.json`
- `spot-seed.archive-content.ts`
- `spot-seed.mapping.md`

## Core Workflow

1. Inspect the target files and current app renderer.
   - Read the referenced seed files first.
   - Check `src/archive/types.ts`, `src/components/web/ArchiveVisual.tsx`, `src/components/web/ContentBodyRenderer.tsx`, and `src/archive/seed.ts` when implementation details matter.
   - Confirm whether the request is for a content plan, file edits, or publish QA.

2. Create a publish package before changing production seed files.
   - Recommended filename: `spot-seed.web-content.md` beside the seed files.
   - Include: page title, subtitle, summary, final body block order, hero image plan, inline image placement brief, SEO fields, CTA/link notes, publish blockers, and final checklist.
   - Keep factual claims traceable to the canonical JSON or mapping report.

3. Shape the content for the current archive UI.
   - `ArchiveContent.title`: short Korean display title.
   - `subtitle`: one editorial angle, not a fact dump.
   - `summary`: compact place description suitable for cards and SEO.
   - `body`: use headings, paragraphs, quotes, lists, dividers, and image blocks only as supported by `ContentBodyBlock`.
   - `structuredInfo`: keep unknowns visible when access, price, reservation, or policy are not verified.

4. Plan images explicitly.
   - For immediate safe publishing, use existing `category-*` fallback image URIs unless a verified image URL or owned asset exists.
   - If using a remote image URL, confirm rights and set `heroImage.sourceType` to `official`, `licensed`, or `owned` only when true.
   - If proposing local assets, specify destination paths under `assets/images/` and note any code changes needed to resolve them.
   - Do not use user-review photos, map screenshots, or third-party images without a clear rights basis.
   - Always write meaningful Korean `alt` text.
   - Add planned inline image slots even when the actual image is not ready, so another team member can source or shoot the right image later.
   - For each inline slot, specify where it appears in the body, what decision it helps the reader make, the desired image mood/composition, acceptable sources, rights requirements, and fallback behavior.
   - Avoid vague prompts such as "nice spa photo"; describe observable subjects, angle, framing, and what must not appear.
   - Do not add decorative images that do not support a reader decision. Every image slot should clarify place atmosphere, facility type, access, price/policy, or usage context.

5. Decide publish status conservatively.
   - Keep `isPublished: false` if any publish blockers remain.
   - Only recommend `isPublished: true` when access, price or price uncertainty, operating hours, image rights, and source confidence are acceptable for publication.
   - Never hide uncertainty just to make copy sound cleaner.

6. If asked to implement, make surgical edits.
   - Update only the relevant seed/content files and required asset resolver code.
   - Preserve existing style and TypeScript shapes.
   - Re-open edited files and check UTF-8 Korean text, imports, object syntax, and `ArchiveContent` compatibility.

7. If asked to update the DB, use the repo's archive upsert path.
   - Confirm the archive DB migrations exist: `db/migrations/2026-05-18_archive_content.postgres.sql` and `db/migrations/2026-05-18_archive_content_rls.postgres.sql`.
   - Generate reviewable artifacts first:
     `npm run archive:spot:upsert -- <seed-dir>`
   - This writes `spot-seed.archive-content.db-row.json` and `spot-seed.archive-content.upsert.sql` beside the seed files.
   - Apply directly only when the user clearly wants DB mutation and `CONTENT_DB_REST_URL` plus `CONTENT_DB_SERVICE_ROLE_KEY` are configured:
     `npm run archive:spot:upsert -- <seed-dir> --apply`
   - Keep `isPublished: false` / `status: draft` when publish blockers remain.


## Hard Output Contract

This skill must produce web-archive content, not a research memo. Treat this section as mandatory.

### Required output modes

Before writing, decide which mode the user asked for:

1. **Research QA mode**: evaluate whether the spot can become a Bathtime archive page.
2. **Web content package mode**: create `spot-seed.web-content.md` with page copy, image plan, SEO, blockers, and QA.
3. **Implementation mode**: update `spot-seed.archive-content.ts`, image references, DB row/upsert artifacts, or related renderer code.

If the user says “조사해줘”, “정리해줘”, “웹 업로드용”, “아카이브 콘텐츠”, “Codex로 돌려줘”, or refers to seed files, default to **Web content package mode** unless the user explicitly asks for only a research note.

### Never output these as the final archive content

Do not use raw analysis headings as final page sections:

- `Short Situation Summary`
- `Quick Facts`
- `What This Place Seems Good For`
- `What To Check Before Visiting`
- `Good Points`
- `Weak Points`
- `Fit For`
- `Not Fit For`
- `Source And Update Note`
- `CTA Suggestions`

These may appear only in a private scratchpad. The user-facing page package must use Korean, reader-facing headings such as:

- `한 줄 판단`
- `어떤 곳인가요`
- `이런 날에 잘 맞아요`
- `좋게 볼 수 있는 점`
- `아쉬운 점`
- `가기 전에 확인할 것`
- `저장해둘 이유`

`한 줄 판단` must be exactly one short sentence in one paragraph, ideally 35-55 Korean characters. Move supporting context into the next section.

### No markdown table as final page content

Do not place a long markdown table in the final body copy. Tables are easy to break in app output and often scan poorly on mobile.

Use key-value structured fields for `structuredInfo`, and short lists or paragraphs in `body`. A table is allowed only inside `spot-seed.web-content.md` planning sections such as Image Plan, not inside `ArchiveContent.body` unless the renderer explicitly supports it.

### Final answer must include these sections

A valid `spot-seed.web-content.md` must include, in this order:

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

If any of `Hero Image Plan`, `Inline Image Blocks`, `Structured Info`, or `Publish Blockers` is missing, the output is incomplete and must be fixed before delivery.

## Spot Boundary Rules

Do not merge multiple distinct facilities into one publishable spot just because they share a brand or address.

### Split or hold when needed

If a hotel complex contains multiple brands, towers, clubs, floors, or policies, decide whether to split them.

Examples:

- `그랜드 워커힐 서울 사우나`
- `비스타 워커힐 서울 웰니스 클럽`
- `워커힐 서울 사우나 후보 비교`

If Grand and Vista have different floors, prices, access rules, or membership policies, do not publish a single page titled `워커힐 서울 사우나` as though the policy is unified.

### Multi-facility rule

A page can mention related facilities only when one of these is true:

- the source confirms they share the same access and pricing policy;
- the page is explicitly framed as a comparison or candidate note, not a single spot;
- the ambiguous facility is moved to `Publish Blockers` instead of being treated as confirmed content.

### Publish decision

If the researched spot has unresolved facility identity, access policy, or price scope, keep:

```ts
isPublished: false
status: 'draft'
```

and state the exact reason in `Publish Blockers`.

## Image Implementation Contract

Images are not optional decoration. They are part of the archive reading experience.

### Hero image is required

Every web content package must include a `heroImage` plan with:

- `uri` or fallback token such as `category-place`, `category-sauna`, `category-hotel-bath`
- `sourceType`: `owned`, `official`, `licensed`, `generated`, or `fallback`
- Korean `alt`
- rights status
- fallback behavior

If no verified image is available, use the category fallback and explain what owned/official image should replace it later.

### Inline image slots are required

Every researched spot package must include at least two planned inline image slots, even when the actual image is not ready.

- Inline Image 1: appears after `한 줄 판단` or the first practical section. It should establish place/facility atmosphere.
- Inline Image 2: appears after `이런 날에 잘 맞아요` or before `가기 전에 확인할 것`. It should help judge access, context, facility type, or visit fit.

Each inline image slot must specify:

- exact body placement
- intended reader decision
- desired subject/composition
- acceptable source
- rights requirement
- fallback URI/token
- Korean `alt`

### Body block image requirement

When implementing `spot-seed.archive-content.ts`, the body must contain actual image blocks if `ContentBodyBlock` supports them. Do not leave images only in a planning note.

Use the renderer’s actual shape after checking `src/archive/types.ts` and `src/components/web/ContentBodyRenderer.tsx`. If the project uses a shape similar to this, follow it:

```ts
{
  type: 'image',
  src: 'category-place',
  alt: '워커힐 서울 호텔 사우나 분위기를 대체하는 배스타임 기본 이미지',
  caption: '실제 시설 이미지는 권리 확인 후 교체합니다.'
}
```

If the renderer does not support inline image blocks, create a blocker/code note:

> Inline image placement requested, but current `ContentBodyBlock` does not support image blocks. Add renderer support or keep image plan in `spot-seed.web-content.md` only.

## Structured Info Hard Rules

The structured panel is a reader-facing decision card, not a database dump.

### Forbidden values in user-facing structuredInfo

Do not display these in final copy or UI-facing fields:

- raw enums such as `hotel_public_bath`, `hotel_sauna`, `fitness_club`, `indoor_pool`
- bare `미정`
- vague `반개별`
- unexplained `확인 필요`
- English internal labels

### Required reader-facing labels

Use clear Korean labels with source boundaries:

- `외부인 이용`: `공식 정보 기준 미확인`, `비투숙객 단독 이용 확인 필요`, `투숙객 중심`, `외부인 이용 가능 확인됨`
- `가격대`: `공식 안내: 사우나 20,000원. 적용 대상과 단독 이용 가능 여부는 전화 확인 필요.`
- `예약 필요`: `전화 확인 필요`, `숙박/회원 조건 확인 필요`, `예약 필요 여부 미확인`
- `혼자 이용`: `혼자 이용 가능성이 높음`, `확인 필요`, `투숙객 단독 루틴에 적합`
- `프라이빗`: `공개형 대욕장/사우나`, `프라이빗 아님`, `프라이빗 여부 확인 필요`
- `시설`: `사우나 · 실내 수영장 · 피트니스` instead of `sauna, fitness_club, indoor_pool`

### Unknowns must be specific

Replace generic uncertainty with a specific question.

Bad:

```md
외부인 이용: 미정
예약 필요: 미정
혼자 이용: 미정
프라이빗: 반개별
```

Good:

```md
외부인 이용: 비투숙객 사우나 단독 이용 가능 여부는 공식 정보 기준 미확인
예약 필요: 사우나 단독 이용 예약 필요 여부는 전화 확인 필요
혼자 이용: 투숙객이 부대시설로 이용하는 상황에는 혼자 이용하기 적합
프라이빗: 호텔 공용 사우나로 보는 것이 안전함. 프라이빗 룸 아님
```

## Body Copy Hard Rules

The body should read like a Bathtime archive page, not an internal assessment.

### Required body order

Use this order for researched hotel sauna/bath pages:

1. `한 줄 판단`
2. `어떤 곳인가요`
3. `이런 날에 잘 맞아요`
4. `좋게 볼 수 있는 점`
5. `아쉬운 점`
6. `가기 전에 확인할 것`
7. `저장해둘 이유` or `문의 전 메모`

`한 줄 판단` must stay one line: one short sentence, one paragraph, no bullets, and no extra explanatory paragraph under the same heading.

### First paragraph rule

The first body paragraph must include the safest usage frame.

For a hotel sauna with uncertain external access:

```md
사우나만 따로 방문하는 곳이라기보다는, 이 호텔에 묵는 날 함께 고려할 만한 웰니스 시설로 보는 편이 안전합니다.
```

### English headings are not allowed

Final Korean content must not include English section names unless they are technical file names or code.

### Internal research words are not allowed in public copy

Do not use `신호`, `시그널`, or `signal` in user-facing final copy:

- `spot-seed.web-content.md` Page Content, Reader Verdict, Body Blocks, Structured Info, SEO, CTA/Links
- `spot-seed.archive-content.ts`
- DB-facing body, summary, subtitle, SEO, and structuredInfo text

These words are allowed only in internal research files such as `archive_record.json`, `research_sources.md`, `missing_fields.md`, mapping notes, or audit notes.

Replace them by source type:

- Official source: `공식 페이지에서 확인된다`, `공식 안내에 따르면`, `공식 요금표 기준`, `공식 정보에는 ...로 안내되어 있다`
- Reviews: `후기에서 반복적으로 언급된다`, `최근 후기에서는 ... 이야기가 나온다`, `일부 후기에서는 ...라고 언급된다`
- Uncertain inference: `...로 보는 편이 안전하다`, `...일 가능성이 있다`, `...는 방문 전 확인이 필요하다`
- Conflicts: `출처별 안내가 다르다`, `공개 정보가 서로 다르다`, `공식 정보와 보조 정보가 일치하지 않는다`

### Keep paragraphs short

Most paragraphs should be 1-2 sentences. Use lists for checks and fit/not-fit sections.

## CTA and Action Rules

Each archive page should connect to at least one action.

Allowed CTA types:

- `이 장소 저장하기`
- `비슷한 호텔 사우나 보기`
- `이용 조건 문의하기`
- `다녀온 정보 제보하기`
- `10분 족욕 타이머 시작하기` only when the content logically connects to home ritual execution

Do not output generic CTA suggestions as a separate brainstorming list in final content. Convert them into actual CTA/link notes or implementation fields.

## Source and Fact Discipline

### Facts must be scoped

When a fact applies only to a specific tower/floor/facility, name it.

Bad:

```md
워커힐 서울 사우나 요금은 20,000원입니다.
```

Good:

```md
그랜드 워커힐 서울 B2 피트니스 클럽 공식 안내 기준 사우나 요금은 20,000원으로 확인됩니다. 비스타 워커힐 사우나의 단독 요금과 동일 적용 여부는 별도 확인이 필요합니다.
```

### Candidate status language

Use candidate/draft language when essential details are unresolved:

- `발행 전 전화 확인이 필요한 후보`
- `단일 스팟으로 발행하기에는 그랜드/비스타 정책 분리가 필요함`
- `공식 정보 기준 시설 존재는 확인되지만, 외부인 단독 이용은 확인되지 않음`

## Fail Conditions

If any of the following appears in the draft, stop and revise before delivering:

- English analysis headings remain in user-facing copy.
- `Quick Facts` markdown table is used as final body content.
- `hotel_public_bath`, `hotel_sauna`, `fitness_club`, `indoor_pool`, or other raw enums appear in user-facing fields.
- `미정` appears without a specific explanation.
- `반개별` appears without a precise product/UI meaning.
- `신호`, `시그널`, or `signal` appears in user-facing body, subtitle, summary, SEO, CTA, or structuredInfo copy.
- The page combines multiple hotel facilities with different policies into one confirmed spot.
- No hero image plan exists.
- No inline image slots exist.
- Image slots exist only in planning but not in implemented body blocks when body image blocks are supported.
- `isPublished: true` is recommended while access, pricing scope, operating hours, or image rights are unresolved.

## Codex Session Hygiene

Long Codex chats can drift. Use these rules when processing many spots.

- Start a fresh Codex chat for each hotel group or every 3-5 spots.
- Paste this skill at the start of the new chat or ensure the active skill file is loaded.
- Do not let Codex reuse previous spot assumptions.
- At the top of each task, state: `새 스팟으로 처리한다. 이전 장소의 정보, 이미지 계획, CTA, 구조화 정보 값을 재사용하지 않는다.`
- Ask Codex to run the Fail Conditions before writing files.
- If output quality drops, stop batch processing and create a new session.

### Recommended Codex task prompt

```md
새 스팟으로 처리한다. 이전 장소의 정보, 이미지 계획, CTA, 구조화 정보 값을 재사용하지 않는다.

Use `bathtime-web-content-producer` in strict mode.

Target spot: {spot name}
Seed directory: {path}

Tasks:
1. Read canonical JSON, archive-content TS, mapping report, renderer types, and current image resolver.
2. Decide whether this is one publishable spot or must be split/held as a draft.
3. Create `spot-seed.web-content.md` with Page Content, Reader Verdict, Body Blocks, Structured Info, Hero Image Plan, Inline Image Blocks, SEO, CTA/Links, Publish Blockers, Quality Gate.
4. If implementation is requested, update `spot-seed.archive-content.ts` with Korean body sections, reader-facing structuredInfo, hero image, and inline image blocks if supported.
5. Do not use English section headings in final page content.
6. Do not output markdown Quick Facts tables as final body content.
7. Do not display raw enum/internal values in structuredInfo.
8. Keep draft unpublished if external access, price scope, facility identity, hours, or image rights are unresolved.
9. Run Fail Conditions and report pass/fail.
```


## Reader Decision and Readability Rules

Bathtime archive pages must help the reader decide quickly whether a place fits their day. Do not optimize only for a clean-looking page or a nicely written article.

### Above-the-fold decision rule

Within the title, subtitle, summary, and first body block, answer these questions:

- What is this place?
- Who is it mainly useful for?
- Can a non-guest or outsider realistically use it?
- What is the safest usage framing when access, price, or reservation details are uncertain?
- What must the reader check before visiting?

When there is a decision-blocking unknown, surface it near the top instead of burying it in a later section. Example:

> 사우나만 하러 가는 곳이라기보다, 이 호텔에 묵는 날 함께 쓰기 좋은 대욕장에 가깝습니다. 비투숙객 단독 이용과 단독 요금은 공식 정보 기준으로 확인되지 않았습니다.

### Left body vs right structured panel

Separate the role of editorial body and structured information.

- The left body explains the reader context, safe interpretation, fit, tradeoffs, and visit decision.
- The right structured panel gives the quick factual judgment: region, access, price, reservation, solo use, private/public, facility type, update date.
- Do not repeat the same facts in both areas with similar wording. If the right panel already says `외부인 이용: 확인 필요`, the body should explain what that means for the reader.
- The body should not feel like a second copy of the structuredInfo card.
- The structuredInfo card should not feel like an internal database dump.

### Top conclusion first

For spot pages, lead with the practical conclusion before atmosphere or ritual interpretation.

Good:

> 강남에서 도미인 서울 강남에 묵는 날, 객실 샤워 대신 함께 고려할 만한 호텔 대욕장입니다. 비투숙객 단독 이용 여부는 공식 정보만으로 확인되지 않았습니다.

Avoid:

> 강남 일정 뒤, 몸의 온도를 정리하는 투숙 루틴으로 바라볼 수 있는 공간입니다.

The second version may be useful later in the body, but it is too indirect as the first decision sentence.

### Subtitle rule

The subtitle should be one short editorial angle, not a compressed fact dump.

- Prefer one situation + one value.
- Do not pack location, mood, target user, facility type, and uncertainty into one sentence.
- Move conditions such as `투숙객 중심`, `외부인 확인 필요`, or `요금 확인 필요` into tags, summary, or structuredInfo.

Example:

- Prefer: `강남에서 묵는 날, 객실 샤워 대신 들르기 좋은 호텔 대욕장.`
- Avoid: `강남 일정 뒤, 객실 샤워만으로 아쉬운 날에 떠올릴 만한 투숙객 중심 호텔 대욕장.`

### Paragraph and rhythm rules

Make the content scannable.

- Keep most Korean paragraphs to 1-2 sentences.
- Avoid long sentences with 3 or more clauses.
- Use lists for checklists, fit/not-fit, and visit blockers.
- Use a short quote or callout only for the main verdict or a decision-blocking caveat.
- Do not use multiple callout boxes with the same emphasis level. One should be the verdict; another, if needed, should be a warning or publish blocker.
- Every section should earn its place by helping the reader decide, save, visit, verify, or act.

## Recommended Spot Body Order

Use this order for researched spot archive pages unless the seed or renderer requires otherwise:

1. **One-line verdict**: the safest practical interpretation of the place.
2. **What this place is**: confirmed facility facts in plain language.
3. **Good for**: situations where this place fits the reader's day.
4. **Good points**: place-specific strengths, not generic praise.
5. **Ambiguous or weak points**: unknowns, access limits, price/reservation uncertainty, or mismatch risk.
6. **Check before visiting**: concise checklist of decision-blocking details.
7. **CTA / closing note**: save, verify, inquire, view similar spots, or use a related timer where appropriate.

For hotel bath or hotel sauna pages, always distinguish between:

- staying at the hotel and using the facility as an amenity;
- visiting only for the bath/sauna;
- confirmed public access;
- unknown or unverified public access.

## Structured Info Presentation Rules

Structured information must be reader-facing Korean, not raw internal values.

- Do not display raw enum-like values such as `hotel_public_bath`, `hotel_sauna`, `PRIVATE_UNKNOWN`, or `PRICE_UNKNOWN` in the UI copy.
- Convert internal values into readable labels such as `호텔 대욕장 · 사우나`, `공개형`, `프라이빗 여부 확인 필요`, or `공식 정보 기준 미확인`.
- Repeated bare `확인 필요` weakens trust. Add the reason or source boundary when possible.
- Prefer `공식 정보 기준 미확인`, `전화 확인 필요`, `비투숙객 단독 이용 여부 미확인`, or `단독 요금 미확인` over generic `확인 필요`.
- If price is unknown because it may be included in lodging, say so clearly: `숙박 포함 시설 가능성이 높음. 단독 이용 요금은 공식 정보 기준 미확인.`
- If a field is truly unknown, keep the uncertainty visible instead of deleting the field.
- Facility names should be human-readable and specific: `내탕 · 냉탕 · 고온 사우나 · 실키탕` is better than a broad `사우나` when the source supports it.

### Price range must be scan-friendly

`structuredInfo.priceRange` appears in the structured card and content cards. Keep it short enough to scan.

Rules:

- Aim for about 40 Korean characters or less.
- Show only the representative price or 1-2 key price ranges.
- Do not put full pricing tables, source explanations, parking, overtime fees, package details, or long caveats in `priceRange`.
- Move detailed prices and conditions into body copy, `가기 전에 확인할 것`, or publish blockers.
- Avoid repeated prefixes such as `공식 페이지 기준` when the body already explains the source.

Preferred patterns:

- `1인 44,000원`
- `투숙객 44,000원`
- `17,000~30,000원`
- `사우나 13,000원 / 찜질 17,000~19,000원`
- `요금 미공개 · 전화 확인`
- `숙박 포함 가능 · 단독 요금 미확인`

Bad:

```ts
priceRange: '공식 이용요금 페이지 기준 카페 8,000원, 사우나+카페 성인 13,000원, 찜질+사우나+카페 12시간권 성인 주중 17,000원·주말 19,000원, 24시간권 30,000원...'
```

Good:

```ts
priceRange: '사우나 13,000원 / 찜질 17,000~19,000원'
```

## Copy Quality Gate

Before creating or updating `spot-seed.archive-content.ts`, check the draft against this gate:

- Can the reader understand the place's use case in the first 3 seconds?
- Is the page's conclusion visible before the slower editorial explanation?
- Are access, price, reservation, and public-use uncertainties visible near the top when they matter?
- Does the body avoid duplicating the right structuredInfo panel?
- Does the structuredInfo panel avoid raw internal field names or enum values?
- Does every `확인 필요` explain what exactly needs confirmation?
- Are paragraphs short enough to scan on mobile and desktop?
- Are `좋았던 점`, `아쉬운 점`, `이런 사람에게 맞음`, and `이런 사람에게는 애매함` represented either as headings, lists, or equivalent body sections?
- Does the copy sound like a practical Bathtime archive entry rather than glossy travel writing?
- Is the page honest about whether it was visited, researched, or inferred from public information?

## Example: Hotel Public Bath Framing

When the source confirms a hotel bath facility but does not confirm standalone public use, frame it like this:

```md
### 한 줄 판단
도미인 서울 강남에 묵는 날, 객실 샤워 대신 함께 고려할 만한 호텔 대욕장입니다.

### 가기 전에 확인할 것
비투숙객 단독 이용 가능 여부와 단독 요금은 공식 정보만으로 확인되지 않았습니다. 사우나만 이용하러 가기보다는 숙박 일정에 포함된 시설로 보는 편이 안전합니다.

### 어떤 날에 맞을까
강남 일정이 길었던 날, 방에 들어가기 전 몸을 한 번 데우고 싶을 때 잘 맞습니다.

객실 샤워만으로는 조금 아쉬운 날이라면, 온탕과 사우나, 냉탕을 짧게 오가는 식으로 가볍게 루틴을 만들 수 있습니다.

### 가기 전에 확인할 것
- 비투숙객 단독 이용 가능 여부
- 단독 이용 요금 또는 숙박 포함 여부
- 수건, 가운, 어메니티 제공 방식
- 마지막 입장 시간과 사우나 중지 시간
- 문신, 연령, 촬영 관련 이용 정책
```

## Web Content Package Template

```md
# Web Content Package: {spot title}

## Source Files
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

## Body Structure
1. One-line verdict:
2. What this place is:
3. Good for:
4. Good points:
5. Ambiguous or weak points:
6. Check before visiting:
7. CTA / closing note:

## Inline Image Placement Brief
| Placement | Purpose | Desired image direction | Acceptable source | Rights/status | Fallback |
| --- | --- | --- | --- | --- | --- |
| After section 1 | Establish the actual bath/place atmosphere before practical details. | Horizontal image of the bath entrance, lobby sign, official bath area photo, or quiet hotel-bath mood. Avoid crowded people, faces, or unreadable screenshots. | Owned photo, official press/website image with permission, licensed stock, or generated fallback. | Confirm before publishing. | Omit slot or show `category-place` fallback until ready. |
| After section 3 | Help readers judge whether the visit context fits them. | Context image such as hotel exterior, nearby street approach, amenity detail, changing-room neutral detail, or sauna material texture. No user-review photos without permission. | Owned photo, official image with permission, licensed stock, or generated fallback. | Confirm before publishing. | Keep text-only body if no safe image exists. |

## Image Plan
| Slot | URI/path | Source type | Alt | Notes |
| --- | --- | --- | --- | --- |
| Hero | `category-place` | `generated` |  | Safe fallback until owned/official image is ready. |
| Inline 1 |  |  |  | Must match the first row of Inline Image Placement Brief. |
| Inline 2 |  |  |  | Optional; use only if it helps the reader decide. |

## SEO
- SEO title:
- SEO description:
- Canonical URL:
- OG image:

## Publish Blockers
- 

## Final Checklist
- [ ] No unsupported factual claims
- [ ] Unknown access/price/policy details remain visible near the top when decision-blocking
- [ ] One-line verdict is clear within the first body block
- [ ] Body copy does not duplicate the structuredInfo panel
- [ ] structuredInfo labels are user-facing Korean, not raw enum/internal values
- [ ] Each `확인 필요` explains what exactly must be checked
- [ ] Image rights are acceptable
- [ ] Korean copy is natural, scannable, and not over-claiming wellness benefits
- [ ] `ArchiveContent` fields match `src/archive/types.ts`
```

## Copy Rules

- Prefer practical, place-specific editorial copy over glossy travel copy.
- Write for someone deciding whether this bath place fits their day.
- Use clear uncertainty language: "확인 필요", "공식 정보만으로는 확인되지 않음", "투숙객 중심으로 보는 것이 안전".
- Avoid medical or guaranteed-effect claims such as 치료, 완화, 효능, 회복 보장, 불면 해결, 통증 개선.
- Avoid pretending a researched place was personally visited unless `contentType` is `VISITED` or source files prove it.

## Output Expectations

When the user asks for "실제 웹 업로드용 콘텐츠", provide or create:

- `spot-seed.web-content.md`: strict editorial package with Page Content, Reader Verdict, Body Blocks, Structured Info, Hero Image Plan, Inline Image Blocks, SEO, CTA/Links, Publish Blockers, and Quality Gate
- Optional updated `spot-seed.archive-content.ts`: only if the user wants implementation
- Optional `spot-seed.archive-content.db-row.json` and `spot-seed.archive-content.upsert.sql`: when DB update is requested
- Optional asset/code notes: exact image path or resolver change required
- A concise verification summary with remaining blockers
