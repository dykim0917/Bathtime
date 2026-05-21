import { archiveContents } from '@/src/archive/seed';

const standardCareArticleIds = [
  'care-sleep-warm-shower-90',
  'care-stress-warm-water',
  'care-muscle-warm-shower',
  'care-edema-footbath-evening',
  'care-hangover-gentle-footbath',
  'care-cold-gentle-warmth',
  'care-menstrual-gentle-heat',
  'care-mood-small-shower',
];

describe('care archive template v1', () => {
  test.each(standardCareArticleIds)('keeps %s on the P0 standard format', (id) => {
    const content = archiveContents.find((item) => item.id === id);

    expect(content).toBeDefined();
    expect(content?.careArchive?.templateVersion).toBe('care-archive.v1');
    expect(content?.careArchive?.summaryCard.primaryCTA.timerId).toBeTruthy();

    const blockTypes = new Set(content?.body.map((block) => block.type));
    expect(blockTypes.has('heroIntro')).toBe(true);
    expect(blockTypes.has('aha')).toBe(true);
    expect(blockTypes.has('mechanism')).toBe(true);
    expect(blockTypes.has('evidenceCard')).toBe(true);
    expect(blockTypes.has('ritualTimer')).toBe(true);
    expect(blockTypes.has('safetyBox')).toBe(true);
    expect(blockTypes.has('ctaGroup')).toBe(true);
  });

  test.each(standardCareArticleIds)('separates evidence findings from Bathtime interpretations in %s', (id) => {
    const content = archiveContents.find((item) => item.id === id);
    const evidenceBlock = content?.body.find((block) => block.type === 'evidenceCard');

    expect(evidenceBlock?.type).toBe('evidenceCard');
    if (evidenceBlock?.type !== 'evidenceCard') return;

    expect(evidenceBlock.items.length).toBeGreaterThanOrEqual(2);
    for (const item of evidenceBlock.items) {
      expect(item.finding).toBeTruthy();
      expect(item.bathtimeTakeaway).toBeTruthy();
      expect(item.finding).not.toBe(item.bathtimeTakeaway);
    }
  });

  test.each(standardCareArticleIds)('avoids strong medical efficacy claims in %s', (id) => {
    const content = archiveContents.find((item) => item.id === id);
    const serialized = JSON.stringify(content);

    expect(serialized).not.toMatch(/치료법|개선법|효능/);
  });

  test.each(standardCareArticleIds)('includes a ritual guide image in %s', (id) => {
    const content = archiveContents.find((item) => item.id === id);
    const guideImageBlock = content?.body.find(
      (block) => block.type === 'image' && block.uri.startsWith('care-guide:')
    );

    expect(guideImageBlock).toBeDefined();
  });

  test.each(standardCareArticleIds)('uses a care hero image in %s', (id) => {
    const content = archiveContents.find((item) => item.id === id);

    expect(content?.heroImage?.uri).toMatch(/^care-hero:/);
  });
});
