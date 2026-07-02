import type { ComponentType, ReactNode } from 'react';
import { Bathtub, BookOpen, MapTrifold, Package } from '@phosphor-icons/react/ssr';
import type { ArchiveContent, ContentCategory } from '@/src/archive/types';
import { CATEGORY_LABELS } from '@web/lib/labels';
import { getCareHeroImageSrc } from '@web/lib/careImages';

type PhosphorIcon = ComponentType<{ size?: number; weight?: 'regular' | 'bold' | 'fill'; 'aria-hidden'?: boolean | 'true' | 'false' }>;

const categoryGradients: Record<ContentCategory, string> = {
  HOME_BATH: 'linear-gradient(135deg, var(--primary-soft), var(--mist))',
  BATH_PLACES: 'linear-gradient(135deg, var(--mist), var(--surface-soft))',
  BATH_ITEMS: 'linear-gradient(135deg, var(--surface-soft), var(--primary-soft))',
  TIPS_CULTURE: 'linear-gradient(135deg, var(--brass-soft), var(--mist))',
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

export function ArchiveVisual({
  content,
  priority = false,
  badge,
}: {
  content: ArchiveContent;
  priority?: boolean;
  badge?: ReactNode;
}) {
  const uri = getUsableImageUri(content);
  const IconComponent = categoryIcons[content.category];
  const imageAlt = content.heroImage?.alt || `${content.title} 대표 이미지`;

  return (
    <div className="archive-visual" style={{ background: categoryGradients[content.category] }}>
      {uri ? (
        <img
          src={uri}
          alt={imageAlt}
          width={1200}
          height={675}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
        />
      ) : null}
      {badge ? (
        <div className="archive-visual-label-row">
          <span>
            <IconComponent size={12} weight="bold" aria-hidden="true" />
            {CATEGORY_LABELS[content.category]}
          </span>
          {badge}
        </div>
      ) : (
        <span>
          <IconComponent size={12} weight="bold" aria-hidden="true" />
          {CATEGORY_LABELS[content.category]}
        </span>
      )}
    </div>
  );
}
