'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import {
  readAdminPostgrestSessionConfig,
  updatePostgrestRows,
} from './data/postgrest';
import type { AdminAudioTrackRow } from './audioData';

const audioStatuses: AdminAudioTrackRow['status'][] = [
  'active',
  'draft',
  'paused',
  'retired',
];

function isAudioStatus(value: string): value is AdminAudioTrackRow['status'] {
  return audioStatuses.includes(value as AdminAudioTrackRow['status']);
}

export async function updateAudioTrackStatus(formData: FormData) {
  const id = String(formData.get('id') ?? '').trim();
  const status = String(formData.get('status') ?? '').trim();

  if (!id || !isAudioStatus(status)) {
    redirect('/audio?error=invalid_status');
  }

  const config = await readAdminPostgrestSessionConfig();
  if (!config) {
    redirect('/audio?error=missing_content_db');
  }

  try {
    await updatePostgrestRows(config, 'audio_track', { id: `eq.${id}` }, { status });
  } catch {
    redirect('/audio?error=update_failed');
  }

  revalidatePath('/audio');
  redirect('/audio?updated=status');
}
