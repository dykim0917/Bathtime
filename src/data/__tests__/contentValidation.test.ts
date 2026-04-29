import { buildStaticContentApiResponse } from '@/src/data/contentRuntime';
import { validateContentApiResponse } from '@/src/data/contentValidation';
import { type ContentApiResponse } from '@/src/contracts/contentApi';

function cloneStaticPayload(): ContentApiResponse {
  return JSON.parse(JSON.stringify(buildStaticContentApiResponse())) as ContentApiResponse;
}

describe('contentValidation', () => {
  test('accepts the static content seed', () => {
    const result = validateContentApiResponse(buildStaticContentApiResponse());

    expect(result.ok).toBe(true);
    expect(result.issues.filter((item) => item.severity === 'error')).toHaveLength(0);
  });

  test('flags missing active care default subprotocol as an error', () => {
    const payload = cloneStaticPayload();
    payload.care.intents[0].default_subprotocol_id = 'missing_default';

    const result = validateContentApiResponse(payload);

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: 'error',
          path: expect.stringContaining('care.intents'),
        }),
      ])
    );
  });

  test('flags trip themes linked to inactive music as an error', () => {
    const payload = cloneStaticPayload();
    const linkedTrack = payload.audio.tracks.find(
      (track) => track.id === payload.trip.themes[0].music_id
    );
    if (!linkedTrack) throw new Error('Test seed is missing linked music');
    linkedTrack.status = 'paused';

    const result = validateContentApiResponse(payload);

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: 'error',
          path: expect.stringContaining('music_id'),
        }),
      ])
    );
  });

  test('flags active remote audio without a URL protocol', () => {
    const payload = cloneStaticPayload();
    payload.audio.tracks[0].filename = null;
    payload.audio.tracks[0].remote_url = 'cdn.example.com/audio.m4a';

    const result = validateContentApiResponse(payload);

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: 'error',
          path: expect.stringContaining('remote_url'),
        }),
      ])
    );
  });

  test('warns when an active product has no active match rule', () => {
    const payload = cloneStaticPayload();
    const productId = payload.catalog.canonical_products[0].id;
    payload.catalog.match_rules = payload.catalog.match_rules.filter(
      (rule) => rule.canonical_product_id !== productId
    );

    const result = validateContentApiResponse(payload);

    expect(result.ok).toBe(true);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: 'warning',
          path: `catalog.match_rules.${productId}`,
        }),
      ])
    );
  });
});
