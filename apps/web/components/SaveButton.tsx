'use client';

import { useEffect, useState } from 'react';

const savedStorageKey = 'bathtime:saved-content-ids';

function readSavedIds(): string[] {
  try {
    const value = window.localStorage.getItem(savedStorageKey);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function writeSavedIds(ids: string[]) {
  window.localStorage.setItem(savedStorageKey, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent('bathtime:saved-content-changed'));
}

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

  useEffect(() => {
    const syncSaved = () => setSaved(readSavedIds().includes(contentId));
    syncSaved();
    window.addEventListener('storage', syncSaved);
    window.addEventListener('bathtime:saved-content-changed', syncSaved);
    return () => {
      window.removeEventListener('storage', syncSaved);
      window.removeEventListener('bathtime:saved-content-changed', syncSaved);
    };
  }, [contentId]);

  return (
    <button
      type="button"
      className={`save-button ${saved ? 'saved' : ''} ${className}`.trim()}
      aria-label={saved ? '저장 해제' : '저장하기'}
      style={{ width: size, height: size }}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const current = readSavedIds();
        const next = current.includes(contentId)
          ? current.filter((id) => id !== contentId)
          : [...current, contentId];
        writeSavedIds(next);
        setSaved(next.includes(contentId));
      }}
    >
      <svg width={Math.round(size * 0.56)} height={Math.round(size * 0.56)} viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} aria-hidden="true">
        <path d="M7 5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16l-5-3-5 3V5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
