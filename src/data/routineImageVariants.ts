import {
  BathEnvironment,
  CanonicalBathEnvironment,
  IntentCard,
} from '@/src/engine/types';

export type RoutineImageVariant = 'lite' | 'deep';

export function normalizeImageEnvironment(
  environment: BathEnvironment
): CanonicalBathEnvironment {
  if (environment === 'footbath') return 'partial_bath';
  return environment;
}

export function getImageVariantForEnvironment(
  environment: BathEnvironment
): RoutineImageVariant {
  return normalizeImageEnvironment(environment) === 'shower' ? 'lite' : 'deep';
}

export function resolveIntentImageEnvironment(
  intent: Pick<IntentCard, 'allowed_environments'>,
  selectedEnvironment: CanonicalBathEnvironment
): CanonicalBathEnvironment {
  if (intent.allowed_environments.includes(selectedEnvironment)) {
    return selectedEnvironment;
  }

  return intent.allowed_environments[0] ?? selectedEnvironment;
}
