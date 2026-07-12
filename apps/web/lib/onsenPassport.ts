export type OnsenReviewTargetType = 'accommodation' | 'facility';
export type OnsenReviewBathArea =
  | 'room_bath'
  | 'private_bath'
  | 'public_bath'
  | 'open_air_public_bath'
  | 'family_bath'
  | 'sand_bath'
  | 'steam_bath'
  | 'sauna'
  | 'stone_sauna'
  | 'other';
export type OnsenReviewWaterTexture = 'slippery' | 'soft' | 'distinctive' | 'neutral' | 'dry' | 'unclear';
export type OnsenReviewWaterColor = 'clear' | 'white' | 'brown' | 'green' | 'other' | 'unclear';
export type OnsenReviewTemperature = 'cool' | 'lukewarm' | 'comfortable' | 'hot' | 'mixed' | 'unclear';
export type OnsenReviewCrowding = 'quiet' | 'comfortable' | 'busy' | 'packed' | 'unclear';
export type OnsenReviewCleanliness = 'good' | 'neutral' | 'concern' | 'unclear';
export type OnsenReviewRevisitIntent = 'yes' | 'maybe' | 'no' | 'unsure';
export type OnsenReviewVerificationStatus = 'self_reported' | 'verified' | 'rejected';
export type OnsenReviewStatus = 'pending' | 'approved' | 'rejected';

export type OnsenPassportEntry = {
  id: string;
  targetType: OnsenReviewTargetType;
  targetSlug: string;
  targetName: string;
  bathAreas: OnsenReviewBathArea[];
  visitedOn: string | null;
  waterTexture: OnsenReviewWaterTexture[];
  waterColor: OnsenReviewWaterColor;
  temperatureExperience: OnsenReviewTemperature;
  crowdingLevel: OnsenReviewCrowding;
  cleanlinessLevel: OnsenReviewCleanliness;
  revisitIntent: OnsenReviewRevisitIntent;
  cautionText: string | null;
  body: string;
  status: OnsenReviewStatus;
  verificationStatus: OnsenReviewVerificationStatus;
  isPublic: boolean;
  createdAt: string;
};

export type OnsenPublicProfile = {
  userId: string;
  handle: string;
  displayName: string;
  bio: string | null;
  passportIsPublic: boolean;
  showVisitMonth: boolean;
  createdAt: string;
  updatedAt: string;
};

export const bathAreaLabels: Record<OnsenReviewBathArea, string> = {
  room_bath: '객실 내 프라이빗탕',
  private_bath: '대절탕',
  public_bath: '대욕장',
  open_air_public_bath: '노천탕',
  family_bath: '가족탕',
  sand_bath: '모래찜질',
  steam_bath: '증기탕',
  sauna: '사우나',
  stone_sauna: '암반욕',
  other: '그 외',
};

export const waterTextureLabels: Record<OnsenReviewWaterTexture, string> = {
  slippery: '미끌미끌함',
  soft: '부드러움',
  distinctive: '온천감이 뚜렷함',
  neutral: '담백함',
  dry: '뻣뻣하거나 건조함',
  unclear: '잘 모르겠음',
};

export const waterColorLabels: Record<OnsenReviewWaterColor, string> = {
  clear: '투명',
  white: '흰빛 또는 백탁',
  brown: '갈색빛',
  green: '초록빛',
  other: '다른 색',
  unclear: '잘 모르겠음',
};

export const temperatureLabels: Record<OnsenReviewTemperature, string> = {
  cool: '차가운 편',
  lukewarm: '미지근한 편',
  comfortable: '편안한 온도',
  hot: '뜨거운 편',
  mixed: '탕마다 달랐음',
  unclear: '잘 모르겠음',
};

export const crowdingLabels: Record<OnsenReviewCrowding, string> = {
  quiet: '한산했음',
  comfortable: '여유 있었음',
  busy: '조금 붐볐음',
  packed: '매우 붐볐음',
  unclear: '기억나지 않음',
};

export const cleanlinessLabels: Record<OnsenReviewCleanliness, string> = {
  good: '깔끔했음',
  neutral: '보통이었음',
  concern: '아쉬움이 있었음',
  unclear: '기억나지 않음',
};

export const revisitLabels: Record<OnsenReviewRevisitIntent, string> = {
  yes: '재방문 의사 있음',
  maybe: '조건부 재방문',
  no: '재방문 의사 없음',
  unsure: '응답 보류',
};

export function getVisibleRevisitLabel(value: OnsenReviewRevisitIntent): string | null {
  return value === 'yes' || value === 'no' ? revisitLabels[value] : null;
}

export function getTopValue<T extends string>(values: T[], ignored: T[] = []): { value: T; count: number } | null {
  const ignoredSet = new Set(ignored);
  const counts = new Map<T, number>();

  values.forEach((value) => {
    if (!ignoredSet.has(value)) counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  let top: { value: T; count: number } | null = null;
  counts.forEach((count, value) => {
    if (!top || count > top.count) top = { value, count };
  });
  return top;
}

export function formatPassportVisitDate(entry: Pick<OnsenPassportEntry, 'visitedOn' | 'createdAt'>): string {
  const value = entry.visitedOn ?? entry.createdAt;
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value));
}

export function formatPublicVisitMonth(value: string | null): string | null {
  if (!value) return null;
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long' }).format(new Date(`${value.slice(0, 10)}T00:00:00`));
}
