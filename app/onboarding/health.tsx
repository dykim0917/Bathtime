import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router, useLocalSearchParams } from 'expo-router';
import { BathEnvironment, HealthCondition, UserProfile } from '@/src/engine/types';
import { useHaptic } from '@/src/hooks/useHaptic';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { TYPE_CAPTION, TYPE_BODY, TYPE_HEADING_LG, TYPE_TITLE, V2_ACCENT, V2_ACCENT_TEXT, V2_BG_BASE, V2_BG_BOTTOM, V2_BG_TOP, V2_BORDER, V2_TEXT_PRIMARY, V2_TEXT_SECONDARY } from '@/src/data/colors';
import { luxuryFonts } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';
import { AppIconBadge, getHealthConditionBadgeTone } from '@/src/components/AppIconBadge';
import { brand } from '@/src/content/brand';

interface ConditionOption { id: HealthCondition; labelKo: string; }
const CONDITIONS: ConditionOption[] = [
  { id: 'hypertension_heart', labelKo: '고혈압/심장' },
  { id: 'pregnant', labelKo: '임신 중' },
  { id: 'diabetes', labelKo: '당뇨' },
  { id: 'sensitive_skin', labelKo: '민감성 피부' },
  { id: 'none', labelKo: '해당 없음' },
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
              <Text style={styles.brand}>{brand.logoText}</Text>
            </View>
            <View style={styles.backButton} />
          </View>

          <View style={styles.header}>
            <View style={styles.progressTrack}><View style={[styles.progressFill, styles.progressFillFull]} /></View>
            <Text style={styles.title}>안전하게 쉴 수 있도록{`\n`}상태를 확인할게요</Text>
            <Text style={styles.subtitle}>온도와 시간을 무리 없이 맞출 수 있게 현재 상태를 알려주세요.</Text>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.conditions}>
              {CONDITIONS.map((cond) => {
                const selected = selectedConditions.has(cond.id);
                const iconTone = getHealthConditionBadgeTone(cond.id, selected);
                return (
                  <Pressable
                    key={cond.id}
                    style={[
                      ui.glassCardV2,
                      styles.conditionCard,
                      selected && { borderColor: iconTone.borderColor, backgroundColor: iconTone.backgroundColor },
                    ]}
                    onPress={() => handleToggle(cond.id)}
                  >
                    <AppIconBadge
                      spec={iconTone.spec}
                      size={38}
                      iconSize={16}
                      color={iconTone.color}
                      backgroundColor={iconTone.backgroundColor}
                      borderColor={iconTone.borderColor}
                      style={styles.conditionIcon}
                    />
                    <Text style={[styles.conditionLabel, selected && { color: iconTone.color }]}>{cond.labelKo}</Text>
                    <View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <FontAwesome name="check" size={11} color={V2_ACCENT_TEXT} /> : null}</View>
                  </Pressable>
                );
              })}
            </View>

          </ScrollView>

          <View style={styles.footerCta}>
            <Pressable style={[ui.primaryButtonV2, styles.completeButton, !hasSelection && styles.completeButtonDisabled]} onPress={handleComplete} disabled={!hasSelection}>
              <Text style={ui.primaryButtonTextV2}>설정 완료</Text>
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
  topRow: { marginTop: 8, marginBottom: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 28, height: 28, justifyContent: 'center', alignItems: 'center' },
  brand: { fontSize: TYPE_CAPTION + 1, color: V2_ACCENT, fontWeight: '700', letterSpacing: 2, fontFamily: luxuryFonts.sans },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandIcon: { width: 18, height: 20 },
  header: { marginBottom: 20 },
  progressTrack: { height: 5, backgroundColor: 'rgba(90, 110, 145, 0.28)', borderRadius: 999, overflow: 'hidden', marginBottom: 22 },
  progressFill: { height: '100%', backgroundColor: V2_ACCENT },
  progressFillFull: { width: '100%' },
  title: { fontSize: TYPE_HEADING_LG + 4, color: V2_TEXT_PRIMARY, lineHeight: 42, marginBottom: 12, fontFamily: luxuryFonts.display },
  subtitle: { fontSize: TYPE_BODY, color: V2_TEXT_SECONDARY, lineHeight: 22, fontFamily: luxuryFonts.sans },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 132 },
  conditions: { gap: 12 },
  conditionCard: { minHeight: 68, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  conditionIcon: { marginRight: 12 },
  conditionLabel: { flex: 1, fontSize: TYPE_TITLE, color: V2_TEXT_PRIMARY, fontFamily: luxuryFonts.display },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: V2_BORDER, justifyContent: 'center', alignItems: 'center' },
  radioSelected: { borderColor: V2_ACCENT, backgroundColor: V2_ACCENT },
  footerCta: {
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: V2_BG_BOTTOM,
  },
  completeButton: { minHeight: 50, marginTop: 18 },
  completeButtonDisabled: { opacity: 0.45 },
});
