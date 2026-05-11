import { trackArchiveEvent } from '@/src/analytics/events';
import { Submission } from '@/src/archive/types';
import { saveSubmission } from '@/src/storage/submissions';
import { getSavedContentStorage } from '@/src/storage/savedContent';

const PENDING_AUTH_ACTION_KEY = '@bath_time/pending_auth_action';

export type SubmitDraft = Omit<Submission, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'userId'>;

export type PendingAuthAction =
  | {
      type: 'save_content';
      contentId: string;
      returnTo: string;
      source?: string;
    }
  | {
      type: 'submit_draft';
      draft: SubmitDraft;
      returnTo: string;
    };

function canUseSessionStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

export function setPendingAuthAction(action: PendingAuthAction): void {
  if (!canUseSessionStorage()) return;
  window.sessionStorage.setItem(PENDING_AUTH_ACTION_KEY, JSON.stringify(action));
}

export function readPendingAuthAction(): PendingAuthAction | null {
  if (!canUseSessionStorage()) return null;

  try {
    const value = window.sessionStorage.getItem(PENDING_AUTH_ACTION_KEY);
    return value ? (JSON.parse(value) as PendingAuthAction) : null;
  } catch {
    return null;
  }
}

export function clearPendingAuthAction(): void {
  if (!canUseSessionStorage()) return;
  window.sessionStorage.removeItem(PENDING_AUTH_ACTION_KEY);
}

export async function completePendingAuthAction(): Promise<PendingAuthAction | null> {
  const action = readPendingAuthAction();
  if (!action) return null;

  if (action.type === 'save_content') {
    await getSavedContentStorage().save(action.contentId);
    trackArchiveEvent('content_saved', {
      contentId: action.contentId,
      source: action.source ?? 'auth_callback',
      pendingAction: action.type,
      platform: 'web',
    });
  } else {
    await saveSubmission(action.draft);
    trackArchiveEvent('submit_completed', {
      submissionType: action.draft.type,
      pendingAction: action.type,
      platform: 'web',
    });
  }

  clearPendingAuthAction();
  trackArchiveEvent('auth_required_action_completed', {
    pendingAction: action.type,
    platform: 'web',
  });
  return action;
}
