#!/usr/bin/env ruby

require "csv"
require "json"
require "pathname"

DATE = "2026-07-11"
ROOT = Pathname.new(File.expand_path("../research/onsen-db-seed", __dir__))
MANIFEST = ROOT.join("tohoku_facility_deepresearch_runtime_manifest_#{DATE}.csv")
DEFAULT_OUTPUT = ROOT.join("tohoku_facility_deepresearch_qa_#{DATE}.csv")
REPO_ROOT = ROOT.parent.parent

FIELDS = %w[
  candidate_slug
  google_visible_pool
  nifty_visible_pool
  yahoo_visible_pool
  locked_pool_status
  locked_pool_sum
  ledger_rows
  full_body_direct_reviews
  partial_review_rows_excluded
  korean_context_bodies_excluded
  facility_related_direct_reviews
  dayuse_only_direct_reviews
  late_hour_or_airport_facility_use_reviews
  lodging_bath_only_direct_reviews
  evidence_grade
  readiness
  p0_decision
  qa_status
  artifact_directory
  direct_body_platform_count
  korean_full_body_direct_reviews
  latest_stratum_seen
  low_rating_stratum_seen
  official_water_profile_status
  review_signal_contract_status
  forbidden_review_signal_rows
  forbidden_review_tags
  legacy_water_method_fields
  invalid_review_signal_rows
].freeze

def truthy?(value)
  value.to_s.strip.downcase == "true"
end

def grade(count)
  return "A" if count >= 300
  return "B" if count >= 100
  return "C" if count >= 50

  "D"
end

def stratum_seen?(row, stratum)
  explicit = stratum == "latest" ? "is_latest_stratum" : "is_low_rating_stratum"
  return true if truthy?(row[explicit])

  tokens = row["sampling_stratum"].to_s.downcase.tr("-", "_").split(/[;|,]/).map(&:strip)
  return (tokens & %w[low_rating low_rated low]).any? if stratum == "low_rating"

  tokens.include?(stratum)
end

def canonical_files(directory)
  ledgers = directory.glob("*_direct_review_sample_index_*.csv")
  integrated = ledgers.select { |path| path.basename.to_s.include?("_integrated_") }
  {
    mapping: directory.glob("*_facility_platform_mapping_#{DATE}.json"),
    ledger: integrated.empty? ? ledgers : integrated,
    signals: directory.glob("*_facility_review_signal_rows_#{DATE}.csv"),
    summary: directory.glob("*_facility_review_signal_summary_#{DATE}.md")
  }
end

def platform_entries(mapping)
  raw = mapping["platforms"] || mapping["review_pools"]
  return raw if raw.is_a?(Array)
  if raw.is_a?(Hash)
    return raw.map do |platform, value|
      value.is_a?(Hash) ? value.merge("platform" => platform) : { "platform" => platform, "visible_review_count" => value }
    end
  end

  review_pool_lock = mapping["review_pool_lock"]
  return review_pool_lock if review_pool_lock.is_a?(Array)

  lock_platforms = review_pool_lock.is_a?(Hash) ? review_pool_lock["platforms"] : nil
  return lock_platforms if lock_platforms.is_a?(Array)
  if review_pool_lock.is_a?(Hash)
    keyed_locks = review_pool_lock.select { |_, value| value.is_a?(Hash) }
    unless keyed_locks.empty?
      return keyed_locks.map { |platform, value| value.merge("platform" => platform) }
    end
  end

  pools = mapping["visible_review_pools"]
  return pools if pools.is_a?(Array)

  if pools.is_a?(Hash)
    return pools.map do |platform, value|
      value.is_a?(Hash) ? value.merge("platform" => platform) : { "platform" => platform, "visible_review_count" => value }
    end
  end

  pool_locks = mapping["review_pool_locks"]
  if pool_locks.is_a?(Hash)
    return pool_locks.map do |platform, value|
      value.is_a?(Hash) ? value.merge("platform" => platform) : { "platform" => platform, "visible_review_count" => value }
    end
  end

  locked_visible = mapping["locked_visible_pool"]
  if locked_visible.is_a?(Hash)
    return locked_visible.map do |platform, value|
      value.is_a?(Hash) ? value.merge("platform" => platform) : { "platform" => platform, "visible_review_count" => value }
    end
  end

  locked_sources = mapping.dig("locked_review_pools", "sources")
  return locked_sources if locked_sources.is_a?(Array)

  pool_lock_platforms = mapping.dig("pool_lock", "platforms")
  return pool_lock_platforms if pool_lock_platforms.is_a?(Array)

  visible_pool_lock = mapping["visible_pool_lock"]
  if visible_pool_lock.is_a?(Hash)
    keyed_locks = visible_pool_lock.select { |_, value| value.is_a?(Hash) }
    unless keyed_locks.empty?
      return keyed_locks.map { |platform, value| value.merge("platform" => platform) }
    end
  end

  []
end

def canonical_platform(value)
  value.to_s.strip.downcase.tr(" -", "__").gsub(/_+/, "_")
end

def visible_pool(mapping, platform)
  entry = platform_entries(mapping).find { |item| canonical_platform(item["platform"]) == platform }
  return 0 unless entry

  (entry["visible_review_count"] || entry["visible_count"] || entry["review_count"] || entry["count"]).to_i
end

def locked_status(mapping)
  explicit = mapping.dig("locked_pool", "status") || mapping.dig("review_pool_lock", "locked_pool_status") || mapping.dig("visible_pool_lock", "locked_pool_status")
  explicit ||= mapping.dig("locked_review_pools", "locked_pool_status")
  explicit ||= mapping.dig("pool_lock", "locked_pool_status")
  return "locked_google_nifty_yahoo" if explicit.to_s == "locked_google_nifty_yahoo"
  return "locked_google_nifty_yahoo" if mapping.key?("locked_visible_pool") && mapping["locked_pool_sum"].to_i.positive?

  platforms = %w[google_maps nifty_onsen yahoo_map]
  locked = platform_entries(mapping).select do |item|
    platforms.include?(canonical_platform(item["platform"])) &&
      (%w[locked locked_zero_pool].include?(item["pool_status"].to_s) ||
        item.key?("visible_review_count") ||
        item.key?("visible_count"))
  end.map { |item| canonical_platform(item["platform"]) }

  return "locked_google_nifty_yahoo" if (platforms - locked).empty?

  "not_locked_incomplete_platforms"
end

def official_water_status(mapping)
  profile = mapping["official_water_profile"] || mapping["official_bath_facts_seen"] || {}
  status = profile["status"].to_s.strip
  return status unless status.empty?

  profile.empty? ? "not_confirmed" : "official_profile_seen"
end

def signal_contract_status(signal_rows)
  forbidden = signal_rows.count { |row| row["signal_type"].to_s == "source_flow_claim" }
  invalid = invalid_signal_rows(signal_rows)
  forbidden.zero? && invalid.zero? ? "valid" : "invalid"
end

def invalid_signal_rows(signal_rows)
  seen = {}
  signal_rows.count do |row|
    invalid = false
    invalid ||= row["facility_slug"].to_s.strip.empty?
    invalid ||= row["signal_type"].to_s.strip.empty?
    invalid ||= !%w[positive negative mixed neutral].include?(row["signal_direction"].to_s)
    invalid ||= !%w[low medium high].include?(row["contradiction_level"].to_s)
    invalid ||= !%w[strong_signal moderate_signal weak_signal conflicting insufficient].include?(row["review_signal_status"].to_s)
    invalid ||= !%w[white brown clear green other unclear not_applicable].include?(row["color_tag"].to_s)
    texture = row["water_texture_subtype"].to_s
    if row["signal_type"].to_s == "water_texture"
      invalid ||= !%w[slippery salt_warmth sulfur carbonated].include?(texture)
      invalid ||= !%w[unclear not_applicable].include?(row["color_tag"].to_s)
    else
      invalid ||= !["", "not_applicable"].include?(texture)
    end
    key = [row["facility_area"], row["signal_type"], texture, row["color_tag"]]
    invalid ||= seen[key]
    seen[key] = true
    invalid
  end
end

def publishable_count(signal_rows)
  signal_rows.count { |row| truthy?(row["publishable_item"]) }
end

slugs = nil
output = DEFAULT_OUTPUT
ARGV.each do |arg|
  if arg.start_with?("--slugs=")
    slugs = arg.delete_prefix("--slugs=").split(",").map(&:strip)
  elsif arg.start_with?("--output=")
    output = Pathname.new(arg.delete_prefix("--output="))
  end
end

rows = CSV.read(MANIFEST, headers: true).map(&:to_h)
rows = rows.select { |row| slugs.include?(row.fetch("candidate_slug")) } if slugs

qa_rows = rows.map do |manifest|
  slug = manifest.fetch("candidate_slug")
  relative_dir = manifest.fetch("output_directory")
  qa_relative_dir = relative_dir.sub(%r{\Aresearch/onsen-db-seed/}, "")
  directory = if relative_dir.start_with?("research/onsen-db-seed/")
                REPO_ROOT.join(relative_dir)
              else
                ROOT.join(relative_dir)
              end
  next unless directory.directory?

  files = canonical_files(directory)
  next unless files.values.all? { |matches| matches.size == 1 }

  mapping = JSON.parse(files.fetch(:mapping).first.read)
  ledger = CSV.read(files.fetch(:ledger).first, headers: true).map(&:to_h)
  signals = CSV.read(files.fetch(:signals).first, headers: true).map(&:to_h)

  eligible = ledger.select { |row| truthy?(row["review_count_eligible"]) }
  partial = ledger.count { |row| row["direct_body_status"].to_s == "partial" }
  korean_context = ledger.count do |row|
    row["language"].to_s.downcase.tr("-", "_").match?(/\A(?:ko|ko_kr|korean|한국어)\z/) &&
      row["direct_body_status"].to_s == "full" &&
      !truthy?(row["review_count_eligible"])
  end
  dayuse = eligible.count { |row| row["scope_bucket"].to_s == "dayuse_only" }
  lodging = eligible.count { |row| row["scope_bucket"].to_s == "lodging_bath_only" }
  late = eligible.count { |row| %w[late_hour_facility_use airport_facility_use late_hour_or_airport_facility_use].include?(row["scope_bucket"].to_s) }
  direct_platforms = eligible.map { |row| row["platform"].to_s }.reject(&:empty?).uniq.size
  korean_full = eligible.count { |row| row["language"].to_s.downcase.tr("-", "_").match?(/\A(?:ko|ko_kr|korean|한국어)\z/) }
  full_count = eligible.size
  p0 = if full_count >= 300 && direct_platforms >= 3 && publishable_count(signals) >= 3
         "full"
       elsif full_count >= 50 && direct_platforms >= 2 && publishable_count(signals) >= 2
         "lite"
       else
         "draft"
       end
  lock_status = locked_status(mapping)
  google = visible_pool(mapping, "google_maps")
  nifty = visible_pool(mapping, "nifty_onsen")
  yahoo = visible_pool(mapping, "yahoo_map")
  forbidden_rows = signals.count { |row| row["signal_type"].to_s == "source_flow_claim" }
  invalid_rows = invalid_signal_rows(signals)

  {
    "candidate_slug" => slug,
    "google_visible_pool" => google,
    "nifty_visible_pool" => nifty,
    "yahoo_visible_pool" => yahoo,
    "locked_pool_status" => lock_status,
    "locked_pool_sum" => lock_status == "locked_google_nifty_yahoo" ? google + nifty + yahoo : "",
    "ledger_rows" => ledger.size,
    "full_body_direct_reviews" => full_count,
    "partial_review_rows_excluded" => partial,
    "korean_context_bodies_excluded" => korean_context,
    "facility_related_direct_reviews" => eligible.size,
    "dayuse_only_direct_reviews" => dayuse,
    "late_hour_or_airport_facility_use_reviews" => late,
    "lodging_bath_only_direct_reviews" => lodging,
    "evidence_grade" => grade(full_count),
    "readiness" => p0 == "draft" ? "needs_reinforcement_or_scope_hold" : "qa_recalculate_ready",
    "p0_decision" => p0,
    "qa_status" => "built_from_canonical_ledger",
    "artifact_directory" => qa_relative_dir,
    "direct_body_platform_count" => direct_platforms,
    "korean_full_body_direct_reviews" => korean_full,
    "latest_stratum_seen" => eligible.any? { |row| stratum_seen?(row, "latest") },
    "low_rating_stratum_seen" => eligible.any? { |row| stratum_seen?(row, "low_rating") },
    "official_water_profile_status" => official_water_status(mapping),
    "review_signal_contract_status" => signal_contract_status(signals),
    "forbidden_review_signal_rows" => forbidden_rows,
    "forbidden_review_tags" => forbidden_rows.zero? ? "[]" : "[source_flow_claim]",
    "legacy_water_method_fields" => 0,
    "invalid_review_signal_rows" => invalid_rows
  }
end
qa_rows.compact!

CSV.open(output, "w") do |csv|
  csv << FIELDS
  qa_rows.each { |row| csv << FIELDS.map { |field| row.fetch(field).to_s } }
end

puts "wrote #{qa_rows.size} QA row(s): #{output}"
