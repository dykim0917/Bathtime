import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductCard } from '@/src/components/ProductCard';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS,
  PRODUCTS,
  ProductCategory,
} from '@/src/data/products';
import {
  TYPE_SCALE,
  V2_ACCENT,
  V2_BG_BASE,
  V2_BG_BOTTOM,
  V2_BG_TOP,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
} from '@/src/data/colors';
import { ui } from '@/src/theme/ui';

const SCREEN_HORIZONTAL_PADDING = 22;

export default function ProductScreen() {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('all');
  const insets = useSafeAreaInsets();

  const filtered =
    activeCategory === 'all'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <View style={[ui.screenShellV2, { paddingTop: insets.top }]}> 
      <LinearGradient colors={[V2_BG_TOP, V2_BG_BASE, V2_BG_BOTTOM]} style={StyleSheet.absoluteFillObject} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[ui.glassCardV2, styles.heroCard]}>
          <Text style={styles.eyebrow}>CURATED PRODUCTS</Text>
          <Text style={ui.titleHeroV2}>오늘의 제품</Text>
          <Text style={styles.subtitle}>루틴에 어울리는 오일, 솔트, 허브를 감도 있게 골라보세요.</Text>
        </View>

        <View>
          <Text style={styles.sectionTitle}>카테고리</Text>
          <View style={styles.categoryRow}>
            {PRODUCT_CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                style={[
                  ui.pillButtonV2,
                  styles.categoryPill,
                  activeCategory === cat && ui.pillButtonV2Active,
                ]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    activeCategory === cat && styles.categoryTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {PRODUCT_CATEGORY_LABELS[cat]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>에디터 픽</Text>
          <Text style={styles.listMeta}>{filtered.length}개 제품 · 루틴에 바로 붙이기 쉬운 조합만 모았어요</Text>
          <View>
            {filtered.map((item) => (
              <ProductCard key={item.id} item={item} variant="v2" />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: 16,
    gap: 18,
  },
  heroCard: {
    padding: 18,
    gap: 8,
  },
  eyebrow: {
    fontSize: TYPE_SCALE.caption - 1,
    fontWeight: '700',
    color: V2_ACCENT,
    letterSpacing: 1.2,
  },
  subtitle: {
    fontSize: TYPE_SCALE.body,
    color: V2_TEXT_SECONDARY,
    lineHeight: 21,
  },
  sectionTitle: {
    color: V2_TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: TYPE_SCALE.title,
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 8,
    rowGap: 8,
  },
  categoryPill: {
    minHeight: 44,
  },
  categoryText: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_SCALE.body,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: V2_ACCENT,
  },
  listSection: {
    paddingBottom: 8,
  },
  listMeta: {
    fontSize: TYPE_SCALE.caption,
    color: V2_TEXT_MUTED,
    marginBottom: 10,
  },
});
