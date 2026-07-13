import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowSquareOut, LinkSimple, MapPin, MapTrifold, SealCheck, Sparkle, WarningCircle, Waves } from '@phosphor-icons/react/ssr';
import { OnsenDecisionFactDetails, OnsenDetailAnalytics, OnsenTrackedExternalLink } from '@web/components/OnsenAnalytics';
import { OnsenReviewForm } from '@web/components/OnsenReviewForm';
import { OnsenReviewDrawer } from '@web/components/OnsenReviewDrawer';
import { OnsenReviewSection } from '@web/components/OnsenReviewSection';
import { OnsenSaveButton } from '@web/components/OnsenSaveButton';
import { OnsenShareButton } from '@web/components/OnsenShareButton';
import { TermInfo } from '@web/components/TermInfo';
import { getOnsenEntityType, statusLabels, type OnsenCandidate } from '@web/lib/onsenCatalog';
import { getOnsenCardSummary, normalizeOnsenFitCopy, normalizeOnsenPublicCopy, normalizeOnsenSourceLabel } from '@web/lib/onsenCopy';
import { readOnsenCandidate } from '@web/lib/onsenData';
import { getOnsenDecisionProfile } from '@web/lib/onsenDecision';
import { normalizeOnsenEntryIntent } from '@web/lib/onsenIntent';
import { readOnsenReviewAggregate, readOnsenReviewCounts, readOnsenReviews } from '@web/lib/onsenReviews';
import { OnsenDetailGallery, type OnsenDetailGalleryItem } from './OnsenDetailGallery';
import styles from './page.module.css';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ intent?: string | string[]; from?: string | string[] }>;
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
  '공식 물빛',
  '후기에서 본 감촉',
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
      ? `${candidate.name}의 공식 시설 정보, 목욕 구성, 온천수 근거와 후기를 정리했습니다.`
      : `${candidate.name}의 객실 내 프라이빗탕, 대욕장, 온천수 체감과 이용 전 확인사항을 정리했습니다.`,
    alternates: {
      canonical: `/onsen/${candidate.slug}`,
      languages: {
        'ko-KR': `/onsen/${candidate.slug}`,
        en: `/en/onsen/${candidate.slug}`,
        'x-default': `/onsen/${candidate.slug}`,
      },
    },
  };
}

function getGalleryItems(candidate: OnsenCandidate): OnsenDetailGalleryItem[] {
  const images = [
    ...(candidate.galleryImages ?? []).map((image) => ({ src: image.url, alt: image.alt })),
    ...(candidate.imageUrl ? [{ src: candidate.imageUrl, alt: candidate.imageAlt }] : []),
  ].filter((image, index, items) => image.src && items.findIndex((item) => item.src === image.src) === index);

  if (images.length > 0) {
    return images.map((image, index) => ({
      ...image,
      alt: image.alt ?? `${candidate.name} 사진 ${index + 1}`,
      label: `사진 ${index + 1}`,
    }));
  }

  return Array.from({ length: 4 }, (_, index) => ({ label: `사진 ${index + 1}` }));
}

function getFacilityFacts(facts: OnsenFact[]) {
  return facts.filter((fact) => facilityFactLabels.has(fact.label));
}

function getWaterVerification(candidate: OnsenCandidate): NonNullable<OnsenCandidate['waterVerification']> {
  if (candidate.waterVerification) return candidate.waterVerification;

  const operationFact = candidate.facts.find((fact) => fact.label.includes('온천수 방식') || fact.label.includes('온천수'));
  const status = operationFact?.status ?? 'needs_check';

  return {
    status,
    basis: status === 'confirmed'
      ? `공식 안내에서 ${normalizeOnsenPublicCopy(candidate.waterDecision.operation)} 방식을 확인했습니다.`
      : '온천수 사용은 확인했지만 직수·순환식 여부는 공식 자료에서 확인 중입니다.',
    scope: normalizeOnsenPublicCopy(candidate.primaryBath),
    conditions: candidate.waterProfile?.conditionLabels ?? [],
    unresolved: status === 'confirmed' ? [] : ['직수·순환식 여부'],
    exceptions: [],
    guidance: status === 'confirmed' ? undefined : '온천수 방식이 선택 기준이라면 방식 확인이 끝난 후보와 먼저 비교하세요.',
    sources: candidate.officialLinks,
    verifiedAt: candidate.updatedAt || undefined,
  };
}

function formatVerificationDate(value: string) {
  const date = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? value;
  return date.replaceAll('-', '.');
}

function getMapSearchUrl(candidate: OnsenCandidate) {
  if (candidate.facilityDetails?.mapUrl) return candidate.facilityDetails.mapUrl;
  const query = [candidate.jaName || candidate.name, candidate.location?.prefectureLabel]
    .filter(Boolean)
    .join(' ');

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function normalizeSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function decisionFactStatusLabel(status: 'confirmed' | 'conditional' | 'needs_check') {
  if (status === 'confirmed') return '확인됨';
  if (status === 'conditional') return '조건부';
  return '확인 중';
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
      name: '바스타임이 분석한 후기',
      value: experiencesRead,
    }),
    compactRecord({
      '@type': 'PropertyValue',
      name: '온천 관련 후기',
      value: onsenRelated,
    }),
    siteReviewCount > 0
      ? compactRecord({
          '@type': 'PropertyValue',
          name: '바스타임 사용자 후기',
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
    description: normalizeOnsenPublicCopy(getOnsenCardSummary(candidate)),
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
              name: '바스타임이 분석한 후기',
            },
          ]
        : [],
    additionalProperty,
  });
}

function formatVerdictMentionCount(candidate: OnsenCandidate, item: NonNullable<OnsenCandidate['verdict']>['items'][number]) {
  const denominator =
    item.counts.denominator === 'experiences_read'
      ? candidate.verdict?.briefing.experiencesRead
      : candidate.verdict?.briefing.onsenRelated;
  const denominatorLabel = item.counts.denominator === 'experiences_read' ? '후기' : '온천 관련 후기';

  if (typeof denominator !== 'number') {
    return `${item.counts.mentions}건`;
  }

  return `${denominatorLabel} ${denominator}건 중 ${item.counts.mentions}건`;
}

export default async function OnsenDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const entryIntent = normalizeOnsenEntryIntent(normalizeSearchParam(resolvedSearchParams?.intent));
  const candidate = await readOnsenCandidate(slug);

  if (!candidate) {
    notFound();
  }

  const candidateType = getOnsenEntityType(candidate);
  const [reviewCounts, siteReviews, siteReviewAggregate] = await Promise.all([
    readOnsenReviewCounts([candidate.slug], candidateType),
    readOnsenReviews(candidate.slug, 10, candidateType),
    readOnsenReviewAggregate(candidate.slug, candidateType),
  ]);
  const siteReviewCount = reviewCounts[candidate.slug] ?? 0;
  const galleryItems = getGalleryItems(candidate);
  const facilityFacts = getFacilityFacts(candidate.facts);
  const waterVerification = getWaterVerification(candidate);
  const verdictHeadline = normalizeOnsenPublicCopy(getOnsenCardSummary(candidate));
  const onsenStructuredData = buildOnsenStructuredData(candidate, siteReviewCount);
  const mapSearchUrl = getMapSearchUrl(candidate);
  const decisionProfile = getOnsenDecisionProfile(candidate);
  const heroDecisionFacts = (candidateType === 'facility'
    ? [decisionProfile.price, ...decisionProfile.trip, ...decisionProfile.experience]
    : [
        ...decisionProfile.experience.filter((fact) => fact.status !== 'needs_check'),
        ...decisionProfile.experience.filter((fact) => fact.status === 'needs_check'),
        decisionProfile.price,
      ])
    .filter((fact): fact is NonNullable<typeof fact> => Boolean(fact))
    .filter((fact, index, facts) => facts.findIndex((item) => item.code === fact.code) === index)
    .slice(0, 2);
  const onsenArea = candidate.location?.onsenArea ?? candidate.region;

  return (
    <article className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(onsenStructuredData) }} />
      <OnsenDetailAnalytics
        entryIntent={entryIntent}
        entityType={candidateType}
        targetSlug={candidate.slug}
        onsenArea={onsenArea}
        sourceComponent="onsen_detail"
        decisionFactCoverage={decisionProfile.coverage}
      />
      <header className={styles.hero} aria-labelledby="onsen-detail-title">
        <div className={styles.heroIntro}>
          <div className={styles.heroTopline}>
            <p className={styles.locationLine}>
              <span>{candidateType === 'facility' ? '온천시설' : '온천 숙소'}</span>
              <span className={styles.locationPlace}><MapPin size={14} weight="bold" aria-hidden="true" />{candidate.location?.display ?? candidate.area}</span>
              <OnsenTrackedExternalLink
                href={mapSearchUrl}
                target="_blank"
                rel="noreferrer"
                actionType="map"
                entryIntent={entryIntent}
                entityType={candidateType}
                targetSlug={candidate.slug}
                onsenArea={onsenArea}
                sourceComponent="onsen_detail_topline"
              >
                <MapTrifold size={14} weight="bold" aria-hidden="true" />
                지도에서 보기
              </OnsenTrackedExternalLink>
            </p>
            <div className={styles.actions} aria-label="온천 액션">
              <OnsenSaveButton slug={candidate.slug} />
              <OnsenShareButton slug={candidate.slug} title={candidate.name} summary={normalizeOnsenPublicCopy(candidate.summary)} />
            </div>
          </div>

          <div className={styles.titleBlock}>
            <h1 id="onsen-detail-title">{candidate.name}</h1>
            {candidate.jaName ? <p>{candidate.jaName}</p> : null}
          </div>
        </div>

        <OnsenDetailGallery name={candidate.name} items={galleryItems} />

        <div className={styles.heroSummary}>
          <div className={styles.heroDecision}>
            <dl className={styles.heroFacts} aria-label="대표 온천 정보">
              {(heroDecisionFacts.length > 0 ? heroDecisionFacts : [{
                code: 'bath_composition',
                label: '이용 구성',
                value: normalizeOnsenPublicCopy(candidate.primaryBath),
              }]).map((fact) => (
                <div key={fact.code}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
            <div className={styles.heroFit}>
              <span>이런 여행에 맞아요</span>
              <p>{candidate.fit.slice(0, 2).map(normalizeOnsenFitCopy).join(' · ')}</p>
            </div>
            {decisionProfile.primaryAction.href ? (
              <OnsenTrackedExternalLink
                className={styles.primaryAction}
                href={decisionProfile.primaryAction.href}
                target="_blank"
                rel="noreferrer"
                actionType={candidateType === 'facility' ? 'official' : 'price_check'}
                entryIntent={entryIntent}
                entityType={candidateType}
                targetSlug={candidate.slug}
                onsenArea={onsenArea}
                sourceComponent="onsen_detail_hero"
              >
                {decisionProfile.primaryAction.label}
                <ArrowSquareOut size={17} weight="bold" aria-hidden="true" />
              </OnsenTrackedExternalLink>
            ) : (
              <span className={styles.primaryActionUnavailable}>
                {candidateType === 'facility' ? '공식 이용 안내 확인 중' : '가격·예약은 OTA에서 확인'}
              </span>
            )}
          </div>

          <section className={styles.verdictLead} data-published={candidate.verdict ? 'true' : undefined} aria-labelledby="onsen-verdict-lead-title">
            <div className={styles.verdictStatusLine}>
              <svg className={styles.verdictGradientDefs} width="0" height="0" aria-hidden="true" focusable="false">
                <defs>
                  <linearGradient id="onsen-verdict-sparkle-gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0f514c" />
                    <stop offset="58%" stopColor="#4f9d94" />
                    <stop offset="100%" stopColor="#c49a3a" />
                  </linearGradient>
                </defs>
              </svg>
              <span className={styles.verdictGlyph}><Sparkle className={styles.verdictGradientIcon} size={22} weight="fill" aria-hidden="true" /></span>
              <span className={styles.verdictState}>{candidate.verdict ? '분석 완료' : '정보 요약'}</span>
            </div>
            <h2 id="onsen-verdict-lead-title">{verdictHeadline}</h2>
          </section>
        </div>
      </header>

      <div className={styles.contentGrid}>
        <main className={styles.mainColumn}>
          <section className={`${styles.section} ${styles.decisionSection}`} aria-labelledby="onsen-decision-title">
            <header className={styles.sectionHead}>
              <span>여행에 필요한 정보부터</span>
              <h2 id="onsen-decision-title">이 온천을 고르기 전에</h2>
            </header>

            <div className={styles.decisionBands}>
              <section className={styles.decisionBand} aria-labelledby="onsen-experience-title">
                <header>
                  <span>01</span>
                  <h3 id="onsen-experience-title">여기서 할 수 있는 목욕</h3>
                  <p>이름보다 실제로 이용할 수 있는 탕 구성을 먼저 봅니다.</p>
                </header>
                <dl className={styles.decisionFactList}>
                  {decisionProfile.experience.slice(0, 6).map((fact) => (
                    <div key={`${fact.code}-${fact.scope ?? ''}`} data-status={fact.status}>
                      <dt>{fact.label}</dt>
                      <dd>{fact.value}</dd>
                      <dd>{decisionFactStatusLabel(fact.status)}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section className={styles.decisionBand} aria-labelledby="onsen-usage-title">
                <header>
                  <span>02</span>
                  <h3 id="onsen-usage-title">실제 이용 방법</h3>
                  <p>예약, 현장 확인, 이용 시간처럼 도착한 뒤 필요한 행동을 순서대로 확인합니다.</p>
                </header>
                <div className={styles.usageFactList}>
                  {decisionProfile.usage.slice(0, 5).map((fact, index) => (
                    <OnsenDecisionFactDetails
                      key={`${fact.code}-${fact.scope ?? ''}`}
                      className={styles.usageFact}
                      entryIntent={entryIntent}
                      entityType={candidateType}
                      targetSlug={candidate.slug}
                      onsenArea={onsenArea}
                      sourceComponent="onsen_detail_usage"
                      factCode={fact.code}
                    >
                      <summary>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <strong>{fact.label}</strong>
                        <b>{fact.value}</b>
                        <small>{decisionFactStatusLabel(fact.status)}</small>
                      </summary>
                      <div>
                        <p>{fact.detail ?? '현재 확인된 범위만 표시합니다. 이용 조건은 예약 또는 방문 전에 다시 확인하세요.'}</p>
                        {fact.checkedAt ? <span>{formatVerificationDate(fact.checkedAt)} 확인</span> : null}
                        {fact.sourceUrl ? <a href={fact.sourceUrl} target="_blank" rel="noreferrer"><LinkSimple size={14} weight="bold" aria-hidden="true" />공식 안내</a> : null}
                      </div>
                    </OnsenDecisionFactDetails>
                  ))}
                </div>
              </section>

              <section className={styles.decisionBand} aria-labelledby="onsen-trip-title">
                <header>
                  <span>03</span>
                  <h3 id="onsen-trip-title">여행 일정에 넣기</h3>
                  <p>요금과 시간, 접근, 숙박 가능 여부를 한곳에서 봅니다.</p>
                </header>
                {decisionProfile.trip.length > 0 ? (
                  <dl className={styles.decisionFactList}>
                    {decisionProfile.trip.slice(0, 6).map((fact) => (
                      <div key={`${fact.code}-${fact.scope ?? ''}`} data-status={fact.status}>
                        <dt>{fact.label}</dt>
                        <dd>{fact.value}</dd>
                        <dd>{decisionFactStatusLabel(fact.status)}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className={styles.decisionEmpty}>
                    {candidateType === 'facility'
                      ? '요금과 운영 시간의 공식 확인을 진행하고 있습니다.'
                      : '현재는 목욕 구성과 후기만 제공합니다. 가격과 예약 가능 여부는 OTA에서 확인해 주세요.'}
                  </p>
                )}
              </section>
            </div>
          </section>

          {candidate.verdict?.items.length ? (
            <section className={styles.section} aria-labelledby="onsen-verdict-title">
              <header className={styles.sectionHead}>
                <span>후기에서 반복된 신호</span>
                <h2 id="onsen-verdict-title">판정 근거</h2>
              </header>
              <div className={styles.evidenceList}>
                {candidate.verdict.items.map((item) => {
                  const secondaryCount = (item.counts.directionCounts?.mixed ?? 0) > 0
                    ? item.counts.directionCounts?.mixed ?? 0
                    : item.counts.negative;
                  const secondaryLabel = (item.counts.directionCounts?.mixed ?? 0) > 0 ? '다른 평가' : '부정 언급';

                  return (
                    <article key={`${candidate.slug}-verdict-${item.order}`} className={styles.evidenceItem} data-type={item.type}>
                      <div className={styles.evidenceNumber}>
                        <span>근거</span>
                        <strong>{String(item.order).padStart(2, '0')}</strong>
                      </div>
                      <div className={styles.evidenceCopy}>
                        <h3>{normalizeOnsenPublicCopy(item.headline)}</h3>
                        <p>{normalizeOnsenPublicCopy(item.body)}</p>
                        <p className={styles.evidenceConclusion}>
                          <SealCheck size={17} weight="fill" aria-hidden="true" />
                          {normalizeOnsenPublicCopy(item.verdict)}
                        </p>
                      </div>
                      <dl className={styles.evidenceStats}>
                        <div>
                          <dt>관련 언급</dt>
                          <dd>{formatVerdictMentionCount(candidate, item)}</dd>
                        </div>
                        <div>
                          <dt>{secondaryLabel}</dt>
                          <dd>{secondaryCount}건</dd>
                        </div>
                      </dl>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}

          <section className={`${styles.fitCaution} ${styles.cautionOnly}`} aria-label="예약과 방문 전 확인사항">
            <div className={styles.cautionBlock}>
              <header>
                <WarningCircle size={20} weight="bold" aria-hidden="true" />
                <h2>예약·방문 전에 볼 점</h2>
              </header>
              <div>
                {candidate.cautions.map((caution) => (
                  <article key={caution.issue}>
                    <strong>{caution.issue}</strong>
                    <p>{normalizeOnsenPublicCopy(caution.summary)}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="onsen-facts-title">
            <header className={styles.sectionHead}>
              <span>공식 정보와 확인 상태</span>
              <h2 id="onsen-facts-title">온천 정보</h2>
            </header>

            <div className={styles.waterVerification} data-status={waterVerification.status}>
              <div className={styles.waterVerificationHead}>
                <div>
                  <span>
                    온천수 방식
                    <TermInfo termKey="waterCriteria" />
                  </span>
                  <strong>{normalizeOnsenPublicCopy(candidate.waterDecision.operation)}</strong>
                </div>
                <span className={styles.statusBadge} data-status={waterVerification.status}>
                  {waterVerification.status === 'confirmed' ? '공식 확인' : '방식 확인 중'}
                </span>
              </div>

              <dl className={styles.waterVerificationRows}>
                <div>
                  <dt>공식 안내</dt>
                  <dd>{waterVerification.basis}</dd>
                </div>
                {waterVerification.scope ? (
                  <div>
                    <dt>적용 범위</dt>
                    <dd>{waterVerification.scope}</dd>
                  </div>
                ) : null}
                {waterVerification.conditions.length > 0 ? (
                  <div>
                    <dt>운용 조건</dt>
                    <dd>{waterVerification.conditions.join(' · ')}</dd>
                  </div>
                ) : null}
                {waterVerification.unresolved.length > 0 ? (
                  <div data-kind="unresolved">
                    <dt>확인 중</dt>
                    <dd>{waterVerification.unresolved.join(' · ')}</dd>
                  </div>
                ) : null}
                {waterVerification.exceptions.length > 0 ? (
                  <div data-kind="exception">
                    <dt>조건·예외</dt>
                    <dd>
                      <ul>
                        {waterVerification.exceptions.map((exception) => <li key={exception}>{exception}</li>)}
                      </ul>
                    </dd>
                  </div>
                ) : null}
              </dl>

              {waterVerification.guidance ? (
                <div className={styles.waterGuidance}>
                  <strong>선택 도움</strong>
                  <p>{waterVerification.guidance}</p>
                </div>
              ) : null}

              {waterVerification.verifiedAt || waterVerification.sources.length > 0 ? (
                <footer className={styles.waterVerificationFoot}>
                  {waterVerification.verifiedAt ? <span>{formatVerificationDate(waterVerification.verifiedAt)} 정보 갱신</span> : null}
                  <div>
                    {waterVerification.sources.map((source) => (
                      <OnsenTrackedExternalLink
                        key={source.href}
                        href={source.href}
                        target="_blank"
                        rel="noreferrer"
                        actionType="official"
                        entryIntent={entryIntent}
                        entityType={candidateType}
                        targetSlug={candidate.slug}
                        onsenArea={onsenArea}
                        sourceComponent="onsen_detail_water_source"
                      >
                        <LinkSimple size={14} weight="bold" aria-hidden="true" />
                        {source.label}
                      </OnsenTrackedExternalLink>
                    ))}
                  </div>
                </footer>
              ) : null}
            </div>

            {facilityFacts.length > 0 ? (
              <dl className={styles.factTable} aria-label="탕 구성과 확인 상태">
                {facilityFacts.map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{normalizeOnsenPublicCopy(fact.value)}</dd>
                    <dd className={styles.factStatus} data-status={fact.status} aria-label={`${fact.label} 상태: ${statusLabels[fact.status]}`}>
                      {statusLabels[fact.status]}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </section>

          <OnsenReviewSection
            targetType={candidateType}
            reviewCount={siteReviewCount}
            reviews={siteReviews.slice(0, 2)}
            aggregate={siteReviewAggregate}
          />

          <section className={styles.section} aria-labelledby="onsen-sources-title">
            <header className={styles.sectionHead}>
              <span>판정에 사용한 범위</span>
              <h2 id="onsen-sources-title">확인한 정보</h2>
            </header>
            <div className={styles.sourceList}>
              {candidate.sources.map((source) => (
                <div key={source.label}>
                  <strong>{normalizeOnsenSourceLabel(source.label)}</strong>
                  <p>{normalizeOnsenPublicCopy(source.note)}</p>
                </div>
              ))}
            </div>
            {candidate.officialLinks.length > 0 ? (
              <div className={styles.officialLinks}>
                {candidate.officialLinks.map((link) => (
                  <OnsenTrackedExternalLink
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    actionType="official"
                    entryIntent={entryIntent}
                    entityType={candidateType}
                    targetSlug={candidate.slug}
                    onsenArea={onsenArea}
                    sourceComponent="onsen_detail_sources"
                  >
                    <LinkSimple size={16} weight="bold" aria-hidden="true" />
                    {link.label}
                  </OnsenTrackedExternalLink>
                ))}
              </div>
            ) : null}
          </section>
        </main>

        <aside className={styles.reviewRail} aria-label="회원 후기">
          <OnsenReviewForm
            targetType={candidateType}
            targetSlug={candidate.slug}
            targetName={candidate.name}
            reviewCount={siteReviewCount}
            reviews={siteReviews.slice(0, 1)}
          />
        </aside>
      </div>

      <OnsenReviewDrawer
        targetType={candidateType}
        targetSlug={candidate.slug}
        targetName={candidate.name}
        reviewCount={siteReviewCount}
        initialReviews={siteReviews.slice(0, 10)}
      />
    </article>
  );
}
