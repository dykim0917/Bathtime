import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArchiveVisual } from '@web/components/ArchiveVisual';
import { AffiliateDisclosureBadge } from '@web/components/AffiliateDisclosureBadge';
import { BodyRenderer } from '@web/components/BodyRenderer';
import { StructuredInfo } from '@web/components/StructuredInfo';
import { ContentFeedback } from '@web/components/ContentFeedback';
import { RoutineCard } from '@web/components/RoutineCard';
import { SaveButton } from '@web/components/SaveButton';
import type { ContentBodyBlock } from '@/src/archive/types';
import {
  getCanonicalContentUrl,
  getPreviewArchiveContent,
  getPublishedArchiveContent,
  getPublishedArchiveContents,
  getRelatedRoutinePresets,
} from '@web/lib/archive';
import { CATEGORY_LABELS, CONTENT_TYPE_LABELS } from '@web/lib/labels';

export const revalidate = 300;
export const dynamicParams = true;

function normalizeParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function splitLeadVerdict(blocks: ContentBodyBlock[]): { leadVerdict: string | null; bodyBlocks: ContentBodyBlock[] } {
  const headingIndex = blocks.findIndex((block) => block.type === 'heading' && block.text === '한 줄 판단');
  const nextBlock = headingIndex >= 0 ? blocks[headingIndex + 1] : undefined;

  if (!nextBlock || nextBlock.type !== 'paragraph') {
    return { leadVerdict: null, bodyBlocks: blocks };
  }

  return {
    leadVerdict: nextBlock.text,
    bodyBlocks: blocks.filter((_, index) => index !== headingIndex && index !== headingIndex + 1),
  };
}

function hasAffiliateProductLinks(blocks: ContentBodyBlock[]): boolean {
  return blocks.some((block) => {
    if (block.type !== 'productCandidates') return false;
    return block.items.some((item) => {
      const link = item.purchaseUrl;
      return (
        link.includes('link.coupang.com') ||
        link.includes('ozip.me') ||
        link.includes('oy.run') ||
        /제휴/.test(item.sourceLabel ?? '') ||
        /제휴/.test(item.metaSummary ?? '')
      );
    });
  });
}

async function resolveContent(id: string, previewToken?: string) {
  const previewContent = await getPreviewArchiveContent(id, previewToken);
  if (previewContent) return { content: previewContent, isPreview: true };

  const content = await getPublishedArchiveContent(id);
  if (!content) return null;
  return { content, isPreview: false };
}

export async function generateStaticParams() {
  const contents = await getPublishedArchiveContents();
  return contents.map((content) => ({ id: content.id }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ previewToken?: string | string[] }>;
}): Promise<Metadata> {
  const { id } = await params;
  const query = await searchParams;
  const resolved = await resolveContent(id, normalizeParam(query.previewToken));
  if (!resolved) return { title: '콘텐츠를 찾을 수 없습니다' };

  const { content, isPreview } = resolved;
  const title = content.seo?.seoTitle ?? `${content.title} - 바스타임`;
  const description = content.seo?.seoDescription ?? content.subtitle ?? content.summary;
  const canonical = getCanonicalContentUrl(content.id);
  const image = content.seo?.ogImage ?? content.heroImage?.uri;

  return {
    title,
    description,
    alternates: { canonical },
    robots: isPreview ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonical,
      images: image && image.startsWith('http') ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image && image.startsWith('http') ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image && image.startsWith('http') ? [image] : undefined,
    },
  };
}

export default async function ContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ previewToken?: string | string[] }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const resolved = await resolveContent(id, normalizeParam(query.previewToken));
  if (!resolved) notFound();

  const { content, isPreview } = resolved;
  const routines = getRelatedRoutinePresets(content);
  const { leadVerdict, bodyBlocks } = splitLeadVerdict(content.body);
  const showAffiliateDisclosure = hasAffiliateProductLinks(content.body);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: content.title,
    description: content.seo?.seoDescription ?? content.subtitle ?? content.summary,
    url: getCanonicalContentUrl(content.id),
    image: content.seo?.ogImage ?? content.heroImage?.uri,
    datePublished: content.createdAt,
    dateModified: content.updatedAt,
    publisher: {
      '@type': 'Organization',
      name: 'Bathtime',
      url: 'https://www.getbathtime.com',
    },
  };

  return (
    <article className="content-detail">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      {isPreview ? <p className="preview-banner">비공개 미리보기입니다. 검색엔진에는 노출되지 않습니다.</p> : null}

      <div className="content-hero-wrap">
        <ArchiveVisual content={content} priority badge={showAffiliateDisclosure ? <AffiliateDisclosureBadge /> : null} />
        <div className="hero-save-button">
          <SaveButton contentId={content.id} size={42} />
        </div>
      </div>

      <div className="content-layout">
        <div className="content-main">
          <header className="content-header">
            <div className="content-kicker-row">
              <p className="kicker">{CATEGORY_LABELS[content.category]} · {CONTENT_TYPE_LABELS[content.contentType]}</p>
            </div>
            <h1>{content.title}</h1>
            {content.subtitle ? <p>{content.subtitle}</p> : null}
            {leadVerdict ? (
              <aside className="lead-verdict">
                <strong>한 줄 판단</strong>
                <p>{leadVerdict}</p>
              </aside>
            ) : null}
          </header>

          <BodyRenderer blocks={bodyBlocks} />

          {!isPreview ? <ContentFeedback contentId={content.id} /> : null}

          {routines.length > 0 ? (
            <section className="section related-routines-section">
              <div className="section-heading-row">
                <h2>연결된 의식</h2>
                <a href="/routines">전체 보기</a>
              </div>
              <div className="routine-grid">
                {routines.map((routine) => <RoutineCard key={routine.id} routine={routine} showCta />)}
              </div>
            </section>
          ) : null}
        </div>

        <StructuredInfo content={content} />
      </div>
    </article>
  );
}
