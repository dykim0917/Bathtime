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
  onContinue: () => void;
  onProductPress: (item: ProductMatchItem) => void;
  onPurchasePress: (item: ProductMatchItem) => void;
}

export function ProductMatchingModal({
  visible,
  items,
  onClose,
  onContinue,
  onProductPress,
  onPurchasePress,
}: ProductMatchingModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
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

          <View style={styles.footerRow}>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>{copy.product.cta.close}</Text>
            </Pressable>
            <Pressable style={styles.continueButton} onPress={onContinue}>
              <Text style={styles.continueText}>{copy.product.cta.continue}</Text>
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
    maxHeight: '84%',
    backgroundColor: V2_MODAL_SURFACE,
    borderTopLeftRadius: luxuryRadii.cardLg,
    borderTopRightRadius: luxuryRadii.cardLg,
    borderWidth: 1,
    borderColor: V2_BORDER,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
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
    fontSize: TYPE_SCALE.title,
    color: V2_TEXT_PRIMARY,
    fontFamily: luxuryFonts.display,
  },
  body: {
    marginTop: 12,
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
    padding: 12,
    gap: 6,
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
    marginTop: 4,
    flexDirection: 'row',
    gap: 8,
  },
  ghostButton: {
    flex: 1,
    borderRadius: luxuryRadii.button,
    borderWidth: 1,
    borderColor: V2_BORDER,
    paddingVertical: 10,
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
    paddingVertical: 10,
    alignItems: 'center',
  },
  linkText: {
    color: V2_ACCENT_TEXT,
    fontSize: TYPE_SCALE.body,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  footerRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  closeButton: {
    flex: 1,
    borderRadius: luxuryRadii.button,
    borderWidth: 1,
    borderColor: V2_BORDER,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeText: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.body,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  continueButton: {
    flex: 1.5,
    borderRadius: luxuryRadii.button,
    backgroundColor: V2_ACCENT,
    paddingVertical: 12,
    alignItems: 'center',
  },
  continueText: {
    color: V2_ACCENT_TEXT,
    fontSize: TYPE_SCALE.body,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
});
