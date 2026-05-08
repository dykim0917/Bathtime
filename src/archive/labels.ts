import { ContentCategory, ContentType, RoutinePreset, Submission, SubmissionStatus } from '@/src/archive/types';
import { copy } from '@/src/content/copy';

export const CATEGORY_LABELS: Record<ContentCategory, string> = {
  HOME_BATH: copy.archive.categories.HOME_BATH,
  BATH_PLACES: copy.archive.categories.BATH_PLACES,
  BATH_ITEMS: copy.archive.categories.BATH_ITEMS,
  TIPS_CULTURE: copy.archive.categories.TIPS_CULTURE,
};

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  TRIED: '해봤다',
  RESEARCHED: '찾아봤다',
  ORGANIZED: '정리했다',
  VISITED: '다녀왔다',
  SUBMITTED: '제보받았다',
  UPDATED: '업데이트했다',
};

export const SUBMISSION_TYPE_LABELS: Record<Submission['type'], string> = {
  sauna_spa: '사우나 / 스파',
  bathtub_stay: '욕조 있는 숙소',
  home_spa: '홈스파 세팅',
  item: '아이템',
  topic: '다뤄줬으면 하는 주제',
};

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  new: '새 제보',
  reviewing: '검토 중',
  accepted: '반영됨',
  rejected: '반려됨',
};

export const ROUTINE_ENVIRONMENT_LABELS: Record<RoutinePreset['environment'], string> = {
  shower: '샤워',
  footbath: '족욕',
  bath: '입욕',
  free: '자유',
};

export const P0_ARCHIVE_TAGS = [
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
