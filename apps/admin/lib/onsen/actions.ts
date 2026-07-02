'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { readAdminPostgrestSessionConfig, upsertPostgrestRow } from '../data/postgrest';
import {
  bathScopeLabels,
  onsenStatusLabels,
  waterSourceTypeLabels,
  waterUseStatusLabels,
  type OnsenAdminStatus,
  type OnsenBathScope,
  type OnsenEvidenceCounts,
  type OnsenWaterSourceType,
  type OnsenWaterUseStatus,
} from './data';

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function isRecordKey<T extends Record<string, unknown>>(record: T, value: string): value is Extract<keyof T, string> {
  return Object.prototype.hasOwnProperty.call(record, value);
}

function parseListField(value: FormDataEntryValue | null): string[] {
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNullableNumber(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : null;
}

function parseEvidenceCounts(formData: FormData): OnsenEvidenceCounts {
  return {
    directReviewCount: parseNullableNumber(formData.get('directReviewCount')),
    onsenReviewCount: parseNullableNumber(formData.get('onsenReviewCount')),
    roomBathMentionCount: parseNullableNumber(formData.get('roomBathMentionCount')),
    publicBathMentionCount: parseNullableNumber(formData.get('publicBathMentionCount')),
    privateBathMentionCount: parseNullableNumber(formData.get('privateBathMentionCount')),
    waterTextureMentionCount: parseNullableNumber(formData.get('waterTextureMentionCount')),
    cautionMentionCount: parseNullableNumber(formData.get('cautionMentionCount')),
  };
}

export async function updateOnsenAccommodation(formData: FormData) {
  const slug = String(formData.get('slug') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const jaName = String(formData.get('jaName') ?? '').trim();
  const region = String(formData.get('region') ?? '').trim();
  const area = String(formData.get('area') ?? '').trim();
  const summary = String(formData.get('summary') ?? '').trim();
  const primaryBath = String(formData.get('primaryBath') ?? '').trim();
  const waterUseStatus = String(formData.get('waterUseStatus') ?? '').trim();
  const waterSourceType = String(formData.get('waterSourceType') ?? '').trim();
  const bathScope = String(formData.get('bathScope') ?? '').trim();
  const status = String(formData.get('status') ?? '').trim();
  const evidenceGrade = String(formData.get('evidenceGrade') ?? '').trim();
  const evidenceNote = String(formData.get('evidenceNote') ?? '').trim();
  const operationNotes = parseListField(formData.get('operationNotes'));
  const evidenceCounts = parseEvidenceCounts(formData);

  if (
    !slug ||
    !name ||
    !region ||
    !summary ||
    !isRecordKey(waterUseStatusLabels, waterUseStatus) ||
    !isRecordKey(waterSourceTypeLabels, waterSourceType) ||
    !isRecordKey(bathScopeLabels, bathScope) ||
    !isRecordKey(onsenStatusLabels, status) ||
    !(evidenceGrade === 'A' || evidenceGrade === 'B' || evidenceGrade === 'C' || evidenceGrade === 'D')
  ) {
    redirect(`/onsen/${slug || ''}?error=invalid_onsen_data`);
  }

  const config = await readAdminPostgrestSessionConfig();
  if (!config) {
    redirect(`/onsen/${slug}?error=missing_onsen_db`);
  }

  try {
    await upsertPostgrestRow(
      config,
      'onsen_accommodations',
      {
        slug,
        name,
        ja_name: jaName || null,
        region,
        area: area || null,
        summary,
        primary_bath: primaryBath || null,
        water_use_status: waterUseStatus satisfies OnsenWaterUseStatus,
        water_source_type: waterSourceType satisfies OnsenWaterSourceType,
        bath_scope: bathScope satisfies OnsenBathScope,
        operation_notes: operationNotes,
        evidence_counts: evidenceCounts,
        evidence_grade: evidenceGrade,
        evidence_note: evidenceNote || null,
        status: status satisfies OnsenAdminStatus,
        content_updated_at: todayDateString(),
      },
      'slug'
    );
  } catch {
    redirect(`/onsen/${slug}?error=update_failed`);
  }

  revalidatePath('/onsen');
  revalidatePath(`/onsen/${slug}`);
  redirect(`/onsen/${slug}?updated=onsen`);
}
