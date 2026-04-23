import {
  BathEnvironment,
  BathRecommendation,
  CanonicalBathEnvironment,
  SubProtocolOption,
} from './types';

function normalizeEnvironment(environment: BathEnvironment): CanonicalBathEnvironment {
  if (environment === 'footbath') return 'partial_bath';
  return environment;
}

function environmentLabel(environment: CanonicalBathEnvironment): string {
  switch (environment) {
    case 'shower':
      return '샤워';
    case 'partial_bath':
      return '족욕';
    case 'bathtub':
    default:
      return '욕조';
  }
}

export function applySubProtocolOverrides(
  recommendation: BathRecommendation,
  option: SubProtocolOption,
  selectedEnvironment: BathEnvironment,
  intentId: string
): BathRecommendation {
  const next = { ...recommendation };
  const delta = option.partialOverrides.duration_delta ?? 0;
  if (next.durationMinutes !== null) {
    next.durationMinutes = Math.min(20, Math.max(5, next.durationMinutes + delta));
  }

  if (option.partialOverrides.lighting_adjustment) {
    next.lighting = `${next.lighting} · ${option.partialOverrides.lighting_adjustment}`;
  }

  if (option.partialOverrides.behavior_blocks.length > 0) {
    next.behaviorBlocks = option.partialOverrides.behavior_blocks;
  }

  const normalized = normalizeEnvironment(selectedEnvironment);
  const bias = option.partialOverrides.environment_bias;
  if (bias && bias !== normalized) {
    next.environmentHints = [
      ...(next.environmentHints ?? []),
      `이 선택은 ${environmentLabel(bias)}에서 더 편안할 수 있어요.`,
    ];
  }

  next.intentId = intentId;
  next.subProtocolId = option.id;

  return next;
}
