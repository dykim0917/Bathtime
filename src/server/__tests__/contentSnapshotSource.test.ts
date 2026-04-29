import {
  buildContentSnapshotFromSource,
  loadActiveContentSnapshotRows,
  type ContentSnapshotRowSource,
} from '@/src/server/contentSnapshotSource';
import {
  type ContentDbIntentRow,
  type ContentDbSnapshotRows,
} from '@/src/contracts/contentDbSnapshot';
import {
  type ContentApiIntentCard,
  type ContentApiResponse,
} from '@/src/contracts/contentApi';
import { buildStaticContentApiResponse } from '@/src/data/contentRuntime';

function cloneStaticPayload(): ContentApiResponse {
  return JSON.parse(JSON.stringify(buildStaticContentApiResponse())) as ContentApiResponse;
}

function toIntentRow(intent: ContentApiIntentCard): ContentDbIntentRow {
  return {
    id: intent.id,
    intent_id: intent.intent_id,
    mapped_mode: intent.mapped_mode,
    allowed_environments: intent.allowed_environments,
    copy_title: intent.copy_title,
    copy_subtitle_by_environment: intent.copy_subtitle_by_environment,
    default_subprotocol_id: intent.default_subprotocol_id,
    card_position: intent.card_position,
    status: intent.status,
  };
}

function makeRows(payload = cloneStaticPayload()): Omit<ContentDbSnapshotRows, 'snapshotDate'> {
  return {
    canonicalProducts: payload.catalog.canonical_products,
    marketListings: payload.catalog.market_listings,
    matchRules: payload.catalog.match_rules,
    productPresentations: payload.catalog.presentations.map((item) => ({
      ...item,
      status: 'active',
    })),
    careIntents: payload.care.intents.map(toIntentRow),
    careSubprotocols: Object.values(payload.care.subprotocols).flat(),
    tripThemes: payload.trip.themes,
    tripIntents: payload.trip.intents.map(toIntentRow),
    tripSubprotocols: Object.values(payload.trip.subprotocols).flat(),
    audioTracks: payload.audio.tracks,
  };
}

function makeSource(rows = makeRows()): ContentSnapshotRowSource {
  return {
    readActiveCanonicalProducts: jest.fn(async () => rows.canonicalProducts),
    readMarketListingsForActiveProducts: jest.fn(async () => rows.marketListings),
    readActiveMatchRules: jest.fn(async () => rows.matchRules),
    readActiveProductPresentations: jest.fn(async () => rows.productPresentations),
    readActiveCareIntents: jest.fn(async () => rows.careIntents),
    readActiveCareSubprotocols: jest.fn(async () => rows.careSubprotocols),
    readActiveTripThemes: jest.fn(async () => rows.tripThemes),
    readActiveTripIntents: jest.fn(async () => rows.tripIntents),
    readActiveTripSubprotocols: jest.fn(async () => rows.tripSubprotocols),
    readActiveAudioTracks: jest.fn(async () => rows.audioTracks),
  };
}

describe('contentSnapshotSource', () => {
  test('loads active snapshot rows from every source table', async () => {
    const source = makeSource();
    const rows = await loadActiveContentSnapshotRows(source, {
      snapshotDate: '2026-04-29',
    });

    expect(rows.snapshotDate).toBe('2026-04-29');
    expect(rows.canonicalProducts.length).toBeGreaterThan(0);
    expect(source.readActiveCanonicalProducts).toHaveBeenCalledTimes(1);
    expect(source.readMarketListingsForActiveProducts).toHaveBeenCalledTimes(1);
    expect(source.readActiveAudioTracks).toHaveBeenCalledTimes(1);
  });

  test('builds a content API snapshot from source rows', async () => {
    const payload = cloneStaticPayload();
    const source = makeSource(makeRows(payload));
    const built = await buildContentSnapshotFromSource(source, {
      snapshotDate: payload.snapshot_date,
    });

    expect(built).toEqual(payload);
  });

  test('rejects invalid source rows before returning a snapshot', async () => {
    const rows = makeRows();
    rows.tripThemes[0].music_id = 'missing_music_track';
    const source = makeSource(rows);

    await expect(buildContentSnapshotFromSource(source)).rejects.toThrow(
      /references missing active music track/
    );
  });
});
