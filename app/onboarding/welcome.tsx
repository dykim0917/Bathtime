import React, { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useHaptic } from '@/src/hooks/useHaptic';
import { saveCookieNoticeAck } from '@/src/storage/legal';
import {
  TYPE_BODY,
  TYPE_CAPTION,
  TYPE_TITLE,
  V2_ACCENT,
  V2_ACCENT_TEXT,
  V2_BG_BASE,
  V2_BG_BOTTOM,
  V2_BG_TOP,
  V2_BORDER,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
} from '@/src/data/colors';
import { luxuryFonts } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';

type GuideSlide = {
  id: string;
  title: string;
  body: string;
  points: string[];
};

const GUIDE_SLIDES: GuideSlide[] = [
  {
    id: 'what',
    title: '오늘 상태에 맞는 목욕 루틴을 차분하게 추천해드려요',
    body: '복잡하게 고르지 않아도 괜찮아요. 지금 컨디션에 맞는 목욕·샤워 루틴을 바로 시작할 수 있게 안내해드릴게요.',
    points: ['오늘 컨디션 기준 추천', '목욕·샤워 모두 대응', '부담 없는 첫 시작'],
  },
  {
    id: 'how',
    title: '환경과 상태만 확인하면 바로 루틴이 정해져요',
    body: '지금 가능한 환경과 건강 상태만 확인하면, 오늘 바로 따라할 수 있는 온도·시간·순서를 정리해드려요.',
    points: ['목욕 환경 선택', '건강 상태 확인', '루틴 시작'],
  },
  {
    id: 'safety',
    title: '건강 상태는 더 강한 추천보다 안전한 추천을 위해 확인해요',
    body: '배쓰타임은 위험할 수 있는 루틴을 먼저 걸러내기 위해 최소한의 정보만 확인합니다. 안심하고 시작할 수 있게 돕는 과정이에요.',
    points: ['안전 우선', '필요한 정보만', '언제든 다시 조정 가능'],
  },
];

export default function WelcomeScreen() {
  const [stepIndex, setStepIndex] = useState(0);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const haptic = useHaptic();
  const isLastStep = stepIndex === GUIDE_SLIDES.length - 1;
  const slide = GUIDE_SLIDES[stepIndex];

  const stepLabel = useMemo(
    () => `${stepIndex + 1} / ${GUIDE_SLIDES.length}`,
    [stepIndex]
  );

  const isPrimaryDisabled = isLastStep && !legalAccepted;

  const handleNext = () => {
    if (isPrimaryDisabled) return;
    haptic.medium();
    if (isLastStep) {
      void saveCookieNoticeAck().finally(() => {
        router.push('/onboarding');
      });
      return;
    }
    setStepIndex((current) => current + 1);
  };

  const handlePrevious = () => {
    if (stepIndex === 0) return;
    haptic.light();
    setStepIndex((current) => current - 1);
  };

  const handleOpenTerms = () => {
    haptic.light();
    router.push('/legal/terms');
  };

  const handleOpenPrivacy = () => {
    haptic.light();
    router.push('/legal/privacy');
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[V2_BG_TOP, V2_BG_BASE, V2_BG_BOTTOM]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.progressMeta}>
            <Text style={styles.stepLabel}>{stepLabel}</Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${((stepIndex + 1) / GUIDE_SLIDES.length) * 100}%` },
                ]}
              />
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.hero}>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.body}>{slide.body}</Text>
            </View>

            <View style={[ui.glassCardV2, styles.card]}>
              {slide.points.map((point) => (
                <View key={point} style={styles.pointRow}>
                  <View style={styles.pointDot} />
                  <Text style={styles.pointText}>{point}</Text>
                </View>
              ))}
            </View>

          </ScrollView>

          <View style={styles.footer}>
            {isLastStep ? (
              <View style={styles.legalConsentRow}>
                <Pressable
                  style={[styles.legalCheckbox, legalAccepted && styles.legalCheckboxChecked]}
                  onPress={() => {
                    haptic.light();
                    setLegalAccepted((current) => !current);
                  }}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: legalAccepted }}
                >
                  {legalAccepted ? <Text style={styles.legalCheckboxMark}>✓</Text> : null}
                </Pressable>
                <Text style={styles.legalConsentText}>
                  <Text style={styles.legalConsentLink} onPress={handleOpenTerms}>이용 약관</Text>
                  <Text> 및 </Text>
                  <Text style={styles.legalConsentLink} onPress={handleOpenPrivacy}>개인정보 처리방침</Text>
                  <Text>에 동의합니다</Text>
                </Text>
              </View>
            ) : null}
            <Pressable
              onPress={handleNext}
              disabled={isPrimaryDisabled}
              style={[ui.primaryButtonV2, styles.primaryButton, isPrimaryDisabled && styles.primaryButtonDisabled]}
            >
              <Text style={[ui.primaryButtonTextV2, isPrimaryDisabled && styles.primaryButtonTextDisabled]}>
                {isLastStep ? '시작하기' : '다음'}
              </Text>
            </Pressable>

            {stepIndex > 0 ? (
              <Pressable style={styles.directLink} onPress={handlePrevious}>
                <Text style={styles.directLinkText}>이전으로</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: V2_BG_BASE,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 20,
  },
  glowTop: {
    position: 'absolute',
    top: -120,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(201, 164, 91, 0.14)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: -120,
    left: -40,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(115, 150, 196, 0.12)',
  },
  progressMeta: {
    gap: 10,
    marginBottom: 28,
  },
  stepLabel: {
    color: V2_TEXT_MUTED,
    fontSize: TYPE_CAPTION,
    fontFamily: luxuryFonts.sans,
  },
  progressTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: V2_ACCENT,
    borderRadius: 999,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 28,
  },
  hero: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  title: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_TITLE + 4,
    lineHeight: 32,
    textAlign: 'center',
    fontFamily: luxuryFonts.display,
    paddingHorizontal: 4,
  },
  body: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_BODY + 1,
    lineHeight: 24,
    textAlign: 'center',
    fontFamily: luxuryFonts.sans,
    paddingHorizontal: 8,
  },
  card: {
    padding: 20,
    gap: 12,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pointDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: V2_ACCENT,
  },
  pointText: {
    flex: 1,
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_TITLE - 1,
    lineHeight: 23,
    fontFamily: luxuryFonts.sans,
  },
  footer: {
    gap: 14,
  },
  legalConsentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 4,
  },
  legalCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: V2_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  legalCheckboxChecked: {
    backgroundColor: V2_ACCENT,
    borderColor: V2_ACCENT,
  },
  legalCheckboxMark: {
    color: V2_ACCENT_TEXT,
    fontSize: 12,
    fontWeight: '700',
  },
  legalConsentText: {
    flex: 1,
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_CAPTION + 1,
    lineHeight: 20,
    fontFamily: luxuryFonts.sans,
  },
  legalConsentLink: {
    color: V2_ACCENT,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  primaryButton: {
    width: '100%',
  },
  primaryButtonDisabled: {
    opacity: 1,
    backgroundColor: 'rgba(201, 164, 91, 0.34)',
    borderWidth: 1,
    borderColor: 'rgba(201, 164, 91, 0.16)',
  },
  primaryButtonTextDisabled: {
    color: 'rgba(26, 36, 48, 0.7)',
  },
  directLink: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  directLinkText: {
    color: V2_TEXT_MUTED,
    fontSize: TYPE_BODY,
    fontFamily: luxuryFonts.sans,
  },
});
