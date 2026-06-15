'use client';

export type WebAnalyticsEventName =
  | 'content_card_clicked'
  | 'content_feedback_removed'
  | 'content_feedback_submitted'
  | 'content_saved'
  | 'content_unsaved'
  | 'explore_filter_used'
  | 'app_cta_clicked'
  | 'app_store_clicked';

type AnalyticsParams = Record<string, boolean | number | string | string[] | null | undefined>;

declare global {
  interface Window {
    gtag?: (command: 'config' | 'event', target: string, params?: AnalyticsParams) => void;
  }
}

export function trackWebEvent(eventName: WebAnalyticsEventName, params: AnalyticsParams = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  window.gtag('event', eventName, {
    ...params,
    path: window.location.pathname,
  });
}
