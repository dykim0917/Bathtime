import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react/ssr';
import { getOnsenEntityType, type OnsenCandidate } from '@web/lib/onsenCatalog';
import { getOnsenCardSummary } from '@web/lib/onsenCopy';
import { readOnsenCandidates } from '@web/lib/onsenData';
import { getOnsenRegionImage } from '@web/lib/onsenRegionImages';
import { hasConfirmedWaterKakenagashi } from '@web/lib/onsenWaterSignal';
import { OnsenDiscoveryHero } from './OnsenDiscoveryHero';
import { OnsenPassportHomeBand } from './OnsenPassportHomeBand';
import styles from './OnsenLanding.module.css';

type RegionInventory = {
  area: string;
  label: string;
  href: string;
  publishedCount: number;
  accommodationCount: number;
  facilityCount: number;
  directSourceCount: number;
  imageUrl: string;
};

type MomentKind = 'quiet' | 'couple' | 'scenic';

function formatNumber(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value);
}

function getCatalogTotal(candidates: OnsenCandidate[]) {
  return candidates.reduce(
    (acc, candidate) => ({
      reviewsRead: acc.reviewsRead + (candidate.verdict?.briefing.experiencesRead ?? candidate.directReviews ?? 0),
      accommodationCount: acc.accommodationCount + (getOnsenEntityType(candidate) === 'accommodation' ? 1 : 0),
      facilityCount: acc.facilityCount + (getOnsenEntityType(candidate) === 'facility' ? 1 : 0),
    }),
    { reviewsRead: 0, accommodationCount: 0, facilityCount: 0 }
  );
}

function getRegionInventory(candidates: OnsenCandidate[]): RegionInventory[] {
  const byArea = new Map<string, RegionInventory>();

  for (const candidate of candidates) {
    if (!candidate.verdict) continue;
    const area = candidate.location?.onsenArea ?? candidate.region;
    const label = candidate.location?.onsenAreaLabel ?? candidate.area;
    const existing =
      byArea.get(area) ??
      ({
        area,
        label,
        href: `/onsen/results?area=${encodeURIComponent(area)}`,
        publishedCount: 0,
        accommodationCount: 0,
        facilityCount: 0,
        directSourceCount: 0,
        imageUrl: getOnsenRegionImage(area),
      } satisfies RegionInventory);

    existing.publishedCount += 1;
    if (getOnsenEntityType(candidate) === 'facility') existing.facilityCount += 1;
    else existing.accommodationCount += 1;
    if (hasConfirmedWaterKakenagashi(candidate)) existing.directSourceCount += 1;
    byArea.set(area, existing);
  }

  return [...byArea.values()]
    .filter((item) => item.publishedCount > 0)
    .sort((a, b) => b.publishedCount - a.publishedCount || a.label.localeCompare(b.label, 'ko-KR'));
}

function getCandidateSearchText(candidate: OnsenCandidate) {
  return [
    candidate.primaryBath,
    candidate.summary,
    candidate.verdict?.headline,
    ...candidate.tags,
    ...(candidate.contexts?.bath ?? []),
    ...(candidate.officialFilterCodes ?? []),
    ...candidate.facts.flatMap((fact) => [fact.label, fact.value, fact.detail]),
  ]
    .filter(Boolean)
    .join(' ');
}

function hasBathContext(candidate: OnsenCandidate, value: 'room_bath' | 'private_bath') {
  if (candidate.contexts?.bath.includes(value)) return true;
  if (value === 'room_bath' && candidate.tags.includes('room-bath')) return true;
  if (value === 'private_bath' && candidate.tags.includes('private-bath')) return true;
  return value === 'private_bath' && candidate.officialFilterCodes?.includes('private_bath');
}

function hasConfirmedOpenAirBath(candidate: OnsenCandidate) {
  if (candidate.officialFilterCodes?.includes('open_air_bath')) return true;
  return candidate.facts.some(
    (fact) => fact.status !== 'needs_check' && /노천탕|노천 온천|노천욕/.test(`${fact.label} ${fact.value}`)
  );
}

function getCandidateScore(candidate: OnsenCandidate) {
  const imageScore = candidate.imageUrl ? 1_000_000 : 0;
  const verdictScore = candidate.verdict?.level === 'full' ? 100_000 : 0;
  const reviewScore = candidate.verdict?.briefing.experiencesRead ?? candidate.directReviews ?? 0;
  return imageScore + verdictScore + reviewScore;
}

function selectMomentCandidates(
  candidates: OnsenCandidate[],
  kind: MomentKind,
  excludedSlugs: Set<string>,
  limit = 3
) {
  const matches = candidates
    .filter((candidate) => candidate.verdict && !excludedSlugs.has(candidate.slug))
    .filter((candidate) => {
      if (kind === 'quiet') return hasBathContext(candidate, 'private_bath') || hasBathContext(candidate, 'room_bath');
      if (kind === 'couple') return getOnsenEntityType(candidate) === 'accommodation' && hasBathContext(candidate, 'room_bath');
      return hasConfirmedOpenAirBath(candidate);
    })
    .sort((a, b) => getCandidateScore(b) - getCandidateScore(a));

  const selected: OnsenCandidate[] = [];
  const selectedAreas = new Set<string>();

  for (const candidate of matches) {
    const area = candidate.location?.onsenArea ?? candidate.region;
    if (selectedAreas.has(area)) continue;
    selected.push(candidate);
    selectedAreas.add(area);
    if (selected.length === limit) return selected;
  }

  for (const candidate of matches) {
    if (selected.some((item) => item.slug === candidate.slug)) continue;
    selected.push(candidate);
    if (selected.length === limit) break;
  }

  return selected;
}

function getCandidateImage(candidate: OnsenCandidate) {
  const area = candidate.location?.onsenArea ?? candidate.region;
  return candidate.imageUrl ?? getOnsenRegionImage(area);
}

function getCandidateLocation(candidate: OnsenCandidate) {
  const region = candidate.location?.regionGroupLabel;
  const area = candidate.location?.onsenAreaLabel ?? candidate.area;
  const type = getOnsenEntityType(candidate) === 'facility' ? '당일온천' : '숙소';
  return [region, area, type].filter(Boolean).join(' · ');
}

function getMomentCondition(candidate: OnsenCandidate, kind: MomentKind) {
  const text = getCandidateSearchText(candidate);
  if (kind === 'quiet') {
    if (hasBathContext(candidate, 'private_bath')) return '대절탕';
    return '객실 내 프라이빗탕';
  }
  if (kind === 'couple') return /노천/.test(text) ? '객실 내 프라이빗탕 · 노천탕' : '객실 내 프라이빗탕';
  if (/설경|눈/.test(text)) return '노천탕 · 설경';
  if (/바다|ocean_view/.test(text)) return '노천탕 · 바다 전망';
  return '노천탕 · 자연 전망';
}

function MomentCard({ candidate, kind }: { candidate: OnsenCandidate; kind: MomentKind }) {
  return (
    <Link className={styles.momentCard} href={`/onsen/${candidate.slug}`}>
      <span className={styles.momentCardMedia}>
        <img src={getCandidateImage(candidate)} alt={candidate.imageAlt ?? `${candidate.name} 온천 풍경`} loading="lazy" />
      </span>
      <span className={styles.momentCardCopy}>
        <span className={styles.locationLine}>{getCandidateLocation(candidate)}</span>
        <strong>{candidate.name}</strong>
        <span className={styles.momentCardSummary}>{getOnsenCardSummary(candidate)}</span>
        <small>{getMomentCondition(candidate, kind)}</small>
      </span>
    </Link>
  );
}

function formatRegionInventory(item: RegionInventory) {
  const parts: string[] = [];
  if (item.accommodationCount > 0) parts.push(`숙소 ${formatNumber(item.accommodationCount)}`);
  if (item.facilityCount > 0) parts.push(`당일온천 ${formatNumber(item.facilityCount)}`);
  if (item.directSourceCount > 0) parts.push(`직수 ${formatNumber(item.directSourceCount)}`);
  return parts.join(' · ');
}

export async function OnsenLanding() {
  const candidates = await readOnsenCandidates();
  const totals = getCatalogTotal(candidates);
  const regions = getRegionInventory(candidates).slice(0, 5);
  const usedSlugs = new Set<string>();
  const quietCandidates = selectMomentCandidates(candidates, 'quiet', usedSlugs);
  quietCandidates.forEach((candidate) => usedSlugs.add(candidate.slug));
  const coupleCandidates = selectMomentCandidates(candidates, 'couple', usedSlugs);
  coupleCandidates.forEach((candidate) => usedSlugs.add(candidate.slug));
  const scenicCandidates = selectMomentCandidates(candidates, 'scenic', usedSlugs);

  return (
    <div className={styles.home}>
      <OnsenDiscoveryHero />
      <OnsenPassportHomeBand />

      {quietCandidates.length > 0 ? (
        <section className={styles.desireStory} id="moments" aria-labelledby="quiet-desire-title">
          <div className={styles.storyInner}>
            <header className={styles.storyHeading}>
              <div>
                <h2 id="quiet-desire-title">아무도 없는 탕에서 오래 있고 싶을 때.</h2>
                <strong>대절탕 · 객실 내 프라이빗탕</strong>
              </div>
              <Link href="/onsen/results?bath=private_bath">
                이 조건 전체 보기 <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </header>
            <div className={styles.cardGrid}>
              {quietCandidates.map((candidate) => <MomentCard key={candidate.slug} candidate={candidate} kind="quiet" />)}
            </div>
          </div>
        </section>
      ) : null}

      {coupleCandidates.length > 0 ? (
        <section className={`${styles.desireStory} ${styles.desireStorySoft}`} aria-labelledby="couple-desire-title">
          <div className={styles.storyInner}>
            <header className={styles.storyHeading}>
              <div>
                <h2 id="couple-desire-title">둘만 쓰는 객실탕이 필요할 때.</h2>
                <strong>객실 내 프라이빗탕 · 노천탕</strong>
              </div>
              <Link href="/onsen/results?bath=room_bath">
                이 조건 전체 보기 <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </header>
            <div className={styles.coupleGallery}>
              <Link className={styles.coupleFeature} href={`/onsen/${coupleCandidates[0].slug}`}>
                <img src={getCandidateImage(coupleCandidates[0])} alt={coupleCandidates[0].imageAlt ?? `${coupleCandidates[0].name} 온천 풍경`} loading="lazy" />
                <span className={styles.coupleFeatureShade} aria-hidden="true" />
                <span className={styles.coupleFeatureCopy}>
                  <span className={styles.locationLine}>{getCandidateLocation(coupleCandidates[0])}</span>
                  <strong>{coupleCandidates[0].name}</strong>
                  <span className={styles.momentCardSummary}>{getOnsenCardSummary(coupleCandidates[0])}</span>
                  <small>{getMomentCondition(coupleCandidates[0], 'couple')}</small>
                </span>
              </Link>
              <div className={styles.coupleShortlist}>
                {coupleCandidates.slice(1).map((candidate) => (
                  <Link key={candidate.slug} className={styles.coupleOption} href={`/onsen/${candidate.slug}`}>
                    <span className={styles.coupleOptionMedia}>
                      <img src={getCandidateImage(candidate)} alt={candidate.imageAlt ?? `${candidate.name} 온천 풍경`} loading="lazy" />
                    </span>
                    <span className={styles.coupleOptionCopy}>
                      <span className={styles.locationLine}>{getCandidateLocation(candidate)}</span>
                      <strong>{candidate.name}</strong>
                      <span className={styles.momentCardSummary}>{getOnsenCardSummary(candidate)}</span>
                      <small>{getMomentCondition(candidate, 'couple')}</small>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {scenicCandidates.length > 0 ? (
        <section className={styles.desireStory} id="scenic-moment" aria-labelledby="scenic-desire-title">
          <div className={styles.storyInner}>
            <header className={styles.storyHeading}>
              <div>
                <h2 id="scenic-desire-title">눈이나 숲을 보며 잠기고 싶을 때.</h2>
                <strong>노천탕 · 자연 전망</strong>
              </div>
              <Link href="/onsen/results?feature=open_air_bath">
                이 조건 전체 보기 <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </header>
            <div className={`${styles.cardGrid} ${styles.scenicCardGrid}`}>
              {scenicCandidates.map((candidate) => <MomentCard key={candidate.slug} candidate={candidate} kind="scenic" />)}
            </div>
          </div>
        </section>
      ) : null}

      {regions.length > 0 ? (
        <section className={styles.regionSection} id="regions" aria-labelledby="regions-title">
          <header className={styles.sectionHeading}>
            <span>지역별 온천</span>
            <h2 id="regions-title">풍경과 재고를 함께 봅니다.</h2>
            <p>지금 판정이 준비된 온천 숙소와 당일온천이 많은 지역부터 둘러보세요.</p>
          </header>
          <div className={styles.regionGrid}>
            {regions.map((item) => (
              <Link key={item.area} className={styles.regionTile} href={item.href}>
                <img src={item.imageUrl} alt={`${item.label} 온천 마을`} loading="lazy" />
                <span className={styles.regionTileCopy}>
                  <strong>{item.label}</strong>
                  <span>{formatRegionInventory(item)}</span>
                </span>
              </Link>
            ))}
          </div>
          <Link className={styles.allRegionsLink} href="/onsen/results">
            전체 지역과 온천 보기 <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
      ) : null}

      <section className={styles.waterBand} id="water" aria-labelledby="water-title">
        <div className={styles.waterBandInner}>
          <div className={styles.waterBandCopy}>
            <span>온천수로 찾기</span>
            <h2 id="water-title">직수인가,<br />무엇을 더했는가.</h2>
            <p>복잡한 일본어 표기는 내부 데이터에 남기고, 사용자는 방식과 조건을 두 줄로 이해할 수 있게 정리합니다.</p>
          </div>
          <nav className={styles.waterList} aria-label="온천수 방식">
            <Link href="/onsen/results?water=kakenagashi_pure"><strong>순수직수</strong><span>물을 더하지 않고 데우지 않은 원천 그대로</span><ArrowRight size={18} aria-hidden="true" /></Link>
            <Link href="/onsen/results?water=kakenagashi"><strong>직수</strong><span>흘려보내는 방식, 가수·가온 조건은 함께 표시</span><ArrowRight size={18} aria-hidden="true" /></Link>
            <Link href="/onsen/results?water=junkan"><strong>순환식 온천</strong><span>순환 여과 방식이 공식 확인된 온천</span><ArrowRight size={18} aria-hidden="true" /></Link>
            <Link href="/onsen/results?water=slippery"><strong>물의 감촉</strong><span>후기에서 반복된 매끈함, 부드러움, 온천감</span><ArrowRight size={18} aria-hidden="true" /></Link>
          </nav>
        </div>
      </section>

      <section className={styles.evidenceStrip} aria-label="바스타임 온천 데이터 현황">
        <div className={styles.evidenceInner}>
          <div><strong>{formatNumber(totals.reviewsRead)}</strong><span>직접 읽은 후기</span></div>
          <div><strong>{formatNumber(totals.accommodationCount)}</strong><span>온천 숙소</span></div>
          <div><strong>{formatNumber(totals.facilityCount)}</strong><span>당일온천</span></div>
          <Link href="/onsen/methodology">어떻게 확인했나요? <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </section>

      <section className={styles.methodBand} aria-labelledby="method-title">
        <img src="/images/onsen/regions/kurokawa.jpg" alt="숲과 수로가 이어지는 구로카와 온천 마을" loading="lazy" />
        <span className={styles.methodShade} aria-hidden="true" />
        <div className={styles.methodCopy}>
          <span>바스타임의 확인 기준</span>
          <h2 id="method-title">인용하지 않고,<br />직접 읽고 판정합니다.</h2>
          <p>공식 정보와 공개 후기를 분리해 읽고, 근거가 확인된 사실과 방문 전에 다시 볼 조건을 나눠 표시합니다.</p>
          <Link href="/onsen/methodology">판정 방법 읽기 <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </section>
    </div>
  );
}
