import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { onsenCandidates, type OnsenCandidate, type OnsenStatus } from './onsenCatalog';
import {
  deriveOnsenContexts,
  enrichOnsenCandidate,
  getDefaultOnsenLocation,
  getOnsenAreaLabel,
  getOnsenCityLabel,
  getOnsenPrefectureLabel,
  getOnsenRegionGroupLabel,
  normalizeOnsenContexts,
  type OnsenLocation,
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
};

type OnsenAccommodationRow = {
  slug: string;
  name: string;
  ja_name: string | null;
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
  const serviceKey = env.CONTENT_DB_SERVICE_ROLE_KEY?.trim();

  if (!restUrl || !serviceKey) return null;

  return {
    restUrl: restUrl.replace(/\/+$/, ''),
    serviceKey,
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
  if (sourceType === 'natural_100') return '100% 천연온천';
  if (sourceType === 'free_flowing_source') return '직수 온천';
  if (status === 'official_confirmed' || sourceType === 'hot_spring_confirmed') return '온천수 확인';
  if (status === 'review_supported') return '온천수 참고 확인';
  return '온천수 확인 필요';
}

function roomBathLabel(scope: OnsenBathScope) {
  if (scope === 'all_rooms') return '전 객실 온천탕';
  if (scope === 'some_rooms') return '일부 객실 온천탕';
  if (scope === 'room_signal_only') return '객실탕 조건 확인';
  if (scope === 'public_bath_only') return '공용탕 중심';
  return '확인 필요';
}

function operationLabel(sourceType: OnsenWaterSourceType, notes: string[]) {
  if (notes.some((note) => note.includes('순환') || note.includes('여과'))) return '재사용 온천(순환식)';
  if (sourceType === 'free_flowing_source') return '직수 온천';
  if (sourceType === 'natural_100') return '천연온천';
  if (sourceType === 'hot_spring_confirmed') return '온천수 확인';
  return notes[0] ?? '확인 필요';
}

function buildTags(row: OnsenAccommodationRow, notes: string[]) {
  const tags = new Set<string>();
  const primaryBath = row.primary_bath ?? '';
  const summary = row.summary ?? '';
  const counts = row.evidence_counts ?? {};

  if (row.bath_scope === 'all_rooms' || row.bath_scope === 'some_rooms' || row.bath_scope === 'room_signal_only' || /객실|전 객실/.test(primaryBath)) {
    tags.add('room-bath');
  }
  if (/가족탕|대절탕|대여탕|전세|프라이빗/.test(primaryBath) || notes.some((note) => note.includes('대절탕')) || (counts.privateBathMentionCount ?? 0) > 0) {
    tags.add('private-bath');
  }
  if (row.bath_scope === 'public_bath_only' || /대욕장|공용탕/.test(primaryBath) || (counts.publicBathMentionCount ?? 0) > 0) {
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
  if (tags.includes('private-bath')) fit.push('가족탕/대절탕을 따로 쓰고 싶음');
  if (tags.includes('public-bath')) fit.push('대욕장이나 큰 노천탕을 먼저 봄');
  if (tags.includes('water-texture')) fit.push('온천수 느낌까지 확인하고 싶음');
  if (fit.length === 0) fit.push('온천 구성을 먼저 확인하고 싶음');
  return fit.slice(0, 3);
}

function createNotice(row: OnsenAccommodationRow, notes: string[]) {
  if (notes.some((note) => note.includes('겨울'))) return '겨울 이용이라면 노천탕 온도와 동선을 함께 확인하세요.';
  if (notes.some((note) => note.includes('벌레') || note.includes('자연물'))) return '노천탕은 계절에 따라 벌레나 자연물 유입이 있을 수 있습니다.';
  if (notes.some((note) => note.includes('대절탕'))) return '가족탕/대절탕은 예약제나 선착순 조건을 확인하는 편이 좋습니다.';
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
    display: `${regionGroupLabel} · ${prefectureLabel} · ${onsenAreaLabel}`,
  };
}

function mapOnsenAccommodation(row: OnsenAccommodationRow): OnsenCandidate {
  const notes = Array.isArray(row.operation_notes) ? row.operation_notes : [];
  const tags = buildTags(row, notes);
  const operation = operationLabel(row.water_source_type, notes);
  const roomBath = roomBathLabel(row.bath_scope);
  const springType = springTypeLabel(row.water_use_status, row.water_source_type);
  const counts = row.evidence_counts ?? {};
  const updatedAt = row.content_updated_at ?? row.updated_at?.slice(0, 10) ?? '';
  const operationDetail = notes.length > 0 ? `${operation}. ${notes.join(', ')} 조건을 함께 봅니다.` : `${operation}. 상세 조건에서 온천수 운용을 확인합니다.`;
  const cautionCount = counts.cautionMentionCount ?? 0;

  const candidate: OnsenCandidate = {
    slug: row.slug,
    name: row.name,
    jaName: row.ja_name ?? '',
    area: row.area ?? row.region,
    region: row.region,
    location: mapLocation(row),
    summary: row.summary,
    fit: createFit(row, tags),
    primaryBath: row.primary_bath ?? '온천 구성 확인 필요',
    waterDecision: {
      label: '온천수 확인',
      summary: row.summary,
      springType,
      roomBath,
      operation,
      notice: createNotice(row, notes),
    },
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
        label: '객실탕',
        value: roomBath,
        status: statusFor(row.bath_scope),
        detail: row.bath_scope === 'public_bath_only' ? '객실탕보다 공용 온천 시설을 중심으로 보는 숙소입니다.' : `${roomBath}으로 정리됩니다.`,
      },
      {
        label: '대욕장',
        value: tags.includes('public-bath') ? '확인됨' : '조건 확인',
        status: tags.includes('public-bath') ? 'confirmed' : 'needs_check',
        detail: tags.includes('public-bath') ? '대욕장 또는 공용탕 구성이 확인됩니다.' : '대욕장 중심으로 볼 숙소인지는 추가 확인이 필요합니다.',
      },
      {
        label: '가족탕',
        value: tags.includes('private-bath') ? '확인됨' : '조건 확인',
        status: tags.includes('private-bath') ? 'confirmed' : 'needs_check',
        detail: tags.includes('private-bath') ? '가족탕/대절탕 조건을 함께 볼 수 있습니다.' : '가족탕/대절탕 유무는 상세 조건에서 확인하세요.',
      },
      {
        label: '온천 운용',
        value: operation,
        status: statusFor(row.water_source_type),
        detail: operationDetail,
      },
    ],
    signals: [
      { label: '객실탕', count: counts.roomBathMentionCount ?? 0, status: tags.includes('room-bath') ? 'review_signal' : 'needs_check', summary: roomBath },
      { label: '대욕장', count: counts.publicBathMentionCount ?? 0, status: tags.includes('public-bath') ? 'review_signal' : 'needs_check', summary: row.primary_bath ?? '확인 필요' },
      { label: '수질', count: counts.waterTextureMentionCount ?? 0, status: tags.includes('water-texture') ? 'review_signal' : 'needs_check', summary: springType },
    ],
    cautions: [
      {
        issue: createNotice(row, notes) ? '이용 전 확인' : '상세 조건 확인',
        count: cautionCount,
        summary: createNotice(row, notes) ?? '객실 타입과 온천수 사용 범위를 함께 확인하는 편이 좋습니다.',
      },
    ],
    sources: [
      {
        label: '온천 정보 정리',
        direct: counts.directReviewCount ?? 0,
        onsenRelated: counts.onsenReviewCount ?? 0,
        note: row.evidence_note ?? '공식 안내와 이용 조건을 바탕으로 정리했습니다.',
      },
    ],
    officialLinks: [],
  };

  return {
    ...candidate,
    contexts: normalizeOnsenContexts(
      {
        travel: row.travel_contexts,
        bath: row.bath_contexts,
        water: row.water_criteria,
      },
      deriveOnsenContexts(candidate)
    ),
  };
}

export async function readOnsenCandidates(): Promise<OnsenCandidate[]> {
  const config = readSupabaseServerConfig();
  if (!config) return onsenCandidates.map(enrichOnsenCandidate);

  const url = new URL(`${config.restUrl}/onsen_accommodations`);
  url.searchParams.set(
    'select',
    'slug,name,ja_name,region,area,country,region_group,prefecture,city,onsen_area,travel_contexts,bath_contexts,water_criteria,summary,primary_bath,water_use_status,water_source_type,bath_scope,operation_notes,evidence_counts,evidence_grade,evidence_note,status,content_updated_at,updated_at'
  );
  url.searchParams.set('status', 'neq.retired');
  url.searchParams.set('order', 'region.asc,name.asc');

  try {
    const response = await fetch(url, {
      headers: {
        apikey: config.serviceKey,
        authorization: `Bearer ${config.serviceKey}`,
      },
      next: { revalidate: 60, tags: ['onsen-accommodations'] },
    });

    if (!response.ok) return onsenCandidates.map(enrichOnsenCandidate);

    const rows = (await response.json()) as OnsenAccommodationRow[];
    if (rows.length === 0) return onsenCandidates.map(enrichOnsenCandidate);
    return rows.map(mapOnsenAccommodation);
  } catch {
    return onsenCandidates.map(enrichOnsenCandidate);
  }
}

export async function readOnsenCandidate(slug: string): Promise<OnsenCandidate | undefined> {
  const candidates = await readOnsenCandidates();
  return candidates.find((candidate) => candidate.slug === slug);
}
