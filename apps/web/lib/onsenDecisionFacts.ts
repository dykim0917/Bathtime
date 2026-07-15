import type { OnsenDecisionFact } from './onsenCatalog';

export type OnsenOfficialFilterFact = {
  filter_code: string;
  scope_key?: string | null;
  scope_label_ko?: string | null;
  availability: 'confirmed' | 'conditional' | 'not_available';
  filter_status: 'ready' | 'hold' | 'expired' | 'deprecated';
  filter_value?: unknown;
  official_original_text?: string | null;
  official_source_url: string;
  official_source_checked_at: string;
};

type ProfileOfficialFact = {
  fact?: unknown;
  value?: unknown;
  scope?: unknown;
  area?: unknown;
  facility_area?: unknown;
  checked_at?: unknown;
  source_url?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function stringValue(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function numberValue(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;
  const parsed = Number(value.replaceAll(',', '').trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function firstString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = stringValue(record[key]);
    if (value) return value;
  }
  return null;
}

function firstNumber(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = numberValue(record[key]);
    if (value !== null) return value;
  }
  return null;
}

function formatYen(value: number) {
  return `${new Intl.NumberFormat('ko-KR').format(value)}엔`;
}

function formatOpeningHours(value: string) {
  if (/^(?:24\s*hours?|24h|24hours_year_round)$/i.test(value)) return '24시간 운영';
  const nextDay = value.match(/^(\d{1,2}:\d{2})-(\d{1,2}:\d{2})_next_day$/);
  if (nextDay) return `${nextDay[1]}-익일 ${nextDay[2]}`;
  return value.replace(/翌(?=\d{1,2}:\d{2})/g, '익일 ');
}

function statusFor(fact: OnsenOfficialFilterFact): OnsenDecisionFact['status'] {
  return fact.availability === 'conditional' ? 'conditional' : 'confirmed';
}

function sourceFields(fact: OnsenOfficialFilterFact) {
  return {
    scope: fact.scope_label_ko?.trim() || fact.scope_key?.trim() || undefined,
    sourceUrl: fact.official_source_url,
    checkedAt: fact.official_source_checked_at,
  };
}

function mapFilterFact(fact: OnsenOfficialFilterFact): OnsenDecisionFact[] {
  if (fact.filter_status !== 'ready' || fact.availability === 'not_available') return [];
  const value = isRecord(fact.filter_value) ? fact.filter_value : {};
  const source = sourceFields(fact);
  const status = statusFor(fact);
  const detail = fact.official_original_text?.trim() || undefined;

  if (fact.filter_code === 'day_use' || fact.filter_code === 'morning_bath' || fact.filter_code === 'late_night') {
    const reception = firstString(value, ['reception']);
    const explicitHours = firstString(value, ['hours', 'facility_hours'])
      ?? [firstString(value, ['opens_at']), firstString(value, ['closes_at'])].filter(Boolean).join('-');
    const hoursValue = explicitHours || (reception?.includes('-') ? reception : null);
    const hours = hoursValue ? formatOpeningHours(hoursValue) : null;
    const lastEntryCandidate = firstString(value, ['last_entry', 'last_admission', 'final_reception'])
      ?? (reception && !reception.includes('-') ? reception : null);
    const lastEntry = lastEntryCandidate && !/[-~〜–]/.test(lastEntryCandidate) ? lastEntryCandidate : null;
    const finalExit = firstString(value, ['final_exit']);
    return [
      ...(hours ? [{ code: 'opening_hours', label: reception === hours ? '접수 시간' : '이용 시간', value: hours, status, detail, ...source } satisfies OnsenDecisionFact] : []),
      ...(lastEntry ? [{ code: 'last_entry_at', label: '마지막 입장', value: lastEntry, status, detail, ...source } satisfies OnsenDecisionFact] : []),
      ...(finalExit ? [{ code: 'closing_time', label: '최종 퇴관', value: finalExit, status, detail, ...source } satisfies OnsenDecisionFact] : []),
    ];
  }

  if (fact.filter_code === 'adult_day_use_price') {
    const amount = firstNumber(value, ['amount_jpy', 'adult_jpy', 'weekday_jpy', 'early_weekday_jpy', 'adult_garden_admission_jpy']);
    if (amount === null) return [];
    const holiday = firstNumber(value, ['holiday_jpy', 'late_holiday_jpy']);
    return [{
      code: 'adult_price_yen',
      label: '성인 입장료',
      value: holiday && holiday !== amount ? `평일 ${formatYen(amount)} · 휴일 ${formatYen(holiday)}` : formatYen(amount),
      status,
      detail,
      ...source,
    }, ...(value.towels_included === true
      ? [{
          code: 'towel_policy',
          label: '수건',
          value: '요금에 포함',
          status,
          detail,
          ...source,
        } satisfies OnsenDecisionFact]
      : [])];
  }

  if (fact.filter_code === 'private_bath' || fact.filter_code === 'family_bath') {
    const label = fact.filter_code === 'family_bath' ? '가족탕' : '대절탕';
    const duration = firstNumber(value, ['duration_minutes', 'minutes', 'minimum_minutes', 'usage_limit_minutes']);
    const reservation = value.reservation_required === true
      ? '사전 예약 필요'
      : value.same_day_reservation_only === true
        ? '당일 예약'
        : firstString(value, ['reservation']);
    const fee = firstNumber(value, ['room_fee_jpy', 'per_hour_jpy', 'price_jpy']);
    return [
      { code: fact.filter_code, label, value: fee ? `${label} ${formatYen(fee)}` : `${label} 있음`, status, detail, ...source },
      ...(reservation ? [{ code: 'private_bath_reservation_method', label: '이용 신청', value: reservation, status, detail, ...source } satisfies OnsenDecisionFact] : []),
      ...(duration ? [{ code: 'private_bath_time_limit_minutes', label: '이용 시간', value: `${duration}분`, status, detail, ...source } satisfies OnsenDecisionFact] : []),
    ];
  }

  const simpleLabels: Record<string, [string, string]> = {
    open_air_bath: ['open_air_bath', '노천탕'],
    sauna: ['sauna', '사우나'],
    stone_sauna: ['stone_sauna', '암반욕'],
    rest_area: ['rest_area', '휴게 공간'],
    meal_service: ['meal_service', '식사'],
    lodging: ['lodging', '숙박·밤샘'],
    station_walk_10m: ['station_walk_10m', '역에서 도보'],
    parking: ['parking', '주차'],
    shuttle: ['shuttle', '셔틀'],
    tattoo_allowed: ['tattoo_allowed', '문신 이용'],
  };
  const mapped = simpleLabels[fact.filter_code];
  if (!mapped) return [];

  let displayValue = `${mapped[1]} 가능`;
  if (fact.filter_code === 'station_walk_10m') {
    const minutes = firstNumber(value, ['walking_minutes', 'walk_minutes', 'walk_minutes_approx']);
    if (minutes !== null) displayValue = `도보 약 ${minutes}분`;
  }
  if (fact.filter_code === 'lodging') displayValue = firstString(value, ['policy_ko']) ?? '숙박 또는 밤샘 가능';
  return [{ code: mapped[0], label: mapped[1], value: displayValue, status, detail, ...source }];
}

export function decisionFactsFromOfficialFilters(facts: OnsenOfficialFilterFact[]) {
  return facts.flatMap(mapFilterFact);
}

function profileFacts(value: unknown): ProfileOfficialFact[] {
  if (!isRecord(value) || !Array.isArray(value.official_facts)) return [];
  return value.official_facts.filter(isRecord);
}

function profileSource(fact: ProfileOfficialFact) {
  return {
    scope: stringValue(fact.scope) ?? stringValue(fact.area) ?? stringValue(fact.facility_area) ?? undefined,
    sourceUrl: stringValue(fact.source_url) ?? undefined,
    checkedAt: stringValue(fact.checked_at)?.replace(/\s+KST$/, '') ?? undefined,
  };
}

export function decisionFactsFromFacilityProfile(value: unknown): OnsenDecisionFact[] {
  const output: OnsenDecisionFact[] = [];

  for (const fact of profileFacts(value)) {
    const text = stringValue(fact.fact) ?? stringValue(fact.value);
    if (!text) continue;
    const source = profileSource(fact);

    const hourRanges = [...text.matchAll(/(\d{1,2}:\d{2})\s*[-~〜–]\s*(\d{1,2}:\d{2})/g)]
      .map((match) => `${match[1]}-${match[2]}`);
    const hours = [...new Set(hourRanges)].join(' / ');
    if (hours) output.push({ code: 'opening_hours', label: '이용 시간', value: hours, status: 'confirmed', detail: text, ...source });

    const lastEntry = text.match(/(?:최종\s*(?:접수|입장)|last\s*(?:entry|admission)|最終(?:受付|入場))[^0-9]{0,8}(\d{1,2}:\d{2})/i);
    if (lastEntry) output.push({ code: 'last_entry_at', label: '마지막 입장', value: lastEntry[1], status: 'confirmed', detail: text, ...source });

    const adultPrice = text.match(/(?:성인|adult|大人)[^0-9]{0,12}([0-9][0-9,]*)\s*(?:엔|円|yen)/i);
    if (adultPrice) output.push({ code: 'adult_price_yen', label: '성인 입장료', value: formatYen(Number(adultPrice[1].replaceAll(',', ''))), status: 'confirmed', detail: text, ...source });

    const bathCount = text.match(/(?:합계\s*)?([0-9]+)\s*(?:개\s*)?(?:욕조|탕|욕탕|baths?|bath\s*types?)/i);
    if (bathCount) output.push({ code: 'bath_count', label: '확인된 탕', value: `${bathCount[1]}개`, status: 'confirmed', detail: text, ...source });

    if (/(?:타월|수건|タオル|towel)/i.test(text)) {
      const towelToken = /(?:타월|수건|タオル|towels?)/i;
      const towelIndex = text.search(towelToken);
      const towelContext = text.slice(Math.max(0, towelIndex - 24), towelIndex + 64);
      const towelValue = /(?:대여|rental|レンタル)/i.test(towelContext)
          ? '현장 대여'
          : /(?:판매|구매|sold|purchase)|(?:타월|수건|タオル|towels?)[^.;。]{0,24}[0-9][0-9,]*\s*(?:엔|円|yen)/i.test(towelContext)
            ? '현장 구매'
            : /(?:포함|included|무료|free)/i.test(towelContext)
              ? '요금에 포함 또는 무료 비치'
              : /(?:지참|持参|bring)/i.test(towelContext)
              ? '직접 지참'
              : null;
      if (towelValue) output.push({ code: 'towel_policy', label: '수건', value: towelValue, status: 'confirmed', detail: text, ...source });
    }
  }

  return output;
}
