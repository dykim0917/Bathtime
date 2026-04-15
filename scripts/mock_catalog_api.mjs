import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const rootDir = path.resolve(new URL('..', import.meta.url).pathname);
const seedJsonPath = path.join(rootDir, 'output', 'catalog-research-seed.v1.json');
const port = Number(process.env.CATALOG_API_PORT ?? '4010');

function buildCorsHeaders() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,OPTIONS',
    'access-control-allow-headers': 'content-type',
  };
}

function ensureSeedSnapshot() {
  if (existsSync(seedJsonPath)) return;
  execFileSync('npm', ['run', 'catalog:seed:export'], {
    cwd: rootDir,
    stdio: 'inherit',
  });
}

function parseEnvironmentFilter(value) {
  if (value === 'bathtub' || value === 'shower') return value;
  return null;
}

function parseStatusFilter(value) {
  if (value === 'active' || value === 'paused' || value === 'retired') return value;
  return null;
}

function parseMarketFilter(value) {
  if (value === 'coupang' || value === 'naver_smartstore') return value;
  return null;
}

function filterPayload(payload, query) {
  const status = parseStatusFilter(query.get('status'));
  const environment = parseEnvironmentFilter(query.get('environment'));
  const market = parseMarketFilter(query.get('market'));

  const canonicalProducts = payload.canonicalProducts.filter((item) => {
    if (status && item.status !== status) return false;
    if (environment && !item.environments.includes(environment)) return false;
    return true;
  });

  const canonicalIds = new Set(canonicalProducts.map((item) => item.id));

  const matchRules = payload.matchRules.filter((item) => {
    if (!canonicalIds.has(item.canonicalProductId)) return false;
    if (environment && !item.allowedEnvironments.includes(environment)) return false;
    return true;
  });

  const listings = payload.marketListings.filter((item) => {
    if (!canonicalIds.has(item.canonicalProductId)) return false;
    if (market && item.market !== market) return false;
    return true;
  });

  const presentations = canonicalProducts.map((item) => ({
    canonical_product_id: item.id,
    tags: item.tags,
    emoji: item.emoji,
    bg_color: item.bgColor,
    safety_flags: [],
  }));

  return {
    schema_version: 'catalog.v1',
    snapshot_date: payload.snapshotDate,
    canonical_products: canonicalProducts.map((item) => ({
      id: item.id,
      ingredient_key: item.ingredientKey,
      name_ko: item.nameKo,
      brand: item.brand,
      category: item.category,
      mechanism: item.mechanism,
      price_tier: item.priceTier,
      environments: item.environments,
      summary: item.summary,
      editorial_eyebrow: item.editorialEyebrow,
      editorial_footer_hint: item.editorialFooterHint,
      status: item.status,
      last_verified_at: item.lastVerifiedAt,
    })),
    market_listings: listings.map((item) => ({
      id: item.id,
      canonical_product_id: item.canonicalProductId,
      market: item.market,
      source_url: item.sourceUrl,
      title_snapshot: item.titleSnapshot,
      seller_snapshot: item.sellerSnapshot ?? null,
      price_snapshot_krw: item.priceSnapshotKrw ?? null,
      availability: item.availability,
      verified_at: item.verifiedAt,
      source_confidence: item.sourceConfidence,
      notes: item.notes ?? null,
    })),
    match_rules: matchRules.map((item) => ({
      id: item.id,
      canonical_product_id: item.canonicalProductId,
      ingredient_keys: item.ingredientKeys,
      allowed_environments: item.allowedEnvironments,
      mode_bias: item.modeBias ?? null,
      priority_weight: item.priorityWeight,
      is_sommelier_pick_candidate: item.isSommelierPickCandidate,
      status: item.status,
    })),
    presentations,
  };
}

async function readSeedPayload() {
  ensureSeedSnapshot();
  const raw = await readFile(seedJsonPath, 'utf8');
  return JSON.parse(raw);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://127.0.0.1:${port}`);
  const corsHeaders = buildCorsHeaders();

  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    res.writeHead(405, {
      ...corsHeaders,
      'content-type': 'application/json; charset=utf-8',
    });
    res.end(JSON.stringify({ error: 'method_not_allowed' }));
    return;
  }

  if (url.pathname === '/health') {
    res.writeHead(200, {
      ...corsHeaders,
      'content-type': 'application/json; charset=utf-8',
    });
    res.end(JSON.stringify({ ok: true, service: 'mock-catalog-api' }));
    return;
  }

  if (url.pathname !== '/api/catalog') {
    res.writeHead(404, {
      ...corsHeaders,
      'content-type': 'application/json; charset=utf-8',
    });
    res.end(JSON.stringify({ error: 'not_found' }));
    return;
  }

  try {
    const payload = await readSeedPayload();
    const filtered = filterPayload(payload, url.searchParams);
    res.writeHead(200, {
      ...corsHeaders,
      'content-type': 'application/json; charset=utf-8',
    });
    res.end(JSON.stringify(filtered, null, 2));
  } catch (error) {
    res.writeHead(500, {
      ...corsHeaders,
      'content-type': 'application/json; charset=utf-8',
    });
    res.end(
      JSON.stringify({
        error: 'catalog_seed_load_failed',
        detail: error instanceof Error ? error.message : 'unknown_error',
      })
    );
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(
    JSON.stringify(
      {
        service: 'mock-catalog-api',
        url: `http://127.0.0.1:${port}/api/catalog`,
        health: `http://127.0.0.1:${port}/health`,
      },
      null,
      2
    )
  );
});
