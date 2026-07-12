import type { OnsenCandidate, OnsenStatus } from './onsenCatalog';
import {
  formatOnsenLocationDisplay,
  getDefaultOnsenLocation,
  getFilterLabel,
  getOnsenAreaLabel,
  getOnsenCityLabel,
  getOnsenPrefectureLabel,
  getOnsenRegionGroupLabel,
  officialFacilityFeatureFilters,
  type OnsenLocation,
  type OnsenWaterCriterion,
} from './onsenTaxonomy';

type FacilityRow = {
  slug: string;
  name_ko: string;
  name_ja: string;
  country: string;
  region_group: string;
  prefecture: string | null;
  municipality: string | null;
  onsen_area: string | null;
  facility_type: string;
  facility_model: string;
  primary_archetype: string;
  cleanup_status: string;
  official_url: string | null;
  official_profile: unknown;
  official_source_urls: unknown;
  official_checked_at: string | null;
  summary: string | null;
  content_updated_at: string | null;
  updated_at: string | null;
};

type FacilityWaterFactRow = {
  facility_slug: string;
  facility_area: string;
  water_system: 'kakenagashi_pure' | 'kakenagashi' | 'junkan' | null;
  kasui: 'present' | 'not_present' | 'unknown';
  kaon: 'present' | 'not_present' | 'unknown';
  disinfection: 'present' | 'not_present' | 'unknown';
  texture_filter_candidates: unknown;
  water_color: 'white' | 'brown' | 'clear' | 'unknown';
  method_render_status: string;
  texture_filter_status: string;
  color_filter_status: string;
  official_source_url: string;
};

type FacilityReviewEvidenceRow = {
  id: string;
  facility_slug: string;
  facility_related_direct_reviews: number;
  direct_body_platform_count: number;
  evidence_grade: 'A' | 'B' | 'C' | 'D';
  collection_readiness: string;
};

type FacilityReviewSignalRow = {
  evidence_id: string;
  facility_area: string;
  signal_type: string;
  signal_direction: 'positive' | 'negative' | 'mixed' | 'neutral';
  mention_count: number;
  review_signal_status: string;
  evidence_summary: string | null;
};

type FacilityOfficialFilterFactRow = {
  facility_slug: string;
  filter_code: string;
  availability: 'confirmed' | 'conditional' | 'not_available';
  filter_status: 'ready' | 'hold' | 'expired' | 'deprecated';
  official_source_url: string;
  official_source_checked_at: string;
};

const facilityTypeLabels: Record<string, string> = {
  large_day_use_complex: '대형 당일온천',
  historic_public_bath: '역사적 공중탕',
  public_bath_facility: '공용 온천시설',
  family_private_bath_facility: '가족탕·대절탕 시설',
  sand_bath_facility: '모래찜질 시설',
  steam_bath_facility: '증기탕 시설',
  wellness_spa: '웰니스 스파',
};

const bathAreaLabels: Record<string, string> = {
  public_bath: '공용탕',
  open_air_public_bath: '노천탕',
  family_bath: '가족탕',
  private_bath: '대절탕',
  sand_bath: '모래찜질',
  steam_bath: '증기탕',
  footbath: '족욕',
  sauna: '사우나',
  stone_sauna: '암반욕',
  rest_area: '휴게 공간',
  food_area: '식음 공간',
  overnight_rest: '심야 휴식',
};

const signalLabels: Record<string, string> = {
  water_texture: '물의 감촉',
  distinctive_spring_character: '온천감',
  chlorine_smell: '소독 냄새',
  weak_onsen_feeling: '온천감 아쉬움',
  temperature_experience: '탕 온도',
  weather_season: '계절 영향',
  historic_bath_context: '역사적 분위기',
  bath_variety: '탕 구성',
  sand_or_steam_experience: '특화 목욕 경험',
  family_private_bath_experience: '가족탕·대절탕',
  crowding_or_wait: '혼잡·대기',
  reservation_or_queue_confusion: '예약·대기 방식',
  cleanliness_amenities: '청결·비품',
  price_payment_value: '요금·결제',
  accessibility: '접근성',
  tourist_expectation_gap: '방문 기대 차이',
  local_user_culture: '현지 이용 분위기',
  eligibility_or_use_scope: '이용 대상·범위',
  operation_volatility: '운영 변동',
};

const textureFilterLabels: Record<string, string> = {
  slippery: '미끌미끌',
  salt_warmth: '염분감',
  sulfur: '유황감',
  carbonated: '탄산감',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function facilityAreasFromProfile(value: unknown) {
  const profile = isRecord(value) ? value : {};
  const areas = [
    ...stringArray(profile.bath_areas),
    ...stringArray(profile.areas),
  ];

  for (const key of Object.keys(bathAreaLabels)) {
    if (profile[key] === true) areas.push(key);
  }

  if (!areas.includes('public_bath')) areas.unshift('public_bath');
  return unique(areas.filter((area) => bathAreaLabels[area]));
}

function mapFacilityLocation(row: FacilityRow): OnsenLocation {
  const fallback = getDefaultOnsenLocation(row.onsen_area ?? 'tokyo', row.name_ko);
  const regionGroup = row.region_group || fallback.regionGroup;
  const prefecture = row.prefecture ?? fallback.prefecture;
  const city = row.municipality ?? fallback.city;
  const onsenArea = row.onsen_area ?? fallback.onsenArea;
  const regionGroupLabel = getOnsenRegionGroupLabel(regionGroup);
  const prefectureLabel = getOnsenPrefectureLabel(prefecture);
  const cityLabel = getOnsenCityLabel(city);
  const onsenAreaLabel = getOnsenAreaLabel(onsenArea);

  return {
    country: 'JP',
    regionGroup: regionGroup as OnsenLocation['regionGroup'],
    regionGroupLabel,
    prefecture,
    prefectureLabel,
    city,
    cityLabel,
    onsenArea,
    onsenAreaLabel,
    display: formatOnsenLocationDisplay({ regionGroupLabel, prefectureLabel, onsenAreaLabel }),
  };
}

function facilitySummary(row: FacilityRow, location: OnsenLocation) {
  if (row.summary?.trim()) return row.summary.trim();
  if (row.facility_type === 'historic_public_bath') return `${location.onsenAreaLabel}에서 역사적 공중탕과 당일입욕 경험을 확인할 수 있는 온천 시설입니다.`;
  if (row.facility_type === 'wellness_spa') return `${location.onsenAreaLabel}에서 온천욕과 사우나·휴게 공간을 함께 이용하는 웰니스 시설입니다.`;
  if (row.facility_type === 'large_day_use_complex') return `${location.onsenAreaLabel}에서 여러 탕과 공용 온천을 중심으로 이용하는 대형 당일온천 시설입니다.`;
  return `${location.onsenAreaLabel}에서 공용 온천욕을 중심으로 이용하는 당일입욕 시설입니다.`;
}

function facilityOperationNotice(value: unknown) {
  const profile = isRecord(value) ? value : {};
  if (profile.operation_status === 'temporarily_closed_pending_reopening_notice') {
    return {
      summary: '현재 임시휴업 중이며 재개일은 공식 발표를 기다리고 있습니다.',
      caution: '재개일이 정해지지 않았습니다. 방문 계획을 세우기 전에 공식 공지를 확인하세요.',
    };
  }
  return null;
}

function primaryBathLabel(areas: string[]) {
  const prioritized = ['open_air_public_bath', 'public_bath', 'family_bath', 'private_bath', 'sand_bath', 'steam_bath', 'sauna', 'stone_sauna'];
  const labels = prioritized.filter((area) => areas.includes(area)).map((area) => bathAreaLabels[area]);
  return labels.slice(0, 3).join(' · ') || '공용 온천 중심';
}

function waterProfileFromFacts(facts: FacilityWaterFactRow[]): OnsenCandidate['waterProfile'] | undefined {
  if (facts.length === 0) return undefined;
  const readyMethodFact = facts.find((fact) => fact.method_render_status === 'ready' && fact.water_system);
  const readyColorFact = facts.find(
    (fact) => fact.color_filter_status === 'ready' && (fact.water_color === 'white' || fact.water_color === 'brown')
  );
  const readyTextureCodes = unique(facts
    .filter((fact) => fact.texture_filter_status === 'ready_with_review_count')
    .flatMap((fact) => stringArray(fact.texture_filter_candidates))
    .filter((code) => textureFilterLabels[code]));
  const conditionCodes = unique(
    facts.flatMap((fact) => [
      fact.kasui === 'present' ? 'kasui' : '',
      fact.kaon === 'present' ? 'kaon' : '',
      fact.disinfection === 'present' ? 'disinfection' : '',
    ])
  );
  const conditionLabels = conditionCodes.map((code) => code === 'kasui' ? '가수' : code === 'kaon' ? '가온' : '소독');

  return {
    canonicalMethod: readyMethodFact?.water_system ?? null,
    label: readyMethodFact ? undefined : '원천 방식 확인 중',
    badgeGate: readyMethodFact ? 'ready' : 'hold',
    conditionCodes,
    conditionLabels,
    textureFilters: readyTextureCodes.map((code) => ({
      code,
      label: textureFilterLabels[code],
      exposureStatus: 'filter_ready',
    })),
    colorFilter: readyColorFact
      ? {
          code: readyColorFact.water_color === 'white' ? 'hakutaku' : 'brown',
          label: readyColorFact.water_color === 'white' ? '백탁' : '갈색빛',
          status: 'filter_ready',
          exposeAsFilter: true,
        }
      : undefined,
  };
}

function operationLabel(profile: OnsenCandidate['waterProfile']) {
  if (profile?.canonicalMethod === 'kakenagashi_pure') return '순수직수';
  if (profile?.canonicalMethod === 'kakenagashi') return '직수';
  if (profile?.canonicalMethod === 'junkan') return '순환식 온천';
  return '원천 방식 확인 중';
}

function facilityWaterVerification(
  facts: FacilityWaterFactRow[],
  profile: OnsenCandidate['waterProfile'],
  verifiedAt: string | null
): NonNullable<OnsenCandidate['waterVerification']> {
  const methodFact = facts.find((fact) => fact.method_render_status === 'ready' && fact.water_system);
  const method = profile?.canonicalMethod ?? null;
  const basis = method === 'kakenagashi_pure'
    ? '공식 안내에서 원천 100% 직수 표기를 확인했습니다.'
    : method === 'kakenagashi'
      ? '공식 안내에서 직수 표기를 확인했습니다.'
      : method === 'junkan'
        ? '공식 안내에서 순환·여과 방식을 확인했습니다.'
        : '온천수 사용은 확인했지만 직수·순환식 여부는 공식 자료에서 확인 중입니다.';
  const unresolvedLabels = methodFact
    ? [
      methodFact.kasui === 'unknown' ? '가수 여부' : '',
      methodFact.kaon === 'unknown' ? '가온 여부' : '',
      methodFact.disinfection === 'unknown' ? '소독 여부' : '',
    ].filter(Boolean)
    : ['직수·순환식 여부'];
  const sourceUrls = unique(facts.map((fact) => fact.official_source_url).filter((href) => /^https?:\/\//.test(href)));

  return {
    status: method ? 'confirmed' : 'needs_check',
    basis,
    scope: methodFact ? bathAreaLabels[methodFact.facility_area] ?? methodFact.facility_area : undefined,
    conditions: profile?.conditionLabels ?? [],
    unresolved: unresolvedLabels,
    exceptions: [],
    guidance: !method
      ? '온천수 방식이 선택 기준이라면 방식 확인이 끝난 후보와 먼저 비교하세요.'
      : profile?.conditionCodes.some((code) => code === 'kasui' || code === 'kaon')
        ? '물을 더하거나 데우지 않는 온천을 원한다면 다른 후보와 함께 비교하세요.'
        : undefined,
    sources: sourceUrls.map((href, index) => ({ label: index === 0 ? '공식 사이트' : '공식 참고 자료', href })),
    verifiedAt: verifiedAt ?? undefined,
  };
}

function mapFacilityCandidate(
  row: FacilityRow,
  waterFacts: FacilityWaterFactRow[],
  evidence: FacilityReviewEvidenceRow | undefined,
  reviewSignals: FacilityReviewSignalRow[],
  filterFacts: FacilityOfficialFilterFactRow[]
): OnsenCandidate {
  const location = mapFacilityLocation(row);
  const areas = facilityAreasFromProfile(row.official_profile);
  const readyFilterFacts = filterFacts.filter((fact) => fact.availability === 'confirmed' && fact.filter_status === 'ready');
  const officialFilterCodes = unique(readyFilterFacts.map((fact) => fact.filter_code));
  const featureLabels = officialFilterCodes
    .map((code) => getFilterLabel(officialFacilityFeatureFilters, code))
    .filter((label): label is string => Boolean(label));
  const waterProfile = waterProfileFromFacts(waterFacts);
  const operation = operationLabel(waterProfile);
  const waterVerification = facilityWaterVerification(waterFacts, waterProfile, row.official_checked_at ?? row.content_updated_at);
  const springLabels = [
    officialFilterCodes.includes('spring_acidic') ? '산성천' : '',
    officialFilterCodes.includes('spring_sulfur') ? '유황천' : '',
    officialFilterCodes.includes('spring_chloride') ? '염화물천' : '',
  ].filter(Boolean);
  const springType = springLabels.join(' · ') || '온천 성분 공식 안내 확인';
  const operationNotice = facilityOperationNotice(row.official_profile);
  const summary = operationNotice?.summary ?? facilitySummary(row, location);
  const primaryBath = primaryBathLabel(areas);
  const directReviews = evidence?.facility_related_direct_reviews ?? 0;
  const topSignals = [...reviewSignals]
    .filter((signal) => signal.mention_count > 0 && signal.review_signal_status !== 'insufficient')
    .sort((a, b) => b.mention_count - a.mention_count)
    .slice(0, 3);
  const cautionSignals = [...reviewSignals]
    .filter((signal) => signal.mention_count > 0 && (signal.signal_direction === 'negative' || signal.signal_direction === 'mixed'))
    .sort((a, b) => b.mention_count - a.mention_count)
    .slice(0, 2);
  const officialLinks = unique([
    row.official_url ?? '',
    ...stringArray(row.official_source_urls),
    ...readyFilterFacts.map((fact) => fact.official_source_url),
    ...waterFacts.map((fact) => fact.official_source_url),
  ]).slice(0, 4).map((href, index) => ({ label: index === 0 ? '공식 사이트' : '공식 이용 안내', href }));
  const bathContexts = unique([
    'public_bath',
    officialFilterCodes.includes('private_bath') || officialFilterCodes.includes('family_bath') ? 'private_bath' : '',
  ]) as NonNullable<OnsenCandidate['contexts']>['bath'];
  const waterContexts = new Set<OnsenWaterCriterion>();
  if (waterProfile?.canonicalMethod === 'kakenagashi_pure') {
    waterContexts.add('kakenagashi_pure');
    waterContexts.add('kakenagashi');
  } else if (waterProfile?.canonicalMethod === 'kakenagashi') {
    waterContexts.add('kakenagashi');
  } else if (waterProfile?.canonicalMethod === 'junkan') {
    waterContexts.add('junkan');
  }
  if (waterProfile?.conditionCodes.some((code) => code === 'kasui' || code === 'kaon')) waterContexts.add('temperature_adjustment');
  for (const filter of waterProfile?.textureFilters ?? []) {
    if (filter.code === 'slippery' || filter.code === 'salt_warmth' || filter.code === 'sulfur' || filter.code === 'carbonated') {
      waterContexts.add(filter.code);
    }
  }
  if (waterProfile?.colorFilter?.exposeAsFilter) {
    if (waterProfile.colorFilter.code === 'hakutaku' || waterProfile.colorFilter.code === 'brown') {
      waterContexts.add(waterProfile.colorFilter.code);
    }
  }

  return {
    entityType: 'facility',
    slug: row.slug,
    name: row.name_ko,
    jaName: row.name_ja,
    area: location.display,
    region: location.onsenArea,
    location,
    summary,
    fit: featureLabels.length > 0 ? featureLabels.slice(0, 3).map((label) => `공식 정보로 확인된 ${label}`) : ['당일입욕 시설을 찾고 있음'],
    primaryBath,
    waterDecision: {
      label: '시설 온천 정보',
      summary,
      springType,
      roomBath: '당일입욕 시설',
      operation,
      notice: '운영 시간과 입장 조건은 방문 전 공식 안내를 다시 확인하세요.',
    },
    waterProfile,
    waterVerification,
    dataQuality: evidence?.evidence_grade ?? 'D',
    directReviews,
    onsenReviews: 0,
    updatedAt: row.content_updated_at ?? row.updated_at?.slice(0, 10) ?? '',
    tags: unique(['facility', 'day-trip', 'public-bath', areas.includes('open_air_public_bath') ? 'open-air-bath' : '', bathContexts.includes('private_bath') ? 'private-bath' : '']),
    badges: [
      { label: facilityTypeLabels[row.facility_type] ?? '당일온천 시설', status: 'confirmed' },
      ...featureLabels.slice(0, 2).map((label) => ({ label, status: 'confirmed' as OnsenStatus })),
    ],
    facts: [
      {
        label: '시설 유형',
        value: facilityTypeLabels[row.facility_type] ?? '당일온천 시설',
        status: 'confirmed',
        detail: '숙박 온천과 분리된 비숙박 시설 모델로 정리했습니다.',
      },
      {
        label: '목욕 구성',
        value: primaryBath,
        status: 'confirmed',
        detail: '공식 시설 소개와 시설 범위를 기준으로 정리했습니다.',
      },
      {
        label: '공식 확인 항목',
        value: featureLabels.slice(0, 4).join(' · ') || '공식 이용 안내 확인',
        status: featureLabels.length > 0 ? 'confirmed' : 'needs_check',
        detail: '공식 원문과 적용 범위가 확인된 항목만 표시합니다.',
      },
      {
        label: '온천수 방식',
        value: operation,
        status: waterProfile?.canonicalMethod ? 'confirmed' : 'needs_check',
        detail: waterProfile?.canonicalMethod
          ? '공식 원문에서 확인된 욕장 범위에만 방식 정보를 적용합니다.'
          : '공식 원문에서 직수·순환 방식과 적용 욕장 범위를 확정하기 전까지 방식 배지를 표시하지 않습니다.',
      },
      ...(waterProfile?.colorFilter?.exposeAsFilter
        ? [{
            label: '공식 물빛',
            value: waterProfile.colorFilter.label,
            status: 'confirmed' as OnsenStatus,
            detail: '공식 원문에서 물빛과 적용 욕장 범위가 함께 확인된 경우에만 표시합니다.',
          }]
        : []),
      ...(waterProfile?.textureFilters.length
        ? [{
            label: '후기에서 본 감촉',
            value: waterProfile.textureFilters.map((filter) => filter.label).join(' · '),
            status: 'review_signal' as OnsenStatus,
            detail: '직접 읽은 후기에서 감촉 유형과 독립 후기 수, 플랫폼 분산이 기준을 통과한 경우에만 표시합니다.',
          }]
        : []),
    ],
    signals: topSignals.map((signal) => ({
      label: signalLabels[signal.signal_type] ?? '시설 후기',
      count: signal.mention_count,
      status: 'review_signal',
      summary: signal.evidence_summary ?? `${signalLabels[signal.signal_type] ?? '시설 이용'}을 다룬 후기가 직접 읽은 표본에서 ${signal.mention_count}건 반복됐습니다.`,
    })),
    cautions: [
      ...(operationNotice ? [{ issue: '임시휴업', count: 0, summary: operationNotice.caution }] : []),
      ...(cautionSignals.length > 0
        ? cautionSignals.map((signal) => ({
          issue: signalLabels[signal.signal_type] ?? '이용 전 확인',
          count: signal.mention_count,
          summary: signal.evidence_summary ?? `${signalLabels[signal.signal_type] ?? '시설 이용'}에 관한 주의 후기가 ${signal.mention_count}건 확인됐습니다. 방문 전 공식 운영 정보를 함께 확인하세요.`,
        }))
        : [{ issue: '운영 정보 확인', count: 0, summary: '운영 시간과 이용 조건은 방문 전 공식 사이트에서 다시 확인하세요.' }]),
    ],
    sources: [
      {
        label: '공식 시설 정보',
        direct: 0,
        onsenRelated: 0,
        note: `공식 필터 사실 ${readyFilterFacts.length}건을 원문·URL·적용 범위와 함께 확인했습니다.`,
      },
      {
        label: '시설 후기',
        direct: directReviews,
        onsenRelated: 0,
        note: `직접 읽은 시설 관련 후기 ${directReviews}건 · 본문 확인 플랫폼 ${evidence?.direct_body_platform_count ?? 0}개입니다. 플랫폼 노출 리뷰 수는 합산하지 않았습니다.`,
      },
    ],
    officialLinks,
    officialFilterCodes,
    facilityDetails: {
      type: row.facility_type,
      typeLabel: facilityTypeLabels[row.facility_type] ?? '당일온천 시설',
      model: row.facility_model,
      archetype: row.primary_archetype,
      bathAreas: areas,
      cleanupStatus: row.cleanup_status,
    },
    contexts: {
      travel: unique(['day_trip', row.facility_type === 'wellness_spa' ? 'city_bath' : '']) as NonNullable<OnsenCandidate['contexts']>['travel'],
      bath: bathContexts,
      water: [...waterContexts],
    },
  };
}

async function fetchRows<T>(
  config: { restUrl: string; apiKey: string },
  table: string,
  select: string,
  filters: Record<string, string> = {}
): Promise<T[]> {
  const url = new URL(`${config.restUrl}/${table}`);
  url.searchParams.set('select', select);
  for (const [key, value] of Object.entries(filters)) url.searchParams.set(key, value);
  const response = await fetch(url, {
    headers: {
      apikey: config.apiKey,
      authorization: `Bearer ${config.apiKey}`,
    },
    next: { revalidate: 60, tags: ['onsen-facilities'] },
  });
  if (!response.ok) throw new Error(`${table} read failed: ${response.status}`);
  return response.json() as Promise<T[]>;
}

function inFilter(values: string[]) {
  return `in.(${values.map((value) => `"${value}"`).join(',')})`;
}

export async function readActiveOnsenFacilityCandidates(config: { restUrl: string; apiKey: string }): Promise<OnsenCandidate[]> {
  try {
    const facilities = await fetchRows<FacilityRow>(
      config,
      'onsen_facilities',
      'slug,name_ko,name_ja,country,region_group,prefecture,municipality,onsen_area,facility_type,facility_model,primary_archetype,cleanup_status,official_url,official_profile,official_source_urls,official_checked_at,summary,content_updated_at,updated_at',
      { status: 'eq.active', order: 'region_group.asc,prefecture.asc,name_ko.asc' }
    );
    if (facilities.length === 0) return [];

    const slugs = facilities.map((row) => row.slug);
    const [waterFacts, evidenceRows, filterFacts] = await Promise.all([
      fetchRows<FacilityWaterFactRow>(
        config,
        'onsen_facility_water_facts',
        'facility_slug,facility_area,water_system,kasui,kaon,disinfection,texture_filter_candidates,water_color,method_render_status,texture_filter_status,color_filter_status,official_source_url',
        { facility_slug: inFilter(slugs) }
      ),
      fetchRows<FacilityReviewEvidenceRow>(
        config,
        'onsen_facility_review_evidence',
        'id,facility_slug,facility_related_direct_reviews,direct_body_platform_count,evidence_grade,collection_readiness',
        { facility_slug: inFilter(slugs) }
      ),
      fetchRows<FacilityOfficialFilterFactRow>(
        config,
        'onsen_facility_official_filter_facts',
        'facility_slug,filter_code,availability,filter_status,official_source_url,official_source_checked_at',
        { facility_slug: inFilter(slugs) }
      ),
    ]);
    const evidenceIds = evidenceRows.map((row) => row.id);
    const reviewSignals = evidenceIds.length > 0
      ? await fetchRows<FacilityReviewSignalRow>(
          config,
          'onsen_facility_review_signals',
          'evidence_id,facility_area,signal_type,signal_direction,mention_count,review_signal_status,evidence_summary',
          { evidence_id: inFilter(evidenceIds) }
        )
      : [];
    const evidenceBySlug = new Map(evidenceRows.map((row) => [row.facility_slug, row]));
    const evidenceSlugById = new Map(evidenceRows.map((row) => [row.id, row.facility_slug]));

    return facilities.map((row) => mapFacilityCandidate(
      row,
      waterFacts.filter((fact) => fact.facility_slug === row.slug),
      evidenceBySlug.get(row.slug),
      reviewSignals.filter((signal) => evidenceSlugById.get(signal.evidence_id) === row.slug),
      filterFacts.filter((fact) => fact.facility_slug === row.slug)
    ));
  } catch {
    return [];
  }
}
