import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router, useLocalSearchParams } from 'expo-router';
import { BathEnvironment, HealthCondition, UserProfile } from '@/src/engine/types';
import { useHaptic } from '@/src/hooks/useHaptic';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { TYPE_CAPTION, TYPE_BODY, TYPE_HEADING_LG, TYPE_TITLE, V2_ACCENT, V2_ACCENT_SOFT, V2_ACCENT_TEXT, V2_BG_BASE, V2_BG_BOTTOM, V2_BG_TOP, V2_BORDER, V2_TEXT_MUTED, V2_TEXT_PRIMARY, V2_TEXT_SECONDARY } from '@/src/data/colors';
import { luxuryFonts, luxuryRadii, luxuryTracking } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';

interface ConditionOption { id: HealthCondition; badge: string; labelKo: string; }
const CONDITIONS: ConditionOption[] = [
  { id: 'hypertension_heart', badge: '01', labelKo: '고혈압/심장' },
  { id: 'pregnant', badge: '02', labelKo: '임신 중' },
  { id: 'diabetes', badge: '03', labelKo: '당뇨' },
  { id: 'sensitive_skin', badge: '04', labelKo: '민감성 피부' },
  { id: 'none', badge: '05', labelKo: '해당 없음' },
];

export default function OnboardingHealth() {
  const { environment } = useLocalSearchParams<{ environment: string }>();
  const [selectedConditions, setSelectedConditions] = useState<Set<HealthCondition>>(new Set());
  const haptic = useHaptic();
  const { save } = useUserProfile();

  const handleToggle = (condition: HealthCondition) => {
    haptic.light();
    setSelectedConditions((prev) => {
      const next = new Set(prev);
      if (condition === 'none') return new Set(['none'] as HealthCondition[]);
      next.delete('none');
      if (next.has(condition)) next.delete(condition); else next.add(condition);
      if (next.size === 0) next.add('none');
      return next;
    });
  };

  const handleComplete = async () => {
    haptic.success();
    const profile: UserProfile = {
      bathEnvironment: (environment as BathEnvironment) || 'bathtub',
      healthConditions: [...selectedConditions],
      onboardingComplete: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await save(profile);
    router.push('/onboarding/greeting');
  };

  const hasSelection = selectedConditions.size > 0;

  return (
    <View style={styles.root}>
      <LinearGradient colors={[V2_BG_TOP, V2_BG_BASE, V2_BG_BOTTOM]} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => router.canGoBack() ? router.back() : router.replace('/onboarding')}>
              <FontAwesome name="angle-left" size={26} color={V2_TEXT_PRIMARY} />
            </TouchableOpacity>
            <View style={styles.brandLockup}>
              <Image source={require('../../assets/images/brand/bath-symbol.png')} style={styles.brandIcon} resizeMode="contain" />
              <Text style={styles.stepTitle}>2단계</Text>
            </View>
            <View style={styles.backButton} />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>건강 상태를{`\n`}선택해주세요</Text>
            <Text style={styles.subtitle}>무리 없는 루틴을 추천할 수 있게 현재 건강 상태를 확인해주세요.</Text>
          </View>

          <View style={styles.conditions}>
            {CONDITIONS.map((cond) => {
              const selected = selectedConditions.has(cond.id);
              return (
                <Pressable key={cond.id} style={[ui.glassCardV2, styles.conditionCard, selected && styles.conditionCardSelected]} onPress={() => handleToggle(cond.id)}>
                  <View style={[styles.conditionIcon, selected && styles.conditionIconSelected]}><Text style={styles.conditionEmoji}>{cond.badge}</Text></View>
                  <Text style={[styles.conditionLabel, selected && styles.conditionLabelSelected]}>{cond.labelKo}</Text>
                  <View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <FontAwesome name="check" size={11} color={V2_ACCENT_TEXT} /> : null}</View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.spacer} />

          <View style={styles.progressWrap}>
            <View style={styles.progressTrack}><View style={styles.progressFill} /></View>
            <Text style={styles.stepText}>02 / 02</Text>
          </View>

          <Pressable style={[ui.primaryButtonV2, styles.completeButton, !hasSelection && styles.completeButtonDisabled]} onPress={handleComplete} disabled={!hasSelection}>
            <Text style={ui.primaryButtonTextV2}>설정 완료</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: V2_BG_BASE },
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24 },
  topRow: { marginTop: 8, marginBottom: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 28, height: 28, justifyContent: 'center', alignItems: 'center' },
  stepTitle: { fontSize: TYPE_CAPTION, letterSpacing: luxuryTracking.eyebrow, fontWeight: '700', color: V2_ACCENT, fontFamily: luxuryFonts.sans },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandIcon: { width: 18, height: 20 },
  header: { marginBottom: 20 },
  title: { fontSize: TYPE_HEADING_LG + 4, color: V2_TEXT_PRIMARY, lineHeight: 42, marginBottom: 12, fontFamily: luxuryFonts.display },
  subtitle: { fontSize: TYPE_BODY, color: V2_TEXT_SECONDARY, lineHeight: 22, fontFamily: luxuryFonts.sans },
  conditions: { gap: 12 },
  conditionCard: { minHeight: 68, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  conditionCardSelected: { borderColor: V2_ACCENT, backgroundColor: 'rgba(176, 141, 87, 0.08)' },
  conditionIcon: { width: 38, height: 38, borderRadius: luxuryRadii.button, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  conditionIconSelected: { backgroundColor: V2_ACCENT_SOFT },
  conditionEmoji: { fontSize: TYPE_CAPTION, color: V2_TEXT_PRIMARY, fontWeight: '700', letterSpacing: 1, fontVariant: ['tabular-nums'], fontFamily: luxuryFonts.mono },
  conditionLabel: { flex: 1, fontSize: TYPE_TITLE, color: V2_TEXT_PRIMARY, fontFamily: luxuryFonts.display },
  conditionLabelSelected: { color: V2_ACCENT },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: V2_BORDER, justifyContent: 'center', alignItems: 'center' },
  radioSelected: { borderColor: V2_ACCENT, backgroundColor: V2_ACCENT },
  spacer: { flex: 1 },
  progressWrap: { marginBottom: 14, alignItems: 'center' },
  progressTrack: { height: 6, width: 110, borderRadius: 999, backgroundColor: 'rgba(90, 110, 145, 0.34)', overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', width: '100%', backgroundColor: V2_ACCENT },
  stepText: { fontSize: TYPE_CAPTION, color: V2_TEXT_MUTED, fontWeight: '600', fontFamily: luxuryFonts.sans },
  completeButton: { marginBottom: 14 },
  completeButtonDisabled: { opacity: 0.45 },
});
