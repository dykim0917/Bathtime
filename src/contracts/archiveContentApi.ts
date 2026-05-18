import { type ArchiveContent } from '@/src/archive/types';

export interface ArchiveContentApiResponse {
  schema_version: 'archive-content.v1';
  snapshot_date: string;
  contents: ArchiveContent[];
}
