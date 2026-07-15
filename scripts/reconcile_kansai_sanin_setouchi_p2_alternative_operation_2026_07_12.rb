#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "time"

ROOT = File.expand_path("..", __dir__)
DATE = "2026-07-12"
PIPELINE = File.join(ROOT, "research", "onsen-db-seed", "kansai_sanin_setouchi_facility_pipeline_#{DATE}")
MASTER = File.join(PIPELINE, "kansai_sanin_setouchi_facility_master_queue_#{DATE}.csv")

EVIDENCE = {
  "mie-vison-honzoyu" => {
    prior_status: "http_404",
    type: "operator_current_page",
    url: "https://vison.jp/shop/detail.php?id=63",
    operation: "Current VISON page identifies Honzoyu as a day-use bathing facility and publishes 06:00-24:00 use hours.",
    independent: "https://map.yahoo.co.jp/v3/place/ybdxafOVk6g",
    independent_note: "Yahoo Map listing shows Honzoyu, the VISON address, and 113 visible reviews. This is a visible pool, not direct review evidence.",
    decision: "pending_review_pool_lock",
    action: "Lock Google/Nifty/Yahoo title-address counts, then review whether the herbal-bath product has a service-appropriate water profile."
  },
  "kyoto-nizaemon-no-yu" => {
    prior_status: "ssl_name_mismatch",
    type: "tourism_authority_current_page",
    url: "https://www.onsen-tourism.kyoto/LB/LB_nizaemon.html",
    operation: "Kyoto tourism source identifies Nizaemon-no-yu as the named facility and lists it as open year-round.",
    independent: "",
    independent_note: "No numeric same-name/address review surface locked in this pass.",
    decision: "pending_review_pool_lock",
    action: "Lock an independent map/review listing by official name and address before promotion; do not convert tourism text into a water-method badge."
  },
  "kyoto-tenshonoyu" => {
    prior_status: "http_403_legacy_fc2",
    type: "tourism_authority_current_page",
    url: "https://www.kyoto-kankou.or.jp/info_search/8730",
    operation: "Kyoto tourism source lists TenSho-no-Yu Daimon with day-use hours 15:00-24:00 and Tuesday closure.",
    independent: "",
    independent_note: "No numeric same-name/address review surface locked in this pass.",
    decision: "pending_review_pool_lock",
    action: "Lock an independent map/review listing before P1 promotion. Keep the authority water text scoped to the named open-air bath until its method fields are complete."
  },
  "osaka-takatsuki-shofuen" => {
    prior_status: "connect_error",
    type: "municipal_tourism_authority",
    url: "https://www.takatsuki-kankou.org/spot/100/",
    operation: "Takatsuki tourism source identifies Shofuen as a day-use facility and lists 10:00-24:00 operation with a 23:00 last entry.",
    independent: "",
    independent_note: "No numeric same-name/address review surface locked in this pass.",
    decision: "pending_review_pool_lock",
    action: "Lock an independent map/review listing before P1 promotion; treat family-bath pages as a separate bath area."
  },
  "shirahama-muronoyu" => {
    prior_status: "needs_crosscheck_placeholder",
    type: "municipal_current_page",
    url: "https://www.town.shirahama.wakayama.jp/soshiki/kanko/koen/shisetsu/pubric_spa/1450338114888.html",
    operation: "Shirahama Town page updated 2025-03-01 identifies Muro-no-Yu, publishes visitor hours and fees, and names the two supplied sources.",
    independent: "",
    independent_note: "No numeric map/review count locked in this pass.",
    decision: "pending_review_pool_lock",
    action: "Lock Google/Nifty/Yahoo listing identity and counts. Treat the two-source public bath as a facility representative profile with named source scope, not as a method badge."
  },
  "shirahama-shirarayu" => {
    prior_status: "needs_crosscheck_placeholder",
    type: "municipal_current_page",
    url: "https://www.town.shirahama.wakayama.jp/soshiki/kanko/koen/shisetsu/pubric_spa/1450338453414.html",
    operation: "Shirahama Town currently lists Shirara-yu as a municipal bath; a 2026 notice also confirms it resumed operation after a temporary closure.",
    independent: "",
    independent_note: "No numeric map/review count locked in this pass.",
    decision: "pending_review_pool_lock",
    action: "Lock an individual bath review surface before promotion; exclude Shirarahama beach and seasonal Shirasuna product context."
  },
  "kaike-onsen-ocean" => {
    prior_status: "needs_crosscheck_placeholder",
    type: "operator_current_page",
    url: "https://ocean-g.com/index.html",
    operation: "Operator page identifies Ocean as a day-use onsen with bath, private-spa, restaurant, and business-hotel products.",
    independent: "",
    independent_note: "No numeric map/review count locked in this pass.",
    decision: "P0_boundary_first",
    action: "First split day-use public bath, private spa/family bath, restaurant, and business-hotel review denominators; then lock only scope-matched listings."
  },
  "misasa-tamawari-no-yu" => {
    prior_status: "needs_crosscheck_placeholder",
    type: "municipal_planning_document",
    url: "https://www.town.misasa.tottori.jp/files/56772.pdf",
    operation: "Misasa Town planning document records Tamawari-no-Yu ended operations at the end of March 2023 and discusses a replacement facility.",
    independent: "",
    independent_note: "No current operation surface is locked because the named facility is not a current day-use candidate.",
    decision: "candidate_qa_hold",
    action: "Do not collect direct reviews for the closed named facility. Re-identify a replacement only after it has a current official identity and independent review surface."
  }
}.freeze

def read_csv(path)
  CSV.read(path, headers: true, encoding: "bom|utf-8").map(&:to_h)
end

def write_csv(path, headers, rows)
  CSV.open(path, "w", write_headers: true, headers: headers, encoding: "utf-8") do |csv|
    rows.each { |row| csv << headers.map { |header| row[header] } }
  end
end

master = read_csv(MASTER)
now = Time.now.getlocal("+09:00").iso8601
headers = %w[
  candidate_slug japanese_name prior_official_url prior_status current_operation_source_type current_operation_url
  current_operation_evidence independent_operation_surface_url independent_surface_evidence revised_pipeline_status
  source_checked_at direct_reviews_read next_action
]
rows = EVIDENCE.map do |slug, evidence|
  candidate = master.find { |row| row.fetch("candidate_slug") == slug }
  raise "missing #{slug}" unless candidate
  candidate["pipeline_status"] = evidence.fetch(:decision)
  candidate["next_action"] = evidence.fetch(:action)
  candidate["checked_at_kst"] = now
  {
    "candidate_slug" => slug,
    "japanese_name" => candidate.fetch("japanese_name"),
    "prior_official_url" => candidate.fetch("official_url"),
    "prior_status" => evidence.fetch(:prior_status),
    "current_operation_source_type" => evidence.fetch(:type),
    "current_operation_url" => evidence.fetch(:url),
    "current_operation_evidence" => evidence.fetch(:operation),
    "independent_operation_surface_url" => evidence.fetch(:independent),
    "independent_surface_evidence" => evidence.fetch(:independent_note),
    "revised_pipeline_status" => evidence.fetch(:decision),
    "source_checked_at" => now,
    "direct_reviews_read" => 0,
    "next_action" => evidence.fetch(:action)
  }
end
write_csv(MASTER, master.first.keys, master)
write_csv(File.join(PIPELINE, "kansai_sanin_setouchi_facility_alternative_operation_evidence_#{DATE}.csv"), headers, rows)
puts "alternative evidence rows=#{rows.length}"
