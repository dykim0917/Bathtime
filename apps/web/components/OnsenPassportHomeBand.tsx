'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpenText } from '@phosphor-icons/react';
import { getSupabaseClient } from '@web/lib/auth';
import {
  bathAreaLabels,
  formatPassportVisitDate,
  getTopValue,
  waterTextureLabels,
  type OnsenPassportEntry,
  type OnsenReviewWaterTexture,
} from '@web/lib/onsenPassport';
import { AuthRequiredError, getMyOnsenPassportEntries } from '@web/lib/userContent';
import styles from './OnsenLanding.module.css';

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

export function OnsenPassportHomeBand() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [status, setStatus] = useState<LoadStatus>('idle');
  const [entries, setEntries] = useState<OnsenPassportEntry[]>([]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setSignedIn(false);
      return;
    }

    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setSignedIn(Boolean(data.session));
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setSignedIn(Boolean(session));
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (signedIn !== true) {
      setEntries([]);
      setStatus('idle');
      return;
    }

    let active = true;
    setStatus('loading');
    getMyOnsenPassportEntries()
      .then((data) => {
        if (!active) return;
        setEntries(data);
        setStatus('ready');
      })
      .catch((error) => {
        if (!active) return;
        if (error instanceof AuthRequiredError) {
          setSignedIn(false);
          return;
        }
        setStatus('error');
      });

    return () => {
      active = false;
    };
  }, [signedIn]);

  const summary = useMemo(() => {
    const uniquePlaces = new Set(entries.map((entry) => `${entry.targetType}:${entry.targetSlug}`)).size;
    const topTexture = getTopValue<OnsenReviewWaterTexture>(entries.flatMap((entry) => entry.waterTexture), ['unclear']);
    return { uniquePlaces, topTexture, latest: entries[0] ?? null };
  }, [entries]);

  if (signedIn !== true) return null;

  const hasEntries = status === 'ready' && entries.length > 0;
  const isEmpty = status === 'ready' && entries.length === 0;
  const recentBathArea = summary.latest?.bathAreas[0];
  const recentTexture = summary.latest?.waterTexture.find((value) => value !== 'unclear');
  const recentMeta = summary.latest
    ? [
        formatPassportVisitDate(summary.latest),
        recentBathArea ? bathAreaLabels[recentBathArea] : null,
        recentTexture ? waterTextureLabels[recentTexture] : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : '';
  const passportTitle = hasEntries
    ? `${summary.uniquePlaces}곳의 온천, ${entries.length}건의 후기`
    : isEmpty
      ? '첫 후기를 작성하면 온천여권이 시작됩니다.'
      : status === 'error'
        ? '온천여권을 불러오지 못했습니다.'
        : '온천여권을 불러오는 중입니다.';
  const stateMessage = isEmpty
    ? '온천 상세에서 후기를 작성하면 다녀온 곳과 물의 감촉이 여권에 쌓입니다.'
    : status === 'error'
      ? '온천여권 페이지에서 다시 확인해 주세요.'
      : '저장된 방문 기록을 확인하고 있습니다.';
  const ctaHref = isEmpty ? '/onsen/results' : '/passport';
  const ctaLabel = isEmpty ? '다녀온 온천 찾기' : '내 온천여권 보기';

  return (
    <section className={styles.passportBand} aria-labelledby="home-passport-title" aria-busy={status === 'loading'}>
      <div className={styles.passportBandInner}>
        <header className={styles.passportIntro}>
          <BookOpenText size={28} weight="duotone" aria-hidden="true" />
          <div>
            <span>내 온천여권</span>
            <h2 id="home-passport-title">{passportTitle}</h2>
          </div>
        </header>

        {hasEntries ? (
          <>
            <dl className={styles.passportStats}>
              <div><dt>다녀온 곳</dt><dd>{summary.uniquePlaces}곳</dd></div>
              <div><dt>작성한 후기</dt><dd>{entries.length}건</dd></div>
              <div><dt>자주 고른 감촉</dt><dd>{summary.topTexture ? waterTextureLabels[summary.topTexture.value] : '아직 뚜렷하지 않음'}</dd></div>
            </dl>
            {summary.latest ? (
              <Link className={styles.passportRecent} href={`/onsen/${summary.latest.targetSlug}`}>
                <span>최근 작성한 후기</span>
                <strong>{summary.latest.targetName}</strong>
                <small>{recentMeta}</small>
              </Link>
            ) : null}
          </>
        ) : (
          <p className={styles.passportStateCopy} aria-live="polite">{stateMessage}</p>
        )}

        <Link className={styles.passportCta} href={ctaHref}>
          {ctaLabel}
          <ArrowRight size={17} weight="bold" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
