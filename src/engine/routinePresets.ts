import { RoutinePreset } from '@/src/archive/types';
import { BathEnvironment, BathRecommendation, DailyTag, UserProfile } from '@/src/engine/types';
import { generateCareRecommendation } from '@/src/engine/recommend';

type RoutinePresetMapping = {
  intentId: string;
  dailyTags: DailyTag[];
  environment: BathEnvironment;
  bathType: BathRecommendation['bathType'];
  durationMinutes: number;
};

const ROUTINE_PRESET_MAPPINGS: Record<string, RoutinePresetMapping> = {
  'shower-7': {
    intentId: 'stress_relief',
    dailyTags: ['stress'],
    environment: 'shower',
    bathType: 'shower',
    durationMinutes: 7,
  },
  'footbath-10': {
    intentId: 'stress_relief',
    dailyTags: ['stress'],
    environment: 'footbath',
    bathType: 'foot',
    durationMinutes: 10,
  },
  'bath-15': {
    intentId: 'sleep_ready',
    dailyTags: ['insomnia'],
    environment: 'bathtub',
    bathType: 'full',
    durationMinutes: 15,
  },
  'free-timer': {
    intentId: 'mood_lift',
    dailyTags: ['depression'],
    environment: 'shower',
    bathType: 'shower',
    durationMinutes: 5,
  },
};

function resolveMapping(routine: RoutinePreset, fallbackEnvironment: BathEnvironment): RoutinePresetMapping {
  const configured = ROUTINE_PRESET_MAPPINGS[routine.id];
  if (!configured) {
    return {
      intentId: 'stress_relief',
      dailyTags: ['stress'],
      environment: fallbackEnvironment,
      bathType: fallbackEnvironment === 'bathtub' ? 'full' : fallbackEnvironment === 'footbath' || fallbackEnvironment === 'partial_bath' ? 'foot' : 'shower',
      durationMinutes: routine.durationMinutes,
    };
  }

  if (routine.id !== 'free-timer') return configured;
  return {
    ...configured,
    environment: fallbackEnvironment,
    bathType: fallbackEnvironment === 'bathtub' ? 'full' : fallbackEnvironment === 'footbath' || fallbackEnvironment === 'partial_bath' ? 'foot' : 'shower',
  };
}

export function buildRoutinePresetRecommendation(
  routine: RoutinePreset,
  profile: UserProfile,
  fallbackEnvironment: BathEnvironment
): BathRecommendation {
  const mapping = resolveMapping(routine, fallbackEnvironment);
  const recommendation = generateCareRecommendation(
    { ...profile, bathEnvironment: mapping.environment },
    mapping.dailyTags,
    mapping.environment,
    mapping.intentId
  );

  return {
    ...recommendation,
    routinePresetId: routine.id,
    routineTitle: routine.title,
    environmentUsed: mapping.environment,
    bathType: mapping.bathType,
    durationMinutes: mapping.durationMinutes,
    environmentHints: routine.steps,
  };
}
