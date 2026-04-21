import { describe, expect, test } from '@jest/globals';
import { buildHomeStreakSummary } from '../streaks';

describe('buildHomeStreakSummary', () => {
  const now = new Date('2026-03-04T12:00:00');

  test('returns empty defaults when there is no completion data', () => {
    const result = buildHomeStreakSummary([], now);
    expect(result.todayDone).toBe(false);
    expect(result.weeklyBathCount).toBe(0);
    expect(result.weeklyGoal).toBe(7);
    expect(result.dailyStreakDays).toBe(0);
    expect(result.weeklyStreakWeeks).toBe(0);
    expect(result.dailyCheck).toHaveLength(7);
  });

  test('builds current week daily checks and weekly count', () => {
    const result = buildHomeStreakSummary(
      [
        '2026-03-02T20:00:00',
        '2026-03-03T21:00:00',
        '2026-03-04T08:00:00',
      ],
      now
    );
    expect(result.todayDone).toBe(true);
    expect(result.weeklyBathCount).toBe(3);
    expect(result.dailyCheck[0].weekdayLabel).toBe('Mon');
    expect(result.dailyCheck[0].done).toBe(true);
    expect(result.dailyCheck[1].done).toBe(true);
    expect(result.dailyCheck[2].done).toBe(true);
    expect(result.dailyStreakDays).toBe(3);
  });

  test('counts repeated completions on the same day as one weekly routine day', () => {
    const result = buildHomeStreakSummary(
      [
        '2026-03-04T08:00:00',
        '2026-03-04T12:00:00',
        '2026-03-04T21:00:00',
      ],
      now
    );
    expect(result.todayDone).toBe(true);
    expect(result.weeklyBathCount).toBe(1);
    expect(result.dailyCheck.filter((item) => item.done)).toHaveLength(1);
    expect(result.dailyStreakDays).toBe(1);
  });

  test('calculates weekly active streak with monday-sunday boundary', () => {
    const result = buildHomeStreakSummary(
      [
        '2026-03-04T09:00:00', // current week
        '2026-02-24T09:00:00', // previous week
      ],
      now
    );
    expect(result.weeklyStreakWeeks).toBe(2);
  });
});
