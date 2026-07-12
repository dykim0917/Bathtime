import Link from 'next/link';
import {
  bathAreaLabels,
  crowdingLabels,
  formatPublicVisitMonth,
  getVisibleRevisitLabel,
  temperatureLabels,
  waterTextureLabels,
} from '@web/lib/onsenPassport';
import type { OnsenReview } from '@web/lib/onsenReviews';
import styles from './OnsenReviewCard.module.css';

function getKeyFacts(review: OnsenReview) {
  const facts: string[] = [];
  const texture = review.waterTexture.find((value) => value !== 'unclear');

  if (texture) facts.push(waterTextureLabels[texture]);
  if (review.temperatureExperience !== 'unclear') facts.push(temperatureLabels[review.temperatureExperience]);
  if (facts.length < 2 && review.crowdingLevel !== 'unclear') facts.push(crowdingLabels[review.crowdingLevel]);

  return facts.slice(0, 2);
}

export function OnsenReviewCard({
  review,
  variant = 'full',
  showTarget = false,
  showAuthor = true,
}: {
  review: OnsenReview;
  variant?: 'full' | 'preview';
  showTarget?: boolean;
  showAuthor?: boolean;
}) {
  const isSample = review.body.startsWith('[샘플]');
  const body = isSample ? review.body.replace(/^\[샘플\]\s*/, '') : review.body;
  const visitedMonth = formatPublicVisitMonth(review.visitedMonth);
  const facts = getKeyFacts(review);
  const revisitLabel = getVisibleRevisitLabel(review.revisitIntent);

  return (
    <article className={styles.card} data-variant={variant}>
      <header className={styles.header}>
        {showAuthor ? (
          <Link className={styles.author} href={`/passport/${review.author.handle}`}>
            <span className={styles.avatar} aria-hidden="true">{review.author.displayName.slice(0, 1)}</span>
            <span className={styles.authorCopy}>
              <strong>{review.author.displayName}</strong>
              {visitedMonth ? <time dateTime={review.visitedMonth ?? undefined}>{visitedMonth} 방문</time> : null}
            </span>
          </Link>
        ) : null}
        <div className={styles.meta}>
          {isSample ? <span data-tone="sample">샘플</span> : null}
          <span>{bathAreaLabels[review.bathType]}</span>
          {!showAuthor && visitedMonth ? <time dateTime={review.visitedMonth ?? undefined}>{visitedMonth} 방문</time> : null}
        </div>
      </header>

      {showTarget ? <h3 className={styles.target}><Link href={`/onsen/${review.targetSlug}`}>{review.targetName}</Link></h3> : null}
      <p className={styles.body}>{body}</p>

      <footer className={styles.footer}>
        {facts.length > 0 ? <div className={styles.facts}>{facts.map((fact) => <span key={fact}>{fact}</span>)}</div> : <span />}
        {revisitLabel ? <strong data-intent={review.revisitIntent}>{revisitLabel}</strong> : null}
      </footer>

      {variant === 'full' && review.cautionText ? <p className={styles.caution}><span>미리 알면 좋은 점</span>{review.cautionText}</p> : null}
    </article>
  );
}
