#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "fileutils"
require "json"
require "time"

ROOT = File.expand_path("..", __dir__)
DATE = "2026-07-12"
SEED_ROOT = File.join(ROOT, "research", "onsen-db-seed")
PIPELINE = File.join(SEED_ROOT, "kansai_sanin_setouchi_facility_pipeline_#{DATE}")
MASTER = File.join(PIPELINE, "kansai_sanin_setouchi_facility_master_queue_#{DATE}.csv")
RUNTIME = File.join(PIPELINE, "kansai_sanin_setouchi_facility_deepresearch_runtime_manifest_#{DATE}.csv")
RESEARCH = File.join(SEED_ROOT, "deepresearch", "kansai_sanin_setouchi_#{DATE}")

LEDGER_HEADERS = %w[
  review_id dedupe_key content_type direct_body_status review_count_eligible facility_related
  scope_bucket platform language sampling_stratum facility_area facility_area_confidence
  review_url author_or_publisher review_date_or_relative rating short_paraphrase original_keyword access_note
].freeze

SIGNAL_HEADERS = %w[
  facility_slug facility_area facility_area_confidence signal_type signal_direction mention_count source_count
  platform_count platforms water_texture_subtype color_tag contradiction_level review_signal_status publishable_item
  short_interpretation evidence_review_ids item_threshold_met
].freeze

def read_csv(path)
  CSV.read(path, headers: true, encoding: "bom|utf-8").map(&:to_h)
end

def write_csv(path, headers, rows)
  CSV.open(path, "w", write_headers: true, headers: headers, encoding: "utf-8") do |csv|
    rows.each { |row| csv << headers.map { |header| row[header] } }
  end
end

master = read_csv(MASTER)
runtime = read_csv(RUNTIME)
targets = master.select do |row|
  boundary_scope = %w[footbath_only route_or_pass split_needed exclude_or_hold].include?(row["scope_status"])
  boundary_status = %w[P0_boundary_first qa_rework running].include?(row["pipeline_status"])
  unresolved_candidate = %w[
    operation_recheck candidate_qa_hold official_transport_responded_content_not_yet_checked pending_review_pool_lock
  ].include?(row["pipeline_status"])
  (boundary_status && boundary_scope) || unresolved_candidate
end
now = Time.now.getlocal("+09:00").iso8601

targets.each do |row|
  slug = row.fetch("candidate_slug")
  output = File.join(RESEARCH, slug)
  if File.exist?(output)
    existing_mapping = File.join(output, "#{slug}_facility_platform_mapping_#{DATE}.json")
    boundary_output = File.file?(existing_mapping) && JSON.parse(File.read(existing_mapping))["candidate_boundary_status"]
    raise "refusing to overwrite non-boundary output: #{output}" unless boundary_output
  end

  FileUtils.mkdir_p(output)
  mapping = {
    "research_date" => DATE,
    "slug" => slug,
    "name_ja" => row.fetch("japanese_name"),
    "candidate_track" => row.fetch("candidate_track"),
    "candidate_boundary_status" => row.fetch("scope_status"),
    "service_exposure_status" => "candidate_only_boundary_or_unresolved_operation",
    "official_url" => row.fetch("official_url"),
    "official_water_profile_status" => "not_applicable_non_bathing_candidate",
    "direct_review_sampling_status" => "not_started_non_bathing_boundary",
    "google_maps" => { "review_body_access" => "not_applicable", "visible_review_count" => 0 },
    "nifty_onsen" => { "review_body_access" => "not_applicable", "visible_review_count" => 0 },
    "yahoo_map" => { "review_body_access" => "not_applicable", "visible_review_count" => 0 },
    "scope_reason" => row.fetch("next_action"),
    "checked_at_kst" => now
  }
  File.write(File.join(output, "#{slug}_facility_platform_mapping_#{DATE}.json"), JSON.pretty_generate(mapping) + "\n", encoding: "utf-8")
  write_csv(File.join(output, "#{slug}_direct_review_sample_index_#{DATE}.csv"), LEDGER_HEADERS, [{
    "review_id" => "boundary_audit_#{slug}",
    "dedupe_key" => "boundary_audit:#{slug}",
    "content_type" => "activity_post",
    "direct_body_status" => "not_available",
    "review_count_eligible" => "false",
    "facility_related" => "false",
    "scope_bucket" => "non_bathing_context",
    "platform" => "coordinator_audit",
    "language" => "ja",
    "sampling_stratum" => "boundary_audit",
    "facility_area" => "non_bathing_boundary",
    "facility_area_confidence" => "specific",
    "review_url" => row.fetch("official_url"),
    "author_or_publisher" => "Bathtime coordinator",
    "review_date_or_relative" => DATE,
    "rating" => "",
    "short_paraphrase" => "Candidate boundary audit only; no direct bathing review was collected.",
    "original_keyword" => row.fetch("scope_status"),
    "access_note" => "Non-bathing candidate closure, excluded from all bathing-review denominators."
  }])
  write_csv(File.join(output, "#{slug}_facility_review_signal_rows_#{DATE}.csv"), SIGNAL_HEADERS, [{
    "facility_slug" => slug,
    "facility_area" => "non_bathing_boundary",
    "facility_area_confidence" => "specific",
    "signal_type" => "eligibility_or_use_scope",
    "signal_direction" => "neutral",
    "mention_count" => 0,
    "source_count" => 0,
    "platform_count" => 0,
    "platforms" => "",
    "water_texture_subtype" => "not_applicable",
    "color_tag" => "not_applicable",
    "contradiction_level" => "low",
    "review_signal_status" => "insufficient",
    "publishable_item" => "false",
    "short_interpretation" => "Non-bathing boundary candidate; no direct bathing-review denominator was collected.",
    "evidence_review_ids" => "",
    "item_threshold_met" => "false"
  }])
  summary = <<~MD
    # #{row.fetch("japanese_name")}

    - 후보 경계: #{row.fetch("scope_status")}
    - 직접 읽은 입욕 리뷰: 0건
    - 판정: 비입욕·패스·scope 미분리 또는 운영 미확정 후보로, 개별 당일입욕 시설의 리뷰 분모와 분리한다.
    - 서비스 노출: candidate_only. 이 파일은 경계/운영 종료 기록이며 온천 만족 신호가 아니다.
  MD
  File.write(File.join(output, "#{slug}_facility_review_signal_summary_#{DATE}.md"), summary, encoding: "utf-8")

  run = runtime.find { |candidate| candidate.fetch("candidate_slug") == slug } or raise "runtime row missing: #{slug}"
  row["pipeline_status"] = "running"
  row["batch"] = "boundary_close"
  row["scope_contract"] = "non_bathing_boundary: no direct bathing review sampling; candidate-only closure."
  row["qa_artifact_directory"] = "deepresearch/kansai_sanin_setouchi_#{DATE}/#{slug}"
  row["checked_at_kst"] = now
  run["pipeline_status"] = "running"
  run["batch"] = "boundary_close"
  run["assigned_model"] = "coordinator"
  run["assigned_agent_id"] = "coordinator"
  run["agent_nickname"] = "coordinator"
  run["output_directory"] = "deepresearch/kansai_sanin_setouchi_#{DATE}/#{slug}"
  run["scope_contract"] = row.fetch("scope_contract")
  run["minimum_full_body_target"] = 0
  run["required_platforms"] = "not_applicable_non_bathing_boundary"
  run["direct_reviews_read"] = 0
  run["qa_status"] = "not_started"
  run["updated_at_kst"] = now
  run["notes"] = "Coordinator boundary closure; not a bathing-facility deep-research record."
end

write_csv(MASTER, master.first.keys, master)
write_csv(RUNTIME, runtime.first.keys, runtime)
puts "prepared=#{targets.length}"
