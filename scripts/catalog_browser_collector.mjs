import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import vm from 'node:vm';
import ts from 'typescript';
import { chromium } from 'playwright';

const rootDir = path.resolve(new URL('..', import.meta.url).pathname);
const seedSourcePath = path.join(rootDir, 'src', 'data', 'catalogResearchSeed.ts');
const outputDir = path.join(rootDir, 'output', 'catalog-candidates');

const DEFAULT_LIMIT = 5;

function parseArgs(argv) {
  const args = {
    canonicalProductId: undefined,
    ingredientKey: undefined,
    market: 'all',
    limit: DEFAULT_LIMIT,
    query: undefined,
    headed: false,
    manual: false,
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
      continue;
    }
    if (token === '--headed') {
      args.headed = true;
    }
    if (token === '--manual') {
      args.manual = true;
      args.headed = true;
    }
  }

  return args;
}

function sanitizeForFileName(value) {
  return value.replace(/[^a-z0-9_-]+/gi, '_').replace(/^_+|_+$/g, '');
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
  const queries = [
    `${seedProduct.brand} ${seedProduct.nameKo}`.trim(),
    seedProduct.nameKo,
    seedProduct.ingredientKey.replace(/_/g, ' '),
  ];

  return Array.from(new Set(queries.filter(Boolean)));
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

function scoreConfidence(market, title, url) {
  let score = 0.55;
  if (title) score += 0.15;
  if (market === 'coupang' && url?.includes('/vp/products/')) score += 0.15;
  if (market === 'naver_smartstore' && /smartstore\.naver\.com/.test(url ?? '')) score += 0.15;
  return Math.min(0.96, Number(score.toFixed(2)));
}

async function settlePage(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1200);
}

async function waitForManualConfirmation(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    await rl.question(`${message}\n계속하려면 Enter를 눌러주세요.`);
  } finally {
    rl.close();
  }
}

async function extractCoupangResults(page, query, limit) {
  return page.evaluate(
    ({ query, limit }) => {
      const anchors = Array.from(document.querySelectorAll('a[href*="/vp/products/"]'));
      const seen = new Set();
      const rows = [];

      for (const anchor of anchors) {
        const href = anchor.href;
        if (!href || seen.has(href)) continue;

        const titleSource =
          anchor.querySelector('[class*="name"], [class*="title"]')?.textContent ??
          anchor.textContent ??
          '';
        const title = titleSource.replace(/\s+/g, ' ').trim();
        if (!title) continue;

        const parentText = anchor.parentElement?.textContent ?? anchor.textContent ?? '';
        const priceMatch = parentText.replace(/,/g, '').match(/(\d{2,7})\s*원/);

        rows.push({
          market: 'coupang',
          query,
          sourceUrl: href,
          titleSnapshot: title,
          priceSnapshotKrw: priceMatch ? Number(priceMatch[1]) : undefined,
        });
        seen.add(href);

        if (rows.length >= limit) break;
      }

      return rows;
    },
    { query, limit }
  );
}

async function extractNaverResults(page, query, limit) {
  return page.evaluate(
    ({ query, limit }) => {
      const anchors = Array.from(
        document.querySelectorAll('a[href*="smartstore.naver.com"], a[href*="shopping.naver.com"]')
      );
      const seen = new Set();
      const rows = [];

      for (const anchor of anchors) {
        const href = anchor.href;
        if (!href || seen.has(href)) continue;

        const title = (anchor.textContent ?? '').replace(/\s+/g, ' ').trim();
        if (!title || title.length < 4) continue;

        const parentText = anchor.parentElement?.textContent ?? anchor.textContent ?? '';
        const priceMatch = parentText.replace(/,/g, '').match(/(\d{2,8})\s*원/);

        rows.push({
          market: 'naver_smartstore',
          query,
          sourceUrl: href,
          titleSnapshot: title,
          priceSnapshotKrw: priceMatch ? Number(priceMatch[1]) : undefined,
        });
        seen.add(href);

        if (rows.length >= limit) break;
      }

      return rows;
    },
    { query, limit }
  );
}

async function extractDuckDuckGoFallback(page, market, query, limit) {
  const domain =
    market === 'coupang' ? 'coupang.com/vp/products' : 'smartstore.naver.com';
  await page.goto(`https://duckduckgo.com/html/?q=${encodeURIComponent(`site:${domain} ${query}`)}`, {
    waitUntil: 'domcontentloaded',
  });
  await settlePage(page);

  return page.evaluate(
    ({ market, query, limit }) => {
      const targetPattern =
        market === 'coupang' ? /coupang\.com\/vp\/products\// : /smartstore\.naver\.com\//;
      const anchors = Array.from(document.querySelectorAll('a[href]'));
      const seen = new Set();
      const rows = [];

      const unwrap = (href) => {
        try {
          const url = new URL(href, window.location.origin);
          const redirected = url.searchParams.get('uddg');
          return redirected ? decodeURIComponent(redirected) : url.toString();
        } catch {
          return href;
        }
      };

      for (const anchor of anchors) {
        const href = unwrap(anchor.getAttribute('href'));
        if (!href || seen.has(href) || !targetPattern.test(href)) continue;

        const title = (anchor.textContent ?? '').replace(/\s+/g, ' ').trim();
        if (!title || title.length < 4) continue;

        rows.push({
          market,
          query,
          sourceUrl: href,
          titleSnapshot: title,
        });
        seen.add(href);

        if (rows.length >= limit) break;
      }

      return rows;
    },
    { market, query, limit }
  );
}

async function searchMarket(page, market, query, limit, manual) {
  const searchUrl =
    market === 'coupang'
      ? `https://www.coupang.com/np/search?q=${encodeURIComponent(query)}`
      : `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(query)}`;

  let browserSearchOk = true;
  let directCandidates = [];
  let note;

  try {
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
    await settlePage(page);

    if (manual) {
      await waitForManualConfirmation(
        `[catalog browser collector] ${market} 검색 페이지를 열었습니다: ${query}`
      );
      await settlePage(page);
    }

    const pageText = await page.textContent('body');
    if (/access denied|권한|차단/i.test(pageText ?? '')) {
      browserSearchOk = false;
      note = 'direct_market_search_blocked';
    } else {
      directCandidates =
        market === 'coupang'
          ? await extractCoupangResults(page, query, limit)
          : await extractNaverResults(page, query, limit);
    }
  } catch (error) {
    browserSearchOk = false;
    note = error instanceof Error ? error.message : 'direct_market_search_failed';
  }

  let fallbackCandidates = [];
  if (!browserSearchOk || directCandidates.length === 0) {
    fallbackCandidates = await extractDuckDuckGoFallback(page, market, query, limit);
    if (manual && fallbackCandidates.length === 0) {
      await waitForManualConfirmation(
        `[catalog browser collector] fallback 검색 결과를 확인하거나 직접 상품 페이지를 찾아주세요: ${query}`
      );
      fallbackCandidates =
        market === 'coupang'
          ? await extractCoupangResults(page, query, limit)
          : await extractNaverResults(page, query, limit);
    }
    if (fallbackCandidates.length > 0 && !note) {
      note = 'used_duckduckgo_fallback';
    }
  }

  const merged = [...directCandidates, ...fallbackCandidates]
    .filter((candidate, index, list) =>
      list.findIndex((item) => item.sourceUrl === candidate.sourceUrl) === index
    )
    .slice(0, limit)
    .map((candidate) => ({
      ...candidate,
      availability: 'unknown',
      verifiedAt: new Date().toISOString().slice(0, 10),
      sourceConfidence: scoreConfidence(market, candidate.titleSnapshot, candidate.sourceUrl),
      notes: note,
    }));

  return {
    market,
    query,
    searchUrl,
    candidates: merged,
    error: merged.length === 0 ? note ?? 'no_candidates_found' : undefined,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const seedModule = await loadSeedModule();
  const targets = buildTargets(seedModule, args);

  if (targets.length === 0) {
    throw new Error('No browser collection targets found. Pass --canonical-product-id, --ingredient-key, or --query.');
  }

  const browser = await chromium.launch({
    headless: !args.headed,
  });
  const context = await browser.newContext({
    locale: 'ko-KR',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 1024 },
  });
  const page = await context.newPage();

  const reports = [];
  const generatedAt = new Date().toISOString();

  try {
    for (const target of targets) {
      const runs = [];

      for (const [market, queries] of Object.entries(target.marketQueries)) {
        for (const query of queries) {
          const result = await searchMarket(page, market, query, args.limit, args.manual);
          runs.push(result);
        }
      }

      const candidates = runs
        .flatMap((run) => run.candidates)
        .filter(
          (candidate, index, list) =>
            list.findIndex((item) => item.sourceUrl === candidate.sourceUrl) === index
        )
        .slice(0, args.limit)
        .map((candidate) => ({
          targetId: target.id,
          canonicalProductId: target.canonicalProductId,
          ingredientKey: target.ingredientKey,
          category: target.category,
          ...candidate,
        }));

      const payload = {
        generatedAt,
        target: {
          id: target.id,
          canonicalProductId: target.canonicalProductId,
          ingredientKey: target.ingredientKey,
          nameKo: target.nameKo,
          category: target.category,
        },
        runs,
        candidates,
        counts: {
          runs: runs.length,
          candidates: candidates.length,
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
  } finally {
    await context.close();
    await browser.close();
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
