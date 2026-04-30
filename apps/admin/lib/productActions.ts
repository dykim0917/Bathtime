'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import {
  readAdminPostgrestSessionConfig,
  updatePostgrestRows,
} from './data/postgrest';
import type { AdminProductRow } from './productsData';

const productStatuses: AdminProductRow['status'][] = [
  'active',
  'draft',
  'paused',
  'retired',
];

function isProductStatus(value: string): value is AdminProductRow['status'] {
  return productStatuses.includes(value as AdminProductRow['status']);
}

export async function updateProductStatus(formData: FormData) {
  const id = String(formData.get('id') ?? '').trim();
  const status = String(formData.get('status') ?? '').trim();

  if (!id || !isProductStatus(status)) {
    redirect(`/products/${id || ''}?error=invalid_status`);
  }

  const config = await readAdminPostgrestSessionConfig();
  if (!config) {
    redirect(`/products/${id}?error=missing_content_db`);
  }

  try {
    await updatePostgrestRows(
      config,
      'canonical_product',
      { id: `eq.${id}` },
      { status }
    );
  } catch {
    redirect(`/products/${id}?error=update_failed`);
  }

  revalidatePath('/products');
  revalidatePath(`/products/${id}`);
  redirect(`/products/${id}?updated=status`);
}

function isDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function updateProductBasicInfo(formData: FormData) {
  const id = String(formData.get('id') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const brand = String(formData.get('brand') ?? '').trim();
  const category = String(formData.get('category') ?? '').trim();
  const summary = String(formData.get('summary') ?? '').trim();
  const lastVerifiedAt = String(formData.get('lastVerifiedAt') ?? '').trim();

  if (!id || !name || !brand || !category || !summary || !isDateString(lastVerifiedAt)) {
    redirect(`/products/${id || ''}?error=invalid_basic_info`);
  }

  const config = await readAdminPostgrestSessionConfig();
  if (!config) {
    redirect(`/products/${id}?error=missing_content_db`);
  }

  try {
    await updatePostgrestRows(
      config,
      'canonical_product',
      { id: `eq.${id}` },
      {
        name_ko: name,
        brand,
        category,
        summary,
        last_verified_at: lastVerifiedAt,
      }
    );
  } catch {
    redirect(`/products/${id}?error=update_failed`);
  }

  revalidatePath('/products');
  revalidatePath(`/products/${id}`);
  redirect(`/products/${id}?updated=basic_info`);
}

function parseListField(value: FormDataEntryValue | null): string[] {
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

export async function updateProductPresentation(formData: FormData) {
  const id = String(formData.get('id') ?? '').trim();
  const emoji = String(formData.get('emoji') ?? '').trim();
  const bgColor = String(formData.get('bgColor') ?? '').trim();
  const tags = parseListField(formData.get('tags'));
  const safetyFlags = parseListField(formData.get('safetyFlags'));

  if (!id || !emoji || !isHexColor(bgColor)) {
    redirect(`/products/${id || ''}?error=invalid_presentation`);
  }

  const config = await readAdminPostgrestSessionConfig();
  if (!config) {
    redirect(`/products/${id}?error=missing_content_db`);
  }

  try {
    await updatePostgrestRows(
      config,
      'product_presentation',
      { canonical_product_id: `eq.${id}` },
      {
        tags,
        emoji,
        bg_color: bgColor,
        safety_flags: safetyFlags,
      }
    );
  } catch {
    redirect(`/products/${id}?error=update_failed`);
  }

  revalidatePath('/products');
  revalidatePath(`/products/${id}`);
  redirect(`/products/${id}?updated=presentation`);
}
