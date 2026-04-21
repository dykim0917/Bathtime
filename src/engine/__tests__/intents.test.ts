import {
  CARE_INTENT_CARDS,
  CARE_SUBPROTOCOL_OPTIONS,
  getCareCardSafetyBadge,
  getEnvironmentSubtitle,
  getEnvironmentUnavailableReason,
  pickAutoTripSubProtocol,
  TRIP_INTENT_CARDS,
  TRIP_SUBPROTOCOL_OPTIONS,
} from '@/src/data/intents';

describe('intents data integrity', () => {
  test('all care cards have 1~3 subprotocol options and default option exists', () => {
    CARE_INTENT_CARDS.forEach((card) => {
      const options = CARE_SUBPROTOCOL_OPTIONS[card.intent_id] ?? [];
      expect(options.length).toBeGreaterThanOrEqual(1);
      expect(options.length).toBeLessThanOrEqual(3);
      expect(options.some((option) => option.id === card.default_subprotocol_id)).toBe(true);
      expect(options.filter((option) => option.is_default).length).toBe(1);
    });
  });

  test('all trip cards have 1~3 subprotocol options and default option exists', () => {
    TRIP_INTENT_CARDS.forEach((card) => {
      const options = TRIP_SUBPROTOCOL_OPTIONS[card.intent_id] ?? [];
      expect(options.length).toBeGreaterThanOrEqual(1);
      expect(options.length).toBeLessThanOrEqual(3);
      expect(options.some((option) => option.id === card.default_subprotocol_id)).toBe(true);
      expect(options.filter((option) => option.is_default).length).toBe(1);
    });
  });

  test('auto trip selection prefers shower-friendly quick options when available', () => {
    expect(pickAutoTripSubProtocol('nordic_sauna', 'shower')?.id).toBe('trip_nordic_quick');
  });

  test('auto trip selection prefers longer bathtub options when available', () => {
    expect(pickAutoTripSubProtocol('kyoto_forest', 'bathtub')?.id).toBe('trip_kyoto_deep');
  });

  test('auto trip selection falls back to default when no deeper bathtub option exists', () => {
    expect(pickAutoTripSubProtocol('rainy_camping', 'bathtub')?.id).toBe('trip_rainy_balanced');
  });

  test('hangover card is partial-bath only and explains the restriction elsewhere', () => {
    const card = CARE_INTENT_CARDS.find((item) => item.intent_id === 'hangover_relief');
    expect(card?.allowed_environments).toEqual(['partial_bath']);
    expect(getEnvironmentUnavailableReason(card!, 'bathtub')).toContain('족욕');
  });

  test('edema card does not present shower as a main solution', () => {
    const card = CARE_INTENT_CARDS.find((item) => item.intent_id === 'edema_relief');
    expect(card?.allowed_environments).toEqual(['partial_bath', 'bathtub']);
    expect(getEnvironmentUnavailableReason(card!, 'shower')).toContain('욕조');
  });

  test('sensitive skin adds low-irritation card messaging', () => {
    const card = CARE_INTENT_CARDS.find((item) => item.intent_id === 'stress_relief');
    expect(getEnvironmentSubtitle(card!, 'bathtub', ['sensitive_skin'])).toContain('저자극');
    expect(getCareCardSafetyBadge(card!, ['sensitive_skin'])).toBe('저자극 조정');
  });
});
