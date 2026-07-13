import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowSquareOut, CheckCircle, LinkSimple, MapPin, MapTrifold, Sparkle } from '@phosphor-icons/react/ssr';
import { getOnsenEntityType, type OnsenCandidate } from '@web/lib/onsenCatalog';
import { readOnsenCandidate } from '@web/lib/onsenData';
import { getOnsenDecisionProfile } from '@web/lib/onsenDecision';
import {
  getEnglishBathSummary,
  getEnglishAreaLabel,
  getEnglishCandidateSummary,
  getEnglishEntityLabel,
  getEnglishWaterMethod,
  getLocalizedCandidateLocation,
  getLocalizedCandidateName,
} from '@web/lib/i18n';
import { OnsenDetailGallery, type OnsenDetailGalleryItem } from '@web/app/onsen/[slug]/OnsenDetailGallery';
import styles from '@web/app/onsen/[slug]/page.module.css';
import englishStyles from './page.module.css';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const candidate = await readOnsenCandidate(slug);
  if (!candidate) return { title: 'Onsen not found' };
  const name = getLocalizedCandidateName(candidate, 'en');
  return {
    title: `${name} onsen guide`,
    description: `${getEnglishCandidateSummary(candidate)} Bath setup, water system, review coverage, and official sources for ${name}.`,
    alternates: {
      canonical: `/en/onsen/${slug}`,
      languages: { 'ko-KR': `/onsen/${slug}`, en: `/en/onsen/${slug}`, 'x-default': `/onsen/${slug}` },
    },
  };
}

function getGalleryItems(candidate: OnsenCandidate, name: string): OnsenDetailGalleryItem[] {
  const images = [
    ...(candidate.galleryImages ?? []).map((image) => ({ src: image.url, alt: image.alt })),
    ...(candidate.imageUrl ? [{ src: candidate.imageUrl, alt: candidate.imageAlt }] : []),
  ].filter((image, index, items) => image.src && items.findIndex((item) => item.src === image.src) === index);
  if (images.length > 0) return images.map((image, index) => ({
    ...image,
    alt: image.alt && !/[가-힣]/.test(image.alt) ? image.alt : `${name} photo ${index + 1}`,
    label: `Photo ${index + 1}`,
  }));
  return Array.from({ length: 4 }, (_, index) => ({ label: `Photo ${index + 1}` }));
}

function getMapSearchUrl(candidate: OnsenCandidate) {
  if (candidate.facilityDetails?.mapUrl) return candidate.facilityDetails.mapUrl;
  const query = [candidate.jaName || getLocalizedCandidateName(candidate, 'en'), candidate.location?.prefecture]
    .filter(Boolean).join(' ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function getExperienceFacts(candidate: OnsenCandidate) {
  const contexts = candidate.contexts?.bath ?? [];
  return [
    contexts.includes('room_bath') ? { code: 'room_bath', label: 'In-room private onsen', value: 'Listed for this stay' } : null,
    contexts.includes('private_bath') ? { code: 'private_bath', label: 'Reservable private bath', value: 'Listed in the current bath setup' } : null,
    contexts.includes('public_bath') ? { code: 'public_bath', label: 'Public bath', value: 'Part of the bathing experience' } : null,
  ].filter((fact): fact is NonNullable<typeof fact> => Boolean(fact));
}

function getTripFacts(candidate: OnsenCandidate) {
  const profile = getOnsenDecisionProfile(candidate);
  const labels: Record<string, string> = {
    adult_price_yen: 'Adult admission', opening_hours: 'Opening hours', last_entry: 'Last admission',
    lodging: 'Overnight stay', access: 'Access', reservation: 'Reservation',
  };
  return [profile.price, ...profile.trip, ...profile.usage]
    .filter((fact): fact is NonNullable<typeof fact> => Boolean(fact))
    .filter((fact, index, facts) => facts.findIndex((item) => item.code === fact.code) === index)
    .filter((fact) => labels[fact.code] && !/[가-힣]/.test(fact.value))
    .slice(0, 6)
    .map((fact) => ({ code: fact.code, label: labels[fact.code], value: fact.value, status: fact.status === 'confirmed' ? 'Verified' : 'Check before visiting' }));
}

function buildStructuredData(candidate: OnsenCandidate, name: string) {
  const siteUrl = (process.env.NEXT_PUBLIC_WEB_URL?.trim() || 'https://www.getbathtime.com').replace(/\/+$/, '');
  const url = `${siteUrl}/en/onsen/${candidate.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': getOnsenEntityType(candidate) === 'facility' ? 'LocalBusiness' : 'LodgingBusiness',
    '@id': `${url}#onsen`,
    name,
    alternateName: candidate.jaName || undefined,
    description: getEnglishCandidateSummary(candidate),
    url,
    image: candidate.imageUrl ? new URL(candidate.imageUrl, siteUrl).toString() : undefined,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'JP',
      addressRegion: candidate.location?.prefecture ? getEnglishAreaLabel(candidate.location.prefecture) : undefined,
      addressLocality: candidate.location?.city ? getEnglishAreaLabel(candidate.location.city) : undefined,
    },
    inLanguage: 'en',
  };
}

export default async function EnglishOnsenDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const candidate = await readOnsenCandidate(slug);
  if (!candidate) notFound();

  const name = getLocalizedCandidateName(candidate, 'en');
  const candidateType = getOnsenEntityType(candidate);
  const reviewsRead = candidate.verdict?.briefing.experiencesRead ?? candidate.directReviews;
  const onsenRelated = candidate.verdict?.briefing.onsenRelated ?? candidate.onsenReviews;
  const platformCount = candidate.verdict?.briefing.platformCount ?? candidate.verdict?.briefing.platforms.length ?? 0;
  const experienceFacts = getExperienceFacts(candidate);
  const tripFacts = getTripFacts(candidate);
  const officialHref = candidate.officialLinks[0]?.href;
  const structuredData = buildStructuredData(candidate, name);

  return (
    <article className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
      <header className={styles.hero} aria-labelledby="english-onsen-detail-title">
        <div className={styles.heroIntro}>
          <div className={styles.heroTopline}>
            <p className={styles.locationLine}>
              <span>{getEnglishEntityLabel(candidate)}</span>
              <span className={styles.locationPlace}><MapPin size={14} weight="bold" aria-hidden />{getLocalizedCandidateLocation(candidate, 'en')}</span>
              <a href={getMapSearchUrl(candidate)} target="_blank" rel="noreferrer"><MapTrifold size={14} weight="bold" aria-hidden />View on map</a>
            </p>
          </div>
          <div className={styles.titleBlock}>
            <h1 id="english-onsen-detail-title">{name}</h1>
            {candidate.jaName && candidate.jaName !== name ? <p>{candidate.jaName}</p> : null}
          </div>
        </div>

        <OnsenDetailGallery name={name} items={getGalleryItems(candidate, name)} locale="en" />

        <div className={styles.heroSummary}>
          <div className={styles.heroDecision}>
            <dl className={styles.heroFacts} aria-label="Key onsen facts">
              <div><dt>Bath setup</dt><dd>{getEnglishBathSummary(candidate)}</dd></div>
              <div><dt>Water system</dt><dd>{getEnglishWaterMethod(candidate)}</dd></div>
            </dl>
            <div className={styles.heroFit}><span>Review coverage</span><p>{reviewsRead.toLocaleString('en-US')} reviews read{platformCount > 0 ? ` across ${platformCount} sources` : ''}</p></div>
            {officialHref ? <a className={styles.primaryAction} href={officialHref} target="_blank" rel="noreferrer">Official information<ArrowSquareOut size={17} weight="bold" aria-hidden /></a> : <span className={styles.primaryActionUnavailable}>Official link being verified</span>}
          </div>

          <section className={styles.verdictLead} data-published={candidate.verdict ? 'true' : undefined} aria-labelledby="english-onsen-summary-title">
            <div className={styles.verdictStatusLine}>
              <svg className={styles.verdictGradientDefs} width="0" height="0" aria-hidden focusable="false"><defs><linearGradient id="onsen-verdict-sparkle-gradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#0f514c" /><stop offset="58%" stopColor="#4f9d94" /><stop offset="100%" stopColor="#c49a3a" /></linearGradient></defs></svg>
              <span className={styles.verdictGlyph}><Sparkle className={styles.verdictGradientIcon} size={22} weight="fill" aria-hidden /></span>
              <span className={styles.verdictState}>{candidate.verdict ? 'Analysis complete' : 'Verified fact summary'}</span>
            </div>
            <h2 id="english-onsen-summary-title">{getEnglishCandidateSummary(candidate)}</h2>
          </section>
        </div>
      </header>

      <div className={`${styles.contentGrid} ${englishStyles.contentGrid}`}>
        <main className={styles.mainColumn}>
          <section className={`${styles.section} ${styles.decisionSection}`} aria-labelledby="english-decision-title">
            <header className={styles.sectionHead}><span>What matters before you choose</span><h2 id="english-decision-title">Plan the bathing experience</h2></header>
            <div className={styles.decisionBands}>
              <section className={styles.decisionBand}>
                <header><span>01</span><h3>What you can bathe in</h3><p>The available bath setup, separated from room or hotel marketing.</p></header>
                {experienceFacts.length > 0 ? <dl className={styles.decisionFactList}>{experienceFacts.map((fact) => <div key={fact.code} data-status="confirmed"><dt>{fact.label}</dt><dd>{fact.value}</dd><dd>Listed</dd></div>)}</dl> : <p className={styles.decisionEmpty}>The bath setup is still being verified.</p>}
              </section>
              <section className={styles.decisionBand}>
                <header><span>02</span><h3>How the water is handled</h3><p>Kakenagashi, heating, dilution, and recirculation are kept as separate conditions.</p></header>
                <dl className={styles.decisionFactList}>
                  <div data-status={candidate.waterProfile?.canonicalMethod ? 'confirmed' : 'needs_check'}><dt>System</dt><dd>{getEnglishWaterMethod(candidate)}</dd><dd>{candidate.waterProfile?.canonicalMethod ? 'Verified' : 'Checking'}</dd></div>
                  {(candidate.waterProfile?.conditionCodes ?? []).map((code) => <div key={code} data-status="conditional"><dt>Condition</dt><dd>{code === 'kasui' ? 'Water may be added' : code === 'kaon' ? 'Heating may be used' : code === 'disinfection' ? 'Disinfection is used' : code.replaceAll('_', ' ')}</dd><dd>Condition</dd></div>)}
                </dl>
              </section>
              <section className={styles.decisionBand}>
                <header><span>03</span><h3>Fit it into the trip</h3><p>Admission, hours, access, and reservation details from structured official facts.</p></header>
                {tripFacts.length > 0 ? <dl className={styles.decisionFactList}>{tripFacts.map((fact) => <div key={fact.code} data-status={fact.status === 'Verified' ? 'confirmed' : 'needs_check'}><dt>{fact.label}</dt><dd>{fact.value}</dd><dd>{fact.status}</dd></div>)}</dl> : <p className={styles.decisionEmpty}>Visit details are still being verified.</p>}
              </section>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="english-evidence-title">
            <header className={styles.sectionHead}><span>Evidence coverage</span><h2 id="english-evidence-title">What the analysis is based on</h2></header>
            <dl className={englishStyles.metrics}>
              <div><dt>Reviews read</dt><dd>{reviewsRead.toLocaleString('en-US')}</dd></div>
              <div><dt>Onsen-related</dt><dd>{onsenRelated.toLocaleString('en-US')}</dd></div>
              <div><dt>Sources</dt><dd>{platformCount.toLocaleString('en-US')}</dd></div>
            </dl>
          </section>

          <section className={styles.section} aria-labelledby="english-sources-title">
            <header className={styles.sectionHead}><span>Official references</span><h2 id="english-sources-title">Check the latest conditions</h2></header>
            {candidate.officialLinks.length > 0 ? <div className={styles.officialLinks}>{candidate.officialLinks.map((link, index) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer"><LinkSimple size={16} weight="bold" aria-hidden />{index === 0 ? 'Official website' : `Official information ${index + 1}`}</a>)}</div> : <p className={styles.decisionEmpty}>The official link is still being verified.</p>}
          </section>

          <Link className={englishStyles.backLink} href="/en/onsen/results"><ArrowLeft size={16} weight="bold" aria-hidden />Back to all onsen</Link>
        </main>
      </div>
    </article>
  );
}
