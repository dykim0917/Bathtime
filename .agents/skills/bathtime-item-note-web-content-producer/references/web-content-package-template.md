# Web Content Package Template

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
