import { trackArchiveEvent } from '@/src/analytics/events';
import { Submission } from '@/src/archive/types';
import { saveSubmission } from '@/src/storage/submissions';
import { getSavedContentStorage } from '@/src/storage/savedContent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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

export async function setPendingAuthAction(action: PendingAuthAction): Promise<void> {
  if (canUseSessionStorage()) {
    window.sessionStorage.setItem(PENDING_AUTH_ACTION_KEY, JSON.stringify(action));
    return;
  }
  await AsyncStorage.setItem(PENDING_AUTH_ACTION_KEY, JSON.stringify(action));
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
  if (canUseSessionStorage()) {
    window.sessionStorage.removeItem(PENDING_AUTH_ACTION_KEY);
    return;
  }
  void AsyncStorage.removeItem(PENDING_AUTH_ACTION_KEY);
}

export async function readPendingAuthActionAsync(): Promise<PendingAuthAction | null> {
  if (canUseSessionStorage()) return readPendingAuthAction();

  try {
    const value = await AsyncStorage.getItem(PENDING_AUTH_ACTION_KEY);
    return value ? (JSON.parse(value) as PendingAuthAction) : null;
  } catch {
    return null;
  }
}

export async function clearPendingAuthActionAsync(): Promise<void> {
  if (canUseSessionStorage()) {
    clearPendingAuthAction();
    return;
  }
  await AsyncStorage.removeItem(PENDING_AUTH_ACTION_KEY);
}

export async function completePendingAuthAction(): Promise<PendingAuthAction | null> {
  const action = await readPendingAuthActionAsync();
  if (!action) return null;

  if (action.type === 'save_content') {
    await getSavedContentStorage().save(action.contentId);
    trackArchiveEvent('content_saved', {
      contentId: action.contentId,
      source: action.source ?? 'auth_callback',
      pendingAction: action.type,
      platform: Platform.OS === 'web' ? 'web' : 'native',
    });
  } else {
    await saveSubmission(action.draft);
    trackArchiveEvent('submit_completed', {
      submissionType: action.draft.type,
      pendingAction: action.type,
      platform: Platform.OS === 'web' ? 'web' : 'native',
    });
  }

  await clearPendingAuthActionAsync();
  trackArchiveEvent('auth_required_action_completed', {
    pendingAction: action.type,
    platform: Platform.OS === 'web' ? 'web' : 'native',
  });
  return action;
}
