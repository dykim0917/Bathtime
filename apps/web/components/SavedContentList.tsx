'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { ArchiveContent } from '@/src/archive/types';
import type { OnsenCandidate } from '@web/lib/onsenCatalog';
import { ArchiveCard } from './ArchiveCard';
import { getSupabaseClient } from '@web/lib/auth';
import { getSavedContentIds, getSavedOnsenSlugs } from '@web/lib/userContent';

type LoadStatus = 'checking' | 'signed-out' | 'ready' | 'error';

export function SavedContentList({ contents, onsenCandidates }: { contents: ArchiveContent[]; onsenCandidates: OnsenCandidate[] }) {
  const [status, setStatus] = useState<LoadStatus>('checking');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savedOnsenSlugs, setSavedOnsenSlugs] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    const loadSaved = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        if (active) setStatus('error');
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        if (active) setStatus('signed-out');
        return;
      }

      try {
        const [ids, onsenSlugs] = await Promise.all([getSavedContentIds(), getSavedOnsenSlugs()]);
        if (active) {
          setSavedIds(ids);
          setSavedOnsenSlugs(onsenSlugs);
          setStatus('ready');
        }
      } catch {
        if (active) setStatus('error');
      }
    };

    loadSaved();
    window.addEventListener('bathtime:saved-content-changed', loadSaved);
    return () => {
      active = false;
      window.removeEventListener('bathtime:saved-content-changed', loadSaved);
    };
  }, []);

  const savedContents = useMemo(() => {
    const byId = new Map(contents.map((content) => [content.id, content]));
    return savedIds.map((id) => byId.get(id)).filter((content): content is ArchiveContent => Boolean(content));
  }, [contents, savedIds]);

  const savedOnsenCandidates = useMemo(() => {
    const bySlug = new Map(onsenCandidates.map((candidate) => [candidate.slug, candidate]));
    return savedOnsenSlugs.map((slug) => bySlug.get(slug)).filter((candidate): candidate is OnsenCandidate => Boolean(candidate));
  }, [onsenCandidates, savedOnsenSlugs]);

  if (status === 'checking') {
    return <p className="empty-note">보관함을 불러오고 있어요.</p>;
  }

  if (status === 'signed-out') {
    return (
      <section className="body-panel saved-empty-panel">
        <h2>로그인하면 찜한 온천을 이어서 볼 수 있어요.</h2>
        <p>비교하던 숙소와 당일온천 시설을 계정에 연결해두고 다시 꺼내볼 수 있습니다.</p>
        <Link className="button-primary" href="/auth/login?source=saved&next=/saved">Google로 로그인</Link>
      </section>
    );
  }

  if (status === 'error') {
    return <p className="empty-note">보관함을 불러오지 못했어요. 잠시 후 다시 시도해주세요.</p>;
  }

  if (savedOnsenCandidates.length === 0 && savedContents.length === 0) {
    return (
      <section className="body-panel saved-empty-panel">
        <h2>아직 찜한 온천이 없어요.</h2>
        <p>온천 상세에서 찜하기를 눌러 비교할 숙소와 시설을 담아보세요.</p>
        <Link className="button-primary" href="/onsen/results">온천 검색하기</Link>
      </section>
    );
  }

  return (
    <div className="saved-stack">
      {savedOnsenCandidates.length > 0 ? (
        <section className="saved-section" aria-labelledby="saved-onsen-title">
          <div className="section-heading-row">
            <h2 id="saved-onsen-title">찜한 온천</h2>
            <Link href="/onsen/results">더 찾아보기</Link>
          </div>
          <div className="saved-onsen-grid">
            {savedOnsenCandidates.map((candidate) => (
              <Link key={candidate.slug} className="saved-onsen-card" href={`/onsen/${candidate.slug}`}>
                <span>{candidate.area}</span>
                <strong>{candidate.name}</strong>
                <em>{candidate.waterDecision.springType}</em>
                <p>{candidate.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {savedContents.length > 0 ? (
        <section className="saved-section" aria-labelledby="saved-content-title">
          <div className="section-heading-row">
            <h2 id="saved-content-title">이전 콘텐츠 저장</h2>
          </div>
          <div className="card-grid">
            {savedContents.map((content) => (
              <ArchiveCard key={content.id} content={content} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
