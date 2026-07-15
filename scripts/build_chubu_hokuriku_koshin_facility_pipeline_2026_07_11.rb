#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "fileutils"
require "time"

DATE = "2026-07-11"
REGION_ID = "chubu_hokuriku_koshin"
MASTER = "research/onsen-candidates/nationwide-2026-07-03/nationwide_facility_master_v0_6_2026-07-03.csv"
TIER1 = "research/onsen-candidates/nationwide-2026-07-03/chubu_hokuriku_koshin_facility_candidate_status_2026-07-03.csv"
OPERATION = "research/onsen-db-seed/chubu-hokuriku-koshin-facility-p1-operation-2026-07-11/chubu_hokuriku_koshin_facility_p1_operation_assessment_2026-07-11.csv"
OUTPUT = "research/onsen-db-seed/chubu-hokuriku-koshin-facility-pipeline-#{DATE}"

TARGET_PREFECTURES = %w[長野県 新潟県 富山県 石川県 福井県 岐阜県].freeze
DEEP_QUEUE = %w[
  wakura-soyu
  nozawa-furusato-no-yu
  shirahonet-public-openair
  echigo-yuzawa-komako-no-yu
  echigo-yuzawa-yama-no-yu
  unazuki-soyu-yumedokoro
  katayamazu-machiyu
  awara-saintpia
  bessho-ainome-yu
  bessho-ishiyu
  bessho-otsukai-yu
  yamanaka-kikunoyu
  yamashiro-ko-soyu
  yamashiro-soyu
  nozawa-oyu
  yudanaka-kaede-no-yu
  echigo-yuzawa-ponshukan-sakebath
  tsukioka-bijin-no-izumi
  gero-kua-garden
  gero-shirasagi
  gero-sachinoyu
  senami-ryusen
].freeze
FIRST_BATCH = %w[
  wakura-soyu
  nozawa-furusato-no-yu
  shirahonet-public-openair
  echigo-yuzawa-komako-no-yu
  echigo-yuzawa-yama-no-yu
  unazuki-soyu-yumedokoro
].freeze
CANDIDATE_ONLY = {
  "nozawa-ogama" => "route_or_pass",
  "nozawa-sotoyu-route" => "route_or_pass",
  "shibu-kyuto-route" => "route_or_pass",
  "shibu-oinoyu" => "route_or_pass",
  "tsukioka-ashiyu-yuashibi" => "footbath_only",
  "wakura-yuttari-park-footbath" => "footbath_only",
  "awara-ashiyu" => "footbath_only",
  "senami-footbath" => "footbath_only",
  "yamanaka-kakusenkei-footbath" => "footbath_only",
  "unazuki-omokage-footbath" => "footbath_only",
  "gero-onsen-museum" => "footbath_only",
  "awara-yukemuri-yokocho" => "non_bathing_food_street"
}.freeze

def read_csv(path)
  CSV.read(path, headers: true, encoding: "bom|utf-8").map(&:to_h)
end

def write_csv(path, headers, rows)
  CSV.open(path, "w", write_headers: true, headers: headers, encoding: "utf-8") do |csv|
    rows.each { |row| csv << headers.map { |header| row[header] } }
  end
end

def model_for(type)
  return "route_or_pass" if type == "route_or_pass"
  return "stopover" if type == "footbath"
  return "experience" if %w[food_steam wellness_spa].include?(type)

  "bathe"
end

def archetype_for(type)
  return "experience_led_facility" if %w[food_steam wellness_spa footbath].include?(type)

  "public_bathing_facility"
end

def track_for(type)
  return "spa_complex_super_sento" if %w[wellness_spa large_day_use_complex].include?(type)

  "traditional_onsen_facility"
end

FileUtils.mkdir_p(OUTPUT)
checked_at = Time.now.getlocal("+09:00").iso8601
master_rows = read_csv(MASTER).select { |row| TARGET_PREFECTURES.include?(row.fetch("prefecture")) }
tier1_by_slug = read_csv(TIER1).to_h { |row| [row.fetch("slug"), row] }
operation_by_slug = read_csv(OPERATION).to_h { |row| [row.fetch("candidate_slug"), row] }

raise "Expected 34 regional facility candidates, got #{master_rows.length}." unless master_rows.length == 34
raise "Deep queue must contain unique slugs." unless DEEP_QUEUE.uniq.length == DEEP_QUEUE.length
raise "Candidate-only and deep queues overlap." unless (CANDIDATE_ONLY.keys & DEEP_QUEUE).empty?
raise "Queue coverage mismatch." unless (DEEP_QUEUE + CANDIDATE_ONLY.keys).sort == master_rows.map { |row| row.fetch("slug") }.sort

candidate_headers = %w[
  candidate_slug candidate_track korean_name japanese_name aliases facility_type facility_model archetype lodging_available
  prefecture municipality onsen_area official_url map_or_review_url product_strength prior_tier korean_demand_signal
  visible_review_pool_state water_profile_mode official_water_profile_status scope_status operation_status cleanup_status
  verification_status promotion_disposition next_priority tier_reason source_urls direct_reviews_read notes
].freeze

candidate_rows = master_rows.map do |row|
  slug = row.fetch("slug")
  tier1 = tier1_by_slug[slug] || {}
  operation = operation_by_slug[slug] || {}
  candidate_only = CANDIDATE_ONLY[slug]
  type = row.fetch("facility_type")
  next_priority = if FIRST_BATCH.include?(slug)
                    "batch_01"
                  elsif DEEP_QUEUE.include?(slug)
                    "queued_after_batch_01"
                  else
                    "candidate_closure"
                  end
  disposition = candidate_only || operation.fetch("revised_promotion_decision", nil) || (DEEP_QUEUE.include?(slug) ? "P0_candidate_pending_pool_lock" : "P2_candidate")
  {
    "candidate_slug" => slug,
    "candidate_track" => track_for(type),
    "korean_name" => row.fetch("name_ko_or_en"),
    "japanese_name" => row.fetch("name_ja"),
    "aliases" => "",
    "facility_type" => type,
    "facility_model" => candidate_only == "route_or_pass" ? "route_or_pass" : model_for(type),
    "archetype" => archetype_for(type),
    "lodging_available" => slug == "gero-sachinoyu" ? "true" : "unclear",
    "prefecture" => row.fetch("prefecture"),
    "municipality" => "",
    "onsen_area" => row.fetch("area_slug"),
    "official_url" => tier1.fetch("official_url", ""),
    "map_or_review_url" => tier1.fetch("primary_review_or_ota_url", ""),
    "product_strength" => row.fetch("initial_onsen_facility_signals"),
    "prior_tier" => row.fetch("initial_tier"),
    "korean_demand_signal" => "not_checked_in_candidate_seed",
    "visible_review_pool_state" => "not_locked",
    "water_profile_mode" => "facility_representative_profile",
    "official_water_profile_status" => operation.fetch("official_water_profile_status", "needs_official_water_profile_lock"),
    "scope_status" => candidate_only == "route_or_pass" ? "route_or_pass" : (slug == "gero-sachinoyu" ? "dayuse_boundary_needed" : "needs_scope_lock"),
    "operation_status" => operation.fetch("revised_status", tier1.fetch("candidate_status", "needs_operation_check")),
    "cleanup_status" => candidate_only || "keep_facility",
    "verification_status" => tier1.fetch("verification_result", row.fetch("verification_status")),
    "promotion_disposition" => disposition,
    "next_priority" => next_priority,
    "tier_reason" => row.fetch("initial_onsen_facility_signals"),
    "source_urls" => [tier1["official_url"], tier1["primary_review_or_ota_url"], tier1["secondary_url"]].compact.reject(&:empty?).join(" | "),
    "direct_reviews_read" => "0",
    "notes" => candidate_only ? "후보 정규화에서 종료; 직접 리뷰 수 0" : "visible pool lock 전; 직접 리뷰 수 0"
  }
end
write_csv(File.join(OUTPUT, "#{REGION_ID}_facility_candidate_queue_#{DATE}.csv"), candidate_headers, candidate_rows)

water_headers = %w[
  candidate_slug japanese_name official_water_profile_status spring_quality_original official_water_text_original
  official_source_url official_source_checked_at water_scope water_method_badge_policy
].freeze
water_rows = candidate_rows.map do |row|
  operation = operation_by_slug[row.fetch("candidate_slug")] || {}
  {
    "candidate_slug" => row.fetch("candidate_slug"),
    "japanese_name" => row.fetch("japanese_name"),
    "official_water_profile_status" => row.fetch("official_water_profile_status"),
    "spring_quality_original" => "",
    "official_water_text_original" => "",
    "official_source_url" => operation.fetch("current_operation_url", ""),
    "official_source_checked_at" => operation.empty? ? "" : checked_at,
    "water_scope" => operation.fetch("water_scope", row.fetch("scope_status")),
    "water_method_badge_policy" => "no_method_badge_without_official_original_text_url_checked_at_and_explicit_bath_scope"
  }
end
write_csv(File.join(OUTPUT, "#{REGION_ID}_facility_official_water_spotcheck_#{DATE}.csv"), water_headers, water_rows)

pool_headers = %w[
  lock_order candidate_slug japanese_name official_address platform listing_title visible_rating visible_review_count listing_url
  identity_match listing_identity_status decision_scope_pool_status observed_at_kst collection_method direct_reviews_read scope_note
].freeze
pool_rows = DEEP_QUEUE.flat_map.with_index do |slug, index|
  candidate = candidate_rows.find { |row| row.fetch("candidate_slug") == slug }
  %w[google_maps nifty_onsen yahoo_map].map do |platform|
    {
      "lock_order" => (index * 3 + %w[google_maps nifty_onsen yahoo_map].index(platform) + 1).to_s,
      "candidate_slug" => slug,
      "japanese_name" => candidate.fetch("japanese_name"),
      "official_address" => "",
      "platform" => platform,
      "listing_title" => "",
      "visible_rating" => "",
      "visible_review_count" => "",
      "listing_url" => "",
      "identity_match" => "not_checked",
      "listing_identity_status" => "not_checked",
      "decision_scope_pool_status" => "not_locked",
      "observed_at_kst" => "",
      "collection_method" => "not_checked",
      "direct_reviews_read" => "0",
      "scope_note" => "후보 보강 단계: visible pool만 잠금; 직접 리뷰는 0"
    }
  end
end
write_csv(File.join(OUTPUT, "#{REGION_ID}_facility_review_pool_lock_#{DATE}.csv"), pool_headers, pool_rows)

assignment_headers = %w[
  assignment_order candidate_slug assigned_model assigned_agent_id agent_nickname status output_directory scope_contract minimum_full_body_target required_platforms notes
].freeze
assignment_rows = DEEP_QUEUE.each_with_index.map do |slug, index|
  candidate = candidate_rows.find { |row| row.fetch("candidate_slug") == slug }
  {
    "assignment_order" => (index + 1).to_s,
    "candidate_slug" => slug,
    "assigned_model" => "gpt-5.6-luna",
    "assigned_agent_id" => "",
    "agent_nickname" => "",
    "status" => FIRST_BATCH.include?(slug) ? "pending" : "queued_after_batch_01",
    "output_directory" => "deepresearch/#{REGION_ID}_#{DATE}/#{slug}",
    "scope_contract" => slug == "gero-sachinoyu" ? "dayuse_only; lodging_bath_only; family_bath_closed_notice; non_bathing_context" : "dayuse_only; non_bathing_context",
    "minimum_full_body_target" => "300",
    "required_platforms" => "google_maps|nifty_onsen|yahoo_map",
    "notes" => candidate.fetch("notes")
  }
end
write_csv(File.join(OUTPUT, "#{REGION_ID}_facility_deepresearch_assignment_manifest_#{DATE}.csv"), assignment_headers, assignment_rows)

runtime_headers = %w[
  assignment_order candidate_slug status output_directory last_agent_id last_agent_nickname qa_status next_action updated_at_kst
].freeze
runtime_rows = candidate_rows.each_with_index.map do |candidate, index|
  slug = candidate.fetch("candidate_slug")
  is_deep = DEEP_QUEUE.include?(slug)
  {
    "assignment_order" => (index + 1).to_s,
    "candidate_slug" => slug,
    "status" => if FIRST_BATCH.include?(slug)
                  "pending"
                elsif is_deep
                  "queued_after_batch_01"
                else
                  "candidate_closed_#{CANDIDATE_ONLY.fetch(slug)}"
                end,
    "output_directory" => is_deep ? "deepresearch/#{REGION_ID}_#{DATE}/#{slug}" : "",
    "last_agent_id" => "",
    "last_agent_nickname" => "",
    "qa_status" => is_deep ? "not_started" : "candidate_normalization_accepted",
    "next_action" => is_deep ? "visible_pool_lock_then_deepresearch" : "no_deepresearch_required",
    "updated_at_kst" => checked_at
  }
end
write_csv(File.join(OUTPUT, "#{REGION_ID}_facility_deepresearch_runtime_manifest_#{DATE}.csv"), runtime_headers, runtime_rows)

report = <<~MD
  # 중부·호쿠리쿠·고신 온천시설 파이프라인 시작점

  작성일: #{DATE}

  ## 범위

  - 대상 도도부현: 長野県, 新潟県, 富山県, 石川県, 福井県, 岐阜県
  - 숙박시설은 제외하고 독립 온천시설·명시적 당일입욕 상품만 다룹니다.
  - 후보 34곳 중 실제 입욕 시설 22곳은 visible pool 잠금과 딥리서치 queue에 넣었습니다.
  - route/pass 4곳, 족욕 7곳, 비입욕 음식거리 1곳은 후보 정규화로 종료했습니다.
  - 후보 단계 직접 읽은 리뷰 수는 모든 행에서 0건입니다.

  ## Batch 01

  - 和倉温泉 総湯
  - 野沢温泉 ふるさとの湯
  - 白骨温泉 公共野天風呂
  - 越後湯沢温泉 駒子の湯
  - 越後湯沢温泉 山の湯
  - 宇奈月温泉 総湯 湯めどころ宇奈月

  ## 경계 원칙

  - `幸乃湯`는 숙박 부속 당일입욕이므로 day-use와 숙박·휴지 가족탕을 먼저 분리합니다.
  - 족욕·route/pass·음식거리는 공용 대욕장 후기 분모나 온천수 방식 배지와 합치지 않습니다.
  - 방식 배지는 공식 원문, URL, 확인시각, 욕장 scope가 모두 확보될 때까지 보류합니다.
MD
File.write(File.join(OUTPUT, "#{REGION_ID}_facility_candidate_report_#{DATE}.md"), report)

errors = []
errors << "Expected 34 candidate rows." unless candidate_rows.length == 34
errors << "Expected 22 deep-research rows." unless assignment_rows.length == 22
errors << "Expected 66 pool lock placeholder rows." unless pool_rows.length == 66
errors << "Candidate-stage direct review counts must be zero." unless candidate_rows.all? { |row| row.fetch("direct_reviews_read") == "0" }
errors << "Pool lock direct review counts must be zero." unless pool_rows.all? { |row| row.fetch("direct_reviews_read") == "0" }
abort(errors.join("\n")) unless errors.empty?

puts "Initialized #{candidate_rows.length} candidates, #{assignment_rows.length} deep-research queue rows, and #{pool_rows.length} pool-lock rows."
