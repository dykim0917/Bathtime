import {
  ActiveState,
  BathEnvironment,
  CanonicalBathEnvironment,
  DailyTag,
  FallbackStrategy,
  HealthCondition,
  HomeOrchestrationContract,
  HomeSuggestion,
  SuggestionExplanation,
  ThemeId,
  TimeContext,
} from './types';
import { THEME_BY_ID } from '@/src/data/themes';

interface BuildHomeOrchestrationInput {
  activeState: ActiveState;
  timeContext: TimeContext;
  environment: BathEnvironment;
  healthConditions: HealthCondition[];
  hasProfile: boolean;
  productCandidateAvailable: boolean;
  selectedThemeId: ThemeId;
}

const ACTIVE_STATE_LABEL: Record<ActiveState, string> = {
  tension: '긴장되어 있어요',
  heavy: '몸이 무거워요',
  cant_sleep: '잠이 잘 오지 않아요',
  low_mood: '기분이 가라앉아 있어요',
  want_reset: '빠르게 리셋하고 싶어요',
};

const BASE_MODE_BY_STATE: Record<ActiveState, 'sleep' | 'recovery' | 'reset'> = {
  tension: 'recovery',
  heavy: 'recovery',
  cant_sleep: 'sleep',
  low_mood: 'recovery',
  want_reset: 'reset',
};

const TAGS_BY_MODE: Record<'sleep' | 'recovery' | 'reset', DailyTag[]> = {
  sleep: ['insomnia'],
  recovery: ['muscle_pain'],
  reset: ['stress'],
};

function hasHighRiskCondition(healthConditions: HealthCondition[]): boolean {
  return healthConditions.some((condition) =>
    ['hypertension_heart', 'pregnant'].includes(condition)
  );
}

function hasResetContraindication(healthConditions: HealthCondition[]): boolean {
  return healthConditions.some((condition) =>
    ['hypertension_heart', 'pregnant', 'diabetes'].includes(condition)
  );
}

export function normalizeEnvironmentInput(environment: BathEnvironment): CanonicalBathEnvironment {
  if (environment === 'footbath') return 'partial_bath';
  return environment;
}

export function selectModeByPolicy(
  activeState: ActiveState,
  timeContext: TimeContext
): 'sleep' | 'recovery' | 'reset' {
  if (timeContext === 'late_night' && activeState !== 'want_reset') {
    return 'sleep';
  }
  if (timeContext === 'morning' && activeState === 'cant_sleep') {
    return 'recovery';
  }
  if ((timeContext === 'day' || timeContext === 'evening') && activeState === 'tension') {
    return 'recovery';
  }
  return BASE_MODE_BY_STATE[activeState];
}

function selectFallbackStrategy(input: BuildHomeOrchestrationInput): FallbackStrategy {
  if (hasHighRiskCondition(input.healthConditions)) {
    return 'SAFE_ROUTINE_ONLY';
  }

  const selectedMode = selectModeByPolicy(input.activeState, input.timeContext);
  if (selectedMode === 'reset' && hasResetContraindication(input.healthConditions)) {
    return 'RESET_WITHOUT_COLD';
  }

  if (!input.hasProfile) {
    return 'DEFAULT_STARTER_RITUAL';
  }

  if (!input.productCandidateAvailable) {
    return 'ROUTINE_ONLY_NO_COMMERCE';
  }

  return 'none';
}

function buildPrimarySuggestion(
  mode: 'sleep' | 'recovery' | 'reset',
  fallback: FallbackStrategy
): HomeSuggestion {
  if (fallback === 'DEFAULT_STARTER_RITUAL') {
    return {
      id: 'home_primary_starter',
      rank: 'primary',
      mode: 'care',
      title: '기본 케어 루틴',
      subtitle: '처음이라 안전한 기본 루틴부터 시작해요.',
      dailyTags: ['stress'],
    };
  }

  if (fallback === 'SAFE_ROUTINE_ONLY') {
    return {
      id: 'home_primary_safe_only',
      rank: 'primary',
      mode: 'care',
      title: '안전 우선 루틴',
      subtitle: '현재 상태를 고려해 안전한 루틴만 보여드려요.',
      dailyTags: ['stress'],
    };
  }

  if (fallback === 'RESET_WITHOUT_COLD') {
    return {
      id: 'home_primary_reset_safe',
      rank: 'primary',
      mode: 'care',
      title: '전환 케어 루틴',
      subtitle: '안전을 위해 냉수 단계 없이 진행해요.',
      dailyTags: ['stress'],
    };
  }

  if (mode === 'sleep') {
    return {
      id: 'home_primary_sleep',
      rank: 'primary',
      mode: 'care',
      title: '수면 준비 케어 루틴',
      subtitle: '긴장을 낮추고 취침 전 루틴을 준비해요.',
      dailyTags: TAGS_BY_MODE.sleep,
    };
  }

  if (mode === 'reset') {
    return {
      id: 'home_primary_reset',
      rank: 'primary',
      mode: 'care',
      title: '전환 케어 루틴',
      subtitle: '짧은 집중 전환 루틴으로 리듬을 바꿔요.',
      dailyTags: TAGS_BY_MODE.reset,
    };
  }

  return {
    id: 'home_primary_recovery',
    rank: 'primary',
    mode: 'care',
    title: '회복 케어 루틴',
    subtitle: '몸의 피로를 줄이는 기본 회복 루틴이에요.',
    dailyTags: TAGS_BY_MODE.recovery,
  };
}

function buildAlternativeCare(mode: 'sleep' | 'recovery' | 'reset'): HomeSuggestion {
  const alternativeMode: 'sleep' | 'recovery' | 'reset' =
    mode === 'sleep' ? 'recovery' : 'sleep';

  return {
    id: `home_secondary_care_${alternativeMode}`,
    rank: 'secondary_2',
    mode: 'care',
    title: alternativeMode === 'sleep' ? '가벼운 수면 루틴' : '가벼운 회복 루틴',
    subtitle: '오늘 컨디션에 맞춘 부드러운 대안 루틴입니다.',
    dailyTags: TAGS_BY_MODE[alternativeMode],
  };
}

function buildTripSecondary(selectedThemeId: ThemeId): HomeSuggestion {
  return {
    id: `home_secondary_trip_${selectedThemeId}`,
    rank: 'secondary_1',
    mode: 'trip',
    title: '무드 루틴',
    subtitle: '테마에 맞춰 분위기를 전환해요.',
    themeId: selectedThemeId,
  };
}

function buildInsightStrip(fallback: FallbackStrategy, timeContext: TimeContext): string {
  if (fallback === 'DEFAULT_STARTER_RITUAL') {
    return '처음이라 기본 루틴을 먼저 보여드려요.';
  }
  if (fallback === 'SAFE_ROUTINE_ONLY') {
    return '안전을 위해 보수적인 루틴만 보여드려요.';
  }
  if (fallback === 'RESET_WITHOUT_COLD') {
    return '안전을 위해 냉수 단계는 자동으로 제외됐어요.';
  }
  if (fallback === 'ROUTINE_ONLY_NO_COMMERCE') {
    return '준비물 없이 루틴부터 시작할 수 있어요.';
  }
  if (timeContext === 'late_night') {
    return '늦은 시간이라 수면 준비 루틴을 먼저 추천해요.';
  }
  return '오늘 상태에 맞춰 루틴을 추천했어요.';
}

export function buildHomeOrchestration(
  input: BuildHomeOrchestrationInput
): HomeOrchestrationContract {
  const baseMode = BASE_MODE_BY_STATE[input.activeState];
  const mode = selectModeByPolicy(input.activeState, input.timeContext);
  const fallbackStrategy = selectFallbackStrategy(input);
  const engineConflictResolved = baseMode !== mode;

  const primarySuggestion = buildPrimarySuggestion(mode, fallbackStrategy);
  const secondarySuggestions: HomeSuggestion[] = [];

  const allowTripSecondary =
    !engineConflictResolved &&
    (fallbackStrategy === 'none' || fallbackStrategy === 'ROUTINE_ONLY_NO_COMMERCE');

  if (
    allowTripSecondary &&
    (input.activeState === 'low_mood' || input.activeState === 'want_reset')
  ) {
    secondarySuggestions.push(buildTripSecondary(input.selectedThemeId));
  }

  if (!engineConflictResolved && fallbackStrategy !== 'SAFE_ROUTINE_ONLY') {
    secondarySuggestions.push(buildAlternativeCare(mode));
  }

  return {
    todaySignal: ACTIVE_STATE_LABEL[input.activeState],
    baseMode,
    selectedMode: mode,
    engineConflictResolved,
    primarySuggestion,
    secondarySuggestions: secondarySuggestions.slice(0, 2),
    quickActions: ['바로 시작', '기록 보기', '환경 바꾸기'],
    insightStrip: engineConflictResolved
      ? '조건이 겹칠 때는 더 안전한 루틴을 먼저 추천해요.'
      : buildInsightStrip(fallbackStrategy, input.timeContext),
    fallbackStrategy,
    priorityResolution: 'CARE_PRIMARY__TRIP_SECONDARY',
  };
}

export function buildSuggestionExplanation(
  suggestion: HomeSuggestion,
  activeState: ActiveState,
  selectedMode: 'sleep' | 'recovery' | 'reset'
): SuggestionExplanation {
  const stateLabelMap: Record<ActiveState, string> = {
    tension: '긴장형 피로',
    heavy: '신체 피로 누적형',
    cant_sleep: '수면 준비 필요형',
    low_mood: '정서 저활성형',
    want_reset: '빠른 전환 필요형',
  };

  if (suggestion.mode === 'trip') {
    const theme = suggestion.themeId ? THEME_BY_ID[suggestion.themeId] : null;
    const themeTitle = theme?.title ?? '오늘의 테마';
    return {
      stateLabel: stateLabelMap[activeState],
      whySummary: '현재 상태에서 분위기 전환이 도움이 될 것 같아 무드 루틴을 함께 제안해요.',
      routineParams: '테마 중심 루틴으로, 환경에 맞춰 강도와 길이를 조절해요.',
      expectedGoal: '짧은 시간 안에 분위기를 바꾸고 감각을 다시 정리하는 데 도움을 줘요.',
      alternativeRoutine: '원하면 컨디션 루틴으로 바꿔 더 무난하게 시작할 수도 있어요.',
      narrativeHeadline: `오늘은 ${themeTitle} 분위기로 쉬어가요.`,
      atmosphereChips: [
        theme ? `향: ${theme.recScent}` : '향: 테마 추천',
        theme ? `톤: ${themeTitle} 무드` : '톤: 차분한 무드',
        '사운드: 차분한 배경음',
      ],
    };
  }

  const paramsByMode: Record<typeof selectedMode, string> = {
    sleep: '38~41°C, 10~15분, 저자극 중심',
    recovery: '40~42°C(고위험군 <=40°C), 10~15분',
    reset: '기본 non-cold activation, 짧은 전환 루틴',
  };

  const whyByMode: Record<typeof selectedMode, string> = {
    sleep: '심야/수면 준비 신호를 우선 해석해 긴장 완화를 목표로 구성했습니다.',
    recovery: '신체 피로 신호를 우선 해석해 회복 중심 파라미터로 구성했습니다.',
    reset: '빠른 리듬 전환 신호를 반영해 짧고 안전한 리셋 루틴으로 구성했습니다.',
  };

  return {
    stateLabel: stateLabelMap[activeState],
    whySummary: whyByMode[selectedMode],
    routineParams: paramsByMode[selectedMode],
    expectedGoal: '오늘 컨디션에서 실행 가능한 루틴 완주를 최우선 목표로 합니다.',
    alternativeRoutine: selectedMode === 'sleep' ? '가벼운 회복 루틴' : '가벼운 수면 준비 루틴',
  };
}
