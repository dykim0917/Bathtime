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
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
  V2_WARNING,
} from '@/src/data/colors';
import { luxuryFonts, luxuryRadii, luxuryTracking } from '@/src/theme/luxury';

interface HomeCareHeroCardProps {
  badge: string;
  eyebrow: string;
  title: string;
  description: string;
  visualLabel: string;
  metaChips: string[];
  accent: [string, string];
  fitLabel?: string;
  safetyBadge?: string;
  disabled?: boolean;
  disabledText?: string;
  onPress: () => void;
}

export function HomeCareHeroCard({
  badge,
  eyebrow,
  title,
  description,
  visualLabel,
  metaChips,
  accent,
  fitLabel,
  safetyBadge,
  disabled = false,
  disabledText,
  onPress,
}: HomeCareHeroCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.container, disabled && styles.cardDisabled]}
    >
      <View style={styles.badgeRow}>
        <Text style={styles.heroBadge}>{badge}</Text>
        {fitLabel ? <Text style={styles.fitBadge}>{fitLabel}</Text> : null}
        {safetyBadge ? <Text style={styles.safetyBadge}>{safetyBadge}</Text> : null}
      </View>

      <LinearGradient
        colors={[`${accent[0]}D9`, `${accent[1]}A6`, 'rgba(8, 11, 18, 0.96)']}
        start={{ x: 0.08, y: 0.08 }}
        end={{ x: 1, y: 1 }}
        style={styles.visualStage}
      >
        <View style={[styles.visualGlowLarge, { backgroundColor: `${accent[1]}30` }]} />
        <View style={[styles.visualGlowSmall, { backgroundColor: `${accent[0]}22` }]} />
        <View style={styles.visualScrim} />
        <View style={styles.visualLabelWrap}>
          <Text style={styles.visualLabel}>{visualLabel}</Text>
        </View>
      </LinearGradient>

      <View style={styles.copyBlock}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.metaRow}>
          {metaChips.map((chip) => (
            <View key={chip} style={styles.metaChip}>
              <Text style={styles.metaChipText}>{chip}</Text>
            </View>
          ))}
        </View>
        {disabled && disabledText ? (
          <Text style={styles.disabledText}>{disabledText}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  cardDisabled: {
    opacity: 0.76,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  heroBadge: {
    color: V2_ACCENT,
    fontSize: TYPE_CAPTION - 1,
    fontWeight: '800',
    letterSpacing: luxuryTracking.eyebrow,
    fontFamily: luxuryFonts.sans,
  },
  fitBadge: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_CAPTION - 1,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    fontFamily: luxuryFonts.sans,
  },
  safetyBadge: {
    color: V2_WARNING,
    fontSize: TYPE_CAPTION - 1,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: V2_ACCENT_SOFT,
    fontFamily: luxuryFonts.sans,
  },
  visualStage: {
    minHeight: 212,
    borderRadius: luxuryRadii.card,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 18,
  },
  visualGlowLarge: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    top: -36,
    right: -18,
  },
  visualGlowSmall: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 66,
    left: -12,
    bottom: 18,
  },
  visualScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 6, 12, 0.36)',
  },
  visualLabelWrap: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(12, 16, 26, 0.42)',
  },
  visualLabel: {
    color: '#F7F2EA',
    fontSize: TYPE_CAPTION - 1,
    fontWeight: '700',
    letterSpacing: 0.6,
    fontFamily: luxuryFonts.sans,
  },
  copyBlock: {
    gap: 7,
  },
  eyebrow: {
    color: V2_ACCENT,
    fontSize: TYPE_CAPTION,
    fontWeight: '700',
    letterSpacing: 0.3,
    fontFamily: luxuryFonts.sans,
  },
  title: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.headingMd,
    lineHeight: 34,
    fontFamily: luxuryFonts.display,
  },
  description: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_SCALE.body,
    lineHeight: 22,
    fontFamily: luxuryFonts.sans,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  metaChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  metaChipText: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_CAPTION,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  disabledText: {
    marginTop: 2,
    color: V2_TEXT_MUTED,
    fontSize: TYPE_CAPTION,
    lineHeight: 18,
    fontFamily: luxuryFonts.sans,
  },
});
