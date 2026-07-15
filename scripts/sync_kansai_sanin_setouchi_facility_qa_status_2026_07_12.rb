#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "time"

ROOT = File.expand_path("..", __dir__)
DATE = "2026-07-12"
PIPELINE = File.join(ROOT, "research", "onsen-db-seed", "kansai_sanin_setouchi_facility_pipeline_#{DATE}")
MASTER = File.join(PIPELINE, "kansai_sanin_setouchi_facility_master_queue_#{DATE}.csv")
RUNTIME = File.join(PIPELINE, "kansai_sanin_setouchi_facility_deepresearch_runtime_manifest_#{DATE}.csv")

def read_csv(path)
  CSV.read(path, headers: true, encoding: "bom|utf-8").map(&:to_h)
end

def write_csv(path, headers, rows)
  CSV.open(path, "w", write_headers: true, headers: headers, encoding: "utf-8") do |csv|
    rows.each { |row| csv << headers.map { |header| row[header] } }
  end
end

qa_paths = Dir.glob(File.join(PIPELINE, "kansai_sanin_setouchi_facility_batch_*_qa_#{DATE}.csv"))
qa_paths << File.join(PIPELINE, "kansai_sanin_setouchi_facility_boundary_close_qa_#{DATE}.csv")
qa_rows = qa_paths.select { |path| File.file?(path) }.flat_map { |path| read_csv(path) }
by_slug = qa_rows.to_h { |row| [row.fetch("candidate_slug"), row] }
now = Time.now.getlocal("+09:00").iso8601

master = read_csv(MASTER)
runtime = read_csv(RUNTIME)
[master, runtime].each do |rows|
  rows.each do |row|
    qa = by_slug[row.fetch("candidate_slug")]
    next unless qa

    status = qa.fetch("qa_status")
    row["pipeline_status"] = status if row.key?("pipeline_status")
    row["qa_status"] = status if row.key?("qa_status")
    row["direct_reviews_read"] = qa.fetch("full_body_direct_reviews") if row.key?("direct_reviews_read")
    row["qa_disposition"] = qa.fetch("p0_decision") if row.key?("qa_disposition")
    row["qa_artifact_directory"] = qa.fetch("artifact_directory") if row.key?("qa_artifact_directory")
    row["next_action"] = status.start_with?("qa_accepted") ? "Accepted canonical ledger; retain decision=#{qa.fetch('p0_decision')}." : "QA rework required: #{qa.fetch('qa_issues')}" if row.key?("next_action")
    row["notes"] = row.key?("notes") && status == "qa_rework" ? "QA rework required: #{qa.fetch('qa_issues')}" : row["notes"]
    row["checked_at_kst"] = now if row.key?("checked_at_kst")
    row["updated_at_kst"] = now if row.key?("updated_at_kst")
  end
end
write_csv(MASTER, master.first.keys, master)
write_csv(RUNTIME, runtime.first.keys, runtime)
puts "synced=#{by_slug.length}"
