import React from 'react';
import { StyleSheet, View } from 'react-native';

interface SteamAnimationProps {
  colorHex: string;
}

function SteamPlume({ left, colorHex }: { left: number; colorHex: string }) {
  return (
    <View
      style={[
        styles.plume,
        {
          left,
          backgroundColor: `${colorHex}33`,
        },
      ]}
    />
  );
}

export function SteamAnimation({ colorHex }: SteamAnimationProps) {
  return (
    <View style={[styles.root, styles.nonInteractive]}>
      <View style={styles.fog} />
      <SteamPlume left={18} colorHex={colorHex} />
      <SteamPlume left={108} colorHex={colorHex} />
      <SteamPlume left={198} colorHex={colorHex} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  nonInteractive: {
    pointerEvents: 'none',
  },
  fog: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  plume: {
    position: 'absolute',
    bottom: -36,
    width: 120,
    height: 180,
    borderRadius: 999,
    opacity: 0.7,
  },
});
