import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { V2_BG_BOTTOM, V2_BG_TOP } from '@/src/data/colors';

interface GradientBackgroundProps {
  colorHex: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function GradientBackground({
  colorHex,
  children,
  style,
}: GradientBackgroundProps) {
  return (
    <LinearGradient
      colors={[V2_BG_TOP, colorHex + '12', colorHex + '26', V2_BG_BOTTOM]}
      locations={[0, 0.22, 0.72, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
