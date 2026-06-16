import Link from 'next/link';
import { ArrowRight, Books } from '@phosphor-icons/react/ssr';
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

          return (
            <li key={content.id} className={isCurrent ? 'current' : undefined}>
              <span>{itemSeries?.order ?? '-'}</span>
              <div>
                {isCurrent ? (
                  <strong>{toDisplayCopy(content.title)}</strong>
                ) : (
                  <Link href={`/content/${content.id}`}>{toDisplayCopy(content.title)}</Link>
                )}
                <p>{toDisplayCopy(content.summary)}</p>
              </div>
              {isCurrent ? <em>읽는 중</em> : <ArrowRight size={15} weight="bold" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
