type ValidationState = 'pass' | 'warn' | 'fail';

export interface PublishValidationCheck {
  label: string;
  state: ValidationState;
  detail: string;
}

export interface PublishValidationIssue {
  severity: 'error' | 'warning';
  path: string;
  message: string;
}

export interface PublishValidationMetric {
  label: string;
  value: number | string;
}

export interface PublishValidationViewModel {
  configured: boolean;
  snapshotUrl: string | null;
  snapshotDate: string | null;
  checkedAt: string;
  status: ValidationState;
  checks: PublishValidationCheck[];
  issues: PublishValidationIssue[];
  metrics: PublishValidationMetric[];
}

function getSnapshotUrl(): string | null {
  return process.env.CONTENT_SNAPSHOT_API_URL?.trim() || null;
}

function hasArray(payload: unknown, path: string): boolean {
  return Array.isArray(readPath(payload, path));
}

function readPath(payload: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (!current || typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[key];
  }, payload);
}

function countArray(payload: unknown, path: string): number {
  const value = readPath(payload, path);
  return Array.isArray(value) ? value.length : 0;
}

function readArray(payload: unknown, path: string): Record<string, unknown>[] {
  const value = readPath(payload, path);
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function readRecord(payload: unknown, path: string): Record<string, unknown[]> {
  const value = readPath(payload, path);
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).map(([key, items]) => [key, Array.isArray(items) ? items : []])
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readString(item: Record<string, unknown>, key: string): string {
  const value = item[key];
  return typeof value === 'string' ? value : '';
}

function isActive(item: Record<string, unknown>): boolean {
  return item.status === 'active';
}

function issue(
  severity: PublishValidationIssue['severity'],
  path: string,
  message: string
): PublishValidationIssue {
  return { severity, path, message };
}

function countIssues(
  issues: PublishValidationIssue[],
  severity: PublishValidationIssue['severity']
): number {
  return issues.filter((item) => item.severity === severity).length;
}

function getOverallStatus(checks: PublishValidationCheck[]): ValidationState {
  if (checks.some((check) => check.state === 'fail')) return 'fail';
  if (checks.some((check) => check.state === 'warn')) return 'warn';
  return 'pass';
}

function buildSnapshotMetrics(payload: unknown): PublishValidationMetric[] {
  return [
    { label: 'Products', value: countArray(payload, 'catalog.canonical_products') },
    { label: 'Listings', value: countArray(payload, 'catalog.market_listings') },
    { label: 'Match rules', value: countArray(payload, 'catalog.match_rules') },
    { label: 'Care intents', value: countArray(payload, 'care.intents') },
    { label: 'Trip themes', value: countArray(payload, 'trip.themes') },
    { label: 'Trip intents', value: countArray(payload, 'trip.intents') },
    { label: 'Audio tracks', value: countArray(payload, 'audio.tracks') },
  ];
}

function validateCatalogLinks(payload: unknown): PublishValidationIssue[] {
  const issues: PublishValidationIssue[] = [];
  const products = readArray(payload, 'catalog.canonical_products');
  const productIds = new Set(products.map((product) => readString(product, 'id')));
  const activeProductIds = new Set(products.filter(isActive).map((product) => readString(product, 'id')));
  const presentationIds = new Set(
    readArray(payload, 'catalog.presentations').map((item) => readString(item, 'canonical_product_id'))
  );
  const activeMatchRuleIds = new Set(
    readArray(payload, 'catalog.match_rules')
      .filter(isActive)
      .map((item) => readString(item, 'canonical_product_id'))
  );

  for (const listing of readArray(payload, 'catalog.market_listings')) {
    const productId = readString(listing, 'canonical_product_id');
    if (!productIds.has(productId)) {
      issues.push(
        issue('error', `catalog.market_listings.${readString(listing, 'id')}`, `Listing references missing product ${productId}`)
      );
    }
  }

  for (const rule of readArray(payload, 'catalog.match_rules')) {
    const productId = readString(rule, 'canonical_product_id');
    if (!productIds.has(productId)) {
      issues.push(
        issue('error', `catalog.match_rules.${readString(rule, 'id')}`, `Match rule references missing product ${productId}`)
      );
    }
  }

  for (const productId of activeProductIds) {
    if (!presentationIds.has(productId)) {
      issues.push(
        issue('error', `catalog.presentations.${productId}`, `Active product ${productId} is missing presentation metadata`)
      );
    }
    if (!activeMatchRuleIds.has(productId)) {
      issues.push(
        issue('warning', `catalog.match_rules.${productId}`, `Active product ${productId} has no active match rule`)
      );
    }
  }

  return issues;
}

function validateIntentDefaults(scope: 'care' | 'trip', payload: unknown): PublishValidationIssue[] {
  const issues: PublishValidationIssue[] = [];
  const activeIntentIds = new Set(
    readArray(payload, `${scope}.intents`).filter(isActive).map((item) => readString(item, 'intent_id'))
  );
  const subprotocols = readRecord(payload, `${scope}.subprotocols`);

  for (const [intentId, options] of Object.entries(subprotocols)) {
    const activeOptions = options.filter(isRecord).filter(isActive);
    const activeDefaults = activeOptions.filter((option) => option.is_default === true);
    if (!activeIntentIds.has(intentId) && activeOptions.length > 0) {
      issues.push(
        issue('warning', `${scope}.subprotocols.${intentId}`, `${scope} has active subprotocols for inactive or missing intent ${intentId}`)
      );
    }
    if (activeDefaults.length > 1) {
      issues.push(
        issue('error', `${scope}.subprotocols.${intentId}`, `${scope} intent ${intentId} has ${activeDefaults.length} active defaults`)
      );
    }
  }

  for (const intent of readArray(payload, `${scope}.intents`).filter(isActive)) {
    const intentId = readString(intent, 'intent_id');
    const defaultSubprotocolId = readString(intent, 'default_subprotocol_id');
    const activeOptions = (subprotocols[intentId] ?? []).filter(isRecord).filter(isActive);
    const defaultOption = activeOptions.find((option) => readString(option, 'id') === defaultSubprotocolId);

    if (!defaultOption) {
      issues.push(
        issue('error', `${scope}.intents.${intentId}.default_subprotocol_id`, `${scope} intent ${intentId} is missing active default subprotocol ${defaultSubprotocolId}`)
      );
    } else if (defaultOption.is_default !== true) {
      issues.push(
        issue('error', `${scope}.subprotocols.${defaultSubprotocolId}.is_default`, `${scope} default subprotocol ${defaultSubprotocolId} is not marked as default`)
      );
    }
  }

  return issues;
}

function validateTripLinks(payload: unknown): PublishValidationIssue[] {
  const issues: PublishValidationIssue[] = [];
  const activeMusicIds = new Set(
    readArray(payload, 'audio.tracks')
      .filter((track) => isActive(track) && track.type === 'music')
      .map((track) => readString(track, 'id'))
  );
  const activeAmbienceIds = new Set(
    readArray(payload, 'audio.tracks')
      .filter((track) => isActive(track) && track.type === 'ambience')
      .map((track) => readString(track, 'id'))
  );
  const activeTripIntentIds = new Set(
    readArray(payload, 'trip.intents').filter(isActive).map((intent) => readString(intent, 'intent_id'))
  );

  for (const theme of readArray(payload, 'trip.themes').filter(isActive)) {
    const themeId = readString(theme, 'id');
    const musicId = readString(theme, 'music_id');
    const ambienceId = readString(theme, 'ambience_id');

    if (!activeMusicIds.has(musicId)) {
      issues.push(issue('error', `trip.themes.${themeId}.music_id`, `Trip theme ${themeId} references missing active music track ${musicId}`));
    }
    if (!activeAmbienceIds.has(ambienceId)) {
      issues.push(issue('error', `trip.themes.${themeId}.ambience_id`, `Trip theme ${themeId} references missing active ambience track ${ambienceId}`));
    }
    if (!activeTripIntentIds.has(themeId)) {
      issues.push(issue('warning', `trip.intents.${themeId}`, `Active trip theme ${themeId} has no active intent card`));
    }
  }

  return issues;
}

function validateAudioTracks(payload: unknown): PublishValidationIssue[] {
  const issues: PublishValidationIssue[] = [];

  for (const track of readArray(payload, 'audio.tracks').filter(isActive)) {
    const id = readString(track, 'id');
    const filename = readString(track, 'filename');
    const remoteUrl = readString(track, 'remote_url');

    if (!filename && !remoteUrl) {
      issues.push(issue('error', `audio.tracks.${id}`, `Active audio track ${id} needs filename or remote_url`));
    }
    if (remoteUrl && !/^https?:\/\//.test(remoteUrl)) {
      issues.push(issue('error', `audio.tracks.${id}.remote_url`, `Active audio track ${id} has an invalid remote_url`));
    }
  }

  return issues;
}

function validatePayloadDetails(payload: unknown): PublishValidationIssue[] {
  return [
    ...(readPath(payload, 'catalog.schema_version') === 'catalog.v1'
      ? []
      : [issue('error', 'catalog.schema_version', `Unsupported catalog schema ${String(readPath(payload, 'catalog.schema_version') ?? 'missing')}`)]),
    ...(typeof readPath(payload, 'snapshot_date') === 'string'
      ? []
      : [issue('error', 'snapshot_date', 'snapshot_date must be present')]),
    ...validateCatalogLinks(payload),
    ...validateIntentDefaults('care', payload),
    ...validateIntentDefaults('trip', payload),
    ...validateTripLinks(payload),
    ...validateAudioTracks(payload),
  ];
}

function hasPositiveArray(payload: unknown, path: string): boolean {
  const value = path.split('.').reduce<unknown>((current, key) => {
    if (!current || typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[key];
  }, payload);
  return Array.isArray(value) && value.length > 0;
}

export async function buildPublishValidationViewModel(): Promise<PublishValidationViewModel> {
  const snapshotUrl = getSnapshotUrl();
  const checkedAt = new Date().toISOString();

  if (!snapshotUrl) {
    return {
      configured: false,
      snapshotUrl,
      snapshotDate: null,
      checkedAt,
      status: 'warn',
      issues: [],
      checks: [
        {
          label: 'Snapshot endpoint',
          state: 'warn',
          detail: 'CONTENT_SNAPSHOT_API_URL is not configured.',
        },
      ],
      metrics: [],
    };
  }

  try {
    const response = await fetch(snapshotUrl, {
      headers: { accept: 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        configured: true,
        snapshotUrl,
        snapshotDate: null,
        checkedAt,
        status: 'fail',
        issues: [],
        checks: [
          {
            label: 'Snapshot endpoint',
            state: 'fail',
            detail: `Endpoint returned HTTP ${response.status}.`,
          },
        ],
        metrics: [],
      };
    }

    const payload = (await response.json()) as Record<string, unknown>;
    const issues = validatePayloadDetails(payload);
    const issueErrors = countIssues(issues, 'error');
    const issueWarnings = countIssues(issues, 'warning');
    const checks: PublishValidationCheck[] = [
      {
        label: 'Schema version',
        state: payload.schema_version === 'content.v1' ? 'pass' : 'fail',
        detail: String(payload.schema_version ?? 'missing'),
      },
      {
        label: 'Catalog arrays',
        state:
          hasPositiveArray(payload, 'catalog.canonical_products') &&
          hasArray(payload, 'catalog.market_listings') &&
          hasArray(payload, 'catalog.match_rules')
            ? 'pass'
            : 'fail',
        detail: 'canonical_products, market_listings, match_rules',
      },
      {
        label: 'Routine arrays',
        state:
          hasPositiveArray(payload, 'care.intents') &&
          hasPositiveArray(payload, 'trip.themes') &&
          hasPositiveArray(payload, 'trip.intents')
            ? 'pass'
            : 'fail',
        detail: 'care intents, trip themes, trip intents',
      },
      {
        label: 'Audio arrays',
        state: hasPositiveArray(payload, 'audio.tracks') ? 'pass' : 'fail',
        detail: 'audio.tracks',
      },
      {
        label: 'Relationship validation',
        state: issueErrors > 0 ? 'fail' : issueWarnings > 0 ? 'warn' : 'pass',
        detail: `${issueErrors} errors, ${issueWarnings} warnings`,
      },
    ];

    return {
      configured: true,
      snapshotUrl,
      snapshotDate: typeof payload.snapshot_date === 'string' ? payload.snapshot_date : null,
      checkedAt,
      status: getOverallStatus(checks),
      checks,
      issues,
      metrics: buildSnapshotMetrics(payload),
    };
  } catch (error) {
    return {
      configured: true,
      snapshotUrl,
      snapshotDate: null,
      checkedAt,
      status: 'fail',
      issues: [],
      checks: [
        {
          label: 'Snapshot endpoint',
          state: 'fail',
          detail: error instanceof Error ? error.message : 'Unknown fetch error',
        },
      ],
      metrics: [],
    };
  }
}

export function countFailedChecks(checks: PublishValidationCheck[]): number {
  return checks.filter((check) => check.state === 'fail').length;
}

export function countWarningChecks(checks: PublishValidationCheck[]): number {
  return checks.filter((check) => check.state === 'warn').length;
}
