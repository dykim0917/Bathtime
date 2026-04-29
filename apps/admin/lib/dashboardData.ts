export type AdminSectionId = 'products' | 'care' | 'trip' | 'audio';
export type AdminSectionStatus = 'ready' | 'needs_review' | 'blocked';

export interface AdminSectionSummary {
  id: AdminSectionId;
  title: string;
  description: string;
  activeCount: number;
  draftCount: number;
  pausedCount: number;
  retiredCount: number;
  status: AdminSectionStatus;
  href: string;
}

export interface AdminDashboardSummary {
  activeRows: number;
  draftRows: number;
  pausedRows: number;
  retiredRows: number;
  publishBlockers: number;
  schemaVersion: 'content.v1';
}

export interface AdminDashboardViewModel {
  summary: AdminDashboardSummary;
  sections: AdminSectionSummary[];
  queue: string[];
}

const sections: AdminSectionSummary[] = [
  {
    id: 'products',
    title: '제품',
    description: '상품, 구매처, 추천 규칙, 표시 메타데이터',
    activeCount: 30,
    draftCount: 0,
    pausedCount: 0,
    retiredCount: 0,
    status: 'ready',
    href: '/products',
  },
  {
    id: 'care',
    title: '케어 루틴',
    description: '의도 카드, 환경별 문구, 세부 루틴',
    activeCount: 16,
    draftCount: 0,
    pausedCount: 0,
    retiredCount: 0,
    status: 'ready',
    href: '/care',
  },
  {
    id: 'trip',
    title: '무드 루틴',
    description: '테마, 온도, 조명, 음악 연결',
    activeCount: 22,
    draftCount: 0,
    pausedCount: 0,
    retiredCount: 0,
    status: 'ready',
    href: '/trip',
  },
  {
    id: 'audio',
    title: '음악',
    description: '음악, 앰비언스, 원격 URL, 라이선스',
    activeCount: 12,
    draftCount: 0,
    pausedCount: 0,
    retiredCount: 0,
    status: 'ready',
    href: '/audio',
  },
];

const queue = [
  'Supabase/PostgREST 연결값 등록',
  '제품 목록 read-only 테이블',
  '케어 루틴 목록 read-only 테이블',
  '발행 전 validation 결과 패널',
];

function countBlockedSections(items: AdminSectionSummary[]): number {
  return items.filter((item) => item.status === 'blocked').length;
}

export function buildAdminDashboardViewModel(
  items: AdminSectionSummary[] = sections
): AdminDashboardViewModel {
  return {
    summary: {
      activeRows: items.reduce((total, item) => total + item.activeCount, 0),
      draftRows: items.reduce((total, item) => total + item.draftCount, 0),
      pausedRows: items.reduce((total, item) => total + item.pausedCount, 0),
      retiredRows: items.reduce((total, item) => total + item.retiredCount, 0),
      publishBlockers: countBlockedSections(items),
      schemaVersion: 'content.v1',
    },
    sections: items,
    queue,
  };
}

export function getStatusLabel(status: AdminSectionStatus): string {
  if (status === 'blocked') return '차단';
  if (status === 'needs_review') return '검수 필요';
  return '정상';
}
