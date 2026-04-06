import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, BounceIn } from 'react-native-reanimated';
import { BathRecommendation, BathFeedback } from '@/src/engine/types';
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
  V2_ACCENT_TEXT,
  V2_BG_BASE,
  V2_BG_BOTTOM,
  V2_BG_OVERLAY,
  V2_BG_TOP,
  V2_BORDER,
  V2_SHADOW,
  V2_SURFACE,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
} from '@/src/data/colors';
import { ui } from '@/src/theme/ui';

function toEnvironmentLabel(environment: string): string {
  switch (environment) {
    case 'bathtub':
      return '욕조';
    case 'partial_bath':
    case 'footbath':
      return '부분입욕';
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

  useEffect(() => {
    if (!id) return;

    getRecommendationById(id).then(async (rec) => {
      if (!rec) return;
      setRecommendation(rec);
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
      <LinearGradient colors={[V2_BG_TOP, V2_BG_BASE, V2_BG_BOTTOM]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.softOverlay} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.Text entering={BounceIn.duration(800)} style={styles.celebrationEmoji}>
            🎉
          </Animated.Text>

          <Animated.View entering={FadeIn.duration(600).delay(200)} style={styles.headerBlock}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>{copy.routine.stepFinish}</Text>
            </View>
            <Text style={styles.mainMessage}>{timeMessage}</Text>
          </Animated.View>

          <Animated.View entering={FadeIn.duration(600).delay(350)} style={[ui.glassCardV2, styles.statsCard]}>
            <Text style={styles.statsLabel}>MONTHLY COUNT</Text>
            <Text style={styles.statsText}>
              {copy.completion.monthlyPrefix}{' '}
              <Text style={styles.statsHighlight}>{monthlyCount}</Text>
              {copy.completion.monthlySuffix}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeIn.duration(600).delay(500)} style={[ui.glassCardV2, styles.feedbackSection]}>
            <Text style={styles.feedbackTitle}>{feedbackTitle}</Text>
            <View style={styles.feedbackButtons}>
              <TouchableOpacity
                style={[
                  styles.feedbackButton,
                  feedback === 'good' && styles.feedbackButtonActive,
                ]}
                onPress={() => handleFeedback('good')}
                activeOpacity={0.8}
                disabled={feedback !== null}
              >
                <Text style={styles.feedbackEmoji}>👍</Text>
                <Text style={[styles.feedbackLabel, feedback === 'good' && styles.feedbackLabelActive]}>
                  {copy.completion.feedback.good}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.feedbackButton,
                  feedback === 'bad' && styles.feedbackButtonActive,
                ]}
                onPress={() => handleFeedback('bad')}
                activeOpacity={0.8}
                disabled={feedback !== null}
              >
                <Text style={styles.feedbackEmoji}>👎</Text>
                <Text style={[styles.feedbackLabel, feedback === 'bad' && styles.feedbackLabelActive]}>
                  {copy.completion.feedback.bad}
                </Text>
              </TouchableOpacity>
            </View>
            {feedback && (
              <Animated.Text entering={FadeIn.duration(300)} style={styles.feedbackThanks}>
                {copy.completion.feedback.thanks}
              </Animated.Text>
            )}
          </Animated.View>

          {(memoryNarrative || themeWeight !== null) && (
            <Animated.View entering={FadeIn.duration(600).delay(650)} style={[ui.glassCardV2, styles.memoryCard]}>
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

          <Animated.View entering={FadeIn.duration(500).delay(800)} style={styles.actionRow}>
            <TouchableOpacity
              style={[ui.secondaryButtonV2, styles.actionButton]}
              onPress={handleGoHistory}
              activeOpacity={0.85}
            >
              <Text style={ui.secondaryButtonTextV2}>기록 보기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[ui.primaryButtonV2, styles.actionButton]}
              onPress={handleGoHome}
              activeOpacity={0.85}
            >
              <Text style={ui.primaryButtonTextV2}>{copy.completion.homeCta}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
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
  safeArea: {
    flex: 1,
  },
  softOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: V2_BG_OVERLAY,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 24,
    gap: 18,
  },
  celebrationEmoji: {
    fontSize: 72,
    textAlign: 'center',
  },
  headerBlock: {
    alignItems: 'center',
    gap: 10,
  },
  mainMessage: {
    fontSize: 22,
    fontWeight: '700',
    color: V2_TEXT_PRIMARY,
    textAlign: 'center',
    lineHeight: 30,
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
    letterSpacing: 1,
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
    letterSpacing: 1,
  },
  statsText: {
    fontSize: 18,
    color: V2_TEXT_PRIMARY,
    lineHeight: 24,
  },
  statsHighlight: {
    fontWeight: '800',
    fontSize: 28,
    color: V2_ACCENT,
  },
  feedbackSection: {
    padding: 18,
    gap: 14,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: V2_TEXT_PRIMARY,
    textAlign: 'center',
    lineHeight: 22,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  feedbackButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: V2_BORDER,
  },
  feedbackButtonActive: {
    backgroundColor: V2_ACCENT,
    borderColor: V2_ACCENT,
  },
  feedbackEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  feedbackLabel: {
    fontSize: 13,
    color: V2_TEXT_SECONDARY,
    fontWeight: '700',
  },
  feedbackLabelActive: {
    color: V2_ACCENT_TEXT,
  },
  feedbackThanks: {
    fontSize: 14,
    color: V2_TEXT_MUTED,
    textAlign: 'center',
  },
  memoryCard: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 6,
  },
  memoryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: V2_TEXT_PRIMARY,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  memoryLine: {
    fontSize: 12,
    color: V2_TEXT_SECONDARY,
    lineHeight: 17,
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
