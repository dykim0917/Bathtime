import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';

interface HomeHeroBathAnimationProps {
  style?: StyleProp<ViewStyle>;
}

export function HomeHeroBathAnimation({ style }: HomeHeroBathAnimationProps) {
  return (
    <LottieView
      autoPlay
      loop
      source={require('../../assets/lottie/bath.json')}
      resizeMode="contain"
      style={[styles.animation, style]}
    />
  );
}

const styles = StyleSheet.create({
  animation: {
    width: '100%',
    height: '100%',
  },
});
