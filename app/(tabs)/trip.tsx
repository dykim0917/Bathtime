import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BathEnvironment,
  FallbackStrategy,
  HomeSuggestionRank,
  IntentCard,
  SubProtocolOption,
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
import { SafetyWarning } from '@/src/components/SafetyWarning';
import {
  TYPE_SCALE,
  V2_ACCENT,
  V2_BG_BASE,
  V2_BG_BOTTOM,
  V2_BG_TOP,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
} from '@/src/data/colors';
import { TripThemeCard } from '@/src/components/TripThemeCard';
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
  getEnvironmentFitLabel,
  getEnvironmentSubtitle,
  TRIP_INTENT_CARDS,
  TRIP_SUBPROTOCOL_OPTIONS,
} from '@/src/data/intents';
import { applySubProtocolOverrides } from '@/src/engine/subprotocol';
import { inferFeelingBefore } from '@/src/engine/feeling';
import { copy } from '@/src/content/copy';
import { ui } from '@/src/theme/ui';

const TRIP_ENV_OPTIONS: { id: BathEnvironment; emoji: string; label: string }[] = [
  { id: 'bathtub', emoji: '🛁', label: '욕조 (Deep)' },
  { id: 'shower', emoji: '🚿', label: '샤워 (Lite)' },
];

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
  const useSingleColumn = screenWidth < 340;
  const gridColumns = useSingleColumn ? 1 : 2;
  const sectionInnerWidth = Math.max(220, screenWidth - SCREEN_HORIZONTAL_PADDING * 2);
  const intentCardWidth = gridColumns === 2 ? (sectionInnerWidth - CARD_GAP) / 2 : sectionInnerWidth;

  useEffect(() => {
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
  }, [environment, profile?.createdAt, profile?.healthConditions, timeContext]);

  const disclosureLines = useMemo(() => {
    const healthConditions = profile?.healthConditions ?? ['none'];
    const fallback = hasHighRiskCondition(healthConditions) ? 'SAFE_ROUTINE_ONLY' as const : 'none' as const;
    return buildDisclosureLines({
      fallbackStrategy: fallback,
      selectedMode: 'recovery',
      healthConditions,
    });
  }, [profile?.healthConditions]);

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
    trackSubprotocolModalOpen(payload);
    setSelectedIntent(intent);
    setSelectedIntentPayload(payload);
    setSubModalVisible(true);
  };

  const handleSelectSubProtocol = async (option: SubProtocolOption) => {
    if (!selectedIntent || !selectedIntentPayload) return;

    haptic.medium();
    const runtimeProfile = buildRuntimeProfile(profile, environment);
    const baseRecommendation = generateTripRecommendation(
      runtimeProfile,
      mapIntentToTheme(selectedIntent.intent_id),
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

    if (recommendation.safetyWarnings.length > 0) {
      setPendingWarnings(recommendation.safetyWarnings);
      setPendingRecId(recommendation.id);
      setPendingStartPayload(payloadWithSub);
      setWarningVisible(true);
      return;
    }

    trackRoutineStart(payloadWithSub);
    trackRoutineStartAfterSubprotocol(payloadWithSub);
    router.push(`/result/recipe/${recommendation.id}?source=trip`);
  };

  const handleWarningDismiss = () => {
    setWarningVisible(false);
    if (pendingStartPayload) {
      trackRoutineStart(pendingStartPayload);
      trackRoutineStartAfterSubprotocol(pendingStartPayload);
      setPendingStartPayload(null);
    }
    if (pendingRecId) {
      router.push(`/result/recipe/${pendingRecId}?source=trip`);
      setPendingRecId(null);
    }
  };

  const subOptions = selectedIntent
    ? (TRIP_SUBPROTOCOL_OPTIONS[selectedIntent.intent_id] ?? [])
    : [];

  return (
    <View style={[ui.screenShellV2, { paddingTop: insets.top }]}> 
      <LinearGradient colors={[V2_BG_TOP, V2_BG_BASE, V2_BG_BOTTOM]} style={StyleSheet.absoluteFillObject} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[ui.glassCardV2, styles.heroCard]}>
          <Text style={styles.eyebrow}>TRIP ROUTINE</Text>
          <Text style={ui.titleHeroV2}>트립 루틴</Text>
          <Text style={styles.subtitle}>여행처럼 몰입하는 테마 목욕을 환경에 맞게 골라보세요.</Text>
        </View>

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
                  {option.emoji} {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View>
          <Text style={styles.sectionTitle}>테마 루틴</Text>
          <View style={[styles.gridWrap, { columnGap: CARD_GAP, rowGap: CARD_GAP }]}>
            {TRIP_INTENT_CARDS.map((intent) => {
              const disabled = !intent.allowed_environments.includes(normalizedEnvironment);
              const fallback = resolveFallback(profile?.healthConditions ?? ['none']);
              const safetyBadge = hasSafetyPriorityFallback(fallback)
                ? copy.home.safetyPriorityBadge
                : undefined;
              return (
                <TripThemeCard
                  key={intent.id}
                  intentId={intent.intent_id}
                  title={intent.copy_title}
                  subtitle={getEnvironmentSubtitle(intent, normalizedEnvironment)}
                  fitLabel={getEnvironmentFitLabel(intent, normalizedEnvironment)}
                  safetyBadge={safetyBadge}
                  disabled={disabled}
                  disabledText="현재 환경에선 제한적으로 추천돼요"
                  onPress={() => handleOpenSubProtocol(intent)}
                  width={intentCardWidth}
                  minHeight={CARD_MIN_HEIGHT_REGULAR}
                  variant="v2"
                />
              );
            })}
          </View>
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
  heroCard: {
    padding: 18,
    gap: 8,
  },
  eyebrow: {
    fontSize: TYPE_SCALE.caption - 1,
    fontWeight: '700',
    color: V2_ACCENT,
    letterSpacing: 1.2,
  },
  subtitle: {
    marginTop: 2,
    fontSize: TYPE_SCALE.body,
    color: V2_TEXT_SECONDARY,
    lineHeight: 21,
  },
  sectionTitle: {
    color: V2_TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: TYPE_SCALE.title,
    marginBottom: 12,
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
  },
  envTextActive: {
    color: V2_ACCENT,
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  disclosureInline: {
    marginTop: 4,
  },
});
