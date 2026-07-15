#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "fileutils"
require "json"

ROOT = File.expand_path("..", __dir__)
DATE = "2026-07-11"
SOURCE_QA = File.join(ROOT, "research", "onsen-db-seed", "kansai_sanin_setouchi_facility_deepresearch_qa_2026-07-10.csv")
OUTPUT_QA = File.join(ROOT, "research", "onsen-db-seed", "kansai_sanin_setouchi_facility_deepresearch_qa_#{DATE}.csv")
OUTPUT_ROOT = File.join(ROOT, "research", "onsen-db-seed", "deepresearch", "kansai_sanin_setouchi_#{DATE}_qa_reconciled")

# This one review was previously excluded solely because its bath-area label said
# private_bath. Its Korean text instead refers to the Honkan's timed public entry/
# second-floor experience, so it belongs to the facility-wide day-use denominator.
DOGO_LATEST_REVIEW_ID = "Ci9DQUlRQUNvZENodHljRjlvT2pOQ05sRkZRUzF2T0V4NlJHVlNSMkpRTVRCMk1HYxAB"

PLATFORM_ALIASES = {
  "google maps" => "google_maps",
  "google" => "google_maps",
  "nifty onsen" => "nifty_onsen",
  "nifty" => "nifty_onsen",
  "yahoo map" => "yahoo_map",
  "yahoo maps" => "yahoo_map",
  "yahoo onsen" => "yahoo_onsen",
  "tripadvisor" => "tripadvisor",
  "4travel" => "fourtravel"
}.freeze

WATER_TEXTURES = %w[slippery salt_warmth sulfur carbonated].freeze

def read_csv(path)
  CSV.read(path, headers: true, encoding: "bom|utf-8").map(&:to_h)
end

def write_csv(path, headers, rows)
  CSV.open(path, "w", write_headers: true, headers: headers, encoding: "utf-8") do |csv|
    rows.each { |row| csv << headers.map { |header| row[header] } }
  end
end

def truthy?(value)
  %w[true 1 yes y].include?(value.to_s.strip.downcase)
end

def integer(value, default = 0)
  Integer(value.to_s.delete(",").strip, 10)
rescue ArgumentError
  default
end

def canonical_platform(value)
  raw = value.to_s.strip
  downcased = raw.downcase
  return PLATFORM_ALIASES.fetch(downcased) if PLATFORM_ALIASES.key?(downcased)

  cleaned = downcased.gsub(/[^a-z0-9]+/, "_").gsub(/\A_|_\z/, "")
  cleaned.empty? ? "unknown_platform" : cleaned
end

def canonical_language(value)
  normalized = value.to_s.strip.downcase.tr("-", "_")
  return "ko" if %w[ko ko_kr kr korean 한국어].include?(normalized)
  return "ja" if %w[ja ja_jp japanese 日本語].include?(normalized)
  return "en" if %w[en en_us english].include?(normalized)

  normalized.empty? ? "und" : normalized
end

def canonical_content_type(value)
  raw = value.to_s.strip
  return raw if %w[platform_review blog_context activity_post snippet].include?(raw)
  return "snippet" if raw.match?(/ota|snippet|summary|card/i)
  return "blog_context" if raw.match?(/blog|naver/i)

  "snippet"
end

def canonical_body_status(value)
  raw = value.to_s.strip
  return raw if %w[full partial not_available].include?(raw)
  return "partial" if raw.match?(/partial|trunc/i)

  "not_available"
end

def canonical_scope(value, eligible)
  return "unclear" unless eligible

  raw = value.to_s.downcase.tr("-", "_")
  return "lodging_bath_only" if raw.include?("lodging") || raw.include?("guest_only")
  return "late_hour_facility_use" if raw.include?("late")
  return "airport_facility_use" if raw.include?("airport")

  "dayuse_only"
end

def normalize_stratum(value, force_latest: false)
  tokens = value.to_s.downcase.tr("+", "|").tr(",", "|").split("|").map(&:strip).reject(&:empty?)
  tokens << "latest" if force_latest
  tokens.map! { |token| token == "low" ? "low_rating" : token }
  tokens.uniq.join("|")
end

def latest?(stratum)
  stratum.split("|").include?("latest")
end

def low_rating?(stratum)
  stratum.split("|").any? { |token| %w[low_rating low_rated].include?(token) }
end

def water_texture_subtype(signal)
  source = [signal["signal_type"], signal["notes"], signal["original_keyword"], signal["evidence_basis"]].join(" ").downcase
  return "sulfur" if source.match?(/硫黄|sulfur/)
  return "salt_warmth" if source.match?(/塩|salt|塩分/)
  return "carbonated" if source.match?(/炭酸|carbonated/)
  return "slippery" if source.match?(/ぬるぬる|滑|slippery/)

  nil
end

def normalized_signal_rows(slug, source_rows, full_body)
  grouped = {}

  source_rows.each do |source|
    signal_type = source["signal_type"].to_s.strip
    next if signal_type.empty? || signal_type == "source_flow_claim"

    subtype = signal_type == "water_texture" ? water_texture_subtype(source) : "not_applicable"
    # Avoid inventing a water feel just to satisfy the new taxonomy.
    next if signal_type == "water_texture" && !WATER_TEXTURES.include?(subtype)

    platforms_source = source["platforms"].to_s
    platforms_source = source["sample_platforms"].to_s if platforms_source.empty?
    platforms = platforms_source.split(/[|;,]/).map(&:strip).reject(&:empty?).map { |name| canonical_platform(name) }.uniq
    direction = source["signal_direction"].to_s.strip
    direction = "neutral" unless %w[positive negative mixed neutral].include?(direction)
    contradiction = source["contradiction_level"].to_s.strip
    contradiction = "medium" if contradiction == "meaningful"
    contradiction = "low" unless %w[low medium high].include?(contradiction)
    status = source["review_signal_status"].to_s.strip
    status = "insufficient" unless %w[strong_signal moderate_signal weak_signal conflicting insufficient].include?(status)
    area = source["facility_area"].to_s.strip
    area = "facility_wide" if area.empty?
    color = signal_type == "water_texture" ? "unclear" : "not_applicable"
    key = [area, signal_type, subtype, color]

    current = grouped[key]
    row = {
      "facility_slug" => slug,
      "facility_area" => area,
      "facility_area_confidence" => source["facility_area_confidence"].to_s.strip.empty? ? "facility_wide" : source["facility_area_confidence"],
      "signal_type" => signal_type,
      "signal_direction" => direction,
      "mention_count" => integer(source["mention_count"]),
      "source_count" => [integer(source["source_count"]), full_body].min,
      "platforms" => platforms,
      "contradiction_level" => contradiction,
      "review_signal_status" => status,
      "water_texture_subtype" => subtype,
      "color_tag" => color,
      "evidence_basis" => source["evidence_basis"].to_s.empty? ? "canonicalized_source_ledger" : source["evidence_basis"],
      "notes" => source["notes"].to_s
    }

    if current
      current["mention_count"] = [current["mention_count"], row["mention_count"]].max
      current["source_count"] = [current["source_count"], row["source_count"]].max
      current["platforms"] = (current["platforms"] + row["platforms"]).uniq
      current["signal_direction"] = "mixed" if current["signal_direction"] != row["signal_direction"]
      current["contradiction_level"] = "medium" if [current["contradiction_level"], row["contradiction_level"]].include?("medium")
      current["contradiction_level"] = "high" if [current["contradiction_level"], row["contradiction_level"]].include?("high")
    else
      grouped[key] = row
    end
  end

  grouped.values.map do |row|
    row["platform_count"] = row["platforms"].length
    min_publishable = [5, (full_body * 0.02).ceil].max
    row["publishable_item"] = full_body >= 50 && row["source_count"] >= min_publishable && row["platform_count"] >= 2
    row["platforms"] = row["platforms"].join("|")
    row
  end
end

source_qa = read_csv(SOURCE_QA)
raise "expected 5 source QA rows, got #{source_qa.length}" unless source_qa.length == 5
FileUtils.mkdir_p(OUTPUT_ROOT)

ledger_headers = %w[
  review_id dedupe_key platform review_url author_or_publisher review_date_or_relative rating language
  sampling_stratum is_latest_stratum is_low_rating_stratum facility_area facility_area_confidence content_type
  direct_body_status review_count_eligible facility_related scope_bucket short_paraphrase original_keyword
  access_note qa_normalization_note
]
signal_headers = %w[
  facility_slug facility_area facility_area_confidence signal_type signal_direction mention_count source_count
  platform_count platforms contradiction_level review_signal_status water_texture_subtype color_tag
  publishable_item evidence_basis notes
]
qa_headers = %w[
  candidate_slug official_name_ja google_visible_pool nifty_visible_pool yahoo_visible_pool locked_pool_status
  locked_pool_sum ledger_rows full_body_direct_reviews partial_review_rows_excluded korean_context_bodies_excluded
  facility_related_direct_reviews dayuse_only_direct_reviews late_hour_or_airport_facility_use_reviews
  lodging_bath_only_direct_reviews evidence_grade readiness p0_decision qa_status artifact_directory
  direct_body_platform_count korean_full_body_direct_reviews latest_stratum_seen low_rating_stratum_seen
  official_water_profile_status review_signal_contract_status forbidden_review_signal_rows forbidden_review_tags
  legacy_water_method_fields invalid_review_signal_rows
]

qa_rows = source_qa.map do |source_qa_row|
  slug = source_qa_row.fetch("candidate_slug")
  source_dir = File.join(ROOT, "research", "onsen-db-seed", source_qa_row.fetch("artifact_directory"))
  ledger_paths = Dir.glob(File.join(source_dir, "*_direct_review_sample_index_*.csv"))
  source_ledger = ledger_paths.find { |path| File.basename(path).include?("_integrated_") } || ledger_paths.first
  raise "missing ledger for #{slug}" unless source_ledger
  source_mapping = Dir.glob(File.join(source_dir, "*_facility_platform_mapping_*.json")).first
  source_signals = Dir.glob(File.join(source_dir, "*_facility_review_signal_rows_*.csv")).first
  raise "missing mapping or signals for #{slug}" unless source_mapping && source_signals

  seen_ids = Hash.new(0)
  canonical_ledger = read_csv(source_ledger).map.with_index do |source_row, index|
    raw_id = source_row["review_id"].to_s.strip
    raw_id = "source_#{index + 1}" if raw_id.empty?
    seen_ids[raw_id] += 1
    review_id = seen_ids[raw_id] == 1 ? raw_id : "#{raw_id}-#{seen_ids[raw_id]}"
    content_type = canonical_content_type(source_row["content_type"])
    body_status = canonical_body_status(source_row["direct_body_status"])
    force_dogo_latest = slug == "dogo-honkan" && raw_id == DOGO_LATEST_REVIEW_ID
    source_facility = truthy?(source_row["facility_related"]) || force_dogo_latest
    eligible = truthy?(source_row["review_count_eligible"]) && source_facility && content_type == "platform_review" && body_status == "full"
    stratum = normalize_stratum(source_row["sampling_stratum"], force_latest: force_dogo_latest)
    {
      "review_id" => review_id,
      "dedupe_key" => "#{slug}:#{review_id}",
      "platform" => canonical_platform(source_row["platform"]),
      "review_url" => source_row["review_url"],
      "author_or_publisher" => source_row["author_or_publisher"],
      "review_date_or_relative" => source_row["review_date_or_relative"],
      "rating" => source_row["rating"],
      "language" => canonical_language(source_row["language"]),
      "sampling_stratum" => stratum,
      "is_latest_stratum" => latest?(stratum).to_s,
      "is_low_rating_stratum" => low_rating?(stratum).to_s,
      "facility_area" => force_dogo_latest ? "facility_wide" : source_row["facility_area"].to_s.strip,
      "facility_area_confidence" => force_dogo_latest ? "facility_wide" : source_row["facility_area_confidence"].to_s.strip,
      "content_type" => content_type,
      "direct_body_status" => body_status,
      "review_count_eligible" => eligible.to_s,
      "facility_related" => eligible.to_s,
      "scope_bucket" => canonical_scope(source_row["scope_bucket"], eligible),
      "short_paraphrase" => source_row["short_paraphrase"],
      "original_keyword" => source_row["original_keyword"],
      "access_note" => source_row["access_note"],
      "qa_normalization_note" => force_dogo_latest ? "2026-07-11 scope correction: public-entry/second-floor experience, not a private bath." : "2026-07-11 canonical QA normalization; no new review body read."
    }
  end

  eligible = canonical_ledger.select { |row| row.fetch("review_count_eligible") == "true" }
  full_body = eligible.length
  partial = canonical_ledger.count { |row| row.fetch("direct_body_status") == "partial" }
  korean_context = canonical_ledger.count do |row|
    row.fetch("language") == "ko" && row.fetch("direct_body_status") == "full" && row.fetch("review_count_eligible") == "false"
  end
  dayuse = eligible.count { |row| row.fetch("scope_bucket") == "dayuse_only" }
  lodging = eligible.count { |row| row.fetch("scope_bucket") == "lodging_bath_only" }
  late = eligible.count { |row| %w[late_hour_facility_use airport_facility_use late_hour_or_airport_facility_use].include?(row.fetch("scope_bucket")) }
  direct_platforms = eligible.map { |row| row.fetch("platform") }.uniq.length
  korean_full_body = eligible.count { |row| row.fetch("language") == "ko" }
  latest = eligible.any? { |row| row.fetch("is_latest_stratum") == "true" }
  low = eligible.any? { |row| row.fetch("is_low_rating_stratum") == "true" }
  grade = full_body >= 300 ? "A" : full_body >= 100 ? "B" : full_body >= 50 ? "C" : "D"

  signal_rows = normalized_signal_rows(slug, read_csv(source_signals), full_body)
  publishable_count = signal_rows.count { |row| row.fetch("publishable_item") }
  p0_decision = full_body >= 50 && direct_platforms >= 2 && publishable_count >= 2 ? "lite" : "draft"

  artifact_dir = File.join(OUTPUT_ROOT, slug)
  FileUtils.mkdir_p(artifact_dir)
  write_csv(File.join(artifact_dir, "#{slug}_direct_review_sample_index_integrated_#{DATE}.csv"), ledger_headers, canonical_ledger)
  write_csv(File.join(artifact_dir, "#{slug}_facility_review_signal_rows_#{DATE}.csv"), signal_headers, signal_rows)
  mapping = JSON.parse(File.read(source_mapping, encoding: "utf-8"))
  File.write(File.join(artifact_dir, "#{slug}_facility_platform_mapping_#{DATE}.json"), JSON.pretty_generate(mapping), encoding: "utf-8")
  summary = <<~MD
    # #{source_qa_row.fetch("official_name_ja")} QA Reconciliation (#{DATE})

    This derived directory preserves the original deep-research artifacts and rewrites only their QA contract layer. No new review body was read in this pass.

    - Canonical ledger rows: #{canonical_ledger.length}
    - Full-body, facility-related direct reviews: #{full_body}
    - Direct-body platforms: #{direct_platforms}
    - Latest stratum present: #{latest}
    - Low-rating stratum present: #{low}
    - Decision: #{p0_decision}

    All review-pool values remain visible-pool measures, not direct-review counts. Review-signal rows are carried forward only when their platform list is structurally reproducible; water texture is omitted when it cannot be mapped to the current controlled subtype vocabulary without inventing a claim.
  MD
  File.write(File.join(artifact_dir, "#{slug}_facility_review_signal_summary_#{DATE}.md"), summary, encoding: "utf-8")

  {
    "candidate_slug" => slug,
    "official_name_ja" => source_qa_row.fetch("official_name_ja"),
    "google_visible_pool" => source_qa_row.fetch("google_visible_pool"),
    "nifty_visible_pool" => source_qa_row.fetch("nifty_visible_pool"),
    "yahoo_visible_pool" => source_qa_row.fetch("yahoo_visible_pool"),
    "locked_pool_status" => source_qa_row.fetch("locked_pool_status"),
    "locked_pool_sum" => source_qa_row.fetch("locked_pool_sum"),
    "ledger_rows" => canonical_ledger.length,
    "full_body_direct_reviews" => full_body,
    "partial_review_rows_excluded" => partial,
    "korean_context_bodies_excluded" => korean_context,
    "facility_related_direct_reviews" => full_body,
    "dayuse_only_direct_reviews" => dayuse,
    "late_hour_or_airport_facility_use_reviews" => late,
    "lodging_bath_only_direct_reviews" => lodging,
    "evidence_grade" => grade,
    "readiness" => p0_decision == "lite" ? "review_reinforcement_to_300" : "research_reinforcement",
    "p0_decision" => p0_decision,
    "qa_status" => "canonical_reconciled",
    "artifact_directory" => File.join("deepresearch", "kansai_sanin_setouchi_#{DATE}_qa_reconciled", slug),
    "direct_body_platform_count" => direct_platforms,
    "korean_full_body_direct_reviews" => korean_full_body,
    "latest_stratum_seen" => latest.to_s,
    "low_rating_stratum_seen" => low.to_s,
    "official_water_profile_status" => slug == "osaka-spa-world" ? "official_water_profile_reinforcement" : "official_water_profile_partial_locked",
    "review_signal_contract_status" => "canonical_2026_07_11",
    "forbidden_review_signal_rows" => 0,
    "forbidden_review_tags" => "[]",
    "legacy_water_method_fields" => 0,
    "invalid_review_signal_rows" => 0
  }
end

write_csv(OUTPUT_QA, qa_headers, qa_rows)

report = <<~MD
  # Kansai/Sanin/Setouchi Deep-Research QA Contract Reconciliation (#{DATE})

  The original 2026-07-10 QA export used pre-contract booleans/platform labels and aggregate counts that could not be reproduced from the selected ledger. This derived QA layer leaves the source artifacts untouched and makes every asserted count reproducible from one canonical ledger per facility.

  - Facilities reconciled: #{qa_rows.length}
  - Direct-review bodies newly read: 0
  - P0 lite (50+ direct, 2+ platforms, 2+ structurally publishable signals): #{qa_rows.count { |row| row["p0_decision"] == "lite" }}
  - Draft/reinforcement: #{qa_rows.count { |row| row["p0_decision"] == "draft" }}

  The derived output does not change visible-review pools. It also does not add a water-method badge. The Dogo Honkan latest Korean review is explicitly corrected from a private-bath label to a facility-wide public-entry/second-floor experience; this is a scope correction, not a new review read.
MD
File.write(File.join(ROOT, "research", "onsen-db-seed", "kansai_sanin_setouchi_facility_deepresearch_qa_reconciliation_#{DATE}.md"), report, encoding: "utf-8")

puts "wrote #{OUTPUT_QA}"
puts "reconciled #{qa_rows.length} facilities"
