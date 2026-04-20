import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SubProtocolOption } from '@/src/engine/types';
import {
  TYPE_SCALE,
  V2_ACCENT,
  V2_ACCENT_SOFT,
  V2_ACCENT_TEXT,
  V2_BORDER,
  V2_BG_OVERLAY,
  V2_MODAL_SURFACE,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
} from '@/src/data/colors';
import { luxuryFonts, luxuryRadii, luxuryTracking } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';
import { AnimatedModalShell } from '@/src/components/AnimatedModalShell';

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
    <AnimatedModalShell
      visible={visible}
      onClose={onClose}
      layoutStyle={styles.overlay}
      backdropStyle={[styles.backdrop, isV2 && styles.backdropV2]}
    >
      {(requestClose) => (
        <View style={styles.card}>
          <View style={styles.handle} />
          <Text style={[styles.title, isV2 && styles.titleV2]}>{heading}</Text>
          <Text style={styles.subTitle}>{title}</Text>

          <View style={styles.optionsWrap}>
            {options.map((option) => (
              <Pressable
                key={option.id}
                style={[
                  styles.optionButton,
                  option.is_default && styles.optionButtonDefault,
                  isV2 && styles.optionButtonV2,
                ]}
                onPress={() => onSelect(option)}
              >
                <View style={styles.optionLabelRow}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  {option.is_default && (
                    <Text style={styles.defaultBadge}>추천</Text>
                  )}
                </View>
                <Text style={styles.optionHint}>{option.hint}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.closeButton} onPress={requestClose}>
            <Text style={styles.closeText}>닫기</Text>
          </Pressable>
        </View>
      )}
    </AnimatedModalShell>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: 48,
  },
  backdrop: {
    backgroundColor: V2_BG_OVERLAY,
  },
  backdropV2: {
    backgroundColor: 'rgba(3, 8, 21, 0.64)',
  },
  card: {
    backgroundColor: V2_MODAL_SURFACE,
    borderTopLeftRadius: luxuryRadii.cardLg,
    borderTopRightRadius: luxuryRadii.cardLg,
    borderWidth: 1,
    borderColor: V2_BORDER,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    gap: 14,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(245,240,232,0.28)',
    marginBottom: 2,
  },
  title: {
    fontSize: TYPE_SCALE.caption,
    fontWeight: '700',
    color: V2_TEXT_MUTED,
    lineHeight: 18,
    fontFamily: luxuryFonts.sans,
  },
  titleV2: {
    letterSpacing: luxuryTracking.label,
    textTransform: 'uppercase',
  },
  subTitle: {
    fontSize: TYPE_SCALE.title,
    color: V2_TEXT_PRIMARY,
    lineHeight: 24,
    fontFamily: luxuryFonts.display,
  },
  optionsWrap: {
    gap: 12,
    marginTop: 2,
  },
  optionButton: {
    borderRadius: luxuryRadii.card,
    borderWidth: 1,
    borderColor: V2_BORDER,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 72,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    gap: 6,
  },
  optionButtonV2: {
    backgroundColor: 'rgba(13, 27, 51, 0.86)',
  },
  optionButtonDefault: {
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
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.body,
    fontWeight: '700',
    flex: 1,
    lineHeight: 21,
    fontFamily: luxuryFonts.display,
  },
  defaultBadge: {
    fontSize: TYPE_SCALE.caption - 1,
    fontWeight: '700',
    color: V2_ACCENT_TEXT,
    backgroundColor: V2_ACCENT,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: 'hidden',
    fontFamily: luxuryFonts.sans,
  },
  optionHint: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_SCALE.caption,
    lineHeight: 19,
    fontFamily: luxuryFonts.sans,
  },
  closeButton: {
    marginTop: 14,
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
