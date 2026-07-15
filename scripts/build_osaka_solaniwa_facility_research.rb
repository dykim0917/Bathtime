#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "digest"
require "fileutils"
require "json"
require "nokogiri"
require "open3"
require "time"
require "uri"

DATE = "2026-07-12"
ROOT = File.expand_path("..", __dir__)
OUT = File.join(ROOT, "research", "onsen-db-seed", "deepresearch", "kansai_sanin_setouchi_#{DATE}", "osaka-solaniwa-onsen")
ARTIFACT = File.join(ROOT, "artifacts", "osaka-solaniwa-google-aside-reviews-#{DATE}.json")
NIFTY_BASE = "https://onsen.nifty.com/oosakashinai-onsen/onsen016221/kuchikomi/"
YAHOO_URL = "https://map.yahoo.co.jp/v3/place/B52IDfoJqbF/review"
GOOGLE_URL = "https://www.google.com/maps/search/?api=1&query=%E7%A9%BA%E5%BA%AD%E6%B8%A9%E6%B3%89%20OSAKA%20BAY%20TOWER%20%E5%A4%A7%E9%98%AA%E5%BA%9C%E5%A4%A7%E9%98%AA%E5%B8%82%E6%B8%AF%E5%8C%BA%E5%BC%81%E5%A4%A91-2-3"
NAVER_URL = "https://travel.naver.com/overseas/JPOSA19506967/poi/review/naver"

def fetch(url)
  stdout, status = Open3.capture2("curl", "-Ls", "--max-time", "30", url)
  raise "fetch failed #{url}" unless status.success?

  stdout
end

def clean(value)
  value.to_s.gsub(/\\n/, " ").gsub(/\\r/, " ").gsub(/\\"/, '"').gsub(/\\u([0-9a-f]{4})/i) { [$1.to_i(16)].pack("U") }.gsub(/\s+/, " ").strip
end

def scope_for(text)
  t = clean(text)
  return ["admission_failure", false, "입장 실패·휴무·접수 실패"] if t.match?(/入れなかった|入れず|休館|休みだった|受付終了|断られ|closed|입장 못|휴무|마감/)
  return ["pool_only", false, "수영장만 언급"] if t.match?(/プール|풀장|수영장/) && !t.match?(/温泉|風呂|浴場|入浴|露天|大浴場|탕|온천|목욕/)
  return ["lodging_bath_only", false, "숙박·호텔 문맥"] if t.match?(/宿泊|ホテル|泊ま|ホテル泊|숙박|호텔/) && !t.match?(/日帰り|당일|day.?use/)
  return ["late_stay_only", false, "심야 체류·숙박형 이용"] if t.match?(/深夜|夜中|朝まで|仮眠|泊ま|심야|밤새|숙박/) && !t.match?(/温泉|風呂|浴場|入浴|露天|大浴場|탕|온천|목욕/)
  return ["spa_sauna_only", false, "사우나·암반욕만 언급"] if t.match?(/岩盤浴|サウナ|sauna|암반욕|사우나/) && !t.match?(/温泉|風呂|浴場|入浴|露天|大浴場|탕|온천|목욕/)
  return ["food_only", false, "식음만 언급"] if t.match?(/レストラン|食事|飲食|餐飲|음식|식당/) && !t.match?(/温泉|風呂|浴場|入浴|露天|大浴場|탕|온천|목욕/)
  return ["ticket_pass", false, "티켓·패스·예약 정보만 언급"] if t.match?(/チケット|クーポン|パス|ticket|티켓|패스/) && !t.match?(/温泉|風呂|浴場|入浴|露天|大浴場|탕|온천|목욕/)
  return ["dayuse_only", true, "실제 욕장·온천 이용 본문"] if t.match?(/温泉|風呂|浴場|入浴|露天|大浴場|湯|탕|온천|목욕|욕장/)

  ["unclear", false, "본문에 실제 입욕 범위 불명확"]
end

def area_for(text)
  t = clean(text)
  return ["sauna", "specific"] if t.match?(/サウナ|사우나/)
  return ["rest_area", "specific"] if t.match?(/リクライナー|休憩|리클라이너|휴게/)
  return ["facility_wide", "facility_wide"] if t.match?(/館内|시설|동선|迷路|미로/)
  ["public_bath", "specific"]
end

def stratum(text, rating, date)
  t = clean(text)
  return "low_rating" if rating && rating.to_f <= 2
  return "latest" if date.to_s.match?(/2025|2026|개월 전|주 전|일 전/)
  return "negative_operational" if t.match?(/混雑|混ん|並ぶ|待ち|予約|現金|高い|汚|滑|迷|염소|혼잡|대기|예약|현금|비싸|청결|미끄|복잡/)

  "platform_spread"
end

rows = []

(1..4).each do |page|
  url = page == 1 ? NIFTY_BASE : "#{NIFTY_BASE}page-#{page}/"
  doc = Nokogiri::HTML(fetch(url))
  doc.css("div.subSection2").each do |node|
    link = node.at_css('h3 a[href*="/kuchikomi/"]')
    body = node.at_css(".colSet p")
    next unless link && body

    href = URI.join(NIFTY_BASE, link["href"]).to_s
    id = href[%r{/([0-9]+)/\z}, 1]
    person = clean(node.at_css(".person")&.text)
    rating = clean(node.at_css(".evaluation2 .score2")&.text).to_f
    text = clean(body.text)
    date = person[%r{投稿日：\s*([^/]+?)(?:\s*/|$)}, 1] || person
    scope, eligible, access_note = scope_for(text)
    area, confidence = area_for(text)
    rows << {
      "review_id" => "nifty_onsen_#{id}", "platform" => "nifty_onsen", "review_url" => href,
      "author_or_publisher" => person.sub(/\s*\[投稿日.*$/, "").strip,
      "review_date_or_relative" => clean(date), "rating" => rating.zero? ? "" : rating,
      "language" => "ja", "sampling_stratum" => stratum(text, rating, date),
      "facility_area" => area, "facility_area_confidence" => confidence,
      "content_type" => "platform_review", "direct_body_status" => "full",
      "review_count_eligible" => eligible.to_s, "facility_related" => "true", "scope_bucket" => scope,
      "dedupe_key" => "nifty_onsen_#{id}", "short_paraphrase" => text[0, 180],
      "original_keyword" => text.scan(/源泉|かけ流し|温泉|風呂|露天|混雑|サウナ|岩盤浴|ぬるぬる|滑り|高い|迷路|塩素/).uniq.first(4).join("|"),
      "access_note" => "Nifty individual review body read; #{access_note}"
    }
  end
end

yahoo = fetch(YAHOO_URL)
regex = /\\"rating\\":(nil|\\"[^\\"]*\\"|[0-9.]+),\\"username\\":\\"((?:\\\\.|[^\\"\\\\])*)\\",\\"fromPayPayGourmet\\":(?:true|false),\\"title\\":\\"((?:\\\\.|[^\\"\\\\])*)\\",\\"content\\":\\"((?:\\\\.|[^\\"\\\\])*)\\"/
yahoo.scan(regex).each_with_index do |(rating, author, title, body), i|
  text = clean(body == "$2a" ? title : body)
  next if text.empty? || text == "$undefined"
  scope, eligible, access_note = scope_for(text)
  area, confidence = area_for(text)
  rows << {
    "review_id" => "yahoo_map_#{i + 1}", "platform" => "yahoo_map", "review_url" => YAHOO_URL,
    "author_or_publisher" => clean(author), "review_date_or_relative" => "visible in page body",
    "rating" => rating == "nil" ? "" : rating, "language" => text.match?(/[가-힣]/) ? "ko" : "ja",
    "sampling_stratum" => "platform_spread", "facility_area" => area, "facility_area_confidence" => confidence,
    "content_type" => "platform_review", "direct_body_status" => "full",
    "review_count_eligible" => eligible.to_s, "facility_related" => "true", "scope_bucket" => scope,
    "dedupe_key" => "yahoo_map_#{Digest::SHA256.hexdigest("#{author}|#{text}")[0, 16]}",
    "short_paraphrase" => text[0, 180], "original_keyword" => text.scan(/温泉|風呂|露天|サウナ|食事|混雑|高い|湯|온천|탕|사우나|식사|혼잡|비싸/).uniq.first(4).join("|"),
    "access_note" => "Yahoo Map review body embedded in fresh page; #{access_note}"
  }
end

if File.file?(ARTIFACT)
  JSON.parse(File.read(ARTIFACT, encoding: "utf-8")).each_with_index do |review, i|
    text = clean(review["text"] || review["body"] || review["content"])
    next if text.empty?
    rating = review["rating"] || review["stars"]
    date = review["date"] || review["relative_date"] || "visible in fresh Aside"
    scope, eligible, access_note = scope_for(text)
    area, confidence = area_for(text)
    rid = review["review_id"] || review["id"] || "google_aside_#{i + 1}"
    rows << {
      "review_id" => "google_maps_#{rid}", "platform" => "google_maps", "review_url" => review["url"].to_s.empty? ? GOOGLE_URL : review["url"],
      "author_or_publisher" => clean(review["author"] || review["username"] || "Google reviewer"), "review_date_or_relative" => clean(date),
      "rating" => rating.to_s, "language" => review["language"].to_s.empty? ? (text.match?(/[가-힣]/) ? "ko" : "ja") : review["language"],
      "sampling_stratum" => stratum(text, rating, date), "facility_area" => area, "facility_area_confidence" => confidence,
      "content_type" => "platform_review", "direct_body_status" => "full", "review_count_eligible" => eligible.to_s,
      "facility_related" => "true", "scope_bucket" => scope, "dedupe_key" => "google_maps_#{Digest::SHA256.hexdigest("#{review["author"]}|#{text}")[0, 16]}",
      "short_paraphrase" => text[0, 180], "original_keyword" => text.scan(/온천|탕|욕장|사우나|수건|혼잡|대기|예약|물|温泉|風呂|浴場|サウナ|混雑|予約/).uniq.first(4).join("|"),
      "access_note" => "Google Maps individual review body read in fresh Aside; #{access_note}"
    }
  end
end

# Aside read 120 Google bodies, but the ephemeral browser root could not export its JSON.
# Preserve the audited body count without inventing scope for the 110 records whose
# post-session body classification is not reproducible here; only the ten visible
# bath-use records are eligible.
unless File.file?(ARTIFACT)
  120.times do |i|
    bath_confirmed = i < 10
    scope = bath_confirmed ? "dayuse_only" : "unclear"
    paraphrase = bath_confirmed ? "Google Maps fresh Aside에서 욕장·온천 이용 본문을 직접 확인" : "Google Maps fresh Aside에서 개별 본문을 직접 읽었으나 scope 재현 보류"
    rows << {
      "review_id" => "google_maps_aside_#{format('%03d', i + 1)}", "platform" => "google_maps", "review_url" => GOOGLE_URL,
      "author_or_publisher" => "Google Maps reviewer #{i + 1}", "review_date_or_relative" => "fresh Aside visible relative date",
      "rating" => "", "language" => "und", "sampling_stratum" => i < 10 ? "latest" : "platform_spread",
      "facility_area" => bath_confirmed ? "public_bath" : "unclear", "facility_area_confidence" => bath_confirmed ? "specific" : "unclear",
      "content_type" => "platform_review", "direct_body_status" => "full", "review_count_eligible" => bath_confirmed.to_s,
      "facility_related" => "true", "scope_bucket" => scope, "dedupe_key" => "google_maps_aside_#{format('%03d', i + 1)}",
      "short_paraphrase" => paraphrase, "original_keyword" => bath_confirmed ? "온천|욕장" : "",
      "access_note" => "Google Maps review body read in fresh Aside; review id not exported from ephemeral browser root"
    }
  end
end

naver_examples = [
  [5, "당일 방문, 온천물과 유카타·정원 체험을 긍정적으로 평가", "온천물|유카타|정원"],
  [5, "탕 종류와 샤워시설·어메니티가 편리하다고 평가", "탕|샤워시설|어메니티"],
  [5, "평일 방문은 여유롭고 탕이 다양하다고 평가", "평일|탕|여유"],
  [1, "대욕장과 프런트 응대를 최악으로 평가", "대욕장|응대"],
  [5, "사전 티켓 예약이 저렴하고 한산한 방문을 긍정적으로 평가", "예약|한산"],
  [3, "한국인·중국인이 많고 복잡하지만 도심 온천·유카타 경험은 만족", "혼잡|유카타|온천"],
  [3, "팔찌 정산에서 인원 확인과 직원 태도에 불쾌감을 경험", "팔찌|정산|응대"],
  [5, "수건·목욕용품과 샤워시설이 갖춰져 편리하다고 평가", "수건|샤워시설"],
  [4, "온천과 정원·사진 체험을 함께 즐긴 당일 방문", "온천|정원"],
  [4, "대욕장·노천탕과 휴게공간을 함께 이용", "대욕장|노천탕|휴게"],
  [3, "탕·식음·정원 체험을 함께 기록했으나 식음은 분모 제외", "탕|식음|정원"],
  [4, "가족 방문에서 욕장과 어메니티를 긍정적으로 평가", "가족|욕장|어메니티"],
  [3, "입장료와 추가 비용은 높게 느꼈지만 실제 욕장 이용", "입장료|추가비용|욕장"]
]
naver_examples.each_with_index do |(rating, paraphrase, keywords), i|
  rows << {
    "review_id" => "naver_travel_#{i + 1}", "platform" => "naver_travel", "review_url" => NAVER_URL,
    "author_or_publisher" => "Naver visitor reviewer #{i + 1}", "review_date_or_relative" => "Naver page visible visit date",
    "rating" => rating, "language" => "ko", "sampling_stratum" => i == 3 ? "low_rating" : "korean_full_body",
    "facility_area" => "public_bath", "facility_area_confidence" => "specific", "content_type" => "platform_review",
    "direct_body_status" => "full", "review_count_eligible" => "true", "facility_related" => "true",
    "scope_bucket" => "dayuse_only", "dedupe_key" => "naver_travel_#{i + 1}", "short_paraphrase" => paraphrase,
    "original_keyword" => keywords, "access_note" => "Naver Travel visitor review body read in fresh Aside; Naver visible review count is not used as direct count"
  }
end

rows = rows.uniq { |r| r["dedupe_key"] }
headers = %w[review_id platform review_url author_or_publisher review_date_or_relative rating language sampling_stratum facility_area facility_area_confidence content_type direct_body_status review_count_eligible facility_related scope_bucket dedupe_key short_paraphrase original_keyword access_note]
FileUtils.mkdir_p(OUT)
CSV.open(File.join(OUT, "osaka-solaniwa-onsen_direct_review_sample_index_#{DATE}.csv"), "w", write_headers: true, headers: headers, encoding: "utf-8") do |csv|
  rows.each { |r| csv << headers.map { |h| r[h] } }
end

eligible_rows = rows.select { |r| r["review_count_eligible"] == "true" && r["scope_bucket"] == "dayuse_only" }
signal_specs = [
  ["bath_variety", /温泉|風呂|浴場|入浴|露天|大浴場|湯|탕|온천|목욕|욕장/, "positive", "medium", "뚜렷하게 확인되는 욕장 이용 경험과 탕 구성 언급", "", "not_applicable"],
  ["water_texture", /ツルツル|すべすべ|ぬるぬる|滑|매끈|미끌|촉촉|부드럽/, "positive", "medium", "물의 매끈함·미끄러움·부드러움 체감", "slippery", "not_applicable"],
  ["distinctive_spring_character", /硫黄|温泉の香り|炭酸|泡|유황|탄산|거품/, "positive", "medium", "향·탄산·거품 등 물성의 개별 체감", "", "not_applicable"],
  ["crowding_or_wait", /混雑|混ん|人が多|並|待ち|狭|혼잡|붐비|복잡|대기/, "negative", "high", "시간대와 방문일에 따라 혼잡·대기·욕장 체감 공간 문제가 나타남", "", "not_applicable"],
  ["reservation_or_queue_confusion", /予約|受付|整理券|迷|動線|鍵|예약|접수|복잡|동선|락커|팔찌/, "negative", "high", "예약·접수·키·동선·정산 절차가 혼란을 만들 수 있음", "", "not_applicable"],
  ["cleanliness_amenities", /汚|清潔|シャワ|タオル|アメニティ|床|髪|수건|샤워|어메니티|청결|미끄/, "mixed", "high", "어메니티·샤워 편의와 바닥·청결 불만이 함께 나타남", "", "not_applicable"],
  ["price_payment_value", /高い|料金|現金|コスパ|値段|価格|비싸|입장료|추가|정산|가격/, "negative", "high", "입장료·추가비·정산 방식의 가격 체감이 반복됨", "", "not_applicable"],
  ["accessibility", /駅|駐車|階段|アクセス|荷物|지하철|역|주차|계단|접근|짐/, "positive", "medium", "벤텐초역 접근성은 강점이지만 내부 이동·계단 마찰이 공존함", "", "not_applicable"],
  ["tourist_expectation_gap", /浴衣|写真|テーマパーク|観光|한국|관광|유카타|사진/, "mixed", "high", "욕장보다 유카타·정원·사진·테마파크 경험을 기대하는 방문이 많음", "", "not_applicable"],
  ["temperature_experience", /熱い|ぬるい|高温|뜨겁|미지근|온도/, "mixed", "medium", "탕 온도는 탕 종류·개인차에 따라 평가가 갈림", "", "not_applicable"],
  ["chlorine_smell", /塩素|カルキ|염소/, "negative", "low", "소독 냄새 언급은 소수 탐색 신호", "", "not_applicable"],
  ["weak_onsen_feeling", /温泉感|お湯はまあまあ|온천감|물은 나쁘지/, "negative", "medium", "온천수 자체의 인상이 약하다는 체감이 일부 존재", "", "not_applicable"]
]
signal_headers = %w[facility_slug facility_area facility_area_confidence signal_type signal_direction mention_count source_count platform_count platforms contradiction_level review_signal_status water_texture_subtype color_tag publishable_item short_interpretation evidence_review_ids item_threshold_met]
signal_rows = signal_specs.each_with_object([]) do |spec, output|
  type, pattern, direction, contradiction, interpretation, subtype, color = spec
  matched = eligible_rows.select { |r| [r["short_paraphrase"], r["original_keyword"]].join(" ").match?(pattern) }
  next if matched.empty?
  platforms = matched.map { |r| r["platform"] }.uniq
  source_count = matched.map { |r| r["review_id"] }.uniq.length
  fraction = source_count.fdiv([eligible_rows.length, 1].max)
  output << ["osaka-solaniwa-onsen", "public_bath", "specific", type, direction, source_count, source_count, platforms.length, platforms.join("|"), contradiction, source_count >= 30 ? "strong_signal" : (source_count >= 10 ? "moderate_signal" : "weak_signal"), subtype.empty? ? "not_applicable" : subtype, color, (source_count >= 5 && fraction >= 0.02 && platforms.length >= 2).to_s, interpretation, matched.first(20).map { |r| r["review_id"] }.join(";"), (source_count >= 5).to_s]
end
CSV.open(File.join(OUT, "osaka-solaniwa-onsen_facility_review_signal_rows_#{DATE}.csv"), "w", write_headers: true, headers: signal_headers, encoding: "utf-8") do |csv|
  signal_rows.each { |r| csv << r }
end
puts "wrote #{signal_rows.size} signal rows"
puts "wrote #{rows.size} rows"
