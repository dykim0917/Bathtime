'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getCurrentAdminEmail } from './auth/server';
import {
  insertPostgrestRow,
  readAdminPostgrestSessionConfig,
} from './data/postgrest';
import {
  buildPublishValidationViewModel,
  countFailedChecks,
} from './publishValidation';

function buildMetricsPayload(metrics: { label: string; value: number | string }[]) {
  return Object.fromEntries(metrics.map((metric) => [metric.label, metric.value]));
}

export async function publishContentSnapshot() {
  const config = await readAdminPostgrestSessionConfig();
  if (!config) {
    redirect('/publish?error=missing_content_db');
  }

  const validation = await buildPublishValidationViewModel();
  if (!validation.configured) {
    redirect('/publish?error=missing_snapshot');
  }

  if (countFailedChecks(validation.checks) > 0) {
    redirect('/publish?error=validation_failed');
  }

  const actorEmail = await getCurrentAdminEmail();
  if (!actorEmail) {
    redirect('/publish?error=missing_admin');
  }

  try {
    await insertPostgrestRow(config, 'admin_action_log', {
      actor_email: actorEmail,
      action: 'publish_snapshot',
      target_table: 'content_snapshot',
      target_id: validation.snapshotDate ?? validation.checkedAt,
      before_state: null,
      after_state: {
        checked_at: validation.checkedAt,
        metrics: buildMetricsPayload(validation.metrics),
        snapshot_date: validation.snapshotDate,
        snapshot_url: validation.snapshotUrl,
        status: validation.status,
      },
    });
  } catch {
    redirect('/publish?error=publish_log_failed');
  }

  revalidatePath('/');
  revalidatePath('/publish');
  redirect('/publish?updated=publish');
}
