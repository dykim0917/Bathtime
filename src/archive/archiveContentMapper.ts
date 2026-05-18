import {
  type ArchiveContent,
  type ContentBodyBlock,
  type ContentCategory,
  type ContentSeoMetadata,
  type ContentType,
  type ImageAsset,
  type StructuredInfo,
} from '@/src/archive/types';

export interface ArchiveContentDbRow {
  id: string;
  title: string;
  subtitle: string | null;
  summary: string;
  category: string;
  content_type: string;
  tags: unknown;
  hero_image: unknown;
  body: unknown;
  structured_info: unknown;
  related_routine_ids?: unknown;
  related_item_ids?: unknown;
  related_place_ids?: unknown;
  seo: unknown;
  is_published: boolean;
  status: string;
  content_created_at: string;
  content_updated_at: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export const archiveContentDbSelect = [
  'id',
  'title',
  'subtitle',
  'summary',
  'category',
  'content_type',
  'tags',
  'hero_image',
  'body',
  'structured_info',
  'related_routine_ids',
  'related_item_ids',
  'related_place_ids',
  'seo',
  'is_published',
  'status',
  'content_created_at',
  'content_updated_at',
  'created_at',
  'updated_at',
].join(',');

const contentCategories: ContentCategory[] = [
  'HOME_BATH',
  'BATH_PLACES',
  'BATH_ITEMS',
  'TIPS_CULTURE',
];

const contentTypes: ContentType[] = [
  'TRIED',
  'RESEARCHED',
  'ORGANIZED',
  'VISITED',
  'SUBMITTED',
  'UPDATED',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function normalizeCategory(value: string): ContentCategory {
  return contentCategories.includes(value as ContentCategory)
    ? (value as ContentCategory)
    : 'TIPS_CULTURE';
}

function normalizeContentType(value: string): ContentType {
  return contentTypes.includes(value as ContentType) ? (value as ContentType) : 'ORGANIZED';
}

function normalizeDate(value: string | null | undefined): string {
  return value?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);
}

function normalizeBody(value: unknown): ContentBodyBlock[] {
  return Array.isArray(value) ? (value as ContentBodyBlock[]) : [];
}

function normalizeImageAsset(value: unknown): ImageAsset | undefined {
  if (!isRecord(value)) return undefined;
  if (typeof value.uri !== 'string' || typeof value.alt !== 'string') return undefined;

  return {
    uri: value.uri,
    alt: value.alt,
    credit: typeof value.credit === 'string' ? value.credit : undefined,
    sourceType:
      value.sourceType === 'owned' ||
      value.sourceType === 'official' ||
      value.sourceType === 'licensed' ||
      value.sourceType === 'generated' ||
      value.sourceType === 'none'
        ? value.sourceType
        : undefined,
  };
}

function normalizeObject<T>(value: unknown): T {
  return (isRecord(value) ? value : {}) as T;
}

export function mapArchiveContentDbRow(row: ArchiveContentDbRow): ArchiveContent {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    summary: row.summary,
    category: normalizeCategory(row.category),
    contentType: normalizeContentType(row.content_type),
    tags: isStringArray(row.tags) ? row.tags : [],
    heroImage: normalizeImageAsset(row.hero_image),
    body: normalizeBody(row.body),
    structuredInfo: normalizeObject<StructuredInfo>(row.structured_info),
    relatedRoutineIds: isStringArray(row.related_routine_ids) ? row.related_routine_ids : [],
    relatedItemIds: isStringArray(row.related_item_ids) ? row.related_item_ids : [],
    relatedPlaceIds: isStringArray(row.related_place_ids) ? row.related_place_ids : [],
    seo: normalizeObject<ContentSeoMetadata>(row.seo),
    isPublished: row.is_published && row.status === 'active',
    createdAt: normalizeDate(row.content_created_at ?? row.created_at),
    updatedAt: normalizeDate(row.content_updated_at ?? row.updated_at),
  };
}
