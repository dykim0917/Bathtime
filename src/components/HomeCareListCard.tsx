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
import { CustomIcon, CustomIconName } from '@/src/components/CustomIcon';
import { luxuryFonts, luxuryRadii } from '@/src/theme/luxury';

interface MetaChip {
  iconName: CustomIconName;
  label: string;
}

interface HomeCareListCardProps {
  title: string;
  description: string;
  visualLabel: string;
  accent: [string, string];
  metaChips?: MetaChip[];
  disabled?: boolean;
  disabledText?: string;
  onPress: () => void;
}

export function HomeCareListCard({
  title,
  description,
  visualLabel,
  accent,
  metaChips = [],
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
        <View style={styles.copyTop}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.description} numberOfLines={2}>{description}</Text>
        </View>
        <View style={styles.copyBottom}>
          {metaChips.length > 0 ? (
            <View style={styles.metaRow}>
              {metaChips.map((chip) => (
                <View key={`${chip.iconName}-${chip.label}`} style={styles.metaChip}>
                  <CustomIcon name={chip.iconName} size={11} color={V2_ACCENT} fillColor={V2_ACCENT} strokeColor={V2_ACCENT} />
                  <Text style={styles.metaChipText}>{chip.label}</Text>
                </View>
              ))}
            </View>
          ) : null}
          {disabled && disabledText ? (
            <Text style={styles.disabledText} numberOfLines={2}>{disabledText}</Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
    paddingVertical: 4,
  },
  cardDisabled: {
    opacity: 0.76,
  },
  visual: {
    width: 72,
    height: 72,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 8,
  },
  visualGlow: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    right: -16,
    top: -8,
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
    minHeight: 72,
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 2,
  },
  copyTop: {
    gap: 4,
  },
  copyBottom: {
    gap: 6,
  },
  title: {
    color: V2_TEXT_PRIMARY,
    fontSize: 14,
    fontFamily: luxuryFonts.display,
  },
  description: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_CAPTION,
    lineHeight: 18,
    fontFamily: luxuryFonts.sans,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(7, 10, 18, 0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  metaChipText: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_CAPTION - 1,
    fontWeight: '700',
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
