'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CaretLeft, CaretRight, PencilSimpleLine, SlidersHorizontal, X } from '@phosphor-icons/react';
import { ONSEN_REVIEW_DRAWER_OPEN_EVENT, ONSEN_REVIEW_OPEN_EVENT } from '@web/lib/onsenReviewEvents';
import {
  ONSEN_REVIEW_PAGE_SIZE,
  type OnsenReview,
  type OnsenReviewSort,
} from '@web/lib/onsenReviews';
import type { OnsenReviewTargetType } from '@web/lib/onsenPassport';
import { OnsenReviewCard } from './OnsenReviewCard';
import { SelectBox, type SelectBoxOption } from './SelectBox';
import styles from './OnsenReviewDrawer.module.css';

const sortOptions: SelectBoxOption<OnsenReviewSort>[] = [
  { value: 'latest', label: '최근 작성순' },
  { value: 'visit', label: '최근 방문순' },
];

type ReviewPagePayload = {
  reviews: OnsenReview[];
};

export function OnsenReviewDrawer({
  targetType,
  targetSlug,
  targetName,
  reviewCount,
  initialReviews,
}: {
  targetType: OnsenReviewTargetType;
  targetSlug: string;
  targetName: string;
  reviewCount: number;
  initialReviews: OnsenReview[];
}) {
  const totalPages = Math.max(1, Math.ceil(reviewCount / ONSEN_REVIEW_PAGE_SIZE));
  const cacheRef = useRef(new Map<string, OnsenReview[]>([['latest:1', initialReviews]]));
  const openedByPushRef = useRef(false);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<OnsenReviewSort>('latest');
  const [reviews, setReviews] = useState(initialReviews);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [reloadKey, setReloadKey] = useState(0);

  const syncFromUrl = useCallback(() => {
    const url = new URL(window.location.href);
    const shouldOpen = url.searchParams.get('reviews') === '1';
    const requestedPage = Number.parseInt(url.searchParams.get('reviewPage') ?? '1', 10);
    const requestedSort = url.searchParams.get('reviewSort') === 'visit' ? 'visit' : 'latest';
    setOpen(shouldOpen);
    setPage(Math.min(Math.max(Number.isFinite(requestedPage) ? requestedPage : 1, 1), totalPages));
    setSort(requestedSort);
    if (!shouldOpen) openedByPushRef.current = false;
  }, [totalPages]);

  const removeDrawerParams = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete('reviews');
    url.searchParams.delete('reviewPage');
    url.searchParams.delete('reviewSort');
    window.history.replaceState(window.history.state, '', url);
  }, []);

  const closeDrawer = useCallback(() => {
    if (openedByPushRef.current) {
      openedByPushRef.current = false;
      window.history.back();
      return;
    }
    removeDrawerParams();
    setOpen(false);
  }, [removeDrawerParams]);

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const trigger = (event as CustomEvent<{ trigger?: HTMLElement }>).detail?.trigger;
      previousFocusRef.current = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
      const url = new URL(window.location.href);
      if (url.searchParams.get('reviews') !== '1') {
        url.searchParams.set('reviews', '1');
        url.searchParams.set('reviewPage', '1');
        url.searchParams.set('reviewSort', 'latest');
        openedByPushRef.current = true;
        window.history.pushState(window.history.state, '', url);
      }
      syncFromUrl();
    };
    const handlePopState = () => syncFromUrl();

    syncFromUrl();
    window.addEventListener(ONSEN_REVIEW_DRAWER_OPEN_EVENT, handleOpen);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener(ONSEN_REVIEW_DRAWER_OPEN_EVENT, handleOpen);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [syncFromUrl]);

  useEffect(() => {
    if (!open) return undefined;
    document.body.classList.add('bt-drawer-open');
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDrawer();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(drawerRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])') ?? []);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('bt-drawer-open');
      previousFocusRef.current?.focus();
    };
  }, [closeDrawer, open]);

  useEffect(() => {
    if (!open) return undefined;
    const key = `${sort}:${page}`;
    const cachedReviews = cacheRef.current.get(key);
    if (cachedReviews) {
      setReviews(cachedReviews);
      setStatus('idle');
      return undefined;
    }

    const controller = new AbortController();
    const url = new URL('/api/onsen-reviews', window.location.origin);
    url.searchParams.set('targetType', targetType);
    url.searchParams.set('slug', targetSlug);
    url.searchParams.set('sort', sort);
    url.searchParams.set('page', String(page));
    setStatus('loading');

    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Review page request failed');
        return response.json() as Promise<ReviewPagePayload>;
      })
      .then((payload) => {
        cacheRef.current.set(key, payload.reviews);
        setReviews(payload.reviews);
        setStatus('idle');
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setStatus('error');
      });

    return () => controller.abort();
  }, [open, page, reloadKey, sort, targetSlug, targetType]);

  const pageLabel = useMemo(() => `${page} / ${totalPages}`, [page, totalPages]);

  function updateDrawerState(nextPage: number, nextSort: OnsenReviewSort) {
    const url = new URL(window.location.href);
    url.searchParams.set('reviews', '1');
    url.searchParams.set('reviewPage', String(nextPage));
    url.searchParams.set('reviewSort', nextSort);
    window.history.replaceState(window.history.state, '', url);
    setPage(nextPage);
    setSort(nextSort);
  }

  function openReviewForm() {
    removeDrawerParams();
    openedByPushRef.current = false;
    setOpen(false);
    window.requestAnimationFrame(() => window.dispatchEvent(new CustomEvent(ONSEN_REVIEW_OPEN_EVENT)));
  }

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeDrawer();
      }}
    >
      <section ref={drawerRef} className={styles.drawer} role="dialog" aria-modal="true" aria-labelledby="onsen-review-drawer-title">
        <header className={styles.header}>
          <div>
            <span>{targetName}</span>
            <h2 id="onsen-review-drawer-title">온천 이용 후기 <em>{reviewCount}</em></h2>
          </div>
          <button ref={closeButtonRef} className={styles.closeButton} type="button" aria-label="후기 전체 보기 닫기" onClick={closeDrawer}>
            <X size={20} weight="bold" aria-hidden="true" />
          </button>
        </header>

        <div className={styles.toolbar}>
          <SelectBox
            value={sort}
            options={sortOptions}
            ariaLabel="후기 정렬"
            leadingIcon={<SlidersHorizontal size={16} weight="bold" aria-hidden="true" />}
            compact
            onChange={(value) => updateDrawerState(1, value)}
          />
          <button className={styles.writeButton} type="button" onClick={openReviewForm}>
            <PencilSimpleLine size={17} weight="bold" aria-hidden="true" />
            후기 작성
          </button>
        </div>

        <div className={styles.content} aria-live="polite" aria-busy={status === 'loading'}>
          {status === 'loading' ? <div className={styles.state}><strong>후기를 불러오고 있습니다</strong></div> : null}
          {status === 'error' ? <div className={styles.state}><strong>후기를 불러오지 못했습니다</strong><button type="button" onClick={() => setReloadKey((value) => value + 1)}>다시 시도</button></div> : null}
          {status === 'idle' && reviews.length > 0 ? <div className={styles.list}>{reviews.map((review) => <OnsenReviewCard key={review.id} review={review} />)}</div> : null}
          {status === 'idle' && reviews.length === 0 ? <div className={styles.state}><strong>아직 공개된 후기가 없습니다</strong><p>다녀왔다면 첫 후기를 작성해 주세요.</p></div> : null}
        </div>

        <footer className={styles.footer}>
          <nav className={styles.pagination} aria-label="후기 페이지">
            <button type="button" aria-label="이전 후기 페이지" disabled={page <= 1 || status === 'loading'} onClick={() => updateDrawerState(page - 1, sort)}>
              <CaretLeft size={17} weight="bold" aria-hidden="true" />
            </button>
            <span>{pageLabel}</span>
            <button type="button" aria-label="다음 후기 페이지" disabled={page >= totalPages || status === 'loading'} onClick={() => updateDrawerState(page + 1, sort)}>
              <CaretRight size={17} weight="bold" aria-hidden="true" />
            </button>
          </nav>
          <p>개인의 체감과 방문 경험을 보여주며, 공식 온천수 방식 판정에는 사용하지 않습니다.</p>
        </footer>
      </section>
    </div>,
    document.body
  );
}
