import type { OnsenCandidate } from './onsenCatalog';

type WaterSignalCandidate = Pick<OnsenCandidate, 'contexts' | 'verdict' | 'waterDecision' | 'waterProfile'>;

const confirmedDirectSourceFactCode = 'water_kakenagashi';

export function hasConfirmedWaterKakenagashi(candidate: Pick<OnsenCandidate, 'verdict' | 'waterProfile'>) {
  if (candidate.waterProfile?.canonicalMethod === 'kakenagashi' || candidate.waterProfile?.canonicalMethod === 'kakenagashi_pure') return true;
  return candidate.verdict?.factStatuses.some((fact) => fact.code === confirmedDirectSourceFactCode && fact.status === 'confirmed') ?? false;
}

export function getOnsenWaterHighlightMark(candidate: Pick<OnsenCandidate, 'verdict' | 'waterDecision' | 'waterProfile'>) {
  const text = `${candidate.waterDecision.springType} ${candidate.waterDecision.operation}`;

  if (candidate.waterProfile?.canonicalMethod === 'kakenagashi_pure') {
    return {
      label: '순수직수',
      tone: 'gold',
      title: '공식 정보에서 원천 그대로 흘려보내는 방식으로 확인',
    };
  }

  if (candidate.waterProfile?.canonicalMethod === 'kakenagashi') {
    return {
      label: '직수',
      tone: 'silver',
      title: '공식 정보에서 온천수를 흘려보내는 방식으로 확인',
    };
  }

  if (candidate.waterProfile?.canonicalMethod === 'junkan') {
    return {
      label: '순환식 온천',
      tone: 'bronze',
      title: '공식 정보에서 온천수를 순환·여과해 사용하는 방식으로 확인',
    };
  }

  if (hasConfirmedWaterKakenagashi(candidate) || (!candidate.verdict && text.includes('직수'))) {
    return {
      label: '직수',
      tone: 'silver',
      title: '공식 정보에서 온천수를 흘려보내는 방식으로 확인',
    };
  }

  return null;
}

export function hasOnsenWaterCriterion(candidate: WaterSignalCandidate, criterion: string) {
  if (criterion === 'kakenagashi_pure') {
    return candidate.waterProfile?.canonicalMethod === 'kakenagashi_pure' || candidate.contexts?.water.some((value) => value === 'kakenagashi_pure') || false;
  }

  if (criterion === 'kakenagashi') {
    return hasConfirmedWaterKakenagashi(candidate);
  }

  return candidate.contexts?.water.some((value) => value === criterion) ?? false;
}

export function getOnsenWaterSortRank(candidate: Pick<OnsenCandidate, 'verdict' | 'waterDecision' | 'waterProfile'>) {
  if (candidate.waterProfile?.canonicalMethod === 'kakenagashi_pure') return 0;
  if (candidate.waterProfile?.canonicalMethod === 'kakenagashi') return 1;

  const waterHighlightMark = getOnsenWaterHighlightMark(candidate);

  if (waterHighlightMark?.tone === 'silver') return 1;
  if (waterHighlightMark?.tone === 'bronze') return 2;

  return 3;
}
