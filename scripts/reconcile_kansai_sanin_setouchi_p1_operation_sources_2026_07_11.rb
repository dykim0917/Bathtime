#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "fileutils"
require "time"

ROOT = File.expand_path("..", __dir__)
DATE = "2026-07-11"
OUTPUT = File.join(ROOT, "research", "onsen-db-seed", "kansai-sanin-setouchi-facility-p1-operation-reconciliation-#{DATE}")
INPUT = File.join(ROOT, "research", "onsen-db-seed", "kansai_sanin_setouchi_facility_candidate_queue_2026-07-10.csv")

# These candidates combine day-use bathing with lodging, an overnight stay product,
# or a shared review surface. They require a scope contract before P0 research.
MIXED_SCOPE = {
  "mie-aquaignis-kataoka-onsen" => "Aqua Ignis resort lodging and the day-use Kataoka Onsen product must be separated in official facts and review denominators.",
  "kyoto-rurikei-onsen" => "Rurikei's day-use bath, resort lodging, and stay-package surfaces need separate review denominators.",
  "kobe-harborland-manyo-club" => "Day-use spa, overnight/capsule stay, and any accommodation review surface must be split before sampling.",
  "kobe-minato-onsen-ren" => "Hotel guest bathing and day-use bathing must be tagged as separate product scopes.",
  "kobe-sauna-and-spa" => "Sauna/spa use and capsule-stay reviews must not share a direct-review denominator.",
  "nara-kenko-land" => "Day-use bath, hotel, and family-oriented stay products need a scope contract before review collection.",
  "shiga-agaryanse" => "Day-use spa, overnight stay, and late-night stay surfaces require separate eligibility rules.",
  "kagawa-kirara-onsen" => "The lodging-linked product surface must be checked against the public day-use bath before sampling.",
  "hiroshima-yunoyama-onsenkan" => "The official site exposes both day-use bathing and rooms; day-use bath areas and lodging reviews must be separated."
}.freeze

CLOSURE = {
  "kinosaki-kouno-yu" => {
    url: "https://kinosaki-spa.gr.jp/news/28289/",
    source_type: "tourism_association_current_notice",
    note: "2026-05-11 notice: long closure for renovation is scheduled through 2026-10-30. The generic external-bath page is not treated as proof of current operation.",
    status: "hold_current_long_closure",
    action: "After 2026-10-30, reopen the official current-status page and a same-name map/review surface before restoring P1. Do not collect deep-review samples while closed."
  },
  "kinosaki-satono-yu" => {
    url: "https://kinosaki-spa.gr.jp/news/27947/",
    source_type: "tourism_association_current_notice",
    note: "2025-09-26 notice says Satono-yu is closed for rebuilding and its footbath ended on 2025-10-16. It is not a current day-use bath candidate.",
    status: "hold_rebuild_closure",
    action: "Keep out of P0/P1 research until the official reopening notice is published, then re-identify the rebuilt facility and lock a current review surface."
  }
}.freeze

YUNOYAMA_WATER = {
  "official_water_profile_status" => "official_water_profile_partial_locked",
  "spring_quality_original" => "単純弱放射能温泉",
  "official_water_text_original" => "打たせ湯は源泉が23.5度; 内湯は41℃に加温",
  "official_source_url" => "https://www.yuki-lodge.jp/yunoyamaonsenkan.html",
  "water_scope" => "dayuse_waterfall_bath_source_23_5c; dayuse_indoor_bath_heated_to_41c; lodging_guest_bath_scope_unresolved",
  "water_method_badge_policy" => "No direct-flow, circulation, or kakenagashi badge: the checked official wording states source temperature and indoor-bath heating only."
}.freeze

def read_csv(path)
  CSV.read(path, headers: true, encoding: "bom|utf-8").map(&:to_h)
end

def write_csv(path, headers, rows)
  CSV.open(path, "w", write_headers: true, headers: headers, encoding: "utf-8") do |csv|
    rows.each { |row| csv << headers.map { |header| row[header] } }
  end
end

FileUtils.mkdir_p(OUTPUT)
checked_at = Time.now.getlocal("+09:00").iso8601
base = read_csv(INPUT).select { |row| row.fetch("promotion_disposition") == "P1_candidate" }
raise "expected 34 P1 candidates, got #{base.length}" unless base.length == 34

assessment_headers = %w[
  promotion_order candidate_slug japanese_name korean_name candidate_track prefecture facility_model lodging_available
  prior_promotion_disposition official_url official_url_access_status official_identity_status operation_status
  official_water_profile_status water_scope review_pool_lock_status direct_reviews_read
  revised_promotion_decision revised_status decision_reason next_action verification_route
  operation_evidence_url independent_operation_surface_url checked_at_kst
]

assessment = base.map.with_index do |row, index|
  result = {
    "promotion_order" => index + 1,
    "candidate_slug" => row.fetch("candidate_slug"),
    "japanese_name" => row.fetch("japanese_name"),
    "korean_name" => row.fetch("korean_name"),
    "candidate_track" => row.fetch("candidate_track"),
    "prefecture" => row.fetch("prefecture"),
    "facility_model" => row.fetch("facility_model"),
    "lodging_available" => row.fetch("lodging_available"),
    "prior_promotion_disposition" => row.fetch("promotion_disposition"),
    "official_url" => row.fetch("official_url"),
    "official_url_access_status" => "http_200_transport_rechecked",
    "official_identity_status" => "candidate_ledger_identity_retained_not_reparsed",
    "operation_status" => "operating_detail_not_rechecked_in_this_pass",
    "official_water_profile_status" => row.fetch("official_water_profile_status"),
    "water_scope" => row.fetch("scope_status"),
    "review_pool_lock_status" => "not_reproducible_in_2026_07_10_p1_lock_ledger",
    "direct_reviews_read" => 0,
    "revised_promotion_decision" => "P1_candidate",
    "revised_status" => "retain_p1_pending_review_pool_lock",
    "decision_reason" => "Official URL transport returned HTTP 200, but numeric Google/Nifty/Yahoo visible-review locks are not reproducible for this P1 row. No direct reviews are claimed.",
    "next_action" => "Lock title, address, visible review count, URL, and observed time for Google plus Nifty/Yahoo where present; then decide whether P0 criteria are met.",
    "verification_route" => "official_transport_audit_only",
    "operation_evidence_url" => "",
    "independent_operation_surface_url" => row.fetch("map_or_review_url"),
    "checked_at_kst" => checked_at
  }

  slug = result.fetch("candidate_slug")
  if CLOSURE.key?(slug)
    closure = CLOSURE.fetch(slug)
    result.merge!(
      "official_url_access_status" => "authority_current_closure_notice_confirmed",
      "official_identity_status" => "tourism_association_facility_identity_confirmed",
      "operation_status" => closure.fetch(:status),
      "water_scope" => "public_bath_closed_no_sampling_scope",
      "revised_promotion_decision" => "hold",
      "revised_status" => closure.fetch(:status),
      "decision_reason" => closure.fetch(:note),
      "next_action" => closure.fetch(:action),
      "verification_route" => "current_authority_closure_evidence",
      "operation_evidence_url" => closure.fetch(:url),
      "independent_operation_surface_url" => ""
    )
  elsif MIXED_SCOPE.key?(slug)
    result.merge!(
      "revised_promotion_decision" => "P0_boundary_first",
      "revised_status" => "scope_contract_before_p0",
      "decision_reason" => MIXED_SCOPE.fetch(slug),
      "next_action" => "Write a day-use scope contract, separate lodging/overnight/family-bath review denominators, then lock numeric review pools before deep research.",
      "verification_route" => "lodging_or_overnight_scope_reclassification"
    )
  end

  if slug == "hiroshima-yunoyama-onsenkan"
    result.merge!(
      "official_url_access_status" => "operator_dayuse_page_current_rechecked",
      "official_identity_status" => "operator_page_dayuse_identity_confirmed",
      "operation_status" => "dayuse_hours_and_fee_currently_listed",
      "official_water_profile_status" => YUNOYAMA_WATER.fetch("official_water_profile_status"),
      "water_scope" => YUNOYAMA_WATER.fetch("water_scope"),
      "operation_evidence_url" => YUNOYAMA_WATER.fetch("official_source_url")
    )
  end

  result
end

write_csv(
  File.join(OUTPUT, "kansai_sanin_setouchi_facility_p1_promotion_assessment_#{DATE}_integrated.csv"),
  assessment_headers,
  assessment
)

evidence_headers = %w[
  candidate_slug japanese_name prior_official_url prior_transport_status current_operation_source_type
  current_operation_url current_operation_evidence independent_operation_surface_url independent_surface_evidence
  revised_promotion_decision revised_status scope_boundary source_checked_at direct_reviews_read
]
evidence_rows = %w[kinosaki-kouno-yu kinosaki-satono-yu hiroshima-yunoyama-onsenkan].map do |slug|
  current = assessment.find { |row| row.fetch("candidate_slug") == slug }
  closure = CLOSURE[slug]
  note = if closure
           closure.fetch(:note)
         else
           "Current operator page lists day-use hours/fees, indoor and waterfall bath areas, and a partial water profile. This verifies day-use operation only; lodging review scope remains unresolved."
         end
  {
    "candidate_slug" => slug,
    "japanese_name" => current.fetch("japanese_name"),
    "prior_official_url" => current.fetch("official_url"),
    "prior_transport_status" => "http_200_transport_rechecked",
    "current_operation_source_type" => closure ? closure.fetch(:source_type) : "operator_current_dayuse_page",
    "current_operation_url" => current.fetch("operation_evidence_url"),
    "current_operation_evidence" => note,
    "independent_operation_surface_url" => current.fetch("independent_operation_surface_url"),
    "independent_surface_evidence" => current.fetch("independent_operation_surface_url").empty? ? "not_required_for_hold; no promotion based on a review surface" : "Google search surface retained from candidate ledger; exact visible-review count is not locked in this pass.",
    "revised_promotion_decision" => current.fetch("revised_promotion_decision"),
    "revised_status" => current.fetch("revised_status"),
    "scope_boundary" => current.fetch("water_scope"),
    "source_checked_at" => checked_at,
    "direct_reviews_read" => 0
  }
end
write_csv(
  File.join(OUTPUT, "kansai_sanin_setouchi_facility_current_operation_evidence_#{DATE}.csv"),
  evidence_headers,
  evidence_rows
)

boundary_headers = %w[
  boundary_order candidate_slug japanese_name korean_name prefecture facility_model lodging_available
  prior_scope_status revised_promotion_decision boundary_reason review_pool_lock_status direct_reviews_read
  next_action status
]
boundary_rows = assessment.select { |row| row.fetch("revised_promotion_decision") == "P0_boundary_first" }.map.with_index do |row, index|
  {
    "boundary_order" => index + 1,
    "candidate_slug" => row.fetch("candidate_slug"),
    "japanese_name" => row.fetch("japanese_name"),
    "korean_name" => row.fetch("korean_name"),
    "prefecture" => row.fetch("prefecture"),
    "facility_model" => row.fetch("facility_model"),
    "lodging_available" => row.fetch("lodging_available"),
    "prior_scope_status" => "stable_facility_scope",
    "revised_promotion_decision" => "P0_boundary_first",
    "boundary_reason" => row.fetch("decision_reason"),
    "review_pool_lock_status" => row.fetch("review_pool_lock_status"),
    "direct_reviews_read" => 0,
    "next_action" => row.fetch("next_action"),
    "status" => "dayuse_scope_reinforcement"
  }
end
write_csv(
  File.join(OUTPUT, "kansai_sanin_setouchi_facility_mixed_scope_boundary_queue_#{DATE}.csv"),
  boundary_headers,
  boundary_rows
)

pool_headers = %w[
  candidate_slug japanese_name candidate_ledger_review_surface_state map_or_review_url google_visible_review_count
  nifty_visible_review_count yahoo_visible_review_count numeric_platforms_locked tri_locked_verified
  direct_reviews_read audit_decision audit_reason checked_at_kst
]
pool_rows = assessment.map do |row|
  source = base.find { |candidate| candidate.fetch("candidate_slug") == row.fetch("candidate_slug") }
  {
    "candidate_slug" => row.fetch("candidate_slug"),
    "japanese_name" => row.fetch("japanese_name"),
    "candidate_ledger_review_surface_state" => source.fetch("visible_review_pool_state"),
    "map_or_review_url" => source.fetch("map_or_review_url"),
    "google_visible_review_count" => "not_locked",
    "nifty_visible_review_count" => "not_locked",
    "yahoo_visible_review_count" => "not_locked",
    "numeric_platforms_locked" => 0,
    "tri_locked_verified" => false,
    "direct_reviews_read" => 0,
    "audit_decision" => "review_surface_only_not_count_lock",
    "audit_reason" => "No per-facility P1 row is reproducible in the 2026-07-10 numeric review-pool lock ledger. A URL or a surface-state label is not treated as a locked count.",
    "checked_at_kst" => checked_at
  }
end
write_csv(
  File.join(OUTPUT, "kansai_sanin_setouchi_facility_p1_review_pool_lock_reconciliation_#{DATE}.csv"),
  pool_headers,
  pool_rows
)

water_headers = %w[
  candidate_slug japanese_name official_water_profile_status spring_quality_original official_water_text_original
  official_source_url official_source_checked_at water_scope water_method_badge_policy
]
water_row = assessment.find { |row| row.fetch("candidate_slug") == "hiroshima-yunoyama-onsenkan" }
write_csv(
  File.join(OUTPUT, "kansai_sanin_setouchi_facility_p1_official_water_scope_spotcheck_#{DATE}.csv"),
  water_headers,
  [{
    "candidate_slug" => water_row.fetch("candidate_slug"),
    "japanese_name" => water_row.fetch("japanese_name"),
    "official_water_profile_status" => YUNOYAMA_WATER.fetch("official_water_profile_status"),
    "spring_quality_original" => YUNOYAMA_WATER.fetch("spring_quality_original"),
    "official_water_text_original" => YUNOYAMA_WATER.fetch("official_water_text_original"),
    "official_source_url" => YUNOYAMA_WATER.fetch("official_source_url"),
    "official_source_checked_at" => checked_at,
    "water_scope" => YUNOYAMA_WATER.fetch("water_scope"),
    "water_method_badge_policy" => YUNOYAMA_WATER.fetch("water_method_badge_policy")
  }]
)

summary = {
  total: assessment.length,
  hold: assessment.count { |row| row.fetch("revised_promotion_decision") == "hold" },
  boundary: assessment.count { |row| row.fetch("revised_promotion_decision") == "P0_boundary_first" },
  retain: assessment.count { |row| row.fetch("revised_promotion_decision") == "P1_candidate" }
}

policy = <<~MD
  # Kansai/Sanin/Setouchi P1 Operation & Scope Reconciliation (#{DATE})

  ## Scope

  This pass reconciles only the 34 `P1_candidate` rows from `kansai_sanin_setouchi_facility_candidate_queue_2026-07-10.csv`. It does not modify that source queue, any Kyushu artifact, or a deep-research ledger. It is candidate normalization, so every row remains `direct_reviews_read=0`.

  ## Applied Rules

  - A failed legacy official URL would require both a current operator/authority page and an independent same-name, same-address map/review surface before promotion. No such fallback promotion was used here: all 34 retained official URLs returned HTTP 200 in the transport recheck.
  - HTTP 200 alone is not operating proof. Three rows were checked against current official content; two are held because the official notice says they are closed.
  - Water-method badges need original wording, URL, check time, and bath scope. The Yunoyama spot-check records source temperature and indoor-bath heating, but does not infer direct flow, circulation, or kakenagashi.
  - A lodging/overnight product linked to day-use bathing now routes to `P0_boundary_first` until day-use areas and review denominators are split.
  - Review surface URL/state is not a numeric pool lock. No Google/Nifty/Yahoo count is reproducible for the 34 P1 rows in the 2026-07-10 lock ledger; all remain `not_locked`, `tri_locked_verified=false`, and `direct_reviews_read=0`.

  ## Reconciled Outcomes

  - `hold`: #{summary[:hold]}
  - `P0_boundary_first`: #{summary[:boundary]}
  - retained `P1_candidate`: #{summary[:retain]}

  ### Holds

  - `kinosaki-kouno-yu`: official 2026-05-11 notice schedules long closure through 2026-10-30.
  - `kinosaki-satono-yu`: official notice confirms closure for rebuilding; even its footbath ended in 2025-10.

  ### Boundary-first Queue

  The nine rows in `kansai_sanin_setouchi_facility_mixed_scope_boundary_queue_#{DATE}.csv` must establish a day-use scope contract before review sampling. Lodging, overnight/capsule, hotel guest, and family-bath material cannot enter a public day-use direct-review denominator.

  ## Next Actions

  1. Lock Google, Nifty, and Yahoo numeric pools only after title/address/URL matching; leave absent values as `not_locked`.
  2. For every boundary-first row, define eligible day-use bath areas and excluded lodging/overnight/family-bath products before launching a facility worker.
  3. Recheck Kono-yu after its stated closure window and Satono-yu only after an official reopening notice. Neither is a deep-research target while closed.
  4. For Yunoyama, retain the partial official water fact at its named bath scope and obtain any method wording only from an explicit scoped original source.
MD
File.write(File.join(OUTPUT, "kansai_sanin_setouchi_facility_p1_operation_reconciliation_policy_#{DATE}.md"), policy, encoding: "utf-8")

puts "wrote #{OUTPUT}"
puts "P1=#{summary[:total]} hold=#{summary[:hold]} boundary=#{summary[:boundary]} retain=#{summary[:retain]}"
