#!/usr/bin/env node

const DEFAULT_TIMEOUT_MS = 15_000;

function readTargetUrl() {
  const argUrl = process.argv[2]?.trim();
  const envUrl = process.env.CONTENT_SNAPSHOT_API_URL?.trim();
  return argUrl || envUrl;
}

function fail(message) {
  console.error(`Content snapshot smoke failed: ${message}`);
  process.exitCode = 1;
}

function assertArray(payload, path) {
  const value = path.split('.').reduce((current, key) => current?.[key], payload);
  if (!Array.isArray(value)) {
    throw new Error(`${path} must be an array`);
  }
  return value;
}

function assertObject(payload, path) {
  const value = path.split('.').reduce((current, key) => current?.[key], payload);
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${path} must be an object`);
  }
  return value;
}

function requireActiveDefaults(scope, intents, subprotocols) {
  for (const intent of intents.filter((item) => item.status === 'active')) {
    const options = (subprotocols[intent.intent_id] ?? []).filter(
      (item) => item.status === 'active'
    );
    if (!options.some((item) => item.id === intent.default_subprotocol_id)) {
      throw new Error(
        `${scope} intent ${intent.intent_id} is missing active default subprotocol ${intent.default_subprotocol_id}`
      );
    }
  }
}

function validatePayload(payload) {
  if (payload?.schema_version !== 'content.v1') {
    throw new Error(`unsupported schema_version: ${payload?.schema_version ?? 'missing'}`);
  }

  if (typeof payload.snapshot_date !== 'string' || payload.snapshot_date.length === 0) {
    throw new Error('snapshot_date must be a non-empty string');
  }

  const canonicalProducts = assertArray(payload, 'catalog.canonical_products');
  const marketListings = assertArray(payload, 'catalog.market_listings');
  const matchRules = assertArray(payload, 'catalog.match_rules');
  const presentations = assertArray(payload, 'catalog.presentations');
  const careIntents = assertArray(payload, 'care.intents');
  const careSubprotocols = assertObject(payload, 'care.subprotocols');
  const tripThemes = assertArray(payload, 'trip.themes');
  const tripIntents = assertArray(payload, 'trip.intents');
  const tripSubprotocols = assertObject(payload, 'trip.subprotocols');
  const audioTracks = assertArray(payload, 'audio.tracks');

  requireActiveDefaults('care', careIntents, careSubprotocols);
  requireActiveDefaults('trip', tripIntents, tripSubprotocols);

  const activeAudioIds = new Set(
    audioTracks.filter((item) => item.status === 'active').map((item) => item.id)
  );
  for (const theme of tripThemes.filter((item) => item.status === 'active')) {
    if (!activeAudioIds.has(theme.music_id)) {
      throw new Error(`trip theme ${theme.id} references missing music ${theme.music_id}`);
    }
    if (!activeAudioIds.has(theme.ambience_id)) {
      throw new Error(`trip theme ${theme.id} references missing ambience ${theme.ambience_id}`);
    }
  }

  return {
    canonicalProducts: canonicalProducts.length,
    marketListings: marketListings.length,
    matchRules: matchRules.length,
    presentations: presentations.length,
    careIntents: careIntents.length,
    tripThemes: tripThemes.length,
    tripIntents: tripIntents.length,
    audioTracks: audioTracks.length,
  };
}

async function main() {
  const targetUrl = readTargetUrl();
  if (!targetUrl) {
    fail('pass a URL argument or set CONTENT_SNAPSHOT_API_URL');
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(targetUrl, {
      headers: { accept: 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    const counts = validatePayload(payload);
    console.log('Content snapshot smoke passed');
    console.log(JSON.stringify({ url: targetUrl, snapshotDate: payload.snapshot_date, counts }, null, 2));
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  } finally {
    clearTimeout(timeout);
  }
}

main();
