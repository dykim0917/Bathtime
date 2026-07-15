#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "fileutils"
require "time"

DATE = "2026-07-11"
INPUT = "research/onsen-candidates/nationwide-2026-07-03/chubu_hokuriku_koshin_facility_candidate_status_2026-07-03.csv"
OUTPUT = "research/onsen-db-seed/chubu-hokuriku-koshin-facility-p1-operation-#{DATE}"

# These rows were rechecked as candidate-stage operation/identity evidence only.
# Visible review counts below are platform pool values, never direct-review evidence.
RECHECK = {
  "gero-sachinoyu" => {
    operation_type: "municipal_authority",
    operation_url: "https://www.city.gero.lg.jp/site/kanko/1258.html",
    operation_note: "하루입욕 공중탕과 사우나의 운영시간·정기휴일·요금이 지자체 페이지에 남아 있다. 숙박 부속 공중탕이므로 당일입욕과 숙박 범위를 먼저 분리한다.",
    independent_url: "",
    independent_note: "이번 재확인에서는 같은 시설의 현재 독립 지도/리뷰 listing URL을 잠그지 못했다.",
    visible_count: "",
    pool_status: "independent_surface_not_locked",
    water_status: "regional_water_profile_not_facility_badge",
    water_scope: "dayuse_public_bath; lodging_attached; family_bath_closed_notice_separate",
    decision: "P1_boundary_first",
    status: "retain_boundary_first",
    action: "당일입욕 공중탕과 숙박·휴지 가족탕을 분리한 scope contract를 만들고, 현재 독립 지도/리뷰 listing을 잠근 뒤 P0 재심한다."
  },
  "gero-shirasagi" => {
    operation_type: "municipal_authority",
    operation_url: "https://www.city.gero.lg.jp/site/kanko/1258.html",
    operation_note: "지자체 페이지가 공중탕의 운영시간·정기휴일·요금과 내탕·휴게공간 정체성을 제시한다.",
    independent_url: "https://onsen.nifty.com/geroshinai-onsen/onsen002502/",
    independent_note: "Nifty Onsen 독립 listing에서 시설명·하부 주소권·전화번호가 대조됐다. 이번 표면 점검에서는 수치를 확정하지 않았다.",
    visible_count: "",
    pool_status: "identity_locked_count_not_captured",
    water_status: "regional_water_profile_not_facility_badge",
    water_scope: "public_bath",
    decision: "P1_candidate",
    status: "retain_pending_review_pool_lock",
    action: "Google·Nifty·Yahoo의 수치를 각각 실제 listing header에서 읽어 review-pool lock을 만든다. 수질·운용은 시설 범위 원문을 별도로 확보한다."
  },
  "wakura-soyu" => {
    operation_type: "tourism_association_current_operation_page",
    operation_url: "https://www.wakura.or.jp/brochure/brochure-660-2",
    operation_note: "지진 뒤 임시휴업에서 통상 영업으로 전환됐으며, 2026년 정기휴일 변경과 현재 운영시간·요금이 관광협회 페이지에 제시된다.",
    independent_url: "https://map.yahoo.co.jp/v3/place/oEv-xagk2SM",
    independent_note: "Yahoo Map이 와쿠라초 와6-2의 일귀리 입욕 시설명과 현재 운영 표면을 보여 준다.",
    visible_count: "136",
    pool_status: "one_numeric_independent_surface_locked",
    water_status: "official_water_profile_reinforcement",
    water_scope: "public_bath; public_open_air_bath; sauna; not_facility_wide_method_badge",
    decision: "P0_candidate",
    status: "promote_to_p0_with_water_reinforcement",
    action: "P0 시작 전 Google·Nifty·Yahoo를 각각 수치 단위로 잠그고, 공식 수질·욕조별 운용 원문을 공용 욕장 범위로 추가 확보한다."
  },
  "nozawa-furusato-no-yu" => {
    operation_type: "municipal_authority_current_page",
    operation_url: "https://www.vill.nozawaonsen.nagano.jp/www/contents/1050000000241/index.html",
    operation_note: "지자체 페이지가 계절별 운영시간·휴관일·요금과 내탕(뜨거운탕·미지근한탕)·노천탕·샤워 범위를 제시한다.",
    independent_url: "https://onsen.nifty.com/iiyama-nagano-onsen/onsen002174/",
    independent_note: "Nifty Onsen listing이 노자와온천촌 도요사토 주소와 일귀리 입욕 시설명을 대조한다.",
    visible_count: "12",
    pool_status: "one_numeric_independent_surface_locked",
    water_status: "official_water_profile_reinforcement",
    water_scope: "public_bath; open_air_public_bath",
    decision: "P0_candidate",
    status: "promote_to_p0_with_water_reinforcement",
    action: "P0 딥리서치 전 Google·Nifty·Yahoo 리뷰풀을 별도로 잠그고, 당일입욕 욕장에 적용되는 공식 수질·운용 원문을 확보한다."
  },
  "shirahonet-public-openair" => {
    operation_type: "municipal_tourism_authority",
    operation_url: "https://visitmatsumoto.com/spot/detail_1050.html",
    operation_note: "관광기관 페이지가 계절 운영·겨울 휴업·운영시간·요금·주소를 공공 노천탕 범위로 제시한다.",
    independent_url: "https://www.jalan.net/kankou/spt_20202cd2112041755/kuchikomi/",
    independent_note: "Jalan의 같은 공공 노천탕 review surface는 기존 후보 검증에서 확인됐으나 이번 재확인에서는 노출 수를 잠그지 않았다.",
    visible_count: "",
    pool_status: "identity_locked_count_not_captured",
    water_status: "official_water_profile_reinforcement",
    water_scope: "open_air_public_bath; seasonal_closure",
    decision: "P0_candidate",
    status: "promote_to_p0_with_water_reinforcement",
    action: "P0 딥리서치 전 계절 운영 상태를 재확인하고 Google·Nifty·Yahoo 수치를 listing header에서 잠근다. 가온·순환·소독은 공식 원문이 나오기 전 배지화하지 않는다."
  },
  "echigo-yuzawa-komako-no-yu" => {
    operation_type: "onsen_association_current_page",
    operation_url: "https://yuzawaonsen.com/?page_id=160",
    operation_note: "공동욕장 운영 페이지가 현재 요금·운영시간·휴관일·주소와 공동욕장 정체성을 제시한다.",
    independent_url: "https://onsen.nifty.com/echigoyuzawa-onsen/onsen001659/",
    independent_note: "Nifty Onsen listing이 유자와마치 유자와 148 주소의 공동욕장 이름을 대조한다.",
    visible_count: "26",
    pool_status: "one_numeric_independent_surface_locked",
    water_status: "official_water_profile_partial_locked",
    water_scope: "public_bath; facility_representative_spring_quality_only",
    decision: "P0_candidate",
    status: "promote_to_p0_with_water_reinforcement",
    action: "공식 페이지의 온천질은 대표 프로필로만 보관한다. 방식 배지는 원문·URL·확인시각·욕장 scope를 모두 확보할 때까지 만들지 않는다."
  },
  "wakura-yuttari-park-footbath" => {
    operation_type: "tourism_association_current_operation_page",
    operation_url: "https://www.wakura.or.jp/brochure/brochure-4313",
    operation_note: "기존 湯っ足りパーク 족욕은 2026년 5월 12일 わくらポケモン足湯로 리뉴얼됐고, 운영시간·무료 이용·위치가 관광협회 페이지에 제시된다.",
    independent_url: "https://www.google.co.jp/maps/search/37.087681,+136.924077?entry=tts",
    independent_note: "Google Maps가 현재 わくらポケモン足湯 명칭의 지도 listing과 최신 리뷰풀 표면을 보인다. 지도 주소 표기는 관광협회 표기와 세부 지번 형식이 달라 alias로 보관한다.",
    visible_count: "52",
    pool_status: "one_numeric_independent_surface_locked_alias_noted",
    water_status: "not_applicable_footbath_only",
    water_scope: "footbath_only",
    decision: "footbath_only",
    status: "retain_footbath_only_current_operation_confirmed",
    action: "온천시설 딥리서치·온천수 방식 배지 대상에서는 제외한다. stopover 데이터로는 신명칭과 지도 alias를 병기한다."
  }
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
checked_at = Time.now.getlocal("+09:00").iso8601
rows = read_csv(INPUT)
raise "Expected 28 Tier 1 facility rows, got #{rows.length}." unless rows.length == 28
raise "Expected only Tier 1 rows." unless rows.all? { |row| row["initial_tier"] == "Tier 1" }
raise "Candidate-stage direct-review count is not zero." unless rows.all? { |row| row["directly_read_reviews"] == "0" && row["onsen_related_direct_reviews"] == "0" }

assessment_headers = %w[
  candidate_slug japanese_name korean_name prefecture facility_type original_candidate_status prior_official_url
  verification_route current_operation_source_type current_operation_url independent_operation_surface_url
  independent_surface_note visible_review_pool_count review_pool_lock_status direct_reviews_read
  official_water_profile_status water_scope revised_promotion_decision revised_status next_action checked_at_kst
].freeze

assessment_rows = rows.map do |row|
  item = RECHECK[row.fetch("slug")]
  if item
    {
      "candidate_slug" => row.fetch("slug"),
      "japanese_name" => row.fetch("name_ja"),
      "korean_name" => row.fetch("name_ko_or_en"),
      "prefecture" => row.fetch("prefecture"),
      "facility_type" => row.fetch("property_or_facility_type"),
      "original_candidate_status" => row.fetch("candidate_status"),
      "prior_official_url" => row.fetch("official_url"),
      "verification_route" => "current_operation_recheck",
      "current_operation_source_type" => item.fetch(:operation_type),
      "current_operation_url" => item.fetch(:operation_url),
      "independent_operation_surface_url" => item.fetch(:independent_url),
      "independent_surface_note" => item.fetch(:independent_note),
      "visible_review_pool_count" => item.fetch(:visible_count),
      "review_pool_lock_status" => item.fetch(:pool_status),
      "direct_reviews_read" => "0",
      "official_water_profile_status" => item.fetch(:water_status),
      "water_scope" => item.fetch(:water_scope),
      "revised_promotion_decision" => item.fetch(:decision),
      "revised_status" => item.fetch(:status),
      "next_action" => item.fetch(:action),
      "checked_at_kst" => checked_at
    }
  else
    cleanup = if row.fetch("candidate_status").include?("route_or_pass")
                "route_or_pass"
              elsif row.fetch("candidate_status").include?("footbath_only")
                "footbath_only"
              else
                "retain_original_candidate_status"
              end
    legacy_water_scope = cleanup == "retain_original_candidate_status" ? "not_reassessed" : cleanup
    {
      "candidate_slug" => row.fetch("slug"),
      "japanese_name" => row.fetch("name_ja"),
      "korean_name" => row.fetch("name_ko_or_en"),
      "prefecture" => row.fetch("prefecture"),
      "facility_type" => row.fetch("property_or_facility_type"),
      "original_candidate_status" => row.fetch("candidate_status"),
      "prior_official_url" => row.fetch("official_url"),
      "verification_route" => "legacy_candidate_status_retained",
      "current_operation_source_type" => "",
      "current_operation_url" => "",
      "independent_operation_surface_url" => "",
      "independent_surface_note" => "이번 공통 규칙 반영에서 DNS/404/403 기반 hold 이력이 없어 기존 후보 상태를 유지했다.",
      "visible_review_pool_count" => "",
      "review_pool_lock_status" => "not_rechecked_in_this_operation_pass",
      "direct_reviews_read" => "0",
      "official_water_profile_status" => "not_reassessed_no_method_badge_claim",
      "water_scope" => legacy_water_scope,
      "revised_promotion_decision" => cleanup,
      "revised_status" => "retain_original_candidate_status",
      "next_action" => "기존 후보 상태를 유지한다. P0 승격이 필요하면 현재 운영 근거와 플랫폼별 리뷰풀을 별도 잠근다.",
      "checked_at_kst" => checked_at
    }
  end
end
write_csv(File.join(OUTPUT, "chubu_hokuriku_koshin_facility_p1_operation_assessment_#{DATE}.csv"), assessment_headers, assessment_rows)

evidence_headers = %w[
  candidate_slug japanese_name prior_official_url prior_status current_operation_source_type current_operation_url
  current_operation_evidence independent_operation_surface_url independent_surface_evidence visible_review_pool_count
  revised_promotion_decision revised_status scope_boundary source_checked_at direct_reviews_read
].freeze
evidence_rows = RECHECK.map do |slug, item|
  prior = rows.find { |row| row.fetch("slug") == slug }
  {
    "candidate_slug" => slug,
    "japanese_name" => prior.fetch("name_ja"),
    "prior_official_url" => prior.fetch("official_url"),
    "prior_status" => "#{prior.fetch("candidate_status")}; not_dns_404_403_hold",
    "current_operation_source_type" => item.fetch(:operation_type),
    "current_operation_url" => item.fetch(:operation_url),
    "current_operation_evidence" => item.fetch(:operation_note),
    "independent_operation_surface_url" => item.fetch(:independent_url),
    "independent_surface_evidence" => item.fetch(:independent_note),
    "visible_review_pool_count" => item.fetch(:visible_count),
    "revised_promotion_decision" => item.fetch(:decision),
    "revised_status" => item.fetch(:status),
    "scope_boundary" => item.fetch(:water_scope),
    "source_checked_at" => checked_at,
    "direct_reviews_read" => "0"
  }
end
write_csv(File.join(OUTPUT, "chubu_hokuriku_koshin_facility_alternative_operation_evidence_#{DATE}.csv"), evidence_headers, evidence_rows)

water_headers = %w[
  candidate_slug japanese_name official_water_profile_status official_source_url official_source_checked_at water_scope water_method_badge_policy
].freeze
water_rows = assessment_rows.map do |row|
  rechecked = row.fetch("verification_route") == "current_operation_recheck"
  {
    "candidate_slug" => row.fetch("candidate_slug"),
    "japanese_name" => row.fetch("japanese_name"),
    "official_water_profile_status" => row.fetch("official_water_profile_status"),
    "official_source_url" => rechecked ? row.fetch("current_operation_url") : "",
    "official_source_checked_at" => rechecked ? row.fetch("checked_at_kst") : "",
    "water_scope" => row.fetch("water_scope"),
    "water_method_badge_policy" => "no_method_badge_without_official_original_text_url_checked_at_and_explicit_bath_scope"
  }
end
write_csv(File.join(OUTPUT, "chubu_hokuriku_koshin_facility_official_water_profile_reinforcement_#{DATE}.csv"), water_headers, water_rows)

boundary_headers = %w[candidate_slug japanese_name facility_type original_candidate_status reason next_action status].freeze
boundary_rows = assessment_rows.select do |row|
  %w[P1_boundary_first route_or_pass footbath_only].include?(row.fetch("revised_promotion_decision"))
end.map do |row|
  {
    "candidate_slug" => row.fetch("candidate_slug"),
    "japanese_name" => row.fetch("japanese_name"),
    "facility_type" => row.fetch("facility_type"),
    "original_candidate_status" => row.fetch("original_candidate_status"),
    "reason" => row.fetch("water_scope"),
    "next_action" => row.fetch("next_action"),
    "status" => row.fetch("revised_status")
  }
end
write_csv(File.join(OUTPUT, "chubu_hokuriku_koshin_facility_boundary_first_queue_#{DATE}.csv"), boundary_headers, boundary_rows)

promoted = assessment_rows.count { |row| row.fetch("revised_promotion_decision") == "P0_candidate" }
boundary = assessment_rows.count { |row| row.fetch("revised_promotion_decision") == "P1_boundary_first" }
footbath = assessment_rows.count { |row| row.fetch("revised_promotion_decision") == "footbath_only" }
routes = assessment_rows.count { |row| row.fetch("revised_promotion_decision") == "route_or_pass" }
retained = assessment_rows.count { |row| row.fetch("revised_promotion_decision") == "retain_original_candidate_status" } + assessment_rows.count { |row| row.fetch("revised_promotion_decision") == "P1_candidate" }

report = <<~MD
  # 중부·호쿠리쿠·고신 Tier 1 시설 운영 근거 재조정

  작성일: #{DATE}

  ## 적용 범위

  - 기존 중부·호쿠리쿠·고신 Tier 1 비숙박 온천시설 28곳만 반영했습니다.
  - 숙소 seed·숙소 리뷰 산출물과 규슈 파일은 변경하지 않았습니다.
  - 이번 단계는 후보 정규화입니다. 직접 읽은 리뷰와 온천 관련 직접 리뷰는 전부 0건입니다.

  ## 재조정 결과

  - P0 candidate: #{promoted}곳. 현재 운영 근거와 독립 지도/리뷰 표면을 확인했지만, 리뷰풀은 직접 리뷰 표본이 아닙니다.
  - P1 boundary-first: #{boundary}곳. 숙박 부속 당일입욕 범위를 분리한 뒤 재심합니다.
  - route_or_pass: #{routes}곳. 개별 욕장과 공통 루트를 섞지 않습니다.
  - footbath_only: #{footbath}곳. stopover로 유지하며 온천시설 딥리서치와 수질 방식 배지 대상에서는 제외합니다.
  - 기존 후보 상태 유지 또는 리뷰풀 잠금 대기: #{retained}곳. 원래 파일에 DNS/404/403만으로 hold된 행은 없어 대체 운영 근거만으로 임의 승격하지 않았습니다.

  ## 운영 근거 규칙

  레거시 URL의 접근 실패만으로 후보를 hold하지 않습니다. 다만 승격은 현재 운영사·지자체·관광기관의 운영/상품/정체성 근거와 별도 지도·리뷰 listing이 함께 있을 때만 검토합니다. 이 근거는 운영 중·정체성에만 적용되며, 포털 설명이나 리뷰풀을 공식 온천수 사실로 바꾸지 않습니다.

  ## 온천수·혼합 상품 규칙

  방식 배지는 공식 원문, URL, 확인시각, 욕장 scope가 모두 있을 때만 후보입니다. 이번 재조정에서 `源泉`·`かけ流し` 같은 과거 후보 메모는 시설 전체 방식 배지로 승격하지 않았습니다. `幸乃湯`는 숙박 부속 당일입욕 상품이므로 P1 boundary-first로 남겼습니다. 와쿠라의 족욕은 리뉴얼된 stopover이며, 공용 욕장이나 숙박 상품과 합치지 않습니다.

  ## 리뷰풀 규칙

  숫자가 실제 listing header에서 보인 경우에만 visible review pool로 기록했습니다. 수치가 없거나 확인하지 못한 Nifty/Jalan/Yahoo/Google URL은 다중 플랫폼 lock으로 세지 않았습니다. Google 지도와 기타 포털의 리뷰 카드, 검색 스니펫, OTA 요약은 직접 리뷰 수에 포함하지 않았습니다.

  ## 다음 액션

  1. P0 candidate 4곳은 Google·Nifty·Yahoo를 플랫폼별 실제 수치로 잠근 뒤 딥리서치 배정합니다.
  2. `幸乃湯`는 당일입욕 공중탕·숙박·휴지 가족탕의 리뷰 분모를 분리한 scope contract를 먼저 작성합니다.
  3. 나머지 후보는 기존 후보 상태를 유지하고, 수질 방식 배지가 필요할 때만 공식 원문·욕장 scope를 추가 수집합니다.
MD
File.write(File.join(OUTPUT, "chubu_hokuriku_koshin_facility_p1_operation_policy_#{DATE}.md"), report)

errors = []
errors << "Expected 28 assessment rows, got #{assessment_rows.length}." unless assessment_rows.length == 28
errors << "Expected seven recheck evidence rows, got #{evidence_rows.length}." unless evidence_rows.length == 7
errors << "Candidate-stage direct review counts must all be 0." unless assessment_rows.all? { |row| row.fetch("direct_reviews_read") == "0" }
errors << "Unexpected P0 count: #{promoted}." unless promoted == 4
errors << "Expected one boundary-first row, got #{boundary}." unless boundary == 1
errors << "Every numerical pool must use a numeric value." unless assessment_rows.all? do |row|
  row.fetch("visible_review_pool_count").empty? || row.fetch("visible_review_pool_count").match?(/\A\d+\z/)
end
abort(errors.join("\n")) unless errors.empty?

puts "Wrote #{assessment_rows.length} assessment rows, #{evidence_rows.length} operation-evidence rows, #{promoted} P0 candidates."
