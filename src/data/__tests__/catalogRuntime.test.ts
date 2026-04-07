// Regression: ISSUE-001 — web dev mode should not call an unavailable local catalog API by default
// Found by /qa on 2026-04-07
// Report: .gstack/qa-reports/qa-report-localhost-2026-04-07.md

describe('catalogRuntime', () => {
  const runtimeGlobal = global as typeof globalThis & { __DEV__?: boolean };
  const originalDev = runtimeGlobal.__DEV__;
  const originalCatalogUrl = process.env.EXPO_PUBLIC_CATALOG_API_URL;

  afterEach(() => {
    jest.resetModules();
    jest.unmock('react-native');
    process.env.EXPO_PUBLIC_CATALOG_API_URL = originalCatalogUrl;
    runtimeGlobal.__DEV__ = originalDev;
  });

  test('uses fallback catalog on web when no API URL is configured', async () => {
    process.env.EXPO_PUBLIC_CATALOG_API_URL = '';
    runtimeGlobal.__DEV__ = true;

    jest.doMock('react-native', () => ({
      Platform: { OS: 'web' },
    }));

    const fetchSpy = jest.spyOn(global, 'fetch');

    const { hydrateCatalogFromApi } = await import('../catalogRuntime');
    const products = await hydrateCatalogFromApi();

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(products.length).toBeGreaterThan(0);

    fetchSpy.mockRestore();
  });
});
