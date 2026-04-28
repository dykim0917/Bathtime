import { BathRecommendation, TripMemoryRecord } from '@/src/engine/types';

export interface CompletionRecordItem {
  memory: TripMemoryRecord;
  recommendation: BathRecommendation | null;
  title: string;
  accentColor: string;
}

const DEFAULT_MODE_COLORS = {
  care: '#94D2BF',
  trip: '#C9A45B',
} as const;

export function buildCompletionRecordItems(
  history: BathRecommendation[],
  memories: TripMemoryRecord[]
): CompletionRecordItem[] {
  const recommendationById = new Map(history.map((item) => [item.id, item]));

  return [...memories]
    .sort(
      (a, b) =>
        new Date(b.completionSnapshot.completedAt).getTime() -
        new Date(a.completionSnapshot.completedAt).getTime()
    )
    .map((memory) => {
      const recommendation = recommendationById.get(memory.recommendationId) ?? null;
      return {
        memory,
        recommendation,
        title:
          recommendation?.themeTitle ??
          memory.themeTitle ??
          recommendation?.intentId ??
          '바스타임 기록',
        accentColor:
          recommendation?.colorHex ??
          DEFAULT_MODE_COLORS[memory.completionSnapshot.mode] ??
          DEFAULT_MODE_COLORS.care,
      };
    });
}

export function buildCompletionColorsByDate(
  items: CompletionRecordItem[]
): Record<string, string[]> {
  return items.reduce<Record<string, string[]>>((acc, item) => {
    const completedAt = new Date(item.memory.completionSnapshot.completedAt);
    if (Number.isNaN(completedAt.getTime())) return acc;

    const dateKey = toLocalDateKey(completedAt);
    const colors = acc[dateKey] ?? [];
    if (!colors.includes(item.accentColor)) {
      colors.push(item.accentColor);
    }
    acc[dateKey] = colors.slice(0, 3);
    return acc;
  }, {});
}

function toLocalDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
