import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { onsenCandidates, type OnsenCandidate, type OnsenFactStatus, type OnsenStatus, type OnsenVerdict, type OnsenVerdictItem } from './onsenCatalog';
import { readActiveOnsenFacilityCandidates } from './onsenFacilityData';
import {
  deriveOnsenContexts,
  enrichOnsenCandidate,
  getDefaultOnsenLocation,
  formatOnsenLocationDisplay,
  getOnsenAreaLabel,
  getOnsenCityLabel,
  getOnsenPrefectureLabel,
  getOnsenRegionGroupLabel,
  normalizeOnsenContexts,
  type OnsenLocation,
  type OnsenWaterCriterion,
} from './onsenTaxonomy';

type OnsenWaterUseStatus = 'official_confirmed' | 'review_supported' | 'needs_official_check' | 'unclear';
type OnsenWaterSourceType = 'natural_100' | 'free_flowing_source' | 'hot_spring_confirmed' | 'needs_check';
type OnsenBathScope = 'all_rooms' | 'some_rooms' | 'room_signal_only' | 'public_bath_only' | 'unclear';

type OnsenEvidenceCounts = {
  directReviewCount?: number | null;
  onsenReviewCount?: number | null;
  roomBathMentionCount?: number | null;
  publicBathMentionCount?: number | null;
  privateBathMentionCount?: number | null;
  waterTextureMentionCount?: number | null;
  cautionMentionCount?: number | null;
  waterJudgment?: unknown;
  waterSensoryJudgment?: unknown;
};

type OnsenAccommodationRow = {
  slug: string;
  name: string;
  ja_name: string | null;
  display_name_ko?: string | null;
  name_ja?: string | null;
  name_en?: string | null;
  name_romaji?: string | null;
  aliases_ko?: string[] | null;
  aliases_ja?: string[] | null;
  aliases_en?: string[] | null;
  name_verification_status?: string | null;
  name_source_note?: string | null;
  region: string;
  area: string | null;
  country?: string | null;
  region_group?: string | null;
  prefecture?: string | null;
  city?: string | null;
  onsen_area?: string | null;
  travel_contexts?: unknown;
  bath_contexts?: unknown;
  water_criteria?: unknown;
  summary: string;
  primary_bath: string | null;
  water_use_status: OnsenWaterUseStatus;
  water_source_type: OnsenWaterSourceType;
  bath_scope: OnsenBathScope;
  operation_notes: string[] | null;
  evidence_counts: OnsenEvidenceCounts | null;
  evidence_grade: 'A' | 'B' | 'C' | 'D' | null;
  evidence_note: string | null;
  status: 'active' | 'draft' | 'paused' | 'retired';
  content_updated_at: string | null;
  updated_at: string | null;
};

type OnsenVerdictRow = {
  target_slug: string;
  level: 'full' | 'lite' | 'draft';
  headline: string;
  briefing: unknown;
  items: unknown;
  fact_statuses: unknown;
  verified_at: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
}

function normalizePlatformLabel(value: string) {
  const label = value.trim();
  const key = label.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '_');
  if (!label || /^본문 확인 플랫폼\s*\d+개$/.test(label)) return null;
  if (key === '4travel' || key.includes('fourtravel') || label === '포트래블') return '포트래블';
  if (key.includes('google') && key.includes('hotel') || label === '구글 호텔') return '구글 호텔';
  if (key.includes('google') || label === '구글 지도') return '구글 지도';
  if (key.includes('nifty') || label.replaceAll(' ', '') === '니프티온천') return '니프티온천';
  if (key.includes('naver') || label.startsWith('네이버')) return '네이버';
  if (key.includes('jalan') || label === '자란') return '자란';
  if (key.includes('tripadvisor') || label === '트립어드바이저') return '트립어드바이저';
  if (key.includes('yahoo_map') || label === '야후 지도') return '야후 지도';
  if (key.includes('yahoo_travel') || label === '야후 트래블') return '야후 트래블';
  if (key === 'rakuten' || key.includes('rakuten_travel') || label === '라쿠텐' || label === '라쿠텐 트래블') return '라쿠텐 트래블';
  if (key.includes('rakudaclub')) return key.includes('airtrip') ? '에어트립·라쿠다클럽' : '라쿠다클럽';
  if (key.includes('booking') || label === '부킹닷컴') return '부킹닷컴';
  if (key.includes('hotels_com') || label === '호텔스닷컴') return '호텔스닷컴';
  if (key.includes('expedia') || label === '익스피디아') return '익스피디아';
  if (key === 'ikyu' || label === '잇큐') return '잇큐';
  if (key === 'relux' || label === '리럭스') return '리럭스';
  if (key.includes('rurubu') || label === '루루부') return '루루부';
  if (key.includes('japanese_blog') || label === '일본어 블로그') return '일본어 블로그';
  if (key.includes('korean') && key.includes('blog') || label.startsWith('한국어 블로그')) return '한국어 블로그';
  if (key.includes('asoview') || label === '아소뷰') return '아소뷰';
  if (key.includes('agoda') || label === '아고다') return '아고다';
  if (key.includes('trip_com') || label === '트립닷컴') return '트립닷컴';
  if (key.includes('sauna_ikitai') || label === '사우나이키타이') return '사우나이키타이';
  return label;
}

function normalizePlatforms(value: unknown) {
  return [...new Set(normalizeStringArray(value).map(normalizePlatformLabel).filter((item): item is string => Boolean(item)))];
}

function normalizeNumber(value: unknown) {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : Number.NaN;
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : undefined;
}

function normalizeVerdictItem(value: unknown): OnsenVerdictItem | null {
  if (!isRecord(value) || !isRecord(value.counts)) return null;

  const order = normalizeNumber(value.order) ?? 0;
  const mentions = normalizeNumber(value.counts.mentions);
  const negative = normalizeNumber(value.counts.negative) ?? 0;
  const denominator = value.counts.denominator === 'experiences_read' ? 'experiences_read' : 'onsen_related';
  const platformCount = normalizeNumber(value.counts.platform_count ?? value.counts.platformCount);
  const rawDirectionCounts = isRecord(value.counts.direction_counts)
    ? value.counts.direction_counts
    : isRecord(value.counts.directionCounts)
      ? value.counts.directionCounts
      : null;
  const directionCounts = rawDirectionCounts
    ? {
        positive: normalizeNumber(rawDirectionCounts.positive) ?? 0,
        mixed: normalizeNumber(rawDirectionCounts.mixed) ?? 0,
        negative: normalizeNumber(rawDirectionCounts.negative) ?? 0,
        neutral: normalizeNumber(rawDirectionCounts.neutral) ?? 0,
      }
    : undefined;
  const type = value.type === 'conditional' || value.type === 'minor' ? value.type : 'positive';
  const headline = typeof value.headline === 'string' ? value.headline.trim() : '';
  const body = typeof value.body === 'string' ? value.body.trim() : '';
  const verdict = typeof value.verdict === 'string' ? value.verdict.trim() : '';
  const chipLabel = typeof value.chip_label === 'string' ? value.chip_label.trim() : typeof value.chipLabel === 'string' ? value.chipLabel.trim() : undefined;
  const seasonMonths = Array.isArray(value.season_months)
    ? value.season_months.map(normalizeNumber).filter((item): item is number => Boolean(item))
    : null;

  if (!order || mentions === undefined || !headline || !body || !verdict) return null;

  return {
    order,
    type,
    headline,
    counts: {
      mentions,
      negative,
      denominator,
      platformCount,
      directionCounts,
    },
    body,
    verdict,
    chipLabel,
    seasonMonths,
  };
}

function normalizeFactStatus(value: unknown): OnsenFactStatus | null {
  if (!isRecord(value)) return null;
  const code = typeof value.code === 'string' ? value.code.trim() : '';
  const rawStatus = typeof value.status === 'string' ? value.status.trim() : '';
  const status = rawStatus === 'confirmed' || rawStatus === 'not_confirmed' ? rawStatus : rawStatus === 'needs_check' ? rawStatus : null;
  if (!code || !status) return null;

  return {
    code,
    status,
    label: typeof value.label === 'string' ? value.label.trim() : undefined,
    value: typeof value.value === 'string' ? value.value.trim() : undefined,
    source: typeof value.source === 'string' ? value.source.trim() : undefined,
  };
}

function getVerdictDenominator(item: OnsenVerdictItem, briefing: OnsenVerdict['briefing']) {
  return item.counts.denominator === 'experiences_read' ? briefing.experiencesRead : briefing.onsenRelated;
}

function normalizeVerdict(row: OnsenVerdictRow): OnsenVerdict | null {
  if (row.level === 'draft') return null;

  const briefing = isRecord(row.briefing) ? row.briefing : {};
  const platforms = normalizePlatforms(briefing.platforms);
  const normalizedBriefing = {
    experiencesRead: normalizeNumber(briefing.experiences_read ?? briefing.experiencesRead),
    onsenRelated: normalizeNumber(briefing.onsen_related ?? briefing.onsenRelated),
    platformCount: normalizeNumber(briefing.platform_count ?? briefing.platformCount),
    platforms,
  };
  const items = Array.isArray(row.items)
    ? row.items
        .map(normalizeVerdictItem)
        .filter((item): item is OnsenVerdictItem => Boolean(item))
        .filter((item) => {
          const denominator = getVerdictDenominator(item, normalizedBriefing);
          return typeof denominator !== 'number' || item.counts.mentions <= denominator;
        })
        .sort((a, b) => a.order - b.order)
    : [];
  const factStatuses = Array.isArray(row.fact_statuses)
    ? row.fact_statuses.map(normalizeFactStatus).filter((item): item is OnsenFactStatus => Boolean(item))
    : [];

  return {
    level: row.level,
    headline: row.headline,
    briefing: {
      ...normalizedBriefing,
      platforms,
    },
    items,
    factStatuses,
    verifiedAt: row.verified_at ?? undefined,
  };
}

function parseEnvFile(filePath: string) {
  if (!existsSync(filePath)) return {};

  return Object.fromEntries(
    readFileSync(filePath, 'utf8')
      .split(/\n/)
      .map((line) => line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/))
      .filter((match): match is RegExpMatchArray => Boolean(match))
      .map((match) => {
        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        return [match[1], value];
      })
  ) as Record<string, string>;
}

function readServerEnv() {
  return {
    ...parseEnvFile(path.join(process.cwd(), '..', '..', '.env.local')),
    ...parseEnvFile(path.join(process.cwd(), '.env.local')),
    ...process.env,
  };
}

function readSupabaseServerConfig() {
  const env = readServerEnv();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const restUrl = env.CONTENT_DB_REST_URL?.trim() ?? (supabaseUrl ? `${supabaseUrl.replace(/\/+$/, '')}/rest/v1` : '');
  const apiKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!restUrl || !apiKey) return null;

  return {
    restUrl: restUrl.replace(/\/+$/, ''),
    apiKey,
  };
}

function statusFor(value: OnsenWaterUseStatus | OnsenWaterSourceType | OnsenBathScope): OnsenStatus {
  if (value === 'official_confirmed' || value === 'natural_100' || value === 'free_flowing_source' || value === 'hot_spring_confirmed' || value === 'all_rooms') {
    return 'confirmed';
  }
  if (value === 'review_supported' || value === 'room_signal_only' || value === 'some_rooms') return 'review_signal';
  if (value === 'needs_official_check' || value === 'needs_check' || value === 'unclear') return 'needs_check';
  return 'needs_check';
}

function springTypeLabel(status: OnsenWaterUseStatus, sourceType: OnsenWaterSourceType) {
  if (sourceType === 'natural_100') return '온천수 확인';
  if (sourceType === 'free_flowing_source') return '원천 100% 직수';
  if (status === 'official_confirmed' || sourceType === 'hot_spring_confirmed') return '온천수 확인';
  if (status === 'review_supported') return '온천수 참고 확인';
  return '온천수 예약 전 확인';
}

function roomBathLabel(scope: OnsenBathScope) {
  if (scope === 'all_rooms') return '전 객실 온천탕';
  if (scope === 'some_rooms') return '일부 객실 온천탕';
  if (scope === 'room_signal_only') return '객실 타입별 확인';
  if (scope === 'public_bath_only') return '공용 온천 중심';
  return '예약 전 확인';
}

function operationLabel(sourceType: OnsenWaterSourceType, notes: string[]) {
  if (notes.some((note) => note.includes('순환') || note.includes('여과'))) return '재사용 온천(순환식)';
  if (sourceType === 'free_flowing_source') return '원천 100% 직수';
  if (sourceType === 'natural_100') return '온천수 확인';
  if (sourceType === 'hot_spring_confirmed') return '원천 방식 이용 전 확인';
  return notes[0] ?? '이용 전 확인';
}

function normalizeWaterMethod(value: unknown): NonNullable<OnsenCandidate['waterProfile']>['canonicalMethod'] {
  if (value === 'kakenagashi_pure' || value === 'kakenagashi' || value === 'junkan') return value;
  return null;
}

function normalizeWaterConditionCodes(value: unknown) {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  if (!isRecord(value)) return [];

  return Object.entries(value)
    .filter(([, status]) => {
      if (typeof status !== 'string') return false;
      return status.startsWith('confirmed');
    })
    .map(([key]) => key);
}

function normalizeWaterTextureFilters(value: unknown): NonNullable<OnsenCandidate['waterProfile']>['textureFilters'] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!isRecord(item)) return null;
      const code = typeof item.code === 'string' ? item.code.trim() : '';
      const label = typeof item.ui_label_ko === 'string' ? item.ui_label_ko.trim() : '';
      if (!code || !label) return null;

      return {
        code,
        label,
        exposureStatus: typeof item.exposure_status === 'string' ? item.exposure_status : undefined,
        mentionCount: normalizeNumber(item.direct_review_mention_count),
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}

function normalizeWaterColorFilter(value: unknown): NonNullable<OnsenCandidate['waterProfile']>['colorFilter'] | undefined {
  if (!isRecord(value)) return undefined;
  const code = typeof value.filter_candidate === 'string' ? value.filter_candidate.trim() : '';
  const label = typeof value.detail_label_ko === 'string' ? value.detail_label_ko.trim() : '';
  if (!code || !label) return undefined;

  return {
    code,
    label,
    status: typeof value.status === 'string' ? value.status : undefined,
    exposeAsFilter: value.expose_as_filter === true,
  };
}

function normalizeWaterProfile(counts: OnsenEvidenceCounts | null | undefined): OnsenCandidate['waterProfile'] | undefined {
  const waterJudgment = isRecord(counts?.waterJudgment) ? counts.waterJudgment : null;
  const sensoryJudgment = isRecord(counts?.waterSensoryJudgment) ? counts.waterSensoryJudgment : null;
  if (!waterJudgment && !sensoryJudgment) return undefined;

  const canonicalMethod = normalizeWaterMethod(waterJudgment?.canonical_water_method);
  const conditionCodes = normalizeWaterConditionCodes(waterJudgment?.conditions);
  const conditionLabels = normalizeStringArray(waterJudgment?.condition_labels_ko).filter((label) => label !== '조건 없음');
  const textureFilters = normalizeWaterTextureFilters(sensoryJudgment?.texture_filters);
  const colorFilter = normalizeWaterColorFilter(sensoryJudgment?.official_color);

  return {
    canonicalMethod,
    label: typeof waterJudgment?.ui_label_ko === 'string' ? waterJudgment.ui_label_ko : undefined,
    badgeGate: typeof waterJudgment?.badge_gate === 'string' ? waterJudgment.badge_gate : undefined,
    conditionCodes,
    conditionLabels,
    textureFilters,
    colorFilter,
  };
}

function shouldExposeTextureFilter(filter: NonNullable<OnsenCandidate['waterProfile']>['textureFilters'][number]) {
  return filter.exposureStatus === 'candidate_with_count' && typeof filter.mentionCount === 'number' && filter.mentionCount > 0;
}

function shouldExposeColorFilter(filter: NonNullable<OnsenCandidate['waterProfile']>['colorFilter']) {
  if (!filter) return false;
  if (filter.exposeAsFilter) return true;
  return filter.status === 'confirmed' || filter.status === 'official_confirmed' || filter.status === 'filter_ready';
}

function waterContextsFromProfile(profile: OnsenCandidate['waterProfile'] | undefined, notes: string[]) {
  const water = new Set<OnsenWaterCriterion>();
  const method = profile?.canonicalMethod;

  if (method === 'kakenagashi_pure') {
    water.add('kakenagashi_pure');
    water.add('kakenagashi');
  } else if (method === 'kakenagashi') {
    water.add('kakenagashi');
  } else if (method === 'junkan') {
    water.add('junkan');
  }

  for (const filter of profile?.textureFilters ?? []) {
    if (shouldExposeTextureFilter(filter)) {
      if (filter.code === 'slippery' || filter.code === 'salt_warmth' || filter.code === 'sulfur' || filter.code === 'carbonated') {
        water.add(filter.code);
      }
    }
  }

  const colorFilter = profile?.colorFilter;
  if (shouldExposeColorFilter(colorFilter)) {
    if (colorFilter?.code === 'hakutaku' || colorFilter?.code === 'brown') water.add(colorFilter.code);
  }

  if (profile?.conditionCodes.some((code) => code === 'kasui' || code === 'kaon') || notes.some((note) => /물을 섞어|온도 조정|가온|가수/.test(note))) {
    water.add('temperature_adjustment');
  }

  return [...water];
}

function operationLabelFromProfile(profile: OnsenCandidate['waterProfile'] | undefined, fallback: string) {
  if (profile?.canonicalMethod === 'kakenagashi_pure') return '순수직수';
  if (profile?.canonicalMethod === 'kakenagashi') return '직수';
  if (profile?.canonicalMethod === 'junkan') return '순환식 온천';
  if (profile) return '원천 방식 이용 전 확인';
  return fallback;
}

function springTypeLabelFromProfile(profile: OnsenCandidate['waterProfile'] | undefined, fallback: string) {
  if (profile?.canonicalMethod === 'kakenagashi_pure') return '순수직수';
  if (profile?.canonicalMethod === 'kakenagashi') return '직수';
  if (profile?.canonicalMethod === 'junkan') return '순환식 온천';
  if (profile) return '온천수 확인';
  return fallback;
}

function buildTags(row: OnsenAccommodationRow, notes: string[]) {
  const tags = new Set<string>();
  const primaryBath = row.primary_bath ?? '';
  const summary = row.summary ?? '';
  const counts = row.evidence_counts ?? {};

  if (row.bath_scope === 'all_rooms' || row.bath_scope === 'some_rooms' || row.bath_scope === 'room_signal_only' || /객실|전 객실/.test(primaryBath)) {
    tags.add('room-bath');
  }
  if (/대절탕|전세|프라이빗/.test(primaryBath) || notes.some((note) => note.includes('대절탕')) || (counts.privateBathMentionCount ?? 0) > 0) {
    tags.add('private-bath');
  }
  if (row.bath_scope === 'public_bath_only' || /대욕장|공용 온천/.test(primaryBath) || (counts.publicBathMentionCount ?? 0) > 0) {
    tags.add('public-bath');
  }
  if (/부드럽|매끈|수질|피부감|온천감/.test(summary) || (counts.waterTextureMentionCount ?? 0) > 0) {
    tags.add('water-texture');
  }
  if (notes.some((note) => note.includes('겨울')) || /겨울|춥|추위/.test(summary)) {
    tags.add('winter-caution');
  }

  return [...tags];
}

function createFit(row: OnsenAccommodationRow, tags: string[]) {
  const fit: string[] = [];
  if (tags.includes('room-bath')) fit.push('객실 안에서 온천을 끝내고 싶음');
  if (tags.includes('private-bath')) fit.push('대절탕을 따로 쓰고 싶음');
  if (tags.includes('public-bath')) fit.push('대욕장이나 큰 노천탕을 먼저 봄');
  if (tags.includes('water-texture')) fit.push('온천수 느낌까지 확인하고 싶음');
  if (fit.length === 0) fit.push('온천 구성을 먼저 확인하고 싶음');
  return fit.slice(0, 3);
}

function createNotice(row: OnsenAccommodationRow, notes: string[]) {
  if (notes.some((note) => note.includes('겨울'))) return '겨울 이용이라면 노천탕 온도와 동선을 함께 확인하세요.';
  if (notes.some((note) => note.includes('벌레') || note.includes('자연물'))) return '노천탕은 계절에 따라 벌레나 자연물 유입이 있을 수 있습니다.';
  if (notes.some((note) => note.includes('대절탕'))) return '대절탕은 예약제나 선착순 조건을 확인하세요.';
  if (row.water_use_status === 'needs_official_check' || row.water_source_type === 'needs_check') return '온천수 사용 범위는 상세 조건에서 다시 확인하세요.';
  return undefined;
}

function mapLocation(row: OnsenAccommodationRow): OnsenLocation {
  const fallback = getDefaultOnsenLocation(row.onsen_area ?? row.region, row.area);
  const regionGroup = row.region_group ?? fallback.regionGroup;
  const prefecture = row.prefecture ?? fallback.prefecture;
  const city = row.city ?? fallback.city;
  const onsenArea = row.onsen_area ?? fallback.onsenArea;
  const regionGroupLabel = getOnsenRegionGroupLabel(regionGroup);
  const prefectureLabel = getOnsenPrefectureLabel(prefecture);
  const cityLabel = getOnsenCityLabel(city);
  const onsenAreaLabel = getOnsenAreaLabel(onsenArea);

  return {
    country: row.country === 'JP' ? 'JP' : fallback.country,
    regionGroup: fallback.regionGroup === regionGroup ? fallback.regionGroup : (regionGroup as OnsenLocation['regionGroup']),
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

function operationDetailLabel(operation: string, notes: string[]) {
  const base =
    operation === '원천 방식 이용 전 확인'
      ? '온천수 사용은 확인했지만, 원천 100% 직수인지 재사용 온천인지는 추가 확인이 필요합니다.'
      : operation === '원천 100% 직수' || operation === '직수' || operation === '순수직수'
        ? '원천을 흘려보내는 방식으로 정리했습니다.'
      : operation === '순환식 온천'
        ? '온천수를 순환·여과해 쓰는 방식으로 정리했습니다.'
      : `${operation}으로 정리했습니다.`;
  if (notes.length === 0) return `${base} 객실 타입과 플랜별 세부 조건을 함께 확인합니다.`;
  const noteText = notes
    .map((note) => note.trim())
    .filter(Boolean)
    .map((note) => (/[.!?。]$/.test(note) ? note : `${note}.`))
    .join(' ');
  return `${base} ${noteText}`;
}

function operationStatusFor(sourceType: OnsenWaterSourceType, profile?: OnsenCandidate['waterProfile']): OnsenStatus {
  if (profile?.canonicalMethod) return 'confirmed';
  if (profile) return 'needs_check';
  if (sourceType === 'free_flowing_source' || sourceType === 'natural_100') return 'confirmed';
  return 'needs_check';
}

function publicBathFact(tags: string[], primaryBath: string) {
  if (tags.includes('public-bath')) {
    return {
      value: '대욕장/공용 온천 있음',
      status: 'confirmed' as OnsenStatus,
      detail: '대욕장 또는 공용 온천 구성이 확인됩니다.',
    };
  }

  if (/객실|프라이빗|전 객실|노천/.test(primaryBath)) {
    return {
      value: '예약 시 확인: 대욕장 운영 여부',
      status: 'needs_check' as OnsenStatus,
      detail: '현재 정리된 핵심은 객실 내 프라이빗탕입니다. 대욕장 이용을 원하면 숙소 시설 안내를 확인하세요.',
    };
  }

  return {
    value: '예약 시 확인: 대욕장 운영 여부',
    status: 'needs_check' as OnsenStatus,
    detail: '대욕장 운영 여부는 객실 타입이나 플랜보다 숙소 시설 안내에서 확인하는 항목입니다.',
  };
}

function privateBathFact(tags: string[], primaryBath: string) {
  if (tags.includes('private-bath')) {
    return {
      value: '대절탕 있음',
      status: 'confirmed' as OnsenStatus,
      detail: '대절탕은 객실 내 프라이빗탕과 별도로 운영 조건을 확인하는 항목입니다.',
    };
  }

  if (/객실|프라이빗|전 객실|노천/.test(primaryBath)) {
    return {
      value: '예약 시 확인: 대절탕 운영 여부',
      status: 'needs_check' as OnsenStatus,
      detail: '현재 정리된 핵심은 객실 내 프라이빗탕입니다. 대절탕 이용을 원하면 별도 운영 여부를 확인하세요.',
    };
  }

  return {
    value: '예약 시 확인: 대절탕 운영 여부',
    status: 'needs_check' as OnsenStatus,
    detail: '대절탕은 예약제, 선착순, 유료 운영 여부가 달라질 수 있어 숙소 안내에서 확인합니다.',
  };
}

function sourceNoteFor(row: OnsenAccommodationRow, verdict?: OnsenVerdict) {
  const briefing = verdict?.briefing;
  if (briefing) {
    const parts = [
      typeof briefing.experiencesRead === 'number' ? `직접 읽은 이용 경험 ${briefing.experiencesRead}건` : null,
      typeof briefing.onsenRelated === 'number' ? `온천 관련 ${briefing.onsenRelated}건` : null,
      typeof briefing.platformCount === 'number'
        ? `본문 확인 플랫폼 ${briefing.platformCount}개`
        : briefing.platforms.length > 0
          ? `본문 확인 플랫폼 ${briefing.platforms.length}개`
          : null,
    ].filter(Boolean);

    if (parts.length > 0) return parts.join(', ');
  }

  return row.evidence_note ?? '공식 안내와 이용 조건을 바탕으로 정리했습니다.';
}

function mapOnsenAccommodation(row: OnsenAccommodationRow, verdict?: OnsenVerdict): OnsenCandidate {
  const notes = Array.isArray(row.operation_notes) ? row.operation_notes : [];
  const counts = row.evidence_counts ?? {};
  const waterProfile = normalizeWaterProfile(counts);
  const tags = buildTags(row, notes);
  const operation = operationLabelFromProfile(waterProfile, operationLabel(row.water_source_type, notes));
  const roomBath = roomBathLabel(row.bath_scope);
  const springType = springTypeLabelFromProfile(waterProfile, springTypeLabel(row.water_use_status, row.water_source_type));
  const updatedAt = row.content_updated_at ?? row.updated_at?.slice(0, 10) ?? '';
  const operationDetail = operationDetailLabel(operation, notes);
  const cautionCount = counts.cautionMentionCount ?? 0;
  const publicBath = publicBathFact(tags, row.primary_bath ?? '');
  const privateBath = privateBathFact(tags, row.primary_bath ?? '');

  const candidate: OnsenCandidate = {
    entityType: 'accommodation',
    slug: row.slug,
    name: row.display_name_ko?.trim() || row.name,
    jaName: row.name_ja?.trim() || row.ja_name || '',
    area: row.area ?? row.region,
    region: row.region,
    location: mapLocation(row),
    summary: row.summary,
    fit: createFit(row, tags),
    primaryBath: row.primary_bath ?? '온천 구성 예약 전 확인',
    waterDecision: {
      label: '온천수 확인',
      summary: row.summary,
      springType,
      roomBath,
      operation,
      notice: createNotice(row, notes),
    },
    waterProfile,
    dataQuality: row.evidence_grade ?? 'D',
    directReviews: counts.directReviewCount ?? 0,
    onsenReviews: counts.onsenReviewCount ?? 0,
    updatedAt,
    tags,
    badges: [
      { label: springType, status: statusFor(row.water_source_type) },
      { label: roomBath, status: statusFor(row.bath_scope) },
      ...(createNotice(row, notes) ? [{ label: '확인할 점 있음', status: 'attention' as OnsenStatus }] : []),
    ],
    facts: [
      {
        label: '객실 내 프라이빗탕',
        value: roomBath,
        status: statusFor(row.bath_scope),
        detail: row.bath_scope === 'public_bath_only' ? '객실 내 프라이빗탕보다 공용 온천 시설을 중심으로 보는 숙소입니다.' : `${roomBath}으로 정리됩니다.`,
      },
      {
        label: '대욕장',
        value: publicBath.value,
        status: publicBath.status,
        detail: publicBath.detail,
      },
      {
        label: '대절탕',
        value: privateBath.value,
        status: privateBath.status,
        detail: privateBath.detail,
      },
      {
        label: '온천수 방식',
        value: operation,
        status: operationStatusFor(row.water_source_type, waterProfile),
        detail: operationDetail,
      },
    ],
    signals: [
      { label: '객실 내 프라이빗탕', count: counts.roomBathMentionCount ?? 0, status: tags.includes('room-bath') ? 'review_signal' : 'needs_check', summary: roomBath },
      { label: '대욕장', count: counts.publicBathMentionCount ?? 0, status: tags.includes('public-bath') ? 'review_signal' : 'needs_check', summary: row.primary_bath ?? '예약 전 확인' },
      { label: '수질', count: counts.waterTextureMentionCount ?? 0, status: tags.includes('water-texture') ? 'review_signal' : 'needs_check', summary: springType },
    ],
    cautions: [
      {
        issue: createNotice(row, notes) ? '이용 전 확인' : '예약 전 확인',
        count: cautionCount,
        summary: createNotice(row, notes) ?? '객실 타입과 온천수 사용 범위를 함께 확인하세요.',
      },
    ],
    sources: [
      {
        label: '온천 정보 정리',
        direct: counts.directReviewCount ?? 0,
        onsenRelated: counts.onsenReviewCount ?? 0,
        note: sourceNoteFor(row, verdict),
      },
    ],
    officialLinks: [],
    verdict,
  };

  return {
    ...candidate,
    contexts: normalizeOnsenContexts(
      {
        travel: row.travel_contexts,
        bath: row.bath_contexts,
        water: [...normalizeStringArray(row.water_criteria), ...waterContextsFromProfile(waterProfile, notes)],
      },
      deriveOnsenContexts(candidate)
    ),
  };
}

async function readPublishedOnsenVerdicts(
  config: NonNullable<ReturnType<typeof readSupabaseServerConfig>>,
  slugs: string[],
  targetType: 'accommodation' | 'facility'
) {
  if (slugs.length === 0) return new Map<string, OnsenVerdict>();

  const url = new URL(`${config.restUrl}/onsen_verdicts`);
  url.searchParams.set('select', 'target_slug,level,headline,briefing,items,fact_statuses,verified_at');
  url.searchParams.set('target_type', `eq.${targetType}`);
  url.searchParams.set('status', 'eq.published');
  url.searchParams.set('target_slug', `in.(${slugs.map((slug) => `"${slug}"`).join(',')})`);

  try {
    const response = await fetch(url, {
      headers: {
        apikey: config.apiKey,
        authorization: `Bearer ${config.apiKey}`,
      },
      next: { revalidate: 60, tags: ['onsen-verdicts'] },
    });

    if (!response.ok) return new Map<string, OnsenVerdict>();

    const rows = (await response.json()) as OnsenVerdictRow[];
    return new Map(
      rows
        .map((row) => [row.target_slug, normalizeVerdict(row)] as const)
        .filter((entry): entry is readonly [string, OnsenVerdict] => Boolean(entry[1]))
    );
  } catch {
    return new Map<string, OnsenVerdict>();
  }
}

export async function readOnsenCandidates(): Promise<OnsenCandidate[]> {
  const config = readSupabaseServerConfig();
  if (!config) return onsenCandidates.map(enrichOnsenCandidate);

  const url = new URL(`${config.restUrl}/onsen_accommodations`);
  url.searchParams.set(
    'select',
    'slug,name,ja_name,display_name_ko,name_ja,name_en,name_romaji,aliases_ko,aliases_ja,aliases_en,name_verification_status,name_source_note,region,area,country,region_group,prefecture,city,onsen_area,travel_contexts,bath_contexts,water_criteria,summary,primary_bath,water_use_status,water_source_type,bath_scope,operation_notes,evidence_counts,evidence_grade,evidence_note,status,content_updated_at,updated_at'
  );
  url.searchParams.set('status', 'eq.active');
  url.searchParams.set('order', 'region.asc,display_name_ko.asc,name.asc');

  let accommodations: OnsenCandidate[];
  try {
    const response = await fetch(url, {
      headers: {
        apikey: config.apiKey,
        authorization: `Bearer ${config.apiKey}`,
      },
      next: { revalidate: 60, tags: ['onsen-accommodations'] },
    });

    if (!response.ok) throw new Error(`onsen_accommodations read failed: ${response.status}`);

    const rows = (await response.json()) as OnsenAccommodationRow[];
    if (rows.length === 0) {
      accommodations = onsenCandidates.map(enrichOnsenCandidate);
    } else {
      const verdictsBySlug = await readPublishedOnsenVerdicts(
        config,
        rows.map((row) => row.slug),
        'accommodation'
      );
      accommodations = rows.map((row) => mapOnsenAccommodation(row, verdictsBySlug.get(row.slug)));
    }
  } catch {
    accommodations = onsenCandidates.map(enrichOnsenCandidate);
  }

  const facilities = await readActiveOnsenFacilityCandidates(config);
  const facilityVerdictsBySlug = await readPublishedOnsenVerdicts(
    config,
    facilities.map((facility) => facility.slug),
    'facility'
  );
  const facilitiesWithVerdicts = facilities.map((facility) => {
    const verdict = facilityVerdictsBySlug.get(facility.slug);
    if (!verdict) return facility;
    const platformCount = verdict.briefing.platformCount ?? verdict.briefing.platforms.length;
    const verdictCautions = verdict.items
      .filter((item) => item.type !== 'positive')
      .map((item) => ({
        issue: item.chipLabel ?? '이용 전 확인',
        count: item.counts.mentions,
        summary: item.verdict,
      }));

    return {
      ...facility,
      verdict,
      cautions: verdictCautions.length > 0 ? verdictCautions : facility.cautions,
      sources: facility.sources.map((source) =>
        source.label === '시설 이용 경험'
          ? {
              ...source,
              note: `직접 읽은 시설 관련 이용 경험 ${verdict.briefing.experiencesRead ?? facility.directReviews}건 · 본문 확인 플랫폼 ${platformCount}개입니다. 플랫폼 노출 리뷰 수는 합산하지 않았습니다.`,
            }
          : source
      ),
    };
  });
  return [...accommodations, ...facilitiesWithVerdicts];
}

export async function readOnsenCandidate(slug: string): Promise<OnsenCandidate | undefined> {
  const candidates = await readOnsenCandidates();
  return candidates.find((candidate) => candidate.slug === slug);
}
