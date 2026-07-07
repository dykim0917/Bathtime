'use client';

import { useState } from 'react';
import { ShareNetwork } from '@phosphor-icons/react';

type OnsenShareButtonProps = {
  title: string;
  summary: string;
};

export function OnsenShareButton({ title, summary }: OnsenShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const markCopied = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const copyCurrentUrl = async () => {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(window.location.href);
    markCopied();
  };

  return (
    <button
      className={copied ? 'onsen-share-button copied' : 'onsen-share-button'}
      type="button"
      aria-live="polite"
      onClick={async () => {
        const url = window.location.href;

        try {
          if (navigator.share) {
            await navigator.share({ title, text: summary, url });
          } else {
            await copyCurrentUrl();
          }
        } catch (error) {
          if ((error as Error).name !== 'AbortError') {
            await copyCurrentUrl();
          }
        }
      }}
    >
      <ShareNetwork size={17} weight="bold" aria-hidden="true" />
      {copied ? '링크 복사됨' : '공유하기'}
    </button>
  );
}
