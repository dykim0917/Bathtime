'use client';

import { useState } from 'react';
import { Check, ShareNetwork } from '@phosphor-icons/react';
import { trackOnsenEvent } from '@web/lib/onsenAnalytics';

type OnsenShareButtonProps = {
  title: string;
  summary: string;
  slug: string;
};

export function OnsenShareButton({ title, summary, slug }: OnsenShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const label = copied ? '링크가 복사되었습니다' : '공유하기';

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
      aria-label={label}
      aria-live="polite"
      title={label}
      onClick={async () => {
        const url = window.location.href;

        try {
          if (navigator.share) {
            await navigator.share({ title, text: summary, url });
            trackOnsenEvent('onsen_shared', { target_slug: slug, source_component: 'onsen_detail_actions', action_type: 'native_share' });
          } else {
            await copyCurrentUrl();
            trackOnsenEvent('onsen_shared', { target_slug: slug, source_component: 'onsen_detail_actions', action_type: 'copy_link' });
          }
        } catch (error) {
          if ((error as Error).name !== 'AbortError') {
            await copyCurrentUrl();
            trackOnsenEvent('onsen_shared', { target_slug: slug, source_component: 'onsen_detail_actions', action_type: 'copy_link' });
          }
        }
      }}
    >
      {copied
        ? <Check size={17} weight="bold" aria-hidden="true" />
        : <ShareNetwork size={17} weight="bold" aria-hidden="true" />}
    </button>
  );
}
