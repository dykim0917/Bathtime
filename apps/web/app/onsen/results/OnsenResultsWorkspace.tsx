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
import { type MouseEvent as ReactMouseEvent, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { SelectBox, type SelectBoxOption } from '@web/components/SelectBox';
import type { BathtimeLocale } from '@web/lib/i18n';
import { trackOnsenEvent } from '@web/lib/onsenAnalytics';
import type { OnsenMapPoint } from '@web/lib/onsenMap';
import styles from './results.module.css';

const OnsenResultsMap = dynamic(
  () => import('./OnsenResultsMap').then((module) => module.OnsenResultsMap),
  { ssr: false }
);

export type OnsenResultsSortValue = 'recommended' | 'reviews' | 'water' | 'name';

const sortOptions: SelectBoxOption<OnsenResultsSortValue>[] = [
  { value: 'recommended', label: '바스타임 추천순' },
  { value: 'reviews', label: '후기 많이 읽은 순' },
  { value: 'water', label: '온천수 방식 우선' },
  { value: 'name', label: '이름순' },
];

const compactSortOptions: SelectBoxOption<OnsenResultsSortValue>[] = [
  { value: 'recommended', label: '추천순' },
  { value: 'reviews', label: '후기순' },
  { value: 'water', label: '온천수순' },
  { value: 'name', label: '이름순' },
];

const sortOptionsEn: SelectBoxOption<OnsenResultsSortValue>[] = [
  { value: 'recommended', label: 'Bathtime recommended' },
  { value: 'reviews', label: 'Most reviews read' },
  { value: 'water', label: 'Water system first' },
  { value: 'name', label: 'Name' },
];

const compactSortOptionsEn: SelectBoxOption<OnsenResultsSortValue>[] = [
  { value: 'recommended', label: 'Best match' },
  { value: 'reviews', label: 'Reviews' },
  { value: 'water', label: 'Water' },
  { value: 'name', label: 'Name' },
];

type OnsenResultsFilterActionProps = {
  active: boolean;
  children: ReactNode;
  className?: string;
  href: string;
};

export function OnsenResultsFilterAction({
  active,
  children,
  className,
  href,
}: OnsenResultsFilterActionProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={className}
      aria-pressed={active}
      onClick={() => {
        trackOnsenEvent('onsen_filter_applied', {
          source_component: 'onsen_results_filter',
          action_type: active ? 'remove' : 'add',
          filter_href: href,
        });
        router.push(href);
      }}
    >
      {children}
    </button>
  );
}

type OnsenResultsSortProps = {
  value: OnsenResultsSortValue;
  compact?: boolean;
  locale?: BathtimeLocale;
};

export function OnsenResultsSort({ value, compact = false, locale = 'ko' }: OnsenResultsSortProps) {
  const router = useRouter();

  return (
    <SelectBox
      className={compact ? styles.sortCompact : styles.sortControl}
      value={value}
      options={locale === 'en' ? (compact ? compactSortOptionsEn : sortOptionsEn) : (compact ? compactSortOptions : sortOptions)}
      ariaLabel={locale === 'en' ? 'Sort results' : '결과 정렬'}
      label={compact ? undefined : locale === 'en' ? 'Sort' : '정렬'}
      leadingIcon={compact ? <ArrowsDownUp size={16} weight="bold" aria-hidden /> : undefined}
      compact={compact}
      onChange={(nextSort) => {
          trackOnsenEvent('onsen_filter_applied', {
            source_component: 'onsen_results_sort',
            action_type: 'sort',
            filter_value: nextSort,
          });
          const nextParams = new URLSearchParams(window.location.search);
          if (nextSort === 'recommended') nextParams.delete('sort');
          else nextParams.set('sort', nextSort);
          nextParams.delete('page');
          const query = nextParams.toString();
          router.push(query ? `${window.location.pathname}?${query}` : window.location.pathname);
      }}
    />
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
  locale?: BathtimeLocale;
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
  locale = 'ko',
}: OnsenResultsWorkspaceProps) {
  const router = useRouter();
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

  const handleResultLinkClick = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    if (!(event.target instanceof Element)) return;

    const link = event.target.closest<HTMLAnchorElement>('a[data-return-href]');
    const href = link?.getAttribute('href');
    const returnHref = link?.dataset.returnHref;
    if (!href || !returnHref) return;

    if (link.dataset.onsenResultLink === 'true') {
      trackOnsenEvent('onsen_result_click', {
        entry_intent: link.dataset.entryIntent,
        entity_type: link.dataset.entityType,
        target_slug: link.dataset.targetSlug,
        onsen_area: link.dataset.onsenArea,
        source_component: 'onsen_results_card',
        result_position: Number(link.dataset.resultPosition || 0),
        decision_fact_coverage: Number(link.dataset.decisionFactCoverage || 0),
        has_price: link.dataset.hasPrice === 'true',
      });
    }

    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    const nextUrl = new URL(href, window.location.origin);
    nextUrl.searchParams.set('from', returnHref);
    router.push(`${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
  }, [router]);

  const mapVisible = isNarrow === null ? false : isNarrow ? mobileMapOpen : desktopMapOpen;

  return (
    <section className={styles.workspace} aria-label={locale === 'en' ? 'Onsen results and filters' : '온천 검색 결과와 필터'}>
      <aside
        ref={filterPanelRef}
        className={`${styles.filterPanel}${filterOpen ? ` ${styles.filterPanelOpen}` : ''}`}
        aria-label={locale === 'en' ? 'Search result filters' : '검색 결과 필터'}
        aria-hidden={isNarrow === true && !filterOpen}
        role={isNarrow === true && filterOpen ? 'dialog' : undefined}
        aria-modal={isNarrow === true && filterOpen ? 'true' : undefined}
      >
        <header className={styles.filterHead}>
          <div>
            <FunnelSimple size={18} weight="bold" aria-hidden />
            <strong>{locale === 'en' ? 'Filters' : '필터'}</strong>
          </div>
          {hasFilters ? (
            <Link className={styles.resetAction} href={resetHref} prefetch={false} rel="nofollow">
              <ArrowCounterClockwise size={15} weight="bold" aria-hidden />
              {locale === 'en' ? 'Reset' : '초기화'}
            </Link>
          ) : (
            <span className={styles.resetAction} aria-disabled="true">{locale === 'en' ? 'Reset' : '초기화'}</span>
          )}
          <button
            className={styles.filterClose}
            type="button"
            aria-label={locale === 'en' ? 'Close filters' : '필터 닫기'}
            title={locale === 'en' ? 'Close filters' : '필터 닫기'}
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
            {locale === 'en' ? `Show ${resultCount.toLocaleString('en-US')} results` : `${resultCount.toLocaleString('ko-KR')}곳 결과 보기`}
          </button>
        </footer>
      </aside>

      <div className={`${styles.resultsColumn}${desktopMapOpen ? ` ${styles.mapIsOpen}` : ''}`}>
        <div className={styles.listControl}>
          <p>
            <strong>{rangeStart === rangeEnd ? rangeStart : `${rangeStart}${locale === 'en' ? '-' : '~'}${rangeEnd}`}</strong>
            <span> / {resultCount.toLocaleString(locale === 'en' ? 'en-US' : 'ko-KR')}{locale === 'en' ? '' : '곳'}</span>
          </p>
          <div>
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
              {desktopMapOpen ? (locale === 'en' ? 'Close map' : '지도 닫기') : (locale === 'en' ? 'Show map' : '지도 보기')}
            </button>
          </div>
        </div>

        <div className={styles.mobileToolbar}>
          <span><strong>{resultCount.toLocaleString(locale === 'en' ? 'en-US' : 'ko-KR')}</strong>{locale === 'en' ? ' results' : '곳'}</span>
          <button
            ref={filterTriggerRef}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={filterOpen}
            onClick={() => setFilterOpen(true)}
          >
            <FunnelSimple size={16} weight="bold" aria-hidden />
            {locale === 'en' ? 'Filters' : '필터'}
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
            {locale === 'en' ? 'Map' : '지도'}
          </button>
          <OnsenResultsSort value={sort} compact locale={locale} />
        </div>

        <div className={styles.resultsBody}>
          <div className={styles.listPane} onClickCapture={handleResultLinkClick}>{children}</div>
          <aside
            ref={mapPanelRef}
            id="onsen-results-map-panel"
            className={`${styles.mapPanel}${desktopMapOpen ? ` ${styles.mapDesktopOpen}` : ''}${mobileMapOpen ? ` ${styles.mapMobileOpen}` : ''}`}
            aria-label={locale === 'en' ? 'Search result map' : '검색 결과 지도'}
            aria-hidden={!mapVisible}
            role={isNarrow === true && mobileMapOpen ? 'dialog' : undefined}
            aria-modal={isNarrow === true && mobileMapOpen ? 'true' : undefined}
          >
            <header className={styles.mapHead}>
              <div>
                <span><MapTrifold size={16} weight="bold" aria-hidden />{locale === 'en' ? 'Map' : '지도'}</span>
                <strong>{locale === 'en' ? `${visibleResultCount.toLocaleString('en-US')} shown` : `${visibleResultCount.toLocaleString('ko-KR')}곳 표시`}</strong>
              </div>
              <button
                type="button"
                aria-label={locale === 'en' ? 'Close map' : '지도 닫기'}
                title={locale === 'en' ? 'Close map' : '지도 닫기'}
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
              <OnsenResultsMap points={mapPoints} resizeSignal={mapResizeSignal} onSelectPoint={handleSelectPoint} locale={locale} />
            ) : null}
            <p className={styles.mapNote}>
              <CursorClick size={15} weight="bold" aria-hidden />
              {locale === 'en' ? 'Locations are approximate, based on the onsen area.' : '온천지·권역 기준 위치입니다.'}
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
