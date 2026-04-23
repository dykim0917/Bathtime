import AsyncStorage from '@react-native-async-storage/async-storage';
import { BathFeedback, BathRecommendation, ThemeId, TripMemoryRecord } from '@/src/engine/types';
import { STORAGE_KEYS } from './keys';

const MAX_MEMORY_HISTORY = 40;

const ENV_LABELS: Record<string, string> = {
  bathtub: '욕조',
  partial_bath: '족욕',
  footbath: '족욕',
  shower: '샤워',
};

function toReadableDuration(durationMinutes: number | null): string {
  if (durationMinutes === null) return '시간 자유';
  return `${durationMinutes}분`;
}

function buildNarrativeRecallCard(rec: BathRecommendation): string {
  if (rec.themeTitle) {
    return `${rec.themeTitle} 여정을 ${ENV_LABELS[rec.environmentUsed] ?? '욕실'} 환경에서 마무리했어요.`;
  }
  return `${ENV_LABELS[rec.environmentUsed] ?? '욕실'}에서 ${toReadableDuration(rec.durationMinutes)} 루틴을 완료했어요.`;
}

export async function loadThemePreferenceWeights(): Promise<Record<string, number>> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.THEME_PREFERENCE_WEIGHTS);
  if (!raw) return {};

  try {
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return {};
  }
}

async function saveThemePreferenceWeights(weights: Record<string, number>): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEYS.THEME_PREFERENCE_WEIGHTS,
    JSON.stringify(weights)
  );
}

export async function incrementThemePreferenceWeight(themeId: ThemeId): Promise<number> {
  const weights = await loadThemePreferenceWeights();
  const next = (weights[themeId] ?? 0) + 1;
  weights[themeId] = next;
  await saveThemePreferenceWeights(weights);
  return next;
}

export async function applyFeedbackToThemePreference(
  themeId: ThemeId,
  feedback: Exclude<BathFeedback, null>
): Promise<number> {
  const weights = await loadThemePreferenceWeights();
  const current = weights[themeId] ?? 0;

  // Positive feedback is treated as an additional preference signal.
  const next = feedback === 'good' ? current + 1 : current;
  weights[themeId] = next;
  await saveThemePreferenceWeights(weights);
  return next;
}

export async function loadTripMemoryHistory(): Promise<TripMemoryRecord[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.TRIP_MEMORY_HISTORY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as TripMemoryRecord[];
  } catch {
    return [];
  }
}

export async function saveCompletionMemory(
  recommendation: BathRecommendation,
  feedback: BathFeedback = null,
  overrides?: {
    completedAt?: string;
    durationMinutes?: number | null;
  }
): Promise<TripMemoryRecord> {
  const existing = await loadTripMemoryHistory();
  const existingRecord = existing.find(
    (entry) => entry.recommendationId === recommendation.id
  );
  if (existingRecord) {
    if (
      overrides?.completedAt ||
      overrides?.durationMinutes !== undefined
    ) {
      const updatedRecord: TripMemoryRecord = {
        ...existingRecord,
        completionSnapshot: {
          ...existingRecord.completionSnapshot,
          completedAt: overrides.completedAt ?? existingRecord.completionSnapshot.completedAt,
          durationMinutes:
            overrides.durationMinutes !== undefined
              ? overrides.durationMinutes
              : existingRecord.completionSnapshot.durationMinutes,
        },
      };

      const mergedHistory = [
        updatedRecord,
        ...existing.filter((entry) => entry.recommendationId !== recommendation.id),
      ];
      await AsyncStorage.setItem(
        STORAGE_KEYS.TRIP_MEMORY_HISTORY,
        JSON.stringify(mergedHistory)
      );
      return updatedRecord;
    }
    return existingRecord;
  }

  const weight = recommendation.themeId
    ? await incrementThemePreferenceWeight(recommendation.themeId)
    : 0;

  const record: TripMemoryRecord = {
    recommendationId: recommendation.id,
    themeId: recommendation.themeId ?? null,
    themeTitle: recommendation.themeTitle ?? null,
    completionSnapshot: {
      recommendationId: recommendation.id,
      completedAt: overrides?.completedAt ?? new Date().toISOString(),
      mode: recommendation.mode,
      environment: recommendation.environmentUsed,
      temperatureRecommended: recommendation.temperature.recommended,
      durationMinutes:
        overrides?.durationMinutes !== undefined
          ? overrides.durationMinutes
          : recommendation.durationMinutes,
      feedback,
    },
    themePreferenceWeight: weight,
    narrativeRecallCard: buildNarrativeRecallCard(recommendation),
  };

  const history = [record, ...existing.filter((entry) => entry.recommendationId !== recommendation.id)];
  if (history.length > MAX_MEMORY_HISTORY) {
    history.length = MAX_MEMORY_HISTORY;
  }

  await AsyncStorage.setItem(STORAGE_KEYS.TRIP_MEMORY_HISTORY, JSON.stringify(history));
  return record;
}
