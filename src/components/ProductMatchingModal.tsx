import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ProductMatchItem } from '@/src/engine/productMatching';
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
import { copy } from '@/src/content/copy';

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
    backgroundColor: 'rgba(17,29,48,0.3)',
  },
  card: {
    maxHeight: '84%',
    backgroundColor: MODAL_SURFACE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: TYPE_SCALE.caption,
    fontWeight: '700',
    color: TEXT_SECONDARY,
  },
  subTitle: {
    marginTop: 4,
    fontSize: TYPE_SCALE.title,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  body: {
    marginTop: 12,
  },
  bodyContent: {
    gap: 10,
    paddingBottom: 8,
  },
  slotCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    backgroundColor: MODAL_SUB_SURFACE,
    padding: 12,
    gap: 6,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotTitle: {
    color: TEXT_SECONDARY,
    fontSize: TYPE_SCALE.caption,
    fontWeight: '700',
  },
  pickBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  pickBadgeText: {
    color: TEXT_PRIMARY,
    fontSize: TYPE_SCALE.caption,
    fontWeight: '700',
  },
  productName: {
    color: TEXT_PRIMARY,
    fontSize: TYPE_SCALE.body,
    fontWeight: '700',
  },
  metaText: {
    color: TEXT_SECONDARY,
    fontSize: TYPE_SCALE.caption,
  },
  reasonText: {
    color: TEXT_PRIMARY,
    fontSize: TYPE_SCALE.body,
    lineHeight: 20,
  },
  buttonRow: {
    marginTop: 4,
    flexDirection: 'row',
    gap: 8,
  },
  ghostButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingVertical: 10,
    alignItems: 'center',
  },
  ghostText: {
    color: TEXT_PRIMARY,
    fontSize: TYPE_SCALE.body,
    fontWeight: '600',
  },
  linkButton: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: MODAL_ACCENT_SURFACE,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingVertical: 10,
    alignItems: 'center',
  },
  linkText: {
    color: TEXT_PRIMARY,
    fontSize: TYPE_SCALE.body,
    fontWeight: '700',
  },
  footerRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  closeButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeText: {
    color: TEXT_PRIMARY,
    fontSize: TYPE_SCALE.body,
    fontWeight: '700',
  },
  continueButton: {
    flex: 1.5,
    borderRadius: 12,
    backgroundColor: BTN_PRIMARY,
    paddingVertical: 12,
    alignItems: 'center',
  },
  continueText: {
    color: BTN_PRIMARY_TEXT,
    fontSize: TYPE_SCALE.body,
    fontWeight: '700',
  },
});
