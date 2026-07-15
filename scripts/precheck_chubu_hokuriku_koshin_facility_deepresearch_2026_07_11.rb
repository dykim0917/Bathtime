#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "json"
require "optparse"

DATE = "2026-07-11"
ROOT = "research/onsen-db-seed/chubu-hokuriku-koshin-facility-pipeline-#{DATE}"
RUNTIME = File.join(ROOT, "chubu_hokuriku_koshin_facility_deepresearch_runtime_manifest_#{DATE}.csv")
OUTPUT = File.join(ROOT, "chubu_hokuriku_koshin_facility_deepresearch_precheck_#{DATE}.csv")

LEDGER_HEADERS = %w[
  review_id platform review_url author_or_publisher review_date_or_relative rating language sampling_stratum
  facility_area facility_area_confidence content_type direct_body_status review_count_eligible facility_related
  scope_bucket dedupe_key short_paraphrase original_keyword access_note
].freeze
SIGNAL_HEADERS = %w[
  facility_slug facility_area facility_area_confidence signal_type signal_direction mention_count source_count
  platform_count platforms water_texture_subtype color_tag contradiction_level review_signal_status publishable_item
  short_interpretation
].freeze

options = { slugs: [] }
OptionParser.new do |parser|
  parser.on("--slug SLUG", "Precheck one candidate; repeatable") { |slug| options[:slugs] << slug }
end.parse!

def truthy?(value)
  value.to_s.strip.downcase == "true"
end

def integer?(value)
  Integer(value.to_s, 10)
  true
rescue ArgumentError
  false
end

def expected_grade(count)
  return "A" if count >= 300
  return "B" if count >= 100
  return "C" if count >= 50

  "D"
end

def stratum_seen?(rows, name)
  rows.any? do |row|
    explicit = name == "latest" ? row["is_latest_stratum"] : row["is_low_rating_stratum"]
    next true if truthy?(explicit)

    tokens = row["sampling_stratum"].to_s.downcase.tr("-", "_").split(/[;|,]/).map(&:strip)
    name == "latest" ? tokens.include?("latest") : (tokens & %w[low_rating low_rated low]).any?
  end
end

runtime = CSV.read(RUNTIME, headers: true, encoding: "bom|utf-8").map(&:to_h)
selected = runtime.select { |row| options[:slugs].empty? || options[:slugs].include?(row.fetch("candidate_slug")) }
abort("No matching runtime rows.") if selected.empty?

output_rows = selected.map do |runtime_row|
  slug = runtime_row.fetch("candidate_slug")
  relative_directory = runtime_row.fetch("output_directory")
  directory = File.join(ROOT, relative_directory)
  issues = []
  counts = { ledger: 0, eligible: 0, platforms: 0, korean: 0, partial: 0, grade: "", latest: false, low: false, publishable: 0 }

  files = {
    mapping: Dir.glob(File.join(directory, "#{slug}_facility_platform_mapping_#{DATE}.json")),
    ledger: Dir.glob(File.join(directory, "#{slug}_direct_review_sample_index_#{DATE}.csv")),
    signals: Dir.glob(File.join(directory, "#{slug}_facility_review_signal_rows_#{DATE}.csv")),
    summary: Dir.glob(File.join(directory, "#{slug}_facility_review_signal_summary_#{DATE}.md"))
  }
  files.each do |kind, paths|
    issues << "#{kind}_count=#{paths.length}" unless paths.length == 1
  end

  begin
    JSON.parse(File.read(files[:mapping].first)) if files[:mapping].length == 1
  rescue JSON::ParserError
    issues << "invalid_mapping_json"
  end

  if files[:ledger].length == 1
    ledger = CSV.read(files[:ledger].first, headers: true, encoding: "bom|utf-8")
    missing = LEDGER_HEADERS - ledger.headers
    issues << "ledger_missing=#{missing.join('|')}" unless missing.empty?
    counts[:ledger] = ledger.length
    %w[review_id dedupe_key].each do |field|
      values = ledger.map { |row| row[field].to_s.strip }
      issues << "blank_#{field}" if values.any?(&:empty?)
      issues << "duplicate_#{field}" unless values.uniq.length == values.length
    end
    ledger.each do |row|
      issues << "invalid_content_type" unless %w[platform_review blog_context activity_post snippet].include?(row["content_type"])
      issues << "invalid_direct_body_status" unless %w[full partial not_available].include?(row["direct_body_status"])
      %w[review_count_eligible facility_related].each do |field|
        issues << "invalid_#{field}" unless %w[true false].include?(row[field])
      end
      issues << "invalid_platform" unless row["platform"].to_s.match?(/\A[a-z0-9_]+\z/)
      issues << "invalid_scope" unless row["scope_bucket"].to_s.match?(/\A[a-z0-9_]+\z/)
    end
    eligible = ledger.select { |row| truthy?(row["review_count_eligible"]) }
    eligible.each do |row|
      issues << "eligible_not_full_platform_review" unless row["content_type"] == "platform_review" && row["direct_body_status"] == "full"
      issues << "eligible_not_facility_related" unless truthy?(row["facility_related"])
      issues << "eligible_not_dayuse_only" unless row["scope_bucket"] == "dayuse_only"
    end
    counts[:eligible] = eligible.length
    counts[:platforms] = eligible.map { |row| row["platform"] }.uniq.length
    counts[:korean] = eligible.count { |row| row["language"].to_s.downcase.tr("-", "_").match?(/\A(?:ko|ko_kr|korean|한국어)\z/) }
    counts[:partial] = ledger.count { |row| row["direct_body_status"] == "partial" }
    counts[:grade] = expected_grade(counts[:eligible])
    counts[:latest] = stratum_seen?(eligible, "latest")
    counts[:low] = stratum_seen?(eligible, "low_rating")
  end

  if files[:signals].length == 1
    signals = CSV.read(files[:signals].first, headers: true, encoding: "bom|utf-8")
    missing = SIGNAL_HEADERS - signals.headers
    issues << "signal_missing=#{missing.join('|')}" unless missing.empty?
    keys = []
    signals.each do |row|
      issues << "signal_slug_mismatch" unless row["facility_slug"] == slug
      %w[mention_count source_count platform_count].each { |field| issues << "signal_#{field}_not_integer" unless integer?(row[field]) }
      source_count = row["source_count"].to_i
      platform_count = row["platform_count"].to_i
      listed = row["platforms"].to_s.split("|").map(&:strip).reject(&:empty?).uniq
      issues << "signal_source_exceeds_eligible" if source_count > counts[:eligible]
      issues << "signal_platform_count_mismatch" unless platform_count == listed.length
      issues << "source_flow_claim_forbidden" if row["signal_type"] == "source_flow_claim"
      issues << "invalid_signal_direction" unless %w[positive negative mixed neutral].include?(row["signal_direction"])
      issues << "invalid_contradiction" unless %w[low medium high].include?(row["contradiction_level"])
      issues << "invalid_signal_status" unless %w[strong_signal moderate_signal weak_signal conflicting insufficient].include?(row["review_signal_status"])
      issues << "invalid_color" unless %w[white brown clear green other unclear not_applicable].include?(row["color_tag"])
      subtype = row["water_texture_subtype"].to_s.strip
      if row["signal_type"] == "water_texture"
        issues << "water_texture_subtype_missing" unless %w[slippery salt_warmth sulfur carbonated].include?(subtype)
        issues << "water_texture_color_mixed" unless %w[unclear not_applicable].include?(row["color_tag"])
      elsif !["", "not_applicable"].include?(subtype)
        issues << "non_texture_subtype_present"
      end
      key = [row["facility_area"], row["signal_type"], subtype, row["color_tag"]]
      issues << "duplicate_signal_key" if keys.include?(key)
      keys << key
      counts[:publishable] += 1 if truthy?(row["publishable_item"])
    end
  end

  decision = if counts[:eligible] >= 300 && counts[:platforms] >= 3 && counts[:latest] && counts[:low] && counts[:publishable] >= 3
               "full"
             elsif counts[:eligible] >= 50 && counts[:platforms] >= 2 && counts[:latest] && counts[:low] && counts[:publishable] >= 2
               "lite"
             else
               "draft"
             end
  {
    "candidate_slug" => slug,
    "artifact_directory" => relative_directory,
    "ledger_rows" => counts[:ledger],
    "eligible_dayuse_direct_reviews" => counts[:eligible],
    "direct_body_platform_count" => counts[:platforms],
    "korean_full_body_direct_reviews" => counts[:korean],
    "partial_rows" => counts[:partial],
    "evidence_grade" => counts[:grade],
    "latest_stratum_seen" => counts[:latest],
    "low_rating_stratum_seen" => counts[:low],
    "publishable_signal_rows" => counts[:publishable],
    "suggested_decision" => decision,
    "precheck_status" => issues.empty? ? "passed" : "qa_rework",
    "issues" => issues.uniq.join("|")
  }
end

headers = output_rows.first.keys
CSV.open(OUTPUT, "w", write_headers: true, headers: headers, encoding: "utf-8") do |csv|
  output_rows.each { |row| csv << headers.map { |header| row[header] } }
end

failed = output_rows.count { |row| row["precheck_status"] != "passed" }
puts "Prechecked #{output_rows.length} candidates; #{failed} require rework."
exit(failed.zero? ? 0 : 1)
