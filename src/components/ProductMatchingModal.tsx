import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { ProductGuideItem, ProductMatchItem, ProductMatchingItem } from '@/src/engine/productMatching';
import {
  TYPE_SCALE,
  V2_ACCENT,
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
import { copy } from '@/src/content/copy';
import { luxuryFonts, luxuryRadii, luxuryTracking } from '@/src/theme/luxury';
import { AnimatedModalShell } from '@/src/components/AnimatedModalShell';
import { getProductImageSource } from '@/src/data/productImages';
import { formatProductPrice, getDisplayProductName } from '@/src/utils/productDisplay';

const CARD_MAX_HEIGHT_RATIO = 0.9;
const CARD_VERTICAL_MARGIN = 24;

interface ProductMatchingModalProps {
  visible: boolean;
  items: ProductMatchingItem[];
  onClose: () => void;
  onProductPress: (item: ProductMatchItem) => void;
  onPurchasePress: (item: ProductMatchItem) => void;
}

export function ProductMatchingModal({
  visible,
  items,
  onClose,
  onProductPress,
  onPurchasePress,
}: ProductMatchingModalProps) {
  const { height: windowHeight } = useWindowDimensions();
  const maxCardHeight = Math.min(
    windowHeight - CARD_VERTICAL_MARGIN,
    windowHeight * CARD_MAX_HEIGHT_RATIO
  );
  const productItems = items.filter((item): item is ProductMatchItem => item.kind === 'product');
  const guideItems = items.filter((item): item is ProductGuideItem => item.kind === 'guide');
  const primaryProduct = productItems[0];
  const alternativeProducts = productItems.slice(1);

  return (
    <AnimatedModalShell
      visible={visible}
      onClose={onClose}
      layoutStyle={styles.overlay}
      backdropStyle={styles.backdrop}
      containerStyle={styles.container}
    >
      {(requestClose) => (
        <View style={[styles.card, { maxHeight: maxCardHeight }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>{copy.product.title}</Text>
          <Text style={styles.subTitle}>{copy.product.subtitle}</Text>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {primaryProduct ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{copy.product.primarySectionTitle}</Text>
                <FeaturedProductCard
                  item={primaryProduct}
                  onProductPress={onProductPress}
                  onPurchasePress={onPurchasePress}
                />
              </View>
            ) : null}

            {alternativeProducts.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{copy.product.alternativeSectionTitle}</Text>
                {alternativeProducts.map((item) => (
                  <CompactProductRow
                    key={`${item.slot}_${item.product.id}`}
                    item={item}
                    onProductPress={onProductPress}
                    onPurchasePress={onPurchasePress}
                  />
                ))}
              </View>
            ) : null}

            {guideItems.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{copy.product.guideSectionTitle}</Text>
                {guideItems.map((item) => (
                  <GuideRow key={`${item.slot}_${item.title}`} item={item} />
                ))}
              </View>
            ) : null}
          </ScrollView>

          <Pressable style={styles.closeButton} onPress={requestClose}>
            <Text style={styles.closeText}>{copy.product.cta.close}</Text>
          </Pressable>
        </View>
      )}
    </AnimatedModalShell>
  );
}

function FeaturedProductCard({
  item,
  onProductPress,
  onPurchasePress,
}: {
  item: ProductMatchItem;
  onProductPress: (item: ProductMatchItem) => void;
  onPurchasePress: (item: ProductMatchItem) => void;
}) {
  return (
    <View style={styles.featuredCard}>
      <View style={styles.featuredImageWrap}>
        <ProductImage item={item} variant="featured" />
        <View style={styles.bestBadge}>
          <Text style={styles.bestBadgeText}>{copy.product.pickBadge}</Text>
        </View>
      </View>
      <View style={styles.featuredInfo}>
        <Text style={styles.brand}>{item.product.brand}</Text>
        <Text style={styles.productName}>{getDisplayProductName(item.product)}</Text>
        <TagRow tags={item.product.tags.slice(0, 3)} />
        <Text style={styles.description} numberOfLines={3}>{item.product.description}</Text>
        <Text style={styles.price}>{formatProductPrice(item.product)}</Text>
        <View style={styles.buttonRow}>
          <Pressable style={styles.ghostButton} onPress={() => onProductPress(item)}>
            <Text style={styles.ghostText}>{copy.product.cta.detail}</Text>
          </Pressable>
          <Pressable style={styles.linkButton} onPress={() => onPurchasePress(item)}>
            <Text style={styles.linkText}>{copy.product.cta.purchase}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function CompactProductRow({
  item,
  onProductPress,
  onPurchasePress,
}: {
  item: ProductMatchItem;
  onProductPress: (item: ProductMatchItem) => void;
  onPurchasePress: (item: ProductMatchItem) => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.product.brand} ${getDisplayProductName(item.product)} ${copy.product.cta.detail}`}
      style={({ pressed }) => [styles.compactRow, pressed ? styles.compactRowPressed : null]}
      onPress={() => onProductPress(item)}
    >
      <ProductImage item={item} variant="compact" />
      <View style={styles.compactInfo}>
        <Text style={styles.compactBrand} numberOfLines={1}>{item.product.brand}</Text>
        <Text style={styles.compactName} numberOfLines={1}>{getDisplayProductName(item.product)}</Text>
        <TagRow tags={item.product.tags.slice(0, 2)} compact />
      </View>
      <Pressable
        accessibilityRole="link"
        style={styles.compactPurchaseButton}
        onPress={(event) => {
          event.stopPropagation();
          onPurchasePress(item);
        }}
      >
        <Text style={styles.compactPurchaseText}>{copy.product.cta.purchase}</Text>
      </Pressable>
    </Pressable>
  );
}

function GuideRow({ item }: { item: ProductGuideItem }) {
  return (
    <View style={styles.guideRow}>
      <View style={styles.guideInfo}>
        <Text style={styles.guideTitle}>{item.title}</Text>
        <Text style={styles.guideDescription} numberOfLines={2}>{item.description}</Text>
        <TagRow tags={item.tags.slice(0, 3)} compact />
      </View>
    </View>
  );
}

function ProductImage({
  item,
  variant,
}: {
  item: ProductMatchItem;
  variant: 'featured' | 'compact';
}) {
  const imageSource = getProductImageSource(item.product.id);
  const isFeatured = variant === 'featured';

  if (imageSource) {
    return (
      <Image
        source={imageSource}
        style={isFeatured ? styles.featuredImage : styles.compactImage}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={[
        isFeatured ? styles.featuredPlaceholder : styles.compactPlaceholder,
        { backgroundColor: `${item.product.bgColor}35` },
      ]}
    >
      <Text style={isFeatured ? styles.placeholderInitials : styles.compactInitials}>
        {item.product.emoji}
      </Text>
      {isFeatured ? (
        <Text style={styles.placeholderPath} numberOfLines={1}>{item.product.imagePath}</Text>
      ) : null}
    </View>
  );
}

function TagRow({ tags, compact = false }: { tags: string[]; compact?: boolean }) {
  return (
    <View style={compact ? styles.compactTagRow : styles.tagRow}>
      {tags.map((tag) => (
        <View key={tag} style={compact ? styles.compactTag : styles.tag}>
          <Text style={compact ? styles.compactTagText : styles.tagText}>{tag}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: 24,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
  },
  backdrop: {
    backgroundColor: V2_BG_OVERLAY,
  },
  card: {
    width: '100%',
    backgroundColor: V2_MODAL_SURFACE,
    borderTopLeftRadius: luxuryRadii.cardLg,
    borderTopRightRadius: luxuryRadii.cardLg,
    borderWidth: 1,
    borderColor: V2_BORDER,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 24,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 999,
    backgroundColor: V2_MODAL_HANDLE,
    marginBottom: 14,
  },
  title: {
    fontSize: TYPE_SCALE.caption,
    fontWeight: '700',
    color: V2_ACCENT,
    letterSpacing: luxuryTracking.label,
    fontFamily: luxuryFonts.sans,
  },
  subTitle: {
    marginTop: 4,
    fontSize: TYPE_SCALE.title + 1,
    color: V2_TEXT_PRIMARY,
    fontFamily: luxuryFonts.display,
  },
  body: {
    marginTop: 18,
  },
  bodyContent: {
    paddingBottom: 8,
    gap: 20,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: V2_ACCENT,
    fontSize: TYPE_SCALE.body,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  featuredCard: {
    borderRadius: luxuryRadii.card,
    borderWidth: 1,
    borderColor: 'rgba(148, 210, 191, 0.44)',
    backgroundColor: V2_SURFACE_SOFT,
    overflow: 'hidden',
  },
  featuredImageWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  placeholderInitials: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.headingMd,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  placeholderPath: {
    maxWidth: '86%',
    color: V2_TEXT_MUTED,
    fontSize: TYPE_SCALE.caption - 1,
    fontFamily: luxuryFonts.sans,
  },
  bestBadge: {
    position: 'absolute',
    left: 12,
    top: 12,
    borderRadius: luxuryRadii.pill,
    backgroundColor: V2_ACCENT,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  bestBadgeText: {
    color: V2_ACCENT_TEXT,
    fontSize: TYPE_SCALE.caption,
    fontWeight: '600',
    fontFamily: luxuryFonts.sans,
  },
  featuredInfo: {
    padding: 16,
    gap: 8,
  },
  productName: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.title + 1,
    lineHeight: 28,
    marginTop: -5,
    fontFamily: luxuryFonts.display,
  },
  brand: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_SCALE.caption,
    fontWeight: '300',
    fontFamily: luxuryFonts.sans,
  },
  price: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.title,
    fontWeight: '700',
    marginTop: 8,
    fontFamily: luxuryFonts.sans,
  },
  description: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_SCALE.body,
    lineHeight: 18,
    fontFamily: luxuryFonts.sans,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  tag: {
    borderRadius: luxuryRadii.pill,
    borderWidth: 1,
    borderColor: V2_BORDER,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  tagText: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_SCALE.caption,
    fontFamily: luxuryFonts.sans,
  },
  buttonRow: {
    marginTop: 4,
    flexDirection: 'row',
    gap: 10,
  },
  ghostButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: luxuryRadii.button,
    borderWidth: 1,
    borderColor: V2_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.body,
    fontWeight: '600',
    fontFamily: luxuryFonts.sans,
  },
  linkButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: luxuryRadii.button,
    backgroundColor: V2_ACCENT,
    borderWidth: 1,
    borderColor: V2_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    color: V2_ACCENT_TEXT,
    fontSize: TYPE_SCALE.body,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  compactRow: {
    minHeight: 92,
    borderRadius: luxuryRadii.button,
    borderWidth: 1,
    borderColor: V2_BORDER,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactRowPressed: {
    opacity: 0.72,
  },
  compactImage: {
    width: 74,
    height: 64,
    borderRadius: 12,
  },
  compactPlaceholder: {
    width: 74,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactInitials: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.title,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  compactInfo: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  compactName: {
    color: V2_TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
    fontFamily: luxuryFonts.display,
  },
  compactBrand: {
    color: V2_TEXT_MUTED,
    fontSize: 11,
    fontWeight: '300',
    fontFamily: luxuryFonts.sans,
  },
  compactTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  compactTag: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: V2_BORDER,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  compactTagText: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_SCALE.caption - 1,
    fontFamily: luxuryFonts.sans,
  },
  compactPurchaseButton: {
    minWidth: 92,
    minHeight: 38,
    borderRadius: luxuryRadii.button,
    borderWidth: 1,
    borderColor: 'rgba(148, 210, 191, 0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  compactPurchaseText: {
    color: V2_ACCENT,
    fontSize: TYPE_SCALE.caption,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  guideRow: {
    borderRadius: luxuryRadii.button,
    borderWidth: 1,
    borderColor: V2_BORDER,
    backgroundColor: 'rgba(255,255,255,0.025)',
    padding: 13,
  },
  guideInfo: {
    gap: 7,
  },
  guideTitle: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.body,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  guideDescription: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_SCALE.caption,
    lineHeight: 18,
    fontFamily: luxuryFonts.sans,
  },
  closeButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 8,
  },
  closeText: {
    color: V2_TEXT_MUTED,
    fontSize: TYPE_SCALE.body,
    fontWeight: '600',
    fontFamily: luxuryFonts.sans,
  },
});
