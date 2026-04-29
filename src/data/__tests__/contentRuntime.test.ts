import {
  buildStaticContentApiResponse,
  hydrateContentFromApi,
  resetContentRuntime,
  toContentRuntimeBundle,
} from '@/src/data/contentRuntime';
import { type ContentApiResponse } from '@/src/contracts/contentApi';

function cloneStaticPayload(): ContentApiResponse {
  return JSON.parse(JSON.stringify(buildStaticContentApiResponse())) as ContentApiResponse;
}

describe('contentRuntime', () => {
  const originalContentUrl = process.env.EXPO_PUBLIC_CONTENT_API_URL;

  afterEach(() => {
    jest.restoreAllMocks();
    process.env.EXPO_PUBLIC_CONTENT_API_URL = originalContentUrl;
    resetContentRuntime();
  });

  test('normalizes the bundled seed into a runtime content bundle', () => {
    const bundle = toContentRuntimeBundle(buildStaticContentApiResponse());

    expect(bundle.products.length).toBeGreaterThan(0);
    expect(bundle.care.intents.length).toBeGreaterThan(0);
    expect(bundle.trip.themes.length).toBeGreaterThan(0);
    expect(bundle.audio.musicTracks.length).toBeGreaterThan(0);
    expect(bundle.audio.ambienceTracks.length).toBeGreaterThan(0);
  });

  test('uses catalog presentation data from the content payload', () => {
    const payload = cloneStaticPayload();
    const firstPresentation = payload.catalog.presentations[0];
    firstPresentation.tags = ['테스트태그'];
    firstPresentation.emoji = 'TT';
    firstPresentation.bg_color = '#123456';

    const bundle = toContentRuntimeBundle(payload);
    const product = bundle.products.find(
      (item) => item.id === firstPresentation.canonical_product_id
    );

    expect(product?.tags).toEqual(['테스트태그']);
    expect(product?.emoji).toBe('TT');
    expect(product?.bgColor).toBe('#123456');
  });

  test('rejects an active care intent without a valid default subprotocol', () => {
    const payload = cloneStaticPayload();
    payload.care.intents[0].default_subprotocol_id = 'missing_default';

    expect(() => toContentRuntimeBundle(payload)).toThrow(
      /missing default subprotocol/
    );
  });

  test('rejects an active trip theme linked to a missing music track', () => {
    const payload = cloneStaticPayload();
    payload.trip.themes[0].music_id = 'missing_music_track';

    expect(() => toContentRuntimeBundle(payload)).toThrow(
      /references missing active music track/
    );
  });

  test('uses fallback content when no content API URL is configured', async () => {
    process.env.EXPO_PUBLIC_CONTENT_API_URL = '';
    const fetchSpy = jest.spyOn(global, 'fetch');

    const bundle = await hydrateContentFromApi();

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(bundle.care.intents.length).toBeGreaterThan(0);
  });

  test('hydrates remote content when a content API URL is configured', async () => {
    const payload = cloneStaticPayload();
    payload.care.intents[0].copy_title = '원격 수면 루틴';
    process.env.EXPO_PUBLIC_CONTENT_API_URL = 'https://example.test/api/content-snapshot';
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => payload,
    } as Response);

    const bundle = await hydrateContentFromApi();

    expect(bundle.care.intents[0].copy_title).toBe('원격 수면 루틴');
  });
});
