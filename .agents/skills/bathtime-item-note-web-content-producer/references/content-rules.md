# Content Rules

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

Only show rows that help the reader decide. Do not keep default rows just because they are technically true. For example, remove or replace `전원 필요 없음` for non-electric items and `욕조 필요 없음` for bathroom accessories where that fact does not help selection.

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

For ordinary hero/inline images, if no verified product image is available, use a category fallback and explain what owned/official image should replace it later.

For real product candidate cards, official/public product image URLs may be used in private drafts when the image is clearly tied to that product and the rights status is explicit.

Allowed private-draft labels include:

- `external_official_product_image_url_not_owned`
- `external_product_page_image_url_not_owned`
- `external_marketplace_product_image_url_not_owned`

These labels mean the image can help the draft/card feel concrete, but Bathtime does not own the asset and public publishing still needs an operating-policy check.

Do not download, rehost, crop, edit, or use marketplace review photos. Avoid event banners and decorative detail-page graphics when the actual product is not the primary subject.

Generated hero images are allowed when they are conceptual, rights-safe, and not brand-specific.

Use `photorealistic-natural` for quiet editorial lifestyle hero images and `infographic-diagram` for comparison or setup cards.

Do not make generated images look like a specific brand, product listing, marketplace image, review photo, package, logo, label, or ad creative.

If imagegen creates a local file but it is not uploaded or addressable by the app, keep the fallback `heroImage.uri` and record the local file path as an implementation note or publish blocker.

### Reader-facing caption rules

Captions are not production notes. They should explain what the image helps the reader understand.

Avoid reader-facing wording such as:

- `비브랜드 생성 이미지입니다`
- `생성형 AI로 만든 이미지입니다`
- `제작된 이미지입니다`
- `실제 제품 사진이 아닙니다`

Use message-focused captions instead:

- `제품을 고를 때 놓치기 쉬운 기준을 시각적으로 정리한 이미지입니다.`
- `샤워 후 정리 동선을 한눈에 떠올리게 하는 이미지입니다.`
- `보관과 말릴 자리를 함께 확인해야 한다는 점을 보여주는 장면입니다.`
- `욕실 크기와 사용 동선이 선택 기준이 되는 상황을 보여주는 이미지입니다.`

Do not imply a generated or placeholder image is a real product photo, direct-use photo, or firsthand usage scene. If transparency is necessary, use a natural note such as:

```text
특정 제품을 가리키는 이미지는 아닙니다.
```

### Inline image slots are required

Every Item Note package must include at least two planned inline image slots.

- Inline Image 1: appears after `한 줄 판단` or `어떤 의식을 돕는가`. It should clarify ritual context or the item’s role.
- Inline Image 2: appears after `사기 전에 먼저 볼 것` or before `이런 사람에게 맞는다`. It should clarify practical friction, comparison, storage, or setup/cleanup.

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
  caption: '족욕기와 족욕볼을 고를 때 준비, 정리, 보관 부담을 함께 비교하게 돕는 이미지입니다.'
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
- `어떤 의식을 돕는가`
- `사기 전에 먼저 볼 것`
- `좋게 볼 수 있는 점`
- `아쉬운 점`
- `이런 사람에게 맞는다`
- `이런 사람에게는 애매하다`
- `같이 쓰면 좋은 의식` (only when a concrete follow-up ritual exists)

Do not add `저장해둘 이유` as a fixed section. The article should make its own usefulness clear through the body. If a save action is genuinely useful, express it as a natural CTA only when the route/action exists.

`한 줄 판단` must be exactly one short sentence in one paragraph, ideally 35-55 Korean characters. Move any explanation into the next section.

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

### Korean register must be consistent

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

### Keep paragraphs short

Most paragraphs should be 1-2 sentences. Use lists for checks, fit/not-fit, alternatives, and connected rituals.

### Make lists scannable

Avoid long bare lists for criteria, specs, product types, source types, or comparison points.

Bad:

```text
- 소재
- 세탁
- 건조
- 보관
```

Good:

```text
- 소재: 물에 자주 닿는 물건이라 건조와 관리 난이도를 함께 봅니다.
- 세탁: 세탁기 사용 가능 여부와 건조 방식을 먼저 확인합니다.
- 보관: 매일 쓰려면 말릴 자리와 문 간섭을 같이 봅니다.
```

If a mini-card, icon chip, comparison table, or richer checklist UI would improve the page but is not supported by the renderer, record it as `UX follow-up` or `Publish Blockers`. Do not fake unsupported UI with awkward text.

### Product examples keep source/date/status

When real products appear in `비교해볼 만한 제품 예시`, keep them as sourced comparison examples, not recommendations.

Each product example must preserve:

- source or purchase URL
- price checked date or explicit unavailable note
- information-status wording such as `공개 정보 기준` or `브랜드 제공 정보 기준`
- official/public product-page image URL may be referenced in private drafts when the image is clearly tied to the candidate product and rights status says Bathtime does not own it
- no ranking, popularity, or purchase-pressure wording

If the renderer supports `productCandidates`, use card-style product candidates for real product examples. If it only supports a plain list, use labeled list sentences. Do not remove source/date/status simply to make the line shorter.

Keep public-publish image rights as a blocker unless ownership, license, or permission is clear.

## CTA and Action Rules

Each Item Note page should connect to at least one action.

Allowed CTA types:

- `관련 의식 보기`
- `10분 족욕 타이머 시작하기`
- `7분 샤워 타이머 시작하기`
- `비슷한 아이템 노트 보기`
- `내 욕실 세팅 제보하기`
- `써본 아이템 제보하기`
- `제품 예시 보기` only when examples and disclosure are handled

Do not output generic CTA suggestions as a brainstorming list. Convert them into actual CTA/link notes or implementation fields.

Do not make a purchase link the only or primary CTA unless the user explicitly requested commerce and disclosure is ready.

Do not render a button-like CTA unless the route or action actually exists. If a useful next action is not yet available, keep it as plain text or record it in `Publish Blockers`.

## Structured Overview UX

For concrete product/category item notes, the default item structured info is usually useful.

For criteria, comparison, terminology, or insight-style item notes, review whether the `한눈에 보기` box helps the reader. If default fields feel like empty metadata, record:

```text
UX follow-up:
이 글은 특정 제품 소개가 아닌 기준 콘텐츠이므로 기본 한눈에 보기 박스가 적합하지 않을 수 있음.
권장 요약:
- 카테고리: 아이템 선택 기준
- 대상: 구매 전 확인 기준을 찾는 사람
- 핵심 키워드: 관리 난이도, 보관, 소모품, 안전
- 읽고 나면: 제품명보다 먼저 볼 조건을 알 수 있음
```

Use existing `overviewRows` only when the app/schema already supports it. Do not invent unsupported public fields.

Remove or replace rows that are technically true but not useful for the item, such as `전원 필요 없음` for a non-electric item or `욕조 필요 없음` for a bathroom accessory where that fact does not affect selection.

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
샤워필터는 제품별 필터 구조와 교체 주기가 다릅니다. 피부 변화는 개인차가 커서 바스타임에서는 구매 전 확인할 조건 중심으로만 정리합니다.
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
- affiliate or sponsorship disclosure is needed but absent
- the draft sounds like an ad

Do not stop draft creation merely because image rights or exact prices are unresolved. Use fallback images and explicit publish blockers.
