export interface AdminCareRoutineRow {
  id: string;
  title: string;
  intentId: string;
  mode: string;
  environments: string[];
  subprotocols: number;
  defaultSubprotocolId: string;
  safetyNote: string;
  status: 'active' | 'draft' | 'paused' | 'retired';
}

const careRows: AdminCareRoutineRow[] = [
  {
    id: 'care_muscle_relief',
    title: '근육이 뭉쳤을 때',
    intentId: 'muscle_relief',
    mode: 'recovery',
    environments: ['bathtub', 'partial_bath', 'shower'],
    subprotocols: 3,
    defaultSubprotocolId: 'muscle_basic',
    safetyNote: '고혈압/심장질환 온도 주의',
    status: 'active',
  },
  {
    id: 'care_sleep_ready',
    title: '잠들기 어려울 때',
    intentId: 'sleep_ready',
    mode: 'sleep',
    environments: ['bathtub', 'partial_bath', 'shower'],
    subprotocols: 3,
    defaultSubprotocolId: 'sleep_sensitive',
    safetyNote: '저자극 조명 권장',
    status: 'active',
  },
  {
    id: 'care_stress_relief',
    title: '스트레스가 높을 때',
    intentId: 'stress_relief',
    mode: 'reset',
    environments: ['bathtub', 'partial_bath', 'shower'],
    subprotocols: 2,
    defaultSubprotocolId: 'stress_basic',
    safetyNote: '냉온 자극 과도 사용 금지',
    status: 'active',
  },
  {
    id: 'care_mood_lift',
    title: '기분을 끌어올리고 싶을 때',
    intentId: 'mood_lift',
    mode: 'reset',
    environments: ['shower', 'partial_bath'],
    subprotocols: 2,
    defaultSubprotocolId: 'mood_basic',
    safetyNote: '당뇨/임신 사용자 자극 완화',
    status: 'active',
  },
];

export interface AdminCareListViewModel {
  rows: AdminCareRoutineRow[];
  totalCount: number;
  activeCount: number;
  subprotocolCount: number;
  safetyReviewCount: number;
}

export function buildAdminCareListViewModel(
  rows: AdminCareRoutineRow[] = careRows
): AdminCareListViewModel {
  return {
    rows,
    totalCount: rows.length,
    activeCount: rows.filter((row) => row.status === 'active').length,
    subprotocolCount: rows.reduce((total, row) => total + row.subprotocols, 0),
    safetyReviewCount: rows.filter((row) => row.safetyNote.length > 0).length,
  };
}

export function getCareStatusLabel(status: AdminCareRoutineRow['status']): string {
  if (status === 'draft') return 'Draft';
  if (status === 'paused') return 'Paused';
  if (status === 'retired') return 'Retired';
  return 'Active';
}
