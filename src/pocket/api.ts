import { requireSupabaseClient } from '@/src/auth/supabase';
import type { ArchiveEntityDraft, ArchiveJobStatus, ArchivePlatform } from './contracts';

export interface ArchiveSource {
  id: string;
  url: string;
  platform: ArchivePlatform;
  canonical_key: string;
  title: string;
  summary: string;
  creator: string;
  status: ArchiveJobStatus;
  reason: string | null;
  posted_at: string | null;
  checked_at: string | null;
  revision: number;
  links: Array<{
    entity_id: string;
    position: number;
    details: Pick<ArchiveEntityDraft, 'summary' | 'tags' | 'facts' | 'actionUrl'>;
    entity: { id: string; kind: 'place' | 'product'; name: string; location: string };
  }>;
}

export interface ArchiveSave {
  id: string;
  created_at: string;
  source: ArchiveSource;
}

export async function getArchiveSaves(): Promise<ArchiveSave[]> {
  const { data, error } = await requireSupabaseClient().from('archive_saves')
    .select('id,created_at,source:archive_sources(id,url,platform,canonical_key,title,summary,creator,status,reason,posted_at,checked_at,revision,links:archive_source_entities(entity_id,position,details,entity:archive_entities(id,kind,name,location)))')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ArchiveSave[];
}

export async function removeArchiveSave(saveId: string): Promise<void> {
  const { error } = await requireSupabaseClient().from('archive_saves').delete().eq('id', saveId);
  if (error) throw error;
}

export async function recordArchiveEvent(event: 'archive_opened' | 'detail_opened' | 'original_opened' | 'action_opened' | 'save_removed', sourceId?: string) {
  const client = requireSupabaseClient();
  const { data } = await client.auth.getSession();
  if (!data.session) return;
  // Analytics failure must not block opening or saving content.
  await client.from('archive_events').insert({ user_id: data.session.user.id, event, source_id: sourceId ?? null });
}
