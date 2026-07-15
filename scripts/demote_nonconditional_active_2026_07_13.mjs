#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const date = process.argv.find((argument) => argument.startsWith('--date='))?.slice('--date='.length) ?? '2026-07-13';
const shouldApply = process.argv.includes('--apply');
const outputDir = path.join(repoRoot, 'research', 'onsen-db-seed', `decision-goal-${date}`);
const batchSize = 50;

const targets = [
  { targetType: 'accommodation', table: 'onsen_accommodations' },
  { targetType: 'facility', table: 'onsen_facilities' },
];

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function parseEnv(filePath) {
  if (!existsSync(filePath)) return {};
  return Object.fromEntries(readFileSync(filePath, 'utf8').split(/\r?\n/).flatMap((line) => {
    const match = line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/);
    if (!match) return [];
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    return [[match[1], value]];
  }));
}

function readConfig() {
  const env = { ...parseEnv(path.join(repoRoot, '.env.local')), ...process.env };
  const supabaseUrl = (env.NEXT_PUBLIC_SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
  const restUrl = (env.CONTENT_DB_REST_URL || (supabaseUrl ? `${supabaseUrl}/rest/v1` : '')).replace(/\/+$/, '');
  const apiKey = env.CONTENT_DB_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!restUrl || !apiKey) throw new Error('Supabase REST URL과 API key가 필요합니다.');
  return { restUrl, apiKey };
}

async function request(config, table, query = {}, options = {}) {
  const url = new URL(`${config.restUrl}/${table}`);
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers: {
      apikey: config.apiKey,
      authorization: `Bearer ${config.apiKey}`,
      ...(options.prefer ? { prefer: options.prefer } : {}),
      ...(options.body ? { 'content-type': 'application/json' } : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });
  if (!response.ok) throw new Error(`${table} ${response.status}: ${await response.text()}`);
  if (response.status === 204) return [];
  return response.json();
}

function asInFilter(slugs) {
  return `in.(${slugs.map((slug) => JSON.stringify(slug)).join(',')})`;
}

function asNotInFilter(slugs) {
  return `not.in.(${slugs.map((slug) => JSON.stringify(slug)).join(',')})`;
}

function splitIntoBatches(rows) {
  return Array.from({ length: Math.ceil(rows.length / batchSize) }, (_, index) => rows.slice(index * batchSize, (index + 1) * batchSize));
}

function markdownTable(rows, headers) {
  const line = (values) => `| ${values.map((value) => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', '<br>')).join(' | ')} |`;
  return [line(headers), line(headers.map(() => '---')), ...rows.map((row) => line(headers.map((header) => row[header])))].join('\n');
}

function loadConditional30() {
  const research = readJson(`research/onsen-db-seed/decision-goal-${date}/canonical_research_${date}.json`);
  const qa = readJson(`research/onsen-db-seed/decision-goal-${date}/decision_pilot_qa_${date}.json`);
  if (research.final_records?.length !== 30) throw new Error(`conditional 30 원장 수가 일치하지 않습니다: ${research.final_records?.length ?? 0}`);
  if (!qa.passed || qa.findings.some((finding) => finding.severity === 'P0')) throw new Error('conditional 30 원장의 P0 QA를 통과하지 못했습니다.');
  if (research.final_records.some((record) => record.qa?.readiness !== 'conditional')) throw new Error('active로 유지할 원장에 conditional 이외의 상태가 포함되어 있습니다.');
  return research.final_records;
}

async function readActiveRows(config, table) {
  return request(config, table, { select: 'slug,status', status: 'eq.active' });
}

function createAudit(target, conditional30, activeRows) {
  const keepSlugs = conditional30.filter((record) => record.target_type === target.targetType).map((record) => record.slug).sort();
  const activeSlugs = new Set(activeRows.map((row) => row.slug));
  const missingRetained = keepSlugs.filter((slug) => !activeSlugs.has(slug));
  if (missingRetained.length > 0) {
    throw new Error(`${target.targetType} active 예외 후보가 누락되었습니다: ${missingRetained.join(', ')}`);
  }
  const retained = activeRows.filter((row) => keepSlugs.includes(row.slug)).sort((left, right) => left.slug.localeCompare(right.slug));
  const demote = activeRows.filter((row) => !keepSlugs.includes(row.slug)).sort((left, right) => left.slug.localeCompare(right.slug));
  return { ...target, keepSlugs, retained, demote, activeBefore: activeRows.length };
}

function sqlLiteral(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function buildSql(audits) {
  const lines = [
    '-- Generated by scripts/demote_nonconditional_active_2026_07_13.mjs',
    '-- Keep exactly the QA-passed conditional 30 records active; change every other active row to draft.',
    'BEGIN;',
  ];
  for (const audit of audits) {
    const retained = audit.keepSlugs.map(sqlLiteral).join(', ');
    lines.push(
      'DO $$',
      'BEGIN',
      `  IF (SELECT count(*) FROM public.${audit.table} WHERE status = 'active' AND slug NOT IN (${retained})) <> ${audit.demote.length} THEN`,
      `    RAISE EXCEPTION '${audit.table} active-to-draft 대상 수가 dry-run과 다릅니다.';`,
      '  END IF;',
      'END $$;',
      `UPDATE public.${audit.table} SET status = 'draft' WHERE status = 'active' AND slug NOT IN (${retained});`,
    );
  }
  lines.push('COMMIT;', '');
  return lines.join('\n');
}

function writeArtifacts(audits) {
  mkdirSync(outputDir, { recursive: true });
  const paths = {
    auditJson: path.join(outputDir, `conditional30_active_scope_dry_run_${date}.json`),
    auditMd: path.join(outputDir, `conditional30_active_scope_dry_run_${date}.md`),
    sql: path.join(outputDir, `conditional30_active_scope_${date}.upsert.sql`),
  };
  const summary = audits.map((audit) => ({
    target_type: audit.targetType,
    table: audit.table,
    active_before: audit.activeBefore,
    retained_active: audit.retained.length,
    demote_to_draft: audit.demote.length,
  }));
  const payload = {
    generated_at: date,
    policy: 'QA를 통과한 conditional 30곳만 active로 유지하고, 나머지 기존 active 행만 draft로 변경합니다.',
    summary,
    retained_active: Object.fromEntries(audits.map((audit) => [audit.targetType, audit.retained.map((row) => row.slug)])),
    demote_to_draft: Object.fromEntries(audits.map((audit) => [audit.targetType, audit.demote.map((row) => row.slug)])),
  };
  writeFileSync(paths.auditJson, `${JSON.stringify(payload, null, 2)}\n`);
  writeFileSync(paths.auditMd, `# Conditional 30 Active 범위 전환 Dry-run\n\n- 기준일: ${date}\n- 유지: 결정 완성도 QA를 통과한 conditional 30곳만 \`active\`\n- 변경: 현재 \`active\`인 나머지 행만 \`draft\`\n- 삭제·후기 원장·온천수 방식·공식 사실은 변경하지 않습니다.\n\n${markdownTable(summary, ['target_type', 'table', 'active_before', 'retained_active', 'demote_to_draft'])}\n`);
  writeFileSync(paths.sql, buildSql(audits));
  return paths;
}

async function patchToDraft(config, audit) {
  const updated = await request(config, audit.table, {
    select: 'slug,status',
    status: 'eq.active',
    slug: asNotInFilter(audit.keepSlugs),
  }, {
    method: 'PATCH',
    prefer: 'return=representation',
    body: { status: 'draft' },
  });
  const updatedSlugs = new Set(updated.map((row) => row.slug));
  const expectedSlugs = audit.demote.map((row) => row.slug);
  const missing = expectedSlugs.filter((slug) => !updatedSlugs.has(slug));
  const unexpected = updated.filter((row) => !expectedSlugs.includes(row.slug));
  if (missing.length > 0 || unexpected.length > 0 || updated.some((row) => row.status !== 'draft')) {
    throw new Error(`${audit.table} draft 전환 검증 실패: ${[...missing, ...unexpected.map((row) => row.slug)].join(', ')}`);
  }
  return updated.length;
}

async function verifyAfterApply(config, audit) {
  const [activeRows, retainedRows, demotedRows] = await Promise.all([
    readActiveRows(config, audit.table),
    Promise.all(splitIntoBatches(audit.retained).map((batch) => request(config, audit.table, { select: 'slug,status', slug: asInFilter(batch.map((row) => row.slug)) }))).then((batches) => batches.flat()),
    Promise.all(splitIntoBatches(audit.demote).map((batch) => request(config, audit.table, { select: 'slug,status', slug: asInFilter(batch.map((row) => row.slug)) }))).then((batches) => batches.flat()),
  ]);
  const unexpectedActive = activeRows.filter((row) => !audit.keepSlugs.includes(row.slug));
  if (activeRows.length !== audit.keepSlugs.length || unexpectedActive.length > 0 || retainedRows.some((row) => row.status !== 'active') || demotedRows.some((row) => row.status !== 'draft')) {
    throw new Error(`${audit.table} 적용 후 active/draft 상태 검증에 실패했습니다.`);
  }
  return {
    target_type: audit.targetType,
    active_after: activeRows.length,
    retained_active_after: retainedRows.length,
    demoted_draft_after: demotedRows.length,
  };
}

async function main() {
  const conditional30 = loadConditional30();
  const config = readConfig();
  const audits = await Promise.all(targets.map(async (target) => createAudit(target, conditional30, await readActiveRows(config, target.table))));
  const paths = writeArtifacts(audits);
  let verification = null;
  if (shouldApply) {
    const applied = [];
    for (const audit of audits) applied.push({ target_type: audit.targetType, changed_to_draft: await patchToDraft(config, audit) });
    verification = await Promise.all(audits.map((audit) => verifyAfterApply(config, audit)));
    const reportPath = path.join(outputDir, `conditional30_active_scope_load_report_${date}.md`);
    writeFileSync(reportPath, `# Conditional 30 Active 범위 전환 DB 적재 리포트\n\n- 적재일: ${date}\n- 조건부 30곳만 \`active\`로 유지했습니다.\n- 나머지 기존 \`active\` 행만 \`draft\`로 변경했습니다.\n- 삭제·후기 원장·온천수 방식·공식 사실은 변경하지 않았습니다.\n\n## 변경 수\n\n${markdownTable(applied, ['target_type', 'changed_to_draft'])}\n\n## 적재 후 검증\n\n${markdownTable(verification, ['target_type', 'active_after', 'retained_active_after', 'demoted_draft_after'])}\n`);
    paths.loadReport = reportPath;
  }
  console.log(JSON.stringify({
    conditional_active_targets: conditional30.length,
    dry_run: audits.map((audit) => ({ target_type: audit.targetType, active_before: audit.activeBefore, retained_active: audit.retained.length, demote_to_draft: audit.demote.length })),
    verification,
    outputs: Object.fromEntries(Object.entries(paths).map(([key, value]) => [key, path.relative(repoRoot, value)])),
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exit(1);
});
