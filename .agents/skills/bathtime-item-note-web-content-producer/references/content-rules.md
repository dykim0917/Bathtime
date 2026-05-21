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
