import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import {
  buildCatalogProducts,
  getProductCatalog,
  setProductCatalog,
  type CatalogProduct,
} from '@/src/data/catalog';
import {
  toCatalogApiRuntimeBundle,
  type CatalogApiResponse,
} from '@/src/contracts/catalogApi';

type CatalogHydrationStatus = 'fallback' | 'loading' | 'remote';

const DEFAULT_DEV_WEB_CATALOG_API_URL = 'http://127.0.0.1:4010/api/catalog';

let hasRemoteCatalog = false;
let remoteCatalogAttempted = false;
let remoteCatalogPromise: Promise<CatalogProduct[]> | null = null;

function getCatalogApiUrl(): string | undefined {
  const configuredUrl = process.env.EXPO_PUBLIC_CATALOG_API_URL?.trim();
  if (configuredUrl) return configuredUrl;
  if (__DEV__ && Platform.OS === 'web') return DEFAULT_DEV_WEB_CATALOG_API_URL;
  return undefined;
}

export async function hydrateCatalogFromApi(): Promise<CatalogProduct[]> {
  const apiUrl = getCatalogApiUrl();
  if (!apiUrl) return getProductCatalog();
  if (hasRemoteCatalog) return getProductCatalog();
  if (remoteCatalogPromise) return remoteCatalogPromise;

  remoteCatalogAttempted = true;
  remoteCatalogPromise = fetch(apiUrl)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Catalog API request failed with status ${response.status}`);
      }

      const payload = (await response.json()) as CatalogApiResponse;
      if (payload.schema_version !== 'catalog.v1') {
        throw new Error(`Unsupported catalog schema: ${payload.schema_version}`);
      }

      const bundle = toCatalogApiRuntimeBundle(payload);
      const products = buildCatalogProducts(bundle);
      setProductCatalog(products);
      hasRemoteCatalog = true;
      return products;
    })
    .finally(() => {
      remoteCatalogPromise = null;
    });

  return remoteCatalogPromise;
}

export function useCatalogHydration(): {
  products: CatalogProduct[];
  status: CatalogHydrationStatus;
} {
  const [products, setProducts] = useState(() => getProductCatalog());
  const [status, setStatus] = useState<CatalogHydrationStatus>(
    hasRemoteCatalog ? 'remote' : 'fallback'
  );

  useEffect(() => {
    if (hasRemoteCatalog || remoteCatalogAttempted) {
      setProducts(getProductCatalog());
      if (hasRemoteCatalog) setStatus('remote');
      return;
    }

    let cancelled = false;
    const apiUrl = getCatalogApiUrl();
    if (!apiUrl) return;

    setStatus('loading');
    hydrateCatalogFromApi()
      .then((nextProducts) => {
        if (cancelled) return;
        setProducts(nextProducts);
        setStatus('remote');
      })
      .catch(() => {
        if (cancelled) return;
        setProducts(getProductCatalog());
        setStatus('fallback');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { products, status };
}
