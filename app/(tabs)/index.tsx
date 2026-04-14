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
import { SafetyWarning } from '@/src/components/SafetyWarning';
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
  getEnvironmentFitLabel,
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

interface CareEditorialMeta {
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  listTitle: string;
  listDescription: string;
  visualLabel: string;
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

const HOME_CARE_EDITORIAL_META: Record<string, CareEditorialMeta> = {
  muscle_relief: {
    heroEyebrow: '묵직한 피로를 풀어내는 레시피',
    heroTitle: '딥 릴렉싱 루틴',
    heroDescription: '따뜻한 온기로 어깨와 전신의 긴장을 부드럽게 풀어내고, 하루의 피로를 조용히 정리합니다.',
    listTitle: '무거워진 몸을 위한 딥 릴렉싱',
    listDescription: '온기와 느린 호흡으로 몸의 힘을 천천히 내려놓는 회복 루틴.',
    visualLabel: 'DEEP REST',
    accent: ['#7D6656', '#C6AB96'],
  },
  sleep_ready: {
    heroEyebrow: '밤의 고요를 부르는 레시피',
    heroTitle: '수면 준비 루틴',
    heroDescription: '따뜻한 온기로 교감신경을 안정시키고, 깊은 서파 수면으로 이어질 수 있도록 몸의 리듬을 차분히 낮춥니다.',
    listTitle: '깊은 잠을 위한 나이트 스팀',
    listDescription: '자극을 줄이고 천천히 가라앉으며 잠들기 전 긴장을 덜어내는 루틴.',
    visualLabel: 'NIGHT STEAM',
    accent: ['#193259', '#6178B9'],
  },
  hangover_relief: {
    heroEyebrow: '무거운 하루 뒤를 정리하는 레시피',
    heroTitle: '앰버 리셋 루틴',
    heroDescription: '과한 자극 없이 흐트러진 리듬을 다시 정돈하고, 몸의 둔한 피로를 짧고 따뜻하게 풀어냅니다.',
    listTitle: '속을 달래는 앰버 리셋',
    listDescription: '무리하지 않는 온열 중심 루틴으로 몸의 리듬을 천천히 회복합니다.',
    visualLabel: 'AMBER RESET',
    accent: ['#84501D', '#D7A052'],
  },
  edema_relief: {
    heroEyebrow: '가벼운 순환을 깨우는 레시피',
    heroTitle: '미네랄 플로우 루틴',
    heroDescription: '하체와 전신의 답답한 무게를 덜어내며, 부드러운 순환감으로 몸의 컨디션을 가볍게 회복합니다.',
    listTitle: '내일의 가벼움을 위한 순환',
    listDescription: '무거운 붓기를 덜어내고 가벼운 리듬을 되찾는 순환 루틴.',
    visualLabel: 'MINERAL FLOW',
    accent: ['#526D87', '#B7CBDD'],
  },
  cold_relief: {
    heroEyebrow: '체온을 부드럽게 끌어올리는 레시피',
    heroTitle: '웜 브레스 루틴',
    heroDescription: '몸을 천천히 덥히고 긴장을 낮추며, 으슬한 컨디션을 포근하게 정리합니다.',
    listTitle: '편안한 호흡을 위한 증기욕',
    listDescription: '따뜻한 수증기와 천천한 호흡으로 코와 목의 긴장을 덜어내는 루틴.',
    visualLabel: 'WARM BREATH',
    accent: ['#4E6B79', '#9FC4CF'],
  },
  menstrual_relief: {
    heroEyebrow: '아랫배의 긴장을 덜어내는 레시피',
    heroTitle: '소프트 웜스 루틴',
    heroDescription: '온열 중심의 편안한 흐름으로 몸 전체의 무거움을 풀고, 하루의 리듬을 조용히 정돈합니다.',
    listTitle: '따뜻한 이완을 위한 소프트 웜스',
    listDescription: '온기를 오래 유지하며 몸의 묵직함을 부드럽게 내려놓는 루틴.',
    visualLabel: 'SOFT WARMS',
    accent: ['#7C5968', '#C89DAF'],
  },
  stress_relief: {
    heroEyebrow: '복잡한 생각을 가라앉히는 레시피',
    heroTitle: '사일런트 리셋 루틴',
    heroDescription: '호흡과 온기를 중심으로 마음의 속도를 천천히 낮추고, 하루의 긴장을 조용히 정리합니다.',
    listTitle: '숨을 고르는 사일런트 리셋',
    listDescription: '과열된 리듬을 낮추고 차분한 감각으로 되돌아오는 전환 루틴.',
    visualLabel: 'SILENT RESET',
    accent: ['#4B6651', '#89AF8C'],
  },
  mood_lift: {
    heroEyebrow: '가벼운 기분 전환을 위한 레시피',
    heroTitle: '소프트 글로우 루틴',
    heroDescription: '과하지 않은 온기와 밝은 무드로 굳은 기분을 풀어내고, 몸과 마음의 결을 부드럽게 바꿉니다.',
    listTitle: '기분을 띄우는 소프트 글로우',
    listDescription: '무거운 기분을 천천히 들어올리는 따뜻한 기분 전환 루틴.',
    visualLabel: 'SOFT GLOW',
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

function getCareEditorialMeta(intentId: string, fallbackTitle: string, fallbackDescription: string): CareEditorialMeta {
  return HOME_CARE_EDITORIAL_META[intentId] ?? {
    heroEyebrow: '오늘의 케어 루틴',
    heroTitle: fallbackTitle,
    heroDescription: fallbackDescription,
    listTitle: fallbackTitle,
    listDescription: fallbackDescription,
    visualLabel: 'CARE ROUTINE',
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
  const [warningVisible, setWarningVisible] = useState(false);
  const [pendingWarnings, setPendingWarnings] = useState<string[]>([]);
  const [pendingRoute, setPendingRoute] = useState<Href | null>(null);
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

  const heroFallbackTitle = heroCard?.copy_title ?? '오늘의 케어 루틴';
  const heroFallbackDescription = heroCard
    ? getEnvironmentSubtitle(heroCard, normalizedEnvironment)
    : '오늘의 환경에 맞는 케어 루틴을 보여드려요.';
  const heroEditorial = useMemo(
    () => getCareEditorialMeta(heroCard?.intent_id ?? '', heroFallbackTitle, heroFallbackDescription),
    [heroCard?.intent_id, heroFallbackDescription, heroFallbackTitle]
  );
  const heroPreviewRecommendation = useMemo(() => {
    if (!heroCard) return null;

    const runtimeProfile = buildRuntimeProfile(profile, environment);
    const baseRecommendation = generateCareRecommendation(
      runtimeProfile,
      mapIntentToTags(heroCard.intent_id),
      toEngineEnvironment(environment)
    );
    const defaultOption = (CARE_SUBPROTOCOL_OPTIONS[heroCard.intent_id] ?? []).find(
      (option) => option.id === heroCard.default_subprotocol_id || option.is_default
    );

    if (!defaultOption) return baseRecommendation;

    return applySubProtocolOverrides(
      baseRecommendation,
      defaultOption,
      environment,
      heroCard.intent_id
    );
  }, [environment, heroCard, profile]);

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

  const handleRouteWithSafety = (
    recommendation: BathRecommendation,
    startPayload: RecommendationCardEventPayload,
    route: Href
  ) => {
    if (recommendation.safetyWarnings.length > 0) {
      setPendingWarnings(recommendation.safetyWarnings);
      setPendingRoute(route);
      setPendingStartPayload(startPayload);
      setWarningVisible(true);
      return;
    }

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
    handleRouteWithSafety(
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
    handleRouteWithSafety(
      recommendation,
      payloadWithSub,
      `/result/recipe/${recommendation.id}` as Href
    );
  };

  const handleWarningDismiss = () => {
    setWarningVisible(false);
    if (pendingStartPayload) {
      trackRoutineStart(pendingStartPayload);
      trackRoutineStartAfterSubprotocol(pendingStartPayload);
      setPendingStartPayload(null);
    }
    if (pendingRoute) {
      router.push(pendingRoute);
      setPendingRoute(null);
    }
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
                eyebrow={heroEditorial.heroEyebrow}
                title={heroEditorial.heroTitle}
                description={heroEditorial.heroDescription}
                visualLabel={heroEditorial.visualLabel}
                metaChips={[
                  `🌡️ ${heroPreviewRecommendation?.temperature.recommended ?? 38}도`,
                  `⏳ ${heroPreviewRecommendation?.durationMinutes ?? 10}분`,
                ]}
                accent={heroEditorial.accent}
                backgroundSource={HOME_CARE_HERO_IMAGE}
                fitLabel={getEnvironmentFitLabel(heroCard, normalizedEnvironment)}
                safetyBadge={
                  hasSafetyPriorityFallback(resolveFallback(heroCard, profile?.healthConditions ?? ['none']))
                    ? copy.home.safetyPriorityBadge
                    : undefined
                }
                disabled={!heroCard.allowed_environments.includes(normalizedEnvironment)}
                disabledText={copy.careCards.restrictedDisabled}
                onPress={() => handleOpenCareSubProtocol(heroCard)}
              />

              <Text style={styles.careListLabel}>다른 케어 루틴 찾아보기</Text>
            </>
          ) : null}
          <View style={styles.careList}>
            {listCards.map((intent) => {
              const disabled = !intent.allowed_environments.includes(normalizedEnvironment);
              const editorial = getCareEditorialMeta(
                intent.intent_id,
                intent.copy_title,
                getEnvironmentSubtitle(intent, normalizedEnvironment)
              );
              return (
                <HomeCareListCard
                  key={intent.id}
                  title={editorial.listTitle}
                  description={editorial.listDescription}
                  visualLabel={editorial.visualLabel}
                  accent={editorial.accent}
                  disabled={disabled}
                  disabledText={copy.careCards.restrictedDisabled}
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tripRow}>
            {tripCards.map((intent) => {
              const disabled = !intent.allowed_environments.includes(normalizedEnvironment);
              const fallback = resolveFallback(intent, profile?.healthConditions ?? ['none']);
              const safetyBadge = hasSafetyPriorityFallback(fallback) ? copy.home.safetyPriorityBadge : undefined;
              const meta = TRIP_EDITORIAL_META[intent.intent_id] ?? TRIP_EDITORIAL_META.kyoto_forest;
              return (
                <HomeTripEditorialCard
                  key={intent.id}
                  intentId={intent.intent_id}
                  title={intent.copy_title}
                  subtitle={getEnvironmentSubtitle(intent, normalizedEnvironment)}
                  destination={meta.destination}
                  accent={meta.accent}
                  fitLabel={getEnvironmentFitLabel(intent, normalizedEnvironment)}
                  safetyBadge={safetyBadge}
                  disabled={disabled}
                  disabledText={copy.careCards.restrictedDisabled}
                  onPress={() => handleStartTripIntent(intent)}
                  width={tripCardWidth}
                  imageVariant="deep"
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
  tripRow: {
    gap: 16,
    paddingRight: 12,
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
