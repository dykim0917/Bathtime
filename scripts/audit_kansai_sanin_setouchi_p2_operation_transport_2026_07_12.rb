#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "fileutils"
require "time"

ROOT = File.expand_path("..", __dir__)
DATE = "2026-07-12"
SEED_ROOT = File.join(ROOT, "research", "onsen-db-seed")
PIPELINE = File.join(SEED_ROOT, "kansai_sanin_setouchi_facility_pipeline_#{DATE}")
SOURCE = File.join(SEED_ROOT, "kansai_sanin_setouchi_facility_candidate_queue_2026-07-10.csv")
MASTER = File.join(PIPELINE, "kansai_sanin_setouchi_facility_master_queue_#{DATE}.csv")

TRANSPORT = {
  "mie-kua-house-nagashima" => "200|https://www.nagashima-onsen.co.jp/",
  "mie-mokumoku-no-yu" => "200|https://www.moku-moku.com/",
  "mie-vison-honzoyu" => "404|https://vison.jp/facility/honzoyu/",
  "kyoto-fushimi-chikara-no-yu" => "200|https://chikara-u.com/",
  "kyoto-ikkyu-kyoto-honkan" => "200|https://www.onsen19.jp/",
  "kyoto-mibu-hananoyu" => "200|https://hanano-yu.jp/",
  "kyoto-nizaemon-no-yu" => "ssl_name_mismatch|https://www.nizaemon.com/",
  "kyoto-tenshonoyu" => "403|https://error.fc2.com/web/403.html",
  "kyoto-uji-genji-no-yu" => "200|https://genji-yu.com/uji/",
  "hyogo-akashi-tatsunoyu" => "200|https://www.tatsunoyu1268.com/",
  "hyogo-amagasaki-yunokaro" => "200|https://www.yunokarou.com/",
  "hyogo-ashiya-spa-suisyun" => "200|https://suisyun.jp/ashiya/",
  "hyogo-himeji-hanayunomori" => "200|https://akanenoyu.com/himeji/",
  "hyogo-takarazuka-takaranoyu" => "200|https://takaranoyu.jp/",
  "kobe-chimujilban-spa-kobe" => "200|https://chimuspa.com/",
  "kobe-james-yama-tsuki-no-yufune" => "200|https://www.tsuki-no-yufune.com/",
  "kobe-nagisa-no-yu" => "200|https://awaawa-kobe.jp/",
  "kobe-taihei-no-yu" => "200|https://www.sentou.co.jp/",
  "shirahama-muronoyu" => "needs_crosscheck_placeholder|http://needs_crosscheck/",
  "shirahama-shirarayu" => "needs_crosscheck_placeholder|http://needs_crosscheck/",
  "osaka-hirakata-suisyun" => "200|https://suisyun.jp/neyagawa/",
  "osaka-kamigata-onsen-ikkyu" => "200|https://www.onsen19.com/",
  "osaka-nijino-yu-osaka-sayama" => "200|https://spa-sauna.jp/",
  "osaka-spa-suminoe" => "200|https://spasuminoe.jp/",
  "osaka-takatsuki-shofuen" => "connect_error|https://www.syofuen.co.jp/",
  "osaka-tsurumi-suisyun" => "200|https://suisyun.jp/tsurumi/",
  "osaka-yukai-no-yu-neyagawa" => "200|https://yukainoyu.jp/neyagawa/home/",
  "shiga-kusatsu-yumoto-suisyun" => "200|https://suisyun.jp/kusatsu/",
  "kagawa-yurari-no-yu" => "200|https://yurarinoyu.jp/",
  "kochi-pokapoka-onsen" => "200|https://kochi-tabi.jp/search_spot_infocenter.html?id=7645",
  "kaike-onsen-ocean" => "needs_crosscheck_placeholder|http://needs_crosscheck/",
  "misasa-tamawari-no-yu" => "needs_crosscheck_placeholder|http://needs_crosscheck/"
}.freeze

def read_csv(path)
  CSV.read(path, headers: true, encoding: "bom|utf-8").map(&:to_h)
end

def write_csv(path, headers, rows)
  CSV.open(path, "w", write_headers: true, headers: headers, encoding: "utf-8") do |csv|
    rows.each { |row| csv << headers.map { |header| row[header] } }
  end
end

rows = read_csv(SOURCE).select { |row| row.fetch("promotion_disposition") == "P2_candidate" }
raise "P2 source mismatch" unless rows.length == TRANSPORT.length
now = Time.now.getlocal("+09:00").iso8601

headers = %w[
  candidate_slug japanese_name prefecture prior_official_url transport_result transport_checked_at
  operation_evidence_status direct_reviews_read review_pool_status next_action notes
]
audit = rows.map do |row|
  result = TRANSPORT.fetch(row.fetch("candidate_slug"))
  transport_ok = result.start_with?("200|")
  status = transport_ok ? "official_transport_responded_content_not_yet_checked" : "operation_recheck_requires_current_evidence"
  next_action = if transport_ok
                  "Open the current operator/authority page and verify current day-use identity/product before review-pool lock; HTTP 200 alone is not operation proof."
                else
                  "Find a current operator, municipal, or tourism page plus an independent same-name/address review surface. Record both as operational evidence; do not turn either into water facts."
                end
  {
    "candidate_slug" => row.fetch("candidate_slug"),
    "japanese_name" => row.fetch("japanese_name"),
    "prefecture" => row.fetch("prefecture"),
    "prior_official_url" => row.fetch("official_url"),
    "transport_result" => result,
    "transport_checked_at" => now,
    "operation_evidence_status" => status,
    "direct_reviews_read" => 0,
    "review_pool_status" => "not_checked_in_transport_audit",
    "next_action" => next_action,
    "notes" => "Candidate-normalization transport audit only. Visible pools and direct review evidence remain unlocked."
  }
end
write_csv(File.join(PIPELINE, "kansai_sanin_setouchi_facility_p2_operation_transport_audit_#{DATE}.csv"), headers, audit)

master = read_csv(MASTER)
master.each do |row|
  audit_row = audit.find { |candidate| candidate.fetch("candidate_slug") == row.fetch("candidate_slug") }
  next unless audit_row

  row["pipeline_status"] = audit_row.fetch("operation_evidence_status")
  row["next_action"] = audit_row.fetch("next_action")
  row["checked_at_kst"] = now
end
write_csv(MASTER, master.first.keys, master)

report = <<~MD
  # Kansai/Sanin/Setouchi P2 Operation Transport Audit (#{DATE})

  - Candidate rows checked: #{audit.length}
  - Official URL transport responded: #{audit.count { |row| row.fetch("operation_evidence_status") == "official_transport_responded_content_not_yet_checked" }}
  - Alternative current-operation evidence required: #{audit.count { |row| row.fetch("operation_evidence_status") == "operation_recheck_requires_current_evidence" }}
  - Direct reviews read: 0

  HTTP response status is deliberately kept separate from current operation. Failed legacy URLs are not treated as closure: the next pass must combine a current operator/authority page with an independent same-name/address review surface before a candidate moves forward.
MD
File.write(File.join(PIPELINE, "kansai_sanin_setouchi_facility_p2_operation_transport_audit_#{DATE}.md"), report, encoding: "utf-8")

puts "P2 transport audit rows=#{audit.length} responded=#{audit.count { |row| row.fetch('operation_evidence_status').start_with?('official_transport') }}"
