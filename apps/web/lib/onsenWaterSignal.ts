import type { OnsenCandidate } from './onsenCatalog';

type WaterSignalCandidate = Pick<OnsenCandidate, 'contexts' | 'verdict' | 'waterDecision'>;

const confirmedDirectSourceFactCode = 'water_kakenagashi';

export function hasConfirmedWaterKakenagashi(candidate: Pick<OnsenCandidate, 'verdict'>) {
  return candidate.verdict?.factStatuses.some((fact) => fact.code === confirmedDirectSourceFactCode && fact.status === 'confirmed') ?? false;
}

export function getOnsenWaterHighlightMark(candidate: Pick<OnsenCandidate, 'verdict' | 'waterDecision'>) {
  const text = `${candidate.waterDecision.springType} ${candidate.waterDecision.operation}`;

  if (hasConfirmedWaterKakenagashi(candidate) || (!candidate.verdict && text.includes('직수'))) {
    return {
      label: '직수 온천',
      tone: 'water-source',
      title: '직수 온천 공식 확인',
    };
  }

  if (text.includes('100%') || text.includes('천연온천') || text.includes('천연 온천')) {
    return {
      label: '천연온천',
      tone: 'water-natural',
      title: '천연온천 단서',
    };
  }

  return null;
}

export function hasOnsenWaterCriterion(candidate: WaterSignalCandidate, criterion: string) {
  if (criterion === 'direct_source' && candidate.verdict) {
    return hasConfirmedWaterKakenagashi(candidate);
  }

  return candidate.contexts?.water.some((value) => value === criterion) ?? false;
}

export function getOnsenWaterSortRank(candidate: Pick<OnsenCandidate, 'verdict' | 'waterDecision'>) {
  const waterHighlightMark = getOnsenWaterHighlightMark(candidate);

  if (waterHighlightMark?.tone === 'water-source') return 0;
  if (waterHighlightMark?.tone === 'water-natural') return 1;

  return 2;
}
