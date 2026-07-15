#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "fileutils"

ROOT = File.expand_path("..", __dir__)
DATE = "2026-07-12"
SEED = File.join(ROOT, "research", "onsen-db-seed")
PIPELINE = File.join(SEED, "kansai_sanin_setouchi_facility_pipeline_#{DATE}")
BASELINE = File.join(SEED, "kansai_sanin_setouchi_facility_deepresearch_qa_2026-07-11.csv")
MASTER = File.join(PIPELINE, "kansai_sanin_setouchi_facility_master_queue_#{DATE}.csv")
OUTPUT = File.join(PIPELINE, "kansai_sanin_setouchi_facility_deepresearch_qa_#{DATE}.csv")
REPORT = File.join(PIPELINE, "kansai_sanin_setouchi_facility_deepresearch_qa_report_#{DATE}.md")

def read_csv(path)
  CSV.read(path, headers: true, encoding: "bom|utf-8").map(&:to_h)
end

def write_csv(path, headers, rows)
  CSV.open(path, "w", write_headers: true, headers: headers, encoding: "utf-8") do |csv|
    rows.each { |row| csv << headers.map { |header| row[header] } }
  end
end

baseline = read_csv(BASELINE)
headers = baseline.first.keys
qa_files = Dir.glob(File.join(PIPELINE, "kansai_sanin_setouchi_facility_batch_*_qa_#{DATE}.csv"))
boundary_qa = File.join(PIPELINE, "kansai_sanin_setouchi_facility_boundary_close_qa_#{DATE}.csv")
qa_files << boundary_qa if File.file?(boundary_qa)
new_rows = qa_files.flat_map { |path| read_csv(path) }.select { |row| row.fetch("qa_status").start_with?("qa_accepted") }
by_slug = baseline.to_h { |row| [row.fetch("candidate_slug"), row] }
new_rows.each { |row| by_slug[row.fetch("candidate_slug")] = row.slice(*headers) }
integrated = by_slug.values.sort_by { |row| row.fetch("candidate_slug") }
write_csv(OUTPUT, headers, integrated)

master = read_csv(MASTER)
pending = master.reject { |row| row.fetch("pipeline_status").start_with?("qa_accepted") }
decisions = integrated.group_by { |row| row.fetch("p0_decision") }.transform_values(&:length)
full_bodies = integrated.sum { |row| row.fetch("full_body_direct_reviews").to_i }
visible = integrated.sum { |row| row.fetch("google_visible_pool").to_i + row.fetch("nifty_visible_pool").to_i + row.fetch("yahoo_visible_pool").to_i }

report = <<~MD
  # Kansai/Sanin/Setouchi Facility Integrated QA (#{DATE})

  - Canonical QA facilities: #{integrated.length}
  - Eligible direct day-use review bodies: #{full_bodies}
  - Locked visible pool sum: #{visible} (not included in direct-review totals)
  - Decisions: #{decisions}
  - Remaining queue rows: #{pending.length}

  This file combines only pre-existing canonical QA rows and individual facility QA rows accepted from the 2026-07-12 runtime. It does not fabricate aggregate review counts, change candidate-stage direct counts, or convert a visible pool into a direct sample. Pending, boundary, operation-recheck, and worker-running rows remain outside the accepted deep-research QA until their own canonical ledger passes.
MD
File.write(REPORT, report, encoding: "utf-8")
puts "integrated=#{integrated.length} pending=#{pending.length}"
