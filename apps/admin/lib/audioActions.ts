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

interface AudioTrackRecord {
  id: string;
  type: AdminAudioTrackRow['type'];
  title: string;
  filename?: string | null;
  remote_url?: string | null;
  duration_seconds: number;
  persona_codes: string[];
  license_note?: string | null;
  status: AdminAudioTrackRow['status'];
}

function buildCloneId(sourceId: string): string {
  return `${sourceId}_copy_${Date.now().toString(36)}`;
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

export async function cloneAudioTrackDraft(formData: FormData) {
  const sourceId = String(formData.get('id') ?? '').trim();

  if (!sourceId) {
    redirect('/audio?error=invalid_clone');
  }

  const config = await readAdminPostgrestSessionConfig();
  if (!config) {
    redirect(`/audio/${sourceId}?error=missing_content_db`);
  }

  const actorEmail = await getCurrentAdminEmail();
  if (!actorEmail) {
    redirect(`/audio/${sourceId}?error=missing_admin`);
  }

  let source: AudioTrackRecord | undefined;

  try {
    const tracks = await readPostgrestRows<AudioTrackRecord>(config, 'audio_track', {
      id: `eq.${sourceId}`,
      limit: '1',
    });
    source = tracks[0];
  } catch {
    redirect(`/audio/${sourceId}?error=clone_failed`);
  }

  if (!source) {
    redirect('/audio?error=clone_source_missing');
  }

  const newId = buildCloneId(source.id);

  try {
    await insertPostgrestRow(config, 'audio_track', {
      id: newId,
      type: source.type,
      title: `${source.title} Copy`,
      filename: source.filename ?? null,
      remote_url: source.remote_url ?? null,
      duration_seconds: source.duration_seconds,
      persona_codes: source.persona_codes,
      license_note: source.license_note ?? null,
      status: 'draft',
    });

    await insertPostgrestRow(config, 'admin_action_log', {
      actor_email: actorEmail,
      action: 'clone_audio_draft',
      target_table: 'audio_track',
      target_id: newId,
      before_state: { source_id: sourceId },
      after_state: { id: newId, status: 'draft' },
    });
  } catch {
    redirect(`/audio/${sourceId}?error=clone_failed`);
  }

  revalidatePath('/audio');
  redirect(`/audio/${newId}?updated=clone`);
}
