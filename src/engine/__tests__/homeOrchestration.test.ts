import {
  buildHomeOrchestration,
  buildSuggestionExplanation,
  normalizeEnvironmentInput,
  selectModeByPolicy,
} from '../homeOrchestration';

describe('homeOrchestration', () => {
  test('selectModeByPolicy: late night + not reset => sleep', () => {
    expect(selectModeByPolicy('tension', 'late_night')).toBe('sleep');
  });

  test('selectModeByPolicy: morning + cant_sleep => recovery', () => {
    expect(selectModeByPolicy('cant_sleep', 'morning')).toBe('recovery');
  });

  test('fallback: SAFE_ROUTINE_ONLY has highest priority', () => {
    const result = buildHomeOrchestration({
      activeState: 'want_reset',
      timeContext: 'day',
      environment: 'bathtub',
      healthConditions: ['hypertension_heart'],
      hasProfile: true,
      productCandidateAvailable: true,
      selectedThemeId: 'kyoto_forest',
    });

    expect(result.fallbackStrategy).toBe('SAFE_ROUTINE_ONLY');
    expect(result.primarySuggestion.rank).toBe('primary');
  });

  test('fallback: reset contraindication -> RESET_WITHOUT_COLD', () => {
    const result = buildHomeOrchestration({
      activeState: 'want_reset',
      timeContext: 'day',
      environment: 'bathtub',
      healthConditions: ['diabetes'],
      hasProfile: true,
      productCandidateAvailable: true,
      selectedThemeId: 'kyoto_forest',
    });

    expect(result.fallbackStrategy).toBe('RESET_WITHOUT_COLD');
  });

  test('fallback: no profile -> DEFAULT_STARTER_RITUAL', () => {
    const result = buildHomeOrchestration({
      activeState: 'cant_sleep',
      timeContext: 'day',
      environment: 'bathtub',
      healthConditions: ['none'],
      hasProfile: false,
      productCandidateAvailable: true,
      selectedThemeId: 'kyoto_forest',
    });

    expect(result.fallbackStrategy).toBe('DEFAULT_STARTER_RITUAL');
    expect(result.primarySuggestion.rank).toBe('primary');
  });

  test('fallback: no product candidates -> ROUTINE_ONLY_NO_COMMERCE', () => {
    const result = buildHomeOrchestration({
      activeState: 'cant_sleep',
      timeContext: 'day',
      environment: 'shower',
      healthConditions: ['none'],
      hasProfile: true,
      productCandidateAvailable: false,
      selectedThemeId: 'kyoto_forest',
    });

    expect(result.fallbackStrategy).toBe('ROUTINE_ONLY_NO_COMMERCE');
    expect(result.primarySuggestion.rank).toBe('primary');
  });

  test('low_mood keeps trip secondary and max two secondary cards', () => {
    const result = buildHomeOrchestration({
      activeState: 'low_mood',
      timeContext: 'day',
      environment: 'bathtub',
      healthConditions: ['none'],
      hasProfile: true,
      productCandidateAvailable: true,
      selectedThemeId: 'kyoto_forest',
    });

    expect(result.secondarySuggestions.length).toBeLessThanOrEqual(2);
    expect(result.secondarySuggestions[0].mode).toBe('trip');
  });

  test('W13: engine conflict resolved keeps only primary suggestion', () => {
    const result = buildHomeOrchestration({
      activeState: 'cant_sleep',
      timeContext: 'morning',
      environment: 'bathtub',
      healthConditions: ['none'],
      hasProfile: true,
      productCandidateAvailable: true,
      selectedThemeId: 'kyoto_forest',
    });

    expect(result.baseMode).toBe('sleep');
    expect(result.selectedMode).toBe('recovery');
    expect(result.engineConflictResolved).toBe(true);
    expect(result.secondarySuggestions).toHaveLength(0);
    expect(result.primarySuggestion.rank).toBe('primary');
  });

  test('normalizeEnvironmentInput maps legacy footbath to partial_bath', () => {
    expect(normalizeEnvironmentInput('footbath')).toBe('partial_bath');
  });

  test('buildSuggestionExplanation returns required fields for care suggestion', () => {
    const explanation = buildSuggestionExplanation(
      {
        id: 'home_primary_sleep',
        rank: 'primary',
        mode: 'care',
        title: '수면 준비 Care 의식',
        subtitle: '긴장을 낮추고 취침 전 의식을 준비해요.',
      },
      'cant_sleep',
      'sleep'
    );

    expect(explanation.stateLabel).toBeTruthy();
    expect(explanation.whySummary).toBeTruthy();
    expect(explanation.routineParams).toContain('38~41');
    expect(explanation.expectedGoal).toBeTruthy();
    expect(explanation.alternativeRoutine).toBeTruthy();
  });

  test('buildSuggestionExplanation returns narrative data for trip suggestion', () => {
    const explanation = buildSuggestionExplanation(
      {
        id: 'home_secondary_trip_kyoto_forest',
        rank: 'secondary_1',
        mode: 'trip',
        title: '감성 Trip 의식',
        subtitle: '테마 몰입으로 분위기를 전환해요.',
        themeId: 'kyoto_forest',
      },
      'low_mood',
      'recovery'
    );

    expect(explanation.narrativeHeadline).toContain('Kyoto Forest');
    expect(explanation.atmosphereChips?.length).toBeGreaterThan(0);
  });
});
