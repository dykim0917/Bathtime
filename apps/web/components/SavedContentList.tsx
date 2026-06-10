'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { ArchiveContent } from '@/src/archive/types';
import { ArchiveCard } from './ArchiveCard';
import { getSupabaseClient } from '@web/lib/auth';
import { getSavedContentIds } from '@web/lib/userContent';

type LoadStatus = 'checking' | 'signed-out' | 'ready' | 'error';

export function SavedContentList({ contents }: { contents: ArchiveContent[] }) {
  const [status, setStatus] = useState<LoadStatus>('checking');
  const [savedIds, setSavedIds] = useState<string[]>([]);

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
        const ids = await getSavedContentIds();
        if (active) {
          setSavedIds(ids);
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

  if (status === 'checking') {
    return <p className="empty-note">보관함을 불러오고 있어요.</p>;
  }

  if (status === 'signed-out') {
    return (
      <section className="body-panel saved-empty-panel">
        <h2>로그인하면 저장한 콘텐츠를 이어서 볼 수 있어요.</h2>
        <p>공간, 아이템, 의식 기록을 계정에 연결해두고 다시 꺼내볼 수 있습니다.</p>
        <Link className="button-primary" href="/auth/login?source=saved&next=/saved">Google로 로그인</Link>
      </section>
    );
  }

  if (status === 'error') {
    return <p className="empty-note">보관함을 불러오지 못했어요. 잠시 후 다시 시도해주세요.</p>;
  }

  if (savedContents.length === 0) {
    return (
      <section className="body-panel saved-empty-panel">
        <h2>아직 저장한 콘텐츠가 없어요.</h2>
        <p>탐색 화면이나 콘텐츠 상세에서 북마크 버튼을 눌러 보관함에 담아보세요.</p>
        <Link className="button-primary" href="/explore">아카이브 탐색</Link>
      </section>
    );
  }

  return (
    <div className="card-grid">
      {savedContents.map((content) => (
        <ArchiveCard key={content.id} content={content} />
      ))}
    </div>
  );
}
