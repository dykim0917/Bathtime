import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
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
import { copy } from '@/src/content/copy';
import { OpenTabHeader } from '@/src/components/OpenTabHeader';
import { luxuryFonts } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';
import { openExternalUrl } from '@/src/utils/externalLinks';

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
      Alert.alert(copy.alerts.purchaseUnavailableTitle, copy.alerts.purchaseUnavailableBody);
      return;
    }

    const didOpen = await openExternalUrl(product.purchaseUrl);
    if (!didOpen) {
      Alert.alert(copy.alerts.openLinkFailedTitle, copy.alerts.openLinkFailedBody);
    }
  };

  return (
    <View style={[ui.screenShellV2, { paddingTop: insets.top }]}> 
      <LinearGradient colors={[V2_BG_TOP, V2_BG_BASE, V2_BG_BOTTOM]} style={StyleSheet.absoluteFillObject} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <OpenTabHeader
          eyebrow="입문자 추천"
          title="오늘의 제품"
          subtitle={
            highlightedProduct
              ? `${highlightedProduct.name}부터 이어서 볼 수 있어요.`
              : status === 'loading'
                ? '실제 카탈로그를 불러오는 중이에요.'
                : '지금 바로 쓰기 쉬운 입욕제, 샤워 아이템, 바디워시만 먼저 골라봤어요.'
          }
        />

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
          <Text style={styles.sectionTitle}>바로 보기 좋은 제품</Text>
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
