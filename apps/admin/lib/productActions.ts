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
