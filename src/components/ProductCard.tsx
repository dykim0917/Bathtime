import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { ui } from '@/src/theme/ui';
import {
  TYPE_SCALE,
  V2_ACCENT,
  V2_BORDER,
  V2_BORDER_STRONG,
  V2_PILL_BG,
  V2_PILL_BORDER,
  V2_SURFACE,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
  V2_TEXT_MUTED,
} from '@/src/data/colors';
import { CatalogProduct, PRODUCT_CATEGORY_LABELS } from '@/src/data/catalog';
import { luxuryFonts, luxuryRadii, luxuryTracking } from '@/src/theme/luxury';
import { getProductImageSource } from '@/src/data/productImages';
import { formatProductPrice, getDisplayProductName } from '@/src/utils/productDisplay';

interface ProductCardProps {
  item: CatalogProduct;
  variant?: 'default' | 'v2';
  onPress?: () => void;
}

export function ProductCard({ item, variant = 'default', onPress }: ProductCardProps) {
  const isV2 = variant === 'v2';
  const categoryLabel = PRODUCT_CATEGORY_LABELS[item.category];
  const imageSource = getProductImageSource(item.id);
  const priceLabel = formatProductPrice(item);
  const marketLabel = formatMarketLabel(item.listing?.market);
  const displayName = getDisplayProductName(item);

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        isV2 ? ui.glassCardV2 : ui.glassCard,
        styles.card,
        isV2 && styles.cardV2,
        onPress && styles.cardInteractive,
        pressed && onPress && styles.cardPressed,
      ]}
    >
      {isV2 ? <View style={[styles.glow, { backgroundColor: `${item.bgColor}24` }]} /> : null}
      <View style={styles.imageFrame}>
        {imageSource ? (
          <Image source={imageSource} style={styles.productImage} resizeMode="cover" />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: `${item.bgColor}30` }]}>
            <Text style={styles.placeholderInitials}>{item.emoji}</Text>
            <Text style={styles.imagePathText} numberOfLines={1}>{item.imagePath}</Text>
          </View>
        )}
      </View>
      {isV2 ? (
        <View style={styles.metaRow}>
          <Text style={styles.metaEyebrow}>{item.editorial.eyebrow}</Text>
          <Text style={styles.metaDivider}>•</Text>
          <Text style={styles.metaBrand}>{categoryLabel}</Text>
        </View>
      ) : null}
      <View style={styles.header}>
        <View style={styles.nameWrap}>
          <Text style={[styles.brand, isV2 && styles.brandV2]} numberOfLines={1}>{item.brand}</Text>
          <Text style={[styles.name, isV2 && styles.nameV2]} numberOfLines={1}>{displayName}</Text>
        </View>
      </View>
      <View style={styles.commerceRow}>
        <Text style={styles.priceText}>{priceLabel}</Text>
        {marketLabel ? <Text style={styles.marketText}>{marketLabel}</Text> : null}
      </View>
      <Text style={[styles.description, isV2 && styles.descriptionV2]} numberOfLines={2}>{item.description}</Text>
      <View style={styles.tagRow}>
        {item.tags.map((tag) => (
          <View key={tag} style={[styles.tagPill, isV2 && styles.tagPillV2]}>
            <Text style={[styles.tagText, isV2 && styles.tagTextV2]}>{tag}</Text>
          </View>
        ))}
      </View>
      {isV2 ? (
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>{item.editorial.footerHint}</Text>
          <Text style={styles.footerArrow}>›</Text>
        </View>
      ) : null}
    </Pressable>
  );
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
  card: {
    padding: 18,
    marginBottom: 14,
    gap: 12,
    overflow: 'hidden',
  },
  cardV2: {
    backgroundColor: V2_SURFACE,
    borderColor: V2_BORDER,
  },
  cardInteractive: {
    borderColor: V2_BORDER_STRONG,
  },
  cardPressed: {
    transform: [{ translateY: 1 }],
    backgroundColor: 'rgba(27, 38, 48, 0.96)',
  },
  glow: {
    position: 'absolute',
    top: -24,
    right: -12,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imageFrame: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: luxuryRadii.card,
    borderWidth: 1,
    borderColor: V2_BORDER,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)',
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
    paddingHorizontal: 14,
  },
  placeholderInitials: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.headingMd,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  imagePathText: {
    maxWidth: '92%',
    color: V2_TEXT_MUTED,
    fontSize: TYPE_SCALE.caption - 1,
    fontFamily: luxuryFonts.sans,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaEyebrow: {
    fontSize: TYPE_SCALE.caption - 1,
    fontWeight: '700',
    letterSpacing: luxuryTracking.label,
    color: V2_TEXT_MUTED,
    fontFamily: luxuryFonts.sans,
  },
  metaDivider: {
    fontSize: TYPE_SCALE.caption,
    color: V2_TEXT_MUTED,
    fontFamily: luxuryFonts.sans,
  },
  metaBrand: {
    fontSize: TYPE_SCALE.caption,
    color: V2_TEXT_SECONDARY,
    fontFamily: luxuryFonts.sans,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameWrap: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: TYPE_SCALE.title,
    color: V2_TEXT_PRIMARY,
    fontFamily: luxuryFonts.display,
  },
  nameV2: {
    color: V2_TEXT_PRIMARY,
  },
  brand: {
    fontSize: TYPE_SCALE.caption - 1,
    color: V2_TEXT_MUTED,
    fontWeight: '300',
    fontFamily: luxuryFonts.sans,
  },
  brandV2: {
    color: V2_TEXT_MUTED,
  },
  commerceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  priceText: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.title - 2,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  marketText: {
    color: V2_TEXT_MUTED,
    fontSize: TYPE_SCALE.caption,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  description: {
    fontSize: TYPE_SCALE.body,
    color: V2_TEXT_SECONDARY,
    lineHeight: 18,
    fontFamily: luxuryFonts.sans,
  },
  descriptionV2: {
    color: V2_TEXT_SECONDARY,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagPill: {
    backgroundColor: V2_PILL_BG,
    borderWidth: 1,
    borderColor: V2_PILL_BORDER,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagPillV2: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: V2_BORDER,
  },
  tagText: {
    fontSize: TYPE_SCALE.caption,
    color: V2_TEXT_SECONDARY,
    fontFamily: luxuryFonts.sans,
  },
  tagTextV2: {
    color: V2_TEXT_SECONDARY,
  },
  footerRow: {
    marginTop: 2,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: TYPE_SCALE.caption,
    color: V2_TEXT_MUTED,
    fontWeight: '600',
    fontFamily: luxuryFonts.sans,
  },
  footerArrow: {
    fontSize: TYPE_SCALE.body + 2,
    color: V2_ACCENT,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
});
