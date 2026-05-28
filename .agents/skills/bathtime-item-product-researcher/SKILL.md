---
name: bathtime-item-product-researcher
description: Research real product examples for Bathtime Item Note pages without turning the content into rankings, ads, or affiliate-style reviews. Use when the user wants to add actual products, purchase links, product candidates, representative product types, price/date notes, availability checks, or bottom-of-article "비교해볼 만한 후보" sections to Bathtime item content.
metadata:
  short-description: 배스타임 아이템 노트용 실제 제품 후보 리서치
---

# Bathtime Item Product Researcher

## Purpose

Add real product information to an Item Note as a careful research appendix, not a recommendation list.

The output should help readers compare options after they understand the ritual fit:

```text
Item ritual note -> representative product types -> real product examples -> purchase-link checks
```

Do not turn the page into:

```text
추천 TOP 5 / 가성비 최고 / 무조건 사야 함 / 수면에 좋은 제품 추천
```

## When To Use

Use this skill after the item angle or draft is clear, especially when the user asks for:

- 실제 제품 정보
- 구매 링크
- 제품 후보 3~5개
- 대표 제품 유형
- 제품만 따로 리서치
- 하단 제품 섹션
- 가격/재고/후기 기준 확인

## Inputs

Prefer an existing item folder:

- `item_angle_brief.md`
- `item_archive_record.json`
- `item_content_draft.md`
- `seed/item-seed.web-content.md`
- `seed/item-seed.canonical.json`

If no folder exists, accept an item category or article title and create a scoped product research draft only.

## Required Output Files

Write under the existing item archive folder:

```text
outputs/item-archive/{item-slug}/product_research/
```

Create:

- `product-type-map.md`
- `product-candidates.json`
- `product-candidates.md`
- `purchase-link-checklist.md`

If implementation is requested, update:

- `seed/item-seed.web-content.md`
- `seed/item-seed.canonical.json`
- `seed/item-seed.archive-content.ts`

and regenerate DB artifacts through the normal archive upsert command.

## Product Section Shape

Use this reader-facing section title:

```text
실제로 찾아볼 만한 선택지
```

Then describe 2-4 representative product types.

For each type, include:

- what it is
- when it fits
- what is awkward or risky
- checks before buying

Use this product-card section title:

```text
비교해볼 만한 제품 예시
```

Add 3-5 real products only when the source links are available.

## Product Candidate Schema

Each product candidate must include:

```json
{
  "name": "",
  "brand": "",
  "type": "",
  "purchaseUrl": "",
  "sourcePlatform": "",
  "priceLabel": "",
  "priceCheckedAt": "YYYY-MM-DD",
  "infoStatus": "public_info_summary",
  "whyCompare": "",
  "fitsWhen": [],
  "watchOut": [],
  "evidenceBasis": [],
  "affiliateOrSponsorStatus": "none",
  "imageRightsStatus": "do_not_use_marketplace_image"
}
```

Allowed `infoStatus` labels:

- `directly_used`
- `public_info_summary`
- `review_pattern_reference`
- `brand_provided_info`
- `affiliate_or_sponsored`

If the team has not used the product, default to:

```text
공개 정보 정리
```

Do not imply firsthand use.

## Language Rules

Use safe headings and labels:

- `비교해볼 만한 후보`
- `많이 보이는 선택지`
- `대표적인 유형의 제품`
- `구매 전 살펴볼 후보`
- `공개 정보 기준`
- `가격과 재고는 판매처에 따라 달라질 수 있습니다.`

Avoid:

- `추천 TOP`
- `베스트`
- `최고`
- `가성비 최고`
- `무조건`
- `인생템`
- `필수템`
- `구매각`
- `수면에 좋은`
- `효과 좋은`
- `인기 제품` unless the evidence basis is explicit

## Popularity And Evidence Rules

Do not call something popular unless at least one basis is recorded:

- platform sales ranking
- review count
- recent purchase count
- repeated exposure across multiple platforms
- brand recognition
- search result frequency

Prefer softer phrasing:

```text
여러 판매처에서 반복적으로 보이는 선택지
```

Record the basis in `evidenceBasis`.

## Price Rules

Every price must include a date.

Good:

```text
가격대: 2026년 5월 기준 공개 판매가 2만 원대
```

Always include this note in product sections:

```text
가격과 재고는 판매처에 따라 달라질 수 있습니다. 구매 전 판매처의 최신 정보를 확인하세요.
```

If prices conflict or change quickly, use a range:

```text
2026년 5월 기준 1만~3만 원대
```

## Link And Image Rules

- Use official brand pages when possible.
- Use retailer pages only as purchase examples.
- Do not scrape or reuse marketplace images.
- Do not put affiliate links unless explicitly provided and disclosed.
- If affiliate/sponsored status is unknown, set `affiliateOrSponsorStatus: none`.
- Keep product images out of the content unless rights are owned, licensed, or brand permission is clear.

## Research Workflow

1. Read the item angle/draft and identify the core product types.
2. Search official and retailer sources for representative product examples.
3. Choose 3-5 candidates across types, not five near-duplicates.
4. Record price with date and source.
5. Mark info status for every candidate.
6. Write `product-type-map.md`.
7. Write `product-candidates.json`.
8. Write `product-candidates.md` in reader-facing Korean.
9. Write `purchase-link-checklist.md`.
10. If asked to implement, append the section near the bottom of the item note before sources or after `저장해둘 이유`.

## Implementation Guardrails

When updating `ArchiveContent.body`, append product sections after the main Item Note body, not before the ritual judgment.

Suggested body order:

1. standard Item Note sections
2. `실제로 찾아볼 만한 선택지`
3. representative product type sections
4. `비교해볼 만한 제품 예시`
5. product candidate list/cards
6. `구매 후보를 볼 때 체크할 것`
7. source/update note

Keep draft status unless the user explicitly asks to publish and all price, link, disclosure, and image-right checks pass.

## Quality Gate

Before finishing, verify:

- 3-5 real product candidates have source links.
- Every price has a checked date or is marked as unavailable.
- Every candidate has an info status.
- No ranking, ad, or purchase-pressure language appears.
- No product is called popular without an explicit basis.
- Affiliate/sponsored status is clear.
- Marketplace images are not copied into the content.
- Product section supports the article's ritual decision rather than replacing it.
