import {
  type AmbienceTrack,
  type CanonicalBathEnvironment,
  type HealthCondition,
  type HomeModeType,
  type IntentDomain,
  type MusicTrack,
  type PersonaCode,
  type SubProtocolOverrides,
  type ThemePreset,
} from '@/src/engine/types';
import { type CatalogApiResponse } from '@/src/contracts/catalogApi';

export type ContentApiStatus = 'draft' | 'active' | 'paused' | 'retired';

export interface ContentApiIntentCard {
  id: string;
  domain: IntentDomain;
  intent_id: string;
  mapped_mode: HomeModeType;
  allowed_environments: CanonicalBathEnvironment[];
  copy_title: string;
  copy_subtitle_by_environment: Record<CanonicalBathEnvironment, string>;
  default_subprotocol_id: string;
  card_position: number;
  status: ContentApiStatus;
}

export interface ContentApiSubProtocol {
  id: string;
  intent_id: string;
  label: string;
  hint: string;
  is_default: boolean;
  partial_overrides: SubProtocolOverrides;
  status: ContentApiStatus;
}

export interface ContentApiTripTheme {
  id: string;
  cover_style_id: string;
  title: string;
  subtitle: string;
  base_temp: number;
  color_hex: string;
  rec_scent: string;
  music_id: MusicTrack['id'];
  ambience_id: AmbienceTrack['id'];
  default_bath_type: ThemePreset['defaultBathType'];
  recommended_environment: ThemePreset['recommendedEnvironment'];
  duration_minutes: number | null;
  lighting: string;
  status: ContentApiStatus;
}

export type ContentApiAudioTrackType = 'music' | 'ambience';

export interface ContentApiAudioTrack {
  id: string;
  type: ContentApiAudioTrackType;
  title: string;
  filename?: string | null;
  remote_url?: string | null;
  duration_seconds: number;
  persona_codes: PersonaCode[];
  license_note?: string | null;
  status: ContentApiStatus;
}

export interface ContentApiResponse {
  schema_version: 'content.v1';
  snapshot_date: string;
  catalog: CatalogApiResponse;
  care: {
    intents: ContentApiIntentCard[];
    subprotocols: Record<string, ContentApiSubProtocol[]>;
  };
  trip: {
    themes: ContentApiTripTheme[];
    intents: ContentApiIntentCard[];
    subprotocols: Record<string, ContentApiSubProtocol[]>;
  };
  audio: {
    tracks: ContentApiAudioTrack[];
  };
}

export interface RuntimeAudioTrackSource {
  source: 'bundled' | 'remote';
  remoteUrl?: string;
  licenseNote?: string;
}

export type RuntimeMusicTrack = MusicTrack & RuntimeAudioTrackSource;
export type RuntimeAmbienceTrack = AmbienceTrack & RuntimeAudioTrackSource;
