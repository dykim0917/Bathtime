import { archiveContents, routinePresets } from '@/src/archive/seed';
import { ArchiveContent, ContentCategory } from '@/src/archive/types';
import { searchArchiveContents } from '@/src/archive/runtime';

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
  return searchArchiveContents(getPublishedContents(), params);
}

export function getRelatedRoutinePresets(content: ArchiveContent) {
  return routinePresets.filter((routine) => content.relatedRoutineIds?.includes(routine.id));
}

export function getRoutinePresetById(id: string) {
  return routinePresets.find((routine) => routine.id === id);
}
