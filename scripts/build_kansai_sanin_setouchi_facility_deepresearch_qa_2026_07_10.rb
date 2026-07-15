#!/usr/bin/env ruby

require "csv"
require "json"
require "fileutils"

DATE = "2026-07-10"
REGION = "kansai_sanin_setouchi"
ROOT = File.expand_path("../research/onsen-db-seed", __dir__)
RESEARCH_ROOT = File.join(ROOT, "deepresearch", "#{REGION}_#{DATE}")
P0_SLUGS = %w[arima-kin-no-yu arima-taikounoyu kinosaki-goshono-yu dogo-honkan osaka-spa-world].freeze

QA_FIELDS = %w[candidate_slug official_name_ja google_visible_pool nifty_visible_pool yahoo_visible_pool locked_pool_status locked_pool_sum ledger_rows full_body_direct_reviews partial_review_rows_excluded korean_context_bodies_excluded facility_related_direct_reviews dayuse_only_direct_reviews late_hour_or_airport_facility_use_reviews lodging_bath_only_direct_reviews evidence_grade readiness p0_decision qa_status artifact_directory].freeze

def truthy?(value)
  %w[true yes 1 full_direct_review].include?(value.to_s.strip.downcase)
end

def normalized(value)
  value.to_s.strip.downcase
end

def body_full?(row)
  normalized(row["content_type"]) == "platform_review" && normalized(row["direct_body_status"]) == "full" && truthy?(row["review_count_eligible"])
end

def partial?(row)
  normalized(row["content_type"]) == "platform_review" && !body_full?(row)
end

def korean_context?(row)
  %w[blog_context activity_post].include?(normalized(row["content_type"])) && normalized(row["language"]).start_with?("ko")
end

def facility_related?(row)
  truthy?(row["facility_related"])
end

def review_key(row, index)
  key = row["dedupe_key"].to_s.strip
  return key unless key.empty?

  key = row["review_id"].to_s.strip
  return key unless key.empty?

  [row["platform"], row["author_or_publisher"], row["review_date_or_relative"], row["short_paraphrase"], index].join("|")
end

def strict_grade(full_rows)
  platform_count = full_rows.map { |row| row["platform"].to_s.strip }.reject(&:empty?).uniq.size
  strata = full_rows.map { |row| normalized(row["sampling_stratum"]) }
  has_latest = strata.any? { |value| value.include?("latest") || value.include?("recent") || value.include?("최신") }
  has_low = strata.any? { |value| value.include?("low") || value.include?("1_star") || value.include?("2_star") || value.include?("저평점") }
  count = full_rows.size
  return "A" if count >= 300 && platform_count >= 3 && has_latest && has_low
  return "B" if count >= 100 && platform_count >= 2
  return "C" if count >= 50 && platform_count >= 2

  "D"
end

def artifact_files(directory)
  integrated_ledger = Dir.glob(File.join(directory, "*_direct_review_sample_index_integrated_#{DATE}.csv"))
  {
    mapping: Dir.glob(File.join(directory, "*_facility_platform_mapping_#{DATE}.json")),
    ledger: integrated_ledger.empty? ? Dir.glob(File.join(directory, "*_direct_review_sample_index_#{DATE}.csv")) : integrated_ledger,
    signals: Dir.glob(File.join(directory, "*_facility_review_signal_rows_#{DATE}.csv")),
    summary: Dir.glob(File.join(directory, "*_facility_review_signal_summary_#{DATE}.md"))
  }
end

def scope_bucket(row)
  normalized(row["scope_bucket"])
end

def display_platform(value)
  case normalized(value)
  when "google_maps", "google maps" then "Google Maps"
  when "nifty_onsen", "nifty onsen" then "Nifty Onsen"
  when "yahoo_map", "yahoo_onsen", "yahoo map" then "Yahoo Map"
  when "tripadvisor" then "TripAdvisor"
  else value.to_s
  end
end

def incomplete_artifact_issue?(issue)
  issue.start_with?("mapping", "ledger", "signals", "summary", "invalid")
end

lock_rows = CSV.read(File.join(ROOT, "#{REGION}_facility_review_pool_lock_#{DATE}.csv"), headers: true).map(&:to_h)
lock_by_slug = lock_rows.group_by { |row| row.fetch("candidate_slug") }
assignment_rows = CSV.read(File.join(ROOT, "#{REGION}_facility_deepresearch_assignment_manifest_#{DATE}.csv"), headers: true).map(&:to_h)
assignment_by_slug = assignment_rows.to_h { |row| [row.fetch("candidate_slug"), row] }

qa_rows = []
audit = []

P0_SLUGS.each do |slug|
  assignment = assignment_by_slug.fetch(slug)
  relative_directory = assignment.fetch("output_directory")
  directory = File.join(ROOT, relative_directory)
  files = artifact_files(directory)
  issues = []
  files.each { |kind, matches| issues << "#{kind}=#{matches.size}" unless matches.size == 1 }
  mapping = nil
  if files[:mapping].size == 1
    begin
      mapping = JSON.parse(File.read(files[:mapping].first))
    rescue JSON::ParserError => error
      issues << "invalid_mapping_json=#{error.message}"
    end
  end
  if mapping
    identity = mapping["identity"]
    if !identity.is_a?(Hash)
      issues << "mapping_identity_missing"
    else
      required_identity = %w[candidate_slug official_name_ja korean_name official_url facility_type facility_model]
      missing_identity = required_identity.select { |field| identity[field].to_s.strip.empty? }
      issues << "mapping_identity_fields_missing=#{missing_identity.join(';')}" unless missing_identity.empty?
      issues << "mapping_slug_mismatch=#{identity['candidate_slug']}" unless identity["candidate_slug"].to_s == slug
    end
  end

  ledger = files[:ledger].size == 1 ? CSV.read(files[:ledger].first, headers: true).map(&:to_h) : []
  required_ledger_columns = %w[review_id platform review_url author_or_publisher review_date_or_relative rating language sampling_stratum facility_area facility_area_confidence content_type direct_body_status review_count_eligible facility_related scope_bucket dedupe_key short_paraphrase original_keyword access_note]
  if files[:ledger].size == 1
    missing = required_ledger_columns - (CSV.read(files[:ledger].first, headers: true).headers || [])
    issues << "missing_ledger_columns=#{missing.join(';')}" unless missing.empty?
  end

  signal_rows = files[:signals].size == 1 ? CSV.read(files[:signals].first, headers: true).map(&:to_h) : []
  if files[:signals].size == 1
    signal_headers = CSV.read(files[:signals].first, headers: true).headers || []
    missing_signal_columns = %w[facility_slug signal_type].reject { |column| signal_headers.include?(column) }
    issues << "signals_missing_columns=#{missing_signal_columns.join(';')}" unless missing_signal_columns.empty?
    forbidden_signals = signal_rows.map { |entry| normalized(entry["signal_type"]) }.grep(/source_flow|kakenagashi|junkan|natural_100/).uniq
    issues << "signals_forbidden_types=#{forbidden_signals.join(';')}" unless forbidden_signals.empty?
  end

  unique = {}
  duplicate_count = 0
  deduped_ledger = ledger.each_with_index.each_with_object([]) do |(entry, index), kept|
    key = review_key(entry, index)
    if unique[key]
      duplicate_count += 1
    else
      unique[key] = true
      kept << entry
    end
  end
  issues << "duplicate_keys=#{duplicate_count}" if duplicate_count.positive?

  full_rows = deduped_ledger.select { |entry| body_full?(entry) }
  partial_rows = deduped_ledger.select { |entry| partial?(entry) }
  context_rows = deduped_ledger.select { |entry| korean_context?(entry) }
  related_full_rows = full_rows.select { |entry| facility_related?(entry) }
  dayuse_buckets = %w[dayuse_only day_use_only day_use dayuse_facility_scope rest_course main_public_bath]
  dayuse = related_full_rows.count { |entry| bucket = scope_bucket(entry); bucket.empty? || dayuse_buckets.include?(bucket) }
  late_use = related_full_rows.count { |entry| scope_bucket(entry) == "late_hour_or_airport_facility_use" }
  lodging = related_full_rows.count { |entry| %w[lodging_bath_only dayuse_lodging_context].include?(scope_bucket(entry)) }
  other_related = related_full_rows.size - dayuse - late_use - lodging
  if other_related.positive?
    issues << "unmapped_related_scope=#{other_related}"
    dayuse += other_related
  end

  grade = strict_grade(full_rows)
  lock_values = lock_by_slug.fetch(slug)
  pools = lock_values.to_h { |entry| [entry.fetch("platform"), entry.fetch("visible_review_count").to_i] }
  all_locked = lock_values.all? { |entry| entry.fetch("listing_identity_status") == "locked" }
  all_surfaces_resolved = lock_values.all? { |entry| %w[locked not_found].include?(entry.fetch("listing_identity_status")) }
  readiness = if issues.any? { |item| incomplete_artifact_issue?(item) }
                "incomplete_artifact_set"
              elsif full_rows.size < 300
                "needs_reinforcement"
              elsif %w[A B].include?(grade) && all_surfaces_resolved
                "needs_operation_recheck"
              elsif %w[A B].include?(grade)
                "review_pool_recheck"
              else
                "needs_reinforcement"
              end
  p0_decision = if issues.any? { |item| incomplete_artifact_issue?(item) }
                  "P0_hold_review_reinforcement"
                elsif full_rows.size < 300
                  "P0_hold_review_reinforcement"
                elsif %w[A B].include?(grade) && all_surfaces_resolved
                  "P0_ready_after_operation_recheck"
                elsif %w[A B].include?(grade)
                  "P0_hold_review_reinforcement"
                else
                  "P0_hold_review_reinforcement"
                end
  qa_status = if issues.any? { |item| incomplete_artifact_issue?(item) }
                "incomplete_artifact_set"
              elsif issues.any?
                "accepted_with_caveat"
              else
                "accepted"
              end

  qa_rows << {
    "candidate_slug" => slug,
    "official_name_ja" => lock_values.first.fetch("japanese_name"),
    "google_visible_pool" => pools.fetch("google_maps", 0),
    "nifty_visible_pool" => pools.fetch("nifty_onsen", 0),
    "yahoo_visible_pool" => pools.fetch("yahoo_onsen", 0),
    "locked_pool_status" => all_locked ? "locked_google_nifty_yahoo" : (all_surfaces_resolved ? "locked_google_yahoo_nifty_not_found" : "partially_locked_platform_specific"),
    "locked_pool_sum" => all_locked ? pools.values.sum : "",
    "ledger_rows" => ledger.size,
    "full_body_direct_reviews" => full_rows.size,
    "partial_review_rows_excluded" => partial_rows.size,
    "korean_context_bodies_excluded" => context_rows.size,
    "facility_related_direct_reviews" => related_full_rows.size,
    "dayuse_only_direct_reviews" => dayuse,
    "late_hour_or_airport_facility_use_reviews" => late_use,
    "lodging_bath_only_direct_reviews" => lodging,
    "evidence_grade" => grade,
    "readiness" => readiness,
    "p0_decision" => p0_decision,
    "qa_status" => qa_status,
    "artifact_directory" => relative_directory
  }
  audit << { slug: slug, grade: grade, platforms: full_rows.map { |entry| entry["platform"] }.uniq.compact, strata: full_rows.map { |entry| entry["sampling_stratum"] }.uniq.compact, issues: issues, mapping: mapping }
end

qa_path = File.join(ROOT, "#{REGION}_facility_deepresearch_qa_#{DATE}.csv")
CSV.open(qa_path, "w") do |csv|
  csv << QA_FIELDS
  qa_rows.each { |entry| csv << QA_FIELDS.map { |field| entry.fetch(field).to_s } }
end

runtime_path = File.join(ROOT, "#{REGION}_facility_deepresearch_runtime_manifest_#{DATE}.csv")
runtime = CSV.read(runtime_path, headers: true)
runtime.each do |entry|
  qa = qa_rows.find { |row| row.fetch("candidate_slug") == entry.fetch("candidate_slug") }
  entry["status"] = qa.fetch("qa_status").start_with?("accepted") ? "qa_accepted" : "qa_rework_requested"
  entry["completed_at_kst"] = "#{DATE}T18:00:00+0900"
  entry["artifact_set_status"] = qa.fetch("qa_status")
  entry["notes"] = "ledger=#{qa.fetch('ledger_rows')}; full=#{qa.fetch('full_body_direct_reviews')}; grade=#{qa.fetch('evidence_grade')}; decision=#{qa.fetch('p0_decision')}"
end
CSV.open(runtime_path, "w") { |csv| csv << runtime.headers; runtime.each { |entry| csv << runtime.headers.map { |header| entry[header] } } }

ready = qa_rows.select { |entry| entry.fetch("p0_decision").start_with?("P0_ready") }
hold = qa_rows - ready
locked_visible_total = qa_rows.sum { |entry| entry.fetch("google_visible_pool").to_i + entry.fetch("nifty_visible_pool").to_i + entry.fetch("yahoo_visible_pool").to_i }
ledger_total = qa_rows.sum { |entry| entry.fetch("ledger_rows").to_i }
full_total = qa_rows.sum { |entry| entry.fetch("full_body_direct_reviews").to_i }
facility_related_total = qa_rows.sum { |entry| entry.fetch("facility_related_direct_reviews").to_i }
partial_total = qa_rows.sum { |entry| entry.fetch("partial_review_rows_excluded").to_i }
korean_context_total = qa_rows.sum { |entry| entry.fetch("korean_context_bodies_excluded").to_i }
full_platforms = audit.flat_map { |entry| entry[:platforms] }.compact.map { |platform| display_platform(platform) }.reject(&:empty?).uniq.sort
audit_lines = audit.map do |entry|
  caveat = entry[:issues].empty? ? "" : "; QA 주의 #{entry[:issues].join(', ')}"
  "- `#{entry[:slug]}`: full-body 플랫폼 #{entry[:platforms].join(', ')}; strata #{entry[:strata].join(', ')}#{caveat}"
end
report = <<~MD
  # 간사이·산인·세토우치 온천시설 딥리서치 QA — #{DATE}

  ## QA 기준

  - 플랫폼상 visible pool은 직접 리뷰 수와 합산하지 않았다.
  - 적격 직접 리뷰은 `content_type=platform_review`, `direct_body_status=full`, `review_count_eligible=true`인 원장 행만 셌다.
  - partial 카드, Naver Blog/Cafe 맥락 본문, snippet·topic chip·AI summary는 등급 분모에서 제외했다.
  - 등급은 원장 중복키를 제거한 뒤 재계산했다. A는 300+ full-body, 3+ 플랫폼, 최신·저평점 strata가 모두 필요하다.

  ## 수집 브리핑

  - P0 딥리서치 대상은 5곳이다. 범위는 간사이뿐 아니라 세토우치의 도고온천 본관도 포함한다. Google·Nifty·Yahoo에서 숫자로 잠긴 visible pool은 합계 #{locked_visible_total.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse}건이다.
  - 직접 원장 행은 #{ledger_total.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse}건, 적격 full-body 직접 리뷰은 #{full_total.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse}건, 시설 관련 직접 리뷰은 #{facility_related_total.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse}건이다.
  - partial·truncated 카드 #{partial_total}건과 한국어 맥락 본문 #{korean_context_total}건은 등급 분모에서 제외했다. 적격 본문 플랫폼은 #{full_platforms.join(', ')}다.
  - Google Maps와 Naver는 시설별 새 Aside 세션으로 확인하도록 배정했다. Naver Blog/Search/Cafe는 전문이라도 한국어 수요 맥락이며 플랫폼 리뷰 수에 넣지 않았다.

  ## 결과

  | 시설 | visible pool (G/N/Y) | 원장 | full-body | 등급 | P0 판정 | QA |
  |---|---:|---:|---:|---|---|---|
  #{qa_rows.map { |entry| "| #{entry['candidate_slug']} | #{entry['google_visible_pool']}/#{entry['nifty_visible_pool']}/#{entry['yahoo_visible_pool']} | #{entry['ledger_rows']} | #{entry['full_body_direct_reviews']} | #{entry['evidence_grade']} | #{entry['p0_decision']} | #{entry['qa_status']} |" }.join("\n")}

  ## 판정 해석

  - P0 ready: #{ready.empty? ? "없음" : ready.map { |entry| entry['candidate_slug'] }.join(", ")}.
  - review reinforcement: #{hold.empty? ? "없음" : hold.map { |entry| entry['candidate_slug'] }.join(", ")}.
  - 300건 미만인 B 표본도 이번 배치에서는 ready로 올리지 않았다. 고쇼노유처럼 플랫폼 수는 충족해도 추가 Google 본문 보강이 남은 경우 `P0_hold_review_reinforcement`로 유지했다.
  - 시설별 직접 리뷰와 온천·시설 관련 직접 리뷰의 차이는 원장의 `facility_related`와 scope bucket으로 재현했다. 숙박·공급자 카드·검색 스니펫은 포함하지 않았다.

  ## 원장 감사

  #{audit_lines.join("\n")}
MD
File.write(File.join(ROOT, "#{REGION}_facility_deepresearch_qa_report_#{DATE}.md"), report)

queue_rows = []
qa_rows.each do |entry|
  slug = entry.fetch("candidate_slug")
  queue_rows << [slug, "operation", "P0", "운영시간·휴관·접수 마감은 변동 사실", "공식 운영 공지 재확인", "needs_operation_recheck", "공식 URL·확인시각·해당 상품 scope", "facility_pipeline"]
  if entry.fetch("locked_pool_status") == "partially_locked_platform_specific"
    queue_rows << [slug, "mapping", "P0", "Nifty 또는 Yahoo listing 잠금이 불완전", "공식명·주소로 실제 listing 재대조", "needs_mapping", "listing title·address·visible count·URL·확인시각", "facility_pipeline"]
  end
  if entry.fetch("evidence_grade") == "D" || entry.fetch("evidence_grade") == "C"
    queue_rows << [slug, "review_reinforcement", "P0", "원장 기반 full-body 표본이 A/B 기준에 미달", "저평점·최신·운영 키워드 중심으로 플랫폼 추가 수집", "needs_review_reinforcement", "individual full-body ledger rows", "facility_pipeline"]
  end
  queue_rows << [slug, "korean_review", "P1", "한국어 본문은 플랫폼 리뷰와 별도 맥락으로만 보관", "Naver Blog/Search/Cafe 전문 여부와 수요 맥락 재확인", "needs_korean_context_check", "opened Korean body or explicit not-found status", "facility_pipeline"]
end

water_rows = CSV.read(File.join(ROOT, "#{REGION}_facility_official_water_spotcheck_#{DATE}.csv"), headers: true).map(&:to_h)
water_rows.each do |entry|
  if entry.fetch("water_method_badge_policy").include?("no_method") || entry.fetch("water_method_badge_policy").include?("area_scope")
    queue_rows << [entry.fetch("candidate_slug"), "water", "P1", "방식 배지의 facility-wide scope가 불충분", "공식 분석표·욕조별 운용 공지 확인", "needs_water_method_scope", "official original text, URL, checked_at, area scope", "facility_pipeline"]
  end
end

reinforcement_path = File.join(ROOT, "#{REGION}_facility_reinforcement_queue_#{DATE}.csv")
CSV.open(reinforcement_path, "w") do |csv|
  csv << %w[candidate_slug queue_type priority reason next_action blocking_status required_evidence owner_scope]
  queue_rows.each { |entry| csv << entry }
end

puts qa_path
puts reinforcement_path
