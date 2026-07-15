#!/usr/bin/env ruby

require "csv"
require "fileutils"
require "uri"

DATE = "2026-07-10"
REGION = "kansai_sanin_setouchi"
ROOT = File.expand_path("../research/onsen-db-seed", __dir__)
RESEARCH_ROOT = File.join(ROOT, "deepresearch", "#{REGION}_#{DATE}")
PREFECTURES = %w[三重県 滋賀県 京都府 大阪府 兵庫県 奈良県 和歌山県 鳥取県 島根県 岡山県 広島県 山口県 徳島県 香川県 愛媛県 高知県].freeze
P0_SLUGS = %w[arima-kin-no-yu arima-taikounoyu kinosaki-goshono-yu dogo-honkan osaka-spa-world].freeze

BASE_FILES = %w[
  kansai_sanin_setouchi_traditional_facility_candidate_pool_2026-07-09.csv
  kansai_sanin_setouchi_spa_complex_super_sento_candidate_pool_2026-07-09.csv
].map { |name| File.join(ROOT, name) }.freeze

def map_url(name, address = nil)
  query = [name, address].compact.join(" ")
  "https://www.google.com/maps/search/?api=1&query=#{URI.encode_www_form_component(query)}"
end

def row(**values)
  values.transform_keys(&:to_s)
end

ADDITIONS = [
  row(candidate_slug: "mie-aquaignis-kataoka-onsen", candidate_track: "traditional_onsen_facility", korean_name: "아쿠아이그니스 가타오카온천", japanese_name: "アクアイグニス 片岡温泉", aliases: "AQUA IGNIS Kataoka Onsen", facility_type: "large_day_use_complex", facility_model: "bathe", archetype: "public_bathing", lodging_available: "true", prefecture: "三重県", municipality: "菰野町", onsen_area: "yunoyama", official_url: "https://aquaignis.jp/spa_kataoka.php", product_strength: "source_water_and_food_resort", prior_tier: "Tier 1", korean_demand_signal: "needs_naver_check", visible_review_pool_state: "review_surface_exists_count_not_locked", official_water_profile_status: "official_water_profile_locked", scope_status: "stable_facility_scope", operation_status: "needs_current_official_recheck", cleanup_status: "keep_facility", verification_status: "official_checked", promotion_disposition: "P1_candidate", next_priority: "P1", tier_reason: "공식이 가수·가온·순환 없이 샤워를 포함한 원천 사용을 명시한 복합 당일온천", source_urls: "https://aquaignis.jp/spa_kataoka.php", notes: "숙박·식음 복합이나 입욕 상품이 독립적이다."),
  row(candidate_slug: "mie-vison-honzoyu", candidate_track: "traditional_onsen_facility", korean_name: "비손 혼조유", japanese_name: "本草湯 VISON", aliases: "Honzoyu; VISON", facility_type: "wellness_spa", facility_model: "bathe", archetype: "experience_led", lodging_available: "true", prefecture: "三重県", municipality: "多気町", onsen_area: "vison", official_url: "https://vison.jp/facility/honzoyu/", product_strength: "herbal_bath_and_resort_stop", prior_tier: "Tier 2", korean_demand_signal: "needs_naver_check", visible_review_pool_state: "review_surface_exists_count_not_locked", official_water_profile_status: "needs_official_water_profile_lock", scope_status: "stable_facility_scope", operation_status: "needs_current_official_recheck", cleanup_status: "keep_facility", verification_status: "official_checked", promotion_disposition: "P2_candidate", next_priority: "P2", tier_reason: "대형 관광 리조트 안의 독립 입욕·약초 체험 상품", source_urls: "https://vison.jp/facility/honzoyu/", notes: "온천수와 약초욕의 범위를 대표 프로필로 혼합하지 않는다."),
  row(candidate_slug: "mie-mokumoku-no-yu", candidate_track: "traditional_onsen_facility", korean_name: "노텐 모쿠모쿠노유", japanese_name: "野天もくもくの湯", aliases: "Mokumoku no Yu", facility_type: "large_day_use_complex", facility_model: "bathe", archetype: "public_bathing", lodging_available: "false", prefecture: "三重県", municipality: "伊賀市", onsen_area: "iga", official_url: "https://www.moku-moku.com/", product_strength: "farm_stopover_dayuse", prior_tier: "Tier 2", korean_demand_signal: "needs_naver_check", visible_review_pool_state: "review_surface_exists_count_not_locked", official_water_profile_status: "needs_official_water_profile_lock", scope_status: "stable_facility_scope", operation_status: "needs_current_official_recheck", cleanup_status: "keep_facility", verification_status: "official_checked", promotion_disposition: "P2_candidate", next_priority: "P2", tier_reason: "농장 체험 동선과 결합한 독립 당일입욕 시설", source_urls: "https://www.moku-moku.com/", notes: "타월 별도 여부 등 운영 요소를 후기 축으로 분리한다."),
  row(candidate_slug: "mie-kua-house-nagashima", candidate_track: "traditional_onsen_facility", korean_name: "천연온천 쿠아하우스 나가시마", japanese_name: "天然温泉 クアハウス長島", aliases: "Kua House Nagashima", facility_type: "large_day_use_complex", facility_model: "bathe", archetype: "public_bathing", lodging_available: "false", prefecture: "三重県", municipality: "桑名市", onsen_area: "nagashima", official_url: "https://www.nagashima-onsen.co.jp/", product_strength: "nagashima_dayuse", prior_tier: "Tier 2", korean_demand_signal: "needs_naver_check", visible_review_pool_state: "review_surface_exists_count_not_locked", official_water_profile_status: "needs_official_water_profile_lock", scope_status: "stable_facility_scope", operation_status: "needs_current_official_recheck", cleanup_status: "keep_facility", verification_status: "official_checked", promotion_disposition: "P2_candidate", next_priority: "P2", tier_reason: "나가시마 관광 동선의 당일 온천 후보", source_urls: "https://www.kankomie.or.jp/spot/1316", notes: "공식 운영 URL의 세부 상품 범위는 재확인 필요."),
  row(candidate_slug: "shiga-agaryanse", candidate_track: "spa_complex_super_sento", korean_name: "스파 리조트 오고토 아가리얀세", japanese_name: "スパリゾート雄琴 あがりゃんせ", aliases: "Agaryanse", facility_type: "wellness_spa", facility_model: "bathe", archetype: "urban_spa_or_super_sento", lodging_available: "true", prefecture: "滋賀県", municipality: "大津市", onsen_area: "ogoto", official_url: "https://www.agaryanse.co.jp/", product_strength: "lake_biwa_spa_complex", prior_tier: "Tier 1", korean_demand_signal: "needs_naver_check", visible_review_pool_state: "review_surface_exists_count_not_locked", official_water_profile_status: "needs_official_water_profile_lock", scope_status: "stable_facility_scope", operation_status: "needs_current_official_recheck", cleanup_status: "keep_facility", verification_status: "official_checked", promotion_disposition: "P1_candidate", next_priority: "P1", tier_reason: "비와코권 대형 스파·사우나·족욕 복합 시설", source_urls: "https://www.agaryanse.co.jp/", notes: "인접 숙박시설 리뷰와 당일입욕 리뷰를 혼합하지 않는다."),
  row(candidate_slug: "shiga-kusatsu-yumoto-suisyun", candidate_track: "spa_complex_super_sento", korean_name: "구사쓰 유모토 스이슌", japanese_name: "草津湯元 水春", aliases: "Kusatsu Yumoto Suishun", facility_type: "wellness_spa", facility_model: "bathe", archetype: "urban_spa_or_super_sento", lodging_available: "false", prefecture: "滋賀県", municipality: "草津市", onsen_area: "kusatsu_shiga", official_url: "https://suisyun.jp/kusatsu/", product_strength: "mall_adjacent_spa", prior_tier: "Tier 2", korean_demand_signal: "needs_naver_check", visible_review_pool_state: "review_surface_exists_count_not_locked", official_water_profile_status: "needs_official_water_profile_lock", scope_status: "stable_facility_scope", operation_status: "needs_current_official_recheck", cleanup_status: "keep_facility", verification_status: "official_checked", promotion_disposition: "P2_candidate", next_priority: "P2", tier_reason: "교토·오사카 이동권의 대형 슈퍼센토 보완 후보", source_urls: "https://suisyun.jp/kusatsu/", notes: "몰·주차 동선과 입욕 상품을 분리해 본다."),
  row(candidate_slug: "nara-dorogawa-onsen-center", candidate_track: "traditional_onsen_facility", korean_name: "도로가와 온천센터", japanese_name: "洞川温泉センター", aliases: "Dorogawa Onsen Center", facility_type: "public_bath_facility", facility_model: "bathe", archetype: "public_bathing", lodging_available: "false", prefecture: "奈良県", municipality: "天川村", onsen_area: "dorogawa", official_url: "https://www.vill.tenkawa.nara.jp/office/publicfacility/2687", product_strength: "mountain_public_bath", prior_tier: "Tier 2", korean_demand_signal: "needs_naver_check", visible_review_pool_state: "review_surface_exists_count_not_locked", official_water_profile_status: "needs_official_water_profile_lock", scope_status: "stable_facility_scope", operation_status: "needs_current_official_recheck", cleanup_status: "keep_facility", verification_status: "official_checked", promotion_disposition: "P1_candidate", next_priority: "P1", tier_reason: "산악 온천지의 독립 공공 당일입욕 시설", source_urls: "https://www.vill.tenkawa.nara.jp/office/publicfacility/2687", notes: "남녀 내탕·노천 구성은 공식 확인, 기상·계절 접근은 운영 재확인."),
  row(candidate_slug: "nara-kenko-land", candidate_track: "spa_complex_super_sento", korean_name: "나라 건강랜드", japanese_name: "奈良健康ランド", aliases: "Nara Kenko Land", facility_type: "wellness_spa", facility_model: "bathe", archetype: "urban_spa_or_super_sento", lodging_available: "true", prefecture: "奈良県", municipality: "天理市", onsen_area: "nara", official_url: "https://www.narakenkoland.net/", product_strength: "24hour_spa_and_rest", prior_tier: "Tier 1", korean_demand_signal: "needs_naver_check", visible_review_pool_state: "review_surface_exists_count_not_locked", official_water_profile_status: "official_water_profile_partial_locked", scope_status: "stable_facility_scope", operation_status: "needs_current_official_recheck", cleanup_status: "keep_facility", verification_status: "official_checked", promotion_disposition: "P1_candidate", next_priority: "P1", tier_reason: "24시간형 대형 온천·휴식 복합상품", source_urls: "https://www.narakenkoland.net/facility/spa", notes: "인접 호텔과 건강랜드의 리뷰풀·이용 scope를 분리한다."),
  row(candidate_slug: "hiroshima-yunoyama-onsenkan", candidate_track: "traditional_onsen_facility", korean_name: "히로시마 유노야마 온천관", japanese_name: "湯の山温泉館", aliases: "Yunoyama Onsenkan", facility_type: "public_bath_facility", facility_model: "bathe", archetype: "public_bathing", lodging_available: "false", prefecture: "広島県", municipality: "広島市", onsen_area: "yuki_yunoyama", official_url: "https://www.yuki-lodge.jp/yunoyamaonsenkan.html", product_strength: "mountain_public_bath", prior_tier: "Tier 2", korean_demand_signal: "needs_naver_check", visible_review_pool_state: "review_surface_exists_count_not_locked", official_water_profile_status: "needs_official_water_profile_lock", scope_status: "stable_facility_scope", operation_status: "operation_recheck", cleanup_status: "keep_facility", verification_status: "official_checked", promotion_disposition: "P1_candidate", next_priority: "P1", tier_reason: "재개 공지가 있는 히로시마 근교 공공 당일온천", source_urls: "https://www.city.hiroshima.lg.jp/shisei/kouhou/1004010/1033044/1033046/1035818.html", notes: "2025년 설비 수리 후 재개 이력으로 현재 운영을 먼저 재확인한다."),
  row(candidate_slug: "hiroshima-yuki-lodge-dayuse", candidate_track: "traditional_onsen_facility", korean_name: "유키 로지 당일온천", japanese_name: "広島市国民宿舎 湯来ロッジ", aliases: "Yuki Lodge", facility_type: "large_day_use_complex", facility_model: "bathe", archetype: "public_bathing", lodging_available: "true", prefecture: "広島県", municipality: "広島市", onsen_area: "yuki", official_url: "https://www.yuki-lodge.jp/", product_strength: "dayuse_lodge_spa", prior_tier: "Tier 2", korean_demand_signal: "needs_naver_check", visible_review_pool_state: "review_surface_exists_count_not_locked", official_water_profile_status: "dayuse_boundary_needed", scope_status: "dayuse_boundary_needed", operation_status: "needs_current_official_recheck", cleanup_status: "keep_facility", verification_status: "official_checked", promotion_disposition: "P0_boundary_first", next_priority: "P1", tier_reason: "당일입욕은 있으나 숙박·식사 리뷰와 분모가 섞일 위험", source_urls: "https://www.yuki-lodge.jp/", notes: "숙박자 목욕 후기는 시설 당일입욕 신호에 합산하지 않는다."),
  row(candidate_slug: "tokushima-aratae-tamiya", candidate_track: "spa_complex_super_sento", korean_name: "도쿠시마 천연온천 아라타에노유 다미야점", japanese_name: "徳島天然温泉 あらたえの湯 田宮店", aliases: "Aratae no Yu Tamiya", facility_type: "wellness_spa", facility_model: "bathe", archetype: "urban_spa_or_super_sento", lodging_available: "false", prefecture: "徳島県", municipality: "徳島市", onsen_area: "tokushima", official_url: "https://aratae.jp/lp/", product_strength: "urban_natural_onsen_spa", prior_tier: "Tier 1", korean_demand_signal: "needs_naver_check", visible_review_pool_state: "review_surface_exists_count_not_locked", official_water_profile_status: "official_water_profile_partial_locked", scope_status: "stable_facility_scope", operation_status: "needs_current_official_recheck", cleanup_status: "keep_facility", verification_status: "official_checked", promotion_disposition: "P1_candidate", next_priority: "P1", tier_reason: "도쿠시마 도심권 천연온천·사우나 복합 시설", source_urls: "https://aratae.jp/lp/", notes: "공식 온천수 설명과 점포별 프로필을 재확인한다."),
  row(candidate_slug: "tokushima-aratae-naruto", candidate_track: "spa_complex_super_sento", korean_name: "나루토 천연온천 아라타에노유", japanese_name: "鳴門天然温泉 あらたえの湯", aliases: "Aratae no Yu Naruto", facility_type: "wellness_spa", facility_model: "bathe", archetype: "urban_spa_or_super_sento", lodging_available: "false", prefecture: "徳島県", municipality: "鳴門市", onsen_area: "naruto", official_url: "https://aratae.jp/lp/", product_strength: "naruto_natural_onsen_spa", prior_tier: "Tier 1", korean_demand_signal: "needs_naver_check", visible_review_pool_state: "review_surface_exists_count_not_locked", official_water_profile_status: "official_water_profile_partial_locked", scope_status: "stable_facility_scope", operation_status: "needs_current_official_recheck", cleanup_status: "keep_facility", verification_status: "official_checked", promotion_disposition: "P1_candidate", next_priority: "P1", tier_reason: "나루토 관광 동선의 독립 당일 천연온천", source_urls: "https://www.awanavi.jp/archives/spot/2075", notes: "다미야점과 다른 주소·원천이므로 중복 병합하지 않는다."),
  row(candidate_slug: "kagawa-kirara-onsen", candidate_track: "traditional_onsen_facility", korean_name: "천연온천 키라라", japanese_name: "天然温泉きらら", aliases: "Kirara Onsen", facility_type: "public_bath_facility", facility_model: "bathe", archetype: "public_bathing", lodging_available: "true", prefecture: "香川県", municipality: "高松市", onsen_area: "takamatsu", official_url: "https://www.kiraraonsen.com/index.html", product_strength: "pilgrimage_route_dayuse", prior_tier: "Tier 2", korean_demand_signal: "needs_naver_check", visible_review_pool_state: "review_surface_exists_count_not_locked", official_water_profile_status: "needs_official_water_profile_lock", scope_status: "stable_facility_scope", operation_status: "needs_current_official_recheck", cleanup_status: "keep_facility", verification_status: "official_checked", promotion_disposition: "P1_candidate", next_priority: "P1", tier_reason: "다카마쓰·시코쿠 순례 동선의 독립 당일입욕 후보", source_urls: "https://www.kiraraonsen.com/index.html", notes: "숙박 기능의 상세 범위와 별도 요금을 재확인한다."),
  row(candidate_slug: "kagawa-yurari-no-yu", candidate_track: "traditional_onsen_facility", korean_name: "유라리노유", japanese_name: "由良里の湯 三十六温泉", aliases: "Yurari no Yu", facility_type: "public_bath_facility", facility_model: "bathe", archetype: "public_bathing", lodging_available: "false", prefecture: "香川県", municipality: "高松市", onsen_area: "takamatsu", official_url: "https://yurarinoyu.jp/", product_strength: "local_natural_onsen", prior_tier: "Tier 2", korean_demand_signal: "needs_naver_check", visible_review_pool_state: "review_surface_exists_count_not_locked", official_water_profile_status: "needs_official_water_profile_lock", scope_status: "stable_facility_scope", operation_status: "needs_current_official_recheck", cleanup_status: "keep_facility", verification_status: "official_checked", promotion_disposition: "P2_candidate", next_priority: "P2", tier_reason: "다카마쓰권의 지역형 천연온천 당일입욕", source_urls: "https://yurarinoyu.jp/", notes: "시설별 원천·욕조 범위 확인이 필요하다."),
  row(candidate_slug: "kagawa-shionoe-onsen", candidate_track: "traditional_onsen_facility", korean_name: "시오노에 온천", japanese_name: "塩江温泉", aliases: "Shionoe Onsen", facility_type: "area_cluster", facility_model: "route_or_pass", archetype: "area_cluster", lodging_available: "unclear", prefecture: "香川県", municipality: "高松市", onsen_area: "shionoe", official_url: "https://www.my-kagawa.jp/", product_strength: "onsen_area_lead", prior_tier: "hold", korean_demand_signal: "needs_naver_check", visible_review_pool_state: "review_surface_exists_count_not_locked", official_water_profile_status: "needs_official_water_profile_lock", scope_status: "split_needed", operation_status: "needs_current_official_recheck", cleanup_status: "area_cluster", verification_status: "needs_crosscheck", promotion_disposition: "P0_boundary_first", next_priority: "P2", tier_reason: "온천지 리드로는 유효하지만 단일 방문·결제 시설이 아니다", source_urls: "https://www.my-kagawa.jp/", notes: "개별 공공탕 또는 당일입욕 시설을 child row로 분리해야 한다."),
  row(candidate_slug: "kochi-ryoma-no-yu", candidate_track: "traditional_onsen_facility", korean_name: "고치 흑조온천 료마노유", japanese_name: "高知黒潮温泉 龍馬の湯", aliases: "Ryoma no Yu", facility_type: "large_day_use_complex", facility_model: "bathe", archetype: "public_bathing", lodging_available: "true", prefecture: "高知県", municipality: "香南市", onsen_area: "kochi_kuroshio", official_url: "https://ryusei-family.com/spa/", product_strength: "coastal_dayuse_onsen", prior_tier: "Tier 2", korean_demand_signal: "needs_naver_check", visible_review_pool_state: "review_surface_exists_count_not_locked", official_water_profile_status: "official_water_profile_partial_locked", scope_status: "dayuse_boundary_needed", operation_status: "needs_current_official_recheck", cleanup_status: "keep_facility", verification_status: "official_checked", promotion_disposition: "P0_boundary_first", next_priority: "P1", tier_reason: "호텔 부속 온천이지만 비숙박 당일입욕 상품이 명시된다", source_urls: "https://ryusei-family.com/spa/", notes: "호텔 객실·식사 후기는 day-use 직접 리뷰 분모에서 분리한다."),
  row(candidate_slug: "kochi-pokapoka-onsen", candidate_track: "spa_complex_super_sento", korean_name: "고치 포카포카온천", japanese_name: "高知ぽかぽか温泉", aliases: "Kochi Pokapoka Onsen", facility_type: "wellness_spa", facility_model: "bathe", archetype: "urban_spa_or_super_sento", lodging_available: "false", prefecture: "高知県", municipality: "高知市", onsen_area: "kochi", official_url: "https://kochi-tabi.jp/search_spot_infocenter.html?id=7645", product_strength: "late_hour_urban_spa", prior_tier: "Tier 2", korean_demand_signal: "needs_naver_check", visible_review_pool_state: "review_surface_exists_count_not_locked", official_water_profile_status: "needs_official_water_profile_lock", scope_status: "stable_facility_scope", operation_status: "needs_current_official_recheck", cleanup_status: "keep_facility", verification_status: "official_checked", promotion_disposition: "P2_candidate", next_priority: "P2", tier_reason: "관광협회가 장시간 영업·다양한 욕탕·사우나를 확인한 고치 도심 당일입욕", source_urls: "https://kochi-tabi.jp/search_spot_infocenter.html?id=7645", notes: "천연온천 여부와 공급 범위는 공식 운영사에서 추가 확인한다."),
].freeze

FIELDS = CSV.read(File.expand_path("../.agents/skills/bathtime-onsen-facility-review-signal-researcher/assets/regional-pipeline/candidate_queue_template.csv", __dir__), headers: true).headers.freeze

def base_to_queue(source)
  slug = source.fetch("candidate_slug")
  p0 = P0_SLUGS.include?(slug)
  cleanup = source.fetch("cleanup_status")
  tier = source.fetch("likely_tier")
  priority = p0 ? "P0" : (tier == "Tier 1" ? "P1" : "P2")
  disposition = if p0
                  "P0_candidate"
                elsif %w[split_needed route_or_pass area_cluster footbath_only exclude_or_hold].include?(cleanup)
                  "P0_boundary_first"
                elsif tier == "Tier 1"
                  "P1_candidate"
                else
                  "P2_candidate"
                end
  operation = %w[kinosaki-kouno-yu kinosaki-satono-yu].include?(slug) ? "operation_recheck" : "needs_current_official_recheck"
  row(
    candidate_slug: slug,
    candidate_track: source.fetch("candidate_track"),
    korean_name: source.fetch("korean_name"),
    japanese_name: source.fetch("japanese_name"),
    aliases: source.fetch("aliases"),
    facility_type: source.fetch("facility_type"),
    facility_model: source.fetch("facility_model"),
    archetype: source.fetch("archetype"),
    lodging_available: source.fetch("lodging_available"),
    prefecture: source.fetch("prefecture"),
    municipality: source.fetch("municipality"),
    onsen_area: source.fetch("onsen_area"),
    official_url: source.fetch("official_url"),
    map_or_review_url: source.fetch("map_or_review_url"),
    product_strength: source.fetch("product_strength"),
    prior_tier: tier,
    korean_demand_signal: source.fetch("korean_demand_signal"),
    visible_review_pool_state: source.fetch("visible_review_pool").start_with?("Google", "Nifty", "Jalan") ? "review_surface_partially_locked" : "review_surface_exists_count_not_locked",
    water_profile_mode: "facility_representative_profile",
    official_water_profile_status: p0 ? "see_official_water_spotcheck" : "needs_official_water_profile_lock",
    scope_status: cleanup == "keep_facility" ? "stable_facility_scope" : cleanup,
    operation_status: operation,
    cleanup_status: cleanup,
    verification_status: source.fetch("verification_status"),
    promotion_disposition: disposition,
    next_priority: priority,
    tier_reason: source.fetch("tier_reason"),
    source_urls: source.fetch("source_urls"),
    direct_reviews_read: "0",
    notes: source.fetch("notes")
  )
end

def addition_to_queue(source)
  source.merge(
    "map_or_review_url" => map_url(source.fetch("japanese_name"), source.fetch("prefecture")),
    "water_profile_mode" => "facility_representative_profile",
    "direct_reviews_read" => "0"
  )
end

source_rows = BASE_FILES.flat_map { |path| CSV.read(path, headers: true).map(&:to_h) }
queue = source_rows.select { |entry| PREFECTURES.include?(entry["prefecture"]) }.map { |entry| base_to_queue(entry) }
queue.concat(ADDITIONS.map { |entry| addition_to_queue(entry) })
queue.uniq! { |entry| entry.fetch("candidate_slug") }
queue.sort_by! { |entry| [entry.fetch("next_priority").sub("P", "").to_i, entry.fetch("prefecture"), entry.fetch("candidate_slug")] }

FileUtils.mkdir_p(ROOT)
candidate_path = File.join(ROOT, "#{REGION}_facility_candidate_queue_#{DATE}.csv")
CSV.open(candidate_path, "w") do |csv|
  csv << FIELDS
  queue.each { |entry| csv << FIELDS.map { |field| entry[field].to_s } }
end

counts_by_prefecture = queue.group_by { |entry| entry.fetch("prefecture") }.transform_values(&:size)
counts_by_track = queue.group_by { |entry| entry.fetch("candidate_track") }.transform_values(&:size)
candidate_report = <<~MD
  # 간사이·산인·세토우치 온천시설 후보 큐 — #{DATE}

  ## 범위·소유권

  - `region_id`: `#{REGION}`
  - 포함: #{PREFECTURES.join(", ")}
  - 제외: 후쿠이현·기후현·아이치현·시즈오카현·규슈 전역. 이 지역 후보는 이번 큐에 추가·수정·승격하지 않았다.
  - 기존 후보 파일은 읽기 전용 입력으로 사용했으며, 이 파일은 새 지역 파이프라인용 정규화 큐다.

  ## 후보 유니버스

  - 총 #{queue.size}건: 전통 온천시설 #{counts_by_track.fetch("traditional_onsen_facility", 0)}건, 도시형 스파·슈퍼센토 #{counts_by_track.fetch("spa_complex_super_sento", 0)}건.
  - 기존 74건을 재사용하고, 기존 풀에 없던 미에·시가·나라·히로시마·도쿠시마·가가와·고치권의 공식·관광 근거 후보 #{ADDITIONS.size}건을 추가했다.
  - 후보 단계의 `direct_reviews_read`는 전 행 `0`이다. 플랫폼상 리뷰풀·검색 표면·한국어 검색 흔적은 직접 리뷰 근거가 아니다.

  ## 현별 분포

  | 현 | 후보 수 |
  |---|---:|
  #{counts_by_prefecture.sort.map { |prefecture, count| "| #{prefecture} | #{count} |" }.join("\n")}

  ## P0 선정 원칙

  `arima-kin-no-yu`, `arima-taikounoyu`, `kinosaki-goshono-yu`, `dogo-honkan`, `osaka-spa-world`를 P0 후보로 지정했다. 지역 대표성·제품 차이·리뷰 표면·한국 수요의 관찰 가능성을 기준으로 선정했으며, 직접 리뷰 근거가 아니라 우선순위 판정이다.

  - `route_or_pass`, `area_cluster`, `footbath_only`, 숙박 혼합 당일입욕은 단일 시설 딥리서치로 바로 승격하지 않았다.
  - Tier 1이라도 공식 URL 또는 지도·리뷰 URL이 부족하면 `hold` 또는 `needs_crosscheck`로 남겼다.
  - 운영·폐관·리뉴얼 이력은 별도 operation 큐에서 최신 확인한다.
MD
File.write(File.join(ROOT, "#{REGION}_facility_candidate_report_#{DATE}.md"), candidate_report)

water_fields = %w[candidate_slug japanese_name water_profile_mode official_water_profile_status spring_quality_original official_water_text_original official_source_url official_source_checked_at water_scope water_method_badge_policy scope_status operation_status notes]
water_rows = [
  ["arima-kin-no-yu", "有馬本温泉 金の湯", "facility_representative_profile", "official_water_profile_partial_locked", "含鉄ナトリウム塩化物強塩高温泉", "泉質…含鉄ナトリウム塩化物強塩高温泉", "https://arimaspa-kingin.jp/kingin-2507.pdf", "#{DATE}T13:05:17+0900", "금의탕 공중탕; 인접 무료 족탕 제외", "no_method_badge_missing_official_method_scope_contract", "stable_facility_scope", "needs_current_official_recheck", "공식 원문에 방식 운용이 확인되지 않아 가케나가시·순환 배지를 만들지 않는다."],
  ["arima-taikounoyu", "有馬温泉 太閤の湯", "facility_representative_profile_with_area_exception", "official_water_profile_locked", "金泉・銀泉; 炭酸泉（人工）", "『太閤の岩風呂』…貴重な金泉を源泉かけ流しでたっぷりお楽しみください。", "https://www.taikounoyu.com/onsen/", "#{DATE}T13:05:17+0900", "시설 대표 프로필은 금천·은천·인공 탄산천 혼재; 원천가케나가시 문구는 태합 암탕에만 적용", "area_only_method_candidate_not_facility_badge", "official_bath_operation_split_seen", "needs_current_official_recheck", "욕조별 공식 운용이 갈려 시설 전체 방식 배지로 확장하지 않는다."],
  ["kinosaki-goshono-yu", "城崎温泉 御所の湯", "facility_representative_profile", "official_water_profile_locked", "ナトリウム・カルシウム-塩化物・高温泉", "外湯に共通する効能・泉質・温度…泉質 ナトリウム・カルシウム-塩化物・高温泉", "https://kinosaki-spa.gr.jp/about/spa/", "#{DATE}T13:05:17+0900", "성내 7외탕 공통 수질; 고쇼노유 독립 욕조 운용은 미확인", "no_method_badge_missing_official_method_scope_contract", "stable_facility_scope", "needs_current_official_recheck", "공식 공통 수질은 잠금. 후기의 순환 언급으로 배지를 만들지 않는다."],
  ["dogo-honkan", "道後温泉本館", "facility_representative_profile", "official_water_profile_partial_locked", "アルカリ性単純泉", "18本の源泉…加温や加水もしていないため…無加温・無加水の『源泉かけ流し』を実現", "https://dogo.jp/about", "#{DATE}T13:05:17+0900", "도고 온천 공중탕·호텔에 공급되는 공동 원천 설명; 본관 개별 욕조 운용 분리는 미확인", "area_scope_claim_not_facility_method_badge", "stable_facility_scope", "needs_current_official_recheck", "본관 대표 수질로는 사용하되 지역 단위 문구를 욕조별 방식 배지로 확장하지 않는다."],
  ["osaka-spa-world", "スパワールド 世界の大温泉", "facility_representative_profile", "official_water_profile_locked", "単純温泉（低張性・中性・温泉）", "源泉名 天王寺『世界の温泉』; 泉温39.4℃; 泉質 単純温泉（低張性・中性・温泉）", "https://www.spaworld.co.jp/about/bunseki.html", "#{DATE}T13:05:17+0900", "시설 대표 원천 분석; 테마욕·사우나·풀 각 욕조의 수원 운용은 별도", "no_method_badge_missing_official_method_scope_contract", "stable_facility_scope", "needs_current_official_recheck", "천연온천 분석과 테마욕 상품을 한 가지 방식 배지로 합치지 않는다."],
]
water_path = File.join(ROOT, "#{REGION}_facility_official_water_spotcheck_#{DATE}.csv")
CSV.open(water_path, "w") { |csv| csv << water_fields; water_rows.each { |entry| csv << entry } }

locks = {
  "arima-kin-no-yu" => { name: "有馬本温泉 金の湯", address: "兵庫県神戸市北区有馬町833", google: ["아리마 온천 금탕", "4.0", 4609, map_url("有馬本温泉 金の湯", "兵庫県神戸市北区有馬町833")], nifty: ["有馬本温泉 金の湯", "3.3", 67, "https://onsen.nifty.com/arimaonsen-onsen/onsen005630/kuchikomi/"], yahoo: ["有馬温泉 金の湯", "4.22", 346, "https://map.yahoo.co.jp/v3/place/7xWiMwMoOi6/review"] },
  "arima-taikounoyu" => { name: "有馬温泉 太閤の湯", address: "兵庫県神戸市北区有馬町池の尻292-2", google: ["다이코노유", "3.7", 2771, map_url("有馬温泉 太閤の湯", "兵庫県神戸市北区有馬町池の尻292-2")], nifty: ["有馬温泉 太閤の湯", "4.5", 915, "https://onsen.nifty.com/arimaonsen-onsen/onsen003229/kuchikomi/"], yahoo: ["有馬温泉 太閤の湯", "3.84", 182, "https://map.yahoo.co.jp/v3/place/9nkMtX2q0vk/review"] },
  "kinosaki-goshono-yu" => { name: "城崎温泉 御所の湯", address: "兵庫県豊岡市城崎町湯島448-1", google: ["기노사키 고쇼노유", "4.3", 3011, map_url("城崎温泉 御所の湯", "兵庫県豊岡市城崎町湯島448-1")], nifty: ["御所の湯", "3.3", 30, "https://onsen.nifty.com/kinosaki-onsen/onsen003240/kuchikomi/"], yahoo: ["城崎温泉 御所の湯", "4.28", 186, "https://map.yahoo.co.jp/v3/place/tGs-Nm0YjhI/review"] },
  "dogo-honkan" => { name: "道後温泉本館", address: "愛媛県松山市道後湯之町5-6", google: ["도고온천 본관", "4.2", 16237, map_url("道後温泉本館", "愛媛県松山市道後湯之町5-6")], nifty: ["道後温泉本館", "3.9", 120, "https://onsen.nifty.com/dougoonsen-onsen/onsen003952/kuchikomi/"], yahoo: ["道後温泉本館", "4.21", 1354, "https://map.yahoo.co.jp/v3/place/6oXzW2jN0uw/review"] },
  "osaka-spa-world" => { name: "スパワールド 世界の大温泉", address: "大阪府大阪市浪速区恵美須東3-4-24", google: ["스파월드", "4.0", 7681, map_url("スパワールド 世界の大温泉", "大阪府大阪市浪速区恵美須東3-4-24")], nifty: ["Nifty Onsen matching listing not found", "not_found", 0, "https://onsen.nifty.com/"], yahoo: ["スパワールド世界の大温泉", "not_locked", 1209, "https://map.yahoo.co.jp/v3/place/VseYCkjWZLc/review"] },
}

lock_fields = CSV.read(File.expand_path("../.agents/skills/bathtime-onsen-facility-review-signal-researcher/assets/regional-pipeline/review_pool_lock_template.csv", __dir__), headers: true).headers
lock_path = File.join(ROOT, "#{REGION}_facility_review_pool_lock_#{DATE}.csv")
CSV.open(lock_path, "w") do |csv|
  csv << lock_fields
  order = 1
  locks.each do |slug, detail|
    %i[google nifty yahoo].each do |platform|
      title, rating, count, url = detail.fetch(platform)
      status = if slug == "osaka-spa-world" && platform == :nifty
                 "not_found"
               else
                 "locked"
               end
      csv << [order, slug, detail.fetch(:name), detail.fetch(:address), platform == :google ? "google_maps" : "#{platform}_onsen", title, rating, count, url, "matched_name_and_address", status, "locked", "#{DATE}T13:05:17+0900", platform == :google ? "aside_browser_listing_snapshot" : "direct_listing_page", 0, "visible review pool only; direct reviews read remains 0"]
      order += 1
    end
  end
end

lock_report = <<~MD
  # 간사이·산인·세토우치 P0 리뷰풀 잠금 — #{DATE}

  ## 잠금 범위

  P0 후보 5곳에 대해 Google Maps, Nifty Onsen, Yahoo! Map listing 제목·주소·리뷰 표면을 대조했다. Google 동적 표면은 Aside Browser로 읽었고, Nifty·Yahoo는 실제 listing 페이지의 제목·주소를 확인했다.

  - 총 잠금 표면: 15행. 이 중 스파월드는 Nifty에 같은 시설·주소 listing을 확인하지 못해 `not_found`로 남겼다. `0`은 리뷰가 없다는 뜻이 아니라 Nifty 잠금 실패다.
  - `visible_review_count`는 플랫폼이 보이는 전체 리뷰 수다. 이 단계의 `direct_reviews_read`는 모든 행 `0`이며, 어떤 리뷰 본문도 등급·신호에 사용하지 않았다.
  - Yahoo listing에는 외부 공급자 카드가 섞일 수 있다. 이후 딥리서치 원장에서는 Yahoo Map 본문과 공급자 본문을 같은 플랫폼으로 합산하지 않는다.

  ## 다음 단계

  P0 시설별 별도 작업자가 이 잠금값을 출발점으로 사용한다. 새 Aside 세션에서 Google Maps와 Naver를 다시 확인하고, 플랫폼 리뷰 본문이 완전히 보이는 경우에만 개별 원장 행과 `full_body_direct_reviews`를 늘린다.
MD
File.write(File.join(ROOT, "#{REGION}_facility_review_pool_lock_report_#{DATE}.md"), lock_report)

assignment_fields = CSV.read(File.expand_path("../.agents/skills/bathtime-onsen-facility-review-signal-researcher/assets/regional-pipeline/deepresearch_assignment_manifest_template.csv", __dir__), headers: true).headers
assignment_path = File.join(ROOT, "#{REGION}_facility_deepresearch_assignment_manifest_#{DATE}.csv")
CSV.open(assignment_path, "w") do |csv|
  csv << assignment_fields
  P0_SLUGS.each_with_index do |slug, index|
    detail = locks.fetch(slug)
    scope = slug == "osaka-spa-world" ? "day-use spa facility; hotel lodging, pool and paid add-ons must be separate scopes" : "single day-use facility; do not mix lodging, route/pass, footbath or provider-card reviews"
    csv << [index + 1, slug, "gpt-5.6-luna", "", "", "queued", "deepresearch/#{REGION}_#{DATE}/#{slug}", scope, 300, "Google Maps; Nifty Onsen; Yahoo Map; Naver", "locked pool: Google #{detail[:google][2]}, Nifty #{detail[:nifty][2]}, Yahoo #{detail[:yahoo][2]}; visible counts are not direct reviews"]
  end
end

runtime_path = File.join(ROOT, "#{REGION}_facility_deepresearch_runtime_manifest_#{DATE}.csv")
CSV.open(runtime_path, "w") do |csv|
  csv << %w[candidate_slug assigned_model assigned_agent_id status output_directory started_at_kst completed_at_kst artifact_set_status notes]
  P0_SLUGS.each { |slug| csv << [slug, "gpt-5.6-luna", "", "queued", "deepresearch/#{REGION}_#{DATE}/#{slug}", "", "", "not_started", "shared master files are read-only to subagents"] }
end

puts candidate_path
puts water_path
puts lock_path
puts assignment_path
puts runtime_path
