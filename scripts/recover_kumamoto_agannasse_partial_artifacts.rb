#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "json"
require "time"

ROOT = File.expand_path("..", __dir__)
DATE = "2026-07-10"
DIRECTORY = File.join(ROOT, "research", "onsen-db-seed", "kyushu-facility-pipeline-#{DATE}", "deepresearch", "kyushu_#{DATE}", "kumamoto-agannasse")
LEDGER_PATH = File.join(DIRECTORY, "kumamoto-agannasse_direct_review_sample_index_#{DATE}.csv")
MAPPING_PATH = File.join(DIRECTORY, "kumamoto-agannasse_facility_platform_mapping_#{DATE}.json")
SIGNAL_PATH = File.join(DIRECTORY, "kumamoto-agannasse_facility_review_signal_rows_#{DATE}.csv")
SUMMARY_PATH = File.join(DIRECTORY, "kumamoto-agannasse_facility_review_signal_summary_#{DATE}.md")

def truthy?(value)
  %w[1 true yes y].include?(value.to_s.strip.downcase)
end

ledger = CSV.read(LEDGER_PATH, headers: true, encoding: "bom|utf-8").map(&:to_h)
full = ledger.select do |row|
  truthy?(row["review_count_eligible"]) && row["direct_body_status"].to_s.downcase == "full" && row["content_type"] == "platform_review"
end
partial = ledger.count { |row| row["direct_body_status"].to_s.downcase == "partial" }
korean_full = full.count { |row| row["language"].to_s.downcase.start_with?("ko") }
onsen_related = full.count { |row| %w[public_bath open_air_public_bath].include?(row["facility_area"]) }
platforms = full.map { |row| row["platform"] }.uniq
now = Time.now.getlocal("+09:00").iso8601

mapping = JSON.parse(File.read(MAPPING_PATH))
mapping["review_pool_locks"]["google_maps"].merge!(
  "review_body_access" => "direct_readable",
  "direct_full_body_reviews_read" => full.count { |row| row["platform"] == "google_maps" },
  "partial_review_rows_excluded" => partial,
  "collection_method" => "aside_repl_new_session_recovered_worker_ledger"
)
%w[nifty_onsen yahoo_map].each do |platform|
  mapping["review_pool_locks"][platform].merge!(
    "visible_review_count" => "not_locked",
    "listing_identity_status" => "needs_crosscheck",
    "review_body_access" => "not_checked",
    "collection_method" => "not_completed_in_recovered_worker_window"
  )
end
mapping["direct_review_counts"] = {
  "ledger_rows" => ledger.size,
  "full_body_direct_reviews" => full.size,
  "partial_review_rows_excluded" => partial,
  "korean_context_bodies_excluded" => 0,
  "korean_full_body_direct_reviews" => korean_full,
  "onsen_related_full_body_direct_reviews" => onsen_related,
  "facility_related_direct_reviews" => full.count { |row| truthy?(row["facility_related"]) },
  "dayuse_only_direct_reviews" => full.count { |row| row["scope_bucket"] == "dayuse_facility" },
  "lodging_bath_only_direct_reviews" => 0
}
mapping["access_limits"] = [
  {
    "platform" => "Google Maps",
    "review_body_access" => "direct_readable",
    "detail" => "13 full bodies and 7 truncated cards were recovered from the worker ledger; truncated cards are excluded from the full-body denominator."
  },
  {
    "platform" => "Nifty Onsen",
    "review_body_access" => "not_checked",
    "detail" => "The candidate URL was inherited, but the exact listing title and address were not reopened after the worker stalled."
  },
  {
    "platform" => "Yahoo Map",
    "review_body_access" => "not_checked",
    "detail" => "No actual listing was opened; search surface is not a locked review pool."
  },
  {
    "platform" => "Naver Blog/Search/Cafe",
    "review_body_access" => "not_checked",
    "detail" => "A fresh Naver Aside session cannot be evidenced from the recovered worker artifacts. Snippets and blog context remain excluded."
  }
]
mapping["collection_metadata"] = {
  "status" => "partial_collection_closed_after_worker_stall",
  "checked_at_kst" => now,
  "required_agent_model" => "gpt-5.6-luna",
  "direct_review_sampling_status" => "Google full-body sample recovered; multi-platform sampling incomplete",
  "termination_reason" => "The worker persisted 20 Google ledger rows (13 eligible full bodies, 7 partial exclusions) then stopped updating artifacts before Nifty/Yahoo/Naver sampling or the 300-review target."
}
File.write(MAPPING_PATH, JSON.pretty_generate(mapping) + "\n")

signal_headers = %w[
  facility_slug facility_area facility_area_confidence signal_type signal_direction mention_count source_count platform_count platforms contradiction_level review_signal_status evidence_notes
]
signals = [
  ["public_bath", "specific", "water_texture", "positive", 3, "부드럽고 매끈한 물 감촉 언급이 Google full-body 3건에서 확인되지만 단일 플랫폼 탐색 표본이다."],
  ["facility_wide", "facility_wide", "rest_area_experience", "positive", 7, "만화·소파·해먹·무료 음료·식사 등 체류형 휴게공간 칭찬이 7건에서 나타난다."],
  ["open_air_public_bath", "probable", "open_air_bath_experience", "positive", 2, "노천탕 이용 또는 재방문 의향을 함께 적은 직접 본문 2건이 있다."],
  ["sauna_bedrock", "specific", "crowding_or_space", "negative", 1, "암반욕 공간 협소와 주차 혼잡은 1건뿐이라 반복 신호로 올리지 않는다."],
  ["public_bath", "probable", "chlorine_smell", "negative", 1, "염소 냄새 언급은 1건이며 욕장 영역이 완전히 분리되지 않아 탐색 메모로만 둔다."],
  ["facility_wide", "facility_wide", "price_payment_value", "mixed", 3, "쿠폰·수건 별도·무료 입장권 관련 실용 정보가 3건에서 확인된다."]
].map do |area, confidence, type, direction, count, note|
  {
    "facility_slug" => "kumamoto-agannasse",
    "facility_area" => area,
    "facility_area_confidence" => confidence,
    "signal_type" => type,
    "signal_direction" => direction,
    "mention_count" => count,
    "source_count" => count,
    "platform_count" => 1,
    "platforms" => "Google Maps",
    "contradiction_level" => count == 1 ? "low" : "medium",
    "review_signal_status" => "weak_signal",
    "evidence_notes" => "Recovered Google full-body ledger only. #{note}"
  }
end
CSV.open(SIGNAL_PATH, "w", write_headers: true, headers: signal_headers, encoding: "utf-8") do |csv|
  signals.each { |row| csv << signal_headers.map { |header| row.fetch(header) } }
end

summary = <<~MD
  # 온천카페 아간나세 온천시설 리뷰 신호 - #{DATE}

  ## 수집 브리핑

  - visible review pool: Google Maps 1,430건은 listing identity가 잠겼다. Nifty Onsen과 Yahoo Map은 이번 복구 범위에서 실제 listing 재확인이 끝나지 않아 `not_locked`다.
  - 직접 읽은 full-body 리뷰: #{full.size}건. Google Maps 1개 플랫폼에서만 직접 확인했다.
  - partial/truncated 제외: #{partial}건. visible review pool, partial card, snippet, blog context는 직접 표본에 넣지 않았다.
  - 온천/욕장 영역이 직접 드러난 full-body 리뷰: #{onsen_related}건. 시설 관련 직접 리뷰는 #{full.count { |row| truthy?(row["facility_related"]) }}건이다.
  - 한국어 full-body 직접 리뷰: #{korean_full}건.
  - 품질 등급: D. 50건 미만이면서 단일 플랫폼이므로 온천 만족도를 일반화하지 않는다.

  ## 공식 사실

  - 공식 온천수 프로필은 `나트륨-염화물·탄산수소염천`으로 기록하되, 공식 범위는 주욕장과 노천탕이며 대체 약탕과 제트/수탕을 포괄하는 시설 전반 운용으로 넓히지 않는다.
  - `天然温泉` 표기만으로 직수·순환 배지를 만들지 않았다. 공식 원문·URL·확인시각·scope는 platform mapping에 보존했다.

  ## 리뷰 신호

  | 욕장/영역 | 신호 | 방향 | 직접 언급 | 해석 |
  | --- | --- | --- | ---: | --- |
  | public_bath | water_texture | positive | 3 | 매끈한 물 감촉 언급이 있으나 Google 단일 플랫폼 탐색 표본이다. |
  | facility_wide | rest_area_experience | positive | 7 | 만화·휴게의자·해먹·무료 음료 등 체류형 편의 신호가 상대적으로 많다. |
  | open_air_public_bath | open_air_bath_experience | positive | 2 | 노천탕 만족은 있으나 반복 강도는 아직 낮다. |
  | sauna_bedrock/public_bath | crowding_or_space / chlorine_smell | negative | 각 1 | 단건 탐색 메모로만 남기며 반복 신호로 판정하지 않는다. |

  ## 근거 예시

  - Google Maps, ko, 1년 전: 대중탕·노천탕과 휴식시설을 함께 평가. 키워드 `대중탕 노천탕 휴식시설`.
  - Google Maps, ja, 4개월 전: 암반욕 협소·주차 혼잡·설비/소음과 염소 냄새를 언급. 키워드 `암반욕 좁음 주차 혼잡 노천 염소냄새`.
  - Google Maps, ja, 9개월 전: 매끈한 온천감과 소금 사우나·무료 음료를 호평. 키워드 `매끈한 온천감 소금사우나 무료음료`.
  - Google Maps, ja, 11개월 전: 연휴 오후에도 붐비지 않았다고 적고 온천·암반욕·휴게실 체류를 평가. 키워드 `붐비지 않음 만화 휴게실`.
  - Google Maps, ja, 10개월 전: 온천 피부감·식사·만화·휴식공간을 함께 언급. 키워드 `피부가 츳쯔루 식사 만화 휴식`.

  ## Bathtime 해석

  직접 확인 13건은 Google 단일 플랫폼의 탐색 표본이다. 욕장 자체보다 온천·암반욕·만화·휴게공간을 묶은 장시간 체류형 시설 경험이 더 자주 나타나며, 매끈한 물 감촉은 초기 긍정 신호다. 다만 공간 협소·주차 혼잡·염소 냄새는 각각 단건이라 부정 반복 신호로 일반화할 수 없다.

  ## Gaps 및 다음 액션

  - 300건 목표까지 #{300 - full.size}건이 더 필요하다. Google 추가 본문과 Nifty/Jalan/Yahoo의 실제 listing 재확인, Naver 새 Aside 세션을 우선 재시도한다.
  - 이번 복구는 worker stall 뒤 남은 Google 원장만 사용했다. Nifty/Yahoo/Naver는 `not_checked`이며 search preview와 snippet은 직접 리뷰 수에 넣지 않았다.
  - 가족탕 이중 결제 불만은 partial card라 이번 직접 full-body 신호 분모에서 제외했다. 다음 수집에서 full body가 확보될 때만 booking/payment 신호로 승격한다.
MD
File.write(SUMMARY_PATH, summary)

puts "Recovered #{full.size} full-body rows and #{partial} excluded partial rows for kumamoto-agannasse"
