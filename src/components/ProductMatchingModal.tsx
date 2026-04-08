import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ProductMatchItem } from '@/src/engine/productMatching';
import {
  TYPE_SCALE,
  V2_ACCENT,
  V2_ACCENT_TEXT,
  V2_BG_OVERLAY,
  V2_BORDER,
  V2_MODAL_SURFACE,
  V2_SURFACE_SOFT,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
} from '@/src/data/colors';
import { copy } from '@/src/content/copy';
import { luxuryFonts, luxuryRadii, luxuryTracking } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';

interface ProductMatchingModalProps {
  visible: boolean;
  items: ProductMatchItem[];
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
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={styles.card}>
          <View style={styles.handle} />
          <Text style={styles.title}>{copy.product.title}</Text>
          <Text style={styles.subTitle}>{copy.product.subtitle}</Text>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {items.map((item) => (
              <View key={`${item.slot}_${item.product.id}`} style={styles.slotCard}>
                <View style={styles.rowBetween}>
                  <Text style={styles.slotTitle}>{copy.product.slotTitle[item.slot]}</Text>
                  {item.sommelierPick ? (
                    <View style={styles.pickBadge}>
                      <Text style={styles.pickBadgeText}>{copy.product.pickBadge}</Text>
                    </View>
                  ) : null}
                </View>

                <Text style={styles.productName}>{item.product.name}</Text>
                <Text style={styles.metaText}>{item.product.brand}</Text>
                <Text style={styles.metaText}>{copy.product.labels.mechanism}: {item.reason}</Text>
                <Text style={styles.metaText}>{copy.product.labels.priceTier}: {item.priceTier}</Text>
                <Text style={styles.reasonText}>{item.product.description}</Text>

                <View style={styles.buttonRow}>
                  <Pressable style={styles.ghostButton} onPress={() => onProductPress(item)}>
                    <Text style={styles.ghostText}>{copy.product.cta.detail}</Text>
                  </Pressable>
                  <Pressable style={styles.linkButton} onPress={() => onPurchasePress(item)}>
                    <Text style={styles.linkText}>{copy.product.cta.purchase}</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>{copy.product.cta.close}</Text>
          </Pressable>
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
    paddingTop: 48,
  },
  card: {
    maxHeight: '84%',
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
    backgroundColor: 'rgba(245,240,232,0.28)',
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
    marginTop: 14,
  },
  bodyContent: {
    gap: 10,
    paddingBottom: 8,
  },
  slotCard: {
    borderRadius: luxuryRadii.card,
    borderWidth: 1,
    borderColor: V2_BORDER,
    backgroundColor: V2_SURFACE_SOFT,
    padding: 14,
    gap: 7,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotTitle: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_SCALE.caption,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  pickBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: V2_BORDER,
  },
  pickBadgeText: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.caption,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  productName: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.title - 1,
    fontFamily: luxuryFonts.display,
  },
  metaText: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_SCALE.caption,
    fontFamily: luxuryFonts.sans,
  },
  reasonText: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.body,
    lineHeight: 20,
    fontFamily: luxuryFonts.sans,
  },
  buttonRow: {
    marginTop: 6,
    flexDirection: 'row',
    gap: 8,
  },
  ghostButton: {
    flex: 1,
    borderRadius: luxuryRadii.button,
    borderWidth: 1,
    borderColor: V2_BORDER,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ghostText: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.body,
    fontWeight: '600',
    fontFamily: luxuryFonts.sans,
  },
  linkButton: {
    flex: 1,
    borderRadius: luxuryRadii.button,
    backgroundColor: V2_ACCENT,
    borderWidth: 1,
    borderColor: V2_BORDER,
    paddingVertical: 12,
    alignItems: 'center',
  },
  linkText: {
    color: V2_ACCENT_TEXT,
    fontSize: TYPE_SCALE.body,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  closeButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 4,
  },
  closeText: {
    color: V2_TEXT_MUTED,
    fontSize: TYPE_SCALE.body,
    fontWeight: '600',
    fontFamily: luxuryFonts.sans,
  },
});
