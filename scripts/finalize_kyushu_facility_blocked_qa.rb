#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "fileutils"
require "json"
require "time"

ROOT = File.expand_path("..", __dir__)
DATE = "2026-07-10"
OUTPUT = File.join(ROOT, "research", "onsen-db-seed", "kyushu-facility-pipeline-#{DATE}")
DEEP_ROOT = File.join(OUTPUT, "deepresearch", "kyushu_#{DATE}")

def read_csv(path)
  CSV.read(path, headers: true, encoding: "bom|utf-8").map(&:to_h)
end

def write_csv(path, headers, rows)
  CSV.open(path, "w", write_headers: true, headers: headers, encoding: "utf-8") do |csv|
    rows.each { |row| csv << headers.map { |header| row[header] } }
  end
end

queue = read_csv(File.join(OUTPUT, "kyushu_facility_candidate_queue_#{DATE}.csv"))
p0_rows = queue.select { |row| row.fetch("next_priority") == "P0" }
water_rows = read_csv(File.join(OUTPUT, "kyushu_facility_official_water_spotcheck_#{DATE}.csv")).to_h { |row| [row.fetch("candidate_slug"), row] }
lock_rows = read_csv(File.join(OUTPUT, "kyushu_facility_review_pool_lock_#{DATE}.csv"))
locks_by_slug = lock_rows.group_by { |row| row.fetch("candidate_slug") }
checked_at = Time.now.getlocal("+09:00").iso8601

ledger_headers = %w[
  review_id platform review_url author_or_publisher review_date_or_relative rating language sampling_stratum
  facility_area facility_area_confidence content_type direct_body_status review_count_eligible facility_related
  scope_bucket dedupe_key short_paraphrase original_keyword access_note
]
signal_headers = %w[
  facility_area facility_area_confidence signal_type signal_direction mention_count source_count platform_count
  contradiction_level review_signal_status evidence_note
]

p0_rows.each do |candidate|
  slug = candidate.fetch("candidate_slug")
  water = water_rows.fetch(slug)
  locks = locks_by_slug.fetch(slug).to_h { |lock| [lock.fetch("platform"), lock] }
  directory = File.join(DEEP_ROOT, slug)
  FileUtils.mkdir_p(directory)

  platform_locks = locks.transform_values do |lock|
    count = lock.fetch("visible_review_count")
    {
      "listing_title" => lock.fetch("listing_title"),
      "official_address" => lock.fetch("official_address"),
      "rating" => lock.fetch("visible_rating").empty? ? nil : lock.fetch("visible_rating"),
      "visible_review_count" => count.empty? ? nil : count.to_i,
      "listing_url" => lock.fetch("listing_url"),
      "identity_match" => lock.fetch("identity_match"),
      "listing_identity_status" => lock.fetch("listing_identity_status"),
      "collection_method" => lock.fetch("collection_method"),
      "observed_at_kst" => lock.fetch("observed_at_kst")
    }
  end

  mapping = {
    "research_date" => DATE,
    "scope" => {
      "region_id" => "kyushu",
      "product_unit" => "non_accommodation_onsen_facility",
      "scope_contract" => "#{candidate.fetch("facility_model")}; facility representative water profile; accommodation room-bath data excluded"
    },
    "identity" => {
      "candidate_slug" => slug,
      "official_name_ja" => candidate.fetch("japanese_name"),
      "korean_name" => candidate.fetch("korean_name"),
      "prefecture" => candidate.fetch("prefecture"),
      "municipality" => candidate.fetch("municipality"),
      "onsen_area" => candidate.fetch("onsen_area"),
      "official_url" => candidate.fetch("official_url"),
      "facility_type" => candidate.fetch("facility_type"),
      "facility_model" => candidate.fetch("facility_model"),
      "archetype" => candidate.fetch("archetype")
    },
    "official_facts" => {
      "operation_status" => candidate.fetch("operation_status"),
      "water_profile" => {
        "mode" => water.fetch("water_profile_mode"),
        "status" => water.fetch("official_water_profile_status"),
        "spring_quality_original" => water.fetch("spring_quality_original"),
        "official_water_text_original" => water.fetch("official_water_text_original"),
        "official_source_url" => water.fetch("official_source_url"),
        "official_source_checked_at" => water.fetch("official_source_checked_at"),
        "water_scope" => water.fetch("water_scope"),
        "method_badge_policy" => water.fetch("water_method_badge_policy")
      }
    },
    "review_pool_locks" => platform_locks,
    "direct_review_counts" => {
      "ledger_rows" => 0,
      "full_body_direct_reviews" => 0,
      "partial_review_rows_excluded" => 0,
      "korean_context_bodies_excluded" => 0,
      "facility_related_direct_reviews" => 0,
      "dayuse_only_direct_reviews" => 0,
      "lodging_bath_only_direct_reviews" => 0
    },
    "access_limits" => [
      {
        "reason" => "global_subagent_thread_limit",
        "detail" => "Required gpt-5.6-luna facility worker could not be spawned after repeated attempts; no browser-review body collection was started."
      },
      {
        "platform" => "Naver Blog/Search/Cafe",
        "review_body_access" => "not_started_due_to_global_subagent_thread_limit",
        "counting_rule" => "Search snippets and blog context are excluded from platform-review evidence."
      }
    ],
    "collection_metadata" => {
      "status" => "blocked_external_access",
      "checked_at_kst" => checked_at,
      "required_agent_model" => "gpt-5.6-luna",
      "agent_spawn_result" => "global thread limit reached",
      "direct_review_sampling_status" => "not_started"
    }
  }
  File.write(File.join(directory, "#{slug}_facility_platform_mapping_#{DATE}.json"), JSON.pretty_generate(mapping) + "\n")
  write_csv(File.join(directory, "#{slug}_direct_review_sample_index_#{DATE}.csv"), ledger_headers, [])
  write_csv(File.join(directory, "#{slug}_facility_review_signal_rows_#{DATE}.csv"), signal_headers, [])
  summary = <<~MD
    # #{candidate.fetch("korean_name")} 온천시설 리뷰 신호 - #{DATE}

    ## 수집 브리핑

    - 플랫폼 visible review pool: `facility_platform_mapping`의 Google/Nifty/Yahoo lock을 참조한다. visible pool은 직접 읽은 리뷰 수가 아니다.
    - 직접 읽은 full-body 리뷰: 0건
    - 온천시설 관련 직접 리뷰: 0건
    - 직접 본문 플랫폼: 0개
    - 데이터 품질: D. 탐색 신호도 해석하지 않는다.

    ## 공식 사실

    - 온천수 프로필은 시설 대표 프로필을 기본으로 하며, 공식 원문·URL·확인시각·scope가 있는 범위만 JSON에 기록했다.
    - `天然温泉`, `100%天然温泉`, `100%源泉` 표기만으로 직수·순환 배지를 만들지 않았다.

    ## QA 판정

    이 폴더는 완결 딥리서치가 아니라, 서브에이전트 전역 실행 한도로 인해 생성된 재개용 artifact set이다. Google Maps/Naver 신규 세션 기반의 full-body 수집과 300건 strata는 시작되지 않았으며, 그래서 `P0_hold_review_reinforcement`로 판정한다. snippet, topic chip, AI summary, blog context는 직접 리뷰 수에 포함하지 않았다.

    ## 다음 액션

    gpt-5.6-luna 전용 작업자를 배정한 뒤 Google Maps와 Naver를 시설별 새 Aside 세션으로 열고, 최신·저평점·혼잡·예약·결제·청결·접근·물 감촉·시설영역·한국어 strata를 개별 원장으로 300건 이상 채운다.
  MD
  File.write(File.join(directory, "#{slug}_facility_review_signal_summary_#{DATE}.md"), summary)
end

assignment_path = File.join(OUTPUT, "kyushu_facility_deepresearch_assignment_manifest_#{DATE}.csv")
assignment_rows = read_csv(assignment_path).map do |row|
  row.merge(
    "assigned_agent_id" => "unavailable_global_thread_limit",
    "agent_nickname" => "not_spawned",
    "status" => "blocked_external_access",
    "notes" => "Required gpt-5.6-luna worker was not spawned because the global agent thread limit was reached. Artifact set is a requeue scaffold, not direct-review completion."
  )
end
write_csv(assignment_path, assignment_rows.first.keys, assignment_rows)

runtime_headers = %w[
  candidate_slug assigned_model assigned_agent_id status output_directory started_at_kst completed_at_kst runtime_note
]
runtime_rows = assignment_rows.map do |row|
  {
    "candidate_slug" => row.fetch("candidate_slug"),
    "assigned_model" => "gpt-5.6-luna",
    "assigned_agent_id" => "unavailable_global_thread_limit",
    "status" => "blocked_external_access",
    "output_directory" => row.fetch("output_directory"),
    "started_at_kst" => "",
    "completed_at_kst" => checked_at,
    "runtime_note" => "No worker process started; global agent thread limit rejected spawn requests."
  }
end
write_csv(File.join(OUTPUT, "kyushu_facility_deepresearch_runtime_manifest_#{DATE}.csv"), runtime_headers, runtime_rows)

qa_headers = %w[
  candidate_slug official_name_ja google_visible_pool nifty_visible_pool yahoo_visible_pool locked_pool_status locked_pool_sum
  ledger_rows full_body_direct_reviews partial_review_rows_excluded korean_context_bodies_excluded facility_related_direct_reviews
  dayuse_only_direct_reviews late_hour_or_airport_facility_use_reviews lodging_bath_only_direct_reviews evidence_grade readiness
  p0_decision qa_status artifact_directory
]
qa_rows = p0_rows.map do |candidate|
  slug = candidate.fetch("candidate_slug")
  locks = locks_by_slug.fetch(slug).to_h { |lock| [lock.fetch("platform"), lock] }
  google = locks.fetch("google_maps").fetch("visible_review_count").to_i
  nifty_raw = locks.fetch("nifty_onsen").fetch("visible_review_count")
  yahoo_raw = locks.fetch("yahoo_map").fetch("visible_review_count")
  {
    "candidate_slug" => slug,
    "official_name_ja" => candidate.fetch("japanese_name"),
    "google_visible_pool" => google,
    "nifty_visible_pool" => nifty_raw.empty? ? 0 : nifty_raw.to_i,
    "yahoo_visible_pool" => yahoo_raw.empty? ? 0 : yahoo_raw.to_i,
    "locked_pool_status" => "not_locked_google_nifty_yahoo",
    "locked_pool_sum" => "",
    "ledger_rows" => 0,
    "full_body_direct_reviews" => 0,
    "partial_review_rows_excluded" => 0,
    "korean_context_bodies_excluded" => 0,
    "facility_related_direct_reviews" => 0,
    "dayuse_only_direct_reviews" => 0,
    "late_hour_or_airport_facility_use_reviews" => 0,
    "lodging_bath_only_direct_reviews" => 0,
    "evidence_grade" => "D",
    "readiness" => "review_reinforcement",
    "p0_decision" => "P0_hold_review_reinforcement",
    "qa_status" => "qa_accepted_with_caveat",
    "artifact_directory" => "deepresearch/kyushu_#{DATE}/#{slug}"
  }
end
qa_path = File.join(OUTPUT, "kyushu_facility_deepresearch_qa_#{DATE}.csv")
write_csv(qa_path, qa_headers, qa_rows)

qa_report = <<~MD
  # 규슈 온천시설 딥리서치 QA - #{DATE}

  ## 결과

  - P0 후보: #{p0_rows.size}건
  - P0_ready: 0건
  - review_reinforcement: #{p0_rows.size}건
  - 직접 읽은 full-body 리뷰: 0건
  - 온천시설 관련 직접 리뷰: 0건
  - A/B/C/D: 0 / 0 / 0 / #{p0_rows.size}

  ## 판정 근거

  시설별 `gpt-5.6-luna` 서브에이전트 배정을 세 차례 시도했으나, 전역 agent thread limit으로 실행이 시작되지 않았다. 따라서 현재 JSON·원장·신호 CSV·요약 MD는 재개 가능한 빈 원장 artifact set이며, platform visible pool이나 Google 화면의 일부 카드가 직접 읽은 리뷰 수로 승격되지 않았다. validator가 요구하는 수치 0은 미잠금 Nifty/Yahoo pool의 실제 0건 주장이 아니라, `not_locked_google_nifty_yahoo` 상태에서만 쓰는 기계 검증용 sentinel이다. 사용자 노출 데이터에는 사용하지 않는다.

  ## 재개 조건

  agent slot이 확보되면 각 시설에 새 gpt-5.6-luna worker를 배정한다. Google Maps와 Naver는 시설별 새 Aside 세션으로 열고, full-body 300건·3개 이상 플랫폼·strata를 채운 뒤 이 QA를 재생성한다.
MD
File.write(File.join(OUTPUT, "kyushu_facility_deepresearch_qa_report_#{DATE}.md"), qa_report)

queue_headers = %w[candidate_slug japanese_name queue_type priority reason next_action]
operation_queue = p0_rows.map do |candidate|
  { "candidate_slug" => candidate.fetch("candidate_slug"), "japanese_name" => candidate.fetch("japanese_name"), "queue_type" => "operation_recheck", "priority" => "P0", "reason" => candidate.fetch("operation_status"), "next_action" => "Reopen official operation notice before user-facing guidance." }
end
water_queue = p0_rows.map do |candidate|
  water = water_rows.fetch(candidate.fetch("candidate_slug"))
  next nil if water.fetch("official_water_profile_status") == "official_water_profile_locked"

  { "candidate_slug" => candidate.fetch("candidate_slug"), "japanese_name" => candidate.fetch("japanese_name"), "queue_type" => "water_reinforcement", "priority" => "P0", "reason" => water.fetch("official_water_profile_status"), "next_action" => "Find facility-specific official analysis sheet or bath-operation page; do not infer a method badge." }
end.compact
mapping_queue = p0_rows.map do |candidate|
  { "candidate_slug" => candidate.fetch("candidate_slug"), "japanese_name" => candidate.fetch("japanese_name"), "queue_type" => "mapping_reinforcement", "priority" => "P0", "reason" => "Nifty/Yahoo visible pool not fully identity-locked", "next_action" => "Open actual listing, match title/address/official identity, then record rating/count/time." }
end
korean_queue = p0_rows.map do |candidate|
  { "candidate_slug" => candidate.fetch("candidate_slug"), "japanese_name" => candidate.fetch("japanese_name"), "queue_type" => "korean_review_reinforcement", "priority" => "P0", "reason" => "No Korean full-body direct reviews read", "next_action" => "Use a new Naver Aside session; count only opened full bodies as Korean context or platform review evidence." }
end
write_csv(File.join(OUTPUT, "kyushu_facility_operation_recheck_queue_#{DATE}.csv"), queue_headers, operation_queue)
write_csv(File.join(OUTPUT, "kyushu_facility_water_reinforcement_queue_#{DATE}.csv"), queue_headers, water_queue)
write_csv(File.join(OUTPUT, "kyushu_facility_mapping_reinforcement_queue_#{DATE}.csv"), queue_headers, mapping_queue)
write_csv(File.join(OUTPUT, "kyushu_facility_korean_review_reinforcement_queue_#{DATE}.csv"), queue_headers, korean_queue)

puts "Created #{qa_rows.size} P0 hold QA rows and #{p0_rows.size} independent artifact directories in #{OUTPUT}"
