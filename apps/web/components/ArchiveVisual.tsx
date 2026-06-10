import type { ComponentType } from 'react';
import { Bathtub, BookOpen, MapTrifold, Package } from '@phosphor-icons/react/ssr';
import type { ArchiveContent, ContentCategory } from '@/src/archive/types';
import { CATEGORY_LABELS } from '@web/lib/labels';
import { getCareHeroImageSrc } from '@web/lib/careImages';

type PhosphorIcon = ComponentType<{ size?: number; weight?: 'regular' | 'bold' | 'fill'; 'aria-hidden'?: boolean | 'true' | 'false' }>;

const categoryGradients: Record<ContentCategory, string> = {
  HOME_BATH: 'linear-gradient(135deg, #DFF0ED, #F4E7C8)',
  BATH_PLACES: 'linear-gradient(135deg, #D9E8EA, #EDE2D1)',
  BATH_ITEMS: 'linear-gradient(135deg, #E8EFEA, #D9E8EA)',
  TIPS_CULTURE: 'linear-gradient(135deg, #F4E7C8, #DFF0ED)',
};

const categoryIcons: Record<ContentCategory, PhosphorIcon> = {
  HOME_BATH: Bathtub,
  BATH_PLACES: MapTrifold,
  BATH_ITEMS: Package,
  TIPS_CULTURE: BookOpen,
};

function getUsableImageUri(content: ArchiveContent): string | null {
  const uri = content.heroImage?.uri;
  if (!uri || uri.startsWith('category-')) return null;
  if (uri.startsWith('care-hero:')) return getCareHeroImageSrc(uri.replace('care-hero:', ''));
  if (uri.startsWith('/')) return uri;
  if (!uri.startsWith('http://') && !uri.startsWith('https://')) return null;
  return uri;
}

export function ArchiveVisual({ content, priority = false }: { content: ArchiveContent; priority?: boolean }) {
  const uri = getUsableImageUri(content);
  const IconComponent = categoryIcons[content.category];

  return (
    <div className="archive-visual" style={{ background: categoryGradients[content.category] }}>
      {uri ? <img src={uri} alt="" aria-hidden="true" loading={priority ? 'eager' : 'lazy'} /> : null}
      <span>
        <IconComponent size={12} weight="bold" aria-hidden="true" />
        {CATEGORY_LABELS[content.category]}
      </span>
    </div>
  );
}
