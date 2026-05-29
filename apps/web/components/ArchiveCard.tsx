import Link from 'next/link';
import type { ArchiveContent } from '@/src/archive/types';
import { CATEGORY_LABELS, CONTENT_TYPE_LABELS } from '@web/lib/labels';
import { ArchiveVisual } from './ArchiveVisual';
import { SaveButton } from './SaveButton';

function summaryMeta(content: ArchiveContent): string[] {
  const info = content.structuredInfo;
  if ('durationMinutes' in info) {
    return [`${info.durationMinutes ?? '-'}분`, info.bathRequired ? '욕조 필요' : '욕조 없음'];
  }
  if ('publicAccess' in info) {
    return [info.region ?? '지역 미정', info.publicAccess === 'available' ? '외부인 가능' : '이용 조건 확인'];
  }
  if ('itemType' in info) {
    return [info.itemType ?? '아이템', info.priceRange ?? '가격대 미정'];
  }
  return ['정리 글'];
}

export function ArchiveCard({ content }: { content: ArchiveContent }) {
  return (
    <article className="archive-card-shell">
      <Link className="archive-card" href={`/content/${content.id}`}>
        <ArchiveVisual content={content} />
        <div className="archive-card-body">
          <p className="kicker">{CATEGORY_LABELS[content.category]} · {CONTENT_TYPE_LABELS[content.contentType]}</p>
          <h3>{content.title}</h3>
          <p>{content.summary}</p>
        </div>
        <div className="meta-row">
          {summaryMeta(content).map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </Link>
      <div className="archive-card-save">
        <SaveButton contentId={content.id} />
      </div>
    </article>
  );
}
