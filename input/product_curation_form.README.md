# Product Curation Form

Use `product_curation_form.template.json` when collecting product candidates for Bath Sommelier.

## How to Fill

1. Copy the example object inside `products`.
2. Replace the example values with one real product.
3. Keep only `bath_salt`, `bath_item`, and `body_wash` for now.
4. Use direct purchase, affiliate-ready, or official product URLs in `listing.sourceUrl`.
5. If a value is unknown, use `null`. If stock is unclear but the page exists, use `availability: "unknown"`.
6. Keep reviews, article links, price-comparison pages, and source documents in `sourceNotes.sourceRefs`.
7. Keep medical/therapeutic claims in `sourceNotes.rawClaimSnapshot`; rewrite user-facing text in `curation.appCopy`.

## Required For App Catalog

- `canonical.proposedId`
- `canonical.nameKo`
- `canonical.brand`
- `canonical.category`
- `canonical.ingredientKey`
- `canonical.mechanism`
- `canonical.priceTier`
- `canonical.environments`
- `listing.sourceUrl`
- `listing.titleSnapshot`
- `listing.availability`
- `listing.verifiedAt`
- `curation.routineFit.modeBias`
- `curation.routineFit.allowedEnvironments`
- `curation.routineFit.priorityWeight`
- `curation.appCopy.summary`
- `curation.appCopy.editorialEyebrow`
- `curation.appCopy.editorialFooterHint`
- `curation.appCopy.tags`
- `curation.safetyReview.safetyFlags`

## Status Meaning

- `candidate`: collected, not reviewed yet
- `ready`: ready to convert into catalog seed after final review
- `hold`: useful but missing data or too early for current scope
- `reject`: not suitable for current catalog

## Market Policy

Do not limit product research to Coupang or Naver. Kurly, Olive Young, and official stores can be useful commerce channels, especially when they support curator, affiliate, or creator monetization.

Allowed `listing.market` values:

- `coupang`
- `naver_smartstore`
- `kurly`
- `oliveyoung`
- `official_store`
- `danawa`
- `other`

Use `listing.sourceUrl` for:

- direct product pages
- affiliate-ready product pages
- official brand product pages
- marketplace product pages where purchase is possible

Use `sourceNotes.sourceRefs` for:

- Glowpick or review pages
- Danawa or search/comparison pages when they are not the final purchase destination
- blog/article references
- research documents
- copied source index references

Link priority for monetization:

1. Curator/affiliate-enabled product link
2. Direct marketplace product link
3. Official brand store product link
4. Price-comparison or search page
5. Review/article/source document

If the only available URL is a review, comparison, search, or placeholder URL, set `status` to `hold` unless the product is strategically important for theme coverage.

## Current Scope

Include:

- bath salts and bath tablets
- shower steamers
- relaxing body wash
- foot soak products only when they can be mapped to `bath_salt` and `bathtub`/partial-bath routines

Hold for later:

- massage bars
- body oils
- sauna oils
- standalone essential oils
- products that require detailed dilution or professional-use guidance

## Care Routine Product Map

Use this table to check whether the research set covers each care routine. The "Priority product groups" column should be filled first.

| Care routine | Priority product groups | Secondary product groups | Avoid or hold |
|---|---|---|---|
| `muscle_relief` | Epsom salt, magnesium bath flakes, muscle recovery bath soak | Carbonated bath tablets, shower steamer for shower users | Strong cooling oil blends, professional sports oils |
| `sleep_ready` | Lavender/chamomile bath salt, gentle carbonated bath tablets, relaxing body wash | Low-scent mineral bath, hinoki bath powder | Strong citrus, rosemary, peppermint, menthol-heavy products |
| `hangover_relief` | Gentle foot soak, low-scent mineral foot bath | Relaxing body wash for shower fallback | Full-body hot bath products, strong fragrance, detox/medical claim products |
| `edema_relief` | Carbonated bath tablets, gentle foot soak, low-scent bath salt | Light citrus bath product if sensitive-skin safe | Aggressive detox claims, high-fragrance citrus oils |
| `cold_relief` | Eucalyptus shower steamer, gentle warming bath tablet | Low-scent carbonated bath, relaxing body wash | Cooling-only products, menthol-heavy products for sensitive users |
| `menstrual_relief` | Gentle warming bath salt, chamomile bath product, relaxing body wash | Unscented mineral bath | Clary sage/rosemary/peppermint products, strong circulation claims |
| `stress_relief` | Shower steamer, relaxing body wash, lavender/chamomile bath salt | Carbonated bath tablet | Products that rely on treatment/anti-anxiety claims |
| `mood_lift` | Citrus or fresh-scent shower steamer, carbonated bath tablet, light body wash | Grapefruit bath product if sensitive-skin safe | Heavy sleep-only scents, strong stimulant/energy claims |

## Trip Theme Product Map

Trip products should create the theme atmosphere after safety and environment fit are confirmed.

| Trip theme group | Current themes | Priority product groups | Coverage risk |
|---|---|---|---|
| Forest / Garden | Kyoto Forest, Moss Temple Kyoto | Hinoki/cypress bath powder or bath tablet, forest-scent shower steamer | Standalone hinoki oil is out of current scope, so finished bath products are needed |
| Rain / Camping | Rainy Camping, Lantern Rain Karuizawa | Rain/forest/herbal shower steamer, gentle body wash, low-scent bath salt | Many products are pure aroma oils; prefer finished shower/bath products |
| Snow / Cabin | Snow Cabin, White Silence Sapporo | Chamomile bath salt, cedarwood-style bath product, warm unscented mineral bath | Cedarwood products may be oils or candles, not bath-safe products |
| Sauna / Reset | Nordic Sauna | Eucalyptus shower steamer, eucalyptus bath salt, carbonated bath tablet | Menthol-heavy sauna oils should be held |
| Ocean / Harbor | Ocean Dawn, Harbor Blue Busan | Mineral bath salt, light citrus bath tablet, fresh shower steamer | "Marine" scents can be perfume-like and may not map to ingredients |
| Tea / Library / Warm Interior | Tea House, Fireside Library | Chamomile bath product, amber/warm body wash, gentle mineral bath | Amber products are often body wash/perfume rather than bath products |
| City Night | Midnight Paris, Afterglow Seoul | Low-fragrance body wash, short-reset shower steamer, carbonated bath tablet | Premium fragrance body wash may be expensive and weakly tied to routine function |

## Product Gaps To Watch

If research feels repetitive, prioritize these missing or thin areas:

- Finished hinoki/cypress bath products, not standalone oils
- Chamomile bath salts or bath tablets
- Eucalyptus shower steamers that do not rely on menthol-heavy formulas
- Unscented or low-scent mineral bath products for sensitive users
- Carbonated bath tablets with direct Korean purchase links
- Gentle foot soak products for hangover, edema, and partial-bath routines
- Warm, woody body wash for Fireside Library / Snow Cabin themes
- Fresh but mild shower products for Ocean / Harbor / City Night themes
