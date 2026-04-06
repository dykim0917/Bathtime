import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SubProtocolOption } from '@/src/engine/types';
import {
  ACCENT,
  BTN_PRIMARY,
  BTN_PRIMARY_TEXT,
  CARD_BORDER,
  MODAL_ACCENT_SURFACE,
  MODAL_SURFACE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TYPE_SCALE,
  V2_ACCENT,
  V2_ACCENT_SOFT,
  V2_ACCENT_TEXT,
  V2_BORDER,
  V2_MODAL_SURFACE,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
} from '@/src/data/colors';

interface SubProtocolPickerModalProps {
  visible: boolean;
  title: string;
  domain?: 'care' | 'trip';
  options: SubProtocolOption[];
  onClose: () => void;
  onSelect: (option: SubProtocolOption) => void;
  variant?: 'default' | 'v2';
}

export function SubProtocolPickerModal({
  visible,
  title,
  domain,
  options,
  onClose,
  onSelect,
  variant = 'default',
}: SubProtocolPickerModalProps) {
  const heading = domain === 'trip'
    ? '어떤 방식으로 즐겨볼까요?'
    : '혹시 이런 느낌도 있나요?';
  const isV2 = variant === 'v2';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.overlay, isV2 && styles.overlayV2]}>
        <View style={[styles.card, isV2 && styles.cardV2]}>
          <Text style={[styles.title, isV2 && styles.titleV2]}>{heading}</Text>
          <Text style={[styles.subTitle, isV2 && styles.subTitleV2]}>{title}</Text>

          <View style={styles.optionsWrap}>
            {options.map((option) => (
              <Pressable
                key={option.id}
                style={[
                  styles.optionButton,
                  option.is_default && styles.optionButtonDefault,
                  isV2 && styles.optionButtonV2,
                  isV2 && option.is_default && styles.optionButtonDefaultV2,
                ]}
                onPress={() => onSelect(option)}
              >
                <View style={styles.optionLabelRow}>
                  <Text style={[styles.optionLabel, isV2 && styles.optionLabelV2]}>{option.label}</Text>
                  {option.is_default && (
                    <Text style={[styles.defaultBadge, isV2 && styles.defaultBadgeV2]}>추천</Text>
                  )}
                </View>
                <Text style={[styles.optionHint, isV2 && styles.optionHintV2]}>{option.hint}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={[styles.closeButton, isV2 && styles.closeButtonV2]} onPress={onClose}>
            <Text style={[styles.closeText, isV2 && styles.closeTextV2]}>닫기</Text>
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
    backgroundColor: 'rgba(17,29,48,0.3)',
  },
  overlayV2: {
    backgroundColor: 'rgba(3, 8, 21, 0.64)',
  },
  card: {
    backgroundColor: MODAL_SURFACE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    gap: 14,
  },
  cardV2: {
    backgroundColor: V2_MODAL_SURFACE,
    borderColor: V2_BORDER,
  },
  title: {
    fontSize: TYPE_SCALE.caption,
    fontWeight: '700',
    color: TEXT_SECONDARY,
    lineHeight: 18,
  },
  titleV2: {
    color: V2_TEXT_MUTED,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  subTitle: {
    fontSize: TYPE_SCALE.title,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    lineHeight: 24,
  },
  subTitleV2: {
    color: V2_TEXT_PRIMARY,
  },
  optionsWrap: {
    gap: 12,
    marginTop: 2,
  },
  optionButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 72,
    justifyContent: 'center',
    backgroundColor: MODAL_SURFACE,
    gap: 6,
  },
  optionButtonV2: {
    borderColor: V2_BORDER,
    backgroundColor: 'rgba(13, 27, 51, 0.86)',
  },
  optionButtonDefault: {
    borderColor: ACCENT,
    backgroundColor: MODAL_ACCENT_SURFACE,
  },
  optionButtonDefaultV2: {
    borderColor: V2_ACCENT,
    backgroundColor: V2_ACCENT_SOFT,
  },
  optionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    minHeight: 24,
  },
  optionLabel: {
    color: TEXT_PRIMARY,
    fontSize: TYPE_SCALE.body,
    fontWeight: '700',
    flex: 1,
    lineHeight: 21,
  },
  optionLabelV2: {
    color: V2_TEXT_PRIMARY,
  },
  defaultBadge: {
    fontSize: TYPE_SCALE.caption - 1,
    fontWeight: '700',
    color: ACCENT,
    backgroundColor: '#E6EFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  defaultBadgeV2: {
    color: V2_ACCENT_TEXT,
    backgroundColor: V2_ACCENT,
  },
  optionHint: {
    color: TEXT_SECONDARY,
    fontSize: TYPE_SCALE.caption,
    lineHeight: 19,
  },
  optionHintV2: {
    color: V2_TEXT_SECONDARY,
  },
  closeButton: {
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: BTN_PRIMARY,
    minHeight: 44,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonV2: {
    backgroundColor: V2_ACCENT,
  },
  closeText: {
    color: BTN_PRIMARY_TEXT,
    fontSize: TYPE_SCALE.body,
    fontWeight: '700',
  },
  closeTextV2: {
    color: V2_ACCENT_TEXT,
  },
});
