#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "fileutils"
require "json"
require "time"

ROOT = File.expand_path("..", __dir__)
DATE = "2026-07-10"
OUTPUT = File.join(ROOT, "research", "onsen-db-seed", "kyushu-facility-pipeline-#{DATE}")
DEEP_ROOT = File.join(OUTPUT, "deepresearch", "kyushu_#{DATE}")

AGENTS = {
  "beppu-hyotan" => ["019f4a2f-64ee-77f2-b2d7-3bc9c4342edc", "completed"],
  "beppu-sakurayu" => ["019f4a2f-646a-7a50-b89b-2455c0b2df72", "completed"],
  "takeo-motonoyu" => ["019f4a2f-656d-7e90-86b5-78e3c3a33380", "completed"],
  "ureshino-hyakunen-no-yu" => ["019f4a2f-66ca-71d2-b006-fccdbbb46a8d", "completed"],
  "ureshino-siebold-no-yu" => ["019f4a2f-665f-7872-9025-58f975a2282f", "completed"],
  "yufuin-shitanyu" => ["019f4a2f-65f0-7762-9ef6-cc5a56e955ce", "completed"],
  "beppu-takegawara" => ["019f4a69-ed78-7943-829e-6bcd43ee2aae", "completed"],
  "beppu-kannawa-mushiyu" => ["019f4a69-ee80-7c40-ac55-e7048a47b3c4", "completed"],
  "ibusuki-saraku" => ["019f4a69-ee05-7c90-b313-9f136e25c0a1", "completed"],
  "unzen-kojigoku-onsenkan" => ["019f4a69-ef87-7983-92c2-f5b059b46aad", "completed"],
  "fukuoka-namiha-no-yu" => ["019f4a69-ef02-7f21-997e-1ee6394dac85", "completed"],
  "kumamoto-agannasse" => ["019f4a96-f2e2-77f3-96a5-56f019853eae", "completed"]
}.freeze

LEDGER_HEADERS = %w[
  review_id platform review_url author_or_publisher review_date_or_relative rating language sampling_stratum
  facility_area facility_area_confidence content_type direct_body_status review_count_eligible facility_related
  scope_bucket dedupe_key short_paraphrase original_keyword access_note
].freeze

FORBIDDEN_REVIEW_SIGNAL_TYPES = %w[source_flow_claim].freeze
LEGACY_METHOD_FIELD_NAMES = %w[source_flow_badge official_method_badge].freeze
LEGACY_METHOD_VALUES = %w[direct_flow_verified official_direct_source_flow_claim].freeze
ALLOWED_FACILITY_AREAS = %w[
  public_bath open_air_public_bath family_bath private_bath sand_bath steam_bath footbath drinking_spring
  inhalation sauna stone_sauna rest_area food_area food_steam overnight_rest route_or_pass area_cluster facility_wide unclear
].freeze
ALLOWED_AREA_CONFIDENCE = %w[specific probable facility_wide unclear].freeze
ALLOWED_REVIEW_SIGNAL_TYPES = %w[
  water_texture distinctive_spring_character chlorine_smell weak_onsen_feeling temperature_experience weather_season
  historic_bath_context bath_variety sand_or_steam_experience family_private_bath_experience crowding_or_wait
  reservation_or_queue_confusion cleanliness_amenities price_payment_value accessibility tourist_expectation_gap
  local_user_culture eligibility_or_use_scope operation_volatility
].freeze
ALLOWED_SIGNAL_DIRECTIONS = %w[positive negative mixed neutral].freeze
ALLOWED_CONTRADICTION_LEVELS = %w[low medium high not_assessed].freeze
ALLOWED_SIGNAL_STATUSES = %w[strong_signal moderate_signal weak_signal conflicting insufficient].freeze

def read_csv(path)
  CSV.read(path, headers: true, encoding: "bom|utf-8").map(&:to_h)
end

def write_csv(path, headers, rows)
  CSV.open(path, "w", write_headers: true, headers: headers, encoding: "utf-8") do |csv|
    rows.each { |row| csv << headers.map { |header| row[header] } }
  end
end

def truthy?(value)
  %w[1 true yes y].include?(value.to_s.strip.downcase)
end

def full_body?(row)
  status = row.fetch("direct_body_status", "").to_s.strip.downcase
  content = row.fetch("content_type", "").to_s.strip.downcase
  truthy?(row["review_count_eligible"]) && %w[full complete].include?(status) && !content.match?(/snippet|context|partial/)
end

def platform_key(name)
  normalized = name.to_s.downcase
  return "google_maps" if normalized.include?("google")
  return "nifty_onsen" if normalized.include?("nifty")
  return "yahoo_map" if normalized.include?("yahoo")

  nil
end

def field(hash, *keys)
  keys.each do |key|
    value = hash[key]
    return value unless value.nil? || value == ""
  end
  nil
end

def numeric_count(value)
  text = value.to_s.strip
  text.match?(/\A\d+\z/) ? text.to_i : nil
end

def explicit_identity_lock?(record, fallback)
  identity = field(record || {}, "identity", "listing_identity_status") ||
             field(fallback || {}, "listing_identity_status")
  status = identity.to_s.strip.downcase
  return false if status.empty?
  return false if status.match?(/not[_\s-]?locked|not[_\s-]?match|need|pending|unknown|search_surface|context_only/)
  return false unless status.match?(/locked|match|exact|aligned|official/)

  pool_status = fallback&.fetch("decision_scope_pool_status", "").to_s.strip
  pool_status.empty? || pool_status == "locked"
end

def forbidden_review_tag_count(rows)
  rows.count do |row|
    row.fetch("sampling_stratum", "").to_s.split(/[;|]/).map(&:strip).include?("source_flow_claim")
  end
end

def legacy_method_field_count(value)
  case value
  when Hash
    value.sum do |key, child|
      LEGACY_METHOD_FIELD_NAMES.include?(key.to_s) ? 1 : legacy_method_field_count(child)
    end
  when Array
    value.sum { |child| legacy_method_field_count(child) }
  when String
    LEGACY_METHOD_VALUES.include?(value) ? 1 : 0
  else
    0
  end
end

def invalid_review_signal_row?(row, facility_related_count)
  return true unless ALLOWED_FACILITY_AREAS.include?(row.fetch("facility_area", ""))
  return true unless ALLOWED_AREA_CONFIDENCE.include?(row.fetch("facility_area_confidence", ""))
  return true unless ALLOWED_REVIEW_SIGNAL_TYPES.include?(row.fetch("signal_type", ""))
  return true unless ALLOWED_SIGNAL_DIRECTIONS.include?(row.fetch("signal_direction", ""))
  return true unless ALLOWED_CONTRADICTION_LEVELS.include?(row.fetch("contradiction_level", ""))
  return true unless ALLOWED_SIGNAL_STATUSES.include?(row.fetch("review_signal_status", ""))

  mention = numeric_count(row.fetch("mention_count", ""))
  source = numeric_count(row.fetch("source_count", ""))
  platform = numeric_count(row.fetch("platform_count", ""))
  mention.nil? || source.nil? || platform.nil? || source > mention || platform > source || mention > facility_related_count
end

def platform_records(mapping)
  locks = mapping["review_pool_locks"] || {}
  pairs = locks.is_a?(Array) ? locks.map { |item| [item["platform"], item] } : locks.to_a
  pairs.map do |name, values|
    key = platform_key(name)
    next nil unless key

    {
      "platform" => key,
      "listing_title" => field(values, "listing_title") || "needs_listing_open",
      "address" => field(values, "address", "official_address", "address_visible") || "needs_official_address_lock",
      "rating" => field(values, "rating", "visible_rating"),
      "count" => field(values, "visible_review_count"),
      "url" => field(values, "url", "listing_url", "exact_url") || "",
      "observed_at" => field(values, "observed_at_kst", "observed_at") || "",
      "identity" => field(values, "listing_identity_status", "identity_status") || "not_checked",
      "access" => field(values, "review_body_access", "access_status", "direct_body_status", "review_access") || "not_checked"
    }
  end.compact.to_h { |record| [record.fetch("platform"), record] }
end

def grade(count)
  return "A" if count >= 300
  return "B" if count >= 100
  return "C" if count >= 50

  "D"
end

queue = read_csv(File.join(OUTPUT, "kyushu_facility_candidate_queue_#{DATE}.csv"))
p0_rows = queue.select { |row| row.fetch("next_priority") == "P0" }
old_locks = read_csv(File.join(OUTPUT, "kyushu_facility_review_pool_lock_#{DATE}.csv"))
old_lock_index = old_locks.to_h { |row| [[row.fetch("candidate_slug"), row.fetch("platform")], row] }
qa_headers = %w[
  candidate_slug official_name_ja google_visible_pool nifty_visible_pool yahoo_visible_pool locked_pool_status locked_pool_sum
  ledger_rows full_body_direct_reviews partial_review_rows_excluded korean_context_bodies_excluded facility_related_direct_reviews
  dayuse_only_direct_reviews late_hour_or_airport_facility_use_reviews lodging_bath_only_direct_reviews evidence_grade readiness
  p0_decision qa_status artifact_directory direct_body_platform_count korean_full_body_direct_reviews
  latest_stratum_seen low_rating_stratum_seen official_water_profile_status review_signal_contract_status forbidden_review_signal_rows forbidden_review_tags legacy_water_method_fields invalid_review_signal_rows
]
qa_rows = []
surface_rows = []
runtime_rows = []
assignment_rows = []
queue_context = []
now = Time.now.getlocal("+09:00").iso8601

p0_rows.each_with_index do |candidate, index|
  slug = candidate.fetch("candidate_slug")
  directory = File.join(DEEP_ROOT, slug)
  mapping_path = Dir[File.join(directory, "*_facility_platform_mapping_#{DATE}.json")].first
  ledger_path = Dir[File.join(directory, "*_direct_review_sample_index_#{DATE}.csv")].first
  signal_path = Dir[File.join(directory, "*_facility_review_signal_rows_#{DATE}.csv")].first
  summary_path = Dir[File.join(directory, "*_facility_review_signal_summary_#{DATE}.md")].first
  artifact_complete = [mapping_path, ledger_path, signal_path, summary_path].all?
  mapping = artifact_complete ? JSON.parse(File.read(mapping_path)) : {}
  ledger = artifact_complete ? read_csv(ledger_path) : []
  signals = artifact_complete ? read_csv(signal_path) : []
  forbidden_signal_rows = signals.count do |row|
    FORBIDDEN_REVIEW_SIGNAL_TYPES.include?(row.fetch("signal_type", "").to_s.strip)
  end
  forbidden_review_tags = forbidden_review_tag_count(ledger)
  legacy_water_method_fields = legacy_method_field_count(mapping)
  full = ledger.select { |row| full_body?(row) }
  related = full.select { |row| truthy?(row["facility_related"]) }
  invalid_review_signal_rows = signals.count { |row| invalid_review_signal_row?(row, related.size) }
  review_signal_contract_valid = forbidden_signal_rows.zero? && forbidden_review_tags.zero? && legacy_water_method_fields.zero? && invalid_review_signal_rows.zero?
  direct_platform_count = full.map { |row| row.fetch("platform", "").strip.downcase }.reject(&:empty?).uniq.size
  korean_full = full.count { |row| row.fetch("language", "").to_s.downcase.start_with?("ko") }
  strata = full.map { |row| row.fetch("sampling_stratum", "").downcase }.join(";")
  latest_stratified = strata.include?("latest")
  low_rated_stratified = strata.include?("low_rating") || strata.include?("low-rated")
  partial = ledger.count do |row|
    status = row["direct_body_status"].to_s.downcase
    content = row["content_type"].to_s.downcase
    status.match?(/partial|trunc/) || content.match?(/snippet|partial/)
  end
  korean_context = ledger.count { |row| row["content_type"].to_s.downcase.match?(/context|blog/) }
  records = platform_records(mapping)
  primary = %w[google_maps nifty_onsen yahoo_map].map do |platform|
    record = records[platform]
    fallback = old_lock_index[[slug, platform]]
    count = numeric_count(record && record["count"]) || numeric_count(fallback&.fetch("visible_review_count", ""))
    [platform, record, fallback, count]
  end
  fully_locked = primary.all? do |_platform, record, fallback, count|
    count && explicit_identity_lock?(record, fallback)
  end
  locked_sum = fully_locked ? primary.sum { |_platform, _record, _fallback, count| count } : nil
  evidence = grade(full.size)
  water = mapping["water_profile"] || mapping.dig("official_facts", "water_profile") || {}
  water_locked = %w[official_locked official_water_profile_locked].include?(field(water, "status"))
  p0_evidence_ready = evidence == "A" && direct_platform_count >= 3 && latest_stratified && low_rated_stratified && fully_locked && water_locked && review_signal_contract_valid
  readiness = p0_evidence_ready ? "P0_ready_after_operation_recheck" : "review_reinforcement"
  p0_decision = p0_evidence_ready ? "P0_ready_after_operation_recheck" : "P0_hold_review_reinforcement"
  agent_state = AGENTS.fetch(slug).last
  status = if artifact_complete && agent_state == "completed" && !review_signal_contract_valid
             "qa_blocked_review_signal_contract"
           elsif artifact_complete && agent_state == "completed"
             p0_evidence_ready ? "qa_accepted" : "qa_accepted_with_caveat"
           elsif agent_state == "running"
             "running"
           else
             "incomplete_artifact_set"
           end

  qa_rows << {
    "candidate_slug" => slug,
    "official_name_ja" => candidate.fetch("japanese_name"),
    "google_visible_pool" => primary[0][3] || 0,
    "nifty_visible_pool" => primary[1][3] || 0,
    "yahoo_visible_pool" => primary[2][3] || 0,
    "locked_pool_status" => fully_locked ? "locked_google_nifty_yahoo" : "not_locked_google_nifty_yahoo",
    "locked_pool_sum" => locked_sum || "",
    "ledger_rows" => ledger.size,
    "full_body_direct_reviews" => full.size,
    "partial_review_rows_excluded" => partial,
    "korean_context_bodies_excluded" => korean_context,
    "facility_related_direct_reviews" => related.size,
    "dayuse_only_direct_reviews" => related.size,
    "late_hour_or_airport_facility_use_reviews" => 0,
    "lodging_bath_only_direct_reviews" => 0,
    "evidence_grade" => evidence,
    "readiness" => readiness,
    "p0_decision" => p0_decision,
    "qa_status" => status,
    "artifact_directory" => "deepresearch/kyushu_#{DATE}/#{slug}",
    "direct_body_platform_count" => direct_platform_count,
    "korean_full_body_direct_reviews" => korean_full,
    "latest_stratum_seen" => latest_stratified.to_s,
    "low_rating_stratum_seen" => low_rated_stratified.to_s,
    "official_water_profile_status" => field(water, "status").to_s,
    "review_signal_contract_status" => if review_signal_contract_valid
                                          "valid"
                                        elsif forbidden_signal_rows.positive? || forbidden_review_tags.positive?
                                          "forbidden_water_method_review_signal"
                                        elsif legacy_water_method_fields.positive?
                                          "legacy_water_method_field"
                                        else
                                          "invalid_review_signal_schema"
                                        end,
    "forbidden_review_signal_rows" => forbidden_signal_rows,
    "forbidden_review_tags" => forbidden_review_tags,
    "legacy_water_method_fields" => legacy_water_method_fields,
    "invalid_review_signal_rows" => invalid_review_signal_rows
  }

  queue_context << {
    candidate: candidate,
    mapping: mapping,
    qa: qa_rows.last,
    fully_locked: fully_locked,
    korean_full: korean_full
  }

  primary.each do |platform, record, fallback, count|
    source = record || {
      "listing_title" => fallback&.fetch("listing_title", "needs_listing_open"),
      "address" => fallback&.fetch("official_address", "needs_official_address_lock"),
      "rating" => fallback&.fetch("visible_rating", ""),
      "url" => fallback&.fetch("listing_url", ""),
      "observed_at" => fallback&.fetch("observed_at_kst", ""),
      "identity" => fallback&.fetch("listing_identity_status", "not_checked"),
      "access" => fallback&.fetch("collection_method", "not_checked")
    }
    surface_rows << {
      "lock_order" => index + 1,
      "candidate_slug" => slug,
      "japanese_name" => candidate.fetch("japanese_name"),
      "official_address" => source["address"],
      "platform" => platform,
      "listing_title" => source["listing_title"],
      "visible_rating" => source["rating"].to_s,
      "visible_review_count" => count || "",
      "listing_url" => source["url"],
      "identity_match" => source["identity"].to_s.match?(/match|locked|exact/i) ? "matched" : "pending",
      "listing_identity_status" => source["identity"],
      "decision_scope_pool_status" => fully_locked ? "locked" : "not_locked_identity_or_pool",
      "observed_at_kst" => source["observed_at"],
      "collection_method" => source["access"],
      "direct_reviews_read" => "0",
      "scope_note" => "Visible pool only. Direct review totals are reproduced only from the facility ledger."
    }
  end

  agent_id, agent_state = AGENTS.fetch(slug)
  runtime_status = agent_state == "completed" ? "qa_accepted_with_caveat" : "running"
  runtime_rows << {
    "candidate_slug" => slug, "assigned_model" => "gpt-5.6-luna", "assigned_agent_id" => agent_id,
    "status" => runtime_status, "output_directory" => "deepresearch/kyushu_#{DATE}/#{slug}",
    "started_at_kst" => "", "completed_at_kst" => agent_state == "completed" ? now : "",
    "runtime_note" => agent_state == "completed" ? "Worker artifact reconciled against ledger; below A/B threshold." : "Worker is collecting facility-specific direct review ledger."
  }
  assignment_rows << {
    "assignment_order" => index + 1, "candidate_slug" => slug, "assigned_model" => "gpt-5.6-luna",
    "assigned_agent_id" => agent_id, "agent_nickname" => "assigned", "status" => runtime_status,
    "output_directory" => "deepresearch/kyushu_#{DATE}/#{slug}",
    "scope_contract" => "#{candidate.fetch("facility_model")}; facility representative water profile; accommodation room-bath data excluded",
    "minimum_full_body_target" => "300", "required_platforms" => "Google Maps;Nifty Onsen;Yahoo Map;Naver direct bodies if available",
    "notes" => agent_state == "completed" ? (p0_evidence_ready ? "Ledger-backed A-grade QA complete; operation recheck remains." : "Ledger-backed QA complete; review reinforcement required.") : "Running in isolated output directory."
  }
end

write_csv(File.join(OUTPUT, "kyushu_facility_deepresearch_qa_#{DATE}.csv"), qa_headers, qa_rows)
surface_headers = %w[
  lock_order candidate_slug japanese_name official_address platform listing_title visible_rating visible_review_count listing_url
  identity_match listing_identity_status decision_scope_pool_status observed_at_kst collection_method direct_reviews_read scope_note
]
write_csv(File.join(OUTPUT, "kyushu_facility_review_pool_lock_#{DATE}.csv"), surface_headers, surface_rows)
assignment_headers = %w[
  assignment_order candidate_slug assigned_model assigned_agent_id agent_nickname status output_directory scope_contract
  minimum_full_body_target required_platforms notes
]
write_csv(File.join(OUTPUT, "kyushu_facility_deepresearch_assignment_manifest_#{DATE}.csv"), assignment_headers, assignment_rows)
runtime_headers = %w[candidate_slug assigned_model assigned_agent_id status output_directory started_at_kst completed_at_kst runtime_note]
write_csv(File.join(OUTPUT, "kyushu_facility_deepresearch_runtime_manifest_#{DATE}.csv"), runtime_headers, runtime_rows)

# Promote worker-verified official water facts only when the four-source contract is present.
water_path = File.join(OUTPUT, "kyushu_facility_official_water_spotcheck_#{DATE}.csv")
water_headers = CSV.read(water_path, headers: true, encoding: "bom|utf-8").headers
water_rows = read_csv(water_path)
water_index = water_rows.to_h { |row| [row.fetch("candidate_slug"), row] }
queue_context.each do |context|
  water = context.fetch(:mapping).dig("official_facts", "water_profile") || context.fetch(:mapping)["water_profile"] || {}
  source_url = field(water, "official_source_url")
  checked_at = field(water, "official_source_checked_at")
  scope = field(water, "water_scope")
  source_text = field(water, "official_water_text_original")
  next unless [source_url, checked_at, scope, source_text].all? { |value| !value.to_s.strip.empty? }

  status = field(water, "status").to_s
  normalized_status = status == "official_locked" ? "official_water_profile_locked" : status
  next unless normalized_status.match?(/\Aofficial_water_profile_(locked|partial_locked)\z/)

  row = water_index.fetch(context.fetch(:candidate).fetch("candidate_slug"))
  row["official_water_profile_status"] = normalized_status
  row["spring_quality_original"] = field(water, "spring_quality_original").to_s
  row["official_water_text_original"] = source_text
  row["official_source_url"] = source_url
  row["official_source_checked_at"] = checked_at
  row["water_scope"] = scope
  row["water_method_badge_policy"] = field(water, "method_badge_policy", "water_method_badge_policy").to_s
  row["spotcheck_note"] = "Worker mapping reconciled only where official text, URL, checked-at, and scope were all present."
end
write_csv(water_path, water_headers, water_rows)

review_queue_rows = []
mapping_queue_rows = []
korean_queue_rows = []
operation_queue_rows = []
queue_context.each do |context|
  candidate = context.fetch(:candidate)
  qa = context.fetch(:qa)
  full = qa.fetch("full_body_direct_reviews").to_i
  platforms = qa.fetch("direct_body_platform_count").to_i

  unless qa.fetch("p0_decision") == "P0_ready_after_operation_recheck"
    target_gap = [300 - full, 0].max
    review_queue_rows << {
      "candidate_slug" => candidate.fetch("candidate_slug"),
      "japanese_name" => candidate.fetch("japanese_name"),
      "queue_type" => "review_reinforcement",
      "priority" => "P0",
      "current_full_body_direct_reviews" => full,
      "current_direct_body_platforms" => platforms,
      "reason" => qa.fetch("qa_status") == "running" ? "Worker output is still running; do not treat the current ledger as final." : "#{qa.fetch("evidence_grade")} grade: 300 full-body reviews and three direct-body platforms are required for A-grade readiness.",
      "next_action" => "Add at least #{target_gap} eligible full-body rows where accessible; preserve latest, low-rating, water/area, crowding, booking, cleanliness, access, and Korean strata."
    }
  end

  unless context.fetch(:fully_locked)
    mapping_queue_rows << {
      "candidate_slug" => candidate.fetch("candidate_slug"),
      "japanese_name" => candidate.fetch("japanese_name"),
      "queue_type" => "mapping_reinforcement",
      "priority" => "P0",
      "reason" => "Google/Nifty/Yahoo visible pools are not all identity-locked in the facility mapping.",
      "next_action" => "Open each actual listing; match official name and address before recording rating, visible count, URL, and observed time."
    }
  end

  if context.fetch(:korean_full).zero?
    korean_queue_rows << {
      "candidate_slug" => candidate.fetch("candidate_slug"),
      "japanese_name" => candidate.fetch("japanese_name"),
      "queue_type" => "korean_review_reinforcement",
      "priority" => "P0",
      "reason" => "No eligible Korean full-body platform-review row is reproduced in the ledger.",
      "next_action" => "Use a new Naver Aside session. Count only an opened full body as a review; search snippets and blog context stay excluded."
    }
  end

  operation_queue_rows << {
    "candidate_slug" => candidate.fetch("candidate_slug"),
    "japanese_name" => candidate.fetch("japanese_name"),
    "queue_type" => "operation_recheck",
    "priority" => "P0",
    "reason" => "needs_current_operation_recheck",
    "next_action" => "Reopen the official operation notice before user-facing guidance."
  }
end
write_csv(
  File.join(OUTPUT, "kyushu_facility_review_reinforcement_queue_#{DATE}.csv"),
  %w[candidate_slug japanese_name queue_type priority current_full_body_direct_reviews current_direct_body_platforms reason next_action],
  review_queue_rows
)
queue_headers = %w[candidate_slug japanese_name queue_type priority reason next_action]
write_csv(File.join(OUTPUT, "kyushu_facility_mapping_reinforcement_queue_#{DATE}.csv"), queue_headers, mapping_queue_rows)
write_csv(File.join(OUTPUT, "kyushu_facility_korean_review_reinforcement_queue_#{DATE}.csv"), queue_headers, korean_queue_rows)
write_csv(File.join(OUTPUT, "kyushu_facility_operation_recheck_queue_#{DATE}.csv"), queue_headers, operation_queue_rows)
water_queue_rows = water_rows.select { |row| row.fetch("official_water_profile_status") != "official_water_profile_locked" }.map do |row|
  {
    "candidate_slug" => row.fetch("candidate_slug"),
    "japanese_name" => row.fetch("japanese_name"),
    "queue_type" => "water_reinforcement",
    "priority" => "P0",
    "reason" => row.fetch("official_water_profile_status"),
    "next_action" => "Find a facility-specific official analysis or operation page; do not infer a method badge."
  }
end
write_csv(File.join(OUTPUT, "kyushu_facility_water_reinforcement_queue_#{DATE}.csv"), queue_headers, water_queue_rows)

grade_counts = qa_rows.group_by { |row| row.fetch("evidence_grade") }.transform_values(&:size)
qa_report = <<~MD
  # 규슈 온천시설 딥리서치 QA - #{DATE}

  ## 현재 집계

  - P0 후보: #{qa_rows.size}건
  - P0_ready_after_operation_recheck: #{qa_rows.count { |row| row.fetch("p0_decision") == "P0_ready_after_operation_recheck" }}건
  - QA 완료 원장: #{qa_rows.count { |row| row.fetch("qa_status").start_with?("qa_accepted") }}건
  - 실행 중: #{qa_rows.count { |row| row.fetch("qa_status") == "running" }}건
  - 직접 읽은 full-body 리뷰: #{qa_rows.sum { |row| row.fetch("full_body_direct_reviews").to_i }}건
  - 시설 관련 직접 리뷰: #{qa_rows.sum { |row| row.fetch("facility_related_direct_reviews").to_i }}건
  - A/B/C/D: #{grade_counts.fetch("A", 0)} / #{grade_counts.fetch("B", 0)} / #{grade_counts.fetch("C", 0)} / #{grade_counts.fetch("D", 0)}
  - 직접 본문 플랫폼 3개 이상: #{qa_rows.count { |row| row.fetch("direct_body_platform_count").to_i >= 3 }}건
  - 한국어 full-body 원장 보유: #{qa_rows.count { |row| row.fetch("korean_full_body_direct_reviews").to_i.positive? }}건
  - 후기 신호 계약 위반: #{qa_rows.sum { |row| row.fetch("forbidden_review_signal_rows").to_i + row.fetch("forbidden_review_tags").to_i + row.fetch("legacy_water_method_fields").to_i + row.fetch("invalid_review_signal_rows").to_i }}건

  ## 판정

  완료 원장은 개별 ledger의 boolean `review_count_eligible`와 `direct_body_status=full`을 다시 계산해 QA에 반영했다. visible pool은 review-pool lock에만 기록하며, 직접 리뷰 수와 합산하지 않는다. primary pool lock은 숫자 존재만으로 통과하지 않고, 각 플랫폼의 확인된 정체성 상태와 잠금 상태를 함께 요구한다. A 조건(300+·3개 직접 플랫폼·최신/저평점 strata·3개 primary pool lock·공식 물 profile·허용된 후기 신호 사전)을 충족한 행만 `P0_ready_after_operation_recheck`로 올린다. 나머지는 `P0_hold_review_reinforcement`를 유지하며, 실행 중 시설은 worker 종료 후 같은 방식으로 재계산한다.
MD
File.write(File.join(OUTPUT, "kyushu_facility_deepresearch_qa_report_#{DATE}.md"), qa_report)

puts "Rebuilt QA: #{qa_rows.count { |row| row.fetch("qa_status") == "qa_accepted_with_caveat" }} completed, #{qa_rows.count { |row| row.fetch("qa_status") == "completed_pending_qa" }} running"
