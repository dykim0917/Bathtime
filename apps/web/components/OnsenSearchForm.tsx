'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClockCounterClockwise, MagnifyingGlass, MapPin, X } from '@phosphor-icons/react';
import { useEffect, useMemo, useRef, useState } from 'react';
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
};

const recentStorageKey = 'bathtime:onsen-recent-searches';

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

export function OnsenSearchForm({ suggestions, recommendedPlaces, popularSearches }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setRecentSearches(readRecentSearches());
  }, []);

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
      .filter((item) => item.label.toLowerCase().includes(keyword) || item.description?.toLowerCase().includes(keyword))
      .slice(0, 6);
  }, [query, suggestions]);

  const submitQuery = (value = query) => {
    const trimmed = value.trim();
    if (trimmed) writeRecentSearch(trimmed);
    router.push(trimmed ? `/onsen/results?query=${encodeURIComponent(trimmed)}` : '/onsen/results');
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <form
        ref={formRef}
        className={open ? 'onsen-search-box onsen-search-box-airbnb is-open' : 'onsen-search-box onsen-search-box-airbnb'}
        action="/onsen/results"
        onSubmit={(event) => {
          event.preventDefault();
          submitQuery();
        }}
      >
        <button
          className="onsen-search-field onsen-search-field-main"
          type="button"
          onClick={() => {
            if (window.matchMedia('(max-width: 767px)').matches) {
              setMobileOpen(true);
              return;
            }
            setOpen(true);
            window.setTimeout(() => inputRef.current?.focus(), 0);
          }}
        >
          <span>어디로</span>
          <strong>{query || '유후인, 벳푸, 서울 근교 온천'}</strong>
        </button>

        <button type="submit" aria-label="온천 검색">
          <MagnifyingGlass size={20} weight="bold" aria-hidden="true" />
          <span>검색</span>
        </button>

        <div className="onsen-search-popover" aria-label="온천 검색 제안">
          <div className="onsen-popover-search-row">
            <MagnifyingGlass size={18} aria-hidden="true" />
            <input
              ref={inputRef}
              name="query"
              type="search"
              value={query}
              onFocus={() => setOpen(true)}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="온천지, 지역, 숙소 이름을 입력하세요"
              aria-label="온천 검색어"
              autoComplete="off"
            />
          </div>
          <SearchPanelContent
            query={query}
            autocompleteItems={autocompleteItems}
            recommendedPlaces={recommendedPlaces}
            popularSearches={popularSearches}
            recentSearches={recentSearches}
            onPick={(label) => {
              writeRecentSearch(label);
              setRecentSearches(readRecentSearches());
            }}
          />
        </div>
      </form>

      {mobileOpen ? (
        <div className="onsen-mobile-search-sheet" role="dialog" aria-modal="true" aria-label="온천 검색">
          <div className="onsen-mobile-search-head">
            <button type="button" aria-label="검색 닫기" onClick={closeMobile}>
              <X size={22} weight="bold" aria-hidden="true" />
            </button>
            <form
              action="/onsen/results"
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
                placeholder="유후인, 벳푸, 숙소 이름"
                aria-label="온천 검색어"
                autoComplete="off"
              />
              <button type="submit" aria-label="검색">
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
  onPick,
}: {
  query: string;
  autocompleteItems: OnsenSearchSuggestion[];
  recommendedPlaces: OnsenSearchSuggestion[];
  popularSearches: PopularSearch[];
  recentSearches: string[];
  onPick: (label: string) => void;
}) {
  return (
    <div className="onsen-search-panel-content">
      {query.trim() ? (
        <section className="onsen-popover-section onsen-autocomplete-section" aria-labelledby="onsen-autocomplete-title">
          <div className="onsen-popover-section-head">
            <MagnifyingGlass size={18} weight="bold" aria-hidden="true" />
            <strong id="onsen-autocomplete-title">자동완성</strong>
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
            <p className="onsen-empty-recent">일치하는 후보가 아직 없습니다. 검색어로 결과를 볼 수 있어요.</p>
          )}
        </section>
      ) : null}

      <section className="onsen-popover-section" aria-labelledby="onsen-recent-title">
        <div className="onsen-popover-section-head">
          <ClockCounterClockwise size={18} weight="bold" aria-hidden="true" />
          <strong id="onsen-recent-title">최근 검색어</strong>
        </div>
        {recentSearches.length > 0 ? (
          <div className="onsen-recent-list">
            {recentSearches.map((item) => (
              <Link key={item} href={`/onsen/results?query=${encodeURIComponent(item)}`} onClick={() => onPick(item)}>
                {item}
              </Link>
            ))}
          </div>
        ) : (
          <p className="onsen-empty-recent">최근 검색어가 없습니다.</p>
        )}
      </section>

      <section className="onsen-popover-section" aria-labelledby="onsen-recommend-title">
        <div className="onsen-popover-section-head">
          <MapPin size={18} weight="bold" aria-hidden="true" />
          <strong id="onsen-recommend-title">추천 지역</strong>
        </div>
        <div className="onsen-place-suggestion-list">
          {recommendedPlaces.map((item) => (
            <Link key={item.label} href={item.href} onClick={() => onPick(item.label)}>
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
      </section>

      <section className="onsen-popover-section" aria-labelledby="onsen-popular-title">
        <div className="onsen-popover-section-head">
          <MagnifyingGlass size={18} weight="bold" aria-hidden="true" />
          <strong id="onsen-popular-title">인기 검색어</strong>
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
    </div>
  );
}
