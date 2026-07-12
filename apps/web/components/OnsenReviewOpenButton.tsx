'use client';

import { PencilSimpleLine } from '@phosphor-icons/react';
import { ONSEN_REVIEW_OPEN_EVENT } from '@web/lib/onsenReviewEvents';

export function OnsenReviewOpenButton({ className }: { className?: string }) {
  return (
    <button
      className={className}
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(ONSEN_REVIEW_OPEN_EVENT))}
    >
      <PencilSimpleLine size={17} weight="bold" aria-hidden="true" />
      후기 작성
    </button>
  );
}
