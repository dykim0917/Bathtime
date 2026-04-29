import { type ContentApiResponse } from '@/src/contracts/contentApi';

export type ContentValidationSeverity = 'error' | 'warning';

export interface ContentValidationIssue {
  severity: ContentValidationSeverity;
  path: string;
  message: string;
}

export interface ContentValidationResult {
  ok: boolean;
  issues: ContentValidationIssue[];
}

function issue(
  severity: ContentValidationSeverity,
  path: string,
  message: string
): ContentValidationIssue {
  return { severity, path, message };
}

function activeItems<T extends { status: string }>(items: T[]): T[] {
  return items.filter((item) => item.status === 'active');
}

function validateSchema(payload: ContentApiResponse): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];

  if (payload.schema_version !== 'content.v1') {
    issues.push(
      issue('error', 'schema_version', `Unsupported content schema: ${payload.schema_version}`)
    );
  }

  if (payload.catalog.schema_version !== 'catalog.v1') {
    issues.push(
      issue(
        'error',
        'catalog.schema_version',
        `Unsupported catalog schema: ${payload.catalog.schema_version}`
      )
    );
  }

  return issues;
}

function validateCatalog(payload: ContentApiResponse): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];
  const activeProductIds = new Set(
    payload.catalog.canonical_products
      .filter((product) => product.status === 'active')
      .map((product) => product.id)
  );
  const presentationIds = new Set(
    payload.catalog.presentations.map((presentation) => presentation.canonical_product_id)
  );
  const matchRuleIds = new Set(
    payload.catalog.match_rules
      .filter((rule) => rule.status === 'active')
      .map((rule) => rule.canonical_product_id)
  );

  for (const productId of activeProductIds) {
    if (!presentationIds.has(productId)) {
      issues.push(
        issue(
          'error',
          `catalog.presentations.${productId}`,
          `Active product ${productId} is missing presentation metadata`
        )
      );
    }

    if (!matchRuleIds.has(productId)) {
      issues.push(
        issue(
          'warning',
          `catalog.match_rules.${productId}`,
          `Active product ${productId} has no active match rule and will be product-tab only`
        )
      );
    }
  }

  return issues;
}

function validateIntentDefaults(
  scope: 'care' | 'trip',
  intents: ContentApiResponse[typeof scope]['intents'],
  subprotocols: ContentApiResponse[typeof scope]['subprotocols']
): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];
  const activeIntentIds = new Set(activeItems(intents).map((intent) => intent.intent_id));

  for (const [intentId, options] of Object.entries(subprotocols)) {
    if (!activeIntentIds.has(intentId)) {
      issues.push(
        issue(
          'warning',
          `${scope}.subprotocols.${intentId}`,
          `${scope} subprotocols exist for inactive or missing intent ${intentId}`
        )
      );
      continue;
    }

    const activeDefaults = activeItems(options).filter((option) => option.is_default);
    if (activeDefaults.length > 1) {
      issues.push(
        issue(
          'error',
          `${scope}.subprotocols.${intentId}`,
          `${scope} intent ${intentId} has ${activeDefaults.length} active default subprotocols`
        )
      );
    }
  }

  for (const intent of activeItems(intents)) {
    const options = activeItems(subprotocols[intent.intent_id] ?? []);
    const defaultOption = options.find(
      (option) => option.id === intent.default_subprotocol_id
    );

    if (!defaultOption) {
      issues.push(
        issue(
          'error',
          `${scope}.intents.${intent.intent_id}.default_subprotocol_id`,
          `${scope} intent ${intent.intent_id} is missing default subprotocol ${intent.default_subprotocol_id}`
        )
      );
      continue;
    }

    if (!defaultOption.is_default) {
      issues.push(
        issue(
          'error',
          `${scope}.subprotocols.${defaultOption.id}.is_default`,
          `${scope} intent ${intent.intent_id} default subprotocol ${defaultOption.id} is not marked as default`
        )
      );
    }
  }

  return issues;
}

function validateTripLinks(payload: ContentApiResponse): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];
  const activeMusicIds = new Set(
    activeItems(payload.audio.tracks)
      .filter((track) => track.type === 'music')
      .map((track) => track.id)
  );
  const activeAmbienceIds = new Set(
    activeItems(payload.audio.tracks)
      .filter((track) => track.type === 'ambience')
      .map((track) => track.id)
  );
  const activeTripIntentIds = new Set(
    activeItems(payload.trip.intents).map((intent) => intent.intent_id)
  );

  for (const theme of activeItems(payload.trip.themes)) {
    if (!activeMusicIds.has(theme.music_id)) {
      issues.push(
        issue(
          'error',
          `trip.themes.${theme.id}.music_id`,
          `Trip theme ${theme.id} references missing active music track ${theme.music_id}`
        )
      );
    }

    if (!activeAmbienceIds.has(theme.ambience_id)) {
      issues.push(
        issue(
          'error',
          `trip.themes.${theme.id}.ambience_id`,
          `Trip theme ${theme.id} references missing active ambience track ${theme.ambience_id}`
        )
      );
    }

    if (!activeTripIntentIds.has(theme.id)) {
      issues.push(
        issue(
          'warning',
          `trip.intents.${theme.id}`,
          `Active trip theme ${theme.id} has no active intent card`
        )
      );
    }
  }

  return issues;
}

function validateAudioTracks(payload: ContentApiResponse): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];

  for (const track of activeItems(payload.audio.tracks)) {
    if (!track.filename && !track.remote_url) {
      issues.push(
        issue(
          'error',
          `audio.tracks.${track.id}`,
          `Active audio track ${track.id} needs either filename or remote_url`
        )
      );
    }

    if (track.remote_url && !/^https?:\/\//.test(track.remote_url)) {
      issues.push(
        issue(
          'error',
          `audio.tracks.${track.id}.remote_url`,
          `Active audio track ${track.id} has an invalid remote_url`
        )
      );
    }
  }

  return issues;
}

export function validateContentApiResponse(
  payload: ContentApiResponse
): ContentValidationResult {
  const issues = [
    ...validateSchema(payload),
    ...validateCatalog(payload),
    ...validateIntentDefaults('care', payload.care.intents, payload.care.subprotocols),
    ...validateIntentDefaults('trip', payload.trip.intents, payload.trip.subprotocols),
    ...validateTripLinks(payload),
    ...validateAudioTracks(payload),
  ];

  return {
    ok: !issues.some((item) => item.severity === 'error'),
    issues,
  };
}
