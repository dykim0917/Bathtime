import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { BathEnvironment } from '@/src/engine/types';
import { useHaptic } from '@/src/hooks/useHaptic';
import { TYPE_CAPTION, TYPE_BODY, TYPE_HEADING_LG, TYPE_TITLE, V2_ACCENT, V2_ACCENT_SOFT, V2_ACCENT_TEXT, V2_BG_BASE, V2_BG_BOTTOM, V2_BG_TOP, V2_BORDER, V2_TEXT_MUTED, V2_TEXT_PRIMARY, V2_TEXT_SECONDARY } from '@/src/data/colors';
import { ui } from '@/src/theme/ui';

const ENVIRONMENTS: { id: BathEnvironment; emoji: string; labelKo: string; desc: string }[] = [
  { id: 'bathtub', emoji: '🛁', labelKo: '욕조', desc: '전신욕, 반신욕 가능' },
  { id: 'footbath', emoji: '🦶', labelKo: '족욕 (대야)', desc: '족욕 전용' },
  { id: 'shower', emoji: '🚿', labelKo: '샤워부스', desc: '샤워 스티머 활용' },
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
            <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => router.canGoBack() && router.back()}>
              <FontAwesome name="angle-left" size={26} color={V2_TEXT_PRIMARY} />
            </TouchableOpacity>
            <View style={styles.brandLockup}>
              <Image source={require('../../assets/images/brand/bath-symbol.png')} style={styles.brandIcon} resizeMode="contain" />
              <Text style={styles.brand}>BATH SOMMELIER</Text>
            </View>
            <View style={styles.backButton} />
          </View>

          <View style={styles.contentColumn}>
            <View style={styles.header}>
              <Text style={styles.title}>나의 목욕 환경을 알려주세요</Text>
              <Text style={styles.subtitle}>환경에 맞는 최적의 레시피를 추천해드립니다</Text>
            </View>

            <View style={styles.cards}>
              {ENVIRONMENTS.map((env) => {
                const isSelected = selected === env.id;
                return (
                  <TouchableOpacity key={env.id} activeOpacity={0.85} onPress={() => handleSelect(env.id)} style={[ui.glassCardV2, styles.card, isSelected && styles.cardSelected]}>
                    <View style={[styles.iconWrap, isSelected && styles.iconWrapSelected]}><Text style={styles.emoji}>{env.emoji}</Text></View>
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
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={[ui.glassCardV2, styles.selectionPanel, selected && styles.selectionPanelActive]}>
              <Text style={styles.selectionEyebrow}>{selected ? 'SELECTED ENVIRONMENT' : 'STEP GUIDE'}</Text>
              <Text style={styles.selectionTitle}>
                {selected ? `${ENVIRONMENTS.find((env) => env.id === selected)?.labelKo} 기준으로 다음 단계를 준비했어요` : '먼저 입욕 환경 하나를 고르면 다음 단계가 더 쉬워집니다'}
              </Text>
              <Text style={styles.selectionBody}>
                {selected ? '다음 단계에서는 건강 상태를 확인하고, 지금 환경에 맞는 루틴만 추천해드릴게요.' : '욕조, 족욕, 샤워 중 현재 집에서 가장 자주 쓸 수 있는 환경을 선택해주세요.'}
              </Text>
            </View>

            <View style={styles.footer}>
              <View style={styles.progressRow}><Text style={styles.progressLabel}>PROGRESS</Text><Text style={styles.progressStep}>01 / 02</Text></View>
              <View style={styles.progressTrack}><View style={styles.progressFill} /></View>
            </View>

            <TouchableOpacity activeOpacity={0.85} onPress={handleNext} disabled={!selected} style={[ui.primaryButtonV2, styles.nextButton, !selected && styles.nextButtonDisabled]}>
              <Text style={[ui.primaryButtonTextV2, !selected && styles.nextButtonTextDisabled]}>다음</Text>
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
  container: { flex: 1, paddingHorizontal: 24 },
  contentColumn: { flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center' },
  topBar: { marginTop: 8, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 28, height: 28, justifyContent: 'center', alignItems: 'center' },
  brand: { fontSize: TYPE_CAPTION + 2, color: V2_ACCENT, fontWeight: '700', letterSpacing: 1.8 },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandIcon: { width: 18, height: 20 },
  header: { marginBottom: 22 },
  title: { fontSize: TYPE_HEADING_LG, fontWeight: '700', color: V2_TEXT_PRIMARY, lineHeight: 38, marginBottom: 12 },
  subtitle: { fontSize: TYPE_BODY, color: V2_TEXT_SECONDARY, lineHeight: 20 },
  cards: { gap: 14 },
  card: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 16 },
  cardSelected: { borderColor: V2_ACCENT, backgroundColor: 'rgba(201, 164, 91, 0.1)' },
  iconWrap: { width: 46, height: 46, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  iconWrapSelected: { backgroundColor: V2_ACCENT_SOFT },
  emoji: { fontSize: 25 },
  cardText: { flex: 1 },
  cardLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardLabel: { fontSize: TYPE_TITLE, fontWeight: '600', color: V2_TEXT_PRIMARY, marginBottom: 4 },
  cardLabelSelected: { color: '#FBE7BA' },
  cardDesc: { fontSize: TYPE_CAPTION, color: V2_TEXT_MUTED },
  selectedPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: 'rgba(251, 231, 186, 0.14)', borderWidth: 1, borderColor: 'rgba(201, 164, 91, 0.4)' },
  selectedPillText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, color: '#FBE7BA' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: V2_BORDER, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)' },
  radioSelected: { borderColor: V2_ACCENT, backgroundColor: V2_ACCENT, transform: [{ scale: 1.05 }] },
  selectionPanel: { marginTop: 18, marginBottom: 22, paddingHorizontal: 18, paddingVertical: 16, minHeight: 104, justifyContent: 'center' },
  selectionPanelActive: { borderColor: 'rgba(201, 164, 91, 0.28)', backgroundColor: 'rgba(255, 243, 225, 0.08)' },
  selectionEyebrow: { fontSize: 11, color: V2_ACCENT, fontWeight: '700', letterSpacing: 1.1, marginBottom: 8 },
  selectionTitle: { fontSize: TYPE_BODY + 2, lineHeight: 22, color: V2_TEXT_PRIMARY, fontWeight: '700', marginBottom: 8 },
  selectionBody: { fontSize: TYPE_BODY, lineHeight: 20, color: V2_TEXT_SECONDARY },
  footer: { marginBottom: 18 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { fontSize: TYPE_CAPTION, color: V2_ACCENT, fontWeight: '700', letterSpacing: 0.5 },
  progressStep: { fontSize: TYPE_CAPTION, color: V2_TEXT_MUTED, fontWeight: '600' },
  progressTrack: { height: 7, backgroundColor: 'rgba(90, 110, 145, 0.34)', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', width: '50%', backgroundColor: V2_ACCENT },
  nextButton: { marginBottom: 14 },
  nextButtonDisabled: { opacity: 1, backgroundColor: 'rgba(201, 164, 91, 0.34)', borderWidth: 1, borderColor: 'rgba(201, 164, 91, 0.16)' },
  nextButtonTextDisabled: { color: 'rgba(17, 33, 61, 0.66)' },
});
