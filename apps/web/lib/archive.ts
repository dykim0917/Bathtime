import 'server-only';

import {
  archiveContentDbSelect,
  mapArchiveContentDbRow,
  type ArchiveContentDbRow,
} from '@/src/archive/archiveContentMapper';
import { archiveContents, routinePresets } from '@/src/archive/seed';
import type { ArchiveContent, ContentCategory, RoutinePreset } from '@/src/archive/types';

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

async function fetchArchiveRows(query: URLSearchParams): Promise<ArchiveContent[]> {
  const config = getSupabaseConfig();
  if (!config) return getPublishedFallbackContents();

  const url = new URL(config.url);
  query.forEach((value, key) => url.searchParams.set(key, value));

  const response = await fetch(url, {
    headers: config.headers,
    next: { revalidate: archiveRevalidateSeconds, tags: ['archive-content'] },
  });

  if (!response.ok) {
    console.warn(`archive_content fetch failed: ${response.status}`);
    return getPublishedFallbackContents();
  }

  const rows = (await response.json()) as ArchiveContentDbRow[];
  if (!Array.isArray(rows)) return getPublishedFallbackContents();
  return rows.map(mapArchiveContentDbRow).filter((content) => content.isPublished);
}

export async function getPublishedArchiveContents(): Promise<ArchiveContent[]> {
  const query = new URLSearchParams({
    select: archiveContentDbSelect,
    status: 'eq.active',
    is_published: 'eq.true',
    order: 'content_updated_at.desc,id.asc',
  });

  const contents = await fetchArchiveRows(query);
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

  const contents = await fetchArchiveRows(query);
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

export function getPublishedRoutinePresets(limit?: number): RoutinePreset[] {
  const published = routinePresets.filter((routine) => routine.isPublished);
  return typeof limit === 'number' ? published.slice(0, limit) : published;
}
