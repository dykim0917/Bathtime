import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductCard } from '@/src/components/ProductCard';
import { ProductDetailModal } from '@/src/components/ProductDetailModal';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS,
  CatalogProduct,
  ProductCategory,
  getBeginnerFriendlyProductCatalog,
} from '@/src/data/catalog';
import { useCatalogHydration } from '@/src/data/catalogRuntime';
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
import { luxuryFonts, luxuryTracking } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';

const SCREEN_HORIZONTAL_PADDING = 22;

export default function ProductScreen() {
  const { highlight } = useLocalSearchParams<{ highlight?: string }>();
  const { products, status } = useCatalogHydration();
  const beginnerProducts = getBeginnerFriendlyProductCatalog().filter((item) =>
    products.some((product) => product.id === item.id)
  );
  const highlightedProduct = highlight
    ? beginnerProducts.find((item) => item.id === highlight)
    : undefined;
  const initialCategory = highlightedProduct?.category ?? 'all';
  const [activeCategory, setActiveCategory] = useState<ProductCategory>(initialCategory);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const insets = useSafeAreaInsets();
  const categoryItems =
    activeCategory === 'all'
      ? beginnerProducts
      : beginnerProducts.filter((item) => item.category === activeCategory);

  useEffect(() => {
    if (highlightedProduct?.category) {
      setActiveCategory(highlightedProduct.category);
    }
  }, [highlightedProduct?.category]);
  const filtered =
    highlight && categoryItems.some((item) => item.id === highlight)
      ? [
          ...categoryItems.filter((item) => item.id === highlight),
          ...categoryItems.filter((item) => item.id !== highlight),
        ]
      : categoryItems;

  const handleProductPurchase = async (product: CatalogProduct) => {
    if (!product.purchaseUrl) {
      Alert.alert('구매 링크 없음', '아직 연결된 구매 링크가 없어요.');
      return;
    }

    const supported = await Linking.canOpenURL(product.purchaseUrl);
    if (!supported) {
      Alert.alert('링크 열기 실패', '지금은 구매 링크를 열 수 없어요.');
      return;
    }

    await Linking.openURL(product.purchaseUrl);
  };

  return (
    <View style={[ui.screenShellV2, { paddingTop: insets.top }]}> 
      <LinearGradient colors={[V2_BG_TOP, V2_BG_BASE, V2_BG_BOTTOM]} style={StyleSheet.absoluteFillObject} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[ui.glassCardV2, styles.heroCard]}>
          <Text style={styles.eyebrow}>CURATED PRODUCTS</Text>
          <Text style={styles.heroTitle}>오늘의 제품</Text>
          <Text style={styles.subtitle}>
            {highlightedProduct
              ? `${highlightedProduct.name}부터 이어서 볼 수 있어요.`
              : status === 'loading'
                ? '실제 카탈로그를 불러오는 중이에요.'
                : '지금 바로 쓰기 쉬운 입욕제, 샤워 아이템, 바디워시만 먼저 골라봤어요.'}
          </Text>
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
          <Text style={styles.listMeta}>{filtered.length}개 제품 · 입문자가 바로 써보기 쉬운 완제품만 모았어요</Text>
          <View>
            {filtered.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                variant="v2"
                onPress={() => setSelectedProduct(item)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
      <ProductDetailModal
        visible={selectedProduct !== null}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onPurchasePress={handleProductPurchase}
        closeActionLabel="제품 목록으로 돌아가기"
      />
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
    padding: 20,
    gap: 10,
  },
  eyebrow: {
    fontSize: TYPE_SCALE.caption - 1,
    fontWeight: '700',
    color: V2_ACCENT,
    letterSpacing: luxuryTracking.eyebrow,
    fontFamily: luxuryFonts.sans,
  },
  heroTitle: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.headingLg,
    lineHeight: 38,
    fontFamily: luxuryFonts.display,
  },
  subtitle: {
    fontSize: TYPE_SCALE.body + 1,
    color: V2_TEXT_SECONDARY,
    lineHeight: 23,
    fontFamily: luxuryFonts.sans,
  },
  sectionTitle: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.title,
    fontFamily: luxuryFonts.display,
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
    fontFamily: luxuryFonts.sans,
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
    fontFamily: luxuryFonts.sans,
  },
});
