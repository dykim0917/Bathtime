import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const seedPath = process.argv[2] ? path.resolve(repoRoot, process.argv[2]) : '';

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const env = {};
  for (const line of readFileSync(filePath, 'utf8').split(/\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
  return env;
}

function readEnv() {
  return {
    ...parseEnvFile(path.join(repoRoot, '.env.local')),
    ...parseEnvFile(path.join(repoRoot, 'apps/web/.env.local')),
    ...parseEnvFile(path.join(repoRoot, 'apps/admin/.env.local')),
    ...process.env,
  };
}

function readSeed(filePath) {
  if (!filePath) throw new Error('Usage: node scripts/apply_onsen_db_seed_json.mjs <seed-json-path>');
  if (!existsSync(filePath)) throw new Error(`Seed JSON not found: ${filePath}`);
  const parsed = JSON.parse(readFileSync(filePath, 'utf8'));
  const accommodations = Array.isArray(parsed.accommodations) ? parsed.accommodations : [];
  const verdicts = Array.isArray(parsed.verdicts) ? parsed.verdicts : [];
  if (accommodations.length === 0 && verdicts.length === 0) throw new Error('Seed JSON has no accommodations or verdicts.');
  return { accommodations, verdicts };
}

function dbConfig() {
  const env = readEnv();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL;
  const restUrl = (env.CONTENT_DB_REST_URL || (supabaseUrl ? `${supabaseUrl}/rest/v1` : '')).replace(/\/+$/, '');
  const serviceKey = env.CONTENT_DB_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!restUrl || !serviceKey) throw new Error('Missing CONTENT_DB_REST_URL/SUPABASE_URL or CONTENT_DB_SERVICE_ROLE_KEY.');
  return { restUrl, serviceKey };
}

async function requestJson(config, table, params = {}) {
  const url = new URL(`${config.restUrl}/${table}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const response = await fetch(url, {
    headers: {
      apikey: config.serviceKey,
      authorization: `Bearer ${config.serviceKey}`,
      accept: 'application/json',
    },
  });
  if (!response.ok) throw new Error(`${table} read failed: ${response.status} ${await response.text()}`);
  return response.json();
}

async function upsertRows(config, table, rows, conflictKey) {
  if (rows.length === 0) return;
  const chunkSize = 100;
  for (let index = 0; index < rows.length; index += chunkSize) {
    const chunk = rows.slice(index, index + chunkSize);
    const url = new URL(`${config.restUrl}/${table}`);
    url.searchParams.set('on_conflict', conflictKey);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: config.serviceKey,
        authorization: `Bearer ${config.serviceKey}`,
        'content-type': 'application/json',
        prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(chunk),
    });
    if (!response.ok) throw new Error(`${table} upsert failed: ${response.status} ${await response.text()}`);
  }
}

async function existingVerdictLevels(config, verdicts) {
  const slugs = verdicts.map((row) => row.target_slug).filter(Boolean);
  if (slugs.length === 0) return new Map();
  const uniqueSlugs = [...new Set(slugs)];
  const rows = await requestJson(config, 'onsen_verdicts', {
    select: 'target_type,target_slug,level',
    target_type: 'eq.accommodation',
    target_slug: `in.(${uniqueSlugs.join(',')})`,
  });
  return new Map(rows.map((row) => [`${row.target_type}:${row.target_slug}`, row.level]));
}

async function main() {
  const config = dbConfig();
  const seed = readSeed(seedPath);
  const levels = await existingVerdictLevels(config, seed.verdicts);
  const verdicts = seed.verdicts.filter((row) => {
    const existingLevel = levels.get(`${row.target_type}:${row.target_slug}`);
    return existingLevel !== 'full' || row.level === 'full';
  });
  const skippedVerdicts = seed.verdicts.length - verdicts.length;

  await upsertRows(config, 'onsen_accommodations', seed.accommodations, 'slug');
  await upsertRows(config, 'onsen_verdicts', verdicts, 'target_type,target_slug');

  console.log(`Upserted accommodations: ${seed.accommodations.length}`);
  console.log(`Upserted verdicts: ${verdicts.length}`);
  console.log(`Skipped lite-over-full verdicts: ${skippedVerdicts}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
