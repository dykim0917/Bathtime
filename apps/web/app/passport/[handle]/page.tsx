import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, BookOpenText, Drop, MapPin, ShieldCheck, Sparkle } from '@phosphor-icons/react/ssr';
import { OnsenReviewCard } from '@web/components/OnsenReviewCard';
import { getTopValue, temperatureLabels, waterTextureLabels } from '@web/lib/onsenPassport';
import { readPublicOnsenPassport } from '@web/lib/onsenReviews';
import styles from './page.module.css';

type PageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const passport = await readPublicOnsenPassport(handle);

  if (!passport) return { title: '공개 온천여권을 찾을 수 없습니다' };

  return {
    title: `${passport.profile.displayName}의 온천여권`,
    description: passport.profile.bio ?? `${passport.profile.displayName}님이 공개한 온천 후기와 물의 취향을 확인합니다.`,
    alternates: { canonical: `/passport/${passport.profile.handle}` },
  };
}

export default async function PublicOnsenPassportPage({ params }: PageProps) {
  const { handle } = await params;
  const passport = await readPublicOnsenPassport(handle);
  if (!passport) notFound();

  const { profile, reviews } = passport;
  const uniquePlaces = new Set(reviews.map((review) => `${review.targetType}:${review.targetSlug}`)).size;
  const topTexture = getTopValue(reviews.flatMap((review) => review.waterTexture), ['unclear']);
  const topTemperature = getTopValue(reviews.map((review) => review.temperatureExperience), ['unclear']);
  const topTextureSignal = topTexture && topTexture.count >= 2 ? topTexture : null;
  const topTemperatureSignal = topTemperature && topTemperature.count >= 2 ? topTemperature : null;
  const revisitCount = reviews.filter((review) => review.revisitIntent === 'yes').length;

  return (
    <main className={styles.page}>
      <header className={styles.profile}>
        <div className={styles.avatar} aria-hidden="true">{profile.displayName.slice(0, 1)}</div>
        <div className={styles.profileCopy}>
          <span>ONSEN PASSPORT · @{profile.handle}</span>
          <h1>{profile.displayName}의 온천여권</h1>
          <p>{profile.bio ?? '다녀온 온천과 기억에 남은 물의 감촉을 모았습니다.'}</p>
        </div>
      </header>

      <dl className={styles.stats} aria-label="공개 온천여권 요약">
        <div><dt>다녀온 곳</dt><dd>{uniquePlaces}</dd></div>
        <div><dt>공개 후기</dt><dd>{reviews.length}</dd></div>
        <div><dt>재방문 의사 있음</dt><dd>{revisitCount}</dd></div>
      </dl>

      {reviews.length > 0 ? (
        <section className={styles.taste} aria-labelledby="public-passport-taste-title">
          <header><div><span>작성한 후기에서</span><h2 id="public-passport-taste-title">이 여권의 물 취향</h2></div><Sparkle size={24} weight="duotone" aria-hidden="true" /></header>
          <div className={styles.tasteRows}>
            <div><Drop size={18} weight="duotone" aria-hidden="true" /><span>자주 고른 감촉</span><strong>{topTextureSignal ? waterTextureLabels[topTextureSignal.value] : '아직 뚜렷하지 않음'}</strong></div>
            <div><Sparkle size={18} weight="duotone" aria-hidden="true" /><span>자주 고른 온도</span><strong>{topTemperatureSignal ? temperatureLabels[topTemperatureSignal.value] : '아직 뚜렷하지 않음'}</strong></div>
            <div><BookOpenText size={18} weight="duotone" aria-hidden="true" /><span>재방문 의사 있음</span><strong>{revisitCount}건</strong></div>
          </div>
        </section>
      ) : null}

      <section className={styles.history} aria-labelledby="public-passport-history-title">
        <header><div><span>공개 후기</span><h2 id="public-passport-history-title">다녀온 온천</h2></div><MapPin size={24} weight="duotone" aria-hidden="true" /></header>
        {reviews.length > 0 ? (
          <div className={styles.reviewList}>{reviews.map((review) => <OnsenReviewCard key={review.id} review={review} showAuthor={false} showTarget />)}</div>
        ) : (
          <div className={styles.empty}><BookOpenText size={26} weight="duotone" aria-hidden="true" /><strong>아직 공개한 후기가 없습니다</strong><p>여권 주인이 공개한 후기만 이곳에 표시됩니다.</p></div>
        )}
      </section>

      <footer className={styles.footer}>
        <div><ShieldCheck size={20} weight="duotone" aria-hidden="true" /><p>이 여권에는 회원이 공개에 동의한 후기만 표시됩니다. 정확한 방문일과 로그인 계정 정보는 공개하지 않습니다.</p></div>
        <Link href="/onsen/results">다른 온천 찾아보기 <ArrowRight size={16} weight="bold" aria-hidden="true" /></Link>
      </footer>
    </main>
  );
}
