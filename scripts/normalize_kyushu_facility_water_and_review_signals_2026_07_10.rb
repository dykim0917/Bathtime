#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "date"
require "json"

ROOT = File.expand_path("..", __dir__)
DATE = "2026-07-10"
OUTPUT = File.join(ROOT, "research", "onsen-db-seed", "kyushu-facility-pipeline-#{DATE}")
DEEP_ROOT = File.join(OUTPUT, "deepresearch", "kyushu_#{DATE}")
FORBIDDEN_SIGNAL = "source_flow_claim"
INITIAL_FORBIDDEN_SIGNAL_ROWS = 7
INITIAL_FORBIDDEN_SIGNAL_MENTIONS = 45
INITIAL_FORBIDDEN_LEDGER_TAGS = 7
INITIAL_LEGACY_MAPPING_FILES = 3
INITIAL_NON_EXPERIENCE_ROWS = 15
INITIAL_SIGNAL_SCHEMA_UPDATES = 71
NON_EXPERIENCE_SIGNAL_TYPES = %w[korean_language_context product_area public_bath_hot_spring facility_area].freeze
SIGNAL_TYPE_REMAP = {
  "private_bath_experience" => "family_private_bath_experience",
  "steam_bath_experience" => "sand_or_steam_experience",
  "crowding" => "crowding_or_wait",
  "booking_confusion" => "reservation_or_queue_confusion",
  "cleanliness" => "cleanliness_amenities",
  "access" => "accessibility",
  "payment" => "price_payment_value",
  "bedrock_sand" => "bath_variety",
  "water_temperature" => "temperature_experience",
  "rest_area_experience" => "bath_variety",
  "open_air_bath_experience" => "bath_variety",
  "crowding_or_space" => "crowding_or_wait",
  "privacy_tourist_expectation_gap" => "tourist_expectation_gap"
}.freeze
AREA_REMAP = {
  "bedrock_bath_sand_sauna" => "stone_sauna",
  "sauna_bedrock" => "stone_sauna"
}.freeze
CONTRADICTION_REMAP = {
  "none" => "not_assessed",
  "repeated_positive_negative" => "high"
}.freeze

WATER_OVERRIDES = {
  "beppu-hyotan" => {
    "facility_area" => "facility_wide",
    "scope_key" => "hot-spring-baths",
    "scope_label_ko" => "시설 내 온천탕",
    "water_system" => "kakenagashi",
    "method_render_status" => "candidate_after_recheck"
  },
  "beppu-takegawara" => {
    "facility_area" => "facility_wide",
    "scope_key" => "public-bath-and-sand-bath",
    "scope_label_ko" => "일반탕·모래찜질 온천수",
    "water_system" => "kakenagashi",
    "method_render_status" => "candidate_after_recheck"
  },
  "beppu-sakurayu" => {
    "facility_area" => "public_bath",
    "scope_key" => "public-bath",
    "scope_label_ko" => "대욕장 실내탕·노천탕",
    "water_system" => "kakenagashi",
    "method_render_status" => "candidate_after_recheck",
    "spring_types" => ["ナトリウム・マグネシウム炭酸水素塩塩化物泉"],
    "official_original_text" => "桜湯の大浴場は、内湯露天ともに毎日清掃し、毎朝湯張をします。清潔感を第一にお客様に新鮮な源泉かけ流しをお届けします。",
    "official_source_url" => "https://www.sakurayu.net/%E5%A4%A7%E6%B5%B4%E5%A0%B4/",
    "official_source_checked_at" => "2026-07-10"
  },
  "beppu-kannawa-mushiyu" => {
    "facility_area" => "steam_bath",
    "scope_key" => "steam-bath",
    "scope_label_ko" => "돌찜질 온천 체험",
    "water_system" => "kakenagashi",
    "method_render_status" => "candidate_after_recheck"
  },
  "yufuin-shitanyu" => {
    "facility_area" => "public_bath",
    "scope_key" => "public-bath-and-open-air-bath",
    "scope_label_ko" => "공용 실내·노천탕"
  },
  "ibusuki-saraku" => {
    "facility_area" => "sand_bath",
    "scope_key" => "sand-bath-associated-water",
    "scope_label_ko" => "모래찜질 온천수"
  },
  "ureshino-siebold-no-yu" => {
    "facility_area" => "public_bath",
    "scope_key" => "public-bath",
    "scope_label_ko" => "공용 온천"
  },
  "takeo-motonoyu" => {
    "facility_area" => "public_bath",
    "scope_key" => "takeo-onsen-area-profile",
    "scope_label_ko" => "다케오 온천 권역 수질",
    "method_render_status" => "scope_split_required"
  },
  "unzen-kojigoku-onsenkan" => {
    "facility_area" => "public_bath",
    "scope_key" => "public-bath",
    "scope_label_ko" => "소지고쿠 온천관 공용탕",
    "water_color" => "white",
    "color_filter_status" => "ready"
  },
  "fukuoka-namiha-no-yu" => {
    "facility_area" => "open_air_public_bath",
    "scope_key" => "open-air-public-bath",
    "scope_label_ko" => "노천 공용 온천"
  },
  "kumamoto-agannasse" => {
    "facility_area" => "public_bath",
    "scope_key" => "main-and-open-air-bath",
    "scope_label_ko" => "주욕장·노천탕",
    "method_render_status" => "scope_split_required"
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

def checked_date(value)
  Date.parse(value.to_s).iso8601
rescue Date::Error
  nil
end

def spring_types(value)
  value.to_s.split(";").map(&:strip).reject(&:empty?)
end

removed_rows = []
non_experience_rows = []
signal_schema_updates = 0
summary_updates = []
Dir.glob(File.join(DEEP_ROOT, "*", "*_facility_review_signal_rows_#{DATE}.csv")).sort.each do |path|
  headers = CSV.read(path, headers: true, encoding: "bom|utf-8").headers
  rows = read_csv(path)
  slug = File.basename(File.dirname(path))
  changed = false
  retained = rows.each_with_object([]) do |row, result|
    signal_type = row.fetch("signal_type", "").to_s.strip
    if signal_type == FORBIDDEN_SIGNAL
      removed_rows << { "candidate_slug" => slug, "path" => path, "mention_count" => row["mention_count"].to_i }
      changed = true
      next
    end
    if NON_EXPERIENCE_SIGNAL_TYPES.include?(signal_type)
      non_experience_rows << { "candidate_slug" => slug, "path" => path, "signal_type" => signal_type, "mention_count" => row["mention_count"].to_i }
      changed = true
      next
    end

    mapped_signal_type = SIGNAL_TYPE_REMAP.fetch(signal_type, signal_type)
    if mapped_signal_type != signal_type
      row["signal_type"] = mapped_signal_type
      signal_schema_updates += 1
      changed = true
    end

    area = row.fetch("facility_area", "").to_s.strip
    normalized_area = area.include?(";") ? "facility_wide" : AREA_REMAP.fetch(area, area)
    if normalized_area != area
      row["facility_area"] = normalized_area
      row["facility_area_confidence"] = "facility_wide" if normalized_area == "facility_wide"
      signal_schema_updates += 1
      changed = true
    end

    contradiction = row["contradiction_level"].to_s.strip
    normalized_contradiction = CONTRADICTION_REMAP.fetch(contradiction, contradiction)
    if normalized_contradiction != contradiction
      row["contradiction_level"] = normalized_contradiction
      signal_schema_updates += 1
      changed = true
    end
    result << row
  end
  next unless changed

  write_csv(path, headers, retained)

  summary_path = Dir[File.join(File.dirname(path), "*_facility_review_signal_summary_#{DATE}.md")].first
  next unless summary_path

  summary = File.read(summary_path)
  summary = summary.gsub("official_direct_source_flow_claim", "water_system = null")
  summary = summary.lines.reject { |line| line.include?("| #{FORBIDDEN_SIGNAL} |") }.join
  summary = summary.gsub(/`#{FORBIDDEN_SIGNAL}`/, "방식 관련 후기 언급")
  summary = summary.gsub(/\b#{FORBIDDEN_SIGNAL}\b/, "방식 관련 후기 언급")
  File.write(summary_path, summary)
  summary_updates << summary_path
end

ledger_tag_updates = []
Dir.glob(File.join(DEEP_ROOT, "*", "*_direct_review_sample_index_#{DATE}.csv")).sort.each do |path|
  headers = CSV.read(path, headers: true, encoding: "bom|utf-8").headers
  next unless headers.include?("sampling_stratum")

  rows = read_csv(path)
  changed = 0
  rows.each do |row|
    tags = row.fetch("sampling_stratum", "").to_s.split(/[;|]/).map(&:strip)
    next unless tags.delete(FORBIDDEN_SIGNAL)

    row["sampling_stratum"] = tags.reject(&:empty?).join(";")
    changed += 1
  end
  next if changed.zero?

  write_csv(path, headers, rows)
  ledger_tag_updates << { "path" => path, "rows" => changed }
end

spotcheck_path = File.join(OUTPUT, "kyushu_facility_official_water_spotcheck_#{DATE}.csv")
spotchecks = read_csv(spotcheck_path).to_h { |row| [row.fetch("candidate_slug"), row] }
water_facts = []
water_holds = []
spotchecks.each do |slug, spotcheck|
  override = WATER_OVERRIDES[slug]
  if slug == "ureshino-hyakunen-no-yu"
    water_holds << {
      "facility_slug" => slug,
      "reason" => "공식 원문·URL·확인일·욕조 범위 4종 세트가 없어 water fact를 만들지 않았습니다.",
      "method_render_status" => "no_badge"
    }
    next
  end

  raise "Missing water override for #{slug}" unless override

  original_text = override["official_original_text"] || spotcheck.fetch("official_water_text_original")
  source_url = override["official_source_url"] || spotcheck.fetch("official_source_url")
  checked_at = override["official_source_checked_at"] || checked_date(spotcheck.fetch("official_source_checked_at"))
  raise "Missing official water contract for #{slug}" if [original_text, source_url, checked_at].any? { |value| value.to_s.strip.empty? }

  water_facts << {
    "facility_slug" => slug,
    "facility_area" => override.fetch("facility_area"),
    "scope_key" => override.fetch("scope_key"),
    "scope_label_ko" => override.fetch("scope_label_ko"),
    "day_use_available" => "confirmed",
    "water_system" => override.fetch("water_system", nil),
    "kasui" => "unknown",
    "kaon" => "unknown",
    "disinfection" => "unknown",
    "spring_types" => override.fetch("spring_types", spring_types(spotcheck["spring_quality_original"])),
    "texture_filter_candidates" => [],
    "water_color" => override.fetch("water_color", "unknown"),
    "method_render_status" => override.fetch("method_render_status", "no_badge"),
    "texture_filter_status" => "not_eligible",
    "color_filter_status" => override.fetch("color_filter_status", "not_eligible"),
    "official_original_text" => original_text,
    "official_source_url" => source_url,
    "official_source_checked_at" => checked_at,
    "source_file" => "research/onsen-db-seed/kyushu-facility-pipeline-#{DATE}/kyushu_facility_official_water_spotcheck_#{DATE}.csv"
  }
end

water_fact_index = water_facts.to_h { |fact| [fact.fetch("facility_slug"), fact] }
legacy_mapping_updates = []
Dir.glob(File.join(DEEP_ROOT, "*", "*_facility_platform_mapping_#{DATE}.json")).sort.each do |path|
  mapping = JSON.parse(File.read(path))
  water = mapping.dig("official_facts", "water_profile") || mapping["water_profile"]
  next unless water.is_a?(Hash)

  slug = File.basename(File.dirname(path))
  fact = water_fact_index[slug]
  changed = false
  %w[source_flow_badge official_method_badge].each do |key|
    removed = water.delete(key)
    changed = true unless removed.nil?
  end
  if fact && changed
    water["water_system_candidate"] = fact.fetch("water_system")
    water["water_system_status"] = fact.fetch("water_system") ? "official_original_text_url_checked_at_scope_complete" : "official_source_feature_only_no_system_badge"
    water["water_scope"] = fact.fetch("scope_key")
    water["kasui"] = fact.fetch("kasui")
    water["kaon"] = fact.fetch("kaon")
    water["disinfection"] = fact.fetch("disinfection")
  end
  next unless changed

  File.write(path, JSON.pretty_generate(mapping) + "\n")
  legacy_mapping_updates << path
end

normalized = {
  "schema_version" => "onsen_facility_water_facts/v1",
  "generated_on" => DATE,
  "db_write_allowed" => false,
  "db_write_note" => "시설 부모 draft seed와 별도 DB 적재 QA가 완료되기 전까지 연구용 정규화 산출물로만 사용합니다.",
  "water_facts" => water_facts,
  "water_holds" => water_holds,
  "review_signal_normalization" => {
    "removed_forbidden_signal_type" => FORBIDDEN_SIGNAL,
    "initial_removed_rows" => INITIAL_FORBIDDEN_SIGNAL_ROWS,
    "initial_removed_mention_count" => INITIAL_FORBIDDEN_SIGNAL_MENTIONS,
    "initial_removed_ledger_tags" => INITIAL_FORBIDDEN_LEDGER_TAGS,
    "initial_normalized_legacy_mapping_files" => INITIAL_LEGACY_MAPPING_FILES,
    "current_run_removed_rows" => removed_rows.size,
    "initial_non_experience_rows" => INITIAL_NON_EXPERIENCE_ROWS,
    "initial_signal_schema_updates" => INITIAL_SIGNAL_SCHEMA_UPDATES,
    "current_run_non_experience_rows" => non_experience_rows.size,
    "current_run_schema_updates" => signal_schema_updates,
    "current_run_removed_ledger_tags" => ledger_tag_updates.sum { |row| row.fetch("rows") },
    "current_run_normalized_legacy_mapping_files" => legacy_mapping_updates.size,
    "rule" => "후기의 방식 관련 표현은 온천수 방식 판정이나 후기 신호 집계에 사용하지 않습니다. 공식 원문은 water_facts에만 보존합니다."
  }
}
json_path = File.join(OUTPUT, "kyushu_facility_water_facts_normalized_#{DATE}.json")
File.write(json_path, JSON.pretty_generate(normalized) + "\n")

report = <<~MD
  # 규슈 시설 온천수·후기 신호 정규화 - #{DATE}

  - 범위: 규슈 P0 시설 12곳
  - DB 적재: 하지 않음
  - 최초 정규화에서 제거한 후기 방식 신호: #{INITIAL_FORBIDDEN_SIGNAL_ROWS}행, 언급 수 #{INITIAL_FORBIDDEN_SIGNAL_MENTIONS}건
  - 최초 정규화에서 제거한 원시 리뷰 인덱스 방식 태그: #{INITIAL_FORBIDDEN_LEDGER_TAGS}건
  - 최초 정규화에서 새 후보 형식으로 정리한 기존 방식 매핑: #{INITIAL_LEGACY_MAPPING_FILES}개
  - 최초 QA에서 제외한 비경험 후기 행: #{INITIAL_NON_EXPERIENCE_ROWS}행
  - 최초 QA에서 허용값으로 정리한 후기 스키마 값: #{INITIAL_SIGNAL_SCHEMA_UPDATES}건
  - 공식 온천수 사실 후보: #{water_facts.size}행
  - 공식 원문 계약 미완료 보류: #{water_holds.size}곳

  ## 적용 기준

  - 직접 후기의 원천·직수·순환 관련 문구는 온천수 방식 판정과 후기 신호 집계에서 제외했습니다.
  - `kakenagashi`는 공식 원문에 `源泉かけ流し` 또는 `かけ流し`가 있는 욕조 범위에만 남겼습니다. `kakenagashi_pure`는 0건입니다.
  - 가수·가온·소독은 공식 원문이 없으므로 모두 `unknown`으로 보존했습니다.
  - 소지고쿠 온천관의 `源泉直下` 원문은 직수 용어가 아니므로 방식 배지 없이 공식 수질 사실만 보존했습니다.
  - 백년의탕은 공식 원문 4종 세트가 없어 water fact seed를 만들지 않았습니다.

  ## 다음 게이트

  시설 부모 레코드가 모두 `draft`로 준비되고, 운영 정보 재확인과 seed QA가 끝난 뒤에만 이 파일을 DB 적재 후보로 사용합니다.
MD
report_path = File.join(OUTPUT, "kyushu_facility_water_and_review_signal_normalization_#{DATE}.md")
File.write(report_path, report)

puts "Normalized #{removed_rows.size} forbidden review signal rows; wrote #{water_facts.size} water facts and #{water_holds.size} holds."
