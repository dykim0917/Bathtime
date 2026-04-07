import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const rootDir = path.resolve(new URL('..', import.meta.url).pathname);
const seedSourcePath = path.join(rootDir, 'src', 'data', 'catalogResearchSeed.ts');
const outputDir = path.join(rootDir, 'output');
const sqlOutputPath = path.join(outputDir, 'catalog-research-seed.v1.postgres.upserts.sql');

function escapeSqlString(value) {
  return String(value).replace(/'/g, "''");
}

function toSqlString(value) {
  return `'${escapeSqlString(value)}'`;
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

function upsertCanonicalProduct(item) {
  return `INSERT INTO canonical_product (
  id, ingredient_key, name_ko, brand, category, mechanism, price_tier, environments,
  summary, editorial_eyebrow, editorial_footer_hint, status, last_verified_at
) VALUES (
  ${toSqlString(item.id)},
  ${toSqlString(item.ingredientKey)},
  ${toSqlString(item.nameKo)},
  ${toSqlString(item.brand)},
  ${toSqlString(item.category)},
  ${toSqlString(item.mechanism)},
  ${toSqlString(item.priceTier)},
  ${toSqlString(JSON.stringify(item.environments))}::jsonb,
  ${toSqlString(item.summary)},
  ${toSqlString(item.editorialEyebrow)},
  ${toSqlString(item.editorialFooterHint)},
  ${toSqlString(item.status)},
  ${toSqlString(item.lastVerifiedAt)}
)
ON CONFLICT (id) DO UPDATE SET
  ingredient_key = EXCLUDED.ingredient_key,
  name_ko = EXCLUDED.name_ko,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  mechanism = EXCLUDED.mechanism,
  price_tier = EXCLUDED.price_tier,
  environments = EXCLUDED.environments,
  summary = EXCLUDED.summary,
  editorial_eyebrow = EXCLUDED.editorial_eyebrow,
  editorial_footer_hint = EXCLUDED.editorial_footer_hint,
  status = EXCLUDED.status,
  last_verified_at = EXCLUDED.last_verified_at,
  updated_at = NOW();`;
}

function nullableSql(value) {
  return value === undefined || value === null ? 'NULL' : toSqlString(value);
}

function nullableNumber(value) {
  return value === undefined || value === null ? 'NULL' : String(value);
}

function upsertMarketListing(item) {
  return `INSERT INTO product_market_listing (
  id, canonical_product_id, market, source_url, title_snapshot, seller_snapshot,
  price_snapshot_krw, availability, verified_at, source_confidence, notes
) VALUES (
  ${toSqlString(item.id)},
  ${toSqlString(item.canonicalProductId)},
  ${toSqlString(item.market)},
  ${toSqlString(item.sourceUrl)},
  ${toSqlString(item.titleSnapshot)},
  ${nullableSql(item.sellerSnapshot)},
  ${nullableNumber(item.priceSnapshotKrw)},
  ${toSqlString(item.availability)},
  ${toSqlString(item.verifiedAt)},
  ${String(item.sourceConfidence)},
  ${nullableSql(item.notes)}
)
ON CONFLICT (id) DO UPDATE SET
  canonical_product_id = EXCLUDED.canonical_product_id,
  market = EXCLUDED.market,
  source_url = EXCLUDED.source_url,
  title_snapshot = EXCLUDED.title_snapshot,
  seller_snapshot = EXCLUDED.seller_snapshot,
  price_snapshot_krw = EXCLUDED.price_snapshot_krw,
  availability = EXCLUDED.availability,
  verified_at = EXCLUDED.verified_at,
  source_confidence = EXCLUDED.source_confidence,
  notes = EXCLUDED.notes,
  updated_at = NOW();`;
}

function upsertMatchRule(item) {
  return `INSERT INTO product_match_rule (
  id, canonical_product_id, ingredient_keys, allowed_environments, mode_bias,
  priority_weight, is_sommelier_pick_candidate, status
) VALUES (
  ${toSqlString(item.id)},
  ${toSqlString(item.canonicalProductId)},
  ${toSqlString(JSON.stringify(item.ingredientKeys))}::jsonb,
  ${toSqlString(JSON.stringify(item.allowedEnvironments))}::jsonb,
  ${item.modeBias ? `${toSqlString(JSON.stringify(item.modeBias))}::jsonb` : 'NULL'},
  ${String(item.priorityWeight)},
  ${item.isSommelierPickCandidate ? 'TRUE' : 'FALSE'},
  ${toSqlString(item.status)}
)
ON CONFLICT (id) DO UPDATE SET
  canonical_product_id = EXCLUDED.canonical_product_id,
  ingredient_keys = EXCLUDED.ingredient_keys,
  allowed_environments = EXCLUDED.allowed_environments,
  mode_bias = EXCLUDED.mode_bias,
  priority_weight = EXCLUDED.priority_weight,
  is_sommelier_pick_candidate = EXCLUDED.is_sommelier_pick_candidate,
  status = EXCLUDED.status,
  updated_at = NOW();`;
}

async function main() {
  const seedModule = await loadSeedModule();
  const canonicalProducts = seedModule.CANONICAL_PRODUCT_SEED_V1;
  const marketListings = seedModule.PRODUCT_MARKET_LISTING_SEED_V1;
  const matchRules = seedModule.PRODUCT_MATCH_RULE_SEED_V1;
  const snapshotDate = seedModule.PRODUCT_RESEARCH_SNAPSHOT_DATE;

  const lines = [
    '-- Generated by scripts/export_catalog_research_seed_postgres.mjs',
    `-- Snapshot date: ${snapshotDate}`,
    'BEGIN;',
    ...canonicalProducts.map(upsertCanonicalProduct),
    ...marketListings.map(upsertMarketListing),
    ...matchRules.map(upsertMatchRule),
    'COMMIT;',
    '',
  ];

  await mkdir(outputDir, { recursive: true });
  await writeFile(sqlOutputPath, lines.join('\n'), 'utf8');

  console.log(
    JSON.stringify(
      {
        snapshotDate,
        sqlOutputPath,
        counts: {
          canonicalProducts: canonicalProducts.length,
          marketListings: marketListings.length,
          matchRules: matchRules.length,
        },
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
