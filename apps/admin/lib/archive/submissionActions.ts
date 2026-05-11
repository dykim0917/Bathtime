'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { updateP0SubmissionStatus } from '../../../../src/server/archiveSubmissionStore';
import { readAdminPostgrestSessionConfig, updatePostgrestRows } from '../data/postgrest';
import type { SubmissionStatus } from './data';

const statuses: SubmissionStatus[] = ['new', 'reviewing', 'accepted', 'rejected'];

function isSubmissionStatus(value: string): value is SubmissionStatus {
  return statuses.includes(value as SubmissionStatus);
}

export async function updateSubmissionStatus(formData: FormData) {
  const id = String(formData.get('id') ?? '').trim();
  const status = String(formData.get('status') ?? '').trim();

  if (!id || !isSubmissionStatus(status)) {
    redirect('/submissions?error=invalid_status');
  }

  const config = await readAdminPostgrestSessionConfig();
  if (config) {
    try {
      await updatePostgrestRows(
        config,
        'submissions',
        { id: `eq.${id}` },
        { status, updated_at: new Date().toISOString() }
      );
    } catch {
      redirect('/submissions?error=submission_not_found');
    }
  } else {
    const updated = await updateP0SubmissionStatus(id, status);
    if (!updated) {
      redirect('/submissions?error=submission_not_found');
    }
  }

  revalidatePath('/submissions');
  revalidatePath(`/submissions/${id}`);
  redirect(`/submissions/${id}?updated=status`);
}
