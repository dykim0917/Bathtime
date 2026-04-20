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
const BACK_WAVE_HEIGHT = 16;
const BACK_WAVE_FREQUENCY = 0.009;
const MID_WAVE_HEIGHT = 22;
const MID_WAVE_FREQUENCY = 0.013;
const FRONT_WAVE_HEIGHT = 14;
const FRONT_WAVE_FREQUENCY = 0.022;
const RIPPLE_HEIGHT = 5;
const RIPPLE_FREQUENCY = 0.05;
const SURFACE_BAND_DEPTH = 18;
const BUBBLE_SPECS = [
  { xRatio: 0.18, radius: 5, duration: 3600, offset: 0.12, drift: 8, driftSpeed: 820 },
  { xRatio: 0.36, radius: 3.5, duration: 2700, offset: 0.42, drift: 5, driftSpeed: 640 },
  { xRatio: 0.52, radius: 6, duration: 4200, offset: 0.18, drift: 10, driftSpeed: 970 },
  { xRatio: 0.7, radius: 4.5, duration: 3100, offset: 0.66, drift: 7, driftSpeed: 760 },
  { xRatio: 0.84, radius: 3, duration: 2500, offset: 0.3, drift: 4, driftSpeed: 580 },
] as const;

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

function buildSurfaceBandPath(
  topPhase: number,
  bottomPhase: number,
  topWaveHeight: number,
  bottomWaveHeight: number,
  topFreq: number,
  bottomFreq: number,
  topY: number,
  bottomY: number,
): string {
  'worklet';
  let d = `M 0 ${topY + Math.sin(topPhase) * topWaveHeight}`;
  for (let x = 0; x <= W; x += 4) {
    const y = topY + Math.sin(topFreq * x + topPhase) * topWaveHeight;
    d += ` L ${x} ${y}`;
  }
  for (let x = W; x >= 0; x -= 4) {
    const y = bottomY + Math.sin(bottomFreq * x + bottomPhase) * bottomWaveHeight;
    d += ` L ${x} ${y}`;
  }
  d += ' Z';
  return d;
}

function buildBubblePath(time: number, waterY: number, fillLevel: number) {
  'worklet';
  const path = Skia.Path.Make();
  if (fillLevel <= 0.12) {
    return path;
  }

  const topLimit = waterY + 26;
  const travelHeight = Math.max(120, H - topLimit + 48);

  for (const spec of BUBBLE_SPECS) {
    const t = ((time / spec.duration) + spec.offset) % 1;
    const y = H + spec.radius * 3 - t * travelHeight;
    if (y <= topLimit || y >= H - 4) continue;

    const drift = Math.sin(time / spec.driftSpeed + spec.offset * Math.PI * 2) * spec.drift;
    path.addCircle(W * spec.xRatio + drift, y, spec.radius);
  }

  return path;
}

export function WaterAnimation({ fillLevel, colorHex }: WaterAnimationProps) {
  // Manual clock using useFrameCallback
  const clock = useSharedValue(0);
  useFrameCallback((info) => {
    clock.value = info.timeSinceFirstFrame;
  });

  const waterY = H * (1 - fillLevel);

  const backPath = useDerivedValue(() => {
    const phase = (clock.value / 1900) % (Math.PI * 2);
    const swell = Math.sin(clock.value / 2100) * 4;
    const d = buildWavePath(phase, BACK_WAVE_HEIGHT, BACK_WAVE_FREQUENCY, waterY + 14 + swell);
    return Skia.Path.MakeFromSVGString(d) ?? Skia.Path.Make();
  });

  const midPath = useDerivedValue(() => {
    const phase = ((clock.value / 1350) + Math.PI / 3) % (Math.PI * 2);
    const sway = Math.sin(clock.value / 1600) * 3.5;
    const d = buildWavePath(phase, MID_WAVE_HEIGHT, MID_WAVE_FREQUENCY, waterY + 6 + sway);
    return Skia.Path.MakeFromSVGString(d) ?? Skia.Path.Make();
  });

  const frontPath = useDerivedValue(() => {
    const phase = ((clock.value / 920) + Math.PI) % (Math.PI * 2);
    const ripples = Math.sin(clock.value / 980) * 2.5;
    const d = buildWavePath(phase, FRONT_WAVE_HEIGHT, FRONT_WAVE_FREQUENCY, waterY - 2 + ripples);
    return Skia.Path.MakeFromSVGString(d) ?? Skia.Path.Make();
  });

  const ripplePath = useDerivedValue(() => {
    const phase = ((clock.value / 520) + Math.PI / 4) % (Math.PI * 2);
    const d = buildWavePath(phase, RIPPLE_HEIGHT, RIPPLE_FREQUENCY, waterY + 2);
    return Skia.Path.MakeFromSVGString(d) ?? Skia.Path.Make();
  });

  const surfaceBandPath = useDerivedValue(() => {
    const topPhase = ((clock.value / 1000) + Math.PI / 2) % (Math.PI * 2);
    const bottomPhase = ((clock.value / 1260) + Math.PI) % (Math.PI * 2);
    const d = buildSurfaceBandPath(
      topPhase,
      bottomPhase,
      6,
      9,
      0.028,
      0.018,
      waterY - 7,
      waterY + SURFACE_BAND_DEPTH,
    );
    return Skia.Path.MakeFromSVGString(d) ?? Skia.Path.Make();
  });

  const bubblePath = useDerivedValue(() => buildBubblePath(clock.value, waterY, fillLevel));

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Path path={backPath} color={colorHex + '1C'} />
      <Path path={midPath} color={colorHex + '34'} />
      <Path path={frontPath} color={colorHex + '5A'} />
      <Path path={ripplePath} color="rgba(255,255,255,0.10)" />
      <Path path={surfaceBandPath} color="rgba(255,255,255,0.16)" />
      <Path path={bubblePath} color="rgba(255,255,255,0.18)" />
    </Canvas>
  );
}
