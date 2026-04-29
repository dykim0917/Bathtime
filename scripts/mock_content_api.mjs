import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const rootDir = path.resolve(new URL('..', import.meta.url).pathname);
const seedJsonPath = path.join(rootDir, 'output', 'catalog-research-seed.v1.json');
const port = Number(process.env.CONTENT_API_PORT ?? '4011');

function buildCorsHeaders() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,OPTIONS',
    'access-control-allow-headers': 'content-type',
  };
}

function ensureCatalogSeedSnapshot() {
  if (existsSync(seedJsonPath)) return;
  execFileSync('npm', ['run', 'catalog:seed:export'], {
    cwd: rootDir,
    stdio: 'inherit',
  });
}

function toCatalogApiPayload(payload) {
  const fallbackPresentation = {
    tags: [],
    emoji: 'BT',
    bg_color: '#EADBCB',
  };

  return {
    schema_version: 'catalog.v1',
    snapshot_date: payload.snapshotDate,
    canonical_products: payload.canonicalProducts.map((item) => ({
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
    market_listings: payload.marketListings.map((item) => ({
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
    match_rules: payload.matchRules.map((item) => ({
      id: item.id,
      canonical_product_id: item.canonicalProductId,
      ingredient_keys: item.ingredientKeys,
      allowed_environments: item.allowedEnvironments,
      mode_bias: item.modeBias ?? null,
      priority_weight: item.priorityWeight,
      is_sommelier_pick_candidate: item.isSommelierPickCandidate,
      status: item.status,
    })),
    presentations: payload.canonicalProducts.map((item) => ({
      canonical_product_id: item.id,
      tags: item.tags ?? fallbackPresentation.tags,
      emoji: item.emoji ?? fallbackPresentation.emoji,
      bg_color: item.bgColor ?? fallbackPresentation.bg_color,
      safety_flags: [],
    })),
  };
}

function buildDemoContentPayload(catalog) {
  return {
    schema_version: 'content.v1',
    snapshot_date: new Date().toISOString().slice(0, 10),
    catalog,
    care: {
      intents: [
        {
          id: 'care_sleep_ready',
          domain: 'care',
          intent_id: 'sleep_ready',
          mapped_mode: 'sleep',
          allowed_environments: ['bathtub', 'partial_bath', 'shower'],
          copy_title: '잠들기 어려울 때 좋은 루틴',
          copy_subtitle_by_environment: {
            shower: '샤워 6분으로 잠들기 전 긴장을 낮춰요.',
            bathtub: '욕조 15분으로 수면 준비를 도와요.',
            partial_bath: '족욕 10분으로 몸을 천천히 가라앉혀요.',
          },
          default_subprotocol_id: 'sleep_sensitive',
          card_position: 1,
          status: 'active',
        },
      ],
      subprotocols: {
        sleep_ready: [
          {
            id: 'sleep_sensitive',
            intent_id: 'sleep_ready',
            label: '예민해서 잠이 안 와요',
            hint: '자극을 줄이고 안정적으로 진행해요.',
            is_default: true,
            partial_overrides: {
              behavior_blocks: ['리듬 최소화'],
              lighting_adjustment: '저자극 조명',
            },
            status: 'active',
          },
        ],
      },
    },
    trip: {
      themes: [
        {
          id: 'snow_cabin',
          cover_style_id: 'snow',
          title: 'Snow Cabin',
          subtitle: '눈 내리는 오두막 + 벽난로',
          base_temp: 39,
          color_hex: '#94A3B8',
          rec_scent: '시더우드',
          music_id: 'trip_snow_cabin',
          ambience_id: 'fireplace',
          default_bath_type: 'full',
          recommended_environment: 'bathtub',
          duration_minutes: 18,
          lighting: '차가운 화이트와 웜 포인트',
          status: 'active',
        },
      ],
      intents: [
        {
          id: 'trip_snow',
          domain: 'trip',
          intent_id: 'snow_cabin',
          mapped_mode: 'sleep',
          allowed_environments: ['bathtub', 'partial_bath', 'shower'],
          copy_title: '스노우 캐빈 무드로 하루를 마무리해요',
          copy_subtitle_by_environment: {
            shower: '샤워 5분, 부드럽게 마무리해요.',
            bathtub: '욕조 12분, 포근하게 정리해요.',
            partial_bath: '족욕 10분, 잔잔하게 하루를 마무리해요.',
          },
          default_subprotocol_id: 'trip_snow_balanced',
          card_position: 1,
          status: 'active',
        },
      ],
      subprotocols: {
        snow_cabin: [
          {
            id: 'trip_snow_balanced',
            intent_id: 'snow_cabin',
            label: '기본 마무리',
            hint: '포근한 분위기로 하루를 정리해요.',
            is_default: true,
            partial_overrides: {
              behavior_blocks: ['마무리 호흡 1회'],
            },
            status: 'active',
          },
        ],
      },
    },
    audio: {
      tracks: [
        {
          id: 'care_sleep_ready',
          type: 'music',
          title: '수면 준비 케어 사운드',
          filename: 'care_sleep_ready',
          remote_url: null,
          duration_seconds: 300,
          persona_codes: ['P4_SLEEP'],
          license_note: null,
          status: 'active',
        },
        {
          id: 'trip_snow_cabin',
          type: 'music',
          title: 'Snow Cabin OST',
          filename: 'trip_snow_cabin',
          remote_url: null,
          duration_seconds: 255,
          persona_codes: ['P1_SAFETY'],
          license_note: null,
          status: 'active',
        },
        {
          id: 'fireplace',
          type: 'ambience',
          title: '벽난로',
          filename: 'fireplace',
          remote_url: null,
          duration_seconds: 300,
          persona_codes: ['P4_SLEEP', 'P1_SAFETY'],
          license_note: null,
          status: 'active',
        },
      ],
    },
  };
}

async function readContentPayload() {
  ensureCatalogSeedSnapshot();
  const raw = await readFile(seedJsonPath, 'utf8');
  return buildDemoContentPayload(toCatalogApiPayload(JSON.parse(raw)));
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
    res.end(JSON.stringify({ ok: true, service: 'mock-content-api' }));
    return;
  }

  if (url.pathname !== '/api/content-snapshot') {
    res.writeHead(404, {
      ...corsHeaders,
      'content-type': 'application/json; charset=utf-8',
    });
    res.end(JSON.stringify({ error: 'not_found' }));
    return;
  }

  try {
    const payload = await readContentPayload();
    res.writeHead(200, {
      ...corsHeaders,
      'content-type': 'application/json; charset=utf-8',
    });
    res.end(JSON.stringify(payload, null, 2));
  } catch (error) {
    res.writeHead(500, {
      ...corsHeaders,
      'content-type': 'application/json; charset=utf-8',
    });
    res.end(
      JSON.stringify({
        error: 'content_seed_load_failed',
        detail: error instanceof Error ? error.message : 'unknown_error',
      })
    );
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(
    JSON.stringify(
      {
        service: 'mock-content-api',
        url: `http://127.0.0.1:${port}/api/content-snapshot`,
        health: `http://127.0.0.1:${port}/health`,
      },
      null,
      2
    )
  );
});
