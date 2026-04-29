import { type ContentApiResponse } from '@/src/contracts/contentApi';
import {
  buildContentSnapshotFromSource,
  type ContentSnapshotRowSource,
} from '@/src/server/contentSnapshotSource';
import {
  PostgrestContentSnapshotSource,
  readPostgrestContentSnapshotSourceConfig,
  type PostgrestContentSnapshotSourceConfig,
} from '@/src/server/postgrestContentSnapshotSource';

type ServerEnv = Partial<Record<string, string | undefined>>;

interface ContentSnapshotApiDeps {
  env?: ServerEnv;
  logger?: Pick<Console, 'error'>;
  createSource?: (
    config: PostgrestContentSnapshotSourceConfig
  ) => ContentSnapshotRowSource;
  buildSnapshot?: (source: ContentSnapshotRowSource) => Promise<ContentApiResponse>;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const errorHeaders = {
  ...corsHeaders,
  'Cache-Control': 'no-store',
};

const successHeaders = {
  ...corsHeaders,
  'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
};

export function getContentSnapshotOptionsResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function getContentSnapshotResponse(
  deps: ContentSnapshotApiDeps = {}
): Promise<Response> {
  const config = readPostgrestContentSnapshotSourceConfig(deps.env);

  if (!config) {
    return Response.json(
      { error: 'Content snapshot source is not configured' },
      { status: 503, headers: errorHeaders }
    );
  }

  const createSource =
    deps.createSource ?? ((sourceConfig) => new PostgrestContentSnapshotSource(sourceConfig));
  const buildSnapshot = deps.buildSnapshot ?? buildContentSnapshotFromSource;

  try {
    const payload = await buildSnapshot(createSource(config));
    return Response.json(payload, {
      status: 200,
      headers: successHeaders,
    });
  } catch (error) {
    deps.logger?.error('Content snapshot API failed', error);
    return Response.json(
      { error: 'Content snapshot is temporarily unavailable' },
      { status: 502, headers: errorHeaders }
    );
  }
}
