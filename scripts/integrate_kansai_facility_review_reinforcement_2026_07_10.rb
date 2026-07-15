#!/usr/bin/env ruby

require "csv"
require "json"

DATE = "2026-07-10"
REGION = "kansai_sanin_setouchi"
ROOT = File.expand_path("../research/onsen-db-seed", __dir__)
RESEARCH_ROOT = File.join(ROOT, "deepresearch", "#{REGION}_#{DATE}")
SLUGS = %w[arima-kin-no-yu kinosaki-goshono-yu osaka-spa-world].freeze

def eligible?(row)
  row["content_type"].to_s.strip == "platform_review" &&
    row["direct_body_status"].to_s.strip == "full" &&
    truthy?(row["review_count_eligible"])
end

def related?(row)
  eligible?(row) && truthy?(row["facility_related"])
end

def truthy?(value)
  %w[true yes 1 full_direct_review].include?(value.to_s.strip.downcase)
end

def key_for(row)
  key = row["dedupe_key"].to_s.strip
  return key unless key.empty?

  key = row["review_id"].to_s.strip
  return key unless key.empty?

  [row["platform"], row["author_or_publisher"], row["review_date_or_relative"], row["short_paraphrase"]].join("|")
end

def count_by_platform(rows)
  rows.each_with_object(Hash.new(0)) { |row, counts| counts[row["platform"]] += 1 }.sort.to_h
end

results = []

SLUGS.each do |slug|
  directory = File.join(RESEARCH_ROOT, slug)
  base_path = File.join(directory, "#{slug}_direct_review_sample_index_#{DATE}.csv")
  handoff_path = File.join(directory, "#{slug}_review_reinforcement_handoff_#{DATE}.csv")
  output_path = File.join(directory, "#{slug}_direct_review_sample_index_integrated_#{DATE}.csv")
  base = CSV.read(base_path, headers: true).map(&:to_h)
  handoff = CSV.read(handoff_path, headers: true).map(&:to_h)
  headers = CSV.read(base_path, headers: true).headers
  handoff_headers = CSV.read(handoff_path, headers: true).headers
  raise "Header mismatch: #{slug}" unless headers == handoff_headers

  base_keys = base.each_with_object({}) { |row, keys| keys[key_for(row)] = true }
  overlap = handoff.select { |row| base_keys[key_for(row)] }
  raise "Duplicate handoff rows against base ledger: #{slug} (#{overlap.size})" unless overlap.empty?
  invalid_eligible = handoff.select { |row| truthy?(row["review_count_eligible"]) && !eligible?(row) }
  raise "Eligible handoff row lacks full platform body: #{slug} (#{invalid_eligible.size})" unless invalid_eligible.empty?

  combined = base + handoff
  CSV.open(output_path, "w") do |csv|
    csv << headers
    combined.each { |row| csv << headers.map { |header| row[header] } }
  end
  full = combined.select { |row| eligible?(row) }
  related = combined.select { |row| related?(row) }
  results << {
    slug: slug,
    base_ledger_rows: base.size,
    handoff_rows: handoff.size,
    integrated_ledger_rows: combined.size,
    handoff_eligible_full_body_reviews: handoff.count { |row| eligible?(row) },
    integrated_eligible_full_body_reviews: full.size,
    integrated_facility_related_direct_reviews: related.size,
    integrated_dayuse_only_direct_reviews: related.count { |row| %w[dayuse_only day_use dayuse_facility_scope].include?(row["scope_bucket"].to_s) },
    handoff_excluded_rows: handoff.count { |row| !eligible?(row) },
    full_body_platforms: count_by_platform(full),
    integrated_ledger_path: output_path.sub("#{ROOT}/", "")
  }
end

json_path = File.join(ROOT, "#{REGION}_facility_review_reinforcement_integration_#{DATE}.json")
report_path = File.join(ROOT, "#{REGION}_facility_review_reinforcement_integration_#{DATE}.md")
File.write(json_path, JSON.pretty_generate({
  integration_date: DATE,
  policy: "Only individual full platform review bodies marked review_count_eligible=true are added to grade-eligible counts. Visible review pools remain separate.",
  facilities: results
}) + "\n")

report = <<~MD
  # 간사이·산인·세토우치 시설 리뷰 보강 통합

  - 기준일: #{DATE}
  - 원본 원장은 보존하고, 검증된 handoff 행만 별도 integrated 원장에 추가했습니다.
  - visible 리뷰 수, 스니펫, AI 요약, OTA·공급자 카드, Naver 맥락은 직접 판독 수에 포함하지 않았습니다.

  | 시설 | 기존 원장 | handoff | 적격 신규 | 통합 적격 full-body | 시설 관련 | 제외 행 |
  | --- | ---: | ---: | ---: | ---: | ---: | ---: |
  #{results.map { |row| "| #{row[:slug]} | #{row[:base_ledger_rows]} | #{row[:handoff_rows]} | #{row[:handoff_eligible_full_body_reviews]} | #{row[:integrated_eligible_full_body_reviews]} | #{row[:integrated_facility_related_direct_reviews]} | #{row[:handoff_excluded_rows]} |" }.join("\n")}
MD
File.write(report_path, report)

puts JSON.generate({ integration: json_path.sub("#{ROOT}/", ""), report: report_path.sub("#{ROOT}/", ""), facilities: results })
