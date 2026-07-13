export const onsenEntryIntents = ['stay_private', 'stay_bath_depth', 'city_facility'] as const;

export type OnsenEntryIntent = (typeof onsenEntryIntents)[number];

export type OnsenEntryIntentValue = OnsenEntryIntent | 'unknown';

export const onsenEntryIntentMeta: Record<OnsenEntryIntent, {
  eyebrow: string;
  title: string;
  description: string;
  resultTitle: string;
  resultDescription: string;
}> = {
  stay_private: {
    eyebrow: '둘이 함께 쓰는 온천',
    title: '둘만 같은 탕에 들어가고 싶어요.',
    description: '객실 안 온천탕과 대절탕을 나누고, 예약·선착순 같은 이용 방식까지 확인합니다.',
    resultTitle: '둘이 함께 쓸 수 있는 온천',
    resultDescription: '객실 내 프라이빗탕과 대절탕이 확인된 숙소부터 봅니다.',
  },
  stay_bath_depth: {
    eyebrow: '대욕장이 여행의 이유',
    title: '숙소의 목욕 경험을 먼저 보고 싶어요.',
    description: '대욕장 하나로 끝나지 않고 노천탕, 탕 구성, 후기에 남은 목욕 경험을 비교합니다.',
    resultTitle: '목욕하러 머물고 싶은 숙소',
    resultDescription: '대욕장과 노천탕의 경험이 분명한 숙소부터 봅니다.',
  },
  city_facility: {
    eyebrow: '여행 중 두세 시간',
    title: '일정 사이에 제대로 쉬고 싶어요.',
    description: '도심 온천과 대형 시설을 시간, 요금, 탕 구성, 휴게 공간 기준으로 찾습니다.',
    resultTitle: '여행 중 들르기 좋은 온천',
    resultDescription: '숙박하지 않고 방문하는 시설의 요금과 이용 조건을 먼저 봅니다.',
  },
};

export function normalizeOnsenEntryIntent(value: unknown): OnsenEntryIntentValue {
  return typeof value === 'string' && (onsenEntryIntents as readonly string[]).includes(value)
    ? value as OnsenEntryIntent
    : 'unknown';
}

export function addOnsenEntryIntent(href: string, intent: OnsenEntryIntentValue) {
  if (intent === 'unknown') return href;
  const [path, hash = ''] = href.split('#', 2);
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}intent=${encodeURIComponent(intent)}${hash ? `#${hash}` : ''}`;
}
