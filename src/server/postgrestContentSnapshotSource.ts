import {
  type ContentDbAudioTrackRow,
  type ContentDbCanonicalProductRow,
  type ContentDbIntentRow,
  type ContentDbMarketListingRow,
  type ContentDbMatchRuleRow,
  type ContentDbProductPresentationRow,
  type ContentDbSubProtocolRow,
  type ContentDbTripThemeRow,
} from '@/src/contracts/contentDbSnapshot';
import { type ContentSnapshotRowSource } from '@/src/server/contentSnapshotSource';

export interface PostgrestContentSnapshotSourceConfig {
  restUrl: string;
  serviceRoleKey: string;
}

type TableName =
  | 'audio_track'
  | 'canonical_product'
  | 'care_intent'
  | 'care_subprotocol'
  | 'product_market_listing'
  | 'product_match_rule'
  | 'product_presentation'
  | 'trip_intent'
  | 'trip_subprotocol'
  | 'trip_theme';

function normalizeRestUrl(restUrl: string): string {
  return restUrl.replace(/\/+$/, '');
}

function encodeInFilter(values: string[]): string {
  return `in.(${values.map((value) => `"${value.replace(/"/g, '\\"')}"`).join(',')})`;
}

export function readPostgrestContentSnapshotSourceConfig(
  env: Partial<Record<string, string | undefined>> = process.env
): PostgrestContentSnapshotSourceConfig | null {
  const restUrl = env.CONTENT_DB_REST_URL?.trim();
  const serviceRoleKey = env.CONTENT_DB_SERVICE_ROLE_KEY?.trim();

  if (!restUrl || !serviceRoleKey) return null;
  return { restUrl, serviceRoleKey };
}

export class PostgrestContentSnapshotSource implements ContentSnapshotRowSource {
  private readonly restUrl: string;
  private readonly serviceRoleKey: string;
  private activeProductIdsPromise: Promise<string[]> | null = null;

  constructor(config: PostgrestContentSnapshotSourceConfig) {
    this.restUrl = normalizeRestUrl(config.restUrl);
    this.serviceRoleKey = config.serviceRoleKey;
  }

  readActiveCanonicalProducts(): Promise<ContentDbCanonicalProductRow[]> {
    return this.readRows<ContentDbCanonicalProductRow>('canonical_product', {
      status: 'eq.active',
      order: 'id.asc',
    });
  }

  async readMarketListingsForActiveProducts(): Promise<ContentDbMarketListingRow[]> {
    const activeProductIds = await this.readActiveProductIds();
    if (activeProductIds.length === 0) return [];

    return this.readRows<ContentDbMarketListingRow>('product_market_listing', {
      canonical_product_id: encodeInFilter(activeProductIds),
      order: 'canonical_product_id.asc,id.asc',
    });
  }

  readActiveMatchRules(): Promise<ContentDbMatchRuleRow[]> {
    return this.readRows<ContentDbMatchRuleRow>('product_match_rule', {
      status: 'eq.active',
      order: 'priority_weight.desc,id.asc',
    });
  }

  readActiveProductPresentations(): Promise<ContentDbProductPresentationRow[]> {
    return this.readRows<ContentDbProductPresentationRow>('product_presentation', {
      status: 'eq.active',
      order: 'canonical_product_id.asc',
    });
  }

  readActiveCareIntents(): Promise<ContentDbIntentRow[]> {
    return this.readRows<ContentDbIntentRow>('care_intent', {
      status: 'eq.active',
      order: 'card_position.asc,id.asc',
    });
  }

  readActiveCareSubprotocols(): Promise<ContentDbSubProtocolRow[]> {
    return this.readRows<ContentDbSubProtocolRow>('care_subprotocol', {
      status: 'eq.active',
      order: 'intent_id.asc,id.asc',
    });
  }

  readActiveTripThemes(): Promise<ContentDbTripThemeRow[]> {
    return this.readRows<ContentDbTripThemeRow>('trip_theme', {
      status: 'eq.active',
      order: 'id.asc',
    });
  }

  readActiveTripIntents(): Promise<ContentDbIntentRow[]> {
    return this.readRows<ContentDbIntentRow>('trip_intent', {
      status: 'eq.active',
      order: 'card_position.asc,id.asc',
    });
  }

  readActiveTripSubprotocols(): Promise<ContentDbSubProtocolRow[]> {
    return this.readRows<ContentDbSubProtocolRow>('trip_subprotocol', {
      status: 'eq.active',
      order: 'intent_id.asc,id.asc',
    });
  }

  readActiveAudioTracks(): Promise<ContentDbAudioTrackRow[]> {
    return this.readRows<ContentDbAudioTrackRow>('audio_track', {
      status: 'eq.active',
      order: 'type.asc,id.asc',
    });
  }

  private readActiveProductIds(): Promise<string[]> {
    if (!this.activeProductIdsPromise) {
      this.activeProductIdsPromise = this.readActiveCanonicalProducts().then((rows) =>
        rows.map((row) => row.id)
      );
    }

    return this.activeProductIdsPromise;
  }

  private async readRows<T>(
    tableName: TableName,
    params: Record<string, string>
  ): Promise<T[]> {
    const url = new URL(`${this.restUrl}/${tableName}`);
    url.searchParams.set('select', '*');
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    const response = await fetch(url.toString(), {
      headers: {
        apikey: this.serviceRoleKey,
        authorization: `Bearer ${this.serviceRoleKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `PostgREST ${tableName} read failed with status ${response.status}`
      );
    }

    return (await response.json()) as T[];
  }
}
