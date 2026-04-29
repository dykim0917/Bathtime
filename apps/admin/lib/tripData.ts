import {
  readAdminPostgrestSessionConfig,
  readPostgrestRows,
} from './data/postgrest';

export interface AdminTripThemeRow {
  id: string;
  title: string;
  environment: string;
  baseTemp: number;
  durationMinutes: number;
  musicId: string;
  ambienceId: string;
  lighting: string;
  status: 'active' | 'draft' | 'paused' | 'retired';
}

const tripRows: AdminTripThemeRow[] = [
  {
    id: 'kyoto_forest',
    title: 'Kyoto Forest',
    environment: 'bathtub',
    baseTemp: 39,
    durationMinutes: 18,
    musicId: 'trip_kyoto_forest',
    ambienceId: 'forest_rain',
    lighting: '따뜻한 녹색 간접 조명',
    status: 'active',
  },
  {
    id: 'nordic_sauna',
    title: 'Nordic Sauna',
    environment: 'bathtub',
    baseTemp: 40,
    durationMinutes: 16,
    musicId: 'trip_nordic_sauna',
    ambienceId: 'sauna_wood',
    lighting: '낮은 앰버 조명',
    status: 'active',
  },
  {
    id: 'rainy_camping',
    title: 'Rainy Camping',
    environment: 'partial_bath',
    baseTemp: 38,
    durationMinutes: 14,
    musicId: 'trip_rainy_camping',
    ambienceId: 'rain_tent',
    lighting: '블루 그레이 저조도',
    status: 'active',
  },
  {
    id: 'snow_cabin',
    title: 'Snow Cabin',
    environment: 'bathtub',
    baseTemp: 39,
    durationMinutes: 18,
    musicId: 'trip_snow_cabin',
    ambienceId: 'fireplace',
    lighting: '차가운 화이트와 웜 포인트',
    status: 'active',
  },
];

interface TripThemeRecord {
  id: string;
  title: string;
  recommended_environment: string;
  base_temp: number;
  duration_minutes: number | null;
  music_id: string;
  ambience_id: string;
  lighting: string;
  status: AdminTripThemeRow['status'];
}

export interface AdminTripListViewModel {
  rows: AdminTripThemeRow[];
  totalCount: number;
  activeCount: number;
  averageDurationMinutes: number;
  linkedAudioCount: number;
}

export function buildAdminTripListViewModel(
  rows: AdminTripThemeRow[] = tripRows
): AdminTripListViewModel {
  return {
    rows,
    totalCount: rows.length,
    activeCount: rows.filter((row) => row.status === 'active').length,
    averageDurationMinutes: Math.round(
      rows.reduce((total, row) => total + row.durationMinutes, 0) / rows.length
    ),
    linkedAudioCount: new Set(rows.flatMap((row) => [row.musicId, row.ambienceId])).size,
  };
}

export async function readAdminTripRows(): Promise<AdminTripThemeRow[]> {
  const config = await readAdminPostgrestSessionConfig();
  if (!config) return tripRows;

  const themes = await readPostgrestRows<TripThemeRecord>(config, 'trip_theme', {
    order: 'id.asc',
  });

  return themes.map((theme) => ({
    id: theme.id,
    title: theme.title,
    environment: theme.recommended_environment,
    baseTemp: theme.base_temp,
    durationMinutes: theme.duration_minutes ?? 0,
    musicId: theme.music_id,
    ambienceId: theme.ambience_id,
    lighting: theme.lighting,
    status: theme.status,
  }));
}

export function getTripStatusLabel(status: AdminTripThemeRow['status']): string {
  if (status === 'draft') return 'Draft';
  if (status === 'paused') return 'Paused';
  if (status === 'retired') return 'Retired';
  return 'Active';
}
