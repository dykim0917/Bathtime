import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions, Platform, Image } from 'react-native';
import { Href, router, useFocusEffect } from 'expo-router';
import Constants from 'expo-constants';
import { FontAwesome } from '@expo/vector-icons';
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
import {
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
  getCareCardSafetyBadge,
  getEnvironmentFitLabel,
  getEnvironmentUnavailableReason,
  getEnvironmentSubtitle,
  TRIP_INTENT_CARDS,
  pickAutoTripSubProtocol,
} from '@/src/data/intents';
import { applySubProtocolOverrides } from '@/src/engine/subprotocol';
import { inferFeelingBefore } from '@/src/engine/feeling';
import { buildHomeStreakSummary, HomeStreakSummary } from '@/src/engine/streaks';
import { copy } from '@/src/content/copy';
import { luxuryFonts, luxuryRadii, luxuryTracking } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';
import { HomeCareHeroCard } from '@/src/components/HomeCareHeroCard';
import { HomeCareListCard } from '@/src/components/HomeCareListCard';
import { HomeTripEditorialCard } from '@/src/components/HomeTripEditorialCard';
import { OpenTabHeader } from '@/src/components/OpenTabHeader';
import { HOME_CARE_HERO_IMAGE, HOME_HEADER_ILLUSTRATION } from '@/src/data/homeVisuals';
import { CustomIconName } from '@/src/components/CustomIcon';
import { getCareCardImageForEnvironment } from '@/src/data/careImages';
import {
  getImageVariantForEnvironment,
  resolveIntentImageEnvironment,
} from '@/src/data/routineImageVariants';

const ENV_OPTIONS: { id: BathEnvironment; label: string }[] = [
  { id: 'bathtub', label: '욕조' },
  { id: 'partial_bath', label: '부분입욕' },
  { id: 'shower', label: '샤워' },
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
const SECTION_GAP = 30;
const HOME_PREVIEW_CARD_LIMIT = 4;
const HOME_SECTION_ORDER: RecommendationCardEventPayload['section_order'] = 'care_first';

interface CareVisualMeta {
  accent: [string, string];
}

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
    case 'rainy_camping':
    case 'nordic_sauna':
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

const HOME_CARE_VISUAL_META: Record<string, CareVisualMeta> = {
  muscle_relief: {
    accent: ['#7D6656', '#C6AB96'],
  },
  sleep_ready: {
    accent: ['#193259', '#6178B9'],
  },
  hangover_relief: {
    accent: ['#84501D', '#D7A052'],
  },
  edema_relief: {
    accent: ['#526D87', '#B7CBDD'],
  },
  cold_relief: {
    accent: ['#4E6B79', '#9FC4CF'],
  },
  menstrual_relief: {
    accent: ['#7C5968', '#C89DAF'],
  },
  stress_relief: {
    accent: ['#4B6651', '#89AF8C'],
  },
  mood_lift: {
    accent: ['#715F35', '#D0B36B'],
  },
};

function modeFromIntent(intent: IntentCard): RecommendationCardEventPayload['mode_type'] {
  if (intent.domain === 'trip') return 'trip';
  return intent.mapped_mode;
}

function hasSafetyPriorityFallback(fallback: FallbackStrategy): boolean {
  return fallback === 'SAFE_ROUTINE_ONLY' || fallback === 'RESET_WITHOUT_COLD';
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

function isIntentAvailable(intent: IntentCard, environment: BathEnvironment): boolean {
  return intent.allowed_environments.includes(environment as 'bathtub' | 'partial_bath' | 'shower');
}

function selectHomeCareCards(
  cards: IntentCard[],
  environment: BathEnvironment,
  timeContext: TimeContext
): { heroCard: IntentCard; listCards: IntentCard[] } {
  const ordered = [...cards];

  if (timeContext === 'late_night') {
    const sleepIndex = ordered.findIndex((card) => card.intent_id === 'sleep_ready' && isIntentAvailable(card, environment));
    if (sleepIndex > 0) {
      const [sleepCard] = ordered.splice(sleepIndex, 1);
      ordered.unshift(sleepCard);
    }
  }

  const heroCard = ordered.find((card) => isIntentAvailable(card, environment)) ?? ordered[0];
  const listCards = ordered.filter((card) => card.id !== heroCard.id).slice(0, HOME_PREVIEW_CARD_LIMIT - 1);

  return { heroCard, listCards };
}

function buildCarePreviewRecommendation(
  intent: IntentCard,
  profile: UserProfile | null,
  environment: BathEnvironment
): BathRecommendation {
  const runtimeProfile = buildRuntimeProfile(profile, environment);
  const baseRecommendation = generateCareRecommendation(
    runtimeProfile,
    mapIntentToTags(intent.intent_id),
    toEngineEnvironment(environment),
    intent.intent_id
  );
  const defaultOption = (CARE_SUBPROTOCOL_OPTIONS[intent.intent_id] ?? []).find(
    (option) => option.id === intent.default_subprotocol_id || option.is_default
  );

  if (!defaultOption) return baseRecommendation;

  return applySubProtocolOverrides(
    baseRecommendation,
    defaultOption,
    environment,
    intent.intent_id
  );
}

function getCareVisualMeta(intentId: string): CareVisualMeta {
  return HOME_CARE_VISUAL_META[intentId] ?? {
    accent: ['#5D708A', '#99AEC5'],
  };
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

  const normalizedEnvironment = normalizeEnvironmentInput(environment);
  const careCards = CARE_INTENT_CARDS.slice(0, HOME_PREVIEW_CARD_LIMIT);
  const tripCards = TRIP_INTENT_CARDS.slice(0, HOME_PREVIEW_CARD_LIMIT);
  const tripCardWidth = Math.max(
    236,
    Math.min(screenWidth - SCREEN_HORIZONTAL_PADDING * 2 - 22, 292)
  );
  const weeklyProgressRatio = streakSummary.weeklyGoal > 0
    ? Math.min(streakSummary.weeklyBathCount / streakSummary.weeklyGoal, 1)
    : 0;
  const { heroCard, listCards } = useMemo(
    () => selectHomeCareCards(careCards, normalizedEnvironment, timeContext),
    [careCards, normalizedEnvironment, timeContext]
  );

  const heroTitle = heroCard?.copy_title ?? '오늘의 케어 루틴';
  const heroDescription = heroCard
    ? getEnvironmentSubtitle(heroCard, normalizedEnvironment, profile?.healthConditions ?? ['none'])
    : '오늘의 환경에 맞는 케어 루틴을 보여드려요.';
  const heroVisual = useMemo(
    () => getCareVisualMeta(heroCard?.intent_id ?? ''),
    [heroCard?.intent_id]
  );
  const heroPreviewRecommendation = useMemo(() => {
    if (!heroCard) return null;
    return buildCarePreviewRecommendation(heroCard, profile, environment);
  }, [environment, heroCard, profile]);
  const listPreviewById = useMemo(
    () => Object.fromEntries(
      listCards.map((intent) => [intent.id, buildCarePreviewRecommendation(intent, profile, environment)])
    ),
    [environment, listCards, profile]
  );

  const buildIntentPayload = useCallback((intent: IntentCard): RecommendationCardEventPayload => {
    const appVersion = Constants.expoConfig?.version ?? 'unknown';
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const healthConditions = profile?.healthConditions ?? ['none'];

    return {
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
  }, [environment, profile?.createdAt, profile?.healthConditions, timeContext]);

  useFocusEffect(
    useCallback(() => {
      [...careCards, ...tripCards].forEach((intent) => {
        trackIntentCardImpression(buildIntentPayload(intent));
      });
    }, [buildIntentPayload, careCards, tripCards])
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

  const handleOpenCareSubProtocol = (intent: IntentCard) => {
    const payload = buildIntentPayload(intent);
    trackIntentCardClick(payload);
    trackSubprotocolModalOpen(payload);
    setSelectedIntent(intent);
    setSelectedIntentPayload(payload);
    setSubModalVisible(true);
  };

  const resolveSubOptions = (intent: IntentCard | null): SubProtocolOption[] => {
    if (!intent) return [];
    return CARE_SUBPROTOCOL_OPTIONS[intent.intent_id] ?? [];
  };

  const handleRouteToRecipe = (
    recommendation: BathRecommendation,
    startPayload: RecommendationCardEventPayload,
    route: Href
  ) => {
    trackRoutineStart(startPayload);
    trackRoutineStartAfterSubprotocol(startPayload);
    router.push(route);
  };

  const handleStartTripIntent = async (intent: IntentCard) => {
    const payload = buildIntentPayload(intent);

    trackIntentCardClick(payload);
    haptic.medium();

    const runtimeProfile = buildRuntimeProfile(profile, environment);
    const baseRecommendation = generateTripRecommendation(
      runtimeProfile,
      mapIntentToTheme(intent.intent_id),
      toEngineEnvironment(environment)
    );
    const option = pickAutoTripSubProtocol(intent.intent_id, normalizedEnvironment);
    const recommendation = option
      ? applySubProtocolOverrides(baseRecommendation, option, environment, intent.intent_id)
      : baseRecommendation;

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

    const payloadWithSub: RecommendationCardEventPayload = {
      ...payload,
      subprotocol_id: option?.id,
    };

    trackSubprotocolSelected(payloadWithSub);
    handleRouteToRecipe(
      recommendation,
      payloadWithSub,
      `/result/recipe/${recommendation.id}?source=trip` as Href
    );
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
    handleRouteToRecipe(
      recommendation,
      payloadWithSub,
      `/result/recipe/${recommendation.id}` as Href
    );
  };

  return (
    <View style={[ui.screenShellV2, { paddingTop: insets.top }]}> 
      <LinearGradient colors={[V2_BG_TOP, V2_BG_BASE, V2_BG_BOTTOM]} style={StyleSheet.absoluteFillObject} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <OpenTabHeader
          title="오늘은 편안하게 마무리해보세요"
          subtitle="오늘의 환경과 컨디션에 맞춰, 부담 없이 바로 시작할 수 있는 조용한 휴식을 제안합니다."
          topSlot={
            <View style={styles.headerBrand}>
              <Image
                source={require('../../assets/images/brand/bath-symbol.png')}
                style={styles.headerBrandIcon}
                resizeMode="contain"
              />
              <Text style={styles.headerBadge}>BATH SOMMELIER</Text>
            </View>
          }
          mediaSlot={
            <View style={styles.headerIllustrationFrame}>
              {HOME_HEADER_ILLUSTRATION ? (
                <Image
                  source={HOME_HEADER_ILLUSTRATION}
                  style={styles.headerIllustrationImage}
                  resizeMode="cover"
                />
              ) : (
                <>
                  <View style={styles.headerIllustrationMistLarge} />
                  <View style={styles.headerIllustrationMistSmall} />
                  <View style={styles.headerIllustrationOrb} />
                </>
              )}
            </View>
          }
          centered
          footerSlot={
            !isHistoryLoaded || recentRoutines.length > 0 ? null : (
              <Text style={styles.beginnerGuide}>{copy.home.beginnerGuide}</Text>
            )
          }
        />

        <View style={styles.weeklyCard}>
          <LinearGradient
            colors={['rgba(39, 39, 39, 0.96)', 'rgba(28, 28, 28, 0.98)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.weeklyGradient}
          >
            <View style={styles.weeklyGlowPrimary} />
            <View style={styles.weeklyGlowSecondary} />

            <View style={styles.weeklyTopGroup}>
              <View style={styles.weeklyMainRow}>
                <Text style={styles.weeklyCountTitle}>주간 루틴 {streakSummary.weeklyBathCount}/{streakSummary.weeklyGoal}일</Text>
                <Pressable onPress={() => router.push('/(tabs)/history')} style={styles.inlineLinkButton}>
                  <Text style={styles.inlineLinkText}>전체 기록 보기</Text>
                  <FontAwesome name="angle-right" size={14} color={V2_ACCENT} />
                </Pressable>
              </View>

              <View style={styles.weeklyProgressTrack}>
                <View style={[styles.weeklyProgressFill, { width: `${weeklyProgressRatio * 100}%` }]} />
              </View>
            </View>

            <View style={styles.weeklyBottomGroup}>
              <Text style={styles.weeklyStatus}>
                {streakSummary.todayDone ? copy.home.todayDone : copy.home.todayPending}
              </Text>

              <View style={styles.weekDotsRow}>
                {streakSummary.dailyCheck.map((item) => (
                  <View key={item.dateKey} style={styles.weekDotItem}>
                    <View style={[styles.weekDot, item.done && styles.weekDotDone, item.isToday && styles.weekDotToday]}>
                      <View
                        style={[
                          styles.weekDotCenter,
                          item.done && styles.weekDotCenterDone,
                          item.done && item.isToday && styles.weekDotCenterTodayDone,
                        ]}
                      />
                    </View>
                    <Text style={[styles.weekDotLabel, item.done && styles.weekDotLabelDone, item.isToday && styles.weekDotLabelToday]}>
                      {getWeekdayMarker(item.weekdayLabel)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </LinearGradient>
        </View>

        <View>
          <Text style={styles.sectionLabel}>몰입 환경</Text>
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
            <Pressable onPress={() => router.push('/(tabs)/care')} style={styles.inlineLinkButton}>
              <Text style={styles.inlineLinkText}>전체 보기</Text>
              <FontAwesome name="angle-right" size={14} color={V2_ACCENT} />
            </Pressable>
          </View>
          {heroCard ? (
            <>
                <HomeCareHeroCard
                title={heroTitle}
                description={heroDescription}
                metaChips={[
                  {
                    iconName: 'temperature' as CustomIconName,
                    label: `${heroPreviewRecommendation?.temperature.recommended ?? 38}도`,
                  },
                  {
                    iconName: 'hourglass' as CustomIconName,
                    label: `${heroPreviewRecommendation?.durationMinutes ?? 10}분`,
                  },
                ]}
                accent={heroVisual.accent}
                backgroundSource={
                  getCareCardImageForEnvironment(
                    heroCard.intent_id,
                    resolveIntentImageEnvironment(heroCard, normalizedEnvironment)
                  ) ?? HOME_CARE_HERO_IMAGE
                }
                safetyBadge={
                  hasSafetyPriorityFallback(resolveFallback(heroCard, profile?.healthConditions ?? ['none']))
                    ? copy.home.safetyPriorityBadge
                    : getCareCardSafetyBadge(heroCard, profile?.healthConditions ?? ['none'])
                }
                disabled={!heroCard.allowed_environments.includes(normalizedEnvironment)}
                disabledText={getEnvironmentUnavailableReason(heroCard, normalizedEnvironment)}
                onPress={() => handleOpenCareSubProtocol(heroCard)}
              />

              <Text style={styles.careListLabel}>다른 케어 루틴 찾아보기</Text>
            </>
          ) : null}
          <View style={styles.careList}>
            {listCards.map((intent) => {
              const disabled = !intent.allowed_environments.includes(normalizedEnvironment);
              const visual = getCareVisualMeta(intent.intent_id);
              const previewRecommendation = listPreviewById[intent.id];
              const imageEnvironment = resolveIntentImageEnvironment(intent, normalizedEnvironment);
              return (
                <HomeCareListCard
                  key={intent.id}
                  title={intent.copy_title}
                  description={getEnvironmentSubtitle(intent, normalizedEnvironment, profile?.healthConditions ?? ['none'])}
                  accent={visual.accent}
                  metaChips={[
                    {
                      iconName: 'temperature' as CustomIconName,
                      label: `${previewRecommendation?.temperature.recommended ?? 38}도`,
                    },
                    {
                      iconName: 'hourglass' as CustomIconName,
                      label: `${previewRecommendation?.durationMinutes ?? 10}분`,
                    },
                  ]}
                  backgroundImage={getCareCardImageForEnvironment(intent.intent_id, imageEnvironment)}
                  disabled={disabled}
                  disabledText={getEnvironmentUnavailableReason(intent, normalizedEnvironment)}
                  onPress={() => handleOpenCareSubProtocol(intent)}
                />
              );
            })}
          </View>
        </View>

        <View>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>트립 루틴</Text>
            <Pressable onPress={() => router.push('/(tabs)/trip')} style={styles.inlineLinkButton}>
              <Text style={styles.inlineLinkText}>전체 보기</Text>
              <FontAwesome name="angle-right" size={14} color={V2_ACCENT} />
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.fullBleedScroll}
            contentContainerStyle={styles.tripRow}
          >
            {tripCards.map((intent) => {
              const disabled = !intent.allowed_environments.includes(normalizedEnvironment);
              const imageEnvironment = resolveIntentImageEnvironment(intent, normalizedEnvironment);
              const fallback = resolveFallback(intent, profile?.healthConditions ?? ['none']);
              const safetyBadge = hasSafetyPriorityFallback(fallback) ? copy.home.safetyPriorityBadge : undefined;
              const meta = TRIP_EDITORIAL_META[intent.intent_id] ?? TRIP_EDITORIAL_META.kyoto_forest;
              return (
                <HomeTripEditorialCard
                  key={intent.id}
                  intentId={intent.intent_id}
                  title={intent.copy_title}
                  subtitle={getEnvironmentSubtitle(intent, normalizedEnvironment, profile?.healthConditions ?? ['none'])}
                  accent={meta.accent}
                  fitLabel={getEnvironmentFitLabel(intent, normalizedEnvironment)}
                  safetyBadge={safetyBadge}
                  disabled={disabled}
                  onPress={() => handleStartTripIntent(intent)}
                  width={tripCardWidth}
                  imageVariant={getImageVariantForEnvironment(imageEnvironment)}
                />
              );
            })}
          </ScrollView>
        </View>

        <View>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>최근 완료한 루틴</Text>
            <Pressable onPress={() => router.push('/(tabs)/history')} style={styles.inlineLinkButton}>
              <Text style={styles.inlineLinkText}>전체 보기</Text>
              <FontAwesome name="angle-right" size={14} color={V2_ACCENT} />
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.fullBleedScroll}
            contentContainerStyle={styles.recentRow}
          >
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
    paddingTop: 18,
    paddingBottom: 40,
    gap: SECTION_GAP,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBrandIcon: {
    width: 18,
    height: 20,
  },
  headerBadge: {
    color: V2_ACCENT,
    fontSize: TYPE_SCALE.caption,
    fontWeight: '800',
    letterSpacing: luxuryTracking.eyebrow,
    fontFamily: luxuryFonts.sans,
  },
  headerIllustrationFrame: {
    width: '100%',
    maxWidth: 320,
    height: 144,
    borderRadius: luxuryRadii.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(245, 240, 232, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  headerIllustrationImage: {
    width: '100%',
    height: '100%',
  },
  headerIllustrationMistLarge: {
    position: 'absolute',
    width: 196,
    height: 196,
    borderRadius: 98,
    top: -82,
    right: -22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerIllustrationMistSmall: {
    position: 'absolute',
    width: 116,
    height: 116,
    borderRadius: 58,
    left: -20,
    bottom: -28,
    backgroundColor: 'rgba(176, 141, 87, 0.1)',
  },
  headerIllustrationOrb: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    right: 42,
    bottom: 26,
    backgroundColor: 'rgba(245, 240, 232, 0.07)',
  },
  beginnerGuide: {
    color: V2_TEXT_MUTED,
    fontSize: TYPE_SCALE.caption,
    lineHeight: 18,
    fontFamily: luxuryFonts.sans,
  },
  weeklyCard: {
    borderRadius: luxuryRadii.cardLg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...Platform.select({
      web: {
        boxShadow: '0px 10px 24px rgba(0, 0, 0, 0.22)',
      },
      default: {
        shadowColor: '#000000',
        shadowOpacity: 0.22,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 10 },
        elevation: 6,
      },
    }),
  },
  weeklyGradient: {
    paddingHorizontal: 18,
    paddingTop: 15,
    paddingBottom: 15,
    gap: 8,
  },
  weeklyGlowPrimary: {
    position: 'absolute',
    top: -18,
    left: 14,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 221, 145, 0.08)',
  },
  weeklyGlowSecondary: {
    position: 'absolute',
    right: -22,
    bottom: -22,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 205, 104, 0.06)',
  },
  weeklyTopGroup: {
    gap: 6,
  },
  weeklyMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  weeklyCountTitle: {
    color: '#F5EFE6',
    fontSize: TYPE_SCALE.title - 1,
    lineHeight: 22,
    fontFamily: luxuryFonts.display,
    flex: 1,
    paddingRight: 8,
  },
  weeklyProgressTrack: {
    height: 5,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  weeklyProgressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#D9BB70',
  },
  weeklyStatus: {
    color: 'rgba(255, 243, 225, 0.82)',
    fontSize: TYPE_SCALE.caption - 1,
    fontWeight: '600',
    lineHeight: 15,
    fontFamily: luxuryFonts.sans,
  },
  weeklyBottomGroup: {
    gap: 7,
  },
  inlineLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inlineLinkText: {
    color: '#D9BB70',
    fontSize: TYPE_SCALE.caption - 1,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  weekDotsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
  },
  weekDotItem: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  weekDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.25,
    borderColor: 'rgba(255, 236, 206, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 247, 232, 0.04)',
  },
  weekDotDone: {
    borderColor: '#E0B15E',
  },
  weekDotToday: {
    borderColor: '#F3D7A4',
    transform: [{ scale: 1.04 }],
  },
  weekDotCenter: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  weekDotCenterDone: {
    backgroundColor: '#D8B05D',
  },
  weekDotCenterTodayDone: {
    backgroundColor: '#E9C97E',
  },
  weekDotLabel: {
    color: 'rgba(255, 241, 218, 0.58)',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 11,
    fontFamily: luxuryFonts.sans,
  },
  weekDotLabelDone: {
    color: '#F1D49A',
  },
  weekDotLabelToday: {
    color: '#FFF7EA',
  },
  sectionLabel: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.title,
    fontFamily: luxuryFonts.display,
    marginBottom: 14,
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
    marginBottom: 16,
  },
  sectionTitle: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.title,
    fontFamily: luxuryFonts.display,
  },
  careListLabel: {
    color: V2_TEXT_MUTED,
    fontSize: TYPE_SCALE.caption,
    lineHeight: 18,
    fontFamily: luxuryFonts.sans,
    marginTop: 18,
    marginBottom: 14,
  },
  careList: {
    gap: 12,
  },
  fullBleedScroll: {
    marginHorizontal: -SCREEN_HORIZONTAL_PADDING,
  },
  tripRow: {
    gap: 16,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingRight: SCREEN_HORIZONTAL_PADDING + 12,
  },
  recentRow: {
    gap: 12,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingRight: SCREEN_HORIZONTAL_PADDING + 8,
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
