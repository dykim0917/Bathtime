import {
  CanonicalBathEnvironment,
  IntentCard,
  SubProtocolOption,
  TimeContext,
} from '@/src/engine/types';
import {
  GENERATED_TRIP_INTENT_CARDS,
  GENERATED_TRIP_SUBPROTOCOL_OPTIONS,
} from '@/src/data/generatedTripCatalog';

export const CARE_INTENT_CARDS: IntentCard[] = [
  {
    id: 'care_muscle_relief',
    domain: 'care',
    intent_id: 'muscle_relief',
    mapped_mode: 'recovery',
    allowed_environments: ['bathtub', 'partial_bath', 'shower'],
    copy_title: '운동 후 뻐근함을 풀어볼까요?',
    copy_subtitle_by_environment: {
      shower: '샤워 5분으로 가볍게 이완해요.',
      bathtub: '욕조 12분으로 깊게 풀어줘요.',
      partial_bath: '부분입욕 10분으로 하체를 먼저 풀어요.',
    },
    default_subprotocol_id: 'muscle_whole_body',
    card_position: 1,
  },
  {
    id: 'care_sleep_ready',
    domain: 'care',
    intent_id: 'sleep_ready',
    mapped_mode: 'sleep',
    allowed_environments: ['bathtub', 'partial_bath', 'shower'],
    copy_title: '잠들기 어려울 때 좋은 루틴',
    copy_subtitle_by_environment: {
      shower: '샤워 6분으로 잠들기 전 긴장을 낮춰요.',
      bathtub: '욕조 15분으로 수면 준비를 도와요.',
      partial_bath: '부분입욕 10분으로 몸을 천천히 가라앉혀요.',
    },
    default_subprotocol_id: 'sleep_sensitive',
    card_position: 2,
  },
  {
    id: 'care_hangover_relief',
    domain: 'care',
    intent_id: 'hangover_relief',
    mapped_mode: 'reset',
    allowed_environments: ['shower', 'bathtub'],
    copy_title: '술 마신 다음엔 이렇게 시작해보세요',
    copy_subtitle_by_environment: {
      shower: '샤워 5분으로 부담 없이 정리해요.',
      bathtub: '욕조 8분으로 몸을 부드럽게 풀어줘요.',
      partial_bath: '부분입욕보다 샤워 또는 욕조를 권장해요.',
    },
    default_subprotocol_id: 'hangover_sensitive',
    card_position: 3,
  },
  {
    id: 'care_edema_relief',
    domain: 'care',
    intent_id: 'edema_relief',
    mapped_mode: 'recovery',
    allowed_environments: ['partial_bath', 'bathtub', 'shower'],
    copy_title: '붓기가 느껴질 때 해보세요',
    copy_subtitle_by_environment: {
      shower: '샤워 6분으로 가볍게 순환 리듬을 만들어요.',
      bathtub: '욕조 10분으로 전신을 편안하게 풀어줘요.',
      partial_bath: '부분입욕 12분으로 하체 붓기에 집중해요.',
    },
    default_subprotocol_id: 'edema_lower',
    card_position: 4,
  },
  {
    id: 'care_cold_relief',
    domain: 'care',
    intent_id: 'cold_relief',
    mapped_mode: 'recovery',
    allowed_environments: ['bathtub', 'partial_bath'],
    copy_title: '감기 기운이 느껴질 때',
    copy_subtitle_by_environment: {
      shower: '샤워보다 욕조나 부분입욕을 권장해요.',
      bathtub: '욕조 10분으로 몸을 따뜻하게 풀어요.',
      partial_bath: '부분입욕 12분으로 몸을 천천히 덥혀요.',
    },
    default_subprotocol_id: 'cold_warm',
    card_position: 5,
  },
  {
    id: 'care_menstrual_relief',
    domain: 'care',
    intent_id: 'menstrual_relief',
    mapped_mode: 'recovery',
    allowed_environments: ['bathtub', 'partial_bath'],
    copy_title: '생리통이 있을 때',
    copy_subtitle_by_environment: {
      shower: '샤워보다 욕조나 부분입욕이 더 잘 맞아요.',
      bathtub: '욕조 12분으로 아랫배를 따뜻하게 풀어요.',
      partial_bath: '부분입욕 15분으로 하체를 집중적으로 덥혀요.',
    },
    default_subprotocol_id: 'menstrual_warm',
    card_position: 6,
  },
  {
    id: 'care_stress_relief',
    domain: 'care',
    intent_id: 'stress_relief',
    mapped_mode: 'reset',
    allowed_environments: ['bathtub', 'shower', 'partial_bath'],
    copy_title: '스트레스를 풀고 싶을 때',
    copy_subtitle_by_environment: {
      shower: '샤워 6분으로 긴장을 빠르게 덜어내요.',
      bathtub: '욕조 12분으로 조금 더 천천히 내려놓아요.',
      partial_bath: '부분입욕 10분으로 차분하게 전환해요.',
    },
    default_subprotocol_id: 'stress_deep',
    card_position: 7,
  },
  {
    id: 'care_mood_lift',
    domain: 'care',
    intent_id: 'mood_lift',
    mapped_mode: 'sleep',
    allowed_environments: ['bathtub', 'shower', 'partial_bath'],
    copy_title: '기분 전환이 필요할 때',
    copy_subtitle_by_environment: {
      shower: '샤워 5분으로 기분 리셋을 시작해요.',
      bathtub: '욕조 10분으로 기분을 부드럽게 들어올려요.',
      partial_bath: '부분입욕 10분으로 기분 전환을 시작해요.',
    },
    default_subprotocol_id: 'mood_warm',
    card_position: 8,
  },
];

const BASE_TRIP_INTENT_CARDS: IntentCard[] = [
  {
    id: 'trip_kyoto',
    domain: 'trip',
    intent_id: 'kyoto_forest',
    mapped_mode: 'recovery',
    allowed_environments: ['bathtub', 'partial_bath', 'shower'],
    copy_title: '교토 숲으로 잠깐 떠나볼까요?',
    copy_subtitle_by_environment: {
      shower: '샤워 5분, 숲 분위기로 전환해요.',
      bathtub: '욕조 12분, 숲 분위기에 천천히 잠겨요.',
      partial_bath: '부분입욕 10분, 잔잔하게 쉬어가요.',
    },
    default_subprotocol_id: 'trip_kyoto_balanced',
    card_position: 1,
  },
  {
    id: 'trip_nordic',
    domain: 'trip',
    intent_id: 'nordic_sauna',
    mapped_mode: 'recovery',
    allowed_environments: ['shower', 'bathtub', 'partial_bath'],
    copy_title: '노르딕 무드로 리셋해볼까요?',
    copy_subtitle_by_environment: {
      shower: '샤워 6분, 사우나 무드를 가볍게 느껴요.',
      bathtub: '욕조 12분, 따뜻하게 몰입해요.',
      partial_bath: '부분입욕 10분, 차분하게 전환해요.',
    },
    default_subprotocol_id: 'trip_nordic_balanced',
    card_position: 2,
  },
  {
    id: 'trip_rainy',
    domain: 'trip',
    intent_id: 'rainy_camping',
    mapped_mode: 'sleep',
    allowed_environments: ['bathtub', 'shower', 'partial_bath'],
    copy_title: '비 오는 캠핑 감성으로 쉬어가요',
    copy_subtitle_by_environment: {
      shower: '샤워 5분, 빗소리 무드로 정리해요.',
      bathtub: '욕조 12분, 비 오는 캠핑 무드로 쉬어요.',
      partial_bath: '부분입욕 10분, 차분하게 쉬어요.',
    },
    default_subprotocol_id: 'trip_rainy_balanced',
    card_position: 3,
  },
  {
    id: 'trip_snow',
    domain: 'trip',
    intent_id: 'snow_cabin',
    mapped_mode: 'sleep',
    allowed_environments: ['bathtub', 'partial_bath', 'shower'],
    copy_title: '스노우 캐빈 무드로 하루를 마무리해요',
    copy_subtitle_by_environment: {
      shower: '샤워 5분, 부드럽게 마무리해요.',
      bathtub: '욕조 12분, 포근하게 정리해요.',
      partial_bath: '부분입욕 10분, 잔잔하게 하루를 마무리해요.',
    },
    default_subprotocol_id: 'trip_snow_balanced',
    card_position: 4,
  },
];

export const TRIP_INTENT_CARDS: IntentCard[] = [
  ...BASE_TRIP_INTENT_CARDS,
  ...GENERATED_TRIP_INTENT_CARDS,
];

export const CARE_SUBPROTOCOL_OPTIONS: Record<string, SubProtocolOption[]> = {
  muscle_relief: [
    {
      id: 'muscle_lower_body',
      intent_id: 'muscle_relief',
      label: '하체가 뻐근해요',
      hint: '하체 중심으로 부드럽게 풀어줘요.',
      is_default: false,
      partialOverrides: {
        behavior_blocks: ['하체 가동 동작 1회'],
        duration_delta: 2,
        environment_bias: 'partial_bath',
      },
    },
    {
      id: 'muscle_upper_body',
      intent_id: 'muscle_relief',
      label: '어깨/목이 뻐근해요',
      hint: '상체 이완에 더 집중해요.',
      is_default: false,
      partialOverrides: {
        behavior_blocks: ['어깨/목 이완 동작 1회'],
        duration_delta: 1,
      },
    },
    {
      id: 'muscle_whole_body',
      intent_id: 'muscle_relief',
      label: '전신이 무거워요',
      hint: '전신을 고르게 풀어주는 기본 루틴이에요.',
      is_default: true,
      partialOverrides: {
        behavior_blocks: ['전신 이완 동작 1회'],
      },
    },
  ],
  sleep_ready: [
    {
      id: 'sleep_thinking',
      intent_id: 'sleep_ready',
      label: '생각이 많아요',
      hint: '호흡 구간으로 머리를 천천히 가라앉혀요.',
      is_default: false,
      partialOverrides: {
        behavior_blocks: ['호흡 1분'],
        lighting_adjustment: '조명 점진 감소',
        duration_delta: 2,
      },
    },
    {
      id: 'sleep_sensitive',
      intent_id: 'sleep_ready',
      label: '예민해서 잠이 안 와요',
      hint: '자극을 줄이고 안정적으로 진행해요.',
      is_default: true,
      partialOverrides: {
        behavior_blocks: ['리듬 최소화'],
        lighting_adjustment: '저자극 조명',
      },
    },
  ],
  hangover_relief: [
    {
      id: 'hangover_sensitive',
      intent_id: 'hangover_relief',
      label: '두통이 있고 민감해요',
      hint: '짧고 부드럽게 진행해요.',
      is_default: true,
      partialOverrides: {
        behavior_blocks: ['짧은 안정 루틴'],
        duration_delta: -2,
        environment_bias: 'shower',
      },
    },
    {
      id: 'hangover_heavy',
      intent_id: 'hangover_relief',
      label: '몸이 무겁고 처져요',
      hint: '중간 강도로 리듬을 한 번 전환해요.',
      is_default: false,
      partialOverrides: {
        behavior_blocks: ['리듬 전환 1회'],
      },
    },
  ],
  edema_relief: [
    {
      id: 'edema_lower',
      intent_id: 'edema_relief',
      label: '하체 붓기가 심해요',
      hint: '하체 중심으로 순환을 도와요.',
      is_default: true,
      partialOverrides: {
        behavior_blocks: ['발목/종아리 펌핑 1회'],
        duration_delta: 2,
        environment_bias: 'partial_bath',
      },
    },
    {
      id: 'edema_whole_body',
      intent_id: 'edema_relief',
      label: '전신이 붓는 느낌이에요',
      hint: '짧은 단계 전환으로 부드럽게 정리해요.',
      is_default: false,
      partialOverrides: {
        behavior_blocks: ['단계 전환 1회'],
      },
    },
  ],
  cold_relief: [
    {
      id: 'cold_warm',
      intent_id: 'cold_relief',
      label: '몸이 으슬으슬해요',
      hint: '몸을 천천히 덥혀 컨디션을 정리해요.',
      is_default: true,
      partialOverrides: {
        behavior_blocks: ['체온 유지 구간 1회'],
        duration_delta: 2,
        environment_bias: 'bathtub',
      },
    },
    {
      id: 'cold_gentle',
      intent_id: 'cold_relief',
      label: '몸이 약한 상태예요',
      hint: '자극 없이 순하게 진행해요.',
      is_default: false,
      partialOverrides: {
        behavior_blocks: ['순한 안정 루틴'],
        duration_delta: -2,
      },
    },
  ],
  menstrual_relief: [
    {
      id: 'menstrual_warm',
      intent_id: 'menstrual_relief',
      label: '아랫배가 아파요',
      hint: '온열 중심으로 아랫배를 풀어줘요.',
      is_default: true,
      partialOverrides: {
        behavior_blocks: ['온열 유지 구간 1회'],
        duration_delta: 3,
        environment_bias: 'bathtub',
      },
    },
    {
      id: 'menstrual_gentle',
      intent_id: 'menstrual_relief',
      label: '몸 전체가 무거워요',
      hint: '순하게 이완하며 피로를 풀어요.',
      is_default: false,
      partialOverrides: {
        behavior_blocks: ['순한 이완 루틴'],
      },
    },
  ],
  stress_relief: [
    {
      id: 'stress_deep',
      intent_id: 'stress_relief',
      label: '머릿속이 복잡해요',
      hint: '호흡 중심으로 생각을 비워드려요.',
      is_default: true,
      partialOverrides: {
        behavior_blocks: ['호흡 2분'],
        lighting_adjustment: '조명 점진 감소',
        duration_delta: 2,
      },
    },
    {
      id: 'stress_quick',
      intent_id: 'stress_relief',
      label: '빠르게 전환하고 싶어요',
      hint: '짧고 강하게 리듬을 바꿔요.',
      is_default: false,
      partialOverrides: {
        behavior_blocks: ['빠른 리듬 전환'],
        duration_delta: -2,
      },
    },
  ],
  mood_lift: [
    {
      id: 'mood_warm',
      intent_id: 'mood_lift',
      label: '기분이 처져 있어요',
      hint: '따뜻함으로 기분을 부드럽게 들어올려요.',
      is_default: true,
      partialOverrides: {
        behavior_blocks: ['기분 전환 구간 1회'],
        lighting_adjustment: '따뜻한 조명',
      },
    },
    {
      id: 'mood_active',
      intent_id: 'mood_lift',
      label: '활기를 되찾고 싶어요',
      hint: '조금 더 활기차게 시작해요.',
      is_default: false,
      partialOverrides: {
        behavior_blocks: ['활성화 루틴 1회'],
        duration_delta: 1,
      },
    },
  ],
};

const BASE_TRIP_SUBPROTOCOL_OPTIONS: Record<string, SubProtocolOption[]> = {
  kyoto_forest: [
    {
      id: 'trip_kyoto_balanced',
      intent_id: 'kyoto_forest',
      label: '기본 몰입',
      hint: '잔잔하고 안정적인 교토 무드.',
      is_default: true,
      partialOverrides: {
        behavior_blocks: ['느린 호흡 3회'],
      },
    },
    {
      id: 'trip_kyoto_deep',
      intent_id: 'kyoto_forest',
      label: '깊은 몰입',
      hint: '조금 더 오래 머무는 느낌으로 진행해요.',
      is_default: false,
      partialOverrides: {
        behavior_blocks: ['몰입 구간 1회'],
        duration_delta: 2,
      },
    },
  ],
  nordic_sauna: [
    {
      id: 'trip_nordic_balanced',
      intent_id: 'nordic_sauna',
      label: '기본 리셋',
      hint: '차분하고 균형 잡힌 사우나 무드.',
      is_default: true,
      partialOverrides: {
        behavior_blocks: ['전환 호흡 1회'],
      },
    },
    {
      id: 'trip_nordic_quick',
      intent_id: 'nordic_sauna',
      label: '빠른 전환',
      hint: '짧게 리듬을 바꾸는 루틴.',
      is_default: false,
      partialOverrides: {
        behavior_blocks: ['짧은 리듬 전환'],
        duration_delta: -1,
      },
    },
  ],
  rainy_camping: [
    {
      id: 'trip_rainy_balanced',
      intent_id: 'rainy_camping',
      label: '기본 휴식',
      hint: '빗소리 중심의 안정 루틴.',
      is_default: true,
      partialOverrides: {
        behavior_blocks: ['안정 구간 유지'],
      },
    },
    {
      id: 'trip_rainy_soft',
      intent_id: 'rainy_camping',
      label: '더 잔잔하게',
      hint: '자극을 더 낮춰서 진행해요.',
      is_default: false,
      partialOverrides: {
        behavior_blocks: ['리듬 최소화'],
        lighting_adjustment: '차분한 조명',
      },
    },
  ],
  snow_cabin: [
    {
      id: 'trip_snow_balanced',
      intent_id: 'snow_cabin',
      label: '기본 마무리',
      hint: '포근한 분위기로 하루를 정리해요.',
      is_default: true,
      partialOverrides: {
        behavior_blocks: ['마무리 호흡 1회'],
      },
    },
    {
      id: 'trip_snow_warm',
      intent_id: 'snow_cabin',
      label: '따뜻하게 마무리',
      hint: '온기 중심으로 조금 더 깊게 진행해요.',
      is_default: false,
      partialOverrides: {
        behavior_blocks: ['온기 유지 구간 1회'],
        duration_delta: 1,
      },
    },
  ],
};

export const TRIP_SUBPROTOCOL_OPTIONS: Record<string, SubProtocolOption[]> = {
  ...BASE_TRIP_SUBPROTOCOL_OPTIONS,
  ...GENERATED_TRIP_SUBPROTOCOL_OPTIONS,
};

export function pickAutoTripSubProtocol(
  intentId: string,
  environment: CanonicalBathEnvironment
): SubProtocolOption | null {
  const options = TRIP_SUBPROTOCOL_OPTIONS[intentId] ?? [];
  if (options.length === 0) return null;

  const defaultOption = options.find((option) => option.is_default) ?? options[0];

  if (environment === 'shower') {
    return options.find((option) => (option.partialOverrides.duration_delta ?? 0) < 0) ?? defaultOption;
  }

  return options.find((option) => (option.partialOverrides.duration_delta ?? 0) > 0) ?? defaultOption;
}

export function getSectionOrderByContext(
  timeContext: TimeContext
): 'care_first' | 'trip_first' {
  if (timeContext === 'day' || timeContext === 'evening') {
    return 'trip_first';
  }
  return 'care_first';
}

export function getEnvironmentSubtitle(
  card: IntentCard,
  environment: CanonicalBathEnvironment
): string {
  return card.copy_subtitle_by_environment[environment];
}

const ENV_LABEL: Record<CanonicalBathEnvironment, string> = {
  bathtub: '욕조',
  partial_bath: '부분입욕',
  shower: '샤워',
};

export function getEnvironmentFitLabel(
  card: IntentCard,
  environment: CanonicalBathEnvironment
): string {
  const allowed = card.allowed_environments;
  if (!allowed.includes(environment)) {
    return `${ENV_LABEL[allowed[0] ?? 'bathtub']} 권장`;
  }
  if (allowed.length === 1) {
    return `${ENV_LABEL[environment]} 전용`;
  }
  if (allowed.length === 3) {
    return `${ENV_LABEL[environment]} 바로 가능`;
  }
  return `${ENV_LABEL[environment]} 권장`;
}
