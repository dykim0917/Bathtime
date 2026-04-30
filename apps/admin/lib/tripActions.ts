'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import {
  readAdminPostgrestSessionConfig,
  updatePostgrestRows,
} from './data/postgrest';
import type { AdminTripThemeRow } from './tripData';

const tripStatuses: AdminTripThemeRow['status'][] = [
  'active',
  'draft',
  'paused',
  'retired',
];

function isTripStatus(value: string): value is AdminTripThemeRow['status'] {
  return tripStatuses.includes(value as AdminTripThemeRow['status']);
}

export async function updateTripThemeStatus(formData: FormData) {
  const id = String(formData.get('id') ?? '').trim();
  const status = String(formData.get('status') ?? '').trim();

  if (!id || !isTripStatus(status)) {
    redirect('/trip?error=invalid_status');
  }

  const config = await readAdminPostgrestSessionConfig();
  if (!config) {
    redirect('/trip?error=missing_content_db');
  }

  try {
    await updatePostgrestRows(config, 'trip_theme', { id: `eq.${id}` }, { status });
  } catch {
    redirect('/trip?error=update_failed');
  }

  revalidatePath('/trip');
  redirect('/trip?updated=status');
}
