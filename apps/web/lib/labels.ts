import type { ContentCategory, ContentType, RoutinePreset } from '@/src/archive/types';

export const CATEGORY_LABELS: Record<ContentCategory, string> = {
  HOME_BATH: '홈케어',
  BATH_PLACES: '목욕 공간',
  BATH_ITEMS: '욕실 아이템',
  TIPS_CULTURE: '읽을거리 / 문화',
};

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  TRIED: '해봤다',
  RESEARCHED: '찾아봤다',
  ORGANIZED: '정리했다',
  VISITED: '다녀왔다',
  SUBMITTED: '제보받았다',
  UPDATED: '업데이트했다',
};

export const ROUTINE_ENVIRONMENT_LABELS: Record<RoutinePreset['environment'], string> = {
  shower: '샤워',
  footbath: '족욕',
  bath: '입욕',
  free: '자유',
};

export const CATEGORIES: Array<ContentCategory | 'ALL'> = [
  'ALL',
  'HOME_BATH',
  'BATH_PLACES',
  'BATH_ITEMS',
  'TIPS_CULTURE',
];

export const ARCHIVE_TAGS = [
  '욕조 없음',
  '수면 전',
  '운동 후',
  '혼자 쉬기',
  '외부인 이용 가능',
  '프라이빗',
  '서울',
  '비 오는 날',
  '짧은 의식',
] as const;
