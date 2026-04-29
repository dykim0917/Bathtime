import {
  type ContentApiAudioTrack,
  type ContentApiIntentCard,
  type ContentApiResponse,
  type ContentApiSubProtocol,
  type ContentApiTripTheme,
  type RuntimeAmbienceTrack,
  type RuntimeMusicTrack,
} from '@/src/contracts/contentApi';
import {
  toCatalogApiRuntimeBundle,
  type CatalogApiResponse,
} from '@/src/contracts/catalogApi';
import {
  buildCatalogProducts,
  PRODUCT_CATALOG,
  type CatalogProduct,
} from '@/src/data/catalog';
import {
  CANONICAL_PRODUCT_SEED_V1,
  PRODUCT_MARKET_LISTING_SEED_V1,
  PRODUCT_MATCH_RULE_SEED_V1,
} from '@/src/data/catalogResearchSeed';
import {
  CARE_INTENT_CARDS,
  CARE_SUBPROTOCOL_OPTIONS,
  TRIP_INTENT_CARDS,
  TRIP_SUBPROTOCOL_OPTIONS,
} from '@/src/data/intents';
import { AMBIENCE_TRACKS, MUSIC_TRACKS } from '@/src/data/music';
import { THEMES } from '@/src/data/themes';
import {
  type AmbienceTrack,
  type IntentCard,
  type MusicTrack,
  type SubProtocolOption,
  type ThemePreset,
} from '@/src/engine/types';

export interface ContentRuntimeBundle {
  products: CatalogProduct[];
  care: {
    intents: IntentCard[];
    subprotocols: Record<string, SubProtocolOption[]>;
  };
  trip: {
    themes: ThemePreset[];
    intents: IntentCard[];
    subprotocols: Record<string, SubProtocolOption[]>;
  };
  audio: {
    musicTracks: RuntimeMusicTrack[];
    ambienceTracks: RuntimeAmbienceTrack[];
  };
}

function assertContentSchema(payload: ContentApiResponse) {
  if (payload.schema_version !== 'content.v1') {
    throw new Error(`Unsupported content schema: ${payload.schema_version}`);
  }
}

function activeItems<T extends { status: string }>(items: T[]): T[] {
  return items.filter((item) => item.status === 'active');
}

function normalizeIntent(item: ContentApiIntentCard): IntentCard {
  return {
    id: item.id,
    domain: item.domain,
    intent_id: item.intent_id,
    mapped_mode: item.mapped_mode,
    allowed_environments: item.allowed_environments,
    copy_title: item.copy_title,
    copy_subtitle_by_environment: item.copy_subtitle_by_environment,
    default_subprotocol_id: item.default_subprotocol_id,
    card_position: item.card_position,
  };
}

function normalizeSubProtocol(item: ContentApiSubProtocol): SubProtocolOption {
  return {
    id: item.id,
    intent_id: item.intent_id,
    label: item.label,
    hint: item.hint,
    is_default: item.is_default,
    partialOverrides: item.partial_overrides,
  };
}

function normalizeTheme(item: ContentApiTripTheme): ThemePreset {
  return {
    id: item.id,
    coverStyleId: item.cover_style_id,
    title: item.title,
    subtitle: item.subtitle,
    baseTemp: item.base_temp,
    colorHex: item.color_hex,
    recScent: item.rec_scent,
    musicId: item.music_id,
    ambienceId: item.ambience_id,
    defaultBathType: item.default_bath_type,
    recommendedEnvironment: item.recommended_environment,
    durationMinutes: item.duration_minutes,
    lighting: item.lighting,
  };
}

function normalizeSubProtocolGroups(
  groups: Record<string, ContentApiSubProtocol[]>
): Record<string, SubProtocolOption[]> {
  return Object.fromEntries(
    Object.entries(groups).map(([intentId, options]) => [
      intentId,
      activeItems(options).map(normalizeSubProtocol),
    ])
  );
}

function normalizeAudioTrack(
  item: ContentApiAudioTrack
): RuntimeMusicTrack | RuntimeAmbienceTrack {
  return {
    id: item.id,
    title: item.title,
    filename: item.filename ?? item.id,
    durationSeconds: item.duration_seconds,
    persona: item.persona_codes,
    source: item.remote_url ? 'remote' : 'bundled',
    remoteUrl: item.remote_url ?? undefined,
    licenseNote: item.license_note ?? undefined,
  };
}

function validateIntentDefaults(
  scope: string,
  intents: IntentCard[],
  subprotocols: Record<string, SubProtocolOption[]>
) {
  for (const intent of intents) {
    const options = subprotocols[intent.intent_id] ?? [];
    const defaultOption = options.find((option) => option.id === intent.default_subprotocol_id);

    if (!defaultOption) {
      throw new Error(
        `${scope} intent ${intent.intent_id} is missing default subprotocol ${intent.default_subprotocol_id}`
      );
    }

    if (!defaultOption.is_default) {
      throw new Error(
        `${scope} intent ${intent.intent_id} default subprotocol ${defaultOption.id} is not marked as default`
      );
    }
  }
}

function validateTripThemeAudio(
  themes: ThemePreset[],
  musicTracks: RuntimeMusicTrack[],
  ambienceTracks: RuntimeAmbienceTrack[]
) {
  const musicIds = new Set(musicTracks.map((track) => track.id));
  const ambienceIds = new Set(ambienceTracks.map((track) => track.id));

  for (const theme of themes) {
    if (!musicIds.has(theme.musicId)) {
      throw new Error(`Trip theme ${theme.id} references missing music track ${theme.musicId}`);
    }
    if (!ambienceIds.has(theme.ambienceId)) {
      throw new Error(`Trip theme ${theme.id} references missing ambience track ${theme.ambienceId}`);
    }
  }
}

export function toContentRuntimeBundle(payload: ContentApiResponse): ContentRuntimeBundle {
  assertContentSchema(payload);

  const catalogBundle = toCatalogApiRuntimeBundle(payload.catalog);
  const products = buildCatalogProducts(catalogBundle);
  const careIntents = activeItems(payload.care.intents).map(normalizeIntent);
  const careSubprotocols = normalizeSubProtocolGroups(payload.care.subprotocols);
  const tripThemes = activeItems(payload.trip.themes).map(normalizeTheme);
  const tripIntents = activeItems(payload.trip.intents).map(normalizeIntent);
  const tripSubprotocols = normalizeSubProtocolGroups(payload.trip.subprotocols);
  const activeAudioTracks = activeItems(payload.audio.tracks);
  const musicTracks = activeAudioTracks
    .filter((track) => track.type === 'music')
    .map((track) => normalizeAudioTrack(track) as RuntimeMusicTrack);
  const ambienceTracks = activeAudioTracks
    .filter((track) => track.type === 'ambience')
    .map((track) => normalizeAudioTrack(track) as RuntimeAmbienceTrack);

  validateIntentDefaults('care', careIntents, careSubprotocols);
  validateIntentDefaults('trip', tripIntents, tripSubprotocols);
  validateTripThemeAudio(tripThemes, musicTracks, ambienceTracks);

  return {
    products,
    care: {
      intents: careIntents,
      subprotocols: careSubprotocols,
    },
    trip: {
      themes: tripThemes,
      intents: tripIntents,
      subprotocols: tripSubprotocols,
    },
    audio: {
      musicTracks,
      ambienceTracks,
    },
  };
}

function toCatalogApiResponse(): CatalogApiResponse {
  return {
    schema_version: 'catalog.v1',
    snapshot_date: new Date().toISOString().slice(0, 10),
    canonical_products: CANONICAL_PRODUCT_SEED_V1.map((item) => ({
      id: item.id,
      ingredient_key: item.ingredientKey,
      name_ko: item.nameKo,
      brand: item.brand,
      category: item.category,
      mechanism: item.mechanism,
      price_tier: item.priceTier,
      environments: item.environments,
      summary: item.summary,
      editorial_eyebrow: item.editorialEyebrow,
      editorial_footer_hint: item.editorialFooterHint,
      status: item.status,
      last_verified_at: item.lastVerifiedAt,
    })),
    market_listings: PRODUCT_MARKET_LISTING_SEED_V1.map((item) => ({
      id: item.id,
      canonical_product_id: item.canonicalProductId,
      market: item.market,
      source_url: item.sourceUrl,
      title_snapshot: item.titleSnapshot,
      seller_snapshot: item.sellerSnapshot ?? null,
      price_snapshot_krw: item.priceSnapshotKrw ?? null,
      availability: item.availability,
      verified_at: item.verifiedAt,
      source_confidence: item.sourceConfidence,
      notes: item.notes ?? null,
    })),
    match_rules: PRODUCT_MATCH_RULE_SEED_V1.map((item) => ({
      id: item.id,
      canonical_product_id: item.canonicalProductId,
      ingredient_keys: item.ingredientKeys,
      allowed_environments: item.allowedEnvironments,
      mode_bias: item.modeBias ?? null,
      priority_weight: item.priorityWeight,
      is_sommelier_pick_candidate: item.isSommelierPickCandidate,
      status: item.status,
    })),
    presentations: PRODUCT_CATALOG.map((item) => ({
      canonical_product_id: item.id,
      tags: item.tags,
      emoji: item.emoji,
      bg_color: item.bgColor,
      safety_flags: item.safetyFlags,
    })),
  };
}

function toApiIntent(item: IntentCard): ContentApiIntentCard {
  return {
    ...item,
    status: 'active',
  };
}

function toApiSubProtocol(item: SubProtocolOption): ContentApiSubProtocol {
  return {
    id: item.id,
    intent_id: item.intent_id,
    label: item.label,
    hint: item.hint,
    is_default: item.is_default,
    partial_overrides: item.partialOverrides,
    status: 'active',
  };
}

function toApiSubProtocolGroups(
  groups: Record<string, SubProtocolOption[]>
): Record<string, ContentApiSubProtocol[]> {
  return Object.fromEntries(
    Object.entries(groups).map(([intentId, options]) => [
      intentId,
      options.map(toApiSubProtocol),
    ])
  );
}

function toApiTheme(item: ThemePreset): ContentApiTripTheme {
  return {
    id: item.id,
    cover_style_id: item.coverStyleId,
    title: item.title,
    subtitle: item.subtitle,
    base_temp: item.baseTemp,
    color_hex: item.colorHex,
    rec_scent: item.recScent,
    music_id: item.musicId,
    ambience_id: item.ambienceId,
    default_bath_type: item.defaultBathType,
    recommended_environment: item.recommendedEnvironment,
    duration_minutes: item.durationMinutes,
    lighting: item.lighting,
    status: 'active',
  };
}

function toApiAudioTrack(
  item: MusicTrack | AmbienceTrack,
  type: ContentApiAudioTrack['type']
): ContentApiAudioTrack {
  return {
    id: item.id,
    type,
    title: item.title,
    filename: item.filename,
    remote_url: null,
    duration_seconds: item.durationSeconds,
    persona_codes: item.persona,
    license_note: null,
    status: 'active',
  };
}

export function buildStaticContentApiResponse(): ContentApiResponse {
  return {
    schema_version: 'content.v1',
    snapshot_date: new Date().toISOString().slice(0, 10),
    catalog: toCatalogApiResponse(),
    care: {
      intents: CARE_INTENT_CARDS.map(toApiIntent),
      subprotocols: toApiSubProtocolGroups(CARE_SUBPROTOCOL_OPTIONS),
    },
    trip: {
      themes: THEMES.map(toApiTheme),
      intents: TRIP_INTENT_CARDS.map(toApiIntent),
      subprotocols: toApiSubProtocolGroups(TRIP_SUBPROTOCOL_OPTIONS),
    },
    audio: {
      tracks: [
        ...MUSIC_TRACKS.map((track) => toApiAudioTrack(track, 'music')),
        ...AMBIENCE_TRACKS.map((track) => toApiAudioTrack(track, 'ambience')),
      ],
    },
  };
}
