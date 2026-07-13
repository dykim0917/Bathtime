import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CaretDown, ChatCircleText, Check, CheckCircle, MagnifyingGlass, MapPin, Waves, X } from '@phosphor-icons/react/ssr';
import { OnsenResultImpression, OnsenResultsAnalytics } from '@web/components/OnsenAnalytics';
import { getOnsenEntityType, type OnsenCandidate, type OnsenEntityType } from '@web/lib/onsenCatalog';
import { readOnsenCandidates } from '@web/lib/onsenData';
import { getOnsenDecisionProfile } from '@web/lib/onsenDecision';
import {
  getEnglishAreaLabel,
  getEnglishBathSummary,
  getEnglishCandidateSummary,
  getEnglishEntityLabel,
  getEnglishWaterMethod,
  getLocalizedCandidateLocation,
  getLocalizedCandidateName,
} from '@web/lib/i18n';
import { addOnsenEntryIntent, normalizeOnsenEntryIntent, type OnsenEntryIntentValue } from '@web/lib/onsenIntent';
import { buildOnsenMapPoints } from '@web/lib/onsenMap';
import { readOnsenReviewCounts } from '@web/lib/onsenReviews';
import {
  bathContextFilters,
  officialFacilityFeatureFilters,
  onsenAreaFilters,
  travelContextFilters,
  waterCriterionFilters,
} from '@web/lib/onsenTaxonomy';
import { hasOnsenWaterCriterion, getOnsenWaterSortRank } from '@web/lib/onsenWaterSignal';
import {
  OnsenResultsFilterAction,
  OnsenResultsSort,
  OnsenResultsWorkspace,
  type OnsenResultsSortValue,
} from '@web/app/onsen/results/OnsenResultsWorkspace';
import styles from '@web/app/onsen/results/results.module.css';

type SearchParams = { [key: string]: string | string[] | undefined };

const PAGE_SIZE = 24;
const entityLabels: Record<OnsenEntityType, string> = {
  accommodation: 'Onsen stays',
  facility: 'Day-use onsen',
};
const travelLabels: Record<string, string> = {
  ryokan_stay: 'Ryokan stay',
  day_trip: 'Day trip',
  city_bath: 'City bath',
  hotel_public_bath: 'Hotel public bath',
};
const bathLabels: Record<string, string> = {
  room_bath: 'In-room private onsen',
  private_bath: 'Reservable private bath',
  public_bath: 'Public bath',
};
const waterLabels: Record<string, string> = {
  kakenagashi_pure: 'Pure kakenagashi',
  kakenagashi: 'Kakenagashi',
  junkan: 'Recirculated',
  slippery: 'Silky water feel',
  salt_warmth: 'Salt-rich warmth',
  sulfur: 'Sulfur spring',
  carbonated: 'Carbonated spring',
  hakutaku: 'Milky white water',
  brown: 'Brown mineral water',
  temperature_adjustment: 'Heating or dilution',
  winter_caution: 'Seasonal conditions',
};
const intentTitles: Partial<Record<OnsenEntryIntentValue, string>> = {
  stay_private: 'Private onsen stays',
  stay_bath_depth: 'Stays worth choosing for the bath',
  city_facility: 'Day-use onsen for your itinerary',
};
const featureLabels: Record<string, string> = {
  open_air_bath: 'Open-air bath',
  private_bath: 'Private bath',
  family_bath: 'Family bath',
  mixed_bathing: 'Mixed-gender bathing',
  stone_sauna: 'Stone sauna',
  loyly: 'Loyly sauna',
  steam_bath: 'Steam bath',
  late_night: 'Late-night access',
  tattoo_allowed: 'Tattoo friendly',
  parking: 'Parking',
  shuttle: 'Shuttle',
  meal_service: 'Meals available',
  adult_day_use_price: 'Admission price verified',
  ocean_view: 'Ocean view',
  spring_acidic: 'Acidic spring',
  spring_sulfur: 'Sulfur spring',
  spring_chloride: 'Chloride spring',
};

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const params = await searchParams;
  const hasQuery = Object.values(params).some((value) => Array.isArray(value) ? value.some(Boolean) : Boolean(value));
  return {
    title: 'Japanese onsen results',
    description: 'Compare onsen stays and day-use baths by bathing setup, water system, and verified travel details.',
    alternates: {
      canonical: '/en/onsen/results',
      languages: { 'ko-KR': '/onsen/results', en: '/en/onsen/results', 'x-default': '/onsen/results' },
    },
    robots: hasQuery ? { index: false, follow: false } : undefined,
  };
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function normalizePage(value: string | string[] | undefined) {
  const parsed = Number.parseInt(first(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function normalizeFilter(value: string | string[] | undefined, allowedValues: string[]) {
  const normalized = first(value);
  return allowedValues.includes(normalized) ? normalized : '';
}

function buildHref(values: {
  query?: string; type?: string; area?: string; travel?: string; bath?: string; water?: string;
  feature?: string; sort?: OnsenResultsSortValue; page?: number; intent?: string;
}) {
  const params = new URLSearchParams();
  for (const key of ['query', 'type', 'area', 'travel', 'bath', 'water', 'feature', 'intent'] as const) {
    if (values[key]) params.set(key, values[key]);
  }
  if (values.sort && values.sort !== 'recommended') params.set('sort', values.sort);
  if (values.page && values.page > 1) params.set('page', String(values.page));
  const query = params.toString();
  return query ? `/en/onsen/results?${query}` : '/en/onsen/results';
}

function FilterOption({ label, href, active, count }: { label: string; href: string; active: boolean; count: number }) {
  return (
    <span className={styles.filterOption} data-active={active ? 'true' : undefined}>
      <span className={styles.filterOptionChoice}>
        <OnsenResultsFilterAction className={styles.filterOptionLink} href={href} active={active}>
          <span className={styles.checkBox}><Check size={14} weight="bold" aria-hidden /></span>
          <span className={styles.filterOptionLabel}>{label}</span>
        </OnsenResultsFilterAction>
      </span>
      <small className={styles.filterOptionCount}>{count.toLocaleString('en-US')}</small>
    </span>
  );
}

function getEnglishCardFacts(candidate: OnsenCandidate) {
  const profile = getOnsenDecisionProfile(candidate);
  const safeTripFacts = [profile.price, ...profile.trip]
    .filter((fact): fact is NonNullable<typeof fact> => Boolean(fact))
    .filter((fact, index, facts) => facts.findIndex((item) => item.code === fact.code) === index)
    .filter((fact) => !/[가-힣]/.test(fact.value));
  const labels: Record<string, string> = {
    adult_price_yen: 'Admission', opening_hours: 'Hours', lodging: 'Overnight stay', access: 'Access',
  };
  const facts = safeTripFacts
    .filter((fact) => labels[fact.code])
    .slice(0, 2)
    .map((fact) => ({ code: fact.code, label: labels[fact.code], value: fact.value }));
  if (facts.length >= 2) return facts;
  return [
    { code: 'bath', label: 'Bath setup', value: getEnglishBathSummary(candidate) },
    { code: 'water', label: 'Water system', value: getEnglishWaterMethod(candidate) },
  ];
}

function getPaginationItems(currentPage: number, pageCount: number) {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);
  return [...new Set([1, currentPage - 1, currentPage, currentPage + 1, pageCount])]
    .filter((page) => page > 0 && page <= pageCount)
    .sort((a, b) => a - b);
}

export default async function EnglishOnsenResultsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const rawQuery = first(params.query).trim();
  const query = rawQuery.toLowerCase();
  const type = first(params.type) === 'facility' ? 'facility' : first(params.type) === 'accommodation' ? 'accommodation' : '';
  const area = normalizeFilter(params.area, onsenAreaFilters.filter((item) => !item.disabled).map((item) => item.value));
  const travel = normalizeFilter(params.travel, travelContextFilters.filter((item) => !item.disabled).map((item) => item.value));
  const bath = normalizeFilter(params.bath, bathContextFilters.filter((item) => !item.disabled).map((item) => item.value));
  const water = normalizeFilter(params.water, waterCriterionFilters.filter((item) => !item.disabled).map((item) => item.value));
  const feature = normalizeFilter(params.feature, officialFacilityFeatureFilters.map((item) => item.value));
  const intent = normalizeOnsenEntryIntent(first(params.intent));
  const sort = (['reviews', 'water', 'name'].includes(first(params.sort)) ? first(params.sort) : 'recommended') as OnsenResultsSortValue;
  const requestedPage = normalizePage(params.page);
  const candidates = await readOnsenCandidates();
  const decisionProfiles = new Map(candidates.map((candidate) => [candidate.slug, getOnsenDecisionProfile(candidate)]));

  const filtered = candidates.filter((candidate) => {
    const location = candidate.location;
    const queryText = [candidate.name, candidate.enName, candidate.jaName, candidate.slug, candidate.area, location?.onsenArea, location?.city, location?.prefecture]
      .filter(Boolean).join(' ').toLowerCase();
    return (!query || queryText.includes(query))
      && (!type || getOnsenEntityType(candidate) === type)
      && (!area || location?.onsenArea === area || candidate.region === area)
      && (!travel || candidate.contexts?.travel.includes(travel as never))
      && (!bath || candidate.contexts?.bath.includes(bath as never))
      && (!water || hasOnsenWaterCriterion(candidate, water as never))
      && (!feature || candidate.officialFilterCodes?.includes(feature))
      && (intent === 'unknown' || decisionProfiles.get(candidate.slug)?.intents.includes(intent));
  });

  filtered.sort((a, b) => {
    if (sort === 'reviews') return (b.verdict?.briefing.experiencesRead ?? b.directReviews) - (a.verdict?.briefing.experiencesRead ?? a.directReviews);
    if (sort === 'water') return getOnsenWaterSortRank(a) - getOnsenWaterSortRank(b);
    if (sort === 'name') return getLocalizedCandidateName(a, 'en').localeCompare(getLocalizedCandidateName(b, 'en'), 'en');
    const aProfile = decisionProfiles.get(a.slug);
    const bProfile = decisionProfiles.get(b.slug);
    return (bProfile?.coverage ?? 0) - (aProfile?.coverage ?? 0)
      || (b.verdict?.briefing.experiencesRead ?? b.directReviews) - (a.verdict?.briefing.experiencesRead ?? a.directReviews);
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, pageCount);
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filtered.length);
  const pageCandidates = filtered.slice(rangeStart === 0 ? 0 : rangeStart - 1, rangeEnd);
  const current = { query: rawQuery, type, area, travel, bath, water, feature, sort, page: currentPage, intent: intent === 'unknown' ? '' : intent };
  const hrefFor = (overrides: Partial<typeof current>) => buildHref({ ...current, ...overrides });
  const currentResultsHref = hrefFor({ page: currentPage });

  const activeFilters = [
    intent !== 'unknown' ? { key: 'intent', label: intentTitles[intent] ?? 'Selected journey', href: hrefFor({ intent: '', page: 1 }) } : null,
    rawQuery ? { key: 'query', label: `“${rawQuery}”`, href: hrefFor({ query: '', page: 1 }) } : null,
    type ? { key: 'type', label: entityLabels[type], href: hrefFor({ type: '', page: 1 }) } : null,
    area ? { key: 'area', label: getEnglishAreaLabel(area), href: hrefFor({ area: '', page: 1 }) } : null,
    travel ? { key: 'travel', label: travelLabels[travel] ?? travel, href: hrefFor({ travel: '', page: 1 }) } : null,
    bath ? { key: 'bath', label: bathLabels[bath] ?? bath, href: hrefFor({ bath: '', page: 1 }) } : null,
    water ? { key: 'water', label: waterLabels[water] ?? water, href: hrefFor({ water: '', page: 1 }) } : null,
    feature ? { key: 'feature', label: featureLabels[feature] ?? feature.replaceAll('_', ' '), href: hrefFor({ feature: '', page: 1 }) } : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  const countBy = (predicate: (candidate: OnsenCandidate) => boolean) => candidates.reduce((count, candidate) => count + Number(predicate(candidate)), 0);
  const filterBody = (
    <>
      <details className={styles.filterGroup} open>
        <summary><span>Visit type</span><CaretDown size={16} weight="bold" aria-hidden /></summary>
        <div className={styles.filterGroupBody}>
          {(['accommodation', 'facility'] as OnsenEntityType[]).map((value) => <FilterOption key={value} label={entityLabels[value]} active={type === value} count={countBy((candidate) => getOnsenEntityType(candidate) === value)} href={hrefFor({ type: type === value ? '' : value, intent: '', page: 1 })} />)}
        </div>
      </details>
      <details className={styles.filterGroup} open>
        <summary><span>Bath setup</span><CaretDown size={16} weight="bold" aria-hidden /></summary>
        <div className={styles.filterGroupBody}>
          {Object.entries(bathLabels).map(([value, label]) => <FilterOption key={value} label={label} active={bath === value} count={countBy((candidate) => candidate.contexts?.bath.includes(value as never) ?? false)} href={hrefFor({ bath: bath === value ? '' : value, page: 1 })} />)}
        </div>
      </details>
      <details className={styles.filterGroup} open>
        <summary><span>Water system</span><CaretDown size={16} weight="bold" aria-hidden /></summary>
        <div className={styles.filterGroupBody}>
          {['kakenagashi_pure', 'kakenagashi', 'junkan'].map((value) => <FilterOption key={value} label={waterLabels[value]} active={water === value} count={countBy((candidate) => hasOnsenWaterCriterion(candidate, value as never))} href={hrefFor({ water: water === value ? '' : value, page: 1 })} />)}
        </div>
      </details>
    </>
  );

  const accommodationReviewCounts = await readOnsenReviewCounts(pageCandidates.filter((candidate) => getOnsenEntityType(candidate) === 'accommodation').map((candidate) => candidate.slug), 'accommodation');
  const facilityReviewCounts = await readOnsenReviewCounts(pageCandidates.filter((candidate) => getOnsenEntityType(candidate) === 'facility').map((candidate) => candidate.slug), 'facility');
  const mapCandidates = pageCandidates.map((candidate) => ({
    ...candidate,
    name: getLocalizedCandidateName(candidate, 'en'),
    area: getLocalizedCandidateLocation(candidate, 'en'),
    location: candidate.location ? { ...candidate.location, onsenAreaLabel: getEnglishAreaLabel(candidate.location.onsenArea), display: getLocalizedCandidateLocation(candidate, 'en') } : candidate.location,
  }));

  return (
    <div className={styles.page}>
      <OnsenResultsAnalytics entryIntent={intent} activeFilters={activeFilters.map((item) => item.key)} queryType={rawQuery ? 'text' : 'empty'} />
      <section className={styles.overview} aria-labelledby="english-onsen-results-title">
        <div className={styles.overviewMain}>
          <div className={styles.overviewCopy}>
            <span className={styles.scopeLabel}><MapPin size={14} weight="bold" aria-hidden />{area ? `${getEnglishAreaLabel(area)}, Japan` : 'Across Japan'}</span>
            <h1 id="english-onsen-results-title">{intentTitles[intent] ?? (area ? `${getEnglishAreaLabel(area)} onsen` : 'Japanese onsen')} <strong>{filtered.length.toLocaleString('en-US')}</strong></h1>
          </div>
          <OnsenResultsSort value={sort} locale="en" />
        </div>
        {activeFilters.length > 0 ? (
          <div className={styles.selectedRow}>
            <span className={styles.selectedLabel}>Selected</span>
            <div className={styles.selectedList}>{activeFilters.map((item) => <Link key={item.key} href={item.href} prefetch={false} rel="nofollow">{item.label}<X size={14} weight="bold" aria-hidden /></Link>)}</div>
            <Link className={styles.clearAll} href="/en/onsen/results" prefetch={false}>Clear all</Link>
          </div>
        ) : null}
      </section>

      <OnsenResultsWorkspace filterBody={filterBody} resetHref="/en/onsen/results" hasFilters={activeFilters.length > 0} resultCount={filtered.length} rangeStart={rangeStart} rangeEnd={rangeEnd} sort={sort} mapPoints={buildOnsenMapPoints(mapCandidates)} visibleResultCount={pageCandidates.length} locale="en">
        <div className={styles.resultList}>
          {filtered.length === 0 ? <div className={styles.emptyState}><MagnifyingGlass size={28} weight="bold" aria-hidden /><strong>No onsen match these filters.</strong><p>Remove one bath or water condition and try again.</p><Link href="/en/onsen/results">Browse all onsen</Link></div> : null}
          {pageCandidates.map((candidate, pageIndex) => {
            const name = getLocalizedCandidateName(candidate, 'en');
            const entityType = getOnsenEntityType(candidate);
            const reviewCount = entityType === 'facility' ? facilityReviewCounts[candidate.slug] ?? 0 : accommodationReviewCounts[candidate.slug] ?? 0;
            const reviewsRead = candidate.verdict?.briefing.experiencesRead ?? candidate.directReviews;
            const facts = getEnglishCardFacts(candidate);
            const profile = decisionProfiles.get(candidate.slug) ?? getOnsenDecisionProfile(candidate);
            return (
              <Link id={`onsen-result-${candidate.slug}`} key={candidate.slug} className={styles.resultCardLink} href={addOnsenEntryIntent(`/en/onsen/${candidate.slug}`, intent)} prefetch={false} data-return-href={currentResultsHref} data-onsen-result-link="true" data-entry-intent={intent} data-entity-type={entityType} data-target-slug={candidate.slug} data-onsen-area={candidate.location?.onsenArea ?? candidate.region} data-result-position={rangeStart + pageIndex} data-decision-fact-coverage={profile.coverage} data-has-price={profile.price ? 'true' : 'false'}>
                <article className={styles.resultCard} data-onsen-result-card="true">
                  <OnsenResultImpression entryIntent={intent} entityType={entityType} targetSlug={candidate.slug} onsenArea={candidate.location?.onsenArea ?? candidate.region} sourceComponent="onsen_results_card_en" resultPosition={rangeStart + pageIndex} decisionFactCoverage={profile.coverage} />
                  <div className={styles.resultMedia} aria-label={`${name} image`}>
                    {candidate.imageUrl ? <img src={candidate.imageUrl} alt={candidate.imageAlt && !/[가-힣]/.test(candidate.imageAlt) ? candidate.imageAlt : `${name} onsen`} loading="lazy" /> : <div className={styles.resultPlaceholder}><Waves size={26} weight="bold" aria-hidden /><span>Photo coming soon</span></div>}
                  </div>
                  <div className={styles.resultMain}>
                    <div className={styles.resultMeta}><span>{getLocalizedCandidateLocation(candidate, 'en')}</span><span className={styles.entityType} data-type={entityType}>{getEnglishEntityLabel(candidate)}</span></div>
                    <div className={styles.resultTitleRow}><h2>{name}</h2>{candidate.waterProfile?.canonicalMethod ? <span className={styles.waterAward} data-tone={candidate.waterProfile.canonicalMethod === 'kakenagashi_pure' ? 'gold' : candidate.waterProfile.canonicalMethod === 'kakenagashi' ? 'silver' : 'bronze'}>{getEnglishWaterMethod(candidate)}</span> : null}</div>
                    {candidate.jaName && candidate.jaName !== name ? <span className={styles.originalName}>{candidate.jaName}</span> : null}
                    <p className={styles.resultVerdict}>{getEnglishCandidateSummary(candidate)}</p>
                    <div className={styles.resultEvidence}>{reviewsRead > 0 ? <span><CheckCircle size={14} weight="bold" aria-hidden />{reviewsRead.toLocaleString('en-US')} reviews read</span> : null}<span className={styles.reviewCount} aria-label={`${reviewCount} Bathtime reviews`}><ChatCircleText size={14} weight="bold" aria-hidden />{reviewCount.toLocaleString('en-US')}</span></div>
                  </div>
                  <dl className={styles.resultFacts} aria-label={`${name} decision facts`}>{facts.map((fact) => <div key={fact.code}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}<ArrowRight size={18} weight="bold" aria-hidden /></dl>
                </article>
              </Link>
            );
          })}
        </div>
        {filtered.length > PAGE_SIZE ? <nav className={styles.pagination} aria-label="Result pages">{currentPage > 1 ? <Link href={hrefFor({ page: currentPage - 1 })} aria-label="Previous page"><ArrowLeft size={17} weight="bold" aria-hidden /></Link> : <span aria-disabled="true"><ArrowLeft size={17} aria-hidden /></span>}{getPaginationItems(currentPage, pageCount).map((page) => <Link key={page} href={hrefFor({ page })} aria-current={page === currentPage ? 'page' : undefined}>{page}</Link>)}{currentPage < pageCount ? <Link href={hrefFor({ page: currentPage + 1 })} aria-label="Next page"><ArrowRight size={17} weight="bold" aria-hidden /></Link> : <span aria-disabled="true"><ArrowRight size={17} aria-hidden /></span>}</nav> : null}
      </OnsenResultsWorkspace>
    </div>
  );
}
