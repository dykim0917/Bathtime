import AsyncStorage from '@react-native-async-storage/async-storage';
import { BathRecommendation, BathFeedback } from '@/src/engine/types';
import { AMBIENCE_TRACKS, MUSIC_TRACKS } from '@/src/data/music';
import { STORAGE_KEYS } from './keys';

const MAX_HISTORY = 30;

function normalizeRecommendation(rec: BathRecommendation): BathRecommendation {
  const fallbackMusic = MUSIC_TRACKS[0];
  const fallbackAmbience = AMBIENCE_TRACKS[0];

  return {
    ...rec,
    mode: rec.mode ?? 'care',
    routinePresetId: rec.routinePresetId,
    routineTitle: rec.routineTitle,
    environmentUsed: rec.environmentUsed ?? 'bathtub',
    themeId: rec.themeId,
    themeTitle: rec.themeTitle,
    music: rec.music ?? fallbackMusic,
    ambience: rec.ambience ?? fallbackAmbience,
  };
}

export async function saveRecommendation(rec: BathRecommendation): Promise<void> {
  const history = await loadHistory();
  history.unshift(normalizeRecommendation(rec));
  if (history.length > MAX_HISTORY) {
    history.length = MAX_HISTORY;
  }
  await AsyncStorage.setItem(
    STORAGE_KEYS.RECOMMENDATION_HISTORY,
    JSON.stringify(history)
  );
}

export async function loadHistory(): Promise<BathRecommendation[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.RECOMMENDATION_HISTORY);
  if (!data) return [];
  return (JSON.parse(data) as BathRecommendation[]).map(normalizeRecommendation);
}

export async function getRecommendationById(
  id: string
): Promise<BathRecommendation | null> {
  const history = await loadHistory();
  const rec = history.find((r) => r.id === id) ?? null;
  return rec ? normalizeRecommendation(rec) : null;
}

export async function getMonthlyCount(
  year: number,
  month: number
): Promise<number> {
  const history = await loadHistory();
  return history.filter((r) => {
    const d = new Date(r.createdAt);
    return d.getFullYear() === year && d.getMonth() === month - 1;
  }).length;
}

export async function updateRecommendationFeedback(
  id: string,
  feedback: BathFeedback
): Promise<void> {
  const history = await loadHistory();
  const rec = history.find((r) => r.id === id);
  if (rec) {
    rec.feedback = feedback;
    await AsyncStorage.setItem(
      STORAGE_KEYS.RECOMMENDATION_HISTORY,
      JSON.stringify(history)
    );
  }
}
