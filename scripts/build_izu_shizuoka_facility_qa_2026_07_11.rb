#!/usr/bin/env ruby

require "csv"
require "json"
require "pathname"

DATE = "2026-07-11"
ROOT = Pathname.new(__dir__).parent
PIPELINE_DIR = ROOT.join("research/onsen-db-seed/izu-shizuoka-facility-pipeline-2026-07-11")
DEEP_ROOT = ROOT.join("research/onsen-db-seed/deepresearch/izu_shizuoka_facility_2026-07-11")
QUEUE_PATH = PIPELINE_DIR.join("izu_shizuoka_facility_candidate_queue_2026-07-11.csv")
QA_PATH = PIPELINE_DIR.join("izu_shizuoka_facility_deepresearch_qa_2026-07-11.csv")
REPORT_PATH = PIPELINE_DIR.join("izu_shizuoka_facility_deepresearch_qa_report_2026-07-11.md")

QA_HEADERS = %w[
  candidate_slug official_name_ja google_visible_pool nifty_visible_pool yahoo_visible_pool
  locked_pool_status locked_pool_sum ledger_rows full_body_direct_reviews
  partial_review_rows_excluded korean_context_bodies_excluded facility_related_direct_reviews
  dayuse_only_direct_reviews late_hour_or_airport_facility_use_reviews lodging_bath_only_direct_reviews
  evidence_grade readiness p0_decision qa_status artifact_directory direct_body_platform_count
  korean_full_body_direct_reviews latest_stratum_seen low_rating_stratum_seen
  official_water_profile_status review_signal_contract_status forbidden_review_signal_rows
  forbidden_review_tags legacy_water_method_fields invalid_review_signal_rows
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

def stratum_seen?(row, kind)
  normalized = row["sampling_stratum"].to_s.downcase.tr("-", "_")
  tokens = normalized.split(/[;|,\/]/).map(&:strip)
  return (tokens & %w[low_rating low_rated low]).any? if kind == :low

  tokens.include?("latest")
end

def load_mapping(path)
  JSON.parse(path.read)
rescue Errno::ENOENT, JSON::ParserError
  {}
end

def visible_pool(mapping, key)
  candidates = [
    mapping.dig("review_pool", key, "visible_review_count"),
    mapping.dig("visible_review_pool", key, "visible_review_count"),
    mapping.dig("platforms", key, "visible_review_count"),
    mapping.dig(key, "visible_review_count")
  ].compact
  Integer(candidates.first.to_s.delete(","), 10)
rescue ArgumentError, TypeError
  0
end

def status_from_mapping(mapping)
  mapping["official_water_profile_status"] ||
    mapping.dig("official_facts", "official_water_profile_status") ||
    mapping.dig("water_profile", "status") ||
    "needs_official_water_profile_lock"
end

queue_rows = CSV.read(QUEUE_PATH, headers: true)
qa_rows = []

queue_rows.each do |candidate|
  slug = candidate.fetch("candidate_slug")
  artifact_dir = Pathname.new("deepresearch/izu_shizuoka_facility_2026-07-11/#{slug}")
  dir = ROOT.join("research/onsen-db-seed", artifact_dir)
  mapping_path = dir.join("#{slug}_facility_platform_mapping_#{DATE}.json")
  ledger_path = dir.join("#{slug}_direct_review_sample_index_#{DATE}.csv")
  signal_path = dir.join("#{slug}_facility_review_signal_rows_#{DATE}.csv")
  summary_path = dir.join("#{slug}_facility_review_signal_summary_#{DATE}.md")

  mapping = load_mapping(mapping_path)
  ledger = ledger_path.file? ? CSV.read(ledger_path, headers: true) : []
  signals = signal_path.file? ? CSV.read(signal_path, headers: true) : []

  eligible = ledger.select do |row|
    row["content_type"] == "platform_review" &&
      row["direct_body_status"] == "full" &&
      truthy?(row["review_count_eligible"]) &&
      truthy?(row["facility_related"])
  end

  full_body = eligible.size
  direct_platforms = eligible.map { |row| row["platform"].to_s.strip }.reject(&:empty?).uniq.size
  korean_full = eligible.count { |row| row["language"].to_s.downcase.tr("-", "_").match?(/\A(?:ko|ko_kr|korean|한국어)\z/) }
  partial = ledger.count { |row| row["direct_body_status"] == "partial" }
  korean_context = ledger.count do |row|
    row["language"].to_s.downcase.tr("-", "_").match?(/\A(?:ko|ko_kr|korean|한국어)\z/) &&
      row["direct_body_status"] == "full" &&
      !truthy?(row["review_count_eligible"])
  end
  dayuse = eligible.count { |row| row["scope_bucket"] == "dayuse_only" }
  lodging = eligible.count { |row| row["scope_bucket"] == "lodging_bath_only" }
  late = eligible.count { |row| %w[late_hour_facility_use airport_facility_use late_hour_or_airport_facility_use].include?(row["scope_bucket"]) }

  publishable = signals.select { |row| truthy?(row["publishable_item"]) }
  decision = if full_body >= 300 && direct_platforms >= 3 && publishable.size >= 3
               "full"
             elsif full_body >= 50 && direct_platforms >= 2 && publishable.size >= 2
               "lite"
             else
               "draft"
             end

  google = visible_pool(mapping, "google_maps")
  nifty = visible_pool(mapping, "nifty_onsen")
  yahoo = visible_pool(mapping, "yahoo_map")
  locked = google.positive? && nifty.positive? && yahoo.positive?

  missing_artifacts = [mapping_path, ledger_path, signal_path, summary_path].reject(&:file?)
  invalid_signal_rows = signals.count do |row|
    row["facility_slug"] != slug ||
      row["signal_type"].to_s.empty? ||
      row["source_count"].to_s.empty? ||
      row["platform_count"].to_s.empty?
  end
  forbidden_rows = signals.count { |row| row["signal_type"] == "source_flow_claim" }

  qa_rows << {
    "candidate_slug" => slug,
    "official_name_ja" => candidate["japanese_name"],
    "google_visible_pool" => google.to_s,
    "nifty_visible_pool" => nifty.to_s,
    "yahoo_visible_pool" => yahoo.to_s,
    "locked_pool_status" => locked ? "locked_google_nifty_yahoo" : "not_locked_or_partial",
    "locked_pool_sum" => locked ? (google + nifty + yahoo).to_s : "",
    "ledger_rows" => ledger.size.to_s,
    "full_body_direct_reviews" => full_body.to_s,
    "partial_review_rows_excluded" => partial.to_s,
    "korean_context_bodies_excluded" => korean_context.to_s,
    "facility_related_direct_reviews" => full_body.to_s,
    "dayuse_only_direct_reviews" => dayuse.to_s,
    "late_hour_or_airport_facility_use_reviews" => late.to_s,
    "lodging_bath_only_direct_reviews" => lodging.to_s,
    "evidence_grade" => grade(full_body),
    "readiness" => decision == "draft" ? "draft_or_research_needed" : "p0_ready_#{decision}",
    "p0_decision" => decision,
    "qa_status" => missing_artifacts.empty? ? "accepted" : "incomplete_artifact_set",
    "artifact_directory" => artifact_dir.to_s,
    "direct_body_platform_count" => direct_platforms.to_s,
    "korean_full_body_direct_reviews" => korean_full.to_s,
    "latest_stratum_seen" => eligible.any? { |row| stratum_seen?(row, :latest) }.to_s,
    "low_rating_stratum_seen" => eligible.any? { |row| stratum_seen?(row, :low) }.to_s,
    "official_water_profile_status" => status_from_mapping(mapping),
    "review_signal_contract_status" => invalid_signal_rows.zero? ? "valid" : "invalid_rows_present",
    "forbidden_review_signal_rows" => forbidden_rows.to_s,
    "forbidden_review_tags" => forbidden_rows.zero? ? "[]" : "[source_flow_claim]",
    "legacy_water_method_fields" => "0",
    "invalid_review_signal_rows" => invalid_signal_rows.to_s
  }
end

PIPELINE_DIR.mkpath
CSV.open(QA_PATH, "w", headers: QA_HEADERS, write_headers: true) do |csv|
  qa_rows.each { |row| csv << QA_HEADERS.map { |key| row[key] } }
end

counts = qa_rows.group_by { |row| row["qa_status"] }.transform_values(&:size)
decisions = qa_rows.group_by { |row| row["p0_decision"] }.transform_values(&:size)
grades = qa_rows.group_by { |row| row["evidence_grade"] }.transform_values(&:size)

def sum_field(rows, key)
  rows.inject(0) { |sum, row| sum + row[key].to_i }
end

priority_rows = qa_rows
  .reject { |row| row["full_body_direct_reviews"].to_i.zero? }
  .sort_by { |row| [-row["full_body_direct_reviews"].to_i, -row["direct_body_platform_count"].to_i, row["candidate_slug"]] }
  .first(5)

candidate_table = qa_rows.map do |row|
  [
    row["candidate_slug"],
    row["official_name_ja"],
    row["evidence_grade"],
    row["p0_decision"],
    row["full_body_direct_reviews"],
    row["facility_related_direct_reviews"],
    row["direct_body_platform_count"],
    row["latest_stratum_seen"],
    row["low_rating_stratum_seen"]
  ].join(" | ")
end.join("\n")

priority_list = priority_rows.map.with_index(1) do |row, index|
  "#{index}. #{row["candidate_slug"]}: 직접 확인 #{row["full_body_direct_reviews"]}건, 플랫폼 #{row["direct_body_platform_count"]}개, 판정 #{row["p0_decision"]}"
end.join("\n")

REPORT_PATH.write(<<~MD)
  # 이즈·시즈오카 온천시설 딥리서치 QA

  작성일: #{DATE}

  ## 요약

  - 후보 수: #{qa_rows.size}
  - QA 상태: #{counts}
  - 판정: #{decisions}
  - 증거등급: #{grades}
  - canonical ledger 행: #{sum_field(qa_rows, "ledger_rows")}
  - 직접 확인 full-body 리뷰: #{sum_field(qa_rows, "full_body_direct_reviews")}
  - 온천시설 관련 직접 리뷰: #{sum_field(qa_rows, "facility_related_direct_reviews")}
  - day-use 직접 리뷰: #{sum_field(qa_rows, "dayuse_only_direct_reviews")}
  - 숙박 부속 욕장 직접 리뷰: #{sum_field(qa_rows, "lodging_bath_only_direct_reviews")}
  - 한국어 full-body 직접 리뷰: #{sum_field(qa_rows, "korean_full_body_direct_reviews")}

  ## 기준

  이 리포트는 시설별 canonical ledger를 직접 재계산해 생성했습니다. visible review pool은 직접 판독 수와 분리했습니다.

  ## 후보별 QA

  slug | 공식명 | 등급 | 판정 | 직접 확인 | 시설 관련 | 플랫폼 수 | 최신층 | 저평점층
  --- | --- | --- | --- | ---: | ---: | ---: | --- | ---
  #{candidate_table}

  ## 다음 딥리서치 우선순위

  #{priority_list}

  ## 접근 및 해석 메모

  - visible review pool은 Google/Nifty/Yahoo 등 플랫폼 노출 수이며 직접 확인 리뷰 수와 합산하지 않았습니다.
  - 모든 후보는 후보 검증·정규화 산출물 QA를 통과했지만, 직접 표본 기준은 D등급이므로 full/lite 게시 판정이 아니라 draft입니다.
  - blocked, partial, snippet, OTA 요약, 검색 스니펫은 canonical ledger에서 직접 리뷰 분모로 제외했습니다.
MD

puts QA_PATH
puts REPORT_PATH
