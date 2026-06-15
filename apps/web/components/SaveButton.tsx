'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@web/lib/auth';
import { trackWebEvent } from '@web/lib/analytics';
import { AuthRequiredError, isContentSaved, redirectToLogin, toggleSavedContent } from '@web/lib/userContent';

export function SaveButton({
  contentId,
  size = 32,
  className = '',
}: {
  contentId: string;
  size?: number;
  className?: string;
}) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    const syncSaved = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        if (active) setSaved(false);
        return;
      }
      try {
        const nextSaved = await isContentSaved(contentId);
        if (active) setSaved(nextSaved);
      } catch {
        if (active) setSaved(false);
      }
    };
    syncSaved();
    window.addEventListener('bathtime:saved-content-changed', syncSaved);
    return () => {
      active = false;
      window.removeEventListener('bathtime:saved-content-changed', syncSaved);
    };
  }, [contentId]);

  return (
    <button
      type="button"
      className={`save-button ${saved ? 'saved' : ''} ${className}`.trim()}
      aria-label={saved ? '저장 해제' : '저장하기'}
      style={{ width: size, height: size }}
      disabled={busy}
      onClick={async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (busy) return;
        setBusy(true);
        try {
          const nextSaved = await toggleSavedContent(contentId);
          setSaved(nextSaved);
          trackWebEvent(nextSaved ? 'content_saved' : 'content_unsaved', { content_id: contentId });
          window.dispatchEvent(new CustomEvent('bathtime:saved-content-changed'));
        } catch (error) {
          if (error instanceof AuthRequiredError) {
            redirectToLogin('save');
            return;
          }
          console.error('Failed to toggle saved content', error);
        } finally {
          setBusy(false);
        }
      }}
    >
      <svg width={Math.round(size * 0.56)} height={Math.round(size * 0.56)} viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} aria-hidden="true">
        <path d="M7 5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16l-5-3-5 3V5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
