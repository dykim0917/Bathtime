import type { ArchiveSave, ArchiveSource } from './api';
import type { ArchiveEntityDraft } from './contracts';

export interface ArchiveCard {
  id: string; kind: 'place' | 'product' | 'link'; name: string; location: string; summary: string;
  tags: string[]; facts: ArchiveEntityDraft['facts']; actionUrl?: string;
  sources: Array<{ saveId: string; source: ArchiveSource }>;
}

export function archiveCards(saves: ArchiveSave[]): ArchiveCard[] {
  const cards = new Map<string, ArchiveCard>();
  for (const saved of saves) {
    const source = saved.source;
    if (!source) continue;
    const references = [{ saveId: saved.id, source }];
    if (!source.links.length) {
      cards.set(`source:${source.id}`, { id: `source:${source.id}`, kind: 'link', name: source.title || '저장한 링크',
        location: source.platform === 'instagram' ? 'Instagram' : source.platform === 'youtube' ? 'YouTube' : '웹페이지',
        summary: source.summary, tags: [], facts: [], sources: references });
      continue;
    }
    for (const link of [...source.links].sort((a, b) => a.position - b.position)) {
      if (!link.entity) continue;
      const existing = cards.get(link.entity_id);
      if (existing) {
        existing.sources.push(...references);
        existing.tags = [...new Set([...existing.tags, ...link.details.tags])];
        const labels = new Set(existing.facts.map((fact) => fact.label));
        existing.facts.push(...link.details.facts.filter((fact) => !labels.has(fact.label)));
        continue;
      }
      cards.set(link.entity_id, { id: link.entity_id, kind: link.entity.kind, name: link.entity.name,
        location: link.entity.location, summary: link.details.summary, tags: link.details.tags,
        facts: [...link.details.facts], actionUrl: link.details.actionUrl, sources: references });
    }
  }
  return [...cards.values()];
}

export function filterArchiveCards(cards: ArchiveCard[], kind: 'all' | ArchiveCard['kind'], query: string) {
  const terms = query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return cards.filter((card) => (kind === 'all' || card.kind === kind) && terms.every((term) =>
    [card.name, card.location, card.summary, ...card.tags, ...card.sources.map(({ source }) => source.creator)].join(' ').toLocaleLowerCase().includes(term)));
}
