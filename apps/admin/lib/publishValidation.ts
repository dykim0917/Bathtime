type ValidationState = 'pass' | 'warn' | 'fail';

export interface PublishValidationCheck {
  label: string;
  state: ValidationState;
  detail: string;
}

export interface PublishValidationViewModel {
  configured: boolean;
  snapshotUrl: string | null;
  checkedAt: string;
  checks: PublishValidationCheck[];
}

function getSnapshotUrl(): string | null {
  return process.env.CONTENT_SNAPSHOT_API_URL?.trim() || null;
}

function hasArray(payload: unknown, path: string): boolean {
  const value = path.split('.').reduce<unknown>((current, key) => {
    if (!current || typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[key];
  }, payload);
  return Array.isArray(value);
}

export async function buildPublishValidationViewModel(): Promise<PublishValidationViewModel> {
  const snapshotUrl = getSnapshotUrl();
  const checkedAt = new Date().toISOString();

  if (!snapshotUrl) {
    return {
      configured: false,
      snapshotUrl,
      checkedAt,
      checks: [
        {
          label: 'Snapshot endpoint',
          state: 'warn',
          detail: 'CONTENT_SNAPSHOT_API_URL is not configured.',
        },
      ],
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
        checks: [
          {
            label: 'Snapshot endpoint',
            state: 'fail',
            detail: `Endpoint returned HTTP ${response.status}.`,
          },
        ],
      };
    }

    const payload = (await response.json()) as Record<string, unknown>;
    return {
      configured: true,
      snapshotUrl,
      checkedAt,
      checks: [
        {
          label: 'Schema version',
          state: payload.schema_version === 'content.v1' ? 'pass' : 'fail',
          detail: String(payload.schema_version ?? 'missing'),
        },
        {
          label: 'Catalog arrays',
          state:
            hasArray(payload, 'catalog.canonical_products') &&
            hasArray(payload, 'catalog.market_listings') &&
            hasArray(payload, 'catalog.match_rules')
              ? 'pass'
              : 'fail',
          detail: 'canonical_products, market_listings, match_rules',
        },
        {
          label: 'Routine arrays',
          state:
            hasArray(payload, 'care.intents') &&
            hasArray(payload, 'trip.themes') &&
            hasArray(payload, 'trip.intents')
              ? 'pass'
              : 'fail',
          detail: 'care intents, trip themes, trip intents',
        },
        {
          label: 'Audio arrays',
          state: hasArray(payload, 'audio.tracks') ? 'pass' : 'fail',
          detail: 'audio.tracks',
        },
      ],
    };
  } catch (error) {
    return {
      configured: true,
      snapshotUrl,
      checkedAt,
      checks: [
        {
          label: 'Snapshot endpoint',
          state: 'fail',
          detail: error instanceof Error ? error.message : 'Unknown fetch error',
        },
      ],
    };
  }
}

export function countFailedChecks(checks: PublishValidationCheck[]): number {
  return checks.filter((check) => check.state === 'fail').length;
}
