import type { ArchiveContent } from '@/src/archive/types';

function stringifyValue(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'boolean') return value ? '예' : '아니오';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  return null;
}

function getInfoRows(content: ArchiveContent): Array<{ label: string; value: string }> {
  const info = content.structuredInfo;

  if ('durationMinutes' in info) {
    return [
      { label: '소요 시간', value: stringifyValue(info.durationMinutes ? `${info.durationMinutes}분` : undefined) ?? '-' },
      { label: '욕조', value: info.bathRequired ? '필요' : '없어도 가능' },
      { label: '난이도', value: stringifyValue(info.difficulty) ?? '-' },
      { label: '준비물', value: stringifyValue(info.requiredItems) ?? '-' },
    ];
  }

  if ('publicAccess' in info) {
    return [
      { label: '지역', value: stringifyValue(info.region) ?? '-' },
      { label: '이용 조건', value: stringifyValue(info.publicAccess) ?? '-' },
      { label: '가격대', value: stringifyValue(info.priceRange) ?? '-' },
      { label: '시설', value: stringifyValue(info.facilityTypes) ?? '-' },
      { label: '확인일', value: stringifyValue(info.lastCheckedAt) ?? '-' },
    ];
  }

  if ('itemType' in info) {
    return [
      { label: '유형', value: stringifyValue(info.itemType) ?? '-' },
      { label: '사용 맥락', value: stringifyValue(info.useCases) ?? '-' },
      { label: '욕조', value: info.bathRequired ? '필요' : '없어도 가능' },
      { label: '가격대', value: stringifyValue(info.priceRange) ?? '-' },
      { label: '관리 부담', value: stringifyValue(info.maintenanceDifficulty) ?? '-' },
    ];
  }

  if ('topic' in info || 'relatedCategories' in info) {
    return [
      { label: '주제', value: stringifyValue(info.topic) ?? '정리 글' },
      { label: '난이도', value: stringifyValue(info.difficulty) ?? '-' },
    ];
  }

  return [{ label: '유형', value: '정리 글' }];
}

export function StructuredInfo({ content }: { content: ArchiveContent }) {
  const rows = getInfoRows(content).filter((row) => row.value !== '-');

  return (
    <aside className="structured-info">
      <h2>한눈에 보기</h2>
      <dl>
        {rows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
