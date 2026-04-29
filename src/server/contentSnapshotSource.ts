import {
  buildContentApiResponseFromDbRows,
  type ContentDbAudioTrackRow,
  type ContentDbCanonicalProductRow,
  type ContentDbIntentRow,
  type ContentDbMarketListingRow,
  type ContentDbMatchRuleRow,
  type ContentDbProductPresentationRow,
  type ContentDbSnapshotRows,
  type ContentDbSubProtocolRow,
  type ContentDbTripThemeRow,
} from '@/src/contracts/contentDbSnapshot';
import { type ContentApiResponse } from '@/src/contracts/contentApi';

export interface ContentSnapshotRowSource {
  readActiveCanonicalProducts(): Promise<ContentDbCanonicalProductRow[]>;
  readMarketListingsForActiveProducts(): Promise<ContentDbMarketListingRow[]>;
  readActiveMatchRules(): Promise<ContentDbMatchRuleRow[]>;
  readActiveProductPresentations(): Promise<ContentDbProductPresentationRow[]>;
  readActiveCareIntents(): Promise<ContentDbIntentRow[]>;
  readActiveCareSubprotocols(): Promise<ContentDbSubProtocolRow[]>;
  readActiveTripThemes(): Promise<ContentDbTripThemeRow[]>;
  readActiveTripIntents(): Promise<ContentDbIntentRow[]>;
  readActiveTripSubprotocols(): Promise<ContentDbSubProtocolRow[]>;
  readActiveAudioTracks(): Promise<ContentDbAudioTrackRow[]>;
}

export interface ContentSnapshotSourceOptions {
  snapshotDate?: string;
}

function defaultSnapshotDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function loadActiveContentSnapshotRows(
  source: ContentSnapshotRowSource,
  options: ContentSnapshotSourceOptions = {}
): Promise<ContentDbSnapshotRows> {
  const [
    canonicalProducts,
    marketListings,
    matchRules,
    productPresentations,
    careIntents,
    careSubprotocols,
    tripThemes,
    tripIntents,
    tripSubprotocols,
    audioTracks,
  ] = await Promise.all([
    source.readActiveCanonicalProducts(),
    source.readMarketListingsForActiveProducts(),
    source.readActiveMatchRules(),
    source.readActiveProductPresentations(),
    source.readActiveCareIntents(),
    source.readActiveCareSubprotocols(),
    source.readActiveTripThemes(),
    source.readActiveTripIntents(),
    source.readActiveTripSubprotocols(),
    source.readActiveAudioTracks(),
  ]);

  return {
    snapshotDate: options.snapshotDate ?? defaultSnapshotDate(),
    canonicalProducts,
    marketListings,
    matchRules,
    productPresentations,
    careIntents,
    careSubprotocols,
    tripThemes,
    tripIntents,
    tripSubprotocols,
    audioTracks,
  };
}

export async function buildContentSnapshotFromSource(
  source: ContentSnapshotRowSource,
  options: ContentSnapshotSourceOptions = {}
): Promise<ContentApiResponse> {
  const rows = await loadActiveContentSnapshotRows(source, options);
  return buildContentApiResponseFromDbRows(rows);
}
