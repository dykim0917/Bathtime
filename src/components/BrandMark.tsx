import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import BathtimeMark from '@/assets/images/bathtime.svg';
import { V2_ACCENT_SOFT } from '@/src/data/colors';

interface BrandMarkProps {
  size?: number;
  framed?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function BrandMark({ size = 28, framed = false, style }: BrandMarkProps) {
  const mark = <BathtimeMark width={size} height={size} />;

  if (!framed) {
    return <View style={[styles.plain, style]}>{mark}</View>;
  }

  return (
    <View style={[styles.frame, { width: size + 18, height: size + 18, borderRadius: (size + 18) / 4 }, style]}>
      {mark}
    </View>
  );
}

const styles = StyleSheet.create({
  plain: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V2_ACCENT_SOFT,
  },
});
