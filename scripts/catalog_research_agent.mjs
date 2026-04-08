import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const rootDir = path.resolve(new URL('..', import.meta.url).pathname);
const seedSourcePath = path.join(rootDir, 'src', 'data', 'catalogResearchSeed.ts');
const outputDir = path.join(rootDir, 'output', 'catalog-candidates');

const DEFAULT_LIMIT = 5;
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36';

function parseArgs(argv) {
  const args = {
    canonicalProductId: undefined,
    ingredientKey: undefined,
    market: 'all',
    limit: DEFAULT_LIMIT,
    query: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];
    if (token === '--canonical-product-id' && next) {
      args.canonicalProductId = next;
      index += 1;
      continue;
    }
    if (token === '--ingredient-key' && next) {
      args.ingredientKey = next;
      index += 1;
      continue;
    }
    if (token === '--market' && next) {
      args.market = next;
      index += 1;
      continue;
    }
    if (token === '--limit' && next) {
      const parsed = Number.parseInt(next, 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        args.limit = parsed;
      }
      index += 1;
      continue;
    }
    if (token === '--query' && next) {
      args.query = next;
      index += 1;
    }
  }

  return args;
}

function sanitizeForFileName(value) {
  return value.replace(/[^a-z0-9_-]+/gi, '_').replace(/^_+|_+$/g, '');
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

function stripTags(value) {
  return decodeHtml(value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
}

function toAbsoluteUrl(url, origin) {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  return new URL(url, origin).toString();
}

function unwrapDuckDuckGoLink(url) {
  if (!url) return undefined;
  const absolute = toAbsoluteUrl(decodeHtml(url), 'https://duckduckgo.com');
  if (!absolute) return undefined;

  const parsed = new URL(absolute);
  const redirected = parsed.searchParams.get('uddg');
  return redirected ? decodeURIComponent(redirected) : absolute;
}

function scoreConfidence(market, title, url) {
  let score = 0.45;
  if (title) score += 0.15;
  if (url?.includes('/vp/products/')) score += 0.2;
  if (market === 'naver_smartstore' && /smartstore|shopping\.naver/.test(url ?? '')) score += 0.2;
  return Math.min(0.95, Number(score.toFixed(2)));
}

async function loadSeedModule() {
  const source = await readFile(seedSourcePath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;

  const module = { exports: {} };
  const context = vm.createContext({
    module,
    exports: module.exports,
    console,
  });

  new vm.Script(transpiled, { filename: 'catalogResearchSeed.transpiled.js' }).runInContext(
    context
  );

  return module.exports;
}

function buildQueriesForSeed(seedProduct) {
  const categoryHints = {
    essential_oil: '에센셜 오일',
    bath_salt: '입욕제',
    bath_item: '샤워 스티머',
    body_wash: '바디워시',
  };

  const hint = categoryHints[seedProduct.category] ?? '';
  return Array.from(
    new Set(
      [
        `${seedProduct.brand} ${seedProduct.nameKo}`.trim(),
        `${seedProduct.nameKo} ${hint}`.trim(),
        seedProduct.nameKo,
      ].filter(Boolean)
    )
  );
}

function buildTargets(seedModule, args) {
  const seeds = seedModule.CANONICAL_PRODUCT_SEED_V1;

  if (args.query) {
    return [
      {
        id: `adhoc_${sanitizeForFileName(args.query)}`,
        canonicalProductId: undefined,
        ingredientKey: args.ingredientKey ?? 'unknown',
        nameKo: args.query,
        category: 'bath_item',
        marketQueries: {
          coupang: args.market === 'naver_smartstore' ? [] : [args.query],
          naver_smartstore: args.market === 'coupang' ? [] : [args.query],
        },
      },
    ];
  }

  return seeds
    .filter((item) => !args.canonicalProductId || item.id === args.canonicalProductId)
    .filter((item) => !args.ingredientKey || item.ingredientKey === args.ingredientKey)
    .map((item) => {
      const queries = buildQueriesForSeed(item);
      return {
        id: item.id,
        canonicalProductId: item.id,
        ingredientKey: item.ingredientKey,
        nameKo: item.nameKo,
        category: item.category,
        marketQueries: {
          coupang: args.market === 'naver_smartstore' ? [] : queries,
          naver_smartstore: args.market === 'coupang' ? [] : queries,
        },
      };
    });
}

async function fetchHtml(
  url,
  headers = {
    'user-agent': USER_AGENT,
    'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
  }
) {
  const response = await fetch(url, headers ? { headers } : undefined);

  return {
    ok: response.ok,
    status: response.status,
    html: await response.text(),
  };
}

function parseCoupangCandidates(html, query, limit) {
  const candidates = [];
  const seenUrls = new Set();
  const productPattern =
    /<a[^>]+href="([^"]*\/vp\/products\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;

  for (const match of html.matchAll(productPattern)) {
    const sourceUrl = toAbsoluteUrl(decodeHtml(match[1]), 'https://www.coupang.com');
    if (!sourceUrl || seenUrls.has(sourceUrl)) continue;

    const title = stripTags(match[2]);
    if (!title || title.length < 4) continue;

    seenUrls.add(sourceUrl);
    candidates.push({
      market: 'coupang',
      query,
      sourceUrl,
      titleSnapshot: title,
      availability: 'unknown',
      verifiedAt: new Date().toISOString().slice(0, 10),
      sourceConfidence: scoreConfidence('coupang', title, sourceUrl),
      notes: 'search_result_snapshot',
    });

    if (candidates.length >= limit) break;
  }

  return candidates;
}

function parseNaverCandidates(html, query, limit) {
  const candidates = [];
  const seenUrls = new Set();
  const shoppingLinks = html.matchAll(
    /"itemUrl":"([^"]+)"[^}]*"productTitle":"([^"]+)"/g
  );

  for (const match of shoppingLinks) {
    const sourceUrl = decodeURIComponent(match[1].replace(/\\u002F/g, '/'));
    if (!sourceUrl || seenUrls.has(sourceUrl)) continue;

    const title = decodeHtml(match[2].replace(/\\u003C.*?\\u003E/g, ''));
    seenUrls.add(sourceUrl);
    candidates.push({
      market: 'naver_smartstore',
      query,
      sourceUrl,
      titleSnapshot: title,
      availability: 'unknown',
      verifiedAt: new Date().toISOString().slice(0, 10),
      sourceConfidence: scoreConfidence('naver_smartstore', title, sourceUrl),
      notes: 'search_result_snapshot',
    });

    if (candidates.length >= limit) break;
  }

  return candidates;
}

function parseDuckDuckGoCandidates(html, query, limit, market) {
  const candidates = [];
  const seenUrls = new Set();
  const domainPattern =
    market === 'coupang' ? /coupang\.com\/vp\/products\// : /smartstore\.naver\.com\//;
  const resultPattern = /result__a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;

  for (const match of html.matchAll(resultPattern)) {
    const sourceUrl = unwrapDuckDuckGoLink(match[1]);
    if (!sourceUrl || seenUrls.has(sourceUrl) || !domainPattern.test(sourceUrl)) continue;

    const title = stripTags(match[2]);
    if (!title || title.length < 4) continue;

    seenUrls.add(sourceUrl);
    candidates.push({
      market,
      query,
      sourceUrl,
      titleSnapshot: title.replace(/\s+\|\s+쿠팡$/, ''),
      availability: 'unknown',
      verifiedAt: new Date().toISOString().slice(0, 10),
      sourceConfidence: scoreConfidence(market, title, sourceUrl),
      notes: 'duckduckgo_site_search_snapshot',
    });

    if (candidates.length >= limit) break;
  }

  return candidates;
}

async function searchViaDuckDuckGo(market, query, limit) {
  const domain =
    market === 'coupang' ? 'coupang.com/vp/products' : 'smartstore.naver.com';
  const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(`site:${domain} ${query}`)}`;
  const { ok, status, html } = await fetchHtml(ddgUrl, null);
  if (!ok) {
    return {
      market,
      query,
      searchUrl: ddgUrl,
      httpStatus: status,
      candidates: [],
      error: `duckduckgo_search_failed_${status}`,
    };
  }

  const candidates = parseDuckDuckGoCandidates(html, query, limit, market);
  return {
    market,
    query,
    searchUrl: ddgUrl,
    httpStatus: status,
    candidates,
    error: candidates.length === 0 ? 'duckduckgo_no_candidates_parsed' : undefined,
  };
}

async function searchMarket(market, query, limit) {
  const searchUrl =
    market === 'coupang'
      ? `https://www.coupang.com/np/search?q=${encodeURIComponent(query)}`
      : `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(query)}`;

  const { ok, status, html } = await fetchHtml(searchUrl);
  if (!ok) {
    const fallback = await searchViaDuckDuckGo(market, query, limit);
    return {
      market,
      query,
      searchUrl,
      httpStatus: status,
      candidates: fallback.candidates,
      error: fallback.error ?? `search_request_failed_${status}`,
      fallback,
    };
  }

  let candidates =
    market === 'coupang'
      ? parseCoupangCandidates(html, query, limit)
      : parseNaverCandidates(html, query, limit);

  let fallback;
  if (candidates.length === 0) {
    fallback = await searchViaDuckDuckGo(market, query, limit);
    candidates = fallback.candidates;
  }

  return {
    market,
    query,
    searchUrl,
    httpStatus: status,
    candidates,
    error: candidates.length === 0 ? fallback?.error ?? 'no_candidates_parsed' : undefined,
    fallback,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const seedModule = await loadSeedModule();
  const targets = buildTargets(seedModule, args);

  if (targets.length === 0) {
    throw new Error('No research targets found. Pass --canonical-product-id, --ingredient-key, or --query.');
  }

  const reports = [];
  const generatedAt = new Date().toISOString();

  for (const target of targets) {
    const marketRuns = [];
    for (const [market, queries] of Object.entries(target.marketQueries)) {
      for (const query of queries) {
        const result = await searchMarket(market, query, args.limit);
        marketRuns.push(result);
      }
    }

    const dedupedCandidates = [];
    const seenUrls = new Set();
    for (const run of marketRuns) {
      for (const candidate of run.candidates) {
        if (seenUrls.has(candidate.sourceUrl)) continue;
        seenUrls.add(candidate.sourceUrl);
        dedupedCandidates.push({
          targetId: target.id,
          canonicalProductId: target.canonicalProductId,
          ingredientKey: target.ingredientKey,
          category: target.category,
          ...candidate,
        });
      }
    }

    const payload = {
      generatedAt,
      target: {
        id: target.id,
        canonicalProductId: target.canonicalProductId,
        ingredientKey: target.ingredientKey,
        nameKo: target.nameKo,
        category: target.category,
      },
      runs: marketRuns,
      candidates: dedupedCandidates,
      counts: {
        runs: marketRuns.length,
        candidates: dedupedCandidates.length,
      },
    };

    await mkdir(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, `${sanitizeForFileName(target.id)}.json`);
    await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

    reports.push({
      targetId: target.id,
      outputPath,
      counts: payload.counts,
    });
  }

  console.log(
    JSON.stringify(
      {
        generatedAt,
        targets: reports,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
