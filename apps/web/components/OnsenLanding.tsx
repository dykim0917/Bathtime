import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react/ssr';
import { OnsenEntryImpression, OnsenIntentLink } from './OnsenAnalytics';
import { getOnsenEntityType, type OnsenCandidate } from '@web/lib/onsenCatalog';
import { readOnsenCandidates } from '@web/lib/onsenData';
import { getOnsenDecisionProfile } from '@web/lib/onsenDecision';
import {
  getEnglishAreaLabel,
  getLocalizedCandidateName,
  getLocalizedCandidateLocation,
  localizeHref,
  type BathtimeLocale,
} from '@web/lib/i18n';
import { addOnsenEntryIntent, type OnsenEntryIntent } from '@web/lib/onsenIntent';
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

type MomentKind = 'private' | 'bath_depth' | 'facility';

function formatNumber(value: number, locale: BathtimeLocale = 'ko') {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'ko-KR').format(value);
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

function getRegionInventory(candidates: OnsenCandidate[], locale: BathtimeLocale): RegionInventory[] {
  const byArea = new Map<string, RegionInventory>();

  for (const candidate of candidates) {
    if (!candidate.verdict) continue;
    const area = candidate.location?.onsenArea ?? candidate.region;
    const label = locale === 'en' ? getEnglishAreaLabel(area) : candidate.location?.onsenAreaLabel ?? candidate.area;
    const existing =
      byArea.get(area) ??
      ({
        area,
        label,
        href: localizeHref(`/onsen/results?area=${encodeURIComponent(area)}`, locale),
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
    .sort((a, b) => b.publishedCount - a.publishedCount || a.label.localeCompare(b.label, locale === 'en' ? 'en-US' : 'ko-KR'));
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
      if (kind === 'private') return getOnsenEntityType(candidate) === 'accommodation' && (hasBathContext(candidate, 'private_bath') || hasBathContext(candidate, 'room_bath'));
      if (kind === 'bath_depth') return getOnsenEntityType(candidate) === 'accommodation' && (candidate.contexts?.bath.includes('public_bath') || hasConfirmedOpenAirBath(candidate));
      return getOnsenEntityType(candidate) === 'facility';
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

function getCandidateLocation(candidate: OnsenCandidate, locale: BathtimeLocale) {
  if (locale === 'en') return `${getLocalizedCandidateLocation(candidate, locale)} · ${getOnsenEntityType(candidate) === 'facility' ? 'Day-use' : 'Stay'}`;
  const region = candidate.location?.regionGroupLabel;
  const area = candidate.location?.onsenAreaLabel ?? candidate.area;
  const type = getOnsenEntityType(candidate) === 'facility' ? '당일온천' : '숙소';
  return [region, area, type].filter(Boolean).join(' · ');
}

function getMomentCondition(candidate: OnsenCandidate, kind: MomentKind, locale: BathtimeLocale) {
  const text = getCandidateSearchText(candidate);
  if (kind === 'private') {
    if (hasBathContext(candidate, 'private_bath')) return locale === 'en' ? 'Reservable private bath' : '대절탕';
    return locale === 'en' ? 'In-room private onsen' : '객실 내 프라이빗탕';
  }
  if (kind === 'bath_depth') {
    if (/설경|눈/.test(text)) return locale === 'en' ? 'Public bath · Snow-view rotenburo' : '대욕장 · 설경 노천탕';
    if (/바다|ocean_view/.test(text)) return locale === 'en' ? 'Public bath · Ocean view' : '대욕장 · 바다 전망';
    if (locale === 'en') return /노천/.test(text) ? 'Public bath · Rotenburo' : 'Public bath focus';
    return /노천/.test(text) ? '대욕장 · 노천탕' : '대욕장 중심';
  }
  const facilityBathLabels: Record<string, [string, string]> = {
    public_bath: ['공용탕', 'Public bath'],
    open_air_public_bath: ['노천탕', 'Rotenburo'],
    family_bath: ['가족탕', 'Family bath'],
    private_bath: ['대절탕', 'Private bath'],
    sauna: ['사우나', 'Sauna'],
    stone_sauna: ['암반욕', 'Hot-stone room'],
  };
  const decisionProfile = getOnsenDecisionProfile(candidate);
  const openingHours = decisionProfile.trip.find((fact) => fact.code === 'opening_hours');
  const tripValues = [decisionProfile.price?.value, openingHours?.value]
    .filter((value): value is string => Boolean(value))
    .filter((value) => locale === 'ko' || !/[가-힣]/.test(value));
  if (tripValues.length > 0) return tripValues.join(' · ');
  return candidate.facilityDetails?.bathAreas
    .slice(0, 3)
    .map((area) => facilityBathLabels[area]?.[locale === 'en' ? 1 : 0])
    .filter(Boolean)
    .join(' · ') || (locale === 'en' ? 'Day-use bathing' : '숙박 없이 이용');
}

function MomentCard({ candidate, kind, intent, locale }: { candidate: OnsenCandidate; kind: MomentKind; intent: OnsenEntryIntent; locale: BathtimeLocale }) {
  const name = getLocalizedCandidateName(candidate, locale);
  return (
    <OnsenIntentLink
      className={styles.momentCard}
      href={addOnsenEntryIntent(localizeHref(`/onsen/${candidate.slug}`, locale), intent)}
      entryIntent={intent}
      sourceComponent={`home_${intent}_card`}
    >
      <span className={styles.momentCardMedia}>
        <img src={getCandidateImage(candidate)} alt={candidate.imageAlt ?? (locale === 'en' ? `${name} onsen` : `${candidate.name} 온천 풍경`)} loading="lazy" />
      </span>
      <span className={styles.momentCardCopy}>
        <span className={styles.locationLine}>{getCandidateLocation(candidate, locale)}</span>
        <strong>{name}</strong>
        <small>{getMomentCondition(candidate, kind, locale)}</small>
      </span>
    </OnsenIntentLink>
  );
}

function formatRegionInventory(item: RegionInventory, locale: BathtimeLocale) {
  const parts: string[] = [];
  if (item.accommodationCount > 0) parts.push(locale === 'en' ? `${formatNumber(item.accommodationCount, locale)} stays` : `숙소 ${formatNumber(item.accommodationCount)}`);
  if (item.facilityCount > 0) parts.push(locale === 'en' ? `${formatNumber(item.facilityCount, locale)} day-use` : `당일온천 ${formatNumber(item.facilityCount)}`);
  if (item.directSourceCount > 0) parts.push(locale === 'en' ? `${formatNumber(item.directSourceCount, locale)} kakenagashi` : `직수 ${formatNumber(item.directSourceCount)}`);
  return parts.join(' · ');
}

export async function OnsenLanding({ locale = 'ko' }: { locale?: BathtimeLocale } = {}) {
  const candidates = await readOnsenCandidates();
  const totals = getCatalogTotal(candidates);
  const regions = getRegionInventory(candidates, locale).slice(0, 5);
  const usedSlugs = new Set<string>();
  const privateCandidates = selectMomentCandidates(candidates, 'private', usedSlugs);
  privateCandidates.forEach((candidate) => usedSlugs.add(candidate.slug));
  const bathDepthCandidates = selectMomentCandidates(candidates, 'bath_depth', usedSlugs);
  bathDepthCandidates.forEach((candidate) => usedSlugs.add(candidate.slug));
  const facilityCandidates = selectMomentCandidates(candidates, 'facility', usedSlugs);

  return (
    <div className={styles.home}>
      <OnsenDiscoveryHero locale={locale} />

      {locale === 'ko' ? <OnsenPassportHomeBand /> : null}

      {privateCandidates.length > 0 ? (
        <section className={styles.desireStory} id="moments" aria-labelledby="quiet-desire-title">
          <OnsenEntryImpression entryIntent="stay_private" sourceComponent="home_stay_private_section" />
          <div className={styles.storyInner}>
            <header className={styles.storyHeading}>
              <div>
                <h2 id="quiet-desire-title">{locale === 'en' ? 'When you want to bathe together, in private.' : '둘이 같은 탕에 들어가고 싶을 때.'}</h2>
                <strong>{locale === 'en' ? 'In-room and reservable private baths' : '객실탕과 대절탕'}</strong>
              </div>
              <OnsenIntentLink href={localizeHref('/onsen/results?intent=stay_private', locale)} entryIntent="stay_private" sourceComponent="home_stay_private_section">
                {locale === 'en' ? 'See every match' : '이 조건 전체 보기'} <ArrowRight size={16} aria-hidden="true" />
              </OnsenIntentLink>
            </header>
            <div className={styles.cardGrid}>
              {privateCandidates.map((candidate) => <MomentCard key={candidate.slug} candidate={candidate} kind="private" intent="stay_private" locale={locale} />)}
            </div>
          </div>
        </section>
      ) : null}

      {bathDepthCandidates.length > 0 ? (
        <section className={`${styles.desireStory} ${styles.desireStorySoft}`} aria-labelledby="couple-desire-title">
          <OnsenEntryImpression entryIntent="stay_bath_depth" sourceComponent="home_stay_bath_depth_section" />
          <div className={styles.storyInner}>
            <header className={styles.storyHeading}>
              <div>
                <h2 id="couple-desire-title">{locale === 'en' ? 'When the bath is the reason to stay.' : '숙소의 대욕장 때문에 머물고 싶을 때.'}</h2>
                <strong>{locale === 'en' ? 'Public baths and rotenburo' : '대욕장과 노천탕'}</strong>
              </div>
              <OnsenIntentLink href={localizeHref('/onsen/results?intent=stay_bath_depth', locale)} entryIntent="stay_bath_depth" sourceComponent="home_stay_bath_depth_section">
                {locale === 'en' ? 'See every match' : '이 조건 전체 보기'} <ArrowRight size={16} aria-hidden="true" />
              </OnsenIntentLink>
            </header>
            <div className={styles.coupleGallery}>
              <OnsenIntentLink className={styles.coupleFeature} href={addOnsenEntryIntent(localizeHref(`/onsen/${bathDepthCandidates[0].slug}`, locale), 'stay_bath_depth')} entryIntent="stay_bath_depth" sourceComponent="home_stay_bath_depth_feature">
                <img src={getCandidateImage(bathDepthCandidates[0])} alt={bathDepthCandidates[0].imageAlt ?? (locale === 'en' ? `${getLocalizedCandidateName(bathDepthCandidates[0], locale)} onsen` : `${bathDepthCandidates[0].name} 온천 풍경`)} loading="lazy" />
                <span className={styles.coupleFeatureShade} aria-hidden="true" />
                <span className={styles.coupleFeatureCopy}>
                  <span className={styles.locationLine}>{getCandidateLocation(bathDepthCandidates[0], locale)}</span>
                  <strong>{getLocalizedCandidateName(bathDepthCandidates[0], locale)}</strong>
                  <small>{getMomentCondition(bathDepthCandidates[0], 'bath_depth', locale)}</small>
                </span>
              </OnsenIntentLink>
              <div className={styles.coupleShortlist}>
                {bathDepthCandidates.slice(1).map((candidate) => (
                  <OnsenIntentLink key={candidate.slug} className={styles.coupleOption} href={addOnsenEntryIntent(localizeHref(`/onsen/${candidate.slug}`, locale), 'stay_bath_depth')} entryIntent="stay_bath_depth" sourceComponent="home_stay_bath_depth_card">
                    <span className={styles.coupleOptionMedia}>
                      <img src={getCandidateImage(candidate)} alt={candidate.imageAlt ?? (locale === 'en' ? `${getLocalizedCandidateName(candidate, locale)} onsen` : `${candidate.name} 온천 풍경`)} loading="lazy" />
                    </span>
                    <span className={styles.coupleOptionCopy}>
                      <span className={styles.locationLine}>{getCandidateLocation(candidate, locale)}</span>
                      <strong>{getLocalizedCandidateName(candidate, locale)}</strong>
                      <small>{getMomentCondition(candidate, 'bath_depth', locale)}</small>
                    </span>
                  </OnsenIntentLink>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {facilityCandidates.length > 0 ? (
        <section className={styles.desireStory} id="scenic-moment" aria-labelledby="scenic-desire-title">
          <OnsenEntryImpression entryIntent="city_facility" sourceComponent="home_city_facility_section" />
          <div className={styles.storyInner}>
            <header className={styles.storyHeading}>
              <div>
                <h2 id="scenic-desire-title">{locale === 'en' ? 'When you want a few hours of onsen between plans.' : '여행 중 두세 시간을 온천에서 보내고 싶을 때.'}</h2>
                <strong>{locale === 'en' ? 'Day-use onsen with prices and hours' : '요금과 시간까지 확인된 시설'}</strong>
              </div>
              <OnsenIntentLink href={localizeHref('/onsen/results?intent=city_facility', locale)} entryIntent="city_facility" sourceComponent="home_city_facility_section">
                {locale === 'en' ? 'See every match' : '이 조건 전체 보기'} <ArrowRight size={16} aria-hidden="true" />
              </OnsenIntentLink>
            </header>
            <div className={`${styles.cardGrid} ${styles.scenicCardGrid}`}>
              {facilityCandidates.map((candidate) => <MomentCard key={candidate.slug} candidate={candidate} kind="facility" intent="city_facility" locale={locale} />)}
            </div>
          </div>
        </section>
      ) : null}

      {regions.length > 0 ? (
        <section className={styles.regionSection} id="regions" aria-labelledby="regions-title">
          <header className={styles.sectionHeading}>
            <span>{locale === 'en' ? 'Browse by area' : '지역별 온천'}</span>
            <h2 id="regions-title">{locale === 'en' ? 'Choose a town for the onsen alone.' : '온천 하나를 위해, 마을을 고르는 여행.'}</h2>
          </header>
          <div className={styles.regionGrid}>
            {regions.map((item) => (
              <Link key={item.area} className={styles.regionTile} href={item.href}>
                <img src={item.imageUrl} alt={locale === 'en' ? `${item.label} onsen area` : `${item.label} 온천 마을`} loading="lazy" />
                <span className={styles.regionTileCopy}>
                  <strong>{item.label}</strong>
                  <span>{formatRegionInventory(item, locale)}</span>
                </span>
              </Link>
            ))}
          </div>
          <Link className={styles.allRegionsLink} href={localizeHref('/onsen/results', locale)}>
            {locale === 'en' ? 'Browse all areas and onsen' : '전체 지역과 온천 보기'} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
      ) : null}

      <section className={styles.waterBand} id="water" aria-labelledby="water-title">
        <div className={styles.waterBandInner}>
          <div className={styles.waterBandCopy}>
            <span>{locale === 'en' ? 'Browse by water system' : '온천수로 찾기'}</span>
            <h2 id="water-title">{locale === 'en' ? <>Is it free-flowing?<br />What was added?</> : <>직수인가,<br />무엇을 더했는가.</>}</h2>
          </div>
          <nav className={styles.waterList} aria-label={locale === 'en' ? 'Onsen water systems' : '온천수 방식'}>
            <Link href={localizeHref('/onsen/results?water=kakenagashi_pure', locale)}><strong>{locale === 'en' ? 'Pure kakenagashi' : '순수직수'}</strong><span>{locale === 'en' ? 'Undiluted, unheated source water flowing continuously' : '물을 더하지 않고 데우지 않은 원천 그대로'}</span><ArrowRight size={18} aria-hidden="true" /></Link>
            <Link href={localizeHref('/onsen/results?water=kakenagashi', locale)}><strong>{locale === 'en' ? 'Kakenagashi' : '직수'}</strong><span>{locale === 'en' ? 'Free-flowing, with any dilution or heating shown separately' : '흘려보내는 방식, 가수·가온 조건은 함께 표시'}</span><ArrowRight size={18} aria-hidden="true" /></Link>
            <Link href={localizeHref('/onsen/results?water=junkan', locale)}><strong>{locale === 'en' ? 'Recirculated' : '순환식 온천'}</strong><span>{locale === 'en' ? 'Recirculation and filtration confirmed by an official source' : '순환 여과 방식이 공식 확인된 온천'}</span><ArrowRight size={18} aria-hidden="true" /></Link>
            <Link href={localizeHref('/onsen/results?water=slippery', locale)}><strong>{locale === 'en' ? 'Water feel' : '물의 감촉'}</strong><span>{locale === 'en' ? 'Repeated review signals such as silky, soft, or distinctly mineral' : '후기에서 반복된 매끈함, 부드러움, 온천감'}</span><ArrowRight size={18} aria-hidden="true" /></Link>
          </nav>
        </div>
      </section>

      <section className={styles.evidenceStrip} aria-label={locale === 'en' ? 'Bathtime onsen data' : '바스타임 온천 데이터 현황'}>
        <div className={styles.evidenceInner}>
          <div><strong>{formatNumber(totals.reviewsRead, locale)}</strong><span>{locale === 'en' ? 'reviews read directly' : '직접 읽은 후기'}</span></div>
          <div><strong>{formatNumber(totals.accommodationCount, locale)}</strong><span>{locale === 'en' ? 'onsen stays' : '온천 숙소'}</span></div>
          <div><strong>{formatNumber(totals.facilityCount, locale)}</strong><span>{locale === 'en' ? 'day-use onsen' : '당일온천'}</span></div>
          <Link href={localizeHref('/onsen/methodology', locale)}>{locale === 'en' ? 'How we check' : '어떻게 확인했나요?'} <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </section>

      <section className={styles.methodBand} aria-labelledby="method-title">
        <img src="/images/onsen/regions/kurokawa.jpg" alt={locale === 'en' ? 'Kurokawa onsen town along a forest stream' : '숲과 수로가 이어지는 구로카와 온천 마을'} loading="lazy" />
        <span className={styles.methodShade} aria-hidden="true" />
        <div className={styles.methodCopy}>
          <span>{locale === 'en' ? 'How Bathtime verifies onsen' : '바스타임의 확인 기준'}</span>
          <h2 id="method-title">{locale === 'en' ? <>We do not quote reviews.<br />We read and classify them.</> : <>인용하지 않고,<br />직접 읽고 판정합니다.</>}</h2>
          <p>{locale === 'en' ? 'We keep official facts separate from public reviews, then distinguish what is verified from what still needs checking before a visit.' : '공식 정보와 공개 후기를 분리해 읽고, 근거가 확인된 사실과 방문 전에 다시 볼 조건을 나눠 표시합니다.'}</p>
          <Link href={localizeHref('/onsen/methodology', locale)}>{locale === 'en' ? 'Read the methodology' : '판정 방법 읽기'} <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </section>
    </div>
  );
}
