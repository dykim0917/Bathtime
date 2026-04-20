import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  V2_ACCENT,
  V2_ACCENT_TEXT,
  V2_BG_OVERLAY,
  V2_BORDER,
  V2_DANGER,
  V2_MODAL_SURFACE,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
  V2_WARNING,
} from '@/src/data/colors';
import { PreBathChecklistItem } from '@/src/engine/preBathChecklist';
import { copy } from '@/src/content/copy';
import { luxuryFonts, luxuryRadii, luxuryTracking } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';
import { AnimatedModalShell } from '@/src/components/AnimatedModalShell';

const ITEM_ESTIMATED_HEIGHT = 92;
const CARD_FIXED_HEIGHT = 220;
const CARD_MAX_HEIGHT_RATIO = 0.9;

interface PreBathGateModalProps {
  visible: boolean;
  title: string;
  subtitle: string;
  items: PreBathChecklistItem[];
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function PreBathGateModal({
  visible,
  title,
  subtitle,
  items,
  confirmLabel,
  onClose,
  onConfirm,
}: PreBathGateModalProps) {
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const { height: windowHeight } = useWindowDimensions();

  useEffect(() => {
    if (!visible) return;
    setCheckedIds([]);
  }, [items, visible]);

  const allChecked = useMemo(
    () => items.length > 0 && items.every((item) => checkedIds.includes(item.id)),
    [checkedIds, items]
  );

  const maxCardHeight = Math.min(windowHeight - 20, windowHeight * CARD_MAX_HEIGHT_RATIO);
  const maxListHeight = Math.max(0, maxCardHeight - CARD_FIXED_HEIGHT);
  const estimatedListHeight = items.length * ITEM_ESTIMATED_HEIGHT;
  const resolvedListHeight = Math.min(estimatedListHeight, maxListHeight);
  const shouldScroll = estimatedListHeight > maxListHeight;

  if (!visible || items.length === 0) return null;

  const toggleItem = (id: string) => {
    setCheckedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
    );
  };

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
          <View style={styles.warningBanner}>
            <View style={styles.warningIconWrap}>
              <FontAwesome name="exclamation-triangle" size={14} color={V2_DANGER} />
            </View>
            <View style={styles.warningCopy}>
              <Text style={styles.eyebrow}>{copy.routine.preBath.warningBadge}</Text>
              <Text style={styles.warningLead}>{copy.routine.preBath.warningLead}</Text>
            </View>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <ScrollView
            style={[styles.list, { maxHeight: resolvedListHeight }]}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={shouldScroll}
            bounces={shouldScroll}
          >
            {items.map((item, index) => {
              const checked = checkedIds.includes(item.id);
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked }}
                  testID={`prebath-item-${item.id}`}
                  style={[styles.itemRow, index === items.length - 1 && styles.itemRowLast]}
                  onPress={() => toggleItem(item.id)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      checked && styles.checkboxChecked,
                    ]}
                  >
                    {checked ? (
                      <FontAwesome name="check" size={13} color={V2_ACCENT_TEXT} />
                    ) : null}
                  </View>
                  <View style={styles.itemCopy}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemBody}>{item.body}</Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={styles.buttonStack}>
            <Pressable
              accessibilityState={{ disabled: !allChecked }}
              testID="prebath-confirm-button"
              style={[
                ui.primaryButtonV2,
                styles.confirmButton,
                !allChecked && styles.confirmButtonDisabled,
              ]}
              disabled={!allChecked}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
            <Pressable style={styles.closeButton} onPress={requestClose}>
              <Text style={styles.closeText}>닫기</Text>
            </Pressable>
          </View>
        </View>
      )}
    </AnimatedModalShell>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: 32,
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
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 24,
    backgroundColor: V2_MODAL_SURFACE,
    borderTopLeftRadius: luxuryRadii.cardLg,
    borderTopRightRadius: luxuryRadii.cardLg,
    borderWidth: 1,
    borderColor: 'rgba(194, 134, 118, 0.34)',
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(245,240,232,0.28)',
    marginBottom: 14,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderRadius: luxuryRadii.card,
    backgroundColor: 'rgba(194, 134, 118, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(194, 134, 118, 0.24)',
  },
  warningIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(194, 134, 118, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(194, 134, 118, 0.28)',
  },
  warningCopy: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    fontSize: 12,
    color: V2_DANGER,
    letterSpacing: luxuryTracking.label,
    fontFamily: luxuryFonts.sans,
    fontWeight: '800',
  },
  warningLead: {
    fontSize: 14,
    color: V2_TEXT_PRIMARY,
    fontFamily: luxuryFonts.sans,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    color: V2_TEXT_PRIMARY,
    marginBottom: 8,
    fontFamily: luxuryFonts.display,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: V2_TEXT_SECONDARY,
    marginBottom: 14,
    fontFamily: luxuryFonts.sans,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    paddingBottom: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: V2_BORDER,
  },
  itemRowLast: {
    borderBottomWidth: 0,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: V2_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  checkboxChecked: {
    backgroundColor: V2_WARNING,
    borderColor: V2_WARNING,
  },
  itemCopy: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontSize: 15,
    color: V2_TEXT_PRIMARY,
    lineHeight: 22,
    fontFamily: luxuryFonts.sans,
    fontWeight: '700',
  },
  itemBody: {
    fontSize: 13,
    color: V2_TEXT_MUTED,
    lineHeight: 19,
    fontFamily: luxuryFonts.sans,
  },
  buttonStack: {
    marginTop: 14,
    gap: 12,
  },
  confirmButton: {
    width: '100%',
    backgroundColor: V2_WARNING,
    borderColor: 'rgba(194, 134, 118, 0.34)',
  },
  confirmButtonDisabled: {
    opacity: 0.42,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: V2_ACCENT_TEXT,
    fontFamily: luxuryFonts.sans,
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
    color: V2_TEXT_MUTED,
    fontFamily: luxuryFonts.sans,
  },
});
