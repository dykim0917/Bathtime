'use client';

import { ArrowRight } from '@phosphor-icons/react';
import { ONSEN_REVIEW_DRAWER_OPEN_EVENT } from '@web/lib/onsenReviewEvents';

export function OnsenReviewDrawerButton({
  reviewCount,
  className,
}: {
  reviewCount: number;
  className?: string;
}) {
  return (
    <button
      className={className}
      type="button"
      aria-haspopup="dialog"
      onClick={(event) => window.dispatchEvent(new CustomEvent(ONSEN_REVIEW_DRAWER_OPEN_EVENT, { detail: { trigger: event.currentTarget } }))}
    >
      후기 {reviewCount}개 전체 보기
      <ArrowRight size={15} weight="bold" aria-hidden="true" />
    </button>
  );
}
