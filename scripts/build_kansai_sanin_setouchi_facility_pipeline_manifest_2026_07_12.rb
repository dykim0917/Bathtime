#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "fileutils"
require "time"

ROOT = File.expand_path("..", __dir__)
DATE = "2026-07-12"
SEED_ROOT = File.join(ROOT, "research", "onsen-db-seed")
OUTPUT = File.join(SEED_ROOT, "kansai_sanin_setouchi_facility_pipeline_#{DATE}")
SOURCE_QUEUE = File.join(SEED_ROOT, "kansai_sanin_setouchi_facility_candidate_queue_2026-07-10.csv")
P1_RECONCILIATION = File.join(SEED_ROOT, "kansai-sanin-setouchi-facility-p1-operation-reconciliation-2026-07-11", "kansai_sanin_setouchi_facility_p1_promotion_assessment_2026-07-11_integrated.csv")
CANONICAL_QA = File.join(SEED_ROOT, "kansai_sanin_setouchi_facility_deepresearch_qa_2026-07-11.csv")

FIRST_BATCH = %w[
  arima-gin-no-yu
  arima-suzurannoyu
  kinosaki-ichino-yu
  kinosaki-jizou-yu
  kinosaki-mandara-yu
  kinosaki-yanagi-yu
].freeze

def read_csv(path)
  CSV.read(path, headers: true, encoding: "bom|utf-8").map(&:to_h)
end

def write_csv(path, headers, rows)
  CSV.open(path, "w", write_headers: true, headers: headers, encoding: "utf-8") do |csv|
    rows.each { |row| csv << headers.map { |header| row[header] } }
  end
end

def scope_contract(row)
  slug = row.fetch("candidate_slug")
  return "Individual Kinosaki sotoyu only. Exclude route/pass, ryokan lodging, and other sotoyu. If family-bath wording appears, determine whether it is currently bookable before tagging it." if slug.start_with?("kinosaki-")
  return "Public day-use bath only. Keep Gold/Silver spring descriptions at the named facility; exclude Arima town pass, nearby footbaths, and lodging baths." if slug == "arima-gin-no-yu"
  return "Public day-use bath only. Exclude nearby Arima ryokan and lodging-bath review bodies. Family/private bath references require separate area and eligibility." if slug == "arima-suzurannoyu"
  return "Candidate scope requires review before direct sampling."
end

def initial_status(row, p1, qa)
  slug = row.fetch("candidate_slug")
  return qa.fetch("p0_decision") == "draft" ? "qa_accepted_draft" : "qa_accepted_#{qa.fetch('p0_decision')}" if qa

  if p1
    return "operation_recheck" if p1.fetch("revised_promotion_decision") == "hold"
    return "P0_boundary_first" if p1.fetch("revised_promotion_decision") == "P0_boundary_first"
    return "queued_batch_1" if FIRST_BATCH.include?(slug)

    return "pending_review_pool_lock"
  end

  return "P0_boundary_first" if row.fetch("promotion_disposition") == "P0_boundary_first"
  return "candidate_qa_hold" if %w[exclude_or_hold footbath_only route_or_pass area_cluster split_needed].include?(row.fetch("cleanup_status"))

  "pending_candidate_audit"
end

FileUtils.mkdir_p(OUTPUT)
checked_at = Time.now.getlocal("+09:00").iso8601
queue = read_csv(SOURCE_QUEUE)
p1_by_slug = read_csv(P1_RECONCILIATION).to_h { |row| [row.fetch("candidate_slug"), row] }
qa_by_slug = read_csv(CANONICAL_QA).to_h { |row| [row.fetch("candidate_slug"), row] }

headers = queue.first.keys + %w[
  source_candidate_queue initial_pipeline_status pipeline_status qa_disposition qa_artifact_directory
  batch scope_contract next_action checked_at_kst
]
master = queue.map do |row|
  slug = row.fetch("candidate_slug")
  qa = qa_by_slug[slug]
  status = initial_status(row, p1_by_slug[slug], qa)
  next_action = case status
                when "queued_batch_1"
                  "Lock visible pools, then conduct facility-only deep research in the assigned directory."
                when "pending_review_pool_lock"
                  "Lock Google/Nifty/Yahoo title/address/count before promotion or direct review assignment."
                when "P0_boundary_first"
                  "Write a day-use scope contract and split lodging/pass/family/private product review denominators before direct research."
                when "operation_recheck"
                  "Check current operation and identity before any promotion; do not treat legacy URL failure alone as closure."
                when "candidate_qa_hold"
                  "Retain only as candidate metadata until the cleanup or operation reason is resolved."
                else
                  "Audit identity, official operation, and review surface before tier/promotion reassessment."
                end
  row.merge(
    "source_candidate_queue" => File.basename(SOURCE_QUEUE),
    "initial_pipeline_status" => status,
    "pipeline_status" => status,
    "qa_disposition" => qa ? qa.fetch("p0_decision") : "not_started",
    "qa_artifact_directory" => qa ? qa.fetch("artifact_directory") : "",
    "batch" => FIRST_BATCH.include?(slug) ? "batch_1" : "",
    "scope_contract" => scope_contract(row),
    "next_action" => next_action,
    "checked_at_kst" => checked_at
  )
end
write_csv(File.join(OUTPUT, "kansai_sanin_setouchi_facility_master_queue_#{DATE}.csv"), headers, master)

runtime_headers = %w[
  runtime_order candidate_slug japanese_name candidate_track prefecture pipeline_status batch assigned_model
  assigned_agent_id agent_nickname output_directory scope_contract minimum_full_body_target required_platforms
  direct_reviews_read qa_status updated_at_kst notes
]
runtime = master.each_with_index.map do |row, index|
  slug = row.fetch("candidate_slug")
  {
    "runtime_order" => index + 1,
    "candidate_slug" => slug,
    "japanese_name" => row.fetch("japanese_name"),
    "candidate_track" => row.fetch("candidate_track"),
    "prefecture" => row.fetch("prefecture"),
    "pipeline_status" => row.fetch("pipeline_status"),
    "batch" => row.fetch("batch"),
    "assigned_model" => FIRST_BATCH.include?(slug) ? "gpt-5.6-luna" : "",
    "assigned_agent_id" => "",
    "agent_nickname" => "",
    "output_directory" => FIRST_BATCH.include?(slug) ? "deepresearch/kansai_sanin_setouchi_#{DATE}/#{slug}" : "",
    "scope_contract" => row.fetch("scope_contract"),
    "minimum_full_body_target" => FIRST_BATCH.include?(slug) ? 300 : "",
    "required_platforms" => FIRST_BATCH.include?(slug) ? "google_maps|nifty_onsen|yahoo_map" : "",
    "direct_reviews_read" => 0,
    "qa_status" => row.fetch("qa_disposition") == "not_started" ? "not_started" : "already_canonical",
    "updated_at_kst" => checked_at,
    "notes" => row.fetch("next_action")
  }
end
write_csv(File.join(OUTPUT, "kansai_sanin_setouchi_facility_deepresearch_runtime_manifest_#{DATE}.csv"), runtime_headers, runtime)

report = <<~MD
  # Kansai/Sanin/Setouchi Facility Pipeline Inventory (#{DATE})

  ## Scope and ownership

  This is a facility-only pipeline. Accommodation research and accommodation outputs are excluded. In scope are Kansai, Sanin, Setouchi, and the four Shikoku prefectures already owned by this regional dataset. Kyushu, Chubu/Hokuriku/Koshin, Kanto, Hokkaido, and Hakone outputs are read only for collision checks and are never modified.

  ## Starting inventory

  - Candidate rows: #{master.length}
  - Already seeded and canonical QA: #{qa_by_slug.length}
  - Batch 1 facility workers: #{FIRST_BATCH.length}
  - Candidate-normalization direct reviews: 0 for every non-canonical queue row

  The five already-seeded facilities remain separate from the new collection queue: Arima Kin-no-yu, Arima Taikounoyu, Kinosaki Goshono-yu, Dogo Honkan, and Osaka Spa World. Their 2026-07-11 canonical QA is retained, not rewritten.

  ## Batch 1

  Arima Gin-no-yu, Arima Kaido Suzuran-no-yu, and four individual Kinosaki sotoyu are assigned only after facility-level scope instructions are present. Kinosaki route/pass material, other sotoyu, and ryokan accommodation reviews are excluded from each bath's day-use denominator.

  ## Status meanings

  - `queued_batch_1`: ready for a dedicated facility worker; the worker first locks visible pools and then reads reviews.
  - `pending_review_pool_lock`: candidate identity exists, but numeric visible pools are not yet reproducible.
  - `P0_boundary_first`: product and review denominators must be split before direct sampling.
  - `operation_recheck`: current operation needs confirmation; not a direct-review target.
  - `candidate_qa_hold`: route, footbath, split, or exclusion cleanup remains.
MD
File.write(File.join(OUTPUT, "kansai_sanin_setouchi_facility_pipeline_inventory_#{DATE}.md"), report, encoding: "utf-8")

puts "wrote #{OUTPUT}"
puts "rows=#{master.length} batch_1=#{FIRST_BATCH.length} canonical=#{qa_by_slug.length}"
