import { readP0Submissions } from '../../../../src/server/archiveSubmissionStore';
import { readAdminPostgrestSessionConfig, readPostgrestRows } from '../data/postgrest';

export type AdminContentCategory = 'HOME_BATH' | 'BATH_PLACES' | 'BATH_ITEMS' | 'TIPS_CULTURE';
export type AdminContentType = 'TRIED' | 'RESEARCHED' | 'ORGANIZED' | 'VISITED' | 'SUBMITTED' | 'UPDATED';
export type SubmissionStatus = 'new' | 'reviewing' | 'accepted' | 'rejected';

export const categoryLabels: Record<AdminContentCategory, string> = {
  HOME_BATH: '홈케어',
  BATH_PLACES: '목욕 공간',
  BATH_ITEMS: '욕실 아이템',
  TIPS_CULTURE: '읽을거리 / 문화',
};

export const contentTypeLabels: Record<AdminContentType, string> = {
  TRIED: '해봤다',
  RESEARCHED: '찾아봤다',
  ORGANIZED: '정리했다',
  VISITED: '다녀왔다',
  SUBMITTED: '제보받았다',
  UPDATED: '업데이트했다',
};

export const submissionStatusLabels: Record<SubmissionStatus, string> = {
  new: '새 제보',
  reviewing: '검토 중',
  accepted: '반영됨',
  rejected: '반려됨',
};

export const submissionTypeLabels: Record<string, string> = {
  sauna_spa: '사우나 / 스파',
  bathtub_stay: '욕조 있는 숙소',
  home_spa: '홈스파 세팅',
  item: '아이템',
  topic: '다뤄줬으면 하는 주제',
};

export const adminArchiveContents = [
  {
    id: 'home-shower-reset-7',
    title: '퇴근 후 샤워를 7분 의식으로 바꾸기',
    subtitle: '욕조 없이도 하루를 닫는 가장 작은 의식',
    category: 'HOME_BATH' as AdminContentCategory,
    contentType: 'TRIED' as AdminContentType,
    isPublished: true,
    tags: ['욕조 없음', '수면 전', '짧은 의식'],
    updatedAt: '2026-05-01',
  },
  {
    id: 'place-seoul-solo-sauna-checklist',
    title: '서울에서 혼자 가기 좋은 사우나를 볼 때 확인할 것',
    subtitle: '예쁜 사진보다 먼저 확인해야 하는 이용 조건',
    category: 'BATH_PLACES' as AdminContentCategory,
    contentType: 'ORGANIZED' as AdminContentType,
    isPublished: true,
    tags: ['서울', '혼자 쉬기', '외부인 이용 가능'],
    updatedAt: '2026-05-02',
  },
  {
    id: 'item-footbath-basin-first',
    title: '족욕기를 사기 전 대야로 먼저 해보기',
    subtitle: '제품보다 먼저 확인할 것은 내 반복 가능성',
    category: 'BATH_ITEMS' as AdminContentCategory,
    contentType: 'RESEARCHED' as AdminContentType,
    isPublished: true,
    tags: ['욕조 없음', '비 오는 날'],
    updatedAt: '2026-05-03',
  },
  {
    id: 'tips-bath-archive-why',
    title: '바스타임 아카이브가 필요한 이유',
    subtitle: '좋은 장소와 방법을 같은 기준으로 다시 찾기 위해',
    category: 'TIPS_CULTURE' as AdminContentCategory,
    contentType: 'ORGANIZED' as AdminContentType,
    isPublished: true,
    tags: ['혼자 쉬기', '서울'],
    updatedAt: '2026-05-04',
  },
];

export const adminSubmissions = [
  {
    id: 'submission-001',
    type: '사우나 / 스파',
    linkOrImage: 'https://example.com/seoul-sauna',
    comment: '평일 저녁에 조용한 편인 사우나가 있어서 확인해보면 좋겠어요.',
    nickname: '서울퇴근러',
    canPublish: true,
    status: 'new' as SubmissionStatus,
    createdAt: '2026-05-07',
  },
  {
    id: 'submission-002',
    type: '아이템',
    linkOrImage: 'https://example.com/towel',
    comment: '건조가 빨라서 밤 샤워 후 쓰기 괜찮았어요.',
    nickname: '수건정리중',
    canPublish: false,
    status: 'reviewing' as SubmissionStatus,
    createdAt: '2026-05-07',
  },
];

export type AdminSubmission = Awaited<ReturnType<typeof readP0Submissions>>[number] & {
  user?: {
    email?: string;
    nickname?: string;
    provider?: string;
  };
};

type SubmissionRow = {
  id: string;
  user_id: string;
  type: string;
  link_or_image: string | null;
  comment: string;
  nickname: string | null;
  can_publish: boolean | null;
  status: SubmissionStatus;
  created_at: string;
  updated_at: string;
  user_profiles?: {
    email: string | null;
    nickname: string | null;
    provider: string | null;
  } | null;
};

function mapSubmissionRow(row: SubmissionRow): AdminSubmission {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type as AdminSubmission['type'],
    linkOrImage: row.link_or_image ?? undefined,
    comment: row.comment,
    nickname: row.nickname ?? undefined,
    canPublish: row.can_publish ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    user: row.user_profiles
      ? {
          email: row.user_profiles.email ?? undefined,
          nickname: row.user_profiles.nickname ?? undefined,
          provider: row.user_profiles.provider ?? undefined,
        }
      : undefined,
  };
}

export async function readAdminSubmissions(): Promise<AdminSubmission[]> {
  const config = await readAdminPostgrestSessionConfig();
  if (!config) return (await readP0Submissions()) as AdminSubmission[];

  const rows = await readPostgrestRows<SubmissionRow>(config, 'submissions', {
    select: '*,user_profiles(email,nickname,provider)',
    order: 'created_at.desc',
  });

  return rows.map(mapSubmissionRow);
}

export const adminRoutinePresets = [
  {
    id: 'shower-7',
    title: '샤워 7분',
    durationMinutes: 7,
    environment: '샤워',
    description: '빠르게 몸과 기분을 전환하는 짧은 샤워 의식',
    steps: ['물을 미지근하게 맞춥니다.', '목과 어깨부터 천천히 적십니다.', '마지막 1분은 물소리만 듣습니다.'],
    isPublished: true,
  },
  {
    id: 'footbath-10',
    title: '족욕 10분',
    durationMinutes: 10,
    environment: '족욕',
    description: '욕조 없는 집에서도 가능한 짧은 홈스파 의식',
    steps: ['발목까지 잠기는 물을 준비합니다.', '10분 동안 발을 담급니다.', '수건으로 감싸고 마무리합니다.'],
    isPublished: true,
  },
  {
    id: 'bath-15',
    title: '입욕 15분',
    durationMinutes: 15,
    environment: '입욕',
    description: '욕조가 있을 때 적용 가능한 기본 입욕 의식',
    steps: ['물 온도를 과하게 올리지 않습니다.', '15분 동안 몸을 데웁니다.', '끝난 뒤 물을 마십니다.'],
    isPublished: true,
  },
  {
    id: 'free-timer',
    title: '자유 의식/타이머',
    durationMinutes: 5,
    environment: '자유',
    description: '오늘 상황에 맞춰 직접 시간을 정하는 기본 타이머',
    steps: ['목표 시간을 정합니다.', '한 가지 행동만 실행합니다.', '다음에 조정할 점을 떠올립니다.'],
    isPublished: true,
  },
];
