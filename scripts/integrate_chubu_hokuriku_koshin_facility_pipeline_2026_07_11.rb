#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "json"

DATE = "2026-07-11"
ROOT = "research/onsen-db-seed/chubu-hokuriku-koshin-facility-pipeline-#{DATE}"
RUNTIME = File.join(ROOT, "chubu_hokuriku_koshin_facility_deepresearch_runtime_manifest_#{DATE}.csv")
QUEUE = File.join(ROOT, "chubu_hokuriku_koshin_facility_candidate_queue_#{DATE}.csv")
POOL_LOCK = File.join(ROOT, "chubu_hokuriku_koshin_facility_review_pool_lock_#{DATE}.csv")
FINAL_QA = File.join(ROOT, "chubu_hokuriku_koshin_facility_additional_deepresearch_qa_#{DATE}.csv")
FINAL_REPORT = File.join(ROOT, "chubu_hokuriku_koshin_facility_additional_deepresearch_qa_report_#{DATE}.md")

PLATFORMS = { "google_maps" => %w[google_maps google], "nifty_onsen" => %w[nifty_onsen nifty], "yahoo_map" => %w[yahoo_map yahoo] }.freeze

def truthy?(value)
  value.to_s.strip.downcase == "true"
end

def numeric(value)
  return value if value.is_a?(Numeric)
  normalized = value.to_s.delete(",").strip
  normalized.match?(/\A\d+\z/) ? normalized.to_i : nil
end

def grade(count)
  return "A" if count >= 300
  return "B" if count >= 100
  return "C" if count >= 50
  "D"
end

def platform_name(value)
  normalized = value.to_s.downcase.tr("-", "_")
  PLATFORMS.each { |canonical, aliases| return canonical if aliases.include?(normalized) }
  nil
end

def collect_platform_records(value, records = [])
  case value
  when Hash
    platform = platform_name(value["platform"])
    records << [platform, value] if platform
    value.each do |key, child|
      platform = platform_name(key)
      records << [platform, child] if platform && child.is_a?(Hash)
      collect_platform_records(child, records)
    end
  when Array
    value.each { |child| collect_platform_records(child, records) }
  end
  records
end

def first_value(record, *keys)
  keys.each { |key| return record[key] unless record[key].nil? || record[key] == "" }
  nil
end

def pool_record(records, canonical)
  records.select { |name, _record| name == canonical }.map(&:last).max_by do |record|
    numeric(first_value(record, "visible_review_count", "visible_reviews")) ? 1 : 0
  end || {}
end

def water_status(value)
  case value
  when Hash
    profile = value["official_water_profile"]
    return profile["status"] if profile.is_a?(Hash) && profile["status"].to_s != ""
    value.each_value { |child| result = water_status(child); return result if result }
  when Array
    value.each { |child| result = water_status(child); return result if result }
  end
  nil
end

def stratum_seen?(rows, target)
  rows.any? do |row|
    explicit = target == "latest" ? row["is_latest_stratum"] : row["is_low_rating_stratum"]
    next true if truthy?(explicit)
    tokens = row["sampling_stratum"].to_s.downcase.tr("-", "_").split(/[;|,]/).map(&:strip)
    target == "latest" ? tokens.include?("latest") : (tokens & %w[low_rating low_rated low]).any?
  end
end

def normalize_draft_signals(path, signals)
  headers = signals.headers.dup
  headers << "item_threshold_met" unless headers.include?("item_threshold_met")
  rows = signals.map(&:to_h)
  rows.each do |row|
    row["item_threshold_met"] = row["publishable_item"] if row["item_threshold_met"].nil?
    row["publishable_item"] = "false"
  end
  CSV.open(path, "w", write_headers: true, headers: headers, encoding: "utf-8") { |csv| rows.each { |row| csv << headers.map { |header| row[header] } } }
  rows
end

def signal_issues(rows)
  forbidden = rows.count { |row| row["signal_type"] == "source_flow_claim" }
  legacy = rows.sum { |row| row.keys.count { |key| key.to_s.match?(/(?:source_flow|water_method|kasui|kaon|disinfection)/) } }
  invalid = rows.sum do |row|
    platforms = row["platforms"].to_s.split("|").map(&:strip).reject(&:empty?).uniq
    count = 0
    count += 1 unless row["platform_count"].to_i == platforms.length
    count += 1 unless %w[positive negative mixed neutral].include?(row["signal_direction"])
    count += 1 unless %w[low medium high].include?(row["contradiction_level"])
    count += 1 unless %w[strong_signal moderate_signal weak_signal conflicting insufficient].include?(row["review_signal_status"])
    subtype = row["water_texture_subtype"].to_s.strip
    if row["signal_type"] == "water_texture"
      count += 1 unless %w[slippery salt_warmth sulfur carbonated].include?(subtype)
      count += 1 unless %w[unclear not_applicable].include?(row["color_tag"])
    elsif !["", "not_applicable"].include?(subtype)
      count += 1
    end
    count
  end
  [forbidden, legacy, invalid]
end

runtime = CSV.read(RUNTIME, headers: true, encoding: "bom|utf-8").map(&:to_h)
queue = CSV.read(QUEUE, headers: true, encoding: "bom|utf-8").map(&:to_h).to_h { |row| [row.fetch("candidate_slug"), row] }
deep = runtime.reject { |row| row.fetch("status").start_with?("candidate_closed_") }
unfinished = deep.reject { |row| row.fetch("status").start_with?("qa_accepted_") }
abort("Cannot integrate while unfinished: #{unfinished.map { |row| row["candidate_slug"] }.join(", ")}") unless unfinished.empty?

pool_rows = []
qa_rows = []
draft_normalized = 0
deep.sort_by { |row| row.fetch("assignment_order").to_i }.each do |runtime_row|
  slug = runtime_row.fetch("candidate_slug")
  candidate = queue.fetch(slug)
  directory = File.join(ROOT, runtime_row.fetch("output_directory"))
  mapping_path = Dir.glob(File.join(directory, "#{slug}_facility_platform_mapping_#{DATE}.json")).fetch(0)
  ledger_path = Dir.glob(File.join(directory, "#{slug}_direct_review_sample_index_#{DATE}.csv")).fetch(0)
  signal_path = Dir.glob(File.join(directory, "#{slug}_facility_review_signal_rows_#{DATE}.csv")).fetch(0)
  abort("Missing final artifact for #{slug}") unless mapping_path && ledger_path && signal_path
  mapping = JSON.parse(File.read(mapping_path))
  records = collect_platform_records(mapping)
  pools = {}
  PLATFORMS.each_key do |platform|
    record = pool_record(records, platform)
    pools[platform] = numeric(first_value(record, "visible_review_count", "visible_reviews"))
    pool_rows << {
      "lock_order" => pool_rows.length + 1, "candidate_slug" => slug, "japanese_name" => candidate["japanese_name"],
      "official_address" => first_value(record, "address", "address_ja") || "", "platform" => platform,
      "listing_title" => first_value(record, "listing_title") || "", "visible_rating" => first_value(record, "visible_rating", "rating") || "",
      "visible_review_count" => pools[platform] || "", "listing_url" => first_value(record, "listing_url") || "",
      "identity_match" => first_value(record, "identity_match") || "", "listing_identity_status" => first_value(record, "listing_identity_status", "identity_status") || "not_visible",
      "decision_scope_pool_status" => first_value(record, "decision_scope_pool_status") || (pools[platform] ? "locked" : "not_locked"),
      "observed_at_kst" => first_value(record, "observed_at_kst", "visible_pool_checked_at") || "", "collection_method" => first_value(record, "collection_method", "access_status", "review_body_access") || "",
      "direct_reviews_read" => first_value(record, "direct_reviews_read", "raw_direct_reviews") || 0,
      "scope_note" => first_value(record, "scope_note", "notes") || (pools[platform] ? "visible pool은 직접 본문 수와 분리" : "수치 미노출: visible pool 잠금에서 제외")
    }
  end
  ledger = CSV.read(ledger_path, headers: true, encoding: "bom|utf-8")
  eligible = ledger.select { |row| truthy?(row["review_count_eligible"]) }
  signals = CSV.read(signal_path, headers: true, encoding: "bom|utf-8")
  decision = runtime_row.fetch("status").delete_prefix("qa_accepted_")
  signal_rows = decision == "draft" ? normalize_draft_signals(signal_path, signals) : signals.map(&:to_h)
  draft_normalized += 1 if decision == "draft"
  forbidden, legacy, invalid = signal_issues(signal_rows)
  all_pools_numeric = pools.values.none?(&:nil?)
  partial = ledger.count { |row| row["direct_body_status"] == "partial" }
  korean_context = ledger.count { |row| row["language"].to_s.downcase.tr("-", "_").match?(/\A(?:ko|ko_kr|korean|한국어)\z/) && row["direct_body_status"] == "full" && !truthy?(row["review_count_eligible"]) }
  qa_rows << {
    "candidate_slug" => slug, "official_name_ja" => candidate["japanese_name"],
    "google_visible_pool" => pools["google_maps"] || 0, "nifty_visible_pool" => pools["nifty_onsen"] || 0, "yahoo_visible_pool" => pools["yahoo_map"] || 0,
    "locked_pool_status" => all_pools_numeric ? "locked_google_nifty_yahoo" : "not_locked_missing_numeric_pool", "locked_pool_sum" => all_pools_numeric ? pools.values.sum : "",
    "ledger_rows" => ledger.length, "full_body_direct_reviews" => eligible.length, "partial_review_rows_excluded" => partial, "korean_context_bodies_excluded" => korean_context,
    "facility_related_direct_reviews" => eligible.length, "dayuse_only_direct_reviews" => eligible.count { |row| row["scope_bucket"] == "dayuse_only" },
    "late_hour_or_airport_facility_use_reviews" => eligible.count { |row| %w[late_hour_facility_use airport_facility_use late_hour_or_airport_facility_use].include?(row["scope_bucket"]) },
    "lodging_bath_only_direct_reviews" => eligible.count { |row| row["scope_bucket"] == "lodging_bath_only" }, "evidence_grade" => grade(eligible.length),
    "readiness" => decision == "full" ? "p0_ready_full" : (decision == "lite" ? "p0_ready_lite" : "needs_review_reinforcement"), "p0_decision" => decision, "qa_status" => "accepted",
    "artifact_directory" => runtime_row.fetch("output_directory"), "direct_body_platform_count" => eligible.map { |row| row["platform"] }.uniq.length,
    "korean_full_body_direct_reviews" => eligible.count { |row| row["language"].to_s.downcase.tr("-", "_").match?(/\A(?:ko|ko_kr|korean|한국어)\z/) },
    "latest_stratum_seen" => stratum_seen?(eligible, "latest").to_s, "low_rating_stratum_seen" => stratum_seen?(eligible, "low_rating").to_s,
    "official_water_profile_status" => water_status(mapping) || "official_water_profile_reinforcement_required",
    "review_signal_contract_status" => invalid.zero? && forbidden.zero? ? "passed_with_no_forbidden_rows" : "needs_rework",
    "forbidden_review_signal_rows" => forbidden, "forbidden_review_tags" => forbidden.zero? ? "[]" : "[source_flow_claim]", "legacy_water_method_fields" => legacy, "invalid_review_signal_rows" => invalid
  }
end

pool_headers = pool_rows.first.keys
CSV.open(POOL_LOCK, "w", write_headers: true, headers: pool_headers, encoding: "utf-8") { |csv| pool_rows.each { |row| csv << pool_headers.map { |header| row[header] } } }
qa_headers = qa_rows.first.keys
CSV.open(FINAL_QA, "w", write_headers: true, headers: qa_headers, encoding: "utf-8") { |csv| qa_rows.each { |row| csv << qa_headers.map { |header| row[header] } } }

decisions = qa_rows.group_by { |row| row["p0_decision"] }.transform_values(&:length)
visible_known = pool_rows.map { |row| numeric(row["visible_review_count"]) }.compact.sum
visible_unknown = pool_rows.count { |row| numeric(row["visible_review_count"]).nil? }
direct_total = qa_rows.sum { |row| row["full_body_direct_reviews"].to_i }
File.write(FINAL_REPORT, <<~MARKDOWN)
  # 중부·호쿠리쿠·고신 온천시설 파이프라인 QA 보고

  - 기준일: #{DATE} KST
  - 후보 정규화: 총 #{runtime.length}개 중 욕장 딥리서치 #{deep.length}개, 비입욕·동선 후보 종료 #{runtime.length - deep.length}개
  - 직접 읽은 적격 당일입욕 리뷰: #{direct_total}건. 플랫폼 노출 리뷰풀과 별도 집계다.
  - visible review pool: 수치 확인 행 합계 #{visible_known}건, 수치 미노출/미잠금 행 #{visible_unknown}건
  - 최종 판정: full #{decisions.fetch("full", 0)}, lite #{decisions.fetch("lite", 0)}, draft #{decisions.fetch("draft", 0)}
  - draft 신호 처리: #{draft_normalized}개 시설은 내부 임계값 기록을 보존하되 공개 신호 플래그를 false로 정규화했다.

  ## 집계 원칙

  직접 리뷰 수는 실제 입욕이 확인된 platform_review/full/facility_related/dayuse_only 원장 행만 합산했다. 숙박 욕장, 족욕, 음식점·동선, 검색 스니펫과 말줄임 카드는 직접 리뷰 분모에 넣지 않았다. 수치 미노출 플랫폼은 리뷰풀 잠금 합계에 포함하지 않았다.

  ## 다음 액션

  draft 시설은 공개 리뷰 신호를 발행하지 않는다. 최신·저평점 strata와 독립 직접본문 플랫폼을 우선 보강하고, 수질·운용 방식은 욕장 scope, 원문, URL, 확인시각이 함께 확보된 경우에만 승격한다.
MARKDOWN

puts "Integrated #{deep.length} facilities; eligible direct reviews=#{direct_total}."
