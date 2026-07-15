#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "fileutils"
require "time"

DATE = "2026-07-11"
REGION_ID = "hokkaido"
SOURCE_QUEUE = "research/onsen-db-seed/hokkaido-facility-p1-operation-recheck-2026-07-11/hokkaido_facility_candidate_queue_2026-07-11_integrated.csv"
SOURCE_WATER = "research/onsen-db-seed/hokkaido-facility-p1-operation-recheck-2026-07-11/hokkaido_facility_official_water_spotcheck_2026-07-11.csv"
OUTPUT = "research/onsen-db-seed/hokkaido-facility-pipeline-#{DATE}"
ASSET_ROOT = ".agents/skills/bathtime-onsen-facility-review-signal-researcher/assets/regional-pipeline"

FIRST_BATCH = %w[
  noboribetsu-sagiriyu
  jozankei-hoheikyo
  jozankei-yunohana
  hakodate-yachigashira
  yunokawa-yumeguri-butai
  yunokawa-tropical-footbath
].freeze

DEEP_QUEUE = %w[
  noboribetsu-sagiriyu
  jozankei-hoheikyo
  jozankei-yunohana
  hakodate-yachigashira
  yunokawa-yumeguri-butai
  yunokawa-tropical-footbath
  noboribetsu-daiichi-dayuse
  noboribetsu-grand-dayuse
  jozankei-morino-uta-dayuse
  noboribetsu-sekisuitei-dayuse
  noboribetsu-manseikaku-dayuse
  noboribetsu-suzuki-karurusu
  jozankei-shogetsu-dayuse
  jozankei-shikanoyu-dayuse
  hakodate-minamikayabe-hoyou-center
].freeze

SPLIT_CLOSURES = {
  "jozankei-hanakaede-dayuse" => "jozankei-shikanoyu-dayuse",
  "hakodate-hiromesou" => "hakodate-minamikayabe-hoyou-center"
}.freeze

CHILDREN = {
  "jozankei-shikanoyu-dayuse" => {
    "candidate_track" => "traditional_onsen_facility",
    "korean_name" => "조잔케이 시카노유 당일입욕",
    "japanese_name" => "定山渓 鹿の湯 日帰り入浴",
    "aliases" => "鹿の湯;ホテル鹿の湯;定山渓 鹿の湯",
    "facility_type" => "large_day_use_complex",
    "facility_model" => "bathe",
    "archetype" => "public_bathing_facility",
    "lodging_available" => "true",
    "prefecture" => "北海道",
    "municipality" => "札幌市南区",
    "onsen_area" => "定山渓温泉",
    "official_url" => "https://shikanoyu.co.jp/shikanoyu/news/621",
    "map_or_review_url" => "https://map.yahoo.co.jp/v3/place/RZZ26llNEcU",
    "product_strength" => "당일입욕 대욕장과 사우나·식사 결합 상품",
    "prior_tier" => "Tier 2 split child",
    "korean_demand_signal" => "not_checked_in_candidate_seed",
    "visible_review_pool_state" => "not_locked_scope_mixed_lodging",
    "water_profile_mode" => "facility_representative_profile",
    "official_water_profile_status" => "needs_official_water_profile_lock",
    "scope_status" => "dayuse_boundary_needed",
    "operation_status" => "current_operator_product_boundary_rechecked",
    "cleanup_status" => "keep_facility",
    "verification_status" => "current_operation_and_independent_surface_rechecked",
    "promotion_disposition" => "P1_candidate_after_split",
    "next_priority" => "queued_after_batch_01",
    "tier_reason" => "기존 혼합 행을 시카노유 당일입욕 범위로 분리",
    "source_urls" => "https://shikanoyu.co.jp/shikanoyu/news/621 | https://map.yahoo.co.jp/v3/place/RZZ26llNEcU",
    "notes" => "花もみじ 숙박 욕장과 호텔 리뷰는 dayuse_only 분모에서 제외"
  },
  "hakodate-minamikayabe-hoyou-center" => {
    "candidate_track" => "traditional_onsen_facility",
    "korean_name" => "하코다테 남카야베 보양센터",
    "japanese_name" => "南かやべ保養センター",
    "aliases" => "ホテル函館ひろめ荘 隣接保養センター;大船温泉 上の湯",
    "facility_type" => "public_bath_facility",
    "facility_model" => "bathe",
    "archetype" => "public_bathing_facility",
    "lodging_available" => "false",
    "prefecture" => "北海道",
    "municipality" => "函館市",
    "onsen_area" => "南茅部・大船温泉",
    "official_url" => "https://www.city.hakodate.hokkaido.jp/docs/2020013000086/",
    "map_or_review_url" => "https://map.yahoo.co.jp/v3/place/yLDW81wTcTQ",
    "product_strength" => "인접 호텔과 분리된 공공 당일입욕·서로 다른 두 원천 후보",
    "prior_tier" => "Tier 2 split child",
    "korean_demand_signal" => "not_checked_in_candidate_seed",
    "visible_review_pool_state" => "not_locked_scope_mixed_lodging",
    "water_profile_mode" => "facility_representative_profile",
    "official_water_profile_status" => "needs_official_water_profile_lock",
    "scope_status" => "dayuse_boundary_needed",
    "operation_status" => "municipal_scope_rechecked",
    "cleanup_status" => "keep_facility",
    "verification_status" => "municipal_authority_and_hotel_identity_crosschecked",
    "promotion_disposition" => "P1_candidate_after_split",
    "next_priority" => "queued_after_batch_01",
    "tier_reason" => "호텔 히로메소 숙박 욕장과 당일입욕 보양센터를 분리",
    "source_urls" => "https://www.city.hakodate.hokkaido.jp/docs/2020013000086/ | https://www.hakobura.jp/spots/889",
    "notes" => "호텔 숙박 욕장과 연결 건물의 day-use 공공욕장을 별도 scope와 리뷰 분모로 처리"
  }
}.freeze

def read_csv(path)
  CSV.read(path, headers: true, encoding: "bom|utf-8").map(&:to_h)
end

def write_csv(path, headers, rows)
  CSV.open(path, "w", write_headers: true, headers: headers, encoding: "utf-8") do |csv|
    rows.each { |row| csv << headers.map { |header| row.fetch(header, "") } }
  end
end

def scope_contract(slug)
  return "dayuse_only; facility_area=footbath; non_bathing_context; do_not_compare_with_full_bathing_facility" if slug.start_with?("yunokawa-")
  return "dayuse_only; lodging_bath_only; room_bath; private_bath; non_bathing_context; exclude_hotel_provider_reviews_unless_dayuse_is_explicit" if %w[noboribetsu-daiichi-dayuse noboribetsu-grand-dayuse].include?(slug)
  return "dayuse_only; meal_bundle_context; spa_addon_context; lodging_bath_only; non_bathing_context" if slug == "jozankei-morino-uta-dayuse"
  return "dayuse_only; hanamomiji_lodging_bath_only; sauna_context; food_context; non_bathing_context" if slug == "jozankei-shikanoyu-dayuse"
  return "dayuse_only; hiromesou_lodging_bath_only; non_bathing_context" if slug == "hakodate-minamikayabe-hoyou-center"
  return "dayuse_only; lodging_bath_only; non_bathing_context" if slug.include?("dayuse") || slug.include?("suzuki")

  "dayuse_only; non_bathing_context"
end

def target_for(row)
  row.fetch("facility_model") == "stopover" ? "50" : "300"
end

candidate_headers = CSV.read(File.join(ASSET_ROOT, "candidate_queue_template.csv"), headers: true).headers.freeze
pool_headers = CSV.read(File.join(ASSET_ROOT, "review_pool_lock_template.csv"), headers: true).headers.freeze
assignment_headers = CSV.read(File.join(ASSET_ROOT, "deepresearch_assignment_manifest_template.csv"), headers: true).headers.freeze

qa_headers = CSV.read(File.join(ASSET_ROOT, "deepresearch_qa_template.csv"), headers: true).headers.freeze
runtime_headers = %w[
  assignment_order candidate_slug status output_directory last_agent_id last_agent_nickname qa_status next_action updated_at_kst
].freeze
water_headers = %w[
  candidate_slug japanese_name official_water_profile_status spring_quality_original official_water_text_original
  official_source_url official_source_checked_at water_scope water_method_badge_policy
].freeze

FileUtils.mkdir_p(OUTPUT)
checked_at = Time.now.getlocal("+09:00").iso8601
source_rows = read_csv(SOURCE_QUEUE)
water_by_slug = read_csv(SOURCE_WATER).to_h { |row| [row.fetch("candidate_slug"), row] }

candidate_rows = source_rows.map do |row|
  row = row.dup
  if SPLIT_CLOSURES.key?(row.fetch("candidate_slug"))
    row["promotion_disposition"] = "candidate_closed_split_into_#{SPLIT_CLOSURES.fetch(row.fetch('candidate_slug'))}"
    row["next_priority"] = "child_queue_created"
    row["notes"] = "#{row.fetch('notes')} 원래 혼합 후보행은 정규화에서 종료하고 child slug로 전환."
  elsif FIRST_BATCH.include?(row.fetch("candidate_slug"))
    row["next_priority"] = "batch_01"
  elsif DEEP_QUEUE.include?(row.fetch("candidate_slug"))
    row["next_priority"] = "queued_after_batch_01"
  end
  row
end

CHILDREN.each do |slug, child|
  candidate_rows << child.merge("candidate_slug" => slug, "direct_reviews_read" => "0")
end

raise "Expected 17 normalized candidate rows, got #{candidate_rows.length}." unless candidate_rows.length == 17
raise "Deep queue must be unique." unless DEEP_QUEUE.uniq.length == DEEP_QUEUE.length
raise "Deep queue not found in candidate rows." unless (DEEP_QUEUE - candidate_rows.map { |row| row.fetch("candidate_slug") }).empty?
raise "Candidate closures must not be in deep queue." unless (SPLIT_CLOSURES.keys & DEEP_QUEUE).empty?
raise "Candidate-stage direct review counts must be zero." unless candidate_rows.all? { |row| row.fetch("direct_reviews_read") == "0" }

write_csv(File.join(OUTPUT, "#{REGION_ID}_facility_candidate_queue_#{DATE}.csv"), candidate_headers, candidate_rows)

water_rows = candidate_rows.map do |row|
  source = water_by_slug[row.fetch("candidate_slug")] || {}
  {
    "candidate_slug" => row.fetch("candidate_slug"),
    "japanese_name" => row.fetch("japanese_name"),
    "official_water_profile_status" => row.fetch("official_water_profile_status"),
    "spring_quality_original" => source.fetch("spring_quality_original", ""),
    "official_water_text_original" => source.fetch("official_water_text_original", ""),
    "official_source_url" => source.fetch("official_source_url", row.fetch("official_url")),
    "official_source_checked_at" => source.fetch("official_source_checked_at", ""),
    "water_scope" => source.fetch("water_scope", row.fetch("scope_status")),
    "water_method_badge_policy" => source.fetch("water_method_badge_policy", "no_method_badge_without_official_original_text_url_checked_at_and_explicit_bath_scope")
  }
end
write_csv(File.join(OUTPUT, "#{REGION_ID}_facility_official_water_spotcheck_#{DATE}.csv"), water_headers, water_rows)

pool_rows = DEEP_QUEUE.each_with_index.flat_map do |slug, candidate_index|
  candidate = candidate_rows.find { |row| row.fetch("candidate_slug") == slug }
  %w[google_maps nifty_onsen yahoo_map].each_with_index.map do |platform, platform_index|
    {
      "lock_order" => (candidate_index * 3 + platform_index + 1).to_s,
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
      "scope_note" => "후보 단계: visible pool 잠금 전, 직접 읽은 리뷰 0"
    }
  end
end
write_csv(File.join(OUTPUT, "#{REGION_ID}_facility_review_pool_lock_#{DATE}.csv"), pool_headers, pool_rows)

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
    "scope_contract" => scope_contract(slug),
    "minimum_full_body_target" => target_for(candidate),
    "required_platforms" => "google_maps|nifty_onsen|yahoo_map",
    "notes" => candidate.fetch("notes")
  }
end
write_csv(File.join(OUTPUT, "#{REGION_ID}_facility_deepresearch_assignment_manifest_#{DATE}.csv"), assignment_headers, assignment_rows)

runtime_rows = candidate_rows.each_with_index.map do |candidate, index|
  slug = candidate.fetch("candidate_slug")
  is_deep = DEEP_QUEUE.include?(slug)
  {
    "assignment_order" => (index + 1).to_s,
    "candidate_slug" => slug,
    "status" => if SPLIT_CLOSURES.key?(slug)
                  "candidate_closed_split"
                elsif FIRST_BATCH.include?(slug)
                  "pending"
                elsif is_deep
                  "queued_after_batch_01"
                else
                  "candidate_closed_#{candidate.fetch('cleanup_status')}"
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
  # 홋카이도 온천시설 파이프라인 시작점

  작성일: #{DATE}

  ## 범위와 소유권

  - 범위: 홋카이도 전역. 다른 도도부현 후보는 확장하지 않는다.
  - 기존 전국 시설 마스터의 홋카이도 행은 15건이었다.
  - `鹿の湯・花もみじ`와 `ホテル函館ひろめ荘`는 각 1행이 여러 사용자 결정 단위를 섞고 있어, 원 행 2건을 후보 정규화에서 종료하고 `定山渓 鹿の湯 日帰り入浴`, `南かやべ保養センター` 자식 후보 2건을 생성했다.
  - 실제 딥리서치 queue는 15건이며, 원 혼합행 2건은 `candidate_closed_split`이다.
  - 후보 단계의 직접 읽은 리뷰 수는 모든 행에서 0건이다.

  ## 권역

  - 삿포로·조잔케이: 豊平峡温泉, 湯の花 定山渓殿, 森の謌, 章月, 鹿の湯
  - 노보리베쓰·가루루스: さぎり湯, 第一滝本館, 登別グランドホテル, 石水亭, 万世閣, 鈴木旅館
  - 하코다테·유노카와·도난: 谷地頭温泉, 두 족탕, 南かやべ保養センター

  ## Batch 01

  - 登別温泉 さぎり湯
  - 豊平峡温泉
  - 湯の花 定山渓殿
  - 谷地頭温泉
  - 湯の川温泉足湯「湯巡り舞台」
  - 函館市熱帯植物園足湯

  ## 경계 원칙

  - 호텔 부속 day-use는 숙박, 객실탕, 가족탕, 식사·스파, 비입욕 맥락을 `dayuse_only` 분모와 분리한다.
  - 족탕은 `stopover`로 평가하고 전신 입욕시설의 수질·혼잡 기준과 비교하지 않는다.
  - visible review pool, snippet, topic chip, OTA 공급자 카드는 직접 읽은 리뷰가 아니다.
  - 공식 수질·운용 방식은 원문, URL, 확인시각, 욕장 scope가 모두 확보될 때에만 사용한다.
MD
File.write(File.join(OUTPUT, "#{REGION_ID}_facility_candidate_report_#{DATE}.md"), report, encoding: "utf-8")

puts "Initialized #{candidate_rows.length} normalized candidates, #{assignment_rows.length} deep-research queue rows, and #{pool_rows.length} review-pool lock rows."
