import { BathRecommendation, BathEnvironment, TripMemoryRecord } from './types';

interface RecallItem {
  recommendationId: string;
  text: string;
  completedAt: string;
}

export interface HistoryInsights {
  totalSessions: number;
  careSessions: number;
  tripSessions: number;
  avgDurationMinutes: number;
  topEnvironment: BathEnvironment | null;
  topThemeTitle: string | null;
  recentRecalls: RecallItem[];
}

function countBy<T extends string>(values: T[]): Record<T, number> {
  return values.reduce((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {} as Record<T, number>);
}

function pickTopKey<T extends string>(counts: Record<T, number>): T | null {
  const entries = Object.entries(counts) as Array<[T, number]>;
  if (entries.length === 0) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

export function buildHistoryInsights(
  history: BathRecommendation[],
  memories: TripMemoryRecord[]
): HistoryInsights {
  const totalSessions = memories.length;
  const careSessions = memories.filter((item) => item.completionSnapshot.mode === 'care').length;
  const tripSessions = memories.filter((item) => item.completionSnapshot.mode === 'trip').length;

  const durationPool = memories
    .map((memory) => memory.completionSnapshot.durationMinutes)
    .filter((duration): duration is number => duration !== null);

  const avgDurationMinutes =
    durationPool.length > 0
      ? Math.round(durationPool.reduce((sum, duration) => sum + duration, 0) / durationPool.length)
      : 0;

  const topEnvironment = pickTopKey(
    countBy(memories.map((item) => item.completionSnapshot.environment))
  );

  const themeTitles = memories
    .map((memory) => memory.themeTitle)
    .filter((title): title is string => Boolean(title));

  const topThemeTitle = pickTopKey(countBy(themeTitles));

  const recentRecalls = [...memories]
    .sort(
      (a, b) =>
        new Date(b.completionSnapshot.completedAt).getTime() -
        new Date(a.completionSnapshot.completedAt).getTime()
    )
    .slice(0, 3)
    .map((memory) => ({
      recommendationId: memory.recommendationId,
      text: memory.narrativeRecallCard,
      completedAt: memory.completionSnapshot.completedAt,
    }));

  return {
    totalSessions,
    careSessions,
    tripSessions,
    avgDurationMinutes,
    topEnvironment,
    topThemeTitle,
    recentRecalls,
  };
}
