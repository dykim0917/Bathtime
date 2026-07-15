import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..');
const sourceFile = process.argv.find((argument) => argument.startsWith('--input='))?.slice('--input='.length)
  ?? 'research/onsen-db-seed/decision-goal-2026-07-13/decision_completeness_matrix_2026-07-13.json';
const expectedTargetCount = Number(
  process.argv.find((argument) => argument.startsWith('--expected-targets='))?.slice('--expected-targets='.length) ?? 30
);
const expectedQuestionCodes = [
  'together_private_eligibility',
  'bath_layout_scope',
  'private_bath_booking_flow',
  'private_bath_terms_limits',
  'day_use_operation',
  'bath_experience_richness',
  'water_operation_method',
];

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  return Object.fromEntries(
    readFileSync(filePath, 'utf8')
      .split(/\n/)
      .map((line) => line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/))
      .filter(Boolean)
      .map((match) => {
        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        return [match[1], value];
      })
  );
}

function readConfig() {
  const env = { ...parseEnvFile(path.join(root, '.env.local')), ...process.env };
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL;
  const restUrl = env.CONTENT_DB_REST_URL || (supabaseUrl ? `${supabaseUrl.replace(/\/+$/, '')}/rest/v1` : '');
  const serviceRoleKey = env.CONTENT_DB_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!restUrl || !serviceRoleKey) throw new Error('Supabase REST URL and service role key are required.');
  return { restUrl: restUrl.replace(/\/+$/, ''), serviceRoleKey };
}

function readRows() {
  const payload = JSON.parse(readFileSync(path.join(root, sourceFile), 'utf8'));
  if (!Array.isArray(payload.matrix)) throw new Error('Decision matrix is missing.');

  const grouped = Map.groupBy(payload.matrix, (row) => `${row.target_type}:${row.slug}`);
  if (grouped.size !== expectedTargetCount) {
    throw new Error(`Expected ${expectedTargetCount} targets, received ${grouped.size}.`);
  }

  for (const [target, rows] of grouped) {
    const codes = new Set(rows.map((row) => row.question_code));
    if (rows.length !== expectedQuestionCodes.length || expectedQuestionCodes.some((code) => !codes.has(code))) {
      throw new Error(`${target} does not have the complete seven-question set.`);
    }
  }

  return payload.matrix.map((row) => ({
    target_type: row.target_type,
    target_slug: row.slug,
    journey: row.journey,
    question_code: row.question_code,
    question_ko: row.question_ko,
    answer_status: row.status,
    applicability: row.applicability,
    answer_ko: row.answer_ko,
    check_what: row.check_what,
    official_source_url: row.official_source_url,
    official_source_checked_at: row.official_source_checked_at,
    target_readiness: row.target_readiness,
    source_file: sourceFile,
    updated_at: new Date().toISOString(),
  }));
}

async function upsertRows(config, rows) {
  for (let index = 0; index < rows.length; index += 100) {
    const response = await fetch(
      `${config.restUrl}/onsen_decision_answers?on_conflict=target_type,target_slug,question_code`,
      {
        method: 'POST',
        headers: {
          apikey: config.serviceRoleKey,
          authorization: `Bearer ${config.serviceRoleKey}`,
          'content-type': 'application/json',
          prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify(rows.slice(index, index + 100)),
      }
    );
    if (!response.ok) throw new Error(`Decision answer upsert failed: ${response.status} ${await response.text()}`);
  }
}

async function verifyRows(config, expectedRows) {
  const response = await fetch(`${config.restUrl}/onsen_decision_answers?select=target_type,target_slug,question_code,answer_status&limit=1000`, {
    headers: {
      apikey: config.serviceRoleKey,
      authorization: `Bearer ${config.serviceRoleKey}`,
    },
  });
  if (!response.ok) throw new Error(`Decision answer verification failed: ${response.status} ${await response.text()}`);
  const expectedTargets = new Set(expectedRows.map((row) => `${row.target_type}:${row.target_slug}`));
  const rows = (await response.json()).filter((row) => expectedTargets.has(`${row.target_type}:${row.target_slug}`));
  const targetCount = new Set(rows.map((row) => `${row.target_type}:${row.target_slug}`)).size;
  return { rowCount: rows.length, targetCount };
}

const rows = readRows();
const targetCount = new Set(rows.map((row) => `${row.target_type}:${row.target_slug}`)).size;
if (!process.argv.includes('--apply')) {
  console.log(JSON.stringify({ mode: 'dry-run', rowCount: rows.length, targetCount }, null, 2));
  process.exit(0);
}

const config = readConfig();
await upsertRows(config, rows);
const verified = await verifyRows(config, rows);
if (verified.rowCount !== rows.length || verified.targetCount !== targetCount) {
  throw new Error(`Verification mismatch: ${JSON.stringify(verified)}`);
}
console.log(JSON.stringify({ mode: 'applied', rowCount: rows.length, targetCount, verified }, null, 2));
