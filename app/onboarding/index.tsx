import React, { useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router, useLocalSearchParams } from 'expo-router';
import { BathEnvironment } from '@/src/engine/types';
import { useHaptic } from '@/src/hooks/useHaptic';
import { TYPE_CAPTION, TYPE_BODY, TYPE_HEADING_LG, TYPE_TITLE, V2_ACCENT, V2_ACCENT_TEXT, V2_BG_BASE, V2_BG_BOTTOM, V2_BG_TOP, V2_BORDER, V2_TEXT_MUTED, V2_TEXT_PRIMARY, V2_TEXT_SECONDARY } from '@/src/data/colors';
import { luxuryFonts, luxuryTracking } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';
import { AppIconBadge, getEnvironmentBadgeTone } from '@/src/components/AppIconBadge';
import { brand } from '@/src/content/brand';

const ENVIRONMENTS: { id: BathEnvironment; labelKo: string; desc: string }[] = [
  { id: 'bathtub', labelKo: '욕조', desc: '전신욕, 반신욕 가능' },
  { id: 'footbath', labelKo: '족욕 (대야)', desc: '족욕 전용' },
  { id: 'shower', labelKo: '샤워', desc: '샤워 스티머 활용' },
];

export default function OnboardingEnvironment() {
  const { allowBack } = useLocalSearchParams<{ allowBack?: string }>();
  const [selected, setSelected] = useState<BathEnvironment | null>(null);
  const haptic = useHaptic();
  const shouldShowBackButton = allowBack === '1';

  const handleSelect = (env: BathEnvironment) => { haptic.light(); setSelected(env); };
  const handleNext = () => {
    if (!selected) return;
    haptic.medium();
    router.push({
      pathname: '/onboarding/health',
      params: shouldShowBackButton
        ? { environment: selected, allowBack: '1' }
        : { environment: selected },
    });
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={[V2_BG_TOP, V2_BG_BASE, V2_BG_BOTTOM]} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.topBar}>
            {shouldShowBackButton ? (
              <Pressable
                style={styles.backButton}
                onPress={() => router.replace({ pathname: '/(tabs)/my', params: { tab: 'settings' } })}
              >
                <FontAwesome name="angle-left" size={26} color={V2_TEXT_PRIMARY} />
              </Pressable>
            ) : (
              <View style={styles.backButton} />
            )}
            <View style={styles.brandLockup}>
              <Image source={require('../../assets/images/brand/bath-symbol.png')} style={styles.brandIcon} resizeMode="contain" />
              <Text style={styles.brand}>{brand.logoText}</Text>
            </View>
            <View style={styles.backButton} />
          </View>

          <View style={styles.contentColumn}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, styles.progressFillHalf]} />
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>지금 가능한 목욕 환경을 알려주세요</Text>
              <Text style={styles.subtitle}>오늘 무리 없이 쉴 수 있는 방식에 맞춰 온도와 시간을 준비해드려요</Text>
            </View>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.cards}>
                {ENVIRONMENTS.map((env) => {
                  const isSelected = selected === env.id;
                  const tone = getEnvironmentBadgeTone(env.id, isSelected);
                  return (
                    <Pressable
                      key={env.id}
                      onPress={() => handleSelect(env.id)}
                      style={[
                        ui.glassCardV2,
                        styles.card,
                        isSelected && { borderColor: tone.borderColor, backgroundColor: tone.backgroundColor },
                      ]}
                    >
                      <AppIconBadge
                        spec={tone.spec}
                        size={50}
                        iconSize={22}
                        color={tone.color}
                        backgroundColor={tone.backgroundColor}
                        borderColor={tone.borderColor}
                        style={styles.iconWrap}
                      />
                      <View style={styles.cardText}>
                        <View style={styles.cardLabelRow}>
                          <Text style={[styles.cardLabel, isSelected && { color: tone.color }]}>{env.labelKo}</Text>
                        </View>
                        <Text style={styles.cardDesc}>{env.desc}</Text>
                      </View>
                      <View style={[styles.radio, isSelected && styles.radioSelected]}>{isSelected ? <FontAwesome name="check" size={12} color={V2_ACCENT_TEXT} /> : null}</View>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.nextGuide}>
                다음 단계에서는 안전 상태를 확인하고, 지금 환경에 맞는 배쓰타임만 추천해드릴게요.
              </Text>
            </ScrollView>

            <View style={styles.footerCta}>
              <Pressable onPress={handleNext} disabled={!selected} style={[ui.primaryButtonV2, styles.nextButton, !selected && styles.nextButtonDisabled]}>
                <Text style={[ui.primaryButtonTextV2, !selected && styles.nextButtonTextDisabled]}>다음</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: V2_BG_BASE },
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24 },
  contentColumn: { flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center' },
  topBar: { marginTop: 8, marginBottom: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 28, height: 28, justifyContent: 'center', alignItems: 'center' },
  brand: { fontSize: TYPE_CAPTION + 1, color: V2_ACCENT, fontWeight: '700', letterSpacing: 2, fontFamily: luxuryFonts.sans },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandIcon: { width: 18, height: 20 },
  progressTrack: { height: 5, backgroundColor: 'rgba(90, 110, 145, 0.28)', borderRadius: 999, overflow: 'hidden', marginBottom: 24 },
  progressFill: { height: '100%', backgroundColor: V2_ACCENT },
  progressFillHalf: { width: '50%' },
  header: { marginBottom: 26 },
  title: { fontSize: TYPE_HEADING_LG + 4, color: V2_TEXT_PRIMARY, lineHeight: 42, marginBottom: 14, fontFamily: luxuryFonts.display, letterSpacing: luxuryTracking.hero },
  subtitle: { fontSize: TYPE_BODY + 1, color: V2_TEXT_SECONDARY, lineHeight: 23, fontFamily: luxuryFonts.sans },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 132 },
  cards: { gap: 14 },
  card: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 18 },
  iconWrap: { marginRight: 16 },
  cardText: { flex: 1 },
  cardLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardLabel: { fontSize: TYPE_TITLE + 1, color: V2_TEXT_PRIMARY, fontFamily: luxuryFonts.display, lineHeight: 24 },
  cardDesc: { fontSize: TYPE_CAPTION, color: V2_TEXT_MUTED, fontFamily: luxuryFonts.sans, lineHeight: 18 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: V2_BORDER, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)' },
  radioSelected: { borderColor: V2_ACCENT, backgroundColor: V2_ACCENT, transform: [{ scale: 1.05 }] },
  nextGuide: { marginTop: 18, marginBottom: 14, fontSize: TYPE_BODY, lineHeight: 21, color: V2_TEXT_SECONDARY, fontFamily: luxuryFonts.sans },
  footerCta: {
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: V2_BG_BOTTOM,
  },
  nextButton: { minHeight: 50 },
  nextButtonDisabled: { opacity: 1, backgroundColor: 'rgba(201, 164, 91, 0.34)', borderWidth: 1, borderColor: 'rgba(201, 164, 91, 0.16)' },
  nextButtonTextDisabled: { color: 'rgba(26, 36, 48, 0.7)' },
});
