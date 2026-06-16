import Link from 'next/link';
import { ArrowRight, Compass, Tag } from '@phosphor-icons/react/ssr';
import type { ArchiveContent, ContentCategory } from '@/src/archive/types';
import { CATEGORY_LABELS } from '@web/lib/labels';
import { getCareHeroImageSrc } from '@web/lib/careImages';

const categoryGradients: Record<ContentCategory, string> = {
  HOME_BATH: 'linear-gradient(135deg, #DFF0ED, #F4E7C8)',
  BATH_PLACES: 'linear-gradient(135deg, #D9E8EA, #EDE2D1)',
  BATH_ITEMS: 'linear-gradient(135deg, #E8EFEA, #D9E8EA)',
  TIPS_CULTURE: 'linear-gradient(135deg, #F4E7C8, #DFF0ED)',
};

function toDisplayCopy(text: string): string {
  return text.replace(/루틴/g, '의식');
}

function getContinuationImageUri(content: ArchiveContent): string | null {
  const uri = content.heroImage?.uri;
  if (!uri || uri.startsWith('category-')) return null;
  if (uri.startsWith('care-hero:')) return getCareHeroImageSrc(uri.replace('care-hero:', ''));
  if (uri.startsWith('/')) return uri;
  if (!uri.startsWith('http://') && !uri.startsWith('https://')) return null;
  return uri;
}

export function ContentContinuation({ contents }: { contents: ArchiveContent[] }) {
  if (contents.length === 0) return null;

  return (
    <section className="content-continuation" aria-labelledby="content-continuation-title">
      <div className="content-continuation-heading">
        <span aria-hidden="true">
          <Compass size={18} weight="bold" />
        </span>
        <div>
          <p className="kicker">NEXT BATHTIME</p>
          <h2 id="content-continuation-title">이어서 읽어볼 바스타임 이야기</h2>
        </div>
      </div>
      <div className="content-continuation-list">
        {contents.map((content) => {
          const imageUri = getContinuationImageUri(content);

          return (
            <Link key={content.id} className="content-continuation-card" href={`/content/${content.id}`}>
              <div className="content-continuation-thumb" style={{ background: categoryGradients[content.category] }}>
                {imageUri ? (
                  <img src={imageUri} alt={content.heroImage?.alt || `${content.title} 대표 이미지`} loading="lazy" />
                ) : (
                  <span>{CATEGORY_LABELS[content.category]}</span>
                )}
              </div>
              <div className="content-continuation-copy">
                <span className="content-continuation-meta">
                  <Tag size={13} weight="bold" aria-hidden="true" />
                  {CATEGORY_LABELS[content.category]}
                </span>
                <strong>{toDisplayCopy(content.title)}</strong>
                <p>{toDisplayCopy(content.summary)}</p>
                <span className="content-continuation-cta">
                  이어서 읽기
                  <ArrowRight size={14} weight="bold" aria-hidden="true" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
