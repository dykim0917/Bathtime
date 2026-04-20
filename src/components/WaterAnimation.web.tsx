import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';

interface WaterAnimationProps {
  fillLevel: number;
  colorHex: string;
}

const { width: W, height: H } = Dimensions.get('window');

const BUBBLE_SPECS = [
  { left: '14%' as const, size: 10, duration: 3200, delay: 0 },
  { left: '29%' as const, size: 6, duration: 2500, delay: 380 },
  { left: '46%' as const, size: 12, duration: 3900, delay: 180 },
  { left: '63%' as const, size: 8, duration: 2800, delay: 620 },
  { left: '79%' as const, size: 5, duration: 2300, delay: 440 },
] as const;

export function WaterAnimation({ fillLevel, colorHex }: WaterAnimationProps) {
  const waterHeight = H * fillLevel;
  const frontWaveX = useRef(new Animated.Value(0)).current;
  const midWaveX = useRef(new Animated.Value(0)).current;
  const backWaveX = useRef(new Animated.Value(0)).current;
  const surfaceBob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const frontLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(frontWaveX, {
          toValue: -34,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(frontWaveX, {
          toValue: 34,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    const midLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(midWaveX, {
          toValue: 28,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(midWaveX, {
          toValue: -28,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    const backLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(backWaveX, {
          toValue: -22,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(backWaveX, {
          toValue: 22,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(surfaceBob, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(surfaceBob, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    frontLoop.start();
    midLoop.start();
    backLoop.start();
    bobLoop.start();

    return () => {
      frontLoop.stop();
      midLoop.stop();
      backLoop.stop();
      bobLoop.stop();
    };
  }, [backWaveX, frontWaveX, midWaveX, surfaceBob]);

  const bobTranslateY = surfaceBob.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  return (
    <View style={[styles.root, styles.nonInteractive]}>
      {waterHeight > 0 ? (
        <View style={[styles.waterMask, { height: waterHeight }]}>
          <Animated.View
            style={[
              styles.waveLayer,
              styles.backLayer,
              {
                backgroundColor: `${colorHex}22`,
                transform: [{ translateX: backWaveX }, { translateY: bobTranslateY }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.waveLayer,
              styles.midLayer,
              {
                backgroundColor: `${colorHex}38`,
                transform: [{ translateX: midWaveX }, { translateY: bobTranslateY }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.waveLayer,
              styles.frontLayer,
              {
                backgroundColor: `${colorHex}5C`,
                transform: [{ translateX: frontWaveX }, { translateY: bobTranslateY }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.highlightBand,
              {
                transform: [{ translateX: frontWaveX }, { translateY: bobTranslateY }],
              },
            ]}
          />
          {BUBBLE_SPECS.map((bubble) => (
            <Bubble
              key={`${bubble.left}-${bubble.size}`}
              left={bubble.left}
              size={bubble.size}
              duration={bubble.duration}
              delay={bubble.delay}
              waterHeight={waterHeight}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function Bubble({
  left,
  size,
  duration,
  delay,
  waterHeight,
}: {
  left: `${number}%`;
  size: number;
  duration: number;
  delay: number;
  waterHeight: number;
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    progress.setValue(0);
    loop.start();
    return () => loop.stop();
  }, [delay, duration, progress]);

  const riseDistance = Math.max(56, waterHeight - 44);
  const opacity = progress.interpolate({
    inputRange: [0, 0.15, 0.82, 1],
    outputRange: [0, 0.24, 0.18, 0],
  });
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -riseDistance],
  });
  const translateX = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 8, -5],
  });
  const scale = progress.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.84, 1, 1.08],
  });

  if (waterHeight <= 90) return null;

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          left,
          width: size,
          height: size,
          borderRadius: size / 2,
          bottom: 12,
          opacity,
          transform: [{ translateY }, { translateX }, { scale }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
  },
  nonInteractive: {
    pointerEvents: 'none',
  },
  waterMask: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  waveLayer: {
    position: 'absolute',
    left: -80,
    width: W + 160,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },
  backLayer: {
    bottom: -18,
    height: H * 0.82,
  },
  midLayer: {
    bottom: -26,
    height: H * 0.76,
  },
  frontLayer: {
    bottom: -32,
    height: H * 0.72,
  },
  highlightBand: {
    position: 'absolute',
    left: -40,
    right: -40,
    top: 0,
    height: 18,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
});
