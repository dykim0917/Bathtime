import React, { useCallback, useState } from 'react';
import { Href, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeScreen } from '@/src/components/native/NativeScreen';
import { routinePresets } from '@/src/archive/seed';
import { RoutinePreset } from '@/src/archive/types';
import { ROUTINE_ENVIRONMENT_LABELS } from '@/src/archive/labels';
import { trackArchiveEvent } from '@/src/analytics/events';
import { buildRoutinePresetRecommendation } from '@/src/engine/routinePresets';
import { inferFeelingBefore } from '@/src/engine/feeling';
import { BathEnvironment, UserProfile } from '@/src/engine/types';
import { saveRecommendation } from '@/src/storage/history';
import { upsertSessionRecord } from '@/src/storage/sessionLog';
import { loadLastEnvironment } from '@/src/storage/environment';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { luxuryFonts } from '@/src/theme/luxury';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';

const DEFAULT_ENVIRONMENT: BathEnvironment = 'shower';

function buildFallbackProfile(environment: BathEnvironment): UserProfile {
  const now = new Date().toISOString();
  return {
    bathEnvironment: environment,
    healthConditions: ['none'],
    onboardingComplete: false,
    createdAt: now,
    updatedAt: now,
  };
}

function normalizeEnvironment(environment: BathEnvironment): BathEnvironment {
  return environment === 'partial_bath' ? 'footbath' : environment;
}

export default function NativeRoutinesScreen() {
  const { profile } = useUserProfile();
  const [startingId, setStartingId] = useState<string | null>(null);

  const handleStart = useCallback(async (routine: RoutinePreset) => {
    if (startingId) return;
    setStartingId(routine.id);

    try {
      const lastEnvironment = await loadLastEnvironment();
      const fallbackEnvironment = normalizeEnvironment(profile?.bathEnvironment ?? lastEnvironment ?? DEFAULT_ENVIRONMENT);
      const runtimeProfile = profile ?? buildFallbackProfile(fallbackEnvironment);
      const recommendation = buildRoutinePresetRecommendation(routine, runtimeProfile, fallbackEnvironment);

      await saveRecommendation(recommendation);
      await upsertSessionRecord({
        id: recommendation.id,
        date: recommendation.createdAt,
        mode: recommendation.mode,
        trip_name: null,
        temperature: recommendation.temperature.recommended,
        duration: recommendation.durationMinutes,
        user_feeling_before: inferFeelingBefore(recommendation.intentId, recommendation.mode),
        user_feeling_after: 3,
      });

      trackArchiveEvent('routine_started', {
        routineId: routine.id,
        source: 'native_routines',
        platform: 'native',
      });
      router.push(`/result/recipe/${recommendation.id}?source=routines` as Href);
    } finally {
      setStartingId(null);
    }
  }, [profile, startingId]);

  return (
    <NativeScreen eyebrow="ROUTINES" title="저장하고 실행하는 의식" subtitle="짧은 샤워, 족욕, 입욕 의식을 기존 앱 타이머로 이어갑니다.">
      <View style={styles.list}>
        {routinePresets.filter((routine) => routine.isPublished).map((routine) => (
          <View key={routine.id} style={styles.card}>
            <Text style={styles.cardMeta}>{routine.durationMinutes}분 · {ROUTINE_ENVIRONMENT_LABELS[routine.environment]}</Text>
            <Text style={styles.cardTitle}>{routine.title}</Text>
            {routine.description ? <Text style={styles.cardBody}>{routine.description}</Text> : null}
            <View style={styles.steps}>
              {routine.steps.map((step, index) => (
                <Text key={step} style={styles.step}>{index + 1}. {step}</Text>
              ))}
            </View>
            <Pressable style={styles.primaryButton} onPress={() => void handleStart(routine)} disabled={Boolean(startingId)}>
              <Text style={styles.primaryButtonText}>{startingId === routine.id ? '준비 중...' : '타이머 시작'}</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </NativeScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  card: {
    borderRadius: archiveRadius.lg,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    backgroundColor: archiveColors.surface,
    padding: 16,
    gap: 10,
  },
  cardMeta: {
    color: archiveColors.primary,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  cardTitle: {
    color: archiveColors.ink,
    fontSize: 18,
    fontWeight: '900',
    fontFamily: luxuryFonts.display,
  },
  cardBody: {
    color: archiveColors.body,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: luxuryFonts.sans,
  },
  steps: {
    gap: 5,
  },
  step: {
    color: archiveColors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: luxuryFonts.sans,
  },
  primaryButton: {
    minHeight: 44,
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
});
