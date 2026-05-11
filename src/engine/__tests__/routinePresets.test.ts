import { routinePresets } from '@/src/archive/seed';
import { buildRoutinePresetRecommendation } from '@/src/engine/routinePresets';
import { UserProfile } from '@/src/engine/types';

const profile: UserProfile = {
  bathEnvironment: 'shower',
  healthConditions: ['none'],
  onboardingComplete: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function preset(id: string) {
  const item = routinePresets.find((routine) => routine.id === id);
  if (!item) throw new Error(`Missing routine preset: ${id}`);
  return item;
}

describe('routine preset recommendations', () => {
  it('maps shower routine into the existing recommendation contract', () => {
    const recommendation = buildRoutinePresetRecommendation(preset('shower-7'), profile, 'shower');

    expect(recommendation.routinePresetId).toBe('shower-7');
    expect(recommendation.routineTitle).toBe('샤워 7분');
    expect(recommendation.intentId).toBe('stress_relief');
    expect(recommendation.environmentUsed).toBe('shower');
    expect(recommendation.bathType).toBe('shower');
    expect(recommendation.durationMinutes).toBe(7);
    expect(recommendation.music).toBeTruthy();
    expect(recommendation.ambience).toBeTruthy();
  });

  it('maps bath and footbath presets to their target environments', () => {
    const footbath = buildRoutinePresetRecommendation(preset('footbath-10'), profile, 'shower');
    const bath = buildRoutinePresetRecommendation(preset('bath-15'), profile, 'shower');

    expect(footbath.environmentUsed).toBe('footbath');
    expect(footbath.bathType).toBe('foot');
    expect(footbath.durationMinutes).toBe(10);
    expect(bath.environmentUsed).toBe('bathtub');
    expect(bath.bathType).toBe('full');
    expect(bath.intentId).toBe('sleep_ready');
  });

  it('uses current environment for the free timer preset', () => {
    const recommendation = buildRoutinePresetRecommendation(preset('free-timer'), profile, 'bathtub');

    expect(recommendation.environmentUsed).toBe('bathtub');
    expect(recommendation.bathType).toBe('full');
    expect(recommendation.durationMinutes).toBe(5);
    expect(recommendation.routineTitle).toBe('자유 의식/타이머');
  });
});
