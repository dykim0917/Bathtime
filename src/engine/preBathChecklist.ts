import { BathRecommendation } from '@/src/engine/types';
import { buildSafetyChecklist } from '@/src/engine/safetyChecklist';
import { formatDuration } from '@/src/utils/time';
import { formatTemperature } from '@/src/utils/temperature';

export interface PreBathChecklistItem {
  id: string;
  title: string;
  body: string;
  source: 'base' | 'warning' | 'history';
}

interface BuildPreBathChecklistOptions {
  source?: string;
}

const ENVIRONMENT_LABELS: Record<BathRecommendation['environmentUsed'], string> = {
  bathtub: '욕조',
  partial_bath: '부분입욕',
  footbath: '족욕',
  shower: '샤워',
};

export function buildPreBathChecklist(
  recommendation: BathRecommendation,
  options: BuildPreBathChecklistOptions = {}
): PreBathChecklistItem[] {
  const items: PreBathChecklistItem[] = [
    {
      id: 'temperature-duration',
      title: '수온과 시간을 다시 확인했어요.',
      body: `${formatTemperature(recommendation.temperature)} · ${formatDuration(recommendation.durationMinutes)} 기준으로 진행할게요.`,
      source: 'base',
    },
    {
      id: 'environment-ready',
      title: buildEnvironmentTitle(recommendation),
      body: buildEnvironmentBody(recommendation),
      source: 'base',
    },
    options.source === 'history'
      ? {
          id: 'history-replay',
          title: '오늘 컨디션으로 다시 시작해도 괜찮아요.',
          body: '이전에 저장한 루틴이지만, 지금 몸 상태와 환경에도 무리 없는지 다시 확인했어요.',
          source: 'history',
        }
      : {
          id: 'hydration-ready',
          title: '입욕 전 물 한 잔을 준비했어요.',
          body: '입욕 전후로 천천히 수분을 보충하면서 진행할게요.',
          source: 'base',
        },
  ];

  if (recommendation.safetyWarnings.length > 0) {
    const warningItems = buildSafetyChecklist(recommendation.safetyWarnings).map(
      (line, index): PreBathChecklistItem => ({
        id: `warning-${index}`,
        title: line,
        body: '이 항목을 지키면서 진행할게요.',
        source: 'warning',
      })
    );
    items.push(...warningItems);
  }

  return dedupeItems(items);
}

function buildEnvironmentTitle(recommendation: BathRecommendation): string {
  if (recommendation.bathType === 'shower') {
    return '샤워 동선과 바닥 상태를 정리했어요.';
  }

  if (recommendation.bathType === 'foot') {
    return '족욕 높이와 물 상태를 편안하게 맞췄어요.';
  }

  return '입욕 환경을 편안하게 맞췄어요.';
}

function buildEnvironmentBody(recommendation: BathRecommendation): string {
  if (recommendation.bathType === 'shower') {
    return '미끄럽지 않게 정리하고, 수건과 필요한 준비물을 손 닿는 곳에 두었어요.';
  }

  if (recommendation.bathType === 'foot') {
    return '발을 무리 없이 담글 수 있는 높이와 미지근한 물 상태를 다시 확인했어요.';
  }

  const environment = ENVIRONMENT_LABELS[recommendation.environmentUsed] ?? '입욕 환경';
  return `${environment}에서 몸에 무리 없는 높이와 동선을 확인하고 시작할게요.`;
}

function dedupeItems(items: PreBathChecklistItem[]): PreBathChecklistItem[] {
  const seen = new Set<string>();
  const result: PreBathChecklistItem[] = [];

  for (const item of items) {
    const key = `${item.title}::${item.body}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}
