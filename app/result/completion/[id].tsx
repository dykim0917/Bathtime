import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, BounceIn } from 'react-native-reanimated';
import ConditionIcon from '@/assets/icons/condition.svg';
import UnhappyIcon from '@/assets/icons/unhappy.svg';
import { BathRecommendation, BathFeedback } from '@/src/engine/types';
import { BrandMark } from '@/src/components/BrandMark';
import { getRecommendationById, getMonthlyCount, updateRecommendationFeedback } from '@/src/storage/history';
import { clearSession, loadSession } from '@/src/storage/session';
import { patchSessionRecord } from '@/src/storage/sessionLog';
import { applyFeedbackToThemePreference, saveCompletionMemory } from '@/src/storage/memory';
import { mapFeedbackToFeelingAfter } from '@/src/engine/feeling';
import { getTimeBasedMessage } from '@/src/utils/messages';
import { copy } from '@/src/content/copy';
import {
  TYPE_SCALE,
  V2_ACCENT,
  V2_ACCENT_SOFT,
  V2_BG_BASE,
  V2_BORDER,
  V2_SHADOW,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
} from '@/src/data/colors';
import { luxuryFonts, luxuryTracking } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';

const RESULT_BACKGROUND = require('../../../assets/images/result_background.png');

type CompletionStep = 'feedback' | 'summary';

function toEnvironmentLabel(environment: string): string {
  switch (environment) {
    case 'bathtub':
      return '욕조';
    case 'partial_bath':
    case 'footbath':
      return '족욕';
    case 'shower':
      return '샤워';
    default:
      return environment;
  }
}

export default function CompletionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recommendation, setRecommendation] = useState<BathRecommendation | null>(null);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [feedback, setFeedback] = useState<BathFeedback>(null);
  const [memoryNarrative, setMemoryNarrative] = useState<string | null>(null);
  const [themeWeight, setThemeWeight] = useState<number | null>(null);
  const [snapshotLine, setSnapshotLine] = useState<string | null>(null);
  const [step, setStep] = useState<CompletionStep>('feedback');

  useEffect(() => {
    if (!id) return;

    getRecommendationById(id).then(async (rec) => {
      if (!rec) return;
      setRecommendation(rec);
      setFeedback(rec.feedback ?? null);
      setStep(rec.feedback ? 'summary' : 'feedback');
      const session = await loadSession();
      const actualDurationMinutes =
        session?.recommendationId === id && session.actualDurationSeconds !== undefined
          ? Math.max(1, Math.round(session.actualDurationSeconds / 60))
          : rec.durationMinutes;
      const completedAt =
        session?.recommendationId === id && session.completedAt
          ? session.completedAt
          : rec.createdAt;

      const memory = await saveCompletionMemory(rec, null, {
        completedAt:
          session?.recommendationId === id && session.completedAt
            ? session.completedAt
            : undefined,
        durationMinutes: actualDurationMinutes,
      });
      await patchSessionRecord(id, {
        date: completedAt,
        duration: actualDurationMinutes,
      });
      setMemoryNarrative(memory.narrativeRecallCard);
      if (memory.themeId) {
        setThemeWeight(memory.themePreferenceWeight);
      }
      setSnapshotLine(
        `${memory.completionSnapshot.temperatureRecommended}°C · ${
          memory.completionSnapshot.durationMinutes !== null
            ? `${memory.completionSnapshot.durationMinutes}분`
            : '시간 자유'
        } · ${toEnvironmentLabel(memory.completionSnapshot.environment)} · ${new Date(
          memory.completionSnapshot.completedAt
        ).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 완료`
      );
    });

    const now = new Date();
    getMonthlyCount(now.getFullYear(), now.getMonth() + 1).then(setMonthlyCount);
  }, [id]);

  const handleFeedback = async (value: 'good' | 'bad') => {
    if (!id || feedback) return;
    setFeedback(value);
    setStep('summary');
    await updateRecommendationFeedback(id, value);
    await patchSessionRecord(id, {
      user_feeling_after: mapFeedbackToFeelingAfter(value),
    });
    if (recommendation?.themeId) {
      const next = await applyFeedbackToThemePreference(recommendation.themeId, value);
      setThemeWeight(next);
    }
  };

  const handleGoHome = async () => {
    await clearSession();
    router.replace('/(tabs)');
  };

  const handleGoHistory = async () => {
    await clearSession();
    router.replace('/(tabs)/history');
  };

  if (!recommendation) {
    return (
      <View style={[ui.screenShellV2, styles.centered]}>
        <Text style={{ color: V2_TEXT_SECONDARY }}>{copy.completion.loading}</Text>
      </View>
    );
  }

  const timeMessage = getTimeBasedMessage();
  const feedbackTitle = recommendation.themeTitle
    ? `${copy.completion.feedbackTitleWithThemePrefix} ${recommendation.themeTitle} ${copy.completion.feedbackTitleWithThemeSuffix}`
    : copy.completion.feedbackTitleDefault;

  return (
    <View style={styles.container}>
      <Image
        source={RESULT_BACKGROUND}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(5, 20, 21, 0)', 'rgba(5, 20, 21, 0.08)', 'rgba(5, 20, 21, 0.46)']}
        locations={[0, 0.52, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.softOverlay} />
      <SafeAreaView style={styles.safeArea}>
        {step === 'feedback' ? (
          <ScrollView
            style={styles.feedbackScroll}
            contentContainerStyle={styles.feedbackContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View entering={FadeIn.duration(500)} style={styles.brandBlock}>
              <BrandMark size={72} />
            </Animated.View>

            <Animated.View entering={BounceIn.duration(800)} style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>{copy.routine.stepFinish}</Text>
            </Animated.View>

            <Animated.View entering={FadeIn.duration(600).delay(160)} style={styles.headerBlock}>
              <Text style={styles.mainMessage}>{timeMessage}</Text>
              <Text style={styles.mainLead}>
                따뜻한 물이 몸을 녹인 시간, 오늘의 휴식을 천천히 간직해보세요.
              </Text>
            </Animated.View>

            <Animated.View entering={FadeIn.duration(600).delay(360)} style={styles.feedbackSection}>
              <Text style={styles.feedbackTitle}>{feedbackTitle}</Text>
              <Text style={styles.feedbackSubtitle}>당신의 피드백이 더 좋은 휴식을 만듭니다.</Text>
              <View style={styles.feedbackButtons}>
                <Pressable
                  style={[
                    styles.feedbackButton,
                    feedback === 'good' && styles.feedbackButtonActive,
                  ]}
                  onPress={() => handleFeedback('good')}
                  disabled={feedback !== null}
                >
                  <ConditionIcon
                    width={38}
                    height={38}
                    fill={feedback === 'good' ? V2_BG_BASE : V2_ACCENT}
                  />
                  <Text style={[styles.feedbackLabel, feedback === 'good' && styles.feedbackLabelActive]}>
                    {copy.completion.feedback.good}
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.feedbackButton,
                    feedback === 'bad' && styles.feedbackButtonActive,
                  ]}
                  onPress={() => handleFeedback('bad')}
                  disabled={feedback !== null}
                >
                  <UnhappyIcon
                    width={34}
                    height={34}
                    fill={feedback === 'bad' ? V2_BG_BASE : V2_TEXT_MUTED}
                  />
                  <Text style={[styles.feedbackLabel, feedback === 'bad' && styles.feedbackLabelActive]}>
                    {copy.completion.feedback.bad}
                  </Text>
                </Pressable>
              </View>
            </Animated.View>

            <Animated.View entering={FadeIn.duration(600).delay(460)} style={styles.privateNote}>
              <Text style={styles.privateNoteIcon}>*</Text>
              <Text style={styles.privateNoteText}>기록은 나만 볼 수 있어요. 오늘의 휴식을 소중히 간직하세요.</Text>
            </Animated.View>
          </ScrollView>
        ) : (
          <ScrollView
            style={styles.summaryScroll}
            contentContainerStyle={styles.summaryContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View entering={FadeIn.duration(400)} style={styles.summaryHeaderBlock}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{copy.routine.stepFinish}</Text>
              </View>
              <Text style={styles.summaryTitle}>{copy.completion.summaryTitle}</Text>
            </Animated.View>

            <Animated.View entering={FadeIn.duration(500).delay(120)} style={[ui.glassCardV2, styles.statsCard]}>
              <Text style={styles.statsLabel}>이번 달 기록</Text>
              <Text style={styles.statsText}>
                {copy.completion.monthlyPrefix}{' '}
                <Text style={styles.statsHighlight}>{monthlyCount}</Text>
                {copy.completion.monthlySuffix}
              </Text>
            </Animated.View>

            <Animated.View entering={FadeIn.duration(500).delay(180)} style={[ui.glassCardV2, styles.aftercareCard]}>
              <Text style={styles.aftercareEyebrow}>{copy.completion.aftercare.eyebrow}</Text>
              <Text style={styles.aftercareTitle}>{copy.completion.aftercare.title}</Text>
              <View style={styles.aftercareList}>
                {copy.completion.aftercare.items.map((item) => (
                  <Text key={item} style={styles.aftercareItem}>
                    • {item}
                  </Text>
                ))}
              </View>
            </Animated.View>

            {(memoryNarrative || themeWeight !== null) && (
              <Animated.View entering={FadeIn.duration(500).delay(240)} style={[ui.glassCardV2, styles.memoryCard]}>
                <Text style={styles.memoryTitle}>{copy.completion.memoryTitle}</Text>
                <Text style={styles.memoryLine}>
                  {copy.completion.memoryLabels.snapshot}: {snapshotLine ?? `${recommendation.temperature.recommended}°C · ${recommendation.durationMinutes ?? '자유'}분 · ${toEnvironmentLabel(recommendation.environmentUsed)}`}
                </Text>
                {themeWeight !== null && recommendation.themeTitle ? (
                  <Text style={styles.memoryLine}>
                    {copy.completion.memoryLabels.weight}: {recommendation.themeTitle} {themeWeight}
                  </Text>
                ) : null}
                {memoryNarrative ? (
                  <Text style={styles.memoryLine}>
                    {copy.completion.memoryLabels.recall}: {memoryNarrative}
                  </Text>
                ) : null}
              </Animated.View>
            )}

            <Animated.View entering={FadeIn.duration(500).delay(320)} style={styles.actionRow}>
              <Pressable
                style={[ui.secondaryButtonV2, styles.actionButton]}
                onPress={handleGoHistory}
              >
                <Text style={ui.secondaryButtonTextV2}>기록 보기</Text>
              </Pressable>
              <Pressable
                style={[ui.primaryButtonV2, styles.actionButton]}
                onPress={handleGoHome}
              >
                <Text style={ui.primaryButtonTextV2}>{copy.completion.homeCta}</Text>
              </Pressable>
            </Animated.View>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: V2_BG_BASE,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 1,
  },
  safeArea: {
    flex: 1,
  },
  softOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(1, 16, 17, 0.02)',
  },
  feedbackScroll: {
    flex: 1,
  },
  feedbackContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 34,
    gap: 18,
  },
  summaryScroll: {
    flex: 1,
  },
  summaryContent: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 28,
    gap: 18,
  },
  celebrationBadge: {
    alignSelf: 'center',
    minWidth: 96,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: V2_BORDER,
    backgroundColor: V2_ACCENT_SOFT,
    alignItems: 'center',
  },
  celebrationBadgeText: {
    fontSize: TYPE_SCALE.caption,
    color: V2_ACCENT,
    fontWeight: '700',
    letterSpacing: 0,
    fontVariant: ['tabular-nums'],
    fontFamily: luxuryFonts.mono,
  },
  headerBlock: {
    alignItems: 'center',
    gap: 10,
  },
  brandBlock: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  summaryHeaderBlock: {
    alignItems: 'flex-start',
    gap: 10,
  },
  mainMessage: {
    fontSize: 34,
    color: V2_TEXT_PRIMARY,
    textAlign: 'center',
    lineHeight: 44,
    fontFamily: luxuryFonts.display,
    letterSpacing: luxuryTracking.hero,
  },
  mainLead: {
    maxWidth: 320,
    fontSize: 15,
    color: V2_TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 23,
    fontFamily: luxuryFonts.sans,
  },
  summaryTitle: {
    fontSize: 24,
    color: V2_TEXT_PRIMARY,
    lineHeight: 32,
    fontFamily: luxuryFonts.display,
    letterSpacing: luxuryTracking.hero,
  },
  stepBadge: {
    alignSelf: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: V2_BORDER,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: V2_ACCENT_SOFT,
  },
  stepBadgeText: {
    fontSize: TYPE_SCALE.caption - 1,
    fontWeight: '700',
    color: V2_ACCENT,
    letterSpacing: 0,
    fontFamily: luxuryFonts.sans,
  },
  statsCard: {
    paddingVertical: 18,
    paddingHorizontal: 18,
    gap: 6,
  },
  statsLabel: {
    fontSize: TYPE_SCALE.caption - 1,
    fontWeight: '700',
    color: V2_TEXT_MUTED,
    letterSpacing: 0,
    fontFamily: luxuryFonts.sans,
  },
  statsText: {
    fontSize: 18,
    color: V2_TEXT_PRIMARY,
    lineHeight: 24,
    fontFamily: luxuryFonts.sans,
  },
  statsHighlight: {
    fontSize: 28,
    color: V2_ACCENT,
    fontFamily: luxuryFonts.display,
  },
  feedbackSection: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(148, 210, 191, 0.32)',
    backgroundColor: 'rgba(9, 37, 37, 0.68)',
    paddingVertical: 24,
    paddingHorizontal: 18,
    gap: 14,
  },
  feedbackTitle: {
    fontSize: 25,
    color: V2_TEXT_PRIMARY,
    textAlign: 'center',
    lineHeight: 34,
    fontFamily: luxuryFonts.display,
  },
  feedbackSubtitle: {
    fontSize: 14,
    color: V2_TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: luxuryFonts.sans,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 6,
  },
  feedbackButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 126,
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 210, 191, 0.3)',
    gap: 12,
  },
  feedbackButtonActive: {
    backgroundColor: 'rgba(148, 210, 191, 0.16)',
    borderColor: V2_ACCENT,
  },
  feedbackLabel: {
    fontSize: 17,
    color: V2_TEXT_SECONDARY,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  feedbackLabelActive: {
    color: V2_TEXT_PRIMARY,
  },
  privateNote: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148, 210, 191, 0.2)',
    backgroundColor: 'rgba(9, 37, 37, 0.46)',
    paddingHorizontal: 18,
    paddingVertical: 13,
    gap: 10,
  },
  privateNoteIcon: {
    color: V2_ACCENT,
    fontSize: 20,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  privateNoteText: {
    flex: 1,
    color: V2_TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: luxuryFonts.sans,
  },
  aftercareCard: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 8,
  },
  aftercareEyebrow: {
    fontSize: TYPE_SCALE.caption - 1,
    fontWeight: '700',
    color: V2_ACCENT,
    letterSpacing: 0,
    fontFamily: luxuryFonts.sans,
  },
  aftercareTitle: {
    fontSize: TYPE_SCALE.title,
    color: V2_TEXT_PRIMARY,
    lineHeight: 24,
    fontFamily: luxuryFonts.display,
  },
  aftercareList: {
    gap: 6,
  },
  aftercareItem: {
    fontSize: 13,
    color: V2_TEXT_SECONDARY,
    lineHeight: 19,
    fontFamily: luxuryFonts.sans,
  },
  memoryCard: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 6,
  },
  memoryTitle: {
    fontSize: TYPE_SCALE.title - 2,
    color: V2_TEXT_PRIMARY,
    letterSpacing: 0,
    textTransform: 'uppercase',
    fontFamily: luxuryFonts.sans,
  },
  memoryLine: {
    fontSize: 12,
    color: V2_TEXT_SECONDARY,
    lineHeight: 17,
    fontFamily: luxuryFonts.sans,
  },
  actionRow: {
    width: '100%',
    gap: 10,
  },
  actionButton: {
    width: '100%',
    ...Platform.select({
      web: {
        boxShadow: `0px 6px 16px ${V2_SHADOW}`,
      },
      default: {
        shadowColor: V2_SHADOW,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 16,
        elevation: 4,
      },
    }),
  },
});
