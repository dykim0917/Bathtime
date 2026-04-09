import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import {
  V2_ACCENT,
  V2_ACCENT_SOFT,
  V2_BORDER,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
} from '@/src/data/colors';
import { luxuryFonts } from '@/src/theme/luxury';

interface TagChipProps {
  label: string;
  selected: boolean;
  accentColor?: string;
  onPress: () => void;
}

export function TagChip({
  label,
  selected,
  accentColor = V2_ACCENT,
  onPress,
}: TagChipProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.chip,
        selected && {
          backgroundColor: V2_ACCENT_SOFT,
          borderColor: accentColor,
        },
      ]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: V2_BORDER,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginRight: 8,
    marginBottom: 10,
    gap: 4,
  },
  label: {
    fontSize: 14,
    color: V2_TEXT_SECONDARY,
    fontWeight: '500',
    fontFamily: luxuryFonts.sans,
  },
  labelSelected: {
    color: V2_TEXT_PRIMARY,
    fontWeight: '600',
  },
});
