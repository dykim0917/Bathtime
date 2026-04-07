import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { CatalogProduct, PRODUCT_CATEGORY_LABELS } from '@/src/data/catalog';
import {
  V2_ACCENT,
  TYPE_SCALE,
  V2_ACCENT_TEXT,
  V2_BG_OVERLAY,
  V2_BORDER,
  V2_MODAL_SURFACE,
  V2_SURFACE_SOFT,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
} from '@/src/data/colors';
import { luxuryFonts, luxuryRadii, luxuryTracking } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';

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
  secondaryActionLabel = 'Product 탭에서 전체 보기',
  closeActionLabel = '루틴으로 돌아가기',
}: ProductDetailModalProps) {
  if (!product) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={[styles.iconWrap, { backgroundColor: product.bgColor }]}>
              <Text style={styles.icon}>{product.emoji}</Text>
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.brand}>{product.brand}</Text>
              <Text style={styles.name}>{product.name}</Text>
              <Text style={styles.meta}>
                {PRODUCT_CATEGORY_LABELS[product.category]} · {product.priceTier}
              </Text>
            </View>
          </View>

          <View style={styles.bodyCard}>
            <View style={styles.detailMetaRow}>
              <View style={styles.detailMetaPill}>
                <Text style={styles.detailMetaText}>{PRODUCT_CATEGORY_LABELS[product.category]}</Text>
              </View>
              <View style={styles.detailMetaPill}>
                <Text style={styles.detailMetaText}>{product.priceTier.toUpperCase()}</Text>
              </View>
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
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>{closeActionLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: V2_BG_OVERLAY,
  },
  card: {
    backgroundColor: V2_MODAL_SURFACE,
    borderTopLeftRadius: luxuryRadii.cardLg,
    borderTopRightRadius: luxuryRadii.cardLg,
    borderWidth: 1,
    borderColor: V2_BORDER,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 26,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: luxuryRadii.button,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  icon: {
    fontSize: 28,
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
    gap: 12,
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
    fontWeight: '800',
    letterSpacing: 0.3,
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
    gap: 10,
  },
  closeButton: {
    borderRadius: luxuryRadii.button,
    borderWidth: 1,
    borderColor: V2_BORDER,
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  closeButtonText: {
    color: V2_TEXT_PRIMARY,
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
