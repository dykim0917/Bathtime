'use client';

import { trackWebEvent, type AnalyticsParams, type WebAnalyticsEventName } from './analytics';
import { normalizeOnsenEntryIntent, type OnsenEntryIntentValue } from './onsenIntent';

const storageKey = 'bathtime:onsen-attribution';

type OnsenAttribution = {
  entryIntent: OnsenEntryIntentValue;
  experimentId: string;
  variant: string;
};

const defaultAttribution: OnsenAttribution = {
  entryIntent: 'unknown',
  experimentId: 'onsen_pmf_reframe_v1',
  variant: 'decision_first_v1',
};

export type OnsenAnalyticsEventName = Extract<WebAnalyticsEventName, `onsen_${string}`>;

export function readOnsenAttribution(): OnsenAttribution {
  if (typeof window === 'undefined') return defaultAttribution;
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(storageKey) ?? '{}') as Partial<OnsenAttribution>;
    return {
      entryIntent: normalizeOnsenEntryIntent(stored.entryIntent),
      experimentId: typeof stored.experimentId === 'string' && stored.experimentId ? stored.experimentId : defaultAttribution.experimentId,
      variant: typeof stored.variant === 'string' && stored.variant ? stored.variant : defaultAttribution.variant,
    };
  } catch {
    return defaultAttribution;
  }
}

export function writeOnsenAttribution(entryIntent: OnsenEntryIntentValue) {
  if (typeof window === 'undefined' || entryIntent === 'unknown') return;
  window.sessionStorage.setItem(storageKey, JSON.stringify({
    ...readOnsenAttribution(),
    entryIntent,
  }));
}

export function trackOnsenEvent(eventName: OnsenAnalyticsEventName, params: AnalyticsParams = {}) {
  const attribution = readOnsenAttribution();
  trackWebEvent(eventName, {
    entry_intent: attribution.entryIntent,
    experiment_id: attribution.experimentId,
    variant: attribution.variant,
    ...params,
  });
}
