import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CheckCircle, ImagesSquare, LinkSimple, Sparkle, WarningCircle, Waves } from '@phosphor-icons/react/ssr';
import { OnsenReviewForm } from '@web/components/OnsenReviewForm';
import { OnsenSaveButton } from '@web/components/OnsenSaveButton';
import { OnsenShareButton } from '@web/components/OnsenShareButton';
import { TermInfo } from '@web/components/TermInfo';
import { getOnsenEntityType, statusLabels, type OnsenCandidate } from '@web/lib/onsenCatalog';
import { normalizeOnsenPublicCopy, normalizeOnsenSourceLabel } from '@web/lib/onsenCopy';
import { readOnsenCandidate } from '@web/lib/onsenData';
import { readOnsenReviewCounts, readOnsenReviews } from '@web/lib/onsenReviews';

type PageProps = {
  params: Promise<{ slug: string }>;
};

type OnsenFact = OnsenCandidate['facts'][number];

const facilityFactLabels = new Set([
  '대욕장',
  '대절탕',
  '객실 내 프라이빗탕',
  '객실 프라이빗탕',
  '프라이빗탕',
  '시설 유형',
  '목욕 구성',
  '공식 확인 항목',
]);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const candidate = await readOnsenCandidate(slug);

  if (!candidate) {
    return {
      title: '온천 정보 없음',
    };
  }

  return {
    title: `${candidate.name} 온천 근거`,
    description: getOnsenEntityType(candidate) === 'facility'
      ? `${candidate.name}의 공식 시설 정보, 목욕 구성, 온천수 근거와 이용 경험을 정리했습니다.`
      : `${candidate.name}의 객실 내 프라이빗탕, 대욕장, 온천수 체감과 확인해둘 점을 정리했습니다.`,
    alternates: {
      canonical: `/onsen/${candidate.slug}`,
    },
  };
}

function getGalleryItems(candidate: OnsenCandidate) {
  if (candidate.imageUrl) {
    return [
      {
        src: candidate.imageUrl,
        alt: candidate.imageAlt ?? `${candidate.name} 온천 이미지`,
      },
    ];
  }

  return [
    { label: '외관 또는 입구 사진' },
    { label: '온천탕 사진' },
    { label: getOnsenEntityType(candidate) === 'facility' ? '휴게 또는 이용 동선 사진' : '객실 또는 동선 사진' },
  ];
}

function getFacilityFacts(facts: OnsenFact[]) {
  return facts.filter((fact) => facilityFactLabels.has(fact.label));
}

function getOperationFact(candidate: OnsenCandidate) {
  return candidate.facts.find((fact) => fact.label.includes('온천수 방식') || fact.label.includes('온천수')) ?? null;
}

function getReviewSummary(candidate: OnsenCandidate) {
  if (candidate.verdict) {
    const highlights = candidate.verdict.items
      .map((item) => normalizeOnsenPublicCopy(item.chipLabel ?? item.headline))
      .filter((value, index, values) => value && values.indexOf(value) === index)
      .slice(0, 4);

    return {
      body: normalizeOnsenPublicCopy(candidate.verdict.headline),
      highlights: highlights.length > 0 ? highlights : [normalizeOnsenPublicCopy(candidate.primaryBath), normalizeOnsenPublicCopy(candidate.waterDecision.operation)].filter(Boolean),
    };
  }

  const bodyParts = [candidate.summary, ...candidate.signals.map((signal) => signal.summary)]
    .map((value) => normalizeOnsenPublicCopy(value))
    .filter((value, index, values) => value.length >= 24 && values.indexOf(value) === index);
  const body = bodyParts.slice(0, 2).join(' ') || normalizeOnsenPublicCopy(candidate.summary);
  const highlights = [
    normalizeOnsenPublicCopy(candidate.primaryBath),
    normalizeOnsenPublicCopy(candidate.waterDecision.operation),
    normalizeOnsenPublicCopy(candidate.fit[0] ?? ''),
    normalizeOnsenPublicCopy(candidate.waterDecision.roomBath),
  ].filter((value, index, values) => value && value !== '온천수 확인' && values.indexOf(value) === index);

  return { body, highlights };
}

function getSiteOrigin() {
  return (process.env.NEXT_PUBLIC_WEB_URL?.trim() || 'https://www.getbathtime.com').replace(/\/+$/, '');
}

function getAbsoluteUrl(pathOrUrl: string) {
  return new URL(pathOrUrl, getSiteOrigin()).toString();
}

function compactRecord<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => {
      if (entry === null || entry === undefined) return false;
      return !Array.isArray(entry) || entry.length > 0;
    })
  );
}

function serializeStructuredData(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function buildOnsenStructuredData(candidate: OnsenCandidate, siteReviewCount: number) {
  const url = getAbsoluteUrl(`/onsen/${candidate.slug}`);
  const candidateType = getOnsenEntityType(candidate);
  const experiencesRead = candidate.verdict?.briefing.experiencesRead ?? candidate.directReviews;
  const onsenRelated = candidate.verdict?.briefing.onsenRelated ?? candidate.onsenReviews;
  const address = compactRecord({
    '@type': 'PostalAddress',
    addressCountry: candidate.location?.country ?? 'JP',
    addressRegion: candidate.location?.prefectureLabel,
    addressLocality: candidate.location?.cityLabel,
  });
  const amenityFeature = candidate.facts
    .filter((fact) => fact.status === 'confirmed' || fact.label === '온천수 방식')
    .map((fact) =>
      compactRecord({
        '@type': 'LocationFeatureSpecification',
        name: fact.label,
        value: fact.value,
        description: normalizeOnsenPublicCopy(fact.detail),
      })
    );
  const additionalProperty = [
    compactRecord({
      '@type': 'PropertyValue',
      name: '바스타임이 분석한 이용 경험',
      value: experiencesRead,
    }),
    compactRecord({
      '@type': 'PropertyValue',
      name: '온천 관련 이용 경험',
      value: onsenRelated,
    }),
    siteReviewCount > 0
      ? compactRecord({
          '@type': 'PropertyValue',
          name: '바스타임 사용자 리뷰',
          value: siteReviewCount,
        })
      : null,
  ].filter(Boolean);

  return compactRecord({
    '@context': 'https://schema.org',
    '@type': candidateType === 'facility' ? 'LocalBusiness' : 'LodgingBusiness',
    '@id': `${url}#${candidateType}`,
    name: candidate.name,
    alternateName: candidate.jaName,
    description: normalizeOnsenPublicCopy(candidate.verdict?.headline ?? candidate.summary),
    url,
    image: candidate.imageUrl ? getAbsoluteUrl(candidate.imageUrl) : undefined,
    address,
    amenityFeature,
    interactionStatistic:
      typeof experiencesRead === 'number' && experiencesRead > 0
        ? [
            {
              '@type': 'InteractionCounter',
              interactionType: { '@type': 'ReviewAction' },
              userInteractionCount: experiencesRead,
              name: '바스타임이 분석한 이용 경험',
            },
          ]
        : [],
    additionalProperty,
  });
}

function formatBriefing(candidate: OnsenCandidate) {
  const briefing = candidate.verdict?.briefing;
  if (!briefing) return null;

  const parts = [
    typeof briefing.experiencesRead === 'number' ? `직접 읽은 이용 경험 ${briefing.experiencesRead}건` : null,
    typeof briefing.onsenRelated === 'number' ? `온천 관련 ${briefing.onsenRelated}건` : null,
    briefing.platforms.length > 0
      ? briefing.platforms.join(' · ')
      : typeof briefing.platformCount === 'number'
        ? `본문 확인 플랫폼 ${briefing.platformCount}개`
        : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(' · ') : null;
}

function formatVerdictMentionCount(candidate: OnsenCandidate, item: NonNullable<OnsenCandidate['verdict']>['items'][number]) {
  const denominator =
    item.counts.denominator === 'experiences_read'
      ? candidate.verdict?.briefing.experiencesRead
      : candidate.verdict?.briefing.onsenRelated;
  const denominatorLabel = item.counts.denominator === 'experiences_read' ? '직접 읽은 이용 경험' : '온천 관련';

  if (typeof denominator !== 'number') {
    return `${item.counts.mentions}건`;
  }

  return `${denominatorLabel} ${denominator}건 중 ${item.counts.mentions}건`;
}

export default async function OnsenDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const candidate = await readOnsenCandidate(slug);

  if (!candidate) {
    notFound();
  }

  const candidateType = getOnsenEntityType(candidate);
  const [reviewCounts, siteReviews] = await Promise.all([
    readOnsenReviewCounts([candidate.slug], candidateType),
    readOnsenReviews(candidate.slug, 6, candidateType),
  ]);
  const siteReviewCount = reviewCounts[candidate.slug] ?? 0;
  const galleryItems = getGalleryItems(candidate);
  const facilityFacts = getFacilityFacts(candidate.facts);
  const operationFact = getOperationFact(candidate);
  const reviewSummary = getReviewSummary(candidate);
  const onsenStructuredData = buildOnsenStructuredData(candidate, siteReviewCount);

  return (
    <article className="onsen-detail-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(onsenStructuredData) }} />
      <div className="onsen-detail-layout">
        <section className="onsen-stay-card" aria-labelledby="onsen-detail-title">
          <div className="onsen-detail-gallery" aria-label={`${candidate.name} 사진 슬라이드`}>
            <div className="onsen-gallery-track">
              {galleryItems.map((item, index) => (
                <figure key={`${candidate.slug}-gallery-${index}`} className="onsen-gallery-slide">
                  {'src' in item ? (
                    <img src={item.src} alt={item.alt} loading={index === 0 ? 'eager' : 'lazy'} />
                  ) : (
                    <div className="onsen-gallery-placeholder">
                      <ImagesSquare size={30} weight="bold" aria-hidden="true" />
                      <span>{item.label}</span>
                    </div>
                  )}
                </figure>
              ))}
            </div>
            <div className="onsen-gallery-dots" aria-hidden="true">
              {galleryItems.map((_, index) => (
                <span key={`${candidate.slug}-dot-${index}`} />
              ))}
            </div>
          </div>

          <header className="onsen-stay-head">
            <div>
              <p className="onsen-detail-kicker">{candidateType === 'facility' ? '당일온천 시설' : '온천 숙소'}</p>
              <h1 id="onsen-detail-title">{candidate.name}</h1>
              <span>{candidate.jaName}</span>
            </div>
            <div className="onsen-detail-actions" aria-label="온천 액션">
              <OnsenSaveButton slug={candidate.slug} />
              <OnsenShareButton title={candidate.name} summary={normalizeOnsenPublicCopy(candidate.summary)} />
            </div>
          </header>

          <section className="onsen-review-summary-card" aria-labelledby="onsen-review-summary-title">
            <div className="onsen-review-summary-head">
              <h2 id="onsen-review-summary-title">
                {candidate.verdict ? '바스타임 판정' : candidateType === 'facility' ? '시설 이용 요약' : '이런 점이 좋았어요'}
              </h2>
              <span>
                <Sparkle size={15} weight="fill" aria-hidden="true" />
                {candidate.verdict ? '이용 경험으로 확인' : candidateType === 'facility' ? '공식 사실·후기 분리' : '요약'}
              </span>
            </div>
            <p>{reviewSummary.body}</p>
            {formatBriefing(candidate) ? <p className="onsen-verdict-briefing">{formatBriefing(candidate)}</p> : null}
            <div className="onsen-review-summary-tags" aria-label="요약 포인트">
              {reviewSummary.highlights.map((highlight) => (
                <span key={highlight}>{highlight}</span>
              ))}
            </div>
          </section>

          {candidate.verdict?.items.length ? (
            <section className="onsen-compact-section onsen-verdict-section" aria-labelledby="onsen-verdict-title">
              <div className="onsen-compact-head">
                <Sparkle size={19} weight="fill" aria-hidden="true" />
                <h2 id="onsen-verdict-title">판정 근거</h2>
              </div>
              <div className="onsen-verdict-list">
                {candidate.verdict.items.map((item) => (
                  <article key={`${candidate.slug}-verdict-${item.order}`} className="onsen-verdict-item" data-type={item.type}>
                    <div className="onsen-verdict-item-head">
                      <span>근거 {item.order}</span>
                      <strong>{normalizeOnsenPublicCopy(item.headline)}</strong>
                    </div>
                    <p>{normalizeOnsenPublicCopy(item.body)}</p>
                    <dl>
                      <div>
                        <dt>관련 언급</dt>
                        <dd>{formatVerdictMentionCount(candidate, item)}</dd>
                      </div>
                      <div>
                        <dt>{(item.counts.directionCounts?.mixed ?? 0) > 0 ? '혼합 판정' : '부정 항목'}</dt>
                        <dd>{(item.counts.directionCounts?.mixed ?? 0) > 0 ? item.counts.directionCounts?.mixed : item.counts.negative}건</dd>
                      </div>
                    </dl>
                    <p className="onsen-verdict-conclusion">결론: {normalizeOnsenPublicCopy(item.verdict)}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className="onsen-compact-section" aria-labelledby="onsen-fit-title">
            <div className="onsen-compact-head">
              <CheckCircle size={19} weight="bold" aria-hidden="true" />
              <h2 id="onsen-fit-title">이럴 때 맞아요</h2>
            </div>
            <div className="onsen-fit-row">
              {candidate.fit.map((item) => (
                <span key={item}>{normalizeOnsenPublicCopy(item)}</span>
              ))}
            </div>
          </section>

          <section className="onsen-compact-section" aria-labelledby="onsen-facts-title">
            <div className="onsen-compact-head">
              <Waves size={19} weight="bold" aria-hidden="true" />
              <h2 id="onsen-facts-title">온천 정보</h2>
            </div>
            <div className="onsen-fact-list">
              {facilityFacts.length > 0 ? (
                <div className="onsen-facility-summary" aria-label="탕 구성">
                  {facilityFacts.map((fact) => (
                    <div key={fact.label} className="onsen-facility-item">
                      <span>{fact.label}</span>
                      <strong>{normalizeOnsenPublicCopy(fact.value)}</strong>
                      <em data-status={fact.status} aria-label={`${fact.label} 상태: ${statusLabels[fact.status]}`}>
                        {statusLabels[fact.status]}
                      </em>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="onsen-operation-card">
                <div>
                  <div className="onsen-operation-label-row">
                    <span>온천수 방식</span>
                    <TermInfo termKey="waterCriteria" />
                  </div>
                  <strong>{normalizeOnsenPublicCopy(candidate.waterDecision.operation)}</strong>
                </div>
                <p>{normalizeOnsenPublicCopy(operationFact?.detail ?? candidate.waterDecision.summary)}</p>
                <span className="onsen-status-badge" data-status={operationFact?.status ?? 'needs_check'}>
                  온천수 방식 {candidateType === 'facility' && (operationFact?.status ?? 'needs_check') === 'needs_check'
                    ? '확인 중'
                    : statusLabels[operationFact?.status ?? 'needs_check']}
                </span>
              </div>
            </div>
          </section>

          <section className="onsen-compact-section" aria-labelledby="onsen-cautions-title">
            <div className="onsen-compact-head">
              <WarningCircle size={19} weight="bold" aria-hidden="true" />
              <h2 id="onsen-cautions-title">확인해둘 점</h2>
            </div>
            <div className="onsen-caution-list">
              {candidate.cautions.map((caution) => (
                <div key={caution.issue}>
                  <strong>{caution.issue}</strong>
                  <p>{normalizeOnsenPublicCopy(caution.summary)}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="onsen-compact-section" aria-labelledby="onsen-sources-title">
            <div className="onsen-compact-head">
              <LinkSimple size={19} weight="bold" aria-hidden="true" />
              <h2 id="onsen-sources-title">확인한 정보</h2>
            </div>
            <div className="onsen-source-list">
              {candidate.sources.map((source) => (
                <div key={source.label}>
                  <span>{normalizeOnsenSourceLabel(source.label)}</span>
                  <p>{normalizeOnsenPublicCopy(source.note)}</p>
                </div>
              ))}
            </div>
            <div className="onsen-official-links">
              {candidate.officialLinks.map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                  <LinkSimple size={16} weight="bold" aria-hidden="true" />
                  {link.label}
                </a>
              ))}
            </div>
          </section>
        </section>

        <aside className="onsen-review-column" aria-label="바스타임 리뷰">
          <OnsenReviewForm
            targetType={candidateType}
            targetSlug={candidate.slug}
            targetName={candidate.name}
            reviewCount={siteReviewCount}
            reviews={siteReviews}
          />
        </aside>
      </div>
    </article>
  );
}
