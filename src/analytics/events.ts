import { ActiveState, BathEnvironment, FallbackStrategy, HomeSuggestionRank } from '@/src/engine/types';

interface CommonEventProperties {
  user_id: string;
  session_id: string;
  app_version: string;
  locale: string;
  time_context: 'late_night' | 'morning' | 'day' | 'evening';
  environment: BathEnvironment;
  partial_bath_subtype: 'low_leg' | 'footbath' | null;
  active_state: ActiveState;
  mode_type: 'sleep' | 'reset' | 'recovery' | 'trip';
  suggestion_id: string;
  suggestion_rank: HomeSuggestionRank;
  fallback_strategy_applied: FallbackStrategy;
  experiment_id: string;
  variant: string;
  ts: string;
  intent_id?: string;
  intent_domain?: 'care' | 'trip';
  subprotocol_id?: string;
  section_order?: 'care_first' | 'trip_first';
  card_position?: number;
}

export interface RecommendationCardEventPayload extends CommonEventProperties {
  engine_source: 'care' | 'trip';
}

export interface CommerceEventPayload extends CommonEventProperties {
  product_id: string;
  slot: 'A' | 'B' | 'C';
  price_tier: 'low' | 'mid' | 'high';
  sommelier_pick: boolean;
}

const REQUIRED_COMMON_KEYS: (keyof CommonEventProperties)[] = [
  'user_id',
  'session_id',
  'app_version',
  'locale',
  'time_context',
  'environment',
  'partial_bath_subtype',
  'active_state',
  'mode_type',
  'suggestion_id',
  'suggestion_rank',
  'fallback_strategy_applied',
  'experiment_id',
  'variant',
  'ts',
];

const NULLABLE_COMMON_KEYS: (keyof CommonEventProperties)[] = [
  'partial_bath_subtype',
];

function validateCommonProperties(payload: CommonEventProperties): void {
  const missing = REQUIRED_COMMON_KEYS.filter((key) => {
    if (payload[key] === undefined) return true;
    if (payload[key] === null && !NULLABLE_COMMON_KEYS.includes(key)) return true;
    return false;
  });
  if (missing.length > 0) {
    console.warn('[analytics] missing common_properties', missing.join(', '));
  }
}

function validateCommerceProperties(payload: CommerceEventPayload): void {
  validateCommonProperties(payload);
  if (!payload.product_id) {
    console.warn('[analytics] missing commerce property: product_id');
  }
}

function emit(eventName: string, payload: RecommendationCardEventPayload): void {
  validateCommonProperties(payload);
  if (__DEV__) {
    console.log(`[analytics] ${eventName}`, payload);
  }
}

function emitCommerce(eventName: string, payload: CommerceEventPayload): void {
  validateCommerceProperties(payload);
  if (__DEV__) {
    console.log(`[analytics] ${eventName}`, payload);
  }
}

export function trackRecommendationCardImpression(payload: RecommendationCardEventPayload): void {
  emit('recommendation_card_impression', payload);
}

export function trackRecommendationCardClick(payload: RecommendationCardEventPayload): void {
  emit('recommendation_card_click', payload);
}

export function trackIntentCardImpression(payload: RecommendationCardEventPayload): void {
  emit('intent_card_impression', payload);
}

export function trackIntentCardClick(payload: RecommendationCardEventPayload): void {
  emit('intent_card_click', payload);
}

export function trackSubprotocolModalOpen(payload: RecommendationCardEventPayload): void {
  emit('subprotocol_modal_open', payload);
}

export function trackSubprotocolSelected(payload: RecommendationCardEventPayload): void {
  emit('subprotocol_selected', payload);
}

export function trackRoutineStartAfterSubprotocol(payload: RecommendationCardEventPayload): void {
  emit('routine_start_after_subprotocol', payload);
}

export function trackRoutineStart(payload: RecommendationCardEventPayload): void {
  emit('routine_start', payload);
}

export function trackWhyExplainerExposed(payload: RecommendationCardEventPayload): void {
  emit('why_explainer_exposed', payload);
}

export function trackRoutineStartedAfterWhy(payload: RecommendationCardEventPayload): void {
  emit('routine_started_after_why', payload);
}

export function trackTripNarrativeEngaged(payload: RecommendationCardEventPayload): void {
  emit('trip_narrative_engaged', payload);
}

export function trackProductDetailView(payload: CommerceEventPayload): void {
  emitCommerce('product_detail_view', payload);
}

export function trackSommelierPickClick(payload: CommerceEventPayload): void {
  emitCommerce('sommelier_pick_click', payload);
}

export function trackAffiliateLinkClick(payload: CommerceEventPayload): void {
  emitCommerce('affiliate_link_click', payload);
}

export type ArchiveAnalyticsEventName =
  | 'archive_home_viewed'
  | 'content_card_clicked'
  | 'content_detail_viewed'
  | 'content_saved'
  | 'content_unsaved'
  | 'explore_filter_used'
  | 'routine_cta_clicked'
  | 'routine_started'
  | 'routine_completed'
  | 'submit_started'
  | 'submit_completed'
  | 'external_link_clicked'
  | 'auth_prompt_shown'
  | 'auth_provider_clicked'
  | 'auth_login_succeeded'
  | 'auth_login_failed'
  | 'auth_logout_clicked'
  | 'auth_required_action_completed'
  | 'saved_login_required'
  | 'submit_login_required'
  | 'app_cta_impression'
  | 'app_cta_clicked'
  | 'app_handoff_from_content'
  | 'app_handoff_from_saved'
  | 'app_handoff_from_routine_preview'
  | 'app_download_page_viewed'
  | 'app_store_clicked';

export interface ArchiveEventPayload {
  contentId?: string;
  category?: string;
  contentType?: string;
  tags?: string[];
  source?: string;
  routineId?: string;
  submissionType?: string;
  platform?: string;
  provider?: 'google';
  pendingAction?: string;
  errorCode?: string;
  sourcePage?: string;
  contentCategory?: string;
  ctaType?: string;
  deviceType?: string;
  loggedIn?: boolean;
  ts?: string;
}

export function trackArchiveEvent(eventName: ArchiveAnalyticsEventName, payload: ArchiveEventPayload = {}): void {
  if (__DEV__) {
    console.log(`[analytics] ${eventName}`, {
      ts: new Date().toISOString(),
      ...payload,
    });
  }
}
