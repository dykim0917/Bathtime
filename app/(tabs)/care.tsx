import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BathEnvironment,
  DailyTag,
  FallbackStrategy,
  HomeSuggestionRank,
  IntentCard,
  SubProtocolOption,
  TimeContext,
  UserProfile,
} from '@/src/engine/types';
import { generateCareRecommendation } from '@/src/engine/recommend';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { useHaptic } from '@/src/hooks/useHaptic';
import { saveRecommendation } from '@/src/storage/history';
import { upsertSessionRecord } from '@/src/storage/sessionLog';
import { loadLastEnvironment, saveLastEnvironment } from '@/src/storage/environment';
import {
  TYPE_SCALE,
  V2_ACCENT,
  V2_ACCENT_SOFT,
  V2_BG_BASE,
  V2_BG_BOTTOM,
  V2_BG_TOP,
  V2_BORDER,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
  V2_WARNING,
} from '@/src/data/colors';
import { CategoryCard } from '@/src/components/CategoryCard';
import { getIntentIconName } from '@/src/components/CustomIcon';
import {
  RecommendationCardEventPayload,
  trackIntentCardClick,
  trackIntentCardImpression,
  trackRoutineStart,
  trackRoutineStartAfterSubprotocol,
  trackSubprotocolModalOpen,
  trackSubprotocolSelected,
} from '@/src/analytics/events';
import { SubProtocolPickerModal } from '@/src/components/SubProtocolPickerModal';
import {
  CARE_INTENT_CARDS,
  CARE_SUBPROTOCOL_OPTIONS,
  getCareCardSafetyBadge,
  getEnvironmentFitLabel,
  getEnvironmentUnavailableReason,
  getEnvironmentSubtitle,
} from '@/src/data/intents';
import { getCareCardImageForEnvironment } from '@/src/data/careImages';
import { resolveIntentImageEnvironment } from '@/src/data/routineImageVariants';
import { applySubProtocolOverrides } from '@/src/engine/subprotocol';
import { inferFeelingBefore } from '@/src/engine/feeling';
import { copy } from '@/src/content/copy';
import { OpenTabHeader } from '@/src/components/OpenTabHeader';
import { luxuryFonts } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';

const ENV_OPTIONS: { id: BathEnvironment; label: string }[] = [
  { id: 'bathtub', label: '욕조' },
  { id: 'partial_bath', label: '족욕' },
  { id: 'shower', label: '샤워' },
];

const ALL_CARE_CARDS = CARE_INTENT_CARDS;

const SCREEN_HORIZONTAL_PADDING = 22;
const SECTION_GAP = 18;
const CARD_GAP = 12;
const CARD_MIN_HEIGHT_REGULAR = 142;

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
  if (profile) {
    return { ...profile, bathEnvironment: toEngineEnvironment(environment) };
  }
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

function mapCardPositionToRank(position: number): HomeSuggestionRank {
  if (position === 1) return 'primary';
  if (position === 2) return 'secondary_1';
  return 'secondary_2';
}

function hasHighRiskCondition(conditions: UserProfile['healthConditions']): boolean {
  return conditions.some((c) => ['hypertension_heart', 'pregnant'].includes(c));
}

function hasResetContraindication(conditions: UserProfile['healthConditions']): boolean {
  return conditions.some((c) => ['hypertension_heart', 'pregnant', 'diabetes'].includes(c));
}

function resolveFallback(intent: IntentCard, healthConditions: UserProfile['healthConditions']): FallbackStrategy {
  if (hasHighRiskCondition(healthConditions)) return 'SAFE_ROUTINE_ONLY';
  if (intent.intent_id === 'hangover_relief' && hasResetContraindication(healthConditions)) {
    return 'RESET_WITHOUT_COLD';
  }
  return 'none';
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
    case 'cold_relief': return '#6B9EBC';
    case 'menstrual_relief': return '#C07E90';
    case 'stress_relief': return '#759B78';
    case 'mood_lift': return '#B49A4F';
    default: return '#7D94BA';
  }
}

export default function CareScreen() {
  const { profile } = useUserProfile();
  const haptic = useHaptic();
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [environment, setEnvironment] = useState<BathEnvironment>('bathtub');
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
  }, [profile]);

  const normalizedEnvironment = normalizeEnvironmentInput(environment);
  const intentCardWidth = Math.max(220, screenWidth - SCREEN_HORIZONTAL_PADDING * 2);

  useFocusEffect(
    useCallback(() => {
    const appVersion = Constants.expoConfig?.version ?? 'unknown';
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const healthConditions = profile?.healthConditions ?? ['none'];

    CARE_INTENT_CARDS.forEach((intent) => {
      const payload: RecommendationCardEventPayload = {
        user_id: profile?.createdAt ?? 'anonymous',
        session_id: sessionIdRef.current,
        app_version: appVersion,
        locale,
        time_context: timeContext,
        environment,
        partial_bath_subtype: environment === 'partial_bath' ? 'footbath' : null,
        active_state: 'low_mood',
        mode_type: intent.mapped_mode,
        suggestion_id: intent.id,
        suggestion_rank: mapCardPositionToRank(intent.card_position),
        fallback_strategy_applied: resolveFallback(intent, healthConditions),
        experiment_id: 'none',
        variant: 'default',
        ts: new Date().toISOString(),
        engine_source: intent.domain,
        intent_id: intent.intent_id,
        intent_domain: intent.domain,
        section_order: 'care_first',
        card_position: intent.card_position,
      };
      trackIntentCardImpression(payload);
    });
    }, [environment, profile?.createdAt, profile?.healthConditions, timeContext])
  );

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
      active_state: 'low_mood',
      mode_type: intent.mapped_mode,
      suggestion_id: intent.id,
      suggestion_rank: mapCardPositionToRank(intent.card_position),
      fallback_strategy_applied: resolveFallback(intent, healthConditions),
      experiment_id: 'none',
      variant: 'default',
      ts: new Date().toISOString(),
      engine_source: intent.domain,
      intent_id: intent.intent_id,
      intent_domain: intent.domain,
      section_order: 'care_first',
      card_position: intent.card_position,
    };

    trackIntentCardClick(payload);
    trackSubprotocolModalOpen(payload);
    setSelectedIntent(intent);
    setSelectedIntentPayload(payload);
    setSubModalVisible(true);
  };

  const handleSelectSubProtocol = async (option: SubProtocolOption) => {
    if (!selectedIntent || !selectedIntentPayload) return;

    haptic.medium();
    const runtimeProfile = buildRuntimeProfile(profile, environment);
    const baseRecommendation = generateCareRecommendation(
      runtimeProfile,
      mapIntentToTags(selectedIntent.intent_id),
      toEngineEnvironment(environment),
      selectedIntent.intent_id
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

    trackRoutineStart(payloadWithSub);
    trackRoutineStartAfterSubprotocol(payloadWithSub);
    router.push(`/result/recipe/${recommendation.id}?source=care`);
  };

  const subOptions = selectedIntent
    ? (CARE_SUBPROTOCOL_OPTIONS[selectedIntent.intent_id] ?? [])
    : [];

  return (
    <View style={[ui.screenShellV2, { paddingTop: insets.top }]}> 
      <LinearGradient colors={[V2_BG_TOP, V2_BG_BASE, V2_BG_BOTTOM]} style={StyleSheet.absoluteFillObject} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <OpenTabHeader
          eyebrow="컨디션 가이드"
          title="컨디션 루틴"
          subtitle="지금 몸 상태에 맞춰 무리 없는 루틴을 골라보세요."
        />

        <View>
          <Text style={styles.sectionTitle}>입욕 환경</Text>
          <View style={styles.environmentRow}>
            {ENV_OPTIONS.map((option) => (
              <Pressable
                key={option.id}
                style={[ui.pillButtonV2, styles.envChip, environment === option.id && ui.pillButtonV2Active]}
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
          <Text style={styles.sectionTitle}>컨디션별 루틴</Text>
          <Text style={styles.sectionIntro}>지금 컨디션에 맞는 대표 루틴부터 보고, 나머지도 같은 기준으로 비교할 수 있어요.</Text>
          <View style={[styles.gridWrap, { rowGap: CARD_GAP }]}> 
            {ALL_CARE_CARDS.map((intent) => {
              const isFeaturedCard = intent.card_position === 1;
              const isPlaceholder = intent.allowed_environments.length === 0;
              const disabled = isPlaceholder || !intent.allowed_environments.includes(normalizedEnvironment);
              const healthConditions = profile?.healthConditions ?? ['none'];
              const imageEnvironment = resolveIntentImageEnvironment(intent, normalizedEnvironment);
              const fallback = resolveFallback(intent, healthConditions);
              const safetyBadge = hasSafetyPriorityFallback(fallback)
                ? copy.home.safetyPriorityBadge
                : getCareCardSafetyBadge(intent, healthConditions);
              return (
                <CategoryCard
                  key={intent.id}
                  title={intent.copy_title}
                  subtitle={isPlaceholder ? copy.careCards.placeholderSubtitle : getEnvironmentSubtitle(intent, normalizedEnvironment, healthConditions)}
                  iconName={getIntentIconName(intent.intent_id)}
                  bgColor={getIntentTint(intent.intent_id)}
                  eyebrow={isFeaturedCard ? copy.careCards.featuredEyebrow : copy.careCards.quickEyebrow}
                  footerHint={disabled ? copy.careCards.disabledFooter : copy.careCards.defaultFooter}
                  fitLabel={isPlaceholder ? undefined : getEnvironmentFitLabel(intent, normalizedEnvironment)}
                  safetyBadge={safetyBadge}
                  disabled={disabled}
                  disabledText={isPlaceholder ? copy.careCards.placeholderDisabled : getEnvironmentUnavailableReason(intent, normalizedEnvironment)}
                  backgroundImage={isPlaceholder ? null : getCareCardImageForEnvironment(intent.intent_id, imageEnvironment)}
                  onPress={() => handleOpenSubProtocol(intent)}
                  width={intentCardWidth}
                  minHeight={isFeaturedCard ? CARD_MIN_HEIGHT_REGULAR + 24 : CARD_MIN_HEIGHT_REGULAR}
                  emphasis={isFeaturedCard ? 'featured' : 'default'}
                  variant="v2"
                />
              );
            })}
          </View>
        </View>

      </ScrollView>
      <SubProtocolPickerModal
        visible={subModalVisible}
        title={selectedIntent?.copy_title ?? ''}
        domain={selectedIntent?.domain}
        options={subOptions}
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
    paddingTop: 16,
    paddingBottom: 36,
    gap: SECTION_GAP,
  },
  sectionTitle: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_SCALE.title,
    marginBottom: 12,
    fontFamily: luxuryFonts.display,
  },
  sectionIntro: {
    color: V2_TEXT_MUTED,
    fontSize: TYPE_SCALE.caption,
    lineHeight: 18,
    marginTop: -4,
    marginBottom: 12,
    fontFamily: luxuryFonts.sans,
  },
  environmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 8,
    rowGap: 8,
  },
  envChip: {
    minHeight: 44,
  },
  envText: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_SCALE.body,
    fontWeight: '600',
    fontFamily: luxuryFonts.sans,
  },
  envTextActive: {
    color: V2_ACCENT,
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
});
