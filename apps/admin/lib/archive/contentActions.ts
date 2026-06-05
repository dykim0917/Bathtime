'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import sharp from 'sharp';

import {
  insertPostgrestRow,
  readPostgrestRows,
  readAdminPostgrestSessionConfig,
  updatePostgrestRows,
} from '../data/postgrest';
import { createSupabaseServerClient } from '../auth/server';
import {
  categoryLabels,
  contentStatusLabels,
  contentTypeLabels,
  type AdminContentCategory,
  type AdminContentStatus,
  type AdminContentType,
} from './data';

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

const archiveAssetBucket = process.env.ARCHIVE_ASSET_BUCKET?.trim() || 'bathtime-assets';
const archiveAssetMaxWidth = 1400;
const archiveAssetWebpQuality = 82;

function parseListField(value: FormDataEntryValue | null): string[] {
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function isContentCategory(value: string): value is AdminContentCategory {
  return Object.prototype.hasOwnProperty.call(categoryLabels, value);
}

function isContentType(value: string): value is AdminContentType {
  return Object.prototype.hasOwnProperty.call(contentTypeLabels, value);
}

function isContentStatus(value: string): value is AdminContentStatus {
  return Object.prototype.hasOwnProperty.call(contentStatusLabels, value);
}

function parseJsonField(value: FormDataEntryValue | null): unknown | undefined {
  const raw = String(value ?? '').trim();
  if (!raw) return undefined;

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return undefined;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function sanitizePathSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getUploadedFile(formData: FormData, fieldName: string): File | null {
  const value = formData.get(fieldName);
  if (!(value instanceof File) || value.size === 0) return null;
  return value;
}

async function optimizeUploadedImage(file: File): Promise<Buffer> {
  const input = Buffer.from(await file.arrayBuffer());
  return sharp(input)
    .rotate()
    .resize({ width: archiveAssetMaxWidth, withoutEnlargement: true })
    .webp({ quality: archiveAssetWebpQuality, effort: 6 })
    .toBuffer();
}

async function getImageAspectRatio(buffer: Buffer): Promise<number | undefined> {
  const metadata = await sharp(buffer).metadata();
  if (!metadata.width || !metadata.height) return undefined;
  return Number((metadata.width / metadata.height).toFixed(4));
}

function createUploadedImageAsset(
  imageUrl: string,
  previous: Record<string, unknown> | undefined,
  altFallback: string
): Record<string, unknown> {
  return {
    ...(previous ?? {}),
    uri: imageUrl,
    alt: typeof previous?.alt === 'string' && previous.alt ? previous.alt : altFallback,
    sourceType: 'owned',
  };
}

export async function updateArchiveContentBasicInfo(formData: FormData) {
  const id = String(formData.get('id') ?? '').trim();
  const title = String(formData.get('title') ?? '').trim();
  const subtitle = String(formData.get('subtitle') ?? '').trim();
  const summary = String(formData.get('summary') ?? '').trim();
  const category = String(formData.get('category') ?? '').trim();
  const contentType = String(formData.get('contentType') ?? '').trim();
  const status = String(formData.get('status') ?? '').trim();
  const tags = parseListField(formData.get('tags'));

  if (
    !id ||
    !title ||
    !summary ||
    !isContentCategory(category) ||
    !isContentType(contentType) ||
    !isContentStatus(status)
  ) {
    redirect(`/content/${id || ''}?error=invalid_basic_info`);
  }

  const config = await readAdminPostgrestSessionConfig();
  if (!config) {
    redirect(`/content/${id}?error=missing_content_db`);
  }

  try {
    await updatePostgrestRows(
      config,
      'archive_content',
      { id: `eq.${id}` },
      {
        title,
        subtitle: subtitle || null,
        summary,
        category,
        content_type: contentType,
        tags,
        status,
        is_published: status === 'active',
        content_updated_at: todayDateString(),
      }
    );
  } catch {
    redirect(`/content/${id}?error=update_failed`);
  }

  revalidatePath('/content');
  revalidatePath(`/content/${id}`);
  redirect(`/content/${id}?updated=basic_info`);
}

export async function updateArchiveContentStatusFromList(formData: FormData) {
  const id = String(formData.get('id') ?? '').trim();
  const status = String(formData.get('status') ?? '').trim();
  const returnTo = String(formData.get('returnTo') ?? '/content').trim();
  const redirectTo = returnTo.startsWith('/content') ? returnTo : '/content';
  const separator = redirectTo.includes('?') ? '&' : '?';

  if (!id || !isContentStatus(status)) {
    redirect(`${redirectTo}${separator}error=invalid_status`);
  }

  const config = await readAdminPostgrestSessionConfig();
  if (!config) {
    redirect(`${redirectTo}${separator}error=missing_content_db`);
  }

  try {
    await updatePostgrestRows(
      config,
      'archive_content',
      { id: `eq.${id}` },
      {
        status,
        is_published: status === 'active',
        content_updated_at: todayDateString(),
      }
    );
  } catch {
    redirect(`${redirectTo}${separator}error=update_failed`);
  }

  revalidatePath('/content');
  revalidatePath(`/content/${id}`);
  redirect(`${redirectTo}${separator}updated=status`);
}

export async function updateArchiveContentBody(formData: FormData) {
  const id = String(formData.get('id') ?? '').trim();
  const heroImage = parseJsonField(formData.get('heroImage'));
  const body = parseJsonField(formData.get('body'));
  const structuredInfo = parseJsonField(formData.get('structuredInfo'));
  const seo = parseJsonField(formData.get('seo'));

  if (
    !id ||
    (heroImage !== undefined && !isPlainObject(heroImage)) ||
    !Array.isArray(body) ||
    (structuredInfo !== undefined && !isPlainObject(structuredInfo)) ||
    (seo !== undefined && !isPlainObject(seo))
  ) {
    redirect(`/content/${id || ''}?error=invalid_content_json`);
  }

  const config = await readAdminPostgrestSessionConfig();
  if (!config) {
    redirect(`/content/${id}?error=missing_content_db`);
  }

  try {
    await updatePostgrestRows(
      config,
      'archive_content',
      { id: `eq.${id}` },
      {
        hero_image: heroImage ?? null,
        body,
        structured_info: structuredInfo ?? {},
        seo: seo ?? {},
        content_updated_at: todayDateString(),
      }
    );
  } catch {
    redirect(`/content/${id}?error=update_failed`);
  }

  revalidatePath('/content');
  revalidatePath(`/content/${id}`);
  redirect(`/content/${id}?updated=body`);
}

export async function uploadArchiveContentImage(formData: FormData) {
  const id = String(formData.get('id') ?? '').trim();
  const assetTarget = String(formData.get('assetTarget') ?? '').trim();
  const heroImage = parseJsonField(formData.get('heroImage'));
  const body = parseJsonField(formData.get('body'));
  const structuredInfo = parseJsonField(formData.get('structuredInfo'));
  const seo = parseJsonField(formData.get('seo'));

  if (
    !id ||
    !assetTarget ||
    (heroImage !== undefined && !isPlainObject(heroImage)) ||
    !Array.isArray(body) ||
    (structuredInfo !== undefined && !isPlainObject(structuredInfo)) ||
    (seo !== undefined && !isPlainObject(seo))
  ) {
    redirect(`/content/${id || ''}?error=invalid_content_json`);
  }

  const config = await readAdminPostgrestSessionConfig();
  if (!config) {
    redirect(`/content/${id}?error=missing_content_db`);
  }

  const fileFieldName = assetTarget === 'hero'
    ? 'assetFile_hero'
    : `assetFile_${assetTarget.replace('body:', '')}`;
  const file = getUploadedFile(formData, fileFieldName);
  if (!file || !file.type.startsWith('image/')) {
    redirect(`/content/${id}?error=invalid_upload`);
  }

  const contentRows = await readPostgrestRows<{ title?: string }>(config, 'archive_content', {
    id: `eq.${id}`,
    select: 'title',
    limit: '1',
  });
  const title = contentRows[0]?.title ?? id;
  const safeId = sanitizePathSegment(id) || 'archive-content';
  const storageTarget = assetTarget === 'hero'
    ? 'hero'
    : `body-${sanitizePathSegment(assetTarget.replace('body:', '')) || 'image'}`;
  const storagePath = `archive/${safeId}/${storageTarget}.webp`;

  try {
    const optimizedImage = await optimizeUploadedImage(file);
    const aspectRatio = await getImageAspectRatio(optimizedImage);
    const supabase = await createSupabaseServerClient();
    const { error: uploadError } = await supabase.storage
      .from(archiveAssetBucket)
      .upload(storagePath, optimizedImage, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(archiveAssetBucket)
      .getPublicUrl(storagePath);
    const publicUrl = data.publicUrl;

    if (assetTarget === 'hero') {
      await updatePostgrestRows(
        config,
        'archive_content',
        { id: `eq.${id}` },
        {
          hero_image: createUploadedImageAsset(publicUrl, heroImage, title),
          body,
          structured_info: structuredInfo ?? {},
          seo: seo ?? {},
          content_updated_at: todayDateString(),
        }
      );
    } else {
      const blockIndex = Number(assetTarget.replace('body:', ''));
      const nextBody = body.map((block, index) => {
        if (index !== blockIndex || !isPlainObject(block) || block.type !== 'image') return block;
        return { ...block, uri: publicUrl, aspectRatio };
      });

      await updatePostgrestRows(
        config,
        'archive_content',
        { id: `eq.${id}` },
        {
          hero_image: heroImage ?? null,
          body: nextBody,
          structured_info: structuredInfo ?? {},
          seo: seo ?? {},
          content_updated_at: todayDateString(),
        }
      );
    }
  } catch (error) {
    console.error('Archive content image upload failed', {
      id,
      assetTarget,
      bucket: archiveAssetBucket,
      error,
    });
    redirect(`/content/${id}?error=upload_failed`);
  }

  revalidatePath('/content');
  revalidatePath(`/content/${id}`);
  redirect(`/content/${id}?updated=asset`);
}

export async function createArchiveContentDraft(formData: FormData) {
  const id = String(formData.get('id') ?? '').trim();
  const title = String(formData.get('title') ?? '').trim();
  const subtitle = String(formData.get('subtitle') ?? '').trim();
  const summary = String(formData.get('summary') ?? '').trim();
  const category = String(formData.get('category') ?? '').trim();
  const contentType = String(formData.get('contentType') ?? '').trim();
  const status = String(formData.get('status') ?? '').trim();
  const tags = parseListField(formData.get('tags'));

  if (
    !id ||
    !title ||
    !summary ||
    !isContentCategory(category) ||
    !isContentType(contentType) ||
    !isContentStatus(status)
  ) {
    redirect('/content/new?error=invalid_basic_info');
  }

  const config = await readAdminPostgrestSessionConfig();
  if (!config) {
    redirect('/content/new?error=missing_content_db');
  }

  try {
    await insertPostgrestRow(config, 'archive_content', {
      id,
      title,
      subtitle: subtitle || null,
      summary,
      category,
      content_type: contentType,
      tags,
      hero_image: null,
      body: [],
      structured_info: {},
      related_routine_ids: [],
      related_item_ids: [],
      related_place_ids: [],
      seo: {},
      is_published: status === 'active',
      status,
      content_created_at: todayDateString(),
      content_updated_at: todayDateString(),
    });
  } catch {
    redirect('/content/new?error=create_failed');
  }

  revalidatePath('/content');
  redirect(`/content/${id}?updated=create`);
}
