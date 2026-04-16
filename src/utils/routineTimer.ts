export const INTRO_DURATION_MS = 3000;

export type RoutineTimerPhase = 'intro' | 'active';

interface RoutineFillLevelParams {
  phase: RoutineTimerPhase;
  introRemainingMs: number;
  remainingSeconds: number;
  totalSeconds: number;
}

export function buildRoutineIntroDetail(routineName: string): string {
  return `따뜻한 ${routineName}이 곧 시작됩니다.`;
}

export function getRoutineFillLevel({
  phase,
  introRemainingMs,
  remainingSeconds,
  totalSeconds,
}: RoutineFillLevelParams): number {
  if (phase === 'intro') {
    return clamp01(1 - introRemainingMs / INTRO_DURATION_MS);
  }

  if (totalSeconds <= 0) return 0;
  return clamp01(remainingSeconds / totalSeconds);
}

function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}
