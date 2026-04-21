import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface WaterAnimationProps {
  fillLevel: number;
  colorHex: string;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const WAVE_HEIGHT = 132;

function withAlpha(hex: string, alpha: string): string {
  const normalized = hex.startsWith('#') ? hex.slice(1) : hex;
  return `#${normalized}${alpha}`;
}

export function WaterAnimation({ fillLevel, colorHex }: WaterAnimationProps) {
  const animatedFillLevel = useSharedValue(fillLevel);

  useEffect(() => {
    animatedFillLevel.value = withTiming(fillLevel, { duration: 520 });
  }, [animatedFillLevel, fillLevel]);

  const fillStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY:
          SCREEN_HEIGHT * (1 - animatedFillLevel.value) - WAVE_HEIGHT,
      },
    ],
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.waterLayer, fillStyle]}>
        <View style={styles.waveShell}>
          <LottieView
            autoPlay
            loop
            source={require('../../assets/lottie/water-footer.json')}
            resizeMode="cover"
            style={styles.waveBack}
          />
          <LottieView
            autoPlay
            loop
            source={require('../../assets/lottie/water-footer.json')}
            resizeMode="cover"
            style={styles.waveFront}
          />
        </View>

        <LinearGradient
          colors={[
            withAlpha(colorHex, '30'),
            withAlpha(colorHex, '4A'),
            withAlpha(colorHex, '66'),
          ]}
          style={styles.waterBody}
        />
        <LinearGradient
          colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0)']}
          style={styles.surfaceGlow}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  waterLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: SCREEN_HEIGHT + WAVE_HEIGHT,
  },
  waveShell: {
    height: WAVE_HEIGHT,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  waveBack: {
    position: 'absolute',
    left: '-12%',
    bottom: -8,
    width: '124%',
    height: WAVE_HEIGHT,
    opacity: 0.28,
  },
  waveFront: {
    position: 'absolute',
    left: '-8%',
    bottom: -2,
    width: '116%',
    height: WAVE_HEIGHT,
    opacity: 0.62,
  },
  waterBody: {
    flex: 1,
  },
  surfaceGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: WAVE_HEIGHT - 16,
    height: 90,
  },
});
