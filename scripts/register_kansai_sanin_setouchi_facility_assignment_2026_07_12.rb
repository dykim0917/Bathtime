#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "optparse"
require "time"

ROOT = File.expand_path("..", __dir__)
DATE = "2026-07-12"
PIPELINE = File.join(ROOT, "research", "onsen-db-seed", "kansai_sanin_setouchi_facility_pipeline_#{DATE}")
MASTER = File.join(PIPELINE, "kansai_sanin_setouchi_facility_master_queue_#{DATE}.csv")
RUNTIME = File.join(PIPELINE, "kansai_sanin_setouchi_facility_deepresearch_runtime_manifest_#{DATE}.csv")
ASSIGNMENT = File.join(PIPELINE, "kansai_sanin_setouchi_facility_deepresearch_assignment_manifest_#{DATE}.csv")

options = {}
OptionParser.new do |parser|
  parser.on("--slug SLUG") { |value| options[:slug] = value }
  parser.on("--batch NAME") { |value| options[:batch] = value }
  parser.on("--agent-id ID") { |value| options[:agent_id] = value }
  parser.on("--nickname NAME") { |value| options[:nickname] = value }
  parser.on("--scope TEXT") { |value| options[:scope] = value }
end.parse!
%i[slug batch agent_id nickname scope].each { |key| abort("--#{key.to_s.tr('_', '-')} is required") unless options[key] }

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
row = master.find { |candidate| candidate.fetch("candidate_slug") == options.fetch(:slug) } or abort("unknown slug")
run = runtime.find { |candidate| candidate.fetch("candidate_slug") == options.fetch(:slug) } or abort("runtime row missing")

row["pipeline_status"] = "running"
row["batch"] = options.fetch(:batch)
row["scope_contract"] = options.fetch(:scope)
row["next_action"] = "Dedicated worker collecting only scope-matched direct day-use review bodies."
row["checked_at_kst"] = now
run["pipeline_status"] = "running"
run["batch"] = options.fetch(:batch)
run["assigned_model"] = "gpt-5.6-luna"
run["assigned_agent_id"] = options.fetch(:agent_id)
run["agent_nickname"] = options.fetch(:nickname)
run["output_directory"] = "deepresearch/kansai_sanin_setouchi_#{DATE}/#{options.fetch(:slug)}"
run["scope_contract"] = options.fetch(:scope)
run["minimum_full_body_target"] = 300
run["required_platforms"] = "google_maps|nifty_onsen|yahoo_map"
run["direct_reviews_read"] = 0
run["qa_status"] = "not_started"
run["updated_at_kst"] = now
run["notes"] = "Worker owns only the dedicated output directory."
write_csv(MASTER, master.first.keys, master)
write_csv(RUNTIME, runtime.first.keys, runtime)

assignments = read_csv(ASSIGNMENT)
assignments.reject! { |assignment| assignment.fetch("candidate_slug") == options.fetch(:slug) }
assignments << {
  "assignment_order" => assignments.length + 1,
  "candidate_slug" => options.fetch(:slug),
  "assigned_model" => "gpt-5.6-luna",
  "assigned_agent_id" => options.fetch(:agent_id),
  "agent_nickname" => options.fetch(:nickname),
  "status" => "running",
  "output_directory" => run.fetch("output_directory"),
  "scope_contract" => options.fetch(:scope),
  "minimum_full_body_target" => 300,
  "required_platforms" => "google_maps|nifty_onsen|yahoo_map",
  "notes" => "Facility worker owns only this output directory. Shared master files are coordinator-owned."
}
write_csv(ASSIGNMENT, assignments.first.keys, assignments)
puts "registered #{options.fetch(:slug)} for #{options.fetch(:batch)}"
