'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowClockwise, BookOpenText, CheckCircle, Drop, MapPin, Sparkle } from '@phosphor-icons/react';
import { AuthRequiredError, getMyOnsenPassportEntries } from '@web/lib/userContent';
import {
  bathAreaLabels,
  formatPassportVisitDate,
  getTopValue,
  revisitLabels,
  temperatureLabels,
  waterColorLabels,
  waterTextureLabels,
  type OnsenPassportEntry,
  type OnsenReviewTemperature,
  type OnsenReviewWaterTexture,
} from '@web/lib/onsenPassport';

type LoadStatus = 'loading' | 'signed-out' | 'ready' | 'error';

export function OnsenPassport() {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [entries, setEntries] = useState<OnsenPassportEntry[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
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

  if (status === 'loading') {
    return <section className="passport-state" aria-live="polite"><BookOpenText size={28} weight="duotone" aria-hidden="true" /><h2>온천여권을 펼치고 있습니다</h2><p>내가 남긴 방문 기록을 불러옵니다.</p></section>;
  }

  if (status === 'signed-out') {
    return <section className="passport-state"><BookOpenText size={32} weight="duotone" aria-hidden="true" /><h2>로그인하면 온천여권이 이어집니다</h2><p>다녀온 곳과 물의 감촉을 계정에 기록하고 다시 확인할 수 있습니다.</p><Link className="button-primary" href="/auth/login?source=passport&next=/passport">Google로 로그인</Link></section>;
  }

  if (status === 'error') {
    return <section className="passport-state" role="alert"><h2>온천여권을 불러오지 못했습니다</h2><p>잠시 후 다시 시도해주세요.</p><button className="button-secondary" type="button" onClick={() => setReloadKey((value) => value + 1)}><ArrowClockwise size={17} weight="bold" aria-hidden="true" />다시 불러오기</button></section>;
  }

  if (entries.length === 0) {
    return <section className="passport-state"><BookOpenText size={32} weight="duotone" aria-hidden="true" /><h2>첫 장은 아직 비어 있습니다</h2><p>다녀온 온천의 상세 페이지에서 기록을 남기면 이곳에 바로 쌓입니다.</p><Link className="button-primary" href="/onsen/results">온천 찾아보기</Link></section>;
  }

  return (
    <div className="passport-stack">
      <section className="passport-summary" aria-labelledby="passport-summary-title">
        <div className="passport-summary-copy">
          <span className="onsen-filter-label">나의 목욕 기록</span>
          <h2 id="passport-summary-title">{summary.uniquePlaces}곳에서 {entries.length}번의 온천을 기록했습니다</h2>
          <p>외부 이용 경험과 합산하지 않는 바스타임 자체 기록입니다. 방문 기록이 쌓이면 내 취향을 더 선명하게 보여줍니다.</p>
        </div>
        <dl className="passport-stat-list">
          <div><dt>다녀온 곳</dt><dd>{summary.uniquePlaces}</dd></div>
          <div><dt>전체 기록</dt><dd>{entries.length}</dd></div>
          <div><dt>방문 인증</dt><dd>{summary.verifiedVisits}</dd></div>
        </dl>
      </section>

      <section className="passport-taste" aria-labelledby="passport-taste-title">
        <div className="passport-section-head"><div><span className="onsen-filter-label">취향 기록</span><h2 id="passport-taste-title">내가 자주 고른 감각</h2></div><Sparkle size={26} weight="duotone" aria-hidden="true" /></div>
        <div className="passport-taste-list">
          <div><Drop size={20} weight="duotone" aria-hidden="true" /><span>물의 감촉</span><strong>{summary.topTexture ? waterTextureLabels[summary.topTexture.value] : '조금 더 기록해보세요'}</strong>{summary.topTexture ? <small>{summary.topTexture.count}번 기록</small> : null}</div>
          <div><Sparkle size={20} weight="duotone" aria-hidden="true" /><span>편안했던 온도</span><strong>{summary.topTemperature ? temperatureLabels[summary.topTemperature.value] : '조금 더 기록해보세요'}</strong>{summary.topTemperature ? <small>{summary.topTemperature.count}번 기록</small> : null}</div>
          <div><CheckCircle size={20} weight="duotone" aria-hidden="true" /><span>다시 가고 싶은 곳</span><strong>{summary.revisitCount}번</strong><small>내가 직접 남긴 의향</small></div>
        </div>
      </section>

      <section className="passport-history" aria-labelledby="passport-history-title">
        <div className="passport-section-head"><div><span className="onsen-filter-label">방문 순서</span><h2 id="passport-history-title">온천 기록</h2></div><MapPin size={26} weight="duotone" aria-hidden="true" /></div>
        <div className="passport-entry-list">
          {entries.map((entry) => {
            const title = <Link href={`/onsen/${entry.targetSlug}`}>{entry.targetName}</Link>;
            return (
              <article className="passport-entry" key={entry.id}>
                <div className="passport-entry-date"><span>{formatPassportVisitDate(entry)}</span><em data-status={entry.status}>{entry.status === 'approved' ? '공개됨' : entry.status === 'rejected' ? '반영 보류' : '검수 중'}</em></div>
                <div className="passport-entry-main"><div>{title}<p>{entry.body}</p></div><span data-verified={entry.verificationStatus === 'verified'}>{entry.verificationStatus === 'verified' ? '방문 인증' : '직접 기록'}</span></div>
                <div className="passport-entry-facts"><span>{bathAreaLabels[entry.bathAreas[0]]}</span><span>{waterTextureLabels[entry.waterTexture[0]]}</span><span>{waterColorLabels[entry.waterColor]}</span><span>{revisitLabels[entry.revisitIntent]}</span></div>
                {entry.cautionText ? <p className="passport-entry-caution">미리 알면 좋은 점: {entry.cautionText}</p> : null}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
