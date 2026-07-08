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
      label: '원천 직수 확인',
      tone: 'water-source',
      title: '원천을 흘려보내는 직수 방식으로 확인',
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

  return 1;
}
