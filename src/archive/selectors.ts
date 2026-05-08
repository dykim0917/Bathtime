import { archiveContents, routinePresets } from '@/src/archive/seed';
import { ArchiveContent, ContentCategory } from '@/src/archive/types';

export function getPublishedContents(): ArchiveContent[] {
  return archiveContents.filter((content) => content.isPublished);
}

export function getContentById(id: string): ArchiveContent | undefined {
  return archiveContents.find((content) => content.id === id);
}

export function getFeaturedContent(): ArchiveContent {
  return getPublishedContents()[0];
}

export function getLatestContents(limit = 6): ArchiveContent[] {
  return [...getPublishedContents()]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit);
}

export function getContentsByCategory(category: ContentCategory, limit?: number): ArchiveContent[] {
  const items = getPublishedContents().filter((content) => content.category === category);
  return limit ? items.slice(0, limit) : items;
}

export function searchContents(params: {
  category?: ContentCategory | 'ALL';
  tag?: string | null;
  query?: string;
}): ArchiveContent[] {
  const query = params.query?.trim().toLowerCase() ?? '';

  return getPublishedContents().filter((content) => {
    const matchesCategory = !params.category || params.category === 'ALL' || content.category === params.category;
    const matchesTag = !params.tag || content.tags.includes(params.tag);
    const matchesQuery =
      query.length === 0 ||
      content.title.toLowerCase().includes(query) ||
      content.subtitle?.toLowerCase().includes(query) ||
      content.tags.some((tag) => tag.toLowerCase().includes(query));
    return matchesCategory && matchesTag && matchesQuery;
  });
}

export function getRelatedRoutinePresets(content: ArchiveContent) {
  return routinePresets.filter((routine) => content.relatedRoutineIds?.includes(routine.id));
}

export function getRoutinePresetById(id: string) {
  return routinePresets.find((routine) => routine.id === id);
}
