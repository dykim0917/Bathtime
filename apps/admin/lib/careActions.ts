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

interface CareIntentRecord {
  id: string;
  intent_id: string;
  mapped_mode: string;
  allowed_environments: string[];
  copy_title: string;
  copy_subtitle_by_environment: Record<string, string>;
  default_subprotocol_id: string;
  card_position: number;
  status: AdminCareRoutineRow['status'];
}

interface CareSubprotocolRecord {
  id: string;
  intent_id: string;
  label: string;
  hint: string;
  is_default: boolean;
  partial_overrides: Record<string, unknown>;
  status: AdminCareRoutineRow['status'];
}

function buildCloneSuffix(): string {
  return Date.now().toString(36);
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

export async function cloneCareRoutineDraft(formData: FormData) {
  const sourceId = String(formData.get('id') ?? '').trim();

  if (!sourceId) {
    redirect('/care?error=invalid_clone');
  }

  const config = await readAdminPostgrestSessionConfig();
  if (!config) {
    redirect(`/care/${sourceId}?error=missing_content_db`);
  }

  const actorEmail = await getCurrentAdminEmail();
  if (!actorEmail) {
    redirect(`/care/${sourceId}?error=missing_admin`);
  }

  let source: CareIntentRecord | undefined;
  let subprotocols: CareSubprotocolRecord[] = [];

  try {
    const intents = await readPostgrestRows<CareIntentRecord>(config, 'care_intent', {
      id: `eq.${sourceId}`,
      limit: '1',
    });
    source = intents[0];

    if (source) {
      subprotocols = await readPostgrestRows<CareSubprotocolRecord>(
        config,
        'care_subprotocol',
        { intent_id: `eq.${source.intent_id}` }
      );
    }
  } catch {
    redirect(`/care/${sourceId}?error=clone_failed`);
  }

  if (!source) {
    redirect('/care?error=clone_source_missing');
  }

  const suffix = buildCloneSuffix();
  const newId = `${source.id}_copy_${suffix}`;
  const newIntentId = `${source.intent_id}_copy_${suffix}`;
  const subprotocolIdMap = new Map(
    subprotocols.map((subprotocol) => [
      subprotocol.id,
      `${subprotocol.id}_copy_${suffix}`,
    ])
  );
  const newDefaultSubprotocolId =
    subprotocolIdMap.get(source.default_subprotocol_id) ??
    `${source.default_subprotocol_id}_copy_${suffix}`;

  try {
    await insertPostgrestRow(config, 'care_intent', {
      id: newId,
      intent_id: newIntentId,
      mapped_mode: source.mapped_mode,
      allowed_environments: source.allowed_environments,
      copy_title: `${source.copy_title} 복사본`,
      copy_subtitle_by_environment: source.copy_subtitle_by_environment,
      default_subprotocol_id: newDefaultSubprotocolId,
      card_position: source.card_position,
      status: 'draft',
    });

    await Promise.all(
      subprotocols.map((subprotocol) =>
        insertPostgrestRow(config, 'care_subprotocol', {
          id: subprotocolIdMap.get(subprotocol.id) ?? `${subprotocol.id}_copy_${suffix}`,
          intent_id: newIntentId,
          label: subprotocol.label,
          hint: subprotocol.hint,
          is_default: subprotocol.is_default,
          partial_overrides: subprotocol.partial_overrides,
          status: 'draft',
        })
      )
    );

    await insertPostgrestRow(config, 'admin_action_log', {
      actor_email: actorEmail,
      action: 'clone_care_draft',
      target_table: 'care_intent',
      target_id: newId,
      before_state: { source_id: sourceId },
      after_state: { id: newId, intent_id: newIntentId, status: 'draft' },
    });
  } catch {
    redirect(`/care/${sourceId}?error=clone_failed`);
  }

  revalidatePath('/care');
  redirect(`/care/${newId}?updated=clone`);
}
