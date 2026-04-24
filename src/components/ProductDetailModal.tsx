import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { CatalogProduct, PRODUCT_CATEGORY_LABELS } from '@/src/data/catalog';
import {
  V2_ACCENT,
  TYPE_SCALE,
  V2_ACCENT_TEXT,
  V2_BG_OVERLAY,
  V2_BORDER,
  V2_MODAL_HANDLE,
  V2_MODAL_SURFACE,
  V2_SURFACE_SOFT,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
} from '@/src/data/colors';
import { luxuryFonts, luxuryRadii, luxuryTracking } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';
import { AppIconBadge, getProductCategoryBadgeTone } from '@/src/components/AppIconBadge';
import { AnimatedModalShell } from '@/src/components/AnimatedModalShell';
import { getProductImageSource } from '@/src/data/productImages';

interface ProductDetailModalProps {
  visible: boolean;
  product: CatalogProduct | null;
  onClose: () => void;
  onOpenCatalog?: (product: CatalogProduct) => void;
  onPurchasePress: (product: CatalogProduct) => void;
  secondaryActionLabel?: string;
  closeActionLabel?: string;
}

export function ProductDetailModal({
  visible,
  product,
  onClose,
  onOpenCatalog,
  onPurchasePress,
  secondaryActionLabel = '제품 탭에서 전체 보기',
  closeActionLabel = '루틴으로 돌아가기',
}: ProductDetailModalProps) {
  if (!product) return null;
  const categoryTone = getProductCategoryBadgeTone(product.category);
  const imageSource = getProductImageSource(product.id);
  const priceLabel = formatProductPrice(product);
  const marketLabel = formatMarketLabel(product.listing?.market);

  return (
    <AnimatedModalShell
      visible={visible}
      onClose={onClose}
      layoutStyle={styles.overlay}
      backdropStyle={styles.backdrop}
    >
      {(requestClose) => (
        <View style={styles.card}>
          <View style={styles.handle} />
          <View style={styles.imageFrame}>
            {imageSource ? (
              <Image source={imageSource} style={styles.productImage} resizeMode="cover" />
            ) : (
              <View style={[styles.imagePlaceholder, { backgroundColor: `${product.bgColor}30` }]}>
                <AppIconBadge
                  spec={categoryTone.spec}
                  size={58}
                  iconSize={25}
                  color={categoryTone.color}
                  backgroundColor={product.bgColor}
                  borderColor={categoryTone.borderColor}
                  style={styles.iconWrap}
                />
                <Text style={styles.imagePathText} numberOfLines={1}>{product.imagePath}</Text>
              </View>
            )}
          </View>
          <View style={styles.header}>
            <AppIconBadge
              spec={categoryTone.spec}
              size={56}
              iconSize={24}
              color={categoryTone.color}
              backgroundColor={product.bgColor}
              borderColor={categoryTone.borderColor}
              style={styles.iconWrap}
            />
            <View style={styles.headerCopy}>
              <Text style={styles.brand}>{product.brand}</Text>
              <Text style={styles.name}>{product.name}</Text>
              <Text style={styles.meta}>
                {PRODUCT_CATEGORY_LABELS[product.category]} · {priceLabel}{marketLabel ? ` · ${marketLabel}` : ''}
              </Text>
            </View>
          </View>

          <View style={styles.bodyCard}>
            <View style={styles.detailMetaRow}>
              <View style={styles.detailMetaPill}>
                <Text style={styles.detailMetaText}>{PRODUCT_CATEGORY_LABELS[product.category]}</Text>
              </View>
              <View style={styles.detailMetaPill}>
                <Text style={styles.detailMetaText}>{priceLabel}</Text>
              </View>
              {marketLabel ? (
                <View style={styles.detailMetaPill}>
                  <Text style={styles.detailMetaText}>{marketLabel}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.description}>{product.description}</Text>
            <View style={styles.tagRow}>
              {product.tags.map((tag) => (
                <View key={tag} style={styles.tagPill}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.footerHint}>{product.editorial.footerHint}</Text>
          </View>

          <View style={styles.buttonStack}>
            <Pressable style={ui.primaryButtonV2} onPress={() => onPurchasePress(product)}>
              <Text style={styles.primaryButtonText}>구매 링크 열기</Text>
            </Pressable>
            {onOpenCatalog ? (
              <Pressable style={ui.secondaryButtonV2} onPress={() => onOpenCatalog(product)}>
                <Text style={styles.secondaryButtonText}>{secondaryActionLabel}</Text>
              </Pressable>
            ) : null}
            <Pressable style={styles.closeButton} onPress={requestClose}>
              <Text style={styles.closeButtonText}>{closeActionLabel}</Text>
            </Pressable>
          </View>
        </View>
      )}
    </AnimatedModalShell>
  );
}

function formatProductPrice(product: CatalogProduct): string {
  const price = product.listing?.priceSnapshotKrw;
  if (typeof price !== 'number') return `${product.priceTier.toUpperCase()} price`;
  return `₩${price.toLocaleString('ko-KR')}`;
}

function formatMarketLabel(market?: string): string | null {
  switch (market) {
    case 'coupang':
      return '쿠팡';
    case 'naver_smartstore':
      return '네이버';
    case 'kurly':
      return '컬리';
    case 'oliveyoung':
      return '올리브영';
    case 'official_store':
      return '공식몰';
    case 'danawa':
      return '다나와';
    case 'other':
      return '기타';
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: 48,
  },
  backdrop: {
    backgroundColor: V2_BG_OVERLAY,
  },
  card: {
    backgroundColor: V2_MODAL_SURFACE,
    borderTopLeftRadius: luxuryRadii.cardLg,
    borderTopRightRadius: luxuryRadii.cardLg,
    borderWidth: 1,
    borderColor: V2_BORDER,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    gap: 18,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 999,
    backgroundColor: V2_MODAL_HANDLE,
    marginBottom: 4,
  },
  imageFrame: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: luxuryRadii.card,
    borderWidth: 1,
    borderColor: V2_BORDER,
    overflow: 'hidden',
    backgroundColor: V2_SURFACE_SOFT,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  imagePathText: {
    maxWidth: '90%',
    color: V2_TEXT_MUTED,
    fontSize: TYPE_SCALE.caption - 1,
    fontFamily: luxuryFonts.sans,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  iconWrap: {
    borderRadius: luxuryRadii.button,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  brand: {
    color: V2_TEXT_MUTED,
    fontSize: TYPE_SCALE.caption,
    fontWeight: '700',
    letterSpacing: luxuryTracking.label,
    fontFamily: luxuryFonts.sans,
  },
  name: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.title + 2,
    fontFamily: luxuryFonts.display,
  },
  meta: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_SCALE.caption,
    fontFamily: luxuryFonts.sans,
  },
  bodyCard: {
    borderRadius: luxuryRadii.card,
    borderWidth: 1,
    borderColor: V2_BORDER,
    backgroundColor: V2_SURFACE_SOFT,
    padding: 16,
    gap: 14,
  },
  detailMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailMetaPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: V2_BORDER,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  detailMetaText: {
    color: V2_ACCENT,
    fontSize: TYPE_SCALE.caption,
    fontWeight: '700',
    letterSpacing: 0,
    fontFamily: luxuryFonts.sans,
  },
  description: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.body,
    lineHeight: 21,
    fontFamily: luxuryFonts.sans,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: V2_BORDER,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_SCALE.caption,
    fontWeight: '600',
    fontFamily: luxuryFonts.sans,
  },
  footerHint: {
    color: V2_TEXT_MUTED,
    fontSize: TYPE_SCALE.caption,
    lineHeight: 18,
    fontFamily: luxuryFonts.sans,
  },
  buttonStack: {
    gap: 12,
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  closeButtonText: {
    color: V2_TEXT_MUTED,
    fontSize: TYPE_SCALE.body,
    fontWeight: '600',
    fontFamily: luxuryFonts.sans,
  },
  primaryButtonText: {
    color: V2_ACCENT_TEXT,
    fontSize: TYPE_SCALE.body,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  secondaryButtonText: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.body,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
});
