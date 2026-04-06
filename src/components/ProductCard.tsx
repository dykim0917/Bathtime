import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
  V2_SURFACE,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
} from '@/src/data/colors';
import { ProductCategory, ProductItem } from '@/src/data/products';

interface ProductCardProps {
  item: ProductItem;
  variant?: 'default' | 'v2';
}

export function ProductCard({ item, variant = 'default' }: ProductCardProps) {
  const isV2 = variant === 'v2';
  const categoryLabel = getCategoryLabel(item.category);

  return (
    <View style={[ui.glassCard, styles.card, isV2 && styles.cardV2]}>
      {isV2 ? <View style={[styles.glow, { backgroundColor: `${item.bgColor}24` }]} /> : null}
      {isV2 ? (
        <View style={styles.metaRow}>
          <Text style={styles.metaEyebrow}>{categoryLabel}</Text>
          <Text style={styles.metaDivider}>•</Text>
          <Text style={styles.metaBrand}>Bath Edit</Text>
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
          <Text style={styles.footerText}>루틴에 바로 연결하기 좋은 조합</Text>
          <Text style={styles.footerArrow}>›</Text>
        </View>
      ) : null}
    </View>
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
    default:
      return 'CURATED PRODUCT';
  }
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
    gap: 10,
    overflow: 'hidden',
  },
  cardV2: {
    backgroundColor: V2_SURFACE,
    borderColor: V2_BORDER,
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
    letterSpacing: 1.1,
    color: V2_TEXT_MUTED,
  },
  metaDivider: {
    fontSize: TYPE_SCALE.caption,
    color: V2_TEXT_MUTED,
  },
  metaBrand: {
    fontSize: TYPE_SCALE.caption,
    color: V2_TEXT_SECONDARY,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emojiWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
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
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  nameV2: {
    color: V2_TEXT_PRIMARY,
  },
  brand: {
    fontSize: TYPE_SCALE.caption,
    color: TEXT_MUTED,
  },
  brandV2: {
    color: V2_TEXT_MUTED,
  },
  description: {
    fontSize: TYPE_SCALE.body,
    color: TEXT_SECONDARY,
    lineHeight: 20,
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
  },
  footerArrow: {
    fontSize: TYPE_SCALE.body + 2,
    color: V2_ACCENT,
    fontWeight: '700',
  },
});
