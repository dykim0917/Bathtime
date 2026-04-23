import type { ImageSourcePropType } from 'react-native';

export const PRODUCT_IMAGE_BASE_PATH = 'assets/images/products';

export const PRODUCT_IMAGE_PATHS: Record<string, string> = {
  bs_v1_003: `${PRODUCT_IMAGE_BASE_PATH}/bs_v1_003.jpg`,
  bs_v1_005: `${PRODUCT_IMAGE_BASE_PATH}/bs_v1_005.jpg`,
  bs_v1_006: `${PRODUCT_IMAGE_BASE_PATH}/bs_v1_006.jpg`,
  bs_v1_007: `${PRODUCT_IMAGE_BASE_PATH}/bs_v1_007.jpg`,
  bs_v1_009: `${PRODUCT_IMAGE_BASE_PATH}/bs_v1_009.jpg`,
  bs_v1_013: `${PRODUCT_IMAGE_BASE_PATH}/bs_v1_013.jpg`,
  bs_v1_014: `${PRODUCT_IMAGE_BASE_PATH}/bs_v1_014.jpg`,
  bs_v1_016: `${PRODUCT_IMAGE_BASE_PATH}/bs_v1_016.jpg`,
  bs_v1_020: `${PRODUCT_IMAGE_BASE_PATH}/bs_v1_020.jpg`,
  bs_v1_021: `${PRODUCT_IMAGE_BASE_PATH}/bs_v1_021.jpg`,
};

export const PRODUCT_IMAGE_ASSETS: Partial<Record<string, ImageSourcePropType>> = {
  bs_v1_003: require('../../assets/images/products/bs_v1_003.jpg'),
  bs_v1_005: require('../../assets/images/products/bs_v1_005.jpg'),
  bs_v1_006: require('../../assets/images/products/bs_v1_006.jpg'),
  bs_v1_007: require('../../assets/images/products/bs_v1_007.jpg'),
  bs_v1_009: require('../../assets/images/products/bs_v1_009.jpg'),
  bs_v1_013: require('../../assets/images/products/bs_v1_013.jpg'),
  bs_v1_014: require('../../assets/images/products/bs_v1_014.jpg'),
  bs_v1_016: require('../../assets/images/products/bs_v1_016.jpg'),
  bs_v1_020: require('../../assets/images/products/bs_v1_020.jpg'),
  bs_v1_021: require('../../assets/images/products/bs_v1_021.jpg'),
};

export function getProductImageSource(productId: string): ImageSourcePropType | undefined {
  return PRODUCT_IMAGE_ASSETS[productId];
}

export function getProductImagePath(productId: string): string {
  return PRODUCT_IMAGE_PATHS[productId] ?? `${PRODUCT_IMAGE_BASE_PATH}/${productId}.jpg`;
}
