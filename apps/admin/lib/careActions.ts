'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import {
  readAdminPostgrestSessionConfig,
  updatePostgrestRows,
} from './data/postgrest';
import type { AdminCareRoutineRow } from './careData';

const careStatuses: AdminCareRoutineRow['status'][] = [
  'active',
  'draft',
  'paused',
  'retired',
];

function isCareStatus(value: string): value is AdminCareRoutineRow['status'] {
  return careStatuses.includes(value as AdminCareRoutineRow['status']);
}

export async function updateCareRoutineStatus(formData: FormData) {
  const id = String(formData.get('id') ?? '').trim();
  const status = String(formData.get('status') ?? '').trim();

  if (!id || !isCareStatus(status)) {
    redirect('/care?error=invalid_status');
  }

  const config = await readAdminPostgrestSessionConfig();
  if (!config) {
    redirect('/care?error=missing_content_db');
  }

  try {
    await updatePostgrestRows(config, 'care_intent', { id: `eq.${id}` }, { status });
  } catch {
    redirect('/care?error=update_failed');
  }

  revalidatePath('/care');
  redirect('/care?updated=status');
}
