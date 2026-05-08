import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';

type BadgeTone = 'teal' | 'soft' | 'outline' | 'muted';

type Props = {
  children: React.ReactNode;
  tone?: BadgeTone;
};

export function Badge({ children, tone = 'soft' }: Props) {
  return (
    <View style={[styles.badge, styles[tone]]}>
      <Text style={[styles.text, tone === 'teal' && styles.textOnTeal]} numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    minHeight: 26,
    borderRadius: archiveRadius.full,
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderWidth: 1,
  },
  teal: {
    backgroundColor: archiveColors.primary,
    borderColor: archiveColors.primary,
  },
  soft: {
    backgroundColor: archiveColors.primarySoft,
    borderColor: archiveColors.hairlineSoft,
  },
  outline: {
    backgroundColor: archiveColors.surface,
    borderColor: archiveColors.hairline,
  },
  muted: {
    backgroundColor: archiveColors.surfaceSoft,
    borderColor: archiveColors.hairlineSoft,
  },
  text: {
    color: archiveColors.primary,
    fontSize: 11,
    fontWeight: '800',
    fontFamily: luxuryFonts.sans,
  },
  textOnTeal: {
    color: archiveColors.onPrimary,
  },
});

