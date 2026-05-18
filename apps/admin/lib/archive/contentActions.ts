'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import {
  insertPostgrestRow,
  readAdminPostgrestSessionConfig,
  updatePostgrestRows,
} from '../data/postgrest';
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
