#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "json"
require "optparse"
require "time"

DATE = "2026-07-11"
PIPELINE = "research/onsen-db-seed/hokkaido-facility-pipeline-#{DATE}"
RESEARCH_ROOT = "research/onsen-db-seed"
QUEUE = File.join(PIPELINE, "hokkaido_facility_candidate_queue_#{DATE}.csv")
ASSIGNMENTS = File.join(PIPELINE, "hokkaido_facility_deepresearch_assignment_manifest_#{DATE}.csv")
POOL_LOCK = File.join(PIPELINE, "hokkaido_facility_review_pool_lock_#{DATE}.csv")
QA_HEADERS = CSV.read(".agents/skills/bathtime-onsen-facility-review-signal-researcher/assets/regional-pipeline/deepresearch_qa_template.csv", headers: true).headers.freeze

options = { label: "final" }
OptionParser.new do |parser|
  parser.on("--slugs LIST", "Comma-separated completed candidate slugs") { |value| options[:slugs] = value.split(",").map(&:strip).reject(&:empty?) }
  parser.on("--label LABEL", "Output label, default final") { |value| options[:label] = value }
end.parse!

def read_csv(path)
  CSV.read(path, headers: true, encoding: "bom|utf-8").map(&:to_h)
end

def write_csv(path, headers, rows)
  CSV.open(path, "w", write_headers: true, headers: headers, encoding: "utf-8") do |csv|
    rows.each { |row| csv << headers.map { |header| row.fetch(header, "") } }
  end
end

def truthy?(value)
  value.to_s.strip.downcase == "true"
end

def korean?(value)
  value.to_s.strip.downcase.tr("-", "_").match?(/\A(?:ko|ko_kr|korean|한국어)\z/)
end

def grade_for(count)
  return "A" if count >= 300
  return "B" if count >= 100
  return "C" if count >= 50

  "D"
end

def integer_or_nil(value)
  return nil if value.nil? || value.to_s.strip.empty?

  Integer(value.to_s.delete(","), 10)
rescue ArgumentError
  nil
end

def pool_data(mapping, platform)
  pools = mapping["visible_pools"] || mapping["platform_review_pools"] || {}
  pool = pools[platform] || {}
  {
    "count" => integer_or_nil(pool["count"] || pool["visible_review_count"]),
    "rating" => pool["rating"] || pool["visible_rating"],
    "url" => pool["url"] || pool["listing_url"],
    "title" => pool["listing_title"],
    "identity_match" => pool["identity_match"],
    "scope_status" => pool["decision_scope_pool_status"],
    "observed_at" => pool["observed_at_kst"] || pool["observed_at"] || "",
    "method" => pool["collection_method"] || "facility_mapping"
  }
end

def scope_locked?(status)
  normalized = status.to_s.downcase
  return false if normalized.include?("mixed") || normalized.include?("not_locked") || normalized.include?("unknown") || normalized.include?("not_dayuse") || normalized.include?("lodging")

  true
end

def artifact(path, pattern, slug, errors)
  matches = Dir.glob(File.join(path, pattern))
  errors << "#{slug}: expected one #{pattern}, found #{matches.length}" unless matches.length == 1
  matches.first
end

queue = read_csv(QUEUE).to_h { |row| [row.fetch("candidate_slug"), row] }
assignments = read_csv(ASSIGNMENTS)
selected = options[:slugs] || assignments.map { |row| row.fetch("candidate_slug") }
unknown = selected - assignments.map { |row| row.fetch("candidate_slug") }
abort("Unknown deep-research slug(s): #{unknown.join(', ')}") unless unknown.empty?

errors = []
qa_rows = []
mapping_by_slug = {}
selected.each do |slug|
  assignment = assignments.find { |row| row.fetch("candidate_slug") == slug }
  candidate = queue.fetch(slug)
  directory = File.join(RESEARCH_ROOT, assignment.fetch("output_directory"))
  unless Dir.exist?(directory)
    errors << "#{slug}: artifact directory missing #{directory}"
    next
  end

  mapping_path = artifact(directory, "*_facility_platform_mapping_#{DATE}.json", slug, errors)
  ledger_path = artifact(directory, "*_direct_review_sample_index_#{DATE}.csv", slug, errors)
  signal_path = artifact(directory, "*_facility_review_signal_rows_#{DATE}.csv", slug, errors)
  artifact(directory, "*_facility_review_signal_summary_#{DATE}.md", slug, errors)
  next if [mapping_path, ledger_path, signal_path].any?(&:nil?)

  begin
    mapping = JSON.parse(File.read(mapping_path, encoding: "utf-8"))
    mapping_by_slug[slug] = mapping
  rescue JSON::ParserError => error
    errors << "#{slug}: mapping JSON invalid: #{error.message}"
    next
  end

  ledger_table = CSV.read(ledger_path, headers: true, encoding: "bom|utf-8")
  signal_table = CSV.read(signal_path, headers: true, encoding: "bom|utf-8")
  ledger = ledger_table.map(&:to_h)
  signals = signal_table.map(&:to_h)
  ledger_required = %w[review_id dedupe_key content_type direct_body_status review_count_eligible facility_related scope_bucket platform language sampling_stratum]
  signal_required = %w[facility_slug facility_area signal_type signal_direction source_count platform_count platforms water_texture_subtype color_tag publishable_item]
  ledger_missing = ledger_required - (ledger_table.headers || [])
  signal_missing = signal_required - (signal_table.headers || [])
  errors << "#{slug}: ledger missing #{ledger_missing.join(', ')}" unless ledger_missing.empty?
  errors << "#{slug}: signal CSV missing #{signal_missing.join(', ')}" unless signal_missing.empty?
  next unless ledger_missing.empty? && signal_missing.empty?

  review_ids = ledger.map { |row| row.fetch("review_id").to_s.strip }
  dedupe_keys = ledger.map { |row| row.fetch("dedupe_key").to_s.strip }
  errors << "#{slug}: blank or duplicate review_id" if review_ids.any?(&:empty?) || review_ids.uniq.length != review_ids.length
  errors << "#{slug}: blank or duplicate dedupe_key" if dedupe_keys.any?(&:empty?) || dedupe_keys.uniq.length != dedupe_keys.length

  eligible = ledger.select { |row| truthy?(row.fetch("review_count_eligible")) }
  eligible.each do |row|
    errors << "#{slug}: eligible #{row.fetch('review_id')} violates review contract" unless row.fetch("content_type") == "platform_review" && row.fetch("direct_body_status") == "full" && truthy?(row.fetch("facility_related"))
  end
  full_body = eligible.length
  direct_platforms = eligible.map { |row| row.fetch("platform").to_s }.uniq.length
  partial = ledger.count { |row| row.fetch("direct_body_status") == "partial" }
  korean_context = ledger.count { |row| korean?(row.fetch("language")) && row.fetch("direct_body_status") == "full" && !truthy?(row.fetch("review_count_eligible")) }
  dayuse = eligible.count { |row| row.fetch("scope_bucket") == "dayuse_only" }
  lodging = eligible.count { |row| row.fetch("scope_bucket") == "lodging_bath_only" }
  late = eligible.count { |row| %w[late_hour_facility_use airport_facility_use late_hour_or_airport_facility_use].include?(row.fetch("scope_bucket")) }
  errors << "#{slug}: eligible scope buckets are not all supported" unless dayuse + lodging + late == full_body
  latest = eligible.any? { |row| row.fetch("sampling_stratum").to_s.downcase.split(/[;|,]/).include?("latest") }
  low = eligible.any? { |row| row.fetch("sampling_stratum").to_s.downcase.split(/[;|,]/).any? { |value| %w[low_rating low_rated low].include?(value.strip) } }

  source_flow = signals.count { |row| row.fetch("signal_type") == "source_flow_claim" }
  invalid_signals = signals.count do |row|
    platforms = row.fetch("platforms").to_s.split("|").map(&:strip).reject(&:empty?).uniq
    texture = row.fetch("water_texture_subtype").to_s.strip
    color = row.fetch("color_tag").to_s.strip
    row.fetch("facility_slug") != slug ||
      integer_or_nil(row.fetch("platform_count")) != platforms.length ||
      (row.fetch("signal_type") == "water_texture" && !%w[slippery salt_warmth sulfur carbonated].include?(texture)) ||
      (row.fetch("signal_type") != "water_texture" && !["", "not_applicable"].include?(texture)) ||
      !%w[white brown clear green other unclear not_applicable].include?(color)
  end
  publishable = signals.select { |row| truthy?(row.fetch("publishable_item")) }
  verdict = if full_body >= 300 && direct_platforms >= 3 && publishable.length >= 3
              "full"
            elsif full_body >= 50 && direct_platforms >= 2 && publishable.length >= 2
              "lite"
            else
              "draft"
            end

  mapping_counts = mapping["counts"] || {}
  mapping_full = integer_or_nil(mapping_counts["full_eligible"] || mapping_counts["eligible"])
  errors << "#{slug}: mapping eligible #{mapping_full} != ledger #{full_body}" if mapping_full && mapping_full != full_body
  pools = %w[google_maps nifty_onsen yahoo_map].to_h { |platform| [platform, pool_data(mapping, platform)] }
  locked = pools.values.all? do |pool|
    !pool.fetch("count").nil? && !pool.fetch("url").to_s.empty? && scope_locked?(pool.fetch("scope_status"))
  end

  qa_rows << {
    "candidate_slug" => slug,
    "official_name_ja" => candidate.fetch("japanese_name"),
    "google_visible_pool" => (pools.fetch("google_maps").fetch("count") || 0).to_s,
    "nifty_visible_pool" => (pools.fetch("nifty_onsen").fetch("count") || 0).to_s,
    "yahoo_visible_pool" => (pools.fetch("yahoo_map").fetch("count") || 0).to_s,
    "locked_pool_status" => locked ? "locked_google_nifty_yahoo" : "not_locked_pool_or_scope",
    "locked_pool_sum" => locked ? pools.values.sum { |pool| pool.fetch("count") }.to_s : "",
    "ledger_rows" => ledger.length.to_s,
    "full_body_direct_reviews" => full_body.to_s,
    "partial_review_rows_excluded" => partial.to_s,
    "korean_context_bodies_excluded" => korean_context.to_s,
    "facility_related_direct_reviews" => full_body.to_s,
    "dayuse_only_direct_reviews" => dayuse.to_s,
    "late_hour_or_airport_facility_use_reviews" => late.to_s,
    "lodging_bath_only_direct_reviews" => lodging.to_s,
    "evidence_grade" => grade_for(full_body),
    "readiness" => verdict == "draft" ? "needs_reinforcement" : "ready_for_verdict",
    "p0_decision" => verdict,
    "qa_status" => "accepted_pending_regional_validator",
    "artifact_directory" => assignment.fetch("output_directory"),
    "direct_body_platform_count" => direct_platforms.to_s,
    "korean_full_body_direct_reviews" => eligible.count { |row| korean?(row.fetch("language")) }.to_s,
    "latest_stratum_seen" => latest.to_s,
    "low_rating_stratum_seen" => low.to_s,
    "official_water_profile_status" => mapping.fetch("official_water_profile_status", candidate.fetch("official_water_profile_status")),
    "review_signal_contract_status" => mapping.fetch("review_signal_contract_status", "ledger_recomputed_pending_validator"),
    "forbidden_review_signal_rows" => source_flow.to_s,
    "forbidden_review_tags" => source_flow.zero? ? "[]" : "[source_flow_claim]",
    "legacy_water_method_fields" => mapping.fetch("legacy_water_method_fields", 0).to_s,
    "invalid_review_signal_rows" => invalid_signals.to_s
  }
end

abort("QA integration failed:\n- #{errors.join("\n- ")}") unless errors.empty?

label = options.fetch(:label)
qa_path = File.join(PIPELINE, "hokkaido_facility_deepresearch_qa_#{DATE}_#{label}.csv")
write_csv(qa_path, QA_HEADERS, qa_rows)

pool_rows = read_csv(POOL_LOCK)
pool_rows.each do |row|
  mapping = mapping_by_slug[row.fetch("candidate_slug")]
  next unless mapping

  pool = pool_data(mapping, row.fetch("platform"))
  row["listing_title"] = pool.fetch("title").to_s
  row["visible_rating"] = pool.fetch("rating").to_s
  row["visible_review_count"] = pool.fetch("count").to_s
  row["listing_url"] = pool.fetch("url").to_s
  row["identity_match"] = pool.fetch("identity_match").to_s.empty? ? "rechecked_in_mapping" : pool.fetch("identity_match").to_s
  row["listing_identity_status"] = pool.fetch("scope_status").to_s.empty? ? "mapping_rechecked" : pool.fetch("scope_status").to_s
  row["decision_scope_pool_status"] = pool.fetch("scope_status").to_s.empty? ? "not_locked_pool_or_scope" : pool.fetch("scope_status").to_s
  row["observed_at_kst"] = pool.fetch("observed_at")
  row["collection_method"] = pool.fetch("method")
  row["direct_reviews_read"] = "0"
end
write_csv(POOL_LOCK, CSV.read(POOL_LOCK, headers: true).headers, pool_rows)

report = <<~MD
  # 홋카이도 온천시설 딥리서치 QA (#{label})

  - 대상: #{qa_rows.length}곳
  - canonical ledger 행: #{qa_rows.sum { |row| row.fetch("ledger_rows").to_i }}
  - 적격 직접 입욕 경험: #{qa_rows.sum { |row| row.fetch("full_body_direct_reviews").to_i }}건
  - full/lite/draft: #{qa_rows.count { |row| row.fetch("p0_decision") == "full" }}/#{qa_rows.count { |row| row.fetch("p0_decision") == "lite" }}/#{qa_rows.count { |row| row.fetch("p0_decision") == "draft" }}
  - 이 파일은 canonical ledger에서 다시 계산한 중간 QA다. 지역 validator 통과 전에는 최종 반영하지 않는다.
MD
File.write(File.join(PIPELINE, "hokkaido_facility_deepresearch_qa_report_#{DATE}_#{label}.md"), report, encoding: "utf-8")

puts "Integrated #{qa_rows.length} facilities into #{qa_path}."
