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

interface TripThemeRecord {
  id: string;
  cover_style_id: string;
  title: string;
  subtitle: string;
  base_temp: number;
  color_hex: string;
  rec_scent: string;
  music_id: string;
  ambience_id: string;
  default_bath_type: string;
  recommended_environment: string;
  duration_minutes: number | null;
  lighting: string;
  status: AdminTripThemeRow['status'];
}

interface TripIntentRecord {
  id: string;
  intent_id: string;
  mapped_mode: string;
  allowed_environments: string[];
  copy_title: string;
  copy_subtitle_by_environment: Record<string, string>;
  default_subprotocol_id: string;
  card_position: number;
  status: AdminTripThemeRow['status'];
}

interface TripSubprotocolRecord {
  id: string;
  intent_id: string;
  label: string;
  hint: string;
  is_default: boolean;
  partial_overrides: Record<string, unknown>;
  status: AdminTripThemeRow['status'];
}

function buildCloneSuffix(): string {
  return Date.now().toString(36);
}

function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
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

export async function cloneTripThemeDraft(formData: FormData) {
  const sourceId = String(formData.get('id') ?? '').trim();

  if (!sourceId) {
    redirect('/trip?error=invalid_clone');
  }

  const config = await readAdminPostgrestSessionConfig();
  if (!config) {
    redirect(`/trip/${sourceId}?error=missing_content_db`);
  }

  const actorEmail = await getCurrentAdminEmail();
  if (!actorEmail) {
    redirect(`/trip/${sourceId}?error=missing_admin`);
  }

  let source: TripThemeRecord | undefined;
  let intent: TripIntentRecord | undefined;
  let subprotocols: TripSubprotocolRecord[] = [];

  try {
    const themes = await readPostgrestRows<TripThemeRecord>(config, 'trip_theme', {
      id: `eq.${sourceId}`,
      limit: '1',
    });
    source = themes[0];

    if (source) {
      const intents = await readPostgrestRows<TripIntentRecord>(
        config,
        'trip_intent',
        { intent_id: `eq.${source.id}`, limit: '1' }
      );
      intent = intents[0];
    }

    if (intent) {
      subprotocols = await readPostgrestRows<TripSubprotocolRecord>(
        config,
        'trip_subprotocol',
        { intent_id: `eq.${intent.intent_id}` }
      );
    }
  } catch {
    redirect(`/trip/${sourceId}?error=clone_failed`);
  }

  if (!source) {
    redirect('/trip?error=clone_source_missing');
  }

  const suffix = buildCloneSuffix();
  const newId = `${source.id}_copy_${suffix}`;
  const subprotocolIdMap = new Map(
    subprotocols.map((subprotocol) => [
      subprotocol.id,
      `${subprotocol.id}_copy_${suffix}`,
    ])
  );
  const newDefaultSubprotocolId = intent
    ? subprotocolIdMap.get(intent.default_subprotocol_id) ??
      `${intent.default_subprotocol_id}_copy_${suffix}`
    : '';

  try {
    await insertPostgrestRow(config, 'trip_theme', {
      id: newId,
      cover_style_id: source.cover_style_id,
      title: `${source.title} Copy`,
      subtitle: source.subtitle,
      base_temp: source.base_temp,
      color_hex: source.color_hex,
      rec_scent: source.rec_scent,
      music_id: source.music_id,
      ambience_id: source.ambience_id,
      default_bath_type: source.default_bath_type,
      recommended_environment: source.recommended_environment,
      duration_minutes: source.duration_minutes,
      lighting: source.lighting,
      status: 'draft',
    });

    if (intent) {
      await insertPostgrestRow(config, 'trip_intent', {
        id: `${intent.id}_copy_${suffix}`,
        intent_id: newId,
        mapped_mode: intent.mapped_mode,
        allowed_environments: intent.allowed_environments,
        copy_title: `${intent.copy_title} 복사본`,
        copy_subtitle_by_environment: intent.copy_subtitle_by_environment,
        default_subprotocol_id: newDefaultSubprotocolId,
        card_position: intent.card_position,
        status: 'draft',
      });

      await Promise.all(
        subprotocols.map((subprotocol) =>
          insertPostgrestRow(config, 'trip_subprotocol', {
            id: subprotocolIdMap.get(subprotocol.id) ?? `${subprotocol.id}_copy_${suffix}`,
            intent_id: newId,
            label: subprotocol.label,
            hint: subprotocol.hint,
            is_default: subprotocol.is_default,
            partial_overrides: subprotocol.partial_overrides,
            status: 'draft',
          })
        )
      );
    }

    await insertPostgrestRow(config, 'admin_action_log', {
      actor_email: actorEmail,
      action: 'clone_trip_draft',
      target_table: 'trip_theme',
      target_id: newId,
      before_state: { source_id: sourceId },
      after_state: { id: newId, status: 'draft' },
    });
  } catch {
    redirect(`/trip/${sourceId}?error=clone_failed`);
  }

  revalidatePath('/trip');
  redirect(`/trip/${newId}?updated=clone`);
}

export async function updateTripThemeBasicInfo(formData: FormData) {
  const id = String(formData.get('id') ?? '').trim();
  const title = String(formData.get('title') ?? '').trim();
  const subtitle = String(formData.get('subtitle') ?? '').trim();
  const baseTemp = Number(String(formData.get('baseTemp') ?? '').trim());
  const colorHex = String(formData.get('colorHex') ?? '').trim();
  const recScent = String(formData.get('recScent') ?? '').trim();
  const defaultBathType = String(formData.get('defaultBathType') ?? '').trim();
  const environment = String(formData.get('environment') ?? '').trim();
  const durationMinutes = Number(String(formData.get('durationMinutes') ?? '').trim());
  const lighting = String(formData.get('lighting') ?? '').trim();

  if (
    !id ||
    !title ||
    !subtitle ||
    !Number.isInteger(baseTemp) ||
    !isHexColor(colorHex) ||
    !recScent ||
    !defaultBathType ||
    !environment ||
    !Number.isInteger(durationMinutes) ||
    durationMinutes <= 0 ||
    !lighting
  ) {
    redirect(`/trip/${id || ''}?error=invalid_basic_info`);
  }

  const config = await readAdminPostgrestSessionConfig();
  if (!config) {
    redirect(`/trip/${id}?error=missing_content_db`);
  }

  try {
    await updatePostgrestRows(
      config,
      'trip_theme',
      { id: `eq.${id}` },
      {
        title,
        subtitle,
        base_temp: baseTemp,
        color_hex: colorHex,
        rec_scent: recScent,
        default_bath_type: defaultBathType,
        recommended_environment: environment,
        duration_minutes: durationMinutes,
        lighting,
      }
    );
  } catch {
    redirect(`/trip/${id}?error=update_failed`);
  }

  revalidatePath('/trip');
  revalidatePath(`/trip/${id}`);
  redirect(`/trip/${id}?updated=basic_info`);
}
