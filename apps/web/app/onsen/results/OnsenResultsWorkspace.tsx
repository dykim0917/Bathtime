'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowCounterClockwise,
  ArrowsDownUp,
  CursorClick,
  FunnelSimple,
  MapTrifold,
  X,
} from '@phosphor-icons/react';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import type { OnsenMapPoint } from '@web/lib/onsenMap';
import styles from './results.module.css';

const OnsenResultsMap = dynamic(
  () => import('./OnsenResultsMap').then((module) => module.OnsenResultsMap),
  { ssr: false }
);

export type OnsenResultsSortValue = 'recommended' | 'reviews' | 'water' | 'name';

type OnsenResultsSortProps = {
  value: OnsenResultsSortValue;
  compact?: boolean;
};

export function OnsenResultsSort({ value, compact = false }: OnsenResultsSortProps) {
  const router = useRouter();

  return (
    <label className={compact ? styles.sortCompact : styles.sortControl}>
      {compact ? <ArrowsDownUp size={16} weight="bold" aria-hidden /> : <span>정렬</span>}
      <select
        value={value}
        aria-label="결과 정렬"
        onChange={(event) => {
          const nextParams = new URLSearchParams(window.location.search);
          if (event.target.value === 'recommended') nextParams.delete('sort');
          else nextParams.set('sort', event.target.value);
          nextParams.delete('page');
          const query = nextParams.toString();
          router.push(query ? `${window.location.pathname}?${query}` : window.location.pathname);
        }}
      >
        <option value="recommended">{compact ? '추천순' : '바스타임 추천순'}</option>
        <option value="reviews">{compact ? '후기순' : '후기 많이 읽은 순'}</option>
        <option value="water">{compact ? '온천수순' : '온천수 방식 우선'}</option>
        <option value="name">이름순</option>
      </select>
    </label>
  );
}

type OnsenResultsWorkspaceProps = {
  filterBody: ReactNode;
  children: ReactNode;
  resetHref: string;
  hasFilters: boolean;
  resultCount: number;
  rangeStart: number;
  rangeEnd: number;
  sort: OnsenResultsSortValue;
  mapPoints: OnsenMapPoint[];
  visibleResultCount: number;
};

function getFocusableElements(container: HTMLElement) {
  return [...container.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter((element) => !element.hasAttribute('hidden'));
}

export function OnsenResultsWorkspace({
  filterBody,
  children,
  resetHref,
  hasFilters,
  resultCount,
  rangeStart,
  rangeEnd,
  sort,
  mapPoints,
  visibleResultCount,
}: OnsenResultsWorkspaceProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [desktopMapOpen, setDesktopMapOpen] = useState(true);
  const [mobileMapOpen, setMobileMapOpen] = useState(false);
  const [isNarrow, setIsNarrow] = useState<boolean | null>(null);
  const [mapResizeSignal, setMapResizeSignal] = useState(0);
  const filterPanelRef = useRef<HTMLElement>(null);
  const mapPanelRef = useRef<HTMLElement>(null);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const mapTriggerRef = useRef<HTMLButtonElement>(null);
  const mapHighlightedTargetRef = useRef<HTMLElement | null>(null);
  const mapHighlightTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 980px)');
    const update = () => setIsNarrow(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (isNarrow !== true || (!filterOpen && !mobileMapOpen)) return;
    const panel = filterOpen ? filterPanelRef.current : mapPanelRef.current;
    if (!panel) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = getFocusableElements(panel);
    focusable[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (filterOpen) {
          setFilterOpen(false);
          window.setTimeout(() => filterTriggerRef.current?.focus(), 0);
        } else {
          setMobileMapOpen(false);
          window.setTimeout(() => mapTriggerRef.current?.focus(), 0);
        }
        return;
      }

      if (event.key !== 'Tab' || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
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
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [filterOpen, isNarrow, mobileMapOpen]);

  useEffect(() => () => {
    if (mapHighlightTimerRef.current !== null) window.clearTimeout(mapHighlightTimerRef.current);
    mapHighlightedTargetRef.current?.classList.remove(styles.resultCardMapFocused);
    mapHighlightedTargetRef.current?.removeAttribute('data-map-highlighted');
  }, []);

  const handleSelectPoint = useCallback((targetId: string) => {
    const reveal = () => {
      const target = document.getElementById(targetId);
      if (!target) return;

      if (mapHighlightTimerRef.current !== null) window.clearTimeout(mapHighlightTimerRef.current);
      mapHighlightedTargetRef.current?.classList.remove(styles.resultCardMapFocused);
      mapHighlightedTargetRef.current?.removeAttribute('data-map-highlighted');

      target.classList.add(styles.resultCardMapFocused);
      target.setAttribute('data-map-highlighted', 'true');
      mapHighlightedTargetRef.current = target;
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.focus({ preventScroll: true });

      mapHighlightTimerRef.current = window.setTimeout(() => {
        target.classList.remove(styles.resultCardMapFocused);
        target.removeAttribute('data-map-highlighted');
        if (mapHighlightedTargetRef.current === target) mapHighlightedTargetRef.current = null;
        mapHighlightTimerRef.current = null;
      }, 1600);
    };

    if (isNarrow === true) {
      setMobileMapOpen(false);
      window.setTimeout(reveal, 300);
    } else {
      reveal();
    }
  }, [isNarrow]);

  const mapVisible = isNarrow === null ? false : isNarrow ? mobileMapOpen : desktopMapOpen;

  return (
    <section className={styles.workspace} aria-label="온천 검색 결과와 필터">
      <aside
        ref={filterPanelRef}
        className={`${styles.filterPanel}${filterOpen ? ` ${styles.filterPanelOpen}` : ''}`}
        aria-label="검색 결과 필터"
        aria-hidden={isNarrow === true && !filterOpen}
        role={isNarrow === true && filterOpen ? 'dialog' : undefined}
        aria-modal={isNarrow === true && filterOpen ? 'true' : undefined}
      >
        <header className={styles.filterHead}>
          <div>
            <FunnelSimple size={18} weight="bold" aria-hidden />
            <strong>필터</strong>
          </div>
          {hasFilters ? (
            <Link className={styles.resetAction} href={resetHref}>
              <ArrowCounterClockwise size={15} weight="bold" aria-hidden />
              초기화
            </Link>
          ) : (
            <span className={styles.resetAction} aria-disabled="true">초기화</span>
          )}
          <button
            className={styles.filterClose}
            type="button"
            aria-label="필터 닫기"
            title="필터 닫기"
            onClick={() => {
              setFilterOpen(false);
              window.setTimeout(() => filterTriggerRef.current?.focus(), 0);
            }}
          >
            <X size={20} aria-hidden />
          </button>
        </header>
        <div className={styles.filterScroll}>{filterBody}</div>
        <footer className={styles.filterFooter}>
          <button type="button" onClick={() => setFilterOpen(false)}>
            {resultCount.toLocaleString('ko-KR')}곳 결과 보기
          </button>
        </footer>
      </aside>

      <div className={`${styles.resultsColumn}${desktopMapOpen ? ` ${styles.mapIsOpen}` : ''}`}>
        <div className={styles.listControl}>
          <p>
            <strong>{rangeStart === rangeEnd ? rangeStart : `${rangeStart}~${rangeEnd}`}</strong>
            <span> / {resultCount.toLocaleString('ko-KR')}곳</span>
          </p>
          <div>
            <span>숙소와 온천시설을 함께 표시합니다.</span>
            <button
              type="button"
              aria-controls="onsen-results-map-panel"
              aria-expanded={desktopMapOpen}
              onClick={() => {
                setDesktopMapOpen((open) => !open);
                setMapResizeSignal((value) => value + 1);
              }}
            >
              <MapTrifold size={17} weight="bold" aria-hidden />
              {desktopMapOpen ? '지도 닫기' : '지도 보기'}
            </button>
          </div>
        </div>

        <div className={styles.mobileToolbar}>
          <span><strong>{resultCount.toLocaleString('ko-KR')}</strong>곳</span>
          <button
            ref={filterTriggerRef}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={filterOpen}
            onClick={() => setFilterOpen(true)}
          >
            <FunnelSimple size={16} weight="bold" aria-hidden />
            필터
          </button>
          <button
            ref={mapTriggerRef}
            type="button"
            aria-controls="onsen-results-map-panel"
            aria-haspopup="dialog"
            aria-expanded={mobileMapOpen}
            onClick={() => {
              setMobileMapOpen(true);
              setMapResizeSignal((value) => value + 1);
            }}
          >
            <MapTrifold size={16} weight="bold" aria-hidden />
            지도
          </button>
          <OnsenResultsSort value={sort} compact />
        </div>

        <div className={styles.resultsBody}>
          <div className={styles.listPane}>{children}</div>
          <aside
            ref={mapPanelRef}
            id="onsen-results-map-panel"
            className={`${styles.mapPanel}${desktopMapOpen ? ` ${styles.mapDesktopOpen}` : ''}${mobileMapOpen ? ` ${styles.mapMobileOpen}` : ''}`}
            aria-label="검색 결과 지도"
            aria-hidden={!mapVisible}
            role={isNarrow === true && mobileMapOpen ? 'dialog' : undefined}
            aria-modal={isNarrow === true && mobileMapOpen ? 'true' : undefined}
          >
            <header className={styles.mapHead}>
              <div>
                <span><MapTrifold size={16} weight="bold" aria-hidden />지도</span>
                <strong>{visibleResultCount.toLocaleString('ko-KR')}곳 표시</strong>
              </div>
              <button
                type="button"
                aria-label="지도 닫기"
                title="지도 닫기"
                onClick={() => {
                  if (isNarrow === true) {
                    setMobileMapOpen(false);
                    window.setTimeout(() => mapTriggerRef.current?.focus(), 0);
                  } else {
                    setDesktopMapOpen(false);
                  }
                }}
              >
                <X size={20} aria-hidden />
              </button>
            </header>
            {mapVisible ? (
              <OnsenResultsMap points={mapPoints} resizeSignal={mapResizeSignal} onSelectPoint={handleSelectPoint} />
            ) : null}
            <p className={styles.mapNote}>
              <CursorClick size={15} weight="bold" aria-hidden />
              온천지·권역 기준 위치입니다.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
