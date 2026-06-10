import Link from 'next/link';
import type { ComponentType } from 'react';
import { Bathtub, CheckCircle, Clock, FileText, MapPin, ShoppingBag, Tag } from '@phosphor-icons/react/ssr';
import type { ArchiveContent } from '@/src/archive/types';
import { CATEGORY_LABELS, CONTENT_TYPE_LABELS } from '@web/lib/labels';
import { ArchiveVisual } from './ArchiveVisual';
import { SaveButton } from './SaveButton';

type CardMeta = {
  icon: ComponentType<{ size?: number; weight?: 'regular' | 'bold' | 'fill'; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  label: string;
};

function summaryMeta(content: ArchiveContent): CardMeta[] {
  const info = content.structuredInfo;
  if ('durationMinutes' in info) {
    return [
      { icon: Clock, label: `${info.durationMinutes ?? '-'}분` },
      { icon: Bathtub, label: info.bathRequired ? '욕조 필요' : '욕조 없음' },
    ];
  }
  if ('publicAccess' in info) {
    return [
      { icon: MapPin, label: info.region ?? '지역 미정' },
      { icon: CheckCircle, label: info.publicAccess === 'available' ? '외부인 가능' : '이용 조건 확인' },
    ];
  }
  if ('itemType' in info) {
    return [
      { icon: ShoppingBag, label: info.itemType ?? '아이템' },
      { icon: Tag, label: info.priceRange ?? '가격대 미정' },
    ];
  }
  return [{ icon: FileText, label: '정리 글' }];
}

function toDisplayCopy(text: string): string {
  return text.replace(/루틴/g, '의식');
}

export function ArchiveCard({ content }: { content: ArchiveContent }) {
  return (
    <article className="archive-card-shell">
      <Link className="archive-card" href={`/content/${content.id}`}>
        <ArchiveVisual content={content} />
        <div className="archive-card-body">
          <p className="kicker">{CATEGORY_LABELS[content.category]} · {CONTENT_TYPE_LABELS[content.contentType]}</p>
          <h3>{toDisplayCopy(content.title)}</h3>
          <p>{toDisplayCopy(content.summary)}</p>
        </div>
        <div className="meta-row">
          {summaryMeta(content).map(({ icon: IconComponent, label }) => (
            <span key={label}>
              <IconComponent size={13} weight="bold" aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>
      </Link>
      <div className="archive-card-save">
        <SaveButton contentId={content.id} />
      </div>
    </article>
  );
}
