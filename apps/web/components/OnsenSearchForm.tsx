'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClockCounterClockwise, MagnifyingGlass, MapPin, X } from '@phosphor-icons/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { localizedPath, type BathtimeLocale } from '@web/lib/i18n';
import type { OnsenSearchSuggestion } from '@web/lib/onsenSearch';

export type { OnsenSearchSuggestion } from '@web/lib/onsenSearch';

type PopularSearch = {
  label: string;
  href: string;
};

type Props = {
  suggestions: OnsenSearchSuggestion[];
  recommendedPlaces: OnsenSearchSuggestion[];
  popularSearches: PopularSearch[];
  initialQuery?: string;
  variant?: 'default' | 'header';
  panelMode?: 'full' | 'autocomplete';
  locale?: BathtimeLocale;
};

const recentStorageKey = 'bathtime:onsen-recent-searches';

const searchCopy = {
  ko: {
    open: '온천 검색 열기', search: '온천 검색', where: '어디로', headerPlaceholder: '온천지, 숙소·시설 이름',
    placeholder: '유후인, 도쿄, 구사쓰', queryLabel: '온천 검색어', suggestions: '온천 검색 제안', close: '검색 닫기',
    autocomplete: '자동완성', noMatch: '일치하는 후보가 아직 없습니다. 검색어로 결과를 볼 수 있어요.', recent: '최근 검색어',
    recommended: '추천 지역', popular: '추천 검색어',
  },
  en: {
    open: 'Open onsen search', search: 'Search', where: 'Where', headerPlaceholder: 'Onsen town, stay, or facility',
    placeholder: 'Yufuin, Tokyo, Kusatsu', queryLabel: 'Search onsen', suggestions: 'Onsen search suggestions', close: 'Close search',
    autocomplete: 'Suggestions', noMatch: 'No exact match yet. You can still search with this phrase.', recent: 'Recent searches',
    recommended: 'Recommended areas', popular: 'Popular searches',
  },
} as const;

function readRecentSearches() {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(recentStorageKey) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string').slice(0, 5) : [];
  } catch {
    return [];
  }
}

function writeRecentSearch(value: string) {
  if (typeof window === 'undefined') return;
  const next = [value, ...readRecentSearches().filter((item) => item !== value)].slice(0, 5);
  window.localStorage.setItem(recentStorageKey, JSON.stringify(next));
}

export function OnsenSearchForm({ suggestions, recommendedPlaces, popularSearches, initialQuery = '', variant = 'default', panelMode = 'full', locale = 'ko' }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const copy = searchCopy[locale];
  const resultsPath = localizedPath('/onsen/results', locale);

  useEffect(() => {
    setRecentSearches(readRecentSearches());
  }, []);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!formRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const autocompleteItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return [];
    return suggestions
      .filter((item) =>
        item.label.toLowerCase().includes(keyword) ||
        item.description?.toLowerCase().includes(keyword) ||
        item.keywords?.some((value) => value.toLowerCase().includes(keyword))
      )
      .slice(0, 6);
  }, [query, suggestions]);

  const submitQuery = (value = query) => {
    const trimmed = value.trim();
    if (trimmed) writeRecentSearch(trimmed);
    router.push(trimmed ? `${resultsPath}?query=${encodeURIComponent(trimmed)}` : resultsPath);
  };

  const closeMobile = () => setMobileOpen(false);
  const isHeaderVariant = variant === 'header';
  const isAutocompleteMode = panelMode === 'autocomplete';
  const hasQuery = query.trim().length > 0;
  const desktopPanelMode = isAutocompleteMode && hasQuery ? 'autocomplete' : 'full';
  const formClassName = [
    'onsen-search-box',
    'onsen-search-box-airbnb',
    isHeaderVariant ? 'onsen-search-box-header' : '',
    desktopPanelMode === 'autocomplete' ? 'onsen-search-box-autocomplete' : '',
    open ? 'is-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {isHeaderVariant ? (
        <button
          className="onsen-header-mobile-search-button"
          type="button"
          aria-label={copy.open}
          title={copy.search}
          onClick={() => setMobileOpen(true)}
        >
          <MagnifyingGlass size={20} weight="regular" aria-hidden="true" />
        </button>
      ) : null}
      <form
        ref={formRef}
        className={formClassName}
        action={resultsPath}
        onSubmit={(event) => {
          event.preventDefault();
          submitQuery();
        }}
      >
        <label className="onsen-search-field onsen-search-field-main">
          <span>{copy.where}</span>
          <input
            ref={inputRef}
            name="query"
            type="search"
            value={query}
            onFocus={() => {
              if (window.matchMedia('(max-width: 767px)').matches) {
                setMobileOpen(true);
                return;
              }
              setOpen(true);
            }}
            onChange={(event) => {
              const nextQuery = event.target.value;
              setQuery(nextQuery);
              setOpen(true);
            }}
            placeholder={isHeaderVariant ? copy.headerPlaceholder : copy.placeholder}
            aria-label={copy.queryLabel}
            autoComplete="off"
          />
        </label>

        <button type="submit" aria-label={copy.search}>
          <MagnifyingGlass size={20} weight="bold" aria-hidden="true" />
          <span>{copy.search}</span>
        </button>

        <div className="onsen-search-popover" aria-label={copy.suggestions}>
          <SearchPanelContent
            query={query}
            autocompleteItems={autocompleteItems}
            recommendedPlaces={recommendedPlaces}
            popularSearches={popularSearches}
            recentSearches={recentSearches}
            mode={desktopPanelMode}
            locale={locale}
            onPick={(label) => {
              writeRecentSearch(label);
              setRecentSearches(readRecentSearches());
            }}
          />
        </div>
      </form>

      {mobileOpen ? (
        <div className="onsen-mobile-search-sheet" role="dialog" aria-modal="true" aria-label={copy.search}>
          <div className="onsen-mobile-search-head">
            <button type="button" aria-label={copy.close} onClick={closeMobile}>
              <X size={22} weight="bold" aria-hidden="true" />
            </button>
            <form
              action={resultsPath}
              onSubmit={(event) => {
                event.preventDefault();
                closeMobile();
                submitQuery();
              }}
            >
              <input
                ref={inputRef}
                name="query"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy.headerPlaceholder}
                aria-label={copy.queryLabel}
                autoComplete="off"
              />
              <button type="submit" aria-label={copy.search}>
                <MagnifyingGlass size={22} aria-hidden="true" />
              </button>
            </form>
          </div>
          <SearchPanelContent
            query={query}
            autocompleteItems={autocompleteItems}
            recommendedPlaces={recommendedPlaces}
            popularSearches={popularSearches}
            recentSearches={recentSearches}
            mode="full"
            locale={locale}
            onPick={(label) => {
              writeRecentSearch(label);
              setRecentSearches(readRecentSearches());
              closeMobile();
            }}
          />
        </div>
      ) : null}
    </>
  );
}

function SearchPanelContent({
  query,
  autocompleteItems,
  recommendedPlaces,
  popularSearches,
  recentSearches,
  mode,
  locale,
  onPick,
}: {
  query: string;
  autocompleteItems: OnsenSearchSuggestion[];
  recommendedPlaces: OnsenSearchSuggestion[];
  popularSearches: PopularSearch[];
  recentSearches: string[];
  mode: 'full' | 'autocomplete';
  locale: BathtimeLocale;
  onPick: (label: string) => void;
}) {
  const copy = searchCopy[locale];
  const resultsPath = localizedPath('/onsen/results', locale);

  return (
    <div className="onsen-search-panel-content">
      {query.trim() ? (
        <section className="onsen-popover-section onsen-autocomplete-section" aria-labelledby="onsen-autocomplete-title">
          <div className="onsen-popover-section-head">
            <MagnifyingGlass size={18} weight="bold" aria-hidden="true" />
            <strong id="onsen-autocomplete-title">{copy.autocomplete}</strong>
          </div>
          {autocompleteItems.length > 0 ? (
            <div className="onsen-place-suggestion-list">
              {autocompleteItems.map((item) => (
                <Link key={`${item.kind}-${item.label}`} href={item.href} onClick={() => onPick(item.label)}>
                  <span className="onsen-place-icon" aria-hidden="true">
                    <MapPin size={18} weight="bold" />
                  </span>
                  <span>
                    <strong>{item.label}</strong>
                    {item.description ? <small>{item.description}</small> : null}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="onsen-empty-recent">{copy.noMatch}</p>
          )}
        </section>
      ) : null}

      {mode === 'full' && recentSearches.length > 0 ? (
        <section className="onsen-popover-section onsen-recent-section" aria-labelledby="onsen-recent-title">
          <div className="onsen-popover-section-head">
            <ClockCounterClockwise size={18} weight="bold" aria-hidden="true" />
            <strong id="onsen-recent-title">{copy.recent}</strong>
          </div>
          <div className="onsen-recent-list">
            {recentSearches.map((item) => (
              <Link key={item} href={`${resultsPath}?query=${encodeURIComponent(item)}`} onClick={() => onPick(item)}>
                {item}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {mode === 'full' ? (
        <section className="onsen-popover-section onsen-recommend-section" aria-labelledby="onsen-recommend-title">
          <div className="onsen-popover-section-head">
            <MapPin size={18} weight="bold" aria-hidden="true" />
            <strong id="onsen-recommend-title">{copy.recommended}</strong>
          </div>
          <div className="onsen-place-suggestion-list">
            {recommendedPlaces.map((item) => (
              <Link key={item.label} href={item.href} onClick={() => onPick(item.label)}>
                <span className={item.imageUrl ? 'onsen-place-icon onsen-place-image' : 'onsen-place-icon'} aria-hidden="true">
                  {item.imageUrl ? <Image src={item.imageUrl} alt="" width={64} height={48} sizes="64px" /> : <MapPin size={18} weight="bold" />}
                </span>
                <span>
                  <strong>{item.label}</strong>
                  {item.description ? <small>{item.description}</small> : null}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {mode === 'full' ? (
        <section className="onsen-popover-section onsen-popular-section" aria-labelledby="onsen-popular-title">
          <div className="onsen-popover-section-head">
            <MagnifyingGlass size={18} weight="bold" aria-hidden="true" />
            <strong id="onsen-popular-title">{copy.popular}</strong>
          </div>
          <div className="onsen-popular-search-list">
            {popularSearches.map((item, index) => (
              <Link key={item.label} href={item.href} onClick={() => onPick(item.label)}>
                <span>{index + 1}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
