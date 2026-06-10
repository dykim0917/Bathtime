import type { ArchiveContent } from '@/src/archive/types';

const valueLabels: Record<string, string> = {
  available: '외부인 이용 가능',
  restricted: '조건부 이용',
  members_only: '회원 전용',
  unknown: '확인 필요',
  public: '공용',
  semi_private: '반개별',
  private: '프라이빗',
  low: '쉬움',
  medium: '보통',
  high: '어려움',
  shower: '샤워',
  footbath: '족욕',
  bath: '입욕',
  home_spa: '홈스파',
  HOME_BATH: '홈케어',
  BATH_PLACES: '목욕 공간',
  BATH_ITEMS: '욕실 아이템',
  TIPS_CULTURE: '읽을거리 / 문화',
  hotel_public_bath: '호텔 대욕장',
  hotel_sauna: '사우나',
  public_bath: '대중목욕탕',
  jjimjilbang: '찜질방',
  sauna: '사우나',
  spa: '스파',
  massage: '마사지',
  bathtub_stay: '욕조 숙소',
};

const rowIconPaths: Record<string, string> = {
  '소요 시간': 'M12 7v5l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  '욕조 필요': 'M5 11h14v3a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5v-3Z M7 11V7a3 3 0 0 1 3-3',
  '필요 아이템': 'M6 8h12l-1 12H7L6 8Z M9 8a3 3 0 0 1 6 0',
  난이도: 'M4 16a8 8 0 1 1 16 0 M12 16l4-5',
  '추천 상황': 'M12 3l2.4 5 5.6.8-4 3.9.9 5.5L12 17.8 7 20l.9-5.5-4-3.9 5.6-.8L12 3Z',
  환경: 'M4 11l8-7 8 7v9H4v-9Z M10 20v-6h4v6',
  지역: 'M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  '외부인 이용': 'M20 7 9 18l-5-5',
  가격대: 'M12 3v18 M17 7.5c-.8-1.1-2.3-1.7-4-1.7-2.3 0-4 .9-4 2.6 0 4.3 8 1.8 8 6.3 0 1.8-1.9 3-4.4 3-1.9 0-3.6-.7-4.6-2',
  '예약 필요': 'M7 3v4 M17 3v4 M4 8h16v12H4V8Z M8 13h3 M8 17h6',
  '혼자 이용': 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M5 21a7 7 0 0 1 14 0',
  프라이빗: 'M7 10V8a5 5 0 0 1 10 0v2 M6 10h12v10H6V10Z',
  시설: 'M4 20h16 M6 20V5h12v15 M9 9h2 M13 9h2 M9 13h2 M13 13h2',
  업데이트: 'M20 12a8 8 0 1 1-2.3-5.7 M20 4v6h-6',
  '아이템 유형': 'M6 8h12l-1 12H7L6 8Z M9 8a3 3 0 0 1 6 0',
  '사용 상황': 'M7 7h10 M7 12h10 M7 17h6 M4 7h.01 M4 12h.01 M4 17h.01',
  '보관 난이도': 'M4 6h16 M8 6v14h8V6 M10 10h4',
  '관리 난이도': 'M14.7 6.3 17.7 3.3 20.7 6.3 17.7 9.3 M4 20l9-9',
  '추천 대상': 'M12 3l2.4 5 5.6.8-4 3.9.9 5.5L12 17.8 7 20l.9-5.5-4-3.9 5.6-.8L12 3Z',
  '비추천 대상': 'M6 6l12 12 M18 6 6 18',
  주제: 'M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 0-4-4V4Z',
  '관련 카테고리': 'M4 4h7v7H4V4Z M13 4h7v7h-7V4Z M4 13h7v7H4v-7Z M13 13h7v7h-7v-7Z',
  '콘텐츠 성격': 'M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 0-4-4V4Z',
  '추천 여부': 'M20 7 9 18l-5-5',
  기준: 'M7 7h10 M7 12h10 M7 17h6 M4 7h.01 M4 12h.01 M4 17h.01',
  '출처 구분': 'M4 4h7v7H4V4Z M13 4h7v7h-7V4Z M4 13h7v7H4v-7Z M13 13h7v7h-7v-7Z',
  대상: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M5 21a7 7 0 0 1 14 0',
};

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.map((item) => formatValue(item)).join(', ');
  if (typeof value === 'boolean') return value ? '예' : '아니오';
  if (value === undefined || value === null || value === '') return '미정';
  const text = String(value);
  return valueLabels[text] ?? text;
}

function getRows(content: ArchiveContent): Array<[string, unknown]> {
  const info = content.structuredInfo;
  if (info.overviewRows?.length) {
    return info.overviewRows.map((row) => [row.label, row.value]);
  }

  if (content.category === 'BATH_PLACES') {
    return [
      ['지역', 'region' in info ? info.region : undefined],
      ['외부인 이용', 'publicAccess' in info ? info.publicAccess : undefined],
      ['가격대', 'priceRange' in info ? info.priceRange : undefined],
      ['예약 필요', 'reservationRequired' in info ? info.reservationRequired : undefined],
      ['혼자 이용', 'suitableForSolo' in info ? info.suitableForSolo : undefined],
      ['프라이빗', 'privateLevel' in info ? info.privateLevel : undefined],
      ['시설', 'facilityTypes' in info ? info.facilityTypes : undefined],
      ['업데이트', 'lastCheckedAt' in info ? info.lastCheckedAt : undefined],
    ];
  }

  if (content.category === 'BATH_ITEMS') {
    return [
      ['아이템 유형', 'itemType' in info ? info.itemType : undefined],
      ['사용 상황', 'useCases' in info ? info.useCases : undefined],
      ['욕조 필요', 'bathRequired' in info ? info.bathRequired : undefined],
      ['보관 난이도', 'storageDifficulty' in info ? info.storageDifficulty : undefined],
      ['관리 난이도', 'maintenanceDifficulty' in info ? info.maintenanceDifficulty : undefined],
      ['가격대', 'priceRange' in info ? info.priceRange : undefined],
      ['추천 대상', 'recommendedFor' in info ? info.recommendedFor : undefined],
      ['비추천 대상', 'notRecommendedFor' in info ? info.notRecommendedFor : undefined],
    ];
  }

  if (content.category === 'TIPS_CULTURE') {
    return [
      ['주제', 'topic' in info ? info.topic : undefined],
      ['관련 카테고리', 'relatedCategories' in info ? info.relatedCategories : undefined],
      ['난이도', 'difficulty' in info ? info.difficulty : undefined],
    ];
  }

  return [
    ['소요 시간', 'durationMinutes' in info ? `${info.durationMinutes}분` : undefined],
    ['욕조 필요', 'bathRequired' in info ? info.bathRequired : undefined],
    ['필요 아이템', 'requiredItems' in info ? info.requiredItems : undefined],
    ['난이도', 'difficulty' in info ? info.difficulty : undefined],
    ['추천 상황', 'recommendedSituations' in info ? info.recommendedSituations : undefined],
    ['환경', 'environment' in info ? info.environment : undefined],
  ];
}

function RowIcon({ label }: { label: string }) {
  const path = rowIconPaths[label];
  return (
    <span className="structured-info-icon" aria-hidden="true">
      {path ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d={path} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </span>
  );
}

export function StructuredInfo({ content }: { content: ArchiveContent }) {
  const rows = getRows(content);

  return (
    <aside className="structured-info">
      <header className="structured-info-header">
        <h2>한눈에 보기</h2>
      </header>
      <dl className="structured-info-grid">
        {rows.map(([label, value]) => (
          <div className="structured-info-row" key={label}>
            <RowIcon label={label} />
            <div className="structured-info-copy">
              <dt>{label}</dt>
              <dd>{formatValue(value)}</dd>
            </div>
          </div>
        ))}
      </dl>
    </aside>
  );
}
