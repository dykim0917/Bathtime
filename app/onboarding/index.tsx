import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { BathEnvironment } from '@/src/engine/types';
import { useHaptic } from '@/src/hooks/useHaptic';
import { TYPE_CAPTION, TYPE_BODY, TYPE_HEADING_LG, TYPE_TITLE, V2_ACCENT, V2_ACCENT_SOFT, V2_ACCENT_TEXT, V2_BG_BASE, V2_BG_BOTTOM, V2_BG_TOP, V2_BORDER, V2_TEXT_MUTED, V2_TEXT_PRIMARY, V2_TEXT_SECONDARY } from '@/src/data/colors';
import { luxuryFonts, luxuryRadii, luxuryTracking } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';

const ENVIRONMENTS: { id: BathEnvironment; badge: string; labelKo: string; desc: string }[] = [
  { id: 'bathtub', badge: '01', labelKo: '욕조', desc: '전신욕, 반신욕 가능' },
  { id: 'footbath', badge: '02', labelKo: '족욕 (대야)', desc: '족욕 전용' },
  { id: 'shower', badge: '03', labelKo: '샤워부스', desc: '샤워 스티머 활용' },
];

export default function OnboardingEnvironment() {
  const [selected, setSelected] = useState<BathEnvironment | null>(null);
  const haptic = useHaptic();

  const handleSelect = (env: BathEnvironment) => { haptic.light(); setSelected(env); };
  const handleNext = () => {
    if (!selected) return;
    haptic.medium();
    router.push({ pathname: '/onboarding/health', params: { environment: selected } });
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={[V2_BG_TOP, V2_BG_BASE, V2_BG_BOTTOM]} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.topBar}>
            <Pressable style={styles.backButton} onPress={() => router.canGoBack() && router.back()}>
              <FontAwesome name="angle-left" size={26} color={V2_TEXT_PRIMARY} />
            </Pressable>
            <View style={styles.brandLockup}>
              <Image source={require('../../assets/images/brand/bath-symbol.png')} style={styles.brandIcon} resizeMode="contain" />
              <Text style={styles.brand}>BATH SOMMELIER</Text>
            </View>
            <View style={styles.backButton} />
          </View>

          <View style={styles.contentColumn}>
            <View style={styles.header}>
              <Text style={styles.title}>나의 목욕 환경을 알려주세요</Text>
              <Text style={styles.subtitle}>지금 집에서 할 수 있는 환경에 맞춰 루틴을 추천해드려요</Text>
            </View>

            <View style={styles.cards}>
              {ENVIRONMENTS.map((env) => {
                const isSelected = selected === env.id;
                return (
                  <Pressable key={env.id} onPress={() => handleSelect(env.id)} style={[ui.glassCardV2, styles.card, isSelected && styles.cardSelected]}>
                    <View style={[styles.iconWrap, isSelected && styles.iconWrapSelected]}><Text style={styles.emoji}>{env.badge}</Text></View>
                    <View style={styles.cardText}>
                      <View style={styles.cardLabelRow}>
                        <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>{env.labelKo}</Text>
                        {isSelected ? (
                          <View style={styles.selectedPill}>
                            <Text style={styles.selectedPillText}>선택됨</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.cardDesc}>{env.desc}</Text>
                    </View>
                    <View style={[styles.radio, isSelected && styles.radioSelected]}>{isSelected ? <FontAwesome name="check" size={12} color={V2_ACCENT_TEXT} /> : null}</View>
                  </Pressable>
                );
              })}
            </View>

            <View style={[ui.glassCardV2, styles.selectionPanel, selected && styles.selectionPanelActive]}>
              <Text style={styles.selectionEyebrow}>{selected ? '선택한 환경' : '다음 단계 안내'}</Text>
              <Text style={styles.selectionTitle}>
                {selected ? `${ENVIRONMENTS.find((env) => env.id === selected)?.labelKo} 기준으로 다음 단계를 준비했어요` : '먼저 입욕 환경 하나를 고르면 다음 단계가 더 쉬워집니다'}
              </Text>
              <Text style={styles.selectionBody}>
                {selected ? '다음 단계에서는 건강 상태를 확인하고, 지금 환경에 맞는 루틴만 추천해드릴게요.' : '욕조, 족욕, 샤워 중 현재 집에서 가장 자주 쓸 수 있는 환경을 선택해주세요.'}
              </Text>
            </View>

            <View style={styles.footer}>
              <View style={styles.progressRow}><Text style={styles.progressLabel}>진행 단계</Text><Text style={styles.progressStep}>01 / 02</Text></View>
              <View style={styles.progressTrack}><View style={styles.progressFill} /></View>
            </View>

            <Pressable onPress={handleNext} disabled={!selected} style={[ui.primaryButtonV2, styles.nextButton, !selected && styles.nextButtonDisabled]}>
              <Text style={[ui.primaryButtonTextV2, !selected && styles.nextButtonTextDisabled]}>다음</Text>
            </Pressable>
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
  header: { marginBottom: 26 },
  title: { fontSize: TYPE_HEADING_LG + 4, color: V2_TEXT_PRIMARY, lineHeight: 42, marginBottom: 14, fontFamily: luxuryFonts.display, letterSpacing: luxuryTracking.hero },
  subtitle: { fontSize: TYPE_BODY + 1, color: V2_TEXT_SECONDARY, lineHeight: 23, fontFamily: luxuryFonts.sans },
  cards: { gap: 14 },
  card: { flexDirection: 'row', alignItems: 'center', paddingVertical: 20, paddingHorizontal: 18 },
  cardSelected: { borderColor: V2_ACCENT, backgroundColor: 'rgba(176, 141, 87, 0.1)' },
  iconWrap: { width: 50, height: 50, borderRadius: luxuryRadii.button, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  iconWrapSelected: { backgroundColor: V2_ACCENT_SOFT },
  emoji: { fontSize: TYPE_CAPTION, color: V2_TEXT_PRIMARY, fontWeight: '700', letterSpacing: 1, fontVariant: ['tabular-nums'], fontFamily: luxuryFonts.mono },
  cardText: { flex: 1 },
  cardLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardLabel: { fontSize: TYPE_TITLE + 1, color: V2_TEXT_PRIMARY, marginBottom: 4, fontFamily: luxuryFonts.display, lineHeight: 24 },
  cardLabelSelected: { color: '#F5F0E8' },
  cardDesc: { fontSize: TYPE_CAPTION, color: V2_TEXT_MUTED, fontFamily: luxuryFonts.sans, lineHeight: 18 },
  selectedPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: 'rgba(245, 240, 232, 0.1)', borderWidth: 1, borderColor: 'rgba(176, 141, 87, 0.36)' },
  selectedPillText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6, color: '#F5F0E8', fontFamily: luxuryFonts.sans },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: V2_BORDER, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)' },
  radioSelected: { borderColor: V2_ACCENT, backgroundColor: V2_ACCENT, transform: [{ scale: 1.05 }] },
  selectionPanel: { marginTop: 20, marginBottom: 24, paddingHorizontal: 20, paddingVertical: 18, minHeight: 112, justifyContent: 'center' },
  selectionPanelActive: { borderColor: 'rgba(201, 164, 91, 0.28)', backgroundColor: 'rgba(255, 243, 225, 0.08)' },
  selectionEyebrow: { fontSize: 11, color: V2_ACCENT, fontWeight: '700', letterSpacing: 1.4, marginBottom: 8, fontFamily: luxuryFonts.sans },
  selectionTitle: { fontSize: TYPE_TITLE, lineHeight: 24, color: V2_TEXT_PRIMARY, marginBottom: 8, fontFamily: luxuryFonts.display },
  selectionBody: { fontSize: TYPE_BODY, lineHeight: 21, color: V2_TEXT_SECONDARY, fontFamily: luxuryFonts.sans },
  footer: { marginBottom: 18 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { fontSize: TYPE_CAPTION, color: V2_ACCENT, fontWeight: '700', letterSpacing: 0.7, fontFamily: luxuryFonts.sans },
  progressStep: { fontSize: TYPE_CAPTION, color: V2_TEXT_MUTED, fontWeight: '600', fontFamily: luxuryFonts.sans },
  progressTrack: { height: 7, backgroundColor: 'rgba(90, 110, 145, 0.34)', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', width: '50%', backgroundColor: V2_ACCENT },
  nextButton: { marginBottom: 14 },
  nextButtonDisabled: { opacity: 1, backgroundColor: 'rgba(201, 164, 91, 0.34)', borderWidth: 1, borderColor: 'rgba(201, 164, 91, 0.16)' },
  nextButtonTextDisabled: { color: 'rgba(26, 36, 48, 0.7)' },
});
