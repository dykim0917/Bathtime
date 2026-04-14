import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import {
  TYPE_SCALE,
  V2_ACCENT,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
} from '@/src/data/colors';
import { luxuryFonts, luxuryTracking } from '@/src/theme/luxury';

interface OpenTabHeaderProps {
  title: string;
  subtitle: string;
  eyebrow?: string;
  topSlot?: ReactNode;
  mediaSlot?: ReactNode;
  footerSlot?: ReactNode;
  style?: StyleProp<ViewStyle>;
  centered?: boolean;
}

export function OpenTabHeader({
  title,
  subtitle,
  eyebrow,
  topSlot,
  mediaSlot,
  footerSlot,
  style,
  centered = false,
}: OpenTabHeaderProps) {
  return (
    <View style={[styles.container, centered && styles.containerCentered, style]}>
      {topSlot ? <View style={[styles.topSlot, centered && styles.slotCentered]}>{topSlot}</View> : null}
      {mediaSlot ? <View style={[styles.mediaSlot, centered && styles.slotCentered]}>{mediaSlot}</View> : null}
      {eyebrow ? <Text style={[styles.eyebrow, centered && styles.textCentered]}>{eyebrow}</Text> : null}
      <Text style={[styles.title, centered && styles.textCentered]}>{title}</Text>
      <Text style={[styles.subtitle, centered && styles.textCentered]}>{subtitle}</Text>
      {footerSlot ? <View style={[styles.footerSlot, centered && styles.slotCentered]}>{footerSlot}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  containerCentered: {
    alignItems: 'center',
  },
  topSlot: {
    marginBottom: 2,
  },
  mediaSlot: {
    marginTop: 6,
    marginBottom: 4,
  },
  slotCentered: {
    alignItems: 'center',
  },
  eyebrow: {
    fontSize: TYPE_SCALE.caption - 1,
    fontWeight: '700',
    color: V2_ACCENT,
    letterSpacing: luxuryTracking.eyebrow,
    fontFamily: luxuryFonts.sans,
  },
  title: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.headingLg,
    lineHeight: 38,
    fontFamily: luxuryFonts.display,
  },
  subtitle: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_SCALE.body + 1,
    lineHeight: 23,
    fontFamily: luxuryFonts.sans,
  },
  footerSlot: {
    marginTop: 2,
  },
  textCentered: {
    textAlign: 'center',
  },
});
