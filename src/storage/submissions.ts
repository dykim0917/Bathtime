import { Platform } from 'react-native';
import { Submission } from '@/src/archive/types';

const WEB_KEY = '@bath_time/submissions';
const DEFAULT_WEB_ENDPOINT = '/api/submissions';

function getSubmissionsEndpoint(): string {
  return process.env.EXPO_PUBLIC_SUBMISSIONS_API_URL?.trim() || DEFAULT_WEB_ENDPOINT;
}

function readWebSubmissions(): Submission[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = window.localStorage.getItem(WEB_KEY);
    if (!data) return [];
    return JSON.parse(data) as Submission[];
  } catch {
    return [];
  }
}

function writeWebSubmissions(submissions: Submission[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(WEB_KEY, JSON.stringify(submissions));
}

export async function loadSubmissions(): Promise<Submission[]> {
  if (Platform.OS !== 'web') return [];
  try {
    const response = await fetch(getSubmissionsEndpoint());
    if (!response.ok) return readWebSubmissions();
    const payload = await response.json() as { submissions?: Submission[] };
    return payload.submissions ?? readWebSubmissions();
  } catch {
    return readWebSubmissions();
  }
}

export async function saveSubmission(input: Omit<Submission, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Submission> {
  if (Platform.OS === 'web') {
    try {
      const response = await fetch(getSubmissionsEndpoint(), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (response.ok) {
        const payload = await response.json() as { submission?: Submission };
        if (payload.submission) return payload.submission;
      }
    } catch {
      // Fall through to local fallback so the user does not lose a draft.
    }
  }

  const now = new Date().toISOString();
  const submission: Submission = {
    ...input,
    id: `submission-${Date.now()}`,
    status: 'new',
    createdAt: now,
    updatedAt: now,
  };

  if (Platform.OS === 'web') {
    writeWebSubmissions([submission, ...readWebSubmissions()]);
  }

  return submission;
}
