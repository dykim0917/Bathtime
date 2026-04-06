import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

interface WaterAnimationProps {
  /** 0–1; how full the water is (1 = full screen, 0 = empty) */
  progress: number;
  /** Persona colour hex */
  colorHex: string;
}

const { height: H } = Dimensions.get('window');

/**
 * Web fallback for WaterAnimation.
 * Uses simple View layers instead of Skia Canvas (which requires CanvasKit WASM on web).
 * Two overlapping colored rectangles that shrink as progress drains from 1 → 0.
 */
export function WaterAnimation({ progress, colorHex }: WaterAnimationProps) {
  const waterHeight = H * progress;

  return (
    <View style={styles.root}>
      {/* Back layer — lighter */}
      <View
        style={[
          styles.water,
          {
            height: waterHeight,
            backgroundColor: colorHex + '25',
          },
        ]}
      />
      {/* Front layer — slightly darker, offset for depth */}
      <View
        style={[
          styles.water,
          {
            height: waterHeight * 0.92,
            backgroundColor: colorHex + '40',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  water: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
