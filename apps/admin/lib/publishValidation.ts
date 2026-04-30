type ValidationState = 'pass' | 'warn' | 'fail';

export interface PublishValidationCheck {
  label: string;
  state: ValidationState;
  detail: string;
}

export interface PublishValidationMetric {
  label: string;
  value: number | string;
}

export interface PublishValidationViewModel {
  configured: boolean;
  snapshotUrl: string | null;
  checkedAt: string;
  status: ValidationState;
  checks: PublishValidationCheck[];
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
      checkedAt,
      status: 'warn',
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
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return {
        configured: true,
        snapshotUrl,
        checkedAt,
        status: 'fail',
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
    ];

    return {
      configured: true,
      snapshotUrl,
      checkedAt,
      status: getOverallStatus(checks),
      checks,
      metrics: buildSnapshotMetrics(payload),
    };
  } catch (error) {
    return {
      configured: true,
      snapshotUrl,
      checkedAt,
      status: 'fail',
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
