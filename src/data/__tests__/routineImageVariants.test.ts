import {
  getImageVariantForEnvironment,
  resolveIntentImageEnvironment,
} from '@/src/data/routineImageVariants';
import {
  CARE_CARD_IMAGES,
  getCareCardImage,
  getCareCardImageForEnvironment,
} from '@/src/data/careImages';
import { IntentCard } from '@/src/engine/types';

const partialOnlyIntent: Pick<IntentCard, 'allowed_environments'> = {
  allowed_environments: ['partial_bath'],
};

const allEnvironmentIntent: Pick<IntentCard, 'allowed_environments'> = {
  allowed_environments: ['bathtub', 'partial_bath', 'shower'],
};

describe('routine image variants', () => {
  test('maps shower to lite imagery', () => {
    expect(getImageVariantForEnvironment('shower')).toBe('lite');
  });

  test('maps water-based environments to deep imagery', () => {
    expect(getImageVariantForEnvironment('bathtub')).toBe('deep');
    expect(getImageVariantForEnvironment('partial_bath')).toBe('deep');
    expect(getImageVariantForEnvironment('footbath')).toBe('deep');
  });

  test('uses the selected environment when the card supports it', () => {
    expect(resolveIntentImageEnvironment(allEnvironmentIntent, 'shower')).toBe('shower');
  });

  test('falls back to the card representative environment when selected environment is unavailable', () => {
    expect(resolveIntentImageEnvironment(partialOnlyIntent, 'shower')).toBe('partial_bath');
  });

  test('care image lookup follows environment variants', () => {
    expect(getCareCardImageForEnvironment('sleep_ready', 'shower')).toBe(
      CARE_CARD_IMAGES.sleep_ready.lite
    );
    expect(getCareCardImageForEnvironment('sleep_ready', 'partial_bath')).toBe(
      CARE_CARD_IMAGES.sleep_ready.deep
    );
  });

  test('care image lookup safely falls back when no asset is registered', () => {
    expect(getCareCardImage('unknown_intent', 'deep')).toBeNull();
  });
});
