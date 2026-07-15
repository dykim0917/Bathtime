#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "fileutils"
require "time"

ROOT = File.expand_path("..", __dir__)
DATE = "2026-07-11"
SOURCE_DATE = "2026-07-10"
INPUT = File.join(ROOT, "research", "onsen-db-seed", "kyushu-facility-pipeline-#{SOURCE_DATE}", "kyushu_facility_candidate_queue_#{SOURCE_DATE}.csv")
OUTPUT = File.join(ROOT, "research", "onsen-db-seed", "kyushu-facility-p1-promotion-#{DATE}")

GOOGLE_LOCKS = {
  "beppu-hoyoland" => ["", 2496, "locked_google_maps"],
  "yufuin-tsukanoma-dayuse" => ["4.4", 704, "locked_google_maps"],
  "ibusuki-sayuri" => ["4.3", 1028, "locked_google_maps"],
  "ibusuki-tamatebako" => ["", 1482, "locked_google_maps"],
  "kurokawa-ikoi-dayuse" => ["4.3", 896, "locked_google_maps"],
  "takeo-saginoyu" => ["4.1", 483, "locked_google_maps"],
  "takeo-tonosamayu" => ["4.4", 47, "locked_google_maps"],
  "unzen-yokayuu" => ["3.9", 414, "locked_google_maps"],
  "obama-naminoyu-akane" => ["4.1", 269, "locked_google_maps"],
  "kirishima-maeda-onsen" => ["4.0", 499, "locked_google_maps"],
  "fukuoka-terihaspa-resort" => ["4.1", 4027, "locked_google_maps"],
  "fukuoka-nakagawa-seiryu" => ["4.2", 3313, "locked_google_maps"],
  "kumamoto-yulax" => ["4.2", 3193, "locked_google_maps"],
  "kumamoto-kashima-yumoto-suishun" => ["4.0", 1436, "locked_google_maps"],
  "kumamoto-tsukasa-no-yu" => ["4.2", 2177, "locked_google_maps"],
  "kurokawa-yamamizuki-dayuse" => ["", nil, "needs_exact_google_listing"],
  "fukuoka-hakata-manyo-no-yu" => ["", nil, "needs_exact_google_listing"]
}.freeze

SECONDARY_LOCKS = {
  "beppu-hoyoland" => [143, 107, "https://onsen.nifty.com/beppushuuhen-onsen/onsen004507/", "https://map.yahoo.co.jp/v3/place/5hdkTfVjNUo"],
  "ibusuki-tamatebako" => [nil, 99, "", "https://map.yahoo.co.jp/v3/place/_9C7JSFHmt2"],
  "fukuoka-nakagawa-seiryu" => [81, 193, "https://onsen.nifty.com/dazaifu-onsen/onsen005936/", "https://map.yahoo.co.jp/v3/place/_k3mfVtDJtc"],
  "kumamoto-kashima-yumoto-suishun" => [15, 166, "https://onsen.nifty.com/kumamotoshuuhen-onsen/onsen010909/", "https://map.yahoo.co.jp/v3/place/CrhGGqhpXEU"]
}.freeze

OFFICIAL_URL_STATUS = {
  "beppu-hoyoland" => "unresolved_dns",
  "ibusuki-tamatebako" => "http_404",
  "ibusuki-kokoro-no-yu" => "curl_error_recheck",
  "takeo-tonosamayu" => "http_403_browser_recheck",
  "kirishima-shinyu-onsen" => "curl_error_recheck",
  "kumamoto-tsukasa-no-yu" => "unresolved_dns",
  "kagoshima-spaland-rarara" => "curl_error_recheck"
}.freeze

DECISIONS = {
  "fukuoka-nakagawa-seiryu" => ["P0_candidate", "promote_to_p0", "공식 사이트의 단순온천·단순약방사능냉광천 표기와 public/open-air/family 상품 범위, Google 3,313·Nifty 81·Yahoo 193 리뷰풀이 함께 잠겼다.", "P0 딥리서치 전용 디렉터리를 만들고 Google/Naver 새 Aside 세션부터 full-body 원장을 수집한다."],
  "kumamoto-kashima-yumoto-suishun" => ["P0_candidate", "promote_to_p0", "공식 페이지가 day-use 온천·암반욕·사우나 상품과 노천 암석탕 상단의 원천가케나가시 범위를 명시하며 Google 1,436·Nifty 15·Yahoo 166이 잠겼다.", "P0 딥리서치에서 노천 암석탕의 공식 방식 scope와 기타 욕조를 분리하고, Google/Naver 새 Aside 세션으로 원장을 시작한다."],
  "yufuin-tsukanoma-dayuse" => ["P0_boundary_first", "promote_boundary_first", "Google 704건과 당일입욕 제품은 확인됐지만 숙박 리뷰와 당일입욕 분모를 분리해야 한다.", "공식 당일입욕 시간·요금·사용 욕장과 Google listing identity를 고정한 뒤 P0로 넘긴다."],
  "kurokawa-kounoyu-dayuse" => ["P0_boundary_first", "promote_boundary_first", "구로카와 입탕수 child 시설이며 숙박자·당일입욕 경계가 먼저 필요하다.", "공식 일일입욕 가능일·시간·욕장 범위를 시설 단위로 고정한다."],
  "kurokawa-yamamizuki-dayuse" => ["P0_boundary_first", "promote_boundary_first", "한국 수요가 강하고 노천탕 기대가 높지만 정확한 Google listing과 당일입욕 scope를 먼저 잠가야 한다.", "동명 숙소/당일입욕 표면을 분리하고 공식 조건을 확인한다."],
  "kurokawa-ikoi-dayuse" => ["P0_boundary_first", "promote_boundary_first", "Google 896건과 한국 수요는 충분하지만 숙박·당일입욕 표본 혼입이 예상된다.", "당일입욕 전용 욕장·시간·접수조건을 공식 페이지로 확정한다."],
  "kurokawa-kurokawaso-dayuse" => ["P0_boundary_first", "promote_boundary_first", "구로카와 child 시설로서 당일입욕 scope를 고정하지 않으면 료칸 리뷰가 원장을 오염시킨다.", "공식 당일입욕 조건과 Google listing identity를 먼저 확인한다."],
  "fukuoka-terihaspa-resort" => ["P0_boundary_first", "promote_boundary_first", "Google 4,027건과 강한 한국 수요가 있으나 숙박·심야체류·스파 상품 경계를 분리해야 한다.", "day-use 입욕과 숙박/휴식 상품을 분리한 scope contract를 만든다."],
  "fukuoka-hakata-manyo-no-yu" => ["P0_boundary_first", "promote_boundary_first", "강한 한국 수요와 여행자 가치가 있으나 숙박·심야체류·운반온천 scope를 먼저 분리해야 한다.", "정확한 Google listing 및 day-use/숙박/온천수 도입 범위를 고정한다."],
  "kumamoto-yulax" => ["P0_boundary_first", "promote_boundary_first", "Google 3,193건과 강한 한국 수요가 있으나 사우나·휴식 중심 상품과 온천수 사용 범위를 분리해야 한다.", "공식 천연온천 여부와 bath/sauna/rest-area 분모를 확정한다."],
  "beppu-hoyoland" => ["P1_hold", "retain_p1", "Google 2,496·Nifty 143·Yahoo 107은 잠겼지만 기존 공식 URL이 DNS 오류라 운영 주체·욕장 범위를 재확인해야 한다.", "현재 운영 공식/지자체 URL을 다시 잠근 뒤 mud-bath 영역을 분리해 재심한다."],
  "ibusuki-sayuri" => ["P1_candidate", "retain_p1", "Google 1,028건의 독립 모래찜질 시설이지만 이미 사라쿠가 P0에서 같은 경험축을 대표한다.", "사라쿠와 다른 프로세스·대기·전망·요금 구조가 공식 근거로 분리되면 승격한다."],
  "ibusuki-tamatebako" => ["P1_hold", "retain_p1", "Google 1,482·Yahoo 99의 대표 전망탕이지만 기존 공식 관광 URL이 404다.", "현 운영 주체 또는 지자체의 현재 공식 페이지를 잠근 뒤 공식 수질·운영 범위를 재심한다."],
  "ibusuki-kokoro-no-yu" => ["P1_hold", "retain_p1", "당일입욕·숙박 혼합 후보이며 기존 공식 URL 접근이 실패했다.", "현재 운영 URL과 day-use 범위를 먼저 재확인한다."],
  "takeo-saginoyu" => ["P1_candidate", "retain_p1", "Google 483건이지만 같은 다케오 온천 공중탕군의 모토유 P0와 제품 중복 가능성이 있다.", "모토유와 욕장·수질·이용 동선이 구분되는 공식 근거가 확보되면 승격한다."],
  "takeo-tonosamayu" => ["P1_candidate", "retain_p1", "reserve_private 모델은 명확하지만 Google 47건으로 첫 P0 딥리서치 표본 여력이 작다.", "공식 예약·시간·요금 범위와 두 번째 리뷰 표면을 잠근 뒤 private-bath 트랙으로 재심한다."],
  "unzen-yokayuu" => ["P1_candidate", "retain_p1", "공식 URL과 Google 414건은 확인됐지만 한국 수요와 다중 플랫폼 풀을 더 확보해야 한다.", "Nifty/Yahoo identity lock과 공식 수질을 보강한다."],
  "obama-naminoyu-akane" => ["P1_candidate", "retain_p1", "전망형 공중탕 제품은 분명하지만 Google 269건과 단일 표면만 확인됐다.", "대절/공중탕 상품 범위와 Nifty/Yahoo 리뷰 표면을 추가 확인한다."],
  "kirishima-sakura-sakura-dayuse" => ["P1_boundary_recheck", "retain_p1", "숙박 혼합 체험형 시설이라 당일입욕과 체험 상품을 분리해야 한다.", "day-use 전용 상품·욕장·이용조건을 확정한 뒤 재심한다."],
  "kirishima-maeda-onsen" => ["P1_candidate", "retain_p1", "Google 499건의 지역 공중탕이지만 한국 비교 가치와 다중 플랫폼 풀이 아직 약하다.", "공식 수질과 Nifty/Yahoo 표면을 보강한다."],
  "kirishima-shinyu-onsen" => ["P1_hold", "retain_p1", "숙박 혼합·운영 변동 가능성이 있고 기존 공식 URL 접근이 실패했다.", "현재 운영 공지와 당일입욕 허용 범위를 확인한다."],
  "kumamoto-tsukasa-no-yu" => ["P1_hold", "retain_p1", "Google 2,177건이지만 기존 공식 URL이 DNS 오류라 시설 정체성과 온천수 범위를 재잠금해야 한다.", "현재 운영 공식 URL·family/private bath 범위·수질을 확인한 뒤 재심한다."],
  "kagoshima-spaland-rarara" => ["P1_hold", "retain_p1", "도시권 스파 대표성은 있으나 숙박 혼합이고 기존 공식 URL 접근이 실패했다.", "현재 운영 공식 URL과 day-use/숙박 scope를 확인한다."]
}.freeze

WATER_FACTS = {
  "fukuoka-nakagawa-seiryu" => [
    "official_water_profile_locked",
    "単純温泉、単純弱放射能冷鉱泉",
    "那珂川の上流に湧き出る天然温泉。背振山麗の地下深く、早良花崗岩より目覚める良質な天然温泉。",
    "https://www.nakagawaseiryu.jp/spa-seiryu.html",
    "public_bath_and_open_air_public_bath; family_bath_separate_product",
    "no_method_badge_official_spring_quality_only"
  ],
  "kumamoto-kashima-yumoto-suishun" => [
    "official_water_profile_partial_locked",
    "not_found_in_checked_official_text",
    "地下1,100mから湧き出した天然温泉。※岩風呂の上段が源泉掛け流しになっております。",
    "https://suisyun.jp/kumamoto/",
    "open_air_public_bath_rock_bath_upper_tier_only; not_facility_wide",
    "candidate_source_flow_scope_explicit_but_spring_quality_not_locked"
  ]
}.freeze

def read_csv(path)
  CSV.read(path, headers: true, encoding: "bom|utf-8").map(&:to_h)
end

def write_csv(path, headers, rows)
  CSV.open(path, "w", write_headers: true, headers: headers, encoding: "utf-8") do |csv|
    rows.each { |row| csv << headers.map { |header| row[header] } }
  end
end

FileUtils.mkdir_p(OUTPUT)
now = Time.now.getlocal("+09:00").iso8601
p1_rows = read_csv(INPUT).select { |row| row.fetch("next_priority") == "P1" }

assessment_headers = %w[
  promotion_order candidate_slug japanese_name korean_name candidate_track prefecture facility_model lodging_available
  current_priority official_url official_url_access_status official_identity_status official_water_profile_status water_scope
  google_rating google_visible_review_count google_lock_status nifty_visible_review_count yahoo_visible_review_count
  review_pool_lock_status direct_reviews_read promotion_decision promotion_status decision_reason next_action checked_at_kst
]
assessment_rows = p1_rows.each_with_index.map do |candidate, index|
  slug = candidate.fetch("candidate_slug")
  google_rating, google_count, google_status = GOOGLE_LOCKS.fetch(slug, ["", nil, "not_sampled_in_promotion_preflight"])
  nifty_count, yahoo_count, = SECONDARY_LOCKS.fetch(slug, [nil, nil, "", ""])
  decision, status, reason, action = DECISIONS.fetch(slug)
  water = WATER_FACTS.fetch(slug, ["not_spotchecked", "", "", "", "", ""])
  official_access = OFFICIAL_URL_STATUS.fetch(slug, "http_200_rechecked")
  secondary_locked = SECONDARY_LOCKS.key?(slug)
  pool_status = if google_status == "locked_google_maps" && secondary_locked
                  "google_nifty_yahoo_locked"
                elsif google_status == "locked_google_maps"
                  "google_locked_secondary_pending"
                else
                  "needs_google_identity_lock"
                end

  {
    "promotion_order" => index + 1,
    "candidate_slug" => slug,
    "japanese_name" => candidate.fetch("japanese_name"),
    "korean_name" => candidate.fetch("korean_name"),
    "candidate_track" => candidate.fetch("candidate_track"),
    "prefecture" => candidate.fetch("prefecture"),
    "facility_model" => candidate.fetch("facility_model"),
    "lodging_available" => candidate.fetch("lodging_available"),
    "current_priority" => "P1",
    "official_url" => candidate.fetch("official_url"),
    "official_url_access_status" => official_access,
    "official_identity_status" => official_access == "http_200_rechecked" ? "official_identity_rechecked" : "needs_current_official_source",
    "official_water_profile_status" => water[0],
    "water_scope" => water[4],
    "google_rating" => google_rating,
    "google_visible_review_count" => google_count,
    "google_lock_status" => google_status,
    "nifty_visible_review_count" => nifty_count,
    "yahoo_visible_review_count" => yahoo_count,
    "review_pool_lock_status" => pool_status,
    "direct_reviews_read" => 0,
    "promotion_decision" => decision,
    "promotion_status" => status,
    "decision_reason" => reason,
    "next_action" => action,
    "checked_at_kst" => now
  }
end
write_csv(File.join(OUTPUT, "kyushu_facility_p1_promotion_assessment_#{DATE}.csv"), assessment_headers, assessment_rows)

water_headers = %w[
  candidate_slug japanese_name official_water_profile_status spring_quality_original official_water_text_original
  official_source_url official_source_checked_at water_scope water_method_badge_policy
]
water_rows = p1_rows.select { |candidate| WATER_FACTS.key?(candidate.fetch("candidate_slug")) }.map do |candidate|
  fact = WATER_FACTS.fetch(candidate.fetch("candidate_slug"))
  {
    "candidate_slug" => candidate.fetch("candidate_slug"),
    "japanese_name" => candidate.fetch("japanese_name"),
    "official_water_profile_status" => fact[0],
    "spring_quality_original" => fact[1],
    "official_water_text_original" => fact[2],
    "official_source_url" => fact[3],
    "official_source_checked_at" => now,
    "water_scope" => fact[4],
    "water_method_badge_policy" => fact[5]
  }
end
write_csv(File.join(OUTPUT, "kyushu_facility_p1_official_water_spotcheck_#{DATE}.csv"), water_headers, water_rows)

pool_headers = %w[
  candidate_slug japanese_name platform visible_rating visible_review_count listing_url lock_status identity_note observed_at_kst direct_reviews_read scope_note
]
pool_rows = []
assessment_rows.each do |row|
  candidate = p1_rows.find { |item| item.fetch("candidate_slug") == row.fetch("candidate_slug") }
  pool_rows << {
    "candidate_slug" => row.fetch("candidate_slug"), "japanese_name" => row.fetch("japanese_name"), "platform" => "google_maps",
    "visible_rating" => row.fetch("google_rating"), "visible_review_count" => row.fetch("google_visible_review_count"),
    "listing_url" => candidate.fetch("map_or_review_url"), "lock_status" => row.fetch("google_lock_status"),
    "identity_note" => row.fetch("google_lock_status") == "locked_google_maps" ? "Aside Browser listing title and address were directly checked." : "No exact listing lock in this promotion preflight.",
    "observed_at_kst" => now, "direct_reviews_read" => 0, "scope_note" => "Visible pool only; no review body was sampled in P1 promotion."
  }
  secondary = SECONDARY_LOCKS[row.fetch("candidate_slug")]
  next unless secondary

  nifty_count, yahoo_count, nifty_url, yahoo_url = secondary
  pool_rows << {
    "candidate_slug" => row.fetch("candidate_slug"), "japanese_name" => row.fetch("japanese_name"), "platform" => "nifty_onsen",
    "visible_rating" => "", "visible_review_count" => nifty_count, "listing_url" => nifty_url,
    "lock_status" => nifty_count ? "locked" : "not_found_in_checked_search", "identity_note" => "Exact facility page checked where URL exists.",
    "observed_at_kst" => now, "direct_reviews_read" => 0, "scope_note" => "Visible pool only; no review body was sampled in P1 promotion."
  }
  pool_rows << {
    "candidate_slug" => row.fetch("candidate_slug"), "japanese_name" => row.fetch("japanese_name"), "platform" => "yahoo_map",
    "visible_rating" => "", "visible_review_count" => yahoo_count, "listing_url" => yahoo_url,
    "lock_status" => yahoo_count ? "locked" : "not_found_in_checked_search", "identity_note" => "Exact facility page checked where URL exists.",
    "observed_at_kst" => now, "direct_reviews_read" => 0, "scope_note" => "Visible pool only; no review body was sampled in P1 promotion."
  }
end
write_csv(File.join(OUTPUT, "kyushu_facility_p1_review_pool_preflight_#{DATE}.csv"), pool_headers, pool_rows)

p0_headers = %w[
  research_order candidate_slug japanese_name korean_name candidate_track prefecture facility_model official_url google_visible_review_count nifty_visible_review_count yahoo_visible_review_count official_water_profile_status water_scope priority_reason status
]
p0_rows = assessment_rows.select { |row| row.fetch("promotion_decision") == "P0_candidate" }.each_with_index.map do |row, index|
  {
    "research_order" => index + 1,
    "candidate_slug" => row.fetch("candidate_slug"),
    "japanese_name" => row.fetch("japanese_name"),
    "korean_name" => row.fetch("korean_name"),
    "candidate_track" => row.fetch("candidate_track"),
    "prefecture" => row.fetch("prefecture"),
    "facility_model" => row.fetch("facility_model"),
    "official_url" => row.fetch("official_url"),
    "google_visible_review_count" => row.fetch("google_visible_review_count"),
    "nifty_visible_review_count" => row.fetch("nifty_visible_review_count"),
    "yahoo_visible_review_count" => row.fetch("yahoo_visible_review_count"),
    "official_water_profile_status" => row.fetch("official_water_profile_status"),
    "water_scope" => row.fetch("water_scope"),
    "priority_reason" => row.fetch("decision_reason"),
    "status" => "P0_candidate_pre_deepresearch"
  }
end
write_csv(File.join(OUTPUT, "kyushu_facility_p0_promotion_queue_#{DATE}.csv"), p0_headers, p0_rows)

boundary_headers = %w[candidate_slug japanese_name korean_name candidate_track facility_model google_visible_review_count reason next_action status]
boundary_rows = assessment_rows.select { |row| row.fetch("promotion_decision") == "P0_boundary_first" }.map do |row|
  {
    "candidate_slug" => row.fetch("candidate_slug"),
    "japanese_name" => row.fetch("japanese_name"),
    "korean_name" => row.fetch("korean_name"),
    "candidate_track" => row.fetch("candidate_track"),
    "facility_model" => row.fetch("facility_model"),
    "google_visible_review_count" => row.fetch("google_visible_review_count"),
    "reason" => row.fetch("decision_reason"),
    "next_action" => row.fetch("next_action"),
    "status" => "boundary_first"
  }
end
write_csv(File.join(OUTPUT, "kyushu_facility_p0_boundary_first_queue_#{DATE}.csv"), boundary_headers, boundary_rows)

url_headers = %w[candidate_slug japanese_name official_url official_url_access_status required_action]
url_rows = assessment_rows.select { |row| row.fetch("official_url_access_status") != "http_200_rechecked" }.map do |row|
  {
    "candidate_slug" => row.fetch("candidate_slug"),
    "japanese_name" => row.fetch("japanese_name"),
    "official_url" => row.fetch("official_url"),
    "official_url_access_status" => row.fetch("official_url_access_status"),
    "required_action" => "Current operator, municipal, or tourism authority source must be verified before promotion."
  }
end
write_csv(File.join(OUTPUT, "kyushu_facility_p1_official_url_recheck_queue_#{DATE}.csv"), url_headers, url_rows)

counts = assessment_rows.group_by { |row| row.fetch("promotion_decision") }.transform_values(&:size)
report = <<~MD
  # 규슈 온천시설 P1 승격 재심 - #{DATE}

  ## 범위와 방법

  - 입력: #{SOURCE_DATE} 후보 큐의 P1 23건. 기존 P0 딥리서치와 숙박 원장은 수정하지 않았다.
  - 이 단계는 candidate promotion이다. 직접 리뷰 본문은 읽지 않았고 모든 행의 `direct_reviews_read`는 0이다.
  - Google Maps는 Aside Browser로 직접 열어 listing identity와 visible review pool을 잠갔다. Nifty/Yahoo는 exact page가 확인된 일부 후보만 잠갔다.
  - visible review pool은 표본 가능성 지표일 뿐, 직접 읽은 리뷰 수가 아니다.

  ## 판정

  - `P0_candidate`: #{counts.fetch("P0_candidate", 0)}건
  - `P0_boundary_first`: #{counts.fetch("P0_boundary_first", 0)}건
  - P1 유지·hold: #{assessment_rows.size - counts.fetch("P0_candidate", 0) - counts.fetch("P0_boundary_first", 0)}건

  ### P0 후보

  1. **나카가와 세이류**: 공식 단순온천·단순약방사능냉광천 프로필과 public/open-air/family 상품 분리, Google 3,313·Nifty 81·Yahoo 193 리뷰풀이 함께 확인됐다.
  2. **가시마 유모토 스이슌**: 공식 day-use 상품과 노천 암석탕 상단의 원천가케나가시 범위, Google 1,436·Nifty 15·Yahoo 166 리뷰풀이 확인됐다. 이 방식 표기는 해당 노천 암석탕 상단에만 적용한다.

  ### 경계 우선

  구로카와 child 시설과 숙박·심야체류가 섞인 도시형 스파는 우선순위가 낮아서가 아니라 당일입욕 분모가 섞일 위험 때문에 `P0_boundary_first`로 분리했다. 당일입욕 상품·욕장·시간·가격·이용자 범위를 공식으로 고정한 뒤에만 딥리서치에 배정한다.

  ### Hold

  호요랜드, 타마테바코, 코코로노유, 신모에소, 츠카사노유, 스파랜드 라라라는 기존 공식 URL이 DNS 오류·404·접근 실패였다. 이 행들은 Google 노출 수가 커도 현재 운영 공식 근거 없이 P0로 승격하지 않았다.

  ## 다음 액션

  - P0 두 곳: 시설별 독립 디렉터리에서 300+ full-body 리뷰 목표의 딥리서치를 시작한다.
  - Boundary 8곳: day-use scope contract와 official bath-product facts를 먼저 확정한다.
  - URL recheck 7곳: 현재 운영 주체 또는 지자체/관광 권위 URL을 찾기 전까지 P1 hold를 유지한다.
MD
File.write(File.join(OUTPUT, "kyushu_facility_p1_promotion_report_#{DATE}.md"), report)

allowed_decisions = %w[P0_candidate P0_boundary_first P1_candidate P1_boundary_recheck P1_hold]
errors = []
errors << "P1 input/output row count mismatch" unless assessment_rows.size == p1_rows.size
errors << "duplicate candidate_slug" unless assessment_rows.map { |row| row.fetch("candidate_slug") }.uniq.size == assessment_rows.size
errors << "P1 promotion must keep direct_reviews_read=0" unless assessment_rows.all? { |row| row.fetch("direct_reviews_read") == 0 }
errors << "unexpected promotion decision" unless assessment_rows.all? { |row| allowed_decisions.include?(row.fetch("promotion_decision")) }
p0_rows.each do |row|
  errors << "#{row.fetch("candidate_slug")}: official URL is not currently rechecked" unless row.fetch("official_url").match?(%r{\Ahttps://})
  errors << "#{row.fetch("candidate_slug")}: primary review pools are not locked" unless assessment_rows.find { |item| item.fetch("candidate_slug") == row.fetch("candidate_slug") }.fetch("review_pool_lock_status") == "google_nifty_yahoo_locked"
  water = water_rows.find { |item| item.fetch("candidate_slug") == row.fetch("candidate_slug") }
  errors << "#{row.fetch("candidate_slug")}: official water fact missing" unless water && %w[official_water_profile_locked official_water_profile_partial_locked].include?(water.fetch("official_water_profile_status")) && %w[official_water_text_original official_source_url official_source_checked_at water_scope].all? { |field| !water.fetch(field).to_s.empty? }
end
validation = <<~MD
  # 규슈 P1 승격 구조 검증 - #{DATE}

  - 입력 P1 후보: #{p1_rows.size}건
  - 승격 재심 행: #{assessment_rows.size}건
  - 직접 읽은 리뷰: 0건 전부 유지
  - P0 후보: #{p0_rows.size}건
  - Boundary-first: #{boundary_rows.size}건
  - 구조 검증: #{errors.empty? ? "PASS" : "FAIL"}

  #{errors.empty? ? "P1/P2 재심 규칙에 따라 visible review pool과 공식 사실만 사용했으며, 직접 리뷰 원장은 만들지 않았다." : errors.map { |error| "- #{error}" }.join("\n")}

  참고: 기존 `kyushu-facility-pipeline-2026-07-10` P0 딥리서치 원장은 이 후보 승격 작업에서 수정하지 않았다. 현재 validator의 canonical-enum 요구가 기존 원장과 달라지는 경우는 별도 원장 마이그레이션 작업으로 다룬다.
MD
File.write(File.join(OUTPUT, "kyushu_facility_p1_promotion_validation_#{DATE}.md"), validation)
abort("P1 promotion validation failed: #{errors.join('; ')}") unless errors.empty?

puts "Built P1 promotion reassessment: #{assessment_rows.size} candidates, #{p0_rows.size} P0 candidates, #{boundary_rows.size} boundary-first"
