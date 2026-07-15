import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { mergeEditorialCardSummary, validateEditorialCardSummary } from './lib/onsen_card_summary_contract.mjs';

const repoRoot = path.resolve(import.meta.dirname, '..');

function parseArgs(argv) {
  const args = { apply: false, input: '' };
  for (const value of argv) {
    if (value === '--apply') args.apply = true;
    else if (value.startsWith('--input=')) args.input = value.slice('--input='.length);
  }
  if (!args.input) throw new Error('--input=<card-summary-seed.json>이 필요합니다.');
  return args;
}

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  return Object.fromEntries(
    readFileSync(filePath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/))
      .filter(Boolean)
      .map((match) => [match[1], match[2].trim().replace(/^(?:"(.*)"|'(.*)')$/, '$1$2')])
  );
}

function readConfig() {
  const env = { ...parseEnvFile(path.join(repoRoot, '.env.local')), ...process.env };
  const supabaseUrl = (env.NEXT_PUBLIC_SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
  const restUrl = env.CONTENT_DB_REST_URL || (supabaseUrl ? `${supabaseUrl}/rest/v1` : '');
  const apiKey = env.CONTENT_DB_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!restUrl || !apiKey) throw new Error('Supabase REST URL 또는 service role key가 없습니다.');
  return { restUrl: restUrl.replace(/\/+$/, ''), apiKey };
}

async function readActiveRows(config, slugs) {
  const url = new URL(`${config.restUrl}/onsen_accommodations`);
  url.searchParams.set('select', 'slug,status,evidence_counts');
  url.searchParams.set('slug', `in.(${slugs.join(',')})`);
  const response = await fetch(url, {
    headers: { apikey: config.apiKey, authorization: `Bearer ${config.apiKey}` },
  });
  if (!response.ok) throw new Error(`숙소 조회 실패: ${response.status} ${await response.text()}`);
  return response.json();
}

async function applyRow(config, record, current) {
  const nextCounts = mergeEditorialCardSummary(current.evidence_counts, record.editorialCardSummary);
  const url = new URL(`${config.restUrl}/onsen_accommodations`);
  url.searchParams.set('slug', `eq.${record.slug}`);
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      apikey: config.apiKey,
      authorization: `Bearer ${config.apiKey}`,
      'content-type': 'application/json',
      prefer: 'return=representation',
    },
    body: JSON.stringify({ evidence_counts: nextCounts }),
  });
  if (!response.ok) throw new Error(`${record.slug} 적재 실패: ${response.status} ${await response.text()}`);
  const rows = await response.json();
  if (rows.length !== 1) throw new Error(`${record.slug}: ${rows.length}개 행이 갱신됐습니다.`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = path.resolve(repoRoot, args.input);
  const payload = JSON.parse(readFileSync(inputPath, 'utf8'));
  const records = Array.isArray(payload.records) ? payload.records : [];
  if (!records.length) throw new Error('입력 파일에 records가 없습니다.');

  const duplicateSlugs = records.map((record) => record.slug).filter((slug, index, slugs) => slugs.indexOf(slug) !== index);
  if (duplicateSlugs.length) throw new Error(`중복 slug: ${[...new Set(duplicateSlugs)].join(', ')}`);

  const config = readConfig();
  const rows = await readActiveRows(config, records.map((record) => record.slug));
  const bySlug = new Map(rows.map((row) => [row.slug, row]));
  const errors = [];

  for (const record of records) {
    const current = bySlug.get(record.slug);
    if (!current || current.status !== 'active') {
      errors.push(`${record.slug}: active 숙소가 아닙니다.`);
      continue;
    }
    errors.push(
      ...validateEditorialCardSummary(record.editorialCardSummary, {
        repoRoot,
        slug: record.slug,
        canonicalCounts: current.evidence_counts ?? {},
      })
    );
  }

  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  if (args.apply) {
    for (const record of records) await applyRow(config, record, bySlug.get(record.slug));
  }

  console.log(`온천 카드 요약 파이프라인 통과: ${records.length}건 (${args.apply ? 'DB 적용' : 'dry-run'}).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
