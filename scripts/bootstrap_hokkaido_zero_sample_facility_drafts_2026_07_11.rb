#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "fileutils"
require "json"

DATE = "2026-07-11"
ROOT = "/Users/exem/DK/BathSommelier/research/onsen-db-seed"
QUEUE = File.join(ROOT, "hokkaido-facility-pipeline-#{DATE}", "hokkaido_facility_candidate_queue_#{DATE}.csv")
OUTPUT_ROOT = File.join(ROOT, "deepresearch", "hokkaido_#{DATE}")
DEFAULT_SLUGS = %w[
  jozankei-morino-uta-dayuse
  jozankei-shikanoyu-dayuse
  hakodate-minamikayabe-hoyou-center
].freeze
SLUGS = ARGV.empty? ? DEFAULT_SLUGS : ARGV.freeze

LEDGER_HEADERS = %w[
  review_id platform review_url author_or_publisher review_date_or_relative rating language
  sampling_stratum facility_area facility_area_confidence content_type direct_body_status
  review_count_eligible facility_related scope_bucket dedupe_key short_paraphrase
  original_keyword access_note
].freeze
SIGNAL_HEADERS = %w[
  facility_slug facility_area facility_area_confidence signal_type signal_direction
  mention_count source_count platform_count platforms water_texture_subtype color_tag
  contradiction_level review_signal_status publishable_item evidence_basis notes
].freeze

def write_header_only(path, headers)
  CSV.open(path, "w", write_headers: true, headers: headers, encoding: "utf-8") {}
end

candidates = CSV.read(QUEUE, headers: true, encoding: "bom|utf-8").map(&:to_h).to_h { |row| [row.fetch("candidate_slug"), row] }

SLUGS.each do |slug|
  row = candidates.fetch(slug)
  directory = File.join(OUTPUT_ROOT, slug)
  FileUtils.mkdir_p(directory)
  files = Dir.children(directory)
  abort("#{slug}: expected empty output directory, found #{files.join(', ')}") unless files.empty?

  ledger_path = File.join(directory, "#{slug}_direct_review_sample_index_#{DATE}.csv")
  signal_path = File.join(directory, "#{slug}_facility_review_signal_rows_#{DATE}.csv")
  mapping_path = File.join(directory, "#{slug}_facility_platform_mapping_#{DATE}.json")
  summary_path = File.join(directory, "#{slug}_facility_review_signal_summary_#{DATE}.md")
  write_header_only(ledger_path, LEDGER_HEADERS)
  write_header_only(signal_path, SIGNAL_HEADERS)

  scope_note = case slug
               when "jozankei-morino-uta-dayuse"
                 "식사·입욕·스파 결합 상품과 숙박 리뷰가 혼재한다."
               when "jozankei-shikanoyu-dayuse"
                 "鹿の湯 당일입욕과 花もみじ 숙박 욕장·사우나·식사 맥락을 분리해야 한다."
               else
                 "南かやべ保養センター 당일입욕과 호텔函館ひろめ荘 숙박 욕장을 분리해야 한다."
               end
  mapping = {
    "research_date" => DATE,
    "scope" => "hokkaido facility direct-review pipeline",
    "method" => "candidate-boundary evidence retained; no direct review body was available for canonical inclusion in this execution",
    "direct_review_sampling_status" => "zero_sample_draft_requires_reinforcement",
    "identity" => {
      "candidate_slug" => slug,
      "official_name_ja" => row.fetch("japanese_name"),
      "korean_name" => row.fetch("korean_name"),
      "aliases" => row.fetch("aliases").to_s.split(";").map(&:strip).reject(&:empty?),
      "prefecture" => row.fetch("prefecture"),
      "municipality" => row.fetch("municipality"),
      "onsen_area" => row.fetch("onsen_area"),
      "facility_type" => row.fetch("facility_type"),
      "facility_model" => row.fetch("facility_model"),
      "official_url" => row.fetch("official_url")
    },
    "canonical_ledger_path" => ledger_path,
    "visible_pools" => %w[google_maps nifty_onsen yahoo_map].to_h do |platform|
      [platform, {
        "listing_title" => "",
        "rating" => nil,
        "count" => nil,
        "visible_review_count" => nil,
        "url" => "",
        "identity_match" => "candidate_identity_only",
        "decision_scope_pool_status" => "not_locked_scope_mixed_lodging",
        "observed_at_kst" => DATE,
        "collection_method" => "no canonical direct-body result delivered in this execution",
        "directly_read_reviews" => 0,
        "access_status" => "not_available_for_canonical_sampling"
      }]
    end,
    "counts" => {
      "raw" => 0,
      "deduped" => 0,
      "full_eligible" => 0,
      "full_eligible_direct_use" => 0,
      "eligible" => 0,
      "facility_related_direct_use" => 0,
      "dayuse" => 0,
      "lodging" => 0,
      "non_use" => 0,
      "partial" => 0,
      "context" => 0,
      "excluded" => 0,
      "signals" => 0,
      "publishable" => 0
    },
    "platform_counts" => {},
    "direct_body_platform_count" => 0,
    "official_water_profile_status" => row.fetch("official_water_profile_status"),
    "review_signal_contract_status" => "header_only_canonical_ledger; no direct review signal claims; no source_flow_claim rows",
    "termination" => {
      "status" => "zero_sample_draft",
      "target_300_reached" => false,
      "accessible_direct_body_rows" => 0,
      "eligible_dayuse_rows" => 0,
      "remaining_visible_pool" => "not locked; exact day-use review surfaces require reinforcement",
      "blocked_or_unreadable" => ["No canonical full-body review result was retained for this facility during the current execution."],
      "reason_for_termination" => "Scope boundary is verified, but direct day-use review sampling was not completed. Keep as draft and reinforce before service publication."
    },
    "caution_keywords" => ["scope_mixed", "hotel_lodging", "dayuse_boundary", "official_water_profile_reinforcement"],
    "next_sampling" => [scope_note, "Lock an exact day-use listing before any direct-review count is claimed."]
  }
  File.write(mapping_path, JSON.pretty_generate(mapping) + "\n", encoding: "utf-8")

  File.write(summary_path, <<~MD, encoding: "utf-8")
    # #{row.fetch("japanese_name")} Direct Review Draft

    ## 수집 브리핑
    - 직접 확인한 적격 당일입욕 본문: 0건
    - 직접 본문 플랫폼: 0곳
    - 판정: `draft`
    - 이 파일은 후보 검증 근거를 리뷰 신호와 분리한 0건 원장이다. 플랫폼상 리뷰풀이나 검색 스니펫을 직접 리뷰 수로 쓰지 않았다.

    ## 경계와 운영 사실
    - 공식 URL: #{row.fetch("official_url")}
    - #{scope_note}
    - 공식 온천수 프로필 상태: `#{row.fetch("official_water_profile_status")}`

    ## Gaps
    - exact day-use 리뷰풀 잠금 필요
    - Google/Nifty/Yahoo의 숙박·혼합 표면을 당일입욕 분모로 전환하지 않음
    - 서비스 반영 전 direct-body reinforcement 필요
  MD
end

puts "Bootstrapped #{SLUGS.length} zero-sample draft artifact sets."
