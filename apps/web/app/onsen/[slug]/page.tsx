import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  Armchair,
  ArrowSquareOut,
  Bathtub,
  Bed,
  CalendarCheck,
  Car,
  CaretDown,
  CheckCircle,
  Clock,
  Coins,
  ForkKnife,
  Info,
  LinkSimple,
  MapPin,
  MapTrifold,
  MoonStars,
  PersonSimpleWalk,
  SealCheck,
  Shower,
  Sparkle,
  Storefront,
  SwimmingPool,
  Ticket,
  Timer,
  Towel,
  Train,
  UsersThree,
  WarningCircle,
  Waves,
} from '@phosphor-icons/react/ssr';
import { OnsenDecisionFactDetails, OnsenDetailAnalytics, OnsenTrackedExternalLink } from '@web/components/OnsenAnalytics';
import { OnsenReviewForm } from '@web/components/OnsenReviewForm';
import { OnsenReviewDrawer } from '@web/components/OnsenReviewDrawer';
import { OnsenReviewSection } from '@web/components/OnsenReviewSection';
import { OnsenSaveButton } from '@web/components/OnsenSaveButton';
import { OnsenShareButton } from '@web/components/OnsenShareButton';
import { TermInfo } from '@web/components/TermInfo';
import { getOnsenEntityType, statusLabels, type OnsenCandidate, type OnsenDecisionFact } from '@web/lib/onsenCatalog';
import { getOnsenCardSummary, normalizeOnsenFitCopy, normalizeOnsenPublicCopy, normalizeOnsenSourceLabel } from '@web/lib/onsenCopy';
import { readOnsenCandidate } from '@web/lib/onsenData';
import { getOnsenDecisionProfile } from '@web/lib/onsenDecision';
import { getOnsenDecisionAnswerGroups } from '@web/lib/onsenDecisionAnswers';
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

function decisionFactStatusLabel(
  status: 'confirmed' | 'conditional' | 'needs_check',
  applicability?: 'applicable' | 'not_applicable'
) {
  if (applicability === 'not_applicable') return '해당 없음';
  if (status === 'confirmed') return '확인됨';
  if (status === 'conditional') return '조건 확인';
  return '공식 확인 필요';
}

function decisionFactBoardStatusLabel(
  status: 'confirmed' | 'conditional' | 'needs_check',
  applicability?: 'applicable' | 'not_applicable'
) {
  if (applicability === 'not_applicable') return '해당 없음';
  if (status === 'confirmed') return '확인';
  if (status === 'conditional') return '조건부';
  return '미확인';
}

function mergeDecisionFacts(primary: OnsenDecisionFact[], fallback: OnsenDecisionFact[], limit: number) {
  const facts = [...primary, ...fallback];
  return [...new Map(facts.map((fact) => [fact.code, fact])).values()].slice(0, limit);
}

function decisionFactApplicability(fact: OnsenDecisionFact) {
  if (!('applicability' in fact)) return undefined;
  return fact.applicability === 'applicable' || fact.applicability === 'not_applicable'
    ? fact.applicability
    : undefined;
}

function selectHeroDecisionFacts(
  facts: OnsenDecisionFact[],
  entryIntent: ReturnType<typeof normalizeOnsenEntryIntent>,
  candidateType: ReturnType<typeof getOnsenEntityType>
) {
  const preferredCodes = entryIntent === 'stay_private'
    ? ['together_private_eligibility', 'room_bath', 'private_bath', 'private_bath_booking_flow']
    : entryIntent === 'stay_bath_depth'
      ? ['bath_experience_richness', 'public_bath', 'open_air_bath', 'bath_count']
      : entryIntent === 'city_facility'
        ? ['day_use_operation', 'adult_price_yen', 'opening_hours', 'towel_policy']
        : candidateType === 'facility'
          ? ['adult_price_yen', 'opening_hours', 'bath_count', 'bath_composition']
          : ['room_bath', 'private_bath', 'public_bath', 'bath_composition'];
  const selected = [
    ...preferredCodes.map((code) => facts.find((fact) => fact.code === code)),
    ...facts.filter((fact) => fact.status !== 'needs_check'),
    ...facts,
  ].filter((fact): fact is OnsenDecisionFact => Boolean(fact));
  return [...new Map(selected.map((fact) => [fact.code, fact])).values()].slice(0, 3);
}

function DecisionFactIcon({ code, size = 24 }: { code: string; size?: number }) {
  const props = { size, weight: 'regular' as const, 'aria-hidden': true as const };

  if (code === 'room_bath') return <Bathtub {...props} />;
  if (code === 'private_bath' || code === 'family_bath' || code === 'together_private_eligibility') return <UsersThree {...props} />;
  if (code === 'bath_layout_scope') return <Bathtub {...props} />;
  if (code === 'public_bath' || code === 'bath_composition' || code === 'bath_count' || code === 'signature_baths' || code === 'bath_experience_richness' || code === 'water_operation_method') return <Waves {...props} />;
  if (code === 'open_air_bath') return <SwimmingPool {...props} />;
  if (code === 'sauna' || code === 'stone_sauna') return <Shower {...props} />;
  if (code === 'rest_area') return <Armchair {...props} />;
  if (code.includes('reservation') || code.includes('booking') || code === 'vacancy_check_method') return <CalendarCheck {...props} />;
  if (code.includes('time_limit') || code === 'private_bath_terms_limits') return <Timer {...props} />;
  if (code === 'towel_policy') return <Towel {...props} />;
  if (code === 'tattoo_allowed' || code === 'reentry_policy') return <Ticket {...props} />;
  if (code === 'opening_hours' || code === 'last_entry_at' || code === 'closing_time') return <Clock {...props} />;
  if (code.includes('price') || code.includes('surcharge')) return <Coins {...props} />;
  if (code === 'station_walk_10m') return <PersonSimpleWalk {...props} />;
  if (code === 'parking') return <Car {...props} />;
  if (code === 'shuttle') return <Train {...props} />;
  if (code === 'meal_service') return <ForkKnife {...props} />;
  if (code === 'overnight_mode') return <MoonStars {...props} />;
  if (code === 'lodging') return <Bed {...props} />;
  if (code === 'day_use_operation') return <Storefront {...props} />;
  return <Info {...props} />;
}

const compactBathTerms: [RegExp, string][] = [
  [/노천/, '노천탕'],
  [/대욕장/, '대욕장'],
  [/가족탕/, '가족탕'],
  [/대절탕/, '대절탕'],
  [/객실탕|객실 내/, '객실탕'],
  [/사우나/, '사우나'],
  [/암반욕|암반탕/, '암반욕'],
  [/족탕/, '족탕'],
  [/모래찜질|모래찜/, '모래찜질'],
  [/냉탕/, '냉탕'],
  [/내탕/, '내탕'],
  [/합탕/, '합탕'],
  [/수영장|풀/, '풀'],
];

function compactBathComposition(value: string) {
  const terms = compactBathTerms
    .filter(([pattern]) => pattern.test(value))
    .map(([, label]) => label);
  return [...new Set(terms)].slice(0, 4).join(' · ');
}

function compactDecisionFactValue(fact: OnsenDecisionFact) {
  const applicability = decisionFactApplicability(fact);
  if (applicability === 'not_applicable') return '해당 없음';
  if (fact.status === 'needs_check') return '정보 확인 중';

  if (fact.code === 'together_private_eligibility') {
    return fact.status === 'conditional' ? '동반 이용 조건 확인' : '동반 이용 가능';
  }

  if (fact.code === 'bath_layout_scope' || fact.code === 'bath_experience_richness') {
    return compactBathComposition(fact.value) || (fact.status === 'conditional' ? '구성 조건 확인' : '구성 확인됨');
  }

  if (fact.code === 'water_operation_method') {
    if (fact.status === 'conditional' && /보류|완결되지|확인\s*중|알\s*수\s*없|여부/.test(fact.value)) return '방식 확인 중';
    if (fact.value.includes('순수직수') && !/순수직수.{0,12}(?:표시하지|아닙|해당하지)/.test(fact.value)) return '순수직수';
    if (fact.value.includes('순환')) return '순환식';
    if (fact.value.includes('직수')) return fact.value.includes('가수') ? '직수 · 가수 있음' : '직수';
    return fact.status === 'conditional' ? '방식 조건 확인' : '방식 확인됨';
  }

  if (fact.code === 'private_bath_booking_flow' || fact.code === 'private_bath_reservation_method') {
    if (/walk_in_when_vacant|first_come/.test(fact.value)) return '현장 이용';
    if (/advance_reservation|reservation_required/.test(fact.value)) return '사전 예약';
    if (/사전\s*예약을?\s*받지|빈\s*탕|현장|선착순/.test(fact.value)) return '현장 이용';
    if (/웹/.test(fact.value)) return '웹 예약';
    if (/객실탕/.test(fact.value) && /객실.*예약|객실 타입/.test(fact.value)) return '객실 예약 시 포함';
    if (/사전\s*예약|완전예약|예약제|예약이?\s*필요/.test(fact.value)) return '사전 예약';
    return '예약 방식 확인';
  }

  if (fact.code === 'private_bath_terms_limits') {
    const free = /무료/.test(fact.value) ? '무료' : '';
    const duration = fact.value.match(/\d+\s*(?:분|시간)/)?.[0] ?? '';
    const fee = fact.value.match(/[0-9][0-9,]*\s*엔/)?.[0] ?? '';
    const terms = [free, duration, fee].filter(Boolean);
    return terms.join(' · ') || (fact.status === 'conditional' ? '이용 조건 확인' : '조건 확인됨');
  }

  if (fact.code === 'day_use_operation') {
    if (/24시간/.test(fact.value)) return '24시간 운영';
    const hours = fact.value.match(/\d{1,2}:\d{2}\s*[~〜\-–]\s*(?:익일\s*)?\d{1,2}:\d{2}/)?.[0] ?? '';
    const price = fact.value.match(/[0-9][0-9,]*\s*엔/)?.[0] ?? '';
    const terms = [hours, price].filter(Boolean);
    return terms.join(' · ') || (fact.status === 'conditional' ? '운영 조건 확인' : '당일 이용 가능');
  }

  return fact.value.length <= 36 ? fact.value : (fact.status === 'conditional' ? '조건 확인' : '확인됨');
}

function dedupeDecisionFactsForDisplay(facts: OnsenDecisionFact[]) {
  const seen = new Set<string>();
  return facts.filter((fact) => {
    const value = compactDecisionFactValue(fact);
    const key = ['정보 확인 중', '조건 확인', '확인됨'].includes(value) ? `${fact.label}:${value}` : value;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
  const decisionAnswerGroups = getOnsenDecisionAnswerGroups(candidate.decisionAnswers);
  const experienceDecisionFacts = mergeDecisionFacts(decisionAnswerGroups.experience, decisionProfile.experience, 8);
  const usageDecisionFacts = mergeDecisionFacts(decisionAnswerGroups.usage, decisionProfile.usage, 6);
  const tripDecisionFacts = mergeDecisionFacts(decisionAnswerGroups.trip, decisionProfile.trip, 8);
  const heroDecisionFacts = selectHeroDecisionFacts(
    [...experienceDecisionFacts, ...usageDecisionFacts, ...tripDecisionFacts],
    entryIntent,
    candidateType
  );
  const decisionFactGroups = [
    { id: 'bath', label: '목욕 구성', facts: dedupeDecisionFactsForDisplay(experienceDecisionFacts) },
    { id: 'usage', label: '이용 방법', facts: dedupeDecisionFactsForDisplay(usageDecisionFacts) },
    { id: 'trip', label: '시간 · 비용 · 이동', facts: dedupeDecisionFactsForDisplay(tripDecisionFacts) },
  ].filter((group) => group.facts.length > 0);
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
                status: 'needs_check' as const,
              }]).map((fact) => (
                <div key={fact.code} data-status={fact.status}>
                  <span className={styles.heroFactIcon}><DecisionFactIcon code={fact.code} size={22} /></span>
                  <dt>{fact.label}</dt>
                  <dd>{compactDecisionFactValue(fact)}</dd>
                  <small className={styles.heroFactMeta}>
                    {decisionFactStatusLabel(fact.status)}
                    {fact.checkedAt ? ` · ${formatVerificationDate(fact.checkedAt)} 확인` : ''}
                  </small>
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
              <span>이용 정보</span>
              <h2 id="onsen-decision-title">한눈에 보기</h2>
            </header>

            <div className={styles.decisionBoard}>
              {decisionFactGroups.map((group) => (
                <section key={group.id} className={styles.decisionGroup} data-group={group.id} aria-labelledby={`onsen-${group.id}-title`}>
                  <h3 id={`onsen-${group.id}-title`}>{group.label}</h3>
                  <div className={styles.decisionFactGrid}>
                    {group.facts.map((fact) => {
                      const displayValue = compactDecisionFactValue(fact);
                      return (
                        <OnsenDecisionFactDetails
                          key={`${fact.code}-${fact.scope ?? ''}`}
                          className={styles.decisionFact}
                          entryIntent={entryIntent}
                          entityType={candidateType}
                          targetSlug={candidate.slug}
                          onsenArea={onsenArea}
                          sourceComponent={`onsen_detail_${group.id}`}
                          factCode={fact.code}
                        >
                          <summary data-status={fact.status}>
                            <span className={styles.decisionFactIcon}><DecisionFactIcon code={fact.code} /></span>
                            <span className={styles.decisionFactCopy}>
                              <small>{fact.label}</small>
                              <strong>{displayValue}</strong>
                            </span>
                            <span className={styles.decisionFactStatus}>
                              {fact.status === 'confirmed'
                                ? <CheckCircle size={14} weight="fill" aria-hidden="true" />
                                : <WarningCircle size={14} weight="fill" aria-hidden="true" />}
                              {decisionFactBoardStatusLabel(fact.status, decisionFactApplicability(fact))}
                            </span>
                            <CaretDown className={styles.decisionFactCaret} size={15} weight="bold" aria-hidden="true" />
                          </summary>
                          <div className={styles.decisionFactDetail}>
                            {displayValue !== fact.value ? <p>{fact.value}</p> : null}
                            {fact.detail ? <p>{fact.detail}</p> : null}
                            <div>
                              {fact.scope ? <span>적용: {fact.scope}</span> : null}
                              {fact.checkedAt ? <span>{formatVerificationDate(fact.checkedAt)} 확인</span> : null}
                              {fact.sourceUrl ? <a href={fact.sourceUrl} target="_blank" rel="noreferrer"><LinkSimple size={14} weight="bold" aria-hidden="true" />공식 안내</a> : null}
                            </div>
                          </div>
                        </OnsenDecisionFactDetails>
                      );
                    })}
                  </div>
                </section>
              ))}
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
