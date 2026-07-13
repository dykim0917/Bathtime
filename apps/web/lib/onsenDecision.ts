import { getOnsenEntityType, type OnsenCandidate, type OnsenDecisionFact } from './onsenCatalog';
import type { OnsenEntryIntent } from './onsenIntent';

export type OnsenDecisionProfile = {
  intents: OnsenEntryIntent[];
  experience: OnsenDecisionFact[];
  usage: OnsenDecisionFact[];
  trip: OnsenDecisionFact[];
  coverage: number;
  price: OnsenDecisionFact | null;
  primaryAction: {
    type: 'booking' | 'official' | 'map';
    label: string;
    href?: string;
  };
};

const experienceCodes = new Set([
  'bath_composition',
  'bath_count',
  'signature_baths',
  'room_bath',
  'private_bath',
  'family_bath',
  'public_bath',
  'open_air_bath',
  'sauna',
  'stone_sauna',
  'rest_area',
]);

const usageCodes = new Set([
  'private_bath_reservation_method',
  'vacancy_check_method',
  'private_bath_time_limit_minutes',
  'towel_policy',
  'reentry_policy',
  'tattoo_allowed',
]);

const tripCodes = new Set([
  'opening_hours',
  'last_entry_at',
  'closing_time',
  'adult_price_yen',
  'late_night_surcharge_yen',
  'overnight_mode',
  'lodging',
  'station_walk_10m',
  'parking',
  'shuttle',
  'meal_service',
]);

const accommodationRequiredCodes = ['bath_composition', 'public_bath', 'room_bath', 'private_bath', 'booking_action'];
const facilityRequiredCodes = ['bath_composition', 'opening_hours', 'adult_price_yen', 'towel_policy', 'official_action'];

function uniqueFacts(facts: OnsenDecisionFact[]) {
  const seen = new Set<string>();
  return facts.filter((fact) => {
    const key = `${fact.code}:${fact.scope ?? ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function uniqueFactsByCode(facts: OnsenDecisionFact[]) {
  const seen = new Set<string>();
  return facts.filter((fact) => {
    if (seen.has(fact.code)) return false;
    seen.add(fact.code);
    return true;
  });
}

function fallbackFacts(candidate: OnsenCandidate): OnsenDecisionFact[] {
  const facts: OnsenDecisionFact[] = [{
    code: 'bath_composition',
    label: '목욕 구성',
    value: candidate.primaryBath,
    status: candidate.primaryBath.includes('확인') ? 'needs_check' : 'confirmed',
    detail: '현재 정리된 대표 목욕 구성을 기준으로 표시합니다.',
  }];

  for (const fact of candidate.facts) {
    const code = fact.label === '객실 내 프라이빗탕'
      ? 'room_bath'
      : fact.label === '대절탕'
        ? 'private_bath'
        : fact.label === '대욕장'
          ? 'public_bath'
          : null;
    if (!code) continue;
    facts.push({
      code,
      label: fact.label,
      value: fact.value,
      status: fact.status === 'confirmed' ? 'confirmed' : fact.status === 'attention' ? 'conditional' : 'needs_check',
      detail: fact.detail,
    });
  }

  return facts;
}

function deriveIntents(candidate: OnsenCandidate, facts: OnsenDecisionFact[]): OnsenEntryIntent[] {
  const codes = new Set(facts.filter((fact) => fact.status !== 'needs_check').map((fact) => fact.code));
  const intents: OnsenEntryIntent[] = [];
  if (getOnsenEntityType(candidate) === 'facility') intents.push('city_facility');
  if (getOnsenEntityType(candidate) === 'accommodation') {
    if (codes.has('room_bath') || codes.has('private_bath') || codes.has('family_bath') || candidate.contexts?.bath.includes('room_bath') || candidate.contexts?.bath.includes('private_bath')) {
      intents.push('stay_private');
    }
    if (codes.has('public_bath') || codes.has('open_air_bath') || candidate.contexts?.bath.includes('public_bath')) {
      intents.push('stay_bath_depth');
    }
  }
  return intents;
}

export function getOnsenDecisionProfile(candidate: OnsenCandidate): OnsenDecisionProfile {
  const facts = uniqueFacts([...(candidate.decisionFacts ?? []), ...fallbackFacts(candidate)]);
  const entityType = getOnsenEntityType(candidate);
  const primaryOfficialLink = candidate.officialLinks[0];
  const required = entityType === 'facility' ? facilityRequiredCodes : accommodationRequiredCodes;
  const presentCodes = new Set(facts.filter((fact) => fact.status !== 'needs_check').map((fact) => fact.code));
  if (primaryOfficialLink) presentCodes.add(entityType === 'facility' ? 'official_action' : 'booking_action');
  const coverage = Math.round((required.filter((code) => presentCodes.has(code)).length / required.length) * 100);

  const experience = uniqueFactsByCode(facts.filter((fact) => experienceCodes.has(fact.code))).slice(0, 8);
  const usage = uniqueFactsByCode(facts.filter((fact) => usageCodes.has(fact.code))).slice(0, 6);
  const trip = uniqueFactsByCode(facts.filter((fact) => tripCodes.has(fact.code))).slice(0, 8);
  const price = facts.find((fact) => fact.code === 'adult_price_yen') ?? null;

  if (usage.length === 0) {
    const roomBath = experience.find((fact) => fact.code === 'room_bath');
    const privateBath = experience.find((fact) => fact.code === 'private_bath' || fact.code === 'family_bath');
    if (entityType === 'accommodation' && roomBath) {
      usage.push({
        code: 'room_bath_booking_check',
        label: '객실 선택',
        value: '온천탕 포함 객실인지 상품명 확인',
        status: roomBath.status,
        detail: '같은 숙소라도 객실 타입에 따라 온천탕 포함 여부와 물 사용 범위가 달라질 수 있습니다.',
        sourceUrl: primaryOfficialLink?.href,
      });
    }
    if (entityType === 'accommodation' && privateBath) {
      usage.push({
        code: 'private_bath_booking_check',
        label: '대절탕 이용',
        value: '예약·선착순 여부를 숙소 안내에서 확인',
        status: privateBath.status,
        detail: '대절탕은 사전 예약, 체크인 후 예약, 선착순, 빈 탕 이용 방식이 숙소마다 다릅니다.',
        sourceUrl: primaryOfficialLink?.href,
      });
    }
    if (usage.length === 0) {
      usage.push({
        code: 'usage_check',
        label: entityType === 'facility' ? '입장 방법' : '이용 방법',
        value: entityType === 'facility' ? '공식 이용 안내에서 확인' : '예약 상품과 숙소 안내에서 확인',
        status: 'needs_check',
        detail: entityType === 'facility'
          ? '운영 시간과 입장 조건은 방문 당일에도 바뀔 수 있습니다.'
          : '객실탕 포함 여부와 대절탕 예약 방식은 예약 상품마다 달라질 수 있습니다.',
        sourceUrl: primaryOfficialLink?.href,
      });
    }
  }

  return {
    intents: deriveIntents(candidate, facts),
    experience,
    usage,
    trip,
    coverage,
    price,
    primaryAction: entityType === 'facility'
      ? { type: 'official', label: price ? '요금·이용 안내 보기' : '공식 이용 안내 보기', href: primaryOfficialLink?.href }
      : { type: 'booking', label: '가격·예약 확인', href: primaryOfficialLink?.href },
  };
}
