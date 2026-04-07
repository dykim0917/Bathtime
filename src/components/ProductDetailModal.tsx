import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { CatalogProduct, PRODUCT_CATEGORY_LABELS } from '@/src/data/catalog';
import {
  BTN_PRIMARY,
  BTN_PRIMARY_TEXT,
  CARD_BORDER,
  MODAL_ACCENT_SURFACE,
  MODAL_SUB_SURFACE,
  MODAL_SURFACE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TYPE_SCALE,
} from '@/src/data/colors';

interface ProductDetailModalProps {
  visible: boolean;
  product: CatalogProduct | null;
  onClose: () => void;
  onOpenCatalog: (product: CatalogProduct) => void;
  onPurchasePress: (product: CatalogProduct) => void;
}

export function ProductDetailModal({
  visible,
  product,
  onClose,
  onOpenCatalog,
  onPurchasePress,
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
            <Pressable style={styles.primaryButton} onPress={() => onPurchasePress(product)}>
              <Text style={styles.primaryButtonText}>구매 링크 열기</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => onOpenCatalog(product)}>
              <Text style={styles.secondaryButtonText}>Product 탭에서 전체 보기</Text>
            </Pressable>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>루틴으로 돌아가기</Text>
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
    backgroundColor: 'rgba(17,29,48,0.36)',
  },
  card: {
    backgroundColor: MODAL_SURFACE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 28,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  brand: {
    color: TEXT_SECONDARY,
    fontSize: TYPE_SCALE.caption,
    fontWeight: '700',
  },
  name: {
    color: TEXT_PRIMARY,
    fontSize: TYPE_SCALE.title,
    fontWeight: '800',
  },
  meta: {
    color: TEXT_SECONDARY,
    fontSize: TYPE_SCALE.caption,
  },
  bodyCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    backgroundColor: MODAL_SUB_SURFACE,
    padding: 14,
    gap: 12,
  },
  description: {
    color: TEXT_PRIMARY,
    fontSize: TYPE_SCALE.body,
    lineHeight: 21,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    color: TEXT_SECONDARY,
    fontSize: TYPE_SCALE.caption,
    fontWeight: '600',
  },
  footerHint: {
    color: TEXT_SECONDARY,
    fontSize: TYPE_SCALE.caption,
    lineHeight: 18,
  },
  buttonStack: {
    gap: 8,
  },
  primaryButton: {
    borderRadius: 12,
    backgroundColor: BTN_PRIMARY,
    alignItems: 'center',
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: BTN_PRIMARY_TEXT,
    fontSize: TYPE_SCALE.body,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 12,
    backgroundColor: MODAL_ACCENT_SURFACE,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: TEXT_PRIMARY,
    fontSize: TYPE_SCALE.body,
    fontWeight: '700',
  },
  closeButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    alignItems: 'center',
    paddingVertical: 12,
  },
  closeButtonText: {
    color: TEXT_PRIMARY,
    fontSize: TYPE_SCALE.body,
    fontWeight: '600',
  },
});
