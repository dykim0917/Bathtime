import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { readAdminPostgrestSessionConfig, readPostgrestRows } from '../data/postgrest';
import { getRefinedOnsenSeedSummary } from './seedCopy';

export type OnsenAdminStatus = 'active' | 'draft' | 'paused' | 'retired';
export type OnsenWaterUseStatus = 'official_confirmed' | 'review_supported' | 'needs_official_check' | 'unclear';
export type OnsenWaterSourceType = 'natural_100' | 'free_flowing_source' | 'hot_spring_confirmed' | 'needs_check';
export type OnsenBathScope = 'all_rooms' | 'some_rooms' | 'room_signal_only' | 'public_bath_only' | 'unclear';
export type OnsenRegionGroup = 'kyushu' | 'kanto' | 'kansai' | 'hokkaido' | 'tohoku' | 'chubu' | 'chugoku_shikoku';
export type OnsenTravelContext = 'ryokan_stay' | 'day_trip' | 'city_bath' | 'hotel_public_bath';
export type OnsenBathContext = 'room_bath' | 'private_bath' | 'public_bath';
export type OnsenWaterCriterion = 'direct_source' | 'natural_100' | 'spring_confirmed' | 'water_texture' | 'temperature_adjustment' | 'winter_caution';

export interface OnsenEvidenceCounts {
  directReviewCount: number | null;
  onsenReviewCount: number | null;
  roomBathMentionCount: number | null;
  publicBathMentionCount: number | null;
  privateBathMentionCount: number | null;
  waterTextureMentionCount: number | null;
  cautionMentionCount: number | null;
}

export interface AdminOnsenAccommodation {
  slug: string;
  name: string;
  jaName?: string;
  region: string;
  area: string;
  country: string;
  regionGroup: OnsenRegionGroup;
  prefecture: string;
  city: string;
  onsenArea: string;
  travelContexts: OnsenTravelContext[];
  bathContexts: OnsenBathContext[];
  waterCriteria: OnsenWaterCriterion[];
  summary: string;
  primaryBath: string;
  waterUseStatus: OnsenWaterUseStatus;
  waterSourceType: OnsenWaterSourceType;
  bathScope: OnsenBathScope;
  operationNotes: string[];
  evidenceCounts: OnsenEvidenceCounts;
  evidenceGrade: 'A' | 'B' | 'C' | 'D';
  evidenceNote: string;
  status: OnsenAdminStatus;
  updatedAt: string;
  sourceFile?: string;
  source: 'database' | 'seed';
}

export interface OnsenAccommodationRecord {
  slug: string;
  name: string;
  ja_name: string | null;
  region: string;
  area: string | null;
  country: string | null;
  region_group: string | null;
  prefecture: string | null;
  city: string | null;
  onsen_area: string | null;
  travel_contexts: unknown;
  bath_contexts: unknown;
  water_criteria: unknown;
  summary: string;
  primary_bath: string | null;
  water_use_status: string;
  water_source_type: string;
  bath_scope: string;
  operation_notes: unknown;
  evidence_counts: Partial<OnsenEvidenceCounts> | null;
  evidence_grade: string | null;
  evidence_note: string | null;
  status: string;
  source_file: string | null;
  content_updated_at: string | null;
  updated_at: string | null;
}

export const onsenStatusLabels: Record<OnsenAdminStatus, string> = {
  active: '공개',
  draft: '초안',
  paused: '일시중지',
  retired: '보관',
};

export const waterUseStatusLabels: Record<OnsenWaterUseStatus, string> = {
  official_confirmed: '공식 확인',
  review_supported: '후기 참고',
  needs_official_check: '공식 확인 필요',
  unclear: '정보 부족',
};

export const waterSourceTypeLabels: Record<OnsenWaterSourceType, string> = {
  natural_100: '100% 천연온천',
  free_flowing_source: '직수 온천',
  hot_spring_confirmed: '온천수 확인',
  needs_check: '확인 필요',
};

export const bathScopeLabels: Record<OnsenBathScope, string> = {
  all_rooms: '전 객실',
  some_rooms: '일부 객실',
  room_signal_only: '후기 참고',
  public_bath_only: '공용탕 중심',
  unclear: '확인 필요',
};

export const regionGroupLabels: Record<OnsenRegionGroup, string> = {
  kyushu: '규슈',
  kanto: '간토',
  kansai: '간사이',
  hokkaido: '홋카이도',
  tohoku: '도호쿠',
  chubu: '주부',
  chugoku_shikoku: '주고쿠/시코쿠',
};

export const travelContextLabels: Record<OnsenTravelContext, string> = {
  ryokan_stay: '료칸 숙박',
  day_trip: '당일온천',
  city_bath: '도심 대욕장',
  hotel_public_bath: '호텔 대욕장',
};

export const bathContextLabels: Record<OnsenBathContext, string> = {
  room_bath: '객실탕 중심',
  private_bath: '가족탕/대절탕 있음',
  public_bath: '대욕장 중심',
};

export const waterCriterionLabels: Record<OnsenWaterCriterion, string> = {
  direct_source: '직수 온천',
  natural_100: '100% 천연온천',
  spring_confirmed: '온천수 확인',
  water_texture: '부드러운 물 느낌',
  temperature_adjustment: '온도 조정 확인',
  winter_caution: '겨울 주의',
};

const onsenStatuses = Object.keys(onsenStatusLabels) as OnsenAdminStatus[];
const waterUseStatuses = Object.keys(waterUseStatusLabels) as OnsenWaterUseStatus[];
const waterSourceTypes = Object.keys(waterSourceTypeLabels) as OnsenWaterSourceType[];
const bathScopes = Object.keys(bathScopeLabels) as OnsenBathScope[];
const regionGroups = Object.keys(regionGroupLabels) as OnsenRegionGroup[];
const travelContexts = Object.keys(travelContextLabels) as OnsenTravelContext[];
const bathContexts = Object.keys(bathContextLabels) as OnsenBathContext[];
const waterCriteria = Object.keys(waterCriterionLabels) as OnsenWaterCriterion[];

const reportPriority = [
  'agoda_enriched',
  'enriched',
  'curated',
  'review_signal_summary_',
  'prelim',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeStatus(value: string | null | undefined): OnsenAdminStatus {
  return onsenStatuses.includes(value as OnsenAdminStatus) ? (value as OnsenAdminStatus) : 'draft';
}

function normalizeWaterUseStatus(value: string | null | undefined): OnsenWaterUseStatus {
  return waterUseStatuses.includes(value as OnsenWaterUseStatus) ? (value as OnsenWaterUseStatus) : 'unclear';
}

function normalizeWaterSourceType(value: string | null | undefined): OnsenWaterSourceType {
  return waterSourceTypes.includes(value as OnsenWaterSourceType) ? (value as OnsenWaterSourceType) : 'needs_check';
}

function normalizeBathScope(value: string | null | undefined): OnsenBathScope {
  return bathScopes.includes(value as OnsenBathScope) ? (value as OnsenBathScope) : 'unclear';
}

function normalizeRegionGroup(value: string | null | undefined): OnsenRegionGroup {
  return regionGroups.includes(value as OnsenRegionGroup) ? (value as OnsenRegionGroup) : 'kyushu';
}

function normalizeStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function normalizeEnumList<T extends string>(value: unknown, allowedValues: readonly T[], fallback: T[]): T[] {
  const allowed = new Set(allowedValues);
  const normalized = normalizeStringList(value).filter((item): item is T => allowed.has(item as T));
  return normalized.length > 0 ? normalized : fallback;
}

function normalizeEvidenceCounts(value: Partial<OnsenEvidenceCounts> | null | undefined): OnsenEvidenceCounts {
  return {
    directReviewCount: normalizeNullableNumber(value?.directReviewCount),
    onsenReviewCount: normalizeNullableNumber(value?.onsenReviewCount),
    roomBathMentionCount: normalizeNullableNumber(value?.roomBathMentionCount),
    publicBathMentionCount: normalizeNullableNumber(value?.publicBathMentionCount),
    privateBathMentionCount: normalizeNullableNumber(value?.privateBathMentionCount),
    waterTextureMentionCount: normalizeNullableNumber(value?.waterTextureMentionCount),
    cautionMentionCount: normalizeNullableNumber(value?.cautionMentionCount),
  };
}

function normalizeNullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function normalizeGrade(value: string | null | undefined): 'A' | 'B' | 'C' | 'D' {
  return value === 'A' || value === 'B' || value === 'C' || value === 'D' ? value : 'D';
}

export function mapOnsenAccommodationRecord(row: OnsenAccommodationRecord): AdminOnsenAccommodation {
  return {
    slug: row.slug,
    name: row.name,
    jaName: row.ja_name ?? undefined,
    region: row.region,
    area: row.area ?? row.region,
    country: row.country ?? 'JP',
    regionGroup: normalizeRegionGroup(row.region_group),
    prefecture: row.prefecture ?? 'oita',
    city: row.city ?? 'yufu',
    onsenArea: row.onsen_area ?? row.region,
    travelContexts: normalizeEnumList(row.travel_contexts, travelContexts, ['ryokan_stay']),
    bathContexts: normalizeEnumList(row.bath_contexts, bathContexts, deriveBathContexts(row.bath_scope, row.primary_bath ?? '', row.summary)),
    waterCriteria: normalizeEnumList(row.water_criteria, waterCriteria, deriveWaterCriteria(row.water_use_status, row.water_source_type, row.summary, normalizeStringList(row.operation_notes))),
    summary: row.summary,
    primaryBath: row.primary_bath ?? '',
    waterUseStatus: normalizeWaterUseStatus(row.water_use_status),
    waterSourceType: normalizeWaterSourceType(row.water_source_type),
    bathScope: normalizeBathScope(row.bath_scope),
    operationNotes: normalizeStringList(row.operation_notes),
    evidenceCounts: normalizeEvidenceCounts(row.evidence_counts),
    evidenceGrade: normalizeGrade(row.evidence_grade),
    evidenceNote: row.evidence_note ?? '',
    status: normalizeStatus(row.status),
    updatedAt: row.content_updated_at ?? row.updated_at?.slice(0, 10) ?? '',
    sourceFile: row.source_file ?? undefined,
    source: 'database',
  };
}

export async function readAdminOnsenAccommodations(): Promise<AdminOnsenAccommodation[]> {
  const config = await readAdminPostgrestSessionConfig();
  if (config) {
    try {
      const rows = await readPostgrestRows<OnsenAccommodationRecord>(config, 'onsen_accommodations', {
        order: 'region.asc,name.asc',
      });
      return rows.map(mapOnsenAccommodationRecord);
    } catch {
      return readSeedOnsenAccommodations();
    }
  }

  return readSeedOnsenAccommodations();
}

export async function readAdminOnsenAccommodation(slug: string): Promise<AdminOnsenAccommodation | undefined> {
  const config = await readAdminPostgrestSessionConfig();
  if (config) {
    try {
      const rows = await readPostgrestRows<OnsenAccommodationRecord>(config, 'onsen_accommodations', {
        slug: `eq.${slug}`,
        limit: '1',
      });
      if (rows[0]) return mapOnsenAccommodationRecord(rows[0]);
    } catch {
      return (await readSeedOnsenAccommodations()).find((item) => item.slug === slug);
    }
  }

  return (await readSeedOnsenAccommodations()).find((item) => item.slug === slug);
}

async function readSeedOnsenAccommodations(): Promise<AdminOnsenAccommodation[]> {
  const root = await findResearchRoot();
  if (!root) return [];

  const folders = await readdir(root, { withFileTypes: true });
  const rows = await Promise.all(
    folders
      .filter((entry) => entry.isDirectory() && entry.name.startsWith('yufuin-') && entry.name !== 'yufuin-tier2-triage')
      .map(async (entry) => readSeedReport(root, entry.name))
  );

  return rows
    .filter((row): row is AdminOnsenAccommodation => Boolean(row))
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));
}

async function findResearchRoot(): Promise<string | null> {
  const candidates = [
    join(process.cwd(), 'research', 'onsen-review-signals'),
    join(process.cwd(), '..', '..', 'research', 'onsen-review-signals'),
  ];

  for (const candidate of candidates) {
    try {
      await readdir(candidate);
      return candidate;
    } catch {
      // Try the next possible cwd.
    }
  }

  return null;
}

async function readSeedReport(root: string, folder: string): Promise<AdminOnsenAccommodation | null> {
  const folderPath = join(root, folder);
  const files = (await readdir(folderPath)).filter((file) => file.startsWith('review_signal_summary') && file.endsWith('.json'));
  if (files.length === 0) return null;

  const file = files.sort(compareReportFile)[0];
  const raw = JSON.parse(await readFile(join(folderPath, file), 'utf8')) as unknown;
  if (!isRecord(raw)) return null;

  const flat = flatten(raw);
  const summaryText = pickSummaryText(flat);
  const refinedSummary = getRefinedOnsenSeedSummary(folder);
  const officialText = pickOfficialText(flat);
  const combinedText = `${officialText} ${refinedSummary ?? summaryText}`;
  const evidenceCounts = pickEvidenceCounts(flat);
  const primaryBath = classifyPrimaryBath(combinedText);
  const waterUseStatus = classifyWaterUseStatus(officialText, summaryText);
  const waterSourceType = classifyWaterSourceType(combinedText);
  const bathScope = classifyBathScope(combinedText);
  const operationNotes = classifyOperationNotes(combinedText);

  return {
    slug: folder,
    name: pickName(raw, folder),
    jaName: pickJapaneseName(raw),
    region: 'yufuin',
    area: '오이타 유후인',
    country: 'JP',
    regionGroup: 'kyushu',
    prefecture: 'oita',
    city: 'yufu',
    onsenArea: 'yufuin',
    travelContexts: ['ryokan_stay'],
    bathContexts: deriveBathContexts(bathScope, primaryBath, combinedText),
    waterCriteria: deriveWaterCriteria(waterUseStatus, waterSourceType, refinedSummary ?? summaryText, operationNotes),
    summary: refinedSummary ?? (summaryText || officialText || '온천 숙소 리서치 요약을 정리해야 합니다.'),
    primaryBath,
    waterUseStatus,
    waterSourceType,
    bathScope,
    operationNotes,
    evidenceCounts,
    evidenceGrade: classifyEvidenceGrade(evidenceCounts),
    evidenceNote: createEvidenceNote(evidenceCounts),
    status: 'draft',
    updatedAt: '2026-07-02',
    sourceFile: `research/onsen-review-signals/${folder}/${file}`,
    source: 'seed',
  };
}

function compareReportFile(a: string, b: string): number {
  return getReportPriority(a) - getReportPriority(b) || a.localeCompare(b);
}

function getReportPriority(file: string): number {
  const index = reportPriority.findIndex((keyword) => file.includes(keyword));
  return index === -1 ? 99 : index;
}

function flatten(value: unknown, path = ''): Array<[string, unknown]> {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => flatten(item, `${path}[${index}]`));
  }
  if (isRecord(value)) {
    return Object.entries(value).flatMap(([key, item]) => flatten(item, path ? `${path}.${key}` : key));
  }
  return [[path, value]];
}

function pickName(data: Record<string, unknown>, fallback: string): string {
  const value = data.accommodation_name;
  if (typeof value === 'string') return value;
  if (isRecord(value)) {
    return getString(value.ko) ?? getString(value.ja) ?? getString(value.en) ?? fallback;
  }
  return fallback;
}

function pickJapaneseName(data: Record<string, unknown>): string | undefined {
  const value = data.accommodation_name;
  if (isRecord(value)) return getString(value.ja);
  return undefined;
}

function getString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function pickSummaryText(flat: Array<[string, unknown]>): string {
  const summary = pickFirstText(flat, ['bathtime_interpretation_ko', 'bathtime_interpretation', 'interpretation_ko']);
  return cleanSummary(summary);
}

function pickOfficialText(flat: Array<[string, unknown]>): string {
  return cleanSummary(pickFirstText(flat, ['official_facts.summary', 'official_facts.summary_ko', 'official_facts.facts', 'official_facts[']));
}

function pickFirstText(flat: Array<[string, unknown]>, pathHints: string[]): string {
  for (const hint of pathHints) {
    const matches = flat
      .filter(([path, value]) => path.includes(hint) && typeof value === 'string')
      .map(([, value]) => String(value).trim())
      .filter((value) => value.length >= 20);
    if (matches.length > 0) return matches.slice(0, 3).join(' ');
  }

  return '';
}

function cleanSummary(value: string): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, 700);
}

function classifyPrimaryBath(text: string): string {
  if (/(대욕장|大浴場|대형 노천|조망 노천)/.test(text) && /(가족탕|대여|대절|貸切)/.test(text)) return '대욕장 + 대여탕 중심';
  if (/(전 객실|모든 객실|全室|각 객실|객실마다).*(노천|온천|露天|内湯)|((노천|온천|露天|内湯).*(전 객실|모든 객실|全室|각 객실|객실마다))/.test(text)) return '전 객실 온천탕 중심';
  if (/(일부|특정|별채|본관|露天付き|노천탕 딸린|전용 노천탕 객실)/.test(text)) return '일부 객실 온천탕';
  if (/(대여탕|대절탕|가족탕|貸切|전세)/.test(text)) return '대여탕 중심';
  if (/(대욕장|大浴場|공용|남녀|노천탕|露天風呂)/.test(text)) return '공용탕 중심';
  return '온천 구성 확인 필요';
}

function classifyBathScope(text: string): OnsenBathScope {
  if (/(전 객실|모든 객실|全室|각 객실|객실마다).*(노천|온천|露天|内湯)|((노천|온천|露天|内湯).*(전 객실|모든 객실|全室|각 객실|객실마다))/.test(text)) return 'all_rooms';
  if (/(일부|특정|별채|본관|1층|2층|露天付き|노천탕 딸린|전용 노천탕 객실|5실|3실)/.test(text)) return 'some_rooms';
  if (/(객실|部屋|room|in-room|private bath|개인탕|프라이빗).*(온천|노천|露天|内湯)/i.test(text)) return 'room_signal_only';
  if (/(대욕장|大浴場|공용|남녀|노천탕|露天風呂)/.test(text)) return 'public_bath_only';
  return 'unclear';
}

function classifyWaterUseStatus(officialText: string, summaryText: string): OnsenWaterUseStatus {
  if (/(온천|温泉|원천|源泉|천연온천|天然温泉|泉質|100%|１００％)/.test(officialText)) return 'official_confirmed';
  if (/(온천|온천수|탕질|물성|원천|객실탕|노천탕|private onsen)/i.test(summaryText)) return 'review_supported';
  if (summaryText || officialText) return 'needs_official_check';
  return 'unclear';
}

function classifyWaterSourceType(text: string): OnsenWaterSourceType {
  if (/(100%|１００％|천연온천 100|天然温泉100|인공온천 아님|人工温泉含まず)/.test(text)) return 'natural_100';
  if (/(원천가케나가시|源泉かけ流し|源泉掛け流し|源泉掛流|かけ流し|掛け流し|掛流|온천가케나가시|원천수 방류|원천 방류)/.test(text)) return 'free_flowing_source';
  if (/(온천수|온천|温泉|천연온천|天然温泉|泉質)/.test(text)) return 'hot_spring_confirmed';
  return 'needs_check';
}

function classifyOperationNotes(text: string): string[] {
  const notes: string[] = [];
  if (/(가수|加水|물 추가|지하수|地下水|물로|온도 조절|温度調整)/.test(text)) notes.push('물을 섞어 식힘/온도 조절');
  if (/(가온|加温)/.test(text)) notes.push('가온 표기');
  if (/(순환|循環|循環ろ過|ろ過|여과)/.test(text)) notes.push('순환/여과 표기');
  if (/(예약제|予約制|선착순|先着|貸切|대여|대절|전세|가족탕)/.test(text)) notes.push('대절탕 운영 조건');
  if (/(겨울|추위|냉기|雪|winter)/i.test(text)) notes.push('겨울 체감 주의');
  if (/(벌레|낙엽|虫|insect|자연물)/i.test(text)) notes.push('벌레/자연물 주의');
  return [...new Set(notes)];
}

function deriveBathContexts(bathScope: string | null | undefined, primaryBath: string, text: string): OnsenBathContext[] {
  const values = new Set<OnsenBathContext>();
  if (bathScope === 'all_rooms' || bathScope === 'some_rooms' || bathScope === 'room_signal_only' || /객실|전 객실|객실탕/.test(primaryBath)) {
    values.add('room_bath');
  }
  if (/(가족탕|대절탕|대여탕|貸切|전세|프라이빗)/.test(`${primaryBath} ${text}`)) {
    values.add('private_bath');
  }
  if (bathScope === 'public_bath_only' || /(대욕장|공용탕|大浴場)/.test(`${primaryBath} ${text}`)) {
    values.add('public_bath');
  }
  return [...values];
}

function deriveWaterCriteria(
  waterUseStatus: string | null | undefined,
  waterSourceType: string | null | undefined,
  summary: string,
  notes: string[]
): OnsenWaterCriterion[] {
  const text = `${summary} ${notes.join(' ')}`;
  const values = new Set<OnsenWaterCriterion>();
  if (waterSourceType === 'free_flowing_source') values.add('direct_source');
  if (waterSourceType === 'natural_100') values.add('natural_100');
  if (waterUseStatus === 'official_confirmed' || waterUseStatus === 'review_supported' || waterSourceType === 'hot_spring_confirmed') values.add('spring_confirmed');
  if (/(부드럽|매끈|수질|피부감|온천감|물 느낌)/.test(text)) values.add('water_texture');
  if (/(물을 섞어|온도 조절|가온|가수)/.test(text)) values.add('temperature_adjustment');
  if (/(겨울|추위|춥|냉기)/.test(text)) values.add('winter_caution');
  return [...values];
}

function pickEvidenceCounts(flat: Array<[string, unknown]>): OnsenEvidenceCounts {
  return {
    directReviewCount: pickDirectReviewCount(flat),
    onsenReviewCount: pickOnsenReviewCount(flat),
    roomBathMentionCount: pickSignalCount(flat, ['room_bath', 'room_open_air', 'room_open']),
    publicBathMentionCount: pickSignalCount(flat, ['public_bath', 'open_air_public', 'large_open_air']),
    privateBathMentionCount: pickSignalCount(flat, ['private_bath', 'privacy']),
    waterTextureMentionCount: pickSignalCount(flat, ['water_texture', 'source_flow', 'weak_onsen', 'onsen_feeling']),
    cautionMentionCount: pickSignalCount(flat, ['attention', 'caution', 'negative']),
  };
}

function pickDirectReviewCount(flat: Array<[string, unknown]>): number | null {
  return pickMaxNumber(flat, ['directly_read_total', 'direct_read_total', 'direct_structured_review_sample_total', 'directly_structured_total', 'structured_reviews_total']);
}

function pickOnsenReviewCount(flat: Array<[string, unknown]>): number | null {
  return pickMaxNumber(flat, ['onsen_related_total', 'onsen_related_direct_total', 'onsen_related_rows_auto', 'onsen_related_structured']);
}

function pickSignalCount(flat: Array<[string, unknown]>, hints: string[]): number | null {
  return pickMaxNumber(flat, hints);
}

function pickMaxNumber(flat: Array<[string, unknown]>, hints: string[]): number | null {
  const values = flat
    .filter(([path, value]) => typeof value === 'number' && hints.some((hint) => path.toLowerCase().includes(hint)))
    .map(([, value]) => Number(value))
    .filter((value) => Number.isFinite(value));
  return values.length > 0 ? Math.max(...values) : null;
}

function classifyEvidenceGrade(counts: OnsenEvidenceCounts): 'A' | 'B' | 'C' | 'D' {
  const direct = counts.directReviewCount ?? 0;
  if (direct >= 300) return 'A';
  if (direct >= 100) return 'B';
  if (direct >= 30) return 'C';
  return 'D';
}

function createEvidenceNote(counts: OnsenEvidenceCounts): string {
  const direct = counts.directReviewCount;
  const onsen = counts.onsenReviewCount;
  if (direct && onsen) return `직접 확인 ${direct}건 중 온천 관련 ${onsen}건`;
  if (direct) return `직접 확인 ${direct}건`;
  if (onsen) return `온천 관련 ${onsen}건`;
  return '정량 근거를 추가 정리해야 합니다.';
}
