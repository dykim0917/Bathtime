import { BathRecommendation } from '@/src/engine/types';
import { buildSafetyChecklist } from '@/src/engine/safetyChecklist';

export interface PreBathChecklistItem {
  id: string;
  title: string;
  body: string;
  source: 'base' | 'warning' | 'history';
}

interface BuildPreBathChecklistOptions {
  source?: string;
}

const BLOCKING_WARNING_KEYWORDS = ['고혈압', '심장', '임신', '음주', '숙취'];
const NORDIC_THEME_IDS = new Set(['nordic_sauna']);

export function shouldRequirePreBathGate(
  recommendation: BathRecommendation
): boolean {
  return (
    isContrastProtocol(recommendation) ||
    recommendation.safetyWarnings.some((warning) => isBlockingWarning(warning))
  );
}

export function buildPreBathChecklist(
  recommendation: BathRecommendation,
  options: BuildPreBathChecklistOptions = {}
): PreBathChecklistItem[] {
  if (!shouldRequirePreBathGate(recommendation)) {
    return [];
  }

  const items: PreBathChecklistItem[] = [];

  if (options.source === 'history') {
    items.push({
      id: 'history-replay',
      title: '이전에 저장한 루틴이라도 오늘 몸 상태 기준으로 다시 볼게요.',
      body: '같은 루틴이어도 지금 컨디션에 무리가 없는지 한 번 더 확인하고 시작할게요.',
      source: 'history',
    });
  }

  if (isContrastProtocol(recommendation)) {
    items.push(
      {
        id: 'contrast-gentle-cool',
        title: '차가운 단계는 짧고 부드럽게만 진행할게요.',
        body: '노르딕 루틴은 갑자기 차가운 물에 들어가지 않고 손발부터 짧게 식히는 방식으로 진행해요.',
        source: 'warning',
      },
      {
        id: 'contrast-rest-cycle',
        title: '따뜻한 단계와 쉬는 단계를 끊어서 따라갈게요.',
        body: '한 번에 오래 버티기보다 짧게 식히고 다시 쉬는 순서를 지키는 게 핵심이에요.',
        source: 'warning',
      }
    );
  }

  const warningItems = buildSafetyChecklist(recommendation.safetyWarnings)
    .slice(0, 2)
    .map(
      (line, index): PreBathChecklistItem => ({
        id: `warning-${index}`,
        title: line,
        body: buildWarningBody(line),
        source: 'warning',
      })
    );

  items.push(...warningItems);

  return dedupeItems(items).slice(0, options.source === 'history' ? 3 : 2);
}

function isContrastProtocol(recommendation: BathRecommendation): boolean {
  return (
    NORDIC_THEME_IDS.has(recommendation.themeId ?? '') ||
    NORDIC_THEME_IDS.has(recommendation.intentId ?? '')
  );
}

function isBlockingWarning(text: string): boolean {
  return BLOCKING_WARNING_KEYWORDS.some((keyword) => text.includes(keyword));
}

function buildWarningBody(line: string): string {
  if (line.includes('38°C')) {
    return '권장 수온을 넘기지 않고 짧게 진행할게요.';
  }

  if (line.includes('족욕')) {
    return '전신 입욕은 건너뛰고, 미지근한 족욕만 짧게 진행할게요.';
  }

  if (line.includes('오일')) {
    return '제외해야 하는 성분은 쓰지 않고 가장 순한 방식으로 진행할게요.';
  }

  if (line.includes('즉시 중단') || line.includes('무리하지')) {
    return '조금이라도 불편하면 바로 멈추고 쉬는 쪽으로 잡을게요.';
  }

  return '이 제약을 먼저 지키고 시작할게요.';
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
