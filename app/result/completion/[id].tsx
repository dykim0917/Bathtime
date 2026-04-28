import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  ScrollView,
  Share,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { BathFeedback, BathRecommendation } from '@/src/engine/types';
import { BrandMark } from '@/src/components/BrandMark';
import { getRecommendationById, updateRecommendationFeedback } from '@/src/storage/history';
import { clearSession, loadSession } from '@/src/storage/session';
import { patchSessionRecord } from '@/src/storage/sessionLog';
import {
  applyFeedbackToThemePreference,
  getMonthlyCompletionCount,
  saveCompletionMemory,
  updateCompletionMemoryFeedback,
} from '@/src/storage/memory';
import { mapFeedbackToFeelingAfter } from '@/src/engine/feeling';
import { copy } from '@/src/content/copy';
import {
  TYPE_SCALE,
  V2_ACCENT,
  V2_ACCENT_SOFT,
  V2_ACCENT_TEXT,
  V2_BG_BASE,
  V2_BORDER,
  V2_SHADOW,
  V2_SURFACE,
  V2_SURFACE_SOFT,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
} from '@/src/data/colors';
import { luxuryFonts, luxuryTracking } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';

const RESULT_BACKGROUND = require('../../../assets/images/result_background.jpg');

type SummaryMetric = {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  value: string;
};

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

function toDurationLabel(durationMinutes: number | null): string {
  return durationMinutes === null ? '시간 자유' : `${durationMinutes}분`;
}

function toCompletedTimeLabel(completedAt: string | null): string {
  const date = completedAt ? new Date(completedAt) : new Date();
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

export default function CompletionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recommendation, setRecommendation] = useState<BathRecommendation | null>(null);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [feedback, setFeedback] = useState<BathFeedback>(null);
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [actualDurationMinutes, setActualDurationMinutes] = useState<number | null>(null);
  const [completionId, setCompletionId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    getRecommendationById(id).then(async (rec) => {
      if (!rec) return;
      setRecommendation(rec);
      setFeedback(rec.feedback ?? null);

      const session = await loadSession();
      const durationMinutes =
        session?.recommendationId === id && session.actualDurationSeconds !== undefined
          ? Math.max(1, Math.round(session.actualDurationSeconds / 60))
          : rec.durationMinutes;
      const completionTime =
        session?.recommendationId === id && session.completedAt
          ? session.completedAt
          : rec.createdAt;

      const memory = await saveCompletionMemory(rec, rec.feedback ?? null, {
        completedAt:
          session?.recommendationId === id && session.completedAt
            ? session.completedAt
            : undefined,
        durationMinutes,
      });

      await patchSessionRecord(id, {
        date: completionTime,
        duration: durationMinutes,
      });

      setActualDurationMinutes(memory.completionSnapshot.durationMinutes);
      setCompletedAt(memory.completionSnapshot.completedAt);
      setCompletionId(memory.completionId);
    });

    const now = new Date();
    getMonthlyCompletionCount(now.getFullYear(), now.getMonth() + 1).then(setMonthlyCount);
  }, [id]);

  const handleFeedback = async (value: Exclude<BathFeedback, null>) => {
    if (!id || feedback === value) return;
    setFeedback(value);
    await updateRecommendationFeedback(id, value);
    await patchSessionRecord(id, {
      user_feeling_after: mapFeedbackToFeelingAfter(value),
    });
    if (completionId) {
      await updateCompletionMemoryFeedback(completionId, value);
    }
    if (recommendation?.themeId) {
      await applyFeedbackToThemePreference(recommendation.themeId, value);
    }
  };

  const handleShare = async () => {
    if (!recommendation) return;
    if (Platform.OS === 'web') return;
    const duration = toDurationLabel(actualDurationMinutes ?? recommendation.durationMinutes);
    const environment = toEnvironmentLabel(recommendation.environmentUsed);
    await Share.share({
      title: copy.completion.shareSheetTitle,
      message: `오늘 바스타임 완료: ${environment}에서 ${duration} 루틴을 마쳤어요.`,
    });
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

  const durationLabel = toDurationLabel(actualDurationMinutes ?? recommendation.durationMinutes);
  const environmentLabel = toEnvironmentLabel(recommendation.environmentUsed);
  const completedTimeLabel = toCompletedTimeLabel(completedAt);
  const narrative = `${environmentLabel}에서 ${durationLabel} 루틴을 완료했어요.`;
  const metrics: SummaryMetric[] = [
    { icon: 'thermometer-half', label: '온도', value: `${recommendation.temperature.recommended}°C` },
    { icon: 'clock-o', label: '시간', value: durationLabel },
    { icon: 'bath', label: '방식', value: environmentLabel },
    { icon: 'check-circle-o', label: '완료', value: completedTimeLabel },
  ];

  return (
    <View style={styles.container}>
      <Image
        source={RESULT_BACKGROUND}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(5, 20, 21, 0.12)', 'rgba(5, 20, 21, 0.34)', 'rgba(7, 25, 27, 0.74)']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.mistOne} />
      <View style={styles.mistTwo} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeIn.duration(420)} style={styles.header}>
            <BrandMark size={58} />
            <View style={styles.titleRow}>
              <Text style={styles.title}>{copy.completion.summaryTitle}</Text>
              <FontAwesome name="magic" size={20} color={V2_ACCENT} />
            </View>
          </Animated.View>

          <Animated.View entering={FadeIn.duration(420).delay(80)} style={[styles.card, styles.monthlyCard]}>
            <Text style={styles.cardEyebrow}>{copy.completion.monthlyLabel}</Text>
            <Text style={styles.monthlyText}>
              {copy.completion.monthlyPrefix}{' '}
              <Text style={styles.monthlyCount}>{monthlyCount}</Text>
              {copy.completion.monthlySuffix}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeIn.duration(420).delay(140)} style={[styles.card, styles.summaryCard]}>
            <Text style={styles.cardTitle}>{copy.completion.memoryTitle}</Text>
            <View style={styles.metricGrid}>
              {metrics.map((metric, index) => (
                <View
                  key={metric.label}
                  style={[
                    styles.metricItem,
                    index < metrics.length - 1 && styles.metricDivider,
                  ]}
                >
                  <FontAwesome name={metric.icon} size={25} color={V2_ACCENT} />
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                  <Text style={styles.metricValue}>{metric.value}</Text>
                </View>
              ))}
            </View>
            <View style={styles.recordLine}>
              <FontAwesome name="file-text-o" size={18} color={V2_ACCENT} />
              <Text style={styles.recordText}>
                {copy.completion.memoryLabels.recall} · {narrative}
              </Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeIn.duration(420).delay(200)}>
            <Pressable style={styles.shareButton} onPress={handleShare}>
              <FontAwesome name="share-square-o" size={23} color={V2_ACCENT_TEXT} />
              <Text style={styles.shareButtonText}>{copy.completion.shareCta}</Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeIn.duration(420).delay(260)} style={[styles.card, styles.aftercareCard]}>
            <View style={styles.aftercareCopy}>
              <Text style={styles.aftercareTitle}>{copy.completion.aftercare.title}</Text>
              <View style={styles.aftercareList}>
                {copy.completion.aftercare.items.map((item) => (
                  <View key={item} style={styles.aftercareItemRow}>
                    <Text style={styles.aftercareBullet}>•</Text>
                    <Text style={styles.aftercareItem}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.waterGlass}>
              <FontAwesome name="tint" size={42} color={V2_ACCENT} />
            </View>
          </Animated.View>

          <Animated.View entering={FadeIn.duration(420).delay(320)} style={[styles.card, styles.feedbackCard]}>
            <View style={styles.feedbackQuestion}>
              <FontAwesome name="heart-o" size={28} color={V2_ACCENT} />
              <Text style={styles.feedbackTitle}>{copy.completion.feedbackQuestion}</Text>
            </View>
            <View style={styles.feedbackButtons}>
              <Pressable
                style={[
                  styles.feedbackButton,
                  feedback === 'good' && styles.feedbackButtonActive,
                ]}
                onPress={() => handleFeedback('good')}
              >
                <FontAwesome
                  name="smile-o"
                  size={20}
                  color={feedback === 'good' ? V2_ACCENT_TEXT : V2_TEXT_PRIMARY}
                />
                <Text style={[styles.feedbackButtonText, feedback === 'good' && styles.feedbackButtonTextActive]}>
                  {copy.completion.feedback.good}
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.feedbackButton,
                  feedback === 'bad' && styles.feedbackButtonActive,
                ]}
                onPress={() => handleFeedback('bad')}
              >
                <FontAwesome
                  name="frown-o"
                  size={20}
                  color={feedback === 'bad' ? V2_ACCENT_TEXT : V2_TEXT_PRIMARY}
                />
                <Text style={[styles.feedbackButtonText, feedback === 'bad' && styles.feedbackButtonTextActive]}>
                  {copy.completion.feedback.bad}
                </Text>
              </Pressable>
            </View>
          </Animated.View>

          <Animated.View entering={FadeIn.duration(420).delay(380)} style={styles.actionRow}>
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
              <FontAwesome name="home" size={20} color={V2_ACCENT_TEXT} />
              <Text style={ui.primaryButtonTextV2}>{copy.completion.homeCta}</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
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
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 1,
  },
  mistOne: {
    position: 'absolute',
    top: 86,
    left: -72,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(148, 210, 191, 0.08)',
  },
  mistTwo: {
    position: 'absolute',
    right: -80,
    bottom: 180,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(148, 210, 191, 0.06)',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 30,
    gap: 16,
  },
  header: {
    alignItems: 'center',
    gap: 18,
    paddingTop: 6,
    paddingBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  title: {
    fontSize: 34,
    color: V2_TEXT_PRIMARY,
    lineHeight: 42,
    textAlign: 'center',
    fontFamily: luxuryFonts.display,
    letterSpacing: luxuryTracking.hero,
  },
  card: {
    backgroundColor: V2_SURFACE,
    borderWidth: 1,
    borderColor: V2_BORDER,
    borderRadius: 24,
    ...Platform.select({
      web: {
        boxShadow: `0px 16px 32px ${V2_SHADOW}`,
      },
      default: {
        shadowColor: V2_SHADOW,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 1,
        shadowRadius: 24,
        elevation: 7,
      },
    }),
  },
  monthlyCard: {
    paddingVertical: 22,
    paddingHorizontal: 20,
    gap: 8,
  },
  cardEyebrow: {
    fontSize: TYPE_SCALE.caption,
    color: V2_TEXT_MUTED,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  monthlyText: {
    fontSize: 20,
    color: V2_TEXT_PRIMARY,
    lineHeight: 28,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  monthlyCount: {
    fontSize: 34,
    color: V2_ACCENT,
    fontFamily: luxuryFonts.display,
  },
  summaryCard: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 18,
  },
  cardTitle: {
    fontSize: TYPE_SCALE.title,
    color: V2_TEXT_SECONDARY,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  metricGrid: {
    flexDirection: 'row',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 6,
  },
  metricDivider: {
    borderRightWidth: 1,
    borderRightColor: V2_BORDER,
  },
  metricLabel: {
    fontSize: TYPE_SCALE.caption,
    color: V2_TEXT_MUTED,
    fontFamily: luxuryFonts.sans,
    textAlign: 'center',
  },
  metricValue: {
    width: '100%',
    fontSize: 17,
    color: V2_TEXT_PRIMARY,
    lineHeight: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    fontFamily: luxuryFonts.sans,
    textAlign: 'center',
  },
  recordLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: V2_BORDER,
    paddingTop: 15,
  },
  recordText: {
    flex: 1,
    fontSize: 13,
    color: V2_TEXT_SECONDARY,
    lineHeight: 19,
    fontFamily: luxuryFonts.sans,
  },
  shareButton: {
    minHeight: 58,
    borderRadius: 22,
    backgroundColor: V2_ACCENT,
    borderWidth: 1,
    borderColor: V2_ACCENT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    ...Platform.select({
      web: {
        boxShadow: `0px 10px 24px ${V2_SHADOW}`,
      },
      default: {
        shadowColor: V2_SHADOW,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 18,
        elevation: 6,
      },
    }),
  },
  shareButtonText: {
    color: V2_ACCENT_TEXT,
    fontSize: 18,
    fontWeight: '800',
    fontFamily: luxuryFonts.sans,
  },
  aftercareCard: {
    minHeight: 164,
    padding: 20,
    flexDirection: 'row',
    gap: 14,
  },
  aftercareCopy: {
    flex: 1,
    gap: 12,
  },
  aftercareTitle: {
    fontSize: TYPE_SCALE.title,
    color: V2_ACCENT,
    lineHeight: 24,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  aftercareList: {
    gap: 8,
  },
  aftercareItemRow: {
    flexDirection: 'row',
    gap: 8,
  },
  aftercareBullet: {
    color: V2_ACCENT,
    fontSize: 16,
    lineHeight: 21,
    fontFamily: luxuryFonts.sans,
  },
  aftercareItem: {
    flex: 1,
    fontSize: 13,
    color: V2_TEXT_SECONDARY,
    lineHeight: 21,
    fontFamily: luxuryFonts.sans,
  },
  waterGlass: {
    width: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: V2_SURFACE_SOFT,
    borderWidth: 1,
    borderColor: V2_BORDER,
  },
  feedbackCard: {
    paddingVertical: 18,
    paddingHorizontal: 18,
    gap: 16,
  },
  feedbackQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  feedbackTitle: {
    flex: 1,
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.title,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  feedbackButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: V2_BORDER,
    backgroundColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 10,
  },
  feedbackButtonActive: {
    backgroundColor: V2_ACCENT,
    borderColor: V2_ACCENT,
  },
  feedbackButtonText: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.body,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  feedbackButtonTextActive: {
    color: V2_ACCENT_TEXT,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minHeight: 58,
    flexDirection: 'row',
    gap: 9,
  },
});
