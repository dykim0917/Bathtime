import { buildRoutineIntroDetail, getRoutineFillLevel, INTRO_DURATION_MS } from '../routineTimer';

describe('routineTimer helpers', () => {
  test('buildRoutineIntroDetail returns the updated ritual copy detail', () => {
    expect(buildRoutineIntroDetail()).toBe('온도와 시간만 지키며 편하게 따라와 주세요.');
  });

  test('getRoutineFillLevel fills water during intro', () => {
    expect(
      getRoutineFillLevel({
        phase: 'intro',
        introRemainingMs: INTRO_DURATION_MS,
        remainingSeconds: 900,
        totalSeconds: 900,
      })
    ).toBe(0);

    expect(
      getRoutineFillLevel({
        phase: 'intro',
        introRemainingMs: 0,
        remainingSeconds: 900,
        totalSeconds: 900,
      })
    ).toBe(1);
  });

  test('getRoutineFillLevel drains water during active timer', () => {
    expect(
      getRoutineFillLevel({
        phase: 'active',
        introRemainingMs: 0,
        remainingSeconds: 900,
        totalSeconds: 900,
      })
    ).toBe(1);

    expect(
      getRoutineFillLevel({
        phase: 'active',
        introRemainingMs: 0,
        remainingSeconds: 450,
        totalSeconds: 900,
      })
    ).toBe(0.5);

    expect(
      getRoutineFillLevel({
        phase: 'active',
        introRemainingMs: 0,
        remainingSeconds: 0,
        totalSeconds: 900,
      })
    ).toBe(0);
  });
});
