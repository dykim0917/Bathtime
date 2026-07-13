'use client';

import Link, { type LinkProps } from 'next/link';
import { useEffect, useRef, type MouseEventHandler, type ReactNode } from 'react';
import { trackOnsenEvent, writeOnsenAttribution } from '@web/lib/onsenAnalytics';
import { normalizeOnsenEntryIntent, type OnsenEntryIntentValue } from '@web/lib/onsenIntent';

type CommonEventProps = {
  entryIntent?: OnsenEntryIntentValue;
  entityType?: 'accommodation' | 'facility';
  targetSlug?: string;
  onsenArea?: string;
  sourceComponent: string;
};

export function OnsenEntryImpression({ entryIntent, sourceComponent }: Required<Pick<CommonEventProps, 'entryIntent' | 'sourceComponent'>>) {
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current || entryIntent === 'unknown') return;
    tracked.current = true;
    trackOnsenEvent('onsen_entry_impression', {
      entry_intent: entryIntent,
      source_component: sourceComponent,
    });
  }, [entryIntent, sourceComponent]);
  return null;
}

export function OnsenIntentLink({
  entryIntent,
  sourceComponent,
  children,
  onClick,
  ...props
}: LinkProps & {
  entryIntent: Exclude<OnsenEntryIntentValue, 'unknown'>;
  sourceComponent: string;
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        writeOnsenAttribution(entryIntent);
        trackOnsenEvent('onsen_entry_click', {
          entry_intent: entryIntent,
          source_component: sourceComponent,
        });
        onClick?.(event);
      }}
    >
      {children}
    </Link>
  );
}

export function OnsenResultsAnalytics({
  entryIntent,
  activeFilters,
  queryType,
}: {
  entryIntent: OnsenEntryIntentValue;
  activeFilters: string[];
  queryType: 'empty' | 'text';
}) {
  useEffect(() => {
    if (entryIntent !== 'unknown') writeOnsenAttribution(entryIntent);
    trackOnsenEvent('onsen_search_submitted', {
      entry_intent: entryIntent,
      active_filters: activeFilters,
      search_query_type: queryType,
      source_component: 'onsen_results',
    });
  }, [activeFilters, entryIntent, queryType]);
  return null;
}

export function OnsenResultImpression({
  entryIntent,
  entityType,
  targetSlug,
  onsenArea,
  sourceComponent,
  resultPosition,
  decisionFactCoverage,
}: CommonEventProps & { resultPosition: number; decisionFactCoverage: number }) {
  const markerRef = useRef<HTMLSpanElement>(null);
  const tracked = useRef(false);

  useEffect(() => {
    const card = markerRef.current?.closest('[data-onsen-result-card]');
    if (!card || tracked.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting) || tracked.current) return;
      tracked.current = true;
      trackOnsenEvent('onsen_result_impression', {
        entry_intent: entryIntent,
        entity_type: entityType,
        target_slug: targetSlug,
        onsen_area: onsenArea,
        source_component: sourceComponent,
        result_position: resultPosition,
        decision_fact_coverage: decisionFactCoverage,
      });
      observer.disconnect();
    }, { threshold: 0.25 });
    observer.observe(card);
    return () => observer.disconnect();
  }, [decisionFactCoverage, entityType, entryIntent, onsenArea, resultPosition, sourceComponent, targetSlug]);

  return <span ref={markerRef} hidden aria-hidden="true" />;
}

export function OnsenDetailAnalytics({
  entryIntent,
  entityType,
  targetSlug,
  onsenArea,
  decisionFactCoverage,
}: CommonEventProps & { decisionFactCoverage: number }) {
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    const normalizedIntent = normalizeOnsenEntryIntent(entryIntent);
    if (normalizedIntent !== 'unknown') writeOnsenAttribution(normalizedIntent);
    trackOnsenEvent('onsen_detail_view', {
      entry_intent: normalizedIntent,
      entity_type: entityType,
      target_slug: targetSlug,
      onsen_area: onsenArea,
      source_component: 'onsen_detail',
      decision_fact_coverage: decisionFactCoverage,
    });
  }, [decisionFactCoverage, entityType, entryIntent, onsenArea, targetSlug]);
  return null;
}

export function OnsenTrackedExternalLink({
  actionType,
  entryIntent = 'unknown',
  entityType,
  targetSlug,
  onsenArea,
  sourceComponent,
  children,
  onClick,
  ...props
}: CommonEventProps & {
  actionType: 'booking' | 'price_check' | 'official' | 'map' | 'ticket';
  children: ReactNode;
  href: string;
  className?: string;
  target?: string;
  rel?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  return (
    <a
      {...props}
      onClick={(event) => {
        trackOnsenEvent(entityType === 'facility' ? 'onsen_facility_action_click' : 'onsen_booking_click', {
          entry_intent: entryIntent,
          entity_type: entityType,
          target_slug: targetSlug,
          onsen_area: onsenArea,
          source_component: sourceComponent,
          action_type: actionType,
        });
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}

export function OnsenDecisionFactDetails({
  entryIntent = 'unknown',
  entityType,
  targetSlug,
  onsenArea,
  sourceComponent,
  factCode,
  className,
  children,
  open,
}: CommonEventProps & {
  factCode: string;
  className?: string;
  children: ReactNode;
  open?: boolean;
}) {
  const tracked = useRef(false);
  return (
    <details
      className={className}
      open={open}
      onToggle={(event) => {
        if (!event.currentTarget.open || tracked.current) return;
        tracked.current = true;
        trackOnsenEvent('onsen_decision_fact_opened', {
          entry_intent: entryIntent,
          entity_type: entityType,
          target_slug: targetSlug,
          onsen_area: onsenArea,
          source_component: sourceComponent,
          fact_code: factCode,
        });
      }}
    >
      {children}
    </details>
  );
}
