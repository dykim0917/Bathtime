import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TYPE_CAPTION,
  TYPE_SCALE,
  V2_ACCENT,
  V2_ACCENT_SOFT,
  V2_BORDER,
  V2_SURFACE,
  V2_SURFACE_GHOST,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
  V2_WARNING,
} from '@/src/data/colors';
import { luxuryFonts, luxuryRadii } from '@/src/theme/luxury';

interface HomeCarePreviewCardProps {
  title: string;
  subtitle: string;
  emoji: string;
  tint: string;
  fitLabel?: string;
  safetyBadge?: string;
  disabled?: boolean;
  disabledText?: string;
  onPress: () => void;
  width: number;
}

export function HomeCarePreviewCard({
  title,
  subtitle,
  emoji,
  tint,
  fitLabel,
  safetyBadge,
  disabled = false,
  disabledText,
  onPress,
  width,
}: HomeCarePreviewCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.card, disabled && styles.cardDisabled, { width }]}
    >
      <LinearGradient
        colors={[`${tint}26`, `${tint}08`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.visual}
      >
        <View style={[styles.visualGlow, { backgroundColor: `${tint}22` }]} />
        <Text style={styles.visualEmoji}>{emoji}</Text>
      </LinearGradient>

      <View style={styles.content}>
        {(fitLabel || safetyBadge) ? (
          <View style={styles.badgeRow}>
            {fitLabel ? <Text style={styles.fitBadge}>{fitLabel}</Text> : null}
            {safetyBadge ? <Text style={styles.safetyBadge}>{safetyBadge}</Text> : null}
          </View>
        ) : null}
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>
        {disabled && disabledText ? (
          <Text style={styles.disabledText} numberOfLines={2}>{disabledText}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: V2_SURFACE,
    borderWidth: 1,
    borderColor: V2_BORDER,
    borderRadius: luxuryRadii.card,
    overflow: 'hidden',
  },
  cardDisabled: {
    opacity: 0.74,
  },
  visual: {
    height: 126,
    padding: 16,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  visualGlow: {
    position: 'absolute',
    right: -18,
    top: -12,
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  visualEmoji: {
    fontSize: TYPE_CAPTION,
    color: V2_TEXT_PRIMARY,
    fontWeight: '700',
    letterSpacing: 1.2,
    fontVariant: ['tabular-nums'],
    fontFamily: luxuryFonts.mono,
  },
  content: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  fitBadge: {
    fontSize: TYPE_CAPTION - 1,
    lineHeight: 16,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    color: V2_TEXT_PRIMARY,
    backgroundColor: V2_SURFACE_GHOST,
    borderWidth: 1,
    borderColor: V2_BORDER,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  safetyBadge: {
    fontSize: TYPE_CAPTION - 1,
    lineHeight: 16,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    color: V2_WARNING,
    backgroundColor: V2_ACCENT_SOFT,
    borderWidth: 1,
    borderColor: 'rgba(215, 168, 94, 0.3)',
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  title: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.title - 1,
    lineHeight: 23,
    fontFamily: luxuryFonts.display,
  },
  subtitle: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_CAPTION,
    lineHeight: 17,
    fontFamily: luxuryFonts.sans,
  },
  disabledText: {
    color: V2_ACCENT,
    fontSize: TYPE_CAPTION - 1,
    fontWeight: '700',
    lineHeight: 16,
    fontFamily: luxuryFonts.sans,
  },
});
