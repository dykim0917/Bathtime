import {
  readAdminPostgrestSessionConfig,
  readPostgrestRows,
} from './data/postgrest';

export interface AdminTripThemeRow {
  id: string;
  title: string;
  subtitle: string;
  environment: string;
  baseTemp: number;
  colorHex: string;
  recScent: string;
  defaultBathType: string;
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
    subtitle: '숲비가 내리는 교토의 고요함',
    environment: 'bathtub',
    baseTemp: 39,
    colorHex: '#4f7d69',
    recScent: 'hinoki',
    defaultBathType: 'soak',
    durationMinutes: 18,
    musicId: 'trip_kyoto_forest',
    ambienceId: 'forest_rain',
    lighting: '따뜻한 녹색 간접 조명',
    status: 'active',
  },
  {
    id: 'nordic_sauna',
    title: 'Nordic Sauna',
    subtitle: '건식 사우나의 따뜻한 나무결',
    environment: 'bathtub',
    baseTemp: 40,
    colorHex: '#b97a56',
    recScent: 'cedar',
    defaultBathType: 'soak',
    durationMinutes: 16,
    musicId: 'trip_nordic_sauna',
    ambienceId: 'sauna_wood',
    lighting: '낮은 앰버 조명',
    status: 'active',
  },
  {
    id: 'rainy_camping',
    title: 'Rainy Camping',
    subtitle: '비 오는 텐트 안의 낮은 안정감',
    environment: 'partial_bath',
    baseTemp: 38,
    colorHex: '#5f7480',
    recScent: 'rain',
    defaultBathType: 'partial',
    durationMinutes: 14,
    musicId: 'trip_rainy_camping',
    ambienceId: 'rain_tent',
    lighting: '블루 그레이 저조도',
    status: 'active',
  },
  {
    id: 'snow_cabin',
    title: 'Snow Cabin',
    subtitle: '눈 내린 오두막의 조용한 온기',
    environment: 'bathtub',
    baseTemp: 39,
    colorHex: '#dfe8ec',
    recScent: 'pine',
    defaultBathType: 'soak',
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
  subtitle: string;
  recommended_environment: string;
  base_temp: number;
  color_hex: string;
  rec_scent: string;
  default_bath_type: string;
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
    subtitle: theme.subtitle,
    environment: theme.recommended_environment,
    baseTemp: theme.base_temp,
    colorHex: theme.color_hex,
    recScent: theme.rec_scent,
    defaultBathType: theme.default_bath_type,
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
