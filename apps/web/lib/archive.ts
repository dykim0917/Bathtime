import 'server-only';

import {
  archiveContentDbSelect,
  mapArchiveContentDbRow,
  type ArchiveContentDbRow,
} from '@/src/archive/archiveContentMapper';
import { archiveContents, routinePresets } from '@/src/archive/seed';
import type { ArchiveContent, ContentCategory, ContentSeriesInfo, RoutinePreset } from '@/src/archive/types';

export const archiveRevalidateSeconds = 300;

type RequestConfig = {
  url: string;
  headers?: Record<string, string>;
};

type PreviewApiPayload = {
  schema_version?: string;
  content?: ArchiveContent;
};

function getSupabaseConfig(): RequestConfig | null {
  const explicitRestUrl = process.env.CONTENT_DB_REST_URL?.trim();
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const serviceKey = process.env.CONTENT_DB_SERVICE_ROLE_KEY?.trim();
  const key = serviceKey || anonKey;
  const baseUrl = explicitRestUrl || (supabaseUrl ? `${supabaseUrl.replace(/\/+$/, '')}/rest/v1` : '');

  if (!baseUrl || !key) return null;

  return {
    url: `${baseUrl.replace(/\/+$/, '')}/archive_content`,
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
    },
  };
}

function getWebOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_WEB_URL?.trim() ||
    process.env.EXPO_PUBLIC_WEB_URL?.trim() ||
    'https://www.getbathtime.com'
  ).replace(/\/+$/, '');
}

export function getCanonicalContentUrl(id: string): string {
  return `${getWebOrigin()}/content/${encodeURIComponent(id)}`;
}

function getPublishedFallbackContents(): ArchiveContent[] {
  return archiveContents.filter((content) => content.isPublished);
}

function sortByUpdatedAt(contents: ArchiveContent[]): ArchiveContent[] {
  return [...contents].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id));
}

async function fetchArchiveRows(query: URLSearchParams, options?: { noStore?: boolean }): Promise<ArchiveContent[]> {
  const config = getSupabaseConfig();
  if (!config) return getPublishedFallbackContents();

  const url = new URL(config.url);
  query.forEach((value, key) => url.searchParams.set(key, value));

  let response: Response;
  try {
    response = await fetch(url, {
      headers: config.headers,
      ...(options?.noStore
        ? { cache: 'no-store' as const }
        : { next: { revalidate: archiveRevalidateSeconds, tags: ['archive-content'] } }),
    });
  } catch (error) {
    console.warn('archive_content fetch failed', error);
    return getPublishedFallbackContents();
  }

  if (!response.ok) {
    console.warn(`archive_content fetch failed: ${response.status}`);
    return getPublishedFallbackContents();
  }

  const rows = (await response.json()) as ArchiveContentDbRow[];
  if (!Array.isArray(rows)) return getPublishedFallbackContents();
  return rows.map(mapArchiveContentDbRow).filter((content) => content.isPublished);
}

export async function getPublishedArchiveContents(options?: { noStore?: boolean }): Promise<ArchiveContent[]> {
  const query = new URLSearchParams({
    select: archiveContentDbSelect,
    status: 'eq.active',
    is_published: 'eq.true',
    order: 'content_updated_at.desc,id.asc',
  });

  const contents = await fetchArchiveRows(query, options);
  return sortByUpdatedAt(contents);
}

export async function getPublishedArchiveContent(id: string): Promise<ArchiveContent | null> {
  const query = new URLSearchParams({
    select: archiveContentDbSelect,
    status: 'eq.active',
    is_published: 'eq.true',
    id: `eq.${id}`,
    limit: '1',
  });

  const contents = await fetchArchiveRows(query, { noStore: true });
  return contents.find((content) => content.id === id) ?? null;
}

export async function getPreviewArchiveContent(id: string, previewToken?: string): Promise<ArchiveContent | null> {
  const token = previewToken?.trim();
  if (!token) return null;

  const base = process.env.ARCHIVE_PREVIEW_API_BASE?.trim() || 'https://admin.getbathtime.com';
  const url = new URL(`/api/archive-preview/${id}`, base);
  url.searchParams.set('token', token);

  let response: Response;
  try {
    response = await fetch(url, { cache: 'no-store' });
  } catch (error) {
    console.warn('archive preview fetch failed', error);
    return null;
  }

  if (!response.ok) return null;

  const payload = (await response.json()) as PreviewApiPayload;
  if (payload.schema_version !== 'archive-content-preview.v1' || !payload.content) return null;
  return payload.content;
}

export function searchArchiveContents(
  contents: ArchiveContent[],
  params: {
    category?: ContentCategory | 'ALL';
    tag?: string | null;
    query?: string;
  }
): ArchiveContent[] {
  const query = params.query?.trim().toLowerCase() ?? '';

  return contents.filter((content) => {
    const matchesCategory = !params.category || params.category === 'ALL' || content.category === params.category;
    const matchesTag = !params.tag || content.tags.includes(params.tag);
    const matchesQuery =
      query.length === 0 ||
      content.title.toLowerCase().includes(query) ||
      content.subtitle?.toLowerCase().includes(query) ||
      content.summary.toLowerCase().includes(query) ||
      content.tags.some((tag) => tag.toLowerCase().includes(query));
    return matchesCategory && matchesTag && matchesQuery;
  });
}

export function getFeaturedContent(contents: ArchiveContent[]): ArchiveContent | null {
  return contents[0] ?? null;
}

export function getLatestContents(contents: ArchiveContent[], limit = 6): ArchiveContent[] {
  return sortByUpdatedAt(contents).slice(0, limit);
}

export function getContentsByCategory(contents: ArchiveContent[], category: ContentCategory): ArchiveContent[] {
  return contents.filter((content) => content.category === category);
}

export function getRelatedRoutinePresets(content: ArchiveContent): RoutinePreset[] {
  return routinePresets.filter((routine) => content.relatedRoutineIds?.includes(routine.id));
}

export function getContentSeriesInfo(content: ArchiveContent): ContentSeriesInfo | null {
  const series = content.structuredInfo.series;
  if (!series || typeof series.id !== 'string' || typeof series.title !== 'string') return null;
  if (!Number.isFinite(series.order)) return null;

  return {
    id: series.id,
    title: series.title,
    order: series.order,
    description: typeof series.description === 'string' ? series.description : undefined,
  };
}

export function getSeriesArchiveContents(current: ArchiveContent, contents: ArchiveContent[]): ArchiveContent[] {
  const currentSeries = getContentSeriesInfo(current);
  if (!currentSeries) return [];

  const byId = new Map<string, ArchiveContent>();
  [...contents, current].forEach((content) => {
    const series = getContentSeriesInfo(content);
    if (series?.id === currentSeries.id) byId.set(content.id, content);
  });

  return [...byId.values()].sort((a, b) => {
    const aSeries = getContentSeriesInfo(a);
    const bSeries = getContentSeriesInfo(b);
    return (
      (aSeries?.order ?? Number.MAX_SAFE_INTEGER) -
        (bSeries?.order ?? Number.MAX_SAFE_INTEGER) ||
      a.updatedAt.localeCompare(b.updatedAt) ||
      a.id.localeCompare(b.id)
    );
  });
}

function getStructuredRelatedCategories(content: ArchiveContent): ContentCategory[] {
  const info = content.structuredInfo;
  if ('relatedCategories' in info && Array.isArray(info.relatedCategories)) {
    return info.relatedCategories;
  }
  return [];
}

function scoreRelatedContent(current: ArchiveContent, candidate: ArchiveContent): number {
  if (current.id === candidate.id) return -1;

  const currentTags = new Set(current.tags);
  const sharedTagCount = candidate.tags.filter((tag) => currentTags.has(tag)).length;
  const relatedCategories = new Set(getStructuredRelatedCategories(current));
  const candidateRelatedCategories = new Set(getStructuredRelatedCategories(candidate));
  const hasLinkedRitual = (current.relatedRoutineIds?.length ?? 0) > 0;

  let score = sharedTagCount * 3;
  if (candidate.contentType === current.contentType) score += 1;
  if (relatedCategories.has(candidate.category)) score += 4;
  if (candidateRelatedCategories.has(current.category)) score += 2;

  if (candidate.category === current.category) {
    score += current.category === 'HOME_BATH' ? -3 : 1;
  } else if (sharedTagCount > 0) {
    score += 2;
  }

  if (current.category === 'HOME_BATH') {
    if (candidate.category === 'BATH_ITEMS') score += 6;
    if (candidate.category === 'TIPS_CULTURE') score += 4;
    if (candidate.category === 'BATH_PLACES') score += 3;
    if (candidate.category === 'HOME_BATH' && hasLinkedRitual) score -= 5;
  }

  return score;
}

function takeDiverseRelatedContents(
  ranked: { content: ArchiveContent; score: number }[],
  limit: number,
  currentCategory: ContentCategory
): ArchiveContent[] {
  const selected: ArchiveContent[] = [];
  const categoryCounts = new Map<ContentCategory, number>();

  for (const item of ranked) {
    if (selected.length >= limit) break;

    const count = categoryCounts.get(item.content.category) ?? 0;
    if (item.content.category === currentCategory && count >= 1) continue;
    if (item.content.category !== currentCategory && count >= 2) continue;

    selected.push(item.content);
    categoryCounts.set(item.content.category, count + 1);
  }

  return selected;
}

export function getRelatedArchiveContents(
  current: ArchiveContent,
  contents: ArchiveContent[],
  limit = 3
): ArchiveContent[] {
  const candidates = contents.filter((content) => content.id !== current.id);
  const ranked = candidates
    .map((content) => ({ content, score: scoreRelatedContent(current, content) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.content.updatedAt.localeCompare(a.content.updatedAt) || a.content.id.localeCompare(b.content.id));

  const selected = takeDiverseRelatedContents(ranked, limit, current.category);
  if (selected.length >= limit) return selected;

  const selectedIds = new Set(selected.map((content) => content.id));
  const fallback = sortByUpdatedAt(candidates)
    .filter((content) => !selectedIds.has(content.id))
    .map((content) => ({ content, score: 0 }));

  return takeDiverseRelatedContents(
    [...selected.map((content) => ({ content, score: 1 })), ...fallback],
    limit,
    current.category
  );
}

export function getPublishedRoutinePresets(limit?: number): RoutinePreset[] {
  const published = routinePresets.filter((routine) => routine.isPublished);
  return typeof limit === 'number' ? published.slice(0, limit) : published;
}
