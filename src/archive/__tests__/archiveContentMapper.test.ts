import { mapArchiveContentDbRow, type ArchiveContentDbRow } from '@/src/archive/archiveContentMapper';

function makeRow(overrides: Partial<ArchiveContentDbRow> = {}): ArchiveContentDbRow {
  return {
    id: 'place-dormy-inn-gangnam',
    title: '도미인 서울 강남',
    subtitle: '강남권 숙박과 대욕장을 함께 보는 선택지',
    summary: '도미인 서울 강남 아카이브 요약',
    category: 'BATH_PLACES',
    content_type: 'RESEARCHED',
    tags: ['서울', '혼자 쉬기'],
    hero_image: {
      uri: 'category-place',
      alt: '도미인 서울 강남 콘텐츠 대표 이미지',
      sourceType: 'generated',
    },
    body: [{ type: 'paragraph', text: '방문 전 운영 조건을 확인하세요.' }],
    structured_info: {
      region: '서울 강남',
      publicAccess: 'restricted',
    },
    related_routine_ids: ['bath-15'],
    related_item_ids: [],
    related_place_ids: [],
    seo: {
      seoTitle: '도미인 서울 강남 - 바스타임',
    },
    is_published: true,
    status: 'active',
    content_created_at: '2026-05-18',
    content_updated_at: '2026-05-18',
    ...overrides,
  };
}

describe('mapArchiveContentDbRow', () => {
  test('maps archive_content rows into ArchiveContent', () => {
    const content = mapArchiveContentDbRow(makeRow());

    expect(content).toMatchObject({
      id: 'place-dormy-inn-gangnam',
      category: 'BATH_PLACES',
      contentType: 'RESEARCHED',
      tags: ['서울', '혼자 쉬기'],
      isPublished: true,
      createdAt: '2026-05-18',
      updatedAt: '2026-05-18',
    });
    expect(content.heroImage?.sourceType).toBe('generated');
    expect(content.body).toHaveLength(1);
    expect(content.relatedRoutineIds).toEqual(['bath-15']);
  });

  test('keeps non-active rows unpublished even when is_published is true', () => {
    const content = mapArchiveContentDbRow(makeRow({ status: 'draft' }));

    expect(content.isPublished).toBe(false);
  });

  test('treats admin-uploaded hero images as owned assets', () => {
    const content = mapArchiveContentDbRow(
      makeRow({
        hero_image: {
          uri: 'https://example.supabase.co/storage/v1/object/public/bathtime-assets/archive/item/hero.png',
          alt: '관리자가 업로드한 대표 이미지',
          sourceType: 'uploaded',
        },
      })
    );

    expect(content.heroImage).toMatchObject({
      uri: 'https://example.supabase.co/storage/v1/object/public/bathtime-assets/archive/item/hero.png',
      alt: '관리자가 업로드한 대표 이미지',
      sourceType: 'owned',
    });
  });

  test('normalizes unsupported enum and json values conservatively', () => {
    const content = mapArchiveContentDbRow(
      makeRow({
        category: 'UNKNOWN',
        content_type: 'UNKNOWN',
        tags: '서울',
        hero_image: { uri: 'missing-alt' },
        body: null,
        structured_info: null,
        seo: null,
      })
    );

    expect(content.category).toBe('TIPS_CULTURE');
    expect(content.contentType).toBe('ORGANIZED');
    expect(content.tags).toEqual([]);
    expect(content.heroImage).toBeUndefined();
    expect(content.body).toEqual([]);
    expect(content.structuredInfo).toEqual({});
    expect(content.seo).toEqual({});
  });
});
