import {
  buildContentApiResponseFromDbRows,
  type ContentDbIntentRow,
  type ContentDbSnapshotRows,
} from '@/src/contracts/contentDbSnapshot';
import {
  type ContentApiIntentCard,
  type ContentApiResponse,
} from '@/src/contracts/contentApi';
import {
  buildStaticContentApiResponse,
  toContentRuntimeBundle,
} from '@/src/data/contentRuntime';

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

function makeRows(payload = cloneStaticPayload()): ContentDbSnapshotRows {
  return {
    snapshotDate: payload.snapshot_date,
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

describe('contentDbSnapshot', () => {
  test('builds a valid content snapshot from DB rows', () => {
    const payload = cloneStaticPayload();
    const built = buildContentApiResponseFromDbRows(makeRows(payload));

    expect(built).toEqual(payload);
    expect(toContentRuntimeBundle(built).care.intents.length).toBeGreaterThan(0);
  });

  test('groups care and trip subprotocol rows by intent id', () => {
    const built = buildContentApiResponseFromDbRows(makeRows());
    const careIntent = built.care.intents[0];
    const tripIntent = built.trip.intents[0];

    expect(built.care.subprotocols[careIntent.intent_id]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ intent_id: careIntent.intent_id }),
      ])
    );
    expect(built.trip.subprotocols[tripIntent.intent_id]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ intent_id: tripIntent.intent_id }),
      ])
    );
  });

  test('does not expose product presentation row status in the API payload', () => {
    const built = buildContentApiResponseFromDbRows(makeRows());

    expect(built.catalog.presentations[0]).not.toHaveProperty('status');
  });

  test('throws when DB rows produce an invalid snapshot', () => {
    const rows = makeRows();
    rows.tripThemes[0].music_id = 'missing_music_track';

    expect(() => buildContentApiResponseFromDbRows(rows)).toThrow(
      /references missing active music track/
    );
  });
});
