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
  if (typeof price === 'number' && price > 0) {
    return toTenThousandWonRange(price);
  }

  switch (product.priceTier) {
    case 'low':
      return '1만원대';
    case 'mid':
      return '2-3만원대';
    case 'high':
      return '5만원대 이상';
    default:
      return '판매처 가격 확인';
  }
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

function toTenThousandWonRange(price: number): string {
  if (price < 20000) return '1만원대';
  const tenThousandUnit = Math.floor(price / 10000);
  if (tenThousandUnit >= 5) return '5만원대 이상';
  return `${tenThousandUnit}만원대`;
}
