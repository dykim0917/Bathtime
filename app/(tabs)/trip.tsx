import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BathEnvironment,
  FallbackStrategy,
  HomeSuggestionRank,
  IntentCard,
  ThemeId,
  TimeContext,
  UserProfile,
} from '@/src/engine/types';
import { generateTripRecommendation } from '@/src/engine/recommend';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { useHaptic } from '@/src/hooks/useHaptic';
import { saveRecommendation } from '@/src/storage/history';
import { upsertSessionRecord } from '@/src/storage/sessionLog';
import { loadLastEnvironment, saveLastEnvironment } from '@/src/storage/environment';
import {
  TYPE_SCALE,
  V2_ACCENT,
  V2_BG_BASE,
  V2_BG_BOTTOM,
  V2_BG_TOP,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
} from '@/src/data/colors';
import { HomeTripEditorialCard } from '@/src/components/HomeTripEditorialCard';
import {
  RecommendationCardEventPayload,
  trackIntentCardClick,
  trackIntentCardImpression,
  trackRoutineStart,
  trackRoutineStartAfterSubprotocol,
  trackSubprotocolSelected,
} from '@/src/analytics/events';
import {
  getEnvironmentFitLabel,
  getEnvironmentSubtitle,
  pickAutoTripSubProtocol,
  TRIP_INTENT_CARDS,
} from '@/src/data/intents';
import {
  getImageVariantForEnvironment,
  resolveIntentImageEnvironment,
} from '@/src/data/routineImageVariants';
import { applySubProtocolOverrides } from '@/src/engine/subprotocol';
import { inferFeelingBefore } from '@/src/engine/feeling';
import { copy } from '@/src/content/copy';
import { OpenTabHeader } from '@/src/components/OpenTabHeader';
import { luxuryFonts } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';

const TRIP_ENV_OPTIONS: { id: BathEnvironment; label: string }[] = [
  { id: 'bathtub', label: '욕조' },
  { id: 'shower', label: '샤워' },
];

const TRIP_EDITORIAL_META: Record<string, { accent: [string, string] }> = {
  kyoto_forest: { accent: ['#274539', '#5E846F'] },
  nordic_sauna: { accent: ['#4B3421', '#8B6540'] },
  rainy_camping: { accent: ['#19334A', '#4F7DA1'] },
  snow_cabin: { accent: ['#22354E', '#7590AA'] },
};

const SCREEN_HORIZONTAL_PADDING = 22;
const SECTION_GAP = 18;
const CARD_GAP = 14;

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

function mapIntentToTheme(intentId: string): ThemeId {
  return intentId;
}

function mapCardPositionToRank(position: number): HomeSuggestionRank {
  if (position === 1) return 'primary';
  if (position === 2) return 'secondary_1';
  return 'secondary_2';
}

function hasHighRiskCondition(conditions: UserProfile['healthConditions']): boolean {
  return conditions.some((c) => ['hypertension_heart', 'pregnant'].includes(c));
}

function resolveFallback(healthConditions: UserProfile['healthConditions']): FallbackStrategy {
  if (hasHighRiskCondition(healthConditions)) return 'SAFE_ROUTINE_ONLY';
  return 'none';
}

function hasSafetyPriorityFallback(fallback: FallbackStrategy): boolean {
  return fallback === 'SAFE_ROUTINE_ONLY' || fallback === 'RESET_WITHOUT_COLD';
}

export default function TripScreen() {
  const { profile } = useUserProfile();
  const haptic = useHaptic();
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [environment, setEnvironment] = useState<BathEnvironment>('bathtub');

  const sessionIdRef = useRef(`session_${Date.now()}`);
  const timeContext = useMemo(() => getTimeContext(), []);

  useEffect(() => {
    loadLastEnvironment().then((saved) => {
      if (saved && (saved === 'bathtub' || saved === 'shower')) {
        setEnvironment(saved);
        return;
      }
      if (profile && (profile.bathEnvironment === 'bathtub' || profile.bathEnvironment === 'shower')) {
        setEnvironment(profile.bathEnvironment);
      }
    });
  }, [profile]);

  const normalizedEnvironment = normalizeEnvironmentInput(environment);
  const tripCardWidth = Math.max(220, screenWidth - SCREEN_HORIZONTAL_PADDING * 2);

  useFocusEffect(
    useCallback(() => {
    const appVersion = Constants.expoConfig?.version ?? 'unknown';
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const healthConditions = profile?.healthConditions ?? ['none'];

    TRIP_INTENT_CARDS.forEach((intent) => {
      const payload: RecommendationCardEventPayload = {
        user_id: profile?.createdAt ?? 'anonymous',
        session_id: sessionIdRef.current,
        app_version: appVersion,
        locale,
        time_context: timeContext,
        environment,
        partial_bath_subtype: null,
        active_state: 'low_mood',
        mode_type: 'trip',
        suggestion_id: intent.id,
        suggestion_rank: mapCardPositionToRank(intent.card_position),
        fallback_strategy_applied: resolveFallback(healthConditions),
        experiment_id: 'none',
        variant: 'default',
        ts: new Date().toISOString(),
        engine_source: intent.domain,
        intent_id: intent.intent_id,
        intent_domain: intent.domain,
        section_order: 'trip_first',
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

  const handleOpenSubProtocol = async (intent: IntentCard) => {
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
      partial_bath_subtype: null,
      active_state: 'low_mood',
      mode_type: 'trip',
      suggestion_id: intent.id,
      suggestion_rank: mapCardPositionToRank(intent.card_position),
      fallback_strategy_applied: resolveFallback(healthConditions),
      experiment_id: 'none',
      variant: 'default',
      ts: new Date().toISOString(),
      engine_source: intent.domain,
      intent_id: intent.intent_id,
      intent_domain: intent.domain,
      section_order: 'trip_first',
      card_position: intent.card_position,
    };

    trackIntentCardClick(payload);
    haptic.medium();
    const runtimeProfile = buildRuntimeProfile(profile, environment);
    const baseRecommendation = generateTripRecommendation(runtimeProfile, mapIntentToTheme(intent.intent_id), toEngineEnvironment(environment));
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

    trackRoutineStart(payloadWithSub);
    trackRoutineStartAfterSubprotocol(payloadWithSub);
    router.push(`/result/recipe/${recommendation.id}?source=trip`);
  };

  return (
    <View style={[ui.screenShellV2, { paddingTop: insets.top }]}> 
      <LinearGradient colors={[V2_BG_TOP, V2_BG_BASE, V2_BG_BOTTOM]} style={StyleSheet.absoluteFillObject} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <OpenTabHeader
          eyebrow="무드 가이드"
          title="무드 루틴"
          subtitle="분위기를 바꾸고 싶은 날, 가능한 환경에 맞춰 골라보세요."
        />

        <View>
          <Text style={styles.sectionTitle}>입욕 환경</Text>
          <View style={styles.environmentRow}>
            {TRIP_ENV_OPTIONS.map((option) => (
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
          <Text style={styles.sectionTitle}>분위기별 루틴</Text>
          <View style={styles.tripList}>
            {TRIP_INTENT_CARDS.map((intent) => {
              const disabled = !intent.allowed_environments.includes(normalizedEnvironment);
              const imageEnvironment = resolveIntentImageEnvironment(intent, normalizedEnvironment);
              const fallback = resolveFallback(profile?.healthConditions ?? ['none']);
              const safetyBadge = hasSafetyPriorityFallback(fallback)
                ? copy.home.safetyPriorityBadge
                : undefined;
              const meta = TRIP_EDITORIAL_META[intent.intent_id] ?? TRIP_EDITORIAL_META.kyoto_forest;
              return (
                <HomeTripEditorialCard
                  key={intent.id}
                  intentId={intent.intent_id}
                  title={intent.copy_title}
                  subtitle={getEnvironmentSubtitle(intent, normalizedEnvironment)}
                  accent={meta.accent}
                  fitLabel={getEnvironmentFitLabel(intent, normalizedEnvironment)}
                  safetyBadge={safetyBadge}
                  disabled={disabled}
                  onPress={() => handleOpenSubProtocol(intent)}
                  width={tripCardWidth}
                  imageVariant={getImageVariantForEnvironment(imageEnvironment)}
                />
              );
            })}
          </View>
        </View>

      </ScrollView>
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
  tripList: {
    gap: CARD_GAP,
  },
});
