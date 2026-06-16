import Link from 'next/link';
import { ArrowRight, Books, Check } from '@phosphor-icons/react/ssr';
import type { ArchiveContent } from '@/src/archive/types';
import { getContentSeriesInfo } from '@web/lib/archive';

function toDisplayCopy(text: string): string {
  return text.replace(/루틴/g, '의식');
}

export function ContentSeriesPanel({
  currentContentId,
  contents,
}: {
  currentContentId: string;
  contents: ArchiveContent[];
}) {
  if (contents.length < 2) return null;

  const series = getContentSeriesInfo(contents.find((content) => content.id === currentContentId) ?? contents[0]);
  if (!series) return null;

  return (
    <section className="body-panel content-series-panel" aria-labelledby="content-series-title">
      <div className="content-series-heading">
        <span aria-hidden="true">
          <Books size={18} weight="bold" />
        </span>
        <div>
          <p className="kicker">SERIES</p>
          <h3 id="content-series-title">{series.title}</h3>
          {series.description ? <p>{series.description}</p> : null}
        </div>
      </div>
      <ol className="content-series-list">
        {contents.map((content) => {
          const itemSeries = getContentSeriesInfo(content);
          const isCurrent = content.id === currentContentId;
          const title = toDisplayCopy(content.title);

          const inner = (
            <>
              <span>{itemSeries?.order ?? '-'}</span>
              <strong>{title}</strong>
              {isCurrent ? (
                <Check size={15} weight="bold" aria-label="현재 글" />
              ) : (
                <ArrowRight size={15} weight="bold" aria-hidden="true" />
              )}
            </>
          );

          return (
            <li key={content.id} className={isCurrent ? 'current' : undefined}>
              {isCurrent ? inner : <Link className="content-series-card-link" href={`/content/${content.id}`}>{inner}</Link>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
