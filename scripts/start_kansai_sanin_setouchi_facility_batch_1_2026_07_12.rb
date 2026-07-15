#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "time"

ROOT = File.expand_path("..", __dir__)
DATE = "2026-07-12"
PIPELINE = File.join(ROOT, "research", "onsen-db-seed", "kansai_sanin_setouchi_facility_pipeline_#{DATE}")
MASTER = File.join(PIPELINE, "kansai_sanin_setouchi_facility_master_queue_#{DATE}.csv")
RUNTIME = File.join(PIPELINE, "kansai_sanin_setouchi_facility_deepresearch_runtime_manifest_#{DATE}.csv")
ASSIGNMENT = File.join(PIPELINE, "kansai_sanin_setouchi_facility_deepresearch_assignment_manifest_#{DATE}.csv")

ASSIGNMENTS = {
  "arima-gin-no-yu" => ["019f51e8-f9c5-7ab3-9fdc-a284edd2b11d", "Faraday"],
  "arima-suzurannoyu" => ["019f51e8-fa42-75d3-ba73-25cc24d3818d", "Kierkegaard"],
  "kinosaki-ichino-yu" => ["019f51e8-fad0-7610-b0fb-c9899cf59b70", "Banach"],
  "kinosaki-jizou-yu" => ["019f51e8-fb55-77f3-807d-2ae414d66afa", "Goodall"],
  "kinosaki-mandara-yu" => ["019f51e8-fbfc-7a33-a3e5-cd5353e1842e", "Halley"],
  "kinosaki-yanagi-yu" => ["019f51e8-fc83-74f1-820d-31b9cc289ead", "Descartes"]
}.freeze

def read_csv(path)
  CSV.read(path, headers: true, encoding: "bom|utf-8").map(&:to_h)
end

def write_csv(path, headers, rows)
  CSV.open(path, "w", write_headers: true, headers: headers, encoding: "utf-8") do |csv|
    rows.each { |row| csv << headers.map { |header| row[header] } }
  end
end

now = Time.now.getlocal("+09:00").iso8601
master = read_csv(MASTER)
runtime = read_csv(RUNTIME)

master.each do |row|
  next unless ASSIGNMENTS.key?(row.fetch("candidate_slug"))

  row["pipeline_status"] = "running"
  row["checked_at_kst"] = now
end
write_csv(MASTER, master.first.keys, master)

runtime.each do |row|
  agent = ASSIGNMENTS[row.fetch("candidate_slug")]
  next unless agent

  row["pipeline_status"] = "running"
  row["assigned_agent_id"] = agent[0]
  row["agent_nickname"] = agent[1]
  row["qa_status"] = "not_started"
  row["updated_at_kst"] = now
end
write_csv(RUNTIME, runtime.first.keys, runtime)

headers = %w[
  assignment_order candidate_slug assigned_model assigned_agent_id agent_nickname status output_directory
  scope_contract minimum_full_body_target required_platforms notes
]
assignments = runtime.select { |row| ASSIGNMENTS.key?(row.fetch("candidate_slug")) }.map.with_index do |row, index|
  {
    "assignment_order" => index + 1,
    "candidate_slug" => row.fetch("candidate_slug"),
    "assigned_model" => "gpt-5.6-luna",
    "assigned_agent_id" => row.fetch("assigned_agent_id"),
    "agent_nickname" => row.fetch("agent_nickname"),
    "status" => "running",
    "output_directory" => row.fetch("output_directory"),
    "scope_contract" => row.fetch("scope_contract"),
    "minimum_full_body_target" => 300,
    "required_platforms" => "google_maps|nifty_onsen|yahoo_map",
    "notes" => "Facility worker owns only this output directory. Shared master files are coordinator-owned."
  }
end
write_csv(ASSIGNMENT, headers, assignments)

puts "batch_1 running=#{assignments.length}"
