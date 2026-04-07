import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TYPE_CAPTION,
  TYPE_SCALE,
  V2_ACCENT,
  V2_ACCENT_SOFT,
  V2_BORDER,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
  V2_WARNING,
} from '@/src/data/colors';
import { luxuryFonts, luxuryRadii } from '@/src/theme/luxury';

interface HomeTripEditorialCardProps {
  title: string;
  subtitle: string;
  destination: string;
  accent: [string, string];
  fitLabel?: string;
  safetyBadge?: string;
  disabled?: boolean;
  disabledText?: string;
  onPress: () => void;
  width?: number;
}

export function HomeTripEditorialCard({
  title,
  subtitle,
  destination,
  accent,
  fitLabel,
  safetyBadge,
  disabled = false,
  disabledText,
  onPress,
  width = 228,
}: HomeTripEditorialCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.card, disabled && styles.cardDisabled, { width }]}
    >
      <LinearGradient
        colors={accent}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.imageArea}
      >
        <View style={styles.imageScrim} />
        <View style={styles.imageTopRow}>
          <Text style={styles.destination}>{destination}</Text>
          {fitLabel ? <Text style={styles.fitBadge}>{fitLabel}</Text> : null}
        </View>
        <View style={styles.imageBottom}>
          <Text style={styles.imageTitle} numberOfLines={2}>{title}</Text>
          <Text style={styles.imageSubtitle} numberOfLines={1}>{subtitle}</Text>
        </View>
      </LinearGradient>

      <View style={styles.footer}>
        <View style={styles.footerMeta}>
          <Text style={styles.footerLabel}>TRIP ROUTINE</Text>
          {safetyBadge ? <Text style={styles.safetyBadge}>{safetyBadge}</Text> : null}
        </View>
        {disabled && disabledText ? (
          <Text style={styles.disabledText} numberOfLines={2}>{disabledText}</Text>
        ) : (
          <Text style={styles.footerText}>무드에 맞는 디테일을 확인해보세요</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: luxuryRadii.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: V2_BORDER,
    backgroundColor: 'rgba(13, 25, 49, 0.94)',
  },
  cardDisabled: {
    opacity: 0.76,
  },
  imageArea: {
    height: 210,
    justifyContent: 'space-between',
    padding: 16,
  },
  imageScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 10, 24, 0.24)',
  },
  imageTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  destination: {
    color: '#F3F6FF',
    fontSize: TYPE_CAPTION - 1,
    fontWeight: '800',
    letterSpacing: 1.2,
    fontFamily: luxuryFonts.sans,
  },
  fitBadge: {
    color: '#F3F6FF',
    fontSize: TYPE_CAPTION - 1,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    fontFamily: luxuryFonts.sans,
  },
  imageBottom: {
    gap: 4,
  },
  imageTitle: {
    color: '#FFFFFF',
    fontSize: TYPE_SCALE.title + 2,
    lineHeight: 24,
    fontFamily: luxuryFonts.display,
  },
  imageSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: TYPE_CAPTION,
    lineHeight: 16,
    fontFamily: luxuryFonts.sans,
  },
  footer: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
    backgroundColor: 'rgba(12, 23, 45, 0.96)',
  },
  footerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  footerLabel: {
    color: V2_ACCENT,
    fontSize: TYPE_CAPTION - 1,
    fontWeight: '800',
    letterSpacing: 1,
    fontFamily: luxuryFonts.sans,
  },
  safetyBadge: {
    color: V2_WARNING,
    fontSize: TYPE_CAPTION - 1,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: V2_ACCENT_SOFT,
    fontFamily: luxuryFonts.sans,
  },
  footerText: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_CAPTION,
    lineHeight: 17,
    fontFamily: luxuryFonts.sans,
  },
  disabledText: {
    color: V2_TEXT_MUTED,
    fontSize: TYPE_CAPTION,
    lineHeight: 17,
    fontFamily: luxuryFonts.sans,
  },
});
