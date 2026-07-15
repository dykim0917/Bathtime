import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const dataset = process.argv.find((argument) => argument.startsWith('--dataset='))?.split('=')[1] ?? 'kyushu-kansai';
if (!['kyushu-kansai', 'kanto-additional', 'hakone-kanagawa-yamanashi', 'tohoku', 'izu-shizuoka', 'chubu-hokuriku-koshin', 'hokkaido', 'kansai-sanin-setouchi'].includes(dataset)) throw new Error(`Unsupported dataset: ${dataset}`);
const isKantoAdditional = dataset === 'kanto-additional';
const isHakoneKanagawaYamanashi = dataset === 'hakone-kanagawa-yamanashi';
const isTohoku = dataset === 'tohoku';
const isIzuShizuoka = dataset === 'izu-shizuoka';
const isChubuHokurikuKoshin = dataset === 'chubu-hokuriku-koshin';
const isHokkaido = dataset === 'hokkaido';
const isKansaiSaninSetouchi = dataset === 'kansai-sanin-setouchi';
const seedDate = isHokkaido || isKansaiSaninSetouchi ? '2026-07-12' : isKantoAdditional || isHakoneKanagawaYamanashi || isTohoku || isIzuShizuoka || isChubuHokurikuKoshin ? '2026-07-11' : '2026-07-10';
const outputKey = isKansaiSaninSetouchi ? 'kansai_sanin_setouchi_facility' : isHokkaido ? 'hokkaido_facility' : isChubuHokurikuKoshin ? 'chubu_hokuriku_koshin_facility' : isIzuShizuoka ? 'izu_shizuoka_facility' : isTohoku ? 'tohoku_facility' : isHakoneKanagawaYamanashi ? 'hakone_kanagawa_yamanashi_facility' : isKantoAdditional ? 'kanto_tokyo_facility_additional' : 'kyushu_kansai_facility';
const reportTitle = isKansaiSaninSetouchi ? '간사이·산인·세토우치 온천시설' : isHokkaido ? '홋카이도 온천시설' : isChubuHokurikuKoshin ? '주부·호쿠리쿠·고신 온천시설' : isIzuShizuoka ? '이즈·시즈오카 온천시설' : isTohoku ? '도호쿠 온천시설' : isHakoneKanagawaYamanashi ? '하코네·가나가와·야마나시 온천시설' : isKantoAdditional ? '간토·수도권 추가 온천시설' : '규슈·간사이권 온천시설';
const collectionKey = `${outputKey}_normalized_${seedDate}`;
const expectedFacilityCount = isKansaiSaninSetouchi ? 63 : isHokkaido ? 15 : isChubuHokurikuKoshin ? 22 : isIzuShizuoka ? 15 : isTohoku ? 26 : isHakoneKanagawaYamanashi ? 6 : isKantoAdditional ? 6 : 17;
const expectedActiveFacilityCount = isIzuShizuoka ? 11 : isTohoku ? 20 : expectedFacilityCount;
const shouldApply = process.argv.includes('--apply');
const outputDir = path.join(repoRoot, 'research', 'onsen-db-seed');
const outputBase = path.join(outputDir, `${outputKey}_db_seed_${seedDate}`);
const paths = {
  json: `${outputBase}.json`,
  csv: `${outputBase}.csv`,
  report: `${outputBase}.md`,
  sql: `${outputBase}.upsert.sql`,
  loadReport: `${outputBase}_load_report.md`,
};

const regionConfigs = isKansaiSaninSetouchi
  ? [{
      key: 'kansai_sanin_setouchi_2026_07_12',
      candidateQueue: path.join(outputDir, 'kansai_sanin_setouchi_facility_pipeline_2026-07-12', 'kansai_sanin_setouchi_facility_master_queue_2026-07-12.csv'),
      qa: path.join(outputDir, 'kansai_sanin_setouchi_facility_pipeline_2026-07-12', 'kansai_sanin_setouchi_facility_deepresearch_qa_2026-07-12.csv'),
      researchRoot: outputDir,
    }]
  : isHokkaido
  ? [{
      key: 'hokkaido',
      candidateQueue: path.join(outputDir, 'hokkaido-facility-pipeline-2026-07-11', 'hokkaido_facility_candidate_queue_2026-07-11.csv'),
      qa: path.join(outputDir, 'hokkaido-facility-pipeline-2026-07-11', 'hokkaido_facility_deepresearch_qa_2026-07-11_final.csv'),
      researchRoot: outputDir,
    }]
  : isChubuHokurikuKoshin
  ? [{
      key: 'chubu_hokuriku_koshin',
      candidateQueue: path.join(outputDir, 'chubu-hokuriku-koshin-facility-pipeline-2026-07-11', 'chubu_hokuriku_koshin_facility_candidate_queue_2026-07-11.csv'),
      qa: path.join(outputDir, 'chubu-hokuriku-koshin-facility-pipeline-2026-07-11', 'chubu_hokuriku_koshin_facility_additional_deepresearch_qa_2026-07-11.csv'),
      researchRoot: path.join(outputDir, 'chubu-hokuriku-koshin-facility-pipeline-2026-07-11'),
    }]
  : isIzuShizuoka
  ? [{
      key: 'izu_shizuoka',
      candidateQueue: path.join(outputDir, 'izu-shizuoka-facility-pipeline-2026-07-11', 'izu_shizuoka_facility_candidate_queue_2026-07-11.csv'),
      qa: path.join(outputDir, 'izu-shizuoka-facility-pipeline-2026-07-11', 'izu_shizuoka_facility_deepresearch_qa_2026-07-11.csv'),
      researchRoot: outputDir,
    }]
  : isTohoku
  ? [{
      key: 'tohoku',
      candidateQueue: path.join(repoRoot, 'research', 'onsen-candidates', 'nationwide-2026-07-03', 'tohoku_facility_candidate_shortlist_2026-07-03.csv'),
      qa: path.join(outputDir, 'tohoku_facility_deepresearch_qa_2026-07-11.csv'),
      researchRoot: outputDir,
    }]
  : isHakoneKanagawaYamanashi
  ? [{
      key: 'hakone_kanagawa_yamanashi',
      candidateQueue: path.join(outputDir, 'hakone_kanagawa_yamanashi-facility-pipeline-2026-07-11', 'hakone_kanagawa_yamanashi_facility_normalized_candidate_queue_2026-07-11.csv'),
      qa: path.join(outputDir, 'hakone_kanagawa_yamanashi-facility-pipeline-2026-07-11', 'hakone_kanagawa_yamanashi_facility_deepresearch_qa_2026-07-11.csv'),
      researchRoot: outputDir,
    }]
  : isKantoAdditional
  ? [{
      key: 'kanto_tokyo_additional',
      candidateQueue: path.join(outputDir, 'kanto_tokyo_facility_additional_collection_queue_2026-07-10.csv'),
      qa: path.join(outputDir, 'kanto_tokyo_facility_additional_deepresearch_qa_2026-07-11.csv'),
      researchRoot: outputDir,
    }]
  : [
      {
        key: 'kyushu',
        candidateQueue: path.join(outputDir, 'kyushu-facility-pipeline-2026-07-10', 'kyushu_facility_candidate_queue_2026-07-10.csv'),
        qa: path.join(outputDir, 'kyushu-facility-pipeline-2026-07-10', 'kyushu_facility_deepresearch_qa_2026-07-10.csv'),
        researchRoot: path.join(outputDir, 'kyushu-facility-pipeline-2026-07-10'),
      },
      {
        key: 'kansai_sanin_setouchi',
        candidateQueue: path.join(outputDir, 'kansai_sanin_setouchi_facility_candidate_queue_2026-07-10.csv'),
        qa: path.join(outputDir, 'kansai_sanin_setouchi_facility_deepresearch_qa_2026-07-10.csv'),
        researchRoot: outputDir,
      },
    ];

const allowedAreas = new Set([
  'public_bath', 'open_air_public_bath', 'family_bath', 'private_bath', 'sand_bath', 'steam_bath',
  'footbath', 'drinking_spring', 'inhalation', 'sauna', 'stone_sauna', 'rest_area', 'food_area',
  'food_steam', 'overnight_rest', 'route_or_pass', 'area_cluster', 'facility_wide', 'unclear',
]);
const allowedSignals = new Set([
  'water_texture', 'distinctive_spring_character', 'chlorine_smell', 'weak_onsen_feeling',
  'temperature_experience', 'weather_season', 'historic_bath_context', 'bath_variety',
  'sand_or_steam_experience', 'family_private_bath_experience', 'crowding_or_wait',
  'reservation_or_queue_confusion', 'cleanliness_amenities', 'price_payment_value', 'accessibility',
  'tourist_expectation_gap', 'local_user_culture', 'eligibility_or_use_scope', 'operation_volatility',
]);
const heldSignalTypes = new Set(['sauna_experience', 'rest_area_experience', 'food_experience']);
const signalLabels = {
  water_texture: '물의 감촉', distinctive_spring_character: '온천감', chlorine_smell: '소독 냄새',
  weak_onsen_feeling: '온천감 아쉬움', temperature_experience: '탕 온도', weather_season: '계절 영향',
  historic_bath_context: '역사적 목욕 공간', bath_variety: '탕 구성', sand_or_steam_experience: '특화 목욕 경험',
  family_private_bath_experience: '가족탕·대절탕', crowding_or_wait: '혼잡·대기',
  reservation_or_queue_confusion: '예약·입장 방식', cleanliness_amenities: '청결·비품',
  price_payment_value: '요금·결제', accessibility: '접근성', tourist_expectation_gap: '방문 기대 차이',
  local_user_culture: '현지 이용 분위기', eligibility_or_use_scope: '이용 대상·범위', operation_volatility: '운영 변동',
};
const rawSignalLabels = {
  distinctive_scenery_view: '욕장에서 보이는 경관', scenic_context: '주변 경관', riverside_view: '강변 경관', scenic_river_view: '강변 경관',
  historic_bath_atmosphere: '역사적 목욕 분위기', historic_bath_space: '역사적 목욕 공간', sulfur_smell: '유황감',
  water_appearance: '물빛', color_experience: '물빛', heat_variation: '온도 차이', footbath_temperature: '족탕 온도',
  scenic_bath_experience: '욕장 경관', sea_view_and_openness: '바다 전망과 개방감', view_or_seaside_experience: '바다 전망',
  bath_size_or_capacity: '욕장 규모', historic_atmosphere: '역사적 공간', privacy_or_visibility: '프라이버시와 시야',
};
const signalTypeAliases = {
  access_visibility: 'accessibility',
  access_value: 'accessibility',
  amenity_friction: 'cleanliness_amenities',
  bath_layout: 'bath_variety',
  bath_scope_or_layout: 'bath_variety',
  chlorine_sensation: 'chlorine_smell',
  cleanliness_maintenance: 'cleanliness_amenities',
  cleanliness_safety: 'cleanliness_amenities',
  color_experience: 'distinctive_spring_character',
  color: 'distinctive_spring_character',
  crowding: 'crowding_or_wait',
  crowding_wait: 'crowding_or_wait',
  distinctive_scenery_view: 'bath_variety',
  facility_access: 'accessibility',
  facility_ambience: 'historic_bath_context',
  facility_cleanliness: 'cleanliness_amenities',
  facility_condition: 'historic_bath_context',
  facility_design: 'bath_variety',
  free_access: 'price_payment_value',
  jjimjilban_sauna_strength: 'sand_or_steam_experience',
  long_stay_value: 'price_payment_value',
  mixed_bath_barrier: 'eligibility_or_use_scope',
  footbath_accessory: 'bath_variety',
  footbath_temperature: 'temperature_experience',
  heat_variation: 'temperature_experience',
  history: 'historic_bath_context',
  historic_bath_atmosphere: 'historic_bath_context',
  historic_bath_space: 'historic_bath_context',
  mixed_bath_expectation: 'tourist_expectation_gap',
  mixed_bath_experience: 'eligibility_or_use_scope',
  open_air_comfort: 'bath_variety',
  open_air_bath: 'bath_variety',
  operation_access: 'eligibility_or_use_scope',
  operation_or_service_friction: 'operation_volatility',
  parking_access: 'accessibility',
  privacy_exposure: 'tourist_expectation_gap',
  reservation_or_reception: 'reservation_or_queue_confusion',
  price_payment: 'price_payment_value',
  riverbank_open_air_experience: 'bath_variety',
  rest_area_and_locker: 'cleanliness_amenities',
  riverside_view: 'bath_variety',
  route_access: 'accessibility',
  scenic_context: 'bath_variety',
  scenic_river_view: 'bath_variety',
  sauna_cooling: 'bath_variety',
  shower_amenities: 'cleanliness_amenities',
  sulfur_smell: 'distinctive_spring_character',
  shared_family_couple_use: 'local_user_culture',
  ticket_payment_flow: 'reservation_or_queue_confusion',
  temperature_accessibility: 'temperature_experience',
  water_appearance: 'distinctive_spring_character',
  water_clarity: 'distinctive_spring_character',
  water_color: 'distinctive_spring_character',
  water_temperature: 'temperature_experience',
  bath_size_or_capacity: 'bath_variety',
  bath_temperature: 'temperature_experience',
  early_morning_or_late_hour_use: 'accessibility',
  facility_size: 'bath_variety',
  facility_variety: 'bath_variety',
  historic_atmosphere: 'historic_bath_context',
  museum_bath_expectation_gap: 'tourist_expectation_gap',
  pool_or_seasonal_context: 'eligibility_or_use_scope',
  privacy_or_visibility: 'tourist_expectation_gap',
  open_air_experience: 'bath_variety',
  scenic_bath_experience: 'bath_variety',
  sea_view_and_openness: 'bath_variety',
  view_or_seaside_experience: 'bath_variety',
  visitor_manners: 'local_user_culture',
  weather_and_wave_dependency: 'weather_season',
  weather_experience: 'weather_season',
};
const heldRawSignalTypes = new Set([
  ...heldSignalTypes, 'rest_area', 'service_response', 'rest_area_experience',
  'sauna_or_stone_sauna_experience', 'stone_sauna_experience', 'staff_service',
  'snow_country_exhibit', 'facility_keyword', 'service_experience', 'service_staff',
  'food_context', 'food_rest_experience', 'food_rest_strength', 'sauna_or_relaxation',
]);
const facilityAreaAliases = {
  access: 'facility_wide',
  accessibility: 'facility_wide',
  bath_area: 'public_bath',
  bath_amenities: 'facility_wide',
  bedrock_bath: 'stone_sauna',
  dayuse_flow: 'facility_wide',
  eligibility_or_use_scope: 'facility_wide',
  family_private_bath: 'family_bath',
  food_rest: 'food_area',
  jjimjilban_sauna: 'stone_sauna',
  main_riverbank_mixed_open_air_bath: 'open_air_public_bath',
  open_air_bath: 'open_air_public_bath',
  parking: 'facility_wide',
  parking_access: 'facility_wide',
  cleanliness_amenities: 'facility_wide',
  mud_pack: 'public_bath',
  sauna_and_cooling: 'sauna',
  standing_open_air_bath: 'open_air_public_bath',
  stone_bath: 'public_bath',
  ticket_payment: 'facility_wide',
};
const prefectureCodes = {
  '大分県': 'oita', '鹿児島県': 'kagoshima', '佐賀県': 'saga', '長崎県': 'nagasaki',
  '福岡県': 'fukuoka', '熊本県': 'kumamoto', '兵庫県': 'hyogo', '大阪府': 'osaka', '愛媛県': 'ehime',
  '埼玉県': 'saitama', '東京都': 'tokyo', '栃木県': 'tochigi',
  '神奈川県': 'kanagawa', '山梨県': 'yamanashi',
  '宮城県': 'miyagi', '山形県': 'yamagata', '岩手県': 'iwate', '福島県': 'fukushima',
  '秋田県': 'akita', '青森県': 'aomori',
  '静岡県': 'shizuoka',
  '長野県': 'nagano', '新潟県': 'niigata', '富山県': 'toyama', '石川県': 'ishikawa',
  '福井県': 'fukui', '岐阜県': 'gifu',
  '北海道': 'hokkaido',
  '三重県': 'mie', '京都府': 'kyoto', '和歌山県': 'wakayama', '奈良県': 'nara', '滋賀県': 'shiga',
  '鳥取県': 'tottori', '島根県': 'shimane', '岡山県': 'okayama', '広島県': 'hiroshima',
  '徳島県': 'tokushima', '香川県': 'kagawa', '愛媛県': 'ehime', '高知県': 'kochi',
};
const cityCodes = {
  '別府市': 'beppu', '由布市': 'yufu', '指宿市': 'ibusuki', '嬉野市': 'ureshino', '武雄市': 'takeo',
  '雲仙市': 'unzen', '福岡市': 'fukuoka', '熊本市': 'kumamoto', '神戸市': 'kobe', '豊岡市': 'toyooka',
  '大阪市': 'osaka', '松山市': 'matsuyama',
  '熊谷市': 'kumagaya', '草加市': 'soka', '北葛飾郡杉戸町': 'sugito', '板橋区': 'itabashi',
  '豊島区': 'toshima', '日光市': 'nikko',
  '足柄下郡箱根町': 'hakone', '茅ヶ崎市': 'chigasaki', '横浜市': 'yokohama',
  '富士吉田市': 'fujiyoshida', '南都留郡鳴沢村': 'narusawa', '足柄下郡湯河原町': 'yugawara',
  '仙台市': 'sendai', '尾花沢市': 'obanazawa', '上山市': 'kaminoyama', '山形市': 'yamagata',
  '花巻市': 'hanamaki', '福島市': 'fukushima', '仙北市': 'semboku', '青森市': 'aomori',
  '盛岡市': 'morioka', '会津若松市': 'aizuwakamatsu',
  '熱海市': 'atami', '伊東市': 'ito', '賀茂郡東伊豆町': 'higashiizu', '伊豆の国市': 'izunokuni',
  '下呂市': 'gero', 'あわら市': 'awara', '下高井郡野沢温泉村': 'nozawaonsen',
  '下高井郡山ノ内町': 'yamanouchi', '上田市': 'ueda', '松本市': 'matsumoto',
  '南魚沼郡湯沢町': 'yuzawa', '新発田市': 'shibata', '村上市': 'murakami',
  '加賀市': 'kaga', '七尾市': 'nanao', '黒部市': 'kurobe',
  '登別市': 'noboribetsu', '札幌市南区': 'sapporo', '函館市': 'hakodate',
  '三朝町': 'misasa', '京都市': 'kyoto', '南丹市': 'nantan', '城陽市': 'joyo', '多気町': 'taki',
  '大津市': 'otsu', '大阪狭山市': 'osakasayama', '天川村': 'tenkawa', '天理市': 'tenri',
  '姫路市': 'himeji', '宇治市': 'uji', '宝塚市': 'takarazuka', '寝屋川市': 'neyagawa',
  '尼崎市': 'amagasaki', '広島市': 'hiroshima', '徳島市': 'tokushima', '明石市': 'akashi',
  '松江市': 'matsue', '枚方市': 'hirakata', '白浜町': 'shirahama', '真庭市': 'maniwa',
  '米子市': 'yonago', '芦屋市': 'ashiya', '菰野町': 'komono', '香南市': 'konan',
  '高松市': 'takamatsu', '高知市': 'kochi', '鳴門市': 'naruto',
};
const areaBySlug = {
  'beppu-hyotan': 'beppu', 'beppu-takegawara': 'beppu', 'beppu-sakurayu': 'beppu',
  'beppu-kannawa-mushiyu': 'beppu', 'yufuin-shitanyu': 'yufuin', 'ibusuki-saraku': 'ibusuki',
  'ureshino-siebold-no-yu': 'ureshino', 'ureshino-hyakunen-no-yu': 'ureshino', 'takeo-motonoyu': 'takeo',
  'unzen-kojigoku-onsenkan': 'unzen', 'fukuoka-namiha-no-yu': 'fukuoka', 'kumamoto-agannasse': 'kumamoto',
  'arima-kin-no-yu': 'arima', 'arima-taikounoyu': 'arima', 'kinosaki-goshono-yu': 'kinosaki',
  'osaka-spa-world': 'osaka', 'dogo-honkan': 'dogo',
  'kumagaya-hanayuspa': 'kumagaya', 'ryusenji-soka-yatsuka': 'soka', 'sugito-utano-yu': 'sugito',
  'saya-no-yudokoro': 'tokyo', 'tokyo-somei-onsen-sakura': 'tokyo', 'yunishigawa-mizunosato': 'yunishigawa',
  'hakone-yuryo': 'hakone', 'shonan-ryusenji': 'shonan', 'yokohama-aoba-kirari': 'yokohama',
  'kawaguchiko-fujiyama-onsen': 'fujiyoshida', 'kawaguchiko-yurari': 'kawaguchiko', 'yugawara-kogomenoyu': 'yugawara',
};
const tohokuKoreanNames = {
  'akiu-hananoyu-dayuse': '호텔 하나노유 당일온천',
  'akiu-zuiho-dayuse': '호텔 즈이호 당일온천',
  'ginzan-shirogane-yu': '긴잔온천 시로가네유',
  'ginzan-warashiyu': '긴잔온천 와라시유 족탕',
  'kaminoyama-shimo-oyu': '가미노야마온천 시모오유',
  'zao-dai-rotenburo': '자오온천 대노천탕',
  'zao-shinzaemon-no-yu': '자오온천 신자에몬노유',
  'osawa-onsen-tojiya': '오사와온천 도지야',
  'iizaka-horikiri-yu': '이이자카온천 하코유',
  'iizaka-sabako-yu': '이이자카온천 사바코유',
  'nyuto-ganiba-dayuse': '뉴토온천향 가니바온천 당일입욕',
  'nyuto-kuroyu-dayuse': '뉴토온천향 구로유온천 당일입욕',
  'nyuto-kyukamura-dayuse': '뉴토온천향 규카무라 당일입욕',
  'nyuto-taenoyu-dayuse': '뉴토온천향 다에노유 당일입욕',
  'nyuto-tsurunoyu-dayuse': '뉴토온천향 쓰루노유 당일입욕',
  'nyuto-yumeguri-cho': '뉴토온천향 유메구리 패스',
  'asamushi-yu-sa-asamushi': '유사 아사무시',
  'sukayu-hiba-sennin-buro': '스카유온천 히바센닌부로',
  'akiu-ryokusuitei-dayuse': '아키우온천 료쿠스이테이 당일입욕',
  'akiu-sato-center': '아키우 사토센터 족탕',
  'kaminoyama-yumachi-footbath': '가미노야마온천 족탕 순례',
  'hanamaki-seirei-no-yu': '하나마키온천 세이레이노유',
  'tsunagi-aishinkan-dayuse': '쓰나기온천 아이신칸 당일입욕',
  'higashiyama-sarusuberi-no-yu': '아이즈 히가시야마온천 족탕',
  'nyuto-magoroku-dayuse': '뉴토온천향 마고로쿠온천 당일입욕',
  'nyuto-ogama-dayuse': '뉴토온천향 오가마온천 당일입욕',
};
const tohokuMunicipalityByArea = {
  akiu: '仙台市', ginzan: '尾花沢市', kaminoyama: '上山市', 'zao-yamagata': '山形市', hanamaki: '花巻市',
  iizaka: '福島市', nyuto: '仙北市', asamushi: '青森市', sukayu: '青森市', tsunagi: '盛岡市', higashiyama: '会津若松市',
};
const tohokuAddressBySlug = {
  'kaminoyama-shimo-oyu': '山形県上山市十日町9-30',
  'nyuto-ganiba-dayuse': '〒014-1204 秋田県仙北市田沢湖田沢先達沢国有林',
  'nyuto-kuroyu-dayuse': '秋田県仙北市田沢湖生保内黒湯沢2-1',
  'nyuto-taenoyu-dayuse': '秋田県仙北市田沢湖生保内字駒ヶ岳2-1',
  'nyuto-tsurunoyu-dayuse': '秋田県仙北市田沢湖田沢字先達沢国有林50',
  'nyuto-ogama-dayuse': '秋田県仙北市田沢湖田沢字先達国有林50',
};
const tohokuDraftSlugs = new Set([
  'ginzan-warashiyu', 'nyuto-yumeguri-cho', 'akiu-sato-center', 'kaminoyama-yumachi-footbath',
  'higashiyama-sarusuberi-no-yu', 'hanamaki-seirei-no-yu',
]);
const izuShizuokaKoreanNames = {
  'atami-fuua': '오션스파 후아',
  'atami-nikkotei': '닛코테이 오유',
  'atami-marinespa': '마린스파 아타미',
  'atami-ekimae-onsen': '아타미역 앞 온천욕장',
  'atami-yamadayu': '야마다유',
  'ito-tokaikan': '도카이칸',
  'ito-marine-town-seaside-spa': '이토 마린타운 시사이드스파',
  'ito-akazawa-day-spa': '아카자와 당일온천관',
  'ito-kawana-irukahama': '가와나 이루카하마 공원',
  'ito-hokkawa-kuroane': '홋카와온천 구로네이와부로',
  'ito-atagawa-takayuso': '아타가와 다카이소노유',
  'ito-izu-kogen-taiyokan': '이즈고원노유',
  'izu-nagaoka-kobonoyu-nagaoka': '이즈나가오카 고보노유 나가오카점',
  'izu-nagaoka-kobonoyu-honten': '이즈나가오카 고보노유 본점',
  'izu-nagaoka-yurakkusu': '이즈나가오카 유락스노유',
};
const izuShizuokaMunicipalityBySlug = {
  'atami-fuua': '熱海市', 'atami-nikkotei': '熱海市', 'atami-marinespa': '熱海市',
  'atami-ekimae-onsen': '熱海市', 'atami-yamadayu': '熱海市',
  'ito-tokaikan': '伊東市', 'ito-marine-town-seaside-spa': '伊東市', 'ito-akazawa-day-spa': '伊東市',
  'ito-kawana-irukahama': '伊東市', 'ito-izu-kogen-taiyokan': '伊東市',
  'ito-hokkawa-kuroane': '賀茂郡東伊豆町', 'ito-atagawa-takayuso': '賀茂郡東伊豆町',
  'izu-nagaoka-kobonoyu-nagaoka': '伊豆の国市', 'izu-nagaoka-kobonoyu-honten': '伊豆の国市',
  'izu-nagaoka-yurakkusu': '伊豆の国市',
};
const izuShizuokaAreaBySlug = {
  'atami-fuua': 'atami', 'atami-nikkotei': 'atami', 'atami-marinespa': 'atami',
  'atami-ekimae-onsen': 'atami', 'atami-yamadayu': 'atami',
  'ito-tokaikan': 'ito-izu', 'ito-marine-town-seaside-spa': 'ito-izu',
  'ito-akazawa-day-spa': 'akazawa', 'ito-kawana-irukahama': 'kawana',
  'ito-hokkawa-kuroane': 'hokkawa', 'ito-atagawa-takayuso': 'atagawa',
  'ito-izu-kogen-taiyokan': 'izu-kogen',
  'izu-nagaoka-kobonoyu-nagaoka': 'izu-nagaoka', 'izu-nagaoka-kobonoyu-honten': 'izu-nagaoka',
  'izu-nagaoka-yurakkusu': 'izu-nagaoka',
};
const izuShizuokaRetiredSlugs = new Set(['atami-nikkotei', 'ito-atagawa-takayuso', 'izu-nagaoka-yurakkusu']);
const izuShizuokaOfficialSummaries = {
  'atami-fuua': '사가미만을 바라보는 입식 노천탕과 가케나가시 노천탕, 암반욕·라운지를 갖춘 당일 스파입니다.',
  'atami-marinespa': '25m 수영장과 유수풀, 온천욕장, 11종의 건강 온욕 공간을 함께 운영하는 복합 시설입니다.',
  'atami-ekimae-onsen': '아타미역 앞 진흥회관 1층에서 남녀별 공동욕장을 운영합니다.',
  'atami-yamadayu': '아타미시가 공식 당일입욕 목록으로 안내하는 지역 공동욕장입니다.',
  'ito-tokaikan': '옛 료칸 건물을 관람하고 토·일·공휴일에는 원천 직수 목욕도 이용할 수 있는 문화시설입니다.',
  'ito-marine-town-seaside-spa': '오전 5시부터 바다를 바라보는 노천탕을 이용할 수 있고, 예약제 대절탕도 운영합니다.',
  'ito-akazawa-day-spa': '태평양을 바라보는 대노천탕과 실내탕, 2종의 사우나를 갖춘 당일온천관입니다.',
  'ito-hokkawa-kuroane': '파도와 같은 눈높이에서 바다를 바라보며 직수 온천을 즐기는 남녀별 노천탕입니다.',
  'ito-izu-kogen-taiyokan': '노천탕과 실내탕, 무료 머드팩, 약 6,000권의 만화가 있는 휴게 공간을 함께 이용할 수 있습니다.',
  'izu-nagaoka-kobonoyu-nagaoka': '라듐 온천과 암반욕·미스트 사우나를 함께 이용하고, 예약제 개인 사우나를 별도로 운영합니다.',
  'izu-nagaoka-kobonoyu-honten': '라듐 온천과 노천탕, 약석 암반욕, 미스트 사우나를 함께 이용하는 온천 요양형 시설입니다.',
};
const chubuHokurikuKoshinKoreanNames = {
  'gero-kua-garden': '게로 쿠아가든 노천탕',
  'gero-shirasagi': '게로 시라사기노유',
  'gero-sachinoyu': '게로 사치노유',
  'awara-saintpia': '세인트피아 아와라',
  'nozawa-oyu': '노자와온천 오유',
  'nozawa-furusato-no-yu': '노자와온천 후루사토노유',
  'yudanaka-kaede-no-yu': '유다나카역 앞 온천 가에데노유',
  'bessho-ishiyu': '벳쇼온천 이시유',
  'bessho-otsukai-yu': '벳쇼온천 다이시유',
  'bessho-ainome-yu': '벳쇼온천 아이소메노유',
  'shirahonet-public-openair': '시라호네온천 공공 노천탕',
  'echigo-yuzawa-yama-no-yu': '에치고유자와 야마노유',
  'echigo-yuzawa-komako-no-yu': '에치고유자와 고마코노유',
  'echigo-yuzawa-ponshukan-sakebath': '폰슈칸 사케탕 유노사와',
  'tsukioka-bijin-no-izumi': '츠키오카온천 비진노이즈미',
  'senami-ryusen': '세나미온천 유모토 류센',
  'yamashiro-soyu': '야마시로온천 소유',
  'yamashiro-ko-soyu': '야마시로온천 고소유',
  'yamanaka-kikunoyu': '야마나카온천 기쿠노유',
  'wakura-soyu': '와쿠라온천 소유',
  'katayamazu-machiyu': '가타야마즈온천 소유',
  'unazuki-soyu-yumedokoro': '유메도코로 우나즈키',
};
const chubuHokurikuKoshinMunicipalityBySlug = {
  'gero-kua-garden': '下呂市', 'gero-shirasagi': '下呂市', 'gero-sachinoyu': '下呂市',
  'awara-saintpia': 'あわら市',
  'nozawa-oyu': '下高井郡野沢温泉村', 'nozawa-furusato-no-yu': '下高井郡野沢温泉村',
  'yudanaka-kaede-no-yu': '下高井郡山ノ内町',
  'bessho-ishiyu': '上田市', 'bessho-otsukai-yu': '上田市', 'bessho-ainome-yu': '上田市',
  'shirahonet-public-openair': '松本市',
  'echigo-yuzawa-yama-no-yu': '南魚沼郡湯沢町', 'echigo-yuzawa-komako-no-yu': '南魚沼郡湯沢町',
  'echigo-yuzawa-ponshukan-sakebath': '南魚沼郡湯沢町',
  'tsukioka-bijin-no-izumi': '新発田市', 'senami-ryusen': '村上市',
  'yamashiro-soyu': '加賀市', 'yamashiro-ko-soyu': '加賀市', 'yamanaka-kikunoyu': '加賀市',
  'katayamazu-machiyu': '加賀市', 'wakura-soyu': '七尾市', 'unazuki-soyu-yumedokoro': '黒部市',
};
const chubuHokurikuKoshinAreaBySlug = {
  'gero-kua-garden': 'gero', 'gero-shirasagi': 'gero', 'gero-sachinoyu': 'gero',
  'awara-saintpia': 'awara',
  'nozawa-oyu': 'nozawa', 'nozawa-furusato-no-yu': 'nozawa',
  'yudanaka-kaede-no-yu': 'yudanaka-shibu',
  'bessho-ishiyu': 'bessho', 'bessho-otsukai-yu': 'bessho', 'bessho-ainome-yu': 'bessho',
  'shirahonet-public-openair': 'shirahone',
  'echigo-yuzawa-yama-no-yu': 'echigo-yuzawa', 'echigo-yuzawa-komako-no-yu': 'echigo-yuzawa',
  'echigo-yuzawa-ponshukan-sakebath': 'echigo-yuzawa',
  'tsukioka-bijin-no-izumi': 'tsukioka', 'senami-ryusen': 'senami',
  'yamashiro-soyu': 'yamashiro', 'yamashiro-ko-soyu': 'yamashiro', 'yamanaka-kikunoyu': 'yamanaka',
  'wakura-soyu': 'wakura', 'katayamazu-machiyu': 'katayamazu', 'unazuki-soyu-yumedokoro': 'unazuki',
};
const chubuHokurikuKoshinOfficialSummaries = {
  'gero-kua-garden': '히다강을 바라보며 바위 노천탕과 타격탕, 온도별 탕 등 여러 노천 온욕을 이용합니다.',
  'gero-shirasagi': '10명 이상 들어가는 실내탕과 게로의 오래된 공동목욕장 분위기가 중심입니다.',
  'gero-sachinoyu': '노천탕과 하이드로탕, 타격탕, 사우나를 갖춘 게로의 대중 온천입니다.',
  'awara-saintpia': '서로 구성이 다른 덴노유와 치노유를 매주 남녀 교대로 운영하는 공공 온천입니다.',
  'nozawa-oyu': '에도시대 목욕장 건축과 뜨거운 탕·온도를 낮춘 탕을 함께 경험하는 노자와의 상징적인 공동탕입니다.',
  'nozawa-furusato-no-yu': '뜨거운 실내탕과 온도를 낮춘 실내탕, 노천탕을 갖춘 관광객 친화형 유료 온천입니다.',
  'yudanaka-kaede-no-yu': '유다나카역 바로 앞에서 실내탕과 노천탕을 이용할 수 있는 역전 온천입니다.',
  'bessho-ishiyu': '사나다 유키무라의 숨은 탕이라는 이름을 지닌 바위 공동탕입니다.',
  'bessho-otsukai-yu': '자각대사와 인연이 전해지는 공동탕에서 3호 원천을 직수로 이용합니다.',
  'bessho-ainome-yu': '대욕장과 노천탕, 별도 요금의 암반욕을 갖춘 벳쇼온천의 공공 온천입니다.',
  'shirahonet-public-openair': '강가의 노천탕에서 옅은 유백색 물을 직수로 이용하는 계절 운영 시설입니다.',
  'echigo-yuzawa-yama-no-yu': '에치고유자와에서 가장 오래된 공동탕으로, 5~6명 규모의 욕조에 유황천을 직수로 채웁니다.',
  'echigo-yuzawa-komako-no-yu': '염화물천 공동탕과 설국·고마코 전시 공간을 함께 이용하는 당일온천입니다.',
  'echigo-yuzawa-ponshukan-sakebath': '천연온천에 목욕용 사케를 더한 술목욕을 에치고유자와역에서 경험합니다.',
  'tsukioka-bijin-no-izumi': '에메랄드빛으로 소개되는 유황·염화물천이 중심인 츠키오카의 공동탕입니다.',
  'senami-ryusen': '대욕장과 노천탕, 예약제 가족탕을 함께 운영하는 세나미의 당일온천입니다.',
  'yamashiro-soyu': '열교환기로 물을 섞지 않는 100% 원천을 쓰는 야마시로의 현대식 공동탕입니다.',
  'yamashiro-ko-soyu': '메이지시대 공동탕을 구타니야키 타일과 2층 휴게 공간까지 복원한 목욕 문화 시설입니다.',
  'yamanaka-kikunoyu': '남탕과 여탕이 이웃한 별동으로 운영되는 1,300년 역사의 공동탕입니다.',
  'wakura-soyu': '대·소욕조와 입식탕, 노천탕, 사우나를 갖춘 와쿠라온천의 공공 온천입니다.',
  'katayamazu-machiyu': '호수를 바라보는 가타노유와 숲을 향한 모리노유를 매일 남녀 교대로 운영합니다.',
  'unazuki-soyu-yumedokoro': '두 종류의 공용욕장을 일일 교대하고 야외 족욕·음천·휴게 공간을 함께 운영합니다.',
};
const chubuHokurikuKoshinLodgingSlugs = new Set(['gero-sachinoyu', 'senami-ryusen']);
const hokkaidoKoreanNames = {
  'noboribetsu-sagiriyu': '노보리베츠온천 사기리유',
  'noboribetsu-daiichi-dayuse': '다이이치 타키모토칸 당일입욕',
  'noboribetsu-grand-dayuse': '노보리베츠 그랜드호텔 당일온천',
  'noboribetsu-sekisuitei-dayuse': '노보리베츠 세키스이테이 당일입욕',
  'noboribetsu-manseikaku-dayuse': '노보리베츠 만세이카쿠 당일입욕',
  'noboribetsu-suzuki-karurusu': '카루루스온천 스즈키 료칸 당일입욕',
  'jozankei-hoheikyo': '호헤이쿄온천',
  'jozankei-yunohana': '유노하나 조잔케이덴',
  'jozankei-morino-uta-dayuse': '조잔케이 모리노우타 당일이용',
  'jozankei-shogetsu-dayuse': '쇼게쓰 그랜드호텔 당일이용',
  'jozankei-shikanoyu-dayuse': '조잔케이 시카노유 당일입욕',
  'yunokawa-yumeguri-butai': '유노카와온천 족욕 유메구리부타이',
  'yunokawa-tropical-footbath': '하코다테시 열대식물원 족욕',
  'hakodate-yachigashira': '야치가시라온천',
  'hakodate-minamikayabe-hoyou-center': '미나미카야베 보양센터',
};
const hokkaidoAreaBySlug = {
  'noboribetsu-sagiriyu': 'noboribetsu',
  'noboribetsu-daiichi-dayuse': 'noboribetsu',
  'noboribetsu-grand-dayuse': 'noboribetsu',
  'noboribetsu-sekisuitei-dayuse': 'noboribetsu',
  'noboribetsu-manseikaku-dayuse': 'noboribetsu',
  'noboribetsu-suzuki-karurusu': 'karurusu',
  'jozankei-hoheikyo': 'jozankei',
  'jozankei-yunohana': 'jozankei',
  'jozankei-morino-uta-dayuse': 'jozankei',
  'jozankei-shogetsu-dayuse': 'jozankei',
  'jozankei-shikanoyu-dayuse': 'jozankei',
  'yunokawa-yumeguri-butai': 'yunokawa-hakodate',
  'yunokawa-tropical-footbath': 'yunokawa-hakodate',
  'hakodate-yachigashira': 'yachigashira',
  'hakodate-minamikayabe-hoyou-center': 'minamikayabe-ofune',
};
const hokkaidoOfficialSummaries = {
  'noboribetsu-sagiriyu': '유황천과 명반천 두 원천, 실내 대욕장과 사우나를 이용하는 노보리베츠의 독립 공중온천입니다.',
  'noboribetsu-daiichi-dayuse': '5가지 수질과 남녀 합계 35개 욕조를 갖춘 대욕장 전용동을 외부 방문객에게 개방합니다.',
  'noboribetsu-grand-dayuse': '돔형 로마식 대욕장과 정원 노천탕, 남녀 교대 오니 사우나를 당일 이용할 수 있습니다.',
  'noboribetsu-sekisuitei-dayuse': '8층 전망 대욕장과 7층 편백·시가라키 도기 노천탕을 외부 당일입욕으로 이용합니다.',
  'noboribetsu-manseikaku-dayuse': '산성 함유황천을 사용하는 대욕장과 노천탕, 사우나를 아침과 오후 당일입욕 시간에 개방합니다.',
  'noboribetsu-suzuki-karurusu': '온도가 다른 세 욕조와 타격탕을 갖춘 카루루스온천의 료칸 부속 공용탕입니다.',
  'jozankei-hoheikyo': '최대 200명이 이용할 수 있는 대노천탕과 실내탕을 갖춘 독립 당일온천입니다.',
  'jozankei-yunohana': '대욕장과 동굴탕, 여러 기능탕·사우나·암반욕을 갖추고 무료 셔틀을 운영합니다.',
  'jozankei-morino-uta-dayuse': '식사와 공용 온천 이용을 묶은 예약형 당일 플랜으로 운영되는 리조트 스파입니다.',
  'jozankei-shogetsu-dayuse': '식사 결합 당일 플랜 이용객에게 선반형 욕조와 원천 증기욕이 있는 대욕장을 개방합니다.',
  'jozankei-shikanoyu-dayuse': '하나모미지 숙박 욕장과 분리한 시카노유의 외부 당일입욕 상품입니다.',
  'yunokawa-yumeguri-butai': '유노카와온천 전차 정류장에서 걸어서 1분인 무료 지붕형 족욕입니다.',
  'yunokawa-tropical-footbath': '열대식물원 안에서 유노카와 온천수를 이용하는 족욕과 정원을 함께 즐깁니다.',
  'hakodate-yachigashira': '철분이 많은 차갈색 염화물천과 오릉곽 모양 노천탕이 특징인 하코다테 시민 온천입니다.',
  'hakodate-minamikayabe-hoyou-center': '호텔 하코다테 히로메소 숙박 욕장과 분리한 미나미카야베의 공공 당일입욕 시설입니다.',
};
const kansaiSaninSetouchiOfficialSummaries = {
  'arima-kin-no-yu': '철분과 염분이 강한 금천을 이용하는 아리마의 역사적 공중탕입니다.',
  'arima-taikounoyu': '금천·은천과 탄산천, 증기탕·사우나를 한곳에서 이용하는 대형 당일온천입니다.',
  'kinosaki-goshono-yu': '교토고쇼를 본뜬 전각과 정원 노천탕이 중심인 기노사키 외탕입니다.',
  'osaka-spa-world': '유럽·아시아 테마 대욕장과 사우나·수영장·호텔을 결합한 도심형 온천 복합시설입니다.',
  'dogo-honkan': '1894년에 개축된 중요문화재 건물에서 목욕하는 도고의 상징적 공중탕입니다.',
  'mie-aquaignis-kataoka-onsen': '지하 1,200m 원천을 사용하는 가타오카온천과 식음·숙박을 결합한 복합 리조트입니다.',
  'kyoto-rurikei-onsen': '라돈온천 대욕장과 수영복 온욕 구역, 사우나·휴식·숙박을 묶은 리조트형 시설입니다.',
  'kyoto-sagano-tenzan-no-yu': '아라시야마 권역에서 노천탕과 사우나를 이용하는 대형 당일온천입니다.',
  'arima-gin-no-yu': '무색투명한 탄산천·라듐천 계열의 은천을 이용하는 아리마 공중탕입니다.',
  'arima-suzurannoyu': '넓은 노천 구역에 직수탕과 순환탕, 허브욕·요모기찜을 함께 갖춘 당일온천입니다.',
  'kinosaki-ichino-yu': '동굴을 닮은 반노천 욕장이 상징인 기노사키 외탕입니다.',
  'kinosaki-jizou-yu': '큰 등롱을 닮은 외관과 넓은 내탕이 특징인 기노사키 외탕입니다.',
  'kinosaki-mandara-yu': '산기슭의 작은 노천탕과 목조 외관이 특징인 기노사키 외탕입니다.',
  'kinosaki-yanagi-yu': '기노사키 7외탕 가운데 가장 아담한 목조 공중탕입니다.',
  'kobe-harborland-manyo-club': '고베항 전망의 온천·사우나·휴게·숙박을 한 건물에서 이용하는 도심형 시설입니다.',
  'kobe-minato-onsen-ren': '고베항을 바라보는 실내외 온천과 수영장·스파·숙박을 결합한 시설입니다.',
  'kobe-sauna-and-spa': '천연온천탕과 핀란드식 사우나, 캡슐 숙박을 결합한 도심 스파입니다.',
  'shirahama-sakinoyu': '태평양 파도가 닿을 듯한 해안 노천탕에서 시라하마 원천을 즐기는 공중탕입니다.',
  'shirahama-toretore': '노천탕·암반욕·사우나를 토레토레 시장 관광 동선과 함께 이용하는 대형 당일온천입니다.',
  'osaka-naniwa-no-yu': '건물 옥상 노천 구역에서 오사카 시가지를 바라보는 도심형 천연온천입니다.',
  'osaka-nobeha-no-yu-tsuruhashi': '원천 직수 입식탕·암반욕·사우나와 별도 가족탕을 갖춘 대형 당일온천입니다.',
  'osaka-solaniwa-onsen': '9종 욕탕과 정원형 공간, 유카타 체험·휴게·식음을 결합한 온천 테마 시설입니다.',
  'nara-dorogawa-onsen-center': '요시노 삼나무를 쓴 욕장과 노천탕에서 약알칼리성 단순천을 이용하는 산간 공공온천입니다.',
  'nara-kenko-land': '대욕장·사우나·수영장·휴게와 호텔을 함께 운영하는 온천 복합시설입니다.',
  'yubara-sunayu': '아사히강 강바닥에서 솟는 물을 쓰는 무료 혼욕 노천탕입니다.',
  'yubara-yumoto-onsenkan': '유바라온천 중심가에서 알칼리성 단순천을 이용하는 공공 당일온천입니다.',
  'tamatsukuri-yu-yu': '곡선형 건축 안의 대욕장·노천탕과 휴게 공간을 갖춘 다마쓰쿠리 공공온천입니다.',
  'hiroshima-yuki-lodge-dayuse': '약방사능천 공용탕과 노천탕을 숙박·식음 시설에 결합한 당일입욕 로지입니다.',
  'hiroshima-yunoyama-onsenkan': '23.5도 원천 타격탕과 가온 내탕을 나눠 이용하는 산간 공공온천입니다.',
  'tokushima-aratae-naruto': '나루토의 고장성 염화물 냉광천과 노천탕·사우나를 갖춘 도시형 스파입니다.',
  'tokushima-aratae-tamiya': '무가수·가온 직수탕과 노천탕·사우나를 갖춘 도쿠시마 시내 온천입니다.',
  'dogo-asukanoyu': '아스카 시대 건축 모티프와 도고 전통 공예를 담은 공중탕으로, 대욕장과 특별욕실을 운영합니다.',
  'dogo-tsubakinoyu': '도고온천 본관과 같은 무가온·무가수 직수탕을 이용하는 지역 공중탕입니다.',
  'shiga-agaryanse': '비와호 전망 노천탕과 사우나·암반욕·식음·휴게를 묶은 대형 스파입니다.',
  'kagawa-kirara-onsen': '다카마쓰에서 대욕장·노천탕·사우나와 숙박을 함께 운영하는 지역 온천입니다.',
  'kochi-ryoma-no-yu': '지하 1,300m 염화물천과 노천탕을 공항 인근 호텔에 결합한 당일온천입니다.',
  'kaike-ou-land': '대욕장과 노천탕, 별도 가족탕을 운영하는 가이케온천의 대형 당일시설입니다.',
  'misasa-kabuyu': '미사사온천 발상지의 원천 공동탕과 음천장을 함께 이용하는 지역 공중탕입니다.',
  'misasa-kawara-buro': '미사사강 한가운데 무료로 개방된 혼욕 노천탕입니다.',
  'mie-vison-honzoyu': '미에산 약초를 활용한 계절 약초탕과 사우나를 비손 리조트 안에서 이용합니다.',
  'kyoto-fushimi-chikara-no-yu': '운반 온천수 노천탕과 고농도 탄산천·사우나를 갖춘 교토 남부 당일시설입니다.',
  'kyoto-ikkyu-kyoto-honkan': '숲을 향한 노천탕과 대욕장·사우나를 갖춘 교토 남부 당일온천입니다.',
  'kyoto-mibu-hananoyu': '교토 시내에서 노천탕·탄산천·사우나를 이용하는 대형 공중목욕시설입니다.',
  'kyoto-uji-genji-no-yu': '넓은 노천 구역과 대욕장·사우나를 갖춘 우지의 당일온천입니다.',
  'hyogo-akashi-tatsunoyu': '철분이 산화해 선명한 갈색을 띠는 염화물천과 아카시 해협 전망이 특징입니다.',
  'hyogo-amagasaki-yunokaro': '원천 직수 노천 암탕·항아리탕과 순환식 욕조를 나눠 운영하는 아마가사키 온천입니다.',
  'hyogo-ashiya-spa-suisyun': '노천 암탕 상단의 무가온 직수탕과 사우나·암반욕을 갖춘 대형 스파입니다.',
  'hyogo-himeji-hanayunomori': '노천탕·탄산천·사우나와 계절 인공탕을 갖춘 히메지 교외형 공중목욕시설입니다.',
  'hyogo-takarazuka-takaranoyu': '무가수·가온 직수로 운영하는 황금빛 원천탕과 노천탕·탄산천을 갖춘 온천입니다.',
  'kobe-chimujilban-spa-kobe': '공용탕과 찜질방·암반욕·사우나를 함께 이용하는 고베의 복합 스파입니다.',
  'kobe-nagisa-no-yu': '천연온천 노천탕과 사우나, 해안 외기욕 공간을 새로 단장한 고베 스파입니다.',
  'kobe-taihei-no-yu': '아카시해협을 향한 노천 구역과 대욕장·사우나를 갖춘 다루미 해안 스파입니다.',
  'shirahama-muronoyu': '마부유와 미유키 두 원천을 각각 담은 두 욕조가 있는 시라하마 공중탕입니다.',
  'shirahama-shirarayu': '시라라하마 가까이에서 염화물천 직수 욕조를 이용하는 지역 공중탕입니다.',
  'osaka-hirakata-suisyun': '넓은 노천 구역과 사우나·암반욕을 갖춘 히라카타의 교외형 당일온천입니다.',
  'osaka-kamigata-onsen-ikkyu': '숲을 연상시키는 노천탕과 단순온천을 중심으로 이용하는 오사카 당일온천입니다.',
  'osaka-nijino-yu-osaka-sayama': '폭포 정원형 노천탕과 가족탕·사우나를 갖춘 오사카사야마 당일온천입니다.',
  'osaka-spa-suminoe': '대형 노천 구역과 사우나를 도심에서 이용하는 스미노에 당일온천입니다.',
  'osaka-tsurumi-suisyun': '공원 옆 노천 암탕의 상단 직수탕과 사우나·암반욕을 갖춘 대형 시설입니다.',
  'osaka-yukai-no-yu-neyagawa': '3단 노천탕과 원천탕·탄산천·사우나를 갖춘 네야가와 교외형 시설입니다.',
  'kagawa-yurari-no-yu': '다카마쓰 지역 원천을 쓰는 대욕장과 노천탕·사우나 중심의 당일온천입니다.',
  'kochi-pokapoka-onsen': '늦은 시간까지 대욕장·노천탕·사우나를 이용할 수 있는 고치 시내 온천입니다.',
  'kaike-onsen-ocean': '가이케 원천 직수탕과 넓은 노천 구역을 갖춘 해안형 대형 당일온천입니다.',
};
const defaultAreaByFacilityType = {
  large_day_use_complex: 'public_bath', historic_public_bath: 'public_bath', public_bath_facility: 'public_bath',
  family_private_bath_facility: 'family_bath', sand_bath_facility: 'sand_bath', steam_bath_facility: 'steam_bath',
  footbath: 'footbath', wellness_spa: 'public_bath', open_air_public_bath: 'open_air_public_bath', route_or_pass: 'route_or_pass', area_cluster: 'area_cluster',
};

function parseCsv(source) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') field += char;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  const [headerRow, ...bodyRows] = rows;
  const headers = headerRow.map((item) => item.replace(/^\uFEFF/, ''));
  return bodyRows
    .filter((items) => items.some((item) => item.trim()))
    .map((items) => Object.fromEntries(headers.map((header, index) => [header, items[index] ?? ''])));
}

function readCsv(filePath) {
  return parseCsv(readFileSync(filePath, 'utf8'));
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  return Object.fromEntries(readFileSync(filePath, 'utf8').split(/\n/).map((line) => line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/)).filter(Boolean).map((match) => {
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    return [match[1], value];
  }));
}

function readConfig() {
  const env = { ...parseEnvFile(path.join(repoRoot, '.env.local')), ...process.env };
  const supabaseUrl = String(env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');
  const restUrl = String(env.CONTENT_DB_REST_URL || (supabaseUrl ? `${supabaseUrl}/rest/v1` : '')).replace(/\/+$/, '');
  const apiKey = env.CONTENT_DB_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!restUrl || !apiKey) throw new Error('Missing Supabase REST URL or API key.');
  return { restUrl, apiKey };
}

async function request(config, table, params = {}, options = {}) {
  const url = new URL(`${config.restUrl}/${table}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers: {
      apikey: config.apiKey,
      authorization: `Bearer ${config.apiKey}`,
      accept: 'application/json',
      'content-type': 'application/json',
      ...(options.prefer ? { prefer: options.prefer } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  if (!response.ok) throw new Error(`${table} ${response.status}: ${await response.text()}`);
  const text = await response.text();
  return text ? JSON.parse(text) : [];
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function truthy(value) {
  return ['1', 'true', 'yes', 'full_direct_review'].includes(String(value ?? '').trim().toLowerCase());
}

function fullBodyEligible(row) {
  return ['full', 'complete'].includes(String(row.direct_body_status ?? '').trim()) && truthy(row.review_count_eligible);
}

function normalizedPlatformReview(row) {
  return fullBodyEligible(row) && row.content_type !== 'review_nonuse';
}

function integer(value) {
  const parsed = Number(String(value ?? '').replaceAll(',', '').trim());
  return Number.isFinite(parsed) ? Math.floor(parsed) : 0;
}

function canonicalPlatform(value) {
  const label = String(value ?? '').trim();
  const key = label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  if (key.includes('nifty')) return 'nifty_onsen';
  if (key.includes('google_hotels')) return 'google_hotels';
  if (key.includes('google')) return 'google_maps';
  if (key.includes('yahoo')) return 'yahoo_map';
  if (key.includes('tripadvisor')) return 'tripadvisor';
  if (key.includes('4travel') || key.includes('fourtravel')) return 'fourtravel';
  if (key.includes('jalan')) return 'jalan';
  return key || label;
}

function normalizeArchetype(value) {
  const key = String(value ?? '').trim().toLowerCase().replace(/[ -]+/g, '_');
  if (['public_bathing', 'public_bathing_facility', 'public_open_air_bath'].includes(key)) return 'public_bathing';
  if (key === 'experience_led' || key === 'experience_led_facility') return 'experience_led';
  if (key === 'private_use') return 'private_use';
  if (key === 'route_or_pass') return 'route_or_pass';
  if (['day_use_onsen_complex', 'urban_spa_or_super_sento', 'mixed_public_bathing'].includes(key)) return 'mixed';
  return 'mixed';
}

function normalizeLodging(value) {
  const key = String(value ?? '').trim().toLowerCase();
  return key === 'true' ? 'true' : key === 'false' ? 'false' : 'unclear';
}

function normalizeTohokuCandidate(row) {
  const slug = row.slug;
  const rawType = row.facility_type;
  const facilityType = rawType === 'open_air_bath_route'
    ? 'route_or_pass'
    : ['hotel_dayuse_bath', 'open_air_public_bath'].includes(rawType)
      ? 'public_bath_facility'
      : rawType;
  const facilityModel = row.facility_model === 'footbath' ? 'stopover' : row.facility_model;
  const isFootbath = facilityType === 'footbath';
  const isRoute = facilityType === 'route_or_pass';
  const lodgingAvailable = rawType === 'hotel_dayuse_bath' || slug.endsWith('-dayuse') || slug === 'osawa-onsen-tojiya';
  const rawDisplayName = String(row.name_ko_or_en ?? '').trim();
  return {
    ...row,
    candidate_slug: slug,
    korean_name: tohokuKoreanNames[slug],
    japanese_name: row.name_ja,
    name_en: /^[\x20-\x7E]+$/.test(rawDisplayName) ? rawDisplayName : null,
    aliases: rawDisplayName,
    municipality: tohokuMunicipalityByArea[row.area],
    onsen_area: row.area,
    facility_type: facilityType,
    facility_model: isRoute ? 'route_or_pass' : facilityModel,
    archetype: isRoute ? 'route_or_pass' : isFootbath ? 'experience_led' : 'public_bathing',
    lodging_available: lodgingAvailable ? 'true' : 'false',
    cleanup_status: slug === 'hanamaki-seirei-no-yu' ? 'exclude_or_hold' : isRoute ? 'route_or_pass' : isFootbath ? 'footbath_only' : 'keep_facility',
    operation_status: row.candidate_status,
    product_strength: row.initial_onsen_facility_signals || row.why_prioritized,
    address: tohokuAddressBySlug[slug] ?? null,
    status: tohokuDraftSlugs.has(slug) ? 'draft' : 'active',
    map_or_review_url: String(row.source_urls ?? '').split(/[;|]/).map((value) => value.trim()).find((value) => value && value !== row.official_url) ?? null,
  };
}

function normalizeIzuShizuokaCandidate(row) {
  const slug = row.candidate_slug;
  const isFootbathHold = slug === 'ito-kawana-irukahama';
  const retired = izuShizuokaRetiredSlugs.has(slug);
  const facilityType = row.facility_type === 'open_air_public_bath' ? 'public_bath_facility' : row.facility_type;
  const mixed = ['wellness_spa', 'large_day_use_complex'].includes(facilityType);
  const lodgingAvailable = ['atami-fuua', 'ito-akazawa-day-spa', 'izu-nagaoka-kobonoyu-nagaoka', 'izu-nagaoka-kobonoyu-honten'].includes(slug);
  return {
    ...row,
    korean_name: izuShizuokaKoreanNames[slug],
    municipality: izuShizuokaMunicipalityBySlug[slug],
    onsen_area: izuShizuokaAreaBySlug[slug],
    facility_type: facilityType,
    facility_model: isFootbathHold ? 'stopover' : row.facility_model,
    archetype: isFootbathHold ? 'experience_led' : mixed ? 'mixed' : 'public_bathing',
    lodging_available: lodgingAvailable ? 'true' : 'false',
    cleanup_status: retired || isFootbathHold
      ? 'exclude_or_hold'
      : slug === 'ito-akazawa-day-spa'
        ? 'split_needed'
        : row.cleanup_status === 'split_needed'
          ? 'split_needed'
          : 'keep_facility',
    operation_status: retired ? 'closed_confirmed' : isFootbathHold ? 'onsen_identity_unconfirmed' : row.operation_status,
    summary: izuShizuokaOfficialSummaries[slug] ?? null,
    status: retired ? 'retired' : isFootbathHold ? 'draft' : 'active',
  };
}

function normalizeChubuHokurikuKoshinCandidate(row) {
  const slug = row.candidate_slug;
  return {
    ...row,
    korean_name: chubuHokurikuKoshinKoreanNames[slug],
    municipality: chubuHokurikuKoshinMunicipalityBySlug[slug],
    onsen_area: chubuHokurikuKoshinAreaBySlug[slug],
    facility_type: row.facility_type === 'open_air_public_bath' ? 'public_bath_facility' : row.facility_type,
    archetype: row.archetype,
    lodging_available: chubuHokurikuKoshinLodgingSlugs.has(slug) ? 'true' : 'false',
    cleanup_status: 'keep_facility',
    summary: chubuHokurikuKoshinOfficialSummaries[slug],
    status: 'active',
  };
}

function normalizeHokkaidoCandidate(row) {
  const slug = row.candidate_slug;
  const footbath = row.cleanup_status === 'footbath_only' || row.facility_model === 'stopover';
  const mixedHotel = row.facility_type === 'mixed_use_hotel_day_spa';
  const facilityType = footbath
    ? 'footbath'
    : mixedHotel
      ? row.facility_model === 'experience' ? 'wellness_spa' : 'large_day_use_complex'
      : row.facility_type === 'open_air_public_bath'
        ? 'public_bath_facility'
        : row.facility_type;
  const archetype = footbath
    ? 'experience_led'
    : row.facility_model === 'experience'
      ? 'experience_led'
      : mixedHotel || row.archetype === 'mixed_public_bathing'
        ? 'mixed'
        : 'public_bathing';
  return {
    ...row,
    korean_name: hokkaidoKoreanNames[slug],
    onsen_area: hokkaidoAreaBySlug[slug],
    facility_type: facilityType,
    archetype,
    cleanup_status: footbath ? 'footbath_only' : 'keep_facility',
    summary: hokkaidoOfficialSummaries[slug],
    status: 'active',
  };
}

function normalizeKansaiSaninSetouchiCandidate(row) {
  return {
    ...row,
    japanese_name: row.candidate_slug === 'osaka-spa-world' ? 'スパワールド 世界の大温泉' : row.japanese_name,
    facility_type: row.facility_type === 'open_air_public_bath' ? 'public_bath_facility' : row.facility_type,
    official_url: /^https?:\/\//.test(String(row.official_url ?? '')) ? row.official_url : null,
    map_or_review_url: /^https?:\/\//.test(String(row.map_or_review_url ?? '')) ? row.map_or_review_url : null,
    summary: kansaiSaninSetouchiOfficialSummaries[row.candidate_slug],
    status: 'active',
  };
}

function normalizeCandidate(row) {
  if (isKansaiSaninSetouchi) return normalizeKansaiSaninSetouchiCandidate(row);
  if (isHokkaido) return normalizeHokkaidoCandidate(row);
  if (isTohoku) return normalizeTohokuCandidate(row);
  if (isIzuShizuoka) return normalizeIzuShizuokaCandidate(row);
  if (isChubuHokurikuKoshin) return normalizeChubuHokurikuKoshinCandidate(row);
  return row;
}

function regionGroupFor(candidate) {
  const prefecture = prefectureCodes[candidate.prefecture];
  if (prefecture === 'hokkaido') return 'hokkaido';
  if (['miyagi', 'yamagata', 'iwate', 'fukushima', 'akita', 'aomori'].includes(prefecture)) return 'tohoku';
  if (['shizuoka', 'nagano', 'niigata', 'toyama', 'ishikawa', 'fukui', 'gifu'].includes(prefecture)) return 'chubu';
  if (['saitama', 'tokyo', 'tochigi', 'kanagawa', 'yamanashi'].includes(prefecture)) return 'kanto';
  if (['hyogo', 'osaka', 'kyoto', 'nara', 'wakayama', 'shiga', 'mie'].includes(prefecture)) return 'kansai';
  if (['tottori', 'shimane', 'okayama', 'hiroshima', 'yamaguchi', 'tokushima', 'kagawa', 'ehime', 'kochi'].includes(prefecture)) return 'chugoku_shikoku';
  return 'kyushu';
}

function findCanonicalLedger(directory, slug) {
  const matches = readdirSync(directory)
    .filter((name) => name.startsWith(`${slug}_direct_review_sample_index_`) && name.endsWith('.csv'))
    .sort();
  const integrated = matches.filter((name) => name.includes('_integrated_'));
  const selected = integrated.length > 0 ? integrated : matches;
  if (selected.length !== 1) throw new Error(`${slug}: expected one canonical ledger, found ${selected.length}`);
  return path.join(directory, selected[0]);
}

function findArtifact(directory, slug, marker, extension) {
  const matches = readdirSync(directory).filter((name) => name.startsWith(`${slug}_${marker}_`) && name.endsWith(extension));
  if (matches.length !== 1) throw new Error(`${slug}: expected one ${marker}, found ${matches.length}`);
  return path.join(directory, matches[0]);
}

function dedupeLedgerRows(rows) {
  const result = new Map();
  for (const row of rows) {
    const key = row.dedupe_key?.trim() || row.review_id?.trim() || `${row.platform}|${row.author_or_publisher}|${row.review_date_or_relative}|${row.short_paraphrase}`;
    if (!result.has(key)) result.set(key, row);
  }
  return [...result.values()];
}

function directReviewManifest(fullRows, relatedRows, dayuseRows = relatedRows) {
  const counts = new Map();
  for (const row of fullRows) {
    const platform = canonicalPlatform(row.platform);
    const current = counts.get(platform) ?? { platform, direct_full_reviews: 0, facility_related_direct_reviews: 0, dayuse_direct_reviews: 0 };
    current.direct_full_reviews += 1;
    counts.set(platform, current);
  }
  for (const row of relatedRows) {
    const platform = canonicalPlatform(row.platform);
    const current = counts.get(platform);
    if (current) current.facility_related_direct_reviews += 1;
  }
  for (const row of dayuseRows) {
    const platform = canonicalPlatform(row.platform);
    const current = counts.get(platform);
    if (current) current.dayuse_direct_reviews += 1;
  }
  return [...counts.values()].sort((a, b) => b.direct_full_reviews - a.direct_full_reviews || a.platform.localeCompare(b.platform));
}

function visibleReviewPools(qa) {
  return [
    { platform: 'google_maps', visible_review_count: integer(qa.google_visible_pool) },
    { platform: 'nifty_onsen', visible_review_count: integer(qa.nifty_visible_pool) },
    { platform: 'yahoo_map', visible_review_count: integer(qa.yahoo_visible_pool) },
  ].map((row) => ({ ...row, count_type: 'platform_visible_only', pool_status: qa.locked_pool_status }));
}

function productAreas(mapping, candidate) {
  const areas = [];
  if (Array.isArray(mapping.area_tags)) areas.push(...mapping.area_tags);
  if (mapping.product_areas && typeof mapping.product_areas === 'object') areas.push(...Object.keys(mapping.product_areas));
  const collectAreaValues = (value) => {
    if (Array.isArray(value)) value.forEach(collectAreaValues);
    else if (value && typeof value === 'object') Object.values(value).forEach(collectAreaValues);
    else if (typeof value === 'string') {
      if (allowedAreas.has(value)) areas.push(value);
      if (value.includes('open_air_public_bath') || value.includes('outdoor_source_flow')) areas.push('open_air_public_bath');
      if (value.includes('public_bath') || value.includes('indoor_source_flow')) areas.push('public_bath');
    }
  };
  collectAreaValues(mapping.official_water_profile);
  const officialAreas = mapping.official_facts_checked?.areas;
  if (Array.isArray(officialAreas)) areas.push(...officialAreas.filter((item) => !/not_available|not_found/.test(String(item?.status ?? ''))).map((item) => item?.facility_area));
  if (Array.isArray(mapping.official_facts)) areas.push(...mapping.official_facts.map((item) => item?.area));
  const products = mapping.official_facts?.products;
  if (Array.isArray(products)) areas.push(...products.filter((item) => item?.dayuse_eligible !== false).map((item) => item?.facility_area ?? item?.product_area));
  else if (products && typeof products === 'object') {
    for (const [key, value] of Object.entries(products)) {
      if (/confirmed|있음|확인/.test(String(value))) areas.push(key);
    }
  }
  if (Array.isArray(mapping.official_bath_facts?.bath_areas)) areas.push(...mapping.official_bath_facts.bath_areas);
  if (Array.isArray(mapping.official_facts?.bath_products)) areas.push(...mapping.official_facts.bath_products);
  if (Array.isArray(mapping.official_facts?.bath_areas)) areas.push(...mapping.official_facts.bath_areas.filter((item) => typeof item === 'string' || !/not_available|not_found/.test(String(item?.status ?? ''))).map((item) => item?.area ?? item));
  if (Array.isArray(mapping.official_scope_products)) {
    for (const product of mapping.official_scope_products) {
      if (!/available_on_checked_official_page/.test(String(product.official_status))) continue;
      if (product.product_key === 'dayuse_public_bath') {
        areas.push('public_bath');
        if (/露天風呂/.test(String(product.official_original_japanese))) areas.push('open_air_public_bath');
        if (/サウナ/.test(String(product.official_original_japanese))) areas.push('sauna');
      }
    }
  }
  areas.push(defaultAreaByFacilityType[candidate.facility_type] ?? 'public_bath');
  const aliases = {
    family_private_bath: 'family_bath', rest_and_food: 'rest_area', standing_open_air_bath: 'open_air_public_bath',
    open_air_bath: 'open_air_public_bath', large_bath: 'public_bath', small_bath: 'public_bath',
    indoor_bath: 'public_bath', view_bath: 'public_bath', stone_bedrock_bath: 'stone_sauna', mist_sauna: 'steam_bath',
    radium_bath: 'public_bath', mud_pack: 'public_bath', warm_relaxation: 'rest_area',
  };
  const normalized = unique(areas.map((area) => aliases[area] ?? area).filter((area) => allowedAreas.has(area)));
  return normalized.some((area) => area !== 'unclear') ? normalized.filter((area) => area !== 'unclear') : normalized;
}

function collectUrls(candidate, mapping) {
  const values = [candidate.official_url, ...String(candidate.source_urls ?? '').split(/[;|]/)];
  const official = mapping.official_facts ?? mapping.official_facts_checked ?? {};
  const visit = (value) => {
    if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === 'object') Object.values(value).forEach(visit);
    else if (typeof value === 'string' && /^https?:\/\//.test(value)) values.push(value);
  };
  visit(official);
  visit(mapping.official_sources);
  visit(mapping.official_water_profile);
  visit(mapping.official_water);
  visit(mapping.official_identity);
  visit(mapping.official_scope_products);
  visit(mapping.official_bath_facts);
  visit(mapping.source_urls);
  visit(mapping.official_url);
  return unique(values.map((value) => String(value ?? '').trim()).filter((value) => /^https?:\/\//.test(value)));
}

function firstJapaneseAddress(value) {
  const candidates = [];
  const visit = (item, pathParts = []) => {
    if (Array.isArray(item)) item.forEach((nested, index) => visit(nested, [...pathParts, String(index)]));
    else if (item && typeof item === 'object') Object.entries(item).forEach(([key, nested]) => {
      const pathText = [...pathParts, key].join('.');
      if (/address/i.test(key) && typeof nested === 'string' && /[都道府県市町村郡区]/.test(nested)) {
        const score = (/current_official|official_address_ja/i.test(pathText) ? 30 : /official/i.test(pathText) ? 20 : /address_ja|address_original/i.test(pathText) ? 15 : 0) - (/google|yahoo|map/i.test(pathText) ? 10 : 0);
        candidates.push({ value: nested.trim(), score });
      }
      visit(nested, [...pathParts, key]);
    });
  };
  visit(value);
  return candidates.sort((a, b) => b.score - a.score || a.value.length - b.value.length)[0]?.value ?? null;
}

function officialProfile(mapping, candidate) {
  const facts = mapping.official_facts ?? mapping.official_bath_facts ?? {};
  const checked = mapping.official_facts_checked ?? {};
  return {
    bath_areas: productAreas(mapping, candidate),
    operation_status: mapping.operation_status ?? facts.operation_status ?? checked.volatile_fact_policy ?? candidate.operation_status ?? null,
    hours: facts.hours ?? null,
    fees: facts.fees ?? null,
    amenities: facts.amenities ?? null,
    access: facts.access ?? null,
    official_operating_notes: checked.official_operating_notes ?? [],
    official_facts: facts,
    official_identity: mapping.official_identity ?? null,
    official_scope_products: mapping.official_scope_products ?? null,
    official_bath_facts: mapping.official_bath_facts ?? null,
    official_sources: mapping.official_sources ?? [],
    official_water_profile: mapping.official_water_profile ?? mapping.official_water ?? facts.water_profile ?? null,
    scope_status: candidate.cleanup_status,
    product_strength: candidate.product_strength ?? null,
  };
}

function signalSources(row) {
  return unique(String(row.platforms || row.sample_platforms || '').split(/[|;]/).map((item) => item.trim()));
}

function normalizeSignal(row, slug, evidenceRef) {
  const rawArea = row.facility_area?.trim() || 'unclear';
  const area = facilityAreaAliases[rawArea] ?? rawArea;
  const rawSignalType = row.signal_type?.trim();
  if (heldRawSignalTypes.has(rawSignalType)) return null;
  const signalType = signalTypeAliases[rawSignalType] ?? rawSignalType;
  if (!allowedAreas.has(area)) throw new Error(`${slug}: unsupported facility area ${area}`);
  if (!allowedSignals.has(signalType)) throw new Error(`${slug}: unsupported signal type ${signalType}`);
  const mentionCount = integer(row.mention_count);
  const sourceCount = integer(row.source_count);
  const platformCount = integer(row.platform_count);
  if (sourceCount === 0) return null;
  if (sourceCount > mentionCount || platformCount > sourceCount) throw new Error(`${slug}: invalid signal count chain ${signalType}`);
  const label = rawSignalLabels[rawSignalType] ?? signalLabels[signalType] ?? signalType;
  const normalizedSignalStatus = ['strong_signal', 'moderate_signal', 'weak_signal', 'conflicting', 'insufficient'].includes(row.review_signal_status) ? row.review_signal_status : 'insufficient';
  const subtypeValue = row.water_texture_subtype?.trim();
  const subtype = ['slippery', 'salt_warmth', 'sulfur', 'carbonated'].includes(subtypeValue) ? subtypeValue : null;
  const colorTag = row.color_tag?.trim();
  const evidenceSources = signalSources(row);
  if (subtype) evidenceSources.push({ water_texture_subtype: subtype });
  if (colorTag && !['not_applicable', 'unclear'].includes(colorTag)) evidenceSources.push({ color_tag: colorTag });
  if (rawSignalType !== signalType) evidenceSources.push({ raw_signal_type: rawSignalType });
  if (rawArea !== area) evidenceSources.push({ raw_facility_area: rawArea });
  return {
    evidence_ref: evidenceRef,
    facility_area: area,
    facility_area_confidence: ['specific', 'probable', 'facility_wide', 'unclear'].includes(row.facility_area_confidence) ? row.facility_area_confidence : area === 'facility_wide' ? 'facility_wide' : 'unclear',
    signal_type: signalType,
    signal_direction: ['positive', 'negative', 'mixed', 'neutral'].includes(row.signal_direction) ? row.signal_direction : 'neutral',
    mention_count: mentionCount,
    source_count: sourceCount,
    platform_count: platformCount,
    contradiction_level: ['low', 'medium', 'high', 'not_assessed'].includes(row.contradiction_level) ? row.contradiction_level : 'not_assessed',
    review_signal_status: row.publishable_item !== undefined && row.publishable_item !== '' && !truthy(row.publishable_item)
      ? 'insufficient'
      : normalizedSignalStatus,
    evidence_summary: `${label}${subtype ? `(${subtype})` : ''}을 다룬 독립 후기 ${sourceCount}건이 ${platformCount}개 플랫폼에 분산됩니다.`,
    evidence_sources: evidenceSources,
  };
}

function facilityRow(candidate, mapping, sourceFile) {
  const prefecture = prefectureCodes[candidate.prefecture];
  const municipality = cityCodes[candidate.municipality];
  const onsenArea = areaBySlug[candidate.candidate_slug] ?? candidate.onsen_area;
  if (!prefecture || !municipality || !onsenArea) throw new Error(`${candidate.candidate_slug}: location normalization missing`);
  const identity = mapping.identity ?? mapping.official_identity ?? mapping.listing_identity ?? mapping.candidate ?? {};
  const mappingAliases = mapping.aliases ?? identity.aliases ?? identity.alias_names ?? [];
  const officialUrl = candidate.official_url || identity.official_url || mapping.official_url || mapping.official_facts?.official_url || mapping.official_facts?.official_authority_urls?.[0] || collectUrls(candidate, mapping)[0] || null;
  return {
    slug: candidate.candidate_slug,
    name_ko: candidate.korean_name || identity.korean_name,
    name_ja: candidate.japanese_name || identity.official_name_ja || identity.name_ja,
    name_en: identity.english_name ?? candidate.name_en ?? null,
    aliases: unique([...String(candidate.aliases ?? '').split(';').map((item) => item.trim()), ...(Array.isArray(mappingAliases) ? mappingAliases : [])]),
    country: 'JP',
    region_group: regionGroupFor(candidate),
    prefecture,
    municipality,
    onsen_area: onsenArea,
    address: identity.address_ja ?? identity.official_address ?? identity.address ?? mapping.official_facts?.address ?? mapping.official_address ?? mapping.address ?? candidate.address ?? firstJapaneseAddress(mapping),
    facility_type: candidate.facility_type,
    facility_model: candidate.facility_model,
    primary_archetype: normalizeArchetype(candidate.archetype || mapping.classification?.primary_archetype),
    lodging_available: normalizeLodging(candidate.lodging_available),
    cleanup_status: candidate.cleanup_status,
    official_url: officialUrl,
    map_or_review_url: candidate.map_or_review_url || identity.map_or_review_url || null,
    official_profile: officialProfile(mapping, candidate),
    official_source_urls: collectUrls(candidate, mapping),
    official_checked_at: seedDate,
    summary: candidate.summary ?? null,
    status: ['draft', 'retired'].includes(candidate.status) ? candidate.status : 'active',
    content_updated_at: seedDate,
    source_file: path.relative(repoRoot, sourceFile),
  };
}

function evidenceRow(qa, ledgerPath, fullRows, relatedRows, manifest, excludedNonuse) {
  const ledgerRows = integer(qa.ledger_rows);
  const lodgingDirectReviews = Math.min(integer(qa.lodging_bath_only_direct_reviews), relatedRows.length);
  const dayuseDirectReviews = Math.min(integer(qa.dayuse_only_direct_reviews), relatedRows.length - lodgingDirectReviews);
  return {
    facility_slug: qa.candidate_slug,
    collection_key: collectionKey,
    collected_on: seedDate,
    visible_review_pools: visibleReviewPools(qa),
    direct_review_manifest: manifest,
    raw_direct_reviews: ledgerRows,
    deduped_direct_reviews: fullRows.length,
    facility_related_direct_reviews: relatedRows.length,
    dayuse_only_direct_reviews: dayuseDirectReviews,
    lodging_bath_only_direct_reviews: lodgingDirectReviews,
    excluded_direct_reviews: ledgerRows - relatedRows.length,
    direct_body_platform_count: manifest.length,
    evidence_grade: qa.evidence_grade,
    collection_readiness: qa.p0_decision?.startsWith('P0_ready') || ['full', 'lite'].includes(qa.p0_decision) || String(qa.readiness).startsWith('p0_ready') ? 'ready' : 'needs_reinforcement',
    collection_note: `적격 full-body ${fullRows.length}건과 시설 관련 ${relatedRows.length}건을 원장으로 재계산했습니다. visible pool은 별도 필드에만 보존했습니다.${excludedNonuse > 0 ? ` 입욕하지 않은 시설 맥락 본문 ${excludedNonuse}건은 후기 분모에서 제외했습니다.` : ''}`,
    source_file: path.relative(repoRoot, ledgerPath),
  };
}

function kansaiWaterFacts() {
  const spotcheckPath = path.join(outputDir, 'kansai_sanin_setouchi_facility_official_water_spotcheck_2026-07-10.csv');
  return readCsv(spotcheckPath).map((row) => {
    const areaOnlyMethod = row.candidate_slug === 'arima-taikounoyu';
    const scopeSplit = areaOnlyMethod || row.candidate_slug === 'dogo-honkan';
    return {
      facility_slug: row.candidate_slug,
      facility_area: 'public_bath',
      scope_key: areaOnlyMethod ? 'taiko-iwaburo' : 'facility-representative-water-profile',
      scope_label_ko: areaOnlyMethod ? '태합의 암탕' : '시설 대표 수질',
      day_use_available: 'confirmed',
      water_system: areaOnlyMethod ? 'kakenagashi' : null,
      kasui: 'unknown',
      kaon: 'unknown',
      disinfection: 'unknown',
      spring_types: String(row.spring_quality_original).split(';').map((item) => item.trim()).filter(Boolean),
      texture_filter_candidates: [],
      water_color: 'unknown',
      method_render_status: scopeSplit ? 'scope_split_required' : 'no_badge',
      texture_filter_status: 'not_eligible',
      color_filter_status: 'not_eligible',
      official_original_text: row.official_water_text_original,
      official_source_url: row.official_source_url,
      official_source_checked_at: seedDate,
      source_file: path.relative(repoRoot, spotcheckPath),
    };
  });
}

function textureFilterState(signalRows) {
  const allowed = new Set(['slippery', 'salt_warmth', 'sulfur', 'carbonated']);
  const textureRows = signalRows.filter((row) => row.signal_type === 'water_texture' && allowed.has(row.water_texture_subtype));
  const candidates = unique(textureRows.map((row) => row.water_texture_subtype));
  const ready = unique(textureRows
    .filter((row) => truthy(row.publishable_item) && integer(row.source_count) >= 5 && integer(row.platform_count) >= 2)
    .map((row) => row.water_texture_subtype));
  return {
    candidates,
    ready,
    status: ready.length > 0 ? 'ready_with_review_count' : 'not_eligible',
  };
}

function waterFact(slug, values, mappingPath, textureState) {
  return {
    facility_slug: slug,
    facility_area: values.facility_area,
    scope_key: values.scope_key,
    scope_label_ko: values.scope_label_ko,
    day_use_available: values.day_use_available ?? 'confirmed',
    water_system: values.water_system ?? null,
    kasui: values.kasui ?? 'unknown',
    kaon: values.kaon ?? 'unknown',
    disinfection: values.disinfection ?? 'unknown',
    spring_types: values.spring_types ?? [],
    texture_filter_candidates: textureState.ready.length > 0 ? textureState.ready : textureState.candidates,
    water_color: values.water_color ?? 'unknown',
    method_render_status: values.method_render_status ?? 'no_badge',
    texture_filter_status: textureState.status,
    color_filter_status: values.color_filter_status ?? 'not_eligible',
    official_original_text: values.official_original_text,
    official_source_url: values.official_source_url,
    official_source_checked_at: seedDate,
    source_file: path.relative(repoRoot, mappingPath),
  };
}

function hokkaidoWaterFacts(mappingPaths, signalRowsBySlug) {
  const facts = [];
  const texture = (slug) => textureFilterState(signalRowsBySlug.get(slug) ?? []);
  const push = (slug, values, textureState = texture(slug)) => facts.push(waterFact(slug, values, mappingPaths.get(slug), textureState));

  push('noboribetsu-sagiriyu', {
    facility_area: 'public_bath',
    scope_key: 'facility-public-bath',
    scope_label_ko: '사기리유 공용욕장',
    water_system: 'kakenagashi_pure',
    kasui: 'not_present',
    kaon: 'not_present',
    disinfection: 'unknown',
    spring_types: ['硫黄泉', '明礬泉'],
    method_render_status: 'ready',
    official_original_text: 'お客様に余すところなく楽しんでいただくために、水を加えることなく100％源泉掛け流しで提供しております。',
    official_source_url: 'https://sagiriyu-noboribetsu.com/',
  });

  push('noboribetsu-daiichi-dayuse', {
    facility_area: 'public_bath',
    scope_key: 'common-bath-building',
    scope_label_ko: '당일입욕 공용 대욕장·노천탕',
    water_system: 'kakenagashi',
    spring_types: ['硫黄泉', '食塩泉', '酸性緑ばん泉', '重曹泉', '芒硝泉'],
    method_render_status: 'ready',
    official_original_text: '登別温泉最多、5つの泉質を贅沢に源泉かけ流しで。男女で合計35の浴槽。',
    official_source_url: 'https://takimotokan.co.jp/ja/spa/',
  });

  push('noboribetsu-grand-dayuse', {
    facility_area: 'public_bath',
    scope_key: 'dayuse-public-bath-profile',
    scope_label_ko: '당일입욕 공용 대욕장',
    spring_types: ['食塩泉', '硫黄泉', '鉄泉'],
    official_original_text: '登別グランドホテルではその中から硫黄泉・食塩泉・鉄泉の3つの泉質をご用意。',
    official_source_url: 'https://www.nobogura.co.jp/hotspring/rome/',
  });
  push('noboribetsu-grand-dayuse', {
    facility_area: 'family_bath',
    scope_key: 'reservable-family-bath',
    scope_label_ko: '예약제 가족탕',
    water_system: 'kakenagashi',
    spring_types: ['食塩泉'],
    method_render_status: 'scope_split_required',
    official_original_text: '泉質：食塩泉（源泉かけ流し）／50分4,400円／要予約。',
    official_source_url: 'https://www.nobogura.co.jp/hotspring/',
  }, { candidates: [], ready: [], status: 'not_eligible' });

  push('noboribetsu-sekisuitei-dayuse', {
    facility_area: 'public_bath',
    scope_key: 'dayuse-public-bath-profile',
    scope_label_ko: '당일입욕 대욕장·노천탕',
    spring_types: ['硫黄泉（硫化水素型）'],
    official_original_text: '石水亭の泉質は硫黄泉＜硫化水素型＞（弱酸性・低張性・高温泉）。',
    official_source_url: 'https://www.sekisuitei.com/faq_cat/bath/',
  });

  push('noboribetsu-manseikaku-dayuse', {
    facility_area: 'public_bath',
    scope_key: 'tsuki-hoshi-public-baths',
    scope_label_ko: '대욕장 쓰키노유·호시노유',
    water_system: 'kakenagashi',
    kasui: 'present',
    method_render_status: 'ready',
    official_original_text: '当館の温泉は放流式（いわゆる掛け流し）を採用しておりますが、湧出する源泉温度が日々変化するため適宜加水しております。',
    official_source_url: 'https://www.noboribetsu-manseikaku.jp/spa/',
  });

  push('noboribetsu-suzuki-karurusu', {
    facility_area: 'public_bath',
    scope_key: 'yusei-public-bath',
    scope_label_ko: '대욕장 유세이',
    day_use_available: 'unknown',
    water_system: 'kakenagashi',
    spring_types: ['単純温泉'],
    method_render_status: 'candidate_after_recheck',
    official_original_text: '「有生」と命名された大浴場は源泉かけ流し。湯温の違う3種類の湯船と打たせ湯。',
    official_source_url: 'https://www.suzukiryokan.jp/',
  });

  push('jozankei-hoheikyo', {
    facility_area: 'public_bath',
    scope_key: 'public-indoor-open-air-baths',
    scope_label_ko: '공용 실내탕·노천탕',
    water_system: 'kakenagashi_pure',
    kasui: 'not_present',
    kaon: 'not_present',
    method_render_status: 'ready',
    official_original_text: '日本でも数少ない源泉「100％」かけ流し。',
    official_source_url: 'https://hoheikyo.co.jp/onsen/',
  });

  push('jozankei-yunohana', {
    facility_area: 'public_bath',
    scope_key: 'facility-public-bath-profile',
    scope_label_ko: '시설 공용욕장 수질',
    spring_types: ['ナトリウム－塩化物泉（低張性中性高温泉）'],
    official_original_text: 'ナトリウム塩化物泉です。（自家源泉があります。）',
    official_source_url: 'https://www.yunohana.org/jyouzankei/senshitsu/',
  });

  push('jozankei-morino-uta-dayuse', {
    facility_area: 'public_bath',
    scope_key: 'meal-plan-public-bath-profile',
    scope_label_ko: '식사 결합 당일 플랜 공용욕장',
    method_render_status: 'scope_split_required',
    official_original_text: '無色透明でまろやかな塩辛さが特徴。',
    official_source_url: 'https://www.morino-uta.com/dayplans/lunch/',
  }, { candidates: [], ready: [], status: 'not_eligible' });

  push('jozankei-shogetsu-dayuse', {
    facility_area: 'public_bath',
    scope_key: 'meal-plan-shared-hotel-public-bath',
    scope_label_ko: '식사 결합 당일 플랜 공용욕장',
    kasui: 'present',
    disinfection: 'present',
    spring_types: ['ナトリウム－塩化物泉'],
    method_render_status: 'scope_split_required',
    official_original_text: '泉質 ナトリウム－塩化物泉／源泉温度が約75℃と高温のため、加水。保健所の指導に基づき薬剤を添加。',
    official_source_url: 'https://www.shogetsugrand.com/faq',
  }, { candidates: [], ready: [], status: 'not_eligible' });

  push('yunokawa-yumeguri-butai', {
    facility_area: 'footbath',
    scope_key: 'yumeguri-butai-footbath',
    scope_label_ko: '유메구리부타이 족욕',
    spring_types: ['ナトリウム・カルシウム塩化物泉'],
    official_original_text: '泉質 ナトリウム・カルシウム塩化物泉／泉温65℃前後／飲用は不可。',
    official_source_url: 'https://www.hakobura.jp/spots/440',
  });

  push('yunokawa-tropical-footbath', {
    facility_area: 'footbath',
    scope_key: 'botanical-garden-footbath',
    scope_label_ko: '열대식물원 족욕',
    water_system: 'kakenagashi',
    spring_types: ['ナトリウム－塩化物温泉'],
    method_render_status: 'hold',
    official_original_text: '湯の川温泉の源泉を利用した足湯施設／泉質 ナトリウム－塩化物温泉／泉温40℃（源泉64.1℃）／源泉かけ流し。',
    official_source_url: 'https://www.hakobura.jp/spots/451',
  });

  push('hakodate-yachigashira', {
    facility_area: 'public_bath',
    scope_key: 'public-and-open-air-baths',
    scope_label_ko: '공용 실내탕·노천탕',
    water_system: 'kakenagashi',
    spring_types: ['塩化物泉'],
    water_color: 'brown',
    method_render_status: 'ready',
    color_filter_status: 'ready',
    official_original_text: '温泉は源泉かけ流し、泉質は塩化物泉、泉温は65.1℃。鉄分を多く含み茶褐色をしている湯が特徴的です。',
    official_source_url: 'https://hakodate-kankou.com/spot/10239/',
  });

  return facts;
}

function kantoAdditionalWaterFacts(mappings, mappingPaths, signalRowsBySlug) {
  const facts = [];
  const texture = (slug) => textureFilterState(signalRowsBySlug.get(slug) ?? []);

  {
    const slug = 'kumagaya-hanayuspa';
    const profile = mappings.get(slug).official_water_profile;
    facts.push(waterFact(slug, {
      facility_area: 'open_air_public_bath',
      scope_key: 'keiryu-no-yu-source-bath',
      scope_label_ko: '계류의탕 원천 히노키 욕조',
      water_system: 'kakenagashi_pure',
      kasui: 'not_present',
      kaon: 'not_present',
      disinfection: 'unknown',
      method_render_status: 'candidate_after_recheck',
      official_original_text: profile.official_original_text,
      official_source_url: profile.official_source_url,
    }, mappingPaths.get(slug), texture(slug)));
  }

  {
    const slug = 'ryusenji-soka-yatsuka';
    const profile = mappings.get(slug).official_water_profile;
    facts.push(waterFact(slug, {
      facility_area: 'public_bath',
      scope_key: 'facility-representative-water-profile',
      scope_label_ko: '시설 대표 수질',
      spring_types: [profile.quality],
      official_original_text: profile.method_candidate.official_original_text,
      official_source_url: profile.method_candidate.official_source_url,
    }, mappingPaths.get(slug), texture(slug)));
  }

  {
    const slug = 'sugito-utano-yu';
    const profile = mappings.get(slug).official_water_profile;
    const common = {
      water_system: 'kakenagashi',
      method_render_status: 'scope_split_required',
      spring_types: [profile.water_quality_text],
      official_original_text: profile.method_candidates[0].official_original_text,
      official_source_url: profile.method_candidates[0].official_source_url,
    };
    facts.push(waterFact(slug, {
      ...common,
      facility_area: 'open_air_public_bath',
      scope_key: 'outdoor-source-flow-bath',
      scope_label_ko: '노천 원천직수 욕조',
      water_color: 'brown',
      color_filter_status: 'official_candidate',
    }, mappingPaths.get(slug), texture(slug)));
    facts.push(waterFact(slug, {
      ...common,
      facility_area: 'public_bath',
      scope_key: 'indoor-source-flow-bath',
      scope_label_ko: '실내 원천직수 욕조',
    }, mappingPaths.get(slug), { candidates: [], ready: [], status: 'not_eligible' }));
  }

  {
    const slug = 'saya-no-yudokoro';
    const profiles = mappings.get(slug).official_water_profile;
    const sourceBath = profiles.find((row) => row.scope_key === 'source_bath');
    const openAir = profiles.find((row) => row.scope_key === 'open_air_baths');
    facts.push(waterFact(slug, {
      facility_area: sourceBath.facility_area,
      scope_key: sourceBath.scope_key,
      scope_label_ko: '원천탕',
      water_system: 'kakenagashi',
      kasui: 'not_present',
      kaon: 'present',
      disinfection: 'not_present',
      method_render_status: 'scope_split_required',
      official_original_text: sourceBath.official_original_text,
      official_source_url: sourceBath.official_source_url,
    }, mappingPaths.get(slug), texture(slug)));
    facts.push(waterFact(slug, {
      facility_area: openAir.facility_area,
      scope_key: openAir.scope_key,
      scope_label_ko: '일반 노천탕',
      water_system: 'junkan',
      kasui: 'present',
      kaon: 'unknown',
      disinfection: 'present',
      method_render_status: 'scope_split_required',
      official_original_text: openAir.official_original_text,
      official_source_url: openAir.official_source_url,
    }, mappingPaths.get(slug), { candidates: [], ready: [], status: 'not_eligible' }));
  }

  {
    const slug = 'tokyo-somei-onsen-sakura';
    const mapping = mappings.get(slug);
    const color = mapping.official_facts.find((row) => row.fact_key === 'water_depth_and_color');
    const quality = mapping.official_facts.find((row) => row.fact_key === 'spring_quality');
    facts.push(waterFact(slug, {
      facility_area: 'public_bath',
      scope_key: 'source-to-bath-water-profile',
      scope_label_ko: '원천·욕조 물빛과 수질',
      spring_types: [quality.official_original_text],
      water_color: 'brown',
      color_filter_status: 'ready',
      official_original_text: color.official_original_text,
      official_source_url: color.official_source_url,
    }, mappingPaths.get(slug), texture(slug)));
  }

  {
    const slug = 'yunishigawa-mizunosato';
    const profile = mappings.get(slug).official_water_profile;
    facts.push(waterFact(slug, {
      facility_area: 'public_bath',
      scope_key: 'public-and-open-air-baths',
      scope_label_ko: '공용 실내탕·노천탕',
      water_system: 'kakenagashi',
      spring_types: [profile.quality],
      method_render_status: 'candidate_after_recheck',
      official_original_text: profile.method_candidate.official_original_text,
      official_source_url: profile.method_candidate.official_source_url,
    }, mappingPaths.get(slug), texture(slug)));
  }

  return facts;
}

function officialFilterFact(facilitySlug, filterCode, scopeKey, values, sourceFile) {
  return {
    facility_slug: facilitySlug,
    filter_code: filterCode,
    scope_key: scopeKey,
    scope_label_ko: values.scope_label_ko,
    availability: values.availability ?? 'confirmed',
    filter_value: values.filter_value ?? {},
    filter_status: values.filter_status ?? 'ready',
    official_original_text: values.official_original_text,
    official_source_url: values.official_source_url,
    source_kind: values.source_kind ?? 'operator_official',
    official_source_checked_at: seedDate,
    valid_until: values.valid_until ?? null,
    source_file: path.relative(repoRoot, sourceFile),
  };
}

function hokkaidoOfficialFilterFacts(mappingPaths) {
  const volatileUntil = '2026-08-11';
  const fact = (slug, code, scopeKey, values) => officialFilterFact(slug, code, scopeKey, values, mappingPaths.get(slug));
  const facts = [];
  const add = (slug, code, scopeKey, values) => facts.push(fact(slug, code, scopeKey, values));

  add('noboribetsu-sagiriyu', 'day_use', 'facility-operation', {
    scope_label_ko: '독립 공중온천 당일 이용',
    filter_value: { hours: '09:00-21:00', final_reception: '20:30' },
    official_original_text: '営業時間 9:00～21:00（最終受付20:30）。',
    official_source_url: 'https://sagiriyu-noboribetsu.com/',
    valid_until: volatileUntil,
  });
  add('noboribetsu-sagiriyu', 'adult_day_use_price', 'facility-admission', {
    scope_label_ko: '성인 당일입욕 요금',
    filter_value: { adult_jpy: 500 },
    official_original_text: '入浴料 大人500円、子供180円。',
    official_source_url: 'https://sagiriyu-noboribetsu.com/',
    valid_until: volatileUntil,
  });
  add('noboribetsu-sagiriyu', 'sauna', 'public-bath-products', {
    scope_label_ko: '공용 사우나',
    official_original_text: '硫黄泉・明礬泉、大浴場、サウナ、ジャグジー、水風呂。',
    official_source_url: 'https://sagiriyu-noboribetsu.com/',
  });
  add('noboribetsu-sagiriyu', 'spring_sulfur', 'official-spring-profile', {
    scope_label_ko: '유황천·명반천',
    official_original_text: '硫黄泉・明礬泉。',
    official_source_url: 'https://sagiriyu-noboribetsu.com/',
  });

  const daiichiBathText = '登別温泉最多、5つの泉質を贅沢に源泉かけ流しで。男女で合計35の浴槽。';
  add('noboribetsu-daiichi-dayuse', 'day_use', 'external-day-use', {
    scope_label_ko: '외부 방문객 당일입욕',
    filter_value: { reception: '09:00-18:00', final_exit: '21:00' },
    official_original_text: '日帰り入浴 9:00～18:00受付、最終退館21:00。',
    official_source_url: 'https://takimotokan.co.jp/ja/day_spa/',
    valid_until: volatileUntil,
  });
  add('noboribetsu-daiichi-dayuse', 'adult_day_use_price', 'external-day-use-admission', {
    scope_label_ko: '성인 당일입욕 요금',
    filter_value: { adult_jpy: 2250, child_jpy: 1100, towels_included: true },
    official_original_text: '大人2,250円、小人1,100円。バスタオル・フェイスタオル、諸税込み。',
    official_source_url: 'https://takimotokan.co.jp/ja/day_spa/',
    valid_until: volatileUntil,
  });
  add('noboribetsu-daiichi-dayuse', 'open_air_bath', 'common-bath-building', {
    scope_label_ko: '공용 노천탕',
    official_original_text: daiichiBathText,
    official_source_url: 'https://takimotokan.co.jp/ja/spa/',
  });
  add('noboribetsu-daiichi-dayuse', 'sauna', 'common-bath-building', {
    scope_label_ko: '드라이 사우나',
    official_original_text: '男女それぞれにドライサウナ・スチームサウナ・水風呂。サウナ4:00～24:00。',
    official_source_url: 'https://takimotokan.co.jp/ja/spa/',
  });
  add('noboribetsu-daiichi-dayuse', 'steam_bath', 'common-bath-building', {
    scope_label_ko: '스팀 사우나',
    official_original_text: '男女それぞれにドライサウナ・スチームサウナ・水風呂。',
    official_source_url: 'https://takimotokan.co.jp/ja/spa/',
  });
  add('noboribetsu-daiichi-dayuse', 'rest_area', 'dayuse-private-rest-room', {
    scope_label_ko: '당일 대절 휴게실',
    filter_value: { hours: '09:00-16:00', bath_in_room: false },
    official_original_text: '日帰り入浴向け貸切休憩室 9:00～16:00。浴室はありません。',
    official_source_url: 'https://takimotokan.co.jp/ja/day_spa/',
    valid_until: volatileUntil,
  });
  add('noboribetsu-daiichi-dayuse', 'parking', 'external-day-use-parking', {
    scope_label_ko: '외부 당일입욕 주차',
    availability: 'conditional',
    filter_status: 'hold',
    filter_value: { alternate_parking_jpy: 500 },
    official_original_text: '週末・繁忙期は本館駐車場が宿泊者専用となる場合があり、地獄谷駐車場1日500円を案内。',
    official_source_url: 'https://takimotokan.co.jp/ja/day_spa/',
    valid_until: volatileUntil,
  });
  add('noboribetsu-daiichi-dayuse', 'spring_sulfur', 'five-spring-profile', {
    scope_label_ko: '5가지 수질 중 유황천',
    official_original_text: daiichiBathText,
    official_source_url: 'https://takimotokan.co.jp/ja/spa/',
  });
  add('noboribetsu-daiichi-dayuse', 'spring_chloride', 'five-spring-profile', {
    scope_label_ko: '5가지 수질 중 식염천',
    official_original_text: daiichiBathText,
    official_source_url: 'https://takimotokan.co.jp/ja/spa/',
  });

  const grandBathText = '本格ドーム型ローマ風大浴場／庭園露天風呂／鬼サウナ。';
  const grandSpringText = '硫黄泉・食塩泉・鉄泉の3つの泉質。';
  add('noboribetsu-grand-dayuse', 'day_use', 'external-day-use', {
    scope_label_ko: '외부 방문객 당일입욕',
    filter_value: { daytime: '12:30-20:00', daytime_final_reception: '19:00', morning: '07:00-10:00', morning_final_reception: '09:00' },
    official_original_text: '日帰り温泉入浴 昼12:30～20:00（最終19:00）、朝7:00～10:00（最終9:00）。月・木は14:30受付開始。',
    official_source_url: 'https://www.nobogura.co.jp/hotspring/',
    valid_until: volatileUntil,
  });
  add('noboribetsu-grand-dayuse', 'adult_day_use_price', 'external-day-use-admission', {
    scope_label_ko: '성인 당일입욕 요금',
    filter_value: { adult_jpy: 2000, child_jpy: 1000 },
    official_original_text: 'ご入浴料金 大人2,000円／子供1,000円。',
    official_source_url: 'https://www.nobogura.co.jp/hotspring/',
    valid_until: volatileUntil,
  });
  add('noboribetsu-grand-dayuse', 'open_air_bath', 'dayuse-public-bath', {
    scope_label_ko: '정원 노천탕',
    official_original_text: grandBathText,
    official_source_url: 'https://www.nobogura.co.jp/hotspring/',
  });
  add('noboribetsu-grand-dayuse', 'sauna', 'dayuse-public-bath', {
    scope_label_ko: '남녀 교대 오니 사우나',
    official_original_text: grandBathText,
    official_source_url: 'https://www.nobogura.co.jp/hotspring/',
  });
  add('noboribetsu-grand-dayuse', 'family_bath', 'reservable-family-bath', {
    scope_label_ko: '예약제 가족탕',
    filter_value: { capacity: 4, minutes: 50, price_jpy: 4400 },
    official_original_text: '家族風呂1か所、4名まで、50分4,400円、要予約。',
    official_source_url: 'https://www.nobogura.co.jp/hotspring/',
    valid_until: volatileUntil,
  });
  for (const [code, label] of [['spring_sulfur', '유황천'], ['spring_chloride', '식염천'], ['spring_iron', '철천']]) {
    add('noboribetsu-grand-dayuse', code, 'three-spring-profile', {
      scope_label_ko: label,
      official_original_text: grandSpringText,
      official_source_url: 'https://www.nobogura.co.jp/hotspring/rome/',
    });
  }

  add('noboribetsu-sekisuitei-dayuse', 'day_use', 'external-day-use', {
    scope_label_ko: '외부 방문객 당일입욕',
    filter_value: { morning: '05:00-09:00', morning_final_reception: '08:00', daytime: '11:00-19:00', daytime_final_reception: '18:00' },
    official_original_text: '05:00-09:00（最終受付08:00）／11:00-19:00（最終受付18:00）。',
    official_source_url: 'https://www.sekisuitei.com/onsen/',
    valid_until: volatileUntil,
  });
  add('noboribetsu-sekisuitei-dayuse', 'morning_bath', 'external-day-use-morning', {
    scope_label_ko: '아침 당일입욕',
    filter_value: { hours: '05:00-09:00', final_reception: '08:00' },
    official_original_text: '05:00-09:00（最終受付08:00）。',
    official_source_url: 'https://www.sekisuitei.com/onsen/',
    valid_until: volatileUntil,
  });
  add('noboribetsu-sekisuitei-dayuse', 'adult_day_use_price', 'external-day-use-admission', {
    scope_label_ko: '성인 당일입욕 요금',
    filter_value: { adult_jpy: 1200, child_jpy: 600 },
    official_original_text: '大人1,200円、小学生600円、未就学児無料。',
    official_source_url: 'https://www.sekisuitei.com/onsen/',
    valid_until: volatileUntil,
  });
  add('noboribetsu-sekisuitei-dayuse', 'open_air_bath', 'ginkgo-building-open-air-bath', {
    scope_label_ko: '7층 편백·도기 노천탕',
    official_original_text: '銀杏館7F 露天風呂、檜風呂・信楽焼の陶器風呂。',
    official_source_url: 'https://www.sekisuitei.com/onsen/',
  });
  add('noboribetsu-sekisuitei-dayuse', 'private_bath', 'separate-private-bath-product', {
    scope_label_ko: '별도 대절탕',
    official_original_text: '貸切風呂は大浴場・露天風呂と別商品として案内。',
    official_source_url: 'https://www.sekisuitei.com/onsen/',
  });
  add('noboribetsu-sekisuitei-dayuse', 'spring_sulfur', 'official-spring-profile', {
    scope_label_ko: '유황천',
    official_original_text: '硫黄泉＜硫化水素型＞（弱酸性・低張性・高温泉）。',
    official_source_url: 'https://www.sekisuitei.com/faq_cat/bath/',
  });

  add('noboribetsu-manseikaku-dayuse', 'day_use', 'external-day-use', {
    scope_label_ko: '외부 방문객 당일입욕',
    filter_value: { morning: '07:00-09:30', morning_final_reception: '09:00', daytime: '13:30-20:00', daytime_final_reception: '18:00' },
    official_original_text: '日帰り入浴 7:00～9:30（最終9:00）、13:30～20:00（最終18:00）。',
    official_source_url: 'https://www.noboribetsu-manseikaku.jp/spa/daytrip/',
    valid_until: volatileUntil,
  });
  add('noboribetsu-manseikaku-dayuse', 'morning_bath', 'external-day-use-morning', {
    scope_label_ko: '아침 당일입욕',
    filter_value: { hours: '07:00-09:30', final_reception: '09:00' },
    official_original_text: '7:00～9:30（最終受付9:00）。',
    official_source_url: 'https://www.noboribetsu-manseikaku.jp/spa/daytrip/',
    valid_until: volatileUntil,
  });
  add('noboribetsu-manseikaku-dayuse', 'adult_day_use_price', 'external-day-use-admission', {
    scope_label_ko: '성인 당일입욕 요금',
    filter_value: { adult_jpy: 1300, child_jpy: 650, towel_set_jpy: 400 },
    official_original_text: '大人1,300円、小人650円、レンタルタオルセット400円。',
    official_source_url: 'https://www.noboribetsu-manseikaku.jp/spa/daytrip/',
    valid_until: volatileUntil,
  });
  add('noboribetsu-manseikaku-dayuse', 'open_air_bath', 'public-bath-products', {
    scope_label_ko: '공용 노천탕',
    official_original_text: '大浴場・露天風呂・サウナ。',
    official_source_url: 'https://www.noboribetsu-manseikaku.jp/spa/daytrip/',
  });
  add('noboribetsu-manseikaku-dayuse', 'sauna', 'public-bath-products', {
    scope_label_ko: '공용 사우나',
    official_original_text: '大浴場・露天風呂・サウナ。',
    official_source_url: 'https://www.noboribetsu-manseikaku.jp/spa/daytrip/',
  });

  add('noboribetsu-suzuki-karurusu', 'day_use', 'lodging-attached-day-use', {
    scope_label_ko: '료칸 부속 당일입욕',
    availability: 'conditional',
    filter_status: 'hold',
    official_original_text: '日帰り入浴の現在運用と対象浴場は再確認が必要。',
    official_source_url: 'https://www.suzukiryokan.jp/',
    valid_until: volatileUntil,
  });
  add('noboribetsu-suzuki-karurusu', 'spring_simple', 'official-spring-profile', {
    scope_label_ko: '단순온천',
    official_original_text: '単純温泉、無色透明・無味無臭。',
    official_source_url: 'https://www.suzukiryokan.jp/guide',
  });

  add('jozankei-hoheikyo', 'day_use', 'facility-operation', {
    scope_label_ko: '독립 당일온천',
    filter_value: { hours: '10:00-22:30', final_reception: '21:45' },
    official_original_text: '入浴利用時間10:00～22:30、最終受付21:45。',
    official_source_url: 'https://hoheikyo.co.jp/',
    valid_until: volatileUntil,
  });
  add('jozankei-hoheikyo', 'adult_day_use_price', 'facility-admission', {
    scope_label_ko: '성인 당일입욕 요금',
    filter_value: { adult_jpy: 1300, child_jpy: 600 },
    official_original_text: '入泉料 大人1,300円、こども600円。',
    official_source_url: 'https://hoheikyo.co.jp/',
    valid_until: volatileUntil,
  });
  add('jozankei-hoheikyo', 'open_air_bath', 'large-open-air-public-bath', {
    scope_label_ko: '최대 200명 대노천탕',
    filter_value: { maximum_capacity: 200 },
    official_original_text: '最大入浴人数200人の大露天風呂。',
    official_source_url: 'https://hoheikyo.co.jp/onsen/',
  });
  add('jozankei-hoheikyo', 'late_night', 'facility-operation', {
    scope_label_ko: '밤 10시 이후 이용',
    filter_value: { closes_at: '22:30', final_reception: '21:45' },
    official_original_text: '入浴利用時間10:00～22:30、最終受付21:45。',
    official_source_url: 'https://hoheikyo.co.jp/',
    valid_until: volatileUntil,
  });
  add('jozankei-hoheikyo', 'meal_service', 'facility-restaurant', {
    scope_label_ko: '인도요리·일식 식당',
    official_original_text: 'インド料理・和食レストランを併設。',
    official_source_url: 'https://hoheikyo.co.jp/',
  });

  add('jozankei-yunohana', 'day_use', 'facility-operation', {
    scope_label_ko: '독립 당일온천',
    filter_value: { hours: '10:00-21:00', final_reception: '20:30' },
    official_original_text: '営業時間10:00～21:00、最終受付20:30。',
    official_source_url: 'https://www.yunohana.org/jyouzankei/qa.html',
    valid_until: volatileUntil,
  });
  add('jozankei-yunohana', 'adult_day_use_price', 'facility-admission', {
    scope_label_ko: '성인 당일입욕 요금',
    filter_value: { adult_jpy: 1180, child_jpy: 450 },
    official_original_text: '大人1,180円、子供450円、幼児無料。',
    official_source_url: 'https://www.yunohana.org/jyouzankei/ryokin/',
    valid_until: volatileUntil,
  });
  add('jozankei-yunohana', 'sauna', 'public-bath-products', {
    scope_label_ko: '드라이 사우나',
    official_original_text: '大浴場、洞窟風呂、アクティブスパ、ドライサウナ、寝湯、石風呂、座湯、打たせ湯。',
    official_source_url: 'https://www.yunohana.org/jyouzankei/ofuro/shisetsu.html',
  });
  add('jozankei-yunohana', 'stone_sauna', 'paid-stone-bath', {
    scope_label_ko: '유료 암반욕',
    filter_value: { price_jpy: 500, minutes: 60 },
    official_original_text: '岩盤浴500円／1時間。',
    official_source_url: 'https://www.yunohana.org/jyouzankei/ryokin/',
    valid_until: volatileUntil,
  });
  add('jozankei-yunohana', 'parking', 'facility-access', {
    scope_label_ko: '무료 주차장',
    filter_value: { spaces: 400, free: true },
    official_original_text: '無料駐車場400台。',
    official_source_url: 'https://www.yunohana.org/jyouzankei/qa.html',
  });
  add('jozankei-yunohana', 'shuttle', 'facility-access', {
    scope_label_ko: '무료 셔틀',
    official_original_text: '無料送迎バスあり。',
    official_source_url: 'https://www.yunohana.org/jyouzankei/qa.html',
    valid_until: volatileUntil,
  });
  add('jozankei-yunohana', 'spring_chloride', 'official-spring-profile', {
    scope_label_ko: '나트륨-염화물천',
    official_original_text: 'ナトリウム－塩化物泉（低張性中性高温泉）。',
    official_source_url: 'https://www.yunohana.org/jyouzankei/senshitsu/',
  });

  add('jozankei-morino-uta-dayuse', 'day_use', 'meal-bundle-day-plan', {
    scope_label_ko: '식사 결합 당일 플랜',
    availability: 'conditional',
    filter_status: 'hold',
    official_original_text: 'ランチ・入浴・スパを組み合わせた日帰りプラン。',
    official_source_url: 'https://www.morino-uta.com/dayplans/lunch/',
    valid_until: volatileUntil,
  });
  add('jozankei-morino-uta-dayuse', 'meal_service', 'meal-bundle-day-plan', {
    scope_label_ko: '당일 플랜 식사',
    availability: 'conditional',
    filter_status: 'hold',
    official_original_text: 'ランチ・入浴・スパを組み合わせた日帰りプラン。',
    official_source_url: 'https://www.morino-uta.com/dayplans/lunch/',
    valid_until: volatileUntil,
  });

  add('jozankei-shogetsu-dayuse', 'day_use', 'meal-bundle-day-plan', {
    scope_label_ko: '식사 결합 당일 플랜',
    availability: 'conditional',
    filter_status: 'hold',
    official_original_text: '日帰り入浴のみのご利用は出来かねます。日帰りプランでご予約のお客様のみ。',
    official_source_url: 'https://www.shogetsugrand.com/faq',
    valid_until: volatileUntil,
  });
  add('jozankei-shogetsu-dayuse', 'meal_service', 'meal-bundle-day-plan', {
    scope_label_ko: '당일 플랜 식사',
    availability: 'conditional',
    filter_status: 'hold',
    official_original_text: '日帰り入浴のみのご利用は出来かねます。日帰りプランでご予約のお客様のみ。',
    official_source_url: 'https://www.shogetsugrand.com/faq',
    valid_until: volatileUntil,
  });
  add('jozankei-shogetsu-dayuse', 'sauna', 'shared-hotel-public-bath', {
    scope_label_ko: '드라이 사우나',
    official_original_text: '浴槽が三段となった棚湯／源泉蒸気浴 湯の霧／ドライサウナ。',
    official_source_url: 'https://www.shogetsugrand.com/hotspring',
  });
  add('jozankei-shogetsu-dayuse', 'steam_bath', 'shared-hotel-public-bath', {
    scope_label_ko: '원천 증기욕 유노기리',
    official_original_text: '浴槽が三段となった棚湯／源泉蒸気浴 湯の霧／ドライサウナ。',
    official_source_url: 'https://www.shogetsugrand.com/hotspring',
  });
  add('jozankei-shogetsu-dayuse', 'spring_chloride', 'shared-hotel-public-bath-profile', {
    scope_label_ko: '나트륨-염화물천',
    official_original_text: '泉質 ナトリウム－塩化物泉。',
    official_source_url: 'https://www.shogetsugrand.com/faq',
  });

  add('jozankei-shikanoyu-dayuse', 'day_use', 'shikanoyu-day-use-child-scope', {
    scope_label_ko: '시카노유 외부 당일입욕',
    availability: 'conditional',
    filter_status: 'hold',
    official_original_text: '鹿の湯の日帰り入浴商品。花もみじ宿泊浴場は対象外。',
    official_source_url: 'https://shikanoyu.co.jp/shikanoyu/news/621',
    valid_until: volatileUntil,
  });

  add('yunokawa-yumeguri-butai', 'day_use', 'free-public-footbath', {
    scope_label_ko: '무료 공공 족욕',
    filter_value: { free: true, hours: '09:00-21:00' },
    official_original_text: '無料で誰でも利用できる屋根付き足湯。利用時間9:00～21:00。',
    official_source_url: 'https://www.hakobura.jp/spots/440',
    source_kind: 'tourism_association',
    valid_until: volatileUntil,
  });
  add('yunokawa-yumeguri-butai', 'late_night', 'free-public-footbath', {
    scope_label_ko: '밤 9시까지 이용하는 족욕',
    filter_value: { closes_at: '21:00' },
    official_original_text: '利用時間9:00～21:00。',
    official_source_url: 'https://www.hakobura.jp/spots/440',
    source_kind: 'tourism_association',
    valid_until: volatileUntil,
  });
  add('yunokawa-yumeguri-butai', 'station_walk_10m', 'tram-access', {
    scope_label_ko: '유노카와온천 정류장 도보 1분',
    filter_value: { walk_minutes: 1 },
    official_original_text: '函館市電「湯の川温泉」電停から徒歩1分。',
    official_source_url: 'https://www.hakobura.jp/spots/440',
    source_kind: 'tourism_association',
  });
  add('yunokawa-yumeguri-butai', 'barrier_free', 'footbath-access', {
    scope_label_ko: '휠체어 접근 경사로',
    official_original_text: '2023年11月の周辺整備で車いす利用者向けスロープを追加。',
    official_source_url: 'https://www.hakobura.jp/spots/440',
    source_kind: 'tourism_association',
  });
  add('yunokawa-yumeguri-butai', 'spring_chloride', 'footbath-water-profile', {
    scope_label_ko: '나트륨·칼슘-염화물천',
    official_original_text: '泉質 ナトリウム・カルシウム塩化物泉。',
    official_source_url: 'https://www.hakobura.jp/spots/440',
    source_kind: 'tourism_association',
  });

  add('yunokawa-tropical-footbath', 'day_use', 'botanical-garden-footbath', {
    scope_label_ko: '식물원 입장객 족욕',
    filter_value: { adult_garden_admission_jpy: 300 },
    official_original_text: '植物園の入園者が利用できる足湯。大人300円。',
    official_source_url: 'https://www.city.hakodate.hokkaido.jp/docs/2014022500149/',
    source_kind: 'municipal_official',
    valid_until: volatileUntil,
  });
  add('yunokawa-tropical-footbath', 'parking', 'botanical-garden-access', {
    scope_label_ko: '무료 주차장',
    filter_value: { spaces: 124, free: true },
    official_original_text: '無料駐車場124台。',
    official_source_url: 'https://www.hakobura.jp/spots/451',
    source_kind: 'tourism_association',
  });
  add('yunokawa-tropical-footbath', 'spring_chloride', 'footbath-water-profile', {
    scope_label_ko: '나트륨-염화물천',
    official_original_text: '泉質 ナトリウム－塩化物温泉。',
    official_source_url: 'https://www.hakobura.jp/spots/451',
    source_kind: 'tourism_association',
  });

  const yachigashiraSource = 'https://hakodate-kankou.com/spot/10239/';
  add('hakodate-yachigashira', 'day_use', 'facility-operation', {
    scope_label_ko: '독립 시민 온천 당일 이용',
    filter_value: { hours: '06:00-22:00', final_reception: '21:00' },
    official_original_text: '営業時間6:00～22:00、最終受付21:00。',
    official_source_url: yachigashiraSource,
    source_kind: 'tourism_association',
    valid_until: volatileUntil,
  });
  add('hakodate-yachigashira', 'morning_bath', 'facility-operation', {
    scope_label_ko: '오전 6시부터 이용',
    filter_value: { opens_at: '06:00' },
    official_original_text: '営業時間6:00～22:00。',
    official_source_url: yachigashiraSource,
    source_kind: 'tourism_association',
    valid_until: volatileUntil,
  });
  add('hakodate-yachigashira', 'adult_day_use_price', 'facility-admission', {
    scope_label_ko: '성인 당일입욕 요금',
    filter_value: { adult_jpy: 490 },
    official_original_text: '大人490円、小人150円、幼児70円、3歳未満無料。',
    official_source_url: yachigashiraSource,
    source_kind: 'tourism_association',
    valid_until: volatileUntil,
  });
  add('hakodate-yachigashira', 'open_air_bath', 'goryokaku-shaped-open-air-bath', {
    scope_label_ko: '오릉곽 모양 노천탕',
    official_original_text: '五稜郭の形状を模した露天風呂。',
    official_source_url: yachigashiraSource,
    source_kind: 'tourism_association',
  });
  add('hakodate-yachigashira', 'sauna', 'public-bath-products', {
    scope_label_ko: '공용 사우나',
    official_original_text: '高温・中温・気泡風呂の3種浴槽、露天風呂、サウナ。',
    official_source_url: yachigashiraSource,
    source_kind: 'tourism_association',
  });
  add('hakodate-yachigashira', 'rest_area', 'facility-rest-area', {
    scope_label_ko: '휴게 공간과 대형 로커',
    official_original_text: '休憩所、スーツケース用ロッカー、入浴セットの案内あり。',
    official_source_url: yachigashiraSource,
    source_kind: 'tourism_association',
  });
  add('hakodate-yachigashira', 'parking', 'facility-access', {
    scope_label_ko: '101대 주차장',
    filter_value: { spaces: 101 },
    official_original_text: '駐車場101台。',
    official_source_url: yachigashiraSource,
    source_kind: 'tourism_association',
  });
  add('hakodate-yachigashira', 'station_walk_10m', 'tram-access', {
    scope_label_ko: '야치가시라 정류장 도보 5분',
    filter_value: { walk_minutes: 5 },
    official_original_text: '函館市電 谷地頭電停から徒歩5分。',
    official_source_url: yachigashiraSource,
    source_kind: 'tourism_association',
  });
  add('hakodate-yachigashira', 'spring_chloride', 'official-spring-profile', {
    scope_label_ko: '염화물천',
    official_original_text: '泉質は塩化物泉、泉温は65.1℃。',
    official_source_url: yachigashiraSource,
    source_kind: 'tourism_association',
  });
  add('hakodate-yachigashira', 'spring_iron', 'official-spring-profile', {
    scope_label_ko: '철분이 많은 차갈색 온천수',
    official_original_text: '鉄分を多く含み茶褐色をしている湯が特徴的です。',
    official_source_url: yachigashiraSource,
    source_kind: 'tourism_association',
  });

  add('hakodate-minamikayabe-hoyou-center', 'day_use', 'split-child-public-bath', {
    scope_label_ko: '미나미카야베 보양센터 당일입욕',
    availability: 'conditional',
    filter_status: 'hold',
    official_original_text: '南かやべ保養センターをホテル函館ひろめ荘の宿泊浴場と分けて案内。',
    official_source_url: 'https://www.city.hakodate.hokkaido.jp/docs/2020013000086/',
    source_kind: 'municipal_official',
    valid_until: volatileUntil,
  });

  return facts;
}

function kantoAdditionalOfficialFilterFacts(mappingPaths) {
  const spotcheckPath = path.join(outputDir, 'kanto_tokyo_facility_additional_official_water_spotcheck_2026-07-10.csv');
  const facts = [
    officialFilterFact('kumagaya-hanayuspa', 'day_use', 'facility-wide-day-use', {
      scope_label_ko: '시설 당일입욕',
      official_original_text: '源泉100%掛け流しの日帰り温泉',
      official_source_url: 'https://hanayuspa.jp/',
    }, spotcheckPath),
    officialFilterFact('sugito-utano-yu', 'day_use', 'facility-wide-operation', {
      scope_label_ko: '시설 당일입욕',
      filter_value: { hours: '10:00-24:00', final_reception: '23:30' },
      official_original_text: '全日10：00～24：00（最終受付時間23：30）',
      official_source_url: 'https://utanoyu.com/about/businesshours_fee/',
      valid_until: '2026-08-10',
    }, mappingPaths.get('sugito-utano-yu')),
    officialFilterFact('sugito-utano-yu', 'open_air_bath', 'official-bath-scope', {
      scope_label_ko: '공용 노천탕',
      official_original_text: '全9種類ございます。源泉かけ流しの浴槽を露天と内湯にご用意',
      official_source_url: 'https://utanoyu.com/service/bath/',
    }, mappingPaths.get('sugito-utano-yu')),
    officialFilterFact('sugito-utano-yu', 'meal_service', 'official-meal-service', {
      scope_label_ko: '식사 공간',
      official_original_text: '満席になる時間帯もございます。順番にご案内',
      official_source_url: 'https://utanoyu.com/service/meal/',
      valid_until: '2026-08-10',
    }, mappingPaths.get('sugito-utano-yu')),
    officialFilterFact('tokyo-somei-onsen-sakura', 'day_use', 'facility-wide-operation', {
      scope_label_ko: '시설 당일입욕',
      filter_value: { hours: '10:00-23:00', final_reception: '22:30' },
      official_original_text: 'SAKURA営業時間 10:00～23:00 / 入館受付終了 22：30 / 最終浴室ご利用時間 22：50',
      official_source_url: 'https://tokyosomeionsensakura.com/plan/',
      valid_until: '2026-08-10',
    }, mappingPaths.get('tokyo-somei-onsen-sakura')),
    officialFilterFact('tokyo-somei-onsen-sakura', 'adult_day_use_price', 'day-use-admission', {
      scope_label_ko: '성인 당일입욕 요금',
      filter_value: { weekday_jpy: 2100, holiday_jpy: 2900 },
      official_original_text: '平日営業日 大人 2,100円 / 休日営業日 大人 2,900円',
      official_source_url: 'https://tokyosomeionsensakura.com/plan/',
      valid_until: '2026-08-10',
    }, mappingPaths.get('tokyo-somei-onsen-sakura')),
    officialFilterFact('tokyo-somei-onsen-sakura', 'open_air_bath', 'open-air-public-bath', {
      scope_label_ko: '공용 노천탕',
      official_original_text: '大空を見上げながら、琥珀色に輝く秘湯をご堪能下さい。',
      official_source_url: 'https://tokyosomeionsensakura.com/hot-spring/',
    }, mappingPaths.get('tokyo-somei-onsen-sakura')),
    officialFilterFact('tokyo-somei-onsen-sakura', 'parking', 'access-and-parking', {
      scope_label_ko: '주차장',
      filter_value: { spaces: 88, free_hours: 2 },
      official_original_text: '巣鴨駅からのシャトルバス案内、駐車場台数88台、全日2時間無料',
      official_source_url: 'https://tokyosomeionsensakura.com/access/',
      valid_until: '2026-08-10',
    }, mappingPaths.get('tokyo-somei-onsen-sakura')),
    officialFilterFact('tokyo-somei-onsen-sakura', 'shuttle', 'access-and-shuttle', {
      scope_label_ko: '스가모역 셔틀',
      official_original_text: '巣鴨駅からのシャトルバス案内、駐車場台数88台、全日2時間無料',
      official_source_url: 'https://tokyosomeionsensakura.com/access/',
      valid_until: '2026-08-10',
    }, mappingPaths.get('tokyo-somei-onsen-sakura')),
    officialFilterFact('tokyo-somei-onsen-sakura', 'spring_chloride', 'official-spring-profile', {
      scope_label_ko: '공식 온천 수질',
      official_original_text: '泉質：含ヨウ素-ナトリウム-塩化物強塩温泉（高張性／弱アルカリ性／高温泉）',
      official_source_url: 'https://tokyosomeionsensakura.com/hot-spring/',
    }, mappingPaths.get('tokyo-somei-onsen-sakura')),
    officialFilterFact('yunishigawa-mizunosato', 'day_use', 'facility-wide-day-use', {
      scope_label_ko: '시설 당일입욕',
      filter_value: { hours: '10:00-19:00', final_reception: '18:00' },
      official_original_text: '温泉 10:00〜19:00（最終受付18:00）',
      official_source_url: 'https://yunishigawa-mizunosato.jp/',
      valid_until: '2026-08-10',
    }, spotcheckPath),
  ];
  return facts;
}

function hakoneKanagawaYamanashiWaterFacts(mappings, mappingPaths, signalRowsBySlug) {
  const facts = [];
  const texture = (slug) => textureFilterState(signalRowsBySlug.get(slug) ?? []);

  {
    const slug = 'hakone-yuryo';
    const profile = mappings.get(slug).official_water_profile;
    facts.push(waterFact(slug, {
      facility_area: 'public_bath',
      scope_key: 'facility-representative-water-profile',
      scope_label_ko: '시설 대표 수질과 운용',
      water_system: 'junkan',
      kasui: 'present',
      kaon: 'present',
      disinfection: 'present',
      spring_types: [profile.quality],
      method_render_status: 'scope_split_required',
      official_original_text: profile.official_original_text,
      official_source_url: profile.official_source_url,
    }, mappingPaths.get(slug), texture(slug)));
  }

  {
    const slug = 'shonan-ryusenji';
    const profile = mappings.get(slug).official_water_profile;
    facts.push(waterFact(slug, {
      facility_area: 'open_air_public_bath',
      scope_key: 'natural-spring-baths',
      scope_label_ko: '천연온천 표기 욕조',
      spring_types: [],
      method_render_status: 'no_badge',
      official_original_text: profile.official_original_text,
      official_source_url: profile.official_source_url,
    }, mappingPaths.get(slug), texture(slug)));
  }

  {
    const slug = 'yokohama-aoba-kirari';
    const profiles = mappings.get(slug).official_water_profile;
    for (const profile of profiles) {
      facts.push(waterFact(slug, {
        facility_area: profile.facility_area,
        scope_key: profile.scope_key,
        scope_label_ko: profile.scope_key === 'source_bath' ? '원천탕' : '대나무숲탕',
        water_system: profile.water_system,
        kasui: profile.kasui === true ? 'present' : profile.kasui === false ? 'not_present' : 'unknown',
        kaon: profile.kaon === true ? 'present' : profile.kaon === false ? 'not_present' : 'unknown',
        disinfection: 'unknown',
        method_render_status: 'scope_split_required',
        official_original_text: profile.official_original_text,
        official_source_url: profile.official_source_url,
      }, mappingPaths.get(slug), profile.scope_key === 'source_bath' ? texture(slug) : { candidates: [], ready: [], status: 'not_eligible' }));
    }
  }

  {
    const slug = 'kawaguchiko-fujiyama-onsen';
    const profile = mappings.get(slug).official_water_profile;
    facts.push(waterFact(slug, {
      facility_area: 'public_bath',
      scope_key: 'natural-hot-spring-baths',
      scope_label_ko: '천연온천 공용탕',
      water_system: 'junkan',
      kasui: 'not_present',
      kaon: 'present',
      disinfection: 'present',
      spring_types: [profile.spring_quality_original],
      method_render_status: 'candidate_after_recheck',
      official_original_text: profile.official_original_text,
      official_source_url: profile.official_source_url,
    }, mappingPaths.get(slug), texture(slug)));
  }

  {
    const slug = 'kawaguchiko-yurari';
    const profile = mappings.get(slug).official_facts.water_profile;
    facts.push(waterFact(slug, {
      facility_area: 'public_bath',
      scope_key: 'common-bath-water-quality',
      scope_label_ko: '공용탕 수질',
      spring_types: [profile.spring_quality_original],
      method_render_status: 'no_badge',
      official_original_text: profile.official_original_text,
      official_source_url: profile.official_source_url,
    }, mappingPaths.get(slug), texture(slug)));
  }

  {
    const slug = 'yugawara-kogomenoyu';
    const profile = mappings.get(slug).official_water_profile;
    facts.push(waterFact(slug, {
      facility_area: 'public_bath',
      scope_key: 'facility-representative-water-quality',
      scope_label_ko: '시설 대표 수질',
      spring_types: ['나트륨·칼슘-염화물·황산염천'],
      method_render_status: 'no_badge',
      official_original_text: profile.official_original_text,
      official_source_url: profile.official_source_url,
    }, mappingPaths.get(slug), texture(slug)));
  }

  return facts;
}

function hakoneKanagawaYamanashiOfficialFilterFacts(mappingPaths) {
  return [
    officialFilterFact('hakone-yuryo', 'day_use', 'facility-wide-day-use', {
      scope_label_ko: '독립 당일입욕 시설',
      official_original_text: '独立日帰り温泉施設として公式サイトが案内し、宿泊スコープは使用しない',
      official_source_url: 'https://www.hakoneyuryo.jp/',
    }, mappingPaths.get('hakone-yuryo')),
    officialFilterFact('hakone-yuryo', 'open_air_bath', 'public-open-air-baths', {
      scope_label_ko: '공용 노천탕과 전망탕',
      official_original_text: '大浴場 本殿 湯楽庵 大湯: 内湯・露天風呂・信楽風呂・見晴湯・熱ノ室（サウナ）',
      official_source_url: 'https://www.hakoneyuryo.jp/price/',
    }, mappingPaths.get('hakone-yuryo')),
    officialFilterFact('hakone-yuryo', 'private_bath', 'private-open-air-baths', {
      scope_label_ko: '대절 개인 노천탕 19실',
      filter_value: { rooms: 19, minimum_minutes: 120 },
      official_original_text: '離れ湯屋 花伝: 19室、2名または4名定員の3タイプ、120分から、利用日の1か月前より電話予約',
      official_source_url: 'https://www.hakoneyuryo.jp/spa/private/',
    }, mappingPaths.get('hakone-yuryo')),
    officialFilterFact('hakone-yuryo', 'shuttle', 'hakone-yumoto-shuttle', {
      scope_label_ko: '하코네유모토역 무료 송영',
      official_original_text: '箱根湯本駅との無料送迎バスと駐車場を公式案内',
      official_source_url: 'https://www.hakoneyuryo.jp/access/',
    }, mappingPaths.get('hakone-yuryo')),
    officialFilterFact('shonan-ryusenji', 'open_air_bath', 'natural-spring-open-air-baths', {
      scope_label_ko: '천연온천 표기 노천탕',
      official_original_text: '富士見の岩湯（天然温泉）; 座り湯（天然温泉）',
      official_source_url: 'https://ryusenjinoyu.com/chigasaki/bath/',
    }, mappingPaths.get('shonan-ryusenji')),
    officialFilterFact('yokohama-aoba-kirari', 'open_air_bath', 'source-and-bamboo-open-air-baths', {
      scope_label_ko: '원천탕과 대나무숲탕',
      official_original_text: '源泉の湯：源泉加温かけ流し。竹林の湯：源泉加水加温循環。',
      official_source_url: 'https://www.yurakirari.com/aoba/spa/',
    }, mappingPaths.get('yokohama-aoba-kirari')),
    officialFilterFact('kawaguchiko-fujiyama-onsen', 'day_use', 'facility-operation-hold', {
      scope_label_ko: '임시휴업 재개 확인 필요',
      availability: 'conditional',
      filter_status: 'hold',
      official_original_text: '2026年6月26日の地震被害により臨時休業、営業再開日は未定',
      official_source_url: 'https://www.fujiyamaonsen.jp/',
      valid_until: '2026-07-18',
    }, mappingPaths.get('kawaguchiko-fujiyama-onsen')),
    officialFilterFact('kawaguchiko-yurari', 'open_air_bath', 'fuji-view-open-air-baths', {
      scope_label_ko: '후지산 조망 노천탕',
      filter_value: { bath_count: 16 },
      official_original_text: '湯舟の種類は全16種類 / 湯船に浸かりながら雄大な富士山を望む',
      official_source_url: 'https://www.fuji-yurari.jp/spa.html',
    }, mappingPaths.get('kawaguchiko-yurari')),
    officialFilterFact('kawaguchiko-yurari', 'shuttle', 'kawaguchiko-station-shuttle', {
      scope_label_ko: '가와구치코역 무료 송영',
      official_original_text: '河口湖駅から無料送迎、1時間前までの予約が必要',
      official_source_url: 'https://www.fuji-yurari.jp/access.html',
      valid_until: '2026-08-11',
    }, mappingPaths.get('kawaguchiko-yurari')),
    officialFilterFact('yugawara-kogomenoyu', 'day_use', 'facility-wide-day-use', {
      scope_label_ko: '유가와라 당일입욕 시설',
      official_original_text: '湯河原温泉 日帰り温泉 こごめの湯',
      official_source_url: 'https://kogomenoyu.com/',
    }, mappingPaths.get('yugawara-kogomenoyu')),
  ];
}

function tohokuWaterFacts(mappingPaths, signalRowsBySlug) {
  const texture = (slug) => textureFilterState(signalRowsBySlug.get(slug) ?? []);
  return [
    waterFact('asamushi-yu-sa-asamushi', {
      facility_area: 'public_bath',
      scope_key: 'observation-bath-hadakayu',
      scope_label_ko: '5층 전망욕장 하다카유',
      spring_types: [],
      method_render_status: 'no_badge',
      official_original_text: '展望浴場「はだか湯」 7:00～21:00（最終受付20:30）',
      official_source_url: 'https://www.yu-sa.jp/',
    }, mappingPaths.get('asamushi-yu-sa-asamushi'), texture('asamushi-yu-sa-asamushi')),
    waterFact('kaminoyama-shimo-oyu', {
      facility_area: 'public_bath',
      scope_key: 'hot-and-warm-public-baths',
      scope_label_ko: '열탕·온탕 공동욕장',
      spring_types: [],
      method_render_status: 'no_badge',
      official_original_text: 'あつゆ・ぬるゆ',
      official_source_url: 'https://kaminoyama-spa.com/news/spa/2310.html',
    }, mappingPaths.get('kaminoyama-shimo-oyu'), texture('kaminoyama-shimo-oyu')),
    waterFact('zao-shinzaemon-no-yu', {
      facility_area: 'open_air_public_bath',
      scope_key: 'mogami-takayu-open-air-baths',
      scope_label_ko: '모가미 다카유 노천탕',
      spring_types: ['강산성 유황천'],
      method_render_status: 'no_badge',
      official_original_text: '源泉100％のもがみ高湯 / 強酸性の硫黄泉',
      official_source_url: 'https://zaospa.co.jp/',
    }, mappingPaths.get('zao-shinzaemon-no-yu'), texture('zao-shinzaemon-no-yu')),
    waterFact('iizaka-sabako-yu', {
      facility_area: 'public_bath',
      scope_key: 'public-bath-spring-profile',
      scope_label_ko: '공동욕장 공식 수질',
      spring_types: ['알칼리성 저삼투압 온천'],
      method_render_status: 'no_badge',
      official_original_text: '源泉名 湯沢分湯槽 / 泉温 51.0℃ / pH 8.6',
      official_source_url: 'https://iizaka.com/spa/',
    }, mappingPaths.get('iizaka-sabako-yu'), texture('iizaka-sabako-yu')),
    waterFact('iizaka-horikiri-yu', {
      facility_area: 'public_bath',
      scope_key: 'public-bath-spring-profile',
      scope_label_ko: '공동욕장 공식 수질',
      spring_types: ['알칼리성 저삼투압 온천'],
      method_render_status: 'no_badge',
      official_original_text: '波来湯分湯槽 / アルカリ性低張性温泉 / 泉温 48.8℃ / pH 8.6',
      official_source_url: 'https://iizaka.com/spa/',
    }, mappingPaths.get('iizaka-horikiri-yu'), texture('iizaka-horikiri-yu')),
  ];
}

function tohokuOfficialFilterFacts(mappingPaths) {
  return [
    officialFilterFact('asamushi-yu-sa-asamushi', 'day_use', 'observation-bath-operation', {
      scope_label_ko: '5층 전망욕장 당일입욕',
      filter_value: { hours: '07:00-21:00', final_reception: '20:30' },
      official_original_text: '展望浴場「はだか湯」 7:00～21:00（最終受付20:30）',
      official_source_url: 'https://www.yu-sa.jp/',
      valid_until: '2026-08-11',
    }, mappingPaths.get('asamushi-yu-sa-asamushi')),
    officialFilterFact('asamushi-yu-sa-asamushi', 'adult_day_use_price', 'observation-bath-admission', {
      scope_label_ko: '성인 당일입욕 요금',
      filter_value: { adult_jpy: 360 },
      official_original_text: '大人 360円',
      official_source_url: 'https://www.yu-sa.jp/',
      valid_until: '2026-08-11',
    }, mappingPaths.get('asamushi-yu-sa-asamushi')),
    officialFilterFact('asamushi-yu-sa-asamushi', 'ocean_view', 'observation-bath-view', {
      scope_label_ko: '무쓰만·유노시마 전망욕장',
      official_original_text: '5階展望浴場から陸奥湾や「湯の島」を眺望',
      official_source_url: 'https://www.yu-sa.jp/',
    }, mappingPaths.get('asamushi-yu-sa-asamushi')),
    officialFilterFact('kaminoyama-shimo-oyu', 'day_use', 'public-bath-operation', {
      scope_label_ko: '공동욕장 당일입욕',
      filter_value: { hours: '06:00-22:00', final_reception: '21:30' },
      official_original_text: '6:00～22:00（最終入館21:30）',
      official_source_url: 'https://kaminoyama-spa.com/news/spa/2310.html',
      source_kind: 'tourism_association',
      valid_until: '2026-08-11',
    }, mappingPaths.get('kaminoyama-shimo-oyu')),
    officialFilterFact('kaminoyama-shimo-oyu', 'adult_day_use_price', 'public-bath-admission', {
      scope_label_ko: '성인 당일입욕 요금',
      filter_value: { adult_jpy: 150, hair_wash_jpy: 100 },
      official_original_text: '大人150円・洗髪料100円',
      official_source_url: 'https://kaminoyama-spa.com/news/spa/2310.html',
      source_kind: 'tourism_association',
      valid_until: '2026-08-11',
    }, mappingPaths.get('kaminoyama-shimo-oyu')),
    officialFilterFact('zao-shinzaemon-no-yu', 'day_use', 'facility-operation', {
      scope_label_ko: '시설 당일입욕',
      filter_value: { hours: '10:00-18:00', final_reception: '17:30' },
      official_original_text: '10:00～18:00（最終受付17:30）',
      official_source_url: 'https://zaospa.co.jp/',
      valid_until: '2026-08-11',
    }, mappingPaths.get('zao-shinzaemon-no-yu')),
    officialFilterFact('zao-shinzaemon-no-yu', 'open_air_bath', 'mogami-takayu-open-air-baths', {
      scope_label_ko: '모가미 다카유 노천탕',
      official_original_text: '露天風呂 もがみ高湯・四・六の湯・かめ湯',
      official_source_url: 'https://zaospa.co.jp/',
    }, mappingPaths.get('zao-shinzaemon-no-yu')),
    officialFilterFact('zao-shinzaemon-no-yu', 'rest_area', 'free-tatami-rest-area', {
      scope_label_ko: '무료 다다미 휴게실',
      official_original_text: '無料休憩室',
      official_source_url: 'https://zaospa.co.jp/',
    }, mappingPaths.get('zao-shinzaemon-no-yu')),
    officialFilterFact('iizaka-horikiri-yu', 'day_use', 'public-bath-operation', {
      scope_label_ko: '공동욕장 당일입욕',
      filter_value: { hours: '06:00-21:00', final_reception: '20:40' },
      official_original_text: '6:00～21:00（最終入館20:40）',
      official_source_url: 'https://iizaka.com/spa/',
      source_kind: 'tourism_association',
      valid_until: '2026-08-11',
    }, mappingPaths.get('iizaka-horikiri-yu')),
    officialFilterFact('iizaka-horikiri-yu', 'adult_day_use_price', 'public-bath-admission', {
      scope_label_ko: '성인 당일입욕 요금',
      filter_value: { adult_jpy: 500 },
      official_original_text: '大人500円',
      official_source_url: 'https://iizaka.com/spa/',
      source_kind: 'tourism_association',
      valid_until: '2026-08-11',
    }, mappingPaths.get('iizaka-horikiri-yu')),
    officialFilterFact('iizaka-horikiri-yu', 'station_walk_10m', 'iizaka-onsen-station-access', {
      scope_label_ko: '이이자카온천역 도보 접근',
      official_original_text: '飯坂温泉駅から徒歩約2分',
      official_source_url: 'https://iizaka-onsen.fckk.co.jp/onnsen-guide/hakoyu/',
    }, mappingPaths.get('iizaka-horikiri-yu')),
    officialFilterFact('iizaka-sabako-yu', 'day_use', 'public-bath-operation', {
      scope_label_ko: '공동욕장 당일입욕',
      filter_value: { hours: '06:00-21:00', final_reception: '20:40' },
      official_original_text: '6:00～21:00（最終入館20:40）',
      official_source_url: 'https://iizaka.com/spa/',
      source_kind: 'tourism_association',
      valid_until: '2026-08-11',
    }, mappingPaths.get('iizaka-sabako-yu')),
    officialFilterFact('iizaka-sabako-yu', 'adult_day_use_price', 'public-bath-admission', {
      scope_label_ko: '성인 당일입욕 요금',
      filter_value: { adult_jpy: 400 },
      official_original_text: '大人400円',
      official_source_url: 'https://iizaka.com/spa/',
      source_kind: 'tourism_association',
      valid_until: '2026-08-11',
    }, mappingPaths.get('iizaka-sabako-yu')),
  ];
}

function izuShizuokaWaterFacts(mappingPaths, signalRowsBySlug) {
  const texture = (slug) => textureFilterState(signalRowsBySlug.get(slug) ?? []);
  return [
    waterFact('atami-fuua', {
      facility_area: 'open_air_public_bath',
      scope_key: 'kakenagashi-open-air-bath',
      scope_label_ko: '가케나가시 노천탕',
      water_system: 'kakenagashi',
      method_render_status: 'scope_split_required',
      official_original_text: '露天立ち湯、かけ流し露天湯',
      official_source_url: 'https://www.atamibayresort.com/fuua/faq/',
    }, mappingPaths.get('atami-fuua'), texture('atami-fuua')),
    waterFact('ito-tokaikan', {
      facility_area: 'public_bath',
      scope_key: 'weekend-holiday-bath-product',
      scope_label_ko: '주말·공휴일 입욕 상품',
      water_system: 'kakenagashi',
      method_render_status: 'scope_split_required',
      official_original_text: '土、日、祝日には旅館内の源泉かけ流しのお風呂が利用できます。',
      official_source_url: 'https://itospa.com/feature/detail_12.html',
    }, mappingPaths.get('ito-tokaikan'), texture('ito-tokaikan')),
    waterFact('ito-marine-town-seaside-spa', {
      facility_area: 'public_bath',
      scope_key: 'combined-source-flow-and-circulation',
      scope_label_ko: '시설 대표 혼합 운용',
      spring_types: ['칼슘·나트륨-염화물·황산염천'],
      method_render_status: 'hold',
      official_original_text: 'かけ流し・保温循環併用式',
      official_source_url: 'https://ito-marinetown.co.jp/seasidespa/aboutspa/',
    }, mappingPaths.get('ito-marine-town-seaside-spa'), texture('ito-marine-town-seaside-spa')),
    waterFact('ito-hokkawa-kuroane', {
      facility_area: 'open_air_public_bath',
      scope_key: 'wave-side-open-air-bath',
      scope_label_ko: '파도 가까이의 노천탕',
      water_system: 'kakenagashi',
      method_render_status: 'ready',
      official_original_text: '海と同じ目線で掛け流しの温泉を楽しめる波打ち際の露天風呂です。',
      official_source_url: 'https://www.town.higashiizu.lg.jp/soshiki/kanko_sangyoka/1/2/5/769.html',
    }, mappingPaths.get('ito-hokkawa-kuroane'), texture('ito-hokkawa-kuroane')),
    waterFact('izu-nagaoka-kobonoyu-nagaoka', {
      facility_area: 'public_bath',
      scope_key: 'radium-hot-spring-product-label',
      scope_label_ko: '라듐 온천 상품 표기',
      water_system: 'kakenagashi',
      method_render_status: 'candidate_after_recheck',
      official_original_text: 'かけ流しのラジウム温泉',
      official_source_url: 'https://koubounoyu.jp/nagaoka/',
    }, mappingPaths.get('izu-nagaoka-kobonoyu-nagaoka'), texture('izu-nagaoka-kobonoyu-nagaoka')),
    waterFact('izu-nagaoka-kobonoyu-honten', {
      facility_area: 'public_bath',
      scope_key: 'radium-bath-spout',
      scope_label_ko: '라듐 온천 토출구',
      water_system: 'kakenagashi',
      method_render_status: 'scope_split_required',
      official_original_text: '吐湯口から出ているお湯はかけ流し',
      official_source_url: 'https://koubounoyu.jp/honten/spa/index.html',
    }, mappingPaths.get('izu-nagaoka-kobonoyu-honten'), texture('izu-nagaoka-kobonoyu-honten')),
  ];
}

function izuShizuokaOfficialFilterFacts(mappingPaths) {
  const volatileUntil = '2026-08-11';
  return [
    officialFilterFact('atami-fuua', 'day_use', 'fuua-walk-in-admission', {
      scope_label_ko: '후아 당일입장',
      official_original_text: 'ご予約は承っておりません。直接ご来館くださいませ。',
      official_source_url: 'https://www.atamibayresort.com/fuua/faq/',
      valid_until: volatileUntil,
    }, mappingPaths.get('atami-fuua')),
    officialFilterFact('atami-fuua', 'open_air_bath', 'standing-and-source-flow-open-air-baths', {
      scope_label_ko: '전망 입식 노천탕·가케나가시 노천탕',
      official_original_text: '露天立ち湯、かけ流し露天湯',
      official_source_url: 'https://www.atamibayresort.com/fuua/facilities/',
    }, mappingPaths.get('atami-fuua')),
    officialFilterFact('atami-fuua', 'stone_sauna', 'stone-sauna-area', {
      scope_label_ko: '암반욕 구역',
      official_original_text: '岩盤浴',
      official_source_url: 'https://www.atamibayresort.com/fuua/facilities/',
    }, mappingPaths.get('atami-fuua')),
    officialFilterFact('atami-fuua', 'rest_area', 'atami-living-lounges', {
      scope_label_ko: '아타미 리빙 라운지',
      filter_value: { lounge_types: 8 },
      official_original_text: '8つの異なるラウンジ「アタミリビング」',
      official_source_url: 'https://www.atamibayresort.com/fuua/facilities/',
    }, mappingPaths.get('atami-fuua')),
    officialFilterFact('atami-fuua', 'ocean_view', 'sagami-bay-bath-view', {
      scope_label_ko: '사가미만 전망욕장',
      official_original_text: '相模灘を一望する露天立ち湯',
      official_source_url: 'https://www.atamibayresort.com/fuua/facilities/',
    }, mappingPaths.get('atami-fuua')),
    officialFilterFact('atami-marinespa', 'day_use', 'public-hot-spring-bath', {
      scope_label_ko: '온천욕장 당일이용',
      official_original_text: '温泉浴場・健康温浴室',
      official_source_url: 'https://www.city.atami.lg.jp/kanko/kankoshisetsu/1001832/1001838.html',
      source_kind: 'municipal_official',
      valid_until: volatileUntil,
    }, mappingPaths.get('atami-marinespa')),
    officialFilterFact('atami-ekimae-onsen', 'day_use', 'municipal-communal-bath-listing', {
      scope_label_ko: '아타미 공동욕장 당일입욕',
      official_original_text: '熱海駅前温泉浴場（田原浴場）',
      official_source_url: 'https://www.city.atami.lg.jp/kanko/onsen/1001821.html',
      source_kind: 'municipal_official',
      valid_until: volatileUntil,
    }, mappingPaths.get('atami-ekimae-onsen')),
    officialFilterFact('atami-yamadayu', 'day_use', 'municipal-communal-bath-listing', {
      scope_label_ko: '아타미 공동욕장 당일입욕',
      official_original_text: '山田湯（共同浴場）',
      official_source_url: 'https://www.city.atami.lg.jp/kanko/onsen/1001821.html',
      source_kind: 'municipal_official',
      valid_until: volatileUntil,
    }, mappingPaths.get('atami-yamadayu')),
    officialFilterFact('ito-tokaikan', 'day_use', 'weekend-holiday-bath-product', {
      scope_label_ko: '주말·공휴일 입욕',
      availability: 'conditional',
      filter_value: { days: ['saturday', 'sunday', 'holiday'], hours: '11:00-19:00' },
      official_original_text: '土、日、祝日には旅館内のお風呂が利用できます。',
      official_source_url: 'https://itospa.com/feature/detail_12.html',
      source_kind: 'tourism_association',
      valid_until: volatileUntil,
    }, mappingPaths.get('ito-tokaikan')),
    officialFilterFact('ito-tokaikan', 'adult_day_use_price', 'bath-admission', {
      scope_label_ko: '성인 입욕 요금',
      filter_value: { adult_jpy: 500 },
      official_original_text: '2026年4月1日より 入浴 大人500円',
      official_source_url: 'https://itospa.com/spa/detail_54227.html',
      source_kind: 'tourism_association',
      valid_until: volatileUntil,
    }, mappingPaths.get('ito-tokaikan')),
    officialFilterFact('ito-tokaikan', 'station_walk_10m', 'ito-station-access', {
      scope_label_ko: '이토역 도보 접근',
      filter_value: { walking_minutes: 7 },
      official_original_text: 'JR伊東駅から徒歩約7分',
      official_source_url: 'https://itospa.com/spot/detail_54002.html',
      source_kind: 'tourism_association',
    }, mappingPaths.get('ito-tokaikan')),
    officialFilterFact('ito-marine-town-seaside-spa', 'day_use', 'spa-operation', {
      scope_label_ko: '시사이드스파 당일입욕',
      filter_value: { hours: '05:00-21:00', final_reception: '20:30' },
      official_original_text: '温泉営業時間 5:00～21:00、最終受付20:30',
      official_source_url: 'https://ito-marinetown.co.jp/seasidespa/',
      valid_until: volatileUntil,
    }, mappingPaths.get('ito-marine-town-seaside-spa')),
    officialFilterFact('ito-marine-town-seaside-spa', 'morning_bath', 'early-morning-bath', {
      scope_label_ko: '오전 5시 입욕',
      filter_value: { opens_at: '05:00' },
      official_original_text: '温泉営業時間 5:00～21:00',
      official_source_url: 'https://ito-marinetown.co.jp/seasidespa/',
      valid_until: volatileUntil,
    }, mappingPaths.get('ito-marine-town-seaside-spa')),
    officialFilterFact('ito-marine-town-seaside-spa', 'open_air_bath', 'public-open-air-bath', {
      scope_label_ko: '공용 노천탕',
      official_original_text: '露天風呂',
      official_source_url: 'https://ito-marinetown.co.jp/seasidespa/',
    }, mappingPaths.get('ito-marine-town-seaside-spa')),
    officialFilterFact('ito-marine-town-seaside-spa', 'private_bath', 'reservable-private-bath', {
      scope_label_ko: '예약제 대절탕',
      filter_value: { hours: '10:00-20:00', final_reception: '18:00', daily_groups: 3 },
      official_original_text: '貸切風呂10:00～20:00、最終受付18:00、1日3組限定',
      official_source_url: 'https://ito-marinetown.co.jp/seasidespa/',
      valid_until: volatileUntil,
    }, mappingPaths.get('ito-marine-town-seaside-spa')),
    officialFilterFact('ito-marine-town-seaside-spa', 'ocean_view', 'seaside-bath-view', {
      scope_label_ko: '바다 전망욕장',
      official_original_text: '海を眺めながら入る天然温泉',
      official_source_url: 'https://ito-marinetown.co.jp/seasidespa/',
    }, mappingPaths.get('ito-marine-town-seaside-spa')),
    officialFilterFact('ito-akazawa-day-spa', 'day_use', 'day-spa-operation', {
      scope_label_ko: '당일온천관 입욕',
      filter_value: { hours: '10:00-22:00', final_reception: '21:00' },
      official_original_text: '営業時間 10:00～22:00（最終入館21:00）',
      official_source_url: 'https://www.izuakazawa.jp/hours/',
      valid_until: volatileUntil,
    }, mappingPaths.get('ito-akazawa-day-spa')),
    officialFilterFact('ito-akazawa-day-spa', 'open_air_bath', 'pacific-open-air-bath', {
      scope_label_ko: '태평양 전망 대노천탕',
      official_original_text: '太平洋を一望できる大露天風呂',
      official_source_url: 'https://www.izuakazawa.jp/spa-health/higaeri-onsen/',
    }, mappingPaths.get('ito-akazawa-day-spa')),
    officialFilterFact('ito-akazawa-day-spa', 'sauna', 'two-saunas', {
      scope_label_ko: '사우나 2종',
      filter_value: { sauna_count: 2 },
      official_original_text: '2種類のサウナ',
      official_source_url: 'https://www.izuakazawa.jp/spa-health/higaeri-onsen/',
    }, mappingPaths.get('ito-akazawa-day-spa')),
    officialFilterFact('ito-akazawa-day-spa', 'rest_area', 'day-spa-rest-area', {
      scope_label_ko: '온천관 휴게 공간',
      official_original_text: '海のねころびラウンジ・休憩スペース',
      official_source_url: 'https://www.izuakazawa.jp/spa-health/higaeri-onsen/',
    }, mappingPaths.get('ito-akazawa-day-spa')),
    officialFilterFact('ito-akazawa-day-spa', 'ocean_view', 'pacific-bath-view', {
      scope_label_ko: '태평양 전망욕장',
      official_original_text: '太平洋を一望できる大露天風呂',
      official_source_url: 'https://www.izuakazawa.jp/spa-health/higaeri-onsen/',
    }, mappingPaths.get('ito-akazawa-day-spa')),
    officialFilterFact('ito-akazawa-day-spa', 'adult_day_use_price', 'standard-admission', {
      scope_label_ko: '성인 기본 입욕 요금',
      filter_value: { weekday_jpy: 1400, holiday_jpy: 1700 },
      official_original_text: '大人 平日1,400円 / 土日祝1,700円',
      official_source_url: 'https://www.izuakazawa.jp/hours/',
      valid_until: volatileUntil,
    }, mappingPaths.get('ito-akazawa-day-spa')),
    officialFilterFact('ito-hokkawa-kuroane', 'day_use', 'facility-operation', {
      scope_label_ko: '해안 노천탕 당일입욕',
      filter_value: { hours: '10:00-18:00', final_reception: '17:45' },
      official_original_text: '営業時間10:00～18:00（最終入場17:45）',
      official_source_url: 'https://www.hokkawa-onsen.com/kurone',
      valid_until: volatileUntil,
    }, mappingPaths.get('ito-hokkawa-kuroane')),
    officialFilterFact('ito-hokkawa-kuroane', 'open_air_bath', 'wave-side-open-air-bath', {
      scope_label_ko: '파도 가까이의 노천탕',
      official_original_text: '海と同じ目線で掛け流しの温泉を楽しめる波打ち際の露天風呂',
      official_source_url: 'https://www.town.higashiizu.lg.jp/soshiki/kanko_sangyoka/1/2/5/769.html',
      source_kind: 'municipal_official',
    }, mappingPaths.get('ito-hokkawa-kuroane')),
    officialFilterFact('ito-hokkawa-kuroane', 'ocean_view', 'wave-side-view', {
      scope_label_ko: '바다 수평선 높이의 노천탕',
      official_original_text: '海と同じ目線で楽しめる波打ち際の露天風呂',
      official_source_url: 'https://www.town.higashiizu.lg.jp/soshiki/kanko_sangyoka/1/2/5/769.html',
      source_kind: 'municipal_official',
    }, mappingPaths.get('ito-hokkawa-kuroane')),
    officialFilterFact('ito-hokkawa-kuroane', 'adult_day_use_price', 'admission', {
      scope_label_ko: '성인 입욕 요금',
      filter_value: { adult_jpy: 700, payment: ['cash', 'paypay'] },
      official_original_text: '入浴料700円、PayPay利用可',
      official_source_url: 'https://www.hokkawa-onsen.com/kurone',
      valid_until: volatileUntil,
    }, mappingPaths.get('ito-hokkawa-kuroane')),
    officialFilterFact('ito-izu-kogen-taiyokan', 'day_use', 'facility-operation', {
      scope_label_ko: '당일입욕 시설',
      filter_value: { hours: '10:00-24:00', final_reception: '23:00' },
      official_original_text: '営業時間10:00～24:00（最終入館23:00）',
      official_source_url: 'https://www.suiransou.com/',
      valid_until: volatileUntil,
    }, mappingPaths.get('ito-izu-kogen-taiyokan')),
    officialFilterFact('ito-izu-kogen-taiyokan', 'open_air_bath', 'open-air-public-bath', {
      scope_label_ko: '야외 노천탕',
      official_original_text: '野天風呂',
      official_source_url: 'https://www.suiransou.com/',
    }, mappingPaths.get('ito-izu-kogen-taiyokan')),
    officialFilterFact('ito-izu-kogen-taiyokan', 'rest_area', 'large-rest-area', {
      scope_label_ko: '대광장 휴게 공간',
      filter_value: { manga_books_approx: 6000 },
      official_original_text: '大広間・約6,000冊の漫画・ハンモック',
      official_source_url: 'https://itospa.com/spa/detail_52004.html',
      source_kind: 'tourism_association',
    }, mappingPaths.get('ito-izu-kogen-taiyokan')),
    officialFilterFact('ito-izu-kogen-taiyokan', 'parking', 'facility-parking', {
      scope_label_ko: '무료 주차장',
      filter_value: { spaces: 80 },
      official_original_text: '無料駐車場80台',
      official_source_url: 'https://itospa.com/spa/detail_52004.html',
      source_kind: 'tourism_association',
    }, mappingPaths.get('ito-izu-kogen-taiyokan')),
    officialFilterFact('ito-izu-kogen-taiyokan', 'station_walk_10m', 'izu-kogen-station-access', {
      scope_label_ko: '이즈코겐역 도보 접근',
      filter_value: { walking_minutes: 5 },
      official_original_text: '伊豆高原駅から徒歩5分',
      official_source_url: 'https://www.suiransou.com/',
    }, mappingPaths.get('ito-izu-kogen-taiyokan')),
    officialFilterFact('izu-nagaoka-kobonoyu-nagaoka', 'day_use', 'day-use-admission', {
      scope_label_ko: '나가오카점 당일입욕',
      official_original_text: '日帰り入浴料金 / 6時～16時入館 / 16時～22時入館',
      official_source_url: 'https://koubounoyu.jp/nagaoka/plans/index.html',
      valid_until: volatileUntil,
    }, mappingPaths.get('izu-nagaoka-kobonoyu-nagaoka')),
    officialFilterFact('izu-nagaoka-kobonoyu-nagaoka', 'stone_sauna', 'bedrock-bath', {
      scope_label_ko: '약석 암반욕',
      official_original_text: '岩盤浴',
      official_source_url: 'https://koubounoyu.jp/nagaoka/relaxation/facilities.html',
    }, mappingPaths.get('izu-nagaoka-kobonoyu-nagaoka')),
    officialFilterFact('izu-nagaoka-kobonoyu-nagaoka', 'private_sauna', 'reservable-private-sauna', {
      scope_label_ko: '예약제 개인 사우나',
      official_original_text: 'プライベートサウナ（予約制）',
      official_source_url: 'https://koubounoyu.jp/nagaoka/relaxation/facilities.html',
      valid_until: volatileUntil,
    }, mappingPaths.get('izu-nagaoka-kobonoyu-nagaoka')),
    officialFilterFact('izu-nagaoka-kobonoyu-nagaoka', 'adult_day_use_price', 'day-use-price-bands', {
      scope_label_ko: '성인 당일입욕 시간대별 요금',
      filter_value: { early_weekday_jpy: 1900, early_holiday_jpy: 2200, late_weekday_jpy: 1400, late_holiday_jpy: 1500 },
      official_original_text: '6時～16時入館 平日大人1,900円・土日祝2,200円 / 16時～22時入館 平日1,400円・土日祝1,500円',
      official_source_url: 'https://koubounoyu.jp/nagaoka/plans/index.html',
      valid_until: volatileUntil,
    }, mappingPaths.get('izu-nagaoka-kobonoyu-nagaoka')),
    officialFilterFact('izu-nagaoka-kobonoyu-honten', 'day_use', 'day-use-operation', {
      scope_label_ko: '본점 당일입욕',
      filter_value: { hours: '08:00-23:00' },
      official_original_text: '日帰り 8:00～23:00',
      official_source_url: 'https://koubounoyu.jp/honten/',
      valid_until: volatileUntil,
    }, mappingPaths.get('izu-nagaoka-kobonoyu-honten')),
    officialFilterFact('izu-nagaoka-kobonoyu-honten', 'open_air_bath', 'public-open-air-bath', {
      scope_label_ko: '공용 노천탕',
      official_original_text: '露天風呂',
      official_source_url: 'https://koubounoyu.jp/honten/spa/index.html',
    }, mappingPaths.get('izu-nagaoka-kobonoyu-honten')),
    officialFilterFact('izu-nagaoka-kobonoyu-honten', 'stone_sauna', 'medicinal-stone-bedrock-bath', {
      scope_label_ko: '약석 암반욕',
      official_original_text: '薬石岩盤浴',
      official_source_url: 'https://koubounoyu.jp/honten/spa/index.html',
    }, mappingPaths.get('izu-nagaoka-kobonoyu-honten')),
    officialFilterFact('izu-nagaoka-kobonoyu-honten', 'steam_bath', 'mist-sauna', {
      scope_label_ko: '미스트 사우나',
      official_original_text: 'ミストサウナ',
      official_source_url: 'https://koubounoyu.jp/honten/spa/index.html',
    }, mappingPaths.get('izu-nagaoka-kobonoyu-honten')),
  ];
}

function chubuTextureState(slug, allowedCodes, signalRowsBySlug) {
  const state = textureFilterState(signalRowsBySlug.get(slug) ?? []);
  const allowed = new Set(allowedCodes);
  const candidates = state.candidates.filter((code) => allowed.has(code));
  const ready = state.ready.filter((code) => allowed.has(code));
  return {
    candidates,
    ready,
    status: ready.length > 0 ? 'ready_with_review_count' : 'not_eligible',
  };
}

function chubuHokurikuKoshinWaterFacts(mappingPaths, signalRowsBySlug) {
  const texture = (slug, codes = []) => chubuTextureState(slug, codes, signalRowsBySlug);
  return [
    waterFact('gero-kua-garden', {
      facility_area: 'open_air_public_bath',
      scope_key: 'open-air-public-bath-water-profile',
      scope_label_ko: '노천 공용탕 수질',
      spring_types: ['알칼리성 단순온천 pH 9.1'],
      official_original_text: '下呂温泉は12の源泉から湧出した温泉を混合の上、各施設へ適温にて共有。／泉質 アルカリ性単純泉［PH9.1］',
      official_source_url: 'https://gero-onsen.com/kua-garden-rotenburo/',
    }, mappingPaths.get('gero-kua-garden'), texture('gero-kua-garden', ['slippery'])),
    waterFact('gero-shirasagi', {
      facility_area: 'public_bath',
      scope_key: 'public-bath-water-profile',
      scope_label_ko: '실내 공동탕 수질',
      spring_types: ['알칼리성 단순온천 pH 9.1'],
      official_original_text: '下呂温泉は12の源泉から湧出した温泉を混合の上、各施設へ適温にて共有。／泉質 アルカリ性単純泉［PH9.1］',
      official_source_url: 'https://gero-onsen.com/shirasagi-no-yu/',
    }, mappingPaths.get('gero-shirasagi'), texture('gero-shirasagi', ['slippery'])),
    waterFact('gero-sachinoyu', {
      facility_area: 'public_bath',
      scope_key: 'dayuse-public-bath-water-profile',
      scope_label_ko: '당일입욕 공용탕 수질',
      spring_types: ['알칼리성 단순온천'],
      water_color: 'clear',
      official_original_text: '無色透明のアルカリ性単純泉は刺激性がなくやわらかなお湯で、湯上がり肌がツルツルになる美人の湯。',
      official_source_url: 'https://gero-sachinoyu.com/spa/',
    }, mappingPaths.get('gero-sachinoyu'), texture('gero-sachinoyu', ['slippery'])),
    waterFact('awara-saintpia', {
      facility_area: 'public_bath',
      scope_key: 'facility-wide-public-bath-method',
      scope_label_ko: '덴노유·치노유 공용탕',
      water_system: 'junkan',
      kasui: 'present',
      kaon: 'present',
      disinfection: 'present',
      spring_types: ['칼슘·나트륨-염화물천'],
      method_render_status: 'ready',
      official_original_text: '温泉法に基づく表示 加水：あり／加温：あり／循環：あり／入浴剤の添加：なし／消毒処理：あり',
      official_source_url: 'https://awara.info/cat-stay/%EF%BC%88%E6%97%A5%E5%B8%B0%E3%82%8A%E5%85%A5%E6%B5%B4%E6%96%BD%E8%A8%AD%EF%BC%89%E3%80%80%E3%82%BB%E3%83%B3%E3%83%88%E3%83%94%E3%82%A2%E3%81%82%E3%82%8F%E3%82%89',
    }, mappingPaths.get('awara-saintpia'), texture('awara-saintpia', ['salt_warmth'])),
    waterFact('nozawa-oyu', {
      facility_area: 'public_bath',
      scope_key: 'oyu-public-bath-water-profile',
      scope_label_ko: '오유 공동탕',
      water_system: 'kakenagashi',
      spring_types: ['단순 유황천'],
      method_render_status: 'ready',
      official_original_text: '良質な天然温泉100%かけ流しで、生きた温泉を堪能できます。／泉質 単純硫黄泉',
      official_source_url: 'https://nozawakanko.jp/hotspring/',
    }, mappingPaths.get('nozawa-oyu'), texture('nozawa-oyu', ['sulfur'])),
    waterFact('yudanaka-kaede-no-yu', {
      facility_area: 'public_bath',
      scope_key: 'dayuse-public-bath-method',
      scope_label_ko: '당일입욕 공용탕',
      water_system: 'kakenagashi',
      method_render_status: 'ready',
      official_original_text: '湯田中駅前にある日帰りの天然温泉かけ流しを楽しめる温泉施設。',
      official_source_url: 'https://www.info-yamanouchi.net/about/kaede/',
    }, mappingPaths.get('yudanaka-kaede-no-yu'), texture('yudanaka-kaede-no-yu')),
    waterFact('bessho-ishiyu', {
      facility_area: 'public_bath',
      scope_key: 'ishiyu-public-bath-combined-method',
      scope_label_ko: '이시유 공동탕',
      method_render_status: 'no_badge',
      official_original_text: '源 泉：4号源泉（源泉かけ流し＋循環ろ過）',
      official_source_url: 'https://www.bessho-spa.jp/sight/spa.html',
    }, mappingPaths.get('bessho-ishiyu'), texture('bessho-ishiyu')),
    waterFact('bessho-otsukai-yu', {
      facility_area: 'public_bath',
      scope_key: 'daishiyu-public-bath-method',
      scope_label_ko: '다이시유 공동탕',
      water_system: 'kakenagashi',
      method_render_status: 'ready',
      official_original_text: '源泉：3号源泉（完全源泉かけ流し）',
      official_source_url: 'https://www.bessho-spa.jp/sight/spa.html',
    }, mappingPaths.get('bessho-otsukai-yu'), texture('bessho-otsukai-yu')),
    waterFact('shirahonet-public-openair', {
      facility_area: 'open_air_public_bath',
      scope_key: 'public-open-air-bath-method-and-color',
      scope_label_ko: '강가 공공 노천탕',
      water_system: 'kakenagashi',
      spring_types: ['약산성 온천'],
      water_color: 'white',
      method_render_status: 'ready',
      color_filter_status: 'ready',
      official_original_text: '源泉かけ流しの男女別露天風呂です。／弱酸性、ほのかに乳白色に染まった湯',
      official_source_url: 'https://shirahone.org/accommodation/public-open-air-bath',
    }, mappingPaths.get('shirahonet-public-openair'), texture('shirahonet-public-openair')),
    waterFact('echigo-yuzawa-yama-no-yu', {
      facility_area: 'public_bath',
      scope_key: 'facility-representative-public-bath-method',
      scope_label_ko: '야마노유 공동탕',
      water_system: 'kakenagashi',
      spring_types: ['단순 유황온천(저장성 알칼리성 고온천)'],
      method_render_status: 'ready',
      official_original_text: '源泉かけ流しの湯。外湯めぐりのなかで唯一の硫黄温泉です。',
      official_source_url: 'https://sp.yuzawaonsen.com/?page_id=62',
    }, mappingPaths.get('echigo-yuzawa-yama-no-yu'), texture('echigo-yuzawa-yama-no-yu', ['sulfur'])),
    waterFact('echigo-yuzawa-komako-no-yu', {
      facility_area: 'public_bath',
      scope_key: 'public-bath-water-profile',
      scope_label_ko: '고마코노유 공동탕',
      spring_types: ['나트륨·칼슘-염화물온천'],
      water_color: 'clear',
      official_original_text: '泉質 ナトリウム・カルシウム塩化物温泉（低張性弱アルカリ性高温泉）; お湯は無色透明です。',
      official_source_url: 'https://yuzawaonsen.com/?page_id=160',
    }, mappingPaths.get('echigo-yuzawa-komako-no-yu'), texture('echigo-yuzawa-komako-no-yu', ['salt_warmth'])),
    waterFact('echigo-yuzawa-ponshukan-sakebath', {
      facility_area: 'public_bath',
      scope_key: 'dayuse-sake-bath-water-profile',
      scope_label_ko: '사케탕 유노사와',
      official_original_text: '天然温泉に浴用専用酒を加えた“酒風呂”',
      official_source_url: 'https://www.ponshukan.com/yuzawa/',
    }, mappingPaths.get('echigo-yuzawa-ponshukan-sakebath'), texture('echigo-yuzawa-ponshukan-sakebath')),
    waterFact('tsukioka-bijin-no-izumi', {
      facility_area: 'public_bath',
      scope_key: 'public-bath-water-profile',
      scope_label_ko: '비진노이즈미 공동탕',
      spring_types: ['함유황-나트륨-염화물온천'],
      official_original_text: '泉質：含硫黄-ナトリウム-塩化物温泉／エメラルドグリーンに輝く湯',
      official_source_url: 'https://niigata-kankou.or.jp/spot/11321',
    }, mappingPaths.get('tsukioka-bijin-no-izumi'), texture('tsukioka-bijin-no-izumi', ['sulfur', 'salt_warmth'])),
    waterFact('senami-ryusen', {
      facility_area: 'public_bath',
      scope_key: 'dayuse-baths-water-profile',
      scope_label_ko: '당일입욕 공용탕 수질',
      kasui: 'present',
      spring_types: ['나트륨-염화물온천'],
      official_original_text: '泉質 ナトリウム塩化物温泉、弱アルカリ性低張性高温泉です。源泉の温度は約94度ですので、加水してご提供しております。',
      official_source_url: 'https://www.ryusen.org/onsen.html',
    }, mappingPaths.get('senami-ryusen'), texture('senami-ryusen', ['salt_warmth'])),
    waterFact('yamashiro-soyu', {
      facility_area: 'public_bath',
      scope_key: 'soyu-public-bath-water-profile',
      scope_label_ko: '야마시로 소유 공동탕',
      kasui: 'not_present',
      spring_types: ['나트륨·칼슘-황산염·염화물천', '단순온천'],
      official_original_text: '熱交換システムを導入した、加水なしの一〇〇％源泉の共同浴場。泉質 ナトリウム・カルシウムー硫酸塩・塩化物泉／単純温泉の混合泉',
      official_source_url: 'https://yamashiro-spa.or.jp/spa/',
    }, mappingPaths.get('yamashiro-soyu'), texture('yamashiro-soyu', ['salt_warmth'])),
    waterFact('yamashiro-ko-soyu', {
      facility_area: 'public_bath',
      scope_key: 'ko-soyu-public-bath-water-profile',
      scope_label_ko: '야마시로 고소유 공동탕',
      spring_types: ['나트륨·칼슘-황산염·염화물천'],
      official_original_text: '泉質 ナトリウム・カルシウムー硫酸塩・塩化物泉（低張性・弱アルカリ性・高温泉）',
      official_source_url: 'https://yamashiro-spa.or.jp/spa/',
    }, mappingPaths.get('yamashiro-ko-soyu'), texture('yamashiro-ko-soyu', ['salt_warmth'])),
    waterFact('yamanaka-kikunoyu', {
      facility_area: 'public_bath',
      scope_key: 'male-and-female-public-bath-water-profile',
      scope_label_ko: '기쿠노유 남녀 공동탕',
      spring_types: ['단순온천(저장성·약알칼리성·고온천)'],
      official_original_text: '泉質・泉温 単純温泉－低張性・弱アルカリ性・高温泉、45.2度',
      official_source_url: 'https://www.yamanaka-spa.or.jp/about',
    }, mappingPaths.get('yamanaka-kikunoyu'), texture('yamanaka-kikunoyu')),
    waterFact('wakura-soyu', {
      facility_area: 'public_bath',
      scope_key: 'public-baths-water-profile',
      scope_label_ko: '와쿠라 소유 공용탕',
      spring_types: ['나트륨·칼슘-염화물천'],
      water_color: 'clear',
      official_original_text: '泉温は約80℃と高温で、無色、透明、無臭であり、泉質はナトリウム・カルシウムー塩化物泉（高張性弱アルカリ性高温泉）です。',
      official_source_url: 'https://www.wakura.or.jp/about/',
    }, mappingPaths.get('wakura-soyu'), texture('wakura-soyu', ['salt_warmth'])),
    waterFact('katayamazu-machiyu', {
      facility_area: 'public_bath',
      scope_key: 'rotating-public-baths-water-profile',
      scope_label_ko: '가타노유·모리노유 공용탕',
      spring_types: ['나트륨·칼슘-염화물천'],
      water_color: 'clear',
      official_original_text: '泉質 ナトリウム・カルシウム－塩化物泉（高張性中性高温泉）／源泉掛け流しろ過循環方式併用',
      official_source_url: 'https://www.katayamazu-spa.or.jp/sightseeing/soyu.php',
    }, mappingPaths.get('katayamazu-machiyu'), texture('katayamazu-machiyu', ['salt_warmth'])),
  ];
}

function chubuHokurikuKoshinOfficialFilterFacts(mappingPaths) {
  const volatileUntil = '2026-08-11';
  const fact = (slug, filterCode, scopeKey, values) => officialFilterFact(slug, filterCode, scopeKey, values, mappingPaths.get(slug));
  return [
    fact('gero-kua-garden', 'day_use', 'open-air-bath-operation', {
      scope_label_ko: '노천탕 당일입욕',
      filter_value: { hours: '08:00-20:45', final_reception: '20:00' },
      official_original_text: '営業時間 AM8:00 ～ PM8:45（最終受付 PM8:00）',
      official_source_url: 'https://gero-onsen.com/kua-garden-rotenburo/',
      valid_until: volatileUntil,
    }),
    fact('gero-kua-garden', 'open_air_bath', 'multi-open-air-bath-products', {
      scope_label_ko: '여러 형태의 노천 온욕',
      official_original_text: '「岩づくり露天風呂」「打たせ湯」「三温の湯」「箱蒸し」「泡沫浴」などバリエーションに富んだ湯船',
      official_source_url: 'https://gero-onsen.com/kua-garden-rotenburo/',
    }),
    fact('gero-kua-garden', 'spring_alkaline_simple', 'official-spring-profile', {
      scope_label_ko: '알칼리성 단순온천',
      filter_value: { ph: 9.1 },
      official_original_text: '泉質 アルカリ性単純泉［PH9.1］',
      official_source_url: 'https://gero-onsen.com/kua-garden-rotenburo/',
    }),
    fact('gero-shirasagi', 'day_use', 'public-bath-operation', {
      scope_label_ko: '실내 공동탕 당일입욕',
      filter_value: { hours: '10:00-20:45', final_reception: '20:00' },
      official_original_text: 'AM10:00 ～ PM8:45（最終受付 PM8:00）',
      official_source_url: 'https://gero-onsen.com/shirasagi-no-yu/',
      valid_until: volatileUntil,
    }),
    fact('gero-shirasagi', 'adult_day_use_price', 'public-bath-admission', {
      scope_label_ko: '성인 당일입욕 요금',
      filter_value: { adult_jpy: 470 },
      official_original_text: '大人470円／小学生180円／幼児100円',
      official_source_url: 'https://gero-onsen.com/shirasagi-no-yu/',
      valid_until: volatileUntil,
    }),
    fact('gero-shirasagi', 'spring_alkaline_simple', 'official-spring-profile', {
      scope_label_ko: '알칼리성 단순온천',
      filter_value: { ph: 9.1 },
      official_original_text: '泉質 アルカリ性単純泉［PH9.1］',
      official_source_url: 'https://gero-onsen.com/shirasagi-no-yu/',
    }),
    fact('gero-sachinoyu', 'day_use', 'dayuse-public-bath-operation', {
      scope_label_ko: '공개탕 당일입욕',
      official_original_text: '日本三名泉・下呂温泉を気軽に楽しめる銭湯です。',
      official_source_url: 'https://gero-sachinoyu.com/spa/',
      valid_until: volatileUntil,
    }),
    fact('gero-sachinoyu', 'open_air_bath', 'dayuse-open-air-bath', {
      scope_label_ko: '공용 노천탕',
      official_original_text: '露天風呂・ハイドロ風呂・ボディシャワー・打たせ湯・サウナ・水風呂',
      official_source_url: 'https://gero-sachinoyu.com/spa/',
    }),
    fact('gero-sachinoyu', 'sauna', 'dayuse-public-sauna', {
      scope_label_ko: '공용 사우나',
      official_original_text: 'サウナ・水風呂',
      official_source_url: 'https://gero-sachinoyu.com/spa/',
    }),
    fact('gero-sachinoyu', 'family_bath', 'suspended-family-baths', {
      scope_label_ko: '현재 휴지 중인 가족탕',
      availability: 'conditional',
      filter_status: 'hold',
      official_original_text: '現在人員不足に加え、全室老朽化のため修繕個所多数発見され、休止中です。再開時期は未定です。',
      official_source_url: 'https://gero-sachinoyu.com/spa-family/',
      valid_until: '2026-07-18',
    }),
    fact('awara-saintpia', 'day_use', 'facility-operation', {
      scope_label_ko: '공공 온천 당일입욕',
      filter_value: { hours: '10:00-23:00', final_reception: '22:30' },
      official_original_text: '営業時間 10:00～23:00（最終受付22:30）',
      official_source_url: 'https://awara-saintpia.jp/guide/',
      valid_until: volatileUntil,
    }),
    fact('awara-saintpia', 'station_walk_10m', 'awara-yunomachi-station-access', {
      scope_label_ko: '아와라유노마치역 도보 접근',
      filter_value: { walking_minutes: 5 },
      official_original_text: 'えちぜん鉄道「あわら湯のまち駅」から徒歩約5分',
      official_source_url: 'https://awara-saintpia.jp/access/',
    }),
    fact('awara-saintpia', 'parking', 'facility-parking', {
      scope_label_ko: '시설 주차장',
      filter_value: { spaces: 85 },
      official_original_text: '駐車場 85台',
      official_source_url: 'https://www.city.awara.lg.jp/annai/7200/kankoshisetsu/p000092.html',
      source_kind: 'municipal_official',
    }),
    fact('awara-saintpia', 'spring_chloride', 'official-spring-profile', {
      scope_label_ko: '칼슘·나트륨-염화물천',
      official_original_text: '泉質 カルシウム、ナトリウム、塩化物泉（弱アルカリ性、低張性、高温泉）',
      official_source_url: 'https://awara-saintpia.jp/onsen/',
    }),
    fact('nozawa-oyu', 'day_use', 'oyu-public-use', {
      scope_label_ko: '오유 공동탕 이용',
      official_original_text: '村を訪れた誰もが利用できますが、マナーを守って気持ち良く使いましょう。',
      official_source_url: 'https://nozawakanko.jp/hotspring/',
      source_kind: 'tourism_association',
    }),
    fact('nozawa-oyu', 'spring_sulfur', 'oyu-spring-profile', {
      scope_label_ko: '단순 유황천',
      official_original_text: '源泉の温度 弱アルカリ性66℃／泉質 単純硫黄泉／源泉は大湯です。',
      official_source_url: 'https://nozawakanko.jp/hotspring/',
      source_kind: 'tourism_association',
    }),
    fact('nozawa-furusato-no-yu', 'day_use', 'facility-day-use', {
      scope_label_ko: '유료 당일입욕',
      official_original_text: '内湯（あつ湯・ぬる湯）と露天風呂があります。',
      official_source_url: 'https://www.vill.nozawaonsen.nagano.jp/www/contents/1050000000241/index.html',
      source_kind: 'municipal_official',
      valid_until: volatileUntil,
    }),
    fact('nozawa-furusato-no-yu', 'open_air_bath', 'public-open-air-bath', {
      scope_label_ko: '공용 노천탕',
      official_original_text: '内湯（あつ湯・ぬる湯）と露天風呂があります。',
      official_source_url: 'https://www.vill.nozawaonsen.nagano.jp/www/contents/1050000000241/index.html',
      source_kind: 'municipal_official',
    }),
    fact('yudanaka-kaede-no-yu', 'day_use', 'facility-day-use', {
      scope_label_ko: '역전 당일입욕',
      official_original_text: '湯田中駅前にある日帰りの天然温泉かけ流しを楽しめる温泉施設。',
      official_source_url: 'https://www.info-yamanouchi.net/about/kaede/',
      source_kind: 'tourism_association',
    }),
    fact('yudanaka-kaede-no-yu', 'open_air_bath', 'public-open-air-bath', {
      scope_label_ko: '공용 노천탕',
      official_original_text: '露天風呂ではご家族・ご友人でゆっくりお湯を楽しめます。',
      official_source_url: 'https://www.info-yamanouchi.net/about/kaede/',
      source_kind: 'tourism_association',
    }),
    fact('yudanaka-kaede-no-yu', 'station_walk_10m', 'yudanaka-station-front', {
      scope_label_ko: '유다나카역 바로 앞',
      official_original_text: '湯田中駅前',
      official_source_url: 'https://www.info-yamanouchi.net/about/kaede/',
      source_kind: 'tourism_association',
    }),
    fact('bessho-ishiyu', 'day_use', 'ishiyu-public-bath-operation', {
      scope_label_ko: '이시유 공동탕 당일입욕',
      filter_value: { hours: '06:30-21:30' },
      official_original_text: '営業時間 6:30～21:30／定休日 火曜日',
      official_source_url: 'https://www.bessho-spa.jp/sight/spa.html',
      source_kind: 'tourism_association',
      valid_until: volatileUntil,
    }),
    fact('bessho-ishiyu', 'adult_day_use_price', 'ishiyu-admission', {
      scope_label_ko: '성인 당일입욕 요금',
      filter_value: { adult_jpy: 300 },
      official_original_text: '入浴料 300円',
      official_source_url: 'https://www.bessho-spa.jp/sight/spa.html',
      source_kind: 'tourism_association',
      valid_until: volatileUntil,
    }),
    fact('bessho-otsukai-yu', 'day_use', 'daishiyu-public-bath-operation', {
      scope_label_ko: '다이시유 공동탕 당일입욕',
      filter_value: { hours: '06:00-21:00', final_reception: '20:30' },
      official_original_text: '午前6時～午後9時／最終入場20:30まで',
      official_source_url: 'https://www.bessho-spa.jp/sight/spa.html',
      source_kind: 'tourism_association',
      valid_until: volatileUntil,
    }),
    fact('bessho-otsukai-yu', 'adult_day_use_price', 'daishiyu-admission', {
      scope_label_ko: '성인 당일입욕 요금',
      filter_value: { adult_jpy: 300 },
      official_original_text: '入浴料 300円',
      official_source_url: 'https://www.bessho-spa.jp/sight/spa.html',
      source_kind: 'tourism_association',
      valid_until: volatileUntil,
    }),
    fact('bessho-ainome-yu', 'day_use', 'facility-day-use', {
      scope_label_ko: '공공 온천 당일입욕',
      filter_value: { hours: '10:00-22:00', final_reception: '21:20' },
      official_original_text: '当施設は日帰り温泉のため、宿泊はできません。／10時～22時（入館受付21時20分まで）',
      official_source_url: 'https://www.bessho-spa.jp/aisome/',
      source_kind: 'tourism_association',
      valid_until: volatileUntil,
    }),
    fact('bessho-ainome-yu', 'open_air_bath', 'public-open-air-bath', {
      scope_label_ko: '공용 노천탕',
      official_original_text: '大浴場／露天風呂',
      official_source_url: 'https://www.bessho-spa.jp/aisome/',
      source_kind: 'tourism_association',
    }),
    fact('bessho-ainome-yu', 'stone_sauna', 'paid-stone-sauna', {
      scope_label_ko: '별도 요금 암반욕',
      filter_value: { adult_jpy: 650 },
      official_original_text: '岩盤浴 一律650円（作務衣、敷きタオル、フェイスタオル貸出し料金を含む）',
      official_source_url: 'https://www.bessho-spa.jp/aisome/',
      source_kind: 'tourism_association',
      valid_until: volatileUntil,
    }),
    fact('bessho-ainome-yu', 'parking', 'facility-parking', {
      scope_label_ko: '시설 주차장',
      filter_value: { spaces: 90 },
      official_original_text: '駐車場 約90台',
      official_source_url: 'https://www.bessho-spa.jp/aisome/',
      source_kind: 'tourism_association',
    }),
    fact('shirahonet-public-openair', 'day_use', 'seasonal-public-open-air-bath', {
      scope_label_ko: '계절 운영 노천탕 당일입욕',
      availability: 'conditional',
      official_original_text: '源泉かけ流しの男女別露天風呂です。冬期休業。',
      official_source_url: 'https://shirahone.org/accommodation/public-open-air-bath',
      source_kind: 'tourism_association',
      valid_until: '2026-11-24',
    }),
    fact('shirahonet-public-openair', 'open_air_bath', 'riverside-public-open-air-bath', {
      scope_label_ko: '강가 공공 노천탕',
      official_original_text: '川べりにある公共の野天風呂。源泉かけ流しの男女別露天風呂です。',
      official_source_url: 'https://shirahone.org/accommodation/public-open-air-bath',
      source_kind: 'tourism_association',
    }),
    fact('echigo-yuzawa-yama-no-yu', 'day_use', 'public-bath-operation', {
      scope_label_ko: '공동탕 당일입욕',
      filter_value: { hours: '10:00-21:00', final_reception: '20:30' },
      official_original_text: '営業時間 10:00～21:00（最終受付20:30）',
      official_source_url: 'https://sp.yuzawaonsen.com/?page_id=62',
      valid_until: volatileUntil,
    }),
    fact('echigo-yuzawa-yama-no-yu', 'spring_sulfur', 'official-spring-profile', {
      scope_label_ko: '단순 유황온천',
      official_original_text: '単純硫黄温泉（低張性アルカリ性高温泉）',
      official_source_url: 'https://sp.yuzawaonsen.com/?page_id=62',
    }),
    fact('echigo-yuzawa-komako-no-yu', 'day_use', 'komako-public-bath', {
      scope_label_ko: '고마코노유 공동탕 당일입욕',
      official_original_text: '越後湯沢温泉 駒子の湯',
      official_source_url: 'https://yuzawaonsen.com/?page_id=160',
    }),
    fact('echigo-yuzawa-komako-no-yu', 'spring_chloride', 'official-spring-profile', {
      scope_label_ko: '나트륨·칼슘-염화물온천',
      official_original_text: '泉質 ナトリウム・カルシウム塩化物温泉（低張性弱アルカリ性高温泉）',
      official_source_url: 'https://yuzawaonsen.com/?page_id=160',
    }),
    fact('echigo-yuzawa-ponshukan-sakebath', 'day_use', 'sake-bath-day-use', {
      scope_label_ko: '사케탕 당일입욕',
      official_original_text: '天然温泉に浴用専用酒を加えた“酒風呂”',
      official_source_url: 'https://www.ponshukan.com/yuzawa/',
      valid_until: volatileUntil,
    }),
    fact('echigo-yuzawa-ponshukan-sakebath', 'adult_day_use_price', 'sake-bath-admission', {
      scope_label_ko: '성인 사케탕 요금',
      filter_value: { adult_jpy: 950, bath_tax_included_jpy: 150 },
      official_original_text: '大人（中学生以上）950円（入湯税150円を含む）',
      official_source_url: 'https://www.ponshukan.com/yuzawa/',
      valid_until: volatileUntil,
    }),
    fact('echigo-yuzawa-ponshukan-sakebath', 'station_walk_10m', 'echigo-yuzawa-station-building', {
      scope_label_ko: '에치고유자와역 구내',
      official_original_text: 'CoCoLo湯沢',
      official_source_url: 'https://www.ponshukan.com/yuzawa/',
    }),
    fact('tsukioka-bijin-no-izumi', 'day_use', 'facility-day-use', {
      scope_label_ko: '공동탕 당일입욕',
      official_original_text: '月岡温泉の中心部にある共同浴場「美人の泉」は、エメラルドグリーンに輝く湯を気軽に楽しめる日帰り入浴施設です。',
      official_source_url: 'https://niigata-kankou.or.jp/spot/11321',
      source_kind: 'tourism_association',
      valid_until: volatileUntil,
    }),
    fact('tsukioka-bijin-no-izumi', 'spring_sulfur', 'official-spring-profile', {
      scope_label_ko: '함유황 온천',
      official_original_text: '泉質：含硫黄-ナトリウム-塩化物温泉',
      official_source_url: 'https://niigata-kankou.or.jp/spot/11321',
      source_kind: 'tourism_association',
    }),
    fact('tsukioka-bijin-no-izumi', 'spring_chloride', 'official-spring-profile', {
      scope_label_ko: '나트륨-염화물온천',
      official_original_text: '泉質：含硫黄-ナトリウム-塩化物温泉',
      official_source_url: 'https://niigata-kankou.or.jp/spot/11321',
      source_kind: 'tourism_association',
    }),
    fact('tsukioka-bijin-no-izumi', 'parking', 'facility-parking', {
      scope_label_ko: '시설 주차장',
      filter_value: { spaces: 40 },
      official_original_text: '駐車場 普通車40台',
      official_source_url: 'https://niigata-kankou.or.jp/spot/11321',
      source_kind: 'tourism_association',
    }),
    fact('senami-ryusen', 'day_use', 'dayuse-public-baths', {
      scope_label_ko: '대욕장·노천탕 당일입욕',
      official_original_text: '瀬波温泉 自家源泉の野天風呂 湯元 龍泉／日帰り入浴',
      official_source_url: 'https://www.ryusen.org/onsen.html',
      valid_until: volatileUntil,
    }),
    fact('senami-ryusen', 'open_air_bath', 'public-open-air-bath', {
      scope_label_ko: '자가원천 노천탕',
      official_original_text: '自家源泉の野天風呂',
      official_source_url: 'https://www.ryusen.org/onsen.html',
    }),
    fact('senami-ryusen', 'family_bath', 'reservable-family-bath', {
      scope_label_ko: '예약제 가족탕',
      official_original_text: '貸切家族風呂',
      official_source_url: 'https://www.ryusen.org/onsen.html',
      valid_until: volatileUntil,
    }),
    fact('senami-ryusen', 'spring_chloride', 'official-spring-profile', {
      scope_label_ko: '나트륨-염화물온천',
      official_original_text: '泉質 ナトリウム塩化物温泉、弱アルカリ性低張性高温泉',
      official_source_url: 'https://www.ryusen.org/onsen.html',
    }),
    fact('yamashiro-soyu', 'day_use', 'soyu-public-bath', {
      scope_label_ko: '야마시로 소유 당일입욕',
      official_original_text: '「総湯」と呼ばれる、広く新しい、熱交換システムを導入した、加水なしの一〇〇％源泉の共同浴場。',
      official_source_url: 'https://yamashiro-spa.or.jp/spa/',
      source_kind: 'tourism_association',
    }),
    fact('yamashiro-soyu', 'spring_sulfate', 'soyu-spring-profile', {
      scope_label_ko: '황산염·염화물천 혼합원',
      official_original_text: '泉質 ナトリウム・カルシウムー硫酸塩・塩化物泉／単純温泉の混合泉',
      official_source_url: 'https://yamashiro-spa.or.jp/spa/',
      source_kind: 'tourism_association',
    }),
    fact('yamashiro-soyu', 'spring_chloride', 'soyu-spring-profile', {
      scope_label_ko: '황산염·염화물천 혼합원',
      official_original_text: '泉質 ナトリウム・カルシウムー硫酸塩・塩化物泉／単純温泉の混合泉',
      official_source_url: 'https://yamashiro-spa.or.jp/spa/',
      source_kind: 'tourism_association',
    }),
    fact('yamashiro-ko-soyu', 'day_use', 'ko-soyu-public-bath', {
      scope_label_ko: '메이지 복원 공동탕',
      official_original_text: '明治時代の総湯を復元',
      official_source_url: 'https://yamashiro-spa.or.jp/spa/',
      source_kind: 'tourism_association',
    }),
    fact('yamashiro-ko-soyu', 'spring_sulfate', 'ko-soyu-spring-profile', {
      scope_label_ko: '황산염·염화물천',
      official_original_text: '泉質 ナトリウム・カルシウムー硫酸塩・塩化物泉（低張性・弱アルカリ性・高温泉）',
      official_source_url: 'https://yamashiro-spa.or.jp/spa/',
      source_kind: 'tourism_association',
    }),
    fact('yamashiro-ko-soyu', 'spring_chloride', 'ko-soyu-spring-profile', {
      scope_label_ko: '황산염·염화물천',
      official_original_text: '泉質 ナトリウム・カルシウムー硫酸塩・塩化物泉（低張性・弱アルカリ性・高温泉）',
      official_source_url: 'https://yamashiro-spa.or.jp/spa/',
      source_kind: 'tourism_association',
    }),
    fact('yamanaka-kikunoyu', 'day_use', 'male-and-female-public-baths', {
      scope_label_ko: '남녀 별동 공동탕',
      official_original_text: '総湯は、菊の湯と呼ばれ男湯と女湯が別棟になっており、隣接して建っています。',
      official_source_url: 'https://www.tabimati.net/spot/detail_185.html',
      source_kind: 'tourism_association',
    }),
    fact('yamanaka-kikunoyu', 'parking', 'facility-parking', {
      scope_label_ko: '시설 주차장',
      filter_value: { spaces: 100 },
      official_original_text: '乗用車 約100台',
      official_source_url: 'https://www.tabimati.net/spot/detail_185.html',
      source_kind: 'tourism_association',
    }),
    fact('yamanaka-kikunoyu', 'spring_simple', 'official-spring-profile', {
      scope_label_ko: '단순온천',
      official_original_text: '泉質・泉温 単純温泉－低張性・弱アルカリ性・高温泉、45.2度',
      official_source_url: 'https://www.yamanaka-spa.or.jp/about',
      source_kind: 'tourism_association',
    }),
    fact('wakura-soyu', 'day_use', 'facility-operation', {
      scope_label_ko: '와쿠라 소유 당일입욕',
      filter_value: { hours: '07:00-21:00', final_reception: '20:30' },
      official_original_text: '7:00～21:00（最終入館20:30）',
      official_source_url: 'https://www.wakura.or.jp/brochure/brochure-660-2',
      source_kind: 'tourism_association',
      valid_until: volatileUntil,
    }),
    fact('wakura-soyu', 'open_air_bath', 'public-open-air-bath', {
      scope_label_ko: '공용 노천탕',
      official_original_text: '大浴槽・小浴槽・立ち湯・露天風呂・サウナ・水風呂',
      official_source_url: 'https://www.wakura.or.jp/brochure/brochure-660-2',
      source_kind: 'tourism_association',
    }),
    fact('wakura-soyu', 'sauna', 'public-sauna', {
      scope_label_ko: '공용 사우나',
      official_original_text: '大浴槽・小浴槽・立ち湯・露天風呂・サウナ・水風呂',
      official_source_url: 'https://www.wakura.or.jp/brochure/brochure-660-2',
      source_kind: 'tourism_association',
    }),
    fact('wakura-soyu', 'spring_chloride', 'official-spring-profile', {
      scope_label_ko: '나트륨·칼슘-염화물천',
      official_original_text: '泉質 ナトリウム・カルシウムー塩化物泉（高張性弱アルカリ性高温泉）',
      official_source_url: 'https://www.wakura.or.jp/about/',
      source_kind: 'tourism_association',
    }),
    fact('katayamazu-machiyu', 'day_use', 'rotating-public-baths', {
      scope_label_ko: '가타노유·모리노유 당일입욕',
      filter_value: { hours: '06:00-22:00', adult_jpy: 500 },
      official_original_text: '1階 温泉 6:00～22:00／大人500円',
      official_source_url: 'https://sou-yu.net/rate',
      valid_until: volatileUntil,
    }),
    fact('katayamazu-machiyu', 'spring_chloride', 'official-spring-profile', {
      scope_label_ko: '나트륨·칼슘-염화물천',
      official_original_text: '泉質 ナトリウム・カルシウム－塩化物泉（高張性中性高温泉）',
      official_source_url: 'https://sou-yu.net/',
    }),
    fact('unazuki-soyu-yumedokoro', 'day_use', 'facility-operation', {
      scope_label_ko: '공용욕장 당일입욕',
      filter_value: { hours: '09:00-22:00', final_reception: '21:00', adult_jpy: 510 },
      official_original_text: '営業時間 9:00～22:00（最終受付21:00）／高校生以上510円',
      official_source_url: 'https://www.kurobe-unazuki.jp/tourism/895/',
      source_kind: 'tourism_association',
      valid_until: volatileUntil,
    }),
    fact('unazuki-soyu-yumedokoro', 'rest_area', 'footbath-drinking-rest-area', {
      scope_label_ko: '야외 족욕·음천·휴게 공간',
      official_original_text: '屋外足湯や飲泉、休み処もございます。',
      official_source_url: 'https://yumedokoro-unazuki.jp/?page_id=39',
    }),
  ];
}

function firstOfficialUrl(value) {
  const urls = [];
  const visit = (item) => {
    if (Array.isArray(item)) item.forEach(visit);
    else if (item && typeof item === 'object') Object.entries(item).forEach(([key, nested]) => {
      if (/url/i.test(key) && typeof nested === 'string' && /^https?:\/\//.test(nested)) urls.push(nested);
      else visit(nested);
    });
  };
  visit(value);
  return urls.find((url) => url.startsWith('https://')) ?? urls[0] ?? null;
}

function officialOriginalPairs(mapping) {
  const roots = [
    mapping.official_facts,
    mapping.official_bath_facts,
    mapping.official_facts_checked,
    mapping.official_profile,
    mapping.official_sources,
    mapping.official_scope_products,
    mapping.official_water_profile,
    mapping.water_profile,
  ].filter(Boolean);
  const fallbackUrl = firstOfficialUrl({
    official_url: mapping.official_url,
    identity: mapping.identity,
    official_identity: mapping.official_identity,
    roots,
  });
  const pairs = [];
  const textKey = /(?:original.*text|text.*original|official.*text|hours_original|closed_original|admission_original|price_original|access_original|quality_original|spring_quality|temperature_original|method_original|child_rule_original)/i;
  const rejectedKey = /(?:reason|policy|note|status|review)/i;
  const visit = (value, inheritedUrl, pathParts = []) => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, inheritedUrl, [...pathParts, String(index)]));
      return;
    }
    if (!value || typeof value !== 'object') return;
    const localUrl = Object.entries(value)
      .filter(([key, nested]) => /url/i.test(key) && typeof nested === 'string' && /^https?:\/\//.test(nested))
      .map(([, nested]) => nested)
      .find((url) => url.startsWith('https://')) ?? inheritedUrl;
    for (const [key, nested] of Object.entries(value)) {
      if (textKey.test(key) && !rejectedKey.test(key)) {
        const texts = Array.isArray(nested) ? nested : [nested];
        for (const text of texts) {
          const normalized = typeof text === 'string' ? text.trim() : '';
          if (!normalized || !/[ぁ-んァ-ヶ一-龠]/.test(normalized)) continue;
          if (/not_found|not found|確認できない|未確認|不明|unclear/i.test(normalized)) continue;
          if (localUrl?.startsWith('https://')) pairs.push({ key, path: [...pathParts, key].join('.'), text: normalized, url: localUrl });
        }
      }
      visit(nested, localUrl, [...pathParts, key]);
    }
  };
  roots.forEach((root) => visit(root, firstOfficialUrl(root) ?? fallbackUrl));
  const seen = new Set();
  return pairs.filter((pair) => {
    const key = `${pair.text}|${pair.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function kansaiSpringTypes(mapping) {
  const values = [];
  const visit = (value, key = '') => {
    if (Array.isArray(value)) value.forEach((item) => visit(item, key));
    else if (value && typeof value === 'object') Object.entries(value).forEach(([nestedKey, nested]) => visit(nested, nestedKey));
    else if (typeof value === 'string' && /(?:spring_quality|quality_original|official_quality|泉質)/i.test(key) && /[ぁ-んァ-ヶ一-龠]/.test(value)) values.push(value.trim());
  };
  visit(mapping);
  return unique(values.filter((value) => !/not_found|未確認|不明|unclear/i.test(value))).slice(0, 8);
}

const kansaiScopedMethodFacts = [
  ['arima-suzurannoyu', 'open_air_public_bath', 'named-source-flow-open-air-baths', '직수 노천탕 3종', 'kakenagashi', 'unknown', 'unknown', 'unknown', 'scope_split_required', '出会い風呂(天然温泉 かけ流し) / つぼ風呂(天然温泉 かけ流し) / ひのき風呂(天然温泉 かけ流し)', 'https://suzurannoyu.jp/onsen-4/'],
  ['arima-suzurannoyu', 'public_bath', 'named-circulating-baths', '순환식 대지탕·침탕', 'junkan', 'unknown', 'unknown', 'unknown', 'scope_split_required', '大池風呂(天然温泉循環) / 寝風呂(天然温泉循環)', 'https://suzurannoyu.jp/onsen-3/'],
  ['arima-taikounoyu', 'public_bath', 'taiko-iwaburo', '태합의 암탕', 'kakenagashi', 'unknown', 'unknown', 'unknown', 'scope_split_required', '「太閤の岩風呂」…貴重な金泉を源泉かけ流しでたっぷりお楽しみください。', 'https://www.taikounoyu.com/onsen/'],
  ['dogo-asukanoyu', 'public_bath', 'facility-method-profile', '아스카노유 공용욕장', 'kakenagashi', 'not_present', 'not_present', 'unknown', 'ready', '全国でも珍しい加温も加水もしていない源泉かけ流しの「美人の湯」', 'https://dogo.jp/onsen/asuka'],
  ['dogo-tsubakinoyu', 'public_bath', 'facility-method-profile', '츠바키노유 공용욕장', 'kakenagashi', 'not_present', 'not_present', 'unknown', 'ready', '温泉は、道後温泉本館と同じく無加温・無加水の「源泉かけ流し」の湯です。', 'https://dogo.jp/onsen/tsubaki'],
  ['hiroshima-yuki-lodge-dayuse', 'public_bath', 'dayuse-public-bath-method', '당일입욕 공용욕장', 'kakenagashi', 'not_present', 'present', 'unknown', 'ready', '加水なしの掛け流し（温度調節に加温あり）', 'https://yuki-lodge.jp/onsen.html'],
  ['hyogo-amagasaki-yunokaro', 'open_air_public_bath', 'source-rock-and-pot-baths', '원천 노천 암탕·항아리탕', 'kakenagashi', 'unknown', 'unknown', 'unknown', 'scope_split_required', '地下1,001メートルよりこんこんと湧き出た源泉を掛け流し', 'https://www.yunokarou.com/spa/'],
  ['hyogo-amagasaki-yunokaro', 'public_bath', 'other-circulating-baths', '그 밖의 공용욕조', 'junkan', 'unknown', 'unknown', 'unknown', 'scope_split_required', '源泉掛け流し露天岩風呂、源泉壺湯以外の浴槽は沸かし湯の循環式を利用しています。', 'https://www.yunokarou.com/spa/'],
  ['hyogo-ashiya-spa-suisyun', 'open_air_public_bath', 'upper-rock-bath', '노천 암탕 상단', 'kakenagashi', 'unknown', 'not_present', 'unknown', 'scope_split_required', '上段は加温無しの源泉掛け流し / 42℃「掛け流し」(露天岩風呂上段)', 'https://suisyun.jp/ashiya/onsen-ofuro/'],
  ['hyogo-takarazuka-takaranoyu', 'public_bath', 'golden-source-bath', '황금빛 원천탕', 'kakenagashi', 'not_present', 'present', 'unknown', 'scope_split_required', '地下800mから自噴する天然温泉。あふれ出たお湯を循環させないかけ流し式。加水なし。湧出温度約37℃を約41℃まで加温。', 'https://takaranoyu.jp/spa/'],
  ['kaike-onsen-ocean', 'public_bath', 'public-bath-source-profile', '공용욕장 원천 프로필', 'kakenagashi', 'unknown', 'unknown', 'unknown', 'scope_split_required', '皆生温泉は優れた保温効果で、当館は豊富な湯量を活かして源泉かけ流しにしています。', 'https://www.ocean-g.com/onsen.html'],
  ['nara-kenko-land', 'open_air_public_bath', 'natural-spring-baths', '노천 암탕·천연온천 욕조', 'junkan', 'unknown', 'present', 'unknown', 'scope_split_required', 'ナトリウム－塩化物温泉（低張性・中性・温泉）／加温・循環ろ過式', 'https://www.narakenkoland.net/facility/spa/66'],
  ['osaka-nobeha-no-yu-tsuruhashi', 'open_air_public_bath', 'standing-and-rock-source-baths', '직수 입식탕·원천 암탕', 'kakenagashi', 'unknown', 'unknown', 'unknown', 'scope_split_required', '源泉掛け流し立ち湯／源泉岩風呂', 'https://www.nobuta123.co.jp/nobehatsuruhashi/bath/'],
  ['osaka-nobeha-no-yu-tsuruhashi', 'family_bath', 'official-family-bath-area', '별도 가족탕', 'kakenagashi', 'unknown', 'unknown', 'unknown', 'scope_split_required', '良質な源泉掛け流し温泉', 'https://www.nobuta123.co.jp/nobehatsuruhashi/family/'],
  ['osaka-solaniwa-onsen', 'open_air_public_bath', 'source-flow-open-air-bath', '직수 노천탕', 'kakenagashi', 'unknown', 'unknown', 'unknown', 'scope_split_required', '地下1,000mからくみ上げた天然温泉による、源泉かけ流しの露天風呂など、9種類のお風呂', 'https://solaniwa.com/explore/'],
  ['osaka-solaniwa-onsen', 'private_bath', 'source-flow-private-open-air-bath', '직수 대절 노천탕', 'kakenagashi', 'unknown', 'unknown', 'unknown', 'scope_split_required', '源泉かけ流しの貸切露天風呂と坪庭付きの完全個室を10室', 'https://solaniwa.com/explore/private_bath'],
  ['osaka-tsurumi-suisyun', 'open_air_public_bath', 'upper-rock-bath', '노천 암탕 상단', 'kakenagashi', 'unknown', 'unknown', 'unknown', 'scope_split_required', '岩風呂の上段が温泉「鶴寿の湯」の源泉かけ流し', 'https://suisyun.jp/tsurumi/onsen/'],
  ['shirahama-sakinoyu', 'open_air_public_bath', 'facility-method-profile', '사키노유 노천탕', 'kakenagashi', 'unknown', 'unknown', 'unknown', 'ready', '風呂の種類 かけ流し露天風呂; 泉質 ナトリウム塩化物泉; 源泉名 行幸源泉', 'https://www.town.shirahama.wakayama.jp/soshiki/kanko/koen/shisetsu/pubric_spa/1450338115191.html'],
  ['shirahama-shirarayu', 'public_bath', 'facility-method-profile', '시라라유 공용욕장', 'kakenagashi', 'unknown', 'unknown', 'unknown', 'ready', '風呂の種類 かけ流し風呂; 泉質 ナトリウム塩化物泉; 源泉名 生絹湯', 'https://www.town.shirahama.wakayama.jp/soshiki/kanko/koen/shisetsu/pubric_spa/1450338453414.html'],
  ['tokushima-aratae-tamiya', 'public_bath', 'named-natural-spring-baths', '천연온천 백·현 욕조', 'kakenagashi', 'not_present', 'present', 'unknown', 'scope_split_required', '源泉かけ流し; 加水を行わず; ※加温はしております', 'https://aratae.jp/lp/'],
];

function kansaiSaninSetouchiWaterFacts(mappingPaths, signalRowsBySlug) {
  const facts = [];
  const texture = (slug) => textureFilterState(signalRowsBySlug.get(slug) ?? []);
  const emptyTexture = { candidates: [], ready: [], status: 'not_eligible' };
  for (const [slug, mappingPath] of mappingPaths) {
    const mapping = readJson(mappingPath);
    const pairs = officialOriginalPairs(mapping)
      .filter((pair) => /泉質|温泉|源泉|鉱泉|放射能|ラジウム|塩化物|炭酸|硫黄|鉄|かけ流し|掛け流し|循環/.test(pair.text))
      .sort((a, b) => {
        const score = (pair) => (/泉質|源泉|鉱泉|放射能|塩化物|硫黄|鉄/.test(pair.text) ? 10 : 0) + (/water|spring|quality|泉質/i.test(pair.path) ? 5 : 0);
        return score(b) - score(a) || a.text.length - b.text.length;
      });
    const representative = pairs[0];
    if (!representative) continue;
    const colorReady = slug === 'hyogo-akashi-tatsunoyu';
    facts.push(waterFact(slug, {
      facility_area: 'public_bath',
      scope_key: 'facility-representative-water-profile',
      scope_label_ko: '시설 대표 수질 프로필',
      spring_types: kansaiSpringTypes(mapping),
      water_color: colorReady ? 'brown' : 'unknown',
      color_filter_status: colorReady ? 'ready' : 'not_eligible',
      method_render_status: 'no_badge',
      official_original_text: representative.text,
      official_source_url: representative.url,
    }, mappingPath, texture(slug)));
  }
  for (const [slug, facilityArea, scopeKey, scopeLabelKo, waterSystem, kasui, kaon, disinfection, methodRenderStatus, originalText, sourceUrl] of kansaiScopedMethodFacts) {
    if (!mappingPaths.has(slug)) continue;
    facts.push(waterFact(slug, {
      facility_area: facilityArea,
      scope_key: scopeKey,
      scope_label_ko: scopeLabelKo,
      water_system: waterSystem,
      kasui,
      kaon,
      disinfection,
      method_render_status: methodRenderStatus,
      official_original_text: originalText,
      official_source_url: sourceUrl,
    }, mappingPaths.get(slug), emptyTexture));
  }
  if (mappingPaths.has('hyogo-akashi-tatsunoyu')) facts.push(waterFact('hyogo-akashi-tatsunoyu', {
    facility_area: 'public_bath',
    scope_key: 'official-brown-spring-profile',
    scope_label_ko: '철분 산화 갈색빛 원천',
    spring_types: ['含鉄(II)-ナトリウム-カルシウム-マグネシウム-塩化物泉'],
    water_color: 'brown',
    color_filter_status: 'ready',
    method_render_status: 'no_badge',
    official_original_text: '源泉は無色透明ですが、空気に触れることで酸化し鮮やかな褐色に変化します。',
    official_source_url: 'https://www.tatsunoyu1268.com/bath_info.html',
  }, mappingPaths.get('hyogo-akashi-tatsunoyu'), texture('hyogo-akashi-tatsunoyu')));
  return facts;
}

function officialSourceKind(url) {
  if (/\.go\.jp|\.lg\.jp|city\.|town\.|vill\./i.test(url)) return 'municipal_official';
  if (/tourism|kanko/i.test(url)) return 'tourism_association';
  return 'operator_official';
}

function kansaiSaninSetouchiOfficialFilterFacts(mappingPaths) {
  const operationalCodes = new Set(['day_use', 'morning_bath', 'late_night', 'station_walk_10m', 'shuttle', 'adult_day_use_price']);
  const equipmentCodes = new Set(['open_air_bath', 'private_bath', 'family_bath', 'mixed_bathing', 'sauna', 'water_bath', 'stone_sauna', 'steam_bath', 'jet_bath', 'sleeping_bath', 'parking', 'meal_service', 'rest_area', 'ocean_view']);
  const rules = [
    ['day_use', 'facility_wide', '당일입욕', /日帰り|外来入浴|公衆浴場|入浴料|営業時間/],
    ['open_air_bath', 'open_air_public_bath', '공용 노천탕', /露天風呂|野天風呂/],
    ['private_bath', 'private_bath', '대절탕', /貸切風呂|貸切露天風呂/],
    ['family_bath', 'family_bath', '가족탕', /家族風呂/],
    ['mixed_bathing', 'public_bath', '혼욕탕', /混浴/],
    ['sauna', 'sauna', '사우나', /サウナ/],
    ['stone_sauna', 'stone_sauna', '암반욕', /岩盤浴|薬石/],
    ['steam_bath', 'steam_bath', '증기욕·스팀 사우나', /蒸し湯|蒸気浴|ミストサウナ|スチームサウナ/],
    ['water_bath', 'public_bath', '냉탕', /水風呂|冷水風呂/],
    ['jet_bath', 'public_bath', '제트탕', /ジェット/],
    ['sleeping_bath', 'public_bath', '침탕', /寝湯|寝風呂/],
    ['parking', 'facility_wide', '주차', /駐車場/],
    ['shuttle', 'facility_wide', '송영·셔틀', /送迎|シャトル/],
    ['meal_service', 'food_area', '식음 시설', /食事|レストラン|食堂|茶屋/],
    ['rest_area', 'rest_area', '휴게 공간', /休憩|リクライナー|休み処/],
    ['ocean_view', 'open_air_public_bath', '바다 전망', /海を望|海が見|オーシャンビュー|瀬戸内海|明石海峡/],
    ['spring_bicarbonate', 'facility_wide', '탄산수소염천', /炭酸水素塩泉/],
    ['spring_chloride', 'facility_wide', '염화물천', /塩化物泉|塩化物温泉/],
    ['spring_sulfur', 'facility_wide', '유황천', /硫黄泉|含硫黄/],
    ['spring_sulfate', 'facility_wide', '황산염천', /硫酸塩泉/],
    ['spring_iron', 'facility_wide', '철천', /含鉄|鉄泉/],
    ['spring_radon', 'facility_wide', '라돈천', /ラドン/],
    ['spring_radioactive', 'facility_wide', '방사능천', /放射能泉|放射能温泉/],
    ['spring_simple', 'facility_wide', '단순천', /単純温泉|単純泉/],
    ['spring_alkaline_simple', 'facility_wide', '알칼리성 단순천', /アルカリ性単純/],
  ];
  const facts = [];
  for (const [slug, mappingPath] of mappingPaths) {
    const pairs = officialOriginalPairs(readJson(mappingPath));
    const seen = new Set();
    for (const [code, scopeKey, scopeLabelKo, pattern] of rules) {
      const pair = pairs.filter((candidate) => pattern.test(candidate.text)).sort((a, b) => a.text.length - b.text.length)[0];
      if (!pair) continue;
      const key = `${code}:${scopeKey}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const filterValue = {};
      if (code === 'day_use') {
        const times = [...pair.text.matchAll(/(?:^|\s)(\d{1,2}:\d{2})/g)].map((match) => match[1]);
        if (times.length > 0) filterValue.times = times;
      }
      facts.push(officialFilterFact(slug, code, scopeKey, {
        scope_label_ko: scopeLabelKo,
        filter_value: filterValue,
        official_original_text: pair.text,
        official_source_url: pair.url,
        source_kind: officialSourceKind(pair.url),
        valid_until: operationalCodes.has(code) ? '2026-08-11' : equipmentCodes.has(code) ? '2026-10-10' : null,
      }, mappingPath));
    }
    const pricePair = pairs.find((pair) => /大人[^\n]{0,40}[0-9,]+円/.test(pair.text));
    if (pricePair) {
      const match = pricePair.text.match(/大人[^0-9]{0,20}([0-9,]+)円/);
      if (match) facts.push(officialFilterFact(slug, 'adult_day_use_price', 'facility_wide', {
        scope_label_ko: '성인 당일입욕 요금',
        filter_value: { amount_jpy: integer(match[1]), pricing_scope: '공식 페이지의 첫 성인 요금' },
        official_original_text: pricePair.text,
        official_source_url: pricePair.url,
        source_kind: officialSourceKind(pricePair.url),
        valid_until: '2026-08-11',
      }, mappingPath));
    }
    const walkPair = pairs.find((pair) => /徒歩\s*(?:約)?\s*([0-9]+)分/.test(pair.text));
    const walkMatch = walkPair?.text.match(/徒歩\s*(?:約)?\s*([0-9]+)分/);
    if (walkPair && walkMatch && integer(walkMatch[1]) <= 10) facts.push(officialFilterFact(slug, 'station_walk_10m', 'facility_wide', {
      scope_label_ko: '역에서 도보 10분 이내',
      filter_value: { walk_minutes: integer(walkMatch[1]) },
      official_original_text: walkPair.text,
      official_source_url: walkPair.url,
      source_kind: officialSourceKind(walkPair.url),
      valid_until: '2026-08-11',
    }, mappingPath));
  }
  if (mappingPaths.has('kinosaki-goshono-yu')) facts.push(officialFilterFact('kinosaki-goshono-yu', 'day_use', 'facility_wide', {
    scope_label_ko: '고쇼노유 당일입욕',
    filter_value: { hours: '07:00-23:00', final_reception: '22:30' },
    official_original_text: '営業時間／7:00～23:00（受付終了22:30）',
    official_source_url: 'https://kinosaki-spa.gr.jp/about/spa/',
    source_kind: 'tourism_association',
    valid_until: '2026-08-11',
  }, mappingPaths.get('kinosaki-goshono-yu')));
  if (mappingPaths.has('kinosaki-ichino-yu')) {
    facts.push(officialFilterFact('kinosaki-ichino-yu', 'day_use', 'facility_wide', {
      scope_label_ko: '이치노유 당일입욕',
      filter_value: { hours: '07:00-23:00', final_reception: '22:30' },
      official_original_text: '営業時間／7:00～23:00（受付終了22:30）',
      official_source_url: 'https://kinosaki-spa.gr.jp/about/spa/',
      source_kind: 'tourism_association',
      valid_until: '2026-08-11',
    }, mappingPaths.get('kinosaki-ichino-yu')));
    facts.push(officialFilterFact('kinosaki-ichino-yu', 'adult_day_use_price', 'facility_wide', {
      scope_label_ko: '성인 당일입욕 요금',
      filter_value: { amount_jpy: 800, pricing_scope: 'adult_dayuse' },
      official_original_text: '料金／大人800円、小人400円',
      official_source_url: 'https://kinosaki-spa.gr.jp/about/spa/',
      source_kind: 'tourism_association',
      valid_until: '2026-08-11',
    }, mappingPaths.get('kinosaki-ichino-yu')));
  }
  const legacyPath = path.join(outputDir, 'kansai_sanin_setouchi_facility_official_filter_facts_handoff_2026-07-10.json');
  const merged = new Map();
  if (existsSync(legacyPath)) {
    for (const fact of readJson(legacyPath).facts ?? []) {
      if (!mappingPaths.has(fact.facility_slug)) continue;
      merged.set(`${fact.facility_slug}:${fact.filter_code}:${fact.scope_key}`, { ...fact, source_file: path.relative(repoRoot, legacyPath) });
    }
  }
  for (const fact of facts) {
    const key = `${fact.facility_slug}:${fact.filter_code}:${fact.scope_key}`;
    if (!merged.has(key)) merged.set(key, fact);
  }
  return [...merged.values()];
}

function buildSeed() {
  const facilities = [];
  const evidence = [];
  const reviewSignals = [];
  const facilityNames = {};
  const normalizationExclusions = [];
  const mappings = new Map();
  const mappingPaths = new Map();
  const signalRowsBySlug = new Map();
  for (const config of regionConfigs) {
    const candidates = new Map(readCsv(config.candidateQueue).map(normalizeCandidate).map((row) => [row.candidate_slug, row]));
    const allQaRows = readCsv(config.qa);
    const qaRows = isKansaiSaninSetouchi
      ? allQaRows.filter((row) => integer(row.dayuse_only_direct_reviews) > 0)
      : allQaRows;
    if (isKansaiSaninSetouchi) {
      normalizationExclusions.push(...allQaRows
        .filter((row) => integer(row.dayuse_only_direct_reviews) === 0)
        .map((row) => ({
          facility_slug: row.candidate_slug,
          reason: 'candidate_only_non_bathing_or_unresolved_operation_excluded_from_facility_seed',
          count: 0,
        })));
    }
    for (const qa of qaRows) {
      const candidate = candidates.get(qa.candidate_slug);
      if (!candidate) throw new Error(`${qa.candidate_slug}: candidate row missing`);
      const directory = path.join(config.researchRoot, qa.artifact_directory);
      const mappingPath = findArtifact(directory, qa.candidate_slug, 'facility_platform_mapping', '.json');
      const signalPath = findArtifact(directory, qa.candidate_slug, 'facility_review_signal_rows', '.csv');
      const ledgerPath = findCanonicalLedger(directory, qa.candidate_slug);
      const mapping = readJson(mappingPath);
      const signalRows = readCsv(signalPath);
      const ledger = dedupeLedgerRows(readCsv(ledgerPath));
      const qaFullRows = ledger.filter(fullBodyEligible);
      const qaRelatedRows = qaFullRows.filter((row) => truthy(row.facility_related));
      const fullRows = ledger.filter(normalizedPlatformReview);
      const relatedRows = fullRows.filter((row) => truthy(row.facility_related));
      const dayuseRows = relatedRows.filter((row) => row.scope_bucket === 'dayuse_only');
      const excludedNonuse = qaFullRows.length - fullRows.length;
      if (ledger.length !== integer(qa.ledger_rows)) throw new Error(`${qa.candidate_slug}: ledger count ${ledger.length} != QA ${qa.ledger_rows}`);
      if (qaFullRows.length !== integer(qa.full_body_direct_reviews)) throw new Error(`${qa.candidate_slug}: QA full-body count ${qaFullRows.length} != QA ${qa.full_body_direct_reviews}`);
      if (qaRelatedRows.length !== integer(qa.facility_related_direct_reviews)) throw new Error(`${qa.candidate_slug}: QA facility-related count ${qaRelatedRows.length} != QA ${qa.facility_related_direct_reviews}`);
      if (isKansaiSaninSetouchi && dayuseRows.length !== integer(qa.dayuse_only_direct_reviews)) throw new Error(`${qa.candidate_slug}: day-use count ${dayuseRows.length} != QA ${qa.dayuse_only_direct_reviews}`);
      const manifest = directReviewManifest(fullRows, relatedRows, dayuseRows);
      if (qa.direct_body_platform_count && manifest.length !== integer(qa.direct_body_platform_count)) throw new Error(`${qa.candidate_slug}: platform count ${manifest.length} != QA ${qa.direct_body_platform_count}`);
      const evidenceRef = `${qa.candidate_slug}:${collectionKey}`;
      facilities.push(facilityRow(candidate, mapping, mappingPath));
      evidence.push(evidenceRow(qa, ledgerPath, fullRows, relatedRows, manifest, excludedNonuse));
      const signalsAboveDayuseDenominator = isKansaiSaninSetouchi
        ? signalRows.filter((row) => integer(row.source_count) > dayuseRows.length)
        : [];
      const eligibleSignalRows = signalRows.filter((row) => !signalsAboveDayuseDenominator.includes(row));
      const normalizedSignals = eligibleSignalRows.map((row) => normalizeSignal(row, qa.candidate_slug, evidenceRef)).filter(Boolean);
      const heldSignals = signalRows.filter((row) => heldRawSignalTypes.has(row.signal_type));
      const zeroSourceSignals = signalRows.filter((row) => integer(row.source_count) === 0);
      reviewSignals.push(...normalizedSignals);
      facilityNames[qa.candidate_slug] = candidate.korean_name;
      mappings.set(qa.candidate_slug, mapping);
      mappingPaths.set(qa.candidate_slug, mappingPath);
      signalRowsBySlug.set(qa.candidate_slug, eligibleSignalRows);
      if (excludedNonuse > 0) normalizationExclusions.push({ facility_slug: qa.candidate_slug, reason: 'review_nonuse_excluded_from_experience_denominator', count: excludedNonuse });
      if (signalsAboveDayuseDenominator.length > 0) normalizationExclusions.push({
        facility_slug: qa.candidate_slug,
        reason: 'signal_count_exceeds_dayuse_denominator_held',
        count: signalsAboveDayuseDenominator.length,
        signal_types: unique(signalsAboveDayuseDenominator.map((row) => row.signal_type)),
      });
      if (heldSignals.length > 0) normalizationExclusions.push({
        facility_slug: qa.candidate_slug,
        reason: 'unsupported_signal_type_held_until_schema_extension',
        count: heldSignals.length,
        signal_types: unique(heldSignals.map((row) => row.signal_type)),
      });
      if (zeroSourceSignals.length > 0) normalizationExclusions.push({
        facility_slug: qa.candidate_slug,
        reason: 'zero_independent_source_signal_excluded',
        count: zeroSourceSignals.length,
        signal_types: unique(zeroSourceSignals.map((row) => row.signal_type)),
      });
    }
  }

  const kyushuWaterPath = path.join(outputDir, 'kyushu-facility-pipeline-2026-07-10', 'kyushu_facility_water_facts_normalized_2026-07-10.json');
  const waterFacts = isKansaiSaninSetouchi
    ? kansaiSaninSetouchiWaterFacts(mappingPaths, signalRowsBySlug)
    : isHokkaido
    ? hokkaidoWaterFacts(mappingPaths, signalRowsBySlug)
    : isChubuHokurikuKoshin
    ? chubuHokurikuKoshinWaterFacts(mappingPaths, signalRowsBySlug)
    : isHakoneKanagawaYamanashi
    ? hakoneKanagawaYamanashiWaterFacts(mappings, mappingPaths, signalRowsBySlug)
    : isIzuShizuoka
      ? izuShizuokaWaterFacts(mappingPaths, signalRowsBySlug)
    : isTohoku
      ? tohokuWaterFacts(mappingPaths, signalRowsBySlug)
    : isKantoAdditional
      ? kantoAdditionalWaterFacts(mappings, mappingPaths, signalRowsBySlug)
      : [...readJson(kyushuWaterPath).water_facts, ...kansaiWaterFacts()];
  const officialFilterPath = path.join(outputDir, 'kansai_sanin_setouchi_facility_official_filter_facts_handoff_2026-07-10.json');
  const rawOfficialFilterFacts = isKansaiSaninSetouchi
    ? kansaiSaninSetouchiOfficialFilterFacts(mappingPaths)
    : isHokkaido
    ? hokkaidoOfficialFilterFacts(mappingPaths)
    : isChubuHokurikuKoshin
    ? chubuHokurikuKoshinOfficialFilterFacts(mappingPaths)
    : isHakoneKanagawaYamanashi
    ? hakoneKanagawaYamanashiOfficialFilterFacts(mappingPaths)
    : isIzuShizuoka
      ? izuShizuokaOfficialFilterFacts(mappingPaths)
    : isTohoku
      ? tohokuOfficialFilterFacts(mappingPaths)
    : isKantoAdditional
      ? kantoAdditionalOfficialFilterFacts(mappingPaths)
      : readJson(officialFilterPath).facts.map((row) => ({ ...row, source_file: path.relative(repoRoot, officialFilterPath) }));
  const officialFilterFacts = rawOfficialFilterFacts.map((row) => ({
    ...row,
    valid_until: row.valid_until ?? null,
  }));
  const seed = {
    seed_date: seedDate,
    collection_key: collectionKey,
    count_policy: 'Visible review pools remain separate. Only deduped full platform review bodies marked review_count_eligible are used as direct evidence.',
    water_policy: 'Only official original text is stored in water facts. Review signals never determine water_system.',
    facility_names: facilityNames,
    normalization_exclusions: normalizationExclusions,
    facilities,
    evidence,
    water_facts: waterFacts,
    official_filter_facts: officialFilterFacts,
    review_signals: reviewSignals,
  };
  validateSeed(seed);
  return seed;
}

function validateSeed(seed) {
  if (seed.facilities.length !== expectedFacilityCount || seed.evidence.length !== expectedFacilityCount) throw new Error(`Expected ${expectedFacilityCount} regional facilities, found ${seed.facilities.length}/${seed.evidence.length}`);
  if (new Set(seed.facilities.map((row) => row.slug)).size !== expectedFacilityCount) throw new Error('Duplicate facility slug in seed.');
  if (seed.facilities.some((row) => !['active', 'draft', 'retired'].includes(row.status))) throw new Error('Regional facility seed contains an unsupported status.');
  if (isKansaiSaninSetouchi && seed.facilities.some((row) => !row.name_ko || !row.summary || !row.prefecture || !row.municipality || !row.onsen_area)) throw new Error('Kansai/Sanin/Setouchi localization contract failed.');
  const activeCount = seed.facilities.filter((row) => row.status === 'active').length;
  if (activeCount !== expectedActiveFacilityCount) throw new Error(`Expected ${expectedActiveFacilityCount} active facilities, found ${activeCount}.`);
  if (!isTohoku && !isIzuShizuoka && seed.facilities.some((row) => row.status !== 'active')) throw new Error('Every selected regional facility must be active.');
  if (isTohoku) {
    const actualDraftSlugs = new Set(seed.facilities.filter((row) => row.status === 'draft').map((row) => row.slug));
    if (actualDraftSlugs.size !== tohokuDraftSlugs.size || [...tohokuDraftSlugs].some((slug) => !actualDraftSlugs.has(slug))) throw new Error('Tohoku scope-hold status contract failed.');
  }
  if (isIzuShizuoka) {
    const actualDraftSlugs = seed.facilities.filter((row) => row.status === 'draft').map((row) => row.slug);
    const actualRetiredSlugs = new Set(seed.facilities.filter((row) => row.status === 'retired').map((row) => row.slug));
    if (actualDraftSlugs.length !== 1 || actualDraftSlugs[0] !== 'ito-kawana-irukahama') throw new Error('Izu/Shizuoka identity-hold status contract failed.');
    if (actualRetiredSlugs.size !== izuShizuokaRetiredSlugs.size || [...izuShizuokaRetiredSlugs].some((slug) => !actualRetiredSlugs.has(slug))) throw new Error('Izu/Shizuoka retired status contract failed.');
  }
  const evidenceBySlug = new Map(seed.evidence.map((row) => [row.facility_slug, row]));
  for (const row of seed.evidence) {
    if (row.deduped_direct_reviews > row.raw_direct_reviews || row.facility_related_direct_reviews > row.deduped_direct_reviews) throw new Error(`${row.facility_slug}: evidence count chain failed`);
    if (row.dayuse_only_direct_reviews + row.lodging_bath_only_direct_reviews > row.facility_related_direct_reviews) throw new Error(`${row.facility_slug}: scope count chain failed`);
  }
  for (const row of seed.review_signals) {
    const slug = row.evidence_ref.split(':')[0];
    const evidenceRow = evidenceBySlug.get(slug);
    const denominator = isKansaiSaninSetouchi
      ? evidenceRow?.dayuse_only_direct_reviews ?? 0
      : evidenceRow?.facility_related_direct_reviews ?? 0;
    if (row.signal_type === 'source_flow_claim') throw new Error(`${slug}: deprecated source_flow_claim leaked`);
    if (row.source_count > denominator) throw new Error(`${slug}: independent signal source count exceeds review denominator`);
  }
  const readyWaterFacts = seed.water_facts.filter((row) => row.method_render_status === 'ready');
  if (isIzuShizuoka) {
    if (readyWaterFacts.length !== 1 || readyWaterFacts[0].facility_slug !== 'ito-hokkawa-kuroane' || readyWaterFacts[0].water_system !== 'kakenagashi') throw new Error('Izu/Shizuoka ready water-method contract failed.');
  } else if (isChubuHokurikuKoshin) {
    const expectedReadyMethods = new Map([
      ['awara-saintpia', 'junkan'],
      ['nozawa-oyu', 'kakenagashi'],
      ['yudanaka-kaede-no-yu', 'kakenagashi'],
      ['bessho-otsukai-yu', 'kakenagashi'],
      ['shirahonet-public-openair', 'kakenagashi'],
      ['echigo-yuzawa-yama-no-yu', 'kakenagashi'],
    ]);
    if (readyWaterFacts.length !== expectedReadyMethods.size || readyWaterFacts.some((row) => expectedReadyMethods.get(row.facility_slug) !== row.water_system)) throw new Error('Chubu/Hokuriku/Koshin ready water-method contract failed.');
  } else if (isHokkaido) {
    const expectedReadyMethods = new Map([
      ['noboribetsu-sagiriyu', 'kakenagashi_pure'],
      ['noboribetsu-daiichi-dayuse', 'kakenagashi'],
      ['noboribetsu-manseikaku-dayuse', 'kakenagashi'],
      ['jozankei-hoheikyo', 'kakenagashi_pure'],
      ['hakodate-yachigashira', 'kakenagashi'],
    ]);
    if (readyWaterFacts.length !== expectedReadyMethods.size || readyWaterFacts.some((row) => expectedReadyMethods.get(row.facility_slug) !== row.water_system)) throw new Error('Hokkaido ready water-method contract failed.');
    const colorReady = seed.water_facts.filter((row) => row.color_filter_status === 'ready');
    const textureReady = seed.water_facts.filter((row) => row.texture_filter_status === 'ready_with_review_count');
    if (colorReady.length !== 1 || colorReady[0].facility_slug !== 'hakodate-yachigashira' || colorReady[0].water_color !== 'brown') throw new Error('Hokkaido color-filter contract failed.');
    if (textureReady.length !== 1 || textureReady[0].facility_slug !== 'hakodate-yachigashira' || !textureReady[0].texture_filter_candidates.includes('salt_warmth')) throw new Error('Hokkaido texture-filter contract failed.');
  } else if (isKansaiSaninSetouchi) {
    const expectedReadyMethods = new Map([
      ['dogo-asukanoyu', 'kakenagashi'],
      ['dogo-tsubakinoyu', 'kakenagashi'],
      ['hiroshima-yuki-lodge-dayuse', 'kakenagashi'],
      ['shirahama-sakinoyu', 'kakenagashi'],
      ['shirahama-shirarayu', 'kakenagashi'],
    ]);
    if (readyWaterFacts.length !== expectedReadyMethods.size || readyWaterFacts.some((row) => expectedReadyMethods.get(row.facility_slug) !== row.water_system)) throw new Error('Kansai/Sanin/Setouchi ready water-method contract failed.');
    if (readyWaterFacts.some((row) => row.water_system === 'kakenagashi_pure')) throw new Error('Kansai/Sanin/Setouchi pure-source badge requires stricter official proof.');
    const candidateOnlyExclusions = seed.normalization_exclusions.filter((row) => row.reason === 'candidate_only_non_bathing_or_unresolved_operation_excluded_from_facility_seed');
    if (candidateOnlyExclusions.length !== 28) throw new Error(`Expected 28 candidate-only exclusions, found ${candidateOnlyExclusions.length}.`);
  } else if (readyWaterFacts.length > 0) throw new Error('Regional water facts must not expose a facility-wide method badge in this batch.');
  if (seed.official_filter_facts.some((row) => !row.official_original_text || !row.official_source_url)) throw new Error('Official filter fact missing source contract.');
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(filePath, rows) {
  const columns = ['slug', 'name_ko', 'status', 'region_group', 'evidence_grade', 'facility_related_direct_reviews', 'direct_body_platform_count', 'collection_readiness', 'review_signal_count', 'official_filter_fact_count', 'water_fact_count'];
  const lines = [columns.join(','), ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(','))];
  writeFileSync(filePath, `${lines.join('\n')}\n`);
}

function sqlLiteral(value) {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replaceAll("'", "''")}'`;
}

function jsonbLiteral(value) {
  return `${sqlLiteral(JSON.stringify(value))}::jsonb`;
}

function buildSql(seed) {
  const lines = ['BEGIN;', ''];
  for (const row of seed.facilities) {
    const columns = Object.keys(row);
    lines.push(`INSERT INTO public.onsen_facilities (${columns.join(', ')}) VALUES (${columns.map((column) => ['aliases', 'official_profile', 'official_source_urls'].includes(column) ? jsonbLiteral(row[column]) : sqlLiteral(row[column])).join(', ')})`);
    lines.push(`ON CONFLICT (slug) DO UPDATE SET ${columns.filter((column) => column !== 'slug').map((column) => `${column} = EXCLUDED.${column}`).join(', ')}, updated_at = NOW();`, '');
  }
  for (const row of seed.evidence) {
    const columns = Object.keys(row);
    lines.push(`INSERT INTO public.onsen_facility_review_evidence (${columns.join(', ')}) VALUES (${columns.map((column) => ['visible_review_pools', 'direct_review_manifest'].includes(column) ? jsonbLiteral(row[column]) : sqlLiteral(row[column])).join(', ')})`);
    lines.push(`ON CONFLICT (facility_slug, collection_key) DO UPDATE SET ${columns.filter((column) => !['facility_slug', 'collection_key'].includes(column)).map((column) => `${column} = EXCLUDED.${column}`).join(', ')}, updated_at = NOW();`, '');
  }
  for (const row of seed.water_facts) {
    const columns = Object.keys(row);
    lines.push(`INSERT INTO public.onsen_facility_water_facts (${columns.join(', ')}) VALUES (${columns.map((column) => ['spring_types', 'texture_filter_candidates'].includes(column) ? jsonbLiteral(row[column]) : sqlLiteral(row[column])).join(', ')})`);
    lines.push(`ON CONFLICT (facility_slug, scope_key) DO UPDATE SET ${columns.filter((column) => !['facility_slug', 'scope_key'].includes(column)).map((column) => `${column} = EXCLUDED.${column}`).join(', ')}, updated_at = NOW();`, '');
  }
  for (const row of seed.official_filter_facts) {
    const columns = Object.keys(row);
    lines.push(`INSERT INTO public.onsen_facility_official_filter_facts (${columns.join(', ')}) VALUES (${columns.map((column) => column === 'filter_value' ? jsonbLiteral(row[column]) : sqlLiteral(row[column])).join(', ')})`);
    lines.push(`ON CONFLICT (facility_slug, filter_code, scope_key) DO UPDATE SET ${columns.filter((column) => !['facility_slug', 'filter_code', 'scope_key'].includes(column)).map((column) => `${column} = EXCLUDED.${column}`).join(', ')}, updated_at = NOW();`, '');
  }
  const evidenceRefs = unique(seed.review_signals.map((row) => row.evidence_ref));
  lines.push(`DELETE FROM public.onsen_facility_review_signals WHERE evidence_id IN (SELECT id FROM public.onsen_facility_review_evidence WHERE (facility_slug || ':' || collection_key) IN (${evidenceRefs.map(sqlLiteral).join(', ')}));`, '');
  for (const { evidence_ref: evidenceRef, ...row } of seed.review_signals) {
    const [facilitySlug, key] = evidenceRef.split(':');
    const columns = ['evidence_id', ...Object.keys(row)];
    const values = [`(SELECT id FROM public.onsen_facility_review_evidence WHERE facility_slug = ${sqlLiteral(facilitySlug)} AND collection_key = ${sqlLiteral(key)})`, ...Object.keys(row).map((column) => column === 'evidence_sources' ? jsonbLiteral(row[column]) : sqlLiteral(row[column]))];
    lines.push(`INSERT INTO public.onsen_facility_review_signals (${columns.join(', ')}) VALUES (${values.join(', ')});`);
  }
  lines.push('', 'COMMIT;', '');
  return lines.join('\n');
}

function markdownTable(rows, columns) {
  const escape = (value) => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', '<br>');
  return [`| ${columns.join(' | ')} |`, `| ${columns.map(() => '---').join(' | ')} |`, ...rows.map((row) => `| ${columns.map((column) => escape(row[column])).join(' | ')} |`)].join('\n');
}

function writeArtifacts(seed) {
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(paths.json, `${JSON.stringify(seed, null, 2)}\n`);
  const evidenceBySlug = new Map(seed.evidence.map((row) => [row.facility_slug, row]));
  const summary = seed.facilities.map((facility) => {
    const evidence = evidenceBySlug.get(facility.slug);
    return {
      slug: facility.slug,
      name_ko: facility.name_ko,
      status: facility.status,
      region_group: facility.region_group,
      evidence_grade: evidence.evidence_grade,
      facility_related_direct_reviews: evidence.facility_related_direct_reviews,
      direct_body_platform_count: evidence.direct_body_platform_count,
      collection_readiness: evidence.collection_readiness,
      review_signal_count: seed.review_signals.filter((row) => row.evidence_ref.startsWith(`${facility.slug}:`)).length,
      official_filter_fact_count: seed.official_filter_facts.filter((row) => row.facility_slug === facility.slug).length,
      water_fact_count: seed.water_facts.filter((row) => row.facility_slug === facility.slug).length,
    };
  });
  writeCsv(paths.csv, summary);
  writeFileSync(paths.sql, buildSql(seed));
  const activeCount = seed.facilities.filter((row) => row.status === 'active').length;
  const draftCount = seed.facilities.filter((row) => row.status === 'draft').length;
  const retiredCount = seed.facilities.filter((row) => row.status === 'retired').length;
  const readyMethodCount = seed.water_facts.filter((row) => row.method_render_status === 'ready').length;
  const facilityRelatedReviews = seed.evidence.reduce((sum, row) => sum + row.facility_related_direct_reviews, 0);
  const dayuseReviews = seed.evidence.reduce((sum, row) => sum + (row.dayuse_only_direct_reviews ?? 0), 0);
  const lodgingReviews = seed.evidence.reduce((sum, row) => sum + (row.lodging_bath_only_direct_reviews ?? 0), 0);
  const report = `# ${reportTitle} DB Seed\n\n- 생성일: ${seedDate}\n- 시설: ${seed.facilities.length}곳 (active ${activeCount}, draft ${draftCount}, retired ${retiredCount})\n- 시설 관련 직접 후기: ${facilityRelatedReviews}건\n- 당일입욕 직접 후기: ${dayuseReviews}건\n- 숙박탕 분리 후기: ${lodgingReviews}건\n- 후기 신호: ${seed.review_signals.length}건\n- 공식 필터 사실: ${seed.official_filter_facts.length}건\n- 공식 수질 사실: ${seed.water_facts.length}건\n- 공개 가능한 온천수 방식: ${readyMethodCount}건\n\n## 원칙\n\n- visible review pool은 직접 판독 분모에 합치지 않았습니다.\n- 통합 보강 원장이 있으면 base 원장 대신 canonical 원장으로 사용했습니다.\n- 후기의 감촉·색·온천감은 온천수 방식 근거로 사용하지 않았습니다.\n- 방식 배지는 공식 원문과 욕장 범위를 모두 통과한 사실만 공개합니다.\n- 실제 운영 시설 ${activeCount}곳만 탐색 가능한 active로 적재하고, 정체성·범위 보류 ${draftCount}곳은 draft, 폐업 확인 ${retiredCount}곳은 retired로 보존합니다.\n- 사용자 판정 공개 여부는 별도 verdict 게이트가 결정합니다.\n\n## 시설별 결과\n\n${markdownTable(summary, ['slug', 'name_ko', 'status', 'region_group', 'evidence_grade', 'facility_related_direct_reviews', 'direct_body_platform_count', 'review_signal_count', 'official_filter_fact_count', 'water_fact_count'])}\n`;
  writeFileSync(paths.report, report);
}

async function upsert(config, table, rows, conflict) {
  if (rows.length === 0) return [];
  return request(config, table, { on_conflict: conflict }, { method: 'POST', prefer: 'resolution=merge-duplicates,return=representation', body: rows });
}

async function applySeed(config, seed) {
  await upsert(config, 'onsen_facilities', seed.facilities, 'slug');
  await upsert(config, 'onsen_facility_water_facts', seed.water_facts, 'facility_slug,scope_key');
  await upsert(config, 'onsen_facility_official_filter_facts', seed.official_filter_facts, 'facility_slug,filter_code,scope_key');
  const loadedEvidence = await upsert(config, 'onsen_facility_review_evidence', seed.evidence, 'facility_slug,collection_key');
  const evidenceByRef = new Map(loadedEvidence.map((row) => [`${row.facility_slug}:${row.collection_key}`, row.id]));
  if (evidenceByRef.size !== seed.evidence.length) throw new Error('Evidence upsert did not return every row.');
  const evidenceIds = [...evidenceByRef.values()];
  if (evidenceIds.length > 0) await request(config, 'onsen_facility_review_signals', { evidence_id: `in.(${evidenceIds.join(',')})` }, { method: 'DELETE', prefer: 'return=minimal' });
  const signals = seed.review_signals.map(({ evidence_ref: evidenceRef, ...row }) => ({ ...row, evidence_id: evidenceByRef.get(evidenceRef) }));
  await request(config, 'onsen_facility_review_signals', {}, { method: 'POST', prefer: 'return=minimal', body: signals });
  const slugs = seed.facilities.map((row) => `"${row.slug}"`).join(',');
  const [facilities, evidence, reviewSignals, waterFacts, officialFacts] = await Promise.all([
    request(config, 'onsen_facilities', { select: 'slug,status,region_group', slug: `in.(${slugs})` }),
    request(config, 'onsen_facility_review_evidence', { select: 'id,facility_slug,facility_related_direct_reviews,dayuse_only_direct_reviews,lodging_bath_only_direct_reviews', collection_key: `eq.${collectionKey}` }),
    request(config, 'onsen_facility_review_signals', { select: 'id', evidence_id: `in.(${evidenceIds.join(',')})` }),
    request(config, 'onsen_facility_water_facts', { select: 'id,facility_slug', facility_slug: `in.(${slugs})` }),
    request(config, 'onsen_facility_official_filter_facts', { select: 'id,facility_slug', facility_slug: `in.(${slugs})` }),
  ]);
  const verification = {
    facilities: facilities.length,
    active_facilities: facilities.filter((row) => row.status === 'active').length,
    draft_facilities: facilities.filter((row) => row.status === 'draft').length,
    retired_facilities: facilities.filter((row) => row.status === 'retired').length,
    status_match: facilities.length === seed.facilities.length && facilities.every((row) => seed.facilities.find((seedRow) => seedRow.slug === row.slug)?.status === row.status),
    all_active: facilities.length === seed.facilities.length && facilities.every((row) => row.status === 'active'),
    evidence: evidence.length,
    direct_reviews: evidence.reduce((sum, row) => sum + row.facility_related_direct_reviews, 0),
    dayuse_direct_reviews: evidence.reduce((sum, row) => sum + (row.dayuse_only_direct_reviews ?? 0), 0),
    lodging_direct_reviews: evidence.reduce((sum, row) => sum + (row.lodging_bath_only_direct_reviews ?? 0), 0),
    review_signals: reviewSignals.length,
    water_facts: waterFacts.length,
    official_filter_facts: officialFacts.length,
  };
  if (!verification.status_match || verification.active_facilities !== expectedActiveFacilityCount || verification.evidence !== seed.evidence.length || verification.review_signals !== seed.review_signals.length) throw new Error(`Post-load verification failed: ${JSON.stringify(verification)}`);
  return verification;
}

async function main() {
  const seed = buildSeed();
  writeArtifacts(seed);
  let verification = null;
  if (shouldApply) {
    verification = await applySeed(readConfig(), seed);
    writeFileSync(paths.loadReport, `# ${reportTitle} DB 적재 리포트\n\n- 적재일: ${seedDate}\n- 시설: ${verification.facilities}곳\n- active: ${verification.active_facilities}곳\n- draft: ${verification.draft_facilities}곳\n- retired: ${verification.retired_facilities}곳\n- seed 상태 일치: ${verification.status_match ? '예' : '아니오'}\n- 시설 관련 직접 후기: ${verification.direct_reviews}건\n- 당일입욕 직접 후기: ${verification.dayuse_direct_reviews}건\n- 숙박탕 분리 후기: ${verification.lodging_direct_reviews}건\n- 후기 신호: ${verification.review_signals}건\n- 공식 수질 사실: ${verification.water_facts}건\n- 공식 필터 사실: ${verification.official_filter_facts}건\n- visible review pool과 직접 판독 분모를 분리했습니다.\n- 후기 신호를 온천수 방식 근거로 사용하지 않았습니다.\n`);
  }
  console.log(JSON.stringify({
    facilities: seed.facilities.length,
    active_facilities: seed.facilities.filter((row) => row.status === 'active').length,
    draft_facilities: seed.facilities.filter((row) => row.status === 'draft').length,
    retired_facilities: seed.facilities.filter((row) => row.status === 'retired').length,
    direct_reviews: seed.evidence.reduce((sum, row) => sum + (row.dayuse_only_direct_reviews ?? row.facility_related_direct_reviews), 0),
    facility_related_direct_reviews: seed.evidence.reduce((sum, row) => sum + row.facility_related_direct_reviews, 0),
    lodging_direct_reviews: seed.evidence.reduce((sum, row) => sum + (row.lodging_bath_only_direct_reviews ?? 0), 0),
    review_signals: seed.review_signals.length,
    official_filter_facts: seed.official_filter_facts.length,
    water_facts: seed.water_facts.length,
    outputs: Object.fromEntries(Object.entries(paths).filter(([key]) => key !== 'loadReport' || shouldApply).map(([key, value]) => [key, path.relative(repoRoot, value)])),
    verification,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exit(1);
});
