#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "fileutils"
require "time"

ROOT = File.expand_path("..", __dir__)
DATE = "2026-07-10"
OUTPUT = File.join(ROOT, "research", "onsen-db-seed", "kyushu-facility-pipeline-#{DATE}")
SOURCE_DIR = File.join(ROOT, "research", "onsen-review-signals")

P0_SLUGS = %w[
  beppu-hyotan
  beppu-takegawara
  beppu-sakurayu
  beppu-kannawa-mushiyu
  yufuin-shitanyu
  ibusuki-saraku
  takeo-motonoyu
  ureshino-siebold-no-yu
  ureshino-hyakunen-no-yu
  unzen-kojigoku-onsenkan
  fukuoka-namiha-no-yu
  kumamoto-agannasse
].freeze

GOOGLE_OBSERVATIONS = {
  "beppu-hyotan" => { "title" => "ひょうたん温泉", "address" => "159-2 Kannawa, Beppu, Oita 874-0042, Japan", "rating" => "4.2", "count" => "6118", "status" => "locked" },
  "beppu-takegawara" => { "title" => "竹瓦温泉", "address" => "16-23 Motomachi, Beppu, Oita 874-0944, Japan", "rating" => "4.1", "count" => "5127", "status" => "locked" },
  "beppu-sakurayu" => { "title" => "別府桜湯", "address" => "27-8 Hotta-machi, Beppu, Oita 874-0831, Japan", "rating" => "4.3", "count" => "1059", "status" => "locked" },
  "beppu-kannawa-mushiyu" => { "title" => "鉄輪むし湯", "address" => "1 Kannawaue, Beppu, Oita 874-0041, Japan", "rating" => "4.4", "count" => "853", "status" => "locked" },
  "yufuin-shitanyu" => { "title" => "下ん湯", "address" => "Yufuincho Kawakami, Yufu, Oita 879-5102, Japan", "rating" => "4.2", "count" => "299", "status" => "locked" },
  "ibusuki-saraku" => { "title" => "砂むし会館 砂楽", "address" => "5-chome-25-18 Yunohama, Ibusuki, Kagoshima, Japan", "rating" => "4.3", "count" => "5383", "status" => "identity_locked_pool_visible_from_google_result_card" },
  "takeo-motonoyu" => { "title" => "武雄温泉 元湯", "address" => "7425 Takeocho Oaza Takeo, Takeo, Saga 843-0022, Japan", "rating" => "4.2", "count" => "1163", "status" => "locked" },
  "ureshino-siebold-no-yu" => { "title" => "嬉野温泉公衆浴場 シーボルトの湯", "address" => "Otsu-818-2 Ureshinomachi Oaza Shimojuku, Ureshino, Saga 843-0301, Japan", "rating" => "4.1", "count" => "1407", "status" => "locked" },
  "ureshino-hyakunen-no-yu" => { "title" => "うれしの源泉 百年の湯", "address" => "Otsu-2202-8 Ureshinomachi Oaza Shimojuku, Ureshino, Saga 843-0301, Japan", "rating" => "4.0", "count" => "999", "status" => "locked" },
  "unzen-kojigoku-onsenkan" => { "title" => "小地獄温泉館", "address" => "500-1 Obamacho Unzen, Unzen, Nagasaki 854-0621, Japan", "rating" => "4.4", "count" => "1141", "status" => "locked" },
  "fukuoka-namiha-no-yu" => { "title" => "みなと温泉 波葉の湯", "address" => "needs_google_listing_address_recheck", "rating" => "4.0", "count" => "3689", "status" => "identity_locked_address_recheck" },
  "kumamoto-agannasse" => { "title" => "温泉カフェ あがんなっせ", "address" => "3 Chome-10-1 Tsuruhada, Kita Ward, Kumamoto 861-5517, Japan", "rating" => "4.0", "count" => "1430", "status" => "locked" }
}.freeze

WATER_OBSERVATIONS = {
  "beppu-hyotan" => {
    "status" => "official_water_profile_locked", "spring_quality" => "not_found_in_checked_official_text",
    "text" => "ひょうたん温泉にいらしたお客様に、天然源泉を100％かけ流しで提供することをお約束します。 当施設にある温泉は、どれもすべて源泉のみを使用。",
    "source" => "https://www.hyotan-onsen.com/sp/onsen/renewal.html", "scope" => "facility_wide_hot_spring_baths",
    "badge" => "candidate_source_flow_official_text_url_checked_at_scope_complete"
  },
  "beppu-kannawa-mushiyu" => {
    "status" => "official_water_profile_locked", "spring_quality" => "ナトリウム−塩化物泉（塩化物泉）",
    "text" => "種別　引湯 かけ流し", "source" => "https://www.city.beppu.oita.jp/sisetu/shieionsen/detail11.html",
    "scope" => "steam_bath_facility_product", "badge" => "candidate_source_flow_official_text_url_checked_at_scope_complete"
  },
  "yufuin-shitanyu" => {
    "status" => "official_water_profile_locked", "spring_quality" => "単純泉", "text" => "泉質は単純泉で、源泉の温度は69.4℃と熱め。",
    "source" => "https://www.visit-oita.jp/spots/detail/4353", "scope" => "public_bath_and_open_air_public_bath",
    "badge" => "no_method_badge_official_spring_quality_only"
  },
  "ibusuki-saraku" => {
    "status" => "official_water_profile_locked", "spring_quality" => "ナトリウム塩化物泉",
    "text" => "砂むし温泉の泉質は、一般的には「塩泉」と呼ばれるナトリウム塩化物泉です。",
    "source" => "https://www.ibusuki-saraku.jp/ja/sunamushi", "scope" => "sand_bath_and_associated_public_bath_water",
    "badge" => "no_method_badge_official_spring_quality_only"
  },
  "takeo-motonoyu" => {
    "status" => "official_water_profile_partial_locked", "spring_quality" => "弱アルカリ単純泉",
    "text" => "透明で柔らかな湯ざわりが特徴の武雄温泉は1300年の歴史ある温泉。泉質はさまざまな成分が程よく入った弱アルカリ単純泉。",
    "source" => "https://www.takeo-kk.net/spa/", "scope" => "takeo_onsen_area_profile_not_motoyu_bath_specific",
    "badge" => "no_method_badge_area_profile_requires_motoyu_specific_source"
  },
  "ureshino-siebold-no-yu" => {
    "status" => "official_water_profile_locked", "spring_quality" => "ナトリウム－炭酸水素塩・塩化物泉",
    "text" => "泉質　ナトリウム－炭酸水素塩・塩化物泉", "source" => "https://www.city.ureshino.lg.jp/kanko/siebold.html",
    "scope" => "facility_representative_profile", "badge" => "no_method_badge_official_spring_quality_only"
  },
  "unzen-kojigoku-onsenkan" => {
    "status" => "official_water_profile_locked", "spring_quality" => "単純硫黄温泉（硫化水素型）（低張性 弱酸性 高温泉）",
    "text" => "源泉直下にあるため直接湧き出た温泉が注がれます。硫黄の香りに満ちた白濁の湯は、単純硫黄泉でPH4.3の弱酸性。",
    "source" => "https://www.seiunso.jp/kojigoku/", "scope" => "kojigoku_onsenkan_public_bath",
    "badge" => "candidate_source_flow_official_text_url_checked_at_scope_complete"
  },
  "fukuoka-namiha-no-yu" => {
    "status" => "official_water_profile_locked", "spring_quality" => "カルシウム・ナトリウム-塩化物泉",
    "text" => "地下800mから湧き出す天然温泉は毎分400リットルの豊富な湯量が自慢。泉質：カルシウム・ナトリウム-塩化物泉。",
    "source" => "https://namiha.jp/shisetsu/spa/", "scope" => "public_bath_and_open_air_public_bath",
    "badge" => "no_method_badge_official_spring_quality_only"
  },
  "kumamoto-agannasse" => {
    "status" => "official_water_profile_partial_locked", "spring_quality" => "ナトリウムー塩化物・炭酸水素塩泉",
    "text" => "全て炭酸水素塩泉の天然温泉で主浴場、定期的に違った薬湯が楽しめる替わり湯、ジェットバス（水風呂）を備えています。",
    "source" => "https://agannasse-spa.jp/bathhouse/", "scope" => "main_bath_and_open_air_bath_excludes_alternate_drug_bath",
    "badge" => "no_facility_wide_method_badge_scope_differs_by_bath"
  }
}.freeze

MIYAZAKI_CANDIDATES = [
  {
    "candidate_slug" => "miyazaki-konohananoyu",
    "candidate_track" => "traditional_onsen_facility",
    "japanese_name" => "宮崎市自然休養村センター 天然温泉かけ流し このはなの湯",
    "korean_name" => "미야자키 고노하나노유",
    "aliases" => "Konohana no Yu; このはなの湯",
    "facility_type" => "public_bath_facility",
    "facility_model" => "bathe",
    "archetype" => "public bathing",
    "lodging_available" => "false",
    "prefecture" => "宮崎県",
    "municipality" => "宮崎市",
    "onsen_area" => "木花",
    "official_url" => "https://www.city.miyazaki.miyazaki.jp/culture/facilities/89165.html",
    "map_or_review_url" => "https://www.google.com/maps/search/?api=1&query=%E3%81%93%E3%81%AE%E3%81%AF%E3%81%AA%E3%81%AE%E6%B9%AF%20%E5%AE%AE%E5%B4%8E",
    "visible_review_pool" => "not_locked",
    "korean_demand_signal" => "not_found",
    "product_strength" => "시영 당일온천과 원천욕을 함께 제공하는 미야자키 도심권 외곽 표본",
    "likely_tier" => "Tier 2",
    "tier_reason" => "공식 시설 근거는 강하나 리뷰풀과 한국어 수요를 별도 잠금해야 함",
    "cleanup_status" => "keep_facility",
    "verification_status" => "official_checked",
    "source_urls" => "https://www.city.miyazaki.miyazaki.jp/culture/facilities/89165.html;https://www.kanko-miyazaki.jp/feature/onsen",
    "notes" => "2026-07-10 added; municipal source confirms day-use facility; direct_reviews_read=0"
  },
  {
    "candidate_slug" => "miyakonojo-yupoppo",
    "candidate_track" => "traditional_onsen_facility",
    "japanese_name" => "かかしの里 ゆぽっぽ",
    "korean_name" => "미야코노조 유폿포",
    "aliases" => "Yupoppo; Kakashi no Sato Yupoppo",
    "facility_type" => "large_day_use_complex",
    "facility_model" => "bathe",
    "archetype" => "mixed",
    "lodging_available" => "false",
    "prefecture" => "宮崎県",
    "municipality" => "都城市",
    "onsen_area" => "山田温泉",
    "official_url" => "https://miyakonojo-bonchi.com/yupoppo/",
    "map_or_review_url" => "https://www.google.com/maps/search/?api=1&query=%E3%81%8B%E3%81%8B%E3%81%97%E3%81%AE%E9%87%8C%20%E3%82%86%E3%81%BD%E3%81%A3%E3%81%BD",
    "visible_review_pool" => "not_locked",
    "korean_demand_signal" => "not_found",
    "product_strength" => "욕조 다양성과 노천탕을 갖춘 지역형 당일온천 복합시설",
    "likely_tier" => "Tier 2",
    "tier_reason" => "공식 운영사 근거가 있고 시설형 비교 가치가 있으나 관광 수요 검증이 남음",
    "cleanup_status" => "keep_facility",
    "verification_status" => "official_checked",
    "source_urls" => "https://miyakonojo-bonchi.com/yupoppo/;https://www.kanko-miyazaki.jp/feature/onsen",
    "notes" => "2026-07-10 added; direct_reviews_read=0"
  },
  {
    "candidate_slug" => "miyakonojo-aoidake-onsen",
    "candidate_track" => "spa_complex_super_sento",
    "japanese_name" => "青井岳温泉",
    "korean_name" => "아오이다케 온천",
    "aliases" => "Aoidake Onsen",
    "facility_type" => "large_day_use_complex",
    "facility_model" => "bathe",
    "archetype" => "mixed",
    "lodging_available" => "true",
    "prefecture" => "宮崎県",
    "municipality" => "都城市",
    "onsen_area" => "青井岳",
    "official_url" => "https://aoidake.com/",
    "map_or_review_url" => "https://www.google.com/maps/search/?api=1&query=%E9%9D%92%E4%BA%95%E5%B2%B3%E6%B8%A9%E6%B3%89",
    "visible_review_pool" => "not_locked",
    "korean_demand_signal" => "not_found",
    "product_strength" => "산악형 당일온천·사우나·휴식 상품을 결합한 복합 리조트",
    "likely_tier" => "Tier 2",
    "tier_reason" => "리뉴얼 후 운영 상태와 day-use 분모를 먼저 확인해야 함",
    "cleanup_status" => "keep_facility",
    "verification_status" => "official_checked",
    "source_urls" => "https://aoidake.com/;https://www.kanko-miyazaki.jp/spot/2384",
    "notes" => "2026-07-10 added; lodging/day-use scope and operation recheck required; direct_reviews_read=0"
  },
  {
    "candidate_slug" => "nishimera-yutato",
    "candidate_track" => "traditional_onsen_facility",
    "japanese_name" => "西米良温泉ゆた〜と",
    "korean_name" => "니시메라 유타토",
    "aliases" => "Nishimera Onsen Yutato; ゆたーと",
    "facility_type" => "public_bath_facility",
    "facility_model" => "bathe",
    "archetype" => "public bathing",
    "lodging_available" => "false",
    "prefecture" => "宮崎県",
    "municipality" => "西米良村",
    "onsen_area" => "西米良温泉",
    "official_url" => "https://nishimera.info/onsen",
    "map_or_review_url" => "https://www.google.com/maps/search/?api=1&query=%E8%A5%BF%E7%B1%B3%E8%89%AF%E6%B8%A9%E6%B3%89%E3%82%86%E3%81%9F%E3%80%9C%E3%81%A8",
    "visible_review_pool" => "not_locked",
    "korean_demand_signal" => "not_found",
    "product_strength" => "원거리 산촌형 온천과 지역 휴게·식음 경험",
    "likely_tier" => "Tier 3",
    "tier_reason" => "관광 맥락은 뚜렷하지만 접근성과 직접 리뷰 표면이 약함",
    "cleanup_status" => "keep_facility",
    "verification_status" => "official_checked",
    "source_urls" => "https://nishimera.info/onsen",
    "notes" => "2026-07-10 added; tourism authority page; direct_reviews_read=0"
  },
  {
    "candidate_slug" => "takaharu-oujibaru-onsen",
    "candidate_track" => "traditional_onsen_facility",
    "japanese_name" => "皇子原温泉健康村",
    "korean_name" => "오지바루 온천 건강촌",
    "aliases" => "Oujibaru Onsen Kenko Mura",
    "facility_type" => "public_bath_facility",
    "facility_model" => "bathe",
    "archetype" => "public bathing",
    "lodging_available" => "false",
    "prefecture" => "宮崎県",
    "municipality" => "高原町",
    "onsen_area" => "皇子原温泉",
    "official_url" => "https://oujibaruonsen.com/",
    "map_or_review_url" => "https://www.google.com/maps/search/?api=1&query=%E7%9A%87%E5%AD%90%E5%8E%9F%E6%B8%A9%E6%B3%89%E5%81%A5%E5%BA%B7%E6%9D%91",
    "visible_review_pool" => "not_locked",
    "korean_demand_signal" => "not_found",
    "product_strength" => "고원 당일온천과 식음·낚시를 결합한 지역형 휴식 시설",
    "likely_tier" => "Tier 2",
    "tier_reason" => "공식 운영 근거가 명확하나 한국어 수요와 리뷰풀 확인이 남음",
    "cleanup_status" => "keep_facility",
    "verification_status" => "official_checked",
    "source_urls" => "https://oujibaruonsen.com/",
    "notes" => "2026-07-10 added; direct_reviews_read=0"
  },
  {
    "candidate_slug" => "shintomi-sun-lupinus",
    "candidate_track" => "traditional_onsen_facility",
    "japanese_name" => "新富町温泉健康センター サン・ルピナス",
    "korean_name" => "신토미 선 루피너스",
    "aliases" => "Sun Lupinus; 新富温泉",
    "facility_type" => "public_bath_facility",
    "facility_model" => "bathe",
    "archetype" => "public bathing",
    "lodging_available" => "false",
    "prefecture" => "宮崎県",
    "municipality" => "新富町",
    "onsen_area" => "新富温泉",
    "official_url" => "https://sun-lupinus.com/",
    "map_or_review_url" => "https://www.google.com/maps/search/?api=1&query=%E6%96%B0%E5%AF%8C%E7%94%BA%E6%B8%A9%E6%B3%89%E5%81%A5%E5%BA%B7%E3%82%BB%E3%83%B3%E3%82%BF%E3%83%BC%20%E3%82%B5%E3%83%B3%E3%83%BB%E3%83%AB%E3%83%94%E3%83%8A%E3%82%B9",
    "visible_review_pool" => "not_locked",
    "korean_demand_signal" => "not_found",
    "product_strength" => "공식상 요오드 함유 원천 이용을 내세우는 지역 당일온천",
    "likely_tier" => "hold",
    "tier_reason" => "2026년 7월 말까지 임시휴업 공지가 있어 운영 확인이 선행돼야 함",
    "cleanup_status" => "exclude_or_hold",
    "verification_status" => "official_checked",
    "source_urls" => "https://sun-lupinus.com/;https://sun-lupinus.com/information/",
    "notes" => "2026-07-10 added; official notice says temporary closure through at least July 2026; direct_reviews_read=0"
  },
  {
    "candidate_slug" => "nichinan-hinata-no-yado-dayuse",
    "candidate_track" => "spa_complex_super_sento",
    "japanese_name" => "天然温泉 ひなたの宿 日南宮崎",
    "korean_name" => "히나타노야도 니치난 미야자키",
    "aliases" => "Hinata no Yado Nichinan Miyazaki",
    "facility_type" => "wellness_spa",
    "facility_model" => "bathe",
    "archetype" => "mixed",
    "lodging_available" => "true",
    "prefecture" => "宮崎県",
    "municipality" => "日南市",
    "onsen_area" => "日南温泉",
    "official_url" => "https://www.kanko-miyazaki.jp/feature/onsen",
    "map_or_review_url" => "https://www.google.com/maps/search/?api=1&query=%E5%A4%A9%E7%84%B6%E6%B8%A9%E6%B3%89%20%E3%81%B2%E3%81%AA%E3%81%9F%E3%81%AE%E5%AE%BF%20%E6%97%A5%E5%8D%97%E5%AE%AE%E5%B4%8E",
    "visible_review_pool" => "not_locked",
    "korean_demand_signal" => "not_found",
    "product_strength" => "숙박과 당일온천이 함께 제공되는 니치난권 복합 온천",
    "likely_tier" => "hold",
    "tier_reason" => "료칸·당일입욕 리뷰 scope 분리가 먼저 필요함",
    "cleanup_status" => "split_needed",
    "verification_status" => "official_checked",
    "source_urls" => "https://www.kanko-miyazaki.jp/feature/onsen",
    "notes" => "2026-07-10 added; day-use scope boundary required; direct_reviews_read=0"
  }
].freeze

def read_csv(path)
  CSV.read(path, headers: true, encoding: "bom|utf-8").map(&:to_h)
end

def write_csv(path, headers, rows)
  CSV.open(path, "w", write_headers: true, headers: headers, encoding: "utf-8") do |csv|
    rows.each { |row| csv << headers.map { |header| row[header] } }
  end
end

def p0?(row)
  P0_SLUGS.include?(row.fetch("candidate_slug"))
end

FileUtils.mkdir_p(OUTPUT)
FileUtils.mkdir_p(File.join(OUTPUT, "deepresearch", "kyushu_#{DATE}"))

base_rows = read_csv(File.join(SOURCE_DIR, "kyushu_traditional_facility_candidate_pool_2026-07-09.csv")) +
            read_csv(File.join(SOURCE_DIR, "kyushu_spa_complex_super_sento_candidate_pool_2026-07-09.csv"))
rows = base_rows + MIYAZAKI_CANDIDATES
raise "duplicate slug" unless rows.map { |row| row.fetch("candidate_slug") }.uniq.size == rows.size

candidate_headers = %w[
  candidate_slug candidate_track korean_name japanese_name aliases facility_type facility_model archetype
  lodging_available prefecture municipality onsen_area official_url map_or_review_url product_strength prior_tier
  korean_demand_signal visible_review_pool_state water_profile_mode official_water_profile_status scope_status
  operation_status cleanup_status verification_status promotion_disposition next_priority tier_reason source_urls
  direct_reviews_read notes
]

candidate_rows = rows.map do |row|
  tier = row.fetch("likely_tier")
  lodging = row.fetch("lodging_available")
  p0_disposition = if p0?(row)
                     "P0_candidate"
                   elsif tier == "Tier 1" && row.fetch("cleanup_status") == "keep_facility"
                     "P1_candidate"
                   elsif tier == "hold" || row.fetch("cleanup_status") == "exclude_or_hold"
                     "exclude_or_hold"
                   else
                     "P2_candidate"
                   end
  {
    "candidate_slug" => row.fetch("candidate_slug"),
    "candidate_track" => row.fetch("candidate_track"),
    "korean_name" => row.fetch("korean_name"),
    "japanese_name" => row.fetch("japanese_name"),
    "aliases" => row.fetch("aliases"),
    "facility_type" => row.fetch("facility_type"),
    "facility_model" => row.fetch("facility_model"),
    "archetype" => row.fetch("archetype"),
    "lodging_available" => lodging,
    "prefecture" => row.fetch("prefecture"),
    "municipality" => row.fetch("municipality"),
    "onsen_area" => row.fetch("onsen_area"),
    "official_url" => row.fetch("official_url"),
    "map_or_review_url" => row.fetch("map_or_review_url"),
    "product_strength" => row.fetch("product_strength"),
    "prior_tier" => tier,
    "korean_demand_signal" => row.fetch("korean_demand_signal"),
    "visible_review_pool_state" => row.fetch("visible_review_pool"),
    "water_profile_mode" => "facility_representative_profile",
    "official_water_profile_status" => p0?(row) ? "needs_official_water_profile_lock" : "not_spotchecked",
    "scope_status" => lodging == "true" ? "dayuse_boundary_needed" : "facility_scope_stable",
    "operation_status" => row.fetch("candidate_slug") == "shintomi-sun-lupinus" ? "operation_recheck_before_profile_lock" : "needs_current_operation_recheck",
    "cleanup_status" => row.fetch("cleanup_status"),
    "verification_status" => row.fetch("verification_status"),
    "promotion_disposition" => p0_disposition,
    "next_priority" => p0?(row) ? "P0" : (p0_disposition == "P1_candidate" ? "P1" : "P2"),
    "tier_reason" => row.fetch("tier_reason"),
    "source_urls" => row.fetch("source_urls"),
    "direct_reviews_read" => "0",
    "notes" => "Source candidate rows retained separately; #{row.fetch("notes")}"
  }
end
write_csv(File.join(OUTPUT, "kyushu_facility_candidate_queue_#{DATE}.csv"), candidate_headers, candidate_rows)

group_counts = candidate_rows.group_by { |row| row["candidate_track"] }.transform_values(&:size)
priority_counts = candidate_rows.group_by { |row| row["next_priority"] }.transform_values(&:size)
report = <<~MD
  # 규슈 온천시설 후보 큐 - #{DATE}

  ## 범위·소유권

  - `region_id`: `kyushu`
  - 포함: 福岡県, 佐賀県, 長崎県, 熊本県, 大分県, 宮崎県, 鹿児島県
  - 제외·다른 에이전트 소유: 沖縄県, 山口県, 愛媛県
  - 가고시마현 소속 도서는 범위에 포함한다. 숙박 온천 원장과 기존 지역 산출물은 수정하지 않는다.

  ## 후보 유니버스

  - 후보: #{candidate_rows.size}건
  - `traditional_onsen_facility`: #{group_counts.fetch("traditional_onsen_facility", 0)}건
  - `spa_complex_super_sento`: #{group_counts.fetch("spa_complex_super_sento", 0)}건
  - P0: #{priority_counts.fetch("P0", 0)}건, P1: #{priority_counts.fetch("P1", 0)}건, P2/hold: #{priority_counts.fetch("P2", 0)}건
  - 미야자키는 기존 후보풀 공백을 보완하기 위해 공식·지자체·관광 근거 7건을 추가했다. `신토미 선 루피너스`는 공식 임시휴업 공지 때문에 hold로 남겼다.

  ## P0 선정 원칙

  12개 P0는 단순 평점 순위가 아니라, 지역 대표성·명확한 이용 상품·공식 근거·지도 리뷰 표면·한국 사용자의 비교 가치를 함께 본 첫 실행 묶음이다. 구로카와 숙박 부속 당일입욕과 숙박 가능한 복합시설은 당일입욕 분모가 오염될 수 있어 P1/경계 보강으로 분리했다.

  ## 데이터 경계

  이 큐의 `direct_reviews_read`는 전 행 0이다. 기존 visible review 표면은 직접 읽은 리뷰 수가 아니며, 다음 단계의 Google/Nifty/Yahoo lock과 시설별 원장에서 별도로 다룬다.
MD
File.write(File.join(OUTPUT, "kyushu_facility_candidate_report_#{DATE}.md"), report)

water_headers = %w[
  candidate_slug japanese_name official_url water_profile_mode official_water_profile_status spring_quality_original
  official_water_text_original official_source_url official_source_checked_at water_scope water_method_badge_policy
  scope_status operation_status spotcheck_note
]
water_rows = candidate_rows.select { |row| row["next_priority"] == "P0" }.map do |row|
  observed = WATER_OBSERVATIONS[row["candidate_slug"]]
  {
    "candidate_slug" => row["candidate_slug"],
    "japanese_name" => row["japanese_name"],
    "official_url" => row["official_url"],
    "water_profile_mode" => "facility_representative_profile",
    "official_water_profile_status" => observed ? observed.fetch("status") : "needs_official_water_profile_lock",
    "spring_quality_original" => observed ? observed.fetch("spring_quality") : "",
    "official_water_text_original" => observed ? observed.fetch("text") : "",
    "official_source_url" => observed ? observed.fetch("source") : "",
    "official_source_checked_at" => observed ? Time.now.getlocal("+09:00").iso8601 : "",
    "water_scope" => observed ? observed.fetch("scope") : "facility_representative_profile",
    "water_method_badge_policy" => observed ? observed.fetch("badge") : "not_candidate_without_original_text_url_checked_at_and_scope",
    "scope_status" => row["scope_status"],
    "operation_status" => row["operation_status"],
    "spotcheck_note" => observed ? "Official text recorded. Do not extend this scope to other bath products without explicit source." : "Official water profile remains a reinforcement item. Do not infer direct-flow/circulation from 天然温泉 or 100% claims."
  }
end
write_csv(File.join(OUTPUT, "kyushu_facility_official_water_spotcheck_#{DATE}.csv"), water_headers, water_rows)

prior_locks = read_csv(File.join(SOURCE_DIR, "kyushu_facility_review_surface_lock_2026-07-09.csv")).to_h { |row| [row.fetch("candidate_slug"), row] }
lock_headers = %w[
  lock_order candidate_slug japanese_name official_address platform listing_title visible_rating visible_review_count listing_url
  identity_match listing_identity_status decision_scope_pool_status observed_at_kst collection_method direct_reviews_read scope_note
]
lock_rows = candidate_rows.select { |row| row["next_priority"] == "P0" }.flat_map.with_index(1) do |row, order|
  previous = prior_locks[row["candidate_slug"]] || {}
  [
    ["google_maps", "google_url", "google_rating", "google_visible_review_count", "google_status"],
    ["nifty_onsen", "nifty_url", "nifty_rating", "nifty_visible_review_count", "nifty_status"],
    ["yahoo_map", "yahoo_url", "yahoo_rating", "yahoo_visible_review_count", "yahoo_status"]
  ].map do |platform, url_key, rating_key, count_key, status_key|
    google = platform == "google_maps" ? GOOGLE_OBSERVATIONS[row["candidate_slug"]] : nil
    count = google ? google.fetch("count") : previous[count_key].to_s
    rating = google ? google.fetch("rating") : previous[rating_key].to_s
    status = google ? google.fetch("status") : previous[status_key].to_s
    {
      "lock_order" => order,
      "candidate_slug" => row["candidate_slug"],
      "japanese_name" => row["japanese_name"],
      "official_address" => google ? google.fetch("address") : "needs_official_address_lock",
      "platform" => platform,
      "listing_title" => google ? google.fetch("title") : "needs_listing_open",
      "visible_rating" => rating.empty? || rating == "not_locked" ? "" : rating,
      "visible_review_count" => count.match?(/\A\d+\z/) ? count : "",
      "listing_url" => previous[url_key].to_s.empty? ? row["map_or_review_url"] : previous[url_key],
      "identity_match" => google && status == "locked" ? "official_name_and_address_matched" : "pending",
      "listing_identity_status" => status.empty? ? "not_checked" : status,
      "decision_scope_pool_status" => row["scope_status"] == "facility_scope_stable" ? "pending_lock" : "not_locked_scope_mixed_lodging",
      "observed_at_kst" => google ? Time.now.getlocal("+09:00").iso8601 : "",
      "collection_method" => google ? "aside_repl_new_session" : "prior_surface_import_not_recounted",
      "direct_reviews_read" => "0",
      "scope_note" => "Visible pool only. This row never contributes to directly read review counts."
    }
  end
end
write_csv(File.join(OUTPUT, "kyushu_facility_review_pool_lock_#{DATE}.csv"), lock_headers, lock_rows)

known_nifty = lock_rows.count { |row| row["platform"] == "nifty_onsen" && !row["visible_review_count"].empty? }
locked_google = lock_rows.count { |row| row["platform"] == "google_maps" && row["listing_identity_status"] == "locked" }
partial_google = lock_rows.count { |row| row["platform"] == "google_maps" && row["listing_identity_status"] != "locked" }
lock_report = <<~MD
  # 규슈 P0 리뷰풀 잠금 - #{DATE}

  - 대상: P0 #{P0_SLUGS.size}건 × Google Maps/Nifty Onsen/Yahoo Map = #{lock_rows.size}개 listing lock 행
  - Google Maps: #{locked_google}건은 시설별 새 Aside 세션에서 listing 제목·주소·평점·visible count를 잠금했다. #{partial_google}건(砂楽, 波葉の湯)은 주소 또는 실제 listing 재확인이 남았다.
  - Nifty Onsen: #{known_nifty}건만 기존 표면에서 exact count가 확인되어, 실제 페이지 제목·주소 재대조가 남았다.
  - Yahoo Map: 12건 모두 정확 visible count 미잠금이다.
  - 직접 읽은 리뷰: 0건. visible review pool은 이후의 직접 리뷰 원장과 절대 합산하지 않는다.
  - Google/Naver는 동적 화면이므로 시설별 새 Aside 세션에서 재확인한다. title·공식명·주소가 일치하기 전에는 `locked`로 바꾸지 않는다.
MD
File.write(File.join(OUTPUT, "kyushu_facility_review_pool_lock_report_#{DATE}.md"), lock_report)

assignment_headers = %w[
  assignment_order candidate_slug assigned_model assigned_agent_id agent_nickname status output_directory scope_contract
  minimum_full_body_target required_platforms notes
]
assignment_rows = candidate_rows.select { |row| row["next_priority"] == "P0" }.each_with_index.map do |row, index|
  {
    "assignment_order" => index + 1,
    "candidate_slug" => row["candidate_slug"],
    "assigned_model" => "gpt-5.6-luna",
    "assigned_agent_id" => "pending",
    "agent_nickname" => "pending",
    "status" => "queued",
    "output_directory" => "deepresearch/kyushu_#{DATE}/#{row["candidate_slug"]}",
    "scope_contract" => "#{row["facility_model"]}; facility representative water profile; no accommodation room-bath model; direct review denominator excludes snippets/partial/context",
    "minimum_full_body_target" => "300",
    "required_platforms" => "Google Maps;Nifty Onsen;Yahoo Map;Naver direct bodies if available",
    "notes" => "Use a fresh Aside session for Google Maps and Naver. Do not alter shared candidate/master files."
  }
end
write_csv(File.join(OUTPUT, "kyushu_facility_deepresearch_assignment_manifest_#{DATE}.csv"), assignment_headers, assignment_rows)

runtime_headers = %w[
  candidate_slug assigned_model assigned_agent_id status output_directory started_at_kst completed_at_kst runtime_note
]
runtime_rows = assignment_rows.map do |row|
  {
    "candidate_slug" => row["candidate_slug"],
    "assigned_model" => row["assigned_model"],
    "assigned_agent_id" => "pending",
    "status" => "queued",
    "output_directory" => row["output_directory"],
    "started_at_kst" => "",
    "completed_at_kst" => "",
    "runtime_note" => "Awaiting independent facility research agent"
  }
end
write_csv(File.join(OUTPUT, "kyushu_facility_deepresearch_runtime_manifest_#{DATE}.csv"), runtime_headers, runtime_rows)

puts "Generated #{candidate_rows.size} candidates and #{assignment_rows.size} P0 assignments in #{OUTPUT}"
