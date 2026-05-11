# Canonical Spot Seed Schema

Use this schema as the intermediate representation before generating DB- or CMS-specific output.

## Top-Level Shape

```json
{
  "schema_version": "bathtime.spot_seed.v1",
  "seed_kind": "spot",
  "id": "place-example-slug",
  "status": "draft",
  "source_research": {
    "archive_record_path": "archive_record.json",
    "content_draft_path": "content_draft.md",
    "sns_summary_path": "sns_summary.md",
    "research_sources_path": "research_sources.md",
    "missing_fields_path": "missing_fields.md",
    "verification_checklist_path": "verification_checklist.md"
  },
  "content": {},
  "spot": {},
  "editorial": {},
  "distribution": {},
  "quality": {},
  "audit": {}
}
```

## Required Fields

- `schema_version`: Always `bathtime.spot_seed.v1`.
- `seed_kind`: Always `spot`.
- `id`: Stable slug. Prefer `archive_record.spot_id`; otherwise derive from region + name.
- `status`: Default `draft`.
- `content`: App or CMS-facing content.
- `spot`: Structured place facts.
- `quality`: Missing fields, verification requirements, confidence, and publish blockers.
- `audit`: Source and timestamp metadata.

## content

Map to Bathtime archive content when no more specific DB table exists.

```json
{
  "title": "",
  "subtitle": "",
  "category": "BATH_PLACES",
  "content_type": "RESEARCHED",
  "tags": [],
  "hero_image": {
    "uri": "category-place",
    "alt": "",
    "source_type": "generated"
  },
  "body_blocks": [
    { "type": "paragraph", "text": "" },
    { "type": "heading", "text": "" },
    { "type": "list", "items": [] }
  ],
  "seo": {
    "seo_title": "",
    "seo_description": "",
    "canonical_url": null,
    "og_image": null
  },
  "is_published": false
}
```

Defaults:

- `category`: `BATH_PLACES`
- `content_type`: `RESEARCHED`
- `hero_image.uri`: `category-place`
- `hero_image.source_type`: `generated`
- `is_published`: `false`

## spot

```json
{
  "name_ko": "",
  "name_en": "",
  "aliases": [],
  "spot_type": "",
  "location": {
    "country": "KR",
    "city": "",
    "district": "",
    "neighborhood": "",
    "address": "",
    "region_label": "",
    "nearest_station": "",
    "access_note": "",
    "map_urls": []
  },
  "access": {
    "public_access": "unknown",
    "external_user_access_condition": "",
    "guest_only_status": "unknown",
    "member_only_status": "unknown",
    "reservation_required": "unknown",
    "reservation_method": "",
    "walk_in_available": "unknown",
    "gender_rules": "",
    "age_rules": "",
    "contact": "",
    "official_booking_url": ""
  },
  "price": {
    "summary": "",
    "min": null,
    "max": null,
    "currency": "KRW",
    "basis": "",
    "included_items": [],
    "extra_fees": [],
    "updated_at": "",
    "confidence": "unknown"
  },
  "operating_info": {
    "opening_hours": "",
    "closed_days": "",
    "last_entry_time": "",
    "limitations": "",
    "confidence": "unknown"
  },
  "facilities": {
    "facility_types": [],
    "bath_facilities": [],
    "sauna_facilities": [],
    "rest_facilities": [],
    "private_facilities": [],
    "amenities": [],
    "towel_or_gown_included": "unknown",
    "shower_facility": "unknown",
    "locker_facility": "unknown",
    "phone_policy": "",
    "food_or_drink_available": "unknown"
  },
  "experience_fit": {
    "solo_fit": "unknown",
    "couple_fit": "unknown",
    "friend_group_fit": "unknown",
    "quietness_level": "unknown",
    "privacy_level": "unknown",
    "luxury_level": "unknown",
    "cleanliness_signal": "unknown",
    "crowding_signal": "unknown",
    "old_facility_signal": "unknown",
    "beginner_friendliness": "unknown"
  }
}
```

## editorial

```json
{
  "short_summary": "",
  "one_line_editorial_note": "",
  "recommended_contexts": [],
  "not_recommended_contexts": [],
  "good_for": [],
  "not_good_for": [],
  "ritual_angle": "",
  "visit_tips": [],
  "things_to_check_before_visit": [],
  "good_points": [],
  "weak_points": [],
  "fit_for": [],
  "not_fit_for": []
}
```

## distribution

Use `sns_summary.md` when available.

```json
{
  "app_card_summary": "",
  "instagram_carousel_outline": [],
  "threads_or_x_post": "",
  "newsletter_snippet": "",
  "cta_suggestions": []
}
```

## quality

```json
{
  "confidence_overall": "unknown",
  "missing_fields": [],
  "source_conflicts": [],
  "verification_checklist": [],
  "publish_blockers": [],
  "operator_notes": []
}
```

Mark a publish blocker when any hard access, price, reservation, opening-hours, location, or safety/restriction field is unknown and the target is meant to be public.

## audit

```json
{
  "sources": [],
  "last_researched_at": "",
  "last_updated_at": "",
  "generated_at": "",
  "researcher_note": ""
}
```

Sources should preserve title, URL, source type, reliability, date found, and supported fields when present.

## Enum Normalization

For `public_access`, map researcher values:

- `available` -> `available`
- `limited` -> `restricted`
- `guest_only` -> `restricted`
- `member_only` -> `members_only`
- `unavailable` -> `restricted`
- `unknown` -> `unknown`

For boolean target fields:

- `high` or clear positive support -> `true`
- `low` or clear negative support -> `false`
- `medium`, conflicting, or unknown -> `"unknown"` unless the target field cannot store unknown

If a target cannot store `"unknown"`, keep the database value nullable and place the uncertainty in `quality.operator_notes`.
