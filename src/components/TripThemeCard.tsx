import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CARD_BORDER,
  TEXT_PRIMARY,
  TYPE_CAPTION,
  V2_ACCENT,
  V2_ACCENT_SOFT,
  V2_BORDER,
  V2_TEXT_PRIMARY,
  V2_WARNING,
} from '@/src/data/colors';

interface TripThemeCardProps {
  intentId: string;
  title: string;
  subtitle: string;
  fitLabel?: string;
  safetyBadge?: string;
  disabled?: boolean;
  disabledText?: string;
  onPress: () => void;
  width: number;
  minHeight?: number;
  variant?: 'default' | 'v2';
}

const TRIP_VISUALS: Record<string, { gradient: [string, string]; bloom: string }> = {
  kyoto_forest: { gradient: ['#4D7C68', '#7DAF93'], bloom: 'rgba(205, 238, 214, 0.34)' },
  nordic_sauna: { gradient: ['#8A6A4A', '#C9A26D'], bloom: 'rgba(255, 228, 190, 0.3)' },
  rainy_camping: { gradient: ['#3E5E80', '#6F94B4'], bloom: 'rgba(203, 226, 244, 0.28)' },
  snow_cabin: { gradient: ['#53667C', '#8CA1B7'], bloom: 'rgba(226, 237, 247, 0.3)' },
};

const TRIP_VISUALS_V2: Record<string, { gradient: [string, string]; bloom: string }> = {
  kyoto_forest: { gradient: ['#102C26', '#285243'], bloom: 'rgba(119, 185, 146, 0.24)' },
  nordic_sauna: { gradient: ['#33251A', '#6C4C2D'], bloom: 'rgba(201, 164, 91, 0.24)' },
  rainy_camping: { gradient: ['#0F2336', '#234B68'], bloom: 'rgba(100, 153, 189, 0.22)' },
  snow_cabin: { gradient: ['#122033', '#314A65'], bloom: 'rgba(181, 203, 229, 0.18)' },
};

export function TripThemeCard({
  intentId,
  title,
  subtitle,
  fitLabel,
  safetyBadge,
  disabled = false,
  disabledText,
  onPress,
  width,
  minHeight = 148,
  variant = 'default',
}: TripThemeCardProps) {
  const isV2 = variant === 'v2';
  const visual = (isV2 ? TRIP_VISUALS_V2 : TRIP_VISUALS)[intentId] ?? (isV2 ? TRIP_VISUALS_V2.kyoto_forest : TRIP_VISUALS.kyoto_forest);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.card, isV2 && styles.cardV2, { width, minHeight }]}
    >
      <LinearGradient colors={visual.gradient} style={StyleSheet.absoluteFillObject} />
      <View style={[styles.bloom, { backgroundColor: visual.bloom }]} />
      <View style={[styles.bloomSmall, { backgroundColor: visual.bloom }]} />
      <View style={[styles.scrim, isV2 && styles.scrimV2]} />

      <View style={styles.content}>
        {(fitLabel || safetyBadge) ? (
          <View style={styles.badgeRow}>
            {fitLabel ? <Text style={[styles.fitBadge, isV2 && styles.fitBadgeV2]}>{fitLabel}</Text> : null}
            {safetyBadge ? <Text style={[styles.safetyBadge, isV2 && styles.safetyBadgeV2]}>{safetyBadge}</Text> : null}
          </View>
        ) : null}
        <Text style={[styles.title, disabled && styles.titleDisabled, isV2 && styles.titleV2]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.subtitle, disabled && styles.subtitleDisabled, isV2 && styles.subtitleV2]} numberOfLines={2}>
          {subtitle}
        </Text>
        {disabled && disabledText ? (
          <Text style={[styles.disabledText, isV2 && styles.disabledTextV2]} numberOfLines={2}>
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
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: CARD_BORDER,
    justifyContent: 'flex-end',
  },
  cardV2: {
    borderColor: V2_BORDER,
  },
  bloom: {
    position: 'absolute',
    top: -26,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  bloomSmall: {
    position: 'absolute',
    bottom: 16,
    left: -16,
    width: 74,
    height: 74,
    borderRadius: 37,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 20, 36, 0.18)',
  },
  scrimV2: {
    backgroundColor: 'rgba(4, 9, 23, 0.28)',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 5,
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
    color: '#F2F7FF',
    backgroundColor: 'rgba(15, 31, 53, 0.4)',
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
    color: '#3B2000',
    backgroundColor: 'rgba(255, 226, 191, 0.95)',
    fontWeight: '800',
  },
  safetyBadgeV2: {
    color: V2_WARNING,
    backgroundColor: V2_ACCENT_SOFT,
    borderWidth: 1,
    borderColor: 'rgba(215, 168, 94, 0.3)',
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    lineHeight: 20,
  },
  titleV2: {
    color: V2_TEXT_PRIMARY,
  },
  titleDisabled: {
    color: '#E5E7EB',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    lineHeight: 18,
  },
  subtitleV2: {
    color: 'rgba(238, 243, 255, 0.8)',
  },
  subtitleDisabled: {
    color: '#D1D5DB',
  },
  disabledText: {
    marginTop: 1,
    color: '#FEE2E2',
    fontWeight: '700',
    fontSize: TYPE_CAPTION,
    lineHeight: 16,
  },
  disabledTextV2: {
    color: V2_ACCENT,
  },
});
