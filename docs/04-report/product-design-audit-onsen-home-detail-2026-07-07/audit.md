# Product Design Audit — Onsen Home & Detail

Date: 2026-07-07
Scope:
- `/onsen`
- `/onsen` search focus state
- `/onsen/hakone-byakudan`
- `/onsen/hakone-byakudan` mobile
- `/onsen/methodology`

Screenshots:
- `screenshots/01-onsen-home-desktop.png`
- `screenshots/02-onsen-home-search-focus.png`
- `screenshots/03-onsen-detail-desktop.png`
- `screenshots/04-onsen-detail-mobile.png`
- `screenshots/05-onsen-methodology-desktop.png`

## Step List

1. User context preflight
   - Health: usable
   - Result: no saved product-design user context exists, so audit used current product direction, local screenshots, and existing Bathtime design language.

2. Local visual capture
   - Health: fixed before audit
   - Result: first capture exposed a real dev-server issue: the page linked to a stale `layout.css` URL returning 404. Restarted the local server and confirmed CSS returns 200 before judging visuals.

3. Home page audit
   - Health: directionally good, visually underpowered
   - Result: the narrative changed from search-only to verdict-first, but the screen still reads more like a calm text index than a strong verdict product.

4. Detail page audit
   - Health: structurally promising, hierarchy still inverted
   - Result: the verdict model is present, but the first viewport gives too much priority to an empty image slot and accommodation identity before the decision object.

5. Mobile audit
   - Health: functional, but first-screen value is delayed
   - Result: the image placeholder consumes too much vertical space; the verdict appears only after the user scrolls.

## Executive Take

The current redesign is no longer broken, but it is still too polite. Bathtime Onsen is supposed to feel like "we read, counted, and judged this for you." The UI currently says that in copy, but the layout does not dramatize it enough.

The product needs a stronger visual object for a verdict: a compact block that combines the decision headline, evidence count, source status, and 2-3 decisive facts. Right now those pieces exist, but they are scattered across text cards.

## Key Findings

### 1. The Home Still Looks Like a Content Index

The hero message is good, and the total stamp is useful. But the featured verdict cards are equal-weight text cards. They do not create the "Rotten Tomatoes for onsen" feeling yet.

Recommended direction:
- Make the first featured verdict a larger lead card.
- Put the count and conclusion into a visible verdict stamp, not only footer metadata.
- Use one decisive label per card, for example `객실 내 완결`, `겨울 수온 확인`, `직수 확인`.
- Let the remaining cards support the lead card, rather than making all cards equal.

### 2. The Detail Page Has the Right Ingredients in the Wrong Order

On desktop and mobile, the first dominant object is the image placeholder. That would be fine for a hotel booking page, but Bathtime is not primarily selling a room photo. It is selling confidence about the onsen structure.

Recommended order:
1. Small image or image strip
2. Accommodation name
3. Large verdict object immediately visible
4. Bath facts and operation status
5. Evidence details
6. Reviews

For mobile, the verdict object should appear in the first viewport without requiring a scroll.

### 3. Empty Image Slots Are Too Expensive

The photo placeholder is visually clean, but it occupies premium space while providing zero information. Until Agoda/affiliate images are available, the placeholder should be smaller or moved below the verdict.

Recommended direction:
- Desktop: reduce image slot height or use a side-by-side header where verdict owns the left column.
- Mobile: show a compact 16:9 strip or defer the image below the verdict.

### 4. Search Focus Is Better, But the Popover Feels Thin

The click/focus behavior is now more sensible. But with only two autocomplete rows, the panel feels sparse. The label "자동완성" also reads like an internal function name.

Recommended direction:
- Rename `자동완성` to `바로 가기` or remove the label.
- Show grouped results: `지역`, `숙소`, `온천 조건`.
- Keep the compact panel when the user types; only show richer suggestions on empty focus if there is enough content.

### 5. Trust Is Present, But Not Yet Designed

The method link and evidence counts exist, which is good. But trust currently lives as small text. The service's core claim needs a repeatable trust pattern.

Recommended direction:
- Standardize a "판정 근거" component:
  - read count
  - onsen-related denominator
  - platform labels
  - last verified date
- Use this same component on home cards, result cards, and detail pages.

## Priority Design Fixes

1. Redesign the detail first viewport around the verdict block.
2. Turn the home featured verdict area into one lead verdict plus secondary cards.
3. Shrink or demote image placeholders until real imagery exists.
4. Replace internal labels like `자동완성`, `Area Inventory`, `Verdict` with Korean service-facing labels.
5. Make evidence counts and method status visually consistent across home, list, and detail.

## Suggested Next Step

Before coding a large redesign, create 2-3 static visual directions for:

1. Verdict-first detail page
2. Verdict-led home page
3. Compact result card system

The strongest direction should then be implemented against the existing components.
