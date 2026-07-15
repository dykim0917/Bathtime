#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "json"

ROOT = File.expand_path("..", __dir__)
DATE = "2026-07-12"
SEED = File.join(ROOT, "research", "onsen-db-seed")
PIPELINE = File.join(SEED, "kansai_sanin_setouchi_facility_pipeline_#{DATE}")
MASTER = File.join(PIPELINE, "kansai_sanin_setouchi_facility_master_queue_#{DATE}.csv")
QA = File.join(PIPELINE, "kansai_sanin_setouchi_facility_deepresearch_qa_#{DATE}.csv")

def read_csv(path)
  CSV.read(path, headers: true, encoding: "bom|utf-8").map(&:to_h)
end

def write_csv(path, headers, rows)
  CSV.open(path, "w", write_headers: true, headers: headers, encoding: "utf-8") do |csv|
    rows.each { |row| csv << headers.map { |header| row[header] } }
  end
end

master = read_csv(MASTER)
qa_rows = read_csv(QA)
qa_by_slug = qa_rows.to_h { |row| [row.fetch("candidate_slug"), row] }

candidate_headers = master.first.keys + ["qa_status", "evidence_grade", "direct_body_platform_count", "full_body_direct_reviews"]
candidate_rows = master.map do |row|
  qa = qa_by_slug.fetch(row.fetch("candidate_slug"))
  row.merge(
    "qa_status" => qa.fetch("qa_status"),
    "evidence_grade" => qa.fetch("evidence_grade"),
    "direct_body_platform_count" => qa.fetch("direct_body_platform_count"),
    "full_body_direct_reviews" => qa.fetch("full_body_direct_reviews")
  )
end
write_csv(File.join(PIPELINE, "kansai_sanin_setouchi_facility_candidate_queue_#{DATE}.csv"), candidate_headers, candidate_rows)

status_counts = candidate_rows.group_by { |row| row.fetch("qa_status") }.transform_values(&:length)
track_counts = candidate_rows.group_by { |row| row.fetch("candidate_track") }.transform_values(&:length)
candidate_md = <<~MD
  # 간사이·산인·세토우치 시설 후보 큐

  - 전체 후보: #{candidate_rows.length}건
  - QA 상태: #{status_counts.sort.map { |status, count| "#{status} #{count}" }.join(", ")}
  - 트랙: #{track_counts.sort.map { |track, count| "#{track} #{count}" }.join(", ")}
  - 후보·리뷰풀·직접 본문은 서로 다른 필드로 유지했다. `candidate_only` 경계 종료 행은 입욕 시설 서비스 노출 대상이 아니다.
MD
File.write(File.join(PIPELINE, "kansai_sanin_setouchi_facility_candidate_queue_#{DATE}.md"), candidate_md, encoding: "utf-8")

water_headers = %w[candidate_slug japanese_name prefecture candidate_track official_water_profile_status official_url artifact_directory boundary_or_scope next_action]
water_rows = candidate_rows.map do |row|
  qa = qa_by_slug.fetch(row.fetch("candidate_slug"))
  {
    "candidate_slug" => row.fetch("candidate_slug"),
    "japanese_name" => row.fetch("japanese_name"),
    "prefecture" => row.fetch("prefecture"),
    "candidate_track" => row.fetch("candidate_track"),
    "official_water_profile_status" => qa.fetch("official_water_profile_status"),
    "official_url" => row.fetch("official_url"),
    "artifact_directory" => qa.fetch("artifact_directory"),
    "boundary_or_scope" => row.fetch("scope_status"),
    "next_action" => row.fetch("next_action")
  }
end
write_csv(File.join(PIPELINE, "kansai_sanin_setouchi_facility_official_water_spot_check_#{DATE}.csv"), water_headers, water_rows)

pool_headers = %w[candidate_slug japanese_name google_visible_pool nifty_visible_pool yahoo_visible_pool locked_pool_status locked_pool_sum full_body_direct_reviews direct_body_platform_count qa_status]
pool_rows = candidate_rows.map do |row|
  qa = qa_by_slug.fetch(row.fetch("candidate_slug"))
  pool_headers.to_h do |header|
    value = header == "candidate_slug" ? row.fetch("candidate_slug") : header == "japanese_name" ? row.fetch("japanese_name") : qa.fetch(header)
    [header, value]
  end
end
write_csv(File.join(PIPELINE, "kansai_sanin_setouchi_facility_review_pool_lock_#{DATE}.csv"), pool_headers, pool_rows)
locked_count = pool_rows.count { |row| row.fetch("locked_pool_status") == "locked_google_nifty_yahoo" }
pool_md = <<~MD
  # 리뷰풀 잠금

  - 3플랫폼 수치 잠금: #{locked_count}건
  - 직접 본문 수는 별도 QA 필드이며 visible review pool과 합산하지 않았다.
  - `not_locked_or_partial`은 리뷰 표면·수치·정체성 중 하나 이상이 미잠금이거나, candidate-only 경계 종료여서 직접 샘플링을 하지 않은 경우다.
MD
File.write(File.join(PIPELINE, "kansai_sanin_setouchi_facility_review_pool_lock_#{DATE}.md"), pool_md, encoding: "utf-8")

reinforcement_headers = %w[candidate_slug japanese_name qa_status evidence_grade full_body_direct_reviews direct_body_platform_count official_water_profile_status scope_status reinforcement_axes next_action]
reinforcement_rows = candidate_rows.map do |row|
  qa = qa_by_slug.fetch(row.fetch("candidate_slug"))
  next unless qa.fetch("qa_status") == "qa_accepted_draft" || qa.fetch("official_water_profile_status").include?("reinforcement") || qa.fetch("official_water_profile_status").include?("unclear")

  axes = []
  axes << "review_body_platform" if qa.fetch("direct_body_platform_count").to_i < 2
  axes << "review_volume" if qa.fetch("full_body_direct_reviews").to_i < 300
  axes << "official_water_profile" if qa.fetch("official_water_profile_status").match?(/reinforcement|unclear|partial/)
  axes << "scope_or_operation" unless row.fetch("scope_status") == "stable_facility_scope"
  axes << "korean_direct_review" if qa.fetch("korean_full_body_direct_reviews").to_i.zero?
  {
    "candidate_slug" => row.fetch("candidate_slug"),
    "japanese_name" => row.fetch("japanese_name"),
    "qa_status" => qa.fetch("qa_status"),
    "evidence_grade" => qa.fetch("evidence_grade"),
    "full_body_direct_reviews" => qa.fetch("full_body_direct_reviews"),
    "direct_body_platform_count" => qa.fetch("direct_body_platform_count"),
    "official_water_profile_status" => qa.fetch("official_water_profile_status"),
    "scope_status" => row.fetch("scope_status"),
    "reinforcement_axes" => axes.join("|"),
    "next_action" => row.fetch("next_action")
  }
end.compact
write_csv(File.join(PIPELINE, "kansai_sanin_setouchi_facility_remaining_reinforcement_queue_#{DATE}.csv"), reinforcement_headers, reinforcement_rows)
reinforcement_md = <<~MD
  # 남은 보강 큐

  - 보강 후보: #{reinforcement_rows.length}건
  - 축: 직접 본문 플랫폼, 리뷰량, 공식 온천수 프로필, day-use/운영 경계, 한국어 직접 본문.
  - 이 큐는 DB 공개 우선순위가 아니라 재조사·운영 확인·수질 원문 보강 순서용이다.
MD
File.write(File.join(PIPELINE, "kansai_sanin_setouchi_facility_remaining_reinforcement_queue_#{DATE}.md"), reinforcement_md, encoding: "utf-8")

puts "candidate=#{candidate_rows.length} water=#{water_rows.length} pools=#{pool_rows.length} reinforcement=#{reinforcement_rows.length}"
