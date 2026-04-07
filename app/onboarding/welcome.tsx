import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  TYPE_BODY,
  TYPE_CAPTION,
  TYPE_HEADING_LG,
  TYPE_TITLE,
  V2_ACCENT,
  V2_ACCENT_SOFT,
  V2_ACCENT_TEXT,
  V2_BG_BASE,
  V2_BG_BOTTOM,
  V2_BG_TOP,
  V2_BORDER,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
} from '@/src/data/colors';
import { luxuryFonts, luxuryRadii, luxuryTracking } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';

export default function WelcomeScreen() {
  return (
    <View style={styles.root}>
      <LinearGradient colors={[V2_BG_TOP, V2_BG_BASE, V2_BG_BOTTOM]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.logoRow}>
            <Image source={require('../../assets/images/brand/bath-symbol.png')} style={styles.logoIcon} resizeMode="contain" />
            <Text style={styles.logoText}>BATH SOMMELIER</Text>
          </View>

          <View style={styles.hero}>
            <View style={styles.heroOrb}>
              <Text style={styles.heroEmoji}>🛁</Text>
            </View>
            <Text style={styles.kicker}>PRIVATE BATH CURATION</Text>
            <Text style={styles.title}>나만의 목욕 루틴</Text>
            <Text style={styles.subtitle}>지금 상태에 맞는 입욕 레시피를 차분한 프리미엄 무드로 추천합니다.</Text>
          </View>

          <View style={[ui.glassCardV2, styles.featureCard]}>
            <Text style={styles.featureTitle}>오늘 바로 시작할 수 있어요</Text>
            <Text style={styles.featureLine}>환경 선택</Text>
            <Text style={styles.featureLine}>건강 상태 체크</Text>
            <Text style={styles.featureLine}>맞춤 루틴 추천</Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={[ui.primaryButtonV2, styles.primaryCta]} activeOpacity={0.85} onPress={() => router.push('/onboarding')}>
              <Text style={ui.primaryButtonTextV2}>시작하기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryLink} activeOpacity={0.75} onPress={() => router.replace('/(tabs)')}>
              <Text style={styles.secondaryText}>이미 사용 중이면 바로 들어가기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: V2_BG_BASE },
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 },
  glowTop: {
    position: 'absolute', top: -120, right: -40, width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(201, 164, 91, 0.14)',
  },
  glowBottom: {
    position: 'absolute', bottom: -120, left: -40, width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(115, 150, 196, 0.12)',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  logoIcon: { width: 18, height: 20 },
  logoText: { color: V2_ACCENT, fontSize: TYPE_CAPTION + 1, fontWeight: '700', letterSpacing: 2, fontFamily: luxuryFonts.sans },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  heroOrb: {
    width: 132, height: 132, borderRadius: 66, alignItems: 'center', justifyContent: 'center',
    backgroundColor: V2_ACCENT_SOFT, borderWidth: 1, borderColor: V2_BORDER,
  },
  heroEmoji: { fontSize: 58 },
  kicker: { color: V2_ACCENT, fontSize: TYPE_CAPTION, fontWeight: '700', letterSpacing: luxuryTracking.eyebrow, fontFamily: luxuryFonts.sans },
  title: { color: V2_TEXT_PRIMARY, fontSize: TYPE_HEADING_LG + 6, textAlign: 'center', lineHeight: 44, fontFamily: luxuryFonts.display },
  subtitle: { color: V2_TEXT_SECONDARY, fontSize: TYPE_BODY + 1, lineHeight: 24, textAlign: 'center', paddingHorizontal: 10, fontFamily: luxuryFonts.sans },
  featureCard: { padding: 20, gap: 8, marginBottom: 18 },
  featureTitle: { color: V2_TEXT_PRIMARY, fontSize: TYPE_TITLE, marginBottom: 4, fontFamily: luxuryFonts.display },
  featureLine: { color: V2_TEXT_MUTED, fontSize: TYPE_BODY, lineHeight: 20, fontFamily: luxuryFonts.sans },
  footer: { gap: 14 },
  primaryCta: { width: '100%' },
  secondaryLink: { alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  secondaryText: { color: V2_TEXT_MUTED, fontSize: TYPE_BODY, fontFamily: luxuryFonts.sans },
});
