# Output Contract

## Required Output Files

When asked to create files, produce:

- `item_archive_record.json`
- `item_research_sources.md`
- `item_content_draft.md`
- `item_sns_summary.md`
- `item_verification_checklist.md`
- `item_missing_fields.md`

If not asked to create files, still structure the response using these same sections.

## Public Copy Language

Internal files may use `review_signal` for classification.

User-facing drafts must not use:

- `신호`
- `시그널`
- `signal`
- raw enum labels
- English memo headings
- ad language

Replace with:

- `후기에서 반복적으로 언급됩니다`
- `공식 안내 기준으로는`
- `가격은 검색 시점에 따라 달라질 수 있습니다`
- `제품별 차이가 큽니다`
- `구매 전 확인이 필요합니다`

## Guardrails

- Do not rank products unless the user explicitly asks, and even then keep Bathtime fit criteria first.
- Do not write purchase CTA as the primary conclusion.
- Do not use product images without rights.
- Do not claim medical or therapeutic effects.
- Do not imply that a product is required for rest.
- Do not hide practical burdens.
- Do not remove uncertainty to make the content cleaner.

## Output Quality Gate

Before handing off to seed building, check:

- [ ] The original angle brief is preserved.
- [ ] The reader question is visible.
- [ ] The ritual job is explicit.
- [ ] Official specs and review patterns are separated.
- [ ] Price and availability are dated.
- [ ] Product examples are not ranked as recommendations unless requested.
- [ ] Hidden friction is represented in structured fields.
- [ ] The draft includes fit and not-fit sections.
- [ ] The draft connects to at least one ritual, timer, or related content.
- [ ] Image rights questions are carried into the verification checklist.
