#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "time"

ROOT = File.expand_path("..", __dir__)
DATE = "2026-07-12"
PIPELINE = File.join(ROOT, "research", "onsen-db-seed", "kansai_sanin_setouchi_facility_pipeline_#{DATE}")
MASTER = File.join(PIPELINE, "kansai_sanin_setouchi_facility_master_queue_#{DATE}.csv")

def read_csv(path)
  CSV.read(path, headers: true, encoding: "bom|utf-8").map(&:to_h)
end

def write_csv(path, headers, rows)
  CSV.open(path, "w", write_headers: true, headers: headers, encoding: "utf-8") do |csv|
    rows.each { |row| csv << headers.map { |header| row[header] } }
  end
end

def contract(row)
  slug = row.fetch("candidate_slug")
  return "Route/pass only. Never merge its review bodies into any individual sotoyu or Dogo bath denominator." if row.fetch("facility_model") == "route_or_pass"
  return "Footbath/stopover only. Keep it out of full-bathing comparisons and do not inherit area lodging reviews." if row.fetch("cleanup_status") == "footbath_only"
  return "Closed, rebuilding, or identity-conflicted candidate. Lock current operation before any review-pool mapping." if %w[exclude_or_hold operation_recheck].include?(row.fetch("cleanup_status")) || row.fetch("pipeline_status") == "operation_recheck"
  return "Separate the named facility's public day-use bath from lodging guest baths, room baths, family/private baths, and restaurant/stay reviews." if row.fetch("lodging_available") == "true" || row.fetch("scope_status") == "dayuse_boundary_needed"
  return "Split product hub or mixed facility into a named user decision unit before direct review sampling." if row.fetch("scope_status") == "split_needed"

  "Confirm the candidate's individual facility scope before sampling."
end

rows = read_csv(MASTER).select { |row| row.fetch("pipeline_status") == "P0_boundary_first" }
headers = %w[
  boundary_order candidate_slug japanese_name prefecture facility_model cleanup_status scope_status
  boundary_contract direct_reviews_read gate_status next_action checked_at_kst
]
now = Time.now.getlocal("+09:00").iso8601
output = rows.map.with_index do |row, index|
  {
    "boundary_order" => index + 1,
    "candidate_slug" => row.fetch("candidate_slug"),
    "japanese_name" => row.fetch("japanese_name"),
    "prefecture" => row.fetch("prefecture"),
    "facility_model" => row.fetch("facility_model"),
    "cleanup_status" => row.fetch("cleanup_status"),
    "scope_status" => row.fetch("scope_status"),
    "boundary_contract" => contract(row),
    "direct_reviews_read" => 0,
    "gate_status" => "P0_boundary_first",
    "next_action" => "Write an official product-scope fact, lock a scope-matched visible pool, then reclassify to a single facility worker or candidate hold.",
    "checked_at_kst" => now
  }
end
write_csv(File.join(PIPELINE, "kansai_sanin_setouchi_facility_scope_boundary_queue_#{DATE}.csv"), headers, output)
puts "boundary rows=#{output.length}"
