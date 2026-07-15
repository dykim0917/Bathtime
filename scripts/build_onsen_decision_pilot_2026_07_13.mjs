#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const date = process.argv.find((argument) => argument.startsWith('--date='))?.slice('--date='.length) ?? '2026-07-13';
const shouldApply = process.argv.includes('--apply');
const outputDir = path.join(repoRoot, 'research', 'onsen-db-seed', `decision-goal-${date}`);
const dynamicFactValidUntil = (() => {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + 30);
  return value.toISOString().slice(0, 10);
})();

const questionOrder = [
  'together_private_eligibility',
  'bath_layout_scope',
  'private_bath_booking_flow',
  'private_bath_terms_limits',
  'day_use_operation',
  'bath_experience_richness',
  'water_operation_method',
];

const questionLabels = {
  together_private_eligibility: '동반·프라이빗 이용',
  bath_layout_scope: '객실탕·대절탕·공용탕 구성',
  private_bath_booking_flow: '프라이빗탕 이용 방식',
  private_bath_terms_limits: '프라이빗탕 요금·시간·대상',
  day_use_operation: '당일입욕 운영',
  bath_experience_richness: '탕 경험의 밀도',
  water_operation_method: '온천수 방식·조건',
};

const source = (url, originalText, checkedAt = date) => ({
  official_source_url: url,
  official_original_text: originalText,
  official_source_checked_at: checkedAt,
});

const answer = (status, answerKo, options = {}) => ({
  status,
  applicability: options.applicability ?? 'applicable',
  answer_ko: answerKo,
  scope: options.scope ?? null,
  official_source_url: options.url ?? null,
  official_original_text: options.original ?? null,
  official_source_checked_at: options.checkedAt ?? (options.url ? date : null),
  check_what: options.checkWhat ?? null,
});

const needsCheck = (checkWhat, options = {}) => answer(
  'needs_check',
  options.answerKo ?? '공식 원문과 적용 범위를 더 확인해야 합니다.',
  { ...options, checkWhat },
);

const notApplicable = (answerKo, options = {}) => answer(
  'verified',
  answerKo,
  { ...options, applicability: 'not_applicable' },
);

const fact = ({ code, scopeKey, scopeLabelKo, availability = 'confirmed', filterValue = {}, url, original, checkedAt = date, validUntil = null }) => ({
  filter_code: code,
  scope_key: scopeKey,
  scope_label_ko: scopeLabelKo,
  availability,
  filter_value: filterValue,
  filter_status: 'ready',
  official_original_text: original,
  official_source_url: url,
  source_kind: 'operator_official',
  official_source_checked_at: checkedAt,
  valid_until: validUntil,
  source_file: `scripts/build_onsen_decision_pilot_2026_07_13.mjs`,
});

const waterFact = ({ scopeKey, scopeLabelKo, waterSystem = null, kasui = 'unknown', kaon = 'unknown', junkan = 'unknown', disinfection = 'unknown', methodRenderStatus = 'no_badge', url, original, checkedAt = date }) => ({
  scope_key: scopeKey,
  scope_label_ko: scopeLabelKo,
  water_system: waterSystem,
  kasui,
  kaon,
  junkan,
  disinfection,
  method_render_status: methodRenderStatus,
  official_original_text: original,
  official_source_url: url,
  official_source_checked_at: checkedAt,
  source_kind: 'operator_official',
  source_file: `scripts/build_onsen_decision_pilot_2026_07_13.mjs`,
});

function koreanSearch(query) {
  return `https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`;
}

function demand({ kind = 'korean_search_surface', url, note }) {
  return {
    evidence_kind: kind,
    evidence_url: url,
    checked_at: date,
    note,
    count_policy: '한국어 수요 탐색 근거입니다. 노출 후기 수나 검색 스니펫은 직접 판독 후기 분모에 넣지 않습니다.',
  };
}

function roomPrivateQuestions({ roomText, roomUrl, roomScope, dayUse, richness, water, extraLayout = null, checkedAt = date }) {
  const roomOptions = {
    url: roomUrl,
    original: roomText,
    checkedAt,
    scope: roomScope,
  };
  return {
    together_private_eligibility: answer(
      'verified',
      '온천 노천탕이 있는 객실 타입을 예약하면 동행인과 객실 안에서 프라이빗하게 이용하는 구성입니다.',
      roomOptions,
    ),
    bath_layout_scope: answer(
      'verified',
      extraLayout ?? '객실 전용 노천탕을 중심으로 이용하며, 공용탕·대절탕의 별도 운영 범위는 공식 안내에 적힌 범위만 구분해 봐야 합니다.',
      roomOptions,
    ),
    private_bath_booking_flow: answer(
      'verified',
      '객실 전용탕은 해당 객실을 예약하면 함께 제공되는 구성이라, 별도 대절탕 예약 절차는 적용되지 않습니다.',
      roomOptions,
    ),
    private_bath_terms_limits: answer(
      'conditional',
      '객실 숙박 요금에 포함된 설비입니다. 객실별 요금과 이용 가능 시간은 예약하려는 객실 타입·플랜에서 확인해야 합니다.',
      { ...roomOptions, checkWhat: '예약 화면에서 객실별 온천탕 포함 여부와 체크인·체크아웃 기준 이용 시간을 확인합니다.' },
    ),
    day_use_operation: dayUse,
    bath_experience_richness: richness,
    water_operation_method: water,
  };
}

const initialAccommodationCatalog = [
  {
    slug: 'yufuin-musouen',
    name_ko: '야마노호텔 무소엔',
    name_ja: '山のホテル 夢想園',
    name_en: 'Yama no Hotel Musouen',
    journey: '탕 자체가 목적인 온천 숙소',
    korean_demand: demand({
      kind: 'korean_direct_travel_review',
      url: 'https://www.keyzard.cc/riming_7/nb/224128348350',
      note: '한국어 개인 여행 후기가 대형 노천탕·유후다케 조망을 직접 설명합니다.',
    }),
    scores: { korean_demand: 5, decision_difficulty: 5, bath_experience: 5, evidence_collectability: 5, journey_fit: 5 },
    selection_reason: '대형 공용 노천탕과 가족탕의 빈 탕 이용 방식, 짧은 당일입욕 시간이 한 번에 비교 대상이 됩니다.',
    official_urls: ['https://www.musouen.co.jp/spa/', 'https://www.musouen.co.jp/higaeri/?id=sec3', 'https://www.musouen.co.jp/faq/'],
    questions: {
      together_private_eligibility: answer('verified', '가족탕은 가족·그룹이 함께 이용하는 프라이빗탕입니다.', { url: 'https://www.musouen.co.jp/higaeri/?id=sec3', original: '家族露天風呂・家族内湯をご用意しております。', scope: '가족 노천탕·가족 내탕' }),
      bath_layout_scope: answer('verified', '남녀별 대형 노천탕과 가족 노천탕·가족 내탕이 함께 있습니다.', { url: 'https://www.musouen.co.jp/higaeri/?id=sec3', original: '男湯・女湯の露天風呂、家族露天風呂、家族内湯。', scope: '당일입욕 안내 범위' }),
      private_bath_booking_flow: answer('verified', '가족탕은 사전 예약을 받지 않으며, 현장에서 빈 탕이면 이용하는 방식입니다.', { url: 'https://www.musouen.co.jp/faq/', original: '家族風呂の予約はお受けしておりません。空いていればご利用いただけます。', scope: '가족탕' }),
      private_bath_terms_limits: answer('conditional', '가족탕은 빈 탕을 직접 확인해 이용하며, 약 1시간 이용을 안내합니다. 별도 요금·정원은 방문 전 재확인이 필요합니다.', { url: 'https://www.musouen.co.jp/faq/', original: 'ご利用時間の目安は約1時間です。', scope: '가족탕', checkWhat: '당일 가족탕 요금·정원·청소 시간은 프런트 또는 공식 공지에서 확인합니다.' }),
      day_use_operation: answer('verified', '당일입욕 접수는 10:00~14:00, 입욕은 14:30까지입니다. 성인 1,000엔이며 타월은 지참 또는 구매합니다.', { url: 'https://www.musouen.co.jp/higaeri/?id=sec3', original: '受付時間 10:00〜14:00／入浴時間 14:30まで／大人 1,000円。', scope: '당일입욕', checkWhat: '청소일·부분 휴장과 날씨·공사 변동은 당일 공식 공지를 확인합니다.' }),
      bath_experience_richness: answer('verified', '유후다케와 유후인 분지를 바라보는 대형 노천탕이 핵심이며, 남녀 탕의 크기와 전망이 분명한 차별점입니다.', { url: 'https://www.musouen.co.jp/lg_ko/', original: '由布岳と由布院盆地を一望できる立地と大露天風呂が自慢です。', scope: '공용 노천탕' }),
      water_operation_method: needsCheck('공식 페이지에서 직수·순환·가수·가온·소독 조건을 욕장 범위와 함께 확인한 뒤에만 방식 배지를 검토합니다.', { answerKo: '온천수 방식은 공식 원문과 욕장 범위가 아직 잠기지 않아 배지를 공개하지 않습니다.' }),
    },
    facts: [
      fact({ code: 'family_bath', scopeKey: 'dayuse-family-baths', scopeLabelKo: '당일입욕 가족탕', filterValue: { reservation: 'walk_in_when_vacant', reservation_required: false, usage_guide_minutes: 60 }, url: 'https://www.musouen.co.jp/faq/', original: '家族風呂の予約はお受けしておりません。空いていればご利用いただけます。ご利用時間の目安は約1時間です。' }),
      fact({ code: 'day_use', scopeKey: 'dayuse-bathing', scopeLabelKo: '당일입욕', filterValue: { reception: '10:00-14:00', closes_at: '14:30', adult_price_jpy: 1000, towel_policy: 'bring_or_purchase' }, url: 'https://www.musouen.co.jp/higaeri/?id=sec3', original: '受付時間 10:00〜14:00／入浴時間 14:30まで／大人 1,000円。' }),
      fact({ code: 'open_air_bath', scopeKey: 'gender-public-open-air', scopeLabelKo: '남녀별 공용 노천탕', url: 'https://www.musouen.co.jp/spa/', original: '大露天風呂「弘法の湯」「空海の湯」。' }),
    ],
  },
  {
    slug: 'yufuin-baien',
    name_ko: '유후인 바이엔 가든 리조트',
    name_ja: '由布院 梅園 GARDEN RESORT',
    name_en: 'Yufuin Baien Garden Resort',
    journey: '연인과 함께 쓰는 프라이빗 온천',
    korean_demand: demand({ kind: 'korean_direct_travel_review', url: 'https://hiandrew.tistory.com/172', note: '한국어 개인 숙박 후기가 가족탕·객실탕·대욕장을 비교합니다.' }),
    scores: { korean_demand: 5, decision_difficulty: 5, bath_experience: 4, evidence_collectability: 5, journey_fit: 5 },
    selection_reason: '무료 가족탕의 빈 탕 이용과 객실 타입별 온천탕, 당일 플랜의 상충 공지가 함께 있어 결정 마찰이 큽니다.',
    official_urls: ['https://www.yufuin-baien.com/faq/', 'https://www.yufuin-baien.com/onsen/', 'https://www.yufuin-baien.com/room_hanare/'],
    questions: {
      together_private_eligibility: answer('verified', '숙박객은 가족탕을 무료로 이용할 수 있고, 별채 일부 객실에는 객실탕이 있습니다.', { url: 'https://www.yufuin-baien.com/faq/', original: '離れ客室のみ客室風呂がございます。ご宿泊のお客様は家族風呂を無料でご利用いただけます。', scope: '별채 객실·가족탕' }),
      bath_layout_scope: answer('verified', '별채 객실탕, 대욕장, 2동의 가족탕을 구분해 운영합니다.', { url: 'https://www.yufuin-baien.com/onsen/', original: '大浴場と家族風呂2棟をご用意しております。', scope: '온천 시설' }),
      private_bath_booking_flow: answer('verified', '가족탕은 예약하지 않고 빈 탕일 때 이용하는 방식입니다.', { url: 'https://www.yufuin-baien.com/faq/', original: '家族風呂は予約制ではございません。空いている時にご利用ください。', scope: '가족탕' }),
      private_bath_terms_limits: answer('conditional', '가족탕은 숙박객 무료입니다. 운영 시간은 06:00~10:00와 15:00~24:00이며, 대기 가능성은 방문일에 확인해야 합니다.', { url: 'https://www.yufuin-baien.com/faq/', original: 'ご利用時間は6:00〜10:00、15:00〜24:00です。', scope: '가족탕', checkWhat: '객실별 객실탕 포함 여부와 당일 대기 상황을 예약·체크인 시 확인합니다.' }),
      day_use_operation: answer('conditional', 'FAQ는 당일입욕을 받지 않는다고 안내하지만, 공식 공지에는 식사 포함 한정 플랜이 게시된 적이 있습니다. 현재 판매 여부를 확인해야 합니다.', { url: 'https://www.yufuin-baien.com/wp/?p=9058', original: '日帰り昼食と温泉のプランをご用意しました。', scope: '한정 당일 플랜', checkWhat: '공식 예약 페이지에서 현재 당일 플랜 판매 여부·시간·요금을 확인합니다.' }),
      bath_experience_richness: answer('verified', '유후다케 조망 공용 노천 암반탕과 히노키 내탕, 가족탕을 함께 갖춘 정원형 숙소입니다.', { url: 'https://www.yufuin-baien.com/onsen/', original: '由布岳を望む露天岩風呂と檜の内湯、家族風呂。', scope: '공용탕·가족탕' }),
      water_operation_method: answer('verified', '공용·가족탕 범위에서 직수가 공식 원문으로 확인됩니다. 가수는 확인되며 가온·소독은 알 수 없어 순수직수로는 표시하지 않습니다.', { url: 'https://www.yufuin-baien.com/onsen/', original: '湧き出したままの新鮮な源泉かけ流し。源泉が70℃以上のため加水しています。', scope: '공용탕·가족탕', checkWhat: '가온·소독 조건은 공식 최신 수질표로 재확인합니다.' }),
    },
    facts: [
      fact({ code: 'family_bath', scopeKey: 'guest-family-bath', scopeLabelKo: '숙박객 가족탕', filterValue: { reservation: 'walk_in_when_vacant', reservation_required: false, room_fee_jpy: 0, hours: '06:00-10:00;15:00-24:00' }, url: 'https://www.yufuin-baien.com/faq/', original: 'ご宿泊のお客様は家族風呂を無料でご利用いただけます。予約制ではございません。空いている時にご利用ください。' }),
      fact({ code: 'private_bath', scopeKey: 'hanare-room-bath', scopeLabelKo: '별채 객실탕', filterValue: { included_with: 'eligible_hanare_room' }, url: 'https://www.yufuin-baien.com/room_hanare/', original: '離れ客室のみ客室風呂がございます。' }),
      fact({ code: 'day_use', scopeKey: 'limited-meal-onsen-plan', scopeLabelKo: '한정 식사·온천 플랜', availability: 'conditional', filterValue: { condition_ko: '판매 공지형 한정 플랜으로 현재 판매 여부 확인 필요' }, url: 'https://www.yufuin-baien.com/wp/?p=9058', original: '日帰り昼食と温泉のプランをご用意しました。' }),
      fact({ code: 'open_air_bath', scopeKey: 'public-yufudake-view', scopeLabelKo: '유후다케 조망 공용 노천탕', url: 'https://www.yufuin-baien.com/onsen/', original: '由布岳を望む露天岩風呂。' }),
    ],
  },
  {
    slug: 'yufuin-konjakuan',
    name_ko: '벳소 콘자쿠안',
    name_ja: '別荘 今昔庵',
    name_en: 'Besso Konjakuan',
    journey: '연인과 함께 쓰는 프라이빗 온천',
    korean_demand: demand({ kind: 'korean_travel_product', url: 'https://www.turista.co.kr/files/product/453/b1cab4000af695a9220093ffc96c5304.pdf', note: '한국어 온천 숙소 순례 상품이 콘자쿠안을 일정에 명시합니다.' }),
    scores: { korean_demand: 4, decision_difficulty: 4, bath_experience: 4, evidence_collectability: 4, journey_fit: 5 },
    selection_reason: '객실 전용 노천탕과 별도 가족탕이 공존해, 예약한 객실과 사용할 탕 범위를 분리해서 판단해야 합니다.',
    official_urls: ['https://konjakuan.co.jp/', 'https://konjakuan.co.jp/onsen/', 'https://konjakuan.co.jp/honkan/'],
    questions: roomPrivateQuestions({
      roomText: '離れ4室、母屋4室には温泉露天風呂をご用意しております。客室風呂と露天・内湯の2つの貸切家族風呂でも由布院温泉をお楽しみいただけます。',
      roomUrl: 'https://konjakuan.co.jp/onsen/',
      roomScope: '별채 4실·모옥 4실의 객실 노천탕과 대절 가족탕',
      extraLayout: '별채 4실과 모옥 4실에는 객실 온천 노천탕이 있고, 객실탕과 노천·내탕 2개의 대절 가족탕을 분리해 안내합니다.',
      dayUse: needsCheck('당일입욕 판매 여부와 운영 시간을 공식 예약 페이지에서 확인합니다.', { answerKo: '당일입욕 운영은 현재 공식 안내에서 확정하지 못해 공개하지 않습니다.' }),
      richness: answer('verified', '총 9객실의 소규모 숙소에서 객실 전용 노천탕과 두 가지 대절 가족탕을 중심으로 온천 체류를 구성합니다.', { url: 'https://konjakuan.co.jp/', original: '9つの客室。離れに4室と母屋に5室。', scope: '숙소 전체' }),
      water: answer('verified', '객실탕과 대절 가족탕 범위의 직수 표기는 공식 원문으로 확인됩니다. 가수·가온·소독은 알 수 없어 순수직수는 아닙니다.', { url: 'https://konjakuan.co.jp/onsen/', original: '源泉100%かけ流し。', scope: '객실탕·대절 가족탕', checkWhat: '가수·가온·소독 조건은 최신 수질표로 재확인합니다.' }),
    }),
    facts: [
      fact({ code: 'private_bath', scopeKey: 'room-open-air-baths', scopeLabelKo: '객실 온천 노천탕', filterValue: { room_count: 8, included_with: 'eligible_room_type' }, url: 'https://konjakuan.co.jp/onsen/', original: '離れ4室、母屋4室には温泉露天風呂をご用意しております。' }),
      fact({ code: 'family_bath', scopeKey: 'private-family-baths', scopeLabelKo: '노천·내탕 대절 가족탕', filterValue: { bath_count: 2 }, url: 'https://konjakuan.co.jp/onsen/', original: '露天・内湯の2つの貸切家族風呂。' }),
    ],
  },
  {
    slug: 'yufuin-sakuratei',
    name_ko: '오야도 사쿠라테이',
    name_ja: '全室露天付き離れ宿 御宿 さくら亭',
    name_en: 'Oyado Sakuratei',
    journey: '연인과 함께 쓰는 프라이빗 온천',
    korean_demand: demand({ kind: 'korean_direct_travel_review', url: 'https://readyggo.tistory.com/1076', note: '한국어 유후인 료칸 비교·숙박 후기에 사쿠라테이가 포함됩니다.' }),
    scores: { korean_demand: 4, decision_difficulty: 4, bath_experience: 4, evidence_collectability: 4, journey_fit: 5 },
    selection_reason: '전 객실 별채·노천탕 구성은 연인 프라이빗 온천 여정의 대표 비교 기준입니다.',
    official_urls: ['https://www.sakuratei.info/'],
    questions: roomPrivateQuestions({
      roomText: '全10棟が離れで、全室に露天風呂を備えております。',
      roomUrl: 'https://www.sakuratei.info/',
      roomScope: '전 10동 별채 객실 노천탕',
      extraLayout: '전 10동이 별채이며 각 객실에 노천탕이 있어, 객실 단위의 프라이빗 온천 체류가 중심입니다.',
      dayUse: needsCheck('당일입욕 상품 유무·시간·요금을 현재 공식 예약 화면에서 확인합니다.', { answerKo: '당일입욕 운영은 공식 현재 페이지에서 확정하지 못했습니다.' }),
      richness: answer('verified', '별채 객실마다 노천탕을 둔 소규모 숙소로, 공용 대욕장 규모보다 방 안의 온천 시간을 우선하는 구성입니다.', { url: 'https://www.sakuratei.info/', original: '全室露天付き離れ宿。', scope: '객실' }),
      water: answer('conditional', '직수 표기는 기존 공식 원장에 있으나, 현재 페이지에서 가수·가온·소독 조건까지 다시 잠그지 못해 배지는 보류합니다.', { url: 'https://www.sakuratei.info/', original: '源泉かけ流し露天風呂付き。', scope: '객실 노천탕', checkWhat: '공식 수질표에서 가수·가온·소독 조건과 객실탕 적용 범위를 재확인합니다.' }),
    }),
    facts: [
      fact({ code: 'private_bath', scopeKey: 'all-room-open-air-bath', scopeLabelKo: '전 객실 노천탕', filterValue: { room_count: 10, included_with: 'all_rooms' }, url: 'https://www.sakuratei.info/', original: '全10棟が離れで、全室に露天風呂を備えております。' }),
      fact({ code: 'open_air_bath', scopeKey: 'all-room-open-air-bath', scopeLabelKo: '전 객실 노천탕', url: 'https://www.sakuratei.info/', original: '全室に露天風呂を備えております。' }),
    ],
  },
  {
    slug: 'beppu-yunosato-hayama',
    name_ko: '유노사토 하야마',
    name_ja: '別府 鉄輪温泉 湯の里 葉山',
    name_en: 'Yunosato Hayama',
    journey: '연인과 함께 쓰는 프라이빗 온천',
    korean_demand: demand({ url: koreanSearch('벳푸 유노사토 하야마 료칸 후기'), note: '한국어 검색·블로그 탐색 표면에서 벳푸 객실탕·대절탕 비교 수요를 확인했습니다.' }),
    scores: { korean_demand: 4, decision_difficulty: 5, bath_experience: 4, evidence_collectability: 4, journey_fit: 5 },
    selection_reason: '공용탕·3종 대절탕·일부 객실탕을 함께 제공해 프라이빗 이용 범위를 분리해야 합니다.',
    official_urls: ['https://yunosato-hayama.co.jp/spa/', 'https://yunosato-hayama.co.jp/sp/index.html'],
    questions: {
      together_private_eligibility: answer('verified', '대절탕 3종은 동행인과 함께 쓰는 프라이빗탕으로 안내됩니다.', { url: 'https://yunosato-hayama.co.jp/spa/', original: '3種類の貸切湯が自慢です。', scope: '대절탕' }),
      bath_layout_scope: answer('verified', '남녀 공용탕과 노천·내탕 대절탕 3종을 분리해 운영하며, 객실탕은 객실 타입별로 확인해야 합니다.', { url: 'https://yunosato-hayama.co.jp/spa/', original: '源泉かけ流しの4つの鉄輪温泉湯巡り。3種類の貸切湯。', scope: '공용탕·대절탕' }),
      private_bath_booking_flow: needsCheck('대절탕의 예약 시점·채널·빈 탕 확인 방식은 공식 현재 안내에서 확인합니다.', { answerKo: '대절탕은 운영하지만 사전예약·선착순·빈 탕 이용 중 어떤 방식인지는 공식 원문으로 잠기지 않았습니다.' }),
      private_bath_terms_limits: needsCheck('대절탕의 요금·시간·정원·숙박객 대상 여부를 공식 예약 페이지에서 확인합니다.', { answerKo: '대절탕의 이용 시간·요금·정원은 현재 공식 원문으로 확정하지 못했습니다.' }),
      day_use_operation: needsCheck('당일입욕 가능 여부와 운영 시간을 공식 공지에서 확인합니다.', { answerKo: '당일입욕 운영은 현재 공식 페이지에서 확정하지 못했습니다.' }),
      bath_experience_richness: answer('verified', '철륜온천의 서로 다른 네 탕과 노천·내탕 대절탕을 함께 이용하는 숙소입니다.', { url: 'https://yunosato-hayama.co.jp/spa/', original: '源泉かけ流しの4つの鉄輪温泉湯巡り。', scope: '공용탕·대절탕' }),
      water_operation_method: answer('verified', '공용탕과 대절탕 범위에서 직수가 공식 원문으로 확인됩니다. 조건은 알 수 없어 순수직수로는 표시하지 않습니다.', { url: 'https://yunosato-hayama.co.jp/spa/', original: '源泉かけ流しの4つの鉄輪温泉湯巡り。3種類の貸切湯が自慢の天然温泉かけ流しの宿です。', scope: '공용탕·대절탕', checkWhat: '가수·가온·소독 조건을 별도 공식 수질표에서 확인합니다.' }),
    },
    facts: [
      fact({ code: 'private_bath', scopeKey: 'three-private-baths', scopeLabelKo: '3종 대절탕', filterValue: { bath_count: 3 }, url: 'https://yunosato-hayama.co.jp/spa/', original: '3種類の貸切湯が自慢です。' }),
      fact({ code: 'open_air_bath', scopeKey: 'private-open-air-sakura', scopeLabelKo: '대절 노천탕 사쿠라', url: 'https://yunosato-hayama.co.jp/spa/', original: '貸切露天風呂「桜」。' }),
    ],
  },
  {
    slug: 'beppu-amane-resort-seikai',
    name_ko: '아마네 리조트 세이카이',
    name_ja: 'AMANE RESORT SEIKAI',
    name_en: 'AMANE RESORT SEIKAI',
    journey: '연인과 함께 쓰는 프라이빗 온천',
    korean_demand: demand({ url: koreanSearch('벳푸 아마네 리조트 세이카이 후기'), note: '한국어 검색·커뮤니티 탐색 표면에서 해안 객실 노천탕 수요를 확인했습니다.' }),
    scores: { korean_demand: 4, decision_difficulty: 4, bath_experience: 5, evidence_collectability: 3, journey_fit: 5 },
    selection_reason: '바다 전망과 객실탕을 함께 찾는 벳푸 대표 후보지만, 대절·당일 운영 세부는 보강 대상으로 남습니다.',
    official_urls: ['https://www.seikai.co.jp/room/', 'https://www.seikai.co.jp/onsen/'],
    questions: roomPrivateQuestions({
      roomText: '全てが客室露天風呂付き＆オーシャンビューで、客室露天風呂は、源泉掛け流しの温泉です。',
      roomUrl: 'https://www.seikai.co.jp/room/',
      roomScope: '전 객실 원천 직수 반노천탕',
      extraLayout: '객실 반노천탕이 중심이며, 공용 대욕장과 객실탕의 운영 범위는 따로 확인해야 합니다.',
      dayUse: answer('conditional', '외래입욕은 12:30~22:00이며 최종 접수는 21:30입니다. 입욕만 이용하면 성인 2,500엔이며, 식사 이용 뒤에는 성인 1,000엔입니다.', { url: 'https://www.seikai.co.jp/onsen/', original: 'ご入浴時間（外来入浴）12:30～22:00（最終受付21:30）。外来入浴料金（入浴のみ）大人2,500円。（食事利用後）大人1,000円。', scope: '하레노동 1층 공용 대욕장', checkWhat: '방문일의 외래입욕 운영, 휴관·혼잡 제한과 아동 요금은 공식 페이지에서 다시 확인합니다.' }),
      richness: answer('verified', '벳푸 해안의 객실 반노천탕과 바다 조망을 함께 보는 리조트형 숙소입니다.', { url: 'https://seikai.co.jp/', original: '全室オーシャンビュー。', scope: '객실' }),
      water: answer('conditional', '객실 반노천탕의 직수 표기는 공식 페이지에 있으나, 가수·가온·소독 조건과 공용탕 범위는 분리 확인이 필요합니다.', { url: 'https://seikai.co.jp/', original: '全室に源泉かけ流しの半露天風呂。', scope: '객실 반노천탕', checkWhat: '객실탕과 공용탕의 수질 운용을 각각 공식 수질표로 확인합니다.' }),
    }),
    facts: [
      fact({ code: 'private_bath', scopeKey: 'all-room-half-open-air', scopeLabelKo: '전 객실 반노천탕', filterValue: { included_with: 'all_rooms' }, url: 'https://www.seikai.co.jp/room/', original: '全てが客室露天風呂付き＆オーシャンビューで、客室露天風呂は、源泉掛け流しの温泉です。' }),
      fact({ code: 'day_use', scopeKey: 'external-public-bath', scopeLabelKo: '외래입욕 공용 대욕장', filterValue: { hours: '12:30-22:00', final_entry: '21:30', adult_jpy: 2500, adult_after_dining_jpy: 1000, child_under_12_jpy: 1000, child_after_dining_jpy: 0 }, url: 'https://www.seikai.co.jp/onsen/', original: 'ご入浴時間（外来入浴）12:30～22:00（最終受付21:30）。外来入浴料金（入浴のみ）大人2,500円　12歳以下1,000円（食事利用後）大人1,000円　12歳以下無料。', validUntil: dynamicFactValidUntil }),
      fact({ code: 'adult_day_use_price', scopeKey: 'external-public-bath-admission', scopeLabelKo: '외래입욕 성인 요금', filterValue: { adult_jpy: 2500, adult_after_dining_jpy: 1000, condition_ko: '식사 이용 후 할인 요금 적용' }, url: 'https://www.seikai.co.jp/onsen/', original: '外来入浴料金（入浴のみ）大人2,500円。（食事利用後）大人1,000円。', validUntil: dynamicFactValidUntil }),
    ],
  },
  {
    slug: 'atami-new-tomiyoshi',
    name_ko: '뉴 토미요시',
    name_ja: '味と湯の宿 ニューとみよし',
    name_en: 'New Tomiyoshi',
    journey: '연인과 함께 쓰는 프라이빗 온천',
    korean_demand: demand({ url: koreanSearch('아타미 뉴 토미요시 료칸 후기'), note: '한국어 검색·블로그 탐색 표면에서 다수의 대절 노천탕을 찾는 수요를 확인했습니다.' }),
    scores: { korean_demand: 4, decision_difficulty: 5, bath_experience: 5, evidence_collectability: 5, journey_fit: 5 },
    selection_reason: '숙박객이 14개 대절 노천탕을 예약 없이 빈 탕 기준으로 반복 이용하는 흐름이 매우 분명합니다.',
    official_urls: ['https://newtomi.jp/spa/', 'https://newtomi.jp/support/'],
    questions: {
      together_private_eligibility: answer('verified', '숙박객이 대절 노천탕을 동행인과 프라이빗하게 이용하는 구성입니다.', { url: 'https://newtomi.jp/support/', original: '全14の貸切露天風呂はご宿泊のお客様に無料でご利用いただけます。', scope: '숙박객 대절 노천탕' }),
      bath_layout_scope: answer('verified', '대절 노천탕 14개와 대절 사우나 3개를 중심으로 운영하며, 객실 타입별 탕은 별도 확인해야 합니다.', { url: 'https://newtomi.jp/spa/', original: '貸切露天風呂11ヶ所と貸切サウナ3ヶ所。', scope: '숙박객 전용 대절 시설' }),
      private_bath_booking_flow: answer('verified', '사전 예약 없이, 스마트폰·PC로 이용 상태를 보고 빈 탕이면 이용하는 방식입니다.', { url: 'https://newtomi.jp/support/', original: 'ご予約は不要です。空いていればいつでもご利用いただけます。スマホやPCで利用状況をご確認いただけます。', scope: '대절 노천탕' }),
      private_bath_terms_limits: answer('verified', '숙박객은 체크인부터 체크아웃까지 무료로 여러 번 이용할 수 있습니다.', { url: 'https://newtomi.jp/support/', original: 'チェックインからチェックアウトまで、無料で何度でもご利用いただけます。', scope: '대절 노천탕' }),
      day_use_operation: needsCheck('당일입욕·대절탕 단독 이용 판매 여부는 공식 예약 페이지에서 확인합니다.', { answerKo: '대절탕은 숙박객 이용 조건이 확인되지만, 당일입욕 판매 여부는 현재 공식 원문으로 확정하지 못했습니다.' }),
      bath_experience_richness: answer('verified', '바다를 바라보는 다수의 대절 노천탕과 사우나를 반복 이용하는 숙소입니다.', { url: 'https://newtomi.jp/spa/', original: '海を望む貸切露天風呂。', scope: '대절 노천탕' }),
      water_operation_method: needsCheck('온천수 방식·가수·가온·순환·소독 조건을 욕장별 공식 원문으로 확인합니다.', { answerKo: '온천 이용 사실과 별개로 방식 배지는 공식 원문·욕장 범위가 부족해 공개하지 않습니다.' }),
    },
    facts: [
      fact({ code: 'private_bath', scopeKey: 'guest-private-outdoor-baths', scopeLabelKo: '숙박객 대절 노천탕', filterValue: { bath_count: 14, reservation: 'walk_in_when_vacant', reservation_required: false, vacancy_check_method: 'smartphone_or_pc_status', room_fee_jpy: 0, uses_per_stay: 'unlimited_between_checkin_checkout' }, url: 'https://newtomi.jp/support/', original: '全14の貸切露天風呂はご宿泊のお客様に無料でご利用いただけます。ご予約は不要です。空いていればいつでもご利用いただけます。' }),
      fact({ code: 'private_sauna', scopeKey: 'guest-private-saunas', scopeLabelKo: '숙박객 대절 사우나', filterValue: { count: 3 }, url: 'https://newtomi.jp/spa/', original: '貸切サウナ3ヶ所。' }),
    ],
  },
  {
    slug: 'atami-fufu',
    name_ko: '후후 아타미',
    name_ja: 'ふふ 熱海',
    name_en: 'Fufu Atami',
    journey: '연인과 함께 쓰는 프라이빗 온천',
    korean_demand: demand({ url: koreanSearch('후후 아타미 료칸 후기'), note: '한국어 검색·커뮤니티 탐색 표면에서 고급 객실 노천탕 수요를 확인했습니다.' }),
    scores: { korean_demand: 4, decision_difficulty: 4, bath_experience: 4, evidence_collectability: 5, journey_fit: 5 },
    selection_reason: '전 객실 온천 노천탕과 공용탕의 물 운용이 달라 수질 범위를 정확히 나눠야 합니다.',
    official_urls: ['https://www.fufuatami.jp/hotspring/', 'https://www.fufuatami.jp/faq/'],
    questions: roomPrivateQuestions({
      roomText: '全室に温泉露天風呂を備えております。',
      roomUrl: 'https://www.fufuatami.jp/hotspring/',
      roomScope: '전 객실 온천 노천탕',
      extraLayout: '전 객실 온천 노천탕과 공용 대욕장·사우나를 함께 운영합니다.',
      dayUse: answer('verified', '당일 이용은 받지 않습니다.', { url: 'https://www.fufuatami.jp/faq/', original: '日帰りのご利用は承っておりません。', scope: '숙소 전체' }),
      richness: answer('verified', '객실 온천 노천탕에 더해 공용 대욕장, 사우나, 냉탕을 함께 이용하는 구성입니다.', { url: 'https://www.fufuatami.jp/hotspring/', original: '大浴場にはサウナと水風呂をご用意しております。', scope: '공용 대욕장' }),
      water: answer('conditional', '객실탕은 자가 원천 직수이지만, 공용 대욕장과 별도 탕은 원천 사용·순환 방식이 병존합니다. 객실탕 외로 확장한 배지는 사용하지 않습니다.', { url: 'https://www.fufuatami.jp/faq/', original: '客室露天風呂は自家源泉かけ流しです。大浴場と木の間の湯は源泉を使用した循環式です。', scope: '객실탕과 공용탕 분리', checkWhat: '예약 객실의 욕조가 어느 범위에 해당하는지 확인합니다.' }),
    }),
    facts: [
      fact({ code: 'private_bath', scopeKey: 'all-room-open-air-bath', scopeLabelKo: '전 객실 온천 노천탕', filterValue: { included_with: 'all_rooms' }, url: 'https://www.fufuatami.jp/hotspring/', original: '全室に温泉露天風呂を備えております。' }),
      fact({ code: 'day_use', scopeKey: 'facility-wide-day-use', scopeLabelKo: '당일 이용', availability: 'not_available', filterValue: { policy_ko: '당일 이용을 받지 않습니다.' }, url: 'https://www.fufuatami.jp/faq/', original: '日帰りのご利用は承っておりません。' }),
      fact({ code: 'sauna', scopeKey: 'public-bath-sauna', scopeLabelKo: '공용 대욕장 사우나', url: 'https://www.fufuatami.jp/hotspring/', original: '大浴場にはサウナと水風呂をご用意しております。' }),
    ],
  },
  {
    slug: 'hakone-byakudan',
    name_ko: '하코네 고라 백단',
    name_ja: '箱根強羅 白檀',
    name_en: 'Hakone Gora Byakudan',
    journey: '연인과 함께 쓰는 프라이빗 온천',
    korean_demand: demand({ url: koreanSearch('하코네 고라 백단 료칸 후기'), note: '한국어 검색·블로그 탐색 표면에서 하코네 고급 객실 노천탕 수요를 확인했습니다.' }),
    scores: { korean_demand: 4, decision_difficulty: 4, bath_experience: 4, evidence_collectability: 5, journey_fit: 5 },
    selection_reason: '전 객실 노천탕과 모든 욕장의 무순환 직수 표현이 명확하지만, 조건 필드는 별도로 남겨야 합니다.',
    official_urls: ['https://www.byakudan.co.jp/onsen/', 'https://www.byakudan.co.jp/room/'],
    questions: roomPrivateQuestions({
      roomText: '全室に露天風呂を設えております。',
      roomUrl: 'https://www.byakudan.co.jp/room/',
      roomScope: '전 객실 노천탕',
      extraLayout: '전 객실 노천탕과 공용탕을 함께 운영하며, 모든 욕장에 관한 수질 문구는 객실탕·공용탕으로 분리해 적용합니다.',
      dayUse: needsCheck('당일입욕 판매 여부·운영 시간은 공식 예약 화면에서 확인합니다.', { answerKo: '당일입욕 운영은 현재 공식 안내에서 확정하지 못했습니다.' }),
      richness: answer('verified', '객실 노천탕 중심의 고라 료칸으로, 객실에서 산과 계곡 자연을 보며 온천을 즐기는 구성입니다.', { url: 'https://www.byakudan.co.jp/room/', original: '箱根の山々と渓谷の自然を望む客室露天風呂。', scope: '객실 노천탕' }),
      water: answer('verified', '모든 욕장은 무순환 직수로 공식 안내됩니다. 가수·가온·소독은 확인되지 않아 순수직수로는 표시하지 않습니다.', { url: 'https://www.byakudan.co.jp/onsen/', original: '白檀のすべてのお風呂は、循環などのまったくない、源泉掛け流しのみによる新鮮な温泉。', scope: '객실탕·공용탕', checkWhat: '가수·가온·소독 조건을 공식 수질표에서 확인합니다.' }),
    }),
    facts: [fact({ code: 'private_bath', scopeKey: 'all-room-open-air-bath', scopeLabelKo: '전 객실 노천탕', filterValue: { included_with: 'all_rooms' }, url: 'https://www.byakudan.co.jp/room/', original: '全室に露天風呂を設えております。' })],
  },
  {
    slug: 'hakone-gen-gora',
    name_ko: '겐 하코네 고라',
    name_ja: '玄 箱根強羅',
    name_en: 'Gen Hakone Gora',
    journey: '연인과 함께 쓰는 프라이빗 온천',
    korean_demand: demand({ url: koreanSearch('겐 하코네 고라 료칸 후기'), note: '한국어 검색·블로그 탐색 표면에서 고라 객실 프라이빗 온천 수요를 확인했습니다.' }),
    scores: { korean_demand: 4, decision_difficulty: 4, bath_experience: 4, evidence_collectability: 4, journey_fit: 5 },
    selection_reason: '객실탕과 공용탕 모두의 직수 문구가 있어 이용 범위와 수질 조건을 나눠 보여주기 좋습니다.',
    official_urls: ['https://www.gen-hakone.com/spa/index.html', 'https://www.gen-hakone.com/access/index.html'],
    questions: roomPrivateQuestions({
      roomText: '全室露天風呂付き。',
      roomUrl: 'https://www.gen-hakone.com/spa/index.html',
      roomScope: '객실 노천탕',
      extraLayout: '객실 노천탕과 공용 대욕장·사우나를 구분해 운영합니다.',
      dayUse: needsCheck('당일입욕 판매 여부와 운영 시간은 공식 예약 화면에서 확인합니다.', { answerKo: '당일입욕 운영은 현재 공식 안내에서 확정하지 못했습니다.' }),
      richness: answer('verified', '객실 프라이빗탕과 공용 대욕장·사우나를 함께 이용하는 고라 숙소입니다.', { url: 'https://www.gen-hakone.com/access/index.html', original: '大浴場・サウナをご用意しております。', scope: '공용탕' }),
      water: answer('verified', '객실탕과 공용탕 범위에서 직수가 공식 원문으로 확인됩니다. 가수·가온·소독 조건은 확인되지 않아 순수직수로는 표시하지 않습니다.', { url: 'https://www.gen-hakone.com/spa/index.html', original: '全てのお風呂は源泉かけ流しです。', scope: '객실탕·공용탕', checkWhat: '가수·가온·소독 조건을 최신 수질표에서 확인합니다.' }),
    }),
    facts: [fact({ code: 'private_bath', scopeKey: 'room-open-air-bath', scopeLabelKo: '객실 노천탕', filterValue: { included_with: 'all_rooms' }, url: 'https://www.gen-hakone.com/spa/index.html', original: '全室露天風呂付き。' })],
  },
  {
    slug: 'hakone-yuyado-zen',
    name_ko: '하코네 유야도 젠',
    name_ja: '箱根湯宿 然-ZEN-',
    name_en: 'Hakone Yuyado Zen',
    journey: '연인과 함께 쓰는 프라이빗 온천',
    korean_demand: demand({ url: koreanSearch('하코네 유야도 젠 료칸 후기'), note: '한국어 검색·블로그 탐색 표면에서 전 객실 반노천탕 수요를 확인했습니다.' }),
    scores: { korean_demand: 4, decision_difficulty: 4, bath_experience: 4, evidence_collectability: 4, journey_fit: 5 },
    selection_reason: '전 객실 반노천탕이 분명한 반면, 당일 운영과 조건 필드는 아직 공식 잠금이 더 필요합니다.',
    official_urls: ['https://www.hakone-zen.com/room/index.html', 'https://www.hakone-zen.com/index.html'],
    questions: roomPrivateQuestions({
      roomText: '全室に半露天風呂を設けております。',
      roomUrl: 'https://www.hakone-zen.com/room/index.html',
      roomScope: '전 객실 반노천탕',
      extraLayout: '전 객실 반노천탕을 중심으로 하며, 객실에 따라 후지산·외륜산 조망을 안내합니다.',
      dayUse: needsCheck('당일입욕 판매 여부·운영 시간은 공식 예약 화면에서 확인합니다.', { answerKo: '당일입욕 운영은 현재 공식 안내에서 확정하지 못했습니다.' }),
      richness: answer('verified', '객실 반노천탕에서 후지산 또는 외륜산 조망을 기대할 수 있는 객실 중심 숙소입니다.', { url: 'https://www.hakone-zen.com/room/index.html', original: '客室から富士山や外輪山を望む。', scope: '객실' }),
      water: answer('conditional', '전 객실 가케나가시 온천 표기는 있으나, 가수·가온·소독 조건과 객실별 적용 범위를 다시 잠그기 전까지 배지는 보류합니다.', { url: 'https://www.hakone-zen.com/index.html', original: '全室掛け流しの天然にごり湯。', scope: '객실탕', checkWhat: '객실탕의 가수·가온·소독 조건을 공식 수질표에서 확인합니다.' }),
    }),
    facts: [fact({ code: 'private_bath', scopeKey: 'all-room-semi-open-air', scopeLabelKo: '전 객실 반노천탕', filterValue: { included_with: 'all_rooms' }, url: 'https://www.hakone-zen.com/room/index.html', original: '全室に半露天風呂を設けております。' })],
  },
  {
    slug: 'hakone-kowakien-tenyu',
    name_ko: '하코네 코와키엔 텐유',
    name_ja: '箱根小涌園 天悠',
    name_en: 'Hakone Kowakien Ten-yu',
    journey: '탕 자체가 목적인 온천 숙소',
    korean_demand: demand({ url: koreanSearch('하코네 코와키엔 텐유 료칸 후기'), note: '한국어 검색·블로그 탐색 표면에서 대형 리조트형 객실탕·공용탕 수요를 확인했습니다.' }),
    scores: { korean_demand: 5, decision_difficulty: 4, bath_experience: 5, evidence_collectability: 3, journey_fit: 5 },
    selection_reason: '객실탕과 대형 공용 노천탕을 함께 찾는 수요가 크지만, 이용 조건 원문 보강 전에는 조건부 대상입니다.',
    official_urls: ['https://www.ten-yu.com/'],
    questions: roomPrivateQuestions({
      roomText: '全室に温泉露天風呂を備えています。',
      roomUrl: 'https://www.ten-yu.com/',
      roomScope: '전 객실 온천 노천탕',
      extraLayout: '전 객실 온천 노천탕과 대형 공용 노천탕을 함께 보는 리조트형 숙소입니다.',
      dayUse: answer('verified', '공용 대욕장 두 곳은 당일입욕을 받지 않습니다. 객실 숙박과 별개로 대욕장만 당일 이용할 수는 없습니다.', { url: 'https://www.ten-yu.com/cms/blog/%E3%82%B5%E3%82%A6%E3%83%8A%E6%83%85%E5%A0%B1%E3%82%B5%E3%82%A4%E3%83%88%E3%80%8C%E3%82%B5%E3%82%A6%E3%83%8A%E3%82%B8%E3%83%80%E3%82%A4%E3%80%8D%E3%81%AB%E6%8E%B2%E8%BC%89%E3%81%84%E3%81%9F%E3%81%A0', original: '※いずれの大浴場とも日帰りのご利用は承っておりません。', scope: '우키구모노유·구루마자와노유 공용 대욕장', checkWhat: '행사·패키지에 포함된 입욕 예외와 최신 운영 공지를 예약 전 확인합니다.' }),
      richness: answer('verified', '객실 노천탕과 산·계곡 조망 공용 노천탕을 함께 갖춘 대형 리조트형 숙소입니다.', { url: 'https://www.ten-yu.com/', original: 'インフィニティ温泉露天風呂。', scope: '공용 노천탕' }),
      water: needsCheck('객실탕·공용탕별 직수·순환·가수·가온·소독 조건을 공식 원문으로 분리 확인합니다.', { answerKo: '온천수 방식은 공식 원문과 욕장별 범위가 부족해 배지를 공개하지 않습니다.' }),
    }),
    facts: [
      fact({ code: 'private_bath', scopeKey: 'all-room-open-air-bath', scopeLabelKo: '전 객실 온천 노천탕', filterValue: { included_with: 'all_rooms' }, url: 'https://www.ten-yu.com/', original: '全室に温泉露天風呂を備えています。' }),
      fact({ code: 'day_use', scopeKey: 'public-baths', scopeLabelKo: '공용 대욕장', availability: 'not_available', filterValue: { condition_ko: '우키구모노유·구루마자와노유 공용 대욕장 당일입욕 불가' }, url: 'https://www.ten-yu.com/cms/blog/%E3%82%B5%E3%82%A6%E3%83%8A%E6%83%85%E5%A0%B1%E3%82%B5%E3%82%A4%E3%83%88%E3%80%8C%E3%82%B5%E3%82%A6%E3%83%8A%E3%82%B8%E3%83%80%E3%82%A4%E3%80%8D%E3%81%AB%E6%8E%B2%E8%BC%89%E3%81%84%E3%81%9F%E3%81%A0', original: '※いずれの大浴場とも日帰りのご利用は承っておりません。', validUntil: dynamicFactValidUntil }),
    ],
  },
  {
    slug: 'arima-grand-hotel',
    name_ko: '아리마 그랜드 호텔',
    name_ja: '有馬グランドホテル',
    name_en: 'Arima Grand Hotel',
    journey: '연인과 함께 쓰는 프라이빗 온천',
    korean_demand: demand({ kind: 'korean_direct_travel_review', url: 'https://m.blog.naver.com/omrchoi/224226813921', note: '한국어 개인 여행 후기가 아리마 그랜드 호텔 온천 이용을 다룹니다.' }),
    scores: { korean_demand: 5, decision_difficulty: 5, bath_experience: 5, evidence_collectability: 5, journey_fit: 5 },
    selection_reason: '대절탕이 숙박객 전용이며 전화·체크인 예약과 시간·요금이 구분돼 있어 구매 결정에 직접 영향을 줍니다.',
    official_urls: ['https://www.arima-gh.jp/hotspring/private/', 'https://www.arima-gh.jp/etc/dayuse/'],
    questions: {
      together_private_eligibility: answer('verified', '대절탕은 최대 5명까지 이용하는 숙박객 전용 프라이빗탕입니다.', { url: 'https://www.arima-gh.jp/hotspring/private/', original: '貸切風呂はご宿泊のお客様のみ、5名様までご利用いただけます。', scope: '대절탕' }),
      bath_layout_scope: answer('verified', '공용 대욕장·노천탕과 5종 대절탕을 분리해 운영합니다. 유바에 대절탕은 온천수가 아닌 점을 별도 범위로 봐야 합니다.', { url: 'https://www.arima-gh.jp/hotspring/private/', original: '5種類の貸切風呂。夕映の湯は温泉ではありません。', scope: '대절탕' }),
      private_bath_booking_flow: answer('verified', '전화 또는 체크인 후 예약하는 방식입니다.', { url: 'https://www.arima-gh.jp/hotspring/private/', original: 'お電話またはチェックイン後にご予約ください。', scope: '대절탕' }),
      private_bath_terms_limits: answer('verified', '대절탕은 45분 또는 90분 단위이며, 아케보노·아사히는 45분 2,750엔부터입니다.', { url: 'https://www.arima-gh.jp/hotspring/private/', original: '45分 2,750円／90分 3,850円。', scope: '대절탕', checkWhat: '탕 종류별 현재 요금과 이용 가능 시간대는 예약 전 확인합니다.' }),
      day_use_operation: answer('conditional', '당일 이용은 식사와 공용탕을 묶은 플랜으로 운영하며, 대절탕은 당일 이용객이 사용할 수 없습니다.', { url: 'https://www.arima-gh.jp/etc/dayuse/', original: '日帰りプランをご用意しております。貸切風呂はご宿泊のお客様のみ。', scope: '당일 플랜·대절탕', checkWhat: '당일 플랜의 식사·입욕 시간과 판매일을 공식 예약 페이지에서 확인합니다.' }),
      bath_experience_richness: answer('verified', '대형 공용탕과 노천탕, 서로 다른 5종 대절탕을 조합해 이용하는 아리마 대형 료칸입니다.', { url: 'https://www.arima-gh.jp/hotspring/private/', original: '5種類の貸切風呂。', scope: '대절탕' }),
      water_operation_method: needsCheck('금천·은천과 욕장별 운용 방식·조건을 공식 원문으로 각각 확인합니다.', { answerKo: '온천수 방식은 공용탕·대절탕의 욕장별 원문이 잠기기 전까지 배지를 공개하지 않습니다.' }),
    },
    facts: [
      fact({ code: 'private_bath', scopeKey: 'guest-private-baths', scopeLabelKo: '숙박객 대절탕', filterValue: { reservation: 'phone_or_after_checkin', reservation_required: true, capacity: 5, duration_minutes: 45, price_jpy: 2750 }, url: 'https://www.arima-gh.jp/hotspring/private/', original: 'お電話またはチェックイン後にご予約ください。45分 2,750円。貸切風呂はご宿泊のお客様のみ。' }),
      fact({ code: 'day_use', scopeKey: 'meal-and-public-bath-plan', scopeLabelKo: '식사 포함 당일 플랜', availability: 'conditional', filterValue: { condition_ko: '식사 포함 플랜 기준, 대절탕은 숙박객만 이용 가능' }, url: 'https://www.arima-gh.jp/etc/dayuse/', original: '日帰りプランをご用意しております。' }),
    ],
  },
  {
    slug: 'arima-hyoe-koyokaku',
    name_ko: '효에 고요카쿠',
    name_ja: '兵衛向陽閣',
    name_en: 'Hyoe Koyokaku',
    journey: '탕 자체가 목적인 온천 숙소',
    korean_demand: demand({ kind: 'korean_direct_travel_review', url: 'https://m.blog.naver.com/duthe/223833822182', note: '한국어 개인 여행 후기가 아리마 고요카쿠 온천 체류를 다룹니다.' }),
    scores: { korean_demand: 5, decision_difficulty: 4, bath_experience: 5, evidence_collectability: 4, journey_fit: 5 },
    selection_reason: '금천 공용탕과 정원 대절 노천탕, 식사 결합 당일 플랜의 범위를 구분할 필요가 있습니다.',
    official_urls: ['https://hyoe.co.jp/hotspa/', 'https://hyoe.co.jp/hotspa/private_bath/', 'https://www.hyoe.co.jp/faq/day_trip/143/'],
    questions: {
      together_private_eligibility: answer('verified', '정원 대절 노천탕 두 곳은 숙박객이 동행인과 프라이빗하게 이용하는 구성입니다.', { url: 'https://hyoe.co.jp/hotspa/private_bath/', original: '貸切露天風呂「朝霧」「夕霧」。※ご利用は、ご宿泊のお客様に限ります。', scope: '정원 대절 노천탕' }),
      bath_layout_scope: answer('verified', '세 개의 공용탕 구역과 아홉 개의 욕조, 정원 대절 노천탕을 구분해 이용합니다.', { url: 'https://hyoe.co.jp/hotspa/', original: '3つの大浴場、9つの湯船。庭園貸切露天風呂。', scope: '공용탕·대절탕' }),
      private_bath_booking_flow: answer('conditional', '대절 노천탕은 예약제이며, 당일 신청도 가능하지만 빈자리가 없을 수 있어 사전예약을 권합니다.', { url: 'https://www.hyoe.co.jp/faq/facilities/117/', original: '当日のお申し込みも可能ですが、空いていない場合がございますので、事前予約をお勧めしております。', scope: '정원 대절 노천탕', checkWhat: '사전예약 채널과 원하는 탕·시간의 잔여 여부를 예약 전 확인합니다.' }),
      private_bath_terms_limits: answer('verified', '아사기리는 50분 4,400엔·정원 6명, 유기리는 50분 3,300엔·정원 4명이며 모두 숙박객 전용입니다.', { url: 'https://hyoe.co.jp/hotspa/private_bath/', original: '朝霧 50分 4,400円（税込） 定員6名様。夕霧 50分 3,300円（税込） 定員4名様。※ご利用は、ご宿泊のお客様に限ります。', scope: '정원 대절 노천탕', checkWhat: '희망 시간대와 최신 요금은 예약 전 확인합니다.' }),
      day_use_operation: answer('conditional', '공용탕 단독 당일입욕은 받지 않으며, 식사 포함 당일 플랜 또는 숙박을 기준으로 이용합니다.', { url: 'https://www.hyoe.co.jp/faq/day_trip/143/', original: '日帰り入浴のみのご利用はできません。お食事付きの日帰りプランまたはご宿泊をご利用ください。', scope: '당일 이용', checkWhat: '식사 플랜별 입욕 시간과 판매일을 예약 전 확인합니다.' }),
      bath_experience_richness: answer('verified', '아리마 금천을 세 공용탕 구역과 아홉 욕조에서 즐기는 대형 료칸입니다.', { url: 'https://hyoe.co.jp/hotspa/', original: '3つの大浴場、9つの湯船。', scope: '공용탕' }),
      water_operation_method: needsCheck('객실탕·공용탕·대절탕별 가수·가온·순환·소독 조건을 공식 원문으로 분리 확인합니다.', { answerKo: '금천 이용 사실과 별개로 온천수 방식 배지는 공식 운용 원문이 부족해 공개하지 않습니다.' }),
    },
    facts: [
      fact({ code: 'private_bath', scopeKey: 'garden-private-open-air', scopeLabelKo: '정원 대절 노천탕', filterValue: { reservation_required: true, same_day_application_possible: true, guest_only: true, baths: [{ name_ko: '아사기리', duration_minutes: 50, price_jpy: 4400, capacity: 6 }, { name_ko: '유기리', duration_minutes: 50, price_jpy: 3300, capacity: 4 }] }, url: 'https://hyoe.co.jp/hotspa/private_bath/', original: 'ご利用時間ご予約制。朝霧 50分 4,400円（税込） 定員6名様。夕霧 50分 3,300円（税込） 定員4名様。※ご利用は、ご宿泊のお客様に限ります。', validUntil: dynamicFactValidUntil }),
      fact({ code: 'day_use', scopeKey: 'meal-plan-day-use', scopeLabelKo: '식사 포함 당일 플랜', availability: 'conditional', filterValue: { condition_ko: '공용탕 단독 입욕 불가, 식사 포함 플랜 또는 숙박 기준' }, url: 'https://www.hyoe.co.jp/faq/day_trip/143/', original: '日帰り入浴のみのご利用はできません。お食事付きの日帰りプランまたはご宿泊をご利用ください。' }),
    ],
  },
  {
    slug: 'kinosaki-nishimuraya-shogetsutei',
    name_ko: '니시무라야 호텔 쇼게츠테이',
    name_ja: '西村屋ホテル招月庭',
    name_en: 'Nishimuraya Hotel Shogetsutei',
    journey: '탕 자체가 목적인 온천 숙소',
    korean_demand: demand({ url: koreanSearch('기노사키 니시무라야 쇼게츠테이 후기'), note: '한국어 검색·블로그 탐색 표면에서 숲속 대절 스파와 기노사키 온천 체류 수요를 확인했습니다.' }),
    scores: { korean_demand: 4, decision_difficulty: 5, bath_experience: 5, evidence_collectability: 4, journey_fit: 5 },
    selection_reason: '숲속 대절 스파와 공용 온천, 객실 욕조의 온천 여부가 서로 달라 범위 혼입을 막아야 합니다.',
    official_urls: ['https://www.nishimuraya.ne.jp/shogetsu/spa/private.php', 'https://www.nishimuraya.ne.jp/shogetsu/spa/'],
    questions: {
      together_private_eligibility: answer('verified', '숲속 대절 스파는 동행인과 함께 쓰는 프라이빗 공간으로 안내됩니다.', { url: 'https://www.nishimuraya.ne.jp/shogetsu/spa/private.php', original: '3つの貸切森林スパ。', scope: '대절 숲 스파' }),
      bath_layout_scope: answer('verified', '공용탕과 세 개의 대절 숲 스파를 구분해 운영합니다. 객실 노천탕은 온천수가 아닌 백탕인 객실이 있어 별도 확인이 필요합니다.', { url: 'https://www.nishimuraya.ne.jp/shogetsu/spa/private.php', original: '貸切森林スパには露天温泉、石サウナ、リビングを備えます。', scope: '대절 숲 스파' }),
      private_bath_booking_flow: answer('verified', '대절 숲 스파는 예약할 때 세 가지 타입 중 하나를 선택하며, 예약 상황에 따라 희망 타입을 받지 못할 수 있습니다. 숙박객만 이용할 수 있습니다.', { url: 'https://www.nishimuraya.ne.jp/shogetsu/spa/private.php', original: 'ご予約の際は、3タイプの中よりお一つをお選びいただきます。ご予約状況により、ご希望に添えない場合がございます。ご予約は宿泊の方のみとさせていただきます。', scope: '대절 숲 스파' }),
      private_bath_terms_limits: answer('verified', '대절 숲 스파는 객실당 70분 8,800엔, 기본 4명까지이며 최대 6명까지 이용할 수 있습니다. 5명부터는 1명당 1,100엔이 추가됩니다.', { url: 'https://www.nishimuraya.ne.jp/shogetsu/spa/private.php', original: '1室あたり8,800円（税込）/70分（4名様まで）※5名様以上は、おひとり様1,100円（税込）追加（最大6名様）。', scope: '대절 숲 스파', checkWhat: '선택 가능한 타입·시간대와 예약 잔여 여부를 예약 전 확인합니다.' }),
      day_use_operation: answer('conditional', '비투숙객은 피트니스 1시간 이용에 공용 온천 입욕이 포함된 상품을 이용할 수 있습니다. 운영은 07:30~18:00, 요금은 2,000엔입니다. 대욕장 단독 당일입욕은 별도 확인이 필요합니다.', { url: 'https://www.nishimuraya.ne.jp/shogetsu/facilities/', original: 'フィットネスジム 営業時間 7:30～18:00。ビジターの方は1時間 2,000円（入浴付き）。', scope: '비투숙객 피트니스+입욕', checkWhat: '대욕장 단독 당일입욕 판매 여부와 대절 숲 스파의 비투숙객 이용 가능 여부는 별도 확인합니다.' }),
      bath_experience_richness: answer('verified', '대절 숲 스파마다 노천 온천·돌사우나·휴식 공간을 결합한 것이 핵심입니다.', { url: 'https://www.nishimuraya.ne.jp/shogetsu/spa/private.php', original: '露天温泉、石サウナ、リビングを備えた貸切森林スパ。', scope: '대절 숲 스파' }),
      water_operation_method: needsCheck('공용탕·대절 스파·객실 욕조의 온천 여부와 운용 조건을 욕장별 공식 원문으로 분리 확인합니다.', { answerKo: '대절 스파의 온천수와 객실 욕조의 백탕 범위를 섞지 않으며, 방식 배지는 보류합니다.' }),
    },
    facts: [
      fact({ code: 'private_bath', scopeKey: 'forest-private-spas', scopeLabelKo: '대절 숲 스파', filterValue: { bath_count: 3, includes: ['open_air_hot_spring', 'stone_sauna', 'living'], reservation_required: true, guest_only: true, duration_minutes: 70, price_jpy: 8800, included_guests: 4, maximum_guests: 6, extra_guest_jpy: 1100 }, url: 'https://www.nishimuraya.ne.jp/shogetsu/spa/private.php', original: '3つの貸切森林スパ。露天温泉、石サウナ、リビングを備えます。料金 1室あたり8,800円（税込）/70分（4名様まで）。ご予約は宿泊の方のみとさせていただきます。', validUntil: dynamicFactValidUntil }),
      fact({ code: 'day_use', scopeKey: 'visitor-gym-with-bath', scopeLabelKo: '비투숙객 피트니스+입욕', availability: 'conditional', filterValue: { duration_minutes: 60, price_jpy: 2000, hours: '07:30-18:00', condition_ko: '피트니스 이용에 공용 온천 입욕 포함, 대욕장 단독 당일입욕 여부는 별도 확인' }, url: 'https://www.nishimuraya.ne.jp/shogetsu/facilities/', original: 'フィットネスジム 営業時間 7:30～18:00。ビジターの方は1時間 2,000円（入浴付き）。', validUntil: dynamicFactValidUntil }),
    ],
  },
  {
    slug: 'dogo-funaya',
    name_ko: '도고온천 후나야',
    name_ja: '道後温泉 ふなや',
    name_en: 'Funaya',
    journey: '탕 자체가 목적인 온천 숙소',
    korean_demand: demand({ kind: 'korean_direct_travel_review', url: 'https://m.blog.naver.com/clap_watermelon9/224261003703', note: '한국어 개인 여행 후기가 도고 후나야 숙박과 온천 이용을 다룹니다.' }),
    scores: { korean_demand: 4, decision_difficulty: 4, bath_experience: 4, evidence_collectability: 3, journey_fit: 4 },
    selection_reason: '도고 원천 인입과 당일입욕 혼잡 거절 조건을 분리해 보는 전통 료칸 후보입니다.',
    official_urls: ['https://www.dogo-funaya.co.jp/facility/onsen.html', 'https://www.dogo-funaya.co.jp/guestroom/type3.html'],
    questions: {
      together_private_eligibility: answer('conditional', '클럽 플로어(본관 7·8층) 일본식 객실에는 도고온천 인입 히노키 객실탕이 있어, 해당 객실을 예약한 동행인이 객실 안에서 이용합니다.', { url: 'https://www.dogo-funaya.co.jp/guestroom/type3.html', original: '7・8階のクラブフロア（特別室階）にあるお部屋には、道後温泉引き湯の檜風呂がございます。', scope: '클럽 플로어 일본식 객실', checkWhat: '예약하려는 객실 타입이 온천 인입 객실탕인지 플랜에서 확인합니다.' }),
      bath_layout_scope: answer('verified', '공용 대욕장 두 곳(히노키유·미카게유)에는 노천탕·사우나가 있고, 일부 클럽 플로어 객실에는 온천 인입 객실탕이 있습니다.', { url: 'https://www.dogo-funaya.co.jp/facility/onsen.html', original: '大浴場の檜湯と御影湯。2つの大浴場はそれぞれ露天風呂とサウナも備えています。', scope: '공용 대욕장' }),
      private_bath_booking_flow: answer('verified', '온천 인입 객실탕은 해당 클럽 플로어 객실을 예약하면 이용하는 설비로, 별도 대절탕 예약 절차는 적용되지 않습니다.', { url: 'https://www.dogo-funaya.co.jp/guestroom/type3.html', original: '7・8階のクラブフロア（特別室階）にあるお部屋には、道後温泉引き湯の檜風呂がございます。', scope: '클럽 플로어 일본식 객실' }),
      private_bath_terms_limits: answer('conditional', '온천 인입 히노키 객실탕은 클럽 플로어 객실 설비입니다. 예시 객실은 2인 1실 1박 2식 기준 1인 34,100엔부터이며 인원·요일에 따라 달라집니다.', { url: 'https://www.dogo-funaya.co.jp/guestroom/type3.html', original: '1室2名 34,100円～。場合により料金が変動することがございます。', scope: '클럽 플로어 일본식 객실', checkWhat: '객실별 객실탕 포함 여부, 인원·요일별 실제 숙박 요금과 이용 시간은 예약 화면에서 확인합니다.' }),
      day_use_operation: answer('conditional', '공용 대욕장 당일입욕은 1,800엔으로 안내되며, 혼잡할 때는 거절될 수 있습니다.', { url: 'https://www.dogo-funaya.co.jp/facility/onsen.html', original: '日帰り入浴 1,800円（税込）。日帰り入浴は混雑時お断りする場合がございます。', scope: '공용 대욕장 당일입욕', checkWhat: '당일입욕 시간·수건·실제 수용 가능 여부를 방문 전 문의합니다.' }),
      bath_experience_richness: answer('verified', '공용 대욕장 두 곳의 노천탕·사우나와 일부 객실의 온천 인입 히노키탕을 구분해 고를 수 있는 도고 전통 료칸입니다.', { url: 'https://www.dogo-funaya.co.jp/facility/onsen.html', original: '大浴場の檜湯と御影湯。2つの大浴場はそれぞれ露天風呂とサウナも備えています。', scope: '공용 대욕장' }),
      water_operation_method: answer('conditional', '도고온천 원천을 인입한 물을 100% 사용한다고 안내하지만, 가수·가온·순환·소독 조건이 욕장별로 잠기지 않아 방식 배지는 공개하지 않습니다.', { url: 'https://www.dogo-funaya.co.jp/facility/onsen.html', original: '道後温泉の源泉をふんだんに引いた道後温泉100％の湯。', scope: '공용 대욕장·온천 인입 객실탕', checkWhat: '대욕장과 객실탕의 가수·가온·순환·소독 조건을 욕장별 공식 수질표에서 확인합니다.' }),
    },
    facts: [
      fact({ code: 'private_bath', scopeKey: 'club-floor-room-onsen-bath', scopeLabelKo: '클럽 플로어 온천 인입 객실탕', availability: 'conditional', filterValue: { included_with: 'club_floor_japanese_rooms', condition_ko: '본관 7·8층 클럽 플로어 객실에 한함' }, url: 'https://www.dogo-funaya.co.jp/guestroom/type3.html', original: '7・8階のクラブフロア（特別室階）にあるお部屋には、道後温泉引き湯の檜風呂がございます。' }),
      fact({ code: 'day_use', scopeKey: 'public-bath-day-use', scopeLabelKo: '대욕장 당일입욕', availability: 'conditional', filterValue: { adult_jpy: 1800, condition_ko: '혼잡 시 거절 가능' }, url: 'https://www.dogo-funaya.co.jp/facility/onsen.html', original: '日帰り入浴 1,800円（税込）。日帰り入浴は混雑時お断りする場合がございます。', validUntil: dynamicFactValidUntil }),
      fact({ code: 'adult_day_use_price', scopeKey: 'public-bath-day-use-admission', scopeLabelKo: '대욕장 당일입욕 성인 요금', filterValue: { adult_jpy: 1800 }, url: 'https://www.dogo-funaya.co.jp/facility/onsen.html', original: '日帰り入浴 1,800円（税込）。', validUntil: dynamicFactValidUntil }),
    ],
  },
  {
    slug: 'gero-miyako',
    name_ko: '미야코',
    name_ja: '下呂温泉 こころをなでる静寂 みやこ',
    name_en: 'Miyako',
    journey: '연인과 함께 쓰는 프라이빗 온천',
    korean_demand: demand({ kind: 'korean_direct_travel_review', url: 'https://blog.naver.com/bearchew/224061836509', note: '한국어 개인 여행 후기가 게로 미야코 숙박을 다룹니다.' }),
    scores: { korean_demand: 4, decision_difficulty: 4, bath_experience: 4, evidence_collectability: 3, journey_fit: 4 },
    selection_reason: '노천탕 객실과 별채 중심 수요는 분명하지만, 공식 운영 근거가 아직 얕아 보류 기준을 검증하기 좋습니다.',
    official_urls: ['https://www.gero-miyako.jp/'],
    questions: roomPrivateQuestions({
      roomText: '露天風呂付き客室と離れをご用意しております。',
      roomUrl: 'https://www.gero-miyako.jp/',
      roomScope: '노천탕 객실·별채',
      extraLayout: '노천탕 객실·별채와 공용탕의 실제 이용 범위는 객실 타입별로 확인해야 합니다.',
      dayUse: needsCheck('당일입욕 판매 여부와 운영 시간을 공식 예약 페이지에서 확인합니다.', { answerKo: '당일입욕 운영은 현재 공식 원문으로 확정하지 못했습니다.' }),
      richness: answer('conditional', '소규모 조용한 체류와 노천탕 객실이 핵심이지만, 공용탕·대절탕의 개수와 범위는 공식 최신 페이지에서 재확인해야 합니다.', { url: 'https://www.gero-miyako.jp/', original: '露天風呂付き客室と離れ。', scope: '객실', checkWhat: '객실 타입별 욕조·공용탕·대절탕 운영 범위를 확인합니다.' }),
      water: needsCheck('객실탕·공용탕별 온천수 방식과 조건을 공식 원문으로 확인합니다.', { answerKo: '온천수 방식은 공식 원문·욕장 범위가 부족해 배지를 공개하지 않습니다.' }),
    }),
    facts: [fact({ code: 'private_bath', scopeKey: 'room-open-air-bath', scopeLabelKo: '노천탕 객실·별채', filterValue: { included_with: 'eligible_room_type' }, url: 'https://www.gero-miyako.jp/', original: '露天風呂付き客室と離れをご用意しております。' })],
  },
  {
    slug: 'nyuto-tsurunoyu',
    name_ko: '츠루노유 온천',
    name_ja: '乳頭温泉郷 鶴の湯温泉',
    name_en: 'Tsurunoyu Onsen',
    journey: '탕 자체가 목적인 온천 숙소',
    korean_demand: demand({ kind: 'korean_direct_travel_review', url: 'https://m.blog.naver.com/baekjeun/224171407391', note: '한국어 개인 여행 후기가 츠루노유 온천 체류와 혼욕 노천탕을 다룹니다.' }),
    scores: { korean_demand: 5, decision_difficulty: 5, bath_experience: 5, evidence_collectability: 5, journey_fit: 5 },
    selection_reason: '혼욕 노천탕·4개 원천·당일입욕 운영이라는 독특한 이용 조건이 여행 결정을 크게 바꿉니다.',
    official_urls: ['https://www.tsurunoyu.com/FONDMENT/t-onsen.html'],
    questions: {
      together_private_eligibility: answer('conditional', '혼욕 노천탕은 남녀가 함께 이용할 수 있는 공용탕이지만 프라이빗 대절탕은 아닙니다.', { url: 'https://www.tsurunoyu.com/FONDMENT/t-onsen.html', original: '混浴露天風呂。', scope: '공용 혼욕 노천탕', checkWhat: '혼욕탕의 현재 시간대·복장·이용 규칙을 방문 전 확인합니다.' }),
      bath_layout_scope: answer('verified', '서로 다른 네 개 원천을 쓰는 공용 내탕·노천탕과 혼욕 노천탕을 구분해 이용합니다.', { url: 'https://www.tsurunoyu.com/FONDMENT/t-onsen.html', original: '4つの異なる源泉を持つ温泉。', scope: '공용탕' }),
      private_bath_booking_flow: needsCheck('대절탕 운영 여부와 예약 방식을 공식 최신 안내에서 확인합니다.', { answerKo: '대절탕 운영 여부는 현재 공식 원문으로 확정하지 못했습니다.' }),
      private_bath_terms_limits: needsCheck('대절탕이 있다면 시간·요금·정원·대상은 공식 최신 안내에서 확인합니다.', { answerKo: '대절탕의 이용 조건은 현재 공식 원문으로 확정하지 못했습니다.' }),
      day_use_operation: answer('verified', '당일입욕은 성인 700엔이며 월요일은 휴장입니다. 타월은 200엔에 구매합니다.', { url: 'https://www.tsurunoyu.com/FONDMENT/t-onsen.html', original: '日帰り入浴 大人700円。月曜日は休み。タオル200円。', scope: '당일입욕', checkWhat: '공휴일 대체 휴무·계절 운영 시간은 공식 공지를 확인합니다.' }),
      bath_experience_richness: answer('verified', '서로 다른 네 원천과 상징적인 혼욕 노천탕이 핵심인 탕치형 온천 숙소입니다.', { url: 'https://www.tsurunoyu.com/FONDMENT/t-onsen.html', original: '4つの異なる源泉。混浴露天風呂。', scope: '공용탕' }),
      water_operation_method: needsCheck('각 원천·욕장별 직수·순환·가수·가온·소독 조건을 공식 원문으로 분리 확인합니다.', { answerKo: '원천 수와 수질 설명만으로는 온천수 방식 배지를 공개하지 않습니다.' }),
    },
    facts: [
      fact({ code: 'mixed_bathing', scopeKey: 'mixed-open-air-bath', scopeLabelKo: '혼욕 노천탕', filterValue: { mixed_bathing: true }, url: 'https://www.tsurunoyu.com/FONDMENT/t-onsen.html', original: '混浴露天風呂。' }),
      fact({ code: 'day_use', scopeKey: 'dayuse-bathing', scopeLabelKo: '당일입욕', filterValue: { adult_price_jpy: 700, closed_day: 'monday', towel_price_jpy: 200 }, url: 'https://www.tsurunoyu.com/FONDMENT/t-onsen.html', original: '日帰り入浴 大人700円。月曜日は休み。タオル200円。' }),
    ],
  },
];

const excludedAccommodationFinalSlugs = new Set([
  'yufuin-konjakuan',
  'yufuin-sakuratei',
  'beppu-yunosato-hayama',
  'hakone-byakudan',
  'hakone-gen-gora',
  'hakone-yuyado-zen',
  'gero-miyako',
  'nyuto-tsurunoyu',
]);

const accommodationDecisionOverrides = {
  'atami-new-tomiyoshi': {
    questions: {
      together_private_eligibility: answer('verified', '숙박객은 대절 노천탕을 동행인과 프라이빗하게 이용할 수 있습니다.', { url: 'https://newtomi.jp/support/', original: '本館屋上に4つの展望貸切露天、別棟浜の湯に3つの貸切露天、新館に4つの貸切露天と3つの貸切サウナ。ご宿泊者様専用。', scope: '숙박객 전용 대절 노천탕·사우나' }),
      bath_layout_scope: answer('verified', '본관 옥상 4개, 별동 하마노유 3개, 신관 4개의 대절 노천탕과 대절 사우나 3개를 구분해 이용합니다.', { url: 'https://newtomi.jp/support/', original: '本館屋上に4つの展望貸切露天、別棟浜の湯に3つの貸切露天、新館に4つの貸切露天と3つの貸切サウナ。', scope: '숙박객 전용 대절 시설' }),
      private_bath_booking_flow: answer('verified', '대절 노천탕은 사전 예약 없이 빈 탕이면 이용하며, 스마트폰·PC로 이용 현황을 확인할 수 있습니다.', { url: 'https://newtomi.jp/support/', original: 'ご予約制ではございませんが、空いていればいつでも何回でもご利用可能です。専用ページからスマホ・PCで予約状況を確認できます。', scope: '대절 노천탕' }),
      private_bath_terms_limits: answer('verified', '숙박객은 체크인부터 체크아웃까지 24시간 무료로 여러 번 이용할 수 있습니다.', { url: 'https://newtomi.jp/support/', original: 'ご宿泊時チェックインからチェックアウトまで、24時間無料でのご利用が可能です。', scope: '숙박객 전용 대절 시설' }),
      day_use_operation: answer('conditional', '공식 예약 상품에는 11:00~15:00 최대 4시간의 개인 휴게실 이용과 대절탕·사우나 이용을 안내합니다. 판매일과 요금, 이용 가능한 대절 시설 범위는 예약 화면에서 다시 확인해야 합니다.', { url: 'https://reserve.489ban.net/client/newtomi/0/detail/1269758?date=2026-07-13', original: '個室休憩室（食事処）を貸切で最大4時間滞在（11時～15時）。宿泊者専用の11ヶ所の貸切風呂と3ヶ所の貸切サウナ。', scope: '당일 개인 휴게실 포함 상품', checkWhat: '방문일 예약 화면에서 현재 판매 여부·요금·대절 시설 이용 범위를 확인합니다.' }),
      bath_experience_richness: answer('verified', '바다를 바라보는 대절 노천탕을 숙박 중 반복 이용하고, 대절 사우나까지 함께 고를 수 있는 구성이 핵심입니다.', { url: 'https://newtomi.jp/', original: '11の源泉掛け流し風呂と3つのプライベートサウナ。海を望む貸切露天風呂。', scope: '대절 노천탕·사우나' }),
      water_operation_method: answer('conditional', '대절탕 전체를 하나의 방식으로 표시하지 않습니다. 공식 상품 설명은 본관 옥상 전망 대절 노천탕 4개를 방류·순환 병용식으로 따로 안내합니다.', { url: 'https://reserve.489ban.net/client/newtomi/0/detail/1269758?date=2026-07-13', original: '展望貸切露天風呂（本館屋上）4ヶ所　放流循環併用式。', scope: '본관 옥상 전망 대절 노천탕', checkWhat: '별동·신관 대절탕별 가수·가온·순환·소독 조건을 공식 원문으로 확인합니다.' }),
    },
    facts: [
      fact({ code: 'private_bath', scopeKey: 'guest-private-outdoor-baths', scopeLabelKo: '숙박객 대절 노천탕 11개', filterValue: { bath_count: 11, reservation: 'walk_in_when_vacant', reservation_required: false, vacancy_check_method: 'smartphone_or_pc_status', room_fee_jpy: 0, uses_per_stay: 'unlimited_between_checkin_checkout', hours: 'checkin-checkout_24h' }, url: 'https://newtomi.jp/support/', original: '本館屋上に4つの展望貸切露天、別棟浜の湯に3つの貸切露天、新館に4つの貸切露天。チェックインからチェックアウトまで、24時間無料。ご予約制ではございません。' }),
      fact({ code: 'private_sauna', scopeKey: 'guest-private-saunas', scopeLabelKo: '숙박객 대절 사우나 3개', filterValue: { count: 3 }, url: 'https://newtomi.jp/support/', original: '新館に4つの貸切露天と3つの貸切サウナ。' }),
      fact({ code: 'day_use', scopeKey: 'dayuse-private-room-plan', scopeLabelKo: '당일 개인 휴게실 포함 상품', availability: 'conditional', filterValue: { hours: '11:00-15:00', maximum_stay_hours: 4, condition_ko: '판매일·요금·대절 시설 이용 범위는 예약 화면에서 재확인' }, url: 'https://reserve.489ban.net/client/newtomi/0/detail/1269758?date=2026-07-13', original: '個室休憩室（食事処）を貸切で最大4時間滞在（11時～15時）。', validUntil: dynamicFactValidUntil }),
    ],
  },
};

const promotionAccommodationCatalog = [
  {
    slug: 'yufuin-yasuha',
    name_ko: '유후인 야스하',
    name_ja: '杜の湯 ゆふいん泰葉',
    name_en: 'Yufuin Yasuha',
    journey: '연인과 함께 쓰는 프라이빗 온천',
    korean_demand: demand({ url: koreanSearch('유후인 야스하 청탕 가족탕 후기'), note: '한국어 검색·블로그 탐색 표면에서 청탕과 대절 노천탕을 함께 찾는 수요를 확인했습니다.' }),
    scores: { korean_demand: 4, decision_difficulty: 5, bath_experience: 4, evidence_collectability: 5, journey_fit: 5 },
    selection_reason: '청탕 대절 노천탕의 현장 접수·50분 단위 요금·마감 시간까지 공식 안내가 닫혀 있어, 유후인 당일 프라이빗 온천 여정을 대표합니다.',
    official_urls: ['https://www.yasuha.co.jp/daytrip/', 'https://www.yasuha.co.jp/'],
    questions: {
      together_private_eligibility: answer('verified', '강변과 산쪽 대절 노천탕은 가족·부부가 함께 이용하는 프라이빗탕입니다.', { url: 'https://www.yasuha.co.jp/daytrip/', original: '貸切露天風呂「川側」「山側」。貸切露天風呂は、ご家族やご夫婦で人目を気にせず温泉を楽しみたい方に向いています。', scope: '강변·산쪽 대절 노천탕' }),
      bath_layout_scope: answer('verified', '강변·산쪽 대절 노천탕과 남녀별 소욕장 내탕을 구분해 운영합니다.', { url: 'https://www.yasuha.co.jp/daytrip/', original: '貸切露天風呂「川側」「山側」。男女別の小浴場は内湯です。', scope: '당일입욕 욕장' }),
      private_bath_booking_flow: answer('verified', '대절 노천탕은 사전 예약이나 시간 지정 없이 당일 프런트에서 직접 신청합니다.', { url: 'https://www.yasuha.co.jp/daytrip/', original: '立寄り湯（貸切家族湯・男女別内湯）の事前予約および時間指定は一切お受けしておりません。当館の受付にて直接お申し込みください。', scope: '당일 대절 노천탕' }),
      private_bath_terms_limits: answer('verified', '강변 대절 노천탕은 4인까지 50분 2,800엔, 산쪽은 2인까지 50분 2,300엔이며 15분 연장은 500엔입니다.', { url: 'https://www.yasuha.co.jp/daytrip/', original: '川側1室4名 50分 2,800円。山側1室2名 50分 2,300円。延長料金（15分）500円。', scope: '당일 대절 노천탕' }),
      day_use_operation: answer('verified', '당일입욕은 09:00~21:00, 최종 접수 20:00입니다. 혼잡하면 대기하거나 접수를 일찍 마칠 수 있습니다.', { url: 'https://www.yasuha.co.jp/daytrip/', original: 'ご利用時間 9:00～21:00（最終受付20:00）。混雑状況によりお待ちいただく場合や、受付を早めに終了する場合がございます。', scope: '당일입욕', checkWhat: '방문일 혼잡·조기마감과 휴관 공지를 공식 페이지에서 확인합니다.' }),
      bath_experience_richness: answer('verified', '전국적으로 드문 청탕을 대절 노천탕과 소욕장에서 고를 수 있어, 탕의 색과 프라이빗한 이용 방식이 함께 강점입니다.', { url: 'https://www.yasuha.co.jp/', original: '全国的にも珍しい鮮やかなコバルトブルーと、ヌルヌルしっとりの泉質が特徴の天然温泉「青湯」。', scope: '숙소·당일입욕 청탕' }),
      water_operation_method: answer('conditional', '공식은 자가 원천 직수를 소개하지만, 욕장별 가수·가온·순환·소독 조건이 완결되지 않아 순수직수나 숙소 전체 방식 배지는 표시하지 않습니다.', { url: 'https://www.yasuha.co.jp/', original: '自家源泉一〇〇％掛け流し。', scope: '숙소 청탕', checkWhat: '대절 노천탕·소욕장별 수질 운용 조건과 적용 범위를 공식 수질표로 확인합니다.' }),
    },
    facts: [
      fact({ code: 'family_bath', scopeKey: 'dayuse-private-open-air', scopeLabelKo: '당일 대절 노천탕', filterValue: { reservation_required: false, booking_channel_ko: '당일 프런트', duration_minutes: 50, river_side_capacity: 4, river_side_jpy: 2800, mountain_side_capacity: 2, mountain_side_jpy: 2300, extension_minutes: 15, extension_jpy: 500 }, url: 'https://www.yasuha.co.jp/daytrip/', original: '事前予約および時間指定は一切お受けしておりません。当館の受付にて直接お申し込みください。川側1室4名50分2,800円、山側1室2名50分2,300円。' }),
      fact({ code: 'day_use', scopeKey: 'dayuse-bathing', scopeLabelKo: '당일입욕', filterValue: { hours: '09:00-21:00', last_admission: '20:00', towel_sale_jpy: 300, towel_rental_jpy: 500 }, url: 'https://www.yasuha.co.jp/daytrip/', original: 'ご利用時間9:00～21:00（最終受付20:00）。フェイスタオル300円、バスタオル500円。', validUntil: dynamicFactValidUntil }),
      fact({ code: 'open_air_bath', scopeKey: 'dayuse-private-open-air', scopeLabelKo: '강변·산쪽 대절 노천탕', filterValue: { bath_count: 2 }, url: 'https://www.yasuha.co.jp/daytrip/', original: '貸切露天風呂「川側」「山側」。' }),
    ],
  },
  {
    slug: 'kurokawa-okunoyu',
    name_ko: '료칸 오쿠노유',
    name_ja: '黒川温泉 旅館 奥の湯',
    name_en: 'Ryokan Okunoyu',
    journey: '탕 자체가 목적인 온천 숙소',
    korean_demand: demand({ url: koreanSearch('구로카와 오쿠노유 가족탕 후기'), note: '한국어 검색·블로그 탐색 표면에서 구로카와 노천탕·가족탕 수요를 확인했습니다.' }),
    scores: { korean_demand: 4, decision_difficulty: 5, bath_experience: 5, evidence_collectability: 4, journey_fit: 5 },
    selection_reason: '숙박객 전용 무료 가족탕의 예약 없는 이용 방식과 혼욕·노천탕을 포함한 9종 욕장이 명확해, 탕 자체가 목적인 구로카와 체류를 대표합니다.',
    official_urls: ['https://www.kurokawaonsen.or.jp/oyado/innInfo.php?intYKey=4', 'https://www.okunoyu.com/'],
    questions: {
      together_private_eligibility: answer('verified', '숙박객 전용 무료 가족탕 3종은 동행인과 프라이빗하게 이용할 수 있습니다.', { url: 'https://www.kurokawaonsen.or.jp/oyado/innInfo.php?intYKey=4', original: '宿泊者限定・貸切家族風呂（無料）。竹の湯、もみじの湯、あじさいの湯。', scope: '숙박객 전용 가족탕' }),
      bath_layout_scope: answer('verified', '공용 내탕·노천탕·혼욕 노천탕과 숙박객 전용 가족탕 3종을 구분하며, 전체 9종의 욕장을 안내합니다.', { url: 'https://www.kurokawaonsen.or.jp/oyado/innInfo.php?intYKey=4', original: '露天風呂から家族風呂まで【全9種】。内湯、露天風呂、混浴露天風呂、家族風呂。', scope: '숙소 욕장' }),
      private_bath_booking_flow: answer('verified', '가족탕은 예약제가 아니며, 숙박객이 빈 탕을 이용하는 방식입니다.', { url: 'https://www.kurokawaonsen.or.jp/oyado/innInfo.php?intYKey=4', original: '※家族風呂はご予約制でありません。', scope: '숙박객 전용 가족탕' }),
      private_bath_terms_limits: answer('conditional', '가족탕은 숙박객 무료이며 15:00~23:00와 다음 날 07:00부터 이용합니다. 개별 탕의 정원·청소 시간은 체크인 때 확인해야 합니다.', { url: 'https://www.kurokawaonsen.or.jp/oyado/innInfo.php?intYKey=4', original: '貸切家族風呂（無料）15:00～23:00／翌朝7:00～。', scope: '숙박객 전용 가족탕', checkWhat: '방문일 가족탕별 정원·청소 시간·혼잡 상황을 확인합니다.' }),
      day_use_operation: answer('conditional', '운영사 공지는 2026-06-25에 외래입욕(탕 순례)을 재개했다고 안내합니다. 접수 시간·요금·휴장일은 방문 전 최신 공지에서 확인해야 합니다.', { url: 'https://www.okunoyu.com/', original: '2026年6月25日 お知らせ 外来入浴（湯めぐり）再開のお知らせ。', scope: '외래입욕·탕 순례', checkWhat: '방문일 외래입욕 접수 시간·요금·이용 가능 욕장을 공식 공지에서 확인합니다.' }),
      bath_experience_richness: answer('verified', '노천탕부터 가족탕까지 9종 욕장과 온천열 수영장을 함께 갖춰, 숙소 안에서 여러 탕을 돌며 머무는 경험이 강점입니다.', { url: 'https://www.kurokawaonsen.or.jp/oyado/innInfo.php?intYKey=4', original: '露天風呂から家族風呂まで【全9種】。年中開放の温泉熱プール。', scope: '숙소 욕장·온천열 수영장' }),
      water_operation_method: answer('conditional', '공식은 9종 욕장과 가족탕을 직수로 안내하지만, 욕장별 가수·가온·순환·소독 조건이 완결되지 않아 순수직수나 숙소 전체 방식 배지는 표시하지 않습니다.', { url: 'https://www.kurokawaonsen.or.jp/oyado/innInfo.php?intYKey=4', original: '源泉かけ流しの温泉。全て源泉かけ流しの温泉。', scope: '공용탕·숙박객 가족탕', checkWhat: '욕장별 수질 운용 조건과 적용 범위를 공식 수질표로 확인합니다.' }),
    },
    facts: [
      fact({ code: 'family_bath', scopeKey: 'guest-free-family-baths', scopeLabelKo: '숙박객 무료 가족탕 3종', filterValue: { guest_only: true, room_fee_jpy: 0, reservation_required: false, hours: '15:00-23:00;next_day_from_07:00', bath_count: 3 }, url: 'https://www.kurokawaonsen.or.jp/oyado/innInfo.php?intYKey=4', original: '宿泊者限定・貸切家族風呂（無料）15:00～23:00／翌朝7:00～。竹の湯、もみじの湯、あじさいの湯。※家族風呂はご予約制でありません。' }),
      fact({ code: 'open_air_bath', scopeKey: 'public-and-mixed-open-air', scopeLabelKo: '공용·혼욕 노천탕', filterValue: { mixed_bathing: true }, url: 'https://www.kurokawaonsen.or.jp/oyado/innInfo.php?intYKey=4', original: '女性用露天風呂、混浴露天風呂、川風呂、洞窟風呂。' }),
      fact({ code: 'day_use', scopeKey: 'external-bathing', scopeLabelKo: '외래입욕·탕 순례', availability: 'conditional', filterValue: { condition_ko: '2026-06-25 재개 공지, 접수 시간·요금은 최신 공지 확인 필요' }, url: 'https://www.okunoyu.com/', original: '外来入浴（湯めぐり）再開のお知らせ。', validUntil: dynamicFactValidUntil }),
    ],
  },
  {
    slug: 'gero-suimeikan',
    name_ko: '스이메이칸',
    name_ja: '下呂温泉 水明館',
    name_en: 'Suimeikan',
    journey: '탕 자체가 목적인 온천 숙소',
    korean_demand: demand({ url: koreanSearch('게로 스이메이칸 대절탕 당일입욕 후기'), note: '한국어 검색·블로그 탐색 표면에서 게로 대형 료칸의 대절탕·당일입욕 수요를 확인했습니다.' }),
    scores: { korean_demand: 4, decision_difficulty: 5, bath_experience: 5, evidence_collectability: 5, journey_fit: 5 },
    selection_reason: '3개 공용 대욕장·대절탕·당일입욕의 적용 범위와 혼합 수질 운용을 함께 확인해야 하는 대표적인 대형 료칸입니다.',
    official_urls: ['https://www.suimeikan.co.jp/hotspring/', 'https://www.suimeikan.co.jp/hotspring/kashikiri.php'],
    questions: {
      together_private_eligibility: answer('verified', '임천각 4층의 시치리노유·오리베노유 두 대절탕은 동행인과 프라이빗하게 이용합니다.', { url: 'https://www.suimeikan.co.jp/hotspring/kashikiri.php', original: '趣き異なる2つの貸切風呂。七里の湯・織部の湯。', scope: '임천각 4층 대절탕' }),
      bath_layout_scope: answer('verified', '산스이카쿠·히센카쿠·임천각의 공용 대욕장 3곳과 임천각 대절탕을 구분해 운영합니다.', { url: 'https://www.suimeikan.co.jp/hotspring/', original: '山水閣、飛泉閣、臨川閣のそれぞれの館に大浴場があり、どの館にご宿泊されても3ヶ所ともご利用いただけます。貸切温泉風呂は臨川閣4階。', scope: '공용 대욕장·대절탕' }),
      private_bath_booking_flow: answer('conditional', '공식 대절탕 페이지는 전화 예약·문의 창구를 안내합니다. 온라인 예약 가능 여부와 당일 접수 방식은 명시하지 않아 원하는 시간은 전화로 확인해야 합니다.', { url: 'https://www.suimeikan.co.jp/hotspring/kashikiri.php', original: 'お電話での予約はこちら（0576）25-2800。', scope: '대절탕', checkWhat: '희망 일시의 대절탕 예약 가능 여부·당일 접수 여부를 공식 전화 창구에서 확인합니다.' }),
      private_bath_terms_limits: answer('verified', '두 대절탕은 각각 60분 3,300엔이며 이용 시간은 10:00~21:00입니다.', { url: 'https://www.suimeikan.co.jp/hotspring/kashikiri.php', original: '七里の湯・織部の湯3,300円（各60分・消費税込）。時間10:00～21:00。', scope: '임천각 4층 대절탕' }),
      day_use_operation: answer('verified', '입욕만 이용은 월~목 평일 한정입니다. 공식 안내는 접수 11:00~14:00, 이용 10:00~18:00, 성인 1,500엔으로 표기합니다.', { url: 'https://www.suimeikan.co.jp/hotspring/', original: 'ご入浴のみのご利用は、月曜日～木曜日の平日限定。受付時間11:00～14:00。ご利用時間10:00～18:00。大人1,500円。', scope: '야텐부로·전망 대욕장 당일입욕', checkWhat: '휴관·혼잡 거절과 방문일 운영 시간을 공식 공지에서 확인합니다.' }),
      bath_experience_richness: answer('verified', '3개 공용 대욕장에 대절탕·암반욕까지 더해, 숙소 안에서 서로 다른 탕을 고르는 대형 료칸 구성입니다.', { url: 'https://www.suimeikan.co.jp/hotspring/', original: '大浴場3ヶ所。貸切温泉風呂・岩盤浴。', scope: '숙소 온천 시설' }),
      water_operation_method: answer('conditional', '공식 수질 안내는 직수와 일부 순환 여과가 병존하고, 가수·염소계 소독을 하며 가온은 하지 않는다고 밝힙니다. 욕장별 적용 범위가 분리되지 않아 하나의 방식 배지는 표시하지 않습니다.', { url: 'https://www.suimeikan.co.jp/hotspring/', original: '浴槽管理 1．源泉かけ流し、一部循環濾過方式。2．加水しています。3．加温していません。5．消毒をしております（塩素系）。', scope: '숙소 욕조 관리', checkWhat: '대절탕과 각 공용탕별 방식·조건 적용 범위를 확인합니다.' }),
    },
    facts: [
      fact({ code: 'private_bath', scopeKey: 'rinkaku-private-baths', scopeLabelKo: '임천각 대절탕 2종', filterValue: { bath_count: 2, duration_minutes: 60, room_fee_jpy: 3300, hours: '10:00-21:00', booking_contact_phone: '0576-25-2800' }, url: 'https://www.suimeikan.co.jp/hotspring/kashikiri.php', original: '趣き異なる2つの貸切風呂。七里の湯・織部の湯3,300円（各60分・消費税込）。時間10:00～21:00。' }),
      fact({ code: 'day_use', scopeKey: 'public-day-use', scopeLabelKo: '야텐부로·전망 대욕장 당일입욕', filterValue: { weekday_only: 'monday-thursday', reception: '11:00-14:00', hours: '10:00-18:00', adult_price_jpy: 1500, condition_ko: '혼잡 시 거절 가능' }, url: 'https://www.suimeikan.co.jp/hotspring/', original: 'ご入浴のみのご利用は、月曜日～木曜日の平日限定。受付時間11:00～14:00。ご利用時間10:00～18:00。大人1,500円。混雑時はお断りする事もございます。', validUntil: dynamicFactValidUntil }),
      fact({ code: 'open_air_bath', scopeKey: 'dayuse-open-air', scopeLabelKo: '당일입욕 야텐부로', url: 'https://www.suimeikan.co.jp/hotspring/', original: '野天風呂・展望大浴場は日帰り入浴をご利用いただけます。' }),
    ],
  },
  {
    slug: 'gero-ogawaya',
    name_ko: '게로온천 오가와야',
    name_ja: '下呂温泉 小川屋',
    name_en: 'Gero Onsen Ogawaya',
    journey: '탕 자체가 목적인 온천 숙소',
    korean_demand: demand({ url: koreanSearch('게로 오가와야 대절탕 당일온천 후기'), note: '한국어 검색·블로그 탐색 표면에서 게로 당일입욕과 대절탕을 함께 찾는 수요를 확인했습니다.' }),
    scores: { korean_demand: 4, decision_difficulty: 5, bath_experience: 5, evidence_collectability: 5, journey_fit: 5 },
    selection_reason: '5개 공용 대욕장과 9개 대절탕, 온라인·당일 전화 예약, 요일별 당일입욕 시간이 한 페이지에서 닫혀 있어 결정 완성도가 높습니다.',
    official_urls: ['https://www.gero-ogawaya.net/how_to_spend/daytrip/', 'https://www.gero-ogawaya.net/hotspring/'],
    questions: {
      together_private_eligibility: answer('verified', '유라기칸 7개와 본관 2개, 총 9개의 대절탕은 동행인과 프라이빗하게 이용할 수 있습니다.', { url: 'https://www.gero-ogawaya.net/how_to_spend/daytrip/', original: '全9種類の貸切風呂。ゆらぎ館7つの貸切風呂、本館貸切風呂。', scope: '유라기칸·본관 대절탕' }),
      bath_layout_scope: answer('verified', '5개 공용 대욕장과 9개 대절탕을 구분하며, 다다미 대욕장·강변 노천탕·드라이 사우나를 함께 운영합니다.', { url: 'https://www.gero-ogawaya.net/hotspring/', original: '5つの大浴場と9つの貸切風呂。畳風呂、露天風呂、ドライサウナ。', scope: '공용탕·대절탕' }),
      private_bath_booking_flow: answer('verified', '당일 대절탕은 온라인으로 사전 예약할 수 있고, 당일 예약은 전화 0576-25-2118로 받습니다.', { url: 'https://www.gero-ogawaya.net/how_to_spend/daytrip/', original: '貸切風呂の日帰り利用についてはネットでのご予約が可能です。※当日予約はTEL:0576-25-2118までお電話ください。', scope: '당일 대절탕' }),
      private_bath_terms_limits: answer('verified', '유라기칸 6종은 45분 4,400엔, 코하쿠는 45분 4,950엔이며 본관 두 대절탕은 45분 3,300엔입니다.', { url: 'https://www.gero-ogawaya.net/how_to_spend/daytrip/', original: '瑠璃・霞・山吹・菫・利休・山葵 1回45分4,400円。琥珀1回45分4,950円。本館貸切風呂1回45分3,300円。', scope: '당일 대절탕' }),
      day_use_operation: answer('verified', '공용 당일입욕은 월·수·금 12:00~19:00(최종 18:00), 화·목 13:00~19:00(최종 18:00), 토·일·공휴일은 12:00~15:00(최종 14:00)이며 성인 1,500엔입니다.', { url: 'https://www.gero-ogawaya.net/how_to_spend/daytrip/', original: '月・水・金12:00～19:00（受付締切18:00）。火・木13:00～19:00（受付締切18:00）。土・日12:00～15:00（受付締切14:00）。大人1,500円。', scope: '공용 당일입욕', checkWhat: '연말연시·연휴 특별요금과 운영 변동을 공식 페이지에서 확인합니다.' }),
      bath_experience_richness: answer('verified', '100조 규모의 다다미 대욕장, 히다강을 마주한 노천탕, 드라이 사우나와 여러 대절탕이 한 숙소 안에서 이어집니다.', { url: 'https://www.gero-ogawaya.net/hotspring/', original: '100帖空間の畳風呂や、露天風呂から望む飛騨川。ドライサウナ。5つの大浴場と9つの貸切風呂。', scope: '공용탕·대절탕' }),
      water_operation_method: answer('conditional', '유라기칸의 7개 대절탕은 공식이 직수로 안내합니다. 공용탕을 포함한 전체 욕장의 가수·가온·순환·소독 조건은 별도로 잠기지 않아 숙소 전체 방식 배지는 표시하지 않습니다.', { url: 'https://www.gero-ogawaya.net/how_to_spend/daytrip/', original: '下呂温泉の名湯を源泉かけ流しでお楽しみいただけます。', scope: '유라기칸 대절탕 7종', checkWhat: '공용 대욕장과 본관 대절탕의 수질 운용 조건을 각각 확인합니다.' }),
    },
    facts: [
      fact({ code: 'private_bath', scopeKey: 'yuragi-private-baths', scopeLabelKo: '유라기칸 대절탕 7종', filterValue: { bath_count: 7, booking_channel_ko: '온라인 사전 예약·당일 전화', duration_minutes: 45, room_fee_jpy: 4400, premium_room_fee_jpy: 4950, same_day_phone: '0576-25-2118' }, url: 'https://www.gero-ogawaya.net/how_to_spend/daytrip/', original: '貸切風呂の日帰り利用についてはネットでのご予約が可能です。※当日予約はTEL:0576-25-2118。1回45分4,400円、琥珀4,950円。' }),
      fact({ code: 'private_bath', scopeKey: 'main-building-private-baths', scopeLabelKo: '본관 대절탕 2종', filterValue: { bath_count: 2, capacity: 4, duration_minutes: 45, room_fee_jpy: 3300, booking_channel_ko: '온라인 사전 예약·당일 전화' }, url: 'https://www.gero-ogawaya.net/how_to_spend/daytrip/', original: '本館にある2つの貸切風呂。4名様まで。1回45分3,300円。' }),
      fact({ code: 'day_use', scopeKey: 'public-dayuse-baths', scopeLabelKo: '공용 당일입욕', filterValue: { monday_wednesday_friday: '12:00-19:00,last 18:00', tuesday_thursday: '13:00-19:00,last 18:00', weekend_holiday: '12:00-15:00,last 14:00', adult_price_jpy: 1500, towel_sale_jpy: 300, towel_rental_jpy: 500 }, url: 'https://www.gero-ogawaya.net/how_to_spend/daytrip/', original: '日帰りのご利用時間。月・水・金12:00～19:00、火・木13:00～19:00、土・日12:00～15:00。大人1,500円。', validUntil: dynamicFactValidUntil }),
      fact({ code: 'open_air_bath', scopeKey: 'kajika-open-air', scopeLabelKo: '히다강 노천탕', url: 'https://www.gero-ogawaya.net/how_to_spend/daytrip/', original: '河鹿の湯。飛騨川からの風が心地よく、自然の音と風に癒されます。' }),
      fact({ code: 'sauna', scopeKey: 'shirasagi-dry-sauna', scopeLabelKo: '다다미 대욕장 드라이 사우나', url: 'https://www.gero-ogawaya.net/how_to_spend/daytrip/', original: '白鷺の湯。ドライサウナもございます。' }),
    ],
  },
];

const finalAccommodationCatalog = [
  ...initialAccommodationCatalog
    .filter((candidate) => !excludedAccommodationFinalSlugs.has(candidate.slug))
    .map((candidate) => ({ ...candidate, ...(accommodationDecisionOverrides[candidate.slug] ?? {}) })),
  ...promotionAccommodationCatalog,
];

const initialFacilityCatalog = [
  { slug: 'hakone-yuryo', name_ko: '하코네유료', journey: '연인과 함께 쓰는 프라이빗 온천', demand: demand({ url: koreanSearch('하코네유료 대절탕 후기'), note: '한국어 검색·블로그 탐색 표면에서 하코네 당일 대절 노천탕 수요를 확인했습니다.' }), scores: { korean_demand: 4, decision_difficulty: 5, bath_experience: 5, evidence_collectability: 5, journey_fit: 5 }, reason: '19실 대절 노천탕의 사전 전화 예약과 공용탕을 한 시설에서 비교할 수 있습니다.' },
  { slug: 'kawaguchiko-yurari', name_ko: '후지 조망의 온천 유라리', journey: '여행 중 몇 시간 들르는 대형 온천시설', demand: demand({ url: koreanSearch('후지산 유라리 온천 후기'), note: '한국어 검색·블로그 탐색 표면에서 후지산 조망 당일온천 수요를 확인했습니다.' }), scores: { korean_demand: 4, decision_difficulty: 5, bath_experience: 5, evidence_collectability: 5, journey_fit: 5 }, reason: '16종 욕장과 후지산 조망, 숙박객 전용 대절탕의 접근 제한을 명확히 비교해야 합니다.' },
  { slug: 'atami-fuua', name_ko: '오션스파 후아', journey: '여행 중 몇 시간 들르는 대형 온천시설', demand: demand({ url: koreanSearch('아타미 후아 온천 후기'), note: '한국어 검색·블로그 탐색 표면에서 바다 조망 스파·암반욕 수요를 확인했습니다.' }), scores: { korean_demand: 4, decision_difficulty: 4, bath_experience: 5, evidence_collectability: 4, journey_fit: 5 }, reason: '예약 없는 워크인 입장과 바다 조망 노천·암반욕의 이용 제약이 핵심입니다.' },
  { slug: 'osaka-solaniwa-onsen', name_ko: '오사카 소라니와 온천', journey: '여행 중 몇 시간 들르는 대형 온천시설', demand: demand({ url: 'https://travel.naver.com/overseas/JPOSA19506967/poi/review/naver', note: '네이버 여행의 한국어 이용 후기·탐색 표면을 확인했습니다.' }), scores: { korean_demand: 5, decision_difficulty: 5, bath_experience: 5, evidence_collectability: 5, journey_fit: 5 }, reason: '대형 체험형 시설과 대절 노천탕의 예약·요금·입장 규칙이 여행 중 선택을 바꿉니다.' },
  { slug: 'osaka-spa-world', name_ko: '오사카 스파월드', journey: '여행 중 몇 시간 들르는 대형 온천시설', demand: demand({ url: koreanSearch('오사카 스파월드 후기'), note: '기존 한국 수요 원장의 검색·블로그·카페 탐색 표면을 재사용했습니다.' }), scores: { korean_demand: 5, decision_difficulty: 5, bath_experience: 5, evidence_collectability: 3, journey_fit: 5 }, reason: '온천·암반욕·풀·대절 가족탕의 상품 범위와 성별 교대가 복잡한 대표 도시형 시설입니다.' },
  { slug: 'arima-taikounoyu', name_ko: '아리마 온천 타이코노유', journey: '여행 중 몇 시간 들르는 대형 온천시설', demand: demand({ url: koreanSearch('아리마 다이코노유 후기'), note: '기존 한국 수요 원장의 검색·블로그·카페 탐색 표면을 재사용했습니다.' }), scores: { korean_demand: 5, decision_difficulty: 4, bath_experience: 5, evidence_collectability: 5, journey_fit: 5 }, reason: '금천·은천·증기탕·암반욕의 복합 이용과 요금·문신·셔틀 규칙이 분명합니다.' },
  { slug: 'dogo-honkan', name_ko: '도고온천 본관', journey: '여행 중 몇 시간 들르는 대형 온천시설', demand: demand({ url: koreanSearch('도고온천 본관 후기'), note: '기존 한국 수요 원장의 검색·블로그·카페 탐색 표면을 재사용했습니다.' }), scores: { korean_demand: 5, decision_difficulty: 4, bath_experience: 4, evidence_collectability: 5, journey_fit: 5 }, reason: '역사형 공중탕의 시간 제한·입장 상품·혼잡 판단은 숙소와 전혀 다른 결정 문제입니다.' },
  { slug: 'beppu-hyotan', name_ko: '벳푸 효탄온천', journey: '연인과 함께 쓰는 프라이빗 온천', demand: demand({ url: koreanSearch('벳푸 효탄온천 가족탕 후기'), note: '한국어 검색·블로그 탐색 표면에서 벳푸 가족탕·모래탕 수요를 확인했습니다.' }), scores: { korean_demand: 5, decision_difficulty: 5, bath_experience: 5, evidence_collectability: 4, journey_fit: 5 }, reason: '14타입 가족탕과 공용탕·모래탕·증기탕을 함께 골라야 하는 벳푸 대표 시설입니다.' },
  { slug: 'beppu-sakurayu', name_ko: '벳푸 사쿠라유', journey: '연인과 함께 쓰는 프라이빗 온천', demand: demand({ url: koreanSearch('벳푸 사쿠라유 가족탕 후기'), note: '한국어 검색·블로그 탐색 표면에서 시간제 가족탕 선택 수요를 확인했습니다.' }), scores: { korean_demand: 4, decision_difficulty: 5, bath_experience: 4, evidence_collectability: 5, journey_fit: 5 }, reason: '20종 시간제 가족탕의 전화 예약·당일 혼잡·60~90분 운영이 프라이빗 온천 여정을 대표합니다.' },
  { slug: 'beppu-takegawara', name_ko: '다케가와라 온천', journey: '여행 중 몇 시간 들르는 대형 온천시설', demand: demand({ url: 'https://travel.naver.com/overseas/JPBPU555387/poi/review/naver', note: '네이버 여행의 한국어 이용 후기·탐색 표면을 확인했습니다.' }), scores: { korean_demand: 5, decision_difficulty: 4, bath_experience: 5, evidence_collectability: 5, journey_fit: 5 }, reason: '일반욕과 모래찜질의 시간·요금·준비물·혼잡 조기마감이 서로 다릅니다.' },
  { slug: 'ibusuki-saraku', name_ko: '이부스키 사라쿠', journey: '여행 중 몇 시간 들르는 대형 온천시설', demand: demand({ url: koreanSearch('이부스키 사라쿠 모래찜질 후기'), note: '한국어 검색·블로그 탐색 표면에서 모래찜질 체험 수요를 확인했습니다.' }), scores: { korean_demand: 4, decision_difficulty: 4, bath_experience: 5, evidence_collectability: 5, journey_fit: 5 }, reason: '모래찜질과 일반욕·사우나를 묶어 이용하는 시간·휴장·준비물 판단이 핵심입니다.' },
  { slug: 'noboribetsu-daiichi-dayuse', name_ko: '다이이치 타키모토칸 당일입욕', journey: '여행 중 몇 시간 들르는 대형 온천시설', demand: demand({ url: koreanSearch('노보리베츠 다이이치 타키모토칸 당일온천 후기'), note: '한국어 검색·블로그 탐색 표면에서 노보리베츠 대형 당일온천 수요를 확인했습니다.' }), scores: { korean_demand: 4, decision_difficulty: 4, bath_experience: 5, evidence_collectability: 4, journey_fit: 5 }, reason: '다섯 수질·35개 욕조를 당일 이용하는 대형 시설이지만 후기 표본은 보강이 필요합니다.' },
];

const excludedFacilityFinalSlugs = new Set([
  'arima-taikounoyu',
  'beppu-takegawara',
  'ibusuki-saraku',
]);

const promotionFacilityCatalog = [
  { slug: 'kusatsu-ohtakinoyu', name_ko: '구사쓰 오타키노유', journey: '여행 중 몇 시간 들르는 대형 온천시설', demand: demand({ url: koreanSearch('구사쓰 오타키노유 대절탕 후기'), note: '한국어 검색·블로그 탐색 표면에서 구사쓰 당일입욕과 대절탕 수요를 확인했습니다.' }), scores: { korean_demand: 4, decision_difficulty: 5, bath_experience: 5, evidence_collectability: 5, journey_fit: 5 }, reason: '합탕·노천탕·사우나와 예약제 대절탕을 한 곳에서 비교할 수 있고, 이용 시간·요금·수질 적용 범위가 공식으로 분리됩니다.' },
  { slug: 'yokohama-manyoclub', name_ko: '요코하마 미나토미라이 만요클럽', journey: '여행 중 몇 시간 들르는 대형 온천시설', demand: demand({ url: koreanSearch('요코하마 만요클럽 가족탕 후기'), note: '한국어 검색·블로그 탐색 표면에서 미나토미라이 야경 스파와 가족탕 수요를 확인했습니다.' }), scores: { korean_demand: 5, decision_difficulty: 5, bath_experience: 5, evidence_collectability: 5, journey_fit: 5 }, reason: '24시간 체류, 요일별 가족탕 예약 방식, 요금과 야경 노천탕을 한 번에 비교할 수 있는 도시형 대표 후보입니다.' },
  { slug: 'tokyo-toyosu-manyoclub', name_ko: '도쿄 도요스 만요클럽', journey: '여행 중 몇 시간 들르는 대형 온천시설', demand: demand({ url: koreanSearch('도쿄 도요스 만요클럽 가족탕 후기'), note: '한국어 검색·블로그 탐색 표면에서 도요스 야경 스파·가족탕 수요를 확인했습니다.' }), scores: { korean_demand: 5, decision_difficulty: 5, bath_experience: 5, evidence_collectability: 4, journey_fit: 5 }, reason: '24시간 운영과 사전예약 없는 가족탕, 운반온천 범위를 분리해 설명해야 하는 도쿄 대표 당일 스파입니다.' },
  { slug: 'zao-shinzaemon-no-yu', name_ko: '자오온천 신자에몬노유', journey: '탕 자체가 목적인 온천 숙소', demand: demand({ url: koreanSearch('자오온천 신자에몬노유 후기'), note: '한국어 검색·블로그 탐색 표면에서 자오 유황 온천 당일입욕 수요를 확인했습니다.' }), scores: { korean_demand: 4, decision_difficulty: 4, bath_experience: 5, evidence_collectability: 5, journey_fit: 4 }, reason: '대절탕은 없지만 세 개의 유황 노천탕과 시간·요금·휴관 변동을 분명히 비교할 수 있는 목적형 당일온천입니다.' },
  { slug: 'osaka-nijino-yu-osaka-sayama', name_ko: '니지노유 오사카사야마점', journey: '연인과 함께 쓰는 프라이빗 온천', demand: demand({ url: koreanSearch('오사카사야마 니지노유 가족탕 후기'), note: '한국어 검색·블로그 탐색 표면에서 오사카 근교 가족탕·사우나 수요를 확인했습니다.' }), scores: { korean_demand: 4, decision_difficulty: 5, bath_experience: 4, evidence_collectability: 4, journey_fit: 5 }, reason: '웹 전용 완전예약 가족탕 8실의 예약 시점·시간제 요금·연령 제한이 선택을 직접 바꾸는 후보입니다.' },
  { slug: 'kobe-harborland-manyo-club', name_ko: '고베 하버랜드 온천 만요클럽', journey: '여행 중 몇 시간 들르는 대형 온천시설', demand: demand({ url: koreanSearch('고베 하버랜드 만요클럽 가족탕 후기'), note: '한국어 검색·블로그 탐색 표면에서 고베 하버랜드 24시간 스파·가족탕 수요를 확인했습니다.' }), scores: { korean_demand: 4, decision_difficulty: 5, bath_experience: 4, evidence_collectability: 5, journey_fit: 5 }, reason: '24시간 운영·가족탕 사전예약·암반욕 시간·심야 추가요금을 동시에 비교할 수 있는 도심 체류형 시설입니다.' },
  { slug: 'noboribetsu-grand-dayuse', name_ko: '노보리베츠 그랜드호텔 당일온천', journey: '여행 중 몇 시간 들르는 대형 온천시설', demand: demand({ url: koreanSearch('노보리베츠 그랜드호텔 당일온천 가족탕 후기'), note: '한국어 검색·블로그 탐색 표면에서 노보리베츠 대형 당일입욕과 가족탕 수요를 확인했습니다.' }), scores: { korean_demand: 4, decision_difficulty: 5, bath_experience: 5, evidence_collectability: 4, journey_fit: 5 }, reason: '로마식 대욕장·정원 노천탕·오니 사우나와 별도 예약 가족탕의 범위가 명확한 노보리베츠 후보입니다.' },
];

const finalFacilityCatalog = [
  ...initialFacilityCatalog.filter((candidate) => !excludedFacilityFinalSlugs.has(candidate.slug)),
  ...promotionFacilityCatalog,
];

const initialReserveCatalog = [
  { target_type: 'accommodation', slug: 'yufuin-wazanho', name_ko: '유후인 와잔호', journey: '연인과 함께 쓰는 프라이빗 온천', query: '유후인 와잔호 료칸 후기', reason: '객실탕 수요는 높지만 공식 대절·당일 운영 범위가 이번 기준에서 부족합니다.' },
  { target_type: 'accommodation', slug: 'yufuin-warabino', name_ko: '유후인 와라비노', journey: '연인과 함께 쓰는 프라이빗 온천', query: '유후인 와라비노 료칸 후기', reason: '고급 객실탕 수요 후보이나 운영 근거 보강 후 교체합니다.' },
  { target_type: 'accommodation', slug: 'ibusuki-ginsyo', name_ko: '이부스키 긴쇼', journey: '탕 자체가 목적인 온천 숙소', query: '이부스키 긴쇼 료칸 후기', reason: '해안 노천탕 수요는 있으나 이번 최종군보다 공식 결정 질문이 덜 잠겼습니다.' },
  { target_type: 'accommodation', slug: 'beppu-yutorelo', name_ko: '유토렐로 벳푸', journey: '연인과 함께 쓰는 프라이빗 온천', query: '유토렐로 벳푸 료칸 후기', reason: '대절탕·당일 운영 원문을 더 확보한 뒤 교체 후보로 둡니다.' },
  { target_type: 'accommodation', slug: 'unzen-fukudaya', name_ko: '운젠 후쿠다야', journey: '탕 자체가 목적인 온천 숙소', query: '운젠 후쿠다야 료칸 후기', reason: '다양한 탕 경험은 강하지만 한국 수요 근거와 운영 원문을 더 보강합니다.' },
  { target_type: 'accommodation', slug: 'kurokawa-okunoyu', name_ko: '료칸 오쿠노유', journey: '탕 자체가 목적인 온천 숙소', query: '구로카와 오쿠노유 료칸 후기', reason: '구로카와의 노천탕·가족탕 수요 후보이나 공식 운영 원문을 더 보강한 뒤 편입합니다.' },
  { target_type: 'facility', slug: 'kusatsu-ohtakinoyu', name_ko: '구사쓰 오타키노유', journey: '여행 중 몇 시간 들르는 대형 온천시설', query: '구사쓰 오타키노유 후기', reason: '직수 후보 수질 사실은 욕장별 범위 보강이 우선입니다.' },
  { target_type: 'facility', slug: 'tokyo-toyosu-manyoclub', name_ko: '도쿄 도요스 만요클럽', journey: '여행 중 몇 시간 들르는 대형 온천시설', query: '도쿄 도요스 만요클럽 온천 후기', reason: '한국 수요는 크지만 운반온천·가족탕·당일 상품 범위를 더 분리합니다.' },
  { target_type: 'facility', slug: 'yokohama-manyoclub', name_ko: '요코하마 미나토미라이 만요클럽', journey: '여행 중 몇 시간 들르는 대형 온천시설', query: '요코하마 만요클럽 온천 후기', reason: '대형 후기 풀은 있으나 방식·당일 상품 범위를 이번 기준으로 재검증합니다.' },
  { target_type: 'facility', slug: 'noboribetsu-grand-dayuse', name_ko: '노보리베츠 그랜드호텔 당일온천', journey: '여행 중 몇 시간 들르는 대형 온천시설', query: '노보리베츠 그랜드호텔 당일온천 후기', reason: '공식 운영 사실은 좋지만 직접 후기 분모가 너무 작아 보강 후 편입합니다.' },
].map((candidate) => ({
  ...candidate,
  korean_demand: demand({ url: koreanSearch(candidate.query), note: '한국어 검색·블로그·커뮤니티 탐색 표면입니다. 수요 근거로만 사용합니다.' }),
  scores: { korean_demand: 3, decision_difficulty: 4, bath_experience: 4, evidence_collectability: 2, journey_fit: 4 },
  selection: 'reserve',
}));

const promotedReserveSlugs = new Set([
  'kurokawa-okunoyu',
  'kusatsu-ohtakinoyu',
  'tokyo-toyosu-manyoclub',
  'yokohama-manyoclub',
  'noboribetsu-grand-dayuse',
]);

const reserveCatalog = initialReserveCatalog.filter((candidate) => !promotedReserveSlugs.has(candidate.slug));

const holdCatalog = [
  { target_type: 'accommodation', slug: 'yufuin-konjakuan', name_ko: '벳소 콘자쿠안', journey: '연인과 함께 쓰는 프라이빗 온천', query: '유후인 콘자쿠안 료칸 후기', reason: '객실탕과 대절 가족탕은 확인됐지만 당일입욕·대절탕 이용 조건을 이번 기준으로 닫지 못했습니다.' },
  { target_type: 'accommodation', slug: 'yufuin-sakuratei', name_ko: '오야도 사쿠라테이', journey: '연인과 함께 쓰는 프라이빗 온천', query: '유후인 사쿠라테이 료칸 후기', reason: '전 객실 노천탕은 명확하지만 당일입욕과 대절탕 조건이 미확인입니다.' },
  { target_type: 'accommodation', slug: 'beppu-yunosato-hayama', name_ko: '유노사토 하야마', journey: '연인과 함께 쓰는 프라이빗 온천', query: '벳푸 유노사토 하야마 료칸 후기', reason: '대절탕은 확인됐지만 예약 방식·이용 조건·당일입욕을 공식으로 닫지 못했습니다.' },
  { target_type: 'accommodation', slug: 'hakone-byakudan', name_ko: '하코네 고라 백단', journey: '연인과 함께 쓰는 프라이빗 온천', query: '하코네 고라 백단 료칸 후기', reason: '객실탕과 수질 원문은 강하지만 당일입욕 판매 여부가 미확인입니다.' },
  { target_type: 'accommodation', slug: 'hakone-gen-gora', name_ko: '겐 고라', journey: '연인과 함께 쓰는 프라이빗 온천', query: '하코네 겐 고라 료칸 후기', reason: '객실 전용탕은 확인됐지만 공용·대절탕과 당일입욕의 선택 조건이 부족합니다.' },
  { target_type: 'accommodation', slug: 'hakone-yuyado-zen', name_ko: '유야도 젠', journey: '연인과 함께 쓰는 프라이빗 온천', query: '하코네 유야도 젠 료칸 후기', reason: '객실탕 중심 숙소이나 당일입욕과 대절탕의 공식 이용 조건이 부족합니다.' },
  { target_type: 'accommodation', slug: 'gero-miyako', name_ko: '게로 미야코', journey: '연인과 함께 쓰는 프라이빗 온천', query: '게로 미야코 료칸 후기', reason: '노천탕 객실은 확인됐지만 공용탕·대절탕·당일입욕의 범위가 잠기지 않았습니다.' },
  { target_type: 'accommodation', slug: 'nyuto-tsurunoyu', name_ko: '츠루노유 온천', journey: '탕 자체가 목적인 온천 숙소', query: '뉴토 츠루노유 온천 후기', reason: '혼욕 노천탕과 당일입욕은 강점이나 프라이빗 이용 질문과 욕장별 수질 조건이 남았습니다.' },
  { target_type: 'facility', slug: 'arima-taikounoyu', name_ko: '아리마 온천 타이코노유', journey: '여행 중 몇 시간 들르는 대형 온천시설', query: '아리마 타이코노유 후기', reason: '시설 경험은 강하지만 당일입욕의 운영 조건을 이번 결정 질문 단위로 재잠금해야 합니다.' },
  { target_type: 'facility', slug: 'beppu-takegawara', name_ko: '다케가와라 온천', journey: '여행 중 몇 시간 들르는 대형 온천시설', query: '벳푸 다케가와라 온천 모래찜질 후기', reason: '모래찜질과 일반욕의 조건은 확인됐지만 프라이빗 이용 질문을 명확한 해당 없음으로 정리하지 못했습니다.' },
  { target_type: 'facility', slug: 'ibusuki-saraku', name_ko: '이부스키 사라쿠', journey: '여행 중 몇 시간 들르는 대형 온천시설', query: '이부스키 사라쿠 모래찜질 후기', reason: '모래찜질 중심 경험은 강하지만 입욕·사우나·프라이빗 질문의 운영 원문을 더 보강해야 합니다.' },
].map((candidate) => ({
  ...candidate,
  korean_demand: demand({ url: koreanSearch(candidate.query), note: '한국어 검색·블로그·커뮤니티 탐색 표면입니다. 수요 근거로만 사용합니다.' }),
  scores: { korean_demand: 3, decision_difficulty: 4, bath_experience: 4, evidence_collectability: 2, journey_fit: 4 },
  selection: 'hold',
}));

const facilitySeedPaths = [
  'research/onsen-db-seed/kanto_tokyo_facility_draft_seed_2026-07-10.json',
  'research/onsen-db-seed/kanto_tokyo_facility_official_filter_fact_seed_2026-07-10.json',
  'research/onsen-db-seed/hakone_kanagawa_yamanashi_facility_db_seed_2026-07-11.json',
  'research/onsen-db-seed/izu_shizuoka_facility_db_seed_2026-07-11.json',
  'research/onsen-db-seed/kyushu_kansai_facility_db_seed_2026-07-10.json',
  'research/onsen-db-seed/kansai_sanin_setouchi_facility_db_seed_2026-07-12.json',
  'research/onsen-db-seed/tohoku_facility_db_seed_2026-07-11.json',
  'research/onsen-db-seed/hokkaido_facility_db_seed_2026-07-12.json',
];

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function compareDate(left, right) {
  return String(left ?? '').localeCompare(String(right ?? ''));
}

function csvEscape(value) {
  const text = value === undefined || value === null ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(filePath, rows, headers) {
  const lines = [headers.join(','), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(','))];
  writeFileSync(filePath, `${lines.join('\n')}\n`);
}

function markdownTable(rows, headers) {
  const line = (values) => `| ${values.map((value) => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', '<br>')).join(' | ')} |`;
  return [line(headers), line(headers.map(() => '---')), ...rows.map((row) => line(headers.map((header) => row[header])))].join('\n');
}

function statusCount(questions) {
  const rows = questionOrder.map((code) => questions[code]);
  const decisionAnswers = rows.filter((row) => row?.status === 'verified' || row?.status === 'conditional').length;
  const p0Codes = ['private_bath_booking_flow', 'private_bath_terms_limits', 'day_use_operation'];
  const p0NeedsCheck = p0Codes.filter((code) => questions[code]?.applicability !== 'not_applicable' && questions[code]?.status === 'needs_check');
  const verified = rows.filter((row) => row?.status === 'verified').length;
  const conditional = rows.filter((row) => row?.status === 'conditional').length;
  const needsCheckCount = rows.filter((row) => row?.status === 'needs_check').length;
  const readiness = decisionAnswers >= 6 && p0NeedsCheck.length === 0
    ? (conditional > 0 ? 'conditional' : 'ready')
    : 'hold';
  return { verified, conditional, needs_check: needsCheckCount, decision_answers: decisionAnswers, p0_needs_check: p0NeedsCheck, readiness };
}

function scoreTotal(scores) {
  return Object.values(scores).reduce((sum, score) => sum + Number(score ?? 0), 0);
}

function buildFacilityLedger() {
  const ledger = new Map();
  for (const relativePath of facilitySeedPaths) {
    if (!existsSync(path.join(repoRoot, relativePath))) continue;
    const seed = readJson(relativePath);
    for (const facility of safeArray(seed.facilities)) {
      const current = ledger.get(facility.slug) ?? { facilities: [], facts: [], waterFacts: [], evidence: [] };
      current.facilities.push({ ...facility, _source_file: relativePath });
      ledger.set(facility.slug, current);
    }
    for (const row of [...safeArray(seed.official_filter_facts), ...safeArray(seed.facts)]) {
      const current = ledger.get(row.facility_slug) ?? { facilities: [], facts: [], waterFacts: [], evidence: [] };
      current.facts.push({
        ...row,
        availability: row.availability ?? 'confirmed',
        filter_status: row.filter_status ?? 'ready',
        scope_label_ko: row.scope_label_ko ?? row.scope_key,
        source_kind: row.source_kind ?? 'operator_official',
        _source_file: relativePath,
      });
      ledger.set(row.facility_slug, current);
    }
    for (const row of safeArray(seed.water_facts)) {
      const current = ledger.get(row.facility_slug) ?? { facilities: [], facts: [], waterFacts: [], evidence: [] };
      current.waterFacts.push({ ...row, _source_file: relativePath });
      ledger.set(row.facility_slug, current);
    }
    for (const row of safeArray(seed.evidence)) {
      const current = ledger.get(row.facility_slug) ?? { facilities: [], facts: [], waterFacts: [], evidence: [] };
      current.evidence.push({ ...row, _source_file: relativePath });
      ledger.set(row.facility_slug, current);
    }
  }
  return ledger;
}

function latestFacilityData(ledger, slug) {
  const entry = ledger.get(slug);
  if (!entry) throw new Error(`시설 seed 원장에서 ${slug}을 찾지 못했습니다.`);
  const facility = [...entry.facilities].sort((left, right) => compareDate(right.official_checked_at, left.official_checked_at))[0];
  const evidence = [...entry.evidence].sort((left, right) => compareDate(right.collected_on, left.collected_on))[0];
  const facts = [...entry.facts]
    .sort((left, right) => compareDate(right.official_source_checked_at, left.official_source_checked_at))
    .filter((row, index, rows) => rows.findIndex((candidate) => candidate.filter_code === row.filter_code && candidate.scope_key === row.scope_key) === index);
  const waterFacts = [...entry.waterFacts]
    .sort((left, right) => compareDate(right.official_source_checked_at, left.official_source_checked_at))
    .filter((row, index, rows) => rows.findIndex((candidate) => candidate.scope_key === row.scope_key) === index);
  return { facility, evidence, facts, waterFacts };
}

function facilityFact(facts, codes) {
  return facts.find((row) => codes.includes(row.filter_code) && row.filter_status === 'ready');
}

function facilityValue(row) {
  return isRecord(row?.filter_value) ? row.filter_value : {};
}

function facilitySource(row) {
  return row ? { url: row.official_source_url, original: row.official_original_text, checkedAt: row.official_source_checked_at, scope: row.scope_label_ko ?? row.scope_key } : {};
}

const decisionFacilityFactRows = {
  'osaka-solaniwa-onsen': [
    fact({
      code: 'private_bath',
      scopeKey: 'private_bath',
      scopeLabelKo: '대절 노천탕 10실',
      filterValue: {
        room_count: 10,
        duration_minutes: 90,
        private_room_price_from_jpy: 8800,
        special_japanese_room_price_from_jpy: 12100,
        tent_sauna_room_price_from_jpy: 15400,
        admission_fee_separate: true,
        same_day_phone_booking: true,
        same_day_phone_hours: '11:00-18:00',
        same_day_start_time: '11:30-18:00',
      },
      url: 'https://solaniwa.com/explore/private_bath/',
      original: '源泉かけ流しの貸切露天風呂と坪庭付きの完全個室を10室。個室 8,800円～ / 1部屋、90分。空き室があればお電話でのご予約が可能。',
      validUntil: dynamicFactValidUntil,
    }),
  ],
  'osaka-spa-world': [
    fact({
      code: 'family_bath',
      scopeKey: 'private-family-bath',
      scopeLabelKo: '대절 가족탕',
      filterValue: {
        reservation_required: true,
        booking_channel_ko: '2층 인포메이션 카운터',
        same_day_if_available: true,
        duration_minutes: 90,
        weekday_jpy: 8000,
        weekend_holiday_special_day_jpy: 12000,
        adult_capacity: 4,
        eligibility_ko: '가족 이용 전용이며 동성끼리 이용도 가능',
        hours: '11:00-23:00',
        final_reception: '21:00',
      },
      url: 'https://www.spaworld.co.jp/wp-spa/wp-content/uploads/2025/11/1118kashikirikazokuburo-annai.pdf',
      original: 'ご予約・受付 予約制（受付2Fインフォメーション）。当日空きがあればご利用可能。1枠90分。平日8,000円、土日祝・特別日12,000円。大人（中学生以上）4名様まで。営業時間11:00～23:00（最終受付21:00）。',
      validUntil: dynamicFactValidUntil,
    }),
  ],
  'beppu-hyotan': [
    fact({
      code: 'family_bath',
      scopeKey: 'all-family-baths',
      scopeLabelKo: '가족탕 14실',
      filterValue: {
        room_count: 14,
        reservation_required: true,
        booking_channel_ko: '전화',
        advance_booking_from_days: 7,
        duration_options_minutes: [60, 75, 90],
        prices_jpy: { 60: 2400, 75: 3000, 90: 3600 },
      },
      url: 'https://www.hyotan-onsen.com/sp/onsen/family.html',
      original: '全ての家族風呂で事前予約が必要になります。家族風呂はご利用日の１週間前からお電話でご予約できます。基本料金は１部屋あたり60分コース 2,400円、75分コース 3,000円、90分コース 3,600円です。',
      validUntil: dynamicFactValidUntil,
    }),
  ],
  'noboribetsu-daiichi-dayuse': [
    fact({
      code: 'family_bath',
      scopeKey: 'facility-wide-private-bath',
      scopeLabelKo: '가족탕·대절탕',
      availability: 'not_available',
      filterValue: { condition_ko: '수영복 착용 풀·풀 인접 노천 자쿠지는 남녀 함께 이용 가능하나 가족탕·대절탕은 없음' },
      url: 'https://takimotokan.co.jp/ja/faq/',
      original: '家族風呂、貸切風呂はございません。水着着用にてご利用いただけるプール・プール施設内のジャグジー・プールに隣接する露天ジャグジーは男女を問わずご一緒にお楽しみいただけます。',
      validUntil: dynamicFactValidUntil,
    }),
  ],
  'kusatsu-ohtakinoyu': [
    fact({ code: 'private_bath', scopeKey: 'private_bath', scopeLabelKo: '대절온천 샤쿠나게', filterValue: { reservation_required: true, booking_channel_ko: '프런트', duration_minutes: 60, room_fee_jpy: 2000, hours: '09:00-19:00', final_reception: '18:00', admission_fee_separate: true }, url: 'https://onsen-kusatsu.com/ohtakinoyu/guide/', original: '貸切風呂…9:00～19:00（最終受付18:00）※受付はフロントまで。貸切温泉「しゃくなげ」2,000円／1時間 ※予約制、入場料別。', validUntil: dynamicFactValidUntil }),
    fact({ code: 'day_use', scopeKey: 'facility-operation', scopeLabelKo: '당일입욕', filterValue: { hours: '09:00-21:00', last_admission: '20:00', adult_price_jpy: 1200, towel_set_jpy: 250 }, url: 'https://onsen-kusatsu.com/ohtakinoyu/guide/', original: '営業時間9:00～21:00（最終入館20:00）。入場料大人1,200円。セット（タオル・バスタオル）250円。', validUntil: dynamicFactValidUntil }),
    fact({ code: 'adult_day_use_price', scopeKey: 'facility-admission', scopeLabelKo: '성인 당일입욕 요금', filterValue: { amount_jpy: 1200 }, url: 'https://onsen-kusatsu.com/ohtakinoyu/guide/', original: '入場料 大人：1,200円。', validUntil: dynamicFactValidUntil }),
    fact({ code: 'open_air_bath', scopeKey: 'public-open-air', scopeLabelKo: '공용 노천탕', url: 'https://onsen-kusatsu.com/ohtakinoyu/faq/', original: '大浴場、露天風呂、合わせ湯、水風呂、サウナがございます。' }),
    fact({ code: 'sauna', scopeKey: 'public-sauna', scopeLabelKo: '공용 사우나', url: 'https://onsen-kusatsu.com/ohtakinoyu/faq/', original: '大浴場、露天風呂、合わせ湯、水風呂、サウナがございます。' }),
  ],
  'yokohama-manyoclub': [
    fact({ code: 'family_bath', scopeKey: 'family_bath', scopeLabelKo: '가족탕', filterValue: { reservation_required: true, booking_channel_ko: '전화·현장 안내 카운터', weekday_advance_booking: true, weekend_holiday_advance_from: 'previous_day_09:00', same_day_counter_booking: true, duration_minutes: 60, room_fee_jpy: 3800, capacity: 4, admission_fee_separate: true }, url: 'https://www.manyo.co.jp/mm21/price/', original: '家族風呂 室料1時間3,800円。4名定員。平日（月～金）は事前予約。土日・祝は前日の朝9:00より事前予約。ご来館当日ご案内カウンターでのご予約。※入館料別途。', validUntil: dynamicFactValidUntil }),
    fact({ code: 'day_use', scopeKey: 'facility-operation', scopeLabelKo: '당일입욕·체류', filterValue: { hours: '24hours_year_round', public_bath_cleaning: '03:00-05:00', adult_price_jpy: 3500, late_night_surcharge_jpy: 2400 }, url: 'https://www.manyo.co.jp/mm21/price/', original: '年中無休／24時間営業。マル得セット入館料 大人3,500円。深夜3:00～翌9:00の深夜料金2,400円。大浴場深夜3:00～5:00は清掃の為利用不可。', validUntil: dynamicFactValidUntil }),
    fact({ code: 'adult_day_use_price', scopeKey: 'facility-admission', scopeLabelKo: '성인 당일입욕 요금', filterValue: { amount_jpy: 3500, condition_ko: '심야 03:00 이후 추가 요금' }, url: 'https://www.manyo.co.jp/mm21/price/', original: 'マル得セット入館料 大人3,500円。深夜3時以降は深夜料金を別途。', validUntil: dynamicFactValidUntil }),
    fact({ code: 'open_air_bath', scopeKey: 'yokohama-port-open-air', scopeLabelKo: '요코하마항 조망 노천탕', url: 'https://www.manyo.co.jp/mm21/onsen/', original: '横浜港を望む露天スペース。' }),
    fact({ code: 'sauna', scopeKey: 'public-saunas', scopeLabelKo: '공용 사우나', url: 'https://www.manyo.co.jp/mm21/onsen/', original: '男女ともに3種類のサウナを完備。' }),
  ],
  'tokyo-toyosu-manyoclub': [
    fact({ code: 'family_bath', scopeKey: 'family_bath', scopeLabelKo: '가족탕', filterValue: { reservation_required: false, booking_channel_ko: '현장', duration_minutes: 60, room_fee_jpy: 4500 }, url: 'https://tokyo-toyosu.manyo.co.jp/price/', original: '家族風呂 4,500円。※事前のご予約は承っておりません。室料1時間。', validUntil: dynamicFactValidUntil }),
    fact({ code: 'day_use', scopeKey: 'facility-operation', scopeLabelKo: '당일입욕·체류', filterValue: { hours: '24hours_year_round', public_bath_cleaning: '03:00-05:00', adult_price_jpy: 3850, late_night_surcharge_jpy: 3000 }, url: 'https://tokyo-toyosu.manyo.co.jp/price/', original: '年中無休／24時間営業。マル得セット入館料 大人3,850円。深夜料金3,000円。大浴場深夜3:00～朝5:00は清掃の為利用不可。', validUntil: dynamicFactValidUntil }),
    fact({ code: 'adult_day_use_price', scopeKey: 'facility-admission', scopeLabelKo: '성인 당일입욕 요금', filterValue: { amount_jpy: 3850, condition_ko: '심야 03:00 이후 추가 요금' }, url: 'https://tokyo-toyosu.manyo.co.jp/price/', original: 'マル得セット入館料 大人3,850円。深夜3時以降は深夜料金を別途。', validUntil: dynamicFactValidUntil }),
    fact({ code: 'open_air_bath', scopeKey: 'tokyo-bay-open-air', scopeLabelKo: '도쿄만 조망 노천탕', url: 'https://tokyo-toyosu.manyo.co.jp/onsen/', original: '東京湾を望む露天風呂。※男性露天風呂。' }),
    fact({ code: 'sauna', scopeKey: 'public-saunas', scopeLabelKo: '공용 사우나', url: 'https://tokyo-toyosu.manyo.co.jp/onsen/', original: 'サウナ、大浴場、露天風呂。' }),
  ],
  'zao-shinzaemon-no-yu': [
    fact({ code: 'family_bath', scopeKey: 'facility-wide-private-bath', scopeLabelKo: '가족탕·대절탕', availability: 'not_available', filterValue: { condition_ko: '가족탕 없음. 1인용 박스 사우나는 사전 웹 예약제.' }, url: 'https://zaospa.co.jp/toiawase', original: '家族風呂はございません。サウナはお一人様用BOXサウナがございます。（事前WEB予約制）', validUntil: dynamicFactValidUntil }),
    fact({ code: 'adult_day_use_price', scopeKey: 'facility-admission', scopeLabelKo: '성인 당일입욕 요금', filterValue: { amount_jpy: 1000 }, url: 'https://zaospa.co.jp/', original: '大人1,000円。', validUntil: dynamicFactValidUntil }),
    fact({ code: 'private_sauna', scopeKey: 'single-box-sauna', scopeLabelKo: '1인용 박스 사우나', filterValue: { reservation_required: true, booking_channel_ko: '사전 웹 예약' }, url: 'https://zaospa.co.jp/toiawase', original: 'サウナはお一人様用BOXサウナがございます。（事前WEB予約制）' }),
  ],
  'osaka-nijino-yu-osaka-sayama': [
    fact({ code: 'family_bath', scopeKey: 'family_bath', scopeLabelKo: '가족탕 8실', filterValue: { room_count: 8, reservation_required: true, booking_channel_ko: '웹 전용', advance_booking_from_days: 14, same_day_booking: true, duration_options_minutes: [60, 90], prices_jpy: { 60: 4200, 90: 6300 }, base_adult_capacity: 3, minor_only_not_allowed: true }, url: 'https://spa-sauna.jp/familyBath/asagiri', original: 'ご予約はWebのみ。利用日の2週間前から当日まで予約可。60分4,200円、90分6,300円。18歳未満のお客様だけのご利用は固くお断り致します。', validUntil: dynamicFactValidUntil }),
    fact({ code: 'day_use', scopeKey: 'facility-operation', scopeLabelKo: '당일입욕', filterValue: { hours: '10:00-24:00', last_admission: '23:15', adult_weekday_jpy: 920, adult_weekend_holiday_jpy: 970 }, url: 'https://spa-sauna.jp/', original: '営業時間 年中無休 ※メンテナンス日を除く 10:00～24:00（最終受付 大浴場23:15）。', validUntil: dynamicFactValidUntil }),
    fact({ code: 'adult_day_use_price', scopeKey: 'facility-admission', scopeLabelKo: '성인 당일입욕 요금', filterValue: { weekday_jpy: 920, weekend_holiday_jpy: 970 }, url: 'https://spa-sauna.jp/charge', original: '大人ご入浴料金 平日920円、土日祝970円。', validUntil: dynamicFactValidUntil }),
  ],
  'kobe-harborland-manyo-club': [
    fact({ code: 'family_bath', scopeKey: 'family_bath', scopeLabelKo: '12층 가족탕 2실', filterValue: { room_count: 2, reservation_required: true, booking_channel_ko: '전화', duration_minutes: 60, room_fee_jpy: 2860, hours: '24hours', admission_fee_separate: true }, url: 'https://www.manyo.co.jp/kobe/eng/fee-schedule/', original: 'Reserve Private Onsen Bath JPY 2,860/hour. Advance reservations required.', validUntil: dynamicFactValidUntil }),
    fact({ code: 'day_use', scopeKey: 'facility-operation', scopeLabelKo: '당일입욕·체류', filterValue: { hours: '24hours_year_round', adult_price_jpy: 2950, late_night_surcharge_jpy: 2200, maximum_stay_until: '11:00' }, url: 'https://www.manyo.co.jp/kobe/question/', original: '24時間営業。朝5時以降のご入館。基本料金2,950円。深夜3時を超えると2,200円発生。ご滞在は午前11時まで可能。', validUntil: dynamicFactValidUntil }),
    fact({ code: 'adult_day_use_price', scopeKey: 'facility-admission', scopeLabelKo: '성인 당일입욕 요금', filterValue: { amount_jpy: 2950, condition_ko: '심야 03:00 이후 추가 요금' }, url: 'https://www.manyo.co.jp/kobe/question/', original: '基本料金2,950円。深夜3時を超えると2,200円発生。', validUntil: dynamicFactValidUntil }),
    fact({ code: 'open_air_bath', scopeKey: 'public-bath-and-footbath', scopeLabelKo: '공용 대욕장·전망 족탕', url: 'https://www.manyo.co.jp/kobe/yudokoro/', original: '大浴場。展望足湯庭園。' }),
    fact({ code: 'sauna', scopeKey: 'public-saunas', scopeLabelKo: '공용 사우나', url: 'https://www.manyo.co.jp/kobe/yudokoro/', original: '高温サウナ、ナノミストサウナ、塩サウナ。' }),
  ],
  'noboribetsu-grand-dayuse': [
    fact({ code: 'family_bath', scopeKey: 'reservable-family-bath', scopeLabelKo: '예약제 가족탕', filterValue: { reservation_required: true, capacity: 4, duration_minutes: 50, room_fee_jpy: 4400, admission_fee_separate: true }, url: 'https://www.nobogura.co.jp/hotspring/', original: '温泉家族風呂。4名様まで利用可能。料金50分／4,400円（税込）。要予約。日帰りの場合は、日帰り入浴代金が別途かかります。', validUntil: dynamicFactValidUntil }),
  ],
};

const decisionFacilityWaterRows = {
  'kusatsu-ohtakinoyu': [
    waterFact({ scopeKey: 'awaseyu-step-baths', scopeLabelKo: '합탕', waterSystem: 'kakenagashi', kasui: 'no', kaon: 'no', junkan: 'unknown', disinfection: 'unknown', methodRenderStatus: 'scope_split_required', url: 'https://onsen-kusatsu.com/ohtakinoyu/faq/', original: '温泉はかけ流しですか。源泉かけ流しです。源泉が順に浴槽を巡り、水で薄めることなく、自然冷却によって浴槽温度が異なる仕組み。' }),
  ],
  'yokohama-manyoclub': [
    waterFact({ scopeKey: 'transported-atami-yugawara', scopeLabelKo: '공용탕·노천탕 운반 온천', url: 'https://www.manyo.co.jp/mm21/onsen/', original: '「熱海温泉」と「湯河原温泉」の源泉から毎日タンクローリーで運ばれて来たものです。' }),
  ],
  'tokyo-toyosu-manyoclub': [
    waterFact({ scopeKey: 'transported-hakone-yugawara', scopeLabelKo: '공용탕·노천탕 운반 온천', url: 'https://tokyo-toyosu.manyo.co.jp/onsen/', original: '「箱根温泉」と「湯河原温泉」の源泉からタンクローリーで運ばれて来たものです。' }),
  ],
};

function facilityQuestionSet(slug, data) {
  const facts = data.facts;
  const profile = isRecord(data.facility?.official_profile) ? data.facility.official_profile : {};
  const bathAreas = safeArray(profile.bath_areas);
  const dayUse = facilityFact(facts, ['day_use']);
  const price = facilityFact(facts, ['adult_day_use_price']);
  const privateBath = facilityFact(facts, ['private_bath', 'family_bath']);
  const openAir = facilityFact(facts, ['open_air_bath']);
  const featureFacts = facts.filter((row) => ['sauna', 'stone_sauna', 'sand_bath', 'steam_bath', 'rest_area', 'water_bath', 'private_sauna'].includes(row.filter_code));
  const water = data.waterFacts.find((row) => row.official_original_text && row.official_source_url);
  const q = {
    together_private_eligibility: privateBath
      ? answer('verified', privateBath.availability === 'not_available' ? '공식 안내상 프라이빗·가족탕을 제공하지 않습니다.' : '공식 안내상 프라이빗·가족탕을 동행인과 이용할 수 있습니다.', facilitySource(privateBath))
      : needsCheck('프라이빗·가족탕의 실제 제공 여부와 대상 범위를 공식 최신 안내에서 확인합니다.', { answerKo: '프라이빗·가족탕 제공 여부를 공식 원문으로 확정하지 못했습니다.' }),
    bath_layout_scope: (bathAreas.length > 0 || openAir || privateBath)
      ? answer('verified', `공식 원장 기준 ${bathAreas.length > 0 ? bathAreas.join('·') : '공용탕·프라이빗탕'} 구성을 구분해 봅니다.`, facilitySource(openAir ?? privateBath))
      : needsCheck('공용탕·노천탕·프라이빗탕의 실제 구성을 공식 페이지에서 확인합니다.'),
    private_bath_booking_flow: privateBath?.availability === 'not_available'
      ? notApplicable('공식 안내상 가족탕·대절탕이 없어 프라이빗탕 예약 절차는 적용되지 않습니다.', facilitySource(privateBath))
      : privateBath
      ? (() => {
          const value = facilityValue(privateBath);
          const reservation = value.reservation ?? value.reservation_required ?? value.same_day_reservation_only ?? value.booking_channel ?? value.vacancy_check_method;
          return reservation !== undefined
            ? answer(privateBath.availability === 'conditional' ? 'conditional' : 'verified', `프라이빗탕 이용 방식은 ${typeof reservation === 'boolean' ? (reservation ? '예약이 필요합니다.' : '예약이 필요하지 않습니다.') : String(reservation)}로 공식 안내됩니다.`, facilitySource(privateBath))
            : needsCheck('프라이빗탕의 사전예약·현장예약·선착순·빈 탕 이용 방식을 공식 최신 안내에서 확인합니다.', { answerKo: '프라이빗탕은 확인되지만 예약 방식은 공식 원문으로 잠기지 않았습니다.', ...facilitySource(privateBath) });
        })()
      : needsCheck('프라이빗·가족탕 제공 여부와 예약 방식을 공식 최신 안내에서 확인합니다.'),
    private_bath_terms_limits: privateBath?.availability === 'not_available'
      ? notApplicable('공식 안내상 가족탕·대절탕이 없어 프라이빗탕 요금·시간 조건은 적용되지 않습니다.', facilitySource(privateBath))
      : privateBath
      ? (() => {
          const value = facilityValue(privateBath);
          const termKeys = ['duration_minutes', 'minimum_minutes', 'usage_limit_minutes', 'room_fee_jpy', 'price_jpy', 'capacity', 'max_people'];
          const terms = termKeys.filter((key) => value[key] !== undefined).map((key) => `${key}=${value[key]}`);
          return terms.length > 0
            ? answer(privateBath.availability === 'conditional' ? 'conditional' : 'verified', `공식 안내된 프라이빗탕 조건: ${terms.join(', ')}.`, facilitySource(privateBath))
            : needsCheck('프라이빗탕의 요금·시간·정원·대상 조건을 공식 최신 안내에서 확인합니다.', { answerKo: '프라이빗탕은 확인되지만 요금·시간·정원은 공식 원문으로 잠기지 않았습니다.', ...facilitySource(privateBath) });
        })()
      : needsCheck('프라이빗·가족탕 제공 여부와 이용 조건을 공식 최신 안내에서 확인합니다.'),
    day_use_operation: dayUse
      ? (() => {
          const value = facilityValue(dayUse);
          const priceValue = facilityValue(price);
          const details = [value.hours, value.last_admission ? `최종입장 ${value.last_admission}` : null, priceValue.amount_jpy ? `성인 ${priceValue.amount_jpy}엔` : null].filter(Boolean);
          return answer(dayUse.availability === 'conditional' ? 'conditional' : 'verified', dayUse.availability === 'not_available' ? '공식 안내상 당일입욕을 제공하지 않습니다.' : `당일입욕은 ${details.length > 0 ? details.join(', ') : '공식 안내 기준'}으로 이용합니다.`, { ...facilitySource(dayUse), checkWhat: dayUse.availability === 'conditional' ? '영업일·요금·입장 제한은 방문 전 공식 공지를 확인합니다.' : null });
        })()
      : needsCheck('당일입욕 가능 여부·운영 시간·마지막 입장·요금을 공식 최신 안내에서 확인합니다.'),
    bath_experience_richness: (openAir || featureFacts.length > 0 || bathAreas.length > 1)
      ? answer('verified', `공식 안내에서 ${[openAir ? '노천탕' : null, ...featureFacts.map((row) => row.scope_label_ko ?? row.filter_code)].filter(Boolean).join('·')} 경험을 확인했습니다.`, facilitySource(openAir ?? featureFacts[0]))
      : needsCheck('탕 종류·노천·전망·사우나·암반욕의 공식 범위를 확인합니다.'),
    water_operation_method: water
      ? (water.water_system && water.method_render_status === 'ready'
          ? answer('verified', `공식 원문 기준 ${water.water_system}이며, 가수=${water.kasui}, 가온=${water.kaon}, 소독=${water.disinfection}입니다.`, { url: water.official_source_url, original: water.official_original_text, checkedAt: water.official_source_checked_at, scope: water.scope_label_ko ?? water.scope_key })
          : answer('conditional', '공식 수질·운용 원문은 보존했지만, 욕장 범위가 갈리거나 방식 배지 조건이 완결되지 않아 배지를 공개하지 않습니다.', { url: water.official_source_url, original: water.official_original_text, checkedAt: water.official_source_checked_at, scope: water.scope_label_ko ?? water.scope_key, checkWhat: '욕장별 가수·가온·순환·소독 조건과 적용 범위를 재확인합니다.' }))
      : needsCheck('공식 원문과 욕장 범위를 확보한 뒤에만 온천수 방식을 공개합니다.', { answerKo: '온천수 방식은 공식 원문·욕장 범위가 부족해 배지를 공개하지 않습니다.' }),
  };

  const overrides = {
    'hakone-yuryo': {
      private_bath_booking_flow: answer('verified', '대절 노천탕 19실은 이용일 1개월 전부터 전화로 예약합니다.', { url: 'https://www.hakoneyuryo.jp/spa/private/', original: 'ご利用日の1か月前より電話予約を承ります。', scope: '대절 노천탕 19실' }),
      private_bath_terms_limits: answer('verified', '2명 또는 4명 정원 3타입이며 120분부터 이용합니다.', { url: 'https://www.hakoneyuryo.jp/spa/private/', original: '19室、2名または4名定員の3タイプ、120分から。', scope: '대절 노천탕' }),
      day_use_operation: answer('conditional', '공용 대욕장은 평일 10:00~20:00, 토·일·공휴일 10:00~21:00입니다.', { url: 'https://www.hakoneyuryo.jp/price/', original: '大浴場は平日10:00-20:00、土休日10:00-21:00。', scope: '공용 대욕장', checkWhat: '요금·마지막 입장·휴관일은 방문 전 공식 페이지에서 확인합니다.' }),
      bath_layout_scope: answer('verified', '공용 대욕장·노천탕·사우나와 19실 대절 노천탕을 구분해 이용합니다.', { url: 'https://www.hakoneyuryo.jp/price/', original: '大浴場 本殿 湯楽庵 大湯、離れ湯屋 花伝。', scope: '시설 전체' }),
    },
    'kawaguchiko-yurari': {
      together_private_eligibility: answer('conditional', '대절탕은 존재하지만 후지 녹색 휴가촌 숙박객만 이용할 수 있어, 일반 당일입욕객은 대상이 아닙니다.', { url: 'https://www.fuji-yurari.jp/spa/kashikiri.html', original: 'ご利用は富士緑の休暇村にご宿泊の方に限ります。', scope: '대절탕' }),
      private_bath_booking_flow: answer('verified', '대절탕은 당일 접수만 가능하고 예약제가 아닙니다.', { url: 'https://www.fuji-yurari.jp/spa/kashikiri.html', original: '貸切風呂は当日の受付に限らせて頂きます。予約制ではありません。', scope: '대절탕' }),
      private_bath_terms_limits: answer('verified', '대절탕은 1시간 3,500엔이며 숙박객 한정입니다.', { url: 'https://www.fuji-yurari.jp/spa/kashikiri.html', original: 'ご利用は1時間3,500円。富士緑の休暇村にご宿泊の方に限ります。', scope: '대절탕' }),
      day_use_operation: answer('conditional', '평일 10:00~21:00(최종 20:00), 토·일·공휴일 10:00~22:00(최종 21:00)입니다.', { url: 'https://www.fuji-yurari.jp/qa.html', original: '平日10:00-21:00／土日祝10:00-22:00。', scope: '당일입욕', checkWhat: '계절·혼잡기 운영 시간과 휴장 여부는 공식 공지를 확인합니다.' }),
      bath_experience_richness: answer('verified', '16종의 욕장과 후지산 조망 노천탕을 갖춘 대형 당일입욕 시설입니다.', { url: 'https://www.fuji-yurari.jp/spa.html', original: '湯舟の種類は全16種類。湯船に浸かりながら雄大な富士山を望む。', scope: '공용탕' }),
    },
    'atami-fuua': {
      together_private_eligibility: notApplicable('공식 FAQ 기준 개인 대절 휴게실·가족탕은 제공하지 않습니다.', { url: 'https://www.atamibayresort.com/fuua/faq/', original: '貸切休憩室・家族風呂はございません。', scope: '시설 전체' }),
      private_bath_booking_flow: notApplicable('가족탕이 없어 프라이빗탕 예약 절차는 적용되지 않습니다.', { url: 'https://www.atamibayresort.com/fuua/faq/', original: '家族風呂はございません。', scope: '시설 전체' }),
      private_bath_terms_limits: notApplicable('가족탕이 없어 프라이빗탕 요금·시간 조건은 적용되지 않습니다.', { url: 'https://www.atamibayresort.com/fuua/faq/', original: '家族風呂はございません。', scope: '시설 전체' }),
      day_use_operation: answer('conditional', '사전 예약 없이 직접 방문하는 당일입장 방식입니다. 운영 시간·입장 제한은 방문 전 확인해야 합니다.', { url: 'https://www.atamibayresort.com/fuua/faq/', original: 'ご予約は承っておりません。直接ご来館くださいませ。', scope: '당일입장', checkWhat: '당일 영업 시간·최종 입장·혼잡 입장 제한·연령 제한을 확인합니다.' }),
      bath_experience_richness: answer('verified', '사가미나다 조망 노천 입욕, 암반욕, 로우류 캠프와 여덟 종류 라운지를 갖춘 체류형 스파입니다.', { url: 'https://www.atamibayresort.com/fuua/facilities/', original: '露天立ち湯、岩盤浴、アタミリビング。', scope: '시설 전체' }),
    },
    'osaka-solaniwa-onsen': {
      private_bath_booking_flow: answer('conditional', '대절 노천탕은 온라인 예약을 안내하며, 당일에는 빈방이 있으면 전화 예약할 수 있습니다. 당일 전화 접수는 11:00~18:00, 11:30~18:00 시작 회차가 대상입니다.', { url: 'https://solaniwa.com/explore/private_bath/', original: '予約。空き室があればお電話でのご予約が可能。当日ご予約承ります。お電話受付時間 11:00～18:00。対象 平日・土日祝の11:30～18:00スタート分。', scope: '대절 노천탕', checkWhat: '온라인 예약 가능 객실과 원하는 시작 시간의 실제 잔여 여부를 확인합니다.' }),
      private_bath_terms_limits: answer('conditional', '대절 노천탕은 객실당 90분이며, 일반 객실은 8,800엔부터, 특별 다다미 객실은 12,100엔부터, 텐트사우나 객실은 15,400엔부터입니다. 입장료는 별도입니다.', { url: 'https://solaniwa.com/explore/private_bath/', original: '個室 8,800円～ / 1部屋、90分。特別和室 12,100円～ / 1部屋、90分。特別洋室 15,400円～ / 1部屋、90分。※入館料別途。', scope: '대절 노천탕', checkWhat: '객실별 정원·당일 가격과 연장 가능 여부를 예약 화면에서 확인합니다.' }),
      day_use_operation: answer('conditional', '당일입장 성인 첫 요금은 2,310엔으로 공식 가격 페이지에 안내되며 날짜·시간대별 차등은 확인이 필요합니다.', { url: 'https://solaniwa.com/price/', original: '大人料金 2,310円〜。', scope: '당일입장', checkWhat: '방문 날짜·시간대별 요금, 마지막 입장, 휴관일을 공식 가격표에서 확인합니다.' }),
      bath_experience_richness: answer('verified', '노천탕·대절 노천탕·암반욕·휴식·식음 영역을 함께 갖춘 대형 체험형 온천시설입니다.', { url: 'https://solaniwa.com/explore/', original: '9種類のお風呂、岩盤浴、休憩エリア。', scope: '시설 전체' }),
    },
    'osaka-spa-world': {
      together_private_eligibility: answer('verified', '대절 가족탕은 가족 이용 전용이며, 동성끼리 이용도 가능하다고 공식 안내합니다.', { url: 'https://www.spaworld.co.jp/wp-spa/wp-content/uploads/2025/11/1118kashikirikazokuburo-annai.pdf', original: '本貸切風呂は大阪市公衆浴場法に基づき、ご家族（同性同士の利用可）でのご利用限定です。', scope: '대절 가족탕' }),
      bath_layout_scope: answer('verified', '유럽존·아시아존 공용탕, 대암반욕, 풀과 대절 가족탕을 분리해 이용합니다.', { url: 'https://www.spaworld.co.jp/', original: 'ヨーロッパゾーン、アジアゾーン、世界の大岩盤浴、スパプー。', scope: '시설 전체' }),
      private_bath_booking_flow: answer('verified', '대절 가족탕은 2층 인포메이션에서 예약하는 예약제입니다. 당일 빈자리가 있으면 이용할 수 있습니다.', { url: 'https://www.spaworld.co.jp/wp-spa/wp-content/uploads/2025/11/1118kashikirikazokuburo-annai.pdf', original: 'ご予約・受付 予約制（受付2Fインフォメーション）。当日空きがあればご利用可能。', scope: '대절 가족탕' }),
      private_bath_terms_limits: answer('verified', '대절 가족탕은 90분이며, 평일 8,000엔, 토·일·공휴일·특정일 12,000엔입니다. 중학생 이상 성인은 최대 4명까지입니다.', { url: 'https://www.spaworld.co.jp/wp-spa/wp-content/uploads/2025/11/1118kashikirikazokuburo-annai.pdf', original: '1枠90分。平日 8,000円。土日祝・特別日 12,000円。大人（中学生以上）4名様まで。', scope: '대절 가족탕', checkWhat: '입장료 별도 여부와 원하는 회차의 잔여는 예약 전 확인합니다.' }),
      day_use_operation: answer('conditional', '공용 온천은 10:00부터 다음 날 08:45까지 운영하며, 매일 08:45~10:00에는 점검으로 입욕할 수 없습니다. 대절 가족탕은 11:00~23:00, 최종 접수 21:00입니다.', { url: 'https://www.spaworld.co.jp/info/eigyo/', original: '温泉 AM10:00～翌AM8:45。AM8:45～AM10:00の間は館内点検のため、入浴できません。貸切家族風呂 11:00～23:00（最終受付21:00）。', scope: '공용 온천·대절 가족탕', checkWhat: '방문일의 입장료·욕장 교대일·임시 운영 변경을 공식 공지에서 확인합니다.' }),
      bath_experience_richness: answer('verified', '유럽존·아시아존 공용탕, 대암반욕, 풀, 휴식·식음 영역을 결합한 도시형 대형 시설입니다.', { url: 'https://www.spaworld.co.jp/', original: 'ヨーロッパゾーン、アジアゾーン、世界の大岩盤浴、スパプー。', scope: '시설 전체', checkWhat: '성별별 욕장 교대일과 폐쇄 구역은 방문 날짜 기준으로 확인합니다.' }),
    },
    'arima-taikounoyu': {
      together_private_eligibility: needsCheck('프라이빗·가족탕 제공 여부와 대상 범위는 공식 최신 안내에서 확인합니다.', { answerKo: '공식 원장에는 프라이빗탕 이용 조건이 잠기지 않아 추정하지 않습니다.' }),
      private_bath_booking_flow: needsCheck('프라이빗·가족탕 제공 여부와 예약 방식을 공식 최신 안내에서 확인합니다.'),
      private_bath_terms_limits: needsCheck('프라이빗·가족탕의 시간·요금·정원·대상을 공식 최신 안내에서 확인합니다.'),
      bath_layout_scope: answer('verified', '공용탕·노천탕·증기탕·암반욕·휴식 공간을 분리해 운영합니다.', { url: 'https://www.taikounoyu.com/onsen/', original: '金泉・銀泉、露天風呂、蒸し風呂。', scope: '시설 전체' }),
      day_use_operation: answer('conditional', '영업은 10:00~22:00, 최종 입관은 21:00이며 성인 요금은 요일·특정일에 따라 다릅니다.', { url: 'https://www.taikounoyu.com/howto/', original: '営業時間 10:00〜22:00（最終入館21:00）。', scope: '당일입장', checkWhat: '방문일의 요금·휴관일·암반욕 추가요금·문신 정책을 공식 페이지에서 확인합니다.' }),
      bath_experience_richness: answer('verified', '금천·은천·노천탕·증기탕·사우나·암반욕을 함께 이용하는 아리마 대형 시설입니다.', { url: 'https://www.taikounoyu.com/onsen/', original: '金泉・銀泉、露天風呂、蒸し風呂、サウナ。', scope: '시설 전체' }),
    },
    'dogo-honkan': {
      together_private_eligibility: notApplicable('공식 상품의 대절실은 입욕 시설이 없는 휴게실입니다. 동행인과 함께 들어가는 프라이빗탕 상품은 제공하지 않습니다.', { url: 'https://dogo.jp/onsen/honkan', original: '霊の湯三階貸切室。※貸切室にお風呂はありません。', scope: '본관 대절실' }),
      bath_layout_scope: answer('verified', '신노유와 레이노유의 공용 입욕, 2·3층 휴식 상품, 욕실이 없는 대절실을 구분해 이용합니다.', { url: 'https://dogo.jp/onsen/honkan', original: '神の湯/霊の湯入浴。霊の湯三階貸切室。※貸切室にお風呂はありません。', scope: '본관' }),
      private_bath_booking_flow: notApplicable('입욕 가능한 프라이빗탕이 없어 프라이빗탕 예약 절차는 적용되지 않습니다.', { url: 'https://dogo.jp/onsen/honkan', original: '※貸切室にお風呂はありません。', scope: '본관 대절실' }),
      private_bath_terms_limits: notApplicable('입욕 가능한 프라이빗탕이 없어 프라이빗탕 요금·시간 조건은 적용되지 않습니다.', { url: 'https://dogo.jp/onsen/honkan', original: '※貸切室にお風呂はありません。', scope: '본관 대절실' }),
      day_use_operation: answer('verified', '신노유 1층은 06:00~23:00, 최종 입장 22:30, 이용 제한 60분, 성인 700엔입니다.', { url: 'https://dogo.jp/onsen/honkan', original: '神の湯階下 営業時間 6：00～23：00。札止 22：30。利用時間 60分。大人 700円。', scope: '신노유 1층', checkWhat: '공사·혼잡에 따른 입장 제한과 휴게실 상품의 예약 잔여를 방문 전 확인합니다.' }),
      bath_experience_richness: answer('verified', '역사형 공중탕에서 신노유와 레이노유, 휴식 상품을 구분해 이용합니다.', { url: 'https://dogo.jp/onsen/honkan', original: '神の湯、霊の湯。', scope: '본관' }),
    },
    'beppu-hyotan': {
      together_private_eligibility: answer('verified', '내탕 8실·노천탕 6실, 총 14실의 가족탕은 동행인과 시간제로 이용하는 프라이빗탕입니다.', { url: 'https://www.hyotan-onsen.com/sp/onsen/family.html', original: '露天風呂6室、内湯8室、全１４戸の個性的な貸し切り家族風呂。', scope: '가족탕' }),
      bath_layout_scope: answer('verified', '대욕장·노천탕·폭포탕·증기탕·모래탕·족탕·음천·흡입·가족탕을 구분해 운영합니다.', { url: 'https://www.hyotan-onsen.com/facilities/index.html', original: '大浴場、露天風呂、瀧湯、蒸し湯、砂湯、足湯、飲泉、温泉吸入、家族湯。', scope: '시설 전체' }),
      private_bath_booking_flow: answer('verified', '모든 가족탕은 사전예약이 필요하며, 이용일 1주일 전부터 전화로 예약할 수 있습니다.', { url: 'https://www.hyotan-onsen.com/sp/onsen/family.html', original: '全ての家族風呂で事前予約が必要になります。家族風呂はご利用日の１週間前からお電話でご予約できます。', scope: '가족탕' }),
      private_bath_terms_limits: answer('verified', '가족탕 기본 요금은 객실당 60분 2,400엔, 75분 3,000엔, 90분 3,600엔입니다.', { url: 'https://www.hyotan-onsen.com/sp/onsen/family.html', original: '基本料金は１部屋あたり60分コース 2,400円（税込）、75分コース 3,000円（税込）、90分コース 3,600円（税込）です。', scope: '가족탕', checkWhat: '객실별 정원·접수 가능 시간·연장 가능 여부를 전화로 확인합니다.' }),
      day_use_operation: answer('conditional', '시설은 09:00~01:00이며, 대욕장은 24:00까지, 모래탕은 22:30 접수 마감·23:00 이용 종료입니다. 4·7·12월에는 임시휴업할 수 있습니다.', { url: 'https://www.hyotan-onsen.com/sp/onsen/family.html', original: '入浴時間 AM9:00〜AM1:00（大浴場はPM0:00まで、砂湯はPM10:30受付終了／ご利用はPM11:00まで）。', scope: '당일입장', checkWhat: '가족탕·대욕장별 실제 접수와 임시휴업은 방문 전 확인합니다.' }),
      bath_experience_richness: answer('verified', '가족탕·노천탕·폭포탕·증기탕·모래탕까지 한 시설에서 비교할 수 있는 벳푸 대표 당일온천입니다.', { url: 'https://www.hyotan-onsen.com/facilities/index.html', original: '砂湯、蒸し湯、家族湯。', scope: '시설 전체' }),
    },
    'beppu-sakurayu': {
      together_private_eligibility: answer('verified', '20종의 시간제 가족탕은 숙박 객실탕이 아닌 독립 프라이빗탕으로 동행인과 이용합니다.', { url: 'https://www.sakurayu.net/%E5%AE%B6%E6%97%8F%E9%A2%A8%E5%91%82/', original: '20種類の時間制貸切家族風呂。', scope: '가족탕' }),
      bath_layout_scope: answer('verified', '시간제 가족탕과 남녀 대욕장(내탕·노천탕)을 분리해 운영합니다.', { url: 'https://www.sakurayu.net/%E5%A4%A7%E6%B5%B4%E5%A0%B4/', original: '大浴場は内湯と露天風呂。', scope: '가족탕·대욕장' }),
      private_bath_booking_flow: answer('conditional', '전화 예약이 가능하고 당일 혼잡이 있을 수 있어 전날 예약을 권합니다.', { url: 'https://www.sakurayu.net/%E3%82%88%E3%81%8F%E3%81%82%E3%82%8B%E8%B3%AA%E5%95%8F/', original: '電話予約が可能です。当日は混雑する可能性があるため前日予約をおすすめします。', scope: '가족탕', checkWhat: '희망 탕 지정 가능 여부와 당일 대기 시간을 전화로 확인합니다.' }),
      private_bath_terms_limits: answer('conditional', '가족탕은 보통 60분이며 평일에는 90분 이용 안내가 병기됩니다. 가격은 방별 2,000~3,000엔 표면이라 예약 전 확인이 필요합니다.', { url: 'https://www.sakurayu.net/%E5%AE%B6%E6%97%8F%E9%A2%A8%E5%91%82/', original: '家族風呂は通常60分、平日は90分利用可能。2,000円〜3,000円。', scope: '가족탕', checkWhat: '방별 최신 요금·시간·정원·변경 공지를 확인합니다.' }),
      day_use_operation: answer('conditional', '평일 11:00~24:00, 토·일·공휴일 10:00~25:00이며 가족탕 접수는 각각 23:00·24:00까지입니다.', { url: 'https://www.sakurayu.net/', original: '平日11:00〜24:00、土日祝10:00〜25:00。家族風呂受付は23:00・24:00まで。', scope: '당일입장', checkWhat: '방별 접수 마감·임시휴업·가격 변경 공지를 확인합니다.' }),
      bath_experience_richness: answer('verified', '20종 가족탕과 공용 내탕·노천탕, 카페·휴식공간을 갖춘 프라이빗탕 전문 시설입니다.', { url: 'https://www.sakurayu.net/%E5%AE%B6%E6%97%8F%E9%A2%A8%E5%91%82/', original: '20種類の時間制貸切家族風呂。', scope: '시설 전체' }),
    },
    'beppu-takegawara': {
      bath_layout_scope: answer('verified', '남녀 일반욕과 모래탕을 분리해 운영하는 역사형 공중목욕시설입니다.', { url: 'https://www.takegawara-onsen.com/howto.html', original: '普通浴と砂湯。', scope: '일반욕·모래탕' }),
      together_private_eligibility: needsCheck('프라이빗·가족탕 제공 여부를 공식 최신 안내에서 확인합니다.', { answerKo: '공식 안내상 남녀 일반욕과 모래탕은 확인되지만 프라이빗탕은 추정하지 않습니다.' }),
      private_bath_booking_flow: needsCheck('프라이빗·가족탕 제공 여부와 예약 방식을 공식 최신 안내에서 확인합니다.'),
      private_bath_terms_limits: needsCheck('프라이빗·가족탕의 시간·요금·정원을 공식 최신 안내에서 확인합니다.'),
      day_use_operation: answer('conditional', '일반욕은 06:30~22:30, 모래탕은 08:00~22:30·최종 접수 21:30이며 혼잡 시 조기 마감할 수 있습니다.', { url: 'https://www.takegawara-onsen.com/fee.html', original: '普通浴 6:30〜22:30／砂湯 8:00〜22:30（最終受付21:30）。混雑時は早く終了する場合があります。', scope: '일반욕·모래탕', checkWhat: '제3수요일 휴무·당일 혼잡·준비물을 방문 전 확인합니다.' }),
      bath_experience_richness: answer('verified', '목조 일반욕과 모래찜질을 같은 역사 시설에서 분리 이용합니다.', { url: 'https://www.takegawara-onsen.com/howto.html', original: '普通浴と砂湯。', scope: '일반욕·모래탕' }),
    },
    'ibusuki-saraku': {
      bath_layout_scope: answer('verified', '모래찜질·공용 온천·건식 사우나를 분리해 이용하는 당일 체험형 시설입니다.', { url: 'https://www.ibusuki-saraku.jp/ja/sunamushi', original: '砂むし温泉、温泉、ドライサウナ。', scope: '시설 전체' }),
      together_private_eligibility: needsCheck('프라이빗·가족탕 제공 여부를 공식 최신 안내에서 확인합니다.', { answerKo: '모래찜질·공용탕·사우나는 확인되지만 프라이빗탕은 추정하지 않습니다.' }),
      private_bath_booking_flow: needsCheck('프라이빗·가족탕 제공 여부와 예약 방식을 공식 최신 안내에서 확인합니다.'),
      private_bath_terms_limits: needsCheck('프라이빗·가족탕의 시간·요금·정원을 공식 최신 안내에서 확인합니다.'),
      day_use_operation: answer('conditional', '08:30~21:00, 최종 접수 20:00이며 평일 모래찜질 접수는 12:00~13:00에 쉽니다.', { url: 'https://www.ibusuki-saraku.jp/ja/sunamushi', original: '8:30〜21:00（最終受付20:00）。平日砂むし受付は12:00〜13:00休止。', scope: '당일입장', checkWhat: '7·12월 정비 휴관과 악천후·고장 휴장, 준비물·요금을 방문 전 확인합니다.' }),
      bath_experience_richness: answer('verified', '천연 모래찜질과 공용탕·건식 사우나·유카타·타월 대여를 묶어 이용하는 체험형 시설입니다.', { url: 'https://www.ibusuki-saraku.jp/ja/sunamushi', original: '砂むし温泉、温泉、ドライサウナ。', scope: '시설 전체' }),
    },
    'noboribetsu-daiichi-dayuse': {
      together_private_eligibility: notApplicable('가족탕·대절탕은 제공하지 않습니다. 수영복 착용 풀과 풀 인접 노천 자쿠지는 남녀 함께 이용할 수 있지만 프라이빗탕은 아닙니다.', { url: 'https://takimotokan.co.jp/ja/faq/', original: '家族風呂、貸切風呂はございません。水着着用にてご利用いただけるプール・プール施設内のジャグジー・プールに隣接する露天ジャグジーは男女を問わずご一緒にお楽しみいただけます。', scope: '시설 전체' }),
      private_bath_booking_flow: notApplicable('가족탕·대절탕을 제공하지 않아 프라이빗탕 예약 절차는 적용되지 않습니다.', { url: 'https://takimotokan.co.jp/ja/faq/', original: '家族風呂、貸切風呂はございません。', scope: '시설 전체' }),
      private_bath_terms_limits: notApplicable('가족탕·대절탕을 제공하지 않아 프라이빗탕 요금·시간 조건은 적용되지 않습니다.', { url: 'https://takimotokan.co.jp/ja/faq/', original: '家族風呂、貸切風呂はございません。', scope: '시설 전체' }),
      day_use_operation: answer('conditional', '당일입욕은 09:00~21:00, 최종 접수 18:00입니다. 성인 2,250엔, 어린이 1,100엔이며, 정비 휴관을 제외하고 운영합니다.', { url: 'https://takimotokan.co.jp/ja/faq/', original: '料金 大人2,250円 小人1,100円。営業時間 9:00～21:00（最終受付18:00）。基本的に無休で営業しております。点検工事などで休館もしくはお日帰り入浴のご利用休止などがある場合は、事前にホームページなどで告知いたします。', scope: '당일입욕', checkWhat: '정비 휴관일·당일 욕조 청소·주차 혼잡은 방문 전 공식 공지를 확인합니다.' }),
      bath_experience_richness: answer('verified', '남녀 합계 35개 욕조와 다섯 수질을 갖춘 노보리베츠 대형 온천시설입니다.', { url: 'https://takimotokan.co.jp/ja/spa/', original: '登別温泉最多、5つの泉質。男女で合計35の浴槽。', scope: '공용탕' }),
      water_operation_method: answer('verified', '공용탕 건물 범위에서 직수가 공식 원문으로 확인됩니다. 가수·가온·소독 조건은 알 수 없어 순수직수로는 표시하지 않습니다.', { url: 'https://takimotokan.co.jp/ja/spa/', original: '登別温泉最多、5つの泉質を贅沢に源泉かけ流しで。', scope: '공용탕 건물', checkWhat: '욕조별 가수·가온·소독 조건을 공식 수질표에서 확인합니다.' }),
    },
    'kusatsu-ohtakinoyu': {
      together_private_eligibility: answer('verified', '대절온천 샤쿠나게는 동행인과 따로 쓰는 예약제 프라이빗탕입니다.', { url: 'https://onsen-kusatsu.com/ohtakinoyu/guide/', original: '貸切温泉「しゃくなげ」2,000円／1時間 ※予約制、入場料別。', scope: '대절온천 샤쿠나게' }),
      bath_layout_scope: answer('verified', '공용 대욕장·노천탕·합탕·냉탕·사우나와 별도 대절온천을 구분해 이용합니다.', { url: 'https://onsen-kusatsu.com/ohtakinoyu/faq/', original: '大浴場、露天風呂、合わせ湯、水風呂、サウナがございます。貸し切り風呂はございます。', scope: '시설 전체' }),
      private_bath_booking_flow: answer('verified', '대절온천은 프런트에서 접수하는 예약제입니다.', { url: 'https://onsen-kusatsu.com/ohtakinoyu/guide/', original: '貸切風呂…9:00～19:00（最終受付18:00）※受付はフロントまで。予約制。', scope: '대절온천 샤쿠나게' }),
      private_bath_terms_limits: answer('verified', '대절온천은 1시간 2,000엔이며 입장료는 별도입니다.', { url: 'https://onsen-kusatsu.com/ohtakinoyu/guide/', original: '貸切温泉「しゃくなげ」2,000円／1時間 ※予約制、入場料別。', scope: '대절온천 샤쿠나게' }),
      day_use_operation: answer('verified', '당일입욕은 09:00~21:00, 최종 입장은 20:00입니다. 성인 입장료는 1,200엔입니다.', { url: 'https://onsen-kusatsu.com/ohtakinoyu/guide/', original: '営業時間9:00～21:00（最終入館20:00）。入場料 大人1,200円。', scope: '당일입욕', checkWhat: '휴관·혼잡·시설별 운영 변동은 방문 전 공식 공지를 확인합니다.' }),
      bath_experience_richness: answer('verified', '온도 차를 따라 들어가는 합탕, 노천탕·냉탕·사우나와 대절온천이 함께 있어 구사쓰 탕 경험의 폭이 넓습니다.', { url: 'https://onsen-kusatsu.com/ohtakinoyu/faq/', original: '大浴場、露天風呂、合わせ湯、水風呂、サウナがございます。', scope: '공용탕' }),
      water_operation_method: answer('conditional', '합탕은 공식이 직수·무가수·자연 냉각 방식으로 안내합니다. 다만 이 설명은 합탕 범위이며 순환·소독 조건이 완결되지 않아 순수직수나 시설 전체 방식 배지는 표시하지 않습니다.', { url: 'https://onsen-kusatsu.com/ohtakinoyu/faq/', original: '温泉はかけ流しですか。源泉かけ流しです。源泉が順に浴槽を巡り、水で薄めることなく、自然冷却によって浴槽温度が異なる仕組み。', scope: '합탕', checkWhat: '다른 공용탕·대절탕의 수질 운용 조건을 욕장별로 확인합니다.' }),
    },
    'yokohama-manyoclub': {
      together_private_eligibility: answer('verified', '4인 정원의 가족탕은 동행인과 프라이빗하게 이용할 수 있습니다.', { url: 'https://www.manyo.co.jp/mm21/price/', original: '家族風呂 室料1時間3,800円。4名定員。', scope: '가족탕' }),
      bath_layout_scope: answer('verified', '공용 대욕장·노천탕·족탕·사우나·암반욕과 가족탕을 구분해 이용합니다.', { url: 'https://www.manyo.co.jp/mm21/onsen/', original: '露天風呂、高濃度ナノ炭酸泉、大浴場。露天・内湯、サウナ。家族風呂。', scope: '시설 전체' }),
      private_bath_booking_flow: answer('verified', '가족탕은 평일 사전 예약, 토·일·공휴일은 전날 09:00부터 사전 예약을 받으며 당일에는 안내 카운터에서 예약합니다.', { url: 'https://www.manyo.co.jp/mm21/price/', original: '平日（月～金）は事前予約。土日・祝は前日の朝9:00より事前予約。ご来館当日ご案内カウンターでのご予約。', scope: '가족탕' }),
      private_bath_terms_limits: answer('verified', '가족탕은 4인 정원, 1시간 3,800엔이며 입장료와 입욕세는 별도입니다.', { url: 'https://www.manyo.co.jp/mm21/price/', original: '家族風呂 室料1時間3,800円。4名定員。※入館料別途。※入湯税100円を別途。', scope: '가족탕' }),
      day_use_operation: answer('conditional', '시설은 연중무휴 24시간 운영합니다. 성인 세트 입장료는 3,500엔이고 심야 03:00~09:00에는 추가 요금이 있으며 대욕장은 03:00~05:00 청소 시간에는 이용할 수 없습니다.', { url: 'https://www.manyo.co.jp/mm21/price/', original: '年中無休／24時間営業。マル得セット入館料 大人3,500円。深夜3:00～翌9:00の深夜料金2,400円。大浴場深夜3:00～5:00は清掃の為利用不可。', scope: '당일입욕·체류', checkWhat: '방문일의 요금·임시휴관·청소 시간 변경을 공식 페이지에서 확인합니다.' }),
      bath_experience_richness: answer('verified', '요코하마항을 보는 노천 공간, 세 종류의 사우나, 공용탕과 가족탕을 묶어 오래 머무는 도시형 온천시설입니다.', { url: 'https://www.manyo.co.jp/mm21/onsen/', original: '横浜港を望む露天スペース。男女ともに3種類のサウナを完備。', scope: '공용탕·사우나' }),
      water_operation_method: answer('conditional', '공식은 아타미·유가와라 원천을 매일 탱크로리로 운반한다고 안내합니다. 운반 사실만으로 직수·순환식이나 조건 배지를 정할 수 없어 방식 배지는 표시하지 않습니다.', { url: 'https://www.manyo.co.jp/mm21/onsen/', original: '「熱海温泉」と「湯河原温泉」の源泉から毎日タンクローリーで運ばれて来たものです。', scope: '공용탕·노천탕 운반 온천', checkWhat: '욕장별 순환·가수·가온·소독 조건을 공식 원문으로 확인합니다.' }),
    },
    'tokyo-toyosu-manyoclub': {
      together_private_eligibility: answer('verified', '가족탕은 동행인과 따로 쓰는 프라이빗 온천입니다.', { url: 'https://tokyo-toyosu.manyo.co.jp/onsen/', original: '貸し切りの「家族風呂」も天然温泉。小さなお子様連れでも、他のお客様に気兼ねすることなく、温泉を満喫することができます。', scope: '가족탕' }),
      bath_layout_scope: answer('verified', '도쿄만 조망 노천탕·공용 대욕장·사우나·암반욕과 가족탕·족탕을 구분해 이용합니다.', { url: 'https://tokyo-toyosu.manyo.co.jp/onsen/', original: '東京湾を望む露天風呂。サウナ、大浴場。家族風呂。展望足湯庭園。', scope: '시설 전체' }),
      private_bath_booking_flow: answer('verified', '가족탕은 사전 예약을 받지 않아 현장에서 이용 가능 여부를 확인하는 방식입니다.', { url: 'https://tokyo-toyosu.manyo.co.jp/price/', original: '家族風呂。※事前のご予約は承っておりません。', scope: '가족탕' }),
      private_bath_terms_limits: answer('verified', '가족탕은 1시간 4,500엔입니다.', { url: 'https://tokyo-toyosu.manyo.co.jp/price/', original: '家族風呂 室料1時間4,500円。', scope: '가족탕' }),
      day_use_operation: answer('conditional', '시설은 연중무휴 24시간 운영합니다. 성인 세트 입장료는 3,850엔이고 심야 03:00 이후에는 3,000엔이 추가되며 대욕장은 03:00~05:00 청소 시간에는 이용할 수 없습니다.', { url: 'https://tokyo-toyosu.manyo.co.jp/price/', original: '年中無休／24時間営業。マル得セット入館料 大人3,850円。深夜料金3,000円。大浴場深夜3:00～朝5:00は清掃の為利用不可。', scope: '당일입욕·체류', checkWhat: '방문일의 요금·임시휴관·청소 시간 변경을 공식 페이지에서 확인합니다.' }),
      bath_experience_richness: answer('verified', '도쿄만 조망 노천탕과 공용 대욕장, 사우나·암반욕, 가족탕·옥상 족탕을 한 번에 고를 수 있는 대형 스파입니다.', { url: 'https://tokyo-toyosu.manyo.co.jp/onsen/', original: '東京湾を望む露天風呂。サウナ、大浴場。家族風呂。展望足湯庭園。', scope: '시설 전체' }),
      water_operation_method: answer('conditional', '공식은 하코네·유가와라 원천을 탱크로리로 운반한다고 안내합니다. 운반 사실만으로 직수·순환식이나 조건 배지를 정할 수 없어 방식 배지는 표시하지 않습니다.', { url: 'https://tokyo-toyosu.manyo.co.jp/onsen/', original: '「箱根温泉」と「湯河原温泉」の源泉からタンクローリーで運ばれて来たものです。', scope: '공용탕·노천탕 운반 온천', checkWhat: '욕장별 순환·가수·가온·소독 조건을 공식 원문으로 확인합니다.' }),
    },
    'zao-shinzaemon-no-yu': {
      together_private_eligibility: notApplicable('가족탕·대절탕은 제공하지 않습니다. 1인용 박스 사우나만 사전 웹 예약제로 운영합니다.', { url: 'https://zaospa.co.jp/toiawase', original: '家族風呂はございません。サウナはお一人様用BOXサウナがございます。（事前WEB予約制）', scope: '시설 전체' }),
      bath_layout_scope: answer('verified', '공용 내탕과 모가미다카유·시로쿠노유·가메유 세 노천탕을 구분해 이용합니다.', { url: 'https://zaospa.co.jp/', original: '露天風呂 もがみ高湯・四・六の湯・かめ湯。', scope: '공용 노천탕' }),
      private_bath_booking_flow: notApplicable('가족탕·대절탕이 없어 프라이빗탕 예약 절차는 적용되지 않습니다.', { url: 'https://zaospa.co.jp/toiawase', original: '家族風呂はございません。', scope: '시설 전체' }),
      private_bath_terms_limits: notApplicable('가족탕·대절탕이 없어 프라이빗탕 요금·시간 조건은 적용되지 않습니다.', { url: 'https://zaospa.co.jp/toiawase', original: '家族風呂はございません。', scope: '시설 전체' }),
      day_use_operation: answer('conditional', '당일입욕은 10:00~18:00, 최종 접수 17:30이며 성인 1,000엔입니다. 수요일 등 휴관일은 월별 공지로 확인해야 합니다.', { url: 'https://zaospa.co.jp/', original: '10:00～18:00（最終受付17:30）。大人1,000円。', scope: '당일입욕', checkWhat: '방문일 휴관·계절 운영 변동을 공식 공지에서 확인합니다.' }),
      bath_experience_richness: answer('verified', '세 개의 유황 노천탕과 공용 내탕, 1인용 박스 사우나를 고를 수 있는 자오 목적형 당일온천입니다.', { url: 'https://zaospa.co.jp/', original: '露天風呂 もがみ高湯・四・六の湯・かめ湯。', scope: '공용탕·노천탕' }),
      water_operation_method: answer('conditional', '공식은 노천탕을 원천 100% 강산성 유황천으로 소개하지만, 욕장별 가수·가온·순환·소독 조건이 완결되지 않아 방식 배지는 표시하지 않습니다.', { url: 'https://zaospa.co.jp/', original: '源泉100％のもがみ高湯。強酸性の硫黄泉。', scope: '모가미다카유 노천탕', checkWhat: '각 노천탕·내탕의 수질 운용 조건을 공식 원문으로 확인합니다.' }),
    },
    'osaka-nijino-yu-osaka-sayama': {
      together_private_eligibility: answer('verified', '가족·부부·연인·친구·혼자 모두 이용할 수 있는 대절 가족탕 8실을 운영합니다.', { url: 'https://spa-sauna.jp/', original: '家族風呂 全8部屋。ご家族、ご夫婦、カップル、お友達同士、おひとりでご利用いただけます。', scope: '가족탕' }),
      bath_layout_scope: answer('verified', '폭포 조망 가족탕과 전망 노천탕·다양한 내탕, 라돈 사우나·암반욕 스팀 사우나를 구분해 이용합니다.', { url: 'https://spa-sauna.jp/introduction', original: '滝を見ながら入る展望露天風呂と、多彩な内湯。ラドン陶盤サウナ、岩盤浴ミストサウナ。', scope: '공용탕·가족탕' }),
      private_bath_booking_flow: answer('verified', '가족탕은 웹 전용 완전예약제이며 이용일 2주 전부터 당일까지 예약할 수 있습니다. 전화 예약은 받지 않습니다.', { url: 'https://spa-sauna.jp/familyBath/asagiri', original: 'ご予約はWebのみ。電話でのご予約は承っておりません。Web予約はご利用日の2週間前からご利用当日まで可能です。', scope: '가족탕' }),
      private_bath_terms_limits: answer('verified', '가족탕은 60분 4,200엔 또는 90분 6,300엔이며 기본 요금은 성인 3명까지입니다. 미성년자만의 이용은 할 수 없습니다.', { url: 'https://spa-sauna.jp/familyBath/asagiri', original: '60分4,200円、90分6,300円。大人3名様まで。18歳未満のお客様だけのご利用は固くお断り致します。', scope: '가족탕' }),
      day_use_operation: answer('conditional', '연중무휴(정비일 제외) 10:00~24:00이며 대욕장 최종 접수는 23:15입니다. 성인 요금은 평일 920엔, 토·일·공휴일 970엔입니다.', { url: 'https://spa-sauna.jp/', original: '年中無休 ※メンテナンス日を除く 10:00～24:00（最終受付 大浴場23:15）。', scope: '당일입욕', checkWhat: '정비일·연휴 요금·당일 운영 변동을 공식 페이지에서 확인합니다.' }),
      bath_experience_richness: answer('verified', '폭포를 보는 노천탕, 다양한 내탕, 라돈 사우나·암반욕 스팀 사우나와 가족탕을 묶어 즐기는 교외형 시설입니다.', { url: 'https://spa-sauna.jp/introduction', original: '滝を見ながら入る展望露天風呂。ラドン陶盤サウナ、岩盤浴ミストサウナ、備長炭水風呂。', scope: '공용탕·사우나' }),
      water_operation_method: answer('conditional', '공식은 천연온천과 욕장 구성을 안내하지만, 직수·순환·가수·가온·소독 조건을 욕장 범위와 함께 명시하지 않아 방식 배지는 표시하지 않습니다.', { url: 'https://spa-sauna.jp/introduction', original: 'モダンでお洒落な空間で天然温泉を案内。', scope: '시설 대표 수질 프로필', checkWhat: '욕장별 수질 운용 조건과 적용 범위를 공식 원문으로 확인합니다.' }),
    },
    'kobe-harborland-manyo-club': {
      together_private_eligibility: answer('verified', '12층 가족탕 2실은 동행인과 따로 쓰는 프라이빗 온천입니다.', { url: 'https://www.manyo.co.jp/kobe/yudokoro/', original: '貸切家族風呂 12階。家族風呂を2室御用意。', scope: '12층 가족탕' }),
      bath_layout_scope: answer('verified', '공용 대욕장·전망 족탕·사우나와 12층 가족탕, 암반욕을 구분해 이용합니다.', { url: 'https://www.manyo.co.jp/kobe/yudokoro/', original: '大浴場、展望足湯庭園、高温サウナ、ナノミストサウナ、塩サウナ、貸切家族風呂。', scope: '시설 전체' }),
      private_bath_booking_flow: answer('verified', '가족탕은 사전예약이 필요하며 공식 전화 창구에서 확인합니다.', { url: 'https://www.manyo.co.jp/kobe/eng/fee-schedule/', original: 'Reserve Private Onsen Bath JPY 2,860/hour. Advance reservations required.', scope: '가족탕' }),
      private_bath_terms_limits: answer('verified', '가족탕은 1시간 2,860엔, 24시간 운영이며 입장료는 별도입니다.', { url: 'https://www.manyo.co.jp/kobe/price/', original: '家族風呂 1時間室料2,860円。営業時間24時間。入館料は別途頂戴いたします。', scope: '가족탕' }),
      day_use_operation: answer('conditional', '시설은 24시간 연중무휴입니다. 기본 요금은 2,950엔이며 심야 03:00 이후 2,200엔이 추가되고, 최대 다음 날 11:00까지 머물 수 있습니다.', { url: 'https://www.manyo.co.jp/kobe/question/', original: '24時間営業。基本料金2,950円。深夜3時を超えると2,200円発生。ご滞在は午前11時まで可能。', scope: '당일입욕·체류', checkWhat: '방문일의 임시휴관·심야 요금·대욕장 청소 시간을 공식 페이지에서 확인합니다.' }),
      bath_experience_richness: answer('verified', '공용 대욕장과 전망 족탕, 고온·나노미스트·여성용 소금 사우나, 암반욕과 가족탕을 함께 고를 수 있습니다.', { url: 'https://www.manyo.co.jp/kobe/yudokoro/', original: '展望足湯庭園。高温サウナ、ナノミストサウナ、塩サウナ。貸切家族風呂。', scope: '공용탕·사우나·가족탕' }),
      water_operation_method: answer('conditional', '공식은 알칼리성 단순천이라는 수질을 안내하지만, 욕장별 직수·순환·가수·가온·소독 조건을 확인하지 못해 방식 배지는 표시하지 않습니다.', { url: 'https://www.manyo.co.jp/kobe/yudokoro/', original: '「さとわき湧玉の湯」。アルカリ性単純温泉。', scope: '시설 대표 수질 프로필', checkWhat: '욕장별 수질 운용 조건과 적용 범위를 공식 원문으로 확인합니다.' }),
    },
    'noboribetsu-grand-dayuse': {
      together_private_eligibility: answer('verified', '가족탕은 가족·동행인이 따로 쓸 수 있는 예약제 프라이빗탕입니다.', { url: 'https://www.nobogura.co.jp/hotspring/', original: '温泉家族風呂。家族・カップル水入らずで楽しみたいという方のための、貸し切りの温泉です。', scope: '가족탕' }),
      bath_layout_scope: answer('verified', '돔형 로마풍 대욕장·정원 노천탕·오니 사우나와 별도 가족탕을 구분해 이용합니다.', { url: 'https://www.nobogura.co.jp/hotspring/', original: '本格ドーム型ローマ風大浴場。庭園露天風呂。鬼サウナ。温泉家族風呂。', scope: '공용탕·가족탕' }),
      private_bath_booking_flow: answer('verified', '가족탕은 예약제로 운영합니다.', { url: 'https://www.nobogura.co.jp/hotspring/', original: '温泉家族風呂。要予約。', scope: '가족탕' }),
      private_bath_terms_limits: answer('verified', '가족탕은 4인까지 50분 4,400엔이며, 당일 이용이면 당일입욕료가 별도입니다.', { url: 'https://www.nobogura.co.jp/hotspring/', original: '4名様まで利用可能。料金50分／4,400円（税込）。日帰りの場合は、日帰り入浴代金が別途かかります。', scope: '가족탕' }),
      day_use_operation: answer('conditional', '낮 당일입욕은 12:30~20:00(최종 19:00), 아침은 07:00~10:00(최종 09:00)이며 월·목은 14:30부터 접수합니다. 성인은 2,000엔입니다.', { url: 'https://www.nobogura.co.jp/hotspring/', original: '昼12時30分～20時00分（最終19時00分）。月・木曜日は14時30分から受付。朝7時00分～10時00分（最終9時00分）。大人2,000円。', scope: '당일입욕', checkWhat: '연말연시·주차 만차·당일 접수 중지와 시간 단축 공지를 공식 페이지에서 확인합니다.' }),
      bath_experience_richness: answer('verified', '돔형 로마풍 대욕장과 정원 노천탕, 남녀 교대 오니 사우나가 핵심이며 가족탕은 별도 예약으로 고릅니다.', { url: 'https://www.nobogura.co.jp/hotspring/', original: '本格ドーム型ローマ風大浴場。庭園露天風呂。鬼サウナは日替わりで男女の入れ替え。', scope: '공용탕·사우나' }),
      water_operation_method: answer('conditional', '공용 당일입욕은 유황천·식염천·철천 세 수질을 안내하지만 욕조별 방식은 공개하지 않습니다. 가족탕의 직수 표기는 공용탕에 확장하지 않아 시설 전체 방식 배지는 표시하지 않습니다.', { url: 'https://www.nobogura.co.jp/hotspring/rome/', original: '硫黄泉・食塩泉・鉄泉の3つの泉質。', scope: '공용 당일입욕 대욕장', checkWhat: '공용탕과 가족탕의 수질 운용 조건을 각각 확인합니다.' }),
    },
  };
  return { ...q, ...(overrides[slug] ?? {}) };
}

function readAccommodationWaterPatches() {
  const data = readJson('research/onsen-db-seed/active_onsen_water_normalization_backfill_2026-07-09.json');
  return new Map(safeArray(data.patches).map((patch) => [patch.slug, patch]));
}

function readSummarySources() {
  const data = readJson('research/onsen-db-seed/onsen_card_summary_editorial_qa_queue_2026-07-11.json');
  return new Map(safeArray(data.rows).map((row) => [row.slug, row]));
}

function normalizeWaterJudgment(value) {
  if (!isRecord(value)) return value ?? null;
  const normalized = structuredClone(value);
  if (Array.isArray(normalized.condition_labels_ko)) {
    normalized.condition_labels_ko = normalized.condition_labels_ko.filter((label) => label !== '조건 없음');
  }
  return normalized;
}

function buildResearch() {
  const inventory = readJson(`research/onsen-db-seed/decision-goal-${date}/active_inventory_audit_${date}.json`);
  const activeRows = new Map(safeArray(inventory.rows).map((row) => [`${row.target_type}:${row.slug}`, row]));
  const facilityLedger = buildFacilityLedger();
  const waterPatches = readAccommodationWaterPatches();
  const summarySources = readSummarySources();

  const accommodations = finalAccommodationCatalog.map((candidate) => {
    const active = activeRows.get(`accommodation:${candidate.slug}`);
    if (!active) throw new Error(`active 숙소 재고에서 ${candidate.slug}을 찾지 못했습니다.`);
    const counts = statusCount(candidate.questions);
    const patch = waterPatches.get(candidate.slug);
    const summary = summarySources.get(candidate.slug);
    return {
      target_type: 'accommodation',
      slug: candidate.slug,
      name_ko: candidate.name_ko ?? active.name_ko,
      name_ja: candidate.name_ja ?? active.name_ja,
      name_en: candidate.name_en,
      region_group: active.region_group,
      prefecture: active.prefecture,
      onsen_area: active.onsen_area,
      existing_status: active.status,
      journey: candidate.journey,
      korean_demand: candidate.korean_demand,
      score: { ...candidate.scores, total: scoreTotal(candidate.scores) },
      selection: 'final',
      selection_reason: candidate.selection_reason,
      official_urls: candidate.official_urls,
      decision_questions: candidate.questions,
      direct_review_evidence: {
        directly_read_reviews: active.direct_reviews,
        onsen_related_direct_reviews: active.onsen_related_direct_reviews,
        visible_review_pools_used: false,
        source_file: summary?.source_file ?? null,
        reproducibility_note: '기존 숙소 원장의 직접 판독 분모를 재사용했습니다. visible review count와 합산하지 않았습니다.',
      },
      water: {
        method: normalizeWaterJudgment(patch?.evidence_counts?.waterJudgment),
        sensory: patch?.evidence_counts?.waterSensoryJudgment ?? null,
        model_policy: '후기 감촉·색·주의 신호는 온천수 방식 확정 근거로 사용하지 않습니다.',
      },
      official_filter_fact_rows: candidate.facts.map((row) => ({ accommodation_slug: candidate.slug, ...row })),
      qa: counts,
    };
  });

  const facilities = finalFacilityCatalog.map((candidate) => {
    const active = activeRows.get(`facility:${candidate.slug}`);
    if (!active) throw new Error(`active 시설 재고에서 ${candidate.slug}을 찾지 못했습니다.`);
    const data = latestFacilityData(facilityLedger, candidate.slug);
    const addedFacts = decisionFacilityFactRows[candidate.slug] ?? [];
    const addedWaterFacts = decisionFacilityWaterRows[candidate.slug] ?? [];
    const decisionData = { ...data, facts: [...addedFacts, ...data.facts], waterFacts: [...addedWaterFacts, ...data.waterFacts] };
    const questions = facilityQuestionSet(candidate.slug, decisionData);
    const counts = statusCount(questions);
    return {
      target_type: 'facility',
      slug: candidate.slug,
      name_ko: candidate.name_ko ?? data.facility.name_ko,
      name_ja: data.facility.name_ja,
      name_en: data.facility.name_en ?? null,
      region_group: active.region_group,
      prefecture: active.prefecture,
      onsen_area: active.onsen_area,
      existing_status: active.status,
      journey: candidate.journey,
      korean_demand: candidate.demand,
      score: { ...candidate.scores, total: scoreTotal(candidate.scores) },
      selection: 'final',
      selection_reason: candidate.reason,
      official_urls: [...new Set([...safeArray(data.facility.official_source_urls).filter(Boolean), ...addedFacts.map((row) => row.official_source_url), ...addedWaterFacts.map((row) => row.official_source_url)])],
      decision_questions: questions,
      direct_review_evidence: {
        collection_key: data.evidence?.collection_key ?? null,
        collected_on: data.evidence?.collected_on ?? null,
        raw_direct_reviews: data.evidence?.raw_direct_reviews ?? 0,
        deduped_direct_reviews: data.evidence?.deduped_direct_reviews ?? 0,
        facility_related_direct_reviews: data.evidence?.facility_related_direct_reviews ?? 0,
        dayuse_only_direct_reviews: data.evidence?.dayuse_only_direct_reviews ?? 0,
        lodging_bath_only_direct_reviews: data.evidence?.lodging_bath_only_direct_reviews ?? 0,
        direct_body_platform_count: data.evidence?.direct_body_platform_count ?? 0,
        evidence_grade: data.evidence?.evidence_grade ?? null,
        collection_readiness: data.evidence?.collection_readiness ?? null,
        visible_review_pools_used: false,
        source_file: data.evidence?.source_file ?? null,
        reproducibility_note: '시설 원장의 직접 판독 분모를 그대로 재사용했습니다. visible review pool은 별도 필드에만 남습니다.',
      },
      water: {
        facts: decisionData.waterFacts,
        model_policy: '후기 감촉·색·주의 신호는 온천수 방식 확정 근거로 사용하지 않습니다.',
      },
      reused_official_filter_facts: data.facts,
      official_filter_fact_rows: addedFacts.map((row) => ({ facility_slug: candidate.slug, ...row })),
      qa: counts,
    };
  });

  const finalRecords = [...accommodations, ...facilities];
  const reserveRecords = reserveCatalog.map((candidate) => {
    const active = activeRows.get(`${candidate.target_type}:${candidate.slug}`);
    return {
      ...candidate,
      existing_status: active?.status ?? 'not_in_active_inventory',
      region_group: active?.region_group ?? null,
      prefecture: active?.prefecture ?? null,
      onsen_area: active?.onsen_area ?? null,
      score: { ...candidate.scores, total: scoreTotal(candidate.scores) },
    };
  });
  const holdRecords = holdCatalog.map((candidate) => {
    const active = activeRows.get(`${candidate.target_type}:${candidate.slug}`);
    return {
      ...candidate,
      existing_status: active?.status ?? 'not_in_active_inventory',
      region_group: active?.region_group ?? null,
      prefecture: active?.prefecture ?? null,
      onsen_area: active?.onsen_area ?? null,
      score: { ...candidate.scores, total: scoreTotal(candidate.scores) },
    };
  });
  return { finalRecords, reserveRecords, holdRecords };
}

function buildSeed(research) {
  const accommodationFacts = research.finalRecords
    .filter((record) => record.target_type === 'accommodation')
    .flatMap((record) => record.official_filter_fact_rows);
  const facilityFacts = research.finalRecords
    .filter((record) => record.target_type === 'facility')
    .flatMap((record) => record.official_filter_fact_rows);
  const duplicateKeys = accommodationFacts.map((row) => `accommodation:${row.accommodation_slug}:${row.filter_code}:${row.scope_key}`)
    .concat(facilityFacts.map((row) => `facility:${row.facility_slug}:${row.filter_code}:${row.scope_key}`))
    .filter((key, index, keys) => keys.indexOf(key) !== index);
  if (duplicateKeys.length > 0) throw new Error(`공식 fact 중복: ${[...new Set(duplicateKeys)].join(', ')}`);
  return {
    generated_at: date,
    apply_scope: '이번 목표에서 새로 잠긴 숙소·시설 공식 필터 사실만 upsert합니다. 기존 시설 리뷰 원장과 온천수 원장은 재적재하지 않습니다.',
    accommodation_official_filter_facts: accommodationFacts,
    facility_official_filter_facts: facilityFacts,
    review_evidence_upserts: [],
    water_upserts: [],
  };
}

function qaResearch(research, seed) {
  const findings = [];
  const all = research.finalRecords;
  const keys = all.map((record) => `${record.target_type}:${record.slug}`);
  const duplicateTargets = keys.filter((key, index) => keys.indexOf(key) !== index);
  if (duplicateTargets.length > 0) findings.push({ severity: 'P0', code: 'duplicate_target', detail: [...new Set(duplicateTargets)].join(', ') });
  for (const record of all) {
    if (record.qa.readiness === 'hold') {
      findings.push({ severity: 'P0', code: 'final_target_hold', target: `${record.target_type}:${record.slug}`, detail: '최종 30곳에는 hold 상태를 포함할 수 없습니다.' });
    }
    for (const code of questionOrder) {
      const question = record.decision_questions[code];
      if (!question) findings.push({ severity: 'P0', code: 'missing_question', target: `${record.target_type}:${record.slug}`, detail: code });
      if (question?.status === 'verified' && (!question.official_source_url || !question.official_source_checked_at) && code !== 'water_operation_method') {
        findings.push({ severity: 'P0', code: 'verified_without_source', target: `${record.target_type}:${record.slug}`, detail: code });
      }
      if (question?.status === 'verified' && code === 'water_operation_method' && question.answer_ko.includes('직수') && !question.official_original_text) {
        findings.push({ severity: 'P0', code: 'water_without_original_text', target: `${record.target_type}:${record.slug}`, detail: code });
      }
    }
    if (record.direct_review_evidence.visible_review_pools_used !== false) {
      findings.push({ severity: 'P0', code: 'visible_pool_used_as_direct_denominator', target: `${record.target_type}:${record.slug}`, detail: 'visible_review_pools_used must remain false' });
    }
    const waterAnswer = record.decision_questions.water_operation_method?.answer_ko ?? '';
    if (/(?:천연온천|natural_100).*?(?:직수|순수직수|순환식)/i.test(waterAnswer) && !/방식 배지(?:를|는)? 표시하지 않습니다/.test(waterAnswer)) {
      findings.push({ severity: 'P1', code: 'low_discrimination_water_term', target: `${record.target_type}:${record.slug}`, detail: 'natural_100/천연온천 must not establish a method badge' });
    }
    if (/[A-Za-z]{6,}/.test(record.name_ko ?? '')) {
      findings.push({ severity: 'P1', code: 'romaji_in_korean_name', target: `${record.target_type}:${record.slug}`, detail: record.name_ko });
    }
    if (record.target_type === 'facility' && record.direct_review_evidence.collection_readiness === 'needs_reinforcement') {
      findings.push({ severity: 'P1', code: 'review_pool_needs_reinforcement', target: `${record.target_type}:${record.slug}`, detail: `직접 판독 후기 ${record.direct_review_evidence.deduped_direct_reviews}건을 재현 가능하게 보존했지만, 후기 풀 보강이 필요합니다.` });
    }
  }
  for (const row of [...seed.accommodation_official_filter_facts, ...seed.facility_official_filter_facts]) {
    if (!row.official_original_text || !row.official_source_url || !row.official_source_checked_at) {
      const target = row.accommodation_slug ? `accommodation:${row.accommodation_slug}` : `facility:${row.facility_slug}`;
      findings.push({ severity: 'P0', code: 'seed_fact_missing_provenance', target, detail: `${row.filter_code}:${row.scope_key}` });
    }
  }
  const quality = all.map((record) => ({
    target_type: record.target_type,
    slug: record.slug,
    readiness: record.qa.readiness,
    decision_answers: record.qa.decision_answers,
    p0_needs_check: record.qa.p0_needs_check.join('|'),
  }));
  return { findings, quality, passed: findings.filter((finding) => finding.severity === 'P0').length === 0 };
}

function buildSql(seed) {
  const literal = (value) => `'${String(value).replaceAll("'", "''")}'`;
  const nullable = (value) => value === null || value === undefined ? 'NULL' : literal(value);
  const json = (value) => `${literal(JSON.stringify(value))}::jsonb`;
  const lines = [
    '-- Generated by scripts/build_onsen_decision_pilot_2026_07_13.mjs',
    '-- Run only after the paired QA report has no P0 finding.',
    'BEGIN;',
  ];
  const appendFacts = (table, targetColumn, rows) => {
    for (const row of rows) {
      lines.push(
        `INSERT INTO public.${table} (${targetColumn}, filter_code, scope_key, scope_label_ko, availability, filter_value, filter_status, official_original_text, official_source_url, source_kind, official_source_checked_at, valid_until, source_file)`,
        `VALUES (${literal(row[targetColumn])}, ${literal(row.filter_code)}, ${literal(row.scope_key)}, ${nullable(row.scope_label_ko)}, ${literal(row.availability)}, ${json(row.filter_value)}, ${literal(row.filter_status)}, ${literal(row.official_original_text)}, ${literal(row.official_source_url)}, ${literal(row.source_kind)}, ${literal(row.official_source_checked_at)}, ${nullable(row.valid_until)}, ${literal(row.source_file)})`,
        `ON CONFLICT (${targetColumn}, filter_code, scope_key) DO UPDATE SET`,
        '  scope_label_ko = EXCLUDED.scope_label_ko, availability = EXCLUDED.availability, filter_value = EXCLUDED.filter_value, filter_status = EXCLUDED.filter_status, official_original_text = EXCLUDED.official_original_text, official_source_url = EXCLUDED.official_source_url, source_kind = EXCLUDED.source_kind, official_source_checked_at = EXCLUDED.official_source_checked_at, valid_until = EXCLUDED.valid_until, source_file = EXCLUDED.source_file, updated_at = NOW();',
      );
    }
  };
  appendFacts('onsen_accommodation_official_filter_facts', 'accommodation_slug', seed.accommodation_official_filter_facts);
  appendFacts('onsen_facility_official_filter_facts', 'facility_slug', seed.facility_official_filter_facts);
  lines.push('COMMIT;', '');
  return lines.join('\n');
}

function writeArtifacts(research, seed, qa) {
  mkdirSync(outputDir, { recursive: true });
  const paths = {
    longlistJson: path.join(outputDir, `longlist_and_selection_${date}.json`),
    longlistCsv: path.join(outputDir, `longlist_and_selection_${date}.csv`),
    selectionMd: path.join(outputDir, `selection_report_${date}.md`),
    researchJson: path.join(outputDir, `canonical_research_${date}.json`),
    matrixJson: path.join(outputDir, `decision_completeness_matrix_${date}.json`),
    matrixCsv: path.join(outputDir, `decision_completeness_matrix_${date}.csv`),
    matrixMd: path.join(outputDir, `decision_completeness_matrix_${date}.md`),
    seedJson: path.join(outputDir, `decision_pilot_seed_${date}.json`),
    sql: path.join(outputDir, `decision_pilot_seed_${date}.upsert.sql`),
    dryRunMd: path.join(outputDir, `decision_pilot_dry_run_${date}.md`),
    qaJson: path.join(outputDir, `decision_pilot_qa_${date}.json`),
    qaMd: path.join(outputDir, `decision_pilot_qa_${date}.md`),
  };
  const longlist = [
    ...research.finalRecords.map((record) => ({
      target_type: record.target_type,
      slug: record.slug,
      name_ko: record.name_ko,
      name_ja: record.name_ja,
      journey: record.journey,
      selection: 'final',
      ...record.score,
      demand_kind: record.korean_demand.evidence_kind,
      demand_url: record.korean_demand.evidence_url,
      demand_checked_at: record.korean_demand.checked_at,
      selection_reason: record.selection_reason,
      readiness: record.qa.readiness,
    })),
    ...research.reserveRecords.map((record) => ({
      target_type: record.target_type,
      slug: record.slug,
      name_ko: record.name_ko,
      name_ja: null,
      journey: record.journey,
      selection: 'reserve',
      ...record.score,
      demand_kind: record.korean_demand.evidence_kind,
      demand_url: record.korean_demand.evidence_url,
      demand_checked_at: record.korean_demand.checked_at,
      selection_reason: record.reason,
      readiness: 'hold',
    })),
    ...research.holdRecords.map((record) => ({
      target_type: record.target_type,
      slug: record.slug,
      name_ko: record.name_ko,
      name_ja: record.name_ja ?? null,
      journey: record.journey,
      selection: 'hold',
      ...record.score,
      demand_kind: record.korean_demand.evidence_kind,
      demand_url: record.korean_demand.evidence_url,
      demand_checked_at: record.korean_demand.checked_at,
      selection_reason: record.reason,
      readiness: 'hold',
    })),
  ];
  writeFileSync(paths.longlistJson, `${JSON.stringify({ generated_at: date, longlist }, null, 2)}\n`);
  writeCsv(paths.longlistCsv, longlist, ['target_type', 'slug', 'name_ko', 'name_ja', 'journey', 'selection', 'korean_demand', 'decision_difficulty', 'bath_experience', 'evidence_collectability', 'journey_fit', 'total', 'demand_kind', 'demand_url', 'demand_checked_at', 'readiness', 'selection_reason']);
  writeFileSync(paths.researchJson, `${JSON.stringify({ generated_at: date, policy: {
    official_facts: '공식 사실과 후기 신호를 분리합니다.',
    review_denominator: 'visible review count는 직접 읽은 후기 수에 넣지 않습니다.',
    water: '방식 배지는 공식 원문·욕장 범위·조건이 있는 경우에만 사용합니다.',
  }, final_records: research.finalRecords, reserve_records: research.reserveRecords, hold_records: research.holdRecords }, null, 2)}\n`);

  const matrixRows = research.finalRecords.flatMap((record) => questionOrder.map((code) => {
    const question = record.decision_questions[code];
    return {
      target_type: record.target_type,
      slug: record.slug,
      name_ko: record.name_ko,
      journey: record.journey,
      question_code: code,
      question_ko: questionLabels[code],
      status: question.status,
      applicability: question.applicability,
      answer_ko: question.answer_ko,
      official_source_url: question.official_source_url,
      official_source_checked_at: question.official_source_checked_at,
      check_what: question.check_what,
      target_readiness: record.qa.readiness,
    };
  }));
  writeFileSync(paths.matrixJson, `${JSON.stringify({ generated_at: date, matrix: matrixRows }, null, 2)}\n`);
  writeCsv(paths.matrixCsv, matrixRows, ['target_type', 'slug', 'name_ko', 'journey', 'question_code', 'question_ko', 'status', 'applicability', 'answer_ko', 'official_source_url', 'official_source_checked_at', 'check_what', 'target_readiness']);
  writeFileSync(paths.matrixMd, `# ${research.finalRecords.length}곳 결정 완성도 매트릭스\n\n- 기준일: ${date}\n- \`verified\`와 명확한 \`conditional\`만 결정 답변으로 계산합니다. \`needs_check\`은 추정하지 않습니다.\n- 후기 분모는 별도 canonical research JSON에서 재현하며, 이 표에는 visible review count를 넣지 않았습니다.\n\n${markdownTable(matrixRows, ['target_type', 'slug', 'question_ko', 'status', 'applicability', 'answer_ko', 'check_what'])}\n`);

  const finalSummary = research.finalRecords.map((record) => ({
    target_type: record.target_type,
    slug: record.slug,
    name_ko: record.name_ko,
    journey: record.journey,
    total_score: record.score.total,
    decision_answers: `${record.qa.decision_answers}/7`,
    p0_needs_check: record.qa.p0_needs_check.join(', ') || '없음',
    readiness: record.qa.readiness,
    existing_status: record.existing_status,
  }));
  const journeySummary = [...new Set(finalSummary.map((row) => row.journey))].map((journey) => ({ journey, count: finalSummary.filter((row) => row.journey === journey).length }));
  const reserveSummary = research.reserveRecords.map((record) => ({ target_type: record.target_type, slug: record.slug, name_ko: record.name_ko, journey: record.journey, score: record.score.total, reason: record.reason, active_status: record.existing_status }));
  const holdSummary = research.holdRecords.map((record) => ({ target_type: record.target_type, slug: record.slug, name_ko: record.name_ko, journey: record.journey, score: record.score.total, reason: record.reason, active_status: record.existing_status }));
  const longlistTotal = research.finalRecords.length + research.reserveRecords.length + research.holdRecords.length;
  writeFileSync(paths.selectionMd, `# 결정 완성도 파일럿 선정 보고서\n\n- 기준일: ${date}\n- longlist: ${longlistTotal}곳\n- 최종: ${research.finalRecords.length}곳 (숙소 ${research.finalRecords.filter((row) => row.target_type === 'accommodation').length}, 시설 ${research.finalRecords.filter((row) => row.target_type === 'facility').length})\n- 예비: ${research.reserveRecords.length}곳\n- 교체 보류: ${research.holdRecords.length}곳\n- 선정 방식: 한국어 수요 탐색 근거, 결정 난도, 목욕 경험 차별성, 근거 수집 가능성, 여정 적합성을 각각 1~5로 평가했습니다. 숫자는 검색량 추정이 아니라 근거의 질·결정 난도의 내부 평가입니다.\n- 비율: 숙소/시설 비율은 할당하지 않았습니다. 독립 점수와 세 여정 적합성 결과로 ${research.finalRecords.filter((row) => row.target_type === 'accommodation').length}:${research.finalRecords.filter((row) => row.target_type === 'facility').length}가 되었습니다.\n\n## 여정 분포\n\n${markdownTable(journeySummary, ['journey', 'count'])}\n\n## 최종 ${research.finalRecords.length}곳\n\n${markdownTable(finalSummary, ['target_type', 'slug', 'name_ko', 'journey', 'total_score', 'decision_answers', 'p0_needs_check', 'readiness', 'existing_status'])}\n\n## 예비 ${research.reserveRecords.length}곳\n\n${markdownTable(reserveSummary, ['target_type', 'slug', 'name_ko', 'journey', 'score', 'active_status', 'reason'])}\n\n## 교체 보류 ${research.holdRecords.length}곳\n\n${markdownTable(holdSummary, ['target_type', 'slug', 'name_ko', 'journey', 'score', 'active_status', 'reason'])}\n\n## 수요 근거의 사용 범위\n\n- 각 후보의 한국어 수요 근거 URL과 확인일은 [longlist JSON](${path.relative(repoRoot, paths.longlistJson)})에 보존했습니다.\n- 한국어 검색·블로그·커뮤니티 표면은 후보 선정용 수요 근거입니다. 검색 스니펫·OTA 요약·AI 요약은 직접 판독 후기나 신호 분모에 넣지 않았습니다.\n`);

  writeFileSync(paths.seedJson, `${JSON.stringify(seed, null, 2)}\n`);
  writeFileSync(paths.sql, buildSql(seed));
  writeFileSync(paths.dryRunMd, `# 결정 데이터 Seed Dry-run\n\n- 기준일: ${date}\n- DB 변경 후보: 숙소 공식 필터 사실 ${seed.accommodation_official_filter_facts.length}건\n- DB 변경 후보: 시설 공식 필터 사실 ${seed.facility_official_filter_facts.length}건\n- 후기 evidence upsert: 0건 (직접 후기 분모를 재수집·합산하지 않음)\n- 온천수 upsert: 0건 (기존 정규화 원장 외의 방식 추정 금지)\n- 적용 전 조건: QA의 P0 finding이 0건이어야 합니다.\n\n## 숙소 공식 사실 upsert\n\n${markdownTable(seed.accommodation_official_filter_facts.map((row) => ({ slug: row.accommodation_slug, code: row.filter_code, scope: row.scope_key, availability: row.availability, checked_at: row.official_source_checked_at, valid_until: row.valid_until ?? '', url: row.official_source_url })), ['slug', 'code', 'scope', 'availability', 'checked_at', 'valid_until', 'url'])}\n\n## 시설 공식 사실 upsert\n\n${markdownTable(seed.facility_official_filter_facts.map((row) => ({ slug: row.facility_slug, code: row.filter_code, scope: row.scope_key, availability: row.availability, checked_at: row.official_source_checked_at, valid_until: row.valid_until ?? '', url: row.official_source_url })), ['slug', 'code', 'scope', 'availability', 'checked_at', 'valid_until', 'url'])}\n`);
  writeFileSync(paths.qaJson, `${JSON.stringify({ generated_at: date, ...qa }, null, 2)}\n`);
  writeFileSync(paths.qaMd, `# 결정 데이터 QA 보고서\n\n- 기준일: ${date}\n- P0 통과: ${qa.passed ? '예' : '아니오'}\n- P0 finding: ${qa.findings.filter((finding) => finding.severity === 'P0').length}건\n- 원칙: visible review count와 직접 판독 후기 수를 섞지 않았고, 후기 감촉·색·주의 신호를 온천수 방식 확정에 쓰지 않았습니다.\n\n## 최종 상태\n\n${markdownTable(qa.quality, ['target_type', 'slug', 'readiness', 'decision_answers', 'p0_needs_check'])}\n\n## Finding\n\n${qa.findings.length === 0 ? '발견된 QA 위반이 없습니다.' : markdownTable(qa.findings.map((finding) => ({ severity: finding.severity, code: finding.code, target: finding.target ?? '', detail: finding.detail })), ['severity', 'code', 'target', 'detail'])}\n\n## 공개 상태 원칙\n\n- \`ready\`: 6/7 이상이며 P0 미확인 항목이 없습니다.\n- \`conditional\`: 6/7 이상이며, 공식이 명시한 조건·변동 항목만 남았습니다.\n- \`hold\`: 6/7 미만이거나 P0 항목이 미확인입니다. 이번 seed는 hold 행을 published로 승격하지 않습니다.\n`);
  return paths;
}

function parseEnv(filePath) {
  if (!existsSync(filePath)) return {};
  return Object.fromEntries(readFileSync(filePath, 'utf8').split(/\r?\n/).flatMap((line) => {
    const match = line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/);
    if (!match) return [];
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    return [[match[1], value]];
  }));
}

function readConfig() {
  const env = { ...parseEnv(path.join(repoRoot, '.env.local')), ...process.env };
  const supabaseUrl = (env.NEXT_PUBLIC_SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
  const restUrl = (env.CONTENT_DB_REST_URL || (supabaseUrl ? `${supabaseUrl}/rest/v1` : '')).replace(/\/+$/, '');
  const apiKey = env.CONTENT_DB_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!restUrl || !apiKey) throw new Error('Supabase REST URL과 API key가 필요합니다.');
  return { restUrl, apiKey };
}

async function request(config, table, query = {}, options = {}) {
  const url = new URL(`${config.restUrl}/${table}`);
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers: {
      apikey: config.apiKey,
      authorization: `Bearer ${config.apiKey}`,
      ...(options.prefer ? { prefer: options.prefer } : {}),
      ...(options.body ? { 'content-type': 'application/json' } : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });
  if (!response.ok) throw new Error(`${table} ${response.status}: ${await response.text()}`);
  if (response.status === 204) return [];
  return response.json();
}

async function applySeed(seed, research) {
  const config = readConfig();
  const applyFacts = async ({ rows, factTable, targetTable, targetColumn, targetType }) => {
    if (rows.length === 0) return { applied: 0, verified: 0, statuses: [] };
    const loaded = await request(config, factTable, { on_conflict: `${targetColumn},filter_code,scope_key` }, {
      method: 'POST',
      prefer: 'resolution=merge-duplicates,return=representation',
      body: rows,
    });
    const slugs = [...new Set(rows.map((row) => row[targetColumn]))];
    const filter = `in.(${slugs.map((slug) => `"${slug}"`).join(',')})`;
    const [facts, statuses] = await Promise.all([
      request(config, factTable, { select: `${targetColumn},filter_code,scope_key,filter_status,official_source_url,official_source_checked_at,valid_until`, [targetColumn]: filter }),
      request(config, targetTable, { select: 'slug,status', slug: filter }),
    ]);
    const expectedKeys = new Set(rows.map((row) => `${row[targetColumn]}:${row.filter_code}:${row.scope_key}`));
    const actualKeys = new Set(facts.map((row) => `${row[targetColumn]}:${row.filter_code}:${row.scope_key}`));
    const missing = [...expectedKeys].filter((key) => !actualKeys.has(key));
    if (missing.length > 0) throw new Error(`적재 후 ${targetType} 공식 사실 누락: ${missing.join(', ')}`);
    if (facts.some((row) => expectedKeys.has(`${row[targetColumn]}:${row.filter_code}:${row.scope_key}`) && row.filter_status !== 'ready')) {
      throw new Error(`적재 후 ${targetType} 공식 사실 중 ready가 아닌 행이 있습니다.`);
    }
    const targetedRecords = research.finalRecords.filter((record) => record.target_type === targetType && slugs.includes(record.slug));
    const statusMap = new Map(statuses.map((row) => [row.slug, row.status]));
    const unexpectedStatus = targetedRecords.filter((record) => statusMap.get(record.slug) !== record.existing_status);
    if (unexpectedStatus.length > 0) throw new Error(`적재 후 ${targetType} 공개 상태가 바뀌었습니다: ${unexpectedStatus.map((record) => record.slug).join(', ')}`);
    return { applied: loaded.length, verified: facts.filter((row) => expectedKeys.has(`${row[targetColumn]}:${row.filter_code}:${row.scope_key}`)).length, statuses };
  };
  const [accommodations, facilities] = await Promise.all([
    applyFacts({ rows: seed.accommodation_official_filter_facts, factTable: 'onsen_accommodation_official_filter_facts', targetTable: 'onsen_accommodations', targetColumn: 'accommodation_slug', targetType: 'accommodation' }),
    applyFacts({ rows: seed.facility_official_filter_facts, factTable: 'onsen_facility_official_filter_facts', targetTable: 'onsen_facilities', targetColumn: 'facility_slug', targetType: 'facility' }),
  ]);
  return {
    applied_accommodation_facts: accommodations.applied,
    verified_accommodation_facts: accommodations.verified,
    applied_facility_facts: facilities.applied,
    verified_facility_facts: facilities.verified,
    accommodation_statuses: accommodations.statuses,
    facility_statuses: facilities.statuses,
  };
}

async function main() {
  const research = buildResearch();
  if (research.finalRecords.length !== 30) {
    throw new Error(`후보 수 불일치: final=${research.finalRecords.length}`);
  }
  if (research.finalRecords.some((record) => record.qa.readiness === 'hold')) {
    throw new Error('최종 30곳에 hold 상태가 포함되어 있습니다. 후보 교체 또는 공식 근거 보강이 필요합니다.');
  }
  const seed = buildSeed(research);
  const qa = qaResearch(research, seed);
  const paths = writeArtifacts(research, seed, qa);
  let verification = null;
  if (shouldApply) {
    if (!qa.passed) throw new Error('P0 QA finding이 있어 DB 적재를 중단했습니다.');
    verification = await applySeed(seed, research);
    const reportPath = path.join(outputDir, `decision_pilot_load_report_${date}.md`);
    writeFileSync(reportPath, `# 결정 데이터 DB 적재 리포트\n\n- 적재일: ${date}\n- 숙소 공식 필터 사실 upsert: ${verification.applied_accommodation_facts}건\n- 숙소 적재 후 검증된 대상 사실: ${verification.verified_accommodation_facts}건\n- 시설 공식 필터 사실 upsert: ${verification.applied_facility_facts}건\n- 시설 적재 후 검증된 대상 사실: ${verification.verified_facility_facts}건\n- 후기 evidence·온천수 방식 행은 이번 적재에서 변경하지 않았습니다.\n- hold 행을 published로 승격하지 않았고, 대상 숙소·시설의 기존 공개 상태가 변하지 않았음을 재조회했습니다.\n\n## 숙소 상태\n\n${markdownTable(verification.accommodation_statuses.map((row) => ({ slug: row.slug, status: row.status })), ['slug', 'status'])}\n\n## 시설 상태\n\n${markdownTable(verification.facility_statuses.map((row) => ({ slug: row.slug, status: row.status })), ['slug', 'status'])}\n`);
    paths.loadReport = reportPath;
  }
  console.log(JSON.stringify({
    final_targets: research.finalRecords.length,
    accommodation_targets: research.finalRecords.filter((record) => record.target_type === 'accommodation').length,
    facility_targets: research.finalRecords.filter((record) => record.target_type === 'facility').length,
    reserve_targets: research.reserveRecords.length,
    hold_targets: research.holdRecords.length,
    readiness: research.finalRecords.reduce((counts, record) => ({ ...counts, [record.qa.readiness]: (counts[record.qa.readiness] ?? 0) + 1 }), {}),
    accommodation_fact_upserts: seed.accommodation_official_filter_facts.length,
    facility_fact_upserts: seed.facility_official_filter_facts.length,
    p0_qa_passed: qa.passed,
    findings: qa.findings.length,
    outputs: Object.fromEntries(Object.entries(paths).map(([key, value]) => [key, path.relative(repoRoot, value)])),
    verification,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exit(1);
});
