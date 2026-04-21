import { buildSleepPreparationPlan, formatSleepPlanTime } from '../sleepWindow';

describe('sleep preparation plan', () => {
  test('returns a scheduled window when the recommended start time is still ahead', () => {
    const plan = buildSleepPreparationPlan(
      new Date('2026-04-20T20:00:00+09:00'),
      15
    );

    expect(plan.state).toBe('scheduled');
    if (plan.state !== 'scheduled') {
      throw new Error('expected scheduled plan');
    }

    expect(formatSleepPlanTime(plan.recommendedStart)).toBe('오후 9:15');
    expect(formatSleepPlanTime(plan.recommendedEnd)).toBe('오후 9:30');
  });

  test('returns a start-now window when the recommended start time has passed', () => {
    const plan = buildSleepPreparationPlan(
      new Date('2026-04-20T22:10:00+09:00'),
      15
    );

    expect(plan.state).toBe('start_now');
    if (plan.state !== 'start_now') {
      throw new Error('expected start_now plan');
    }

    expect(formatSleepPlanTime(plan.earliestBedtimeIfStartingNow)).toBe('오후 11:55');
  });
});
