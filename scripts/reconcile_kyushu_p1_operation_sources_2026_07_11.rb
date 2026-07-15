#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "fileutils"
require "time"

ROOT = File.expand_path("..", __dir__)
DATE = "2026-07-11"
OUTPUT = File.join(ROOT, "research", "onsen-db-seed", "kyushu-facility-p1-promotion-#{DATE}")
INPUT = File.join(OUTPUT, "kyushu_facility_p1_promotion_assessment_#{DATE}.csv")

EVIDENCE = {
  "beppu-hoyoland" => {
    official_url: "https://hoyoland.net/",
    access: "operator_site_rechecked",
    identity: "operator_site_and_city_tourism_identity_rechecked",
    source_type: "operator_site_plus_municipal_tourism_authority",
    operation_url: "https://beppu-tourism.com/onsen/beppu-onsen-hoyo-rando/",
    operation_note: "2026-06-30 current information: day-use 09:00-20:00; lodging guest use is a separate colloid-bath scope.",
    independent_url: "https://map.yahoo.co.jp/v3/place/5hdkTfVjNUo",
    independent_note: "Yahoo Map 107 visible reviews; current 2026 review surface checked.",
    decision: "P0_boundary_first",
    status: "promote_boundary_first",
    pool_status: "google_nifty_yahoo_locked",
    nifty_count: 143,
    yahoo_count: 107,
    water_status: "authority_water_profile_partial_locked",
    water_scope: "mud_bath_and_dayuse_public_bathing; lodging_colloid_bath_separate",
    reason: "현재 운영 사이트와 별부시 관광기관의 당일입욕 정보, Google 2,496·Nifty 143·Yahoo 107 리뷰풀이 함께 확인됐다. 다만 숙박 투숙객의 별도 콜로이드탕 범위가 있어 당일입욕 욕장과 숙박 부속 욕장을 먼저 분리해야 한다.",
    action: "P0 착수 전 mud-bath/day-use와 lodging colloid-bath의 시설영역·리뷰 분모를 분리한 scope contract를 작성한다."
  },
  "ibusuki-tamatebako" => {
    official_url: "https://www.ibusuki.or.jp/spa/open/tamatebako/",
    access: "tourism_authority_current_page_rechecked",
    identity: "tourism_authority_identity_rechecked",
    source_type: "municipal_tourism_authority",
    operation_url: "https://www.ibusuki.or.jp/spa/open/tamatebako/",
    operation_note: "Current day-use hours and closure information are published; the public open-air bath operates with male/female daily rotation.",
    independent_url: "https://map.yahoo.co.jp/v3/place/_9C7JSFHmt2",
    independent_note: "Yahoo Map 99 visible reviews; current 2026 review surface checked.",
    decision: "P0_candidate",
    status: "promote_to_p0",
    pool_status: "google_yahoo_locked_nifty_not_found",
    nifty_count: nil,
    yahoo_count: 99,
    water_status: "authority_water_profile_locked",
    water_scope: "open_air_public_bath; male_female_daily_rotation; not_facility_wide",
    reason: "현재 관광기관 페이지가 전망형 공용 노천탕의 운영 범위와 수질을 명시하고 Google 1,482·Yahoo 99 리뷰풀이 확인됐다. Nifty는 이번 확인 검색에서 정확한 시설 페이지를 찾지 못했으며, 이는 직접 리뷰 수에 포함하지 않는다.",
    action: "P0 딥리서치에서 Google/Naver 새 Aside 세션을 열고, 노천탕의 성별 교대·가수 가케나가시 표기를 공용 노천탕 범위로만 태깅한다."
  },
  "kumamoto-tsukasa-no-yu" => {
    official_url: "https://www.tsukasanoyu.jp/",
    access: "operator_site_rechecked",
    identity: "operator_site_identity_rechecked",
    source_type: "operator_site",
    operation_url: "https://www.tsukasanoyu.jp/",
    operation_note: "The current operator site publishes public-bath and family-bath hours, including weekday family-bath reservation guidance.",
    independent_url: "https://map.yahoo.co.jp/v3/place/2n_wCYgX3A-",
    independent_note: "Yahoo Map 82 visible reviews; current review surface checked.",
    decision: "P0_candidate",
    status: "promote_to_p0",
    pool_status: "google_nifty_yahoo_locked",
    nifty_count: 25,
    yahoo_count: 82,
    water_status: "official_water_profile_reinforcement",
    water_scope: "public_bath_and_family_bath; exact_bath_water_scope_reinforcement",
    reason: "현재 운영 사이트가 대욕장과 가족탕의 운영시간·예약 조건을 제시하고 Google 2,177·Nifty 25·Yahoo 82 리뷰풀이 함께 잠겼다. 다만 이번 점검에서는 공식 수질·욕조별 운용 원문을 충분히 확보하지 못했다.",
    action: "P0 딥리서치 시작 전에 공식 상세 욕장/온천수 페이지를 추가 확보하고, 대욕장과 가족탕 리뷰를 별도 bath_area로 수집한다."
  }
}.freeze

WATER = {
  "beppu-hoyoland" => [
    "authority_water_profile_partial_locked",
    "not_found_in_checked_authority_text",
    "地下から湧く鉱泥の温泉です。地獄から直結した温泉。",
    "https://beppu-tourism.com/onsen/beppu-onsen-hoyo-rando/",
    "mud_bath_and_dayuse_public_bathing; lodging_colloid_bath_separate",
    "no_method_badge_authority_text_has_no_explicit_operating_method"
  ],
  "ibusuki-tamatebako" => [
    "authority_water_profile_locked",
    "ナトリウム・塩化物強塩温泉",
    "泉温等 源泉温度100.4°C 加水 かけ流し",
    "https://www.ibusuki.or.jp/spa/open/tamatebako/",
    "open_air_public_bath; male_female_daily_rotation; not_facility_wide",
    "candidate_kakenagashi_with_dilution_authority_text_scope_explicit; never_apply_facility_wide"
  ],
  "kumamoto-tsukasa-no-yu" => [
    "official_water_profile_reinforcement",
    "not_locked_in_checked_operator_home",
    "Current operator home confirms public-bath and family-bath operation; detailed spring-quality and bath-method page remains to be collected.",
    "https://www.tsukasanoyu.jp/",
    "public_bath_and_family_bath; exact_bath_water_scope_reinforcement",
    "no_method_badge_until_official_original_text_url_checked_at_and_bath_scope_are_all_locked"
  ]
}.freeze

def read_csv(path)
  CSV.read(path, headers: true, encoding: "bom|utf-8").map(&:to_h)
end

def write_csv(path, headers, rows)
  CSV.open(path, "w", write_headers: true, headers: headers, encoding: "utf-8") do |csv|
    rows.each { |row| csv << headers.map { |header| row[header] } }
  end
end

ASSESSMENT_HEADERS = %w[
  promotion_order candidate_slug japanese_name korean_name candidate_track prefecture facility_model lodging_available
  current_priority official_url official_url_access_status official_identity_status official_water_profile_status water_scope
  google_rating google_visible_review_count google_lock_status nifty_visible_review_count yahoo_visible_review_count
  review_pool_lock_status direct_reviews_read promotion_decision promotion_status decision_reason next_action
  verification_route alternative_operation_source_type alternative_operation_url independent_operation_surface_url checked_at_kst
].freeze

FileUtils.mkdir_p(OUTPUT)
now = Time.now.getlocal("+09:00").iso8601
base_rows = read_csv(INPUT)

integrated = base_rows.map do |row|
  evidence = EVIDENCE[row.fetch("candidate_slug")]
  unless evidence
    next row.merge(
      "verification_route" => "original_p1_promotion_assessment",
      "alternative_operation_source_type" => "",
      "alternative_operation_url" => "",
      "independent_operation_surface_url" => ""
    )
  end

  row.merge(
    "official_url" => evidence.fetch(:official_url),
    "official_url_access_status" => evidence.fetch(:access),
    "official_identity_status" => evidence.fetch(:identity),
    "official_water_profile_status" => evidence.fetch(:water_status),
    "water_scope" => evidence.fetch(:water_scope),
    "review_pool_lock_status" => evidence.fetch(:pool_status),
    "nifty_visible_review_count" => evidence.fetch(:nifty_count),
    "yahoo_visible_review_count" => evidence.fetch(:yahoo_count),
    "promotion_decision" => evidence.fetch(:decision),
    "promotion_status" => evidence.fetch(:status),
    "decision_reason" => evidence.fetch(:reason),
    "next_action" => evidence.fetch(:action),
    "verification_route" => "alternative_current_operation_evidence",
    "alternative_operation_source_type" => evidence.fetch(:source_type),
    "alternative_operation_url" => evidence.fetch(:operation_url),
    "independent_operation_surface_url" => evidence.fetch(:independent_url),
    "checked_at_kst" => now
  )
end

write_csv(
  File.join(OUTPUT, "kyushu_facility_p1_promotion_assessment_#{DATE}_integrated.csv"),
  ASSESSMENT_HEADERS,
  integrated
)

evidence_headers = %w[
  candidate_slug japanese_name prior_official_url prior_status current_operation_source_type current_operation_url
  current_operation_evidence independent_operation_surface_url independent_surface_evidence
  revised_promotion_decision revised_status scope_boundary source_checked_at direct_reviews_read
]
evidence_rows = EVIDENCE.map do |slug, evidence|
  prior = base_rows.find { |row| row.fetch("candidate_slug") == slug }
  current = integrated.find { |row| row.fetch("candidate_slug") == slug }
  {
    "candidate_slug" => slug,
    "japanese_name" => current.fetch("japanese_name"),
    "prior_official_url" => prior.fetch("official_url"),
    "prior_status" => prior.fetch("official_url_access_status"),
    "current_operation_source_type" => evidence.fetch(:source_type),
    "current_operation_url" => evidence.fetch(:operation_url),
    "current_operation_evidence" => evidence.fetch(:operation_note),
    "independent_operation_surface_url" => evidence.fetch(:independent_url),
    "independent_surface_evidence" => evidence.fetch(:independent_note),
    "revised_promotion_decision" => current.fetch("promotion_decision"),
    "revised_status" => current.fetch("promotion_status"),
    "scope_boundary" => current.fetch("water_scope"),
    "source_checked_at" => now,
    "direct_reviews_read" => 0
  }
end
write_csv(
  File.join(OUTPUT, "kyushu_facility_alternative_operation_evidence_#{DATE}.csv"),
  evidence_headers,
  evidence_rows
)

water_headers = %w[
  candidate_slug japanese_name official_water_profile_status spring_quality_original official_water_text_original
  official_source_url official_source_checked_at water_scope water_method_badge_policy
]
water_rows = WATER.map do |slug, fact|
  current = integrated.find { |row| row.fetch("candidate_slug") == slug }
  {
    "candidate_slug" => slug,
    "japanese_name" => current.fetch("japanese_name"),
    "official_water_profile_status" => fact[0],
    "spring_quality_original" => fact[1],
    "official_water_text_original" => fact[2],
    "official_source_url" => fact[3],
    "official_source_checked_at" => now,
    "water_scope" => fact[4],
    "water_method_badge_policy" => fact[5]
  }
end
write_csv(
  File.join(OUTPUT, "kyushu_facility_p1_official_water_spotcheck_#{DATE}_integrated.csv"),
  water_headers,
  water_rows
)

p0_headers = %w[
  research_order candidate_slug japanese_name korean_name candidate_track prefecture facility_model official_url
  google_visible_review_count nifty_visible_review_count yahoo_visible_review_count official_water_profile_status
  water_scope priority_reason verification_route status
]
p0_rows = integrated.select { |row| row.fetch("promotion_decision") == "P0_candidate" }.each_with_index.map do |row, index|
  {
    "research_order" => index + 1,
    "candidate_slug" => row.fetch("candidate_slug"),
    "japanese_name" => row.fetch("japanese_name"),
    "korean_name" => row.fetch("korean_name"),
    "candidate_track" => row.fetch("candidate_track"),
    "prefecture" => row.fetch("prefecture"),
    "facility_model" => row.fetch("facility_model"),
    "official_url" => row.fetch("official_url"),
    "google_visible_review_count" => row.fetch("google_visible_review_count"),
    "nifty_visible_review_count" => row.fetch("nifty_visible_review_count"),
    "yahoo_visible_review_count" => row.fetch("yahoo_visible_review_count"),
    "official_water_profile_status" => row.fetch("official_water_profile_status"),
    "water_scope" => row.fetch("water_scope"),
    "priority_reason" => row.fetch("decision_reason"),
    "verification_route" => row.fetch("verification_route"),
    "status" => "P0_candidate_pre_deepresearch"
  }
end
write_csv(
  File.join(OUTPUT, "kyushu_facility_p0_promotion_queue_#{DATE}_integrated.csv"),
  p0_headers,
  p0_rows
)

boundary_headers = %w[
  candidate_slug japanese_name korean_name candidate_track facility_model google_visible_review_count
  reason next_action verification_route status
]
boundary_rows = integrated.select { |row| row.fetch("promotion_decision") == "P0_boundary_first" }.map do |row|
  {
    "candidate_slug" => row.fetch("candidate_slug"),
    "japanese_name" => row.fetch("japanese_name"),
    "korean_name" => row.fetch("korean_name"),
    "candidate_track" => row.fetch("candidate_track"),
    "facility_model" => row.fetch("facility_model"),
    "google_visible_review_count" => row.fetch("google_visible_review_count"),
    "reason" => row.fetch("decision_reason"),
    "next_action" => row.fetch("next_action"),
    "verification_route" => row.fetch("verification_route"),
    "status" => "boundary_first"
  }
end
write_csv(
  File.join(OUTPUT, "kyushu_facility_p0_boundary_first_queue_#{DATE}_integrated.csv"),
  boundary_headers,
  boundary_rows
)

recheck_headers = %w[candidate_slug japanese_name official_url official_url_access_status required_action]
recheck_statuses = %w[unresolved_dns curl_error_recheck http_403_browser_recheck http_404]
recheck_rows = integrated.select do |row|
  recheck_statuses.include?(row.fetch("official_url_access_status"))
end.map do |row|
  {
    "candidate_slug" => row.fetch("candidate_slug"),
    "japanese_name" => row.fetch("japanese_name"),
    "official_url" => row.fetch("official_url"),
    "official_url_access_status" => row.fetch("official_url_access_status"),
    "required_action" => row.fetch("next_action")
  }
end
write_csv(
  File.join(OUTPUT, "kyushu_facility_p1_official_url_recheck_queue_#{DATE}_integrated.csv"),
  recheck_headers,
  recheck_rows
)

errors = []
errors << "Expected 23 P1 rows, got #{integrated.length}." unless integrated.length == 23
errors << "Duplicate candidate_slug in integrated assessment." unless integrated.map { |row| row.fetch("candidate_slug") }.uniq.length == integrated.length
errors << "Candidate-stage direct review counts must all be 0." unless integrated.all? { |row| row.fetch("direct_reviews_read") == "0" }
errors << "Expected 4 P0 candidates, got #{p0_rows.length}." unless p0_rows.length == 4
errors << "Expected 9 P0 boundary-first rows, got #{boundary_rows.length}." unless boundary_rows.length == 9
errors << "Alternative operation evidence must have 3 rows." unless evidence_rows.length == 3
errors << "Alternative evidence needs both operation and independent URLs." unless evidence_rows.all? do |row|
  !row.fetch("current_operation_url").empty? && !row.fetch("independent_operation_surface_url").empty?
end

report = <<~MD
  # Kyushu P1 Promotion: Alternative Operation Evidence Policy (#{DATE})

  ## Policy

  A failed legacy official domain no longer automatically blocks a P1 candidate. Promotion can use alternative current-operation evidence only when both a current operator/municipal/tourism-authority page and an independent map/review surface confirm the same facility.

  This verifies operation and identity only. It does not turn portal descriptions or review pools into official water facts. A water-method badge still needs original official or authority wording, source URL, checked time, and explicit bath-area scope.

  ## Reconciled Decisions

  - P0 candidate: #{p0_rows.length} facilities.
  - P0 boundary-first: #{boundary_rows.length} facilities.
  - Retain/hold P1: #{integrated.length - p0_rows.length - boundary_rows.length} facilities.
  - Direct reviews read in this candidate-normalization pass: 0. Visible review pools remain pools, not direct-review counts.

  ## Revised Facilities

  - Beppu Hoyoland: current operation is verified, but it remains P0 boundary-first because mud-bath day-use and lodging colloid-bath scope must be separated.
  - Tamatebako Onsen: current tourism-authority operation page and a scoped water profile support P0 candidate promotion.
  - Tsukasa no Yu: current operator page supports P0 candidate promotion; official detailed water facts remain reinforcement work.

  ## Remaining URL Rechecks

  #{recheck_rows.map { |row| "- #{row.fetch("japanese_name")} (#{row.fetch("candidate_slug")}): #{row.fetch("official_url_access_status")}" }.join("\n")}
MD
File.write(
  File.join(OUTPUT, "kyushu_facility_alternative_operation_policy_#{DATE}.md"),
  report,
  encoding: "utf-8"
)

validation = <<~MD
  # Kyushu P1 Integrated Promotion Validation (#{DATE})

  - Integrated P1 rows: #{integrated.length}
  - Unique candidate slugs: #{integrated.map { |row| row.fetch("candidate_slug") }.uniq.length}
  - P0 candidates: #{p0_rows.length}
  - P0 boundary-first: #{boundary_rows.length}
  - Retain/hold P1: #{integrated.length - p0_rows.length - boundary_rows.length}
  - Direct reviews read: #{integrated.map { |row| row.fetch("direct_reviews_read") }.uniq.join(", ")}
  - Alternative-operation evidence records: #{evidence_rows.length}
  - Result: #{errors.empty? ? "PASS" : "FAIL"}

  #{errors.empty? ? "Candidate-only promotion integrity checks passed. No visible review-pool count was treated as a direct-review count." : errors.map { |error| "- #{error}" }.join("\n")}
MD
File.write(
  File.join(OUTPUT, "kyushu_facility_p1_promotion_integrated_validation_#{DATE}.md"),
  validation,
  encoding: "utf-8"
)

abort(errors.join("\n")) unless errors.empty?

puts "Wrote integrated P1 reconciliation to #{OUTPUT}"
