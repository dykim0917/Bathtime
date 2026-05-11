import { Submission } from '@/src/archive/types';
import { requireSupabaseClient } from '@/src/auth/supabase';
import { getAuthenticatedUserId } from '@/src/storage/savedContent';

type SubmissionInput = Omit<Submission, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'userId'>;

type SubmissionRow = {
  id: string;
  user_id: string;
  type: Submission['type'];
  link_or_image: string | null;
  comment: string;
  nickname: string | null;
  can_publish: boolean | null;
  status: Submission['status'];
  created_at: string;
  updated_at: string;
};

function mapSubmissionRow(row: SubmissionRow): Submission {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    linkOrImage: row.link_or_image ?? undefined,
    comment: row.comment,
    nickname: row.nickname ?? undefined,
    canPublish: row.can_publish ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function loadSubmissions(): Promise<Submission[]> {
  const supabase = requireSupabaseClient();
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as SubmissionRow[]).map(mapSubmissionRow);
}

export async function saveSubmission(input: SubmissionInput): Promise<Submission> {
  const supabase = requireSupabaseClient();
  const userId = await getAuthenticatedUserId({ ensureProfile: true });

  const { data, error } = await supabase
    .from('submissions')
    .insert({
      user_id: userId,
      type: input.type,
      link_or_image: input.linkOrImage ?? null,
      comment: input.comment,
      nickname: input.nickname ?? null,
      can_publish: input.canPublish ?? null,
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapSubmissionRow(data as SubmissionRow);
}
