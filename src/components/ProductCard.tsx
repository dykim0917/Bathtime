import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ui } from '@/src/theme/ui';
import {
  PILL_BG,
  PILL_BORDER,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TYPE_SCALE,
  V2_ACCENT,
  V2_BORDER,
  V2_BORDER_STRONG,
  V2_SURFACE,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
} from '@/src/data/colors';
import { CatalogProduct, ProductCategory } from '@/src/data/catalog';
import { luxuryFonts, luxuryRadii, luxuryTracking } from '@/src/theme/luxury';

interface ProductCardProps {
  item: CatalogProduct;
  variant?: 'default' | 'v2';
  onPress?: () => void;
}

export function ProductCard({ item, variant = 'default', onPress }: ProductCardProps) {
  const isV2 = variant === 'v2';
  const categoryLabel = getCategoryLabel(item.category);

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
      {isV2 ? (
        <View style={styles.metaRow}>
          <Text style={styles.metaEyebrow}>{item.editorial.eyebrow}</Text>
          <Text style={styles.metaDivider}>•</Text>
          <Text style={styles.metaBrand}>{categoryLabel}</Text>
        </View>
      ) : null}
      <View style={styles.header}>
        <View style={[styles.emojiWrap, { backgroundColor: item.bgColor }, isV2 && styles.emojiWrapV2]}>
          <Text style={styles.emoji}>{item.emoji}</Text>
        </View>
        <View style={styles.nameWrap}>
          <Text style={[styles.name, isV2 && styles.nameV2]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.brand, isV2 && styles.brandV2]} numberOfLines={1}>{item.brand}</Text>
        </View>
      </View>
      <Text style={[styles.description, isV2 && styles.descriptionV2]} numberOfLines={2}>{item.description}</Text>
      <View style={styles.tagRow}>
        {item.tags.map((tag) => (
          <View key={tag} style={[styles.tagPill, isV2 && styles.tagPillV2]}>
            <Text style={[styles.tagText, isV2 && styles.tagTextV2]}>#{tag}</Text>
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

function getCategoryLabel(category: ProductCategory): string {
  switch (category) {
    case 'essential_oil':
      return 'ESSENTIAL OIL';
    case 'bath_salt':
      return 'BATH SALT';
    case 'herb':
      return 'HERBAL PICK';
    case 'bath_item':
      return 'BATH ITEM';
    case 'body_wash':
      return 'BODY WASH';
    default:
      return 'CURATED PRODUCT';
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
    gap: 12,
  },
  emojiWrap: {
    width: 52,
    height: 52,
    borderRadius: luxuryRadii.button,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiWrapV2: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  emoji: {
    fontSize: 24,
  },
  nameWrap: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: TYPE_SCALE.title,
    color: TEXT_PRIMARY,
    fontFamily: luxuryFonts.display,
  },
  nameV2: {
    color: V2_TEXT_PRIMARY,
  },
  brand: {
    fontSize: TYPE_SCALE.caption,
    color: TEXT_MUTED,
    fontFamily: luxuryFonts.sans,
  },
  brandV2: {
    color: V2_TEXT_MUTED,
  },
  description: {
    fontSize: TYPE_SCALE.body,
    color: TEXT_SECONDARY,
    lineHeight: 20,
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
    backgroundColor: PILL_BG,
    borderWidth: 1,
    borderColor: PILL_BORDER,
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
    color: TEXT_SECONDARY,
    fontWeight: '500',
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
