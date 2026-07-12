'use client';

import { useEffect, useState } from 'react';
import { BookmarkSimple } from '@phosphor-icons/react';
import { AuthRequiredError, isOnsenSaved, redirectToLogin, toggleSavedOnsen } from '@web/lib/userContent';

type SaveState = 'checking' | 'idle' | 'saving';

export function OnsenSaveButton({ slug }: { slug: string }) {
  const [saved, setSaved] = useState(false);
  const [state, setState] = useState<SaveState>('checking');
  const label = state === 'saving' ? '찜 저장 중' : saved ? '찜 취소' : '찜하기';

  useEffect(() => {
    let active = true;
    const syncSaved = async () => {
      try {
        const nextSaved = await isOnsenSaved(slug);
        if (active) setSaved(nextSaved);
      } catch {
        if (active) setSaved(false);
      } finally {
        if (active) setState('idle');
      }
    };

    syncSaved();
    window.addEventListener('bathtime:saved-content-changed', syncSaved);
    return () => {
      active = false;
      window.removeEventListener('bathtime:saved-content-changed', syncSaved);
    };
  }, [slug]);

  return (
    <button
      className={saved ? 'onsen-save-button saved' : 'onsen-save-button'}
      type="button"
      aria-label={label}
      aria-pressed={saved}
      title={label}
      disabled={state === 'saving'}
      onClick={async () => {
        if (state === 'saving') return;
        setState('saving');
        try {
          const nextSaved = await toggleSavedOnsen(slug);
          setSaved(nextSaved);
          window.dispatchEvent(new CustomEvent('bathtime:saved-content-changed'));
        } catch (error) {
          if (error instanceof AuthRequiredError) {
            redirectToLogin('onsen_saved');
            return;
          }
        } finally {
          setState('idle');
        }
      }}
    >
      <BookmarkSimple size={17} weight={saved ? 'fill' : 'bold'} aria-hidden="true" />
    </button>
  );
}
