import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions, Image, Platform } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BathEnvironment,
  BathRecommendation,
  DailyTag,
  FallbackStrategy,
  HomeSuggestionRank,
  IntentCard,
  SubProtocolOption,
  ThemeId,
  TimeContext,
  UserProfile,
} from '@/src/engine/types';
import { generateCareRecommendation, generateTripRecommendation } from '@/src/engine/recommend';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { useHaptic } from '@/src/hooks/useHaptic';
import { loadHistory, saveRecommendation } from '@/src/storage/history';
import { upsertSessionRecord } from '@/src/storage/sessionLog';
import { loadLastEnvironment, saveLastEnvironment } from '@/src/storage/environment';
import { loadTripMemoryHistory } from '@/src/storage/memory';
import { SafetyWarning } from '@/src/components/SafetyWarning';
import {
  CATEGORY_CARD_EMOJI,
  TYPE_SCALE,
  V2_ACCENT,
  V2_BG_BASE,
  V2_BG_BOTTOM,
  V2_BG_TOP,
  V2_BORDER,
  V2_SURFACE,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
} from '@/src/data/colors';
import {
  RecommendationCardEventPayload,
  trackIntentCardClick,
  trackIntentCardImpression,
  trackRoutineStart,
  trackRoutineStartAfterSubprotocol,
  trackSubprotocolModalOpen,
  trackSubprotocolSelected,
} from '@/src/analytics/events';
import { PersistentDisclosure } from '@/src/components/PersistentDisclosure';
import { buildDisclosureLines } from '@/src/engine/disclosures';
import { SubProtocolPickerModal } from '@/src/components/SubProtocolPickerModal';
import {
  CARE_INTENT_CARDS,
  CARE_SUBPROTOCOL_OPTIONS,
  getEnvironmentFitLabel,
  getEnvironmentSubtitle,
  TRIP_INTENT_CARDS,
  TRIP_SUBPROTOCOL_OPTIONS,
} from '@/src/data/intents';
import { applySubProtocolOverrides } from '@/src/engine/subprotocol';
import { inferFeelingBefore } from '@/src/engine/feeling';
import { buildHomeStreakSummary, HomeStreakSummary } from '@/src/engine/streaks';
import { copy } from '@/src/content/copy';
import { luxuryFonts, luxuryRadii, luxuryTracking } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';
import { HomeCarePreviewCard } from '@/src/components/HomeCarePreviewCard';
import { HomeTripEditorialCard } from '@/src/components/HomeTripEditorialCard';

const ENV_OPTIONS: { id: BathEnvironment; emoji: string; label: string }[] = [
  { id: 'bathtub', emoji: '🛁', label: '욕조' },
  { id: 'partial_bath', emoji: '🦶', label: '부분입욕' },
  { id: 'shower', emoji: '🚿', label: '샤워' },
];

const ENV_LABEL: Record<string, string> = {
  bathtub: '욕조',
  partial_bath: '부분입욕',
  shower: '샤워',
};

const TRIP_EDITORIAL_META: Record<string, { destination: string; accent: [string, string] }> = {
  kyoto_forest: { destination: 'JAPAN', accent: ['#274539', '#5E846F'] },
  nordic_sauna: { destination: 'FINLAND', accent: ['#4B3421', '#8B6540'] },
  rainy_camping: { destination: 'PACIFIC', accent: ['#19334A', '#4F7DA1'] },
  snow_cabin: { destination: 'ICELAND', accent: ['#22354E', '#7590AA'] },
};

const SCREEN_HORIZONTAL_PADDING = 22;
const SECTION_GAP = 22;
const CARD_GAP = 12;
const HOME_PREVIEW_CARD_LIMIT = 4;
const HOME_SECTION_ORDER: RecommendationCardEventPayload['section_order'] = 'care_first';

function getTimeContext(date = new Date()): TimeContext {
  const h = date.getHours();
  if (h >= 22 || h < 5) return 'late_night';
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 11 && h < 18) return 'day';
  return 'evening';
}

function normalizeEnvironmentInput(environment: BathEnvironment): 'bathtub' | 'partial_bath' | 'shower' {
  if (environment === 'footbath') return 'partial_bath';
  return environment;
}

function toEngineEnvironment(environment: BathEnvironment): BathEnvironment {
  if (environment === 'partial_bath') return 'footbath';
  return environment;
}

function buildRuntimeProfile(profile: UserProfile | null, environment: BathEnvironment): UserProfile {
  const now = new Date().toISOString();
  if (profile) return { ...profile, bathEnvironment: toEngineEnvironment(environment) };
  return {
    bathEnvironment: toEngineEnvironment(environment),
    healthConditions: ['none'],
    onboardingComplete: false,
    createdAt: now,
    updatedAt: now,
  };
}

function mapIntentToTags(intentId: string): DailyTag[] {
  switch (intentId) {
    case 'muscle_relief': return ['muscle_pain'];
    case 'sleep_ready': return ['insomnia'];
    case 'hangover_relief': return ['hangover'];
    case 'edema_relief': return ['swelling'];
    default: return ['stress'];
  }
}

function mapIntentToTheme(intentId: string): ThemeId {
  switch (intentId) {
    case 'kyoto_forest':
    case 'nordic_sauna':
    case 'rainy_camping':
    case 'snow_cabin':
      return intentId;
    default:
      return 'kyoto_forest';
  }
}

function mapIntentToActiveState(intentId: string): RecommendationCardEventPayload['active_state'] {
  switch (intentId) {
    case 'sleep_ready': return 'cant_sleep';
    case 'hangover_relief': return 'want_reset';
    case 'muscle_relief':
    case 'edema_relief':
      return 'heavy';
    default:
      return 'low_mood';
  }
}

function mapCardPositionToRank(position: number): HomeSuggestionRank {
  if (position === 1) return 'primary';
  if (position === 2) return 'secondary_1';
  return 'secondary_2';
}

function hasHighRiskCondition(conditions: UserProfile['healthConditions']): boolean {
  return conditions.some((condition) => ['hypertension_heart', 'pregnant'].includes(condition));
}

function hasResetContraindication(conditions: UserProfile['healthConditions']): boolean {
  return conditions.some((condition) => ['hypertension_heart', 'pregnant', 'diabetes'].includes(condition));
}

function resolveFallback(intent: IntentCard, healthConditions: UserProfile['healthConditions']): FallbackStrategy {
  if (hasHighRiskCondition(healthConditions)) return 'SAFE_ROUTINE_ONLY';
  if (intent.intent_id === 'hangover_relief' && hasResetContraindication(healthConditions)) {
    return 'RESET_WITHOUT_COLD';
  }
  return 'none';
}

function buildHeadlineMessage(timeContext: TimeContext, recent: BathRecommendation[]): string {
  if (timeContext === 'late_night') return '오늘은 편안하게 마무리해보세요';
  const latest = recent[0];
  if (latest?.mode === 'trip') return '오늘은 무드 전환이 먼저예요';
  if (timeContext === 'day' || timeContext === 'evening') return '지금 컨디션에 맞는 루틴';
  return '오늘 아침, 가볍게 시작해요';
}

function modeFromIntent(intent: IntentCard): RecommendationCardEventPayload['mode_type'] {
  if (intent.domain === 'trip') return 'trip';
  return intent.mapped_mode;
}

function hasSafetyPriorityFallback(fallback: FallbackStrategy): boolean {
  return fallback === 'SAFE_ROUTINE_ONLY' || fallback === 'RESET_WITHOUT_COLD';
}

function getIntentTint(intentId: string): string {
  switch (intentId) {
    case 'muscle_relief': return '#7FB7C9';
    case 'sleep_ready': return '#8B7FD0';
    case 'hangover_relief': return '#C98C64';
    case 'edema_relief': return '#5E97B1';
    default: return '#7D94BA';
  }
}

function getWeekdayMarker(label: HomeStreakSummary['dailyCheck'][number]['weekdayLabel']): string {
  switch (label) {
    case 'Mon': return '월';
    case 'Tue': return '화';
    case 'Wed': return '수';
    case 'Thu': return '목';
    case 'Fri': return '금';
    case 'Sat': return '토';
    case 'Sun': return '일';
  }
}

export default function HomeIntentScreen() {
  const { profile } = useUserProfile();
  const haptic = useHaptic();
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [environment, setEnvironment] = useState<BathEnvironment>('bathtub');
  const [recentRoutines, setRecentRoutines] = useState<BathRecommendation[]>([]);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const [streakSummary, setStreakSummary] = useState<HomeStreakSummary>(buildHomeStreakSummary([]));
  const [warningVisible, setWarningVisible] = useState(false);
  const [pendingWarnings, setPendingWarnings] = useState<string[]>([]);
  const [pendingRecId, setPendingRecId] = useState<string | null>(null);
  const [pendingStartPayload, setPendingStartPayload] = useState<RecommendationCardEventPayload | null>(null);
  const [subModalVisible, setSubModalVisible] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<IntentCard | null>(null);
  const [selectedIntentPayload, setSelectedIntentPayload] = useState<RecommendationCardEventPayload | null>(null);

  const sessionIdRef = useRef(`session_${Date.now()}`);
  const timeContext = useMemo(() => getTimeContext(), []);

  useEffect(() => {
    loadLastEnvironment().then((saved) => {
      if (saved) {
        setEnvironment(normalizeEnvironmentInput(saved));
        return;
      }
      if (profile) {
        setEnvironment(normalizeEnvironmentInput(profile.bathEnvironment));
      }
    });

    setIsHistoryLoaded(false);
    Promise.all([loadHistory(), loadTripMemoryHistory()])
      .then(([history, memories]) => {
        setRecentRoutines(history.slice(0, 8));
        setStreakSummary(
          buildHomeStreakSummary(memories.map((memory) => memory.completionSnapshot.completedAt))
        );
      })
      .finally(() => setIsHistoryLoaded(true));
  }, [profile]);

  const headlineMessage = useMemo(
    () => buildHeadlineMessage(timeContext, recentRoutines),
    [recentRoutines, timeContext]
  );
  const normalizedEnvironment = normalizeEnvironmentInput(environment);
  const careCards = CARE_INTENT_CARDS.slice(0, HOME_PREVIEW_CARD_LIMIT);
  const tripCards = TRIP_INTENT_CARDS.slice(0, HOME_PREVIEW_CARD_LIMIT);
  const careCardWidth = (screenWidth - SCREEN_HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

  useFocusEffect(
    useCallback(() => {
    const appVersion = Constants.expoConfig?.version ?? 'unknown';
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const healthConditions = profile?.healthConditions ?? ['none'];

    [...careCards, ...tripCards].forEach((intent) => {
      const payload: RecommendationCardEventPayload = {
        user_id: profile?.createdAt ?? 'anonymous',
        session_id: sessionIdRef.current,
        app_version: appVersion,
        locale,
        time_context: timeContext,
        environment,
        partial_bath_subtype: environment === 'partial_bath' ? 'footbath' : null,
        active_state: mapIntentToActiveState(intent.intent_id),
        mode_type: modeFromIntent(intent),
        suggestion_id: intent.id,
        suggestion_rank: mapCardPositionToRank(intent.card_position),
        fallback_strategy_applied: resolveFallback(intent, healthConditions),
        experiment_id: 'none',
        variant: 'default',
        ts: new Date().toISOString(),
        engine_source: intent.domain,
        intent_id: intent.intent_id,
        intent_domain: intent.domain,
        section_order: HOME_SECTION_ORDER,
        card_position: intent.card_position,
      };
      trackIntentCardImpression(payload);
    });
    }, [careCards, environment, profile?.createdAt, profile?.healthConditions, timeContext, tripCards])
  );

  const disclosureLines = useMemo(() => {
    const healthConditions = profile?.healthConditions ?? ['none'];
    const fallback = hasHighRiskCondition(healthConditions) ? 'SAFE_ROUTINE_ONLY' as const : 'none' as const;
    const hasResetIntent = careCards.some((c) => c.mapped_mode === 'reset');
    return buildDisclosureLines({
      fallbackStrategy: fallback,
      selectedMode: hasResetIntent ? 'reset' : 'recovery',
      healthConditions,
    });
  }, [careCards, profile?.healthConditions]);

  const handleSelectEnvironment = (next: BathEnvironment) => {
    haptic.light();
    setEnvironment(next);
    saveLastEnvironment(next);
  };

  const handleOpenSubProtocol = (intent: IntentCard) => {
    const appVersion = Constants.expoConfig?.version ?? 'unknown';
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const healthConditions = profile?.healthConditions ?? ['none'];

    const payload: RecommendationCardEventPayload = {
      user_id: profile?.createdAt ?? 'anonymous',
      session_id: sessionIdRef.current,
      app_version: appVersion,
      locale,
      time_context: timeContext,
      environment,
      partial_bath_subtype: environment === 'partial_bath' ? 'footbath' : null,
      active_state: mapIntentToActiveState(intent.intent_id),
      mode_type: modeFromIntent(intent),
      suggestion_id: intent.id,
      suggestion_rank: mapCardPositionToRank(intent.card_position),
      fallback_strategy_applied: resolveFallback(intent, healthConditions),
      experiment_id: 'none',
      variant: 'default',
      ts: new Date().toISOString(),
      engine_source: intent.domain,
      intent_id: intent.intent_id,
      intent_domain: intent.domain,
      section_order: HOME_SECTION_ORDER,
      card_position: intent.card_position,
    };

    trackIntentCardClick(payload);
    trackSubprotocolModalOpen(payload);
    setSelectedIntent(intent);
    setSelectedIntentPayload(payload);
    setSubModalVisible(true);
  };

  const resolveSubOptions = (intent: IntentCard | null): SubProtocolOption[] => {
    if (!intent) return [];
    if (intent.domain === 'trip') return TRIP_SUBPROTOCOL_OPTIONS[intent.intent_id] ?? [];
    return CARE_SUBPROTOCOL_OPTIONS[intent.intent_id] ?? [];
  };

  const handleRouteWithSafety = (
    recommendation: BathRecommendation,
    startPayload: RecommendationCardEventPayload
  ) => {
    if (recommendation.safetyWarnings.length > 0) {
      setPendingWarnings(recommendation.safetyWarnings);
      setPendingRecId(recommendation.id);
      setPendingStartPayload(startPayload);
      setWarningVisible(true);
      return;
    }

    trackRoutineStart(startPayload);
    trackRoutineStartAfterSubprotocol(startPayload);
    router.push(`/result/recipe/${recommendation.id}`);
  };

  const handleSelectSubProtocol = async (option: SubProtocolOption) => {
    if (!selectedIntent || !selectedIntentPayload) return;

    haptic.medium();
    const runtimeProfile = buildRuntimeProfile(profile, environment);
    const baseRecommendation = selectedIntent.domain === 'trip'
      ? generateTripRecommendation(
          runtimeProfile,
          mapIntentToTheme(selectedIntent.intent_id),
          toEngineEnvironment(environment)
        )
      : generateCareRecommendation(
          runtimeProfile,
          mapIntentToTags(selectedIntent.intent_id),
          toEngineEnvironment(environment)
        );

    const recommendation = applySubProtocolOverrides(
      baseRecommendation,
      option,
      environment,
      selectedIntent.intent_id
    );

    await saveRecommendation(recommendation);
    await upsertSessionRecord({
      id: recommendation.id,
      date: recommendation.createdAt,
      mode: recommendation.mode,
      trip_name: recommendation.mode === 'trip' ? recommendation.themeTitle ?? null : null,
      temperature: recommendation.temperature.recommended,
      duration: recommendation.durationMinutes,
      user_feeling_before: inferFeelingBefore(recommendation.intentId, recommendation.mode),
      user_feeling_after: 3,
    });

    setSubModalVisible(false);
    setSelectedIntent(null);
    setSelectedIntentPayload(null);

    const payloadWithSub: RecommendationCardEventPayload = {
      ...selectedIntentPayload,
      subprotocol_id: option.id,
    };

    trackSubprotocolSelected(payloadWithSub);
    handleRouteWithSafety(recommendation, payloadWithSub);
  };

  const handleWarningDismiss = () => {
    setWarningVisible(false);
    if (pendingStartPayload) {
      trackRoutineStart(pendingStartPayload);
      trackRoutineStartAfterSubprotocol(pendingStartPayload);
      setPendingStartPayload(null);
    }
    if (pendingRecId) {
      router.push(`/result/recipe/${pendingRecId}`);
      setPendingRecId(null);
    }
  };

  return (
    <View style={[ui.screenShellV2, { paddingTop: insets.top }]}> 
      <LinearGradient colors={[V2_BG_TOP, V2_BG_BASE, V2_BG_BOTTOM]} style={StyleSheet.absoluteFillObject} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[ui.glassCardV2, styles.headerBlock]}>
          <View style={styles.heroGlow} />
          <View style={styles.brandRow}>
            <View style={styles.brandBadge}>
              <Image source={require('../../assets/images/brand/bath-symbol.png')} style={styles.brandIcon} resizeMode="contain" />
              <Text style={styles.brandText}>BATH SOMMELIER</Text>
            </View>
            <Text style={styles.brandKicker}>오늘 바로 해볼 수 있는 조용한 목욕 가이드를 전해드려요.</Text>
          </View>
          <Text style={styles.greeting}>{headlineMessage}</Text>
          <Text style={styles.subtitle}>오늘의 컨디션과 환경을 고르면, 집에서도 부담 없이 바로 시작할 수 있는 루틴을 보여드려요.</Text>
          {!isHistoryLoaded || recentRoutines.length > 0 ? null : (
            <Text style={styles.beginnerGuide}>{copy.home.beginnerGuide}</Text>
          )}
        </View>

        <View style={styles.weeklyCard}>
          <LinearGradient
            colors={['#54402D', '#433021', '#352416']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.weeklyGradient}
          >
            <View style={styles.weeklyGlowPrimary} />
            <View style={styles.weeklyGlowSecondary} />

            <View style={styles.weeklyTopRow}>
              <View>
                <Text style={styles.weeklyLabel}>이번주 루틴</Text>
                <View style={styles.weeklyStatusRow}>
                  <View style={[styles.weeklyStatusDot, streakSummary.todayDone && styles.weeklyStatusDotDone]} />
                  <Text style={styles.weeklyStatus}>{streakSummary.todayDone ? copy.home.todayDone : copy.home.todayPending}</Text>
                </View>
                <Text style={styles.weeklySummaryText}>이번주 {streakSummary.weeklyBathCount}회 진행</Text>
              </View>
              <Pressable style={styles.weeklyDetailButton} onPress={() => router.push('/(tabs)/history')}>
                <Text style={styles.weeklyDetailText}>기록 보기</Text>
              </Pressable>
            </View>

            <View style={styles.weekDotsRow}>
              {streakSummary.dailyCheck.map((item) => (
                <View key={item.dateKey} style={styles.weekDotItem}>
                  <View style={[styles.weekDot, item.done && styles.weekDotDone, item.isToday && styles.weekDotToday]}>
                    <Text style={[styles.weekDotText, item.done && styles.weekDotTextDone, item.isToday && styles.weekDotTextToday]}>
                      {getWeekdayMarker(item.weekdayLabel)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.weekMetricsRow}>
              <View style={styles.weekMetricBlock}>
                <Text style={styles.weekMetricEyebrow}>이번주 진행</Text>
                <Text style={styles.weekMetricValue}>{copy.home.weeklyCount(streakSummary.weeklyBathCount, streakSummary.weeklyGoal)}</Text>
              </View>
              <View style={styles.weekMetricDivider} />
              <View style={styles.weekMetricBlock}>
                <Text style={styles.weekMetricEyebrow}>연속 기록</Text>
                <Text style={styles.weekMetricValue}>{copy.home.dailyStreak(streakSummary.dailyStreakDays)} · {copy.home.weeklyStreak(streakSummary.weeklyStreakWeeks)}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View>
          <Text style={styles.sectionLabel}>타입 선택</Text>
          <View style={styles.environmentRow}>
            {ENV_OPTIONS.map((option) => (
              <Pressable
                key={option.id}
                style={[styles.envChip, environment === option.id && styles.envChipActive]}
                onPress={() => handleSelectEnvironment(option.id)}
              >
                <Text style={[styles.envText, environment === option.id && styles.envTextActive]} numberOfLines={1}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>케어 루틴</Text>
            <Pressable onPress={() => router.push('/(tabs)/care')}>
              <Text style={styles.moreText}>더보기</Text>
            </Pressable>
          </View>
          <View style={styles.careGrid}>
            {careCards.map((intent) => {
              const disabled = !intent.allowed_environments.includes(normalizedEnvironment);
              const fallback = resolveFallback(intent, profile?.healthConditions ?? ['none']);
              const safetyBadge = hasSafetyPriorityFallback(fallback) ? copy.home.safetyPriorityBadge : undefined;
              return (
                <HomeCarePreviewCard
                  key={intent.id}
                  title={intent.copy_title}
                  subtitle={getEnvironmentSubtitle(intent, normalizedEnvironment)}
                  emoji={CATEGORY_CARD_EMOJI[intent.intent_id] ?? '🛁'}
                  tint={getIntentTint(intent.intent_id)}
                  fitLabel={getEnvironmentFitLabel(intent, normalizedEnvironment)}
                  safetyBadge={safetyBadge}
                  disabled={disabled}
                  disabledText={copy.careCards.restrictedDisabled}
                  onPress={() => handleOpenSubProtocol(intent)}
                  width={careCardWidth}
                />
              );
            })}
          </View>
        </View>

        <View>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>트립 루틴</Text>
            <Pressable onPress={() => router.push('/(tabs)/trip')}>
              <Text style={styles.moreText}>더보기</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tripRow}>
            {tripCards.map((intent) => {
              const disabled = !intent.allowed_environments.includes(normalizedEnvironment);
              const fallback = resolveFallback(intent, profile?.healthConditions ?? ['none']);
              const safetyBadge = hasSafetyPriorityFallback(fallback) ? copy.home.safetyPriorityBadge : undefined;
              const meta = TRIP_EDITORIAL_META[intent.intent_id] ?? TRIP_EDITORIAL_META.kyoto_forest;
              return (
                <HomeTripEditorialCard
                  key={intent.id}
                  title={intent.copy_title}
                  subtitle={getEnvironmentSubtitle(intent, normalizedEnvironment)}
                  destination={meta.destination}
                  accent={meta.accent}
                  fitLabel={getEnvironmentFitLabel(intent, normalizedEnvironment)}
                  safetyBadge={safetyBadge}
                  disabled={disabled}
                  disabledText={copy.careCards.restrictedDisabled}
                  onPress={() => handleOpenSubProtocol(intent)}
                />
              );
            })}
          </ScrollView>
        </View>

        <View>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>최근 완료한 루틴</Text>
            <Pressable onPress={() => router.push('/(tabs)/history')}>
              <Text style={styles.moreText}>더보기</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentRow}>
            {recentRoutines.length === 0 ? (
              <View style={[ui.glassCardV2, styles.recentEmptyCard]}>
                <Text style={styles.recentEmptyText}>최근 기록이 아직 없어요</Text>
              </View>
            ) : recentRoutines.slice(0, 8).map((routine) => (
              <Pressable
                key={routine.id}
                style={[ui.glassCardV2, styles.recentCard]}
                onPress={() => router.push(`/result/recipe/${routine.id}`)}
              >
                <View style={styles.recentCardHeader}>
                  <View style={[styles.recentColorDot, { backgroundColor: routine.colorHex }]} />
                  <Text style={styles.recentMeta}>{routine.mode === 'trip' ? '트립' : '케어'}</Text>
                </View>
                <Text style={styles.recentTitle} numberOfLines={1}>{routine.themeTitle ?? '맞춤 케어'}</Text>
                <Text style={styles.recentSub} numberOfLines={2}>
                  {routine.temperature.recommended}°C · {routine.durationMinutes ?? 10}분 · {ENV_LABEL[normalizeEnvironmentInput(routine.environmentUsed)] ?? '욕조'}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <PersistentDisclosure style={styles.disclosureInline} lines={disclosureLines} variant="v2" />
      </ScrollView>

      <SafetyWarning
        visible={warningVisible}
        warnings={pendingWarnings}
        onDismiss={handleWarningDismiss}
        variant="v2"
      />

      <SubProtocolPickerModal
        visible={subModalVisible}
        title={selectedIntent?.copy_title ?? ''}
        domain={selectedIntent?.domain}
        options={resolveSubOptions(selectedIntent)}
        onClose={() => {
          setSubModalVisible(false);
          setSelectedIntent(null);
          setSelectedIntentPayload(null);
        }}
        onSelect={handleSelectSubProtocol}
        variant="v2"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: 14,
    paddingBottom: 32,
    gap: SECTION_GAP,
  },
  headerBlock: {
    gap: 12,
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 22,
    overflow: 'hidden',
    borderColor: 'rgba(176, 141, 87, 0.24)',
  },
  heroGlow: {
    position: 'absolute',
    top: -28,
    right: -22,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(176, 141, 87, 0.12)',
  },
  brandRow: {
    gap: 12,
    marginBottom: 2,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(245,240,232,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(176, 141, 87, 0.18)',
  },
  brandIcon: {
    width: 18,
    height: 20,
  },
  brandText: {
    color: V2_ACCENT,
    fontSize: TYPE_SCALE.caption,
    fontWeight: '800',
    letterSpacing: luxuryTracking.eyebrow,
    fontFamily: luxuryFonts.sans,
  },
  brandKicker: {
    color: V2_TEXT_MUTED,
    fontSize: TYPE_SCALE.caption,
    lineHeight: 18,
    fontFamily: luxuryFonts.sans,
  },
  greeting: {
    fontSize: TYPE_SCALE.headingLg + 4,
    color: V2_TEXT_PRIMARY,
    lineHeight: 40,
    fontFamily: luxuryFonts.display,
    letterSpacing: luxuryTracking.hero,
  },
  subtitle: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_SCALE.body + 1,
    lineHeight: 23,
    fontFamily: luxuryFonts.sans,
  },
  beginnerGuide: {
    marginTop: 2,
    color: V2_TEXT_MUTED,
    fontSize: TYPE_SCALE.caption,
    lineHeight: 18,
    fontFamily: luxuryFonts.sans,
  },
  weeklyCard: {
    borderRadius: luxuryRadii.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(176, 141, 87, 0.18)',
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 14px rgba(18, 11, 6, 0.18)',
      },
      default: {
        shadowColor: '#120B06',
        shadowOpacity: 0.18,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6,
      },
    }),
  },
  weeklyGradient: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    gap: 14,
  },
  weeklyGlowPrimary: {
    position: 'absolute',
    top: -24,
    left: -6,
    width: 142,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 210, 140, 0.12)',
  },
  weeklyGlowSecondary: {
    position: 'absolute',
    right: -28,
    bottom: -18,
    width: 136,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(120, 77, 40, 0.18)',
  },
  weeklyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  weeklyLabel: {
    color: '#D4B17A',
    fontSize: TYPE_SCALE.caption - 2,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: luxuryFonts.sans,
  },
  weeklyStatusRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weeklyStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(255, 243, 225, 0.36)',
  },
  weeklyStatusDotDone: {
    backgroundColor: '#E1B968',
  },
  weeklyStatus: {
    color: '#FFF3E1',
    fontSize: TYPE_SCALE.caption - 1,
    fontWeight: '700',
    lineHeight: 16,
    fontFamily: luxuryFonts.sans,
  },
  weeklySummaryText: {
    marginTop: 4,
    color: 'rgba(255, 236, 208, 0.56)',
    fontSize: TYPE_SCALE.caption - 2,
    fontWeight: '600',
    lineHeight: 14,
    fontFamily: luxuryFonts.sans,
  },
  weeklyDetailButton: {
    minHeight: 24,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#D8B05D',
    borderWidth: 1,
    borderColor: 'rgba(255, 241, 205, 0.08)',
  },
  weeklyDetailText: {
    color: '#4C3316',
    fontSize: TYPE_SCALE.caption - 2,
    fontWeight: '800',
    letterSpacing: 0.4,
    fontFamily: luxuryFonts.sans,
  },
  weekDotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekDotItem: {
    alignItems: 'center',
    minWidth: 24,
  },
  weekDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 236, 206, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 247, 232, 0.04)',
  },
  weekDotDone: {
    borderColor: '#E0B15E',
    backgroundColor: '#D8B05D',
  },
  weekDotToday: {
    borderColor: '#F3D7A4',
    transform: [{ scale: 1.04 }],
  },
  weekDotText: {
    color: 'rgba(255, 241, 218, 0.58)',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  weekDotTextDone: {
    color: '#4A3118',
  },
  weekDotTextToday: {
    color: '#FFF7EA',
  },
  weekMetricsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  weekMetricBlock: {
    flex: 1,
    gap: 3,
  },
  weekMetricDivider: {
    width: 1,
    alignSelf: 'stretch',
    marginHorizontal: 10,
    backgroundColor: 'rgba(255, 235, 203, 0.14)',
  },
  weekMetricEyebrow: {
    color: 'rgba(245, 224, 187, 0.44)',
    fontSize: TYPE_SCALE.caption - 2,
    fontWeight: '700',
    lineHeight: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    fontFamily: luxuryFonts.sans,
  },
  weekMetricValue: {
    color: '#FFF7EA',
    fontSize: TYPE_SCALE.caption - 1,
    fontWeight: '700',
    lineHeight: 16,
    fontFamily: luxuryFonts.sans,
  },
  sectionLabel: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.title,
    fontFamily: luxuryFonts.display,
    marginBottom: 12,
  },
  environmentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  envChip: {
    flex: 1,
    minHeight: 40,
    borderRadius: 999,
    backgroundColor: V2_SURFACE,
    borderWidth: 1,
    borderColor: V2_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 9,
  },
  envChipActive: {
    backgroundColor: 'rgba(201, 164, 91, 0.18)',
    borderColor: V2_ACCENT,
  },
  envText: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_SCALE.caption,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  envTextActive: {
    color: V2_ACCENT,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.title,
    fontFamily: luxuryFonts.display,
  },
  moreText: {
    color: V2_ACCENT,
    fontSize: TYPE_SCALE.caption,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  careGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: CARD_GAP,
    rowGap: CARD_GAP,
  },
  tripRow: {
    gap: 12,
    paddingRight: 8,
  },
  recentRow: {
    gap: 12,
    paddingRight: 8,
  },
  recentCard: {
    width: 172,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 8,
    minHeight: 112,
  },
  recentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recentColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  recentMeta: {
    color: V2_TEXT_MUTED,
    fontSize: TYPE_SCALE.caption - 1,
    fontWeight: '800',
    letterSpacing: 0.8,
    fontFamily: luxuryFonts.sans,
  },
  recentTitle: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.title - 1,
    lineHeight: 22,
    fontFamily: luxuryFonts.display,
  },
  recentSub: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_SCALE.caption,
    lineHeight: 17,
    fontFamily: luxuryFonts.sans,
  },
  recentEmptyCard: {
    width: 220,
    paddingHorizontal: 16,
    paddingVertical: 18,
    minHeight: 112,
    justifyContent: 'center',
  },
  recentEmptyText: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_SCALE.body,
    lineHeight: 20,
    fontFamily: luxuryFonts.sans,
  },
  disclosureInline: {
    marginTop: -2,
  },
});
