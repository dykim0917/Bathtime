import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  TEXT_PRIMARY,
  TYPE_BODY,
  TYPE_CAPTION,
  WARNING_COLOR,
  V2_ACCENT,
  V2_ACCENT_SOFT,
  V2_BORDER,
  V2_SURFACE,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
  V2_WARNING,
} from '@/src/data/colors';

interface CategoryCardProps {
  title: string;
  subtitle: string;
  emoji: string;
  bgColor: string;
  eyebrow?: string;
  footerHint?: string;
  fitLabel?: string;
  safetyBadge?: string;
  disabled?: boolean;
  disabledText?: string;
  onPress: () => void;
  width: number;
  minHeight?: number;
  emphasis?: 'default' | 'featured';
  variant?: 'default' | 'v2';
}

export function CategoryCard({
  title,
  subtitle,
  emoji,
  bgColor,
  eyebrow,
  footerHint,
  fitLabel,
  safetyBadge,
  disabled = false,
  disabledText,
  onPress,
  width,
  minHeight = 140,
  emphasis = 'default',
  variant = 'default',
}: CategoryCardProps) {
  const isV2 = variant === 'v2';
  const isFeatured = emphasis === 'featured';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.card,
        isV2 ? styles.cardV2 : { backgroundColor: disabled ? '#E8E8E8' : bgColor },
        isV2 && disabled && styles.cardV2Disabled,
        isV2 && isFeatured && styles.cardV2Featured,
        { width, minHeight },
      ]}
    >
      {isV2 ? <View style={[styles.tintOrb, isFeatured && styles.tintOrbFeatured, { backgroundColor: `${bgColor}28` }]} /> : null}
      {(fitLabel || safetyBadge) ? (
        <View style={styles.badgeRow}>
          {fitLabel ? <Text style={[styles.fitBadge, isV2 && styles.fitBadgeV2]}>{fitLabel}</Text> : null}
          {safetyBadge ? <Text style={[styles.safetyBadge, isV2 && styles.safetyBadgeV2]}>{safetyBadge}</Text> : null}
        </View>
      ) : null}
      <View style={styles.body}>
        {eyebrow ? <Text style={[styles.eyebrow, isV2 && styles.eyebrowV2]}>{eyebrow}</Text> : null}
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[styles.title, disabled && styles.titleDisabled, isV2 && styles.titleV2]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.subtitle, disabled && styles.subtitleDisabled, isV2 && styles.subtitleV2]} numberOfLines={2}>
          {subtitle}
        </Text>
        {footerHint ? (
          <View style={[styles.footerRow, isV2 && styles.footerRowV2]}>
            <Text style={[styles.footerHint, isV2 && styles.footerHintV2]} numberOfLines={1}>
              {footerHint}
            </Text>
            <Text style={[styles.footerArrow, isV2 && styles.footerArrowV2]}>›</Text>
          </View>
        ) : null}
        {disabled && disabledText ? (
          <Text style={[styles.warning, isV2 && styles.warningV2]} numberOfLines={2}>
            {disabledText}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    gap: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  cardV2: {
    backgroundColor: V2_SURFACE,
    borderWidth: 1,
    borderColor: V2_BORDER,
  },
  cardV2Disabled: {
    opacity: 0.76,
  },
  cardV2Featured: {
    backgroundColor: 'rgba(21, 42, 76, 0.94)',
    borderColor: 'rgba(201, 164, 91, 0.28)',
  },
  tintOrb: {
    position: 'absolute',
    top: -24,
    right: -10,
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  tintOrbFeatured: {
    top: -12,
    right: -6,
    width: 134,
    height: 134,
    borderRadius: 67,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 2,
  },
  fitBadge: {
    fontSize: TYPE_CAPTION - 1,
    lineHeight: 16,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    color: '#35517E',
    backgroundColor: 'rgba(255,255,255,0.68)',
    fontWeight: '700',
  },
  fitBadgeV2: {
    color: V2_TEXT_PRIMARY,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: V2_BORDER,
  },
  safetyBadge: {
    fontSize: TYPE_CAPTION - 1,
    lineHeight: 16,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    color: '#7A3D00',
    backgroundColor: 'rgba(255, 239, 222, 0.95)',
    fontWeight: '800',
  },
  safetyBadgeV2: {
    color: V2_WARNING,
    backgroundColor: V2_ACCENT_SOFT,
    borderWidth: 1,
    borderColor: 'rgba(215, 168, 94, 0.32)',
  },
  body: {
    gap: 6,
  },
  eyebrow: {
    fontSize: TYPE_CAPTION - 1,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: '#35517E',
    marginBottom: 2,
  },
  eyebrowV2: {
    color: V2_ACCENT,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  title: {
    fontSize: TYPE_BODY,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    lineHeight: 21,
  },
  titleV2: {
    color: V2_TEXT_PRIMARY,
  },
  titleDisabled: {
    color: '#9A9A9A',
  },
  subtitle: {
    fontSize: TYPE_CAPTION,
    color: 'rgba(42, 62, 100, 0.65)',
    lineHeight: 18,
  },
  subtitleV2: {
    color: V2_TEXT_SECONDARY,
  },
  subtitleDisabled: {
    color: '#ABABAB',
  },
  footerRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerRowV2: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 10,
  },
  footerHint: {
    fontSize: TYPE_CAPTION,
    color: TEXT_PRIMARY,
    fontWeight: '600',
  },
  footerHintV2: {
    color: V2_TEXT_MUTED,
  },
  footerArrow: {
    fontSize: TYPE_BODY + 2,
    color: TEXT_PRIMARY,
    fontWeight: '700',
  },
  footerArrowV2: {
    color: V2_ACCENT,
  },
  warning: {
    marginTop: 2,
    fontSize: TYPE_CAPTION - 1,
    color: WARNING_COLOR,
    fontWeight: '600',
    lineHeight: 16,
  },
  warningV2: {
    color: V2_WARNING,
  },
});
