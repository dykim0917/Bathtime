import {
  getContentSnapshotOptionsResponse,
  getContentSnapshotResponse,
} from '@/src/server/contentSnapshotApi';
import { type ContentSnapshotRowSource } from '@/src/server/contentSnapshotSource';
import { buildStaticContentApiResponse } from '@/src/data/contentRuntime';

const configuredEnv = {
  CONTENT_DB_REST_URL: 'https://project.supabase.co/rest/v1',
  CONTENT_DB_SERVICE_ROLE_KEY: 'secret',
};

const source = {} as ContentSnapshotRowSource;

describe('contentSnapshotApi', () => {
  test('returns 503 when the content DB source is not configured', async () => {
    const response = await getContentSnapshotResponse({ env: {} });

    await expect(response.json()).resolves.toEqual({
      error: 'Content snapshot source is not configured',
    });
    expect(response.status).toBe(503);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  test('returns a content snapshot with public cache headers', async () => {
    const payload = buildStaticContentApiResponse();
    const createSource = jest.fn(() => source);
    const buildSnapshot = jest.fn(async () => payload);
    const response = await getContentSnapshotResponse({
      env: configuredEnv,
      createSource,
      buildSnapshot,
    });

    await expect(response.json()).resolves.toEqual(payload);
    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Cache-Control')).toBe(
      'public, max-age=60, stale-while-revalidate=300'
    );
    expect(createSource).toHaveBeenCalledWith({
      restUrl: configuredEnv.CONTENT_DB_REST_URL,
      serviceRoleKey: configuredEnv.CONTENT_DB_SERVICE_ROLE_KEY,
    });
    expect(buildSnapshot).toHaveBeenCalledWith(source);
  });

  test('returns 502 when snapshot building fails', async () => {
    const logger = { error: jest.fn() };
    const response = await getContentSnapshotResponse({
      env: configuredEnv,
      logger,
      createSource: jest.fn(() => source),
      buildSnapshot: jest.fn(async () => {
        throw new Error('database unavailable');
      }),
    });

    await expect(response.json()).resolves.toEqual({
      error: 'Content snapshot is temporarily unavailable',
    });
    expect(response.status).toBe(502);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(logger.error).toHaveBeenCalledWith(
      'Content snapshot API failed',
      expect.any(Error)
    );
  });

  test('handles CORS preflight', () => {
    const response = getContentSnapshotOptionsResponse();

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe(
      'GET, OPTIONS'
    );
  });
});
