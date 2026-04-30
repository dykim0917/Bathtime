'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import {
  insertPostgrestRow,
  readAdminPostgrestSessionConfig,
  readPostgrestRows,
  updatePostgrestRows,
} from './data/postgrest';
import { getCurrentAdminEmail } from './auth/server';
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

interface CanonicalProductRecord {
  id: string;
  ingredient_key: string;
  name_ko: string;
  brand: string;
  category: string;
  mechanism: string;
  price_tier: string;
  environments: string[];
  summary: string;
  editorial_eyebrow: string;
  editorial_footer_hint: string;
  status: AdminProductRow['status'];
  last_verified_at: string;
}

interface ProductPresentationRecord {
  canonical_product_id: string;
  tags?: string[];
  emoji?: string;
  bg_color?: string;
  safety_flags?: string[];
  status?: AdminProductRow['status'];
}

function buildCloneId(sourceId: string): string {
  return `${sourceId}_copy_${Date.now().toString(36)}`;
}

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
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

export async function cloneProductDraft(formData: FormData) {
  const sourceId = String(formData.get('id') ?? '').trim();

  if (!sourceId) {
    redirect('/products?error=invalid_clone');
  }

  const config = await readAdminPostgrestSessionConfig();
  if (!config) {
    redirect(`/products/${sourceId}?error=missing_content_db`);
  }

  const newId = buildCloneId(sourceId);
  const actorEmail = await getCurrentAdminEmail();
  let source: CanonicalProductRecord | undefined;
  let presentation: ProductPresentationRecord | undefined;

  if (!actorEmail) {
    redirect(`/products/${sourceId}?error=missing_admin`);
  }

  try {
    const [products, presentations] = await Promise.all([
      readPostgrestRows<CanonicalProductRecord>(config, 'canonical_product', {
        id: `eq.${sourceId}`,
        limit: '1',
      }),
      readPostgrestRows<ProductPresentationRecord>(config, 'product_presentation', {
        canonical_product_id: `eq.${sourceId}`,
        limit: '1',
      }),
    ]);
    source = products[0];
    presentation = presentations[0];
  } catch {
    redirect(`/products/${sourceId}?error=clone_failed`);
  }

  if (!source) {
    redirect('/products?error=clone_source_missing');
  }

  try {
    await insertPostgrestRow(config, 'canonical_product', {
      id: newId,
      ingredient_key: source.ingredient_key,
      name_ko: `${source.name_ko} 복사본`,
      brand: source.brand,
      category: source.category,
      mechanism: source.mechanism,
      price_tier: source.price_tier,
      environments: source.environments,
      summary: source.summary,
      editorial_eyebrow: source.editorial_eyebrow,
      editorial_footer_hint: source.editorial_footer_hint,
      status: 'draft',
      last_verified_at: todayDateString(),
    });

    await insertPostgrestRow(config, 'product_presentation', {
      canonical_product_id: newId,
      tags: presentation?.tags ?? [],
      emoji: presentation?.emoji ?? '-',
      bg_color: presentation?.bg_color ?? '#000000',
      safety_flags: presentation?.safety_flags ?? [],
      status: 'draft',
    });

    await insertPostgrestRow(config, 'admin_action_log', {
      actor_email: actorEmail,
      action: 'clone_product_draft',
      target_table: 'canonical_product',
      target_id: newId,
      before_state: { source_id: sourceId },
      after_state: { id: newId, status: 'draft' },
    });
  } catch {
    redirect(`/products/${sourceId}?error=clone_failed`);
  }

  revalidatePath('/products');
  redirect(`/products/${newId}?updated=clone`);
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
