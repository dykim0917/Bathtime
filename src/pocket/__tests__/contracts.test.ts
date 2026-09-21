import { normalizeArchiveLink, parseArchiveReview } from '../contracts';

describe('shared archive links', () => {
  it('deduplicates Shorts, watch and short URLs without keeping tracking parameters', () => {
    const inputs = [
      '목욕탕 https://youtube.com/shorts/ZZdGwLauM00?si=abc',
      'https://www.youtube.com/watch?v=ZZdGwLauM00&list=x',
      'https://youtu.be/ZZdGwLauM00?t=9',
    ];
    expect(new Set(inputs.map((input) => normalizeArchiveLink(input).canonicalKey)).size).toBe(1);
    expect(normalizeArchiveLink(inputs[0]).url).toBe('https://www.youtube.com/watch?v=ZZdGwLauM00');
  });
  it('keeps Instagram identity across reel/post forms and drops share tokens', () => {
    expect(normalizeArchiveLink('https://www.instagram.com/reel/DZG2aGRD1na/?stkn=secret')).toEqual(
      normalizeArchiveLink('https://www.instagram.com/p/DZG2aGRD1na/?img_index=1'));
  });
  it('preserves meaningful product variants while dropping known tracking', () => {
    expect(normalizeArchiveLink('https://shop.example.com/item?size=500&sku=red&utm_source=ig').url)
      .toBe('https://shop.example.com/item?size=500&sku=red');
    expect(normalizeArchiveLink('https://shop.example.com/item?sku=red').canonicalKey)
      .not.toBe(normalizeArchiveLink('https://shop.example.com/item?sku=blue').canonicalKey);
  });
  it.each(['no URL', 'javascript:alert(1)', 'https://localhost/a', 'http://127.0.0.1/',
    'https://user:password@example.com/a', 'https://example.com:444/a', 'https://instagram.com/account/',
    'https://youtu.be/too-short', 'https://[::1]/', 'https://foo.local/test'])('rejects unsupported input %s', (input) => {
    expect(() => normalizeArchiveLink(input)).toThrow();
  });
  it('does not treat lookalike platform domains as Instagram', () => {
    expect(normalizeArchiveLink('https://instagram.com.example.com/p/abc').platform).toBe('web');
  });
});

const review = {
  version: 1, sourceId: '11111111-1111-4111-8111-111111111111', expectedRevision: 0,
  title: '목욕 아이템', summary: '소개한 제품이에요.', creator: '', checkedAt: '2026-09-22', status: 'ready',
  entities: [{ kind: 'product', name: '입욕제', location: '브랜드', summary: '', tags: ['입욕제'],
    facts: [{ label: '용량', value: '100g', sourceUrl: 'https://shop.example.com/item', basis: 'official', checkedAt: '2026-09-22' }] }],
};

describe('operator review contract', () => {
  it('accepts source-attributed product information and multiple entities', () => {
    expect(parseArchiveReview(review).entities[0].facts[0].basis).toBe('official');
    expect(parseArchiveReview({ ...review, entities: [...review.entities, { ...review.entities[0], kind: 'place', name: '온천' }] }).entities).toHaveLength(2);
  });
  it('allows a useful summary without forcing a place or product match', () => {
    expect(parseArchiveReview({ ...review, entities: [] }).entities).toEqual([]);
  });
  it.each([
    { ...review, sourceId: 'invalid' }, { ...review, checkedAt: '2026-02-30' },
    { ...review, expectedRevision: -1 }, { ...review, status: 'unavailable', entities: [] },
    { ...review, entities: [{ ...review.entities[0], actionUrl: 'javascript:alert(1)' }] },
    { ...review, entities: [{ ...review.entities[0], facts: [{ ...review.entities[0].facts[0], basis: 'guessed' }] }] },
  ])('rejects unsafe or incomplete results', (input) => expect(() => parseArchiveReview(input)).toThrow());
});
