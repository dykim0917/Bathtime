export interface DayCheckItem {
  dateKey: string;
  weekdayLabel: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  done: boolean;
  isToday: boolean;
}

export interface HomeStreakSummary {
  todayDone: boolean;
  dailyCheck: DayCheckItem[];
  weeklyBathCount: number;
  weeklyGoal: number;
  dailyStreakDays: number;
  weeklyStreakWeeks: number;
}

const WEEKDAY_LABELS: DayCheckItem['weekdayLabel'][] = [
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
  'Sun',
];

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function toLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function dateKeyToLocalDate(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeekMonday(date: Date): Date {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return startOfDay(addDays(date, diff));
}

function buildDailyStreak(uniqueDates: Set<string>, now: Date): number {
  let streak = 0;
  let cursor = startOfDay(now);
  while (uniqueDates.has(toLocalDateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

function buildWeeklyStreak(
  weekCountMap: Map<string, number>,
  currentWeekStart: Date,
  activeThreshold: number
): number {
  let streak = 0;
  let cursor = currentWeekStart;

  while (true) {
    const weekKey = toLocalDateKey(cursor);
    const count = weekCountMap.get(weekKey) ?? 0;
    if (count < activeThreshold) break;
    streak += 1;
    cursor = addDays(cursor, -7);
  }

  return streak;
}

function defaultDailyCheck(now: Date): DayCheckItem[] {
  const weekStart = startOfWeekMonday(now);
  return WEEKDAY_LABELS.map((weekdayLabel, index) => {
    const date = addDays(weekStart, index);
    return {
      dateKey: toLocalDateKey(date),
      weekdayLabel,
      done: false,
      isToday: toLocalDateKey(date) === toLocalDateKey(now),
    };
  });
}

export function buildHomeStreakSummary(
  completedAtList: string[],
  now = new Date()
): HomeStreakSummary {
  const parsedDates = completedAtList
    .map((raw) => new Date(raw))
    .filter((date) => !Number.isNaN(date.getTime()));

  if (parsedDates.length === 0) {
    return {
      todayDone: false,
      dailyCheck: defaultDailyCheck(now),
      weeklyBathCount: 0,
      weeklyGoal: 7,
      dailyStreakDays: 0,
      weeklyStreakWeeks: 0,
    };
  }

  const todayKey = toLocalDateKey(now);
  const uniqueDateKeys = new Set(parsedDates.map(toLocalDateKey));
  const weekStart = startOfWeekMonday(now);
  const weekEndExclusive = addDays(weekStart, 7);

  const dailyCheck = WEEKDAY_LABELS.map((weekdayLabel, index) => {
    const date = addDays(weekStart, index);
    const dateKey = toLocalDateKey(date);
    return {
      dateKey,
      weekdayLabel,
      done: uniqueDateKeys.has(dateKey),
      isToday: dateKey === todayKey,
    };
  });

  let weeklyBathCount = 0;
  const weekCountMap = new Map<string, number>();

  uniqueDateKeys.forEach((dateKey) => {
    const date = dateKeyToLocalDate(dateKey);
    if (date >= weekStart && date < weekEndExclusive) {
      weeklyBathCount += 1;
    }

    const weekKey = toLocalDateKey(startOfWeekMonday(date));
    weekCountMap.set(weekKey, (weekCountMap.get(weekKey) ?? 0) + 1);
  });

  return {
    todayDone: uniqueDateKeys.has(todayKey),
    dailyCheck,
    weeklyBathCount,
    weeklyGoal: 7,
    dailyStreakDays: buildDailyStreak(uniqueDateKeys, now),
    weeklyStreakWeeks: buildWeeklyStreak(weekCountMap, weekStart, 1),
  };
}
