import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useHaptic } from '@/src/hooks/useHaptic';
import {
  TYPE_BODY,
  TYPE_CAPTION,
  TYPE_HEADING_LG,
  V2_ACCENT,
  V2_ACCENT_SOFT,
  V2_BG_BASE,
  V2_BG_BOTTOM,
  V2_BG_TOP,
  V2_BORDER,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
} from '@/src/data/colors';
import { ui } from '@/src/theme/ui';

export default function OnboardingGreeting() {
  const haptic = useHaptic();
  const textOpacity = useSharedValue(0);
  const textY = useSharedValue(16);
  const buttonOpacity = useSharedValue(0);
  const buttonY = useSharedValue(22);

  useEffect(() => {
    textOpacity.value = withDelay(150, withTiming(1, { duration: 520, easing: Easing.out(Easing.ease) }));
    textY.value = withDelay(150, withTiming(0, { duration: 520, easing: Easing.out(Easing.ease) }));
    buttonOpacity.value = withDelay(420, withTiming(1, { duration: 420 }));
    buttonY.value = withDelay(420, withTiming(0, { duration: 420, easing: Easing.out(Easing.ease) }));
  }, [buttonOpacity, buttonY, textOpacity, textY]);

  const textAnim = useAnimatedStyle(() => ({ opacity: textOpacity.value, transform: [{ translateY: textY.value }] }));
  const buttonAnim = useAnimatedStyle(() => ({ opacity: buttonOpacity.value, transform: [{ translateY: buttonY.value }] }));

  const handleStart = () => {
    haptic.success();
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={[V2_BG_TOP, V2_BG_BASE, V2_BG_BOTTOM]} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.topBar}>
          <Image source={require('../../assets/images/brand/bath-symbol.png')} style={styles.brandIcon} resizeMode="contain" />
            <Text style={styles.brand}>BATH SOMMELIER</Text>
          </View>

          <View style={styles.centerContent}>
            <Animated.View style={[styles.heroWrap, textAnim]}>
              <View style={styles.heroCircle}><Text style={styles.heroIcon}>✨</Text></View>
              <Text style={styles.welcome}>WELCOME</Text>
              <Text style={styles.title}>환영합니다</Text>
              <Text style={styles.subtitle}>{'당신만의 입욕 리추얼이\n준비됐어요'}</Text>
              <Text style={styles.description}>이제 홈에서 케어 루틴과 트립 루틴을 바로 시작할 수 있습니다.</Text>
            </Animated.View>
          </View>

          <View style={styles.footer}>
            <Animated.View style={buttonAnim}>
              <TouchableOpacity style={[ui.primaryButtonV2, styles.ctaButton]} activeOpacity={0.85} onPress={handleStart}>
                <Text style={ui.primaryButtonTextV2}>홈으로 이동</Text>
              </TouchableOpacity>
            </Animated.View>
            <Text style={styles.premiumLine}>PREMIUM WELLNESS CURATION SERVICE</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: V2_BG_BASE },
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, paddingBottom: 28 },
  topBar: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  brand: { fontSize: TYPE_CAPTION + 1, color: V2_ACCENT, fontWeight: '700', letterSpacing: 1.8 },
  brandIcon: { width: 18, height: 20 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroWrap: { alignItems: 'center', paddingHorizontal: 8 },
  heroCircle: { width: 126, height: 126, borderRadius: 63, marginBottom: 18, backgroundColor: V2_ACCENT_SOFT, borderWidth: 1, borderColor: V2_BORDER, justifyContent: 'center', alignItems: 'center' },
  heroIcon: { fontSize: 56 },
  welcome: { fontSize: TYPE_CAPTION + 1, color: V2_ACCENT, letterSpacing: 2, fontWeight: '700', marginBottom: 8 },
  title: { fontSize: TYPE_HEADING_LG + 4, color: V2_TEXT_PRIMARY, fontWeight: '700', marginBottom: 14 },
  subtitle: { fontSize: 21, color: V2_TEXT_PRIMARY, textAlign: 'center', lineHeight: 32, fontWeight: '500', marginBottom: 16 },
  description: { fontSize: TYPE_BODY + 1, color: V2_TEXT_SECONDARY, textAlign: 'center', lineHeight: 24, paddingHorizontal: 12 },
  footer: { gap: 16 },
  ctaButton: { width: '100%' },
  premiumLine: { fontSize: 11, color: V2_TEXT_MUTED, textAlign: 'center', letterSpacing: 0.3 },
});
