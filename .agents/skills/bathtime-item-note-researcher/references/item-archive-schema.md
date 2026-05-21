# Item Archive Schema

## Required Item Fields

Every output must try to fill these fields.

### Basic Identity

- item_id
- working_title
- item_name_ko
- item_name_en
- item_category
- item_subcategory
- item_scope
- content_angle_type
- status
- short_summary
- one_line_editorial_note

### Angle Context

- reader_question
- bathtime_thesis
- ritual_job
- related_rituals
- related_care_archives
- related_timer_ids
- non_goals

### Use Conditions

- primary_use_situations
- not_use_situations
- bathtub_required
- shower_required
- water_required
- outlet_required
- bathroom_space_required
- storage_space_required
- setup_time_estimate
- cleanup_time_estimate
- daily_use_likelihood

### Practical Burden

- storage_difficulty
- cleaning_difficulty
- drying_difficulty
- prep_hassle
- aftercare_hassle
- noise_level
- scent_intensity
- residue_risk
- leakage_risk
- floor_safety_risk
- heat_safety_risk
- skin_sensitivity_risk

### Product / Category Facts

- representative_price_summary
- price_min
- price_max
- currency
- price_basis
- spec_summary
- dimensions
- weight
- material
- power_or_battery
- temperature_features
- safety_certifications
- warranty_or_return_note
- availability_note
- product_examples

### Experience Fit

- beginner_friendliness
- small_bathroom_fit
- rental_home_fit
- solo_ritual_fit
- couple_or_family_fit
- low_effort_fit
- premium_fit
- maintenance_fit

### Bathtime Context

- good_for
- not_good_for
- good_points
- weak_points
- things_to_check_before_buying
- alternative_options
- together_with
- related_tags

### Source Tracking

- sources
- source_conflicts
- last_researched_at
- last_updated_at
- researcher_note
- confidence_overall

## Allowed Values

### item_scope

Use one of:

- `category`
- `specific_product`
- `comparison`
- `setup`
- `checklist`

### content_angle_type

Use one of:

- `ritual_enabler`
- `reality_check`
- `comparison_note`
- `first_buy_checklist`
- `use_case_explainer`
- `caution_note`

### difficulty values

Use one of:

- `low`
- `medium`
- `high`
- `varies`
- `unknown`

Apply to:

- storage_difficulty
- cleaning_difficulty
- drying_difficulty
- prep_hassle
- aftercare_hassle

### fit values

Use one of:

- `high`
- `medium`
- `low`
- `varies`
- `unknown`

### confidence

Use one of:

- `high`
- `medium`
- `low`
- `unknown`

## JSON Schema

Use this structure for `item_archive_record.json`.

```json
{
  "item_id": "",
  "working_title": "",
  "item_name_ko": "",
  "item_name_en": "",
  "item_category": "",
  "item_subcategory": "",
  "item_scope": "category",
  "content_angle_type": "reality_check",
  "status": "draft",
  "short_summary": "",
  "one_line_editorial_note": "",
  "angle_context": {
    "reader_question": "",
    "bathtime_thesis": "",
    "ritual_job": "",
    "related_rituals": [],
    "related_care_archives": [],
    "related_timer_ids": [],
    "non_goals": []
  },
  "use_conditions": {
    "primary_use_situations": [],
    "not_use_situations": [],
    "bathtub_required": "unknown",
    "shower_required": "unknown",
    "water_required": "unknown",
    "outlet_required": "unknown",
    "bathroom_space_required": "",
    "storage_space_required": "",
    "setup_time_estimate": "",
    "cleanup_time_estimate": "",
    "daily_use_likelihood": "unknown"
  },
  "practical_burden": {
    "storage_difficulty": "unknown",
    "cleaning_difficulty": "unknown",
    "drying_difficulty": "unknown",
    "prep_hassle": "unknown",
    "aftercare_hassle": "unknown",
    "noise_level": "unknown",
    "scent_intensity": "unknown",
    "residue_risk": "unknown",
    "leakage_risk": "unknown",
    "floor_safety_risk": "unknown",
    "heat_safety_risk": "unknown",
    "skin_sensitivity_risk": "unknown"
  },
  "product_facts": {
    "representative_price_summary": "",
    "price_min": null,
    "price_max": null,
    "currency": "KRW",
    "price_basis": "",
    "spec_summary": "",
    "dimensions": "",
    "weight": "",
    "material": "",
    "power_or_battery": "",
    "temperature_features": "",
    "safety_certifications": [],
    "warranty_or_return_note": "",
    "availability_note": "",
    "product_examples": []
  },
  "experience_fit": {
    "beginner_friendliness": "unknown",
    "small_bathroom_fit": "unknown",
    "rental_home_fit": "unknown",
    "solo_ritual_fit": "unknown",
    "couple_or_family_fit": "unknown",
    "low_effort_fit": "unknown",
    "premium_fit": "unknown",
    "maintenance_fit": "unknown"
  },
  "bathtime_context": {
    "good_for": [],
    "not_good_for": [],
    "good_points": [],
    "weak_points": [],
    "things_to_check_before_buying": [],
    "alternative_options": [],
    "together_with": [],
    "related_tags": []
  },
  "sources": [],
  "source_conflicts": [],
  "last_researched_at": "",
  "last_updated_at": "",
  "researcher_note": "",
  "confidence_overall": "unknown"
}
```
