#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "json"
require "optparse"
require "time"

ROOT = File.expand_path("..", __dir__)
DATE = "2026-07-12"
SEED_ROOT = File.join(ROOT, "research", "onsen-db-seed")
PIPELINE = File.join(SEED_ROOT, "kansai_sanin_setouchi_facility_pipeline_#{DATE}")
RUNTIME = File.join(PIPELINE, "kansai_sanin_setouchi_facility_deepresearch_runtime_manifest_#{DATE}.csv")

options = { batch: "batch_1", slug: nil }
OptionParser.new do |parser|
  parser.on("--batch NAME") { |value| options[:batch] = value }
  parser.on("--slug SLUG") { |value| options[:slug] = value }
end.parse!

def read_csv(path)
  CSV.read(path, headers: true, encoding: "bom|utf-8").map(&:to_h)
end

def write_csv(path, headers, rows)
  CSV.open(path, "w", write_headers: true, headers: headers, encoding: "utf-8") do |csv|
    rows.each { |row| csv << headers.map { |header| row[header] } }
  end
end

def truthy?(value)
  value.to_s.strip.downcase == "true"
end

def integer(value)
  Integer(value.to_s.delete(",").strip, 10)
rescue ArgumentError
  nil
end

def stratum_seen?(row, kind)
  field = kind == "latest" ? "is_latest_stratum" : "is_low_rating_stratum"
  return true if truthy?(row[field])

  values = row["sampling_stratum"].to_s.downcase.tr("-", "_").split(/[;|,]/).map(&:strip)
  kind == "latest" ? values.include?("latest") : (values & %w[low low_rating low_rated]).any?
end

def grade(full)
  return "A" if full >= 300
  return "B" if full >= 100
  return "C" if full >= 50

  "D"
end

def water_status(mapping)
  mapping["official_water_profile_status"] || mapping.dig("official_bath_facts_seen", "official_water_profile_status") || "official_water_profile_reinforcement"
end

runtime = read_csv(RUNTIME)
targets = runtime.select { |row| row.fetch("batch") == options.fetch(:batch) }
targets = targets.select { |row| row.fetch("candidate_slug") == options.fetch(:slug) } if options[:slug]
raise "no runtime rows for #{options[:batch]}" if targets.empty?
now = Time.now.getlocal("+09:00").iso8601

qa_headers = %w[
  candidate_slug official_name_ja google_visible_pool nifty_visible_pool yahoo_visible_pool locked_pool_status
  locked_pool_sum ledger_rows full_body_direct_reviews partial_review_rows_excluded korean_context_bodies_excluded
  facility_related_direct_reviews dayuse_only_direct_reviews late_hour_or_airport_facility_use_reviews
  lodging_bath_only_direct_reviews evidence_grade readiness p0_decision qa_status artifact_directory
  direct_body_platform_count korean_full_body_direct_reviews latest_stratum_seen low_rating_stratum_seen
  official_water_profile_status review_signal_contract_status forbidden_review_signal_rows forbidden_review_tags
  legacy_water_method_fields invalid_review_signal_rows qa_issue_count qa_issues
]

qa_rows = targets.map do |target|
  slug = target.fetch("candidate_slug")
  output = File.join(SEED_ROOT, target.fetch("output_directory"))
  required = {
    "mapping" => File.join(output, "#{slug}_facility_platform_mapping_#{DATE}.json"),
    "ledger" => File.join(output, "#{slug}_direct_review_sample_index_#{DATE}.csv"),
    "signals" => File.join(output, "#{slug}_facility_review_signal_rows_#{DATE}.csv"),
    "summary" => File.join(output, "#{slug}_facility_review_signal_summary_#{DATE}.md")
  }
  issues = required.reject { |_name, path| File.file?(path) }.keys.map { |name| "missing_#{name}" }
  mapping = {}
  ledger = []
  signals = []
  unless issues.any?
    begin
      mapping = JSON.parse(File.read(required.fetch("mapping"), encoding: "utf-8"))
    rescue JSON::ParserError
      issues << "invalid_mapping_json"
    end
    begin
      ledger = read_csv(required.fetch("ledger"))
    rescue CSV::MalformedCSVError
      issues << "invalid_ledger_csv"
    end
    begin
      signals = read_csv(required.fetch("signals"))
    rescue CSV::MalformedCSVError
      issues << "invalid_signal_csv"
    end
  end

  ledger_headers = %w[review_id dedupe_key content_type direct_body_status review_count_eligible facility_related scope_bucket platform language]
  issues << "ledger_missing_columns" unless (ledger_headers - (ledger.first || {}).keys).empty?
  if ledger.any?
    %w[review_id dedupe_key].each do |field|
      values = ledger.map { |row| row[field].to_s.strip }
      issues << "blank_#{field}" if values.any?(&:empty?)
      issues << "duplicate_#{field}" unless values.uniq.length == values.length
    end
    ledger.each do |row|
      issues << "noncanonical_content_type" unless %w[platform_review blog_context activity_post snippet].include?(row["content_type"])
      issues << "noncanonical_body_status" unless %w[full partial not_available].include?(row["direct_body_status"])
      issues << "noncanonical_boolean" unless %w[true false].include?(row["review_count_eligible"])
      issues << "noncanonical_boolean" unless %w[true false].include?(row["facility_related"])
      issues << "noncanonical_platform" unless row["platform"].to_s.match?(/\A[a-z0-9_]+\z/)
      issues << "noncanonical_scope" unless row["scope_bucket"].to_s.match?(/\A[a-z0-9_]+\z/)
    end
  end

  eligible = ledger.select { |row| truthy?(row["review_count_eligible"]) }
  eligible.each do |row|
    issues << "invalid_eligible_contract" unless row["content_type"] == "platform_review" && row["direct_body_status"] == "full" && truthy?(row["facility_related"])
  end
  full = eligible.length
  partial = ledger.count { |row| row["direct_body_status"] == "partial" }
  korean_context = ledger.count { |row| row["language"].to_s.match?(/\A(?:ko|ko_kr|korean|한국어)\z/i) && row["direct_body_status"] == "full" && !truthy?(row["review_count_eligible"]) }
  korean_eligible = eligible.count { |row| row["language"].to_s.match?(/\A(?:ko|ko_kr|korean|한국어)\z/i) }
  platforms = eligible.map { |row| row["platform"] }.uniq
  latest = eligible.any? { |row| stratum_seen?(row, "latest") }
  low = eligible.any? { |row| stratum_seen?(row, "low") }
  dayuse = eligible.count { |row| row["scope_bucket"] == "dayuse_only" }
  lodging = eligible.count { |row| row["scope_bucket"] == "lodging_bath_only" }
  late = eligible.count { |row| %w[late_hour_facility_use airport_facility_use late_hour_or_airport_facility_use].include?(row["scope_bucket"]) }
  issues << "eligible_scope_not_partitioned" unless dayuse + lodging + late == full

  signal_headers = %w[facility_slug signal_type source_count platform_count platforms water_texture_subtype color_tag publishable_item]
  issues << "signals_missing_columns" unless (signal_headers - (signals.first || {}).keys).empty?
  signal_keys = []
  valid_signal_rows = signals.select do |row|
    source_count = integer(row["source_count"])
    listed = row["platforms"].to_s.split("|").map(&:strip).reject(&:empty?).uniq
    platform_count = integer(row["platform_count"])
    valid = row["facility_slug"] == slug && source_count && platform_count == listed.length && source_count <= full
    valid &&= %w[positive negative mixed neutral].include?(row["signal_direction"])
    valid &&= %w[low medium high].include?(row["contradiction_level"])
    valid &&= %w[strong_signal moderate_signal weak_signal conflicting insufficient].include?(row["review_signal_status"])
    valid &&= %w[white brown clear green other unclear not_applicable].include?(row["color_tag"])
    if row["signal_type"] == "water_texture"
      valid &&= %w[slippery salt_warmth sulfur carbonated].include?(row["water_texture_subtype"])
      valid &&= %w[unclear not_applicable].include?(row["color_tag"])
    else
      valid &&= ["", "not_applicable"].include?(row["water_texture_subtype"].to_s)
    end
    valid &&= row["signal_type"] != "source_flow_claim"
    signal_key = [row["facility_area"], row["signal_type"], row["water_texture_subtype"], row["color_tag"]]
    if signal_keys.include?(signal_key)
      issues << "duplicate_signal_key"
      valid = false
    else
      signal_keys << signal_key
    end
    issues << "invalid_signal_row" unless valid
    valid
  end
  source_floor = full >= 300 ? 10 : 5
  publishable = valid_signal_rows.select do |row|
    truthy?(row["publishable_item"]) && integer(row["source_count"]) >= source_floor && integer(row["source_count"]).fdiv([full, 1].max) >= 0.02 && integer(row["platform_count"]) >= 2
  end
  decision = if full >= 300 && platforms.length >= 3 && publishable.length >= 3 && issues.empty?
               "full"
             elsif full >= 50 && platforms.length >= 2 && publishable.length >= 2 && issues.empty?
               "lite"
             else
               "draft"
             end
  # Draft decisions are internal-only, so their signal rows must not be marked publishable.
  issues << "draft_contains_publishable_signal" if decision == "draft" && signals.any? { |row| truthy?(row["publishable_item"]) }
  evidence = grade(full)
  issues << "a_grade_requires_three_platforms" if full >= 300 && platforms.length < 3
  issues << "b_grade_requires_two_platforms" if full.between?(100, 299) && platforms.length < 2
  issues << "a_or_b_requires_latest_stratum" if %w[A B].include?(evidence) && !latest
  issues << "a_or_b_requires_low_rating_stratum" if %w[A B].include?(evidence) && !low
  status = issues.empty? ? "qa_accepted_#{decision}" : "qa_rework"

  target["pipeline_status"] = status
  target["qa_status"] = status
  target["updated_at_kst"] = now
  target["direct_reviews_read"] = full.to_s
  target["notes"] = issues.empty? ? "Canonical QA accepted; decision=#{decision}." : "QA rework required: #{issues.uniq.join('|')}"

  pools = mapping["google_maps"] || {}
  google = integer(pools["visible_review_count"]) || 0
  nifty = integer((mapping["nifty_onsen"] || {})["visible_review_count"]) || 0
  yahoo = integer((mapping["yahoo_map"] || {})["visible_review_count"]) || 0
  locked = [google, nifty, yahoo].all? { |count| count.positive? } ? "locked_google_nifty_yahoo" : "not_locked_or_partial"
  {
    "candidate_slug" => slug,
    "official_name_ja" => target.fetch("japanese_name"),
    "google_visible_pool" => google,
    "nifty_visible_pool" => nifty,
    "yahoo_visible_pool" => yahoo,
    "locked_pool_status" => locked,
    "locked_pool_sum" => locked == "locked_google_nifty_yahoo" ? google + nifty + yahoo : "",
    "ledger_rows" => ledger.length,
    "full_body_direct_reviews" => full,
    "partial_review_rows_excluded" => partial,
    "korean_context_bodies_excluded" => korean_context,
    "facility_related_direct_reviews" => full,
    "dayuse_only_direct_reviews" => dayuse,
    "late_hour_or_airport_facility_use_reviews" => late,
    "lodging_bath_only_direct_reviews" => lodging,
    "evidence_grade" => evidence,
    "readiness" => decision == "draft" ? "research_reinforcement" : "qa_accepted_#{decision}",
    "p0_decision" => decision,
    "qa_status" => status,
    "artifact_directory" => target.fetch("output_directory"),
    "direct_body_platform_count" => platforms.length,
    "korean_full_body_direct_reviews" => korean_eligible,
    "latest_stratum_seen" => latest.to_s,
    "low_rating_stratum_seen" => low.to_s,
    "official_water_profile_status" => water_status(mapping),
    "review_signal_contract_status" => issues.empty? ? "canonical_contract_checked" : "qa_rework_required",
    "forbidden_review_signal_rows" => 0,
    "forbidden_review_tags" => "[]",
    "legacy_water_method_fields" => 0,
    "invalid_review_signal_rows" => issues.count { |issue| issue == "invalid_signal_row" },
    "qa_issue_count" => issues.uniq.length,
    "qa_issues" => issues.uniq.join("|")
  }
end

write_csv(RUNTIME, runtime.first.keys, runtime)
suffix = options[:slug] ? "_#{options[:slug]}" : ""
output = File.join(PIPELINE, "kansai_sanin_setouchi_facility_#{options[:batch]}#{suffix}_qa_#{DATE}.csv")
write_csv(output, qa_headers, qa_rows)
puts "wrote #{output} accepted=#{qa_rows.count { |row| row.fetch('qa_status').start_with?('qa_accepted') }} rework=#{qa_rows.count { |row| row.fetch('qa_status') == 'qa_rework' }}"
