import { archiveCards, filterArchiveCards } from '../selectors';
import type { ArchiveSave, ArchiveSource } from '../api';

function save(id: string, links: ArchiveSource['links']): ArchiveSave {
  return { id: `save-${id}`, created_at: '2026-09-22', source: {
    id, url: `https://example.com/${id}`, canonical_key: `web:${id}`, platform: 'web', title: '사우나 모음',
    summary: '', creator: '작성자', status: 'ready', reason: null, posted_at: null, checked_at: null, revision: 1, links,
  } };
}
function link(id: string, kind: 'place' | 'product', name: string, label = '운영시간', value = '10시'): ArchiveSource['links'][number] {
  return { entity_id: id, position: 0, entity: { id, kind, name, location: '서울' }, details: {
    summary: '목욕 후 쉬어갈 곳', tags: ['휴게실'], facts: [{ label, value, basis: 'post', checkedAt: '2026-09-22', sourceUrl: `https://example.com/${value}` }],
  } };
}

it('splits one saved post into its places and products', () => {
  const cards = archiveCards([save('one', [link('a', 'place', '목욕탕'), link('b', 'product', '입욕제')])]);
  expect(cards.map((card) => card.kind)).toEqual(['place', 'product']);
  expect(cards.every((card) => card.sources[0].saveId === 'save-one')).toBe(true);
});

it('groups multiple posts for a place, preserving provenance and additional facts', () => {
  const fresh = save('new', [link('a', 'place', '목욕탕', '운영시간', '11시')]);
  const older = save('old', [link('a', 'place', '목욕탕', '휴무일', '월요일')]);
  const stale = save('stale', [link('a', 'place', '목욕탕', '운영시간', '9시')]);
  const [card] = archiveCards([fresh, older, stale]);
  expect(card.sources).toHaveLength(3);
  expect(card.facts.map((fact) => fact.value)).toEqual(['11시', '월요일']);
  expect(card.facts[1].sourceUrl).toBe('https://example.com/월요일');
  expect(fresh.source.links[0].details.facts).toHaveLength(1);
});

it('keeps unavailable posts as links and filters across location and tags', () => {
  const cards = archiveCards([save('pending', []), save('reviewed', [link('a', 'place', '목욕탕')])]);
  expect(filterArchiveCards(cards, 'link', '')).toHaveLength(1);
  expect(filterArchiveCards(cards, 'place', '서울 휴게실')).toHaveLength(1);
  expect(filterArchiveCards(cards, 'product', '서울')).toHaveLength(0);
});

it('removing one post leaves the place when another saved post still describes it', () => {
  const other = save('two', [link('a', 'place', '목욕탕')]);
  expect(archiveCards([other])[0].sources.map((entry) => entry.saveId)).toEqual(['save-two']);
  expect(archiveCards([])).toEqual([]);
});
