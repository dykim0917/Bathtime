import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface SteamAnimationProps {
  colorHex: string;
}

function SteamLayer({ delay, colorHex }: { delay: number; colorHex: string }) {
  const rise = useSharedValue(0);

  useEffect(() => {
    rise.value = withRepeat(
      withTiming(1, {
        duration: 3200,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      false
    );
  }, [rise]);

  const style = useAnimatedStyle(() => {
    const translateY = 60 - rise.value * 200;
    const opacity = 0.12 + (1 - rise.value) * 0.28;
    const scale = 0.7 + rise.value * 0.7;
    return {
      transform: [{ translateY }, { scale }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.plume,
        style,
        {
          backgroundColor: colorHex + '55',
          left: `${delay}%`,
        },
      ]}
    />
  );
}

export function SteamAnimation({ colorHex }: SteamAnimationProps) {
  return (
    <View style={styles.root}>
      <View style={styles.fog} />
      <SteamLayer delay={16} colorHex={colorHex} />
      <SteamLayer delay={42} colorHex={colorHex} />
      <SteamLayer delay={68} colorHex={colorHex} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  fog: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.20)',
  },
  plume: {
    position: 'absolute',
    bottom: -48,
    width: 130,
    height: 220,
    borderRadius: 80,
  },
});
