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

export function getAudioStatusLabel(status: AdminAudioTrackRow['status']): string {
  if (status === 'draft') return 'Draft';
  if (status === 'paused') return 'Paused';
  if (status === 'retired') return 'Retired';
  return 'Active';
}
