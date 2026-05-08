import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { submissionSeeds } from '../archive/seed';
import { Submission, SubmissionStatus } from '../archive/types';

export type SubmissionInput = Omit<Submission, 'id' | 'status' | 'createdAt' | 'updatedAt'>;

const STORE_ENV_KEY = 'BATH_TIME_SUBMISSIONS_FILE';

function findProjectRoot(startDir = process.cwd()): string {
  let current = startDir;

  for (let index = 0; index < 6; index += 1) {
    if (path.basename(current) === 'BathSommelier') return current;
    const parent = path.dirname(current);
    if (parent === current) return startDir;
    current = parent;
  }

  return startDir;
}

export function getSubmissionStorePath(): string {
  const configuredPath = process.env[STORE_ENV_KEY]?.trim();
  if (configuredPath) return configuredPath;
  return path.join(findProjectRoot(), '.data', 'p0-submissions.json');
}

function cloneSeedSubmissions(): Submission[] {
  return submissionSeeds.map((item) => ({ ...item }));
}

async function writeSubmissionsFile(submissions: Submission[]): Promise<void> {
  const storePath = getSubmissionStorePath();
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, `${JSON.stringify(submissions, null, 2)}\n`, 'utf8');
}

export async function readP0Submissions(): Promise<Submission[]> {
  try {
    const file = await readFile(getSubmissionStorePath(), 'utf8');
    const parsed = JSON.parse(file) as Submission[];
    return Array.isArray(parsed) ? parsed : cloneSeedSubmissions();
  } catch {
    return cloneSeedSubmissions();
  }
}

export async function createP0Submission(input: SubmissionInput): Promise<Submission> {
  const now = new Date().toISOString();
  const submission: Submission = {
    ...input,
    id: `submission-${Date.now()}`,
    status: 'new',
    createdAt: now,
    updatedAt: now,
  };
  const submissions = await readP0Submissions();
  await writeSubmissionsFile([submission, ...submissions]);
  return submission;
}

export async function updateP0SubmissionStatus(id: string, status: SubmissionStatus): Promise<Submission | null> {
  const submissions = await readP0Submissions();
  let updated: Submission | null = null;
  const next = submissions.map((submission) => {
    if (submission.id !== id) return submission;
    updated = {
      ...submission,
      status,
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });

  if (!updated) return null;
  await writeSubmissionsFile(next);
  return updated;
}

