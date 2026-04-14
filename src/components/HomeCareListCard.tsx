import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TYPE_CAPTION,
  TYPE_SCALE,
  V2_ACCENT,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
} from '@/src/data/colors';
import { luxuryFonts, luxuryRadii } from '@/src/theme/luxury';

interface HomeCareListCardProps {
  title: string;
  description: string;
  visualLabel: string;
  accent: [string, string];
  disabled?: boolean;
  disabledText?: string;
  onPress: () => void;
}

export function HomeCareListCard({
  title,
  description,
  visualLabel,
  accent,
  disabled = false,
  disabledText,
  onPress,
}: HomeCareListCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.row, disabled && styles.cardDisabled]}
    >
      <LinearGradient
        colors={[`${accent[0]}D0`, `${accent[1]}94`, 'rgba(8, 11, 18, 0.94)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.visual}
      >
        <View style={[styles.visualGlow, { backgroundColor: `${accent[1]}28` }]} />
        <Text style={styles.visualLabel}>{visualLabel}</Text>
      </LinearGradient>

      <View style={styles.copyWrap}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.description} numberOfLines={2}>{description}</Text>
        {disabled && disabledText ? (
          <Text style={styles.disabledText} numberOfLines={2}>{disabledText}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 4,
  },
  cardDisabled: {
    opacity: 0.76,
  },
  visual: {
    width: 84,
    height: 84,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 10,
  },
  visualGlow: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    right: -18,
    top: -10,
  },
  visualLabel: {
    color: '#F6F2EA',
    fontSize: TYPE_CAPTION - 1,
    fontWeight: '800',
    lineHeight: 16,
    letterSpacing: 0.4,
    fontFamily: luxuryFonts.sans,
  },
  copyWrap: {
    flex: 1,
    gap: 5,
    paddingTop: 4,
  },
  title: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.body + 1,
    lineHeight: 22,
    fontFamily: luxuryFonts.display,
  },
  description: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_CAPTION,
    lineHeight: 18,
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
