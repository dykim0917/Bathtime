export const BATHTIME_ANDROID_PACKAGE = 'com.bathtimestudio.bathtime';
export const BATHTIME_PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${BATHTIME_ANDROID_PACKAGE}`;

type AppIntentParams = {
  from?: string;
  routine?: string;
};

function buildQuery(params: AppIntentParams): string {
  const query = new URLSearchParams();
  if (params.from) query.set('from', params.from);
  if (params.routine) query.set('routine', params.routine);
  return query.toString();
}

export function buildBathtimeDeepLink(params: AppIntentParams): string {
  if (params.routine) {
    const query = buildQuery(params);
    return query ? `getbathtime://routines?${query}` : 'getbathtime://routines';
  }
  return 'getbathtime://profile?saved=1';
}

export function buildBathtimeAndroidIntent(params: AppIntentParams): string {
  const path = params.routine ? 'routines' : 'profile';
  const query = buildQuery(params);
  const target = query ? `${path}?${query}` : `${path}?saved=1`;
  return `intent://${target}#Intent;scheme=getbathtime;package=${BATHTIME_ANDROID_PACKAGE};S.browser_fallback_url=${encodeURIComponent(BATHTIME_PLAY_STORE_URL)};end`;
}
