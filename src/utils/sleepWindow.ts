const DEFAULT_BEDTIME_HOUR = 23;
const DEFAULT_BEDTIME_MINUTE = 0;
const NINETY_MINUTES = 90;

export type SleepPreparationPlan =
  | {
      state: 'scheduled';
      bedtime: Date;
      recommendedStart: Date;
      recommendedEnd: Date;
    }
  | {
      state: 'start_now';
      bedtime: Date;
      earliestBedtimeIfStartingNow: Date;
    };

export function buildSleepPreparationPlan(
  now: Date,
  durationMinutes: number,
  options?: { bedtimeHour?: number; bedtimeMinute?: number }
): SleepPreparationPlan {
  const bedtimeHour = options?.bedtimeHour ?? DEFAULT_BEDTIME_HOUR;
  const bedtimeMinute = options?.bedtimeMinute ?? DEFAULT_BEDTIME_MINUTE;
  const bedtime = new Date(now);

  bedtime.setHours(bedtimeHour, bedtimeMinute, 0, 0);

  const recommendedEnd = new Date(bedtime.getTime() - NINETY_MINUTES * 60 * 1000);
  const recommendedStart = new Date(
    recommendedEnd.getTime() - durationMinutes * 60 * 1000
  );

  if (now.getTime() <= recommendedStart.getTime()) {
    return {
      state: 'scheduled',
      bedtime,
      recommendedStart,
      recommendedEnd,
    };
  }

  return {
    state: 'start_now',
    bedtime,
    earliestBedtimeIfStartingNow: new Date(
      now.getTime() + (durationMinutes + NINETY_MINUTES) * 60 * 1000
    ),
  };
}

export function formatSleepPlanTime(date: Date): string {
  return date.toLocaleTimeString('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
  });
}
