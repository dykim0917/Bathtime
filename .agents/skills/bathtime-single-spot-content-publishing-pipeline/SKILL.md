---
name: bathtime-single-spot-content-publishing-pipeline
description: Run the full Bathtime single spot content publishing pipeline through private draft DB apply. Use when the user wants to take one bath/spa/sauna place from research to draft preview in one cycle: research artifacts, canonical seed, web content package, Korean humanization review, final observer-tone pass, ArchiveContent implementation, DB upsert artifacts, Supabase/PostgREST draft apply, and preview verification. This skill orchestrates bathtime-single-spot-content-researcher, bathtime-single-spot-content-seed-builder, bathtime-single-spot-content-web-content-producer, humanize-korean, and bathtime-single-spot-content-archive-content-implementer. It never publishes publicly by default.
metadata:
  short-description: 바스타임 단일 장소 조사부터 비공개 draft 반영까지
---

# Bathtime Single Spot Content Publishing Pipeline

This is the one-cycle orchestrator for Bathtime single spot content.

Default outcome: a private draft archive page applied to the DB and verified by preview API.

Never publish publicly by default. The pipeline stops at `isPublished: false` / `status: draft`.

## Pipeline Order

Run these steps in order. Load each named skill when the step starts.

1. `bathtime-single-spot-content-researcher`
   - Research the target place.
   - When an official page URL is known but browser/web fetch fails, retry with local `curl -L -A 'Mozilla/5.0'` before treating the fact as unknown.
   - If search results expose a specific official page such as pricing, opening hours, reservation, or facilities, open or curl that exact page and extract the original table/text.
   - Create or update:
     - `archive_record.json`
     - `research_sources.md`
     - `content_draft.md`
     - `sns_summary.md`
     - `verification_checklist.md`
     - `missing_fields.md`

2. `bathtime-single-spot-content-seed-builder`
   - Convert research outputs into seed artifacts.
   - Create or update:
     - `spot-seed.canonical.json`
     - `spot-seed.archive-content.ts` initial app seed
     - `spot-seed.mapping.md`

3. `bathtime-single-spot-content-web-content-producer`
   - Create the web-facing editorial package.
   - Create or update:
     - `spot-seed.web-content.md`
   - The package must include page content, reader verdict, body blocks, structured info, hero image plan, inline image blocks, SEO, CTA/links, publish blockers, and quality gate.
   - Run the UX polish gate before implementation:
     - reader-facing image captions must explain the image's meaning, not production method such as `비브랜드 생성 이미지` or `생성 이미지입니다`;
     - criteria, source, facility, or access lists should use `short label: explanation` structure when possible;
     - if the default `한눈에 보기` box is weak for the content type, record `quality.ux_follow_up` or a publish blocker with a better summary proposal;
     - include a real CTA only when the route exists, otherwise keep it as text or a publish blocker.
   - Do not run the observer-essay tone gate as the first draft style pass. It runs after `humanize-korean` as the final Bathtime voice pass.

4. `humanize-korean`
   - Run this required review step before the final Observer Essay Tone Pass and before ArchiveContent implementation.
   - Input:
     - `spot-seed.web-content.md`
   - Create or update:
     - `spot-seed.web-content.humanized.md`
     - `spot-seed.web-content.humanize-summary.md`
   - Preserve source boundaries, prices, dates, access uncertainty, image-right notes, and no-fake-visit stance.

5. Final Observer Essay Tone Pass
   - Run the observer-essay tone gate after `humanize-korean` and before implementation:
     - first read and follow `docs/03-content/bathtime-observer-essay-tone-guide.md`;
     - apply Bathtime's observer-essay tone only to body paragraphs, scene-setting, transitions, and reflective closing copy;
     - do not apply it to title, subtitle, summary, SEO, structured info, prices, operating hours, facility labels, source notes, dates, publish blockers, or CTA labels;
     - default all Bathtime single-spot public body copy, captions, and CTAs to calm `한다체`;
     - use short Korean sentences, concrete checking actions, and restrained sensory details only when source artifacts support them;
     - never write as if Bathtime visited the spot unless direct visit source files prove it;
     - for public-source research, make the observing subject an editorial verification flow: checking official pages, comparing reservation/map information, reading repeated review patterns, and noting what still needs recheck;
     - stop before DB apply if tone polishing hides uncertainty, adds visit claims, adds unsupported sensory claims, or turns the spot into a recommendation.
   - Before implementation, search final body copy for unintended casual endings:
     `rg "해요|돼요|좋아요|예요|이에요|거예요|했어요|봤어요" <output-files>`.
   - Allow exceptions only for literal quoted user copy, actual button labels, or intentionally user-copyable questions. Record any exception in the quality gate.

6. `bathtime-single-spot-content-archive-content-implementer`
   - Convert the web package into the real app/DB source.
   - Update:
     - `spot-seed.archive-content.ts`
   - Generate:
     - `spot-seed.archive-content.db-row.json`
     - `spot-seed.archive-content.upsert.sql`
   - Apply draft to DB:
     - `npm run archive:spot:upsert -- <seed-dir> --apply`
   - Verify preview API.

## Required User Input

Accept any of these:

- spot name
- official URL
- map/booking URL
- existing research folder
- existing seed directory
- batch list of spots

If the target cannot be identified, ask one concise question. Otherwise make a conservative assumption and record it.

## Output Location

Use the repo convention:

```text
outputs/spot-archive/{spot-slug}/
outputs/spot-archive/{spot-slug}/seed/
```

If a folder already exists, read it first and update it instead of starting over. Do not discard existing research or seed artifacts.

## Default Mode: apply-draft

Unless the user says otherwise, run through DB draft apply.

The final DB row must remain:

```ts
isPublished: false
status: 'draft'
```

Publishing requires a separate explicit request after preview review.

## Stop Conditions

Stop before DB apply and report the blocker when:

- official identity of the place/facility is ambiguous;
- multiple facilities are being merged but have different policies;
- legal or safety risk appears;
- user asks for public publish;
- `spot-seed.archive-content.ts` fails the implementer fail conditions;
- the upsert generation command fails;
- required DB env is missing for `--apply`;
- preview token or preview endpoint is unavailable after DB apply and no alternate verification path exists.

Do not stop merely because access, price, reservation, or image rights are unresolved. Those are normal draft blockers. Surface them in the draft and keep the content private.

Do not mark an official fact as unresolved until the direct official URL has been attempted through both the web browser/fetch path and a local HTTP fallback such as `curl`. Record the fallback result in `research_sources.md`.

## Draft Content Rules

Final `spot-seed.archive-content.ts` must:

- use Korean reader-facing body headings;
- avoid English research memo headings;
- avoid markdown quick-facts tables in `body`;
- avoid raw enum labels in visible text and `structuredInfo.facilityTypes`;
- avoid internal research words such as `신호`, `시그널`, or `signal` in public-facing body, subtitle, summary, SEO, CTA, and structuredInfo;
- keep `structuredInfo.priceRange` as a short scan label, not a pricing paragraph;
- include a hero image fallback;
- include at least two inline image slots when image body blocks are supported;
- keep reader-facing image captions focused on the content message, not asset production method;
- make long criteria or source lists scannable with labels when possible;
- record `한눈에 보기` UX follow-up when the default category metadata does not fit;
- include a text CTA or real linked CTA without pretending missing routes exist;
- make access, price, reservation, and policy uncertainty visible near the top;
- preserve publish blockers rather than hiding uncertainty;
- never claim firsthand experience unless source files prove it.

Series rule:

- If the single spot content belongs to a planned editorial sequence, put the sequence metadata in `structuredInfo.series`.
- Use shape `{ id, title, order, description? }`.
- Do not use a body `ctaGroup` as a manual series list. The public content page renders series panels from `structuredInfo.series`.
- Keep the same series `id`, `title`, and `description` across all articles in the same series.

When converting research into public copy, translate internal research language:

- `24시간 영업 신호` -> `24시간 영업으로 안내된 자료가 있다` or `공식/플랫폼 정보에서 24시간 영업으로 안내된다`
- `후기 신호` -> `후기에서 반복적으로 언급된다`
- `가격 신호` -> `공식 요금표 기준` or `공개 정보의 요금 안내`
- `출처별 신호가 다르다` -> `출처별 안내가 다르다`

Price range rule:

- Use `priceRange` for representative prices only.
- Good: `1인 44,000원`, `17,000~30,000원`, `사우나 13,000원 / 찜질 17,000~19,000원`.
- Bad: full ticket tables, parking/overtime details, source explanations, and multi-sentence caveats.
- Move details to body, `가기 전에 확인할 것`, or publish blockers.

## Verification Commands

Generate DB artifacts:

```bash
npm run archive:spot:upsert -- <seed-dir>
```

Apply private draft:

```bash
npm run archive:spot:upsert -- <seed-dir> --apply
```

Preview verification:

```bash
curl -s 'https://admin.getbathtime.com/api/archive-preview/{id}?token={token}' \
  | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const j=JSON.parse(d);const body=j.content?.body||[];const headings=body.filter(b=>b.type==='heading').map(b=>b.text);const imageBlocks=body.filter(b=>b.type==='image').map(b=>b.uri);console.log(JSON.stringify({id:j.content?.id,isPublished:j.content?.isPublished,headings,imageBlocks,structuredInfo:j.content?.structuredInfo},null,2));})"
```

If `--apply` returns `fetch failed` after generate-only succeeds, retry once.

## Batch Processing

For multiple spots:

- process one spot at a time;
- do not reuse facts or image plans across spots;
- verify each preview before moving on;
- after every 3-5 spots, recommend starting a fresh chat if quality starts drifting.

## Final Report

For each spot, report:

- spot slug and archive id;
- files created or updated;
- DB apply result;
- preview verification result;
- public preview URL with token when available;
- remaining publish blockers;
- whether anything stopped before draft apply.

Keep the report concise. The goal is operational clarity, not a second article draft.
