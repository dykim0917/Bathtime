import {
  PostgrestContentSnapshotSource,
  readPostgrestContentSnapshotSourceConfig,
} from '@/src/server/postgrestContentSnapshotSource';
import {
  type ContentDbCanonicalProductRow,
  type ContentDbMarketListingRow,
} from '@/src/contracts/contentDbSnapshot';

const activeProduct: ContentDbCanonicalProductRow = {
  id: 'prod-a',
  ingredient_key: 'magnesium',
  name_ko: '마그네슘 배스 솔트',
  brand: 'Bath Lab',
  category: 'bath_salt',
  mechanism: 'magnesium',
  price_tier: 'mid',
  environments: ['bathtub'],
  summary: '테스트 상품',
  editorial_eyebrow: '테스트',
  editorial_footer_hint: '테스트 힌트',
  status: 'active',
  last_verified_at: '2026-04-29',
};

const marketListing: ContentDbMarketListingRow = {
  id: 'listing-a',
  canonical_product_id: 'prod-a',
  market: 'naver_smartstore',
  source_url: 'https://example.test/product',
  title_snapshot: '마그네슘 배스 솔트',
  seller_snapshot: null,
  price_snapshot_krw: 12000,
  availability: 'active',
  verified_at: '2026-04-29',
  source_confidence: 0.9,
  notes: null,
};

function mockFetchWithRows(rowsByTable: Record<string, unknown[]>): jest.Mock {
  const fetchMock = jest.fn(async (url: string) => {
    const tableName = new URL(url).pathname.split('/').pop() ?? '';
    return {
      ok: true,
      json: async () => rowsByTable[tableName] ?? [],
    };
  });
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

describe('postgrestContentSnapshotSource', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('reads config from server-only environment variables', () => {
    expect(
      readPostgrestContentSnapshotSourceConfig({
        CONTENT_DB_REST_URL: ' https://project.supabase.co/rest/v1 ',
        CONTENT_DB_SERVICE_ROLE_KEY: ' secret ',
      })
    ).toEqual({
      restUrl: 'https://project.supabase.co/rest/v1',
      serviceRoleKey: 'secret',
    });
    expect(readPostgrestContentSnapshotSourceConfig({})).toBeNull();
  });

  test('queries active rows with service-role headers', async () => {
    const fetchMock = mockFetchWithRows({
      canonical_product: [activeProduct],
    });
    const source = new PostgrestContentSnapshotSource({
      restUrl: 'https://project.supabase.co/rest/v1/',
      serviceRoleKey: 'secret',
    });

    await expect(source.readActiveCanonicalProducts()).resolves.toEqual([
      activeProduct,
    ]);

    const [url, init] = fetchMock.mock.calls[0];
    const requestUrl = new URL(url);
    expect(requestUrl.pathname).toBe('/rest/v1/canonical_product');
    expect(requestUrl.searchParams.get('select')).toBe('*');
    expect(requestUrl.searchParams.get('status')).toBe('eq.active');
    expect(requestUrl.searchParams.get('order')).toBe('id.asc');
    expect(init.headers).toEqual({
      apikey: 'secret',
      authorization: 'Bearer secret',
    });
  });

  test('filters market listings to active product ids', async () => {
    const fetchMock = mockFetchWithRows({
      canonical_product: [activeProduct],
      product_market_listing: [marketListing],
    });
    const source = new PostgrestContentSnapshotSource({
      restUrl: 'https://project.supabase.co/rest/v1',
      serviceRoleKey: 'secret',
    });

    await expect(source.readMarketListingsForActiveProducts()).resolves.toEqual([
      marketListing,
    ]);

    const listingUrl = new URL(fetchMock.mock.calls[1][0]);
    expect(listingUrl.pathname).toBe('/rest/v1/product_market_listing');
    expect(listingUrl.searchParams.get('canonical_product_id')).toBe(
      'in.("prod-a")'
    );
  });

  test('returns no listings when there are no active products', async () => {
    const fetchMock = mockFetchWithRows({
      canonical_product: [],
    });
    const source = new PostgrestContentSnapshotSource({
      restUrl: 'https://project.supabase.co/rest/v1',
      serviceRoleKey: 'secret',
    });

    await expect(source.readMarketListingsForActiveProducts()).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('throws when PostgREST returns an error status', async () => {
    global.fetch = jest.fn(async () => ({
      ok: false,
      status: 500,
    })) as unknown as typeof fetch;
    const source = new PostgrestContentSnapshotSource({
      restUrl: 'https://project.supabase.co/rest/v1',
      serviceRoleKey: 'secret',
    });

    await expect(source.readActiveAudioTracks()).rejects.toThrow(
      'PostgREST audio_track read failed with status 500'
    );
  });
});
