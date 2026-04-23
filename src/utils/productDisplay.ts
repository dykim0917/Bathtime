interface ProductDisplaySource {
  name: string;
  brand: string;
  priceTier: string;
  listing?: {
    priceSnapshotKrw?: number;
  };
}

const BRAND_NAME_ALIASES: Record<string, string[]> = {
  AROMATICA: ['아로마티카'],
  BARTH: ['BARTH'],
  'Bath Roman': ['바스로망'],
  Bathpa: ['바스파'],
  "Dr Teal's": ['닥터틸즈', '닥터틸즈 퓨어'],
  Kao: ['카오'],
  Neutrogena: ['뉴트로지나'],
};

export function formatProductPrice(product: ProductDisplaySource): string {
  const price = product.listing?.priceSnapshotKrw;
  if (typeof price !== 'number') return '가격 확인 필요';
  return `${price.toLocaleString('ko-KR')}원`;
}

export function getDisplayProductName(product: ProductDisplaySource): string {
  const aliases = [product.brand, ...(BRAND_NAME_ALIASES[product.brand] ?? [])];

  for (const alias of aliases) {
    const trimmedAlias = alias.trim();
    if (!trimmedAlias) continue;

    const pattern = new RegExp(`^${escapeRegExp(trimmedAlias)}[\\s·:|/-]*`, 'i');
    const stripped = product.name.replace(pattern, '').trim();
    if (stripped && stripped !== product.name && stripped.length >= 2) {
      return stripped;
    }
  }

  return product.name;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
