# Source And Review Rules

## Source Baskets

Try to check these baskets depending on whether the item is a category or a specific product.

### 1. Official / Manufacturer

- official product page
- product manual
- safety instructions
- warranty page
- size/spec table
- material information
- brand FAQ
- official social posts only when clearly from the brand

### 2. Retail / Marketplace

- retailer product pages
- price information
- option differences
- delivery/return information
- marketplace product reviews
- Q&A sections when public and relevant

### 3. Independent Review / Usage Notes

- blogs
- YouTube reviews
- public community posts
- long-term use reviews
- comparison posts
- repair/maintenance posts

### 4. Safety / Standards / Public Guidance

Use when relevant:

- electrical safety guidance
- burn or hot-water safety guidance
- fragrance or skin sensitivity guidance from reliable sources
- product recall databases
- consumer protection notices

### 5. Bathtime Internal Context

- related care archive routines
- home ritual content
- timer IDs
- existing item notes
- seed schema
- image resolver and content renderer

## Review Intelligence Layer

After collecting official and retailer information, perform a review intelligence pass.

The goal is not to summarize reviews as popularity. The goal is to identify repeated practical issues.

### Review Depth Levels

Use this scale:

- `deep`: 20+ review signals from 4+ source baskets, including recent and long-term use notes
- `medium`: 8-19 review signals from 3+ source baskets
- `shallow`: fewer than 8 review signals or fewer than 3 source baskets
- `unavailable`: meaningful public review sources could not be found

### What To Extract From Reviews

Extract repeated patterns about:

- actual use frequency
- setup effort
- cleanup effort
- cleaning difficulty
- drying difficulty
- storage burden
- bathroom space fit
- water filling burden
- water draining burden
- weight when filled
- leakage
- noise
- temperature maintenance
- heating strength
- scent strength
- residue
- slipping/floor safety
- skin irritation mentions
- durability
- mold or hygiene concerns
- cord length / outlet constraints
- return or warranty complaints
- value for money
- reasons people stopped using it
- reasons people kept using it

### Review Evidence Rules

Do not treat a single review as fact.

Use this internal language:

- `repeated_review_signal`
- `single_review_signal`
- `conflicting_review_signal`
- `outdated_signal`

In user-facing copy, do not use `신호`, `시그널`, or `signal`. Convert to:

- `후기에서 반복적으로 언급됩니다`
- `일부 후기에서는 ...라고 말합니다`
- `후기만으로 단정하긴 어렵습니다`
- `공식 정보 기준으로는 확인되지 않습니다`

Do not copy review paragraphs. Summarize patterns only.

## Research Principles

### 1. Prefer verifiable sources

Source priority:

1. official product page
2. official manual / safety document
3. official brand FAQ
4. retailer product page
5. current marketplace listing
6. recent public reviews
7. long-form blogs and videos
8. old or unattributed posts

Official specs define hard facts.
Reviews support practical experience patterns.
Prices and availability are time-sensitive and must be dated.

### 2. Mark uncertainty clearly

Never invent:

- dimensions
- material
- price
- safety certifications
- warranty
- current availability
- heating temperature
- waterproof rating
- electrical specs
- product compatibility
- skin suitability
- medical effects
- personal usage experience

Use:

- `확인 필요`
- `공식 출처 확인 안 됨`
- `후기 기반 추정`
- `가격 변동 가능`
- `제품별 차이 큼`
- `사용 환경에 따라 다름`

### 3. Distinguish fact, inference, and editorial judgment

Use these labels internally:

- `verified_fact`: confirmed by official or high-confidence source
- `source_claim`: stated by a source but not independently confirmed
- `retailer_claim`: stated by a retailer listing
- `review_signal`: repeated in reviews but subjective
- `inference`: Bathtime editorial interpretation
- `unknown`: not found

Examples:

- `보관 난이도: 편집 판단`
- `가격대: 2026-05-21 검색 기준`
- `청소 난이도: 후기 기반 추정`
- `전원 필요 여부: 공식 스펙 기준`

### 4. Do not overclaim

Avoid:

- medical claims
- treatment claims
- guaranteed recovery
- guaranteed sleep improvement
- pain relief guarantee
- skin improvement guarantee
- exaggerated luxury wording
- ad-like recommendation
- `최고의`, `완벽한`, `무조건`, `필수템`, `인생템`

Use calm, practical wording.

### 5. Do not pretend firsthand experience

If the input does not include direct usage notes, do not write:

- `써보니`
- `직접 써봤다`
- `사용해보니`
- `경험해보니`

Use instead:

- `찾아봤다`
- `정리했다`
- `공개 정보 기준으로 보면`
- `후기에서는 이런 이야기가 반복된다`
- `구매 전 확인이 필요하다`
