import { copy } from '@/src/content/copy';
import { FallbackStrategy, HomeModeType, HomeSuggestionRank } from './types';

export function toUserFacingFallbackLabel(fallback: FallbackStrategy): string {
  switch (fallback) {
    case 'DEFAULT_STARTER_RITUAL':
      return '처음이라 무난한 기본 루틴을 먼저 추천해요.';
    case 'SAFE_ROUTINE_ONLY':
      return '안전을 위해 보수적인 루틴만 보여드려요.';
    case 'RESET_WITHOUT_COLD':
      return '안전을 위해 냉수 단계 없이 진행해요.';
    case 'ROUTINE_ONLY_NO_COMMERCE':
      return '지금은 준비물 없이 루틴부터 시작할 수 있어요.';
    case 'none':
    default:
      return '오늘 상태에 맞춰 추천했어요.';
  }
}

export function toUserFacingModeHint(
  mode: HomeModeType,
  isConflictResolved: boolean
): string {
  if (isConflictResolved) {
    return copy.home.conflictBadge;
  }
  return copy.home.modeHint[mode];
}

export function toUserFacingRankLabel(rank: HomeSuggestionRank): string {
  return copy.home.rankLabel[rank];
}
