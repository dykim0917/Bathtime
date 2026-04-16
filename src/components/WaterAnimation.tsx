import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useDerivedValue, useFrameCallback, useSharedValue } from 'react-native-reanimated';

interface WaterAnimationProps {
  /** 0–1; current water fill level (1 = full screen, 0 = empty) */
  fillLevel: number;
  /** Persona colour hex */
  colorHex: string;
}

const { width: W, height: H } = Dimensions.get('window');

// Wave parameters
const WAVE_HEIGHT = 12;
const WAVE_FREQUENCY = 0.012;
const WAVE2_HEIGHT = 8;
const WAVE2_FREQUENCY = 0.018;

function buildWavePath(
  phase: number,
  waveHeight: number,
  freq: number,
  waterY: number,
): string {
  'worklet';
  let d = `M 0 ${waterY}`;
  for (let x = 0; x <= W; x += 4) {
    const y = waterY + Math.sin(freq * x + phase) * waveHeight;
    d += ` L ${x} ${y}`;
  }
  d += ` L ${W} ${H} L 0 ${H} Z`;
  return d;
}

export function WaterAnimation({ fillLevel, colorHex }: WaterAnimationProps) {
  // Manual clock using useFrameCallback
  const clock = useSharedValue(0);
  useFrameCallback((info) => {
    clock.value = info.timeSinceFirstFrame;
  });

  const waterY = H * (1 - fillLevel);

  const path1 = useDerivedValue(() => {
    const phase = (clock.value / 1200) % (Math.PI * 2);
    const d = buildWavePath(phase, WAVE_HEIGHT, WAVE_FREQUENCY, waterY);
    return Skia.Path.MakeFromSVGString(d) ?? Skia.Path.Make();
  });

  const path2 = useDerivedValue(() => {
    const phase = ((clock.value / 900) + Math.PI) % (Math.PI * 2);
    const d = buildWavePath(phase, WAVE2_HEIGHT, WAVE2_FREQUENCY, waterY);
    return Skia.Path.MakeFromSVGString(d) ?? Skia.Path.Make();
  });

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Path path={path1} color={colorHex + '25'} />
      <Path path={path2} color={colorHex + '40'} />
    </Canvas>
  );
}
