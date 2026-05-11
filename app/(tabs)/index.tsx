import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Href, router, useFocusEffect } from 'expo-router';
import Constants from 'expo-constants';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BathEnvironment,
  BathRecommendation,
  DailyTag,
  FallbackStrategy,
  HomeSuggestionRank,
  IntentCard,
  SubProtocolOption,
  ThemeId,
  UserProfile,
} from '@/src/engine/types';
import { generateCareRecommendation, generateTripRecommendation } from '@/src/engine/recommend';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { useHaptic } from '@/src/hooks/useHaptic';
import { saveRecommendation, loadHistory } from '@/src/storage/history';
import { upsertSessionRecord } from '@/src/storage/sessionLog';
import { loadLastEnvironment, saveLastEnvironment } from '@/src/storage/environment';
import { loadTripMemoryHistory } from '@/src/storage/memory';
import { buildHomeStreakSummary, HomeStreakSummary } from '@/src/engine/streaks';
import {
  getDefaultCareSubProtocol,
  pickRuntimeAutoTripSubProtocol,
  useContentHydration,
} from '@/src/data/contentRuntime';
import {
  getEnvironmentSubtitle,
  getEnvironmentUnavailableReason,
} from '@/src/data/intents';
import { applySubProtocolOverrides } from '@/src/engine/subprotocol';
import { inferFeelingBefore } from '@/src/engine/feeling';
import {
  RecommendationCardEventPayload,
  trackIntentCardClick,
  trackIntentCardImpression,
  trackRoutineStart,
  trackRoutineStartAfterSubprotocol,
  trackSubprotocolModalOpen,
  trackSubprotocolSelected,
} from '@/src/analytics/events';
import { NativeArchiveCard } from '@/src/components/native/NativeArchiveCard';
import { NativeScreen } from '@/src/components/native/NativeScreen';
import { HomeProfileSetupModal } from '@/src/components/HomeProfileSetupModal';
import { SubProtocolPickerModal } from '@/src/components/SubProtocolPickerModal';
import { PersistentDisclosure } from '@/src/components/PersistentDisclosure';
import { buildDisclosureLines } from '@/src/engine/disclosures';
import { getLatestContents } from '@/src/archive/selectors';
import { getSavedContentStorage, getStorageErrorMessage, toggleSavedContent } from '@/src/storage/savedContent';
import { useAuth } from '@/src/auth/AuthProvider';
import { setPendingAuthAction } from '@/src/auth/pendingActions';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';
import { copy } from '@/src/content/copy';

const ENV_OPTIONS: { id: BathEnvironment; label: string }[] = [
  { id: 'shower', label: '샤워' },
  { id: 'partial_bath', label: '족욕' },
  { id: 'bathtub', label: '욕조' },
];

const HOME_PREVIEW_CARD_LIMIT = 3;
const HOME_SECTION_ORDER: RecommendationCardEventPayload['section_order'] = 'care_first';

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
    case 'cold_relief': return ['cold'];
    case 'menstrual_relief': return ['menstrual_pain'];
    case 'stress_relief': return ['stress'];
    case 'mood_lift': return ['depression'];
    default: return ['stress'];
  }
}

function mapIntentToTheme(intentId: string): ThemeId {
  return intentId;
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

function modeFromIntent(intent: IntentCard): RecommendationCardEventPayload['mode_type'] {
  if (intent.domain === 'trip') return 'trip';
  return intent.mapped_mode;
}

function getTimeContext(date = new Date()): RecommendationCardEventPayload['time_context'] {
  const h = date.getHours();
  if (h >= 22 || h < 5) return 'late_night';
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 11 && h < 18) return 'day';
  return 'evening';
}

function resolveFallback(intent: IntentCard, healthConditions: UserProfile['healthConditions']): FallbackStrategy {
  const hasHighRisk = healthConditions.some((condition) => ['hypertension_heart', 'pregnant'].includes(condition));
  const hasResetRisk = healthConditions.some((condition) => ['hypertension_heart', 'pregnant', 'diabetes'].includes(condition));
  if (hasHighRisk) return 'SAFE_ROUTINE_ONLY';
  if (intent.intent_id === 'hangover_relief' && hasResetRisk) return 'RESET_WITHOUT_COLD';
  return 'none';
}

function isIntentAvailable(intent: IntentCard, environment: BathEnvironment): boolean {
  return intent.allowed_environments.includes(environment as 'bathtub' | 'partial_bath' | 'shower');
}

function selectHomeCareCards(
  cards: IntentCard[],
  environment: BathEnvironment,
  timeContext: RecommendationCardEventPayload['time_context']
): { heroCard: IntentCard | null; listCards: IntentCard[] } {
  const ordered = [...cards];
  if (timeContext === 'late_night') {
    const sleepIndex = ordered.findIndex((card) => card.intent_id === 'sleep_ready' && isIntentAvailable(card, environment));
    if (sleepIndex > 0) {
      const [sleepCard] = ordered.splice(sleepIndex, 1);
      ordered.unshift(sleepCard);
    }
  }

  const heroCard = ordered.find((card) => isIntentAvailable(card, environment)) ?? ordered[0] ?? null;
  const listCards = ordered.filter((card) => card.id !== heroCard?.id).slice(0, HOME_PREVIEW_CARD_LIMIT - 1);
  return { heroCard, listCards };
}

function buildCarePreviewRecommendation(intent: IntentCard, profile: UserProfile | null, environment: BathEnvironment): BathRecommendation {
  return generateCareRecommendation(
    buildRuntimeProfile(profile, environment),
    mapIntentToTags(intent.intent_id),
    toEngineEnvironment(environment),
    intent.intent_id
  );
}

export default function HomeScreen() {
  const { profile, save } = useUserProfile();
  const haptic = useHaptic();
  const { content } = useContentHydration();
  const { isAuthenticated, isLoading } = useAuth();
  const sessionIdRef = useRef(`session_${Date.now()}`);
  const timeContext = useMemo(() => getTimeContext(), []);
  const latestContents = useMemo(() => getLatestContents(3), []);

  const [environment, setEnvironment] = useState<BathEnvironment>('bathtub');
  const [streakSummary, setStreakSummary] = useState<HomeStreakSummary>(buildHomeStreakSummary([]));
  const [setupModalVisible, setSetupModalVisible] = useState(false);
  const [subModalVisible, setSubModalVisible] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<IntentCard | null>(null);
  const [selectedIntentPayload, setSelectedIntentPayload] = useState<RecommendationCardEventPayload | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    loadLastEnvironment().then((saved) => {
      if (saved) {
        setEnvironment(normalizeEnvironmentInput(saved));
        return;
      }
      if (profile) setEnvironment(normalizeEnvironmentInput(profile.bathEnvironment));
    });

    Promise.all([loadHistory(), loadTripMemoryHistory()]).then(([, memories]) => {
      setStreakSummary(buildHomeStreakSummary(memories.map((memory) => memory.completionSnapshot.completedAt)));
    });
  }, [profile]);

  const refreshSaved = useCallback(() => {
    if (!isAuthenticated) {
      setSavedIds([]);
      return;
    }
    getSavedContentStorage().getSavedIds().then(setSavedIds).catch(() => setSavedIds([]));
  }, [isAuthenticated]);

  useFocusEffect(refreshSaved);

  const normalizedEnvironment = normalizeEnvironmentInput(environment);
  const hasCompletedProfile = Boolean(profile?.onboardingComplete);
  const careCards = content.care.intents.slice(0, HOME_PREVIEW_CARD_LIMIT);
  const tripCards = content.trip.intents.slice(0, 2);
  const { heroCard, listCards } = useMemo(
    () => selectHomeCareCards(careCards, normalizedEnvironment, timeContext),
    [careCards, normalizedEnvironment, timeContext]
  );

  const heroPreview = useMemo(() => {
    if (!heroCard) return null;
    return buildCarePreviewRecommendation(heroCard, profile, environment);
  }, [environment, heroCard, profile]);

  const listPreviewById = useMemo(
    () => Object.fromEntries(listCards.map((intent) => [intent.id, buildCarePreviewRecommendation(intent, profile, environment)])),
    [environment, listCards, profile]
  );

  const buildIntentPayload = useCallback((intent: IntentCard): RecommendationCardEventPayload => {
    const healthConditions = profile?.healthConditions ?? ['none'];
    return {
      user_id: profile?.createdAt ?? 'anonymous',
      session_id: sessionIdRef.current,
      app_version: Constants.expoConfig?.version ?? 'unknown',
      locale: Intl.DateTimeFormat().resolvedOptions().locale,
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
      if (!hasCompletedProfile) return;
      [...careCards, ...tripCards].forEach((intent) => {
        trackIntentCardImpression(buildIntentPayload(intent));
      });
    }, [buildIntentPayload, careCards, hasCompletedProfile, tripCards])
  );

  const disclosureLines = useMemo(() => buildDisclosureLines({
    fallbackStrategy: profile?.healthConditions.some((condition) => ['hypertension_heart', 'pregnant'].includes(condition))
      ? 'SAFE_ROUTINE_ONLY'
      : 'none',
    selectedMode: 'recovery',
    healthConditions: profile?.healthConditions ?? ['none'],
  }), [profile?.healthConditions]);

  const handleSelectEnvironment = async (next: BathEnvironment) => {
    haptic.light();
    setEnvironment(next);
    await saveLastEnvironment(next);
  };

  const handleCompleteFirstSetup = async (nextProfile: UserProfile) => {
    haptic.success();
    await save(nextProfile);
    setEnvironment(normalizeEnvironmentInput(nextProfile.bathEnvironment));
    await saveLastEnvironment(nextProfile.bathEnvironment);
    setSetupModalVisible(false);
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

  const handleQuickStartCareIntent = async (intent: IntentCard) => {
    const payload = buildIntentPayload(intent);
    const option = getDefaultCareSubProtocol(intent);
    trackIntentCardClick(payload);
    haptic.medium();

    const baseRecommendation = generateCareRecommendation(
      buildRuntimeProfile(profile, environment),
      mapIntentToTags(intent.intent_id),
      toEngineEnvironment(environment),
      intent.intent_id
    );
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

    const payloadWithSub = { ...payload, subprotocol_id: option?.id };
    if (option) trackSubprotocolSelected(payloadWithSub);
    handleRouteToRecipe(recommendation, payloadWithSub, `/result/recipe/${recommendation.id}?source=care` as Href);
  };

  const handleOpenCareSubProtocol = (intent: IntentCard) => {
    const payload = buildIntentPayload(intent);
    trackIntentCardClick(payload);
    trackSubprotocolModalOpen(payload);
    setSelectedIntent(intent);
    setSelectedIntentPayload(payload);
    setSubModalVisible(true);
  };

  const handleStartTripIntent = async (intent: IntentCard) => {
    const payload = buildIntentPayload(intent);
    trackIntentCardClick(payload);
    haptic.medium();

    const baseRecommendation = generateTripRecommendation(
      buildRuntimeProfile(profile, environment),
      mapIntentToTheme(intent.intent_id),
      toEngineEnvironment(environment)
    );
    const option = pickRuntimeAutoTripSubProtocol(intent.intent_id, normalizedEnvironment);
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

    const payloadWithSub = { ...payload, subprotocol_id: option?.id };
    trackSubprotocolSelected(payloadWithSub);
    handleRouteToRecipe(recommendation, payloadWithSub, `/result/recipe/${recommendation.id}?source=trip` as Href);
  };

  const resolveSubOptions = (intent: IntentCard | null): SubProtocolOption[] => {
    if (!intent) return [];
    return content.care.subprotocols[intent.intent_id] ?? [];
  };

  const handleSelectSubProtocol = async (option: SubProtocolOption) => {
    if (!selectedIntent || !selectedIntentPayload) return;

    haptic.medium();
    const baseRecommendation = selectedIntent.domain === 'trip'
      ? generateTripRecommendation(buildRuntimeProfile(profile, environment), mapIntentToTheme(selectedIntent.intent_id), toEngineEnvironment(environment))
      : generateCareRecommendation(buildRuntimeProfile(profile, environment), mapIntentToTags(selectedIntent.intent_id), toEngineEnvironment(environment));
    const recommendation = applySubProtocolOverrides(baseRecommendation, option, environment, selectedIntent.intent_id);

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

    const payloadWithSub = { ...selectedIntentPayload, subprotocol_id: option.id };
    trackSubprotocolSelected(payloadWithSub);
    handleRouteToRecipe(recommendation, payloadWithSub, `/result/recipe/${recommendation.id}` as Href);
  };

  const handleSaveContent = async (id: string) => {
    if (!isAuthenticated) {
      await setPendingAuthAction({ type: 'save_content', contentId: id, returnTo: '/(tabs)', source: 'native_home' });
      router.push('/auth/login?source=save&next=/(tabs)' as Href);
      return;
    }

    try {
      const next = await toggleSavedContent(id);
      setSavedIds(next);
    } catch (error) {
      console.warn('Failed to toggle saved content', error);
      Alert.alert('저장에 실패했어요', getStorageErrorMessage(error));
    }
  };

  return (
    <NativeScreen
      eyebrow="HOME"
      title="오늘의 바스타임"
      subtitle="가볍게 고르고, 준비 화면을 거쳐 몰입형 타이머로 이어갑니다."
    >
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>이번주 바스타임</Text>
        <Text style={styles.summaryTitle}>{streakSummary.weeklyBathCount}/{streakSummary.weeklyGoal}일</Text>
        <Text style={styles.summaryBody}>{streakSummary.todayDone ? copy.home.todayDone : copy.home.todayPending}</Text>
      </View>

      <View style={styles.environmentSection}>
        <Text style={styles.sectionTitle}>{copy.home.sections.environment}</Text>
        <View style={styles.environmentRow}>
          {ENV_OPTIONS.map((option) => {
            const selected = environment === option.id;
            return (
              <Pressable key={option.id} style={[styles.envChip, selected && styles.envChipActive]} onPress={() => void handleSelectEnvironment(option.id)}>
                <Text style={[styles.envText, selected && styles.envTextActive]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {!hasCompletedProfile ? (
        <Pressable style={styles.setupCard} onPress={() => setSetupModalVisible(true)}>
          <Text style={styles.cardKicker}>FIRST SETUP</Text>
          <Text style={styles.cardTitle}>오늘 가능한 방식만 알려주세요</Text>
          <Text style={styles.cardBody}>샤워, 욕조, 족욕 중 가능한 환경만 고르면 바로 무리 없는 루틴을 준비해요.</Text>
          <Text style={styles.textLink}>30초 설정하기</Text>
        </Pressable>
      ) : heroCard ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{copy.home.sections.suggestions}</Text>
          <RecommendationCard
            intent={heroCard}
            description={getEnvironmentSubtitle(heroCard, normalizedEnvironment, profile?.healthConditions ?? ['none'])}
            temperature={heroPreview?.temperature.recommended}
            duration={heroPreview?.durationMinutes}
            primary
            disabled={!isIntentAvailable(heroCard, normalizedEnvironment)}
            disabledText={getEnvironmentUnavailableReason(heroCard, normalizedEnvironment)}
            onStart={() => void handleQuickStartCareIntent(heroCard)}
            onChoose={() => handleOpenCareSubProtocol(heroCard)}
          />
          {listCards.map((intent) => {
            const preview = listPreviewById[intent.id];
            return (
              <RecommendationCard
                key={intent.id}
                intent={intent}
                description={getEnvironmentSubtitle(intent, normalizedEnvironment, profile?.healthConditions ?? ['none'])}
                temperature={preview?.temperature.recommended}
                duration={preview?.durationMinutes}
                disabled={!isIntentAvailable(intent, normalizedEnvironment)}
                disabledText={getEnvironmentUnavailableReason(intent, normalizedEnvironment)}
                onStart={() => void handleQuickStartCareIntent(intent)}
                onChoose={() => handleOpenCareSubProtocol(intent)}
              />
            );
          })}
        </View>
      ) : null}

      {hasCompletedProfile ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>무드 루틴</Text>
          {tripCards.map((intent) => (
            <RecommendationCard
              key={intent.id}
              intent={intent}
              description={getEnvironmentSubtitle(intent, normalizedEnvironment, profile?.healthConditions ?? ['none'])}
              disabled={!isIntentAvailable(intent, normalizedEnvironment)}
              disabledText={getEnvironmentUnavailableReason(intent, normalizedEnvironment)}
              onStart={() => void handleStartTripIntent(intent)}
            />
          ))}
        </View>
      ) : null}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>추천 콘텐츠</Text>
          <Pressable onPress={() => router.push('/(tabs)/explore' as Href)}>
            <Text style={styles.textLink}>탐색 더보기</Text>
          </Pressable>
        </View>
        {latestContents.map((item) => (
          <NativeArchiveCard
            key={item.id}
            content={item}
            saved={savedIds.includes(item.id)}
            onSavePress={isLoading ? undefined : () => void handleSaveContent(item.id)}
          />
        ))}
      </View>

      {hasCompletedProfile ? <PersistentDisclosure lines={disclosureLines} variant="v2" /> : null}

      <HomeProfileSetupModal
        visible={setupModalVisible}
        onClose={() => setSetupModalVisible(false)}
        onComplete={handleCompleteFirstSetup}
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
    </NativeScreen>
  );
}

function RecommendationCard({
  intent,
  description,
  temperature,
  duration,
  primary = false,
  disabled = false,
  disabledText,
  onStart,
  onChoose,
}: {
  intent: IntentCard;
  description: string;
  temperature?: number;
  duration?: number | null;
  primary?: boolean;
  disabled?: boolean;
  disabledText?: string;
  onStart: () => void;
  onChoose?: () => void;
}) {
  return (
    <View style={[styles.recommendationCard, primary && styles.recommendationPrimary]}>
      <Text style={styles.cardKicker}>{intent.domain === 'trip' ? 'MOOD' : 'CARE'}</Text>
      <Text style={styles.cardTitle}>{intent.copy_title}</Text>
      <Text style={styles.cardBody}>{disabled ? disabledText : description}</Text>
      <View style={styles.metaRow}>
        {temperature ? <Text style={styles.metaPill}>{temperature}도</Text> : null}
        {duration ? <Text style={styles.metaPill}>{duration}분</Text> : null}
      </View>
      <View style={styles.actionRow}>
        {onChoose ? (
          <Pressable style={styles.secondaryButton} onPress={onChoose} disabled={disabled}>
            <Text style={styles.secondaryButtonText}>방식 선택</Text>
          </Pressable>
        ) : null}
        <Pressable style={[styles.primaryButton, disabled && styles.disabledButton]} onPress={onStart} disabled={disabled}>
          <Text style={styles.primaryButtonText}>시작하기</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: archiveColors.ink,
    fontSize: 18,
    fontWeight: '900',
    fontFamily: luxuryFonts.display,
  },
  summaryCard: {
    borderRadius: archiveRadius.lg,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    backgroundColor: archiveColors.surface,
    padding: 16,
    gap: 6,
  },
  summaryLabel: {
    color: archiveColors.primary,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  summaryTitle: {
    color: archiveColors.ink,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    fontFamily: luxuryFonts.display,
  },
  summaryBody: {
    color: archiveColors.body,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: luxuryFonts.sans,
  },
  environmentSection: {
    gap: 10,
  },
  environmentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  envChip: {
    flex: 1,
    minHeight: 42,
    borderRadius: archiveRadius.md,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    backgroundColor: archiveColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  envChipActive: {
    backgroundColor: archiveColors.primary,
    borderColor: archiveColors.primary,
  },
  envText: {
    color: archiveColors.body,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  envTextActive: {
    color: archiveColors.onPrimary,
  },
  setupCard: {
    borderRadius: archiveRadius.lg,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    backgroundColor: archiveColors.surface,
    padding: 16,
    gap: 9,
  },
  recommendationCard: {
    borderRadius: archiveRadius.lg,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    backgroundColor: archiveColors.surface,
    padding: 16,
    gap: 10,
  },
  recommendationPrimary: {
    backgroundColor: archiveColors.surfaceSoft,
  },
  cardKicker: {
    color: archiveColors.primary,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  cardTitle: {
    color: archiveColors.ink,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '900',
    fontFamily: luxuryFonts.display,
  },
  cardBody: {
    color: archiveColors.body,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: luxuryFonts.sans,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metaPill: {
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: archiveColors.primarySoft,
    color: archiveColors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: archiveRadius.md,
    backgroundColor: archiveColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: archiveColors.onPrimary,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: archiveRadius.md,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    backgroundColor: archiveColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: archiveColors.ink,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  disabledButton: {
    backgroundColor: archiveColors.primaryDisabled,
  },
  textLink: {
    color: archiveColors.primary,
    fontSize: 13,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
});
