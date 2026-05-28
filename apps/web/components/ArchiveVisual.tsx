import type { ArchiveContent, ContentCategory } from '@/src/archive/types';
import { CATEGORY_LABELS } from '@web/lib/labels';

const categoryGradients: Record<ContentCategory, string> = {
  HOME_BATH: 'linear-gradient(135deg, #DFF0ED, #F4E7C8)',
  BATH_PLACES: 'linear-gradient(135deg, #D9E8EA, #EDE2D1)',
  BATH_ITEMS: 'linear-gradient(135deg, #E8EFEA, #D9E8EA)',
  TIPS_CULTURE: 'linear-gradient(135deg, #F4E7C8, #DFF0ED)',
};

function getUsableImageUri(content: ArchiveContent): string | null {
  const uri = content.heroImage?.uri;
  if (!uri || uri.startsWith('category-') || uri.startsWith('care-hero:')) return null;
  if (!uri.startsWith('http://') && !uri.startsWith('https://')) return null;
  return uri;
}

export function ArchiveVisual({ content, priority = false }: { content: ArchiveContent; priority?: boolean }) {
  const uri = getUsableImageUri(content);

  return (
    <div className="archive-visual" style={{ background: categoryGradients[content.category] }}>
      {uri ? <img src={uri} alt={content.heroImage?.alt ?? content.title} loading={priority ? 'eager' : 'lazy'} /> : null}
      <span>{CATEGORY_LABELS[content.category]}</span>
    </div>
  );
}
