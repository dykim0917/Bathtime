import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { V2_ACCENT } from '@/src/data/colors';

interface HomeHeroBathAnimationProps {
  style?: StyleProp<ViewStyle>;
}

export function HomeHeroBathAnimation({ style }: HomeHeroBathAnimationProps) {
  const steam = useRef(new Animated.Value(0)).current;
  const water = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const steamLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(steam, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(steam, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    const waterLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(water, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(water, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    steamLoop.start();
    waterLoop.start();

    return () => {
      steamLoop.stop();
      waterLoop.stop();
    };
  }, [steam, water]);

  const steamTranslateY = steam.interpolate({
    inputRange: [0, 1],
    outputRange: [12, -12],
  });
  const steamOpacity = steam.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.22, 0.52, 0.22],
  });
  const waterScale = water.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1.04],
  });

  return (
    <View pointerEvents="none" style={[styles.root, style]}>
      <Animated.View
        style={[
          styles.steam,
          styles.steamLeft,
          { opacity: steamOpacity, transform: [{ translateY: steamTranslateY }] },
        ]}
      />
      <Animated.View
        style={[
          styles.steam,
          styles.steamCenter,
          { opacity: steamOpacity, transform: [{ translateY: steamTranslateY }] },
        ]}
      />
      <Animated.View
        style={[
          styles.steam,
          styles.steamRight,
          { opacity: steamOpacity, transform: [{ translateY: steamTranslateY }] },
        ]}
      />
      <View style={styles.tub}>
        <Animated.View style={[styles.water, { transform: [{ scaleX: waterScale }] }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  steam: {
    position: 'absolute',
    top: 22,
    width: 18,
    height: 70,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.34)',
  },
  steamLeft: {
    left: '30%',
    transform: [{ rotate: '-10deg' }],
  },
  steamCenter: {
    left: '47%',
  },
  steamRight: {
    right: '30%',
    transform: [{ rotate: '10deg' }],
  },
  tub: {
    width: 164,
    height: 66,
    marginTop: 38,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: 'rgba(245, 240, 232, 0.58)',
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  water: {
    width: '110%',
    height: 32,
    marginLeft: '-5%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: `${V2_ACCENT}88`,
  },
});
