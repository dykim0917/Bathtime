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
      label: '원천 100% 직수',
      tone: 'water-source',
      title: '원천을 흘려보내는 직수 방식으로 확인',
    };
  }

  if (/100%\s*천연|천연온천|천연 온천/.test(text)) {
    return {
      label: '천연온천 표기',
      tone: 'water-natural',
      title: '천연온천 표기 단서',
    };
  }

  return null;
}

export function hasOnsenWaterCriterion(candidate: WaterSignalCandidate, criterion: string) {
  if (criterion === 'direct_source' && candidate.verdict) {
    return hasConfirmedWaterKakenagashi(candidate) || (candidate.contexts?.water.some((value) => value === criterion) ?? false);
  }

  return candidate.contexts?.water.some((value) => value === criterion) ?? false;
}

export function getOnsenWaterSortRank(candidate: Pick<OnsenCandidate, 'verdict' | 'waterDecision'>) {
  const waterHighlightMark = getOnsenWaterHighlightMark(candidate);

  if (waterHighlightMark?.tone === 'water-source') return 0;
  if (waterHighlightMark?.tone === 'water-natural') return 1;

  return 2;
}
