import { generateCareRecommendation, generateRecommendation, generateTripRecommendation } from '../recommend';
import { UserProfile, DailyTag } from '../types';

function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    bathEnvironment: 'bathtub',
    healthConditions: ['none'],
    onboardingComplete: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    ...overrides,
  };
}

describe('Full Recommendation Pipeline', () => {
  test('hypertension + muscle_pain → P1 with capped temp', () => {
    const profile = makeProfile({
      healthConditions: ['hypertension_heart'],
    });
    const result = generateRecommendation(profile, ['muscle_pain']);

    expect(result.persona).toBe('P1_SAFETY');
    expect(result.temperature.recommended).toBeLessThanOrEqual(38);
    expect(result.temperature.max).toBeLessThanOrEqual(38);
  });

  test('no tags selected → defaults to P4_SLEEP', () => {
    const profile = makeProfile();
    const result = generateRecommendation(profile, []);

    expect(result.persona).toBe('P4_SLEEP');
    expect(result.temperature.recommended).toBe(37);
  });

  test('insomnia + stress → P4_SLEEP', () => {
    const profile = makeProfile();
    const result = generateRecommendation(profile, ['insomnia', 'stress']);

    expect(result.persona).toBe('P4_SLEEP');
    expect(result.temperature.recommended).toBeLessThanOrEqual(38);
  });

  test('muscle_pain → P3_MUSCLE with high temp', () => {
    const profile = makeProfile();
    const result = generateRecommendation(profile, ['muscle_pain']);

    expect(result.persona).toBe('P3_MUSCLE');
    expect(result.temperature.recommended).toBe(41);
    expect(result.ingredients.some((i) => i.id === 'epsom_salt')).toBe(true);
  });

  test('cold + swelling → P2_CIRCULATION', () => {
    const profile = makeProfile();
    const result = generateRecommendation(profile, ['cold', 'swelling']);

    expect(result.persona).toBe('P2_CIRCULATION');
  });

  test('pregnant user is forced to safety persona and has no peppermint', () => {
    const profile = makeProfile({
      healthConditions: ['pregnant'],
    });
    const result = generateRecommendation(profile, ['muscle_pain']);

    expect(result.persona).toBe('P1_SAFETY');
    expect(result.ingredients.find((i) => i.id === 'peppermint_oil')).toBeUndefined();
  });

  test('hangover → forced foot bath with warning', () => {
    const profile = makeProfile();
    const result = generateRecommendation(profile, ['hangover']);

    expect(result.persona).toBe('P1_SAFETY');
    expect(result.bathType).toBe('foot');
    expect(result.temperature.recommended).toBeLessThanOrEqual(38);
    expect(result.safetyWarnings.length).toBeGreaterThan(0);
  });

  test('shower user gets shower bath type', () => {
    const profile = makeProfile({ bathEnvironment: 'shower' });
    const result = generateRecommendation(profile, ['stress']);

    expect(result.bathType).toBe('shower');
    expect(result.durationMinutes).toBeLessThanOrEqual(10);
  });

  test('footbath user gets foot bath type', () => {
    const profile = makeProfile({ bathEnvironment: 'footbath' });
    const result = generateRecommendation(profile, ['cold', 'swelling']);

    expect(result.bathType).toBe('foot');
  });

  test('muscle_pain + insomnia → conflict resolved with low temp', () => {
    const profile = makeProfile();
    const result = generateRecommendation(profile, [
      'muscle_pain',
      'insomnia',
    ]);

    // Lowest recommended wins: P3=41, P4=37 → 37
    expect(result.temperature.recommended).toBeLessThanOrEqual(38);
    // Should have ingredients from both personas
    expect(result.ingredients.some((i) => i.id === 'epsom_salt')).toBe(true);
    expect(result.ingredients.some((i) => i.id === 'lavender_oil')).toBe(true);
  });

  test('sensitive skin filters grapefruit', () => {
    const profile = makeProfile({
      healthConditions: ['sensitive_skin'],
    });
    const result = generateRecommendation(profile, ['cold', 'swelling']);

    // P2 suggests grapefruit, but sensitive_skin is a contraindication
    expect(result.ingredients.find((i) => i.id === 'grapefruit_oil')).toBeUndefined();
  });

  test('recommendation has valid id', () => {
    const profile = makeProfile();
    const result = generateRecommendation(profile, ['stress']);

    expect(result.id).toMatch(/^rec_\d+_[a-z0-9]{6}$/);
  });

  test('recommendation has persona color', () => {
    const profile = makeProfile();
    const result = generateRecommendation(profile, ['stress']);

    expect(result.colorHex).toBeTruthy();
    expect(result.colorHex).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  test('recommendation has music track', () => {
    const profile = makeProfile();
    const result = generateRecommendation(profile, ['stress']);

    expect(result.music).toBeTruthy();
    expect(result.music.id).toBeTruthy();
    expect(result.music.id).toBe('care_sleep_ready');
  });

  test('recommendation has ambience track', () => {
    const profile = makeProfile();
    const result = generateRecommendation(profile, ['stress']);

    expect(result.ambience).toBeTruthy();
    expect(result.ambience.id).toBeTruthy();
    expect(result.ambience.filename).toBeTruthy();
  });

  test('ambience track matches persona', () => {
    const profile = makeProfile();
    // muscle_pain triggers P3_MUSCLE
    const result = generateRecommendation(profile, ['muscle_pain']);

    expect(result.ambience.persona).toContain(result.persona);
  });

  test('care routines use dedicated music per intent id', () => {
    const profile = makeProfile();

    const sleep = generateCareRecommendation(profile, ['insomnia'], 'bathtub', 'sleep_ready');
    const muscle = generateCareRecommendation(profile, ['muscle_pain'], 'bathtub', 'muscle_relief');
    const stress = generateCareRecommendation(profile, ['stress'], 'bathtub', 'stress_relief');
    const mood = generateCareRecommendation(profile, ['depression'], 'bathtub', 'mood_lift');

    expect(sleep.music.id).toBe('care_sleep_ready');
    expect(muscle.music.id).toBe('care_muscle_relief');
    expect(stress.music.id).toBe('care_stress_relief');
    expect(mood.music.id).toBe('care_mood_lift');
    expect(stress.music.id).not.toBe(sleep.music.id);
    expect(mood.music.id).not.toBe(sleep.music.id);
  });

  test('trip themes use dedicated music per theme', () => {
    const profile = makeProfile();

    const kyoto = generateTripRecommendation(profile, 'kyoto_forest', 'bathtub');
    const paris = generateTripRecommendation(profile, 'midnight_paris', 'bathtub');

    expect(kyoto.music.id).toBe('trip_kyoto_forest');
    expect(paris.music.id).toBe('trip_midnight_paris');
    expect(kyoto.music.id).not.toBe(paris.music.id);
  });

  test('recommendation has lighting suggestion', () => {
    const profile = makeProfile();
    const result = generateRecommendation(profile, ['muscle_pain']);

    expect(result.lighting).toBeTruthy();
  });

  test('shower adds shower-specific ingredients', () => {
    const profile = makeProfile({ bathEnvironment: 'shower' });
    const result = generateRecommendation(profile, ['insomnia']);

    expect(
      result.ingredients.some((i) => i.id === 'shower_steamer') ||
      result.ingredients.some((i) => i.id === 'body_wash_relaxing')
    ).toBe(true);
  });

  test('shower removes bath-specific ingredients', () => {
    const profile = makeProfile({ bathEnvironment: 'shower' });
    const result = generateRecommendation(profile, ['cold']);

    // P2 has carbonated_bath, but shower should remove it
    expect(result.ingredients.find((i) => i.id === 'carbonated_bath')).toBeUndefined();
  });

  test('all tags selected: handles gracefully', () => {
    const profile = makeProfile();
    const allTags: DailyTag[] = [
      'muscle_pain',
      'swelling',
      'cold',
      'menstrual_pain',
      'hangover',
      'insomnia',
      'stress',
      'depression',
    ];
    const result = generateRecommendation(profile, allTags);

    // Hangover forces foot bath
    expect(result.bathType).toBe('foot');
    expect(result.temperature.recommended).toBeLessThanOrEqual(38);
    expect(result.safetyWarnings.length).toBeGreaterThan(0);
  });

  test('diabetes + muscle_pain caps recommended temp at 40C', () => {
    const profile = makeProfile({
      healthConditions: ['diabetes'],
    });
    const result = generateRecommendation(profile, ['muscle_pain']);

    expect(result.temperature.recommended).toBeLessThanOrEqual(40);
    expect(result.temperature.max).toBeLessThanOrEqual(40);
  });

  test('hypertension + pregnant: double safety applied', () => {
    const profile = makeProfile({
      healthConditions: ['hypertension_heart', 'pregnant'],
    });
    const result = generateRecommendation(profile, ['muscle_pain']);

    expect(result.persona).toBe('P1_SAFETY');
    expect(result.temperature.recommended).toBeLessThanOrEqual(38);
    expect(result.ingredients.find((i) => i.id === 'peppermint_oil')).toBeUndefined();
    expect(result.ingredients.find((i) => i.id === 'rosemary_oil')).toBeUndefined();
  });
});
