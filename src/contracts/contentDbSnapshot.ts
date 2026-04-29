import {
  type CatalogApiCanonicalProduct,
  type CatalogApiMarketListing,
  type CatalogApiMatchRule,
  type CatalogApiPresentation,
} from '@/src/contracts/catalogApi';
import {
  type ContentApiAudioTrack,
  type ContentApiIntentCard,
  type ContentApiResponse,
  type ContentApiStatus,
  type ContentApiSubProtocol,
  type ContentApiTripTheme,
} from '@/src/contracts/contentApi';
import { validateContentApiResponse } from '@/src/data/contentValidation';

export type ContentDbCanonicalProductRow = CatalogApiCanonicalProduct;
export type ContentDbMarketListingRow = CatalogApiMarketListing;
export type ContentDbMatchRuleRow = CatalogApiMatchRule;
export type ContentDbProductPresentationRow = CatalogApiPresentation & {
  status: ContentApiStatus;
};

export interface ContentDbIntentRow {
  id: string;
  intent_id: string;
  mapped_mode: ContentApiIntentCard['mapped_mode'];
  allowed_environments: ContentApiIntentCard['allowed_environments'];
  copy_title: string;
  copy_subtitle_by_environment: ContentApiIntentCard['copy_subtitle_by_environment'];
  default_subprotocol_id: string;
  card_position: number;
  status: ContentApiStatus;
}

export interface ContentDbSubProtocolRow {
  id: string;
  intent_id: string;
  label: string;
  hint: string;
  is_default: boolean;
  partial_overrides: ContentApiSubProtocol['partial_overrides'];
  status: ContentApiStatus;
}

export type ContentDbTripThemeRow = ContentApiTripTheme;
export type ContentDbAudioTrackRow = ContentApiAudioTrack;

export interface ContentDbSnapshotRows {
  snapshotDate: string;
  canonicalProducts: ContentDbCanonicalProductRow[];
  marketListings: ContentDbMarketListingRow[];
  matchRules: ContentDbMatchRuleRow[];
  productPresentations: ContentDbProductPresentationRow[];
  careIntents: ContentDbIntentRow[];
  careSubprotocols: ContentDbSubProtocolRow[];
  tripThemes: ContentDbTripThemeRow[];
  tripIntents: ContentDbIntentRow[];
  tripSubprotocols: ContentDbSubProtocolRow[];
  audioTracks: ContentDbAudioTrackRow[];
}

function groupSubprotocols(
  rows: ContentDbSubProtocolRow[]
): Record<string, ContentApiSubProtocol[]> {
  return rows.reduce<Record<string, ContentApiSubProtocol[]>>((acc, row) => {
    const current = acc[row.intent_id] ?? [];
    current.push({
      id: row.id,
      intent_id: row.intent_id,
      label: row.label,
      hint: row.hint,
      is_default: row.is_default,
      partial_overrides: row.partial_overrides,
      status: row.status,
    });
    acc[row.intent_id] = current;
    return acc;
  }, {});
}

function toIntent(
  row: ContentDbIntentRow,
  domain: ContentApiIntentCard['domain']
): ContentApiIntentCard {
  return {
    id: row.id,
    domain,
    intent_id: row.intent_id,
    mapped_mode: row.mapped_mode,
    allowed_environments: row.allowed_environments,
    copy_title: row.copy_title,
    copy_subtitle_by_environment: row.copy_subtitle_by_environment,
    default_subprotocol_id: row.default_subprotocol_id,
    card_position: row.card_position,
    status: row.status,
  };
}

export function buildContentApiResponseFromDbRows(
  rows: ContentDbSnapshotRows
): ContentApiResponse {
  const payload: ContentApiResponse = {
    schema_version: 'content.v1',
    snapshot_date: rows.snapshotDate,
    catalog: {
      schema_version: 'catalog.v1',
      snapshot_date: rows.snapshotDate,
      canonical_products: rows.canonicalProducts,
      market_listings: rows.marketListings,
      match_rules: rows.matchRules,
      presentations: rows.productPresentations.map((item) => ({
        canonical_product_id: item.canonical_product_id,
        tags: item.tags,
        emoji: item.emoji,
        bg_color: item.bg_color,
        safety_flags: item.safety_flags,
      })),
    },
    care: {
      intents: rows.careIntents.map((item) => toIntent(item, 'care')),
      subprotocols: groupSubprotocols(rows.careSubprotocols),
    },
    trip: {
      themes: rows.tripThemes,
      intents: rows.tripIntents.map((item) => toIntent(item, 'trip')),
      subprotocols: groupSubprotocols(rows.tripSubprotocols),
    },
    audio: {
      tracks: rows.audioTracks,
    },
  };

  const validation = validateContentApiResponse(payload);
  if (!validation.ok) {
    const firstError = validation.issues.find((item) => item.severity === 'error');
    throw new Error(firstError?.message ?? 'Invalid content DB snapshot');
  }

  return payload;
}
