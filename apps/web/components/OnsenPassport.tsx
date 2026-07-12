'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowClockwise, BookOpenText, CheckCircle, Drop, Eye, EyeSlash, MapPin, Sparkle } from '@phosphor-icons/react';
import { OnsenPassportPublicSettings } from './OnsenPassportPublicSettings';
import {
  AuthRequiredError,
  getMyOnsenPassportEntries,
  getMyOnsenPublicProfile,
  setOnsenReviewVisibility,
} from '@web/lib/userContent';
import {
  bathAreaLabels,
  formatPassportVisitDate,
  getTopValue,
  getVisibleRevisitLabel,
  temperatureLabels,
  waterColorLabels,
  waterTextureLabels,
  type OnsenPassportEntry,
  type OnsenPublicProfile,
  type OnsenReviewTemperature,
  type OnsenReviewWaterTexture,
} from '@web/lib/onsenPassport';

type LoadStatus = 'loading' | 'signed-out' | 'ready' | 'error';

function getReviewStatusLabel(entry: OnsenPassportEntry) {
  if (entry.status === 'approved') return '검수 완료';
  if (entry.status === 'rejected') return '반영 보류';
  return '검수 중';
}

function getVisibilityLabel(entry: OnsenPassportEntry, profile: OnsenPublicProfile | null) {
  if (!entry.isPublic) return '나만 보기';
  if (!profile?.passportIsPublic) return '여권 비공개';
  return entry.status === 'approved' ? '공개 중' : '승인 후 공개';
}

function getPassportEntryFacts(entry: OnsenPassportEntry) {
  return [
    bathAreaLabels[entry.bathAreas[0]],
    waterTextureLabels[entry.waterTexture[0]],
    waterColorLabels[entry.waterColor],
    getVisibleRevisitLabel(entry.revisitIntent),
  ].filter((value): value is string => Boolean(value));
}

export function OnsenPassport() {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [entries, setEntries] = useState<OnsenPassportEntry[]>([]);
  const [publicProfile, setPublicProfile] = useState<OnsenPublicProfile | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [updatingReviewId, setUpdatingReviewId] = useState<string | null>(null);
  const [visibilityError, setVisibilityError] = useState('');

  useEffect(() => {
    let active = true;
    setStatus('loading');
    Promise.all([getMyOnsenPassportEntries(), getMyOnsenPublicProfile()])
      .then(([entryData, profileData]) => {
        if (!active) return;
        setEntries(entryData);
        setPublicProfile(profileData);
        setStatus('ready');
      })
      .catch((error) => {
        if (!active) return;
        setStatus(error instanceof AuthRequiredError ? 'signed-out' : 'error');
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const summary = useMemo(() => {
    const uniquePlaces = new Set(entries.map((entry) => `${entry.targetType}:${entry.targetSlug}`)).size;
    const verifiedVisits = entries.filter((entry) => entry.verificationStatus === 'verified').length;
    const topTexture = getTopValue<OnsenReviewWaterTexture>(entries.flatMap((entry) => entry.waterTexture), ['unclear']);
    const topTemperature = getTopValue<OnsenReviewTemperature>(entries.map((entry) => entry.temperatureExperience), ['unclear']);
    const revisitCount = entries.filter((entry) => entry.revisitIntent === 'yes').length;
    return { uniquePlaces, verifiedVisits, topTexture, topTemperature, revisitCount };
  }, [entries]);

  async function toggleReviewVisibility(entry: OnsenPassportEntry) {
    const nextVisibility = !entry.isPublic;
    setVisibilityError('');

    if (nextVisibility && !publicProfile?.passportIsPublic) {
      setVisibilityError('먼저 공개 닉네임과 온천여권 공개를 설정해 주세요.');
      document.getElementById('passport-public-settings')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    setUpdatingReviewId(entry.id);
    try {
      await setOnsenReviewVisibility(entry.id, nextVisibility);
      setEntries((current) => current.map((item) => item.id === entry.id ? { ...item, isPublic: nextVisibility } : item));
    } catch {
      setVisibilityError('후기 공개 설정을 바꾸지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setUpdatingReviewId(null);
    }
  }

  if (status === 'loading') {
    return <section className="passport-state" aria-live="polite"><BookOpenText size={28} weight="duotone" aria-hidden="true" /><h2>온천여권을 불러오는 중입니다</h2><p>저장된 방문 기록을 확인하고 있습니다.</p></section>;
  }

  if (status === 'signed-out') {
    return <section className="passport-state"><BookOpenText size={32} weight="duotone" aria-hidden="true" /><h2>로그인하면 온천여권을 사용할 수 있습니다</h2><p>작성한 후기와 다녀온 온천, 물의 감촉을 한곳에서 확인할 수 있습니다.</p><Link className="button-primary" href="/auth/login?source=passport&next=/passport">Google로 로그인</Link></section>;
  }

  if (status === 'error') {
    return <section className="passport-state" role="alert"><h2>온천여권을 불러오지 못했습니다</h2><p>잠시 후 다시 시도해 주세요.</p><button className="button-secondary" type="button" onClick={() => setReloadKey((value) => value + 1)}><ArrowClockwise size={17} weight="bold" aria-hidden="true" />다시 불러오기</button></section>;
  }

  return (
    <div className="passport-stack">
      {entries.length > 0 ? (
        <>
          <section className="passport-summary" aria-labelledby="passport-summary-title">
            <div className="passport-summary-copy">
              <span className="onsen-filter-label">내 온천여권</span>
              <h2 id="passport-summary-title">{summary.uniquePlaces}곳의 온천, {entries.length}번의 방문</h2>
              <p>바스타임에 직접 작성한 후기만 모았습니다. 외부 후기 수와는 합산하지 않습니다.</p>
            </div>
            <dl className="passport-stat-list">
              <div><dt>다녀온 곳</dt><dd>{summary.uniquePlaces}</dd></div>
              <div><dt>작성한 후기</dt><dd>{entries.length}</dd></div>
              <div><dt>방문 인증</dt><dd>{summary.verifiedVisits}</dd></div>
            </dl>
          </section>

          <section className="passport-taste" aria-labelledby="passport-taste-title">
            <div className="passport-section-head"><div><span className="onsen-filter-label">취향 요약</span><h2 id="passport-taste-title">후기로 보는 내 온천 취향</h2></div><Sparkle size={26} weight="duotone" aria-hidden="true" /></div>
            <div className="passport-taste-list">
              <div><Drop size={20} weight="duotone" aria-hidden="true" /><span>물의 감촉</span><strong>{summary.topTexture ? waterTextureLabels[summary.topTexture.value] : '아직 뚜렷하지 않음'}</strong>{summary.topTexture ? <small>{summary.topTexture.count}번 선택</small> : null}</div>
              <div><Sparkle size={20} weight="duotone" aria-hidden="true" /><span>편안했던 온도</span><strong>{summary.topTemperature ? temperatureLabels[summary.topTemperature.value] : '아직 뚜렷하지 않음'}</strong>{summary.topTemperature ? <small>{summary.topTemperature.count}번 선택</small> : null}</div>
              <div><CheckCircle size={20} weight="duotone" aria-hidden="true" /><span>재방문 의사 있음</span><strong>{summary.revisitCount}건</strong><small>작성한 후기 기준</small></div>
            </div>
          </section>
        </>
      ) : (
        <section className="passport-state passport-empty-state"><BookOpenText size={32} weight="duotone" aria-hidden="true" /><h2>아직 작성한 후기가 없습니다</h2><p>다녀온 온천의 상세 페이지에서 후기를 작성하면 방문 기록이 여권에 쌓입니다.</p><Link className="button-primary" href="/onsen/results">다녀온 온천 찾기</Link></section>
      )}

      <OnsenPassportPublicSettings profile={publicProfile} onSaved={setPublicProfile} />

      {entries.length > 0 ? (
        <section className="passport-history" aria-labelledby="passport-history-title">
          <div className="passport-section-head"><div><span className="onsen-filter-label">내가 다녀온 곳</span><h2 id="passport-history-title">방문 기록</h2></div><MapPin size={26} weight="duotone" aria-hidden="true" /></div>
          {visibilityError ? <p className="passport-visibility-error" role="alert">{visibilityError}</p> : null}
          <div className="passport-entry-list">
            {entries.map((entry) => (
              <article className="passport-entry" key={entry.id}>
                <div className="passport-entry-date">
                  <span>{formatPassportVisitDate(entry)}</span>
                  <div className="passport-entry-controls">
                    <em data-status={entry.status}>{getReviewStatusLabel(entry)}</em>
                    <button
                      type="button"
                      data-public={entry.isPublic}
                      aria-pressed={entry.isPublic}
                      disabled={updatingReviewId === entry.id}
                      onClick={() => toggleReviewVisibility(entry)}
                    >
                      {entry.isPublic ? <Eye size={15} weight="bold" aria-hidden="true" /> : <EyeSlash size={15} weight="bold" aria-hidden="true" />}
                      {updatingReviewId === entry.id ? '변경 중' : getVisibilityLabel(entry, publicProfile)}
                    </button>
                  </div>
                </div>
                <div className="passport-entry-main"><div><Link href={`/onsen/${entry.targetSlug}`}>{entry.targetName}</Link><p>{entry.body}</p></div><span data-verified={entry.verificationStatus === 'verified'}>{entry.verificationStatus === 'verified' ? '방문 인증' : '본인 작성'}</span></div>
                <div className="passport-entry-facts">{getPassportEntryFacts(entry).map((fact) => <span key={fact}>{fact}</span>)}</div>
                {entry.cautionText ? <p className="passport-entry-caution">미리 알면 좋은 점: {entry.cautionText}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
