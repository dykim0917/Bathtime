import {
  readAdminPostgrestSessionConfig,
  readPostgrestRows,
} from './data/postgrest';

export interface AdminAudioTrackRow {
  id: string;
  title: string;
  type: 'music' | 'ambience';
  durationSeconds: number;
  source: 'bundled' | 'remote';
  personaCodes: string[];
  linkedRoutineCount: number;
  licenseNote: string;
  status: 'active' | 'draft' | 'paused' | 'retired';
}

const audioRows: AdminAudioTrackRow[] = [
  {
    id: 'care_sleep_ready',
    title: '수면 준비 케어 사운드',
    type: 'music',
    durationSeconds: 300,
    source: 'bundled',
    personaCodes: ['P4_SLEEP'],
    linkedRoutineCount: 1,
    licenseNote: 'bundled seed',
    status: 'active',
  },
  {
    id: 'trip_kyoto_forest',
    title: 'Kyoto Forest OST',
    type: 'music',
    durationSeconds: 260,
    source: 'bundled',
    personaCodes: ['P1_SAFETY'],
    linkedRoutineCount: 1,
    licenseNote: 'bundled seed',
    status: 'active',
  },
  {
    id: 'forest_rain',
    title: 'Forest Rain',
    type: 'ambience',
    durationSeconds: 300,
    source: 'bundled',
    personaCodes: ['P1_SAFETY', 'P4_SLEEP'],
    linkedRoutineCount: 1,
    licenseNote: 'bundled seed',
    status: 'active',
  },
  {
    id: 'fireplace',
    title: 'Fireplace',
    type: 'ambience',
    durationSeconds: 300,
    source: 'bundled',
    personaCodes: ['P4_SLEEP'],
    linkedRoutineCount: 1,
    licenseNote: 'bundled seed',
    status: 'active',
  },
];

interface AudioTrackRecord {
  id: string;
  title: string;
  type: AdminAudioTrackRow['type'];
  duration_seconds: number;
  remote_url?: string | null;
  persona_codes: string[];
  license_note?: string | null;
  status: AdminAudioTrackRow['status'];
}

interface TripThemeAudioRecord {
  music_id: string;
  ambience_id: string;
}

export interface AdminAudioListViewModel {
  rows: AdminAudioTrackRow[];
  totalCount: number;
  musicCount: number;
  ambienceCount: number;
  remoteCount: number;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function buildAdminAudioListViewModel(
  rows: AdminAudioTrackRow[] = audioRows
): AdminAudioListViewModel {
  return {
    rows,
    totalCount: rows.length,
    musicCount: rows.filter((row) => row.type === 'music').length,
    ambienceCount: rows.filter((row) => row.type === 'ambience').length,
    remoteCount: rows.filter((row) => row.source === 'remote').length,
  };
}

export async function readAdminAudioRows(): Promise<AdminAudioTrackRow[]> {
  const config = await readAdminPostgrestSessionConfig();
  if (!config) return audioRows;

  const [tracks, tripThemes] = await Promise.all([
    readPostgrestRows<AudioTrackRecord>(config, 'audio_track', {
      order: 'type.asc,id.asc',
    }),
    readPostgrestRows<TripThemeAudioRecord>(config, 'trip_theme'),
  ]);

  return tracks.map((track) => ({
    id: track.id,
    title: track.title,
    type: track.type,
    durationSeconds: track.duration_seconds,
    source: track.remote_url ? 'remote' : 'bundled',
    personaCodes: track.persona_codes,
    linkedRoutineCount: tripThemes.filter(
      (theme) => theme.music_id === track.id || theme.ambience_id === track.id
    ).length,
    licenseNote: track.license_note ?? '-',
    status: track.status,
  }));
}

export function getAudioStatusLabel(status: AdminAudioTrackRow['status']): string {
  if (status === 'draft') return 'Draft';
  if (status === 'paused') return 'Paused';
  if (status === 'retired') return 'Retired';
  return 'Active';
}
